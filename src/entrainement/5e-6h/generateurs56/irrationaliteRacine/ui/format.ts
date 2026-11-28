import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { AideEcran, Frag, ModeEcran, OptionEcran } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { decompositionL, racineSymbole } from "../../communReels/outilsReels";
import { PHASES_IRRATIONALITE } from "../core/types";
import type { ExerciceIrrationalite, PhaseIrrationalite } from "../core/types";

/**
 * Couche C — textes de `56gen15` « Démontrer qu'un nombre est irrationnel » : consignes, options
 * (textes FIXES, identiques dans les deux verdicts), aides à deux niveaux (propriété du cours, puis
 * posée pour N ; jamais la réponse), réponses. Source unique de l'écran, du corrigé et du papier.
 */

type E = ExerciceIrrationalite;
type P = PhaseIrrationalite;

export const phases = (_e: E): P[] => PHASES_IRRATIONALITE;

/** « \sqrt{72} », « \sqrt[3]{54} ». */
export const racineNL = (e: E): string => racineSymbole(e.k, `${e.N}`);
/** « carré » / « cube ». */
const puissanceMot = (e: E) => (e.k === 2 ? "carré" : "cube");
const pairMot = (e: E) => (e.k === 2 ? "pair" : "multiple de 3");
const pairsMot = (e: E) => (e.k === 2 ? "pairs" : "multiples de 3");
const impairMot = (e: E) => (e.k === 2 ? "impair" : "qui n'est pas un multiple de 3");
export const mkL = (e: E) => `m^{${e.k}}`;
export const nkL = (e: E) => `n^{${e.k}}`;

export function consigneGenerale(e: E): Frag[] {
  return [tx("Le nombre "), lx(racineNL(e)), tx(" est-il rationnel ? Raisonne comme dans la démonstration du cours : suppose qu'il s'écrit comme une fraction, élève à la puissance "), lx(`${e.k}`), tx(" et compare les exposants des facteurs premiers.")];
}

export function libelle(_e: E, p: P): string {
  return { hypothese: "Hypothèse", elever: "Égalité entre naturels", facteurs: "Facteurs premiers", exposants: "Exposants", conclusion: "Conclusion" }[p];
}

export function consigne(e: E, p: P): Frag[] {
  switch (p) {
    case "hypothese":
      return [tx("Quelle hypothèse pose-t-on au départ ?")];
    case "elever":
      return [tx("On élève les deux membres au "), tx(puissanceMot(e)), tx(", puis on chasse le dénominateur. Complète l'égalité entre naturels : "), lx(`${mkL(e)}=\\ ?\\cdot ${nkL(e)}`), tx(".")];
    case "facteurs":
      return [tx("Décompose "), lx(`${e.N}`), tx(" en facteurs premiers.")];
    case "exposants":
      return [tx("Dans "), lx(mkL(e)), tx(", chaque exposant est "), tx(e.k === 2 ? "pair (le double de celui de m)" : "un multiple de 3 (le triple de celui de m)"), tx(". Que peut-on dire des exposants dans "), lx(`${e.N}\\cdot ${nkL(e)}`), tx(" ?")];
    case "conclusion":
      return [tx("Que peut-on conclure sur "), lx(racineNL(e)), tx(" ?")];
  }
}

export const IDS_OPTIONS = ["A", "B", "C", "D"] as const;

