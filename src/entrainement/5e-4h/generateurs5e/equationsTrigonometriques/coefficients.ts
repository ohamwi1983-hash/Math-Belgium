/**
 * Couche A (5e) — tirage du coefficient `a` (jamais lié à π, rationnel plat) et du décalage `b`
 * (5gen10). `a` est BORNÉ (candidats {1,2,3,1/2,2/3}, `1` pondéré plus fréquent) pour que le nombre
 * de solutions distinctes dans [0;2π[ reste raisonnable — la vérification EFFECTIVE (≤5 points) se
 * fait après coup par balayage réel (`solveur.ts`), avec reroll si nécessaire (`index.ts`) : ce
 * tirage seul ne garantit qu'une plage RAISONNABLE, pas une borne stricte.
 *
 * `b` est TOUJOURS cohérent avec le régime de `k` (voir CLAUDE.md section 5gen10) : régime "exact"
 * ⟹ `b` est 0 ou une fraction de π (jamais un nombre brut, ce qui produirait une réponse x "mixte" —
 * ni propre ni pédagogiquement honnête) ; régime "decimal" ⟹ `b` est 0 ou un entier brut (jamais lié
 * à π, cohérent avec `k` déjà décimal).
 */
import type { RationnelPi } from "../parametresSinusoide/rationnelPi";
import { valeurNumerique } from "../parametresSinusoide/rationnelPi";
import type { CoefficientRationnel, RegimeEquationTrig, ValeurPiOuDecimale } from "../../core5e/equationsTrigonometriques.types";

const CANDIDATS_A: CoefficientRationnel[] = [
  { numerateur: 1, denominateur: 1 },
  { numerateur: 1, denominateur: 1 },
  { numerateur: 1, denominateur: 1 },
  { numerateur: 2, denominateur: 1 },
  { numerateur: 2, denominateur: 1 },
  { numerateur: 3, denominateur: 1 },
  { numerateur: 1, denominateur: 2 },
  { numerateur: 2, denominateur: 3 },
];

export function tirerA(): CoefficientRationnel {
  return CANDIDATS_A[Math.floor(Math.random() * CANDIDATS_A.length)];
}

const CANDIDATS_B_PI: RationnelPi[] = [
  { numerateur: 1, denominateur: 6, degrePi: 1 },
  { numerateur: 1, denominateur: 4, degrePi: 1 },
  { numerateur: 1, denominateur: 3, degrePi: 1 },
  { numerateur: 1, denominateur: 2, degrePi: 1 },
  { numerateur: 1, denominateur: 1, degrePi: 1 },
];

function tirerSigne(): 1 | -1 {
  return Math.random() < 0.5 ? 1 : -1;
}

export function tirerB(regime: RegimeEquationTrig): ValeurPiOuDecimale {
  if (Math.random() < 0.4) return { exact: regime === "exact" ? { numerateur: 0, denominateur: 1, degrePi: 1 } : null, decimal: 0 };
  if (regime === "exact") {
    const base = CANDIDATS_B_PI[Math.floor(Math.random() * CANDIDATS_B_PI.length)];
    const signe = tirerSigne();
    const v: RationnelPi = signe === 1 ? base : { ...base, numerateur: -base.numerateur };
    return { exact: v, decimal: valeurNumerique(v) };
  }
  const entier = 1 + Math.floor(Math.random() * 3);
  return { exact: null, decimal: tirerSigne() * entier };
}
