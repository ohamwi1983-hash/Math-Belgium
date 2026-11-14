import type { ExerciceIntegraleGraphique, ExerciceProprietesIntegrale, Morceau } from "../core6e/integraleGraphique.types";
import type { PhaseIntegraleGraphique } from "../moteur6e/typesIntegraleGraphique";
import {
  abscissesAttendues,
  aireTotale,
  integraleMorceau,
  integraleTotale,
  intervallesSigne,
  signeMorceau,
  valeurDonnee,
  valeursAttendues,
} from "../moteur6e/verificationIntegraleGraphique";
import type { ValeurExacte } from "../moteur6e/verificationIntegraleGraphique";

/**
 * Couche C (6e) — textes de `6gen77` « L'intégrale lue sur un graphique (aire signée) ». SOURCE
 * UNIQUE des consignes, aides, champs et réponses attendues : l'écran, le récapitulatif et
 * l'adaptateur de feuilles (`generateurs6e/integraleGraphique/exportEvaluation.ts`) en dérivent.
 *
 * Règles permanentes : aucune formule écrite au clavier dans un texte visible (les formules vont en
 * LaTeX), « − » typographique, jamais de prose en mode math, aides qui laissent toujours un calcul à
 * faire.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  /** Libellé texte (ex. « Aire de la région ») — ou `labelLatex` pour une intégrale. */
  label?: string;
  labelLatex?: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

