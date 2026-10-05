/**
 * Couche B — moteur de session pour "Orthogonalité et théorème de Pythagore généralisé" (chapitre
 * "Calcul vectoriel"), réécriture complète (`promptcreationgenerateur25orthogonalitepythagore.md`).
 * N'importe jamais rien de src/generateurs — voir sessionOrthogonalite.test.ts pour la preuve avec
 * des générateurs factices.
 *
 * Chaque variante traverse une SÉQUENCE FIXE et disjointe des autres (`SEQUENCES`,
 * `typesOrthogonalite.ts`) — `soumettrePhase` (privée) factorise le motif commun (tentatives,
 * pénalité additive par niveau d'aide, transition vers l'écran suivant ou clôture de l'exercice) ;
 * chaque `soumettreReponseXxx` exporté n'est qu'un thin wrapper typé par écran.
 */
import type { ExerciceOrthogonalite, GenerateurExerciceOrthogonalite, Sommet } from "../core/orthogonalite.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import {
  type ReponseConclusionTriangle,
  type ReponseConstructionAvecXTriangle,
  type ReponseConstructionTriangle,
  type ReponseIdentificationResolution,
  type ReponseTest,
  verifierConclusionTriangle,
  verifierConstructionAvecXTriangle,
  verifierConstructionTriangle,
  verifierIdentificationResolution,
  verifierReductionParametre,
  verifierReductionSommet,
  verifierResolutionParametre,
  verifierTest,
  verifierTestSommetTriangle,
} from "./verificationOrthogonalite";
import { NIVEAU_AIDE_MAX, SEQUENCES } from "./typesOrthogonalite";
import type { EtatSessionOrthogonalite, PhaseOrthogonalite, ResultatExerciceOrthogonalite, ScoreEcran } from "./typesOrthogonalite";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

function phaseInitiale(exercice: ExerciceOrthogonalite): PhaseOrthogonalite {
  return SEQUENCES[exercice.variante][0];
}

function phaseSuivante(exercice: ExerciceOrthogonalite, phaseActuelle: PhaseOrthogonalite): PhaseOrthogonalite | null {
  const sequence = SEQUENCES[exercice.variante];
  const index = sequence.indexOf(phaseActuelle);
  return index + 1 < sequence.length ? sequence[index + 1] : null;
}

function etatInitial(
  exercice: ExerciceOrthogonalite,
): Pick<EtatSessionOrthogonalite, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresAccumules"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(exercice),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules: {},
  };
}

export function demarrerSessionOrthogonalite(reglages: ReglagesSession, generateur: GenerateurExerciceOrthogonalite): EtatSessionOrthogonalite {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionOrthogonalite): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Pénalité additive, jamais sous 0 — un cran de plus retire toujours 20 points supplémentaires. */
function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

/** Révèle le niveau d'aide suivant de l'écran courant — lève si la session est terminée, ou si le
 * niveau maximal de l'écran courant est déjà atteint (rien de plus à révéler). */
