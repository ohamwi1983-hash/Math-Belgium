/**
 * Couche B (6e) — moteur de session pour "Variables aléatoires et lois de probabilités" (quiz
 * vrai/faux, 6gen71, ajout ultérieur au chapitre 10). N'importe jamais rien de
 * `src/generateurs6e/` — voir `sessionQuizVariablesAleatoires.test.ts` pour la preuve avec un
 * générateur factice, même principe que tous les autres moteurs du projet. Structure identique à
 * 6gen70 (`sessionQuizCombinatoire.ts`) et 6gen69/68/67/66/65.
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 */
import type { ExerciceQuizVariablesAleatoires, GenerateurExerciceQuizVariablesAleatoires } from "../core6e/quizVariablesAleatoires.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { verifierReponseVraiFaux } from "./verificationQuizVariablesAleatoires";
import type { EtatSessionQuizVariablesAleatoires, ResultatExerciceQuizVariablesAleatoires } from "./typesQuizVariablesAleatoires";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizVariablesAleatoires): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizVariablesAleatoires(
  reglages: ReglagesSession6e,
  generateur: GenerateurExerciceQuizVariablesAleatoires,
): EtatSessionQuizVariablesAleatoires {
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
  etat: EtatSessionQuizVariablesAleatoires,
  resultat: ResultatExerciceQuizVariablesAleatoires,
): EtatSessionQuizVariablesAleatoires {
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

export function soumettreReponseQuizVariablesAleatoires(
  etat: EtatSessionQuizVariablesAleatoires,
  reponse: boolean,
): EtatSessionQuizVariablesAleatoires {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizVariablesAleatoires : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizVariablesAleatoires;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizVariablesAleatoires = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
