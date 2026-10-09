import { coefficientBinomial } from "../combinatoire";
import type { CouleurHypergeoB, ExerciceHypergeoB } from "../../core6e/probabiliteHypergeometrique.types";
import { tirerEntier, tirerParmi } from "./aleatoire";
import { dansPlageAcceptable } from "./familleA";

/**
 * Couche A (6e) — génération, famille B ("Contraste ordre vs composition") de `6gen47`. Urne à 2
 * couleurs (`n1` boules `"c1"`, `n2` boules `"c2"`, `n1,n2∈{4,...,8}`), tirage successif SANS
 * remise de 3 boules.
 *
 * - `probabiliteSequence` : probabilité de la séquence EXACTE tirée (produit de fractions
 *   décroissantes, position par position — jamais la formule hypergéométrique ici, c'est
 *   exactement la distinction pédagogique de cette famille).
 * - `probabiliteComposition` : probabilité de la MÊME composition (mêmes comptes `a`/`b`), ordre
 *   libre — formule hypergéométrique, réutilise `coefficientBinomial` (`generateurs6e/
 *   combinatoire.ts`, fondation 6gen43/44).
 * - `nombreArrangements` : nombre de séquences distinctes réalisant cette composition
 *   (= `C(3,a)`, permutations avec répétition d'un multi-ensemble à 2 valeurs) — IDENTIQUE au
 *   rapport `probabiliteComposition/probabiliteSequence` (identité vérifiée par
 *   `familleB.test.ts` sur de nombreux tirages : un tirage sans remise donne la même probabilité à
 *   chaque ordre spécifique d'une même composition, donc `probabiliteComposition` est la somme de
 *   `nombreArrangements` probabilités toutes égales à `probabiliteSequence`).
 */

const VALEURS_N1_N2 = [4, 5, 6, 7, 8] as const;

function construireSequence(a: number, b: number): CouleurHypergeoB[] {
  const multiEnsemble: CouleurHypergeoB[] = [...Array<CouleurHypergeoB>(a).fill("c1"), ...Array<CouleurHypergeoB>(b).fill("c2")];
  // Mélange de Fisher-Yates.
  for (let i = multiEnsemble.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [multiEnsemble[i], multiEnsemble[j]] = [multiEnsemble[j], multiEnsemble[i]];
  }
  return multiEnsemble;
}

export interface FractionExacte {
  numerateur: number;
  denominateur: number;
  valeur: number;
}

/** Fraction EXACTE (entiers, jamais réduite ici — pur affichage, `ui6e/
 * formatProbabiliteHypergeometrique.ts`) — voir en-tête `core6e/probabiliteHypergeometrique.types.ts`
 * pour la justification ("fraction irréductible, jamais de décimal"). */
export function calculerProbabiliteSequence(n1: number, n2: number, sequence: CouleurHypergeoB[]): FractionExacte {
  const N = n1 + n2;
  let restantC1 = n1;
  let restantC2 = n2;
  let restantTotal = N;
  let numerateur = 1;
  let denominateur = 1;
  for (const couleur of sequence) {
    const restantCouleur = couleur === "c1" ? restantC1 : restantC2;
    numerateur *= restantCouleur;
    denominateur *= restantTotal;
    if (couleur === "c1") restantC1--;
    else restantC2--;
    restantTotal--;
  }
  return { numerateur, denominateur, valeur: numerateur / denominateur };
}

export function calculerProbabiliteComposition(n1: number, n2: number, a: number, b: number): FractionExacte {
  const N = n1 + n2;
  const numerateur = coefficientBinomial(n1, a) * coefficientBinomial(n2, b);
  const denominateur = coefficientBinomial(N, 3);
  return { numerateur, denominateur, valeur: numerateur / denominateur };
}

function construireExerciceB(): ExerciceHypergeoB {
  const n1 = tirerParmi(VALEURS_N1_N2);
  const n2 = tirerParmi(VALEURS_N1_N2);
  const N = n1 + n2;
  const a = tirerEntier(0, 3);
  const b = 3 - a;
  const sequence = construireSequence(a, b);
  const fracSequence = calculerProbabiliteSequence(n1, n2, sequence);
  const fracComposition = calculerProbabiliteComposition(n1, n2, a, b);
  const nombreArrangements = coefficientBinomial(3, a);
  return {
    famille: "B",
    n1,
    n2,
    N,
    sequence,
    a,
    b,
    numerateurSequence: fracSequence.numerateur,
    denominateurSequence: fracSequence.denominateur,
    probabiliteSequence: fracSequence.valeur,
    numerateurComposition: fracComposition.numerateur,
    denominateurComposition: fracComposition.denominateur,
    probabiliteComposition: fracComposition.valeur,
    nombreArrangements,
  };
}

const ESSAIS_MAX = 40;
const PROBABILITE_SEQUENCE_MIN = 0.02;

export function construireFamilleB(): ExerciceHypergeoB {
  let dernier: ExerciceHypergeoB | null = null;
  for (let essai = 0; essai < ESSAIS_MAX; essai++) {
    const exercice = construireExerciceB();
    dernier = exercice;
    if (dansPlageAcceptable(exercice.probabiliteSequence, PROBABILITE_SEQUENCE_MIN, 1)) return exercice;
  }
  /* c8 ignore next */
  return dernier as ExerciceHypergeoB;
}