export function activerAideSuivante(etat: EtatSessionOrthogonalite): EtatSessionOrthogonalite {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  const max = NIVEAU_AIDE_MAX[etat.phase];
  if (etat.niveauAide >= max) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function champVide(): { score: number | null; revele: boolean; niveauAide: number } {
  return { score: null, revele: false, niveauAide: 0 };
}

function champ(scoresAccumules: Partial<Record<PhaseOrthogonalite, ScoreEcran>>, phase: PhaseOrthogonalite) {
  return scoresAccumules[phase] ?? champVide();
}

function construireResultat(
  exercice: ExerciceOrthogonalite,
  scoresAccumules: Partial<Record<PhaseOrthogonalite, ScoreEcran>>,
): ResultatExerciceOrthogonalite {
  const test = champ(scoresAccumules, "test");
  const reductionParametre = champ(scoresAccumules, "reductionParametre");
  const resolutionParametre = champ(scoresAccumules, "resolutionParametre");
  const constructionTriangle = champ(scoresAccumules, "constructionTriangle");
  const testSommetA = champ(scoresAccumules, "testSommetA");
  const testSommetB = champ(scoresAccumules, "testSommetB");
  const testSommetC = champ(scoresAccumules, "testSommetC");
  const conclusionTriangle = champ(scoresAccumules, "conclusionTriangle");
  const constructionAvecX = champ(scoresAccumules, "constructionAvecX");
  const reductionSommetA = champ(scoresAccumules, "reductionSommetA");
  const reductionSommetB = champ(scoresAccumules, "reductionSommetB");
  const reductionSommetC = champ(scoresAccumules, "reductionSommetC");
  const identificationResolution = champ(scoresAccumules, "identificationResolution");

  return {
    variante: exercice.variante,
    scoreTest: test.score,
    testRevele: test.revele,
    niveauAideTest: test.niveauAide,
    scoreReductionParametre: reductionParametre.score,
    reductionParametreRevele: reductionParametre.revele,
    niveauAideReductionParametre: reductionParametre.niveauAide,
    scoreResolutionParametre: resolutionParametre.score,
    resolutionParametreRevele: resolutionParametre.revele,
    niveauAideResolutionParametre: resolutionParametre.niveauAide,
    scoreConstructionTriangle: constructionTriangle.score,
    constructionTriangleRevele: constructionTriangle.revele,
    niveauAideConstructionTriangle: constructionTriangle.niveauAide,
    scoreTestSommetA: testSommetA.score,
    testSommetARevele: testSommetA.revele,
    niveauAideTestSommetA: testSommetA.niveauAide,
    scoreTestSommetB: testSommetB.score,
    testSommetBRevele: testSommetB.revele,
    niveauAideTestSommetB: testSommetB.niveauAide,
    scoreTestSommetC: testSommetC.score,
    testSommetCRevele: testSommetC.revele,
    niveauAideTestSommetC: testSommetC.niveauAide,
    scoreConclusionTriangle: conclusionTriangle.score,
    conclusionTriangleRevele: conclusionTriangle.revele,
    niveauAideConclusionTriangle: conclusionTriangle.niveauAide,
    scoreConstructionAvecX: constructionAvecX.score,
    constructionAvecXRevele: constructionAvecX.revele,
    niveauAideConstructionAvecX: constructionAvecX.niveauAide,
    scoreReductionSommetA: reductionSommetA.score,
    reductionSommetARevele: reductionSommetA.revele,
    niveauAideReductionSommetA: reductionSommetA.niveauAide,
    scoreReductionSommetB: reductionSommetB.score,
    reductionSommetBRevele: reductionSommetB.revele,
    niveauAideReductionSommetB: reductionSommetB.niveauAide,
    scoreReductionSommetC: reductionSommetC.score,
    reductionSommetCRevele: reductionSommetC.revele,
    niveauAideReductionSommetC: reductionSommetC.niveauAide,
    scoreIdentificationResolution: identificationResolution.score,
    identificationResolutionRevele: identificationResolution.revele,
    niveauAideIdentificationResolution: identificationResolution.niveauAide,
  };
}

function cloturerExerciceOuSuivant(etat: EtatSessionOrthogonalite, resultat: ResultatExerciceOrthogonalite): EtatSessionOrthogonalite {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    ...etatInitial(etat.generateur()),
  };
}

/** Factorise le motif commun à tous les écrans : tentatives, pénalité additive par niveau d'aide,
 * transition vers l'écran suivant de la séquence de la variante, ou clôture de l'exercice si
 * `phaseAttendue` est la dernière de sa séquence. */
function soumettrePhase<R>(
  etat: EtatSessionOrthogonalite,
  phaseAttendue: PhaseOrthogonalite,
  reponse: R,
  verifier: (reponse: R) => boolean,
): EtatSessionOrthogonalite {
  if (etat.terminee || etat.phase !== phaseAttendue) {
    throw new Error(`soumettrePhase(${phaseAttendue}) : la session n'est pas à cette étape`);
  }

  const etapeCourante = soumettreEtapeTentatives<R>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const scoresAccumules: Partial<Record<PhaseOrthogonalite, ScoreEcran>> = {
    ...etat.scoresAccumules,
    [phaseAttendue]: { score, revele: etapeCourante.revelee, niveauAide: etat.niveauAide },
  };

  const suivante = phaseSuivante(etat.exerciceCourant, phaseAttendue);
  if (suivante === null) {
    return cloturerExerciceOuSuivant(etat, construireResultat(etat.exerciceCourant, scoresAccumules));
  }

  return { ...etat, etapeCourante: demarrerEtapeTentatives(), phase: suivante, niveauAide: 0, scoresAccumules };
}

// ============================================================================
// Un wrapper par écran — voir `verificationOrthogonalite.ts` pour la logique de vérification
// ============================================================================

