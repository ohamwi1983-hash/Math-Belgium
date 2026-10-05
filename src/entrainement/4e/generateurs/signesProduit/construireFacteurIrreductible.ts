import type { FacteurQuadratiqueIrreductible } from "../../core/signesProduit.types";
import { construireDeltaNegatif } from "../inequations/construireDeltaNegatif";

/**
 * Réutilise tel quel le constructeur Δ<0 de l'exercice "tableau de signes" (exercice 16) — ce
 * facteur ne contribue jamais de racine, son signe est constant sur tout ℝ, égal au signe réel de
 * `enonce.a` (Δ<0 le garantit).
 */
export function construireFacteurIrreductible(): FacteurQuadratiqueIrreductible {
  const { enonce } = construireDeltaNegatif();
  return { type: "quadratique_irreductible", enonce, signe: enonce.a > 0 ? "+" : "-" };
}
