import type { BaseLog, CourbeLog, ExerciceAssocierCourbesLog, ExerciceLectureCourbeLog, ExerciceLireCourbeLogarithmique } from "../core6e/lireCourbeLogarithmique.types";
import type { PhaseLireCourbeLogarithmique } from "../moteur6e/typesLireCourbeLogarithmique";
import { estPhaseChoix, indiceCourbe } from "../moteur6e/typesLireCourbeLogarithmique";

/**
 * Textes, aides, géométrie et formatage LaTeX de `6gen85` « Lire une courbe logarithmique » — UNE
 * seule source pour l'écran interactif, la figure (`figureCourbeLogarithmique.ts`) et l'adaptateur de
 * feuilles (`generateurs6e/lireCourbeLogarithmique/exportEvaluation.ts`). Aides : niveau 1 = la
 * propriété à mobiliser, niveau 2 = la méthode appliquée au graphique — jamais la valeur finale.
 * Notations du cours : log_a, log (base 10), domaine ]c ; +∞[ avec \mathopen/\mathclose.
 */

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}

function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const LETTRES_EXPRESSIONS = ["A", "B", "C", "D"] as const;

// ============================================================================
// Base, expression, points remarquables.
// ============================================================================

export function estCroissante(base: BaseLog): boolean {
  return base.num > base.den;
}

/** Entier k tel que a = k ou a = 1/k. */
export function entierBase(base: BaseLog): number {
  return Math.max(base.num, base.den);
}

export function valeurBase(base: BaseLog): number {
  return base.num / base.den;
}

export function baseLatex(base: BaseLog): string {
  return base.den === 1 ? String(base.num) : `\\dfrac{${base.num}}{${base.den}}`;
}

