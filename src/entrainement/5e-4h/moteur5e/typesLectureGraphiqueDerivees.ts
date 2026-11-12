/**
 * Couche B (5e) — types + ordre des écrans pour 5gen30 ("Lecture graphique — dérivées et
 * applications"). N'importe jamais rien de `src/generateurs5e/`.
 *
 * Séquence FIXE de 6 écrans pour TOUS les exercices (audit 5e ch. 5, décision J : le nombre d'écrans
 * ne révèle plus la structure du graphique) :
 *   1. "asymptotes"      — l'élève nomme chaque asymptote (ou coche « aucune »).
 *   2. "zerosFPrime"     — abscisses des points où f' s'annule (tangente horizontale), ou « aucun ».
 *   3. "tableauFPrime"   — signe de f' et variations (colonnes = points de l'écran 2 + AV).
 *   4. "extremums"       — ordonnée de chaque extremum ; SANS OBJET s'il n'y en a pas (écran sauté,
 *      sa puce ne le dit qu'une fois atteinte : le tableau de l'écran 3 l'a déjà montré).
 *   5. "inflexions"      — abscisses des points d'inflexion, ou « aucun ».
 *   6. "tableauFSeconde" — signe de f'' et concavité (colonnes = points de l'écran 5 + AV).
 * Les positions sont demandées AVANT les tableaux : les en-têtes des tableaux ne les révèlent plus.
 */
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type EcranLectureGraphiqueDerivees = "asymptotes" | "zerosFPrime" | "tableauFPrime" | "extremums" | "inflexions" | "tableauFSeconde";

export const ORDRE_ECRANS_LECTURE_GRAPHIQUE_DERIVEES: EcranLectureGraphiqueDerivees[] = ["asymptotes", "zerosFPrime", "tableauFPrime", "extremums", "inflexions", "tableauFSeconde"];

/** Ordre FIXE (6 écrans, puces comprises). */
export function ordreEcransLectureGraphiqueDerivees(_exercice?: ExerciceLectureGraphiqueDerivees): EcranLectureGraphiqueDerivees[] {
  return ORDRE_ECRANS_LECTURE_GRAPHIQUE_DERIVEES;
}

/** Écrans sans objet pour CET exercice (sautés, puce « sans objet » une fois atteints). */
export function ecranSansObjet(exercice: ExerciceLectureGraphiqueDerivees, ecran: EcranLectureGraphiqueDerivees): boolean {
  return ecran === "extremums" && exercice.extrema.length === 0;
}

/** Écrans réellement parcourus (ordre fixe moins les écrans sans objet). */
export function ecransParcourus(exercice: ExerciceLectureGraphiqueDerivees): EcranLectureGraphiqueDerivees[] {
  return ORDRE_ECRANS_LECTURE_GRAPHIQUE_DERIVEES.filter((e) => !ecranSansObjet(exercice, e));
}

export function ecranInitial(exercice: ExerciceLectureGraphiqueDerivees): EcranLectureGraphiqueDerivees {
  return ecransParcourus(exercice)[0];
}

export function ecranApres(exercice: ExerciceLectureGraphiqueDerivees, ecran: EcranLectureGraphiqueDerivees): EcranLectureGraphiqueDerivees | "termine" {
  const ordre = ecransParcourus(exercice);
  const index = ordre.indexOf(ecran);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceLectureGraphiqueDerivees {
  exercice: ExerciceLectureGraphiqueDerivees;
  scores: Partial<Record<EcranLectureGraphiqueDerivees, number>>;
  /** même principe que `EtatSessionLectureGraphiqueDerivees.revelesPartiels` (voir son commentaire). */
  revelesPartiels: Partial<Record<EcranLectureGraphiqueDerivees, boolean>>;
}

export interface EtatSessionLectureGraphiqueDerivees {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceLectureGraphiqueDerivees;
  exerciceCourant: ExerciceLectureGraphiqueDerivees;
  phase: EcranLectureGraphiqueDerivees;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<EcranLectureGraphiqueDerivees, number>>;
  /** vrai signal "révélé" par écran, peuplé depuis `etapeCourante.revelee` à la clôture (jamais
   * recalculé) — jusqu'au 2025-10, le récapitulatif le déduisait de `scoresPartiels[phase] === 0`,
   * une heuristique fausse ici : la pénalité d'aide (`niveauAide * PENALITE`) était soustraite (avant le retrait des pénalités) APRÈS
   * le score de tentatives puis plafonnée à 0 (`Math.max(0, ...)`), donc une réussite fortement
   * aidée pouvait légitimement tomber à 0 et s'afficher à tort comme "révélée" (point A, balayage
   * générique). */
  revelesPartiels: Partial<Record<EcranLectureGraphiqueDerivees, boolean>>;
  indexExercice: number;
  resultats: ResultatExerciceLectureGraphiqueDerivees[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
