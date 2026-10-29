/**
 * Couche B — moteur de session pour "Réduction d'une somme de vecteurs (Chasles)" (chapitre
 * "Calcul vectoriel", cinquième générateur). N'importe jamais rien de src/generateurs — voir
 * sessionReductionVectorielle.test.ts pour la preuve avec un générateur factice.
 */
import type { GenerateurExerciceReductionVectorielle } from "../core/reductionVectorielle.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierReduction } from "./verificationReductionVectorielle";
import { NIVEAU_AIDE_MAX_REDUCTION } from "./typesReductionVectorielle";
import type { EtatSessionReductionVectorielle, ResultatExerciceReductionVectorielle } from "./typesReductionVectorielle";

const POINTS_DE_BASE = 100;

export function demarrerSessionReductionVectorielle(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceReductionVectorielle,
): EtatSessionReductionVectorielle {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "reduction",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionReductionVectorielle): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
  };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionReductionVectorielle,
  resultat: ResultatExerciceReductionVectorielle,
): EtatSessionReductionVectorielle {
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
    phase: "reduction",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
  };
}

/** Révèle le niveau d'aide suivant de l'écran — lève si la session est terminée ou si le niveau
 * maximal est déjà atteint (même contrat que les autres générateurs à aide). */
export function activerAideSuivante(etat: EtatSessionReductionVectorielle): EtatSessionReductionVectorielle {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_REDUCTION) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

/** Dernière (et seule) phase, clôture l'exercice. */
export function soumettreReponseReduction(etat: EtatSessionReductionVectorielle, texte: string): EtatSessionReductionVectorielle {
  if (etat.terminee || etat.phase !== "reduction") {
    throw new Error("soumettreReponseReduction : la session n'est pas à l'étape réduction");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReduction(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return cloturerExerciceOuSuivant(etat, {
    scoreReduction: etapeCourante.score as number,
    reductionRevele: etapeCourante.revelee,
    niveauAideReduction: etat.niveauAide,
  });
}
