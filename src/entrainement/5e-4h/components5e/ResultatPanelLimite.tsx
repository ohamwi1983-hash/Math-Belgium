import type { PhaseLimite, ResultatExerciceLimite } from "../moteur5e/typesLimites";
import { ordreComplet } from "../moteur5e/typesLimites";
import { LIBELLE_FAMILLE_LIMITE, LIBELLE_PHASE_LIMITE, formatBlocDonneesLatex, formatReponseAttenduePhaseLatex, limNecessiteModeDisplay } from "../ui5e/formatLimites";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceLimite;
  aideParPhase: Partial<Record<PhaseLimite, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/** Écran récapitulatif final — une `LigneRecap` par écran RÉELLEMENT traversé, même patron plat/
 * coloré que `ResultatPanelSuiteArithmetique.tsx` (5gen14). "reconnaissance" affiche le libellé de
 * la VRAIE famille générée (jamais du LaTeX, jamais la réponse de l'élève — voir `typesLimites.ts`
 * en-tête : cet écran n'influence jamais la suite, mais son résultat récapitulé reste la bonne
 * réponse comme n'importe quel autre écran). */
export function ResultatPanelLimite({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const phases = ordreComplet(exercice);

  function statutPhase(phase: PhaseLimite) {
    const info = aideParPhase[phase];
    return statutRecap(info?.revele ?? false, info?.niveauAide ?? null);
  }

  const libelleFamille = LIBELLE_FAMILLE_LIMITE[exercice.famille] ?? exercice.famille;

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <div className="equation-box equation-box-termes">
        <Katex expression={formatBlocDonneesLatex(exercice)} block />
      </div>
      {phases.map((phase) => {
        const score = resultat.scores[phase];
        if (score === undefined) return null;
        const statut = statutPhase(phase);
        // "reconnaissance" affiche TOUJOURS le libellé de famille ; famille "limiteReelle" (seul et
        // dernier écran) affiche AUSSI la valeur numérique attendue, en un seul geste comme l'écran
        // lui-même (`formatReponseAttenduePhaseLatex` ne renvoie du LaTeX pour "reconnaissance" que
        // dans ce cas précis).
        const reponseLatex = formatReponseAttenduePhaseLatex(exercice, phase);
        return (
          <LigneRecap key={phase} label={LIBELLE_PHASE_LIMITE[phase]} statut={statut}>
            {phase === "reconnaissance" && libelleFamille}
            {reponseLatex.length > 0 && (
              <span className="equation-box-termes">
                {reponseLatex.map((frag, i) => (
                  <Katex key={i} expression={frag} block={limNecessiteModeDisplay(frag)} />
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
