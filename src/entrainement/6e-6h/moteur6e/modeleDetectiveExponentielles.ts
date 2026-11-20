import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";
import type { ExerciceDetectiveExp, ScenarioDetectiveExp, VarianteDetectiveExp } from "../core6e/detectiveExponentielles.types";
import type { Frag, TableauDonnees } from "../ui6e/ecransExp.types";
import { lx, tx } from "../ui6e/ecransExp.types";
import { affineL, coefL, decL, decT, estDecimal, q, qL, termeL } from "../ui6e/nombresExp";

/**
 * Modèle de 6gen144 « Le détective d'erreurs : exponentielles » : à partir des paramètres entiers du
 * scénario, la copie de l'élève fictif (cohérente avec SON erreur), la ligne fausse, la bonne
 * description, les valeurs corrigées (écran 3) et le contenu du corrigé détaillé (contrôle de la
 * ligne, règle, résolution reprise). Une seule source pour l'écran, le papier et le corrigé.
 */

type E = ExerciceDetectiveExp;
const t = tx;
const l = lx;

export type GenreValeur = "fonction" | "nombre" | "limite" | "ensemble" | "intervalle";

export interface IntervalleAttendu {
  gauche: number;
  droite: number;
  gaucheFermee: boolean;
  droiteFermee: boolean;
}

export interface ValeurDetective {
  genre: GenreValeur;
  label: string;
  labelLatex: string;
  placeholder: string;
  nombre?: number;
  fonction?: (x: number) => number;
  ensemble?: number[];
  intervalle?: IntervalleAttendu;
  /** Écriture complète de la bonne valeur (« f'(x)=… », « S=\{2\} »). */
  latex: string;
  /** Une valeur décimale proche est signalée « approchée » (sans tentative). */
  exacte: boolean;
}

export interface BlocCorrige {
  utilise: Frag[];
  lignes: LigneCalcul[];
}

export interface CopieDetective {
  /** Ce que l'élève devait faire. */
  enonce: Frag[];
  lignes: Frag[][];
  ligneFausse: number;
  tableau?: TableauDonnees;
  /** Règle employée par chaque ligne (aide de niveau 2 de l'écran 1). */
  regles: string[];
  /** La règle juste du cours (aide de l'écran 2, aide 1 de l'écran 3). */
  regleCours: { texte: Frag[]; latex?: string };
  /** Aide de niveau 2 de l'écran 3 (règle appliquée à l'instance, sans le résultat). */
  aideCorrection: { texte: Frag[]; latex?: string };
  valeurs: ValeurDetective[];
  /** Valeurs (fausses) de la copie, dans l'ordre des champs : une saisie qui les reprend reçoit `piege`. */
  valeursCopie: number[];
  piege: Frag[];
  corrigeA: BlocCorrige;
  corrigeB: BlocCorrige;
  corrigeC: BlocCorrige & { verification?: BlocCorrige };
}

// ============================================================================
// Tables.
// ============================================================================

export const BASES_SENS = [
  { latex: "\\frac{1}{2}", v: 1 / 2 },
  { latex: "\\frac{1}{3}", v: 1 / 3 },
  { latex: "0{,}5", v: 0.5 },
  { latex: "0{,}2", v: 0.2 },
  { latex: "\\frac{2}{3}", v: 2 / 3 },
  { latex: "0{,}4", v: 0.4 },
  { latex: "\\frac{3}{4}", v: 0.75 },
];
export const SYMBOLES = ["<", ">", "\\leq", "\\geq"] as const;
/** Symbole de relation suivi d'une espace quand c'est une commande (\leq, \geq). */
const sp = (s: string): string => (s.startsWith("\\") ? `${s} ` : s);
const SYMBOLE_INVERSE: Record<string, string> ={ "<": ">", ">": "<", "\\leq": "\\geq", "\\geq": "\\leq" };

export const BASES_DOMINANCE = [
  { latex: "2", v: 2 },
  { latex: "3", v: 3 },
  { latex: "e", v: Math.E },
  { latex: "1{,}5", v: 1.5 },
];

export const CONTEXTES_BAISSE = [
  { sujet: "Une voiture neuve vaut", grandeur: "V", unite: "euros", temps: "année", action: "elle perd", objet: "de sa valeur", decimales: 2 },
  { sujet: "Un patient reçoit une dose de", grandeur: "M", unite: "mg", temps: "heure", action: "l'organisme élimine", objet: "du médicament présent", decimales: 3 },
  { sujet: "Un lac pollué compte", grandeur: "N", unite: "poissons", temps: "année", action: "le lac perd", objet: "de ses poissons", decimales: 0 },
];

// ============================================================================
// Outils d'écriture.
// ============================================================================

const pB = (b: string): string => (/^[0-9]+$|^e$/.test(b) ? b : `\\left(${b}\\right)`);
const ensembleL = (vals: number[]): string => (vals.length === 0 ? "S=\\varnothing" : `S=\\{${[...vals].sort((a, b) => a - b).map((v) => nbL(v)).join("\\,;\\,")}\\}`);
/** Nombre (rationnel simple) en LaTeX : entier, décimal court, sinon fraction. */
function nbL(v: number): string {
  if (Number.isInteger(v)) return `${v}`;
  if (estDecimal(v, 4)) return decL(v, 4);
  for (let d = 2; d <= 60; d++) if (Math.abs(v * d - Math.round(v * d)) < 1e-9) return qL(q(Math.round(v * d), d));
  return decL(v, 4);
}
const milliers = (v: number, dec = 3): string => decL(v, dec);
/** « b·aˣ » de la substitution t = aˣ : terme en aˣ avec son coefficient. */
function termeAx(B: number, a: number): string {
  if (B === 0) return "";
  const abs = Math.abs(B);
  return `${B < 0 ? "-" : "+"}${abs === 1 ? "" : `${abs}\\cdot `}${a}^{x}`;
}
/** Intervalle LaTeX. */
export function intervalleL(iv: IntervalleAttendu): string {
  const g = iv.gauche === -Infinity ? "-\\infty" : nbL(iv.gauche);
  const d = iv.droite === Infinity ? "+\\infty" : nbL(iv.droite);
  return `${iv.gaucheFermee ? "[" : "\\mathopen{]}"}${g}\\,;\\,${d}${iv.droiteFermee ? "]" : "\\mathclose{[}"}`;
}
/** Écriture scientifique « 6{,}5\cdot 10^{-15} ». */
function sciL(v: number): string {
  if (v === 0) return "0";
  const ex = Math.floor(Math.log10(Math.abs(v)));
  const m = v / 10 ** ex;
  return `${decL(Math.round(m * 10) / 10, 1)}\\cdot 10^{${ex}}`;
}

