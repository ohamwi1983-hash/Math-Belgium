/**
 * Couche B — moteur de session pour "Cercle trigonométrique & triangles quelconques" (quiz
 * vrai/faux). N'importe jamais rien de `src/generateurs/` — voir
 * `sessionQuizCercleTriangles.test.ts` pour la preuve avec un générateur factice, même principe que
 * les autres moteurs. Structure identique à `sessionQuizFonctionsReference.ts` (gen62) et aux 3
 * quiz précédents (gen59/gen60/gen61).
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 */
import type { ExerciceQuizCercleTriangles, GenerateurExerciceQuizCercleTriangles } from "../core/quizCercleTriangles.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierReponseVraiFaux } from "./verificationQuizCercleTriangles";
import type { EtatSessionQuizCercleTriangles, ResultatExerciceQuizCercleTriangles } from "./typesQuizCercleTriangles";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizCercleTriangles): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizCercleTriangles(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceQuizCercleTriangles,
): EtatSessionQuizCercleTriangles {
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
  etat: EtatSessionQuizCercleTriangles,
  resultat: ResultatExerciceQuizCercleTriangles,
): EtatSessionQuizCercleTriangles {
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

export function soumettreReponseQuizCercleTriangles(
  etat: EtatSessionQuizCercleTriangles,
  reponse: boolean,
): EtatSessionQuizCercleTriangles {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizCercleTriangles : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizCercleTriangles;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizCercleTriangles = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