export interface OptionAbscisse {
  valeur: string;
  label: string;
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Écriture des nombres exacts.
// ============================================================================

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Rationnel n/4 en LaTeX (`\dfrac{7}{2}`, `-3`, `0`). */
function rationnelLatex(n4: number): string {
  if (n4 === 0) return "0";
  const g = pgcd(n4, 4);
  const n = n4 / g;
  const d = 4 / g;
  const signe = n < 0 ? "-" : "";
  return d === 1 ? `${signe}${Math.abs(n)}` : `${signe}\\dfrac{${Math.abs(n)}}{${d}}`;
}

/** Multiple p4/4 de π en LaTeX, SANS signe (`\pi`, `2\pi`, `\dfrac{9\pi}{4}`). */
function piAbsLatex(p4: number): string {
  const g = pgcd(p4, 4);
  const n = Math.abs(p4 / g);
  const d = 4 / g;
  const num = n === 1 ? "\\pi" : `${n}\\pi`;
  return d === 1 ? num : `\\dfrac{${num}}{${d}}`;
}

/** Valeur exacte q + p·π en LaTeX (`3-\dfrac{\pi}{2}`, `-2\pi`, `\dfrac{5}{2}`). */
export function exactLatex(v: ValeurExacte): string {
  if (v.p4 === 0) return rationnelLatex(v.q4);
  const pi = piAbsLatex(v.p4);
  if (v.q4 === 0) return `${v.p4 < 0 ? "-" : ""}${pi}`;
  return `${rationnelLatex(v.q4)}${v.p4 < 0 ? "-" : "+"}${pi}`;
}

/** Même valeur entre parenthèses si elle est négative ou composée (pour l'écrire dans une somme). */
export function exactDansSomme(v: ValeurExacte): string {
  const s = exactLatex(v);
  return s.startsWith("-") || (v.q4 !== 0 && v.p4 !== 0) ? `\\left(${s}\\right)` : s;
}

/** Texte brut (figures SVG) : « 7/2 », « −π/2 », « 3 − 2π ». */
export function exactTexte(v: ValeurExacte): string {
  const rat = (n4: number) => {
    const g = pgcd(n4, 4);
    const n = n4 / g;
    const d = 4 / g;
    return d === 1 ? `${Math.abs(n)}` : `${Math.abs(n)}/${d}`;
  };
  const pi = (p4: number) => {
    const g = pgcd(p4, 4);
    const n = Math.abs(p4 / g);
    const d = 4 / g;
    return `${n === 1 ? "" : n}π${d === 1 ? "" : `/${d}`}`;
  };
  if (v.p4 === 0) return v.q4 === 0 ? "0" : `${v.q4 < 0 ? "−" : ""}${rat(v.q4)}`;
  if (v.q4 === 0) return `${v.p4 < 0 ? "−" : ""}${pi(v.p4)}`;
  return `${v.q4 < 0 ? "−" : ""}${rat(v.q4)} ${v.p4 < 0 ? "−" : "+"} ${pi(v.p4)}`;
}

export function nombreLatex(x: number): string {
  return `${x}`;
}

export function intervalleLatex(x0: number, x1: number): string {
  return `\\left[${x0}\\,;${x1}\\right]`;
}

export function integraleLatex(borneInf: number, borneSup: number): string {
  return `\\displaystyle\\int_{${borneInf}}^{${borneSup}} f(x)\\,dx`;
}

function texteNombre(x: number): string {
  return `${x}`.replace("-", "−");
}

// ============================================================================
// Figures simples (noms, formules) — pour les aides et le corrigé.
// ============================================================================

export function nomFigure(m: Morceau): string {
  if (m.type === "demiDisque") return "un demi-disque";
  if (m.type === "quartDisque") return "un quart de disque";
  if (m.y0 === m.y1) return "un rectangle";
  if (m.y0 === 0 || m.y1 === 0) return "un triangle";
  return "un trapèze";
}

export function positionFigure(m: Morceau): string {
  return signeMorceau(m) > 0 ? "au-dessus de l'axe" : "sous l'axe";
}

/** Calcul de l'aire d'un morceau, posé avec ses dimensions (ex. `\dfrac{(2+3)\times 2}{2}=5`). */
export function calculAireLatex(m: Morceau): string {
  const aire = exactLatex({ ...integraleMorceau(m), q4: Math.abs(integraleMorceau(m).q4), p4: Math.abs(integraleMorceau(m).p4) });
  if (m.type === "demiDisque") return `\\dfrac{\\pi\\times ${m.r}^2}{2}=${aire}`;
  if (m.type === "quartDisque") return `\\dfrac{\\pi\\times ${m.r}^2}{4}=${aire}`;
  const w = m.x1 - m.x0;
  const h0 = Math.abs(m.y0);
  const h1 = Math.abs(m.y1);
  if (h0 === h1) return `${w}\\times ${h0}=${aire}`;
  if (h0 === 0 || h1 === 0) return `\\dfrac{${w}\\times ${Math.max(h0, h1)}}{2}=${aire}`;
  return `\\dfrac{(${Math.max(h0, h1)}+${Math.min(h0, h1)})\\times ${w}}{2}=${aire}`;
}

/** Formules d'aire des figures présentes dans la liste de morceaux (aide de niveau 1). */
function formulesPresentes(morceaux: Morceau[]): { texte: string; latex: string } {
  const noms: string[] = [];
  const formules: string[] = [];
  const ajouter = (nom: string, f: string) => {
    if (!noms.includes(nom)) {
      noms.push(nom);
      formules.push(f);
    }
  };
  for (const m of morceaux) {
    const n = nomFigure(m);
    if (n === "un rectangle") ajouter("rectangle", "\\mathcal{A}=L\\times \\ell");
    else if (n === "un triangle") ajouter("triangle", "\\mathcal{A}=\\dfrac{b\\times h}{2}");
    else if (n === "un trapèze") ajouter("trapèze", "\\mathcal{A}=\\dfrac{(B+b)\\times h}{2}");
    else if (n === "un demi-disque") ajouter("demi-disque", "\\mathcal{A}=\\dfrac{\\pi r^2}{2}");
    else ajouter("quart de disque", "\\mathcal{A}=\\dfrac{\\pi r^2}{4}");
  }
  return { texte: `Aires utiles (${noms.join(", ")}), comptées négativement sous l'axe :`, latex: formules.join("\\qquad ") };
}

function listeFigures(morceaux: Morceau[]): string {
  return morceaux.map((m) => `${nomFigure(m)} ${positionFigure(m)}`).join(", ");
}

// ============================================================================
// Libellés, consigne générale, données.
// ============================================================================

export function bornes(e: ExerciceIntegraleGraphique): { a: number; b: number } {
  return e.variante === "proprietes" ? { a: e.c, b: e.d } : { a: e.a, b: e.b };
}

/** Intégrale de la partie inconnue, écrite avec ses bornes dans l'ordre croissant. */
export function bornesInconnue(e: ExerciceProprietesIntegrale): [number, number] {
  return e.cote === "gauche" ? [e.lointaine, e.c] : [e.d, e.lointaine];
}

/** Grand intervalle de l'intégrale donnée. */
export function bornesDonnee(e: ExerciceProprietesIntegrale): [number, number] {
  return e.cote === "gauche" ? [e.lointaine, e.d] : [e.c, e.lointaine];
}

/** Intégrale demandée à la fin (bornes inversées de la partie inconnue). */
export function bornesInversees(e: ExerciceProprietesIntegrale): [number, number] {
  const [x0, x1] = bornesInconnue(e);
  return [x1, x0];
}

export function libellePhase(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): string {
  if (e.variante === "calcul") return phase === "ecran1" ? "Découpe" : phase === "ecran2" ? "Intégrale de chaque morceau" : "Intégrale sur [a ; b]";
  if (e.variante === "aireIntegrale") return phase === "ecran1" ? "Changements de signe" : phase === "ecran2" ? "Intégrale par intervalle" : "Intégrale et aire";
  return phase === "ecran1" ? "Lecture sur le graphique" : phase === "ecran2" ? "Additivité" : "Bornes inversées";
}

export function consigneGenerale(e: ExerciceIntegraleGraphique): FragmentConsigne[] {
  const quad = " (une case du quadrillage mesure une unité)";
  if (e.variante === "proprietes") {
    const [g, d] = bornesDonnee(e);
    return [
      t("On ne connaît la courbe de "),
      l("f"),
      t(" que sur "),
      l(intervalleLatex(e.c, e.d)),
      t(`${quad}. On sait de plus que `),
      l(`${integraleLatex(g, d)}=${exactLatex(valeurDonnee(e))}`),
      t("."),
    ];
  }
  const { a, b } = bornes(e);
  const debut = [t("La courbe ci-dessous représente une fonction "), l("f"), t(" sur "), l(intervalleLatex(a, b)), t(`${quad}. Sans chercher de primitive, `)];
  if (e.variante === "calcul") return [...debut, t("calcule "), l(integraleLatex(a, b)), t(" à l'aide d'aires de figures simples.")];
  return [
    ...debut,
    t("compare l'intégrale "),
    l(integraleLatex(a, b)),
    t(" et l'aire de la région comprise entre la courbe de "),
    l("f"),
    t(", l'axe des abscisses et les droites "),
    l(`x=${a}`),
    t(" et "),
    l(`x=${b}`),
    t("."),
  ];
}

const PRECISION = " Donne la valeur exacte (fraction, π si nécessaire).";

export function consigneEcran(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): FragmentConsigne[] {
  const { a, b } = bornes(e);
  if (e.variante === "calcul") {
    if (phase === "ecran1") {
      return [
        t("Découpe "),
        l(intervalleLatex(a, b)),
        t(
          " à chaque sommet de la courbe (point où elle change de direction, début ou fin d'un arc de cercle) et à chaque point où elle traverse l'axe des abscisses : chaque morceau est alors une figure simple (rectangle, triangle, trapèze, portion de disque) d'un seul signe. Sélectionne toutes ces abscisses (un seul essai).",
        ),
      ];
    }
    if (phase === "ecran2") return [t("Calcule l'intégrale de "), l("f"), t(" sur chaque morceau : l'aire de la figure, comptée négativement si elle est sous l'axe." + PRECISION)];
    return [t("Déduis-en "), l(integraleLatex(a, b)), t("." + PRECISION)];
  }
  if (e.variante === "aireIntegrale") {
    if (phase === "ecran1") return [t("Sélectionne les abscisses de "), l(`\\mathopen{]}${a}\\,;${b}\\mathclose{[}`), t(" où "), l("f"), t(" change de signe (un seul essai).")];
    if (phase === "ecran2") return [t("Calcule l'intégrale de "), l("f"), t(" sur chaque intervalle où "), l("f"), t(" garde un signe constant." + PRECISION)];
    return [t("Donne l'intégrale "), l(integraleLatex(a, b)), t(" puis l'aire de la région (en unités d'aire)." + PRECISION.replace("la valeur exacte", "les valeurs exactes"))];
  }
  const [g, d] = bornesInconnue(e);
  if (phase === "ecran1") return [t("Lis sur le graphique "), l(integraleLatex(e.c, e.d)), t(", à l'aide d'aires de figures simples." + PRECISION)];
  if (phase === "ecran2") return [t("Utilise l'additivité (relation de Chasles) pour calculer "), l(integraleLatex(g, d)), t("." + PRECISION)];
  const [hi, lo] = bornesInversees(e);
  return [t("Déduis-en "), l(integraleLatex(hi, lo)), t("." + PRECISION)];
}

/** Options de l'écran de choix : toutes les abscisses entières strictement entre a et b. */
export function optionsAbscisses(e: ExerciceIntegraleGraphique): OptionAbscisse[] {
  const { a, b } = bornes(e);
  const res: OptionAbscisse[] = [];
  for (let x = a + 1; x < b; x++) res.push({ valeur: `${x}`, label: `x\u00a0=\u00a0${texteNombre(x)}` });
  return res;
}

const PLACEHOLDER = "ex : 7/2 − π";

export function champsEcran(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): ChampDef[] {
  if (e.variante === "calcul") {
    const { a, b } = bornes(e);
    if (phase === "ecran2") return e.morceaux.map((m) => ({ labelLatex: integraleLatex(m.x0, m.x1), placeholder: PLACEHOLDER }));
    return [{ labelLatex: integraleLatex(a, b), placeholder: PLACEHOLDER }];
  }
  if (e.variante === "aireIntegrale") {
    const { a, b } = bornes(e);
    if (phase === "ecran2") return intervallesSigne(e).map((i) => ({ labelLatex: integraleLatex(i.x0, i.x1), placeholder: PLACEHOLDER }));
    return [
      { labelLatex: integraleLatex(a, b), placeholder: PLACEHOLDER },
      { label: "Aire de la région (u.a.)", placeholder: PLACEHOLDER },
    ];
  }
  if (phase === "ecran1") return [{ labelLatex: integraleLatex(e.c, e.d), placeholder: PLACEHOLDER }];
  if (phase === "ecran2") {
    const [g, d] = bornesInconnue(e);
    return [{ labelLatex: integraleLatex(g, d), placeholder: PLACEHOLDER }];
  }
  const [hi, lo] = bornesInversees(e);
  return [{ labelLatex: integraleLatex(hi, lo), placeholder: PLACEHOLDER }];
}

// ============================================================================
// Réponses attendues (récapitulatif, validation, corrigé).
// ============================================================================

export function formatReponseAttenduePhaseLatex(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): string[] {
  if (phase === "ecran1" && e.variante !== "proprietes") {
    return [abscissesAttendues(e).map((x) => `x=${x}`).join("\\;;\\;")];
  }
  const valeurs = valeursAttendues(e, phase);
  const champs = champsEcran(e, phase);
  return valeurs.map((v, i) => {
    const nom = champs[i].labelLatex ?? "\\mathcal{A}";
    return `${nom}=${exactLatex(v)}`;
  });
}

// ============================================================================
// Aides (deux niveaux ; jamais la réponse finale).
// ============================================================================

export function aideNiveau1(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): AideAvecLatex {
  const { a, b } = bornes(e);
  if (e.variante === "calcul") {
    if (phase === "ecran1") return { texte: "Parcours la courbe de gauche à droite : coupe à chaque coin, à chaque bout d'arc de cercle, et là où la courbe passe d'un côté à l'autre de l'axe, même en ligne droite. Un morceau ne doit jamais être à cheval sur l'axe." };
    if (phase === "ecran2") return formulesPresentes(e.morceaux);
    return {
      texte: "Par additivité, l'intégrale sur tout l'intervalle est la somme des intégrales des morceaux (notées dans l'ordre), avec leur signe :",
      latex: `${integraleLatex(a, b)}=${e.morceaux.map((_, i) => `I_{${i + 1}}`).join("+")}`,
    };
  }
  if (e.variante === "aireIntegrale") {
    if (phase === "ecran1") return { texte: "La fonction change de signe là où la courbe TRAVERSE l'axe des abscisses : elle passe d'au-dessus à en dessous de l'axe, ou l'inverse." };
    if (phase === "ecran2") return formulesPresentes(e.morceaux);
    return {
      texte: "L'intégrale additionne les intégrales signées des intervalles ; l'aire additionne leurs valeurs absolues (une aire est toujours positive) :",
      latex: "\\int_a^b f(x)\\,dx=I_1+I_2+\\ldots\\qquad \\mathcal{A}=|I_1|+|I_2|+\\ldots",
    };
  }
  const [g, d] = bornesInconnue(e);
  const [gd, dd] = bornesDonnee(e);
  if (phase === "ecran1") return formulesPresentes(e.morceaux);
  if (phase === "ecran2") return { texte: "Relation de Chasles : l'intégrale sur le grand intervalle est la somme des intégrales sur ses deux parties :", latex: `${integraleLatex(gd, dd)}=${e.cote === "gauche" ? `${integraleLatex(g, d)}+${integraleLatex(e.c, e.d)}` : `${integraleLatex(e.c, e.d)}+${integraleLatex(g, d)}`}` };
  const [hi, lo] = bornesInversees(e);
  return { texte: "Échanger les bornes d'une intégrale change son signe :", latex: `${integraleLatex(hi, lo)}=-${integraleLatex(lo, hi)}` };
}

export function aideNiveau2(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): AideAvecLatex {
  if (e.variante === "calcul") {
    if (phase === "ecran1") {
      const n = e.morceaux.length;
      return { texte: `Tu dois obtenir ${n} morceaux, donc ${n - 1} abscisses de découpe.` };
    }
    if (phase === "ecran2") return { texte: `Les morceaux sont, dans l'ordre : ${listeFigures(e.morceaux)}.` };
    return { texte: "Additionne en regroupant les nombres d'un côté et les multiples de π de l'autre :", latex: valeursAttendues(e, "ecran2").map(exactDansSomme).join("+") };
  }
  if (e.variante === "aireIntegrale") {
    if (phase === "ecran1") {
      const k = abscissesAttendues(e).length;
      return { texte: k === 1 ? "Il y a un seul changement de signe dans l'intervalle." : `Il y a ${k} changements de signe dans l'intervalle.` };
    }
    if (phase === "ecran2") {
      return { texte: `Sur chaque intervalle, découpe la région en figures simples : ${intervallesSigne(e).map((i) => `entre ${texteNombre(i.x0)} et ${texteNombre(i.x1)}, ${listeFigures(i.morceaux)}`).join(" ; ")}.` };
    }
    const vals = intervallesSigne(e).map((i) => i.valeur);
    return {
      texte: "Avec les intégrales de l'écran précédent :",
      latex: `\\int_{${bornes(e).a}}^{${bornes(e).b}} f(x)\\,dx=${vals.map(exactDansSomme).join("+")}\\qquad \\mathcal{A}=${vals.map((v) => `\\left|${exactLatex(v)}\\right|`).join("+")}`,
    };
  }
  if (phase === "ecran1") return { texte: `Les morceaux sont, dans l'ordre : ${listeFigures(e.morceaux)}.` };
  const [g, d] = bornesInconnue(e);
  const [gd, dd] = bornesDonnee(e);
  return { texte: "Isole l'intégrale inconnue :", latex: `${integraleLatex(g, d)}=${integraleLatex(gd, dd)}-${integraleLatex(e.c, e.d)}` };
}

export function niveauAideMaxEcran(e: ExerciceIntegraleGraphique, phase: PhaseIntegraleGraphique): number {
  return e.variante === "proprietes" && phase === "ecran3" ? 1 : 2;
}

/** Valeurs utilisées par le corrigé (réexportées pour l'adaptateur). */
export { aireTotale, integraleTotale, intervallesSigne, valeurDonnee };
