import type { ExerciceLogProbA, ExerciceLogProbB, ExerciceLogProbC, ExerciceLogProbD, ExerciceLogProbE, ExerciceLogProbF, ExerciceLogProbG } from "../core6e/logarithmesProblemes.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEquationDifference, diagnostiquerEquivalenceFonction, diagnostiquerValeur, separerEquationTexte } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen22`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationLogarithmesProblemes.test.ts` pour la preuve avec des exercices factices définis
 * localement (même principe que `verificationExponentiellesProblemes.ts`, 6gen12). Réutilise les 2
 * fichiers PARTAGÉS `equivalenceExponentielle.ts`/`expressionExponentielle.ts` (jamais modifiés —
 * consigne du prompt) ; toute logique NOUVELLE de ce générateur (équation à variable nommée
 * arbitraire, équivalence à 2 variables libres...) est écrite ICI, jamais dans les fichiers
 * partagés.
 *
 * **Tolérances** (convention arrondie, héritée de 6gen12) :
 * - `toleranceArrondie(cible)` — `max(0,5 ; 1% de |cible|)`, pour toute valeur numérique "mesurée"
 *   dont l'énoncé annonce un arrondi.
 * - `toleranceEchelle(cible)` — `max(0,5 ; 2% de |cible|)`, légèrement plus large que
 *   `toleranceArrondie` : réservée à la famille E, dont certaines valeurs (`X`) peuvent couvrir
 *   plusieurs ordres de grandeur (ex. décibels, magnitude) et chaînent plusieurs étapes de calcul.
 * - `tolerancePrix(cible)` — `max(0,01 ; 3% de |cible|)` — valeurs typiquement PETITES (prix
 *   d'équilibre famille G, taux famille A/F) où une tolérance absolue de 0,5 serait bien trop
 *   large (accepterait n'importe quel signe/ordre de grandeur).
 * - `TOLERANCE_TAUX` (0,03) — taux/rapports (r) dont la référence peut avoir légèrement bougé à
 *   cause d'un arrondi d'affichage en amont.
 * - `TOLERANCE_EXPRESSION` (0,05) — comparaisons d'expressions/modèles par échantillonnage
 *   numérique.
 */
const TOLERANCE_EXPRESSION = 0.05;
const TOLERANCE_TAUX = 0.03;

function toleranceArrondie(cible: number): number {
  return Math.max(0.5, Math.abs(cible) * 0.01);
}
function toleranceEchelle(cible: number): number {
  return Math.max(0.5, Math.abs(cible) * 0.02);
}
function tolerancePrix(cible: number): number {
  return Math.max(0.01, Math.abs(cible) * 0.03);
}

const NORMALISER_SYMBOLE: Record<string, string> = { ">=": ">=", "≥": ">=", "<=": "<=", "≤": "<=", "=": "=", "<": "<", ">": ">" };

/** Compare un texte "A op B" à 2 références, sur une variable NOMMÉE ARBITRAIREMENT (contrairement
 * à `diagnostiquerEquationTexte` du fichier partagé, qui suppose toujours "x") — vérifie en plus
 * que le symbole de comparaison correspond à `sensAttendu` si fourni (`null` ⟹ n'importe lequel des
 * 3 symboles `=`/`<=`/`>=`/leurs variantes unicode, pas de vérification de sens). */
function diagnostiquerEquationVariable(
  texte: string,
  variable: string,
  refGauche: (v: number) => number,
  refDroite: (v: number) => number,
  points: number[],
  sensAttendu: string | null,
  tolerance: number = TOLERANCE_EXPRESSION,
): StatutVerification {
  const separe = separerEquationTexte(texte);
  if (separe === null) return "parse_error";
  if (sensAttendu !== null && NORMALISER_SYMBOLE[separe.symbole] !== sensAttendu) return "not_equivalent";
  const statutGauche = diagnostiquerEquivalenceFonction(separe.gauche, refGauche, points, tolerance, variable);
  if (statutGauche === "parse_error") return "parse_error";
  const statutDroite = diagnostiquerEquivalenceFonction(separe.droite, refDroite, points, tolerance, variable);
  if (statutDroite === "parse_error") return "parse_error";
  if (statutGauche === "not_equivalent" || statutDroite === "not_equivalent") return "not_equivalent";
  return "correct";
}

/** Compare un texte (fonction de 2 variables LIBRES nommées) à une référence à 2 arguments —
 * nécessaire pour la famille D (le modèle affiché reste symbolique en `k`, jamais une valeur
 * numérique concrète). Grille `points1×points2` échantillonnée intégralement. */
function diagnostiquerEquivalenceDeuxVariables(
  texte: string,
  variables: [string, string],
  reference: (v1: number, v2: number) => number,
  points1: number[],
  points2: number[],
  tolerance: number = TOLERANCE_EXPRESSION,
): StatutVerification {
  let comparables = 0;
  for (const v1 of points1) {
    for (const v2 of points2) {
      const attendu = reference(v1, v2);
      if (!Number.isFinite(attendu)) continue;
      let soumis: number;
      try {
        soumis = evaluerExpressionExponentielle(texte, { [variables[0]]: v1, [variables[1]]: v2 });
      } catch {
        return "parse_error";
      }
      if (!Number.isFinite(soumis)) return "not_equivalent";
      comparables++;
      if (Math.abs(soumis - attendu) > tolerance) return "not_equivalent";
    }
  }
  const minimumRequis = Math.min(6, points1.length * points2.length);
  if (comparables < minimumRequis) return "parse_error";
  return "correct";
}

/** Compare 2 valeurs numériques ORDONNÉES (jamais interchangeables, contrairement à un ensemble) —
 * même patron que `diagnostiquerGEcran1` de `verificationExponentiellesProblemes.ts` (6gen12). */
function diagnostiquerPaireValeurs(texte1: string, cible1: number, texte2: string, cible2: number, tolerance1: number, tolerance2: number): StatutVerification {
  const s1 = diagnostiquerValeur(texte1, cible1, tolerance1);
  if (s1 === "parse_error") return "parse_error";
  const s2 = diagnostiquerValeur(texte2, cible2, tolerance2);
  if (s2 === "parse_error") return "parse_error";
  return s1 === "correct" && s2 === "correct" ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille A — 3 écrans, dispatch par sous-type (resoudreT/resoudreTaux/tauxDecroissance).
// ============================================================================

const POINTS_T = [0, 0.5, 1, 2, 3, 5, 8, 10];
const POINTS_I = [-0.5, -0.2, -0.1, 0, 0.1, 0.2, 0.5, 1];
const POINTS_K = [-1, -0.5, -0.1, 0, 0.1, 0.5, 1];

export function diagnostiquerAEcran1(exercice: ExerciceLogProbA, texte: string): StatutVerification {
  if (exercice.sousType === "resoudreT") {
    const { Q0, r, cible1Affiche, sens } = exercice;
    return diagnostiquerEquationVariable(texte, "t", (t) => Q0 * Math.pow(r, t), () => cible1Affiche, POINTS_T, sens, TOLERANCE_EXPRESSION);
  }
  if (exercice.sousType === "resoudreTaux") {
    const { Q0, n, cibleAffiche } = exercice;
    return diagnostiquerEquationVariable(texte, "i", (i) => Q0 * Math.pow(1 + i, n), () => cibleAffiche, POINTS_I, "=", TOLERANCE_EXPRESSION);
  }
  const { Q0, fraction, h } = exercice;
  return diagnostiquerEquationVariable(texte, "k", (k) => Q0 * Math.exp(-k * h), () => fraction * Q0, POINTS_K, "=", TOLERANCE_EXPRESSION);
}

export function diagnostiquerAEcran2(exercice: ExerciceLogProbA, texte: string): StatutVerification {
  if (exercice.sousType === "resoudreT") {
    const { Q0, r, cible1Affiche, sens } = exercice;
    return diagnostiquerEquationVariable(texte, "t", (t) => Math.pow(r, t), () => cible1Affiche / Q0, POINTS_T, sens, TOLERANCE_EXPRESSION);
  }
  if (exercice.sousType === "resoudreTaux") {
    const { Q0, n, cibleAffiche } = exercice;
    return diagnostiquerEquationVariable(texte, "i", (i) => Math.pow(1 + i, n), () => cibleAffiche / Q0, POINTS_I, "=", TOLERANCE_EXPRESSION);
  }
  const { fraction, h } = exercice;
  return diagnostiquerEquationVariable(texte, "k", (k) => Math.exp(-k * h), () => fraction, POINTS_K, "=", TOLERANCE_EXPRESSION);
}

/** Écran 3, sous-type "resoudreT", variante "simple" — 1 valeur numérique. */
export function diagnostiquerAEcran3Simple(exercice: ExerciceLogProbA, texte: string): StatutVerification {
  if (exercice.sousType !== "resoudreT") return "parse_error";
  return diagnostiquerValeur(texte, exercice.t1Reponse, toleranceArrondie(exercice.t1Reponse));
}

/** Écran 3, sous-type "resoudreT", variante "fenêtre" — 2 valeurs ORDONNÉES (t1 puis t2). */
export function diagnostiquerAEcran3Fenetre(exercice: ExerciceLogProbA, texte1: string, texte2: string): StatutVerification {
  if (exercice.sousType !== "resoudreT") return "parse_error";
  return diagnostiquerPaireValeurs(texte1, exercice.t1Reponse, texte2, exercice.t2Reponse, toleranceArrondie(exercice.t1Reponse), toleranceArrondie(exercice.t2Reponse));
}

export function diagnostiquerAEcran3Taux(exercice: ExerciceLogProbA, texte: string): StatutVerification {
  if (exercice.sousType !== "resoudreTaux") return "parse_error";
  return diagnostiquerValeur(texte, exercice.i, tolerancePrix(exercice.i));
}

export function diagnostiquerAEcran3Decroissance(exercice: ExerciceLogProbA, texte: string): StatutVerification {
  if (exercice.sousType !== "tauxDecroissance") return "parse_error";
  return diagnostiquerValeur(texte, exercice.k, tolerancePrix(exercice.k));
}

export function verifierAEcran1(exercice: ExerciceLogProbA, texte: string): boolean {
  return diagnostiquerAEcran1(exercice, texte) === "correct";
}
export function verifierAEcran2(exercice: ExerciceLogProbA, texte: string): boolean {
  return diagnostiquerAEcran2(exercice, texte) === "correct";
}
export function verifierAEcran3Simple(exercice: ExerciceLogProbA, texte: string): boolean {
  return diagnostiquerAEcran3Simple(exercice, texte) === "correct";
}
export function verifierAEcran3Fenetre(exercice: ExerciceLogProbA, texte1: string, texte2: string): boolean {
  return diagnostiquerAEcran3Fenetre(exercice, texte1, texte2) === "correct";
}
export function verifierAEcran3Taux(exercice: ExerciceLogProbA, texte: string): boolean {
  return diagnostiquerAEcran3Taux(exercice, texte) === "correct";
}
export function verifierAEcran3Decroissance(exercice: ExerciceLogProbA, texte: string): boolean {
  return diagnostiquerAEcran3Decroissance(exercice, texte) === "correct";
}

// ============================================================================
// Famille B — 4 écrans.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceLogProbB, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.r, TOLERANCE_TAUX);
}
export function diagnostiquerBEcran2(exercice: ExerciceLogProbB, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.Q0, toleranceArrondie(exercice.Q0));
}
export function diagnostiquerBEcran3(exercice: ExerciceLogProbB, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.valeurRef, toleranceArrondie(exercice.valeurRef));
}
export function diagnostiquerBEcran4(exercice: ExerciceLogProbB, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.tCible, toleranceArrondie(exercice.tCible));
}

