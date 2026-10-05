/**
 * Couche core — "Caractéristiques d'une droite". Réutilise directement `FormeSortieDroite`
 * (`droite.types.ts`) pour la forme d'entrée de cet exercice — cette forme joue ici le rôle de
 * forme DE DÉPART (jamais de forme cible), même principe que `FormeEntreeRelation` ("Relations
 * entre droites").
 */
import type { DroiteExpliciteX, DroiteExpliciteY, DroiteImplicite, DroiteParametrique, FormeSortieDroite } from "./droite.types";
import type { Composantes, Point } from "./vecteur.types";

/** Ce qui est demandé à l'écran 2, en plus de l'ordonnée à l'origine — un seul des trois à la fois,
 * jamais deux ensemble (l'angle dérive mécaniquement de la pente par arctan ; demander plusieurs ne
 * testerait pas des compétences distinctes). `angleOx`/`angleOy` distinguent l'axe de référence de
 * l'angle demandé (`promptgen46modifications.md`, point 2) — jamais les deux à la fois non plus. */
export type CaracteristiqueDemandee = "pente" | "angleOx" | "angleOy";

export type VarianteCaracteristiquesDroite = FormeSortieDroite;

/**
 * L'angle (et donc la pente, qui en dérive) est TOUJOURS construit à partir d'un angle remarquable
 * choisi en amont (`angleDeg`), jamais l'inverse — garantit une pente et un angle exacts, vérification
 * sans tolérance, cohérent avec "Angles associés" / "Quel angle ?". Les droites verticales sont
 * incluses (`verticale=true` ssi `angleDeg=90`) : `pente`/`ordonneeOrigine` valent alors `null`
 * ("n'existe pas"), jamais une valeur numérique — `angleDeg` reste toujours défini (jamais `null`).
 *
 * **Exclusion de génération** (garantie par construction, jamais vérifiée après coup) : une
 * verticale ne coïncide jamais exactement avec l'axe Oy (`point.x≠0` quand `verticale`) — ce cas
 * dégénéré rendrait l'ordonnée à l'origine ambiguë (tous les points de Oy appartiennent à la
 * droite) plutôt que simplement "n'existe pas".
 */
export interface ExerciceCaracteristiquesDroite {
  variante: VarianteCaracteristiquesDroite;
  verticale: boolean;
  parametriqueEntree: DroiteParametrique | null;
  impliciteEntree: DroiteImplicite | null;
  expliciteYEntree: DroiteExpliciteY | null;
  expliciteXEntree: DroiteExpliciteX | null;
  /** Seule vérité de l'écran 1 (appartenance/proportionnalité), calculée une fois pour toutes. */
  referenceImplicite: DroiteImplicite;
  /** Point canonique — n'importe quel autre point de la droite reste accepté à l'écran 1. */
  point: Point;
  /** Vecteur directeur canonique — n'importe quel multiple non nul reste accepté à l'écran 1. */
  vecteur: Composantes;
  /** Angle avec l'axe Ox — TOUJOURS défini (jamais `null`), y compris pour une verticale (90°). */
  angleDeg: number;
  /** Angle avec l'axe Oy — dérivé de `angleDeg` (`90-angleDeg`, ramené dans `[0°,180°[`), calculé
   * une seule fois à la génération, jamais recalculé différemment côté vérification/présentation —
   * TOUJOURS défini, même principe que `angleDeg` (`promptgen46modifications.md`, point 2). */
  angleOyDeg: number;
  pente: number | null;
  ordonneeOrigine: number | null;
  caracteristiqueDemandee: CaracteristiqueDemandee;
}

export type GenerateurExerciceCaracteristiquesDroite = () => ExerciceCaracteristiquesDroite;
