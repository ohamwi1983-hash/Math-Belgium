import type { ExerciceExpoProbA, ExerciceExpoProbB, ExerciceExpoProbC, ExerciceExpoProbD, ExerciceExpoProbE, ExerciceExpoProbF, ExerciceExpoProbG } from "../core6e/exponentiellesProblemes.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEnsembleValeurs, diagnostiquerEquivalenceFonction, diagnostiquerValeur } from "./equivalenceExponentielle";
import { evaluerValeurExponentielle } from "./expressionExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen12`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationExponentiellesProblemes.test.ts` pour la preuve avec des exercices factices définis
 * localement (même principe que `verificationEquationsExponentielles.ts`, 6gen9).
 *
 * Chaque `diagnostiquerXxx` retourne le statut à 3 valeurs (`StatutVerification`, convention
 * CLAUDE.md) — câblé côté UI via `formatMessageErreur` (`ui/messageErreur.ts`) pour distinguer une
 * erreur de syntaxe d'une réponse mathématiquement fausse. `verifierXxx` (booléen, consommé par
 * `etapeTentatives.ts`) se déduit systématiquement de `diagnostiquerXxx(...)==="correct"`.
 *
 * **Toutes les références utilisées ici sont les valeurs EXACTES de `exercice`** (jamais une
 * valeur ré-arrondie ou ré-saisie par l'élève à un écran précédent) — la correction d'un écran
 * n'est donc jamais polluée par la tolérance déjà accordée à un écran antérieur (voir le
 * commentaire de tête de `core6e/exponentiellesProblemes.types.ts`).
 *
 * **Tolérances** (convention arrondie, première du chapitre — voir CLAUDE.md) :
 * - `TOLERANCE_EXPRESSION` (0,05) — comparaisons d'expressions/modèles par échantillonnage
 *   numérique : une expression ALGÉBRIQUEMENT juste correspond à la référence à la précision
 *   flottante près, une expression fausse s'en écarte largement — jamais besoin d'une tolérance
 *   liée à l'ordre de grandeur ici, contrairement aux valeurs numériques "mesurées" ci-dessous.
 * - `toleranceArrondie(cible)` — `max(0,5 ; 1% de |cible|)` pour toute valeur numérique FINALE
 *   dont l'énoncé annonce un arrondi ("tolérance large") : ±0,5 pour une petite valeur (conforme à
 *   l'exemple de la spec, "±0,5 pour un arrondi à l'unité"), qui s'élargit proportionnellement pour
 *   une grandeur à 6-7 chiffres (ex. familles F/G) où exiger ±0,5 serait irréaliste.
 * - `TOLERANCE_TAUX` (0,03) — valeurs de type "taux"/"rapport" (r, r^d) dont la référence peut avoir
 *   légèrement bougé à cause de l'arrondi d'AFFICHAGE d'une donnée intermédiaire (v2Affiche,
 *   a/b/c Affiche) — spec explicite ("tolérance liée à l'arrondi de v2").
 * - `TOLERANCE_EXACTE` (0,05) — valeurs numériques dérivées d'une arithmétique EXACTE (ex.
 *   t=T-k, t=n/a), jamais "mesurées"/arrondies par construction.
 */
const TOLERANCE_EXPRESSION = 0.05;
const TOLERANCE_TAUX = 0.03;
const TOLERANCE_EXACTE = 0.05;

function toleranceArrondie(cible: number): number {
  return Math.max(0.5, Math.abs(cible) * 0.01);
}

const POINTS_T = [0, 0.5, 1, 2, 3, 5, 8, 10];

// ============================================================================
// Famille A — 2 écrans, dispatch par sous-type (evaluer/doublement).
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceExpoProbA, texte: string): StatutVerification {
  if (exercice.sousType === "doublement") {
    const T = exercice.T;
    return diagnostiquerEquivalenceFonction(texte, (t) => T - t, POINTS_T, TOLERANCE_EXPRESSION, "t");
  }
  const { Q0, r } = exercice;
  return diagnostiquerEquivalenceFonction(texte, (t) => Q0 * Math.pow(r, t), POINTS_T, TOLERANCE_EXPRESSION, "t");
}

export function diagnostiquerAEcran2(exercice: ExerciceExpoProbA, texte: string): StatutVerification {
  if (exercice.sousType === "doublement") return diagnostiquerValeur(texte, exercice.t, TOLERANCE_EXACTE);
  return diagnostiquerValeur(texte, exercice.valeurFinale, toleranceArrondie(exercice.valeurFinale));
}

export function verifierAEcran1(exercice: ExerciceExpoProbA, texte: string): boolean {
  return diagnostiquerAEcran1(exercice, texte) === "correct";
}
export function verifierAEcran2(exercice: ExerciceExpoProbA, texte: string): boolean {
  return diagnostiquerAEcran2(exercice, texte) === "correct";
}

