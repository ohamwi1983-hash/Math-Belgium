/**
 * Couche A (6e) — petite arithmétique rationnelle EXACTE, PROPRE à `6gen56` (jamais importée d'un
 * autre générateur/chantier — CLAUDE.md, isolation stricte entre générateurs/chantiers). La plupart
 * des quantités de ce générateur restent entières par construction (paramètres choisis exprès),
 * mais quelques-unes (le rapport k d'Apollonius, la constante finale de la famille D "ratio") sont
 * naturellement des fractions non entières : `Fraction` les garde EXACTES jusqu'à l'affichage
 * (`versLatex`, toujours réduite par pgcd, jamais de décimal — convention CLAUDE.md), tout en
 * exposant `versDecimal` pour la comparaison numérique tolérante (`diagnostiquerValeur`).
 */
export interface Fraction {
  num: number;
  den: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

export function fraction(num: number, den: number = 1): Fraction {
  if (den === 0) throw new Error("fraction : dénominateur nul");
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = pgcd(num, den);
  return { num: num / g, den: den / g };
}

export function ajouter(a: Fraction, b: Fraction): Fraction {
  return fraction(a.num * b.den + b.num * a.den, a.den * b.den);
}
export function soustraire(a: Fraction, b: Fraction): Fraction {
  return fraction(a.num * b.den - b.num * a.den, a.den * b.den);
}
export function multiplier(a: Fraction, b: Fraction): Fraction {
  return fraction(a.num * b.num, a.den * b.den);
}
export function diviser(a: Fraction, b: Fraction): Fraction {
  return fraction(a.num * b.den, a.den * b.num);
}
export function versDecimal(a: Fraction): number {
  return a.num / a.den;
}
export function versLatex(a: Fraction): string {
  if (a.den === 1) return `${a.num}`;
  if (a.num < 0) return `-\\dfrac{${-a.num}}{${a.den}}`;
  return `\\dfrac{${a.num}}{${a.den}}`;
}
export function estEntiere(a: Fraction): boolean {
  return a.den === 1;
}
