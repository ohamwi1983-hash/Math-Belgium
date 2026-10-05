/**
 * Couche présentation (5e) — géométrie du croquis SVG sur mesure de 5gen12 ("Problèmes de
 * géométrie du cercle"). SVG sur mesure (jamais Mafs — voir CLAUDE.md/`docs/conventions-
 * transversales.md`, "Choix du rendu graphique") : θ/r₁/r₂/c sont déjà donnés en toutes lettres
 * dans le bloc de données de l'écran, le croquis n'est qu'une illustration de la géométrie
 * relative, jamais une source de lecture de coordonnées pour l'élève.
 *
 * Croquis PROPORTIONNÉ (pas schématique, voir la même convention) : θ est l'angle RÉEL de
 * l'instance (un secteur de 35° doit ressembler à 35°, pas à un angle arbitraire fixe), et le
 * rapport r₂/r₁ (ou r₁/r₂ pour la lentille) est préservé par une échelle UNIFORME — seule
 * l'échelle absolue (le nombre de pixels par unité) est arbitraire, fixée pour que le plus grand
 * rayon de chaque croquis occupe tout le cadre disponible.
 */
import type { ExerciceLentille, ExerciceSecteurBalaye, ExerciceSegmentCirculaire } from "../core5e/geometrieCercle.types";

export interface PointSVG {
  x: number;
  y: number;
}

// ============================================================================
// Secteur balayé (A1) + segment circulaire (A3) — même cadre carré, même pivot centré.
// ============================================================================

export const TAILLE_CADRE = 260;
export const CENTRE = { x: 130, y: 130 };
export const RAYON_MAX_PIXEL = 90;

function pointPolaire(centre: PointSVG, rayon: number, angleDeg: number): PointSVG {
  const angleRad = (angleDeg * Math.PI) / 180;
  return { x: centre.x + rayon * Math.cos(angleRad), y: centre.y + rayon * Math.sin(angleRad) };
}

export interface CroquisSecteurBalaye {
  cheminZoneBalayee: string;
  pivot: PointSVG;
  rayonExterieurDepart: PointSVG;
  rayonExterieurArrivee: PointSVG;
  cheminAngle: string;
  labelTheta: PointSVG;
  labelR1: PointSVG;
  labelR2: PointSVG;
}

/**
 * θ∈[10°;350°] par construction (`generateurs5e/geometrieCercle/secteurBalaye.ts`) — le repli en
 * grand arc (`grandArc`) n'est donc PAS un cas théorique à couvrir "au cas où" : il est
 * effectivement atteint dès que θ>180°, contrairement au segment/à la lentille (θ toujours <180°
 * par construction côté `tirerRC`/`tirerR1R2C`, voir ci-dessous). Secteur bissecté verticalement
 * (pivot au centre du cadre, bissectrice à 270° = "vers le haut" en repère écran Y-vers-le-bas) —
 * fonctionne sans cas particulier même pour θ proche de 350° (le secteur balayé occupe alors la
 * quasi-totalité du disque, ne laissant qu'une fine tranche non balayée en bas — géométriquement
 * correct, pas un artefact).
 */
export function calculerCroquisSecteurBalaye(exercice: ExerciceSecteurBalaye): CroquisSecteurBalaye {
  const echelle = RAYON_MAX_PIXEL / exercice.r1;
  const r1px = RAYON_MAX_PIXEL;
  const r2px = exercice.r2 * echelle;
  const demiTheta = exercice.thetaDeg / 2;
  const depart = 270 - demiTheta;
  const arrivee = 270 + demiTheta;
  const grandArc = exercice.thetaDeg > 180 ? 1 : 0;

  const exterieurDepart = pointPolaire(CENTRE, r1px, depart);
  const exterieurArrivee = pointPolaire(CENTRE, r1px, arrivee);
  const interieurDepart = pointPolaire(CENTRE, r2px, depart);
  const interieurArrivee = pointPolaire(CENTRE, r2px, arrivee);

  const cheminZoneBalayee = [
    `M ${exterieurDepart.x} ${exterieurDepart.y}`,
    `A ${r1px} ${r1px} 0 ${grandArc} 1 ${exterieurArrivee.x} ${exterieurArrivee.y}`,
    `L ${interieurArrivee.x} ${interieurArrivee.y}`,
    `A ${r2px} ${r2px} 0 ${grandArc} 0 ${interieurDepart.x} ${interieurDepart.y}`,
    "Z",
  ].join(" ");

  const rayonMarqueurAngle = 26;
  const angleMarqueurDepart = pointPolaire(CENTRE, rayonMarqueurAngle, depart);
  const angleMarqueurArrivee = pointPolaire(CENTRE, rayonMarqueurAngle, arrivee);
  const cheminAngle = `M ${angleMarqueurDepart.x} ${angleMarqueurDepart.y} A ${rayonMarqueurAngle} ${rayonMarqueurAngle} 0 ${grandArc} 1 ${angleMarqueurArrivee.x} ${angleMarqueurArrivee.y}`;

  return {
    cheminZoneBalayee,
    pivot: CENTRE,
    rayonExterieurDepart: exterieurDepart,
    rayonExterieurArrivee: exterieurArrivee,
    cheminAngle,
    labelTheta: pointPolaire(CENTRE, 16, 270),
    labelR1: pointPolaire(CENTRE, r1px + 12, arrivee + 8),
    labelR2: pointPolaire(CENTRE, r2px + 10, depart - 8),
  };
}

export interface CroquisSegmentCirculaire {
  cheminSegment: string;
  centre: PointSVG;
  pointDepart: PointSVG;
  pointArrivee: PointSVG;
  cheminAngle: string;
  labelTheta: PointSVG;
  labelR: PointSVG;
  labelC: PointSVG;
}

