/**
 * Couche B (5e) — moteur de session pour 5gen5 ("Problèmes-contexte"). N'importe jamais rien de
 * `src/generateurs5e/` — voir `sessionProblemesContexte.test.ts` pour la preuve avec des exercices
 * factices définis localement (3 scénarios, un par test).
 *
 * 3 séquences FIXES et DISJOINTES selon `exercice.scenario` (`phaseInitiale`,
 * `typesProblemesContexte.ts`) — jamais de saut conditionnel À L'INTÉRIEUR d'un scénario, toutes
 * ses phases sont toujours traversées. Aide progressive additive par écran (-20 pts/niveau), un
 * seul compteur `niveauAide` remis à 0 à chaque transition de phase (même principe que
 * `sessionComposeeGraphique.ts`, les phases n'étant jamais revisitées).
 *
 * Mécanisme de CONTINUITÉ (scénarios A et B, même principe que gen47 côté 4e) : une fois une phase
 * clôturée, la valeur RETENUE pour les calculs des phases suivantes est la réponse de l'élève si
 * elle est correcte, sinon la valeur canonique de l'exercice en cas de révélation (tentatives
 * épuisées) — jamais la dernière saisie erronée de l'élève, qui produirait des attendus
 * incohérents en aval.
 */
import type { ExerciceProblemeContexte, GenerateurExerciceProblemeContexte } from "../core5e/problemesContexte.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseInitiale } from "./typesProblemesContexte";
import type { EtatSessionProblemeContexte, PhaseProblemeContexte, ResultatExerciceProblemeContexte } from "./typesProblemesContexte";
import type {
  ReponseEvaluationB,
  ReponseGeneralisationA,
  ReponseGeneralisationSimpleA,
  ReponseJustificationA,
  ReponseLectureC,
  ReponseReconnaissanceC,
  ReponseResolutionB,
  ReponseSystemeB,
  ReponseTableauA,
} from "./verificationProblemesContexte";
import {
  verifierBeneficeC,
  verifierCoutMoyenC,
  verifierEgaliteAiresA,
  verifierEvaluationB,
  verifierExtremumSimpleA,
  verifierFormuleB,
  verifierGeneralisationA,
  verifierGeneralisationSimpleA,
  verifierGraphiqueA,
  verifierIntersectionSimpleA,
  verifierJustificationA,
  verifierLectureC,
  verifierReconnaissanceC,
  verifierResolutionB,
  verifierSeuilC,
  verifierSystemeB,
  verifierTableauA,
} from "./verificationProblemesContexte";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** B.3 (`promptcorrectionsround2.md`) — 9 des 14 écrans déclaraient `2` alors qu'un seul texte
 * d'aide (`TEXTE_AIDE_XXX_1`, `ui5e/formatProblemesContexte.ts`) existe réellement pour chacun :
 * le bouton "Aide supplémentaire" restait cliquable une 2e fois sans jamais rien afficher de
 * nouveau, tout en infligeant la pénalité de -20 points comme s'il avait révélé un vrai contenu.
 * Plafond réduit à `1` pour ces 9 écrans (`tableau` reste à `2`, seul écran avec un authentique
 * 2e palier, `TEXTE_AIDE_TABLEAU_A_2`) — même convention "le plafond suit le contenu réellement
 * disponible" que la règle "max=0 → pas de bouton" déjà établie ailleurs sur la plateforme. */
const NIVEAU_AIDE_MAX: Record<PhaseProblemeContexte, number> = {
  tableau: 2,
  /** Repassé à 2 (D.1, `promptcorrectionsround2.md`) : `latexAideGeneralisationA2{H,F,G}` a été
   * réécrit en 3 blocs h/f/g qui rappellent chacun la relation à utiliser SANS donner la forme
   * finale (contrairement à l'ancienne version, qui donnait directement h(x)=V/(πx²) et f(x)=2V/x
   * — la réponse exacte de l'écran — d'où le plafonnement à 1 décidé lors de l'audit B.3). Le
   * niveau 2 a désormais un vrai contenu pédagogique distinct du niveau 1, plus une raison de le
   * masquer. */
  generalisation: 2,
  egaliteAires: 1,
  graphique: 1,
  justification: 1,
  generalisationSimple: 1,
  intersectionSimple: 1,
  extremumSimple: 1,
  systeme: 1,
  resolution: 1,
  formule: 1,
  evaluation: 1,
  lecture: 1,
  coutMoyen: 1,
  reconnaissance: 1,
  benefice: 1,
  seuil: 1,
};

export function niveauAideMaxPhase(phase: PhaseProblemeContexte): number {
  return NIVEAU_AIDE_MAX[phase];
}

