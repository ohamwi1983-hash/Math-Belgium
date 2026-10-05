/**
 * Couche core — "Lieux géométriques : intersection" (position 54). REFONTE COMPLÈTE
 * (`promptgen54refontecomplete.md`) — remplace entièrement l'architecture précédente (diagnostic
 * catégoriel 0/1/2 points puis résolution fixe p1/p2). Nouvelle architecture à 3 écrans, communs
 * aux 3 grandes variantes (`paire`) :
 * 1. Identification — l'élève reconnaît lui-même le TYPE de chacun des 2 lieux (droite/cercle/
 *    parabole) à partir d'une description purement VERBALE (aucune équation, aucun terme technique
 *    révélateur — voir la convention d'énoncé ci-dessous), puis en extrait les paramètres.
 * 2. Équations — écrit l'équation de chaque lieu (texte libre, vérifiée par équivalence algébrique).
 * 3. Résolution — résout le système, dénombre puis donne les points d'intersection (add-as-needed).
 *
 * ## ⚠️ Convention d'énoncé propre à ce générateur — divergence ASSUMÉE, ne jamais "corriger"
 *
 * Contrairement à la convention standard du chapitre 6 (droite toujours réduite à `\equiv
 * ax+by+c=0`), ce générateur ne montre JAMAIS d'équation dans l'énoncé — chaque lieu est décrit par
 * une formulation VERBALE de sa définition mathématique (ex. "les points dont les ordonnées sont
 * les triples de leurs abscisses" pour une droite `y=3x` ; "les points situés à une distance de 5
 * unités du point (2;-3)" pour un cercle ; "les points équidistants du point (-1;0) et de la droite
 * d'équation x=-3" pour une parabole) — jamais les mots "centre" ou "foyer" utilisés pour désigner
 * ces points dans l'énoncé, l'élève doit déduire lui-même la nature du lieu. C'est justement l'objet
 * de l'écran 1 : reconnaître le TYPE puis en extraire les paramètres, jamais une donnée déjà nommée.
 *
 * Comme dans la version précédente de ce générateur, chaque exercice a sa géométrie ENTIÈREMENT
 * FIXÉE à la génération (pas de "cohérence interne" à la `ExerciceConstructionParabole` — rien
 * n'est choisi librement par l'élève) : `points` est LA référence fixe comparée par le moteur.
 *
 * Réutilise directement `Point` (`core/vecteur.types.ts`) et `OrientationParabole`
 * (`core/equationParabole.types.ts`, même concept d'axe déjà partagé par 2 générateurs — la
 * parabole d'ici s'ajoute comme 3e réutilisateur).
 */
import type { OrientationParabole } from "./equationParabole.types";
import type { Point } from "./vecteur.types";

export type TypeLieu = "droite" | "cercle" | "parabole";

/** Les 3 grandes variantes selon la paire de types de lieux réellement générée — les 6 autres
 * combinaisons théoriques (droite-droite, cercle-parabole, parabole-parabole) sont hors périmètre du
 * générateur, jamais tirées. */
export type PaireLieux = "cercleDroite" | "cercleCercle" | "droiteParabole";

/** 0, 1 (tangence) ou 2 points d'intersection. */
export type NombrePointsIntersection = 0 | 1 | 2;

export interface LieuDroite {
  type: "droite";
  /** Pente — jamais nulle et toujours définie (contrainte de génération : exclut les droites
   * horizontales et verticales, la formulation verbale de pente ne fonctionnant naturellement que
   * pour une pente non nulle et définie). */
  m: number;
  /** Ordonnée à l'origine — `y = m·x + p`. */
  p: number;
}

export interface LieuCercle {
  type: "cercle";
  centre: Point;
  /** Toujours un entier strictement positif. */
  rayon: number;
}

export interface LieuParabole {
  type: "parabole";
  foyer: Point;
  orientation: OrientationParabole;
  /** Valeur de la droite directrice — horizontale (`y=directrice`) si `orientation==="vertical"`,
   * verticale (`x=directrice`) sinon. Toujours différente de la composante correspondante de
   * `foyer` (parabole non dégénérée). Donnée affichée dans l'énoncé (avec le foyer), jamais le
   * paramètre `p` directement — c'est justement ce que l'élève doit calculer à l'écran 1. */
  directrice: number;
  /** Paramètre p, composante SIGNÉE — MÊME convention que `ExerciceEquationParabole.p`
   * (`core/equationParabole.types.ts`) : axe vertical → `foyer.y-directrice` (= `2(y_F-y_S)`) ; axe
   * horizontal → `foyer.x-directrice` (= `2(x_F-x_S)`), puisque le sommet S est le milieu entre F et
   * la directrice. Précalculé une fois à la génération — réponse attendue au champ "p" de l'écran 1,
   * jamais recalculée différemment côté vérification. */
  p: number;
}

export type Lieu = LieuDroite | LieuCercle | LieuParabole;

/** Coefficients `A·t²+B·t+C=0` de la substitution de la droite (ou, pour la paire cercle-cercle,
 * l'axe radical) dans l'équation de l'autre lieu (paramétrage point+direction de la droite) —
 * précalculés à la génération pour que l'aide niveau 2 de l'écran "résolution" puisse afficher
 * "l'équation quadratique est déjà posée" sans dupliquer ce calcul côté présentation. */
export interface CoefficientsQuadratiqueT {
  A: number;
  B: number;
  C: number;
}

export interface ExerciceLieuxGeometriques {
  paire: PaireLieux;
  lieu1: Lieu;
  lieu2: Lieu;
  nombrePoints: NombrePointsIntersection;
  /** 0, 1 ou 2 points, référence exacte fixée à la génération. */
  points: Point[];
  quadratique: CoefficientsQuadratiqueT;
}

export type GenerateurExerciceLieuxGeometriques = () => ExerciceLieuxGeometriques;
