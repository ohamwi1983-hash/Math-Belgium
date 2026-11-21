import type { ExerciceReductionVectorielle } from "../../core/reductionVectorielle.types";
import { calculerGeometrieFigureReduction } from "../../ui/figureReductionSketch";
import { FIGURES } from "./figures";

/**
 * Figure papier de gen27 (figure de référence : arêtes, points nommés), SANS `docx` : énoncé de
 * l'adaptateur ET corrigé détaillé partagé avec l'appli. Avec `fleches` (corrigé) : la chaîne de
 * Chasles en pointillés et le vecteur réduit en trait épais, flèches pleines.
 */

const LARGEUR_SVG = 260;
const COULEUR_ARETE = "#e6e6f0";
const COULEUR_POINT = "#1b1c2b";
const COULEUR_CHAINE = "#495057";
const COULEUR_RESULTAT = "#e8590c";

export interface FlecheFigure {
  depart: string;
  arrivee: string;
  resultat?: boolean;
}

function flecheSvg(x1: number, y1: number, x2: number, y2: number, r: number, couleur: string, epais: boolean): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l;
  const uy = dy / l;
  // la pointe s'arrête au bord du point d'arrivée
  const xe = x2 - ux * r * 1.3;
  const ye = y2 - uy * r * 1.3;
  const t = r * (epais ? 3 : 2.4);
  const xb = xe - ux * t;
  const yb = ye - uy * t;
  const px = -uy * t * 0.45;
  const py = ux * t * 0.45;
  const w = (r * (epais ? 0.75 : 0.45)).toFixed(3);
  return (
    `<line x1="${(x1 + ux * r * 1.3).toFixed(3)}" y1="${(y1 + uy * r * 1.3).toFixed(3)}" x2="${xb.toFixed(3)}" y2="${yb.toFixed(3)}" stroke="${couleur}" stroke-width="${w}"${epais ? "" : ` stroke-dasharray="${(r * 1.2).toFixed(3)} ${(r * 0.8).toFixed(3)}"`}/>` +
    `<polygon points="${xe.toFixed(3)},${ye.toFixed(3)} ${(xb + px).toFixed(3)},${(yb + py).toFixed(3)} ${(xb - px).toFixed(3)},${(yb - py).toFixed(3)}" fill="${couleur}"/>`
  );
}

export function construireFigureReductionHtml(instance: ExerciceReductionVectorielle, fleches: FlecheFigure[] = []): string {
  const geom = calculerGeometrieFigureReduction(instance.points, FIGURES[instance.figure].aretes);
  const [xMin, yMin, largeur, hauteur] = geom.viewBox.split(" ").map(Number);
  const hauteurSvg = Math.round((LARGEUR_SVG / largeur) * hauteur);

  const lignes = geom.aretes
    .map(
      (a) =>
        `<line x1="${a.x1.toFixed(2)}" y1="${a.y1.toFixed(2)}" x2="${a.x2.toFixed(2)}" y2="${a.y2.toFixed(2)}" stroke="${COULEUR_ARETE}" stroke-width="${(geom.rayonPoint * 0.3).toFixed(3)}"/>`,
    )
    .join("");
  const pos = (n: string) => ({ x: instance.points[n].x, y: -instance.points[n].y });
  const traces = fleches
    .map((f) => {
      const a = pos(f.depart);
      const b = pos(f.arrivee);
      return flecheSvg(a.x, a.y, b.x, b.y, geom.rayonPoint, f.resultat ? COULEUR_RESULTAT : COULEUR_CHAINE, !!f.resultat);
    })
    .join("");
  const points = geom.points.map((p) => `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${geom.rayonPoint.toFixed(3)}" fill="${COULEUR_POINT}"/>`).join("");
  const labels = geom.points
    .map(
      (p) =>
        `<text x="${(p.x + geom.rayonPoint * 1.8).toFixed(2)}" y="${(p.y - geom.rayonPoint * 1.8).toFixed(2)}" font-size="${(geom.rayonPoint * 3.2).toFixed(2)}" font-weight="700" fill="${COULEUR_POINT}">${p.nom}</text>`,
    )
    .join("");

  return `<svg width="${LARGEUR_SVG}" height="${hauteurSvg}" viewBox="${geom.viewBox}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Figure de référence" style="display:block;margin:8px auto 14px;border:1px solid ${COULEUR_ARETE};border-radius:8px;background:#ffffff;">
<rect x="${xMin}" y="${yMin}" width="${largeur}" height="${hauteur}" fill="#ffffff"/>
${lignes}${traces}${points}${labels}
</svg>`;
}
