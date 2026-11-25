/**
 * Couche A (6e) — types de `6gen43` « Dénombrement fondamental et arrangements » (6e ch. 7, § 1).
 * Refonte de l'audit du chapitre (lots B et C) : famille A sur un ENSEMBLE DE CHIFFRES tiré (les dix
 * chiffres, ou une partie, avec ou sans 0 — avant : deux énoncés « total » sur 2 000 tirages, 9 choix
 * pour le premier chiffre à chaque fois) ; famille C en contexte, sans nommer la structure, avec les
 * quatre groupements du cours (P, A, B, C) ; valeurs attendues de chaque écran calculées ici.
 */

// ============================================================================
// Famille A — nombres à n chiffres tous différents, premier chiffre non nul.
// ============================================================================

export type SousTypeDenombA = "total" | "positionFixee" | "contientUnChiffre" | "contientDeuxChiffres" | "borneSuperieure" | "parite";

export interface ExerciceDenombrementA {
  famille: "A";
  sousType: SousTypeDenombA;
  /** `positionFixee` : dernier chiffre fixé, ou premier(s) chiffre(s) fixé(s). */
  variante?: "dernier" | "premiers";
  n: number;
  /** Chiffres disponibles (triés). */
  chiffres: number[];
  /** Chiffres imposés (`positionFixee`). */
  fixes?: { position: number; valeur: number }[];
  /** Chiffre(s) que le nombre doit contenir (`contient…`). */
  chiffre?: number;
  chiffre2?: number;
  /** Borne stricte du premier chiffre (`borneSuperieure`). */
  borne?: number;
  /** Chiffres admis en dernière position (`parite`) et leur nom (« pair », « multiple de 5 »). */
  ensembleDernier?: number[];
  labelEnsemble?: string;
  /** Total sans contrainte (donnée de `contient…`). */
  totalSansContrainte: number;
  /** `contientDeuxChiffres` : nombres sans le 1er chiffre, sans le 2e (données). */
  sansChiffre1?: number;
  sansChiffre2?: number;
  /** Valeurs attendues, écran par écran, dans l'ordre des champs. */
  valeursEcrans: number[][];
  resultat: number;
}

// ============================================================================
// Famille B — diagonales d'un polygone convexe : D(n) = n(n − 3)/2.
// ============================================================================

export interface ExerciceDenombrementB {
  famille: "B";
  sousType: "direct" | "inverse";
  n: number;
  diagonales: number;
  /** Membre constant de n² − 3n − c = 0 (inverse). */
  constanteEquation: number;
}

// ============================================================================
// Famille C — reconnaître le groupement (P, A, B, C), puis calculer.
// ============================================================================

export type FormuleC = "permutation" | "arrangement" | "arrangementRepetition" | "combinaison";

export type SousTypeDenombC = "cartesContraintes" | "motsLettresDistinctes" | "motsRepetition" | "motsPositionFixee" | "arrangement";

export interface ExerciceDenombrementC {
  famille: "C";
  sousType: SousTypeDenombC;
  formule: FormuleC;
  /** Contexte (texte, formules entre `$…$`) — ne nomme jamais la structure. */
  contexte: string;
  question: string;
  /** Paramètres de la formule : groupement de p éléments parmi n. */
  n: number;
  p: number;
  resultat: number;
}

// ============================================================================
// Famille D — blocs (éléments qui restent ensemble).
// ============================================================================

export interface GroupeDenombD {
  nom: string;
  taille: number;
}

export interface ExerciceDenombrementD {
  famille: "D";
  sousType: "grouper" | "consecutivesOrdreFixe" | "consecutivesOrdreLibre";
  groupes?: GroupeDenombD[];
  mot?: string;
  lettresConsecutives?: string;
  nombreUnites: number;
  arrangementsBlocs: number;
  internesParGroupe: number[];
  resultatFinal: number;
}

// ============================================================================
// Famille E — permutations circulaires.
// ============================================================================

export interface ExerciceDenombrementE {
  famille: "E";
  sousType: "table" | "collier";
  n: number;
  /** Habillage (personnes autour d'une table, perles d'un bracelet, clés d'un anneau…). */
  contexte: string;
  resultat: number;
}

export type ExerciceDenombrementFondamental = ExerciceDenombrementA | ExerciceDenombrementB | ExerciceDenombrementC | ExerciceDenombrementD | ExerciceDenombrementE;

export type FamilleDenombrementFondamental = ExerciceDenombrementFondamental["famille"];
