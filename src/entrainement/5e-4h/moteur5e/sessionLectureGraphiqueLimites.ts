/**
 * Couche B (5e) — moteur de session pour 5gen22 ("Limites et asymptotes, lecture graphique").
 * N'importe jamais rien de `src/generateurs5e/`.
 */
import type { ExerciceLectureGraphiqueLimites } from "../core5e/lectureGraphiqueLimites.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { listeAsymptotes, listeComportements, phaseApres, phaseInitiale } from "./typesLectureGraphiqueLimites";
import type { EtatSessionLectureGraphiqueLimites, PhaseLectureGraphiqueLimites, ResultatExerciceLectureGraphiqueLimites } from "./typesLectureGraphiqueLimites";
import { diagnostiquerCibleAsymptote, diagnostiquerCibleComportement } from "./verificationLectureGraphiqueLimites";

const POINTS_DE_BASE = 100;

function etatInitial(exercice: ExerciceLectureGraphiqueLimites): Pick<EtatSessionLectureGraphiqueLimites, "exerciceCourant" | "phase" | "etapeCourante" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), scoresPartiels: {} };
}

export function demarrerSessionLectureGraphiqueLimites(reglages: ReglagesSession5e, generateur: () => ExerciceLectureGraphiqueLimites): EtatSessionLectureGraphiqueLimites {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionLectureGraphiqueLimites): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

function cloturerExerciceOuSuivant(etat: EtatSessionLectureGraphiqueLimites, resultat: ResultatExerciceLectureGraphiqueLimites, revele: boolean): EtatSessionLectureGraphiqueLimites {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionLectureGraphiqueLimites, phaseAttendue: PhaseLectureGraphiqueLimites, reponse: T, verifier: (r: T) => boolean): EtatSessionLectureGraphiqueLimites {
  if (etat.terminee || etat.phase !== phaseAttendue) throw new Error(`soumettreEcran : la session n'est pas à l'étape ${phaseAttendue}`);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = etapeCourante.score as number;
  const scoresPartiels = { ...etat.scoresPartiels, [phaseAttendue]: score };
  const phaseSuivante = phaseApres(etat.exerciceCourant, phaseAttendue);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), phase: phaseSuivante, scoresPartiels, derniereEtapeRevelee: revele };
}

/** Écran "completerLimites" — un texte par slot de `listeComportements`, dans le MÊME ordre,
 * TOUS corrects requis (même convention que les écrans multi-champs des autres générateurs). */
export function soumettreReponseCompleterLimites(etat: EtatSessionLectureGraphiqueLimites, textes: string[]): EtatSessionLectureGraphiqueLimites {
  const slots = listeComportements(etat.exerciceCourant);
  return soumettreEcran(etat, "completerLimites", textes, (t) => t.length === slots.length && t.every((v, i) => diagnostiquerCibleComportement(v, slots[i].cible) === "correct"));
}

/** Écran "nommerAsymptotes" — un texte par slot de `listeAsymptotes`, même convention. */
export function soumettreReponseNommerAsymptotes(etat: EtatSessionLectureGraphiqueLimites, textes: string[]): EtatSessionLectureGraphiqueLimites {
  const slots = listeAsymptotes(etat.exerciceCourant);
  return soumettreEcran(etat, "nommerAsymptotes", textes, (t) => t.length === slots.length && t.every((v, i) => diagnostiquerCibleAsymptote(v, slots[i].cible) === "correct"));
}
