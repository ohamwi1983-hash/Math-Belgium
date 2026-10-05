/**
 * Couche B — moteur de session pour "Géométrie analytique plane" (quiz vrai/faux). N'importe jamais
 * rien de `src/generateurs/` — voir `sessionQuizGeometrieAnalytique.test.ts` pour la preuve avec un
 * générateur factice, même principe que les autres moteurs. Structure identique à
 * `sessionQuizCalculVectoriel.ts` (gen64) et aux 5 quiz précédents.
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 */
import type { ExerciceQuizGeometrieAnalytique, GenerateurExerciceQuizGeometrieAnalytique } from "../core/quizGeometrieAnalytique.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierReponseVraiFaux } from "./verificationQuizGeometrieAnalytique";
import type { EtatSessionQuizGeometrieAnalytique, ResultatExerciceQuizGeometrieAnalytique } from "./typesQuizGeometrieAnalytique";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizGeometrieAnalytique): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizGeometrieAnalytique(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceQuizGeometrieAnalytique,
): EtatSessionQuizGeometrieAnalytique {
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
  etat: EtatSessionQuizGeometrieAnalytique,
  resultat: ResultatExerciceQuizGeometrieAnalytique,
): EtatSessionQuizGeometrieAnalytique {
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

export function soumettreReponseQuizGeometrieAnalytique(
  etat: EtatSessionQuizGeometrieAnalytique,
  reponse: boolean,
): EtatSessionQuizGeometrieAnalytique {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizGeometrieAnalytique : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizGeometrieAnalytique;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizGeometrieAnalytique = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
