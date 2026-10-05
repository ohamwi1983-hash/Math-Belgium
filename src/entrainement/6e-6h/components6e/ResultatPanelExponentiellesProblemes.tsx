import { Katex } from "../components/Katex";
import type { PhaseExponentiellesProblemes, ResultatExerciceExponentiellesProblemes } from "../moteur6e/typesExponentiellesProblemes";
import { LIBELLE_PHASE, PHASES_PAR_FAMILLE, calculerTotalPointsExponentiellesProblemes, formatReponseAttenduePhaseLatex } from "../ui6e/formatExponentiellesProblemes";
import { LigneRecap, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseExponentiellesProblemes, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceExponentiellesProblemes;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `ResultatPanelEquationExponentielle.tsx`
 * (6gen9)/`ResultatPanelEtudeFonctionExponentielle.tsx` (6gen11) : une `LigneRecap` PAR ÉCRAN
 * RÉELLEMENT TRAVERSÉ (le nombre varie PAR FAMILLE, voir `PHASES_PAR_FAMILLE`), jamais un score
 * fractionnaire `X/100` comme contenu de ligne — le total chiffré est un COMPLÉMENT séparé
 * (`.recap-final-total`, sous la liste colorée, jamais à sa place).
 */
export function ResultatPanelExponentiellesProblemes({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = PHASES_PAR_FAMILLE[resultat.famille];
  const { total, maximum } = calculerTotalPointsExponentiellesProblemes(resultat);
  return (
    <div className="card resultat-panel">
      <h2>Récapitulatif</h2>
      {phases.map((phase) => {
        const info = aideParPhase[phase];
        const statut = statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE[phase]} statut={statut}>
            <span className="equation-box-termes">
              {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
                <Katex key={i} expression={frag} />
              ))}
            </span>
          </LigneRecap>
        );
      })}
      <div className="recap-final-total">
        <strong>Total</strong> : {Math.round(total)}/{maximum}
      </div>
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
