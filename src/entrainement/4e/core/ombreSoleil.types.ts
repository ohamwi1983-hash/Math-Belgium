import type { Point3D, Solide3D } from "./geometrieEspace.types";

/**
 * Contrat — "Ombre au soleil" (41e générateur, chapitre "Géométrie dans l'espace"). Projection
 * parallèle : une direction de lumière fixe (`direction`, JAMAIS montrée numériquement à l'élève)
 * projette des piquets verticaux vers le sol (z=0) ou, pour la variante `obstacle`, vers un ou
 * plusieurs solides-obstacles posés au sol — vérité terrain calculée une seule fois à la
 * génération, jamais recalculée différemment en cours d'exercice.
 *
 * **Simplification délibérée pour les variantes `simple`/`obstacle`, documentée ici plutôt que
 * devinée** : l'objet dont on cherche l'ombre est modélisé comme un piquet vertical isolé (jamais
 * un sommet d'un solide gabarit du chapitre) — même modèle qu'un "bâton" planté au sol, jamais une
 * arête/un solide réel. Le rendu SVG partagé (`Solide3DSketch`) reste réutilisé tel quel : le(s)
 * piquet(s)/obstacle(s)/sol sont encodés comme un `Solide3D` de cadrage synthétique (jamais un des
 * gabarits du chapitre pour le PIQUET lui-même), ses sommets nommés ne sont jamais étiquetés
 * (`labelsSommets={false}`) — tous les points réellement montrés à l'élève passent par
 * `pointsExtra`/`segmentsExtra`, comme "Section plane d'un solide" le fait déjà pour ses points de
 * section.
 *
 * **Variante `directionInconnue` (C), à l'inverse, projette réellement les sommets d'un gabarit** —
 * `pyramideCarree`/`campanile` (`GABARITS_OMBRE_DIRECTION_INCONNUE`,
 * `generateurs/solide3D/gabarits.ts`) : `solide` porte l'INSTANCE réellement tirée (coordonnées
 * internes fixes du gabarit, translatée horizontalement une seule fois pour varier sa position dans
 * la scène), affichée en wireframe complet ; `piquetConnu` et chaque élément de `piquets` sont
 * TOUJOURS des sommets non-sol (z>0) de ce même solide, jamais des points indépendants.
 */

export type VarianteOmbreSoleil = "simple" | "obstacle" | "directionInconnue";

export interface Piquet {
  id: string;
  base: Point3D; // toujours z=0
  hauteur: number; // sommet implicite = base + (0,0,hauteur)
}

/** Direction candidate pour les écrans de sélection (étape "direction" des variantes B/C, dérivation
 * implicite des candidats-points de la variante A) — `id` interne, jamais montré tel quel à l'élève
 * (libellés dérivés côté présentation). */
export interface DirectionCandidate {
  id: string;
  vecteur: Point3D;
}

/** Un piquet à résoudre, avec sa vérité terrain déjà calculée (jamais recalculée différemment côté
 * présentation/vérification — seule la Couche A calcule la géométrie de construction). */
export interface PiquetAResoudre {
  piquet: Piquet;
  ombre: Point3D;
  surObstacle: boolean;
}

export interface ExerciceOmbreSoleilSimple {
  variante: "simple";
  direction: Point3D;
  directionsCandidates: DirectionCandidate[];
  piquetExemple: Piquet;
  ombreExemple: Point3D;
  piquet: PiquetAResoudre;
}

/** Un solide-obstacle vrai (jamais un simple mur plat) — soit une caisse (réutilise directement un
 * gabarit existant du chapitre), soit l'escalier de caisses empilées (`construireEscalierCaisses`,
 * section 1.c) : les deux modélisés comme un vrai `Solide3D`, testé comme un bloc ATOMIQUE via
 * l'algorithme général d'intersection rayon/solide (`intersectionAvecSolide`,
 * `generateurs/solide3D/geometrieEspace.ts`) — jamais itéré marche par marche/face par face côté
 * élève. */
