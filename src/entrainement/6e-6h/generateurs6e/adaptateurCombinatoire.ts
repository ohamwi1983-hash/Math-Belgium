import type { BlocCorrection, SectionExercice } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import { donneesEnLigne } from "../ui6e/fragmentsCombinatoire";
import type { FormatCombinatoire } from "../ui6e/fragmentsCombinatoire";

/**
 * Énoncé et corrigé papier PROVISOIRES des générateurs 6gen43–6gen48 (6e ch. 7), tirés des MÊMES
 * fonctions de format que l'écran (données en prose, une question par écran, réponse attendue).
 * La refonte papier complète (énoncé sans sous-questions, corrigé « comme au tableau », niveaux,
 * profils — lot E de l'audit) remplacera ces deux fonctions ; elle réutilisera les formats.
 */
export function enoncePapierCombinatoire<E, P extends string>(format: FormatCombinatoire<E, P>, phases: (e: E) => P[]) {
  return (e: E): SectionExercice => ({
    enteteFragments: [...format.consigneGenerale(e), texte(" "), ...donneesEnLigne(format.donnees(e))],
    questions: phases(e).map((p) => ({ consigne: format.consigneEcran(e, p) })),
  });
}

export function correctionPapierCombinatoire<E, P extends string>(format: FormatCombinatoire<E, P>, phases: (e: E) => P[]) {
  return (e: E): BlocCorrection[] =>
    phases(e).map((p, i) => ({
      type: "paragraphe",
      fragments: [texte(`${"abcdefghij"[i] ?? i + 1}) `), latex(format.reponseAttendue(e, p).join(",\\ "))],
    }));
}