// ============================================================================
// Famille B — 4 écrans.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceExpoProbB, texte: string): StatutVerification {
  const { Q0, q } = exercice;
  return diagnostiquerEquivalenceFonction(texte, (t) => Q0 * Math.pow(q, t), POINTS_T, TOLERANCE_EXPRESSION, "t");
}

/** Piège central : rejette le "reste" (aEcran1) — pas seulement un texte différent, une vraie
 * fonction différente, détectée par l'échantillonnage numérique. */
export function diagnostiquerBEcran2(exercice: ExerciceExpoProbB, texte: string): StatutVerification {
  const { Q0, q } = exercice;
  return diagnostiquerEquivalenceFonction(texte, (t) => Q0 * (1 - Math.pow(q, t)), POINTS_T, TOLERANCE_EXPRESSION, "t");
}

export function diagnostiquerBEcran3(exercice: ExerciceExpoProbB, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.complementN, toleranceArrondie(exercice.complementN));
}

export function diagnostiquerBEcran4(exercice: ExerciceExpoProbB, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.tSeuil, toleranceArrondie(exercice.tSeuil));
}

export function verifierBEcran1(exercice: ExerciceExpoProbB, texte: string): boolean {
  return diagnostiquerBEcran1(exercice, texte) === "correct";
}
export function verifierBEcran2(exercice: ExerciceExpoProbB, texte: string): boolean {
  return diagnostiquerBEcran2(exercice, texte) === "correct";
}
export function verifierBEcran3(exercice: ExerciceExpoProbB, texte: string): boolean {
  return diagnostiquerBEcran3(exercice, texte) === "correct";
}
export function verifierBEcran4(exercice: ExerciceExpoProbB, texte: string): boolean {
  return diagnostiquerBEcran4(exercice, texte) === "correct";
}

// ============================================================================
// Famille C — 3 écrans.
// ============================================================================

export function diagnostiquerCEcran1(exercice: ExerciceExpoProbC, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.r, TOLERANCE_TAUX);
}

export function diagnostiquerCEcran2(exercice: ExerciceExpoProbC, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.Q0, toleranceArrondie(exercice.Q0));
}

export function diagnostiquerCEcran3(exercice: ExerciceExpoProbC, textes: string[]): StatutVerification {
  const cible = exercice.valeursDemandees;
  const toleranceMax = Math.max(...cible.map((v) => toleranceArrondie(v)));
  return diagnostiquerEnsembleValeurs(textes, cible, toleranceMax);
}

export function verifierCEcran1(exercice: ExerciceExpoProbC, texte: string): boolean {
  return diagnostiquerCEcran1(exercice, texte) === "correct";
}
export function verifierCEcran2(exercice: ExerciceExpoProbC, texte: string): boolean {
  return diagnostiquerCEcran2(exercice, texte) === "correct";
}
export function verifierCEcran3(exercice: ExerciceExpoProbC, textes: string[]): boolean {
  return diagnostiquerCEcran3(exercice, textes) === "correct";
}

// ============================================================================
// Famille D — 4 écrans.
// ============================================================================

export function diagnostiquerDEcran1(exercice: ExerciceExpoProbD, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.rapport, TOLERANCE_TAUX);
}

export function diagnostiquerDEcran2(exercice: ExerciceExpoProbD, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.L, toleranceArrondie(exercice.L));
}

export function diagnostiquerDEcran3(exercice: ExerciceExpoProbD, texte: string): StatutVerification {
  const { L, C, r } = exercice;
  return diagnostiquerEquivalenceFonction(texte, (t) => L + C * Math.pow(r, t), POINTS_T, TOLERANCE_EXPRESSION, "t");
}

export function diagnostiquerDEcran4(exercice: ExerciceExpoProbD, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.valeurSuppl, toleranceArrondie(exercice.valeurSuppl));
}

export function verifierDEcran1(exercice: ExerciceExpoProbD, texte: string): boolean {
  return diagnostiquerDEcran1(exercice, texte) === "correct";
}
export function verifierDEcran2(exercice: ExerciceExpoProbD, texte: string): boolean {
  return diagnostiquerDEcran2(exercice, texte) === "correct";
}
export function verifierDEcran3(exercice: ExerciceExpoProbD, texte: string): boolean {
  return diagnostiquerDEcran3(exercice, texte) === "correct";
}
export function verifierDEcran4(exercice: ExerciceExpoProbD, texte: string): boolean {
  return diagnostiquerDEcran4(exercice, texte) === "correct";
}

// ============================================================================
// Famille E — 3 écrans.
// ============================================================================

const POINTS_T_POSITIFS = [0, 0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8];

