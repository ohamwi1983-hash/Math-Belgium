import type { ExerciceAireA, SigneFonction, TypeCourbeAireA } from "../../core6e/calculAires.types";
import { evaluerTermeA, primitiveTermeA } from "../calculPrimitives/familles/A";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Aire courbe/axe, bornes données, signe constant") de
 * `6gen26`. f(x) = UN terme unique parmi 3 techniques de primitive déjà connues (exponentielle,
 * rationnelle simple, trigonométrique) — réutilise `evaluerTermeA`/`primitiveTermeA` de 6gen23 (voir
 * en-tête `core6e/calculAires.types.ts`). Le signe de f sur [a,b] est GARANTI CONSTANT par
 * construction (jamais vérifié a posteriori par recherche de racine) : chaque sous-constructeur
 * choisit un domaine où le "facteur variable" (e^x, 1/x, cos(x)) garde un signe FIXE connu
 * algébriquement, si bien que le signe de f est exactement `sign(coef)` (exponentielle,
 * trigonométrique) ou `sign(coef) * sign(intervalle)` (rationnelle, intervalle tout d'un côté de 0).
 */

function construireExponentielle(): ExerciceAireA {
  const coef = tirerEntierNonNul(-5, 5);
  const [a, b] = tirerBornesDistinctesOrdonnees(-3, 3);
  const terme = { type: "expX" as const, coef };
  const signe: SigneFonction = coef > 0 ? "positif" : "negatif";
  return construireDepuisTerme("exponentielle", terme, a, b, signe);
}

function construireRationnelle(): ExerciceAireA {
  const coef = tirerEntierNonNul(-5, 5);
  const cotePositif = Math.random() < 0.5;
  const [a, b] = cotePositif ? tirerBornesDistinctesOrdonnees(1, 5) : tirerBornesDistinctesOrdonnees(-5, -1);
  const terme = { type: "invX" as const, coef };
  const signeIntervalle = cotePositif ? 1 : -1;
  const signe: SigneFonction = coef * signeIntervalle > 0 ? "positif" : "negatif";
  return construireDepuisTerme("rationnelle", terme, a, b, signe);
}

function construireTrigonometrique(): ExerciceAireA {
  const coef = tirerEntierNonNul(-5, 5);
  // Bornes dans {-1,0,1} ⊂ (-π/2, π/2) : cos(x) > 0 garanti sur tout cet intervalle.
  const [a, b] = tirerBornesDistinctesOrdonnees(-1, 1);
  const terme = { type: "cosX" as const, coef };
  const signe: SigneFonction = coef > 0 ? "positif" : "negatif";
  return construireDepuisTerme("trigonometrique", terme, a, b, signe);
}

function tirerBornesDistinctesOrdonnees(min: number, max: number): [number, number] {
  let a = tirerEntier(min, max);
  let b = tirerEntier(min, max);
  while (b === a) b = tirerEntier(min, max);
  return a < b ? [a, b] : [b, a];
}

function construireDepuisTerme(type: TypeCourbeAireA, terme: ExerciceAireA["terme"], a: number, b: number, signe: SigneFonction): ExerciceAireA {
  return {
    famille: "A",
    type,
    terme,
    a,
    b,
    signe,
    integrandeReference: (x) => evaluerTermeA(terme, x),
    primitiveReference: (x) => primitiveTermeA(terme, x),
  };
}

/** Tirage équiprobable du type de courbe. */
export function construireFamilleAireA(): ExerciceAireA {
  const type = tirerParmi(["exponentielle", "rationnelle", "trigonometrique"] as const);
  if (type === "exponentielle") return construireExponentielle();
  if (type === "rationnelle") return construireRationnelle();
  return construireTrigonometrique();
}

export { construireExponentielle as construireFamilleAireA_Exponentielle, construireRationnelle as construireFamilleAireA_Rationnelle, construireTrigonometrique as construireFamilleAireA_Trigonometrique };
