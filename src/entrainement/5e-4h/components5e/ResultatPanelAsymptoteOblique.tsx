import type { PhaseAsymptoteOblique, ResultatExerciceAsymptoteOblique } from "../moteur5e/typesAsymptoteOblique";
import { ordreComplet } from "../moteur5e/typesAsymptoteOblique";
import { LIBELLE_PHASE_ASYMPTOTE_OBLIQUE, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex } from "../ui5e/formatAsymptoteOblique";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceAsymptoteOblique;
  aideParPhase: Partial<Record<PhaseAsymptoteOblique, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — une `LigneRecap` par écran RÉELLEMENT traversé, même patron plat/
 * coloré que `ResultatPanelLimite.tsx` (5gen20). */
export function ResultatPanelAsymptoteOblique({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = ordreComplet(exercice);

  function statutPhase(phase: PhaseAsymptoteOblique) {
    const info = aideParPhase[phase];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <div className="equation-box equation-box-termes">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      {phases.map((phase) => {
        const score = resultat.scores[phase];
        if (score === undefined) return null;
        const statut = statutPhase(phase);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE_ASYMPTOTE_OBLIQUE[phase]} statut={statut}>
            <span className="equation-box-termes">
              {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
                <Katex key={i} expression={frag} />
              ))}
            </span>
          </LigneRecap>
        );
      })}
      <RecapTotalPoints
        ecrans={phases
          .filter((phase) => resultat.scores[phase] !== undefined)
          .map((phase) => {
            const info = aideParPhase[phase];
            return { revele: info?.revele ?? false, niveauAide: info?.niveauAide ?? null };
          })}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
