import type { CSSProperties } from "react";
import type { ExerciceCasAmbigu } from "../core/casAmbigu.types";
import { figureCasAmbigu, type RoleTrait } from "../ui/figureCasAmbigu";

/**
 * Figure de gen74 dans l'appli — même géométrie que le corrigé papier (`ui/figureCasAmbigu.ts`),
 * couleurs du thème (clair/sombre). Cadre et légende repris du croquis de gen19
 * (`.triangle-sketch`, `.triangle-quelconque-figure`, `.triangle-quelconque-legende`). L'arc de
 * compas n'apparaît qu'une fois le nombre de triangles tranché (`avecArc`) : avant, la figure ne
 * révèle rien de l'issue.
 */

const STYLES: Record<RoleTrait, CSSProperties> = {
  axe: { stroke: "var(--color-text)", strokeWidth: 1.6 },
  prolongement: { stroke: "var(--color-text-muted)", strokeWidth: 1.2, strokeDasharray: "4 3" },
  cote: { stroke: "var(--color-text)", strokeWidth: 2 },
  arc: { stroke: "var(--color-error)", strokeWidth: 1.4, strokeDasharray: "5 3", fill: "none" },
  hauteur: { stroke: "var(--plan, #5b4ea3)", strokeWidth: 1.3, strokeDasharray: "4 3" },
  triangle1: { stroke: "var(--color-success)", strokeWidth: 2, fill: "var(--color-success)", fillOpacity: 0.12, strokeLinejoin: "round" },
  triangle2: { stroke: "var(--color-primary)", strokeWidth: 2, fill: "var(--color-primary)", fillOpacity: 0.12, strokeLinejoin: "round" },
  angle: { stroke: "var(--color-text)", strokeWidth: 1.3, fill: "none" },
};

const COULEUR_TEXTE = { sommet: "var(--color-text)", valeur: "var(--color-primary)", hauteur: "var(--plan, #5b4ea3)" };

export function FigureCasAmbigu({ exercice, avecArc }: { exercice: ExerciceCasAmbigu; avecArc: boolean }) {
  const f = figureCasAmbigu(exercice, avecArc);
  return (
    <figure className="triangle-quelconque-figure">
      <svg className="triangle-sketch" style={{ maxWidth: 360 }} viewBox={`0 0 ${f.largeur} ${f.hauteur}`} role="img" aria-label={f.description}>
        {f.primitives.map((p, i) => {
          switch (p.type) {
            case "ligne":
              return <line key={i} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} style={STYLES[p.role]} />;
            case "cercle":
              return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} style={STYLES[p.role]} />;
            case "polygone":
              return <polygon key={i} points={p.points.map(([x, y]) => `${x},${y}`).join(" ")} style={STYLES[p.role]} />;
            case "chemin":
              return <path key={i} d={p.d} style={STYLES[p.role]} />;
            case "point":
              return <circle key={i} cx={p.x} cy={p.y} r={3.4} style={{ fill: p.plein ? "var(--color-text)" : "var(--color-primary-bg)", stroke: "var(--color-text)", strokeWidth: 1.3 }} />;
            case "texte":
              return (
                <text key={i} x={p.x} y={p.y} textAnchor={p.ancre} style={{ fill: COULEUR_TEXTE[p.role], fontSize: p.role === "sommet" ? 14 : 13, fontWeight: p.role === "sommet" ? 700 : 600, stroke: "var(--color-primary-bg)", strokeWidth: 4, strokeLinejoin: "round", paintOrder: "stroke" }}>
                  {p.contenu}
                </text>
              );
          }
        })}
      </svg>
      <figcaption className="triangle-quelconque-legende">
        {avecArc ? "Arc de compas de centre C et de rayon a = BC" : "Figure à l'échelle — le sommet B est à placer sur la demi-droite [Ax)"}
      </figcaption>
    </figure>
  );
}