// ============================================================================
// Descriptions (écran 2).
// ============================================================================

export const DESCRIPTION_CORRECTE: Record<VarianteDetectiveExp, string> = {
  lnA: "lnA",
  signe: "signe",
  sens: "sens",
  racine: "racine",
  regles: "regles",
  dominance: "dominance",
  croissance: "croissance",
  rapport: "rapport",
};

export const LEURRES: Record<VarianteDetectiveExp, string[]> = {
  lnA: ["lnA_uprime", "lnA_exposant", "lnA_constante"],
  signe: ["signe_lne", "signe_constante", "signe_exposant"],
  sens: ["sens_division", "sens_logarithme", "sens_multiplier"],
  racine: ["racine_trinome", "racine_diviser", "racine_un"],
  regles: ["regles_log", "regles_egaler", "regles_diviser"],
  dominance: ["dominance_un", "dominance_degre", "dominance_signe"],
  croissance: ["croissance_lineaire", "croissance_p", "croissance_moins"],
  rapport: ["rapport_lineaire", "rapport_b", "rapport_inverse"],
};

export function descriptionFragments(id: string, e: E): Frag[] {
  const d = e.donnees;
  switch (id) {
    // ---- justes
    case "lnA":
      return [t("La dérivée de "), l("a^{u}"), t(" est "), l("u'\\cdot\\ln a\\cdot a^{u}"), t(" : le facteur "), l(`\\ln ${d.a}`), t(" a été oublié.")];
    case "signe":
      return [t("La dérivée de "), l(`-${d.k}x`), t(" est "), l(`-${d.k}`), t(" : le signe « − » de l'exposant a été perdu.")];
    case "sens":
      return [t("La base est comprise entre 0 et 1 : la fonction exponentielle est décroissante, le sens de l'inégalité devait changer.")];
    case "racine":
      return [l("a^{x}"), t(" est toujours strictement positif : "), l(`${d.a}^{x}`), t(" ne peut jamais valoir "), l(`-${d.a ** d.j}`), t(" (et "), l(`-${d.a ** d.j}\\neq ${d.a}^{-${d.j}}`), t(").")];
    case "regles":
      return e.scenario === "P1"
        ? [t("Puissance d'une puissance : on multiplie les exposants, "), l("\\left(a^{2}\\right)^{u}=a^{2u}"), t(", on ne les additionne pas.")]
        : [t("Produit de deux puissances de même base : on additionne les exposants, "), l("a^{x}\\cdot a^{y}=a^{x+y}"), t(", on ne les multiplie pas.")];
    case "dominance":
      return [t("Une exponentielle de base > 1 l'emporte sur toute puissance de "), l("x"), t(", quel que soit son exposant : "), l("\\dfrac{x^{n}}{a^{x}}\\to 0"), t(" en "), l("+\\infty"), t(".")];
    case "croissance":
      return [t("Une baisse de "), l(`${d.p}\\,\\%`), t(" multiplie par "), l(`1-${decL(d.p / 100)}`), t(" : il fallait "), l(`r=${decL(1 - d.p / 100)}`), t(", pas "), l(`${decL(1 + d.p / 100)}`), t(".")];
    case "rapport":
      return [t("Le facteur "), l("a"), t(" d'un modèle exponentiel est le rapport de deux valeurs consécutives, pas leur différence.")];
    // ---- leurres
    case "lnA_uprime":
      return [t("La dérivée de l'exposant "), l("u'"), t(" a été oubliée.")];
    case "lnA_exposant":
      return [t("L'exposant aurait dû diminuer d'une unité, comme pour "), l("x^{n}"), t(".")];
    case "lnA_constante":
      return [t("La constante "), l(`${d.c}`), t(" aurait dû disparaître en dérivant.")];
    case "signe_lne":
      return [t("Il manque le facteur "), l("\\ln e"), t(", différent de 1.")];
    case "signe_constante":
      return [t("La constante "), l(`${d.d}`), t(" aurait dû rester dans la dérivée.")];
    case "signe_exposant":
      return [t("L'exposant de "), l("e"), t(" aurait dû diminuer d'une unité en dérivant.")];
    case "sens_division":
      return [t("Le sens devait changer parce qu'on divise par "), l(`${d.m - d.n}`), t(".")];
    case "sens_logarithme":
      return [t("On ne peut pas comparer les exposants : il fallait d'abord passer au logarithme.")];
    case "sens_multiplier":
      return [t("Les exposants devaient être multipliés, et non comparés.")];
    case "racine_trinome":
      return [t("Le trinôme en "), l("t"), t(" est mal résolu : ses racines sont fausses.")];
    case "racine_diviser":
      return [t("Il fallait diviser l'équation par "), l(`${d.a}^{x}`), t(" au lieu de poser "), l(`t=${d.a}^{x}`), t(".")];
    case "racine_un":
      return [l(`${d.a}^{x}=${d.a ** d.k}`), t(" n'a pas de solution.")];
    case "regles_log":
      return [t("On ne peut égaler les exposants qu'après être passé au logarithme.")];
    case "regles_egaler":
      return [t("Deux puissances de même base égales n'ont pas forcément le même exposant.")];
    case "regles_diviser":
      return [t("Il fallait diviser les exposants au lieu de les additionner ou de les multiplier.")];
    case "dominance_un":
      return [t("Une forme "), l("\\dfrac{\\infty}{\\infty}"), t(" vaut toujours 1.")];
    case "dominance_degre":
      return [t("Il fallait comparer l'exposant "), l("n"), t(" à la base : c'est le plus grand des deux qui l'emporte.")];
    case "dominance_signe":
      return [t("Il fallait appliquer la règle des signes : la limite est négative.")];
    case "croissance_lineaire":
      return [t("Une baisse de "), l(`${d.p}\\,\\%`), t(" par "), t(CONTEXTES_BAISSE[d.ctx].temps), t(" est une décroissance linéaire, pas exponentielle.")];
    case "croissance_p":
      return [t("Il fallait prendre "), l(`r=${decL(d.p / 100)}`), t(", le pourcentage lui-même.")];
    case "croissance_moins":
      return [t("Le modèle devait s'écrire avec l'exposant "), l("-t"), t(" à cause de la baisse.")];
    case "rapport_lineaire":
      return [t("Les rapports ne sont pas égaux : le modèle est linéaire.")];
    case "rapport_b":
      return [l("b"), t(" devait être la deuxième valeur du tableau, pas la première.")];
    case "rapport_inverse":
      return [t("Le modèle devait s'écrire "), l("f(t)=a\\cdot b^{t}"), t(" : "), l("a"), t(" et "), l("b"), t(" sont inversés.")];
  }
  return [t(id)];
}

