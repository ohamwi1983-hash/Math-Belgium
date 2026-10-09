import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceTiragesArbres } from "../core6e/tiragesArbres.types";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseTiragesArbres } from "./typesTiragesArbres";
import { diagnostiquerValeur } from "./verificationProbabilites";

/**
 * Couche B (6e) — vérification propre à `6gen31` (tirages avec/sans remise, permutations et
 * dérangements, dé truqué). N'importe JAMAIS rien de `src/generateurs6e/` (règle non négociable,
 * CLAUDE.md) — toutes les quantités sont RECALCULÉES ici, indépendamment de
 * `generateurs6e/tiragesArbres/*.ts` (même principe que `verificationProbabilitesEnsembles.ts`,
 * 6gen30) — voir `generateurs6e/tiragesArbres/session.integration.test.ts` (seul fichier autorisé
 * Couche A + Couche B) pour la preuve. `diagnostiquerValeur` (statut fraction/décimal, tolérance
 * 0,01) est réutilisée telle quelle depuis `moteur6e/verificationProbabilites.ts` (module PARTAGÉ du
 * chapitre 8, contrat documenté dans son en-tête) pour TOUTE valeur numérique de ce fichier — jamais
 * un wrapper spécifique réécrit ici.
 *
 * ============================================================================
 * **Convention de signature — tous les écrans prennent `string[]`** (même convention que
 * `verificationProbabilitesEnsembles.ts`). Chaque fonction documente l'ORDRE exact des champs de son
 * écran.
 * ============================================================================
 */

const TOLERANCE = 0.01;

function pireStatut(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille A — Tirages avec/sans remise.
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

/** P(k tirages de la couleur d'effectif `nCouleur`, l'autre couleur ayant `nAutre`). */
function probMemeCouleur(nCouleur: number, nAutre: number, k: number, avecRemise: boolean): number {
  const n = nCouleur + nAutre;
  if (avecRemise) return Math.pow(nCouleur / n, k);
  let produit = 1;
  for (let i = 0; i < k; i++) produit *= (nCouleur - i) / (n - i);
  return produit;
}

/** P("exactement m boules de couleur 1") — LA formule dépend du mode de tirage (piège central de la
 * spec : appliquer la formule "avec remise" — indépendance, binomiale — à un tirage sans remise, ou
 * l'inverse, ne donne JAMAIS le même résultat). */
function probExactementM(ex: ExerciceFamilleA): number {
  const n = ex.n1 + ex.n2;
  if (ex.avecRemise) {
    const p = ex.n1 / n;
    return coefficientBinomial(ex.k, ex.m) * Math.pow(p, ex.m) * Math.pow(1 - p, ex.k - ex.m);
  }
  return (coefficientBinomial(ex.n1, ex.m) * coefficientBinomial(ex.n2, ex.k - ex.m)) / coefficientBinomial(n, ex.k);
}

/** Écran 1 — `valeurs = [P(k tirages couleur1), P(k tirages couleur2)]`, TOUJOURS dans cet ordre
 * (couleur 1 puis couleur 2). */
export function diagnostiquerAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  const p1 = probMemeCouleur(exercice.n1, exercice.n2, exercice.k, exercice.avecRemise);
  const p2 = probMemeCouleur(exercice.n2, exercice.n1, exercice.k, exercice.avecRemise);
  return pireStatut(diagnostiquerValeur(valeurs[0], p1, TOLERANCE), diagnostiquerValeur(valeurs[1], p2, TOLERANCE));
}

/** Écran 2 — `valeurs = [valeur]`, somme des 2 valeurs CORRECTES de l'écran 1 (jamais recalculée
 * depuis la saisie élève). */
export function diagnostiquerAEcran2(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  const p1 = probMemeCouleur(exercice.n1, exercice.n2, exercice.k, exercice.avecRemise);
  const p2 = probMemeCouleur(exercice.n2, exercice.n1, exercice.k, exercice.avecRemise);
  return diagnostiquerValeur(valeurs[0], p1 + p2, TOLERANCE);
}

/** Écran 3 — `valeurs = [valeur]`, P("exactement m boules de couleur 1"). */
export function diagnostiquerAEcran3(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], probExactementM(exercice), TOLERANCE);
}

// ============================================================================
// Famille B — Permutations et dérangements.
// ============================================================================

/** Table des dérangements — voir `generateurs6e/tiragesArbres/familleB.ts` pour la justification
 * complète (D(0..4) fournis par la spec, D(5)=44 ajouté — nécessaire à l'écran 4 pour n=5).
 * DUPLIQUÉE ici (jamais importée de `generateurs6e/`, règle non négociable — voir en-tête de
 * fichier). */
const DERANGEMENTS: readonly number[] = [1, 0, 1, 2, 9, 44];

function derangement(n: number): number {
  return DERANGEMENTS[n];
}

