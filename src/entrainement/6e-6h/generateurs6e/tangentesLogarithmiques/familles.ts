import type { FonctionTangente } from "../../core6e/tangentesLogarithmiques.types";
import { latexRationnel } from "./exact";

/**
 * Familles de fonctions de `6gen87` (écritures LaTeX, fonctions numériques, domaine, aides de la
 * dérivée). Les valeurs exactes aux points de contact sont calculées par les constructeurs de
 * variantes (`index.ts`), famille par famille.
 */

const POINTS_POSITIFS = [0.45, 0.9, 1.7, 2.6, 3.4];
const POINTS_REELS = [-2.1, -1.3, -0.6, 0.7, 1.4, 2.3];

/** Écriture à multiplier : parenthèses si elle commence par un signe. */
export function pourProduit(v: string): string {
  return v.startsWith("-") ? `\\left(${v}\\right)` : v;
}

/** Écriture à élever au carré : parenthèses sauf pour un entier positif ou une lettre seule. */
export function pourPuissance(v: string): string {
  return /^([0-9]+|[a-z])$/.test(v) ? v : `\\left(${v}\\right)`;
}

/** Argument d'une fonction (ln, log) : `\left( \right)` pour une fraction. */
function arg(v: string): string {
  return v.includes("\\dfrac") || v.includes("^") ? `\\left(${v}\\right)` : `(${v})`;
}

