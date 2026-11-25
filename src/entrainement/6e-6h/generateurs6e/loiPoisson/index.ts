import type { ExerciceLoiPoisson } from "../../core6e/loiPoisson.types";
import { construireFamilleA, construireFamilleB } from "./familles";

export { construireFamilleA, construireFamilleB } from "./familles";

/**
 * `6gen53` « Loi de Poisson » (6e ch. 8, § 8, Appliquer). Catalogue inchangé (mêmes identifiants,
 * même ordre : les codes `?code=` gardent leur variante) ; les variantes ne sont plus figées (avant :
 * n = 100, p = 0,05 ; contexte et valeurs fixes en B).
 */

export type IdVarianteLoiPoisson = "A_verifier" | "B_exactement" | "B_entreAetB" | "B_auPlus" | "B_auMoins";

export const CATALOGUE_VARIANTES: { id: IdVarianteLoiPoisson; label: string }[] = [
  { id: "A_verifier", label: "A — Approximation de Poisson : conditions, λ, P(X = k)" },
  { id: "B_exactement", label: "B — λ ajusté, exactement k" },
  { id: "B_entreAetB", label: "B — λ ajusté, entre a et b" },
  { id: "B_auPlus", label: "B — λ ajusté, au plus k" },
  { id: "B_auMoins", label: "B — λ ajusté, au moins k" },
];

export function construireAvecVarianteId(id: IdVarianteLoiPoisson | string): ExerciceLoiPoisson {
  switch (id) {
    case "A_verifier":
      return construireFamilleA();
    case "B_exactement":
      return construireFamilleB("exactement");
    case "B_entreAetB":
      return construireFamilleB("entreAetB");
    case "B_auPlus":
      return construireFamilleB("auPlus");
    case "B_auMoins":
      return construireFamilleB("auMoins");
    default:
      return genererExerciceLoiPoisson();
  }
}

/** Tirage libre : famille A ou B à parts égales (B : type de question au quart). */
export function genererExerciceLoiPoisson(): ExerciceLoiPoisson {
  return Math.random() < 0.5 ? construireFamilleA() : construireFamilleB();
}