// ============================================================================
// Scénarios.
// ============================================================================

export const LIGNES_PAR_SCENARIO: Record<ScenarioDetectiveExp, number> = { L: 4, S: 4, I: 4, R: 5, P1: 4, P2: 4, D1: 4, D2: 4, C: 4, T: 4 };

function scenarioL(e: E): CopieDetective {
  const { c, a, m, x0 } = e.donnees;
  const p = -m * x0;
  const u = affineL(m, p);
  const cm = c * m;
  const f = `${c}\\cdot ${a}^{${u}}`;
  const lnA = `\\ln ${a}`;
  return {
    enonce: [t("Calcule "), l("f'(x)"), t(" puis "), l(`f'(${x0})`), t(" pour "), l(`f(x)=${f}`), t(".")],
    lignes: [
      [l(`u(x)=${u}`), t(", donc "), l(`u'(x)=${m}`)],
      [l(`f'(x)=${c}\\cdot ${m < 0 ? `(${m})` : m}\\cdot ${a}^{${u}}`)],
      [l(`f'(x)=${cm}\\cdot ${a}^{${u}}`)],
      [l(`f'(${x0})=${cm}\\cdot ${a}^{0}=${cm}`)],
    ],
    ligneFausse: 1,
    regles: ["dérivée d'une fonction du premier degré", "dérivée de c·aᵘ (règle de la composée)", "on multiplie les constantes", "on remplace x par x₀"],
    regleCours: { texte: [t("Dérivée d'une exponentielle composée (cours, § 2) :")], latex: "\\left(a^{u}\\right)'=u'\\cdot\\ln a\\cdot a^{u}" },
    aideCorrection: { texte: [t("Ici "), l(`u'(x)=${m}`), t(" et "), l(`\\ln a=${lnA}`), t(" : remplace dans "), l("c\\cdot u'\\cdot\\ln a\\cdot a^{u}"), t(".")] },
    valeurs: [
      { genre: "fonction", label: "f'(x)", labelLatex: "f'(x)=", placeholder: "ex. : 7*ln(5)*5^(2x)", fonction: (x) => cm * Math.log(a) * a ** (m * x + p), latex: `f'(x)=${cm}${lnA}\\cdot ${a}^{${u}}`, exacte: true },
      { genre: "nombre", label: `f'(${x0})`, labelLatex: `f'(${x0})=`, placeholder: "ex. : 7ln5", nombre: cm * Math.log(a), latex: `f'(${x0})=${cm}${lnA}`, exacte: true },
    ],
    valeursCopie: [NaN, cm],
    piege: [t("Garder "), l(`${cm}`), t(" sans le facteur "), l(lnA), t(" : seule la base e se dérive « sans rien changer ».")],
    corrigeA: {
      utilise: [t("On contrôle chaque ligne avec les règles de dérivation du cours (§ 2).")],
      lignes: [ligne(`u'(x)=${m}`, "ligne 1 : juste"), ligne(`${lnA}\\neq 1`, [t("ligne 2 : le facteur "), l(lnA), t(" manque, et il ne vaut pas 1 car "), l(`${a}\\neq e`)])],
    },
    corrigeB: {
      utilise: [t("Dérivée d'une exponentielle de base "), l("a"), t(" composée avec "), l("u"), t(" (cours, § 2).")],
      lignes: [ligne("\\left(a^{u}\\right)'\\neq u'\\cdot a^{u}", [t("règle de la copie (vraie seulement pour "), l("a=e"), t(")")]), ligne("\\left(a^{u}\\right)'=u'\\cdot\\ln a\\cdot a^{u}", "règle du cours")],
    },
    corrigeC: {
      utilise: [l("\\left(c\\cdot a^{u}\\right)'=c\\cdot u'\\cdot\\ln a\\cdot a^{u}"), t(", puis on remplace "), l("x"), t(" par "), l(`${x0}`), t(".")],
      lignes: [
        ligne(`f'(x)=${c}\\cdot ${m < 0 ? `(${m})` : m}\\cdot ${lnA}\\cdot ${a}^{${u}}`, "ligne 2 corrigée"),
        ligne(`=${cm}${lnA}\\cdot ${a}^{${u}}`, "on multiplie les constantes"),
        ligne(`f'(${x0})=${cm}${lnA}\\cdot ${a}^{0}`, [t("en "), l(`x=${x0}`), t(", l'exposant vaut 0")]),
        ligne(`=${cm}${lnA}`, [l("a^{0}=1")]),
      ],
      verification: { utilise: [t("Valeur approchée, pour contrôle :")], lignes: [ligne(`${cm}${lnA}\\approx ${decL(Math.round(cm * Math.log(a) * 1e4) / 1e4, 4)}`)] },
    },
  };
}

