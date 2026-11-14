import type { FragmentJustification, NombreExact, TableauVariations, TexteAvecLatex } from "../../core6e/encadrerIntegrales.types";

/**
 * Couche A (6e) — données de `6gen79` « Comparer et encadrer des intégrales ». Tout est écrit à la
 * main (écritures exactes, justifications) ; les valeurs numériques sont
 * recoupées avec `fn` par le collecteur (aucune valeur exacte n'est recalculée à l'exécution).
 */

export const N = (latex: string, texte: string, valeur: number): NombreExact => ({ latex, texte, valeur });
const t = (valeur: string): FragmentJustification => ({ type: "texte", valeur });
const l = (valeur: string): FragmentJustification => ({ type: "latex", valeur });

/** Intervalle fermé [p ; q] en LaTeX. */
export function intervalleLatex(p: NombreExact, q: NombreExact): string {
  return `[${p.latex}\\,;\\,${q.latex}]`;
}

// Nombres usuels.
const ENT = (k: number): NombreExact => N(k < 0 ? `-${-k}` : `${k}`, k < 0 ? `−${-k}` : `${k}`, k);
const FR = (num: number, den: number): NombreExact => {
  const neg = num < 0;
  const a = Math.abs(num);
  return N(`${neg ? "-" : ""}\\dfrac{${a}}{${den}}`, `${neg ? "−" : ""}${a}/${den}`, num / den);
};
const PI = Math.PI;
const PIF = (num: number, den: number): NombreExact => {
  const neg = num < 0;
  const a = Math.abs(num);
  const haut = a === 1 ? "\\pi" : `${a}\\pi`;
  const latex = den === 1 ? haut : `\\dfrac{${haut}}{${den}}`;
  const texte = `${a === 1 ? "π" : `${a}π`}${den === 1 ? "" : `/${den}`}`;
  return N(`${neg ? "-" : ""}${latex}`, `${neg ? "−" : ""}${texte}`, (num * PI) / den);
};

// ============================================================================
// Variante « signe » — f de signe constant sur [p ; q].
// ============================================================================

export interface FonctionSigne {
  id: string;
  latex: string;
  fn: (x: number) => number;
  positif: [NombreExact, NombreExact][];
  negatif: [NombreExact, NombreExact][];
  aide1: TexteAvecLatex;
  aide2: TexteAvecLatex;
  justification: (signe: "positif" | "negatif", p: NombreExact, q: NombreExact) => FragmentJustification[];
}

const pos = (s: "positif" | "negatif") => s === "positif";

