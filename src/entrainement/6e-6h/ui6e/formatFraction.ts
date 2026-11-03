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
 *
 * **Au-delà de `maxDenominateur`** (audit 6e ch. 3, point 22) : avant d'abandonner, la recherche
 * continue jusqu'à `DENOMINATEUR_ETENDU` avec une tolérance BEAUCOUP plus serrée (≈1e-13 relatif),
 * qui ne reconnaît qu'un vrai rationnel calculé en flottant (ex. `5^{-3}=0.008000000000000002` →
 * 1/125), jamais un irrationnel approché par hasard. Le résultat pour toute valeur déjà reconnue
 * avec un dénominateur ≤ `maxDenominateur` est inchangé (même boucle, même ordre) : seul l'ancien
 * repli « flottant brut » est remplacé par la fraction exacte.
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

const DENOMINATEUR_ETENDU = 10000;

/** Fraction `[numérateur, dénominateur]` reconstruite depuis un flottant, ou `null` (irrationnel
 * ou dénominateur > `DENOMINATEUR_ETENDU`) — voir l'en-tête de ce fichier. */
function retrouverFraction(valeur: number, maxDenominateur: number): [number, number] | null {
  for (let d = 2; d <= maxDenominateur; d++) {
    const n = valeur * d;
    if (Math.abs(n - Math.round(n)) < 1e-6) return [Math.round(n), d];
  }
  for (let d = Math.max(2, maxDenominateur + 1); d <= DENOMINATEUR_ETENDU; d++) {
    const n = valeur * d;
    // Tolérance relative à la VALEUR (erreur d'arrondi d'un vrai p/q calculé en flottant ≈ 1e-16·|v|·d),
    // jamais au numérateur : sinon un irrationnel retombe trop souvent « sur » une fraction.
    if (Math.abs(n - Math.round(n)) < 1e-13 * Math.max(1, Math.abs(valeur)) * d) return [Math.round(n), d];
  }
  return null;
}

export function approxFractionLatex(valeur: number, maxDenominateur = 12): string {
  if (Number.isInteger(valeur)) return `${valeur}`;
  const fraction = retrouverFraction(valeur, maxDenominateur);
  if (fraction !== null) return formatFractionLatex(fraction[0], fraction[1]);
  return `${valeur}`; // filet de sécurité : valeur non rationnelle (jamais attendu pour ce chantier)
}

export function approxFractionTexte(valeur: number, maxDenominateur = 12): string {
  if (Number.isInteger(valeur)) return `${valeur}`;
  const fraction = retrouverFraction(valeur, maxDenominateur);
  if (fraction !== null) return formatFractionTexte(fraction[0], fraction[1]);
  return `${valeur}`;
}
