import type { CategorieCroissance, ChoixFormePuissance, CibleLimiteLog, ExerciceLimiteLogA, ExerciceLimiteLogB, ExerciceLimiteLogC, ExerciceLimiteLogD } from "../core6e/limitesLogarithmiques.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerExpressionExponentielle } from "./equivalenceExponentielle";

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

/**
 * **Tolérance RELATIVE** (audit chapitre 3 de 6e, point 29) — l'ancienne tolérance absolue de 0,01
 * acceptait « 0 » pour une petite valeur. Écart admis : max(0,005 ; 0,2 % de la cible), assez pour
 * une valeur décimale arrondie au centième (ex. « 0,46 » pour ln(5)/... ≈ 0,4621), jamais pour une
 * valeur voisine fausse.
 */
export function toleranceValeur(cible: number): number {
  return Math.max(0.005, 0.002 * Math.abs(cible));
}

/** Valeur numérique fermée (aucune variable) — `parse_error` si illisible, comparaison à
 * `toleranceValeur` sinon. */
export function diagnostiquerValeurLimite(texte: string, cible: number): StatutVerification {
  let soumis: number;
  try {
    soumis = evaluerExpressionExponentielle(texte, {});
  } catch {
    return "parse_error";
  }
  if (!Number.isFinite(soumis)) return "not_equivalent";
  return Math.abs(soumis - cible) <= toleranceValeur(cible) ? "correct" : "not_equivalent";
}

export function verifierReponseLimiteLog(cible: CibleLimiteLog, reponse: ReponseLimiteLog): boolean {
  if (cible.type === "valeur") {
    return reponse.type === "valeur" && diagnostiquerValeurLimite(reponse.texte, cible.valeur) === "correct";
  }
  return reponse.type === cible.type;
}

/** Compare une expression (fonction de `variable`) à une référence fermée en échantillonnant
 * plusieurs points — réplique locale de `diagnostiquerEquivalenceFonction` mais retourne un simple
 * booléen (cette vérification-ci n'expose qu'un booléen à `etapeTentatives.ts`, comme tous les
 * autres écrans de ce moteur), même patron que `verificationLimitesExponentielles.ts` (6gen6). */
