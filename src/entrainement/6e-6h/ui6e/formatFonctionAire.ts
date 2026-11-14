import type { ExerciceFonctionAire } from "../core6e/fonctionAire.types";
import type { ValeurExacte } from "../moteur6e/modeleFonctionAire";
import {
  aireExacte,
  bornesDomaine,
  candidatsExtremums,
  changementsSensF,
  extremumsA,
  intervallesSens,
  natureEn,
  pointsTableau,
  zerosChangementSigne,
  zerosInterieurs,
} from "../moteur6e/modeleFonctionAire";
import type { PhaseFonctionAire } from "../moteur6e/typesFonctionAire";
import { abscissesValeursA, intervallesAires, pentesAttendues, valeursExactesAttendues } from "../moteur6e/verificationFonctionAire";

/**
 * Couche C (6e) — textes de `6gen78` « La fonction aire ». SOURCE UNIQUE des consignes, aides,
 * options et réponses attendues : l'écran, le récapitulatif et l'adaptateur de feuilles
 * (`generateurs6e/fonctionAire/exportEvaluation.ts`) en dérivent.
 *
 * Vocabulaire du cours (sous-section « La fonction aire ») : fonction aire A(x) = ∫ₐˣ f(t) dt,
 * aire signée, A(a) = 0, A′ = f. Règles permanentes : « − » typographique, aucune formule écrite
 * au clavier, jamais de prose en mode math, aides qui ne donnent jamais la réponse.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  label: FragmentConsigne[];
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

export interface OptionChoix {
  id: string;
  fragments: FragmentConsigne[];
}

/** Une ligne d'un écran à choix fermé : libellé + options (une seule à cocher). */
export interface LigneChoix {
  label: FragmentConsigne[];
  options: OptionChoix[];
}

export const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
export const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const MESSAGE_SAISIE_ILLISIBLE = "Écriture non reconnue — vérifie ta saisie (parenthèses, opérateurs, virgule décimale). Aucune tentative n'est décomptée.";

// ============================================================================
// Écriture des nombres.
// ============================================================================

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** num/den simplifié, en LaTeX signé (« -\frac{3}{2} », « 2 »). */
export function fractionLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const g = pgcd(num, den);
  const n = Math.abs(num / g);
  const d = den / g;
  const signe = num < 0 ? "-" : "";
  return d === 1 ? `${signe}${n}` : `${signe}\\frac{${n}}{${d}}`;
}

/** Coefficient de π (quartPi/4) en LaTeX signé : « \frac{\pi}{2} », « -2\pi », « \frac{3\pi}{4} ». */
function piLatex(quartPi: number): string {
  const g = pgcd(quartPi, 4);
  const n = Math.abs(quartPi / g);
  const d = 4 / g;
  const signe = quartPi < 0 ? "-" : "";
  const num = n === 1 ? "\\pi" : `${n}\\pi`;
  return d === 1 ? `${signe}${num}` : `${signe}\\frac{${num}}{${d}}`;
}

/** Valeur exacte en LaTeX : « \frac{3}{2}+\frac{\pi}{2} », « -1-\pi », « 0 ». */
export function valeurLatex(v: ValeurExacte): string {
  const rationnel = v.demi === 0 ? "" : fractionLatex(v.demi, 2);
  if (v.quartPi === 0) return rationnel || "0";
  const pi = piLatex(v.quartPi);
  if (!rationnel) return pi;
  return `${rationnel}${pi.startsWith("-") ? pi : `+${pi}`}`;
}

/** Nombre (entier ou demi-entier) en LaTeX. */
export function nombreLatex(x: number): string {
  return fractionLatex(Math.round(x * 2), 2);
}

/** Nombre en texte, signe moins typographique (« −2 »). */
export function nombreTexte(x: number): string {
  return String(x).replace("-", "−").replace(".", ",");
}