export function verifierBEcran1(exercice: ExerciceLogProbB, texte: string): boolean {
  return diagnostiquerBEcran1(exercice, texte) === "correct";
}
export function verifierBEcran2(exercice: ExerciceLogProbB, texte: string): boolean {
  return diagnostiquerBEcran2(exercice, texte) === "correct";
}
export function verifierBEcran3(exercice: ExerciceLogProbB, texte: string): boolean {
  return diagnostiquerBEcran3(exercice, texte) === "correct";
}
export function verifierBEcran4(exercice: ExerciceLogProbB, texte: string): boolean {
  return diagnostiquerBEcran4(exercice, texte) === "correct";
}

// ============================================================================
// Famille C — 3 écrans.
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceLogProbC, texte: string): StatutVerification {
  const cible = exercice.sens === "versT" ? exercice.T : exercice.lambda;
  return diagnostiquerValeur(texte, cible, exercice.sens === "versT" ? toleranceArrondie(cible) : tolerancePrix(cible));
}
export function diagnostiquerCEcran2(exercice: ExerciceLogProbC, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.tEcran2, toleranceArrondie(exercice.tEcran2));
}
export function diagnostiquerCEcran3(exercice: ExerciceLogProbC, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.facteurCorrectif, tolerancePrix(exercice.facteurCorrectif));
}

