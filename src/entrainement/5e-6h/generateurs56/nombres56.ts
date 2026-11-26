import { nbL, nbT } from "../../5e-4h/ui5e/nombresTrigo";

/**
 * Écritures numériques communes aux générateurs 56gen20–56gen22 (5e (6h), chantier E2) : virgule
 * décimale `{,}`, « − » typographique dans le texte, puissances de 10 en KaTeX, exposants Unicode dans
 * les libellés en chaîne seule. Une seule source pour l'écran, les aides, le papier et le corrigé.
 */

const EXPOSANTS: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻" };

/** Exposant en Unicode (« ⁻⁴ ») pour un texte brut. */
export function exposantT(n: number | string): string {
  return String(n)
    .split("")
    .map((c) => EXPOSANTS[c] ?? c)
    .join("");
}

/** 10⁻ᵏ en KaTeX. */
export const dixMoinsL = (k: number) => `10^{-${k}}`;
/** 10⁻ᵏ en texte brut. */
export const dixMoinsT = (k: number) => `10${exposantT(-k)}`;

/** Le nombre s'écrit-il exactement avec au plus `dec` décimales ? */
export function exactAvec(x: number, dec: number): boolean {
  const f = 10 ** dec;
  return Math.abs(x * f - Math.round(x * f)) < 1e-6;
}

/** « = 5{,}5 » si la valeur est exacte à `dec` décimales, sinon « \approx 3{,}2727 ». */
export function egalOuEnvironL(x: number, dec: number): string {
  return exactAvec(x, dec) ? `=${nbL(x, dec)}` : `\\approx ${nbL(x, dec, true)}`;
}

/** Valeur seule : exacte, ou arrondie à `dec` décimales (sans signe de relation). */
export function valeurL(x: number, dec: number): string {
  return exactAvec(x, dec) ? nbL(x, dec) : nbL(x, dec, true);
}

/** Notation scientifique à `chiffres` chiffres significatifs : « 1{,}3\cdot 10^{-6} ». */
export function scientifiqueL(x: number, chiffres = 2): string {
  if (x === 0) return "0";
  const signe = x < 0 ? "-" : "";
  const a = Math.abs(x);
  let e = Math.floor(Math.log10(a));
  let m = a / 10 ** e;
  const f = 10 ** (chiffres - 1);
  m = Math.round(m * f) / f;
  if (m >= 10) {
    m /= 10;
    e += 1;
  }
  return `${signe}${nbL(m, chiffres - 1, true)}\\cdot 10^{${e}}`;
}

/** Arrondi par défaut / par excès à `dec` décimales (encadrement honnête). */
export const parDefautA = (x: number, dec: number) => Math.floor(x * 10 ** dec + 1e-9) / 10 ** dec;
export const parExcesA = (x: number, dec: number) => Math.ceil(x * 10 ** dec - 1e-9) / 10 ** dec;

/** Nombre en texte brut (virgule, « − »). */
export { nbL, nbT };

/** Affichage « calculatrice » : valeur exacte si elle a au plus `dec` décimales, sinon tronquée à `dec`
 * décimales suivie de « \ldots » (« 3{,}272727\ldots »). */
export function tronqueL(x: number, dec: number): string {
  if (exactAvec(x, dec)) return nbL(x, dec);
  const f = 10 ** dec;
  const t = Math.trunc(x * f) / f;
  return `${nbL(t, dec, true)}\\ldots`;
}

/** Rationnel n/d en LaTeX (« \dfrac{4}{3} », « -\dfrac{1}{2} », « 5 ») — n et d entiers, d > 0. */
export function fractionL(n: number, d: number): string {
  if (d === 1) return `${n}`;
  return `${n < 0 ? "-" : ""}\\dfrac{${Math.abs(n)}}{${d}}`;
}

/**
 * Lecture d'une saisie numérique : notation scientifique « 9,2e-5 » / « 9,2E−5 » acceptée en plus de
 * ce que lit `lireValeur` (« 9,2·10^-5 », fractions, √…). Aucune frappe n'est jamais bloquée : cette
 * fonction ne fait que LIRE la saisie.
 */
export function avecNotationE(brut: string): string {
  return brut.replace(/(\d)\s*[eE]\s*([-−–—+]?\s*\d+)/g, (_, c: string, e: string) => `${c}·10^(${e.replace(/\s/g, "")})`);
}
