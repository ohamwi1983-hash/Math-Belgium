import type { ExerciceComparaisonSuites } from "../core5e/comparaisonSuites.types";
import { TableComparaisonRecap } from "./TableComparaisonRecap";

interface Props {
  exercice: ExerciceComparaisonSuites;
}

/**
 * Bloc "état actuel" (5gen18) — rappelle, sur l'écran "conclusion" (le seul écran APRÈS le premier
 * de la séquence fixe `tableau → conclusion`), le tableau déjà rempli et confirmé à l'écran
 * "tableau" (`TableComparaisonRecap`, entourée ici d'un `.apercu-box` — même identité visuelle que
 * le bloc "état actuel" du reste de la plateforme, ex. `EtatActuelSuiteArithmetique`/
 * `EtatActuelSuiteGeometrique`). Pas de paramètre `phase` (contrairement à ces deux composants) :
 * ce générateur n'a que 2 écrans, et "tableau" — le premier — n'a jamais besoin de bloc état
 * actuel ; ce composant n'est donc jamais monté ailleurs que sur l'écran "conclusion".
 */
export function EtatActuelComparaisonSuites({ exercice }: Props) {
  return (
    <div className="etat-actuel-box">
      <TableComparaisonRecap exercice={exercice} />
    </div>
  );
}
