import type { DirectionSigne, ExerciceIneqDConstant, ExerciceIneqDVariable, FacteurUnZero, PremierFacteurD, SecondFacteurDConstant, SousTypeD } from "../../../core6e/inequationsExponentielles.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";
import { inverserComparateur, tirerComparateur } from "../comparateur";
import { ensembleUnMorceau } from "../../ensembleReel";
import { combinerSignesDeuxZeros, resoudreAffine, resoudreQuadratiqueSymetrique } from "../intervalle";
import { baseEntiere, baseValeurIneq } from "../rationnel";

/**
 * Famille D — produit de 2 facteurs, tableau de signes — 2 sous-types.
 *
 * **`constant`** (2 écrans) — le premier facteur a un signe CONSTANT (`PremierFacteurD`), le
 * second facteur détermine seul le signe du produit une fois le sens corrigé. Second facteur
 * `quadratique` (`d·x²-e`, racines `±r`) : "cible d'abord" — `r` (racine, entier ≥1) choisi EN
 * PREMIER, `d` (coefficient, entier ≥1) tiré, `e=d·r²` DÉRIVÉ (propreté entière garantie, aucun
 * retry). Second facteur `exponentiel` (`base^x-k`) : `p` (exposant cible) choisi EN PREMIER,
 * `k=base^p` DÉRIVÉ (toujours entier, `base` entière ≥2, `p≥0`).
 *
 * **`variable`** (3 écrans) — 2 facteurs à ZÉRO UNIQUE chacun (voir
 * `core6e/inequationsExponentielles.types.ts::FacteurUnZero` pour l'écart documenté par rapport à
 * la proposition littérale de la spec, "x²-k²"). `facteur1` TOUJOURS exponentiel (spec : "premier
 * facteur du type c·base^(±x)-c") ; `facteur2` tiré 50/50 exponentiel/linéaire. `zero2` DÉRIVÉ de
 * `zero1` par un décalage non nul (`zero1 + tirerEntierNonNul(...)`), garantissant `zero1≠zero2`
 * sans retry. `solutionEcran3` construite par `combinerSignesDeuxZeros` (Couche A partagée avec A/
 * E, voir `intervalle.ts`).
 */

const POOL_BASE_D = [baseEntiere(2), baseEntiere(3), baseEntiere(4), baseEntiere(5), baseEntiere(7)];

function tirerPremierFacteurD(): PremierFacteurD {
  const positif = tirerParmi([true, false] as const);
  const base = tirerParmi(POOL_BASE_D);
  const m = tirerEntierNonNul(-3, 3);
  const n = tirerEntier(-5, 5);
  const c = tirerEntier(2, 6);
  if (positif) return { positif: true, c, base, m, n };
  const d = tirerEntier(1, 5);
  return { positif: false, c, d, base, m, n };
}

function tirerSecondFacteurDConstant(): SecondFacteurDConstant {
  const type = tirerParmi(["quadratique", "exponentiel"] as const);
  if (type === "quadratique") {
    const r = tirerEntier(1, 4);
    const d = tirerEntier(1, 3);
    const e = d * r * r;
    return { type: "quadratique", d, r, e };
  }
  const base = tirerParmi(POOL_BASE_D);
  const p = tirerEntier(0, 3);
  const k = Math.round(Math.pow(baseValeurIneq(base), p));
  return { type: "exponentiel", base, p, k };
}

export function construireDConstant(): ExerciceIneqDConstant {
  const premierFacteur = tirerPremierFacteurD();
  const secondFacteur = tirerSecondFacteurDConstant();
  const comparateur = tirerComparateur();
  const sensCorrige = premierFacteur.positif ? comparateur : inverserComparateur(comparateur);

  const solutionEcran2 =
    secondFacteur.type === "quadratique" ? resoudreQuadratiqueSymetrique(secondFacteur.r, sensCorrige) : ensembleUnMorceau(resoudreAffine(1, 0, sensCorrige, secondFacteur.p));

  return { famille: "D", sousType: "constant", premierFacteur, secondFacteur, comparateur, solutionEcran2 };
}

function tirerFacteurExponentiel(zero: number): { facteur: FacteurUnZero; sens: DirectionSigne } {
  const base = tirerParmi(POOL_BASE_D);
  const sgn = tirerParmi([1, -1] as const);
  const c = tirerEntier(1, 5);
  const sens: DirectionSigne = sgn === 1 ? "negatif_puis_positif" : "positif_puis_negatif";
  return { facteur: { type: "exponentiel", base, sgn, c, zero }, sens };
}

function tirerFacteurLineaire(zero: number): { facteur: FacteurUnZero; sens: DirectionSigne } {
  const pente = tirerParmi([1, -1] as const);
  const sens: DirectionSigne = pente === 1 ? "negatif_puis_positif" : "positif_puis_negatif";
  return { facteur: { type: "lineaire", pente, zero }, sens };
}

export function construireDVariable(): ExerciceIneqDVariable {
  const zero1 = tirerEntier(-3, 3);
  const zero2 = zero1 + tirerEntierNonNul(-4, 4);

  const f1 = tirerFacteurExponentiel(zero1);
  const f2 = tirerParmi([true, false] as const) ? tirerFacteurLineaire(zero2) : tirerFacteurExponentiel(zero2);

  const comparateur = tirerComparateur();
  const solutionEcran3 = combinerSignesDeuxZeros(zero1, f1.sens, zero2, f2.sens, comparateur);

  return { famille: "D", sousType: "variable", facteur1: f1.facteur, zero1, sens1: f1.sens, facteur2: f2.facteur, zero2, sens2: f2.sens, comparateur, solutionEcran3 };
}

export function construireD(sousType: SousTypeD) {
  return sousType === "constant" ? construireDConstant() : construireDVariable();
}
