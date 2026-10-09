/**
 * Couche B (6e) — moteur de session pour `6gen19`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionHyperboliques.test.ts` pour la preuve avec des exercices factices définis
 * localement. Architecture calquée sur `sessionDomaineDeriveeLogarithme.ts` (`6gen16`) :
 * `detailsPartiels` capture `revele`/`niveauAide` AU MOMENT de la clôture de chaque écran (avant le
 * reset de `niveauAide` par la transition suivante) — évite par construction le piège "revele
 * stale" documenté dans CLAUDE.md (lecture de `etat.etapeCourante.revelee` via une closure
 * `terminerEtape` fermée sur l'état PRÉ-transition, structurellement périmée puisque
 * `avancerPhase` calcule `revele=true` sur épuisement des tentatives puis réinitialise
 * `etapeCourante` — `revelee:false` — dans le MÊME appel avant de retourner).
 */
import type { ExerciceHyperboliquesA, ExerciceHyperboliquesB, ExerciceHyperboliquesC, ExerciceHyperboliquesD, ExerciceHyperboliques, StatutPariteHyperbolique } from "../core6e/hyperboliques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { DetailPhaseHyperboliques, EtatSessionHyperboliques, PhaseHyperboliques, ResultatExerciceHyperboliques } from "./typesHyperboliques";
import { phaseApres, phaseInitiale } from "./typesHyperboliques";
import type { ReponseLimitesD } from "./verificationHyperboliques";
import {
  verifierAParite,
  verifierBIsoler,
  verifierBValeurs,
  verifierCDerivee,
  verifierCDeriveeSeconde,
  verifierCRelation,
  verifierDLimites,
  verifierDReecriture,
} from "./verificationHyperboliques";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (spec explicite). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceHyperboliques): Pick<EtatSessionHyperboliques, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "detailsPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, detailsPartiels: {} };
}

export function demarrerSessionHyperboliques(reglages: ReglagesSession6e, generateur: () => ExerciceHyperboliques): EtatSessionHyperboliques {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionHyperboliques): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionHyperboliques): EtatSessionHyperboliques {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionHyperboliques, resultat: ResultatExerciceHyperboliques): EtatSessionHyperboliques {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function construireResultat(exercice: ExerciceHyperboliques, scores: Partial<Record<PhaseHyperboliques, number>>, details: Partial<Record<PhaseHyperboliques, DetailPhaseHyperboliques>>): ResultatExerciceHyperboliques {
  switch (exercice.famille) {
    case "A":
      return { famille: "A", exercice, scoreParite: scores.aParite as number, details };
    case "B":
      return { famille: "B", exercice, scoreIsoler: scores.bIsoler as number, scoreValeurs: scores.bValeurs as number, details };
    case "C":
      return { famille: "C", exercice, scoreDerivee: scores.cDerivee as number, scoreDeriveeSeconde: scores.cDeriveeSeconde as number, scoreRelation: scores.cRelation as number, details };
    case "D":
      return { famille: "D", exercice, scoreReecriture: scores.dReecriture as number, scoreLimites: scores.dLimites as number, details };
  }
}

function avancerPhase<TReponse>(
  etat: EtatSessionHyperboliques,
  reponse: TReponse,
  verifier: (exercice: ExerciceHyperboliques, reponse: TReponse) => boolean,
  phaseAttendue: PhaseHyperboliques,
): EtatSessionHyperboliques {
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
  const detail: DetailPhaseHyperboliques = { revele: etapeCourante.revelee, niveauAide: etat.niveauAide };
  const detailsPartiels = { ...etat.detailsPartiels, [etat.phase]: detail };
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, construireResultat(exercice, scoresPartiels, detailsPartiels));
  }

  return { ...etat, scoresPartiels, detailsPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante };
}

// ============================================================================
// Famille A — 1 écran unique.
// ============================================================================

export function soumettreReponseAParite(etat: EtatSessionHyperboliques, choix: StatutPariteHyperbolique): EtatSessionHyperboliques {
  return avancerPhase(etat, choix, (e, r) => (e.famille === "A" ? verifierAParite(e as ExerciceHyperboliquesA, r) : false), "aParite");
}

// ============================================================================
// Famille B.
// ============================================================================

export function soumettreReponseBIsoler(etat: EtatSessionHyperboliques, texte: string): EtatSessionHyperboliques {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBIsoler(e as ExerciceHyperboliquesB, r) : false), "bIsoler");
}

export function soumettreReponseBValeurs(etat: EtatSessionHyperboliques, textes: string[]): EtatSessionHyperboliques {
  return avancerPhase(etat, textes, (e, r) => (e.famille === "B" ? verifierBValeurs(e as ExerciceHyperboliquesB, r) : false), "bValeurs");
}

// ============================================================================
// Famille C.
// ============================================================================

export function soumettreReponseCDerivee(etat: EtatSessionHyperboliques, texte: string): EtatSessionHyperboliques {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCDerivee(e as ExerciceHyperboliquesC, r) : false), "cDerivee");
}

export function soumettreReponseCDeriveeSeconde(etat: EtatSessionHyperboliques, texte: string): EtatSessionHyperboliques {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCDeriveeSeconde(e as ExerciceHyperboliquesC, r) : false), "cDeriveeSeconde");
}

export function soumettreReponseCRelation(etat: EtatSessionHyperboliques, texte: string): EtatSessionHyperboliques {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCRelation(e as ExerciceHyperboliquesC, r) : false), "cRelation");
}

// ============================================================================
// Famille D.
// ============================================================================

export function soumettreReponseDReecriture(etat: EtatSessionHyperboliques, texte: string): EtatSessionHyperboliques {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "D" ? verifierDReecriture(e as ExerciceHyperboliquesD, r) : false), "dReecriture");
}

export function soumettreReponseDLimites(etat: EtatSessionHyperboliques, reponse: ReponseLimitesD): EtatSessionHyperboliques {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "D" ? verifierDLimites(e as ExerciceHyperboliquesD, r) : false), "dLimites");
}
