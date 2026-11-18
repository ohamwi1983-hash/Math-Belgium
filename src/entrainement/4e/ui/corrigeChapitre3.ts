import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";
import { formatFractionIrreductible } from "./formatFraction";

/**
 * Briques partagées des corrigés détaillés « comme au tableau » du chapitre 3 de 4e
 * (« Caractéristiques des fonctions de référence », gen10–13, gen68–72) — règle
 * `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé — comme au tableau ».
 * Écritures EXACTES (fractions irréductibles, radicaux simplifiés), « − » typographique (LaTeX « - »),
 * virgule décimale `{,}`. Aucune dépendance à `docx` : importé par les générateurs interactifs.
 */

export type Fragments = FragmentConsigne[];

/** Renvois au cours (sections numérotées du chapitre `caracteristiques-fonctions-reference.ts`). */
export const COURS_FAMILLES = "(cours, « Avant de commencer »)";
export const COURS_LECTURE = "(cours, § 1)";
export const COURS_ALGEBRE = "(cours, § 2)";
export const COURS_TRANSFORMATIONS = "(cours, § 3)";

function net(v: number): number {
  return Object.is(v, -0) || Math.abs(v) < 1e-12 ? 0 : v;
}

/** Nombre exact en LaTeX : entier, fraction irréductible (`\dfrac`), sinon décimal à virgule. */
export function q(valeur: number): string {
  const v = net(valeur);
  if (v === Infinity) return "+\\infty";
  if (v === -Infinity) return "-\\infty";
  const brut = formatFractionIrreductible(v, 5000);
  const m = /^(-?)(\d+)\/(\d+)$/.exec(brut);
  if (m) return `${m[1]}\\dfrac{${m[2]}}{${m[3]}}`;
  if (/^-?\d+$/.test(brut)) return brut;
  return String(Math.round(v * 1e6) / 1e6).replace(".", "{,}");
}

/** Même nombre, entre parenthèses s'il est négatif (facteur, terme soustrait, base d'une puissance). */
export function qp(valeur: number): string {
  return net(valeur) < 0 ? `(${q(valeur)})` : q(valeur);
}

/** Terme constant ajouté : « + 3 », « - \dfrac{1}{2} », « » si nul. */
export function plusQ(valeur: number): string {
  const v = net(valeur);
  if (v === 0) return "";
  return v > 0 ? `+${q(v)}` : `-${q(-v)}`;
}

/** Monôme `coef·partie` en tête d'expression : « 3x », « -x », « x », « \dfrac{1}{2}x » (partie vide : le nombre). */
export function mono(coef: number, partie = ""): string {
  const c = net(coef);
  if (partie === "") return q(c);
  if (c === 1) return partie;
  if (c === -1) return `-${partie}`;
  return `${q(c)}${partie}`;
}

/** Somme de monômes `[coef, partie]` (coefficients nuls omis), signes fusionnés. */
export function somme(termes: [number, string][]): string {
  let s = "";
  for (const [c0, partie] of termes) {
    const c = net(c0);
    if (c === 0) continue;
    if (s === "") s = mono(c, partie);
    else s += c > 0 ? `+${mono(c, partie)}` : `-${mono(-c, partie)}`;
  }
  return s === "" ? "0" : s;
}

/** `ax + b` dans la variable `x`. */
export function lineaire(a: number, b: number, x = "x"): string {
  return somme([
    [a, x],
    [b, ""],
  ]);
}

/** Polynôme de coefficients décroissants (`[A, B, C]` → `Ax^2+Bx+C`). */
export function polynome(coefs: number[], x = "x"): string {
  const deg = coefs.length - 1;
  return somme(coefs.map((c, i): [number, string] => [c, deg - i === 0 ? "" : deg - i === 1 ? x : `${x}^${deg - i}`]));
}

/** `x - h` (`x + |h|`, ou `x` si h = 0). */
export function moinsH(h: number, x = "x"): string {
  const v = net(h);
  if (v === 0) return x;
  return v > 0 ? `${x}-${q(v)}` : `${x}+${q(-v)}`;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** √n = k√m (m sans facteur carré). */
export function racineSimplifiee(n: number): { k: number; m: number } {
  let k = 1;
  let m = n;
  for (let d = 2; d * d <= m; d++) {
    while (m % (d * d) === 0) {
      m /= d * d;
      k *= d;
    }
  }
  return { k, m };
}

/** Rationnel exact d'un nombre (dénominateur ≤ 5000), `null` sinon. */
export function rationnel(v: number): { n: number; d: number } | null {
  for (let d = 1; d <= 5000; d++) {
    const n = v * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) {
      const g = pgcd(Math.round(n), d) || 1;
      return { n: Math.round(n) / g, d: d / g };
    }
  }
  return null;
}

