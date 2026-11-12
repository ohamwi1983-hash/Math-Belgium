/**
 * Couche B (5e) — types pour 5gen35 ("Vitesse et position"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Séquence d'écrans FIXE dès le tirage, dépend UNIQUEMENT de `exercice.variante` — même patron
 * que `ordreEcransTangente` (5gen28) : jamais une branche réactive dépendant d'une réponse élève.
 * Les 5 premiers écrans ("derivee", "acceleration", "resoudre", "rejet", "vitessePointe") sont
 * ENTIÈREMENT partagés entre A et B (champs génériques `distanceCible`/`tCible`/`racineRejetee`) —
 * seule B ajoute 2 écrans après. "acceleration" (a(t) = v'(t)) remplace l'ancien "evaluerV0", qui
 * ne répondait à aucune question de l'énoncé (audit 5c5d point 14) ; "rejet" (QCM, UNE tentative)
 * est séparé de "resoudre" (2 champs, 3 tentatives) pour qu'un choix fermé ne se gagne jamais par
 * élimination (décision D).
 */
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type EcranVitessePosition = "derivee" | "acceleration" | "resoudre" | "rejet" | "vitessePointe" | "conversion" | "segmentConstant" | "tempsTotal";

/** Ancien identifiant de l'écran "acceleration", encore lu par l'adaptateur papier
 * (`generateurs5e/vitessePosition/exportEvaluation.ts`) jusqu'à la refonte des feuilles — les
 * fonctions de formatage le traitent comme "acceleration". */
export type EcranVitessePositionHerite = "evaluerV0";

/** Séquence COMPLÈTE et FIXE d'écrans pour une variante donnée — A : 6 écrans, B : 7 écrans. */
export function ordreEcransVitessePosition(exercice: ExerciceVitessePosition): EcranVitessePosition[] {
  const commun: EcranVitessePosition[] = ["derivee", "acceleration", "resoudre", "rejet", "vitessePointe"];
  return exercice.variante === "A" ? [...commun, "conversion"] : [...commun, "segmentConstant", "tempsTotal"];
}

export function ecranInitial(exercice: ExerciceVitessePosition): EcranVitessePosition {
  return ordreEcransVitessePosition(exercice)[0];
}

export function ecranApres(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition): EcranVitessePosition | "termine" {
  const ordre = ordreEcransVitessePosition(exercice);
  const index = ordre.indexOf(ecran);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceVitessePosition {
  exercice: ExerciceVitessePosition;
  /** Indexé par écran RÉELLEMENT traversé — 6 clés (A) ou 7 clés (B), selon
   * `ordreEcransVitessePosition`. */
  scores: Partial<Record<EcranVitessePosition, number>>;
}

export interface EtatSessionVitessePosition {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceVitessePosition;
  exerciceCourant: ExerciceVitessePosition;
  phase: EcranVitessePosition;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<EcranVitessePosition, number>>;
  /** true par écran déjà clos ssi révélé (tentatives épuisées) — jusqu'au 2025-10,
   * `scoresPartiels[ecran] === 0` en tenait lieu, une heuristique FAUSSE ici : la pénalité d'aide
   * multi-niveaux (`sessionVitessePosition.ts`) était soustraite (avant le retrait des pénalités) APRÈS le score de tentatives puis
   * plafonnée à 0, donc une réussite fortement aidée pouvait légitimement tomber à 0 et s'afficher
   * à tort comme "révélée" (point A, balayage générique). Peuplé depuis `etapeCourante.revelee`. */
  revelesPartiels: Partial<Record<EcranVitessePosition, boolean>>;
  indexExercice: number;
  resultats: ResultatExerciceVitessePosition[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
