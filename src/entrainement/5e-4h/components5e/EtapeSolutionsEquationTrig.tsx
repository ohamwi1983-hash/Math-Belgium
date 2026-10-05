import { useState } from "react";
import type { ExerciceEquationTrig } from "../core5e/equationsTrigonometriques.types";
import { ANNONCE_PRECISION_DECIMAL, CONSIGNE_GENERALE_EQUATION_TRIG, TEXTE_AIDE_SOLUTIONS_NIVEAU1, TEXTE_AIDE_SOLUTIONS_NIVEAU2, formatEquationEnonceLatex } from "../ui5e/formatEquationTrig";
import { formatTermesEtatActuelDirecte } from "../ui5e/formatEquationTrigonometrique";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { CercleTrigEquationSketch } from "./CercleTrigEquationSketch";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceEquationTrig;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (textes: string[]) => StatutVerification;
}

/** Bloc "état actuel" — rappelle l'argument u ET les branches x déjà isolées aux 2 écrans
 * précédents ("argument" puis "isolerX"). */
function EtatActuelDirecte({ exercice, phase }: { exercice: ExerciceEquationTrig; phase: "isolerX" | "solutions" }) {
  const termes = formatTermesEtatActuelDirecte(exercice, phase);
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/** Écran 3 (absent si `exercice.aucuneSolution`) — lister les solutions distinctes dans [0;2π[.
 * Add-as-needed, cercle trigonométrique VIDE tant que l'aide 2 n'est pas activée (jamais donner la
 * réponse en avance) — l'aide 2 y place alors le PREMIER point à titre d'exemple seulement. */
export function EtapeSolutionsEquationTrig({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [lignes, setLignes] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const lignesErronee = montrerErreurs && !!diagnostiquer && diagnostiquer(lignes) !== "correct";
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");

  function ajouterLigne() {
    setLignes((arr) => [...arr, ""]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(lignes));
    onValider(lignes);
  }

  const pointsAffiches = niveauAide >= 2 && exercice.solutions.length > 0 ? [exercice.solutions[0]] : [];

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_TRIG}</p>
      <div className="equation-box">
        <Katex expression={formatEquationEnonceLatex(exercice)} block />
      </div>
      <EtatActuelDirecte exercice={exercice} phase="solutions" />
      <p className="prompt-text">
        Liste toutes les solutions distinctes dans [0;2π[ (une valeur par point).
        {exercice.regime === "decimal" && ANNONCE_PRECISION_DECIMAL}
      </p>
      {niveauAide >= 2 && <CercleTrigEquationSketch points={pointsAffiches} regime={exercice.regime} />}
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input type="text" className={`text-input${lignesErronee ? " is-erronee" : ""}`} value={ligne} onChange={(e) => modifierLigne(i, e.target.value)} placeholder="ex : pi/6" />
            {lignes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirerLigne(i)}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}
      <button type="button" className="btn" onClick={ajouterLigne}>
        + Ajouter une solution
      </button>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_SOLUTIONS_NIVEAU1}</p>
          {niveauAide >= 2 && <p>{TEXTE_AIDE_SOLUTIONS_NIVEAU2}</p>}
        </div>
      )}
    </div>
  );
}
