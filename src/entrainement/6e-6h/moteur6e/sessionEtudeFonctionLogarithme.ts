/**
 * Couche B (6e) — moteur de session pour `6gen21`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionEtudeFonctionLogarithme.test.ts` pour la preuve avec un exercice factice défini
 * localement. Séquence VARIABLE selon la famille (`domaine → limites → asymptotes → croissance →
 * concavite → graphique` pour A-D, `domaine → comportementInfini` pour E, voir
 * `typesEtudeFonctionLogarithme.ts::phaseApres`) — `detailsPartiels` capture `revele`/`niveauAide`
 * AU MOMENT de la clôture de chaque écran (avant le reset de `niveauAide` par la transition
 * suivante), même principe que `sessionDomaineDeriveeLogarithme.ts` (6gen16) — évite par
 * construction le piège "revele stale" documenté pour plusieurs générateurs 6e antérieurs.
 */
import type { ExerciceEtudeFonctionLogarithme, ExerciceEtudeLogE, ExerciceEtudeLogNonE } from "../core6e/etudeFonctionLogarithme.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesEtudeFonctionLogarithme";
import type { DetailPhaseEtudeFonctionLogarithme, EtatSessionEtudeFonctionLogarithme, PhaseEtudeFonctionLogarithme, ResultatExerciceEtudeFonctionLogarithme } from "./typesEtudeFonctionLogarithme";
import type {
  ReponseAsymptoteDirection,
  ReponseComportementInfiniE,
  ReponseConcaviteLog,
  ReponseCroissanceGrilleC,
  ReponseCroissanceStandard,
} from "./verificationEtudeFonctionLogarithme";
import {
  verifierEcranAsymptotes,
  verifierEcranComportementInfiniE,
  verifierEcranConcavite,
  verifierEcranCroissanceGrilleC,
  verifierEcranCroissanceStandard,
  verifierEcranDomaine,
  verifierEcranGraphique,
  verifierEcranLimites,
} from "./verificationEtudeFonctionLogarithme";
import type { ReponseLimite } from "./verificationLimitesExponentielles";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (même convention que `6gen11`/`6gen16`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceEtudeFonctionLogarithme): Pick<EtatSessionEtudeFonctionLogarithme, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "detailsPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, detailsPartiels: {} };
}

export function demarrerSessionEtudeFonctionLogarithme(reglages: ReglagesSession6e, generateur: () => ExerciceEtudeFonctionLogarithme): EtatSessionEtudeFonctionLogarithme {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionEtudeFonctionLogarithme): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
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
    scoreLimites: scores.limites ?? null,
    scoreAsymptotes: scores.asymptotes ?? null,
    scoreCroissance: scores.croissance ?? null,
    scoreConcavite: scores.concavite ?? null,
    scoreGraphique: scores.graphique ?? null,
    scoreComportementInfini: scores.comportementInfini ?? null,
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

  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: score };
  const detail: DetailPhaseEtudeFonctionLogarithme = { revele: etapeCourante.revelee, niveauAide: etat.niveauAide };
  const detailsPartiels = { ...etat.detailsPartiels, [etat.phase]: detail };
  const phaseSuivante = phaseApres(etat.phase, exercice.famille);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, construireResultat(exercice, scoresPartiels, detailsPartiels));
  }

  return { ...etat, scoresPartiels, detailsPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante };
}

// ============================================================================
// Domaine — commun aux 5 familles.
// ============================================================================

export function soumettreReponseDomaine(etat: EtatSessionEtudeFonctionLogarithme, reponse: EnsembleReelGuide): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(etat, reponse, verifierEcranDomaine, "domaine");
}

// ============================================================================
// Familles A-D — 5 écrans suivants, communs (arité variable gérée par les fonctions de vérification
// elles-mêmes, voir `verificationEtudeFonctionLogarithme.ts`).
// ============================================================================

function versExerciceNonE(exercice: ExerciceEtudeFonctionLogarithme): ExerciceEtudeLogNonE | null {
  return exercice.famille === "E" ? null : exercice;
}

export function soumettreReponseLimites(etat: EtatSessionEtudeFonctionLogarithme, reponse: ReponseLimite[]): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(etat, reponse, (e, r) => {
    const ne = versExerciceNonE(e);
    return ne !== null && verifierEcranLimites(ne, r);
  }, "limites");
}

export function soumettreReponseAsymptotes(etat: EtatSessionEtudeFonctionLogarithme, reponse: ReponseAsymptoteDirection[]): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(etat, reponse, (e, r) => {
    const ne = versExerciceNonE(e);
    return ne !== null && verifierEcranAsymptotes(ne, r);
  }, "asymptotes");
}

export type ReponseCroissanceLog = { type: "standard"; reponse: ReponseCroissanceStandard } | { type: "grilleC"; reponse: ReponseCroissanceGrilleC };

export function soumettreReponseCroissance(etat: EtatSessionEtudeFonctionLogarithme, reponse: ReponseCroissanceLog): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(
    etat,
    reponse,
    (e, r) => {
      if (e.famille === "C") return r.type === "grilleC" && verifierEcranCroissanceGrilleC(e.croissance, r.reponse);
      if (e.famille === "E") return false;
      return r.type === "standard" && verifierEcranCroissanceStandard(e.croissance, r.reponse);
    },
    "croissance",
  );
}

export function soumettreReponseConcavite(etat: EtatSessionEtudeFonctionLogarithme, reponse: ReponseConcaviteLog): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(etat, reponse, (e, r) => e.famille !== "E" && verifierEcranConcavite(e.concavite, r), "concavite");
}

export function soumettreReponseGraphique(etat: EtatSessionEtudeFonctionLogarithme, indexChoisi: number): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(etat, indexChoisi, (e, r) => {
    const ne = versExerciceNonE(e);
    return ne !== null && verifierEcranGraphique(ne, r);
  }, "graphique");
}

// ============================================================================
// Famille E — écran unique "comportementInfini", deuxième et dernier écran de cette famille.
// ============================================================================

export function soumettreReponseComportementInfini(etat: EtatSessionEtudeFonctionLogarithme, reponse: ReponseComportementInfiniE): EtatSessionEtudeFonctionLogarithme {
  return avancerPhase(
    etat,
    reponse,
    (e, r) => e.famille === "E" && verifierEcranComportementInfiniE(e as ExerciceEtudeLogE, r),
    "comportementInfini",
  );
}