export function options(e: E, p: P): OptionEcran[] {
  const r = racineNL(e);
  switch (p) {
    case "hypothese":
      return [
        { id: "A", fragments: [lx(`${r}=\\dfrac{m}{n}`), tx(", avec m et n naturels non nuls")] },
        { id: "B", fragments: [lx(r), tx(" n'est pas une fraction")] },
        { id: "C", fragments: [lx(`${r}=\\dfrac{m}{n}`), tx(", avec m et n pairs")] },
        { id: "D", fragments: [lx(r), tx(" est un naturel")] },
      ];
    case "exposants":
      return [
        { id: "A", fragments: [tx(`Chaque facteur premier a un exposant ${pairMot(e)} dans `), lx(`${e.N}\\cdot ${nkL(e)}`), tx(", comme dans "), lx(mkL(e))] },
        { id: "B", fragments: [tx(`Au moins un facteur premier a un exposant ${impairMot(e)} dans `), lx(`${e.N}\\cdot ${nkL(e)}`), tx(` ; dans `), lx(mkL(e)), tx(`, son exposant est ${pairMot(e)}`)] },
        { id: "C", fragments: [tx("Les exposants de "), lx(`${e.N}\\cdot ${nkL(e)}`), tx(" dépendent de n : on ne peut rien en dire")] },
        { id: "D", fragments: [tx(`Tous les exposants de `), lx(`${e.N}\\cdot ${nkL(e)}`), tx(e.k === 2 ? " sont impairs" : " sont des multiples de 3 plus 1")] },
      ];
    default:
      return [
        { id: "A", fragments: [tx("Contradiction : "), lx(r), tx(" n'est pas rationnel, il est irrationnel")] },
        { id: "B", fragments: [tx("Aucune contradiction : "), lx(r), tx(" est un naturel")] },
        { id: "C", fragments: [lx(r), tx(" est un rationnel qui n'est pas entier")] },
        { id: "D", fragments: [tx("On ne peut pas conclure")] },
      ];
  }
}

export function bonneOptionId(e: E, p: P): string {
  if (p === "hypothese") return "A";
  if (p === "exposants") return e.verdict === "naturel" ? "A" : "B";
  return e.verdict === "irrationnel" ? "A" : "B";
}

export const estChoix = (_e: E, p: P): boolean => p === "hypothese" || p === "exposants" || p === "conclusion";

export function mode(e: E, p: P): ModeEcran {
  if (p === "elever") return { type: "champs", champs: [{ label: `Nombre qui multiplie n${e.k === 2 ? "²" : "³"}`, labelLatex: `${mkL(e)}=\\ ?\\cdot ${nkL(e)}\\qquad ?=`, placeholder: "un naturel" }] };
  if (p === "facteurs")
    return {
      type: "champs",
      champs: [{ label: `Décomposition de ${e.N}`, labelLatex: `${e.N}=`, placeholder: "ex. : 2³ · 3²", apercuLatex: apercuDecomposition, raccourcis: RACCOURCIS_DECOMPOSITION }],
    };
  return { type: "choix", options: options(e, p) };
}

/** Boutons qui AJOUTENT « · » ou un exposant en fin de champ (jamais de « ^ » visible). */
export const RACCOURCIS_DECOMPOSITION = [{ libelle: "·", texte: " · " }, ..."²³⁴⁵⁶⁷⁸⁹".split("").map((c) => ({ libelle: c, texte: c }))];

/** Aperçu KaTeX de la décomposition saisie (rien si illisible). */
export function apercuDecomposition(texte: string): string | null {
  const s = texte.trim();
  if (!s) return null;
  const morceaux = s.replace(/^[^=]*=/, "").split(/\s*(?:[·*×xX.∙•⋅])\s*|\s+/).filter((m) => m !== "");
  if (morceaux.length === 0 || !morceaux.every((m) => /^\d+(\^\d+|[⁰¹²³⁴⁵⁶⁷⁸⁹]+)?$/.test(m))) return null;
  const sup: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };
  return morceaux.map((m) => m.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/, (x) => `^{${[...x].map((c) => sup[c]).join("")}}`).replace(/\^(\d+)/, "^{$1}")).join("\\cdot ");
}

export function aide1(e: E, p: P): AideEcran {
  switch (p) {
    case "hypothese":
      return { texte: [tx("Pour décider si un nombre est rationnel, on suppose qu'il est égal à une fraction de deux naturels non nuls, puis on regarde si cette hypothèse mène à une contradiction (cours, point 1).")] };
    case "elever":
      return { texte: [tx(`Le ${puissanceMot(e)} d'une racine ${e.k === 2 ? "carrée" : "cubique"} redonne le nombre sous la racine, et une fraction s'élève numérateur et dénominateur :`)], latex: `\\left(\\dfrac{m}{n}\\right)^{${e.k}}=\\dfrac{${mkL(e)}}{${nkL(e)}}` };
    case "facteurs":
      return { texte: [tx("Divise par 2 tant que c'est possible, puis par 3, par 5, par 7… ; regroupe les facteurs égaux en puissances. Chaque facteur doit être premier.")] };
    case "exposants":
      return { texte: [tx(`Un naturel n'a qu'une seule décomposition en facteurs premiers. Dans ${e.N}·n${e.k === 2 ? "²" : "³"}, l'exposant d'un premier p est la somme de son exposant dans ${e.N} et de son exposant dans n${e.k === 2 ? "²" : "³"}, qui est ${pairMot(e)} (cours, point 1).`)] };
    case "conclusion":
      return { texte: [tx("Si les deux membres de l'égalité ne peuvent pas avoir la même décomposition, l'hypothèse est fausse. Si au contraire ils le peuvent, cherche une valeur exacte de la racine.")] };
  }
}

