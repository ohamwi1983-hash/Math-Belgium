import { useState } from "react";
import type { ExerciceEquationTrigonometrique, FamilleEquationTrigonometrique } from "../core5e/equationsTrigonometriques.types";
import { CONSIGNE_RECONNAISSANCE, OPTIONS_FAMILLE, formatEnonceEquationTrigonometriqueLatex } from "../ui5e/formatEquationTrigonometrique";
import { CONSIGNE_GENERALE_EQUATION_TRIG } from "../ui5e/formatEquationTrig";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceEquationTrigonometrique;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (choix: FamilleEquationTrigonometrique) => void;
}

/** Écran 0 (commun aux 4 familles) — choix catégoriel à 4 options
 * (`.options-grid-compact` + `.btn.toggle-active`, même convention que le reste de la plateforme)
 * suivi d'un bouton "Valider" persistant — jamais d'auto-soumission au clic. Aucune aide sur cet
 * écran (question de reconnaissance, jamais assistée). */
export function EtapeReconnaissanceEquationTrig({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [choix, setChoix] = useState<FamilleEquationTrigonometrique | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_TRIG}</p>
      <div className="equation-box equation-box-termes">
        {decouperEquationLongueLatex(formatEnonceEquationTrigonometriqueLatex(exercice)).map((morceau, i) => (
          <Katex key={i} expression={morceau} />
        ))}
      </div>
      <p className="prompt-text">{CONSIGNE_RECONNAISSANCE}</p>
      <div className="options-grid-compact">
        {OPTIONS_FAMILLE.map((option) => (
          <button key={option.id} type="button" className={choix === option.id ? "btn toggle-active" : "btn"} onClick={() => setChoix(option.id)}>
            {option.label}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-primary" disabled={choix === null} onClick={() => choix !== null && onValider(choix)}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
