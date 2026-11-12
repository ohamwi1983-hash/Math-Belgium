/**
 * Couche core (6e) — contrat pour `6gen41` ("Propriétés géométriques de triangles via les nombres
 * complexes", chapitre 5 "Nombres complexes"). 5 familles (A à E — E ajoutée par l'audit 6e ch. 5,
 * point 44), tirage ÉQUIPROBABLE de la famille — voir `generateurs6e/trianglesComplexes/index.ts`.
 *
 * ============================================================================
 * **Représentation d'un point** : `re,im` NUMÉRIQUES exacts (calculés une fois pour toutes à la
 * génération) + `latex` prêt à afficher — jamais recalculé côté Couche B (`moteur6e/`
 * n'importe jamais `generateurs6e/`, CLAUDE.md). Toute longueur utile à un écran est PRÉCALCULÉE à
 * la génération (Couche A, via `calculerModule` réutilisé de `generateurs6e/formeTrigonometrique/
 * familleA.ts`) et stockée comme un NOMBRE simple sur l'exercice — la Couche B ne fait jamais
 * `calculerModule` elle-même (elle ne peut pas : cette fonction vit dans `generateurs6e/`).
 * ============================================================================
 *
 * **Choix "éviter les longueurs irrationnelles" (familles A/B/D) — voir `docs/historique-6e.md`
 * pour la justification complète** : toutes les longueurs et le multiplicateur a+bi de la famille D
 * sont des ENTIERS exacts, jamais un radical. SEULE exception délibérée : la famille C (triangle
 * équilatéral) où la distance du centre à chaque sommet (rayon circonscrit = côté/√3) est
 * MATHÉMATIQUEMENT irrationnelle dès que le côté est un entier rationnel (propriété géométrique
 * incontournable d'un triangle équilatéral, aucune construction entière ne peut l'éviter) — cette
 * famille réutilise donc le pattern DÉJÀ établi par `6gen37` (chapitre 7) de taper un module sous
 * forme radicale via l'évaluateur réel (`moteur6e/equivalenceExponentielle.ts`, qui supporte nativement
 * `sqrt(...)`), jamais un pattern nouveau. Seconde exception délibérée : la famille B, où les angles
 * de base (loi des cosinus) sont un DÉCIMAL non remarquable par construction (voir en-tête
 * `generateurs6e/trianglesComplexes/familleB.ts`) — vérifiés par TOLÉRANCE décimale plutôt que par
 * égalité exacte, seul écran de tout le chapitre 7 à ce jour dans ce cas.
 *
 * ============================================================================
 * **Audit 6e ch. 5 (lot D) — verdicts jamais constants.** Chaque écran de CHOIX a désormais
 * plusieurs réponses possibles réellement tirées (famille A : 4 cas équilibrés isocèle / rectangle /
 * isocèle rectangle / quelconque ; famille B : sommet principal O, A ou B et triangle rectangle ou
 * non ; famille C : A centre ou milieu d'un côté ; famille D : ≈ 1/3 de contre-exemples
 * incohérents ; famille E : alignés / perpendiculaires / ni l'un ni l'autre). Les longueurs peuvent
 * donc être irrationnelles (√n, saisie `sqrt(n)` acceptée) : chaque longueur porte sa forme exacte
 * LaTeX (`Longueur`). L'ordre d'affichage des options est tiré à la génération (`ordres`).
 * ============================================================================
 */

export interface PointComplexe {
  re: number;
  im: number;
  latex: string;
}

/** Longueur ou distance : valeur numérique + forme exacte LaTeX (entier, k√n, fraction de √3…). */
export interface Longueur {
  numerique: number;
  latex: string;
}

/** Deux permutations de 0..3, une par écran de choix de l'exercice (ordre d'affichage des options,
 * uniforme — audit 6e ch. 5, point 6). Une option d'indice ≥ au nombre d'options est ignorée. */
export type OrdresChoix = [number[], number[]];

// ============================================================================
// Famille A — Isocèle, rectangle, les deux ou aucun (3 écrans).
// ============================================================================

export type SommetTriangle = "A" | "B" | "C";
/** "aucun" = pas isocèle / pas rectangle — une conclusion valide, jamais un état d'erreur. */
export type StatutSommet = SommetTriangle | "aucun";