function scenarioS(e: E): CopieDetective {
  const { c, k, d } = e.donnees;
  const ck = c * k;
  const f = `${c}e^{-${k}x}${termeL(d)}`;
  return {
    enonce: [t("Calcule "), l("f'(x)"), t(" et la pente de la tangente au point d'abscisse 0 pour "), l(`f(x)=${f}`), t(".")],
    lignes: [
      [l(`u(x)=-${k}x`), t(" (exposant de "), l("e"), t(")")],
      [l(`u'(x)=${k}`)],
      [l(`f'(x)=${c}\\cdot ${k}\\cdot e^{-${k}x}=${ck}e^{-${k}x}`)],
      [l(`f'(0)=${ck}`), t(" : la pente vaut "), l(`${ck}`), t(".")],
    ],
    ligneFausse: 1,
    regles: ["on repère l'exposant", "dérivée d'une fonction du premier degré", "dérivée de c·eᵘ (la constante d disparaît)", "on remplace x par 0"],
    regleCours: { texte: [t("Dérivée d'une exponentielle composée (cours, § 2) :")], latex: "\\left(e^{u}\\right)'=u'\\cdot e^{u}" },
    aideCorrection: { texte: [t("Dérive d'abord "), l(`u(x)=-${k}x`), t(" (attention au signe), puis remplace dans "), l("c\\cdot u'\\cdot e^{u}"), t(".")] },
    valeurs: [
      { genre: "fonction", label: "f'(x)", labelLatex: "f'(x)=", placeholder: "ex. : -7e^(-3x)", fonction: (x) => -ck * Math.exp(-k * x), latex: `f'(x)=-${ck}e^{-${k}x}`, exacte: true },
      { genre: "nombre", label: "f'(0)", labelLatex: "f'(0)=", placeholder: "ex. : 7", nombre: -ck, latex: `f'(0)=-${ck}`, exacte: true },
    ],
    valeursCopie: [NaN, ck],
    piege: [t("Oublier le signe : la dérivée de "), l(`-${k}x`), t(" est "), l(`-${k}`), t(", donc "), l("f"), t(" est décroissante.")],
    corrigeA: {
      utilise: [t("On contrôle chaque ligne avec les règles de dérivation du cours (§ 2).")],
      lignes: [ligne(`u'(x)=-${k}`, [t("dérivée de "), l(`-${k}x`)]), ligne(`-${k}\\neq ${k}`, "la ligne 2 a perdu le signe")],
    },
    corrigeB: {
      utilise: [t("Dérivée d'une fonction du premier degré : "), l("(mx+p)'=m"), t(", avec son signe.")],
      lignes: [ligne(`(-${k}x)'\\neq ${k}`, "copie"), ligne(`(-${k}x)'=-${k}`, "le coefficient garde son signe")],
    },
    corrigeC: {
      utilise: [l("\\left(c\\cdot e^{u}+d\\right)'=c\\cdot u'\\cdot e^{u}"), t(" (cours, § 2), puis "), l("x=0"), t(".")],
      lignes: [
        ligne(`f'(x)=${c}\\cdot(-${k})\\cdot e^{-${k}x}`, "ligne 3 reprise avec u' = −" + `${k}`),
        ligne(`=-${ck}e^{-${k}x}`),
        ligne(`f'(0)=-${ck}\\cdot e^{0}`, "on remplace x par 0"),
        ligne(`=-${ck}`, [l("e^{0}=1")]),
      ],
      verification: { utilise: [t("Cohérent : "), l(`e^{-${k}x}`), t(" décroît, donc "), l("f"), t(" aussi, et sa pente est négative :")], lignes: [ligne(`-${ck}<0`)] },
    },
  };
}

function scenarioI(e: E): CopieDetective {
  const { base, s, m, n, p, q: qq } = e.donnees;
  const b = BASES_SENS[base];
  const S = SYMBOLES[s];
  const Sinv = SYMBOLE_INVERSE[S];
  const g = affineL(m, p);
  const dr = affineL(n, qq);
  const r = (qq - p) / (m - n);
  const rL = nbL(r);
  const strict = S === "<" || S === ">";
  const versDroiteCopie = S === ">" || S === "\\geq";
  const ivCopie: IntervalleAttendu = versDroiteCopie ? { gauche: r, droite: Infinity, gaucheFermee: !strict, droiteFermee: false } : { gauche: -Infinity, droite: r, gaucheFermee: false, droiteFermee: !strict };
  const iv: IntervalleAttendu = !versDroiteCopie ? { gauche: r, droite: Infinity, gaucheFermee: !strict, droiteFermee: false } : { gauche: -Infinity, droite: r, gaucheFermee: false, droiteFermee: !strict };
  // Test : un entier de l'ensemble de la COPIE qui ne vérifie pas l'inéquation de départ.
  const xt = versDroiteCopie ? Math.floor(r) + 1 : Math.ceil(r) - 1;
  const e1 = m * xt + p;
  const e2 = n * xt + qq;
  const relTest = b.v ** e1 < b.v ** e2 ? "<" : ">";
  return {
    enonce: [t("Résous l'inéquation "), l(`${pB(b.latex)}^{${g}}${sp(S)}${pB(b.latex)}^{${dr}}`), t(".")],
    lignes: [
      [t("Les deux membres sont des puissances de la même base "), l(b.latex), t(".")],
      [l(`${g}${sp(S)}${dr}`)],
      [l(`${m - n}x${sp(S)}${qq - p}`)],
      [l(`x${sp(S)}${rL}`), t(", donc "), l(`S=${intervalleL(ivCopie)}`)],
    ],
    ligneFausse: 1,
    regles: ["on repère la base commune", "on compare les exposants (principe d'équivalence)", "on regroupe les termes en x", "on divise par un nombre positif et on écrit S"],
    regleCours: { texte: [t("Principe d'équivalence pour une base "), l("0<a<1"), t(" (cours, § 5) :")], latex: "a^{u}<a^{v}\\iff u>v" },
    aideCorrection: { texte: [t("Ici "), l(`0<${b.latex}<1`), t(" : écris l'inéquation entre les exposants avec le symbole retourné, puis isole "), l("x"), t(".")] },
    valeurs: [{ genre: "intervalle", label: "S", labelLatex: "S=", placeholder: "", intervalle: iv, latex: `S=${intervalleL(iv)}`, exacte: true }],
    valeursCopie: [],
    piege: [t("Garder le sens de l'inégalité : avec une base entre 0 et 1, l'exponentielle est décroissante et le sens change.")],
    corrigeA: {
      utilise: [t("Une valeur de l'ensemble trouvé par la copie doit vérifier l'inéquation de départ : on teste "), l(`x=${xt}`), t(".")],
      lignes: [
        ligne(`${pB(b.latex)}^{${e1}}${relTest}${pB(b.latex)}^{${e2}}`, [t("exposants pour "), l(`x=${xt}`), t(" : "), l(`${e1}`), t(" et "), l(`${e2}`)]),
        ligne(`${b.latex}<1`, "la base est entre 0 et 1 : l'ordre des exposants s'inverse à la ligne 2"),
      ],
    },
    corrigeB: {
      utilise: [t("Principe d'équivalence : pour "), l("a>1"), t(" le sens est conservé, pour "), l("0<a<1"), t(" il change (cours, § 5).")],
      lignes: [ligne(`${pB(b.latex)}^{u}${sp(S)}${pB(b.latex)}^{v}\\iff u${sp(Sinv)}v`, [l(`0<${b.latex}<1`), t(" : le sens change")])],
    },
    corrigeC: {
      utilise: [t("On compare les exposants en changeant le sens, puis on isole "), l("x"), t(" (on divise par "), l(`${m - n}>0`), t(" : le sens ne change plus).")],
      lignes: [ligne(`${g}${sp(Sinv)}${dr}`, "ligne 2 corrigée"), ligne(`${m - n}x${sp(Sinv)}${qq - p}`, "on regroupe"), ligne(`x${sp(Sinv)}${rL}`, `on divise par ${m - n}`)],
    },
  };
}

