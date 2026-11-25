import type { ContexteHypergeoA, IdContexteHypergeoA, SousTypeHypergeoA } from "../../core6e/probabiliteHypergeometrique.types";
import { tirerParmi } from "./aleatoire";

/**
 * Contextes de la famille A de `6gen47` : chaque situation est écrite en prose AVEC ses nombres
 * (audit 6e ch. 7 : avant, des lignes `\text{}` coupées à 390 px et sur papier, sans N, K ni n), et
 * l'événement est nommé (« exactement 2 cœurs », « aucune pièce défectueuse »).
 */

interface PlageEntiers {
  min: number;
  max: number;
}

export interface EntreeContexteA {
  id: IdContexteHypergeoA;
  populationRange: PlageEntiers;
  succesRange: PlageEntiers;
  tirageRange: PlageEntiers;
  labelPopulation: string;
  labelSucces: string;
  labelTirage: string;
  phrase: (N: number, K: number, n: number) => string;
  evenement: (sousType: SousTypeHypergeoA, k: number, n: number) => string;
}

function pluriel(k: number, sing: string, plur: string): string {
  return k <= 1 ? sing : plur;
}

export const BANQUE_CONTEXTES_A: EntreeContexteA[] = [
  {
    id: "cartes",
    populationRange: { min: 32, max: 32 },
    succesRange: { min: 8, max: 8 },
    tirageRange: { min: 3, max: 6 },
    labelPopulation: "cartes du jeu",
    labelSucces: "cœurs",
    labelTirage: "cartes tirées",
    phrase: (N, K, n) => `On tire au hasard ${n} cartes, sans remise, d'un jeu de ${N} cartes qui contient ${K} cœurs.`,
    evenement: (s, k, n) => (s === "aucun" ? "n'obtenir aucun cœur" : s === "tous" ? `n'obtenir que des cœurs (les ${n} cartes)` : `obtenir exactement ${k} ${pluriel(k, "cœur", "cœurs")}`),
  },
  {
    id: "examen",
    populationRange: { min: 15, max: 25 },
    succesRange: { min: 5, max: 12 },
    tirageRange: { min: 3, max: 6 },
    labelPopulation: "questions de la fiche",
    labelSucces: "questions connues",
    labelTirage: "questions posées",
    phrase: (N, K, n) => `Une fiche de révision compte ${N} questions ; Léa en connaît ${K}. L'examinateur en tire ${n} au hasard, toutes différentes.`,
    evenement: (s, k) => (s === "aucun" ? "que Léa ne connaisse aucune des questions posées" : s === "tous" ? "que Léa connaisse toutes les questions posées" : `que Léa connaisse exactement ${k} ${pluriel(k, "question posée", "questions posées")}`),
  },
  {
    id: "piecesDefectueuses",
    populationRange: { min: 15, max: 30 },
    succesRange: { min: 3, max: 8 },
    tirageRange: { min: 3, max: 6 },
    labelPopulation: "pièces du lot",
    labelSucces: "pièces défectueuses",
    labelTirage: "pièces prélevées",
    phrase: (N, K, n) => `Un lot de ${N} pièces contient ${K} pièces défectueuses. Pour un contrôle, on en prélève ${n} au hasard, sans remise.`,
    evenement: (s, k) => (s === "aucun" ? "qu'aucune pièce prélevée ne soit défectueuse" : s === "tous" ? "que toutes les pièces prélevées soient défectueuses" : `qu'exactement ${k} ${pluriel(k, "pièce prélevée soit défectueuse", "pièces prélevées soient défectueuses")}`),
  },
  {
    id: "boulesColorees",
    populationRange: { min: 12, max: 22 },
    succesRange: { min: 4, max: 9 },
    tirageRange: { min: 3, max: 5 },
    labelPopulation: "boules de l'urne",
    labelSucces: "boules rouges",
    labelTirage: "boules tirées",
    phrase: (N, K, n) => `Une urne contient ${K} boules rouges et ${N - K} boules bleues. On tire ${n} boules, sans remise.`,
    evenement: (s, k) => (s === "aucun" ? "ne tirer aucune boule rouge" : s === "tous" ? "ne tirer que des boules rouges" : `tirer exactement ${k} ${pluriel(k, "boule rouge", "boules rouges")}`),
  },
  {
    id: "loto",
    populationRange: { min: 15, max: 25 },
    succesRange: { min: 4, max: 8 },
    tirageRange: { min: 3, max: 6 },
    labelPopulation: "numéros",
    labelSucces: "numéros cochés",
    labelTirage: "numéros tirés",
    phrase: (N, K, n) => `Un jeu de loterie tire ${n} numéros différents parmi ${N}. Un joueur a coché ${K} numéros.`,
    evenement: (s, k) => (s === "aucun" ? "qu'aucun des numéros tirés ne soit coché" : s === "tous" ? "que tous les numéros tirés soient cochés" : `qu'exactement ${k} des numéros tirés ${pluriel(k, "soit coché", "soient cochés")}`),
  },
];

export function tirerEntreeContexteA(): EntreeContexteA {
  return tirerParmi(BANQUE_CONTEXTES_A);
}

export function contexteInstance(entree: EntreeContexteA, N: number, K: number, n: number, k: number, sousType: SousTypeHypergeoA): ContexteHypergeoA {
  return {
    id: entree.id,
    phrase: entree.phrase(N, K, n),
    evenement: entree.evenement(sousType, k, n),
    labelPopulation: entree.labelPopulation,
    labelSucces: entree.labelSucces,
    labelTirage: entree.labelTirage,
  };
}
