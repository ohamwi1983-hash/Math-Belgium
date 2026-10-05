import type { PhaseSuiteRecurrenteAffine, ResultatExerciceSuiteRecurrenteAffine } from "../moteur5e/typesSuiteRecurrenteAffine";
import { formatReponseAttenduePhaseLatex } from "../ui5e/formatSuiteRecurrenteAffine";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";

interface Props {
  resultat: ResultatExerciceSuiteRecurrenteAffine;
  aideParPhase: Partial<Record<PhaseSuiteRecurrenteAffine, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `ResultatPanelDomaineDefinition.tsx`
 * (5gen1) : une `LigneRecap` PAR ÉCRAN (les 3 écrans sont TOUJOURS traversés, jamais de saut, même
 * en régime divergent — voir `moteur5e/typesSuiteRecurrenteAffine.ts`), contenant la réponse
 * ATTENDUE — jamais un score fractionnaire `X/100`.
 *
 * Coloriée via `statutRecap` à partir de `aideParPhase` — capturé côté `App5gen19.tsx` au moment
 * précis où chaque écran se ferme (`etat.niveauAide` pré-soumission + `derniereEtapeRevelee` lu sur
 * l'état POST-soumission renvoyé par le moteur, jamais `etat.etapeCourante.revelee` qui est
 * structurellement toujours `false` à ce point), jamais reconstruit depuis le score déjà pénalisé.
 */
export function ResultatPanelSuiteRecurrenteAffine({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;

  function ligne(label: string, phase: PhaseSuiteRecurrenteAffine) {
    const info = aideParPhase[phase];
    return (
      <LigneRecap label={label} statut={statutRecap(info?.revele ?? false, info?.niveauAide ?? null)}>
        <span className="equation-box-termes">
          {formatReponseAttenduePhaseLatex(exercice, phase).map((frag, i) => (
            <Katex key={i} expression={frag} />
          ))}
        </span>
      </LigneRecap>
    );
  }

  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      {ligne("Poser la récurrence", "poserRecurrence")}
      {ligne("Régime permanent", "regimePermanent")}
      {ligne("Termes successifs", "termesSuccessifs")}
      <RecapTotalPoints
        ecrans={(["poserRecurrence", "regimePermanent", "termesSuccessifs"] as PhaseSuiteRecurrenteAffine[]).map((phase) => {
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
