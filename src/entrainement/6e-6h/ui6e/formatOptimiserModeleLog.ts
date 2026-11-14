import type { ExerciceBenefice, ExerciceCoutMoyen, ExerciceDebit, ExerciceEngrais, ExerciceOptimiserLog, ExerciceRendementMoyen } from "../core6e/optimiserModeleLog.types";
import type { PhaseOptimiserLog } from "../moteur6e/typesOptimiserModeleLog";
import { modeleNumerique } from "../moteur6e/verificationOptimiserModeleLog";
import { decimalLatex, fractionDepuisValeur, fractionLatex } from "./nombresExactsIntegrales";

/**
 * Couche ui (6e) — textes, aides et réponses attendues de `6gen91` « Optimiser un modèle
 * logarithmique ». Une « fiche » par situation (`fiche(e)`) rassemble TOUT ce que l'écran, le
 * récapitulatif et l'adaptateur d'export affichent : énoncé, données, consignes, champs, aides,
 * options de l'écran « nature », réponses, lignes de calcul et pièges du corrigé. Les nombres
 * viennent de `modeleNumerique` (moteur), jamais recalculés ici.
 *
 * Écriture : virgule décimale (`{,}`), signe « − », unités en `\text{…}`, intervalles ouverts avec
 * `\mathopen{]}` ; aides = phrase terminée par « : » puis la formule ; une aide ne donne jamais le
 * résultat final (il reste un calcul à faire).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export interface OptionNature {
  id: string;
  fragments: FragmentConsigne[];
}

export interface ChampOptimiser {
  label: FragmentConsigne[];
  placeholder: string;
  /** Champ d'expression (aperçu LaTeX affiché) ou valeur. */
  expression: boolean;
}

export const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
export const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

/** Décimal LaTeX avec virgule (jusqu'à `d` décimales), espace fine des milliers dès 10 000. */
export function dl(x: number, d = 3): string {
  const brut = decimalLatex(x, d);
  return brut.replace(/^(-?)(\d+)/, (_, signe: string, entiere: string) => signe + (entiere.length > 4 ? entiere.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : entiere));
}

/** Décimal LaTeX à exactement `d` décimales (arrondi annoncé : 5,90 et non 5,9). */
function fixe(x: number, d: number): string {
  return x.toFixed(d).replace(".", "{,}");
}

/** Valeur exacte rationnelle (fraction irréductible) ou décimal. */
function exact(x: number): string {
  const f = fractionDepuisValeur(x, 100);
  return f ? fractionLatex(f.num, f.den) : dl(x);
}

/** Exposant k en LaTeX : 1/2, 3/2, -1, 2. */
function kLatex(k: number): string {
  return exact(k).replace(/\\dfrac\{(\d+)\}\{(\d+)\}/, "$1/$2");
}

/** eᵏ en LaTeX : e, e^{2}, e^{3/2}, e^{-1}. */
export function expK(k: number): string {
  return k === 1 ? "e" : `e^{${kLatex(k)}}`;
}

/** c·eᵏ (c = 1 omis). */
function coefExpK(c: number, k: number): string {
  return `${c === 1 ? "" : dl(c)}${expK(k)}`;
}

/** Coefficient devant une lettre : 1 → « ». */
function cf(x: number): string {
  return x === 1 ? "" : dl(x);
}

const PH_NOMBRE = "nombre seul";
const PH_EXACT = "valeur exacte";

export interface FicheOptimiser {
  consigneGenerale: FragmentConsigne[];
  blocDonnees: string[];
  /** Nom de la fonction et de la variable (`R`, `x`). */
  nom: string;
  variable: string;
  consignes: Record<PhaseOptimiserLog, FragmentConsigne[]>;
  /** Question papier finale (écrans 2 à 5 regroupés). */
  questionPapier: FragmentConsigne[];
  champs: { derivee: ChampOptimiser; zero: ChampOptimiser; optimum: ChampOptimiser; valeur: ChampOptimiser };
  aides: Record<PhaseOptimiserLog, [AideAvecLatex, AideAvecLatex | null]>;
  /** Réponse de chaque écran, en LaTeX (une ou plusieurs formules). */
  reponses: Record<PhaseOptimiserLog, string[]>;
  /** Lignes « Calcul » du corrigé (LaTeX), par écran. */
  calculs: Record<PhaseOptimiserLog, string>;
  pieges: Record<PhaseOptimiserLog, string>;
  /** Libellés des axes de la figure. */
  axeX: string;
  axeY: string;
}

/** Intervalle du domaine du contexte, en LaTeX. */
function domaineLatex(gaucheOuvert: boolean, g: number, d: number): string {
  return `${gaucheOuvert ? "\\mathopen{]}" : "["}${dl(g)}\\,;${dl(d)}]`;
}

const PRECISION_EXACTE = " Donne les valeurs exactes.";

function consigneNature(nom: string, v: string): FragmentConsigne[] {
  return [t("Étudie le signe de "), l(`${nom}'(${v})`), t(" de part et d'autre de cette valeur. L'optimum est-il un maximum ou un minimum ?")];
}

function aideZero(nom: string, v: string): AideAvecLatex {
  return { texte: "L'optimum d'une fonction dérivable sur un intervalle ouvert se trouve là où sa dérivée s'annule :", latex: `${nom}'(${v})=0` };
}

// ============================================================================
// Engrais.
// ============================================================================