function etatInitial(
  exercice: ExerciceProblemeContexte,
): Pick<
  EtatSessionProblemeContexte,
  | "exerciceCourant"
  | "phase"
  | "etapeCourante"
  | "niveauAide"
  | "scoreTableauExercice"
  | "tableauRevele"
  | "scoreGeneralisationExercice"
  | "generalisationRevele"
  | "scoreEgaliteAiresExercice"
  | "egaliteAiresRevele"
  | "scoreGraphiqueExercice"
  | "graphiqueRevele"
  | "xOptimalRetenu"
  | "scoreGeneralisationSimpleExercice"
  | "generalisationSimpleRevele"
  | "scoreIntersectionSimpleExercice"
  | "intersectionSimpleRevele"
  | "scoreSystemeExercice"
  | "systemeRevele"
  | "scoreResolutionExercice"
  | "resolutionRevele"
  | "aRetenu"
  | "bRetenu"
  | "scoreFormuleExercice"
  | "formuleRevele"
  | "scoreLectureExercice"
  | "lectureRevele"
  | "scoreCoutMoyenExercice"
  | "coutMoyenRevele"
  | "scoreReconnaissanceExercice"
  | "reconnaissanceRevele"
  | "scoreBeneficeExercice"
  | "beneficeRevele"
> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(exercice),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoreTableauExercice: null,
    tableauRevele: false,
    scoreGeneralisationExercice: null,
    generalisationRevele: false,
    scoreEgaliteAiresExercice: null,
    egaliteAiresRevele: false,
    scoreGraphiqueExercice: null,
    graphiqueRevele: false,
    xOptimalRetenu: null,
    scoreGeneralisationSimpleExercice: null,
    generalisationSimpleRevele: false,
    scoreIntersectionSimpleExercice: null,
    intersectionSimpleRevele: false,
    scoreSystemeExercice: null,
    systemeRevele: false,
    scoreResolutionExercice: null,
    resolutionRevele: false,
    aRetenu: null,
    bRetenu: null,
    scoreFormuleExercice: null,
    formuleRevele: false,
    scoreLectureExercice: null,
    lectureRevele: false,
    scoreCoutMoyenExercice: null,
    coutMoyenRevele: false,
    scoreReconnaissanceExercice: null,
    reconnaissanceRevele: false,
    scoreBeneficeExercice: null,
    beneficeRevele: false,
  };
}

export function demarrerSessionProblemeContexte(reglages: ReglagesSession5e, generateur: GenerateurExerciceProblemeContexte): EtatSessionProblemeContexte {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionProblemeContexte): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionProblemeContexte): EtatSessionProblemeContexte {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxPhase(etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionProblemeContexte, resultat: ResultatExerciceProblemeContexte): EtatSessionProblemeContexte {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

// ============================================================================
// Scénario A — tableau → generalisation → egaliteAires → graphique → justification
// ============================================================================

function assertPhaseEtScenario(etat: EtatSessionProblemeContexte, phase: PhaseProblemeContexte, scenario: ExerciceProblemeContexte["scenario"], nomFonction: string) {
  if (etat.terminee || etat.phase !== phase || etat.exerciceCourant.scenario !== scenario) {
    throw new Error(`${nomFonction} : la session n'est pas à l'étape "${phase}" du scénario ${scenario}`);
  }
}

export function soumettreReponseTableauA(etat: EtatSessionProblemeContexte, reponse: ReponseTableauA): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "tableau", "A", "soumettreReponseTableauA");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "A" || exercice.combo !== "kInverseXAxCarre") throw new Error("soumettreReponseTableauA : exercice inattendu");

  const etapeCourante = soumettreEtapeTentatives<ReponseTableauA>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierTableauA(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "generalisation",
    scoreTableauExercice: score,
    tableauRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseGeneralisationA(etat: EtatSessionProblemeContexte, reponse: ReponseGeneralisationA): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "generalisation", "A", "soumettreReponseGeneralisationA");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "A" || exercice.combo !== "kInverseXAxCarre") throw new Error("soumettreReponseGeneralisationA : exercice inattendu");

  const etapeCourante = soumettreEtapeTentatives<ReponseGeneralisationA>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierGeneralisationA(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "egaliteAires",
    scoreGeneralisationExercice: score,
    generalisationRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseEgaliteAiresA(etat: EtatSessionProblemeContexte, reponse: number): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "egaliteAires", "A", "soumettreReponseEgaliteAiresA");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "A" || exercice.combo !== "kInverseXAxCarre") throw new Error("soumettreReponseEgaliteAiresA : exercice inattendu");

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEgaliteAiresA(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "graphique",
    scoreEgaliteAiresExercice: score,
    egaliteAiresRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseGraphiqueA(etat: EtatSessionProblemeContexte, reponse: number): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "graphique", "A", "soumettreReponseGraphiqueA");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "A" || exercice.combo !== "kInverseXAxCarre") throw new Error("soumettreReponseGraphiqueA : exercice inattendu");

  const reussie = verifierGraphiqueA(exercice, reponse);
  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierGraphiqueA(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  // Continuité : retient la réponse élève SI la toute dernière tentative était correcte, sinon la
  // valeur canonique (révélation) — jamais la dernière saisie erronée.
  const xOptimalRetenu = reussie ? reponse : exercice.xOptimal;
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "justification",
    scoreGraphiqueExercice: score,
    graphiqueRevele: etapeCourante.revelee,
    xOptimalRetenu,
  };
}

