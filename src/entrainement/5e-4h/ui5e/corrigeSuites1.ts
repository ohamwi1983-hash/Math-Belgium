import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import type { FractionQ } from "../core5e/suitesGeometriques.types";
import { additionnerFractionQ, diviserFractionQ, entierVersFractionQ, fractionQ, multiplierFractionQ, opposeFractionQ, puissanceFractionQ, soustraireFractionQ } from "../generateurs5e/suitesGeometriques/fraction";

/**
 * Briques du corrigé détaillé « comme au tableau » du chapitre 3 de 5e (Suites), moitié 1
 * (5gen14–5gen19) — règle `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé —
 * comme au tableau ». SANS `docx` : importé par les générateurs interactifs ET par les adaptateurs.
 *
 * - Renvois au cours (`COURS_*`, numéros `number` des sections de `content/chapters/5e-4h/suites.ts`).
 * - Rationnels exacts (`FractionQ`, arithmétique de `suitesGeometriques/fraction.ts`) et leur
 *   écriture : `fr` (`\dfrac`), `frT` (`\frac`, dans une fraction), `par` (négatif entre
 *   parenthèses), `signe` (« +7 » / « −7 » à la suite d'un terme), `mono`/`lin` (« 3x », « 3x − 7 »).
 * - `lignesPremierDegre` : équation αx + β = γx + δ résolue ligne à ligne (regrouper, réduire,
 *   diviser — jamais de fraction de fraction : n/d divisé par a s'écrit n/(d × a)).
 * - Décimaux à la virgule (`dec`), nombre écrit dans un texte (`nt`, « − » typographique).
 */

export const COURS_ARITHMETIQUE = "(cours, point 1)";
export const COURS_GEOMETRIQUE = "(cours, point 2)";
export const COURS_CONVERGENCE = "(cours, point 3)";
export const COURS_PROBLEMES = "(cours, point 4)";
export const COURS_COMPARAISON = "(cours, point 5)";
export const COURS_RECURRENTE = "(cours, point 6)";

export type Q = FractionQ;

// ============================================================================
// Rationnels.
// ============================================================================

export const q = (num: number, den = 1): Q => fractionQ(num, den);
export const ent = (n: number): Q => entierVersFractionQ(n);
export const plus = additionnerFractionQ;
export const moins = soustraireFractionQ;
export const fois = multiplierFractionQ;
export const divise = diviserFractionQ;
export const oppose = opposeFractionQ;
export const puiss = puissanceFractionQ;

/** Nombre (flottant d'une instance, rationnel par construction) → fraction exacte, dénominateur ≤ 10 000. */
export function versQ(v: number): Q {
  if (Number.isInteger(v)) return ent(v);
  for (let d = 2; d <= 10000; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-9 * Math.max(1, Math.abs(v))) return q(n, d);
  }
  return ent(Math.round(v));
}

export const estNul = (f: Q) => f.num === 0;
export const estEntier = (f: Q) => f.den === 1;
export const valeur = (f: Q) => f.num / f.den;
export const egal = (a: Q, b: Q) => a.num === b.num && a.den === b.den;
export const abs = (f: Q): Q => ({ num: Math.abs(f.num), den: f.den });
export const inverse = (f: Q): Q => divise(ent(1), f);

/** Écriture exacte : entier, ou `\dfrac` (signe devant). */
export function fr(f: Q): string {
  if (f.den === 1) return `${f.num}`;
  return f.num < 0 ? `-\\dfrac{${-f.num}}{${f.den}}` : `\\dfrac{${f.num}}{${f.den}}`;
}

/** Même chose en `\frac` (à l'intérieur d'une autre fraction, comme le cours : « 6/(1 − 1/3) »). */
export function frT(f: Q): string {
  if (f.den === 1) return `${f.num}`;
  return f.num < 0 ? `-\\frac{${-f.num}}{${f.den}}` : `\\frac{${f.num}}{${f.den}}`;
}

/** Facteur ou terme soustrait : négatif entre parenthèses (« × (−3) », « − (−3) »). */
export function par(f: Q | number): string {
  const g = typeof f === "number" ? versQ(f) : f;
  return g.num < 0 ? `(${fr(g)})` : fr(g);
}

