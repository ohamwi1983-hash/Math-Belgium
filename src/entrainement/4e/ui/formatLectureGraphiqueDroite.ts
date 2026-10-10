/**
 * Couche présentation — "Lecture graphique — équation d'une droite". Consignes/aides par variante,
 * dérivées uniquement des champs du contrat — jamais recalculées différemment côté vérification.
 */
import type { ExerciceLectureGraphiqueDroite, VarianteLectureGraphiqueDroite } from "../core/lectureGraphiqueDroite.types";
import { formatEquationImpliciteLatex, formatRepresentationParametriqueLatex } from "./formatEquationDroite";

/** Reformulation `promptcorrectionsgen43gen45gen47.md`, C.1 — cohérence terminologique avec le
 * générateur 42 ("les équations paramétriques", jamais "point + vecteur directeur", que la
 * question ne demande pas explicitement de produire). */
export function consigneLecture(exercice: ExerciceLectureGraphiqueDroite): string {
  return exercice.variante === "cartesienne" ? "Donne l'équation cartésienne de cette droite (sous la forme de ton choix)." : "Donne les équations paramétriques de cette droite.";
}

/** Consigne générale, affichée au-dessus du graphe sur les 2 variantes
 * (`promptgen43gen44etcorrectionschapitre6.md`, partie A.2) — rappelle l'objectif complet avant le
 * détail de la consigne par variante (`consigneLecture`, qui précise la forme attendue). */
export function consigneGeneraleLecture(exercice: ExerciceLectureGraphiqueDroite): string {
  return exercice.variante === "cartesienne"
    ? "Détermine l'équation cartésienne de la droite ci-dessous."
    : "Détermine les équations paramétriques de la droite ci-dessous.";
}

/** Aide niveau 1 — rappel de méthode, jamais une valeur réelle de l'exercice. */
export function texteAideNiveau1(exercice: ExerciceLectureGraphiqueDroite): string {
  return exercice.variante === "cartesienne"
    ? "Choisis deux points à coordonnées entières que la droite traverse sur le graphe, puis calcule un vecteur directeur (différence des coordonnées) avant d'écrire l'équation, sous la forme de ton choix (implicite, ou explicite en x ou en y)."
    : "Repère un point à coordonnées entières sur la droite : ce sera ton point de référence (x₀ ; y₀). Puis, à partir d'un second point, calcule les composantes (a ; b) du vecteur directeur.";
}

export const LIBELLE_VARIANTE: Record<VarianteLectureGraphiqueDroite, string> = {
  cartesienne: "Équation cartésienne",
  parametrique: "Représentation paramétrique",
};

/** Révélation de la réponse attendue — toujours la vraie référence de l'exercice, jamais la saisie
 * de l'élève. Variante paramétrique : les équations paramétriques COMPLÈTES (`promptcorrectionsgen43gen45gen47.md`,
 * C.3 — la question posée demande les équations elles-mêmes, pas un point et un vecteur ; le
 * récapitulatif doit refléter ce qui était réellement demandé), via `formatRepresentationParametriqueLatex`
 * (système à accolade, déjà partagé par le groupe "droites", jamais réécrit). `formatPointLatex`/
 * `formatVecteurLatex` restent réutilisées telles quelles pour la variante cartésienne/l'état
 * actuel ailleurs dans ce module. */
export function formatReponseAttendueLatex(exercice: ExerciceLectureGraphiqueDroite): string {
  if (exercice.variante === "parametrique") {
    const { point, vecteur } = exercice;
    return formatRepresentationParametriqueLatex(point.x, vecteur.x, point.y, vecteur.y);
  }
  const { a, b, c } = exercice.referenceImplicite;
  return formatEquationImpliciteLatex(a, b, c);
}
