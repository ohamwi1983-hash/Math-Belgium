/**
 * Couche A — contrat "Lecture graphique — équation d'une droite". Comble une compétence absente
 * ailleurs sur la plateforme : traduire une LECTURE GRAPHIQUE en équation, plutôt que recalculer
 * depuis des coordonnées déjà données en texte (contrairement à "Équation d'une droite").
 *
 * Réutilise directement `Point`/`Composantes` (`core/vecteur.types.ts`) et `DroiteImplicite`
 * (`core/droite.types.ts`) — mêmes contrats que les 3 autres générateurs sur les droites, jamais
 * réinventés. `point`/`vecteur` restent la SEULE vérité géométrique du contrat — la liste des
 * points à coordonnées entières effectivement visibles sur le graphe et le viewBox qui les cadre
 * sont des dérivations purement PRÉSENTATIONNELLES (`src/ui/lectureGraphiqueDroiteGraph.ts`),
 * jamais stockées ici : aucune vérification n'en dépend, seul le tracé du graphe en a besoin.
 */
import type { DroiteImplicite } from "./droite.types";
import type { Composantes, Point } from "./vecteur.types";

export type VarianteLectureGraphiqueDroite = "cartesienne" | "parametrique";

export interface ExerciceLectureGraphiqueDroite {
  variante: VarianteLectureGraphiqueDroite;
  /** Point de référence à coordonnées ENTIÈRES, toujours sur la droite. */
  point: Point;
  /** Vecteur directeur ENTIER et PRIMITIF (composantes réduites par leur pgcd) — garantit une
   * pente à petit dénominateur, donc des croisements à coordonnées entières à intervalle
   * raisonnable sur le quadrillage (contrainte de génération de la spec). */
  vecteur: Composantes;
  /** Forme implicite dérivée de `point`/`vecteur`, calculée une seule fois — seule référence
   * consommée par les vérifications (`verificationLectureGraphiqueDroite.ts`), jamais recalculée
   * différemment côté présentation. */
  referenceImplicite: DroiteImplicite;
}

export type GenerateurExerciceLectureGraphiqueDroite = () => ExerciceLectureGraphiqueDroite;