export function diagnostiquerEEcran1(exercice: ExerciceExpoProbE, texte: string): StatutVerification {
  const { k, n, a } = exercice;
  return diagnostiquerEquivalenceFonction(texte, (t) => k * Math.pow(t, n - 1) * Math.exp(-a * t) * (n - a * t), POINTS_T_POSITIFS, TOLERANCE_EXPRESSION, "t");
}

/** Piège central : rejette t=0 (minimum trivial, f(0)=0, aussi un zéro de f' mais PAS le maximum). */
export function diagnostiquerEEcran2(exercice: ExerciceExpoProbE, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.tMax, TOLERANCE_EXACTE);
}

export function diagnostiquerEEcran3(exercice: ExerciceExpoProbE, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.fMax, toleranceArrondie(exercice.fMax));
}

export function verifierEEcran1(exercice: ExerciceExpoProbE, texte: string): boolean {
  return diagnostiquerEEcran1(exercice, texte) === "correct";
}
export function verifierEEcran2(exercice: ExerciceExpoProbE, texte: string): boolean {
  return diagnostiquerEEcran2(exercice, texte) === "correct";
}
export function verifierEEcran3(exercice: ExerciceExpoProbE, texte: string): boolean {
  return diagnostiquerEEcran3(exercice, texte) === "correct";
}

// ============================================================================
// Famille F — 4 écrans.
// ============================================================================

/** Écran 1 — limite de p(t) quand t→+∞, valeur EXACTE (1), pas de "convention arrondie" ici (la
 * spec l'exempte explicitement) : accepte "1" (proportion) OU "100" (pourcentage), pas les deux
 * représentations mélangées à une valeur intermédiaire. */
export function diagnostiquerFEcran1(_exercice: ExerciceExpoProbF, texte: string): StatutVerification {
  const v = evaluerValeurExponentielle(texte);
  if (v === null) return "parse_error";
  if (Math.abs(v - 1) <= 0.02 || Math.abs(v - 100) <= 2) return "correct";
  return "not_equivalent";
}

export function diagnostiquerFEcran2(exercice: ExerciceExpoProbF, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.pN1, 0.02);
}

/** Piège : confondre n1 et n2 — la référence est TOUJOURS `personnesN2`, jamais un recalcul depuis
 * `pN1`. */
export function diagnostiquerFEcran3(exercice: ExerciceExpoProbF, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.personnesN2, toleranceArrondie(exercice.personnesN2));
}

export function diagnostiquerFEcran4(exercice: ExerciceExpoProbF, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.beneficeN2, toleranceArrondie(exercice.beneficeN2));
}

export function verifierFEcran1(exercice: ExerciceExpoProbF, texte: string): boolean {
  return diagnostiquerFEcran1(exercice, texte) === "correct";
}
export function verifierFEcran2(exercice: ExerciceExpoProbF, texte: string): boolean {
  return diagnostiquerFEcran2(exercice, texte) === "correct";
}
export function verifierFEcran3(exercice: ExerciceExpoProbF, texte: string): boolean {
  return diagnostiquerFEcran3(exercice, texte) === "correct";
}
export function verifierFEcran4(exercice: ExerciceExpoProbF, texte: string): boolean {
  return diagnostiquerFEcran4(exercice, texte) === "correct";
}

// ============================================================================
// Famille G — 3 écrans.
// ============================================================================

/** Écran 1 — 2 valeurs ORDONNÉES (f(tEval1) PUIS f(tEval2), jamais un ensemble interchangeable
 * comme la famille C écran 3 : chaque champ est étiqueté par son propre temps). */
export function diagnostiquerGEcran1(exercice: ExerciceExpoProbG, texte1: string, texte2: string): StatutVerification {
  const s1 = diagnostiquerValeur(texte1, exercice.fEval1, toleranceArrondie(exercice.fEval1));
  if (s1 === "parse_error") return "parse_error";
  const s2 = diagnostiquerValeur(texte2, exercice.fEval2, toleranceArrondie(exercice.fEval2));
  if (s2 === "parse_error") return "parse_error";
  return s1 === "correct" && s2 === "correct" ? "correct" : "not_equivalent";
}

export function diagnostiquerGEcran2(exercice: ExerciceExpoProbG, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, exercice.tSeuil, toleranceArrondie(exercice.tSeuil));
}

/** Écran 3 — statut oui/non pur (jamais un champ libre) : comparaison directe, jamais de
 * `StatutVerification` (pas de risque de `parse_error` sur un choix binaire). */
export function verifierGEcran3(exercice: ExerciceExpoProbG, atteignable: boolean): boolean {
  return atteignable === exercice.duree >= exercice.tSeuil;
}

export function verifierGEcran1(exercice: ExerciceExpoProbG, texte1: string, texte2: string): boolean {
  return diagnostiquerGEcran1(exercice, texte1, texte2) === "correct";
}
export function verifierGEcran2(exercice: ExerciceExpoProbG, texte: string): boolean {
  return diagnostiquerGEcran2(exercice, texte) === "correct";
}
