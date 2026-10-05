/**
 * Couche core — "Angles associés" (chapitre 3, dix-septième générateur). Remplace, à la même
 * position 17 de l'application, "Loi des sinus" (retirée de l'app — voir CLAUDE.md, section dédiée,
 * pour la nuance : le générateur `src/generateurs/loiSinus/` lui-même, sa vérification et son
 * croquis restent en place, réutilisés par "Problèmes contextualisés"). Un troisième générateur
 * distinct portant ce même nom "Angles associés" avait déjà existé en position 16 — retiré à son
 * tour et remplacé par "L'un sans l'autre" (`core/unSansLautre.types.ts`) — celui-ci est un
 * générateur entièrement nouveau, pas une relocalisation.
 *
 * Contrairement à "L'un sans l'autre" (θ purement symbolique, une seule valeur connue), l'angle de
 * base `alpha` est ici un VRAI angle en degrés (entier, toujours dans `]0°,90°[`) — l'élève voit un
 * angle demandé concret (`theta`, ex. "108°"), jamais une expression symbolique.
 *
 * **Restructuration complète (`promptcorrectionsgenerateur17structure.md`)** : l'ancien QCM
 * "identifier la relation" est retiré, remplacé par une séquence de 1 à 3 écrans à réponse NUMÉRIQUE
 * en degrés — voir `xReference` ci-dessous pour la première question (toujours posée), et
 * `ExerciceAnglesAssociesSinCos.sousCas` pour la seconde (conditionnelle). Seule l'étape finale
 * ("Valeur finale") continue de comparer une valeur APPROCHÉE : `valeurCible`, dérivée
 * algébriquement des valeurs affichées (`sinAlpha`/`cosAlpha`/`tanAlpha`, arrondies à 3 décimales)
 * — jamais recalculée via `Math.sin`/`Math.cos`/`Math.tan` sur `theta` lui-même, ce qui
 * désynchroniserait la cible des seules valeurs que l'élève peut réellement utiliser sans
 * calculatrice. `theta`/`alpha`/`xReference`, eux, sont des entiers EXACTS (aucune approximation),
 * comparés en degrés sans cette contrainte.
 */
import type { QuadrantOuvert } from "./unSansLautre.types";

/** Réutilise directement `QuadrantOuvert` (générateur "L'un sans l'autre") — même sémantique
 * exacte (un quadrant strictement I à IV, jamais un angle sur un axe), jamais un type dupliqué pour
 * la même notion. */
export type QuadrantAnglesAssocies = QuadrantOuvert;

export type VarianteAnglesAssocies = "sinCos" | "tangente";

export type FonctionSinCos = "sin" | "cos";

/** Relation identifiée à l'écran 2 — toujours dérivée directement du quadrant de l'angle demandé,
 * jamais un second choix indépendant (voir la table quadrant→relation dans le générateur). */
export type RelationAnglesAssocies = "complementaireDirecte" | "supplementaire" | "antiSupplementaire" | "oppose";

/**
 * Catalogue de variantes (convention CLAUDE.md) — combine `variante` ET `relation` en un seul id,
 * puisque le quadrant I (`complementaireDirecte`) n'existe que pour la variante sin/cos (la
 * relation complémentaire n'est jamais utilisée pour tan, voir la spec : elle impliquerait une
 * division `1/tan(x)` peu adaptée à un calcul sans calculatrice) — 7 combinaisons valides, jamais
 * les 4×2=8 qu'un simple produit cartésien suggérerait.
 */
export type IdVarianteAnglesAssocies =
  | "sinCos-complementaireDirecte"
  | "sinCos-supplementaire"
  | "sinCos-antiSupplementaire"
  | "sinCos-oppose"
  | "tangente-supplementaire"
  | "tangente-antiSupplementaire"
  | "tangente-oppose";

interface ExerciceAnglesAssociesBase {
  alpha: number; // angle de base, entier, toujours dans ]0°,90°[
  quadrant: QuadrantAnglesAssocies; // quadrant de l'angle DEMANDÉ (theta), jamais celui d'alpha (toujours I)
  relation: RelationAnglesAssocies; // pilote uniquement le LIBELLÉ de la question 1 (formatAnglesAssocies.ts), toujours une pure fonction de `quadrant` — jamais un second tirage indépendant
  theta: number; // angle demandé réel, en degrés (entier par construction)
  /**
   * Réponse attendue à la "question 1" (`promptcorrectionsgenerateur17structure.md`, section 2) —
   * l'angle symétrique de `theta` en quadrant I, calculé par la relation identifiée par `quadrant`
   * (`90-theta` en Q1, `180-theta` en Q2, `theta-180` en Q3, `360-theta` en Q4). C'est CE champ,
   * comparé à `alpha`, qui pilote la présence de l'écran intermédiaire "question complémentaire"
   * (`xReference !== alpha` ⟹ écran affiché) — jamais `sousCas` directement, qui reste un détail de
   * construction interne (voir `ExerciceAnglesAssociesSinCos`) : les deux coïncident presque
   * toujours, sauf le cas dégénéré `alpha=45` où `90-alpha=alpha`, auquel cas `xReference===alpha`
   * malgré un `sousCas="complement"` tiré — l'écran intermédiaire doit alors être sauté (la question
   * y serait triviale/redondante), ce que seule la comparaison `xReference!==alpha` capture
   * correctement.
   */
  xReference: number;
  valeurCible: number; // réponse attendue à l'écran "Valeur finale", dérivée des valeurs approchées affichées
}

/**
 * Variante sin/cos — `sinAlpha`/`cosAlpha` TOUJOURS donnés ensemble (jamais un seul des deux, voir
 * spec section "Variante A"). `fonctionCible` : celle des deux (sin OU cos, jamais les deux) dont
 * la valeur est demandée pour l'angle `theta`. `sousCas` (`"directe"` = le symétrique en quadrant I
 * de `theta` vaut exactement `alpha` ; `"complement"` = il vaut `90°-alpha`) : détail de
 * CONSTRUCTION uniquement (pilote le calcul de `valeurCible`, via un échange sin/cos) — toujours
 * `"directe"` pour le quadrant I. Ne pas l'utiliser pour décider si l'écran "question
 * complémentaire" doit s'afficher : c'est `xReference !== alpha` qui en décide (voir sa doc).
 */
export interface ExerciceAnglesAssociesSinCos extends ExerciceAnglesAssociesBase {
  variante: "sinCos";
  sinAlpha: number; // arrondi à 3 décimales, toujours positif (alpha dans le premier quadrant)
  cosAlpha: number; // idem
  fonctionCible: FonctionSinCos;
  sousCas: "directe" | "complement";
}

/** Variante tangente — jamais de quadrant I (voir spec, "toujours situé en quadrant II, III ou
 * IV") ni de sous-cas "complement" (la relation complémentaire est explicitement exclue pour tan). */
export interface ExerciceAnglesAssociesTangente extends ExerciceAnglesAssociesBase {
  variante: "tangente";
  tanAlpha: number; // arrondi à 3 décimales
}

export type ExerciceAnglesAssocies = ExerciceAnglesAssociesSinCos | ExerciceAnglesAssociesTangente;

export type GenerateurExerciceAnglesAssocies = () => ExerciceAnglesAssocies;
