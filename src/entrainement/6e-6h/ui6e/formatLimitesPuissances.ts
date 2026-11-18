import type { CibleLimiteLog, ExerciceLimiteLogD } from "../core6e/limitesLogarithmiques.types";

/**
 * Écritures LaTeX de la famille D de `6gen17` (puissances f(x)^{g(x)}) — SOURCE UNIQUE partagée par
 * l'écran (`formatLimitesLogarithmiques.ts` : énoncé, consignes, aides, état actuel), le corrigé
 * détaillé (`generateurs6e/limitesLogarithmiques/corrigeDetaille.ts`) et l'adaptateur papier. Aucune
 * notation clavier : tout est en LaTeX, « − » via KaTeX, jamais de `^{1}`, de `1x` ni de `+-`.
 */

// ---------------------------------------------------------------------------------------------
// Briques
// ---------------------------------------------------------------------------------------------

/** x^r pour r ∈ {1/2, 1, 2, 3…} : `\sqrt{x}`, `x`, `x^{2}`. */
export function puissanceX(r: number): string {
  if (r === 0.5) return "\\sqrt{x}";
  if (r === 1) return "x";
  if (r === 1.5) return "x\\sqrt{x}";
  return `x^{${r}}`;
}

/** coef·x^r (r ≥ 0) : `2x`, `-x^{2}`, `3\sqrt{x}`, `-2` (r = 0). */
export function monome(coef: number, r: number): string {
  if (r === 0) return String(coef);
  const X = puissanceX(r);
  if (coef === 1) return X;
  if (coef === -1) return `-${X}`;
  return `${coef}${X}`;
}

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** (num/den)·x^r, r positif, nul ou négatif, fraction irréductible, signe devant :
 * `\frac{3x}{2}`, `\frac{3}{2\sqrt{x}}`, `-\frac{2}{x}`, `6`, `\frac{1}{3}`. */
export function monomeRationnel(num: number, den: number, r: number): string {
  const g = pgcd(num, den);
  let n = num / g;
  let d = den / g;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const signe = n < 0 ? "-" : "";
  const absN = Math.abs(n);
  if (r === 0) return d === 1 ? `${n}` : `${signe}\\frac{${absN}}{${d}}`;
  if (r > 0) {
    const haut = absN === 1 ? puissanceX(r) : `${absN}${puissanceX(r)}`;
    return d === 1 ? `${signe}${haut}` : `${signe}\\frac{${haut}}{${d}}`;
  }
  const bas = d === 1 ? puissanceX(-r) : `${d}${puissanceX(-r)}`;
  return `${signe}\\frac{${absN}}{${bas}}`;
}

/** x + b sans « + 0 » ni « + − » : `x`, `x+3`, `x-1`. */
export function xPlus(b: number): string {
  if (b === 0) return "x";
  return b > 0 ? `x+${b}` : `x-${-b}`;
}

/** Expression entre parenthèses si elle contient un « + » ou un « − » de niveau 0 (après `\lim`,
 * jamais `\lim 1+3x` ni `\lim -x`). */
export function parSomme(expr: string): string {
  let profondeur = 0;
  for (const c of expr) {
    if (c === "{") profondeur++;
    else if (c === "}") profondeur--;
    else if (profondeur === 0 && (c === "+" || c === "-")) return `\\left(${expr}\\right)`;
  }
  return expr;
}

/** Facteur entre parenthèses s'il commence par un signe moins (jamais `\cdot -…`). */
export function parSigne(expr: string): string {
  return expr.startsWith("-") ? `\\left(${expr}\\right)` : expr;
}

// ---------------------------------------------------------------------------------------------
// Base f, exposant g, logarithme de la base, variable u de la limite de référence
// ---------------------------------------------------------------------------------------------

/** f(x), sans parenthèses extérieures. */
export function fLatexD(e: ExerciceLimiteLogD): string {
  switch (e.sousType) {
    case "d1":
      return `1${e.a < 0 ? "-" : "+"}\\frac{${Math.abs(e.a)}}{${puissanceX(e.p)}}`;
    case "d2":
      return `\\frac{${xPlus(e.b)}}{${xPlus(e.c)}}`;
    case "d3":
      return `1${e.a < 0 ? "-" : "+"}${monome(Math.abs(e.a), 1)}`;
    case "d4":
    case "d6":
      return "x";
    case "d5":
      return `e^{-\\frac{1}{${puissanceX(e.p)}}}`;
    case "d7":
      return `e^{${puissanceX(e.p)}}`;
  }
}

/** f(x) prête à recevoir un exposant : entre parenthèses, sauf la base x seule. */
export function baseLatexD(e: ExerciceLimiteLogD): string {
  return e.sousType === "d4" || e.sousType === "d6" ? "x" : `\\left(${fLatexD(e)}\\right)`;
}

/** a/ln x avec le signe devant. */
function surLn(a: number): string {
  return `${a < 0 ? "-" : ""}\\frac{${Math.abs(a)}}{\\ln x}`;
}

