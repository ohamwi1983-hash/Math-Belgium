/**
 * Couche B — moteur de session pour l'exercice "tableau de signes" : phase "simplification"
 * conditionnelle (uniquement si pgcd(|a|,|b|,|c|)>1 — voir simplificationInequation.ts), toujours
 * en tête quand elle a lieu, suivie des 3 phases fixes (racines → signe_a → intervalle), même
 * principe que src/moteur/session.ts (phaseInitiale, simplification→isolement→reconnaissance→
 * champ1→champ2). N'importe jamais rien de src/generateurs : voir sessionInequation.test.ts pour
 * la preuve avec un générateur factice minimal.
 */
import type {
  ExerciceInequation,
  GenerateurExerciceInequation,
  ReponseRacines,
  SigneA,
  SolutionEnsemble,
} from "../core/inequation.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { EtatEtapeTentatives, ReglagesEtape } from "./etapeTentatives";
import { exerciceSimplifie, necessiteSimplification } from "./simplificationInequation";
import { verifierRacines, verifierSigneA, verifierSimplification, verifierSolutionInequation } from "./verificationInequation";

const POINTS_DE_BASE = 100;

export type PhaseInequation = "simplification" | "racines" | "signe_a" | "intervalle";

export interface ResultatExerciceInequation {
  /** score de l'étape de simplification, 0-100, ou null si l'étape n'a pas eu lieu (pgcd(|a|,|b|,|c|)=1) */
  scoreSimplification: number | null;
  scoreRacines: number;
  racinesRevele: boolean;
  scoreSigneA: number;
  signeARevele: boolean;
  scoreIntervalle: number;
  intervalleRevele: boolean;
}

/** Phase de départ (ou de reprise après changement d'exercice) : "simplification" seulement si
 * nécessaire, sinon directement "racines" — voir necessiteSimplification. */
function phaseInitiale(exercice: ExerciceInequation): PhaseInequation {
  return necessiteSimplification(exercice) ? "simplification" : "racines";
}

export interface EtatSessionInequation {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceInequation;
  /** nombre d'exercices déjà clôturés (0 au début) */
  indexExercice: number;
  exerciceCourant: ExerciceInequation;
  phase: PhaseInequation;
  etapeCourante: EtatEtapeTentatives;
  /** score de la phase "simplification" une fois close, ou null si l'étape n'a pas eu lieu (voir necessiteSimplification) */
  scoreSimplificationExercice: number | null;
  scoreRacinesExercice: number | null;
  racinesRevele: boolean;
  scoreSigneAExercice: number | null;
  signeARevele: boolean;
  /** Bouton "Aide" de l'étape simplification : révélation à sens unique, jamais remise à false
   * pour cet exercice une fois activée (même principe qu'aideUtilisee ci-dessous, moteur/session.ts
   * activerAideSimplification). Applique ×0,5 au score final de l'étape simplification. */
  aideSimplificationUtilisee: boolean;
  /** Bouton "Aide" de l'étape intervalle : révélation à sens unique, jamais remise à false pour
   * cet exercice une fois activée (voir activerAideIntervalle). Applique ×0,5 au score final de
   * l'étape intervalle, quel que soit le nombre de tentatives avant/après l'activation. */
  aideUtilisee: boolean;
  resultats: ResultatExerciceInequation[];
  terminee: boolean;
}

export function demarrerSessionInequation(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceInequation,
): EtatSessionInequation {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    scoreSimplificationExercice: null,
    scoreRacinesExercice: null,
    racinesRevele: false,
    scoreSigneAExercice: null,
    signeARevele: false,
    aideSimplificationUtilisee: false,
    aideUtilisee: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionInequation): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/**
 * Étape "simplification" : ramener le trinôme affiché à pgcd(|a|,|b|,|c|)=1. N'existe que si
 * necessiteSimplification(exercice) — voir phaseInitiale. Une fois confirmée, l'exercice courant
 * lui-même est remplacé par sa version réduite (exerciceSimplifie) : "tout le reste de l'écran se
 * fait sur base de la forme simplifiée" — racines/signe_a/intervalle travaillent alors tous sur
 * les coefficients réduits (même principe que soumettreReponseSimplification, moteur/session.ts).
 */
