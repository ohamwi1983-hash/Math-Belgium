/**
 * Couche B (6e) — moteur de session pour `6gen3` (REFONTE TOTALE). N'importe JAMAIS rien de
 * `src/generateurs6e/` — voir `generateurs6e/equationsCyclometriques/session.integration.test.ts`
 * pour la preuve avec le vrai générateur. Séquence de phases UNIFORME pour les 4 variantes
 * (`ce → equation → solutions → acceptRejet`, cette dernière sautée si 0 candidat) —
 * `moteur6e/typesEquationsCyclometriques.ts::phaseApres`.
 */
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceEquationsCyclometriques } from "../core6e/equationsCyclometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { PHASE_INITIALE, phaseApres } from "./typesEquationsCyclometriques";
import type { EtatSessionEquationsCyclometriques, PhaseEquationsCyclometriques, ResultatExerciceEquationsCyclometriques } from "./typesEquationsCyclometriques";
import { verifierAcceptRejet, verifierCE, verifierCondition, verifierEquation, verifierSolutions } from "./verificationEquationsCyclometriques";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (spec explicite). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceEquationsCyclometriques): Pick<EtatSessionEquationsCyclometriques, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: PHASE_INITIALE, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionEquationsCyclometriques(reglages: ReglagesSession6e, generateur: () => ExerciceEquationsCyclometriques): EtatSessionEquationsCyclometriques {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereCloture: null, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionEquationsCyclometriques): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionEquationsCyclometriques): EtatSessionEquationsCyclometriques {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionEquationsCyclometriques, resultat: ResultatExerciceEquationsCyclometriques): EtatSessionEquationsCyclometriques {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function construireResultat(exercice: ExerciceEquationsCyclometriques, scores: Partial<Record<PhaseEquationsCyclometriques, number>>): ResultatExerciceEquationsCyclometriques {
  return {
    exercice,
    scoreCE: scores.ce as number,
    scoreCondition: scores.condition ?? null,
    scoreEquation: scores.equation as number,
    scoreSolutions: scores.solutions as number,
    scoreAcceptRejet: scores.acceptRejet ?? null,
  };
}

function avancerPhase<TReponse>(
  etat: EtatSessionEquationsCyclometriques,
  reponse: TReponse,
  verifier: (exercice: ExerciceEquationsCyclometriques, reponse: TReponse) => boolean,
  phaseAttendue: PhaseEquationsCyclometriques,
): EtatSessionEquationsCyclometriques {
  if (etat.terminee) throw new Error("soumettreReponse : la session est déjà terminée");
  if (etat.phase !== phaseAttendue) throw new Error(`soumettreReponse : attendu à la phase "${phaseAttendue}", trouvé "${etat.phase}"`);
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<TReponse>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifier(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: score };
  const derniereCloture = { phase: etat.phase, info: { niveauAide: etat.niveauAide, revele: etapeCourante.revelee } };
  const phaseSuivante = phaseApres(etat.phase, exercice);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant({ ...etat, derniereCloture }, construireResultat(exercice, scoresPartiels));
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereCloture };
}

export function soumettreReponseCE(etat: EtatSessionEquationsCyclometriques, reponse: EnsembleReelGuide): EtatSessionEquationsCyclometriques {
  return avancerPhase(etat, reponse, verifierCE, "ce");
}

/** Écran "condition" — variante 4 UNIQUEMENT (voir `phaseApres` : jamais atteint pour 1/2/3). */
export function soumettreReponseCondition(etat: EtatSessionEquationsCyclometriques, reponse: EnsembleReelGuide): EtatSessionEquationsCyclometriques {
  return avancerPhase(etat, reponse, verifierCondition, "condition");
}

export function soumettreReponseEquation(etat: EtatSessionEquationsCyclometriques, texte: string): EtatSessionEquationsCyclometriques {
  return avancerPhase(etat, texte, verifierEquation, "equation");
}

export function soumettreReponseSolutions(etat: EtatSessionEquationsCyclometriques, textes: string[]): EtatSessionEquationsCyclometriques {
  return avancerPhase(etat, textes, verifierSolutions, "solutions");
}

export function soumettreReponseAcceptRejet(etat: EtatSessionEquationsCyclometriques, decisions: boolean[]): EtatSessionEquationsCyclometriques {
  return avancerPhase(etat, decisions, verifierAcceptRejet, "acceptRejet");
}
