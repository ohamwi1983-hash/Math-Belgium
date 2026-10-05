import type { Quadrant } from "../core/cercleTrigonometrique.types";
import { calculerZonesCercleQuadrantSelecteur } from "../ui/cercleQuadrantSelecteur";

interface Props {
  selection: Quadrant | null;
  onSelectionner: (quadrant: Quadrant) => void;
}

/**
 * Sélecteur interactif de l'écran "Quadrant" (correction 3 ; affiné par le round 2,
 * promptcorrectionsgenerateurcercletrigo2.md) : jamais l'angle de l'énoncé affiché dessus
 * (contrairement au croquis d'aide, `CercleTrigSketch.tsx`, avec lequel il partage seulement les
 * dimensions géométriques). Sélection unique et exclusive parmi les 6 valeurs de `Quadrant` — Ox et
 * Oy sont désormais deux réponses indépendantes (point 1.4), chacune son propre rect cliquable et
 * son propre trait d'axe qui s'épaissit individuellement (point 1.5). La surbrillance d'un
 * quadrant épouse la forme réelle du quart de disque (point 1.2), jamais le carré englobant, et
 * son contour (arc + les deux rayons qui le délimitent) s'affiche plus marqué (point 1.3) —
 * `zone.rect` reste néanmoins la zone CLIQUABLE, plus généreuse que ce disque affiché.
 */
export function CercleQuadrantSelecteur({ selection, onSelectionner }: Props) {
  const { largeur, hauteur, centre, rayon, zonesQuadrant, axeOxRect, axeOyRect, labelOx, labelOy, flecheX, flecheY, labelOrigine } =
    calculerZonesCercleQuadrantSelecteur();

  function classeDisqueQuadrant(quadrant: Quadrant): string {
    return selection === quadrant ? "cercle-quadrant-disque is-selected" : "cercle-quadrant-disque";
  }

  function classeAxeLigne(axe: "axeOx" | "axeOy"): string {
    return selection === axe ? "cercle-quadrant-axe-ligne is-selected" : "cercle-quadrant-axe-ligne";
  }

  return (
    <svg
      className="cercle-quadrant-selecteur"
      viewBox={`0 0 ${largeur} ${hauteur}`}
      role="img"
      aria-label="Sélecteur de quadrant sur le cercle trigonométrique"
    >
      {zonesQuadrant.map((zone) => (
        <rect
          key={zone.quadrant}
          x={zone.rect.x}
          y={zone.rect.y}
          width={zone.rect.width}
          height={zone.rect.height}
          className="cercle-quadrant-zone"
          onClick={() => onSelectionner(zone.quadrant)}
        />
      ))}

      <circle cx={centre.x} cy={centre.y} r={rayon} className="cercle-quadrant-cercle" />

      {zonesQuadrant.map((zone) => (
        <path key={zone.quadrant} d={zone.cheminDisque} className={classeDisqueQuadrant(zone.quadrant)} pointerEvents="none" />
      ))}

      <line x1={0} y1={centre.y} x2={largeur} y2={centre.y} className={classeAxeLigne("axeOx")} pointerEvents="none" />
      <line x1={centre.x} y1={0} x2={centre.x} y2={hauteur} className={classeAxeLigne("axeOy")} pointerEvents="none" />

      <rect
        x={axeOxRect.x}
        y={axeOxRect.y}
        width={axeOxRect.width}
        height={axeOxRect.height}
        className="cercle-quadrant-axe-zone"
        pointerEvents="all"
        onClick={() => onSelectionner("axeOx")}
      />
      <rect
        x={axeOyRect.x}
        y={axeOyRect.y}
        width={axeOyRect.width}
        height={axeOyRect.height}
        className="cercle-quadrant-axe-zone"
        pointerEvents="all"
        onClick={() => onSelectionner("axeOy")}
      />

      {zonesQuadrant.map((zone) => (
        <text key={zone.quadrant} x={zone.label.x} y={zone.label.y} className="cercle-quadrant-label" pointerEvents="none">
          {zone.quadrant}
        </text>
      ))}
      <polygon points={flecheX} className="cercle-quadrant-fleche" pointerEvents="none" />
      <polygon points={flecheY} className="cercle-quadrant-fleche" pointerEvents="none" />
      <text x={labelOx.x} y={labelOx.y} className="cercle-quadrant-label-axe" pointerEvents="none">
        X
      </text>
      <text x={labelOy.x} y={labelOy.y} className="cercle-quadrant-label-axe" pointerEvents="none">
        Y
      </text>
      <text x={labelOrigine.x} y={labelOrigine.y} className="cercle-quadrant-label-origine" pointerEvents="none">
        O
      </text>
    </svg>
  );
}
