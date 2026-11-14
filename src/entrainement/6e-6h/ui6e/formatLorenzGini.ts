import { aireConcentration, aireEnFonctionDeA, coefficientGini, courbesSeCroisent, evaluerLorenz, giniEnFonctionDeA, integraleLorenz } from "../core6e/lorenzGini";
import type { CourbeLorenz, ExerciceLorenzComparaison, ExerciceLorenzGini, ExerciceLorenzLecture, ExerciceLorenzParametre } from "../core6e/lorenzGini";
import type { PhaseLorenz } from "../moteur6e/typesLorenzGini";
import { idVerdictJuste } from "../moteur6e/verificationLorenzGini";
import { decimalLatex, decimalTexte, egalExactPuisApprox, fractionDepuisValeur, fractionLatex } from "./nombresExactsIntegrales";

/**
 * Couche C (6e) — textes de `6gen82` « Courbe de Lorenz et coefficient de Gini ». SOURCE UNIQUE des
 * consignes, aides, options et réponses attendues : l'écran, le récapitulatif et l'adaptateur de
 * feuilles (`generateurs6e/lorenzGini/exportEvaluation.ts`) en dérivent.
 *
 * Notations du cours (chapitre 4 de 6e, section « problèmes ») : aire de concentration 𝒜 (`\mathcal{A}`),
 * $G = 2\int_0^1 (x - L(x))\,dx$, virgule décimale `{,}`, signe « − » typographique, jamais de prose
 * dans le mode math, aides = phrase terminée par « : » puis la formule, sans la réponse finale.
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  label: string;
  /** Libellé en LaTeX, rendu à la place de `label` quand il est fourni (`label` reste le texte brut
   * de l'historique). */
  labelLatex?: string;
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

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

export const PRECISION = " (valeur exacte ou arrondie au millième)";

// ============================================================================
// Écriture des courbes et des nombres.
// ============================================================================

/** Coefficient décimal en LaTeX (« 0{,}7 »). */
function coefLatex(a: number): string {
  return decimalLatex(a, 6);
}

/** e^{m} en LaTeX : « e » pour m = 1. */
function puissanceE(m: number): string {
  return Math.abs(m - 1) < 1e-9 ? "e" : `e^{${decimalLatex(m, 6)}}`;
}

/** Exposant n de xⁿ en LaTeX : entier (« 3 ») ou fraction (« \frac{3}{2} »). */
function exposantLatex(n: number): string {
  const f = fractionDepuisValeur(n, 12);
  return f && f.den !== 1 ? `\\frac{${f.num}}{${f.den}}` : `${Math.round(n)}`;
}

/** 1/(n + 1) en LaTeX (« \dfrac{1}{4} », « \dfrac{2}{5} ») : coefficient de la primitive de xⁿ. */
function inverseNPlusUnLatex(n: number): string {
  const f = fractionDepuisValeur(1 / (n + 1), 24);
  return f ? fractionLatex(f.num, f.den) : `\\dfrac{1}{${decimalLatex(n + 1, 6)}}`;
}

/** e^{kx} en LaTeX : « e^{x} », « e^{2x} ». */
function expKx(k: number): string {
  return k === 1 ? "e^{x}" : `e^{${k}x}`;
}

/** Expression de L(x) en LaTeX. */
export function lorenzLatex(c: CourbeLorenz): string {
  const p = c.parametre;
  switch (c.famille) {
    case "puissance":
      return `x^{${exposantLatex(p)}}`;
    case "mixte2":
      return `${coefLatex(p)}x^{2}+${coefLatex(1 - p)}x`;
    case "mixte3":
      return `${coefLatex(p)}x^{3}+${coefLatex(1 - p)}x`;
    case "expo":
      return `\\dfrac{${expKx(p)}-1}{${puissanceE(p)}-1}`;
  }
}

/** x − L(x), simplifiée (facteur a mis en évidence pour les familles mixtes). */
export function differenceLatex(c: CourbeLorenz): string {
  const p = c.parametre;
  switch (c.famille) {
    case "puissance":
      return `x-x^{${exposantLatex(p)}}`;
    case "mixte2":
      return `${coefLatex(p)}\\left(x-x^{2}\\right)`;
    case "mixte3":
      return `${coefLatex(p)}\\left(x-x^{3}\\right)`;
    case "expo":
      return `x-${lorenzLatex(c)}`;
  }
}

