import type { CroquisColore, CroquisParabole } from "../ui/parabolaSketch";

interface Props {
  croquis: CroquisParabole;
  /** Fourni uniquement après activation du bouton "Aide" (étape intervalle) : remplace la courbe
   * et les points-racines à couleur unique par un rendu vert/rouge selon la satisfaction de
   * l'inégalité — voir calculerCroquisColore. */
  couleurs?: CroquisColore;
}

/**
 * Rendu SVG pur du croquis schématique (pas à l'échelle numérique réelle) calculé par
 * calculerCroquisParabole — voir src/ui/parabolaSketch.ts pour la logique.
 */
const HAUTEUR = 200;
const ORIGINE_X = 14;
const TAILLE_FLECHE = 7;

export function ParabolaSketch({ croquis, couleurs }: Props) {
  const finLigneAxe = croquis.largeur - TAILLE_FLECHE * 1.5;

  return (
    <svg
      className="parabola-sketch"
      viewBox={`0 0 ${croquis.largeur} ${HAUTEUR}`}
      role="img"
      aria-label="Croquis schématique de la parabole"
    >
      <line x1={0} y1={croquis.axeY} x2={finLigneAxe} y2={croquis.axeY} className="parabola-axe" />
      <polygon
        points={`${finLigneAxe},${croquis.axeY - TAILLE_FLECHE} ${finLigneAxe},${croquis.axeY + TAILLE_FLECHE} ${croquis.largeur},${croquis.axeY}`}
        className="parabola-fleche"
      />
      <line x1={ORIGINE_X} y1={croquis.axeY - 5} x2={ORIGINE_X} y2={croquis.axeY + 5} className="parabola-origine" />
      <text x={ORIGINE_X} y={croquis.axeY + 18} className="parabola-label-origine" textAnchor="middle">
        0
      </text>
      {couleurs ? (
        couleurs.segments.map((segment, index) => (
          <polyline
            key={index}
            points={segment.points.map((p) => `${p.x},${p.y}`).join(" ")}
            className={`parabola-courbe parabola-courbe-${segment.couleur}`}
          />
        ))
      ) : (
        <polyline points={croquis.points.map((p) => `${p.x},${p.y}`).join(" ")} className="parabola-courbe" />
      )}
      {(couleurs ? couleurs.pointsRacinesColores : croquis.pointsRacines).map((p, index) => (
        <g key={index}>
          <circle
            cx={p.x}
            cy={p.y}
            r={4}
            className={"couleur" in p ? `parabola-racine parabola-racine-${p.couleur}` : "parabola-racine"}
          />
          <text x={p.x} y={p.y + 18} className="parabola-label-racine" textAnchor="middle">
            {p.valeur}
          </text>
        </g>
      ))}
    </svg>
  );
}
