/**
 * Trajet de l'angle brut de l'énoncé sur le cercle trigonométrique — base géométrique commune aux
 * 3 nouvelles aides du générateur 14 (écrans "Réduction", "Angle du premier quadrant", "Signes" ;
 * promptcorrectionsgenerateur14aides.md, sections 6/7/8 : "Reprend le même cercle que l'aide de
 * l'écran Réduction"). Représente, à partir de `angleDepart` (la valeur brute, potentiellement
 * négative ou ≥360°) et `angleReduit` (déjà dans [0°,360°[), le chemin parcouru sur le cercle
 * depuis l'axe X positif (0°) jusqu'à la position finale :
 * - un simple arc si `|angleDepart| < 360°` (moins d'un tour complet) ;
 * - une spirale (polyligne à rayon croissant) si `|angleDepart| >= 360°` (un ou plusieurs tours
 *   complets) — SVG n'a pas de primitive de spirale multi-tours native, d'où l'échantillonnage.
 * Le sens de parcours (horaire/antihoraire) suit le signe de `angleDepart` — jamais recalculé
 * différemment d'un des 3 consommateurs à l'autre, cette fonction est l'unique source de vérité.
 *
 * `rayonArc` (3e paramètre, optionnel, défaut `RAYON_ARC`) — additive, ne change rien pour les
 * appelants existants (générateur 14/15) : permet à un appelant de dessiner le tracé à un rayon
 * différent du rayon standard, sans dupliquer cette fonction. Introduit par
 * `promptcorrectionrenduaidegenerateur18.md` pour "Quel angle ?" (générateur 18) — deux candidats
 * dessinés au même rayon standard se chevauchaient près du départ (0°), désormais espacés en leur
 * passant chacun un rayon légèrement différent (voir `quelAngleAide.ts::calculerAideCandidats`).
 */
import { CENTRE_CERCLE_TRIG, RAYON_CERCLE_TRIG, pointSurCercle } from "./cercleTrigGeometrie";
import type { PointCroquisCercleTrig } from "./cercleTrigGeometrie";

export type PointsPolygone = string;

export interface TrajetCercleTrig {
  type: "arc" | "spirale";
  /** Attribut `d` du `<path>` du tracé (arc ou polyligne). */
  chemin: string;
  /** Point sur le cercle à `angleReduit`, toujours au rayon plein (extrémité du rayon tracé). */
  pointFinal: PointCroquisCercleTrig;
  /** Flèche directionnelle (triangle plein) à l'extrémité du tracé, orientée selon le sens de parcours. */
  fleche: PointsPolygone;
  /** Position du label de l'angle brut — toujours à l'extérieur du cercle. */
  labelAngleBrut: PointCroquisCercleTrig;
}

export const RAYON_ARC = RAYON_CERCLE_TRIG * 0.32;
const RAYON_SPIRALE_MIN = RAYON_CERCLE_TRIG * 0.12;
const PAS_ECHANTILLONNAGE_DEGRES = 6;
const LONGUEUR_FLECHE = 9;
const DEMI_LARGEUR_FLECHE = 4.5;
const DECALAGE_LABEL_EXTERIEUR = 22;

function normaliser(v: { x: number; y: number }): { x: number; y: number } {
  const norme = Math.hypot(v.x, v.y);
  return norme === 0 ? { x: 1, y: 0 } : { x: v.x / norme, y: v.y / norme };
}

/** Triangle plein pointant vers `pointe`, orienté selon la direction (déjà normalisée) `dir`.
 * Exportée (`promptgen17gen15correctionsvisuelles.md`, B.1) : réutilisée par `cerclePremierQuadrantAide.ts`
 * pour orienter le petit arc d'angle "?" (jusqu'ici sans flèche), même geste directionnel que le
 * trajet principal — jamais un second algorithme de triangle dupliqué. */
