/**
 * Couche core (6e) — contrat de `6gen74` (« Arbre, tableau, effectifs : une situation, trois
 * écritures », chapitre 6 « Les probabilités », audit 6e ch. 6, décision M — fiche P1 de l'étude).
 *
 * Une même situation (une population de N individus, deux caractères A et B) est écrite de trois
 * façons : des POURCENTAGES (texte), un ARBRE PONDÉRÉ, un TABLEAU D'EFFECTIFS à double entrée. Le
 * « sens de départ » (`ModeDepart`) fixe l'écriture donnée :
 * - `pourcentages` : les pourcentages du texte → l'arbre complet → le tableau ;
 * - `arbrePartiel` : un arbre à moitié rempli → l'arbre complet → le tableau ;
 * - `tableauPartiel` : un tableau à moitié rempli → le tableau complet → l'arbre.
 * Puis, toujours : P(B|A) ET P(A|B) sur les mêmes données, et l'indépendance de A et B.
 *
 * **Effectifs entiers tirés d'abord** (`generateurs6e/arbreTableauEffectifs/index.ts`) : N, puis
 * n(A) = N·P(A), puis n(A∩B) = n(A)·P(B|A) et n(Ā∩B) = n(Ā)·P(B|Ā), toutes ENTIÈRES par
 * construction — les probabilités affichées (multiples de 0,05) en sont des rapports exacts. Aucune
 * case du tableau n'est donc jamais un décimal arrondi.
 */

export type ModeDepart = "pourcentages" | "arbrePartiel" | "tableauPartiel";

/** Branches de l'arbre, dans l'ordre de lecture (haut → bas) : 1er niveau A, Ā ; 2e niveau B|A,
 * B̄|A, B|Ā, B̄|Ā. */
export type CleBranche = "A" | "nA" | "B_A" | "nB_A" | "B_nA" | "nB_nA";
export const ORDRE_BRANCHES: CleBranche[] = ["A", "nA", "B_A", "nB_A", "B_nA", "nB_nA"];

/** Cases du tableau, dans l'ordre de lecture : ligne A (A∩B, A∩B̄, total A), ligne Ā, ligne Total
 * (total B, total B̄, N). */
export type CleCellule = "AB" | "AnB" | "A" | "nAB" | "nAnB" | "nA" | "B" | "nB" | "N";
export const ORDRE_CELLULES: CleCellule[] = ["AB", "AnB", "A", "nAB", "nAnB", "nA", "B", "nB", "N"];

/** Contexte réaliste : textes ET plages de pourcentages vraisemblables (en points de %, multiples
 * de 5). `independancePlausible` : le cas particulier « A et B indépendants » n'est tiré que dans
 * ces contextes (jamais « le test est indépendant de la maladie »). */
export interface ContexteArbreTableau {
  id: string;
  /** Lettres des événements (une majuscule, jamais P ni N, réservées à P(·) et à l'effectif total). */
  lettreA: string;
  lettreB: string;
  /** Phrase d'introduction, `{N}` remplacé par l'effectif total. */
  introduction: string;
  /** « un habitant », « une pièce »… (« On choisit … au hasard »). */
  individu: string;
  /** Pluriel de la population (« habitants ») — intitulé du tableau, consigne des effectifs. */
  population: string;
  /** Définitions des événements, en prose (jamais en mode math). */
  definitionA: string;
  definitionB: string;
  /** Phrases des pourcentages : « 30 % des habitants {verbeA}. Parmi {groupeA}, 10 % {verbeB} ;
   * parmi {groupeNonA}, 25 % {verbeB}. » */
  verbeA: string;
  verbeB: string;
  groupeA: string;
  groupeNonA: string;
  plageA: [number, number];
  plageBA: [number, number];
  plageBnA: [number, number];
  independancePlausible: boolean;
}

export interface ExerciceArbreTableauEffectifs {
  mode: ModeDepart;
  contexte: ContexteArbreTableau;
  /** Effectifs ENTIERS des 9 cases du tableau (source de vérité de toutes les probabilités). */
  effectifs: Record<CleCellule, number>;
  /** `true` ssi n(A∩B)·N = n(A)·n(B) — cas particulier, P(B|A) = P(B|Ā). */
  independant: boolean;
  /** `arbrePartiel` : les 3 branches DONNÉES (une par nœud) ; vide sinon. */
  branchesDonnees: CleBranche[];
  /** Cases DONNÉES : toujours `N` ; en `tableauPartiel`, 3 cases de plus (tableau complétable de
   * proche en proche). */
  cellulesDonnees: CleCellule[];
}
