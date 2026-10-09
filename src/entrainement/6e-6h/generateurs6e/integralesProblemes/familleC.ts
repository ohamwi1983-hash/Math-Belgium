import type { ExerciceFamilleC_Problemes } from "../../core6e/integralesProblemes.types";

/**
 * Couche A (6e) — famille C de `6gen29` : travail d'une force affine (loi de Hooke), F(x)=k·x,
 * k trouvé depuis une paire (F0,x0) connue, W=∫[a;b] k·x dx.
 *
 * Variante "2 travaux à comparer" (spec) : intervalle [a2;b2] de même longueur (b−a) que [a;b] mais
 * de position DIFFÉRENTE — bonne occasion de faire remarquer que W dépend de la POSITION de
 * l'intervalle (F(x)=kx non constante), pas seulement de sa longueur.
 */

function entierEntre(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function construireBase(): { F0: number; x0: number; k: number; a: number; b: number } {
  // x0 choisi d'abord (petit entier propre), F0 = k·x0 pour un k EXACT simple (1 à 4) — jamais
  // l'inverse (k tiré directement produirait un F0/x0 non entier dans le cas général).
  const x0 = entierEntre(1, 4);
  const k = entierEntre(1, 4);
  const F0 = k * x0;
  const a = entierEntre(1, 3);
  const b = a + entierEntre(2, 4);
  return { F0, x0, k, a, b };
}

export function construireFamilleC_Simple(): ExerciceFamilleC_Problemes {
  return { famille: "C", ...construireBase(), a2: null, b2: null };
}

/** Variante comparaison — [a2;b2] même longueur que [a;b], position différente (jamais chevauchant
 * exactement le même intervalle, sinon la comparaison est triviale). */
export function construireFamilleC_Variante(): ExerciceFamilleC_Problemes {
  const base = construireBase();
  const longueur = base.b - base.a;
  const a2 = base.b + entierEntre(1, 3); // strictement après [a;b], jamais chevauchant.
  const b2 = a2 + longueur;
  return { famille: "C", ...base, a2, b2 };
}

export function construireFamilleC(): ExerciceFamilleC_Problemes {
  return Math.random() < 0.5 ? construireFamilleC_Simple() : construireFamilleC_Variante();
}

export function travail(k: number, a: number, b: number): number {
  return (k * (b * b - a * a)) / 2;
}
