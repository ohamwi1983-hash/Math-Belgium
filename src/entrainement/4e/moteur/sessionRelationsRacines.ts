/**
 * Couche B — moteur de session pour "Relations entre racines et coefficients" : 3 phases fixes
 * (sommeProduit → factorisation → equationDepuisRacines), même principe que
 * src/entrainement/4e/moteur/sessionInequation.ts (pas de phase conditionnelle ici, toujours les
 * 3 dans le même ordre). N'importe jamais rien de src/entrainement/4e/generateurs.
 */
import type { ExerciceRelationsRacines, GenerateurExerciceRelationsRacines } from "../core/relationsRacines.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { EtatEtapeTentatives, ReglagesEtape } from "./etapeTentatives";
import type { ReponseSommeProduit } from "./verificationRelationsRacines";
import { verifierEquationDepuisRacines, verifierFactorisation, verifierSommeProduit } from "./verificationRelationsRacines";

const POINTS_DE_BASE = 100;

export type PhaseRelationsRacines = "sommeProduit" | "factorisation" | "equationDepuisRacines";

export interface ResultatExerciceRelationsRacines {
  scoreSommeProduit: number;
  aideSommeProduitUtilisee: boolean;
  sommeProduitRevele: boolean;
  scoreFactorisation: number;
  aideFactorisationUtilisee: boolean;
  factorisationRevele: boolean;
  scoreEquationDepuisRacines: number;
  aideEquationDepuisRacinesUtilisee: boolean;
  equationDepuisRacinesRevele: boolean;
}

export interface EtatSessionRelationsRacines {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceRelationsRacines;
  /** nombre d'exercices déjà clôturés (0 au début) */
  indexExercice: number;
  exerciceCourant: ExerciceRelationsRacines;
  phase: PhaseRelationsRacines;
  etapeCourante: EtatEtapeTentatives;
  scoreSommeProduitExercice: number | null;
  sommeProduitRevele: boolean;
  scoreFactorisationExercice: number | null;
  factorisationRevele: boolean;
  /** Aides à sens unique (1 seul niveau, ×0,5 sur le score de l'étape concernée à sa clôture) —
   * remises à false au passage à l'exercice suivant, même principe que sessionInequation.ts. */
  aideSommeProduitUtilisee: boolean;
  aideFactorisationUtilisee: boolean;
  aideEquationDepuisRacinesUtilisee: boolean;
  resultats: ResultatExerciceRelationsRacines[];
  terminee: boolean;
}

export function demarrerSessionRelationsRacines(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceRelationsRacines,
): EtatSessionRelationsRacines {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "sommeProduit",
    etapeCourante: demarrerEtapeTentatives(),
    scoreSommeProduitExercice: null,
    sommeProduitRevele: false,
    scoreFactorisationExercice: null,
    factorisationRevele: false,
    aideSommeProduitUtilisee: false,
    aideFactorisationUtilisee: false,
    aideEquationDepuisRacinesUtilisee: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionRelationsRacines): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Étape "sommeProduit" : S et P calculés depuis a,b,c — toujours la première. */
export function soumettreReponseSommeProduit(
  etat: EtatSessionRelationsRacines,
  reponse: ReponseSommeProduit,
): EtatSessionRelationsRacines {
  if (etat.terminee || etat.phase !== "sommeProduit") {
    throw new Error("soumettreReponseSommeProduit : la session n'est pas à l'étape somme et produit");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseSommeProduit>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSommeProduit(r, etat.exerciceCourant),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "factorisation",
    scoreSommeProduitExercice: etat.aideSommeProduitUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
    sommeProduitRevele: etapeCourante.revelee,
  };
}

/** Active le bouton "Aide" de l'étape "sommeProduit" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSommeProduit(etat: EtatSessionRelationsRacines): EtatSessionRelationsRacines {
  if (etat.terminee || etat.phase !== "sommeProduit") {
    throw new Error("activerAideSommeProduit : la session n'est pas à l'étape somme et produit");
  }
  return { ...etat, aideSommeProduitUtilisee: true };
}

/** Étape "factorisation" : a(x-x1)(x-x2)=0, racines révélées par l'écran lui-même. */
export function soumettreReponseFactorisation(etat: EtatSessionRelationsRacines, reponse: string): EtatSessionRelationsRacines {
  if (etat.terminee || etat.phase !== "factorisation") {
    throw new Error("soumettreReponseFactorisation : la session n'est pas à l'étape factorisation");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFactorisation(r, etat.exerciceCourant),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "equationDepuisRacines",
    scoreFactorisationExercice: etat.aideFactorisationUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
    factorisationRevele: etapeCourante.revelee,
  };
}

/** Active le bouton "Aide" de l'étape "factorisation" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideFactorisation(etat: EtatSessionRelationsRacines): EtatSessionRelationsRacines {
  if (etat.terminee || etat.phase !== "factorisation") {
    throw new Error("activerAideFactorisation : la session n'est pas à l'étape factorisation");
  }
  return { ...etat, aideFactorisationUtilisee: true };
}

/** Étape "equationDepuisRacines" : finale, clôture l'exercice — x²-Sx+P=0 à partir des mêmes
 * racines (convention a=1 du cours). */
export function soumettreReponseEquationDepuisRacines(
  etat: EtatSessionRelationsRacines,
  reponse: string,
): EtatSessionRelationsRacines {
  if (etat.terminee || etat.phase !== "equationDepuisRacines") {
    throw new Error("soumettreReponseEquationDepuisRacines : la session n'est pas à l'étape équation depuis les racines");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEquationDepuisRacines(r, etat.exerciceCourant),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceRelationsRacines = {
    scoreSommeProduit: etat.scoreSommeProduitExercice as number,
    aideSommeProduitUtilisee: etat.aideSommeProduitUtilisee,
    sommeProduitRevele: etat.sommeProduitRevele,
    scoreFactorisation: etat.scoreFactorisationExercice as number,
    aideFactorisationUtilisee: etat.aideFactorisationUtilisee,
    factorisationRevele: etat.factorisationRevele,
    scoreEquationDepuisRacines: etat.aideEquationDepuisRacinesUtilisee ? (etapeCourante.score as number) * 0.5 : (etapeCourante.score as number),
    aideEquationDepuisRacinesUtilisee: etat.aideEquationDepuisRacinesUtilisee,
    equationDepuisRacinesRevele: etapeCourante.revelee,
  };

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
    phase: "sommeProduit",
    etapeCourante: demarrerEtapeTentatives(),
    scoreSommeProduitExercice: null,
    sommeProduitRevele: false,
    scoreFactorisationExercice: null,
    factorisationRevele: false,
    aideSommeProduitUtilisee: false,
    aideFactorisationUtilisee: false,
    aideEquationDepuisRacinesUtilisee: false,
  };
}

/** Active le bouton "Aide" de l'étape "equationDepuisRacines" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideEquationDepuisRacines(etat: EtatSessionRelationsRacines): EtatSessionRelationsRacines {
  if (etat.terminee || etat.phase !== "equationDepuisRacines") {
    throw new Error("activerAideEquationDepuisRacines : la session n'est pas à l'étape équation depuis les racines");
  }
  return { ...etat, aideEquationDepuisRacinesUtilisee: true };
}
