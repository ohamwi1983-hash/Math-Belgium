import type { Exercice123, Support123 } from "../../core6e/demontrerAnalytique";
import { tirer123 } from "../../core6e/demontrerAnalytique";

/**
 * Couche A — générateur de `6gen123` « Démontrer par la géométrie analytique ». `Math.random()` seul
 * (le `?code=` rejoue le tirage). Variante = propriété à démontrer ; noms des sommets, ordre des
 * options et exemple numérique proposé tirés.
 */

export const CATALOGUE_123: { id: Support123; label: string }[] = [
  { id: "parallelogramme", label: "Diagonales d'un parallélogramme (même milieu)" },
  { id: "medianes", label: "Médianes d'un triangle concourantes" },
  { id: "varignon", label: "Théorème de Varignon (milieux d'un quadrilatère)" },
  { id: "rectangleMediane", label: "Médiane relative à l'hypoténuse" },
  { id: "losange", label: "Diagonales d'un losange perpendiculaires" },
];

const auHasard = (): Support123 => CATALOGUE_123[Math.floor(Math.random() * CATALOGUE_123.length)]!.id;

export function construireAvecVariante123(id: string): Exercice123 {
  const v = CATALOGUE_123.find((x) => x.id === id);
  return tirer123(v ? v.id : auHasard());
}

export function genererExercice123(): Exercice123 {
  return tirer123(auHasard());
}
