import type {
  CategorieCroissance,
  CibleLimiteLog,
  ExerciceLimiteLogA,
  ExerciceLimiteLogB,
  ExerciceLimiteLogC,
  ExerciceLimiteLogD,
  ExerciceLimiteLogE,
} from "../core6e/limitesLogarithmiques.types";
import { diagnostiquerValeur, evaluerExpressionExponentielle } from "./equivalenceExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen17`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationLimitesLogarithmiques.test.ts` pour la preuve avec des exercices factices définis
 * localement. Réutilise DIRECTEMENT `diagnostiquerValeur`/`evaluerExpressionExponentielle`
 * (`equivalenceExponentielle.ts`, moteur→moteur, déjà établi pour ce chantier — voir CLAUDE.md et
 * `expressionExponentielle.ts` : pas de `log(x,base)` natif, toute base concrète s'exprime
 * `ln(x)/ln(base)`).
 *
 * **Réponse catégorielle partagée** (`ReponseLimiteLog`) — miroir élève du `CibleLimiteLog` du
 * contrat core, réutilisée pour TOUS les écrans catégoriels (A-conclure, C-diagnostic (×2 parties),
 * C-conclure) — jamais un comparateur séparé par écran.
 */
export type ReponseLimiteLog = { type: "plus_infini" } | { type: "moins_infini" } | { type: "zero" } | { type: "valeur"; texte: string };

const TOLERANCE = 0.01;

export function verifierReponseLimiteLog(cible: CibleLimiteLog, reponse: ReponseLimiteLog): boolean {
  if (cible.type === "valeur") {
    return reponse.type === "valeur" && diagnostiquerValeur(reponse.texte, cible.valeur, TOLERANCE) === "correct";
  }
  return reponse.type === cible.type;
}

function memeValeur(texte: string, cible: number): boolean {
  return diagnostiquerValeur(texte, cible, TOLERANCE) === "correct";
}

/** Compare une expression (fonction de `variable`) à une référence fermée en échantillonnant
 * plusieurs points — réplique locale de `diagnostiquerEquivalenceFonction` mais retourne un simple
 * booléen (cette vérification-ci n'expose qu'un booléen à `etapeTentatives.ts`, comme tous les
 * autres écrans de ce moteur), même patron que `verificationLimitesExponentielles.ts` (6gen6). */
function equivalenteAReference(texte: string, reference: (v: number) => number, points: number[], variable = "x"): boolean {
  let comparables = 0;
  for (const v of points) {
    const attendu = reference(v);
    if (!Number.isFinite(attendu)) continue;
    let soumis: number;
    try {
      soumis = evaluerExpressionExponentielle(texte, { [variable]: v });
    } catch {
      return false;
    }
    if (!Number.isFinite(soumis)) return false;
    comparables++;
    if (Math.abs(soumis - attendu) > TOLERANCE) return false;
  }
  return comparables >= Math.min(3, points.length);
}

function normaliser(texte: string): string {
  return texte.replace(/\s+/g, "").toLowerCase();
}

function texteEstRecopieLitterale(texteSoumis: string, texteSource: string): boolean {
  return normaliser(texteSoumis) === normaliser(texteSource);
}

// ============================================================================
// Famille A — 2 écrans (dominance, conclure).
// ============================================================================

export interface ReponseDominanceA {
  numerateur: CategorieCroissance;
  denominateur: CategorieCroissance;
}

export function verifierADominance(exercice: ExerciceLimiteLogA, reponse: ReponseDominanceA): boolean {
  return reponse.numerateur === exercice.dominanceNumerateur && reponse.denominateur === exercice.dominanceDenominateur;
}

export function verifierAConclure(exercice: ExerciceLimiteLogA, reponse: ReponseLimiteLog): boolean {
  return verifierReponseLimiteLog(exercice.limiteGlobale, reponse);
}

// ============================================================================
// Famille B — 2 écrans (reformuler, conclure), dispatch par sous-type. La reformulation attendue
// est TOUJOURS exprimée en variable `u` (substitution u=x/x0−1) — jamais un risque de recopie
// littérale de l'énoncé (qui reste en x), même raisonnement que la famille F1 de
// `verificationLimitesExponentielles.ts` (6gen6).
// ============================================================================

const POINTS_U = [-0.15, -0.1, -0.05, 0.05, 0.1, 0.15];

function referenceBReformuler(exercice: ExerciceLimiteLogB): (u: number) => number {
  if (exercice.sousType === "quotient") {
    const { k, x0, m } = exercice;
    return (u: number) => Math.log(1 + m * x0 * u) / (k * Math.log(1 + u));
  }
  const { k, x0 } = exercice;
  return (u: number) => (x0 * u * Math.log(k)) / Math.log(1 + u);
}