export function construireFlecheDirectionnelle(pointe: PointCroquisCercleTrig, dir: { x: number; y: number }): PointsPolygone {
  const perp = { x: -dir.y, y: dir.x };
  const base = { x: pointe.x - dir.x * LONGUEUR_FLECHE, y: pointe.y - dir.y * LONGUEUR_FLECHE };
  const c1 = { x: base.x + perp.x * DEMI_LARGEUR_FLECHE, y: base.y + perp.y * DEMI_LARGEUR_FLECHE };
  const c2 = { x: base.x - perp.x * DEMI_LARGEUR_FLECHE, y: base.y - perp.y * DEMI_LARGEUR_FLECHE };
  return `${pointe.x},${pointe.y} ${c1.x},${c1.y} ${c2.x},${c2.y}`;
}

/** Direction tangente (unitaire) au cercle de rayon `rayon`, en `angleDegres`, dans le sens `sens`.
 * Exportée (`promptgen17gen15correctionsvisuelles.md`, B.1) — voir `construireFlecheDirectionnelle`. */
export function directionTangente(angleDegres: number, rayon: number, sens: 1 | -1): { x: number; y: number } {
  const epsilon = 0.5;
  const avant = pointSurCercle(angleDegres - sens * epsilon, rayon);
  const apres = pointSurCercle(angleDegres + sens * epsilon, rayon);
  return normaliser({ x: apres.x - avant.x, y: apres.y - avant.y });
}

export function calculerTrajetCercleTrig(angleDepart: number, angleReduit: number, rayonArc: number = RAYON_ARC): TrajetCercleTrig {
  const sens: 1 | -1 = angleDepart < 0 ? -1 : 1;
  const magnitude = Math.abs(angleDepart);

  const pointFinal = pointSurCercle(angleReduit, RAYON_CERCLE_TRIG);
  const unitAngleReduit = normaliser({ x: pointFinal.x - CENTRE_CERCLE_TRIG.x, y: pointFinal.y - CENTRE_CERCLE_TRIG.y });
  const labelAngleBrut: PointCroquisCercleTrig = {
    x: CENTRE_CERCLE_TRIG.x + unitAngleReduit.x * (RAYON_CERCLE_TRIG + DECALAGE_LABEL_EXTERIEUR),
    y: CENTRE_CERCLE_TRIG.y + unitAngleReduit.y * (RAYON_CERCLE_TRIG + DECALAGE_LABEL_EXTERIEUR),
  };

  if (magnitude < 360) {
    const depart = pointSurCercle(0, rayonArc);
    const arrivee = pointSurCercle(angleReduit, rayonArc);
    const grandArc = magnitude > 180 ? 1 : 0;
    const sweep = sens === 1 ? 0 : 1;
    const chemin = `M ${depart.x} ${depart.y} A ${rayonArc} ${rayonArc} 0 ${grandArc} ${sweep} ${arrivee.x} ${arrivee.y}`;
    const fleche = construireFlecheDirectionnelle(arrivee, directionTangente(angleReduit, rayonArc, sens));
    return { type: "arc", chemin, pointFinal, fleche, labelAngleBrut };
  }

  const points: PointCroquisCercleTrig[] = [];
  const nombrePas = Math.max(2, Math.round(magnitude / PAS_ECHANTILLONNAGE_DEGRES));
  for (let i = 0; i <= nombrePas; i++) {
    const t = (magnitude * i) / nombrePas;
    const angle = sens * t;
    const rayon = RAYON_SPIRALE_MIN + (rayonArc - RAYON_SPIRALE_MIN) * (t / magnitude);
    points.push(pointSurCercle(angle, rayon));
  }
  const chemin = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const dernier = points[points.length - 1];
  const avantDernier = points[points.length - 2];
  const direction = normaliser({ x: dernier.x - avantDernier.x, y: dernier.y - avantDernier.y });
  const fleche = construireFlecheDirectionnelle(dernier, direction);

  return { type: "spirale", chemin, pointFinal, fleche, labelAngleBrut };
}
