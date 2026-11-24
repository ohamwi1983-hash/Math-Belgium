import type { ExerciceDerivabilite, PolyU, VarianteDerivabilite, VerdictDerivabilite } from "../../core5e/derivabilite";
import { enX } from "../../core5e/derivabilite";

/**
 * Couche A — générateur de `5gen75` « Dérivable ou non en a ? » (version modeste). `Math.random()`
 * seul (le `?code=` rejoue le tirage). Tirage LIBRE : le VERDICT est tiré d'abord (un quart chacun :
 * dérivable, point anguleux, tangente verticale, pas continue), puis une famille qui le donne
 * (point anguleux : morceaux ou valeur absolue, moitié / moitié).
 * - a de −3 à 3 ; morceaux : α ∈ {−2, …, 2} (dérivable : α₁ ≠ α₂), β de −3 à 3, γ de −4 à 4 ;
 *   anguleux : β₁ ≠ β₂ ; pas continue : saut γ₂ − γ₁ de ±1 à ±4 ; coefficients développés ≤ 15 en
 *   valeur absolue, au moins un morceau de degré 2 quand c'est possible (dérivable : toujours) ;
 * - absolue : c ∈ {±1, ±2, ±3}, q(x) = εx² + mx + p, ε ∈ {0, 0, 1, −1}, |f(a)| ≤ 6, demi-pentes ≤ 5 ;
 * - racine : c ∈ {1, 2, 3, −1, −2}, b de −4 à 4.
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

function morceaux(variante: "morceauxDerivable" | "morceauxAnguleux" | "morceauxDiscontinu"): ExerciceDerivabilite {
  for (;;) {
    const a = entier(-3, 3);
    const g1 = entier(-4, 4);
    const b1 = entier(-3, 3);
    let gauche: PolyU;
    let droite: PolyU;
    if (variante === "morceauxDerivable") {
      const a1 = entier(-2, 2);
      const a2 = entier(-2, 2);
      if (a1 === a2) continue;
      gauche = [a1, b1, g1];
      droite = [a2, b1, g1];
    } else if (variante === "morceauxAnguleux") {
      const b2 = entier(-3, 3);
      if (b2 === b1) continue;
      gauche = [entier(-1, 1), b1, g1];
      droite = [entier(-1, 1), b2, g1];
      if (gauche[0] === 0 && droite[0] === 0 && Math.random() < 0.7) continue;
    } else {
      const saut = parmi([-4, -3, -2, -1, 1, 2, 3, 4]);
      gauche = [entier(-1, 1), b1, g1];
      droite = [entier(-1, 1), entier(-3, 3), g1 + saut];
      if (Math.abs(g1 + saut) > 6) continue;
      if (gauche[0] === 0 && droite[0] === 0 && Math.random() < 0.7) continue;
    }
    const cx = [...enX(gauche, a), ...enX(droite, a)];
    if (cx.some((v) => Math.abs(v) > 15)) continue;
    // Morceaux non constants (sinon le taux d'un côté est trivialement nul).
    if (gauche[0] === 0 && gauche[1] === 0) continue;
    if (droite[0] === 0 && droite[1] === 0) continue;
    return { variante, a, gauche, droite, c: 0, q: [0, 0, 0], b: 0 };
  }
}

function absolue(): ExerciceDerivabilite {
  for (;;) {
    const a = entier(-3, 3);
    const c = parmi([1, -1, 2, -2, 3, -3]);
    const eps = parmi([0, 0, 1, -1]);
    const m = entier(-3, 3);
    const p = entier(-4, 4);
    const qa = eps * a * a + m * a + p;
    const qp = 2 * eps * a + m;
    // Valeur et pentes lisibles (|f(a)| ≤ 6, demi-pentes ≤ 5 en valeur absolue).
    if (Math.abs(qa) > 6 || Math.abs(qp - c) > 5 || Math.abs(qp + c) > 5) continue;
    return { variante: "absolue", a, gauche: [eps, qp - c, qa], droite: [eps, qp + c, qa], c, q: [eps, m, p], b: 0 };
  }
}

function racine(): ExerciceDerivabilite {
  return { variante: "racine", a: entier(-3, 3), gauche: [0, 0, 0], droite: [0, 0, 0], c: parmi([1, 2, 3, -1, -2]), q: [0, 0, 0], b: entier(-4, 4) };
}

export function construire(variante: VarianteDerivabilite): ExerciceDerivabilite {
  if (variante === "absolue") return absolue();
  if (variante === "racine") return racine();
  return morceaux(variante);
}

export const CATALOGUE_VARIANTES: { id: VarianteDerivabilite; label: string }[] = [
  { id: "morceauxDerivable", label: "Morceaux raccordés : dérivable" },
  { id: "morceauxAnguleux", label: "Morceaux raccordés : point anguleux" },
  { id: "morceauxDiscontinu", label: "Morceaux : pas continue en a" },
  { id: "absolue", label: "Valeur absolue c|x − a| + q(x) : point anguleux" },
  { id: "racine", label: "Racine c√(x − a) + b : tangente verticale" },
];

export function construireAvecVarianteId(id: string): ExerciceDerivabilite {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return v ? construire(v.id) : genererExerciceDerivabilite();
}

/** Verdict tiré d'abord, un quart chacun ; point anguleux : morceaux ou valeur absolue. */
export function genererExerciceDerivabilite(): ExerciceDerivabilite {
  const v: VerdictDerivabilite = parmi(["derivable", "anguleux", "verticale", "discontinue"] as const);
  if (v === "derivable") return construire("morceauxDerivable");
  if (v === "verticale") return construire("racine");
  if (v === "discontinue") return construire("morceauxDiscontinu");
  return construire(Math.random() < 0.5 ? "morceauxAnguleux" : "absolue");
}