export const FONCTIONS_SIGNE: FonctionSigne[] = [
  {
    id: "ln",
    latex: "\\ln(x)",
    fn: Math.log,
    positif: [
      [ENT(2), ENT(5)],
      [ENT(3), ENT(8)],
    ],
    negatif: [
      [FR(1, 4), FR(1, 2)],
      [FR(1, 3), ENT(1)],
    ],
    aide1: { texte: "La fonction ln est croissante sur ]0 ; +∞[ et elle s'annule en 1 :", latex: "\\ln(1)=0" },
    aide2: { texte: "Compare les nombres de l'intervalle au nombre 1." },
    justification: (s, p, q) => [
      t("Pour tout x de "),
      l(intervalleLatex(p, q)),
      t(", "),
      l(pos(s) ? "x\\ge 1" : "0<x\\le 1"),
      t(" ; ln est croissante, donc "),
      l(pos(s) ? "\\ln(x)\\ge\\ln(1)=0" : "\\ln(x)\\le\\ln(1)=0"),
      t("."),
    ],
  },
  {
    id: "expMoins1",
    latex: "e^{x}-1",
    fn: (x) => Math.exp(x) - 1,
    positif: [
      [ENT(1), ENT(3)],
      [ENT(0), ENT(2)],
    ],
    negatif: [
      [ENT(-2), ENT(0)],
      [ENT(-3), ENT(-1)],
    ],
    aide1: { texte: "La fonction exponentielle est croissante sur ℝ et :", latex: "e^{0}=1" },
    aide2: { texte: "Compare les nombres de l'intervalle au nombre 0." },
    justification: (s, p, q) => [
      t("Pour tout x de "),
      l(intervalleLatex(p, q)),
      t(", "),
      l(pos(s) ? "x\\ge 0" : "x\\le 0"),
      t(" ; l'exponentielle est croissante, donc "),
      l(pos(s) ? "e^{x}\\ge e^{0}=1" : "e^{x}\\le e^{0}=1"),
      t(", c'est-à-dire "),
      l(pos(s) ? "e^{x}-1\\ge 0" : "e^{x}-1\\le 0"),
      t("."),
    ],
  },
  {
    id: "carreMoins4",
    latex: "x^{2}-4",
    fn: (x) => x * x - 4,
    positif: [
      [ENT(3), ENT(5)],
      [ENT(-5), ENT(-3)],
    ],
    negatif: [
      [ENT(-1), ENT(1)],
      [ENT(0), ENT(2)],
    ],
    aide1: { texte: "Factorise l'expression :", latex: "x^{2}-4=(x-2)(x+2)" },
    aide2: { texte: "Un trinôme a le signe de son coefficient de x² à l'extérieur de ses racines, et le signe contraire entre ses racines." },
    justification: (s, p, q) => [
      t("On factorise "),
      l("x^{2}-4=(x-2)(x+2)"),
      t(" : les racines sont −2 et 2. L'intervalle "),
      l(intervalleLatex(p, q)),
      t(pos(s) ? " est à l'extérieur des racines, où le trinôme a le signe de son coefficient 1 : " : " est compris entre les racines, où le trinôme a le signe contraire de son coefficient 1 : "),
      l(pos(s) ? "x^{2}-4\\ge 0" : "x^{2}-4\\le 0"),
      t("."),
    ],
  },
  {
    id: "cos",
    latex: "\\cos(x)",
    fn: Math.cos,
    positif: [
      [ENT(0), PIF(1, 2)],
      [PIF(-1, 3), PIF(1, 3)],
    ],
    negatif: [
      [PIF(1, 2), PIF(1, 1)],
      [PIF(2, 3), PIF(4, 3)],
    ],
    aide1: { texte: "Sur le cercle trigonométrique, cos(x) est l'abscisse du point associé au réel x." },
    aide2: { texte: "Repère les réels où le cosinus s'annule :", latex: "\\cos\\left(\\dfrac{\\pi}{2}\\right)=\\cos\\left(\\dfrac{3\\pi}{2}\\right)=0" },
    justification: (s, p, q) => [
      t("Les points du cercle trigonométrique associés aux réels de "),
      l(intervalleLatex(p, q)),
      t(pos(s) ? " sont dans la moitié droite du cercle, où l'abscisse est positive : " : " sont dans la moitié gauche du cercle, où l'abscisse est négative : "),
      l(pos(s) ? "\\cos(x)\\ge 0" : "\\cos(x)\\le 0"),
      t("."),
    ],
  },
  {
    id: "cubeMoinsX",
    latex: "x^{3}-x",
    fn: (x) => x * x * x - x,
    positif: [
      [ENT(2), ENT(4)],
      [ENT(-1), ENT(0)],
    ],
    negatif: [
      [ENT(0), ENT(1)],
      [ENT(-4), ENT(-2)],
    ],
    aide1: { texte: "Factorise l'expression :", latex: "x^{3}-x=x(x-1)(x+1)" },
    aide2: { texte: "Dresse le tableau de signes des trois facteurs ; ils s'annulent en :", latex: "x\\in\\{-1\\,;\\,0\\,;\\,1\\}" },
    justification: (s, p, q) => [
      t("On factorise "),
      l("x^{3}-x=x(x-1)(x+1)"),
      t(" ; le tableau de signes montre que ce produit est positif sur "),
      l("[-1\\,;\\,0]"),
      t(" et sur "),
      l("[1\\,;+\\infty\\mathclose{[}"),
      t(", négatif sur "),
      l("\\mathopen{]}-\\infty\\,;-1]"),
      t(" et sur "),
      l("[0\\,;\\,1]"),
      t(". Or "),
      l(intervalleLatex(p, q)),
      t(pos(s) ? " est inclus dans un intervalle où il est positif : " : " est inclus dans un intervalle où il est négatif : "),
      l(pos(s) ? "x^{3}-x\\ge 0" : "x^{3}-x\\le 0"),
      t("."),
    ],
  },
  {
    id: "unMoinsInverse",
    latex: "1-\\dfrac{1}{x}",
    fn: (x) => 1 - 1 / x,
    positif: [
      [ENT(2), ENT(6)],
      [ENT(1), ENT(4)],
    ],
    negatif: [
      [FR(1, 4), ENT(1)],
      [FR(1, 3), FR(1, 2)],
    ],
    aide1: { texte: "Réduis au même dénominateur :", latex: "1-\\dfrac{1}{x}=\\dfrac{x-1}{x}" },
    aide2: { texte: "Sur l'intervalle, x est strictement positif : le quotient a le signe de son numérateur." },
    justification: (s, p, q) => [
      t("On écrit "),
      l("1-\\dfrac{1}{x}=\\dfrac{x-1}{x}"),
      t(" ; sur "),
      l(intervalleLatex(p, q)),
      t(", "),
      l("x>0"),
      t(" et "),
      l(pos(s) ? "x-1\\ge 0" : "x-1\\le 0"),
      t(", donc "),
      l(pos(s) ? "1-\\dfrac{1}{x}\\ge 0" : "1-\\dfrac{1}{x}\\le 0"),
      t("."),
    ],
  },
  {
    id: "lnMoins1",
    latex: "\\ln(x)-1",
    fn: (x) => Math.log(x) - 1,
    positif: [
      [ENT(3), ENT(7)],
      [ENT(4), ENT(9)],
    ],
    negatif: [
      [ENT(1), ENT(2)],
      [FR(1, 2), ENT(2)],
    ],
    aide1: { texte: "La fonction ln est croissante et :", latex: "\\ln(e)=1" },
    aide2: { texte: "Compare les nombres de l'intervalle au nombre e :", latex: "e\\approx 2{,}718" },
    justification: (s, p, q) =>
      pos(s)
        ? [t("Pour tout x de "), l(intervalleLatex(p, q)), t(", "), l(`x\\ge ${p.latex}>e`), t(" ; ln est croissante, donc "), l(`\\ln(x)\\ge\\ln(${p.latex})>\\ln(e)=1`), t(" et "), l("\\ln(x)-1\\ge 0"), t(".")]
        : [t("Pour tout x de "), l(intervalleLatex(p, q)), t(", "), l(`0<x\\le ${q.latex}<e`), t(" ; ln est croissante, donc "), l(`\\ln(x)\\le\\ln(${q.latex})<\\ln(e)=1`), t(" et "), l("\\ln(x)-1\\le 0"), t(".")],
  },
  {
    id: "racineMoins2",
    latex: "\\sqrt{x}-2",
    fn: (x) => Math.sqrt(x) - 2,
    positif: [
      [ENT(5), ENT(9)],
      [ENT(4), ENT(16)],
    ],
    negatif: [
      [ENT(0), ENT(4)],
      [ENT(1), ENT(3)],
    ],
    aide1: { texte: "La fonction racine carrée est croissante sur [0 ; +∞[ et :", latex: "\\sqrt{4}=2" },
    aide2: { texte: "Compare les nombres de l'intervalle au nombre 4." },
    justification: (s, p, q) => [
      t("Pour tout x de "),
      l(intervalleLatex(p, q)),
      t(", "),
      l(pos(s) ? "x\\ge 4" : "0\\le x\\le 4"),
      t(" ; la racine carrée est croissante, donc "),
      l(pos(s) ? "\\sqrt{x}\\ge\\sqrt{4}=2" : "\\sqrt{x}\\le\\sqrt{4}=2"),
      t(" et "),
      l(pos(s) ? "\\sqrt{x}-2\\ge 0" : "\\sqrt{x}-2\\le 0"),
      t("."),
    ],
  },
  {
    id: "xExpMoinsX",
    latex: "x\\,e^{-x}",
    fn: (x) => x * Math.exp(-x),
    positif: [
      [ENT(1), ENT(4)],
      [ENT(0), ENT(2)],
    ],
    negatif: [
      [ENT(-3), ENT(-1)],
      [ENT(-2), ENT(0)],
    ],
    aide1: { texte: "Une exponentielle est toujours strictement positive :", latex: "e^{-x}>0" },
    aide2: { texte: "Le produit a donc le signe de son premier facteur." },
    justification: (s, p, q) => [
      t("Pour tout réel x, "),
      l("e^{-x}>0"),
      t(" : "),
      l("x\\,e^{-x}"),
      t(` a le signe de x, ${pos(s) ? "positif" : "négatif"} sur `),
      l(intervalleLatex(p, q)),
      t("."),
    ],
  },
  {
    id: "sin",
    latex: "\\sin(x)",
    fn: Math.sin,
    positif: [
      [ENT(0), PIF(1, 1)],
      [PIF(1, 6), PIF(5, 6)],
    ],
    negatif: [
      [PIF(1, 1), PIF(2, 1)],
      [PIF(-1, 1), ENT(0)],
    ],
    aide1: { texte: "Sur le cercle trigonométrique, sin(x) est l'ordonnée du point associé au réel x." },
    aide2: { texte: "Repère les réels où le sinus s'annule :", latex: "\\sin(-\\pi)=\\sin(0)=\\sin(\\pi)=\\sin(2\\pi)=0" },
    justification: (s, p, q) => [
      t("Les points du cercle trigonométrique associés aux réels de "),
      l(intervalleLatex(p, q)),
      t(pos(s) ? " sont dans la moitié supérieure du cercle, où l'ordonnée est positive : " : " sont dans la moitié inférieure du cercle, où l'ordonnée est négative : "),
      l(pos(s) ? "\\sin(x)\\ge 0" : "\\sin(x)\\le 0"),
      t("."),
    ],
  },
  {
    id: "quotient",
    latex: "\\dfrac{x-3}{x+1}",
    fn: (x) => (x - 3) / (x + 1),
    positif: [
      [ENT(4), ENT(8)],
      [ENT(3), ENT(6)],
    ],
    negatif: [
      [ENT(0), ENT(2)],
      [ENT(0), ENT(3)],
    ],
    aide1: { texte: "Étudie séparément le signe du numérateur et celui du dénominateur." },
    aide2: { texte: "Le numérateur et le dénominateur s'annulent respectivement en :", latex: "x=3\\qquad x=-1" },
    justification: (s, p, q) => [
      t("Sur "),
      l(intervalleLatex(p, q)),
      t(", "),
      l("x+1>0"),
      t(" et "),
      l(pos(s) ? "x-3\\ge 0" : "x-3\\le 0"),
      t(` : le quotient est ${pos(s) ? "positif" : "négatif"}.`),
    ],
  },
];

