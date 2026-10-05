/**
 * Couche B (5e) — vérification pour 5gen5 ("Problèmes-contexte"). Réutilise directement
 * `evaluerExpressionGenerale` (`src/moteur/expressionGenerale.ts`, import cross-chantier déjà
 * établi côté 5gen1-4) pour toute équivalence algébrique en x. `combinerStatuts` et la "convention
 * arrondie" (tolérance absolue ±0.5) sont RÉPLIQUÉS localement (jamais importés depuis
 * `src/moteur/verificationDroite.ts`/`verificationApplicationPhysique.ts`) — même principe que le
 * reste de la plateforme : seules de minuscules primitives génériques traversent la frontière de
 * chantier, jamais un module de vérification entier.
 */
import type { ExerciceScenarioA, ExerciceScenarioAConteneur, ExerciceScenarioB, ExerciceScenarioC, FormeChiffreAffairesC, FormeCoutVariableC, LigneTableauScenarioA, ModeleCoutUnitaire, PointRevele } from "../core5e/problemesContexte.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";

/** Sous-ensemble réduit de `ExerciceScenarioA` (combos 2-5, jamais le combo "kInverseXAxCarre"). */
type ExerciceScenarioAReduit = Exclude<ExerciceScenarioA, { combo: "kInverseXAxCarre" }>;

/** Répliqué depuis `moteur/verificationApplicationPhysique.ts::diagnostiquerCalculArrondi` — voir
 * CLAUDE.md, section gen29 : "répliquer ce patron... plutôt que d'inventer une troisième
 * convention". Tolérance absolue fixe, accepte indifféremment une réponse arrondie ou plus précise. */
export const TOLERANCE_ARRONDI = 0.5;

// ============================================================================
// Petites fonctions pures DUPLIQUÉES depuis `generateurs5e/problemesContexte/scenarioA.ts` et
// `scenarioC.ts` — `src/moteur5e/` n'importe JAMAIS `src/generateurs5e/` (règle d'architecture non
// négociable, même principe que `evaluerQuadratiqueLocal` de gen55 côté 4e).
// ============================================================================

function hauteurCylindreLocal(volumeCm3: number, r: number): number {
  return volumeCm3 / (Math.PI * r * r);
}
function aireBasesCylindreLocal(r: number): number {
  return 2 * Math.PI * r * r;
}
function aireLateraleCylindreLocal(volumeCm3: number, r: number): number {
  return (2 * volumeCm3) / r;
}
/** Coefficients de a/b dans F(x)=a·coeffA(x)+b·coeffB(x) (coût TOTAL), par modèle — répliqué depuis
 * `generateurs5e/problemesContexte/scenarioB.ts`. Cette seule paire couvre les 5 modèles B1-B5. */
function coeffALocal(modele: ModeleCoutUnitaire, x: number): number {
  switch (modele) {
    case "B1":
      return x;
    case "B2":
      return x;
    case "B3":
      return x;
    case "B4":
      return 1;
    case "B5":
      return x * x;
  }
}
function coeffBLocal(modele: ModeleCoutUnitaire, x: number): number {
  switch (modele) {
    case "B1":
      return 1;
    case "B2":
      return x * x;
    case "B3":
      return 1 / x;
    case "B4":
      return 1 / x;
    case "B5":
      return 1;
  }
}
function coutTotalBLocal(modele: ModeleCoutUnitaire, a: number, b: number, x: number): number {
  return a * coeffALocal(modele, x) + b * coeffBLocal(modele, x);
}

function coutVariableLocal(formeCV: FormeCoutVariableC, k: number, x: number): number {
  switch (formeCV) {
    case "racineCarree":
      return k * Math.sqrt(x);
    case "racineCubique":
      return k * Math.cbrt(x);
    case "carre":
      return k * x * x;
    case "cube":
      return k * x * x * x;
  }
}
function coutProportionnelLocal(m: number, x: number): number {
  return m * x;
}
function coutTotalLocal(cf: number, formeCV: FormeCoutVariableC, k: number, m: number, x: number): number {
  return cf + coutVariableLocal(formeCV, k, x) + coutProportionnelLocal(m, x);
}
function chiffreAffairesLocal(formeCA: FormeChiffreAffairesC, p: number, x: number): number {
  switch (formeCA) {
    case "affine":
      return p * x;
    case "racineCarree":
      return p * Math.sqrt(x);
    case "racineCubique":
      return p * Math.cbrt(x);
  }
}
function beneficeLocal(cf: number, formeCV: FormeCoutVariableC, k: number, m: number, formeCA: FormeChiffreAffairesC, p: number, x: number): number {
  return chiffreAffairesLocal(formeCA, p, x) - coutTotalLocal(cf, formeCV, k, m, x);
}

