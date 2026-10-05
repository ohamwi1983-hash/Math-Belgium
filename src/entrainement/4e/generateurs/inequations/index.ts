import type { ExerciceInequation, GenerateurExerciceInequation, Symbole } from "../../core/inequation.types";
import { classifierSolution } from "./classification";
import { construireDeltaNegatif } from "./construireDeltaNegatif";
import { construireDeltaNul } from "./construireDeltaNul";
import { construireDeltaPositif } from "./construireDeltaPositif";

const SYMBOLES: Symbole[] = ["<", ">", "≤", "≥"];

function tirerSymbole(): Symbole {
  return SYMBOLES[Math.floor(Math.random() * SYMBOLES.length)];
}

/**
 * Répartition équilibrée entre Δ<0, Δ=0, Δ>0 (section 1) : le cas de discriminant est choisi
 * d'abord, à parts égales, puis l'énoncé est construit pour correspondre à ce cas — jamais
 * a,b,c tirés au hasard puis classés a posteriori (Δ>0 serait alors statistiquement écrasant).
 */
const constructeurs = [construireDeltaNegatif, construireDeltaNul, construireDeltaPositif];

/**
 * Identifiant de variante (convention RETROFIT-variantes-generateurs.md) — aucun type union
 * n'existait jusqu'ici pour ce générateur (contrairement à l'exercice 1, qui réutilise `Categorie`,
 * voir AUDIT-variantes-generateurs.md, section 1, exercice 2) : créé localement, jamais partagé,
 * ce générateur restant totalement indépendant de l'exercice 1 côté Couche A.
 */
export type VarianteInequationId = "deltaNegatif" | "deltaNul" | "deltaPositif";

export interface VarianteInequation {
  id: VarianteInequationId;
  label: string;
}

/** Proposition à valider par l'utilisateur (voir RETROFIT-variantes-generateurs.md). */
export const CATALOGUE_VARIANTES: VarianteInequation[] = [
  { id: "deltaNegatif", label: "Δ < 0 (aucune racine réelle)" },
  { id: "deltaNul", label: "Δ = 0 (racine double)" },
  { id: "deltaPositif", label: "Δ > 0 (deux racines distinctes)" },
];

const CONSTRUCTEURS_PAR_ID: Record<VarianteInequationId, () => ReturnType<typeof construireDeltaNegatif>> = {
  deltaNegatif: construireDeltaNegatif,
  deltaNul: construireDeltaNul,
  deltaPositif: construireDeltaPositif,
};

/**
 * Joue le rôle de `construireAvecVarianteId` pour ce générateur (convention RETROFIT-variantes-
 * generateurs.md) — le symbole (`<`/`>`/`≤`/`≥`) reste tiré indépendamment et aléatoirement, comme
 * pour le tirage brut : forcer le cas de discriminant ne force jamais le symbole, deux axes de
 * variation orthogonaux (voir `genererExerciceInequation` ci-dessous, même principe).
 */
export function construireAvecVarianteId(varianteId: VarianteInequationId): ExerciceInequation {
  const { enonce, delta, racines } = CONSTRUCTEURS_PAR_ID[varianteId]();
  const symbole = tirerSymbole();
  const solution = classifierSolution(enonce, symbole);

  const exercice: ExerciceInequation = { enonce, symbole, delta, solution };
  if (racines !== undefined) exercice.racines = racines;
  return exercice;
}

/** Implémentation de la Couche A pour l'exercice "tableau de signes" (inéquations du 2nd degré). */
export const genererExerciceInequation: GenerateurExerciceInequation = () => {
  const construire = constructeurs[Math.floor(Math.random() * constructeurs.length)];
  const { enonce, delta, racines } = construire();
  const symbole = tirerSymbole();
  const solution = classifierSolution(enonce, symbole);

  const exercice: ExerciceInequation = { enonce, symbole, delta, solution };
  if (racines !== undefined) exercice.racines = racines;
  return exercice;
};
