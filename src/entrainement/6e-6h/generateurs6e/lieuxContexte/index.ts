import type { ExerciceLC, VarianteLC } from "../../core6e/lieuxContexte";
import type { Pt } from "../../ui6e/outilsLieuxLotH2";
import { entier, parmi } from "../../ui6e/outilsLieuxLotH2";

/**
 * Couche A — générateur de `6gen130` « Lieux en contexte : un point qui bouge ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). Nombres entiers petits (figure lisible à 390 px) ; centre de gravité :
 * C(t) = K + 3v(t + 1) (K = d ∩ (AB), hors de [AB]), pour que G(t) = G(K) + v(t + 1) ait des
 * coordonnées en tiers au plus ; K = A + λ(B − A), λ = −2 ou 3 (λ = −1 ou 2 donnerait le point exclu
 * en A ou en B) ; rail : t ∈ [0 ; 1], le point K (t = −1) reste hors du rail.
 */

export const CATALOGUE_VARIANTES: { id: VarianteLC; label: string }[] = [
  { id: "echelle", label: "Échelle qui glisse (milieu)" },
  { id: "radars", label: "Deux radars au même rythme (arc capable)" },
  { id: "gravite", label: "Centre de gravité, un sommet sur un rail ou une droite" },
  { id: "pied", label: "Pied d'une perpendiculaire sur une barre qui pivote" },
];

const ZERO: Pt = { x: 0, y: 0 };
const base = (variante: VarianteLC): ExerciceLC => ({ variante, L: 0, d: 0, phi: 90, A: ZERO, B: ZERO, C0: ZERO, u: ZERO, rail: true, O: ZERO, P: ZERO });

const DIRECTIONS: Pt[] = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
];

export function construire(variante: VarianteLC): ExerciceLC {
  const e = base(variante);
  switch (variante) {
    case "echelle":
      return { ...e, L: parmi([4, 6, 8, 10]) };
    case "radars":
      return { ...e, d: parmi([2, 3, 4]), phi: parmi([90, 45, 135] as const) };
    case "pied": {
      const O = { x: entier(-4, 0), y: entier(-4, 0) };
      return { ...e, O, P: { x: O.x + entier(2, 5), y: O.y + entier(2, 5) } };
    }
    case "gravite": {
      const rail = Math.random() < 0.5;
      for (;;) {
        const A = { x: entier(-3, 2), y: entier(-3, 2) };
        const B = { x: A.x + parmi([-1, 1]) * entier(1, 2), y: A.y + entier(-2, 2) };
        // K hors de [AB], ni en 2A − B ni en 2B − A (sinon le point exclu serait A ou B).
        const lambda = parmi([-2, 3]);
        const K = { x: A.x + lambda * (B.x - A.x), y: A.y + lambda * (B.y - A.y) };
        const v = parmi(DIRECTIONS);
        if (v.x * (B.y - A.y) - v.y * (B.x - A.x) === 0) continue;
        const u = { x: 3 * v.x, y: 3 * v.y };
        const C0 = { x: K.x + u.x, y: K.y + u.y };
        if (Math.max(Math.abs(C0.x + u.x), Math.abs(C0.y + u.y), Math.abs(K.x), Math.abs(K.y)) > 9) continue;
        return { ...e, A, B, C0, u, rail };
      }
    }
  }
}

export function construireAvecVariante(id: string): ExerciceLC {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceLC(): ExerciceLC {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
