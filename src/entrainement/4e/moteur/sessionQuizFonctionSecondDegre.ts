/**
 * Couche B — moteur de session pour "La fonction du second degré" (quiz vrai/faux, ajout ultérieur
 * au chapitre 1). N'importe jamais rien de `src/generateurs/` — voir
 * `sessionQuizFonctionSecondDegre.test.ts` pour la preuve avec un générateur factice, même
 * principe que les 39 autres moteurs. Structure identique à `sessionQuizStatistiqueDescriptive.ts`
 * (gen59).
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 */
import type { ExerciceQuizFonctionSecondDegre, GenerateurExerciceQuizFonctionSecondDegre } from "../core/quizFonctionSecondDegre.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierReponseVraiFaux } from "./verificationQuizFonctionSecondDegre";
import type { EtatSessionQuizFonctionSecondDegre, ResultatExerciceQuizFonctionSecondDegre } from "./typesQuizFonctionSecondDegre";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizFonctionSecondDegre): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizFonctionSecondDegre(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceQuizFonctionSecondDegre,
): EtatSessionQuizFonctionSecondDegre {
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
  etat: EtatSessionQuizFonctionSecondDegre,
  resultat: ResultatExerciceQuizFonctionSecondDegre,
): EtatSessionQuizFonctionSecondDegre {
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

export function soumettreReponseQuizFonctionSecondDegre(
  etat: EtatSessionQuizFonctionSecondDegre,
  reponse: boolean,
): EtatSessionQuizFonctionSecondDegre {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizFonctionSecondDegre : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizFonctionSecondDegre;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizFonctionSecondDegre = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