export function parT(f: Q): string {
  return f.num < 0 ? `(${frT(f)})` : frT(f);
}

/** Terme ajouté à la suite d'un autre : « +7 », « −7 », « +\dfrac{3}{4} » ; rien si nul. */
export function signe(f: Q | number): string {
  const g = typeof f === "number" ? versQ(f) : f;
  if (g.num === 0) return "";
  return g.num < 0 ? fr(g) : `+${fr(g)}`;
}

/** Somme de deux nombres écrite (« 5 − 12 », « −3 + 7 ») ; le premier nul n'est pas écrit. */
export function somme(a: Q | number, b: Q | number): string {
  const ga = typeof a === "number" ? versQ(a) : a;
  const gb = typeof b === "number" ? versQ(b) : b;
  if (ga.num === 0) return fr(gb);
  return `${fr(ga)}${signe(gb) || "+0"}`;
}

/** Monôme (« 3x », « x », « −x », « \dfrac{3}{4}x ») ; `""` si le coefficient est nul. */
export function mono(c: Q | number, v = "x"): string {
  const g = typeof c === "number" ? versQ(c) : c;
  if (g.num === 0) return "";
  if (g.den === 1 && g.num === 1) return v;
  if (g.den === 1 && g.num === -1) return `-${v}`;
  return `${fr(g)}${v}`;
}

/** Monôme à la suite d'un autre terme (« +3x », « −x »). */
export function signeMono(c: Q | number, v = "x"): string {
  const m = mono(c, v);
  if (m === "") return "";
  return m.startsWith("-") ? m : `+${m}`;
}

/** Expression du premier degré « ax + b » (a ≠ 0 ; b nul omis). */
export function lin(a: Q | number, b: Q | number, v = "x"): string {
  const m = mono(a, v);
  if (m === "") return fr(typeof b === "number" ? versQ(b) : b);
  return `${m}${signe(b)}`;
}

/** Puissance d'un rationnel : `2^{5}`, `\left(-2\right)^{5}`, `\left(\dfrac{1}{2}\right)^{n-1}`. */
export function puissanceLatex(f: Q, exposant: number | string): string {
  if (f.den === 1 && f.num >= 0) return `${f.num}^{${exposant}}`;
  return `\\left(${fr(f)}\\right)^{${exposant}}`;
}

/** Même chose en `\frac` (à l'intérieur d'une fraction). */
export function puissanceLatexT(f: Q, exposant: number | string): string {
  if (f.den === 1 && f.num >= 0) return `${f.num}^{${exposant}}`;
  return `\\left(${frT(f)}\\right)^{${exposant}}`;
}

// ============================================================================
// Décimaux et textes.
// ============================================================================

/** Décimal en LaTeX, virgule belge, au plus `d` décimales (zéros finaux retirés). */
export function dec(v: number, d = 2): string {
  const r = Math.round(v * 10 ** d) / 10 ** d;
  const t = (Object.is(r, -0) ? 0 : r).toFixed(d).replace(/\.?0+$/, "");
  return t.replace(".", "{,}");
}

/** Le décimal `dec(v, d)` est-il la valeur exacte de v ? */
export function decimalExact(v: number, d = 2): boolean {
  return Math.abs(Math.round(v * 10 ** d) - v * 10 ** d) < 1e-6;
}

/** « =décimal » si l'écriture à `d` décimales est exacte, sinon « ≈décimal ». */
export function vaut(v: number, d = 2): string {
  return `${decimalExact(v, d) ? "=" : "\\approx "}${dec(v, d)}`;
}

/** Nombre écrit dans un texte (justification) : virgule, « − » typographique. */
export function nt(v: number | Q, d = 4): string {
  const x = typeof v === "number" ? v : valeur(v);
  return dec(x, d).replace("{,}", ",").replace("-", "−");
}

/** Fragments « texte formule texte » d'une justification. */
export function jf(...morceaux: (string | { l: string })[]): FragmentConsigne[] {
  return morceaux.map((m) => (typeof m === "string" ? texte(m) : latex(m.l)));
}

/** Plusieurs valeurs d'un résultat : une formule par valeur, séparées par « ; » (une liste dans
 * une seule formule passait à la ligne au milieu de la formule). Chaque valeur est groupée entre
 * accolades : KaTeX ne coupe plus « u₉ = 89 » à son « = » en fin de ligne. */
