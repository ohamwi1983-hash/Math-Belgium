/**
 * Couche B (6e) — moteur de session pour `6gen7`. N'importe jamais rien de
 * `src/generateurs6e/` — voir `sessionDomaineDeriveeExponentielles.test.ts` pour la preuve avec
 * des exercices factices définis localement.
 */
import type { ExerciceDomaineDeriveeA, ExerciceDomaineDeriveeB, ExerciceDomaineDeriveeC, ExerciceDomaineDeriveeD, ExerciceDomaineDeriveeE, ExerciceDomaineDeriveeExponentielle, ExerciceDomaineDeriveeF } from "../core6e/domaineDeriveeExponentielles.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesDomaineDeriveeExponentielles";
import type {
  DetailPhaseDomaineDeriveeExponentielle,
  EtatSessionDomaineDeriveeExponentielle,
  PhaseDomaineDeriveeExponentielle,
  ResultatExerciceDomaineDeriveeExponentielle,
} from "./typesDomaineDeriveeExponentielles";
import type { ReponseDeuxChamps } from "./verificationDomaineDeriveeExponentielles";
import {
  verifierADerivee,
  verifierBDerivee,
  verifierCAssemblage,
  verifierCFacteurs,
  verifierDAssemblage,
  verifierDND,
  verifierDomaine,
  verifierEDerivee,
  verifierESimplifier,
  verifierFDerivee,
} from "./verificationDomaineDeriveeExponentielles";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (même convention que `6gen6`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceDomaineDeriveeExponentielle,
): Pick<EtatSessionDomaineDeriveeExponentielle, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "detailsPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, detailsPartiels: {} };
}

export function demarrerSessionDomaineDeriveeExponentielle(reglages: ReglagesSession6e, generateur: () => ExerciceDomaineDeriveeExponentielle): EtatSessionDomaineDeriveeExponentielle {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionDomaineDeriveeExponentielle): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionDomaineDeriveeExponentielle): EtatSessionDomaineDeriveeExponentielle {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionDomaineDeriveeExponentielle, resultat: ResultatExerciceDomaineDeriveeExponentielle): EtatSessionDomaineDeriveeExponentielle {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function construireResultat(
  exercice: ExerciceDomaineDeriveeExponentielle,
  scores: Partial<Record<PhaseDomaineDeriveeExponentielle, number>>,
  details: Partial<Record<PhaseDomaineDeriveeExponentielle, DetailPhaseDomaineDeriveeExponentielle>>,
): ResultatExerciceDomaineDeriveeExponentielle {
  switch (exercice.famille) {
    case "A":
      return { famille: "A", exercice, scoreDomaine: scores.aDomaine as number, scoreDerivee: scores.aDerivee as number, details };
    case "B":
      return { famille: "B", exercice, scoreDomaine: scores.bDomaine as number, scoreDerivee: scores.bDerivee as number, details };
    case "C":
      return { famille: "C", exercice, scoreDomaine: scores.cDomaine as number, scoreFacteurs: scores.cFacteurs as number, scoreAssemblage: scores.cAssemblage as number, details };
    case "D":
      return { famille: "D", exercice, scoreDomaine: scores.dDomaine as number, scoreND: scores.dND as number, scoreAssemblage: scores.dAssemblage as number, details };
    case "E":
      return { famille: "E", exercice, scoreDomaine: scores.eDomaine as number, scoreSimplifier: scores.eSimplifier as number, scoreDerivee: scores.eDerivee as number, details };
    case "F":
      return { famille: "F", exercice, scoreDomaine: scores.fDomaine as number, scoreDerivee: scores.fDerivee as number, details };
  }
}

function avancerPhase<TReponse>(
  etat: EtatSessionDomaineDeriveeExponentielle,
  reponse: TReponse,
  verifier: (exercice: ExerciceDomaineDeriveeExponentielle, reponse: TReponse) => boolean,
  phaseAttendue: PhaseDomaineDeriveeExponentielle,
): EtatSessionDomaineDeriveeExponentielle {
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
  const detail: DetailPhaseDomaineDeriveeExponentielle = { revele: etapeCourante.revelee, niveauAide: etat.niveauAide };
  const detailsPartiels = { ...etat.detailsPartiels, [etat.phase]: detail };
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, construireResultat(exercice, scoresPartiels, detailsPartiels));
  }

  return { ...etat, scoresPartiels, detailsPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante };
}

