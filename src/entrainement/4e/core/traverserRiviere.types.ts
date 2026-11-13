/**
 * Couche core — « Traverser une rivière : vitesses en composantes » (gen87, 4e, chapitre 6
 * « Calcul vectoriel », section « applications », processus 3 TRANSFÉRER).
 *
 * Une rivière de largeur L (m) coule à la vitesse c (m/s), parallèlement aux rives. Repère fixe :
 * origine au point de départ D, axe x le long de la rive dans le SENS DU COURANT, axe y
 * perpendiculaire aux rives, vers l'autre rive. Le point F(0 ; L) est « juste en face » de D.
 * Vitesses (m/s) : vitesse propre `v_p` (par rapport à l'eau), courant `v_c` = (c ; 0), vitesse
 * réelle `v_R` = `v_p` + `v_c` (par rapport à la rive). Tout se fait en COMPOSANTES — jamais la loi
 * des cosinus (c'est gen29).
 *
 * - `accostage` : on connaît `v_p` par ses composantes (px ; py), ou « perpendiculairement aux
 *   rives » (px = 0). On cherche `v_R`, la durée t = L / y(v_R) (le courant ne change PAS la durée :
 *   le piège visé), le point d'accostage A(x_A ; L) avec x_A = x(v_R) · t, puis la vitesse réelle
 *   ‖v_R‖ ou la distance réellement parcourue DA.
 * - `enFace` : on connaît la norme v de `v_p`, sa direction est à choisir pour arriver en F. La
 *   composante x de `v_p` compense le courant (−c), sa composante y vient de Pythagore
 *   (√(v² − c²)), puis t = L / y. Toujours v > c : le cas impossible (v ≤ c) n'est jamais tiré.
 */

export type SituationRiviere = "bateau" | "nageur" | "kayak" | "bac";

export type VarianteRiviere = "accostage" | "enFace";

/** Dernière question de la variante `accostage` : vitesse réelle ‖v_R‖ ou distance parcourue DA. */
export type QuatriemeRiviere = "vitesse" | "distance";

export interface ExerciceTraverserRiviere {
  variante: VarianteRiviere;
  situation: SituationRiviere;
  /** Largeur de la rivière (m, entier). */
  largeur: number;
  /** Vitesse du courant (m/s, au plus une décimale, > 0). */
  courant: number;
  /** `accostage` : composantes de la vitesse propre (au plus une décimale, py > 0). `enFace` : 0. */
  px: number;
  py: number;
  /** `accostage` : vitesse propre dirigée perpendiculairement aux rives (px = 0, donnée sans
   * composantes : l'élève écrit lui-même (0 ; py)). */
  perpendiculaire: boolean;
  /** `enFace` : norme de la vitesse propre (m/s, > courant) ; `accostage` : 0. */
  normePropre: number;
  /** `accostage` : vitesse réelle ou distance parcourue ; `enFace` : sans objet ("vitesse"). */
  quatrieme: QuatriemeRiviere;
}

/** Une grandeur demandée sur un écran (un écran a 1 ou 2 champs). */
export type GrandeurRiviere =
  | "vRx"
  | "vRy"
  | "duree"
  | "accostage"
  | "vitesse"
  | "distance"
  | "compensation"
  | "pythagore"
  | "dureeEnFace";
