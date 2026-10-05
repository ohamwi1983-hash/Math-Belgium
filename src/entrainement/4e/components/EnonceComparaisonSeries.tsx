import type { ExerciceComparaisonSeries } from "../core/comparaisonSeries.types";
import { formatEnonceTexte } from "../ui/formatComparaisonSeries";

interface Props {
  exercice: ExerciceComparaisonSeries;
}

/**
 * Bloc "énoncé" persistant — affiché en tête des 4 types de question possibles, même principe que
 * "Boîte à moustaches"/"Moyenne pondérée"/"Médiane". Texte pur, aucun fragment KaTeX nécessaire.
 */
export function EnonceComparaisonSeries({ exercice }: Props) {
  return (
    <div className="equation-box">
      <p className="prompt-text">{formatEnonceTexte(exercice)}</p>
    </div>
  );
}
