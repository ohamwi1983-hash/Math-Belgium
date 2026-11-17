import { EXPRESSIONS_PAR_DEGRE, fr, integraleExacte, valeurExacte } from "../../core6e/linearisationEuler";
import type { BornePi, ExerciceLinearisation, IdExpressionLinearisation, IdVarianteLinearisation } from "../../core6e/linearisationEuler";

export type { IdVarianteLinearisation };

/**
 * Couche A (6e) — générateur de `6gen93` « Linéariser avec les formules d'Euler ». N'utilise QUE
 * `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue exactement le même
 * tirage, dans l'appli comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * - `degre2` / `degre3` / `degre4` : linéariser une expression de ce degré en quatre écrans (Euler,
 *   binôme, regroupement, forme linéarisée) — l'expression est tirée uniformément dans la famille,
 *   avec une pulsation a ∈ {1 ; 2 ; 3} (cos³(2x)…), a = 1 une fois sur deux.
 * - `application` : linéariser l'une des neuf expressions, en déduire une primitive, puis une
 *   intégrale exacte sur un intervalle remarquable (lien avec le chapitre 4). Une intégrale nulle
 *   (cos³x sur [0 ; π], par exemple) est écartée : elle n'apprend rien sur le calcul.
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

/** Intervalles remarquables : bornes en multiples de π (valeurs exactes des sinus et cosinus). */
export const INTERVALLES: { a: BornePi; b: BornePi }[] = [
  { a: fr(0), b: fr(1, 2) },
  { a: fr(0), b: fr(1) },
  { a: fr(0), b: fr(1, 4) },
  { a: fr(0), b: fr(1, 3) },
  { a: fr(0), b: fr(1, 6) },
  { a: fr(1, 6), b: fr(1, 2) },
  { a: fr(1, 4), b: fr(1, 2) },
  { a: fr(1, 6), b: fr(1, 3) },
];

/** Pulsation a des variantes de linéarisation (cos²x une fois sur deux, sinon cos²(2x), cos²(3x)…) :
 * sans elle, une famille de degré 2 n'aurait que deux exercices, et les séries d'une évaluation se
 * répéteraient. L'application garde a = 1 (son intervalle varie déjà). */
const PULSATIONS = [1, 1, 2, 3];

const TOUTES: IdExpressionLinearisation[] = [...EXPRESSIONS_PAR_DEGRE[2], ...EXPRESSIONS_PAR_DEGRE[3], ...EXPRESSIONS_PAR_DEGRE[4]];

function construireApplication(): ExerciceLinearisation {
  for (;;) {
    const e: ExerciceLinearisation = { variante: "application", expression: parmi(TOUTES), a: 1, intervalle: parmi(INTERVALLES) };
    if (Math.abs(valeurExacte(integraleExacte(e))) > 1e-9) return e;
  }
}

export const CATALOGUE_VARIANTES: { id: IdVarianteLinearisation; label: string }[] = [
  { id: "degre2", label: "Degré 2 : cos²x ou sin²x, aussi de 2x ou 3x (Euler, binôme, regroupement, forme linéarisée)" },
  { id: "degre3", label: "Degré 3 : cos³x, sin³x, cos²x·sin x ou cos x·sin²x (de x, 2x ou 3x)" },
  { id: "degre4", label: "Degré 4 : cos⁴x, sin⁴x ou cos²x·sin²x (de x, 2x ou 3x)" },
  { id: "application", label: "Linéariser pour intégrer : primitive et intégrale sur un intervalle remarquable" },
];

export function construireAvecVarianteId(id: IdVarianteLinearisation): ExerciceLinearisation {
  switch (id) {
    case "degre2":
      return { variante: id, expression: parmi(EXPRESSIONS_PAR_DEGRE[2]), a: parmi(PULSATIONS), intervalle: null };
    case "degre3":
      return { variante: id, expression: parmi(EXPRESSIONS_PAR_DEGRE[3]), a: parmi(PULSATIONS), intervalle: null };
    case "degre4":
      return { variante: id, expression: parmi(EXPRESSIONS_PAR_DEGRE[4]), a: parmi(PULSATIONS), intervalle: null };
    case "application":
      return construireApplication();
  }
}

/** Tirage libre : les quatre variantes à parts égales. */
export function genererExerciceLinearisation(): ExerciceLinearisation {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
