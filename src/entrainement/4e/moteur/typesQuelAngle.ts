/**
 * Couche B — types de session pour "Quel angle ?" (chapitre 3, générateur en position 18).
 * Pas de `Phase` (comme "Transformations graphiques", générateur 8) : un seul écran, toujours le
 * même, jusqu'à la clôture de l'exercice — une seule note ici (contrairement au huitième, qui en a
 * deux indépendantes), donc pas même besoin d'un état par note, juste `etapeCourante` directement.
 */
import type { ExerciceQuelAngle, FonctionTrig, GenerateurExerciceQuelAngle } from "../core/quelAngle.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export interface ResultatExerciceQuelAngle {
  fonction: FonctionTrig;
  score: number;
  revele: boolean;
  /** Capturé au moment précis où l'unique note se clôt (jamais rétroactif) — pour la coloration du
   * récapitulatif final (`statutRecap`, `promptuniformisationrecap4e.md`). */
  aideUtilisee: boolean;
}

export interface EtatSessionQuelAngle {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceQuelAngle;
  indexExercice: number;
  exerciceCourant: ExerciceQuelAngle;
  etapeCourante: EtatEtapeTentatives;
  /** Bouton "Aide" unique (`promptcorrectionsgenerateur18aideunique.md`, remplace les 3 niveaux
   * d'origine) — révélation à sens unique, facteur ×0,5 sur le score final, même mécanique que la
   * plupart des générateurs du projet (ex. "Valeurs remarquables"). */
  aideUtilisee: boolean;
  resultats: ResultatExerciceQuelAngle[];
  terminee: boolean;
}
