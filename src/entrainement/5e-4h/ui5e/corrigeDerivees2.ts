import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import { finaliser, lignesValeur, monomeLatex, polyLatex, type Monome } from "./corrigeLimites";
import { approche, dec, decimalExact, pgcd, q, qAdd, qMul, qVal, sansDoublons, type Q } from "./corrigeTrigonometrie1";

/**
 * Briques du corrigé détaillé « comme au tableau » du chapitre 5 de 5e (« Dérivées et
 * applications »), moitié 2 : 5gen31 (étudier une fonction), 5gen32 (optimisation géométrique),
 * 5gen33 (contexte économique), 5gen34 (extrema en contexte borné), 5gen35 (vitesse et position) —
 * règle `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé — comme au tableau ». SANS
 * `docx` : importé par les générateurs interactifs ET par les adaptateurs.
 *
 * - Renvois au cours (`COURS_*`, numéros `number` des sections de
 *   `content/chapters/5e-4h/derivees-applications.ts`).
 * - Polynômes à coefficients entiers ASCENDANTS (indice = degré) dans une variable quelconque (x, t,
 *   q, r) : dérivée terme à terme sur deux lignes (« 3·2x² − 2·3x + 5 », puis réduite), valeur en un
 *   point entier (`lignesValeur` de `corrigeLimites.ts` : substitution, termes, somme) ou rationnel
 *   (`lignesValeurQ` : termes en fractions, même dénominateur).
 * - Trinôme ax² + bx + c = 0 (`lignesTrinome`) : discriminant, racines exactes (carré parfait ou
 *   radical simplifié, √(4r) = 2√r), aucune racine si Δ < 0.
 * - Signe par valeurs test (`valeurTest`, `pointsTest`) : un nombre (entier si possible) dans chaque
 *   intervalle délimité par les racines et les valeurs exclues.
 */

export const COURS_REGLES = "(cours, point 3)";
export const COURS_SIGNE = "(cours, point 4)";
export const COURS_LOCALE = "(cours, point 5)";
export const COURS_ETUDIER = "(cours, point 7)";
export const COURS_OPTIMISATION = "(cours, point 8)";
export const COURS_ECONOMIQUE = "(cours, point 9)";
export const COURS_BORNE = "(cours, point 10)";
export const COURS_VITESSE = "(cours, point 11)";

export type Fragments = FragmentConsigne[];
export const t = texte;
export const f = latex;
export { finaliser, ligne, sansDoublons, approche, dec, decimalExact, pgcd, q, qAdd, qMul, qVal, type Q };

// ============================================================================
// Nombres.
// ============================================================================

/** Entier dans une phrase : vrai signe moins. */
export function nbT(n: number): string {
  return dec(n, 4).replace("{,}", ",").replace("-", "−");
}

/** Entier ou décimal entre parenthèses s'il est négatif (facteur d'un produit, base d'une puissance). */
export function parN(n: number, d = 4): string {
  return n < 0 ? `(${dec(n, d)})` : dec(n, d);
}

/** Fraction réduite (« -\dfrac{3}{4} », « 2 »). */
export function qL(x: Q, inner = false): string {
  if (x.d === 1) return `${x.n}`;
  const fr = inner ? "\\frac" : "\\dfrac";
  return `${x.n < 0 ? "-" : ""}${fr}{${Math.abs(x.n)}}{${x.d}}`;
}

/** Fraction entre parenthèses si elle est négative ou n'est pas entière (base d'une puissance). */
export function qPar(x: Q): string {
  const s = qL(x);
  if (x.d !== 1) return `\\left(${s}\\right)`;
  return x.n < 0 ? `(${s})` : s;
}

/** « = 3,5 » si l'écriture à `d` décimales est exacte, sinon « \approx 3,47 ». */
export function egalApprox(v: number, d = 2): string {
  return decimalExact(v, d) ? `=${dec(v, d)}` : `\\approx ${approche(v, d)}`;
}

/** « = » ou « ≈ » seul. */
export function relation(v: number, d = 2): string {
  return decimalExact(v, d) ? "=" : "\\approx ";
}

// ============================================================================
// Polynômes (coefficients ascendants).
// ============================================================================

/** Polynôme dans la variable `v` (« 2t^{3}-6t+1 »). */
export function polyV(p: number[], v = "x"): string {
  return polyLatex(p, v);
}

