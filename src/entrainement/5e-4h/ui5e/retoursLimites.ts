/**
 * Messages communs des générateurs 5gen20–5gen24 (5e ch. 4, lots B–D — règles communes, modèle du
 * 5e ch. 1) : saisie illisible ou approchée, par nature de champ. Chaque message se termine par
 * « Cette saisie ne compte pas comme une tentative. » — le moteur refuse aussi la saisie (état
 * inchangé).
 */
import type { FragmentConsigne } from "../../export/genererFeuilleExercices";

const FIN = " Cette saisie ne compte pas comme une tentative.";

export type ChampLimites = "nombre" | "limite" | "expression" | "facteurs" | "monome" | "droite" | "liste" | "point" | "approchee" | "arrondi";

export const MESSAGES_ILLISIBLE_LIMITES: Record<ChampLimites, string> = {
  nombre: "Nombre non reconnu : écris un nombre exact, par exemple −3, 7/2 ou 2,5." + FIN,
  limite: "Limite non reconnue : écris un nombre (par exemple −3 ou 7/2), +∞ ou −∞ (« +inf », « -inf » sont acceptés)." + FIN,
  expression: "Expression non reconnue : vérifie les parenthèses, les signes et la place de x." + FIN,
  facteurs: "Un facteur n'est pas reconnu : écris chaque facteur, par exemple 2, (x − 3) ou (x + 5)." + FIN,
  monome: "Terme non reconnu : écris un nombre suivi de x et de son exposant, par exemple −3x^2 (ou −3x²)." + FIN,
  droite: "Équation non reconnue : écris l'expression de la droite, par exemple 2x − 3 (le « y = » est facultatif)." + FIN,
  liste: "Valeur non reconnue : écris chaque nombre, séparés par « ; », par exemple −2 ; 3." + FIN,
  point: "Coordonnées non reconnues : écris l'abscisse et l'ordonnée, chacune comme un nombre exact (par exemple −2 et 7/3), ou choisis « Aucun point commun »." + FIN,
  approchee: "C'est une valeur approchée : on demande la valeur exacte (entier ou fraction, par exemple 13/7)." + FIN,
  arrondi: "Nombre non reconnu : écris un nombre décimal, par exemple 412 ou 52,47 (virgule ou point)." + FIN,
};

export const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
export const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

/** Texte « riche » (`$…$` = KaTeX) → fragments. */
export function fragmentsRiches(texte: string): FragmentConsigne[] {
  return texte
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? l(morceau) : t(morceau)))
    .filter((f) => f.valeur !== "");
}
