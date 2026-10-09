import type { ExerciceEquationsExpLog, FamilleEquationsExpLog } from "../../core6e/equationsExpLog.types";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";
import { construireE } from "./familles/E";
import { construireF } from "./familles/F";
import { construireG } from "./familles/G";
import { tirerParmi } from "./aleatoire";

export const CATALOGUE_FAMILLES: { id: FamilleEquationsExpLog; label: string }[] = [
  { id: "A", label: "A — base^(mx+n)=C, log direct ou superflu" },
  { id: "B", label: "B — bases différentes, ln des deux membres" },
  { id: "C", label: "C — t-substitution, second degré" },
  { id: "D", label: "D — log_x(N)=k / log_a(x)=k" },
  { id: "E", label: "E — combiner des logs, rejet CE" },
  { id: "F", label: "F — changement de base" },
  { id: "G", label: "G — toujours vrai / toujours faux" },
];

const CONSTRUCTEURS: Record<FamilleEquationsExpLog, () => ExerciceEquationsExpLog> = {
  A: construireA,
  B: construireB,
  C: construireC,
  D: construireD,
  E: construireE,
  F: construireF,
  G: construireG,
};

export function construireAvecFamilleId(id: FamilleEquationsExpLog): ExerciceEquationsExpLog {
  return CONSTRUCTEURS[id]();
}

/** Tirage ÉQUIPROBABLE parmi les 7 familles (spec explicite : "Tirage aléatoire d'1 famille parmi
 * 7 (A à G, équiprobable)") — même principe que `exponentiellesProblemes/index.ts` (6gen12). */
export function genererExerciceEquationsExpLog(): ExerciceEquationsExpLog {
  return construireAvecFamilleId(tirerParmi(CATALOGUE_FAMILLES.map((c) => c.id)));
}