export function intervalleLatex(u: number, v: number): string {
  return `[${nombreLatex(u)}\\,;\\,${nombreLatex(v)}]`;
}

export function integraleLatex(u: number, v: number): string {
  return `\\int_{${nombreLatex(u)}}^{${nombreLatex(v)}} f(t)\\,dt`;
}

export function aLatex(x: number): string {
  return `A(${nombreLatex(x)})`;
}

function aContientPi(e: ExerciceFonctionAire): boolean {
  return e.morceaux.some((m) => m.type === "demiDisque");
}

// ============================================================================
// Énoncé commun.
// ============================================================================

export function definitionALatex(e: ExerciceFonctionAire): string {
  return `A(x)=\\int_{${nombreLatex(e.a)}}^{x} f(t)\\,dt`;
}

export function consigneGenerale(e: ExerciceFonctionAire): FragmentConsigne[] {
  const { x0, xn } = bornesDomaine(e);
  return [
    t("La figure donne la courbe d'une fonction f continue sur "),
    l(intervalleLatex(x0, xn)),
    t(
      aContientPi(e)
        ? ", tracée sur un quadrillage d'unité 1 : ses morceaux sont des segments à extrémités entières et un demi-cercle. On étudie la fonction aire "
        : ", tracée sur un quadrillage d'unité 1 : ses morceaux sont des segments à extrémités entières. On étudie la fonction aire ",
    ),
    l(definitionALatex(e)),
    t(", définie pour "),
    l(`x\\in${intervalleLatex(x0, xn)}`),
    t("."),
  ];
}

export function blocDonnees(e: ExerciceFonctionAire): string[] {
  return [definitionALatex(e)];
}

// ============================================================================
// Écrans.
// ============================================================================

export function libellePhase(e: ExerciceFonctionAire, phase: PhaseFonctionAire): string {
  switch (phase) {
    case "aires":
      return "Aires signées";
    case "valeursA":
      return "Valeurs de A";
    case "sens":
      return "Sens de variation de A";
    case "tableau":
      return "Tableau de variations de A";
    case "nature":
      return "Extremums de A";
    case "valeursExt":
      return "Valeurs des extremums";
    case "pentes":
      return "Pentes de la courbe de A";
    case "tangente":
      return `Tangente en x = ${nombreTexte(e.points[0] ?? 0)}`;
    case "choixGraphique":
      return "Graphique de A";
  }
}

const EXACTE = " (valeur exacte";

function precision(e: ExerciceFonctionAire): string {
  return aContientPi(e) ? `${EXACTE}, π accepté).` : `${EXACTE}).`;
}

export function consigneEcran(e: ExerciceFonctionAire, phase: PhaseFonctionAire): FragmentConsigne[] {
  switch (phase) {
    case "aires":
      return [t(`Calcule chaque intégrale à l'aide des aires délimitées par la courbe de f et l'axe des abscisses : une aire située sous l'axe compte négativement${precision(e)}`)];
    case "valeursA":
      return [t(`Déduis-en les valeurs de la fonction aire A${precision(e)}`)];
    case "sens":
      return [t("Pour chaque intervalle, indique si la fonction aire A y est croissante ou décroissante (une seule réponse par ligne, une seule tentative).")];
    case "tableau":
      return [t(`Complète le tableau de variations de A : calcule A aux bornes du domaine et aux abscisses où A change de sens de variation${precision(e)}`)];
    case "nature":
      return [t("Pour chaque abscisse, indique si la fonction aire A y admet un maximum local, un minimum local ou aucun extremum (une seule réponse par ligne, une seule tentative).")];
    case "valeursExt":
      return [t(`Calcule la valeur de chaque extremum local de A${precision(e)}`)];
    case "pentes":
      return [t("Donne la pente de la tangente à la courbe de A au point d'abscisse "), l(nombreLatex(e.points[0])), t(", puis au point d'abscisse "), l(nombreLatex(e.points[1])), t(".")];
    case "tangente":
      return [t("Calcule "), l(aLatex(e.points[0])), t(", puis donne une équation de la tangente à la courbe de A au point d'abscisse "), l(nombreLatex(e.points[0])), t(` (forme y = …, valeurs exactes).`)];
    case "choixGraphique":
      return [t("Lequel de ces quatre graphiques représente la fonction aire A ? Une seule réponse, une seule tentative.")];
  }
}

