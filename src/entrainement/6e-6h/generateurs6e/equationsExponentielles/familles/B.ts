import type { ExerciceEqExpoB } from "../../../core6e/equationsExponentielles.types";
import { tirerEntier, tirerEntierNonNul } from "../aleatoire";
import { tirerBaseAB } from "../bases";

/**
 * Famille B — `√(base^(m1x+n1)) = base^(m2x+n2)`, 2 écrans : simplifier le radical
 * (`u/2=(m1x+n1)/2`) puis résoudre `u/2=m2x+n2`, ou constater une CONTRADICTION (∅).
 *
 * ~50% des tirages forcent `m1=2·m2`, en garantissant `n1≠2·n2` (ajusté si besoin) — l'équation
 * `(m1x+n1)/2=m2x+n2` devient alors `n1/2=n2` (le terme en x s'annule), fausse par construction ⟹
 * aucune solution réelle (∅). Les autres tirages produisent `m1≠2·m2`, donc une solution UNIQUE
 * `x=(2·n2-n1)/(m1-2·m2)`.
 */
export function construireB(): ExerciceEqExpoB {
  const base = tirerBaseAB();
  const forcerContradiction = Math.random() < 0.5;
  const m2 = tirerEntierNonNul(-4, 4);
  const n2 = tirerEntier(-5, 5);

  let m1: number;
  let n1: number;
  if (forcerContradiction) {
    m1 = 2 * m2;
    n1 = tirerEntier(-5, 5);
    if (n1 === 2 * n2) n1 += 1; // garantit n1≠2·n2 (sinon l'équation serait une IDENTITÉ, pas une contradiction)
  } else {
    do {
      m1 = tirerEntierNonNul(-4, 4);
    } while (m1 === 2 * m2);
    n1 = tirerEntier(-5, 5);
  }

  const contradictoire = m1 === 2 * m2; // recalculé depuis les données réelles, jamais depuis le simple flag de tirage
  const x = contradictoire ? null : (2 * n2 - n1) / (m1 - 2 * m2);

  return { famille: "B", base, m1, n1, m2, n2, contradictoire, x };
}
