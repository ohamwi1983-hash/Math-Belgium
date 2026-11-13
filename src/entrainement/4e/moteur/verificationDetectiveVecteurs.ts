import type { ExerciceDetectiveVecteurs, IdDescriptionVecteurs, ValeurLigne } from "../core/detectiveVecteurs.types";
import { descriptionCorrecte, indiceLigneFausse, valeursAttendues } from "./modeleDetectiveVecteurs";
import { evaluerExpressionGenerale } from "./expressionGenerale";

/**
 * Vérification de gen91. Écran 1 : le numéro de la ligne fausse. Écran 2 : la description de
 * l'erreur. Écran 3 : chaque valeur (nombre, composantes d'un vecteur, coordonnées d'un point) est
 * comparée à la valeur EXACTE ; une forme exacte équivalente est acceptée (fraction, décimal exact,
 * « rac(20) », « 2rac(5) », « √20 ») mais jamais une approximation d'une racine. Un verdict
 * (alignés / isocèle / rectangle) est un choix fermé.
 */

export type StatutChamp = "correct" | "faux" | "parse_error";

const TOLERANCE = 1e-6;

/** Lecture d'une saisie exacte ; `null` si illisible (lettres parasites, syntaxe invalide). */
export function lireValeur(texte: string): number | null {
  const s = texte
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/√\(/g, "sqrt(")
    .replace(/√\s*(\d+(?:[.,]\d+)?)/g, "sqrt($1)")
    .replace(/(\d),(\d)/g, "$1.$2");
  if (s === "") return null;
  if (/[a-z]/i.test(s.replace(/racine|rac|sqrt/gi, ""))) return null;
  try {
    const v = evaluerExpressionGenerale(s, 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function verifierLigne(e: ExerciceDetectiveVecteurs, indice: number): boolean {
  return indice === indiceLigneFausse(e);
}

export function verifierDescription(e: ExerciceDetectiveVecteurs, choix: IdDescriptionVecteurs): boolean {
  return choix === descriptionCorrecte(e);
}

/** Nombre de champs de saisie d'une valeur (0 pour un verdict). */
export function nombreChamps(v: ValeurLigne): number {
  return v.genre === "nombre" ? 1 : v.genre === "verdict" ? 0 : 2;
}

function cibles(v: ValeurLigne): number[] {
  if (v.genre === "nombre") return [v.valeur];
  if (v.genre === "verdict") return [];
  return [v.x, v.y];
}

export interface SaisieCorrection {
  /** Une liste de textes par valeur attendue (vide pour un verdict). */
  textes: string[][];
  /** Verdict choisi (`true` = le verdict « vrai »), `null` si aucun verdict n'est demandé. */
  verdict: boolean | null;
}

/** Statut de chaque valeur attendue (le verdict a le sien, jamais `parse_error`). */
export function diagnostiquerCorrection(e: ExerciceDetectiveVecteurs, saisie: SaisieCorrection): StatutChamp[] {
  return valeursAttendues(e).map((v, i) => {
    if (v.genre === "verdict") return saisie.verdict === v.vrai ? "correct" : "faux";
    const textes = saisie.textes[i] ?? [];
    const lus = cibles(v).map((_, j) => lireValeur(textes[j] ?? ""));
    if (lus.some((x) => x === null)) return "parse_error";
    return cibles(v).every((c, j) => Math.abs(lus[j]! - c) <= TOLERANCE) ? "correct" : "faux";
  });
}

/** Le verdict attendu est-il faux dans la saisie ? (choix fermé : clôt l'écran). */
export function verdictFaux(e: ExerciceDetectiveVecteurs, statuts: StatutChamp[]): boolean {
  return valeursAttendues(e).some((v, i) => v.genre === "verdict" && statuts[i] === "faux");
}
