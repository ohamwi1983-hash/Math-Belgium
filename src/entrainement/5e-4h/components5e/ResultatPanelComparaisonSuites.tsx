import type { PhaseComparaisonSuites, ResultatExerciceComparaisonSuites } from "../moteur5e/typesComparaisonSuites";
import { formatConclusionNLatex, formatTraductionAttendueTexte } from "../ui5e/formatComparaisonSuites";
import { Katex } from "../components/Katex";
import { LigneRecap, RecapTotalPoints, statutRecap } from "./LigneRecap";
import { TableComparaisonRecap } from "./TableComparaisonRecap";

interface Props {
  resultat: ResultatExerciceComparaisonSuites;
  aideParPhase: Partial<Record<PhaseComparaisonSuites, { niveauAide: number; revele: boolean }>>;
  onContinuer: () => void;
  dernier: boolean;
}

/**
 * Écran récapitulatif final — même patron plat/coloré que `ResultatPanelDomaineDefinition.tsx`
 * (5gen1)/`ResultatPanelSuiteArithmetique.tsx` (5gen14) : une `LigneRecap` par écran (les 2 écrans
 * de la séquence FIXE `tableau → conclusion`, toujours les 2 traversés — `ResultatExerciceComparaisonSuites`
 * a `scoreTableau`/`scoreConclusion` toujours renseignés, jamais `number | null`), contenant la
 * réponse ATTENDUE — jamais un score fractionnaire `X/100`.
 *
 * Coloriée via `statutRecap` à partir de `aideParPhase` — capturé côté `App5gen18.tsx` au moment
 * précis où chaque écran se ferme (`etat.niveauAide`/`etat.etapeCourante.revelee` AVANT la
 * transition), jamais reconstruit depuis le score déjà pénalisé.
 */
export function ResultatPanelComparaisonSuites({ resultat, aideParPhase, onContinuer, dernier }: Props) {
  const exercice = resultat.exercice;
  const infoTableau = aideParPhase.tableau;
  const infoConclusion = aideParPhase.conclusion;
  return (
    <div className="resultat-panel">
      <h2>Récapitulatif</h2>
      <LigneRecap label="Tableau" statut={statutRecap(infoTableau?.revele ?? false, infoTableau?.niveauAide ?? null)}>
        <TableComparaisonRecap exercice={exercice} />
      </LigneRecap>
      <LigneRecap label="Conclusion" statut={statutRecap(infoConclusion?.revele ?? false, infoConclusion?.niveauAide ?? null)}>
        <Katex expression={formatConclusionNLatex(exercice)} /> — {formatTraductionAttendueTexte(exercice)}
      </LigneRecap>
      <RecapTotalPoints
        ecrans={[
          { revele: infoTableau?.revele ?? false, niveauAide: infoTableau?.niveauAide ?? null },
          { revele: infoConclusion?.revele ?? false, niveauAide: infoConclusion?.niveauAide ?? null },
        ]}
      />
      <button type="button" className="btn btn-primary" onClick={onContinuer}>
        {dernier ? "Voir le résumé" : "Exercice suivant"}
      </button>
    </div>
  );
}
