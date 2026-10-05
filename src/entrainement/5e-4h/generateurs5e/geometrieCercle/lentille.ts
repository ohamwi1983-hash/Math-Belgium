/**
 * Couche A (5e) — sous-variante A3b de 5gen12 ("Lentille", deux cercles sécants partageant une
 * corde commune). Réutilise `calculerSegmentCirculaire` (`segmentCirculaire.ts`, module frère,
 * import générateur→générateur) DEUX FOIS — une fois par rayon — jamais une seconde dérivation.
 */
import type { ExerciceLentille } from "../../core5e/geometrieCercle.types";
import { calculerSegmentCirculaire } from "./segmentCirculaire";

const R_MIN = 5;
const R_MAX = 20;
/** Écart minimal entre r1/r2 — 2 rayons trop proches produiraient 2 écrans quasi identiques. */
const ECART_R_MIN = 2;

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Tire (r1,r2,c) — c valide pour LES DEUX cercles (c<2×min(r1,r2)) ET dans une plage lisible pour
 * chacun des 2 angles (θ∈]10°;170°[) — retry BORNÉ, même patron que `segmentCirculaire.ts::tirerRC`. */
function tirerR1R2C(): { r1: number; r2: number; c: number } {
  const TENTATIVES_MAX = 200;
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const r2 = entierAleatoire(R_MIN, R_MAX - ECART_R_MIN);
    const r1 = entierAleatoire(r2 + ECART_R_MIN, R_MAX);
    const rMin = Math.min(r1, r2);
    const c = entierAleatoire(Math.ceil(0.3 * rMin), Math.floor(1.9 * rMin));
    if (c <= 0 || c >= 2 * rMin) continue;
    const theta1 = calculerSegmentCirculaire(r1, c).thetaDeg;
    const theta2 = calculerSegmentCirculaire(r2, c).thetaDeg;
    if (theta1 > 10 && theta1 < 170 && theta2 > 10 && theta2 < 170) return { r1, r2, c };
  }
  // Repli garanti valide : r1=R_MIN+ECART_R_MIN, r2=R_MIN, c=r2 (θ2=60°, θ1 encore plus ouvert
  // puisque r1>r2 à c fixé — toujours dans la plage acceptée).
  return { r1: R_MIN + ECART_R_MIN, r2: R_MIN, c: R_MIN };
}

export function genererExerciceLentille(): ExerciceLentille {
  const { r1, r2, c } = tirerR1R2C();
  const segment1 = calculerSegmentCirculaire(r1, c);
  const segment2 = calculerSegmentCirculaire(r2, c);
  return { scenario: "lentille", c, segment1, segment2, aireLentille: segment1.aireSegment + segment2.aireSegment };
}
