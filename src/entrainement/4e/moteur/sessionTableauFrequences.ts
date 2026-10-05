/**
 * Couche B — moteur de session pour "Tableau de fréquences" (chapitre 5, premier générateur).
 * N'importe jamais rien de `src/generateurs/` — voir `sessionTableauFrequences.test.ts` pour la
 * preuve avec un générateur factice, même principe que les 29 autres moteurs du projet.
 *
 * 4 phases fixes, toujours dans le même ordre : identification → frequences → cumules →
 * frequencesCumulees — aucun saut conditionnel (contrairement à la plupart des autres moteurs du
 * projet, structure aussi simple que "Forme canonique et transformations" sur ce plan). Le 4e
 * écran a été ajouté par `promptameliorationsgenerateur30.md`, point 5 — `cumules` n'est donc plus
 * la phase terminale.
 *
 * **Aide PROGRESSIVE par écran** (comme "Triangle quelconque"/"Colinéarité"/"Orthogonalité"/"Norme
 * d'un vecteur et distance entre 2 points"), 2 niveaux par écran — pénalité ADDITIVE (-20 points
 * par niveau atteint) appliquée au moment précis où l'écran se clôt, jamais rétroactivement.
 */
import type { GenerateurExerciceTableauFrequences } from "../core/tableauFrequences.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type {
  ReponseCumules,
  ReponseFrequences,
  ReponseFrequencesCumulees,
  ReponseIdentification,
} from "./verificationTableauFrequences";
import {
  verifierCumules,
  verifierFrequences,
  verifierFrequencesCumulees,
  verifierIdentification,
} from "./verificationTableauFrequences";
import type { EtatSessionTableauFrequences, ResultatExerciceTableauFrequences } from "./typesTableauFrequences";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_IDENTIFICATION = 2;
export const NIVEAU_AIDE_MAX_FREQUENCES = 2;
export const NIVEAU_AIDE_MAX_CUMULES = 2;
export const NIVEAU_AIDE_MAX_FREQUENCES_CUMULEES = 2;

export function demarrerSessionTableauFrequences(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceTableauFrequences,
): EtatSessionTableauFrequences {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "identification",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideIdentification: 0,
    niveauAideFrequences: 0,
    niveauAideCumules: 0,
    niveauAideFrequencesCumulees: 0,
    scoreIdentificationExercice: null,
    identificationRevele: false,
    scoreFrequencesExercice: null,
    frequencesRevele: false,
    scoreCumulesExercice: null,
    cumulesRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionTableauFrequences): ReglagesEtape {
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
 * niveau maximal de l'écran courant est déjà atteint (rien de plus à révéler). */
export function activerAideSuivante(etat: EtatSessionTableauFrequences): EtatSessionTableauFrequences {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "identification") {
    if (etat.niveauAideIdentification >= NIVEAU_AIDE_MAX_IDENTIFICATION) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideIdentification: etat.niveauAideIdentification + 1 };
  }
  if (etat.phase === "frequences") {
    if (etat.niveauAideFrequences >= NIVEAU_AIDE_MAX_FREQUENCES) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideFrequences: etat.niveauAideFrequences + 1 };
  }
  if (etat.phase === "cumules") {
    if (etat.niveauAideCumules >= NIVEAU_AIDE_MAX_CUMULES) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideCumules: etat.niveauAideCumules + 1 };
  }
  if (etat.niveauAideFrequencesCumulees >= NIVEAU_AIDE_MAX_FREQUENCES_CUMULEES) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAideFrequencesCumulees: etat.niveauAideFrequencesCumulees + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionTableauFrequences,
  resultat: ResultatExerciceTableauFrequences,
): EtatSessionTableauFrequences {
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
    phase: "identification",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideIdentification: 0,
    niveauAideFrequences: 0,
    niveauAideCumules: 0,
    niveauAideFrequencesCumulees: 0,
    scoreIdentificationExercice: null,
    identificationRevele: false,
    scoreFrequencesExercice: null,
    frequencesRevele: false,
    scoreCumulesExercice: null,
    cumulesRevele: false,
  };
}

export function soumettreReponseIdentification(etat: EtatSessionTableauFrequences, reponse: ReponseIdentification): EtatSessionTableauFrequences {
  if (etat.terminee || etat.phase !== "identification") {
    throw new Error("soumettreReponseIdentification : la session n'est pas à l'étape identification");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseIdentification>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierIdentification(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideIdentification);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "frequences",
    scoreIdentificationExercice: score,
    identificationRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseFrequences(etat: EtatSessionTableauFrequences, reponse: ReponseFrequences): EtatSessionTableauFrequences {
  if (etat.terminee || etat.phase !== "frequences") {
    throw new Error("soumettreReponseFrequences : la session n'est pas à l'étape frequences");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseFrequences>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFrequences(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideFrequences);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "cumules",
    scoreFrequencesExercice: score,
    frequencesRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseCumules(etat: EtatSessionTableauFrequences, reponse: ReponseCumules): EtatSessionTableauFrequences {
  if (etat.terminee || etat.phase !== "cumules") {
    throw new Error("soumettreReponseCumules : la session n'est pas à l'étape cumules");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseCumules>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCumules(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideCumules);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "frequencesCumulees",
    scoreCumulesExercice: score,
    cumulesRevele: etapeCourante.revelee,
  };
}

/** Dernière phase, clôture l'exercice. */
export function soumettreReponseFrequencesCumulees(
  etat: EtatSessionTableauFrequences,
  reponse: ReponseFrequencesCumulees,
): EtatSessionTableauFrequences {
  if (etat.terminee || etat.phase !== "frequencesCumulees") {
    throw new Error("soumettreReponseFrequencesCumulees : la session n'est pas à l'étape frequencesCumulees");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseFrequencesCumulees>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFrequencesCumulees(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideFrequencesCumulees);

  return cloturerExerciceOuSuivant(etat, {
    scoreIdentification: etat.scoreIdentificationExercice as number,
    identificationRevele: etat.identificationRevele,
    niveauAideIdentification: etat.niveauAideIdentification,
    scoreFrequences: etat.scoreFrequencesExercice as number,
    frequencesRevele: etat.frequencesRevele,
    niveauAideFrequences: etat.niveauAideFrequences,
    scoreCumules: etat.scoreCumulesExercice as number,
    cumulesRevele: etat.cumulesRevele,
    niveauAideCumules: etat.niveauAideCumules,
    scoreFrequencesCumulees: score,
    frequencesCumuleesRevele: etapeCourante.revelee,
    niveauAideFrequencesCumulees: etat.niveauAideFrequencesCumulees,
  });
}