export type TypeObstacleOmbreSoleil = "caisse" | "escalier";

export interface ObstacleOmbreSoleil {
  type: TypeObstacleOmbreSoleil;
  solide: Solide3D;
}

/** Un obstacle à résoudre dans la boucle de la variante B — même principe que `PiquetAResoudre`
 * (vérité terrain déjà calculée à la génération, jamais recalculée côté présentation/vérification) :
 * `ombre` teste la direction VRAIE contre CE seul solide, indépendamment des autres obstacles de la
 * scène (une itération de boucle = un solide-obstacle, jamais une face ni une marche) — `surObstacle`
 * vrai si ce solide précis est réellement touché, auquel cas `ombre` est un point sur sa surface ;
 * sinon `ombre` retombe directement sur le sol (comme si cet obstacle était seul dans la scène). */
export interface ObstacleAResoudre {
  obstacle: ObstacleOmbreSoleil;
  ombre: Point3D;
  surObstacle: boolean;
}

export interface ExerciceOmbreSoleilObstacle {
  variante: "obstacle";
  direction: Point3D;
  directionsCandidates: DirectionCandidate[];
  piquetExemple: Piquet;
  ombreExemple: Point3D;
  /** Le "bâton" isolé dont on cherche l'ombre — même modèle qu'un piquet planté au sol (comme la
   * variante A), jamais un sommet d'un des solides-obstacles de la scène. */
  baton: Piquet;
  /** 1 à 3 solides-obstacles à résoudre, une itération de boucle par obstacle (jamais par
   * face/marche) — décision explicite prise en conversation, préférée à une itération plus fine. */
  obstacles: ObstacleAResoudre[];
  /** Index dans `obstacles` du solide RÉELLEMENT touché par l'ombre du bâton (le premier rencontré le
   * long du rayon), ou `null` si aucun ne l'est (l'ombre atteint alors directement le sol) — vérité
   * terrain GLOBALE de la scène entière, distincte du test PAR obstacle porté par `ObstacleAResoudre`
   * : utilisée par l'écran de conclusion pour reconstituer l'ombre réelle, jamais par la boucle
   * elle-même. */
  indexObstacleTouche: number | null;
  /** Le point d'ombre final réel de la scène — sur `obstacles[indexObstacleTouche].obstacle`, ou au
   * sol si `indexObstacleTouche` est `null`. */
  ombre: Point3D;
}

export interface ExerciceOmbreSoleilDirectionInconnue {
  variante: "directionInconnue";
  direction: Point3D;
  directionsCandidates: DirectionCandidate[];
  /** Le gabarit RÉELLEMENT tiré (pyramideCarree ou campanile), translaté aléatoirement — toujours
   * affiché en wireframe complet, jamais réduit à ses seuls sommets projetés. */
  solide: Solide3D;
  /** Un sommet NON-SOL de `solide`, tiré au hasard — jamais un sommet de base (z=0), dont l'ombre
   * coïnciderait trivialement avec lui-même et ne permettrait aucune déduction de direction. */
  piquetConnu: Piquet;
  ombreConnue: Point3D;
  /** Les AUTRES sommets non-sol de `solide` (jamais `piquetConnu` lui-même) — 0 pour la pyramide
   * (un seul sommet non-sol au total, l'apex, déjà consommé par `piquetConnu` : cas dégénéré
   * assumé, déjà géré par la Couche B — transition directe vers "conclusion" après l'étape 0), 1 à
   * 4 pour le campanile. */
  piquets: PiquetAResoudre[];
}

export type ExerciceOmbreSoleil = ExerciceOmbreSoleilSimple | ExerciceOmbreSoleilObstacle | ExerciceOmbreSoleilDirectionInconnue;

export type GenerateurExerciceOmbreSoleil = () => ExerciceOmbreSoleil;