/** 4 cas ÉQUIPROBABLES (audit 6e ch. 5, point 43) : isocèle non rectangle (côtés entiers),
 * rectangle non isocèle (triplet pythagoricien), isocèle rectangle (côtés c et c√2), quelconque. */
export type SousTypeTrianglesA = "isocele" | "rectangle" | "isoceleRectangle" | "quelconque";

export interface ExerciceTrianglesA {
  famille: "A";
  sousType: SousTypeTrianglesA;
  A: PointComplexe;
  B: PointComplexe;
  C: PointComplexe;
  AB: Longueur;
  AC: Longueur;
  BC: Longueur;
  sommetIsocele: StatutSommet;
  sommetRectangle: StatutSommet;
  ordres: OrdresChoix;
}

// ============================================================================
// Famille B — Triangle isocèle OAB, loi des cosinus (4 écrans).
// ============================================================================

export type SommetOAB = "O" | "A" | "B";

export interface ExerciceTrianglesB {
  famille: "B";
  O: PointComplexe;
  A: PointComplexe;
  B: PointComplexe;
  OA: Longueur;
  OB: Longueur;
  AB: Longueur;
  /** Sommet principal, tiré parmi O, A, B (était TOUJOURS O — verdict constant). */
  sommetIsocele: SommetOAB;
  /** Sommet principal si le triangle est isocèle rectangle, "aucun" sinon (≈ 1 fois sur 2). */
  sommetRectangle: SommetOAB | "aucun";
  /** Angles en degrés (décimaux non remarquables, sauf 90/45/45) — vérifiés à 0,5° près. */
  anglesDeg: Record<SommetOAB, number>;
  ordres: OrdresChoix;
}

// ============================================================================
// Famille C — Triangle équilatéral OBF : A est-il le centre ? (3 écrans).
// ============================================================================

export type PositionAC = "centre" | "milieuOB" | "milieuOF" | "milieuBF";

export interface ExerciceTrianglesC {
  famille: "C";
  O: PointComplexe;
  B: PointComplexe;
  F: PointComplexe;
  A: PointComplexe;
  /** Côté du triangle équilatéral OBF — ENTIER pair. */
  cote: number;
  /** A = centre (≈ 1 fois sur 2) ou milieu d'un côté — le verdict « équidistant » n'est plus
   * constant (audit 6e ch. 5, point 6). */
  positionA: PositionAC;
  AO: Longueur;
  AB: Longueur;
  AF: Longueur;
  equidistant: boolean;
  ordres: OrdresChoix;
}

// ============================================================================
// Famille D — Similitude entre deux triangles (3 écrans).
// ============================================================================

export interface ExerciceTrianglesD {
  famille: "D";
  O: PointComplexe;
  A: PointComplexe;
  B: PointComplexe;
  C: PointComplexe;
  D: PointComplexe;
  /** Rapport de la similitude A ↦ C — ENTIER exact. */
  rapport: number;
  /** Angle de la similitude A ↦ C — multiple de π/2, LaTeX réduit dans (-π;π]. */
  angleLatex: string;
  angleNumerique: number;
  /** Multiplicateur k·e^{iθ} de A ↦ C sous forme a+bi — entier exact. */
  multiplicateurRe: number;
  multiplicateurIm: number;
  /** D est-il l'image de B par la MÊME similitude ? Faux ≈ 1 fois sur 3 (contre-exemple). */
  coherent: boolean;
  ordres: OrdresChoix;
}

// ============================================================================
// Famille E — Alignés, perpendiculaires ou ni l'un ni l'autre (2 écrans).
// Audit 6e ch. 5, point 44 (décision I) : critère du quotient (z_C − z_A)/(z_B − z_A).
// ============================================================================

export type PositionE = "alignes" | "perpendiculaires" | "aucun";

export interface ExerciceTrianglesE {
  famille: "E";
  A: PointComplexe;
  B: PointComplexe;
  C: PointComplexe;
  /** (z_C − z_A)/(z_B − z_A) — entier de Gauss exact par construction. */
  quotientRe: number;
  quotientIm: number;
  position: PositionE;
  ordres: OrdresChoix;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceTrianglesComplexes = ExerciceTrianglesA | ExerciceTrianglesB | ExerciceTrianglesC | ExerciceTrianglesD | ExerciceTrianglesE;

export type FamilleTrianglesComplexes = ExerciceTrianglesComplexes["famille"];