// ============================================================================
// Variante « comparer » — paires (P, Q) ; signe de P − Q sur chaque intervalle.
// ============================================================================

export type SigneDifference = "pos" | "neg" | "change";

export interface IntervalleComparaison {
  p: NombreExact;
  q: NombreExact;
  signe: SigneDifference;
  /** Changement de signe : le zéro de P − Q strictement à l'intérieur (LaTeX). */
  zero?: string;
}

export interface PaireComparaison {
  id: string;
  pLatex: string;
  qLatex: string;
  pn: (x: number) => number;
  qn: (x: number) => number;
  type: "facteurs" | "etude";
  /** `facteurs` : P − Q et Q − P factorisés ; `etude` : h et h' pour h = P − Q (resp. Q − P). */
  differencePQ: string;
  differenceQP: string;
  /** `facteurs` : zéros de la différence ; `etude` : point où calculer h. */
  aide2PQ: TexteAvecLatex;
  aide2QP: TexteAvecLatex;
  /** `etude` : inégalité générale établie (en termes de P et Q). */
  etude?: FragmentJustification[];
  intervalles: IntervalleComparaison[];
}

const I = (p: NombreExact, q: NombreExact, signe: SigneDifference, zero?: string): IntervalleComparaison => ({ p, q, signe, ...(zero ? { zero } : {}) });

function aideZeros(latex: string): TexteAvecLatex {
  return { texte: "La différence ne s'annule qu'en ces valeurs ; si l'une d'elles est strictement à l'intérieur de l'intervalle, la différence peut y changer de signe :", latex };
}

