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
const THETA1_MIN = 60;

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
    // θ₁ ≥ 60° (grand cercle, le plus petit des deux angles) : sinon la lentille n'est qu'une lame
    // quasi invisible sur le croquis (ex. r₁ = 20, r₂ = 15, c = 8 — audit 5e ch. 2, point 46).
    if (theta1 >= THETA1_MIN && theta1 < 170 && theta2 > 10 && theta2 < 170) return { r1, r2, c };
  }
  // Repli garanti valide : r1=7, r2=5, c=8 (θ1 ≈ 70°, θ2 ≈ 106° — dans les plages acceptées,
  // c < 1,9·r2).
  return { r1: 7, r2: 5, c: 8 };
}

export function genererExerciceLentille(): ExerciceLentille {
  const { r1, r2, c } = tirerR1R2C();
  const segment1 = calculerSegmentCirculaire(r1, c);
  const segment2 = calculerSegmentCirculaire(r2, c);
  return { scenario: "lentille", c, segment1, segment2, aireLentille: segment1.aireSegment + segment2.aireSegment };
}
