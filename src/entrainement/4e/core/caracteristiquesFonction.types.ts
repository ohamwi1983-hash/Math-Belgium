import type { Morceau } from "./inequation.types";

/**
 * Couche core — contrat propre à "Caractéristiques d'une fonction (lecture graphique)"
 * (chapitre 2, 4e/5e FWB). Comme "Transformations graphiques" et "Forme canonique et
 * transformations" (chapitre 1), ce générateur ne réutilise aucun type des onze premiers
 * exercices pour SON PROPRE contrat d'énoncé — la courbe est composite (dessinée zone par zone),
 * pas dérivée d'une seule formule algébrique connue des autres générateurs. Réutilise en revanche
 * directement `Morceau`/`Crochet`/`Borne` de "tableau de signes" pour les réponses guidées à liste
 * extensible (domaine, décroissance) — voir spec-caracteristiques-fonction-lecture-graphique.md et
 * prompt-refonte-caracteristiques-fonction.md (refonte à 8 points).
 *
 * Zones (x croissant) — inchangées dans leur structure qualitative depuis la spec d'origine :
 * - zone 1 (-∞,b1] : croissante, pente m1>0, vaut y1 en b1. Peut contenir un zéro (le premier
 *   zéro possible, dans la marge affichée à gauche de b1).
 * - zone 2 [b1,b2] : décroissante, de y1 à y2. Peut contenir un zéro.
 * - zone 3 [b2,b3] : croissante, passe par le point creux (c, valeurNaturelleC) — désormais un
 *   vrai point EXCLU du domaine (refonte point 1 : `c` rejoint `AV` dans la liste d'exclusions,
 *   plus de "point plein séparé" redéfini au même endroit — la valeur naturelle reste seulement la
 *   référence hollow tracée). Peut contenir un zéro (couplé à la zone 2 : si zone 2 traverse zéro,
 *   zone 3 traverse forcément zéro aussi, par continuité/monotonie — voir le générateur).
 * - zone 4 [b3,b4] : constante (= y3), interrompue par 0, 1 ou 2 "gaps" — intervalles OUVERTS
 *   ]g1,g2[ où le domaine est vraiment exclu (refonte point 1) ; les bornes g1/g2 elles-mêmes
 *   restent dans le domaine (points pleins), seul l'intérieur strict est exclu.
 * - zone 5 [b4,b5) : décroissante, de y3 à y5Naturel. Peut contenir un zéro. La valeur en b5
 *   (y5Naturel) est EXCLUE (cercle vide, "extrémité gauche de la discontinuité").
 * - discontinuité (refonte 3, correction 2 ; puis "3 cas possibles pour la discontinuité") : UNE
 *   SEULE abscisse partagée, `b5` — jamais deux bornes différentes (l'ancien `b6`, retiré : une
 *   discontinuité de saut se produit à une seule abscisse, deux valeurs de y pour ce même x,
 *   jamais deux x différents). `y5Naturel` (la limite non atteinte de la zone 5, toujours un
 *   cercle vide) est distinct de la valeur "naturelle" de la branche hyperbolique au même x=b5
 *   (`L + k/(b5-AV)`, garanti différent par `layoutValide`) — ce que ce second marqueur représente
 *   visuellement, et ce que vaut réellement f(b5), dépend désormais du cas tiré (`discontinuite`) :
 *   - `pointPlein` (cas 1, historique) : point plein appartenant réellement à la courbe — f(b5) =
 *     la valeur hyperbolique naturelle en b5.
 *   - `trou` (cas 2) : cercle vide des deux côtés, aucune valeur réelle — b5 est exclu du domaine,
 *     comme un point d'asymptote verticale mais sans comportement infini autour.
 *   - `pointRedefini` (cas 3) : cercle vide des deux côtés (comme `trou`) PLUS un point plein
 *     ISOLÉ à une autre ordonnée (`valeur`, entière, distincte des deux cercles vides et de 0) —
 *     f(b5) = cette valeur isolée, b5 reste dans le domaine.
 *   C'est aussi la seconde cible possible de la question f(v) (refonte point 7, corrigée en 3 pour
 *   cibler exactement `b5`) — la réponse attendue dépend du cas tiré (voir `discontinuite`).
 * - zones 6/7 : f(x) = L + k/(x-AV) pour x ∈ [b5,AV) ∪ (AV,+∞) SAUF exactement en x=b5, où
 *   `evaluerCourbeCaracteristiques` applique le cas de discontinuité — L jamais nul (refonte
 *   point 7, nécessaire pour que la zone 7 puisse avoir un zéro bien défini). Peut contenir un
 *   zéro dans la zone 7 (signe de k opposé au signe de L).
 *
 * Domaine de définition = ℝ \ ({AV} ∪ {c} ∪ gaps ∪ ({b5} si cas "trou")) — jamais un simple
 * "ℝ \ {point}" fixe (refonte point 1) : toujours au moins 2 morceaux exclus (AV, c), jusqu'à 5
 * avec 2 gaps et le cas "trou".
 *
 * Toutes les valeurs particulières (bornes de zones, zéros, ordonnée à l'origine, AV, L, v) sont
 * des entiers par construction (refonte point 3) — jamais de décimale/fraction pour ces repères.
 */
