import type { CaseTableauA, EvenementTableauA, ExerciceFamilleA, ExerciceFamilleB, ExerciceProbabilitesEnsembles, RelationEcran3A } from "../core6e/probabilitesEnsembles.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseProbabilitesEnsembles } from "./typesProbabilitesEnsembles";
import { diagnostiquerProbabilite, sontIndependantsEffectifs } from "./verificationProbabilites";

/**
 * Couche B (6e) — vérification propre à `6gen30` (tableau à double entrée, cartes/dés). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `verificationProbabilitesEnsembles.test.ts` (fixtures locales factices) et
 * `generateurs6e/probabilitesEnsembles/session.integration.test.ts` (seul fichier autorisé Couche A
 * + Couche B) pour la preuve. Distinct de `moteur6e/verificationProbabilites.ts` (module PARTAGÉ du
 * chapitre 8, dont ce fichier est justement un CONSOMMATEUR —
 * `diagnostiquerProbabilite`/`sontIndependantsEffectifs`) : ce fichier-CI n'est jamais réutilisé
 * tel quel par un autre `6genX`.
 *
 * Audit 6e ch. 6 : toute probabilité saisie passe par `diagnostiquerProbabilite` (forme exacte, ou
 * décimale correctement arrondie au centième — au millième sous 0,1 —, ou pourcentage) ; plus
 * aucune tolérance absolue de 0,01. L'indépendance et les comparaisons se décident en ENTIERS
 * (effectifs), jamais à une tolérance près.
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

/** La quantité que l'écran 1 demande de DÉDUIRE par inclusion-exclusion : P(A∩B) déjà donnée ⟹
 * P(A∪B) manque ; sinon (P(A∪B) donnée, ou déductible par complément de P(ni A ni B)) ⟹ P(A∩B). */
function valeurManquanteEcran1(ex: ExerciceFamilleA): number {
  return ex.troisiemeDonnee === "PAetB" ? pAouB(ex) : pAetB(ex);
}

/** Quantité saisie à l'écran 1. */
export type CleQuantiteEcran1A = "AouB" | "AetB" | "AetBbar" | "AbaretB" | "AbaretBbar";

/** Champs de l'écran 1, dans l'ordre de `valeurs` : la quantité déduite par inclusion-exclusion,
 * puis les cases du tableau qui ne sont PAS données (une case donnée — A∩B si P(A∩B) est fournie,
 * Ā∩B̄ si P(ni A ni B) l'est — est affichée remplie, jamais redemandée). */
export function champsEcran1A(ex: ExerciceFamilleA): CleQuantiteEcran1A[] {
  if (ex.troisiemeDonnee === "PAetB") return ["AouB", "AetBbar", "AbaretB", "AbaretBbar"];
  if (ex.troisiemeDonnee === "PAouB") return ["AetB", "AetBbar", "AbaretB", "AbaretBbar"];
  return ["AetB", "AetBbar", "AbaretB"];
}

export function valeurQuantiteEcran1A(ex: ExerciceFamilleA, cle: CleQuantiteEcran1A): number {
  switch (cle) {
    case "AouB":
      return pAouB(ex);
    case "AetB":
      return pAetB(ex);
    case "AetBbar":
      return pAetBbar(ex);
    case "AbaretB":
      return pAbaretB(ex);
    case "AbaretBbar":
      return pAbaretBbar(ex);
  }
}