/** Calcul de 𝒜 = ∫₀¹ (x − L(x)) dx : primitive entre crochets, puis valeur des crochets. */
export function calculAireLatex(c: CourbeLorenz): string {
  const p = c.parametre;
  const integrale = `\\displaystyle\\int_0^1\\left(${differenceLatex(c)}\\right)dx`;
  switch (c.famille) {
    case "puissance":
      // Entier : x^{n+1}/(n+1) ; fractionnaire : coefficient 1/(n+1) écrit comme une fraction.
      return Number.isInteger(p)
        ? `${integrale}=\\left[\\dfrac{x^{2}}{2}-\\dfrac{x^{${p + 1}}}{${p + 1}}\\right]_0^1=\\dfrac{1}{2}-\\dfrac{1}{${p + 1}}`
        : `${integrale}=\\left[\\dfrac{x^{2}}{2}-${inverseNPlusUnLatex(p)}\\,x^{${exposantLatex(p + 1)}}\\right]_0^1=\\dfrac{1}{2}-${inverseNPlusUnLatex(p)}`;
    case "mixte2":
      return `${integrale}=${coefLatex(p)}\\left[\\dfrac{x^{2}}{2}-\\dfrac{x^{3}}{3}\\right]_0^1=${coefLatex(p)}\\times\\dfrac{1}{6}`;
    case "mixte3":
      return `${integrale}=${coefLatex(p)}\\left[\\dfrac{x^{2}}{2}-\\dfrac{x^{4}}{4}\\right]_0^1=${coefLatex(p)}\\times\\dfrac{1}{4}`;
    case "expo": {
      const unSurK = p === 1 ? "1" : `\\dfrac{1}{${p}}`;
      const quotient = p === 1 ? "e^{x}" : `\\dfrac{${expKx(p)}}{${p}}`;
      return `${integrale}=\\left[\\dfrac{x^{2}}{2}-\\dfrac{1}{${puissanceE(p)}-1}\\left(${quotient}-x\\right)\\right]_0^1=\\dfrac{1}{2}-${unSurK}+\\dfrac{1}{${puissanceE(p)}-1}`;
    }
  }
}

/** Forme EXACTE fermée de l'aire de concentration, `null` si c'est une fraction (reconnue seule). */
function aireExacteExpo(k: number): string {
  if (k === 1) return "\\dfrac{1}{e-1}-\\dfrac{1}{2}";
  if (k === 2) return "\\dfrac{1}{e^{2}-1}";
  return "\\dfrac{1}{6}+\\dfrac{1}{e^{3}-1}";
}

function giniExactExpo(k: number): string {
  if (k === 1) return "\\dfrac{2}{e-1}-1";
  if (k === 2) return "\\dfrac{2}{e^{2}-1}";
  return "\\dfrac{1}{3}+\\dfrac{2}{e^{3}-1}";
}

/** « = exact ≈ approché » de l'aire (à placer après un nom). */
export function aireEgaleLatex(c: CourbeLorenz): string {
  return egalExactPuisApprox(aireConcentration(c), c.famille === "expo" ? aireExacteExpo(c.parametre) : null);
}

/** « = exact ≈ approché » du coefficient de Gini. */
export function giniEgalLatex(c: CourbeLorenz): string {
  return egalExactPuisApprox(coefficientGini(c), c.famille === "expo" ? giniExactExpo(c.parametre) : null);
}

/** Valeur exacte de L(p) puis valeur approchée. */
export function lectureEgaleLatex(e: ExerciceLorenzLecture): string {
  const v = evaluerLorenz(e.courbe, e.p);
  if (e.courbe.famille === "expo") {
    const k = e.courbe.parametre;
    return `=\\dfrac{${puissanceE(k * e.p)}-1}{${puissanceE(k)}-1}\\approx ${decimalLatex(v)}`;
  }
  return `=${decimalLatex(v, 6)}`;
}

