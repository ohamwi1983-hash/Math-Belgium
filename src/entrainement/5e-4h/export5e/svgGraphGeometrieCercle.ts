import type { ExerciceGeometrieCercle } from "../core5e/geometrieCercle.types";
import {
  CENTRE,
  HAUTEUR_CADRE_LENTILLE,
  LARGEUR_CADRE_LENTILLE,
  RAYON_MAX_PIXEL,
  TAILLE_CADRE,
  calculerCroquisLentille,
  calculerCroquisSecteurBalaye,
  calculerCroquisSegmentCirculaire,
} from "../ui5e/geometrieCercleSketch";

/**
 * Habillage `5gen12`-spécifique (Problèmes de géométrie du cercle) du croquis SVG pour la feuille
 * d'exercices/d'évaluation imprimée — même rôle que `export/svgGraphCyclo.ts` pour 6gen5 : rejoue en
 * `<svg>` STATIQUE (jamais React/Mafs, voir `export/svgGraph.ts`) exactement le même tracé que
 * `components5e/GeometrieCercleSketch.tsx` (mêmes fonctions pures `ui5e/geometrieCercleSketch.ts`,
 * mêmes couleurs/libellés), injecté via `SectionExercice.enteteHtml`/`BlocCorrection` de type
 * `"html"` (pipeline HTML de l'évaluation uniquement, `export/assemblerEvaluationHtml.ts` — voir les
 * classes `.geometrie-cercle-conteneur`/`.geometrie-cercle-label` qui y sont ajoutées). Sans ce
 * fichier, le croquis — introduit après coup par `feat(5gen12): croquis SVG sur mesure pour les 3
 * variantes` pour l'écran interactif — n'apparaissait jamais sur la copie papier, faute d'un
 * `enteteHtml` branché côté `generateurs5e/geometrieCercle/exportEvaluation.ts`.
 */

const COULEUR_TRAIT = "#495057";
const COULEUR_ZONE = "#f08c00";

function svgSecteurBalaye(exercice: Extract<ExerciceGeometrieCercle, { scenario: "secteurBalaye" }>): string {
  const c = calculerCroquisSecteurBalaye(exercice);
  return `
<svg viewBox="0 0 ${TAILLE_CADRE} ${TAILLE_CADRE}" width="100%" height="${TAILLE_CADRE}" role="img" aria-label="Secteur balayé d'angle θ=${exercice.thetaDeg}° entre les rayons r1=${exercice.r1} et r2=${exercice.r2}">
  <line x1="${c.pivot.x}" y1="${c.pivot.y}" x2="${c.rayonExterieurDepart.x}" y2="${c.rayonExterieurDepart.y}" stroke="${COULEUR_TRAIT}" stroke-width="1.4" stroke-dasharray="4 4"/>
  <line x1="${c.pivot.x}" y1="${c.pivot.y}" x2="${c.rayonExterieurArrivee.x}" y2="${c.rayonExterieurArrivee.y}" stroke="${COULEUR_TRAIT}" stroke-width="1.4" stroke-dasharray="4 4"/>
  <path d="${c.cheminZoneBalayee}" fill="${COULEUR_ZONE}" fill-opacity="0.35" stroke="${COULEUR_ZONE}" stroke-width="2" stroke-linejoin="round"/>
  <path d="${c.cheminAngle}" fill="none" stroke="${COULEUR_TRAIT}" stroke-width="1.5"/>
  <circle cx="${c.pivot.x}" cy="${c.pivot.y}" r="3" fill="${COULEUR_TRAIT}"/>
  <text x="${c.labelTheta.x}" y="${c.labelTheta.y}" text-anchor="middle" dominant-baseline="middle" class="geometrie-cercle-label" font-style="italic">θ</text>
  <text x="${c.labelR1.x}" y="${c.labelR1.y}" text-anchor="middle" dominant-baseline="middle" class="geometrie-cercle-label">r<tspan baseline-shift="sub" font-size="10">1</tspan></text>
  <text x="${c.labelR2.x}" y="${c.labelR2.y}" text-anchor="middle" dominant-baseline="middle" class="geometrie-cercle-label">r<tspan baseline-shift="sub" font-size="10">2</tspan></text>
</svg>`;
}

