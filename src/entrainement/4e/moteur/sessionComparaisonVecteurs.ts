/**
 * Couche B — moteur de session pour "Comparaison visuelle de vecteurs sur figure" (chapitre
 * "Calcul vectoriel", deuxième générateur). N'importe jamais rien de src/generateurs — voir
 * sessionComparaisonVecteurs.test.ts pour la preuve avec un générateur factice.
 *
 * 2 phases fixes, toujours dans le même ordre : selection → egalite.
 */
import type { GenerateurExerciceComparaisonVecteurs } from "../core/comparaisonVecteurs.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierEgalite, verifierSelection } from "./verificationComparaisonVecteurs";
import type { EtatSessionComparaisonVecteurs, ResultatExerciceComparaisonVecteurs } from "./typesComparaisonVecteurs";

const POINTS_DE_BASE = 100;

export function demarrerSessionComparaisonVecteurs(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceComparaisonVecteurs,
): EtatSessionComparaisonVecteurs {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "selection",
    etapeCourante: demarrerEtapeTentatives(),
    scoreSelectionExercice: null,
    selectionRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionComparaisonVecteurs): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionComparaisonVecteurs,
  resultat: ResultatExerciceComparaisonVecteurs,
): EtatSessionComparaisonVecteurs {
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
    phase: "selection",
    etapeCourante: demarrerEtapeTentatives(),
    scoreSelectionExercice: null,
    selectionRevele: false,
  };
}

export function soumettreReponseSelection(etat: EtatSessionComparaisonVecteurs, labels: string[]): EtatSessionComparaisonVecteurs {
  if (etat.terminee || etat.phase !== "selection") {
    throw new Error("soumettreReponseSelection : la session n'est pas à l'étape sélection");
  }

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, labels, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSelection(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "egalite",
    scoreSelectionExercice: etapeCourante.score as number,
    selectionRevele: etapeCourante.revelee,
  };
}

/** Dernière phase, clôture l'exercice. */
export function soumettreReponseEgalite(etat: EtatSessionComparaisonVecteurs, texte: string): EtatSessionComparaisonVecteurs {
  if (etat.terminee || etat.phase !== "egalite") {
    throw new Error("soumettreReponseEgalite : la session n'est pas à l'étape égalité");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEgalite(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return cloturerExerciceOuSuivant(etat, {
    scoreSelection: etat.scoreSelectionExercice as number,
    selectionRevele: etat.selectionRevele,
    scoreEgalite: etapeCourante.score as number,
    egaliteRevele: etapeCourante.revelee,
  });
}