function ficheEngrais(e: ExerciceEngrais): FicheOptimiser {
  const m = modeleNumerique(e);
  const xs = exact(m.xEtoile);
  const R = `R(x)=${e.c}+${e.a}\\ln(1+x)-${e.b}x`;
  const dom = domaineLatex(false, 0, e.M);
  return {
    consigneGenerale: [
      t(`Un agriculteur épand x centaines de kilogrammes d'engrais par hectare sur un champ de ${e.culture}. La réglementation interdit de dépasser ${e.M} centaines de kilogrammes par hectare. Le rendement du champ, en quintaux par hectare, est modélisé par `),
      l(R),
      t("."),
    ],
    blocDonnees: [R],
    nom: "R",
    variable: "x",
    consignes: {
      domaine: [t("Dans ce contexte, sur quel intervalle la fonction "), l("R"), t(" est-elle définie ? Tiens compte de l'expression ET de la situation.")],
      derivee: [t("Calcule la dérivée "), l("R'(x)"), t(".")],
      zero: [t("Pour quelle valeur de "), l("x"), t(" la dérivée s'annule-t-elle ? Donne la valeur exacte.")],
      nature: consigneNature("R", "x"),
      valeur: [t("Quelle dose d'engrais (en kg par hectare) donne le rendement maximal, et quel est ce rendement (en quintaux par hectare, arrondi au dixième) ?")],
    },
    questionPapier: [t("Quelle dose d'engrais (en kg par hectare) faut-il épandre pour obtenir un rendement maximal ? Justifie qu'il s'agit bien d'un maximum, puis calcule ce rendement (en quintaux par hectare, arrondi au dixième).")],
    champs: {
      derivee: { label: [l("R'(x)"), t(" =")], placeholder: "expression en x", expression: true },
      zero: { label: [l("x"), t(" =")], placeholder: PH_EXACT, expression: false },
      optimum: { label: [t("Dose optimale (en kg/ha) =")], placeholder: PH_NOMBRE, expression: false },
      valeur: { label: [t("Rendement maximal (en q/ha) ≈")], placeholder: PH_NOMBRE, expression: false },
    },
    aides: {
      domaine: [
        { texte: "Le logarithme n'existe que pour un argument strictement positif :", latex: "1+x>0" },
        { texte: "Croise cette condition avec la situation : une dose ne peut pas être négative et elle est plafonnée par la réglementation.", latex: null },
      ],
      derivee: [
        { texte: "Dérivée du logarithme d'une fonction :", latex: "\\left(\\ln u\\right)'=\\dfrac{u'}{u}" },
        { texte: "Ici, l'argument du logarithme a pour dérivée 1 :", latex: "\\left(\\ln(1+x)\\right)'=\\dfrac{1}{1+x}" },
      ],
      zero: [aideZero("R", "x"), { texte: "Isole d'abord le dénominateur :", latex: `\\dfrac{${e.a}}{1+x}=${e.b}\\iff 1+x=\\dfrac{${e.a}}{${e.b}}` }],
      nature: [{ texte: "Mets la dérivée au même dénominateur ; sur le domaine, le dénominateur est positif et le numérateur est une fonction affine décroissante :", latex: `R'(x)=\\dfrac{${e.a}-${e.b}(1+x)}{1+x}` }, null],
      valeur: [
        { texte: "Calcule l'image de la valeur optimale :", latex: `R\\left(${xs}\\right)=${e.c}+${e.a}\\ln\\left(1+${xs}\\right)-${e.b}\\cdot ${xs}` },
        { texte: "Reviens aux unités de l'énoncé, où x compte des centaines de kilogrammes :", latex: "x=1\\;\\longrightarrow\\;100\\ \\text{kg/ha}" },
      ],
    },
    reponses: {
      domaine: [dom],
      derivee: [`R'(x)=\\dfrac{${e.a}}{1+x}-${e.b}`],
      zero: [`x=${xs}`],
      nature: [],
      valeur: [`x=${xs}\\;\\longrightarrow\\;${dl(m.optimumContexte)}\\ \\text{kg/ha}`, `R\\left(${xs}\\right)=${e.c - (e.a - e.b)}+${e.a}\\ln\\left(${exact(e.a / e.b)}\\right)\\approx ${fixe(m.valeur, 1)}\\ \\text{q/ha}`],
    },
    calculs: {
      domaine: `\\left\\{\\begin{array}{l}1+x>0\\\\0\\le x\\le ${e.M}\\end{array}\\right.\\iff 0\\le x\\le ${e.M}`,
      derivee: `R'(x)=0+${e.a}\\cdot\\dfrac{1}{1+x}-${e.b}=\\dfrac{${e.a}}{1+x}-${e.b}`,
      zero: `\\dfrac{${e.a}}{1+x}=${e.b}\\iff 1+x=${exact(e.a / e.b)}\\iff x=${xs}`,
      nature: `R'(x)=\\dfrac{${e.a}-${e.b}(1+x)}{1+x}=\\dfrac{${e.b}\\left(${xs}-x\\right)}{1+x}`,
      valeur: `R\\left(${xs}\\right)=${e.c}+${e.a}\\ln\\left(${exact(e.a / e.b)}\\right)-${dl(e.a - e.b)}\\approx ${dl(m.valeur, 3)}`,
    },
    pieges: {
      domaine: "Donner le domaine de l'expression seule (x > −1) : dans la situation, la dose est positive ou nulle et plafonnée.",
      derivee: "Écrire (ln(1 + x))′ = 1/x : la dérivée de l'argument 1 + x vaut 1, mais il reste au dénominateur.",
      zero: "Résoudre en x = a/b en oubliant de retrancher 1.",
      nature: "Conclure « maximum » parce que la dérivée s'annule : seul le CHANGEMENT DE SIGNE de la dérivée décide.",
      valeur: "Répondre la valeur de x (en centaines de kg) au lieu de la dose en kg/ha, ou arrondir trop tôt le logarithme.",
    },
    axeX: "x (centaines de kg/ha)",
    axeY: "R (q/ha)",
  };
}

