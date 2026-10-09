import type { ExerciceLogB, ExerciceLogBDirect, ExerciceLogBRacine, SousTypeB } from "../../../core6e/inequationsLogarithmiques.types";
import { ensembleUnMorceau } from "../../ensembleReel";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";
import { COMPARATEURS, inverserComparateur, tirerComparateur } from "../comparateur";
import { intersecterEnsembles, resoudreAffine, resoudreQuadratiqueFacteurs } from "../intervalle";
import { baseEntiere, baseFraction, baseValeurLog } from "../rationnel";

/**
 * Famille B — `log_base(f(x)) [comparateur] log_base(g(x))`, comparaison DIRECTE des arguments
 * (`f R' g`, `R'=comparateur` si `base>1`, inversé sinon) — piège : oublier de ré-intersecter avec
 * la CE après avoir résolu la comparaison.
 *
 * **Sous-type "direct"** : `f(x)=m1x+n1`, `g(x)=m2x+n2`, `m1≠m2` (sinon `f-g` est une constante,
 * comparaison dégénérée en ℝ/∅ hors du cadre de cette famille).
 *
 * **Sous-type "racine"** : `f(x)=\sqrt{ax+b}`, `g(x)=m2x+n2`. La CE garantit `g(x)>0`, donc
 * `\sqrt{ax+b} R' g(x)` équivaut (élévation au carré valide car les deux membres sont positifs
 * sur la CE) à `ax+b R' g(x)^2` — construit DEPUIS des racines cibles `z1,z2` (de
 * `ax+b-(m2x+n2)^2`, la comparaison `[comparateur] 0` équivalente une fois réarrangée) : `a`
 * (coefficient de `f` sous la racine) choisi en premier, puis `b` DÉRIVÉ pour que `z1,z2` soient
 * EXACTEMENT les racines — voir le calcul ci-dessous (identification par coefficients de
 * `ax+b-(m2x+n2)^2 = -m2²(x-z1)(x-z2)`, donc `a = 2·m2·n2 + m2²(z1+z2)` et
 * `b = n2² - m2²·z1·z2`, tous deux entiers si `m2,n2,z1,z2` le sont).
 */

const POOL_BASE_SUP = [baseEntiere(2), baseEntiere(3), baseEntiere(5), baseEntiere(10)];
const POOL_BASE_INF = [baseFraction(1, 2), baseFraction(1, 5), baseFraction(1, 10)];

function tirerBase(): { base: { num: number; den: number }; baseSuperieureA1: boolean } {
  const superieure = tirerParmi([true, false] as const);
  const base = superieure ? tirerParmi(POOL_BASE_SUP) : tirerParmi(POOL_BASE_INF);
  return { base, baseSuperieureA1: baseValeurLog(base) > 1 };
}

/** Retry borné — 2 demi-droites tirées librement (CE) peuvent, pour une combinaison de paramètres
 * malchanceuse, ne pas se recouper (intersection vide) : jamais le comportement voulu pour cette
 * famille (pas la famille E, "toujours ∅ par construction") — voir en-tête du fichier. */
const MAX_TENTATIVES = 500;

export function construireBDirect(): ExerciceLogBDirect {
  for (let essai = 0; essai < MAX_TENTATIVES; essai++) {
    const { base, baseSuperieureA1 } = tirerBase();
    const m1 = tirerEntierNonNul(-4, 4);
    let m2 = tirerEntierNonNul(-4, 4);
    while (m2 === m1) m2 = tirerEntierNonNul(-4, 4);
    const n1 = tirerEntier(-6, 6);
    const n2 = tirerEntier(-6, 6);
    const comparateur = tirerComparateur(COMPARATEURS);

    const ceF = resoudreAffine(m1, n1, ">", 0);
    const ceG = resoudreAffine(m2, n2, ">", 0);
    const ceEcran1 = intersecterEnsembles(ensembleUnMorceau(ceF), ensembleUnMorceau(ceG));
    if (ceEcran1.morceaux.length === 0) continue;

    const comparateurArgument = baseSuperieureA1 ? comparateur : inverserComparateur(comparateur);
    // f [comparateurArgument] g  <=>  (m1-m2)x + (n1-n2) [comparateurArgument] 0
    const comparaisonBruteEcran2 = ensembleUnMorceau(resoudreAffine(m1 - m2, n1 - n2, comparateurArgument, 0));
    const solutionEcran2 = intersecterEnsembles(ceEcran1, comparaisonBruteEcran2);
    if (solutionEcran2.morceaux.length === 0) continue;

    return { famille: "B", sousType: "direct", base, baseSuperieureA1, f: { m: m1, n: n1 }, g: { m: m2, n: n2 }, comparateur, ceEcran1, comparaisonBruteEcran2, solutionEcran2 };
  }
  throw new Error("construireBDirect : aucune combinaison valide trouvée après le nombre maximal de tentatives");
}

export function construireBRacine(): ExerciceLogBRacine {
  for (let essai = 0; essai < MAX_TENTATIVES; essai++) {
    const { base, baseSuperieureA1 } = tirerBase();
    const m2 = tirerEntierNonNul(-3, 3);
    const n2 = tirerEntier(-5, 5);
    const z1 = tirerEntier(-5, 5);
    let z2 = tirerEntier(-5, 5);
    while (z2 === z1) z2 = tirerEntier(-5, 5);
    const comparateur = tirerComparateur(COMPARATEURS);

    // ax+b-(m2x+n2)^2 = -m2^2(x-z1)(x-z2)  =>  identification par coefficients :
    //   x^1 : a-2m2n2 = m2^2(z1+z2)  =>  a = 2m2n2 + m2^2(z1+z2)
    //   x^0 : b-n2^2 = -m2^2 z1 z2   =>  b = n2^2 - m2^2 z1 z2
    const a = 2 * m2 * n2 + m2 * m2 * (z1 + z2);
    const b = n2 * n2 - m2 * m2 * z1 * z2;
    if (a === 0) continue;

    const ceF = resoudreAffine(a, b, ">", 0);
    const ceG = resoudreAffine(m2, n2, ">", 0);
    const ceEcran1 = intersecterEnsembles(ensembleUnMorceau(ceF), ensembleUnMorceau(ceG));
    if (ceEcran1.morceaux.length === 0) continue;

    const comparateurArgument = baseSuperieureA1 ? comparateur : inverserComparateur(comparateur);
    // sqrt(ax+b) [comparateurArgument] (m2x+n2)  <=>  ax+b [comparateurArgument] (m2x+n2)^2   (les 2 membres >=0 sur la CE)
    //   <=>  ax+b-(m2x+n2)^2 [comparateurArgument] 0  <=>  -m2^2(x-z1)(x-z2) [comparateurArgument] 0
    const comparaisonBruteEcran2 = resoudreQuadratiqueFacteurs(-m2 * m2, z1, z2, comparateurArgument);
    const solutionEcran2 = intersecterEnsembles(ceEcran1, comparaisonBruteEcran2);
    if (solutionEcran2.morceaux.length === 0) continue;

    return { famille: "B", sousType: "racine", base, baseSuperieureA1, a, b, g: { m: m2, n: n2 }, z1, z2, comparateur, ceEcran1, comparaisonBruteEcran2, solutionEcran2 };
  }
  throw new Error("construireBRacine : aucune combinaison valide trouvée après le nombre maximal de tentatives");
}

export function construireB(sousType: SousTypeB): ExerciceLogB {
  return sousType === "direct" ? construireBDirect() : construireBRacine();
}
