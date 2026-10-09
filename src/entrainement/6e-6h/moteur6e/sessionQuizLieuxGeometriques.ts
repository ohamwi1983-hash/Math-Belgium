/**
 * Couche B (6e) — moteur de session pour "Lieux géométriques" (quiz vrai/faux, 6gen72, ajout
 * ultérieur au chapitre "Lieux géométriques"). N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionQuizLieuxGeometriques.test.ts` pour la preuve avec un générateur factice, même
 * principe que tous les autres moteurs du projet. Structure identique à 6gen71
 * (`sessionQuizVariablesAleatoires.ts`) et 6gen70/69/68/67/66/65.
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 */
import type { ExerciceQuizLieuxGeometriques, GenerateurExerciceQuizLieuxGeometriques } from "../core6e/quizLieuxGeometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { verifierReponseVraiFaux } from "./verificationQuizLieuxGeometriques";
import type { EtatSessionQuizLieuxGeometriques, ResultatExerciceQuizLieuxGeometriques } from "./typesQuizLieuxGeometriques";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizLieuxGeometriques): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizLieuxGeometriques(
  reglages: ReglagesSession6e,
  generateur: GenerateurExerciceQuizLieuxGeometriques,
): EtatSessionQuizLieuxGeometriques {
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
  etat: EtatSessionQuizLieuxGeometriques,
  resultat: ResultatExerciceQuizLieuxGeometriques,
): EtatSessionQuizLieuxGeometriques {
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

export function soumettreReponseQuizLieuxGeometriques(
  etat: EtatSessionQuizLieuxGeometriques,
  reponse: boolean,
): EtatSessionQuizLieuxGeometriques {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizLieuxGeometriques : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizLieuxGeometriques;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizLieuxGeometriques = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
