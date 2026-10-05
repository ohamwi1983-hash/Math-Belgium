import type { PhaseSuiteArithmetique, ResultatExerciceSuiteArithmetique } from "../moteur5e/typesSuiteArithmetique";
import { ordreComplet } from "../moteur5e/typesSuiteArithmetique";
import { LIBELLE_PHASE_SUITE_ARITHMETIQUE, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex } from "../ui5e/formatSuiteArithmetique";
import { Katex } from "../components/Katex";
import { LigneRecap, statutRecap, RecapTotalPoints } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceSuiteArithmetique;
  aideParPhase: Partial<Record<PhaseSuiteArithmetique, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `ResultatPanelDomaineDefinition.tsx`
 * (5gen1) : une `LigneRecap` PAR ÉCRAN RÉELLEMENT TRAVERSÉ (`ordreComplet(resultat.exercice)`, la
 * séquence RÉELLE de cette instance — voir `moteur5e/typesSuiteArithmetique.ts`), contenant la
 * réponse ATTENDUE — jamais un score fractionnaire `X/100`.
 *
 * `ResultatExerciceSuiteArithmetique.scores` (`Partial<Record<Phase,number>>`) ne trace ni `revele`
 * ni `niveauAide` par écran côté Couche B — `aideParPhase` (fourni par `App5gen14.tsx`, capturé au
 * moment précis où chaque écran se ferme, `etat.niveauAide`/`etat.etapeCourante.revelee`) porte
 * cette information à la place, sans toucher `src/moteur5e/`.
 */
export function ResultatPanelSuiteArithmetique({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = ordreComplet(exercice);

  function statutPhase(phase: PhaseSuiteArithmetique) {
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
          <LigneRecap key={phase} label={LIBELLE_PHASE_SUITE_ARITHMETIQUE[phase]} statut={statut}>
            {phase === "coherenceJugement" ? (
              exercice.famille === "coherence" && exercice.coherent ? "Cohérentes" : "Incohérentes"
            ) : (
              <span className="equation-box-termes">
                {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
                  <Katex key={i} expression={frag} />
                ))}
              </span>
            )}
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
