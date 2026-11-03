import type { ExerciceLogProbA, ExerciceLogProbB, ExerciceLogProbC, ExerciceLogProbE, ExerciceLogProbF } from "../core6e/logarithmesProblemes.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEquivalenceFonction, diagnostiquerValeur, separerEquationTexte } from "./equivalenceExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen22`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationLogarithmesProblemes.test.ts` pour la preuve avec des exercices factices définis
 * localement (même principe que `verificationExponentiellesProblemes.ts`, 6gen12). Réutilise les 2
 * fichiers PARTAGÉS `equivalenceExponentielle.ts`/`expressionExponentielle.ts` (jamais modifiés —
 * consigne du prompt) ; toute logique NOUVELLE de ce générateur (équation à variable nommée
 * arbitraire, équivalence à 2 variables libres...) est écrite ICI, jamais dans les fichiers
 * partagés.
 *
 * **Tolérances** (audit chapitre 3 de 6e) — toujours RELATIVES, avec un petit plancher absolu
 * adapté à l'ordre de grandeur de la réponse : l'ancienne tolérance `max(0,5 ; 2 %)` acceptait
 * « 0 » pour une concentration de 1,26·10⁻³ mol/L, et un taux voisin faux (r = 1,03 pour 1,05).
 * - `toleranceRelative(cible, rel, plancher)` — `max(plancher, rel·|cible|)`.
 * - `TOLERANCE_EXPRESSION` (0,05) — comparaisons d'expressions/modèles par échantillonnage.
 */
const TOLERANCE_EXPRESSION = 0.05;
/** Taux multiplicateur r (famille B) — les valeurs possibles sont espacées de 0,02 à 0,03. */
const TOLERANCE_TAUX_R = 0.005;
/** Réponse entière (nombre de périodes). */
const TOLERANCE_ENTIER = 0.01;

function toleranceRelative(cible: number, rel: number, plancher: number): number {
  return Math.max(plancher, Math.abs(cible) * rel);
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
  return diagnostiquerValeur(texte, exercice.t1Reponse, TOLERANCE_ENTIER);
}

/** Écran 3, sous-type "resoudreT", variante "fenêtre" — 2 valeurs ORDONNÉES (t1 puis t2). */
export function diagnostiquerAEcran3Fenetre(exercice: ExerciceLogProbA, texte1: string, texte2: string): StatutVerification {
  if (exercice.sousType !== "resoudreT") return "parse_error";
  return diagnostiquerPaireValeurs(texte1, exercice.t1Reponse, texte2, exercice.t2Reponse, TOLERANCE_ENTIER, TOLERANCE_ENTIER);
}

/** Taux i : accepté en décimal (0,0451) ou en pourcentage (4,51 % — avec ou sans le signe « % »,
 * une valeur ≥ 1 ne pouvant être qu'un pourcentage ici, puisque i < 1). */
export function diagnostiquerAEcran3Taux(exercice: ExerciceLogProbA, texte: string): StatutVerification {
  if (exercice.sousType !== "resoudreTaux") return "parse_error";
  const tolerance = toleranceRelative(exercice.i, 0.01, 0.0006);
  const enPourcent = texte.trim().endsWith("%");
  const sansPourcent = texte.replace(/%\s*$/, "");
  if (enPourcent) return diagnostiquerValeur(sansPourcent, 100 * exercice.i, 100 * tolerance);
  const statut = diagnostiquerValeur(sansPourcent, exercice.i, tolerance);
  if (statut !== "not_equivalent") return statut;
  return diagnostiquerValeur(sansPourcent, 100 * exercice.i, 100 * tolerance) === "correct" && 100 * exercice.i >= 1 ? "correct" : "not_equivalent";
}

export function diagnostiquerAEcran3Decroissance(exercice: ExerciceLogProbA, texte: string): StatutVerification {
  if (exercice.sousType !== "tauxDecroissance") return "parse_error";
  return diagnostiquerValeur(texte, exercice.k, toleranceRelative(exercice.k, 0.01, 0.0006));
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

/** r de référence = taux recalculé depuis les valeurs AFFICHÉES ; le taux exact du modèle est
 * aussi accepté (écart ≤ 0,005, bien en dessous de l'espacement des taux possibles). */
export function diagnostiquerBEcran1(exercice: ExerciceLogProbB, texte: string): StatutVerification {
  const statut = diagnostiquerValeur(texte, exercice.rAffiche, TOLERANCE_TAUX_R);
  if (statut !== "not_equivalent") return statut;
  return diagnostiquerValeur(texte, exercice.r, TOLERANCE_TAUX_R);
}
export function diagnostiquerBEcran2(exercice: ExerciceLogProbB, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.Q0, toleranceRelative(exercice.Q0, 0.01, 0.01));
}
export function diagnostiquerBEcran3(exercice: ExerciceLogProbB, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.valeurRef, toleranceRelative(exercice.valeurRef, 0.01, 0.01));
}
export function diagnostiquerBEcran4(exercice: ExerciceLogProbB, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.tCible, toleranceRelative(exercice.tCible, 0.01, 0.05));
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
  if (exercice.sens === "versT") return diagnostiquerValeur(texte, exercice.T, toleranceRelative(exercice.T, 0.01, 0.01));
  return diagnostiquerValeur(texte, exercice.lambda, toleranceRelative(exercice.lambda, 0.02, 1e-9));
}
export function diagnostiquerCEcran2(exercice: ExerciceLogProbC, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.tEcran2, toleranceRelative(exercice.tEcran2, 0.01, 0.05));
}
/** Facteur correctif voisin de 1 (ex. 5 730/5 568 ≈ 1,029) : arrondi au millième demandé. */
export function diagnostiquerCEcran3(exercice: ExerciceLogProbC, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.facteurCorrectif, 0.0015);
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
// Famille E — 3 ou 4 écrans (écran 1 sauté si `deduireAB===false`).
// ============================================================================

export function diagnostiquerEEcran1(exercice: ExerciceLogProbE, texteA: string, texteB: string): StatutVerification {
  return diagnostiquerPaireValeurs(texteA, exercice.a, texteB, exercice.b, toleranceRelative(exercice.a, 0.02, 0.02), toleranceRelative(exercice.b, 0.02, 0.02));
}
/** Une valeur d'échelle L s'arrondit au centième ; une grandeur X (souvent minuscule : 10⁻³ mol/L)
 * ne se juge qu'en relatif. */
export function diagnostiquerEEcran2(exercice: ExerciceLogProbE, texte: string): StatutVerification {
  const cible = exercice.reponseEcran2;
  return diagnostiquerValeur(texte, cible, exercice.sensEcran2 === "versL" ? toleranceRelative(cible, 0.01, 0.02) : toleranceRelative(cible, 0.02, 0));
}
export function diagnostiquerEEcran3(exercice: ExerciceLogProbE, texte: string): StatutVerification {
  const cible = exercice.reponseEcran3;
  return diagnostiquerValeur(texte, cible, exercice.sensEcran3 === "versDeltaL" ? toleranceRelative(cible, 0.01, 0.01) : toleranceRelative(cible, 0.02, 0));
}
export function diagnostiquerEEcran4(exercice: ExerciceLogProbE, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.Ltotal, 0.1);
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
  return diagnostiquerValeur(texte, exercice.a, toleranceRelative(exercice.a, 0.01, 0.01));
}
export function diagnostiquerFEcran2(exercice: ExerciceLogProbF, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.t, toleranceRelative(exercice.t, 0.01, 0.01));
}
export function diagnostiquerFEcran3(exercice: ExerciceLogProbF, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.k, 0.01);
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
