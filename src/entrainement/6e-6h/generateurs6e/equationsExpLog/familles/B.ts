import type { ExerciceEqLogB } from "../../../core6e/equationsExpLog.types";
import { tirerDeuxDistincts, tirerEntier, tirerParmi } from "../aleatoire";

const BASES_B = [2, 3, 5, 7] as const;
const M_NON_NUL = [-3, -2, -1, 1, 2, 3] as const;

/** Famille B — `base1^(m1x+n1) = base2^(m2x+n2)`, `base1≠base2`. Résolue en prenant le ln des deux
 * membres : `(m1x+n1)ln(base1) = (m2x+n2)ln(base2)` ⟹ `x = (n2·ln(base2)-n1·ln(base1)) /
 * (m1·ln(base1)-m2·ln(base2))`. Retire (retry) le cas dégénéré `m1·ln(base1)=m2·ln(base2)`
 * (dénominateur nul — n'arrive en pratique jamais avec des bases entières distinctes de ce pool,
 * mais gardé par prudence). */
export function construireB(): ExerciceEqLogB {
  const [base1, base2] = tirerDeuxDistincts(BASES_B);
  let m1 = 0;
  let m2 = 0;
  let n1 = 0;
  let n2 = 0;
  let denom = 0;
  do {
    m1 = tirerParmi(M_NON_NUL);
    m2 = tirerParmi(M_NON_NUL);
    n1 = tirerEntier(-4, 4);
    n2 = tirerEntier(-4, 4);
    denom = m1 * Math.log(base1) - m2 * Math.log(base2);
  } while (Math.abs(denom) < 1e-6);

  const x = (n2 * Math.log(base2) - n1 * Math.log(base1)) / denom;

  return { famille: "B", base1, base2, m1, n1, m2, n2, x };
}
