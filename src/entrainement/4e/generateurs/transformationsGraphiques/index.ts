import type {
  ExerciceTransformationGraphique,
  GenerateurExerciceTransformationGraphique,
} from "../../core/transformationsGraphiques.types";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Implémentation de la Couche A pour "Transformations graphiques" (section 1 de la spec) : p et q
 * tirés indépendamment comme de petits entiers dans [-5,5]. `ev`/`cv` (prompt-generation-vrais-
 * rapports.md) : tirés **indépendamment** l'un de l'autre, chacun un entier dans [1,5], sans
 * contrainte d'exclusivité — `|a| = ev/cv` couvre ainsi nativement, sans distinction de cas, les
 * entiers purs (cv=1), les fractions unitaires (ev=1) et les vrais rapports non triviaux (ev=2,
 * cv=3 → |a|=2/3). `sox` tiré indépendamment et uniformément pour le signe.
 */
export const genererExerciceTransformationGraphique: GenerateurExerciceTransformationGraphique = () => {
  const p = randomInt(-5, 5);
  const q = randomInt(-5, 5);

  const ev = randomInt(1, 5);
  const cv = randomInt(1, 5);

  const sox = Math.random() < 0.5;

  const exercice: ExerciceTransformationGraphique = { p, q, ev, cv, sox };
  return exercice;
};