export function fragmentsListe(valeurs: string[]): FragmentConsigne[] {
  if (valeurs.length === 1) return [latex(valeurs[0])];
  return valeurs.flatMap((v, i) => [...(i === 0 ? [] : [texte(" ; ")]), latex(`{${v}}`)]);
}

/** Justification « on retire c des deux membres » / « on ajoute |c| aux deux membres » (c ≠ 0). */
export function justifRetirer(c: Q): FragmentConsigne[] {
  return c.num > 0 ? jf("on retire ", { l: fr(c) }, " des deux membres") : jf("on ajoute ", { l: fr(abs(c)) }, " aux deux membres");
}

// ============================================================================
// Équation du premier degré.
// ============================================================================

/** Division de `b` par `a` écrite sans fraction de fraction : `\dfrac{b}{a}` (deux entiers),
 * `\dfrac{n}{d\times a}` (b = n/d, a entier) ou `b × 1/a` (a fractionnaire). */
export function quotientLatex(b: Q, a: Q): string {
  if (estEntier(a) && estEntier(b)) return `\\dfrac{${b.num}}{${a.num}}`;
  if (estEntier(a)) return `\\dfrac{${b.num}}{${b.den}\\times ${par(a)}}`;
  return `${par(b)}\\times ${par(inverse(a))}`;
}

/** Justification de la division par a. */
export function justifDiviser(a: Q): FragmentConsigne[] {
  return estEntier(a) ? jf("on divise par ", { l: fr(a) }) : jf("on multiplie par ", { l: fr(inverse(a)) }, ", l'inverse de ", { l: fr(a) });
}

/** a + b réécrits sur le même dénominateur (« \dfrac{704}{2}-\dfrac{689}{2} ») quand leurs
 * dénominateurs diffèrent ; `null` sinon (rien à réécrire). */
export function memeDenominateur(a: Q, b: Q): string | null {
  if (a.den === b.den || estNul(a) || estNul(b)) return null;
  const pg = (x: number, y: number): number => (y === 0 ? x : pg(y, x % y));
  const d = (a.den * b.den) / pg(a.den, b.den);
  const ecrit = (f: Q) => `\\dfrac{${Math.abs(f.num) * (d / f.den)}}{${d}}`;
  return `${a.num < 0 ? "-" : ""}${ecrit(a)}${b.num < 0 ? "-" : "+"}${ecrit(b)}`;
}

/** Lignes qui terminent `a·v = b` (déjà écrite) : division et simplification. */
export function lignesDiviser(a: Q, b: Q, v = "x"): LigneCalcul[] {
  const resultat = divise(b, a);
  if (egal(a, ent(1))) return [];
  if (egal(a, ent(-1))) return [ligne(`${v}=${fr(resultat)}`, "on change le signe des deux membres")];
  const ecrit = quotientLatex(b, a);
  const lignes = [ligne(`${v}=${ecrit}`, justifDiviser(a))];
  if (ecrit !== fr(resultat)) lignes.push(ligne(`=${fr(resultat)}`, estEntier(resultat) ? undefined : "on simplifie"));
  return lignes;
}

/**
 * Résolution de αv + β = γv + δ (équation déjà écrite par l'appelant) : on regroupe, on réduit,
 * on divise. α ≠ γ.
 */
export function lignesPremierDegre(alpha: Q, beta: Q, gamma: Q, delta: Q, v = "x"): LigneCalcul[] {
  const A = moins(alpha, gamma);
  const B = moins(delta, beta);
  const lignes: LigneCalcul[] = [];
  if (!estNul(gamma)) {
    const gauche = `${mono(alpha, v)}${signeMono(oppose(gamma), v)}`;
    const droite = estNul(delta) ? fr(oppose(beta)) : `${fr(delta)}${signe(oppose(beta))}`;
    lignes.push(ligne(`${gauche}=${droite}`, "on regroupe les termes en " + v + " à gauche, les nombres à droite"));
    lignes.push(ligne(`${mono(A, v)}=${fr(B)}`, "on réduit"));
    const md = memeDenominateur(delta, oppose(beta));
    if (md) lignes.splice(1, 0, ligne(`${mono(alpha, v)}${signeMono(oppose(gamma), v)}=${md}`, "même dénominateur"));
  } else if (!estNul(beta)) {
    lignes.push(ligne(`${mono(alpha, v)}=${fr(delta)}${signe(oppose(beta))}`, justifRetirer(beta)));
    const md = memeDenominateur(delta, oppose(beta));
    if (md) lignes.push(ligne(`=${md}`, "même dénominateur"));
    lignes.push(ligne(`=${fr(B)}`));
  }
  return [...lignes, ...lignesDiviser(A, B, v)];
}

