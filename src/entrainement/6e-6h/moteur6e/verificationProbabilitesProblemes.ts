import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleEMixte, ExerciceFamilleF, ExerciceFamilleGMelange, ExerciceProbabilitesProblemes } from "../core6e/probabilitesProblemes.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseProbabilitesProblemes } from "./typesProbabilitesProblemes";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import { diagnostiquerProbabilite } from "./verificationProbabilites";
import { diagnostiquerCEcran1 as diagnostiquerMelangeEcran1 } from "./verificationTiragesArbres";
import { bayesEcran3C, branchesArbreC, probabiliteEffetC } from "./verificationIndependanceBayes";

/**
 * Couche B (6e) — vérification propre à `6gen33`. N'importe jamais rien de `src/generateurs6e/`.
 *
 * Audit 6e ch. 6 (décision A) : TOUTE probabilité saisie passe par `diagnostiquerProbabilite`
 * (`moteur6e/verificationProbabilites.ts`) — forme exacte (fraction, calcul) acceptée, sinon un
 * décimal ou un pourcentage qui est l'arrondi CORRECT de la valeur, avec au moins 2 décimales (3 si
 * la valeur est inférieure à 0,1). Plus aucune tolérance absolue de 0,01 (qui acceptait 0,34 pour
 * 1/3). Précision minimale relevée à 4 décimales (`decimalesMin`) pour :
 * - les facteurs (365−k)/365 de la famille A (deux facteurs voisins ne diffèrent que de 1/365) ;
 * - toute fiabilité de la famille F (série/parallèle : valeurs très proches de 1).
 *
 * Réutilisations Couche B ↔ Couche B :
 * - `branchesArbreC`/`probabiliteEffetC`/`bayesEcran3C` (6gen32) pour la famille E ;
 * - `diagnostiquerCEcran1` de `verificationTiragesArbres.ts` (6gen31, équation 5p + a = 1 vérifiée
 *   symboliquement) pour l'écran 1 de la famille G — les écrans 2 et 3 (des probabilités) sont
 *   recalculés ici pour passer par `diagnostiquerProbabilite`.
 *
 * Convention de signature : tous les écrans prennent `string[]`, y compris l'écran à choix
 * (`valeurs=[choixId]`).
 */

/** Précision minimale (nombre de décimales) des facteurs (365−k)/365 et des fiabilités. */
export const DECIMALES_FACTEURS_ANNIVERSAIRE = 4;
export const DECIMALES_FIABILITE = 4;

function pireStatut(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

function proba(texte: string | undefined, cible: number, decimalesMin?: number): StatutVerification {
  return diagnostiquerProbabilite(texte ?? "", cible, decimalesMin);
}

// ============================================================================
// Famille A — Paradoxe des anniversaires.
// ============================================================================

function facteurEcran1(k: number): number {
  return (365 - k) / 365;
}
export function facteursEcran1(n: number): number[] {
  const facteurs: number[] = [];
  for (let k = 1; k <= n - 1; k++) facteurs.push(facteurEcran1(k));
  return facteurs;
}
export function probToutesDifferentes(n: number): number {
  return facteursEcran1(n).reduce((acc, f) => acc * f, 1);
}

/** Écran 1 — `valeurs = [facteur_1, ..., facteur_{n-1}]`, dans cet ordre. */
export function diagnostiquerAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  const attendus = facteursEcran1(exercice.n);
  if (valeurs.length !== attendus.length) return "not_equivalent";
  return pireStatut(...attendus.map((cible, i) => proba(valeurs[i], cible, DECIMALES_FACTEURS_ANNIVERSAIRE)));
}
/** Écran 2 — `valeurs = [valeur]`. */
export function diagnostiquerAEcran2(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  return proba(valeurs[0], probToutesDifferentes(exercice.n));
}
/** Écran 3 — `valeurs = [valeur]`. */
export function diagnostiquerAEcran3(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  return proba(valeurs[0], 1 - probToutesDifferentes(exercice.n));
}

// ============================================================================
// Famille B — Épreuves répétées (décision G : chemins comptés dans l'arbre, jamais C(n,k)).
// ============================================================================