function svgSegmentCirculaire(exercice: Extract<ExerciceGeometrieCercle, { scenario: "segmentCirculaire" }>): string {
  const c = calculerCroquisSegmentCirculaire(exercice);
  return `
<svg viewBox="0 0 ${TAILLE_CADRE} ${TAILLE_CADRE}" width="100%" height="${TAILLE_CADRE}" role="img" aria-label="Segment circulaire de rayon r=${exercice.r} et corde c=${exercice.c}">
  <circle cx="${CENTRE.x}" cy="${CENTRE.y}" r="${RAYON_MAX_PIXEL}" fill="none" stroke="${COULEUR_TRAIT}" stroke-width="1.5"/>
  <line x1="${c.centre.x}" y1="${c.centre.y}" x2="${c.pointDepart.x}" y2="${c.pointDepart.y}" stroke="${COULEUR_TRAIT}" stroke-width="1.4" stroke-dasharray="4 4"/>
  <line x1="${c.centre.x}" y1="${c.centre.y}" x2="${c.pointArrivee.x}" y2="${c.pointArrivee.y}" stroke="${COULEUR_TRAIT}" stroke-width="1.4" stroke-dasharray="4 4"/>
  <path d="${c.cheminSegment}" fill="${COULEUR_ZONE}" fill-opacity="0.35" stroke="${COULEUR_ZONE}" stroke-width="2" stroke-linejoin="round"/>
  <path d="${c.cheminAngle}" fill="none" stroke="${COULEUR_TRAIT}" stroke-width="1.5"/>
  <circle cx="${c.centre.x}" cy="${c.centre.y}" r="3" fill="${COULEUR_TRAIT}"/>
  <text x="${c.labelTheta.x}" y="${c.labelTheta.y}" text-anchor="middle" dominant-baseline="middle" class="geometrie-cercle-label" font-style="italic">θ</text>
  <text x="${c.labelR.x}" y="${c.labelR.y}" text-anchor="middle" dominant-baseline="middle" class="geometrie-cercle-label" font-style="italic">r</text>
  <text x="${c.labelC.x}" y="${c.labelC.y}" text-anchor="middle" dominant-baseline="middle" class="geometrie-cercle-label" font-style="italic">c</text>
</svg>`;
}

function svgLentille(exercice: Extract<ExerciceGeometrieCercle, { scenario: "lentille" }>): string {
  const c = calculerCroquisLentille(exercice);
  return `
<svg viewBox="0 0 ${LARGEUR_CADRE_LENTILLE} ${HAUTEUR_CADRE_LENTILLE}" width="100%" height="${HAUTEUR_CADRE_LENTILLE}" role="img" aria-label="Lentille formée de 2 cercles sécants, r1=${exercice.segment1.r}, r2=${exercice.segment2.r}, corde commune c=${exercice.c}">
  <circle cx="${c.centre1.x}" cy="${c.centre1.y}" r="${c.rayon1Pixel}" fill="none" stroke="${COULEUR_TRAIT}" stroke-width="1.2" stroke-dasharray="4 4"/>
  <circle cx="${c.centre2.x}" cy="${c.centre2.y}" r="${c.rayon2Pixel}" fill="none" stroke="${COULEUR_TRAIT}" stroke-width="1.2" stroke-dasharray="4 4"/>
  <line x1="${c.pointA.x}" y1="${c.pointA.y}" x2="${c.pointB.x}" y2="${c.pointB.y}" stroke="${COULEUR_TRAIT}" stroke-width="1.6"/>
  <line x1="${c.centre1.x}" y1="${c.centre1.y}" x2="${c.pointA.x}" y2="${c.pointA.y}" stroke="${COULEUR_TRAIT}" stroke-width="1.4" stroke-dasharray="4 4"/>
  <line x1="${c.centre2.x}" y1="${c.centre2.y}" x2="${c.pointB.x}" y2="${c.pointB.y}" stroke="${COULEUR_TRAIT}" stroke-width="1.4" stroke-dasharray="4 4"/>
  <path d="${c.cheminLentille}" fill="${COULEUR_ZONE}" fill-opacity="0.35" stroke="${COULEUR_ZONE}" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="${c.centre1.x}" cy="${c.centre1.y}" r="3" fill="${COULEUR_TRAIT}"/>
  <circle cx="${c.centre2.x}" cy="${c.centre2.y}" r="3" fill="${COULEUR_TRAIT}"/>
  <text x="${c.labelR1.x}" y="${c.labelR1.y}" text-anchor="middle" dominant-baseline="middle" class="geometrie-cercle-label">r<tspan baseline-shift="sub" font-size="10">1</tspan></text>
  <text x="${c.labelR2.x}" y="${c.labelR2.y}" text-anchor="middle" dominant-baseline="middle" class="geometrie-cercle-label">r<tspan baseline-shift="sub" font-size="10">2</tspan></text>
  <text x="${c.labelC.x}" y="${c.labelC.y}" text-anchor="middle" dominant-baseline="middle" class="geometrie-cercle-label" font-style="italic">c</text>
</svg>`;
}

/** Construit le croquis SVG + son conteneur (`<div class="geometrie-cercle-conteneur">`), prêt à
 * injecter tel quel dans `SectionExercice.enteteHtml`/`BlocCorrection` de type `"html"`. */
export function construireSvgGeometrieCercle(exercice: ExerciceGeometrieCercle): string {
  switch (exercice.scenario) {
    case "secteurBalaye":
      return `<div class="geometrie-cercle-conteneur">${svgSecteurBalaye(exercice)}</div>`;
    case "segmentCirculaire":
      return `<div class="geometrie-cercle-conteneur">${svgSegmentCirculaire(exercice)}</div>`;
    case "lentille":
      return `<div class="geometrie-cercle-conteneur geometrie-cercle-conteneur-large">${svgLentille(exercice)}</div>`;
  }
}
