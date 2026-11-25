/**
 * Types de `6gen52` « Extensions binomiale, normale et Bayes » (6e ch. 8, § 7, TRANSFÉRER) — refonte
 * de l'audit (lot C ; décision 3 : les familles B et C, doublons de 6gen50 / 6gen51, et E, confiée à
 * 6gen115, sont retirées).
 * - A : épreuve composée (deux événements indépendants) ou directe, puis le plus petit nombre de
 *   répétitions pour qu'« au moins un succès » dépasse un seuil (logarithme).
 * - D : VRAI théorème de Bayes à trois catégories : P(S), P(Cⱼ ∩ S), puis P(Cⱼ | S), la catégorie j
 *   tirée au hasard (avant : seulement r₃ par différence, sans jamais inverser le conditionnement).
 * - F : loi reconstruite à partir de pourcentages, espérance, puis total attendu sur une population.
 */

export interface ExerciceExtA {
  famille: "A";
  sousType: "compose" | "direct";
  /** Situation en prose (la probabilité de succès s'en déduit). */
  texte: string;
  /** « au moins un candidat gagne ». */
  evenement: string;
  /** Ce qu'on répète (« candidats », « parties »). */
  unite: string;
  /** p exacte = pNum / pDen. */
  pNum: number;
  pDen: number;
  /** Écriture du produit (composé) : facteurs en KaTeX, sinon null. */
  facteurs: string[] | null;
  seuil: number;
  valeurN: number;
}

export interface ContexteExtD {
  id: string;
  /** Phrase d'introduction. */
  intro: string;
  categories: [string, string, string];
  /** Événement S, en mots (« le client déclare un sinistre dans l'année »). */
  critere: string;
  /** Individu tiré (« un client »). */
  individu: string;
}

export interface ExerciceExtD {
  famille: "D";
  contexte: ContexteExtD;
  /** Probabilités a priori, en centièmes (somme 100). */
  q: [number, number, number];
  /** P(S | Cᵢ), en centièmes. */
  r: [number, number, number];
  /** Catégorie demandée (0, 1 ou 2). */
  j: 0 | 1 | 2;
}

export interface ExerciceExtF {
  famille: "F";
  texte: string;
  /** Ce que vaut X (« le montant mensuel payé par un abonné choisi au hasard »). */
  definitionX: string;
  labels: [string, string, string];
  valeurs: [number, number, number];
  /** Pourcentages des deux premières options (la troisième : le reste). */
  pourcentage1: number;
  pourcentage2: number;
  population: number;
  /** Nom de la population (« abonnés »). */
  individus: string;
}

export type ExerciceExtensionsBinomialeNormaleBayes = ExerciceExtA | ExerciceExtD | ExerciceExtF;

export type FamilleExtensionsBinomialeNormaleBayes = ExerciceExtensionsBinomialeNormaleBayes["famille"];