/** Monômes non nuls par degrés décroissants (ordre d'écriture de `polyV`). */
export function monomesDecroissants(p: number[]): Monome[] {
  const m: Monome[] = [];
  for (let d = p.length - 1; d >= 0; d--) if (p[d]) m.push({ c: p[d], d });
  return m;
}

export function deriveePoly(p: number[]): number[] {
  const r = p.slice(1).map((c, i) => c * (i + 1));
  return r.length ? r : [0];
}

export function evalPoly(p: number[], x: number): number {
  let s = 0;
  for (let i = p.length - 1; i >= 0; i--) s = s * x + p[i];
  return s;
}

export function evalPolyQ(p: number[], x: Q): Q {
  let s = q(0);
  for (let i = p.length - 1; i >= 0; i--) s = qAdd(qMul(s, x), q(p[i]));
  return s;
}

/** Terme « n·a·v^{n−1} » de la dérivée de a·vⁿ, avec son signe (« -2\cdot 3x », « +5 », « 3x^{2} »). */
function termeDerive(c: number, n: number, v: string, premier: boolean): string {
  const signe = c < 0 ? "-" : premier ? "" : "+";
  const abs = Math.abs(c);
  const puissance = n - 1 === 0 ? "" : n - 1 === 1 ? v : `${v}^{${n - 1}}`;
  if (n === 1) return `${signe}${abs}`;
  if (abs === 1) return `${signe}${n}${puissance}`;
  return `${signe}${n}\\cdot ${abs}${puissance}`;
}

/**
 * Dérivée d'un polynôme, terme à terme : « gauche = 3·2x² − 2·3x + 5 » (règle (a·xⁿ)′ = n·a·xⁿ⁻¹,
 * constante → 0), puis « = 6x² − 6x + 5 ». `justification` : règle de la première ligne.
 */
export function lignesDeriveePoly(gauche: string, p: number[], v = "x", justification: string | Fragments = [t("terme à terme : "), f("(a\\,x^{n})'=n\\,a\\,x^{n-1}"), t(", une constante a pour dérivée 0")]): LigneCalcul[] {
  let brut = "";
  for (let n = p.length - 1; n >= 1; n--) if (p[n]) brut += termeDerive(p[n], n, v, brut === "");
  if (brut === "") brut = "0";
  return sansDoublons([ligne(`${gauche}=${brut}`, justification), ligne(`=${polyV(deriveePoly(p), v)}`, "on calcule chaque produit")]);
}

/** Valeur d'un polynôme en un ENTIER : substitution, termes, somme (`lignesValeur`). */
export function lignesValeurPoly(gauche: string, p: number[], x: number, justification?: string | Fragments, v = "x"): { lignes: LigneCalcul[]; valeur: number } {
  return lignesValeur(gauche, monomesDecroissants(p), x, justification ?? `on remplace ${v} par ${nbT(x)}`);
}

/** Valeur d'un polynôme en un RATIONNEL p/q : substitution (puissances de la fraction), termes en
 * fractions, même dénominateur, somme réduite. */
export function lignesValeurQ(gauche: string, p: number[], x: Q, v = "x"): { lignes: LigneCalcul[]; valeur: Q } {
  const m = monomesDecroissants(p);
  const base = qPar(x);
  const sub = m
    .map(({ c, d }, i) => {
      const signe = c < 0 ? "-" : i === 0 ? "" : "+";
      if (d === 0) return `${signe}${Math.abs(c)}`;
      const puiss = d === 1 ? base : `${base}^{${d}}`;
      return `${signe}${Math.abs(c) === 1 ? "" : `${Math.abs(c)}\\cdot `}${puiss}`;
    })
    .join("");
  const termes = m.map(({ c, d }) => qMul(q(c), q(x.n ** d, x.d ** d)));
  const termesL = termes.map((x, i) => (i === 0 ? qL(x) : x.n < 0 ? qL(x) : `+${qL(x)}`)).join("");
  const den = termes.reduce((acc, x) => (acc * x.d) / pgcd(acc, x.d), 1);
  const nums = termes.map((x) => (x.n * den) / x.d);
  const memeDen = `\\dfrac{${nums.map((n, i) => (i === 0 ? `${n}` : n < 0 ? `${n}` : `+${n}`)).join("")}}{${den}}`;
  const valeur = termes.reduce((s, x) => qAdd(s, x), q(0));
  const lignes = sansDoublons([
    ligne(`${gauche}=${sub}`, `on remplace ${v} par ${qL(x).startsWith("-") || x.d !== 1 ? "cette fraction" : nbT(x.n)}`),
    ligne(`=${termesL}`, "on calcule chaque terme"),
    ...(den > 1 ? [ligne(`=${memeDen}`, `même dénominateur ${den}`)] : []),
    ligne(`=${qL(valeur)}`),
  ]);
  return { lignes, valeur };
}

