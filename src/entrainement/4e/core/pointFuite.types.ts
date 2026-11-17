/**
 * Types de gen105 — « Perspective centrale : point de fuite » (4e, chapitre 8 « Géométrie dans
 * l'espace », section `point-de-fuite`, s'appuie aussi sur `fenetre-durer`, processus 2 APPLIQUER).
 *
 * Le dessin est fait SUR LA VITRE (la « fenêtre de Dürer ») : un plan quadrillé, en unités du
 * quadrillage, x vers la droite, y vers le haut, cadre [0 ; LARGEUR_GRILLE] × [0 ; HAUTEUR_GRILLE].
 * La ligne d'horizon est l'horizontale y = `horizon`. Tous les points DONNÉS (ce que l'élève lit sur
 * la figure, à l'écran comme sur papier) tombent sur des nœuds du quadrillage ; les points à
 * construire tombent où la construction les met (intersection de deux droites).
 *
 * Variantes (catalogue du sélecteur et des feuilles) = la scène et la construction :
 * - `boite` : trouver le point de fuite d'une boîte à partir de deux arêtes fuyantes, puis un sommet
 *   de sa face arrière ;
 * - `carrelage` : point de fuite des diagonales d'un carrelage, puis le 2e rang de carreaux ;
 * - `poteaux` : sommet du 2e poteau d'une rangée de poteaux de même hauteur, puis le pied du 3e
 *   (même écart dans la réalité, par le milieu du 2e poteau) ;
 * - `panneaux` : placer un second panneau identique plus loin, sur les mêmes fuyantes.
 *
 * Chaque exercice : deux écrans de construction (placer un point, outils « droite par deux points »,
 * « horizontale », « verticale »), puis un écran de choix (l'affirmation vraie parmi trois) qui fait
 * le lien avec la perspective cavalière (fuyantes qui convergent, verticales et horizontales de face
 * qui restent parallèles, longueurs non conservées).
 */

export const LARGEUR_GRILLE = 12;
export const HAUTEUR_GRILLE = 9;

export type VariantePointFuite = "boite" | "carrelage" | "poteaux" | "panneaux";

export interface Pt {
  x: number;
  y: number;
}

/** Rôle d'un point nommé : donné (lu sur la figure), point de fuite, point construit. */
export type RolePointFuite = "donne" | "fuite" | "construit";

export interface PointNommeFuite {
  nom: string;
  p: Pt;
  role: RolePointFuite;
}

/**
 * Segment dessiné : `trait` (arête, bord, objet), `cache` (arête cachée, pointillé), `objet` (poteau,
 * trait épais), `fuyante` (fuyante donnée, orange fin), `aide` (prolongement de construction,
 * pointillé orange).
 */
export type StyleSegmentFuite = "trait" | "cache" | "objet" | "fuyante" | "aide";

export interface SegmentFuite {
  a: Pt;
  b: Pt;
  style: StyleSegmentFuite;
}

export interface SceneFuite {
  points: PointNommeFuite[];
  segments: SegmentFuite[];
}

export type NatureSupport = "fuyante" | "horizontale" | "verticale" | "diagonale" | "horizon" | "droite";

/** Une des deux droites qui portent le point à construire (construction de référence). */
export interface DroiteSupport {
  a: Pt;
  b: Pt;
  nature: NatureSupport;
  /** « la fuyante (BF) », « l'horizontale qui passe par B′ », « la ligne d'horizon »… */
  description: string;
}

export interface EtapeConstructionFuite {
  /** Nom du point à placer (« F », « A′ », « V », « R »…). */
  cible: string;
  position: Pt;
  /** Point de fuite : il est sur la ligne d'horizon (diagnostic dédié). */
  surHorizon: boolean;
  supports: [DroiteSupport, DroiteSupport];
  /** Consigne de l'écran (et de l'étape du corrigé). */
  consigne: string;
  /** Deux paliers d'aide : jamais la position finale (il reste à tracer et à placer). */
  aides: [string, string];
  /** Justification (explication après validation, ligne du corrigé). */
  justification: string;
  /** Ce qui s'ajoute à la figure une fois l'écran clos (point trouvé, prolongements, objet complété). */
  ajout: SceneFuite;
}

export interface AffirmationFuite {
  texte: string;
  vraie: boolean;
  /** Pourquoi elle est vraie ou fausse (explication, corrigé). */
  explication: string;
}

export interface ExercicePointFuite {
  variante: VariantePointFuite;
  /** Ordonnée de la ligne d'horizon (entière). */
  horizon: number;
  /** Texte de l'énoncé (scène, ce qui est donné). */
  contexte: string;
  /** Consigne globale papier de la construction (les deux points, puis compléter). */
  consigneConstruction: string;
  /** Figure de départ. */
  base: SceneFuite;
  etapes: [EtapeConstructionFuite, EtapeConstructionFuite];
  /** Trois affirmations dans l'ordre affiché (mélangé) : exactement une vraie. */
  affirmations: AffirmationFuite[];
}