// ============================================================================
// Bénéfice.
// ============================================================================

const NOM_PRODUIT = { vélos: "vélos électriques", trottinettes: "trottinettes", imprimantes: "imprimantes 3D" } as const;

function ficheBenefice(e: ExerciceBenefice): FicheOptimiser {
  const m = modeleNumerique(e);
  const qs = exact(m.xEtoile);
  const B = `B(q)=${e.a}\\ln(q)-${e.b}q-${e.c}`;
  const produit = NOM_PRODUIT[e.produit];
  const deProduit = /^[aeiouéèh]/i.test(produit) ? `d'${produit}` : `de ${produit}`;
  const dom = domaineLatex(true, 0, e.M);
  return {
    consigneGenerale: [
      t(`Une entreprise fabrique q centaines ${deProduit} par mois ; sa capacité de production est de ${e.M} centaines par mois. Son bénéfice mensuel, en milliers d'euros, est modélisé par `),
      l(B),
      t("."),
    ],
    blocDonnees: [B],
    nom: "B",
    variable: "q",
    consignes: {
      domaine: [t("Dans ce contexte, sur quel intervalle la fonction "), l("B"), t(" est-elle définie ? Tiens compte de l'expression ET de la situation.")],
      derivee: [t("Calcule la dérivée "), l("B'(q)"), t(".")],
      zero: [t("Pour quelle valeur de "), l("q"), t(" la dérivée s'annule-t-elle ? Donne la valeur exacte.")],
      nature: consigneNature("B", "q"),
      valeur: [t(`Combien ${deProduit} faut-il fabriquer par mois pour un bénéfice maximal, et quel est ce bénéfice (en euros, arrondi à l'euro) ?`)],
    },
    questionPapier: [t(`Combien ${deProduit} l'entreprise doit-elle fabriquer par mois pour que son bénéfice soit maximal ? Justifie qu'il s'agit bien d'un maximum, puis calcule ce bénéfice (en euros, arrondi à l'euro).`)],
    champs: {
      derivee: { label: [l("B'(q)"), t(" =")], placeholder: "expression en q", expression: true },
      zero: { label: [l("q"), t(" =")], placeholder: PH_EXACT, expression: false },
      optimum: { label: [t(`Production optimale (en ${e.produit}) =`)], placeholder: PH_NOMBRE, expression: false },
      valeur: { label: [t("Bénéfice maximal (en €) ≈")], placeholder: PH_NOMBRE, expression: false },
    },
    aides: {
      domaine: [
        { texte: "Le logarithme n'existe que pour un argument strictement positif :", latex: "q>0" },
        { texte: "Croise cette condition avec la capacité de production de l'entreprise.", latex: null },
      ],
      derivee: [
        { texte: "Dérivées utiles :", latex: "\\left(\\ln q\\right)'=\\dfrac{1}{q}\\qquad (bq)'=b\\qquad c'=0" },
        { texte: "Dérive chaque terme séparément, en gardant les coefficients :", latex: `\\left(${e.a}\\ln(q)\\right)'=${e.a}\\cdot\\dfrac{1}{q}` },
      ],
      zero: [aideZero("B", "q"), { texte: "Isole q :", latex: `\\dfrac{${e.a}}{q}=${e.b}` }],
      nature: [{ texte: "Mets la dérivée au même dénominateur ; sur le domaine, le dénominateur est positif et le numérateur est une fonction affine décroissante :", latex: `B'(q)=\\dfrac{${e.a}-${e.b}q}{q}` }, null],
      valeur: [
        { texte: "Calcule l'image de la valeur optimale :", latex: `B\\left(${qs}\\right)=${e.a}\\ln\\left(${qs}\\right)-${e.b}\\cdot ${qs}-${e.c}` },
        { texte: "Reviens aux unités de l'énoncé, où q compte des centaines d'unités et B des milliers d'euros :", latex: "q=1\\;\\longrightarrow\\;100\\ \\text{unités}\\qquad B=1\\;\\longrightarrow\\;1000\\ \\text{euros}" },
      ],
    },
    reponses: {
      domaine: [dom],
      derivee: [`B'(q)=\\dfrac{${e.a}}{q}-${e.b}`],
      zero: [`q=${qs}`],
      nature: [],
      valeur: [`q=${qs}\\;\\longrightarrow\\;${dl(m.optimumContexte)}\\ \\text{${e.produit}}`, `B\\left(${qs}\\right)=${e.a}\\ln\\left(${qs}\\right)-${e.a + e.c}\\approx ${dl(m.valeur, 3)}\\;\\longrightarrow\\;${dl(Math.round(m.valeurContexte))}\\ \\text{euros}`],
    },
    calculs: {
      domaine: `\\left\\{\\begin{array}{l}q>0\\\\q\\le ${e.M}\\end{array}\\right.\\iff 0<q\\le ${e.M}`,
      derivee: `B'(q)=${e.a}\\cdot\\dfrac{1}{q}-${e.b}-0=\\dfrac{${e.a}}{q}-${e.b}`,
      zero: `\\dfrac{${e.a}}{q}=${e.b}\\iff q=\\dfrac{${e.a}}{${e.b}}=${qs}`,
      nature: `B'(q)=\\dfrac{${e.a}-${e.b}q}{q}=\\dfrac{${e.b}\\left(${qs}-q\\right)}{q}`,
      valeur: `B\\left(${qs}\\right)=${e.a}\\ln\\left(${qs}\\right)-${dl(e.b * m.xEtoile)}-${e.c}\\approx ${dl(m.valeur, 4)}\\ \\text{milliers d'euros}`,
    },
    pieges: {
      domaine: "Inclure 0 : même si l'entreprise peut ne rien produire, ln(0) n'existe pas — la borne 0 est exclue.",
      derivee: "Garder la constante c dans la dérivée : la dérivée d'une constante est nulle.",
      zero: "Inverser le quotient (q = b/a au lieu de a/b).",
      nature: "Conclure « maximum » parce que la dérivée s'annule : seul le CHANGEMENT DE SIGNE de la dérivée décide.",
      valeur: "Oublier les unités : q compte des centaines d'unités et B des milliers d'euros.",
    },
    axeX: "q (centaines)",
    axeY: "B (milliers d'€)",
  };
}

