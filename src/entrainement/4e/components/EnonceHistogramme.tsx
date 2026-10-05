import type { ExerciceHistogramme } from "../core/histogramme.types";
import { formatEnonceTexte } from "../ui/formatHistogramme";

interface Props {
  exercice: ExerciceHistogramme;
}

/**
 * Bloc "énoncé" persistant — affiché en tête des 3 écrans (règle d'affichage transversale, même
 * principe que "Tableau de fréquences"/"Paramètres de dispersion"), jamais recalculé différemment
 * d'un écran à l'autre. Texte pur, aucun fragment KaTeX nécessaire.
 */
export function EnonceHistogramme({ exercice }: Props) {
  return (
    <div className="equation-box">
      <p className="prompt-text">{formatEnonceTexte(exercice)}</p>
    </div>
  );
}
