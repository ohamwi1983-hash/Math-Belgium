import type { ExerciceSigneRacines, PhaseSigneRacines } from "../core/signeRacines.types";
import { lireNombreSaisi } from "../ui/ensembleSolutionTrinome";
import { valeurAttendue } from "./modeleSigneRacines";

/**
 * Vérification de gen114 : champs libres jamais filtrés (fraction, virgule décimale, préfixe « P = »,
 * « Δ = », « x₂ = » toléré), valeur EXACTE ; verdict = choix fermé. Diagnostics ciblés pour les
 * erreurs de signe classiques (−c/a, b/a, −4ac mal signé, 1 au lieu de −1).
 */

export type StatutChampSigne = "correct" | "faux" | "parse_error";

export function lireValeur(texte: string): number | null {
  return lireNombreSaisi(texte.replace(/^\s*[^=]*=/, ""));
}

export function diagnostiquer(e: ExerciceSigneRacines, phase: PhaseSigneRacines, texte: string): StatutChampSigne {
  const v = lireValeur(texte);
  if (v === null) return "parse_error";
  return Math.abs(v - valeurAttendue(e, phase)) < 1e-9 ? "correct" : "faux";
}

/** Message propre à une erreur de signe reconnue, sinon `null`. */
export function messageErreur(e: ExerciceSigneRacines, phase: PhaseSigneRacines, texte: string): string | null {
  const v = lireValeur(texte);
  if (v === null) return null;
  const proche = (x: number) => Math.abs(v - x) < 1e-9;
  if (phase === "P" && proche(-e.c / e.a)) return "Le produit des racines vaut c/a, sans signe moins.";
  if (phase === "S" && proche(e.b / e.a)) return "La somme des racines vaut −b/a : attention au signe moins.";
  if (phase === "delta" && proche(e.b * e.b + 4 * e.a * e.c)) return "Le terme −4ac est mal signé.";
  if (phase === "delta" && proche(-e.b * e.b - 4 * e.a * e.c)) return "Le carré de b est toujours positif.";
  if (phase === "x1" && proche(-valeurAttendue(e, "x1"))) return "Teste à nouveau a + b + c et a − b + c.";
  return null;
}