function scenarioR(e: E): CopieDetective {
  const { a, k, j } = e.donnees;
  const t1 = a ** k;
  const t2 = -(a ** j);
  const B = -(t1 + t2);
  const C = t1 * t2;
  const eq = `${a}^{2x}${termeAx(B, a)}${termeL(C)}=0`;
  const trin = `t^{2}${B === 0 ? "" : B === 1 ? "+t" : B === -1 ? "-t" : `${B > 0 ? "+" : ""}${B}t`}${termeL(C)}=0`;
  return {
    enonce: [t("Résous l'équation "), l(eq), t(".")],
    lignes: [
      [t("On pose "), l(`t=${a}^{x}`), t(" : "), l(trin)],
      [l(`t=${t1}`), t(" ou "), l(`t=${t2}`)],
      [l(`${a}^{x}=${t1}`), t(" ou "), l(`${a}^{x}=${t2}`)],
      [l(`x=${k}`), t(" ou "), l(`x=-${j}`)],
      [l(ensembleL([k, -j]))],
    ],
    ligneFausse: 3,
    regles: ["substitution t = aˣ", "résolution du trinôme en t", "retour à x", "même base de chaque côté", "ensemble des solutions"],
    regleCours: { texte: [t("Une exponentielle est toujours strictement positive (cours, § 4) :")], latex: "a^{x}>0\\ \\text{pour tout réel}\\ x" },
    aideCorrection: { texte: [t("Pour chaque valeur de "), l("t"), t(", résous "), l(`${a}^{x}=t`), t(" ; une valeur négative de "), l("t"), t(" ne donne aucune solution.")] },
    valeurs: [{ genre: "ensemble", label: "S", labelLatex: "S=", placeholder: "ex. : 5 ; -1   (ou ∅)", ensemble: [k], latex: ensembleL([k]), exacte: true }],
    valeursCopie: [],
    piege: [t("Écrire "), l(`-${a ** j}=${a}^{-${j}}`), t(" : une puissance de base positive n'est jamais négative.")],
    corrigeA: {
      utilise: [t("On contrôle la ligne 4 : la valeur "), l(`x=-${j}`), t(" vérifie-t-elle "), l(`${a}^{x}=${t2}`), t(" ?")],
      lignes: [ligne(`${a}^{-${j}}=\\dfrac{1}{${a ** j}}`, "puissance négative : un inverse"), ligne(`\\dfrac{1}{${a ** j}}\\neq ${t2}`, "un nombre positif n'est pas négatif")],
    },
    corrigeB: {
      utilise: [t("Une exponentielle de base positive est strictement positive : "), l("a^{x}>0"), t(" pour tout "), l("x"), t(" (cours, § 4).")],
      lignes: [ligne(`${t2}<0`, [t("donc "), l(`${a}^{x}=${t2}`), t(" n'a aucune solution")])],
    },
    corrigeC: {
      utilise: [t("On garde seulement la racine positive en "), l("t"), t(", puis « même base » : "), l("a^{x}=a^{k}\\iff x=k"), t(" (cours, § 4).")],
      lignes: [ligne(`${a}^{x}=${t1}`, [t("racine "), l(`t=${t1}>0`)]), ligne(`=${a}^{${k}}`, k === 0 ? [l(`${a}^{0}=1`)] : undefined), ligne(`x=${k}`, "même base, mêmes exposants")],
      verification: { utilise: [t("On remplace "), l(`x=${k}`), t(" dans l'équation de départ :")], lignes: [ligne(`${a}^{${2 * k}}${termeAx(B, a).replace(`${a}^{x}`, `${a}^{${k}}`)}${termeL(C)}=0`)] },
    },
  };
}

