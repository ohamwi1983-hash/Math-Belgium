import type { CandidatSecantePositionDroitePlan, ConclusionPositionDroitePlan, ExercicePositionDroitePlan } from "../core/positionDroitePlan.types";
import { pointAppartientAuPlan } from "../moteur/geometrieEspace";
import {
  pointsFigureDansLePlan,
  positionPointNomme,
  verifierReponseParallele,
  verifierReponseSecante,
} from "../moteur/verificationPositionDroitePlan";

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

/** Définition des milieux nommés, ex. « I est le milieu de [EF]. » — vide s'il n'y en a pas. */
export function textePointsNommes(exercice: ExercicePositionDroitePlan): string {
  return exercice.pointsNommes.map((p) => `${p.nom} est le milieu de [${p.milieuDe[0]}${p.milieuDe[1]}].`).join(" ");
}

/** Phrase de position complète, ex. « la droite (IG) est sécante au plan (BCF) ». */
export function phrasePosition(exercice: ExercicePositionDroitePlan): string {
  return `la droite ${libelleDroite(exercice)} est ${LIBELLE_CLASSIFICATION[exercice.classification].toLowerCase()} ${libellePlan(exercice)}`;
}

export function libelleCandidatSecante(candidat: CandidatSecantePositionDroitePlan): string {
  if (candidat.type === "sommet") return `le sommet ${candidat.nom}`;
  if (candidat.type === "point") return `le point ${candidat.nom}`;
  return candidat.label;
}

// --- Écran 1 : Classification --------------------------------------------------------------------

export const TEXTE_AIDE_CLASSIFICATION_NIVEAU1 =
  "Rappel de la méthode : (1) les 2 points de la droite appartiennent-ils tous les deux au plan ? " +
  "Si oui → incluse. (2) Sinon, la droite est-elle parallèle à une arête ou une diagonale du plan ? " +
  "Si oui → parallèle. (3) Sinon → sécante.";

/** Aide 2 : la méthode APPLIQUÉE à la figure, sans trancher (audit chapitre 8) — avant, elle disait
 * si chaque point de la droite était dans le plan, ce qui donnait la réponse dans 2 cas sur 3. */
export function texteAideClassificationNiveau2(exercice: ExercicePositionDroitePlan): string {
  return (
    `Le plan ${libellePlan(exercice)} est la surface colorée : il contient d'autres points que les 3 lettres de son nom, ` +
    `et il se prolonge au-delà du solide. Repère tous les sommets et points nommés qui sont dedans, puis regarde où sont ` +
    `${exercice.droite[0]} et ${exercice.droite[1]}. S'ils ne sont pas tous les deux dans le plan, compare la direction de la droite ` +
    `${libelleDroite(exercice)} à celles des arêtes et des diagonales du plan.`
  );
}

/** Appartenance de chaque point de la droite au plan — utilisée par la CORRECTION exportée (jamais
 * comme aide à l'écran, voir `texteAideClassificationNiveau2`). */
export function texteFaitsAppartenance(exercice: ExercicePositionDroitePlan): string {
  const planPoints = exercice.plan.map((nom) => exercice.solide.sommets[nom]) as [
    (typeof exercice.solide.sommets)[string],
    (typeof exercice.solide.sommets)[string],
    (typeof exercice.solide.sommets)[string],
  ];
  return exercice.droite
    .map((nom) => `Le point ${nom} ${pointAppartientAuPlan(positionPointNomme(exercice, nom)!, planPoints) ? "appartient" : "n'appartient pas"} au plan ${libellePlan(exercice)}.`)
    .join(" ");
}

// --- Écran 2 : Justification structurée -----------------------------------------------------------

export const TEXTE_AIDE_JUSTIFICATION: Record<ConclusionPositionDroitePlan, string> = {
  incluse:
    "Un plan contient bien plus que les 3 points de son nom : toutes les arêtes de la figure qui sont dans ce plan y sont entières, avec leurs extrémités et leurs milieux.",
  parallele: "Une droite est parallèle à un plan si elle est parallèle à une droite de ce plan (une arête ou une diagonale).",
  secante:
    "Une droite sécante à un plan le traverse en un seul point — ici, il tombe sur un sommet, sur un point nommé, ou à l'intérieur d'une arête ou d'une diagonale.",
};

export function texteAideJustification(classification: ConclusionPositionDroitePlan): string {
  return TEXTE_AIDE_JUSTIFICATION[classification];
}

export function consigneJustification(exercice: ExercicePositionDroitePlan): string {
  if (exercice.classification === "incluse") return `Sélectionne tous les points nommés de la figure qui appartiennent au plan ${libellePlan(exercice)}.`;
  if (exercice.classification === "parallele") return `Sélectionne l'arête ou la diagonale du plan ${libellePlan(exercice)} qui a la même direction que la droite ${libelleDroite(exercice)}.`;
  return `Où la droite ${libelleDroite(exercice)} perce-t-elle le plan ${libellePlan(exercice)} ?`;
}

/** Réponse attendue de l'écran 2 — toujours dérivée de `exercice` : pour "incluse", la liste des
 * points de la figure dans le plan ; pour "parallele"/"secante", le candidat dont l'index vérifie
 * réellement la vérification géométrique (l'ordre des candidats est mélangé). */
export function texteReponseJustificationAttendue(exercice: ExercicePositionDroitePlan): string {
  if (exercice.classification === "incluse") {
    return pointsFigureDansLePlan(exercice).join(", ");
  }
  if (exercice.classification === "parallele") {
    const index = exercice.candidatsParallele.findIndex((_, i) => verifierReponseParallele(exercice, i));
    return index >= 0 ? exercice.candidatsParallele[index].label : "";
  }
  const index = exercice.candidatsSecante.findIndex((_, i) => verifierReponseSecante(exercice, i));
  return index >= 0 ? libelleCandidatSecante(exercice.candidatsSecante[index]) : "";
}
