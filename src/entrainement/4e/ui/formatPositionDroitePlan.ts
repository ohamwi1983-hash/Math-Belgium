import type { CandidatSecantePositionDroitePlan, ConclusionPositionDroitePlan, ExercicePositionDroitePlan } from "../core/positionDroitePlan.types";
import { pointAppartientAuPlan } from "../moteur/geometrieEspace";
import { verifierReponseParallele, verifierReponseSecante } from "../moteur/verificationPositionDroitePlan";

/**
 * Présentation — "Position d'une droite par rapport à un plan". Terminologie interdite dans tout
 * texte affiché à l'élève : "déterminant", "produit scalaire" (le calcul interne peut les utiliser
 * mathématiquement — `moteur/geometrieEspace.ts` — mais jamais nommés ainsi ici).
 */

export const LIBELLE_CLASSIFICATION: Record<ConclusionPositionDroitePlan, string> = {
  incluse: "Incluse dans le plan",
  parallele: "Parallèle au plan",
  secante: "Sécante au plan",
};

export function libelleClassification(classification: ConclusionPositionDroitePlan): string {
  return LIBELLE_CLASSIFICATION[classification];
}

export function libelleDroite(exercice: ExercicePositionDroitePlan): string {
  return `(${exercice.droite[0]}${exercice.droite[1]})`;
}

export function libellePlan(exercice: ExercicePositionDroitePlan): string {
  return `(${exercice.plan[0]}${exercice.plan[1]}${exercice.plan[2]})`;
}

export function libelleCandidatSecante(candidat: CandidatSecantePositionDroitePlan): string {
  return candidat.type === "sommet" ? `le sommet ${candidat.nom}` : candidat.label;
}

// --- Écran 1 : Classification --------------------------------------------------------------------

export const TEXTE_AIDE_CLASSIFICATION_NIVEAU1 =
  "Rappel de la méthode : (1) les 2 points de la droite appartiennent-ils tous les deux au plan ? " +
  "Si oui → incluse. (2) Sinon, la droite est-elle parallèle à une arête ou une diagonale du plan ? " +
  "Si oui → parallèle. (3) Sinon → sécante.";

/** Aide 2 : révèle UNIQUEMENT l'appartenance de chaque point de la droite au plan (étape 1 de la
 * méthode) — jamais si la droite est parallèle ou sécante. */
export function texteAideClassificationNiveau2(exercice: ExercicePositionDroitePlan): string {
  const planPoints = exercice.plan.map((nom) => exercice.solide.sommets[nom]) as [
    (typeof exercice.solide.sommets)[string],
    (typeof exercice.solide.sommets)[string],
    (typeof exercice.solide.sommets)[string],
  ];
  const [d1, d2] = exercice.droite;
  const point1DansLePlan = pointAppartientAuPlan(exercice.solide.sommets[d1], planPoints);
  const point2DansLePlan = pointAppartientAuPlan(exercice.solide.sommets[d2], planPoints);
  const phrase1 = `Le point ${d1} ${point1DansLePlan ? "appartient" : "n'appartient pas"} au plan ${libellePlan(exercice)}.`;
  const phrase2 = `Le point ${d2} ${point2DansLePlan ? "appartient" : "n'appartient pas"} au plan ${libellePlan(exercice)}.`;
  return `${phrase1} ${phrase2}`;
}

// --- Écran 2 : Justification structurée -----------------------------------------------------------

export const TEXTE_AIDE_JUSTIFICATION: Record<ConclusionPositionDroitePlan, string> = {
  incluse: "Une droite est incluse dans un plan si ses 2 points définisseurs appartiennent tous les deux à ce plan.",
  parallele: "Une droite est parallèle à un plan si elle est parallèle à une droite de ce plan (une arête ou une diagonale).",
  secante: "Une droite sécante à un plan le traverse en un seul point — ce point tombe ici exactement sur un sommet ou une arête du solide.",
};

export function texteAideJustification(classification: ConclusionPositionDroitePlan): string {
  return TEXTE_AIDE_JUSTIFICATION[classification];
}

export function consigneJustification(classification: ConclusionPositionDroitePlan): string {
  if (classification === "incluse") return "Sélectionne les 2 sommets qui définissent la droite et qui appartiennent au plan.";
  if (classification === "parallele") return "Sélectionne l'arête ou la diagonale du plan à laquelle la droite est parallèle.";
  return "Désigne le sommet ou l'arête où la droite perce le plan.";
}

/** Texte de révélation de la réponse attendue à l'écran 2 — panneau de résultat, après épuisement
 * des tentatives. Toujours dérivé directement de `exercice` (jamais une saisie résiduelle de
 * l'élève) : pour "incluse", les 2 sommets de la droite eux-mêmes ; pour "parallele"/"secante", le
 * candidat dont l'index vérifie réellement `verifierReponseParallele`/`verifierReponseSecante`
 * (réutilise la vérification géométrique elle-même, jamais un index supposé "le premier" — l'ordre
 * des candidats n'est pas garanti stable, `construireCandidatsSecante` les mélange). */
export function texteReponseJustificationAttendue(exercice: ExercicePositionDroitePlan): string {
  if (exercice.classification === "incluse") {
    return `les sommets ${exercice.droite[0]} et ${exercice.droite[1]}`;
  }
  if (exercice.classification === "parallele") {
    const index = exercice.candidatsParallele.findIndex((_, i) => verifierReponseParallele(exercice, i));
    return index >= 0 ? exercice.candidatsParallele[index].label : "";
  }
  const index = exercice.candidatsSecante.findIndex((_, i) => verifierReponseSecante(exercice, i));
  return index >= 0 ? libelleCandidatSecante(exercice.candidatsSecante[index]) : "";
}
