import type { PhaseLimitesContexte, ResultatExerciceLimitesContexte } from "../moteur5e/typesLimitesContexte";
import { ordreComplet } from "../moteur5e/typesLimitesContexte";
import { estPhaseQCM, formatReponseAttendueTexte, formatReponseAttenduePhaseLatex, formatTermesDonneesLatex, labelPhase } from "../ui5e/formatLimitesContexte";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceLimitesContexte;
  aideParPhase: Partial<Record<PhaseLimitesContexte, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — une `LigneRecap` par écran RÉELLEMENT traversé. Les écrans QCM
 * ("interpreter"/"vaSens") affichent la phrase correcte en TEXTE SIMPLE (jamais via Katex — ce
 * n'est pas une formule), tous les autres via KaTeX, même distinction déjà faite par 5gen20 pour
 * son écran "reconnaissance". */
export function ResultatPanelLimitesContexte({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = ordreComplet(exercice);

  function statutPhase(phase: PhaseLimitesContexte) {
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
          <LigneRecap key={phase} label={labelPhase(exercice, phase)} statut={statut}>
            {estPhaseQCM(phase) ? (
              <span>{formatReponseAttendueTexte(exercice, phase)}</span>
            ) : (
              <span className="equation-box-termes">
                {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
                  <Katex key={i} expression={frag} block={frag.includes("\\lim_{")} />
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
