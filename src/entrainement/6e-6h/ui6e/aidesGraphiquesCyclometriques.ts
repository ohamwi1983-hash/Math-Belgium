import type { ExerciceGraphiquesCyclometriques } from "../core6e/graphiquesCyclometriques.types";
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { DiagnosticEcranUniqueGraphiquesCyclometriques } from "../moteur6e/verificationGraphiquesCyclometriques";
import { fragmentsDepuisTexte } from "../components6e/RetourSaisieExpo";
import { piL, q } from "./corrigeIntegrales1";

/**
 * Aides et message ciblé de `6gen5` (audit du 6e ch. 1, lot B : G4, G5). Niveau 1 : les propriétés
 * du cours (domaine, image, parité, extremums) ; niveau 2 : les conditions POSÉES pour l'instance,
 * sans les résoudre (l'ancien niveau 2 donnait le domaine et l'image, réponses de la justification,
 * et le niveau 1 de C disait « la fonction est paire »). Une phrase (formules courtes entre `$…$`)
 * terminée par « : », puis la formule en KaTeX ; aucune majuscule d'insistance, virgule décimale.
 */

export interface AideGraphique {
  texte: string;
  latex: string | null;
}

type E = ExerciceGraphiquesCyclometriques;

const NOM = { arcsin: "\\arcsin", arccos: "\\arccos", arctan: "\\arctan" } as const;
const IMAGE = {
  arcsin: "\\left[-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\right]",
  arccos: "[0\\,;\\pi]",
  arctan: "\\left]-\\frac{\\pi}{2}\\,;\\frac{\\pi}{2}\\right[",
} as const;
const PARITE = " Parité : f est paire si $f(-x)=f(x)$, impaire si $f(-x)=-f(x)$, pour tout $x$ d'un domaine symétrique par rapport à $0$.";

const nb = (v: number) => (Number.isInteger(v) ? String(v) : String(v).replace(".", "{,}"));

function lin(a: number, b: number, v = "x"): string {
  const ta = a === 1 ? v : a === -1 ? `-${v}` : `${nb(a)}${v}`;
  if (b === 0) return ta;
  return `${ta} ${b > 0 ? "+" : "-"} ${nb(Math.abs(b))}`;
}

export function aideGraphique1(e: E): AideGraphique {
  switch (e.famille) {
    case "A":
      return { texte: `$\\arcsin$ et $\\arccos$ demandent un argument dans $[-1\\,;1]$ : le domaine vient de cet encadrement. L'image s'obtient en multipliant l'image de l'arcfonction par $k$, puis en ajoutant $c$.${PARITE}`, latex: null };
    case "B":
      return { texte: `$\\arctan$ est définie sur $\\mathbb{R}$ et tend vers $-\\frac{\\pi}{2}$ et $\\frac{\\pi}{2}$ sans les atteindre : deux asymptotes horizontales.${PARITE}`, latex: null };
    case "C":
      return { texte: `Pour $\\arcsin$ et $\\arccos$, l'argument $ax^{2}+b$ doit rester dans $[-1\\,;1]$ ; $\\arctan$ est définie partout. Compare aussi $f(-x)$ et $f(x)$.${PARITE}`, latex: null };
    case "D":
      return { texte: `Le quotient n'existe pas là où son dénominateur s'annule ; de part et d'autre, il tend vers l'infini et son arctangente vers $-\\frac{\\pi}{2}$ ou $\\frac{\\pi}{2}$.${PARITE}`, latex: null };
    case "E":
      return { texte: `Deux conditions pour le domaine : celle de l'arcfonction ($x\\in[-1\\,;1]$) et celle de la racine (radicande positif ou nul). Une racine est minimale (nulle) là où son radicande s'annule.${PARITE}`, latex: null };
    case "F":
      return { texte: `Un carré est positif ou nul : $\\left(\\text{arcfonction}\\right)^{2}$ est minimal là où l'arcfonction s'annule ; l'argument doit rester dans $[-1\\,;1]$.${PARITE}`, latex: null };
  }
}

