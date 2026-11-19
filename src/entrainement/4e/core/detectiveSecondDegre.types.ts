/**
 * Couche core — « Détective d'erreurs : second degré » (gen121, 4e, chapitre 2 « Équations et
 * inéquations du second degré », section `revision`, processus 3 TRANSFÉRER). Même mécanique que
 * gen81, gen91, gen107 et gen112 : un élève fictif a résolu une équation ou une inéquation du
 * chapitre en 4 à 6 lignes numérotées ; UNE SEULE ligne est fausse et la suite de la copie en
 * découle (copie cohérente avec son erreur). L'élève trouve la ligne, nomme l'erreur, puis donne
 * l'ensemble-solution corrigé.
 *
 * VARIANTE = exercice support (jamais le type d'erreur) ; dans chaque variante, le type d'erreur
 * (et donc la ligne fausse) est un VERDICT tiré au hasard, équiprobable — jamais fixé par `forme`.
 * Les deux types d'une variante portent sur deux lignes DIFFÉRENTES.
 */

export type VarianteDetectiveSecondDegre = "discriminant" | "miseEnEvidence" | "sansSolution" | "inequation" | "rationnelle" | "inequationRationnelle";

export type TypeErreurSecondDegre =
  /** (−3)² écrit −3² = −9 dans Δ. */
  | "carreNegatif"
  /** b au lieu de −b dans la formule des racines. */
  | "moinsB"
  /** Division des deux membres par x (ou x + p), qui peut être nul : une solution perdue. */
  | "divisionFacteur"
  /** Produit nul : x − 4 = 0 lu x = −4 (signes des racines inversés). */
  | "signesRacines"
  /** −4ac mal signé : Δ = b² + 4ac alors que a et c sont de même signe. */
  | "signe4ac"
  /** Δ < 0 lu « une solution (racine double) ». */
  | "deltaNegatifUneSolution"
  /** Division par un nombre négatif sans changer le sens de l'inégalité. */
  | "sensNonInverse"
  /** Signe de a lu ENTRE les racines au lieu de l'extérieur. */
  | "signeEntre"
  /** Condition d'existence fausse (x ≠ −p au lieu de x ≠ p) : la valeur interdite n'est pas rejetée. */
  | "ceFausse"
  /** Racine étrangère gardée : la valeur interdite par la CE reste dans S. */
  | "racineEtrangere"
  /** Produit en croix dans une inéquation (multiplication par un dénominateur de signe inconnu). */
  | "produitEnCroix"
  /** Valeur interdite incluse dans S avec ≥ / ≤ (crochet fermé). */
  | "valeurCEIncluse";

/** Descriptions proposées à l'écran 2 : la bonne (le type d'erreur) + 3 leurres. */
export type IdDescriptionSecondDegre =
  | TypeErreurSecondDegre
  | "leurre4ac"
  | "leurreDeltaPlus"
  | "leurreSigneC"
  | "leurreDenominateurA"
  | "leurreRacineDenominateur"
  | "leurreSansRacine"
  | "leurreMiseEnEvidence"
  | "leurreDevelopper"
  | "leurreDiviserCoefficient"
  | "leurreDeuxFacteursNuls"
  | "leurreSolutionManquante"
  | "leurreCarre"
  | "leurreDeuxOpposees"
  | "leurreDoubleSigne"
  | "leurreDeltaFaux"
  | "leurrePasDiviser"
  | "leurreCoefficientsDivision"
  | "leurreDiviserPositif"
  | "leurreRacinesFausses"
  | "leurreSigneA"
  | "leurreToujoursSigneA"
  | "leurrePasDeCE"
  | "leurreCENumerateur"
  | "leurreCEZero"
  | "leurreMultiplication"
  | "leurreCEFausse"
  | "leurreToujoursChanger"
  | "leurreNumerateur"
  | "leurreZeroExclu"
  | "leurreTableauFaux";

export type SymboleInegalite = "<" | ">" | "≤" | "≥";

/** ax² + bx + c = 0, cas général (Δ > 0 carré parfait ; b < 0). */
export interface ExerciceDiscriminant {
  variante: "discriminant";
  type: "carreNegatif" | "moinsB";
  a: number;
  b: number;
  c: number;
}

/** kx² = mx (forme « x ») ou (x + p)² = k(x + p) (forme « facteur »). */
export interface ExerciceMiseEnEvidence {
  variante: "miseEnEvidence";
  type: "divisionFacteur" | "signesRacines";
  forme: "x" | "facteur";
  /** Forme « x » : k ; forme « facteur » : 1 (inutilisé). */
  k: number;
  /** Forme « x » : m ; forme « facteur » : le coefficient k de k(x + p). */
  m: number;
  /** Forme « facteur » : p (0 en forme « x »). */
  p: number;
}

/** ax² + bx + c = 0 avec Δ < 0 (a et c de même signe). */
export interface ExerciceSansSolution {
  variante: "sansSolution";
  type: "signe4ac" | "deltaNegatifUneSolution";
  a: number;
  b: number;
  c: number;
}

/** k(x² + βx + γ) ◇ 0 développé, k < 0 ; racines entières r1 < r2 du trinôme unitaire. */
export interface ExerciceInequationDetective {
  variante: "inequation";
  type: "sensNonInverse" | "signeEntre";
  k: number;
  r1: number;
  r2: number;
  symbole: SymboleInegalite;
}

/** x²/(x − p) = (sx − pr)/(x − p) avec s = p + r : racines p (interdite) et r. */
export interface ExerciceRationnelle {
  variante: "rationnelle";
  type: "ceFausse" | "racineEtrangere";
  p: number;
  r: number;
}

/** (2x − (z + p))/(x − p) ◇ 1 (symbole large) : zéro z, valeur interdite p. */
export interface ExerciceInequationRationnelle {
  variante: "inequationRationnelle";
  type: "produitEnCroix" | "valeurCEIncluse";
  z: number;
  p: number;
  symbole: "≤" | "≥";
}

export type DonneesDetectiveSecondDegre = ExerciceDiscriminant | ExerciceMiseEnEvidence | ExerciceSansSolution | ExerciceInequationDetective | ExerciceRationnelle | ExerciceInequationRationnelle;

export type ExerciceDetectiveSecondDegre = DonneesDetectiveSecondDegre & {
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (tiré à la génération : le QR code
   * rouvre le même ordre). */
  options: IdDescriptionSecondDegre[];
};
