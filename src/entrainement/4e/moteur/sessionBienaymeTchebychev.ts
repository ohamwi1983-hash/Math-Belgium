/**
 * Couche B — moteur de session pour "Inégalité de Bienaymé-Tchebychev" (chapitre 5) — refonte
 * complète. N'importe jamais rien de `src/generateurs/` — voir `sessionBienaymeTchebychev.test.ts`
 * pour la preuve avec des générateurs factices, même principe que les 36 autres moteurs.
 *
 * Chaque variante traverse une SÉQUENCE FIXE et disjointe des autres (`SEQUENCES`,
 * `typesBienaymeTchebychev.ts`) — `soumettrePhase` (privée) factorise le motif commun (tentatives,
 * pénalité additive par niveau d'aide, transition vers l'écran suivant ou clôture de l'exercice) ;
 * chaque `soumettreReponseXxx` exporté n'est qu'un thin wrapper typé par écran (même patron que
 * "Orthogonalité et théorème de Pythagore généralisé").
 */
import type { ExerciceBienaymeTchebychev, GenerateurExerciceBienaymeTchebychev } from "../core/bienaymeTchebychev.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { ReponseIntervalle } from "./verificationBienaymeTchebychev";
import {
  verifierIntervalleAttendu,
  verifierK,
  verifierNombre,
  verifierPourcent,
  verifierPourcentDepuisNombre,
  verifierSigma,
  verifierXBar,
} from "./verificationBienaymeTchebychev";
import { NIVEAU_AIDE_MAX, SEQUENCES } from "./typesBienaymeTchebychev";
import type { EtatSessionBienaymeTchebychev, PhaseBienaymeTchebychev, ResultatExerciceBienaymeTchebychev, ScoreEcran } from "./typesBienaymeTchebychev";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

function phaseInitiale(exercice: ExerciceBienaymeTchebychev): PhaseBienaymeTchebychev {
  return SEQUENCES[exercice.variante][0];
}

function phaseSuivante(exercice: ExerciceBienaymeTchebychev, phaseActuelle: PhaseBienaymeTchebychev): PhaseBienaymeTchebychev | null {
  const sequence = SEQUENCES[exercice.variante];
  const index = sequence.indexOf(phaseActuelle);
  return index + 1 < sequence.length ? sequence[index + 1] : null;
}

function etatInitial(
  exercice: ExerciceBienaymeTchebychev,
): Pick<EtatSessionBienaymeTchebychev, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresAccumules"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(exercice),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules: {},
  };
}

export function demarrerSessionBienaymeTchebychev(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceBienaymeTchebychev,
): EtatSessionBienaymeTchebychev {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionBienaymeTchebychev): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Pénalité additive, jamais sous 0 — un cran de plus retire toujours 20 points supplémentaires. */
function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

/** Révèle le niveau d'aide suivant de l'écran courant — lève si la session est terminée, ou si le
 * niveau maximal de l'écran courant est déjà atteint (rien de plus à révéler, y compris pour un
 * écran à `max=0`). */
