import type { ExerciceLoiBinomiale, FamilleLoiBinomiale } from "../../core6e/loiBinomiale.types";
import { construireFamilleA, genererFamilleA } from "./familleA";
import { construireFamilleB, genererFamilleB } from "./familleB";
import { calculerNMinimalC, construireFamilleC, genererFamilleC } from "./familleC";

export { construireFamilleA, genererFamilleA, construireFamilleB, genererFamilleB, construireFamilleC, genererFamilleC, calculerNMinimalC };

/**
 * Couche A (6e) — point d'entrée `6gen50` ("Loi binomiale"). Tirage à 2 niveaux (mirroir
 * `generateurs6e/binomialeSequenceOrdonnee/index.ts`, 6gen48) : la FAMILLE (A/B/C) est tirée
 * ÉQUIPROBABLE en premier, PUIS le générateur de famille tire le reste en interne.
 */

const N_DEFAUT_A = 8;
const P_DEFAUT_A = 0.2;
const N_DEFAUT_B = 8;
const P_DEFAUT_B = 0.5;
const P_DEFAUT_C = 0.1;
const SEUIL_DEFAUT_C = 0.9;

export type IdVarianteLoiBinomiale = "A_justifier" | "B_exactement" | "B_auMoins" | "B_auPlus" | "B_aucun" | "B_tous" | "C_trouverN";

export const CATALOGUE_VARIANTES: { id: IdVarianteLoiBinomiale; label: string }[] = [
  { id: "A_justifier", label: "A — Justifier la loi binomiale (identification + Bernoulli)" },
  { id: "B_exactement", label: "B — Exactement k succès (terme unique) + E(X)" },
  { id: "B_auMoins", label: "B — Au moins k succès (somme ou complément) + E(X)" },
  { id: "B_auPlus", label: "B — Au plus k succès (somme ou complément) + E(X)" },
  { id: "B_aucun", label: "B — Aucun succès (terme unique) + E(X)" },
  { id: "B_tous", label: "B — Tous des succès (terme unique) + E(X)" },
  { id: "C_trouverN", label: "C — Trouver n via logarithme (au moins 1 succès)" },
];

export function construireAvecVarianteId(id: IdVarianteLoiBinomiale): ExerciceLoiBinomiale {
  switch (id) {
    case "A_justifier":
      return construireFamilleA(N_DEFAUT_A, P_DEFAUT_A);
    case "B_exactement":
      return construireFamilleB(N_DEFAUT_B, P_DEFAUT_B, "exactement");
    case "B_auMoins":
      return construireFamilleB(N_DEFAUT_B, P_DEFAUT_B, "auMoins");
    case "B_auPlus":
      return construireFamilleB(N_DEFAUT_B, P_DEFAUT_B, "auPlus");
    case "B_aucun":
      return construireFamilleB(N_DEFAUT_B, P_DEFAUT_B, "aucun");
    case "B_tous":
      return construireFamilleB(N_DEFAUT_B, P_DEFAUT_B, "tous");
    case "C_trouverN":
      return construireFamilleC(P_DEFAUT_C, SEUIL_DEFAUT_C);
  }
}

const FAMILLES: FamilleLoiBinomiale[] = ["A", "B", "C"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleLoiBinomiale, () => ExerciceLoiBinomiale> = {
  A: genererFamilleA,
  B: genererFamilleB,
  C: genererFamilleC,
};

export function genererExerciceLoiBinomiale(): ExerciceLoiBinomiale {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