/** L(p) avec x remplacé par p (polynômes : valeur entre parenthèses ; exponentielle : exposant calculé). */
export function substitutionLatex(e: ExerciceLorenzLecture): string {
  const c = e.courbe;
  if (c.famille === "expo") return `L(${pLatex(e.p)})=\\dfrac{${puissanceE(c.parametre * e.p)}-1}{${puissanceE(c.parametre)}-1}`;
  return `L(${pLatex(e.p)})=${lorenzLatex(c).replace(/x/g, `\\left(${pLatex(e.p)}\\right)`)}`;
}

/** Pourcentage en texte : exact (« 40,96 ») ou arrondi au dixième pour l'exponentielle. */
function pourcentTexte(v: number, approche: boolean): string {
  return decimalTexte(v * 100, approche ? 1 : 4);
}

function pTexte(p: number): string {
  return decimalTexte(p, 3);
}

function pLatex(p: number): string {
  return decimalLatex(p, 3);
}

// ============================================================================
// Vocabulaire du contexte.
// ============================================================================

interface Vocabulaire {
  individus: string;
  pauvres: string;
  riches: string;
  total: string;
  verbe: string;
}

function vocabulaire(contexte: "pays" | "entreprise" | "reforme"): Vocabulaire {
  if (contexte === "entreprise") return { individus: "salariés", pauvres: "les moins bien payés", riches: "les mieux payés", total: "de la masse salariale", verbe: "perçoivent" };
  return { individus: "ménages", pauvres: "les plus pauvres", riches: "les plus riches", total: "du revenu total", verbe: "se partagent" };
}

/** Indice d'une courbe comparée : initiale du pays, ou 1 (avant) / 2 (après la réforme). */
export function indiceCourbe(e: ExerciceLorenzComparaison, i: 0 | 1): string {
  return e.contexte === "pays" ? e.noms[i][0] : `${i + 1}`;
}

/** Nom en texte d'une répartition comparée. */
export function nomRepartition(e: ExerciceLorenzComparaison, i: 0 | 1): string {
  return e.contexte === "pays" ? e.noms[i] : i === 0 ? "avant la réforme" : "après la réforme";
}

// ============================================================================
// Consigne générale et données.
// ============================================================================

function phraseLorenz(v: Vocabulaire): string {
  return `on classe les ${v.individus} du ${v.pauvres === "les plus pauvres" ? "plus pauvre au plus riche" : "moins bien payé au mieux payé"}. La courbe de Lorenz associe à la part x des ${v.individus} ${v.pauvres} (0 ≤ x ≤ 1) la part L(x) ${v.total} qu'ils ${v.verbe === "perçoivent" ? "perçoivent" : "se partagent"}`;
}

export function consigneGenerale(e: ExerciceLorenzGini): FragmentConsigne[] {
  switch (e.variante) {
    case "lecture": {
      const v = vocabulaire(e.contexte);
      const debut = e.contexte === "pays" ? `En ${e.nomPays}, ` : "Dans une entreprise, ";
      return [t(`${debut}${phraseLorenz(v)}. Les économistes la modélisent par la fonction ci-dessous ; la diagonale `), l("y=x"), t(" correspond à une répartition parfaitement égalitaire.")];
    }
    case "comparaison": {
      const v = vocabulaire("pays");
      if (e.contexte === "pays") {
        return [
          t(`Dans deux pays, ${phraseLorenz(v)}. Pour ${e.noms[0]} et ${e.noms[1]}, les économistes proposent les courbes de Lorenz `),
          l(`L_{${indiceCourbe(e, 0)}}`),
          t(" et "),
          l(`L_{${indiceCourbe(e, 1)}}`),
          t(" ci-dessous."),
        ];
      }
      return [
        t(`En ${e.noms[0]}, ${phraseLorenz(v)}. Un institut a modélisé cette courbe avant une réforme fiscale (`),
        l("L_1"),
        t(") et un an après ("),
        l("L_2"),
        t(") :"),
      ];
    }
    case "parametre": {
      const v = vocabulaire(e.contexte);
      const debut = e.contexte === "pays" ? `En ${e.nomPays}, le gouvernement prépare une réforme fiscale. ` : "Une entreprise revoit sa grille des salaires. ";
      const p = phraseLorenz(v);
      return [
        t(`${debut}${p.charAt(0).toUpperCase()}${p.slice(1)}. La courbe visée est modélisée par la fonction ci-dessous, où a est un paramètre de [0 ; 1]. ${e.contexte === "pays" ? "Le gouvernement" : "L'entreprise"} vise un coefficient de Gini égal à `),
        l(decimalLatex(e.giniVise)),
        t("."),
      ];
    }
  }
}