export function activerAideSuivante(etat: EtatSessionBienaymeTchebychev): EtatSessionBienaymeTchebychev {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  const max = NIVEAU_AIDE_MAX[etat.phase];
  if (etat.niveauAide >= max) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function champ(scoresAccumules: Partial<Record<PhaseBienaymeTchebychev, ScoreEcran>>, phase: PhaseBienaymeTchebychev): { score: number | null; revele: boolean; niveauAide: number } {
  const entree = scoresAccumules[phase];
  if (entree === undefined) return { score: null, revele: false, niveauAide: 0 };
  return entree;
}

function construireResultat(
  exercice: ExerciceBienaymeTchebychev,
  scoresAccumules: Partial<Record<PhaseBienaymeTchebychev, ScoreEcran>>,
): ResultatExerciceBienaymeTchebychev {
  const v1K = champ(scoresAccumules, "v1K");
  const v1Pourcent = champ(scoresAccumules, "v1Pourcent");
  const v2K = champ(scoresAccumules, "v2K");
  const v2Intervalle = champ(scoresAccumules, "v2Intervalle");
  const v3K = champ(scoresAccumules, "v3K");
  const v3Pourcent = champ(scoresAccumules, "v3Pourcent");
  const v3Nombre = champ(scoresAccumules, "v3Nombre");
  const v4Pourcent0 = champ(scoresAccumules, "v4Pourcent0");
  const v4K = champ(scoresAccumules, "v4K");
  const v4Intervalle = champ(scoresAccumules, "v4Intervalle");
  const v5K = champ(scoresAccumules, "v5K");
  const v5Sigma = champ(scoresAccumules, "v5Sigma");
  const v6K = champ(scoresAccumules, "v6K");
  const v6XBar = champ(scoresAccumules, "v6XBar");
  const v7Pourcent0 = champ(scoresAccumules, "v7Pourcent0");
  const v7K = champ(scoresAccumules, "v7K");
  const v7Sigma = champ(scoresAccumules, "v7Sigma");
  const v8Pourcent0 = champ(scoresAccumules, "v8Pourcent0");
  const v8K = champ(scoresAccumules, "v8K");
  const v8XBar = champ(scoresAccumules, "v8XBar");

  return {
    variante: exercice.variante,
    scoreV1K: v1K.score,
    v1KRevele: v1K.revele,
    niveauAideV1K: v1K.niveauAide,
    scoreV1Pourcent: v1Pourcent.score,
    v1PourcentRevele: v1Pourcent.revele,
    niveauAideV1Pourcent: v1Pourcent.niveauAide,
    scoreV2K: v2K.score,
    v2KRevele: v2K.revele,
    niveauAideV2K: v2K.niveauAide,
    scoreV2Intervalle: v2Intervalle.score,
    v2IntervalleRevele: v2Intervalle.revele,
    niveauAideV2Intervalle: v2Intervalle.niveauAide,
    scoreV3K: v3K.score,
    v3KRevele: v3K.revele,
    niveauAideV3K: v3K.niveauAide,
    scoreV3Pourcent: v3Pourcent.score,
    v3PourcentRevele: v3Pourcent.revele,
    niveauAideV3Pourcent: v3Pourcent.niveauAide,
    scoreV3Nombre: v3Nombre.score,
    v3NombreRevele: v3Nombre.revele,
    niveauAideV3Nombre: v3Nombre.niveauAide,
    scoreV4Pourcent0: v4Pourcent0.score,
    v4Pourcent0Revele: v4Pourcent0.revele,
    niveauAideV4Pourcent0: v4Pourcent0.niveauAide,
    scoreV4K: v4K.score,
    v4KRevele: v4K.revele,
    niveauAideV4K: v4K.niveauAide,
    scoreV4Intervalle: v4Intervalle.score,
    v4IntervalleRevele: v4Intervalle.revele,
    niveauAideV4Intervalle: v4Intervalle.niveauAide,
    scoreV5K: v5K.score,
    v5KRevele: v5K.revele,
    niveauAideV5K: v5K.niveauAide,
    scoreV5Sigma: v5Sigma.score,
    v5SigmaRevele: v5Sigma.revele,
    niveauAideV5Sigma: v5Sigma.niveauAide,
    scoreV6K: v6K.score,
    v6KRevele: v6K.revele,
    niveauAideV6K: v6K.niveauAide,
    scoreV6XBar: v6XBar.score,
    v6XBarRevele: v6XBar.revele,
    niveauAideV6XBar: v6XBar.niveauAide,
    scoreV7Pourcent0: v7Pourcent0.score,
    v7Pourcent0Revele: v7Pourcent0.revele,
    niveauAideV7Pourcent0: v7Pourcent0.niveauAide,
    scoreV7K: v7K.score,
    v7KRevele: v7K.revele,
    niveauAideV7K: v7K.niveauAide,
    scoreV7Sigma: v7Sigma.score,
    v7SigmaRevele: v7Sigma.revele,
    niveauAideV7Sigma: v7Sigma.niveauAide,
    scoreV8Pourcent0: v8Pourcent0.score,
    v8Pourcent0Revele: v8Pourcent0.revele,
    niveauAideV8Pourcent0: v8Pourcent0.niveauAide,
    scoreV8K: v8K.score,
    v8KRevele: v8K.revele,
    niveauAideV8K: v8K.niveauAide,
    scoreV8XBar: v8XBar.score,
    v8XBarRevele: v8XBar.revele,
    niveauAideV8XBar: v8XBar.niveauAide,
  };
}

function cloturerExerciceOuSuivant(etat: EtatSessionBienaymeTchebychev, resultat: ResultatExerciceBienaymeTchebychev): EtatSessionBienaymeTchebychev {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    ...etatInitial(etat.generateur()),
  };
}

