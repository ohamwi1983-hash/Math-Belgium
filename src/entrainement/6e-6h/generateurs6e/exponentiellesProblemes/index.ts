import type { ExerciceExponentiellesProblemes, FamilleExponentiellesProblemes } from "../../core6e/exponentiellesProblemes.types";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";
import { construireE } from "./familles/E";
import { construireF } from "./familles/F";
import { construireG } from "./familles/G";
import { tirerParmi } from "./aleatoire";

export const CATALOGUE_FAMILLES: { id: FamilleExponentiellesProblemes; label: string }[] = [
  { id: "A", label: "A — Évaluer/résoudre Q(t)=Q0·r^t" },
  { id: "B", label: "B — Modèle complémentaire (asymptote-objectif)" },
  { id: "C", label: "C — 2 points, taux inconnu" },
  { id: "D", label: "D — Asymptote non nulle, 3 points" },
  { id: "E", label: "E — Optimisation puissance×exponentielle" },
  { id: "F", label: "F — Saturation donnée, coûts/revenus" },
  { id: "G", label: "G — Seuil critique, décision" },
];

const CONSTRUCTEURS: Record<FamilleExponentiellesProblemes, () => ExerciceExponentiellesProblemes> = {
  A: construireA,
  B: construireB,
  C: construireC,
  D: construireD,
  E: construireE,
  F: construireF,
  G: construireG,
};

export function construireAvecFamilleId(id: FamilleExponentiellesProblemes): ExerciceExponentiellesProblemes {
  return CONSTRUCTEURS[id]();
}

/** Tirage ÉQUIPROBABLE parmi les 7 familles (spec explicite : "Tirage aléatoire d'1 famille parmi
 * 7 (A à G, équiprobable)") — contrairement à `limitesExponentielles/index.ts` (6gen6), aucune
 * famille n'est ici une instance unique à sous-pondérer. */
export function genererExerciceExponentiellesProblemes(): ExerciceExponentiellesProblemes {
  return construireAvecFamilleId(tirerParmi(CATALOGUE_FAMILLES.map((c) => c.id)));
}
