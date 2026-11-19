import type { Exercice } from "../core/generateur.types";
import type { ExerciceEquationRationnelle } from "../core/equationRationnelle.types";

const TOL = 1e-9;

/**
 * Méthode du dénominateur commun (gen4, audit 4e ch. 2 G5) — recommandée par le cours (§ 5) : quand
 * l'équation sans fraction du produit en croix a pour racine une valeur interdite c (deux
 * dénominateurs qui partagent le facteur x − c), multiplier par le dénominateur COMMUN donne
 * directement l'équation du premier degré, quotient de l'équation du 2nd degré par (x − c). Elle
 * est acceptée à l'écran « Élimine les dénominateurs » ; l'écran suivant résout alors une équation
 * du premier degré (chemin linéaire déjà prévu par le moteur : `equationIsolee.enonce.a === 0`).
 *
 * Renvoie null quand aucune racine de l'équation obtenue n'est une valeur interdite (le produit en
 * croix et le dénominateur commun donnent alors la même équation).
 */
export function equationDenominateurCommun(ex: ExerciceEquationRationnelle): Exercice | null {
  const eq = ex.equationIsolee;
  if (eq.enonce.a === 0) return null;
  const racines = eq.solution.racines;
  const estRacine = (v: number) => racines.some((r) => Math.abs(r - v) < TOL);
  // deux dénominateurs : c'est x = p (facteur commun de A/(x − p) et N(x)/((x − p)(x − s))) que le
  // produit en croix ajoute ; sinon la valeur interdite racine de l'équation obtenue.
  const c = ex.construction === "deux_denominateurs" ? ex.p : ex.ce.find(estRacine);
  if (c === undefined || !estRacine(c)) return null;
  const { a, b } = eq.enonce;
  // ax² + bx + c₀ = (x − c)(ax + (b + ac)) : le reste est nul puisque c est racine.
  const enonce = { a: 0, b: a, c: b + a * c };
  const autre = racines.find((r) => Math.abs(r - c) > TOL) ?? c;
  return {
    categorie: "cas_general",
    enonce,
    solution: { racines: [autre, autre], racinesExactes: true },
    formeAffichage: "canonique",
  };
}

/** Même exercice, résolu par le dénominateur commun quand cette méthode raccourcit (corrigé papier). */
export function avecDenominateurCommun<T extends ExerciceEquationRationnelle>(ex: T): T {
  const lin = equationDenominateurCommun(ex);
  return lin ? { ...ex, equationIsolee: lin } : ex;
}
