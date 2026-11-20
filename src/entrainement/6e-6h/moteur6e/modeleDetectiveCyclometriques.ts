import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";
import type { ExerciceDetectiveCyclo, VarianteDetectiveCyclo } from "../core6e/detectiveCyclometriques.types";
import type { ExerciceArcTrig, Trig } from "../core6e/identitesCyclometriques.types";
import type { Frag } from "../ui6e/ecransExp.types";
import { lx, tx } from "../ui6e/ecransExp.types";
import { affineL, termeL } from "../ui6e/nombresExp";
import type { Q } from "../ui6e/nombresRecip";
import { piL, q, qL, qLi, racineQ, radL, radDiv, radQ, radV } from "../ui6e/nombresRecip";
import { IMAGE_L, lignesComparaison, lignesRamener, phiK12 } from "./modeleIdentitesCyclometriques";

/**
 * Modèle de `6gen152` « Le détective d'erreurs : réciproques et arcfonctions » : à partir des
 * paramètres entiers du scénario, la copie de l'élève fictif (cohérente avec SON erreur), la ligne
 * fausse, la bonne description, les valeurs corrigées (écran 3) et le contenu du corrigé détaillé
 * (contrôle de la ligne, règle, résolution reprise). Une seule source pour l'écran, le papier et le
 * corrigé. Même contrat que 6gen144 (`CopieDetective`).
 */

type E = ExerciceDetectiveCyclo;
const t = tx;
const l = lx;

export type GenreValeurCyclo = "fonction" | "nombre" | "ensemble" | "intervalle";

export interface IntervalleCyclo {
  gauche: number;
  droite: number;
  gaucheFermee: boolean;
  droiteFermee: boolean;
}

export interface ValeurDetectiveCyclo {
  genre: GenreValeurCyclo;
  label: string;
  labelLatex: string;
  placeholder: string;
  nombre?: number;
  fonction?: (x: number) => number;
  /** Points de contrôle d'une fonction (dans son domaine). */
  points?: number[];
  ensemble?: number[];
  intervalle?: IntervalleCyclo;
  latex: string;
}

export interface BlocCorrigeCyclo {
  utilise: Frag[];
  lignes: LigneCalcul[];
}

export interface CopieDetectiveCyclo {
  enonce: Frag[];
  lignes: Frag[][];
  ligneFausse: number;
  regles: string[];
  regleCours: { texte: Frag[]; latex?: string };
  aideCorrection: { texte: Frag[]; latex?: string };
  valeurs: ValeurDetectiveCyclo[];
  /** Valeurs (fausses) de la copie dans l'ordre des champs (NaN : sans objet) ; fonction de la copie. */
  valeursCopie: number[];
  fonctionCopie?: (x: number) => number;
  ensembleCopie?: number[];
  piege: Frag[];
  corrigeA: BlocCorrigeCyclo;
  corrigeB: BlocCorrigeCyclo;
  corrigeC: BlocCorrigeCyclo & { verification?: BlocCorrigeCyclo };
  /** Valeurs des variables pour le contrôle numérique du corrigé (x, y…). */
  candidats: Record<string, number>[];
}

// ============================================================================
// Descriptions (écran 2).
// ============================================================================

export const LEURRES: Record<VarianteDetectiveCyclo, string[]> = {
  inverse: ["inverse_a", "inverse_deriver", "inverse_bijective"],
  arcsinSin: ["arcsinSin_jamais", "arcsinSin_degres", "arcsinSin_somme"],
  signeArccos: ["signe_uprime", "signe_carre", "signe_racine"],
  uprime: ["uprime_signe", "uprime_carre", "uprime_cos"],
  carre: ["carre_signe", "carre_uprime", "carre_arctan"],
  ce: ["ce_injective", "ce_trinome", "ce_carre"],
  sens: ["sens_ajouter", "sens_ouvert", "sens_multiplier"],
  arctan: ["arctan_R", "arctan_c", "arctan_decroissante"],
  injectivite: ["inj_signe", "inj_domaine", "inj_jamais"],
};

const U0: Q[] = [q(1, 2), q(3, 5), q(4, 5)];
const U0_TAN: Q[] = [q(1), q(2), q(1, 2)];
const TRIG: Trig[] = ["sin", "cos"];

/** u₀ du scénario de dérivée (arcsin / arccos : U0 ; arctan : U0_TAN). */
export function u0De(e: E): Q {
  return (e.variante === "uprime" ? U0_TAN : U0)[e.donnees.iu];
}

/** x₀ = u₀ / k. */
const x0De = (e: E): Q => q(u0De(e).n, u0De(e).d * e.donnees.k);

