/**
 * Couche A (5e) — 5gen11 ("Extremums d'une fonction sinusoïdale"). Réutilise `tirerT`/`tirerPhi`/
 * `tirerAmplitude`/`tirerDecalageVertical` (`generateurs5e/parametresSinusoide/parametres.ts`) et
 * `calculerB`/`calculerC` (`rationnelPi.ts`) TELS QUELS — mêmes gammes de valeurs que 5gen8/9, import
 * générateur→générateur déjà établi.
 *
 * Formule fusionnée (voir CLAUDE.md section 5gen11, preuve) : sin(u)=±1 ⟺ u=π/2+kπ ; cos(u)=±1 ⟺
 * u=kπ — UNE SEULE branche, période TOUJOURS π (jamais 2π comme le cas spécial k=±1 à 2 branches
 * déjà catalogué côté 5gen10, volontairement distinct).
 *
 * `diviserParA`/`construireBrancheX` composent directement les opérations déjà partagées de
 * `rationnelPi.ts` (`multiplierRationnelPi`/`inverseRationnelPi`/`additionnerRationnelPi`/
 * `negatifRationnelPi`) — `a` pouvant être lié à π (`degrePi=1`, si T est un entier plat), diviser un
 * argument lui-même lié à π par un tel `a` ANNULE le π (`multiplierRationnelPi` combine les degrés :
 * 1 + (-1) = 0), produisant naturellement une période "pure" en x — aucune primitive supplémentaire
 * nécessaire dans `rationnelPi.ts`.
 */
import type { BrancheExtremum, ExerciceExtremumsSinusoide, FonctionExtremum } from "../../core5e/extremumsSinusoide.types";
import { tirerAmplitude, tirerDecalageVertical, tirerPhi, tirerT } from "../parametresSinusoide/parametres";
import type { RationnelPi } from "../parametresSinusoide/rationnelPi";
import { additionnerRationnelPi, calculerB, calculerC, inverseRationnelPi, multiplierRationnelPi, negatifRationnelPi, valeurNumerique } from "../parametresSinusoide/rationnelPi";

const FONCTIONS: FonctionExtremum[] = ["sin", "cos"];

export function tirerFonction(): FonctionExtremum {
  return FONCTIONS[Math.floor(Math.random() * FONCTIONS.length)];
}

const PI_UNITE: RationnelPi = { numerateur: 1, denominateur: 1, degrePi: 1 };
const DEMI_PI: RationnelPi = { numerateur: 1, denominateur: 2, degrePi: 1 };
const ZERO_PI: RationnelPi = { numerateur: 0, denominateur: 1, degrePi: 1 };

/** u = π/2+kπ (sin) ou u = 0+kπ (cos) — période TOUJOURS π. */
function brancheUFusionnee(fonction: FonctionExtremum): BrancheExtremum {
  return { constante: fonction === "sin" ? DEMI_PI : ZERO_PI, periode: PI_UNITE };
}

function diviserParA(v: RationnelPi, a: RationnelPi): RationnelPi {
  return multiplierRationnelPi(v, inverseRationnelPi(a));
}

/** x = (u-bArg)/a. */
function construireBrancheX(brancheU: BrancheExtremum, a: RationnelPi, bArg: RationnelPi): BrancheExtremum {
  const uMoinsBArg = additionnerRationnelPi(brancheU.constante, negatifRationnelPi(bArg));
  return { constante: diviserParA(uMoinsBArg, a), periode: diviserParA(brancheU.periode, a) };
}

const N_MIN = -30;
const N_MAX = 30;
const TOLERANCE = 1e-6;
const DEUX_PI = 2 * Math.PI;

/** Balaie k sur l'UNIQUE branche (jamais un tableau de branches, contrairement à 5gen10 — la
 * formule fusionnée n'a par nature qu'une seule branche) — même principe que
 * `equationsTrigonometriques/solveur.ts::solutionsDistinctes` : jamais de réduction modulo 2π (la
 * période réelle en x ne divise pas toujours exactement 2π), seulement un filtrage des valeurs
 * BRUTES qui tombent directement dans [0;2π[. */
function solutionsBrancheUnique(brancheX: BrancheExtremum): number[] {
  const constante = valeurNumerique(brancheX.constante);
  const periode = valeurNumerique(brancheX.periode);
  const brut: number[] = [];
  for (let k = N_MIN; k <= N_MAX; k++) {
    const v = constante + periode * k;
    if (v >= -TOLERANCE && v < DEUX_PI) brut.push(v < 0 ? 0 : v);
  }
  const triees = [...brut].sort((a, b) => a - b);
  const resultat: number[] = [];
  for (const v of triees) {
    if (resultat.length === 0 || v - resultat[resultat.length - 1] > TOLERANCE) resultat.push(v);
  }
  return resultat;
}

const MAX_SOLUTIONS = 5;
const TENTATIVES_MAX = 200;

/** Construit un exercice pour la fonction donnée — reroll BORNÉ de (T,φ) tant que le nombre de
 * solutions dans [0;2π[ dépasse 5 (lisibilité de l'écran bonus) ou tombe à 0 (période résultante en
 * x parfois > 2π, un point peut alors légitimement manquer la fenêtre — même classe de cas dégénéré
 * que 5gen10, corrigée ici DÈS LA CONCEPTION plutôt qu'après coup). */
export function construireAvecFonction(fonction: FonctionExtremum): ExerciceExtremumsSinusoide {
  const brancheU = brancheUFusionnee(fonction);

  let T = tirerT();
  let phi = tirerPhi(T);
  let a = calculerB(T);
  let bArg = calculerC(a, phi);
  let brancheX = construireBrancheX(brancheU, a, bArg);
  let solutions = solutionsBrancheUnique(brancheX);
  let tentative = 0;
  while ((solutions.length === 0 || solutions.length > MAX_SOLUTIONS) && tentative < TENTATIVES_MAX) {
    T = tirerT();
    phi = tirerPhi(T);
    a = calculerB(T);
    bArg = calculerC(a, phi);
    brancheX = construireBrancheX(brancheU, a, bArg);
    solutions = solutionsBrancheUnique(brancheX);
    tentative++;
  }

  return {
    fonction,
    amplitude: tirerAmplitude(),
    decalageVertical: tirerDecalageVertical(),
    a,
    bArg,
    brancheU,
    brancheX,
    solutions,
  };
}

export function genererExerciceExtremumsSinusoide(): ExerciceExtremumsSinusoide {
  return construireAvecFonction(tirerFonction());
}
