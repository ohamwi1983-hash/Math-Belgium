import type { PlanSolide3D, Point3D, Solide3D } from "./geometrieEspace.types";
import type { MilieuNomme } from "./positionsPlans.types";

/**
 * Types de gen103 — « Démontrer un parallélisme » (4e, chapitre 8 « Géométrie dans l'espace »,
 * section `parallelisme`, processus 3 TRANSFÉRER). Deux variantes (catalogue du sélecteur et des
 * feuilles), sur un solide dessiné en perspective cavalière, SANS coordonnées :
 * - `droite-plan` : « Démontre que la droite (T) est parallèle au plan (Π). » Écran 1 : le critère du
 *   cours ; écran 2 : la droite témoin (une droite du plan parallèle à (T)) parmi des droites
 *   nommées ; écran 3 : la justification de ce parallélisme ;
 * - `deux-plans` : « Démontre que les plans (P) et (Q) sont parallèles. » Écran 1 : le critère ;
 *   écran 2 : deux parallélismes « droite de (P) ∥ droite de (Q) » dont les droites de (P) sont
 *   sécantes ; écrans 3 et 4 : la justification de chacun.
 * - `alignes` (ajoutée EN FIN de catalogue, manuel ex. 11) : voir `ExerciceTroisPointsAlignes`.
 *
 * Ce que l'élève décide (critère, droites témoins, justifications) n'entre jamais dans `forme`
 * (profil des évaluations) : la forme est la variante seule.
 * Aucune coordonnée n'est montrée : les positions 3D du solide restent la vérité terrain interne.
 */

export type VarianteDemontrerParallelisme = "droite-plan" | "deux-plans" | "alignes";

/** Une droite nommée par deux points nommés (sommets ou milieux nommés). */
export type DroiteNommee2 = [string, string];

/**
 * Raison géométrique d'un parallélisme entre deux droites nommées — les trois justifications que
 * le cours permet à ce niveau :
 * - `quad` : côtés opposés d'un parallélogramme (face du solide ou plan diagonal : rectangle, carré,
 *   parallélogramme) — `figure` = les 4 sommets dans l'ordre cyclique ;
 * - `milieux` : droite des milieux dans un triangle — `figure` = [X, Y, Z] (milieux de [XY] et [XZ]),
 *   `milieux` = leurs deux noms ;
 * - `milieuxParallelogramme` : droite qui joint les milieux de deux côtés opposés d'un parallélogramme
 *   — `figure` = les 4 sommets dans l'ordre cyclique, `cotes` = les deux côtés coupés en leur milieu.
 */
export type TypeRaisonParallele = "quad" | "milieux" | "milieuxParallelogramme";

export type NatureQuadrilatere = "rectangle" | "carré" | "parallélogramme";

export interface RaisonParallele {
  type: TypeRaisonParallele;
  /** Les deux droites parallèles, telles qu'elles sont écrites partout (énoncé, options, corrigé). */
  droite1: DroiteNommee2;
  droite2: DroiteNommee2;
  figure: string[];
  nature: NatureQuadrilatere | null;
  milieux: [string, string] | null;
  cotes: [DroiteNommee2, DroiteNommee2] | null;
}

/** Une option d'un choix fermé : une seule valable par écran. */
export interface OptionDemonstration {
  texte: string;
  valide: boolean;
  /** Pourquoi l'option ne convient pas (explication, corrigé) — vide pour l'option valable. */
  defaut: string;
}

/** Un parallélisme proposé à l'écran 2 de `deux-plans` : « (gauche) ∥ (droite) ». */
export interface CandidatParallelisme {
  gauche: DroiteNommee2;
  droite: DroiteNommee2;
  /** Pourquoi il ne convient pas (`null` s'il est valable : droite de (P) ∥ droite de (Q)). */
  defaut: string | null;
  /** Valable : la raison du parallélisme et les options de justification (écrans 3 et 4). */
  raison: RaisonParallele | null;
  justifications: OptionDemonstration[];
}

interface ExerciceCommun {
  solide: Solide3D;
  milieux: MilieuNomme[];
  /** Options du critère (écran 1), ordre mélangé. */
  criteres: OptionDemonstration[];
}