export function blocDonnees(e: ExerciceLorenzGini): string[] {
  switch (e.variante) {
    case "lecture":
      return [`L(x)=${lorenzLatex(e.courbe)}`];
    case "comparaison":
      return e.courbes.map((c, i) => `L_{${indiceCourbe(e, i as 0 | 1)}}(x)=${lorenzLatex(c)}`);
    case "parametre":
      return [`L(x)=ax^{${e.famille === "mixte2" ? 2 : 3}}+(1-a)x\\qquad 0\\leq a\\leq 1`];
  }
}

// ============================================================================
// Écrans.
// ============================================================================

export function libellePhase(e: ExerciceLorenzGini, phase: PhaseLorenz): string {
  switch (phase) {
    case "valeur":
      return "Part des revenus";
    case "interpretation":
      return "Interprétation";
    case "aire":
    case "aires":
      return "Aire entre diagonale et courbe";
    case "gini":
    case "ginis":
      return "Coefficient de Gini";
    case "verdict":
      return "Conclusion";
    case "aireA":
      return "Aire en fonction de a";
    case "giniA":
      return "Gini en fonction de a";
    case "valeurA":
      return e.variante === "parametre" ? "Valeur de a" : "Valeur";
  }
}

export function consigneEcran(e: ExerciceLorenzGini, phase: PhaseLorenz): FragmentConsigne[] {
  switch (phase) {
    case "valeur":
      return e.variante === "lecture" ? [t("Calcule "), l(`L(${pLatex(e.p)})`), t(`${PRECISION}.`)] : [];
    case "interpretation": {
      const arrondi = e.variante === "lecture" && e.courbe.famille === "expo" ? " (pourcentages arrondis au dixième)" : "";
      return [t(`Que signifie ce résultat ?${arrondi} Une seule tentative.`)];
    }
    case "aire":
      return [t("Calcule l'aire "), l("\\mathcal{A}"), t(" de la région comprise entre la diagonale "), l("y=x"), t(" et la courbe de Lorenz, pour x compris entre 0 et 1"), t(`${PRECISION}.`)];
    case "aires":
      return [t("Pour chaque courbe, calcule l'aire de la région comprise entre la diagonale "), l("y=x"), t(" et la courbe de Lorenz, pour x compris entre 0 et 1 (valeurs exactes ou arrondies au millième).")];
    case "gini":
      return [t("Déduis-en le coefficient de Gini G de cette répartition"), t(`${PRECISION}.`)];
    case "ginis":
      return [t("Déduis-en le coefficient de Gini de chaque répartition (valeurs exactes ou arrondies au millième).")];
    case "verdict":
      return [t("Selon le coefficient de Gini, quelle conclusion tirer ? Une seule tentative.")];
    case "aireA":
      return [t("Exprime en fonction de a l'aire "), l("\\mathcal{A}"), t(" de la région comprise entre la diagonale "), l("y=x"), t(" et la courbe de Lorenz, pour x compris entre 0 et 1.")];
    case "giniA":
      return [t("Exprime en fonction de a le coefficient de Gini G de cette répartition.")];
    case "valeurA":
      return [t("Détermine la valeur de a qui donne le coefficient de Gini visé"), t(`${PRECISION}.`)];
  }
}

