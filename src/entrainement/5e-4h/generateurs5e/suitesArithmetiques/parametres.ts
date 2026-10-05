/**
 * Couche A (5e) — primitives PURES partagées par toutes les familles de 5gen14, et réutilisées en
 * import générateur→générateur par la variante arithmétique de 5gen16 ("réutilise la génération de
 * 5gen14") — celle-ci a besoin de sa PROPRE distribution de r (incluant r=0 avec une fréquence
 * garantie, jamais produit par `tirerU1EtR` ci-dessous) : seules `termeArithmetique`/
 * `sommeArithmetique` sont donc réutilisées telles quelles, jamais `tirerU1EtR`.
 */

export function termeArithmetique(u1: number, r: number, n: number): number {
  return u1 + (n - 1) * r;
}

export function sommeArithmetique(u1: number, r: number, n: number): number {
  return (n / 2) * (2 * u1 + (n - 1) * r);
}

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** r JAMAIS nul (une raison nulle rendrait les écrans "trouver r" triviaux/dégénérés pour ce
 * générateur — le cas r=0 reste couvert côté 5gen16, qui a sa propre distribution). */
export function tirerU1EtR(): { u1: number; r: number } {
  const u1 = entierAleatoire(-20, 20);
  const rMagnitude = entierAleatoire(1, 9);
  const r = Math.random() < 0.5 ? rMagnitude : -rMagnitude;
  return { u1, r };
}
