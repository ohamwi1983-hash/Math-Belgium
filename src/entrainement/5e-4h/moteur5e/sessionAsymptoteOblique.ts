/**
 * Couche B (5e) — moteur de session pour 5gen21 ("Asymptote oblique"). N'importe jamais rien de
 * `src/generateurs5e/`.
 */
import type { ExerciceAsymptoteOblique } from "../core5e/asymptoteOblique.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesAsymptoteOblique";
import type { EtatSessionAsymptoteOblique, PhaseAsymptoteOblique, ResultatExerciceAsymptoteOblique } from "./typesAsymptoteOblique";
import { diagnostiquerFormeDeveloppee, diagnostiquerNombre, diagnostiquerQuotient } from "./verificationAsymptoteOblique";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran), comme 5gen20. */
export const NIVEAU_AIDE_MAX_ASYMPTOTE_OBLIQUE = 2;

export function niveauAideMaxAsymptoteOblique(): number {
  return NIVEAU_AIDE_MAX_ASYMPTOTE_OBLIQUE;
}

function etatInitial(exercice: ExerciceAsymptoteOblique): Pick<EtatSessionAsymptoteOblique, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionAsymptoteOblique(reglages: ReglagesSession5e, generateur: () => ExerciceAsymptoteOblique): EtatSessionAsymptoteOblique {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionAsymptoteOblique): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionAsymptoteOblique): EtatSessionAsymptoteOblique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_ASYMPTOTE_OBLIQUE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionAsymptoteOblique, resultat: ResultatExerciceAsymptoteOblique, revele: boolean): EtatSessionAsymptoteOblique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionAsymptoteOblique, phaseAttendue: PhaseAsymptoteOblique, reponse: T, verifier: (r: T) => boolean): EtatSessionAsymptoteOblique {
  if (etat.terminee || etat.phase !== phaseAttendue) throw new Error(`soumettreEcran : la session n'est pas à l'étape ${phaseAttendue}`);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [phaseAttendue]: score };
  const phaseSuivante = phaseApres(etat.exerciceCourant, phaseAttendue);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, scoresPartiels, derniereEtapeRevelee: revele };
}

// ============================================================================
// Écrans propres à "divisionEuclidienne".
// ============================================================================

export interface ReponseDiviserEuclidienne {
  quotient: string;
  reste: string;
}

export function soumettreReponseDiviserEuclidienne(etat: EtatSessionAsymptoteOblique, reponse: ReponseDiviserEuclidienne): EtatSessionAsymptoteOblique {
  const { a, b, c } = etat.exerciceCourant;
  return soumettreEcran(etat, "diviserEuclidienne", reponse, (r) => diagnostiquerQuotient(r.quotient, a, b) === "correct" && diagnostiquerNombre(r.reste, c) === "correct");
}

export function soumettreReponseEcrireFormeDeveloppee(etat: EtatSessionAsymptoteOblique, texte: string): EtatSessionAsymptoteOblique {
  const { a, b, c, coeffsD } = etat.exerciceCourant;
  return soumettreEcran(etat, "ecrireFormeDeveloppee", texte, (t) => diagnostiquerFormeDeveloppee(t, a, b, c, coeffsD) === "correct");
}

// ============================================================================
// Écrans propres à "viaLimites".
// ============================================================================

export function soumettreReponseCalculerCoefficientA(etat: EtatSessionAsymptoteOblique, texte: string): EtatSessionAsymptoteOblique {
  const { a } = etat.exerciceCourant;
  return soumettreEcran(etat, "calculerCoefficientA", texte, (t) => diagnostiquerNombre(t, a) === "correct");
}

export function soumettreReponseCalculerCoefficientB(etat: EtatSessionAsymptoteOblique, texte: string): EtatSessionAsymptoteOblique {
  const { b } = etat.exerciceCourant;
  return soumettreEcran(etat, "calculerCoefficientB", texte, (t) => diagnostiquerNombre(t, b) === "correct");
}

// ============================================================================
// Écran partagé par les 2 variantes.
// ============================================================================

export function soumettreReponseConclureEquationAsymptote(etat: EtatSessionAsymptoteOblique, texte: string): EtatSessionAsymptoteOblique {
  const { a, b } = etat.exerciceCourant;
  return soumettreEcran(etat, "conclureEquationAsymptote", texte, (t) => diagnostiquerQuotient(t, a, b) === "correct");
}
