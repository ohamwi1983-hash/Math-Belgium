import type {
  ExerciceCaracteristiquesAlgebriques,
  GenerateurExerciceCaracteristiquesAlgebriques,
  PhaseCaracteristiquesAlgebriques,
} from "../core/caracteristiquesAlgebriques.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * Champs niveau 1 : `scoreSeparation`/`scoreDebarrasser` sont `number | null` — mutuellement
 * exclusifs, chaque famille sautant toujours exactement l'une des deux étapes (jamais les deux à
 * la fois, jamais aucune) ; les 4 autres (`ordonnee`/`ce`/`domaine`/`isolement`) sont toujours des
 * `number`.
 *
 * Champs niveau 2 (`prompt-niveau2caracteristiquesalgebriques.md`, corrigés par
 * `prompt-corrections-niveau2-vague2.md`) — tous `null`/vides pour un exercice niveau 1, ou pour
 * les familles niveau 2 qui n'empruntent pas l'étape correspondante (voir
 * `core/caracteristiquesAlgebriques.types.ts`, doc de `PhaseCaracteristiquesAlgebriques`, pour le
 * détail exact de quelle famille traverse quelle étape) :
 * - `scoreValidite` : `racine_carree`/`valeur_absolue` uniquement — nouvelle catégorie de score
 *   séparée demandée explicitement ("Récapitulatif final" du prompt), jamais fusionnée à `ce` ou
 *   `zeros`.
 * - `scoreRegroupe` : `inverse`/`racine_carree`/`racine_cubique` uniquement — étape "regroupe"
 *   partagée (l'ancienne `elevationCarre`, généralisée à 3 familles ; `carre`/`cube` n'en ont pas
 *   besoin, leur `isolement` joue déjà ce rôle ; `valeur_absolue` non plus, voir
 *   `necessiteRegroupe`). Plus aucun champ `scoreReconnaissance`/`scoreChamp1`/`scoreChamp2`/
 *   `scoreFactorisation` depuis cette 2e vague — l'écran "Zéros — méthode" est entièrement retiré,
 *   l'équation du 2nd degré embarquée ne sert plus qu'en interne (cible de vérification, source des
 *   vraies racines).
 * - `scoresValidationSolution` : tableau (0 à 2 entrées), une par solution/branche validée
 *   Oui/Non — `racine_carree`/`valeur_absolue` uniquement, même principe que
 *   `scoresSigneIrreductible` (exercice "tableau de signes à plusieurs facteurs").
 * - `scoreResolutionBranches` : `valeur_absolue` uniquement (les deux racines de branche).
 * `scoreZeros` est désormais toujours un `number` pour les 6 familles niveau 2 : plus aucune
 * famille ne se clôt ailleurs qu'à l'écran "zéros" (voir `PhaseCaracteristiquesAlgebriques`).
 *
 * Depuis `prompt-corrections-niveau2-vague3.md`, point 2 : pour `racine_carree`, l'étape "zéros"
 * (candidats) précède désormais "validationSolution" plutôt que de la suivre — ce n'est donc plus
 * elle qui clôture l'exercice (c'est la dernière `validationSolution` qui le fait). Son score doit
 * malgré tout être conservé jusqu'à cette clôture différée : `EtatSessionCaracteristiquesAlgebriques`
 * porte pour cela `scoreZerosExercice`/`zerosRevele` (`number | null`/`boolean`, mêmes conventions
 * que les autres scores intermédiaires) — jamais lus pour les 5 autres familles/niveaux, où "zéros"
 * reste la phase terminale qui calcule et clôture en une seule fois, sans jamais transiter par cet
 * état intermédiaire.
 */
export interface ResultatExerciceCaracteristiquesAlgebriques {
  scoreOrdonnee: number;
  ordonneeRevele: boolean;
  scoreCE: number;
  ceRevele: boolean;
  scoreDomaine: number;
  domaineRevele: boolean;
  scoreIsolement: number;
  isolementRevele: boolean;
  scoreSeparation: number | null;
  separationRevele: boolean;
  scoreDebarrasser: number | null;
  debarrasserRevele: boolean;
  scoreValidite: number | null;
  validiteRevele: boolean;
  scoreRegroupe: number | null;
  regroupeRevele: boolean;
  scoresValidationSolution: number[];
  scoreResolutionBranches: number | null;
  resolutionBranchesRevele: boolean;
  scoreZeros: number;
  zerosRevele: boolean;
}

export interface EtatSessionCaracteristiquesAlgebriques {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceCaracteristiquesAlgebriques;
  indexExercice: number;
  exerciceCourant: ExerciceCaracteristiquesAlgebriques;
  phase: PhaseCaracteristiquesAlgebriques;
  etapeCourante: EtatEtapeTentatives;
  scoreOrdonneeExercice: number | null;
  ordonneeRevele: boolean;
  scoreCEExercice: number | null;
  ceRevele: boolean;
  scoreDomaineExercice: number | null;
  domaineRevele: boolean;
  scoreIsolementExercice: number | null;
  isolementRevele: boolean;
  scoreSeparationExercice: number | null;
  separationRevele: boolean;
  scoreDebarrasserExercice: number | null;
  debarrasserRevele: boolean;
  scoreValiditeExercice: number | null;
  validiteRevele: boolean;
  scoreRegroupeExercice: number | null;
  regroupeRevele: boolean;
  scoresValidationSolutionExercice: number[];
  scoreResolutionBranchesExercice: number | null;
  resolutionBranchesRevele: boolean;
  scoreZerosExercice: number | null;
  zerosRevele: boolean;
  resultats: ResultatExerciceCaracteristiquesAlgebriques[];
  terminee: boolean;
}
