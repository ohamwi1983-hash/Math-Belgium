import type { Enonce } from "../../core/generateur.types";
import type { ExerciceRelationsRacines } from "../../core/relationsRacines.types";
import { randomInt, randomNonZeroInt } from "./aleatoire";

/**
 * gen67 — relations entre racines et coefficients. Variantes (audit 4e ch. 2 G15 : il n'y en avait
 * aucune, et la racine double ne sortait que dans ≈ 15 % des tirages) :
 * - `racines_distinctes` : a = ±1, deux racines entières non nulles distinctes (parfois opposées :
 *   cas particulier S = 0, voir `profilRelationsRacines`) ;
 * - `racine_double` : x₁ = x₂ ≠ 0 ;
 * - `racine_nulle` : une racine nulle (c = 0, P = 0), l'autre non nulle ;
 * - `a_different_1` : |a| de 2 à 4, deux racines entières non nulles distinctes (parfois opposées).
 * Le tirage libre prend une variante au hasard (même poids).
 */
export type VarianteRelationsRacinesId = "racines_distinctes" | "racine_double" | "racine_nulle" | "a_different_1";

export const CATALOGUE_VARIANTES: { id: VarianteRelationsRacinesId; label: string }[] = [
  { id: "racines_distinctes", label: "Racines distinctes (a = ±1)" },
  { id: "racine_double", label: "Racine double" },
  { id: "racine_nulle", label: "Une racine nulle (c = 0)" },
  { id: "a_different_1", label: "a ≠ ±1, racines distinctes" },
];

function racinesDistinctesNonNulles(): [number, number] {
  for (;;) {
    const r1 = randomNonZeroInt(-6, 6);
    const r2 = randomNonZeroInt(-6, 6);
    if (r1 !== r2) return r1 < r2 ? [r1, r2] : [r2, r1];
  }
}

function construire(a: number, racines: [number, number]): ExerciceRelationsRacines {
  const [x1, x2] = racines;
  const enonce: Enonce = { a, b: -a * (x1 + x2), c: a * x1 * x2 };
  return { enonce, racines };
}

export function construireAvecVarianteId(id: VarianteRelationsRacinesId): ExerciceRelationsRacines {
  switch (id) {
    case "racines_distinctes":
      return construire(Math.random() < 0.7 ? 1 : -1, racinesDistinctesNonNulles());
    case "racine_double": {
      const r = randomNonZeroInt(-6, 6);
      return construire(randomNonZeroInt(-4, 4), [r, r]);
    }
    case "racine_nulle": {
      const r = randomNonZeroInt(-6, 6);
      return construire(randomNonZeroInt(-4, 4), r < 0 ? [r, 0] : [0, r]);
    }
    case "a_different_1":
      return construire((Math.random() < 0.5 ? -1 : 1) * randomInt(2, 4), racinesDistinctesNonNulles());
  }
}

export function genererExerciceRelationsRacines(): ExerciceRelationsRacines {
  return construireAvecVarianteId(CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id);
}
