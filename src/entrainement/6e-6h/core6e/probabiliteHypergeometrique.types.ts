/**
 * Couche core (6e) — contrat pour `6gen47` ("Probabilité hypergéométrique (tirage sans remise)"),
 * chapitre "Analyse combinatoire". 3 familles A/B/C, tirage ÉQUIPROBABLE de la famille PUIS d'un
 * sous-type/contexte à l'intérieur de la famille — voir
 * `generateurs6e/probabiliteHypergeometrique/index.ts`.
 *
 * **Convention transversale à ce contrat** (identique à `denombrementFondamental.types.ts`,
 * 6gen43) : chaque variante porte déjà, PRÉ-CALCULÉES par la Couche A (jamais recalculées côté
 * Couche B — `moteur6e/` n'importe jamais `generateurs6e/`, voir CLAUDE.md), toutes les valeurs
 * numériques correctes attendues à chaque écran. La Couche B
 * (`moteur6e/verificationProbabiliteHypergeometrique.ts`) se contente de comparer la saisie élève
 * à ces valeurs (via `diagnostiquerValeur`, tolérance 0,01 — convention établie par
 * `moteur6e/verificationProbabilites.ts`, chapitre 8/6gen30, réutilisée ici sans modification :
 * voir en-tête de ce fichier moteur pour la justification complète).
 */

// ============================================================================
// Famille A — Hypergéométrique de base, composition sans ordre (2 écrans).
// ============================================================================

/** Identifiant de contexte — banque de 5 contextes (`generateurs6e/probabiliteHypergeometrique/
 * contextesA.ts`) : cartes, fiches d'examen, pièces défectueuses, boules colorées, loto. */
export type IdContexteHypergeoA = "cartes" | "examen" | "piecesDefectueuses" | "boulesColorees" | "loto";

/** Habillage textuel d'un contexte, entièrement PRÉ-REMPLI par la Couche A (aucune fonction — ce
 * fichier reste des types purs). `phraseContexte` NE contient PAS les valeurs N/K/n (affichées
 * séparément dans le bloc données via des champs LaTeX dédiés) — uniquement la description en
 * français du contexte, DÉJÀ DÉCOUPÉE en plusieurs fragments `\text{...}` courts (jamais une seule
 * phrase longue dans un seul fragment — piège CLAUDE.md/6gen43 : un fragment KaTeX ne retourne
 * jamais à la ligne, déborde horizontalement dès qu'il dépasse ~50 caractères). `labelPopulation`/
 * `labelSucces`/`labelTirage` sont du texte français BRUT (jamais du LaTeX pré-enveloppé) — c'est à
 * l'appelant (`ui6e/formatProbabiliteHypergeometrique.ts`) de les insérer À L'INTÉRIEUR d'un
 * `\text{...}`, jamais entre deux fragments `\text{}` séparés (qui les laisserait en mode maths
 * brut — les espaces y sont silencieusement supprimés, bug déjà rencontré et corrigé ici). */
export interface ContexteHypergeoA {
  id: IdContexteHypergeoA;
  phraseContexte: string[];
  labelPopulation: string;
  labelSucces: string;
  labelTirage: string;
}

/** Sous-type de la famille A — les 3 variantes mentionnées par la mission, toutes utilisant la
 * MÊME formule hypergéométrique, seul `k` change de nature. */
export type SousTypeHypergeoA = "aucun" | "tous" | "exactement";

/** Écran 1 → poser la formule C(K,k)·C(N−K,n−k)/C(N,n) (champ texte libre, expression NON réduite
 * acceptée — mirroir `6gen33` famille B écran 1, "pose la formule"). Écran 2 → calculer le résultat
 * à partir de la formule CONFIRMÉE (même valeur numérique cible que l'écran 1 — convention établie
 * par `6gen33`, voir `moteur6e/verificationProbabiliteHypergeometrique.ts`). */
export interface ExerciceHypergeoA {
  famille: "A";
  sousType: SousTypeHypergeoA;
  contexte: ContexteHypergeoA;
  N: number;
  K: number;
  n: number;
  k: number;
  numerateurFacteur1: number; // C(K,k)
  numerateurFacteur2: number; // C(N-K,n-k)
  denominateur: number; // C(N,n)
  probabilite: number; // numerateurFacteur1 * numerateurFacteur2 / denominateur
}

