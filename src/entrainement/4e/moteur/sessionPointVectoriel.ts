/**
 * Couche B — moteur de session pour "Point à partir d'une relation vectorielle" (chapitre "Calcul
 * vectoriel", premier générateur). N'importe jamais rien de src/generateurs — voir
 * sessionPointVectoriel.test.ts pour la preuve avec un générateur factice, même principe que les
 * vingt autres moteurs du projet.
 *
 * Une seule phase, "coordonnees" : les coordonnées (x,y) du point cherché, en un seul essai
 * (2 champs soumis ensemble, tout ou rien) — pas de bouton "Aide" pour ce générateur.
 */
import type { GenerateurExercicePointVectoriel } from "../core/pointVectoriel.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierCoordonnees } from "./verificationPointVectoriel";
import type { EtatSessionPointVectoriel, ResultatExercicePointVectoriel } from "./typesPointVectoriel";

const POINTS_DE_BASE = 100;

export interface ReponseCoordonnees {
  x: number;
  y: number;
}

export function demarrerSessionPointVectoriel(
  reglages: ReglagesSession,
  generateur: GenerateurExercicePointVectoriel,
): EtatSessionPointVectoriel {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "coordonnees",
    etapeCourante: demarrerEtapeTentatives(),
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionPointVectoriel): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionPointVectoriel,
  resultat: ResultatExercicePointVectoriel,
): EtatSessionPointVectoriel {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant: etat.generateur(),
    phase: "coordonnees",
    etapeCourante: demarrerEtapeTentatives(),
  };
}

/** Dernière (et seule) phase, clôture l'exercice. */
export function soumettreReponseCoordonnees(
  etat: EtatSessionPointVectoriel,
  reponse: ReponseCoordonnees,
): EtatSessionPointVectoriel {
  if (etat.terminee || etat.phase !== "coordonnees") {
    throw new Error("soumettreReponseCoordonnees : la session n'est pas à l'étape coordonnées");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseCoordonnees>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCoordonnees(etat.exerciceCourant, r.x, r.y),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return cloturerExerciceOuSuivant(etat, {
    scoreCoordonnees: etapeCourante.score as number,
    coordonneesRevele: etapeCourante.revelee,
  });
}
