import type { Composition, QuestionComposeeGraphique } from "../core5e/composeeGraphique.types";

/** Consigne générale redondante (E.2), affichée AU-DESSUS du bloc de données (A.2/A.9) sur chaque
 * écran de question. */
export const CONSIGNE_GENERALE_COMPOSEE_GRAPHIQUE = "Soient les graphes des fonctions f et g.";

export function nomInterne(composition: Composition): "f" | "g" {
  return composition === "fRondG" ? "g" : "f";
}
function nomExterne(composition: Composition): "f" | "g" {
  return composition === "fRondG" ? "f" : "g";
}

export function consigneQuestion(question: QuestionComposeeGraphique): string {
  const externe = nomExterne(question.composition);
  const interne = nomInterne(question.composition);
  return `Calcule (${externe}∘${interne})(${question.a}) = ${externe}(${interne}(${question.a})).`;
}

export function labelChampResultat(question: QuestionComposeeGraphique): string {
  const externe = nomExterne(question.composition);
  return `${externe}(${nomInterne(question.composition)}(${question.a})) =`;
}

/**
 * Aide en 2 paliers, UNIQUEMENT pour l'étape g(8) (la valeur intermédiaire b) — E.7,
 * `promptcorrectionsregroupees.md` : "aucune aide prévue pour l'étape f(g(8))". Palier 2 n'ajoute
 * aucun texte supplémentaire — il révèle le point directement sur le graphe de la fonction interne
 * (`CourbeGraph.tsx`/`App5gen4.tsx`, pointillés violets vers les axes).
 */
export function texteAideNiveau1(question: QuestionComposeeGraphique): string {
  const interne = nomInterne(question.composition);
  return `On cherche la valeur ${interne}(${question.a}) sur le graphe de ${interne}.`;
}

export function texteAideNiveau2(question: QuestionComposeeGraphique): string {
  const interne = nomInterne(question.composition);
  return `Le point (${question.a} ; ${question.bAttendu}) apparaît maintenant sur le graphe de ${interne}.`;
}