/** Nombre de chemins de l'arbre à exactement k succès, par énumération des 2ⁿ chemins (n ≤ 5). */
export function nombreCheminsKSucces(n: number, k: number): number {
  let total = 0;
  for (let chemin = 0; chemin < 2 ** n; chemin++) {
    let succes = 0;
    for (let i = 0; i < n; i++) if ((chemin >> i) & 1) succes++;
    if (succes === k) total++;
  }
  return total;
}
export function probExactementKChemins(n: number, p: number, k: number): number {
  return nombreCheminsKSucces(n, k) * p ** k * (1 - p) ** (n - k);
}
function probAuMoinsK(n: number, p: number, k: number): number {
  let somme = 0;
  for (let i = k; i <= n; i++) somme += probExactementKChemins(n, p, i);
  return somme;
}
function probUnDeChaqueResultat(n: number, p: number): number {
  return 1 - p ** n - (1 - p) ** n;
}
export function valeurEcran3EpreuvesRepetees(exercice: ExerciceFamilleB): number {
  return exercice.demandeEcran3 === "auMoinsK" ? probAuMoinsK(exercice.n, exercice.p, exercice.k) : probUnDeChaqueResultat(exercice.n, exercice.p);
}

/** Écran 1 — `valeurs = [nombre de chemins]` : un entier (un calcul qui donne cet entier est accepté). */
export function diagnostiquerBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  const v = evaluerValeurExponentielle((valeurs[0] ?? "").trim());
  if (v === null) return "parse_error";
  return Math.abs(v - nombreCheminsKSucces(exercice.n, exercice.k)) < 1e-9 ? "correct" : "not_equivalent";
}
/** Écran 2 — `valeurs = [valeur]`. */
export function diagnostiquerBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return proba(valeurs[0], probExactementKChemins(exercice.n, exercice.p, exercice.k));
}
/** Écran 3 — `valeurs = [valeur]`. */
export function diagnostiquerBEcran3(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return proba(valeurs[0], valeurEcran3EpreuvesRepetees(exercice));
}

// ============================================================================
// Famille C — Indépendants à probabilités différentes.
// ============================================================================

/** Toutes les configurations de taille `k` (indices 0-based) — ordre canonique. Exportée :
 * réutilisée par `ui6e/formatProbabilitesProblemes.ts`. */
export function configurationsExactementK(k: number): number[][] {
  const toutes: number[][] = [[], [0], [1], [2], [0, 1], [0, 2], [1, 2], [0, 1, 2]];
  return toutes.filter((c) => c.length === k);
}
export function probabiliteConfiguration(p: [number, number, number], configuration: number[]): number {
  let resultat = 1;
  for (let i = 0; i < 3; i++) resultat *= configuration.includes(i) ? p[i] : 1 - p[i];
  return resultat;
}
export function probabiliteExactementKFamilleC(exercice: ExerciceFamilleC): number {
  return configurationsExactementK(exercice.k).reduce((acc, c) => acc + probabiliteConfiguration(exercice.p, c), 0);
}

/** Parse un descriptif de configuration (ex. « 1 et 3 », « 1;3 », « 13 ») en indices 0-based triés —
 * `null` si aucun chiffre 1/2/3 reconnu. */
function parserConfigurationTexte(texte: string): number[] | null {
  const chiffres = texte.match(/[123]/g);
  if (!chiffres) return null;
  return Array.from(new Set(chiffres.map((d) => Number(d) - 1))).sort((a, b) => a - b);
}
function memeConfiguration(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Écran 1 — écran « liste » : une entrée par configuration, ordre indifférent, comparée comme un
 * ensemble (ni manquante, ni surnuméraire, ni dupliquée). */
export function diagnostiquerCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  const attendues = configurationsExactementK(exercice.k);
  const parsees: number[][] = [];
  for (const texte of valeurs) {
    const config = parserConfigurationTexte(texte);
    if (config === null) return "parse_error";
    parsees.push(config);
  }
  if (parsees.length !== attendues.length) return "not_equivalent";
  const restantes = [...attendues];
  for (const config of parsees) {
    const index = restantes.findIndex((c) => memeConfiguration(c, config));
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}
/** Écran 2 — `valeurs = [P(config_1), ..., P(config_m)]`, dans l'ordre canonique. */
export function diagnostiquerCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  const configs = configurationsExactementK(exercice.k);
  if (valeurs.length !== configs.length) return "not_equivalent";
  return pireStatut(...configs.map((c, i) => proba(valeurs[i], probabiliteConfiguration(exercice.p, c))));
}
/** Écran 3 — `valeurs = [valeur]`. */
export function diagnostiquerCEcran3(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  return proba(valeurs[0], probabiliteExactementKFamilleC(exercice));
}

