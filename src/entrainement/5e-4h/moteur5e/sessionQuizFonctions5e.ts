/**
 * Couche B (5e) — moteur de session pour "Fonctions : rappels et compléments" (quiz vrai/faux,
 * chapitre 1, 5gen39). N'importe jamais rien de `src/generateurs5e/` — voir
 * `sessionQuizFonctions5e.test.ts` pour la preuve avec un générateur factice, même principe que les
 * autres moteurs de ce chantier. Structure identique au quiz vrai/faux 4e
 * (`moteur/sessionQuizFonctionsReference.ts`, gen59-62).
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 *
 * `moteur/etapeTentatives.ts` (chemin 4e) est réutilisé TEL QUEL — c'est l'unique brique de
 * notation par tentatives sanctionnée comme partagée entre les deux chantiers (CLAUDE.md,
 * "Transversal 3 chantiers"), jamais dupliquée dans `moteur5e/`.
 */
import type { ExerciceQuizFonctions5e, GenerateurExerciceQuizFonctions5e } from "../core5e/quizFonctions5e.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { verifierReponseVraiFaux5e } from "./verificationQuizFonctions5e";
import type { EtatSessionQuizFonctions5e, ResultatExerciceQuizFonctions5e } from "./typesQuizFonctions5e";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizFonctions5e): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizFonctions5e(
  reglages: ReglagesSession5e,
  generateur: GenerateurExerciceQuizFonctions5e,
): EtatSessionQuizFonctions5e {
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
  etat: EtatSessionQuizFonctions5e,
  resultat: ResultatExerciceQuizFonctions5e,
): EtatSessionQuizFonctions5e {
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

export function soumettreReponseQuizFonctions5e(
  etat: EtatSessionQuizFonctions5e,
  reponse: boolean,
): EtatSessionQuizFonctions5e {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizFonctions5e : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizFonctions5e;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux5e(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizFonctions5e = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