// ============================================================================
// Trinôme du second degré.
// ============================================================================

/** Racine d'un trinôme : exacte (rationnelle) ou (n ± k√m)/d irréductible. */
export type RacineTrinome = { exacte: true; v: Q } | { exacte: false; n: number; k: number; m: number; d: number; signe: 1 | -1 };

export function valeurRacine(r: RacineTrinome): number {
  return r.exacte ? qVal(r.v) : (r.n + r.signe * r.k * Math.sqrt(r.m)) / r.d;
}

/** Radical simplifié : √N = k√m (m sans facteur carré). */
export function simplifierRadical(N: number): { k: number; m: number } {
  let k = 1;
  let m = N;
  for (let p = 2; p * p <= m; p++) while (m % (p * p) === 0) {
    m /= p * p;
    k *= p;
  }
  return { k, m };
}

export function racineL(r: RacineTrinome): string {
  if (r.exacte) return qL(r.v);
  const rad = `${r.k === 1 ? "" : r.k}\\sqrt{${r.m}}`;
  const num = r.n === 0 ? `${r.signe < 0 ? "-" : ""}${rad}` : `${r.n}${r.signe < 0 ? "-" : "+"}${rad}`;
  return r.d === 1 ? num : `\\dfrac{${num}}{${r.d}}`;
}

/**
 * Résolution de A·v² + B·v + C = 0 (entiers, A ≠ 0) : Δ = B² − 4AC (une ligne de substitution, une
 * ligne de valeur), puis les racines (formule, valeur de √Δ, simplification). `noms` : indices des
 * racines (« x_1 », « x_2 », ou « t_1 »…), la plus PETITE d'abord quand A > 0. Δ < 0 : aucune racine.
 */
export function lignesTrinome(A: number, B: number, C: number, v = "x"): { lignes: LigneCalcul[]; racines: RacineTrinome[]; delta: number } {
  const delta = B * B - 4 * A * C;
  const lignes: LigneCalcul[] = [ligne(`\\Delta=${parN(B)}^{2}-4\\cdot ${parN(A)}\\cdot ${parN(C)}`, [t("discriminant : "), f("\\Delta=b^2-4ac")]), ligne(`=${delta}`)];
  if (delta < 0) {
    lignes.push(ligne(`\\Delta=${delta}<0`, "aucune racine réelle"));
    return { lignes: sansDoublons(lignes), racines: [], delta };
  }
  const deuxA = 2 * A;
  if (delta === 0) {
    const r = q(-B, deuxA);
    lignes.push(ligne(`${v}_0=\\dfrac{${-B}}{${deuxA}}`, [t("racine double : "), f("\\frac{-b}{2a}")]));
    if (r.d !== deuxA || r.n !== -B) lignes.push(ligne(`=${qL(r)}`));
    return { lignes: sansDoublons(lignes), racines: [{ exacte: true, v: r }], delta };
  }
  const { k, m } = simplifierRadical(delta);
  const racines: RacineTrinome[] = [];
  // Ordre croissant : avec A > 0, « − √Δ » donne la plus petite racine.
  const signes: (1 | -1)[] = A > 0 ? [-1, 1] : [1, -1];
  signes.forEach((s, i) => {
    const nom = `${v}_${i + 1}`;
    const pm = s < 0 ? "-" : "+";
    lignes.push(ligne(`${nom}=\\dfrac{${-B}${pm}\\sqrt{${delta}}}{${deuxA}}`, i === 0 ? [f(`${v}=\\frac{-b\\pm\\sqrt{\\Delta}}{2a}`)] : undefined));
    if (m === 1) {
      const sq = k;
      const num = -B + s * sq;
      lignes.push(ligne(`=\\dfrac{${num}}{${deuxA}}`, i === 0 ? [t("car "), f(`\\sqrt{${delta}}=${sq}`)] : undefined));
      const r = q(num, deuxA);
      lignes.push(ligne(`=${qL(r)}`));
      racines.push({ exacte: true, v: r });
    } else {
      lignes.push(ligne(`=\\dfrac{${-B}${pm}${k === 1 ? "" : k}\\sqrt{${m}}}{${deuxA}}`, i === 0 ? [t("car "), f(`\\sqrt{${delta}}=\\sqrt{${k * k}\\cdot ${m}}=${k}\\sqrt{${m}}`)] : undefined));
      const g = pgcd(pgcd(B, k), deuxA);
      const sg = deuxA / g < 0 ? -1 : 1;
      const r: RacineTrinome = { exacte: false, n: (sg * -B) / g, k: Math.abs(k / g), m, d: Math.abs(deuxA / g), signe: (s * sg) as 1 | -1 };
      if (g !== 1 || sg < 0) lignes.push(ligne(`=${racineL(r)}`, g !== 1 ? `on simplifie par ${g}` : undefined));
      lignes.push(ligne(`\\approx ${approche(valeurRacine(r), 2)}`));
      racines.push(r);
    }
  });
  return { lignes: sansDoublons(lignes), racines, delta };
}

