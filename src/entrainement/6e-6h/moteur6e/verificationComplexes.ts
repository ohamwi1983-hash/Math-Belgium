import type { StatutVerification } from "../moteur/statutVerification";
import type { Complexe } from "./expressionComplexe";
import { evaluerValeurComplexe } from "./expressionComplexe";

/**
 * Couche B (6e) — module PARTAGÉ, chapitre 7 "Nombres complexes". Fondé par `6gen34` (premier
 * générateur du chapitre — zéro infrastructure chapitre 7 avant lui), même rôle que
 * `moteur6e/verificationProbabilites.ts` pour le chapitre 8 ou `moteur6e/equivalenceExponentielle.ts`
 * pour les chapitres 2-4 : LA brique de vérification transversale à TOUT le chapitre, distincte de
 * `moteur6e/verificationNombresComplexes.ts` (vérification propre à 6gen34 — dispatch par
 * famille/écran, jamais réutilisée telle quelle par un autre générateur).
 *
 * ============================================================================
 * **CONTRAT DE RÉUTILISATION — 6gen35 à 6gen42 (lire avant de modifier ce fichier)**
 * ============================================================================
 * API STABLE, à réutiliser TELLE QUELLE par tout générateur en aval de ce chapitre — jamais
 * réimplémentée :
 * - `export type { Complexe } from "./expressionComplexe"` (réexporté ci-dessous) — `{re,im}`, LA
 *   représentation numérique d'un nombre complexe sur toute la plateforme, chapitre 7.
 * - `TOLERANCE_COMPLEXE` (voir juste en dessous pour la justification du choix) — importer cette
 *   CONSTANTE plutôt que de recopier `1e-9` en dur dans un nouveau générateur.
 * - `diagnostiquerComplexe(texte: string, cible: Complexe, tolerance = TOLERANCE_COMPLEXE):
 *   StatutVerification` — compare un texte libre élève (évalué par
 *   `evaluerExpressionComplexe`/`evaluerValeurComplexe` de `expressionComplexe.ts`, donc accepte
 *   n'importe quelle expression arithmétique équivalente, pas seulement un littéral "a+bi" déjà
 *   simplifié — ex. "(3+2i)/(1-i)" est accepté si numériquement égal à `cible`) à une valeur CIBLE
 *   déjà connue et correcte. `"parse_error"` si le texte ne peut pas être évalué (erreur de
 *   syntaxe), `"not_equivalent"` si évalué mais numériquement distinct de `cible` (au-delà de
 *   `tolerance`), `"correct"` sinon.
 * - `verifierComplexe(texte, cible, tolerance?): boolean` — variante booléenne, pour le callback
 *   `verifier: (reponse) => boolean` consommé par `moteur/etapeTentatives.ts`.
 *
 * ============================================================================
 * **Choix de la tolérance — `TOLERANCE_COMPLEXE = 1e-9`, DÉLIBÉRÉMENT resserrée par rapport aux
 * `0.01` du chapitre 8 (`verificationProbabilites.ts`)**
 * ============================================================================
 * La spec de ce chapitre est explicite : "toutes les réponses : égalité EXACTE des parties réelle
 * et imaginaire (comparaison symbolique, pas de tolérance décimale sauf mention contraire)". Les
 * valeurs manipulées ici sont TOUJOURS des entiers, des fractions simples, ou (pour un futur
 * générateur du chapitre — module/argument, racines n-ièmes) des expressions en √2/√3/π — jamais
 * des grandeurs de type "mesure" où une marge de lecture graphique ou d'arrondi métier serait
 * attendue (contrairement à une probabilité du chapitre 8, où `0,01` reflète une granularité RÉELLE
 * des dénominateurs rencontrés, voir l'en-tête de `verificationProbabilites.ts`). `1e-9` sert donc
 * UNIQUEMENT à absorber l'imprécision de l'arithmétique flottante IEEE754 elle-même (ex.
 * `0.1+0.2 !== 0.3` au bit près, écart ≈4e-17) — jamais à tolérer une véritable imprécision
 * mathématique de l'élève. Toute réponse à ne serait-ce que `0,01` d'écart DOIT être rejetée (voir
 * `verificationComplexes.test.ts`, "tolérance serrée par défaut") : contrairement au chapitre 8, il
 * n'existe ici aucune paire de valeurs cibles distinctes plausibles séparées de moins de `1e-9`, donc
 * resserrer ne risque jamais de confondre deux résultats voisins mais différents.
 *
 * ============================================================================
 * **Pourquoi PAS de wrapper "à une constante additive/multiplicative près"** (contraste avec
 * `diagnostiquerPrimitive` du chapitre 4)
 * ============================================================================
 * Chaque écran de ce chapitre a une cible NUMÉRIQUE UNIQUE et entièrement déterminée par
 * l'énoncé (jamais une famille de réponses valables à une constante près, comme une primitive) —
 * `diagnostiquerComplexe` compare donc directement à UNE seule `cible`, sans variante. Un futur
 * générateur qui aurait un besoin structurellement différent (ex. accepter les 2 racines carrées
 * d'un complexe, dans un ordre indifférent) doit écrire son propre wrapper LOCAL au-dessus de
 * `evaluerValeurComplexe` (mirroir `diagnostiquerEnsembleValeurs` dans `equivalenceExponentielle.ts`
 * pour le précédent structurel), jamais modifier ce fichier pour l'accueillir.
 */

export const TOLERANCE_COMPLEXE = 1e-9;

/** LA brique réutilisable de ce chapitre — voir en-tête de fichier pour le contrat complet. */
export function diagnostiquerComplexe(texte: string, cible: Complexe, tolerance: number = TOLERANCE_COMPLEXE): StatutVerification {
  const v = evaluerValeurComplexe(texte);
  if (v === null) return "parse_error";
  const dRe = Math.abs(v.re - cible.re);
  const dIm = Math.abs(v.im - cible.im);
  return dRe <= tolerance && dIm <= tolerance ? "correct" : "not_equivalent";
}

/** Variante booléenne — pour le callback `verifier: (reponse) => boolean` de
 * `moteur/etapeTentatives.ts`. */
export function verifierComplexe(texte: string, cible: Complexe, tolerance: number = TOLERANCE_COMPLEXE): boolean {
  return diagnostiquerComplexe(texte, cible, tolerance) === "correct";
}

export type { Complexe };
