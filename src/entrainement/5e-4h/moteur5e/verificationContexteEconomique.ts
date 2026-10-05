/**
 * Couche B (5e) — vérification pour 5gen33 ("Contexte économique"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Réplique localement (jamais importées) `valeurCoutTotal`/`deriveeCoutTotal`/`evaluerP`
 * (`generateurs5e/contexteEconomique/index.ts`) — même patron que `verificationFonctionDerivee.ts`
 * (5gen27) répliquant les évaluateurs de sa propre Couche A.
 *
 * Champs symboliques vérifiés par ÉCHANTILLONNAGE NUMÉRIQUE via `evaluerExpressionGenerale`
 * (`moteur/expressionGenerale.ts`, Couche B↔B, générique/déjà partagé) : famille B utilise "x"
 * (variable nativement supportée), famille A/bonus utilisent "q" (substitué textuellement par un
 * littéral AVANT délégation — même technique que "h→x"/"u→x" déjà en place ailleurs sur ce
 * chantier). Champs "dérivée" (C'_T, R'_T, B') vérifiés par DIFFÉRENCE FINIE CENTRÉE de la
 * fonction de base — jamais une 2e formule symbolique côté moteur (même principe que 5gen27).
 */
import type {
  CoutTotalA,
  CoutTotalDegre3,
  ExerciceContexteEconomiqueA,
  ExerciceContexteEconomiqueB,
  ExerciceContexteEconomiqueBonus,
  ExtremumCoutTotal,
} from "../core5e/contexteEconomique.types";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { StatutVerification } from "../moteur/statutVerification";

// ============================================================================
// Réplique locale de la Couche A — jamais importée.
// ============================================================================

export function valeurCoutTotal(c: CoutTotalA, q: number): number {
  return c.degre === 2 ? c.a * q * q + c.b * q + c.c : c.a * q ** 3 + c.b * q * q + c.c * q + c.d;
}

export function deriveeCoutTotal(c: CoutTotalA, q: number): number {
  return c.degre === 2 ? 2 * c.a * q + c.b : 3 * c.a * q * q + 2 * c.b * q + c.c;
}

export function evaluerP(c: CoutTotalDegre3, q: number): number {
  return 2 * c.a * q ** 3 + c.b * q * q - c.d;
}

function valeurRT(ex: ExerciceContexteEconomiqueB, x: number): number {
  return ex.m * x * x + ex.k * x;
}
function valeurCT(ex: ExerciceContexteEconomiqueB, x: number): number {
  return ex.a * x ** 3 + ex.b * x * x + ex.c * x + ex.d;
}
function valeurB(ex: ExerciceContexteEconomiqueB, x: number): number {
  return valeurRT(ex, x) - valeurCT(ex, x);
}

// ============================================================================
// Échantillonnage défensif — variable "q" (famille A/bonus, substitution textuelle) et "x"
// (famille B, nativement supportée par `evaluerExpressionGenerale`).
// ============================================================================

const CANDIDATS: number[] = [0.7, 1.3, 2.1, -0.4, 3.2, 1.9, 4.4, 0.55, 2.65, -1.15];
const MAGNITUDE_MAX_PLAUSIBLE = 1e7;
const MIN_POINTS_VALIDES = 3;
const TOLERANCE_SYMBOLIQUE = 1e-3;
const EPS_DIFFERENCE_FINIE = 1e-4;

function pointValide(valeur: number): boolean {
  return Number.isFinite(valeur) && Math.abs(valeur) < MAGNITUDE_MAX_PLAUSIBLE;
}

function evaluerEnQ(texte: string, qValeur: number): number {
  const substitue = texte.replace(/(?<![a-zA-Z])q(?![a-zA-Z])/gi, `(${qValeur})`);
  return evaluerExpressionGenerale(substitue, 0);
}