export function aideGraphique2(e: E): AideGraphique {
  switch (e.famille) {
    case "A": {
      const r = e.reel;
      return { texte: "Les conditions à traiter pour f (sans les résoudre ici) :", latex: `-1 \\leq ${lin(r.m, r.n)} \\leq 1 \\qquad f(x) \\in ${nb(r.c)} + ${r.k < 0 ? `(${r.k})` : r.k}\\cdot ${IMAGE[r.arcfonction]}` };
    }
    case "B": {
      const r = e.reel;
      return { texte: "Limites de l'arctangente, à multiplier par $k$ puis à décaler de $c$ :", latex: `\\lim_{x\\to\\pm\\infty} \\arctan\\left(${lin(r.m, r.n)}\\right) = \\pm\\frac{\\pi}{2} \\ \\text{(selon le signe de } ${nb(r.m)}\\text{)}` };
    }
    case "C": {
      const r = e.reel;
      if (r.arcfonction === "arctan") return { texte: "Compare $f(-x)$ et $f(x)$ ; cherche ensuite le plus petit ou le plus grand argument :", latex: `${lin(r.a, r.b, "x^{2}")} \\ \\text{est extrême en } x = 0` };
      return { texte: "L'encadrement à résoudre pour le domaine :", latex: `-1 \\leq ${lin(r.a, r.b, "x^{2}")} \\leq 1` };
    }
    case "D": {
      const r = e.reel;
      const d = r.p === 0 ? "x" : `x ${r.p > 0 ? "-" : "+"} ${Math.abs(r.p)}`;
      return { texte: "La valeur interdite et le comportement de part et d'autre :", latex: `${d} \\neq 0 \\qquad \\lim_{x\\to ${r.p}} \\left|\\dfrac{${r.k}}{${d}}\\right| = +\\infty` };
    }
    case "E": {
      const r = e.reel;
      const cTex = piL(q(Math.abs(r.cPi.n), r.cPi.d));
      return { texte: "Les deux conditions à réunir (sans les résoudre ici) :", latex: `-1 \\leq x \\leq 1 \\qquad ${r.k === 1 ? "" : r.k === -1 ? "-" : r.k}${NOM[r.arcfonction]}(x) ${r.cPi.n < 0 ? "-" : "+"} ${cTex} \\geq 0` };
    }
    case "F": {
      const r = e.reel;
      const zero = r.arcfonction === "arcsin" ? "0" : "1";
      return { texte: "L'arcfonction s'annule quand son argument vaut :", latex: `${lin(r.m, r.n)} = ${zero} \\qquad -1 \\leq ${lin(r.m, r.n)} \\leq 1` };
    }
  }
}

const NOMS: [keyof DiagnosticEcranUniqueGraphiquesCyclometriques, string][] = [
  ["ordonnee", "l'ordonnée à l'origine"],
  ["domf", "le domaine"],
  ["imf", "l'image"],
  ["maximum", "le maximum"],
  ["minimum", "le minimum"],
];

/** Liste des propriétés à revoir (jamais leur valeur), plus un rappel ciblé (asymptote jamais atteinte). */
export function cibleJustification(e: E, d: DiagnosticEcranUniqueGraphiquesCyclometriques): FragmentConsigne[] | null {
  const fausses = NOMS.filter(([cle]) => d[cle] !== "correct").map(([, nom]) => nom);
  if (fausses.length === 0) return null;
  const liste = fausses.length === 1 ? fausses[0] : `${fausses.slice(0, -1).join(", ")} et ${fausses[fausses.length - 1]}`;
  const rappel = (e.famille === "B" || e.famille === "D") && d.imf !== "correct" ? " Une asymptote horizontale n'est jamais atteinte : crochet ouvert." : "";
  return fragmentsDepuisTexte(`À revoir : ${liste}.${rappel}`);
}