export function champsEcran(e: ExerciceFonctionAire, phase: PhaseFonctionAire): ChampDef[] {
  const exemple = aContientPi(e) ? "ex. 3/2 ou 1 − π/4" : "ex. 3/2 ou −2";
  switch (phase) {
    case "aires":
      return intervallesAires(e).map(([u, v]) => ({ label: [l(`\\displaystyle ${integraleLatex(u, v)}`)], placeholder: exemple }));
    case "valeursA":
      return abscissesValeursA(e).map((x) => ({ label: [l(aLatex(x))], placeholder: exemple }));
    case "tableau":
      return pointsTableau(e).map((x) => ({ label: [l(aLatex(x))], placeholder: exemple }));
    case "valeursExt":
      return extremumsA(e).map((m) => ({ label: [l(aLatex(m.x)), t(m.nature === "max" ? " (maximum local)" : " (minimum local)")], placeholder: exemple }));
    case "pentes":
      return e.points.map((p) => ({ label: [l(`A'(${nombreLatex(p)})`)], placeholder: "ex. −3/2" }));
    case "tangente":
      return [
        { label: [l(aLatex(e.points[0]))], placeholder: exemple },
        { label: [t("Tangente : "), l("y=")], placeholder: "ex. 2x − 1/2" },
      ];
    default:
      return [];
  }
}

const OPTIONS_SENS: OptionChoix[] = [
  { id: "c", fragments: [t("↗ croissante")] },
  { id: "d", fragments: [t("↘ décroissante")] },
];

const OPTIONS_NATURE: OptionChoix[] = [
  { id: "max", fragments: [t("maximum local")] },
  { id: "min", fragments: [t("minimum local")] },
  { id: "aucun", fragments: [t("aucun extremum")] },
];

export function lignesChoix(e: ExerciceFonctionAire, phase: PhaseFonctionAire): LigneChoix[] {
  if (phase === "sens") return intervallesSens(e).map((i) => ({ label: [t("Sur "), l(intervalleLatex(i.de, i.a))], options: OPTIONS_SENS }));
  if (phase === "nature") return candidatsExtremums(e).map((x) => ({ label: [t("En "), l(`x=${nombreLatex(x)}`)], options: OPTIONS_NATURE }));
  return [];
}

export function libelleNature(n: string): string {
  return n === "max" ? "maximum local" : n === "min" ? "minimum local" : "aucun extremum";
}

// ============================================================================
// Réponses attendues.
// ============================================================================

/** Tableau de variations de A (LaTeX), avec ou sans les valeurs. */
export function tableauVariationsLatex(e: ExerciceFonctionAire, avecValeurs: boolean): string {
  const pts = pointsTableau(e);
  const colonnesX: string[] = [];
  const colonnesA: string[] = [];
  pts.forEach((x, i) => {
    colonnesX.push(nombreLatex(x));
    colonnesA.push(avecValeurs ? valeurLatex(aireExacte(e, x)) : "");
    if (i + 1 < pts.length) {
      const montee = aireExacte(e, pts[i + 1]);
      const depart = aireExacte(e, x);
      const croissante = montee.demi / 2 + (montee.quartPi * Math.PI) / 4 > depart.demi / 2 + (depart.quartPi * Math.PI) / 4;
      colonnesX.push("");
      colonnesA.push(croissante ? "\\nearrow" : "\\searrow");
    }
  });
  return `\\begin{array}{c|${"c".repeat(colonnesX.length)}}x&${colonnesX.join("&")}\\\\\\hline A(x)&${colonnesA.join("&")}\\end{array}`;
}

