import type { Exercice126, Variante126 } from "../../core6e/tangentesPositionCercle";
import { tirer126 } from "../../core6e/tangentesPositionCercle";

/**
 * Couche A — générateur de `6gen126` « Tangentes et position relative droite–cercle ». `Math.random()`
 * seul (le `?code=` rejoue le tirage). La position (sécante, tangente, extérieure) est tirée au tiers
 * DANS la variante `position`, avant les nombres ; la tangente verticale (une fois sur quatre en T, une
 * fois sur trois depuis P) aussi.
 */

export const CATALOGUE_126: { id: Variante126; label: string }[] = [
  { id: "position", label: "Position relative d'une droite et d'un cercle (distance au centre)" },
  { id: "tangentePoint", label: "Tangente en un point du cercle" },
  { id: "tangentesExterieur", label: "Tangentes issues d'un point extérieur, longueur PT" },
];

const auHasard = (): Variante126 => CATALOGUE_126[Math.floor(Math.random() * 3)]!.id;

export function construireAvecVariante126(id: string): Exercice126 {
  const v = CATALOGUE_126.find((x) => x.id === id);
  return tirer126(v ? v.id : auHasard());
}

export function genererExercice126(): Exercice126 {
  return tirer126(auHasard());
}
