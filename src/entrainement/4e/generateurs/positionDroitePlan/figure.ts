import type { ExercicePositionDroitePlan } from "../../core/positionDroitePlan.types";
import type { Point3D } from "../../core/geometrieEspace.types";
import {
  calculerEchelleProjection,
  calculerGeometrieSolide3D,
  calculerPolygonePlan,
  calculerSegmentsDroite,
  HAUTEUR_SVG,
  LARGEUR_SVG,
  positionLabelExterieur,
  projeter3DVersPixel,
} from "../../ui/solide3DSketch";

/**
 * Croquis papier de gen39 (sans `docx` : importé par l'adaptateur ET par le corrigé détaillé, donc
 * par l'appli). Sorti de `exportEvaluation.ts` à la migration « comme au tableau » ; option
 * `reponse` (corrigé) : la droite du plan parallèle à la droite (vert) ou le point de percée K (vert).
 */

export interface ReponseFigurePositionDroitePlan {
  segment?: [Point3D, Point3D];
  point?: { position: Point3D; label: string };
}

// ============================================================================
// Diagramme SVG — croquis en perspective cavalière, plan + droite mis en évidence.
// ============================================================================

const COULEUR_TRAIT = "#1b1c2b"; // --color-text (thème clair, src/index.css)
const COULEUR_PLAN = "#6d28d9"; // --color-primary (thème clair)
const COULEUR_DROITE = "#e8590c"; // .solide3d-droite (App.css) — couleur fixe, jamais liée au thème
const COULEUR_BORDURE = "#e6e6f0"; // --color-border (thème clair)
const COULEUR_REPONSE = "#2b8a3e"; // réponse du corrigé (vert)

/**
 * `<svg>` autonome du croquis en perspective cavalière de gen39 — mêmes 5 calques que
 * `components/Solide3DSketch.tsx` (arêtes cachées pointillées, polygone du plan, arêtes visibles,
 * droite surlignée, labels de sommets), en attributs SVG littéraux (voir le commentaire de tête pour
 * pourquoi). Voir aussi le commentaire de tête pour la réutilisation exclusive des fonctions pures de
 * `ui/solide3DSketch.ts`.
 */
export function construireSvgPositionDroitePlan(exercice: ExercicePositionDroitePlan, reponse?: ReponseFigurePositionDroitePlan): string {
  const { solide, plan, droite } = exercice;
  const geometrie = calculerGeometrieSolide3D(solide);
  const polygonePlan = calculerPolygonePlan(solide, plan);

  const aretesCachees = geometrie.aretes.filter((a) => !a.visible);
  const aretesVisibles = geometrie.aretes.filter((a) => a.visible);

  const ligneArete = (sommets: [string, string], style: "pleine" | "pointille"): string => {
    const [n1, n2] = sommets;
    const p1 = geometrie.sommetsPixel[n1];
    const p2 = geometrie.sommetsPixel[n2];
    const traitPointille = style === "pointille" ? ' stroke-dasharray="4 3"' : "";
    const epaisseur = style === "pointille" ? 1.5 : 1.75;
    return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${COULEUR_TRAIT}" stroke-width="${epaisseur}"${traitPointille}/>`;
  };

  const aretesCacheesHtml = aretesCachees.map((a) => ligneArete(a.sommets, "pointille")).join("");
  const aretesVisiblesHtml = aretesVisibles.map((a) => ligneArete(a.sommets, "pleine")).join("");

  const planHtml =
    polygonePlan.length >= 3
      ? `<polygon points="${polygonePlan.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}" fill="${COULEUR_PLAN}" fill-opacity="0.28" stroke="${COULEUR_PLAN}" stroke-width="2" stroke-linejoin="round"/>`
      : "";

  // Droite prolongée au-delà de ses 2 points, partie cachée par le solide en pointillé — même
  // découpage que l'écran (`calculerSegmentsDroite`, audit chapitre 8).
  const position = (nom: string) => solide.sommets[nom] ?? exercice.pointsNommes.find((p) => p.nom === nom)!.position;
  const droiteHtml = calculerSegmentsDroite(solide, position(droite[0]), position(droite[1]))
    .map(
      (seg) =>
        `<line x1="${seg.x1.toFixed(1)}" y1="${seg.y1.toFixed(1)}" x2="${seg.x2.toFixed(1)}" y2="${seg.y2.toFixed(1)}" stroke="${COULEUR_DROITE}" stroke-width="${seg.cache ? 2.25 : 3}"${seg.cache ? ' stroke-dasharray="6 5"' : ' stroke-linecap="round"'}/>`,
    )
    .join("");

  // Milieux nommés (I, J) — étiquette décalée vers l'extérieur du solide.
  const echelle = calculerEchelleProjection(solide);
  const pointsNommesHtml = exercice.pointsNommes
    .map((p) => {
      const pixel = projeter3DVersPixel(p.position, echelle);
      const label = positionLabelExterieur(solide, p.position);
      return `<circle cx="${pixel.x.toFixed(1)}" cy="${pixel.y.toFixed(1)}" r="3.5" fill="${COULEUR_TRAIT}"/><text x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}" font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${COULEUR_TRAIT}">${p.nom}</text>`;
    })
    .join("");

  const labelsHtml = Object.entries(geometrie.sommetsPixel)
    .map(([nom, p]) => {
      const label = geometrie.labelsSommetsPixel[nom];
      return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.5" fill="${COULEUR_TRAIT}"/><text x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}" font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${COULEUR_TRAIT}">${nom}</text>`;
    })
    .join("");

  const echelleReponse = calculerEchelleProjection(solide);
  const px = (p: Point3D) => projeter3DVersPixel(p, echelleReponse);
  let reponseHtml = "";
  if (reponse?.segment) {
    const [p1, p2] = reponse.segment.map(px);
    reponseHtml += `<line x1="${p1!.x.toFixed(1)}" y1="${p1!.y.toFixed(1)}" x2="${p2!.x.toFixed(1)}" y2="${p2!.y.toFixed(1)}" stroke="${COULEUR_REPONSE}" stroke-width="4" stroke-linecap="round"/>`;
  }
  if (reponse?.point) {
    const p = px(reponse.point.position);
    const l = positionLabelExterieur(solide, reponse.point.position, 16);
    reponseHtml += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${COULEUR_REPONSE}" stroke="#ffffff" stroke-width="1.5"/>`;
    if (reponse.point.label) reponseHtml += `<text x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" font-size="13" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="${COULEUR_REPONSE}">${reponse.point.label}</text>`;
  }

  return `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:10px auto 16px;max-width:380px;width:100%;border:1px solid ${COULEUR_BORDURE};border-radius:8px;background:#ffffff;" role="img" aria-label="Représentation en perspective cavalière du solide, plan et droite mis en évidence">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${aretesCacheesHtml}
${planHtml}
${aretesVisiblesHtml}
${droiteHtml}
${labelsHtml}
${pointsNommesHtml}
${reponseHtml}
</svg>`;
}

