/**
 * Couche B — moteur de session pour "Équations/inéquations du second degré en contexte" (position
 * 57). N'importe jamais rien de `src/generateurs/`.
 *
 * Séquence à 4 ou 6 écrans selon `exercice.voieSysteme` (architecture D uniquement — voir
 * `core/equationInequationSecondDegre.types.ts`, en-tête) : `poserSysteme → isolerSubstituer →
 * resoudre → validation → interpretation` (D) ou directement `poserEquationInequation → resoudre →
 * validation → interpretation` (A/B/C).
 */
import type { GenerateurExerciceEquationInequationSecondDegre } from "../core/equationInequationSecondDegre.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { ReponseIntervalle, ReponseSysteme } from "./verificationEquationInequationSecondDegre";
import {
  verifierInterpretation,
  verifierPoserEquationInequation,
  verifierResoudre,
  verifierSysteme,
  verifierValidationEquation,
  verifierValidationInequation,
} from "./verificationEquationInequationSecondDegre";
import type { EtatSessionEquationInequationSecondDegre, PhaseEquationInequationSecondDegre, ResultatExerciceEquationInequationSecondDegre } from "./typesEquationInequationSecondDegre";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_POSER_SYSTEME = 2;
export const NIVEAU_AIDE_MAX_ISOLER_SUBSTITUER = 2;
export const NIVEAU_AIDE_MAX_POSER_EQUATION_INEQUATION = 2;
export const NIVEAU_AIDE_MAX_RESOUDRE = 2;
export const NIVEAU_AIDE_MAX_VALIDATION = 3;
export const NIVEAU_AIDE_MAX_INTERPRETATION = 1;

const ETAT_TRANSITOIRE_INITIAL = {
  niveauAidePoserSysteme: 0,
  niveauAideIsolerSubstituer: 0,
  niveauAidePoserEquationInequation: 0,
  niveauAideResoudre: 0,
  niveauAideValidation: 0,
  niveauAideInterpretation: 0,
  scorePoserSystemeExercice: null,
  poserSystemeRevele: false,
  scoreIsolerSubstituerExercice: null,
  isolerSubstituerRevele: false,
  scorePoserEquationInequationExercice: null,
  poserEquationInequationRevele: false,
  scoreResoudreExercice: null,
  resoudreRevele: false,
  scoreValidationExercice: null,
  validationRevele: false,
} as const;

function phaseInitiale(exercice: EtatSessionEquationInequationSecondDegre["exerciceCourant"]): PhaseEquationInequationSecondDegre {
  return exercice.voieSysteme ? "poserSysteme" : "poserEquationInequation";
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
    phase: phaseInitiale(exerciceCourant),
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
  if (etat.phase === "poserSysteme") {
    if (etat.niveauAidePoserSysteme >= NIVEAU_AIDE_MAX_POSER_SYSTEME) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAidePoserSysteme: etat.niveauAidePoserSysteme + 1 };
  }
  if (etat.phase === "isolerSubstituer") {
    if (etat.niveauAideIsolerSubstituer >= NIVEAU_AIDE_MAX_ISOLER_SUBSTITUER) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideIsolerSubstituer: etat.niveauAideIsolerSubstituer + 1 };
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
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_INITIAL,
  };
}

export function soumettreReponsePoserSysteme(etat: EtatSessionEquationInequationSecondDegre, reponse: ReponseSysteme): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "poserSysteme") throw new Error("soumettreReponsePoserSysteme : la session n'est pas à l'étape poserSysteme");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseSysteme>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSysteme(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAidePoserSysteme);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "isolerSubstituer",
    scorePoserSystemeExercice: score,
    poserSystemeRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseIsolerSubstituer(etat: EtatSessionEquationInequationSecondDegre, texte: string): EtatSessionEquationInequationSecondDegre {
  if (etat.terminee || etat.phase !== "isolerSubstituer") throw new Error("soumettreReponseIsolerSubstituer : la session n'est pas à l'étape isolerSubstituer");
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierPoserEquationInequation(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideIsolerSubstituer);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "resoudre",
    scoreIsolerSubstituerExercice: score,
    isolerSubstituerRevele: etapeCourante.revelee,
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
    scorePoserSysteme: etat.scorePoserSystemeExercice,
    poserSystemeRevele: etat.poserSystemeRevele,
    niveauAidePoserSysteme: etat.niveauAidePoserSysteme,
    scoreIsolerSubstituer: etat.scoreIsolerSubstituerExercice,
    isolerSubstituerRevele: etat.isolerSubstituerRevele,
    niveauAideIsolerSubstituer: etat.niveauAideIsolerSubstituer,
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