export function champsEcran(e: ExerciceLorenzGini, phase: PhaseLorenz): ChampDef[] {
  switch (phase) {
    case "valeur":
      return e.variante === "lecture" ? [{ label: `L(${pTexte(e.p)})`, labelLatex: `L(${pLatex(e.p)})`, placeholder: "ex : 0,3 ou 30 %" }] : [];
    case "aire":
      return [{ label: "Aire 𝒜", labelLatex: "\\mathcal{A}", placeholder: "ex : 1/8" }];
    case "gini":
      return [{ label: "G", labelLatex: "G", placeholder: "ex : 0,25" }];
    case "aires":
      return e.variante === "comparaison" ? ([0, 1] as const).map((i) => ({ label: `Aire pour ${nomRepartition(e, i)}`, labelLatex: `\\mathcal{A}_{${indiceCourbe(e, i)}}`, placeholder: "ex : 1/8" })) : [];
    case "ginis":
      return e.variante === "comparaison" ? ([0, 1] as const).map((i) => ({ label: `G pour ${nomRepartition(e, i)}`, labelLatex: `G_{${indiceCourbe(e, i)}}`, placeholder: "ex : 0,25" })) : [];
    case "aireA":
      return [{ label: "𝒜(a)", labelLatex: "\\mathcal{A}(a)", placeholder: "ex : 2a/5" }];
    case "giniA":
      return [{ label: "G(a)", labelLatex: "G(a)", placeholder: "ex : 3a/7" }];
    case "valeurA":
      return [{ label: "a", labelLatex: "a", placeholder: "ex : 0,4" }];
    default:
      return [];
  }
}

/** Libellés courts des champs (préfixe des messages de piège en comparaison). */
export function libellesChamps(e: ExerciceLorenzGini): string[] {
  return e.variante === "comparaison" ? [nomRepartition(e, 0), nomRepartition(e, 1)].map((s) => s.charAt(0).toUpperCase() + s.slice(1)) : [];
}

// ============================================================================
// Choix fermés.
// ============================================================================

/** Les 4 phrases canoniques d'interprétation de L(p) (0 = juste). */
function interpretationsCanoniques(e: ExerciceLorenzLecture): string[] {
  const v = vocabulaire(e.contexte);
  const approche = e.courbe.famille === "expo";
  const P = decimalTexte(e.p * 100, 1);
  const valeur = evaluerLorenz(e.courbe, e.p);
  const V = pourcentTexte(valeur, approche);
  const complement = pourcentTexte(1 - valeur, approche);
  return [
    `Les ${P} % des ${v.individus} ${v.pauvres} ${v.verbe} ${V} % ${v.total}.`,
    `Les ${v.individus} ${v.pauvres}, qui forment ${V} % de l'ensemble, ${v.verbe} ${P} % ${v.total}.`,
    `Les ${P} % des ${v.individus} ${v.riches} ${v.verbe} ${V} % ${v.total}.`,
    `Les ${P} % des ${v.individus} ${v.pauvres} ${v.verbe} ${complement} % ${v.total}.`,
  ];
}

/** Les 2 verdicts canoniques (0 : la répartition 1 est la plus inégalitaire). */
function verdictsCanoniques(e: ExerciceLorenzComparaison): string[] {
  if (e.contexte === "pays") return e.noms.map((n) => `C'est en ${n} que les revenus sont répartis de la façon la plus inégalitaire.`);
  return ["La réforme a réduit les inégalités de revenus.", "La réforme a accru les inégalités de revenus."];
}

export function optionsChoix(e: ExerciceLorenzGini, phase: PhaseLorenz): OptionChoix[] {
  if (phase === "interpretation" && e.variante === "lecture") {
    const c = interpretationsCanoniques(e);
    return e.ordreInterpretation.map((i) => ({ id: `${i}`, fragments: [t(c[i])] }));
  }
  if (phase === "verdict" && e.variante === "comparaison") {
    const c = verdictsCanoniques(e);
    return e.ordreVerdict.map((i) => ({ id: `${i}`, fragments: [t(c[i])] }));
  }
  return [];
}

/** Réponse juste d'un écran à choix, en fragments. */
export function reponseChoix(e: ExerciceLorenzGini, phase: PhaseLorenz): FragmentConsigne[] {
  if (phase === "interpretation" && e.variante === "lecture") return [t(interpretationsCanoniques(e)[0])];
  if (phase === "verdict" && e.variante === "comparaison") return [t(verdictsCanoniques(e)[Number(idVerdictJuste(e))])];
  return [];
}

/** Fragments de l'option choisie (historique). */
export function fragmentsOption(options: OptionChoix[], id: string | null): FragmentConsigne[] {
  return options.find((o) => o.id === id)?.fragments ?? [];
}

// ============================================================================
// Réponses attendues (écrans à champs).
// ============================================================================

