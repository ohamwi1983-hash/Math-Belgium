import type { ExerciceRelationsDroites } from "../core/relationsDroites.types";
import { segmentsConsigneGeneraleRelationsDroites } from "../ui/formatRelationsDroites";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceRelationsDroites;
}

/**
 * Consigne générale — rappelle l'objectif complet de l'exercice (forme de sortie cible, droite $d$
 * cherchée passant par le point $A$, critère parallèle/perpendiculaire, droite $b$ de référence),
 * affichée identique sur les 3 écrans (`promptgen45modifications.md`, point 1). Même patron
 * fragment par fragment (texte brut / KaTeX inline courts, `RenduFragments`) que
 * `ConsigneGeneraleEquationDroite`.
 */
export function ConsigneGeneraleRelationsDroites({ exercice }: Props) {
  return (
    <p className="prompt-text">
      <RenduFragments fragments={segmentsConsigneGeneraleRelationsDroites(exercice)} />
    </p>
  );
}