export function soumettreReponseSimplification(etat: EtatSessionInequation, reponse: string): EtatSessionInequation {
  if (etat.terminee || etat.phase !== "simplification") {
    throw new Error("soumettreReponseSimplification : la session n'est pas à l'étape de simplification");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSimplification(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const exerciceCourant = exerciceSimplifie(etat.exerciceCourant);

  return {
    ...etat,
    exerciceCourant,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "racines",
    scoreSimplificationExercice: etat.aideSimplificationUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/**
 * Active le bouton "Aide" de l'étape "simplification" — révélation à sens unique (jamais de
 * retour à false pour cet exercice), applique ×0,5 au score final de cette étape dans
 * soumettreReponseSimplification, quel que soit le nombre de tentatives déjà utilisées ou à venir.
 */
export function activerAideSimplification(etat: EtatSessionInequation): EtatSessionInequation {
  if (etat.terminee || etat.phase !== "simplification") {
    throw new Error("activerAideSimplification : la session n'est pas à l'étape de simplification");
  }
  return { ...etat, aideSimplificationUtilisee: true };
}

/** Étape "racines" : après simplification quand elle a lieu, sinon toujours la première. */
export function soumettreReponseRacines(etat: EtatSessionInequation, reponse: ReponseRacines): EtatSessionInequation {
  if (etat.terminee || etat.phase !== "racines") {
    throw new Error("soumettreReponseRacines : la session n'est pas à l'étape racines");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseRacines>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRacines(r, etat.exerciceCourant),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "signe_a",
    scoreRacinesExercice: etapeCourante.score,
    racinesRevele: etapeCourante.revelee,
  };
}

/** Étape "signe de a" : après racines. */
export function soumettreReponseSigneA(etat: EtatSessionInequation, reponse: SigneA): EtatSessionInequation {
  if (etat.terminee || etat.phase !== "signe_a") {
    throw new Error("soumettreReponseSigneA : la session n'est pas à l'étape signe de a");
  }

  const etapeCourante = soumettreEtapeTentatives<SigneA>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSigneA(r, etat.exerciceCourant),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "intervalle",
    scoreSigneAExercice: etapeCourante.score,
    signeARevele: etapeCourante.revelee,
  };
}

/**
 * Active le bouton "Aide" pour l'étape intervalle en cours : révélation à sens unique (jamais de
 * retour à false pour cet exercice), applique ×0,5 au score final de cette étape dans
 * soumettreReponseIntervalle, quel que soit le nombre de tentatives déjà utilisées ou à venir.
 */
export function activerAideIntervalle(etat: EtatSessionInequation): EtatSessionInequation {
  if (etat.terminee || etat.phase !== "intervalle") {
    throw new Error("activerAideIntervalle : la session n'est pas à l'étape intervalle");
  }
  return { ...etat, aideUtilisee: true };
}

/** Étape "intervalle" : finale, clôture l'exercice et agrège les 3 scores. */
export function soumettreReponseIntervalle(
  etat: EtatSessionInequation,
  reponse: SolutionEnsemble,
): EtatSessionInequation {
  if (etat.terminee || etat.phase !== "intervalle") {
    throw new Error("soumettreReponseIntervalle : la session n'est pas à l'étape intervalle");
  }

  const etapeCourante = soumettreEtapeTentatives<SolutionEnsemble>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSolutionInequation(r, etat.exerciceCourant.solution),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const scoreIntervalle = etat.aideUtilisee ? (etapeCourante.score as number) * 0.5 : (etapeCourante.score as number);

  const resultat: ResultatExerciceInequation = {
    scoreSimplification: etat.scoreSimplificationExercice,
    scoreRacines: etat.scoreRacinesExercice as number,
    racinesRevele: etat.racinesRevele,
    scoreSigneA: etat.scoreSigneAExercice as number,
    signeARevele: etat.signeARevele,
    scoreIntervalle,
    intervalleRevele: etapeCourante.revelee,
  };

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
    scoreSimplificationExercice: null,
    scoreRacinesExercice: null,
    racinesRevele: false,
    scoreSigneAExercice: null,
    signeARevele: false,
    aideSimplificationUtilisee: false,
    aideUtilisee: false,
  };
}
