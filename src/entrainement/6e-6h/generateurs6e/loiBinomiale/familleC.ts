import type { ContexteLoiBinomialeC, ExerciceLoiBinomialeC } from "../../core6e/loiBinomiale.types";
import { tirerParmi } from "./aleatoire";
import { CONTEXTES_C } from "./contextes";

/**
 * Couche A (6e) — génération famille C ("Trouver n via logarithme, au moins 1 succès") pour
 * `6gen50`. SCOPE LIMITÉ (spec) : uniquement "au moins 1 succès" — jamais "au moins k" pour k>1
 * (nécessiterait une résolution numérique/itérative, une inéquation à plusieurs termes non isolables
 * par un simple logarithme). Résout `1-(1-p)^n > seuil` ⟺ `(1-p)^n < 1-seuil` ⟺
 * `n > ln(1-seuil)/ln(1-p)` (le coefficient `ln(1-p)` est TOUJOURS négatif car `0<1-p<1` — d'où
 * l'inversion systématique du sens de l'inégalité au moment de diviser, piège central du générateur).
 */

export const CANDIDATS_P_C: readonly number[] = [0.02, 0.05, 0.08, 0.1, 0.2, 0.3];
export const CANDIDATS_SEUIL_C: readonly number[] = [0.5, 0.8, 0.9, 0.95, 0.99];

export { CONTEXTES_C };

/** Nombre minimal d'épreuves `n` tel que `1-(1-p)^n > seuil` — PRÉ-CALCULÉ ici (Couche A), jamais
 * recalculé côté Couche B. `v = ln(1-seuil)/ln(1-p)` ; `n` minimal = plus petit entier STRICTEMENT
 * supérieur à `v` (`Math.ceil(v)`, sauf le cas limite où `v` est déjà entier — n'arrive jamais avec
 * les valeurs `p`/`seuil` discrètes de la spec, mais traité par sécurité). */
export function calculerNMinimalC(p: number, seuil: number): number {
  const v = Math.log(1 - seuil) / Math.log(1 - p);
  const arrondi = Math.round(v);
  if (Math.abs(arrondi - v) < 1e-9) return arrondi + 1;
  return Math.ceil(v);
}

/** Construction déterministe (`p`/`seuil` fixés) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. */
export function construireFamilleC(p: number, seuil: number, contexte?: ContexteLoiBinomialeC): ExerciceLoiBinomialeC {
  return { famille: "C", contexte: contexte ?? tirerParmi(CONTEXTES_C), p, seuil, valeurN: calculerNMinimalC(p, seuil) };
}

export function genererFamilleC(): ExerciceLoiBinomialeC {
  return construireFamilleC(tirerParmi(CANDIDATS_P_C), tirerParmi(CANDIDATS_SEUIL_C));
}
