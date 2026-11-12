import type { ExerciceFamilleA, ExerciceFamilleB, ExerciceFamilleC, ExerciceFamilleCParite, ExerciceFamilleCSpecial, ExerciceFamilleD, ExerciceTiragesArbres } from "../core6e/tiragesArbres.types";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseTiragesArbres } from "./typesTiragesArbres";
import { diagnostiquerProbabilite } from "./verificationProbabilites";

/**
 * Couche B (6e) — vérification propre à `6gen31` (tirages et arbres). N'importe JAMAIS rien de
 * `generateurs6e/` : toutes les quantités sont RECALCULÉES ici, par énumération des chemins de
 * l'arbre (familles A et D) ou des arrangements (famille B, n ≤ 5) — jamais par une formule de
 * dénombrement du chapitre suivant.
 *
 * **Toute probabilité saisie passe par `diagnostiquerProbabilite`** (audit 6e ch. 6, décision A) :
 * écriture exacte acceptée (fraction, produit, somme…), décimal accepté seulement s'il est
 * l'arrondi correct avec au moins 2 décimales (3 si la probabilité est inférieure à 0,1),
 * pourcentage accepté. L'ancienne tolérance absolue de 0,01 acceptait « 0 » pour 1/120.
 *
 * **Réutilisé par `6gen33`** (famille G) : `diagnostiquerBEcran1..4` et `diagnostiquerCEcran1..3`
 * (dé à 6 faces, sous-type "special", équation `a + 5p = 1` où `a` désigne P(face spéciale)) — les
 * champs optionnels absents redonnent l'ancien comportement (voir `core6e/tiragesArbres.types.ts`).
 *
 * Convention : chaque écran prend `string[]`, dans l'ordre des champs documenté sur sa fonction.
 */

