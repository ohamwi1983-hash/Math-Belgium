/**
 * Lecture des saisies de 5gen25–5gen35 (5e ch. 5, lot B — règles communes, modèle du 5e ch. 4) : la
 * frappe n'est jamais bloquée, la saisie est lue APRÈS coup.
 * - Un nombre se lit avec `evaluerExpressionGenerale` (fractions, racines « √ », π, « − – — »).
 * - Une saisie ILLISIBLE, ou une valeur décimale APPROCHÉE d'une valeur exacte attendue, est refusée
 *   par le MOTEUR (`soumettre*` rend l'état inchangé) : aucune tentative consommée, l'écran le dit.
 * - Une valeur EXACTE est comparée à 1e-9 près (la tolérance 0,01 de `diagnostiquerNombre` laissait
 *   passer 1,86 pour 13/7).
 */
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";

/** Préfixe recopié ignoré (« f'(2) = », « x = », « y = »…). */
function sansPrefixe(brut: string): string {
  return normaliserSigneMoins(brut).replace(/^[^=]*=/, "").trim();
}

/** Valeur d'un nombre écrit (fraction, racine, π) — null si illisible. */
export function lireNombreDerivees(brut: string): number | null {
  const s = sansPrefixe(brut);
  if (s === "" || /x|h|t|q/i.test(s.replace(/sqrt|racine|rac|pi/gi, ""))) return null;
  try {
    const v = evaluerExpressionGenerale(s, 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

export function nombreIllisibleDerivees(brut: string): boolean {
  return brut.trim() !== "" && lireNombreDerivees(brut) === null;
}

/** Valeur décimale écrite (sans racine, fraction ni π) proche d'une valeur exacte, sans l'être. */
export function estApprocheeDerivees(brut: string, attendu: number): boolean {
  if (!Number.isFinite(attendu)) return false;
  const v = lireNombreDerivees(brut);
  if (v === null) return false;
  if (Math.abs(v - attendu) < 1e-9 * Math.max(1, Math.abs(attendu))) return false;
  if (!/\d[.,]\d/.test(brut) || /√|sqrt|racine|rac|π|pi|\//i.test(brut)) return false;
  return Math.abs(v - attendu) <= 6e-3 * Math.max(1, Math.abs(attendu));
}

/** Saisie d'une valeur EXACTE refusée sans tentative : illisible, ou décimale approchée. */
export function nombreExactRefuseDerivees(brut: string, attendu: number): boolean {
  return lireNombreDerivees(brut) === null || estApprocheeDerivees(brut, attendu);
}

/** Valeur exacte : égalité à 1e-9 près (une approximation n'est jamais « correcte »). */
export function diagnostiquerNombreExact(brut: string, attendu: number): StatutVerification {
  const v = lireNombreDerivees(brut);
  if (v === null) return "parse_error";
  return Math.abs(v - attendu) < 1e-9 * Math.max(1, Math.abs(attendu)) ? "correct" : "not_equivalent";
}

/** Une expression (en x, h, t ou q) est lisible si sa SYNTAXE est reconnue : une valeur hors du
 * domaine en un point (√(x − 5) en x = 0,37) n'est pas illisible, c'est une réponse à juger. */
export function expressionLisibleDerivees(brut: string, variable: "x" | "h" | "t" | "q" = "x"): boolean {
  let s = normaliserSigneMoins(brut).trim();
  s = s.replace(/^[^=]*=/, "").trim();
  if (s === "") return false;
  if (variable !== "x") s = s.replace(new RegExp(`(?<![a-zA-Z])${variable}(?![a-zA-Z])`, "g"), "x");
  for (const x of [0.37, 1.61, -0.83]) {
    try {
      evaluerExpressionGenerale(s, x);
    } catch {
      return false;
    }
  }
  return true;
}

const FIN = " Cette saisie ne compte pas comme une tentative.";

export type ChampDerivees =
  | "nombre"
  | "nombreExact"
  | "expressionX"
  | "expressionH"
  | "expressionT"
  | "expressionQ"
  | "equation"
  | "liste"
  | "coordonnees"
  | "approchee";

export const MESSAGES_ILLISIBLE_DERIVEES: Record<ChampDerivees, string> = {
  nombre: "Nombre non reconnu : écris un nombre, par exemple 12,5 ou −3/4 (virgule ou point)." + FIN,
  nombreExact: "Nombre non reconnu : écris une valeur exacte, par exemple −3, 5/2 ou 1 + √2." + FIN,
  expressionX: "Expression non reconnue : vérifie les parenthèses, les signes et la place de x." + FIN,
  expressionH: "Expression non reconnue : vérifie les parenthèses, les signes et la place de h." + FIN,
  expressionT: "Expression non reconnue : vérifie les parenthèses, les signes et la place de t." + FIN,
  expressionQ: "Expression non reconnue : vérifie les parenthèses, les signes et la place de q." + FIN,
  equation: "Équation non reconnue : écris « y = », puis une expression en x, par exemple y = 3x − 2." + FIN,
  liste: "Valeur non reconnue : écris chaque valeur comme un nombre, par exemple −2, 5/3 ou 1 + √2." + FIN,
  coordonnees: "Coordonnée non reconnue : écris chaque coordonnée comme un nombre, par exemple −2 ou 5/3." + FIN,
  approchee: "C'est une valeur approchée : on demande la valeur exacte (entier, fraction ou racine, par exemple 5/3 ou 2 − √3)." + FIN,
};

