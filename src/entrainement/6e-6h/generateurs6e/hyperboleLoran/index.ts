import type { ExerciceLO, VarianteLO } from "../../core6e/hyperboleLoran";
import { parmi } from "../../ui6e/outilsConiquesLotH2";

/**
 * Couche A — générateur de `6gen142` « Hyperbole de navigation : LORAN ». `Math.random()` seul (le `?code=`
 * rejoue le tirage). L'émetteur reçu en premier (la branche) est tiré EN PREMIER, à parts égales. Puis un
 * triplet (a ; b ; c) avec a multiple de 3 (Δt = 2a / 0,3 entier, en microsecondes) et une route qui coupe
 * l'hyperbole en des points à coordonnées entières : y = h avec h/b ∈ {3/4, 4/3, 5/12, 12/5, 8/15, 15/8}
 * (x₀ = a·√(1 + h²/b²) entier), ou x = k du côté de la branche avec k/a ∈ {5/4, 5/3, 13/12, 13/5, 17/15,
 * 17/8} (y₀ = b·√(k²/a² − 1) entier).
 */

export const CATALOGUE_VARIANTES: { id: VarianteLO; label: string }[] = [
  { id: "parallele", label: "Route parallèle à la droite des émetteurs" },
  { id: "perpendiculaire", label: "Route perpendiculaire à la droite des émetteurs" },
];

/** (a ; b ; c) avec a² + b² = c², a multiple de 3. */
const TRIPLETS: [number, number, number][] = [
  [30, 40, 50],
  [60, 80, 100],
  [45, 60, 75],
  [15, 36, 39],
  [36, 15, 39],
  [24, 32, 40],
  [24, 7, 25],
  [21, 20, 29],
  [48, 14, 50],
  [48, 20, 52],
  [60, 25, 65],
  [45, 24, 51],
  [63, 16, 65],
  [36, 48, 60],
];
/** (t ; √(1 + t²)) rationnels. */
const RAPPORTS: [number, number][] = [
  [3 / 4, 5 / 4],
  [4 / 3, 5 / 3],
  [5 / 12, 13 / 12],
  [12 / 5, 13 / 5],
  [8 / 15, 17 / 15],
  [15 / 8, 17 / 8],
];

const entierProche = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;

export function construire(variante: VarianteLO): ExerciceLO {
  const premier = Math.random() < 0.5 ? "A" : "B";
  const s = premier === "B" ? 1 : -1;
  for (;;) {
    const [a, b, c] = parmi(TRIPLETS);
    const [r, rac] = parmi(RAPPORTS);
    if (variante === "parallele") {
      const h = parmi([1, -1]) * r * b;
      const x0 = a * rac;
      if (!entierProche(h) || !entierProche(x0) || Math.abs(x0) > 220 || Math.abs(h) > 220) continue;
      return { variante, a, b, c, premier, route: Math.round(h) };
    }
    // x = k : k/a = √(1 + t²), y₀ = b·t.
    const k = s * a * rac;
    const y0 = b * r;
    if (!entierProche(k) || !entierProche(y0) || Math.abs(k) > 220 || Math.abs(y0) > 220) continue;
    return { variante, a, b, c, premier, route: Math.round(k) };
  }
}

export function construireAvecVariante(id: string): ExerciceLO {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceLO(): ExerciceLO {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
