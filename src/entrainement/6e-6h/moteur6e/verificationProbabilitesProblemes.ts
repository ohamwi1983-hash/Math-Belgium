import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleD, ExerciceFamilleEMixte, ExerciceFamilleEParametrique, ExerciceFamilleF, ExerciceFamilleGDerangements, ExerciceFamilleGFinancier, ExerciceFamilleGMelange, ExerciceProbabilitesProblemes } from "../core6e/probabilitesProblemes.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseProbabilitesProblemes } from "./typesProbabilitesProblemes";
import { diagnostiquerEquivalenceFonction } from "./equivalenceExponentielle";
import { diagnostiquerValeur } from "./verificationProbabilites";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";
import { diagnostiquerCEcran1 as diagnostiquerMelangeEcran1, diagnostiquerCEcran2 as diagnostiquerMelangeEcran2, diagnostiquerCEcran3 as diagnostiquerMelangeEcran3, diagnostiquerBEcran1 as diagnostiquerDerangEcran1, diagnostiquerBEcran2 as diagnostiquerDerangEcran2, diagnostiquerBEcran3 as diagnostiquerDerangEcran3, diagnostiquerBEcran4 as diagnostiquerDerangEcran4 } from "./verificationTiragesArbres";
import { bayesEcran3C, branchesArbreC, probabiliteEffetC } from "./verificationIndependanceBayes";

/**
 * Couche B (6e) — vérification propre à `6gen33`. N'importe JAMAIS rien de `src/generateurs6e/`
 * (règle non négociable, CLAUDE.md) — voir `verificationProbabilitesProblemes.test.ts` (fixtures
 * locales factices) et `generateurs6e/probabilitesProblemes/session.integration.test.ts` (seul
 * fichier autorisé Couche A + Couche B) pour la preuve.
 *
 * ============================================================================
 * **RÉUTILISATION Couche B ↔ Couche B (libre au sein du chantier 6e — CLAUDE.md)**
 * ============================================================================
 * - `diagnostiquerValeur` (statut fraction/décimal) — réexportée depuis `moteur6e/
 *   verificationProbabilites.ts` (module PARTAGÉ chapitre 8, fondé par 6gen30).
 * - `diagnostiquerEquivalenceFonction` — réutilisée depuis `moteur6e/equivalenceExponentielle.ts`
 *   (module partagé chapitre 2, technique d'échantillonnage numérique déjà établie) pour famille E
 *   sous-type "parametrique" (expressions en x).
 * - `verifierEnsembleReelGuide` — réutilisée depuis `moteur6e/verificationEnsembleReel.ts` pour
 *   famille E sous-type "parametrique" écran 3 (intervalle solution de l'inéquation).
 * - `diagnostiquerBEcran1..4`/`diagnostiquerCEcran1..3` — réutilisées TELLES QUELLES depuis
 *   `moteur6e/verificationTiragesArbres.ts` (6gen31) pour famille G sous-types "derangements"/
 *   "melangeObjets" (spec : "aucune adaptation nécessaire").
 * - `branchesArbreC`/`probabiliteEffetC`/`bayesEcran3C` — réutilisées TELLES QUELLES depuis
 *   `moteur6e/verificationIndependanceBayes.ts` (6gen32) pour famille E sous-type "mixte".
 * Tout le reste (familles A/B/C/D/F, écrans propres à G) est RECALCULÉ ici indépendamment de
 * `generateurs6e/probabilitesProblemes/*.ts` (même principe que `verificationIndependanceBayes.ts`/
 * `verificationTiragesArbres.ts`).
 *
 * ============================================================================
 * **Convention de signature — tous les écrans prennent `string[]`**, y compris les écrans à choix
 * (`valeurs=[choixId]`, même convention que `6gen30`) ET l'écran "intervalle" de famille E
 * paramétrique écran 3 (`valeurs=[JSON.stringify(EnsembleReelGuide)]` — sérialisation choisie pour
 * garder `sessionProbabilitesProblemes.ts`/`etapeTentatives.ts` génériques sur `string[]`, jamais un
 * second chemin de soumission parallèle pour un seul écran).
 * ============================================================================
 */