export function descriptionFragments(id: string, e: E): Frag[] {
  const d = e.donnees;
  switch (id) {
    // ---- justes
    case "inverse":
      return [l("f^{-1}"), t(" n'est pas "), l("\\dfrac{1}{f}"), t(" : la réciproque défait "), l("f"), t(" (on résout "), l("y=f(x)"), t(" en "), l("x"), t("), alors que "), l("\\dfrac{1}{f(x)}"), t(" est l'inverse du nombre "), l("f(x)"), t(".")];
    case "arcsinSin": {
      const fn = TRIG[d.fn];
      return [l(`\\arc${fn}(\\${fn}\\theta)=\\theta`), t(" seulement si "), l(`\\theta\\in ${IMAGE_L[fn]}`), t(" ; ici "), l(`\\theta=${piL(d.k12, 12)}`), t(" est hors de l'image.")];
    }
    case "signeArccos":
      return [t("La dérivée de "), l("\\arccos u"), t(" est "), l("-\\dfrac{u'}{\\sqrt{1-u^{2}}}"), t(" : le signe « − » a été oublié.")];
    case "uprime":
      return [t("Dérivée d'une composée : "), l("(\\arctan u)'=\\dfrac{u'}{1+u^{2}}"), t(" ; le facteur "), l(`u'=${d.k}`), t(" a été oublié.")];
    case "carre":
      return [l(`(${d.k}x)^{2}=${d.k * d.k}x^{2}`), t(" : le carré porte aussi sur le coefficient "), l(`${d.k}`), t(".")];
    case "ce":
      return [t("La condition d'existence n'a pas été vérifiée : pour "), l(`x=${d.x2}`), t(", l'argument vaut "), l(`${d.m * d.x2 + d.n}`), t(", hors de "), l("[-1\\,;\\,1]"), t(".")];
    case "sens":
      return [t("En divisant par "), l(`-${d.k}`), t(" (un nombre négatif), le sens des deux inégalités change.")];
    case "arctan":
      return [l("\\arctan x"), t(" n'atteint jamais "), l("\\pm\\dfrac{\\pi}{2}"), t(" (asymptotes horizontales) : son image est l'intervalle ouvert "), l(IMAGE_L.tan), t(".")];
    case "injectivite":
      return [l("f"), t(" est décroissante sur chacun des intervalles "), l("\\mathopen{]}-\\infty\\,;\\,0\\mathclose{[}"), t(" et "), l("\\mathopen{]}0\\,;\\,+\\infty\\mathclose{[}"), t(", pas sur leur réunion : on ne peut pas conclure à l'injectivité.")];
    // ---- leurres
    case "inverse_a":
      return [t("Il fallait diviser par "), l(`${d.a}`), t(" et non par "), l(`${affineL(d.a, d.b)}`), t(", sans rien changer d'autre.")];
    case "inverse_deriver":
      return [t("Il fallait d'abord dériver "), l("f"), t(".")];
    case "inverse_bijective":
      return [l("f"), t(" n'est pas bijective : "), l("f^{-1}"), t(" n'existe pas.")];
    case "arcsinSin_jamais":
      return [t("Une arcfonction et sa fonction trigonométrique ne se simplifient jamais.")];
    case "arcsinSin_degres":
      return [t("Il fallait d'abord convertir l'angle en degrés.")];
    case "arcsinSin_somme":
      return [t("La somme finale devait être ramenée dans "), l("[0\\,;\\,2\\pi["), t(".")];
    case "signe_uprime":
    case "carre_uprime":
      return [t("Le facteur "), l("u'"), t(" a été oublié.")];
    case "signe_carre":
    case "uprime_carre":
      return [t("Le carré ne porte que sur "), l("x"), t(" : il fallait écrire "), l(`${d.k}x^{2}`), t(".")];
    case "signe_racine":
      return [t("La racine carrée devait être au numérateur.")];
    case "uprime_signe":
    case "carre_signe":
      return [t("Il manque un signe « − » devant la fraction.")];
    case "uprime_cos":
      return [l("\\arctan"), t(" se dérive en "), l("\\dfrac{1}{\\cos^{2}u}"), t(".")];
    case "carre_arctan":
      return [t("La dérivée de "), l("\\arcsin u"), t(" est "), l("\\dfrac{u'}{1+u^{2}}"), t(".")];
    case "ce_injective":
      return [l(`\\arc${TRIG[d.fn]}`), t(" n'est pas injective : on ne peut pas égaler les arguments.")];
    case "ce_trinome":
      return [t("Les racines du trinôme sont mal calculées.")];
    case "ce_carre":
      return [t("Il fallait élever les deux membres au carré.")];
    case "sens_ajouter":
      return [t("Il fallait ajouter "), l(`${Math.abs(d.a)}`), t(" au lieu de le retirer.")];
    case "sens_ouvert":
      return [t("Le domaine de "), l("\\arcsin"), t(" est "), l("\\mathopen{]}-1\\,;\\,1\\mathclose{[}"), t(" : les bornes sont exclues.")];
    case "sens_multiplier":
      return [t("Il fallait multiplier par "), l(`${d.k}`), t(" au lieu de diviser.")];
    case "arctan_R":
      return [t("L'image de "), l("\\arctan"), t(" est "), l("\\mathbb{R}"), t(".")];
    case "arctan_c":
      return [t("Il fallait multiplier aussi la constante "), l(`${d.c}`), t(" par "), l(`${d.k}`), t(".")];
    case "arctan_decroissante":
      return [l("\\arctan"), t(" est décroissante : les bornes s'échangent.")];
    case "inj_signe":
      return [l("f'"), t(" est positive, pas négative.")];
    case "inj_domaine":
      return [t("Le domaine de "), l("f"), t(" est "), l("\\mathbb{R}"), t(" tout entier.")];
    case "inj_jamais":
      return [t("Une fonction décroissante n'est jamais injective.")];
  }
  return [t(id)];
}

// ============================================================================
// Scénarios.
// ============================================================================

const plusL = (a: string, b: string): string => (b.startsWith("-") ? `${a}${b}` : `${a}+${b}`);
const parN = (v: number | string): string => (String(v).startsWith("-") ? `(${v})` : `${v}`);
const parL = (s: string): string => (s.startsWith("-") ? `\\left(${s}\\right)` : s);
const nb = (v: number): string => (v < 0 ? `−${-v}` : `${v}`);
const retirer = (v: number): string => (v >= 0 ? `on retire ${v}` : `on ajoute ${-v}`);
const ajouter = (v: number): string => (v >= 0 ? `on ajoute ${v}` : `on retire ${-v}`);

