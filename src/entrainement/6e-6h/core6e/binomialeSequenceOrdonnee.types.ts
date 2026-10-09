/**
 * Couche core (6e) — contrat pour `6gen48` ("Probabilité binomiale et séquence exacte sans
 * remise"), générateur du chapitre "Analyse combinatoire" qui CONSOLIDE ET ÉTEND le traitement de
 * la loi binomiale déjà effleuré par `6gen33` famille B (`generateurs6e/probabilitesProblemes/
 * familleB.ts`) — voir en-tête `generateurs6e/binomialeSequenceOrdonnee/familleA.ts` pour le détail
 * de ce qui est repris/étendu. 2 familles, tirage ÉQUIPROBABLE de la famille — voir
 * `generateurs6e/binomialeSequenceOrdonnee/index.ts`.
 *
 * **Convention transversale à ce contrat** (identique à `denombrementFondamental.types.ts`,
 * 6gen43/44) : chaque variante porte déjà, PRÉ-CALCULÉES par la Couche A (jamais recalculées côté
 * Couche B — `moteur6e/` n'importe jamais `generateurs6e/`, voir CLAUDE.md), toutes les valeurs
 * numériques correctes attendues à chaque écran. La Couche B
 * (`moteur6e/verificationBinomialeSequenceOrdonnee.ts`) se contente de les comparer à la saisie
 * élève.
 *
 * **Nombre d'écrans VARIABLE selon la famille ET, pour la famille A, selon la STRATÉGIE tirée**
 * (mirroir `6gen43`, jamais `6gen44`) : la famille A a 2 écrans quand `strategie==="termeUnique"`
 * (questions "exactement k"/"aucun"/"tous"), 3 écrans quand `strategie==="somme"` ou
 * `"complement"` (questions "au moins k"/"au plus k") — encodé directement dans les noms de phase
 * (`moteur6e/typesBinomialeSequenceOrdonnee.ts`, ex. `aTermeUniqueEcran1` vs `aSommeEcran1`),
 * jamais recalculé à partir de `exercice.strategie` dans `phaseApres` (celui-ci reste une fonction
 * PURE de la phase, comme `6gen43`). La famille B a toujours 2 écrans.
 */

// ============================================================================
// Famille A — Probabilité binomiale. n épreuves indépendantes identiques, probabilité de succès p
// constante (y compris p=0,5 pour les contextes équiprobables).
// ============================================================================

export type TypeQuestionBinomialeA = "exactement" | "auMoins" | "auPlus" | "aucun" | "tous";

/** 3 stratégies possibles (spec) : un seul terme C(n,k)pᵏ(1−p)ⁿ⁻ᵏ ("exactement k"/"aucun"/"tous") ;
 * une somme de plusieurs termes ("au plus k"/"au moins k" avec k petit, sommer directement) ; un
 * complément (1 moins un terme extrême, ex. "au moins 1" = 1−P(0)). Détermine le nombre d'écrans —
 * voir en-tête de fichier. */
export type StrategieBinomialeA = "termeUnique" | "somme" | "complement";

export interface ContexteBinomialeA {
  id: string;
  /** Texte narratif, générique (ne mentionne jamais n/p/k — ces valeurs restent dans le bloc
   * données, jamais dupliquées dans le texte narratif — mirroir `6gen33` famille B). */
  texte: string;
  labelSucces: string;
}

/**
 * `n`∈{4,...,10} épreuves, `p` probabilité de succès constante (0,5 le plus fréquent). `k` est le
 * seuil/la valeur pertinente pour `typeQuestion` (0 pour "aucun", `n` pour "tous", une valeur
 * intermédiaire pour "exactement"/"au moins"/"au plus"). `termesACalculer` — les valeurs de i
 * (nombre de succès) dont `P(X=i)` doit être calculée, ORDRE croissant, longueur 1 si
 * `strategie==="termeUnique"` ou `"complement"`, longueur ≥2 si `strategie==="somme"`.
 * `valeursTermes` — les valeurs CORRECTES de chaque terme, même ordre/longueur que
 * `termesACalculer`. `resultatFinal` — la probabilité demandée par l'énoncé (= `valeursTermes[0]`
 * si `termeUnique`, `1 − valeursTermes[0]` si `complement`, somme de `valeursTermes` si `somme`).
 */
export interface ExerciceBinomialeA {
  famille: "A";
  contexte: ContexteBinomialeA;
  n: number;
  p: number;
  k: number;
  typeQuestion: TypeQuestionBinomialeA;
  strategie: StrategieBinomialeA;
  termesACalculer: number[];
  valeursTermes: number[];
  resultatFinal: number;
}

// ============================================================================
// Famille B — Probabilité d'une séquence exacte, sans remise, éléments distincts.
// ============================================================================

export interface ContexteBinomialeB {
  id: string;
  /** Texte narratif générique (ne mentionne jamais n/k, voir `ContexteBinomialeA`). */
  texte: string;
}

/**
 * `n`∈{6,...,12} éléments tous distincts, on en tire `k`∈{3,4,5} (`k<n`) successivement SANS
 * REMISE, dans un ordre précis donné. `denominateurs` = `[n, n-1, ..., n-k+1]` (longueur `k`, une
 * fraction `1/denominateurs[i]` par position de la séquence — numérateur toujours 1, jamais stocké
 * séparément). `produitFinal` = produit de `1/denominateurs[i]` = `1/(n·(n-1)·...·(n-k+1))`.
 */
export interface ExerciceBinomialeB {
  famille: "B";
  contexte: ContexteBinomialeB;
  n: number;
  k: number;
  denominateurs: number[];
  produitFinal: number;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceBinomialeSequenceOrdonnee = ExerciceBinomialeA | ExerciceBinomialeB;
export type FamilleBinomialeSequenceOrdonnee = ExerciceBinomialeSequenceOrdonnee["famille"];
