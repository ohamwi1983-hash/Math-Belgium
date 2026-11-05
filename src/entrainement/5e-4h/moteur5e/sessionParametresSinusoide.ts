/**
 * Couche B (5e) — moteur de session pour 5gen8 ("Paramètres d'une fonction sinusoïdale"). N'importe
 * jamais rien de `src/generateurs5e/` — voir `sessionParametresSinusoide.test.ts` pour la preuve
 * avec un exercice factice défini localement.
 *
 * Séquence FIXE à 7 écrans (A, ω, T, f, φ, Φ, b), jamais de saut conditionnel — plus simple que la
 * plupart des moteurs récents de la plateforme à cet égard (même principe que "Caractéristiques
 * d'une fonction", chapitre 2 de la 4e).
 */
import type { ExerciceParametresSinusoide } from "../core5e/parametresSinusoide.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesParametresSinusoide";
import type { EtatSessionParametresSinusoide, ResultatExerciceParametresSinusoide } from "./typesParametresSinusoide";
import { diagnostiquerPhaseParametresSinusoide } from "./verificationParametresSinusoide";

const POINTS_DE_BASE = 100;

/** Chaque écran a exactement 2 niveaux d'aide — spec explicite. */
export const NIVEAU_AIDE_MAX_SINUSOIDE = 2;

function etatInitial(
  exercice: ExerciceParametresSinusoide,
): Pick<
  EtatSessionParametresSinusoide,
  | "exerciceCourant"
  | "phase"
  | "etapeCourante"
  | "niveauAide"
  | "scoreAmplitudePartiel"
  | "amplitudeRevele"
  | "scorePulsationPartiel"
  | "pulsationRevele"
  | "scoreDephasagePartiel"
  | "dephasageRevele"
  | "scorePhiPartiel"
  | "phiRevele"
  | "scorePeriodePartiel"
  | "periodeRevele"
  | "scoreFrequencePartiel"
  | "frequenceRevele"
> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoreAmplitudePartiel: null,
    amplitudeRevele: false,
    scorePulsationPartiel: null,
    pulsationRevele: false,
    scoreDephasagePartiel: null,
    dephasageRevele: false,
    scorePhiPartiel: null,
    phiRevele: false,
    scorePeriodePartiel: null,
    periodeRevele: false,
    scoreFrequencePartiel: null,
    frequenceRevele: false,
  };
}

export function demarrerSessionParametresSinusoide(reglages: ReglagesSession5e, generateur: () => ExerciceParametresSinusoide): EtatSessionParametresSinusoide {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionParametresSinusoide): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax };
}

export function activerAideSuivante(etat: EtatSessionParametresSinusoide): EtatSessionParametresSinusoide {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_SINUSOIDE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionParametresSinusoide, resultat: ResultatExerciceParametresSinusoide, revele: boolean): EtatSessionParametresSinusoide {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

export function soumettreReponseParametresSinusoide(etat: EtatSessionParametresSinusoide, texte: string): EtatSessionParametresSinusoide {
  if (etat.terminee) throw new Error("soumettreReponseParametresSinusoide : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (t) => diagnostiquerPhaseParametresSinusoide(exercice, phase, t) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = etapeCourante.score as number;
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(
      etat,
      {
        exercice,
        scoreAmplitude: etat.scoreAmplitudePartiel as number,
        scorePulsation: etat.scorePulsationPartiel as number,
        scoreDephasage: etat.scoreDephasagePartiel as number,
        scorePhi: etat.scorePhiPartiel as number,
        scorePeriode: etat.scorePeriodePartiel as number,
        scoreFrequence: etat.scoreFrequencePartiel as number,
        scoreDecalage: score,
      },
      revele,
    );
  }

  const partielsMisAJour: Partial<EtatSessionParametresSinusoide> = {};
  if (etat.phase === "amplitude") {
    partielsMisAJour.scoreAmplitudePartiel = score;
    partielsMisAJour.amplitudeRevele = revele;
  } else if (etat.phase === "pulsation") {
    partielsMisAJour.scorePulsationPartiel = score;
    partielsMisAJour.pulsationRevele = revele;
  } else if (etat.phase === "dephasage") {
    partielsMisAJour.scoreDephasagePartiel = score;
    partielsMisAJour.dephasageRevele = revele;
  } else if (etat.phase === "phi") {
    partielsMisAJour.scorePhiPartiel = score;
    partielsMisAJour.phiRevele = revele;
  } else if (etat.phase === "periode") {
    partielsMisAJour.scorePeriodePartiel = score;
    partielsMisAJour.periodeRevele = revele;
  } else if (etat.phase === "frequence") {
    partielsMisAJour.scoreFrequencePartiel = score;
    partielsMisAJour.frequenceRevele = revele;
  }

  return { ...etat, ...partielsMisAJour, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereEtapeRevelee: revele };
}