function scenarioInverse(e: E): CopieDetectiveCyclo {
  const { a, b, xs } = e.donnees;
  const c = a * xs + b;
  const D = a * c + b;
  const f = affineL(a, b);
  const fx = (x: number) => (x - b) / a;
  const verifQ = q(a + b * D, D);
  // (v − b)/a écrit avec un dénominateur positif : (b − v)/|a| quand a < 0
  const quot = (v: string): string => (a > 0 ? `\\dfrac{${v}${termeL(-b)}}{${a}}` : `\\dfrac{${b}-${v}}{${-a}}`);
  return {
    enonce: [t("Détermine la réciproque de "), l(`f(x)=${f}`), t(", puis calcule "), l(`f^{-1}(${c})`), t(".")],
    lignes: [
      [l("f"), t(" est affine avec "), l(`a=${a}\\neq 0`), t(" : elle est bijective de "), l("\\mathbb{R}"), t(" dans "), l("\\mathbb{R}"), t(".")],
      [l(`f^{-1}(x)=\\dfrac{1}{${f}}`)],
      [l(`f^{-1}(${c})=\\dfrac{1}{${a}\\cdot ${parN(c)}${termeL(b)}}`)],
      [l(`f^{-1}(${c})=${qL(q(1, D))}`)],
    ],
    ligneFausse: 1,
    regles: ["affine non constante : bijective", "expression de la réciproque", "on remplace x", "calcul"],
    regleCours: { texte: [t("La réciproque défait "), l("f"), t(" : on résout "), l("y=f(x)"), t(" en "), l("x"), t(", puis on échange les noms (cours, § 1) :")], latex: "f\\left(f^{-1}(x)\\right)=x" },
    aideCorrection: { texte: [t("Isole "), l("x"), t(" dans "), l(`y=${f}`), t(" (retire "), l(`${b}`), t(", divise par "), l(`${a}`), t("), puis remplace "), l("x"), t(" par "), l(`${c}`), t(".")] },
    valeurs: [
      { genre: "fonction", label: "f⁻¹(x)", labelLatex: "f^{-1}(x)=", placeholder: "ex. : (x+7)/6", fonction: fx, points: [-2.3, -0.6, 0.7, 1.9, 3.1], latex: `f^{-1}(x)=${quot("x")}` },
      { genre: "nombre", label: `f⁻¹(${c})`, labelLatex: `f^{-1}(${c})=`, placeholder: "valeur exacte", nombre: xs, latex: `f^{-1}(${c})=${xs}` },
    ],
    valeursCopie: [NaN, 1 / D],
    fonctionCopie: (x) => 1 / (a * x + b),
    piege: [t("Écrire "), l("f^{-1}=\\dfrac{1}{f}"), t(" : l'exposant −1 désigne ici la réciproque, pas l'inverse d'un nombre.")],
    corrigeA: {
      utilise: [t("Une réciproque doit vérifier "), l("f\\left(f^{-1}(y)\\right)=y"), t(" : on applique "), l("f"), t(" au résultat de la copie.")],
      lignes: [ligne(`f\\left(${qL(q(1, D))}\\right)=${a}\\cdot ${qL(q(1, D)).startsWith("-") ? `\\left(${qL(q(1, D))}\\right)` : qL(q(1, D))}${termeL(b)}`, "on applique f"), ligne(`=${qL(verifQ)}`), ligne(`${qL(verifQ)}\\neq ${c}`, "on ne retrouve pas le nombre de départ")],
    },
    corrigeB: {
      utilise: [t("Réciproque : "), l("f^{-1}"), t(" défait "), l("f"), t(" ; inverse : "), l("\\dfrac{1}{f(x)}"), t(" (cours, § 1). Ce sont deux fonctions différentes :")],
      lignes: [ligne(`f\\left(\\dfrac{1}{f(x)}\\right)\\neq x`, "1/f ne défait pas f")],
    },
    corrigeC: {
      utilise: [t("On résout "), l("y=f(x)"), t(" en "), l("x"), t(" (cours, § 1), puis on remplace.")],
      lignes: [
        ligne(`y=${f}`, "on pose y = f(x)"),
        ligne(`${a}x=y${termeL(-b)}`, retirer(b)),
        ligne(`x=${quot("y")}`, `on divise par ${nb(a)}`),
        ligne(`f^{-1}(x)=${quot("x")}`, "on nomme la variable x"),
        ligne(`f^{-1}(${c})=${quot(a > 0 ? `${c}` : parN(c))}`, [t("on remplace "), l("x"), t(" par "), l(`${c}`)]),
        ligne(`=${xs}`),
      ],
      verification: { utilise: [t("On applique "), l("f"), t(" au résultat :")], lignes: [ligne(`f(${xs})=${a}\\cdot ${parN(xs)}${termeL(b)}=${c}`)] },
    },
    candidats: [{ x: xs, y: c }],
  };
}