function pireStatut(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

function factorielle(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

// ============================================================================
// Familles A et D — chemins d'un arbre de tirages dans une urne à 2 couleurs.
// ============================================================================

/** Probabilité d'un chemin (suite de couleurs 0/1) : produit des probabilités des branches. */
function probChemin(n1: number, n2: number, avecRemise: boolean, chemin: readonly number[]): number {
  let r1 = n1;
  let r2 = n2;
  let produit = 1;
  for (const c of chemin) {
    const total = r1 + r2;
    produit *= (c === 0 ? r1 : r2) / total;
    if (!avecRemise) {
      if (c === 0) r1--;
      else r2--;
    }
  }
  return produit;
}

/** Tous les chemins d'un arbre à k niveaux. */
function tousLesChemins(k: number): number[][] {
  let chemins: number[][] = [[]];
  for (let i = 0; i < k; i++) chemins = chemins.flatMap((c) => [[...c, 0], [...c, 1]]);
  return chemins;
}

/** Somme des chemins à `m` tirages de la couleur 0. */
function probExactementCouleur0(n1: number, n2: number, avecRemise: boolean, k: number, m: number): number {
  return tousLesChemins(k)
    .filter((c) => c.filter((x) => x === 0).length === m)
    .reduce((acc, c) => acc + probChemin(n1, n2, avecRemise, c), 0);
}

/** P(k tirages de la couleur d'effectif `nCouleur`, l'autre couleur ayant `nAutre`). */
function probMemeCouleur(nCouleur: number, nAutre: number, k: number, avecRemise: boolean): number {
  return probChemin(nCouleur, nAutre, avecRemise, new Array<number>(k).fill(0));
}

/** Écran 3 de la famille A : « exactement m » (somme de chemins) ou « au moins une » (contraire). */
function probEcran3A(ex: ExerciceFamilleA): number {
  if (ex.questionEcran3 === "auMoinsUne") return 1 - probMemeCouleur(ex.n2, ex.n1, ex.k, ex.avecRemise);
  return probExactementCouleur0(ex.n1, ex.n2, ex.avecRemise, ex.k, ex.m);
}

/** Écran 1 — `valeurs = [P(k couleur 1), P(k couleur 2)]`. */
export function diagnostiquerAEcran1(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  const p1 = probMemeCouleur(exercice.n1, exercice.n2, exercice.k, exercice.avecRemise);
  const p2 = probMemeCouleur(exercice.n2, exercice.n1, exercice.k, exercice.avecRemise);
  return pireStatut(diagnostiquerProbabilite(valeurs[0], p1), diagnostiquerProbabilite(valeurs[1], p2));
}

/** Écran 2 — `valeurs = [P(même couleur)]`. */
export function diagnostiquerAEcran2(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  const p1 = probMemeCouleur(exercice.n1, exercice.n2, exercice.k, exercice.avecRemise);
  const p2 = probMemeCouleur(exercice.n2, exercice.n1, exercice.k, exercice.avecRemise);
  return diagnostiquerProbabilite(valeurs[0], p1 + p2);
}

/** Écran 3 — `valeurs = [valeur]`. */
export function diagnostiquerAEcran3(exercice: ExerciceFamilleA, valeurs: string[]): StatutVerification {
  return diagnostiquerProbabilite(valeurs[0], probEcran3A(exercice));
}

/** Les 6 branches de l'arbre de la famille D, dans l'ordre des champs a…f : 1er tirage (couleur 1,
 * couleur 2), puis 2e tirage après la couleur 1 (couleur 1, couleur 2), puis après la couleur 2. */
function branchesD(ex: ExerciceFamilleD): number[] {
  const n = ex.n1 + ex.n2;
  if (ex.avecRemise) return [ex.n1 / n, ex.n2 / n, ex.n1 / n, ex.n2 / n, ex.n1 / n, ex.n2 / n];
  return [ex.n1 / n, ex.n2 / n, (ex.n1 - 1) / (n - 1), ex.n2 / (n - 1), ex.n1 / (n - 1), (ex.n2 - 1) / (n - 1)];
}

function cibleD(ex: ExerciceFamilleD, phase: "dEcran2" | "dEcran3" | "dEcran4"): number {
  if (phase === "dEcran2") return probChemin(ex.n1, ex.n2, ex.avecRemise, ex.chemin);
  if (phase === "dEcran3") return probChemin(ex.n1, ex.n2, ex.avecRemise, [0, 1]) + probChemin(ex.n1, ex.n2, ex.avecRemise, [1, 0]);
  const autre = ex.couleurCible === 0 ? 1 : 0;
  return 1 - probChemin(ex.n1, ex.n2, ex.avecRemise, [autre, autre]);
}

/** Écran D1 — `valeurs = [a, b, c, d, e, f]` (voir `branchesD`). */
export function diagnostiquerDEcran1(exercice: ExerciceFamilleD, valeurs: string[]): StatutVerification {
  const cibles = branchesD(exercice);
  return pireStatut(...cibles.map((c, i) => diagnostiquerProbabilite(valeurs[i] ?? "", c)));
}

/** Écrans D2 (chemin), D3 (exactement une), D4 (au moins une) — `valeurs = [valeur]`. */
export function diagnostiquerDEcranValeur(exercice: ExerciceFamilleD, phase: "dEcran2" | "dEcran3" | "dEcran4", valeurs: string[]): StatutVerification {
  return diagnostiquerProbabilite(valeurs[0], cibleD(exercice, phase));
}

// ============================================================================
// Famille B — arrangements au hasard de n objets numérotés (n ≤ 5 : énumération directe).
// ============================================================================

function permutations(n: number): number[][] {
  if (n === 0) return [[]];
  return permutations(n - 1).flatMap((p) => Array.from({ length: n }, (_, i) => [...p.slice(0, i), n - 1, ...p.slice(i)]));
}

/** Nombre d'arrangements dont le nombre d'objets bien placés vérifie `test`. */
function compterArrangements(n: number, test: (bienPlaces: number) => boolean): number {
  return permutations(n).filter((p) => test(p.filter((v, i) => v === i).length)).length;
}

/** Écran 1 — `valeurs = [valeur]`. Une position donnée : 1/n ; deux : 1/(n(n − 1)). */
export function diagnostiquerBEcran1(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  const cible = exercice.demandeEcran1 === "une" ? 1 / exercice.n : 1 / (exercice.n * (exercice.n - 1));
  return diagnostiquerProbabilite(valeurs[0], cible);
}

/** Écran 2 — `valeurs = [valeur]`. Tout bien placé : 1/n!. */
export function diagnostiquerBEcran2(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerProbabilite(valeurs[0], 1 / factorielle(exercice.n));
}

/** Écran 3 — `valeurs = [valeur]`. Exactement k bien placés. */
export function diagnostiquerBEcran3(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  return diagnostiquerProbabilite(valeurs[0], compterArrangements(exercice.n, (b) => b === exercice.k) / factorielle(exercice.n));
}

/** Écran 4 — `valeurs = [valeur]`. Aucun bien placé, ou (n = 5) au moins 3 bien placés. */
export function diagnostiquerBEcran4(exercice: ExerciceFamilleB, valeurs: string[]): StatutVerification {
  const test = exercice.demandeEcran4 === "auMoinsTrois" ? (b: number) => b >= 3 : (b: number) => b === 0;
  return diagnostiquerProbabilite(valeurs[0], compterArrangements(exercice.n, test) / factorielle(exercice.n));
}

// ============================================================================
// Famille C — dé truqué.
// ============================================================================

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

/** Une ÉQUATION libre (« gauche=droite ») est-elle équivalente à `cible(vars) = 0` ? Accepte toute
 * reformulation (réordonnée, multipliée par un facteur non nul) : on compare gauche − droite à
 * cible sur plusieurs points, à un facteur constant près. */
function diagnostiquerEquationSymbolique(texte: string, echantillons: Record<string, number>[], cible: (vars: Record<string, number>) => number): StatutVerification {
  const morceaux = texte.split("=");
  if (morceaux.length !== 2) return "parse_error";
  const [gauche, droite] = morceaux;
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

function valeur(f: { num: number; den: number }): number {
  return f.num / f.den;
}
function facesDe(ex: ExerciceFamilleC): number {
  return ex.faces ?? 6;
}

/** Probabilité de chaque face du dé, faces 1..N. */
function probabilitesFaces(ex: ExerciceFamilleC): number[] {
  const n = facesDe(ex);
  return Array.from({ length: n }, (_, i) => {
    const face = i + 1;
    if (ex.sousType === "special") return face === ex.faceSpeciale ? valeur(ex.p0) : valeur(ex.p);
    return face % 2 === 0 ? valeur(ex.p) : valeur(ex.q);
  });
}

function probFaces(ex: ExerciceFamilleC, test: (face: number) => boolean): number {
  return probabilitesFaces(ex).reduce((acc, p, i) => (test(i + 1) ? acc + p : acc), 0);
}

/** Écran 1. Sous-type "special" : `valeurs = [équation de normalisation]`, en p (la probabilité
 * connue s'écrit en nombre ; la lettre `a` reste acceptée pour 6gen33). Sous-type "parite" :
 * `valeurs = [équation, équation]`, DANS N'IMPORTE QUEL ORDRE (relation traduite de la phrase,
 * équation de normalisation). */
export function diagnostiquerCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  const n = facesDe(exercice);
  if (exercice.sousType === "special") {
    const aVal = valeur(exercice.p0);
    const echantillons = ECHANTILLONS_P.map((p) => ({ p, a: aVal }));
    return diagnostiquerEquationSymbolique(valeurs[0], echantillons, (vars) => (n - 1) * vars.p + vars.a - 1);
  }
  const h = n / 2;
  const r = exercice.r;
  const echantillons = ECHANTILLONS_PQ.map(([p, q]) => ({ p, q }));
  const relation = (texte: string) =>
    diagnostiquerEquationSymbolique(texte, echantillons, (v) => ((exercice.plusProbable ?? "pair") === "pair" ? v.p - r * v.q : v.q - r * v.p));
  const somme = (texte: string) => diagnostiquerEquationSymbolique(texte, echantillons, (v) => h * v.p + h * v.q - 1);
  const ordre1 = pireStatut(relation(valeurs[0]), somme(valeurs[1]));
  const ordre2 = pireStatut(somme(valeurs[0]), relation(valeurs[1]));
  if (ordre1 === "correct" || ordre2 === "correct") return "correct";
  return ordre1 === "parse_error" && ordre2 === "parse_error" ? "parse_error" : "not_equivalent";
}

/** Écran 2 — "special" : `valeurs = [p]` ; "parite" : `valeurs = [p, q]`. */
export function diagnostiquerCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  if (exercice.sousType === "special") return diagnostiquerProbabilite(valeurs[0], valeur(exercice.p));
  return pireStatut(diagnostiquerProbabilite(valeurs[0], valeur(exercice.p)), diagnostiquerProbabilite(valeurs[1], valeur(exercice.q)));
}

function cibleCEcran3(ex: ExerciceFamilleC): number {
  if (ex.sousType === "special") {
    const cible = ex.ecran3Cible ?? "deuxFaces";
    if (cible === "pair") return probFaces(ex, (f) => f % 2 === 0);
    if (cible === "impair") return probFaces(ex, (f) => f % 2 === 1);
    return valeur(ex.p0) + valeur(ex.p);
  }
  if (ex.ecran3Cible === "pair") return probFaces(ex, (f) => f % 2 === 0);
  if (ex.ecran3Cible === "impair") return probFaces(ex, (f) => f % 2 === 1);
  const faces = ex.sousEnsemble ?? [];
  return probFaces(ex, (f) => faces.includes(f));
}

/** Écran 3 — `valeurs = [valeur]`. */
export function diagnostiquerCEcran3(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  return diagnostiquerProbabilite(valeurs[0], cibleCEcran3(exercice));
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
    case "dEcran1":
      return diagnostiquerDEcran1(exercice as ExerciceFamilleD, valeurs);
    case "dEcran2":
    case "dEcran3":
    case "dEcran4":
      return diagnostiquerDEcranValeur(exercice as ExerciceFamilleD, phase, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}

/** Valeur(s) EXACTE(S) attendue(s) à un écran de probabilité (nombres) — sert à l'annonce de
 * précision des champs (centième ou millième selon la valeur, même règle que
 * `diagnostiquerProbabilite`) et aux tests. `null` pour un écran d'équations (C1). */
export function ciblesEcran(exercice: ExerciceTiragesArbres, phase: PhaseTiragesArbres): number[] | null {
  switch (exercice.famille) {
    case "A": {
      const p1 = probMemeCouleur(exercice.n1, exercice.n2, exercice.k, exercice.avecRemise);
      const p2 = probMemeCouleur(exercice.n2, exercice.n1, exercice.k, exercice.avecRemise);
      if (phase === "aEcran1") return [p1, p2];
      if (phase === "aEcran2") return [p1 + p2];
      return [probEcran3A(exercice)];
    }
    case "B": {
      const n = exercice.n;
      if (phase === "bEcran1") return [exercice.demandeEcran1 === "une" ? 1 / n : 1 / (n * (n - 1))];
      if (phase === "bEcran2") return [1 / factorielle(n)];
      if (phase === "bEcran3") return [compterArrangements(n, (b) => b === exercice.k) / factorielle(n)];
      return [compterArrangements(n, exercice.demandeEcran4 === "auMoinsTrois" ? (b) => b >= 3 : (b) => b === 0) / factorielle(n)];
    }
    case "C":
      if (phase === "cEcran1") return null;
      if (phase === "cEcran2") return exercice.sousType === "special" ? [valeur(exercice.p)] : [valeur(exercice.p), valeur(exercice.q)];
      return [cibleCEcran3(exercice)];
    case "D":
      if (phase === "dEcran1") return branchesD(exercice);
      return [cibleD(exercice, phase as "dEcran2" | "dEcran3" | "dEcran4")];
  }
}

export type { ExerciceFamilleCParite, ExerciceFamilleCSpecial };
