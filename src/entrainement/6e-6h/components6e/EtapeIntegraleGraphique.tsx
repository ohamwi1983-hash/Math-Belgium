import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne, OptionAbscisse } from "../ui6e/formatIntegraleGraphique";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

export type ModeEcranIntegraleGraphique =
  | { type: "champs"; champs: ChampDef[] }
  /** Sélection de plusieurs abscisses (découpe, changements de signe) — une seule tentative. */
  | { type: "abscisses"; options: OptionAbscisse[] };

interface Props {
  consigneGenerale: FragmentConsigne[];
  /** Courbe sur quadrillage (chaîne SVG autonome) — coloriée seulement à la fin (corrigé). */
  figureSvg: string;
  consigneEcran: FragmentConsigne[];
  mode: ModeEcranIntegraleGraphique;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  /** Statut champ par champ : seuls les champs faux sont marqués. */
  diagnostiquer: (valeurs: string[]) => StatutVerification[];
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran unique de `6gen77` (champs libres OU sélection d'abscisses) — même structure que les écrans
 * du chantier : consigne générale → figure → consigne de l'écran → travail → aide → « Valider ».
 * Une saisie illisible (`parse_error`) est signalée SANS être soumise : elle ne consomme aucune
 * tentative. Aucun filtre de frappe, aucun `inputMode` (règle du site). `App6gen77.tsx` le rend
 * avec une `key` qui change à chaque écran ET à chaque nouvel exercice (saisie remise à vide).
 */
export function EtapeIntegraleGraphique({
  consigneGenerale,
  figureSvg,
  consigneEcran,
  mode,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
  validation,
}: Props) {
  const nombreChamps = mode.type === "champs" ? mode.champs.length : 1;
  const [valeurs, setValeurs] = useState<string[]>(() => Array.from({ length: nombreChamps }, () => ""));
  const [selection, setSelection] = useState<number[]>([]);
  const [erreurLecture, setErreurLecture] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0 && !erreurLecture;
  const valeursCourantes = mode.type === "abscisses" ? [[...selection].sort((a, b) => a - b).join(";")] : valeurs;
  const statuts = montrerErreurs ? diagnostiquer(valeursCourantes) : null;
  const toutRempli = mode.type === "abscisses" ? selection.length > 0 : valeurs.every((v) => v.trim() !== "");

  function changer(index: number, valeur: string) {
    setErreurLecture(false);
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  function basculer(x: number) {
    setSelection((prev) => (prev.includes(x) ? prev.filter((v) => v !== x) : [...prev, x]));
  }

  function valider() {
    if (!toutRempli) return;
    if (mode.type === "champs" && diagnostiquer(valeursCourantes).includes("parse_error")) {
      setErreurLecture(true);
      return;
    }
    setErreurLecture(false);
    onValider(valeursCourantes);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={<RenduFragments fragments={consigneGenerale} />} blocDonnees={null} />
      <div className="figure-integrale-graphique" style={{ textAlign: "center", margin: "12px 0" }} dangerouslySetInnerHTML={{ __html: figureSvg }} />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      {mode.type === "champs" ? (
        <div>
          {mode.champs.map((champ, i) => (
            <div key={i}>
              {!validation && <ApercuExpressionLatex texte={valeurs[i]} label={champ.label} />}
              <div className="field">
                <label className="field-label field-label-minuscule">{champ.labelLatex ? <Katex expression={champ.labelLatex} /> : champ.label}</label>
                <input
                  type="text"
                  className={`text-input ${statuts && statuts[i] !== "correct" ? "is-erronee" : ""}`}
                  value={valeurs[i]}
                  placeholder={champ.placeholder}
                  disabled={!!validation}
                  onChange={(e) => changer(i, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="options-grid-compact" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))" }}>
          {mode.options.map((option) => {
            const x = Number(option.valeur);
            const choisi = selection.includes(x);
            return (
              <button
                key={option.valeur}
                type="button"
                aria-pressed={choisi}
                className={`btn ${choisi ? "toggle-active" : ""} ${statuts && statuts[0] !== "correct" && choisi ? "is-erronee" : ""}`}
                disabled={!!validation}
                onClick={() => basculer(x)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
      {!validation && (
        <>
          <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
          <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
            Valider
          </button>
          {erreurLecture && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")} Exemples : 7/2, −3, 2π, 5/2 − π/4.
            </p>
          )}
          {montrerErreurs && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, "not_equivalent")}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
