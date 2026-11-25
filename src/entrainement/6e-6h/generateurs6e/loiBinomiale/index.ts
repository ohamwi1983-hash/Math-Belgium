import type { ExerciceLoiBinomiale } from "../../core6e/loiBinomiale.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { calculerNMinimalC, construireFamilleC } from "./familleC";

export { construireFamilleA, construireFamilleB, construireFamilleC, calculerNMinimalC };

/**
 * `6gen50` « Loi binomiale » (6e ch. 8, § 2, Appliquer). Catalogue refait (audit, lot C ; décision 3) :
 * les cinq variantes B « exactement / au moins / au plus / aucun / tous » (doublons de 6gen48, ch. 7)
 * sont RETIRÉES mais gardées à leur place (`retiree: true`, jamais montrées ni tirées) : les codes
 * `?code=` de A et de C gardent leur variante ; un ancien code d'une variante retirée rouvre un tirage
 * libre. La nouvelle famille B (« B_loi ») est AJOUTÉE EN FIN.
 */

export type IdVarianteLoiBinomiale = "A_justifier" | "B_exactement" | "B_auMoins" | "B_auPlus" | "B_aucun" | "B_tous" | "C_trouverN" | "B_loi";

export const CATALOGUE_VARIANTES: { id: IdVarianteLoiBinomiale; label: string; retiree?: boolean }[] = [
  { id: "A_justifier", label: "A — Reconnaître une loi binomiale (ou la condition qui échoue)" },
  { id: "B_exactement", label: "B — (retirée : exactement k, voir 6gen48)", retiree: true },
  { id: "B_auMoins", label: "B — (retirée : au moins k, voir 6gen48)", retiree: true },
  { id: "B_auPlus", label: "B — (retirée : au plus k, voir 6gen48)", retiree: true },
  { id: "B_aucun", label: "B — (retirée : aucun succès, voir 6gen48)", retiree: true },
  { id: "B_tous", label: "B — (retirée : tous des succès, voir 6gen48)", retiree: true },
  { id: "C_trouverN", label: "C — Trouver n (au moins un succès, logarithme)" },
  { id: "B_loi", label: "B — Loi complète, diagramme, E(X), V(X) et σ(X)" },
];

export function construireAvecVarianteId(id: IdVarianteLoiBinomiale | string): ExerciceLoiBinomiale {
  switch (id) {
    case "A_justifier":
      return construireFamilleA();
    case "B_loi":
      return construireFamilleB();
    case "C_trouverN":
      return construireFamilleC();
    default:
      return genererExerciceLoiBinomiale();
  }
}

/** Tirage libre : une variante non retirée au hasard, à parts égales. */
export function genererExerciceLoiBinomiale(): ExerciceLoiBinomiale {
  const actives = CATALOGUE_VARIANTES.filter((v) => !v.retiree);
  return construireAvecVarianteId(actives[Math.floor(Math.random() * actives.length)].id);
}
