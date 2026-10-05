/**
 * Couche B (6e) — moteur de session pour `6gen6`. N'importe jamais rien de
 * `src/generateurs6e/` — voir `sessionLimitesExponentielles.test.ts` pour la preuve avec des
 * exercices factices définis localement.
 */
import type { CategorieFI, ExerciceLimiteExponentielle } from "../core6e/limitesExponentielles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesLimitesExponentielles";
import type { DetailPhaseLimiteExponentielle, EtatSessionLimiteExponentielle, PhaseLimiteExponentielle, ResultatExerciceLimiteExponentielle } from "./typesLimitesExponentielles";
import type { ReponseFacteursC, ReponseLimite } from "./verificationLimitesExponentielles";
import {
  verifierAExposant,
  verifierAGlobale,
  verifierBExponentielle,
  verifierBGlobale,
  verifierBPolynomiale,
  verifierCFacteurs,
  verifierCGlobale,
  verifierGCombiner,
  verifierGConclure,
  verifierGOrdre1,
  verifierHConclure,
  verifierHDenominateur,
  verifierHForme,
  verifierHNumerateur,
  verifierIConclure,
  verifierIDenominateur,
  verifierIForme,
  verifierINumerateur,
  verifierJConclure,
  verifierJDenominateur,
  verifierJForme,
  verifierJNumerateur,
  verifierKConclure,
  verifierKDenominateur1,
  verifierKDenominateur2,
  verifierKForme,
  verifierKNumerateur1,
  verifierKNumerateur2,
  verifierLConclure,
  verifierLReformuler,
  verifierNCombiner,
  verifierNConclure,
} from "./verificationLimitesExponentielles";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (spec explicite pour chaque famille). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceLimiteExponentielle,
): Pick<EtatSessionLimiteExponentielle, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "detailsPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, detailsPartiels: {} };
}

export function demarrerSessionLimiteExponentielle(reglages: ReglagesSession6e, generateur: () => ExerciceLimiteExponentielle): EtatSessionLimiteExponentielle {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionLimiteExponentielle): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionLimiteExponentielle): EtatSessionLimiteExponentielle {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionLimiteExponentielle, resultat: ResultatExerciceLimiteExponentielle): EtatSessionLimiteExponentielle {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function construireResultat(
  exercice: ExerciceLimiteExponentielle,
  scores: Partial<Record<PhaseLimiteExponentielle, number>>,
  details: Partial<Record<PhaseLimiteExponentielle, DetailPhaseLimiteExponentielle>>,
): ResultatExerciceLimiteExponentielle {
  switch (exercice.famille) {
    case "A":
      return { famille: "A", exercice, scoreExposant: scores.aExposant as number, scoreGlobale: scores.aGlobale as number, details };
    case "B":
      return { famille: "B", exercice, scoreExponentielle: scores.bExponentielle as number, scorePolynomiale: scores.bPolynomiale as number, scoreGlobale: scores.bGlobale as number, details };
    case "C":
      return { famille: "C", exercice, scoreFacteurs: scores.cFacteurs as number, scoreGlobale: scores.cGlobale as number, details };
    case "G":
      return { famille: "G", exercice, scoreCombiner: scores.gCombiner as number, scoreOrdre1: scores.gOrdre1 as number, scoreConclure: scores.gConclure as number, details };
    case "H":
      return {
        famille: "H",
        exercice,
        scoreForme: scores.hForme as number,
        scoreNumerateur: scores.hNumerateur as number,
        scoreDenominateur: scores.hDenominateur as number,
        scoreConclure: scores.hConclure as number,
        details,
      };
    case "I":
      return {
        famille: "I",
        exercice,
        scoreForme: scores.iForme as number,
        scoreNumerateur: scores.iNumerateur as number,
        scoreDenominateur: scores.iDenominateur as number,
        scoreConclure: scores.iConclure as number,
        details,
      };
    case "J":
      return {
        famille: "J",
        exercice,
        scoreForme: scores.jForme as number,
        scoreNumerateur: scores.jNumerateur as number,
        scoreDenominateur: scores.jDenominateur as number,
        scoreConclure: scores.jConclure as number,
        details,
      };
    case "K":
      return {
        famille: "K",
        exercice,
        scoreForme: scores.kForme as number,
        scoreNumerateur1: scores.kNumerateur1 as number,
        scoreDenominateur1: scores.kDenominateur1 as number,
        scoreNumerateur2: scores.kNumerateur2 as number,
        scoreDenominateur2: scores.kDenominateur2 as number,
        scoreConclure: scores.kConclure as number,
        details,
      };
    case "L":
      return { famille: "L", exercice, scoreReformuler: scores.lReformuler as number, scoreConclure: scores.lConclure as number, details };
    case "N":
      return { famille: "N", exercice, scoreCombiner: scores.nCombiner as number, scoreConclure: scores.nConclure as number, details };
  }
}

function avancerPhase<TReponse>(
  etat: EtatSessionLimiteExponentielle,
  reponse: TReponse,
  verifier: (exercice: ExerciceLimiteExponentielle, reponse: TReponse) => boolean,
  phaseAttendue: PhaseLimiteExponentielle,
): EtatSessionLimiteExponentielle {
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
  const detail: DetailPhaseLimiteExponentielle = { revele: etapeCourante.revelee, niveauAide: etat.niveauAide };
  const detailsPartiels = { ...etat.detailsPartiels, [etat.phase]: detail };
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, construireResultat(exercice, scoresPartiels, detailsPartiels));
  }

  return { ...etat, scoresPartiels, detailsPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante };
}