function scenarioP1(e: E): CopieDetective {
  const { a, m, n, p, q: qq } = e.donnees;
  const c = a * a;
  const g = affineL(m, p);
  const dr = affineL(n, qq);
  const rw = (qq - p - 2) / (m - n);
  const rj = (qq - 2 * p) / (2 * m - n);
  return {
    enonce: [t("Résous l'équation "), l(`${c}^{${g}}=${a}^{${dr}}`), t(".")],
    lignes: [
      [l(`${c}=${a}^{2}`), t(", donc "), l(`${c}^{${g}}=\\left(${a}^{2}\\right)^{${g}}`)],
      [l(`\\left(${a}^{2}\\right)^{${g}}=${a}^{2+${g}}`)],
      [l(`${affineL(m, p + 2)}=${dr}`), t(" (même base, mêmes exposants)")],
      [l(`x=${nbL(rw)}`), t(", donc "), l(ensembleL([rw]))],
    ],
    ligneFausse: 1,
    regles: [`${c} écrit comme une puissance de ${a}`, "puissance d'une puissance", "principe d'équivalence (même base)", "équation du premier degré"],
    regleCours: { texte: [t("Règle (4) des puissances (cours, § 1) :")], latex: "\\left(a^{r}\\right)^{s}=a^{r\\cdot s}" },
    aideCorrection: { texte: [t("Écris "), l(`\\left(${a}^{2}\\right)^{${g}}=${a}^{2(${g})}`), t(", développe l'exposant, puis égale les exposants.")] },
    valeurs: [{ genre: "ensemble", label: "S", labelLatex: "S=", placeholder: "ex. : 5/3", ensemble: [rj], latex: ensembleL([rj]), exacte: true }],
    valeursCopie: [rw],
    piege: [t("Additionner les exposants : "), l("\\left(a^{2}\\right)^{u}=a^{2u}"), t(", pas "), l("a^{2+u}"), t(".")],
    corrigeA: {
      utilise: [t("On teste la règle de la ligne 2 sur un exposant simple, 3 :")],
      lignes: [ligne(`\\left(${a}^{2}\\right)^{3}=${a ** 6}`, [l(`${a}^{2}\\cdot ${a}^{2}\\cdot ${a}^{2}`)]), ligne(`${a}^{2+3}=${a ** 5}`), ligne(`${a ** 6}\\neq ${a ** 5}`, "la règle de la ligne 2 est fausse")],
    },
    corrigeB: {
      utilise: [t("Règle (4) des puissances (cours, § 1).")],
      lignes: [ligne("\\left(a^{r}\\right)^{s}\\neq a^{r+s}", "règle de la copie"), ligne("\\left(a^{r}\\right)^{s}=a^{r\\cdot s}", "règle (4)")],
    },
    corrigeC: {
      utilise: [t("Règle (4), puis principe d'équivalence : "), l("a^{u}=a^{v}\\iff u=v"), t(" (cours, § 4).")],
      lignes: [
        ligne(`\\left(${a}^{2}\\right)^{${g}}=${a}^{2(${g})}`, "règle (4)"),
        ligne(`=${a}^{${affineL(2 * m, 2 * p)}}`, "on distribue"),
        ligne(`${affineL(2 * m, 2 * p)}=${dr}`, "mêmes exposants"),
        ligne(`${coefL(2 * m - n)}x=${qq - 2 * p}`, "on regroupe"),
        ...(2 * m - n === 1 ? [] : [ligne(`x=${nbL(rj)}`, 2 * m - n === -1 ? "on change les signes" : `on divise par ${2 * m - n}`)]),
      ],
    },
  };
}

function scenarioP2(e: E): CopieDetective {
  const { a, r1, r2 } = e.donnees;
  const A = a === 0 ? "e" : `${a}`;
  const p = -(r1 + r2);
  const qq = -r1 * r2;
  const x = (qq - p) / 2;
  return {
    enonce: [t("Résous l'équation "), l(`${A}^{x}\\cdot ${A}^{${affineL(1, p)}}=${A}^{${qq}}`), t(".")],
    lignes: [
      [l(`${A}^{x}\\cdot ${A}^{${affineL(1, p)}}=${A}^{x(${affineL(1, p)})}`)],
      [l(`x(${affineL(1, p)})=${qq}`), t(" (même base, mêmes exposants)")],
      [l(`x^{2}${termeL(p, "x")}${termeL(-qq)}=0`)],
      [l(`x=${Math.min(r1, r2)}`), t(" ou "), l(`x=${Math.max(r1, r2)}`), t(", donc "), l(ensembleL([r1, r2]))],
    ],
    ligneFausse: 0,
    regles: ["produit de deux puissances de même base", "principe d'équivalence (même base)", "on développe", "équation du second degré"],
    regleCours: { texte: [t("Règle (1) des puissances (cours, § 1) :")], latex: "a^{r}\\cdot a^{s}=a^{r+s}" },
    aideCorrection: { texte: [t("Additionne les exposants : "), l(`${A}^{x}\\cdot ${A}^{${affineL(1, p)}}=${A}^{x+(${affineL(1, p)})}`), t(", puis égale les exposants.")] },
    valeurs: [{ genre: "ensemble", label: "S", labelLatex: "S=", placeholder: "ex. : 5/3", ensemble: [x], latex: ensembleL([x]), exacte: true }],
    valeursCopie: [],
    piege: [t("Multiplier les exposants d'un produit : "), l("a^{x}\\cdot a^{y}"), t(" vaut "), l("a^{x+y}"), t(", pas "), l("a^{x\\cdot y}"), t(".")],
    corrigeA: {
      utilise: [t("On teste la ligne 1 avec "), l("x=1"), t(" :")],
      lignes: [ligne(`${A}^{1}\\cdot ${A}^{${1 + p}}=${A}^{${2 + p}}`, "membre de gauche, règle (1)"), ligne(`${A}^{1\\cdot ${1 + p < 0 ? `(${1 + p})` : 1 + p}}=${A}^{${1 + p}}`, "membre de droite de la ligne 1"), ligne(`${A}^{${2 + p}}\\neq ${A}^{${1 + p}}`, "la ligne 1 est fausse")],
    },
    corrigeB: {
      utilise: [t("Règle (1) des puissances (cours, § 1).")],
      lignes: [ligne("a^{x}\\cdot a^{y}\\neq a^{x\\cdot y}", "règle de la copie"), ligne("a^{x}\\cdot a^{y}=a^{x+y}", "règle (1)")],
    },
    corrigeC: {
      utilise: [t("Règle (1), puis principe d'équivalence : "), l("a^{u}=a^{v}\\iff u=v"), t(" (cours, § 4).")],
      lignes: [
        ligne(`${A}^{x}\\cdot ${A}^{${affineL(1, p)}}=${A}^{${affineL(2, p)}}`, "règle (1)"),
        ligne(`${affineL(2, p)}=${qq}`, "mêmes exposants"),
        ligne(`2x=${qq - p}`, p < 0 ? `on ajoute ${-p}` : `on retranche ${p}`),
        ligne(`x=${nbL(x)}`, "on divise par 2"),
      ],
    },
  };
}

