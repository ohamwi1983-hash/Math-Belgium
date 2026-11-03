import type { CandidatEtudeLog, FamilleEtudeFonctionLogarithme } from "../../core6e/etudeFonctionLogarithme.types";
import { calculerViewBoxCandidats, candidatsDiscernables } from "./graphe";

/** Couche A (6e) — petits helpers de tirage propres à `6gen21`. */

export function tirerParmi<T>(candidats: readonly T[]): T {
  return candidats[Math.floor(Math.random() * candidats.length)];
}

/** Mélange les candidats (Fisher-Yates) et retourne le nouvel index du candidat RÉEL (toujours à
 * l'index 0 avant mélange, par convention d'appel). */
export function melangerAvecIndexCorrect<T>(candidats: readonly T[]): { candidats: T[]; indexCorrect: number } {
  const melanges = [...candidats];
  let indexCorrect = 0;
  for (let i = melanges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [melanges[i], melanges[j]] = [melanges[j], melanges[i]];
    if (indexCorrect === i) indexCorrect = j;
    else if (indexCorrect === j) indexCorrect = i;
  }
  return { candidats: melanges, indexCorrect };
}

const ESSAIS_DISTRACTEURS = 40;

/** Tire les 3 distracteurs (chaque fabrique peut tirer ses propres paramètres) jusqu'à obtenir 4
 * courbes DISCERNABLES dans le cadre de la vraie fonction (`candidatsDiscernables`) — `null` si
 * aucun tirage ne convient (l'appelant re-tire alors l'exercice entier). */
export function assemblerQcm(
  famille: FamilleEtudeFonctionLogarithme,
  reel: CandidatEtudeLog,
  valeursRemarquables: number[],
  fabriques: (() => CandidatEtudeLog)[],
): { candidats: CandidatEtudeLog[]; indexCorrect: number } | null {
  for (let essai = 0; essai < ESSAIS_DISTRACTEURS; essai++) {
    const tous = [reel, ...fabriques.map((f) => f())];
    const viewBox = calculerViewBoxCandidats(famille, tous, reel, valeursRemarquables);
    if (candidatsDiscernables(famille, tous, viewBox)) return melangerAvecIndexCorrect(tous);
  }
  return null;
}
