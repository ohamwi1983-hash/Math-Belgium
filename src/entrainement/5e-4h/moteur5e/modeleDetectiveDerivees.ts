import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { ExerciceDetectiveDerivees, VarianteDetectiveDerivees } from "../core5e/detectiveDerivees.types";
import type { AideEcran, Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import { coefX, fracL, parL, plusL, polyL, polyV } from "../ui5e/ecrituresLimitesLotG";
import type { Q } from "../ui5e/nombresTrigo";
import { q, qAdd, qMul, qSub, qVal } from "../ui5e/nombresTrigo";

/**
 * Modèle de `5gen72` « Détective d'erreurs : dérivées » : à partir des paramètres entiers du
 * scénario, la copie de l'élève fictif (cohérente avec SON erreur), la ligne fausse, la bonne
 * description, la valeur corrigée (écran 3 : tangente ou extremums) et le contenu du corrigé détaillé
 * (contrôle de la ligne, règle illustrée, résolution reprise). Une seule source pour l'écran, le
 * papier et le corrigé. Même contrat que 5gen67 (copie canonique + lignes justes préliminaires ;
 * `av` lignes justes avant la ligne fausse).
 */

type E = ExerciceDetectiveDerivees;
const t = tx;
const l = lx;
const ft = texte;
const fl = latex;

export interface Droite {
  m: Q;
  q: Q;
}

export interface Extremums {
  /** Abscisse du maximum local (`null` : aucun). */
  xMax: number | null;
  xMin: number | null;
}

export type ValeurDetectiveDer = { genre: "droite"; droite: Droite } | ({ genre: "extremums" } & Extremums);

export interface BlocCorrigeDer {
  utilise: Frag[];
  lignes: LigneCalcul[];
}

export interface CopieDetectiveDer {
  enonce: Frag[];
  lignes: Frag[][];
  ligneFausse: number;
  regles: string[];
  regleCours: AideEcran;
  aideCorrection: AideEcran;
  valeur: ValeurDetectiveDer;
  /** Résultat (faux) de la copie : une saisie qui le reprend reçoit `piege`. */
  copieDroite?: Droite;
  copieExtremums?: Extremums;
  /** Point de tangence (famille tangente) : messages « pente juste / point juste ». */
  point?: { a: number; fa: Q; m: Q };
  piege: Frag[];
  corrigeA: BlocCorrigeDer;
  corrigeB: BlocCorrigeDer;
  corrigeC: BlocCorrigeDer & { verification?: BlocCorrigeDer };
  preliminaires: { ligne: Frag[]; regle: string }[];
}

// ============================================================================
// Écritures.
// ============================================================================

/** Rationnel en LaTeX. */
export const qL = (v: Q): string => fracL(v.n, v.d);
/** Facteur rationnel entre parenthèses s'il est négatif. */
const parQ = (v: Q): string => (v.n < 0 ? `\\left(${qL(v)}\\right)` : qL(v));
/** « + 3 », « − \dfrac{1}{2} », rien pour 0. */
const plusQ = (v: Q): string => (v.n === 0 ? "" : v.n > 0 ? `+${qL(v)}` : qL(v));
/** « mx + p » à coefficients rationnels (m ≠ 0). */
export function droiteL(d: Droite): string {
  const m = d.m;
  const coef = m.d === 1 ? coefX(m.n) : `${m.n < 0 ? "-" : ""}\\dfrac{${Math.abs(m.n)}}{${m.d}}x`;
  return `${coef}${plusQ(d.q)}`;
}
/** « y = f(a) + f′(a)(x − a) » avec les valeurs. */
function formeTangenteL(a: number, fa: Q, m: Q): string {
  const tete = fa.n === 0 ? "" : qL(fa);
  const coef = m.d === 1 && Math.abs(m.n) === 1 ? (m.n < 0 ? "-" : tete === "" ? "" : "+") : m.n < 0 || tete === "" ? qL(m) : `+${qL(m)}`;
  return `${tete}${coef}\\left(x${plusL(-a)}\\right)`;
}
/** Intervalle ouvert ]a ; b[ (±∞ permis). */
export function intL(a: number, b: number): string {
  const g = a === -Infinity ? "-\\infty" : `${a}`;
  const d = b === Infinity ? "+\\infty" : `${b}`;
  return `\\mathopen{]}${g}\\,;${d}\\mathclose{[}`;
}
const signeL = (s: number) => (s > 0 ? ">" : "<");
/** Substitution d'un polynôme entier en x = a : « 2\cdot(-1)^2-3\cdot(-1)+1 ». */
function substL(coefs: number[], a: number): string {
  const deg = coefs.length - 1;
  let s = "";
  coefs.forEach((c, i) => {
    const p = deg - i;
    if (c === 0) return;
    const signe = c < 0 ? "-" : s === "" ? "" : "+";
    const abs = Math.abs(c);
    const puiss = p === 0 ? "" : p === 1 ? parL(a) : `${parL(a)}^${p}`;
    const facteur = p === 0 ? `${abs}` : abs === 1 ? puiss : `${abs}\\cdot${puiss}`;
    s += `${signe}${facteur}`;
  });
  return s === "" ? "0" : s;
}
/** « c(u) » : facteur entier devant une parenthèse (1 → rien, −1 → « − »). */
const facteurPar = (c: number, u: string) => (c === 1 ? `(${u})` : c === -1 ? `-(${u})` : `${c}(${u})`);
/** Facteur « (x − r) », ou « x » pour r = 0. */
const facteurX = (r: number) => (r === 0 ? "x" : `(x${plusL(-r)})`);
const puissL = (u: string, n: number) => (n === 1 ? `(${u})` : `(${u})^{${n}}`);

// ============================================================================
// Descriptions (écran 2).
// ============================================================================

export const LEURRES: Record<VarianteDetectiveDerivees, string[]> = {
  produit: ["prConstante", "prDevelopper", "prImage"],
  quotient: ["quCarre", "quDomaine", "quNumerateur"],
  chaine: ["chExposant", "chDevelopper", "chImage"],
  inverse: ["inCarre", "inConstante", "inDenominateur"],
  formuleTangente: ["ftPente", "ftImage", "ftDerivee"],
  signeTrinome: ["stRacines", "stDerivee", "stMaxMin"],
  racineOubliee: ["roDerivee", "roPasSolution", "roMaxMin"],
  sansChangement: ["scPasRacine", "scDerivee", "scSigneF"],
};

export function descriptionFragments(id: string, e: E): Frag[] {
  const d = e.d;
  switch (id) {
    case "produit":
      return [t("La dérivée d'un produit n'est pas le produit des dérivées : "), l("(uv)'=u'v+uv'"), t(".")];
    case "prConstante":
      return [t("La dérivée de "), l(polyL([1, 0, d.p])), t(" est "), l(`2x${plusL(d.p)}`), t(" : la copie a oublié la constante.")];
    case "prDevelopper":
      return [t("On n'a pas le droit de dériver un produit sans l'avoir développé d'abord.")];
    case "prImage":
      return [t("f(a) est faux : on remplace x par a dans f′, pas dans f.")];
    case "quotient":
      return [t("Au numérateur de "), l("\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}"), t(", u′ vient en premier : la copie a inversé les deux termes (signe faux).")];
    case "quCarre":
      return [t("Le dénominateur de la dérivée d'un quotient est v, pas v².")];
    case "quDomaine":
      return [t("Le nombre a n'appartient pas au domaine de f : la tangente n'existe pas.")];
    case "quNumerateur":
      return [t("La dérivée de "), l(polyL([d.c, d.dd])), t(" est "), l(coefX(d.c)), t(".")];
    case "chaine":
      return [t("Règle de la chaîne : il fallait multiplier par la dérivée de l'intérieur, "), l(`(${polyL([d.c, d.dd])})'=${d.c}`), t(", que la copie a oubliée.")];
    case "chExposant":
      return [t("L'exposant ne descend pas : la dérivée de "), l("u^n"), t(" est "), l("u^{n-1}\\cdot u'"), t(".")];
    case "chDevelopper":
      return [t("La règle de la chaîne ne s'applique pas à une puissance : il fallait développer d'abord.")];
    case "chImage":
      return [t("f(a) est faux : la puissance a été mal calculée.")];
    case "inverse":
      return [l("\\left(\\dfrac{1}{x}\\right)'=-\\dfrac{1}{x^2}"), t(" : la copie a oublié le signe moins (la fonction inverse est décroissante).")];
    case "inCarre":
      return [t("La dérivée de "), l("x^2"), t(" est "), l("x"), t(" : on divise l'exposant par 2.")];
    case "inConstante":
      return [t("La dérivée de "), l(`\\dfrac{${Math.abs(d.k)}}{x}`), t(" est 0, car c'est une constante.")];
    case "inDenominateur":
      return [t("Il fallait d'abord tout réduire au même dénominateur : on ne dérive pas une somme terme à terme.")];
    case "formuleTangente":
      return [t("La tangente a pour équation "), l("y=f(a)+f'(a)(x-a)"), t(" : la copie a oublié « − a » ; sa droite a la bonne pente mais ne passe pas par le point de tangence.")];
    case "ftPente":
      return [t("La pente de la tangente est f(a), pas f′(a).")];
    case "ftImage":
      return [t("f′(a) est faux : on remplace x par a dans f, pas dans f′.")];
    case "ftDerivee":
      return [t("La dérivée de "), l(coefX(d.beta || 1)), t(" est "), l(coefX(d.beta || 1)), t(" : f′(x) est faux.")];
    case "signeTrinome":
      return [t("Un trinôme a le signe de son coefficient de "), l("x^2"), t(" à l'extérieur de ses racines (signe contraire entre elles) : la copie a inversé les signes de f′.")];
    case "stRacines":
      return [t("Les racines de f′ sont fausses : il fallait diviser par le coefficient de "), l("x^2"), t(" avant de les chercher.")];
    case "stDerivee":
      return [t("f′ est fausse : la dérivée de "), l(`${2 * d.alpha}x^3`), t(" est "), l(`${6 * d.alpha}x^3`), t(".")];
    case "stMaxMin":
      return [t("Un maximum local est là où f′ passe de − à + : la conclusion est fausse, pas le signe.")];
    case "racineOubliee":
      return [l(`x^2=${d.k * d.k}`), t(" a deux solutions, "), l(`x=-${d.k}`), t(" et "), l(`x=${d.k}`), t(" : la copie a oublié la solution négative.")];
    case "roDerivee":
      return [t("f′ est fausse : la dérivée de "), l(coefX(-3 * d.k * d.k * d.alpha)), t(" est "), l(`${-3 * d.k * d.k * d.alpha}x^2`), t(".")];
    case "roPasSolution":
      return [t("L'équation f′(x) = 0 n'a aucune solution : f n'a pas d'extremum.")];
    case "roMaxMin":
      return [t("Le signe est juste, mais un minimum local est là où f′ passe de + à −.")];
    case "sansChangement":
      return [t("En "), l("x=0"), t(", f′ s'annule sans changer de signe (facteur "), l("x^2"), t(", jamais négatif) : il n'y a pas d'extremum en 0.")];
    case "scPasRacine":
      return [l("x=0"), t(" n'est pas une solution de f′(x) = 0.")];
    case "scDerivee":
      return [t("f′ est fausse : la dérivée de "), l(`${3 * d.alpha}x^4`), t(" est "), l(`${12 * d.alpha}x^4`), t(".")];
    case "scSigneF":
      return [t("Le signe de f′ sur un intervalle se lit sur le signe de f, pas sur celui de f′.")];
  }
  return [t(id)];
}

// ============================================================================
// Famille TANGENTE.
// ============================================================================

const PRE_TANGENTE = (domaine: Frag[]) => [
  { ligne: domaine, regle: "domaine et dérivabilité" },
  { ligne: [t("Tangente au point d'abscisse a : "), l("y=f(a)+f'(a)(x-a)"), t(".")], regle: "équation de la tangente" },
];
const DOMAINE_POLY: Frag[] = [t("f est un polynôme : "), l("\\operatorname{dom}f=\\mathbb{R}"), t(", f est dérivable sur "), l("\\mathbb{R}"), t(".")];

/** Ligne « T : y = f(a) + f′(a)(x − a), donc y = mx + p ». */
function ligneTangente(a: number, fa: Q, m: Q): Frag[] {
  const d: Droite = { m, q: qSub(fa, qMul(m, q(a))) };
  return [t("Tangente : "), l(`y=${formeTangenteL(a, fa, m)}`), t(", donc "), l(`y=${droiteL(d)}`), t(".")];
}
const droiteDe = (a: number, fa: Q, m: Q): Droite => ({ m, q: qSub(fa, qMul(m, q(a))) });

/** Résolution reprise : f′(x) juste, f′(a), tangente développée ; vérification par le point. */
function repriseTangente(a: number, fa: Q, m: Q, fPrimeL: string, fPrimeAL: string, utiliseC: Frag[]): BlocCorrigeDer & { verification: BlocCorrigeDer } {
  const dr = droiteDe(a, fa, m);
  return {
    utilise: utiliseC,
    lignes: [
      ligne(`f'(x)=${fPrimeL}`, "dérivée juste"),
      ligne(`f'(${a})=${fPrimeAL}`, "on remplace x par a dans f′"),
      ligne(`y=${formeTangenteL(a, fa, m)}`, [ft("formule "), fl("y=f(a)+f'(a)(x-a)")]),
      ligne(`y=${droiteL(dr)}`, "on développe et on réduit"),
    ],
    verification: {
      utilise: [t("La tangente passe par le point de tangence "), l(`\\left(${a}\\,;${qL(fa)}\\right)`), t(" :")],
      lignes: [ligne(`${parQ(m)}\\cdot${parL(a)}${plusQ(dr.q)}=${qL(fa)}`, "on remplace x par a dans l'équation")],
    },
  };
}

function produit(e: E): CopieDetectiveDer {
  const { c, p, r, a } = e.d;
  const u = polyL([1, 0, p]);
  const v = polyL([c, r]);
  const fa = q((a * a + p) * (c * a + r));
  const coefsD = [3 * c, 2 * r, c * p];
  const m = q(polyV(coefsD, a));
  const mc = q(2 * c * a);
  const fPrime = polyL(coefsD);
  return {
    enonce: [t("Détermine une équation de la tangente à la courbe de f au point d'abscisse "), l(`${a}`), t(", pour "), l(`f(x)=(${u})(${v})`), t(".")],
    lignes: [
      [l(`f(${a})=${parL(a * a + p)}\\cdot${parL(c * a + r)}=${qL(fa)}`)],
      [l(`f'(x)=(${u})'\\cdot(${v})'=2x\\cdot${parL(c)}=${coefX(2 * c)}`)],
      [l(`f'(${a})=${2 * c}\\cdot${parL(a)}=${qL(mc)}`)],
      ligneTangente(a, fa, mc),
    ],
    ligneFausse: 1,
    regles: ["valeur de f en a", "dérivée d'un produit", "on remplace x par a dans f′", "équation de la tangente"],
    regleCours: { texte: [t("Dérivée d'un produit (cours, point 3) : "), l("(u\\cdot v)'=u'v+uv'"), t(" — jamais "), l("u'\\cdot v'"), t(".")] },
    aideCorrection: { texte: [t("Applique la règle du produit avec "), l(`u=${u}`), t(" et "), l(`v=${v}`), t(", puis recalcule f′(a) et la tangente.")] },
    valeur: { genre: "droite", droite: droiteDe(a, fa, m) },
    copieDroite: droiteDe(a, fa, mc),
    point: { a, fa, m },
    piege: [t("C'est la tangente de la copie : sa pente vient de "), l("u'\\cdot v'"), t(", qui n'est pas la dérivée du produit.")],
    corrigeA: {
      utilise: [t("On refait la ligne avec la règle du produit "), l("(uv)'=u'v+uv'"), t(" (cours, point 3).")],
      lignes: [
        ligne(`f'(x)=2x(${v})${c > 0 ? "+" : ""}${facteurPar(c, u)}`, [fl(`u'=2x`), ft(", "), fl(`v'=${c}`)]),
        ligne(`=${fPrime}`, [ft("et non "), fl(coefX(2 * c)), ft(" comme dans la copie")]),
      ],
    },
    corrigeB: {
      utilise: [t("Sur un exemple simple, le produit des dérivées ne redonne pas la dérivée du produit :")],
      lignes: [ligne("(x\\cdot x)'=(x^2)'=2x", "dérivée du produit"), ligne("x'\\cdot x'=1\\cdot 1=1", [ft("différent de "), fl("2x"), ft(" : la copie se trompe")])],
    },
    corrigeC: repriseTangente(a, fa, m, fPrime, `${substL(coefsD, a)}=${qL(m)}`, [t("On reprend à partir de la ligne fausse : règle du produit, puis formule de la tangente (cours, point 2).")]),
    preliminaires: PRE_TANGENTE(DOMAINE_POLY),
  };
}

function quotient(e: E): CopieDetectiveDer {
  const { c, dd, ee, a } = e.d;
  const u = polyL([c, dd]);
  const v = polyL([1, ee]);
  const fa = q(c * a + dd, a + ee);
  const num = c * ee - dd;
  const m = q(num, (a + ee) * (a + ee));
  const mc = q(-num, (a + ee) * (a + ee));
  return {
    enonce: [t("Détermine une équation de la tangente à la courbe de f au point d'abscisse "), l(`${a}`), t(", pour "), l(`f(x)=\\dfrac{${u}}{${v}}`), t(".")],
    lignes: [
      [l(`f(${a})=${a + ee === 1 || (a + ee > 0 && fa.d === a + ee) ? "" : `\\dfrac{${c * a + dd}}{${a + ee}}=`}${qL(fa)}`)],
      [l(`f'(x)=\\dfrac{(${u})\\cdot 1-${parL(c)}\\cdot(${v})}{(${v})^2}=\\dfrac{${-num}}{(${v})^2}`)],
      [l(`f'(${a})=\\dfrac{${-num}}{${parL(a + ee)}^2}=${qL(mc)}`)],
      ligneTangente(a, fa, mc),
    ],
    ligneFausse: 1,
    regles: ["valeur de f en a", "dérivée d'un quotient", "on remplace x par a dans f′", "équation de la tangente"],
    regleCours: { texte: [t("Dérivée d'un quotient (cours, point 3) : "), l("\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}"), t(" — l'ordre compte, u′ en premier.")] },
    aideCorrection: { texte: [t("Applique la règle du quotient avec "), l(`u=${u}`), t(" et "), l(`v=${v}`), t(" (u′ en premier au numérateur), puis recalcule f′(a) et la tangente.")] },
    valeur: { genre: "droite", droite: droiteDe(a, fa, m) },
    copieDroite: droiteDe(a, fa, mc),
    point: { a, fa, m },
    piege: [t("C'est la tangente de la copie : avec "), l("uv'-u'v"), t(" au numérateur, la pente a le mauvais signe.")],
    corrigeA: {
      utilise: [t("On refait la ligne avec "), l("\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}"), t(" (cours, point 3).")],
      lignes: [
        ligne(`f'(x)=\\dfrac{${parL(c)}\\cdot(${v})-(${u})\\cdot 1}{(${v})^2}`, "u′ en premier"),
        ligne(`=\\dfrac{${num}}{(${v})^2}`, [ft("et non "), fl(`\\dfrac{${-num}}{(${v})^2}`), ft(" comme dans la copie")]),
      ],
    },
    corrigeB: {
      utilise: [t("La règle redonne la dérivée connue de "), l("\\dfrac{1}{x}"), t(" ; l'ordre inversé donne le signe opposé :")],
      lignes: [ligne("\\dfrac{0\\cdot x-1\\cdot 1}{x^2}=-\\dfrac{1}{x^2}", "u′v − uv′ : juste"), ligne("\\dfrac{1\\cdot 1-0\\cdot x}{x^2}=\\dfrac{1}{x^2}", "uv′ − u′v : signe faux")],
    },
    corrigeC: repriseTangente(a, fa, m, `\\dfrac{${num}}{(${v})^2}`, `\\dfrac{${num}}{${parL(a + ee)}^2}=${qL(m)}`, [t("On reprend à partir de la ligne fausse : règle du quotient, puis formule de la tangente (cours, point 2).")]),
    preliminaires: PRE_TANGENTE([l(`\\operatorname{dom}f=\\mathbb{R}\\setminus\\{${-ee}\\}`), t(" ; f est dérivable sur son domaine.")]),
  };
}

function chaine(e: E): CopieDetectiveDer {
  const { n, c, dd, a } = e.d;
  const u = polyL([c, dd]);
  const w = c * a + dd;
  const fa = q(w ** n);
  const m = q(n * c * w ** (n - 1));
  const mc = q(n * w ** (n - 1));
  const prim = (k: number) => `${k === 1 ? "" : k === -1 ? "-" : k}${puissL(u, n - 1)}`;
  const puissW = n - 1 === 1 ? parL(w) : `${parL(w)}^{${n - 1}}`;
  return {
    enonce: [t("Détermine une équation de la tangente à la courbe de f au point d'abscisse "), l(`${a}`), t(", pour "), l(`f(x)=${puissL(u, n)}`), t(".")],
    lignes: [
      [l(`f(${a})=(${c}\\cdot${parL(a)}${plusL(dd)})^{${n}}=${parL(w)}^{${n}}=${qL(fa)}`)],
      [l(`f'(x)=${prim(n)}`)],
      [l(`f'(${a})=${n}\\cdot${puissW}=${qL(mc)}`)],
      ligneTangente(a, fa, mc),
    ],
    ligneFausse: 1,
    regles: ["valeur de f en a", "dérivée d'une puissance de fonction", "on remplace x par a dans f′", "équation de la tangente"],
    regleCours: { texte: [t("Règle de la chaîne (cours, point 3) : "), l("\\left(u^n\\right)'=n\\,u^{n-1}\\cdot u'"), t(" — on multiplie par la dérivée de l'intérieur.")] },
    aideCorrection: { texte: [t("L'intérieur est "), l(`u=${u}`), t(" : multiplie par "), l("u'"), t(", puis recalcule f′(a) et la tangente.")] },
    valeur: { genre: "droite", droite: droiteDe(a, fa, m) },
    copieDroite: droiteDe(a, fa, mc),
    point: { a, fa, m },
    piege: [t("C'est la tangente de la copie : il manque le facteur "), l(`${c}`), t(", dérivée de l'intérieur.")],
    corrigeA: {
      utilise: [t("On refait la ligne avec la règle de la chaîne "), l("(u^n)'=n\\,u^{n-1}\\cdot u'"), t(" (cours, point 3).")],
      lignes: [
        ligne(`f'(x)=${n}${puissL(u, n - 1)}\\cdot(${u})'`, "règle de la chaîne"),
        ligne(`=${n}${puissL(u, n - 1)}\\cdot${parL(c)}`, [fl(`u'=${c}`)]),
        ligne(`=${prim(n * c)}`, [ft("et non "), fl(prim(n)), ft(" comme dans la copie")]),
      ],
    },
    corrigeB: {
      utilise: [t("Sur un exemple qu'on peut développer, le facteur u′ est indispensable :")],
      lignes: [
        ligne("\\left((2x)^2\\right)'=(4x^2)'=8x", "en développant d'abord"),
        ligne("2\\cdot(2x)\\cdot 2=8x", "règle de la chaîne : même résultat"),
        ligne("2\\cdot(2x)=4x", "sans le facteur u′ = 2 : faux"),
      ],
    },
    corrigeC: repriseTangente(a, fa, m, prim(n * c), `${n * c}\\cdot${puissW}=${qL(m)}`, [t("On reprend à partir de la ligne fausse : règle de la chaîne, puis formule de la tangente (cours, point 2).")]),
    preliminaires: PRE_TANGENTE(DOMAINE_POLY),
  };
}

/** « + \dfrac{k}{x^p} » ou « − \dfrac{|k|}{x^p} ». */
const plusFracX = (k: number, den: string) => `${k < 0 ? "-" : "+"}\\dfrac{${Math.abs(k)}}{${den}}`;

function inverse(e: E): CopieDetectiveDer {
  const { alpha, k, a } = e.d;
  const fa = qAdd(q(alpha * a * a), q(k, a));
  const m = qSub(q(2 * alpha * a), q(k, a * a));
  const mc = qAdd(q(2 * alpha * a), q(k, a * a));
  const fFormule = `${alpha === 1 ? "" : alpha === -1 ? "-" : alpha}x^2${plusFracX(k, "x")}`;
  const fPrime = `${coefX(2 * alpha)}${plusFracX(-k, "x^2")}`;
  const fPrimeCopie = `${coefX(2 * alpha)}${plusFracX(k, "x^2")}`;
  return {
    enonce: [t("Détermine une équation de la tangente à la courbe de f au point d'abscisse "), l(`${a}`), t(", pour "), l(`f(x)=${fFormule}`), t(".")],
    lignes: [
      [l(`f(${a})=${alpha === 1 ? "" : `${alpha}\\cdot`}${parL(a)}^2${plusFracX(k, `${parL(a)}`)}=${qL(fa)}`)],
      [l(`f'(x)=${fPrimeCopie}`)],
      [l(`f'(${a})=${2 * alpha}\\cdot${parL(a)}${plusFracX(k, `${parL(a)}^2`)}=${qL(mc)}`)],
      ligneTangente(a, fa, mc),
    ],
    ligneFausse: 1,
    regles: ["valeur de f en a", "dérivée terme à terme", "on remplace x par a dans f′", "équation de la tangente"],
    regleCours: { texte: [t("Dérivée de référence (cours, point 3) : "), l("\\left(\\dfrac{1}{x}\\right)'=-\\dfrac{1}{x^2}"), t(", et "), l("(k\\cdot u)'=k\\cdot u'"), t(".")] },
    aideCorrection: { texte: [t("Dérive "), l(`\\dfrac{${k}}{x}=${k}\\cdot\\dfrac{1}{x}`), t(" avec la dérivée de référence, puis recalcule f′(a) et la tangente.")] },
    valeur: { genre: "droite", droite: droiteDe(a, fa, m) },
    copieDroite: droiteDe(a, fa, mc),
    point: { a, fa, m },
    piege: [t("C'est la tangente de la copie : la dérivée de "), l("\\dfrac{1}{x}"), t(" est négative.")],
    corrigeA: {
      utilise: [t("On refait la ligne avec "), l("\\left(\\dfrac{1}{x}\\right)'=-\\dfrac{1}{x^2}"), t(" (cours, point 3).")],
      lignes: [
        ligne(`\\left(\\dfrac{${k}}{x}\\right)'=${k}\\cdot\\left(-\\dfrac{1}{x^2}\\right)`, "constante en facteur"),
        ligne(`f'(x)=${fPrime}`, [ft("et non "), fl(fPrimeCopie), ft(" comme dans la copie")]),
      ],
    },
    corrigeB: {
      utilise: [t("La fonction inverse décroît sur "), l("\\mathopen{]}0\\,;+\\infty\\mathclose{[}"), t(" : sa dérivée y est négative.")],
      lignes: [ligne("\\dfrac{1}{2}<1", "l'inverse de 2 est plus petit que l'inverse de 1 : elle décroît"), ligne("\\left(\\dfrac{1}{x}\\right)'=-\\dfrac{1}{x^2}<0", "dérivée négative, d'où le signe moins")],
    },
    corrigeC: repriseTangente(a, fa, m, fPrime, `${2 * alpha}\\cdot${parL(a)}${plusFracX(-k, `${parL(a)}^2`)}=${qL(m)}`, [t("On reprend à partir de la ligne fausse : dérivée de référence de "), l("\\dfrac{1}{x}"), t(", puis formule de la tangente (cours, point 2).")]),
    preliminaires: PRE_TANGENTE([l("\\operatorname{dom}f=\\mathbb{R}_0"), t(" ; f est dérivable sur son domaine.")]),
  };
}

function formuleTangente(e: E): CopieDetectiveDer {
  const { alpha, beta, gamma, a } = e.d;
  const coefs = [alpha, beta, gamma];
  const coefsD = [2 * alpha, beta];
  const fa = q(polyV(coefs, a));
  const m = q(polyV(coefsD, a));
  const copieD: Droite = { m, q: fa };
  return {
    enonce: [t("Détermine une équation de la tangente à la courbe de f au point d'abscisse "), l(`${a}`), t(", pour "), l(`f(x)=${polyL(coefs)}`), t(".")],
    lignes: [
      [l(`f(${a})=${substL(coefs, a)}=${qL(fa)}`)],
      [l(`f'(x)=${polyL(coefsD)}`)],
      [l(`f'(${a})=${substL(coefsD, a)}=${qL(m)}`)],
      [t("Tangente : "), l(`y=f'(${a})\\,x+f(${a})=${droiteL(copieD)}`), t(".")],
      [t("Donc la tangente coupe l'axe des ordonnées au point "), l(`\\left(0\\,;${qL(fa)}\\right)`), t(".")],
    ],
    ligneFausse: 3,
    regles: ["valeur de f en a", "dérivée d'un polynôme", "on remplace x par a dans f′", "équation de la tangente", "lecture de l'ordonnée à l'origine"],
    regleCours: { texte: [t("Équation de la tangente au point d'abscisse a (cours, point 2) : "), l("y=f(a)+f'(a)(x-a)"), t(".")] },
    aideCorrection: { texte: [t("Remplace dans "), l("y=f(a)+f'(a)(x-a)"), t(" les valeurs de f(a) et de f′(a) de la copie (elles sont justes), puis développe.")] },
    valeur: { genre: "droite", droite: droiteDe(a, fa, m) },
    copieDroite: copieD,
    point: { a, fa, m },
    piege: [t("C'est la droite de la copie : elle a la bonne pente, mais elle ne passe pas par "), l(`\\left(${a}\\,;${qL(fa)}\\right)`), t(".")],
    corrigeA: {
      utilise: [t("On refait la ligne avec la formule du cours : "), l("y=f(a)+f'(a)(x-a)"), t(" (point 2).")],
      lignes: [
        ligne(`y=${formeTangenteL(a, fa, m)}`, "formule de la tangente"),
        ligne(`y=${droiteL(droiteDe(a, fa, m))}`, [ft("et non "), fl(`y=${droiteL(copieD)}`), ft(" comme dans la copie")]),
      ],
    },
    corrigeB: {
      utilise: [t("La droite de la copie ne passe pas par le point de tangence :")],
      lignes: [ligne(`${parQ(m)}\\cdot${parL(a)}${plusQ(fa)}=${qL(qAdd(qMul(m, q(a)), fa))}`, [ft("en x = a, on devrait trouver f(a) = "), fl(qL(fa))])],
    },
    corrigeC: repriseTangente(a, fa, m, polyL(coefsD), `${substL(coefsD, a)}=${qL(m)}`, [t("f(a), f′(x) et f′(a) étaient justes ; on reprend la formule de la tangente (cours, point 2).")]),
    preliminaires: [
      { ligne: DOMAINE_POLY, regle: "domaine et dérivabilité" },
      { ligne: [t("Il faut f(a) et f′(a).")], regle: "organisation du calcul" },
    ],
  };
}

// ============================================================================
// Famille SIGNE (extremums locaux).
// ============================================================================

const PRE_SIGNE = [
  { ligne: DOMAINE_POLY, regle: "domaine et dérivabilité" },
  { ligne: [t("Les extremums locaux sont aux zéros de f′ où f′ change de signe.")], regle: "condition d'extremum" },
];
const ENONCE_SIGNE = (coefs: number[]): Frag[] => [t("Détermine les extremums locaux (abscisse et nature) de la fonction "), l(`f(x)=${polyL(coefs)}`), t(".")];

/** Conclusion « maximum local en x = …, minimum local en x = … » (rédigée). */
export function conclusionFragments(ex: Extremums): Frag[] {
  const parts: Frag[][] = [];
  if (ex.xMax !== null) parts.push([t("un maximum local en "), l(`x=${ex.xMax}`)]);
  if (ex.xMin !== null) parts.push([t("un minimum local en "), l(`x=${ex.xMin}`)]);
  if (parts.length === 1) return [t("f admet un seul extremum local : "), ...parts[0]!, t(".")];
  return [t("f admet "), ...parts[0]!, t(" et "), ...parts[1]!, t(".")];
}
/** Réponse brève « x_max = … ; x_min = … » (« aucun » en texte). */
export function reponseExtremums(ex: Extremums): Frag[] {
  const un = (nom: string, v: number | null): Frag[] => (v === null ? [l(nom), t(" : aucun")] : [l(`${nom}=${v}`)]);
  return [...un("x_{\\max}", ex.xMax), t(" et "), ...un("x_{\\min}", ex.xMin)];
}
const valF = (coefs: number[], x: number) => polyV(coefs, x);
/** Signe de f′ en mots sur un intervalle : ligne de calcul. */
const ligneSigne = (s: number, a: number, b: number, why: string | Frag[]) => ligne(`f'(x)${signeL(s)}0`, [ft("sur "), fl(intL(a, b)), ...(typeof why === "string" ? [ft(` : ${why}`)] : [ft(" : "), ...why])]);

function signeTrinome(e: E): CopieDetectiveDer {
  const { r1, r2, alpha, delta } = e.d;
  const S = r1 + r2;
  const P = r1 * r2;
  const coefs = [2 * alpha, -3 * alpha * S, 6 * alpha * P, delta];
  const coefsD = [6 * alpha, -6 * alpha * S, 6 * alpha * P];
  const sa = Math.sign(alpha);
  const vrai: Extremums = sa > 0 ? { xMax: r1, xMin: r2 } : { xMax: r2, xMin: r1 };
  const faux: Extremums = sa > 0 ? { xMax: r2, xMin: r1 } : { xMax: r1, xMin: r2 };
  const ext = `${intL(-Infinity, r1)}\\cup${intL(r2, Infinity)}`;
  const xTest = r2 + 1;
  const mid = q(r1 + r2, 2);
  const fpMid = qMul(q(6 * alpha), qMul(qSub(mid, q(r1)), qSub(mid, q(r2))));
  return {
    enonce: ENONCE_SIGNE(coefs),
    lignes: [
      [l(`f'(x)=${polyL(coefsD)}`)],
      [l(`f'(x)=0\\iff ${polyL([1, -S, P])}=0`), t(", donc "), l(`x=${r1}`), t(" ou "), l(`x=${r2}`), t(".")],
      [l(`f'(x)${signeL(sa)}0`), t(" sur "), l(intL(r1, r2)), t(" et "), l(`f'(x)${signeL(-sa)}0`), t(" sur "), l(ext), t(" (signe de "), l(`${6 * alpha}`), t(" entre les racines).")],
      [t("Donc "), ...conclusionFragments(faux)],
    ],
    ligneFausse: 2,
    regles: ["dérivée d'un polynôme", "zéros d'un trinôme", "signe d'un trinôme", "lecture des extremums"],
    regleCours: { texte: [t("Signe d'un trinôme (cours, point 4) : signe de a à l'extérieur des racines, signe contraire entre elles ; maximum là où f′ passe de + à −.")] },
    aideCorrection: { texte: [t("Écris "), l(`f'(x)=${6 * alpha}${facteurX(r1)}${facteurX(r2)}`), t(" et contrôle le signe en une valeur de chaque intervalle.")] },
    valeur: { genre: "extremums", ...vrai },
    copieExtremums: faux,
    piege: [t("C'est la conclusion de la copie : maximum et minimum sont échangés, car ses signes de f′ sont inversés.")],
    corrigeA: {
      utilise: [t("On refait la ligne en contrôlant le signe de f′ par une valeur de chaque côté.")],
      lignes: [
        ligne(`f'(x)=${6 * alpha}${facteurX(r1)}${facteurX(r2)}`, "forme factorisée"),
        ligne(`f'(${xTest})=${valF(coefsD, xTest)}`, [ft(`${valF(coefsD, xTest) > 0 ? "positif" : "négatif"}, à l'extérieur des racines`)]),
        ligne(`f'\\left(${qL(mid)}\\right)=${qL(fpMid)}`, [ft(`${qVal(fpMid) > 0 ? "positif" : "négatif"} entre les racines, et non ${qVal(fpMid) > 0 ? "négatif" : "positif"} comme dans la copie`)]),
      ],
    },
    corrigeB: {
      utilise: [t("Exemple : "), l("x^2-1=(x-1)(x+1)"), t(", de coefficient a = 1 > 0 :")],
      lignes: [ligne("0^2-1=-1<0", "entre les racines −1 et 1 : signe contraire de a"), ligne("2^2-1=3>0", "à l'extérieur : signe de a")],
    },
    corrigeC: {
      utilise: [t("On reprend à partir de la ligne fausse : signe de f′, puis lecture des extremums (cours, points 4 et 5).")],
      lignes: [
        ligneSigne(sa, -Infinity, r1, "signe de a"),
        ligneSigne(-sa, r1, r2, "signe contraire de a"),
        ligneSigne(sa, r2, Infinity, "signe de a"),
        ligne(`x_{\\max}=${vrai.xMax}`, "f′ passe de + à − : f croît puis décroît"),
        ligne(`x_{\\min}=${vrai.xMin}`, "f′ passe de − à + : f décroît puis croît"),
      ],
      verification: {
        utilise: [t("Le maximum local est plus haut que le minimum local :")],
        lignes: [ligne(`f(${vrai.xMax})=${valF(coefs, vrai.xMax!)}`, "valeur au maximum"), ligne(`f(${vrai.xMin})=${valF(coefs, vrai.xMin!)}`, "valeur au minimum")],
      },
    },
    preliminaires: PRE_SIGNE,
  };
}

function racineOubliee(e: E): CopieDetectiveDer {
  const { k, alpha, delta } = e.d;
  const coefs = [alpha, 0, -3 * alpha * k * k, delta];
  const coefsD = [3 * alpha, 0, -3 * alpha * k * k];
  const sa = Math.sign(alpha);
  const vrai: Extremums = sa > 0 ? { xMax: -k, xMin: k } : { xMax: k, xMin: -k };
  const faux: Extremums = sa > 0 ? { xMax: null, xMin: k } : { xMax: k, xMin: null };
  return {
    enonce: ENONCE_SIGNE(coefs),
    lignes: [
      [l(`f'(x)=${polyL(coefsD)}`)],
      [l(`f'(x)=0\\iff x^2=${k * k}\\iff x=${k}`)],
      [l(`f'(x)${signeL(-sa)}0`), t(" sur "), l(intL(-Infinity, k)), t(" et "), l(`f'(x)${signeL(sa)}0`), t(" sur "), l(intL(k, Infinity)), t(".")],
      [t("Donc "), ...conclusionFragments(faux)],
    ],
    ligneFausse: 1,
    regles: ["dérivée d'un polynôme", "résolution de f′(x) = 0", "signe de f′", "lecture des extremums"],
    regleCours: { texte: [t("Une équation "), l("x^2=c"), t(" avec "), l("c>0"), t(" a deux solutions, "), l("-\\sqrt{c}"), t(" et "), l("\\sqrt{c}"), t(" ; on étudie ensuite le signe de f′ autour de chacune (cours, points 4 et 5).")] },
    aideCorrection: { texte: [t("Factorise "), l(`f'(x)=${3 * alpha}(x^2-${k * k})`), t(" à l'aide de "), l("a^2-b^2=(a-b)(a+b)"), t(", puis étudie le signe autour des deux racines.")] },
    valeur: { genre: "extremums", ...vrai },
    copieExtremums: faux,
    piege: [t("C'est la conclusion de la copie : elle a oublié la solution "), l(`x=-${k}`), t(".")],
    corrigeA: {
      utilise: [t("On refait la ligne : un carré efface le signe.")],
      lignes: [ligne(`x^2=${k * k}\\iff x\\in\\{-${k}\\,;${k}\\}`, "deux solutions"), ligne(`(-${k})^2=${k * k}`, [ft("donc "), fl(`-${k}`), ft(" est aussi solution, oubliée par la copie")])],
    },
    corrigeB: {
      utilise: [t("Exemple : "), l("x^2=9"), t(" a deux solutions.")],
      lignes: [ligne("3^2=9", "3 convient"), ligne("(-3)^2=9", "−3 convient aussi")],
    },
    corrigeC: {
      utilise: [t("On reprend à partir de la ligne fausse : f′ factorisée, signe, extremums (cours, points 4 et 5).")],
      lignes: [
        ligne(`f'(x)=${3 * alpha}(x+${k})(x-${k})`, "a² − b² = (a − b)(a + b)"),
        ligneSigne(sa, -Infinity, -k, "signe de a, à l'extérieur des racines"),
        ligneSigne(-sa, -k, k, "entre les racines"),
        ligneSigne(sa, k, Infinity, "signe de a, à l'extérieur des racines"),
        ligne(`x_{\\max}=${vrai.xMax}`, "f′ passe de + à −"),
        ligne(`x_{\\min}=${vrai.xMin}`, "f′ passe de − à +"),
      ],
      verification: {
        utilise: [t("Le maximum local est plus haut que le minimum local :")],
        lignes: [ligne(`f(${vrai.xMax})=${valF(coefs, vrai.xMax!)}`, "valeur au maximum"), ligne(`f(${vrai.xMin})=${valF(coefs, vrai.xMin!)}`, "valeur au minimum")],
      },
    },
    preliminaires: PRE_SIGNE,
  };
}

function sansChangement(e: E): CopieDetectiveDer {
  const { m, alpha, delta } = e.d;
  const coefs = [3 * alpha, -4 * alpha * m, 0, 0, delta];
  const coefsD = [12 * alpha, -12 * alpha * m, 0, 0];
  const sa = Math.sign(alpha);
  const r1 = Math.min(0, m);
  const r2 = Math.max(0, m);
  // Signes VRAIS : droite = signe de α ; x² ne change pas de signe en 0.
  const vraiG = -sa;
  const vraiM = m > 0 ? -sa : sa;
  // Copie : signes alternés à chaque racine, à partir de la droite.
  const copG = sa;
  const copM = -sa;
  const vrai: Extremums = sa > 0 ? { xMax: null, xMin: m } : { xMax: m, xMin: null };
  const faux: Extremums = sa > 0 ? { xMax: r1, xMin: r2 } : { xMax: r2, xMin: r1 };
  const c12 = 12 * alpha === 12 ? "12" : "-12";
  const fpDemi = (x: Q) => qMul(q(12 * alpha), qMul(qMul(x, x), qSub(x, q(m))));
  const moinsDemi = q(-1, 2);
  const demi = q(1, 2);
  return {
    enonce: ENONCE_SIGNE(coefs),
    lignes: [
      [l(`f'(x)=${polyL(coefsD)}`)],
      [l(`f'(x)=${c12}x^2(${polyL([1, -m])})`), t(" s'annule en "), l("x=0"), t(" et en "), l(`x=${m}`), t(".")],
      [l(`f'(x)${signeL(copG)}0`), t(" sur "), l(intL(-Infinity, r1)), t(", "), l(`f'(x)${signeL(copM)}0`), t(" sur "), l(intL(r1, r2)), t(" et "), l(`f'(x)${signeL(sa)}0`), t(" sur "), l(intL(r2, Infinity)), t(".")],
      [t("Donc "), ...conclusionFragments(faux)],
    ],
    ligneFausse: 2,
    regles: ["dérivée d'un polynôme", "zéros de f′ (mise en évidence)", "signe de f′", "lecture des extremums"],
    regleCours: { texte: [t("Un zéro de f′ n'est un extremum que si f′ y change de signe (cours, point 5) ; un facteur "), l("x^2"), t(" ne change jamais de signe.")] },
    aideCorrection: { texte: [t("Dans "), l(`f'(x)=${c12}x^2(${polyL([1, -m])})`), t(", le facteur "), l("x^2"), t(" est toujours positif ou nul : étudie le signe du reste.")] },
    valeur: { genre: "extremums", ...vrai },
    copieExtremums: faux,
    piege: [t("C'est la conclusion de la copie : en 0, f′ s'annule sans changer de signe.")],
    corrigeA: {
      utilise: [t("On refait la ligne en contrôlant le signe de f′ de part et d'autre de 0.")],
      lignes: [
        ligne(`f'\\left(-\\dfrac{1}{2}\\right)=${qL(fpDemi(moinsDemi))}`, "à gauche de 0"),
        ligne(`f'\\left(\\dfrac{1}{2}\\right)=${qL(fpDemi(demi))}`, "à droite de 0 : même signe, f′ ne change pas de signe en 0"),
      ],
    },
    corrigeB: {
      utilise: [t("Exemple : "), l("g(x)=x^3"), t(" a une tangente horizontale en 0 sans extremum.")],
      lignes: [ligne("g'(x)=3x^2\\geq 0", "un carré n'est jamais négatif"), ligne("g'(0)=0", "g croît des deux côtés de 0 : pas d'extremum")],
    },
    corrigeC: {
      utilise: [t("On reprend à partir de la ligne fausse : signe de f′ (le facteur "), l("x^2"), t(" est positif), puis extremums (cours, points 4 et 5).")],
      lignes: [
        ligneSigne(vraiG, -Infinity, r1, [fl("x^2>0"), ft(" et "), fl(`x${plusL(-m)}<0`)]),
        ligneSigne(vraiM, r1, r2, m > 0 ? [fl("x^2>0"), ft(" et "), fl(`x${plusL(-m)}<0`)] : [fl("x^2>0"), ft(" et "), fl(`x${plusL(-m)}>0`)]),
        ligneSigne(sa, r2, Infinity, [fl("x^2>0"), ft(" et "), fl(`x${plusL(-m)}>0`)]),
        ligne(vrai.xMax === null ? `x_{\\min}=${m}` : `x_{\\max}=${m}`, vrai.xMax === null ? "f′ passe de − à +" : "f′ passe de + à −"),
        ligne("x=0", "f′ s'annule sans changer de signe : pas d'extremum"),
      ],
      verification: {
        utilise: [t("Valeur de l'extremum :")],
        lignes: [ligne(`f(${m})=${valF(coefs, m)}`, vrai.xMax === null ? "minimum local" : "maximum local")],
      },
    },
    preliminaires: PRE_SIGNE,
  };
}

function copieCanonique(e: E): CopieDetectiveDer {
  switch (e.variante) {
    case "produit":
      return produit(e);
    case "quotient":
      return quotient(e);
    case "chaine":
      return chaine(e);
    case "inverse":
      return inverse(e);
    case "formuleTangente":
      return formuleTangente(e);
    case "signeTrinome":
      return signeTrinome(e);
    case "racineOubliee":
      return racineOubliee(e);
    case "sansChangement":
      return sansChangement(e);
  }
}

/** Copie finale : `av` lignes justes (préliminaires puis lignes justes de la copie canonique, les
 * dernières gardées) avant la ligne fausse, puis ses conséquences. */
function assembler(c: CopieDetectiveDer, av: number): CopieDetectiveDer {
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

const CACHE = new WeakMap<E, CopieDetectiveDer>();
export function copie(e: E): CopieDetectiveDer {
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

/** Valeur numérique d'une droite en x (contrôles). */
export const valeurDroite = (d: Droite, x: number): number => qVal(d.m) * x + qVal(d.q);
