/**
 * Couche core (5e) — contrat pour 5gen30 ("Lecture graphique — dérivées et applications"). Lecture
 * graphique PURE (aucun calcul) : un graphique de f est affiché, l'élève lit directement asymptotes,
 * points où f' s'annule, signe de f'/f'', valeurs des extremums, points d'inflexion. Type pur, aucune
 * logique — voir `generateurs5e/lectureGraphiqueDerivees/` pour la construction.
 *
 * **Refonte (audit 5e ch. 5, lot D)** : l'ancienne courbe « fond + bosses » (gaussiennes, tanh)
 * changeait les limites en ±∞ (la courbe ne tendait pas vers l'asymptote tracée dans 43,6 % des
 * tirages), produisait des fonctions constantes et des points « organiques » imprévisibles. La courbe
 * est désormais construite MORCEAU PAR MORCEAU, entièrement maîtrisée :
 *   - aux extrémités de chaque branche, un GABARIT exact du comportement annoncé (approche
 *     exponentielle de l'asymptote horizontale ou oblique, divergence c/(x − a) près d'une asymptote
 *     verticale, parabole quand il n'y a pas d'asymptote, petite quadratique vers un point isolé) ;
 *   - entre les deux, une suite de segments d'Hermite cubiques passant par des POINTS CLÉS à
 *     tangente horizontale (maximums, minimums, paliers), raccordés aux gabarits en valeur ET en pente.
 * La vérité terrain (extremums, paliers, points d'inflexion) est connue par construction et
 * re-contrôlée par balayage de f' et f'' (formules exactes de chaque morceau).
 */
import type { ExerciceLectureGraphiqueLimites } from "./lectureGraphiqueLimites.types";

/** Un morceau de courbe, défini sur [x0 ; x1] (x0 < x1). Les formules sont aussi valables au-delà
 * (prolongement utilisé pour les représentants de zones des tableaux de signes). */
export type MorceauCourbeDerivees =
  /** Hermite cubique : valeurs y0/y1 et pentes s0/s1 aux bornes. */
  | { kind: "hermite"; x0: number; x1: number; y0: number; y1: number; s0: number; s1: number }
  /** pente·x + ordonnee + c·e^{k(x − xRef)} — approche d'une asymptote horizontale (pente = 0) ou
   * oblique ; k > 0 à gauche (le terme s'efface en −∞), k < 0 à droite. */
  | { kind: "expo"; x0: number; x1: number; pente: number; ordonnee: number; c: number; k: number; xRef: number }
  /** coef/(x − a) — divergence près d'une asymptote verticale x = a. */
  | { kind: "divergence"; x0: number; x1: number; a: number; coef: number }
  /** coef·(x − sommet)² + ordonnee — branche infinie sans asymptote (sommet hors du morceau). */
  | { kind: "parabole"; x0: number; x1: number; coef: number; sommet: number; ordonnee: number }
  /** v + m(x − a) + b(x − a)² — branche qui aboutit au point isolé (a ; v). */
  | { kind: "quadratique"; x0: number; x1: number; a: number; v: number; m: number; b: number };

export interface ExtremumLectureGraphiqueDerivees {
  position: number;
  valeur: number;
  classification: "max" | "min";
}

/** Point où f' s'annule SANS changer de signe (tangente horizontale, ni maximum ni minimum) — c'est
 * aussi un point d'inflexion. */
export interface PalierLectureGraphiqueDerivees {
  position: number;
  valeur: number;
}

export interface InflexionLectureGraphiqueDerivees {
  position: number;
  valeur: number;
  classification: "pi";
}

export interface ExerciceLectureGraphiqueDerivees {
  /** Comportement aux bords (AV + infini) — contrat de 5gen22, positions d'AV recadrées pour la
   * fenêtre fixe de ce générateur. */
  asymptotique: ExerciceLectureGraphiqueLimites;
  /** Fenêtre x FIXE du graphique. */
  bornesX: [number, number];
  /** Morceaux triés par x croissant ; jamais de morceau à cheval sur une asymptote verticale. */
  morceaux: MorceauCourbeDerivees[];
  /** Vérité terrain — triée par position croissante. */
  extrema: ExtremumLectureGraphiqueDerivees[];
  /** Vérité terrain — triée par position croissante. */
  paliers: PalierLectureGraphiqueDerivees[];
  /** Vérité terrain (paliers compris) — triée par position croissante. */
  inflexions: InflexionLectureGraphiqueDerivees[];
}

export type GenerateurExerciceLectureGraphiqueDerivees = () => ExerciceLectureGraphiqueDerivees;
