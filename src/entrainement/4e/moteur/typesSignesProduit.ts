import type {
  ExerciceSignesProduit,
  GenerateurExerciceSignesProduit,
} from "../core/signesProduit.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * Séquence : traite `exercice.facteurs` STRICTEMENT dans l'ordre du tableau (l'ordre d'affichage de
 * l'énoncé), un facteur à la fois — `indexFacteurExercice` (EtatSessionSignesProduit) est le
 * pointeur "combien de facteurs sont déjà entièrement traités", jamais recalculé autrement
 * qu'incrémenté à la toute dernière sous-étape d'un facteur donné
 * (promptgenerateur5signesProduit.md, points 9-10) :
 * - un facteur linéaire : une seule étape "racineLineaire" (1 sous-étape).
 * - un facteur quadratique (factorisable OU irréductible) : "methodeFacteur" d'abord (5 choix —
 *   les 4 méthodes historiques + "Non factorisable", point 9), puis SELON LA VRAIE NATURE du
 *   facteur (jamais selon le choix de l'élève, même principe que tout le reste du projet) :
 *   - factorisable : factorisationChamp1 → factorisationChamp2 → [factorisationFactorisation
 *     uniquement si categorie === "cas_general"] (3 à 4 sous-étapes) ;
 *   - irréductible : signeIrreductible (2 sous-étapes au total avec méthode).
 * Une fois tous les facteurs traités (`indexFacteurExercice === exercice.facteurs.length`) :
 * grille → intervalle.
 *
 * Au plus 1 facteur est jamais réellement factorisable (voir generateurs/signesProduit/index.ts) —
 * `scoreFactorisationChamp1Exercice`/`scoreFactorisationChamp2Exercice`/
 * `scoreFactorisationFactorisationExercice` restent donc des champs uniques (jamais des tableaux),
 * retrouvés via le même helper `facteurFactorisable(exercice)` qu'avant ce prompt — seule la phase
 * "methodeFacteur" qui les précède est désormais commune à TOUS les facteurs quadratiques.
 *
 * "reductionFacteur" (nouvelle, prompt utilisateur du 26/09 — généralise à ce générateur l'étape
 * déjà présente sur gen1/gen2/gen3/gen4) : le facteur quadratique factorisable (au plus 1 par
 * exercice, voir ci-dessus) réutilise la même construction que gen3 (construireFacteurFactorisable.ts,
 * a=randomInt(1,4)) et peut donc avoir des coefficients non réduits — sautée quand pgcd(|a|,|b|,|c|)=1
 * (voir phasePourFacteur, sessionSignesProduit.ts), sinon toujours juste avant "methodeFacteur" pour
 * ce facteur. Comme les scores "factorisation*" ci-dessus, un champ unique (jamais un tableau) :
 * au plus 1 facteur factorisable par exercice, jamais un facteur irréductible ou linéaire (aucune
 * réduction de coefficients n'a de sens pour eux — un facteur irréductible n'est jamais factorisé,
 * un facteur linéaire n'a qu'un seul coefficient k, pas de pgcd à trois termes).
 */
export type PhaseSignesProduit =
  | "racineLineaire"
  | "reductionFacteur"
  | "methodeFacteur"
  | "factorisationChamp1"
  | "factorisationChamp2"
  | "factorisationFactorisation"
  | "signeIrreductible"
  | "grille"
  | "intervalle";

export interface ResultatExerciceSignesProduit {
  /** un score par facteur linéaire présent, dans l'ordre de exercice.facteurs (0 à 3 entrées) */
  scoresRacineLineaire: number[];
  /** un score par facteur quadratique présent (factorisable OU irréductible), dans l'ordre de exercice.facteurs (0 à 3 entrées) */
  scoresMethode: number[];
  methodeRevelees: boolean[];
  /** null si aucun facteur n'était réellement factorisable dans cet exercice, ou s'il l'était déjà à coefficients réduits */
  scoreReductionFacteur: number | null;
  aideReductionFacteurUtilisee: boolean;
  /** null si aucun facteur n'était réellement factorisable dans cet exercice */
  scoreFactorisationChamp1: number | null;
  aideFactorisationChamp1Utilisee: boolean;
  scoreFactorisationChamp2: number | null;
  aideFactorisationChamp2Utilisee: boolean;
  /** score de l'étape "factorisationFactorisation", null sauf si le facteur factorisable est cas_general. */
  scoreFactorisationFactorisation: number | null;
  aideFactorisationFactorisationUtilisee: boolean;
  /** un score par facteur irréductible présent, dans l'ordre de exercice.facteurs (0 à 2 entrées) */
  scoresSigneIrreductible: number[];
  scoreGrille: number;
  grilleRevelee: boolean;
  aideGrilleTableauUtilisee: boolean;
  scoreIntervalle: number;
  intervalleRevele: boolean;
  aideIntervalleUtilisee: boolean;
}

export interface EtatSessionSignesProduit {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceSignesProduit;
  /** nombre d'exercices déjà clôturés (0 au début) */
  indexExercice: number;
  exerciceCourant: ExerciceSignesProduit;
  phase: PhaseSignesProduit;
  etapeCourante: EtatEtapeTentatives;
  /** combien de facteurs (exercice.facteurs, dans l'ordre) sont déjà ENTIÈREMENT traités — voir le commentaire de PhaseSignesProduit. */
  indexFacteurExercice: number;
  scoresRacineLineaireExercice: number[];
  scoresMethodeExercice: number[];
  methodeRevelees: boolean[];
  scoreReductionFacteurExercice: number | null;
  scoreFactorisationChamp1Exercice: number | null;
  scoreFactorisationChamp2Exercice: number | null;
  scoreFactorisationFactorisationExercice: number | null;
  scoresSigneIrreductibleExercice: number[];
  scoreGrilleExercice: number | null;
  grilleRevelee: boolean;
  /**
   * Aides à sens unique (1 seul niveau, ×0,5 sur le score de l'étape concernée à sa clôture —
   * conceptionaidescomposantspartageshistorique.md), distinctes de `aideUtilisee` ci-dessous (qui
   * ne concerne que l'étape "intervalle") — remises à false au passage à l'exercice suivant.
   */
  aideReductionFacteurUtilisee: boolean;
  aideFactorisationChamp1Utilisee: boolean;
  aideFactorisationChamp2Utilisee: boolean;
  aideFactorisationFactorisationUtilisee: boolean;
  aideGrilleTableauUtilisee: boolean;
  /** Bouton "Aide" de l'étape intervalle (prompt-refonte-tableau-signes.md, section 6) : révélation
   * à sens unique (jamais de retour à false pour cet exercice une fois activée — même principe que
   * activerAideIntervalle, sessionInequation.ts), réinitialisée à false au passage à l'exercice
   * suivant. Applique ×0,5 au score final de l'étape intervalle, quel que soit le nombre de
   * tentatives avant/après l'activation. */
  aideUtilisee: boolean;
  resultats: ResultatExerciceSignesProduit[];
  terminee: boolean;
}
