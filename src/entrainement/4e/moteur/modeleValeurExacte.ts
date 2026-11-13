import type { AngleReference, ExerciceValeurExacte, FonctionTrig, QuadrantStrict, TermeTrig } from "../core/valeurExacte.types";
import { calculerAnglePremierQuadrant, calculerQuadrant } from "../generateurs/cercleTrigonometrique/quadrantCalculs";
import { exact, frac, oppose, produit, somme, difference, UN, type NombreExact } from "./corpsValeurExacte";

/**
 * Modèle de gen76 : tout ce qui se déduit d'un terme (angle réduit, quadrant, angle associé du
 * premier quadrant, signe, valeur exacte) et la valeur exacte de l'expression. Une seule source pour
 * l'écran, la vérification, les aides et l'adaptateur papier. Quadrant et angle associé réutilisent
 * les fonctions de gen14 (`quadrantCalculs.ts`).
 */

export function angleReduit(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

/** L'angle doit-il être ramené dans [0° ; 360°[ ? */
export function necessiteReduction(t: TermeTrig): boolean {
  return t.angle < 0 || t.angle >= 360;
}

export function quadrantDe(t: TermeTrig): QuadrantStrict {
  const q = calculerQuadrant(angleReduit(t.angle));
  if (q === "axeOx" || q === "axeOy") throw new Error(`gen76 : angle sur un axe (${t.angle}°)`);
  return q;
}

export function angleAssocie(t: TermeTrig): AngleReference {
  return calculerAnglePremierQuadrant(angleReduit(t.angle), quadrantDe(t)) as AngleReference;
}

/** Signe de la fonction dans le quadrant (règle du cours : sin > 0 en I et II, cos > 0 en I et IV,
 * tan > 0 en I et III). */
export function signeDe(t: TermeTrig): 1 | -1 {
  const q = quadrantDe(t);
  if (t.fonction === "sin") return q === "I" || q === "II" ? 1 : -1;
  if (t.fonction === "cos") return q === "I" || q === "IV" ? 1 : -1;
  return q === "I" || q === "III" ? 1 : -1;
}

const R2_2 = exact(frac(0), frac(1, 2));
const R3_2 = exact(frac(0), frac(0), frac(1, 2));
const DEMI = exact(frac(1, 2));
const R3_3 = exact(frac(0), frac(0), frac(1, 3));
const R3 = exact(frac(0), frac(0), frac(1));

/** Valeurs remarquables du premier quadrant (positives), exactes. */
export function valeurRemarquable(fonction: FonctionTrig, ref: AngleReference): NombreExact {
  if (fonction === "sin") return ref === 30 ? DEMI : ref === 45 ? R2_2 : R3_2;
  if (fonction === "cos") return ref === 30 ? R3_2 : ref === 45 ? R2_2 : DEMI;
  return ref === 30 ? R3_3 : ref === 45 ? UN : R3;
}

/** Valeur exacte de la fonction en l'angle du terme (SANS le carré éventuel). */
export function valeurFonction(t: TermeTrig): NombreExact {
  const v = valeurRemarquable(t.fonction, angleAssocie(t));
  return signeDe(t) === 1 ? v : oppose(v);
}

/** Valeur du terme dans l'expression (carré compris). */
export function valeurTerme(t: TermeTrig): NombreExact {
  const v = valeurFonction(t);
  return t.carre ? produit(v, v) : v;
}

/** Groupes additifs : les produits sont calculés d'abord (priorité usuelle). Chaque groupe porte le
 * signe de l'opérateur qui le précède et la liste des indices de ses termes. */
export function groupesAdditifs(e: ExerciceValeurExacte): { signe: 1 | -1; indices: number[] }[] {
  const groupes: { signe: 1 | -1; indices: number[] }[] = [{ signe: 1, indices: [0] }];
  e.operateurs.forEach((op, i) => {
    if (op === "*") groupes[groupes.length - 1]!.indices.push(i + 1);
    else groupes.push({ signe: op === "+" ? 1 : -1, indices: [i + 1] });
  });
  return groupes;
}

export function valeurGroupe(e: ExerciceValeurExacte, indices: number[]): NombreExact {
  return indices.map((i) => valeurTerme(e.termes[i]!)).reduce((p, v) => produit(p, v));
}

export function valeurExpression(e: ExerciceValeurExacte): NombreExact {
  return groupesAdditifs(e).reduce<NombreExact>((acc, g) => (g.signe === 1 ? somme(acc, valeurGroupe(e, g.indices)) : difference(acc, valeurGroupe(e, g.indices))), exact(frac(0)));
}

/** Le terme est-il déjà sur un angle du premier quadrant (après réduction éventuelle) ? */
export function estPremierQuadrant(t: TermeTrig): boolean {
  return quadrantDe(t) === "I";
}
