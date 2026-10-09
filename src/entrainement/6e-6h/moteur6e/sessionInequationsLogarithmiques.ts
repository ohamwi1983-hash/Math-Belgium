/**
 * Couche B (6e) — moteur de session pour `6gen15`. N'importe jamais rien de `src/generateurs6e/`
 * — voir `sessionInequationsLogarithmiques.test.ts` pour la preuve avec des exercices factices
 * définis localement.
 */
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInequationLogarithmique } from "../core6e/inequationsLogarithmiques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesInequationsLogarithmiques";
import type { EtatSessionInequationLogarithmique, PhaseInequationLogarithmique, ResultatExerciceInequationLogarithmique } from "./typesInequationsLogarithmiques";
import type { ReponseFConclure } from "./verificationInequationsLogarithmiques";
import {
  verifierACE,
  verifierAResoudre,
  verifierBCE,
  verifierBResoudre,
  verifierCCE,
  verifierCCombiner,
  verifierCComparer,
  verifierDCE,
  verifierDConvertirX,
  verifierDReecrire,
  verifierDResoudreY,
  verifierEReconnaitre,
  verifierFCE,
  verifierFConclure,
  verifierFSimplifier,
} from "./verificationInequationsLogarithmiques";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (spec explicite pour chaque famille). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceInequationLogarithmique,
): Pick<EtatSessionInequationLogarithmique, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionInequationLogarithmique(
  reglages: ReglagesSession6e,
  generateur: () => ExerciceInequationLogarithmique,
): EtatSessionInequationLogarithmique {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionInequationLogarithmique): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionInequationLogarithmique): EtatSessionInequationLogarithmique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionInequationLogarithmique,
  resultat: ResultatExerciceInequationLogarithmique,
  revele: boolean,
): EtatSessionInequationLogarithmique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, derniereRevelee: revele, ...etatInitial(etat.generateur()) };
}

function construireResultat(exercice: ExerciceInequationLogarithmique, scores: Partial<Record<PhaseInequationLogarithmique, number>>): ResultatExerciceInequationLogarithmique {
  switch (exercice.famille) {
    case "A":
      return { famille: "A", exercice, scoreCE: scores.aCE as number, scoreResoudre: scores.aResoudre as number };
    case "B":
      return { famille: "B", exercice, scoreCE: scores.bCE as number, scoreResoudre: scores.bResoudre as number };
    case "C":
      return { famille: "C", exercice, scoreCE: scores.cCE as number, scoreCombiner: scores.cCombiner as number, scoreComparer: scores.cComparer as number };
    case "D":
      return {
        famille: "D",
        exercice,
        scoreCE: scores.dCE as number,
        scoreReecrire: scores.dReecrire as number,
        scoreResoudreY: scores.dResoudreY as number,
        scoreConvertirX: scores.dConvertirX as number,
      };
    case "E":
      return { famille: "E", exercice, score: scores.eReconnaitre as number };
    case "F":
      return { famille: "F", exercice, scoreCE: scores.fCE as number, scoreSimplifier: scores.fSimplifier as number, scoreConclure: scores.fConclure as number };
  }
}

function avancerPhase<TReponse>(
  etat: EtatSessionInequationLogarithmique,
  reponse: TReponse,
  verifier: (exercice: ExerciceInequationLogarithmique, reponse: TReponse) => boolean,
  phaseAttendue: PhaseInequationLogarithmique,
): EtatSessionInequationLogarithmique {
  if (etat.terminee) throw new Error("soumettreReponse : la session est déjà terminée");
  if (etat.phase !== phaseAttendue) throw new Error(`soumettreReponse : attendu à la phase "${phaseAttendue}", trouvé "${etat.phase}"`);
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<TReponse>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifier(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereRevelee: false };

  // `etapeCourante.revelee` (donc `derniereRevelee` ci-dessous) n'est observable QU'ICI — voir la
  // doc de `EtatSessionInequationLogarithmique.derniereRevelee`.
  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: score };
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, construireResultat(exercice, scoresPartiels), revele);
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereRevelee: revele };
}

// ============================================================================
// Famille A.
// ============================================================================

export function soumettreReponseACE(etat: EtatSessionInequationLogarithmique, reponse: EnsembleReelGuide): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "A" ? verifierACE(e, r) : false), "aCE");
}

export function soumettreReponseAResoudre(etat: EtatSessionInequationLogarithmique, reponse: EnsembleReelGuide): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "A" ? verifierAResoudre(e, r) : false), "aResoudre");
}

// ============================================================================
// Famille B.
// ============================================================================

export function soumettreReponseBCE(etat: EtatSessionInequationLogarithmique, reponse: EnsembleReelGuide): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "B" ? verifierBCE(e, r) : false), "bCE");
}

export function soumettreReponseBResoudre(etat: EtatSessionInequationLogarithmique, reponse: EnsembleReelGuide): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "B" ? verifierBResoudre(e, r) : false), "bResoudre");
}

// ============================================================================
// Famille C.
// ============================================================================

export function soumettreReponseCCE(etat: EtatSessionInequationLogarithmique, reponse: EnsembleReelGuide): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "C" ? verifierCCE(e, r) : false), "cCE");
}

export function soumettreReponseCCombiner(etat: EtatSessionInequationLogarithmique, texte: string): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCCombiner(e, r) : false), "cCombiner");
}

export function soumettreReponseCComparer(etat: EtatSessionInequationLogarithmique, reponse: EnsembleReelGuide): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "C" ? verifierCComparer(e, r) : false), "cComparer");
}

// ============================================================================
// Famille D.
// ============================================================================

export function soumettreReponseDCE(etat: EtatSessionInequationLogarithmique, reponse: EnsembleReelGuide): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "D" ? verifierDCE(e, r) : false), "dCE");
}

export function soumettreReponseDReecrire(etat: EtatSessionInequationLogarithmique, texte: string): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "D" ? verifierDReecrire(e, r) : false), "dReecrire");
}

export function soumettreReponseDResoudreY(etat: EtatSessionInequationLogarithmique, reponse: EnsembleReelGuide): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "D" ? verifierDResoudreY(e, r) : false), "dResoudreY");
}

export function soumettreReponseDConvertirX(etat: EtatSessionInequationLogarithmique, reponse: EnsembleReelGuide): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "D" ? verifierDConvertirX(e, r) : false), "dConvertirX");
}

// ============================================================================
// Famille E.
// ============================================================================

export function soumettreReponseEReconnaitre(etat: EtatSessionInequationLogarithmique, estImpossible: boolean): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, estImpossible, (e, r) => (e.famille === "E" ? verifierEReconnaitre(e, r) : false), "eReconnaitre");
}

// ============================================================================
// Famille F.
// ============================================================================

export function soumettreReponseFCE(etat: EtatSessionInequationLogarithmique, reponse: EnsembleReelGuide): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "F" ? verifierFCE(e, r) : false), "fCE");
}

export function soumettreReponseFSimplifier(etat: EtatSessionInequationLogarithmique, texte: string): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "F" ? verifierFSimplifier(e, r) : false), "fSimplifier");
}

export function soumettreReponseFConclure(etat: EtatSessionInequationLogarithmique, reponse: ReponseFConclure): EtatSessionInequationLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "F" ? verifierFConclure(e, r) : false), "fConclure");
}
