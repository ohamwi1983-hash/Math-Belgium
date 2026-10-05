import type { ExerciceBienaymeTchebychev } from "../core/bienaymeTchebychev.types";
import { formatEnonceSegments } from "../ui/formatBienaymeTchebychev";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceBienaymeTchebychev;
}

/**
 * Bloc "énoncé" persistant — affiché en tête de CHAQUE écran d'une variante (règle d'affichage
 * transversale, `promptgen37refonte.md`), jamais recalculé différemment d'un écran à l'autre.
 * Consomme `formatEnonceSegments`, seule source de vérité — mélange texte HTML brut et fragments
 * KaTeX courts (x̄/σ/k inline), jamais une phrase entière passée à KaTeX.
 */
export function EnonceBienaymeTchebychev({ exercice }: Props) {
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
