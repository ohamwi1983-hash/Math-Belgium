import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { RenduFragments } from "../components/RenduFragments";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, FragmentConsigne } from "../ui6e/formatAiresFormesReelles";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  /** Schéma de l'objet (chaîne SVG autonome), affiché sous l'énoncé sur chaque écran. */
  schemaSvg: string;
  consigneEcran: FragmentConsigne[];
  champs: ChampDef[];
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
 * Écran unique de `6gen81` « Aires de formes réelles » : énoncé (+ formules données) → schéma →
 * consigne de l'écran → champs empilés (étiquette au-dessus : lisible à 390 px) → aide → « Valider ».
 * Une saisie illisible (`parse_error`) est signalée SANS être soumise : elle ne consomme aucune
 * tentative. Aucun filtre de frappe (décision de l'utilisateur). `App6gen81.tsx` le rend avec une
 * `key` qui change à chaque écran et à chaque nouvel exercice (champs remis à vide).
 */
export function EtapeAiresFormesReelles({
  consigneGenerale,
  blocDonnees,
  schemaSvg,
  consigneEcran,
  champs,
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
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));
  const [illisible, setIllisible] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0;
  const statuts = montrerErreurs ? diagnostiquer(valeurs) : null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");

  function changer(index: number, valeur: string) {
    setIllisible(false);
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  function valider() {
    if (!toutRempli) return;
    if (diagnostiquer(valeurs).includes("parse_error")) {
      setIllisible(true);
      return;
    }
    onValider(valeurs);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<RenduFragments fragments={consigneGenerale} />}
        blocDonnees={
          blocDonnees.length > 0 ? (
            <div className="equation-box">
              <div className="equation-box-donnees">
                {blocDonnees.map((frag, i) => (
                  <Katex key={i} expression={frag} block />
                ))}
              </div>
            </div>
          ) : null
        }
      />
      <div className="figure-formes-reelles" style={{ textAlign: "center", margin: "12px 0" }} dangerouslySetInnerHTML={{ __html: schemaSvg }} />
      <p className="prompt-text">
        <RenduFragments fragments={consigneEcran} />
      </p>
      <div>
        {champs.map((champ, i) => (
          <div key={i}>
            {champ.type === "fonction" && <ApercuExpressionLatex texte={valeurs[i]} label={champ.label} />}
            <div className="field">
              <label className="field-label field-label-minuscule">{champ.labelLatex ? <Katex expression={champ.labelLatex} /> : champ.label}</label>
              <input
                type="text"
                className={`text-input ${statuts && statuts[i] !== "correct" ? "is-erronee" : ""}`}
                value={valeurs[i]}
                placeholder={champ.placeholder}
                disabled={!!validation}
                onChange={(ev) => changer(i, ev.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
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
          {illisible && (
            <p className="alert-error" role="alert">
              {formatMessageErreur(tentativesUtilisees, tentativesMax, "parse_error")}
            </p>
          )}
          {!illisible && montrerErreurs && (
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