function scenarioD(e: E): CopieDetective {
  const { base, n, X } = e.donnees;
  const b = BASES_DOMINANCE[base];
  const A = b.latex;
  const quot = e.scenario === "D1";
  const expr = quot ? `\\dfrac{x^{${n}}}{${A}^{x}}` : `${A}^{x}-x^{${n}}`;
  const lim = "\\displaystyle\\lim_{x\\to +\\infty}";
  const vX = quot ? X ** n / b.v ** X : b.v ** X - X ** n;
  return {
    enonce: [t("Calcule "), l(`${lim}${quot ? expr : `\\left(${expr}\\right)`}`), t(".")],
    lignes: [
      [l(`${lim}x^{${n}}=+\\infty`), t(" et "), l(`${lim}${A}^{x}=+\\infty`), t(" : forme "), l(quot ? "\\dfrac{\\infty}{\\infty}" : "\\infty-\\infty")],
      [t("L'exposant "), l(`${n}`), t(" est grand : "), l(`x^{${n}}`), t(" l'emporte sur "), l(`${A}^{x}`), t(".")],
      [l(`${lim}${quot ? expr : `\\left(${expr}\\right)`}=${quot ? "+\\infty" : "-\\infty"}`)],
      [t(quot ? "Il n'y a donc pas d'asymptote horizontale en " : "La courbe finit donc sous l'axe des abscisses en "), l("+\\infty"), t(".")],
    ],
    ligneFausse: 1,
    regles: ["limite de chaque morceau", "comparaison de croissance", "conclusion", "interprétation graphique"],
    regleCours: { texte: [t("Règle de dominance (cours, § 1) : pour "), l("a>1"), t(" et tout entier "), l("n"), t(" :")], latex: "\\displaystyle\\lim_{x\\to+\\infty}\\dfrac{x^{n}}{a^{x}}=0" },
    aideCorrection: quot ? { texte: [t("C'est exactement la forme de la règle de dominance, avec "), l(`n=${n}`), t(" et "), l(`a=${A}`), t(".")] } : { texte: [t("Mets "), l(`${A}^{x}`), t(" en évidence :")], latex: `${A}^{x}\\left(1-\\dfrac{x^{${n}}}{${A}^{x}}\\right)` },
    valeurs: [{ genre: "limite", label: "La limite", labelLatex: `${lim}${quot ? expr : `\\left(${expr}\\right)`}=`, placeholder: "ex. : 3, +inf, -inf", nombre: quot ? 0 : Infinity, latex: `${lim}${quot ? expr : `\\left(${expr}\\right)`}=${quot ? "0" : "+\\infty"}`, exacte: true }],
    valeursCopie: [quot ? Infinity : -Infinity],
    piege: [t("Croire qu'un grand exposant suffit : toute exponentielle de base > 1 finit par dépasser "), l(`x^{${n}}`), t(".")],
    corrigeA: {
      utilise: [t("On contrôle la ligne 2 par une valeur de "), l("x"), t(" assez grande, "), l(`x=${X}`), t(" :")],
      lignes: [ligne(`${quot ? `\\dfrac{${X}^{${n}}}{${A}^{${X}}}` : `${A}^{${X}}-${X}^{${n}}`}\\approx ${sciL(vX)}`, quot ? "le quotient est déjà presque nul" : "la différence est déjà énorme et positive")],
    },
    corrigeB: {
      utilise: [t("Règle de dominance du cours (§ 1), valable quel que soit l'exposant "), l("n"), t(".")],
      lignes: [ligne(`${lim}\\dfrac{x^{${n}}}{${A}^{x}}=0`, [l(`${A}>1`)])],
    },
    corrigeC: quot
      ? { utilise: [t("Règle de dominance (cours, § 1).")], lignes: [ligne(`${lim}${expr}=0`, "règle de dominance")] }
      : {
          utilise: [t("On met "), l(`${A}^{x}`), t(" en évidence, puis règle de dominance (cours, § 1).")],
          lignes: [
            ligne(`${expr}=${A}^{x}\\left(1-\\dfrac{x^{${n}}}{${A}^{x}}\\right)`, "mise en évidence"),
            ligne(`${lim}\\left(1-\\dfrac{x^{${n}}}{${A}^{x}}\\right)=1-0`, "dominance"),
            ligne("=1"),
            ligne(`${lim}\\left(${expr}\\right)=+\\infty`, [l(`${A}^{x}\\to+\\infty`), t(" multiplié par un facteur qui tend vers 1")]),
          ],
        },
  };
}

function scenarioC(e: E): CopieDetective {
  const { ctx, p, Q0, n } = e.donnees;
  const c = CONTEXTES_BAISSE[ctx];
  const G = c.grandeur;
  const rFaux = 1 + p / 100;
  const r = 1 - p / 100;
  const vFaux = Q0 * rFaux ** n;
  const v = Q0 * r ** n;
  const Q0L = milliers(Q0);
  const unite = c.unite === "euros" ? "€" : c.unite;
  return {
    enonce: [t(`${c.sujet} `), l(`${Q0L}`), t(` ${c.unite}. Chaque ${c.temps}, ${c.action} `), l(`${p}\\,\\%`), t(` ${c.objet}. Écris le modèle `), l(`${G}(t)=${Q0L}\\cdot r^{t}`), t(" puis calcule "), l(`${G}(${n})`), t(".")],
    lignes: [
      [l(`${G}(t)=${G}_0\\cdot r^{t}`), t(", avec "), l(`${G}_0=${Q0L}`)],
      [l(`r=1+${decL(p / 100)}=${decL(rFaux)}`)],
      [l(`${G}(t)=${Q0L}\\cdot ${decL(rFaux)}^{t}`)],
      [l(`${G}(${n})=${Q0L}\\cdot ${decL(rFaux)}^{${n}}=${milliers(vFaux, 4)}`), t(` ${unite}`)],
    ],
    ligneFausse: 1,
    regles: ["modèle exponentiel Q₀·rᵗ", "facteur r d'une évolution en pourcentage", "modèle complet", "on remplace t"],
    regleCours: { texte: [t("Une évolution de "), l("p\\,\\%"), t(" par période multiplie par un facteur constant (cours, § 7) :")], latex: "r=1+\\dfrac{p}{100}\\ \\text{(hausse)},\\qquad r=1-\\dfrac{p}{100}\\ \\text{(baisse)}" },
    aideCorrection: { texte: [t("Ici c'est une baisse de "), l(`${p}\\,\\%`), t(" : "), l(`r=1-\\dfrac{${p}}{100}`), t(", puis remplace "), l("t"), t(" par "), l(`${n}`), t(".")] },
    valeurs: [
      { genre: "nombre", label: "r", labelLatex: "r=", placeholder: "ex. : 1,07", nombre: r, latex: `r=${decL(r)}`, exacte: true },
      { genre: "nombre", label: `${G}(${n})`, labelLatex: `${G}(${n})=`, placeholder: "valeur exacte", nombre: v, latex: `${G}(${n})=${milliers(v, 4)}`, exacte: true },
    ],
    valeursCopie: [rFaux, vFaux],
    piege: [t("Prendre "), l(`1+${decL(p / 100)}`), t(" pour une baisse : le modèle ferait augmenter la grandeur.")],
    corrigeA: {
      utilise: [t("On contrôle la ligne 2 sur la première période :")],
      lignes: [ligne(`${Q0L}\\cdot ${decL(rFaux)}=${milliers(Q0 * rFaux, 4)}`, "valeur après une période selon la copie"), ligne(`${milliers(Q0 * rFaux, 4)}>${Q0L}`, "la grandeur augmenterait, alors qu'elle baisse")],
    },
    corrigeB: {
      utilise: [t("Baisser de "), l("p\\,\\%"), t(", c'est multiplier par "), l("1-\\dfrac{p}{100}"), t(" (cours, § 7).")],
      lignes: [ligne(`1-\\dfrac{${p}}{100}=${decL(r)}`, "facteur d'une baisse")],
    },
    corrigeC: {
      utilise: [t("Modèle "), l(`${G}(t)=${G}_0\\cdot r^{t}`), t(" avec le bon facteur, puis "), l(`t=${n}`), t(".")],
      lignes: [ligne(`r=1-${decL(p / 100)}`, "baisse"), ligne(`=${decL(r)}`), ligne(`${Q0L}\\cdot ${decL(r)}^{${n}}=${milliers(v, 4)}`, [l(`${decL(r)}^{${n}}=${decL(r ** n, 6)}`)])],
      verification: { utilise: [t("La grandeur a bien baissé :")], lignes: [ligne(`${milliers(v, 4)}<${Q0L}`)] },
    },
  };
}

