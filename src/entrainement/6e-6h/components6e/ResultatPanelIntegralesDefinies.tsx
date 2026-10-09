import { Katex } from "../components/Katex";
import type { PhaseIntegralesDefinies, ResultatExerciceIntegralesDefinies } from "../moteur6e/typesIntegralesDefinies";
import { phasesPourExercice } from "../moteur6e/typesIntegralesDefinies";
import { LIBELLE_PHASE, calculerTotalPointsIntegralesDefinies, formatReponseAttenduePhaseLatex } from "../ui6e/formatIntegralesDefinies";
import { LigneRecap, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseIntegralesDefinies, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceIntegralesDefinies;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

/** Récapitulatif final — patron plat/coloré standard (`LigneRecap`/`statutRecap`), une ligne PAR
 * ÉCRAN RÉELLEMENT TRAVERSÉ (`phasesPourExercice`, écrans empruntés de calcul de primitive PLUS 1 à
 * 2 écrans propres à 6gen25 selon le scénario). Mirroir exact de
 * `ResultatPanelCalculPrimitives.tsx` (6gen23). */
export function ResultatPanelIntegralesDefinies({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = phasesPourExercice(exercice);
  const { total, maximum } = calculerTotalPointsIntegralesDefinies(resultat);
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
