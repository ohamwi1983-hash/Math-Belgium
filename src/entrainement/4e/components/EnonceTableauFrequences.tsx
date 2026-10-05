import type { ExerciceTableauFrequences } from "../core/tableauFrequences.types";
import { formatEnonceTexte } from "../ui/formatTableauFrequences";

interface Props {
  exercice: ExerciceTableauFrequences;
}

/**
 * Bloc "énoncé" persistant — affiché en tête des 4 écrans (règle d'affichage transversale, même
 * principe que "Inégalité de Bienaymé-Tchebychev"/"Paramètres de dispersion"), jamais recalculé
 * différemment d'un écran à l'autre. Texte pur (aucune valeur numérique générée à afficher ici —
 * contrairement à x̄/σ ailleurs, la liste brute elle-même joue déjà ce rôle), jamais de fragment
 * KaTeX nécessaire.
 */
export function EnonceTableauFrequences({ exercice }: Props) {
  return (
    <div className="equation-box">
      <p className="prompt-text">{formatEnonceTexte(exercice)}</p>
    </div>
  );
}
