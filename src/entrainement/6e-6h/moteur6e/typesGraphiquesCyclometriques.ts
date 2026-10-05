/**
 * Couche B (6e) — types pour `6gen5`.
 *
 * **REFONTE — un seul écran par tirage, toutes familles confondues** (remplace l'ancienne séquence
 * "calcul (C-F) → sélection (A-F)" à 1 ou 2 écrans selon la famille) : la notion de phase disparaît
 * entièrement, chaque exercice se résout désormais en une seule tentative combinée (lettre choisie
 * + 6 sous-réponses de justification), exactement comme l'écran "bijection" à 2 comboboxes de
 * 6gen1 (`EtapeBijectionInjectiviteFonctions.tsx`) généralisé à 7 sous-réponses.
 */
import type { ExerciceGraphiquesCyclometriques } from "../core6e/graphiquesCyclometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export interface ResultatExerciceGraphiquesCyclometriques {
  exercice: ExerciceGraphiquesCyclometriques;
  score: number;
}

export interface EtatSessionGraphiquesCyclometriques {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceGraphiquesCyclometriques;
  exerciceCourant: ExerciceGraphiquesCyclometriques;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  indexExercice: number;
  resultats: ResultatExerciceGraphiquesCyclometriques[];
  terminee: boolean;
  /** `revelee` de l'écran qui vient JUSTE de se clôturer par cet appel — jamais celle, forcément
   * périmée, de `etapeCourante` (déjà réinitialisée pour l'exercice SUIVANT au moment où l'appelant
   * lit l'état retourné). Piège central du récapitulatif final (voir CLAUDE.md, "Récapitulatif
   * final à plat, coloré") : `App6gen5.tsx::terminerEtape` doit lire CE champ sur l'état RETOURNÉ
   * par `soumettreReponseEcranUnique`, jamais `etapeCourante.revelee` de l'état PRÉCÉDENT (qui vaut
   * structurellement toujours `false` à cet instant). */
  derniereRevelee: boolean;
}
