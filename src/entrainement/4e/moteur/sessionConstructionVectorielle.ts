/**
 * Couche B — moteur de session pour "Construction graphique de vecteurs sur grille" (chapitre
 * "Calcul vectoriel", quatrième générateur). N'importe jamais rien de src/generateurs — voir
 * sessionConstructionVectorielle.test.ts pour la preuve avec un générateur factice, même principe
 * que les vingt-trois autres moteurs du projet.
 *
 * Une seule phase, "construction" : le point de départ et le point d'arrivée du vecteur tracé, en
 * un seul essai (tout ou rien) — pas de bouton "Aide" pour ce générateur.
 */
import type { GenerateurExerciceConstructionVectorielle } from "../core/constructionVectorielle.types";
import type { ReglagesSession } from "../core/session.types";
import type { Point } from "../core/vecteur.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierConstruction } from "./verificationConstructionVectorielle";
import type { EtatSessionConstructionVectorielle, ResultatExerciceConstructionVectorielle } from "./typesConstructionVectorielle";

const POINTS_DE_BASE = 100;

export interface ReponseConstruction {
  depart: Point;
  arrivee: Point;
}

export function demarrerSessionConstructionVectorielle(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceConstructionVectorielle,
): EtatSessionConstructionVectorielle {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "construction",
    etapeCourante: demarrerEtapeTentatives(),
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionConstructionVectorielle): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionConstructionVectorielle,
  resultat: ResultatExerciceConstructionVectorielle,
): EtatSessionConstructionVectorielle {
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
    phase: "construction",
    etapeCourante: demarrerEtapeTentatives(),
  };
}

/** Dernière (et seule) phase, clôture l'exercice. */
export function soumettreReponseConstruction(
  etat: EtatSessionConstructionVectorielle,
  reponse: ReponseConstruction,
): EtatSessionConstructionVectorielle {
  if (etat.terminee || etat.phase !== "construction") {
    throw new Error("soumettreReponseConstruction : la session n'est pas à l'étape construction");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseConstruction>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierConstruction(etat.exerciceCourant, r.depart, r.arrivee),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return cloturerExerciceOuSuivant(etat, {
    scoreConstruction: etapeCourante.score as number,
    constructionRevele: etapeCourante.revelee,
  });
}
