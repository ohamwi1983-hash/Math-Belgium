/**
 * Couche A (5e) — arithmétique polynomiale minimale pour 5gen24 ("Étude complète"). Représentation
 * `number[]`, indice = degré (même convention que `core5e/limites.types.ts`/`asymptoteOblique.types.ts`).
 * N'importe jamais rien de `moteur5e/`.
 */

export function polyDegre(p: number[]): number {
  for (let i = p.length - 1; i >= 0; i--) {
    if (p[i] !== 0) return i;
  }
  return 0;
}

/** (x - racine), toujours monique. */
export function polyFacteur(racine: number): number[] {
  return [-racine, 1];
}

export function polyAdd(a: number[], b: number[]): number[] {
  const n = Math.max(a.length, b.length);
  const r: number[] = [];
  for (let i = 0; i < n; i++) r.push((a[i] ?? 0) + (b[i] ?? 0));
  return r;
}

export function polyMul(a: number[], b: number[]): number[] {
  const r = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) r[i + j] += a[i] * b[j];
  }
  return r;
}

export function polyMulTous(facteurs: number[][]): number[] {
  return facteurs.reduce((acc, f) => polyMul(acc, f), [1]);
}

export function polyEval(p: number[], x: number): number {
  let acc = 0;
  for (let i = p.length - 1; i >= 0; i--) acc = acc * x + p[i];
  return acc;
}

/** Retire les termes de tête nuls (jamais un tableau vide — `[0]` pour le polynôme nul). */
export function polyNormalise(p: number[]): number[] {
  const deg = polyDegre(p);
  const r = p.slice(0, deg + 1);
  return r.length === 0 ? [0] : r;
}
