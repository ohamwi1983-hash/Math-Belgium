/**
 * Couche core (6e) — contrat pour `6gen31` (« Tirages et arbres », chapitre « Les probabilités »).
 * 4 familles, tirage équiprobable de la famille, chaque famille tirant ensuite son propre
 * contexte/sous-type en interne (voir `generateurs6e/tiragesArbres/famille{A,B,C,D}.ts`).
 *
 * Toutes les valeurs numériques générées restent des ENTIERS exacts ou des `FractionExacte`
 * (pas nécessairement réduites — réduites seulement à l'affichage, jamais stockées en flottant).
 *
 * **Contrat partagé avec `6gen33`** (famille G) : `ExerciceFamilleB` (via `construireFamilleB(4, …)`)
 * et `ExerciceFamilleCSpecial` (via `construireFamilleCSpecial(m, k)`, dé à 6 faces) y sont réutilisés
 * tels quels avec les vérificateurs `diagnostiquerBEcran1..4` / `diagnostiquerCEcran1..3`. Les champs
 * ajoutés par l'audit 6e ch. 6 sont donc OPTIONNELS, et leur absence redonne l'ancien comportement.
 */

// ============================================================================
// Famille A — k tirages successifs avec/sans remise dans une urne à 2 couleurs.
// ============================================================================

/** Question de l'écran 3 : « exactement m boules de la couleur 1 » (somme de chemins de même
 * probabilité) ou « au moins une boule de la couleur 1 » (par l'événement contraire). */
export type QuestionEcran3FamilleA = "exactement" | "auMoinsUne";

export interface ExerciceFamilleA {
  famille: "A";
  /** Effectif de la couleur 1, 4 ≤ n1 ≤ 7. */
  n1: number;
  /** Effectif de la couleur 2, 4 ≤ n2 ≤ 7. */
  n2: number;
  /** Adjectif au féminin pluriel (« rouges »). */
  labelCouleur1: string;
  labelCouleur2: string;
  /** Nombre de tirages successifs, k ∈ {2,3}. */
  k: number;
  avecRemise: boolean;
  /** Écran 3, question « exactement » : 0 < m < k. */
  m: number;
  /** Absent = « exactement » (ancien comportement). */
  questionEcran3?: QuestionEcran3FamilleA;
}

// ============================================================================
// Famille B — Arrangements au hasard (lettres dans des enveloppes, playlist).
// ============================================================================

export type ContexteFamilleB = "lettres" | "chansons";

export type DemandeEcran1FamilleB = "une" | "deux";

/** Écran 4 : « aucune bien placée » (n ≤ 4, dénombrable sur l'arbre ou par le contraire) ou
 * « au moins 3 bien placées » (n = 5 : somme de cas incompatibles). */
export type DemandeEcran4FamilleB = "aucune" | "auMoinsTrois";

export interface ExerciceFamilleB {
  famille: "B";
  /** n ∈ {3,4,5}. */
  n: number;
  contexte: ContexteFamilleB;
  /** « deux » jamais pour n = 3 (deux positions fixées ⟺ tout est bien placé). */
  demandeEcran1: DemandeEcran1FamilleB;
  positionsEcran1: number[];
  /** Écran 3 : exactement k bien placées, 1 ≤ k ≤ n − 2, et n − k ≤ 3 (les autres, tous mal placés,
   * se comptent sur un petit arbre : 1 façon pour 2 objets, 2 façons pour 3). */
  k: number;
  /** Absent = « aucune » (ancien comportement). */
  demandeEcran4?: DemandeEcran4FamilleB;
}

// ============================================================================
// Famille C — Dé truqué (distribution non uniforme).
// ============================================================================

export interface FractionExacte {
  num: number;
  den: number;
}

/** Nombre de faces du dé (4, 6 ou 8). */
export type NombreFacesDe = 4 | 6 | 8;

export type CibleEcran3Special = "deuxFaces" | "pair" | "impair";

export interface ExerciceFamilleCSpecial {
  famille: "C";
  sousType: "special";
  faceSpeciale: number;
  /** P(face spéciale), connue. */
  p0: FractionExacte;
  /** Probabilité commune des autres faces, inconnue. */
  p: FractionExacte;
  autreFace: number;
  /** Absent = 6. */
  faces?: NombreFacesDe;
  /** Absent = « deuxFaces » (P(face spéciale ou autre face)). */
  ecran3Cible?: CibleEcran3Special;
}

export interface ExerciceFamilleCParite {
  famille: "C";
  sousType: "parite";
  /** Rapport entre les deux probabilités, r ∈ {2,3,4,5}. */
  r: number;
  /** Quelles faces sont r fois plus probables (absent = « pair » : p = r·q). */
  plusProbable?: "pair" | "impair";
  /** Probabilité de chaque face paire. */
  p: FractionExacte;
  /** Probabilité de chaque face impaire. */
  q: FractionExacte;
  /** Absent = 6. */
  faces?: NombreFacesDe;
  ecran3Cible: "pair" | "impair" | "sousEnsemble";
  sousEnsemble?: number[];
}

export type ExerciceFamilleC = ExerciceFamilleCSpecial | ExerciceFamilleCParite;

// ============================================================================
// Famille D — Arbre pondéré à 2 niveaux (2 tirages dans une urne, avec/sans remise).
// ============================================================================

/** 0 = couleur 1, 1 = couleur 2. */
export type CouleurTirage = 0 | 1;

export interface ExerciceFamilleD {
  famille: "D";
  /** 2 ≤ n1, n2 ≤ 6. */
  n1: number;
  n2: number;
  labelCouleur1: string;
  labelCouleur2: string;
  /** Initiale (majuscule) portée sur l'arbre, distincte pour les 2 couleurs. */
  initiale1: string;
  initiale2: string;
  avecRemise: boolean;
  /** Écran 2 : le chemin (1er tirage, 2e tirage) dont on calcule la probabilité. */
  chemin: [CouleurTirage, CouleurTirage];
  /** Écrans 3–4 : la couleur dont on parle (« exactement une boule … », « au moins une boule … »). */
  couleurCible: CouleurTirage;
}

export type ExerciceTiragesArbres = ExerciceFamilleA | ExerciceFamilleB | ExerciceFamilleC | ExerciceFamilleD;

export type FamilleTiragesArbres = ExerciceTiragesArbres["famille"];

export type GenerateurExerciceTiragesArbres = () => ExerciceTiragesArbres;
