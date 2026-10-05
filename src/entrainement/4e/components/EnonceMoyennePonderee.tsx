import type { ExerciceMoyennePonderee } from "../core/moyennePonderee.types";
import { formatEnonceTexte } from "../ui/formatMoyennePonderee";

interface Props {
  exercice: ExerciceMoyennePonderee;
}

/**
 * Bloc "énoncé" persistant — affiché en tête des écrans "centres"/"sommes"/"quotient" (règle
 * d'affichage transversale, même principe que "Tableau de fréquences"/"Regroupement en classes et
 * histogramme"), jamais recalculé différemment d'un écran à l'autre. Texte pur, aucun fragment
 * KaTeX nécessaire.
 */
export function EnonceMoyennePonderee({ exercice }: Props) {
  return (
    <div className="equation-box">
      <p className="prompt-text">{formatEnonceTexte(exercice)}</p>
    </div>
  );
}
