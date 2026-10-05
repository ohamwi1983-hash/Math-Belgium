/**
 * Cycle des cellules de l'écran "Valeurs exactes" (générateur 15, "Valeurs remarquables",
 * `promptcreationgenerateur15.md`) — même principe que `cycleSigneCercleTrigonometrique.ts`
 * (générateur 14, écran "Signes") : le cycle BOUCLE jusqu'à `"?"` (jamais un état de départ à sens
 * unique), mais le domaine de valeurs est bien plus riche ici (magnitude ET signe combinés dans une
 * seule cellule, pas seulement un signe). Rendu en notation mathématique (racines avec `√`, jamais
 * une notation texte type `sqrt`) via `formatCelluleSinCosLatex`/`formatCelluleTanLatex`.
 */
import type { CelluleSinCos, CelluleTan, ValeurSinCos, ValeurTan } from "../core/valeursRemarquables.types";

const ORDRE_SIN_COS: CelluleSinCos[] = ["?", "0", "1/2", "-1/2", "rac2/2", "-rac2/2", "rac3/2", "-rac3/2", "1", "-1"];
const ORDRE_TAN: CelluleTan[] = ["?", "0", "rac3/3", "-rac3/3", "1", "-1", "rac3", "-rac3", "indefini"];

export function cyclerValeurSinCos(actuel: CelluleSinCos): CelluleSinCos {
  const index = ORDRE_SIN_COS.indexOf(actuel);
  return ORDRE_SIN_COS[(index + 1) % ORDRE_SIN_COS.length];
}

export function cyclerValeurTan(actuel: CelluleTan): CelluleTan {
  const index = ORDRE_TAN.indexOf(actuel);
  return ORDRE_TAN[(index + 1) % ORDRE_TAN.length];
}

const LATEX_VALEUR_SIN_COS: Record<ValeurSinCos, string> = {
  "0": "0",
  "1/2": "\\frac{1}{2}",
  "-1/2": "-\\frac{1}{2}",
  "rac2/2": "\\frac{\\sqrt{2}}{2}",
  "-rac2/2": "-\\frac{\\sqrt{2}}{2}",
  "rac3/2": "\\frac{\\sqrt{3}}{2}",
  "-rac3/2": "-\\frac{\\sqrt{3}}{2}",
  "1": "1",
  "-1": "-1",
};

const LATEX_VALEUR_TAN: Record<ValeurTan, string> = {
  "0": "0",
  "rac3/3": "\\frac{\\sqrt{3}}{3}",
  "-rac3/3": "-\\frac{\\sqrt{3}}{3}",
  "1": "1",
  "-1": "-1",
  "rac3": "\\sqrt{3}",
  "-rac3": "-\\sqrt{3}",
  indefini: "\\nexists",
};

export function formatCelluleSinCosLatex(valeur: CelluleSinCos): string {
  return valeur === "?" ? "?" : LATEX_VALEUR_SIN_COS[valeur];
}

export function formatCelluleTanLatex(valeur: CelluleTan): string {
  return valeur === "?" ? "?" : LATEX_VALEUR_TAN[valeur];
}

/** Valeur numérique exacte de chaque cellule — utilisée uniquement pour le marquage rouge en
 * direct (jamais pour la vérification qui clôt l'étape, propre à `moteur/verificationValeursRemarquables.ts`
 * — petite table dupliquée là-bas plutôt qu'importée, `src/moteur/` n'important jamais `src/ui/`). */
const VALEUR_NUMERIQUE_SIN_COS: Record<ValeurSinCos, number> = {
  "0": 0,
  "1/2": 0.5,
  "-1/2": -0.5,
  "rac2/2": Math.SQRT2 / 2,
  "-rac2/2": -Math.SQRT2 / 2,
  "rac3/2": Math.sqrt(3) / 2,
  "-rac3/2": -Math.sqrt(3) / 2,
  "1": 1,
  "-1": -1,
};

const VALEUR_NUMERIQUE_TAN: Record<Exclude<ValeurTan, "indefini">, number> = {
  "0": 0,
  "rac3/3": 1 / Math.sqrt(3),
  "-rac3/3": -1 / Math.sqrt(3),
  "1": 1,
  "-1": -1,
  rac3: Math.sqrt(3),
  "-rac3": -Math.sqrt(3),
};

const TOLERANCE = 1e-6;

/** Marquage rouge en direct après un échec — même principe que `celluleSigneErronee` (générateur
 * 14) : une cellule encore à `"?"` n'est jamais marquée erronée. */
export function celluleSinCosErronee(saisie: CelluleSinCos, attendu: number): boolean {
  if (saisie === "?") return false;
  return Math.abs(VALEUR_NUMERIQUE_SIN_COS[saisie] - attendu) > TOLERANCE;
}

export function celluleTanErronee(saisie: CelluleTan, attendu: number | null): boolean {
  if (saisie === "?") return false;
  if (attendu === null) return saisie !== "indefini";
  if (saisie === "indefini") return true;
  return Math.abs(VALEUR_NUMERIQUE_TAN[saisie] - attendu) > TOLERANCE;
}
