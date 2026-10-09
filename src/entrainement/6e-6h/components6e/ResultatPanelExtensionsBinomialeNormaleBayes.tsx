import { Katex } from "../components/Katex";
import type { PhaseExtensionsBinomialeNormaleBayes, ResultatExerciceExtensionsBinomialeNormaleBayes } from "../moteur6e/typesExtensionsBinomialeNormaleBayes";
import { phasesPourExercice } from "../moteur6e/typesExtensionsBinomialeNormaleBayes";
import { LIBELLE_PHASE, calculerTotalPointsExtensionsBinomialeNormaleBayes, formatReponseAttenduePhaseLatex } from "../ui6e/formatExtensionsBinomialeNormaleBayes";
import { LigneRecap, statutRecap } from "./LigneRecap";

type AideParPhase = Partial<Record<PhaseExtensionsBinomialeNormaleBayes, { niveauAide: number; revele: boolean }>>;

interface Props {
  resultat: ResultatExerciceExtensionsBinomialeNormaleBayes;
  aideParPhase: AideParPhase;
  onContinuer: () => void;
  dernier: boolean;
}

/** Récapitulatif final — patron plat/coloré standard (`LigneRecap`/`statutRecap`), une ligne PAR
 * ÉCRAN RÉELLEMENT TRAVERSÉ (`phasesPourExercice`) — mirroir `ResultatPanelDenombrementFondamental.tsx`
 * (6gen43)/`ResultatPanelLoiNormale.tsx` (6gen51). */
export function ResultatPanelExtensionsBinomialeNormaleBayes({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = phasesPourExercice(exercice);
  const { total, maximum } = calculerTotalPointsExtensionsBinomialeNormaleBayes(resultat);
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
