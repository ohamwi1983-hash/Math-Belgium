import type { ExerciceDeterminerParametresLogarithme } from "../core6e/determinerParametresLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesDeterminerParametresLogarithme";
import type { EtatSessionDeterminerParametresLogarithme, PhaseDeterminerParametresLogarithme, ResultatExerciceDeterminerParametresLogarithme } from "./typesDeterminerParametresLogarithme";
import type { ReponseDeuxChamps } from "./verificationDeterminerParametresLogarithme";
import {
  verifierAEcran1,
  verifierAEcran2,
  verifierBEcran1,
  verifierBEcran2,
  verifierBEcran3,
  verifierCEcran1,
  verifierCEcran2,
  verifierCEcran3,
} from "./verificationDeterminerParametresLogarithme";

/**
 * Couche B (6e) — moteur de session pour `6gen18`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionDeterminerParametresLogarithme.test.ts` pour la preuve avec des exercices factices
 * définis localement (même principe que `sessionExponentiellesProblemes.ts`, 6gen12).
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (spec explicite pour chaque écran documenté). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceDeterminerParametresLogarithme,
): Pick<EtatSessionDeterminerParametresLogarithme, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionDeterminerParametresLogarithme(
  reglages: ReglagesSession6e,
  generateur: () => ExerciceDeterminerParametresLogarithme,
): EtatSessionDeterminerParametresLogarithme {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionDeterminerParametresLogarithme): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionDeterminerParametresLogarithme): EtatSessionDeterminerParametresLogarithme {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionDeterminerParametresLogarithme, resultat: ResultatExerciceDeterminerParametresLogarithme): EtatSessionDeterminerParametresLogarithme {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function construireResultat(exercice: ExerciceDeterminerParametresLogarithme, scores: Partial<Record<PhaseDeterminerParametresLogarithme, number>>): ResultatExerciceDeterminerParametresLogarithme {
  switch (exercice.famille) {
    case "A":
      return { famille: "A", exercice, scoreEcran1: scores.aEcran1 as number, scoreEcran2: scores.aEcran2 as number };
    case "B":
      return { famille: "B", exercice, scoreEcran1: scores.bEcran1 as number, scoreEcran2: scores.bEcran2 as number, scoreEcran3: scores.bEcran3 as number };
    case "C":
      return { famille: "C", exercice, scoreEcran1: scores.cEcran1 as number, scoreEcran2: scores.cEcran2 as number, scoreEcran3: scores.cEcran3 as number };
  }
}

function avancerPhase<TReponse>(
  etat: EtatSessionDeterminerParametresLogarithme,
  reponse: TReponse,
  verifier: (exercice: ExerciceDeterminerParametresLogarithme, reponse: TReponse) => boolean,
  phaseAttendue: PhaseDeterminerParametresLogarithme,
): EtatSessionDeterminerParametresLogarithme {
  if (etat.terminee) throw new Error("soumettreReponse : la session est déjà terminée");
  if (etat.phase !== phaseAttendue) throw new Error(`soumettreReponse : attendu à la phase "${phaseAttendue}", trouvé "${etat.phase}"`);
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<TReponse>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifier(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: score };
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return { ...cloturerExerciceOuSuivant(etat, construireResultat(exercice, scoresPartiels)), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}

// ============================================================================
// Famille A.
// ============================================================================

export function soumettreReponseAEcran1(etat: EtatSessionDeterminerParametresLogarithme, reponse: ReponseDeuxChamps): EtatSessionDeterminerParametresLogarithme {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "A" ? verifierAEcran1(e, r) : false), "aEcran1");
}
export function soumettreReponseAEcran2(etat: EtatSessionDeterminerParametresLogarithme, reponse: ReponseDeuxChamps): EtatSessionDeterminerParametresLogarithme {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "A" ? verifierAEcran2(e, r) : false), "aEcran2");
}

// ============================================================================
// Famille B.
// ============================================================================

export function soumettreReponseBEcran1(etat: EtatSessionDeterminerParametresLogarithme, reponse: ReponseDeuxChamps): EtatSessionDeterminerParametresLogarithme {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "B" ? verifierBEcran1(e, r) : false), "bEcran1");
}
export function soumettreReponseBEcran2(etat: EtatSessionDeterminerParametresLogarithme, texte: string): EtatSessionDeterminerParametresLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBEcran2(e, r) : false), "bEcran2");
}
export function soumettreReponseBEcran3(etat: EtatSessionDeterminerParametresLogarithme, reponse: ReponseDeuxChamps): EtatSessionDeterminerParametresLogarithme {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "B" ? verifierBEcran3(e, r) : false), "bEcran3");
}

// ============================================================================
// Famille C.
// ============================================================================

export function soumettreReponseCEcran1(etat: EtatSessionDeterminerParametresLogarithme, texte: string): EtatSessionDeterminerParametresLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCEcran1(e, r) : false), "cEcran1");
}
export function soumettreReponseCEcran2(etat: EtatSessionDeterminerParametresLogarithme, texte: string): EtatSessionDeterminerParametresLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCEcran2(e, r) : false), "cEcran2");
}
export function soumettreReponseCEcran3(etat: EtatSessionDeterminerParametresLogarithme, texte: string): EtatSessionDeterminerParametresLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCEcran3(e, r) : false), "cEcran3");
}
