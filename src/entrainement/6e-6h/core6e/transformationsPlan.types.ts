import type { AngleRemarquable } from "./formeTrigonometrique.types";

/**
 * Couche core (6e) — contrat pour `6gen40` ("Transformations du plan via les nombres complexes",
 * chapitre 7 "Nombres complexes"). 3 familles (A, B, C), tirage ÉQUIPROBABLE de la famille — voir
 * `generateurs6e/transformationsPlan/index.ts`.
 *
 * Fichier SPÉCIFIQUE à ce générateur (même convention que `nombresComplexes.types.ts`/6gen34,
 * `formeTrigonometrique.types.ts`/6gen37 — jamais un contrat chapitre-7 partagé). `AngleRemarquable`
 * réutilisé TEL QUEL depuis `core6e/formeTrigonometrique.types.ts` (6gen37) — même convention
 * "argument principal dans (-π;π]", aucune raison de le redéclarer.
 *
 * ============================================================================
 * **`AffixeEntiere` — TOUJOURS un couple d'entiers exacts, jamais de radical**
 * ============================================================================
 * `moteur6e/expressionComplexe.ts` (fondation chapitre 7, `6gen34`) n'a AUCUNE fonction `sqrt` dans
 * sa grammaire — tout champ "affixe a+bi" TAPÉ PAR L'ÉLÈVE de ce générateur (écran 2 famille A,
 * écran 1 famille B, écran 3 famille C) doit donc rester un couple d'ENTIERS EXACTS de bout en
 * bout, jamais un résultat irrationnel (même piège, même solution que `ExerciceFormeTrigC`/
 * `ExerciceFormeTrigE` de 6gen37 — voir leur en-tête `core6e/formeTrigonometrique.types.ts`).
 *
 * ============================================================================
 * **Angles de rotation TOUJOURS restreints à l'axe {π/2, π, -π/2} — jamais π/3, π/4, π/6...**
 * ============================================================================
 * Toute rotation de ce générateur (famille A sous-types rotation/similitude/rotationTranslation ;
 * famille C, différence d'arguments) est ensuite APPLIQUÉE à un point d'affixe entière ARBITRAIRE
 * (z_P en famille A ; C,D... en famille C) puis retapée en a+bi par l'élève — contrainte identique à
 * celle qui force `ExerciceFormeTrigC` (6gen37) à choisir ses angles de départ uniquement sur l'axe
 * ou le "quart" : ici, seul l'axe (e^{iθ}∈{i,-1,-i}) garantit un produit entier×entier EXACT pour
 * N'IMPORTE QUEL couple (a,b) entier de départ (le "quart", lui, introduirait un facteur √2/2
 * irrationnel dès que le point multiplié n'est pas lui-même construit pour l'absorber — jamais
 * garanti ici puisque z_P/C/D sont des entiers arbitraires, pas des `FacteurComplexe` construits sur
 * mesure comme en famille C de 6gen37). θ=0 exclu (rotation identité, sans intérêt pédagogique).
 */

export interface AffixeEntiere {
  a: number;
  b: number;
}

// ============================================================================
// Famille A — Image d'un point par une transformation classique ou composée (2 écrans).
// ============================================================================

export type SousTypeTransfoA = "translation" | "homothetie" | "rotation" | "similitude" | "rotationTranslation";

export interface ParametresTranslation {
  sousType: "translation";
  zV: AffixeEntiere;
}
export interface ParametresHomothetie {
  sousType: "homothetie";
  k: number;
}
export interface ParametresRotation {
  sousType: "rotation";
  angle: AngleRemarquable;
}
export interface ParametresSimilitude {
  sousType: "similitude";
  k: number;
  angle: AngleRemarquable;
}
/** Rotation D'ABORD, translation ENSUITE (image = z_P·e^{iθ}+z_v) — ordre fixé par la spec, PAS
 * commutatif (contrairement à similitude, rotation+homothétie de même centre) : piège central de la
 * famille A, voir `consigneGeneraleA`/`optionsFormuleA` (`ui6e/formatTransformationsPlan.ts`). */
export interface ParametresRotationTranslation {
  sousType: "rotationTranslation";
  angle: AngleRemarquable;
  zV: AffixeEntiere;
}

export type ParametresTransfoA = ParametresTranslation | ParametresHomothetie | ParametresRotation | ParametresSimilitude | ParametresRotationTranslation;

export interface ExerciceTransfoA {
  famille: "A";
  zP: AffixeEntiere;
  parametres: ParametresTransfoA;
  /** Image CORRECTE de P par la transformation — calculée UNE FOIS à la génération, jamais
   * recalculée côté Couche B (moteur6e n'importe jamais generateurs6e). */
  image: AffixeEntiere;
}

// ============================================================================
// Famille B — Construire un point depuis somme/produit, identifier la transformation (2 écrans).
// ============================================================================

export type SousTypeTransfoB = "somme" | "produit";

/**
 * `zA`/`zB` construits avec un module ENTIER (`rA`/`rB`) et un argument remarquable EXACT
 * (`angleA`/`angleB`, quelconque parmi les 16 — jamais restreint à l'axe ici : ces 2 valeurs ne sont
 * JAMAIS retapées en a+bi par l'élève, seulement leur module/argument, réel, `sqrt` accepté — voir
 * en-tête `moteur6e/equivalenceExponentielle.ts`), MAIS `zA.a`/`zA.b` eux-mêmes restent des ENTIERS
 * EXACTS (même construction "entier de Gauss" que `familleC.ts`/6gen37 : angle sur l'axe ou le
 * "quart") — indispensable puisque `zResultat` (=zA+zB ou zA·zB), lui, EST retapé en a+bi par
 * l'élève à l'écran 1.
 */
export interface ExerciceTransfoB {
  famille: "B";
  sousType: SousTypeTransfoB;
  zA: AffixeEntiere;
  rA: number;
  angleA: AngleRemarquable;
  zB: AffixeEntiere;
  rB: number;
  angleB: AngleRemarquable;
  /** zA+zB (somme) ou zA·zB (produit) — TOUJOURS un couple d'entiers exacts (somme/produit de 2
   * entiers de Gauss). */
  zResultat: AffixeEntiere;
}

// ============================================================================
// Famille C — Similitude centrée en O, modules égaux (3 écrans).
// ============================================================================

export interface ExerciceTransfoC {
  famille: "C";
  zA: AffixeEntiere;
  angleA: AngleRemarquable;
  zB: AffixeEntiere;
  angleB: AngleRemarquable;
  /** |zA|=|zB|, garanti par construction — entier exact. */
  moduleCommun: number;
  /** arg(zB)-arg(zA), réduit — TOUJOURS un angle d'axe non nul {π/2, π, -π/2} (voir en-tête de
   * fichier), pour que la rotation appliquée à `autresPoints` (écran 3) reste toujours typable en
   * a+bi entier exact. */
  angleRotation: AngleRemarquable;
  /** Points "C", "D" (et éventuellement "E") donnés par l'énoncé, affixes entières arbitraires. */
  autresPoints: AffixeEntiere[];
  /** Image de chaque point de `autresPoints` par la rotation d'angle `angleRotation` — même index,
   * même ordre — TOUJOURS entière exacte. */
  imagesAutresPoints: AffixeEntiere[];
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceTransformationsPlan = ExerciceTransfoA | ExerciceTransfoB | ExerciceTransfoC;

export type FamilleTransformationsPlan = ExerciceTransformationsPlan["famille"];

export type GenerateurExerciceTransformationsPlan = () => ExerciceTransformationsPlan;
