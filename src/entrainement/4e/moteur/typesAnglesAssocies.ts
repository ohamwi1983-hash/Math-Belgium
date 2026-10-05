import type { ExerciceAnglesAssocies, GenerateurExerciceAnglesAssocies, RelationAnglesAssocies, VarianteAnglesAssocies } from "../core/anglesAssocies.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * Écran UNIQUE (`promptgen17refontecomplete.md`, remplace entièrement l'ancienne séquence à 2 ou 3
 * phases `questionPrincipale → [questionComplementaire] → valeurFinale`) — un seul champ de réponse
 * numérique (la valeur approchée finale), avec une aide progressive à paliers (2 ou 3 niveaux selon
 * l'exercice, voir `verificationAnglesAssocies.ts::niveauAideMax`) plutôt qu'un écran intermédiaire
 * séparé. Aucun type `PhaseAnglesAssocies` : il n'y a plus qu'un seul écran actif par exercice.
 */
export interface ResultatExerciceAnglesAssocies {
  variante: VarianteAnglesAssocies;
  relation: RelationAnglesAssocies;
  score: number;
  revele: boolean;
  /** Niveau d'aide atteint au moment précis où l'écran se clôt (0 à `niveauAideMax(exercice)`,
   * jamais rétroactif) — capturé pour la coloration du récapitulatif final (`statutRecap`,
   * `promptuniformisationrecap4e.md`). */
  niveauAide: number;
}

export interface EtatSessionAnglesAssocies {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceAnglesAssocies;
  indexExercice: number;
  exerciceCourant: ExerciceAnglesAssocies;
  etapeCourante: EtatEtapeTentatives;
  /** Aide progressive additive (pénalité -20 pts/niveau, même principe que "Applications physiques"
   * — écran "norme" — ou "Distance point-droite") — remis à 0 à chaque nouvel exercice. */
  niveauAide: number;
  resultats: ResultatExerciceAnglesAssocies[];
  terminee: boolean;
}
