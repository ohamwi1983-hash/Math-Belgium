import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/** Verdict d'une saisie : seuls `correct` et `faux` consomment une tentative. */
export type DiagnosticSaisie =
  | { statut: "illisible"; message?: string }
  | { statut: "approchee"; message?: string }
  | { statut: "nonCompte"; message: FragmentConsigne[] }
  | { statut: "correct" }
  | { statut: "faux"; champsFaux?: number[]; message?: FragmentConsigne[] | null };

/**
 * Lecture des saisies libres de 5gen50–5gen53 (champ jamais filtré : la seule transformation pendant
 * la frappe est `normaliserSigneMoins`, règle CLAUDE.md). Une saisie est lue APRÈS coup :
 * - « − », « – », « — » → « - » ; « π », « pi », « √3 », « sqrt(3) », virgule décimale, fraction ;
 * - préfixe recopié (« x = », « A ≈ », « S = ») et unité finale (« rad », « cm² », « cm ») ignorés ;
 * - `null` = illisible : l'appli ne la transmet jamais au moteur (aucune tentative consommée).
 */

export interface LectureNombre {
  valeur: number;
  /** Écrit avec un nombre décimal et sans π ni racine : valeur APPROCHÉE d'une valeur exacte. */
  decimal: boolean;
}

const UNITES = /\s*(rad|radians?|cm\s*²|cm2|cm\^2|m\s*²|m2|cm|m|unités?|u)\s*\.?\s*$/i;

function nettoyer(texte: string): string {
  let s = normaliserSigneMoins(texte).trim();
  s = s.replace(/^.*[=≈]/, "").trim();
  s = s.replace(UNITES, "").trim();
  s = s.replace(/[’`]/g, "'");
  return s;
}

/** Un nombre (angle en π, valeur exacte avec racine, décimal) ; `null` si illisible. */
export function lireNombreTrig(texte: string): LectureNombre | null {
  const s = nettoyer(texte);
  if (s === "") return null;
  if (/[a-zA-Z]/.test(s.replace(/pi|sqrt|racine/gi, ""))) return null;
  try {
    const v = evaluerExpressionGenerale(s.replace(/(\d),(\d)/g, "$1.$2"), 0);
    if (!Number.isFinite(v)) return null;
    return { valeur: v, decimal: /\d[.,]\d/.test(s) && !/π|pi|√|sqrt|racine/i.test(s) };
  } catch {
    return null;
  }
}

/** « n'existe pas », « non définie », « impossible »… (tangente non définie). */
export function estNexistePas(texte: string): boolean {
  return /n'?\s*existe\s+pas|non\s+d[ée]fini|ind[ée]fini|impossible|∄|pas\s+d[ée]fini/i.test(normaliserSigneMoins(texte).replace(/[’`]/g, "'"));
}

/**
 * Liste de valeurs « S = {π/6 ; 5π/6} » : accolades et préfixe facultatifs, séparateur « ; » (ou
 * « , » suivi d'une espace quand aucun « ; » n'est écrit, ou « et » / « ou »). `null` si une valeur
 * est illisible ou si la liste est vide.
 */
export function lireListeTrig(texte: string): LectureNombre[] | null {
  let s = normaliserSigneMoins(texte).trim();
  s = s.replace(/^[^={]*=/, "").trim();
  s = s.replace(/^\{/, "").replace(/\}\s*\.?$/, "").trim();
  if (s === "") return null;
  let morceaux = s.split(/\s*;\s*|\s+et\s+|\s+ou\s+/);
  if (morceaux.length === 1 && /,\s|,(?=\D)|(?<=\D),/.test(s)) morceaux = s.split(/\s*,\s*/);
  morceaux = morceaux.map((m) => m.trim()).filter((m) => m !== "");
  if (morceaux.length === 0) return null;
  const res: LectureNombre[] = [];
  for (const m of morceaux) {
    const l = lireNombreTrig(m);
    if (!l) return null;
    res.push(l);
  }
  return res;
}

/** Deux réels égaux à 1e-9 près (valeurs exactes calculées en flottant). */
export function egaux(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9 * Math.max(1, Math.abs(b));
}

/** a et b égaux à un multiple de `periode` près. */
export function egauxModulo(a: number, b: number, periode: number): boolean {
  const k = Math.round((a - b) / periode);
  return Math.abs(a - b - k * periode) < 1e-9 * Math.max(1, Math.abs(b));
}

/** Valeur approchée (décimale) proche de la valeur exacte attendue : à signaler sans compter. */
export function estApprochee(l: LectureNombre, attendue: number): boolean {
  return l.decimal && !egaux(l.valeur, attendue) && Math.abs(l.valeur - attendue) <= 6e-3 * Math.max(1, Math.abs(attendue));
}
