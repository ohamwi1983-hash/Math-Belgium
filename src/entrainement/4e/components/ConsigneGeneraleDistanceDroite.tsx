import type { ExerciceDistanceDroite } from "../core/distanceDroite.types";
import { segmentsConsigneGeneraleDistanceDroite } from "../ui/formatDistanceDroite";
import { RenduFragments } from "./RenduFragments";

interface Props {
  exercice: ExerciceDistanceDroite;
}

/**
 * Consigne générale — rappelle l'objectif complet de l'exercice ("Calcule la distance entre les
 * droites $d_1$ et $d_2$" / "... entre la droite $d$ et le point $P$"), affichée identique sur les
 * 4 écrans, y compris "choixPoint" (`promptgen47modifications.md`, point 1).
 */
export function ConsigneGeneraleDistanceDroite({ exercice }: Props) {
  // Pas de `<p>` ici : `EnTeteExercice` encadre déjà la consigne générale d'un `<p>` (audit
  // chapitre 7, point 6 — un `<p>` dans un `<p>` est du HTML invalide, signalé en console).
  return <RenduFragments fragments={segmentsConsigneGeneraleDistanceDroite(exercice)} />;
}
