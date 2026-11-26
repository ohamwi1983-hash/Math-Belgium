import { normaliserSigneMoins } from "../../../../lib/normaliserSaisie";
import { pgcd, q } from "../../../5e-4h/ui5e/nombresTrigo";
import type { Q } from "../../../5e-4h/ui5e/nombresTrigo";

/**
 * Outils communs aux générateurs 56gen14–56gen19 (5e (6h), « Nombres réels et suites », partie « Les
 * nombres réels », chantier E1) : tirages (`Math.random()` seul, pour que le `?code=` rejoue le
 * tirage), décomposition en facteurs premiers (calcul, écriture KaTeX, lecture d'une saisie libre),
 * racines simplifiées, rationnels en KaTeX. Une seule source pour l'écran, le corrigé et le papier.
 */

// ============================================================================
// Tirages.
// ============================================================================

export const ent = (a: number, b: number): number => a + Math.floor(Math.random() * (b - a + 1));

export function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

export function melanger<T>(t: readonly T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

// ============================================================================
// Facteurs premiers.
// ============================================================================

export function estPremier(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

/** Décomposition en facteurs premiers, exposants regroupés, bases croissantes ([[2, 3], [3, 2]] pour 72). */
export function decomposer(n: number): [number, number][] {
  const r: [number, number][] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    let e = 0;
    while (m % p === 0) {
      m /= p;
      e++;
    }
    if (e > 0) r.push([p, e]);
  }
  if (m > 1) r.push([m, 1]);
  return r;
}

/** « 2^{3}\cdot 3^{2} » (exposant 1 non écrit). */
export function decompositionL(f: readonly [number, number][]): string {
  return f.map(([p, e]) => (e === 1 ? `${p}` : `${p}^{${e}}`)).join("\\cdot ");
}

/** « 2³ · 3² » (texte brut : fiches, barème). */
export function decompositionTexte(f: readonly [number, number][]): string {
  const sup = (e: number) => `${e}`.replace(/\d/g, (c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(c)]);
  return f.map(([p, e]) => (e === 1 ? `${p}` : `${p}${sup(e)}`)).join(" · ");
}

export interface LectureDecomposition {
  /** Facteurs regroupés par base (bases croissantes). */
  facteurs: [number, number][];
  valeur: number;
  /** Toutes les bases sont-elles premières ? */
  tousPremiers: boolean;
}

const EXPOSANTS_UNICODE: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9" };

/**
 * Lecture libre d'une décomposition : « 2^3*3^2 », « 2³·3² », « 2 × 2 × 2 × 3 × 3 », « 2^3 . 3^2 »,
 * « 2³ x 3² », préfixe « 72 = » ignoré, « ^(3) » et « ^{3} » lus. `null` = illisible.
 */
export function lireDecomposition(texte: string): LectureDecomposition | null {
  let s = normaliserSigneMoins(texte).trim();
  s = s.replace(/^[^=]*=/, "").trim();
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => "^" + [...m].map((c) => EXPOSANTS_UNICODE[c]).join(""));
  s = s.replace(/\^\s*[({]\s*(\d+)\s*[)}]/g, "^$1");
  if (s === "") return null;
  const morceaux = s.split(/\s*(?:[·*×xX.∙•⋅]|\\cdot|\\times)\s*|\s+/).filter((m) => m !== "");
  if (morceaux.length === 0) return null;
  const parBase = new Map<number, number>();
  for (const m of morceaux) {
    const r = m.match(/^(\d+)(?:\^(\d+))?$/);
    if (!r) return null;
    const p = Number(r[1]);
    const e = r[2] === undefined ? 1 : Number(r[2]);
    if (p < 1 || e < 1 || e > 30) return null;
    parBase.set(p, (parBase.get(p) ?? 0) + e);
  }
  const facteurs = [...parBase.entries()].filter(([p]) => p !== 1).sort((a, b) => a[0] - b[0]);
  const valeur = facteurs.reduce((v, [p, e]) => v * p ** e, 1);
  return { facteurs, valeur, tousPremiers: facteurs.length > 0 && facteurs.every(([p]) => estPremier(p)) };
}

// ============================================================================
// Racines et rationnels.
// ============================================================================

/** n = c^k · r avec r sans facteur puissance k-ième (n > 0). */
export function racineSimplifiee(n: number, k = 2): { c: number; r: number } {
  let c = 1;
  let r = 1;
  for (const [p, e] of decomposer(n)) {
    c *= p ** Math.floor(e / k);
    r *= p ** (e % k);
  }
  return { c, r };
}

export const racineSymbole = (k: number, x: string): string => (k === 2 ? `\\sqrt{${x}}` : `\\sqrt[${k}]{${x}}`);

/** c·ᵏ√r en KaTeX (« 2\sqrt{3} », « \sqrt[3]{2} », « 5 »). */
export function racineL(c: number, r: number, k = 2): string {
  if (r === 1) return `${c}`;
  return `${c === 1 ? "" : c}${racineSymbole(k, `${r}`)}`;
}

/** Rationnel en KaTeX, fraction `\dfrac`, signe sorti (« -\dfrac{3}{2} »). */
export function qL(a: Q): string {
  if (a.d === 1) return `${a.n}`;
  return `${a.n < 0 ? "-" : ""}\\dfrac{${Math.abs(a.n)}}{${a.d}}`;
}

/** Rationnel en texte brut (« 3/2 », « −1/2 »). */
export function qTexte(a: Q): string {
  const s = a.d === 1 ? `${Math.abs(a.n)}` : `${Math.abs(a.n)}/${a.d}`;
  return a.n < 0 ? `−${s}` : s;
}

/** Entier en texte brut avec « − » typographique. */
export const nT = (n: number): string => `${n}`.replace("-", "−");

/** Entier entre parenthèses s'il est négatif (« (-3) »). */
export const parN = (n: number): string => (n < 0 ? `(${n})` : `${n}`);

export { pgcd, q };
export type { Q };
