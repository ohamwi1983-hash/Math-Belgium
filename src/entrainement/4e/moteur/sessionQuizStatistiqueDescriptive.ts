/**
 * Couche B — moteur de session pour "Statistique descriptive à une variable" (quiz vrai/faux,
 * chapitre 5, dixième générateur du chapitre). N'importe jamais rien de `src/generateurs/` —
 * voir `sessionQuizStatistiqueDescriptive.test.ts` pour la preuve avec un générateur factice,
 * même principe que les 38 autres moteurs.
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné (la
 * seule autre option est forcément la bonne), donc pédagogiquement sans valeur. `tentativesMax` du
 * réglage global est donc délibérément ignoré ici, contrairement à tous les autres moteurs du
 * projet qui le lisent depuis `ReglagesSession`. Pas d'aide progressive non plus (`niveauAide`
 * inexistant) : aucune aide partielle n'a de sens sur un choix à 2 options — CLAUDE.md, "Aide
 * progressive additive... max=0 → pas de bouton".
 */
import type { ExerciceQuizStatistiqueDescriptive, GenerateurExerciceQuizStatistiqueDescriptive } from "../core/quizStatistiqueDescriptive.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierReponseVraiFaux } from "./verificationQuizStatistiqueDescriptive";
import type { EtatSessionQuizStatistiqueDescriptive, ResultatExerciceQuizStatistiqueDescriptive } from "./typesQuizStatistiqueDescriptive";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizStatistiqueDescriptive): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizStatistiqueDescriptive(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceQuizStatistiqueDescriptive,
): EtatSessionQuizStatistiqueDescriptive {
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
  etat: EtatSessionQuizStatistiqueDescriptive,
  resultat: ResultatExerciceQuizStatistiqueDescriptive,
): EtatSessionQuizStatistiqueDescriptive {
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

export function soumettreReponseQuizStatistiqueDescriptive(
  etat: EtatSessionQuizStatistiqueDescriptive,
  reponse: boolean,
): EtatSessionQuizStatistiqueDescriptive {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizStatistiqueDescriptive : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizStatistiqueDescriptive;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizStatistiqueDescriptive = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
