import { useState } from "react";
import type { ReactNode } from "react";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import type { AideTrig } from "../ui5e/aidesTrigonometrie";
import type { ReponseTangente } from "../moteur5e/verificationTangentesLotC";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { PiedEcranFonctions } from "./PiedEcranFonctions";

/**
 * Écran générique de 5gen28 (lots B et C de l'audit 5e ch. 5) — remplace les cinq écrans historiques
 * (substituer, tangente, racines, coordonnées, tangente en p) et sert aux familles ajoutées (pente
 * donnée, point extérieur, aucune tangente horizontale, dérivée à calculer). Trois dispositions :
 * - `champs` : champs fixes (étiquette KaTeX) ;
 * - `liste` : valeurs ajoutées au besoin (x₁, x₂… ou t₁, t₂…), bouton « Aucune solution » facultatif ;
 * - `points` : points (x ; y) ajoutés au besoin.
 * Frappe jamais bloquée (`normaliserSigneMoins` seul) ; saisie refusée sans tentative (même fonction
 * que le moteur) ; pied commun du 5e (aides à deux niveaux, message ciblé).
 */
export type DispositionTangente =
  | { type: "champs"; champs: { label: string; placeholder?: string; apercu?: boolean }[] }
  | { type: "liste"; variable: "x" | "t"; aucune?: boolean }
  | { type: "points" };

interface Props {
  enTete: ReactNode;
  question: ReactNode;
  disposition: DispositionTangente;
  avecCalculatrice?: boolean;
  aides: AideTrig[];
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  tentativesUtilisees: number;
  tentativesMax: number;
  refus: (r: ReponseTangente) => string | null;
  cible: (r: ReponseTangente) => FragmentConsigne[] | null;
  onValider: (r: ReponseTangente) => void;
  validation?: ValidationEtapeProps | null;
}

const EXEMPLES = ["1,5", "−2,5", "0,5", "−0,5"];

export function EcranTangente(props: Props) {
  const { enTete, question, disposition, aides, niveauAide, niveauAideMax, onActiverAide, tentativesUtilisees, tentativesMax, validation } = props;
  const initiales = disposition.type === "champs" ? disposition.champs.map(() => "") : disposition.type === "points" ? ["", ""] : [""];
  const [valeurs, setValeurs] = useState<string[]>(initiales);
  const [aucune, setAucune] = useState(false);
  const [refus, setRefus] = useState<string | null>(null);
  const [soumise, setSoumise] = useState<ReponseTangente | null>(null);
  const vide = !aucune && (valeurs.length === 0 || valeurs.some((v) => v.trim() === ""));

  function modifier(i: number, v: string) {
    setValeurs((arr) => arr.map((x, j) => (j === i ? normaliserSigneMoins(v) : x)));
    setRefus(null);
  }
  function ajouter() {
    setValeurs((arr) => [...arr, ...(disposition.type === "points" ? ["", ""] : [""])]);
  }
  function retirer(i: number) {
    const pas = disposition.type === "points" ? 2 : 1;
    setValeurs((arr) => arr.filter((_, j) => j < i * pas || j >= (i + 1) * pas));
  }
  function valider() {
    if (vide) return;
    const r: ReponseTangente = { valeurs: aucune ? [] : valeurs, aucune };
    const message = props.refus(r);
    setRefus(message);
    if (message) return;
    setSoumise(r);
    props.onValider(r);
  }

  const clos = !!validation;
  const champ = (i: number, label: string, placeholder: string, apercu = false) => (
    <div key={i}>
      {apercu && <ApercuExpressionLatex texte={valeurs[i]} label={label.includes("\\") ? undefined : label} />}
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={label} />
        </label>
        <input
          type="text"
          className={`text-input${refus && valeurs[i].trim() !== "" ? " is-erronee" : ""}`}
          value={valeurs[i]}
          placeholder={placeholder}
          disabled={clos}
          autoComplete="off"
          onChange={(e) => modifier(i, e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div>
      {enTete}
      <div className="prompt-text">{question}</div>
      {disposition.type === "champs" && disposition.champs.map((c, i) => champ(i, c.label, c.placeholder ?? "", c.apercu))}
      {disposition.type === "liste" && (
        <>
          {disposition.aucune && (
            <div className="options-grid">
              <button type="button" className={`btn${aucune ? " toggle-active" : ""}`} aria-pressed={aucune} disabled={clos} onClick={() => setAucune((x) => !x)}>
                Aucune solution
              </button>
            </div>
          )}
          {!aucune && (
            <>
              {valeurs.map((_, i) => (
                <div key={i} className="field-row">
                  {champ(i, valeurs.length === 1 ? `${disposition.variable}=` : `${disposition.variable}_${i + 1}=`, `ex : ${EXEMPLES[i % EXEMPLES.length]}`)}
                  {valeurs.length > 1 && !clos && (
                    <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirer(i)}>
                      ×
                    </button>
                  )}
                </div>
              ))}
              {!clos && (
                <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouter}>
                  + Ajouter une solution
                </button>
              )}
            </>
          )}
        </>
      )}
      {disposition.type === "points" && (
        <>
          {Array.from({ length: valeurs.length / 2 }, (_, i) => (
            <div key={i} className="tangente-point-groupe">
              <p className="field-label field-label-minuscule tangente-point-label">{valeurs.length === 2 ? "Point :" : `Point ${i + 1} :`}</p>
              <div className="field-row">
                {champ(2 * i, "x", "ex : 1,5")}
                {champ(2 * i + 1, "y", "ex : −0,5")}
                {valeurs.length > 2 && !clos && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirer(i)}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          {!clos && (
            <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouter}>
              + Ajouter un point
            </button>
          )}
        </>
      )}
      {props.avecCalculatrice && <CalculatriceScientifique />}
      <PiedEcranFonctions
        aides={aides}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={vide}
        illisible={refus !== null}
        texteIllisible={refus ?? ""}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumise && tentativesUtilisees > 0 ? props.cible(soumise) : null}
        validation={validation}
      />
    </div>
  );
}
