import { fraction } from "./fraction";
import type { ExerciceLieuxB, ExerciceLieuxB_Apollonius, ExerciceLieuxB_Bissectrices, ExerciceLieuxB_CerclePerp, ExerciceLieuxB_Droite, ExerciceLieuxB_Seuil2Points, ExerciceLieuxB_SeuilCarre } from "../../core6e/lieuxGeometriquesParametres.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille B ("Lieu depuis une condition de distance au carré, avec
 * seuils") de `6gen56`. 6 sous-types, 2 groupes :
 *
 * **SANS seuil** ("bissectrices"/"droite"/"cerclePerp") : la nature du lieu ne dépend JAMAIS de la
 * valeur de k (ou n'a même pas de k du tout, pour "bissectrices") — TOUJOURS 2 droites / 1 droite /
 * 1 cercle respectivement, quel que soit le paramètre donné. Le piège central de la famille est
 * d'appliquer À TORT un raisonnement de seuil ici (mission) — testé à l'écran3 ALLÉGÉ (choix
 * "un seuil s'applique-t-il ici ?", correct=Non), plutôt que sauté, pour rendre le piège explicite.
 *
 * **AVEC seuil** ("seuil2Points"/"apollonius"/"seuilCarre") : la nature CHANGE qualitativement
 * selon la position de k par rapport à une valeur critique — cercle / point / ∅ pour les 2
 * premiers, droite (médiatrice, k=1) / cercle (k≠1) pour Apollonius.
 *
 * **Construction "à l'envers" systématique** : pour chaque sous-type à seuil, le rayon (ou le
 * régime) final est choisi D'ABORD (toujours un entier, ou un triplet pythagoricien pour
 * Apollonius), puis k est recalculé exactement pour produire ce résultat — jamais l'inverse (tirer
 * k au hasard et espérer un rayon entier). Garantit qu'aucune réponse attendue n'est une racine non
 * simplifiable. Toutes les preuves algébriques (identités PA²+PB²=2PM²+d²/2, formule du cercle
 * d'Apollonius, décomposition (x-c)²+(x+c)²=2x²+2c²) sont vérifiées par force brute dans
 * `familleB.test.ts` plutôt que supposées correctes.
 */

// ============================================================================
// bissectrices — droites x+y=e1, x-y=e2 (normes égales : √2 chacune) ⇒ bissectrices obtenues SANS
// jamais développer de carré, par simple identité |A|=|B| ⟺ A=B ou A=-B. Aucun k dans ce sous-type.
// ============================================================================

function construireBissectrices(): ExerciceLieuxB_Bissectrices {
  const e1 = tirerEntier(-6, 6) * 2;
  const e2 = tirerEntier(-6, 6) * 2;
  return { famille: "B", sousType: "bissectrices", e1, e2, xBis: (e1 + e2) / 2, yBis: (e1 - e2) / 2 };
}

// ============================================================================
// droite — PA²-PB²=k, A,B fixes ⇒ TOUJOURS une droite (les termes en x²,y² s'annulent, coefficient
// 1 de chaque côté) — aucun seuil, quel que soit k.
// ============================================================================

function construireDroite(): ExerciceLieuxB_Droite {
  const xa = tirerEntier(-5, 5);
  const ya = tirerEntier(-5, 5);
  let xb = tirerEntier(-5, 5);
  let yb = tirerEntier(-5, 5);
  while (xb === xa && yb === ya) {
    xb = tirerEntier(-5, 5);
    yb = tirerEntier(-5, 5);
  }
  const k = tirerEntier(-8, 8);
  const A = 2 * (xb - xa);
  const B = 2 * (yb - ya);
  const C = xa * xa + ya * ya - (xb * xb + yb * yb) - k;
  return { famille: "B", sousType: "droite", xa, ya, xb, yb, k, A, B, C };
}

// ============================================================================
// cerclePerp — dist(P,x=x0)²+dist(P,y=y0)²=k ⇒ (x-x0)²+(y-y0)²=k, TOUJOURS un cercle centré
// (x0,y0) — k>0 donné suffit, aucun seuil. Rayon choisi entier D'ABORD, k=r² ensuite.
// ============================================================================

function construireCerclePerp(): ExerciceLieuxB_CerclePerp {
  const x0 = tirerEntier(-5, 5);
  const y0 = tirerEntier(-5, 5);
  const r = tirerEntier(2, 6);
  const k = r * r;
  return { famille: "B", sousType: "cerclePerp", x0, y0, k, r, constanteEcran1: x0 * x0 + y0 * y0, D: -2 * x0, E: -2 * y0, F: x0 * x0 + y0 * y0 - k };
}

// ============================================================================
// seuil2Points — PA²+PB²=k, seuil=d²/2 (d=|AB|, identité PA²+PB²=2PM²+d²/2, M=milieu[AB]).
// A,B choisis avec coordonnées PAIRES ⇒ d² multiple de 4 ⇒ seuil entier ⇒ F toujours entier
// (preuve dans `familleB.test.ts`). Rayon (régime "cercle") choisi entier D'ABORD.
// ============================================================================

function construireSeuil2Points(regimeForce?: "cercle" | "point" | "vide"): ExerciceLieuxB_Seuil2Points {
  const xa = tirerEntier(-4, 4) * 2;
  const ya = tirerEntier(-4, 4) * 2;
  let xb = tirerEntier(-4, 4) * 2;
  let yb = tirerEntier(-4, 4) * 2;
  while (xb === xa && yb === ya) {
    xb = tirerEntier(-4, 4) * 2;
    yb = tirerEntier(-4, 4) * 2;
  }
  const d2 = (xb - xa) * (xb - xa) + (yb - ya) * (yb - ya);
  const seuil = d2 / 2;
  const regime = regimeForce ?? tirerParmi(["cercle", "point", "vide"] as const);
  let k: number;
  let rayon: number | null;
  if (regime === "point") {
    k = seuil;
    rayon = null;
  } else if (regime === "cercle") {
    const r = tirerEntier(1, 5);
    k = seuil + 2 * r * r;
    rayon = r;
  } else {
    k = seuil - tirerEntier(1, 8);
    rayon = null;
  }
  const constanteA = xa * xa + ya * ya;
  const constanteB = xb * xb + yb * yb;
  const D = -(xa + xb);
  const E = -(ya + yb);
  const F = (constanteA + constanteB - k) / 2;
  return { famille: "B", sousType: "seuil2Points", xa, ya, xb, yb, k, seuil, regime, rayon, constanteA, constanteB, D, E, F };
}

// ============================================================================
// apollonius — PA²=k·PB², A=(-a,0), B=(a,0). k=1 ⇒ médiatrice x=0 (les x²,y² s'annulent, MÊME
// mécanisme que "droite" ci-dessus — piège à ne pas manquer). k≠1 ⇒ cercle, centre (x0,0),
// rayon r, avec (a,r,x0) triplet pythagoricien (a²+r²=x0², a<x0) choisi D'ABORD, k=(a+x0)/(x0-a)
// recalculé exactement ensuite (preuve algébrique complète dans `familleB.test.ts`).
// ============================================================================

const TRIPLETS_PYTHAGORICIENS: readonly [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
  [8, 15, 17],
];

function construireApollonius(casK1Force?: boolean): ExerciceLieuxB_Apollonius {
  const casK1 = casK1Force ?? tirerParmi([true, true, false, false] as const);
  if (casK1) {
    const a = tirerEntier(2, 7);
    return { famille: "B", sousType: "apollonius", a, casK1: true, k: { num: 1, den: 1 }, x0: null, r: null, ecran1Val1: 1, ecran1Val2: 1, ecran2CoefX: 4 * a, ecran2Constante: null };
  }
  const [leg, r, x0] = tirerParmi(TRIPLETS_PYTHAGORICIENS);
  const a = leg;
  const k = fraction(a + x0, x0 - a);
  return { famille: "B", sousType: "apollonius", a, casK1: false, k, x0, r, ecran1Val1: 2 * a, ecran1Val2: -2 * a, ecran2CoefX: -2 * x0, ecran2Constante: a * a };
}

// ============================================================================
// seuilCarre — carré [-c,c]×[-c,c], somme des carrés des 4 distances aux côtés = k. Identité
// (x-c)²+(x+c)²=2x²+2c² (par paire d'arêtes opposées) ⇒ somme totale=2x²+2y²+4c² ⇒
// x²+y²=(k-4c²)/2, seuil=4c² (minimum, atteint au centre). Rayon choisi entier D'ABORD.
// ============================================================================

function construireSeuilCarre(regimeForce?: "cercle" | "point" | "vide"): ExerciceLieuxB_SeuilCarre {
  const c = tirerEntier(2, 6);
  const seuil = 4 * c * c;
  const regime = regimeForce ?? tirerParmi(["cercle", "point", "vide"] as const);
  let k: number;
  let rayon: number | null;
  if (regime === "point") {
    k = seuil;
    rayon = null;
  } else if (regime === "cercle") {
    const r = tirerEntier(1, 5);
    k = seuil + 2 * r * r;
    rayon = r;
  } else {
    k = seuil - tirerEntier(1, 10);
    rayon = null;
  }
  return { famille: "B", sousType: "seuilCarre", c, k, seuil, regime, rayon, constanteEcran1: 2 * c * c, rhsEcran2: (k - seuil) / 2 };
}

export function construireFamilleB(): ExerciceLieuxB {
  return tirerParmi([construireBissectrices, construireDroite, construireCerclePerp, construireSeuil2Points, construireApollonius, construireSeuilCarre] as const)();
}

export { construireApollonius, construireBissectrices, construireCerclePerp, construireDroite, construireSeuil2Points, construireSeuilCarre };
