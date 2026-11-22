import type { EquationAB } from "../ui5e/ecrituresApplicationsDerivees";

/**
 * Couche core — `5gen69` « Déterminer une fonction par des conditions » (5e ch. 5, § 5 « Étude
 * locale », processus 3 TRANSFÉRER). On cherche f(x) = ax³ + bx² + cx + d (a ≠ 0, coefficients
 * entiers) à partir de conditions sur sa courbe :
 * - tangenteHorizontale : tangente en 0 donnée (y = mx + p ⇒ c = m, d = p) et tangente HORIZONTALE au
 *   point (x₀ ; y₀) ⇒ f′(x₀) = 0 et f(x₀) = y₀ ; verdict : maximum, minimum ou aucun extremum
 *   (palier, f′ = 3a(x − x₀)² ne change pas de signe) — un tiers chacun ;
 * - inflexion : tangente en 0 donnée, point d'inflexion d'abscisse x₁ (f″(x₁) = 0) et passage par
 *   (x₂ ; y₂) ; verdict : concave puis convexe (a > 0) ou l'inverse — moitié chacun ;
 * - deuxTangentes : tangentes horizontales en 0 et en x₂ (c = 0, f′(x₂) = 0), passage par (0 ; p) et
 *   (x₂ ; y₂) ; verdict en x₂ : maximum ou minimum — moitié chacun.
 * Cinq écrans : c et d (conditions directes), système en a et b (choix fermé parmi quatre),
 * résolution (a, b), f′(x) (f″(x) pour l'inflexion), nature (choix fermé). Le système a toujours une
 * solution unique entière (déterminant ≠ 0 par construction).
 */

export type VarianteFonctionConditions = "tangenteHorizontale" | "inflexion" | "deuxTangentes";
export type NatureConditions = "max" | "min" | "palier" | "concaveConvexe" | "convexeConcave";

export interface ExerciceFonctionConditions {
  variante: VarianteFonctionConditions;
  a: number;
  b: number;
  c: number;
  d: number;
  /** Abscisse du point étudié : x₀ (tangente horizontale), x₁ (inflexion), x₂ (deux tangentes). */
  xs: number;
  /** Inflexion : point (x₂ ; y₂) du graphe ; deux tangentes : y₂ = f(x₂) ; tangente horizontale : y₀. */
  xp: number;
  yp: number;
  /** Autre racine de f′ (tangente horizontale ; = xs pour un palier). */
  autre: number;
  nature: NatureConditions;
  /** Ordre d'affichage des quatre systèmes (indices dans `systemes`) ; la bonne option est l'indice 0. */
  ordre: number[];
}

type E = ExerciceFonctionConditions;

export const coefs = (e: E): number[] => [e.a, e.b, e.c, e.d];
export const f = (e: E) => (x: number): number => ((e.a * x + e.b) * x + e.c) * x + e.d;
export const fp = (e: E) => (x: number): number => (3 * e.a * x + 2 * e.b) * x + e.c;
export const fpp = (e: E) => (x: number): number => 6 * e.a * x + 2 * e.b;

/** Système correct puis trois systèmes faux (erreurs classiques), dans cet ordre. */
export function systemes(e: E): [EquationAB, EquationAB][] {
  const { c, d, xs: x, xp, yp } = e;
  if (e.variante === "tangenteHorizontale")
    return [
      // f′(x₀) = 0 ; f(x₀) = y₀.
      [{ al: 3 * x * x, be: 2 * x, ga: -c }, { al: x ** 3, be: x * x, ga: yp - c * x - d }],
      // f et f′ échangées : f(x₀) = 0 ; f′(x₀) = y₀.
      [{ al: x ** 3, be: x * x, ga: -c * x - d }, { al: 3 * x * x, be: 2 * x, ga: yp - c }],
      // c et d oubliés.
      [{ al: 3 * x * x, be: 2 * x, ga: 0 }, { al: x ** 3, be: x * x, ga: yp }],
      // Dérivée sans les exposants : f′(x) = ax² + bx + c.
      [{ al: x * x, be: x, ga: -c }, { al: x ** 3, be: x * x, ga: yp - c * x - d }],
    ];
  if (e.variante === "inflexion")
    return [
      // f″(x₁) = 0 ; f(x₂) = y₂.
      [{ al: 6 * x, be: 2, ga: 0 }, { al: xp ** 3, be: xp * xp, ga: yp - c * xp - d }],
      // Inflexion prise pour un extremum : f′(x₁) = 0.
      [{ al: 3 * x * x, be: 2 * x, ga: -c }, { al: xp ** 3, be: xp * xp, ga: yp - c * xp - d }],
      // c et d oubliés.
      [{ al: 6 * x, be: 2, ga: 0 }, { al: xp ** 3, be: xp * xp, ga: yp }],
      // f″ fausse : 6ax + b.
      [{ al: 6 * x, be: 1, ga: 0 }, { al: xp ** 3, be: xp * xp, ga: yp - c * xp - d }],
    ];
  return [
    // f′(x₂) = 0 ; f(x₂) = y₂ (c = 0, d = p).
    [{ al: 3 * x * x, be: 2 * x, ga: 0 }, { al: x ** 3, be: x * x, ga: yp - d }],
    // f et f′ échangées.
    [{ al: x ** 3, be: x * x, ga: -d }, { al: 3 * x * x, be: 2 * x, ga: yp }],
    // d oublié.
    [{ al: 3 * x * x, be: 2 * x, ga: 0 }, { al: x ** 3, be: x * x, ga: yp }],
    // Dérivée sans les exposants.
    [{ al: x * x, be: x, ga: 0 }, { al: x ** 3, be: x * x, ga: yp - d }],
  ];
}

/** Identifiant d'option d'un système (« s0 » = le bon). */
export const idSysteme = (k: number): string => `s${k}`;

/** Options de nature proposées (toujours trois, structure fixe). */
export function optionsNature(e: E): NatureConditions[] {
  return e.variante === "inflexion" ? ["concaveConvexe", "convexeConcave", "palier"] : ["max", "min", "palier"];
}

/** Points de contrôle d'une dérivée saisie. */
export const POINTS_CONTROLE = [-2.3, -1.1, -0.4, 0.6, 1.7, 2.9];
