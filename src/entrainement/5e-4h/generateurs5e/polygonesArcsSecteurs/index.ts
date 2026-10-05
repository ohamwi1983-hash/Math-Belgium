/**
 * Couche A (5e) — 5gen7 ("Polygones, arcs et secteurs : lecture de diagramme"). r et n tirés
 * indépendamment ; les écrans 3 ("arc multi-pas") et 5 ("secteur multi-pas") sont chacun inclus
 * avec probabilité 50%, INDÉPENDAMMENT l'un de l'autre (spec : "tiré aléatoirement, présent ou
 * non", jamais dit qu'ils devraient partager la même paire de sommets — voir CLAUDE.md section
 * 5gen7 pour la discussion complète de ce choix).
 */
import type { ExercicePolygonesArcsSecteurs, SegmentMultiPas } from "../../core5e/polygonesArcsSecteurs.types";

const R_MIN = 1;
const R_MAX = 5;
const N_MIN = 5;
const N_MAX = 12;
const PROBABILITE_ECRAN_OPTIONNEL = 0.5;

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function circonference(r: number): number {
  return 2 * Math.PI * r;
}
export function aireCercle(r: number): number {
  return Math.PI * r * r;
}
export function longueurArc(r: number, n: number, k: number): number {
  return (k * 2 * Math.PI * r) / n;
}
export function aireSecteur(r: number, n: number, k: number): number {
  return (k * Math.PI * r * r) / n;
}

/** Tire une paire de sommets à k crans d'écart (2 ≤ k ≤ floor(n/2)) — toujours réalisable pour
 * n≥5 (floor(n/2)≥2). */
export function tirerSegmentMultiPas(n: number): SegmentMultiPas {
  const indexDepart = entierAleatoire(0, n - 1);
  const kMax = Math.floor(n / 2);
  const k = entierAleatoire(2, kMax);
  const indexArrivee = (indexDepart + k) % n;
  return { indexDepart, indexArrivee, k };
}

/** Force la présence des 2 écrans optionnels ("arc multi-pas"/"secteur multi-pas") plutôt que de
 * la tirer aléatoirement — voir le panneau dev-only (`SelecteurVarianteDev`), CLAUDE.md section
 * 5gen7 : le seul point de tirage de haut niveau réellement présent dans ce générateur. */
export function construireAvecPresence(arcMultiPas: boolean, secteurMultiPas: boolean): ExercicePolygonesArcsSecteurs {
  const r = entierAleatoire(R_MIN, R_MAX);
  const n = entierAleatoire(N_MIN, N_MAX);
  return {
    r,
    n,
    arcMultiPas: arcMultiPas ? tirerSegmentMultiPas(n) : null,
    secteurMultiPas: secteurMultiPas ? tirerSegmentMultiPas(n) : null,
  };
}

export function genererExercicePolygonesArcsSecteurs(): ExercicePolygonesArcsSecteurs {
  return construireAvecPresence(Math.random() < PROBABILITE_ECRAN_OPTIONNEL, Math.random() < PROBABILITE_ECRAN_OPTIONNEL);
}
