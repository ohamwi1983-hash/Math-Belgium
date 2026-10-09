import type { ExerciceAireC, SigneFonction } from "../../core6e/calculAires.types";
import { tirerEntier, tirerEntierNonNul } from "../calculPrimitives/aleatoire";
import { evaluerTermes, polynomeDepuisRacines, polynomeVersTermes, primitiverTermes } from "./polynome";

/**
 * Couche A (6e) — génération, famille C ("Signe changeant, découper et sommer") de `6gen26` — LE
 * piège central du générateur. f(x) = A(x-r1)(x-r2)(x-r3), 3 racines RÉELLES DISTINCTES r1<r2<r3
 * (construction "depuis les racines cibles", voir en-tête `core6e/calculAires.types.ts`) : un
 * produit de 3 facteurs linéaires DISTINCTS change de signe à CHAQUE racine (multiplicité impaire =
 * 1 partout) — le signe sur ]r1,r2[ et ]r2,r3[ est donc TOUJOURS opposé, garanti par construction
 * (jamais une coïncidence à vérifier a posteriori).
 */

function tirerTroisRacinesDistinctes(min: number, max: number): [number, number, number] {
  const racines = new Set<number>();
  while (racines.size < 3) racines.add(tirerEntier(min, max));
  const [r1, r2, r3] = [...racines].sort((a, b) => a - b);
  return [r1, r2, r3];
}

export function construireFamilleAireC(): ExerciceAireC {
  const [r1, r2, r3] = tirerTroisRacinesDistinctes(-4, 4);
  const coefDominant = tirerEntierNonNul(-2, 2);
  const poly = polynomeDepuisRacines([r1, r2, r3], coefDominant);
  const termes = polynomeVersTermes(poly);

  const signeSur = (min: number, max: number): SigneFonction => (evaluerTermes(termes, (min + max) / 2) > 0 ? "positif" : "negatif");
  const signeGauche = signeSur(r1, r2);
  const signeDroit = signeSur(r2, r3);

  return {
    famille: "C",
    termes,
    r1,
    r2,
    r3,
    signeGauche,
    signeDroit,
    integrandeReference: (x) => evaluerTermes(termes, x),
    primitiveReference: (x) => primitiverTermes(termes, x),
  };
}
