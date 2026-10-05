import type { RationnelPi } from "../generateurs5e/parametresSinusoide/rationnelPi";

export type { RationnelPi };

/** Amplitude : signe séparé + magnitude rationnelle simple OU racine carrée d'un entier sans facteur
 * carré (jamais les deux à la fois — `rationnelle`/`radicande` sont donc mutuellement exclusifs). */
export interface AmplitudeSinusoide {
  signe: 1 | -1;
  rationnelle: { numerateur: number; denominateur: number } | null;
  radicande: number | null;
}

/** Les 4 paramètres fondamentaux, communs à 5gen8 (lecture algébrique) et 5gen9 (lecture
 * graphique) — φ partage TOUJOURS le même `degrePi` que T (voir `generateurs5e/parametresSinusoide/parametres.ts`). */
export interface ParametresSinusoideBase {
  A: AmplitudeSinusoide;
  T: RationnelPi;
  phi: RationnelPi;
  /** Toujours un entier simple, jamais lié à π. */
  b: number;
}

export type FormeAffichageSinusoide = "developpee" | "prefactorisee";

export interface ExerciceParametresSinusoide extends ParametresSinusoideBase {
  forme: FormeAffichageSinusoide;
  /** B = 2π/T, précalculé à la génération (jamais reconstruit depuis un flottant côté présentation). */
  B: RationnelPi;
  /** C = -B×φ. */
  C: RationnelPi;
}
