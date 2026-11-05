/**
 * Couche B (5e) — vérification pour 5gen11 (« Extremums d'une fonction sinusoïdale »). N'importe
 * jamais rien de `src/generateurs5e/`.
 *
 * Écrans 1 et 2 (audit 5e ch. 2, point 40) : la réponse est une ÉQUATION en x et k ; elle est
 * acceptée dès qu'elle est équivalente à la série attendue « x = c + k·p » — côtés inversés,
 * équation multipliée par un nombre non nul, k parcouru dans l'autre sens, constante décalée d'un
 * nombre entier de périodes, « x = » recopié en tête. Écran 3 : ensemble numérique
 * (`diagnostiquerEnsembleNumerique`, partagé, inchangé).
 */
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import type { ExerciceExtremumsSinusoide, RationnelPi } from "../core5e/extremumsSinusoide.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { TOLERANCE_EQUATION_TRIG, diagnostiquerEnsembleNumerique } from "./verificationEquationTrig";

/** Dupliquée depuis `generateurs5e/parametresSinusoide/rationnelPi.ts::valeurNumerique` — jamais
 * importée (`src/moteur5e/` n'importe jamais `src/generateurs5e/`, règle non négociable). */
function valeurNumeriqueLocal(v: RationnelPi): number {
  return (v.numerateur / v.denominateur) * Math.PI ** v.degrePi;
}


/** Différence membre gauche − membre droit, évaluée en (x, k). `null` ⟺ illisible. */
function differenceEquation(texte: string): ((x: number, k: number) => number) | null {
  const parties = texte.split("=");
  if (parties.length !== 2 || parties.some((p) => p.trim() === "")) return null;
  const [gauche, droite] = parties;
  const f = (x: number, k: number) => evaluerExpressionGenerale(gauche, x, { k, n: k }) - evaluerExpressionGenerale(droite, x, { k, n: k });
  try {
    if (!Number.isFinite(f(0, 0))) return null;
  } catch {
    return null;
  }
  return f;
}

/** L'équation soumise est-elle ÉQUIVALENTE à « x = c + k·p » (k entier) — à un facteur non nul près,
 * côtés éventuellement inversés, k parcouru dans un sens ou l'autre, constante décalée d'un nombre
 * entier de périodes (point 40 : « k·π = 2x/3 − 5π/6 », « 2x − 5π/2 = 3kπ » acceptés) ? La différence
 * D(x, k) doit être affine : D = α·x + β·k + γ avec α ≠ 0, |β/α| = |p| et −γ/α ≡ c (mod p). */
function equivalenteASerieEnX(texte: string, c: number, p: number): StatutVerification {
  const D = differenceEquation(texte);
  if (D === null) return "parse_error";
  let valeurs: number[];
  try {
    valeurs = [D(0, 0), D(1, 0), D(0, 1), D(1, 1), D(2, 3), D(-1, 2)];
  } catch {
    return "parse_error";
  }
  if (valeurs.some((v) => !Number.isFinite(v))) return "parse_error";
  const [d00, d10, d01] = valeurs;
  const alpha = d10 - d00;
  const beta = d01 - d00;
  const gamma = d00;
  const affine = (x: number, k: number) => alpha * x + beta * k + gamma;
  const pointsTest: [number, number, number][] = [[1, 1, valeurs[3]], [2, 3, valeurs[4]], [-1, 2, valeurs[5]]];
  if (pointsTest.some(([x, k, v]) => Math.abs(affine(x, k) - v) > 1e-6 * (1 + Math.abs(v)))) return "not_equivalent";
  if (Math.abs(alpha) < 1e-9) return "not_equivalent";
  const periode = beta / alpha;
  const constante = -gamma / alpha;
  if (Math.abs(Math.abs(periode) - Math.abs(p)) > TOLERANCE_EQUATION_TRIG) return "not_equivalent";
  const ecart = constante - c;
  const tours = Math.round(ecart / p);
  return Math.abs(ecart - tours * p) <= TOLERANCE_EQUATION_TRIG ? "correct" : "not_equivalent";
}

/** Écran 1 — poser l'équation des positions cherchées : toute équation ÉQUIVALENTE à
 * « a·x + bArg = constante + k·période » (point 40), y compris déjà résolue en x. */
export function diagnostiquerPoserEquationExtremum(exercice: ExerciceExtremumsSinusoide, texte: string): StatutVerification {
  const a = valeurNumeriqueLocal(exercice.a);
  const bArg = valeurNumeriqueLocal(exercice.bArg);
  const cU = valeurNumeriqueLocal(exercice.brancheU.constante);
  const pU = valeurNumeriqueLocal(exercice.brancheU.periode);
  // a·x + bArg = cU + k·pU ⟺ x = (cU − bArg)/a + k·pU/a.
  return equivalenteASerieEnX(texte, (cU - bArg) / a, pU / a);
}

/** Écran 2 — isoler x (une seule série). Le champ est précédé de « x = » : un « x = » recopié en tête
 * est accepté, de même qu'une équation complète équivalente. */
export function diagnostiquerIsolerXExtremum(exercice: ExerciceExtremumsSinusoide, texte: string): StatutVerification {
  const c = valeurNumeriqueLocal(exercice.brancheX.constante);
  const p = valeurNumeriqueLocal(exercice.brancheX.periode);
  const equation = texte.includes("=") ? texte : `x = ${texte}`;
  return equivalenteASerieEnX(equation, c, p);
}

/** Écran 3 (bonus) — solutions distinctes dans [0;2π[, équivalence d'ensembles. */
export function diagnostiquerSolutionsExtremum(exercice: ExerciceExtremumsSinusoide, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleNumerique(textes, exercice.solutions);
}
