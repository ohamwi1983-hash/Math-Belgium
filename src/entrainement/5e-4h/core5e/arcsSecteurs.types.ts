/**
 * Couche core (5e) — contrat propre à `5gen6` ("Arcs et secteurs : formule et conversion
 * intégrée"). 5 quantités liées par 2 relations (θ_rad=θ°·π/180, s=r·θ_rad, A=½r²θ_rad ; la
 * longueur d'arc est notée s comme dans le cours — la clé interne reste `l`) — TOUJOURS
 * calculées EXACTEMENT à la génération depuis 2 primitives choisies "propres" (r entier, θ un
 * multiple de 5° — voir `generateurs5e/arcsSecteurs/`) : jamais un solveur générique "2 données
 * quelconques → 3 inconnues" à proprement parler, la Couche A calcule toujours les 5 valeurs à la
 * fois puis en masque 2 comme "données" — voir CLAUDE.md, section 5gen6, pour la justification
 * complète de cette simplification.
 */

export type QuantiteArcSecteur = "thetaDeg" | "thetaRad" | "r" | "l" | "A";

/** Ordre d'AFFICHAGE fixe des 5 quantités (bloc de données, récapitulatif). L'ordre des ÉCRANS,
 * lui, suit les dépendances : voir `ORDRE_RESOLUTION_ARC_SECTEUR` et `DEPENDANCES_ARC_SECTEUR`. */
export const ORDRE_QUANTITES_ARC_SECTEUR: QuantiteArcSecteur[] = ["thetaDeg", "thetaRad", "r", "l", "A"];

/** Formules « naturelles » du cours, par quantité cible : chaque entrée liste les quantités
 * qu'elle utilise (θ° ↔ θ_rad, s = rθ, A = ½r²θ et leurs réciproques). Les écrans sont ordonnés
 * pour qu'à chaque écran une de ces formules soit applicable avec ce que l'élève connaît déjà
 * (audit 5e ch. 2, point 9 : avant, θ° pouvait être demandé avant θ_rad, ou θ avant r quand seuls
 * s et A étaient donnés). Mêmes formules, dans le même ordre, que `FORMULES`
 * (`ui5e/formatArcsSecteurs.ts`), qui les affiche en aide. */
export const DEPENDANCES_ARC_SECTEUR: Record<QuantiteArcSecteur, QuantiteArcSecteur[][]> = {
  thetaRad: [["thetaDeg"], ["r", "l"], ["r", "A"]],
  thetaDeg: [["thetaRad"]],
  r: [["thetaRad", "l"], ["thetaRad", "A"], ["l", "A"]],
  l: [["r", "thetaRad"], ["r", "A"]],
  A: [["r", "thetaRad"], ["r", "l"]],
};

/** Préférence quand plusieurs quantités sont calculables au même moment : θ en radians d'abord
 * (c'est lui qui sert dans s = rθ et A = ½r²θ), puis θ°, r, s, A. */
export const ORDRE_RESOLUTION_ARC_SECTEUR: QuantiteArcSecteur[] = ["thetaRad", "thetaDeg", "r", "l", "A"];

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