function scenarioT(e: E): CopieDetective {
  const { b, an, ad, T } = e.donnees;
  const a = an / ad;
  const ys = [0, 1, 2, 3].map((k) => b * a ** k);
  const dif = ys[1] - ys[0];
  const pred = b * a ** T;
  const predFaux = b * dif ** T;
  return {
    enonce: [t("Les mesures du tableau sont prises à intervalles égaux. Trouve le modèle exponentiel "), l("f(t)=b\\cdot a^{t}"), t(" puis prévois "), l(`f(${T})`), t(".")],
    tableau: { entetes: [[t("t")], [t("f(t)")]], lignes: ys.map((y, k) => [String(k), decT(y, 4)]), horizontal: true },
    lignes: [
      [t("Les rapports "), l("\\dfrac{f(1)}{f(0)}"), t(", "), l("\\dfrac{f(2)}{f(1)}"), t(", "), l("\\dfrac{f(3)}{f(2)}"), t(" sont égaux : modèle exponentiel.")],
      [l(`b=f(0)=${decL(b)}`)],
      [l(`a=f(1)-f(0)=${decL(ys[1], 4)}-${decL(b)}=${decL(dif, 4)}`)],
      [l(`f(${T})=${decL(b)}\\cdot ${decL(dif, 4)}^{${T}}\\approx ${sciL(predFaux)}`)],
    ],
    ligneFausse: 2,
    regles: ["rapports constants : modèle exponentiel", "b est la valeur en t = 0", "facteur a du modèle", "on remplace t"],
    regleCours: { texte: [t("Dans un modèle exponentiel, le rapport de deux valeurs consécutives est constant et vaut "), l("a"), t(" (cours, § 7) :")], latex: "a=\\dfrac{f(1)}{f(0)}" },
    aideCorrection: { texte: [t("Calcule "), l(`\\dfrac{${decL(ys[1], 4)}}{${decL(b)}}`), t(", puis remplace "), l("t"), t(" par "), l(`${T}`), t(" dans "), l("b\\cdot a^{t}"), t(".")] },
    valeurs: [
      { genre: "nombre", label: "a", labelLatex: "a=", placeholder: "ex. : 1,07", nombre: a, latex: `a=${decL(a, 4)}`, exacte: true },
      { genre: "nombre", label: `f(${T})`, labelLatex: `f(${T})=`, placeholder: "valeur exacte", nombre: pred, latex: `f(${T})=${decL(pred, 6)}`, exacte: true },
    ],
    valeursCopie: [dif, predFaux],
    piege: [t("Prendre la différence pour le facteur "), l("a"), t(" : c'est le rapport qui est constant.")],
    corrigeA: {
      utilise: [t("On compare la ligne 3 au rapport constant annoncé à la ligne 1 :")],
      lignes: [ligne(`\\dfrac{${decL(ys[1], 4)}}{${decL(b)}}=${decL(a, 4)}`, "rapport commun"), ligne(`${decL(dif, 4)}\\neq ${decL(a, 4)}`, "la ligne 3 donne une différence")],
    },
    corrigeB: {
      utilise: [t("Le facteur "), l("a"), t(" est le rapport constant de deux valeurs consécutives (cours, § 7).")],
      lignes: [ligne(`${decL(b)}\\cdot ${decL(a, 4)}=${decL(ys[1], 4)}`, "multiplier par a fait passer d'une valeur à la suivante")],
    },
    corrigeC: {
      utilise: [l("a=\\dfrac{f(1)}{f(0)}"), t(", puis "), l(`f(${T})=b\\cdot a^{${T}}`), t(" (cours, § 7).")],
      lignes: [ligne(`a=\\dfrac{${decL(ys[1], 4)}}{${decL(b)}}`, "rapport de deux valeurs consécutives"), ligne(`=${decL(a, 4)}`), ligne(`${decL(b)}\\cdot ${decL(a, 4)}^{${T}}=${decL(pred, 6)}`, [t("on remplace "), l("t"), t(" par "), l(`${T}`)])],
      verification: { utilise: [t("Le modèle redonne la dernière mesure :")], lignes: [ligne(`${decL(b)}\\cdot ${decL(a, 4)}^{3}=${decL(ys[3], 4)}`)] },
    },
  };
}

export function copie(e: E): CopieDetective {
  switch (e.scenario) {
    case "L":
      return scenarioL(e);
    case "S":
      return scenarioS(e);
    case "I":
      return scenarioI(e);
    case "R":
      return scenarioR(e);
    case "P1":
      return scenarioP1(e);
    case "P2":
      return scenarioP2(e);
    case "D1":
    case "D2":
      return scenarioD(e);
    case "C":
      return scenarioC(e);
    case "T":
      return scenarioT(e);
  }
}

export { nbL };
