import type { EcranEquationsTransformer, EquationBase, ExerciceEquationsTransformer, FonctionTrig, MembreAffine, ValeurK } from "../core/equationsTransformer.types";

/**
 * Modèle mathématique de gen78 (« Équations trigonométriques à transformer ») : valeur de k,
 * angle de référence, solutions sur [0° ; 360°[ et suite des écrans. Une seule source pour
 * l'écran, la vérification et l'adaptateur papier.
 */

const DEG = 180 / Math.PI;

export function valeurK(k: ValeurK): number {
  return (k.signe * k.num * Math.sqrt(k.racine)) / k.den;
}

export function valeurB(m: MembreAffine): number {
  return m.bEntier + m.bRacineCoef * Math.sqrt(m.bRacine);
}

/** Valeur absolue de k : est-ce une valeur « sur un axe » (k = 0, ou |k| = 1 pour sin et cos) ? */
export function estSurAxe(fonction: FonctionTrig, k: ValeurK): boolean {
  if (k.signe === 0) return true;
  return fonction !== "tan" && k.racine === 1 && k.num === k.den;
}

/** Arrondi au dixième (valeurs à la calculatrice) ; les angles remarquables restent entiers. */
export function arrondiDixieme(x: number): number {
  const r = Math.round(x * 10) / 10;
  return r === 0 ? 0 : r;
}

function normaliser(angle: number): number {
  let a = angle % 360;
  if (a < 0) a += 360;
  return Math.abs(a - 360) < 1e-9 ? 0 : a;
}

/** Angle de référence EXACT α₀ ∈ [0° ; 90°] (f(α₀) = |k|), ou `null` si |k| > 1 pour sin/cos. */
export function angleReference(fonction: FonctionTrig, k: ValeurK): number | null {
  const v = Math.abs(valeurK(k));
  if (fonction !== "tan" && v > 1 + 1e-12) return null;
  if (k.decimal) {
    if (fonction === "sin") return Math.asin(v) * DEG;
    if (fonction === "cos") return Math.acos(v) * DEG;
    return Math.atan(v) * DEG;
  }
  // Valeurs remarquables : jamais de bruit flottant (30°, 45°, 60°, 0°, 90°).
  const f = fonction === "sin" ? Math.sin : fonction === "cos" ? Math.cos : Math.tan;
  for (const c of [0, 30, 45, 60, 90]) {
    if (fonction === "tan" && c === 90) continue;
    if (Math.abs(f(c / DEG) - v) < 1e-9) return c;
  }
  return null;
}

/** Les deux candidats « naturels » de la fonction (même construction que gen18), avant dédoublonnage. */
export function candidats(fonction: FonctionTrig, ref: number, positif: boolean): [number, number] {
  switch (fonction) {
    case "sin":
      return positif ? [ref, normaliser(180 - ref)] : [normaliser(180 + ref), normaliser(360 - ref)];
    case "cos":
      return positif ? [ref, normaliser(360 - ref)] : [normaliser(180 - ref), normaliser(180 + ref)];
    case "tan":
      return positif ? [ref, normaliser(180 + ref)] : [normaliser(180 - ref), normaliser(360 - ref)];
  }
}

/** Résout f(α) = k sur [0° ; 360°[ : α₀ exact, puis solutions (arrondies au dixième si k décimal). */
export function resoudreBase(fonction: FonctionTrig, k: ValeurK): EquationBase {
  const reference = angleReference(fonction, k);
  if (reference === null) return { fonction, k, reference, solutions: [] };
  // Arrondi APRÈS normalisation (sinon 565,8 % 360 laisse du bruit flottant : 205,79999…).
  const arrondir = (x: number) => {
    const r = k.decimal ? arrondiDixieme(x) : Math.round(x);
    return r >= 360 ? 0 : r;
  };
  const solutions = [...new Set(candidats(fonction, reference, k.signe >= 0).map((s) => arrondir(normaliser(s))))].sort((a, b) => a - b);
  return { fonction, k, reference, solutions };
}

/** Écrans : équation(s) de base ; pour chaque base, angle de référence puis (s'il y a des
 * solutions) les solutions ; enfin l'ensemble des solutions dès qu'il y a au moins deux bases. */
export function ecransDe(e: ExerciceEquationsTransformer): EcranEquationsTransformer[] {
  const ecrans: EcranEquationsTransformer[] = [{ type: "bases" }];
  e.bases.forEach((b, i) => {
    ecrans.push({ type: "reference", base: i });
    if (b.solutions.length > 0) ecrans.push({ type: "solutions", base: i });
  });
  if (e.bases.length >= 2) ecrans.push({ type: "ensemble" });
  return ecrans;
}

/** Tolérance sur les angles d'une base : 0,5° pour les angles remarquables (entiers), 0,1° pour
 * les angles à la calculatrice (au dixième de degré). */
export function toleranceBase(b: EquationBase): number {
  return b.k.decimal ? 0.1 + 1e-9 : 0.5;
}

/** Solutions de l'équation de départ, chacune avec la tolérance de la base dont elle vient. */
export function solutionsAvecTolerance(e: ExerciceEquationsTransformer): { valeur: number; tolerance: number }[] {
  const vues = new Map<number, number>();
  for (const b of e.bases) for (const s of b.solutions) if (!vues.has(s)) vues.set(s, toleranceBase(b));
  return [...vues.entries()].sort((x, y) => x[0] - y[0]).map(([valeur, tolerance]) => ({ valeur, tolerance }));
}
