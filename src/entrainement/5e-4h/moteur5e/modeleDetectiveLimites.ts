import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { ExerciceDetectiveLimites, VarianteDetectiveLimites } from "../core5e/detectiveLimites.types";
import type { AideEcran, Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { Cible } from "../ui5e/ecrituresLimitesLotG";
import { coefX, fracL, limL, MOINS, parL, PLUS, plusL, pointC, polyL } from "../ui5e/ecrituresLimitesLotG";

/**
 * Modèle de `5gen67` « Détective d'erreurs : limites » : à partir des paramètres entiers du
 * scénario, la copie de l'élève fictif (cohérente avec SON erreur), la ligne fausse, la bonne
 * description, la valeur corrigée (écran 3) et le contenu du corrigé détaillé (contrôle de la ligne,
 * règle, résolution reprise). Une seule source pour l'écran, le papier et le corrigé. Même contrat
 * que 5gen58 / 6gen152 (copie canonique + lignes justes préliminaires ; `av` lignes justes avant la
 * ligne fausse).
 */

type E = ExerciceDetectiveLimites;
const t = tx;
const l = lx;
const ft = texte;
const fl = latex;

export type GenreValeurLim = "limite" | "deux" | "droite";

export interface ValeurDetectiveLim {
  genre: GenreValeurLim;
  /** Étiquettes KaTeX des champs (« \lim … f(x)= », « y= »). */
  labels: string[];
  nombres?: number[];
  droite?: { m: number; q: number };
  /** Écriture complète de la réponse. */
  latex: string;
}

export interface BlocCorrigeLim {
  utilise: Frag[];
  lignes: LigneCalcul[];
}

export interface CopieDetectiveLim {
  enonce: Frag[];
  lignes: Frag[][];
  ligneFausse: number;
  regles: string[];
  regleCours: AideEcran;
  aideCorrection: AideEcran;
  valeur: ValeurDetectiveLim;
  /** Résultat (faux) de la copie : une saisie qui le reprend reçoit `piege`. */
  copieNombres?: number[];
  copieDroite?: { m: number; q: number };
  piege: Frag[];
  corrigeA: BlocCorrigeLim;
  corrigeB: BlocCorrigeLim;
  corrigeC: BlocCorrigeLim & { verification?: BlocCorrigeLim };
  preliminaires: { ligne: Frag[]; regle: string }[];
  /** La fonction de l'exercice et des points x utiles (contrôles numériques). */
  fonction: (x: number) => number;
  points: number[];
}

// ============================================================================
// Écritures.
// ============================================================================

const infS = (s: number) => (s > 0 ? "+\\infty" : "-\\infty");
/** « 3 − 5/x + 2/x² » (termes nuls omis) : coefficients divisés par x^k. */
function sommeDiv(c0: number, c1: number, c2: number): string {
  let s = `${c0}`;
  if (c1 !== 0) s += `${c1 < 0 ? "-" : "+"}\\dfrac{${Math.abs(c1)}}{x}`;
  if (c2 !== 0) s += `${c2 < 0 ? "-" : "+"}\\dfrac{${Math.abs(c2)}}{x^2}`;
  return s;
}
/** « 2x^2 », « -x^2 ». */
const mono2 = (a: number) => `${a === 1 ? "" : a === -1 ? "-" : a}x^2`;
const dec = (v: number) => `${Math.round(v * 10) / 10}`.replace(".", "{,}");
/** Valeur décimale d'un contrôle numérique, au dix-millième, avec « ≈ ». */
function approx(f: (x: number) => number, x: number, xL: string): LigneCalcul {
  return ligne(`f\\left(${xL}\\right)\\approx ${f(x).toFixed(4).replace(".", "{,}")}`);
}

// ============================================================================
// Descriptions (écran 2).
// ============================================================================

export const LEURRES: Record<VarianteDetectiveLimites, string[]> = {
  infSurInf: ["iiNum0", "iiDomaine", "iiJamaisAH"],
  infMoinsInf: ["imPremierFini", "imPasDeLimite", "imSigneOppose"],
  signeZero: ["szPointVide", "szDiviseZero", "szRemplacer"],
  simplification: ["siDomaine", "siPremierFini", "siUn"],
  racineMoinsInfini: ["rmPasEvidence", "rmQsurX", "rmDenPlus"],
  degres: ["dgDominants", "dgUn", "dgAsurX"],
  aoAh: ["aaDegre3", "aaToujoursZero", "aaDiviserX2"],
  lateral: ["laNumZero", "laDiviseZero", "laPasAV"],
};

export function descriptionFragments(id: string, e: E): Frag[] {
  const d = e.d;
  switch (id) {
    case "infSurInf":
      return [l("\\dfrac{\\infty}{\\infty}"), t(" est une forme indéterminée : il fallait mettre en évidence le terme de plus haut degré, pas conclure que la limite vaut 1.")];
    case "iiNum0":
      return [t("La limite du numérateur est fausse : un polynôme du second degré tend vers 0 en "), l("+\\infty"), t(".")];
    case "iiDomaine":
      return [t("Le domaine est faux : le dénominateur s'annule pour une valeur de x.")];
    case "iiJamaisAH":
      return [t("Une limite finie en "), l("+\\infty"), t(" ne donne jamais d'asymptote horizontale.")];
    case "infMoinsInf":
      return [l("\\infty-\\infty"), t(" est une forme indéterminée : les deux infinis ne « s'annulent » pas, il fallait mettre en évidence le terme dominant.")];
    case "imPremierFini":
      return [t("La limite d'un terme du premier degré en "), l("+\\infty"), t(" est un nombre fini.")];
    case "imPasDeLimite":
      return [t("Un polynôme n'a pas de limite en "), l("+\\infty"), t(".")];
    case "imSigneOppose":
      return [t("La limite d'un monôme en "), l("+\\infty"), t(" a le signe opposé à celui de son coefficient.")];
    case "signeZero":
      return [t(d.side < 0 ? "Pour x < " : "Pour x > "), l(`${d.p}`), t(", le dénominateur "), l(polyL([1, -d.p])), t(" est "), t(d.side < 0 ? "négatif : il tend vers " : "positif : il tend vers "), l(d.side < 0 ? "0^-" : "0^+"), t(", pas vers "), l(d.side < 0 ? "0^+" : "0^-"), t(".")];
    case "szPointVide":
      return [t("Le numérateur s'annule aussi en "), l(`x=${d.p}`), t(" : c'est un point vide, pas une limite infinie.")];
    case "szDiviseZero":
      return [t("Un nombre non nul divisé par une quantité qui tend vers 0 tend vers 0.")];
    case "szRemplacer":
      return [t("Il fallait simplement remplacer x par "), l(`${d.p}`), t(" dans f.")];
    case "simplification":
      return [t("On ne simplifie que par un facteur commun : "), l("x^2"), t(" n'est un facteur ni du numérateur ni du dénominateur, on ne peut pas le « barrer ».")];
    case "siDomaine":
      return [t("Le domaine est faux : le dénominateur s'annule pour une valeur de x.")];
    case "siPremierFini":
      return [t("Une fonction du premier degré a une limite finie en "), l("+\\infty"), t(".")];
    case "siUn":
      return [t("Une forme "), l("\\dfrac{\\infty}{\\infty}"), t(" vaut toujours 1.")];
    case "racineMoinsInfini":
      return [l("\\sqrt{x^2}=|x|"), t(", qui vaut "), l("-x"), t(" pour x < 0 (en "), l("-\\infty"), t(") : la copie a écrit x.")];
    case "rmPasEvidence":
      return [t("On ne peut pas mettre "), l("x^2"), t(" en évidence sous une racine.")];
    case "rmQsurX":
      return [t("La limite de "), l(`\\dfrac{${Math.abs(d.q)}}{x}`), t(" en "), l("-\\infty"), t(" vaut "), l(`${Math.abs(d.q)}`), t(".")];
    case "rmDenPlus":
      return [t("Le dénominateur tend vers "), l("+\\infty"), t(" en "), l("-\\infty"), t(".")];
    case "degres":
      return [l("\\dfrac{x^2}{x^3}=\\dfrac{1}{x}"), t(" (on soustrait les exposants) : le dénominateur l'emporte, la limite est 0.")];
    case "dgDominants":
      return [t("Les termes dominants sont mal choisis.")];
    case "dgUn":
      return [t("Une forme "), l("\\dfrac{\\infty}{\\infty}"), t(" vaut toujours 1.")];
    case "dgAsurX":
      return [t("La limite de "), l("\\dfrac{a}{x}"), t(" en "), l("+\\infty"), t(" est infinie.")];
    case "aoAh":
      return [l(`\\dfrac{${mono2(d.a)}}{x}=${coefX(d.a)}`), t(" : le numérateur a un degré de plus que le dénominateur, l'asymptote est oblique, pas horizontale.")];
    case "aaDegre3":
      return [t("Le degré du numérateur est 3.")];
    case "aaToujoursZero":
      return [t("Une fonction rationnelle a toujours l'asymptote horizontale "), l("y=0"), t(".")];
    case "aaDiviserX2":
      return [t("Le domaine est faux : le dénominateur ne s'annule jamais.")];
    case "lateral":
      return [t("La copie n'a calculé que la limite à droite : à gauche de "), l(`${d.p}`), t(", le dénominateur tend vers "), l("0^-"), t(" ; les deux limites sont différentes, la limite en "), l(`${d.p}`), t(" n'existe pas.")];
    case "laNumZero":
      return [t("Le numérateur tend vers 0 quand x tend vers "), l(`${d.p}`), t(".")];
    case "laDiviseZero":
      return [t("Un nombre non nul divisé par une quantité qui tend vers 0 tend vers 0.")];
    case "laPasAV":
      return [t("La droite "), l(`x=${d.p}`), t(" n'est pas une asymptote verticale.")];
  }
  return [t(id)];
}

// ============================================================================
// Scénarios (copie canonique).
// ============================================================================

function infSurInf(e: E): CopieDetectiveLim {
  const { a, b, c, k } = e.d;
  const N = polyL([a, b, c]);
  const D = polyL([k, 0, e.d.e]);
  const sa = Math.sign(a);
  const L = limL(PLUS);
  const f = (x: number) => (a * x * x + b * x + c) / (k * x * x + e.d.e);
  return {
    enonce: [t("Calcule "), l(`${L}f(x)`), t(" pour "), l(`f(x)=\\dfrac{${N}}{${D}}`), t(".")],
    lignes: [
      [l(`${L}(${N})=${infS(sa)}`)],
      [l(`${L}(${D})=+\\infty`)],
      [t("Forme "), l("\\dfrac{\\infty}{\\infty}"), t(", donc "), l(`${L}f(x)=${sa}`), t(".")],
      [t("La droite "), l(`y=${sa}`), t(" est asymptote horizontale en "), l("+\\infty"), t(".")],
    ],
    ligneFausse: 2,
    regles: ["limite d'un polynôme : celle de son terme dominant", "limite d'un polynôme : celle de son terme dominant", "quotient de deux limites infinies", "limite finie en +∞ : asymptote horizontale"],
    regleCours: { texte: [l("\\dfrac{\\infty}{\\infty}"), t(" est une forme indéterminée : on met en évidence le terme de plus haut degré au numérateur et au dénominateur (cours, § 1).")] },
    aideCorrection: { texte: [t("Mets "), l("x^2"), t(" en évidence en haut et en bas, simplifie, puis passe à la limite.")] },
    valeur: { genre: "limite", labels: [`${L}f(x)=`], nombres: [a / k], latex: `${L}f(x)=${fracL(a, k)}` },
    copieNombres: [sa],
    piege: [t("C'est le résultat de la copie : "), l("\\dfrac{\\infty}{\\infty}"), t(" ne vaut pas 1, c'est une forme indéterminée.")],
    corrigeA: {
      utilise: [t("On refait la ligne : en l'infini, un quotient de polynômes a la limite du quotient de ses termes dominants.")],
      lignes: [ligne(`${L}f(x)=${L}\\dfrac{${mono2(a)}}{${mono2(k)}}`, "termes dominants"), ligne(`=${fracL(a, k)}`, [ft("et non "), fl(`${sa}`), ft(" comme dans la copie")])],
    },
    corrigeB: { utilise: [l("\\dfrac{\\infty}{\\infty}"), t(" est une forme indéterminée : deux quotients de cette forme peuvent avoir des limites différentes.")], lignes: [ligne("\\dfrac{2x^2}{x^2}=2", "un quotient ∞/∞ qui tend vers 2"), ligne("\\dfrac{x^2}{x}=x", "un autre qui tend vers +∞")] },
    corrigeC: {
      utilise: [t("On met "), l("x^2"), t(" en évidence (cours, § 1) ; "), l("\\dfrac{c}{x}"), t(" et "), l("\\dfrac{c}{x^2}"), t(" tendent vers 0.")],
      lignes: [
        ligne(`f(x)=\\dfrac{x^2\\left(${sommeDiv(a, b, c)}\\right)}{x^2\\left(${sommeDiv(k, 0, e.d.e)}\\right)}`, "mise en évidence de x²"),
        ligne(`=\\dfrac{${sommeDiv(a, b, c)}}{${sommeDiv(k, 0, e.d.e)}}`, "on simplifie par x² (x ≠ 0)"),
        ligne(`${L}f(x)=\\dfrac{${a}}{${k}}`, "les termes en 1/x et 1/x² tendent vers 0"),
        ...(fracL(a, k) !== `\\dfrac{${a}}{${k}}` ? [ligne(`=${fracL(a, k)}`)] : []),
      ],
      verification: { utilise: [t("Contrôle numérique :")], lignes: [approx(f, 1e4, "10^{4}")] },
    },
    preliminaires: [
      { ligne: [t("Le numérateur et le dénominateur sont des polynômes du second degré.")], regle: "lecture des degrés" },
      { ligne: [l("\\operatorname{dom}f=\\mathbb{R}"), t(" (le dénominateur ne s'annule jamais).")], regle: "domaine : dénominateur jamais nul" },
    ],
    fonction: f,
    points: [0.37, 1.43, 2.9],
  };
}

function infMoinsInf(e: E): CopieDetectiveLim {
  const { a, b, s } = e.d;
  const L = limL(PLUS);
  const f = (x: number) => s * (a * x * x - b * x);
  const t1 = mono2(s * a);
  const t2 = `${-s * b}x`;
  const ax = a === 1 ? "x" : `${a}x`;
  return {
    enonce: [t("Calcule "), l(`${L}f(x)`), t(" pour "), l(`f(x)=${polyL([s * a, -s * b, 0])}`), t(".")],
    lignes: [[l(`${L}${t1}=${infS(s)}`)], [l(`${L}(${t2})=${infS(-s)}`)], [t("Forme "), l("\\infty-\\infty"), t(" : les deux infinis s'annulent, donc "), l(`${L}f(x)=0`), t(".")], [t("La droite "), l("y=0"), t(" est asymptote horizontale en "), l("+\\infty"), t(".")]],
    ligneFausse: 2,
    regles: ["limite d'un monôme", "limite d'un monôme", "somme de deux limites infinies de signes contraires", "limite finie en +∞ : asymptote horizontale"],
    regleCours: { texte: [l("\\infty-\\infty"), t(" est une forme indéterminée : pour un polynôme, on met en évidence le terme de plus haut degré (cours, § 1).")] },
    aideCorrection: { texte: [t("Mets "), l(t1), t(" en évidence, puis regarde la limite de la parenthèse.")] },
    valeur: { genre: "limite", labels: [`${L}f(x)=`], nombres: [s * Infinity], latex: `${L}f(x)=${infS(s)}` },
    copieNombres: [0],
    piege: [t("C'est le résultat de la copie : "), l("\\infty-\\infty"), t(" ne vaut pas 0.")],
    corrigeA: { utilise: [t("On refait la ligne : la limite d'un polynôme en l'infini est celle de son terme dominant.")], lignes: [ligne(`${L}f(x)=${L}${t1}`, "terme dominant"), ligne(`=${infS(s)}`, [ft("et non 0 comme dans la copie")])] },
    corrigeB: { utilise: [l("\\infty-\\infty"), t(" est une forme indéterminée : la différence peut tendre vers n'importe quoi.")], lignes: [ligne("(x+3)-x=3", "une forme ∞ − ∞ qui tend vers 3"), ligne("2x-x=x", "une autre qui tend vers +∞")] },
    corrigeC: {
      utilise: [t("Mise en évidence du terme dominant (cours, § 1).")],
      lignes: [
        ligne(`f(x)=${t1}\\left(1-\\dfrac{${b}}{${ax}}\\right)`, "mise en évidence"),
        ligne(`${L}\\left(1-\\dfrac{${b}}{${ax}}\\right)=1`, [fl(`\\dfrac{${b}}{${ax}}`), ft(" tend vers 0")]),
        ligne(`${L}f(x)=${infS(s)}`, "un infini multiplié par 1"),
      ],
    },
    preliminaires: [
      { ligne: [l("\\operatorname{dom}f=\\mathbb{R}"), t(" (polynôme).")], regle: "domaine d'un polynôme" },
      { ligne: [t("On calcule la limite de chaque terme.")], regle: "organisation du calcul" },
    ],
    fonction: f,
    points: [0.37, 1.43, 2.9],
  };
}

function signeZero(e: E): CopieDetectiveLim {
  const { a, b, p, side } = e.d;
  const N = a * p + b;
  const cible: Cible = pointC(p, side < 0 ? "-" : "+");
  const L = limL(cible);
  const den = polyL([1, -p]);
  const num = polyL([a, b]);
  const f = (x: number) => (a * x + b) / (x - p);
  const bon = Math.sign(N) * side;
  const zeroBon = side < 0 ? "0^{-}" : "0^{+}";
  const zeroFaux = side < 0 ? "0^{+}" : "0^{-}";
  const xT = p + side * 0.1;
  return {
    enonce: [t("Calcule "), l(`${L}f(x)`), t(" pour "), l(`f(x)=\\dfrac{${num}}{${den}}`), t(".")],
    lignes: [[l(`${L}(${num})=${N}`)], [l(`${L}(${den})=${zeroFaux}`)], [l(`${L}f(x)=${infS(-bon)}`), t(` (nombre ${N > 0 ? "positif" : "négatif"} divisé par `), l(zeroFaux), t(")")]],
    ligneFausse: 1,
    regles: ["limite d'un polynôme : on remplace x par p", "signe du dénominateur près de p", "nombre non nul divisé par 0⁺ ou 0⁻"],
    regleCours: { texte: [t("Le signe de 0 se lit sur le dénominateur, du côté où l'on s'approche : "), l(polyL([1, -p])), t(side < 0 ? " est négatif pour x < " : " est positif pour x > "), l(`${p}`), t(" (cours, § 1).")] },
    aideCorrection: { texte: [t("Garde le numérateur, corrige le signe du 0 au dénominateur, puis applique la règle des signes.")] },
    valeur: { genre: "limite", labels: [`${L}f(x)=`], nombres: [bon * Infinity], latex: `${L}f(x)=${infS(bon)}` },
    copieNombres: [-bon * Infinity],
    piege: [t("C'est le résultat de la copie : le signe du dénominateur est faux.")],
    corrigeA: { utilise: [t("On refait la ligne : on regarde le signe de "), l(den), t(" quand x est proche de "), l(`${p}`), t(side < 0 ? " par la gauche." : " par la droite.")], lignes: [ligne(`${L}(${den})=${zeroBon}`, [ft(side < 0 ? "pour x < " : "pour x > "), fl(`${p}`), ft(side < 0 ? ", le dénominateur est négatif (copie : " : ", le dénominateur est positif (copie : "), fl(zeroFaux), ft(")")])] },
    corrigeB: { utilise: [t("Un nombre proche de p du bon côté donne le signe du dénominateur :")], lignes: [ligne(`${dec(xT)}-${parL(p)}=${dec(side * 0.1)}`, [ft("par exemple x = "), fl(dec(xT))])] },
    corrigeC: {
      utilise: [t("Nombre non nul divisé par "), l("0^{+}"), t(" ou "), l("0^{-}"), t(" : un infini, signe par la règle des signes (cours, § 1).")],
      lignes: [ligne(`${L}(${num})=${a}\\cdot ${parL(p)}${plusL(b)}=${N}`, "on remplace x par p"), ligne(`${L}(${den})=${zeroBon}`), ligne(`${L}f(x)=${infS(bon)}`, `${N > 0 ? "positif" : "négatif"} divisé par ${side < 0 ? "0⁻" : "0⁺"}`)],
    },
    preliminaires: [
      { ligne: [l(`\\operatorname{dom}f=\\mathbb{R}\\setminus\\{${p}\\}`)], regle: "domaine : dénominateur non nul" },
      { ligne: [t("Le numérateur ne s'annule pas en "), l(`x=${p}`), t(".")], regle: "test du numérateur" },
      { ligne: [t("On s'approche de "), l(`${p}`), t(side < 0 ? " par la gauche : " : " par la droite : "), l(side < 0 ? `x<${p}` : `x>${p}`), t(".")], regle: "côté de l'approche" },
    ],
    fonction: f,
    points: [p + side * 0.37, p + side * 1.43, p + side * 2.9],
  };
}

function simplification(e: E): CopieDetectiveLim {
  const { a, b, k, c } = e.d;
  const L = limL(PLUS);
  const N = polyL([a, b, 0]);
  const D = polyL([k, 0, c]);
  const f = (x: number) => (a * x * x + b * x) / (k * x * x + c);
  const faux = `\\dfrac{${a}${plusL(b)}x}{${k}+${c}}`;
  return {
    enonce: [t("Calcule "), l(`${L}f(x)`), t(" pour "), l(`f(x)=\\dfrac{${N}}{${D}}`), t(".")],
    lignes: [[t("On simplifie par "), l("x^2"), t(" : "), l(`f(x)=${faux}`), t(".")], [l(`${L}${faux}=${infS(b)}`)], [t("f n'a donc pas d'asymptote horizontale en "), l("+\\infty"), t(".")]],
    ligneFausse: 0,
    regles: ["simplification par x²", "limite d'une fonction du premier degré", "pas de limite finie : pas d'asymptote horizontale"],
    regleCours: { texte: [t("On ne simplifie une fraction que par un facteur commun ; ici on met "), l("x^2"), t(" en évidence pour faire apparaître ce facteur (cours, § 1).")] },
    aideCorrection: { texte: [t("Mets "), l("x^2"), t(" en évidence au numérateur et au dénominateur, simplifie, puis passe à la limite.")] },
    valeur: { genre: "limite", labels: [`${L}f(x)=`], nombres: [a / k], latex: `${L}f(x)=${fracL(a, k)}` },
    copieNombres: [Math.sign(b) * Infinity],
    piege: [t("C'est le résultat de la copie, obtenu après une simplification interdite.")],
    corrigeA: {
      utilise: [t("On contrôle la simplification de la copie en une valeur de x : la forme « simplifiée » doit donner la même valeur que f.")],
      lignes: [ligne(`f(2)=\\dfrac{${4 * a + 2 * b}}{${4 * k + c}}`, "valeur de f en x = 2"), ...(fracL(4 * a + 2 * b, 4 * k + c) !== `\\dfrac{${4 * a + 2 * b}}{${4 * k + c}}` ? [ligne(`=${fracL(4 * a + 2 * b, 4 * k + c)}`)] : []), ligne(`\\dfrac{${a}+2\\cdot ${parL(b)}}{${k}+${c}}=${fracL(a + 2 * b, k + c)}`, "la forme de la copie en x = 2 : autre valeur")],
    },
    corrigeB: { utilise: [t("On ne simplifie que par un facteur commun à tout le numérateur et à tout le dénominateur.")], lignes: [ligne(`${N}=x(${polyL([a, b])})`, "x est un facteur du numérateur, x² n'en est pas un")] },
    corrigeC: {
      utilise: [t("On met "), l("x^2"), t(" en évidence (cours, § 1) ; "), l("\\dfrac{c}{x}"), t(" et "), l("\\dfrac{c}{x^2}"), t(" tendent vers 0.")],
      lignes: [
        ligne(`f(x)=\\dfrac{x^2\\left(${sommeDiv(a, b, 0)}\\right)}{x^2\\left(${sommeDiv(k, 0, c)}\\right)}`, "mise en évidence de x²"),
        ligne(`=\\dfrac{${sommeDiv(a, b, 0)}}{${sommeDiv(k, 0, c)}}`, "on simplifie par x² (x ≠ 0)"),
        ligne(`${L}f(x)=\\dfrac{${a}}{${k}}`, "les termes en 1/x et 1/x² tendent vers 0"),
        ...(fracL(a, k) !== `\\dfrac{${a}}{${k}}` ? [ligne(`=${fracL(a, k)}`)] : []),
      ],
      verification: { utilise: [t("Contrôle numérique :")], lignes: [approx(f, 1e4, "10^{4}")] },
    },
    preliminaires: [
      { ligne: [l("\\operatorname{dom}f=\\mathbb{R}"), t(" (le dénominateur ne s'annule jamais).")], regle: "domaine : dénominateur jamais nul" },
      { ligne: [t("Le numérateur et le dénominateur tendent vers l'infini : forme "), l("\\dfrac{\\infty}{\\infty}"), t(".")], regle: "forme indéterminée" },
      { ligne: [t("Il faut transformer l'expression avant de passer à la limite.")], regle: "méthode" },
    ],
    fonction: f,
    points: [0.37, 1.43, 2.9],
  };
}

function racineMoinsInfini(e: E): CopieDetectiveLim {
  const { m, c, p, q } = e.d;
  const L = limL(MOINS);
  const R = polyL([m * m, 0, c]);
  const rac = `\\sqrt{${sommeDiv(m * m, 0, c)}}`;
  const D = polyL([p, q]);
  const f = (x: number) => Math.sqrt(m * m * x * x + c) / (p * x + q);
  const denDiv = sommeDiv(p, q, 0);
  return {
    enonce: [t("Calcule "), l(`${L}f(x)`), t(" pour "), l(`f(x)=\\dfrac{\\sqrt{${R}}}{${D}}`), t(".")],
    lignes: [
      [l(`\\sqrt{${R}}=\\sqrt{x^2}\\cdot ${rac}`)],
      [l("\\sqrt{x^2}=x"), t(", donc "), l(`\\sqrt{${R}}=x${rac}`), t(".")],
      [l(`f(x)=\\dfrac{${rac}}{${denDiv}}`), t(" (on simplifie par x).")],
      [l(`${L}f(x)=${fracL(m, p)}`)],
    ],
    ligneFausse: 1,
    regles: ["x² mis en évidence sous la racine", "racine d'un carré", "simplification par x", "limites de référence"],
    regleCours: { texte: [t("La racine d'un carré est une valeur absolue : "), l("\\sqrt{x^2}=|x|"), t(", qui vaut "), l("-x"), t(" quand x < 0 (cours, § 1).")] },
    aideCorrection: { texte: [t("Reprends à la ligne fausse avec "), l("\\sqrt{x^2}=-x"), t(", divise par x, puis passe à la limite.")] },
    valeur: { genre: "limite", labels: [`${L}f(x)=`], nombres: [-m / p], latex: `${L}f(x)=${fracL(-m, p)}` },
    copieNombres: [m / p],
    piege: [t("C'est le résultat de la copie : il vient de "), l("\\sqrt{x^2}=x"), t(", faux pour x < 0.")],
    corrigeA: { utilise: [t("On refait la ligne : en "), l("-\\infty"), t(", x est négatif.")], lignes: [ligne("\\sqrt{x^2}=|x|", "racine d'un carré"), ligne("=-x", [ft("car x < 0 en "), fl("-\\infty"), ft(" (la copie écrit x)")])] },
    corrigeB: { utilise: [t("Une racine carrée n'est jamais négative :")], lignes: [ligne("\\sqrt{(-3)^2}=\\sqrt{9}=3", "par exemple x = −3"), ligne("3=-(-3)", "c'est −x, pas x")] },
    corrigeC: {
      utilise: [t("On reprend avec "), l("\\sqrt{x^2}=-x"), t(" puis on divise par x (cours, § 1).")],
      lignes: [
        ligne(`f(x)=\\dfrac{-x${rac}}{${D}}`, [latex("x<0")]),
        ligne(`=\\dfrac{-${rac}}{${denDiv}}`, "on divise numérateur et dénominateur par x"),
        ligne(`${L}f(x)=\\dfrac{-\\sqrt{${m * m}}}{${p}}`, "les termes en 1/x et 1/x² tendent vers 0"),
        ligne(`=${fracL(-m, p)}`),
      ],
      verification: { utilise: [t("Contrôle numérique :")], lignes: [approx(f, -1e4, "-10^{4}")] },
    },
    preliminaires: [
      { ligne: [t("En "), l("-\\infty"), t(", le numérateur et le dénominateur tendent vers l'infini : forme "), l("\\dfrac{\\infty}{\\infty}"), t(".")], regle: "forme indéterminée" },
      { ligne: [t("On met "), l("x^2"), t(" en évidence sous la racine (x ≠ 0).")], regle: "méthode du cours" },
    ],
    fonction: f,
    points: [-2.9, -5.3, -8.7],
  };
}

function degres(e: E): CopieDetectiveLim {
  const { a, b, k } = e.d;
  const L = limL(PLUS);
  const N = polyL([a, 0, b]);
  const D = polyL([k, 0, 0, e.d.e]);
  const f = (x: number) => (a * x * x + b) / (k * x * x * x + e.d.e);
  const fausse = `${fracL(a, k)}x`.replace(/^1x$/, "x").replace(/^-1x$/, "-x");
  return {
    enonce: [t("Calcule "), l(`${L}f(x)`), t(" pour "), l(`f(x)=\\dfrac{${N}}{${D}}`), t(".")],
    lignes: [[t("Termes dominants : "), l(mono2(a)), t(" et "), l(`${k === 1 ? "" : k}x^3`), t(".")], [l(`\\dfrac{${mono2(a)}}{${k === 1 ? "" : k}x^3}=${fausse}`)], [l(`${L}f(x)=${infS(a)}`)]],
    ligneFausse: 1,
    regles: ["terme dominant d'un polynôme", "quotient de puissances de x", "limite d'un monôme"],
    regleCours: { texte: [t("Pour diviser deux puissances de x, on soustrait les exposants : "), l("\\dfrac{x^2}{x^3}=x^{2-3}=\\dfrac{1}{x}"), t(" (cours, § 1).")] },
    aideCorrection: { texte: [t("Refais le quotient des termes dominants, puis passe à la limite.")] },
    valeur: { genre: "limite", labels: [`${L}f(x)=`], nombres: [0], latex: `${L}f(x)=0` },
    copieNombres: [Math.sign(a) * Infinity],
    piege: [t("C'est le résultat de la copie : le degré du dénominateur est plus grand, le quotient tend vers 0.")],
    corrigeA: { utilise: [t("On refait la ligne : on soustrait les exposants.")], lignes: [ligne(`\\dfrac{${mono2(a)}}{${k === 1 ? "" : k}x^3}=\\dfrac{${a}}{${k === 1 ? "" : k}x}`, [ft("et non "), fl(fausse), ft(" comme dans la copie")])] },
    corrigeB: { utilise: [t("Quotient de deux puissances de x :")], lignes: [ligne("\\dfrac{x^2}{x^3}=\\dfrac{1}{x}", "on soustrait les exposants : 2 − 3 = −1")] },
    corrigeC: {
      utilise: [t("Le dénominateur a le plus haut degré : le quotient des termes dominants tend vers 0 (cours, § 1).")],
      lignes: [ligne(`${L}f(x)=${L}\\dfrac{${a}}{${k === 1 ? "" : k}x}`, "quotient des termes dominants"), ligne("=0", "un nombre divisé par une quantité qui tend vers l'infini")],
      verification: { utilise: [t("Contrôle numérique :")], lignes: [approx(f, 1e4, "10^{4}")] },
    },
    preliminaires: [
      { ligne: [t("En "), l("+\\infty"), t(", forme "), l("\\dfrac{\\infty}{\\infty}"), t(".")], regle: "forme indéterminée" },
      { ligne: [t("Pour un quotient de polynômes en l'infini, on garde les termes dominants.")], regle: "méthode du cours" },
    ],
    fonction: f,
    points: [0.37, 1.43, 2.9],
  };
}

function aoAh(e: E): CopieDetectiveLim {
  const { a, b, c, p } = e.d;
  const q = b + a * p;
  const r = c + p * q;
  const N = polyL([a, b, c]);
  const den = polyL([1, -p]);
  const f = (x: number) => (a * x * x + b * x + c) / (x - p);
  const droite = polyL([a, q]);
  return {
    enonce: [t("Détermine l'asymptote du graphe de f en "), l("-\\infty"), t(" et en "), l("+\\infty"), t(" pour "), l(`f(x)=\\dfrac{${N}}{${den}}`), t(".")],
    lignes: [[t("Le numérateur est de degré 2, le dénominateur de degré 1.")], [l(`\\dfrac{${mono2(a)}}{x}=${a}`), t(" (termes dominants).")], [t("Donc "), l(`y=${a}`), t(" est asymptote horizontale en "), l("-\\infty"), t(" et en "), l("+\\infty"), t(".")]],
    ligneFausse: 1,
    regles: ["degrés du numérateur et du dénominateur", "quotient des termes dominants", "limite finie en l'infini : asymptote horizontale"],
    regleCours: { texte: [t("Quand le numérateur a un degré de plus que le dénominateur, la fonction a une asymptote oblique "), l("y=ax+b"), t(", obtenue par division (cours, § 2).")] },
    aideCorrection: { texte: [t("Divise le numérateur par "), l(den), t(" : le quotient du premier degré donne l'asymptote oblique.")] },
    valeur: { genre: "droite", labels: ["y="], droite: { m: a, q }, latex: `y=${droite}` },
    copieDroite: { m: 0, q: a },
    piege: [t("C'est le résultat de la copie : "), l(`\\dfrac{${mono2(a)}}{x}=${coefX(a)}`), t(", pas "), l(`${a}`), t(".")],
    corrigeA: { utilise: [t("On refait la ligne : on divise les termes dominants.")], lignes: [ligne(`\\dfrac{${mono2(a)}}{x}=${coefX(a)}`, [ft("et non "), fl(`${a}`), ft(" comme dans la copie")])] },
    corrigeB: { utilise: [t("Degré du numérateur = degré du dénominateur + 1 : asymptote oblique, obtenue par division (cours, § 2).")], lignes: [ligne(`${N}=(${den})(${droite})${plusL(r)}`, [ft("division par "), fl(den)])] },
    corrigeC: {
      utilise: [t("On écrit f comme un premier degré plus une fraction qui tend vers 0 en l'infini.")],
      lignes: [ligne(`f(x)=${droite}${r < 0 ? "-" : "+"}\\dfrac{${Math.abs(r)}}{${den}}`, "on divise chaque terme par le dénominateur"), ligne(`${limL(PLUS)}\\dfrac{${r}}{${den}}=0`, "de même en −∞"), ligne(`y=${droite}`, "asymptote oblique en −∞ et en +∞")],
    },
    preliminaires: [
      { ligne: [l(`\\operatorname{dom}f=\\mathbb{R}\\setminus\\{${p}\\}`)], regle: "domaine : dénominateur non nul" },
      { ligne: [t("On compare les degrés du numérateur et du dénominateur.")], regle: "méthode du cours" },
    ],
    fonction: f,
    points: [p + 0.37, p + 1.43, p - 2.9],
  };
}

function lateral(e: E): CopieDetectiveLim {
  const { a, b, p } = e.d;
  const N = a * p + b;
  const num = polyL([a, b]);
  const den = polyL([1, -p]);
  const f = (x: number) => (a * x + b) / (x - p);
  const sN = Math.sign(N);
  const Lp = limL(pointC(p));
  const Lg = limL(pointC(p, "-"));
  const Ld = limL(pointC(p, "+"));
  return {
    enonce: [t("Calcule "), l(`${Lp}f(x)`), t(", si elle existe, pour "), l(`f(x)=\\dfrac{${num}}{${den}}`), t(".")],
    lignes: [[l(`${Lp}(${num})=${N}`)], [l(`${Lp}(${den})=0`)], [t("Donc "), l(`${Lp}f(x)=${infS(sN)}`), t(" (nombre non nul divisé par 0).")], [t("La courbe part vers "), l(infS(sN)), t(" des deux côtés de la droite "), l(`x=${p}`), t(".")]],
    ligneFausse: 2,
    regles: ["limite d'un polynôme : on remplace x par p", "limite d'un polynôme : on remplace x par p", "nombre non nul divisé par 0", "lecture du résultat"],
    regleCours: { texte: [t("Quand le dénominateur tend vers 0, on calcule la limite à gauche ("), l("0^-"), t(") ET la limite à droite ("), l("0^+"), t(") ; si elles diffèrent, la limite en p n'existe pas (cours, § 1).")] },
    aideCorrection: { texte: [t("Calcule séparément la limite à gauche et la limite à droite de "), l(`${p}`), t(".")] },
    valeur: { genre: "deux", labels: [`${Lg}f(x)=`, `${Ld}f(x)=`], nombres: [-sN * Infinity, sN * Infinity], latex: `${Lg}f(x)=${infS(-sN)},\\quad ${Ld}f(x)=${infS(sN)}` },
    copieNombres: [sN * Infinity, sN * Infinity],
    piege: [t("C'est le résultat de la copie : à gauche de "), l(`${p}`), t(", le dénominateur est négatif.")],
    corrigeA: { utilise: [t("On refait la ligne en séparant les deux côtés de "), l(`${p}`), t(".")], lignes: [ligne(`${Lg}(${den})=0^{-}`, [ft("pour x < "), fl(`${p}`)]), ligne(`${Lg}f(x)=${infS(-sN)}`, [ft("à gauche : "), fl(infS(-sN)), ft(", pas "), fl(infS(sN))])] },
    corrigeB: { utilise: [t("Des valeurs de part et d'autre de p montrent deux comportements opposés :")], lignes: [ligne(`f(${dec(p - 0.1)})=${-10 * N + a}`, "à gauche de p"), ligne(`f(${dec(p + 0.1)})=${10 * N + a}`, "à droite de p")] },
    corrigeC: {
      utilise: [t("Nombre non nul divisé par "), l("0^{-}"), t(" ou "), l("0^{+}"), t(" (cours, § 1) ; les deux limites latérales diffèrent.")],
      lignes: [ligne(`${Lg}f(x)=${infS(-sN)}`, `${N > 0 ? "positif" : "négatif"} divisé par 0⁻`), ligne(`${Ld}f(x)=${infS(sN)}`, `${N > 0 ? "positif" : "négatif"} divisé par 0⁺`)],
    },
    preliminaires: [
      { ligne: [l(`\\operatorname{dom}f=\\mathbb{R}\\setminus\\{${p}\\}`)], regle: "domaine : dénominateur non nul" },
      { ligne: [t("Le numérateur ne s'annule pas en "), l(`x=${p}`), t(".")], regle: "test du numérateur" },
    ],
    fonction: f,
    points: [p + 0.37, p - 0.61, p + 1.9],
  };
}

function copieCanonique(e: E): CopieDetectiveLim {
  switch (e.variante) {
    case "infSurInf":
      return infSurInf(e);
    case "infMoinsInf":
      return infMoinsInf(e);
    case "signeZero":
      return signeZero(e);
    case "simplification":
      return simplification(e);
    case "racineMoinsInfini":
      return racineMoinsInfini(e);
    case "degres":
      return degres(e);
    case "aoAh":
      return aoAh(e);
    case "lateral":
      return lateral(e);
  }
}

/** Copie finale : `av` lignes justes (préliminaires puis lignes justes de la copie canonique, les
 * dernières gardées) avant la ligne fausse, puis ses conséquences. */
function assembler(c: CopieDetectiveLim, av: number): CopieDetectiveLim {
  const pool = [...c.preliminaires.map((x) => x.ligne), ...c.lignes.slice(0, c.ligneFausse)];
  const poolR = [...c.preliminaires.map((x) => x.regle), ...c.regles.slice(0, c.ligneFausse)];
  const k = Math.min(av, pool.length);
  return {
    ...c,
    lignes: [...pool.slice(pool.length - k), ...c.lignes.slice(c.ligneFausse)],
    regles: [...poolR.slice(poolR.length - k), ...c.regles.slice(c.ligneFausse)],
    ligneFausse: k,
  };
}

const CACHE = new WeakMap<E, CopieDetectiveLim>();
export function copie(e: E): CopieDetectiveLim {
  const enCache = CACHE.get(e);
  if (enCache) return enCache;
  const c = assembler(copieCanonique(e), e.d.av ?? 0);
  CACHE.set(e, c);
  return c;
}

export const nombreLignes = (e: E): number => copie(e).lignes.length;

/** Lignes de pool disponibles avant la ligne fausse (contrôle : ≥ 3 pour que av = 0…3 marche). */
export const poolAvantFausse = (e: E): number => {
  const c = copieCanonique(e);
  return c.preliminaires.length + c.ligneFausse;
};