function scenarioArcsinSin(e: E): CopieDetectiveCyclo {
  const { fn: ifn, k12, k12b } = e.donnees;
  const fn = TRIG[ifn];
  const autre = TRIG[1 - ifn];
  const rTh = q(k12, 12);
  const ex: ExerciceArcTrig = { variante: "arcTrig", fn, n: rTh.n, d: rTh.d };
  const phi = phiK12(ex);
  const thL = piL(k12, 12);
  const psiL = piL(k12b, 12);
  const sommeCopie = k12 + k12b;
  const somme = phi + k12b;
  const expr = (f: Trig, k: number) => `\\arc${f}\\left(\\${f}${piL(k, 12).startsWith("\\dfrac") ? piL(k, 12) : `\\left(${piL(k, 12)}\\right)`}\\right)`;
  return {
    enonce: [t("Calcule la valeur exacte de "), l(`A=${expr(fn, k12)}+${expr(autre, k12b)}`), t(".")],
    lignes: [
      [l(`${expr(autre, k12b)}=${psiL}`), t(" car "), l(`${psiL}\\in ${IMAGE_L[autre]}`)],
      [l(`${expr(fn, k12)}=${thL}`), t(` car arc${fn} et ${fn} se simplifient`)],
      [l(`A=${plusL(thL, psiL)}`)],
      [l(`A=${piL(sommeCopie, 12)}`)],
    ],
    ligneFausse: 1,
    regles: [`arc${autre} défait ${autre} sur son image`, `arc${fn} défait ${fn}`, "somme des deux termes", "on réduit au même dénominateur"],
    regleCours: { texte: [t(`arc${fn} ne renvoie que des angles de son image (cours, § 2) :`)], latex: `\\arc${fn}(\\${fn}\\theta)=\\theta\\iff\\theta\\in ${IMAGE_L[fn]}` },
    aideCorrection: { texte: [t(`Cherche l'angle de `), l(IMAGE_L[fn]), t(` qui a le même ${fn === "sin" ? "sinus" : "cosinus"} que `), l(thL), t(", puis refais la somme.")] },
    valeurs: [{ genre: "nombre", label: "A", labelLatex: "A=", placeholder: "ex. : 7π/12", nombre: (somme * Math.PI) / 12, latex: `A=${piL(somme, 12)}` }],
    valeursCopie: [(sommeCopie * Math.PI) / 12],
    piege: [t("Simplifier "), l(`\\arc${fn}\\circ\\${fn}`), t(" sans vérifier que l'angle est dans l'image.")],
    corrigeA: { utilise: [t(`Image de arc${fn} (cours, § 2) : `), l(IMAGE_L[fn]), t(". On compare "), l(thL), t(" à ses bornes.")], lignes: lignesComparaison(ex) },
    corrigeB: {
      utilise: [t(`arc${fn}(${fn} θ) est l'angle de l'image qui a le même ${fn === "sin" ? "sinus" : "cosinus"} que θ ; il ne vaut θ que si θ est dans l'image (cours, § 2).`)],
      lignes: [ligne(`${thL}\\notin ${IMAGE_L[fn]}`, "θ hors de l'image"), ligne(`${expr(fn, k12)}\\neq ${thL}`, "la simplification est fausse")],
    },
    corrigeC: {
      utilise: [t("On ramène l'angle dans l'image (même "), t(fn === "sin" ? "sinus" : "cosinus"), t("), puis on refait la somme.")],
      lignes: [...lignesRamener(ex).lignes, ligne(`A=${plusL(piL(phi, 12), psiL)}`, "ligne 3 reprise"), ligne(`=${piL(somme, 12)}`)],
    },
    candidats: [],
  };
}

