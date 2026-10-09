import type { ExerciceVariablesDiscretesEsperance, FamilleVariablesDiscretesEsperance } from "../../core6e/variablesDiscretesEsperance.types";
import { construireFamilleA } from "./familleA";
import { construireContexteDirect, construireFamilleB, construireHypergeometrique } from "./familleB";
import { construireFamilleC, construireImposer, construireVerifier } from "./familleC";

export { construireFamilleA } from "./familleA";
export { construireContexteDirect, construireFamilleB, construireHypergeometrique } from "./familleB";
export { construireFamilleC, construireImposer, construireVerifier } from "./familleC";

/**
 * Couche A (6e) — point d'entrée `6gen49` ("Variables aléatoires discrètes et espérance").
 * Tirage à 1 seul niveau pour la famille A (pas de sous-type), 2 niveaux pour B/C (famille PUIS
 * sous-type) — mirroir `generateurs6e/denombrementFondamental/index.ts` (6gen43).
 */

export type IdVarianteVariablesDiscretesEsperance = "A_contraires" | "B_contexteDirect" | "B_hypergeometrique" | "C_verifier" | "C_imposer";

export const CATALOGUE_VARIANTES: { id: IdVarianteVariablesDiscretesEsperance; label: string }[] = [
  { id: "A_contraires", label: "A — Loi donnée : cumuls et événements contraires" },
  { id: "B_contexteDirect", label: "B — Construire la loi (contexte direct) et E(X)" },
  { id: "B_hypergeometrique", label: "B — Construire la loi (hypergéométrique) et E(X)" },
  { id: "C_verifier", label: "C — Jeu équitable : vérifier E" },
  { id: "C_imposer", label: "C — Jeu équitable : imposer m pour E=0" },
];

export function construireAvecVarianteId(id: IdVarianteVariablesDiscretesEsperance): ExerciceVariablesDiscretesEsperance {
  switch (id) {
    case "A_contraires":
      return construireFamilleA();
    case "B_contexteDirect":
      return construireContexteDirect();
    case "B_hypergeometrique":
      return construireHypergeometrique();
    case "C_verifier":
      return construireVerifier();
    case "C_imposer":
      return construireImposer();
  }
}

const FAMILLES: FamilleVariablesDiscretesEsperance[] = ["A", "B", "C"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleVariablesDiscretesEsperance, () => ExerciceVariablesDiscretesEsperance> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
};

export function genererExerciceVariablesDiscretesEsperance(): ExerciceVariablesDiscretesEsperance {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
