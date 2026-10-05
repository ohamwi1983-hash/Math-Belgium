/**
 * Couche core — contrat de "Équation d'une droite". Architecture en pipeline factorisé (2-3
 * écrans communs), pas 20 variantes indépendantes : **5 types de données en entrée** convergent
 * vers une extraction commune (point + vecteur directeur), puis divergent vers **4 formes de
 * sortie** possibles (`FormeSortieDroite`, `core/droite.types.ts`).
 *
 * `Point`/`Composantes` réutilisés de `core/vecteur.types.ts` ; `DroiteImplicite`/`DroiteExpliciteY`/
 * `DroiteExpliciteX`/`FormeSortieDroite` de `core/droite.types.ts` — jamais redéfinis ici.
 */
import type { Composantes, Point } from "./vecteur.types";
import type { DroiteExpliciteX, DroiteExpliciteY, DroiteImplicite, FormeSortieDroite } from "./droite.types";

/** Les 5 types de données fournies en entrée (spec section "Écran 1"). */
export type TypeDonneeEntree = "deux_points" | "point_vecteur" | "angle_ox" | "angle_oy" | "pente";

export interface DonneesDeuxPoints {
  type: "deux_points";
  pointA: Point;
  pointB: Point;
}
export interface DonneesPointVecteur {
  type: "point_vecteur";
  point: Point;
  vecteur: Composantes;
}
/** Types 3/4 — angle avec Ox ou Oy, restreint à {0°,45°,90°,135°} (tangente rationnelle — voir
 * `generateurs/droite/geometrieDroite.ts`, `TAN_REMARQUABLE`). */
export interface DonneesAngle {
  type: "angle_ox" | "angle_oy";
  point: Point;
  angleDeg: number;
}
export interface DonneesPente {
  type: "pente";
  point: Point;
  pente: number;
}

export type DonneesEntreeDroite = DonneesDeuxPoints | DonneesPointVecteur | DonneesAngle | DonneesPente;

export interface ExerciceEquationDroite {
  donnees: DonneesEntreeDroite;
  /** Extraction commune (écran 1) — point de référence et vecteur directeur, calculés une seule
   * fois à la génération à partir de `donnees`, jamais recalculés différemment côté vérification. */
  point: Point;
  vecteur: Composantes;
  /** Forme implicite dérivée de `point`/`vecteur` — TOUJOURS calculable (contrairement aux formes
   * explicites), seule source de vérité pour toute vérification par proportionnalité/appartenance. */
  referenceImplicite: DroiteImplicite;
  /** Forme cible tirée pour l'écran 2/3. */
  formeCible: FormeSortieDroite;
  /** Vérité de l'écran 2 — "possible" est toujours vrai pour paramétrique/implicite, peut être faux
   * pour explicite_y (droite verticale) / explicite_x (droite horizontale). */
  possible: boolean;
  /** Écran 3 — présents ssi la forme correspondante est géométriquement atteignable (indépendamment
   * de `formeCible`, pour rester utilisables par un futur réutilisateur qui en aurait besoin même
   * hors cible) ; `null` sinon (jamais lu dans ce cas, `possible` en aval décide déjà de l'arrêt). */
  refExpliciteY: DroiteExpliciteY | null;
  refExpliciteX: DroiteExpliciteX | null;
}

export type GenerateurExerciceEquationDroite = () => ExerciceEquationDroite;
