import type { ExerciceFamilleC } from "../../core6e/nombresComplexes.types";
import { diviserComplexeExact, valeurFraction } from "./fractionComplexe";
import { estDecimalCourt, tirerCasParticulier, tirerNonNul } from "./casParticuliers";

/**
 * Couche A (6e) — famille C (« Division par le conjugué ») de `6gen34`. Coefficients non nuls de
 * [-6 ; 6] pour le numérateur, [-4 ; 4] pour le dénominateur (c²+d² ≤ 32) ; tirage rejeté tant que le
 * quotient n'est pas un décimal à au plus 2 décimales (réponse à écrire SANS « / »). Cas particulier
 * (~10 %) : l'inverse 1/(c+di).
 */

const NUM_MAX = 6;
const DEN_MAX = 4;

export function construireFamilleC(): ExerciceFamilleC {
  const casInverse = tirerCasParticulier();
  for (;;) {
    const a = casInverse ? 1 : tirerNonNul(-NUM_MAX, NUM_MAX);
    const b = casInverse ? 0 : tirerNonNul(-NUM_MAX, NUM_MAX);
    const c = tirerNonNul(-DEN_MAX, DEN_MAX);
    const d = tirerNonNul(-DEN_MAX, DEN_MAX);
    const { reFrac, imFrac } = diviserComplexeExact({ re: a, im: b }, { re: c, im: d });
    const resultat = { re: valeurFraction(reFrac), im: valeurFraction(imFrac) };
    if (!estDecimalCourt(resultat.re) || !estDecimalCourt(resultat.im)) continue;
    if (!casInverse && (resultat.re === 0 || resultat.im === 0)) continue;
    const numerateurDeveloppe = { re: a * c + b * d, im: b * c - a * d };
    const denominateurDeveloppe = c * c + d * d;
    return { famille: "C", a, b, c, d, numerateurDeveloppe, denominateurDeveloppe, resultat };
  }
}
