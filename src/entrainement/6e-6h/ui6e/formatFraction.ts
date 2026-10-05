/**
 * Formatage fraction irréductible — générique, partagé par tout module 6e ayant besoin d'afficher
 * une valeur potentiellement non entière sans jamais utiliser de décimal (convention CLAUDE.md,
 * "Fraction irréductible, jamais de décimal"). Introduit pour `6gen1` (le pivot -b/a d'une famille
 * "puissanceAffine", ou -b/(2a) d'une "quadratique", n'est pas toujours entier) — réutilisable par
 * tout futur générateur 6e ayant le même besoin.
 *
 * Deux façons de l'utiliser : depuis un numérateur/dénominateur ENTIERS exacts déjà connus à la
 * génération (`formatFractionLatex`/`formatFractionTexte` — précision garantie), ou depuis un
 * flottant déjà stocké dans un contrat (ex. un `EnsembleReelGuide`, dont les bornes sont des
 * `number`) via `approxFractionLatex`/`approxFractionTexte` — reconstruit la fraction en cherchant
 * le plus petit dénominateur ≤ `maxDenominateur` qui reproduit la valeur à 1e-6 près, largement
 * suffisant pour toute fraction générée par ce chantier (dénominateurs ≤10 en pratique).
 */
function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export function formatFractionLatex(numerateur: number, denominateur: number): string {
  let n = numerateur;
  let d = denominateur;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  if (d === 1) return `${n}`;
  return n < 0 ? `-\\dfrac{${-n}}{${d}}` : `\\dfrac{${n}}{${d}}`;
}

export function formatFractionTexte(numerateur: number, denominateur: number): string {
  let n = numerateur;
  let d = denominateur;
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  n /= g;
  d /= g;
  return d === 1 ? `${n}` : `${n}/${d}`;
}

export function approxFractionLatex(valeur: number, maxDenominateur = 12): string {
  if (Number.isInteger(valeur)) return `${valeur}`;
  for (let d = 2; d <= maxDenominateur; d++) {
    const n = valeur * d;
    if (Math.abs(n - Math.round(n)) < 1e-6) return formatFractionLatex(Math.round(n), d);
  }
  return `${valeur}`; // filet de sécurité, ne devrait jamais arriver pour ce chantier
}

export function approxFractionTexte(valeur: number, maxDenominateur = 12): string {
  if (Number.isInteger(valeur)) return `${valeur}`;
  for (let d = 2; d <= maxDenominateur; d++) {
    const n = valeur * d;
    if (Math.abs(n - Math.round(n)) < 1e-6) return formatFractionTexte(Math.round(n), d);
  }
  return `${valeur}`;
}
