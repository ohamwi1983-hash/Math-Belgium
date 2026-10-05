import type { TriangleQuelconqueSketchGeometrie } from "../ui/triangleQuelconqueSketch";

interface Props {
  croquis: TriangleQuelconqueSketchGeometrie;
}

/**
 * Croquis riche de "Triangle quelconque" — rend la géométrie de base partagée (`croquis.base`,
 * `triangleSketch.ts`) exactement comme `TriangleSketch.tsx`, puis superpose les côtés/angles
 * surlignés et les connecteurs de paire (`ui/triangleQuelconqueSketch.ts`). Les surlignages sont
 * rendus AVANT le triangle de base pour que le contour/les labels restent toujours lisibles
 * par-dessus, sauf les connecteurs (pointillés) et secteurs d'angle, rendus après pour rester
 * visibles même sur un fond clair.
 */
export function TriangleQuelconqueSketch({ croquis }: Props) {
  const { base, cotesSurlignes, anglesSurlignes, connecteurs } = croquis;
  const { largeur, hauteur, sommets, labelSommet, labelCote, labelAngle, valeurs } = base;

  return (
    <svg
      className="triangle-sketch triangle-quelconque-sketch"
      viewBox={`0 0 ${largeur} ${hauteur}`}
      role="img"
      aria-label="Croquis du triangle avec les données mises en évidence"
    >
      <polygon
        points={`${sommets.A.x},${sommets.A.y} ${sommets.B.x},${sommets.B.y} ${sommets.C.x},${sommets.C.y}`}
        className="triangle-sketch-forme"
      />

      {cotesSurlignes.map((segment) => (
        <line
          key={`cote-${segment.x1}-${segment.y1}-${segment.x2}-${segment.y2}`}
          x1={segment.x1}
          y1={segment.y1}
          x2={segment.x2}
          y2={segment.y2}
          className="triangle-quelconque-cote-surligne"
        />
      ))}

      {anglesSurlignes.map((secteur) => (
        <polygon key={secteur.sommet} points={secteur.chemin} className="triangle-quelconque-angle-surligne" />
      ))}

      {connecteurs.map((segment) => (
        <line
          key={`connecteur-${segment.x1}-${segment.y1}-${segment.x2}-${segment.y2}`}
          x1={segment.x1}
          y1={segment.y1}
          x2={segment.x2}
          y2={segment.y2}
          className="triangle-quelconque-connecteur"
        />
      ))}

      <text x={labelSommet.A.x} y={labelSommet.A.y} className="triangle-sketch-label-sommet">
        A
      </text>
      <text x={labelSommet.B.x} y={labelSommet.B.y} className="triangle-sketch-label-sommet">
        B
      </text>
      <text x={labelSommet.C.x} y={labelSommet.C.y} className="triangle-sketch-label-sommet">
        C
      </text>

      {valeurs.a != null && (
        <text x={labelCote.a.x} y={labelCote.a.y} className="triangle-sketch-label-valeur">
          {valeurs.a}
        </text>
      )}
      {valeurs.b != null && (
        <text x={labelCote.b.x} y={labelCote.b.y} className="triangle-sketch-label-valeur">
          {valeurs.b}
        </text>
      )}
      {valeurs.c != null && (
        <text x={labelCote.c.x} y={labelCote.c.y} className="triangle-sketch-label-valeur">
          {valeurs.c}
        </text>
      )}
      {valeurs.angA != null && (
        <text x={labelAngle.A.x} y={labelAngle.A.y} className="triangle-sketch-label-valeur">
          {valeurs.angA}
        </text>
      )}
      {valeurs.angB != null && (
        <text x={labelAngle.B.x} y={labelAngle.B.y} className="triangle-sketch-label-valeur">
          {valeurs.angB}
        </text>
      )}
      {valeurs.angC != null && (
        <text x={labelAngle.C.x} y={labelAngle.C.y} className="triangle-sketch-label-valeur">
          {valeurs.angC}
        </text>
      )}
    </svg>
  );
}