export function soumettreReponseJustificationA(etat: EtatSessionProblemeContexte, reponse: ReponseJustificationA): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "justification", "A", "soumettreReponseJustificationA");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "A" || exercice.combo !== "kInverseXAxCarre") throw new Error("soumettreReponseJustificationA : exercice inattendu");
  const xOptimalRetenu = etat.xOptimalRetenu as number;

  const etapeCourante = soumettreEtapeTentatives<ReponseJustificationA>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierJustificationA(exercice, xOptimalRetenu, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return cloturerExerciceOuSuivant(etat, {
    scenario: "A",
    combo: "kInverseXAxCarre",
    exercice,
    scoreTableau: etat.scoreTableauExercice as number,
    tableauRevele: etat.tableauRevele,
    scoreGeneralisation: etat.scoreGeneralisationExercice as number,
    generalisationRevele: etat.generalisationRevele,
    scoreEgaliteAires: etat.scoreEgaliteAiresExercice as number,
    egaliteAiresRevele: etat.egaliteAiresRevele,
    scoreGraphique: etat.scoreGraphiqueExercice as number,
    graphiqueRevele: etat.graphiqueRevele,
    xOptimalRetenu,
    scoreJustification: score,
    justificationRevele: etapeCourante.revelee,
  });
}

// ============================================================================
// Scénario A, combos réduits (2-5) — generalisationSimple → intersectionSimple → extremumSimple.
// Jamais de valeur RETENUE par continuité : les 3 écrans sont indépendants (contrairement au combo
// de référence), chaque attendu se dérive directement des coefficients de `exercice`.
// ============================================================================

export function soumettreReponseGeneralisationSimpleA(etat: EtatSessionProblemeContexte, reponse: ReponseGeneralisationSimpleA): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "generalisationSimple", "A", "soumettreReponseGeneralisationSimpleA");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "A" || exercice.combo === "kInverseXAxCarre") throw new Error("soumettreReponseGeneralisationSimpleA : exercice inattendu");

  const etapeCourante = soumettreEtapeTentatives<ReponseGeneralisationSimpleA>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierGeneralisationSimpleA(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "intersectionSimple",
    scoreGeneralisationSimpleExercice: score,
    generalisationSimpleRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseIntersectionSimpleA(etat: EtatSessionProblemeContexte, reponse: number): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "intersectionSimple", "A", "soumettreReponseIntersectionSimpleA");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "A" || exercice.combo === "kInverseXAxCarre") throw new Error("soumettreReponseIntersectionSimpleA : exercice inattendu");

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierIntersectionSimpleA(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "extremumSimple",
    scoreIntersectionSimpleExercice: score,
    intersectionSimpleRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseExtremumSimpleA(etat: EtatSessionProblemeContexte, reponse: number): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "extremumSimple", "A", "soumettreReponseExtremumSimpleA");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "A" || exercice.combo === "kInverseXAxCarre") throw new Error("soumettreReponseExtremumSimpleA : exercice inattendu");

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierExtremumSimpleA(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return cloturerExerciceOuSuivant(etat, {
    scenario: "A",
    combo: exercice.combo,
    exercice,
    scoreGeneralisationSimple: etat.scoreGeneralisationSimpleExercice as number,
    generalisationSimpleRevele: etat.generalisationSimpleRevele,
    scoreIntersectionSimple: etat.scoreIntersectionSimpleExercice as number,
    intersectionSimpleRevele: etat.intersectionSimpleRevele,
    scoreExtremumSimple: score,
    extremumSimpleRevele: etapeCourante.revelee,
  });
}

// ============================================================================
// Scénario B — systeme → resolution → formule → evaluation
// ============================================================================

export function soumettreReponseSystemeB(etat: EtatSessionProblemeContexte, reponse: ReponseSystemeB): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "systeme", "B", "soumettreReponseSystemeB");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "B") throw new Error("soumettreReponseSystemeB : exercice inattendu");

  const etapeCourante = soumettreEtapeTentatives<ReponseSystemeB>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSystemeB(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "resolution",
    scoreSystemeExercice: score,
    systemeRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseResolutionB(etat: EtatSessionProblemeContexte, reponse: ReponseResolutionB): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "resolution", "B", "soumettreReponseResolutionB");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "B") throw new Error("soumettreReponseResolutionB : exercice inattendu");

  const reussie = verifierResolutionB(exercice, reponse);
  const etapeCourante = soumettreEtapeTentatives<ReponseResolutionB>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierResolutionB(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const aRetenu = reussie ? reponse.a : exercice.aArrondiAttendu;
  const bRetenu = reussie ? reponse.b : exercice.bArrondiAttendu;
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "formule",
    scoreResolutionExercice: score,
    resolutionRevele: etapeCourante.revelee,
    aRetenu,
    bRetenu,
  };
}