/** Corde toujours horizontale, en bas du cercle (bissectrice à 90° = "vers le bas") — même
 * principe que `calculerCroquisSecteurBalaye`, rayon PIXEL du cercle FIXE (un seul cercle par
 * croquis, rien à comparer à son échelle absolue — seul θ doit rester fidèle). */
export function calculerCroquisSegmentCirculaire(exercice: ExerciceSegmentCirculaire): CroquisSegmentCirculaire {
  const rpx = RAYON_MAX_PIXEL;
  const demiTheta = exercice.thetaDeg / 2;
  const depart = 90 - demiTheta;
  const arrivee = 90 + demiTheta;
  const grandArc = exercice.thetaDeg > 180 ? 1 : 0;

  const pointDepart = pointPolaire(CENTRE, rpx, depart);
  const pointArrivee = pointPolaire(CENTRE, rpx, arrivee);
  const cheminSegment = `M ${pointDepart.x} ${pointDepart.y} A ${rpx} ${rpx} 0 ${grandArc} 1 ${pointArrivee.x} ${pointArrivee.y} Z`;

  const rayonMarqueurAngle = 28;
  const angleMarqueurDepart = pointPolaire(CENTRE, rayonMarqueurAngle, depart);
  const angleMarqueurArrivee = pointPolaire(CENTRE, rayonMarqueurAngle, arrivee);
  const cheminAngle = `M ${angleMarqueurArrivee.x} ${angleMarqueurArrivee.y} A ${rayonMarqueurAngle} ${rayonMarqueurAngle} 0 ${grandArc} 0 ${angleMarqueurDepart.x} ${angleMarqueurDepart.y}`;

  const milieuCorde = pointPolaire(CENTRE, rpx, 90);

  return {
    cheminSegment,
    centre: CENTRE,
    pointDepart,
    pointArrivee,
    cheminAngle,
    labelTheta: pointPolaire(CENTRE, 16, 90),
    labelR: pointPolaire(CENTRE, rpx * 0.62, depart - 6),
    labelC: { x: milieuCorde.x, y: milieuCorde.y + 16 },
  };
}

// ============================================================================
// Lentille (A3b) — cadre dédié plus large (2 cercles côte à côte), même patron que
// `.figure-reduction-sketch` (max-width 320px).
// ============================================================================

export const LARGEUR_CADRE_LENTILLE = 320;
export const HAUTEUR_CADRE_LENTILLE = 260;
export const CENTRE_LENTILLE = { x: 160, y: 130 };
export const RAYON_MAX_PIXEL_LENTILLE = 60;

export interface CroquisLentille {
  cheminLentille: string;
  centre1: PointSVG;
  rayon1Pixel: number;
  centre2: PointSVG;
  rayon2Pixel: number;
  pointA: PointSVG;
  pointB: PointSVG;
  labelR1: PointSVG;
  labelR2: PointSVG;
  labelC: PointSVG;
}

/**
 * Construction géométrique standard de 2 cercles sécants de rayons r₁/r₂ partageant une corde de
 * longueur c : centres alignés horizontalement de part et d'autre du milieu de la corde, à une
 * distance apothème h_i=√(r_i²−(c/2)²) de ce milieu (triangle rectangle rayon-demi_corde-apothème)
 * — construction dérivée, PAS un champ stocké sur l'exercice (c/r₁/r₂ le sont, h₁/h₂ n'ont aucun
 * intérêt pédagogique propre, jamais demandés à l'élève). `Math.max(0, ...)` sous la racine est un
 * filet de robustesse pur (jamais négatif en pratique : `tirerR1R2C` garantit c<2×min(r1,r2), donc
 * r_i>c/2 pour chaque cercle) — évite un `NaN` silencieux si cette garantie venait à être relâchée.
 */
export function calculerCroquisLentille(exercice: ExerciceLentille): CroquisLentille {
  const rMaxReel = Math.max(exercice.segment1.r, exercice.segment2.r);
  const echelle = RAYON_MAX_PIXEL_LENTILLE / rMaxReel;
  const r1px = exercice.segment1.r * echelle;
  const r2px = exercice.segment2.r * echelle;
  const demiCorde = exercice.c / 2;
  const h1 = Math.sqrt(Math.max(0, exercice.segment1.r * exercice.segment1.r - demiCorde * demiCorde));
  const h2 = Math.sqrt(Math.max(0, exercice.segment2.r * exercice.segment2.r - demiCorde * demiCorde));
  const h1px = h1 * echelle;
  const h2px = h2 * echelle;
  const demiCordePx = demiCorde * echelle;

  const { x: cx, y: cy } = CENTRE_LENTILLE;
  const pointA = { x: cx, y: cy - demiCordePx };
  const pointB = { x: cx, y: cy + demiCordePx };
  const centre1 = { x: cx - h1px, y: cy };
  const centre2 = { x: cx + h2px, y: cy };

  const cheminLentille = [
    `M ${pointA.x} ${pointA.y}`,
    `A ${r1px} ${r1px} 0 0 1 ${pointB.x} ${pointB.y}`,
    `A ${r2px} ${r2px} 0 0 1 ${pointA.x} ${pointA.y}`,
    "Z",
  ].join(" ");

  return {
    cheminLentille,
    centre1,
    rayon1Pixel: r1px,
    centre2,
    rayon2Pixel: r2px,
    pointA,
    pointB,
    labelR1: { x: (centre1.x + pointA.x) / 2, y: (centre1.y + pointA.y) / 2 - 10 },
    labelR2: { x: (centre2.x + pointB.x) / 2, y: (centre2.y + pointB.y) / 2 + 10 },
    labelC: { x: cx + 14, y: cy - 4 },
  };
}
