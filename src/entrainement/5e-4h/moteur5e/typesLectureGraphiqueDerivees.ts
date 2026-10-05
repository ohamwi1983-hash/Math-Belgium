/**
 * Couche B (5e) — types + dérivation pure pour 5gen30 ("Lecture graphique — dérivées et
 * applications"). N'importe jamais rien de `src/generateurs5e/`.
 *
 * Séquence FIXE dès le tirage (dépend uniquement de champs déjà connus à la génération : présence
 * d'asymptotes à nommer, nombre d'extrema/PI réellement trouvés) — aucune branche réactive
 * dépendant d'une réponse élève, même patron que `typesEtudeLocale.ts` (5gen29) :
 *
 *   1. "asymptotes"     — sauté si strictement rien à nommer (0 AV + infini "aucune" des 2 côtés).
 *   2. "tableauFPrime"  — TOUJOURS présent (même à 0 extremum, une seule zone ↗ ou ↘ reste une
 *      info valide à lire).
 *   3. "extremums"      — sauté si 0 extremum.
 *   4. "tableauFSeconde"— TOUJOURS présent, même logique.
 *   5. "inflexions"     — sauté si 0 PI.
 */
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import { listeAsymptotes } from "./typesLectureGraphiqueLimites";

export type EcranLectureGraphiqueDerivees = "asymptotes" | "tableauFPrime" | "extremums" | "tableauFSeconde" | "inflexions";

export function ordreEcransLectureGraphiqueDerivees(exercice: ExerciceLectureGraphiqueDerivees): EcranLectureGraphiqueDerivees[] {
  const ecrans: EcranLectureGraphiqueDerivees[] = [];
  if (listeAsymptotes(exercice.asymptotique).length > 0) ecrans.push("asymptotes");
  ecrans.push("tableauFPrime");
  if (exercice.extrema.length > 0) ecrans.push("extremums");
  ecrans.push("tableauFSeconde");
  if (exercice.inflexions.length > 0) ecrans.push("inflexions");
  return ecrans;
}

export function ecranInitial(exercice: ExerciceLectureGraphiqueDerivees): EcranLectureGraphiqueDerivees {
  return ordreEcransLectureGraphiqueDerivees(exercice)[0];
}

export function ecranApres(exercice: ExerciceLectureGraphiqueDerivees, ecran: EcranLectureGraphiqueDerivees): EcranLectureGraphiqueDerivees | "termine" {
  const ordre = ordreEcransLectureGraphiqueDerivees(exercice);
  const index = ordre.indexOf(ecran);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceLectureGraphiqueDerivees {
  exercice: ExerciceLectureGraphiqueDerivees;
  scores: Partial<Record<EcranLectureGraphiqueDerivees, number>>;
}

export interface EtatSessionLectureGraphiqueDerivees {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceLectureGraphiqueDerivees;
  exerciceCourant: ExerciceLectureGraphiqueDerivees;
  phase: EcranLectureGraphiqueDerivees;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<EcranLectureGraphiqueDerivees, number>>;
  indexExercice: number;
  resultats: ResultatExerciceLectureGraphiqueDerivees[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
