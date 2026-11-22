import type { ExerciceSectionPlaneSolide } from "../../core/sectionPlaneSolide.types";
import { elementsConstructionAuxiliaire, pointsExtraConnus, segmentsExtraTraces } from "../../ui/formatSectionPlaneSolide";
import { calculerAretesAvecVisibilite, calculerEchelleProjection, calculerLabelsSommetsPixel, calculerSommetsPixel, HAUTEUR_SVG, LARGEUR_SVG, projeter3DVersPixel } from "../../ui/solide3DSketch";

/**
 * Croquis papier de gen40 et ordre des lettres de la résolution de référence — sans `docx` (importé
 * par l'adaptateur ET par le corrigé détaillé, donc par l'appli). Sorti de `exportEvaluation.ts` à
 * la migration « comme au tableau ».
 */

const COULEUR_ARETE = "#1a1a2e";
const COULEUR_ARETE_CACHEE = "#adb5bd";

/** Ordre de DÉCOUVERTE de la résolution de référence (`exercice.resolutionReference`, calculée à la
 * génération) : P, Q, R, puis chaque point auxiliaire dans l'ordre où la correction le construit —
 * pour que les lettres S, T, … de la figure suivent exactement le texte de la correction. */
export function ordreLabelsDepuisExercice(exercice: ExerciceSectionPlaneSolide): number[] {
  const ordre: number[] = [...exercice.idsDepart];
  for (const etape of exercice.resolutionReference) {
    if (etape.type === "auxiliaire" && !ordre.includes(etape.pointCible)) ordre.push(etape.pointCible);
  }
  for (const id of exercice.ordreCyclique) if (!ordre.includes(id)) ordre.push(id); // garde défensive
  return ordre;
}

/** `ordreCyclique`, re-décalé pour commencer par P (id `idsDepart[0]`) — même cycle, juste plus
 * lisible en correction papier ("P → … → P") qu'un point de départ arbitraire. */
export function ordreCycliqueDepuisP(exercice: ExerciceSectionPlaneSolide): number[] {
  const { idsDepart, ordreCyclique } = exercice;
  const indexP = ordreCyclique.indexOf(idsDepart[0]);
  return [...ordreCyclique.slice(indexP), ...ordreCyclique.slice(0, indexP)];
}

/** Clés `"a-b"` (a<b, même convention que `segmentsExtraTraces`) des `k` segments qui referment le
 * polygone de section — une paire par arête du cycle `ordreCyclique`. */
export function segmentsPolygoneCles(exercice: ExerciceSectionPlaneSolide): string[] {
  const { ordreCyclique } = exercice;
  const n = ordreCyclique.length;
  return ordreCyclique.map((id, i) => {
    const suivant = ordreCyclique[(i + 1) % n];
    return id < suivant ? `${id}-${suivant}` : `${suivant}-${id}`;
  });
}

const INDICES = ["₁", "₂", "₃", "₄", "₅", "₆"];

export function nomPointAuxiliaire(rang: number): string {
  return `I${INDICES[rang] ?? rang + 1}`;
}

interface Pixel {
  x: number;
  y: number;
}

/** Cadre de la figure : le cadre habituel du croquis, élargi si besoin pour contenir les points
 * auxiliaires de la correction (jamais coupés). */
function cadreFigure(extra: Pixel[]): { x: number; y: number; largeur: number; hauteur: number } {
  const marge = 22;
  const xs = [0, LARGEUR_SVG, ...extra.map((p) => p.x - marge), ...extra.map((p) => p.x + marge)];
  const ys = [0, HAUTEUR_SVG, ...extra.map((p) => p.y - marge), ...extra.map((p) => p.y + marge)];
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, largeur: Math.max(...xs) - x, hauteur: Math.max(...ys) - y };
}

/** Position d'étiquette décalée radialement vers l'EXTÉRIEUR du solide (même principe que les
 * étiquettes de sommet, `calculerLabelsSommetsPixel`) — jamais posée sur une arête (audit
 * chapitre 8, point 26). */
function positionEtiquette(p: Pixel, centre: Pixel, distance = 14): Pixel {
  const dx = p.x - centre.x;
  const dy = p.y - centre.y;
  const longueur = Math.hypot(dx, dy) || 1;
  return { x: p.x + (dx / longueur) * distance, y: p.y + (dy / longueur) * distance + 4 };
}

/** Solide en perspective cavalière (arêtes + sommets nommés), TOUJOURS affiché — géométrie
 * intégralement issue de `ui/solide3DSketch.ts`, jamais recalculée ici. */
function construireSvgSolide(exercice: ExerciceSectionPlaneSolide): string {
  const { solide } = exercice;
  const sommetsPixel = calculerSommetsPixel(solide);
  const labelsSommetsPixel = calculerLabelsSommetsPixel(solide);
  const aretes = calculerAretesAvecVisibilite(solide);

  const ligne = (p1: Pixel, p2: Pixel, attributs: string) =>
    `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" ${attributs}/>`;

  const aretesCacheesHtml = aretes
    .filter((a) => !a.visible)
    .map((a) => ligne(sommetsPixel[a.sommets[0]], sommetsPixel[a.sommets[1]], `stroke="${COULEUR_ARETE_CACHEE}" stroke-width="1.5" stroke-dasharray="4 3"`))
    .join("");

  const aretesVisiblesHtml = aretes
    .filter((a) => a.visible)
    .map((a) => ligne(sommetsPixel[a.sommets[0]], sommetsPixel[a.sommets[1]], `stroke="${COULEUR_ARETE}" stroke-width="1.75"`))
    .join("");

  const sommetsHtml = Object.entries(sommetsPixel)
    .map(([nom, p]) => {
      const label = labelsSommetsPixel[nom];
      return (
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.5" fill="${COULEUR_ARETE}"/>` +
        `<text x="${label.x.toFixed(1)}" y="${label.y.toFixed(1)}" font-size="13" font-weight="700" fill="${COULEUR_ARETE}">${nom}</text>`
      );
    })
    .join("");

  return `${aretesCacheesHtml}${aretesVisiblesHtml}${sommetsHtml}`;
}

