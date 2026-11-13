import type { ExerciceAireTriangleSinus } from "../core/aireTriangleSinus.types";
import { calculerFigure, legendeFigure } from "../ui/figureAireTriangleSinus";

interface Props {
  exercice: ExerciceAireTriangleSinus;
  /** Famille `angle` : ajoute la seconde configuration (X̂ obtus) en pointillés. */
  deuxSolutions?: boolean;
}

/**
 * Figure À L'ÉCHELLE de gen75 (géométrie : `ui/figureAireTriangleSinus.ts`). Classes du thème
 * (`.aire-triangle-*`, `theme.css`), lisibles en clair et en sombre ; l'inconnue est un « ? »
 * orange.
 */
export function FigureAireTriangleSinus({ exercice, deuxSolutions = false }: Props) {
  const f = calculerFigure(exercice, deuxSolutions);
  return (
    <figure className="aire-triangle-figure">
      <svg className="aire-triangle-sketch" viewBox={`0 0 ${f.largeur} ${f.hauteur}`} role="img" aria-label="Figure à l'échelle avec les données">
        {f.polygonesSecondaires.map((pts) => (
          <polygon key={`s-${pts}`} points={pts} className="aire-triangle-forme-secondaire" />
        ))}
        {f.polygones.map((pts) => (
          <polygon key={pts} points={pts} className="aire-triangle-forme" />
        ))}
        {f.pointilles.map(([a, b]) => (
          <line key={`${a.x}-${b.x}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="aire-triangle-diagonale" />
        ))}
        {f.arcs.map((d) => (
          <path key={d} d={d} className="aire-triangle-arc" />
        ))}
        {f.arcsSecondaires.map((d) => (
          <path key={d} d={d} className="aire-triangle-arc aire-triangle-arc-secondaire" />
        ))}
        {f.equerres.map((pts) => (
          <polyline key={pts} points={pts} className="aire-triangle-arc" />
        ))}
        {f.labels.map((l, i) => (
          <text key={i} x={l.x} y={l.y} className={`aire-triangle-label aire-triangle-label-${l.role}`} style={{ textAnchor: l.ancre }}>
            {l.texte}
          </text>
        ))}
      </svg>
      <figcaption className="aire-triangle-legende">{legendeFigure(exercice, deuxSolutions)}</figcaption>
    </figure>
  );
}