// ============================================================================
// Bénéfice moyen (ln(x)/x).
// ============================================================================

function ficheRendementMoyen(e: ExerciceRendementMoyen): FicheOptimiser {
  const m = modeleNumerique(e);
  const exacteMode = e.mode === "exacte";
  const xs = expK(e.k);
  const num = `${e.a}\\ln(x)${e.d > 0 ? `+${dl(e.d)}` : e.d < 0 ? dl(e.d) : ""}`;
  const f = `f(x)=\\dfrac{${num}}{x}`;
  const ak = dl(e.a * e.k);
  const dom = domaineLatex(true, 0, e.M);
  const precision = exacteMode ? PRECISION_EXACTE : " Arrondis le nombre de bocaux à l'unité et le bénéfice moyen au centime.";
  const egal = exacteMode ? "=" : "≈";
  const fs = `\\dfrac{${e.a}}{${xs}}`;
  return {
    consigneGenerale: [
      t(`Une coopérative produit x milliers de bocaux de confiture par mois ; elle ne peut pas dépasser ${e.M} milliers de bocaux. Son bénéfice mensuel, en milliers d'euros, est modélisé par `),
      l(num),
      t(". Le bénéfice moyen par bocal, en euros, est donc "),
      l(f),
      t("."),
    ],
    blocDonnees: [f],
    nom: "f",
    variable: "x",
    consignes: {
      domaine: [t("Dans ce contexte, sur quel intervalle la fonction "), l("f"), t(" est-elle définie ? Tiens compte de l'expression ET de la situation.")],
      derivee: [t("Calcule la dérivée "), l("f'(x)"), t(" et simplifie son numérateur.")],
      zero: [t("Pour quelle valeur de "), l("x"), t(" la dérivée s'annule-t-elle ? Donne la valeur exacte.")],
      nature: consigneNature("f", "x"),
      valeur: [t("Combien de bocaux faut-il produire par mois pour que le bénéfice moyen soit maximal, et quel est ce bénéfice moyen (en euros par bocal) ?" + precision)],
    },
    questionPapier: [t("Combien de bocaux la coopérative doit-elle produire par mois pour que le bénéfice moyen par bocal soit maximal ? Justifie qu'il s'agit bien d'un maximum, puis donne ce bénéfice moyen (en euros par bocal)." + precision)],
    champs: {
      derivee: { label: [l("f'(x)"), t(" =")], placeholder: "expression en x", expression: true },
      zero: { label: [l("x"), t(" =")], placeholder: PH_EXACT, expression: false },
      optimum: { label: [t(`Production optimale (en bocaux) ${egal}`)], placeholder: exacteMode ? PH_EXACT : PH_NOMBRE, expression: false },
      valeur: { label: [t(`Bénéfice moyen maximal (en € par bocal) ${egal}`)], placeholder: exacteMode ? PH_EXACT : PH_NOMBRE, expression: false },
    },
    aides: {
      domaine: [
        { texte: "Deux conditions viennent de l'expression, l'une du logarithme, l'autre du dénominateur :", latex: "x>0\\qquad x\\ne 0" },
        { texte: "Croise-les avec la production maximale de la coopérative.", latex: null },
      ],
      derivee: [
        { texte: "Règle du quotient :", latex: "\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}" },
        { texte: "Avec le numérateur et le dénominateur de f :", latex: `u'=\\dfrac{${e.a}}{x}\\qquad v'=1` },
      ],
      zero: [aideZero("f", "x"), { texte: "Une fraction est nulle quand son numérateur l'est ; isole le logarithme puis passe à l'exponentielle :", latex: "\\ln(x)=c\\iff x=e^{c}" }],
      nature: [{ texte: "Le dénominateur est positif ; le signe est celui du numérateur. Comme ln est croissante, compare ln(x) au nombre trouvé :", latex: `f'(x)=\\dfrac{${e.a}\\left(${exact(e.k)}-\\ln(x)\\right)}{x^2}` }, null],
      valeur: [
        { texte: "Calcule l'image de la valeur optimale, sachant que ln(eᵏ) = k :", latex: `f\\left(${xs}\\right)=\\dfrac{${e.a}\\ln\\left(${xs}\\right)${e.d > 0 ? `+${dl(e.d)}` : e.d < 0 ? dl(e.d) : ""}}{${xs}}` },
        { texte: "Reviens aux unités de l'énoncé, où x compte des milliers de bocaux :", latex: "x=1\\;\\longrightarrow\\;1000\\ \\text{bocaux}" },
      ],
    },
    reponses: {
      domaine: [dom],
      derivee: [`f'(x)=\\dfrac{${ak}-${e.a}\\ln(x)}{x^2}`],
      zero: [`x=${xs}`],
      nature: [],
      valeur: exacteMode
        ? [`x=${xs}\\;\\longrightarrow\\;${coefExpK(1000, e.k)}\\ \\text{bocaux}`, `f\\left(${xs}\\right)=${fs}\\ \\text{euros par bocal}`]
        : [`x=${xs}\\;\\longrightarrow\\;${coefExpK(1000, e.k)}\\approx ${dl(Math.round(m.optimumContexte))}\\ \\text{bocaux}`, `f\\left(${xs}\\right)=${fs}\\approx ${fixe(m.valeur, 2)}\\ \\text{euros par bocal}`],
    },
    calculs: {
      domaine: `\\left\\{\\begin{array}{l}x>0\\\\x\\ne 0\\\\x\\le ${e.M}\\end{array}\\right.\\iff 0<x\\le ${e.M}`,
      derivee: `f'(x)=\\dfrac{\\frac{${e.a}}{x}\\cdot x-\\left(${num}\\right)\\cdot 1}{x^2}=\\dfrac{${ak}-${e.a}\\ln(x)}{x^2}`,
      zero: `${ak}-${e.a}\\ln(x)=0\\iff \\ln(x)=${exact(e.k)}\\iff x=${xs}`,
      nature: `f'(x)=\\dfrac{${e.a}\\left(${exact(e.k)}-\\ln(x)\\right)}{x^2}`,
      valeur: `f\\left(${xs}\\right)=\\dfrac{${e.a}\\cdot ${exact(e.k)}${e.d > 0 ? `+${dl(e.d)}` : e.d < 0 ? dl(e.d) : ""}}{${xs}}=${fs}${exacteMode ? "" : `\\approx ${dl(m.valeur, 3)}`}`,
    },
    pieges: {
      domaine: "Oublier une des deux conditions de l'expression ou la production maximale : ici elles donnent toutes x > 0.",
      derivee: "Inverser l'ordre du numérateur de la règle du quotient : c'est u′v − uv′, pas uv′ − u′v.",
      zero: "S'arrêter à ln(x) = k sans passer à l'exponentielle, ou écrire x = ln(k).",
      nature: "Conclure « maximum » parce que la dérivée s'annule : seul le CHANGEMENT DE SIGNE de la dérivée décide.",
      valeur: "Répondre la valeur de x (en milliers de bocaux) au lieu du nombre de bocaux.",
    },
    axeX: "x (milliers de bocaux)",
    axeY: "f (€ par bocal)",
  };
}

