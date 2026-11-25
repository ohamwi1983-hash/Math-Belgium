import { coefficientBinomial } from "../combinatoire";
import type { CouleurHypergeoB, ExerciceHypergeoB } from "../../core6e/probabiliteHypergeometrique.types";
import { melanger, tirerParmi } from "./aleatoire";

/**
 * Famille B de `6gen47` — ordre contre composition : urne de n₁ rouges et n₂ bleues, trois tirages sans
 * remise. a ∈ {1, 2} rouges (audit, G17 : avec a = 0 ou 3, séquence et composition coïncidaient dans
 * 48,5 % des tirages et il n'y avait plus rien à comparer).
 */

const VALEURS_N1_N2 = [4, 5, 6, 7, 8] as const;

export interface FractionExacte {
  numerateur: number;
  denominateur: number;
  valeur: number;
}

export function calculerProbabiliteSequence(n1: number, n2: number, sequence: CouleurHypergeoB[]): FractionExacte {
  let r1 = n1;
  let r2 = n2;
  let total = n1 + n2;
  let numerateur = 1;
  let denominateur = 1;
  for (const c of sequence) {
    numerateur *= c === "c1" ? r1 : r2;
    denominateur *= total;
    if (c === "c1") r1--;
    else r2--;
    total--;
  }
  return { numerateur, denominateur, valeur: numerateur / denominateur };
}

export function calculerProbabiliteComposition(n1: number, n2: number, a: number, b: number): FractionExacte {
  const numerateur = coefficientBinomial(n1, a) * coefficientBinomial(n2, b);
  const denominateur = coefficientBinomial(n1 + n2, 3);
  return { numerateur, denominateur, valeur: numerateur / denominateur };
}

export function construireFamilleB(): ExerciceHypergeoB {
  const n1 = tirerParmi(VALEURS_N1_N2);
  const n2 = tirerParmi(VALEURS_N1_N2);
  const a = tirerParmi([1, 2] as const);
  const b = 3 - a;
  const sequence = melanger<CouleurHypergeoB>([...Array<CouleurHypergeoB>(a).fill("c1"), ...Array<CouleurHypergeoB>(b).fill("c2")]);
  const s = calculerProbabiliteSequence(n1, n2, sequence);
  const c = calculerProbabiliteComposition(n1, n2, a, b);
  return {
    famille: "B",
    n1,
    n2,
    N: n1 + n2,
    sequence,
    a,
    b,
    numerateurSequence: s.numerateur,
    denominateurSequence: s.denominateur,
    probabiliteSequence: s.valeur,
    numerateurComposition: c.numerateur,
    denominateurComposition: c.denominateur,
    probabiliteComposition: c.valeur,
    nombreArrangements: coefficientBinomial(3, a),
  };
}
