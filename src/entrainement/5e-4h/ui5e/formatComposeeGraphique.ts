import type { Composition, QuestionComposeeGraphique } from "../core5e/composeeGraphique.types";
import { nombreTypo } from "./composeeGraphiqueGraph";

/** Consigne générale redondante, affichée AU-DESSUS du bloc de données sur chaque écran de question. */
export const CONSIGNE_GENERALE_COMPOSEE_GRAPHIQUE = "Soient les graphes des fonctions f et g.";

export function nomInterne(composition: Composition): "f" | "g" {
  return composition === "fRondG" ? "g" : "f";
}
function nomExterne(composition: Composition): "f" | "g" {
  return composition === "fRondG" ? "f" : "g";
}

/** « f(g(−7)) » — l'image cherchée, avec le « − » typographique. */
export function imageCherchee(question: QuestionComposeeGraphique): string {
  return `${nomExterne(question.composition)}(${nomInterne(question.composition)}(${nombreTypo(question.a)}))`;
}

export function consigneQuestion(question: QuestionComposeeGraphique): string {
  const externe = nomExterne(question.composition);
  const interne = nomInterne(question.composition);
  return `Calcule (${externe}∘${interne})(${nombreTypo(question.a)}) = ${imageCherchee(question)}, si cette image existe.`;
}

export function labelChampResultat(question: QuestionComposeeGraphique): string {
  return `${imageCherchee(question)} =`;
}

/** Résultat rédigé : « f(g(−7)) = 3 » ou « f(g(−7)) n'existe pas » (jamais « = n'existe pas »). */
export function texteResultat(question: QuestionComposeeGraphique, valeur: number | string | null): string {
  if (valeur === null) return `${imageCherchee(question)} n'existe pas`;
  return `${imageCherchee(question)} = ${typeof valeur === "number" ? nombreTypo(valeur) : valeur}`;
}

/** Aide en 2 paliers, UNIQUEMENT pour la lecture de la valeur intermédiaire : palier 1 un rappel,
 * palier 2 le point révélé sur le graphe de la fonction interne (pointillés violets vers les axes). */
export function texteAideNiveau1(question: QuestionComposeeGraphique): string {
  const interne = nomInterne(question.composition);
  return `Commence par lire ${interne}(${nombreTypo(question.a)}) sur le graphe de ${interne}.`;
}

export function texteAideNiveau2(question: QuestionComposeeGraphique): string {
  const interne = nomInterne(question.composition);
  return `Le point d'abscisse ${nombreTypo(question.a)} est maintenant marqué sur le graphe de ${interne} : lis son ordonnée.`;
}
