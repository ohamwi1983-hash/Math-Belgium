/**
 * Couche A (5e) — scénario A3 de 5gen12 ("Segment circulaire", loi des cosinus) — et brique
 * partagée par A3b ("Lentille", voir `lentille.ts`, import générateur→générateur au sein du même
 * dossier). `calculerSegmentCirculaire` est la seule source de vérité pour la dérivation
 * (r,c)→(θ,aires) — jamais dupliquée entre les 2 scénarios.
 */
import type { CalculSegmentCirculaire, ExerciceSegmentCirculaire } from "../../core5e/geometrieCercle.types";

const R_MIN = 5;
const R_MAX = 20;

/** cos θ=(2r²−c²)/(2r²) → θ (loi des cosinus sur le triangle isocèle rayon-rayon-corde). */
export function calculerSegmentCirculaire(r: number, c: number): CalculSegmentCirculaire {
  const cosTheta = (2 * r * r - c * c) / (2 * r * r);
  const thetaRad = Math.acos(cosTheta);
  const thetaDeg = (thetaRad * 180) / Math.PI;
  const aireSecteur = 0.5 * r * r * thetaRad;
  const aireTriangle = 0.5 * r * r * Math.sin(thetaRad);
  const aireSegment = aireSecteur - aireTriangle;
  return { r, c, thetaDeg, thetaRad, aireSecteur, aireTriangle, aireSegment };
}

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Tire (r,c) tel que la corde reste dans une plage lisible (θ∈]10°;170°[, jamais un segment quasi
 * dégénéré) — retry BORNÉ, même patron "for tentative in range(N)" déjà établi ailleurs sur la
 * plateforme. */
export function tirerRC(rMin: number, rMax: number): { r: number; c: number } {
  const TENTATIVES_MAX = 100;
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const r = entierAleatoire(rMin, rMax);
    const c = entierAleatoire(Math.ceil(0.3 * r), Math.floor(1.9 * r));
    if (c <= 0 || c >= 2 * r) continue;
    const { thetaDeg } = calculerSegmentCirculaire(r, c);
    if (thetaDeg > 10 && thetaDeg < 170) return { r, c };
  }
  // Repli garanti valide (θ=90° exactement pour r entier quelconque, c=r√2 non entier en général —
  // repli sur un couple simple connu à l'avance plutôt qu'un c non entier).
  return { r: rMin, c: rMin };
}

export function genererExerciceSegmentCirculaire(): ExerciceSegmentCirculaire {
  const { r, c } = tirerRC(R_MIN, R_MAX);
  return { scenario: "segmentCirculaire", ...calculerSegmentCirculaire(r, c) };
}
