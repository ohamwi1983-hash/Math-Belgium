import type { ExerciceLireCourbeExpo } from "../core6e/lireCourbeExponentielle";
import { estCroissanteBase, evaluer, fAutre, fZero } from "../core6e/lireCourbeExponentielle";
import type { AideEcran, ChampEcran, Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { Rat } from "./nombresExpoLotG";
import { nbT, parL, rat, ratL } from "./nombresExpoLotG";
import { figureExpoSvg } from "./figureExpoLotG";

/**
 * Couche C — textes de `6gen148` « Lire une courbe exponentielle y = k·aˣ + c ». Source unique de
 * l'écran, des aides, du récapitulatif, du corrigé et du papier.
 */

type E = ExerciceLireCourbeExpo;
export type PhaseLireCourbeExpo = "asymptote" | "k" | "a" | "expression";
export const PHASES_LIRE_COURBE_EXPO: PhaseLireCourbeExpo[] = ["asymptote", "k", "a", "expression"];

/** Base en LaTeX (« 2 », « \dfrac{1}{3} »), et puissance aˣ correctement parenthésée. */
export const baseL = (b: Rat): string => ratL(b);
export const puissanceL = (b: Rat, exp = "x"): string => (b.den === 1 ? `${b.num}^{${exp}}` : `\\left(\\dfrac{${b.num}}{${b.den}}\\right)^{${exp}}`);
const n = (v: number) => (v < 0 ? `-${-v}` : String(v));
const nT = (v: number) => nbT(v, 0);

/** Expression k·aˣ + c en LaTeX (coefficient 1 omis, c nul omis). */
export function expressionL(e: E): string {
  const coef = e.k === 1 ? "" : e.k === -1 ? "-" : `${e.k}\\cdot `;
  const reste = e.c === 0 ? "" : e.c > 0 ? `+${e.c}` : `-${-e.c}`;
  return `${coef}${puissanceL(e.base)}${reste}`;
}
export const fonctionL = (e: E) => `f(x)=${expressionL(e)}`;
export const asymptoteL = (e: E) => `y=${n(e.c)}`;

/** Ordonnée du point d'abscisse x (entière par construction). */
export const yPoint = (e: E, x: number): number => Math.round(x === 0 ? fZero(e) : fAutre(e));

// ---------------------------------------------------------------------------
// Figure (fenêtre aux bornes entières, quadrillage d'une unité).
// ---------------------------------------------------------------------------

export function cadre(e: E): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const ys = [0, e.c, fZero(e), fAutre(e)];
  let yMin = Math.min(...ys) - 1;
  let yMax = Math.max(...ys) + 1;
  // Au moins 6 unités de haut : on prolonge du côté où la courbe s'éloigne de son asymptote.
  const manque = 6 - (yMax - yMin);
  if (manque > 0) {
    if (e.k > 0) yMax += manque;
    else yMin -= manque;
  }
  return { xMin: -4, xMax: 4, yMin, yMax };
}

export type UsageFigure = "ecran" | "papier" | "corrige";

export function figure(e: E, usage: UsageFigure): string {
  const k = cadre(e);
  // Côté libre : sous la courbe si elle est au-dessus de son asymptote (k > 0), sinon au-dessus.
  const dessous = e.k > 0;
  const pts = [
    { x: 0, y: yPoint(e, 0), nom: e.lettreZero },
    { x: e.xAutre, y: yPoint(e, e.xAutre), nom: e.lettreAutre },
  ];
  const points =
    usage === "papier"
      ? []
      : pts.map((p) => ({ x: p.x, y: p.y, dessous, label: usage === "ecran" ? p.nom : `${p.nom} (${nT(p.x)} ; ${nT(p.y)})` }));
  const commun = { ...k, courbe: (x: number) => evaluer(e, x), asymptoteY: e.c, points };
  return usage === "ecran"
    ? figureExpoSvg({ ...commun, largeurMax: 340, hauteurMax: 340, carreauMin: 18, carreauMax: 40, police: 12, fluide: true })
    : figureExpoSvg({ ...commun, largeurMax: 300, hauteurMax: 280, carreauMin: 14, carreauMax: 26, police: 9 });
}

// ---------------------------------------------------------------------------
// Écrans.
// ---------------------------------------------------------------------------

export function consigneGenerale(e: E): Frag[] {
  return [
    tx("Le graphique représente la fonction "),
    lx("f(x)=k\\cdot a^{x}+c"),
    tx(" ("),
    lx("k\\neq 0"),
    tx(", "),
    lx("a>0"),
    tx(", "),
    lx("a\\neq 1"),
    tx(`). La droite en pointillés est son asymptote ; les points ${e.lettreZero} et ${e.lettreAutre} de la courbe sont sur des nœuds du quadrillage.`),
  ];
}

export function libelle(_e: E, phase: PhaseLireCourbeExpo): string {
  return { asymptote: "Asymptote", k: "Coefficient k", a: "Base a", expression: "Expression de f" }[phase];
}

const nomAutre = (e: E) => `${e.lettreAutre}`;

export function consigne(e: E, phase: PhaseLireCourbeExpo): Frag[] {
  switch (phase) {
    case "asymptote":
      return [tx("Écris l'équation de l'asymptote horizontale de la courbe.")];
    case "k":
      return [tx("Lis "), lx("f(0)"), tx(` au point ${e.lettreZero} et déduis-en `), lx("k"), tx(".")];
    case "a":
      return [tx(`Lis l'ordonnée du point ${nomAutre(e)} (abscisse ${nT(e.xAutre)}) et déduis-en la base `), lx("a"), tx(".")];
    case "expression":
      return [tx("Écris l'expression de "), lx("f(x)"), tx(".")];
  }
}

