import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExerciceConstruireInequation, VarianteConstruireInequation } from "../../core/construireInequation.types";
import { choisir, ensemblePoints, ensembleRelation, entierAlea, type Ensemble, type Poly2, type Relation } from "../../moteur/algebreTransfertSecondDegre";

/**
 * Générateur de gen120. `allure` (signature de difficulté) et le signe du coefficient imposé sont
 * tirés AVANT les nombres, avec des poids égaux. Racines entières (inéquation), ou deux entiers / un
 * entier et une fraction de dénominateur 2 ou 3 (équation) ; le coefficient imposé et le coefficient
 * de l'écran 3 sont des multiples du dénominateur, pour que b et c restent entiers.
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "inequation", label: "Inéquation (solution en intervalles)" },
  { id: "equation", label: "Équation (deux solutions données)" },
];

function racinesEntieres(): [number, number] {
  for (;;) {
    const r1 = entierAlea(-7, 6);
    const r2 = entierAlea(-6, 8);
    if (r2 - r1 >= 2 && r2 - r1 <= 9) return [r1, r2];
  }
}

export function construireAvecVariante(id: string): ExerciceConstruireInequation {
  const variante = id as VarianteConstruireInequation;
  const negatif = Math.random() < 0.5;
  for (;;) {
    let r1: number, r2: number, den = 1;
    let allure: ExerciceConstruireInequation["allure"];
    let symbole: Relation;
    if (variante === "inequation") {
      allure = Math.random() < 0.5 ? "interieur" : "exterieur";
      [r1, r2] = racinesEntieres();
      const large = Math.random() < 0.5;
      symbole = allure === "interieur" ? (large ? "≤" : "<") : large ? "≥" : ">";
    } else {
      allure = Math.random() < 0.5 ? "entiers" : "fraction";
      symbole = "=";
      if (allure === "entiers") [r1, r2] = racinesEntieres();
      else {
        den = choisir([2, 2, 3]);
        let num = entierAlea(-8, 8);
        while (num % den === 0) num = entierAlea(-8, 8);
        const f = num / den;
        let k = entierAlea(-6, 6);
        while (Math.abs(k - f) < 1) k = entierAlea(-6, 6);
        [r1, r2] = f < k ? [f, k] : [k, f];
      }
    }
    const mult = choisir(den === 1 ? [2, 3] : den === 2 ? [2, 4] : [3]);
    const aImpose = negatif ? -mult : mult;
    // Écran 3 : point P(x₀ ; y₀) hors racines, a₃ multiple de den, |y₀| ≤ 40.
    const a3 = choisir(den === 1 ? [-3, -2, -1, 1, 2, 3] : [-den, den, -2 * den, 2 * den]);
    const candidats: number[] = [];
    for (let x0 = -5; x0 <= 6; x0++) {
      if (Math.abs(x0 - r1) < 1e-9 || Math.abs(x0 - r2) < 1e-9) continue;
      const y0 = a3 * (x0 - r1) * (x0 - r2);
      if (Math.abs(y0) <= 40 && Math.abs(y0 - Math.round(y0)) < 1e-9 && y0 !== 0) candidats.push(x0);
    }
    if (candidats.length === 0) continue;
    const x0 = choisir(candidats);
    const y0 = Math.round(a3 * (x0 - r1) * (x0 - r2));
    return { variante, allure, r1, r2, symbole, den, aImpose, x0, y0, a3 };
  }
}

export function genererExerciceConstruireInequation(): ExerciceConstruireInequation {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}

/** Trinôme k(x − r₁)(x − r₂). */
export function trinome(e: ExerciceConstruireInequation, k: number): Poly2 {
  return [k, -k * (e.r1 + e.r2), k * e.r1 * e.r2];
}

/** Ensemble-solution donné dans l'énoncé. */
export function ensembleDonne(e: ExerciceConstruireInequation): Ensemble {
  if (e.variante === "equation") return ensemblePoints([e.r1, e.r2]);
  return ensembleRelation(trinome(e, 1), e.symbole);
}

/** Symbole à écrire avec un coefficient de tête k (retourné si k < 0). */
export function symbolePour(e: ExerciceConstruireInequation, k: number): Relation {
  if (k > 0 || e.symbole === "=") return e.symbole;
  return e.symbole === "<" ? ">" : e.symbole === ">" ? "<" : e.symbole === "≤" ? "≥" : "≤";
}
