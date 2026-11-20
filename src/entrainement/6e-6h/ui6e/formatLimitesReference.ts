import type { ExerciceLimitesRef, FormeLimite, ReferenceLimite } from "../core6e/limitesReference.types";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransExp.types";
import { lx, tx } from "./ecransExp.types";
import { coefL, q, qL, qVal, termeL } from "./nombresExp";
import type { Q } from "./nombresExp";

/**
 * Couche C — modèle et textes de 6gen145 « Limites de référence et croissances comparées » :
 * expression, forme, références acceptées, valeur exacte, consignes, aides à deux niveaux. Source
 * unique de l'écran, du récapitulatif, du corrigé et du papier.
 */

type E = ExerciceLimitesRef;
export type PhaseLimitesRef = "forme" | "reference" | "valeur";
export const PHASES: PhaseLimitesRef[] = ["forme", "reference", "valeur"];
export const COURS_LIMITES = "(cours, § 1)";

// ============================================================================
// Écritures.
// ============================================================================

/** Fraction NON réduite n/d, signe devant (« −\\dfrac{3}{2} »). */
export const fracBrute = (n: number, d: number): string => `${n * d < 0 ? "-" : ""}\\dfrac{${Math.abs(n)}}{${Math.abs(d)}}`;

export const puissanceX = (n: number): string => (n === 1 ? "x" : `x^{${n}}`);
export const monome = (c: number, n: number): string => `${coefL(c)}${puissanceX(n)}`;
export const expKx = (k: number): string => `e^{${coefL(k)}x}`;
/** Base de l'exponentielle (a = 0 code e). */
export const baseA = (a: number): string => (a === 0 ? "e" : `${a}`);
export const valeurBase = (a: number): number => (a === 0 ? Math.E : a);

/** Exponentielle de la variante « moinsInfini » : e^{kx} ou aˣ. */
export function expoMoins(e: E): string {
  return e.a === 0 ? expKx(e.k) : `${e.a}^{x}`;
}

export function pointL(e: E): string {
  return e.point === "0" ? "0" : e.point === "+inf" ? "+\\infty" : "-\\infty";
}

/** « \lim_{x → a} » avec « x → a » SOUS « lim ». */
export const limL = (e: E, v = "x"): string => `\\displaystyle\\lim_{${v}\\to ${pointL(e)}}`;

/** Somme ou différence de niveau 0 : entre parenthèses derrière « lim ». */
function aParentheses(e: E): boolean {
  return (e.variante === "plusInfini" && e.sousType === "difference") || e.sousType === "sommeInfini" || e.sousType === "produitPlusD";
}

/** « lim_{x → a} f(x) », f entre parenthèses si c'est une somme ou une différence. */
export function limExprL(e: E): string {
  const F = expressionL(e);
  return `${limL(e)}${aParentheses(e) ? `\\left(${F}\\right)` : F}`;
}

export function expressionL(e: E): string {
  const A = baseA(e.a);
  switch (`${e.variante}/${e.sousType}`) {
    case "expo0/quotient":
      return `\\dfrac{${expKx(e.k)}-1}{${coefL(e.m)}x}`;
    case "expo0/inverse":
      return `\\dfrac{${coefL(e.m)}x}{${expKx(e.k)}-1}`;
    case "expo0/difference":
      return `\\dfrac{${expKx(e.k)}-${expKx(e.j)}}{${coefL(e.m)}x}`;
    case "base0/quotient":
      return `\\dfrac{${e.a}^{${coefL(e.k)}x}-1}{${coefL(e.m)}x}`;
    case "base0/difference":
      return `\\dfrac{${e.a}^{x}-${e.b}^{x}}{x}`;
    case "plusInfini/quotient":
      return `\\dfrac{${monome(e.c, e.n)}}{${A}^{x}}`;
    case "plusInfini/inverse":
      return `\\dfrac{${A}^{x}}{${monome(e.c, e.n)}}`;
    case "plusInfini/produit":
      return `${monome(e.c, e.n)}\\,e^{-${e.k === 1 ? "" : e.k}x}`;
    case "plusInfini/difference":
      return `${A}^{x}-${monome(e.c, e.n)}`;
    case "moinsInfini/produit":
    case "moinsInfini/produitPlusD":
      return `${monome(e.c, e.n)}\\,${expoMoins(e)}${termeL(e.d)}`;
    case "pasFI/produitInfini":
      return `${monome(e.c, e.n)}\\,${A}^{x}`;
    case "pasFI/sommeInfini":
      return `${A}^{x}+${monome(e.c, e.n)}`;
    case "pasFI/quotientMoins":
      return `\\dfrac{${monome(e.c, e.n)}}{${A}^{x}}`;
    default:
      return `\\dfrac{${expKx(e.k)}${termeL(e.c)}}{x}`;
  }
}

