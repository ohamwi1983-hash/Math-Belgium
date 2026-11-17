import type { PlanSolide3D, Point3D, Solide3D } from "./geometrieEspace.types";

/**
 * Types de gen101 — « Positions de deux plans et de trois plans » (4e, chapitre 8 « Géométrie dans
 * l'espace », section `trois-plans`, couvre aussi `deux-plans`, processus 2 APPLIQUER).
 *
 * Deux variantes (catalogue du sélecteur et des feuilles) — jamais une variante par verdict : ce que
 * l'élève doit DÉCIDER (position de deux plans, issue pour trois plans) est tiré au hasard, à parts
 * égales, dans chaque variante.
 * - `deux-plans` : deux plans d'un solide, chacun nommé par 3 points (sommets ou milieux nommés
 *   d'arêtes). Écran 1 : parallèles / confondus / sécants (choix fermé, UNE tentative). Écran 2 :
 *   sécants → désigner deux points communs (sommets, milieux nommés ou points construits comme
 *   intersection de deux droites d'une même face), la droite d'intersection se trace ensuite ;
 *   parallèles ou confondus → choisir la justification valable.
 * - `trois-plans` : trois plans d'un solide. Écran 1 : un seul point commun / une droite commune /
 *   aucun point commun (dont le « Toblerone » et le cas de plans parallèles). Écran 2 : choisir la
 *   justification valable (droite d'intersection de deux des plans, puis sa position par rapport au
 *   troisième ; ou deux plans parallèles).
 *
 * Aucune coordonnée n'est jamais montrée à l'élève : les `Point3D` sont la vérité terrain interne.
 */

export type VariantePositionsPlans = "deux-plans" | "trois-plans";

export type PositionDeuxPlans = "paralleles" | "confondus" | "secants";

export type IssueTroisPlans = "point" | "droite" | "aucun";

/** « aucun point commun » : sécants deux à deux suivant trois droites parallèles (Toblerone), ou
 * deux des plans parallèles. */
export type SousCasAucun = "toblerone" | "paralleles";

/** Milieu nommé d'une arête (I, J, K) — défini dans l'énoncé (« I est le milieu de [AE] »). */
export interface MilieuNomme {
  nom: string;
  position: Point3D;
  milieuDe: [string, string];
}

/** Un candidat de l'écran « deux points communs » : un point nommé (sommet ou milieu), ou un point
 * construit comme intersection de deux droites (chacune nommée par deux points nommés). */
export interface CandidatPointCommun {
  cle: string;
  /** « A », « I », ou « (FK) ∩ (BC) ». */
  libelle: string;
  /** Position réelle ; `null` pour deux droites qui ne se coupent pas (gauches : elles se croisent
   * seulement sur le dessin). */
  position: Point3D | null;
  /** Droites de la construction, `null` pour un point nommé. */
  construction: { droite1: [string, string]; droite2: [string, string] } | null;
}

/** Une option de justification (choix fermé) : texte complet, une seule valable par écran. */
export interface OptionJustification {
  texte: string;
  valide: boolean;
  /** Pourquoi une option est fausse (corrigé, explication) — vide pour l'option valable. */
  defaut: string;
}

interface ExerciceCommun {
  solide: Solide3D;
  milieux: MilieuNomme[];
}

export interface ExerciceDeuxPlans extends ExerciceCommun {
  variante: "deux-plans";
  plans: [PlanSolide3D, PlanSolide3D];
  position: PositionDeuxPlans;
  /** Sécants : candidats de l'écran 2 (ordre mélangé). Vide sinon. */
  candidats: CandidatPointCommun[];
  /** Sécants : indices (dans `candidats`) de la paire montrée quand la réponse est révélée. */
  paireAttendue: [number, number] | null;
  /** Parallèles ou confondus : options de l'écran 2 (ordre mélangé). Vide pour sécants. */
  justifications: OptionJustification[];
}

export interface ExerciceTroisPlans extends ExerciceCommun {
  variante: "trois-plans";
  plans: [PlanSolide3D, PlanSolide3D, PlanSolide3D];
  issue: IssueTroisPlans;
  sousCas: SousCasAucun | null;
  justifications: OptionJustification[];
}

export type ExercicePositionsPlans = ExerciceDeuxPlans | ExerciceTroisPlans;
