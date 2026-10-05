/**
 * Couche B (6e) — moteur de session pour `6gen12`. N'importe jamais rien de `src/generateurs6e/`
 * — voir `sessionExponentiellesProblemes.test.ts` pour la preuve avec des exercices factices
 * définis localement (même principe que `sessionEquationsExponentielles.ts`, 6gen9).
 */
import type { ExerciceExponentiellesProblemes } from "../core6e/exponentiellesProblemes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesExponentiellesProblemes";
import type { EtatSessionExponentiellesProblemes, PhaseExponentiellesProblemes, ResultatExerciceExponentiellesProblemes } from "./typesExponentiellesProblemes";
import {
  verifierAEcran1,
  verifierAEcran2,
  verifierBEcran1,
  verifierBEcran2,
  verifierBEcran3,
  verifierBEcran4,
  verifierCEcran1,
  verifierCEcran2,
  verifierCEcran3,
  verifierDEcran1,
  verifierDEcran2,
  verifierDEcran3,
  verifierDEcran4,
  verifierEEcran1,
  verifierEEcran2,
  verifierEEcran3,
  verifierFEcran1,
  verifierFEcran2,
  verifierFEcran3,
  verifierFEcran4,
  verifierGEcran1,
  verifierGEcran2,
  verifierGEcran3,
} from "./verificationExponentiellesProblemes";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (spec explicite pour chaque famille). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceExponentiellesProblemes,
): Pick<EtatSessionExponentiellesProblemes, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionExponentiellesProblemes(reglages: ReglagesSession6e, generateur: () => ExerciceExponentiellesProblemes): EtatSessionExponentiellesProblemes {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionExponentiellesProblemes): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionExponentiellesProblemes): EtatSessionExponentiellesProblemes {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionExponentiellesProblemes, resultat: ResultatExerciceExponentiellesProblemes): EtatSessionExponentiellesProblemes {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function construireResultat(exercice: ExerciceExponentiellesProblemes, scores: Partial<Record<PhaseExponentiellesProblemes, number>>): ResultatExerciceExponentiellesProblemes {
  switch (exercice.famille) {
    case "A":
      return { famille: "A", exercice, scoreEcran1: scores.aEcran1 as number, scoreEcran2: scores.aEcran2 as number };
    case "B":
      return { famille: "B", exercice, scoreEcran1: scores.bEcran1 as number, scoreEcran2: scores.bEcran2 as number, scoreEcran3: scores.bEcran3 as number, scoreEcran4: scores.bEcran4 as number };
    case "C":
      return { famille: "C", exercice, scoreEcran1: scores.cEcran1 as number, scoreEcran2: scores.cEcran2 as number, scoreEcran3: scores.cEcran3 as number };
    case "D":
      return { famille: "D", exercice, scoreEcran1: scores.dEcran1 as number, scoreEcran2: scores.dEcran2 as number, scoreEcran3: scores.dEcran3 as number, scoreEcran4: scores.dEcran4 as number };
    case "E":
      return { famille: "E", exercice, scoreEcran1: scores.eEcran1 as number, scoreEcran2: scores.eEcran2 as number, scoreEcran3: scores.eEcran3 as number };
    case "F":
      return { famille: "F", exercice, scoreEcran1: scores.fEcran1 as number, scoreEcran2: scores.fEcran2 as number, scoreEcran3: scores.fEcran3 as number, scoreEcran4: scores.fEcran4 as number };
    case "G":
      return { famille: "G", exercice, scoreEcran1: scores.gEcran1 as number, scoreEcran2: scores.gEcran2 as number, scoreEcran3: scores.gEcran3 as number };
  }
}

function avancerPhase<TReponse>(
  etat: EtatSessionExponentiellesProblemes,
  reponse: TReponse,
  verifier: (exercice: ExerciceExponentiellesProblemes, reponse: TReponse) => boolean,
  phaseAttendue: PhaseExponentiellesProblemes,
): EtatSessionExponentiellesProblemes {
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

export function soumettreReponseAEcran1(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "A" ? verifierAEcran1(e, r) : false), "aEcran1");
}
export function soumettreReponseAEcran2(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "A" ? verifierAEcran2(e, r) : false), "aEcran2");
}

// ============================================================================
// Famille B.
// ============================================================================

export function soumettreReponseBEcran1(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBEcran1(e, r) : false), "bEcran1");
}
export function soumettreReponseBEcran2(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBEcran2(e, r) : false), "bEcran2");
}
export function soumettreReponseBEcran3(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBEcran3(e, r) : false), "bEcran3");
}
export function soumettreReponseBEcran4(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBEcran4(e, r) : false), "bEcran4");
}

// ============================================================================
// Famille C.
// ============================================================================

export function soumettreReponseCEcran1(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCEcran1(e, r) : false), "cEcran1");
}
export function soumettreReponseCEcran2(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCEcran2(e, r) : false), "cEcran2");
}
export function soumettreReponseCEcran3(etat: EtatSessionExponentiellesProblemes, textes: string[]): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, textes, (e, r) => (e.famille === "C" ? verifierCEcran3(e, r) : false), "cEcran3");
}

// ============================================================================
// Famille D.
// ============================================================================

export function soumettreReponseDEcran1(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "D" ? verifierDEcran1(e, r) : false), "dEcran1");
}
export function soumettreReponseDEcran2(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "D" ? verifierDEcran2(e, r) : false), "dEcran2");
}
export function soumettreReponseDEcran3(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "D" ? verifierDEcran3(e, r) : false), "dEcran3");
}
export function soumettreReponseDEcran4(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "D" ? verifierDEcran4(e, r) : false), "dEcran4");
}

// ============================================================================
// Famille E.
// ============================================================================

export function soumettreReponseEEcran1(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "E" ? verifierEEcran1(e, r) : false), "eEcran1");
}
export function soumettreReponseEEcran2(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "E" ? verifierEEcran2(e, r) : false), "eEcran2");
}
export function soumettreReponseEEcran3(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "E" ? verifierEEcran3(e, r) : false), "eEcran3");
}

// ============================================================================
// Famille F.
// ============================================================================

export function soumettreReponseFEcran1(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "F" ? verifierFEcran1(e, r) : false), "fEcran1");
}
export function soumettreReponseFEcran2(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "F" ? verifierFEcran2(e, r) : false), "fEcran2");
}
export function soumettreReponseFEcran3(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "F" ? verifierFEcran3(e, r) : false), "fEcran3");
}
export function soumettreReponseFEcran4(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "F" ? verifierFEcran4(e, r) : false), "fEcran4");
}

// ============================================================================
// Famille G.
// ============================================================================

export interface ReponseGEcran1 {
  texte1: string;
  texte2: string;
}

export function soumettreReponseGEcran1(etat: EtatSessionExponentiellesProblemes, reponse: ReponseGEcran1): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "G" ? verifierGEcran1(e, r.texte1, r.texte2) : false), "gEcran1");
}
export function soumettreReponseGEcran2(etat: EtatSessionExponentiellesProblemes, texte: string): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "G" ? verifierGEcran2(e, r) : false), "gEcran2");
}
export function soumettreReponseGEcran3(etat: EtatSessionExponentiellesProblemes, atteignable: boolean): EtatSessionExponentiellesProblemes {
  return avancerPhase(etat, atteignable, (e, r) => (e.famille === "G" ? verifierGEcran3(e, r) : false), "gEcran3");
}
