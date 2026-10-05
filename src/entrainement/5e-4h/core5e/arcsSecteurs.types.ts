/**
 * Couche core (5e) — contrat propre à `5gen6` ("Arcs et secteurs : formule et conversion
 * intégrée"). 5 quantités liées par 2 relations (θ_rad=θ°·π/180, l=r·θ_rad, A=½r²θ_rad) — TOUJOURS
 * calculées EXACTEMENT à la génération depuis 2 primitives choisies "propres" (r entier, θ un
 * multiple de 5° — voir `generateurs5e/arcsSecteurs/`) : jamais un solveur générique "2 données
 * quelconques → 3 inconnues" à proprement parler, la Couche A calcule toujours les 5 valeurs à la
 * fois puis en masque 2 comme "données" — voir CLAUDE.md, section 5gen6, pour la justification
 * complète de cette simplification.
 */

export type QuantiteArcSecteur = "thetaDeg" | "thetaRad" | "r" | "l" | "A";

/** Ordre conceptuel FIXE des 5 quantités — détermine à la fois l'ordre des écrans (les quantités
 * manquantes, dans cet ordre) et l'ordre d'affichage du bloc "état actuel". */
export const ORDRE_QUANTITES_ARC_SECTEUR: QuantiteArcSecteur[] = ["thetaDeg", "thetaRad", "r", "l", "A"];

export interface ValeursArcSecteur {
  thetaDeg: number;
  thetaRad: number;
  r: number;
  l: number;
  A: number;
}

export interface ExerciceModeDeuxVersTrois {
  mode: "deuxVersTrois";
  /** Les 2 quantités données au départ — jamais {thetaDeg,thetaRad} (même information). */
  connues: [QuantiteArcSecteur, QuantiteArcSecteur];
  /** Les 5 valeurs complètes (les 2 connues ET les 3 dérivées), toujours exactes (k·π/n pour un
   * entier k, jamais de bruit décimal — voir l'en-tête de fichier). */
  valeurs: ValeursArcSecteur;
}

export type DirectionConversion = "degVersRad" | "radVersDeg";
export type TypeConversion = "exacte" | "decimale";

export interface ExerciceModeConversion {
  mode: "conversion";
  direction: DirectionConversion;
  type: TypeConversion;
  /** Valeur de départ, dans l'unité de départ (degrés si direction=degVersRad, radians sinon). */
  valeurDepart: number;
  /** Valeur attendue, dans l'unité d'arrivée. */
  valeurCible: number;
}

export type ExerciceArcSecteur = ExerciceModeDeuxVersTrois | ExerciceModeConversion;

export type GenerateurExerciceArcSecteur = () => ExerciceArcSecteur;
