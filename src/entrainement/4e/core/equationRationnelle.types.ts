/**
 * Couche core — contrat du générateur "L'inconnue au dénominateur" (équations rationnelles,
 * exercice 17). Comme l'exercice "Simplifier", ce module réutilise délibérément le type
 * `Exercice` de l'exercice "méthode la plus rapide" pour l'équation isolée (x²+bx+c=0, construite
 * via une des 4 techniques déjà codées) — voir CLAUDE.md pour la justification de ce couplage
 * assumé.
 *
 * Trois constructions possibles, tirées avec un poids égal (voir
 * generateurs/equationRationnelle/index.ts — répartition à affiner globalement plus tard, pour
 * l'instant 1/3 chacune), jamais devinables à l'avance depuis l'apparence de l'énoncé :
 * - `un_denominateur` (V1, spec-equations-rationnelles-un-denominateur.md) : `A/(x-p) = x-q`, un
 *   seul dénominateur non trivial, `p` toujours exclu des racines de `equationIsolee` par
 *   construction — l'étape "racines étrangères" y conclut donc toujours "aucune à rejeter".
 * - `deux_denominateurs` (prompt-deux-denominateurs-racine-etrangere.md) : `A/(x-p) = N(x)/D(x)`
 *   avec `D(x) = (x-p)(x-s)`, les deux dénominateurs partageant le facteur `(x-p)` — `p` est ici
 *   **toujours** une racine de `equationIsolee` (racine étrangère systématique, à rejeter),
 *   l'autre racine étant toujours valide.
 * - `deux_fractions_lineaires` (prompt-2-cas3-degre1.md) : `P1_1/P1_2 = P1_3/P1_4`, les 4
 *   polynômes tous de degré 1. Trois sous-variantes internes (a/b/c, tirées équiprobablement à la
 *   génération, jamais exposées dans le contrat — voir generateurs/equationRationnelle/
 *   construireSousVarianteA/B/C.ts) : (a) `P1_3` proportionnel à `P1_4` → racine de `P1_4`
 *   toujours étrangère ; (b) `P1_1` proportionnel à `P1_3` → les deux racines toujours valides ;
 *   (c) cas générique, sans proportionnalité, classifié post-hoc comme `deux_denominateurs`.
 *   (a) et (b) sautent l'étape de reconnaissance (`equationIsolee.categorie` vaut toujours
 *   `mise_en_evidence_generalisee`, jamais choisie a priori pour les 4 autres constructions du
 *   projet — voir `necessiteReconnaissance` dans sessionEquationRationnelle.ts) ; (c) la garde
 *   (une des 4 techniques réelles).
 *
 * `ce` (conditions d'existence de l'énoncé affiché) est le champ générique consommé par la Couche
 * B indépendamment de la construction : longueur 1 (`[p]`) pour `un_denominateur`, longueur 2
 * pour les deux autres. C'est ce qui permet à `soumettreReponseCE` et
 * `soumettreReponseRacinesEtrangeres` (src/moteur/sessionEquationRationnelle.ts) de rester
 * entièrement génériques sur le nombre de valeurs interdites, sans jamais tester `construction`.
 */

import type { Exercice } from "./generateur.types";
import type { ExerciceSimplification, PolynomeLineaire } from "./simplification.types";

/**
 * Une fraction P1/P2 de l'énoncé affiché qui est **individuellement** réductible (son propre
 * numérateur et son propre dénominateur partagent un facteur numérique commun) —
 * prompt-3-simplifier-et-isolement-flexible.md, section 2. `numerateur`/`denominateur` sont
 * toujours les valeurs **d'origine** (non réduites) : c'est à l'élève de trouver `diviseur`.
 * Jamais de réduction structurelle (racine commune) ici — voir CLAUDE.md, exclue à la
 * construction précisément pour ne jamais chevaucher le rôle de "racines étrangères".
 */
export interface FractionAReduire {
  cote: "gauche" | "droite";
  numerateur: PolynomeLineaire;
  denominateur: PolynomeLineaire;
  /** pgcd(|numerateur.k|, |denominateur.k|), toujours > 1 */
  diviseur: number;
}

interface ExerciceEquationRationnelleBase {
  /** conditions d'existence de l'énoncé affiché — 1 valeur pour un_denominateur, 2 pour deux_denominateurs */
  ce: number[];
  /** x² + bx + c = 0 obtenue après élimination des dénominateurs (déjà réduite — voir fractionsSimplifiables), une des 4 techniques de l'exercice 1 */
  equationIsolee: Exercice;
  /** fractions individuellement réductibles de l'énoncé — vide si aucune (étape "simplifier" sautée) */
  fractionsSimplifiables: FractionAReduire[];
  /**
   * Présent uniquement pour les constructions `p2_sur_p1`/`p1_sur_p2` (prompt-cas4a-4b.md) : la
   * fraction de gauche contient un P2 partageant sa racine `p` avec l'autre membre de la fraction —
   * réutilise directement le contrat de l'exercice "Simplifier" (`ExerciceSimplification`, type
   * "P2/P1" ou "P1/P2") pour piloter le même mécanisme de reconnaissance/factorisation/racines et
   * la même vérification de simplification (`verifierSimplification`), plutôt que de dupliquer ce
   * mécanisme. La présence de ce champ (jamais `exercice.construction`) décide dans le moteur si la
   * séquence passe par les phases riches `simplifierReconnaissance/Champ1/Champ2/Fraction` (voir
   * sessionEquationRationnelle.ts) plutôt que la simple étape `simplifier` (fractionsSimplifiables).
   * Contrairement à `fractionsSimplifiables`, cette étape n'est jamais sautée : elle est
   * systématique par construction pour ces deux cas (jamais besoin de vérifier la réductibilité).
   */
  fractionGauche?: ExerciceSimplification;
}

