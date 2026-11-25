import type { Exercice125, Famille125 } from "../../core6e/reconnaitreRemarquables";
import { tirer125 } from "../../core6e/reconnaitreRemarquables";

/**
 * Couche A — générateur de `6gen125` « Reconnaître droites, points et cercles remarquables ».
 * `Math.random()` seul (le `?code=` rejoue le tirage). Les variantes sont les FAMILLES (droite, point,
 * cercle) : leur nom ne dit pas la réponse ; l'objet (verdict) est tiré à parts égales dans la famille,
 * AVANT le triangle.
 */

export const CATALOGUE_125: { id: Famille125; label: string }[] = [
  { id: "droite", label: "Une droite remarquable (médiane, hauteur, médiatrice, bissectrice)" },
  { id: "point", label: "Un point remarquable (G, H, O, I)" },
  { id: "cercle", label: "Un cercle remarquable (circonscrit, inscrit, exinscrit, neuf points)" },
];

const familleAuHasard = (): Famille125 => CATALOGUE_125[Math.floor(Math.random() * 3)]!.id;

export function construireAvecVariante125(id: string): Exercice125 {
  const v = CATALOGUE_125.find((x) => x.id === id);
  return tirer125(v ? v.id : familleAuHasard());
}

export function genererExercice125(): Exercice125 {
  return tirer125(familleAuHasard());
}