export const PAIRES_COMPARAISON: PaireComparaison[] = [
  {
    id: "carreCube",
    pLatex: "x^{2}",
    qLatex: "x^{3}",
    pn: (x) => x * x,
    qn: (x) => x * x * x,
    type: "facteurs",
    differencePQ: "x^{2}-x^{3}=x^{2}(1-x)",
    differenceQP: "x^{3}-x^{2}=x^{2}(x-1)",
    aide2PQ: aideZeros("x\\in\\{0\\,;\\,1\\}"),
    aide2QP: aideZeros("x\\in\\{0\\,;\\,1\\}"),
    intervalles: [I(ENT(0), ENT(1), "pos"), I(ENT(-1), ENT(0), "pos"), I(ENT(1), ENT(2), "neg"), I(ENT(2), ENT(3), "neg"), I(ENT(0), ENT(2), "change", "1"), I(FR(1, 2), FR(3, 2), "change", "1")],
  },
  {
    id: "xCarre",
    pLatex: "x",
    qLatex: "x^{2}",
    pn: (x) => x,
    qn: (x) => x * x,
    type: "facteurs",
    differencePQ: "x-x^{2}=x(1-x)",
    differenceQP: "x^{2}-x=x(x-1)",
    aide2PQ: aideZeros("x\\in\\{0\\,;\\,1\\}"),
    aide2QP: aideZeros("x\\in\\{0\\,;\\,1\\}"),
    intervalles: [I(ENT(0), ENT(1), "pos"), I(ENT(1), ENT(3), "neg"), I(ENT(-2), ENT(0), "neg"), I(ENT(0), ENT(2), "change", "1"), I(ENT(-1), ENT(1), "change", "0")],
  },
  {
    id: "racineX",
    pLatex: "\\sqrt{x}",
    qLatex: "x",
    pn: Math.sqrt,
    qn: (x) => x,
    type: "facteurs",
    differencePQ: "\\sqrt{x}-x=\\sqrt{x}\\,(1-\\sqrt{x})",
    differenceQP: "x-\\sqrt{x}=\\sqrt{x}\\,(\\sqrt{x}-1)",
    aide2PQ: aideZeros("x\\in\\{0\\,;\\,1\\}"),
    aide2QP: aideZeros("x\\in\\{0\\,;\\,1\\}"),
    intervalles: [I(ENT(0), ENT(1), "pos"), I(FR(1, 4), ENT(1), "pos"), I(ENT(1), ENT(4), "neg"), I(ENT(4), ENT(9), "neg"), I(ENT(0), ENT(4), "change", "1"), I(FR(1, 4), ENT(4), "change", "1")],
  },
  {
    id: "expTangente",
    pLatex: "e^{x}",
    qLatex: "1+x",
    pn: Math.exp,
    qn: (x) => 1 + x,
    type: "etude",
    differencePQ: "h(x)=e^{x}-1-x\\qquad h'(x)=e^{x}-1",
    differenceQP: "h(x)=1+x-e^{x}\\qquad h'(x)=1-e^{x}",
    aide2PQ: { texte: "h′ ne s'annule qu'en 0 : dresse le tableau de variations de h, puis calcule :", latex: "h(0)" },
    aide2QP: { texte: "h′ ne s'annule qu'en 0 : dresse le tableau de variations de h, puis calcule :", latex: "h(0)" },
    etude: [
      t("Avec "),
      l("h(x)=e^{x}-1-x"),
      t(", "),
      l("h'(x)=e^{x}-1"),
      t(" est négative sur "),
      l("\\mathopen{]}-\\infty\\,;\\,0]"),
      t(" et positive sur "),
      l("[0\\,;+\\infty\\mathclose{[}"),
      t(" : h admet en 0 un minimum "),
      l("h(0)=0"),
      t(", donc "),
      l("e^{x}\\ge 1+x"),
      t(" pour tout réel x."),
    ],
    intervalles: [I(ENT(0), ENT(1), "pos"), I(ENT(-1), ENT(0), "pos"), I(ENT(0), ENT(2), "pos"), I(ENT(-2), ENT(1), "pos")],
  },
  {
    id: "lnTangente",
    pLatex: "\\ln(x)",
    qLatex: "x-1",
    pn: Math.log,
    qn: (x) => x - 1,
    type: "etude",
    differencePQ: "h(x)=\\ln(x)-x+1\\qquad h'(x)=\\dfrac{1}{x}-1",
    differenceQP: "h(x)=x-1-\\ln(x)\\qquad h'(x)=1-\\dfrac{1}{x}",
    aide2PQ: { texte: "h′ ne s'annule qu'en 1 : dresse le tableau de variations de h sur ]0 ; +∞[, puis calcule :", latex: "h(1)" },
    aide2QP: { texte: "h′ ne s'annule qu'en 1 : dresse le tableau de variations de h sur ]0 ; +∞[, puis calcule :", latex: "h(1)" },
    etude: [
      t("Avec "),
      l("h(x)=\\ln(x)-x+1"),
      t(", "),
      l("h'(x)=\\dfrac{1}{x}-1=\\dfrac{1-x}{x}"),
      t(" est positive sur "),
      l("\\mathopen{]}0\\,;\\,1]"),
      t(" et négative sur "),
      l("[1\\,;+\\infty\\mathclose{[}"),
      t(" : h admet en 1 un maximum "),
      l("h(1)=0"),
      t(", donc "),
      l("\\ln(x)\\le x-1"),
      t(" pour tout x > 0."),
    ],
    intervalles: [I(ENT(1), ENT(2), "neg"), I(FR(1, 2), ENT(3), "neg"), I(ENT(2), ENT(4), "neg")],
  },
  {
    id: "sinX",
    pLatex: "\\sin(x)",
    qLatex: "x",
    pn: Math.sin,
    qn: (x) => x,
    type: "etude",
    differencePQ: "h(x)=\\sin(x)-x\\qquad h'(x)=\\cos(x)-1",
    differenceQP: "h(x)=x-\\sin(x)\\qquad h'(x)=1-\\cos(x)",
    aide2PQ: { texte: "h′ garde un signe constant sur ℝ ; calcule :", latex: "h(0)" },
    aide2QP: { texte: "h′ garde un signe constant sur ℝ ; calcule :", latex: "h(0)" },
    etude: [
      t("Avec "),
      l("h(x)=\\sin(x)-x"),
      t(", "),
      l("h'(x)=\\cos(x)-1\\le 0"),
      t(" : h est décroissante sur ℝ et "),
      l("h(0)=0"),
      t(", donc "),
      l("\\sin(x)\\ge x"),
      t(" pour x ≤ 0 et "),
      l("\\sin(x)\\le x"),
      t(" pour x ≥ 0."),
    ],
    intervalles: [I(ENT(0), ENT(1), "neg"), I(ENT(0), PIF(1, 1), "neg"), I(ENT(-1), ENT(0), "pos"), I(PIF(-1, 1), ENT(0), "pos"), I(ENT(-1), ENT(1), "change", "0"), I(PIF(-1, 2), PIF(1, 2), "change", "0")],
  },
  {
    id: "inverses",
    pLatex: "\\dfrac{1}{x}",
    qLatex: "\\dfrac{1}{x^{2}}",
    pn: (x) => 1 / x,
    qn: (x) => 1 / (x * x),
    type: "facteurs",
    differencePQ: "\\dfrac{1}{x}-\\dfrac{1}{x^{2}}=\\dfrac{x-1}{x^{2}}",
    differenceQP: "\\dfrac{1}{x^{2}}-\\dfrac{1}{x}=\\dfrac{1-x}{x^{2}}",
    aide2PQ: aideZeros("x=1"),
    aide2QP: aideZeros("x=1"),
    intervalles: [I(ENT(1), ENT(2), "pos"), I(ENT(2), ENT(5), "pos"), I(FR(1, 2), ENT(1), "neg"), I(FR(1, 4), FR(1, 2), "neg"), I(FR(1, 2), ENT(2), "change", "1"), I(FR(1, 3), ENT(3), "change", "1")],
  },
  {
    id: "exp2x",
    pLatex: "e^{2x}",
    qLatex: "e^{x}",
    pn: (x) => Math.exp(2 * x),
    qn: Math.exp,
    type: "facteurs",
    differencePQ: "e^{2x}-e^{x}=e^{x}\\left(e^{x}-1\\right)",
    differenceQP: "e^{x}-e^{2x}=e^{x}\\left(1-e^{x}\\right)",
    aide2PQ: aideZeros("x=0"),
    aide2QP: aideZeros("x=0"),
    intervalles: [I(ENT(0), ENT(1), "pos"), I(ENT(1), ENT(2), "pos"), I(ENT(-1), ENT(0), "neg"), I(ENT(-2), ENT(-1), "neg"), I(ENT(-1), ENT(1), "change", "0"), I(ENT(-2), ENT(1), "change", "0")],
  },
  {
    id: "lnUnPlusX",
    pLatex: "\\ln(1+x)",
    qLatex: "x",
    pn: (x) => Math.log(1 + x),
    qn: (x) => x,
    type: "etude",
    differencePQ: "h(x)=\\ln(1+x)-x\\qquad h'(x)=\\dfrac{1}{1+x}-1=\\dfrac{-x}{1+x}",
    differenceQP: "h(x)=x-\\ln(1+x)\\qquad h'(x)=1-\\dfrac{1}{1+x}=\\dfrac{x}{1+x}",
    aide2PQ: { texte: "h′ ne s'annule qu'en 0 : dresse le tableau de variations de h sur ]−1 ; +∞[, puis calcule :", latex: "h(0)" },
    aide2QP: { texte: "h′ ne s'annule qu'en 0 : dresse le tableau de variations de h sur ]−1 ; +∞[, puis calcule :", latex: "h(0)" },
    etude: [
      t("Avec "),
      l("h(x)=\\ln(1+x)-x"),
      t(", "),
      l("h'(x)=\\dfrac{-x}{1+x}"),
      t(" est positive sur "),
      l("\\mathopen{]}-1\\,;\\,0]"),
      t(" et négative sur "),
      l("[0\\,;+\\infty\\mathclose{[}"),
      t(" : h admet en 0 un maximum "),
      l("h(0)=0"),
      t(", donc "),
      l("\\ln(1+x)\\le x"),
      t(" pour tout x > −1."),
    ],
    intervalles: [I(ENT(0), ENT(1), "neg"), I(ENT(0), ENT(3), "neg"), I(FR(-1, 2), ENT(0), "neg")],
  },
  {
    id: "cubeX",
    pLatex: "x^{3}",
    qLatex: "x",
    pn: (x) => x * x * x,
    qn: (x) => x,
    type: "facteurs",
    differencePQ: "x^{3}-x=x(x-1)(x+1)",
    differenceQP: "x-x^{3}=x(1-x)(1+x)",
    aide2PQ: aideZeros("x\\in\\{-1\\,;\\,0\\,;\\,1\\}"),
    aide2QP: aideZeros("x\\in\\{-1\\,;\\,0\\,;\\,1\\}"),
    intervalles: [I(ENT(1), ENT(2), "pos"), I(ENT(-1), ENT(0), "pos"), I(ENT(0), ENT(1), "neg"), I(ENT(-3), ENT(-1), "neg"), I(FR(-1, 2), FR(1, 2), "change", "0"), I(ENT(0), ENT(2), "change", "1")],
  },
  {
    id: "puissances32",
    pLatex: "3^{x}",
    qLatex: "2^{x}",
    pn: (x) => Math.pow(3, x),
    qn: (x) => Math.pow(2, x),
    type: "facteurs",
    differencePQ: "3^{x}-2^{x}=2^{x}\\left(\\left(\\dfrac{3}{2}\\right)^{x}-1\\right)",
    differenceQP: "2^{x}-3^{x}=2^{x}\\left(1-\\left(\\dfrac{3}{2}\\right)^{x}\\right)",
    aide2PQ: aideZeros("x=0"),
    aide2QP: aideZeros("x=0"),
    intervalles: [I(ENT(0), ENT(1), "pos"), I(ENT(0), ENT(2), "pos"), I(ENT(-1), ENT(0), "neg"), I(ENT(-2), ENT(0), "neg"), I(ENT(-1), ENT(1), "change", "0"), I(ENT(-2), ENT(1), "change", "0")],
  },
];

