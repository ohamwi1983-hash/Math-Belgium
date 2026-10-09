import type { ExerciceEqLogG } from "../../../core6e/equationsExpLog.types";
import { tirerEntier, tirerParmi } from "../aleatoire";

const BASES_G = [2, 3, 5, 10] as const;
const M_NON_NUL = [-3, -2, -1, 1, 2, 3] as const;

/**
 * Type 1 — `log_base(m1x+n1) = log_base(m2x+n2)`, `m1≠m2`. "Génération par construction" (cible
 * d'abord) : on choisit d'abord la solution algébrique `x0` et une valeur commune `V≤0` (le
 * standard "toujours vrai/faux" exige que la solution UNIQUE trouvée par l'algèbre viole
 * STRUCTURELLEMENT la CE), puis `n1`,`n2` sont DÉRIVÉS pour que `m1·x0+n1 = m2·x0+n2 = V` — les 2
 * arguments valent alors `V≤0` exactement à la solution algébrique, donc TOUS LES DEUX négatifs ou
 * nuls là où l'équation les annule : la CE (`m1x+n1>0` ET `m2x+n2>0`) est violée par construction,
 * quel que soit le reste.
 */
function construireViolationCE(): Extract<ExerciceEqLogG, { type: "violationCE" }> {
  const base = tirerParmi(BASES_G);
  const x0 = tirerEntier(2, 8);
  const V = -tirerEntier(0, 4); // toujours ≤ 0
  let m1 = 0;
  let m2 = 0;
  do {
    m1 = tirerParmi(M_NON_NUL);
    m2 = tirerParmi(M_NON_NUL);
  } while (m1 === m2);
  const n1 = V - m1 * x0;
  const n2 = V - m2 * x0;
  return { famille: "G", type: "violationCE", base, m1, n1, m2, n2 };
}

/**
 * Type 2 — `log_base(m1x+n1) + log_base(m2x+n2) = log_base((m1x+n1)(m2x+n2))` : IDENTITÉ par
 * construction (le membre de droite EST, littéralement, le produit des 2 arguments de gauche — la
 * règle du produit ne fait que la reconstituer), vraie pour tout x de la CE.
 */
function construireIdentite(): Extract<ExerciceEqLogG, { type: "identite" }> {
  const base = tirerParmi(BASES_G);
  const m1 = tirerParmi(M_NON_NUL);
  const m2 = tirerParmi(M_NON_NUL);
  const n1 = tirerEntier(-5, 5);
  const n2 = tirerEntier(-5, 5);
  return { famille: "G", type: "identite", base, m1, n1, m2, n2 };
}

/**
 * Type 3 — `log_base(x²+b0) = log_base(c0)`, `0<c0<b0` ⟹ `x²+b0=c0` ⟺ `x²=(c0-b0)<0` : ∅ par
 * discriminant négatif, SANS LIEN avec la CE (`x²+b0>0` pour tout x réel puisque `b0>0` — la CE de
 * cette famille est toujours ℝ tout entier).
 */
function construireDiscriminantNegatif(): Extract<ExerciceEqLogG, { type: "discriminantNegatif" }> {
  const base = tirerParmi(BASES_G);
  const b0 = tirerEntier(6, 20);
  const c0 = tirerEntier(1, b0 - 1);
  return { famille: "G", type: "discriminantNegatif", base, b0, c0 };
}

/** Famille G — tirage ÉQUIPROBABLE parmi les 3 mécanismes. */
export function construireG(): ExerciceEqLogG {
  const type = tirerParmi(["violationCE", "identite", "discriminantNegatif"] as const);
  if (type === "violationCE") return construireViolationCE();
  if (type === "identite") return construireIdentite();
  return construireDiscriminantNegatif();
}
