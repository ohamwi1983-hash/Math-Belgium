/**
 * Couche B (5e) — vérification pour 5gen28 ("Tangentes"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Réplique localement (jamais importés) `valeurFPointDonne`/`deriveeFPointDonne`/
 * `valeurFHorizontale`/`deriveeFHorizontale`/`valeurFDoubleTangence`/`deriveeFDoubleTangence`
 * (`generateurs5e/tangentes/index.ts`) — même patron que `verificationDefinitionDerivee.ts`
 * répliquant `valeurFonction` de 5gen26. Pour la variante C, la "vraie" f'(x) est la dérivée
 * FERMÉE du quartique STOCKÉ (terme à terme, règle de puissance) — jamais une différence finie,
 * contrairement à `verificationFonctionDerivee.ts` (5gen27) qui doit gérer des familles bien plus
 * variées : ici c'est un simple polynôme déjà développé, la formule fermée est directe.
 *
 * Réutilise DIRECTEMENT `diagnostiquerNombre` (5gen21, Couche B↔B) pour tout champ "nombre exact"
 * — même patron que `verificationDefinitionDerivee.ts` (5gen26).
 */
import type { ExerciceTangenteDoubleTangence, ExerciceTangenteHorizontale, ExerciceTangentePointDonne } from "../core5e/tangentes.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerNombre } from "./verificationAsymptoteOblique";

export { diagnostiquerNombre };

// ============================================================================
// Réplique locale de la Couche A — jamais importée.
// ============================================================================

export function valeurFPointDonne(exercice: ExerciceTangentePointDonne, x: number): number {
  if (exercice.sousFamille === "polynomiale") {
    return exercice.coeffs.reduce((s, coeff, i) => s + coeff * Math.pow(x, i), 0);
  }
  return exercice.coeff * Math.sqrt(exercice.m * x + exercice.p);
}

export function deriveeFPointDonne(exercice: ExerciceTangentePointDonne, x: number): number {
  if (exercice.sousFamille === "polynomiale") {
    let s = 0;
    for (let i = 1; i < exercice.coeffs.length; i++) s += i * exercice.coeffs[i] * Math.pow(x, i - 1);
    return s;
  }
  return (exercice.coeff * exercice.m) / (2 * Math.sqrt(exercice.m * x + exercice.p));
}

export function valeurFHorizontale(exercice: ExerciceTangenteHorizontale, x: number): number {
  return exercice.a * x * x * x + exercice.b * x * x + exercice.c * x + exercice.d;
}

export function deriveeFHorizontale(exercice: ExerciceTangenteHorizontale, x: number): number {
  return 3 * exercice.a * x * x + 2 * exercice.b * x + exercice.c;
}

export function valeurFDoubleTangence(exercice: ExerciceTangenteDoubleTangence, x: number): number {
  return exercice.coeffs.reduce((s, coeff, i) => s + coeff * Math.pow(x, i), 0);
}

export function deriveeFDoubleTangence(exercice: ExerciceTangenteDoubleTangence, x: number): number {
  let s = 0;
  for (let i = 1; i < exercice.coeffs.length; i++) s += i * exercice.coeffs[i] * Math.pow(x, i - 1);
  return s;
}

// ============================================================================
// Équivalence algébrique en x, échantillonnée — pour les 2 champs "y=" purement symboliques
// (variante A écran "tangente", variante C écran "tangenteEnP"). Le champ ne contient QUE le
// membre de droite (label "y=" affiché séparément, même convention que
// `formatAsymptoteOblique.ts::labelChamp("conclureEquationAsymptote")`).
// ============================================================================

const POINTS_ECHANTILLON = [0, 1, 2, -1, 3, -2];

function diagnostiquerExpressionEnX(texte: string, cible: (x: number) => number): StatutVerification {
  try {
    for (const x of POINTS_ECHANTILLON) {
      const valeurEntree = evaluerExpressionGenerale(texte, x);
      if (!Number.isFinite(valeurEntree)) return "parse_error";
      if (Math.abs(valeurEntree - cible(x)) > 1e-3) return "not_equivalent";
    }
    return "correct";
  } catch {
    return "parse_error";
  }
}

// ============================================================================
// Variante A ("pointDonne") — écran "substituer" (f(a) et f'(a), nombres exacts) puis "tangente"
// (équation y=f'(a)(x-a)+f(a), équivalence algébrique).
// ============================================================================

export function diagnostiquerFAPointDonne(texte: string, exercice: ExerciceTangentePointDonne): StatutVerification {
  return diagnostiquerNombre(texte, valeurFPointDonne(exercice, exercice.a));
}

export function diagnostiquerFPrimeAPointDonne(texte: string, exercice: ExerciceTangentePointDonne): StatutVerification {
  return diagnostiquerNombre(texte, deriveeFPointDonne(exercice, exercice.a));
}

export function diagnostiquerEquationTangentePointDonne(texte: string, exercice: ExerciceTangentePointDonne): StatutVerification {
  const a = exercice.a;
  const fA = valeurFPointDonne(exercice, a);
  const fPrimeA = deriveeFPointDonne(exercice, a);
  return diagnostiquerExpressionEnX(texte, (x) => fPrimeA * (x - a) + fA);
}

// ============================================================================
// Variante B ("horizontale") — écran "resoudre" (1 ou 2 racines de f'(x)=0, vérifiées comme un
// ENSEMBLE, ordre indifférent) puis "coordonnees" (point complet (x;y) par racine, idem).
// ============================================================================

/** Diagnostic PAR CHAMP (surlignage rouge individuel) — correct si la valeur saisie correspond à
 * L'UNE des racines attendues (peu importe la position du champ). */
