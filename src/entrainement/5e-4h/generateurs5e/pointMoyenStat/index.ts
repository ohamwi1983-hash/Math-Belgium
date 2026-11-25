import { CONTEXTES_PETITS } from "../../core5e/contextesStat2vLotH1";
import type { ExercicePointMoyen, Manquant, VariantePointMoyen } from "../../core5e/pointMoyenStat";
import type { Pt } from "../../core5e/stat2vLotH1";
import { arrondi, decimales, entier, melanger, normale, parmi, pointMoyen, somme } from "../../core5e/stat2vLotH1";

/**
 * Couche A — générateur de `5gen77` « Point moyen et valeurs manquantes ». `Math.random()` seul.
 * - pointMoyen : petite série (n = 5, 6 ou 8) d'un contexte, x entiers distincts, y entiers ou au dixième ;
 *   moyennes EXACTES (n = 6 : sommes rendues divisibles par 3) ;
 * - uneValeur, deuxValeurs : série « xᵢ, yᵢ » au dixième (n = 4 ou 5, comme l'exercice 1 du document),
 *   G exact (au plus trois décimales), valeurs effacées dans des colonnes différentes ;
 * - mayerG1G2 : pente courte (0,25 ; 0,4 ; … ; 2,4, au signe près), x₁ et x₂ au dixième, b au dixième,
 *   ordonnées de G₁, G₂ exactes (au plus trois décimales, positives), x₀ entier, y₀ au dixième.
 */

const tenter = <T>(f: () => T | null): T => {
  for (;;) {
    const r = f();
    if (r !== null) return r;
  }
};

/** Ajuste la dernière valeur pour que la somme (en unités de 10⁻ᵈ) soit divisible par `k`. */
function divisible(v: number[], d: number, k: number): number[] {
  const u = v.map((x) => Math.round(x * 10 ** d));
  const s = somme(u);
  const reste = ((s % k) + k) % k;
  if (reste === 0) return v;
  u[u.length - 1] = u[u.length - 1]! - reste;
  return u.map((x) => x / 10 ** d);
}

function construirePointMoyen(): ExercicePointMoyen {
  return tenter(() => {
    const c = parmi(CONTEXTES_PETITS);
    const n = parmi([5, 6, 8]);
    const dy = c.id === "generique" ? 1 : 0;
    const xsTires = melanger(Array.from({ length: c.xMax - c.xMin + 1 }, (_, i) => c.xMin + i)).slice(0, n).sort((a, b) => a - b);
    if (xsTires.length < n) return null;
    const pente = parmi(c.pentes);
    const ym = c.yMoyen[0] + Math.random() * (c.yMoyen[1] - c.yMoyen[0]);
    const xm = somme(xsTires) / n;
    let x = xsTires;
    let y = xsTires.map((v) => arrondi(ym + pente * (v - xm) + (dy ? 0.8 : 1.2) * normale(), dy));
    if (n === 6) {
      x = divisible(x, 0, 3);
      y = divisible(y, dy, 3);
    }
    if (new Set(x).size < n || x.some((v) => v < 0) || y.some((v) => v < 0)) return null;
    if (c.id === "revision" && y.some((v) => v > 20)) return null;
    const points: Pt[] = x.map((v, i) => ({ x: v, y: y[i]! })).sort((p, q) => p.x - q.x);
    const G = pointMoyen(points);
    if (decimales(G.x) > 3 || decimales(G.y) > 3) return null;
    return { variante: "pointMoyen", contexteId: c.id, points, dx: 0, dy, G, manquants: [] };
  });
}

function construireManquantes(variante: "uneValeur" | "deuxValeurs"): ExercicePointMoyen {
  return tenter(() => {
    const n = parmi([4, 5, 5]);
    const a = 0.7 + Math.random();
    const b = 2 + 4 * Math.random();
    const x = Array.from({ length: n }, () => arrondi(3 + 8 * Math.random(), 1));
    const points = x.map((v) => ({ x: v, y: arrondi(a * v + b + 0.6 * normale(), 1) }));
    if (new Set(x).size < n || points.some((p) => p.y <= 0)) return null;
    const G = pointMoyen(points);
    if (decimales(G.x) > 3 || decimales(G.y) > 3) return null;
    const cols = melanger(Array.from({ length: n }, (_, i) => i));
    const manquants: Manquant[] = variante === "deuxValeurs" ? [{ i: cols[0]!, coord: "x" }, { i: cols[1]!, coord: "y" }] : [{ i: cols[0]!, coord: Math.random() < 0.5 ? "x" : "y" }];
    return { variante, contexteId: "generique", points, dx: 1, dy: 1, G, manquants };
  });
}

const PENTES = [0.25, 0.4, 0.5, 0.75, 0.8, 1.2, 1.25, 1.5, 2.4, -0.4, -0.5, -0.75, -0.8, -1.2, -1.5];

function construireMayer(): ExercicePointMoyen {
  return tenter(() => {
    const a = parmi(PENTES);
    const x1 = arrondi(2 + 3 * Math.random(), 1);
    const x2 = arrondi(x1 + 3 + 4 * Math.random(), 1);
    const b = a > 0 ? arrondi(1 + 6 * Math.random(), 1) : arrondi(9 + 6 * Math.random(), 1);
    const G1 = { x: x1, y: arrondi(a * x1 + b, 6) };
    const G2 = { x: x2, y: arrondi(a * x2 + b, 6) };
    if (G1.y <= 0.5 || G2.y <= 0.5 || decimales(G1.y) > 3 || decimales(G2.y) > 3) return null;
    if (decimales(G1.y) < 2 && decimales(G2.y) < 2) return null;
    const x0 = entier(Math.floor(x1) - 1, Math.ceil(x2) + 2);
    if (x0 <= 0 || Math.abs(x0 - x1) < 0.5 || Math.abs(x0 - x2) < 0.5) return null;
    const lo = Math.min(G1.y, G2.y);
    const hi = Math.max(G1.y, G2.y);
    const y0 = arrondi(lo + (hi - lo) * (0.2 + 0.6 * Math.random()), 1);
    const xSol = (y0 - b) / a;
    if (Math.abs(xSol - x0) < 0.5) return null;
    return { variante: "mayerG1G2", contexteId: "generique", points: [], dx: 1, dy: 1, G: { x: 0, y: 0 }, manquants: [], G1, G2, a, b, x0, y0 };
  });
}

export function construire(variante: VariantePointMoyen): ExercicePointMoyen {
  if (variante === "pointMoyen") return construirePointMoyen();
  if (variante === "mayerG1G2") return construireMayer();
  return construireManquantes(variante);
}

export const CATALOGUE_VARIANTES: { id: VariantePointMoyen; label: string }[] = [
  { id: "pointMoyen", label: "Point moyen d'une série" },
  { id: "uneValeur", label: "Une valeur manquante, connaissant G" },
  { id: "deuxValeurs", label: "Deux valeurs manquantes, connaissant G" },
  { id: "mayerG1G2", label: "Droite de Mayer depuis G₁ et G₂, prévisions" },
];

export function construireAvecVarianteId(id: string): ExercicePointMoyen {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExercicePointMoyen(): ExercicePointMoyen {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
