/**
 * Couche core (6e) — contrat pour `6gen44` ("Dénombrement combiné et sélections contraintes"),
 * 2ᵉ générateur du chapitre "Analyse combinatoire" (après `6gen43`, voir `docs/historique-6e.md`).
 * 4 familles (A à D), tirage ÉQUIPROBABLE de la famille PUIS d'un sous-type dans la famille —
 * voir `generateurs6e/denombrementCombine/index.ts`.
 *
 * **Convention transversale à ce contrat** (identique à `denombrementFondamental.types.ts`, 6gen43) :
 * chaque variante porte déjà, PRÉ-CALCULÉES par la Couche A (jamais recalculées côté Couche B —
 * `moteur6e/` n'importe jamais `generateurs6e/`, voir CLAUDE.md), toutes les valeurs numériques
 * correctes attendues à chaque écran. La Couche B (`moteur6e/verificationDenombrementCombine.ts`)
 * se contente de comparer, position par position, la saisie élève à ces valeurs (via l'évaluateur
 * EXACT `moteur6e/expressionCombinatoire.ts`, jamais de logique de dénombrement dans `moteur6e/`).
 *
 * **Nombre d'écrans constant PAR FAMILLE** (contrairement à `6gen43` où certains sous-types de la
 * famille A avaient 2 écrans et d'autres 3) : A=2, B=2, C=2, D=3, quel que soit le sous-type tiré —
 * voir `moteur6e/typesDenombrementCombine.ts`. Les CHAMPS affichés à un écran donné varient bien par
 * sous-type (ex. famille C "comparaison" a 2 champs à l'écran 1 quand "repetition" n'en a qu'un),
 * mais jamais le NOMBRE D'ÉCRANS.
 */

// ============================================================================
// Famille A — Répartition en groupes de tailles données (multinomiale). 1 seul "sous-type"
// (aucune branche narrative distincte demandée par la mission) — 2 écrans.
// ============================================================================

/** `n` personnes réparties en `k`∈{2,3,4} groupes NOMMÉS (`noms`), de tailles DISTINCTES (`tailles`,
 * même ordre que `noms`) sommant à `n`. `resultat` = `n!/(n1!·n2!·...·nk!)` — calculé en BigInt côté
 * Couche A (voir en-tête `generateurs6e/denombrementCombine/familleA.ts` : `n` jusqu'à 52 avec
 * plusieurs groupes dépasse `Number.MAX_SAFE_INTEGER`, `number` ne peut pas le représenter
 * exactement). Écran 1 → poser la formule NON CALCULÉE (champ texte libre, évalué par
 * `moteur6e/expressionCombinatoire.ts`, équivalence par ÉVALUATION EXACTE — pas de comparaison de
 * chaîne littérale, cohérent avec la convention `diagnostiquerValeur` déjà en place ailleurs sur la
 * plateforme). Écran 2 → calculer le résultat (champ texte, même évaluateur, comparé à `resultat`). */
export interface ExerciceDenombCombA {
  famille: "A";
  n: number;
  k: number;
  noms: string[];
  tailles: number[];
  resultat: bigint;
}

// ============================================================================
// Famille B — Sélections combinées indépendantes. 4 sous-types, 2 écrans.
// ============================================================================

export type SousTypeDenombCombB = "roleDistingue" | "poolsSepares" | "memeContrainte" | "partitionComplementaire";

/** "Rôle distingué + reste en combinaison" (ex. président puis k vice-présidents) : `n` personnes,
 * `resultat = n × C(n−1,k)`. */
export interface ExerciceDenombCombB_RoleDistingue {
  famille: "B";
  sousType: "roleDistingue";
  n: number;
  k: number;
  resultat: number;
}

/** "Pools séparés indépendants" (ET, multiplication) : `resultat = C(n1,k1) × C(n2,k2)`. */
export interface ExerciceDenombCombB_PoolsSepares {
  famille: "B";
  sousType: "poolsSepares";
  n1: number;
  k1: number;
  n2: number;
  k2: number;
  resultat: number;
}

/** "Même contrainte sur 2 groupes, résultats additionnés" (OU exclusif, addition) — ex. choisir k
 * personnes entièrement dans le groupe 1 OU entièrement dans le groupe 2 : `resultat = C(n1,k) +
 * C(n2,k)`. */
export interface ExerciceDenombCombB_MemeContrainte {
  famille: "B";
  sousType: "memeContrainte";
  n1: number;
  n2: number;
  k: number;
  resultat: number;
}

/** "Partition en 2 groupes complémentaires" — choisir un sous-groupe de taille `k` détermine
 * automatiquement l'autre : `resultat = C(n,k)`. */
