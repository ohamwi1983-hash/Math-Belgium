import type { ExerciceExtensionsBinomialeNormaleBayes, FamilleExtensionsBinomialeNormaleBayes } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import { construireCompose, construireDirect, construireFamilleA } from "./familleA";
import { construireFamilleB, construireFamilleBAvecTypeQuestion } from "./familleB";
import { construireAvecSousType, construireFamilleC } from "./familleC";
import { construireAvecValeurs as construireFamilleDAvecValeurs, construireFamilleD } from "./familleD";
import { construireFamilleE, construireAvecValeurs as construireFamilleEAvecValeurs } from "./familleE";
import { construireFamilleF, construireAvecValeurs as construireFamilleFAvecValeurs } from "./familleF";

export { construireCompose, construireDirect, construireFamilleA, construireFamilleB, construireFamilleBAvecTypeQuestion, construireFamilleC, construireAvecSousType, construireFamilleD, construireFamilleDAvecValeurs, construireFamilleE, construireFamilleEAvecValeurs, construireFamilleF, construireFamilleFAvecValeurs };

/**
 * Couche A (6e) — point d'entrée `6gen52` ("Extensions binomiale, normale et Bayes (problèmes)"),
 * générateur DE CLÔTURE du chapitre "Variables aléatoires et lois de probabilités". Tirage
 * ÉQUIPROBABLE de la famille (A à F) — voir en-tête `core6e/extensionsBinomialeNormaleBayes.types.ts`
 * pour le détail des 5 points de réutilisation exigés par la mission.
 */

export type IdVarianteExtensionsBinomialeNormaleBayes =
  | "A_compose"
  | "A_direct"
  | "B_exactement"
  | "B_auMoins"
  | "B_auPlus"
  | "B_aucun"
  | "B_tous"
  | "C_cumulee"
  | "C_symetrique"
  | "C_encadree"
  | "D_bayes3"
  | "E_uniforme"
  | "F_reconstruire";

export const CATALOGUE_VARIANTES: { id: IdVarianteExtensionsBinomialeNormaleBayes; label: string }[] = [
  { id: "A_compose", label: "A — Indépendance composée (p1×p2) + trouver n" },
  { id: "A_direct", label: "A — Probabilité directe + trouver n" },
  { id: "B_exactement", label: "B — Binomial : exactement k (terme unique)" },
  { id: "B_auMoins", label: "B — Binomial : au moins k" },
  { id: "B_auPlus", label: "B — Binomial : au plus k" },
  { id: "B_aucun", label: "B — Binomial : aucun succès" },
  { id: "B_tous", label: "B — Binomial : tous succès" },
  { id: "C_cumulee", label: "C — Loi normale inverse : cumulée" },
  { id: "C_symetrique", label: "C — Loi normale inverse : symétrique" },
  { id: "C_encadree", label: "C — Loi normale inverse : encadrée" },
  { id: "D_bayes3", label: "D — Bayes à 3 catégories" },
  { id: "E_uniforme", label: "E — Loi uniforme continue" },
  { id: "F_reconstruire", label: "F — Reconstruire une loi + espérance appliquée" },
];

export function construireAvecVarianteId(id: IdVarianteExtensionsBinomialeNormaleBayes): ExerciceExtensionsBinomialeNormaleBayes {
  switch (id) {
    case "A_compose":
      return construireCompose();
    case "A_direct":
      return construireDirect();
    case "B_exactement":
      return construireFamilleBAvecTypeQuestion(8, 0.3, "exactement");
    case "B_auMoins":
      return construireFamilleBAvecTypeQuestion(6, 0.5, "auMoins");
    case "B_auPlus":
      return construireFamilleBAvecTypeQuestion(6, 0.5, "auPlus");
    case "B_aucun":
      return construireFamilleBAvecTypeQuestion(7, 0.4, "aucun");
    case "B_tous":
      return construireFamilleBAvecTypeQuestion(7, 0.4, "tous");
    case "C_cumulee":
      return construireAvecSousType("cumulee");
    case "C_symetrique":
      return construireAvecSousType("symetrique");
    case "C_encadree":
      return construireAvecSousType("encadree");
    case "D_bayes3":
      return construireFamilleD();
    case "E_uniforme":
      return construireFamilleE();
    case "F_reconstruire":
      return construireFamilleF();
  }
}

const FAMILLES: FamilleExtensionsBinomialeNormaleBayes[] = ["A", "B", "C", "D", "E", "F"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleExtensionsBinomialeNormaleBayes, () => ExerciceExtensionsBinomialeNormaleBayes> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
  E: construireFamilleE,
  F: construireFamilleF,
};

export function genererExerciceExtensionsBinomialeNormaleBayes(): ExerciceExtensionsBinomialeNormaleBayes {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
