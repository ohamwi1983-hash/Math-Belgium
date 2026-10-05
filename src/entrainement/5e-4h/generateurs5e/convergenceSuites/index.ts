import type { ExerciceConvergenceSuite, VarianteConvergenceSuite } from "../../core5e/convergenceSuites.types";
import { genererExerciceConvergenceArithmetique } from "./arithmetique";
import { genererExerciceConvergenceGeometrique } from "./geometrique";
import { genererExerciceConvergenceQuelconque } from "./quelconque";

export const CATALOGUE_VARIANTES: { id: VarianteConvergenceSuite; label: string }[] = [
  { id: "arithmetique", label: "Suite arithmétique" },
  { id: "geometrique", label: "Suite géométrique" },
  { id: "quelconque", label: "Suite rationnelle un=P(n)/Q(n)" },
];

export function construireAvecVarianteId(variante: VarianteConvergenceSuite): ExerciceConvergenceSuite {
  if (variante === "arithmetique") return genererExerciceConvergenceArithmetique();
  if (variante === "geometrique") return genererExerciceConvergenceGeometrique();
  return genererExerciceConvergenceQuelconque();
}

// Tirage uniforme entre les 3 variantes — aucune raison pédagogique de sur/sous-représenter l'une
// d'elles, contrairement aux familles "principal"/bonus de 5gen14/5gen15.
export function genererExerciceConvergenceSuite(): ExerciceConvergenceSuite {
  return construireAvecVarianteId(CATALOGUE_VARIANTES[Math.floor(Math.random() * CATALOGUE_VARIANTES.length)].id);
}
