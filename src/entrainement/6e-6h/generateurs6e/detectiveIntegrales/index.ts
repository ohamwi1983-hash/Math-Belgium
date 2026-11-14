import type { ExerciceDetectiveIntegrales, IdDescriptionIntegrales, IdScenarioIntegrales, TypeErreurIntegrales } from "../../core6e/detectiveIntegrales.types";
import { SCENARIOS_PAR_TYPE, descriptionCorrecte } from "../../moteur6e/modeleDetectiveIntegrales";

/**
 * Générateur de « Le détective d'erreurs : intégrales et primitives » (6gen84). Tout le hasard
 * passe par `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une
 * graine, et le QR code d'une feuille rouvre ainsi le MÊME exercice (données, ordre des
 * descriptions).
 *
 * Variante = type d'erreur ; dans une variante, le scénario (support + ligne fausse) est tiré
 * uniformément (chaque forme sort avec une probabilité d'au moins 50 % : séries équilibrées faciles
 * à reproduire, `profil.ts`).
 *
 * Garanties (vérifiées par tirages massifs) : valeurs exactes (rationnels, multiples de π, de
 * ln(m) ou de √3) ; l'erreur se VOIT (la valeur de la ligne fausse ET le résultat final de la copie
 * diffèrent des bonnes valeurs) ; la copie reste cohérente avec son erreur.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

const PAIRES_R1: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 4],
  [3, 5],
];
const PAIRES_R2: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 4],
];
const BORNES_B1: [number, number][] = [
  [0, 2],
  [0, 3],
  [1, 3],
  [1, 4],
  [0, 4],
  [2, 4],
];

function tirerDonnees(scenario: IdScenarioIntegrales): Record<string, number> {
  switch (scenario) {
    case "A1":
      return { c: entier(1, 5), k: entier(2, 6) };
    case "A2":
      return { a: choisir([2, 3]), b: choisir([1, 2]), n: choisir([2, 3]) };
    case "L1":
      return { c: choisir([1, 2, 3, 5]), a: choisir([1, 2]), m: choisir([2, 3, 4]) };
    case "L2":
      return { c: entier(1, 3), p: entier(0, 2), y: entier(-3, 6) };
    case "G1":
      return { c: entier(2, 6), i: entier(0, 5) };
    case "G2":
      return { c: entier(2, 4), j: entier(0, 2), y: entier(-2, 5) };
    case "R1": {
      const [k, m] = choisir(PAIRES_R1);
      return { k, m };
    }
    case "R2": {
      const [k, m] = choisir(PAIRES_R2);
      return { k, m };
    }
    case "V1":
      return { k: entier(1, 3), h: choisir([2, 3]) };
    case "V2":
      return { k: choisir([2, 3, 5, 6]), h: choisir([2, 3, 4]) };
    case "B1": {
      const [a, b] = choisir(BORNES_B1);
      return { p: entier(1, 5), a, b };
    }
    case "C1": {
      for (;;) {
        const b = choisir([-3, -2, -1, 1, 2, 3]);
        const x = choisir([-2, -1, 1, 2]);
        if (x ** 3 + b * x * x !== 0) return { b, x, y: entier(-4, 8) };
      }
    }
    case "C2":
      return { k: entier(1, 3), v: entier(2, 8), T: entier(2, 5) };
  }
}

// ---------------------------------------------------------------------------------------------
// Descriptions de l'écran 2 : la bonne + 3 leurres (toujours FAUX pour cette ligne)
// ---------------------------------------------------------------------------------------------

export const LEURRES: Record<IdScenarioIntegrales, IdDescriptionIntegrales[]> = {
  A1: ["multiplierParA", "signeCosFaux", "constanteIntegrale"],
  A2: ["multiplierParA", "exposant", "developper"],
  L1: ["deriveeInverse", "pasDePrimitive", "lnMoins"],
  L2: ["deriveeInverse", "pasDePrimitive", "constanteAbsente"],
  G1: ["linearite", "bornes", "decoupeIntegrale"],
  G2: ["diviserParC", "conditionSurf", "constanteAbsente"],
  R1: ["valeurAbsolueGlobale", "bornes", "deriveeAuLieu"],
  R2: ["ordreCourbes", "intersectionsFausses", "valeurAbsolueGlobale"],
  V1: ["volumePi", "volumeCube", "volumeDeuxPi"],
  V2: ["volumeCarre", "volumeCube", "volumeDeuxPi"],
  B1: ["constanteBornes", "decoupeRacines", "deriveeAuLieu"],
  C1: ["constanteAbsente", "conditionSurf", "valeurF"],
  C2: ["primitiveDemi", "vitesseDerivee", "positionVitesse"],
};

export function genererDetectiveIntegrales(scenario: IdScenarioIntegrales): ExerciceDetectiveIntegrales {
  const e: ExerciceDetectiveIntegrales = { scenario, donnees: tirerDonnees(scenario), options: [] };
  return { ...e, options: melanger([descriptionCorrecte(e), ...LEURRES[scenario]]) };
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: TypeErreurIntegrales; label: string }[] = [
  { id: "affine", label: "Primitive de f(ax + b) sans diviser par a" },
  { id: "lnAbs", label: "ln(x) au lieu de ln|x|" },
  { id: "signe", label: "Signe de la primitive de sin ou cos" },
  { id: "aire", label: "Aire sans découper aux racines" },
  { id: "volume", label: "Volume sans π ou sans le carré" },
  { id: "bornes", label: "Bornes inversées : F(a) − F(b)" },
  { id: "constante", label: "Constante C oubliée ou mal calculée" },
];

export function construireAvecVariante(id: string): ExerciceDetectiveIntegrales {
  const scenarios = SCENARIOS_PAR_TYPE[id as TypeErreurIntegrales];
  if (!scenarios) return genererExerciceDetectiveIntegrales();
  return genererDetectiveIntegrales(choisir(scenarios));
}

/** Tirage libre : un type d'erreur au hasard, puis un scénario de ce type. */
export function genererExerciceDetectiveIntegrales(): ExerciceDetectiveIntegrales {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
