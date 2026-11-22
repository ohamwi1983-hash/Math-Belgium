import type { ExerciceOmbreLampe } from "../../core/ombreLampe.types";
import { elementsConclusion, elementsScene, solidePourAffichage } from "../../ui/formatOmbreLampe";
import type { ElementsCroquis } from "../../ui/formatOmbreLampe";
import { calculerEchelleProjection, HAUTEUR_SVG, LARGEUR_SVG, projeter3DVersPixel } from "../../ui/solide3DSketch";

/**
 * Figures papier de gen106 (énoncé et construction complète), sans `docx` : importées par l'adaptateur
 * ET par le corrigé détaillé (partagé avec l'appli). Même géométrie et mêmes éléments de croquis qu'à
 * l'écran (`ui/formatOmbreLampe.ts`) ; seule la rastérisation en `<svg>` à attributs inline est écrite ici.
 */

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function figureSvg(e: ExerciceOmbreLampe, elements: ElementsCroquis, legende: string): string {
  const echelle = calculerEchelleProjection(solidePourAffichage(e));
  const traits = elements.segments
    .map((s) => {
      const p1 = projeter3DVersPixel(s.a, echelle);
      const p2 = projeter3DVersPixel(s.b, echelle);
      const pointille = s.pointille ? ` stroke-dasharray="5 4"` : "";
      return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${s.couleur}" stroke-width="1.8"${pointille}/>`;
    })
    .join("");
  const points = elements.points
    .map((pt) => {
      const p = projeter3DVersPixel(pt.position, echelle);
      const l = pt.decalageLabel ? { x: p.x + pt.decalageLabel.x, y: p.y + pt.decalageLabel.y + 4 } : { x: p.x, y: p.y - 8 };
      const rayon = Math.min(pt.rayon ?? 3.5, 3.5);
      return (
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${rayon}" fill="${pt.couleur}"/>` +
        `<text x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" font-size="13" font-weight="700" text-anchor="middle" fill="${pt.couleur}" stroke="#ffffff" stroke-width="3" paint-order="stroke">${echapper(pt.label)}</text>`
      );
    })
    .join("");
  const svg = `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${echapper(legende)}">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${traits}
${points}
</svg>`;
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}</div>`;
}

export const figureEnonce = (e: ExerciceOmbreLampe) => figureSvg(e, elementsScene(e), "Scène en perspective cavalière — ombre à la lampe");
export const figureCorrigee = (e: ExerciceOmbreLampe) => figureSvg(e, elementsConclusion(e), "Construction complète — ombre à la lampe");

