import type {
  ExerciceTransformationGraphique,
  GenerateurExerciceTransformationGraphique,
} from "../core/transformationsGraphiques.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * Un seul écran pour cet exercice (contrairement aux autres exercices du projet, aucune notion de
 * `Phase`/`phase` n'est nécessaire ici) : les 4 curseurs, le toggle et le champ équation sont
 * toujours visibles ensemble, soumis par le même bouton "Valider" (section 2 de la spec). Les deux
 * notes ("équation", "curseurs") évoluent cependant de façon INDÉPENDANTE — chacune sa propre
 * machine à tentatives (`etapeEquation`/`etapeCurseurs`), chacune peut se clore à un essai
 * différent de l'autre. L'exercice ne se clôt que lorsque les DEUX notes sont closes.
 */
/**
 * `xxxAideUtilisee` — PAS le flag partagé `EtatSessionTransformationGraphique.aideUtilisee` tel
 * quel : sa valeur AU MOMENT PRÉCIS où cette note précise s'est close (même valeur que celle
 * réellement appliquée au calcul du score de cette note, voir `soumettreReponse`) — une note close
 * AVANT l'activation de l'aide reste `false` même si l'aide est activée plus tard dans le même
 * exercice, cohérent avec le fait qu'elle n'a jamais été pénalisée. Nécessaire pour `statutRecap`
 * (`components/LigneRecap.tsx`, `promptuniformisationrecap4e.md`) — le flag partagé seul aurait
 * classé à tort une note non pénalisée comme "orange".
 */
export interface ResultatExerciceTransformationGraphique {
  scoreEquation: number;
  equationRevele: boolean;
  equationAideUtilisee: boolean;
  scoreCurseurs: number;
  curseursRevele: boolean;
  curseursAideUtilisee: boolean;
}

export interface EtatSessionTransformationGraphique {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceTransformationGraphique;
  indexExercice: number;
  exerciceCourant: ExerciceTransformationGraphique;
  etapeEquation: EtatEtapeTentatives;
  etapeCurseurs: EtatEtapeTentatives;
  /** Bouton "Aide" (section 2-3 de la spec) : révélation à sens unique, ×0,5 sur les DEUX notes —
   * appliqué à chacune au moment précis de sa propre clôture (voir soumettreReponse), jamais
   * rétroactivement sur une note déjà close avant l'activation. */
  aideUtilisee: boolean;
  /** Fixé (avec le facteur ×0,5 déjà appliqué si aideUtilisee) au moment où etapeEquation se clôt ;
   * `null` tant que ce n'est pas encore le cas. */
  scoreEquationExercice: number | null;
  /** Même principe que ci-dessus, pour etapeCurseurs. */
  scoreCurseursExercice: number | null;
  /** `aideUtilisee` figé au moment PRÉCIS où `etapeEquation`/`etapeCurseurs` se clôt (même valeur
   * que celle réellement appliquée au score de cette note) — jamais relu depuis `aideUtilisee`
   * après coup, qui a pu changer entre-temps si l'autre note s'est close plus tard. */
  equationAideAppliquee: boolean;
  curseursAideAppliquee: boolean;
  resultats: ResultatExerciceTransformationGraphique[];
  terminee: boolean;
}