/** Valeur numérique de l'expression (contrôles). */
export function evaluer(e: E, x: number): number {
  const A = valeurBase(e.a);
  switch (`${e.variante}/${e.sousType}`) {
    case "expo0/quotient":
      return (Math.exp(e.k * x) - 1) / (e.m * x);
    case "expo0/inverse":
      return (e.m * x) / (Math.exp(e.k * x) - 1);
    case "expo0/difference":
      return (Math.exp(e.k * x) - Math.exp(e.j * x)) / (e.m * x);
    case "base0/quotient":
      return (e.a ** (e.k * x) - 1) / (e.m * x);
    case "base0/difference":
      return (e.a ** x - e.b ** x) / x;
    case "plusInfini/quotient":
      return (e.c * x ** e.n) / A ** x;
    case "plusInfini/inverse":
      return A ** x / (e.c * x ** e.n);
    case "plusInfini/produit":
      return e.c * x ** e.n * Math.exp(-e.k * x);
    case "plusInfini/difference":
      return A ** x - e.c * x ** e.n;
    case "moinsInfini/produit":
    case "moinsInfini/produitPlusD":
      return e.c * x ** e.n * (e.a === 0 ? Math.exp(e.k * x) : e.a ** x) + e.d;
    case "pasFI/produitInfini":
      return e.c * x ** e.n * A ** x;
    case "pasFI/sommeInfini":
      return A ** x + e.c * x ** e.n;
    case "pasFI/quotientMoins":
      return (e.c * x ** e.n) / A ** x;
    default:
      return (Math.exp(e.k * x) + e.c) / x;
  }
}

/** Valeur exacte de la limite : rationnel, k·ln a (`ln`), ln a − ln b, ou ±∞. */
export type ValeurLimite = { genre: "q"; q: Q } | { genre: "ln"; q: Q; a: number } | { genre: "lnDiff"; a: number; b: number } | { genre: "inf"; signe: 1 | -1 };

export function limite(e: E): ValeurLimite {
  switch (`${e.variante}/${e.sousType}`) {
    case "expo0/quotient":
      return { genre: "q", q: q(e.k, e.m) };
    case "expo0/inverse":
      return { genre: "q", q: q(e.m, e.k) };
    case "expo0/difference":
      return { genre: "q", q: q(e.k - e.j, e.m) };
    case "base0/quotient":
      return { genre: "ln", q: q(e.k, e.m), a: e.a };
    case "base0/difference":
      return { genre: "lnDiff", a: e.a, b: e.b };
    case "plusInfini/quotient":
    case "plusInfini/produit":
      return { genre: "q", q: q(0) };
    case "plusInfini/inverse":
    case "plusInfini/difference":
    case "pasFI/produitInfini":
    case "pasFI/sommeInfini":
      return { genre: "inf", signe: 1 };
    case "moinsInfini/produit":
    case "moinsInfini/produitPlusD":
      return { genre: "q", q: q(e.d) };
    case "pasFI/quotientMoins":
      return { genre: "inf", signe: e.c * (e.n % 2 === 0 ? 1 : -1) > 0 ? 1 : -1 };
    default:
      return { genre: "q", q: q(0) };
  }
}

export function valeurLimiteNum(v: ValeurLimite): number {
  if (v.genre === "q") return qVal(v.q);
  if (v.genre === "ln") return qVal(v.q) * Math.log(v.a);
  if (v.genre === "lnDiff") return Math.log(v.a) - Math.log(v.b);
  return v.signe * Infinity;
}

