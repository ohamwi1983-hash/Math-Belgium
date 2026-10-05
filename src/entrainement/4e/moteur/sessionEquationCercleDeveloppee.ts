/**
 * Couche B — moteur de session pour "Centre et rayon d'un cercle depuis l'équation développée".
 * N'importe jamais rien de `src/generateurs/` — voir `sessionEquationCercleDeveloppee.test.ts` pour
 * la preuve avec un générateur factice.
 *
 * 3 phases FIXES, toujours dans le même ordre : `regroupement → completion → centreRayon` — aucun
 * saut conditionnel, les deux variantes traversant exactement la même séquence (même principe que
 * "Équation d'un cercle... à partir d'un graphe"). "centreRayon" combine 2 champs numériques
 * (centre) + 1 champ texte libre (rayon) dans un seul écran, une seule étape de tentatives.
 *
 * Aide PROGRESSIVE par écran — pénalité ADDITIVE (-20 points/niveau) appliquée au moment précis où
 * l'écran se clôt, jamais rétroactivement.
 */
import type { ExerciceEquationCercleDeveloppee, GenerateurExerciceEquationCercleDeveloppee } from "../core/equationCercleDeveloppee.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { EtatSessionEquationCercleDeveloppee, ReponseEcranCentreRayon, ResultatExerciceEquationCercleDeveloppee } from "./typesEquationCercleDeveloppee";
import { verifierCentreRayon, verifierCompletionCarre, verifierRegroupement } from "./verificationEquationCercleDeveloppee";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_REGROUPEMENT = 2;
export const NIVEAU_AIDE_MAX_COMPLETION = 2;
export const NIVEAU_AIDE_MAX_CENTRE_RAYON = 2;

function etatInitial(
  exercice: ExerciceEquationCercleDeveloppee,
): Pick<
  EtatSessionEquationCercleDeveloppee,
  | "exerciceCourant"
  | "phase"
  | "etapeCourante"
  | "niveauAideRegroupement"
  | "niveauAideCompletion"
  | "niveauAideCentreRayon"
  | "scoreRegroupementExercice"
  | "regroupementRevele"
  | "regroupementAideUtilisee"
  | "scoreCompletionExercice"
  | "completionRevele"
  | "completionAideUtilisee"
> {
  return {
    exerciceCourant: exercice,
    phase: "regroupement",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideRegroupement: 0,
    niveauAideCompletion: 0,
    niveauAideCentreRayon: 0,
    scoreRegroupementExercice: null,
    regroupementRevele: false,
    regroupementAideUtilisee: false,
    scoreCompletionExercice: null,
    completionRevele: false,
    completionAideUtilisee: false,
  };
}

export function demarrerSessionEquationCercleDeveloppee(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceEquationCercleDeveloppee,
): EtatSessionEquationCercleDeveloppee {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionEquationCercleDeveloppee): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionEquationCercleDeveloppee): EtatSessionEquationCercleDeveloppee {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "regroupement") {
    if (etat.niveauAideRegroupement >= NIVEAU_AIDE_MAX_REGROUPEMENT) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideRegroupement: etat.niveauAideRegroupement + 1 };
  }
  if (etat.phase === "completion") {
    if (etat.niveauAideCompletion >= NIVEAU_AIDE_MAX_COMPLETION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideCompletion: etat.niveauAideCompletion + 1 };
  }
  if (etat.niveauAideCentreRayon >= NIVEAU_AIDE_MAX_CENTRE_RAYON) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideCentreRayon: etat.niveauAideCentreRayon + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionEquationCercleDeveloppee,
  resultat: ResultatExerciceEquationCercleDeveloppee,
): EtatSessionEquationCercleDeveloppee {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    ...etatInitial(etat.generateur()),
  };
}

/** Écran "regroupement" — mène toujours à "completion". */
export function soumettreReponseRegroupement(etat: EtatSessionEquationCercleDeveloppee, reponse: string): EtatSessionEquationCercleDeveloppee {
  if (etat.terminee || etat.phase !== "regroupement") {
    throw new Error("soumettreReponseRegroupement : la session n'est pas à l'étape regroupement");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRegroupement(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideRegroupement);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "completion",
    scoreRegroupementExercice: score,
    regroupementRevele: etapeCourante.revelee,
    regroupementAideUtilisee: etat.niveauAideRegroupement > 0,
  };
}

/** Écran "completion" — mène toujours à "centreRayon". */
export function soumettreReponseCompletion(etat: EtatSessionEquationCercleDeveloppee, reponse: string): EtatSessionEquationCercleDeveloppee {
  if (etat.terminee || etat.phase !== "completion") {
    throw new Error("soumettreReponseCompletion : la session n'est pas à l'étape completion");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCompletionCarre(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideCompletion);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "centreRayon",
    scoreCompletionExercice: score,
    completionRevele: etapeCourante.revelee,
    completionAideUtilisee: etat.niveauAideCompletion > 0,
  };
}

/** Écran "centreRayon" (dernier, toujours terminal) — clôture toujours l'exercice. */
export function soumettreReponseCentreRayon(etat: EtatSessionEquationCercleDeveloppee, reponse: ReponseEcranCentreRayon): EtatSessionEquationCercleDeveloppee {
  if (etat.terminee || etat.phase !== "centreRayon") {
    throw new Error("soumettreReponseCentreRayon : la session n'est pas à l'étape centreRayon");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseEcranCentreRayon>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCentreRayon(exercice, { x: r.x, y: r.y }, r.rayon),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideCentreRayon);

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    scoreRegroupement: etat.scoreRegroupementExercice as number,
    regroupementRevele: etat.regroupementRevele,
    regroupementAideUtilisee: etat.regroupementAideUtilisee,
    scoreCompletion: etat.scoreCompletionExercice as number,
    completionRevele: etat.completionRevele,
    completionAideUtilisee: etat.completionAideUtilisee,
    scoreCentreRayon: score,
    centreRayonRevele: etapeCourante.revelee,
    centreRayonAideUtilisee: etat.niveauAideCentreRayon > 0,
  });
}
