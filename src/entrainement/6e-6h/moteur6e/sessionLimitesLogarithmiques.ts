/**
 * Couche B (6e) — moteur de session pour `6gen17`. N'importe jamais rien de
 * `src/generateurs6e/` — voir `sessionLimitesLogarithmiques.test.ts` pour la preuve avec des
 * exercices factices définis localement. `detailsPartiels` capture `revele`/`niveauAide` AU
 * MOMENT de la clôture de chaque écran (avant le reset de `niveauAide` par la transition
 * suivante) — évite par construction le piège "revele stale" documenté dans CLAUDE.md (même
 * patron que `sessionDomaineDeriveeLogarithme.ts`, 6gen16 : `etapeCourante` est une variable
 * locale FRAÎCHE calculée juste avant, jamais relue depuis `etat.etapeCourante` après coup).
 */
import type { ExerciceLimiteLogarithmique } from "../core6e/limitesLogarithmiques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesLimitesLogarithmiques";
import type { DetailPhaseLimiteLogarithmique, EtatSessionLimiteLogarithmique, PhaseLimiteLogarithmique, ResultatExerciceLimiteLogarithmique } from "./typesLimitesLogarithmiques";
import type { ReponseDiagnosticC, ReponseDominanceA, ReponseLimiteLog } from "./verificationLimitesLogarithmiques";
import {
  verifierADominance,
  verifierAConclure,
  verifierBConclure,
  verifierBReformuler,
  verifierCConclure,
  verifierCDiagnostic,
} from "./verificationLimitesLogarithmiques";

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur tous les écrans (spec explicite pour chaque famille). */
export const NIVEAU_AIDE_MAX = 2;

/** Une seule tentative sur les écrans à choix fermé (dominance, conclusion catégorielle,
 * diagnostic) — sinon ils se gagnent par élimination (audit chapitre 3 de 6e, point 5). Les écrans à
 * expression libre (famille B) gardent `reglages.tentativesMax`. */
export const TENTATIVES_CHOIX_FERME = 1;
const PHASES_CHOIX_FERME: ReadonlySet<PhaseLimiteLogarithmique> = new Set(["aDominance", "aConclure", "cDiagnostic", "cConclure"]);

export function tentativesMaxPhase(etat: Pick<EtatSessionLimiteLogarithmique, "phase" | "reglages">): number {
  return PHASES_CHOIX_FERME.has(etat.phase) ? TENTATIVES_CHOIX_FERME : etat.reglages.tentativesMax;
}

function etatInitial(
  exercice: ExerciceLimiteLogarithmique,
): Pick<EtatSessionLimiteLogarithmique, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "detailsPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, detailsPartiels: {} };
}

export function demarrerSessionLimiteLogarithmique(reglages: ReglagesSession6e, generateur: () => ExerciceLimiteLogarithmique): EtatSessionLimiteLogarithmique {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionLimiteLogarithmique): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: tentativesMaxPhase(etat) };
}

export function activerAideSuivante(etat: EtatSessionLimiteLogarithmique): EtatSessionLimiteLogarithmique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionLimiteLogarithmique, resultat: ResultatExerciceLimiteLogarithmique): EtatSessionLimiteLogarithmique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function construireResultat(
  exercice: ExerciceLimiteLogarithmique,
  scores: Partial<Record<PhaseLimiteLogarithmique, number>>,
  details: Partial<Record<PhaseLimiteLogarithmique, DetailPhaseLimiteLogarithmique>>,
): ResultatExerciceLimiteLogarithmique {
  switch (exercice.famille) {
    case "A":
      return { famille: "A", exercice, scoreDominance: scores.aDominance as number, scoreConclure: scores.aConclure as number, details };
    case "B":
      return { famille: "B", exercice, scoreReformuler: scores.bReformuler as number, scoreConclure: scores.bConclure as number, details };
    case "C":
      return { famille: "C", exercice, scoreDiagnostic: scores.cDiagnostic as number, scoreConclure: scores.cConclure as number, details };
  }
}

function avancerPhase<TReponse>(
  etat: EtatSessionLimiteLogarithmique,
  reponse: TReponse,
  verifier: (exercice: ExerciceLimiteLogarithmique, reponse: TReponse) => boolean,
  phaseAttendue: PhaseLimiteLogarithmique,
): EtatSessionLimiteLogarithmique {
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
  const detail: DetailPhaseLimiteLogarithmique = { revele: etapeCourante.revelee, niveauAide: etat.niveauAide };
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

export function soumettreReponseADominance(etat: EtatSessionLimiteLogarithmique, reponse: ReponseDominanceA): EtatSessionLimiteLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "A" ? verifierADominance(e, r) : false), "aDominance");
}

export function soumettreReponseAConclure(etat: EtatSessionLimiteLogarithmique, reponse: ReponseLimiteLog): EtatSessionLimiteLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "A" ? verifierAConclure(e, r) : false), "aConclure");
}

// ============================================================================
// Famille B
// ============================================================================

export function soumettreReponseBReformuler(etat: EtatSessionLimiteLogarithmique, texte: string): EtatSessionLimiteLogarithmique {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBReformuler(e, r) : false), "bReformuler");
}

export function soumettreReponseBConclure(etat: EtatSessionLimiteLogarithmique, texte: string): EtatSessionLimiteLogarithmique {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBConclure(e, r) : false), "bConclure");
}

// ============================================================================
// Famille C
// ============================================================================

export function soumettreReponseCDiagnostic(etat: EtatSessionLimiteLogarithmique, reponse: ReponseDiagnosticC): EtatSessionLimiteLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "C" ? verifierCDiagnostic(e, r) : false), "cDiagnostic");
}

export function soumettreReponseCConclure(etat: EtatSessionLimiteLogarithmique, reponse: ReponseLimiteLog): EtatSessionLimiteLogarithmique {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "C" ? verifierCConclure(e, r) : false), "cConclure");
}
