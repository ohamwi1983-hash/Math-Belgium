/**
 * Couche core — "Distance point-droite et droite-droite (méthode de synthèse, sans formule)".
 * ⚠️ Exercice de SYNTHÈSE, couplage fort assumé (même famille de risque que gen35, "Exercice de
 * synthèse" du chapitre Statistique) : enchaîne des écrans directement REPRIS de 3 générateurs déjà
 * construits — "Relations entre droites" (construction de la perpendiculaire), le module partagé
 * `geometrieDroite.ts`/`verificationDroite.ts` (intersection de deux droites — Task 15, ajoutée
 * spécifiquement pour ce générateur), "Norme d'un vecteur et distance entre 2 points" (calcul de
 * distance) — voir `generateurs/distanceDroite/index.ts` et `moteur/verificationDistanceDroite.ts`
 * pour le détail exact de chaque réutilisation. Toute évolution future de ces trois sources devra
 * être répercutée ici.
 *
 * Réutilise directement `DroiteImplicite` (`droite.types.ts`) et `Point`/`Composantes`
 * (`vecteur.types.ts`) — jamais de type dupliqué.
 */
import type { DroiteImplicite } from "./droite.types";
import type { Composantes, Point } from "./vecteur.types";

export type VarianteDistanceDroite = "point" | "paralleles";

/**
 * Exactitude par construction — triplet pythagoricien, jamais de tolérance sur une distance
 * irrationnelle (même principe que "Norme d'un vecteur et distance entre 2 points") :
 * - `vecteurNormal` (perpendiculaire à `d`, direction de `b`) a pour norme EXACTE `n` (triplet
 *   pythagoricien) — voir `generateurs/distanceDroite/index.ts` pour la dérivation complète.
 * - `point` est construit comme `q + k·vecteurNormal` (k entier non nul) : `q` appartient donc à
 *   la fois à `d` (par construction) et à la perpendiculaire à `d` passant par `point` (même
 *   direction) — `q` est ainsi EXACTEMENT le pied de la perpendiculaire, `distance = |k|·n`
 *   toujours un entier exact.
 */
export interface ExerciceDistancePoint {
  variante: "point";
  /** La droite donnée dans l'énoncé. */
  d: DroiteImplicite;
  /** Le point donné dans l'énoncé. */
  point: Point;
  /** Norme exacte de `vecteurNormal` (= norme du vecteur directeur de `d`, une rotation préserve
   * la longueur). */
  n: number;
  /** Vecteur directeur de `b` — perpendiculaire à `d`, `perpendiculaire(vecteurD)`. */
  vecteurNormal: Composantes;
  /** La droite `b`, perpendiculaire à `d`, passant par `point` — cible de l'écran 1. */
  bAttendue: DroiteImplicite;
  /** Le pied de la perpendiculaire = `b ∩ d` — cible de l'écran 2. */
  q: Point;
  /** `|k|·n`, toujours un entier exact — cible de l'écran 3. */
  distance: number;
}

/**
 * `d1`/`d2` toujours PARALLÈLES (même vecteur directeur, jamais sécantes) — construites via le
 * même mécanisme "triplet pythagoricien" que `ExerciceDistancePoint`, garantissant que la distance
 * entre les deux reste `|k|·n` (un entier exact) INDÉPENDAMMENT du point que l'élève choisit à
 * l'écran 0 sur la droite désignée (propriété géométrique des parallèles — voir le générateur pour
 * la preuve). `point`/`bAttendue`/`q` ne sont donc jamais fixés à la génération : ils sont
 * recalculés dynamiquement en Couche B (`sessionDistanceDroite.ts`) à partir du point RÉELLEMENT
 * choisi par l'élève.
 */
export interface ExerciceDistanceParalleles {
  variante: "paralleles";
  d1: DroiteImplicite;
  d2: DroiteImplicite;
  /** Laquelle des deux sert de SOURCE pour le point choisi à l'écran 0 — désignée explicitement
   * dans l'énoncé, jamais un libre choix entre les deux (spec, écran 0). L'autre droite du couple
   * joue alors le rôle de `d` (la droite CIBLE) pour les écrans 1 à 3. */
  droiteSource: "d1" | "d2";
  n: number;
  vecteurNormal: Composantes;
  distance: number;
}

export type ExerciceDistanceDroite = ExerciceDistancePoint | ExerciceDistanceParalleles;

export type GenerateurExerciceDistanceDroite = () => ExerciceDistanceDroite;