/** Dérivées des arcfonctions de kx : copie, corrigé. */
function scenarioDerivee(e: E): CopieDetectiveCyclo {
  const { k } = e.donnees;
  const v = e.variante;
  const k2 = k * k;
  const u0 = u0De(e);
  const x0 = x0De(e);
  const x0L = qL(x0);
  const fn = v === "signeArccos" ? "arccos" : v === "uprime" ? "arctan" : "arcsin";
  const fL = `\\${fn}(${k}x)`;
  const u0Carre = q(u0.n * u0.n, u0.d * u0.d);
  // valeurs justes
  let fJuste: (x: number) => number;
  let fpLatex: string;
  let valJuste: string;
  let valJusteV: number;
  let fCopie: (x: number) => number;
  let fpCopieL: string;
  let valCopieL: string;
  let valCopieV: number;
  let ligneRegle: string;
  let regleCours: { texte: Frag[]; latex?: string };
  const lignesC: LigneCalcul[] = [];
  if (v === "uprime") {
    const denom = q(u0Carre.n + u0Carre.d, u0Carre.d); // 1 + u0²
    fJuste = (x) => k / (1 + k2 * x * x);
    fpLatex = `\\dfrac{${k}}{1+${k2}x^{2}}`;
    valJusteV = (k * denom.d) / denom.n;
    valJuste = qL(q(k * denom.d, denom.n));
    fCopie = (x) => 1 / (1 + k2 * x * x);
    fpCopieL = `\\dfrac{1}{1+${k2}x^{2}}`;
    valCopieV = denom.d / denom.n;
    valCopieL = `\\dfrac{1}{1+${qLi(u0Carre)}}=${qL(q(denom.d, denom.n))}`;
    ligneRegle = "(\\arctan u)'=\\dfrac{1}{1+u^{2}}";
    regleCours = { texte: [t("Dérivée de arctan d'une fonction (cours, § 4) :")], latex: "(\\arctan u)'=\\dfrac{u'}{1+u^{2}}" };
    lignesC.push(
      ligne(`f'(x)=\\dfrac{${k}}{1+(${k}x)^{2}}`, [l("u'=" + k), t(", "), l(`u=${k}x`)]),
      ligne(`=${fpLatex}`),
      ligne(`f'\\left(${x0L}\\right)=\\dfrac{${k}}{1+${qLi(u0Carre)}}`, [t("car "), l(`${k}\\cdot ${x0L}=${qL(u0)}`)]),
      ligne(`=${valJuste}`),
    );
  } else {
    const rad = racineQ(q(u0.d * u0.d - u0.n * u0.n, u0.d * u0.d)); // √(1 − u0²)
    const sgn = v === "signeArccos" ? -1 : 1;
    const valR = radDiv(radQ(q(sgn * k)), rad);
    valJusteV = radV(valR);
    valJuste = radL(valR);
    fJuste = (x) => (sgn * k) / Math.sqrt(1 - k2 * x * x);
    fpLatex = `${sgn < 0 ? "-" : ""}\\dfrac{${k}}{\\sqrt{1-${k2}x^{2}}}`;
    regleCours =
      v === "signeArccos"
        ? { texte: [t("Dérivée de arccos d'une fonction (cours, § 4) :")], latex: "(\\arccos u)'=-\\dfrac{u'}{\\sqrt{1-u^{2}}}" }
        : { texte: [t("Dérivée de arcsin d'une fonction (cours, § 4), avec "), l("u^{2}"), t(" le carré de tout "), l("u"), t(" :")], latex: "(\\arcsin u)'=\\dfrac{u'}{\\sqrt{1-u^{2}}}" };
    if (v === "signeArccos") {
      fCopie = (x) => k / Math.sqrt(1 - k2 * x * x);
      fpCopieL = `\\dfrac{${k}}{\\sqrt{1-${k2}x^{2}}}`;
      valCopieV = -valJusteV;
      valCopieL = `\\dfrac{${k}}{\\sqrt{1-${qLi(u0Carre)}}}=${radL(radDiv(radQ(q(k)), rad))}`;
      ligneRegle = "(\\arccos u)'=\\dfrac{u'}{\\sqrt{1-u^{2}}}";
    } else {
      fCopie = (x) => k / Math.sqrt(1 - k * x * x);
      fpCopieL = `\\dfrac{${k}}{\\sqrt{1-${k}x^{2}}}`;
      const x0Carre = q(x0.n * x0.n, x0.d * x0.d);
      const interieur = q(x0Carre.d - k * x0Carre.n, x0Carre.d);
      valCopieV = k / Math.sqrt(interieur.n / interieur.d);
      valCopieL = `\\dfrac{${k}}{\\sqrt{1-${k}\\cdot ${qLi(x0Carre)}}}=\\dfrac{${k}}{\\sqrt{${qLi(interieur)}}}`;
      ligneRegle = "(\\arcsin u)'=\\dfrac{u'}{\\sqrt{1-u^{2}}}";
    }
    const sqL = `\\sqrt{1-${qLi(u0Carre)}}`;
    lignesC.push(
      ligne(`f'(x)=${sgn < 0 ? "-" : ""}\\dfrac{${k}}{\\sqrt{1-(${k}x)^{2}}}`, [l(`u=${k}x`), t(", "), l(`u'=${k}`)]),
      ligne(`=${fpLatex}`, [l(`(${k}x)^{2}=${k2}x^{2}`)]),
      ligne(`f'\\left(${x0L}\\right)=${sgn < 0 ? "-" : ""}\\dfrac{${k}}{${sqL}}`, [t("car "), l(`${k}\\cdot ${x0L}=${qL(u0)}`)]),
      ligne(`=${sgn < 0 ? "-" : ""}\\dfrac{${k}}{${radL(rad, "\\frac")}}`),
      ligne(`=${valJuste}`),
    );
  }
  const lignesCopie: Frag[][] = [
    [l(`u=${k}x`), t(" et "), l(`u'=${k}`)],
    [l(v === "carre" ? "(\\arcsin u)'=\\dfrac{u'}{\\sqrt{1-u^{2}}}" : ligneRegle)],
    [l(`f'(x)=${fpCopieL}`)],
    [l(`f'\\left(${x0L}\\right)=${valCopieL}`)],
  ];
  const fausse = v === "carre" ? 2 : 1;
  const pts = v === "uprime" ? [-1.3, -0.4, 0.3, 0.9, 1.7].map((x) => x / k) : [-0.83, -0.41, 0.27, 0.62, 0.9].map((x) => x / k);
  const nomFn = v === "signeArccos" ? "arccos" : v === "uprime" ? "arctan" : "arcsin";
  return {
    enonce: [t("Calcule la dérivée de "), l(`f(x)=${fL}`), t(", puis "), l(`f'\\left(${x0L}\\right)`), t(".")],
    lignes: lignesCopie,
    ligneFausse: fausse,
    regles: ["on pose u et on dérive u", `dérivée de ${nomFn} u`, "on remplace u et u′", "on remplace x"],
    regleCours,
    aideCorrection:
      v === "uprime"
        ? { texte: [t("Remplace "), l(`u=${k}x`), t(" et "), l(`u'=${k}`), t(" dans "), l("\\dfrac{u'}{1+u^{2}}"), t(", puis "), l("x"), t(" par "), l(x0L), t(".")] }
        : { texte: [t("Remplace "), l(`u=${k}x`), t(" et "), l(`u'=${k}`), t(" dans la formule — "), l("u^{2}=(" + k + "x)^{2}"), t(" —, puis "), l("x"), t(" par "), l(x0L), t(".")] },
    valeurs: [
      { genre: "fonction", label: "f′(x)", labelLatex: "f'(x)=", placeholder: "ex. : 6/(1+36x²)", fonction: fJuste, points: pts, latex: `f'(x)=${fpLatex}` },
      { genre: "nombre", label: "f′(x₀)", labelLatex: `f'\\left(${x0L}\\right)=`, placeholder: "valeur exacte", nombre: valJusteV, latex: `f'\\left(${x0L}\\right)=${valJuste}` },
    ],
    valeursCopie: [NaN, valCopieV],
    fonctionCopie: fCopie,
    piege:
      v === "signeArccos"
        ? [t("Oublier le « − » de la dérivée de arccos : arccos est décroissante, sa dérivée est négative.")]
        : v === "uprime"
          ? [t("Oublier "), l("u'"), t(" en dérivant une composée.")]
          : [t("Écrire "), l(`(${k}x)^{2}=${k}x^{2}`), t(" : le carré porte sur le coefficient aussi.")],
    corrigeA:
      v === "carre"
        ? {
            utilise: [t("On contrôle la ligne 3 : "), l("u^{2}"), t(" doit être remplacé par le carré de "), l(`u=${k}x`), t(".")],
            lignes: [ligne(`u^{2}=(${k}x)^{2}`, "u remplacé"), ligne(`=${k2}x^{2}`), ligne(`${k2}x^{2}\\neq ${k}x^{2}`, "la ligne 3 a écrit kx²")],
          }
        : v === "signeArccos"
          ? {
              utilise: [t("arccos est décroissante : sa dérivée doit être négative. On teste en "), l("x=0"), t(" :")],
              lignes: [ligne(`\\dfrac{${k}}{\\sqrt{1-0}}=${k}`, "formule de la copie en 0"), ligne(`${k}>0`, "positif : impossible pour une fonction décroissante")],
            }
          : {
              utilise: [t("On contrôle la ligne 2 par la règle de dérivation d'une composée :")],
              lignes: [ligne(`(\\arctan u)'=\\arctan'(u)\\cdot u'`, "dérivée d'une composée"), ligne(`u'=${k}\\neq 1`, "le facteur u′ manque à la ligne 2")],
            },
    corrigeB: { utilise: regleCours.texte.concat(regleCours.latex ? [t(" "), l(regleCours.latex)] : []), lignes: [ligne(`${ligneRegleCopie(v, k)}\\neq ${regleJuste(v, k)}`, "copie face au cours")] },
    corrigeC: { utilise: [t("On applique la bonne formule avec "), l(`u=${k}x`), t(", "), l(`u'=${k}`), t(", puis "), l(`x=${x0L}`), t(".")], lignes: lignesC },
    candidats: [{ x: x0.n / x0.d }],
  };
}

