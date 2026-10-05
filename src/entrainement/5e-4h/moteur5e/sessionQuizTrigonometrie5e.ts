/**
 * Couche B (5e) — moteur de session pour "Trigonométrie" (quiz vrai/faux, chapitre 2, 5gen40).
 * N'importe jamais rien de `src/generateurs5e/` — voir `sessionQuizTrigonometrie5e.test.ts` pour la
 * preuve avec un générateur factice, même principe que les autres moteurs de ce chantier. Structure
 * identique au quiz vrai/faux du chapitre 1 (`moteur5e/sessionQuizFonctions5e.ts`, 5gen39) et au quiz
 * vrai/faux 4e (`moteur/sessionQuizFonctionsReference.ts`, gen59-62).
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 *
 * `moteur/etapeTentatives.ts` (chemin 4e) est réutilisé TEL QUEL — c'est l'unique brique de
 * notation par tentatives sanctionnée comme partagée entre les deux chantiers (CLAUDE.md,
 * "Transversal 3 chantiers"), jamais dupliquée dans `moteur5e/`.
 */
import type { ExerciceQuizTrigonometrie5e, GenerateurExerciceQuizTrigonometrie5e } from "../core5e/quizTrigonometrie5e.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { verifierReponseVraiFaux5e } from "./verificationQuizTrigonometrie5e";
import type { EtatSessionQuizTrigonometrie5e, ResultatExerciceQuizTrigonometrie5e } from "./typesQuizTrigonometrie5e";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizTrigonometrie5e): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizTrigonometrie5e(
  reglages: ReglagesSession5e,
  generateur: GenerateurExerciceQuizTrigonometrie5e,
): EtatSessionQuizTrigonometrie5e {
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
  etat: EtatSessionQuizTrigonometrie5e,
  resultat: ResultatExerciceQuizTrigonometrie5e,
): EtatSessionQuizTrigonometrie5e {
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

export function soumettreReponseQuizTrigonometrie5e(
  etat: EtatSessionQuizTrigonometrie5e,
  reponse: boolean,
): EtatSessionQuizTrigonometrie5e {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizTrigonometrie5e : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizTrigonometrie5e;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux5e(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizTrigonometrie5e = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
