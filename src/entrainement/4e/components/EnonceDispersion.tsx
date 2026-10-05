import type { ExerciceDispersion } from "../core/dispersion.types";
import { formatEnonceSegments } from "../ui/formatDispersion";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceDispersion;
}

/**
 * Bloc "énoncé" persistant — affiché en tête des 2 écrans (règle d'affichage transversale, même
 * principe que "Inégalité de Bienaymé-Tchebychev"), jamais recalculé différemment d'un écran à
 * l'autre. Mélange texte HTML brut et un court fragment KaTeX (x̄ inline), jamais une phrase entière
 * passée à KaTeX.
 */
export function EnonceDispersion({ exercice }: Props) {
  const segments = formatEnonceSegments(exercice);
  return (
    <div className="equation-box">
      <p className="prompt-text">
        {segments.map((segment, index) =>
          segment.type === "texte" ? <span key={index}>{segment.valeur}</span> : <Katex key={index} expression={segment.valeur} />,
        )}
      </p>
    </div>
  );
}
