/**
 * Couche core (6e) — types de `6gen75` « Fréquence et probabilité » (audit 6e ch. 6, décision M,
 * fiche P2). Trois familles, quatre écrans chacune :
 * - A : un dé à six faces (équilibré ou truqué), n ∈ {60, 300, 600, 1200} lancers, effectifs par
 *   face SIMULÉS (tirage `Math.random`, donc reproductible sous la graine de `?code=`) ;
 * - B : deux dés, somme des faces — modèle sur la grille 6 × 6 des 36 couples équiprobables (piège :
 *   les 11 sommes ne sont pas équiprobables) ;
 * - C : objet sans modèle a priori (punaise, capsule, gobelet, bouchon de liège) — la probabilité ne
 *   peut qu'être estimée par une fréquence ; une affirmation chiffrée est confrontée aux données.
 *
 * Le verdict de l'écran 3 n'est PAS stocké : il se déduit des données par la règle de décision
 * (`moteur6e/verificationFrequenceProbabilite.ts::verdictAttendu`). `truque` (A, B) est la vérité
 * cachée de la simulation ; le générateur la fait toujours coïncider avec le verdict de la règle.
 */

export interface EvenementDe {
  /** Faces qui réalisent l'événement (1 à 6). */
  faces: number[];
  /** Libellé en prose, sans guillemets : « obtenir un nombre pair ». */
  libelle: string;
}

export interface EvenementSomme {
  /** Sommes (2 à 12) qui réalisent l'événement. */
  sommes: number[];
  /** Libellé en prose, sans guillemets : « la somme vaut 7 ». */
  libelle: string;
}

export interface ExerciceFrequenceA {
  famille: "A";
  n: number;
  evenement: EvenementDe;
  /** Effectif de chaque face : index 0 → face 1 … index 5 → face 6 (somme = n). */
  effectifs: number[];
  /** Vérité de la simulation (dé chargé sur une face de l'événement). */
  truque: boolean;
  /** Nombre de nouveaux lancers de l'écran 4 (multiple de n). */
  nouveauxEssais: number;
}

export interface ExerciceFrequenceB {
  famille: "B";
  n: number;
  evenement: EvenementSomme;
  /** Effectif de chaque somme : index 0 → somme 2 … index 10 → somme 12 (somme = n). */
  effectifs: number[];
  truque: boolean;
  nouveauxEssais: number;
}

export type IdObjetC = "punaise" | "capsule" | "gobelet" | "bouchon";

export interface ObjetC {
  id: IdObjetC;
  /** « une punaise » */
  nom: string;
  /** « la punaise » */
  sujet: string;
  /** Issue étudiée, sans guillemets : « pointe en l'air ». */
  issue: string;
  /** L'autre issue : « sur le côté ». */
  autreIssue: string;
}

export interface AffirmationC {
  /** Probabilité affirmée p₀ = num/den. */
  num: number;
  den: number;
  /** « une fois sur deux » */
  texte: string;
}

export interface ExerciceFrequenceC {
  famille: "C";
  n: number;
  objet: ObjetC;
  /** Nombre de fois où l'issue étudiée a été observée. */
  effectif: number;
  affirmation: AffirmationC;
  nouveauxEssais: number;
}

export type ExerciceFrequenceProbabilite = ExerciceFrequenceA | ExerciceFrequenceB | ExerciceFrequenceC;