function aireEnALatex(e: ExerciceLorenzParametre): string {
  return e.famille === "mixte2" ? "\\dfrac{a}{6}" : "\\dfrac{a}{4}";
}

function giniEnALatex(e: ExerciceLorenzParametre): string {
  return e.famille === "mixte2" ? "\\dfrac{a}{3}" : "\\dfrac{a}{2}";
}

export function formatReponseAttenduePhaseLatex(e: ExerciceLorenzGini, phase: PhaseLorenz): string[] {
  switch (e.variante) {
    case "lecture":
      if (phase === "valeur") return [`L(${pLatex(e.p)})${lectureEgaleLatex(e)}`];
      if (phase === "aire") return [`\\mathcal{A}${aireEgaleLatex(e.courbe)}`];
      if (phase === "gini") return [`G${giniEgalLatex(e.courbe)}`];
      return [];
    case "comparaison":
      if (phase === "aires") return e.courbes.map((c, i) => `\\mathcal{A}_{${indiceCourbe(e, i as 0 | 1)}}${aireEgaleLatex(c)}`);
      if (phase === "ginis") return e.courbes.map((c, i) => `G_{${indiceCourbe(e, i as 0 | 1)}}${giniEgalLatex(c)}`);
      return [];
    case "parametre":
      if (phase === "aireA") return [`\\mathcal{A}(a)=${aireEnALatex(e)}`];
      if (phase === "giniA") return [`G(a)=${giniEnALatex(e)}`];
      if (phase === "valeurA") return [`a=${decimalLatex(e.a, 6)}`];
      return [];
  }
}

// ============================================================================
// Aides (jamais la réponse finale).
// ============================================================================

export function aideNiveau1(e: ExerciceLorenzGini, phase: PhaseLorenz): AideAvecLatex {
  switch (phase) {
    case "valeur":
      return e.variante === "lecture" ? { texte: `La part des revenus détenue par les ${decimalTexte(e.p * 100, 1)} % ${vocabulaire(e.contexte).pauvres} est l'image de ${pTexte(e.p)} par L :`, latex: `L(${pLatex(e.p)})` } : { texte: "" };
    case "interpretation":
      return { texte: "En abscisse, une part de la population (en commençant par les plus pauvres) ; en ordonnée, la part des revenus qu'elle détient :", latex: "x\\ \\longmapsto\\ L(x)" };
    case "aire":
    case "aires":
      return { texte: "La diagonale est au-dessus de la courbe de Lorenz : l'aire cherchée est l'intégrale de la différence entre les deux :", latex: "\\mathcal{A}=\\displaystyle\\int_0^1\\left(x-L(x)\\right)dx" };
    case "gini":
    case "ginis":
      return { texte: "Le coefficient de Gini compare l'aire 𝒜 à celle du triangle sous la diagonale, qui vaut un demi :", latex: "G=\\dfrac{\\mathcal{A}}{1/2}=2\\displaystyle\\int_0^1\\left(x-L(x)\\right)dx" };
    case "verdict":
      return { texte: "G vaut 0 pour une répartition parfaitement égalitaire ; plus G est proche de 1, plus les revenus sont concentrés :", latex: "0\\leq G\\leq 1" };
    case "aireA":
      return e.variante === "parametre" ? { texte: "Écris d'abord la différence entre la diagonale et la courbe, en mettant a en évidence :", latex: `x-L(x)=a\\left(x-x^{${e.famille === "mixte2" ? 2 : 3}}\\right)` } : { texte: "" };
    case "giniA":
      return { texte: "Le coefficient de Gini vaut le double de l'aire 𝒜 entre la diagonale et la courbe :", latex: "G=2\\,\\mathcal{A}" };
    case "valeurA":
      return e.variante === "parametre" ? { texte: "Égale le coefficient de Gini en fonction de a à la valeur visée, puis résous :", latex: `${giniEnALatex(e)}=${decimalLatex(e.giniVise)}` } : { texte: "" };
  }
}

