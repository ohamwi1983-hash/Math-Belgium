/**
 * Couche core — « Le cercle dans le réel : rotations en contexte » (gen79, 4e, chapitre 5, section
 * « equations », processus 3 TRANSFÉRER).
 *
 * Un point tourne autour d'un centre fixe (nacelle d'une grande roue, pointe d'une aiguille
 * d'horloge, pince d'un bras de robot, bout d'une pale d'éolienne, valve d'une roue de vélo). On
 * superpose le cercle trigonométrique : origine au centre de rotation, axe X horizontal vers la
 * droite, axe Y vertical vers le haut. Le piège de transfert : le contexte ne part PAS de 0° et ne
 * tourne pas forcément dans le sens trigonométrique — il faut convertir l'angle parcouru α en
 * angle trigonométrique θ = θ₀ + α (sens trigonométrique) ou θ = θ₀ − α (sens horaire).
 *
 * - Sens DIRECT : on connaît α (ou une durée), on cherche la hauteur du point au-dessus du sol,
 *   h + r·sin θ.
 * - Sens INVERSE : on connaît une hauteur H, on cherche quand le point y passe : sin θ = (H − h)/r,
 *   deux solutions dans [0° ; 360°[ (une seule au sommet ou en bas : cas particulier), puis
 *   retraduction en angle parcouru ou en durée.
 *
 * Angles en degrés. Toutes les valeurs DÉRIVÉES (θ, positions, solutions) se recalculent depuis ce
 * contrat (`moteur/modeleRotationsContexte.ts`), jamais stockées en double.
 */

export type SituationRotation = "roue" | "horloge" | "robot" | "eolienne" | "valve";

export type SensProbleme = "direct" | "inverse";

/** Angle trigonométrique de la position de départ (le « 0 » du contexte). */
export type OrigineRotation = 0 | 90 | 180 | 270;

/** 1 = sens trigonométrique (contraire des aiguilles d'une montre) ; −1 = sens horaire. */
export type RotationSens = 1 | -1;

export interface ExerciceRotationsContexte {
  situation: SituationRotation;
  sens: SensProbleme;
  origine: OrigineRotation;
  rotation: RotationSens;
  /** Distance du point au centre de rotation (dans `unite`). */
  rayon: number;
  /** Hauteur du centre de rotation au-dessus du sol (ou de la table, pour le robot). */
  hauteurCentre: number;
  unite: "m" | "cm";
  /** Durée d'un tour : en minutes pour la grande roue, en secondes pour l'éolienne ; `null` sinon. */
  periode: number | null;
  /** Sens direct : angle parcouru depuis le départ, en degrés (peut dépasser 360°). `null` en sens inverse. */
  alpha: number | null;
  /** Sens inverse : hauteur visée H. `null` en sens direct. */
  hauteurCible: number | null;
}

/** Ce que l'élève doit rendre au dernier écran du sens inverse : des durées (roue : secondes ;
 * éolienne : secondes), des minutes après midi (horloge) ou des angles de rotation (robot, valve). */
export type GrandeurRetour = "secondes" | "minutes" | "angle";
