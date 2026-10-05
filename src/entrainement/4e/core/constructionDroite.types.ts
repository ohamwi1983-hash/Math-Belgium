/**
 * Couche A — contrat "Construction graphique — tracer une droite depuis son équation". Troisième
 * générateur du groupe "droites" (`core/droite.types.ts`) — le sens inverse de "Lecture graphique —
 * équation d'une droite" : partir d'une équation DONNÉE, sous l'une des 4 formes de sortie, pour en
 * produire puis TRACER 2 points, plutôt que lire un graphe pour en extraire l'équation.
 *
 * `Point`/`Composantes` réutilisés de `core/vecteur.types.ts` ; `DroiteImplicite`/`DroiteExpliciteY`/
 * `DroiteExpliciteX`/`DroiteParametrique`/`FormeSortieDroite` de `core/droite.types.ts` — jamais
 * redéfinis ici.
 */
import type {
  DroiteExpliciteX,
  DroiteExpliciteY,
  DroiteImplicite,
  DroiteParametrique,
  FormeSortieDroite,
} from "./droite.types";
import type { Composantes, Point } from "./vecteur.types";

/** Une variante par forme de sortie possible — même axe que "Équation d'une droite". */
export type VarianteConstructionDroite = FormeSortieDroite;

export interface ExerciceConstructionDroite {
  variante: VarianteConstructionDroite;
  /** Un seul des 4 champs suivants est non-null — celui désigné par `variante` — jamais une union
   * discriminée : ces 4 formes restent directement adressables sans narrowing supplémentaire. */
  parametrique: DroiteParametrique | null;
  implicite: DroiteImplicite | null;
  expliciteY: DroiteExpliciteY | null;
  expliciteX: DroiteExpliciteX | null;
  /** Forme implicite dérivée de `point`/`vecteur`, calculée une seule fois — seule référence
   * consommée par la vérification d'appartenance de l'écran 1 (`verificationConstructionDroite.ts`),
   * quelle que soit `variante` (les 4 formes décrivent exactement la même droite). */
  referenceImplicite: DroiteImplicite;
  /** Point/vecteur canoniques (entiers) ayant servi à dériver la forme active — jamais montrés
   * numériquement à l'élève : servent uniquement de repli pour l'écran 2 (tentatives épuisées à
   * l'écran 1, aucune réponse élève à reporter) et à calibrer le cadrage initial du graphe. */
  point: Point;
  vecteur: Composantes;
}

export type GenerateurExerciceConstructionDroite = () => ExerciceConstructionDroite;
