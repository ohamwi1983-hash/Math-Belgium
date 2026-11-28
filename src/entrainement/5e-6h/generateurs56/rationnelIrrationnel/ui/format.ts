import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { AideEcran, Frag, OptionEcran } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { NOMS_NOMBRES, PHASES_RATIONNEL } from "../core/types";
import type { EnsembleNb, ExerciceRationnel, FamilleNombre, NombreClasse, PhaseRationnel } from "../core/types";

/**
 * Couche C — textes de `56gen14` « Rationnel ou irrationnel ? » : consignes, options (ordre FIXE ℕ,
 * ℤ, ℚ, ℝ∖ℚ), aides à deux niveaux (propriété du cours, puis posée pour le nombre ; jamais la
 * réponse), réponses. Source unique de l'écran, du récapitulatif, du corrigé et du papier.
 */

type E = ExerciceRationnel;
type P = PhaseRationnel;

export const phases = (_e: E): P[] => PHASES_RATIONNEL;
export const indexDe = (p: P): number => PHASES_RATIONNEL.indexOf(p);
export const nombreDe = (e: E, p: P): NombreClasse => e.nombres[indexDe(p)];
export const nomDe = (p: P): string => NOMS_NOMBRES[indexDe(p)];

export const ENSEMBLE_L: Record<EnsembleNb, string> = { N: "\\mathbb{N}", Z: "\\mathbb{Z}", Q: "\\mathbb{Q}", I: "\\mathbb{R}\\setminus\\mathbb{Q}" };
export const ENSEMBLE_TEXTE: Record<EnsembleNb, string> = { N: "ℕ", Z: "ℤ", Q: "ℚ", I: "ℝ∖ℚ" };
const ENSEMBLE_NOM: Record<EnsembleNb, string> = { N: " (naturels)", Z: " (entiers)", Q: " (rationnels)", I: " (irrationnels)" };

/** « A = \sqrt{12} ». */
export const nombreNommeL = (e: E, p: P): string => `${nomDe(p)}=${nombreDe(e, p).latex}`;

export function consigneGenerale(e: E): Frag[] {
  const f: Frag[] = [tx("Pour chaque nombre, trouve le plus petit des ensembles "), lx("\\mathbb{N}"), tx(", "), lx("\\mathbb{Z}"), tx(", "), lx("\\mathbb{Q}"), tx(" et "), lx("\\mathbb{R}\\setminus\\mathbb{Q}"), tx(" (les irrationnels) qui le contient, en le simplifiant d'abord : ")];
  PHASES_RATIONNEL.forEach((p, i) => {
    f.push(lx(nombreNommeL(e, p)));
    f.push(tx(i < 3 ? " ; " : "."));
  });
  return f;
}

export function libelle(_e: E, p: P): string {
  return `Nombre ${nomDe(p)}`;
}

export function consigne(e: E, p: P): Frag[] {
  return [tx("Quel est le plus petit ensemble qui contient "), lx(nombreNommeL(e, p)), tx(" ?")];
}

export function options(): OptionEcran[] {
  return (["N", "Z", "Q", "I"] as EnsembleNb[]).map((id) => ({ id, fragments: [lx(ENSEMBLE_L[id]), tx(ENSEMBLE_NOM[id])] }));
}

const AIDE1: Record<FamilleNombre, AideEcran> = {
  racines: {
    texte: [tx("Pour un naturel n, "), lx("\\sqrt{n}"), tx(" est un naturel si n est un carré parfait, sinon il est irrationnel ; de même pour "), lx("\\sqrt[3]{n}"), tx(" et les cubes parfaits (cours, point 1). Simplifie avant de conclure, et souviens-toi que les ensembles sont emboîtés :")],
    latex: "\\mathbb{N}\\subset\\mathbb{Z}\\subset\\mathbb{Q}\\subset\\mathbb{R}",
  },
  ecritures: {
    texte: [tx("Un rationnel a une écriture décimale limitée ou périodique ; un irrationnel a une écriture illimitée non périodique (cours, point 2). Une fraction peut être égale à un entier. Les ensembles sont emboîtés :")],
    latex: "\\mathbb{N}\\subset\\mathbb{Z}\\subset\\mathbb{Q}\\subset\\mathbb{R}",
  },
  expressions: {
    texte: [tx("Développe ou simplifie l'expression. Si le résultat s'écrit "), lx("a+b\\sqrt{r}"), tx(" avec a, b rationnels, "), lx("b\\neq 0"), tx(" et r naturel qui n'est pas un carré parfait, il est irrationnel (cours, point 1) :")],
    latex: "a+b\\sqrt{r}=q\\ \\Rightarrow\\ \\sqrt{r}=\\dfrac{q-a}{b}",
  },
  constantes: {
    texte: [tx("Remplace les valeurs remarquables par leurs valeurs exactes ("), lx("\\cos 60^\\circ=\\dfrac{1}{2}"), tx(", "), lx("\\cos 30^\\circ=\\dfrac{\\sqrt{3}}{2}"), tx("…) ; "), lx("\\pi"), tx(" et "), lx("\\Phi"), tx(" sont irrationnels, et "), lx("\\Phi^{2}=\\Phi+1"), tx(" (cours, point 1).")],
  },
};

export function aide1(e: E, p: P): AideEcran {
  return AIDE1[nombreDe(e, p).famille];
}

export function aide2(e: E, p: P): AideEcran {
  return { texte: nombreDe(e, p).aide2 };
}

export function messageIllisible(): string {
  return "Choisis un des quatre ensembles. Cette saisie ne compte pas comme une tentative.";
}

/** « A = 2\sqrt{3} \in ℝ∖ℚ ». */
export function reponse(e: E, p: P): Frag[] {
  const n = nombreDe(e, p);
  const simplifie = n.valeurL !== "x" && n.valeurL !== n.latex ? `=${n.valeurL}` : "";
  return [lx(`${nombreNommeL(e, p)}${simplifie}\\in ${ENSEMBLE_L[n.ensemble]}`)];
}

export const recap = reponse;

export function explication(e: E, p: P): string {
  const n = nombreDe(e, p);
  return `Le plus petit ensemble est ${ENSEMBLE_TEXTE[n.ensemble]}.`;
}
