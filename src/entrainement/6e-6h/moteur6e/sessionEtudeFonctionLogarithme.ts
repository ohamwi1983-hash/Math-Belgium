/**
 * Couche B (6e) — moteur de session pour `6gen21`. N'importe jamais rien de `src/generateurs6e/`.
 * Séquence fixe de 6 écrans (`typesEtudeFonctionLogarithme.ts::phaseApres`), nombre de
 * tentatives par écran via `tentativesMaxPhase` ; `detailsPartiels` capture `revele`/`niveauAide`
 * AU MOMENT de la clôture de chaque écran (avant le reset de `niveauAide`).
 */
import type { ExerciceEtudeFonctionLogarithme } from "../core6e/etudeFonctionLogarithme.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale, tentativesMaxPhase } from "./typesEtudeFonctionLogarithme";
import type { DetailPhaseEtudeFonctionLogarithme, EtatSessionEtudeFonctionLogarithme, PhaseEtudeFonctionLogarithme, ResultatExerciceEtudeFonctionLogarithme } from "./typesEtudeFonctionLogarithme";
import type {
  ReponseAsymptoteDirection,
  ReponseConcaviteLog,
  ReponseCroissanceGrilleC,
  ReponseCroissanceStandard,
} from "./verificationEtudeFonctionLogarithme";
import {
  verifierEcranAsymptotes,
  verifierEcranConcavite,
  verifierEcranCroissanceGrilleC,
  verifierEcranCroissanceStandard,
  verifierEcranDomaine,
  verifierEcranGraphique,
  verifierEcranLimites,
} from "./verificationEtudeFonctionLogarithme";
import type { ReponseLimite } from "./verificationLimitesExponentielles";

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur tous les écrans (même convention que `6gen11`/`6gen16`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceEtudeFonctionLogarithme): Pick<EtatSessionEtudeFonctionLogarithme, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "detailsPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, detailsPartiels: {} };
}

export function demarrerSessionEtudeFonctionLogarithme(reglages: ReglagesSession6e, generateur: () => ExerciceEtudeFonctionLogarithme): EtatSessionEtudeFonctionLogarithme {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionEtudeFonctionLogarithme): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: tentativesMaxPhase(etat.phase, etat.reglages.tentativesMax) };
}

export function activerAideSuivante(etat: EtatSessionEtudeFonctionLogarithme): EtatSessionEtudeFonctionLogarithme {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionEtudeFonctionLogarithme, resultat: ResultatExerciceEtudeFonctionLogarithme): EtatSessionEtudeFonctionLogarithme {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function construireResultat(
  exercice: ExerciceEtudeFonctionLogarithme,
  scores: Partial<Record<PhaseEtudeFonctionLogarithme, number>>,
  details: Partial<Record<PhaseEtudeFonctionLogarithme, DetailPhaseEtudeFonctionLogarithme>>,
): ResultatExerciceEtudeFonctionLogarithme {
  return {
    exercice,
    scoreDomaine: scores.domaine as number,
    scoreLimites: scores.limites as number,
    scoreAsymptotes: scores.asymptotes as number,
    scoreCroissance: scores.croissance as number,
    scoreConcavite: scores.concavite as number,
    scoreGraphique: scores.graphique as number,
    details,
  };
}

function avancerPhase<TReponse>(
  etat: EtatSessionEtudeFonctionLogarithme,
  reponse: TReponse,
  verifier: (exercice: ExerciceEtudeFonctionLogarithme, reponse: TReponse) => boolean,
  phaseAttendue: PhaseEtudeFonctionLogarithme,
): EtatSessionEtudeFonctionLogarithme {
  if (etat.terminee) throw new Error("soumettreReponse : la session est déjà terminée");
  if (etat.phase !== phaseAttendue) throw new Error(`soumettreReponse : attendu à la phase "${phaseAttendue}", trouvé "${etat.phase}"`);
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<TReponse>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifier(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = etapeCourante.score as number;
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: score };
  const detail: DetailPhaseEtudeFonctionLogarithme = { revele: etapeCourante.revelee, niveauAide: etat.niveauAide };
  const detailsPartiels = { ...etat.detailsPartiels, [etat.phase]: detail };
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, construireResultat(exercice, scoresPartiels, detailsPartiels));
  }

  return { ...etat, scoresPartiels, detailsPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante };
}

// ============================================================================
// Soumissions — une par écran.
// ============================================================================

export function soumettreReponseDomaine(etat: EtatSessionEtudeFonctionLogarithme, reponse: EnsembleReelGuide): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(etat, reponse, verifierEcranDomaine, "domaine");
}

export function soumettreReponseLimites(etat: EtatSessionEtudeFonctionLogarithme, reponse: ReponseLimite[]): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(etat, reponse, verifierEcranLimites, "limites");
}

export function soumettreReponseAsymptotes(etat: EtatSessionEtudeFonctionLogarithme, reponse: ReponseAsymptoteDirection[]): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(etat, reponse, verifierEcranAsymptotes, "asymptotes");
}

export type ReponseCroissanceLog = { type: "standard"; reponse: ReponseCroissanceStandard } | { type: "grilleC"; reponse: ReponseCroissanceGrilleC };

export function soumettreReponseCroissance(etat: EtatSessionEtudeFonctionLogarithme, reponse: ReponseCroissanceLog): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(
    etat,
    reponse,
    (e, r) => {
      if (e.famille === "C") return r.type === "grilleC" && verifierEcranCroissanceGrilleC(e.croissance, r.reponse);
      return r.type === "standard" && verifierEcranCroissanceStandard(e.croissance, r.reponse);
    },
    "croissance",
  );
}

export function soumettreReponseConcavite(etat: EtatSessionEtudeFonctionLogarithme, reponse: ReponseConcaviteLog): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(etat, reponse, (e, r) => verifierEcranConcavite(e.concavite, r), "concavite");
}

export function soumettreReponseGraphique(etat: EtatSessionEtudeFonctionLogarithme, indexChoisi: number): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(etat, indexChoisi, verifierEcranGraphique, "graphique");
}
