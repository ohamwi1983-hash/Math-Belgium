/**
 * Couche B (6e) — moteur de session pour `6gen16`. N'importe jamais rien de
 * `src/generateurs6e/` — voir `sessionDomaineDeriveeLogarithme.test.ts` pour la preuve avec des
 * exercices factices définis localement. Architecture calquée sur `sessionDomaineDeriveeExponentielles.ts`
 * (`6gen7`) : `detailsPartiels` capture `revele`/`niveauAide` AU MOMENT de la clôture de chaque écran
 * (avant le reset de `niveauAide` par la transition suivante) — évite par construction le piège
 * "revele stale" documenté pour `6gen12` (`sessionExponentiellesProblemes.ts`).
 */
import type { ExerciceDomaineDeriveeLogA, ExerciceDomaineDeriveeLogB, ExerciceDomaineDeriveeLogC, ExerciceDomaineDeriveeLogD, ExerciceDomaineDeriveeLogE, ExerciceDomaineDeriveeLogF, ExerciceDomaineDeriveeLogG, ExerciceDomaineDeriveeLogarithme } from "../core6e/domaineDeriveeLogarithme.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesDomaineDeriveeLogarithme";
import type { DetailPhaseDomaineDeriveeLogarithme, EtatSessionDomaineDeriveeLogarithme, PhaseDomaineDeriveeLogarithme, ResultatExerciceDomaineDeriveeLogarithme } from "./typesDomaineDeriveeLogarithme";
import type { ReponseDeuxChamps } from "./verificationDomaineDeriveeLogarithme";
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
  verifierGFPrimeSurF,
  verifierGIdentifier,
  verifierGIsoler,
} from "./verificationDomaineDeriveeLogarithme";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (même convention que `6gen7`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceDomaineDeriveeLogarithme,
): Pick<EtatSessionDomaineDeriveeLogarithme, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "detailsPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, detailsPartiels: {} };
}

export function demarrerSessionDomaineDeriveeLogarithme(reglages: ReglagesSession6e, generateur: () => ExerciceDomaineDeriveeLogarithme): EtatSessionDomaineDeriveeLogarithme {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionDomaineDeriveeLogarithme): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionDomaineDeriveeLogarithme): EtatSessionDomaineDeriveeLogarithme {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionDomaineDeriveeLogarithme, resultat: ResultatExerciceDomaineDeriveeLogarithme): EtatSessionDomaineDeriveeLogarithme {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function construireResultat(
  exercice: ExerciceDomaineDeriveeLogarithme,
  scores: Partial<Record<PhaseDomaineDeriveeLogarithme, number>>,
  details: Partial<Record<PhaseDomaineDeriveeLogarithme, DetailPhaseDomaineDeriveeLogarithme>>,
): ResultatExerciceDomaineDeriveeLogarithme {
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
    case "G":
      return { famille: "G", exercice, scoreIdentifier: scores.gIdentifier as number, scoreFPrimeSurF: scores.gFPrimeSurF as number, scoreIsoler: scores.gIsoler as number, details };
  }
}

function avancerPhase<TReponse>(
  etat: EtatSessionDomaineDeriveeLogarithme,
  reponse: TReponse,
  verifier: (exercice: ExerciceDomaineDeriveeLogarithme, reponse: TReponse) => boolean,
  phaseAttendue: PhaseDomaineDeriveeLogarithme,
): EtatSessionDomaineDeriveeLogarithme {
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
  const detail: DetailPhaseDomaineDeriveeLogarithme = { revele: etapeCourante.revelee, niveauAide: etat.niveauAide };
  const detailsPartiels = { ...etat.detailsPartiels, [etat.phase]: detail };
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, construireResultat(exercice, scoresPartiels, detailsPartiels));
  }

  return { ...etat, scoresPartiels, detailsPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante };
}

// ============================================================================
// Domaine — même vérification pour les 6 familles A-F (G n'a pas d'écran de domaine).
// ============================================================================