// ============================================================================
// Famille E — Bayes en problème (réutilise `verificationIndependanceBayes.ts`, 6gen32).
// ============================================================================

/** Écran 1 — `valeurs = [P(c1), P(E|c1), P(E|c2)]`, dans cet ordre symbolique. */
export function diagnostiquerEMixteEcran1(exercice: ExerciceFamilleEMixte, valeurs: string[]): StatutVerification {
  const { p, q1, q2 } = exercice.base;
  return pireStatut(proba(valeurs[0], p), proba(valeurs[1], q1), proba(valeurs[2], q2));
}
/** Écran 2 — `valeurs = [P(c1∩E), P(c1∩Ē), P(c2∩E), P(c2∩Ē), P(E)]`. */
export function diagnostiquerEMixteEcran2(exercice: ExerciceFamilleEMixte, valeurs: string[]): StatutVerification {
  const cibles = [...branchesArbreC(exercice.base), probabiliteEffetC(exercice.base)];
  return pireStatut(...cibles.map((c, i) => proba(valeurs[i], c)));
}
/** Écran 3 — `valeurs = [valeur]`. */
export function diagnostiquerEMixteEcran3(exercice: ExerciceFamilleEMixte, valeurs: string[]): StatutVerification {
  return proba(valeurs[0], bayesEcran3C(exercice.base));
}

// ============================================================================
// Famille F — Montages en série / en parallèle (fiabilité, 4 décimales).
// ============================================================================

export function valeurConfigurationF(p: [number, number, number], configuration: "serie" | "parallele" | "mixte", positionMixte?: 0 | 1 | 2): number {
  if (configuration === "serie") return p[0] * p[1] * p[2];
  if (configuration === "parallele") return 1 - (1 - p[0]) * (1 - p[1]) * (1 - p[2]);
  const solo = positionMixte ?? 0;
  const autres = [0, 1, 2].filter((i) => i !== solo);
  return p[solo] * (1 - (1 - p[autres[0]]) * (1 - p[autres[1]]));
}
export function valeurAlternativeF(exercice: ExerciceFamilleF): number {
  return valeurConfigurationF(exercice.p, exercice.configurationAlternative, exercice.positionMixteAlternative);
}
/** L'affirmation (arrondie à 4 décimales) est vraie ssi c'est l'arrondi correct de la fiabilité
 * de la configuration alternative. */
export function affirmationFEstVraie(exercice: ExerciceFamilleF): boolean {
  return Math.abs((exercice.affirmationValeur ?? Number.NaN) - valeurAlternativeF(exercice)) <= 0.5e-4 + 1e-12;
}

/** Écran 1 — `valeurs = [calcul posé]` (une expression, évaluée). */
export function diagnostiquerFEcran1(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return proba(valeurs[0], valeurConfigurationF(exercice.p, exercice.configuration, exercice.positionMixte), DECIMALES_FIABILITE);
}
/** Écran 2 — `valeurs = [valeur]`. */
export function diagnostiquerFEcran2(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return proba(valeurs[0], valeurConfigurationF(exercice.p, exercice.configuration, exercice.positionMixte), DECIMALES_FIABILITE);
}
/** Écran 3, variante "comparerValeur" — `valeurs = [valeur]`. */
export function diagnostiquerFEcran3Comparer(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return proba(valeurs[0], valeurAlternativeF(exercice), DECIMALES_FIABILITE);
}
/** Écran 3, variante "verifierAffirmation" — `valeurs = [choixId]`, `choixId∈{"vrai","faux"}`. */
export function diagnostiquerFEcran3Verifier(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return valeurs[0] === (affirmationFEstVraie(exercice) ? "vrai" : "faux") ? "correct" : "not_equivalent";
}
export function diagnostiquerFEcran3(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return exercice.demandeEcran3 === "comparerValeur" ? diagnostiquerFEcran3Comparer(exercice, valeurs) : diagnostiquerFEcran3Verifier(exercice, valeurs);
}