/** Nombre en texte courant, avec le vrai signe moins typographique. */
export function nb(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

/** Logarithme de base `base` appliqué à `argument` (LaTeX) — base 10 : `\log` sans indice (cours). */
export function logLatex(base: BaseLog, argument: string): string {
  if (base.num === 10 && base.den === 1) return `\\log(${argument})`;
  const indice = base.den === 1 ? String(base.num) : `\\frac{${base.num}}{${base.den}}`;
  return `\\log_{${indice}}(${argument})`;
}

export function argumentLatex(c: number): string {
  if (c === 0) return "x";
  return c > 0 ? `x - ${c}` : `x + ${-c}`;
}

function constanteLatex(d: number): string {
  if (d === 0) return "";
  return d > 0 ? ` + ${d}` : ` - ${-d}`;
}

/** Membre de droite : log_a(x − c) + d. */
export function expressionLatex(courbe: CourbeLog): string {
  return `${logLatex(courbe.base, argumentLatex(courbe.c))}${constanteLatex(courbe.d)}`;
}

export function fonctionLatex(courbe: CourbeLog): string {
  return `f(x) = ${expressionLatex(courbe)}`;
}

export function equationAsymptoteLatex(courbe: CourbeLog): string {
  return `x = ${courbe.c}`;
}

export function domaineLatex(courbe: CourbeLog): string {
  return `\\text{dom}\\,f = \\mathopen{]}${courbe.c}\\,;+\\infty\\mathclose{[}`;
}

export function evaluerCourbe(courbe: CourbeLog, x: number): number {
  return Math.log(x - courbe.c) / Math.log(valeurBase(courbe.base)) + courbe.d;
}

/** Point d'abscisse c + 1 : l'argument vaut 1, f = d. */
export function pointUn(courbe: CourbeLog): { x: number; y: number } {
  return { x: courbe.c + 1, y: courbe.d };
}

/** Point qui donne la base : (c + a ; d + 1) si a > 1, (c + 1/a ; d − 1) si 0 < a < 1. */
export function pointBase(courbe: CourbeLog): { x: number; y: number } {
  return { x: courbe.c + entierBase(courbe.base), y: courbe.d + (estCroissante(courbe.base) ? 1 : -1) };
}

export function coordonneesLatex(p: { x: number; y: number }): string {
  return `(${p.x}\\,;\\,${p.y})`;
}

// ============================================================================
// Fenêtre (commune à l'écran et au papier) — bornes ENTIÈRES, quadrillage d'une unité : les deux
// points utiles, à coordonnées entières, tombent sur des intersections.
// ============================================================================

export interface CadreCourbes {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export function cadreCourbes(courbes: CourbeLog[]): CadreCourbes {
  const xMin = Math.min(0, ...courbes.map((k) => k.c)) - 1;
  // Au moins 7 unités de large : la courbe se prolonge au-delà du point qui donne la base.
  const xMax = Math.max(xMin + 7, Math.max(1, ...courbes.map((k) => pointBase(k).x)) + 2);
  const ordonnees = [0, ...courbes.flatMap((k) => [k.d - 2, k.d + 2, evaluerCourbe(k, xMax)])];
  return { xMin, xMax, yMin: Math.floor(Math.min(...ordonnees)) - 1, yMax: Math.ceil(Math.max(...ordonnees)) + 1 };
}

export function courbesExercice(e: ExerciceLireCourbeLogarithmique): CourbeLog[] {
  return e.variante === "lecture" ? [e.courbe] : e.expressionDeCourbe.map((i) => e.expressions[i]);
}

// ============================================================================
// Consignes.
// ============================================================================

const FORME_GENERALE: FragmentConsigne[] = [latex("f(x) = \\log_a(x - c) + d")];

export function consigneGenerale(e: ExerciceLireCourbeLogarithmique): FragmentConsigne[] {
  if (e.variante === "lecture") {
    return [
      texte("Le graphique est celui de "),
      ...FORME_GENERALE,
      texte(", où la base a ("),
      latex("a > 0"),
      texte(", "),
      latex("a \\neq 1"),
      texte(") et les nombres entiers c et d sont inconnus. Retrouve-les à partir du graphique."),
    ];
  }
  return [texte("Les courbes 1 à 4 représentent les fonctions A à D ci-dessous (asymptotes verticales en pointillés). Associe chaque courbe à son expression.")];
}

/** Liste des expressions A–D (variante `associer`), en fragments : « A : y = … ». */
export function listeExpressions(e: ExerciceAssocierCourbesLog): FragmentConsigne[] {
  return e.expressions.flatMap((k, i) => [texte(`${i > 0 ? " ; " : ""}${LETTRES_EXPRESSIONS[i]} : `), latex(`y = ${expressionLatex(k)}`)]);
}

/** Sous la figure (écran) : ce que montre le graphique. */
export function descriptionFigure(e: ExerciceLireCourbeLogarithmique, fini = false): FragmentConsigne[] {
  if (e.variante === "lecture") {
    if (fini) return [texte("Les deux points utiles, avec leurs coordonnées : le point où l'argument vaut 1, et celui qui donne la base.")];
    return [texte(`La droite en pointillés est l'asymptote verticale ; les points ${e.lettrePointUn} et ${e.lettrePointBase} de la courbe tombent sur des intersections du quadrillage.`)];
  }
  return [];
}

export function libellePhase(e: ExerciceLireCourbeLogarithmique, phase: PhaseLireCourbeLogarithmique): string {
  void e;
  switch (phase) {
    case "asymptote":
      return "Asymptote verticale";
    case "domaine":
      return "Domaine";
    case "base":
      return "Base a";
    case "expression":
      return "Expression de f(x)";
    default:
      return `Courbe ${indiceCourbe(phase) + 1}`;
  }
}

export function consigneEcran(e: ExerciceLireCourbeLogarithmique, phase: PhaseLireCourbeLogarithmique): FragmentConsigne[] {
  switch (phase) {
    case "asymptote":
      return [texte("Écris l'équation de l'asymptote verticale du graphique.")];
    case "domaine":
      return [texte("Donne le domaine de f.")];
    case "base":
      return [texte("Détermine la base a.")];
    case "expression":
      return [texte("Écris l'expression complète de "), latex("f(x)"), texte(".")];
    default:
      void e;
      return [texte(`Quelle expression correspond à la courbe ${indiceCourbe(phase) + 1} ?`)];
  }
}

// ============================================================================
// Aides — jamais la valeur finale.
// ============================================================================

function lecture(e: ExerciceLireCourbeLogarithmique): ExerciceLectureCourbeLog {
  if (e.variante !== "lecture") throw new Error("écran réservé à la variante lecture");
  return e;
}

export function aideNiveau1(e: ExerciceLireCourbeLogarithmique, phase: PhaseLireCourbeLogarithmique): AideAvecLatex {
  if (estPhaseChoix(phase)) {
    return {
      texte: `Commence par l'asymptote verticale de la courbe ${indiceCourbe(phase) + 1} : son équation x = c donne la translation dans l'argument. Regarde ensuite le sens de variation :`,
      latex: "a > 1 \\;\\Rightarrow\\; f \\nearrow \\qquad 0 < a < 1 \\;\\Rightarrow\\; f \\searrow",
    };
  }
  const ex = lecture(e);
  const { c } = ex.courbe;
  switch (phase) {
    case "asymptote":
      return { texte: "Un logarithme n'est défini que pour un argument strictement positif : l'asymptote verticale est la droite où l'argument s'annule :", latex: "x - c = 0" };
    case "domaine":
      return { texte: "Le domaine est l'ensemble des réels x pour lesquels l'argument du logarithme est strictement positif :", latex: "x - c > 0" };
    case "base":
      return {
        texte: `Au point ${ex.lettrePointUn}, d'abscisse ${nb(c + 1)}, l'argument vaut 1 et le logarithme s'annule : l'ordonnée de ${ex.lettrePointUn} est d. Le point ${ex.lettrePointBase}, une unité plus haut ou plus bas, vérifie donc :`,
        latex: `\\log_a(x_{${ex.lettrePointBase}} - c) = \\pm 1`,
      };
    default:
      return {
        texte: `Il reste d : c'est l'ordonnée du point ${ex.lettrePointUn}, d'abscisse ${nb(c + 1)}, car :`,
        latex: `f(${c + 1}) = ${logLatex(ex.courbe.base, "1")} + d = d`,
      };
  }
}

export function aideNiveau2(e: ExerciceLireCourbeLogarithmique, phase: PhaseLireCourbeLogarithmique): AideAvecLatex {
  if (estPhaseChoix(phase)) {
    return {
      texte: "S'il reste deux expressions possibles, lis le point d'abscisse c + 1 (son ordonnée est d), puis le point une unité plus haut ou plus bas, qui donne la base :",
      latex: "f(c + 1) = d \\qquad \\log_a(x - c) = \\pm 1",
    };
  }
  const ex = lecture(e);
  const { c } = ex.courbe;
  switch (phase) {
    case "asymptote":
      return { texte: "Sur le graphique, c'est la droite en pointillés que la courbe longe sans jamais la toucher : lis l'abscisse du point où elle coupe l'axe des abscisses.", latex: null };
    case "domaine":
      return { texte: `La courbe n'existe qu'à droite de l'asymptote x = ${nb(c)} et ne la touche jamais : la borne ${nb(c)} est-elle comprise ?`, latex: null };
    case "base": {
      const q = ex.lettrePointBase;
      return estCroissante(ex.courbe.base)
        ? { texte: `${q} est une unité au-dessus de ${ex.lettrePointUn}. Lis l'abscisse de ${q}, puis résous :`, latex: `\\log_a(x_{${q}} - c) = 1 \\iff a = x_{${q}} - c` }
        : { texte: `${q} est une unité au-dessous de ${ex.lettrePointUn}. Lis l'abscisse de ${q}, puis résous :`, latex: `\\log_a(x_{${q}} - c) = -1 \\iff a^{-1} = x_{${q}} - c \\iff a = \\dfrac{1}{x_{${q}} - c}` };
    }
    default:
      return {
        texte: "Assemble la forme générale avec c (asymptote) et a ; attention au signe dans l'argument :",
        latex: `f(x) = ${logLatex(ex.courbe.base, `x - ${c < 0 ? `(${c})` : c}`)} + d`,
      };
  }
}

// ============================================================================
// Réponses attendues (révélation, récapitulatif, corrigé).
// ============================================================================

export function formatReponseAttenduePhaseLatex(e: ExerciceLireCourbeLogarithmique, phase: PhaseLireCourbeLogarithmique): string[] {
  if (estPhaseChoix(phase)) {
    const a = e as ExerciceAssocierCourbesLog;
    const i = a.expressionDeCourbe[indiceCourbe(phase)];
    return [`\\mathrm{${LETTRES_EXPRESSIONS[i]}}\\colon\\; y = ${expressionLatex(a.expressions[i])}`];
  }
  const { courbe } = lecture(e);
  switch (phase) {
    case "asymptote":
      return [equationAsymptoteLatex(courbe)];
    case "domaine":
      return [domaineLatex(courbe)];
    case "base":
      return [`a = ${baseLatex(courbe.base)}`];
    default:
      return [fonctionLatex(courbe)];
  }
}

// ============================================================================
// Champs de saisie — placeholders hors de l'espace des tirages.
// ============================================================================

export const LIBELLE_CHAMP: Partial<Record<PhaseLireCourbeLogarithmique, string>> = {
  asymptote: "Équation :",
  base: "a =",
  expression: "f(x) =",
};

export const PLACEHOLDERS: Partial<Record<PhaseLireCourbeLogarithmique, string>> = {
  asymptote: "ex : x = 7",
  base: "ex : 7 ou 1/7",
  expression: "ex : log7(x+8)−9",
};

/** Rappel de SAISIE, affiché sous le champ de l'écran « expression » (jamais sur papier). */
export const RAPPEL_SAISIE_EXPRESSION = "Saisie : log2(…) pour la base 2, log(…) pour la base 10 et, pour une base fractionnaire, ln(…)/ln(1/2).";