// ============================================================================
// Variantes « encadrer » et « moyenne ».
// ============================================================================

export interface FonctionEncadrement {
  id: string;
  structure: "monotone" | "variations";
  fLatex: string;
  fn: (x: number) => number;
  a: NombreExact;
  b: NombreExact;
  longueur: NombreExact;
  monotonie: "croissante" | "decroissante" | null;
  deriveeLatex: string;
  tableau: TableauVariations | null;
  m: NombreExact;
  M: NombreExact;
  borneInf: NombreExact;
  borneSup: NombreExact;
  calcul: "exacte" | "calculatrice";
}

const E = Math.E;

function monotone(
  id: string,
  fLatex: string,
  fn: (x: number) => number,
  a: NombreExact,
  b: NombreExact,
  longueur: NombreExact,
  monotonie: "croissante" | "decroissante",
  deriveeLatex: string,
  fa: NombreExact,
  fb: NombreExact,
  borneInf: NombreExact,
  borneSup: NombreExact,
  calcul: "exacte" | "calculatrice",
): FonctionEncadrement {
  const [m, M] = monotonie === "croissante" ? [fa, fb] : [fb, fa];
  return { id, structure: "monotone", fLatex, fn, a, b, longueur, monotonie, deriveeLatex, tableau: null, m, M, borneInf, borneSup, calcul };
}

