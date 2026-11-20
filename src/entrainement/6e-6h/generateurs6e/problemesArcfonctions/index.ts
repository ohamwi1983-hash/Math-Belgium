import type { ContexteVue, ExerciceProblemesArcfonctions, Milieu, VarianteProblemesArcfonctions } from "../../core6e/problemesArcfonctions";
import { MILIEUX, angleLimite, angleRefracte, angleRefracteMax, angleVue, distanceOptimale } from "../../core6e/problemesArcfonctions";

/**
 * Couche A — générateur de `6gen156` « Problèmes avec arcfonctions ». `Math.random()` seul
 * (`?code=` : mêmes fonctions que l'adaptateur papier). Indices de réfraction réels (eau 1,33,
 * verre 1,50, plexiglas 1,49, diamant 2,42) ; angles entiers ; longueurs réalistes (tableau de
 * musée, écran de cinéma, panneau, échelle de 3 à 6 m).
 * - `refraction` : incidence 25°–70°, angle de réfraction voulu (b) entre 10° et l'angle maximal − 2° ;
 * - `reflexion-totale` : incidence (b) sous l'angle limite − 5° ; incidence du verdict (c) à 3° au
 *   moins de l'angle limite, du bon côté selon un verdict tiré 50/50 ;
 * - `angle-de-vue` : distance x₀ (a) à 0,3 m au moins de la distance optimale ;
 * - `echelle` : pied entre 0,2 L et 0,45 L, hauteur (c) entre 0,8 L et 0,97 L (au décimètre).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}
function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
const r2 = (x: number) => Math.round(x * 100) / 100;

function refraction(): ExerciceProblemesArcfonctions {
  const milieu2: Milieu = MILIEUX[parmi(["eau", "verre", "plexiglas", "diamant"] as const)];
  const milieu1 = MILIEUX.air;
  const theta1 = parmi([25, 30, 35, 40, 45, 50, 55, 60, 65, 70]);
  const max = angleRefracteMax(milieu1.n, milieu2.n);
  for (;;) {
    const theta2Voulu = entier(10, Math.floor(max - 2));
    // L'angle voulu ne doit pas être (presque) celui de la question a.
    if (Math.abs(theta2Voulu - angleRefracte(milieu1.n, milieu2.n, theta1)) < 2) continue;
    return { variante: "refraction", milieu1, milieu2, theta1, theta2Voulu, cleCollecteur: `refraction/${milieu2.id}` };
  }
}

const PAIRES_REFLEXION = [
  { contexte: "piscine", m1: "eau", m2: "air" },
  { contexte: "fibre", m1: "verre", m2: "air" },
  { contexte: "aquarium", m1: "verre", m2: "eau" },
  { contexte: "diamant", m1: "diamant", m2: "air" },
] as const;

function reflexion(): ExerciceProblemesArcfonctions {
  const p = parmi(PAIRES_REFLEXION);
  const milieu1 = MILIEUX[p.m1];
  const milieu2 = MILIEUX[p.m2];
  const L = angleLimite(milieu1.n, milieu2.n);
  const theta1 = entier(Math.max(8, Math.ceil(L - 25)), Math.floor(L - 5));
  const oui = Math.random() < 0.5;
  for (;;) {
    const theta1Verdict = oui ? entier(Math.max(5, Math.ceil(L - 20)), Math.floor(L - 3)) : entier(Math.ceil(L + 3), Math.min(85, Math.floor(L + 25)));
    if (theta1Verdict === theta1) continue;
    return { variante: "reflexion-totale", milieu1, milieu2, theta1, theta1Verdict, contexte: p.contexte, cleCollecteur: `reflexion-totale/${p.contexte}/${oui ? "oui" : "non"}` };
  }
}

const VUES: Record<ContexteVue, { a: number[]; h: number[]; x0: number[] }> = {
  musee: { a: [0.4, 0.5, 0.6, 0.8], h: [1, 1.2, 1.5, 2], x0: [1, 1.5, 2, 3, 4] },
  cinema: { a: [1.5, 2, 2.5, 3], h: [6, 8, 10], x0: [5, 8, 10, 15, 20] },
  panneau: { a: [2, 3, 4], h: [3, 4, 5], x0: [2, 5, 8, 10] },
};

function vue(): ExerciceProblemesArcfonctions {
  const contexte = parmi(["musee", "cinema", "panneau"] as const);
  const c = VUES[contexte];
  for (;;) {
    const a = parmi(c.a);
    const b = r2(a + parmi(c.h));
    const x0 = parmi(c.x0);
    if (Math.abs(x0 - distanceOptimale(a, b)) < 0.3) continue;
    // Angle de la question a distinct de l'angle maximal au dixième (sinon b et c se confondent).
    if (Math.abs(angleVue(a, b, x0) - angleVue(a, b, distanceOptimale(a, b))) < 0.3) continue;
    return { variante: "angle-de-vue", contexte, a, b, x0, cleCollecteur: `angle-de-vue/${contexte}` };
  }
}

function echelle(): ExerciceProblemesArcfonctions {
  const L = parmi([3, 3.5, 4, 5, 6]);
  for (;;) {
    const d = r2(entier(Math.ceil(2 * L), Math.floor(4.5 * L)) / 10);
    const h = r2(entier(Math.ceil(8 * L), Math.floor(9.7 * L)) / 10);
    if (h >= L || d >= L) continue;
    return { variante: "echelle", L, d, h, cleCollecteur: `echelle/L${L}` };
  }
}

export function construire(variante: VarianteProblemesArcfonctions): ExerciceProblemesArcfonctions {
  switch (variante) {
    case "refraction":
      return refraction();
    case "reflexion-totale":
      return reflexion();
    case "angle-de-vue":
      return vue();
    case "echelle":
      return echelle();
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteProblemesArcfonctions; label: string }[] = [
  { id: "refraction", label: "Réfraction : de l'air vers l'eau, le verre ou le diamant" },
  { id: "reflexion-totale", label: "Angle limite et réflexion totale" },
  { id: "angle-de-vue", label: "Angle de vue d'un tableau ou d'un écran" },
  { id: "echelle", label: "Échelle contre un mur" },
];

export function construireAvecVarianteId(id: VarianteProblemesArcfonctions): ExerciceProblemesArcfonctions {
  return construire(id);
}

export function genererExerciceProblemesArcfonctions(): ExerciceProblemesArcfonctions {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
