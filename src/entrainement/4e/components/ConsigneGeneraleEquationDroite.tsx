import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import { segmentsConsigneGeneraleEquationDroite } from "../ui/formatEquationDroite";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceEquationDroite;
}

/**
 * Consigne générale — rappelle l'objectif complet de l'exercice (forme de sortie cible + donnée
 * d'entrée), affichée identique sur les 3 écrans (`promptgen42modifications.md`, point 1). Rendue
 * fragment par fragment (texte brut / KaTeX inline courts, `RenduFragments`) plutôt qu'un unique
 * bloc KaTeX — voir `segmentsConsigneGeneraleEquationDroite` pour la justification complète.
 * Rendue SANS paragraphe propre : `EnTeteExercice` l'enveloppe déjà dans un `<p>` (un `<p>` dans
 * un `<p>` est du HTML invalide, erreur console React — audit chapitre 7, point 6).
 */
export function ConsigneGeneraleEquationDroite({ exercice }: Props) {
  return <RenduFragments fragments={segmentsConsigneGeneraleEquationDroite(exercice)} />;
}
