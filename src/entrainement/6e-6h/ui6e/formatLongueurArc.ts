import type { ExerciceLongueurArc, ExerciceLongueurArcA, ExerciceLongueurArcB, ExerciceLongueurArcC } from "../core6e/longueurArc.types";
import type { PhaseLongueurArc } from "../moteur6e/typesLongueurArc";
import { CONSIGNE_PRECISION, egalExactPuisApprox, fractionLatex, racineLatex } from "./nombresExactsIntegrales";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen28`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatCalculAires.ts`/`formatCalculPrimitives.ts`,
 * jamais importé (chaque générateur reste indépendant — CLAUDE.md).
 *
 * **Vigilance signe orphelin (bug déjà rencontré et corrigé sur 6gen23/6gen26, voir en-tête
 * `ui6e/formatCalculAires.ts`)** — n'a en fait JAMAIS d'occasion de se produire ici : n∈{2,3,4},
 * k∈{1,2,3}, a,b entiers POSITIFS par construction (voir `core6e/longueurArc.types.ts`) — aucun
 * coefficient de signe variable n'entre dans le formatage LaTeX de ce générateur (contrairement à
 * 6gen23/6gen26, où un `TermeA.coef` tiré négativement OBLIGE à assembler signe+magnitude
 * ensemble). Testé explicitement malgré tout (`formatLongueurArc.test.ts`, "régression — aucun
 * signe orphelin...") — discipline systématique du chantier, jamais supposée acquise sans preuve.
 */

export type TypeChamp = "texte" | "choix";

export interface OptionChoix {
  valeur: string;
  label: string;
}

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
  options?: OptionChoix[];
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`,
 * rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

const FORMULE_LONGUEUR_ARC_LATEX = "L=\\displaystyle\\int_{a}^{b}\\sqrt{1+[f'(x)]^2}\\,dx";

/** Consigne générale commune : la formule de L n'est donnée QU'ICI (audit point 19 — elle figurait
 * aussi dans le bloc de données). */
const CONSIGNE_GENERALE_COMMUNE: FragmentConsigne[] = [
  texte("On considère la fonction f définie ci-dessous. On veut calculer la longueur de l'arc de sa courbe entre "),
  latex("x=a"),
  texte(" et "),
  latex("x=b"),
  texte(", donnée par "),
  latex(FORMULE_LONGUEUR_ARC_LATEX),
  texte("."),
];

function fracPuissanceX(exposant: number, denom: number): string {
  const corps = `x^{${exposant}}`;
  return denom === 1 ? corps : `\\frac{${corps}}{${denom}}`;
}

/** L exacte (rationnelle, ou rationnel + c·ln q) puis approchée — audit point 16. */
function longueurLatex(valeur: number, exactLatex?: string | null): string {
  return `L${egalExactPuisApprox(valeur, exactLatex)}`;
}

// ============================================================================
// Famille A — racine parfaite par construction (formes « puissances » et « log »).
// ============================================================================

function formuleFA(exercice: ExerciceLongueurArcA): string {
  if (exercice.forme === "log") {
    const c = exercice.c;
    return `\\dfrac{x^2}{${4 * c}}-${demiLatex(c)}\\ln(x)`;
  }
  const n = exercice.n;
  return `\\frac{1}{2}\\left(${fracPuissanceX(n + 1, n + 1)}+${fracPuissanceX(1 - n, n - 1)}\\right)`;
}
export function formuleFPrimeA(exercice: ExerciceLongueurArcA): string {
  if (exercice.forme === "log") {
    const c = exercice.c;
    return `\\dfrac{x}{${2 * c}}-${fractionSurXLatex(c, 2)}`;
  }
  return `\\frac{1}{2}\\left(x^{${exercice.n}}-x^{-${exercice.n}}\\right)`;
}
export function formuleRacineSimplifieeA(exercice: ExerciceLongueurArcA): string {
  if (exercice.forme === "log") {
    const c = exercice.c;
    return `\\dfrac{x}{${2 * c}}+${fractionSurXLatex(c, 2)}`;
  }
  return `\\frac{1}{2}\\left(x^{${exercice.n}}+x^{-${exercice.n}}\\right)`;
}
export function formuleFPrimeCarreDeveloppeA(exercice: ExerciceLongueurArcA): string {
  if (exercice.forme === "log") {
    const c = exercice.c;
    return `\\dfrac{x^2}{${4 * c * c}}-\\dfrac{1}{2}+${fractionSurXLatex(c * c, 4, 2)}`;
  }
  const n = exercice.n;
  return `\\frac{1}{4}\\left(x^{${2 * n}}-2+x^{${-2 * n}}\\right)`;
}

/** Coefficient c/2 devant ln(x) : « » (c = 2), « 3 »… ou « \\dfrac{1}{2} ». */
export function demiLatex(c: number): string {
  if (c === 2) return "";
  return c % 2 === 0 ? `${c / 2}` : `\\dfrac{${c}}{2}`;
}
/** Terme num/(den·x^p) réduit : c/(2x) → « \\dfrac{1}{x} » (c = 2), « \\dfrac{3}{2x} »… */
function fractionSurXLatex(num: number, den: number, puissance = 1): string {
  const g = pgcdEntiers(num, den);
  const n = num / g;
  const d = den / g;
  const xp = puissance === 1 ? "x" : `x^{${puissance}}`;
  return `\\dfrac{${n}}{${d === 1 ? "" : d}${xp}}`;
}
function pgcdEntiers(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a) || 1;
}

/** Longueur exacte de la famille A : rationnelle (forme `puissances`), ou (b² − a²)/(4c) + c·ln(b/a)
 * (forme `log`). */
function longueurExacteALatex(exercice: ExerciceLongueurArcA): string | null {
  if (exercice.forme === "puissances") {
    // L = ½[(bⁿ⁺¹ − aⁿ⁺¹)/(n+1) + (bⁿ⁻¹ − aⁿ⁻¹)/((n−1)·aⁿ⁻¹·bⁿ⁻¹)] — fraction calculée en entiers
    // (les dénominateurs dépassent ce qu'une reconnaissance numérique retrouve).
    const { a, b, n } = exercice;
    const p1 = { num: b ** (n + 1) - a ** (n + 1), den: n + 1 };
    const p2 = { num: b ** (n - 1) - a ** (n - 1), den: (n - 1) * a ** (n - 1) * b ** (n - 1) };
    return fractionLatex(p1.num * p2.den + p2.num * p1.den, 2 * p1.den * p2.den);
  }
  const { a, b, c } = exercice;
  const partie = fractionLatex(b * b - a * a, 4 * c);
  const q = fractionLatex(b, a);
  const ln = q.includes("dfrac") ? `\\ln\\left(${q}\\right)` : `\\ln(${q})`;
  return `${partie}+${demiLatex(c)}${ln}`;
}

export function consigneGeneraleA(): FragmentConsigne[] {
  return CONSIGNE_GENERALE_COMMUNE;
}
export function blocDonneesA(exercice: ExerciceLongueurArcA): string[] {
  return [`f(x)=${formuleFA(exercice)}`, `a=${exercice.a}\\text{, }b=${exercice.b}`];
}
export function consigneEcranA(phase: PhaseLongueurArc): FragmentConsigne[] {
  if (phase === "aEcran1") return [texte("Calcule "), latex("f'(x)"), texte(".")];
  if (phase === "aEcran2") {
    return [
      texte("Calcule "),
      latex("1+[f'(x)]^2"),
      texte(" et simplifie "),
      latex("\\sqrt{1+[f'(x)]^2}"),
      texte(", à partir de "),
      latex("f'(x)"),
      texte(" confirmé à l'étape précédente."),
    ];
  }
  return [texte(`Calcule la longueur L de l'arc, à partir de la forme simplifiée confirmée à l'étape précédente. ${CONSIGNE_PRECISION}`)];
}
export function etatActuelA(exercice: ExerciceLongueurArcA, phase: PhaseLongueurArc): string[] | null {
  const lignes: string[] = [];
  if (phase === "aEcran2" || phase === "aEcran3") lignes.push(`f'(x)=${formuleFPrimeA(exercice)}`);
  if (phase === "aEcran3") lignes.push(`\\sqrt{1+[f'(x)]^2}=${formuleRacineSimplifieeA(exercice)}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsA(phase: PhaseLongueurArc): ChampDef[] {
  if (phase === "aEcran1") return [{ type: "texte", label: "f'(x) =", placeholder: "ex : x^5 - 2/x" }];
  if (phase === "aEcran2") return [{ type: "texte", label: "√(1 + [f'(x)]²) simplifiée =", placeholder: "ex : (x^2 + 3)/x" }];
  return [{ type: "texte", label: "L =", placeholder: "ex : 31/7" }];
}
export function niveauAideMaxA(phase: PhaseLongueurArc): number {
  return phase === "aEcran2" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseLongueurArc): AideAvecLatex {
  if (phase === "aEcran2")
    return { texte: "Dans un exercice de longueur d'arc, l'expression sous la racine est souvent construite pour être un carré parfait : développe-la, puis cherche à la regrouper sous la forme suivante.", latex: "1+[f'(x)]^2=\\left(\\ldots\\right)^2" };
  return AUCUNE_AIDE;
}
export function aideNiveau2A(exercice: ExerciceLongueurArcA, phase: PhaseLongueurArc): AideAvecLatex {
  if (phase === "aEcran2") return { texte: "Développement du carré de f'(x) (le regroupement final reste à faire) :", latex: `[f'(x)]^2=${formuleFPrimeCarreDeveloppeA(exercice)}` };
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille B — substitution t = √(x² + k²), puis éléments simples (pour aller plus loin).
// ============================================================================

function formuleFB(k: number): string {
  return k === 1 ? "\\ln(x)" : `${k}\\ln(x)`;
}
export function formuleIntegrandeEnTB(k: number): string {
  return `\\dfrac{t^{2}}{t^{2}-${k * k}}`;
}
export function formulePrimitiveEnTB(k: number): string {
  return `t+\\dfrac{${k}}{2}\\ln\\left|\\dfrac{t-${k}}{t+${k}}\\right|`;
}
/** Borne en x de la famille B, simplifiée : a = √(t₁² − k²) (√16 → 4, √12 → 2√3) — audit point 19. */
export function borneBLatex(t: number, k: number): string {
  return racineLatex(t * t - k * k);
}

/** L = (t₂ − t₁) + (k/2)·ln(q), q = [(t₂ − k)(t₁ + k)] / [(t₂ + k)(t₁ − k)] > 1. */
function longueurExacteBLatex(exercice: ExerciceLongueurArcB): string {
  const { k, t1, t2 } = exercice;
  const q = fractionLatex((t2 - k) * (t1 + k), (t2 + k) * (t1 - k));
  const ln = q.includes("dfrac") ? `\\ln\\left(${q}\\right)` : `\\ln(${q})`;
  const coef = k === 2 ? "" : k % 2 === 0 ? `${k / 2}` : `\\dfrac{${k}}{2}`;
  return `${t2 - t1}+${coef}${ln}`;
}

export function consigneGeneraleB(): FragmentConsigne[] {
  return CONSIGNE_GENERALE_COMMUNE;
}
export function blocDonneesB(exercice: ExerciceLongueurArcB): string[] {
  return [`f(x)=${formuleFB(exercice.k)}`, `a=${borneBLatex(exercice.t1, exercice.k)}\\text{, }b=${borneBLatex(exercice.t2, exercice.k)}`];
}
export function consigneEcranB(exercice: ExerciceLongueurArcB, phase: PhaseLongueurArc): FragmentConsigne[] {
  const k2 = exercice.k * exercice.k;
  if (phase === "bEcran1") {
    return [
      texte("Pose "),
      latex(`t=\\sqrt{x^2+${k2}}`),
      texte(" et calcule les deux valeurs de t qui correspondent aux bornes "),
      latex("x=a"),
      texte(" et "),
      latex("x=b"),
      texte("."),
    ];
  }
  if (phase === "bEcran2") {
    return [
      texte("Exprime "),
      latex("x\\,dx"),
      texte(" en fonction de "),
      latex("t\\,dt"),
      texte(" (dérive "),
      latex(`t^2=x^2+${k2}`),
      texte("), puis réécris l'intégrale en fonction de t uniquement : donne la fonction à intégrer."),
    ];
  }
  if (phase === "bEcran3") {
    return [texte("Calcule une primitive de cette fonction de t, en l'écrivant "), latex(`1+\\dfrac{${k2}}{t^2-${k2}}`), texte(" puis en décomposant la fraction en éléments simples.")];
  }
  return [texte(`Évalue la primitive entre les bornes en t confirmées à l'étape 1. ${CONSIGNE_PRECISION}`)];
}
export function etatActuelB(exercice: ExerciceLongueurArcB, phase: PhaseLongueurArc): string[] | null {
  const bornesT = `t_1=${exercice.t1}\\text{, }t_2=${exercice.t2}`;
  const lignes: string[] = [];
  if (phase === "bEcran2" || phase === "bEcran3" || phase === "bEcran4") lignes.push(bornesT);
  if (phase === "bEcran3" || phase === "bEcran4") lignes.push(`L=\\displaystyle\\int_{${exercice.t1}}^{${exercice.t2}}${formuleIntegrandeEnTB(exercice.k)}\\,dt`);
  if (phase === "bEcran4") lignes.push(`\\text{Primitive : }${formulePrimitiveEnTB(exercice.k)}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsB(phase: PhaseLongueurArc): ChampDef[] {
  if (phase === "bEcran1")
    return [
      { type: "texte", label: "t (en x = a) =", placeholder: "ex : 11" },
      { type: "texte", label: "t (en x = b) =", placeholder: "ex : 12" },
    ];
  if (phase === "bEcran2") return [{ type: "texte", label: "Fonction de t à intégrer =", placeholder: "ex : 2t/(t+5)" }];
  if (phase === "bEcran3") return [{ type: "texte", label: "Primitive en t =", placeholder: "ex : t^2 + 3ln(t)" }];
  return [{ type: "texte", label: "L =", placeholder: "ex : 17/7" }];
}
export function niveauAideMaxB(phase: PhaseLongueurArc): number {
  return phase === "bEcran1" || phase === "bEcran3" ? 2 : 0;
}
export function aideNiveau1B(exercice: ExerciceLongueurArcB, phase: PhaseLongueurArc): AideAvecLatex {
  const k = exercice.k;
  const k2 = k * k;
  if (phase === "bEcran1") return { texte: "Remplace x par chacune des deux bornes dans la relation suivante :", latex: `t=\\sqrt{x^2+${k2}}` };
  if (phase === "bEcran3")
    return {
      texte: "Éléments simples : t² − k² = (t − k)(t + k), donc on cherche deux nombres A et B tels que :",
      latex: `\\dfrac{${k2}}{t^2-${k2}}=\\dfrac{A}{t-${k}}+\\dfrac{B}{t+${k}}`,
    };
  return AUCUNE_AIDE;
}
export function aideNiveau2B(exercice: ExerciceLongueurArcB, phase: PhaseLongueurArc): AideAvecLatex {
  const k = exercice.k;
  const k2 = k * k;
  if (phase === "bEcran1") return { texte: "Pour la borne a (calcul à terminer) :", latex: `t_1=\\sqrt{\\left(${borneBLatex(exercice.t1, k)}\\right)^2+${k2}}` };
  if (phase === "bEcran3") {
    const coef = k === 2 ? "" : k % 2 === 0 ? `${k / 2}` : `\\dfrac{${k}}{2}`;
    return {
      texte: "En réduisant au même dénominateur, on trouve A = k/2 et B = −k/2. Il reste à primitiver chaque terme (forme u′/u) :",
      latex: `\\dfrac{${k2}}{t^2-${k2}}=${coef}\\left(\\dfrac{1}{t-${k}}-\\dfrac{1}{t+${k}}\\right)`,
    };
  }
  return AUCUNE_AIDE;
}

// ============================================================================
// Famille C — √(1 + kx), substitution directe (f(x) = c·x^{3/2}).
// ============================================================================

export function kLatexC(exercice: ExerciceLongueurArcC): string {
  return fractionLatex(exercice.kNum, exercice.kDen);
}
export function unPlusKxLatex(exercice: ExerciceLongueurArcC): string {
  const k = kLatexC(exercice);
  return `1+${k === "1" ? "" : k}x`;
}
/** Coefficient 2/(3k) de la primitive (2/(3k))·(1 + kx)^{3/2}. */
export function coefPrimitiveC(exercice: ExerciceLongueurArcC): string {
  return fractionLatex(2 * exercice.kDen, 3 * exercice.kNum);
}
export function formuleFC(exercice: ExerciceLongueurArcC): string {
  const c = fractionLatex(exercice.cNum, exercice.cDen);
  return `${c === "1" ? "" : c}x^{3/2}`;
}

export function consigneGeneraleC(): FragmentConsigne[] {
  return CONSIGNE_GENERALE_COMMUNE;
}
export function blocDonneesC(exercice: ExerciceLongueurArcC): string[] {
  return [`f(x)=${formuleFC(exercice)}`, `a=${exercice.a}\\text{, }b=${exercice.b}`];
}
export function consigneEcranC(phase: PhaseLongueurArc): FragmentConsigne[] {
  if (phase === "cEcran1") return [texte("Calcule "), latex("f'(x)"), texte(", puis "), latex("1+[f'(x)]^2"), texte(".")];
  if (phase === "cEcran2") {
    return [texte("Calcule une primitive de "), latex("\\sqrt{1+[f'(x)]^2}"), texte(", à partir de la forme confirmée à l'étape précédente (substitution "), latex("u=1+[f'(x)]^2"), texte(").")];
  }
  return [texte("Évalue la primitive entre les bornes "), latex("a"), texte(" et "), latex("b"), texte(`. ${CONSIGNE_PRECISION}`)];
}
export function etatActuelC(exercice: ExerciceLongueurArcC, phase: PhaseLongueurArc): string[] | null {
  const lignes: string[] = [];
  if (phase === "cEcran2" || phase === "cEcran3") lignes.push(`1+[f'(x)]^2=${unPlusKxLatex(exercice)}`);
  if (phase === "cEcran3") lignes.push(`\\text{Primitive : }${coefPrimitiveC(exercice)}\\left(${unPlusKxLatex(exercice)}\\right)^{3/2}`);
  return lignes.length > 0 ? lignes : null;
}
export function champsC(phase: PhaseLongueurArc): ChampDef[] {
  if (phase === "cEcran1") return [{ type: "texte", label: "1 + [f'(x)]² =", placeholder: "ex : 1 + 5x" }];
  if (phase === "cEcran2") return [{ type: "texte", label: "Primitive de √(1 + [f'(x)]²) =", placeholder: "ex : 2x^3 + 7x" }];
  return [{ type: "texte", label: "L =", placeholder: "ex : 31/7" }];
}
export function niveauAideMaxC(phase: PhaseLongueurArc): number {
  return phase === "cEcran2" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseLongueurArc): AideAvecLatex {
  if (phase === "cEcran2") return { texte: "Racine d'une expression du premier degré : une primitive de √(ax + b) se trouve avec la règle des composées affines :", latex: "\\int\\sqrt{u}\\,dx=\\dfrac{1}{a}\\cdot\\dfrac{2}{3}u^{3/2}+C\\quad(u=ax+b)" };
  return AUCUNE_AIDE;
}
export function aideNiveau2C(exercice: ExerciceLongueurArcC, phase: PhaseLongueurArc): AideAvecLatex {
  if (phase === "cEcran2") return { texte: "Substitution posée (l'intégration reste à faire) :", latex: `u=${unPlusKxLatex(exercice)}\\text{, }du=${kLatexC(exercice)}\\,dx` };
  return AUCUNE_AIDE;
}
// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceLongueurArc): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA();
    case "B":
      return consigneGeneraleB();
    case "C":
      return consigneGeneraleC();
  }
}

export function blocDonnees(exercice: ExerciceLongueurArc): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
  }
}

export function consigneEcran(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(phase);
  }
}

