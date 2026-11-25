import type { Exercice132, Variante132 } from "../../core6e/lireConique";
import { tirer132 } from "../../core6e/lireConique";

/**
 * Couche A — générateur de `6gen132` « Lire une conique sur sa figure ou son équation réduite ».
 * `Math.random()` seul (le `?code=` rejoue le tirage). La nature (verdict du premier écran) est tirée au
 * tiers dans chaque variante, avant les nombres.
 */

export const CATALOGUE_132: { id: Variante132; label: string }[] = [
  { id: "equation", label: "Lire nature, axe, sommets, foyers… sur l'équation réduite" },
  { id: "figure", label: "Lire une conique sur sa figure et écrire son équation réduite" },
  { id: "optique", label: "Quelle conique, quelle propriété optique ?" },
];

const auHasard = (): Variante132 => CATALOGUE_132[Math.floor(Math.random() * CATALOGUE_132.length)]!.id;

export function construireAvecVariante132(id: string): Exercice132 {
  const v = CATALOGUE_132.find((x) => x.id === id);
  return tirer132(v ? v.id : auHasard());
}

export function genererExercice132(): Exercice132 {
  return tirer132(auHasard());
}