export function soumettreReponseDomaine(etat: EtatSessionDomaineDeriveeLogarithme, reponse: EnsembleReelGuide): EtatSessionDomaineDeriveeLogarithme {
  const phaseDomaine = phaseInitiale(etat.exerciceCourant);
  return avancerPhase(etat, reponse, (e, r) => (e.famille !== "G" ? verifierDomaine(e, r) : false), phaseDomaine);
}

// ============================================================================
// Famille A
// ============================================================================

export function soumettreReponseADerivee(etat: EtatSessionDomaineDeriveeLogarithme, texte: string): EtatSessionDomaineDeriveeLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "A" ? verifierADerivee(e as ExerciceDomaineDeriveeLogA, r) : false), "aDerivee");
}

// ============================================================================
// Famille B
// ============================================================================

export function soumettreReponseBDerivee(etat: EtatSessionDomaineDeriveeLogarithme, texte: string): EtatSessionDomaineDeriveeLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBDerivee(e as ExerciceDomaineDeriveeLogB, r) : false), "bDerivee");
}

// ============================================================================
// Famille C
// ============================================================================

export function soumettreReponseCFacteurs(etat: EtatSessionDomaineDeriveeLogarithme, reponse: ReponseDeuxChamps): EtatSessionDomaineDeriveeLogarithme {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "C" ? verifierCFacteurs(e as ExerciceDomaineDeriveeLogC, r) : false), "cFacteurs");
}

export function soumettreReponseCAssemblage(etat: EtatSessionDomaineDeriveeLogarithme, texte: string): EtatSessionDomaineDeriveeLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCAssemblage(e as ExerciceDomaineDeriveeLogC, r) : false), "cAssemblage");
}

// ============================================================================
// Famille D
// ============================================================================

export function soumettreReponseDND(etat: EtatSessionDomaineDeriveeLogarithme, reponse: ReponseDeuxChamps): EtatSessionDomaineDeriveeLogarithme {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "D" ? verifierDND(e as ExerciceDomaineDeriveeLogD, r) : false), "dND");
}

export function soumettreReponseDAssemblage(etat: EtatSessionDomaineDeriveeLogarithme, texte: string): EtatSessionDomaineDeriveeLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "D" ? verifierDAssemblage(e as ExerciceDomaineDeriveeLogD, r) : false), "dAssemblage");
}

// ============================================================================
// Famille E
// ============================================================================

export function soumettreReponseESimplifier(etat: EtatSessionDomaineDeriveeLogarithme, texte: string): EtatSessionDomaineDeriveeLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "E" ? verifierESimplifier(e as ExerciceDomaineDeriveeLogE, r) : false), "eSimplifier");
}

export function soumettreReponseEDerivee(etat: EtatSessionDomaineDeriveeLogarithme, texte: string): EtatSessionDomaineDeriveeLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "E" ? verifierEDerivee(e as ExerciceDomaineDeriveeLogE, r) : false), "eDerivee");
}

// ============================================================================
// Famille F
// ============================================================================

export function soumettreReponseFDerivee(etat: EtatSessionDomaineDeriveeLogarithme, texte: string): EtatSessionDomaineDeriveeLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "F" ? verifierFDerivee(e as ExerciceDomaineDeriveeLogF, r) : false), "fDerivee");
}

// ============================================================================
// Famille G — pas d'écran de domaine, `gIdentifier` est la PREMIÈRE phase de cette famille.
// ============================================================================

export function soumettreReponseGIdentifier(etat: EtatSessionDomaineDeriveeLogarithme, texte: string): EtatSessionDomaineDeriveeLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "G" ? verifierGIdentifier(e as ExerciceDomaineDeriveeLogG, r) : false), "gIdentifier");
}

export function soumettreReponseGFPrimeSurF(etat: EtatSessionDomaineDeriveeLogarithme, texte: string): EtatSessionDomaineDeriveeLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "G" ? verifierGFPrimeSurF(e as ExerciceDomaineDeriveeLogG, r) : false), "gFPrimeSurF");
}

export function soumettreReponseGIsoler(etat: EtatSessionDomaineDeriveeLogarithme, texte: string): EtatSessionDomaineDeriveeLogarithme {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "G" ? verifierGIsoler(e as ExerciceDomaineDeriveeLogG, r) : false), "gIsoler");
}