export function verifierCEcran1(exercice: ExerciceLogProbC, texte: string): boolean {
  return diagnostiquerCEcran1(exercice, texte) === "correct";
}
export function verifierCEcran2(exercice: ExerciceLogProbC, texte: string): boolean {
  return diagnostiquerCEcran2(exercice, texte) === "correct";
}
export function verifierCEcran3(exercice: ExerciceLogProbC, texte: string): boolean {
  return diagnostiquerCEcran3(exercice, texte) === "correct";
}

// ============================================================================
// Famille D — 2 écrans, expressions à 2 variables libres (t/T et k, jamais résolu numériquement).
// ============================================================================

const POINTS_TD = [0, 1, 2, 5];
const POINTS_KD = [-2, -1, -0.5, 0.5, 1, 2];

export function diagnostiquerDEcran1(exercice: ExerciceLogProbD, texte: string): StatutVerification {
  const { Ta, T0 } = exercice;
  return diagnostiquerEquivalenceDeuxVariables(texte, ["t", "k"], (t, k) => Ta + (T0 - Ta) * Math.exp(k * t), POINTS_TD, POINTS_KD, TOLERANCE_EXPRESSION);
}

export function diagnostiquerDEcran2(exercice: ExerciceLogProbD, texte: string): StatutVerification {
  // Variable "t" (MINUSCULE) plutôt que "T" — le tokeniseur d'`expressionExponentielle.ts` met en
  // MINUSCULE tout identifiant (`nom.toLowerCase()`), donc une clé "T" dans le Record de variables
  // ne matcherait JAMAIS l'identifiant réellement produit pour un "T" tapé par l'élève (toujours lu
  // "t"). Aucune ambiguïté de sens ici : l'écran 2 n'a pas de variable "temps" à ce stade (déjà
  // substitué), donc réutiliser la même lettre normalisée pour "la température T" est sans risque —
  // l'élève peut taper indifféremment "T" ou "t", les deux sont interprétés identiquement.
  const { Ta, T0 } = exercice;
  const pointsT = [0.1, 0.3, 0.5, 0.7, 0.9].map((frac) => Ta + frac * (T0 - Ta));
  return diagnostiquerEquivalenceDeuxVariables(texte, ["t", "k"], (T, k) => (1 / k) * Math.log((T - Ta) / (T0 - Ta)), pointsT, POINTS_KD, TOLERANCE_EXPRESSION);
}