function ligneRegleCopie(v: VarianteDetectiveCyclo, k: number): string {
  if (v === "signeArccos") return "\\dfrac{u'}{\\sqrt{1-u^{2}}}";
  if (v === "uprime") return "\\dfrac{1}{1+u^{2}}";
  return `${k}x^{2}`;
}
function regleJuste(v: VarianteDetectiveCyclo, k: number): string {
  if (v === "signeArccos") return "-\\dfrac{u'}{\\sqrt{1-u^{2}}}";
  if (v === "uprime") return "\\dfrac{u'}{1+u^{2}}";
  return `(${k}x)^{2}`;
}

function scenarioCe(e: E): CopieDetectiveCyclo {
  const { fn: ifn, x1, x2, m, n } = e.donnees;
  const fn = TRIG[ifn];
  const B = m - x1 - x2;
  const C = n + x1 * x2;
  const uL = `x^{2}${B === 0 ? "" : termeL(B, "x")}${termeL(C)}`;
  const vL = affineL(m, n);
  const tri = `x^{2}${termeL(-(x1 + x2), "x")}${termeL(x1 * x2)}`;
  const s = [x1, x2].sort((a, b) => a - b);
  const v2 = m * x2 + n;
  const v1 = m * x1 + n;
  return {
    enonce: [t("Résous l'équation "), l(`\\arc${fn}(${uL})=\\arc${fn}(${vL})`), t(".")],
    lignes: [
      [l(`${uL}=${vL}`), t(` car arc${fn} est injective`)],
      [l(`${tri}=0`)],
      [l(`x=${s[0]}`), t(" ou "), l(`x=${s[1]}`)],
      [l(`S=\\{${s[0]}\\,;\\,${s[1]}\\}`)],
    ],
    ligneFausse: 3,
    regles: [`arc${fn} injective : arguments égaux`, "on réduit à un trinôme", "racines du trinôme", "ensemble des solutions"],
    regleCours: { texte: [t(`arc${fn} A = arc${fn} B ⟺ A = B, à condition que A et B soient dans [−1 ; 1] (cours, § 3) :`)], latex: `\\text{CE : }-1\\leq ${vL}\\leq 1` },
    aideCorrection: { texte: [t("Remplace chaque candidat dans "), l(vL), t(" : l'argument doit être entre "), l("-1"), t(" et "), l("1"), t(".")] },
    valeurs: [{ genre: "ensemble", label: "S", labelLatex: "S=", placeholder: "ex. : 5 ; −1   (ou ∅)", ensemble: [x1], latex: `S=\\{${x1}\\}` }],
    valeursCopie: [],
    ensembleCopie: [x1, x2],
    piege: [t("Garder un candidat sans contrôler la condition d'existence : "), l(`\\arc${fn}`), t(" n'est défini que sur "), l("[-1\\,;\\,1]"), t(".")],
    corrigeA: {
      utilise: [t("On remplace chaque candidat dans l'argument "), l(vL), t(" (il doit être dans [−1 ; 1]).")],
      lignes: [ligne(`${m}\\cdot ${parN(x1)}${termeL(n)}=${v1}`, [l(`x=${x1}`)]), ligne(`${m}\\cdot ${parN(x2)}${termeL(n)}=${v2}`, [l(`x=${x2}`)]), ligne(`${v2}\\notin[-1\\,;\\,1]`, "hors du domaine de l'arcfonction")],
    },
    corrigeB: { utilise: [t(`Domaine de arc${fn} : [−1 ; 1] (cours, § 2) ; les candidats obtenus par l'égalité des arguments doivent être contrôlés (cours, § 3).`)], lignes: [ligne(`-1\\leq ${vL}\\leq 1`, "condition d'existence")] },
    corrigeC: {
      utilise: [t("On garde les seuls candidats qui vérifient la condition d'existence.")],
      lignes: [ligne(`-1\\leq ${v1}\\leq 1`, [l(`x=${x1}`), t(" : accepté")]), ligne(`${v2}${v2 > 1 ? ">1" : "<-1"}`, [l(`x=${x2}`), t(" : rejeté")])],
      verification: { utilise: [t("On remplace "), l(`x=${x1}`), t(" dans l'autre argument : on retrouve la même valeur.")], lignes: [ligne(`${parN(x1)}^{2}${B === 0 ? "" : `${B < 0 ? "-" : "+"}${Math.abs(B)}\\cdot ${parN(x1)}`}${termeL(C)}=${v1}`)] },
    },
    candidats: [{ x: x1 }, { x: x2 }],
  };
}