// ============================================================================
// Coût moyen (x ln x).
// ============================================================================

function ficheCoutMoyen(e: ExerciceCoutMoyen): FicheOptimiser {
  const m = modeleNumerique(e);
  const exacteMode = e.mode === "exacte";
  const xs = expK(e.k);
  const C = `C(x)=${cf(e.a)}x\\ln(x)${e.b ? `-${cf(e.b)}x` : ""}+${e.c}`;
  const dom = domaineLatex(true, 0, e.M);
  const precision = exacteMode ? PRECISION_EXACTE : " Arrondis le nombre d'affiches à l'unité et le coût au centime.";
  const egal = exacteMode ? "=" : "≈";
  const constante = dl(e.a * e.k); // a·k : C'(x) = a ln(x) − a·k
  const deriv = `C'(x)=${cf(e.a)}\\ln(x)${e.k < 0 ? `+${dl(-e.a * e.k)}` : `-${constante}`}`;
  const cs = `${e.c}-${coefExpK(e.a, e.k)}`;
  const facteurSigne = e.k < 0 ? "\\ln(x)+1" : `\\ln(x)-${exact(e.k)}`;
  return {
    consigneGenerale: [
      t(`Une imprimerie produit x centaines d'affiches par jour ; ses machines ne peuvent pas en produire plus de ${e.M} centaines. Le coût moyen de fabrication d'une affiche, en euros, est modélisé par `),
      l(C),
      t("."),
    ],
    blocDonnees: [C],
    nom: "C",
    variable: "x",
    consignes: {
      domaine: [t("Dans ce contexte, sur quel intervalle la fonction "), l("C"), t(" est-elle définie ? Tiens compte de l'expression ET de la situation.")],
      derivee: [t("Calcule la dérivée "), l("C'(x)"), t(".")],
      zero: [t("Pour quelle valeur de "), l("x"), t(" la dérivée s'annule-t-elle ? Donne la valeur exacte.")],
      nature: consigneNature("C", "x"),
      valeur: [t("Combien d'affiches faut-il produire par jour pour que le coût moyen soit minimal, et quel est ce coût moyen (en euros par affiche) ?" + precision)],
    },
    questionPapier: [t("Combien d'affiches l'imprimerie doit-elle produire par jour pour que le coût moyen soit minimal ? Justifie qu'il s'agit bien d'un minimum, puis donne ce coût moyen (en euros par affiche)." + precision)],
    champs: {
      derivee: { label: [l("C'(x)"), t(" =")], placeholder: "expression en x", expression: true },
      zero: { label: [l("x"), t(" =")], placeholder: PH_EXACT, expression: false },
      optimum: { label: [t(`Production optimale (en affiches) ${egal}`)], placeholder: exacteMode ? PH_EXACT : PH_NOMBRE, expression: false },
      valeur: { label: [t(`Coût moyen minimal (en € par affiche) ${egal}`)], placeholder: exacteMode ? PH_EXACT : PH_NOMBRE, expression: false },
    },
    aides: {
      domaine: [
        { texte: "Le logarithme n'existe que pour un argument strictement positif :", latex: "x>0" },
        { texte: "Croise cette condition avec la production maximale des machines.", latex: null },
      ],
      derivee: [
        { texte: "x·ln(x) est un produit :", latex: "(uv)'=u'v+uv'" },
        { texte: "Avec u = x et v = ln(x) :", latex: "\\left(x\\ln(x)\\right)'=1\\cdot\\ln(x)+x\\cdot\\dfrac{1}{x}" },
      ],
      zero: [aideZero("C", "x"), { texte: "Isole le logarithme puis passe à l'exponentielle :", latex: "\\ln(x)=c\\iff x=e^{c}" }],
      nature: [{ texte: "Mets le coefficient de ln(x) en évidence ; comme ln est croissante, compare ln(x) au nombre trouvé :", latex: `C'(x)=${cf(e.a)}\\left(${facteurSigne}\\right)` }, null],
      valeur: [
        { texte: "Calcule l'image de la valeur optimale, sachant que ln(eᵏ) = k :", latex: `C\\left(${xs}\\right)=${cf(e.a)}${xs}\\ln\\left(${xs}\\right)${e.b ? `-${cf(e.b)}${xs}` : ""}+${e.c}` },
        { texte: "Reviens aux unités de l'énoncé, où x compte des centaines d'affiches :", latex: "x=1\\;\\longrightarrow\\;100\\ \\text{affiches}" },
      ],
    },
    reponses: {
      domaine: [dom],
      derivee: [deriv],
      zero: [`x=${xs}`],
      nature: [],
      valeur: exacteMode
        ? [`x=${xs}\\;\\longrightarrow\\;${coefExpK(100, e.k)}\\ \\text{affiches}`, `C\\left(${xs}\\right)=${cs}\\ \\text{euros par affiche}`]
        : [`x=${xs}\\;\\longrightarrow\\;${coefExpK(100, e.k)}\\approx ${dl(Math.round(m.optimumContexte))}\\ \\text{affiches}`, `C\\left(${xs}\\right)=${cs}\\approx ${fixe(m.valeur, 2)}\\ \\text{euros par affiche}`],
    },
    calculs: {
      domaine: `\\left\\{\\begin{array}{l}x>0\\\\x\\le ${e.M}\\end{array}\\right.\\iff 0<x\\le ${e.M}`,
      derivee: `C'(x)=${cf(e.a)}\\left(\\ln(x)+x\\cdot\\dfrac{1}{x}\\right)${e.b ? `-${cf(e.b)}` : ""}=${deriv.slice(6)}`,
      zero: `${deriv.slice(6)}=0\\iff \\ln(x)=${exact(e.k)}\\iff x=${xs}`,
      nature: `C'(x)=${cf(e.a)}\\left(${facteurSigne}\\right)`,
      valeur: `C\\left(${xs}\\right)=${cf(e.a)}\\cdot ${e.k < 0 ? `(${exact(e.k)})` : exact(e.k)}\\cdot ${xs}${e.b ? `-${cf(e.b)}${xs}` : ""}+${e.c}=${cs}${exacteMode ? "" : `\\approx ${dl(m.valeur, 3)}`}`,
    },
    pieges: {
      domaine: "Inclure 0 : même si l'imprimerie peut ne rien produire, ln(0) n'existe pas — la borne 0 est exclue.",
      derivee: "Dériver x·ln(x) en 1/x ou en ln(x) seulement : c'est un produit, sa dérivée vaut ln(x) + 1.",
      zero: "S'arrêter à ln(x) = k sans passer à l'exponentielle, ou écrire x = ln(k).",
      nature: "Conclure « minimum » parce que la dérivée s'annule : seul le CHANGEMENT DE SIGNE de la dérivée décide.",
      valeur: "Répondre la valeur de x (en centaines d'affiches) au lieu du nombre d'affiches.",
    },
    axeX: "x (centaines d'affiches)",
    axeY: "C (€ par affiche)",
  };
}

