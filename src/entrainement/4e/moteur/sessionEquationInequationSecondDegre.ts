/**
 * Couche B — moteur de session pour "Équations/inéquations du second degré en contexte" (position
 * 57). N'importe jamais rien de `src/generateurs/`.
 *
 * Séquence UNIQUE à 4 écrans depuis la refonte (voir `core/equationInequationSecondDegre.types.ts`,
 * en-tête) : `poserEquationInequation → resoudre → validation → interpretation` (terminale) —
 * aucune variation par famille (toutes les 7 familles démarrent directement à
 * "poserEquationInequation", la fonction et le domaine étant toujours directement donnés dans
 * l'énoncé).
 */
import type { GenerateurExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { ReponseIntervalle } from "./verificationEquationInequationSecondDegre";
import { verifierInterpretation, verifierPoserEquationInequation, verifierResoudre, verifierValidationEquation, verifierValidationInequation } from "./verificationEquationInequationSecondDegre";
import type { EtatSessionEquationInequationSecondDegre, PhaseEquationInequationSecondDegre, ResultatExerciceEquationInequationSecondDegre } from "./typesEquationInequationSecondDegre";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_POSER_EQUATION_INEQUATION = 2;
export const NIVEAU_AIDE_MAX_RESOUDRE = 2;
export const NIVEAU_AIDE_MAX_VALIDATION = 3;
export const NIVEAU_AIDE_MAX_INTERPRETATION = 1;

const ETAT_TRANSITOIRE_INITIAL = {
  niveauAidePoserEquationInequation: 0,
  niveauAideResoudre: 0,
  niveauAideValidation: 0,
  niveauAideInterpretation: 0,
  scorePoserEquationInequationExercice: null,
  poserEquationInequationRevele: false,
  scoreResoudreExercice: null,
  resoudreRevele: false,
  scoreValidationExercice: null,
  validationRevele: false,
} as const;

function phaseInitiale(): PhaseEquationInequationSecondDegre {
  return "poserEquationInequation";
}

export function demarrerSessionEquationInequationSecondDegre(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceEquationInequationSecondDegre,
): EtatSessionEquationInequationSecondDegre {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_INITIAL,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionEquationInequationSecondDegre): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionEquationInequationSecondDegre): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "poserEquationInequation") {
    if (etat.niveauAidePoserEquationInequation >= NIVEAU_AIDE_MAX_POSER_EQUATION_INEQUATION)
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAidePoserEquationInequation: etat.niveauAidePoserEquationInequation + 1 };
  }
  if (etat.phase === "resoudre") {
    if (etat.niveauAideResoudre >= NIVEAU_AIDE_MAX_RESOUDRE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideResoudre: etat.niveauAideResoudre + 1 };
  }
  if (etat.phase === "validation") {
    if (etat.niveauAideValidation >= NIVEAU_AIDE_MAX_VALIDATION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideValidation: etat.niveauAideValidation + 1 };
  }
  if (etat.niveauAideInterpretation >= NIVEAU_AIDE_MAX_INTERPRETATION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideInterpretation: etat.niveauAideInterpretation + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionEquationInequationSecondDegre,
  resultat: ResultatExerciceEquationInequationSecondDegre,
): EtatSessionEquationInequationSecondDegre {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  const exerciceCourant = etat.generateur();
  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_INITIAL,
  };
}

export function soumettreReponsePoserEquationInequation(etat: EtatSessionEquationInequationSecondDegre, texte: string): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "poserEquationInequation")
    throw new Error("soumettreReponsePoserEquationInequation : la session n'est pas à l'étape poserEquationInequation");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierPoserEquationInequation(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAidePoserEquationInequation);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "resoudre",
    scorePoserEquationInequationExercice: score,
    poserEquationInequationRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseResoudre(etat: EtatSessionEquationInequationSecondDegre, valeurs: string[]): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "resoudre") throw new Error("soumettreReponseResoudre : la session n'est pas à l'étape resoudre");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierResoudre(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideResoudre);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "validation",
    scoreResoudreExercice: score,
    resoudreRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseValidationEquation(etat: EtatSessionEquationInequationSecondDegre, reponses: boolean[]): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "validation") throw new Error("soumettreReponseValidationEquation : la session n'est pas à l'étape validation");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<boolean[]>(etat.etapeCourante, reponses, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierValidationEquation(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideValidation);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "interpretation",
    scoreValidationExercice: score,
    validationRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseValidationInequation(etat: EtatSessionEquationInequationSecondDegre, reponse: ReponseIntervalle): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "validation") throw new Error("soumettreReponseValidationInequation : la session n'est pas à l'étape validation");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseIntervalle>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierValidationInequation(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideValidation);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "interpretation",
    scoreValidationExercice: score,
    validationRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseInterpretation(etat: EtatSessionEquationInequationSecondDegre, indexChoisi: number | null): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "interpretation") throw new Error("soumettreReponseInterpretation : la session n'est pas à l'étape interpretation");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<number | null>(etat.etapeCourante, indexChoisi, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierInterpretation(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideInterpretation);

  return cloturerExerciceOuSuivant(etat, {
    variante: exerciceCourant.variante,
    famille: exerciceCourant.famille,
    scorePoserEquationInequation: etat.scorePoserEquationInequationExercice,
    poserEquationInequationRevele: etat.poserEquationInequationRevele,
    niveauAidePoserEquationInequation: etat.niveauAidePoserEquationInequation,
    scoreResoudre: etat.scoreResoudreExercice as number,
    resoudreRevele: etat.resoudreRevele,
    niveauAideResoudre: etat.niveauAideResoudre,
    scoreValidation: etat.scoreValidationExercice as number,
    validationRevele: etat.validationRevele,
    niveauAideValidation: etat.niveauAideValidation,
    scoreInterpretation: score,
    interpretationRevele: etapeCourante.revelee,
    niveauAideInterpretation: etat.niveauAideInterpretation,
  });
}
