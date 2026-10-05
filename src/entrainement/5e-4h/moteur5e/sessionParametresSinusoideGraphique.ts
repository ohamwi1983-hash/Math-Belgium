/**
 * Couche B (5e) — moteur de session pour 5gen9 ("Paramètres d'une fonction sinusoïdale — lecture
 * graphique"). N'importe jamais rien de `src/generateurs5e/` — voir
 * `sessionParametresSinusoideGraphique.test.ts` pour la preuve avec un exercice factice défini
 * localement. Séquence FIXE à 5 écrans (b, A, T, f, φ), jamais de saut conditionnel.
 */
import type { ExerciceParametresSinusoideGraphique } from "../core5e/parametresSinusoideGraphique.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesParametresSinusoideGraphique";
import type { EtatSessionParametresSinusoideGraphique, PhaseParametresSinusoideGraphique, ResultatExerciceParametresSinusoideGraphique } from "./typesParametresSinusoideGraphique";
import { cibleAmplitude, cibleAscendantPrincipal, cibleDecalage, cibleFrequence, ciblePeriode, verifierPhiModuloT, verifierValeurSinusoide } from "./verificationParametresSinusoideGraphique";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Chaque écran a exactement 2 niveaux d'aide — spec explicite. */
export const NIVEAU_AIDE_MAX_SINUSOIDE_GRAPHIQUE = 2;

function verifierReponse(exercice: ExerciceParametresSinusoideGraphique, phase: PhaseParametresSinusoideGraphique, texte: string): boolean {
  switch (phase) {
    case "decalage":
      return verifierValeurSinusoide(texte, cibleDecalage(exercice));
    case "amplitude":
      return verifierValeurSinusoide(texte, cibleAmplitude(exercice));
    case "periode":
      return verifierValeurSinusoide(texte, ciblePeriode(exercice));
    case "frequence":
      return verifierValeurSinusoide(texte, cibleFrequence(exercice));
    case "phi":
      return verifierPhiModuloT(texte, cibleAscendantPrincipal(exercice), ciblePeriode(exercice));
  }
}

function etatInitial(exercice: ExerciceParametresSinusoideGraphique): Pick<EtatSessionParametresSinusoideGraphique, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoreDecalagePartiel" | "scoreAmplitudePartiel" | "scorePeriodePartiel" | "scoreFrequencePartiel"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoreDecalagePartiel: null,
    scoreAmplitudePartiel: null,
    scorePeriodePartiel: null,
    scoreFrequencePartiel: null,
  };
}

export function demarrerSessionParametresSinusoideGraphique(reglages: ReglagesSession5e, generateur: () => ExerciceParametresSinusoideGraphique): EtatSessionParametresSinusoideGraphique {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionParametresSinusoideGraphique): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionParametresSinusoideGraphique): EtatSessionParametresSinusoideGraphique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_SINUSOIDE_GRAPHIQUE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionParametresSinusoideGraphique, resultat: ResultatExerciceParametresSinusoideGraphique, revele: boolean): EtatSessionParametresSinusoideGraphique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

export function soumettreReponseParametresSinusoideGraphique(etat: EtatSessionParametresSinusoideGraphique, texte: string): EtatSessionParametresSinusoideGraphique {
  if (etat.terminee) throw new Error("soumettreReponseParametresSinusoideGraphique : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (t) => verifierReponse(exercice, phase, t),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const phaseSuivante = phaseApres(phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(
      etat,
      {
        exercice,
        scoreDecalage: etat.scoreDecalagePartiel as number,
        scoreAmplitude: etat.scoreAmplitudePartiel as number,
        scorePeriode: etat.scorePeriodePartiel as number,
        scoreFrequence: etat.scoreFrequencePartiel as number,
        scorePhi: score,
      },
      revele,
    );
  }

  const partielsMisAJour: Partial<EtatSessionParametresSinusoideGraphique> = {};
  if (phase === "decalage") partielsMisAJour.scoreDecalagePartiel = score;
  else if (phase === "amplitude") partielsMisAJour.scoreAmplitudePartiel = score;
  else if (phase === "periode") partielsMisAJour.scorePeriodePartiel = score;
  else if (phase === "frequence") partielsMisAJour.scoreFrequencePartiel = score;

  return { ...etat, ...partielsMisAJour, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereEtapeRevelee: revele };
}