// ============================================================================
// Débit d'une route (v ln v).
// ============================================================================

function ficheDebit(e: ExerciceDebit): FicheOptimiser {
  const m = modeleNumerique(e);
  const exacteMode = e.mode === "exacte";
  const vs = expK(e.k);
  const D = `D(v)=${e.a}v-${e.b}v\\ln(v)`;
  const dom = domaineLatex(true, 0, e.M);
  const precision = exacteMode ? PRECISION_EXACTE : " Arrondis la vitesse et le débit à l'unité.";
  const egal = exacteMode ? "=" : "≈";
  const bk = dl(e.b * e.k);
  return {
    consigneGenerale: [
      t(`Sur une route limitée à ${e.M * 10} km/h, le débit de véhicules (en centaines de véhicules par heure) dépend de la vitesse v du trafic, exprimée en dizaines de km/h. Il est modélisé par `),
      l(D),
      t("."),
    ],
    blocDonnees: [D],
    nom: "D",
    variable: "v",
    consignes: {
      domaine: [t("Dans ce contexte, sur quel intervalle la fonction "), l("D"), t(" est-elle définie ? Tiens compte de l'expression ET de la situation.")],
      derivee: [t("Calcule la dérivée "), l("D'(v)"), t(".")],
      zero: [t("Pour quelle valeur de "), l("v"), t(" la dérivée s'annule-t-elle ? Donne la valeur exacte.")],
      nature: consigneNature("D", "v"),
      valeur: [t("À quelle vitesse (en km/h) le débit est-il maximal, et quel est ce débit (en véhicules par heure) ?" + precision)],
    },
    questionPapier: [t("À quelle vitesse (en km/h) le débit de la route est-il maximal ? Justifie qu'il s'agit bien d'un maximum, puis donne ce débit (en véhicules par heure)." + precision)],
    champs: {
      derivee: { label: [l("D'(v)"), t(" =")], placeholder: "expression en v", expression: true },
      zero: { label: [l("v"), t(" =")], placeholder: PH_EXACT, expression: false },
      optimum: { label: [t(`Vitesse optimale (en km/h) ${egal}`)], placeholder: exacteMode ? PH_EXACT : PH_NOMBRE, expression: false },
      valeur: { label: [t(`Débit maximal (en véhicules par heure) ${egal}`)], placeholder: exacteMode ? PH_EXACT : PH_NOMBRE, expression: false },
    },
    aides: {
      domaine: [
        { texte: "Le logarithme n'existe que pour un argument strictement positif :", latex: "v>0" },
        { texte: "Croise cette condition avec la vitesse maximale autorisée.", latex: null },
      ],
      derivee: [
        { texte: "v·ln(v) est un produit :", latex: "(uv)'=u'v+uv'" },
        { texte: "Avec u = v et ln(v) :", latex: "\\left(v\\ln(v)\\right)'=1\\cdot\\ln(v)+v\\cdot\\dfrac{1}{v}" },
      ],
      zero: [aideZero("D", "v"), { texte: "Isole le logarithme puis passe à l'exponentielle :", latex: "\\ln(v)=c\\iff v=e^{c}" }],
      nature: [{ texte: "Mets le coefficient de ln(v) en évidence ; comme ln est croissante, compare ln(v) au nombre trouvé :", latex: `D'(v)=${e.b}\\left(${exact(e.k)}-\\ln(v)\\right)` }, null],
      valeur: [
        { texte: "Calcule l'image de la valeur optimale, sachant que ln(eᵏ) = k :", latex: `D\\left(${vs}\\right)=${e.a}${vs}-${e.b}${vs}\\ln\\left(${vs}\\right)` },
        { texte: "Reviens aux unités de l'énoncé, où v compte des dizaines de km/h et D des centaines de véhicules par heure :", latex: "v=1\\;\\longrightarrow\\;10\\ \\text{km/h}" },
      ],
    },
    reponses: {
      domaine: [dom],
      derivee: [`D'(v)=${bk}-${e.b}\\ln(v)`],
      zero: [`v=${vs}`],
      nature: [],
      valeur: exacteMode
        ? [`v=${vs}\\;\\longrightarrow\\;${coefExpK(10, e.k)}\\ \\text{km/h}`, `D\\left(${vs}\\right)=${coefExpK(e.b, e.k)}\\;\\longrightarrow\\;${coefExpK(100 * e.b, e.k)}\\ \\text{véhicules/h}`]
        : [`v=${vs}\\;\\longrightarrow\\;${coefExpK(10, e.k)}\\approx ${dl(Math.round(m.optimumContexte))}\\ \\text{km/h}`, `D\\left(${vs}\\right)=${coefExpK(e.b, e.k)}\\;\\longrightarrow\\;${coefExpK(100 * e.b, e.k)}\\approx ${dl(Math.round(m.valeurContexte))}\\ \\text{véhicules/h}`],
    },
    calculs: {
      domaine: `\\left\\{\\begin{array}{l}v>0\\\\v\\le ${e.M}\\end{array}\\right.\\iff 0<v\\le ${e.M}`,
      derivee: `D'(v)=${e.a}-${e.b}\\left(\\ln(v)+v\\cdot\\dfrac{1}{v}\\right)=${bk}-${e.b}\\ln(v)`,
      zero: `${bk}-${e.b}\\ln(v)=0\\iff \\ln(v)=${exact(e.k)}\\iff v=${vs}`,
      nature: `D'(v)=${e.b}\\left(${exact(e.k)}-\\ln(v)\\right)`,
      valeur: `D\\left(${vs}\\right)=${e.a}${vs}-${e.b}\\cdot ${exact(e.k)}\\cdot ${vs}=${coefExpK(e.b, e.k)}${exacteMode ? "" : `\\approx ${dl(m.valeur, 3)}`}`,
    },
    pieges: {
      domaine: "Inclure 0 : un trafic à l'arrêt a un sens physique, mais ln(0) n'existe pas — la borne 0 est exclue.",
      derivee: "Dériver v·ln(v) en 1/v ou en ln(v) seulement : c'est un produit, sa dérivée vaut ln(v) + 1.",
      zero: "S'arrêter à ln(v) = k sans passer à l'exponentielle, ou écrire v = ln(k).",
      nature: "Conclure « maximum » parce que la dérivée s'annule : seul le CHANGEMENT DE SIGNE de la dérivée décide.",
      valeur: "Oublier les unités : v compte des dizaines de km/h et D des centaines de véhicules par heure.",
    },
    axeX: "v (dizaines de km/h)",
    axeY: "D (centaines de véh./h)",
  };
}

