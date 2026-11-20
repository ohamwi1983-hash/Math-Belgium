import type { ExerciceSinusoidePoints, VarianteSinusoidePoints } from "../../moteur5e/modeleSinusoidePoints";
import { choisir, entier, rat } from "../../moteur5e/trigExact";

/**
 * Générateur de 5gen52 « Construire une sinusoïde point par point » (hasard par `Math.random` :
 * `genererAvecCode` rouvre le même exercice).
 * - positif : A ∈ {1, 2, 3}, ω ∈ {1, 2, 3, 1/2} (abscisses en π) ;
 * - negatif : même chose avec A < 0 (ordre des extremums inversé) ;
 * - sansPi : ω ∈ {π, π/2, 2π} (T = 2, 4, 1 : abscisses rationnelles), A de signe quelconque.
 * φ = kπ/4, k ∈ {−3, …, 4} \ {0} (dans ]−π ; π], jamais nul : la courbe est toujours décalée) ;
 * b ∈ {−2, …, 2}. Quadrillage de 8 ou 16 colonnes (pas T/4 ou T/8).
 */

export const CATALOGUE_VARIANTES: { id: VarianteSinusoidePoints; label: string }[] = [
  { id: "positif", label: "A > 0 (abscisses en π)" },
  { id: "negatif", label: "A < 0 : courbe retournée" },
  { id: "sansPi", label: "Période sans π (ω multiple de π)" },
];

const PHIS = [-3, -2, -1, 1, 2, 3, 4].map((k) => rat(k, 4));

export function genererSinusoidePoints(variante: VarianteSinusoidePoints): ExerciceSinusoidePoints {
  const amplitude = entier(1, 3);
  const signe = variante === "positif" ? 1 : variante === "negatif" ? -1 : Math.random() < 0.5 ? 1 : -1;
  const enPi = variante !== "sansPi";
  const omega = enPi ? choisir([rat(1), rat(2), rat(3), rat(1, 2)]) : choisir([rat(1), rat(1, 2), rat(2)]);
  return { variante, A: signe * amplitude, omega, phi: choisir(PHIS), b: entier(-2, 2), enPi };
}

export function construireAvecVariante(id: string): ExerciceSinusoidePoints {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceSinusoidePoints();
  return genererSinusoidePoints(id as VarianteSinusoidePoints);
}

export function genererExerciceSinusoidePoints(): ExerciceSinusoidePoints {
  return genererSinusoidePoints(choisir(CATALOGUE_VARIANTES).id);
}