export interface ExerciceDroitePlanParallele extends ExerciceCommun {
  variante: "droite-plan";
  /** Le plan (Π), nommé par 3 points. */
  plans: [PlanSolide3D];
  /** La droite (T) dont on démontre le parallélisme au plan. */
  droite: DroiteNommee2;
  /** Droites proposées à l'écran 2 (ordre mélangé) ; une seule est une droite témoin. */
  candidats: DroiteNommee2[];
  temoin: number;
  /** Pourquoi chaque candidat ne convient pas (`null` pour la droite témoin). */
  defautsCandidats: (string | null)[];
  raison: RaisonParallele;
  justifications: OptionDemonstration[];
}

export interface ExerciceDeuxPlansParalleles extends ExerciceCommun {
  variante: "deux-plans";
  /** (P) puis (Q). */
  plans: [PlanSolide3D, PlanSolide3D];
  candidats: CandidatParallelisme[];
  /** Paire montrée quand la réponse est révélée (indices dans `candidats`, croissants). */
  paireAttendue: [number, number];
}

/**
 * Variante `alignes` (manuel, ex. 11 « Démontrer ») : pyramide SABC (même format que les gabarits du socle,
 * dessinée comme la figure du manuel), M, N, P sur les arêtes [SA], [SB], [SC].
 * - `general` : I = (MN) ∩ (AB), J = (NP) ∩ (BC), K = (MP) ∩ (AC) existent ; « Démontre que les
 *   points I, J et K sont alignés. » Écran 1 : l'idée (trois points communs à deux plans sécants) ;
 *   écran 2 : pourquoi I, J, K sont communs aux plans (MNP) et (ABC) ; écran 3 : les deux plans sont
 *   distincts et sécants, leur intersection est une droite qui porte I, J, K.
 * - `toit` (cas particulier du manuel, 11 b ; tiré une fois sur trois) : un côté du triangle MNP est
 *   parallèle au côté correspondant de ABC — l'énoncé le DIT, ce n'est pas un verdict —, le point
 *   correspondant n'existe pas ; « Démontre que la droite (IJ) est parallèle à la droite (AC). »
 *   Écrans : l'idée (droite d'intersection + théorème du toit), les deux points communs, le théorème
 *   du toit.
 * Aucune coordonnée ni aucun rapport n'est montré : les positions 3D restent la vérité terrain.
 */
export type CasTroisPointsAlignes = "general" | "toit";

/** Point d'une arête issue du sommet : M ∈ [SA], N ∈ [SB], P ∈ [SC]. */
export interface PointAreteNomme {
  nom: string;
  position: Point3D;
  /** L'arête, sommet S d'abord : ["S", "A"]. */
  arete: [string, string];
}

/** Point construit, intersection d'un côté du triangle MNP et du côté correspondant de ABC. */
export interface PointIntersectionNomme {
  nom: string;
  /** Côté du triangle MNP, ex. ["M", "N"]. */
  droiteHaut: DroiteNommee2;
  /** Côté de la base, ex. ["A", "B"]. */
  droiteBase: DroiteNommee2;
  position: Point3D;
}

export interface ExerciceTroisPointsAlignes {
  variante: "alignes";
  solide: Solide3D;
  cas: CasTroisPointsAlignes;
  /** M, N, P. */
  points: [PointAreteNomme, PointAreteNomme, PointAreteNomme];
  /** Cas `toit` : le côté de MNP et le côté de ABC parallèles (énoncé), ex. [["M", "P"], ["A", "C"]]. */
  paralleles: [DroiteNommee2, DroiteNommee2] | null;
  /** Points construits qui existent, dans l'ordre I, J, K (trois ; deux dans le cas `toit`). */
  construits: PointIntersectionNomme[];
  /** Options des trois écrans (ordre mélangé, une seule valable par écran). */
  methodes: OptionDemonstration[];
  communs: OptionDemonstration[];
  conclusions: OptionDemonstration[];
}

export type ExerciceDemontrerParallelisme = ExerciceDroitePlanParallele | ExerciceDeuxPlansParalleles | ExerciceTroisPointsAlignes;
