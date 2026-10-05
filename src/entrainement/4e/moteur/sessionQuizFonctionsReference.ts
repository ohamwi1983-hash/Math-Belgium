/**
 * Couche B — moteur de session pour "Caractéristiques d'une fonction & fonctions de référence"
 * (quiz vrai/faux, ajout ultérieur au chapitre 2). N'importe jamais rien de `src/generateurs/` —
 * voir `sessionQuizFonctionsReference.test.ts` pour la preuve avec un générateur factice, même
 * principe que les autres moteurs. Structure identique à `sessionQuizEquationsSecondDegre.ts`
 * (gen61) et aux 2 quiz précédents (gen59/gen60).
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 */
import type { ExerciceQuizFonctionsReference, GenerateurExerciceQuizFonctionsReference } from "../core/quizFonctionsReference.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierReponseVraiFaux } from "./verificationQuizFonctionsReference";
import type { EtatSessionQuizFonctionsReference, ResultatExerciceQuizFonctionsReference } from "./typesQuizFonctionsReference";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizFonctionsReference): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizFonctionsReference(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceQuizFonctionsReference,
): EtatSessionQuizFonctionsReference {
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
  etat: EtatSessionQuizFonctionsReference,
  resultat: ResultatExerciceQuizFonctionsReference,
): EtatSessionQuizFonctionsReference {
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

export function soumettreReponseQuizFonctionsReference(
  etat: EtatSessionQuizFonctionsReference,
  reponse: boolean,
): EtatSessionQuizFonctionsReference {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizFonctionsReference : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizFonctionsReference;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizFonctionsReference = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