export function diagnostiquerRacineChamp(texte: string, exercice: ExerciceTangenteHorizontale): StatutVerification {
  const base = diagnostiquerNombre(texte, exercice.racines[0]);
  if (base === "parse_error") return "parse_error";
  if (base === "correct") return "correct";
  return exercice.racines.some((r) => diagnostiquerNombre(texte, r) === "correct") ? "correct" : "not_equivalent";
}

/** Vérification COMBINÉE (notation/moteur) — ENSEMBLE exact, ordre indifférent : chaque racine
 * attendue doit être retrouvée EXACTEMENT une fois parmi les réponses. */
export function verifierRacinesHorizontale(reponses: string[], exercice: ExerciceTangenteHorizontale): boolean {
  const racines = exercice.racines;
  if (reponses.length !== racines.length) return false;
  if (racines.length === 1) return diagnostiquerNombre(reponses[0], racines[0]) === "correct";
  const direct = diagnostiquerNombre(reponses[0], racines[0]) === "correct" && diagnostiquerNombre(reponses[1], racines[1]) === "correct";
  if (direct) return true;
  return diagnostiquerNombre(reponses[0], racines[1]) === "correct" && diagnostiquerNombre(reponses[1], racines[0]) === "correct";
}

/** Point saisi comme 2 CHAMPS SÉPARÉS (x, y côte à côte) — convention établie sur 5gen24
 * (`EtapeCasSpecialEtudeComplete.tsx`), jamais un champ combiné "(x;y)" en texte libre
 * (`prompt5gen28variantesabc.md`, variante B écran "coordonnees"). */
export interface PointSaisi {
  x: string;
  y: string;
}

function pointsCiblesHorizontale(exercice: ExerciceTangenteHorizontale): { x: number; y: number }[] {
  return exercice.racines.map((r) => ({ x: r, y: valeurFHorizontale(exercice, r) }));
}

/** Diagnostic PAR SOUS-COMPOSANTE (x et y indépendamment) — correct si la valeur saisie pour cette
 * composante correspond à L'UNE des cibles possibles, indépendamment de l'appariement réel — même
 * principe que `diagnostiquerRacineChamp` (surlignage rouge PAR CHAMP, pas la vérification
 * combinée qui, elle, apparie x et y d'un même point). */
function diagnostiquerComposanteParmiCibles(texte: string, cibles: number[]): StatutVerification {
  const base = diagnostiquerNombre(texte, cibles[0]);
  if (base === "parse_error") return "parse_error";
  if (base === "correct") return "correct";
  return cibles.some((c) => diagnostiquerNombre(texte, c) === "correct") ? "correct" : "not_equivalent";
}

/** Diagnostic PAR CHAMP (x et y du point à cet index) — même principe que `diagnostiquerRacineChamp` :
 * correct si chaque composante correspond à L'UNE des composantes attendues, indépendamment de sa
 * position. */
export function diagnostiquerCoordonneeChamp(point: PointSaisi, exercice: ExerciceTangenteHorizontale): { x: StatutVerification; y: StatutVerification } {
  const cibles = pointsCiblesHorizontale(exercice);
  return {
    x: diagnostiquerComposanteParmiCibles(point.x, cibles.map((c) => c.x)),
    y: diagnostiquerComposanteParmiCibles(point.y, cibles.map((c) => c.y)),
  };
}

function pointCorrespond(reponse: PointSaisi, cible: { x: number; y: number }): boolean {
  return diagnostiquerNombre(reponse.x, cible.x) === "correct" && diagnostiquerNombre(reponse.y, cible.y) === "correct";
}

export function verifierCoordonneesHorizontale(reponses: PointSaisi[], exercice: ExerciceTangenteHorizontale): boolean {
  const cibles = pointsCiblesHorizontale(exercice);
  if (reponses.length !== cibles.length) return false;
  if (cibles.length === 1) return pointCorrespond(reponses[0], cibles[0]);
  const direct = pointCorrespond(reponses[0], cibles[0]) && pointCorrespond(reponses[1], cibles[1]);
  if (direct) return true;
  return pointCorrespond(reponses[0], cibles[1]) && pointCorrespond(reponses[1], cibles[0]);
}

// ============================================================================
// Variante C ("doubleTangence") — écran "tangenteEnP" (f'(p) exact + équation y=... symbolique),
// "trouverQ" (q exact, vérité terrain interne) puis "verifierPente" (f'(q), doit coïncider avec
// f'(p) — le CŒUR pédagogique de l'exercice).
// ============================================================================

export function diagnostiquerFPrimeP(texte: string, exercice: ExerciceTangenteDoubleTangence): StatutVerification {
  return diagnostiquerNombre(texte, deriveeFDoubleTangence(exercice, exercice.p));
}

export function diagnostiquerEquationTangenteP(texte: string, exercice: ExerciceTangenteDoubleTangence): StatutVerification {
  const p = exercice.p;
  const fP = valeurFDoubleTangence(exercice, p);
  const fPrimeP = deriveeFDoubleTangence(exercice, p);
  return diagnostiquerExpressionEnX(texte, (x) => fPrimeP * (x - p) + fP);
}

export function diagnostiquerQ(texte: string, exercice: ExerciceTangenteDoubleTangence): StatutVerification {
  return diagnostiquerNombre(texte, exercice.q);
}

export function diagnostiquerFPrimeQ(texte: string, exercice: ExerciceTangenteDoubleTangence): StatutVerification {
  return diagnostiquerNombre(texte, deriveeFDoubleTangence(exercice, exercice.q));
}
