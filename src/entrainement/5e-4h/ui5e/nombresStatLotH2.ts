/**
 * Écriture des nombres des générateurs du lot H2 du 5e ch. 6 (5gen78–5gen81) : virgule décimale,
 * « − » typographique, espace des milliers à partir de 10 000 (`\,` en KaTeX, espace fine insécable
 * en texte), zéros finaux retirés sauf si `fixe`. Lecture d'un nombre décimal saisi et repérage
 * d'une saisie « trop arrondie » (refusée SANS tentative).
 */

import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { lireValeur } from "../moteur5e/lectureValeurTrigo";

function chaine(x: number, dec: number, fixe: boolean): { neg: boolean; ent: string; frac: string } {
  const f = 10 ** dec;
  const r = Math.round(x * f + (x >= 0 ? 1e-9 : -1e-9)) / f;
  let s = Math.abs(r).toFixed(dec);
  if (!fixe && s.includes(".")) s = s.replace(/\.?0+$/, "");
  const [ent, frac = ""] = s.split(".");
  return { neg: r < 0 && Number(s) !== 0, ent: ent!, frac };
}

const milliers = (ent: string, sep: string) => (ent.length >= 5 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : ent);

/** Nombre en LaTeX : « 0{,}134 », « -2{,}5 », « 12\,345 ». */
export function nL(x: number, dec = 2, fixe = false): string {
  const c = chaine(x, dec, fixe);
  return `${c.neg ? "-" : ""}${milliers(c.ent, "\\,")}${c.frac ? `{,}${c.frac}` : ""}`;
}

/** Nombre en texte : « 0,134 », « −2,5 », « 12 345 » (espace fine insécable). */
export function nT(x: number, dec = 2, fixe = false): string {
  const c = chaine(x, dec, fixe);
  return `${c.neg ? "−" : ""}${milliers(c.ent, " ")}${c.frac ? `,${c.frac}` : ""}`;
}

/** Facteur entre parenthèses s'il est négatif. */
export const nP = (x: number, dec = 2, fixe = false): string => (x < 0 && nL(x, dec, fixe) !== "0" ? `(${nL(x, dec, fixe)})` : nL(x, dec, fixe));

/** « + 2{,}5 » ou « - 2{,}5 » (terme suivant d'une somme). */
/** Terme suivant d'une somme : « +2{,}5 », « -2{,}5 », rien pour un zéro (arrondi compris). */
export const nPlus = (x: number, dec = 2, fixe = false): string => {
  const v = nL(x, dec, fixe);
  return /^-?0(\{,\}0*)?$/.test(v) ? "" : v.startsWith("-") ? v : `+${v}`;
};

/** « = 2,5 » si exact à `dec` décimales, sinon « ≈ 2,5 » (LaTeX). */
export function egalOuEnviron(x: number, dec: number): string {
  const f = 10 ** dec;
  return Math.abs(x * f - Math.round(x * f)) < 1e-7 ? `=${nL(x, dec)}` : `\\approx ${nL(x, dec, true)}`;
}

/** « y = 0{,}134x - 2{,}57 ». */
export function droiteL(a: number, b: number, da: number, db: number, nomY = "y", nomX = "x", fixe = false): string {
  const ta = nL(a, da, fixe);
  const coef = ta === "1" ? "" : ta === "-1" ? "-" : ta;
  const tb = nL(b, db, fixe);
  const fin = tb === "0" ? "" : tb.startsWith("-") ? tb : `+${tb}`;
  return `${nomY}=${coef}${nomX}${fin}`;
}

/** Nombre de décimales écrites dans une saisie décimale simple (`null` : pas un décimal simple). */
export function decimalesSaisies(brut: string): number | null {
  const s = normaliserSigneMoins(brut).trim().replace(/\s/g, "");
  const m = /^-?\d*([.,](\d*))?$/.exec(s);
  if (!m || !/\d/.test(s)) return null;
  return m[2] ? m[2].length : 0;
}

/**
 * Saisie lisible mais TROP ARRONDIE : décimal simple écrit avec moins de `dec` décimales, qui serait
 * juste à cette précision-là, mais pas à la précision demandée. Message (aucune tentative), `null`
 * sinon.
 */
export function messageTropArrondi(brut: string, cible: number, dec: number, tolerance: number, precision: string): string | null {
  const k = decimalesSaisies(brut);
  const v = lireValeur(brut);
  if (k === null || v === null || k >= dec) return null;
  if (Math.abs(v - cible) <= tolerance + 1e-9) return null;
  if (Math.abs(v - cible) > 0.5 * 10 ** -k + tolerance + 1e-9) return null;
  return `Valeur trop arrondie : donne-la ${precision}. Cette saisie ne compte pas comme une tentative.`;
}

/** « au millième », « au centième », « au dixième », « à l'unité ». */
export function precisionTexte(dec: number): string {
  return dec <= 0 ? "à l'unité" : dec === 1 ? "au dixième" : dec === 2 ? "au centième" : dec === 3 ? "au millième" : "au dix-millième";
}