export function aideNiveau2(e: ExerciceLorenzGini, phase: PhaseLorenz): AideAvecLatex {
  switch (phase) {
    case "valeur":
      if (e.variante !== "lecture") return { texte: "" };
      if (e.courbe.famille === "expo") {
        const k = e.courbe.parametre;
        return { texte: "Remplace x par sa valeur : au numérateur, l'exposant de e vaut :", latex: `${k}\\times ${pLatex(e.p)}=${decimalLatex(k * e.p, 6)}` };
      }
      if (e.courbe.famille === "puissance" && !Number.isInteger(e.courbe.parametre)) {
        // Exposant k/2 ou k/3 : racine (carrée ou cubique) d'abord, puis puissance entière.
        const f = fractionDepuisValeur(e.courbe.parametre, 12)!;
        const racine = f.den === 2 ? `\\sqrt{${pLatex(e.p)}}` : `\\sqrt[3]{${pLatex(e.p)}}`;
        return { texte: `Un exposant ${f.num}/${f.den} se calcule en prenant d'abord la racine ${f.den === 2 ? "carrée" : "cubique"}, puis la puissance ${f.num} :`, latex: `${substitutionLatex(e)}=\\left(${racine}\\right)^{${f.num}}` };
      }
      return { texte: "Remplace x par sa valeur dans l'expression de L :", latex: substitutionLatex(e) };
    case "interpretation":
      return { texte: "Les plus riches détiennent le reste des revenus :", latex: e.variante === "lecture" ? `1-L(${pLatex(e.p)})` : undefined };
    case "aire":
      if (e.variante !== "lecture") return { texte: "" };
      return { texte: "Une primitive de x − L(x) s'obtient terme à terme ; ici la différence vaut :", latex: `x-L(x)=${differenceLatex(e.courbe)}` };
    case "aires":
      if (e.variante !== "comparaison") return { texte: "" };
      return { texte: "Écris la différence entre la diagonale et chaque courbe :", latex: e.courbes.map((c, i) => `x-L_{${indiceCourbe(e, i as 0 | 1)}}(x)=${differenceLatex(c)}`).join("\\qquad ") };
    case "gini":
      return { texte: "Multiplie par 2 l'aire obtenue à l'étape précédente :", latex: e.variante === "lecture" ? `G=2\\times\\mathcal{A}` : undefined };
    case "ginis":
      return { texte: "Multiplie par 2 chacune des deux aires obtenues à l'étape précédente :", latex: "G=2\\times\\mathcal{A}" };
    case "aireA":
      if (e.variante !== "parametre") return { texte: "" };
      return e.famille === "mixte2"
        ? { texte: "Primitive du facteur entre parenthèses :", latex: "\\displaystyle\\int_0^1\\left(x-x^{2}\\right)dx=\\left[\\dfrac{x^{2}}{2}-\\dfrac{x^{3}}{3}\\right]_0^1" }
        : { texte: "Primitive du facteur entre parenthèses :", latex: "\\displaystyle\\int_0^1\\left(x-x^{3}\\right)dx=\\left[\\dfrac{x^{2}}{2}-\\dfrac{x^{4}}{4}\\right]_0^1" };
    case "giniA":
      return { texte: "Multiplie par 2 l'expression de l'aire obtenue à l'étape précédente, puis simplifie la fraction." };
    case "valeurA":
      return { texte: "Vérifie enfin que la valeur trouvée convient : L n'est une courbe de Lorenz que si :", latex: "0\\leq a\\leq 1" };
    case "verdict":
      return { texte: "" };
  }
}

// ============================================================================
// Pour le corrigé : croisement des courbes, valeurs utiles.
// ============================================================================

export function phraseCroisement(e: ExerciceLorenzComparaison): string {
  return courbesSeCroisent(e.courbes[0], e.courbes[1])
    ? "Les deux courbes se croisent : la figure seule ne permet pas de trancher, le coefficient de Gini, lui, donne un classement."
    : "Une courbe reste entièrement sous l'autre : la plus éloignée de la diagonale correspond bien au plus grand coefficient de Gini.";
}

/** ∫₀¹ L(x) dx écrit (aire sous la courbe, utile pour un piège du corrigé). */
export function aireSousCourbeLatex(c: CourbeLorenz): string {
  const v = integraleLorenz(c);
  const f = fractionDepuisValeur(v);
  return f && c.famille !== "expo" ? fractionLatex(f.num, f.den) : decimalLatex(v);
}

export { aireEnFonctionDeA, giniEnFonctionDeA, aireEnALatex, giniEnALatex };
