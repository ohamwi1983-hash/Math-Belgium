import type { ContexteHypergeoA, IdContexteHypergeoA } from "../../core6e/probabiliteHypergeometrique.types";
import { tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — banque de contextes pour la famille A de `6gen47` (mission : "cartes, fiches
 * d'examen, questions connues/inconnues, pièces défectueuses, boules colorées, loto"). Fichier
 * PUREMENT DÉCLARATIF (aucun tirage aléatoire de N/K/n ici, juste le TEXTE et les PLAGES
 * plausibles pour chaque contexte) — le tirage effectif des valeurs numériques reste dans
 * `familleA.ts`, qui applique ensuite la logique COMMUNE de sélection de `k` selon le sous-type
 * (aucun/tous/exactement), partagée par les 5 contextes.
 *
 * Chaque plage `[min,max]` est un COMPTE ABSOLU (pas une proportion), choisi pour laisser une
 * marge suffisante à `familleA.ts` : `succesRange[1] <= populationRange[0] - 4` ET
 * `tirageRange[1] <= populationRange[0] - 1`, vérifié par `contextesA.test.ts` — garantit que la
 * contrainte du sous-type "aucun" (`K <= N-n`) reste toujours satisfiable sans avoir à réduire `n`
 * en dessous de `tirageRange[0]`, quel que soit le pire cas (`N` minimal du contexte).
 */

interface PlageEntiers {
  min: number;
  max: number;
}

export interface EntreeContexteA {
  contexte: ContexteHypergeoA;
  populationRange: PlageEntiers;
  succesRange: PlageEntiers;
  tirageRange: PlageEntiers;
}

/** `phrases` : la description du contexte, DÉJÀ DÉCOUPÉE par l'appelant en fragments courts (chacun
 * <50 caractères — jamais une phrase française longue en un seul fragment KaTeX, piège CLAUDE.md/
 * 6gen43 : un fragment ne retourne jamais à la ligne tout seul, déborde horizontalement). Chaque
 * fragment est du texte français BRUT (pas de LaTeX) — enveloppé ici, une fois, dans `\text{...}`. */
function contexte(id: IdContexteHypergeoA, phrases: string[], labelPopulation: string, labelSucces: string, labelTirage: string): ContexteHypergeoA {
  return { id, phraseContexte: phrases.map((p) => `\\text{${p}}`), labelPopulation, labelSucces, labelTirage };
}

export const BANQUE_CONTEXTES_A: EntreeContexteA[] = [
  {
    contexte: contexte("cartes", ["On tire plusieurs cartes,", "sans remise, d'un jeu de 32 cartes."], "cartes du jeu", "cartes favorables", "cartes tirées"),
    populationRange: { min: 32, max: 32 },
    succesRange: { min: 4, max: 12 },
    tirageRange: { min: 3, max: 6 },
  },
  {
    contexte: contexte(
      "examen",
      ["Une fiche de révision contient plusieurs", "questions ; l'examen en pose une partie,", "tirée au hasard, sans répétition."],
      "questions de la fiche",
      "questions déjà bien connues",
      "questions posées à l'examen",
    ),
    populationRange: { min: 15, max: 25 },
    succesRange: { min: 5, max: 8 },
    tirageRange: { min: 4, max: 7 },
  },
  {
    contexte: contexte(
      "piecesDefectueuses",
      ["Un lot de pièces contient un certain nombre", "de pièces défectueuses ;", "on en prélève plusieurs pour un contrôle qualité,", "sans remise."],
      "pièces du lot",
      "pièces défectueuses",
      "pièces prélevées pour le contrôle",
    ),
    populationRange: { min: 15, max: 30 },
    succesRange: { min: 2, max: 7 },
    tirageRange: { min: 3, max: 6 },
  },
  {
    contexte: contexte(
      "boulesColorees",
      ["Une urne contient des boules de deux couleurs ;", "on en tire plusieurs, sans remise."],
      "boules de l'urne",
      "boules rouges",
      "boules tirées",
    ),
    populationRange: { min: 14, max: 22 },
    succesRange: { min: 3, max: 7 },
    tirageRange: { min: 3, max: 6 },
  },
  {
    contexte: contexte(
      "loto",
      ["Un jeu de loto tire plusieurs numéros", "parmi un ensemble plus grand ;", "un joueur a coché à l'avance", "un certain nombre de numéros."],
      "numéros du loto",
      "numéros cochés par le joueur",
      "numéros tirés",
    ),
    populationRange: { min: 15, max: 25 },
    succesRange: { min: 4, max: 8 },
    tirageRange: { min: 4, max: 7 },
  },
];

export function tirerEntreeContexteA(): EntreeContexteA {
  return tirerParmi(BANQUE_CONTEXTES_A);
}