function variations(
  id: string,
  fLatex: string,
  fn: (x: number) => number,
  longueur: NombreExact,
  deriveeLatex: string,
  tableau: TableauVariations,
  m: NombreExact,
  M: NombreExact,
  borneInf: NombreExact,
  borneSup: NombreExact,
  calcul: "exacte" | "calculatrice",
): FonctionEncadrement {
  const a = tableau.abscisses[0];
  const b = tableau.abscisses[tableau.abscisses.length - 1];
  return { id, structure: "variations", fLatex, fn, a, b, longueur, monotonie: null, deriveeLatex, tableau, m, M, borneInf, borneSup, calcul };
}

const UN_SUR_E = N("\\dfrac{1}{e}", "1/e", 1 / E);
const R5 = Math.sqrt(5);

export const FONCTIONS_ENCADREMENT: FonctionEncadrement[] = [
  // --- Monotones -----------------------------------------------------------------------------
  monotone("expCarre01", "e^{x^{2}}", (x) => Math.exp(x * x), ENT(0), ENT(1), ENT(1), "croissante", "f'(x)=2x\\,e^{x^{2}}", ENT(1), N("e", "e", E), ENT(1), N("e", "e", E), "calculatrice"),
  monotone("gauss01", "e^{-x^{2}}", (x) => Math.exp(-x * x), ENT(0), ENT(1), ENT(1), "decroissante", "f'(x)=-2x\\,e^{-x^{2}}", ENT(1), UN_SUR_E, UN_SUR_E, ENT(1), "calculatrice"),
  monotone("gauss02", "e^{-x^{2}}", (x) => Math.exp(-x * x), ENT(0), ENT(2), ENT(2), "decroissante", "f'(x)=-2x\\,e^{-x^{2}}", ENT(1), N("\\dfrac{1}{e^{4}}", "1/e⁴", Math.exp(-4)), N("\\dfrac{2}{e^{4}}", "2/e⁴", 2 * Math.exp(-4)), ENT(2), "calculatrice"),
  monotone("racineUnPlusCube", "\\sqrt{1+x^{3}}", (x) => Math.sqrt(1 + x ** 3), ENT(0), ENT(2), ENT(2), "croissante", "f'(x)=\\dfrac{3x^{2}}{2\\sqrt{1+x^{3}}}", ENT(1), ENT(3), ENT(2), ENT(6), "exacte"),
  monotone("racineUnPlusCarre", "\\sqrt{1+x^{2}}", (x) => Math.sqrt(1 + x * x), ENT(0), ENT(2), ENT(2), "croissante", "f'(x)=\\dfrac{x}{\\sqrt{1+x^{2}}}", ENT(1), N("\\sqrt{5}", "√5", R5), ENT(2), N("2\\sqrt{5}", "2√5", 2 * R5), "calculatrice"),
  monotone("inverseUnPlusCube", "\\dfrac{1}{1+x^{3}}", (x) => 1 / (1 + x ** 3), ENT(0), ENT(1), ENT(1), "decroissante", "f'(x)=-\\dfrac{3x^{2}}{\\left(1+x^{3}\\right)^{2}}", ENT(1), FR(1, 2), FR(1, 2), ENT(1), "exacte"),
  monotone("inverseUnPlusCarre13", "\\dfrac{1}{1+x^{2}}", (x) => 1 / (1 + x * x), ENT(1), ENT(3), ENT(2), "decroissante", "f'(x)=-\\dfrac{2x}{\\left(1+x^{2}\\right)^{2}}", FR(1, 2), FR(1, 10), FR(1, 5), ENT(1), "exacte"),
  monotone("lnUnPlusCarre", "\\ln\\left(1+x^{2}\\right)", (x) => Math.log(1 + x * x), ENT(0), ENT(2), ENT(2), "croissante", "f'(x)=\\dfrac{2x}{1+x^{2}}", ENT(0), N("\\ln(5)", "ln(5)", Math.log(5)), ENT(0), N("2\\ln(5)", "2 ln(5)", 2 * Math.log(5)), "calculatrice"),
  monotone("expRacine", "e^{\\sqrt{x}}", (x) => Math.exp(Math.sqrt(x)), ENT(0), ENT(4), ENT(4), "croissante", "f'(x)=\\dfrac{e^{\\sqrt{x}}}{2\\sqrt{x}}\\quad(x>0)", ENT(1), N("e^{2}", "e²", E * E), ENT(4), N("4e^{2}", "4e²", 4 * E * E), "calculatrice"),
  monotone("inverseUnPlusRacine", "\\dfrac{1}{1+\\sqrt{x}}", (x) => 1 / (1 + Math.sqrt(x)), ENT(0), ENT(4), ENT(4), "decroissante", "f'(x)=-\\dfrac{1}{2\\sqrt{x}\\left(1+\\sqrt{x}\\right)^{2}}\\quad(x>0)", ENT(1), FR(1, 3), FR(4, 3), ENT(4), "exacte"),
  monotone("racineQuartiquePlus9", "\\sqrt{x^{4}+9}", (x) => Math.sqrt(x ** 4 + 9), ENT(0), ENT(2), ENT(2), "croissante", "f'(x)=\\dfrac{2x^{3}}{\\sqrt{x^{4}+9}}", ENT(3), ENT(5), ENT(6), ENT(10), "exacte"),
  monotone("inverseRacineUnPlusCube", "\\dfrac{1}{\\sqrt{1+x^{3}}}", (x) => 1 / Math.sqrt(1 + x ** 3), ENT(0), ENT(2), ENT(2), "decroissante", "f'(x)=-\\dfrac{3x^{2}}{2\\left(1+x^{3}\\right)\\sqrt{1+x^{3}}}", ENT(1), FR(1, 3), FR(2, 3), ENT(2), "exacte"),
  monotone("expCube", "e^{x^{3}}", (x) => Math.exp(x ** 3), ENT(-1), ENT(0), ENT(1), "croissante", "f'(x)=3x^{2}e^{x^{3}}", UN_SUR_E, ENT(1), UN_SUR_E, ENT(1), "calculatrice"),
  monotone("carreExp", "x^{2}e^{x}", (x) => x * x * Math.exp(x), ENT(0), ENT(1), ENT(1), "croissante", "f'(x)=\\left(x^{2}+2x\\right)e^{x}", ENT(0), N("e", "e", E), ENT(0), N("e", "e", E), "calculatrice"),
  monotone("racineHuitMoinsCube", "\\sqrt{8-x^{3}}", (x) => Math.sqrt(8 - x ** 3), ENT(0), ENT(2), ENT(2), "decroissante", "f'(x)=-\\dfrac{3x^{2}}{2\\sqrt{8-x^{3}}}\\quad(x<2)", N("2\\sqrt{2}", "2√2", 2 * Math.SQRT2), ENT(0), ENT(0), N("4\\sqrt{2}", "4√2", 4 * Math.SQRT2), "calculatrice"),
  monotone("deuxPuissanceCarre", "2^{x^{2}}", (x) => Math.pow(2, x * x), ENT(0), ENT(1), ENT(1), "croissante", "f'(x)=2x\\ln(2)\\,2^{x^{2}}", ENT(1), ENT(2), ENT(1), ENT(2), "exacte"),
  monotone("deuxPuissanceRacine", "2^{\\sqrt{x}}", (x) => Math.pow(2, Math.sqrt(x)), ENT(0), ENT(4), ENT(4), "croissante", "f'(x)=\\dfrac{\\ln(2)\\,2^{\\sqrt{x}}}{2\\sqrt{x}}\\quad(x>0)", ENT(1), ENT(4), ENT(4), ENT(16), "exacte"),
  monotone("inverseUnPlusQuartique", "\\dfrac{1}{1+x^{4}}", (x) => 1 / (1 + x ** 4), ENT(0), ENT(1), ENT(1), "decroissante", "f'(x)=-\\dfrac{4x^{3}}{\\left(1+x^{4}\\right)^{2}}", ENT(1), FR(1, 2), FR(1, 2), ENT(1), "exacte"),
  monotone("inverseRacineUnPlusCarre", "\\dfrac{1}{\\sqrt{1+x^{2}}}", (x) => 1 / Math.sqrt(1 + x * x), ENT(0), ENT(2), ENT(2), "decroissante", "f'(x)=-\\dfrac{x}{\\left(1+x^{2}\\right)\\sqrt{1+x^{2}}}", ENT(1), N("\\dfrac{1}{\\sqrt{5}}", "1/√5", 1 / R5), N("\\dfrac{2}{\\sqrt{5}}", "2/√5", 2 / R5), ENT(2), "calculatrice"),
  monotone("expMoinsRacine", "e^{-\\sqrt{x}}", (x) => Math.exp(-Math.sqrt(x)), ENT(0), ENT(4), ENT(4), "decroissante", "f'(x)=-\\dfrac{e^{-\\sqrt{x}}}{2\\sqrt{x}}\\quad(x>0)", ENT(1), N("\\dfrac{1}{e^{2}}", "1/e²", Math.exp(-2)), N("\\dfrac{4}{e^{2}}", "4/e²", 4 * Math.exp(-2)), ENT(4), "calculatrice"),

  // --- Tableau de variations donné -----------------------------------------------------------
  variations(
    "xExpMoinsX",
    "x\\,e^{-x}",
    (x) => x * Math.exp(-x),
    ENT(3),
    "f'(x)=(1-x)\\,e^{-x}",
    { abscisses: [ENT(0), ENT(1), ENT(3)], zeros: [false, true, false], signes: ["+", "−"], valeurs: [ENT(0), UN_SUR_E, N("\\dfrac{3}{e^{3}}", "3/e³", 3 * Math.exp(-3))] },
    ENT(0),
    UN_SUR_E,
    ENT(0),
    N("\\dfrac{3}{e}", "3/e", 3 / E),
    "calculatrice",
  ),
  variations(
    "gaussM12",
    "e^{-x^{2}}",
    (x) => Math.exp(-x * x),
    ENT(3),
    "f'(x)=-2x\\,e^{-x^{2}}",
    { abscisses: [ENT(-1), ENT(0), ENT(2)], zeros: [false, true, false], signes: ["+", "−"], valeurs: [UN_SUR_E, ENT(1), N("\\dfrac{1}{e^{4}}", "1/e⁴", Math.exp(-4))] },
    N("\\dfrac{1}{e^{4}}", "1/e⁴", Math.exp(-4)),
    ENT(1),
    N("\\dfrac{3}{e^{4}}", "3/e⁴", 3 * Math.exp(-4)),
    ENT(3),
    "calculatrice",
  ),
  variations(
    "trinome03",
    "x^{2}-2x+3",
    (x) => x * x - 2 * x + 3,
    ENT(3),
    "f'(x)=2x-2",
    { abscisses: [ENT(0), ENT(1), ENT(3)], zeros: [false, true, false], signes: ["−", "+"], valeurs: [ENT(3), ENT(2), ENT(6)] },
    ENT(2),
    ENT(6),
    ENT(6),
    ENT(18),
    "exacte",
  ),
  variations(
    "xSurUnPlusCarre",
    "\\dfrac{x}{1+x^{2}}",
    (x) => x / (1 + x * x),
    ENT(3),
    "f'(x)=\\dfrac{1-x^{2}}{\\left(1+x^{2}\\right)^{2}}",
    { abscisses: [ENT(0), ENT(1), ENT(3)], zeros: [false, true, false], signes: ["+", "−"], valeurs: [ENT(0), FR(1, 2), FR(3, 10)] },
    ENT(0),
    FR(1, 2),
    ENT(0),
    FR(3, 2),
    "exacte",
  ),
  variations(
    "lnSurX",
    "\\dfrac{\\ln(x)}{x}",
    (x) => Math.log(x) / x,
    ENT(4),
    "f'(x)=\\dfrac{1-\\ln(x)}{x^{2}}",
    { abscisses: [ENT(1), N("e", "e", E), ENT(5)], zeros: [false, true, false], signes: ["+", "−"], valeurs: [ENT(0), UN_SUR_E, N("\\dfrac{\\ln(5)}{5}", "ln(5)/5", Math.log(5) / 5)] },
    ENT(0),
    UN_SUR_E,
    ENT(0),
    N("\\dfrac{4}{e}", "4/e", 4 / E),
    "calculatrice",
  ),
  variations(
    "cubeMoins3x",
    "x^{3}-3x",
    (x) => x ** 3 - 3 * x,
    ENT(4),
    "f'(x)=3x^{2}-3",
    { abscisses: [ENT(-2), ENT(-1), ENT(1), ENT(2)], zeros: [false, true, true, false], signes: ["+", "−", "+"], valeurs: [ENT(-2), ENT(2), ENT(-2), ENT(2)] },
    ENT(-2),
    ENT(2),
    ENT(-8),
    ENT(8),
    "exacte",
  ),
  variations(
    "carreExpMoinsX",
    "x^{2}e^{-x}",
    (x) => x * x * Math.exp(-x),
    ENT(3),
    "f'(x)=x(2-x)\\,e^{-x}",
    { abscisses: [ENT(0), ENT(2), ENT(3)], zeros: [true, true, false], signes: ["+", "−"], valeurs: [ENT(0), N("\\dfrac{4}{e^{2}}", "4/e²", 4 * Math.exp(-2)), N("\\dfrac{9}{e^{3}}", "9/e³", 9 * Math.exp(-3))] },
    ENT(0),
    N("\\dfrac{4}{e^{2}}", "4/e²", 4 * Math.exp(-2)),
    ENT(0),
    N("\\dfrac{12}{e^{2}}", "12/e²", 12 * Math.exp(-2)),
    "calculatrice",
  ),
  variations(
    "quatreMoinsCarre",
    "4-x^{2}",
    (x) => 4 - x * x,
    ENT(3),
    "f'(x)=-2x",
    { abscisses: [ENT(-1), ENT(0), ENT(2)], zeros: [false, true, false], signes: ["+", "−"], valeurs: [ENT(3), ENT(4), ENT(0)] },
    ENT(0),
    ENT(4),
    ENT(0),
    ENT(12),
    "exacte",
  ),
  variations(
    "xPlusInverse",
    "x+\\dfrac{1}{x}",
    (x) => x + 1 / x,
    FR(3, 2),
    "f'(x)=1-\\dfrac{1}{x^{2}}",
    { abscisses: [FR(1, 2), ENT(1), ENT(2)], zeros: [false, true, false], signes: ["−", "+"], valeurs: [FR(5, 2), ENT(2), FR(5, 2)] },
    ENT(2),
    FR(5, 2),
    ENT(3),
    FR(15, 4),
    "exacte",
  ),
  variations(
    "chDouble",
    "e^{x}+e^{-x}",
    (x) => Math.exp(x) + Math.exp(-x),
    ENT(3),
    "f'(x)=e^{x}-e^{-x}",
    { abscisses: [ENT(-1), ENT(0), ENT(2)], zeros: [false, true, false], signes: ["−", "+"], valeurs: [N("e+\\dfrac{1}{e}", "e + 1/e", E + 1 / E), ENT(2), N("e^{2}+\\dfrac{1}{e^{2}}", "e² + 1/e²", E * E + Math.exp(-2))] },
    ENT(2),
    N("e^{2}+\\dfrac{1}{e^{2}}", "e² + 1/e²", E * E + Math.exp(-2)),
    ENT(6),
    N("3e^{2}+\\dfrac{3}{e^{2}}", "3e² + 3/e²", 3 * E * E + 3 * Math.exp(-2)),
    "calculatrice",
  ),
  variations(
    "inverseTrinome",
    "\\dfrac{1}{x^{2}-2x+2}",
    (x) => 1 / (x * x - 2 * x + 2),
    ENT(3),
    "f'(x)=-\\dfrac{2x-2}{\\left(x^{2}-2x+2\\right)^{2}}",
    { abscisses: [ENT(0), ENT(1), ENT(3)], zeros: [false, true, false], signes: ["+", "−"], valeurs: [FR(1, 2), ENT(1), FR(1, 5)] },
    FR(1, 5),
    ENT(1),
    FR(3, 5),
    ENT(3),
    "exacte",
  ),
  variations(
    "bicarre",
    "x^{4}-2x^{2}",
    (x) => x ** 4 - 2 * x * x,
    ENT(3),
    "f'(x)=4x^{3}-4x",
    { abscisses: [ENT(-1), ENT(0), ENT(1), ENT(2)], zeros: [true, true, true, false], signes: ["+", "−", "+"], valeurs: [ENT(-1), ENT(0), ENT(-1), ENT(8)] },
    ENT(-1),
    ENT(8),
    ENT(-3),
    ENT(24),
    "exacte",
  ),
  variations(
    "deuxMoinsXExp",
    "(2-x)\\,e^{x}",
    (x) => (2 - x) * Math.exp(x),
    ENT(2),
    "f'(x)=(1-x)\\,e^{x}",
    { abscisses: [ENT(0), ENT(1), ENT(2)], zeros: [false, true, false], signes: ["+", "−"], valeurs: [ENT(2), N("e", "e", E), ENT(0)] },
    ENT(0),
    N("e", "e", E),
    ENT(0),
    N("2e", "2e", 2 * E),
    "calculatrice",
  ),
];
