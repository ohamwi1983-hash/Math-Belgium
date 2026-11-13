import type { ExerciceResoudreTriangle } from "../core/resoudreTriangle.types";
import { SOMMETS } from "../moteur/resolutionTriangle";
import { calculerFigure } from "../ui/croquisResoudreTriangle";

/**
 * Figure de gen73 à l'écran — même géométrie que la figure imprimée (`ui/croquisResoudreTriangle.ts`) :
 * triangle aux proportions réelles, données en couleur primaire, inconnues « ? » en orange.
 */
export function FigureResoudreTriangle({ exercice }: { exercice: ExerciceResoudreTriangle }) {
  const f = calculerFigure(exercice);
  const { A, B, C } = f.sommets;
  const style = (inconnu: boolean) => (inconnu ? { fill: "var(--color-warning)", fontWeight: 700 } : undefined);
  return (
    <figure className="triangle-quelconque-figure">
      <svg
        className="triangle-sketch"
        style={{ maxWidth: 340 }}
        viewBox={`0 0 ${f.largeur} ${f.hauteur}`}
        role="img"
        aria-label="Triangle ABC aux proportions réelles : les données portent leur valeur, les inconnues un point d'interrogation"
      >
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} className="triangle-sketch-forme" />
        {f.angles.map((a) => (
          <path key={`arc-${a.sommet}`} d={a.arc} fill="none" style={{ stroke: "var(--color-text-muted)" }} strokeWidth={1.3} />
        ))}
        {SOMMETS.map((s) => (
          <text key={s} x={f.labelsSommets[s].x} y={f.labelsSommets[s].y} className="triangle-sketch-label-sommet" style={{ fontSize: 14, fill: "var(--color-text)" }}>
            {s}
          </text>
        ))}
        {f.cotes.map((l) => (
          <text key={l.cote} x={l.x} y={l.y} className="triangle-sketch-label-valeur" style={{ textAnchor: l.ancre, ...style(l.inconnu) }}>
            {l.texte}
          </text>
        ))}
        {f.angles.map((l) => (
          <text key={`val-${l.sommet}`} x={l.x} y={l.y} className="triangle-sketch-label-valeur" style={{ fontSize: 11.5, ...style(l.inconnu) }}>
            {l.texte}
          </text>
        ))}
      </svg>
      <figcaption className="triangle-quelconque-legende">Figure aux proportions réelles</figcaption>
    </figure>
  );
}