const TOLERANCE = 0.01;
/** Tolérance resserrée, famille A UNIQUEMENT — les facteurs (365-k)/365 consécutifs ne sont écartés
 * que d'environ 1/365≈0,0027 : la tolérance par défaut (0,01) confondrait deux facteurs ADJACENTS
 * distincts (accepterait à tort un facteur décalé d'un rang). `0,001` reste largement au-dessus de
 * l'imprécision d'une saisie décimale à quelques chiffres, tout en restant sous l'écart minimal réel
 * entre facteurs. */
const TOLERANCE_ANNIVERSAIRE = 0.001;

function pireStatut(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
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

/** Écran 1 — `valeurs = [facteur_1, ..., facteur_{n-1}]`, TOUJOURS dans cet ordre. */
export function diagnostiquerAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  const attendus = facteursEcran1(exercice.n);
  if (valeurs.length !== attendus.length) return "not_equivalent";
  return pireStatut(...attendus.map((cible, i) => diagnostiquerValeur(valeurs[i], cible, TOLERANCE_ANNIVERSAIRE)));
}
export function verifierAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [valeur]`. */
export function diagnostiquerAEcran2(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], probToutesDifferentes(exercice.n), TOLERANCE_ANNIVERSAIRE);
}
export function verifierAEcran2(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — `valeurs = [valeur]`. */
export function diagnostiquerAEcran3(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], 1 - probToutesDifferentes(exercice.n), TOLERANCE_ANNIVERSAIRE);
}
export function verifierAEcran3(exercice: ExerciceFamilleA, valeurs: string[]): boolean {
  return diagnostiquerAEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille B — Loi binomiale.
// ============================================================================

function factorielle(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
function coefficientBinomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  return factorielle(n) / (factorielle(k) * factorielle(n - k));
}
export function probExactementKBinomiale(n: number, p: number, k: number): number {
  return coefficientBinomial(n, k) * p ** k * (1 - p) ** (n - k);
}
function probAuMoinsK(n: number, p: number, k: number): number {
  let somme = 0;
  for (let i = k; i <= n; i++) somme += probExactementKBinomiale(n, p, i);
  return somme;
}
function probUnDeChaqueResultat(n: number, p: number): number {
  return 1 - p ** n - (1 - p) ** n;
}
export function valeurEcran3Binomiale(exercice: ExerciceFamilleB): number {
  return exercice.demandeEcran3 === "auMoinsK" ? probAuMoinsK(exercice.n, exercice.p, exercice.k) : probUnDeChaqueResultat(exercice.n, exercice.p);
}

/** Écran 1 — `valeurs = [formule posée, ÉVALUÉE numériquement]` — jamais de vérification symbolique
 * de sa FORME : évaluer numériquement suffit à intercepter le piège central (coefficient binomial
 * oublié change la valeur numérique). `valeurs = [texte]`. */
export function diagnostiquerBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], probExactementKBinomiale(exercice.n, exercice.p, exercice.k), TOLERANCE);
}
export function verifierBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [valeur]`. */
export function diagnostiquerBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], probExactementKBinomiale(exercice.n, exercice.p, exercice.k), TOLERANCE);
}
export function verifierBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — `valeurs = [valeur]`. */
export function diagnostiquerBEcran3(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], valeurEcran3Binomiale(exercice), TOLERANCE);
}
export function verifierBEcran3(exercice: ExerciceFamilleB, valeurs: string[]): boolean {
  return diagnostiquerBEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille C — Indépendants à probabilités différentes.
// ============================================================================

/** Toutes les configurations de taille `k` — DUPLIQUÉE de `generateurs6e/probabilitesProblemes/
 * familleC.ts` (jamais importée, règle non négociable). Exportée : réutilisée par
 * `ui6e/formatProbabilitesProblemes.ts` (libellés des champs de l'écran 2, même ordre canonique). */
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

/** Parse un descriptif de configuration texte libre (ex. "1,3" ou "13") en indices 0-based triés —
 * `null` si aucun chiffre 1/2/3 reconnu. */
function parserConfigurationTexte(texte: string): number[] | null {
  const chiffres = texte.match(/[123]/g);
  if (!chiffres) return null;
  return Array.from(new Set(chiffres.map((d) => Number(d) - 1))).sort((a, b) => a - b);
}
function memeConfiguration(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** Écran 1 — écran "liste" (add-as-needed, taille variable) : `valeurs` = une entrée texte par
 * configuration proposée par l'élève, ORDRE INDIFFÉRENT — comparée comme un ENSEMBLE de
 * configurations (ni manquante, ni surnuméraire, ni dupliquée) à `configurationsExactementK(k)`. */
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
export function verifierCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [P(config_1), ..., P(config_m)]`, TOUJOURS dans l'ordre canonique de
 * `configurationsExactementK(k)`. Piège central : chaque configuration vérifiée avec SES PROPRES
 * probabilités (produit), jamais un facteur binomial commun. */
export function diagnostiquerCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  const configs = configurationsExactementK(exercice.k);
  if (valeurs.length !== configs.length) return "not_equivalent";
  return pireStatut(...configs.map((c, i) => diagnostiquerValeur(valeurs[i], probabiliteConfiguration(exercice.p, c), TOLERANCE)));
}
export function verifierCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — `valeurs = [valeur]`. */
export function diagnostiquerCEcran3(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], probabiliteExactementKFamilleC(exercice), TOLERANCE);
}
export function verifierCEcran3(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille D — Probabilité géométrique.
// ============================================================================

export function coeffAireZone(r: [number, number, number], zone: number): number {
  if (zone === 0) return r[0] ** 2;
  if (zone === 1) return r[1] ** 2 - r[0] ** 2;
  return r[2] ** 2 - r[1] ** 2;
}
export function coeffAireTotale(r: [number, number, number]): number {
  return r[2] ** 2;
}
export function probabiliteZoneCible(exercice: ExerciceFamilleD): number {
  const numerateur = exercice.zoneCible.reduce((acc, z) => acc + coeffAireZone(exercice.r, z), 0);
  return numerateur / coeffAireTotale(exercice.r);
}

/** Écran 1 — `valeurs = [aire zone0, aire zone1, aire zone2]` (coefficients ENTIERS de π), TOUJOURS
 * dans cet ordre (disque interne, anneau2, anneau3). */
export function diagnostiquerDEcran1(exercice: ExerciceFamilleD, valeurs: string[]): StatutVerification {
  return pireStatut(...[0, 1, 2].map((zone) => diagnostiquerValeur(valeurs[zone], coeffAireZone(exercice.r, zone), TOLERANCE)));
}
export function verifierDEcran1(exercice: ExerciceFamilleD, valeurs: string[]): boolean {
  return diagnostiquerDEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [valeur]`. */
export function diagnostiquerDEcran2(exercice: ExerciceFamilleD, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], probabiliteZoneCible(exercice), TOLERANCE);
}
export function verifierDEcran2(exercice: ExerciceFamilleD, valeurs: string[]): boolean {
  return diagnostiquerDEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille E — sous-type "mixte" (réutilise `verificationIndependanceBayes.ts`, 6gen32).
// ============================================================================

/** Écran 1 — identifier le SENS de chaque donnée présentée (mélangée à l'écran) : `valeurs =
 * [P(c1), P(E|c1), P(E|c2)]`, TOUJOURS dans cet ordre symbolique (indépendant de l'ordre
 * d'affichage — c'est justement ce que l'élève doit reconstituer). */
export function diagnostiquerEMixteEcran1(exercice: ExerciceFamilleEMixte, valeurs: string[]): StatutVerification {
  const { p, q1, q2 } = exercice.base;
  return pireStatut(diagnostiquerValeur(valeurs[0], p, TOLERANCE), diagnostiquerValeur(valeurs[1], q1, TOLERANCE), diagnostiquerValeur(valeurs[2], q2, TOLERANCE));
}
export function verifierEMixteEcran1(exercice: ExerciceFamilleEMixte, valeurs: string[]): boolean {
  return diagnostiquerEMixteEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [P(c1∩E), P(c1∩Ē), P(c2∩E), P(c2∩Ē), P(E)]`. */
export function diagnostiquerEMixteEcran2(exercice: ExerciceFamilleEMixte, valeurs: string[]): StatutVerification {
  const [b1, b2, b3, b4] = branchesArbreC(exercice.base);
  const pEffet = probabiliteEffetC(exercice.base);
  return pireStatut(diagnostiquerValeur(valeurs[0], b1, TOLERANCE), diagnostiquerValeur(valeurs[1], b2, TOLERANCE), diagnostiquerValeur(valeurs[2], b3, TOLERANCE), diagnostiquerValeur(valeurs[3], b4, TOLERANCE), diagnostiquerValeur(valeurs[4], pEffet, TOLERANCE));
}
export function verifierEMixteEcran2(exercice: ExerciceFamilleEMixte, valeurs: string[]): boolean {
  return diagnostiquerEMixteEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — `valeurs = [valeur]`. */
export function diagnostiquerEMixteEcran3(exercice: ExerciceFamilleEMixte, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], bayesEcran3C(exercice.base), TOLERANCE);
}
export function verifierEMixteEcran3(exercice: ExerciceFamilleEMixte, valeurs: string[]): boolean {
  return diagnostiquerEMixteEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille E — sous-type "parametrique".
// ============================================================================

const POINTS_ECHANTILLONNAGE_X = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

export function pTestPositifDeX(a: number, b: number, x: number): number {
  return a * x + b * (1 - x);
}
export function pXBayes(a: number, b: number, x: number): number {
  return (a * x) / pTestPositifDeX(a, b, x);
}

/** Écran 1 — `valeurs = [expr P(malade∩test+), expr P(test+)]`, expressions en x, vérifiées par
 * échantillonnage numérique (`diagnostiquerEquivalenceFonction`, technique partagée chapitre 2). */
export function diagnostiquerEParamEcran1(exercice: ExerciceFamilleEParametrique, valeurs: string[]): StatutVerification {
  const { a, b } = exercice;
  const statut1 = diagnostiquerEquivalenceFonction(valeurs[0], (x) => a * x, POINTS_ECHANTILLONNAGE_X, TOLERANCE);
  const statut2 = diagnostiquerEquivalenceFonction(valeurs[1], (x) => pTestPositifDeX(a, b, x), POINTS_ECHANTILLONNAGE_X, TOLERANCE);
  return pireStatut(statut1, statut2);
}
export function verifierEParamEcran1(exercice: ExerciceFamilleEParametrique, valeurs: string[]): boolean {
  return diagnostiquerEParamEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [expr P(x)]`, expression rationnelle en x. */
export function diagnostiquerEParamEcran2(exercice: ExerciceFamilleEParametrique, valeurs: string[]): StatutVerification {
  const { a, b } = exercice;
  return diagnostiquerEquivalenceFonction(valeurs[0], (x) => pXBayes(a, b, x), POINTS_ECHANTILLONNAGE_X, TOLERANCE);
}
export function verifierEParamEcran2(exercice: ExerciceFamilleEParametrique, valeurs: string[]): boolean {
  return diagnostiquerEParamEcran2(exercice, valeurs) === "correct";
}

/** Borne de l'inéquation P(x)>seuil — voir en-tête de `generateurs6e/probabilitesProblemes/
 * familleE.ts` (`borneInterieure`, dupliquée ici). P(x) est TOUJOURS STRICTEMENT CROISSANTE en x sur
 * ]0,1[ dès lors que a>b (garanti à la construction) : la solution est donc TOUJOURS l'intervalle
 * ouvert (borne, 1), jamais l'autre sens — aucun test de signe supplémentaire nécessaire. */
export function borneInequationParametrique(a: number, b: number, seuil: number): number {
  const coeffX = a - seuil * (a - b);
  return (seuil * b) / coeffX;
}

/** Solution EXACTE de l'inéquation, sous la forme `EnsembleReelGuide` déjà partagée 5e/6e
 * (`core6e/ensembleReel.types.ts`) — LE composant/vérification "intervalle" déjà existant réutilisé
 * tel quel pour cet écran (voir `verifierEnsembleReelGuide` importée en tête de fichier). */
export function resoudreInequationParametrique(exercice: ExerciceFamilleEParametrique): EnsembleReelGuide {
  const borne = borneInequationParametrique(exercice.a, exercice.b, exercice.seuil);
  return { forme: "intervalles", points: [], morceaux: [{ inf: borne, sup: 1, infInclus: false, supInclus: false }] };
}

function estEnsembleReelGuide(valeur: unknown): valeur is EnsembleReelGuide {
  return typeof valeur === "object" && valeur !== null && typeof (valeur as { forme?: unknown }).forme === "string";
}

/** Écran 3 — `valeurs = [JSON.stringify(EnsembleReelGuide)]` (voir en-tête de fichier). */
export function diagnostiquerEParamEcran3(exercice: ExerciceFamilleEParametrique, valeurs: string[]): StatutVerification {
  let saisie: unknown;
  try {
    saisie = JSON.parse(valeurs[0]);
  } catch {
    return "parse_error";
  }
  if (!estEnsembleReelGuide(saisie)) return "parse_error";
  return verifierEnsembleReelGuide(saisie, resoudreInequationParametrique(exercice)) ? "correct" : "not_equivalent";
}
export function verifierEParamEcran3(exercice: ExerciceFamilleEParametrique, valeurs: string[]): boolean {
  return diagnostiquerEParamEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille F — Fiabilité de circuits.
// ============================================================================

export function valeurConfigurationF(p: [number, number, number], configuration: "serie" | "parallele" | "mixte", positionMixte?: 0 | 1 | 2): number {
  if (configuration === "serie") return p[0] * p[1] * p[2];
  if (configuration === "parallele") return 1 - (1 - p[0]) * (1 - p[1]) * (1 - p[2]);
  const solo = positionMixte ?? 0;
  const autres = [0, 1, 2].filter((i) => i !== solo);
  return p[solo] * (1 - (1 - p[autres[0]]) * (1 - p[autres[1]]));
}

/** Écran 1 — `valeurs = [formule posée, ÉVALUÉE numériquement]` — même principe que famille B écran
 * 1 (piège "série/parallèle confondus" intercepté car cela change la valeur numérique). */
export function diagnostiquerFEcran1(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], valeurConfigurationF(exercice.p, exercice.configuration, exercice.positionMixte), TOLERANCE);
}
export function verifierFEcran1(exercice: ExerciceFamilleF, valeurs: string[]): boolean {
  return diagnostiquerFEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [valeur]`. */
export function diagnostiquerFEcran2(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], valeurConfigurationF(exercice.p, exercice.configuration, exercice.positionMixte), TOLERANCE);
}
export function verifierFEcran2(exercice: ExerciceFamilleF, valeurs: string[]): boolean {
  return diagnostiquerFEcran2(exercice, valeurs) === "correct";
}

/** Écran 3, variante "comparerValeur" — `valeurs = [valeur]`, fiabilité de la configuration
 * ALTERNATIVE. */
export function diagnostiquerFEcran3Comparer(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  const config = exercice.configurationAlternative ?? exercice.configuration;
  return diagnostiquerValeur(valeurs[0], valeurConfigurationF(exercice.p, config, exercice.positionMixteAlternative), TOLERANCE);
}
/** Écran 3, variante "verifierAffirmation" — `valeurs = [choixId]`, `choixId∈{"vrai","faux"}`. */
export function diagnostiquerFEcran3Verifier(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  const valeurCorrecte = valeurConfigurationF(exercice.p, exercice.configuration, exercice.positionMixte);
  const estVraie = Math.abs((exercice.affirmationValeur ?? Number.NaN) - valeurCorrecte) <= TOLERANCE;
  return valeurs[0] === (estVraie ? "vrai" : "faux") ? "correct" : "not_equivalent";
}
export function diagnostiquerFEcran3(exercice: ExerciceFamilleF, valeurs: string[]): StatutVerification {
  return exercice.demandeEcran3 === "comparerValeur" ? diagnostiquerFEcran3Comparer(exercice, valeurs) : diagnostiquerFEcran3Verifier(exercice, valeurs);
}
export function verifierFEcran3(exercice: ExerciceFamilleF, valeurs: string[]): boolean {
  return diagnostiquerFEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille G — sous-type "derangements" (réutilise `verificationTiragesArbres.ts`, 6gen31, TEL QUEL).
// ============================================================================

export function diagnostiquerGDerangEcran1(exercice: ExerciceFamilleGDerangements, valeurs: string[]): StatutVerification {
  return diagnostiquerDerangEcran1(exercice.base, valeurs);
}
export function diagnostiquerGDerangEcran2(exercice: ExerciceFamilleGDerangements, valeurs: string[]): StatutVerification {
  return diagnostiquerDerangEcran2(exercice.base, valeurs);
}
export function diagnostiquerGDerangEcran3(exercice: ExerciceFamilleGDerangements, valeurs: string[]): StatutVerification {
  return diagnostiquerDerangEcran3(exercice.base, valeurs);
}
export function diagnostiquerGDerangEcran4(exercice: ExerciceFamilleGDerangements, valeurs: string[]): StatutVerification {
  return diagnostiquerDerangEcran4(exercice.base, valeurs);
}

// ============================================================================
// Famille G — sous-type "melangeObjets" (réutilise `verificationTiragesArbres.ts`, 6gen31, écrans
// 1-3 TELS QUELS ; écran 4 nouveau — probabilités totales).
// ============================================================================

export function diagnostiquerGMelangeEcran1(exercice: ExerciceFamilleGMelange, valeurs: string[]): StatutVerification {
  return diagnostiquerMelangeEcran1(exercice.base, valeurs);
}
export function diagnostiquerGMelangeEcran2(exercice: ExerciceFamilleGMelange, valeurs: string[]): StatutVerification {
  return diagnostiquerMelangeEcran2(exercice.base, valeurs);
}
export function diagnostiquerGMelangeEcran3(exercice: ExerciceFamilleGMelange, valeurs: string[]): StatutVerification {
  return diagnostiquerMelangeEcran3(exercice.base, valeurs);
}

/** Écran 3 de `base` = P(faceSpeciale ∪ autreFace) = p0+p — recalculé localement depuis les champs
 * déjà connus de `exercice.base` (jamais stocké figé). */
export function probabiliteObjet1(exercice: ExerciceFamilleGMelange): number {
  const { p0, p } = exercice.base;
  return p0.num / p0.den + p.num / p.den;
}
export function probabiliteTotaleMelange(exercice: ExerciceFamilleGMelange): number {
  return exercice.poidsObjet1 * probabiliteObjet1(exercice) + (1 - exercice.poidsObjet1) * exercice.probabiliteAutreObjet;
}
/** Écran 4 — `valeurs = [valeur]`. */
export function diagnostiquerGMelangeEcran4(exercice: ExerciceFamilleGMelange, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], probabiliteTotaleMelange(exercice), TOLERANCE);
}

// ============================================================================
// Famille G — sous-type "financier".
// ============================================================================

export function produitsCategoriesFinancier(exercice: ExerciceFamilleGFinancier): number[] {
  return exercice.categories.map((c) => c.proportion * c.taux);
}
export function probabiliteGlobaleFinancier(exercice: ExerciceFamilleGFinancier): number {
  return produitsCategoriesFinancier(exercice).reduce((a, b) => a + b, 0);
}
export function resultatFinancier(exercice: ExerciceFamilleGFinancier): number {
  return probabiliteGlobaleFinancier(exercice) * exercice.valeurUnitaire * exercice.nombreTotalIndividus;
}

/** Écran 1 — `valeurs = [produit_cat1, ..., produit_catN]`, TOUJOURS dans l'ordre de
 * `exercice.categories`. */
export function diagnostiquerGFinancierEcran1(exercice: ExerciceFamilleGFinancier, valeurs: string[]): StatutVerification {
  const produits = produitsCategoriesFinancier(exercice);
  if (valeurs.length !== produits.length) return "not_equivalent";
  return pireStatut(...produits.map((v, i) => diagnostiquerValeur(valeurs[i], v, TOLERANCE)));
}
/** Écran 2 — `valeurs = [valeur]`. */
export function diagnostiquerGFinancierEcran2(exercice: ExerciceFamilleGFinancier, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], probabiliteGlobaleFinancier(exercice), TOLERANCE);
}
/** Écran 3 — `valeurs = [valeur]` (tolérance élargie : montant financier potentiellement grand). */
export function diagnostiquerGFinancierEcran3(exercice: ExerciceFamilleGFinancier, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], resultatFinancier(exercice), 1);
}

// ============================================================================
// Dispatcher générique + classification des écrans (type de saisie attendu par écran).
// ============================================================================

export type TypeEcranProbabilitesProblemes = "champs" | "liste" | "choix" | "intervalle";

/** `"liste"` (add-as-needed) : famille C écran 1. `"choix"` (vrai/faux) : famille F écran 3, variante
 * "verifierAffirmation" UNIQUEMENT. `"intervalle"` : famille E paramétrique écran 3. `"champs"`
 * partout ailleurs. */
export function typeEcran(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes): TypeEcranProbabilitesProblemes {
  if (phase === "cEcran1") return "liste";
  if (phase === "eParamEcran3") return "intervalle";
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
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceFamilleD, valeurs);
    case "dEcran2":
      return diagnostiquerDEcran2(exercice as ExerciceFamilleD, valeurs);
    case "eMixteEcran1":
      return diagnostiquerEMixteEcran1(exercice as ExerciceFamilleEMixte, valeurs);
    case "eMixteEcran2":
      return diagnostiquerEMixteEcran2(exercice as ExerciceFamilleEMixte, valeurs);
    case "eMixteEcran3":
      return diagnostiquerEMixteEcran3(exercice as ExerciceFamilleEMixte, valeurs);
    case "eParamEcran1":
      return diagnostiquerEParamEcran1(exercice as ExerciceFamilleEParametrique, valeurs);
    case "eParamEcran2":
      return diagnostiquerEParamEcran2(exercice as ExerciceFamilleEParametrique, valeurs);
    case "eParamEcran3":
      return diagnostiquerEParamEcran3(exercice as ExerciceFamilleEParametrique, valeurs);
    case "fEcran1":
      return diagnostiquerFEcran1(exercice as ExerciceFamilleF, valeurs);
    case "fEcran2":
      return diagnostiquerFEcran2(exercice as ExerciceFamilleF, valeurs);
    case "fEcran3":
      return diagnostiquerFEcran3(exercice as ExerciceFamilleF, valeurs);
    case "gDerangEcran1":
      return diagnostiquerGDerangEcran1(exercice as ExerciceFamilleGDerangements, valeurs);
    case "gDerangEcran2":
      return diagnostiquerGDerangEcran2(exercice as ExerciceFamilleGDerangements, valeurs);
    case "gDerangEcran3":
      return diagnostiquerGDerangEcran3(exercice as ExerciceFamilleGDerangements, valeurs);
    case "gDerangEcran4":
      return diagnostiquerGDerangEcran4(exercice as ExerciceFamilleGDerangements, valeurs);
    case "gMelangeEcran1":
      return diagnostiquerGMelangeEcran1(exercice as ExerciceFamilleGMelange, valeurs);
    case "gMelangeEcran2":
      return diagnostiquerGMelangeEcran2(exercice as ExerciceFamilleGMelange, valeurs);
    case "gMelangeEcran3":
      return diagnostiquerGMelangeEcran3(exercice as ExerciceFamilleGMelange, valeurs);
    case "gMelangeEcran4":
      return diagnostiquerGMelangeEcran4(exercice as ExerciceFamilleGMelange, valeurs);
    case "gFinancierEcran1":
      return diagnostiquerGFinancierEcran1(exercice as ExerciceFamilleGFinancier, valeurs);
    case "gFinancierEcran2":
      return diagnostiquerGFinancierEcran2(exercice as ExerciceFamilleGFinancier, valeurs);
    case "gFinancierEcran3":
      return diagnostiquerGFinancierEcran3(exercice as ExerciceFamilleGFinancier, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceProbabilitesProblemes, phase: PhaseProbabilitesProblemes, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
