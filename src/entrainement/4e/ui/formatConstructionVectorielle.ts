/**
 * Présentation pure — "Construction graphique de vecteurs sur grille" (chapitre "Calcul
 * vectoriel", quatrième générateur).
 */
import type { ExerciceConstructionVectorielle } from "../core/constructionVectorielle.types";

function formatNombre(valeur: number): string {
  return Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "");
}

/**
 * Consigne composée en 3 morceaux (avant/latex/apres) — même patron que `consignePointVectoriel`
 * (voir sa section dédiée, CLAUDE.md) : jamais de `$...$` littéral passé à KaTeX, une prose brute
 * autour d'un court fragment mathématique.
 */
export interface ConsigneConstruction {
  avant: string;
  latex: string;
  apres: string;
}

export function consigneConstructionVectorielle(exercice: ExerciceConstructionVectorielle): ConsigneConstruction {
  const coef = exercice.coefficient;
  const coefTexte = coef === 1 ? "" : coef === -1 ? "-" : formatNombre(coef);
  return {
    avant: "Trace le vecteur ",
    latex: `${coefTexte}\\vec{${exercice.labelA}${exercice.labelB}}`,
    apres: " à partir du point de ton choix sur la grille.",
  };
}

/** Rappel purement symbolique des points A/B connus — fragment KaTeX direct, jamais de prose.
 * Conservée telle quelle pour les consommateurs qui ont besoin d'une seule chaîne —
 * `formatTermesDonneesConnuesConstructionLatex` ci-dessous en est la version "bloc fitter". */
export function formatDonneesConnuesConstructionLatex(exercice: ExerciceConstructionVectorielle): string {
  return formatTermesDonneesConnuesConstructionLatex(exercice).join(" \\quad ");
}

/** Version "bloc fitter" de `formatDonneesConnuesConstructionLatex`
 * (`promptblocfittertousgenerateurs.md`) — un fragment KaTeX par point. */
export function formatTermesDonneesConnuesConstructionLatex(exercice: ExerciceConstructionVectorielle): string[] {
  return [
    `${exercice.labelA}(${formatNombre(exercice.pointA.x)} ; ${formatNombre(exercice.pointA.y)})`,
    `${exercice.labelB}(${formatNombre(exercice.pointB.x)} ; ${formatNombre(exercice.pointB.y)})`,
  ];
}