/** « k·ln a » écrit proprement (coefficient 1 / −1 omis). */
export function coefLnL(c: Q, a: number): string {
  const ln = `\\ln ${a}`;
  if (c.n === c.d) return ln;
  if (c.n === -c.d) return `-${ln}`;
  return `${qL(c)}\\ln ${a}`;
}

export function valeurLimiteL(v: ValeurLimite): string {
  if (v.genre === "q") return qL(v.q);
  if (v.genre === "ln") return coefLnL(v.q, v.a);
  if (v.genre === "lnDiff") return `\\ln ${v.a}-\\ln ${v.b}`;
  return v.signe > 0 ? "+\\infty" : "-\\infty";
}

export function formeAttendue(e: E): FormeLimite {
  if (e.variante === "expo0" || e.variante === "base0") return "0/0";
  if (e.variante === "moinsInfini") return "0inf";
  if (e.variante === "pasFI") return "aucune";
  if (e.sousType === "produit") return "0inf";
  if (e.sousType === "difference") return "inf-inf";
  return "inf/inf";
}

/** Références acceptées (la première est la réponse affichée). (aˣ − 1)/x → ln a vaut aussi pour
 * a = e ; en −∞, xⁿaˣ se ramène aussi à xⁿ/bˣ en +∞ (x = −y). */
export function referencesAcceptees(e: E): ReferenceLimite[] {
  switch (e.variante) {
    case "expo0":
      return ["R1", "R2"];
    case "base0":
      return ["R2"];
    case "plusInfini":
      return ["R3"];
    case "moinsInfini":
      return ["R4", "R3"];
    default:
      return ["R5"];
  }
}

export const FORMES_L: Record<FormeLimite, Frag[]> = {
  "0/0": [tx("Forme indéterminée "), lx("\\dfrac{0}{0}")],
  "inf/inf": [tx("Forme indéterminée "), lx("\\dfrac{\\infty}{\\infty}")],
  "0inf": [tx("Forme indéterminée "), lx("0\\cdot\\infty")],
  "inf-inf": [tx("Forme indéterminée "), lx("\\infty-\\infty")],
  aucune: [tx("Ce n'est pas une forme indéterminée")],
};

export const REFERENCES_L: Record<ReferenceLimite, Frag[]> = {
  R1: [lx("\\displaystyle\\lim_{u\\to 0}\\dfrac{e^{u}-1}{u}=1")],
  R2: [lx("\\displaystyle\\lim_{x\\to 0}\\dfrac{a^{x}-1}{x}=\\ln a"), tx(" (a > 0)")],
  R3: [lx("\\displaystyle\\lim_{x\\to +\\infty}\\dfrac{x^{n}}{a^{x}}=0"), tx(" (a > 1)")],
  R4: [lx("\\displaystyle\\lim_{x\\to -\\infty}x^{n}a^{x}=0"), tx(" (a > 1)")],
  R5: [tx("Aucune : les règles de calcul des limites suffisent")],
};

// ============================================================================
// Morceaux (limite de chaque morceau : écran 1, aides, corrigé).
// ============================================================================

export interface Morceau {
  /** LaTeX du morceau. */
  expr: string;
  /** Limite du morceau (LaTeX). */
  lim: string;
  /** Écriture intermédiaire éventuelle (« e^{0}-1 »). */
  via?: string;
  role: string;
}

const infSigne = (s: number): string => (s > 0 ? "+\\infty" : "-\\infty");

