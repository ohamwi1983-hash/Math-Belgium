/**
 * Couche B (5e) — moteur de session pour 5gen8 ("Paramètres d'une fonction sinusoïdale"). N'importe
 * jamais rien de `src/generateurs5e/` — voir `sessionParametresSinusoide.test.ts` pour la preuve
 * avec un exercice factice défini localement.
 *
 * Séquence FIXE à 5 écrans (A, φ, T, f, b), jamais de saut conditionnel — plus simple que la
 * plupart des moteurs récents de la plateforme à cet égard (même principe que "Caractéristiques
 * d'une fonction", chapitre 2 de la 4e).
 */
import type { ExerciceParametresSinusoide } from "../core5e/parametresSinusoide.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesParametresSinusoide";
import type { EtatSessionParametresSinusoide, PhaseParametresSinusoide, ResultatExerciceParametresSinusoide } from "./typesParametresSinusoide";
import { cibleAmplitude, cibleDecalage, cibleDephasage, cibleFrequence, ciblePeriode, verifierValeurSinusoide } from "./verificationParametresSinusoide";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Chaque écran a exactement 2 niveaux d'aide — spec explicite. */
export const NIVEAU_AIDE_MAX_SINUSOIDE = 2;

function cibleActuelle(exercice: ExerciceParametresSinusoide, phase: PhaseParametresSinusoide): number {
  switch (phase) {
    case "amplitude":
      return cibleAmplitude(exercice);
    case "phi":
      return cibleDephasage(exercice);
    case "periode":
      return ciblePeriode(exercice);
    case "frequence":
      return cibleFrequence(exercice);
    case "decalage":
      return cibleDecalage(exercice);
  }
}

function etatInitial(exercice: ExerciceParametresSinusoide): Pick<EtatSessionParametresSinusoide, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoreAmplitudePartiel" | "scorePhiPartiel" | "scorePeriodePartiel" | "scoreFrequencePartiel"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoreAmplitudePartiel: null,
    scorePhiPartiel: null,
    scorePeriodePartiel: null,
    scoreFrequencePartiel: null,
  };
}

export function demarrerSessionParametresSinusoide(reglages: ReglagesSession5e, generateur: () => ExerciceParametresSinusoide): EtatSessionParametresSinusoide {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionParametresSinusoide): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
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
  const cible = cibleActuelle(exercice, etat.phase);

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (t) => verifierValeurSinusoide(t, cible),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(
      etat,
      {
        exercice,
        scoreAmplitude: etat.scoreAmplitudePartiel as number,
        scorePhi: etat.scorePhiPartiel as number,
        scorePeriode: etat.scorePeriodePartiel as number,
        scoreFrequence: etat.scoreFrequencePartiel as number,
        scoreDecalage: score,
      },
      revele,
    );
  }

  const partielsMisAJour: Partial<EtatSessionParametresSinusoide> = {};
  if (etat.phase === "amplitude") partielsMisAJour.scoreAmplitudePartiel = score;
  else if (etat.phase === "phi") partielsMisAJour.scorePhiPartiel = score;
  else if (etat.phase === "periode") partielsMisAJour.scorePeriodePartiel = score;
  else if (etat.phase === "frequence") partielsMisAJour.scoreFrequencePartiel = score;

  return { ...etat, ...partielsMisAJour, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereEtapeRevelee: revele };
}
