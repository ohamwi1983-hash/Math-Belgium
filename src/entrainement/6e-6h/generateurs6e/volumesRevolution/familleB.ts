import type { ExerciceVolumeB } from "../../core6e/volumesRevolution.types";
import { tirerEntier, tirerEntierNonNul } from "../calculPrimitives/aleatoire";
import { evaluerTermes, polynomeDepuisRacines, polynomeVersTermes, primitiverTermes } from "../calculAires/polynome";
import { carreTermes } from "./polynome";

/**
 * Couche A (6e) — génération, famille B ("Volume par rotation, bornes à trouver") de `6gen27`.
 * f(x) polynomiale (quadratique) avec 2 racines RÉELLES DISTINCTES — construite "depuis les
 * racines cibles" en RÉUTILISANT `polynomeDepuisRacines`/`polynomeVersTermes`
 * (`generateurs6e/calculAires/polynome.ts`, 6gen26, Couche A ↔ Couche A libre — voir en-tête
 * `core6e/volumesRevolution.types.ts`), exactement comme 6gen26 famille B ("Aire courbe/axe,
 * bornes à trouver"). Les bornes du volume sont EXACTEMENT ces 2 racines (à trouver à l'écran 1) ;
 * les écrans 2 à 4 sont ensuite IDENTIQUES à la famille A "polynomiale" (`carreTermes` réutilisé
 * tel quel pour le développement de f(x)²).
 */

export function tirerRacinesDistinctes(min: number, max: number): [number, number] {
  let p = tirerEntier(min, max);
  let q = tirerEntier(min, max);
  while (q === p) q = tirerEntier(min, max);
  return p < q ? [p, q] : [q, p];
}

export function construireFamilleVolumeB(): ExerciceVolumeB {
  const [r1, r2] = tirerRacinesDistinctes(-3, 3);
  const coefDominant = tirerEntierNonNul(-2, 2);
  const poly = polynomeDepuisRacines([r1, r2], coefDominant);
  const termes = polynomeVersTermes(poly);
  const developpe = carreTermes(termes);
  return {
    famille: "B",
    termes,
    r1,
    r2,
    developpe,
    fReference: (x) => evaluerTermes(termes, x),
    developpeReference: (x) => evaluerTermes(developpe, x),
    primitiveDeveloppeReference: (x) => primitiverTermes(developpe, x),
  };
}
