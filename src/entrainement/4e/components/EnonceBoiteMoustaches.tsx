import type { ExerciceBoiteMoustaches } from "../core/boiteMoustaches.types";
import { formatEnonceTexte } from "../ui/formatBoiteMoustaches";

interface Props {
  exercice: ExerciceBoiteMoustaches;
}

/**
 * Bloc "énoncé" persistant — affiché en tête des 4 écrans possibles de ce générateur (les 3
 * variantes), même principe que "Tableau de fréquences"/"Regroupement en classes et histogramme"/
 * "Moyenne pondérée"/"Médiane". Texte pur, aucun fragment KaTeX nécessaire.
 */
export function EnonceBoiteMoustaches({ exercice }: Props) {
  return (
    <div className="equation-box">
      <p className="prompt-text">{formatEnonceTexte(exercice)}</p>
    </div>
  );
}