function diagnostiquerGenerique(texte: string, cible: (v: number) => number, evaluerEntree: (texte: string, v: number) => number): StatutVerification {
  try {
    let nbValides = 0;
    for (const v of CANDIDATS) {
      let c: number;
      try {
        c = cible(v);
      } catch {
        continue;
      }
      if (!pointValide(c)) continue;
      nbValides++;
      const entree = evaluerEntree(texte, v);
      if (!Number.isFinite(entree)) return "parse_error";
      if (Math.abs(entree - c) > TOLERANCE_SYMBOLIQUE) return "not_equivalent";
    }
    return nbValides >= MIN_POINTS_VALIDES ? "correct" : "parse_error";
  } catch {
    return "parse_error";
  }
}

export function diagnostiquerExpressionEnQ(texte: string, cible: (q: number) => number): StatutVerification {
  return diagnostiquerGenerique(texte, cible, evaluerEnQ);
}

export function diagnostiquerExpressionEnX(texte: string, cible: (x: number) => number): StatutVerification {
  return diagnostiquerGenerique(texte, cible, evaluerExpressionGenerale);
}

function diagnostiquerDeriveeEnQ(texte: string, valeurFn: (q: number) => number): StatutVerification {
  return diagnostiquerExpressionEnQ(texte, (q) => (valeurFn(q + EPS_DIFFERENCE_FINIE) - valeurFn(q - EPS_DIFFERENCE_FINIE)) / (2 * EPS_DIFFERENCE_FINIE));
}

function diagnostiquerDeriveeEnX(texte: string, valeurFn: (x: number) => number): StatutVerification {
  return diagnostiquerExpressionEnX(texte, (x) => (valeurFn(x + EPS_DIFFERENCE_FINIE) - valeurFn(x - EPS_DIFFERENCE_FINIE)) / (2 * EPS_DIFFERENCE_FINIE));
}

// ============================================================================
// Champs numériques — parsing via `evaluerExpressionGenerale` (accepte décimales et fractions,
// ex. "3/4"), tolérance PASSÉE explicitement par l'appelant (jamais une constante module unique :
// la famille A a 2 tolérances différentes — 0.01 pour la plupart des champs, celle du bonus est
// propre à chaque exercice via `exercice.toleranceFinale`, voir CLAUDE.md "Annonce de précision").
// ============================================================================

export function diagnostiquerNombre(texte: string, cible: number, tolerance: number): StatutVerification {
  try {
    const valeur = evaluerExpressionGenerale(texte, 0);
    if (!Number.isFinite(valeur)) return "parse_error";
    return Math.abs(valeur - cible) <= tolerance ? "correct" : "not_equivalent";
  } catch {
    return "parse_error";
  }
}

const TOLERANCE_STANDARD = 0.01;

// ============================================================================
// Famille A.
// ============================================================================

export function diagnostiquerDeriveeSymboliqueA(texte: string, exercice: ExerciceContexteEconomiqueA): StatutVerification {
  return diagnostiquerDeriveeEnQ(texte, (q) => valeurCoutTotal(exercice.coutTotal, q));
}

export function diagnostiquerCoutMarginalDiscret(texte: string, exercice: ExerciceContexteEconomiqueA): StatutVerification {
  return diagnostiquerNombre(texte, exercice.cmDiscret, TOLERANCE_STANDARD);
}

export function diagnostiquerDeriveeValeur(texte: string, exercice: ExerciceContexteEconomiqueA): StatutVerification {
  return diagnostiquerNombre(texte, exercice.cmDerivee, TOLERANCE_STANDARD);
}

export function diagnostiquerEcartAbsolu(texte: string, exercice: ExerciceContexteEconomiqueA): StatutVerification {
  return diagnostiquerNombre(texte, exercice.ecartAbsolu, TOLERANCE_STANDARD);
}

/** Seul champ de la famille A à annoncer une précision décimale explicite — voir CLAUDE.md,
 * "Annonce de précision = tolérance réellement vérifiée". */
export function diagnostiquerEcartPourcent(texte: string, exercice: ExerciceContexteEconomiqueA): StatutVerification {
  return diagnostiquerNombre(texte, exercice.ecartPourcent, TOLERANCE_STANDARD);
}

