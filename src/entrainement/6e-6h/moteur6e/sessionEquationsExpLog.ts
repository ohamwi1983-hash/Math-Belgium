/**
 * Couche B (6e) — moteur de session pour `6gen14`. N'importe jamais rien de `src/generateurs6e/`
 * — voir `sessionEquationsExpLog.test.ts` pour la preuve avec des exercices factices définis
 * localement (même principe que `sessionExponentiellesProblemes.ts`, 6gen12).
 */
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceEquationsExpLog, IssueSimplificationG } from "../core6e/equationsExpLog.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { NIVEAU_AIDE_MAX_PAR_PHASE, phaseApres, phaseInitiale } from "./typesEquationsExpLog";
import type { EtatSessionEquationsExpLog, PhaseEquationsExpLog, ResultatExerciceEquationsExpLog } from "./typesEquationsExpLog";
import {
  verifierAEcran1,
  verifierAEcran2,
  verifierBEcran1,
  verifierBEcran2,
  verifierCEcran1,
  verifierCEcran2,
  verifierCEcran3,
  verifierDEcran1,
  verifierDEcran2,
  verifierEEcran1,
  verifierEEcran2,
  verifierEEcran3,
  verifierFEcran1,
  verifierFEcran2,
  verifierFEcran3,
  verifierGEcran1,
  verifierGEcran2,
} from "./verificationEquationsExpLog";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

function etatInitial(
  exercice: ExerciceEquationsExpLog,
): Pick<EtatSessionEquationsExpLog, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionEquationsExpLog(reglages: ReglagesSession6e, generateur: () => ExerciceEquationsExpLog): EtatSessionEquationsExpLog {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionEquationsExpLog): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

/** Plafond du niveau d'aide de la phase COURANTE — voir `NIVEAU_AIDE_MAX_PAR_PHASE`
 * (`typesEquationsExpLog.ts`) : uniformément 2, sauf `gEcran1` (0). */
export function niveauAideMaxCourant(etat: EtatSessionEquationsExpLog): number {
  return NIVEAU_AIDE_MAX_PAR_PHASE[etat.phase];
}

export function activerAideSuivante(etat: EtatSessionEquationsExpLog): EtatSessionEquationsExpLog {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  const max = niveauAideMaxCourant(etat);
  if (etat.niveauAide >= max) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionEquationsExpLog, resultat: ResultatExerciceEquationsExpLog): EtatSessionEquationsExpLog {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function construireResultat(exercice: ExerciceEquationsExpLog, scores: Partial<Record<PhaseEquationsExpLog, number>>): ResultatExerciceEquationsExpLog {
  switch (exercice.famille) {
    case "A":
      return { famille: "A", exercice, scoreEcran1: scores.aEcran1 as number, scoreEcran2: scores.aEcran2 as number };
    case "B":
      return { famille: "B", exercice, scoreEcran1: scores.bEcran1 as number, scoreEcran2: scores.bEcran2 as number };
    case "C":
      return { famille: "C", exercice, scoreEcran1: scores.cEcran1 as number, scoreEcran2: scores.cEcran2 as number, scoreEcran3: scores.cEcran3 as number };
    case "D":
      return { famille: "D", exercice, scoreEcran1: scores.dEcran1 as number, scoreEcran2: scores.dEcran2 as number };
    case "E":
      return { famille: "E", exercice, scoreEcran1: scores.eEcran1 as number, scoreEcran2: scores.eEcran2 as number, scoreEcran3: scores.eEcran3 as number };
    case "F":
      return { famille: "F", exercice, scoreEcran1: scores.fEcran1 as number, scoreEcran2: scores.fEcran2 as number, scoreEcran3: scores.fEcran3 as number };
    case "G":
      return { famille: "G", exercice, scoreEcran1: scores.gEcran1 as number, scoreEcran2: scores.gEcran2 as number };
  }
}

function avancerPhase<TReponse>(
  etat: EtatSessionEquationsExpLog,
  reponse: TReponse,
  verifier: (exercice: ExerciceEquationsExpLog, reponse: TReponse) => boolean,
  phaseAttendue: PhaseEquationsExpLog,
): EtatSessionEquationsExpLog {
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

export function soumettreReponseAEcran1(etat: EtatSessionEquationsExpLog, texte: string): EtatSessionEquationsExpLog {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "A" ? verifierAEcran1(e, r) : false), "aEcran1");
}
export function soumettreReponseAEcran2(etat: EtatSessionEquationsExpLog, texte: string): EtatSessionEquationsExpLog {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "A" ? verifierAEcran2(e, r) : false), "aEcran2");
}

