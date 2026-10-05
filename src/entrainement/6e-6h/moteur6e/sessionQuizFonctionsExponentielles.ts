/**
 * Couche B (6e) — moteur de session pour "Fonctions exponentielles" (quiz vrai/faux, 6gen65, ajout
 * ultérieur au chapitre 2). N'importe jamais rien de `src/generateurs6e/` — voir
 * `sessionQuizFonctionsExponentielles.test.ts` pour la preuve avec un générateur factice, même
 * principe que tous les autres moteurs du projet. Structure identique à 6gen64 et aux 4 quiz
 * vrai/faux du chantier 4e (gen59-62).
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 */
import type { ExerciceQuizFonctionsExponentielles, GenerateurExerciceQuizFonctionsExponentielles } from "../core6e/quizFonctionsExponentielles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { verifierReponseVraiFaux } from "./verificationQuizFonctionsExponentielles";
import type { EtatSessionQuizFonctionsExponentielles, ResultatExerciceQuizFonctionsExponentielles } from "./typesQuizFonctionsExponentielles";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizFonctionsExponentielles): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizFonctionsExponentielles(
  reglages: ReglagesSession6e,
  generateur: GenerateurExerciceQuizFonctionsExponentielles,
): EtatSessionQuizFonctionsExponentielles {
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
  etat: EtatSessionQuizFonctionsExponentielles,
  resultat: ResultatExerciceQuizFonctionsExponentielles,
): EtatSessionQuizFonctionsExponentielles {
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

export function soumettreReponseQuizFonctionsExponentielles(
  etat: EtatSessionQuizFonctionsExponentielles,
  reponse: boolean,
): EtatSessionQuizFonctionsExponentielles {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizFonctionsExponentielles : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizFonctionsExponentielles;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizFonctionsExponentielles = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
