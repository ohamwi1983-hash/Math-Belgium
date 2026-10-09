/**
 * Couche core (6e) — contrat pour `6gen41` ("Propriétés géométriques de triangles via les nombres
 * complexes", chapitre 7 "Nombres complexes"). 4 familles (A à D), tirage ÉQUIPROBABLE de la
 * famille — voir `generateurs6e/trianglesComplexes/index.ts`.
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
 */

export interface PointComplexe {
  re: number;
  im: number;
  latex: string;
}

// ============================================================================
// Famille A — Démontrer isocèle et/ou rectangle (3 écrans).
// ============================================================================

export type SommetTriangle = "A" | "B" | "C";
/** "aucun" = pas isocèle / pas rectangle — une conclusion valide, jamais un état d'erreur. */
export type StatutSommet = SommetTriangle | "aucun";

/**
 * 2 sous-types, JAMAIS combinés (voir en-tête de fichier + `docs/historique-6e.md`) : un triangle
 * isocèle non rectangle construit avec des longueurs entières exactes (impossible d'être AUSSI
 * rectangle avec des entiers — voir preuve dans `generateurs6e/trianglesComplexes/construction.ts`),
 * ou un triangle rectangle scalène (via un triplet pythagoricien) donc JAMAIS isocèle. L'énoncé
 * "isocèle et/ou rectangle" du prompt source est ainsi couvert par les 2 branches "et" n'étant tout
 * simplement jamais atteignable avec des longueurs entières.
 */
export interface ExerciceTrianglesA {
  famille: "A";
  sousType: "isocele" | "rectangle";
  A: PointComplexe;
  B: PointComplexe;
  C: PointComplexe;
  longueurAB: number;
  longueurAC: number;
  longueurBC: number;
  /** Sommet où le triangle est isocèle (sousType="isocele") ou "aucun" (sousType="rectangle"). */
  sommetIsocele: StatutSommet;
  /** Sommet de l'angle droit (sousType="rectangle") ou "aucun" (sousType="isocele"). */
  sommetRectangle: StatutSommet;
}

// ============================================================================
// Famille B — Triangle isocèle non rectangle, loi des cosinus (4 écrans).
// ============================================================================

export interface ExerciceTrianglesB {
  famille: "B";
  O: PointComplexe;
  A: PointComplexe;
  B: PointComplexe;
  longueurOA: number;
  longueurOB: number;
  longueurAB: number;
  /** Apex TOUJOURS en O par construction (voir en-tête `familleB.ts`). */
  sommetIsocele: "O";
  /** TOUJOURS "aucun" par construction (voir en-tête `familleB.ts` — banque filtrée). */
  sommetRectangle: "aucun";
  /** Angle à l'apex O, en DEGRÉS — décimal non remarquable par construction (voir en-tête
   * `familleB.ts`), vérifié par tolérance (voir `moteur6e/verificationTrianglesComplexes.ts`). */
  angleApexDeg: number;
  /** Angle de base (en A et en B, ÉGAUX entre eux), en DEGRÉS. */
  angleBaseDeg: number;
}

// ============================================================================
// Famille C — Triangle équilatéral et point remarquable (2 écrans).
// ============================================================================

export interface ExerciceTrianglesC {
  famille: "C";
  O: PointComplexe;
  B: PointComplexe;
  F: PointComplexe;
  A: PointComplexe;
  /** Côté du triangle équilatéral OBF — ENTIER exact. */
  cote: number;
  /** Distance de A (centre) à chaque sommet — cote/√3, IRRATIONNELLE par nature géométrique (voir
   * en-tête de fichier) ; `latex` porte la forme radicale exacte (ex. "2\\sqrt{3}"). */
  distanceCentre: { numerique: number; latex: string };
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
  /** Rapport de la similitude — ENTIER exact (voir en-tête `familleD.ts`). */
  rapport: number;
  /** Angle de la similitude — multiple de π/2, LaTeX déjà réduit dans (-π;π]. */
  angleLatex: string;
  angleNumerique: number;
  /** Multiplicateur k·e^{iθ} sous forme a+bi — TOUJOURS un entier exact (k entier × cos/sin∈{0,±1}). */
  multiplicateurRe: number;
  multiplicateurIm: number;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceTrianglesComplexes = ExerciceTrianglesA | ExerciceTrianglesB | ExerciceTrianglesC | ExerciceTrianglesD;

export type FamilleTrianglesComplexes = ExerciceTrianglesComplexes["famille"];
