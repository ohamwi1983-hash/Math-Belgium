import type { ExercicePD, VariantePD, VerdictPD } from "../../core6e/positionDroiteParametre";
import { abscisses, delta, positionDe, valeursTangence } from "../../core6e/positionDroiteParametre";
import type { Conique } from "../../ui6e/outilsConiquesLotH2";
import { entier, estCarreRationnel, estRationnel, parmi } from "../../ui6e/outilsConiquesLotH2";

/**
 * Couche A — générateur de `6gen139` « Position d'une droite et d'une conique selon un paramètre ».
 * `Math.random()` seul (le `?code=` rejoue le tirage). Le VERDICT (position de d_{k₀}) est tiré EN PREMIER,
 * à parts égales parmi ceux que la conique permet (ellipse : sécante, tangente, extérieure ; hyperbole et
 * parabole : les quatre, « un seul point sans tangence » = pente d'une asymptote ou pente nulle). Puis la
 * conique et la pente m, choisies pour que les valeurs de tangence soient rationnelles (a²m² ± b² carré
 * d'un rationnel ; hyperbole : |m| > b/a), puis k₀ : ±K (tangente), une valeur à Δ carré parfait
 * (sécante : points rationnels), une valeur à Δ < 0 (extérieure), un entier non nul (un seul point).
 */

export const CATALOGUE_VARIANTES: { id: VariantePD; label: string }[] = [
  { id: "ellipse", label: "Ellipse et droites y = mx + k" },
  { id: "hyperbole", label: "Hyperbole et droites y = mx + k" },
  { id: "parabole", label: "Parabole y² = 2px et droites y = mx + k" },
];

const PENTES = [1, -1, 2, -2, 1 / 2, -1 / 2, 3 / 2, -3 / 2, 2 / 3, -2 / 3, 3, -3, 3 / 4, -3 / 4, 4 / 3, -4 / 3];

function conique(v: VariantePD): Conique {
  if (v === "ellipse") {
    for (;;) {
      const a = entier(2, 6);
      const b = entier(1, 6);
      if (a !== b) return { type: "ellipse", a, b };
    }
  }
  if (v === "hyperbole") return { type: "hyperbole", a: entier(1, 6), b: entier(1, 6) };
  return { type: "parabole", p: parmi([1, 2, 3, 4, 6]) };
}

/** Coordonnées des points communs raisonnables (figure lisible). */
function pointsLisibles(e: ExercicePD, k: number): boolean {
  return abscisses(e, k).every((x) => estRationnel(x) && Math.abs(x) <= 14 && Math.abs(e.m * x + k) <= 14);
}

function essai(variante: VariantePD, verdict: VerdictPD): ExercicePD | null {
  const c = conique(variante);
  let m: number;
  if (verdict === "unPoint") {
    if (c.type === "hyperbole") m = parmi([1, -1]) * (c.b / c.a);
    else if (c.type === "parabole") m = 0;
    else return null;
  } else {
    m = parmi(PENTES);
    if (c.type === "hyperbole") {
      const K2 = c.a * c.a * m * m - c.b * c.b;
      if (K2 <= 0 || !estCarreRationnel(K2)) return null;
    } else if (c.type === "ellipse") {
      if (!estCarreRationnel(c.a * c.a * m * m + c.b * c.b)) return null;
    }
  }
  const base: ExercicePD = { variante, conique: c, m, k0: 0, verdict };
  if (verdict === "unPoint") {
    const k0 = parmi([1, -1]) * entier(1, 6);
    const e = { ...base, k0 };
    return pointsLisibles(e, k0) ? e : null;
  }
  const K = valeursTangence(base);
  if (K.length === 0 || !K.every((k) => estRationnel(k) && Math.abs(k) <= 12)) return null;
  if (verdict === "tangente") {
    const k0 = parmi(K);
    const e = { ...base, k0 };
    return pointsLisibles(e, k0) && positionDe(e, k0) === "tangente" ? e : null;
  }
  const candidats: number[] = [];
  for (let j = -24; j <= 24; j++) {
    const k = j / 2;
    if (K.some((t) => Math.abs(t - k) < 1e-9)) continue;
    const d = delta(base, k);
    if (verdict === "exterieure" && d < -1e-9 && Number.isInteger(k)) candidats.push(k);
    if (verdict === "secante" && d > 1e-9 && estCarreRationnel(d) && pointsLisibles({ ...base, k0: k }, k)) candidats.push(k);
  }
  const entiers = candidats.filter((k) => Number.isInteger(k) && Math.abs(k) <= 10);
  const liste = entiers.length ? entiers : candidats;
  if (liste.length === 0) return null;
  const k0 = parmi(liste);
  return { ...base, k0 };
}

export function construire(variante: VariantePD): ExercicePD {
  const verdicts: VerdictPD[] = variante === "ellipse" ? ["secante", "tangente", "exterieure"] : ["secante", "tangente", "exterieure", "unPoint"];
  const verdict = parmi(verdicts);
  for (;;) {
    const e = essai(variante, verdict);
    if (e) return e;
  }
}

export function construireAvecVariante(id: string): ExercicePD {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExercicePD(): ExercicePD {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
