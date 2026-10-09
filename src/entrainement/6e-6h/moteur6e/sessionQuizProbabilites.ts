/**
 * Couche B (6e) — moteur de session pour "Probabilités" (quiz vrai/faux, 6gen69, ajout ultérieur au
 * chapitre 8). N'importe jamais rien de `src/generateurs6e/` — voir
 * `sessionQuizProbabilites.test.ts` pour la preuve avec un générateur factice, même principe que
 * tous les autres moteurs du projet. Structure identique à 6gen68
 * (`sessionQuizNombresComplexes.ts`) et 6gen67/66/65.
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 */
import type { ExerciceQuizProbabilites, GenerateurExerciceQuizProbabilites } from "../core6e/quizProbabilites.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { verifierReponseVraiFaux } from "./verificationQuizProbabilites";
import type { EtatSessionQuizProbabilites, ResultatExerciceQuizProbabilites } from "./typesQuizProbabilites";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizProbabilites): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizProbabilites(
  reglages: ReglagesSession6e,
  generateur: GenerateurExerciceQuizProbabilites,
): EtatSessionQuizProbabilites {
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
  etat: EtatSessionQuizProbabilites,
  resultat: ResultatExerciceQuizProbabilites,
): EtatSessionQuizProbabilites {
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

export function soumettreReponseQuizProbabilites(
  etat: EtatSessionQuizProbabilites,
  reponse: boolean,
): EtatSessionQuizProbabilites {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizProbabilites : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizProbabilites;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizProbabilites = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