function scenarioSens(e: E): CopieDetectiveCyclo {
  const { a, k } = e.donnees;
  const g = q(a - 1, k);
  const d = q(a + 1, k);
  const arg = `${a === 0 ? "" : a}-${k}x`;
  return {
    enonce: [t("Détermine le domaine de "), l(`f(x)=\\arcsin(${arg})`), t(".")],
    lignes: [
      [l(`-1\\leq ${arg}\\leq 1`)],
      [l(`${-1 - a}\\leq -${k}x\\leq ${1 - a}`)],
      [l(`\\dfrac{${-1 - a}}{-${k}}\\leq x\\leq\\dfrac{${1 - a}}{-${k}}`)],
      [l(`${qL(q(1 + a, k))}\\leq x\\leq ${qL(q(a - 1, k))}`), t(", impossible : "), l("\\mathrm{dom}\\,f=\\varnothing")],
    ],
    ligneFausse: 2,
    regles: ["domaine de arcsin", retirer(a), `on divise par −${k}`, "conclusion"],
    regleCours: { texte: [t("Diviser une inégalité par un nombre négatif change son sens :")], latex: "u\\leq v\\iff\\dfrac{u}{c}\\geq\\dfrac{v}{c}\\quad(c<0)" },
    aideCorrection: { texte: [t("Divise la ligne 2 par "), l(`-${k}`), t(" en retournant les deux symboles, puis écris l'intervalle de la plus petite borne à la plus grande.")] },
    valeurs: [{ genre: "intervalle", label: "dom f", labelLatex: "\\mathrm{dom}\\,f=", placeholder: "", intervalle: { gauche: g.n / g.d, droite: d.n / d.d, gaucheFermee: true, droiteFermee: true }, latex: `\\mathrm{dom}\\,f=\\left[${qL(g)}\\,;\\,${qL(d)}\\right]` }],
    valeursCopie: [],
    piege: [t("Garder le sens des inégalités en divisant par "), l(`-${k}`), t(" : le domaine paraît vide.")],
    corrigeA: {
      utilise: [t("On teste une valeur : "), l(`x=${qL(q(a, k))}`), t(" annule l'argument, donc "), l("\\arcsin 0"), t(" existe et le domaine n'est pas vide.")],
      lignes: [ligne(`${a === 0 ? "" : a}-${k}\\cdot ${parL(qL(q(a, k)))}=0`, "argument nul"), ligne("0\\in[-1\\,;\\,1]", "arcsin(0) existe : la ligne 4 se trompe dès la ligne 3")],
    },
    corrigeB: { utilise: [t("Diviser par un nombre négatif change le sens des inégalités.")], lignes: [ligne(`-${k}<0`, "on divise par un négatif : ≤ devient ≥")] },
    corrigeC: {
      utilise: [t("On divise la ligne 2 par "), l(`-${k}`), t(" en changeant le sens.")],
      lignes: [ligne(`\\dfrac{${-1 - a}}{-${k}}\\geq x\\geq\\dfrac{${1 - a}}{-${k}}`, "sens changé"), ligne(`${qL(g)}\\leq x\\leq ${qL(d)}`, "dans l'ordre croissant")],
    },
    candidats: [{ x: a / k }],
  };
}

function scenarioArctan(e: E): CopieDetectiveCyclo {
  const { k, c } = e.donnees;
  const kpi = piL(k, 2);
  const bg = `${c === 0 ? "" : c}-${piL(k, 2).replace(/^\\dfrac/, "\\dfrac")}`;
  const bd = `${c === 0 ? "" : `${c}+`}${kpi}`;
  const kL = k === 1 ? "" : `${k}`;
  return {
    enonce: [t("Détermine l'image de "), l(`f(x)=${kL}\\arctan x${termeL(c)}`), t(".")],
    lignes: [
      [l("\\arctan"), t(" est strictement croissante sur "), l("\\mathbb{R}"), t(".")],
      [l("\\mathrm{im}\\,\\arctan=\\left[-\\dfrac{\\pi}{2}\\,;\\,\\dfrac{\\pi}{2}\\right]")],
      [l(`${kL}\\arctan x\\in\\left[-${kpi}\\,;\\,${kpi}\\right]`)],
      [l(`\\mathrm{im}\\,f=\\left[${bg}\\,;\\,${bd}\\right]`)],
    ],
    ligneFausse: 1,
    regles: ["sens de variation de arctan", "image de arctan", `on multiplie par ${k}`, ajouter(c)],
    regleCours: { texte: [t("arctan a deux asymptotes horizontales, jamais atteintes (cours, § 2) :")], latex: "\\lim\\limits_{x\\to\\pm\\infty}\\arctan x=\\pm\\dfrac{\\pi}{2}\\qquad\\mathrm{im}\\,\\arctan=\\mathopen{]}-\\dfrac{\\pi}{2}\\,;\\,\\dfrac{\\pi}{2}\\mathclose{[}" },
    aideCorrection: { texte: [t("Reprends avec l'intervalle ouvert : multiplie les bornes par "), l(`${k}`), t(", ajoute "), l(`${c}`), t(", et garde les crochets ouverts.")] },
    valeurs: [{ genre: "intervalle", label: "im f", labelLatex: "\\mathrm{im}\\,f=", placeholder: "", intervalle: { gauche: c - (k * Math.PI) / 2, droite: c + (k * Math.PI) / 2, gaucheFermee: false, droiteFermee: false }, latex: `\\mathrm{im}\\,f=\\mathopen{]}${bg}\\,;\\,${bd}\\mathclose{[}` }],
    valeursCopie: [],
    piege: [t("Fermer les crochets en "), l("\\pm\\dfrac{\\pi}{2}"), t(" : ces valeurs ne sont que des limites.")],
    corrigeA: {
      utilise: [t("Pour que "), l("\\dfrac{\\pi}{2}"), t(" soit atteint, il faudrait un réel "), l("x"), t(" avec "), l("\\arctan x=\\dfrac{\\pi}{2}"), t(", donc "), l("x=\\tan\\dfrac{\\pi}{2}"), t(".")],
      lignes: [ligne("\\cos\\dfrac{\\pi}{2}=0", "la tangente de π/2 n'existe pas"), ligne("\\dfrac{\\pi}{2}\\notin\\mathrm{im}\\,\\arctan", "la borne n'est pas atteinte")],
    },
    corrigeB: { utilise: [t("Image de arctan : intervalle ouvert (cours, § 2).")], lignes: [ligne(`\\mathrm{im}\\,\\arctan=${IMAGE_L.tan}`, "asymptotes y = ±π/2")] },
    corrigeC: {
      utilise: [t("On reprend à partir de la ligne 2 avec l'intervalle ouvert.")],
      lignes: [ligne(`-\\dfrac{\\pi}{2}<\\arctan x<\\dfrac{\\pi}{2}`, "image de arctan"), ligne(`-${kpi}<${kL}\\arctan x<${kpi}`, `on multiplie par ${k} > 0`), ligne(`${bg}<f(x)<${bd}`, ajouter(c))],
    },
    candidats: [{ x: 0.37 }],
  };
}