/** Factorise le motif commun à tous les écrans : tentatives, pénalité additive par niveau d'aide,
 * transition vers l'écran suivant de la séquence de la variante, ou clôture de l'exercice si
 * `phaseAttendue` est la dernière de sa séquence. */
function soumettrePhase<R>(etat: EtatSessionBienaymeTchebychev, phaseAttendue: PhaseBienaymeTchebychev, reponse: R, verifier: (reponse: R) => boolean): EtatSessionBienaymeTchebychev {
  if (etat.terminee || etat.phase !== phaseAttendue) {
    throw new Error(`soumettrePhase(${phaseAttendue}) : la session n'est pas à cette étape`);
  }

  const etapeCourante = soumettreEtapeTentatives<R>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const scoresAccumules: Partial<Record<PhaseBienaymeTchebychev, ScoreEcran>> = {
    ...etat.scoresAccumules,
    [phaseAttendue]: { score, revele: etapeCourante.revelee, niveauAide: etat.niveauAide },
  };

  const suivante = phaseSuivante(etat.exerciceCourant, phaseAttendue);
  if (suivante === null) {
    return cloturerExerciceOuSuivant(etat, construireResultat(etat.exerciceCourant, scoresAccumules));
  }

  return { ...etat, etapeCourante: demarrerEtapeTentatives(), phase: suivante, niveauAide: 0, scoresAccumules };
}

// ============================================================================
// Un wrapper par écran — voir `verificationBienaymeTchebychev.ts` pour la logique de vérification.
// ============================================================================

export function soumettreReponseV1K(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "intervalleVersPourcent") throw new Error("soumettreReponseV1K : réservé à la variante 'intervalleVersPourcent'");
  return soumettrePhase(etat, "v1K", texte, (t) => verifierK(exercice, t));
}

export function soumettreReponseV1Pourcent(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "intervalleVersPourcent") throw new Error("soumettreReponseV1Pourcent : réservé à la variante 'intervalleVersPourcent'");
  return soumettrePhase(etat, "v1Pourcent", texte, (t) => verifierPourcent(exercice, t));
}

export function soumettreReponseV2K(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "pourcentVersIntervalle") throw new Error("soumettreReponseV2K : réservé à la variante 'pourcentVersIntervalle'");
  return soumettrePhase(etat, "v2K", texte, (t) => verifierK(exercice, t));
}

export function soumettreReponseV2Intervalle(etat: EtatSessionBienaymeTchebychev, reponse: ReponseIntervalle): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "pourcentVersIntervalle") throw new Error("soumettreReponseV2Intervalle : réservé à la variante 'pourcentVersIntervalle'");
  return soumettrePhase(etat, "v2Intervalle", reponse, (r) => verifierIntervalleAttendu(exercice, r));
}

export function soumettreReponseV3K(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "intervalleVersNombre") throw new Error("soumettreReponseV3K : réservé à la variante 'intervalleVersNombre'");
  return soumettrePhase(etat, "v3K", texte, (t) => verifierK(exercice, t));
}

export function soumettreReponseV3Pourcent(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "intervalleVersNombre") throw new Error("soumettreReponseV3Pourcent : réservé à la variante 'intervalleVersNombre'");
  return soumettrePhase(etat, "v3Pourcent", texte, (t) => verifierPourcent(exercice, t));
}

