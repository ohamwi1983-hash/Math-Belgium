import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import type { StatutVerification } from "../../5e-4h/moteur/statutVerification";
import { decoderLigne } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Intervalle } from "../ui6e/nombresCycloLotG";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";

/**
 * Lecture des saisies des générateurs 6gen156–6gen159 (6e ch. 1, lot G de l'audit) — jamais de
 * blocage de frappe : la saisie est lue telle quelle, `null` = illisible (l'écran le dit, AUCUNE
 * tentative consommée). Évaluateur commun (`expressionExponentielle.ts` : virgule ou point, « − »,
 * fractions, puissances, π, √, arcsin/arccos/arctan, multiplication implicite), plus :
 * - « sin⁻¹ », « sin^-1 », « arcsinx » (collé) lus comme arcsin ;
 * - unité finale (« ° », « m », « cm », « rad ») ignorée ou signalée (`uniteSaisie`) ;
 * - préfixe « θ = », « x = », « f(x) = », « g(x) = », « f⁻¹(x) = » toléré ;
 * - ±∞ (« +∞ », « ∞ », « inf », « infini ») dans les bornes d'intervalles ;
 * - listes de valeurs séparées par « ; » (« −1 ; 1 »), ou « aucune » / « ∅ ».
 */

const UNITE_FINALE = /\s*(°|degrés?|deg|cm|m|mètres?|rad(ians?)?)\s*$/i;

function normaliserCyclo(brut: string): string {
  return normaliserSigneMoins(brut)
    .replace(/≈/g, "")
    .replace(/(sin|cos|tan)\s*(\^\s*\(?\s*-\s*1\s*\)?|⁻¹)/gi, "arc$1")
    .replace(/(arcsin|arccos|arctan|asin|acos|atan)(?=[a-zA-Zπ])/gi, "$1 ")
    .replace(/(\d)[    ](?=\d{3}(?!\d))/g, "$1")
    .trim();
}

/** Unité écrite à la fin de la saisie (« rad » ou « ° »), `null` sinon. */
export function uniteSaisie(brut: string): "deg" | "rad" | "longueur" | null {
  const m = UNITE_FINALE.exec(normaliserCyclo(brut));
  if (!m) return null;
  const u = m[1].toLowerCase();
  if (u.startsWith("rad")) return "rad";
  if (u === "°" || u.startsWith("deg")) return "deg";
  return "longueur";
}

