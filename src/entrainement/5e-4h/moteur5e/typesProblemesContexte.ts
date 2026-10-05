/**
 * Couche B (5e) — types pour 5gen5 ("Problèmes-contexte"). 3 scénarios FIXES et DISTINCTS (A/B/C,
 * voir CLAUDE.md section 5gen5) — jamais unifiés : chaque écran garde son propre nom de phase
 * (aucune collision entre scénarios), `phaseInitiale` aiguille sur `exercice.scenario`.
 * `ResultatExerciceProblemeContexte` est une union discriminée par `scenario` — chaque variante
 * n'expose que les scores réellement produits par SA séquence d'écrans.
 */
import type { ComboScenarioA, ExerciceProblemeContexte, ExerciceScenarioA, ExerciceScenarioB, ExerciceScenarioC, GenerateurExerciceProblemeContexte } from "../core5e/problemesContexte.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseProblemeContexte =
  // Scénario A, combo "kInverseXAxCarre" (référence) — 5 écrans
  | "tableau"
  | "generalisation"
  | "egaliteAires"
  | "graphique"
  | "justification"
  // Scénario A, combos réduits (2-5) — 3 écrans, jamais de grandeur liée artificielle
  | "generalisationSimple"
  | "intersectionSimple"
  | "extremumSimple"
  // Scénario B — 4 écrans
  | "systeme"
  | "resolution"
  | "formule"
  | "evaluation"
  // Scénario C — 5 écrans
  | "lecture"
  | "coutMoyen"
  | "reconnaissance"
  | "benefice"
  | "seuil";

export function phaseInitiale(exercice: ExerciceProblemeContexte): PhaseProblemeContexte {
  if (exercice.scenario === "A") return exercice.combo === "kInverseXAxCarre" ? "tableau" : "generalisationSimple";
  if (exercice.scenario === "B") return "systeme";
  return "lecture";
}

export interface ResultatScenarioAConteneur {
  scenario: "A";
  combo: "kInverseXAxCarre";
  exercice: Extract<ExerciceScenarioA, { combo: "kInverseXAxCarre" }>;
  scoreTableau: number;
  tableauRevele: boolean;
  scoreGeneralisation: number;
  generalisationRevele: boolean;
  scoreEgaliteAires: number;
  egaliteAiresRevele: boolean;
  scoreGraphique: number;
  graphiqueRevele: boolean;
  /** Continuité — la valeur RETENUE (réponse élève si correcte, sinon `exercice.xOptimal` en cas
   * de révélation), utilisée pour calculer le h attendu à l'écran "justification". */
  xOptimalRetenu: number;
  scoreJustification: number;
  justificationRevele: boolean;
}

/** Combos 2-5 — flux réduit à 3 écrans (généralisation → intersection → extremum), aucune valeur
 * RETENUE par continuité (les 3 écrans sont indépendants, contrairement au combo de référence). */
export interface ResultatScenarioAReduit {
  scenario: "A";
  combo: Exclude<ComboScenarioA, "kInverseXAxCarre">;
  exercice: Exclude<ExerciceScenarioA, { combo: "kInverseXAxCarre" }>;
  scoreGeneralisationSimple: number;
  generalisationSimpleRevele: boolean;
  scoreIntersectionSimple: number;
  intersectionSimpleRevele: boolean;
  scoreExtremumSimple: number;
  extremumSimpleRevele: boolean;
}

export type ResultatScenarioA = ResultatScenarioAConteneur | ResultatScenarioAReduit;

export interface ResultatScenarioB {
  scenario: "B";
  exercice: ExerciceScenarioB;
  scoreSysteme: number;
  systemeRevele: boolean;
  scoreResolution: number;
  resolutionRevele: boolean;
  /** Continuité — a/b RETENUS (réponse élève si correcte, sinon les valeurs canoniques de
   * l'exercice en cas de révélation), utilisés pour calculer l'attendu des écrans suivants. */
  aRetenu: number;
  bRetenu: number;
  scoreFormule: number;
  formuleRevele: boolean;
  scoreEvaluation: number;
  evaluationRevele: boolean;
}

export interface ResultatScenarioC {
  scenario: "C";
  exercice: ExerciceScenarioC;
  scoreLecture: number;
  lectureRevele: boolean;
  scoreCoutMoyen: number;
  coutMoyenRevele: boolean;
  scoreReconnaissance: number;
  reconnaissanceRevele: boolean;
  scoreBenefice: number;
  beneficeRevele: boolean;
  scoreSeuil: number;
  seuilRevele: boolean;
}

export type ResultatExerciceProblemeContexte = ResultatScenarioA | ResultatScenarioB | ResultatScenarioC;

export interface EtatSessionProblemeContexte {
  reglages: ReglagesSession5e;
  generateur: GenerateurExerciceProblemeContexte;
  exerciceCourant: ExerciceProblemeContexte;
  phase: PhaseProblemeContexte;
  etapeCourante: EtatEtapeTentatives;
  /** Remis à 0 à chaque transition de phase (même principe que `sessionComposeeGraphique.ts`) —
   * jamais un compteur séparé par écran, les phases ne sont jamais revisitées. */
  niveauAide: number;
  indexExercice: number;
  resultats: ResultatExerciceProblemeContexte[];
  terminee: boolean;

  // Scénario A — accumulation progressive au fil des écrans.
  scoreTableauExercice: number | null;
  tableauRevele: boolean;
  scoreGeneralisationExercice: number | null;
  generalisationRevele: boolean;
  scoreEgaliteAiresExercice: number | null;
  egaliteAiresRevele: boolean;
  scoreGraphiqueExercice: number | null;
  graphiqueRevele: boolean;
  xOptimalRetenu: number | null;

  // Scénario A, combos réduits (2-5) — accumulation progressive au fil des écrans.
  scoreGeneralisationSimpleExercice: number | null;
  generalisationSimpleRevele: boolean;
  scoreIntersectionSimpleExercice: number | null;
  intersectionSimpleRevele: boolean;

  // Scénario B — accumulation progressive au fil des écrans.
  scoreSystemeExercice: number | null;
  systemeRevele: boolean;
  scoreResolutionExercice: number | null;
  resolutionRevele: boolean;
  aRetenu: number | null;
  bRetenu: number | null;
  scoreFormuleExercice: number | null;
  formuleRevele: boolean;

  // Scénario C — accumulation progressive au fil des écrans.
  scoreLectureExercice: number | null;
  lectureRevele: boolean;
  scoreCoutMoyenExercice: number | null;
  coutMoyenRevele: boolean;
  scoreReconnaissanceExercice: number | null;
  reconnaissanceRevele: boolean;
  scoreBeneficeExercice: number | null;
  beneficeRevele: boolean;
}
