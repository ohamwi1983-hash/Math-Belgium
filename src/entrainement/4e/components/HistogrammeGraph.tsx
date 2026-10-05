import { useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { ExerciceHistogramme } from "../core/histogramme.types";
import { calculerGeometrie, cranterHauteur, pixelVersY, valeursGrilleHorizontale, xVersPixel, yVersPixel } from "../ui/histogrammeGraph";

interface Props {
  exercice: ExerciceHistogramme;
  /** Une hauteur (déjà crantée) par classe, dans l'ordre de `exercice.classes` — toujours fournie
   * par le parent (initialisée à 0 pour chaque classe tant que l'élève n'a jamais glissé sa barre). */
  hauteurs: number[];
  /** Marquage rouge en direct, un booléen par classe — même principe que le reste du projet
   * (`celluleEstErronee`/`classeCurseur`), disparaît dès correction. */
  erronees: boolean[];
  onChangerHauteur: (index: number, hauteur: number) => void;
}

/**
 * Écran final "Tracer l'histogramme" — grille SVG native (pas Mafs : Mafs cible un repère
 * cartésien continu à zoom/pan, pas un histogramme catégoriel à glissement cranté sur un axe X
 * fixe). Axe X gradué selon les bornes de classes, FIXE et non interactif (spec — l'élève ne
 * déplace jamais les bornes elles-mêmes). Chaque classe porte une zone de glissement VERTICAL,
 * accrochée sur la grille entière la plus proche (`cranterHauteur`) — jamais de valeur continue
 * libre. **La largeur de chaque barre (l'amplitude de la classe) n'est jamais une variable
 * d'interaction** — garde-fou de conception qui empêche structurellement le piège "hauteur correcte
 * mais largeur mal alignée avec les bornes de l'axe" (spec, "Point de conception à noter").
 *
 * Glissement implémenté via les événements pointer natifs (`onPointerDown`/`Move`/`Up` +
 * `setPointerCapture`) — pas de bibliothèque de drag-and-drop tierce, testable via les événements
 * souris natifs de Playwright (`mouse.down()/move()/up()`). `indexEnGlissement` (état local, jamais
 * transmis à la vérification) distingue un vrai glissement actif d'un simple survol : sans cette
 * garde, `onPointerMove` suivrait la position du curseur au moindre survol de la zone, avant même
 * un `pointerdown`.
 */
export function HistogrammeGraph({ exercice, hauteurs, erronees, onChangerHauteur }: Props) {
  const geom = calculerGeometrie(exercice);
  const [indexEnGlissement, setIndexEnGlissement] = useState<number | null>(null);

  function hauteurDepuisPointer(e: ReactPointerEvent<SVGRectElement>): number {
    const svg = e.currentTarget.ownerSVGElement;
    const rectPixel = svg ? svg.getBoundingClientRect() : null;
    const yPixelSvg = rectPixel && rectPixel.height > 0 ? ((e.clientY - rectPixel.top) / rectPixel.height) * geom.hauteur : 0;
    return cranterHauteur(pixelVersY(geom, yPixelSvg), geom.hauteurMaxAxe);
  }

  function gererPointerDown(index: number, e: ReactPointerEvent<SVGRectElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIndexEnGlissement(index);
    onChangerHauteur(index, hauteurDepuisPointer(e));
  }

  function gererPointerMove(index: number, e: ReactPointerEvent<SVGRectElement>) {
    if (indexEnGlissement !== index) return;
    onChangerHauteur(index, hauteurDepuisPointer(e));
  }

  function gererPointerFin(e: ReactPointerEvent<SVGRectElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIndexEnGlissement(null);
  }

  const yBase = yVersPixel(geom, 0);
  const bornesAxe = [...exercice.classes.map((c) => c.borneInf), exercice.classes[exercice.classes.length - 1].borneSup];

  return (
    <svg
      className="histogramme-graph"
      viewBox={`0 0 ${geom.largeur} ${geom.hauteur}`}
      role="img"
      aria-label="Histogramme à compléter par glissement vertical"
    >
      {valeursGrilleHorizontale(geom.hauteurMaxAxe).map((v) => (
        <g key={`grille-${v}`}>
          <line
            x1={geom.margeGauche}
            x2={geom.largeur - geom.margeDroite}
            y1={yVersPixel(geom, v)}
            y2={yVersPixel(geom, v)}
            className="histogramme-grille-ligne"
          />
          <text x={geom.margeGauche - 6} y={yVersPixel(geom, v)} textAnchor="end" dominantBaseline="middle" className="histogramme-axe-label">
            {v}
          </text>
        </g>
      ))}

      <line x1={geom.margeGauche} x2={geom.largeur - geom.margeDroite} y1={yBase} y2={yBase} className="histogramme-axe" />
      <line x1={geom.margeGauche} x2={geom.margeGauche} y1={geom.margeHaut} y2={yBase} className="histogramme-axe" />

      {bornesAxe.map((b) => (
        <text key={`borne-${b}`} x={xVersPixel(geom, b)} y={yBase + 16} textAnchor="middle" className="histogramme-axe-label">
          {b}
        </text>
      ))}

      {exercice.classes.map((classe, index) => {
        const xGauche = xVersPixel(geom, classe.borneInf);
        const xDroite = xVersPixel(geom, classe.borneSup);
        const hauteur = hauteurs[index] ?? 0;
        const yHaut = yVersPixel(geom, hauteur);
        return (
          <g key={`classe-${index}`}>
            <rect
              x={xGauche}
              y={yHaut}
              width={xDroite - xGauche}
              height={yBase - yHaut}
              className={`histogramme-barre${erronees[index] ? " is-erronee" : ""}`}
            />
            <text x={(xGauche + xDroite) / 2} y={yHaut - 6} textAnchor="middle" className="histogramme-hauteur-label">
              {hauteur}
            </text>
            <rect
              x={xGauche}
              y={geom.margeHaut}
              width={xDroite - xGauche}
              height={yBase - geom.margeHaut}
              className="histogramme-zone-drag"
              onPointerDown={(e) => gererPointerDown(index, e)}
              onPointerMove={(e) => gererPointerMove(index, e)}
              onPointerUp={gererPointerFin}
              onPointerCancel={gererPointerFin}
            />
          </g>
        );
      })}
    </svg>
  );
}
