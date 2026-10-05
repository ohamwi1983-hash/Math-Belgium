/**
 * Couche A — "Cercle trigonométrique & triangles quelconques" (quiz vrai/faux), soixante-troisième
 * générateur. Tire une question dans la banque pré-écrite (`banque.ts`) du thème (variante) actif —
 * jamais de génération procédurale, voir `core/quizCercleTriangles.types.ts`. Structure identique à
 * `generateurs/quizFonctionsReference/` (gen62) et aux 3 quiz précédents (gen59/gen60/gen61).
 */
import type { ExerciceQuizCercleTriangles, GenerateurExerciceQuizCercleTriangles, QuestionVraiFaux, VarianteQuizCercleTriangles } from "../../core/quizCercleTriangles.types";
import { randomInt } from "./aleatoire";
import { BANQUE_QUIZ_CERCLE_TRIANGLES } from "./banque";

export const CATALOGUE_VARIANTES: { id: VarianteQuizCercleTriangles; label: string }[] = [
  { id: "placementCercle", label: "Cercle trigonométrique — placement, quadrants et signes" },
  { id: "valeursRemarquables", label: "Valeurs trigonométriques remarquables" },
  { id: "identiteFondamentale", label: "Identité fondamentale — retrouver sin ou cos à partir de l'autre" },
  { id: "anglesAssocies", label: "Angles associés" },
  { id: "resoudreAngle", label: "Résoudre une équation trigonométrique simple" },
  { id: "triangleQuelconque", label: "Triangle quelconque — lois des sinus et des cosinus" },
  { id: "trianglesLies", label: "Triangles liés — triangulation et applications concrètes" },
];

function tirerQuestion(varianteId: VarianteQuizCercleTriangles): QuestionVraiFaux {
  const banque = BANQUE_QUIZ_CERCLE_TRIANGLES[varianteId];
  return banque[randomInt(0, banque.length - 1)];
}

/** Construit un exercice pour un thème forcé (convention CLAUDE.md, "Catalogue de variantes...").
 * `overrides?.question` permet de forcer aussi la question précise (panneau dev, tests). */
export function construireAvecVarianteId(
  varianteId: VarianteQuizCercleTriangles,
  overrides?: { question?: QuestionVraiFaux },
): ExerciceQuizCercleTriangles {
  const question = overrides?.question ?? tirerQuestion(varianteId);
  return { variante: varianteId, question };
}

export function genererExerciceQuizCercleTriangles(): ExerciceQuizCercleTriangles {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}

function melanger<T>(items: readonly T[]): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * Générateur SANS RÉPÉTITION pour un thème donné — chaque session étudiant porte sur un thème
 * unique et compte autant d'exercices que de questions dans la banque de ce thème (35) : sans
 * cette précaution, le tirage indépendant habituel (`genererExerciceQuizCercleTriangles`) pourrait
 * répéter une question avant d'avoir couvert les 34 autres. État interne (file mélangée, ré-mélangée
 * à chaque épuisement) enfermé dans la fermeture, jamais partagé entre deux appels de cette fonction
 * — voir `AppQuizCercleTriangles.tsx`, qui en crée une par session démarrée.
 */
export function creerGenerateurSansRepetition(varianteId: VarianteQuizCercleTriangles): GenerateurExerciceQuizCercleTriangles {
  const banque = BANQUE_QUIZ_CERCLE_TRIANGLES[varianteId];
  let file: QuestionVraiFaux[] = [];

  return () => {
    if (file.length === 0) {
      file = melanger(banque);
    }
    const question = file.pop() as QuestionVraiFaux;
    return { variante: varianteId, question };
  };
}