// ============================================================================
// Signe par valeurs test.
// ============================================================================

/** Un nombre de l'intervalle ]g ; d[ (bornes infinies permises) : un entier si possible, sinon le milieu. */
export function valeurTest(g: number, d: number): number {
  if (!Number.isFinite(g)) return Math.ceil(d - 1e-9) - 1;
  if (!Number.isFinite(d)) return Math.floor(g + 1e-9) + 1;
  const milieu = (g + d) / 2;
  let best: number | null = null;
  for (let k = Math.ceil(g); k <= Math.floor(d); k++) if (k > g + 1e-9 && k < d - 1e-9 && (best === null || Math.abs(k - milieu) < Math.abs(best - milieu))) best = k;
  return best ?? milieu;
}

/** Valeurs test d'intervalles délimités par des points triés (bornes −∞ et +∞ ajoutées, ou bornes données). */
export function pointsTest(points: number[], gauche = -Infinity, droite = Infinity): number[] {
  const bornes = [gauche, ...[...points].sort((a, b) => a - b), droite];
  return bornes.slice(0, -1).map((g, i) => valeurTest(g, bornes[i + 1]));
}

/** Nombre (entier, demi-entier…) en LaTeX exact : « 3 », « \dfrac{1}{2} ». */
export function nombreExactL(v: number): string {
  if (Number.isInteger(v)) return `${v}`;
  for (const d of [2, 4, 8, 3, 6]) if (Number.isInteger(Math.round(v * d * 1e9) / 1e9)) return qL(q(Math.round(v * d), d));
  return dec(v, 4);
}

export function nombreExactQ(v: number): Q {
  if (Number.isInteger(v)) return q(v);
  for (const d of [2, 4, 8, 3, 6]) if (Number.isInteger(Math.round(v * d * 1e9) / 1e9)) return q(Math.round(v * d), d);
  return q(Math.round(v * 1e4), 1e4);
}

/** « > 0 » / « < 0 » d'une valeur. */
export function signeRel(v: number): string {
  return v > 0 ? ">0" : "<0";
}

// ============================================================================
// Texte.
// ============================================================================

/** Liste « a, b et c » de fragments. */
export function listeEt(morceaux: Fragments[]): Fragments {
  return morceaux.flatMap((m, i) => [...(i === 0 ? [] : [t(i === morceaux.length - 1 ? " et " : ", ")]), ...m]);
}

/** Monôme « 3x^{2} » (réexport pratique). */
export function monome(c: number, d: number, premier: boolean, v = "x"): string {
  return monomeLatex(c, d, premier, v);
}

/** Lignes non vides d'une étape, finalisées (limites, doublons, formules groupées). */
export function finaliserDerivees(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return finaliser(etapes.filter((e) => e.type !== "calcul" || (e.calcul && e.calcul.length > 0)));
}
