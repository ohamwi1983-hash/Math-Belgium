import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceProbabilitesEnsembles } from "../core6e/probabilitesEnsembles.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseProbabilitesEnsembles } from "./typesProbabilitesEnsembles";
import { diagnostiquerIndependance, diagnostiquerValeur } from "./verificationProbabilites";

/**
 * Couche B (6e) — vérification propre à `6gen30` (tableau à double entrée, cartes/dés). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `verificationProbabilitesEnsembles.test.ts` (fixtures locales factices) et
 * `generateurs6e/probabilitesEnsembles/session.integration.test.ts` (seul fichier autorisé Couche A
 * + Couche B) pour la preuve. Distinct de `moteur6e/verificationProbabilites.ts` (module PARTAGÉ du
 * chapitre 8, dont ce fichier est justement un CONSOMMATEUR — `diagnostiquerValeur`/
 * `diagnostiquerIndependance`) : ce fichier-CI n'est jamais réutilisé tel quel par un autre `6genX`.
 *
 * ============================================================================
 * **Convention de signature — tous les écrans prennent `string[]`** (même convention que
 * `verificationCalculPrimitives.ts`, 6gen23) : un dispatcher générique unique
 * (`diagnostiquerEcran(exercice, phase, valeurs)`) plutôt que 7 fonctions de soumission bespoke.
 * Pour un écran à CHOIX (aEcran3, bEcran4 — boutons `.btn.toggle-active`, jamais un champ texte
 * libre), `valeurs[0]` porte l'id du choix sélectionné (ex. `"incompatibles"`, `"independants"`) —
 * jamais un texte à parser, donc ces écrans ne retournent jamais `"parse_error"`. Chaque fonction
 * documente l'ORDRE exact des champs de son écran.
 * ============================================================================
 */

const TOLERANCE = 0.01;

function pireStatut(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille A — quantités dérivées (pures, depuis les effectifs entiers de l'exercice).
// ============================================================================

function nAetBbar(ex: ExerciceFamilleA): number {
  return ex.nA - ex.nAetB;
}
function nAbaretB(ex: ExerciceFamilleA): number {
  return ex.nB - ex.nAetB;
}
function nAbaretBbar(ex: ExerciceFamilleA): number {
  return ex.denominateur - ex.nA - ex.nB + ex.nAetB;
}
function pA(ex: ExerciceFamilleA): number {
  return ex.nA / ex.denominateur;
}
function pB(ex: ExerciceFamilleA): number {
  return ex.nB / ex.denominateur;
}
function pAetB(ex: ExerciceFamilleA): number {
  return ex.nAetB / ex.denominateur;
}
function pAetBbar(ex: ExerciceFamilleA): number {
  return nAetBbar(ex) / ex.denominateur;
}
function pAbaretB(ex: ExerciceFamilleA): number {
  return nAbaretB(ex) / ex.denominateur;
}
function pAbaretBbar(ex: ExerciceFamilleA): number {
  return nAbaretBbar(ex) / ex.denominateur;
}
function pAouB(ex: ExerciceFamilleA): number {
  return pA(ex) + pB(ex) - pAetB(ex);
}
function pAsachantB(ex: ExerciceFamilleA): number {
  return pAetB(ex) / pB(ex);
}
function pBsachantA(ex: ExerciceFamilleA): number {
  return pAetB(ex) / pA(ex);
}
/** P(A|B̄) — nécessaire au sous-type "comparaisonConditionnelle" de l'écran 3. */
function pAsachantBbar(ex: ExerciceFamilleA): number {
  return pAetBbar(ex) / (1 - pB(ex));
}

/** La quantité que l'écran 1 demande de DÉDUIRE (spec : "la quantité manquante parmi
 * {P(A∩B), P(A∪B)}") — dépend de `troisiemeDonnee` (voir `core6e/probabilitesEnsembles.types.ts`,
 * en-tête de `TroisiemeDonneeFamilleA`) : P(A∩B) est déjà donnée ⟹ P(A∪B) manque ; sinon (P(A∪B)
 * donné directement, ou déductible par complément de P(ni A ni B)) ⟹ P(A∩B) manque. */
function valeurManquanteEcran1(ex: ExerciceFamilleA): number {
  return ex.troisiemeDonnee === "PAetB" ? pAouB(ex) : pAetB(ex);
}

/** Écran 1 — `valeurs = [valeurManquante, P(A∩B), P(A∩B̄), P(Ā∩B), P(Ā∩B̄)]` (5 champs : la
 * quantité déduite par inclusion-exclusion, PUIS les 4 cases du tableau à double entrée, TOUJOURS
 * dans cet ordre). */
export function diagnostiquerAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  return pireStatut(
    diagnostiquerValeur(valeurs[0], valeurManquanteEcran1(exercice), TOLERANCE),
    diagnostiquerValeur(valeurs[1], pAetB(exercice), TOLERANCE),
    diagnostiquerValeur(valeurs[2], pAetBbar(exercice), TOLERANCE),
    diagnostiquerValeur(valeurs[3], pAbaretB(exercice), TOLERANCE),
    diagnostiquerValeur(valeurs[4], pAbaretBbar(exercice), TOLERANCE),
  );
}
export function verifierAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [valeur]`, comparée à la quantité dérivée choisie par `exercice.demandeEcran2`. */
export function diagnostiquerAEcran2(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  const cible = exercice.demandeEcran2 === "AetBbar" ? pAetBbar(exercice) : exercice.demandeEcran2 === "AbaretB" ? pAbaretB(exercice) : exercice.demandeEcran2 === "condAsachantB" ? pAsachantB(exercice) : pBsachantA(exercice);
  return diagnostiquerValeur(valeurs[0], cible, TOLERANCE);
}
export function verifierAEcran2(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — `valeurs = [choixId]` (bouton `.btn.toggle-active`, jamais un champ texte).
 * Sous-type `"incompatibilite"` : A∩B̄ et Ā∩B sont TOUJOURS incompatibles — fait LOGIQUE, invariant
 * quels que soient les effectifs (A∩B̄ suppose A vrai, Ā∩B suppose A faux : contradiction directe,
 * jamais un calcul de probabilité). La réponse correcte est donc toujours `"incompatibles"` — le
 * piège documenté par la spec (confondre "incompatibles" avec "indépendants") se joue entièrement
 * côté ÉCRAN (le libellé des boutons/l'aide), jamais dans cette fonction : elle ne fait QUE
 * comparer le choix au fait logique invariant, exactement comme n'importe quelle autre vérification
 * de statut de ce fichier.
 * Sous-type `"comparaisonConditionnelle"` : compare numériquement P(A|B̄) à P(A|B). */
export function diagnostiquerAEcran3(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  if (exercice.sousTypeEcran3 === "incompatibilite") {
    return valeurs[0] === "incompatibles" ? "correct" : "not_equivalent";
  }
  const diff = pAsachantBbar(exercice) - pAsachantB(exercice);
  const correct = Math.abs(diff) <= TOLERANCE ? "egal" : diff > 0 ? "superieur" : "inferieur";
  return valeurs[0] === correct ? "correct" : "not_equivalent";
}
export function verifierAEcran3(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille B — quantités dérivées.
// ============================================================================

function pAB(ex: ExerciceFamilleB): number {
  return ex.eventA.count / ex.denominateur;
}
function pBB(ex: ExerciceFamilleB): number {
  return ex.eventB.count / ex.denominateur;
}
function pAetBB(ex: ExerciceFamilleB): number {
  return ex.countAetB / ex.denominateur;
}
function pAouBB(ex: ExerciceFamilleB): number {
  return pAB(ex) + pBB(ex) - pAetBB(ex);
}
function pAsachantBB(ex: ExerciceFamilleB): number {
  return ex.countAetB / ex.eventB.count;
}

/** Écran 1 — `valeurs = [P(A), P(B)]`, TOUJOURS dans cet ordre (A puis B). */
export function diagnostiquerBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return pireStatut(diagnostiquerValeur(valeurs[0], pAB(exercice), TOLERANCE), diagnostiquerValeur(valeurs[1], pBB(exercice), TOLERANCE));
}
export function verifierBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [valeur]`, intersection OU union selon `exercice.demandeEcran2`. */
export function diagnostiquerBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  const cible = exercice.demandeEcran2 === "intersection" ? pAetBB(exercice) : pAouBB(exercice);
  return diagnostiquerValeur(valeurs[0], cible, TOLERANCE);
}
export function verifierBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — `valeurs = [P(A|B)]`. */
export function diagnostiquerBEcran3(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], pAsachantBB(exercice), TOLERANCE);
}
export function verifierBEcran3(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran3(exercice, valeurs) === "correct";
}