export function verifierDEcran1(exercice: ExerciceLogProbD, texte: string): boolean {
  return diagnostiquerDEcran1(exercice, texte) === "correct";
}
export function verifierDEcran2(exercice: ExerciceLogProbD, texte: string): boolean {
  return diagnostiquerDEcran2(exercice, texte) === "correct";
}

// ============================================================================
// Famille E — 3 ou 4 écrans (écran 1 sauté si `deduireAB===false`).
// ============================================================================

export function diagnostiquerEEcran1(exercice: ExerciceLogProbE, texteA: string, texteB: string): StatutVerification {
  return diagnostiquerPaireValeurs(texteA, exercice.a, texteB, exercice.b, Math.max(0.05, Math.abs(exercice.a) * 0.1), Math.max(0.05, Math.abs(exercice.b) * 0.1));
}
export function diagnostiquerEEcran2(exercice: ExerciceLogProbE, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.reponseEcran2, toleranceEchelle(exercice.reponseEcran2));
}
export function diagnostiquerEEcran3(exercice: ExerciceLogProbE, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.reponseEcran3, toleranceEchelle(exercice.reponseEcran3));
}
export function diagnostiquerEEcran4(exercice: ExerciceLogProbE, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.Ltotal, toleranceArrondie(exercice.Ltotal));
}