function diagnostiquerEquivalenteAReference(texte: string, reference: (v: number) => number, points: number[], variable = "x"): StatutVerification {
  let comparables = 0;
  for (const v of points) {
    const attendu = reference(v);
    if (!Number.isFinite(attendu)) continue;
    let soumis: number;
    try {
      soumis = evaluerExpressionExponentielle(texte, { [variable]: v });
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(soumis)) return "not_equivalent";
    comparables++;
    if (Math.abs(soumis - attendu) > 1e-3 * Math.max(1, Math.abs(attendu))) return "not_equivalent";
  }
  return comparables >= Math.min(3, points.length) ? "correct" : "parse_error";
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

export function diagnostiquerBReformuler(exercice: ExerciceLimiteLogB, texte: string): StatutVerification {
  return diagnostiquerEquivalenteAReference(texte, referenceBReformuler(exercice), POINTS_U, "u");
}

export function verifierBReformuler(exercice: ExerciceLimiteLogB, texte: string): boolean {
  return diagnostiquerBReformuler(exercice, texte) === "correct";
}

export function diagnostiquerBConclure(exercice: ExerciceLimiteLogB, texte: string): StatutVerification {
  return diagnostiquerValeurLimite(texte, exercice.limiteFinale);
}

export function verifierBConclure(exercice: ExerciceLimiteLogB, texte: string): boolean {
  return diagnostiquerBConclure(exercice, texte) === "correct";
}

// ============================================================================
// Famille C — 2 écrans (diagnostic à 2 parties, conclure), dispatch par sous-type.
// ============================================================================

export interface ReponseDiagnosticC {
  partie1: ReponseLimiteLog;
  partie2: ReponseLimiteLog;
  /** Troisième question fermée facultative de l'écran (famille D : type de forme). */
  choix?: string;
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
// Famille D — 3 écrans (reconnaître la forme, limite de l'exposant g·ln f, conclure).
// ============================================================================

/** Écran 1 : limite de la base, limite de l'exposant (cibles catégorielles/valeur, comme l'écran 1
 * de la famille C) et type de forme (choix fermé). */
export interface ReponseFormeD {
  base: ReponseLimiteLog;
  exposant: ReponseLimiteLog;
  forme: ChoixFormePuissance;
}

export function verifierDForme(exercice: ExerciceLimiteLogD, reponse: ReponseFormeD): boolean {
  return verifierReponseLimiteLog(exercice.limiteBase, reponse.base) && verifierReponseLimiteLog(exercice.limiteExposant, reponse.exposant) && reponse.forme === exercice.forme;
}

/** Saisie d'une valeur seule : `parse_error` si illisible (aucune tentative décomptée — l'appli ne
 * soumet pas), `correct` sinon (la justesse est jugée par `verifierDExposant`/`verifierDConclure`). */
export function diagnostiquerSaisieValeurD(texte: string): StatutVerification {
  try {
    evaluerExpressionExponentielle(texte, {});
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** Catégorie d'une réponse (+∞, −∞, 0, valeur finie non nulle) : une valeur saisie qui vaut
 * exactement 0 compte comme « 0 ». */
function categorieReponseD(reponse: ReponseLimiteLog): CibleLimiteLog["type"] {
  if (reponse.type !== "valeur") return reponse.type;
  try {
    if (evaluerExpressionExponentielle(reponse.texte, {}) === 0) return "zero";
  } catch {
    /* illisible : reste « valeur » */
  }
  return "valeur";
}

/** La CATÉGORIE de la réponse (+∞, −∞, 0 ou valeur finie) est-elle la bonne ? Écrans 2 et 3 de la
 * famille D : un choix de catégorie faux clôt l'écran (choix fermé, une tentative — sinon il se
 * gagnerait par élimination), seule une VALEUR exacte fausse dans la bonne catégorie laisse les
 * tentatives du champ (`reglages.tentativesMax`). */
export function categorieCorrecteD(cible: CibleLimiteLog, reponse: ReponseLimiteLog): boolean {
  return categorieReponseD(reponse) === cible.type;
}

function verifierCibleD(cible: CibleLimiteLog, reponse: ReponseLimiteLog, comparer: (soumis: number, cible: number) => boolean): boolean {
  if (!categorieCorrecteD(cible, reponse)) return false;
  if (cible.type !== "valeur") return true;
  if (reponse.type !== "valeur") return false;
  let soumis: number;
  try {
    soumis = evaluerExpressionExponentielle(reponse.texte, {});
  } catch {
    return false;
  }
  return Number.isFinite(soumis) && comparer(soumis, cible.valeur);
}

/** Écran 2 : L = lim g·ln f (valeur exacte, ±∞ ou 0) — même tolérance relative que les autres
 * valeurs de 6gen17 (`toleranceValeur`) ; |L| ≥ 1/3 par construction. */
export function verifierDExposant(exercice: ExerciceLimiteLogD, reponse: ReponseLimiteLog): boolean {
  return verifierCibleD(exercice.limiteProduit, reponse, (s, c) => Math.abs(s - c) <= toleranceValeur(c));
}

/** Écran 3 : lim f^g. Une valeur e^L se compare par son LOGARITHME (|ln s − L| ≤ 10⁻³) : la
 * tolérance absolue de 0,005 acceptait « 0 » pour e^{−6} ≈ 0,0025, ou e^{−5} pour e^{−6}. */
export function verifierDConclure(exercice: ExerciceLimiteLogD, reponse: ReponseLimiteLog): boolean {
  return verifierCibleD(exercice.limiteFinale, reponse, (s, c) => s > 0 && Math.abs(Math.log(s) - Math.log(c)) <= 1e-3);
}
