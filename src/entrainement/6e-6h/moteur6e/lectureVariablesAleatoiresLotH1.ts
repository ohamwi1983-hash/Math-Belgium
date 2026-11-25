import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import { lireFonction, memesFonctions } from "./lectureValeurExp";

/**
 * Lecture des saisies de 6gen110–6gen115 (6e ch. 8, lot H1). Jamais de blocage de frappe : la saisie
 * est lue telle quelle ; `null` = illisible (`parse_error`, AUCUNE tentative). Évaluateur commun du 6e
 * (`expressionExponentielle.ts` : virgule ou point décimal, « − – — », fractions, √, π, puissances,
 * « × », « · »), plus :
 * - préfixe « E(X) = », « V(Y) = », « σ = », « P(…) = », « k = », « a = », « F(2) = » ignoré ;
 * - unité finale (€, $, °F, °C, min, cm, km, g, h, L) ignorée ; pourcentage final (« 25 % » = 0,25) ;
 * - espaces des milliers (« 12 500 ») ; « ≈ » initial ignoré.
 * Comparaison numérique à 1e-9 (jamais sur la forme : 3/8 = 0,375 = 37,5 %).
 */

const UNITE = /\s*(€|euros?|\$|dollars?|°\s*[fc]|degrés?|min(utes?)?|cm|km|kg|g|h|heures?|l|litres?|points?|ans?)\s*$/i;
const PREFIXE = /^\s*(?:[a-zA-Zσμ]{1,2}\s*(?:\([^=]*\))?|[a-zA-Z]_?\d?|p\s*\([^=]*\))\s*=\s*/;

function normaliser(brut: string): { s: string; pourcent: boolean } {
  let s = normaliserSigneMoins(brut)
    .replace(/[≈~]/g, "")
    .replace(/[   ]/g, " ")
    .replace(/(\d) (?=\d{3}(?!\d))/g, "$1")
    .trim();
  s = s.replace(PREFIXE, "").replace(UNITE, "").trim();
  const pourcent = /%\s*$/.test(s);
  if (pourcent) s = s.replace(/%\s*$/, "").trim();
  return { s, pourcent };
}

/** Valeur numérique d'une saisie ; `null` si illisible, vide ou non finie. */
export function lireVA(brut: string): number | null {
  const { s, pourcent } = normaliser(brut);
  // « 3 4 » : jamais un produit deviné (les milliers « 12 500 » sont déjà recollés).
  if (s === "" || s.includes("=") || s.includes(";") || /\d\s+[\d.,]/.test(s)) return null;
  try {
    const v = evaluerExpressionExponentielle(s.replace(/[{[]/g, "(").replace(/[}\]]/g, ")"), {});
    if (!Number.isFinite(v)) return null;
    return pourcent ? v / 100 : v;
  } catch {
    return null;
  }
}

export const egalNum = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

/** Nombre décimal ÉCRIT (« 0,375 », « −2,5 », « 37,5 % ») — pas une fraction, ni une racine. */
export function estDecimalEcrit(brut: string): boolean {
  const { s } = normaliser(brut);
  return /^-?\d+[.,]\d+$/.test(s.replace(/\s/g, ""));
}

/** Nombre de décimales écrites (« 1,19 » → 2) ; 0 pour un entier ; `null` si ce n'est pas un décimal / entier écrit. */
export function decimalesEcrites(brut: string): number | null {
  const { s } = normaliser(brut);
  const m = /^-?\d+(?:[.,](\d+))?$/.exec(s.replace(/\s/g, ""));
  if (!m) return null;
  return m[1] ? m[1].length : 0;
}

/** La saisie contient-elle une racine (« √ », « sqrt ») ? */
export const contientRacine = (brut: string) => /√|sqrt|racine/i.test(brut);

/** Statut d'une valeur EXACTE attendue. */
export function statutExact(brut: string, attendu: number): StatutVerification {
  const v = lireVA(brut);
  if (v === null) return "parse_error";
  return egalNum(v, attendu) ? "correct" : "not_equivalent";
}

/** Valeur décimale écrite proche (à 2 %) d'une valeur exacte qu'elle n'égale pas : valeur approchée. */
export function estApprochee(brut: string, attendu: number): boolean {
  if (!estDecimalEcrit(brut)) return false;
  const v = lireVA(brut);
  if (v === null || egalNum(v, attendu)) return false;
  return Math.abs(v - attendu) <= Math.max(0.02 * Math.abs(attendu), 0.006);
}

export const MESSAGE_APPROCHEE =
  "Ta valeur est une valeur approchée : on demande la valeur exacte (une fraction, ou un décimal s'il est exact). Cela ne compte pas comme une tentative.";

/**
 * Valeur à donner ARRONDIE au centième (ou exacte) : `correct` si la saisie vaut la valeur exacte, ou
 * si c'est un décimal d'au moins deux décimales à moins d'un demi-centième ; `trop` si c'est un
 * décimal plus court mais proche (message sans tentative) ; sinon faux / illisible.
 */
export function statutArrondiCentieme(brut: string, exact: number): StatutVerification | "trop" {
  const v = lireVA(brut);
  if (v === null) return "parse_error";
  if (egalNum(v, exact)) return "correct";
  const k = decimalesEcrites(brut);
  if (k === null) return "not_equivalent";
  if (k >= 2 && Math.abs(v - exact) <= 0.005 + 1e-9) return "correct";
  if (k < 2 && Math.abs(v - exact) <= 0.051) return "trop";
  return "not_equivalent";
}

export const MESSAGE_TROP_ARRONDI = "Ta valeur est trop arrondie : donne-la arrondie au centième (deux décimales). Cela ne compte pas comme une tentative.";

/** La saisie vaut-elle (à 1e-9) la valeur candidate (messages ciblés) ? */
export function vaut(brut: string, candidat: number): boolean {
  const v = lireVA(brut);
  return v !== null && Number.isFinite(candidat) && egalNum(v, candidat);
}

/** Fonction de x saisie (« 2x/9 », « f(x) = 2x/9 ») ; `null` si illisible. */
export function lireFonctionVA(brut: string): ((x: number) => number) | null {
  const s = normaliserSigneMoins(brut).replace(/[   ]/g, " ").trim();
  if (s === "") return null;
  return lireFonction(s, "x");
}

/** Statut d'une fonction de x attendue, comparée en plusieurs points de l'intervalle. */
export function statutFonction(brut: string, attendue: (x: number) => number, points: number[]): StatutVerification {
  const f = lireFonctionVA(brut);
  if (f === null) return "parse_error";
  return memesFonctions(f, attendue, points) ? "correct" : "not_equivalent";
}

export function fonctionVaut(brut: string, candidate: (x: number) => number, points: number[]): boolean {
  const f = lireFonctionVA(brut);
  return f !== null && memesFonctions(f, candidate, points);
}
