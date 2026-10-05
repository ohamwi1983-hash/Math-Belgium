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
 */
export function ConsigneGeneraleEquationDroite({ exercice }: Props) {
  return (
    <p className="prompt-text">
      <RenduFragments fragments={segmentsConsigneGeneraleEquationDroite(exercice)} />
    </p>
  );
}