export type ReponseExtremum = { type: "aucun" } | { type: "existe"; extrema: { position: string; nature: "max" | "min" }[] };

export function diagnostiquerPositionExtremum(texte: string, cible: number): StatutVerification {
  return diagnostiquerNombre(texte, cible, TOLERANCE_STANDARD);
}

/** Diagnostic PAR CHAMP (surlignage rouge individuel) — correct si la valeur saisie correspond à
 * L'UNE des positions attendues, peu importe laquelle (même patron que
 * `diagnostiquerChampParmiCibles`, 5gen29). */
export function diagnostiquerPositionExtremumParmiCibles(texte: string, exercice: ExerciceContexteEconomiqueA): StatutVerification {
  if (exercice.extrema.length === 0) return "parse_error";
  const base = diagnostiquerPositionExtremum(texte, exercice.extrema[0].position);
  if (base === "correct") return "correct";
  return exercice.extrema.some((e) => diagnostiquerPositionExtremum(texte, e.position) === "correct") ? "correct" : base;
}

/** Vérification COMBINÉE (notation) — type ("aucun"/"existe") ET, si "existe", ENSEMBLE
 * position+nature apparié (ordre indifférent, même patron que `verifierEnsembleNumerique`,
 * 5gen29). */
export function verifierExtremum(reponse: ReponseExtremum, exercice: ExerciceContexteEconomiqueA): boolean {
  if (reponse.type === "aucun") return !exercice.extremumExiste;
  if (!exercice.extremumExiste) return false;
  if (reponse.extrema.length !== exercice.extrema.length) return false;
  const restantes = [...exercice.extrema];
  for (const r of reponse.extrema) {
    const i = restantes.findIndex((cible: ExtremumCoutTotal) => diagnostiquerPositionExtremum(r.position, cible.position) === "correct" && r.nature === cible.nature);
    if (i === -1) return false;
    restantes.splice(i, 1);
  }
  return true;
}

// ============================================================================
// Famille B.
// ============================================================================

export function diagnostiquerRecetteTotale(texte: string, exercice: ExerciceContexteEconomiqueB): StatutVerification {
  return diagnostiquerExpressionEnX(texte, (x) => valeurRT(exercice, x));
}

export function diagnostiquerCoutMarginalB(texte: string, exercice: ExerciceContexteEconomiqueB): StatutVerification {
  return diagnostiquerDeriveeEnX(texte, (x) => valeurCT(exercice, x));
}

export function diagnostiquerRecetteMarginale(texte: string, exercice: ExerciceContexteEconomiqueB): StatutVerification {
  return diagnostiquerDeriveeEnX(texte, (x) => valeurRT(exercice, x));
}

export function diagnostiquerBeneficeFormule(texte: string, exercice: ExerciceContexteEconomiqueB): StatutVerification {
  return diagnostiquerExpressionEnX(texte, (x) => valeurB(exercice, x));
}

export function diagnostiquerBeneficeDerivee(texte: string, exercice: ExerciceContexteEconomiqueB): StatutVerification {
  return diagnostiquerDeriveeEnX(texte, (x) => valeurB(exercice, x));
}

export interface ReponseEgaliteMarginales {
  racines: [string, string];
  /** Choix SÉMANTIQUE ("positive"/"négative"), jamais une valeur numérique littérale — un bouton
   * affichant directement x_opt/x_neg fuirait les 2 racines avant même que l'élève ait résolu
   * l'équation lui-même (les 2 champs `racines` ci-dessus). x_opt est TOUJOURS la racine positive
   * par construction (voir `core5e/contexteEconomique.types.ts`), donc "positive" est toujours la
   * bonne réponse — mais le choix reste un acte EXPLICITE de l'élève, jamais déduit du signe de sa
   * propre saisie. */
  choix: "positive" | "negative";
}