/** k·v (« 2a », « 2\cdot 3 », « -e »). */
function mulCoef(k: number, v: string): string {
  const signe = k < 0 ? "-" : "";
  const a = Math.abs(k);
  if (a === 1) return `${signe}${pourProduit(v)}`;
  return /^[0-9\\(]/.test(v) || v.startsWith("-") ? `${signe}${a}\\cdot ${pourProduit(v)}` : `${signe}${a}${v}`;
}

/** « +3 », « -2 », « » (constante ajoutée). */
export function constSigne(d: number): string {
  return d === 0 ? "" : d > 0 ? `+${d}` : `-${-d}`;
}

/** Coefficient devant ln (« », « - », « 2 »). */
export function coefLn(k: number): string {
  return k === 1 ? "" : k === -1 ? "-" : `${k}`;
}

/** Terme k·v ajouté (« +2x », « -x », « »). */
function termeAjoute(k: number, v: string): string {
  if (k === 0) return "";
  const s = mulCoef(k, v);
  return s.startsWith("-") ? s : `+${s}`;
}

/** b x + c (« 3x-1 », « 2-x », « x+4 »). */
export function affine(b: number, c: number, v: string): string {
  const bx = b === 1 ? v : b === -1 ? `-${v}` : `${b}${v}`;
  if (b < 0 && c > 0) return `${c}${bx}`;
  return `${bx}${constSigne(c)}`;
}

/** b·v + c avec une valeur numérique v, non calculée (« 3\cdot 2-1 », « 2-(-1) »). */
function affineDe(b: number, c: number, v: string): string {
  if (/^[a-z]$/.test(v)) return affine(b, c, v);
  const produit = b === 1 ? v : b === -1 ? `-${pourProduit(v)}` : `${b}\\cdot ${pourProduit(v)}`;
  if (b < 0 && c > 0) return `${c}${produit}`;
  return `${produit}${constSigne(c)}`;
}

const REGLE_CHAINE = { texte: "Règle de la chaîne :", latex: "(\\ln(u(x)))'=\\dfrac{u'(x)}{u(x)}" };

// ============================================================================
// k·ln(bx + c) + d.
// ============================================================================

export function fonctionLnAffine(k: number, b: number, c: number, d: number): FonctionTangente {
  const borne = -c / b;
  const kb = k * b;
  const fraction = (den: string) => `${kb < 0 ? "-" : ""}\\dfrac{${Math.abs(kb)}}{${den}}`;
  const offsets = [0.3, 0.8, 1.5, 2.4, 3.6];
  return {
    famille: "lnAffine",
    fLatex: `${coefLn(k)}\\ln(${affine(b, c, "x")})${constSigne(d)}`,
    fDe: (v) => `${coefLn(k)}\\ln\\left(${affineDe(b, c, v)}\\right)${constSigne(d)}`,
    dfLatex: fraction(affine(b, c, "x")),
    dfDe: (v) => fraction(affineDe(b, c, v)),
    fn: (x) => k * Math.log(b * x + c) + d,
    dfn: (x) => kb / (b * x + c),
    domaineLatex: b > 0 ? `\\left]${latexRationnel(-c, b)}\\,;+\\infty\\right[` : `\\left]-\\infty\\,;${latexRationnel(-c, b)}\\right[`,
    borneGauche: b > 0 ? borne : null,
    borneDroite: b > 0 ? null : borne,
    pointsTest: offsets.map((o) => (b > 0 ? borne + o : borne - o)),
    regle: REGLE_CHAINE,
    detail: { texte: "Ici, l'argument du logarithme et sa dérivée valent :", latex: `u(x)=${affine(b, c, "x")},\\qquad u'(x)=${b}` },
    ...(b !== 1 ? { oubliChaine: (x: number) => k / (b * x + c) } : {}),
  };
}

// ============================================================================
// log_b(x).
// ============================================================================

export function logLatex(base: number, v: string): string {
  return base === 10 ? `\\log${arg(v)}` : `\\log_{${base}}${arg(v)}`;
}

export function fonctionLogBase(base: number): FonctionTangente {
  return {
    famille: "logBase",
    fLatex: logLatex(base, "x"),
    fDe: (v) => logLatex(base, v),
    dfLatex: `\\dfrac{1}{x\\ln(${base})}`,
    dfDe: (v) => `\\dfrac{1}{${pourProduit(v)}\\ln(${base})}`,
    fn: (x) => Math.log(x) / Math.log(base),
    dfn: (x) => 1 / (x * Math.log(base)),
    domaineLatex: "\\left]0\\,;+\\infty\\right[",
    borneGauche: 0,
    borneDroite: null,
    pointsTest: POINTS_POSITIFS,
    regle: { texte: "Dérivée d'un logarithme de base a :", latex: "(\\log_a(x))'=\\dfrac{1}{x\\ln(a)}" },
    detail: { texte: "Ou, en revenant à ln par changement de base :", latex: `${logLatex(base, "x")}=\\dfrac{\\ln(x)}{\\ln(${base})}` },
  };
}

// ============================================================================
// x·ln(x) + c·x.
// ============================================================================

export function fonctionXLnX(c: number): FonctionTangente {
  return {
    famille: "xlnx",
    fLatex: `x\\ln(x)${termeAjoute(c, "x")}`,
    fDe: (v) => `${pourProduit(v)}\\ln${arg(v)}${termeAjoute(c, v)}`,
    dfLatex: `\\ln(x)${constSigne(1 + c)}`,
    dfDe: (v) => `\\ln${arg(v)}${constSigne(1 + c)}`,
    fn: (x) => x * Math.log(x) + c * x,
    dfn: (x) => Math.log(x) + 1 + c,
    domaineLatex: "\\left]0\\,;+\\infty\\right[",
    borneGauche: 0,
    borneDroite: null,
    pointsTest: POINTS_POSITIFS,
    regle: { texte: "Le terme x ln(x) est un produit ; règle du produit :", latex: "(uv)'=u'v+uv'" },
    detail: { texte: "Dérivées des deux facteurs :", latex: "(x)'=1,\\qquad(\\ln(x))'=\\dfrac{1}{x}" },
  };
}

// ============================================================================
// k·ln(x)/x + d.
// ============================================================================

export function fonctionLnSurX(k: number, d: number): FonctionTangente {
  const k1 = k === 1 ? "" : `${k}`;
  return {
    famille: "lnSurX",
    fLatex: `\\dfrac{${k1}\\ln(x)}{x}${constSigne(d)}`,
    fDe: (v) => `\\dfrac{${k1}\\ln${arg(v)}}{${v}}${constSigne(d)}`,
    dfLatex: `\\dfrac{${k}-${k1}\\ln(x)}{x^{2}}`,
    dfDe: (v) => `\\dfrac{${k}-${k1}\\ln${arg(v)}}{${pourPuissance(v)}^{2}}`,
    fn: (x) => (k * Math.log(x)) / x + d,
    dfn: (x) => (k * (1 - Math.log(x))) / (x * x),
    domaineLatex: "\\left]0\\,;+\\infty\\right[",
    borneGauche: 0,
    borneDroite: null,
    pointsTest: POINTS_POSITIFS,
    regle: { texte: "Règle du quotient :", latex: "\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^{2}}" },
    detail: { texte: "Dérivées du numérateur et du dénominateur :", latex: `(${k1}\\ln(x))'=\\dfrac{${k}}{x},\\qquad(x)'=1` },
  };
}

// ============================================================================
// k·ln(x² + q).
// ============================================================================

export function fonctionLnQuad(k: number, q: number): FonctionTangente {
  const deuxK = 2 * k;
  const fraction = (num: string, den: string) => `${deuxK < 0 ? "-" : ""}\\dfrac{${num}}{${den}}`;
  return {
    famille: "lnQuad",
    fLatex: `${coefLn(k)}\\ln(x^{2}+${q})`,
    fDe: (v) => `${coefLn(k)}\\ln\\left(${pourPuissance(v)}^{2}+${q}\\right)`,
    dfLatex: fraction(`${Math.abs(deuxK)}x`, `x^{2}+${q}`),
    dfDe: (v) => fraction(`${Math.abs(deuxK)}\\cdot ${pourProduit(v)}`, `${pourPuissance(v)}^{2}+${q}`),
    fn: (x) => k * Math.log(x * x + q),
    dfn: (x) => (deuxK * x) / (x * x + q),
    domaineLatex: "\\mathbb{R}",
    borneGauche: null,
    borneDroite: null,
    pointsTest: POINTS_REELS,
    regle: REGLE_CHAINE,
    detail: { texte: "Ici, l'argument du logarithme et sa dérivée valent :", latex: `u(x)=x^{2}+${q},\\qquad u'(x)=2x` },
    oubliChaine: (x) => k / (x * x + q),
  };
}

// ============================================================================
// x²/2 + b·x + c·ln(x).
// ============================================================================

export function fonctionPolyLn(b: number, c: number): FonctionTangente {
  const lnTerme = (v: string) => `${c > 0 ? "+" : "-"}${Math.abs(c) === 1 ? "" : Math.abs(c)}\\ln${arg(v)}`;
  const fracTerme = (v: string) => `${c > 0 ? "+" : "-"}\\dfrac{${Math.abs(c)}}{${v}}`;
  return {
    famille: "polyLn",
    fLatex: `\\dfrac{x^{2}}{2}${termeAjoute(b, "x")}${lnTerme("x")}`,
    fDe: (v) => `\\dfrac{${pourPuissance(v)}^{2}}{2}${termeAjoute(b, v)}${lnTerme(v)}`,
    dfLatex: `x${constSigne(b)}${fracTerme("x")}`,
    dfDe: (v) => `${v}${constSigne(b)}${fracTerme(v)}`,
    fn: (x) => (x * x) / 2 + b * x + c * Math.log(x),
    dfn: (x) => x + b + c / x,
    domaineLatex: "\\left]0\\,;+\\infty\\right[",
    borneGauche: 0,
    borneDroite: null,
    pointsTest: POINTS_POSITIFS,
    regle: { texte: "Dérive terme à terme ; rappel :", latex: "(\\ln(x))'=\\dfrac{1}{x}" },
    detail: { texte: "Dérivée du premier terme :", latex: "\\left(\\dfrac{x^{2}}{2}\\right)'=x" },
  };
}

// ============================================================================
// k·ln(x) + c/x.
// ============================================================================

export function fonctionLnInverse(k: number, c: number): FonctionTangente {
  const fraction = (v: string) => `${c > 0 ? "+" : "-"}\\dfrac{${Math.abs(c)}}{${v}}`;
  return {
    famille: "lnInverse",
    fLatex: `${coefLn(k)}\\ln(x)${fraction("x")}`,
    fDe: (v) => `${coefLn(k)}\\ln${arg(v)}${fraction(v)}`,
    dfLatex: `\\dfrac{${affine(k, -c, "x")}}{x^{2}}`,
    dfDe: (v) => `\\dfrac{${affineDe(k, -c, v)}}{${pourPuissance(v)}^{2}}`,
    fn: (x) => k * Math.log(x) + c / x,
    dfn: (x) => k / x - c / (x * x),
    domaineLatex: "\\left]0\\,;+\\infty\\right[",
    borneGauche: 0,
    borneDroite: null,
    pointsTest: POINTS_POSITIFS,
    regle: { texte: "Dérive terme à terme ; rappels :", latex: "(\\ln(x))'=\\dfrac{1}{x},\\qquad\\left(\\dfrac{1}{x}\\right)'=-\\dfrac{1}{x^{2}}" },
    detail: { texte: "Pour résoudre ensuite une équation, mets le résultat au même dénominateur :", latex: "\\dfrac{u}{x}-\\dfrac{v}{x^{2}}=\\dfrac{ux-v}{x^{2}}" },
  };
}

// ============================================================================
// k·ln(x) + d.
// ============================================================================

export function fonctionLnSimple(k: number, d: number): FonctionTangente {
  const fraction = (den: string) => `${k < 0 ? "-" : ""}\\dfrac{${Math.abs(k)}}{${den}}`;
  return {
    famille: "lnSimple",
    fLatex: `${coefLn(k)}\\ln(x)${constSigne(d)}`,
    fDe: (v) => `${coefLn(k)}\\ln${arg(v)}${constSigne(d)}`,
    dfLatex: fraction("x"),
    dfDe: (v) => fraction(v),
    fn: (x) => k * Math.log(x) + d,
    dfn: (x) => k / x,
    domaineLatex: "\\left]0\\,;+\\infty\\right[",
    borneGauche: 0,
    borneDroite: null,
    pointsTest: POINTS_POSITIFS,
    regle: { texte: "Dérivée du logarithme népérien :", latex: "(\\ln(x))'=\\dfrac{1}{x}" },
    detail: { texte: "Une constante multiplicative se conserve, une constante ajoutée disparaît :", latex: "(k\\ln(x)+d)'=k\\cdot\\dfrac{1}{x}" },
  };
}