export interface ExerciceUnDenominateur extends ExerciceEquationRationnelleBase {
  construction: "un_denominateur";
  /** valeur interdite (CE) — toujours exclue des racines de equationIsolee dans cette construction */
  p: number;
  /** q = -b - p, dérivé de la relation p+q = -b */
  q: number;
  /** A = p·q - c, dérivé de la relation c = p·q - A ; toujours un entier non nul par construction */
  A: number;
}

export interface ExerciceDeuxDenominateurs extends ExerciceEquationRationnelleBase {
  construction: "deux_denominateurs";
  /** valeur interdite commune aux deux dénominateurs — toujours une racine de equationIsolee (racine étrangère) */
  p: number;
  /** second facteur du dénominateur de droite D(x) = (x-p)(x-s), s ≠ p */
  s: number;
  /** racine du numérateur de droite N(x) = k(x-t) */
  t: number;
  /** constante du numérateur de gauche, non nulle, ≠ k */
  A: number;
  /** coefficient du numérateur de droite, non nul, ≠ A */
  k: number;
}

export interface ExerciceDeuxFractionsLineaires extends ExerciceEquationRationnelleBase {
  construction: "deux_fractions_lineaires";
  /** P1_1/P1_2 = P1_3/P1_4 — réutilise PolynomeLineaire (k(x-p)) de l'exercice "Simplifier". */
  numerateurGauche: PolynomeLineaire;
  denominateurGauche: PolynomeLineaire;
  numerateurDroit: PolynomeLineaire;
  denominateurDroit: PolynomeLineaire;
}

/**
 * Cas 4a (prompt-cas4a-4b.md) : `P2/P1_1 = P0/P1_2`. `P2` (numérateur gauche) partage sa racine
 * `p` avec `P1_1` (dénominateur gauche) — `fractionGauche` est toujours de type "P2/P1". Sans
 * simplifier, la mise en croix `P2·P1_2 = P0·P1_1` est un polynôme de degré 3 (coefficient
 * cubique `a·k2` toujours non nul : `a` est le coefficient dominant du P2, jamais nul par
 * définition, `k2` le coefficient de `P1_2`, jamais nul par construction) — l'élève n'a pas les
 * outils pour la résoudre sans passer par la simplification. `P0` (numérateur droit) ne contribue
 * aucune CE ; `ce = [p, q]` où `q` est la racine de `P1_2`.
 */
export interface ExerciceCas4a extends ExerciceEquationRationnelleBase {
  construction: "p2_sur_p1";
  /** toujours présent pour ce cas (jamais optionnel comme dans la base) — type "P2/P1" */
  fractionGauche: ExerciceSimplification;
  denominateurDroit: PolynomeLineaire;
  /** constante non nulle, numérateur droit */
  P0: number;
}

/**
 * Cas 4b (prompt-cas4a-4b.md) : `P1_1/P2 = P1_2/P0`. `P1_1` (numérateur gauche) partage sa racine
 * `p` avec `P2` (dénominateur gauche) — `fractionGauche` est toujours de type "P1/P2", et `P2` y
 * exclut toujours `produit_remarquable` (même raison que pour un dénominateur ailleurs dans le
 * projet : une racine double laisserait un facteur résiduel après une seule simplification).
 * Même garantie de degré 3 avant simplification (coefficient cubique `k2·a` toujours non nul).
 * `P0` (dénominateur droit) ne contribue aucune CE ; `ce = [p, s]`, les deux racines de `P2`.
 */
export interface ExerciceCas4b extends ExerciceEquationRationnelleBase {
  construction: "p1_sur_p2";
  /** toujours présent pour ce cas (jamais optionnel comme dans la base) — type "P1/P2" */
  fractionGauche: ExerciceSimplification;
  numerateurDroit: PolynomeLineaire;
  /** constante non nulle, dénominateur droit */
  P0: number;
}

export type ExerciceEquationRationnelle =
  | ExerciceUnDenominateur
  | ExerciceDeuxDenominateurs
  | ExerciceDeuxFractionsLineaires
  | ExerciceCas4a
  | ExerciceCas4b;

export type GenerateurExerciceEquationRationnelle = () => ExerciceEquationRationnelle;
