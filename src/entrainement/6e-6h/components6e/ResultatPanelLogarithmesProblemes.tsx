import { Katex } from "../components/Katex";
import type { PhaseLogarithmesProblemes, ResultatExerciceLogarithmesProblemes } from "../moteur6e/typesLogarithmesProblemes";
import { LIBELLE_PHASE, calculerTotalPointsLogarithmesProblemes, formatReponseAttenduePhaseLatex, phasesPourExercice } from "../ui6e/formatLogarithmesProblemes";
import { LigneRecap, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseLogarithmesProblemes, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceLogarithmesProblemes;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — une `LigneRecap` PAR ÉCRAN RÉELLEMENT TRAVERSÉ (`phasesPourExercice`,
 * variable PAR INSTANCE pour la famille E — jamais une table statique par famille), jamais un score
 * fractionnaire `X/100` comme contenu de ligne — le total chiffré est un COMPLÉMENT séparé
 * (`.recap-final-total`, sous la liste colorée, jamais à sa place).
 */
export function ResultatPanelLogarithmesProblemes({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = phasesPourExercice(exercice);
  const { total, maximum } = calculerTotalPointsLogarithmesProblemes(resultat);
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
