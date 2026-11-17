import type { Point3D, Solide3D } from "./geometrieEspace.types";
import type { CandidatPointCommun } from "./positionsPlans.types";

/**
 * Types de gen102 — « Point de percée par plan auxiliaire » (4e, chapitre 8 « Géométrie dans
 * l'espace », section `percee`, processus 2 APPLIQUER).
 *
 * Sur un solide en perspective cavalière, une droite d = (XY) (X et Y : sommets, milieux d'arêtes,
 * points aux tiers d'arêtes ou centres de faces) perce un plan α (une face, un plan diagonal ou un
 * plan par trois points). La méthode du cours, un écran par étape :
 * 1. choisir un plan auxiliaire π qui contient d (choix fermé, UNE tentative ; plusieurs bons choix
 *    possibles dans la liste — tout plan qui contient d convient, puisqu'il coupe α) ;
 * 2. désigner deux points communs à π et à α (points nommés ou points de rencontre de deux droites
 *    d'une même face) : la droite b = π ∩ α ;
 * 3. désigner le point de percée P = d ∩ b parmi des points numérotés sur d (un point NOUVEAU :
 *    jamais un point déjà nommé).
 *
 * Variantes (catalogue du sélecteur et des feuilles) = la nature du plan α. Aucune coordonnée n'est
 * jamais montrée : les `Point3D` sont la vérité terrain interne.
 */

export type VariantePercee = "face" | "diagonal" | "trois-points";

export type DefinitionPointNomme =
  | { type: "milieu"; arete: [string, string] }
  /** Point de [depuis vers] tel que (depuis → point) soit le tiers de l'arête. */
  | { type: "tiers"; depuis: string; vers: string }
  /** Centre d'une face (parallélogramme), nommée par ses sommets dans l'ordre (« BCGF »). */
  | { type: "centre"; face: string };

/** Point nommé de l'instance (autre qu'un sommet) : I, J, K, L. */
export interface PointNommePercee {
  nom: string;
  position: Point3D;
  definition: DefinitionPointNomme;
}

/** Nature d'un point numéroté de l'écran 3. */
export type NatureCandidatPercee = "percee" | "gauche" | "horsPlan";

/** Point numéroté de l'écran 3 : là où d croise, SUR LE DESSIN, une droite dessinée (arête, côté
 * d'un triangle) — ou la droite b pour le bon point. */
export interface CandidatPercee {
  numero: number;
  nature: NatureCandidatPercee;
  /** Deux points de la droite croisée ; pour le point de percée : les deux points de b de la paire
   * de référence (la droite est la même quelle que soit la paire juste choisie). */
  appui: [Point3D, Point3D];
  /** Nom de la droite croisée (« (FG) ») ; vide pour le point de percée (b, nommée selon la paire). */
  nomAppui: string;
  /** Intersection réelle avec d (droites coplanaires), `null` si elles sont gauches. */
  position: Point3D | null;
}

/** Ce qui suit le choix d'un plan auxiliaire VALABLE : écrans 2 et 3. */
export interface SuitePlanAuxiliaire {
  /** Candidats de l'écran 2 : tous les points nommés, puis des points de rencontre. */
  candidats: CandidatPointCommun[];
  /** Paire montrée quand la réponse de l'écran 2 est révélée (indices dans `candidats`). */
  paireAttendue: [number, number];
  /** Points numérotés de l'écran 3, dans l'ordre le long de d. */
  percee: CandidatPercee[];
}

export interface OptionPlanAuxiliaire {
  /** Nom du plan par trois points nommés (jamais les deux points de d à la fois). */
  nom: [string, string, string];
  contientDroite: boolean;
  /** Point de d absent du plan (option fausse), `null` sinon. */
  pointManquant: string | null;
  /** Écrans 2 et 3 avec ce plan ; `null` pour une option fausse, ou pour un bon plan dont la droite
   * commune avec α ne se construit pas avec les points de la figure (la suite se fait alors avec
   * l'option de référence). */
  suite: SuitePlanAuxiliaire | null;
}

export interface ExercicePercee {
  variante: VariantePercee;
  solide: Solide3D;
  /** Points nommés autres que les sommets, dans l'ordre de l'énoncé. */
  points: PointNommePercee[];
  droite: [string, string];
  plan: [string, string, string];
  /** Point de percée (vérité terrain). */
  percee: Point3D;
  /** Options de l'écran 1 (ordre mélangé). */
  options: OptionPlanAuxiliaire[];
  /** Option valable retenue pour la réponse révélée et le corrigé. */
  reference: number;
  /** Cas particulier : d est dans une face du solide, et cette face coupe α suivant une droite qui
   * passe par deux points nommés — aucun point à construire. */
  directe: boolean;
  /** Points 3D qui fixent le cadre de la figure (le même sur tous les écrans et sur papier). */
  pointsCadre: Point3D[];
}