/** Réponse attendue d'un écran (formules LaTeX ou fragments mêlés). */
export function reponseAttendue(e: ExerciceFonctionAire, phase: PhaseFonctionAire): FragmentConsigne[] {
  const liste = (formules: string[]) => formules.flatMap((x, i) => (i === 0 ? [l(x)] : [t(" ; "), l(x)]));
  switch (phase) {
    case "aires": {
      const v = valeursExactesAttendues(e, phase);
      return liste(intervallesAires(e).map(([u, w], i) => `${integraleLatex(u, w)}=${valeurLatex(v[i])}`));
    }
    case "valeursA":
    case "tableau":
    case "valeursExt": {
      const xs = phase === "valeursA" ? abscissesValeursA(e) : phase === "tableau" ? pointsTableau(e) : extremumsA(e).map((m) => m.x);
      const v = valeursExactesAttendues(e, phase);
      const formules = xs.map((x, i) => `${aLatex(x)}=${valeurLatex(v[i])}`);
      return phase === "tableau" ? [l(tableauVariationsLatex(e, true))] : liste(formules);
    }
    case "sens":
      return [l(tableauVariationsLatex(e, false))];
    case "nature":
      return candidatsExtremums(e).flatMap((x, i) => [...(i > 0 ? [t(" ; ")] : []), t("en "), l(`x=${nombreLatex(x)}`), t(` : ${libelleNature(natureEn(e, x))}`)]);
    case "pentes": {
      const m = pentesAttendues(e);
      return liste(e.points.map((p, i) => `A'(${nombreLatex(p)})=f(${nombreLatex(p)})=${nombreLatex(m[i])}`));
    }
    case "tangente":
      return liste([`${aLatex(e.points[0])}=${valeurLatex(valeursExactesAttendues(e, phase)[0])}`, equationTangenteLatex(e)]);
    case "choixGraphique":
      return [t(`le graphique ${e.ordre.indexOf(0) + 1}`)];
  }
}

/** « y = m(x − p) + A(p) » développée : « y=2x+\frac{1}{2} ». */
export function equationTangenteLatex(e: ExerciceFonctionAire): string {
  const p = e.points[0];
  const m = pentesAttendues(e)[0];
  const ap = aireExacte(e, p);
  // ordonnée à l'origine : A(p) − m·p (m et p entiers ou demi-entiers → en demis).
  const b: ValeurExacte = { demi: ap.demi - Math.round(2 * m * p), quartPi: ap.quartPi };
  const coef = m === 0 ? "" : m === 1 ? "x" : m === -1 ? "-x" : `${nombreLatex(m)}x`;
  const cst = valeurLatex(b);
  if (!coef) return `y=${cst}`;
  if (cst === "0") return `y=${coef}`;
  return `y=${coef}${cst.startsWith("-") ? cst : `+${cst}`}`;
}

// ============================================================================
// Aides (jamais la réponse finale).
// ============================================================================

function listeZerosLatex(zs: number[]): string {
  return zs.map((z) => `x=${nombreLatex(z)}`).join("\\qquad ");
}

