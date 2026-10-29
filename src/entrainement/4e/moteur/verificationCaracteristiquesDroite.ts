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

/** Tolérance d'un angle en degrés — une pente quelconque donne un angle non remarquable
 * (ex. arctan(2) ≈ 63,43°), demandé arrondi à l'unité : tout arrondi correct à l'unité (63) ou
 * plus fin (63,4) est accepté, jamais un angle faux d'un degré ou plus. Les angles remarquables
 * (entiers exacts) restent acceptés tels quels. */
export const TOLERANCE_ANGLE = 0.5;

/** Compare un `ReponseChamp` à sa cible réelle (`number` si elle existe, `null` sinon — même
 * convention que le contrat, `ExerciceCaracteristiquesDroite.pente`/`ordonneeOrigine`).
 * `tolerance` absente : `statutNumerique` (±0,01, pente/ordonnée à l'origine). */
export function diagnostiquerChamp(reponse: ReponseChamp, cible: number | null, tolerance?: number): StatutVerification {
  if (cible === null) return reponse.existe ? "not_equivalent" : "correct";
  if (!reponse.existe) return "not_equivalent";
  if (tolerance === undefined) return statutNumerique(reponse.valeur, cible);
  if (!Number.isFinite(reponse.valeur)) return "parse_error";
  return Math.abs(reponse.valeur - cible) <= tolerance + 1e-9 ? "correct" : "not_equivalent";
}

/** Tolérance du champ principal : `TOLERANCE_ANGLE` pour un angle, celle de `statutNumerique` pour
 * la pente. Exportée pour le marquage champ par champ de `EtapeCaracteristiquesDroite.tsx`. */
export function toleranceChampPrincipal(exercice: ExerciceCaracteristiquesDroite): number | undefined {
  return exercice.caracteristiqueDemandee === "pente" ? undefined : TOLERANCE_ANGLE;
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
  const statutPrincipal = diagnostiquerChamp(reponse.champPrincipal, cibleChampPrincipal(exercice), toleranceChampPrincipal(exercice));
  const statutOrdonnee = diagnostiquerChamp(reponse.ordonnee, exercice.ordonneeOrigine);
  return combinerStatuts(statutPrincipal, statutOrdonnee);
}

export function verifierCaracteristiques(exercice: ExerciceCaracteristiquesDroite, reponse: ReponseCaracteristiques): boolean {
  return diagnostiquerCaracteristiques(exercice, reponse) === "correct";
}