export function verifierBReformuler(exercice: ExerciceLimiteLogB, texte: string): boolean {
  return equivalenteAReference(texte, referenceBReformuler(exercice), POINTS_U, "u");
}

export function verifierBConclure(exercice: ExerciceLimiteLogB, texte: string): boolean {
  return memeValeur(texte, exercice.limiteFinale);
}

// ============================================================================
// Famille C — 2 écrans (diagnostic à 2 parties, conclure), dispatch par sous-type.
// ============================================================================

export interface ReponseDiagnosticC {
  partie1: ReponseLimiteLog;
  partie2: ReponseLimiteLog;
}

function ciblesDiagnosticC(exercice: ExerciceLimiteLogC): { cible1: CibleLimiteLog; cible2: CibleLimiteLog } {
  if (exercice.sousType === "c1") return { cible1: exercice.partieNumerateur, cible2: exercice.partieDenominateur };
  if (exercice.sousType === "c2") return { cible1: exercice.partieFacteur1, cible2: exercice.partieFacteur2 };
  return { cible1: exercice.partieNumerateur, cible2: exercice.partieDenominateur };
}

export function verifierCDiagnostic(exercice: ExerciceLimiteLogC, reponse: ReponseDiagnosticC): boolean {
  const { cible1, cible2 } = ciblesDiagnosticC(exercice);
  return verifierReponseLimiteLog(cible1, reponse.partie1) && verifierReponseLimiteLog(cible2, reponse.partie2);
}

export function verifierCConclure(exercice: ExerciceLimiteLogC, reponse: ReponseLimiteLog): boolean {
  return verifierReponseLimiteLog(exercice.limiteFinale, reponse);
}

// ============================================================================
// Famille D — 3 écrans (exposant, limite de l'exposant, conclure).
// ============================================================================

function referenceDExposant(exercice: ExerciceLimiteLogD): (x: number) => number {
  const { k, c } = exercice;
  return (x: number) => (c / (x * x)) * Math.log(Math.cos(k * x));
}

function texteSourceD(exercice: ExerciceLimiteLogD): string {
  const { k, c } = exercice;
  return `cos(${k}*x)^(${c}/x^2)`;
}

const POINTS_D = [-0.2, -0.15, -0.1, -0.05, 0.05, 0.1, 0.15, 0.2];

export function verifierDExposant(exercice: ExerciceLimiteLogD, texte: string): boolean {
  if (texteEstRecopieLitterale(texte, texteSourceD(exercice))) return false;
  return equivalenteAReference(texte, referenceDExposant(exercice), POINTS_D);
}

export function verifierDLimiteExposant(exercice: ExerciceLimiteLogD, texte: string): boolean {
  return memeValeur(texte, exercice.limiteExposant);
}

export function verifierDConclure(exercice: ExerciceLimiteLogD, texte: string): boolean {
  return memeValeur(texte, exercice.limiteFinale);
}

// ============================================================================
// Famille E — 3 écrans (développer, simplifier, conclure), instance unique. Le numérateur
// développé à l'ordre 2 (x²·(ln3+1/2)) et le numérateur RÉEL (3^x·sin(x)−ln(1+x)) ne coïncident
// QU'AU VOISINAGE DE 0 — échantillonner à des points GÉNÉRIQUES (pas nécessairement proches de 0)
// rejette donc NATURELLEMENT une recopie de l'expression originale, aucune garde anti-recopie
// dédiée n'est nécessaire ici (contrairement aux autres familles de ce fichier).
// ============================================================================

const POINTS_GENERIQUES = [-2.7, -1.9, -1.1, -0.6, 0.6, 1.1, 1.9, 2.7];

function referenceENumerateurOrdre2(x: number): number {
  return x * x * (Math.log(3) + 0.5);
}

export function verifierEDevelopper(_exercice: ExerciceLimiteLogE, texte: string): boolean {
  return equivalenteAReference(texte, referenceENumerateurOrdre2, POINTS_GENERIQUES);
}

/** Ratio SIMPLIFIÉ — x⁴+4x²~4x² au dénominateur, x² se simplifie EXACTEMENT avec le numérateur
 * développé à l'écran précédent : le résultat est une CONSTANTE (plus aucune dépendance en x). */
const CIBLE_E_SIMPLIFIEE = (Math.log(3) + 0.5) / 4;

export function verifierESimplifier(_exercice: ExerciceLimiteLogE, texte: string): boolean {
  return memeValeur(texte, CIBLE_E_SIMPLIFIEE);
}

export function verifierEConclure(exercice: ExerciceLimiteLogE, texte: string): boolean {
  return memeValeur(texte, exercice.limiteFinale);
}