export function soumettreReponseFormuleB(etat: EtatSessionProblemeContexte, reponse: string): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "formule", "B", "soumettreReponseFormuleB");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "B") throw new Error("soumettreReponseFormuleB : exercice inattendu");
  const aRetenu = etat.aRetenu as number;
  const bRetenu = etat.bRetenu as number;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFormuleB(r, exercice.modele, aRetenu, bRetenu),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "evaluation",
    scoreFormuleExercice: score,
    formuleRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseEvaluationB(etat: EtatSessionProblemeContexte, reponse: ReponseEvaluationB): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "evaluation", "B", "soumettreReponseEvaluationB");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "B") throw new Error("soumettreReponseEvaluationB : exercice inattendu");
  const aRetenu = etat.aRetenu as number;
  const bRetenu = etat.bRetenu as number;

  const etapeCourante = soumettreEtapeTentatives<ReponseEvaluationB>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEvaluationB(exercice, aRetenu, bRetenu, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return cloturerExerciceOuSuivant(etat, {
    scenario: "B",
    exercice,
    scoreSysteme: etat.scoreSystemeExercice as number,
    systemeRevele: etat.systemeRevele,
    scoreResolution: etat.scoreResolutionExercice as number,
    resolutionRevele: etat.resolutionRevele,
    aRetenu,
    bRetenu,
    scoreFormule: etat.scoreFormuleExercice as number,
    formuleRevele: etat.formuleRevele,
    scoreEvaluation: score,
    evaluationRevele: etapeCourante.revelee,
  });
}

// ============================================================================
// Scénario C — lecture → coutMoyen → reconnaissance → benefice → seuil
// ============================================================================

export function soumettreReponseLectureC(etat: EtatSessionProblemeContexte, reponse: ReponseLectureC): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "lecture", "C", "soumettreReponseLectureC");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "C") throw new Error("soumettreReponseLectureC : exercice inattendu");

  const etapeCourante = soumettreEtapeTentatives<ReponseLectureC>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierLectureC(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "coutMoyen",
    scoreLectureExercice: score,
    lectureRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseCoutMoyenC(etat: EtatSessionProblemeContexte, reponse: number): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "coutMoyen", "C", "soumettreReponseCoutMoyenC");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "C") throw new Error("soumettreReponseCoutMoyenC : exercice inattendu");

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCoutMoyenC(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "reconnaissance",
    scoreCoutMoyenExercice: score,
    coutMoyenRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseReconnaissanceC(etat: EtatSessionProblemeContexte, reponse: ReponseReconnaissanceC): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "reconnaissance", "C", "soumettreReponseReconnaissanceC");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "C") throw new Error("soumettreReponseReconnaissanceC : exercice inattendu");

  const etapeCourante = soumettreEtapeTentatives<ReponseReconnaissanceC>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReconnaissanceC(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "benefice",
    scoreReconnaissanceExercice: score,
    reconnaissanceRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseBeneficeC(etat: EtatSessionProblemeContexte, reponse: number): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "benefice", "C", "soumettreReponseBeneficeC");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "C") throw new Error("soumettreReponseBeneficeC : exercice inattendu");

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierBeneficeC(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: "seuil",
    scoreBeneficeExercice: score,
    beneficeRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseSeuilC(etat: EtatSessionProblemeContexte, reponse: number): EtatSessionProblemeContexte {
  assertPhaseEtScenario(etat, "seuil", "C", "soumettreReponseSeuilC");
  const exercice = etat.exerciceCourant;
  if (exercice.scenario !== "C") throw new Error("soumettreReponseSeuilC : exercice inattendu");

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSeuilC(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return cloturerExerciceOuSuivant(etat, {
    scenario: "C",
    exercice,
    scoreLecture: etat.scoreLectureExercice as number,
    lectureRevele: etat.lectureRevele,
    scoreCoutMoyen: etat.scoreCoutMoyenExercice as number,
    coutMoyenRevele: etat.coutMoyenRevele,
    scoreReconnaissance: etat.scoreReconnaissanceExercice as number,
    reconnaissanceRevele: etat.reconnaissanceRevele,
    scoreBenefice: etat.scoreBeneficeExercice as number,
    beneficeRevele: etat.beneficeRevele,
    scoreSeuil: score,
    seuilRevele: etapeCourante.revelee,
  });
}