/** Points de section à afficher (P/Q/R seuls en énoncé, tous en correction) + segments de fermeture
 * du polygone (correction : pointillés sur les faces cachées) + constructions auxiliaires de la
 * résolution de référence (correction : points I₁, I₂… et droites prolongées). Positions issues de
 * `pointsExtraConnus`/`segmentsExtraTraces`/`elementsConstructionAuxiliaire`
 * (`ui/formatSectionPlaneSolide.ts`, couleurs inline), projetées dans le MÊME repère pixel que le
 * solide via `projeter3DVersPixel(_, calculerEchelleProjection(solide))`. */
export function construireSvgSectionPlaneSolide(exercice: ExerciceSectionPlaneSolide, avecSection: boolean): string {
  const echelleProjection = calculerEchelleProjection(exercice.solide);
  const projeter = (p: Parameters<typeof projeter3DVersPixel>[0]) => projeter3DVersPixel(p, echelleProjection);
  const ordreLabels = ordreLabelsDepuisExercice(exercice);
  const idsAffiches = avecSection ? ordreLabels : exercice.idsDepart;
  const sommetsPixel = Object.values(calculerSommetsPixel(exercice.solide));
  const centre = { x: sommetsPixel.reduce((s, p) => s + p.x, 0) / sommetsPixel.length, y: sommetsPixel.reduce((s, p) => s + p.y, 0) / sommetsPixel.length };

  let segmentsHtml = "";
  let constructionsHtml = "";
  const pointsAuxiliairesPixel: Pixel[] = [];
  if (avecSection) {
    segmentsHtml = segmentsExtraTraces(exercice, segmentsPolygoneCles(exercice))
      .map((segment) => {
        const p1 = projeter(segment.a);
        const p2 = projeter(segment.b);
        const tirets = segment.pointille ? ` stroke-dasharray="6 4"` : "";
        return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${segment.couleur}" stroke-width="3" stroke-linecap="round"${tirets}/>`;
      })
      .join("");

    let rang = 0;
    for (const etape of exercice.resolutionReference) {
      if (etape.type !== "auxiliaire") continue;
      const connusAvant = ordreLabels.slice(0, ordreLabels.indexOf(etape.pointCible));
      const { segments, points } = elementsConstructionAuxiliaire(exercice, connusAvant, etape.ligne1, etape.ligne2, etape);
      constructionsHtml += segments
        .map((segment) => {
          const p1 = projeter(segment.a);
          const p2 = projeter(segment.b);
          return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${segment.couleur}" stroke-width="1.5" stroke-dasharray="5 3"/>`;
        })
        .join("");
      const I = points[0];
      if (I) {
        const p = projeter(I.position);
        pointsAuxiliairesPixel.push(p);
        const etiquette = positionEtiquette(p, centre);
        constructionsHtml +=
          `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${I.couleur}" stroke="#ffffff" stroke-width="1.5"/>` +
          `<text x="${etiquette.x.toFixed(1)}" y="${etiquette.y.toFixed(1)}" font-size="12" font-weight="700" fill="${I.couleur}" text-anchor="middle">${nomPointAuxiliaire(rang)}</text>`;
      }
      rang++;
    }
  }

  const pointsHtml = pointsExtraConnus(exercice, ordreLabels)
    .filter((_, index) => idsAffiches.includes(ordreLabels[index]))
    .map((point) => {
      const p = projeter(point.position);
      const etiquette = positionEtiquette(p, centre);
      return (
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="${point.couleur}" stroke="#ffffff" stroke-width="1.5"/>` +
        `<text x="${etiquette.x.toFixed(1)}" y="${etiquette.y.toFixed(1)}" font-size="12" font-weight="700" fill="${point.couleur}" text-anchor="middle">${point.label}</text>`
      );
    })
    .join("");

  const cadre = cadreFigure(pointsAuxiliairesPixel);
  const largeurAffichee = Math.min(cadre.largeur, 520);
  const hauteurAffichee = (cadre.hauteur * largeurAffichee) / cadre.largeur;
  return `<svg width="${largeurAffichee.toFixed(0)}" height="${hauteurAffichee.toFixed(0)}" viewBox="${cadre.x.toFixed(1)} ${cadre.y.toFixed(1)} ${cadre.largeur.toFixed(1)} ${cadre.hauteur.toFixed(1)}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;border:1px solid #e6e6f0;border-radius:8px;background:#ffffff;">
<rect x="${cadre.x.toFixed(1)}" y="${cadre.y.toFixed(1)}" width="${cadre.largeur.toFixed(1)}" height="${cadre.hauteur.toFixed(1)}" fill="#ffffff"/>
${construireSvgSolide(exercice)}
${constructionsHtml}
${segmentsHtml}
${pointsHtml}
</svg>`;
}

