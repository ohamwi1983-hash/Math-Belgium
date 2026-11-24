import { egal, lireNombre } from "./lectureValeurExp";
import type { StatutVerification } from "../moteur/statutVerification";

/**
 * Lecture des probabilités saisies dans `6gen160` (indépendants ou incompatibles ?) et `6gen161`
 * (quel jeu choisir ?) — 6e ch. 6, lot G. Au-dessus de `lectureValeurExp.ts` (évaluateur du 6e ch. 2 :
 * fractions, virgule ou point décimal, « − – — », « × », « · », parenthèses). Ajouts : préfixe
 * « P(…) = » ou « p = » ignoré, pourcentage final (« 25 % » = 0,25). Toute écriture EXACTE est
 * acceptée (comparaison numérique à 1e-9, jamais sur la forme : 3/12 = 1/4 = 0,25 = 25 %) ; une
 * saisie illisible rend `null` (`parse_error`, aucune tentative) ; une valeur décimale (ou un
 * pourcentage) PROCHE de la valeur exacte mais différente est « approchée » : message, aucune
 * tentative — la consigne demande la valeur exacte.
 */

const PREFIXE = /^\s*p\s*(\([^=]*\))?\s*=\s*/i;

export function lireProbabilite(texte: string): number | null {
  let s = texte.replace(PREFIXE, "").trim();
  const pourcent = /%\s*$/.test(s);
  if (pourcent) s = s.replace(/%\s*$/, "").trim();
  if (s === "") return null;
  const v = lireNombre(s);
  if (v === null) return null;
  return pourcent ? v / 100 : v;
}

export function statutProbabilite(texte: string, attendu: number): StatutVerification {
  const v = lireProbabilite(texte);
  if (v === null) return "parse_error";
  return egal(v, attendu) ? "correct" : "not_equivalent";
}

/** Saisie décimale (ou en %) proche de la valeur exacte attendue, mais différente. */
export function probabiliteApprochee(texte: string, attendu: number): boolean {
  const s = texte.replace(PREFIXE, "");
  if (!/\d[.,]\d/.test(s) && !/%/.test(s)) return false;
  const v = lireProbabilite(texte);
  if (v === null || egal(v, attendu)) return false;
  return Math.abs(v - attendu) <= Math.max(0.02 * Math.abs(attendu), 0.0051);
}

export const MESSAGE_APPROCHEE_PROBA =
  "Ta valeur est une valeur approchée : on demande la probabilité exacte (une fraction, ou un décimal s'il est exact). Cela ne compte pas comme une tentative.";

export const MESSAGE_ILLISIBLE_PROBA =
  "Je n'arrive pas à lire ta réponse (exemples d'écritures : 3/20, 0,15, 15 %). Cela ne compte pas comme une tentative.";

/** Valeur égale (à 1e-9) à l'une des valeurs candidates (messages ciblés). */
export function vaut(texte: string, candidat: number): boolean {
  const v = lireProbabilite(texte);
  return v !== null && Number.isFinite(candidat) && egal(v, candidat);
}
