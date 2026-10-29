/**
 * Couche B — moteur de session pour "Applications physiques (résultante de vecteurs)" (chapitre
 * "Calcul vectoriel", huitième générateur). N'importe jamais rien de src/generateurs — voir
 * sessionApplicationPhysique.test.ts pour la preuve avec un générateur factice, même principe que
 * les vingt-quatre autres moteurs du projet.
 *
 * 4 phases fixes, toujours dans le même ordre : modelisation → norme → deviation →
 * interpretation. "modelisation" utilise la même brique générique de notation par tentatives que
 * les 3 autres phases (`etapeTentatives.ts`) — un mauvais choix ne fait donc avancer qu'une fois
 * les tentatives épuisées, comme n'importe quelle autre étape, jamais après une seule tentative
 * fausse. Aide progressive (2 niveaux, même principe que
 * "Colinéarité"/"Orthogonalité"/"Distance point-droite") sur l'écran "norme"
 * (`promptgen29modificationscompletes.md`, point 4.3) et, depuis F2 option b, sur l'écran
 * "deviation" (méthode, puis formule substituée + piège de la déviation obtuse) — "modelisation"
 * et "interpretation" restent sans aide.
 */
import type { GenerateurExerciceApplicationPhysique, VarianteApplicationPhysique } from "../core/applicationPhysique.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import {
  verifierDeviation,
  verifierInterpretation,
  verifierModelisation,
  verifierNorme,
} from "./verificationApplicationPhysique";
import type { EtatSessionApplicationPhysique, ResultatExerciceApplicationPhysique } from "./typesApplicationPhysique";

const POINTS_DE_BASE = 100;
export const NIVEAU_AIDE_MAX_NORME = 2;
export const NIVEAU_AIDE_MAX_DEVIATION = 2;

export function demarrerSessionApplicationPhysique(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceApplicationPhysique,
): EtatSessionApplicationPhysique {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "modelisation",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideNorme: 0,
    niveauAideDeviation: 0,
    scoreModelisationExercice: null,
    modelisationReveleExercice: false,
    scoreNormeExercice: null,
    normeReveleExercice: false,
    normeAideUtiliseeExercice: false,
    scoreDeviationExercice: null,
    deviationReveleExercice: false,
    deviationAideUtiliseeExercice: false,
    resultats: [],
    terminee: false,
  };
}

export function activerAideNorme(etat: EtatSessionApplicationPhysique): EtatSessionApplicationPhysique {
  if (etat.terminee) {
    throw new Error("activerAideNorme : la session est déjà terminée");
  }
  if (etat.phase !== "norme") {
    throw new Error("activerAideNorme : la session n'est pas à l'étape norme");
  }
  if (etat.niveauAideNorme >= NIVEAU_AIDE_MAX_NORME) {
    throw new Error("activerAideNorme : niveau d'aide maximal déjà atteint");
  }
  return { ...etat, niveauAideNorme: etat.niveauAideNorme + 1 };
}

export function activerAideDeviation(etat: EtatSessionApplicationPhysique): EtatSessionApplicationPhysique {
  if (etat.terminee) {
    throw new Error("activerAideDeviation : la session est déjà terminée");
  }
  if (etat.phase !== "deviation") {
    throw new Error("activerAideDeviation : la session n'est pas à l'étape deviation");
  }
  if (etat.niveauAideDeviation >= NIVEAU_AIDE_MAX_DEVIATION) {
    throw new Error("activerAideDeviation : niveau d'aide maximal déjà atteint");
  }
  return { ...etat, niveauAideDeviation: etat.niveauAideDeviation + 1 };
}

function reglagesEtape(etat: EtatSessionApplicationPhysique): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
  };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionApplicationPhysique,
  resultat: ResultatExerciceApplicationPhysique,
): EtatSessionApplicationPhysique {
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
    phase: "modelisation",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideNorme: 0,
    niveauAideDeviation: 0,
    scoreModelisationExercice: null,
    modelisationReveleExercice: false,
    scoreNormeExercice: null,
    normeReveleExercice: false,
    normeAideUtiliseeExercice: false,
    scoreDeviationExercice: null,
    deviationReveleExercice: false,
    deviationAideUtiliseeExercice: false,
  };
}

export function soumettreReponseModelisation(
  etat: EtatSessionApplicationPhysique,
  choix: VarianteApplicationPhysique,
): EtatSessionApplicationPhysique {
  if (etat.terminee || etat.phase !== "modelisation") {
    throw new Error("soumettreReponseModelisation : la session n'est pas à l'étape modelisation");
  }

  const etapeCourante = soumettreEtapeTentatives<VarianteApplicationPhysique>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c) => verifierModelisation(etat.exerciceCourant, c),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "norme",
    scoreModelisationExercice: etapeCourante.score as number,
    modelisationReveleExercice: etapeCourante.revelee,
  };
}

export function soumettreReponseNorme(etat: EtatSessionApplicationPhysique, valeur: number): EtatSessionApplicationPhysique {
  if (etat.terminee || etat.phase !== "norme") {
    throw new Error("soumettreReponseNorme : la session n'est pas à l'étape norme");
  }

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, valeur, {
    ...reglagesEtape(etat),
    verifier: (v) => verifierNorme(etat.exerciceCourant, v),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = etapeCourante.score as number;

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "deviation",
    scoreNormeExercice: score,
    normeReveleExercice: etapeCourante.revelee,
    normeAideUtiliseeExercice: etat.niveauAideNorme > 0,
  };
}

export function soumettreReponseDeviation(etat: EtatSessionApplicationPhysique, valeur: number): EtatSessionApplicationPhysique {
  if (etat.terminee || etat.phase !== "deviation") {
    throw new Error("soumettreReponseDeviation : la session n'est pas à l'étape deviation");
  }

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, valeur, {
    ...reglagesEtape(etat),
    verifier: (v) => verifierDeviation(etat.exerciceCourant, v),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "interpretation",
    scoreDeviationExercice: etapeCourante.score as number,
    deviationReveleExercice: etapeCourante.revelee,
    deviationAideUtiliseeExercice: etat.niveauAideDeviation > 0,
  };
}

/** Dernière phase, clôture l'exercice. */
export function soumettreReponseInterpretation(etat: EtatSessionApplicationPhysique, direction: string): EtatSessionApplicationPhysique {
  if (etat.terminee || etat.phase !== "interpretation") {
    throw new Error("soumettreReponseInterpretation : la session n'est pas à l'étape interpretation");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, direction, {
    ...reglagesEtape(etat),
    verifier: (d) => verifierInterpretation(etat.exerciceCourant, d),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return cloturerExerciceOuSuivant(etat, {
    scoreModelisation: etat.scoreModelisationExercice as number,
    modelisationRevele: etat.modelisationReveleExercice,
    scoreNorme: etat.scoreNormeExercice as number,
    normeRevele: etat.normeReveleExercice,
    normeAideUtilisee: etat.normeAideUtiliseeExercice,
    scoreDeviation: etat.scoreDeviationExercice as number,
    deviationRevele: etat.deviationReveleExercice,
    deviationAideUtilisee: etat.deviationAideUtiliseeExercice,
    scoreInterpretation: etapeCourante.score as number,
    interpretationRevele: etapeCourante.revelee,
  });
}