export interface Zone4Gap {
  /** intervalle OUVERT ]g1,g2[ exclu du domaine — g1 et g2 eux-mêmes restent dans le domaine. */
  g1: number;
  g2: number;
}

/**
 * Les 3 cas possibles de discontinuité, tirés aléatoirement à poids égal (voir
 * `genererExerciceCaracteristiquesFonction`). Le champ commun aux 3 cas (l'abscisse `b5`, la
 * valeur creuse `y5Naturel`) reste dans `ExerciceCaracteristiquesFonction` ; ce type ne porte que
 * ce qui varie entre les 3 cas — le cas 3 seul porte une donnée propre (`valeur`, l'ordonnée du
 * point isolé).
 */
export type CasDiscontinuite =
  | { type: "pointPlein" }
  | { type: "trou" }
  | { type: "pointRedefini"; valeur: number };

export interface ExerciceCaracteristiquesFonction {
  b1: number;
  b2: number;
  b3: number;
  b4: number;
  /** discontinuité de saut — abscisse UNIQUE partagée (refonte 3, correction 2) : fin de la zone 5
   * (y5Naturel, exclue) ET début de la zone 6 (valeur réelle sur la branche hyperbolique), jamais
   * deux bornes différentes. */
  b5: number;
  AV: number;
  c: number;
  valeurNaturelleC: number;
  y1: number;
  y2: number;
  y3: number;
  y5Naturel: number;
  m1: number;
  /** asymptote horizontale, jamais nulle (refonte point 7) */
  L: number;
  k: number;
  /** tous les zéros réels de la fonction sur le domaine affiché, triés croissant — 0 à 5 valeurs. */
  zeros: number[];
  /** 0, 1 ou 2 intervalles ouverts exclus du domaine, à l'intérieur de la zone 4. */
  gaps: Zone4Gap[];
  /** point choisi pour la question f(v) — toujours exactement `c` ou `b5` (refonte points 7 et
   * correction 2 de la refonte 3, depuis la fusion de l'ancien `b6` dans `b5`). */
  v: number;
  /** cas de discontinuité tiré à l'abscisse b5 — voir le commentaire de tête de fichier. */
  discontinuite: CasDiscontinuite;
}

export type GenerateurExerciceCaracteristiquesFonction = () => ExerciceCaracteristiquesFonction;

/**
 * 8 phases fixes, toujours dans le même ordre — aucun saut conditionnel, même principe que
 * sessionFormeCanoniqueTransformations.ts. Le graphique reste affiché en permanence sur les 8
 * écrans, sans variation — rien à cacher/révéler progressivement ici, contrairement aux autres
 * générateurs du projet. `croissance` et `constance` (refonte 2, correction 7) s'insèrent entre
 * `zeros` et `ordonnee`, aux côtés de `decroissance` — les 3 questions de "forme" de la courbe
 * groupées ensemble, avant les questions de "valeur" (ordonnee/valeur/asymptotes).
 */
export type PhaseCaracteristiquesFonction =
  | "domaine"
  | "zeros"
  | "croissance"
  | "decroissance"
  | "constance"
  | "ordonnee"
  | "valeur"
  | "asymptotes";

/**
 * Réponse guidée "liste de morceaux" (refonte points 1 et 5) — généralise la construction
 * "union de deux intervalles" de "tableau de signes" à N morceaux (bouton "+"), réutilisée telle
 * quelle pour le domaine (l'ensemble EXCLU) et la décroissance (l'ensemble des intervalles où la
 * fonction décroît). Un morceau à bornes égales (`borneGauche === borneDroite`, crochets fermés
 * des deux côtés) représente un point isolé exclu (AV, c) — pas de type dédié "point" séparé,
 * cette dégénérescence de `Morceau` couvre déjà ce cas.
 */
export type ReponseListeMorceaux = Morceau[];

/** Réponse guidée de l'étape "zéros" (refonte point 2) : nombre variable, jamais fixé à 2. */
export interface ReponseZerosCaracteristiques {
  aucun: boolean;
  /** ignoré si aucun===true */
  valeurs: number[];
}

/** Réponse binaire "existe / n'existe pas" (refonte points 6 et 7), partagée par ordonnée et f(v). */
export interface ReponseExistence {
  existe: boolean;
  /** ignoré si existe===false */
  valeur: number | null;
}

/** Réponse de l'étape "équations des asymptotes" (refonte point 8) : deux champs libres,
 * "AH ≡" (ex. "y=3") et "AV ≡" (ex. "x=7") — même format que "Axe de symétrie AS ≡". */
export interface ReponseAsymptotesCaracteristiques {
  ahTexte: string;
  avTexte: string;
}
