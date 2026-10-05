/**
 * Couche B — moteur de session pour "Équations et inéquations du second degré" (quiz vrai/faux,
 * ajout ultérieur au chapitre 2). N'importe jamais rien de `src/generateurs/` — voir
 * `sessionQuizEquationsSecondDegre.test.ts` pour la preuve avec un générateur factice, même
 * principe que les 40 autres moteurs. Structure identique à `sessionQuizStatistiqueDescriptive.ts`
 * (gen59) et `sessionQuizFonctionSecondDegre.ts` (gen60).
 *
 * **Mono-écran, une seule tentative** — jamais `etat.reglages.tentativesMax` : avec exactement 2
 * réponses possibles (Vrai/Faux), un second essai après un échec serait trivialement deviné, donc
 * pédagogiquement sans valeur. Pas d'aide progressive non plus (`niveauAide` inexistant).
 */
import type { ExerciceQuizEquationsSecondDegre, GenerateurExerciceQuizEquationsSecondDegre } from "../core/quizEquationsSecondDegre.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierReponseVraiFaux } from "./verificationQuizEquationsSecondDegre";
import type { EtatSessionQuizEquationsSecondDegre, ResultatExerciceQuizEquationsSecondDegre } from "./typesQuizEquationsSecondDegre";

const POINTS_DE_BASE = 100;
const TENTATIVES_MAX_VRAI_FAUX = 1;

function reglagesEtape(etat: EtatSessionQuizEquationsSecondDegre): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_VRAI_FAUX,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function demarrerSessionQuizEquationsSecondDegre(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceQuizEquationsSecondDegre,
): EtatSessionQuizEquationsSecondDegre {
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
  etat: EtatSessionQuizEquationsSecondDegre,
  resultat: ResultatExerciceQuizEquationsSecondDegre,
): EtatSessionQuizEquationsSecondDegre {
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

export function soumettreReponseQuizEquationsSecondDegre(
  etat: EtatSessionQuizEquationsSecondDegre,
  reponse: boolean,
): EtatSessionQuizEquationsSecondDegre {
  if (etat.terminee) {
    throw new Error("soumettreReponseQuizEquationsSecondDegre : la session est déjà terminée");
  }
  const { question, variante } = etat.exerciceCourant as ExerciceQuizEquationsSecondDegre;

  const etapeCourante = soumettreEtapeTentatives<boolean>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseVraiFaux(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceQuizEquationsSecondDegre = {
    variante,
    question,
    reponseChoisie: reponse,
    score: etapeCourante.score as number,
    revele: etapeCourante.revelee,
  };
  return cloturerExerciceOuSuivant(etat, resultat);
}
