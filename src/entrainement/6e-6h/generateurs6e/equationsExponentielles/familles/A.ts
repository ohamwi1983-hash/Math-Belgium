import type { ExerciceEqExpoA1, ExerciceEqExpoA2, ExerciceEqExpoA3 } from "../../../core6e/equationsExponentielles.types";
import { tirerDeuxDistincts, tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";
import { tirerBaseAB } from "../bases";
import { puissanceExacteRationnelle } from "../rationnel";

/**
 * Famille A — même base, comparaison d'exposants, 3 sous-types (2 écrans chacun) :
 * - A1 (direct) — `base^(mx+n) = base^p`, `p` affiché DÉCODÉ (jamais "base^p" littéralement).
 *   Toujours EXACTEMENT 1 solution `x=(p-n)/m`.
 * - A2 (avec racine) — `√(base^(mx+n) − base^c) = 0`. Écran 1 : reconnaître l'équation
 *   "radicande=0" (pas juste un exposant, contrairement à A1/A3). Toujours EXACTEMENT 1 solution.
 * - A3 (second degré en x) — `base^(ax²+bx+c) = base^d`. **"Cible d'abord"** : le NOMBRE de
 *   solutions (0/1/2) est choisi EN PREMIER, les racines cibles ensuite, `a`/`b` DÉRIVÉS via Vieta
 *   (`a·x²+b·x+(c-d)=a(x-r1)(x-r2)` développé) — jamais tirés indépendamment puis vérifiés après
 *   coup. Pour 0 solution, `k=c-d` est choisi juste au-delà du seuil `b²/(4a)` qui annule le
 *   discriminant (au-delà dans le sens qui le rend NÉGATIF, ce sens dépend du signe de `a`).
 */

const RACINE_POOL = [-2, -1, 0, 1, 2] as const;

export function construireA1(): ExerciceEqExpoA1 {
  const base = tirerBaseAB();
  const m = tirerEntierNonNul(-4, 4);
  const n = tirerEntier(-5, 5);
  const p = tirerEntier(-4, 4);
  const valeurNumerique = puissanceExacteRationnelle(base, p);
  const x = (p - n) / m;
  return { famille: "A", sousType: "A1", base, m, n, p, valeurNumerique, x };
}

export function construireA2(): ExerciceEqExpoA2 {
  const base = tirerBaseAB();
  const m = tirerEntierNonNul(-4, 4);
  const n = tirerEntier(-5, 5);
  const c = tirerEntier(-3, 3);
  const valeurNumerique = puissanceExacteRationnelle(base, c);
  const x = (c - n) / m;
  return { famille: "A", sousType: "A2", base, m, n, c, valeurNumerique, x };
}

export function construireA3(): ExerciceEqExpoA3 {
  const base = tirerBaseAB();
  const a = tirerParmi([1, -1] as const);
  const nombreSolutions = tirerParmi([0, 1, 2] as const);

  let b: number;
  let k: number; // = c - d, la constante de a·x²+b·x+k=0 une fois tout ramené à gauche
  let solutions: number[];

  if (nombreSolutions === 2) {
    const [r1, r2] = tirerDeuxDistincts(RACINE_POOL);
    b = -a * (r1 + r2);
    k = a * r1 * r2;
    solutions = [r1, r2].sort((x, y) => x - y);
  } else if (nombreSolutions === 1) {
    const r = tirerParmi(RACINE_POOL);
    b = -2 * a * r;
    k = a * r * r;
    solutions = [r];
  } else {
    // disc = b² - 4ak < 0 ⟺ k > b²/(4a) si a>0, k < b²/(4a) si a<0 — `b²/(4a)` n'est pas toujours
    // un entier (b impair) ; `Math.ceil`/`Math.floor` +1 marge garantissent malgré tout un `k`
    // ENTIER qui dépasse STRICTEMENT le seuil, quelle que soit la parité de `b` (bug trouvé par
    // test : sans ce garde-fou, `k` — et donc `d=c-k` — pouvait être fractionnaire, invalidant
    // `puissanceExacteRationnelle`, qui exige un exposant entier).
    b = tirerEntier(-4, 4);
    const margeExtra = tirerEntier(0, 2);
    k = a > 0 ? Math.ceil((b * b) / 4) + 1 + margeExtra : Math.floor((-b * b) / 4) - 1 - margeExtra;
    solutions = [];
  }

  const c = tirerEntier(-5, 5);
  const d = c - k;
  const valeurNumerique = puissanceExacteRationnelle(base, d);

  return { famille: "A", sousType: "A3", base, a, b, c, d, valeurNumerique, solutions };
}
