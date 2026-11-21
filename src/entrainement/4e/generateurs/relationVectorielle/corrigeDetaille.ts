import type { EtapeCorrection } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceRelationGeneraleRV, ExerciceRelationVectorielle } from "../../core/relationVectorielle.types";
import { COURS_COMPOSANTES, coefVec, etapesMultiplePoint, etapesTranslationPoint, finaliserCorrigeVecteurs, vec } from "../../ui/corrigeVecteurs1";

/**
 * Corrigé détaillé « comme au tableau » de gen21 « Relation vectorielle (guidée) » — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN : translation = « a » (coordonnées) ;
 * relation générale = « a » (traduction en différences de points), « b » (coordonnées). Partagé par
 * l'adaptateur papier et l'appli (`AppRelationVectorielle.tsx`).
 */

/** Traduction attendue de l'écran 1, coefficient en fraction KaTeX : « F−B=\dfrac{1}{2}(E−B) ». */
export function traductionLatex(e: ExerciceRelationGeneraleRV): string {
  return `${e.pointCherche}-${e.labelOrigine}=${coefVec(e.coefficient)}(${e.labelConnu}-${e.labelOrigine})`;
}

function etapeTraduction(e: ExerciceRelationGeneraleRV): EtapeCorrection[] {
  const { labelOrigine: b, labelConnu: c, pointCherche: P, coefficient: k } = e;
  return [
    utilise("a", [texte("Un vecteur est la différence « extrémité − origine » : "), latex(`${vec(`${b}${P}`)}=${P}-${b}`), texte(" et "), latex(`${vec(`${b}${c}`)}=${c}-${b}`), texte(` ${COURS_COMPOSANTES}.`)]),
    calcul("a", [
      ligne(`${vec(`${b}${P}`)}=${coefVec(k)}${vec(`${b}${c}`)}`, e.forme === "milieu" ? `relation de l'énoncé (${P} milieu de [${b}${c}])` : "relation de l'énoncé"),
      ligne(traductionLatex(e), [texte("on remplace "), latex(vec(`${b}${P}`)), texte(" par "), latex(`${P}-${b}`), texte(" et "), latex(vec(`${b}${c}`)), texte(" par "), latex(`${c}-${b}`)]),
    ]),
    resultat("a", [latex(traductionLatex(e))]),
    piege("a", [texte("Toujours « extrémité − origine » : "), latex(vec(`${b}${P}`)), texte(" s'écrit "), latex(`${P}-${b}`), texte(", jamais "), latex(`${b}-${P}`), texte(" (ce serait le vecteur opposé).")]),
  ];
}

export function correctionDetailleeRelationVectorielle(e: ExerciceRelationVectorielle): EtapeCorrection[] {
  if (e.variante === "translation") return finaliserCorrigeVecteurs(etapesTranslationPoint("a", e));
  return finaliserCorrigeVecteurs([...etapeTraduction(e), ...etapesMultiplePoint("b", e)]);
}
