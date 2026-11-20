import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerExpressionCyclometrique, evaluerValeurCyclometrique } from "./expressionCyclometrique";

/**
 * Couche B (6e) — vérifications par ÉCHANTILLONNAGE NUMÉRIQUE (jamais de manipulation symbolique :
 * aucune bibliothèque d'algèbre symbolique n'est installée sur ce projet — voir
 * `moteur/expressionGenerale.ts`, en-tête — c'est déjà la convention de toute la plateforme pour
 * une "équivalence algébrique", ex. `diagnostiquerEquivalenceQuadratiqueXY`/
 * `diagnostiquerReductionParametreNorme`, 4e). Partagées par 6gen2/6gen3/6gen4.
 */

const TOLERANCE_DEFAUT = 0.01;

/**
 * Compare un texte (fonction de x) à une référence fermée `reference(x)`, en échantillonnant à
 * plusieurs points. Un point où la référence n'est pas finie (hors domaine) est SAUTÉ (jamais
 * traité comme un échec) — nécessaire ici puisque le domaine réel de x n'est délibérément pas
 * vérifié par ce générateur (voir 6gen4, "décision technique tranchée"). `"parse_error"` si la
 * syntaxe est invalide OU si trop peu de points restent comparables après ce filtrage.
 */
export function diagnostiquerEquivalenceFonction(
  texte: string,
  reference: (x: number) => number,
  points: number[],
  tolerance: number = TOLERANCE_DEFAUT,
): StatutVerification {
  // Syntaxe d'abord (une seule évaluation) : seule une erreur de SYNTAXE est « illisible » (aucune
  // tentative). Une expression lisible mais non définie là où la référence l'est (« 1/√(−1−x²) »)
  // est FAUSSE, jamais illisible (audit du 6e ch. 1, G1).
  try {
    evaluerExpressionCyclometrique(texte, points[0] ?? 0.37);
  } catch {
    return "parse_error";
  }
  let comparables = 0;
  for (const x of points) {
    const soumis = evaluerExpressionCyclometrique(texte, x);
    const attendu = reference(x);
    if (!Number.isFinite(attendu)) continue;
    if (!Number.isFinite(soumis)) return "not_equivalent";
    comparables++;
    if (Math.abs(soumis - attendu) > tolerance * Math.max(1, Math.abs(attendu))) return "not_equivalent";
  }
  const minimumRequis = Math.min(3, points.length);
  if (comparables < minimumRequis) return "not_equivalent";
  return "correct";
}

/**
 * Compare un ENSEMBLE de textes (valeurs numériques pures, pas de x) à un ensemble de valeurs
 * cibles — ordre indifférent, tolérance ± fixe, gère nativement le cas liste vide (0 solution).
 * Un texte qui ne parse pas → `"parse_error"` immédiat (jamais confondu avec un mismatch).
 */
export function diagnostiquerEnsembleValeurs(textes: string[], cible: number[], tolerance: number = TOLERANCE_DEFAUT): StatutVerification {
  // Lecture AVANT tout verdict (une saisie illisible ne coûte aucune tentative, même si le nombre
  // de valeurs est faux) ; « x = 2 » toléré.
  const valeurs: number[] = [];
  for (const t of textes) {
    const v = evaluerValeurCyclometrique(t.replace(/^\s*x\s*=\s*/i, ""));
    if (v === null) return "parse_error";
    valeurs.push(v);
  }
  if (valeurs.length !== cible.length) return "not_equivalent";
  const restantes = [...cible];
  for (const v of valeurs) {
    const index = restantes.findIndex((c) => Math.abs(c - v) <= tolerance);
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}
