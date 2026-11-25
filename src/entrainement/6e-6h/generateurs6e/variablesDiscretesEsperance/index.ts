import type { ExerciceVariablesDiscretesEsperance } from "../../core6e/variablesDiscretesEsperance.types";
import { construireFamilleA } from "./familleA";
import { construireContexteDirect, construireHypergeometrique } from "./familleB";
import { construireImposer, construireVerifier } from "./familleC";

export { construireFamilleA } from "./familleA";
export { construireContexteDirect, construireFamilleB, construireHypergeometrique } from "./familleB";
export { construireFamilleC, construireImposer, construireVerifier } from "./familleC";

/**
 * `6gen49` « Variables aléatoires discrètes et espérance » (6e ch. 8, § 1, Appliquer). Catalogue
 * inchangé (mêmes identifiants, même ordre : les codes `?code=` gardent leur variante). Tirage libre :
 * une variante au hasard, à parts égales.
 */

export type IdVarianteVariablesDiscretesEsperance = "A_contraires" | "B_contexteDirect" | "B_hypergeometrique" | "C_verifier" | "C_imposer";

export const CATALOGUE_VARIANTES: { id: IdVarianteVariablesDiscretesEsperance; label: string }[] = [
  { id: "A_contraires", label: "A — Loi donnée : probabilités et événements contraires" },
  { id: "B_contexteDirect", label: "B — Construire la loi (dé, roue, enquête) et E(X)" },
  { id: "B_hypergeometrique", label: "B — Construire la loi (tirage sans remise) et E(X)" },
  { id: "C_verifier", label: "C — Jeu : E(X) du gain net, puis conclure" },
  { id: "C_imposer", label: "C — Jeu : mise équitable, puis juger une mise" },
];

export function construireAvecVarianteId(id: IdVarianteVariablesDiscretesEsperance | string): ExerciceVariablesDiscretesEsperance {
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
    default:
      return genererExerciceVariablesDiscretesEsperance();
  }
}

export function genererExerciceVariablesDiscretesEsperance(): ExerciceVariablesDiscretesEsperance {
  const id = CATALOGUE_VARIANTES[Math.floor(Math.random() * CATALOGUE_VARIANTES.length)].id;
  return construireAvecVarianteId(id);
}

