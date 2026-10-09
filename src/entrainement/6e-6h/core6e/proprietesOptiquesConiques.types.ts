import type { Point } from "./identificationConiques.types";
import type { ConiqueGenerale, DroiteAffine, PointFrac } from "./intersectionsConiques.types";

/**
 * Couche core (6e) — contrat pur pour `6gen63` ("Propriétés optiques des coniques"), générateur DE
 * CLÔTURE du chapitre "Les coniques" (6gen58 à 6gen63, voir `docs/historique-6e.md`).
 *
 * RÉUTILISE directement `ConiqueGenerale`/`DroiteAffine`/`PointFrac` de
 * `core6e/intersectionsConiques.types.ts` (contrat de `6gen61`) — la conique reste `p·x²+q·y²=n`
 * centrée à l'origine, la droite reste `y=m·x+c` jamais verticale, EXACTEMENT le même vocabulaire que
 * `6gen61` puisque ce générateur réutilise `resoudreIntersectionDroiteConique` (`generateurs6e/
 * intersectionsConiques/familleA.ts`) TEL QUEL pour l'étape "substituer le rayon incident dans
 * l'équation de la conique" (écran 2) — jamais une réimplémentation locale de cette résolution.
 *
 * Conique TOUJOURS d'axe HORIZONTAL (jamais vertical) — condition nécessaire pour que le foyer F
 * (foyer SOURCE du rayon incident) ait une abscisse négative, exigence explicite de la mission
 * ("foyer d'abscisse négative F").
 *
 * Une seule famille, toujours 4 écrans (jamais de branchement selon l'exercice, contrairement à
 * `6gen61`/`6gen62`) :
 * - Écran 1 : identifier les 2 foyers F (abscisse négative) et F' depuis l'équation de la conique.
 * - Écran 2 : poser l'équation du rayon incident (droite passant par F, pente `tanAlpha`), substituer
 *   dans la conique — RÉUTILISE `resoudreIntersectionDroiteConique` — et donner les 2 points
 *   d'intersection trouvés.
 * - Écran 3 : parmi les 2 points CONFIRMÉS de l'écran 2, identifier celui qui correspond au trajet
 *   RÉEL du rayon (piège : celui atteint EN PREMIER en s'éloignant de F dans le sens de propagation
 *   du rayon — abscisses croissantes depuis F —, jamais nécessairement le plus proche numériquement
 *   de F, voir `generateurs6e/proprietesOptiquesConiques/familleUnique.ts`).
 * - Écran 4 : équation du rayon réfléchi via la PROPRIÉTÉ FOCALE — droite joignant le point de
 *   réflexion CONFIRMÉ de l'écran 3 à l'AUTRE foyer F' CONFIRMÉ de l'écran 1 — jamais un calcul de
 *   tangente + loi de réflexion classique (piège central de ce générateur, voir mission).
 */

export type NatureOptique = "ellipse" | "hyperbole";

export interface ExerciceProprietesOptiquesConiques {
  natureConique: NatureOptique;
  /** Demi-axe le long de l'axe focal (horizontal) — entier, toujours strictement positif. */
  a: number;
  /** Distance focale — entier, toujours strictement positif (`c=√(a²-b²)` ellipse,
   * `c=√(a²+b²)` hyperbole — jamais recalculé côté vérification, déjà résolu ici). */
  c: number;
  /** `b²` — entier, toujours strictement positif. */
  bCarre: number;
  /** `p·x²+q·y²=n`, axe horizontal, centrée à l'origine — réponse ATTENDUE implicite de l'écran 1
   * (donnée dans le bloc données ; l'écran 1 porte sur les FOYERS, pas sur cette équation elle-même,
   * contrairement à `6gen61` famille A). */
  conique: ConiqueGenerale;
  /** Foyer SOURCE du rayon incident — abscisse toujours NÉGATIVE (`{x:-c,y:0}`). Réponse ATTENDUE
   * de l'écran 1. */
  foyerF: Point;
  /** Autre foyer (`{x:c,y:0}`) — réponse ATTENDUE de l'écran 1, réutilisé comme donnée CONFIRMÉE à
   * l'écran 4 (propriété focale). */
  foyerFPrime: Point;
  /** Rayon incident — passe par `foyerF`, pente `tanAlpha=droiteIncidente.m`. Réponse ATTENDUE
   * (partie équation) de l'écran 2. */
  droiteIncidente: DroiteAffine;
  /** Les 2 points d'intersection rayon incident / conique — réponse ATTENDUE (partie points) de
   * l'écran 2. Ordre arbitraire (déterminé par `resoudreIntersectionDroiteConique`), jamais
   * significatif : l'écran 3 désigne le bon par `indexReflexion`, jamais par une convention d'ordre. */
  pointsIntersection: [PointFrac, PointFrac];
  /** Lequel des 2 `pointsIntersection` est le point de réflexion RÉEL — celui atteint EN PREMIER en
   * s'éloignant de F vers les abscisses croissantes (sens de propagation du rayon). Réponse ATTENDUE
   * de l'écran 3. */
  indexReflexion: 0 | 1;
  /** Rayon réfléchi — droite joignant `pointsIntersection[indexReflexion]` à `foyerFPrime`,
   * PROPRIÉTÉ FOCALE (jamais une tangente + loi de réflexion). Réponse ATTENDUE de l'écran 4. */
  droiteReflechie: DroiteAffine;
}
