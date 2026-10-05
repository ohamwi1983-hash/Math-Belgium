/**
 * Couche B — vérification pour "Tableau de fréquences" (chapitre 5, premier générateur).
 *
 * Statut à 3 valeurs (`StatutVerification`) sur chaque champ numérique libre — `parserNombreOuFraction`
 * (`verificationAnalyseFonction.ts`, import moteur→moteur, hors du champ de la règle Couche A↔B)
 * réutilisée telle quelle plutôt qu'un parseur numérique réinventé, `null` devenant toujours
 * `parse_error`. Tolérance flottante minime (`1e-9`, pas la tolérance large `0,005` utilisée
 * ailleurs dans le projet pour des racines/rapports irrationnels) : les valeurs de ce générateur
 * (effectifs, fréquences, cumuls) sont toutes des décimales EXACTES par construction (voir
 * `core/tableauFrequences.types.ts`) — cette tolérance minime ne couvre qu'un éventuel bruit de
 * virgule flottante résiduel, jamais une vraie marge d'arrondi.
 *
 * Écran 1 ("identification") : en plus du statut par champ, une vérification STRUCTURELLE de
 * l'ensemble de la réponse "add-as-needed" — bon nombre de lignes, bonnes valeurs, dans le bon
 * ordre (positionnel, jamais un multi-ensemble) — voir `verifierIdentification`.
 */
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import type { StatutVerification } from "./statutVerification";
import type { ExerciceTableauFrequences } from "../core/tableauFrequences.types";

const TOLERANCE = 1e-9;

function statutValeurExacte(texte: string, cible: number): StatutVerification {
  const valeur = parserNombreOuFraction(texte);
  if (valeur === null) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

// ============================================================================
// Écran 1 — identification des valeurs distinctes et de leurs effectifs
// ============================================================================

export interface LigneIdentificationSaisie {
  valeur: string;
  effectif: string;
}

export type ReponseIdentification = LigneIdentificationSaisie[];

export interface StatutLigneIdentification {
  valeur: StatutVerification;
  effectif: StatutVerification;
}

/**
 * Diagnostique une ligne saisie à un index donné — positionnel, jamais une recherche par valeur
 * dans un multi-ensemble : l'ordre croissant fait partie du raisonnement testé (spec), une ligne à
 * la mauvaise position échoue donc naturellement même si sa valeur existe ailleurs dans la table
 * réelle. Une ligne SURNUMÉRAIRE (au-delà du nombre réel de valeurs distinctes, `attendu`
 * `undefined`) n'est jamais correcte — mais son propre statut de parsing reste distinct
 * (`parse_error` si non numérique, `not_equivalent` sinon), jamais confondu.
 */
export function diagnostiquerLigneIdentification(
  exercice: ExerciceTableauFrequences,
  index: number,
  ligne: LigneIdentificationSaisie,
): StatutLigneIdentification {
  const attendu = exercice.lignes[index];
  if (!attendu) {
    const valeurParsee = parserNombreOuFraction(ligne.valeur);
    const effectifParse = parserNombreOuFraction(ligne.effectif);
    return {
      valeur: valeurParsee === null ? "parse_error" : "not_equivalent",
      effectif: effectifParse === null ? "parse_error" : "not_equivalent",
    };
  }
  return {
    valeur: statutValeurExacte(ligne.valeur, attendu.valeur),
    effectif: statutValeurExacte(ligne.effectif, attendu.effectif),
  };
}

export function evaluerIdentification(exercice: ExerciceTableauFrequences, reponse: ReponseIdentification): StatutLigneIdentification[] {
  return reponse.map((ligne, i) => diagnostiquerLigneIdentification(exercice, i, ligne));
}

/**
 * Vérification structurelle complète — tout ou rien, en une seule tentative : le nombre de lignes
 * soumises doit égaler exactement le nombre réel de valeurs distinctes (ni oubli, ni ligne
 * surnuméraire), et chaque ligne doit être correcte à sa position exacte (valeur ET effectif).
 */
export function verifierIdentification(exercice: ExerciceTableauFrequences, reponse: ReponseIdentification): boolean {
  if (reponse.length !== exercice.lignes.length) return false;
  return evaluerIdentification(exercice, reponse).every((s) => s.valeur === "correct" && s.effectif === "correct");
}

// ============================================================================
// Écran 2 — fréquences (%)
// ============================================================================

/** Une réponse par ligne, dans l'ordre déjà fixé de `exercice.lignes` (propagé depuis l'écran 1,
 * jamais recomposé par l'élève ici) — un nombre fixe de champs, pas une interface "add-as-needed". */
export type ReponseFrequences = string[];

export function diagnostiquerFrequenceLigne(exercice: ExerciceTableauFrequences, index: number, texte: string): StatutVerification {
  return statutValeurExacte(texte, exercice.lignes[index].frequencePourcent);
}

export function evaluerFrequences(exercice: ExerciceTableauFrequences, reponse: ReponseFrequences): StatutVerification[] {
  return exercice.lignes.map((_, i) => diagnostiquerFrequenceLigne(exercice, i, reponse[i] ?? ""));
}

export function verifierFrequences(exercice: ExerciceTableauFrequences, reponse: ReponseFrequences): boolean {
  if (reponse.length !== exercice.lignes.length) return false;
  return evaluerFrequences(exercice, reponse).every((s) => s === "correct");
}

// ============================================================================
// Écran 3 — effectifs cumulés
// ============================================================================

export type ReponseCumules = string[];

export function diagnostiquerCumuleLigne(exercice: ExerciceTableauFrequences, index: number, texte: string): StatutVerification {
  return statutValeurExacte(texte, exercice.lignes[index].effectifCumule);
}

export function evaluerCumules(exercice: ExerciceTableauFrequences, reponse: ReponseCumules): StatutVerification[] {
  return exercice.lignes.map((_, i) => diagnostiquerCumuleLigne(exercice, i, reponse[i] ?? ""));
}

export function verifierCumules(exercice: ExerciceTableauFrequences, reponse: ReponseCumules): boolean {
  if (reponse.length !== exercice.lignes.length) return false;
  return evaluerCumules(exercice, reponse).every((s) => s === "correct");
}

// ============================================================================
// Écran 4 — fréquences cumulées (%)
// ============================================================================

export type ReponseFrequencesCumulees = string[];

export function diagnostiquerFrequenceCumuleeLigne(exercice: ExerciceTableauFrequences, index: number, texte: string): StatutVerification {
  return statutValeurExacte(texte, exercice.lignes[index].frequenceCumulee);
}

export function evaluerFrequencesCumulees(exercice: ExerciceTableauFrequences, reponse: ReponseFrequencesCumulees): StatutVerification[] {
  return exercice.lignes.map((_, i) => diagnostiquerFrequenceCumuleeLigne(exercice, i, reponse[i] ?? ""));
}

export function verifierFrequencesCumulees(exercice: ExerciceTableauFrequences, reponse: ReponseFrequencesCumulees): boolean {
  if (reponse.length !== exercice.lignes.length) return false;
  return evaluerFrequencesCumulees(exercice, reponse).every((s) => s === "correct");
}
