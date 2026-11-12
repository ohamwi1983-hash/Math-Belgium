import type { ExerciceDeuxEnfants, ExerciceMere, ExerciceMontyHall, ExerciceParadoxesProbabilites } from "../../core6e/paradoxesProbabilites.types";

/**
 * Couche A (6e) — générateur de `6gen76` « Quand l'intuition se trompe ». N'utilise QUE
 * `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue donc exactement le
 * même tirage, ici comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * Le nombre d'options de conclusion par famille vit dans `ui6e/formatParadoxesProbabilites.ts`
 * (`NOMBRE_OPTIONS_CONCLUSION`, dupliqué ici en constante pour ne pas importer la couche UI).
 */

const NOMBRE_OPTIONS_CONCLUSION = { mere: 4, montyHall: 4, deuxEnfants: 4 } as const;

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

function construireMere(k: 24 | 25): ExerciceMere {
  return { famille: "mere", kLancersDouble: k, ordreConclusion: melange(NOMBRE_OPTIONS_CONCLUSION.mere) };
}

function construireMontyHall(n: 3 | 4 | 5): ExerciceMontyHall {
  const porteChoisie = entier(1, n);
  let porteOuverte = entier(1, n - 1);
  if (porteOuverte >= porteChoisie) porteOuverte++;
  return { famille: "montyHall", nPortes: n, porteChoisie, porteOuverte, ordreConclusion: melange(NOMBRE_OPTIONS_CONCLUSION.montyHall) };
}

function construireDeuxEnfants(information: "auMoinsUn" | "rang"): ExerciceDeuxEnfants {
  return {
    famille: "deuxEnfants",
    information,
    rang: Math.random() < 0.7 ? "aine" : "cadet",
    sexe: Math.random() < 0.5 ? "garcon" : "fille",
    ordreConclusion: melange(NOMBRE_OPTIONS_CONCLUSION.deuxEnfants),
  };
}

export type IdVarianteParadoxesProbabilites = "mere-24" | "mere-25" | "monty-3" | "monty-4" | "monty-5" | "enfants-auMoinsUn" | "enfants-rang";

export const CATALOGUE_VARIANTES: { id: IdVarianteParadoxesProbabilites; label: string }[] = [
  { id: "mere-24", label: "Méré — 4 lancers d'un dé contre 24 lancers de deux dés" },
  { id: "mere-25", label: "Méré — 4 lancers d'un dé contre 25 lancers de deux dés" },
  { id: "monty-3", label: "Monty Hall — 3 portes" },
  { id: "monty-4", label: "Monty Hall — 4 portes" },
  { id: "monty-5", label: "Monty Hall — 5 portes" },
  { id: "enfants-auMoinsUn", label: "Deux enfants — « au moins un »" },
  { id: "enfants-rang", label: "Deux enfants — « l'aîné » ou « le cadet »" },
];

export function construireAvecVarianteId(id: IdVarianteParadoxesProbabilites): ExerciceParadoxesProbabilites {
  switch (id) {
    case "mere-24":
      return construireMere(24);
    case "mere-25":
      return construireMere(25);
    case "monty-3":
      return construireMontyHall(3);
    case "monty-4":
      return construireMontyHall(4);
    case "monty-5":
      return construireMontyHall(5);
    case "enfants-auMoinsUn":
      return construireDeuxEnfants("auMoinsUn");
    case "enfants-rang":
      return construireDeuxEnfants("rang");
  }
}

/** Tirage libre : famille équiprobable ; Monty Hall à 3 portes (le paradoxe classique) une fois
 * sur deux, 4 ou 5 portes sinon. */
export function genererExerciceParadoxesProbabilites(): ExerciceParadoxesProbabilites {
  const r = Math.random();
  if (r < 1 / 3) return construireMere(Math.random() < 0.5 ? 24 : 25);
  if (r < 2 / 3) {
    const s = Math.random();
    return construireMontyHall(s < 0.5 ? 3 : s < 0.75 ? 4 : 5);
  }
  return construireDeuxEnfants(Math.random() < 0.5 ? "auMoinsUn" : "rang");
}