// ============================================================================
// Famille A
// ============================================================================

export function soumettreReponseAExposant(etat: EtatSessionLimiteExponentielle, reponse: ReponseLimite): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "A" ? verifierAExposant(e, r) : false), "aExposant");
}

export function soumettreReponseAGlobale(etat: EtatSessionLimiteExponentielle, reponse: ReponseLimite): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "A" ? verifierAGlobale(e, r) : false), "aGlobale");
}

// ============================================================================
// Famille B
// ============================================================================

export function soumettreReponseBExponentielle(etat: EtatSessionLimiteExponentielle, reponse: ReponseLimite): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "B" ? verifierBExponentielle(e, r) : false), "bExponentielle");
}

export function soumettreReponseBPolynomiale(etat: EtatSessionLimiteExponentielle, reponse: ReponseLimite): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "B" ? verifierBPolynomiale(e, r) : false), "bPolynomiale");
}

export function soumettreReponseBGlobale(etat: EtatSessionLimiteExponentielle, reponse: ReponseLimite): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "B" ? verifierBGlobale(e, r) : false), "bGlobale");
}

// ============================================================================
// Famille C
// ============================================================================

export function soumettreReponseCFacteurs(etat: EtatSessionLimiteExponentielle, reponse: ReponseFacteursC): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "C" ? verifierCFacteurs(e, r) : false), "cFacteurs");
}

export function soumettreReponseCGlobale(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCGlobale(e, r) : false), "cGlobale");
}

// ============================================================================
// Famille G
// ============================================================================

export function soumettreReponseGCombiner(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "G" ? verifierGCombiner(e, r) : false), "gCombiner");
}

export function soumettreReponseGOrdre1(etat: EtatSessionLimiteExponentielle, ordre1Suffit: boolean): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, ordre1Suffit, (e, r) => (e.famille === "G" ? verifierGOrdre1(e, r) : false), "gOrdre1");
}

export function soumettreReponseGConclure(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "G" ? verifierGConclure(e, r) : false), "gConclure");
}

// ============================================================================
// Famille H
// ============================================================================

export function soumettreReponseHForme(etat: EtatSessionLimiteExponentielle, reponse: CategorieFI): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "H" ? verifierHForme(e, r) : false), "hForme");
}

export function soumettreReponseHNumerateur(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "H" ? verifierHNumerateur(e, r) : false), "hNumerateur");
}

export function soumettreReponseHDenominateur(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "H" ? verifierHDenominateur(e, r) : false), "hDenominateur");
}

export function soumettreReponseHConclure(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "H" ? verifierHConclure(e, r) : false), "hConclure");
}

// ============================================================================
// Famille I
// ============================================================================

export function soumettreReponseIForme(etat: EtatSessionLimiteExponentielle, reponse: CategorieFI): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "I" ? verifierIForme(e, r) : false), "iForme");
}

export function soumettreReponseINumerateur(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "I" ? verifierINumerateur(e, r) : false), "iNumerateur");
}

export function soumettreReponseIDenominateur(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "I" ? verifierIDenominateur(e, r) : false), "iDenominateur");
}

export function soumettreReponseIConclure(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "I" ? verifierIConclure(e, r) : false), "iConclure");
}

// ============================================================================
// Famille J
// ============================================================================

export function soumettreReponseJForme(etat: EtatSessionLimiteExponentielle, reponse: CategorieFI): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "J" ? verifierJForme(e, r) : false), "jForme");
}

export function soumettreReponseJNumerateur(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "J" ? verifierJNumerateur(e, r) : false), "jNumerateur");
}

export function soumettreReponseJDenominateur(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "J" ? verifierJDenominateur(e, r) : false), "jDenominateur");
}

export function soumettreReponseJConclure(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "J" ? verifierJConclure(e, r) : false), "jConclure");
}

// ============================================================================
// Famille K
// ============================================================================

export function soumettreReponseKForme(etat: EtatSessionLimiteExponentielle, reponse: CategorieFI): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "K" ? verifierKForme(e, r) : false), "kForme");
}

export function soumettreReponseKNumerateur1(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "K" ? verifierKNumerateur1(e, r) : false), "kNumerateur1");
}

export function soumettreReponseKDenominateur1(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "K" ? verifierKDenominateur1(e, r) : false), "kDenominateur1");
}

export function soumettreReponseKNumerateur2(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "K" ? verifierKNumerateur2(e, r) : false), "kNumerateur2");
}

export function soumettreReponseKDenominateur2(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "K" ? verifierKDenominateur2(e, r) : false), "kDenominateur2");
}

export function soumettreReponseKConclure(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "K" ? verifierKConclure(e, r) : false), "kConclure");
}

// ============================================================================
// Famille L
// ============================================================================

export function soumettreReponseLReformuler(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "L" ? verifierLReformuler(e, r) : false), "lReformuler");
}

export function soumettreReponseLConclure(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "L" ? verifierLConclure(e, r) : false), "lConclure");
}

// ============================================================================
// Famille N
// ============================================================================

export function soumettreReponseNCombiner(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "N" ? verifierNCombiner(e, r) : false), "nCombiner");
}

export function soumettreReponseNConclure(etat: EtatSessionLimiteExponentielle, texte: string): EtatSessionLimiteExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "N" ? verifierNConclure(e, r) : false), "nConclure");
}