/** g(x). */
export function gLatexD(e: ExerciceLimiteLogD): string {
  switch (e.sousType) {
    case "d1":
      return monomeRationnel(e.b, e.d, e.q);
    case "d2":
      return monome(e.k, e.q);
    case "d3":
      return monomeRationnel(e.c, 1, -e.q);
    case "d4":
      return e.exposant === "surLn" ? surLn(e.a) : monome(e.a, e.q);
    case "d5":
      return monome(e.a, e.q);
    case "d6":
      return e.exposant === "surLn" ? surLn(e.a) : monomeRationnel(e.a, 1, -e.q);
    case "d7":
      return monomeRationnel(e.a, 1, -e.q);
  }
}

/** ln f(x), tel qu'on l'écrit avant toute simplification. */
export function lnFLatexD(e: ExerciceLimiteLogD): string {
  if (e.sousType === "d4" || e.sousType === "d6") return "\\ln x";
  if (e.sousType === "d3") return `\\ln(${fLatexD(e)})`;
  return `\\ln\\left(${fLatexD(e)}\\right)`;
}

/** Variable u → 0 de la limite de référence ln(1+u)/u → 1 (forme 1^∞ seulement) : a/x^p, (b−c)/(x+c), ax. */
export function uLatexD(e: ExerciceLimiteLogD): string | null {
  if (e.sousType === "d1") return monomeRationnel(e.a, 1, -e.p);
  if (e.sousType === "d2") return `${e.b - e.c < 0 ? "-" : ""}\\frac{${Math.abs(e.b - e.c)}}{${xPlus(e.c)}}`;
  if (e.sousType === "d3") return monome(e.a, 1);
  return null;
}

/** ln(1+u) écrit avec u (pour d2 : la base réécrite 1 + (b−c)/(x+c)) ; égal à `lnFLatexD` pour d1, d3. */
export function lnUnPlusULatexD(e: ExerciceLimiteLogD): string {
  if (e.sousType === "d2") {
    const u = uLatexD(e) as string;
    return `\\ln\\left(1${u.startsWith("-") ? "" : "+"}${u}\\right)`;
  }
  return lnFLatexD(e);
}

export function directionLatexD(e: ExerciceLimiteLogD): string {
  switch (e.sousType) {
    case "d1":
    case "d2":
      return e.direction === "plus_infini" ? "x \\to +\\infty" : "x \\to -\\infty";
    case "d3":
      return e.cote === "droite" ? "x \\to 0^+" : "x \\to 0^-";
    case "d4":
    case "d5":
      return "x \\to 0^+";
    case "d6":
    case "d7":
      return "x \\to +\\infty";
  }
}

export function limD(e: ExerciceLimiteLogD): string {
  return `\\lim_{${directionLatexD(e)}}`;
}

/** f(x)^{g(x)} de l'énoncé. */
export function puissanceLatexD(e: ExerciceLimiteLogD): string {
  return `${baseLatexD(e)}^{${gLatexD(e)}}`;
}

/** Produit g(x)·ln f(x) écrit avec les fonctions de l'exercice, non simplifié. */
export function produitBrutLatexD(e: ExerciceLimiteLogD): string {
  return `${gLatexD(e)}\\cdot ${lnFLatexD(e)}`;
}

const LABELS_CIBLE: Record<string, string> = { plus_infini: "+\\infty", moins_infini: "-\\infty", zero: "0" };

export function cibleLatexD(c: CibleLimiteLog): string {
  return c.type === "valeur" ? c.latex : LABELS_CIBLE[c.type];
}

/** Forme obtenue, exposant signé : `1^{+\infty}`, `1^{-\infty}`, `0^{0}`, `(+\infty)^{0}`. */
export function formeExacteLatexD(e: ExerciceLimiteLogD): string {
  if (e.forme === "un_infini") return `1^{${e.limiteExposant.type === "moins_infini" ? "-" : "+"}\\infty}`;
  if (e.forme === "zero_zero") return "0^{0}";
  return "(+\\infty)^{0}";
}

/** Libellé des choix de l'écran 1 (LaTeX), même ordre partout. */
export const CHOIX_FORME_LATEX: { id: "un_infini" | "zero_zero" | "infini_zero"; latex: string }[] = [
  { id: "un_infini", latex: "1^{\\pm\\infty}" },
  { id: "zero_zero", latex: "0^{0}" },
  { id: "infini_zero", latex: "(+\\infty)^{0}" },
];

/** Réponse attendue d'un écran de la famille D — même contenu pour la validation, le récapitulatif,
 * la fiche de consultation et le « Résultat » du corrigé détaillé. */
export function reponseAttendueDLatex(e: ExerciceLimiteLogD, phase: "dForme" | "dExposant" | "dConclure"): string {
  if (phase === "dForme") return `f(x)\\to ${cibleLatexD(e.limiteBase)},\\quad g(x)\\to ${cibleLatexD(e.limiteExposant)} :\\ \\text{forme } ${formeExacteLatexD(e)}`;
  if (phase === "dExposant") return `${limD(e)} g(x)\\ln f(x)=${cibleLatexD(e.limiteProduit)}`;
  return `${limD(e)} ${puissanceLatexD(e)}=${cibleLatexD(e.limiteFinale)}`;
}