export function soumettreReponseTest(etat: EtatSessionOrthogonalite, reponse: ReponseTest): EtatSessionOrthogonalite {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "test") throw new Error("soumettreReponseTest : réservé à la variante 'test'");
  return soumettrePhase(etat, "test", reponse, (r) => verifierTest(exercice, r));
}

/** Depuis `promptcorrectionsgenerateur25lot3.md`, point 1 : un seul champ de saisie libre pour
 * l'équation réduite complète (mêmes principes que `soumettreReponseReductionSommet`, V4). */
export function soumettreReponseReductionParametre(etat: EtatSessionOrthogonalite, texte: string): EtatSessionOrthogonalite {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "parametre") throw new Error("soumettreReponseReductionParametre : réservé à la variante 'parametre'");
  return soumettrePhase(etat, "reductionParametre", texte, (r) => verifierReductionParametre(exercice, r));
}

export function soumettreReponseResolutionParametre(etat: EtatSessionOrthogonalite, valeur: number): EtatSessionOrthogonalite {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "parametre") throw new Error("soumettreReponseResolutionParametre : réservé à la variante 'parametre'");
  return soumettrePhase(etat, "resolutionParametre", valeur, (v) => verifierResolutionParametre(exercice, v));
}

export function soumettreReponseConstructionTriangle(etat: EtatSessionOrthogonalite, reponse: ReponseConstructionTriangle): EtatSessionOrthogonalite {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "triangle") throw new Error("soumettreReponseConstructionTriangle : réservé à la variante 'triangle'");
  return soumettrePhase(etat, "constructionTriangle", reponse, (r) => verifierConstructionTriangle(exercice, r));
}

const PHASE_PAR_SOMMET: Record<Sommet, "testSommetA" | "testSommetB" | "testSommetC"> = {
  A: "testSommetA",
  B: "testSommetB",
  C: "testSommetC",
};

export function soumettreReponseTestSommet(etat: EtatSessionOrthogonalite, sommet: Sommet, valeur: number): EtatSessionOrthogonalite {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "triangle") throw new Error("soumettreReponseTestSommet : réservé à la variante 'triangle'");
  return soumettrePhase(etat, PHASE_PAR_SOMMET[sommet], valeur, (v) => verifierTestSommetTriangle(exercice, sommet, v));
}

export function soumettreReponseConclusionTriangle(etat: EtatSessionOrthogonalite, reponse: ReponseConclusionTriangle): EtatSessionOrthogonalite {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "triangle") throw new Error("soumettreReponseConclusionTriangle : réservé à la variante 'triangle'");
  return soumettrePhase(etat, "conclusionTriangle", reponse, (r) => verifierConclusionTriangle(exercice, r));
}

export function soumettreReponseConstructionAvecXTriangle(
  etat: EtatSessionOrthogonalite,
  reponse: ReponseConstructionAvecXTriangle,
): EtatSessionOrthogonalite {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "triangleParametre") throw new Error("soumettreReponseConstructionAvecXTriangle : réservé à la variante 'triangleParametre'");
  return soumettrePhase(etat, "constructionAvecX", reponse, (r) => verifierConstructionAvecXTriangle(exercice, r));
}

const PHASE_REDUCTION_PAR_SOMMET: Record<Sommet, "reductionSommetA" | "reductionSommetB" | "reductionSommetC"> = {
  A: "reductionSommetA",
  B: "reductionSommetB",
  C: "reductionSommetC",
};

/** Écran "réduction" d'un sommet (variante 4) — UN SEUL champ de saisie libre attendant l'équation
 * réduite complète (`promptcorrectionsgenerateur25complet.md`, points 5-6), jamais 2/3 champs
 * numériques séparés selon le degré. */
export function soumettreReponseReductionSommet(etat: EtatSessionOrthogonalite, sommet: Sommet, texte: string): EtatSessionOrthogonalite {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "triangleParametre") throw new Error("soumettreReponseReductionSommet : réservé à la variante 'triangleParametre'");
  return soumettrePhase(etat, PHASE_REDUCTION_PAR_SOMMET[sommet], texte, (t) => verifierReductionSommet(exercice, sommet, t));
}

export function soumettreReponseIdentificationResolution(
  etat: EtatSessionOrthogonalite,
  reponse: ReponseIdentificationResolution,
): EtatSessionOrthogonalite {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "triangleParametre") throw new Error("soumettreReponseIdentificationResolution : réservé à la variante 'triangleParametre'");
  return soumettrePhase(etat, "identificationResolution", reponse, (r) => verifierIdentificationResolution(exercice, r));
}