// ============================================================================
// Famille G — Mélange de deux urnes (probabilités totales).
// ============================================================================

export function probabiliteFaceOrdinaire(exercice: ExerciceFamilleGMelange): number {
  return exercice.base.p.num / exercice.base.p.den;
}
/** P(face spéciale ou autre face | urne 1) = a + p. */
export function probabiliteObjet1(exercice: ExerciceFamilleGMelange): number {
  const { p0 } = exercice.base;
  return p0.num / p0.den + probabiliteFaceOrdinaire(exercice);
}
export function probabiliteTotaleMelange(exercice: ExerciceFamilleGMelange): number {
  return exercice.poidsObjet1 * probabiliteObjet1(exercice) + (1 - exercice.poidsObjet1) * exercice.probabiliteAutreObjet;
}

/** Écran 1 — `valeurs = [équation]` (5p + a = 1, vérifiée symboliquement par 6gen31). */
export function diagnostiquerGMelangeEcran1(exercice: ExerciceFamilleGMelange, valeurs: string[]): StatutVerification {
  return diagnostiquerMelangeEcran1(exercice.base, valeurs);
}
/** Écran 2 — `valeurs = [p]`. */
export function diagnostiquerGMelangeEcran2(exercice: ExerciceFamilleGMelange, valeurs: string[]): StatutVerification {
  return proba(valeurs[0], probabiliteFaceOrdinaire(exercice));
}
/** Écran 3 — `valeurs = [valeur]`. */
export function diagnostiquerGMelangeEcran3(exercice: ExerciceFamilleGMelange, valeurs: string[]): StatutVerification {
  return proba(valeurs[0], probabiliteObjet1(exercice));
}
/** Écran 4 — `valeurs = [valeur]`. */
export function diagnostiquerGMelangeEcran4(exercice: ExerciceFamilleGMelange, valeurs: string[]): StatutVerification {
  return proba(valeurs[0], probabiliteTotaleMelange(exercice));
}

// ============================================================================
// Dispatcher générique + classification des écrans.
// ============================================================================

export type TypeEcranProbabilitesProblemes = "champs" | "liste" | "choix";

/** `"liste"` : famille C écran 1. `"choix"` (vrai/faux) : famille F écran 3, variante
 * "verifierAffirmation". `"champs"` partout ailleurs. */
export function typeEcran(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): TypeEcranProbabilitesProblemes {
  if (phase === "cEcran1") return "liste";
  if (phase === "fEcran3" && exercice.famille === "F" && exercice.demandeEcran3 === "verifierAffirmation") return "choix";
  return "champs";
}

export function diagnostiquerEcran(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes, valeurs: string[]): StatutVerification {
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
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceFamilleC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceFamilleC, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceFamilleC, valeurs);
    case "eMixteEcran1":
      return diagnostiquerEMixteEcran1(exercice as ExerciceFamilleEMixte, valeurs);
    case "eMixteEcran2":
      return diagnostiquerEMixteEcran2(exercice as ExerciceFamilleEMixte, valeurs);
    case "eMixteEcran3":
      return diagnostiquerEMixteEcran3(exercice as ExerciceFamilleEMixte, valeurs);
    case "fEcran1":
      return diagnostiquerFEcran1(exercice as ExerciceFamilleF, valeurs);
    case "fEcran2":
      return diagnostiquerFEcran2(exercice as ExerciceFamilleF, valeurs);
    case "fEcran3":
      return diagnostiquerFEcran3(exercice as ExerciceFamilleF, valeurs);
    case "gMelangeEcran1":
      return diagnostiquerGMelangeEcran1(exercice as ExerciceFamilleGMelange, valeurs);
    case "gMelangeEcran2":
      return diagnostiquerGMelangeEcran2(exercice as ExerciceFamilleGMelange, valeurs);
    case "gMelangeEcran3":
      return diagnostiquerGMelangeEcran3(exercice as ExerciceFamilleGMelange, valeurs);
    case "gMelangeEcran4":
      return diagnostiquerGMelangeEcran4(exercice as ExerciceFamilleGMelange, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
