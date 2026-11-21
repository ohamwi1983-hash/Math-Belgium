/**
 * Couche core — `5gen65` « Retrouver une fonction à partir de ses asymptotes » (5e ch. 4, § 5,
 * processus 2 APPLIQUER). La FORME de f est donnée, avec ses asymptotes et un point du graphe :
 * - homographique : f(x) = (ax + b)/(x + d), AV x = p, AH y = k, point A(x₀ ; y₀) → d = −p, a = k,
 *   b = y₀(x₀ − p) − kx₀ ;
 * - oblique : f(x) = ax + b + c/(x − p), AV x = p₀, AO y = mx + q, point A → p = p₀, a = m, b = q,
 *   c = (y₀ − mx₀ − q)(x₀ − p₀).
 * Les variantes « graphique » donnent les mêmes données à LIRE sur un graphique complet (asymptotes
 * en pointillés, valeurs sur les lignes de la grille, A sur un nœud). Cinq écrans : asymptote
 * verticale, asymptote horizontale / oblique, point, f(x), vérification (limite à droite de p).
 * Tout est entier ; le numérateur ne s'annule jamais en p (sinon ce serait un trou, pas une AV).
 */

export type VarianteFonctionAsymptotes = "homographique" | "oblique" | "graphiqueHomographique" | "graphiqueOblique";

export interface ExerciceFonctionAsymptotes {
  variante: VarianteFonctionAsymptotes;
  /** Homographique : p, k, x0, y0, b. Oblique : p, m, q, c, x0, y0. */
  d: Record<string, number>;
}

export const estOblique = (e: ExerciceFonctionAsymptotes): boolean => e.variante === "oblique" || e.variante === "graphiqueOblique";
export const estGraphique = (e: ExerciceFonctionAsymptotes): boolean => e.variante.startsWith("graphique");

export function fonction(e: ExerciceFonctionAsymptotes): (x: number) => number {
  const d = e.d;
  if (estOblique(e)) return (x) => d.m * x + d.q + d.c / (x - d.p);
  return (x) => (d.k * x + d.b) / (x - d.p);
}

/** Numérateur de la forme homographique en p (≠ 0), ou c pour la forme oblique. */
export function numerateurEnP(e: ExerciceFonctionAsymptotes): number {
  return estOblique(e) ? e.d.c : e.d.k * e.d.p + e.d.b;
}

/** Signe de la limite à droite de p (±∞). */
export const limiteDroite = (e: ExerciceFonctionAsymptotes): number => (numerateurEnP(e) > 0 ? Infinity : -Infinity);

/** Points de contrôle (hors de p). */
export function pointsControle(e: ExerciceFonctionAsymptotes): number[] {
  const p = e.d.p;
  return [p - 2.7, p - 0.6, p + 0.45, p + 1.9, p + 5.3];
}

/** Fenêtre des variantes graphiques (carrée, même échelle). */
export const FENETRE = { xmin: -7, xmax: 7, ymin: -7, ymax: 7 };
