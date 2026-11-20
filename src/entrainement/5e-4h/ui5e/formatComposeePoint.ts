import type { ExerciceComposeePoint, FonctionExterieure, FonctionInterieure, RacineReduite } from "../core5e/composeePoint";
import { domaineExt, nomExt, nomInt, radicande, valeurExacte } from "../core5e/composeePoint";
import { ensembleL } from "../moteur5e/ensemblesReels";
import type { AideEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";

/**
 * Couche C — textes de `5gen60` « Composée en un point » : écritures des fonctions, consignes,
 * options, aides à deux niveaux, réponses. Source unique de l'écran, du récapitulatif, du corrigé et
 * du papier.
 */

type E = ExerciceComposeePoint;
export type PhaseComposeePoint = "inter" | "existence" | "valeur";

export function phases(e: E): PhaseComposeePoint[] {
  return e.existe ? ["inter", "existence", "valeur"] : ["inter", "existence"];
}

// ============================================================================
// Écritures.
// ============================================================================

/** Nombre substitué : parenthèses s'il est négatif. */
export const parN = (v: number): string => (v < 0 ? `(${v})` : `${v}`);
/** « + 3 », « − 3 », rien pour 0. */
const plusN = (v: number): string => (v === 0 ? "" : v > 0 ? `+${v}` : `${v}`);

/** k·arg (arg = « x » ou un nombre substitué). */
function produit(k: number, arg: string, x: boolean): string {
  if (k === 1) return arg;
  if (k === -1) return x ? `-${arg}` : `-1\\times ${arg}`;
  return x ? `${k}${arg}` : `${k}\\times ${arg}`;
}

/** Radicande (ou dénominateur) de la fonction extérieure écrit en `arg`. */
export function radicandeL(ext: FonctionExterieure, arg: string, x = arg === "x"): string {
  if (ext.genre === "inverse") return `${arg}${plusN(-ext.p)}`;
  if (ext.genre === "racine" && ext.s === 1) return `${produit(ext.k, arg, x)}${plusN(-ext.k * ext.p)}`;
  if (ext.s === 1) return `${arg}${plusN(-ext.p)}`;
  return ext.p === 0 ? `-${arg}` : `${ext.p}-${arg}`;
}

/** Expression de la fonction extérieure en `arg`. */
export function extL(ext: FonctionExterieure, arg: string): string {
  const r = radicandeL(ext, arg);
  if (ext.genre === "racine") return `\\sqrt{${r}}`;
  const signe = ext.c < 0 ? "-" : "";
  const c = Math.abs(ext.c);
  if (ext.genre === "inverse") return `${signe}\\dfrac{${c}}{${r}}`;
  return `${signe}\\dfrac{${c}}{\\sqrt{${r}}}`;
}

/** Expression de la fonction intérieure en `arg`. */
export function intL(f: FonctionInterieure, arg: string): string {
  const x = arg === "x";
  switch (f.genre) {
    case "affine":
      return `${produit(f.m, arg, x)}${plusN(f.b)}`;
    case "carre":
      return `${f.s === -1 ? "-" : ""}${arg}^2${plusN(f.b)}`;
    case "abs":
      return `\\left|${arg}${plusN(-f.p)}\\right|${plusN(f.b)}`;
    case "racine":
      return `\\sqrt{${arg}${plusN(f.p)}}`;
  }
}

export const fL = (e: E): string => (e.ordre === "fg" ? extL(e.ext, "x") : intL(e.int, "x"));
export const gL = (e: E): string => (e.ordre === "fg" ? intL(e.int, "x") : extL(e.ext, "x"));
/** « (f\circ g)(-2) ». */
export const composeeL = (e: E): string => `(${nomExt(e)}\\circ ${nomInt(e)})(${e.a})`;

export function valeurReduiteL(v: RacineReduite): string {
  const s = v.num < 0 ? "-" : "";
  const n = Math.abs(v.num);
  const haut = v.rad === 1 ? `${n}` : `${n === 1 ? "" : n}\\sqrt{${v.rad}}`;
  return v.den === 1 ? `${s}${haut}` : `${s}\\dfrac{${haut}}{${v.den}}`;
}

export function valeurL(e: E): string {
  const v = valeurExacte(e);
  return v ? valeurReduiteL(v) : "";
}

/** Condition d'existence de la fonction extérieure, écrite en x. */
export function conditionL(e: E): string {
  const r = radicandeL(e.ext, "x");
  if (e.ext.genre === "racine") return `${r}\\geq 0`;
  if (e.ext.genre === "inverse") return `${r}\\neq 0`;
  return `${r}>0`;
}

export const domaineExtL = (e: E): string => `\\operatorname{dom}${nomExt(e)}=${ensembleL(domaineExt(e.ext))}`;

// ============================================================================
// Écrans.
// ============================================================================

export const LIBELLES: Record<PhaseComposeePoint, string> = { inter: "Valeur intermédiaire", existence: "Existence", valeur: "Valeur de la composée" };

export function libelle(_e: E, p: PhaseComposeePoint): string {
  return LIBELLES[p];
}

export function consigneGenerale(e: E): Frag[] {
  return [tx("Soient "), lx(`f(x)=${fL(e)}`), tx(" et "), lx(`g(x)=${gL(e)}`), tx(". On veut calculer "), lx(composeeL(e)), tx(", ou montrer que ce nombre n'existe pas.")];
}

export function consigne(e: E, p: PhaseComposeePoint): Frag[] {
  if (p === "inter") return [tx("Pour calculer "), lx(composeeL(e)), tx(", quelle fonction s'applique en premier ? Calcule son image de "), lx(`${e.a}`), tx(".")];
  if (p === "existence") return [tx("La valeur intermédiaire "), lx(`${e.m}`), tx(" appartient-elle au domaine de "), lx(nomExt(e)), tx(" ? Conclus.")];
  return [tx("Calcule la valeur exacte de "), lx(composeeL(e)), tx(".")];
}

export const SYMBOLES_FONCTION = [
  { id: "f", latex: "f" },
  { id: "g", latex: "g" },
];

export function optionsExistence(e: E): OptionEcran[] {
  return [
    { id: "existe", fragments: [lx(composeeL(e)), tx(" existe")] },
    { id: "nexistepas", fragments: [lx(composeeL(e)), tx(" n'existe pas")] },
  ];
}

export function aide1(e: E, p: PhaseComposeePoint): AideEcran {
  const ex = nomExt(e);
  const it = nomInt(e);
  if (p === "inter") return { texte: [tx("Une composée se lit de droite à gauche : la fonction écrite à droite du rond reçoit le nombre en premier :")], latex: `(${ex}\\circ ${it})(a)=${ex}\\big(${it}(a)\\big)` };
  if (p === "existence") return { texte: [tx("La composée existe seulement si la valeur intermédiaire est acceptée par la seconde fonction :")], latex: `${composeeL(e)}\\text{ existe}\\iff ${it}(${e.a})\\in\\operatorname{dom}${ex}` };
  return { texte: [tx("Applique la seconde fonction à la valeur intermédiaire : remplace x par "), lx(`${e.m}`), tx(" dans "), lx(`${ex}(x)`), tx(".")] };
}

export function aide2(e: E, p: PhaseComposeePoint): AideEcran | null {
  const it = nomInt(e);
  if (p === "inter") return { texte: [tx("Remplace x par "), lx(`${e.a}`), tx(" dans "), lx(`${it}(x)`), tx(", entre parenthèses :")], latex: `${it}(${e.a})=${intL(e.int, parN(e.a))}` };
  if (p === "existence") {
    const debut = e.ext.genre === "racine" ? "Sous une racine carrée, le nombre doit être positif ou nul :" : e.ext.genre === "inverse" ? "Un dénominateur ne peut pas être nul :" : "Une racine au dénominateur : le nombre sous la racine doit être strictement positif (√0 = 0 est interdit au dénominateur) :";
    return { texte: [tx(`${debut} vérifie la condition pour x = `), lx(`${e.m}`), tx(".")], latex: conditionL(e) };
  }
  // Niveau 2 de l'écran « valeur » : la règle de simplification de la forme obtenue, jamais la
  // substitution (avec √x ou c/x, la substitution est déjà la réponse).
  if (e.ext.genre === "racineDen") return { texte: [tx("Calcule le nombre sous la racine ; si sa racine ne tombe pas juste, multiplie le numérateur et le dénominateur par cette racine :")], latex: "\\dfrac{c}{\\sqrt{n}}=\\dfrac{c\\sqrt{n}}{n}" };
  if (e.ext.genre === "inverse") return { texte: [tx("Calcule le dénominateur, puis simplifie la fraction par un diviseur commun :")], latex: "\\dfrac{k\\times a}{k\\times b}=\\dfrac{a}{b}" };
  return { texte: [tx("Calcule le nombre sous la racine, puis sors-en un carré parfait s'il y en a un :")], latex: "\\sqrt{a^2\\times b}=a\\sqrt{b}" };
}

export function reponse(e: E, p: PhaseComposeePoint): Frag[] {
  if (p === "inter") return [tx("On applique d'abord "), lx(nomInt(e)), tx(" : "), lx(`${nomInt(e)}(${e.a})=${e.m}`)];
  if (p === "existence")
    return e.existe
      ? [lx(`${e.m}\\in\\operatorname{dom}${nomExt(e)}`), tx(" : "), lx(composeeL(e)), tx(" existe.")]
      : [lx(`${e.m}\\notin\\operatorname{dom}${nomExt(e)}`), tx(" : "), lx(composeeL(e)), tx(" n'existe pas.")];
  return [lx(`${composeeL(e)}=${valeurL(e)}`)];
}

export const recap = reponse;

export function messageIllisible(_e: E, p: PhaseComposeePoint): string {
  void p;
  return "Nombre non reconnu : écris un nombre exact, par exemple −3, 7/2, √5 ou 2√3/3. Cette saisie ne compte pas comme une tentative.";
}

export const MESSAGE_APPROCHEE = "C'est une valeur approchée : donne la valeur exacte (fraction ou racine, par exemple 2/3 ou √5). Cette saisie ne compte pas comme une tentative.";

/** Radicande (ou dénominateur) en m, écrit avec la substitution. */
export function radicandeSubstitueL(e: E): string {
  return radicandeL(e.ext, parN(e.m), false);
}

export function valeurRadicande(e: E): number {
  return radicande(e.ext, e.m);
}