export function aide2(e: E, p: P): AideEcran {
  switch (p) {
    case "hypothese":
      return { texte: [tx("Ici, écris "), lx(racineNL(e)), tx(" comme une fraction dont tu ne connais ni le numérateur ni le dénominateur.")] };
    case "elever":
      return { texte: [tx("Ici, de "), lx(`${racineNL(e)}=\\dfrac{m}{n}`), tx(" tu tires "), lx(`${e.N}=\\dfrac{${mkL(e)}}{${nkL(e)}}`), tx(" ; multiplie par "), lx(nkL(e)), tx(".")] };
    case "facteurs": {
      const p0 = e.facteurs[0][0];
      return { texte: [tx("Ici, "), lx(`${e.N}`), tx(" est divisible par "), lx(`${p0}`), tx(" : commence par "), lx(`${e.N}=${p0}\\cdot ${e.N / p0}`), tx(", puis décompose "), lx(`${e.N / p0}`), tx(".")] };
    }
    case "exposants":
      return { texte: [tx("Ici, regarde les exposants de ta décomposition "), lx(`${e.N}=${decompositionL(e.facteurs)}`), tx(` : sont-ils tous ${pairsMot(e)} ?`)] };
    case "conclusion":
      return { texte: [tx("Ici, reprends la réponse de l'écran précédent : les exposants des deux membres peuvent-ils être tous les mêmes ?")] };
  }
}

export function messageIllisible(_e: E, p: P): string {
  if (p === "elever") return "Écris un naturel (sans racine ni lettre). Cette saisie ne compte pas comme une tentative.";
  if (p === "facteurs") return "Écris un produit de nombres, par exemple 2³ · 3² ou 2 · 2 · 2 · 3 · 3. Cette saisie ne compte pas comme une tentative.";
  return "Choisis une des propositions. Cette saisie ne compte pas comme une tentative.";
}

export function reponse(e: E, p: P): Frag[] {
  const r = racineNL(e);
  switch (p) {
    case "hypothese":
      return [lx(`${r}=\\dfrac{m}{n}`), tx(", avec m et n naturels non nuls")];
    case "elever":
      return [lx(`${mkL(e)}=${e.N}\\cdot ${nkL(e)}`)];
    case "facteurs":
      return [lx(`${e.N}=${decompositionL(e.facteurs)}`)];
    case "exposants":
      return e.verdict === "naturel"
        ? [tx(`Tous les exposants de ${e.N} sont ${pairsMot(e)} : ceux de `), lx(`${e.N}\\cdot ${nkL(e)}`), tx(" aussi, comme dans "), lx(mkL(e))]
        : [tx("L'exposant de "), lx(`${e.premierTemoin}`), tx(` est ${impairMot(e)} dans `), lx(`${e.N}\\cdot ${nkL(e)}`), tx(` et ${pairMot(e)} dans `), lx(mkL(e))];
    case "conclusion":
      return e.verdict === "naturel" ? [lx(`${r}=${e.racine}`), tx(" : c'est un naturel, aucune contradiction")] : [tx("Contradiction : "), lx(r), tx(" est irrationnel")];
  }
}

export const recap = reponse;

export function explication(e: E, p: P): string {
  if (p === "hypothese") return "On suppose que le nombre est une fraction de deux naturels non nuls, puis on cherche une contradiction.";
  if (p === "exposants") return e.verdict === "naturel" ? `Tous les exposants de ${e.N} sont ${pairsMot(e)}.` : `L'exposant de ${e.premierTemoin} dans ${e.N} n'est pas ${pairMot(e)}.`;
  return e.verdict === "naturel" ? `${e.N} est un ${puissanceMot(e)} parfait : la racine vaut ${e.racine}.` : "Les deux membres auraient deux décompositions différentes : c'est impossible.";
}