export function etatActuel(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
  }
}

export function champsEcran(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): ChampDef[] {
  switch (exercice.famille) {
    case "A":
      return champsA(phase);
    case "B":
      return champsB(phase);
    case "C":
      return champsC(phase);
  }
}

export function niveauAideMaxEcran(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(phase);
    case "C":
      return niveauAideMaxC(phase);
  }
}

export function aideNiveau1(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(exercice, phase);
    case "C":
      return aideNiveau1C(phase);
  }
}

export function aideNiveau2(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(exercice, phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseLongueurArc, string> = {
  aEcran1: "Étape 1 (f′(x))",
  aEcran2: "Étape 2 (racine simplifiée)",
  aEcran3: "Étape 3 (longueur)",
  bEcran1: "Étape 1 (bornes en t)",
  bEcran2: "Étape 2 (intégrale en t)",
  bEcran3: "Étape 3 (primitive en t)",
  bEcran4: "Étape 4 (longueur)",
  cEcran1: "Étape 1 (1 + [f′(x)]²)",
  cEcran2: "Étape 2 (primitive)",
  cEcran3: "Étape 3 (longueur)",
};

export const LIBELLE_FAMILLE: Record<ExerciceLongueurArc["famille"], string> = {
  A: "A — Racine parfaite par construction",
  B: "Pour aller plus loin — B — Substitution t = √(x² + k²) et éléments simples",
  C: "C — Racine d'une expression du premier degré",
};

/** Récapitulatif : toujours la réponse CORRECTE connue de l'exercice — valeurs exactes puis
 * approchées (audit point 16). */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceLongueurArc, phase: PhaseLongueurArc): string[] {
  if (exercice.famille === "A") {
    if (phase === "aEcran1") return [`f'(x)=${formuleFPrimeA(exercice)}`];
    if (phase === "aEcran2") return [`\\sqrt{1+[f'(x)]^2}=${formuleRacineSimplifieeA(exercice)}`];
    const longueur = exercice.primitiveReference(exercice.b) - exercice.primitiveReference(exercice.a);
    return [longueurLatex(longueur, longueurExacteALatex(exercice))];
  }
  if (exercice.famille === "B") {
    if (phase === "bEcran1") return [`t_1=${exercice.t1}\\text{, }t_2=${exercice.t2}`];
    if (phase === "bEcran2") return [formuleIntegrandeEnTB(exercice.k)];
    if (phase === "bEcran3") return [formulePrimitiveEnTB(exercice.k)];
    const longueur = exercice.primitiveEnTReference(exercice.t2) - exercice.primitiveEnTReference(exercice.t1);
    return [longueurLatex(longueur, longueurExacteBLatex(exercice))];
  }
  if (phase === "cEcran1") return [`1+[f'(x)]^2=${unPlusKxLatex(exercice)}`];
  if (phase === "cEcran2") return [`${coefPrimitiveC(exercice)}\\left(${unPlusKxLatex(exercice)}\\right)^{3/2}`];
  const longueur = exercice.primitiveReference(exercice.b) - exercice.primitiveReference(exercice.a);
  return [longueurLatex(longueur)];
}
