/**
 * Petits formateurs numériques communs à 6gen26 (aires), 6gen27 (volumes) et 6gen28 (longueur
 * d'arc) — audit du chapitre 4 de 6e (points 16–17) : toute réponse affichée donne d'abord la
 * VALEUR EXACTE (fraction, multiple de π, forme close), puis la valeur approchée avec une virgule
 * décimale ; « = » quand la valeur est exacte, « ≈ » seulement devant un arrondi.
 *
 * Ces fonctions ne servent qu'à l'AFFICHAGE : la vérification reste numérique (`moteur6e/`).
 */

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction irréductible {num, den} (den > 0) dont la valeur égale `x` à 1e-7 près, avec un
 * dénominateur ≤ `denMax` ; `null` si aucune (valeur irrationnelle ou dénominateur trop grand). */
export function fractionDepuisValeur(x: number, denMax = 240): { num: number; den: number } | null {
  if (!Number.isFinite(x)) return null;
  for (let den = 1; den <= denMax; den++) {
    const num = Math.round(x * den);
    if (Math.abs(num / den - x) < 1e-7 * Math.max(1, Math.abs(x))) {
      const g = pgcd(num, den);
      return { num: num / g, den: den / g };
    }
  }
  return null;
}

/** LaTeX d'une fraction signée (`-\dfrac{7}{3}`, `5`, `0`). */
export function fractionLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const g = pgcd(num, den);
  const n = num / g;
  const d = den / g;
  const signe = n < 0 !== d < 0 ? "-" : "";
  const an = Math.abs(n);
  const ad = Math.abs(d);
  return ad === 1 ? `${signe}${an}` : `${signe}\\dfrac{${an}}{${ad}}`;
}

/** Nombre décimal arrondi (3 décimales par défaut) écrit avec une virgule décimale LaTeX `{,}`,
 * sans zéros inutiles. */
export function decimalLatex(x: number, decimales = 3): string {
  const facteur = Math.pow(10, decimales);
  const arrondi = Math.round(x * facteur) / facteur;
  const s = (Object.is(arrondi, -0) ? 0 : arrondi).toString();
  return s.replace("-", "-").replace(".", "{,}");
}

/** Même chose en texte brut (virgule, signe « − » typographique) — pour les libellés hors LaTeX. */
export function decimalTexte(x: number, decimales = 3): string {
  const facteur = Math.pow(10, decimales);
  const arrondi = Math.round(x * facteur) / facteur;
  const s = (Object.is(arrondi, -0) ? 0 : arrondi).toString();
  return s.replace("-", "−").replace(".", ",");
}

/** Vrai si `x` est (à 1e-9 près) un décimal à au plus `decimales` chiffres après la virgule. */
function estDecimalCourt(x: number, decimales = 3): boolean {
  const facteur = Math.pow(10, decimales);
  return Math.abs(Math.round(x * facteur) - x * facteur) < 1e-6;
}

/** Suffixe « = exact » ou « = exact ≈ approché » à placer après un nom (`\text{Aire}`, `V`, `L`) :
 * - `exactLatex` fourni : `=exact` puis `\approx décimal` si l'exact n'est pas déjà un décimal
 *   court ;
 * - sinon, valeur rationnelle reconnue : la fraction ;
 * - sinon : `\approx décimal`. */
export function egalExactPuisApprox(valeur: number, exactLatex?: string | null): string {
  if (exactLatex) {
    const exactEstDecimal = /^-?\d+(\{,\}\d+)?$/.test(exactLatex);
    return exactEstDecimal ? `=${exactLatex}` : `=${exactLatex}\\approx ${decimalLatex(valeur)}`;
  }
  const fraction = fractionDepuisValeur(valeur);
  if (fraction) {
    const f = fractionLatex(fraction.num, fraction.den);
    return fraction.den === 1 || estDecimalCourt(valeur) ? `=${f}` : `=${f}\\approx ${decimalLatex(valeur)}`;
  }
  return `\\approx ${decimalLatex(valeur)}`;
}

/** Multiple rationnel de π : `\dfrac{16\pi}{15}`, `9\pi`, `-\pi`… ; `null` si `valeur/π` n'est pas
 * une fraction de dénominateur raisonnable. */
export function multiplePiLatex(valeur: number): string | null {
  const f = fractionDepuisValeur(valeur / Math.PI);
  if (!f) return null;
  if (f.num === 0) return "0";
  const signe = f.num < 0 ? "-" : "";
  const n = Math.abs(f.num);
  const numerateur = n === 1 ? "\\pi" : `${n}\\pi`;
  return f.den === 1 ? `${signe}${numerateur}` : `${signe}\\dfrac{${numerateur}}{${f.den}}`;
}

/** √n simplifiée : `{coef, radicande}` avec radicande sans facteur carré (√12 → 2√3, √16 → 4). */
export function racineSimplifiee(n: number): { coef: number; radicande: number } {
  let coef = 1;
  let radicande = n;
  for (let d = 2; d * d <= radicande; d++) {
    while (radicande % (d * d) === 0) {
      radicande /= d * d;
      coef *= d;
    }
  }
  return { coef, radicande };
}

/** LaTeX de √n simplifiée (`4`, `2\sqrt{3}`, `\sqrt{5}`). */
export function racineLatex(n: number): string {
  const { coef, radicande } = racineSimplifiee(n);
  if (radicande === 1) return `${coef}`;
  return coef === 1 ? `\\sqrt{${radicande}}` : `${coef}\\sqrt{${radicande}}`;
}

/** Consigne d'arrondi commune aux champs « valeur » (aire, volume, longueur). */
export const CONSIGNE_PRECISION = "Donne la valeur exacte, ou une valeur arrondie au centième.";