/** Tolérance élargie pour toute LECTURE GRAPHIQUE ou estimation (jamais un calcul exact) —
 * relative (10%) + plancher absolu (1.5), pour rester généreux aussi bien sur une petite grandeur
 * (rayon en cm) qu'une grande (quantité de production). */
function toleranceLarge(cible: number): number {
  return Math.max(1.5, Math.abs(cible) * 0.1);
}

function statutNumerique(valeur: number, cible: number, tolerance: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
}

export function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

const POINTS_ECHANTILLON_X = [1, 2, 3, 5, 8];

/** Équivalence algébrique en x, réutilise `evaluerExpressionGenerale` — les mots fournis
 * (typiquement "V", insensible à la casse) sont résolus NATIVEMENT pendant la tokenisation, via le
 * paramètre `variables` (audit implicite-multiplication-variable-nommée : généralisation de la
 * reconnaissance déjà en place pour "pi", voir `expressionGenerale.ts`). "pi" n'a plus besoin de
 * figurer dans `substitutions` : `evaluerExpressionGenerale` le reconnaît nativement, y compris
 * collé à un coefficient ("3pi"). Avant ce correctif, `substitutions` était pré-substitué par regex
 * `\b...\b` AVANT tokenisation — cassait silencieusement "3V" (`\b` ne matche jamais entre un
 * chiffre et une lettre) et "3.pi" (le point décimal doublé une fois substitué) ; utiliser
 * `variables` élimine les deux à la fois, sans code de substitution dédié. Le "V" symbolique et sa
 * résolution numérique restent, eux, mathématiquement indiscernables par échantillonnage — c'est
 * pédagogiquement voulu, voir CLAUDE.md section 5gen5. */
