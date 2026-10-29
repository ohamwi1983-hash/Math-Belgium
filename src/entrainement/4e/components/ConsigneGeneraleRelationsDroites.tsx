import type { ExerciceRelationsDroites } from "../core/relationsDroites.types";
import { segmentsConsigneGeneraleRelationsDroites } from "../ui/formatRelationsDroites";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceRelationsDroites;
}

/**
 * Consigne générale — rappelle l'objectif complet de l'exercice, affichée identique sur les 3
 * écrans. Même patron fragment par fragment (texte brut / KaTeX inline courts, `RenduFragments`)
 * que `ConsigneGeneraleEquationDroite`. Rendue SANS conteneur : `EnTeteExercice` l'enveloppe déjà
 * dans son `<p className="prompt-text">` (un `<p>` ici donnait un `<p>` dans un `<p>`, HTML
 * invalide et erreur console React — audit chapitre 7, point 6).
 */
export function ConsigneGeneraleRelationsDroites({ exercice }: Props) {
  return <RenduFragments fragments={segmentsConsigneGeneraleRelationsDroites(exercice)} />;
}