// ============================================================================
// Domaine — même vérification pour les 6 familles (`verifierDomaine` dispatche déjà en interne sur
// `exercice.domaine`).
// ============================================================================

export function soumettreReponseDomaine(etat: EtatSessionDomaineDeriveeExponentielle, reponse: EnsembleReelGuide): EtatSessionDomaineDeriveeExponentielle {
  const phaseDomaine = phaseInitiale(etat.exerciceCourant);
  return avancerPhase(etat, reponse, (e, r) => verifierDomaine(e, r), phaseDomaine);
}

// ============================================================================
// Famille A
// ============================================================================

export function soumettreReponseADerivee(etat: EtatSessionDomaineDeriveeExponentielle, texte: string): EtatSessionDomaineDeriveeExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "A" ? verifierADerivee(e as ExerciceDomaineDeriveeA, r) : false), "aDerivee");
}

// ============================================================================
// Famille B
// ============================================================================

export function soumettreReponseBDerivee(etat: EtatSessionDomaineDeriveeExponentielle, texte: string): EtatSessionDomaineDeriveeExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBDerivee(e as ExerciceDomaineDeriveeB, r) : false), "bDerivee");
}

// ============================================================================
// Famille C
// ============================================================================

export function soumettreReponseCFacteurs(etat: EtatSessionDomaineDeriveeExponentielle, reponse: ReponseDeuxChamps): EtatSessionDomaineDeriveeExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "C" ? verifierCFacteurs(e as ExerciceDomaineDeriveeC, r) : false), "cFacteurs");
}

export function soumettreReponseCAssemblage(etat: EtatSessionDomaineDeriveeExponentielle, texte: string): EtatSessionDomaineDeriveeExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCAssemblage(e as ExerciceDomaineDeriveeC, r) : false), "cAssemblage");
}

// ============================================================================
// Famille D
// ============================================================================

export function soumettreReponseDND(etat: EtatSessionDomaineDeriveeExponentielle, reponse: ReponseDeuxChamps): EtatSessionDomaineDeriveeExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "D" ? verifierDND(e as ExerciceDomaineDeriveeD, r) : false), "dND");
}

export function soumettreReponseDAssemblage(etat: EtatSessionDomaineDeriveeExponentielle, texte: string): EtatSessionDomaineDeriveeExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "D" ? verifierDAssemblage(e as ExerciceDomaineDeriveeD, r) : false), "dAssemblage");
}

// ============================================================================
// Famille E
// ============================================================================

export function soumettreReponseESimplifier(etat: EtatSessionDomaineDeriveeExponentielle, texte: string): EtatSessionDomaineDeriveeExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "E" ? verifierESimplifier(e as ExerciceDomaineDeriveeE, r) : false), "eSimplifier");
}

export function soumettreReponseEDerivee(etat: EtatSessionDomaineDeriveeExponentielle, texte: string): EtatSessionDomaineDeriveeExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "E" ? verifierEDerivee(e as ExerciceDomaineDeriveeE, r) : false), "eDerivee");
}

// ============================================================================
// Famille F
// ============================================================================

export function soumettreReponseFDerivee(etat: EtatSessionDomaineDeriveeExponentielle, texte: string): EtatSessionDomaineDeriveeExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "F" ? verifierFDerivee(e as ExerciceDomaineDeriveeF, r) : false), "fDerivee");
}