// ============================================================================
// Famille B.
// ============================================================================

export function soumettreReponseBEcran1(etat: EtatSessionEquationsExpLog, texte: string): EtatSessionEquationsExpLog {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBEcran1(e, r) : false), "bEcran1");
}
export function soumettreReponseBEcran2(etat: EtatSessionEquationsExpLog, texte: string): EtatSessionEquationsExpLog {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBEcran2(e, r) : false), "bEcran2");
}

// ============================================================================
// Famille C.
// ============================================================================

export function soumettreReponseCEcran1(etat: EtatSessionEquationsExpLog, texte: string): EtatSessionEquationsExpLog {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCEcran1(e, r) : false), "cEcran1");
}
export function soumettreReponseCEcran2(etat: EtatSessionEquationsExpLog, textes: string[]): EtatSessionEquationsExpLog {
  return avancerPhase(etat, textes, (e, r) => (e.famille === "C" ? verifierCEcran2(e, r) : false), "cEcran2");
}
export function soumettreReponseCEcran3(etat: EtatSessionEquationsExpLog, textes: string[]): EtatSessionEquationsExpLog {
  return avancerPhase(etat, textes, (e, r) => (e.famille === "C" ? verifierCEcran3(e, r) : false), "cEcran3");
}

// ============================================================================
// Famille D.
// ============================================================================

export function soumettreReponseDEcran1(etat: EtatSessionEquationsExpLog, reponse: EnsembleReelGuide): EtatSessionEquationsExpLog {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "D" ? verifierDEcran1(e, r) : false), "dEcran1");
}
export function soumettreReponseDEcran2(etat: EtatSessionEquationsExpLog, texte: string): EtatSessionEquationsExpLog {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "D" ? verifierDEcran2(e, r) : false), "dEcran2");
}

// ============================================================================
// Famille E.
// ============================================================================

export function soumettreReponseEEcran1(etat: EtatSessionEquationsExpLog, reponse: EnsembleReelGuide): EtatSessionEquationsExpLog {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "E" ? verifierEEcran1(e, r) : false), "eEcran1");
}
export function soumettreReponseEEcran2(etat: EtatSessionEquationsExpLog, texte: string): EtatSessionEquationsExpLog {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "E" ? verifierEEcran2(e, r) : false), "eEcran2");
}
export function soumettreReponseEEcran3(etat: EtatSessionEquationsExpLog, textes: string[]): EtatSessionEquationsExpLog {
  return avancerPhase(etat, textes, (e, r) => (e.famille === "E" ? verifierEEcran3(e, r) : false), "eEcran3");
}

// ============================================================================
// Famille F.
// ============================================================================

export function soumettreReponseFEcran1(etat: EtatSessionEquationsExpLog, reponse: EnsembleReelGuide): EtatSessionEquationsExpLog {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "F" ? verifierFEcran1(e, r) : false), "fEcran1");
}
export function soumettreReponseFEcran2(etat: EtatSessionEquationsExpLog, texte: string): EtatSessionEquationsExpLog {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "F" ? verifierFEcran2(e, r) : false), "fEcran2");
}
export function soumettreReponseFEcran3(etat: EtatSessionEquationsExpLog, textes: string[]): EtatSessionEquationsExpLog {
  return avancerPhase(etat, textes, (e, r) => (e.famille === "F" ? verifierFEcran3(e, r) : false), "fEcran3");
}

// ============================================================================
// Famille G.
// ============================================================================

export function soumettreReponseGEcran1(etat: EtatSessionEquationsExpLog, texte: string): EtatSessionEquationsExpLog {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "G" ? verifierGEcran1(e, r) : false), "gEcran1");
}
export function soumettreReponseGEcran2(etat: EtatSessionEquationsExpLog, choix: IssueSimplificationG): EtatSessionEquationsExpLog {
  return avancerPhase(etat, choix, (e, r) => (e.famille === "G" ? verifierGEcran2(e, r) : false), "gEcran2");
}
