/**
 * Couche B — moteur de session pour "Lecture graphique — équation d'une droite". N'importe jamais
 * rien de `src/generateurs/` — voir `sessionLectureGraphiqueDroite.test.ts` pour la preuve avec un
 * générateur factice.
 *
 * Pas de `Phase` (comme "Quel angle ?"/"Transformations graphiques") : un seul écran par exercice,
 * déterminé directement par `exerciceCourant.variante` — deux fonctions de soumission distinctes
 * (`soumettreReponseCartesienne`/`soumettreReponseParametrique`), chacune clôture toujours
 * directement l'exercice dès que l'étape se termine.
 *
 * Aide PROGRESSIVE à 2 niveaux (même principe que "Équation d'une droite"/"Colinéarité"/
 * "Orthogonalité", pas le mécanisme "aide unique ×0,5" de "Quel angle ?" — la spec décrit
 * explicitement 2 aides séquentielles distinctes) : pénalité ADDITIVE (-20 points/niveau) appliquée
 * au moment précis où l'exercice se clôt, jamais rétroactivement.
 */
import type { ExerciceLectureGraphiqueDroite, GenerateurExerciceLectureGraphiqueDroite } from "../core/lectureGraphiqueDroite.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { EtatSessionLectureGraphiqueDroite, ResultatExerciceLectureGraphiqueDroite } from "./typesLectureGraphiqueDroite";
import type { ReponseParametriqueLecture } from "./verificationLectureGraphiqueDroite";
import { verifierCartesienne, verifierParametriqueLecture } from "./verificationLectureGraphiqueDroite";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceLectureGraphiqueDroite,
): Pick<EtatSessionLectureGraphiqueDroite, "exerciceCourant" | "etapeCourante" | "niveauAide"> {
  return {
    exerciceCourant: exercice,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
  };
}

export function demarrerSessionLectureGraphiqueDroite(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceLectureGraphiqueDroite,
): EtatSessionLectureGraphiqueDroite {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionLectureGraphiqueDroite): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionLectureGraphiqueDroite): EtatSessionLectureGraphiqueDroite {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint");
  }
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionLectureGraphiqueDroite,
  resultat: ResultatExerciceLectureGraphiqueDroite,
): EtatSessionLectureGraphiqueDroite {
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

/** Variante "cartesienne" — champ de texte libre, dernière et unique étape notée. */
export function soumettreReponseCartesienne(etat: EtatSessionLectureGraphiqueDroite, texte: string): EtatSessionLectureGraphiqueDroite {
  if (etat.terminee) {
    throw new Error("soumettreReponseCartesienne : la session est déjà terminée");
  }
  if (etat.exerciceCourant.variante !== "cartesienne") {
    throw new Error("soumettreReponseCartesienne : l'exercice courant n'est pas de variante cartesienne");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCartesienne(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    score,
    revele: etapeCourante.revelee,
    aideUtilisee: etat.niveauAide > 0,
  });
}

/** Variante "parametrique" — 2 champs de texte libre, dernière et unique étape notée. */
export function soumettreReponseParametrique(
  etat: EtatSessionLectureGraphiqueDroite,
  reponse: ReponseParametriqueLecture,
): EtatSessionLectureGraphiqueDroite {
  if (etat.terminee) {
    throw new Error("soumettreReponseParametrique : la session est déjà terminée");
  }
  if (etat.exerciceCourant.variante !== "parametrique") {
    throw new Error("soumettreReponseParametrique : l'exercice courant n'est pas de variante parametrique");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseParametriqueLecture>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierParametriqueLecture(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    score,
    revele: etapeCourante.revelee,
    aideUtilisee: etat.niveauAide > 0,
  });
}
