import type { ExerciceFamilleGMelange } from "../../core6e/probabilitesProblemes.types";
import { construireFamilleCSpecial } from "../tiragesArbres/familleC";

/**
 * Couche A (6e) — génération famille G (« mélange d'objets ») pour `6gen33`. Réutilise
 * `construireFamilleCSpecial` de `generateurs6e/tiragesArbres/familleC.ts` (6gen31, dé truqué à une
 * face spéciale, 6 faces) comme `base`, puis ajoute une couche de probabilités totales : l'urne 1
 * (ce dé) est choisie avec la probabilité `poidsObjet1`, l'urne 2 contient un autre dé dont la
 * probabilité du même événement est donnée. Les sous-types « dérangements » (doublon de 6gen31) et
 * « financier » ont été retirés (audit 6e ch. 6, décision F).
 */

function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

const M_SPECIAL: readonly number[] = [4, 5, 6, 7, 8];
const K_SPECIAL: readonly number[] = [1, 2, 3];
const CANDIDATS_POIDS: readonly number[] = [0.3, 0.4, 0.5, 0.6, 0.7];
const CANDIDATS_PROBA_AUTRE: readonly number[] = [0.1, 0.15, 0.2, 0.25, 0.3];

const CONTEXTE_MELANGE = {
  texte: "On choisit une urne parmi deux, puis on lance le dé qu'elle contient.",
  labelObjet1: "urne 1",
  labelObjet2: "urne 2",
};

export function construireFamilleGMelange(m: number, k: number): ExerciceFamilleGMelange {
  // 6 faces et question « deux faces » imposées : les consignes de 6gen33 parlent d'un dé à 6 faces
  // et de l'événement « face spéciale ou autre face ».
  const base = construireFamilleCSpecial(m, k, 6, "deuxFaces");
  return {
    famille: "G",
    sousType: "melangeObjets",
    base,
    contexteMelange: CONTEXTE_MELANGE,
    poidsObjet1: tirerParmi(CANDIDATS_POIDS),
    probabiliteAutreObjet: tirerParmi(CANDIDATS_PROBA_AUTRE),
  };
}

export function genererFamilleGMelange(): ExerciceFamilleGMelange {
  return construireFamilleGMelange(tirerParmi(M_SPECIAL), tirerParmi(K_SPECIAL));
}

export function probabiliteObjet1(exercice: ExerciceFamilleGMelange): number {
  const { p0, p } = exercice.base;
  return p0.num / p0.den + p.num / p.den;
}

export function probabiliteTotaleMelange(exercice: ExerciceFamilleGMelange): number {
  return exercice.poidsObjet1 * probabiliteObjet1(exercice) + (1 - exercice.poidsObjet1) * exercice.probabiliteAutreObjet;
}
