/**
 * Couche core (5e) — contrat pour 5gen12 ("Problèmes de géométrie du cercle"). 3 scénarios
 * structurellement DISJOINTS (union discriminée par `scenario`, jamais un champ commun forcé entre
 * eux — même principe que 5gen5, "Problèmes-contexte") : `secteurBalaye` (A1) et `segmentCirculaire`
 * (A3, paramétré), plus sa sous-variante `lentille` (A3b) qui compose 2 fois
 * `CalculSegmentCirculaire`. Les scénarios `terrainJeu` (A2) et `fragmentPlat` (A4), instances
 * fixes non paramétrées, ont été supprimés (voir historique-5e-trigonometrie.md pour leur détail
 * archivé — contenu jamais périmé, seule sa position a changé).
 *
 * Toutes les valeurs cibles (aires, angles) sont précalculées à la génération et stockées
 * directement sur l'exercice — même convention que `ExerciceModeConversion` (5gen6,
 * `core5e/arcsSecteurs.types.ts`) : jamais un solveur générique recalculé à la vérification, la
 * Couche A calcule une fois pour toutes.
 */

export type ScenarioGeometrieCercle = "secteurBalaye" | "segmentCirculaire" | "lentille";

// ============================================================================
// A1 — Secteur balayé (type "essuie-glace").
// ============================================================================

export interface ExerciceSecteurBalaye {
  scenario: "secteurBalaye";
  thetaDeg: number;
  /** Cible de l'écran 1 (conversion, réutilise le mode "conversion pure" de 5gen6). */
  thetaRad: number;
  r1: number;
  r2: number;
  /** Cible de l'écran 2 : A₁=½r1²θ(rad). */
  aireGrandSecteur: number;
  /** Cible de l'écran 3 : A₂=½r2²θ(rad). */
  airePetitSecteur: number;
  /** Cible de l'écran 4 : A₁−A₂. */
  aireBalayee: number;
}

// ============================================================================
// A3 — Segment circulaire (loi des cosinus) + A3b — Lentille (2 segments partageant une corde).
// ============================================================================

/** Les 4 valeurs dérivées d'un couple (r,c) par la loi des cosinus — partagées telles quelles par
 * `ExerciceSegmentCirculaire` (une seule occurrence) et `ExerciceLentille` (2 occurrences, une par
 * rayon). */
export interface CalculSegmentCirculaire {
  r: number;
  c: number;
  /** JAMAIS demandée directement à l'élève (plus de framing "degrés puis conversion" — voir
   * `thetaRad`) — conservée uniquement pour l'affichage informatif interne et le filtrage de plage
   * lisible à la génération (`tirerRC`/`tirerR1R2C`, `generateurs5e/geometrieCercle/`). */
  thetaDeg: number;
  /** Cible DIRECTE de l'écran 1 : cos θ=(2r²−c²)/(2r²) → θ, ciblée et vérifiée EN RADIANS dès cet
   * écran — la loi des cosinus est appliquée puis le résultat exprimé directement en radians,
   * jamais de conversion degrés→radians affichée à l'élève entre l'écran 1 et l'écran 2 (le
   * générateur calcule déjà `thetaRad` en premier, `thetaDeg` n'en est qu'une dérivée). */
  thetaRad: number;
  /** Cible de l'écran 2 : A=½r²θ(rad). */
  aireSecteur: number;
  /** Cible de l'écran 3 : A=½r²sin θ. */
  aireTriangle: number;
  /** Cible de l'écran 4 : secteur − triangle. */
  aireSegment: number;
}

export interface ExerciceSegmentCirculaire extends CalculSegmentCirculaire {
  scenario: "segmentCirculaire";
}

export interface ExerciceLentille {
  scenario: "lentille";
  /** Corde commune aux 2 cercles (identique dans `segment1.c`/`segment2.c`, jamais dupliquée pour
   * rien — répétée ici uniquement pour un accès direct sans traverser `segment1`). */
  c: number;
  segment1: CalculSegmentCirculaire;
  segment2: CalculSegmentCirculaire;
  /** Cible de l'écran final : segment1.aireSegment + segment2.aireSegment. */
  aireLentille: number;
}

export type ExerciceGeometrieCercle = ExerciceSecteurBalaye | ExerciceSegmentCirculaire | ExerciceLentille;

export type GenerateurExerciceGeometrieCercle = () => ExerciceGeometrieCercle;