/** Nom indicé écrit dans un texte : « u₁₂ », « S₂₀ », « uₙ₊₁ » (jamais « u_12 »). */
export function nomIndice(lettre: string, indice: number | string): string {
  const sub: Record<string, string> = { "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄", "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉", n: "ₙ", "+": "₊", "-": "₋", p: "ₚ", k: "ₖ" };
  return lettre + [...String(indice)].map((c) => sub[c] ?? c).join("");
}

/** Lignes identiques consécutives retirées. */
export function sansDoublons(lignes: LigneCalcul[]): LigneCalcul[] {
  return lignes.filter((l, i) => i === 0 || l.latex !== lignes[i - 1].latex);
}

// ============================================================================
// Suite géométrique : arrondi, somme des n premiers termes.
// ============================================================================

/** Arrondi au centième ajouté après une valeur exacte non entière. */
export function lignesArrondi(v: Q, d = 2): LigneCalcul[] {
  if (estEntier(v)) return [];
  const x = valeur(v);
  return [ligne(`${decimalExact(x, d) ? "=" : "\\approx "}${dec(x, d)}`, decimalExact(x, d) ? "écriture décimale" : d === 3 ? "arrondi au millième" : "arrondi au centième")];
}

/** S_N = u₁ (1 − q^N)/(1 − q), calculée en fractions exactes (inner `\frac`, comme le cours). */
export function lignesSommeGeometrique(N: number, u1: Q, q: Q, d = 2): LigneCalcul[] {
  const qN = puiss(q, N);
  const A = moins(ent(1), qN);
  const B = moins(ent(1), q);
  const F = divise(A, B);
  const s = fois(u1, F);
  const u1L = fr(u1);
  const lignes: LigneCalcul[] = [
    ligne(`S_{${N}}=u_1\\times\\dfrac{1-q^{${N}}}{1-q}`, `somme des ${N} premiers termes`),
    ligne(`=${u1L}\\times\\dfrac{1-${puissanceLatexT(q, N)}}{1-${parT(q)}}`, "on remplace u₁ et q"),
    ligne(`=${u1L}\\times\\dfrac{1-${parT(qN)}}{1-${parT(q)}}`, "on calcule la puissance"),
    ligne(`=${u1L}\\times\\dfrac{${frT(A)}}{${frT(B)}}`, "on calcule le numérateur et le dénominateur"),
  ];
  if (estEntier(B) && estEntier(A)) {
    if (!egal(F, A) || B.num !== 1) lignes.push(ligne(`=${u1L}\\times ${par(F)}`, "on divise"));
  } else if (!estEntier(B)) {
    lignes.push(ligne(`=${u1L}\\times ${par(A)}\\times ${par(inverse(B))}`, jf("diviser par ", { l: fr(B) }, ", c'est multiplier par ", { l: fr(inverse(B)) })));
    lignes.push(ligne(`=${u1L}\\times ${par(F)}`, "on multiplie"));
  } else {
    lignes.push(ligne(`=${u1L}\\times ${par(F)}`, "on divise"));
  }
  lignes.push(ligne(`=${fr(s)}`, egal(u1, ent(1)) ? undefined : "on multiplie"));
  return [...dedoublonner(lignes), ...lignesArrondi(s, d)];
}

/** Lignes consécutives identiques (à `\\frac`/`\\dfrac` près) retirées. */
export function dedoublonner(lignes: LigneCalcul[]): LigneCalcul[] {
  return lignes.filter((l, i) => i === 0 || l.latex.replace(/\\frac/g, "\\dfrac") !== lignes[i - 1].latex.replace(/\\frac/g, "\\dfrac"));
}
