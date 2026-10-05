import type { PhaseLectureGraphiqueLimites, ResultatExerciceLectureGraphiqueLimites } from "../moteur5e/typesLectureGraphiqueLimites";
import { ordreComplet } from "../moteur5e/typesLectureGraphiqueLimites";
import { LIBELLE_PHASE_LECTURE_GRAPHIQUE, formatReponseAttenduePhaseLatex } from "../ui5e/formatLectureGraphiqueLimites";
import { Katex } from "../components/Katex";
import { LectureGraphiqueLimitesGraph } from "./LectureGraphiqueLimitesGraph";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceLectureGraphiqueLimites;
  reveleParPhase: Partial<Record<PhaseLectureGraphiqueLimites, boolean>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — une `LigneRecap` par écran RÉELLEMENT traversé (jamais
 * "nommerAsymptotes" si le tirage n'avait aucune asymptote à nommer), même patron plat/coloré que
 * les autres générateurs 5e. Le graphique lui-même, plutôt qu'un bloc KaTeX, sert de rappel visuel
 * de l'exercice. Pas d'aide sur ce générateur : `niveauAide` toujours `null` (pur vert/rouge). */
export function ResultatPanelLectureGraphiqueLimites({ resultat, reveleParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = ordreComplet(exercice);

  function statutPhase(phase: PhaseLectureGraphiqueLimites) {
    return statutRecap(reveleParPhase[phase] ?? false, null);
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <LectureGraphiqueLimitesGraph exercice={exercice} />
      {phases.map((phase) => {
        const score = resultat.scores[phase];
        if (score === undefined) return null;
        const statut = statutPhase(phase);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE_LECTURE_GRAPHIQUE[phase]} statut={statut}>
            <span className="equation-box-termes">
              {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
                <Katex key={i} expression={frag} block={frag.includes("\\lim_{")} />
              ))}
            </span>
          </LigneRecap>
        );
      })}
      <RecapTotalPoints
        ecrans={phases
          .filter((phase) => resultat.scores[phase] !== undefined)
          .map((phase) => ({ revele: reveleParPhase[phase] ?? false, niveauAide: null }))}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
