import { impedanceTotale, intensite, natureCalculee } from "../../core6e/impedancesComplexes";
import type { ExerciceImpedances, IdVarianteImpedances, NatureCircuit } from "../../core6e/impedancesComplexes";

export type { IdVarianteImpedances };

/**
 * Couche A (6e) — générateur de `6gen96` « Électricité : impédances complexes ». N'utilise QUE
 * `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue exactement le même
 * tirage, dans l'appli comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * - La NATURE du circuit (verdict de l'écran e) est tirée EN PREMIER, à parts égales parmi les
 *   issues possibles de la variante : inductif / capacitif pour `serie2` (R avec une bobine OU un
 *   condensateur) et `parallele` (R en parallèle avec une bobine OU un condensateur) ; inductif /
 *   capacitif / résistif (résonance X_L = X_C) pour `rlc`. Les valeurs sont ensuite tirées sous
 *   cette contrainte (boucle de rejet qui ne touche jamais au verdict).
 * - Réactances entières (multiples de 5, de 10 à 150 Ω) ; L = 1000·X_L/ω mH (entier), C =
 *   10⁶/(ω·X_C) µF avec au plus une décimale ; ω ∈ {100, 200, 500, 1000} rad/s.
 * - Jamais X = R (φ = ±45°, angle remarquable) ; en parallèle, forme algébrique de Z décimale à au
 *   plus deux chiffres ; intensité entre 0,25 A et 20 A (lisible au centième).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

const OMEGAS = [100, 200, 500, 1000];
const TENSIONS = [12, 24, 48, 110, 120, 230];
const RESISTANCES = [10, 15, 20, 25, 30, 40, 50, 60, 75, 80, 100];
const REACTANCES = Array.from({ length: 29 }, (_, i) => 10 + 5 * i); // 10, 15, …, 150

/** Le condensateur a une capacité « propre » (au plus une décimale en µF, au plus 1000 µF). */
function capaciteValide(omega: number, xC: number): boolean {
  const c = 1e6 / (omega * xC);
  return c <= 1000 && Math.abs(c * 10 - Math.round(c * 10)) < 1e-6;
}

function auCentieme(v: number): boolean {
  return Math.abs(v * 100 - Math.round(v * 100)) < 1e-6;
}

export const CATALOGUE_VARIANTES: { id: IdVarianteImpedances; label: string }[] = [
  { id: "serie2", label: "Série RL ou RC : Z = R + jLω ou R + 1/(jCω), module, déphasage, intensité, nature" },
  { id: "rlc", label: "Série RLC : Z = R + j(Lω − 1/(Cω)) — inductif, capacitif ou résonance" },
  { id: "parallele", label: "Deux branches en parallèle (R ∥ L ou R ∥ C) : 1/Z = 1/Z₁ + 1/Z₂" },
];

function naturesPossibles(variante: IdVarianteImpedances): NatureCircuit[] {
  return variante === "rlc" ? ["inductif", "capacitif", "resistif"] : ["inductif", "capacitif"];
}

function valide(e: ExerciceImpedances): boolean {
  if (natureCalculee(e) !== e.nature) return false;
  if (e.xC !== null && !capaciteValide(e.omega, e.xC)) return false;
  const z = impedanceTotale(e);
  if (e.variante === "parallele" && (!auCentieme(z.re) || !auCentieme(z.im))) return false;
  if (z.im !== 0 && Math.abs(Math.abs(z.im) - z.re) < 1e-9) return false; // φ = ±45°
  if (e.variante === "rlc" && e.nature !== "resistif" && Math.abs(z.im) < 10) return false;
  const i = intensite(e);
  return i >= 0.25 && i <= 20;
}

function tirerValeurs(variante: IdVarianteImpedances, nature: NatureCircuit): ExerciceImpedances {
  const base = { variante, nature, U: parmi(TENSIONS), omega: parmi(OMEGAS), R: parmi(RESISTANCES) };
  if (variante === "rlc") {
    const xL = parmi(REACTANCES);
    const xC = nature === "resistif" ? xL : parmi(REACTANCES);
    return { ...base, xL, xC };
  }
  const x = parmi(REACTANCES);
  return nature === "inductif" ? { ...base, xL: x, xC: null } : { ...base, xL: null, xC: x };
}

export function construireAvecVarianteId(id: IdVarianteImpedances): ExerciceImpedances {
  // Verdict tiré AVANT la boucle de rejet : ses fréquences ne dépendent pas des valeurs.
  const nature = parmi(naturesPossibles(id));
  for (let essai = 0; essai < 2000; essai++) {
    const e = tirerValeurs(id, nature);
    if (valide(e)) return e;
  }
  // Repli déterministe (jamais atteint en pratique) : valeurs vérifiées à la main.
  if (id === "parallele") return { variante: id, nature, U: 120, omega: 1000, R: 30, xL: nature === "inductif" ? 40 : null, xC: nature === "inductif" ? null : 40 };
  if (id === "rlc") return { variante: id, nature, U: 230, omega: 1000, R: 40, xL: nature === "capacitif" ? 20 : 50, xC: nature === "inductif" ? 20 : 50 };
  return { variante: id, nature, U: 230, omega: 1000, R: 30, xL: nature === "inductif" ? 40 : null, xC: nature === "inductif" ? null : 40 };
}

/** Tirage libre : les trois variantes à parts égales. */
export function genererExerciceImpedances(): ExerciceImpedances {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
