// Primitives pures de la suite géométrique un=u1*q^(n-1).
//
// Réutilisées telles quelles par 5gen16 ("Convergence et divergence des suites", variante
// géométrique) pour ses seules FORMULES — jamais son tirage aléatoire, propre à ce générateur
// (voir generateurs5e/suitesGeometriques/principal.ts).

export function termeGeometrique(u1: number, q: number, n: number): number {
  return u1 * Math.pow(q, n - 1);
}

export function sommeGeometriqueFinie(u1: number, q: number, n: number): number {
  if (q === 1) return n * u1;
  return (u1 * (1 - Math.pow(q, n))) / (1 - q);
}

/** S∞=u1/(1-q) n'existe que si |q|<1 STRICTEMENT — condition PLUS STRICTE que la convergence de
 * la suite elle-même (q=1 fait converger la suite vers u1, mais Sn=n*u1 diverge). Ne jamais
 * réutiliser telle quelle la classification de convergence de 5gen16 pour cette condition. */
export function sommeInfinieExiste(q: number): boolean {
  return Math.abs(q) < 1;
}

export function sommeInfinie(u1: number, q: number): number | null {
  if (!sommeInfinieExiste(q)) return null;
  return u1 / (1 - q);
}