function diagnostiquerEquivalenceEnX(texte: string, cible: (x: number) => number, variables: Record<string, number> = {}): StatutVerification {
  try {
    for (const x of POINTS_ECHANTILLON_X) {
      const valeur = evaluerExpressionGenerale(texte, x, variables);
      if (!Number.isFinite(valeur)) return "parse_error";
      if (Math.abs(valeur - cible(x)) > 1e-4) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

/** Évalue une expression LIBRE en (a,b) (système d'équations, scénario B) — "a"/"b" résolus
 * NATIVEMENT via le paramètre `variables` de `evaluerExpressionGenerale`, jamais par pré-
 * substitution textuelle regex `\ba\b`/`\bb\b` (bug historique : `\b` ne matche jamais entre un
 * chiffre et une lettre, donc une saisie élève naturelle comme "3a-2b=5" — coefficient collé à la
 * lettre, sans "*" — n'était JAMAIS substituée et échouait en `parse_error`, "Identifiant inconnu").
 * "a"/"b" bénéficient ainsi gratuitement de la multiplication implicite, exactement comme "pi". */
function evaluerExpressionAB(texte: string, a: number, b: number): number {
  return evaluerExpressionGenerale(texte, 0, { a, b });
}

/**
 * Vérifie qu'une équation LIBRE à 2 inconnues (a,b) représente la MÊME droite (dans le plan a-b)
 * que la relation de référence `coeffARef·a + coeffBRef·b + constanteRef = 0`. Extrait les
 * coefficients de `gauche(a,b)-droite(a,b)` par différences finies (3 échantillons), vérifie la
 * linéarité sur 2 points supplémentaires (rejette toute expression non affine en a/b), puis compare
 * à la référence à un facteur d'échelle près (ancré sur le coefficient de b, toujours -1 côté
 * référence donc jamais nul).
 */
function diagnostiquerEquationLineaireAB(texte: string, coeffARef: number, coeffBRef: number, constanteRef: number): StatutVerification {
  const indexEgal = texte.indexOf("=");
  if (indexEgal === -1) return "parse_error";
  const gauche = texte.slice(0, indexEgal);
  const droite = texte.slice(indexEgal + 1);
  try {
    const diff = (a: number, b: number) => evaluerExpressionAB(gauche, a, b) - evaluerExpressionAB(droite, a, b);
    const c0 = diff(0, 0);
    const coeffA = diff(1, 0) - c0;
    const coeffB = diff(0, 1) - c0;
    if (![c0, coeffA, coeffB].every(Number.isFinite)) return "parse_error";
    for (const [a, b] of [
      [2, 3],
      [-1, 4],
    ] as const) {
      const predit = coeffA * a + coeffB * b + c0;
      const reel = diff(a, b);
      if (!Number.isFinite(reel)) return "parse_error";
      if (Math.abs(predit - reel) > 1e-4) return "not_equivalent";
    }
    const k = coeffB / coeffBRef;
    if (!Number.isFinite(k) || Math.abs(k) < 1e-9) return "not_equivalent";
    const memeCoeffA = Math.abs(coeffA - k * coeffARef) < 1e-3;
    const memeConstante = Math.abs(c0 - k * constanteRef) < 1e-3;
    return memeCoeffA && memeConstante ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

// ============================================================================
// Scénario A
// ============================================================================

export interface LigneReponseTableauA {
  h: number;
  aireBases: number;
  aireLaterale: number;
}
export type ReponseTableauA = LigneReponseTableauA[];

export function diagnostiquerTableauA(exercice: ExerciceScenarioAConteneur, reponse: ReponseTableauA): StatutVerification {
  if (reponse.length !== exercice.lignesTableau.length) return "parse_error";
  const statuts = exercice.lignesTableau.flatMap((ligne: LigneTableauScenarioA, i: number) => {
    const r = reponse[i];
    return [
      statutNumerique(r.h, ligne.hAttendu, TOLERANCE_ARRONDI),
      statutNumerique(r.aireBases, ligne.aireBasesAttendue, TOLERANCE_ARRONDI),
      statutNumerique(r.aireLaterale, ligne.aireLateraleAttendue, TOLERANCE_ARRONDI),
    ];
  });
  return combinerStatuts(...statuts);
}
export function verifierTableauA(exercice: ExerciceScenarioAConteneur, reponse: ReponseTableauA): boolean {
  return diagnostiquerTableauA(exercice, reponse) === "correct";
}

export interface ReponseGeneralisationA {
  h: string;
  f: string;
  g: string;
}

/** Champs h/f/g diagnostiqués INDÉPENDAMMENT (A.2, is-erronee par champ) — `diagnostiquerGeneralisationA`
 * les combine pour le score global, jamais l'inverse. */
export function diagnostiquerHGeneralisationA(exercice: ExerciceScenarioAConteneur, h: string): StatutVerification {
  const v = exercice.volumeCm3;
  return diagnostiquerEquivalenceEnX(h, (x) => hauteurCylindreLocal(v, x), { V: v });
}
export function diagnostiquerFGeneralisationA(exercice: ExerciceScenarioAConteneur, f: string): StatutVerification {
  const v = exercice.volumeCm3;
  return diagnostiquerEquivalenceEnX(f, (x) => aireLateraleCylindreLocal(v, x), { V: v });
}
/** `exercice` non utilisé (aireBasesCylindreLocal ne dépend que de x) — conservé dans la signature
 * pour l'uniformité avec `diagnostiquerHGeneralisationA`/`diagnostiquerFGeneralisationA`
 * (3 fonctions sœurs appelées de façon interchangeable par champ). */
export function diagnostiquerGGeneralisationA(_exercice: ExerciceScenarioAConteneur, g: string): StatutVerification {
  return diagnostiquerEquivalenceEnX(g, (x) => aireBasesCylindreLocal(x));
}

export function diagnostiquerGeneralisationA(exercice: ExerciceScenarioAConteneur, reponse: ReponseGeneralisationA): StatutVerification {
  return combinerStatuts(
    diagnostiquerHGeneralisationA(exercice, reponse.h),
    diagnostiquerFGeneralisationA(exercice, reponse.f),
    diagnostiquerGGeneralisationA(exercice, reponse.g),
  );
}
export function verifierGeneralisationA(exercice: ExerciceScenarioAConteneur, reponse: ReponseGeneralisationA): boolean {
  return diagnostiquerGeneralisationA(exercice, reponse) === "correct";
}

export function diagnostiquerEgaliteAiresA(exercice: ExerciceScenarioAConteneur, reponse: number): StatutVerification {
  return statutNumerique(reponse, exercice.xEgaliteAires, TOLERANCE_ARRONDI);
}
export function verifierEgaliteAiresA(exercice: ExerciceScenarioAConteneur, reponse: number): boolean {
  return diagnostiquerEgaliteAiresA(exercice, reponse) === "correct";
}

export function diagnostiquerGraphiqueA(exercice: ExerciceScenarioAConteneur, reponse: number): StatutVerification {
  return statutNumerique(reponse, exercice.xOptimal, toleranceLarge(exercice.xOptimal));
}
export function verifierGraphiqueA(exercice: ExerciceScenarioAConteneur, reponse: number): boolean {
  return diagnostiquerGraphiqueA(exercice, reponse) === "correct";
}

export interface ReponseJustificationA {
  h: number;
}

/** `xOptimalRetenu` = la valeur RETENUE par continuité (réponse de l'élève à l'écran "graphique" si
 * correcte, sinon `exercice.xOptimal` en cas de révélation — voir `sessionProblemesContexte.ts`),
 * jamais recalculée depuis `exercice.xOptimal` directement : l'élève est jugé sur la cohérence avec
 * SA PROPRE lecture graphique, même principe de continuité que gen47 (4e). */
export function diagnostiquerJustificationA(exercice: ExerciceScenarioAConteneur, xOptimalRetenu: number, reponse: ReponseJustificationA): StatutVerification {
  const hAttendu = hauteurCylindreLocal(exercice.volumeCm3, xOptimalRetenu);
  return statutNumerique(reponse.h, hAttendu, TOLERANCE_ARRONDI);
}
export function verifierJustificationA(exercice: ExerciceScenarioAConteneur, xOptimalRetenu: number, reponse: ReponseJustificationA): boolean {
  return diagnostiquerJustificationA(exercice, xOptimalRetenu, reponse) === "correct";
}

/** Une cellule du tableau (A.2, is-erronee par champ) — mêmes cibles/tolérance que
 * `diagnostiquerTableauA`, jamais recalculées séparément. */
export function diagnostiquerCelluleTableauA(exercice: ExerciceScenarioAConteneur, index: number, champ: "h" | "aireBases" | "aireLaterale", valeur: number): StatutVerification {
  const ligne = exercice.lignesTableau[index];
  if (!ligne) return "parse_error";
  const cible = champ === "h" ? ligne.hAttendu : champ === "aireBases" ? ligne.aireBasesAttendue : ligne.aireLateraleAttendue;
  return statutNumerique(valeur, cible, TOLERANCE_ARRONDI);
}

// ============================================================================
// Scénario A, combos réduits (2-5) — f/g GÉNÉRIQUES sur les 4 combos via `fDeXLocal`/`gDeXLocal`
// (répliqué depuis `generateurs5e/problemesContexte/scenarioA.ts`, jamais importé).
// ============================================================================

function fDeXLocal(exercice: ExerciceScenarioAReduit, x: number): number {
  switch (exercice.combo) {
    case "stockCommande":
      return exercice.a * x + exercice.b;
    case "racineAffine":
      return exercice.k * Math.sqrt(x);
    case "intensiteCable":
      return exercice.k / (x * x);
    case "deuxParaboles":
      return exercice.a1 * x * x + exercice.b1 * x + exercice.c1;
  }
}
function gDeXLocal(exercice: ExerciceScenarioAReduit, x: number): number {
  switch (exercice.combo) {
    case "stockCommande":
      return exercice.k / x;
    case "racineAffine":
      return exercice.b - exercice.a * x;
    case "intensiteCable":
      return exercice.a * x;
    case "deuxParaboles":
      return exercice.a2 * x * x + exercice.b2 * x + exercice.c2;
  }
}

export interface ReponseGeneralisationSimpleA {
  f: string;
  g: string;
}

/** Champs f/g diagnostiqués INDÉPENDAMMENT (A.2, is-erronee par champ) — `diagnostiquerGeneralisationSimpleA`
 * les combine pour le score global, jamais l'inverse. Aucune substitution symbolique nécessaire (les
 * coefficients de `exercice` sont déjà des nombres concrets, contrairement au V symbolique du combo
 * de référence). */
export function diagnostiquerFGeneralisationSimpleA(exercice: ExerciceScenarioAReduit, f: string): StatutVerification {
  return diagnostiquerEquivalenceEnX(f, (x) => fDeXLocal(exercice, x));
}
export function diagnostiquerGGeneralisationSimpleA(exercice: ExerciceScenarioAReduit, g: string): StatutVerification {
  return diagnostiquerEquivalenceEnX(g, (x) => gDeXLocal(exercice, x));
}
export function diagnostiquerGeneralisationSimpleA(exercice: ExerciceScenarioAReduit, reponse: ReponseGeneralisationSimpleA): StatutVerification {
  return combinerStatuts(diagnostiquerFGeneralisationSimpleA(exercice, reponse.f), diagnostiquerGGeneralisationSimpleA(exercice, reponse.g));
}
export function verifierGeneralisationSimpleA(exercice: ExerciceScenarioAReduit, reponse: ReponseGeneralisationSimpleA): boolean {
  return diagnostiquerGeneralisationSimpleA(exercice, reponse) === "correct";
}

/** x tel que f(x)=g(x) — calcul exact (algèbre), tolérance stricte comme `diagnostiquerEgaliteAiresA`. */
export function diagnostiquerIntersectionSimpleA(exercice: ExerciceScenarioAReduit, reponse: number): StatutVerification {
  return statutNumerique(reponse, exercice.xIntersection, TOLERANCE_ARRONDI);
}
export function verifierIntersectionSimpleA(exercice: ExerciceScenarioAReduit, reponse: number): boolean {
  return diagnostiquerIntersectionSimpleA(exercice, reponse) === "correct";
}

/** x qui atteint l'extremum de (f+g) — lecture graphique, tolérance large comme `diagnostiquerGraphiqueA`. */
export function diagnostiquerExtremumSimpleA(exercice: ExerciceScenarioAReduit, reponse: number): StatutVerification {
  return statutNumerique(reponse, exercice.xExtremum, toleranceLarge(exercice.xExtremum));
}
export function verifierExtremumSimpleA(exercice: ExerciceScenarioAReduit, reponse: number): boolean {
  return diagnostiquerExtremumSimpleA(exercice, reponse) === "correct";
}

// ============================================================================
// Scénario B
// ============================================================================

export interface ReponseSystemeB {
  equation1: string;
  equation2: string;
}

/** F(xi) = a·coeffA(xi)+b·coeffB(xi) = cu(xi)·xi  ⟺  a·coeffA(xi)+b·coeffB(xi) - cu(xi)·xi = 0 —
 * généralise l'ancien câblage en dur sur la seule forme cu(x)=a+b/x (B1) aux 5 modèles. */
function coeffsReferenceEquationB(modele: ModeleCoutUnitaire, point: PointRevele): { coeffA: number; coeffB: number; constante: number } {
  return { coeffA: coeffALocal(modele, point.x), coeffB: coeffBLocal(modele, point.x), constante: -point.coutUnitaire * point.x };
}

/** Une équation diagnostiquée INDÉPENDAMMENT (A.2, is-erronee par champ) — `diagnostiquerSystemeB`
 * les combine pour le score global, jamais l'inverse. */
export function diagnostiquerEquation1SystemeB(exercice: ExerciceScenarioB, texte: string): StatutVerification {
  const ref1 = coeffsReferenceEquationB(exercice.modele, exercice.point1);
  return diagnostiquerEquationLineaireAB(texte, ref1.coeffA, ref1.coeffB, ref1.constante);
}
export function diagnostiquerEquation2SystemeB(exercice: ExerciceScenarioB, texte: string): StatutVerification {
  const ref2 = coeffsReferenceEquationB(exercice.modele, exercice.point2);
  return diagnostiquerEquationLineaireAB(texte, ref2.coeffA, ref2.coeffB, ref2.constante);
}
export function diagnostiquerSystemeB(exercice: ExerciceScenarioB, reponse: ReponseSystemeB): StatutVerification {
  return combinerStatuts(diagnostiquerEquation1SystemeB(exercice, reponse.equation1), diagnostiquerEquation2SystemeB(exercice, reponse.equation2));
}
export function verifierSystemeB(exercice: ExerciceScenarioB, reponse: ReponseSystemeB): boolean {
  return diagnostiquerSystemeB(exercice, reponse) === "correct";
}

export interface ReponseResolutionB {
  a: number;
  b: number;
}

export function diagnostiquerAResolutionB(exercice: ExerciceScenarioB, a: number): StatutVerification {
  return statutNumerique(a, exercice.aArrondiAttendu, TOLERANCE_ARRONDI);
}
export function diagnostiquerBResolutionB(exercice: ExerciceScenarioB, b: number): StatutVerification {
  return statutNumerique(b, exercice.bArrondiAttendu, TOLERANCE_ARRONDI);
}
export function verifierResolutionB(exercice: ExerciceScenarioB, reponse: ReponseResolutionB): boolean {
  return diagnostiquerAResolutionB(exercice, reponse.a) === "correct" && diagnostiquerBResolutionB(exercice, reponse.b) === "correct";
}

/** `aRetenu`/`bRetenu` = valeurs RETENUES par continuité (voir `sessionProblemesContexte.ts`) —
 * l'attendu des écrans "formule"/"evaluation" se construit à partir d'elles, jamais directement
 * depuis `exercice.aArrondiAttendu`/`bArrondiAttendu`. Générique sur les 5 modèles via
 * `coutTotalBLocal`. */
export function diagnostiquerFormuleB(reponse: string, modele: ModeleCoutUnitaire, aRetenu: number, bRetenu: number): StatutVerification {
  return diagnostiquerEquivalenceEnX(reponse, (x) => coutTotalBLocal(modele, aRetenu, bRetenu, x));
}
export function verifierFormuleB(reponse: string, modele: ModeleCoutUnitaire, aRetenu: number, bRetenu: number): boolean {
  return diagnostiquerFormuleB(reponse, modele, aRetenu, bRetenu) === "correct";
}

export interface ReponseEvaluationB {
  f1: number;
  f2: number;
}

export function diagnostiquerF1EvaluationB(exercice: ExerciceScenarioB, aRetenu: number, bRetenu: number, f1: number): StatutVerification {
  return statutNumerique(f1, coutTotalBLocal(exercice.modele, aRetenu, bRetenu, exercice.xEval1), TOLERANCE_ARRONDI);
}
export function diagnostiquerF2EvaluationB(exercice: ExerciceScenarioB, aRetenu: number, bRetenu: number, f2: number): StatutVerification {
  return statutNumerique(f2, coutTotalBLocal(exercice.modele, aRetenu, bRetenu, exercice.xEval2), TOLERANCE_ARRONDI);
}
export function verifierEvaluationB(exercice: ExerciceScenarioB, aRetenu: number, bRetenu: number, reponse: ReponseEvaluationB): boolean {
  return (
    diagnostiquerF1EvaluationB(exercice, aRetenu, bRetenu, reponse.f1) === "correct" && diagnostiquerF2EvaluationB(exercice, aRetenu, bRetenu, reponse.f2) === "correct"
  );
}

// ============================================================================
// Scénario C
// ============================================================================

export interface ReponseLectureC {
  cf: number;
  cv: number;
  cp: number;
  ct: number;
}

/** Un champ diagnostiqué INDÉPENDAMMENT (A.2, is-erronee par champ) — `diagnostiquerLectureC` les
 * combine pour le score global, jamais l'inverse. */
export function diagnostiquerCfLectureC(exercice: ExerciceScenarioC, cf: number): StatutVerification {
  return statutNumerique(cf, exercice.cf, TOLERANCE_ARRONDI);
}
export function diagnostiquerCvLectureC(exercice: ExerciceScenarioC, cv: number): StatutVerification {
  return statutNumerique(cv, coutVariableLocal(exercice.formeCV, exercice.k, exercice.xLecture), TOLERANCE_ARRONDI);
}
export function diagnostiquerCpLectureC(exercice: ExerciceScenarioC, cp: number): StatutVerification {
  return statutNumerique(cp, coutProportionnelLocal(exercice.m, exercice.xLecture), TOLERANCE_ARRONDI);
}
export function diagnostiquerCtLectureC(exercice: ExerciceScenarioC, ct: number): StatutVerification {
  return statutNumerique(ct, coutTotalLocal(exercice.cf, exercice.formeCV, exercice.k, exercice.m, exercice.xLecture), TOLERANCE_ARRONDI);
}
export function diagnostiquerLectureC(exercice: ExerciceScenarioC, reponse: ReponseLectureC): StatutVerification {
  return combinerStatuts(
    diagnostiquerCfLectureC(exercice, reponse.cf),
    diagnostiquerCvLectureC(exercice, reponse.cv),
    diagnostiquerCpLectureC(exercice, reponse.cp),
    diagnostiquerCtLectureC(exercice, reponse.ct),
  );
}
export function verifierLectureC(exercice: ExerciceScenarioC, reponse: ReponseLectureC): boolean {
  return diagnostiquerLectureC(exercice, reponse) === "correct";
}

/** Piège de conversion d'unité (spec explicite) : CT est en MILLIERS d'euros, CM doit être en
 * EUROS — ×1000 avant de diviser par x. */
export function diagnostiquerCoutMoyenC(exercice: ExerciceScenarioC, reponse: number): StatutVerification {
  const ct = coutTotalLocal(exercice.cf, exercice.formeCV, exercice.k, exercice.m, exercice.xLecture);
  const cmAttendu = (ct * 1000) / exercice.xLecture;
  return statutNumerique(reponse, cmAttendu, TOLERANCE_ARRONDI);
}
export function verifierCoutMoyenC(exercice: ExerciceScenarioC, reponse: number): boolean {
  return diagnostiquerCoutMoyenC(exercice, reponse) === "correct";
}

export interface ReponseReconnaissanceC {
  cv: string;
  cp: string;
}

export function diagnostiquerCvReconnaissanceC(exercice: ExerciceScenarioC, cv: string): StatutVerification {
  return diagnostiquerEquivalenceEnX(cv, (x) => coutVariableLocal(exercice.formeCV, exercice.k, x));
}
export function diagnostiquerCpReconnaissanceC(exercice: ExerciceScenarioC, cp: string): StatutVerification {
  return diagnostiquerEquivalenceEnX(cp, (x) => coutProportionnelLocal(exercice.m, x));
}
export function diagnostiquerReconnaissanceC(exercice: ExerciceScenarioC, reponse: ReponseReconnaissanceC): StatutVerification {
  return combinerStatuts(diagnostiquerCvReconnaissanceC(exercice, reponse.cv), diagnostiquerCpReconnaissanceC(exercice, reponse.cp));
}
export function verifierReconnaissanceC(exercice: ExerciceScenarioC, reponse: ReponseReconnaissanceC): boolean {
  return diagnostiquerReconnaissanceC(exercice, reponse) === "correct";
}

export function diagnostiquerBeneficeC(exercice: ExerciceScenarioC, reponse: number): StatutVerification {
  const attendu = beneficeLocal(exercice.cf, exercice.formeCV, exercice.k, exercice.m, exercice.formeCA, exercice.p, exercice.xBenefice);
  return statutNumerique(reponse, attendu, TOLERANCE_ARRONDI);
}
export function verifierBeneficeC(exercice: ExerciceScenarioC, reponse: number): boolean {
  return diagnostiquerBeneficeC(exercice, reponse) === "correct";
}

export function diagnostiquerSeuilC(exercice: ExerciceScenarioC, reponse: number): StatutVerification {
  return statutNumerique(reponse, exercice.xSeuil, toleranceLarge(exercice.xSeuil));
}
export function verifierSeuilC(exercice: ExerciceScenarioC, reponse: number): boolean {
  return diagnostiquerSeuilC(exercice, reponse) === "correct";
}
