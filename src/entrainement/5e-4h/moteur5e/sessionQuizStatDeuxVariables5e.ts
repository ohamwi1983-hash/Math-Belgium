/**
 * Couche B (5e) — moteur de session pour "Statistique à deux variables" (quiz vrai/faux, chapitre 6,
 * 5gen82). N'importe jamais rien de `src/generateurs5e/` — voir `sessionQuizStatDeuxVariables5e.test.ts` pour
 * la preuve avec un générateur factice, même principe que les autres moteurs de ce chantier.
 * Structure identique au quiz vrai/faux du chapitre 4 (`moteur5e/sessionQuizLimites5e.ts`, 5gen42),
 * du chapitre 3 (`moteur5e/sessionQuizSuites5e.ts`, 5gen41), du chapitre 2
 * (`moteur5e/sessionQuizTrigonometrie5e.ts`, 5gen40) et du chapitre 1
 * (`moteur5e/sessionQuizFonctions5e.ts`, 5gen39).
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 *
 * `moteur/etapeTentatives.ts` (chemin 4e) est réutilisé TEL QUEL — c'est l'unique brique de
 * notation par tentatives sanctionnée comme partagée entre les deux chantiers (CLAUDE.md,
 * "Transversal 3 chantiers"), jamais dupliquée dans `moteur5e/`.
 */
import type { ExerciceQuizStatDeuxVariables5e, GenerateurExerciceQuizStatDeuxVariables5e } from "../core5e/quizStatDeuxVariables5e.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { verifierReponseVraiFaux5e } from "./verificationQuizStatDeuxVariables5e";
import type { EtatSessionQuizStatDeuxVariables5e, ResultatExerciceQuizStatDeuxVariables5e } from "./typesQuizStatDeuxVariables5e";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
  };
}

export function demarrerSessionQuizStatDeuxVariables5e(
  reglages: ReglagesSession5e,
  generateur: GenerateurExerciceQuizStatDeuxVariables5e,
): EtatSessionQuizStatDeuxVariables5e {
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
  etat: EtatSessionQuizStatDeuxVariables5e,
  resultat: ResultatExerciceQuizStatDeuxVariables5e,
): EtatSessionQuizStatDeuxVariables5e {
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

export function soumettreReponseQuizStatDeuxVariables5e(
  etat: EtatSessionQuizStatDeuxVariables5e,
  reponse: boolean,
): EtatSessionQuizStatDeuxVariables5e {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizStatDeuxVariables5e : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizStatDeuxVariables5e;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(),
    verifier: (r) => verifierReponseVraiFaux5e(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizStatDeuxVariables5e = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