export function morceaux(e: E): Morceau[] {
  const A = baseA(e.a);
  const signeMonomeMoins = e.c * (e.n % 2 === 0 ? 1 : -1);
  switch (`${e.variante}/${e.sousType}`) {
    case "expo0/quotient":
      return [{ expr: `${expKx(e.k)}-1`, via: "e^{0}-1", lim: "0", role: "numérateur" }, { expr: `${coefL(e.m)}x`, lim: "0", role: "dénominateur" }];
    case "expo0/inverse":
      return [{ expr: `${coefL(e.m)}x`, lim: "0", role: "numérateur" }, { expr: `${expKx(e.k)}-1`, via: "e^{0}-1", lim: "0", role: "dénominateur" }];
    case "expo0/difference":
      return [{ expr: `${expKx(e.k)}-${expKx(e.j)}`, via: "e^{0}-e^{0}", lim: "0", role: "numérateur" }, { expr: `${coefL(e.m)}x`, lim: "0", role: "dénominateur" }];
    case "base0/quotient":
      return [{ expr: `${e.a}^{${coefL(e.k)}x}-1`, via: `${e.a}^{0}-1`, lim: "0", role: "numérateur" }, { expr: `${coefL(e.m)}x`, lim: "0", role: "dénominateur" }];
    case "base0/difference":
      return [{ expr: `${e.a}^{x}-${e.b}^{x}`, via: `${e.a}^{0}-${e.b}^{0}`, lim: "0", role: "numérateur" }, { expr: "x", lim: "0", role: "dénominateur" }];
    case "plusInfini/quotient":
      return [{ expr: monome(e.c, e.n), lim: "+\\infty", role: "numérateur" }, { expr: `${A}^{x}`, lim: "+\\infty", role: "dénominateur" }];
    case "plusInfini/inverse":
      return [{ expr: `${A}^{x}`, lim: "+\\infty", role: "numérateur" }, { expr: monome(e.c, e.n), lim: "+\\infty", role: "dénominateur" }];
    case "plusInfini/produit":
      return [{ expr: monome(e.c, e.n), lim: "+\\infty", role: "premier facteur" }, { expr: `e^{-${e.k === 1 ? "" : e.k}x}`, lim: "0", role: "second facteur" }];
    case "plusInfini/difference":
      return [{ expr: `${A}^{x}`, lim: "+\\infty", role: "premier terme" }, { expr: monome(e.c, e.n), lim: "+\\infty", role: "terme retranché" }];
    case "moinsInfini/produit":
    case "moinsInfini/produitPlusD":
      return [{ expr: monome(e.c, e.n), lim: infSigne(signeMonomeMoins), role: "premier facteur" }, { expr: expoMoins(e), lim: "0", role: "second facteur" }];
    case "pasFI/produitInfini":
      return [{ expr: monome(e.c, e.n), lim: "+\\infty", role: "premier facteur" }, { expr: `${A}^{x}`, lim: "+\\infty", role: "second facteur" }];
    case "pasFI/sommeInfini":
      return [{ expr: `${A}^{x}`, lim: "+\\infty", role: "premier terme" }, { expr: monome(e.c, e.n), lim: "+\\infty", role: "second terme" }];
    case "pasFI/quotientMoins":
      return [{ expr: monome(e.c, e.n), lim: infSigne(signeMonomeMoins), role: "numérateur" }, { expr: `${A}^{x}`, lim: "0^{+}", role: "dénominateur (positif)" }];
    default:
      return [{ expr: `${expKx(e.k)}${termeL(e.c)}`, via: `0${termeL(e.c)}`, lim: `${e.c}`, role: "numérateur" }, { expr: "x", lim: "-\\infty", role: "dénominateur" }];
  }
}

// ============================================================================
// Consignes, champs, options.
// ============================================================================

export function consigneGenerale(e: E): Frag[] {
  return [tx("On cherche "), lx(`${limExprL(e)}`), tx(".")];
}

export function consigne(_e: E, phase: PhaseLimitesRef): Frag[] {
  if (phase === "forme") return [tx("Calcule la limite de chaque morceau : quelle forme obtiens-tu ?")];
  if (phase === "reference") return [tx("Quelle limite de référence permet de conclure ?")];
  return [tx("Donne la valeur de la limite (valeur exacte, ou "), lx("+\\infty"), tx(", "), lx("-\\infty"), tx(").")];
}

export function libelle(_e: E, phase: PhaseLimitesRef): string {
  return phase === "forme" ? "Forme" : phase === "reference" ? "Limite de référence" : "Valeur de la limite";
}

export function champs(e: E): ChampEcran[] {
  return [{ label: "Valeur de la limite", labelLatex: `${limExprL(e)}=`, placeholder: "ex. : 7/4, 2 ln 3, -inf" }];
}

