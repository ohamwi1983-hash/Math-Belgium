/**
 * Racine RÉELLE n-ième — Couche A, partagée par les familles `puissanceAffine`/`puissanceMonome`
 * (réciproque quand n est pair : x = ±racineReelle(u, n)). `n` est toujours un entier non nul
 * (jamais 0 ni 1 — voir `core6e/injectiviteFonctions.types.ts`), positif ou négatif.
 *
 * `Math.pow(base, 1/n)` échoue pour une base négative dès que `1/n` n'est pas un entier (NaN en
 * JS, même quand la racine réelle existe réellement — ex. racine cubique de -8 = -2, mais
 * `Math.pow(-8, 1/3)` renvoie NaN) : on passe donc toujours par `sign(y)*|y|^(1/n)` pour n impair,
 * ce qui reste valable même pour n négatif (racineReelle(y,-3) = sign(y)*|y|^(-1/3) =
 * 1/racineReelle(y,3), la réciproque correcte de y=x^(-3)).
 */
export function racineReelle(y: number, n: number): number {
  if (n % 2 !== 0) {
    return Math.sign(y) * Math.pow(Math.abs(y), 1 / n);
  }
  if (y < 0) return NaN;
  return Math.pow(y, 1 / n);
}