function scenarioInjectivite(e: E): CopieDetectiveCyclo {
  const { b, tt, c } = e.donnees;
  const a = b * tt * tt;
  const bL = b === 1 ? "" : `${b}`;
  const fL = `\\dfrac{${a}}{x}-${bL}x${termeL(c)}`;
  return {
    enonce: [t("Montre que "), l(`f(x)=${fL}`), t(" est injective, puis résous "), l(`f(x)=${c}`), t(".")],
    lignes: [
      [l("\\mathrm{dom}\\,f=\\mathbb{R}\\setminus\\{0\\}")],
      [l(`f'(x)=-\\dfrac{${a}}{x^{2}}-${b}`)],
      [l("f'(x)<0"), t(" pour tout "), l("x"), t(" du domaine")],
      [t("donc "), l("f"), t(" est strictement décroissante sur "), l("\\mathbb{R}\\setminus\\{0\\}"), t(" : elle est injective")],
      [t("donc "), l(`f(x)=${c}`), t(" a une seule solution : "), l(`S=\\{${tt}\\}`)],
    ],
    ligneFausse: 3,
    regles: ["domaine", "dérivée", "signe de la dérivée", "conclusion sur les variations", "conséquence"],
    regleCours: { texte: [t("Une dérivée négative sur chaque intervalle donne une fonction décroissante sur chaque intervalle, pas sur leur réunion ; pour l'injectivité, on compare les images des deux morceaux (cours, § 1).")] },
    aideCorrection: { texte: [t("Résous vraiment "), l(`f(x)=${c}`), t(" : retire "), l(`${c}`), t(", multiplie par "), l("x\\neq 0"), t(", isole "), l("x^{2}"), t(".")] },
    valeurs: [{ genre: "ensemble", label: "S", labelLatex: "S=", placeholder: "ex. : 5 ; −1   (ou ∅)", ensemble: [-tt, tt], latex: `S=\\{-${tt}\\,;\\,${tt}\\}` }],
    valeursCopie: [],
    ensembleCopie: [tt],
    piege: [t("Conclure qu'une fonction est monotone « sur son domaine » quand ce domaine est une réunion d'intervalles.")],
    corrigeA: {
      utilise: [t("Contre-exemple : deux réels distincts de même image.")],
      lignes: [
        ligne(`f(${tt})=\\dfrac{${a}}{${tt}}-${b === 1 ? "" : `${b}\\cdot `}${tt}${termeL(c)}`, [l(`x=${tt}`)]),
        ligne(`=${c}`),
        ligne(`f(-${tt})=\\dfrac{${a}}{-${tt}}-${b === 1 ? "" : `${b}\\cdot `}(-${tt})${termeL(c)}`, [l(`x=-${tt}`)]),
        ligne(`=${c}`),
        ligne(`-${tt}\\neq ${tt}`, "deux antécédents distincts : f n'est pas injective"),
      ],
    },
    corrigeB: {
      utilise: [t("Monotone sur chaque intervalle ne veut pas dire monotone sur la réunion (cours, § 1).")],
      lignes: [ligne(`-${tt}<${tt}`, "deux réels pris dans les deux morceaux"), ligne(`f(-${tt})=f(${tt})`, "une fonction décroissante sur la réunion donnerait f(−t) > f(t)")],
    },
    corrigeC: {
      utilise: [t("On résout l'équation sur "), l("\\mathbb{R}\\setminus\\{0\\}"), t(".")],
      lignes: [
        ligne(`\\dfrac{${a}}{x}-${bL}x${termeL(c)}=${c}`, "équation"),
        ligne(`\\dfrac{${a}}{x}=${bL}x`, retirer(c)),
        ligne(`${a}=${bL}x^{2}`, "on multiplie par x ≠ 0"),
        ligne(`x^{2}=${tt * tt}`, b === 1 ? "on lit x²" : `on divise par ${b}`),
        ligne(`x=-${tt}\\ \\text{ou}\\ x=${tt}`, "deux racines opposées"),
      ],
      verification: { utilise: [t("Les deux valeurs donnent bien "), l(`${c}`), t(" (étape 1).")], lignes: [ligne(`f(-${tt})=f(${tt})=${c}`)] },
    },
    candidats: [{ x: tt }, { x: -tt }],
  };
}

export function copie(e: E): CopieDetectiveCyclo {
  switch (e.variante) {
    case "inverse":
      return scenarioInverse(e);
    case "arcsinSin":
      return scenarioArcsinSin(e);
    case "signeArccos":
    case "uprime":
    case "carre":
      return scenarioDerivee(e);
    case "ce":
      return scenarioCe(e);
    case "sens":
      return scenarioSens(e);
    case "arctan":
      return scenarioArctan(e);
    case "injectivite":
      return scenarioInjectivite(e);
  }
}

export const LIGNES_PAR_VARIANTE = (e: E): number => copie(e).lignes.length;
