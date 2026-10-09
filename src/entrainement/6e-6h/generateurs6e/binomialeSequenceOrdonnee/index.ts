import type { ExerciceBinomialeSequenceOrdonnee, FamilleBinomialeSequenceOrdonnee } from "../../core6e/binomialeSequenceOrdonnee.types";
import { construireAvecTypeQuestion, genererFamilleA, probabiliteExactement, determinerStrategieA } from "./familleA";
import { construireFamilleB, genererFamilleB, produitFractionsDecroissantes } from "./familleB";

export { construireAvecTypeQuestion, genererFamilleA, probabiliteExactement, determinerStrategieA, construireFamilleB, genererFamilleB, produitFractionsDecroissantes };

/**
 * Couche A (6e) — point d'entrée `6gen48` ("Probabilité binomiale et séquence exacte sans remise").
 * Tirage à 2 niveaux (mirroir `generateurs6e/denombrementFondamental/index.ts`, 6gen43) : la
 * FAMILLE (A ou B) est tirée ÉQUIPROBABLE en premier, PUIS le générateur de famille tire le reste
 * (contexte, n, p, typeQuestion pour A ; contexte, n, k pour B) en interne.
 */

export type IdVarianteBinomialeSequenceOrdonnee = "A_exactement" | "A_auMoins" | "A_auPlus" | "A_aucun" | "A_tous" | "B_sequence";

export const CATALOGUE_VARIANTES: { id: IdVarianteBinomialeSequenceOrdonnee; label: string }[] = [
  { id: "A_exactement", label: "A — Exactement k succès (terme unique)" },
  { id: "A_auMoins", label: "A — Au moins k succès (somme ou complément)" },
  { id: "A_auPlus", label: "A — Au plus k succès (somme ou complément)" },
  { id: "A_aucun", label: "A — Aucun succès (terme unique)" },
  { id: "A_tous", label: "A — Tous des succès (terme unique)" },
  { id: "B_sequence", label: "B — Séquence exacte, sans remise" },
];

const N_DEFAUT_A = 8;
const P_DEFAUT_A = 0.5;

export function construireAvecVarianteId(id: IdVarianteBinomialeSequenceOrdonnee): ExerciceBinomialeSequenceOrdonnee {
  switch (id) {
    case "A_exactement":
      return construireAvecTypeQuestion(N_DEFAUT_A, P_DEFAUT_A, "exactement");
    case "A_auMoins":
      return construireAvecTypeQuestion(N_DEFAUT_A, P_DEFAUT_A, "auMoins");
    case "A_auPlus":
      return construireAvecTypeQuestion(N_DEFAUT_A, P_DEFAUT_A, "auPlus");
    case "A_aucun":
      return construireAvecTypeQuestion(N_DEFAUT_A, P_DEFAUT_A, "aucun");
    case "A_tous":
      return construireAvecTypeQuestion(N_DEFAUT_A, P_DEFAUT_A, "tous");
    case "B_sequence":
      return construireFamilleB(10, 4);
  }
}

const FAMILLES: FamilleBinomialeSequenceOrdonnee[] = ["A", "B"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleBinomialeSequenceOrdonnee, () => ExerciceBinomialeSequenceOrdonnee> = {
  A: genererFamilleA,
  B: genererFamilleB,
};

export function genererExerciceBinomialeSequenceOrdonnee(): ExerciceBinomialeSequenceOrdonnee {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
