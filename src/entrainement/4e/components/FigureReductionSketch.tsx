import type { Point } from "../core/vecteur.types";
import { calculerGeometrieFigureReduction } from "../ui/figureReductionSketch";

interface Props {
  points: Record<string, Point>;
  aretes: [string, string][];
  /** Éléments SVG additionnels, rendus APRÈS la figure statique, à l'intérieur du même `<svg>`
   * (donc dans le même repère/viewBox) — absent par défaut, comportement historique inchangé pour
   * tout appelant qui ne l'utilise pas. Utilisé par `OutilTraceVecteurs.tsx` pour superposer sa
   * couche interactive (points cibles, vecteurs tracés) sans dupliquer le calcul de géométrie/
   * viewBox — même principe additif que `VecteurGraph.tsx::children`. */
  children?: React.ReactNode;
}

/** Croquis SVG schématique d'une des 4 figures fixes de "Réduction d'une somme de vecteurs
 * (Chasles)" — coordonnées toujours identiques d'un exercice à l'autre pour une même figure,
 * jamais de zoom/pan (contrairement aux 4 graphes Mafs du projet). */
export function FigureReductionSketch({ points, aretes, children }: Props) {
  const geom = calculerGeometrieFigureReduction(points, aretes);

  return (
    <svg viewBox={geom.viewBox} className="figure-reduction-sketch" role="img" aria-label="Figure de référence">
      {geom.aretes.map((a, i) => (
        <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="var(--color-border)" strokeWidth={geom.rayonPoint * 0.3} />
      ))}
      {geom.points.map((p) => (
        <g key={p.nom}>
          <circle cx={p.x} cy={p.y} r={geom.rayonPoint} fill="var(--color-text)" />
          <text
            x={p.x + geom.rayonPoint * 1.8}
            y={p.y - geom.rayonPoint * 1.8}
            fontSize={geom.rayonPoint * 3.2}
            fontWeight={700}
            fill="var(--color-text)"
          >
            {p.nom}
          </text>
        </g>
      ))}
      {children}
    </svg>
  );
}
