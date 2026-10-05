/**
 * Couche B (6e) — moteur de session pour `6gen9`. N'importe jamais rien de
 * `src/generateurs6e/` — voir `sessionEquationsExponentielles.test.ts` pour la preuve avec des
 * exercices factices définis localement.
 */
import type { ExerciceEquationExponentielle } from "../core6e/equationsExponentielles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesEquationsExponentielles";
import type { EtatSessionEquationExponentielle, PhaseEquationExponentielle, ResultatExerciceEquationExponentielle } from "./typesEquationsExponentielles";
import { verifierAEcran1, verifierAEcran2Liste, verifierAEcran2Valeur, verifierBEcran1, verifierBEcran2, verifierCEcran1, verifierCEcran2, verifierCEcran3, verifierDEcran } from "./verificationEquationsExponentielles";
import type { ReponseValeurOuVide } from "./verificationEquationsExponentielles";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (spec explicite pour chaque famille). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceEquationExponentielle,
): Pick<EtatSessionEquationExponentielle, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionEquationExponentielle(reglages: ReglagesSession6e, generateur: () => ExerciceEquationExponentielle): EtatSessionEquationExponentielle {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionEquationExponentielle): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionEquationExponentielle): EtatSessionEquationExponentielle {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionEquationExponentielle, resultat: ResultatExerciceEquationExponentielle): EtatSessionEquationExponentielle {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function construireResultat(exercice: ExerciceEquationExponentielle, scores: Partial<Record<PhaseEquationExponentielle, number>>): ResultatExerciceEquationExponentielle {
  switch (exercice.famille) {
    case "A":
      return { famille: "A", exercice, scoreEcran1: scores.aEcran1 as number, scoreEcran2: scores.aEcran2 as number };
    case "B":
      return { famille: "B", exercice, scoreEcran1: scores.bEcran1 as number, scoreEcran2: scores.bEcran2 as number };
    case "C":
      return { famille: "C", exercice, scoreEcran1: scores.cEcran1 as number, scoreEcran2: scores.cEcran2 as number, scoreEcran3: scores.cEcran3 as number };
    case "D":
      return { famille: "D", exercice, score: scores.dEcran as number };
  }
}

function avancerPhase<TReponse>(
  etat: EtatSessionEquationExponentielle,
  reponse: TReponse,
  verifier: (exercice: ExerciceEquationExponentielle, reponse: TReponse) => boolean,
  phaseAttendue: PhaseEquationExponentielle,
): EtatSessionEquationExponentielle {
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

export function soumettreReponseAEcran1(etat: EtatSessionEquationExponentielle, texte: string): EtatSessionEquationExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "A" ? verifierAEcran1(e, r) : false), "aEcran1");
}

/** A1/A2 uniquement — `App6gen9.tsx` choisit cette fonction ou `soumettreReponseAEcran2Liste`
 * selon `exercice.sousType`. */
export function soumettreReponseAEcran2Valeur(etat: EtatSessionEquationExponentielle, texte: string): EtatSessionEquationExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "A" ? verifierAEcran2Valeur(e, r) : false), "aEcran2");
}

/** A3 uniquement. */
export function soumettreReponseAEcran2Liste(etat: EtatSessionEquationExponentielle, textes: string[]): EtatSessionEquationExponentielle {
  return avancerPhase(etat, textes, (e, r) => (e.famille === "A" ? verifierAEcran2Liste(e, r) : false), "aEcran2");
}

// ============================================================================
// Famille B.
// ============================================================================

export function soumettreReponseBEcran1(etat: EtatSessionEquationExponentielle, texte: string): EtatSessionEquationExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "B" ? verifierBEcran1(e, r) : false), "bEcran1");
}

export function soumettreReponseBEcran2(etat: EtatSessionEquationExponentielle, reponse: ReponseValeurOuVide): EtatSessionEquationExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "B" ? verifierBEcran2(e, r) : false), "bEcran2");
}

// ============================================================================
// Famille C.
// ============================================================================

export function soumettreReponseCEcran1(etat: EtatSessionEquationExponentielle, texte: string): EtatSessionEquationExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" ? verifierCEcran1(e, r) : false), "cEcran1");
}

export function soumettreReponseCEcran2(etat: EtatSessionEquationExponentielle, textes: string[]): EtatSessionEquationExponentielle {
  return avancerPhase(etat, textes, (e, r) => (e.famille === "C" ? verifierCEcran2(e, r) : false), "cEcran2");
}

export function soumettreReponseCEcran3(etat: EtatSessionEquationExponentielle, textes: string[]): EtatSessionEquationExponentielle {
  return avancerPhase(etat, textes, (e, r) => (e.famille === "C" ? verifierCEcran3(e, r) : false), "cEcran3");
}

// ============================================================================
// Famille D.
// ============================================================================

export function soumettreReponseDEcran(etat: EtatSessionEquationExponentielle, existeUneSolution: boolean): EtatSessionEquationExponentielle {
  return avancerPhase(etat, existeUneSolution, (e, r) => (e.famille === "D" ? verifierDEcran(e, r) : false), "dEcran");
}