/** Écran 1 — `valeurs = [valeur]`. P(une position fixée) = 1/n ; P(deux positions fixées) =
 * (n-2)!/n!. */
export function diagnostiquerBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  const cible = exercice.demandeEcran1 === "une" ? factorielle(exercice.n - 1) / factorielle(exercice.n) : factorielle(exercice.n - 2) / factorielle(exercice.n);
  return diagnostiquerValeur(valeurs[0], cible, TOLERANCE);
}

/** Écran 2 — `valeurs = [valeur]`. P(arrangement entièrement correct) = 1/n!. */
export function diagnostiquerBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], 1 / factorielle(exercice.n), TOLERANCE);
}

/** Écran 3 — `valeurs = [valeur]`. P(exactement k positions correctes) = C(n,k)·D(n-k)/n! — piège :
 * les n-k positions restantes doivent former un DÉRANGEMENT COMPLET (aucune correcte parmi elles),
 * jamais un simple "au moins une incorrecte" ou une absence de contrainte (spec). */
export function diagnostiquerBEcran3(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  const cible = (coefficientBinomial(exercice.n, exercice.k) * derangement(exercice.n - exercice.k)) / factorielle(exercice.n);
  return diagnostiquerValeur(valeurs[0], cible, TOLERANCE);
}

/** Écran 4 — `valeurs = [valeur]`. P(aucune position correcte) = D(n)/n!. */
export function diagnostiquerBEcran4(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], derangement(exercice.n) / factorielle(exercice.n), TOLERANCE);
}

// ============================================================================
// Famille C — Distributions non uniformes, dé truqué.
// ============================================================================

/** Évalue `texte` avec `variables` — `null` sur toute erreur de syntaxe OU résultat non fini
 * (jamais une exception qui remonterait à l'appelant). */
function evaluerSafe(texte: string, variables: Record<string, number>): number | null {
  try {
    const v = evaluerExpressionExponentielle(texte, variables);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

const TOLERANCE_CIBLE_NULLE = 1e-6;
const TOLERANCE_RATIO = 1e-4;
const NOMBRE_MIN_POINTS_COMPARABLES = 3;

/** Vérifie qu'une ÉQUATION texte libre (`"gauche=droite"`) est algébriquement ÉQUIVALENTE à la
 * relation `cible(vars)=0` — accepte n'importe quelle reformulation (réordonnée, mise à l'échelle
 * par un facteur non nul, y compris négatif), même principe que
 * `verificationEquationCercle.ts`/`diagnostiquerEquivalenceQuadratiqueXY` (moteur→moteur du 4e,
 * PAS importée — chantiers indépendants, CLAUDE.md — mais même technique de vérification par
 * échantillonnage de plusieurs points, répliquée ici pour ce chantier). `echantillons` : plusieurs
 * jeux de valeurs `{variable: nombre}` — PAS nécessairement une solution du système (on teste
 * l'IDENTITÉ algébrique de l'équation, pas sa résolution). */
function diagnostiquerEquationSymbolique(texte: string, echantillons: Record<string, number>[], cible: (vars: Record<string, number>) => number): StatutVerification {
  const indexEgal = texte.indexOf("=");
  if (indexEgal === -1) return "parse_error";
  const gauche = texte.slice(0, indexEgal);
  const droite = texte.slice(indexEgal + 1);

  const points: { soumis: number; cible: number }[] = [];
  for (const vars of echantillons) {
    const valeurCible = cible(vars);
    if (Math.abs(valeurCible) < TOLERANCE_CIBLE_NULLE) continue;
    const g = evaluerSafe(gauche, vars);
    const d = evaluerSafe(droite, vars);
    if (g === null || d === null) continue;
    points.push({ soumis: g - d, cible: valeurCible });
  }
  if (points.length < NOMBRE_MIN_POINTS_COMPARABLES) return "parse_error";

  const ratio = points[0]!.soumis / points[0]!.cible;
  if (!Number.isFinite(ratio) || Math.abs(ratio) < TOLERANCE_CIBLE_NULLE) return "not_equivalent";
  for (const { soumis, cible: valeurCible } of points) {
    if (Math.abs(soumis - ratio * valeurCible) > TOLERANCE_RATIO * Math.max(1, Math.abs(valeurCible))) return "not_equivalent";
  }
  return "correct";
}

const ECHANTILLONS_P = [0.02, 0.05, 0.09, 0.13, 0.17, 0.23, 0.29, 0.31, 0.37];
const ECHANTILLONS_PQ: readonly [number, number][] = [
  [0.05, 0.11],
  [0.13, 0.02],
  [0.21, 0.17],
  [0.33, 0.29],
  [0.41, 0.07],
  [0.19, 0.23],
];

function p0Valeur(ex: Extract<ExerciceFamilleC, { sousType: "special" }>): number {
  return ex.p0.num / ex.p0.den;
}
function pValeurSpecial(ex: Extract<ExerciceFamilleC, { sousType: "special" }>): number {
  return ex.p.num / ex.p.den;
}
function pValeurParite(ex: Extract<ExerciceFamilleC, { sousType: "parite" }>): number {
  return ex.p.num / ex.p.den;
}
function qValeurParite(ex: Extract<ExerciceFamilleC, { sousType: "parite" }>): number {
  return ex.q.num / ex.q.den;
}

/** Écran 1 — sous-type "special" : `valeurs = [équation somme totale]` ("a+5p=1" ou toute
 * reformulation équivalente ; `a` désigne P(faceSpéciale)=p0, un NOMBRE connu, substituable
 * littéralement ou laissé symbolique — les deux formes sont acceptées, `a` est de toute façon lié
 * dans `variables`). **`a` et non `p0`** — le tokeniseur d'`expressionExponentielle.ts` ne consomme
 * QUE des lettres dans un identifiant (`/[a-zA-Z]/`, jamais de chiffre après la première lettre) :
 * "p0" s'y tokenise comme l'identifiant "p" PUIS le nombre "0" (multiplication implicite,
 * "p0"→"p×0"), jamais comme un seul identifiant — piège trouvé par TDD (voir
 * `verificationTiragesArbres.test.ts`, rouge avant ce choix de nom), contourné en choisissant un nom
 * de variable sans chiffre plutôt qu'en touchant le tokeniseur partagé (chapitre 2, 6gen6-6gen19).
 * Sous-type "parite" : `valeurs = [équation contrainte p=r·q, équation somme totale 3p+3q=1]`,
 * TOUJOURS dans cet ordre (contrainte spécifique de l'énoncé PUIS somme totale). */
export function diagnostiquerCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "special") {
    const aVal = p0Valeur(exercice);
    const echantillons = ECHANTILLONS_P.map((p) => ({ p, a: aVal }));
    return diagnostiquerEquationSymbolique(valeurs[0], echantillons, (vars) => 5 * vars.p + vars.a - 1);
  }
  const r = exercice.r;
  const echantillons = ECHANTILLONS_PQ.map(([p, q]) => ({ p, q, r }));
  const statutContrainte = diagnostiquerEquationSymbolique(valeurs[0], echantillons, (vars) => vars.p - vars.r * vars.q);
  const statutSomme = diagnostiquerEquationSymbolique(valeurs[1], echantillons, (vars) => 3 * vars.p + 3 * vars.q - 1);
  return pireStatut(statutContrainte, statutSomme);
}

