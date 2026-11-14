import type { ExerciceDetectiveLogarithmes, IdDescriptionLogarithmes, IdScenarioLogarithmes, TypeErreurLogarithmes } from "../../core6e/detectiveLogarithmes.types";
import { SCENARIOS_PAR_TYPE, TABLE_B1, TABLE_D1, TABLE_K1, TABLE_K2, descriptionCorrecte } from "../../moteur6e/modeleDetectiveLogarithmes";

/**
 * Générateur de « Le détective d'erreurs : logarithmes » (6gen88). Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le
 * QR code d'une feuille rouvre ainsi le MÊME exercice (données, ordre des descriptions).
 *
 * Variante = type d'erreur ; dans une variante, le scénario (support + ligne fausse) est tiré
 * uniformément (chaque forme sort avec une probabilité de 50 % : séries équilibrées faciles à
 * reproduire, `profil.ts`).
 *
 * Garanties (vérifiées par tirages massifs) : valeurs exactes (rationnels, puissances de e,
 * quotients de ln) ; l'erreur se VOIT (le résultat final de la copie diffère du bon résultat) ; la
 * conclusion de la copie reste cohérente avec son erreur.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function indice(liste: readonly unknown[]): number {
  return Math.floor(Math.random() * liste.length);
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

/** S2 : second membre m tel que m/k ≠ m − k (sinon la copie tomberait juste) et m ≠ k. */
const M_S2: Record<number, number[]> = { 2: [-1, 1, 3, 5], 3: [1, 2, 4, 5] };

function tirerDonnees(scenario: IdScenarioLogarithmes): Record<string, number> {
  switch (scenario) {
    case "S1":
      return { a: entier(2, 5), b: entier(1, 3) };
    case "S2": {
      const k = choisir([2, 3]);
      return { k, m: choisir(M_S2[k]!) };
    }
    case "C1":
      return { a: entier(2, 7) };
    case "C2":
      return { k: entier(1, 3), s: entier(0, 1) };
    case "D1":
      return { i: indice(TABLE_D1) };
    case "D2":
      return { r: entier(2, 6) };
    case "B1":
      return { i: indice(TABLE_B1), p: entier(1, 5), s: entier(0, 1) };
    case "B2":
      return { j: entier(0, 1), b: entier(1, 5), c: entier(1, 4), s: entier(0, 1) };
    case "P1":
      return { m: choisir([1, 3, 4, 5, 6]) };
    case "P2":
      return { k: choisir([2, 3, -1, -2]) };
    case "Q1":
      return { a: choisir([2, 3, 5]), q: entier(2, 3) };
    case "Q2":
      return { n: entier(1, 6) };
    case "V1":
      return { c: entier(1, 5), x0: choisir([-2, -1, 1, 2, 3]) };
    case "V2":
      return { a: entier(2, 4), x0: choisir([-1, 1, 2]) };
    case "K1":
      return { i: indice(TABLE_K1) };
    case "K2":
      return { i: indice(TABLE_K2) };
  }
}

// ---------------------------------------------------------------------------------------------
// Descriptions de l'écran 2 : la bonne + 3 leurres (toujours FAUX pour cette ligne)
// ---------------------------------------------------------------------------------------------

export const LEURRES: Record<IdScenarioLogarithmes, IdDescriptionLogarithmes[]> = {
  S1: ["produitSomme", "puissanceSomme", "ceSomme"],
  S2: ["puissanceProduit", "diviserK", "ceProduit"],
  C1: ["carreDouble", "carreRacine", "ceCarre"],
  C2: ["carreDouble", "sensCarre", "ceCarre"],
  D1: ["ceInegalite", "ceInutile", "ceNonNul"],
  D2: ["injectiviteFausse", "rejeterR", "deuxSolutionsAbs"],
  B1: ["puissanceSigne", "ceBase", "baseConserve"],
  B2: ["simplifierLog", "ceIntersection", "sensMembre"],
  P1: ["carreLnCarre", "carreExp", "carreCE"],
  P2: ["carreLnCarre", "carreExp", "carreCE"],
  Q1: ["quotientDiff", "quotientSimplifier", "quotientCE"],
  Q2: ["quotientDiff", "quotientSimplifier", "quotientLogQuotient"],
  V1: ["deriveeUSurU2", "deriveeLnPrime", "deriveeDomaine"],
  V2: ["deriveeUSurU2", "deriveeLnPrime", "deriveeDomaine"],
  K1: ["baseProduit", "baseDifference", "baseLog10"],
  K2: ["baseProduit", "baseDifference", "baseLog10"],
};

export function genererDetectiveLogarithmes(scenario: IdScenarioLogarithmes): ExerciceDetectiveLogarithmes {
  const e: ExerciceDetectiveLogarithmes = { scenario, donnees: tirerDonnees(scenario), options: [] };
  return { ...e, options: melanger([descriptionCorrecte(e), ...LEURRES[scenario]]) };
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: TypeErreurLogarithmes; label: string }[] = [
  { id: "somme", label: "ln(a + b) ou ln(a·b) mal développé" },
  { id: "carre", label: "ln(x²) = 2 ln(x) sans valeur absolue" },
  { id: "domaine", label: "CE oubliée : solution parasite gardée" },
  { id: "base", label: "Inéquation de base < 1 : sens non inversé" },
  { id: "puissance", label: "(ln x)² confondu avec ln(x²)" },
  { id: "quotient", label: "Quotient de logarithmes écrit log(x − y)" },
  { id: "derivee", label: "Dérivée de ln(u) écrite 1/u" },
  { id: "changementBase", label: "Changement de base inversé" },
];

export function construireAvecVariante(id: string): ExerciceDetectiveLogarithmes {
  const scenarios = SCENARIOS_PAR_TYPE[id as TypeErreurLogarithmes];
  if (!scenarios) return genererExerciceDetectiveLogarithmes();
  return genererDetectiveLogarithmes(choisir(scenarios));
}

/** Tirage libre : un type d'erreur au hasard, puis un scénario de ce type. */
export function genererExerciceDetectiveLogarithmes(): ExerciceDetectiveLogarithmes {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
