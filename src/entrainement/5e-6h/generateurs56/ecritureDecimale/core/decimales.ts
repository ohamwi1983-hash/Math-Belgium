import { normaliserSigneMoins } from "../../../../../lib/normaliserSaisie";
import { pgcd } from "../../communReels/outilsReels";

/**
 * Écritures décimales des rationnels pour `56gen16` : développement d'une fraction par la division
 * posée (chiffres, restes, partie avant la période, période minimale), valeur exacte d'une écriture
 * périodique, lecture d'une saisie « 0,2(428571) » (période entre parenthèses, jamais de barre à
 * taper), écritures KaTeX (barre `\overline`) et texte. Nombres entiers JavaScript : périodes d'au plus
 * 6 chiffres, valeurs < 10⁹.
 */

export interface Developpement {
  negatif: boolean;
  entier: number;
  /** Chiffres après la virgule, avant la période (« 2 » pour 0,2(428571)). */
  avant: string;
  /** Période minimale (« 428571 ») ; « » pour une écriture limitée. */
  periode: string;
}

export interface LigneDivision {
  /** Reste précédent × 10. */
  dividende: number;
  chiffre: number;
  reste: number;
}

/** Développement de num/den (den > 0) et lignes de la division posée après la virgule. */
export function developper(num: number, den: number): { dev: Developpement; lignes: LigneDivision[]; resteRepete: number | null } {
  const negatif = num < 0;
  const a = Math.abs(num);
  const entier = Math.floor(a / den);
  let r = a % den;
  const vus = new Map<number, number>();
  const chiffres: number[] = [];
  const lignes: LigneDivision[] = [];
  while (r !== 0 && !vus.has(r)) {
    vus.set(r, chiffres.length);
    const d = Math.floor((r * 10) / den);
    lignes.push({ dividende: r * 10, chiffre: d, reste: (r * 10) % den });
    chiffres.push(d);
    r = (r * 10) % den;
  }
  if (r === 0) return { dev: { negatif, entier, avant: chiffres.join(""), periode: "" }, lignes, resteRepete: null };
  const debut = vus.get(r)!;
  return { dev: { negatif, entier, avant: chiffres.slice(0, debut).join(""), periode: chiffres.slice(debut).join("") }, lignes, resteRepete: r };
}

/** Valeur exacte (fraction irréductible) d'un développement. */
export function valeurDeveloppement(d: Developpement): { n: number; d: number } {
  const k = d.avant.length;
  const p = d.periode.length;
  const ia = Number(`${d.entier}${d.avant}` || "0");
  let n: number;
  let den: number;
  if (p === 0) {
    n = ia;
    den = 10 ** k;
  } else {
    n = Number(`${d.entier}${d.avant}${d.periode}`) - ia;
    den = 10 ** k * (10 ** p - 1);
  }
  const g = pgcd(n, den);
  return { n: (d.negatif ? -1 : 1) * (n / g), d: den / g };
}

export function developpementL(d: Developpement): string {
  const signe = d.negatif ? "-" : "";
  if (!d.avant && !d.periode) return `${signe}${d.entier}`;
  return `${signe}${d.entier}{,}${d.avant}${d.periode ? `\\overline{${d.periode}}` : ""}`;
}

export function developpementTexte(d: Developpement): string {
  const signe = d.negatif ? "−" : "";
  if (!d.avant && !d.periode) return `${signe}${d.entier}`;
  return `${signe}${d.entier},${d.avant}${d.periode ? `(${d.periode})` : ""}`;
}

/** Écriture « longue » : la période répétée (« 0,2428571428571… »). */
export function developpementLongL(d: Developpement, chiffres = 12): string {
  if (!d.periode) return developpementL(d);
  let s = d.avant;
  while (s.length < chiffres) s += d.periode;
  return `${d.negatif ? "-" : ""}${d.entier}{,}${s}\\ldots`;
}

export type LectureDecimale = { type: "valeur"; n: number; d: number; dev: Developpement } | { type: "illisible" } | { type: "points" };

/** Lecture d'une écriture décimale saisie : « 0,2(428571) », « 0.2(428571) », « −1,(3) », « 0,25 »,
 * « 3 » ; « … » ou « ... » (écriture coupée) → `points` (à reprendre, sans tentative). */
export function lireDecimale(texte: string): LectureDecimale {
  const s = normaliserSigneMoins(texte).replace(/\s+/g, "").replace(/^[^=]*=/, "");
  if (/…|\.\.\./.test(s)) return { type: "points" };
  const m = s.match(/^([+-]?)(\d+)(?:[,.](\d*)(?:\((\d+)\))?)?$/);
  if (!m) return { type: "illisible" };
  const dev: Developpement = { negatif: m[1] === "-", entier: Number(m[2]), avant: m[3] ?? "", periode: m[4] ?? "" };
  if (dev.avant.length + dev.periode.length > 12 || dev.entier > 1e6) return { type: "illisible" };
  if (/^0+$/.test(dev.periode)) dev.periode = "";
  const v = valeurDeveloppement(dev);
  return { type: "valeur", n: v.n, d: v.d, dev };
}

/** Fraction saisie « a/b » (ou entier) en gardant le numérateur et le dénominateur ÉCRITS (pour juger
 * l'irréductibilité) ; décimal « 0,35 » lu aussi (forme à reprendre). `null` = illisible. */
export function lireFraction(texte: string): { n: number; d: number; ecrit: "fraction" | "entier" | "decimal" } | null {
  const s = normaliserSigneMoins(texte).replace(/\s+/g, "").replace(/^[^=]*=/, "");
  let m = s.match(/^([+-]?)(\d+)\/([+-]?)(\d+)$/);
  if (m) {
    const d = Number(m[4]);
    if (d === 0) return null;
    const signe = (m[1] === "-" ? -1 : 1) * (m[3] === "-" ? -1 : 1);
    return { n: signe * Number(m[2]), d, ecrit: "fraction" };
  }
  m = s.match(/^([+-]?)(\d+)$/);
  if (m) return { n: (m[1] === "-" ? -1 : 1) * Number(m[2]), d: 1, ecrit: "entier" };
  m = s.match(/^([+-]?)(\d+)[,.](\d+)$/);
  if (m) return { n: (m[1] === "-" ? -1 : 1) * Number(m[2] + m[3]), d: 10 ** m[3].length, ecrit: "decimal" };
  return null;
}

export const memeValeur = (a: { n: number; d: number }, b: { n: number; d: number }): boolean => a.n * b.d === b.n * a.d;

/** Le dénominateur (irréductible) n'a-t-il que des facteurs 2 et 5 ? */
export function seulement2et5(den: number): boolean {
  let m = den;
  while (m % 2 === 0) m /= 2;
  while (m % 5 === 0) m /= 5;
  return m === 1;
}
