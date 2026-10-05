/**
 * Couche A (5e) — dérivation de l'argument u vers x (écran 2, division par `a`) et balayage de n
 * pour obtenir les solutions distinctes dans [0;2π[ (écran 3), 5gen10.
 */
import { additionnerRationnelPi, diviserParEntier, multiplierParEntier, negatifRationnelPi, valeurNumerique } from "../parametresSinusoide/rationnelPi";
import type { BrancheAngle, BrancheX, CoefficientRationnel, ValeurPiOuDecimale } from "../../core5e/equationsTrigonometriques.types";

/** v/a = v×(aDenominateur/aNumerateur) — composé de deux opérations ENTIÈRES déjà partagées
 * (`multiplierParEntier`/`diviserParEntier`), jamais une primitive "diviser par un rationnel" ajoutée
 * à `rationnelPi.ts` (module générique 5gen8/5gen9, ne connaît rien de 5gen10). */
export function diviserValeurParA(v: ValeurPiOuDecimale, a: CoefficientRationnel): ValeurPiOuDecimale {
  if (v.exact !== null) {
    const parDenominateur = multiplierParEntier(v.exact, a.denominateur);
    const divise = diviserParEntier(parDenominateur, a.numerateur);
    return { exact: divise, decimal: valeurNumerique(divise) };
  }
  return { exact: null, decimal: (v.decimal * a.denominateur) / a.numerateur };
}

function soustraireValeurs(u: ValeurPiOuDecimale, b: ValeurPiOuDecimale): ValeurPiOuDecimale {
  if (u.exact !== null && b.exact !== null) {
    const diff = additionnerRationnelPi(u.exact, negatifRationnelPi(b.exact));
    return { exact: diff, decimal: valeurNumerique(diff) };
  }
  return { exact: null, decimal: u.decimal - b.decimal };
}

/** Écran 2 — x = (u-b)/a pour chaque branche, période/a. */
export function construireBranchesX(branchesU: BrancheAngle[], a: CoefficientRationnel, b: ValeurPiOuDecimale): BrancheX[] {
  return branchesU.map((branche) => {
    const uMoinsB = soustraireValeurs(branche.constante, b);
    return { constante: diviserValeurParA(uMoinsB, a), periode: diviserValeurParA(branche.periode, a) };
  });
}

const DEUX_PI = 2 * Math.PI;
const N_MIN = -30;
const N_MAX = 30;
const TOLERANCE = 1e-6;

/**
 * Écran 3 — balaye n sur chaque branche (n de -30 à 30, largement suffisant : la constante d'une
 * branche reste toujours bornée à quelques π en magnitude, et la période la plus petite réaliste
 * — π/3 pour tan avec a=3 — n'a besoin que d'une poignée de pas pour ramener n'importe quelle
 * constante bornée dans [0;2π[) et ne retient QUE les valeurs BRUTES (jamais réduites par un modulo)
 * qui tombent directement dans [0;2π[.
 *
 * Volontairement PAS de réduction modulo 2π : une branche a pour période RÉELLE `periode_x` (pas
 * nécessairement 2π — ex. tan avec a=3 donne periode_x=π/3) ; retrancher un multiple de 2π à une
 * valeur hors intervalle ne reconstruit un point de la MÊME suite arithmétique que si `periode_x`
 * divise exactement 2π, ce qui n'est pas toujours le cas (a peut être fractionnaire, ex. a=1/2 donne
 * periode_x=4π pour cos/sin) — une réduction aveugle fabriquerait alors un point qui ne vérifie plus
 * l'équation d'origine (bug trouvé par cross-vérification directe contre `Math.cos/sin/tan`, voir
 * `index.test.ts`). Puisque n balaye largement toute la suite, tout point RÉEL de [0;2π[ apparaît
 * déjà directement, sans reconstruction — la déduplication (tolérance flottante) gère seulement les
 * coïncidences entre branches distinctes qui retombent sur le même point réel.
 */
export function solutionsDistinctes(branchesX: BrancheX[]): number[] {
  const brut: number[] = [];
  for (const branche of branchesX) {
    for (let n = N_MIN; n <= N_MAX; n++) {
      const v = branche.constante.decimal + branche.periode.decimal * n;
      if (v >= -TOLERANCE && v < DEUX_PI) brut.push(v < 0 ? 0 : v);
    }
  }
  const triees = [...brut].sort((a, b) => a - b);
  const resultat: number[] = [];
  for (const v of triees) {
    if (resultat.length === 0 || v - resultat[resultat.length - 1] > TOLERANCE) resultat.push(v);
  }
  return resultat;
}

/** Union triée/dédupliquée (même tolérance que `solutionsDistinctes`) de 2 ensembles de solutions
 * déjà réduites dans [0;2π[ — réutilisée par les familles "produit" et "pythagoricienne" (union des
 * solutions de 2 sous-problèmes indépendants), jamais recalculée via un balayage de n séparé. */
export function unionSolutions(a: number[], b: number[]): number[] {
  const triees = [...a, ...b].sort((x, y) => x - y);
  const resultat: number[] = [];
  for (const v of triees) {
    if (resultat.length === 0 || v - resultat[resultat.length - 1] > TOLERANCE) resultat.push(v);
  }
  return resultat;
}