export function aideNiveau1(e: ExerciceFonctionAire, phase: PhaseFonctionAire): AideAvecLatex {
  switch (phase) {
    case "aires":
      return { texte: "Découpe la région entre la courbe et l'axe en triangles, trapèzes ou demi-disques ; l'intégrale vaut l'aire au-dessus de l'axe moins l'aire en dessous. Aires d'un triangle, d'un trapèze et d'un demi-disque :", latex: "\\frac{b\\cdot h}{2}\\qquad\\frac{(B+b)\\cdot h}{2}\\qquad\\frac{\\pi r^{2}}{2}" };
    case "valeursA":
    case "tableau":
    case "valeursExt":
    case "tangente": {
      const x = phase === "tangente" ? e.points[0] : phase === "valeursA" ? e.points[e.points.length - 1] : phase === "tableau" ? pointsTableau(e)[pointsTableau(e).length - 1] : extremumsA(e)[0].x;
      return { texte: "A(x) est l'aire signée accumulée sous la courbe de f, de a jusqu'à x ; par additivité, on peut la découper aux sommets de la courbe :", latex: `${aLatex(x)}=${integraleLatex(e.a, x)}` };
    }
    case "sens":
      return { texte: "La fonction aire est une primitive de f (théorème fondamental) : sa dérivée est f.", latex: "A'(x)=f(x)" };
    case "nature":
      return { texte: "A′ = f : la fonction aire admet un extremum local là où sa dérivée f change de signe.", latex: "A'(x)=f(x)" };
    case "pentes":
      return { texte: "La pente de la tangente au point d'abscisse p est le nombre dérivé A′(p) ; or la fonction aire est une primitive de f :", latex: "A'(x)=f(x)" };
    case "choixGraphique":
      return { texte: "La courbe de A passe par le point (a ; 0), monte là où f est positive et descend là où f est négative." };
  }
}

export function aideNiveau2(e: ExerciceFonctionAire, phase: PhaseFonctionAire): AideAvecLatex {
  const zeros = zerosChangementSigne(e);
  switch (phase) {
    case "aires":
      return { texte: "Coupe chaque intervalle aux abscisses où f change de signe, puis additionne les morceaux avec leur signe. Ici, f change de signe en :", latex: listeZerosLatex(zeros) };
    case "valeursA":
      if (e.points.some((p) => p < e.a)) return { texte: "Pour x < a, les bornes sont dans l'ordre inverse : change le signe de l'intégrale.", latex: "\\int_a^x f(t)\\,dt=-\\int_x^a f(t)\\,dt" };
      return { texte: "Une intégrale dont les deux bornes sont égales est l'aire d'une bande de largeur nulle ; pour les autres valeurs, additionne les intégrales de l'écran précédent, de proche en proche depuis a." };
    case "tableau":
    case "valeursExt": {
      const xs = phase === "tableau" ? pointsTableau(e) : extremumsA(e).map((m) => m.x);
      if (xs.some((x) => x < e.a)) return { texte: "À gauche de a, les bornes sont dans l'ordre inverse : change le signe de l'intégrale.", latex: "\\int_a^x f(t)\\,dt=-\\int_x^a f(t)\\,dt" };
      return { texte: "Additionne les aires signées de proche en proche, depuis a, en t'arrêtant à chaque abscisse demandée. N'oublie pas la valeur de A en a lui-même." };
    }
    case "sens":
      return { texte: "C'est le SIGNE de f qui décide, pas son sens de variation : là où f est positive (même si elle décroît), A croît ; là où f est négative (même si elle croît), A décroît." };
    case "nature": {
      const contact = zerosInterieurs(e).some((z) => !z.changeSigne);
      const extremumsF = changementsSensF(e).length > 0;
      return {
        texte: `Si f passe de positive à négative, A passe de croissante à décroissante : maximum local ; de négative à positive : minimum local.${contact ? " Un zéro où f ne change pas de signe ne donne pas d'extremum." : ""}${extremumsF ? " Un sommet « pic » de la courbe de f n'est pas un extremum de A : seul le signe de f compte." : ""}`,
      };
    }
    case "pentes":
      return { texte: "Lis donc l'ordonnée du point de la courbe de f (et non une aire) :", latex: `A'(${nombreLatex(e.points[0])})=f(${nombreLatex(e.points[0])})` };
    case "tangente":
      return { texte: "Équation de la tangente à la courbe de A au point d'abscisse p, avec A′(p) = f(p) :", latex: "y=A'(p)\\,(x-p)+A(p)" };
    case "choixGraphique":
      return { texte: "Ses extremums sont aux abscisses où f change de signe :", latex: listeZerosLatex(zeros) };
  }
}
