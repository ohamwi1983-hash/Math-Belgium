import type { ExerciceMediane } from "../core/mediane.types";
import { formatEnonceTexte } from "../ui/formatMediane";

interface Props {
  exercice: ExerciceMediane;
}

/**
 * Bloc "énoncé" persistant — affiché en tête des 7 écrans possibles de ce générateur (les 2
 * variantes), même principe que "Tableau de fréquences"/"Regroupement en classes et histogramme"/
 * "Moyenne pondérée". Texte pur, aucun fragment KaTeX nécessaire.
 */
export function EnonceMediane({ exercice }: Props) {
  return (
    <div className="equation-box">
      <p className="prompt-text">{formatEnonceTexte(exercice)}</p>
    </div>
  );
}