export function options(phase: PhaseLimitesRef): OptionEcran[] {
  if (phase === "forme") return (["0/0", "inf/inf", "0inf", "inf-inf", "aucune"] as FormeLimite[]).map((id) => ({ id, fragments: FORMES_L[id] }));
  return (["R1", "R2", "R3", "R4", "R5"] as ReferenceLimite[]).map((id) => ({ id, fragments: REFERENCES_L[id] }));
}

export function reponse(e: E, phase: PhaseLimitesRef): Frag[] {
  if (phase === "forme") return FORMES_L[formeAttendue(e)];
  if (phase === "reference") return REFERENCES_L[referencesAcceptees(e)[0]];
  return [lx(`${limExprL(e)}=${valeurLimiteL(limite(e))}`)];
}

export const recap = reponse;

export function messageIllisible(): string {
  return "Je n'arrive pas à lire ta réponse (exemples d'écritures acceptées : 3/2, −4, 2ln(3), ln(5)−ln(2), +∞, -inf). Cela ne compte pas comme une tentative.";
}

// ============================================================================
// Aides (niveau 1 : la règle ; niveau 2 : appliquée à l'instance, sans la réponse).
// ============================================================================

export function aide1(e: E, phase: PhaseLimitesRef): AideEcran {
  if (phase === "forme") return { texte: [tx("Calcule séparément la limite de chaque morceau (numérateur et dénominateur, chaque facteur ou chaque terme). Les formes indéterminées sont "), lx("\\dfrac{0}{0}"), tx(", "), lx("\\dfrac{\\infty}{\\infty}"), tx(", "), lx("0\\cdot\\infty"), tx(" et "), lx("\\infty-\\infty"), tx(".")] };
  if (phase === "reference") return { texte: [tx("Une limite de référence a la même forme que ton expression, à une constante près (ou après l'avoir coupée en deux). Regarde d'abord où tend "), lx("x"), tx(", puis la base de l'exponentielle.")] };
  if (e.variante === "pasFI") return { texte: [tx("Règles de calcul : un produit de deux infinis est infini, un nombre non nul divisé par un infini tend vers 0, un infini divisé par "), lx("0^{+}"), tx(" est infini (attention au signe).")] };
  if (e.variante === "expo0") return { texte: [tx("Fais apparaître "), lx("\\dfrac{e^{u}-1}{u}"), tx(" avec "), lx("u"), tx(" proportionnel à "), lx("x"), tx(" : quand "), lx("x\\to 0"), tx(", "), lx("u\\to 0"), tx(" aussi.")], latex: "\\displaystyle\\lim_{u\\to 0}\\dfrac{e^{u}-1}{u}=1" };
  if (e.variante === "base0") return { texte: [tx("Par définition du nombre "), lx("\\ln a"), tx(" (pente de "), lx("a^{x}"), tx(" en 0) :")], latex: "\\displaystyle\\lim_{u\\to 0}\\dfrac{a^{u}-1}{u}=\\ln a" };
  if (e.variante === "plusInfini") return { texte: [tx("Règle de dominance : pour toute base "), lx("a>1"), tx(" et tout entier "), lx("n"), tx(", l'exponentielle l'emporte :")], latex: "\\displaystyle\\lim_{x\\to+\\infty}\\dfrac{x^{n}}{a^{x}}=0" };
  return { texte: [tx("En "), lx("-\\infty"), tx(", pour "), lx("a>1"), tx(", "), lx("a^{x}"), tx(" tend vers 0 plus vite que "), lx("x^{n}"), tx(" ne grandit :")], latex: "\\displaystyle\\lim_{x\\to-\\infty}x^{n}a^{x}=0" };
}

