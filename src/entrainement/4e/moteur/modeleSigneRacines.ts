import type { ExerciceSigneRacines, PhaseSigneRacines, VerdictSignes } from "../core/signeRacines.types";

/**
 * Modèle de gen114 « Signe des racines sans les calculer » : P, Δ, S, racine évidente, séquence des
 * écrans et verdict. Une seule source pour l'écran, le papier et le corrigé.
 */

type E = ExerciceSigneRacines;

export function produit(e: E): number {
  return e.c / e.a;
}

export function somme(e: E): number {
  return -e.b / e.a;
}

export function delta(e: E): number {
  return e.b * e.b - 4 * e.a * e.c;
}

/** Racine évidente : 1 si a + b + c = 0, −1 si a − b + c = 0. */
export function racineEvidente(e: E): 1 | -1 {
  return e.a + e.b + e.c === 0 ? 1 : -1;
}

export function autreRacine(e: E): number {
  return produit(e) / racineEvidente(e);
}

/** Verdict recalculé à partir des coefficients (contrôle du générateur). */
export function verdictCalcule(e: E): VerdictSignes {
  const P = produit(e);
  if (P < 0) return "opposes";
  if (delta(e) < 0) return "aucune";
  return somme(e) > 0 ? "positives" : "negatives";
}

/** Écrans de l'exercice, dans l'ordre. */
export function phases(e: E): PhaseSigneRacines[] {
  if (e.variante === "racineEvidente") return ["x1", "P", "x2", "verdict"];
  if (produit(e) < 0) return ["P", "verdict"];
  if (delta(e) < 0) return ["P", "delta", "verdict"];
  return ["P", "delta", "S", "verdict"];
}

/** Valeur attendue d'un écran à champ. */
export function valeurAttendue(e: E, phase: PhaseSigneRacines): number {
  switch (phase) {
    case "P":
      return produit(e);
    case "delta":
      return delta(e);
    case "S":
      return somme(e);
    case "x1":
      return racineEvidente(e);
    case "x2":
      return autreRacine(e);
    default:
      return Number.NaN;
  }
}