/** Écran 4 — `valeurs = [choixId]` (`"independants"`/`"non_independants"`, bouton
 * `.btn.toggle-active`) — délègue à `diagnostiquerIndependance` (module PARTAGÉ chapitre 8, voir son
 * en-tête) plutôt que de recopier la comparaison P(A∩B) vs P(A)·P(B) ici : LA brique que `6gen32`
 * réutilise directement. */
export function diagnostiquerBEcran4(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  if (valeurs[0] !== "independants" && valeurs[0] !== "non_independants") return "not_equivalent";
  return diagnostiquerIndependance(pAB(exercice), pBB(exercice), pAetBB(exercice), valeurs[0]);
}
export function verifierBEcran4(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran4(exercice, valeurs) === "correct";
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceFamilleA, valeurs);
    case "aEcran2":
      return diagnostiquerAEcran2(exercice as ExerciceFamilleA, valeurs);
    case "aEcran3":
      return diagnostiquerAEcran3(exercice as ExerciceFamilleA, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceFamilleB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceFamilleB, valeurs);
    case "bEcran3":
      return diagnostiquerBEcran3(exercice as ExerciceFamilleB, valeurs);
    case "bEcran4":
      return diagnostiquerBEcran4(exercice as ExerciceFamilleB, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceProbabilitesEnsembles, phase: PhaseProbabilitesEnsembles, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}

// Réexport — quantités dérivées utiles à `ui6e/formatProbabilitesEnsembles.ts` (affichage du
// tableau/récapitulatif), jamais recalculées indépendamment là-bas (CLAUDE.md).
export { nAbaretB, nAbaretBbar, nAetBbar, pA, pAB, pAbaretB, pAbaretBbar, pAetB, pAetBB, pAetBbar, pAouB, pAouBB, pAsachantB, pAsachantBB, pAsachantBbar, pB, pBB, pBsachantA, valeurManquanteEcran1 };
