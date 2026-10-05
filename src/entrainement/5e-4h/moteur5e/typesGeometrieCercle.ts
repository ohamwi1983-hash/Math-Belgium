/**
 * Couche B (5e) — types pour 5gen12 ("Problèmes de géométrie du cercle"). 3 séquences de phases
 * STRUCTURELLEMENT DISJOINTES (une table `ORDRE_PHASES` par scénario, jamais un seul ordre
 * générique) — chaque exercice ne traverse QUE la séquence de son propre `scenario`. Les scénarios
 * `terrainJeu` (A2) et `fragmentPlat` (A4) ont été supprimés (voir historique-5e-trigonometrie.md).
 *
 * `ResultatExerciceGeometrieCercle` est une union discriminée par `scenario` (3 formes de score
 * différentes — 4 à 9 champs selon le scénario) — même principe que
 * `ResultatExerciceEquationTrigonometrique` (5gen10) ou `ResultatExerciceProblemeContexte` (5gen5).
 */
import type { ExerciceGeometrieCercle, ExerciceLentille, ExerciceSecteurBalaye, ExerciceSegmentCirculaire, ScenarioGeometrieCercle } from "../core5e/geometrieCercle.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseGeometrieCercle =
  // secteurBalaye (A1)
  | "conversionRad"
  | "aireGrandSecteur"
  | "airePetitSecteur"
  | "aireBalayee"
  // segmentCirculaire (A3)
  | "angleTheta"
  | "aireSecteur"
  | "aireTriangle"
  | "aireSegment"
  // lentille (A3b)
  | "angle1"
  | "secteur1"
  | "triangle1"
  | "segmentAire1"
  | "angle2"
  | "secteur2"
  | "triangle2"
  | "segmentAire2"
  | "aireLentille";

const ORDRE_PHASES: Record<ScenarioGeometrieCercle, PhaseGeometrieCercle[]> = {
  secteurBalaye: ["conversionRad", "aireGrandSecteur", "airePetitSecteur", "aireBalayee"],
  segmentCirculaire: ["angleTheta", "aireSecteur", "aireTriangle", "aireSegment"],
  lentille: ["angle1", "secteur1", "triangle1", "segmentAire1", "angle2", "secteur2", "triangle2", "segmentAire2", "aireLentille"],
};

export function phaseInitiale(exercice: ExerciceGeometrieCercle): PhaseGeometrieCercle {
  return ORDRE_PHASES[exercice.scenario][0];
}

export function phaseApres(exercice: ExerciceGeometrieCercle, phase: PhaseGeometrieCercle): PhaseGeometrieCercle | "termine" {
  const ordre = ORDRE_PHASES[exercice.scenario];
  const index = ordre.indexOf(phase);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatSecteurBalaye {
  scenario: "secteurBalaye";
  exercice: ExerciceSecteurBalaye;
  scoreConversionRad: number;
  scoreAireGrandSecteur: number;
  scoreAirePetitSecteur: number;
  scoreAireBalayee: number;
}

export interface ResultatSegmentCirculaire {
  scenario: "segmentCirculaire";
  exercice: ExerciceSegmentCirculaire;
  scoreAngleTheta: number;
  scoreAireSecteur: number;
  scoreAireTriangle: number;
  scoreAireSegment: number;
}

export interface ResultatLentille {
  scenario: "lentille";
  exercice: ExerciceLentille;
  scoreAngle1: number;
  scoreSecteur1: number;
  scoreTriangle1: number;
  scoreSegmentAire1: number;
  scoreAngle2: number;
  scoreSecteur2: number;
  scoreTriangle2: number;
  scoreSegmentAire2: number;
  scoreAireLentille: number;
}

export type ResultatExerciceGeometrieCercle = ResultatSecteurBalaye | ResultatSegmentCirculaire | ResultatLentille;

export interface EtatSessionGeometrieCercle {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceGeometrieCercle;
  exerciceCourant: ExerciceGeometrieCercle;
  phase: PhaseGeometrieCercle;
  etapeCourante: EtatEtapeTentatives;
  /** Remis à 0 à chaque transition de phase (même principe que le reste du chantier 5e). */
  niveauAide: number;
  /** Scores déjà clos pour l'exercice en cours, indexés par phase — le SET de phases réellement
   * scoré varie structurellement d'un scénario à l'autre (4 à 9 phases), donc un `Partial<Record>`
   * reste ici la modélisation la plus honnête (même principe que `ResultatExerciceDeuxVersTrois`,
   * 5gen6) — assemblé en `ResultatExerciceGeometrieCercle` (une forme fixe par scénario) une fois
   * la dernière phase de la séquence atteinte. */
  scoresPartiels: Partial<Record<PhaseGeometrieCercle, number>>;
  indexExercice: number;
  resultats: ResultatExerciceGeometrieCercle[];
  terminee: boolean;
  /** A.1 (bug de couleur récap à closure figée) — capture `revele` de la DERNIÈRE étape close
   * (soumission réussie ou révélation après tentatives épuisées) au moment précis de la transition,
   * jamais dérivée après coup de `etapeCourante.revelee` (qui redémarre à `false` dès la phase
   * suivante) — voir le patron de référence `derniereEtapeRevelee`/`sessionEquationTrig.ts` (5gen10,
   * commit `122064a`), répliqué ici à l'identique. */
  derniereEtapeRevelee: boolean;
}
