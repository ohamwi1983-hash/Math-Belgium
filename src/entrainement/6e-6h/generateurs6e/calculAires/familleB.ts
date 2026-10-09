import type { ExerciceAireB, SigneFonction, TypeCourbeAireB } from "../../core6e/calculAires.types";
import { tirerEntier, tirerEntierNonNul } from "../calculPrimitives/aleatoire";
import { evaluerTermes, polynomeDepuisRacines, polynomeVersTermes, primitiverTermes } from "./polynome";

/**
 * Couche A (6e) — génération, famille B ("Aire courbe/axe, bornes à trouver, signe constant") de
 * `6gen26`. f(x) polynomiale — parabole (2 racines simples) ou cubique (1 racine double + 1 racine
 * simple, jamais 3 racines distinctes — réservé à la famille C) — construite "depuis les racines
 * cibles" (voir en-tête `core6e/calculAires.types.ts`) : GARANTIT un signe constant entre les 2
 * racines, quel que soit le sous-type, car un seul facteur linéaire change de signe dans
 * l'intervalle ouvert ]r1,r2[ (le facteur au carré, pour "cubique", ne change jamais de signe).
 */

function tirerRacinesDistinctes(min: number, max: number): [number, number] {
  let p = tirerEntier(min, max);
  let q = tirerEntier(min, max);
  while (q === p) q = tirerEntier(min, max);
  return p < q ? [p, q] : [q, p];
}

function construireDepuis(type: TypeCourbeAireB, racines: number[], coefDominant: number, r1: number, r2: number): ExerciceAireB {
  const poly = polynomeDepuisRacines(racines, coefDominant);
  const termes = polynomeVersTermes(poly);
  // Signe déterminé par évaluation directe au milieu de ]r1,r2[ — jamais recalculé "à la main" par
  // une formule de signe dupliquée : une seule source de vérité (la fonction elle-même).
  const milieu = (r1 + r2) / 2;
  const signe: SigneFonction = evaluerTermes(termes, milieu) > 0 ? "positif" : "negatif";
  return {
    famille: "B",
    type,
    termes,
    r1,
    r2,
    signe,
    integrandeReference: (x) => evaluerTermes(termes, x),
    primitiveReference: (x) => primitiverTermes(termes, x),
  };
}

export function construireFamilleAireB_Parabole(): ExerciceAireB {
  const [r1, r2] = tirerRacinesDistinctes(-4, 4);
  const coefDominant = tirerEntierNonNul(-3, 3);
  return construireDepuis("parabole", [r1, r2], coefDominant, r1, r2);
}

export function construireFamilleAireB_Cubique(): ExerciceAireB {
  const [p, q] = tirerRacinesDistinctes(-3, 3); // p<q, l'une des deux sera la racine double.
  const doubleEstP = Math.random() < 0.5;
  const racines = doubleEstP ? [p, p, q] : [p, q, q];
  const coefDominant = tirerEntierNonNul(-2, 2);
  return construireDepuis("cubique", racines, coefDominant, p, q);
}

/** Tirage équiprobable du sous-type. */
export function construireFamilleAireB(): ExerciceAireB {
  return Math.random() < 0.5 ? construireFamilleAireB_Parabole() : construireFamilleAireB_Cubique();
}

export { tirerRacinesDistinctes };