export function verifierEEcran1(exercice: ExerciceLogProbE, texteA: string, texteB: string): boolean {
  return diagnostiquerEEcran1(exercice, texteA, texteB) === "correct";
}
export function verifierEEcran2(exercice: ExerciceLogProbE, texte: string): boolean {
  return diagnostiquerEEcran2(exercice, texte) === "correct";
}
export function verifierEEcran3(exercice: ExerciceLogProbE, texte: string): boolean {
  return diagnostiquerEEcran3(exercice, texte) === "correct";
}
export function verifierEEcran4(exercice: ExerciceLogProbE, texte: string): boolean {
  return diagnostiquerEEcran4(exercice, texte) === "correct";
}

// ============================================================================
// Famille F — 3 écrans.
// ============================================================================

export function diagnostiquerFEcran1(exercice: ExerciceLogProbF, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.a, tolerancePrix(exercice.a));
}
export function diagnostiquerFEcran2(exercice: ExerciceLogProbF, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.t, tolerancePrix(exercice.t));
}
export function diagnostiquerFEcran3(exercice: ExerciceLogProbF, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.k, toleranceArrondie(exercice.k));
}

export function verifierFEcran1(exercice: ExerciceLogProbF, texte: string): boolean {
  return diagnostiquerFEcran1(exercice, texte) === "correct";
}
export function verifierFEcran2(exercice: ExerciceLogProbF, texte: string): boolean {
  return diagnostiquerFEcran2(exercice, texte) === "correct";
}
export function verifierFEcran3(exercice: ExerciceLogProbF, texte: string): boolean {
  return diagnostiquerFEcran3(exercice, texte) === "correct";
}

// ============================================================================
// Famille G — 4 écrans.
// ============================================================================

const POINTS_U = [-3, -2, -1, 0, 1, 2, 3, 5];

export function diagnostiquerGEcran1(exercice: ExerciceLogProbG, texteO: string, texteD: string): StatutVerification {
  return diagnostiquerPaireValeurs(texteO, exercice.oX0, texteD, exercice.dX0, toleranceArrondie(exercice.oX0), toleranceArrondie(exercice.dX0));
}
export function diagnostiquerGEcran2(exercice: ExerciceLogProbG, texte: string): StatutVerification {
  const { A, B } = exercice;
  return diagnostiquerEquationDifference(texte, "u", (u) => A * u * u - (A + B), POINTS_U, TOLERANCE_EXPRESSION);
}
export function diagnostiquerGEcran3(exercice: ExerciceLogProbG, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.xEquilibre, tolerancePrix(exercice.xEquilibre));
}
export function diagnostiquerGEcran4(exercice: ExerciceLogProbG, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.xEcran4, tolerancePrix(exercice.xEcran4));
}

export function verifierGEcran1(exercice: ExerciceLogProbG, texteO: string, texteD: string): boolean {
  return diagnostiquerGEcran1(exercice, texteO, texteD) === "correct";
}
export function verifierGEcran2(exercice: ExerciceLogProbG, texte: string): boolean {
  return diagnostiquerGEcran2(exercice, texte) === "correct";
}
export function verifierGEcran3(exercice: ExerciceLogProbG, texte: string): boolean {
  return diagnostiquerGEcran3(exercice, texte) === "correct";
}
export function verifierGEcran4(exercice: ExerciceLogProbG, texte: string): boolean {
  return diagnostiquerGEcran4(exercice, texte) === "correct";
}
