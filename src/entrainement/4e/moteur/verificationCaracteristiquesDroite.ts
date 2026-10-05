/**
 * Couche B — "Caractéristiques d'une droite". Écran 1 (extraction point/vecteur) réutilise
 * directement `diagnostiquerPointVecteurParametrique` (`verificationDroite.ts`, module frère) —
 * même mécanisme que l'écran d'extraction de "Équation d'une droite"/"Relations entre droites",
 * jamais une seconde logique de comparaison. Écran 2 (pente-ou-angle + ordonnée à l'origine) est
 * propre à cet exercice : chaque champ peut valoir soit un nombre, soit "n'existe pas" (verticale) —
 * `ReponseChamp` porte cette alternative structurellement, jamais un `null` numérique ambigu avec
 * "pas encore répondu".
 */
import type { ExerciceCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import type { Composantes, Point } from "../core/vecteur.types";
import { combinerStatuts, diagnostiquerPointVecteurParametrique, statutNumerique } from "./verificationDroite";
import type { StatutVerification } from "./statutVerification";

export interface ReponseExtraction {
  point: Point;
  vecteur: Composantes;
}

export function diagnostiquerExtraction(exercice: ExerciceCaracteristiquesDroite, reponse: ReponseExtraction): StatutVerification {
  return diagnostiquerPointVecteurParametrique(reponse.point, reponse.vecteur, exercice.referenceImplicite, exercice.vecteur);
}

export function verifierExtraction(exercice: ExerciceCaracteristiquesDroite, reponse: ReponseExtraction): boolean {
  return diagnostiquerExtraction(exercice, reponse) === "correct";
}

/** Un champ de l'écran 2 : soit une valeur numérique soumise, soit "n'existe pas" (cas verticale). */
export type ReponseChamp = { existe: true; valeur: number } | { existe: false };

/** Compare un `ReponseChamp` à sa cible réelle (`number` si elle existe, `null` sinon — même
 * convention que le contrat, `ExerciceCaracteristiquesDroite.pente`/`ordonneeOrigine`). */
export function diagnostiquerChamp(reponse: ReponseChamp, cible: number | null): StatutVerification {
  if (cible === null) return reponse.existe ? "not_equivalent" : "correct";
  if (!reponse.existe) return "not_equivalent";
  return statutNumerique(reponse.valeur, cible);
}

export interface ReponseCaracteristiques {
  champPrincipal: ReponseChamp; // pente, angle avec Ox OU angle avec Oy, selon exercice.caracteristiqueDemandee
  ordonnee: ReponseChamp;
}

/** Cible du champ principal — pente, `angleDeg` (Ox) ou `angleOyDeg` (Oy) selon
 * `exercice.caracteristiqueDemandee` (`promptgen46modifications.md`, point 2). Exportée pour être
 * réutilisée telle quelle par `EtapeCaracteristiquesDroite.tsx` (Couche présentation), jamais
 * recalculée différemment. */
export function cibleChampPrincipal(exercice: ExerciceCaracteristiquesDroite): number | null {
  if (exercice.caracteristiqueDemandee === "pente") return exercice.pente;
  return exercice.caracteristiqueDemandee === "angleOx" ? exercice.angleDeg : exercice.angleOyDeg;
}

export function diagnostiquerCaracteristiques(exercice: ExerciceCaracteristiquesDroite, reponse: ReponseCaracteristiques): StatutVerification {
  const statutPrincipal = diagnostiquerChamp(reponse.champPrincipal, cibleChampPrincipal(exercice));
  const statutOrdonnee = diagnostiquerChamp(reponse.ordonnee, exercice.ordonneeOrigine);
  return combinerStatuts(statutPrincipal, statutOrdonnee);
}

export function verifierCaracteristiques(exercice: ExerciceCaracteristiquesDroite, reponse: ReponseCaracteristiques): boolean {
  return diagnostiquerCaracteristiques(exercice, reponse) === "correct";
}
