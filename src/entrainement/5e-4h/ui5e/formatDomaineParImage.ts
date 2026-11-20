import type { ExerciceDomaineParImage, Exterieure, Interieure } from "../core5e/domaineParImage";
import { ensembleL } from "../moteur5e/ensembleSaisi";
import type { AideEcran, Frag, ModeEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";

/**
 * Couche C — textes de `5gen62` « Domaine d'une composée par l'image » : écritures de f et g, des
 * ensembles (∅, ℝ, ℝ∖{…}, réunions, ±∞ toujours ouverts), consignes, aides, réponses. Source unique
 * de l'écran, du récapitulatif, du corrigé et du papier. Notations du cours : `\operatorname{dom}`,
 * `\operatorname{Im}`, `\mathopen{]}`.
 */

type E = ExerciceDomaineParImage;
export type PhaseDomaineParImage = "image" | "domaine" | "valeurs" | "composee";

export const PHASES: PhaseDomaineParImage[] = ["image", "domaine", "valeurs", "composee"];
export const phases = (_e: E): PhaseDomaineParImage[] => PHASES;

// ============================================================================
// Écritures.
// ============================================================================

/** « x − 3 », « x + 2 », « x ». */
export const xMoins = (c: number) => (c === 0 ? "x" : c > 0 ? `x-${c}` : `x+${-c}`);
/** « 3 − x », « −2 − x », « −x ». */
export const cMoinsX = (c: number) => (c === 0 ? "-x" : `${c}-x`);
const plusK = (k: number) => (k === 0 ? "" : k > 0 ? `+${k}` : `${k}`);

/** Expression de g (sans « g(x) = »), avec `v` comme variable. */
export function expressionG(g: Interieure, v = "x"): string {
  switch (g.famille) {
    case "carre":
      return `${v}^2${plusK(g.k)}`;
    case "oppCarre":
      return `-${v}^2${plusK(g.k)}`;
    case "absolue":
      return `\\left|${v}\\right|${plusK(g.k)}`;
    case "affine": {
      const m = g.m === 1 ? "" : g.m === -1 ? "-" : `${g.m}`;
      return `${m}${v}${plusK(g.k)}`;
    }
    case "racine":
      return `\\sqrt{${v}}${plusK(g.k)}`;
    case "inverse":
      return `\\dfrac{1}{${v}}${plusK(g.k)}`;
  }
}

/** Expression de f, argument `a` (déjà parenthésé si besoin). */
export function expressionF(f: Exterieure, a = "x"): string {
  const moins = (c: number) => (c === 0 ? a : c > 0 ? `${a}-${c}` : `${a}+${-c}`);
  const cm = (c: number) => (c === 0 ? `-${a}` : `${c}-${a}`);
  switch (f.famille) {
    case "racine":
      return `\\sqrt{${moins(f.c)}}`;
    case "racineMoins":
      return `\\sqrt{${cm(f.c)}}`;
    case "inverse":
      return `\\dfrac{1}{${moins(f.c)}}`;
    case "inverseRacine":
      return `\\dfrac{1}{\\sqrt{${moins(f.c)}}}`;
    case "inverseRacineMoins":
      return `\\dfrac{1}{\\sqrt{${cm(f.c)}}}`;
  }
}

export const fL = (e: E) => `f(x)=${expressionF(e.f)}`;
export const gL = (e: E) => `g(x)=${expressionG(e.g)}`;

/** Symbole de la condition de dom f, écrite sur son argument A : A ≥ c, A ≤ c, A ≠ c, A > c, A < c. */
export function symboleCondition(f: Exterieure): string {
  return { racine: "\\geq", racineMoins: "\\leq", inverse: "\\neq", inverseRacine: ">", inverseRacineMoins: "<" }[f.famille];
}

// ============================================================================
// Écrans.
// ============================================================================

export function consigneGenerale(e: E): Frag[] {
  return [tx("Soit "), lx(fL(e)), tx(" et "), lx(gL(e)), tx(". Détermine le domaine de "), lx("f\\circ g"), tx(" en passant par l'image de g.")];
}

export function libelle(_e: E, phase: PhaseDomaineParImage): string {
  return { image: "Image de g", domaine: "Domaine de f", valeurs: "Valeurs que f peut recevoir", composee: "Domaine de f∘g" }[phase];
}

export function consigne(e: E, phase: PhaseDomaineParImage): Frag[] {
  switch (phase) {
    case "image":
      return [tx("Quelles valeurs "), lx("g(x)"), tx(" peut-il prendre ? Donne "), lx("\\operatorname{Im} g"), tx(".")];
    case "domaine":
      return [tx("Quels nombres f peut-elle recevoir ? Donne "), lx("\\operatorname{dom} f"), tx(".")];
    case "valeurs":
      return [tx("Parmi les valeurs de "), lx("g(x)"), tx(", lesquelles f peut-elle recevoir ? Donne "), lx("\\operatorname{Im} g\\cap\\operatorname{dom} f"), tx(".")];
    case "composee":
      return [tx("Donne "), lx("\\operatorname{dom}(f\\circ g)"), tx(" : les "), lx("x"), tx(" de "), lx("\\operatorname{dom} g"), tx(" dont l'image "), lx("g(x)"), tx(" tombe dans "), lx(ensembleL(e.valeurs)), tx(".")];
  }
}

export const MODE_ENSEMBLE: ModeEcran = { type: "intervalles", variable: "x", placeholders: ["ex. : −inf", "ex. : 3/2"], vide: true };

// ============================================================================
// Aides (deux niveaux, jamais la réponse).
// ============================================================================

function aideImage1(g: Interieure): AideEcran {
  const debut: Frag[] = [tx("L'image de g, c'est l'ensemble de toutes les valeurs "), lx("g(x)"), tx(" quand "), lx("x"), tx(" parcourt "), lx("\\operatorname{dom} g"), tx(". ")];
  switch (g.famille) {
    case "carre":
      return { texte: [...debut, tx("Pars du signe d'un carré :")], latex: "x^2\\geq 0\\ \\text{pour tout réel } x" };
    case "oppCarre":
      return { texte: [...debut, tx("Pars du signe d'un carré :")], latex: "x^2\\geq 0\\iff -x^2\\leq 0" };
    case "absolue":
      return { texte: [...debut, tx("Pars du signe d'une valeur absolue :")], latex: "\\left|x\\right|\\geq 0\\ \\text{pour tout réel } x" };
    case "affine":
      return { texte: [...debut, tx("Pour une affine non constante, cherche si chaque nombre "), lx("y"), tx(" a un antécédent :")], latex: "mx+p=y\\iff x=\\dfrac{y-p}{m}" };
    case "racine":
      return { texte: [...debut, tx("Une racine carrée est positive ou nulle, et elle prend toutes les valeurs positives :")], latex: "\\sqrt{x}\\geq 0\\ \\text{pour tout } x\\geq 0" };
    case "inverse":
      return { texte: [...debut, tx("Un quotient de numérateur 1 n'est jamais nul :")], latex: "\\dfrac{1}{x}\\neq 0\\ \\text{pour tout } x\\neq 0" };
  }
}

function aideImage2(g: Interieure): AideEcran {
  switch (g.famille) {
    case "carre":
    case "absolue":
    case "racine":
      return { texte: [tx("Ici, la plus petite valeur de g est atteinte en "), lx("x=0"), tx(" : calcule "), lx("g(0)"), tx(". Ensuite, g prend toutes les valeurs plus grandes (elle grandit sans limite).")] };
    case "oppCarre":
      return { texte: [tx("Ici, la plus grande valeur de g est atteinte en "), lx("x=0"), tx(" : calcule "), lx("g(0)"), tx(". Ensuite, g prend toutes les valeurs plus petites.")] };
    case "affine":
      return { texte: [tx("Ici, l'équation "), lx(`${expressionG(g)}=y`), tx(" a une solution pour n'importe quel nombre "), lx("y"), tx(".")] };
    case "inverse":
      return { texte: [tx("Ici, "), lx(`g(x)=${g.k}`), tx(" imposerait "), lx("\\dfrac{1}{x}=0"), tx(" ; toute autre valeur est atteinte.")] };
  }
}

function aideDomaine1(f: Exterieure): AideEcran {
  switch (f.famille) {
    case "racine":
    case "racineMoins":
      return { texte: [tx("Une racine carrée n'existe que pour un radicande positif ou nul (cours, § 1) :")], latex: "\\sqrt{A}\\ \\text{existe}\\iff A\\geq 0" };
    case "inverse":
      return { texte: [tx("Un dénominateur ne peut pas être nul (cours, § 1) :")], latex: "\\dfrac{1}{A}\\ \\text{existe}\\iff A\\neq 0" };
    default:
      return { texte: [tx("Racine au dénominateur : radicande positif ou nul et racine non nulle, donc radicande strictement positif (cours, § 1) :")], latex: "\\dfrac{1}{\\sqrt{A}}\\ \\text{existe}\\iff A>0" };
  }
}

export function argumentF(f: Exterieure, a = "x"): string {
  const moins = f.c === 0 ? a : f.c > 0 ? `${a}-${f.c}` : `${a}+${-f.c}`;
  const cm = f.c === 0 ? `-${a}` : `${f.c}-${a}`;
  return f.famille === "racineMoins" || f.famille === "inverseRacineMoins" ? cm : moins;
}

/** Condition de dom f sur l'argument (« x − 3 ≥ 0 »). */
export function conditionDomF(f: Exterieure, a = "x"): string {
  const s = f.famille === "inverse" ? "\\neq" : f.famille === "racine" || f.famille === "racineMoins" ? "\\geq" : ">";
  return `${argumentF(f, a)}${s}0`;
}

export function aide1(e: E, phase: PhaseDomaineParImage): AideEcran {
  switch (phase) {
    case "image":
      return aideImage1(e.g);
    case "domaine":
      return aideDomaine1(e.f);
    case "valeurs":
      return { texte: [tx("f ne peut recevoir que des nombres de son domaine : garde les valeurs de "), lx("\\operatorname{Im} g"), tx(" qui sont aussi dans "), lx("\\operatorname{dom} f"), tx(" — une intersection (dans les deux à la fois), pas une réunion. L'intersection peut être vide.")] };
    case "composee":
      return { texte: [tx("Cherche les "), lx("x"), tx(" de "), lx("\\operatorname{dom} g"), tx(" pour lesquels "), lx("g(x)"), tx(" appartient à cet ensemble : écris la condition sur "), lx("g(x)"), tx(", puis résous-la en "), lx("x"), tx(" (cours, § 3) :")], latex: `x\\in\\operatorname{dom} g\\quad\\text{et}\\quad g(x)\\in ${ensembleL(e.valeurs)}` };
  }
}

export function aide2(e: E, phase: PhaseDomaineParImage): AideEcran | null {
  switch (phase) {
    case "image":
      return aideImage2(e.g);
    case "domaine":
      return { texte: [tx("Ici, résous :")], latex: conditionDomF(e.f) };
    case "valeurs":
      return { texte: [tx("Ici, place les deux ensembles sur une même droite graduée et garde leur partie commune :")], latex: `${ensembleL(e.imG)}\\ \\cap\\ ${ensembleL(e.domF)}` };
    case "composee": {
      const t: Frag[] = [tx("Ici, résous en "), lx("x"), tx(" la condition « g(x) dans dom f » :")];
      if (e.g.famille === "racine") t.push(tx(" (avec "), lx("x\\geq 0"), tx(")"));
      if (e.g.famille === "inverse") t.push(tx(" (avec "), lx("x\\neq 0"), tx(")"));
      return { texte: t, latex: conditionDomF(e.f, `\\left(${expressionG(e.g)}\\right)`) };
    }
  }
}

export function messageIllisible(): string {
  return "Borne non reconnue : écris un nombre (3, −1/2, 0,5) ou un infini (« +inf », « -inf » ou « ∞ »). Cette saisie ne compte pas comme une tentative.";
}

// ============================================================================
// Réponses.
// ============================================================================

export function ensembleDePhase(e: E, phase: PhaseDomaineParImage) {
  return { image: e.imG, domaine: e.domF, valeurs: e.valeurs, composee: e.domaine }[phase];
}

export function reponse(e: E, phase: PhaseDomaineParImage): Frag[] {
  const nom = { image: "\\operatorname{Im} g", domaine: "\\operatorname{dom} f", valeurs: "\\operatorname{Im} g\\cap\\operatorname{dom} f", composee: "\\operatorname{dom}(f\\circ g)" }[phase];
  return [lx(`${nom}=${ensembleL(ensembleDePhase(e, phase))}`)];
}

export const recap = reponse;