// ============================================================================
// Famille B — Contraste ordre vs composition (3 écrans).
// ============================================================================

/** Une des 2 couleurs de l'urne, dans une séquence de 3 tirages successifs sans remise. */
export type CouleurHypergeoB = "c1" | "c2";

/** `n1` boules de couleur `"c1"`, `n2` boules de couleur `"c2"` (`N=n1+n2`), tirage successif SANS
 * remise de 3 boules. `sequence` est la séquence EXACTE tirée (ordre précis, longueur 3) ;
 * `a`/`b` sont les comptes de `"c1"`/`"c2"` dans cette séquence (`a+b=3`) — la COMPOSITION, sans
 * tenir compte de l'ordre. Écran 1 → `probabiliteSequence` (produit de fractions décroissantes).
 * Écran 2 → `probabiliteComposition` (formule hypergéométrique, même composition, ordre libre).
 * Écran 3 → `nombreArrangements` (= C(3,a), le rapport `probabiliteComposition/
 * probabiliteSequence`, ATTENDU sur les 2 champs de cet écran — voir en-tête moteur).
 *
 * `numerateurSequence`/`denominateurSequence` et `numerateurComposition`/`denominateurComposition`
 * — les MÊMES 2 probabilités que `probabiliteSequence`/`probabiliteComposition` (`number` décimal,
 * utilisé pour la vérification à tolérance), mais sous forme de fraction EXACTE (entiers, jamais
 * réduits ici — la réduction est un pur affichage, `ui6e/formatProbabiliteHypergeometrique.ts`) :
 * convention CLAUDE.md "fraction irréductible, jamais de décimal, pour toute valeur générée par la
 * plateforme" — un `number` flottant seul ne suffirait pas à afficher une fraction exacte fiable
 * dans le bloc "état actuel"/le récapitulatif final. */
export interface ExerciceHypergeoB {
  famille: "B";
  n1: number;
  n2: number;
  N: number;
  sequence: CouleurHypergeoB[];
  a: number;
  b: number;
  numerateurSequence: number;
  denominateurSequence: number;
  probabiliteSequence: number;
  numerateurComposition: number;
  denominateurComposition: number;
  probabiliteComposition: number;
  nombreArrangements: number;
}

// ============================================================================
// Famille C — Hypergéométrique à 2 catégories croisées (loto + bonus) (3 écrans).
// ============================================================================

/** Une des 2 catégories croisées (numéros principaux OU numéros bonus) — même structure
 * hypergéométrique que la famille A, appliquée deux fois de façon INDÉPENDANTE.
 *
 * `numerateur`/`denominateur` — même convention "fraction exacte" que la famille B (voir son
 * en-tête) : `numerateur = C(K,k)·C(N−K,n−k)`, `denominateur = C(N,n)`. */
export interface CategorieHypergeoC {
  N: number;
  K: number;
  n: number;
  k: number;
  numerateur: number;
  denominateur: number;
  probabilite: number;
}

/** Tirage combiné loto + bonus : `principal` (numéros principaux) ET `bonus` (numéros bonus),
 * tirés indépendamment. Écran 1 → `principal.probabilite`. Écran 2 → `bonus.probabilite`.
 * Écran 3 → `probabiliteCombinee` (= `principal.probabilite * bonus.probabilite`, à partir des 2
 * valeurs CORRECTES des écrans 1-2). */
export interface ExerciceHypergeoC {
  famille: "C";
  principal: CategorieHypergeoC;
  bonus: CategorieHypergeoC;
  numerateurCombine: number; // principal.numerateur * bonus.numerateur
  denominateurCombine: number; // principal.denominateur * bonus.denominateur
  probabiliteCombinee: number;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceProbabiliteHypergeometrique = ExerciceHypergeoA | ExerciceHypergeoB | ExerciceHypergeoC;

export type FamilleProbabiliteHypergeometrique = ExerciceProbabiliteHypergeometrique["famille"];
