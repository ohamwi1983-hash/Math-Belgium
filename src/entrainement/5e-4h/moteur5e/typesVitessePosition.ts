/**
 * Couche B (5e) — types pour 5gen35 ("Vitesse et position"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Séquence d'écrans FIXE dès le tirage, dépend UNIQUEMENT de `exercice.variante` — même patron
 * que `ordreEcransTangente` (5gen28) : jamais une branche réactive dépendant d'une réponse élève.
 * Les 3 premiers écrans ("derivee"/"evaluerV0"/"resoudre") puis "vitessePointe" sont ENTIÈREMENT
 * partagés entre A et B (mêmes composants, mêmes vérifications, opérant sur les champs génériques
 * `distanceCible`/`tCible`/`racineRejetee` du contrat) — seule B ajoute 2 écrans après.
 */
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type EcranVitessePosition = "derivee" | "evaluerV0" | "resoudre" | "vitessePointe" | "conversion" | "segmentConstant" | "tempsTotal";

/** Séquence COMPLÈTE et FIXE d'écrans pour une variante donnée — A : 5 écrans, B : 6 écrans. */
export function ordreEcransVitessePosition(exercice: ExerciceVitessePosition): EcranVitessePosition[] {
  const commun: EcranVitessePosition[] = ["derivee", "evaluerV0", "resoudre", "vitessePointe"];
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
  /** Indexé par écran RÉELLEMENT traversé — 5 clés (A) ou 6 clés (B), selon
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
  indexExercice: number;
  resultats: ResultatExerciceVitessePosition[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