/** Écran 2 — sous-type "special" : `valeurs = [p]`. Sous-type "parite" : `valeurs = [p, q]`
 * (TOUJOURS dans cet ordre). */
export function diagnostiquerCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "special") {
    return diagnostiquerValeur(valeurs[0], pValeurSpecial(exercice), TOLERANCE);
  }
  return pireStatut(diagnostiquerValeur(valeurs[0], pValeurParite(exercice), TOLERANCE), diagnostiquerValeur(valeurs[1], qValeurParite(exercice), TOLERANCE));
}

/** Écran 3 — `valeurs = [valeur]`, probabilité composée à partir des valeurs CORRECTES de l'écran
 * 2 (jamais recalculée depuis la saisie élève). Sous-type "special" : P(faceSpeciale ∪ autreFace) =
 * p0+p. Sous-type "parite" : P(pair)=3p, P(impair)=3q, ou une probabilité sur `sousEnsemble`. */
export function diagnostiquerCEcran3(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "special") {
    return diagnostiquerValeur(valeurs[0], p0Valeur(exercice) + pValeurSpecial(exercice), TOLERANCE);
  }
  const pVal = pValeurParite(exercice);
  const qVal = qValeurParite(exercice);
  if (exercice.ecran3Cible === "pair") return diagnostiquerValeur(valeurs[0], 3 * pVal, TOLERANCE);
  if (exercice.ecran3Cible === "impair") return diagnostiquerValeur(valeurs[0], 3 * qVal, TOLERANCE);
  const faces = exercice.sousEnsemble ?? [];
  const cible = faces.reduce((acc, f) => acc + (f % 2 === 0 ? pVal : qVal), 0);
  return diagnostiquerValeur(valeurs[0], cible, TOLERANCE);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres, valeurs: string[]): StatutVerification {
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
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceFamilleC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceFamilleC, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceFamilleC, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}

// Réexport — quantités dérivées utiles à `ui6e/formatTiragesArbres.ts` (affichage/récapitulatif),
// jamais recalculées indépendamment là-bas (CLAUDE.md).
export { coefficientBinomial, derangement, factorielle, p0Valeur, pValeurParite, pValeurSpecial, probExactementM, probMemeCouleur, qValeurParite };
