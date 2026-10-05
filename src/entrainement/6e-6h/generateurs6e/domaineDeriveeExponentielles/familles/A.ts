import type { ExerciceDomaineDeriveeA, ExerciceDomaineDeriveeACarre, ExerciceDomaineDeriveeADirect, FormeGA } from "../../../core6e/domaineDeriveeExponentielles.types";
import { ensembleReel } from "../../ensembleReel";
import { tirerBaseAvecE, tirerEntier, tirerParmi } from "../aleatoire";

/**
 * Famille A — application directe, domaine ℝ (2 écrans : domaine, dérivée). Domaine TOUJOURS ℝ,
 * dans les deux sous-types (une exponentielle composée d'une fonction définie partout reste
 * définie partout) — aucune construction "cible d'abord" nécessaire pour l'écran domaine, la seule
 * réponse possible est `ℝ`.
 *
 * Sous-type "direct" — f(x) = base^(g(x)), g(x) affine (m·x+n, m≠0) ou puissance pure (x² ou x³).
 * f'(x) = g'(x)·base^(g(x))·ln(base) — g'(x)=m (affine) ou exposant·x^(exposant-1) (puissance).
 *
 * Sous-type "carre" — f(x) = (base^(mx+n)−c)². Avec u=base^(mx+n)−c : f=u², f'=2u·u',
 * u'=m·ln(base)·base^(mx+n) — donc f'(x)=2·(base^(mx+n)−c)·m·ln(base)·base^(mx+n).
 */
export function construireA(): ExerciceDomaineDeriveeA {
  return Math.random() < 0.5 ? construireDirect() : construireCarre();
}

function construireDirect(): ExerciceDomaineDeriveeADirect {
  const { base, baseEstE } = tirerBaseAvecE(2, 9);
  const g: FormeGA =
    Math.random() < 0.5
      ? { type: "affine", m: tirerParmi([-5, -4, -3, -2, 2, 3, 4, 5] as const), n: tirerEntier(-3, 3) }
      : { type: "puissance", exposant: tirerParmi([2, 3] as const) };
  return { famille: "A", sousType: "direct", domaine: ensembleReel(), base, baseEstE, g };
}

function construireCarre(): ExerciceDomaineDeriveeACarre {
  const { base, baseEstE } = tirerBaseAvecE(2, 9);
  const m = tirerParmi([1, 2, 3] as const);
  const n = tirerEntier(-3, 3);
  const c = tirerParmi([1, 2, 3] as const);
  return { famille: "A", sousType: "carre", domaine: ensembleReel(), base, baseEstE, m, n, c };
}

// ============================================================================
// Petites primitives PURES exposées pour être réutilisées par le moteur de vérification (Couche
// B), qui n'importe JAMAIS `src/generateurs6e/` — voir CLAUDE.md, règle d'architecture. Ces
// fonctions sont donc dupliquées à l'identique dans `moteur6e/verificationDomaineDeriveeExponentielles.ts`
// (jamais importées) ; elles sont exportées ici uniquement pour que LES TESTS de ce fichier
// puissent cross-vérifier la génération elle-même par une méthode indépendante (différences finies)
// sans dupliquer une troisième fois cette même arithmétique dans le fichier de test.
// ============================================================================

export function evaluerFA(exercice: ExerciceDomaineDeriveeA, x: number): number {
  if (exercice.sousType === "direct") {
    const g = exercice.g.type === "affine" ? exercice.g.m * x + exercice.g.n : Math.pow(x, exercice.g.exposant);
    return Math.pow(exercice.base, g);
  }
  const u = Math.pow(exercice.base, exercice.m * x + exercice.n) - exercice.c;
  return u * u;
}
