/**
 * Couche B — vérification pour "Regroupement en classes et histogramme" (chapitre 5, second
 * générateur).
 *
 * Statut à 3 valeurs (`StatutVerification`) sur les champs numériques libres des écrans 1
 * ("classement") et 2 ("fréquences", variante "frequence" uniquement) — même primitive que le
 * trentième exercice (`parserNombreOuFraction`, `verificationAnalyseFonction.ts`, import
 * moteur→moteur). Tolérance flottante minime (`1e-9`) : les valeurs de ce générateur (effectifs
 * entiers, fréquences en pourcentage entier — voir `core/histogramme.types.ts`) sont toutes des
 * décimales EXACTES par construction, cette tolérance ne couvre qu'un éventuel bruit résiduel de
 * virgule flottante.
 *
 * Écran "trace" : **aucune saisie libre** — la hauteur de chaque barre provient toujours d'un
 * glissement CRANTÉ (déjà un entier exact au moment où elle atteint la vérification), donc aucun
 * risque de `parse_error` ici (spec : "vérification par correspondance exacte à la valeur crantée,
 * pas de tolérance continue nécessaire") — comparaison par simple égalité stricte de nombres.
 */
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import type { StatutVerification } from "./statutVerification";
import type { ExerciceHistogramme } from "../core/histogramme.types";

const TOLERANCE = 1e-9;

function statutValeurExacte(texte: string, cible: number): StatutVerification {
  const valeur = parserNombreOuFraction(texte);
  if (valeur === null) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

// ============================================================================
// Écran 1 — classement (effectif de chaque classe, bornes déjà imposées)
// ============================================================================

/** Un champ effectif par classe, dans l'ordre fixe de `exercice.classes` — jamais une interface
 * "add-as-needed" (les classes ne sont pas construites par l'élève, spec). */
export type ReponseClassement = string[];

export function diagnostiquerEffectifClasse(exercice: ExerciceHistogramme, index: number, texte: string): StatutVerification {
  return statutValeurExacte(texte, exercice.classes[index].effectif);
}

export function evaluerClassement(exercice: ExerciceHistogramme, reponse: ReponseClassement): StatutVerification[] {
  return exercice.classes.map((_, i) => diagnostiquerEffectifClasse(exercice, i, reponse[i] ?? ""));
}

export function verifierClassement(exercice: ExerciceHistogramme, reponse: ReponseClassement): boolean {
  if (reponse.length !== exercice.classes.length) return false;
  return evaluerClassement(exercice, reponse).every((s) => s === "correct");
}

// ============================================================================
// Écran 2 — fréquences (%) (variante "frequence" uniquement)
// ============================================================================

export type ReponseFrequencesHistogramme = string[];

export function diagnostiquerFrequenceClasse(exercice: ExerciceHistogramme, index: number, texte: string): StatutVerification {
  return statutValeurExacte(texte, exercice.classes[index].frequencePourcent);
}

export function evaluerFrequencesHistogramme(exercice: ExerciceHistogramme, reponse: ReponseFrequencesHistogramme): StatutVerification[] {
  return exercice.classes.map((_, i) => diagnostiquerFrequenceClasse(exercice, i, reponse[i] ?? ""));
}

export function verifierFrequencesHistogramme(exercice: ExerciceHistogramme, reponse: ReponseFrequencesHistogramme): boolean {
  if (reponse.length !== exercice.classes.length) return false;
  return evaluerFrequencesHistogramme(exercice, reponse).every((s) => s === "correct");
}

// ============================================================================
// Écran final — tracer l'histogramme (hauteurs déjà crantées, correspondance exacte)
// ============================================================================

/** Une hauteur (déjà crantée, entière) par classe, dans l'ordre fixe de `exercice.classes`. */
export type ReponseTrace = number[];

/** Hauteur attendue de la classe `index` — l'effectif pour la variante "effectif", la fréquence (%)
 * pour la variante "frequence" ; toujours un entier exact (voir le contrat). */
export function valeurAttendueTrace(exercice: ExerciceHistogramme, index: number): number {
  const classe = exercice.classes[index];
  return exercice.variante === "frequence" ? classe.frequencePourcent : classe.effectif;
}

export function diagnostiquerHauteurClasse(exercice: ExerciceHistogramme, index: number, hauteur: number): boolean {
  return hauteur === valeurAttendueTrace(exercice, index);
}

export function evaluerTrace(exercice: ExerciceHistogramme, reponse: ReponseTrace): boolean[] {
  return exercice.classes.map((_, i) => diagnostiquerHauteurClasse(exercice, i, reponse[i] ?? Number.NaN));
}

export function verifierTrace(exercice: ExerciceHistogramme, reponse: ReponseTrace): boolean {
  if (reponse.length !== exercice.classes.length) return false;
  return evaluerTrace(exercice, reponse).every(Boolean);
}