export interface ExerciceDenombCombB_PartitionComplementaire {
  famille: "B";
  sousType: "partitionComplementaire";
  n: number;
  k: number;
  resultat: number;
}

export type ExerciceDenombCombB = ExerciceDenombCombB_RoleDistingue | ExerciceDenombCombB_PoolsSepares | ExerciceDenombCombB_MemeContrainte | ExerciceDenombCombB_PartitionComplementaire;

// ============================================================================
// Famille C — Combinaisons avec répétition et distinguabilité. 2 sous-types, 2 écrans.
// ============================================================================

/** "Combinaisons avec répétition" (ex. dominos) : choisir 2 valeurs parmi `n`, répétition autorisée,
 * ordre sans importance. `resultat = C(n,2) + n = C(n+1,2)`. Écran 1 → formule NON CALCULÉE typée
 * (`C(n,2)+n`, évaluateur `expressionCombinatoire.ts` — supporte `C(a,b)`). Écran 2 → calcul. */
export interface ExerciceDenombCombC_Repetition {
  famille: "C";
  sousType: "repetition";
  n: number;
  resultat: number;
}

/** "Comparaison discernable/indiscernable" (ex. deux dés) : `n` valeurs possibles par objet, 2
 * objets. `resultatDiscernable = n²` (résultats ORDONNÉS, objets discernables — ex. couleurs
 * différentes). `resultatIndiscernable = C(n+1,2)` (résultats NON ORDONNÉS avec répétition, objets
 * indiscernables — ex. dés identiques). Écran 1 → ATTRIBUTION (2 champs `choix`, jamais de texte
 * libre — piège central : attribuer la bonne formule au bon contexte physique). Écran 2 → calcul des
 * 2 valeurs. */
export interface ExerciceDenombCombC_Comparaison {
  famille: "C";
  sousType: "comparaison";
  n: number;
  resultatDiscernable: number;
  resultatIndiscernable: number;
}

export type ExerciceDenombCombC = ExerciceDenombCombC_Repetition | ExerciceDenombCombC_Comparaison;

// ============================================================================
// Famille D — Sélections avec restrictions. 3 sous-types, TOUJOURS 3 écrans (le corps du prompt de
// mission décrit explicitement 3 écrans pour cette famille malgré le "2-3 écrans" du titre — voir
// justification dans le rapport de livraison / commit).
// ============================================================================

export type SousTypeDenombCombD = "exclusionPaire" | "coupleIndissociable" | "contrainteRiche";

/** "exclusion" (ne peuvent être choisis ensemble, soustraction) vs "indissociable" (ensemble ou pas
 * du tout, addition) — identifié à l'écran 1 (QCM, jamais de texte libre). `contrainteRiche` (variante
 * étendue à 2 catégories, même mécanique de soustraction que `exclusionPaire`) partage `typeContrainte
 * = "exclusion"`. */
export type TypeContrainteD = "exclusion" | "indissociable";

/** `n` éléments (`nA`+`nB` pour `contrainteRiche`, sinon `n` seul et `nA`/`nB` absents), 2 éléments
 * précis notés X et Y, sélection de `k` éléments au total.
 * - `exclusionPaire`/`contrainteRiche` : `terme1 = C(n,k)` (total sans restriction), `terme2 =
 *   C(n−2,k−2)` (cas où X et Y sont TOUS LES DEUX inclus, à exclure) → `resultatFinal = terme1 −
 *   terme2`.
 * - `coupleIndissociable` : `terme1 = C(n−2,k−2)` (X et Y tous les deux inclus), `terme2 = C(n−2,k)`
 *   (X et Y tous les deux exclus) → `resultatFinal = terme1 + terme2`.
 * Écran 1 → QCM (identifier `typeContrainte`). Écran 2 → calculer `terme1`/`terme2` séparément.
 * Écran 3 → combiner (soustraction ou addition SELON `typeContrainte`, PIÈGE CENTRAL de la famille —
 * voir `docs/historique-6e.md` pour le test de régression dédié). */
export interface ExerciceDenombCombD {
  famille: "D";
  sousType: SousTypeDenombCombD;
  typeContrainte: TypeContrainteD;
  n: number;
  k: number;
  nA?: number;
  nB?: number;
  terme1: number;
  terme2: number;
  resultatFinal: number;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceDenombrementCombine = ExerciceDenombCombA | ExerciceDenombCombB | ExerciceDenombCombC | ExerciceDenombCombD;

export type FamilleDenombrementCombine = ExerciceDenombrementCombine["famille"];
