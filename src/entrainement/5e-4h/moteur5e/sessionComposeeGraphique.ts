/**
 * Couche B — moteur de session pour 5gen4 ("Composée de fonctions et image d'un réel — lecture
 * graphique"). N'importe jamais rien de `src/generateurs5e/` — voir
 * `sessionComposeeGraphique.test.ts` pour la preuve avec un générateur factice.
 *
 * Un niveau d'imbrication de plus que les autres moteurs 5e : exercice → questions (4-5) → écran.
 * Chaque question est un écran À PART ENTIÈRE (existence/valeur du résultat final f(g(a)), un seul
 * bouton "Valider"), les 2 courbes restant persistantes sur toutes les questions d'un même exercice.
 * Le champ intermédiaire g(a) n'est plus scoré séparément (retiré, retour utilisateur direct) —
 * seule sa LECTURE reste guidée par l'aide (voir `NIVEAU_AIDE_MAX_QUESTION` ci-dessous).
 */
import type { ExerciceComposeeGraphique, GenerateurExerciceComposeeGraphique, QuestionComposeeGraphique } from "../core5e/composeeGraphique.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import type { EtatSessionComposeeGraphique, ResultatExerciceComposeeGraphique, ResultatQuestionComposeeGraphique } from "./typesComposeeGraphique";
import type { ReponseQuestionComposeeGraphique } from "./verificationComposeeGraphique";
import { verifierReponseQuestion } from "./verificationComposeeGraphique";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Plafond d'aide FIXE à 2 (E.7, `promptcorrectionsregroupees.md`) : l'aide ne porte QUE sur
 * l'étape g(8) (lire la valeur intermédiaire b) — palier 1 un rappel textuel, palier 2 le point
 * révélé sur le graphe de la fonction interne (voir `CourbeGraph.tsx`/`App5gen4.tsx`) — jamais
 * d'aide pour l'étape f(g(8)) (existence/valeur du résultat final), quelle que soit la question. */
export const NIVEAU_AIDE_MAX_QUESTION = 2;

export function niveauAideMaxQuestion(_question: QuestionComposeeGraphique): number {
  return NIVEAU_AIDE_MAX_QUESTION;
}

function questionCourante(exercice: ExerciceComposeeGraphique, indexQuestion: number): QuestionComposeeGraphique {
  return exercice.questions[indexQuestion];
}

function etatInitialExercice(exercice: ExerciceComposeeGraphique): Pick<EtatSessionComposeeGraphique, "exerciceCourant" | "indexQuestion" | "etapeCourante" | "niveauAide" | "resultatsQuestionsExercice"> {
  return { exerciceCourant: exercice, indexQuestion: 0, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, resultatsQuestionsExercice: [] };
}

export function demarrerSessionComposeeGraphique(reglages: ReglagesSession5e, generateur: GenerateurExerciceComposeeGraphique): EtatSessionComposeeGraphique {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitialExercice(generateur()) };
}

function reglagesEtape(etat: EtatSessionComposeeGraphique): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionComposeeGraphique): EtatSessionComposeeGraphique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  const question = questionCourante(etat.exerciceCourant, etat.indexQuestion);
  if (etat.niveauAide >= niveauAideMaxQuestion(question)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cette question");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionComposeeGraphique, resultat: ResultatExerciceComposeeGraphique): EtatSessionComposeeGraphique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitialExercice(etat.generateur()) };
}

export function soumettreReponseQuestion(etat: EtatSessionComposeeGraphique, reponse: ReponseQuestionComposeeGraphique): EtatSessionComposeeGraphique {
  if (etat.terminee) throw new Error("soumettreReponseQuestion : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const question = questionCourante(exercice, etat.indexQuestion);

  const etapeCourante = soumettreEtapeTentatives<ReponseQuestionComposeeGraphique>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseQuestion(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const resultatQuestion: ResultatQuestionComposeeGraphique = {
    question,
    score,
    revele: etapeCourante.revelee,
  };
  const resultatsQuestionsExercice = [...etat.resultatsQuestionsExercice, resultatQuestion];
  const indexQuestionSuivant = etat.indexQuestion + 1;

  if (indexQuestionSuivant < exercice.questions.length) {
    return { ...etat, resultatsQuestionsExercice, indexQuestion: indexQuestionSuivant, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0 };
  }

  return cloturerExerciceOuSuivant(etat, { exercice, resultatsQuestions: resultatsQuestionsExercice });
}