/** Écran 1 — `valeurs` dans l'ordre de `champsEcran1A(exercice)`. */
export function diagnostiquerAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  return pireStatut(...champsEcran1A(exercice).map((cle, i) => diagnostiquerProbabilite(valeurs[i] ?? "", valeurQuantiteEcran1A(exercice, cle))));
}
export function verifierAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [valeur]`, comparée à la quantité dérivée choisie par `exercice.demandeEcran2`. */
export function diagnostiquerAEcran2(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  const cible = exercice.demandeEcran2 === "AetBbar" ? pAetBbar(exercice) : exercice.demandeEcran2 === "AbaretB" ? pAbaretB(exercice) : exercice.demandeEcran2 === "condAsachantB" ? pAsachantB(exercice) : pBsachantA(exercice);
  return diagnostiquerProbabilite(valeurs[0] ?? "", cible);
}
export function verifierAEcran2(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcran2(exercice, valeurs) === "correct";
}

/** Cases du tableau qui composent chaque événement. */
const CASES_EVENEMENT: Record<EvenementTableauA, readonly CaseTableauA[]> = {
  A: ["AB", "ABbar"],
  Abar: ["AbarB", "AbarBbar"],
  B: ["AB", "AbarB"],
  Bbar: ["ABbar", "AbarBbar"],
  AetB: ["AB"],
  AetBbar: ["ABbar"],
  AbaretB: ["AbarB"],
  AbaretBbar: ["AbarBbar"],
};

function effectifCase(ex: ExerciceFamilleA, c: CaseTableauA): number {
  return c === "AB" ? ex.nAetB : c === "ABbar" ? nAetBbar(ex) : c === "AbarB" ? nAbaretB(ex) : nAbaretBbar(ex);
}

/** Effectif d'un événement du tableau. */
export function effectifEvenementA(ex: ExerciceFamilleA, ev: EvenementTableauA): number {
  return CASES_EVENEMENT[ev].reduce((s, c) => s + effectifCase(ex, c), 0);
}

/** Effectif de l'intersection de deux événements du tableau (cases communes). */
export function effectifIntersectionA(ex: ExerciceFamilleA, x: EvenementTableauA, y: EvenementTableauA): number {
  return CASES_EVENEMENT[x].filter((c) => CASES_EVENEMENT[y].includes(c)).reduce((s, c) => s + effectifCase(ex, c), 0);
}

/** Réponse correcte de l'écran 3 « relation », décidée en ENTIERS : intersection vide ⟹
 * incompatibles ; n(X∩Y)·N = n(X)·n(Y) ⟹ indépendants ; sinon ni l'un ni l'autre. (Les deux à la
 * fois exigerait un événement d'effectif nul, exclu par la génération : cases toutes non vides.) */
export function relationPaireEcran3(ex: ExerciceFamilleA): RelationEcran3A {
  if (!ex.paireEcran3) throw new Error("relationPaireEcran3 : pas de paire (sous-type comparaison)");
  const [x, y] = ex.paireEcran3;
  const nXY = effectifIntersectionA(ex, x, y);
  if (nXY === 0) return "incompatibles";
  return sontIndependantsEffectifs(effectifEvenementA(ex, x), effectifEvenementA(ex, y), nXY, ex.denominateur) ? "independants" : "ni_l_un_ni_l_autre";
}

/** Réponse correcte de l'écran 3 « comparaisonConditionnelle », en entiers :
 * P(A|B̄) − P(A|B) a le signe de n(A∩B̄)·n(B) − n(A∩B)·n(B̄). */
export function comparaisonConditionnellesA(ex: ExerciceFamilleA): "superieur" | "inferieur" | "egal" {
  const d = nAetBbar(ex) * ex.nB - ex.nAetB * (ex.denominateur - ex.nB);
  return d === 0 ? "egal" : d > 0 ? "superieur" : "inferieur";
}

/** Écran 3 — `valeurs = [choixId]` (bouton `.btn.toggle-active`, jamais un champ texte). */
export function diagnostiquerAEcran3(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  const correct = exercice.sousTypeEcran3 === "relation" ? relationPaireEcran3(exercice) : comparaisonConditionnellesA(exercice);
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
  return pireStatut(diagnostiquerProbabilite(valeurs[0] ?? "", pAB(exercice)), diagnostiquerProbabilite(valeurs[1] ?? "", pBB(exercice)));
}
export function verifierBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [valeur]`, intersection OU union selon `exercice.demandeEcran2`. */
export function diagnostiquerBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  const cible = exercice.demandeEcran2 === "intersection" ? pAetBB(exercice) : pAouBB(exercice);
  return diagnostiquerProbabilite(valeurs[0] ?? "", cible);
}
export function verifierBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — `valeurs = [P(A|B)]`. */
export function diagnostiquerBEcran3(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerProbabilite(valeurs[0] ?? "", pAsachantBB(exercice));
}
export function verifierBEcran3(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran3(exercice, valeurs) === "correct";
}

/** Indépendance de A et B (famille B), décidée EXACTEMENT sur les effectifs entiers de l'univers
 * équiprobable : n(A∩B)·n(Ω) = n(A)·n(B) (décision B de l'audit 6e ch. 6 — l'ancienne tolérance de
 * 0,01 déclarait indépendants des événements incompatibles comme « somme = 3 » et « dés égaux »). */
export function independantsB(ex: ExerciceFamilleB): boolean {
  return sontIndependantsEffectifs(ex.eventA.count, ex.eventB.count, ex.countAetB, ex.denominateur);
}

/** Écran 4 — `valeurs = [choixId]` (`"independants"`/`"non_independants"`). */
export function diagnostiquerBEcran4(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  const correct = independantsB(exercice) ? "independants" : "non_independants";
  return valeurs[0] === correct ? "correct" : "not_equivalent";
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
