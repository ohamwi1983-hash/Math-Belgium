import type { ExerciceDetectiveStatistique, IdDescriptionStatistique } from "../core/detectiveStatistique.types";
import { evaluerExpressionGenerale } from "./expressionGenerale";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { arrondi, contexteDe, descriptionCorrecte, indiceLigneFausse, reponseAttendue, resultat } from "./modeleDetectiveStatistique";

/**
 * Vérification de gen112. Écran 1 : le numéro de la ligne fausse. Écran 2 : la description de
 * l'erreur. Écran 3 : le résultat final corrigé, lu dans un champ libre (jamais filtré) : un nombre
 * (virgule décimale, fraction ou calcul acceptés), préfixe « x̄ = », « σ ≈ » et unité finale
 * (« % », « livres », « min »…) ignorés. Valeur EXACTE attendue, sauf l'écart-type (arrondi au
 * centième : tolérance de 0,01, l'écart dû à une variance non arrondie est accepté).
 */

export type StatutChampStatistique = "correct" | "faux" | "parse_error";

function echapperRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

/** Lecture d'une saisie ; `null` si illisible. */
export function lireNombre(texte: string, e: ExerciceDetectiveStatistique): number | null {
  let s = normaliserSigneMoins(texte).trim();
  if (s === "") return null;
  // Préfixe « x̄ = », « σ ≈ », « Q3 − Q1 = » : on garde ce qui suit le dernier « = » ou « ≈ ».
  s = s.replace(/^.*[=≈]/, "").trim();
  const c = contexteDe(e);
  for (const u of ["%", "pour cent", ...c.unite.slice().sort((a, b) => b.length - a.length), "minutes", "heures"]) {
    s = s.replace(new RegExp(`\\s*${echapperRegex(u)}\\s*\\.?$`, "i"), "");
  }
  s = s.replace(/(\d)[\s  ]+(?=\d)/g, "$1").trim();
  if (s === "") return null;
  try {
    const v = evaluerExpressionGenerale(s.replace(/(\d),(\d)/g, "$1.$2"), 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function verifierLigne(e: ExerciceDetectiveStatistique, indice: number): boolean {
  return indice === indiceLigneFausse(e);
}

export function verifierDescription(e: ExerciceDetectiveStatistique, choix: IdDescriptionStatistique): boolean {
  return choix === descriptionCorrecte(e);
}

export function diagnostiquerCorrection(e: ExerciceDetectiveStatistique, texte: string): StatutChampStatistique {
  const v = lireNombre(texte, e);
  if (v === null) return "parse_error";
  const r = reponseAttendue(e);
  return Math.abs(v - r.valeur) <= r.tolerance ? "correct" : "faux";
}

/** La saisie reprend le résultat (faux) de la copie : l'erreur n'a pas été corrigée. */
export function estResultatCopie(e: ExerciceDetectiveStatistique, texte: string): boolean {
  const v = lireNombre(texte, e);
  const copie = resultat(e, true);
  // La copie écrit « ≈ » avec 2 décimales quand le résultat n'est pas décimal court.
  return v !== null && (Math.abs(v - copie) <= 1e-6 || Math.abs(v - arrondi(copie, 2)) <= 1e-6);
}
