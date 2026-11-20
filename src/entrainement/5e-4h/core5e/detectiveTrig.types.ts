import type { Rat } from "../moteur5e/trigExact";

/**
 * Couche core — 5gen50 « Détective d'erreurs : trigonométrie » (5e, chapitre 2, processus 3
 * TRANSFÉRER). Même mécanique que 5gen49 / 6gen88 / gen81 : un élève fictif a résolu un exercice du
 * chapitre en 4 ou 5 lignes numérotées ; UNE ligne est fausse et la suite de la copie en découle
 * (copie cohérente avec son erreur). L'élève trouve la ligne, nomme l'erreur, puis donne le résultat
 * final corrigé.
 *
 * VARIANTE = exercice support (jamais le type d'erreur) ; dans chaque variante, le type d'erreur
 * (donc la ligne fausse) est un VERDICT tiré au hasard, équiprobable — jamais fixé par `forme`.
 * Les erreurs sont celles que le cours signale (audit 5e ch. 2, §§ 1–3) : π perdu dans la conversion,
 * ½ oublié, degrés dans une formule en radians (§ 1) ; T = π/ω, φ pris pour Φ, ordre des extremums
 * quand A change de signe (§ 4) ; mauvais angle de référence, seconde famille oubliée ou fausse,
 * 2kπ non divisé par a (§ 7) ; période 2π pour la tangente, cos x = 0 confondu avec sin x = 0,
 * valeur interdite de la tangente gardée (§ 7, produit nul).
 */

export type VarianteDetectiveTrig = "secteur" | "parametres" | "equation" | "produit";

export type ErreurSecteur = "piOublie" | "demi" | "degres";
export type ErreurParametres = "periode" | "phiPourPhi" | "ordre";
export type ErreurEquation = "angleConfondu" | "familleOubliee" | "familleFausse" | "periodeNonDivisee";
export type ErreurProduit = "periodeTan" | "cosZero" | "valeurInterdite";
export type TypeErreurTrig = ErreurSecteur | ErreurParametres | ErreurEquation | ErreurProduit;

/** Leurres de l'écran 2 (toujours FAUX pour la ligne visée). */
export type LeurreTrig =
  | "conversionInverse"
  | "convertirInutile"
  | "diviser360"
  | "rayonNonCarre"
  | "formuleArc"
  | "formuleDisque"
  | "carreDouble"
  | "fractionTour"
  | "demiEnTrop"
  | "periodeOmega"
  | "periodeProduit"
  | "periodeInverse"
  | "phiSansSigne"
  | "phiFoisOmega"
  | "phiSurT"
  | "ordreB"
  | "ordreOmega"
  | "maxEnPhi"
  | "alphaDegres"
  | "alphaOppose"
  | "alphaMoitie"
  | "uneFamilleSuffit"
  | "familleKpi"
  | "familleAlphaPlusPi"
  | "famillePeriodePi"
  | "famillePiSurDeux"
  | "periodeMultipliee"
  | "alphaNonDivise"
  | "periodeQuart"
  | "tanDeuxFamilles"
  | "tanPiSurDeux"
  | "tanArccos"
  | "cosZeroDeuxKpi"
  | "cosZeroAucune"
  | "cosZeroKpiSur2"
  | "produitDeuxNuls"
  | "rejeterTan"
  | "rejeterKpi";

export type IdDescriptionTrig = TypeErreurTrig | LeurreTrig;

export interface ExerciceSecteur {
  variante: "secteur";
  type: ErreurSecteur;
  /** Rayon (cm). */
  r: number;
  /** Angle au centre en degrés. */
  d: number;
}

export interface ExerciceParametres {
  variante: "parametres";
  type: ErreurParametres;
  A: number;
  omega: Rat;
  /** Déphasage φ = coefficient de π, dans ]−π ; π] \ {0}. */
  phi: Rat;
  b: number;
}

export interface ExerciceEquation {
  variante: "equation";
  type: ErreurEquation;
  fonction: "sin" | "cos";
  /** Indice du second membre dans `SECONDS_MEMBRES`. */
  c: number;
}

export interface ExerciceProduit {
  variante: "produit";
  type: ErreurProduit;
  /** Second membre de tan x = c : 1, −1, √3, −√3, √3/3, −√3/3 (indice). */
  c: number;
}

export type DonneesDetectiveTrig = ExerciceSecteur | ExerciceParametres | ExerciceEquation | ExerciceProduit;

export type ExerciceDetectiveTrig = DonneesDetectiveTrig & {
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (tiré : le QR code rouvre le même). */
  options: IdDescriptionTrig[];
};

/** Résultat final (écran 3) : une valeur (aire, abscisse d'un maximum) ou un ensemble d'angles. */
export type ResultatDetectiveTrig =
  | { genre: "aire"; coefPi: Rat | null; rationnel: Rat; valeur: number; latex: string }
  | { genre: "abscisse"; x: Rat; periode: Rat }
  | { genre: "ensemble"; angles: Rat[] };
