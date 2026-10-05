/**
 * Couche B (5e) — vérification pour 5gen26 ("Calculer f'(a) par la définition"). N'importe jamais
 * rien de `src/generateurs5e/`.
 *
 * Réplique localement (jamais importée) `valeurFonction` (`generateurs5e/definitionDerivee/index.ts`)
 * — évaluation numérique pure de f, nécessaire à la fois côté génération et côté vérification, mais
 * qui ne doit jamais franchir la frontière moteur↔générateurs (règle non négociable, CLAUDE.md) —
 * même esprit que `verificationAsymptoteOblique.ts` répliquant la technique "équivalence par
 * échantillonnage" de 5gen20 sans importer son code.
 *
 * Réutilise DIRECTEMENT `diagnostiquerNombre` (5gen21, elle-même 5gen6, Couche B↔B) pour tout champ
 * "nombre exact" (f(a), f'(a)), et la même technique "substitution littérale + evaluerExpressionGenerale"
 * que `diagnostiquerConstructionC` (5gen23) pour les 2 champs symboliques en h.
 */
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerNombre } from "./verificationAsymptoteOblique";

export { diagnostiquerNombre };

/** Réplique locale de `valeurFonction` (générateurs5e/definitionDerivee) — évaluation numérique
 * pure de f, jamais importée depuis la Couche A. */
export function valeurFonction(exercice: ExerciceDefinitionDerivee, x: number): number {
  switch (exercice.famille) {
    case "affine":
      return exercice.m * x + exercice.p;
    case "quadratique":
      return exercice.m * x * x + exercice.p;
    case "rationnelleSimple":
      return exercice.expo === 1 ? exercice.k / x : exercice.k / (x * x);
    case "rationnelleLineaire":
      return (exercice.m * x + exercice.p) / (x - exercice.q);
  }
}

/** f'(a) exact, formule fermée par famille — réplique locale de `deriveeExacte` (générateurs5e),
 * ici en flottant simple (pas de FractionExacte : `diagnostiquerNombre` compare numériquement). */
export function valeurDeriveeExacte(exercice: ExerciceDefinitionDerivee, a: number): number {
  switch (exercice.famille) {
    case "affine":
      return exercice.m;
    case "quadratique":
      return 2 * exercice.m * a;
    case "rationnelleSimple":
      return exercice.expo === 1 ? -exercice.k / (a * a) : (-2 * exercice.k) / (a * a * a);
    case "rationnelleLineaire":
      return -(exercice.m * exercice.q + exercice.p) / ((a - exercice.q) * (a - exercice.q));
  }
}

function substituerHParX(texte: string): string {
  return texte.replace(/(?<![a-zA-Z])h(?![a-zA-Z])/g, "x");
}

const ECHANTILLONS_H = [0.7, -0.4, 1.3, -0.9, 0.2];

/** true si `a+h` tombe sur le pôle de `exercice` (à epsilon près) — jamais échantillonné dans ce
 * cas, l'expression attendue n'y étant définie ni côté élève ni côté cible. Défensif : par
 * construction (générateur), `a` est toujours choisi à distance ≥1 du pôle, et les `h` de
 * `ECHANTILLONS_H` sont tous non entiers, donc ce cas ne se présente jamais en pratique. */
function surPole(exercice: ExerciceDefinitionDerivee, a: number, h: number): boolean {
  if (exercice.famille === "rationnelleSimple") return Math.abs(a + h) < 1e-6;
  if (exercice.famille === "rationnelleLineaire") return Math.abs(a + h - exercice.q) < 1e-6;
  return false;
}

/** Écran "developper", champ "développer f(a+h)" — équivalence algébrique en h, échantillonnée sur
 * `ECHANTILLONS_H` (h=0 n'a rien de spécial ici, f(a+h) y est simplement f(a), aucune raison de
 * l'exclure). */
export function diagnostiquerDeveloppementH(texte: string, exercice: ExerciceDefinitionDerivee, a: number): StatutVerification {
  try {
    const substitue = substituerHParX(texte);
    let auMoinsUnPoint = false;
    for (const h of ECHANTILLONS_H) {
      if (surPole(exercice, a, h)) continue;
      auMoinsUnPoint = true;
      const valeurEntree = evaluerExpressionGenerale(substitue, h);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      if (Math.abs(valeurEntree - valeurFonction(exercice, a + h)) > 1e-4) return "not_equivalent";
    }
    return auMoinsUnPoint ? "correct" : "parse_error";
  } catch {
    return "parse_error";
  }
}

/** Écran "quotient", champ "quotient simplifié" — équivalence algébrique en h, cible
 * (f(a+h)-f(a))/h, valable pour TOUTE expression algébriquement égale au taux d'accroissement,
 * qu'elle soit ou non totalement simplifiée. h=0 exclu (division par 0 du côté de la cible). */
export function diagnostiquerQuotientH(texte: string, exercice: ExerciceDefinitionDerivee, a: number): StatutVerification {
  try {
    const substitue = substituerHParX(texte);
    const fA = valeurFonction(exercice, a);
    let auMoinsUnPoint = false;
    for (const h of ECHANTILLONS_H) {
      if (h === 0 || surPole(exercice, a, h)) continue;
      auMoinsUnPoint = true;
      const valeurEntree = evaluerExpressionGenerale(substitue, h);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      const cible = (valeurFonction(exercice, a + h) - fA) / h;
      if (Math.abs(valeurEntree - cible) > 1e-4) return "not_equivalent";
    }
    return auMoinsUnPoint ? "correct" : "parse_error";
  } catch {
    return "parse_error";
  }
}

/** Écran "developper", champ "f(a)" — nombre exact, réutilise `diagnostiquerNombre`. */
export function diagnostiquerValeurFA(texte: string, exercice: ExerciceDefinitionDerivee, a: number): StatutVerification {
  return diagnostiquerNombre(texte, valeurFonction(exercice, a));
}

/** Écran "limite", champ "f'(a)" — nombre exact, réutilise `diagnostiquerNombre`. */
export function diagnostiquerLimiteDerivee(texte: string, exercice: ExerciceDefinitionDerivee, a: number): StatutVerification {
  return diagnostiquerNombre(texte, valeurDeriveeExacte(exercice, a));
}