export function soumettreReponseV3Nombre(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "intervalleVersNombre") throw new Error("soumettreReponseV3Nombre : réservé à la variante 'intervalleVersNombre'");
  return soumettrePhase(etat, "v3Nombre", texte, (t) => verifierNombre(exercice, t));
}

export function soumettreReponseV4Pourcent0(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "nombreVersIntervalle") throw new Error("soumettreReponseV4Pourcent0 : réservé à la variante 'nombreVersIntervalle'");
  return soumettrePhase(etat, "v4Pourcent0", texte, (t) => verifierPourcentDepuisNombre(exercice, t));
}

export function soumettreReponseV4K(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "nombreVersIntervalle") throw new Error("soumettreReponseV4K : réservé à la variante 'nombreVersIntervalle'");
  return soumettrePhase(etat, "v4K", texte, (t) => verifierK(exercice, t));
}

export function soumettreReponseV4Intervalle(etat: EtatSessionBienaymeTchebychev, reponse: ReponseIntervalle): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "nombreVersIntervalle") throw new Error("soumettreReponseV4Intervalle : réservé à la variante 'nombreVersIntervalle'");
  return soumettrePhase(etat, "v4Intervalle", reponse, (r) => verifierIntervalleAttendu(exercice, r));
}

export function soumettreReponseV5K(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "intervalleVersSigma") throw new Error("soumettreReponseV5K : réservé à la variante 'intervalleVersSigma'");
  return soumettrePhase(etat, "v5K", texte, (t) => verifierK(exercice, t));
}

export function soumettreReponseV5Sigma(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "intervalleVersSigma") throw new Error("soumettreReponseV5Sigma : réservé à la variante 'intervalleVersSigma'");
  return soumettrePhase(etat, "v5Sigma", texte, (t) => verifierSigma(exercice, t));
}

export function soumettreReponseV6K(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "intervalleVersXBar") throw new Error("soumettreReponseV6K : réservé à la variante 'intervalleVersXBar'");
  return soumettrePhase(etat, "v6K", texte, (t) => verifierK(exercice, t));
}

export function soumettreReponseV6XBar(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "intervalleVersXBar") throw new Error("soumettreReponseV6XBar : réservé à la variante 'intervalleVersXBar'");
  return soumettrePhase(etat, "v6XBar", texte, (t) => verifierXBar(exercice, t));
}

export function soumettreReponseV7Pourcent0(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "nombreVersSigma") throw new Error("soumettreReponseV7Pourcent0 : réservé à la variante 'nombreVersSigma'");
  return soumettrePhase(etat, "v7Pourcent0", texte, (t) => verifierPourcentDepuisNombre(exercice, t));
}

export function soumettreReponseV7K(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "nombreVersSigma") throw new Error("soumettreReponseV7K : réservé à la variante 'nombreVersSigma'");
  return soumettrePhase(etat, "v7K", texte, (t) => verifierK(exercice, t));
}

export function soumettreReponseV7Sigma(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "nombreVersSigma") throw new Error("soumettreReponseV7Sigma : réservé à la variante 'nombreVersSigma'");
  return soumettrePhase(etat, "v7Sigma", texte, (t) => verifierSigma(exercice, t));
}

export function soumettreReponseV8Pourcent0(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "nombreVersXBar") throw new Error("soumettreReponseV8Pourcent0 : réservé à la variante 'nombreVersXBar'");
  return soumettrePhase(etat, "v8Pourcent0", texte, (t) => verifierPourcentDepuisNombre(exercice, t));
}

export function soumettreReponseV8K(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "nombreVersXBar") throw new Error("soumettreReponseV8K : réservé à la variante 'nombreVersXBar'");
  return soumettrePhase(etat, "v8K", texte, (t) => verifierK(exercice, t));
}

export function soumettreReponseV8XBar(etat: EtatSessionBienaymeTchebychev, texte: string): EtatSessionBienaymeTchebychev {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "nombreVersXBar") throw new Error("soumettreReponseV8XBar : réservé à la variante 'nombreVersXBar'");
  return soumettrePhase(etat, "v8XBar", texte, (t) => verifierXBar(exercice, t));
}