// ============================================================================
// Points d'entrée (écran, récapitulatif, export).
// ============================================================================

function ficheBrute(e: ExerciceOptimiserLog): FicheOptimiser {
  switch (e.variante) {
    case "engrais":
      return ficheEngrais(e);
    case "benefice":
      return ficheBenefice(e);
    case "rendement-moyen":
      return ficheRendementMoyen(e);
    case "cout-moyen":
      return ficheCoutMoyen(e);
    case "debit":
      return ficheDebit(e);
  }
}

/** Réponse de l'écran « nature » : signe de la dérivée sur chaque morceau du domaine, puis la
 * nature de l'optimum (commune aux cinq situations). */
function reponsesNature(e: ExerciceOptimiserLog): string[] {
  const m = modeleNumerique(e);
  const xs = xEtoileLatex(e);
  const F = `${m.nom}'(${m.variable})`;
  const gauche = `${m.domaine.gaucheOuvert ? "\\mathopen{]}" : "["}${dl(m.domaine.gauche)}\\,;${xs}[`;
  const droite = `\\mathopen{]}${xs}\\,;${dl(m.domaine.droite)}]`;
  const [sg, sd] = m.nature === "max" ? [">", "<"] : ["<", ">"];
  return [
    `${m.variable}\\in ${gauche}\\;\\Rightarrow\\;${F}${sg}0`,
    `${m.variable}\\in ${droite}\\;\\Rightarrow\\;${F}${sd}0`,
    `\\text{${m.nature === "max" ? "maximum" : "minimum"} en }${m.variable}=${xs}`,
  ];
}