function sansPrefixe(s: string): string {
  return s.replace(/^\s*([a-zA-Zα-ωθ]{1,3}(_?\w+)?('|′)?\s*(⁻¹|\^\s*\(?-1\)?)?\s*(\([^()]*\))?)\s*=\s*/, "");
}

function preparerValeur(brut: string): string {
  return sansPrefixe(normaliserCyclo(brut)).replace(UNITE_FINALE, "").trim();
}

/** Valeur numérique d'une saisie, ou `null` si elle est illisible (ou non finie). */
export function lireValeur(brut: string): number | null {
  const s = preparerValeur(brut);
  if (s === "" || s.includes("=") || s.includes(";")) return null;
  try {
    const v = evaluerExpressionExponentielle(s, {});
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** La saisie est-elle un nombre décimal ÉCRIT (« 0,785 », « −1,57 ») — pas une fraction, ni π, ni √ ? */
export function estDecimalEcrit(brut: string): boolean {
  return /^-?\d+[.,]\d+$/.test(preparerValeur(brut).replace(/\s/g, ""));
}

/** Valeur exacte attendue (π, √, fraction) : `correct` à 1e-9 près. */
export function statutExact(brut: string, exact: number): StatutVerification {
  const v = lireValeur(brut);
  if (v === null) return "parse_error";
  return Math.abs(v - exact) <= 1e-9 * Math.max(1, Math.abs(exact)) ? "correct" : "not_equivalent";
}

/** Écriture décimale proche (à 1 % près) d'une valeur exacte qu'elle n'égale pas : « valeur approchée ». */
export function estApprocheeDe(brut: string, exact: number): boolean {
  if (!estDecimalEcrit(brut)) return false;
  const v = lireValeur(brut);
  if (v === null) return false;
  const ecart = Math.abs(v - exact);
  return ecart > 1e-9 * Math.max(1, Math.abs(exact)) && ecart <= 0.01 * Math.max(1, Math.abs(exact));
}

/** Valeur approchée attendue : `correct` si l'écart est au plus `tolerance`. */
export function statutProche(brut: string, attendu: number, tolerance: number): StatutVerification {
  const v = lireValeur(brut);
  if (v === null) return "parse_error";
  return Math.abs(v - attendu) <= tolerance ? "correct" : "not_equivalent";
}

export function valeurProche(brut: string, cible: number, tolerance: number): boolean {
  const v = lireValeur(brut);
  return v !== null && Math.abs(v - cible) <= tolerance;
}

/** ±∞ écrit (« +∞ », « ∞ », « +inf », « -infini ») : la valeur, sinon `null`. */
export function lireInfini(brut: string): number | null {
  const s = normaliserSigneMoins(brut).replace(/\s/g, "").toLowerCase();
  const m = /^([+-]?)(∞|inf|infini|infinity|\\infty)$/.exec(s);
  if (!m) return null;
  return m[1] === "-" ? -Infinity : Infinity;
}

export function lireBorne(brut: string): number | null {
  return lireInfini(brut) ?? lireValeur(brut);
}

export type RaisonEnsemble = "infini-ferme" | "approchee" | "crochet" | "nombre" | "borne" | null;

/**
 * Ensemble saisi (lignes d'intervalles encodées par l'écran « intervalles ») comparé à l'ensemble
 * attendu : mêmes intervalles, dans n'importe quel ordre ; une borne doit valoir la borne exacte
 * (π, fraction, √…) à 1e-9 près ; un crochet fermé sur ±∞ est faux (`infini-ferme`) ; une borne
 * décimale proche d'une borne exacte est signalée (`approchee`, aucune tentative).
 */
export function diagnostiquerEnsemble(valeurs: string[], attendu: Intervalle[]): { statut: StatutVerification; raison: RaisonEnsemble } {
  const lus: { g: number; d: number; gFerme: boolean; dFerme: boolean; gBrut: string; dBrut: string }[] = [];
  for (const v of valeurs) {
    const l = decoderLigne(v);
    const g = lireBorne(l.gauche);
    const d = lireBorne(l.droite);
    if (g === null || d === null) return { statut: "parse_error", raison: null };
    lus.push({ g, d, gFerme: l.ouvrant === "[", dFerme: l.fermant === "]", gBrut: l.gauche, dBrut: l.droite });
  }
  if (lus.some((l) => (l.gFerme && !Number.isFinite(l.g)) || (l.dFerme && !Number.isFinite(l.d)))) return { statut: "not_equivalent", raison: "infini-ferme" };
  const egal = (a: number, b: number) => (Number.isFinite(a) || Number.isFinite(b) ? Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)) : a === b);
  const tri = [...lus].sort((a, b) => a.g - b.g);
  const att = [...attendu].sort((a, b) => a.g.valeur - b.g.valeur);
  if (tri.length === att.length && tri.every((l, i) => egal(l.g, att[i].g.valeur) && egal(l.d, att[i].d.valeur))) {
    const crochetsOk = tri.every((l, i) => l.gFerme === att[i].gFerme && l.dFerme === att[i].dFerme);
    return crochetsOk ? { statut: "correct", raison: null } : { statut: "not_equivalent", raison: "crochet" };
  }
  // Même nombre d'intervalles et bornes approchées d'une borne exacte : valeur approchée signalée.
  if (tri.length === att.length) {
    const proche = (brut: string, lu: number, b: number) => egal(lu, b) || (Number.isFinite(b) && estApprocheeDe(brut, b));
    if (tri.every((l, i) => proche(l.gBrut, l.g, att[i].g.valeur) && proche(l.dBrut, l.d, att[i].d.valeur))) return { statut: "not_equivalent", raison: "approchee" };
    return { statut: "not_equivalent", raison: "borne" };
  }
  return { statut: "not_equivalent", raison: "nombre" };
}

/** Liste de valeurs séparées par « ; » (ou « et »), ou « aucune » / « ∅ » ; `null` si illisible. */
export function lireListe(brut: string): number[] | "aucune" | null {
  const s = normaliserCyclo(brut).replace(/^\s*x\s*=\s*/i, "");
  if (/^(aucune?|aucun zéro|aucun zero|∅|\{\s*\}|rien|pas de (solution|zéro|zero)s?)$/i.test(s.trim())) return "aucune";
  const morceaux = s
    .split(/;|\bet\b|\bou\b/)
    .map((m) => m.trim())
    .filter((m) => m !== "");
  if (morceaux.length === 0) return null;
  const vals: number[] = [];
  for (const m of morceaux) {
    if (/^±/.test(m)) {
      const v = lireValeur(m.slice(1));
      if (v === null) return null;
      vals.push(v, -v);
      continue;
    }
    const v = lireValeur(m);
    if (v === null) return null;
    vals.push(v);
  }
  return vals;
}

/** Liste attendue (ensemble de valeurs exactes, éventuellement vide) : comparée comme un ensemble. */
export function statutListe(brut: string, attendu: number[]): StatutVerification {
  const l = lireListe(brut);
  if (l === null) return "parse_error";
  if (l === "aucune") return attendu.length === 0 ? "correct" : "not_equivalent";
  const egal = (a: number, b: number) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
  const uniques = l.filter((v, i) => l.findIndex((w) => egal(v, w)) === i);
  if (uniques.length !== attendu.length) return "not_equivalent";
  return attendu.every((a) => uniques.some((v) => egal(v, a))) ? "correct" : "not_equivalent";
}

/** Une valeur de la liste est-elle une approximation décimale d'une valeur attendue ? */
export function listeApprochee(brut: string, attendu: number[]): boolean {
  const s = normaliserCyclo(brut);
  const morceaux = s.split(/;|\bet\b|\bou\b/).map((m) => m.trim()).filter((m) => m !== "");
  return morceaux.some((m) => attendu.some((a) => estApprocheeDe(m.replace(/^±/, ""), Math.abs(a)) || estApprocheeDe(m, a)));
}

function preparerExpression(brut: string): string {
  return normaliserCyclo(brut).replace(/^\s*([a-zA-Z]{1,3}\s*(⁻¹|\^\s*\(?-1\)?)?\s*\(\s*[xy]\s*\)|y)\s*=\s*/i, "");
}

/** Évalue une expression de x (`null` : hors domaine ; « illisible » : syntaxe). */
export function evaluerExpressionX(brut: string, x: number): number | null | "illisible" {
  const s = preparerExpression(brut);
  if (s === "" || s.includes("=")) return "illisible";
  try {
    const v = evaluerExpressionExponentielle(s, { x });
    return Number.isFinite(v) ? v : null;
  } catch {
    return "illisible";
  }
}

/** Expression de x : `correct` si elle vaut `attendue(x)` en tous les points testés. */
export function statutExpressionX(brut: string, attendue: (x: number) => number, points: number[], tolRel = 1e-7): StatutVerification {
  const premier = evaluerExpressionX(brut, points[0]);
  if (premier === "illisible") return "parse_error";
  for (const x of points) {
    const v = evaluerExpressionX(brut, x);
    if (v === "illisible") return "parse_error";
    const a = attendue(x);
    if (v === null || Math.abs(v - a) > tolRel * Math.max(1, Math.abs(a))) return "not_equivalent";
  }
  return "correct";
}

export function expressionVaut(brut: string, cible: (x: number) => number, points: number[]): boolean {
  return statutExpressionX(brut, cible, points) === "correct";
}