/** Racine carrée exacte d'un rationnel positif, en LaTeX (« \dfrac{5}{4} », « 2\sqrt{3} », « \dfrac{\sqrt{6}}{3} »). */
export function racineCarreeLatex(v: number): string {
  const r = rationnel(v);
  if (!r || r.n < 0) return `\\sqrt{${q(v)}}`;
  // √(n/d) = √(n·d)/d
  const { k, m } = racineSimplifiee(r.n * r.d);
  if (m === 1) return q(k / r.d);
  const g = pgcd(k, r.d);
  const kk = k / g;
  const dd = r.d / g;
  const rad = `${kk === 1 ? "" : kk}\\sqrt{${m}}`;
  return dd === 1 ? rad : `\\dfrac{${rad}}{${dd}}`;
}

/** Racine cubique exacte (rationnel cube parfait), sinon `\sqrt[3]{…}`. */
export function racineCubiqueLatex(v: number): string {
  const c = Math.cbrt(v);
  const r = rationnel(c);
  if (r && Math.abs((r.n / r.d) ** 3 - v) < 1e-9) return q(r.n / r.d);
  return `\\sqrt[3]{${q(v)}}`;
}

/**
 * Résolution d'une équation du premier degré `a·x + b = V` (une transformation par ligne) :
 * on soustrait b, puis on divise par a. La ligne de départ est incluse si `avecDepart`.
 */
export function lignesPremierDegre(a: number, b: number, V: number, x = "x", avecDepart = true): LigneCalcul[] {
  const lignes: LigneCalcul[] = [];
  if (avecDepart) lignes.push(ligne(`${lineaire(a, b, x)}=${q(V)}`));
  const reste = net(V - b);
  if (net(b) !== 0) {
    lignes.push(ligne(`${mono(a, x)}=${q(V)}${b > 0 ? "-" : "+"}${q(Math.abs(b))}`, b > 0 ? `on soustrait ${nombreTexte(b)} aux deux membres` : `on ajoute ${nombreTexte(-b)} aux deux membres`));
    lignes.push(ligne(`=${q(reste)}`));
  }
  if (net(a) !== 1) {
    // Reste fractionnaire n/d : x = n / (d·a), jamais une fraction de fraction.
    const r = rationnel(reste);
    const quotient = r && r.d > 1 ? `\\dfrac{${r.n}}{${r.d}\\cdot ${qp(a)}}` : `\\dfrac{${q(reste)}}{${q(a)}}`;
    lignes.push(ligne(`${x}=${quotient}`, `on divise les deux membres par ${nombreTexte(a)}`));
    const sol = reste / a;
    if (quotient !== q(sol)) lignes.push(ligne(`=${q(sol)}`));
  }
  return lignes;
}

/** Texte d'une valeur dans une justification (pas de LaTeX) : « −3 », « 5/4 », « 2,5 ». */
export function nombreTexte(valeur: number): string {
  const v = net(valeur);
  const brut = formatFractionIrreductible(v, 5000);
  const s = /^-?\d+(\/\d+)?$/.test(brut) ? brut : String(Math.round(v * 1e6) / 1e6).replace(".", ",");
  return s.replace(/^-/, "−");
}

function normaliser(l: string): string {
  return l.replace(/\\dfrac|\\tfrac/g, "\\frac").replace(/\\left|\\right/g, "").replace(/\s+/g, "");
}

/** Retire une ligne qui ne fait que répéter la précédente (même membre de droite, `\dfrac`/`\frac` et
 * espaces près) ; sa justification passe sur la ligne gardée. */
export function sansDoublons(lignes: LigneCalcul[]): LigneCalcul[] {
  const out: LigneCalcul[] = [];
  for (const l of lignes) {
    const prec = out[out.length - 1];
    if (prec && l.latex.startsWith("=")) {
      const i = prec.latex.indexOf("=");
      const droitePrec = i >= 0 ? prec.latex.slice(i + 1) : prec.latex;
      if (normaliser(droitePrec) === normaliser(l.latex.slice(1))) {
        if (l.justification) out[out.length - 1] = { ...prec, justification: l.justification };
        continue;
      }
    }
    out.push(l);
  }
  return out;
}
