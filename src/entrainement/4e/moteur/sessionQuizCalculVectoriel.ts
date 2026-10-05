/**
 * Couche B — moteur de session pour "Calcul vectoriel" (quiz vrai/faux). N'importe jamais rien de
 * `src/generateurs/` — voir `sessionQuizCalculVectoriel.test.ts` pour la preuve avec un générateur
 * factice, même principe que les autres moteurs. Structure identique à
 * `sessionQuizCercleTriangles.ts` (gen63) et aux 4 quiz précédents.
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 */
import type { ExerciceQuizCalculVectoriel, GenerateurExerciceQuizCalculVectoriel } from "../core/quizCalculVectoriel.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierReponseVraiFaux } from "./verificationQuizCalculVectoriel";
import type { EtatSessionQuizCalculVectoriel, ResultatExerciceQuizCalculVectoriel } from "./typesQuizCalculVectoriel";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizCalculVectoriel): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizCalculVectoriel(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceQuizCalculVectoriel,
): EtatSessionQuizCalculVectoriel {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    etapeCourante: demarrerEtapeTentatives(),
    resultats: [],
    terminee: false,
  };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionQuizCalculVectoriel,
  resultat: ResultatExerciceQuizCalculVectoriel,
): EtatSessionQuizCalculVectoriel {
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
    etapeCourante: demarrerEtapeTentatives(),
  };
}

export function soumettreReponseQuizCalculVectoriel(
  etat: EtatSessionQuizCalculVectoriel,
  reponse: boolean,
): EtatSessionQuizCalculVectoriel {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizCalculVectoriel : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizCalculVectoriel;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizCalculVectoriel = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
