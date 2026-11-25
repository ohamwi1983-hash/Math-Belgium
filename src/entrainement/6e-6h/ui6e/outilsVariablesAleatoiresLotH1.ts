import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";

/**
 * Briques communes des générateurs 6gen110–6gen115 (6e ch. 8 « Variables aléatoires », lot H1) :
 * rationnels EXACTS (petits entiers : densités, probabilités, espérances), écritures décimales à la
 * française (`{,}` en KaTeX, « , » et « − » en texte), tableau de loi en KaTeX (papier) et en
 * chaînes (écran), renvois au cours. Sans `docx` : importé par les écrans, les corrigés et les
 * adaptateurs papier.
 */

export const COURS = (n: number) => `(cours, § ${n})`;

export const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];

// ============================================================================
// Rationnels
// ============================================================================

export interface Q {
  n: number;
  d: number;
}

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) [a, b] = [b, a % b];
  return a || 1;
}

export function q(n: number, d = 1): Q {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  return { n: n / g, d: d / g };
}

/** Décimal court (au plus 6 décimales) → rationnel exact. */
export function qDec(v: number): Q {
  const m = Math.round(v * 1e6);
  return q(m, 1e6);
}

export const plus = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const moins = (a: Q, b: Q) => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const fois = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
export const div = (a: Q, b: Q) => q(a.n * b.d, a.d * b.n);
export const val = (a: Q) => a.n / a.d;
export const egalQ = (a: Q, b: Q) => a.n === b.n && a.d === b.d;

/** Le rationnel a-t-il une écriture décimale finie d'au plus `max` décimales ? */
export function decimalesFinies(a: Q, max = 6): number | null {
  let d = a.d;
  let k2 = 0;
  let k5 = 0;
  while (d % 2 === 0) {
    d /= 2;
    k2++;
  }
  while (d % 5 === 0) {
    d /= 5;
    k5++;
  }
  if (d !== 1) return null;
  const k = Math.max(k2, k5);
  return k <= max ? k : null;
}

// ============================================================================
// Écritures
// ============================================================================

/** Décimal en LaTeX (`{,}`, espace fine des milliers), sans zéros inutiles. */
export function dl(v: number, chiffres = 6): string {
  const r = Number((Math.round(v * 10 ** chiffres) / 10 ** chiffres).toFixed(chiffres));
  const s = String(Math.abs(r));
  const [ent, dec] = s.split(".");
  const entier = ent.length > 4 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : ent;
  return `${r < 0 ? "-" : ""}${entier}${dec ? `{,}${dec}` : ""}`;
}

/** Décimal en texte brut (« 0,15 », « −2,5 », « 12 500 »). */
export function dt(v: number, chiffres = 6): string {
  return dl(v, chiffres).replace("{,}", ",").replace(/\\,/g, " ").replace(/^-/, "−");
}

/** Décimal en LaTeX, entre parenthèses s'il est négatif (facteur d'un produit, base d'une puissance). */
export function dlp(v: number): string {
  return v < 0 ? `(${dl(v)})` : dl(v);
}

/** Rationnel en LaTeX : entier, ou `\dfrac{a}{b}` (signe devant). */
export function ql(a: Q): string {
  if (a.d === 1) return `${a.n}`;
  return `${a.n < 0 ? "-" : ""}\\dfrac{${Math.abs(a.n)}}{${a.d}}`;
}

/** Rationnel en LaTeX : décimal s'il est court (au plus 4 décimales), sinon fraction. */
export function qdl(a: Q): string {
  const k = decimalesFinies(a, 4);
  return k === null ? ql(a) : dl(val(a));
}

/** « \dfrac{3}{8}=0{,}375 » (fraction puis décimal court) ou la fraction seule. */
export function qAvecDec(a: Q): string {
  const k = decimalesFinies(a, 4);
  if (a.d === 1 || k === null) return ql(a);
  return `${ql(a)}=${dl(val(a))}`;
}

/** Somme de termes décimaux écrite « a+b-c » (un terme négatif s'écrit avec « − »). */
export function sommeLatex(termes: number[]): string {
  return termes.map((v, i) => (i === 0 ? dl(v) : v < 0 ? dl(v) : `+${dl(v)}`)).join("");
}

/** Tableau de loi en KaTeX (une ligne « x », une ligne « P(X = x) »). */
export function tableauLoiLatex(valeurs: number[], probas: string[], nom = "X", ligne2?: string): string {
  const cols = "c|" + valeurs.map(() => "c").join("");
  return `\\begin{array}{${cols}}x_i&${valeurs.map((v) => dl(v)).join("&")}\\\\\\hline ${ligne2 ?? `P(${nom}=x_i)`}&${probas.join("&")}\\end{array}`;
}

/** Texte suivi d'une formule affichée (papier) : le dernier point du texte devient « : » (la formule
 * annoncée passe alors en display, `fragmentsEnteteHtml`). */
export function texteAvantFormule(f: Frag[]): Frag[] {
  const out = [...f];
  const k = out.length - 1;
  const d = out[k];
  if (d && d.type === "texte") out[k] = { type: "texte", valeur: d.valeur.replace(/\.\s*$/, " :") };
  return out;
}

/** Arrondi d'un réel à `d` décimales. */
export const arrondi = (v: number, d: number) => Math.round(v * 10 ** d + (v >= 0 ? 1e-9 : -1e-9)) / 10 ** d;
