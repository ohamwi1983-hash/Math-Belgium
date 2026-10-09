/**
 * Couche core (6e) — contrat pour `6gen55` ("Cercles"), chapitre "Lieux géométriques". 7 familles
 * (A à G), tirage ÉQUIPROBABLE — voir `generateurs6e/cercles/index.ts`. Aucune famille n'a de
 * sous-type (contrairement à `6gen43` par exemple) : chaque famille a une forme unique.
 *
 * **Convention transversale à ce contrat** (mirroir `core6e/denombrementFondamental.types.ts`) :
 * chaque exercice porte déjà, PRÉ-CALCULÉES par la Couche A, toutes les valeurs numériques
 * correctes attendues à chaque écran — `moteur6e/verificationCercles.ts` ne fait QUE comparer,
 * jamais de logique géométrique dans `moteur6e/`.
 *
 * **Représentation des droites** : `DroiteAffine` (`generateurs6e/cercles/geometrie.ts`), forme
 * `y=m·x+p`, jamais verticale — simplification assumée par construction (voir en-tête de ce
 * fichier et `docs/historique-6e.md`).
 *
 * **Représentation du cercle** : ce générateur mélange DÉLIBÉRÉMENT 2 représentations, chacune
 * choisie pour l'écran qui l'exploite le plus naturellement — jamais une conversion imposée sans
 * raison :
 * - forme GÉNÉRALE `x²+y²+Dx+Ey+F=0` (famille A, D/E/F sont l'inconnue même du système à résoudre) ;
 * - centre+rayon (toutes les autres familles, où le centre/rayon sont soit la donnée de départ,
 *   soit le résultat final cherché).
 * Conversion : centre=(−D/2,−E/2), rayon=√(D²/4+E²/4−F) (famille A écran 3).
 */

/** Un point du plan — type propre à ce contrat, jamais importé du chantier 4e
 * (`core/vecteur.types.ts`) ni d'un autre chantier (CLAUDE.md, isolation stricte des chantiers).
 * `generateurs6e/cercles/geometrie.ts` (Couche A) le réimporte et le réexporte pour ses propres
 * fichiers `familleX.ts` — jamais l'inverse (`moteur6e/`/`core6e/` n'importent jamais
 * `generateurs6e/`). */
export interface Point {
  x: number;
  y: number;
}

/** Droite non verticale, forme affine `y = m·x + p` — convention DÉLIBÉRÉE de ce générateur (voir
 * en-tête de fichier) : aucune droite manipulée par `6gen55` n'est verticale. */
export interface DroiteAffine {
  m: number;
  p: number;
}

// ============================================================================
// Famille A — Cercle par 3 points (3 écrans).
// ============================================================================

export interface ExerciceCerclesA {
  famille: "A";
  A: Point;
  B: Point;
  C: Point;
  D: number;
  E: number;
  F: number;
  centreX: number;
  centreY: number;
  rayon: number;
}

// ============================================================================
// Famille B — Cercle par 2 points, rayon donné (3 écrans).
// ============================================================================

export interface ExerciceCerclesB {
  famille: "B";
  A: Point;
  B: Point;
  r: number;
  mediatrice: DroiteAffine;
  /** Les 2 centres possibles (piège central : n'en garder qu'un seul). Ordre arbitraire — la
   * vérification (écran 3) compare en ENSEMBLE, jamais position par position. */
  centre1: Point;
  centre2: Point;
}

// ============================================================================
// Famille C — Cercle par 2 points, centre sur une droite donnée (3 écrans).
// ============================================================================

export interface ExerciceCerclesC {
  famille: "C";
  A: Point;
  B: Point;
  d: DroiteAffine;
  mediatrice: DroiteAffine;
  centre: Point;
  rayon: number;
}

// ============================================================================
// Famille D — Cercle par un point, tangent à un axe en un point donné (3 écrans).
// ============================================================================

export interface ExerciceCerclesD {
  famille: "D";
  /** `A.y > 0` par construction — voir en-tête `familleD.ts` pour la convention "r est à la fois
   * l'ordonnée du centre ET le rayon". */
  A: Point;
  /** Point de tangence sur l'axe des abscisses : (Bx, 0). */
  Bx: number;
  r: number;
}

// ============================================================================
// Famille E — Cercle inscrit à un triangle (3 écrans). Forme PARTAGÉE avec la famille G (réutilisée
// telle quelle, jamais dupliquée — voir `familleE.ts`/`familleG.ts`).
// ============================================================================

export interface DonneesTriangleInscrit {
  A: Point;
  B: Point;
  C: Point;
  /** a=BC, b=CA, c=AB (côté OPPOSÉ à chaque sommet — convention triangle standard). */
  a: number;
  b: number;
  c: number;
  incentreX: number;
  incentreY: number;
  rayon: number;
}

export interface ExerciceCerclesE extends DonneesTriangleInscrit {
  famille: "E";
}

// ============================================================================
// Famille F — Cercle avec corde de longueur donnée (3 écrans).
// ============================================================================

export interface ExerciceCerclesF {
  famille: "F";
  centre: Point;
  d: DroiteAffine;
  L: number;
  distanceCentreDroite: number;
  rCarre: number;
  rayon: number;
}

// ============================================================================
// Famille G — Cercles tangents à 3 droites (4 écrans) — RÉUTILISE la famille E après une étape
// préliminaire (trouver le triangle). `triangle` a EXACTEMENT la forme `DonneesTriangleInscrit`,
// jamais un calcul dupliqué en écrans 2-4 (voir `familleG.ts`, qui importe les fonctions pures de
// `familleE.ts`).
// ============================================================================

export interface ExerciceCerclesG {
  famille: "G";
  d1: DroiteAffine;
  d2: DroiteAffine;
  d3: DroiteAffine;
  sommet12: Point;
  sommet23: Point;
  sommet31: Point;
  triangle: DonneesTriangleInscrit;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceCercles = ExerciceCerclesA | ExerciceCerclesB | ExerciceCerclesC | ExerciceCerclesD | ExerciceCerclesE | ExerciceCerclesF | ExerciceCerclesG;

export type FamilleCercles = ExerciceCercles["famille"];
