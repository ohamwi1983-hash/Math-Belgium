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

// ============================================================================
// Contrôles de FORME (audit 5c5a, point 12, décision C) — appelés AVANT la validation par les
// écrans : un message ciblé, sans consommer de tentative, quand l'expression recopiée de l'énoncé
// (f(a+h) non développé, taux d'accroissement non simplifié) serait sinon acceptée par la seule
// équivalence numérique.
// ============================================================================

/** Groupes parenthésés de premier niveau, avec ce qui les entoure — `null` si le parenthésage est
 * déséquilibré (laissé à la vérification, qui renverra parse_error). */
function groupesParentheses(texte: string): { profondeurMax: number; groupes: { avant: string; apres: string }[] } | null {
  const t = texte.replace(/\s+/g, "");
  let profondeur = 0;
  let profondeurMax = 0;
  let debut = -1;
  const groupes: { avant: string; apres: string }[] = [];
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "(") {
      if (profondeur === 0) debut = i;
      profondeur += 1;
      profondeurMax = Math.max(profondeurMax, profondeur);
    } else if (c === ")") {
      profondeur -= 1;
      if (profondeur < 0) return null;
      if (profondeur === 0) groupes.push({ avant: t[debut - 1] ?? "", apres: t[i + 1] ?? "" });
    }
  }
  return profondeur === 0 ? { profondeurMax, groupes } : null;
}

export const MESSAGE_FORME_DEVELOPPEMENT_POLYNOME = "Développe complètement f(a + h) : il ne doit plus rester de parenthèses.";
export const MESSAGE_FORME_DEVELOPPEMENT_RATIONNELLE =
  "Réduis f(a + h) : écris un seul numérateur et un seul dénominateur, chacun développé et réduit (sans parenthèses à l'intérieur).";
export const MESSAGE_FORME_QUOTIENT =
  "Simplifie encore le taux d'accroissement : il ne doit plus rester de facteur h à simplifier, l'expression doit pouvoir être calculée pour h = 0.";

/** f(a+h) « développé » :
 * - familles polynomiales : aucune parenthèse ;
 * - familles rationnelles : au plus un niveau de parenthèses, chaque groupe étant un numérateur
 *   (suivi de « / ») ou un dénominateur (précédé de « / »), éventuellement élevé au carré. */
export function controlerFormeDeveloppement(texte: string, exercice: ExerciceDefinitionDerivee): string | null {
  const analyse = groupesParentheses(texte);
  if (analyse === null) return null;
  if (exercice.famille === "affine" || exercice.famille === "quadratique") {
    return analyse.profondeurMax === 0 ? null : MESSAGE_FORME_DEVELOPPEMENT_POLYNOME;
  }
  if (analyse.profondeurMax > 1) return MESSAGE_FORME_DEVELOPPEMENT_RATIONNELLE;
  const groupesValides = analyse.groupes.every((g) => g.apres === "/" || g.avant === "/");
  return groupesValides ? null : MESSAGE_FORME_DEVELOPPEMENT_RATIONNELLE;
}

/** Taux d'accroissement « simplifié » : plus de facteur h au dénominateur qui annulerait le
 * quotient en h = 0 — l'expression saisie doit être calculable (finie) pour h = 0. */
export function controlerFormeQuotient(texte: string): string | null {
  try {
    const v = evaluerExpressionGenerale(substituerHParX(texte), 0);
    return Number.isFinite(v) ? null : MESSAGE_FORME_QUOTIENT;
  } catch {
    return null;
  }
}