export function fiche(e: ExerciceOptimiserLog): FicheOptimiser {
  const brute = ficheBrute(e);
  return { ...brute, reponses: { ...brute.reponses, nature: reponsesNature(e) } };
}

/** Énoncé de l'ÉCRAN : le modèle est affiché dans le bloc de données juste en dessous, l'énoncé y
 * renvoie au lieu de recopier la formule (l'énoncé papier, lui, garde la formule dans le texte). */
export function consigneGeneraleEcran(e: ExerciceOptimiserLog): FragmentConsigne[] {
  const fi = fiche(e);
  return fi.consigneGenerale.flatMap((fr) => (fr.type === "latex" && fr.valeur === fi.blocDonnees[0] ? [t("la fonction "), l(fi.nom), t(" ci-dessous")] : [fr]));
}

export const LIBELLE_PHASE: Record<PhaseOptimiserLog, string> = {
  domaine: "Domaine dans le contexte",
  derivee: "Dérivée",
  zero: "Valeur qui annule la dérivée",
  nature: "Maximum ou minimum",
  valeur: "Optimum en contexte",
};

/** Valeur optimale en LaTeX (exacte) : sert aux options de l'écran « nature ». */
function xEtoileLatex(e: ExerciceOptimiserLog): string {
  return e.variante === "engrais" || e.variante === "benefice" ? exact(modeleNumerique(e).xEtoile) : expK(e.k);
}

/** Options canoniques de l'écran « nature » (0 = la bonne), avant mélange. */
export function optionsNatureCanoniques(e: ExerciceOptimiserLog): FragmentConsigne[][] {
  const m = modeleNumerique(e);
  const F = `${m.nom}'(${m.variable})`;
  const xs = `${m.variable}=${xEtoileLatex(e)}`;
  const posNeg = (nature: string): FragmentConsigne[] => [l(`${F}>0`), t(" avant "), l(xs), t(" et "), l(`${F}<0`), t(` après : ${nature}`)];
  const negPos = (nature: string): FragmentConsigne[] => [l(`${F}<0`), t(" avant "), l(xs), t(" et "), l(`${F}>0`), t(` après : ${nature}`)];
  const sansChangement: FragmentConsigne[] = [l(F), t(" s'annule en "), l(xs), t(" sans changer de signe : ni maximum ni minimum")];
  return m.nature === "max"
    ? [posNeg("maximum"), negPos("minimum"), posNeg("minimum"), sansChangement]
    : [negPos("minimum"), posNeg("maximum"), negPos("maximum"), sansChangement];
}

/** Options de l'écran « nature », dans l'ordre d'affichage tiré (`ordreNature`). */
export function optionsNature(e: ExerciceOptimiserLog): OptionNature[] {
  const options = optionsNatureCanoniques(e);
  return e.ordreNature.map((canon) => ({ id: String(canon), fragments: options[canon] }));
}

export function aideNiveau1(e: ExerciceOptimiserLog, phase: PhaseOptimiserLog): AideAvecLatex {
  return fiche(e).aides[phase][0];
}

export function aideNiveau2(e: ExerciceOptimiserLog, phase: PhaseOptimiserLog): AideAvecLatex {
  return fiche(e).aides[phase][1] ?? { texte: "", latex: null };
}

/** Réponse attendue d'un écran, en LaTeX (une ou plusieurs formules). */
export function formatReponseAttenduePhaseLatex(e: ExerciceOptimiserLog, phase: PhaseOptimiserLog): string[] {
  return fiche(e).reponses[phase];
}