export function aide2(e: E, phase: PhaseLimitesRef): AideEcran | null {
  const m = morceaux(e);
  if (phase === "forme") {
    const expo = m.find((x) => /e\^|\^\{x\}|\^\{[-0-9]*x\}/.test(x.expr)) ?? m[0];
    return { texte: [tx("Par exemple, le "), tx(expo.role), tx(" : "), lx(`${limL(e)}\\left(${expo.expr}\\right)=${expo.lim}`), tx(". À toi pour l'autre morceau.")] };
  }
  if (phase === "reference") {
    const ou = e.point === "0" ? "x tend vers 0" : e.point === "+inf" ? "x tend vers +∞" : "x tend vers −∞";
    const b = e.variante === "base0" ? `la base ${e.a} n'est pas e` : e.variante === "expo0" ? "la base est e" : "la base de l'exponentielle est plus grande que 1";
    return { texte: [tx(`Ici, ${ou} et ${b}. `), tx(e.variante === "pasFI" ? "Relis les limites des morceaux : la forme obtenue est-elle vraiment indéterminée ?" : "Laquelle des quatre limites a cette allure ?")] };
  }
  switch (`${e.variante}/${e.sousType}`) {
    case "expo0/quotient":
    case "base0/quotient":
      return { texte: [tx("Multiplie et divise par "), lx(`${e.k}`), tx(" :")], latex: `${expressionL(e)}=${fracBrute(e.k, e.m)}\\cdot\\dfrac{${e.variante === "expo0" ? expKx(e.k) : `${e.a}^{${coefL(e.k)}x}`}-1}{${coefL(e.k)}x}` };
    case "expo0/inverse":
      return { texte: [tx("C'est l'inverse d'un quotient de la forme "), lx("\\dfrac{e^{u}-1}{u}"), tx(", multiplié par une constante : écris "), lx(`\\dfrac{${coefL(e.m)}x}{${expKx(e.k)}-1}=${fracBrute(e.m, e.k)}\\cdot\\dfrac{${coefL(e.k)}x}{${expKx(e.k)}-1}`), tx(".")] };
    case "expo0/difference":
      return { texte: [tx("Retranche et ajoute 1 au numérateur, puis coupe en deux quotients :")], latex: `\\dfrac{(${expKx(e.k)}-1)-(${expKx(e.j)}-1)}{${coefL(e.m)}x}` };
    case "base0/difference":
      return { texte: [tx("Retranche et ajoute 1 au numérateur, puis coupe en deux quotients :")], latex: `\\dfrac{${e.a}^{x}-1}{x}-\\dfrac{${e.b}^{x}-1}{x}` };
    case "plusInfini/inverse":
      return { texte: [tx("C'est l'inverse de "), lx(`\\dfrac{${monome(e.c, e.n)}}{${baseA(e.a)}^{x}}`), tx(", qui tend vers 0 en restant positif.")] };
    case "plusInfini/produit":
      return { texte: [tx("Écris le produit comme un quotient : "), lx(`e^{-${e.k === 1 ? "" : e.k}x}=\\dfrac{1}{e^{${e.k === 1 ? "" : e.k}x}}`), tx(".")] };
    case "plusInfini/difference":
      return { texte: [tx("Mets "), lx(`${baseA(e.a)}^{x}`), tx(" en évidence :")], latex: `${baseA(e.a)}^{x}\\left(1-${e.c === 1 ? "" : `${e.c}\\cdot `}\\dfrac{${puissanceX(e.n)}}{${baseA(e.a)}^{x}}\\right)` };
    case "plusInfini/quotient":
      return { texte: [tx("Sors la constante : "), lx(`${expressionL(e)}=${e.c}\\cdot\\dfrac{${puissanceX(e.n)}}{${baseA(e.a)}^{x}}`), tx(".")] };
    case "moinsInfini/produit":
    case "moinsInfini/produitPlusD":
      return { texte: [tx(e.d === 0 ? "Le produit " : "Le produit (sans le terme constant) "), lx(`${monome(e.c, e.n)}\\,${expoMoins(e)}`), tx(" a la forme de la référence"), ...(e.a === 0 && e.k !== 1 ? [tx(" avec "), lx(`e^{${e.k}x}=\\left(e^{${e.k}}\\right)^{x}`)] : []), tx(e.d === 0 ? "." : " ; le terme constant garde sa valeur.")] };
    default:
      return { texte: [tx("Limite de chaque morceau : "), ...m.flatMap((x, i) => [...(i > 0 ? [tx(" et ")] : []), lx(`${x.expr}\\to ${x.lim}`)]), tx(". Applique la règle de calcul qui convient.")] };
  }
}
