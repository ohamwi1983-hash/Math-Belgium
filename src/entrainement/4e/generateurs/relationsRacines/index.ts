import type { Enonce } from "../../core/generateur.types";
import type { ExerciceRelationsRacines } from "../../core/relationsRacines.types";
import { randomInt, randomNonZeroInt } from "./aleatoire";

/** ~1 exercice sur 6 avec une racine double (Δ=0) — variété couverte par le cours (S=2x0, P=x0²,
 * factorisation a(x-x0)²) sans que ce cas domine : la majorité des exercices garde deux racines
 * distinctes, qui donnent plus de matière aux 3 écrans. */
const PROBABILITE_RACINE_DOUBLE = 1 / 6;

function racinesDistinctes(min: number, max: number): [number, number] {
  const r1 = randomInt(min, max);
  let r2 = randomInt(min, max);
  while (r2 === r1) r2 = randomInt(min, max);
  return r1 < r2 ? [r1, r2] : [r2, r1];
}

function tirerRacines(): [number, number] {
  if (Math.random() < PROBABILITE_RACINE_DOUBLE) {
    const r = randomInt(-6, 6);
    return [r, r];
  }
  return racinesDistinctes(-6, 6);
}

/**
 * a(x-x1)(x-x2) = ax²+bx+c, avec b=-a(x1+x2), c=a·x1·x2 — les racines ENTIÈRES sont tirées
 * directement puis l'énoncé est construit à partir d'elles (jamais l'inverse) : la somme S et le
 * produit P que l'élève doit retrouver à l'écran 1 sont ainsi garantis entiers par construction
 * (S=-b/a=x1+x2, P=c/a=x1·x2, division toujours exacte), et les écrans 2/3 réutilisent ces mêmes
 * racines déjà connues sans jamais devoir résoudre une équation auxiliaire pour les retrouver
 * (piège de calcul à plusieurs étapes déjà écarté des générateurs quiz du chapitre 2 — même
 * principe appliqué ici dès la conception).
 */
export function genererExerciceRelationsRacines(): ExerciceRelationsRacines {
  const a = randomNonZeroInt(-4, 4);
  const racines = tirerRacines();
  const [x1, x2] = racines;
  const enonce: Enonce = { a, b: -a * (x1 + x2), c: a * x1 * x2 };
  return { enonce, racines };
}