export function diagnostiquerRacineMarginale(texte: string, exercice: ExerciceContexteEconomiqueB): StatutVerification {
  const surXOpt = diagnostiquerNombre(texte, exercice.xOpt, TOLERANCE_STANDARD);
  if (surXOpt === "correct") return "correct";
  const surXNeg = diagnostiquerNombre(texte, exercice.xNeg, TOLERANCE_STANDARD);
  return surXNeg === "correct" ? "correct" : surXOpt;
}

export function verifierEgaliteMarginales(reponse: ReponseEgaliteMarginales, exercice: ExerciceContexteEconomiqueB): boolean {
  const [r1, r2] = reponse.racines;
  const direct = diagnostiquerNombre(r1, exercice.xOpt, TOLERANCE_STANDARD) === "correct" && diagnostiquerNombre(r2, exercice.xNeg, TOLERANCE_STANDARD) === "correct";
  const inverse = diagnostiquerNombre(r1, exercice.xNeg, TOLERANCE_STANDARD) === "correct" && diagnostiquerNombre(r2, exercice.xOpt, TOLERANCE_STANDARD) === "correct";
  const ensembleCorrect = direct || inverse;
  return ensembleCorrect && reponse.choix === "positive";
}

export interface ReponseTableauSigneBenefice {
  zoneAvant: 1 | -1;
  zoneApres: 1 | -1;
}

/** Attendu TOUJOURS le même motif (+ avant x_opt, - après) — conséquence structurelle de
 * `a>0` garanti à la construction (voir `generateurs5e/contexteEconomique/index.ts`), jamais
 * recalculé ici depuis les coefficients (vérité terrain déjà garantie mathématiquement par
 * construction — même esprit que `docs/historique-5e-derivees.md`, cohérence Cm-Rm/B'). */
export function tableauSigneBeneficeAttendu(): ReponseTableauSigneBenefice {
  return { zoneAvant: 1, zoneApres: -1 };
}

export function verifierTableauSigneBenefice(reponse: ReponseTableauSigneBenefice): boolean {
  const attendu = tableauSigneBeneficeAttendu();
  return reponse.zoneAvant === attendu.zoneAvant && reponse.zoneApres === attendu.zoneApres;
}

/** Toujours vrai par construction (`Cm(x)-Rm(x) ≡ -B'(x)` exactement) — l'écran demande
 * néanmoins une confirmation EXPLICITE à l'élève (jamais supposée). */
export function verifierConfirmationCoherence(reponse: boolean): boolean {
  return reponse === true;
}

export function diagnostiquerBeneficeMaximum(texte: string, exercice: ExerciceContexteEconomiqueB): StatutVerification {
  return diagnostiquerNombre(texte, exercice.beneficeMax, TOLERANCE_STANDARD);
}

// ============================================================================
// Bonus.
// ============================================================================

export function diagnostiquerEquationReduite(texte: string, exercice: ExerciceContexteEconomiqueBonus): StatutVerification {
  return diagnostiquerExpressionEnQ(texte, (q) => evaluerP(exercice.coutTotal, q));
}

export interface ReponseIterationDichotomie {
  milieu: string;
  signe: 1 | -1;
  garder: "gauche" | "droite";
}

const TOLERANCE_MILIEU = 1e-6;

export function diagnostiquerMilieuIteration(texte: string, milieuAttendu: number): StatutVerification {
  return diagnostiquerNombre(texte, milieuAttendu, TOLERANCE_MILIEU);
}

export function verifierIterationDichotomie(reponse: ReponseIterationDichotomie, exercice: ExerciceContexteEconomiqueBonus, index: number): boolean {
  const attendu = exercice.iterations[index];
  return diagnostiquerMilieuIteration(reponse.milieu, attendu.milieu) === "correct" && reponse.signe === attendu.signeMilieu && reponse.garder === attendu.garderCote;
}

export function diagnostiquerRacineApprochee(texte: string, exercice: ExerciceContexteEconomiqueBonus): StatutVerification {
  return diagnostiquerNombre(texte, exercice.racineApprochee, exercice.toleranceFinale);
}