export function champs(_e: E, phase: PhaseLireCourbeExpo): ChampEcran[] {
  switch (phase) {
    case "asymptote":
      return [{ label: "asymptote", labelLatex: "\\text{Asymptote :}", placeholder: "ex. : y = 7" }];
    case "k":
      return [{ label: "k", labelLatex: "k =", placeholder: "ex. : 5" }];
    case "a":
      return [{ label: "a", labelLatex: "a =", placeholder: "ex. : 6 ou 1/6" }];
    case "expression":
      return [{ label: "f(x) =", labelLatex: "f(x) =", placeholder: "ex. : 5*6^x − 7", apercu: true }];
  }
}

/** Écarts à l'asymptote utilisés pour la base (numérateur : abscisse la plus grande). */
export function ecartsBase(e: E): { xHaut: number; xBas: number } {
  return e.xAutre === 1 ? { xHaut: 1, xBas: 0 } : { xHaut: 0, xBas: -1 };
}

export function aide1(_e: E, phase: PhaseLireCourbeExpo): AideEcran {
  switch (phase) {
    case "asymptote":
      return { texte: [tx("Du côté où "), lx("a^{x}"), tx(" tend vers 0, "), lx("k\\cdot a^{x}"), tx(" tend vers 0 aussi : la courbe s'approche de la droite d'équation :")], latex: "y=c" };
    case "k":
      return { texte: [tx("En "), lx("x=0"), tx(", "), lx("a^{0}=1"), tx(" :")], latex: "f(0)=k\\cdot a^{0}+c=k+c" };
    case "a":
      return { texte: [tx("L'écart à l'asymptote, "), lx("f(x)-c=k\\cdot a^{x}"), tx(", est multiplié par "), lx("a"), tx(" quand "), lx("x"), tx(" augmente de 1 (cours, § 7). Rapport de deux écarts consécutifs :")], latex: "a=\\dfrac{f(x+1)-c}{f(x)-c}" };
    case "expression":
      return { texte: [tx("Remplace "), lx("k"), tx(", "), lx("a"), tx(" et "), lx("c"), tx(" par les valeurs trouvées dans :")], latex: "f(x)=k\\cdot a^{x}+c" };
  }
}

export function aide2(e: E, phase: PhaseLireCourbeExpo): AideEcran {
  const { xHaut, xBas } = ecartsBase(e);
  switch (phase) {
    case "asymptote":
      return { texte: [tx(`Ici, la courbe s'aplatit quand ${estCroissanteBase(e.base) ? "x devient très négatif (vers la gauche)" : "x devient très grand (vers la droite)"} : lis l'ordonnée de la droite en pointillés, sur l'axe vertical.`)] };
    case "k":
      return { texte: [tx(`Ici, ${e.lettreZero} est le point de la courbe sur l'axe des ordonnées ; retire l'ordonnée de l'asymptote :`)], latex: `k=f(0)-${parL(n(e.c))}` };
    case "a": {
      const fb = xBas === 0 ? fZero(e) : null;
      const num = `f(${xHaut})-${parL(n(e.c))}`;
      const den = fb !== null ? `${n(fb)}-${parL(n(e.c))}` : `f(${xBas})-${parL(n(e.c))}`;
      const numSub = xHaut === 0 ? `${n(fZero(e))}-${parL(n(e.c))}` : num;
      return { texte: [tx("Ici, "), lx(`f(0)=${n(fZero(e))}`), tx(" ; il reste à lire "), lx(`f(${n(e.xAutre)})`), tx(` au point ${e.lettreAutre} :`)], latex: `a=\\dfrac{${numSub}}{${den}}` };
    }
    case "expression":
      return { texte: [tx("Attention : "), lx("k"), tx(" multiplie "), lx("a^{x}"), tx(", il n'entre pas dans la base :")], latex: "k\\cdot a^{x}\\neq (k\\cdot a)^{x}" };
  }
}

export function messageIllisible(_e: E, phase: PhaseLireCourbeExpo): string {
  if (phase === "asymptote") return "Équation non reconnue : écris par exemple y = 7 (ou y = −2). Cette saisie ne compte pas comme une tentative.";
  if (phase === "expression") return "Expression non reconnue : écris par exemple 5*6^x − 7 ou 2*(1/6)^x + 1. Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre comme 5, −3 ou 1/6 (virgule ou point). Cette saisie ne compte pas comme une tentative.";
}

export function reponse(e: E, phase: PhaseLireCourbeExpo): Frag[] {
  switch (phase) {
    case "asymptote":
      return [lx(asymptoteL(e))];
    case "k":
      return [lx(`k=${n(e.k)}`)];
    case "a":
      return [lx(`a=${baseL(e.base)}`)];
    case "expression":
      return [lx(fonctionL(e))];
  }
}

export const recap = reponse;

/** Rapport des écarts en LaTeX (fraction brute puis réduite). */
export function rapportEcarts(e: E): { haut: number; bas: number } {
  const { xHaut, xBas } = ecartsBase(e);
  return { haut: yPoint(e, xHaut) - e.c, bas: yPoint(e, xBas) - e.c };
}

export const baseDepuisRapport = (e: E): Rat => {
  const r = rapportEcarts(e);
  return rat(r.haut, r.bas);
};
