import type { ExerciceLogC, SousTypeC } from "../../../core6e/inequationsLogarithmiques.types";
import { ensembleUnMorceau } from "../../ensembleReel";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";
import { COMPARATEURS, inverserComparateur, tirerComparateur } from "../comparateur";
import { intersecterEnsembles, resoudreAffine, resoudreQuadratiqueFacteurs } from "../intervalle";
import { baseEntiere, baseFraction, baseValeurLog } from "../rationnel";

/**
 * Famille C — combiner en un seul log, comparer.
 *
 * **Sous-type "produit"** : `log_base(f)+log_base(g) [comparateur] log_base(k)`, combiné en
 * `log_base(f·g) [comparateur] log_base(k)` puis comparé (`f·g R' k`, quadratique). `f(x)=x+n1`
 * (`m=1` — "f,g affines simples"), `g(x)=m2x+n2`. Construit DEPUIS des racines cibles `z1,z2` de
 * `f(x)g(x)-k` : `n1` choisi en premier, `n2` DÉRIVÉ (identification par coefficients de
 * `f(x)g(x)-k = m2(x-z1)(x-z2)`, avec `m1=1` : `n2 = -m2(z1+z2+n1)`, puis
 * `k = n1·n2 - m2·z1·z2` — voir le calcul ci-dessous).
 *
 * **Sous-type "quotient"** : `log_base(f)-log_base(g) [comparateur] log_base(k)`, combiné en
 * `log_base(f/g) [comparateur] log_base(k)`. La CE garantit `g>0`, donc `f/g R' k` équivaut
 * (multiplication par `g>0`, jamais de changement de sens) à `f-k·g R' 0` — une inéquation AFFINE
 * (jamais quadratique), résolue directement sans construction depuis des racines.
 */

const POOL_BASE_SUP = [baseEntiere(2), baseEntiere(3), baseEntiere(5), baseEntiere(10)];
const POOL_BASE_INF = [baseFraction(1, 2), baseFraction(1, 5), baseFraction(1, 10)];
const MAX_TENTATIVES = 500;

function tirerBase(): { base: { num: number; den: number }; baseSuperieureA1: boolean } {
  const superieure = tirerParmi([true, false] as const);
  const base = superieure ? tirerParmi(POOL_BASE_SUP) : tirerParmi(POOL_BASE_INF);
  return { base, baseSuperieureA1: baseValeurLog(base) > 1 };
}

function construireCProduit(): ExerciceLogC {
  for (let essai = 0; essai < MAX_TENTATIVES; essai++) {
    const { base, baseSuperieureA1 } = tirerBase();
    const n1 = tirerEntier(-4, 4);
    const m2 = tirerEntierNonNul(-3, 3);
    const z1 = tirerEntier(-4, 4);
    let z2 = tirerEntier(-4, 4);
    while (z2 === z1) z2 = tirerEntier(-4, 4);
    const comparateur = tirerComparateur(COMPARATEURS);

    // f(x)=x+n1, g(x)=m2x+n2 ; f(x)g(x)-k = m2(x-z1)(x-z2)  =>  identification par coefficients :
    //   x^1 : n2+m2n1 = -m2(z1+z2)  =>  n2 = -m2(z1+z2+n1)
    //   x^0 : n1n2-k = m2 z1 z2     =>  k = n1n2 - m2 z1 z2
    const n2 = -m2 * (z1 + z2 + n1);
    const k = n1 * n2 - m2 * z1 * z2;
    // k est le second membre de "log_base(k)" — doit être strictement positif pour que
    // l'expression affichée à l'élève ait un sens (jamais un log d'un nombre négatif/nul).
    if (k <= 0) continue;

    const ceF = resoudreAffine(1, n1, ">", 0);
    const ceG = resoudreAffine(m2, n2, ">", 0);
    const ceEcran1 = intersecterEnsembles(ensembleUnMorceau(ceF), ensembleUnMorceau(ceG));
    if (ceEcran1.morceaux.length === 0) continue;

    const comparateurArgument = baseSuperieureA1 ? comparateur : inverserComparateur(comparateur);
    // f(x)g(x) [comparateurArgument] k  <=>  f(x)g(x)-k [comparateurArgument] 0  <=>  m2(x-z1)(x-z2) [comparateurArgument] 0
    const comparaisonBrute = resoudreQuadratiqueFacteurs(m2, z1, z2, comparateurArgument);
    const solutionEcran3 = intersecterEnsembles(ceEcran1, comparaisonBrute);
    if (solutionEcran3.morceaux.length === 0) continue;

    return { famille: "C", sousType: "produit", base, baseSuperieureA1, f: { m: 1, n: n1 }, g: { m: m2, n: n2 }, k, comparateur, ceEcran1, solutionEcran3 };
  }
  throw new Error("construireCProduit : aucune combinaison valide trouvée après le nombre maximal de tentatives");
}

function construireCQuotient(): ExerciceLogC {
  for (let essai = 0; essai < MAX_TENTATIVES; essai++) {
    const { base, baseSuperieureA1 } = tirerBase();
    const m1 = tirerEntierNonNul(-4, 4);
    const m2 = tirerEntierNonNul(-4, 4);
    const n1 = tirerEntier(-6, 6);
    const n2 = tirerEntier(-6, 6);
    // k est le second membre de "log_base(k)" — doit être strictement positif (voir sous-type
    // "produit" ci-dessus pour la même contrainte).
    const k = tirerEntier(1, 4);
    const comparateur = tirerComparateur(COMPARATEURS);

    // f/g [comparateurArgument] k  <=>  f-k·g [comparateurArgument] 0  (CE garantit g>0, jamais de flip)
    const pente = m1 - k * m2;
    if (pente === 0) continue;

    const ceF = resoudreAffine(m1, n1, ">", 0);
    const ceG = resoudreAffine(m2, n2, ">", 0);
    const ceEcran1 = intersecterEnsembles(ensembleUnMorceau(ceF), ensembleUnMorceau(ceG));
    if (ceEcran1.morceaux.length === 0) continue;

    const comparateurArgument = baseSuperieureA1 ? comparateur : inverserComparateur(comparateur);
    const comparaisonBrute = ensembleUnMorceau(resoudreAffine(pente, n1 - k * n2, comparateurArgument, 0));
    const solutionEcran3 = intersecterEnsembles(ceEcran1, comparaisonBrute);
    if (solutionEcran3.morceaux.length === 0) continue;

    return { famille: "C", sousType: "quotient", base, baseSuperieureA1, f: { m: m1, n: n1 }, g: { m: m2, n: n2 }, k, comparateur, ceEcran1, solutionEcran3 };
  }
  throw new Error("construireCQuotient : aucune combinaison valide trouvée après le nombre maximal de tentatives");
}

export function construireC(sousType: SousTypeC): ExerciceLogC {
  return sousType === "produit" ? construireCProduit() : construireCQuotient();
}
