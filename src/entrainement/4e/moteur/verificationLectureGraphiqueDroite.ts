/**
 * Couche B — vérification propre à "Lecture graphique — équation d'une droite". Dispatch DIRECT sur
 * les primitives déjà construites dans `verificationDroite.ts` pour "Équation d'une droite" —
 * `diagnostiquerEquationDroiteLibre` (normalisation vers implicite + proportionnalité) et
 * `diagnostiquerRepresentationParametriqueTexte` (extraction affine en t + appartenance/colinéarité,
 * `promptgen43gen44etcorrectionschapitre6.md`, partie A.1 — réutilisé tel quel du générateur 42,
 * jamais redéveloppé) — jamais une seconde logique de comparaison réécrite ici, exactement la
 * réutilisation demandée par le prompt de création ("réutiliser... plutôt qu'une simple comparaison
 * d'expressions").
 */
import type { ExerciceLectureGraphiqueDroite } from "../core/lectureGraphiqueDroite.types";
import type { StatutVerification } from "./statutVerification";
import { diagnostiquerEquationDroiteLibre, diagnostiquerRepresentationParametriqueTexte } from "./verificationDroite";

/** Variante A — champ de texte libre, forme cartésienne au choix de l'élève (explicite dans un sens
 * ou l'autre, ou implicite). */
export function diagnostiquerCartesienne(exercice: ExerciceLectureGraphiqueDroite, texte: string): StatutVerification {
  return diagnostiquerEquationDroiteLibre(texte, exercice.referenceImplicite);
}

export function verifierCartesienne(exercice: ExerciceLectureGraphiqueDroite, texte: string): boolean {
  return diagnostiquerCartesienne(exercice, texte) === "correct";
}

/** Variante B — représentation paramétrique, 2 champs de texte libre ("x=x0+a*t"/"y=y0+b*t",
 * `promptgen43gen44etcorrectionschapitre6.md`, partie A.1). */
export interface ReponseParametriqueLecture {
  texteX: string;
  texteY: string;
}

export function diagnostiquerParametriqueLecture(
  exercice: ExerciceLectureGraphiqueDroite,
  reponse: ReponseParametriqueLecture,
): StatutVerification {
  return diagnostiquerRepresentationParametriqueTexte(reponse.texteX, reponse.texteY, exercice.referenceImplicite, exercice.vecteur);
}

export function verifierParametriqueLecture(exercice: ExerciceLectureGraphiqueDroite, reponse: ReponseParametriqueLecture): boolean {
  return diagnostiquerParametriqueLecture(exercice, reponse) === "correct";
}
