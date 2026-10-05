import type { Enonce, Symbole } from "../core/inequation.types";
import { formatMembreGauche } from "./formatEquation";

export const SYMBOLE_LATEX: Record<Symbole, string> = {
  "<": "<",
  ">": ">",
  "≤": "\\leq",
  "≥": "\\geq",
};

/** ax²+bx+c ◇ 0 en LaTeX, réutilise le membre gauche de formatEquation.ts. */
export function formatInequationLatex(enonce: Enonce, symbole: Symbole): string {
  return `${formatMembreGauche(enonce)} ${SYMBOLE_LATEX[symbole]} 0`;
}

/**
 * L'équation associée à l'inéquation (ax²+bx+c=0, jamais ◇0) — prompt-generateurs123groupe.md,
 * générateur 2, point 1 : affichée sous la question "Combien cette équation a-t-elle de
 * solutions ?", pour que l'élève voie explicitement l'équation dont il dénombre les solutions,
 * distincte de l'inéquation de l'énoncé (déjà affichée juste au-dessus).
 */
export function formatEquationAssocieeLatex(enonce: Enonce): string {
  return `${formatMembreGauche(enonce)} = 0`;
}
