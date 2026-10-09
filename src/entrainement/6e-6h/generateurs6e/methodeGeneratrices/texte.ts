import type { OptionRestrictionLieu } from "../../core6e/methodeGeneratrices.types";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — petits utilitaires de FORMATAGE texte partagés par les 5 familles de `6gen57`
 * (fraction irréductible — convention transversale CLAUDE.md — et construction mélangée des options
 * de restriction de l'écran 5). Toujours des chaînes déjà résolues à la génération, jamais
 * recalculées côté Couche B (voir en-tête `core6e/methodeGeneratrices.types.ts`).
 */

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

/** `num/den` en fraction irréductible, texte simple (jamais de décimal) — ex. `fractionTexte(6,2)`
 * = "3", `fractionTexte(7,2)` = "7/2", `fractionTexte(-7,2)` = "-7/2". */
export function fractionTexte(num: number, den: number): string {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = pgcd(Math.abs(num), den) || 1;
  const n = num / g;
  const d = den / g;
  return d === 1 ? `${n}` : `${n}/${d}`;
}

/** Mélange (Fisher-Yates léger, via `tirerParmi` répété n'aurait pas garanti l'unicité — tri par clé
 * aléatoire suffit ici, la liste ne comporte que 4 éléments). */
function melanger<T>(items: T[]): T[] {
  return items.map((v) => ({ v, cle: Math.random() })).sort((a, b) => a.cle - b.cle).map((x) => x.v);
}

/** Construit les options de restriction de l'écran 5 (1 correcte + distracteurs), MÉLANGÉES —
 * jamais la correcte systématiquement en première position (biais de sélection à éviter). */
export function construireOptionsRestriction(labelCorrect: string, distracteurs: string[]): { options: OptionRestrictionLieu[]; idCorrecte: string } {
  const bruts = [{ id: "correcte", label: labelCorrect }, ...distracteurs.map((label, i) => ({ id: `distracteur${i + 1}`, label }))];
  return { options: melanger(bruts), idCorrecte: "correcte" };
}

export { tirerParmi };
