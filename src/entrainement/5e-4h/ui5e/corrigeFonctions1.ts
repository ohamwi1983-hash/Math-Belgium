import type { EnsembleReelGuide, MorceauEnsemble, Polynome } from "../core5e/domaineDefinition.types";
import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import { formatPolynomeLatex } from "../generateurs5e/domaineDefinition/polynome";
import { formatEnsembleReelLatex, formatValeurLatex } from "./formatDomaineDefinition";
import { q, qVal, sansDoublons, type Q } from "./corrigeTrigonometrie1";

/**
 * Briques du corrigé détaillé « comme au tableau » du chapitre 1 de 5e (« Fonctions : rappels et
 * compléments ») : 5gen1 (domaine de définition), 5gen2 (décomposer), 5gen3 (composer f et g),
 * 5gen4 (composée lue sur un graphique), 5gen5 (fonctions en contexte) — règle
 * `.claude/rules/feuilles-evaluations.md`, section « Corrigé détaillé — comme au tableau ». SANS
 * `docx` : importé par les générateurs interactifs ET par les adaptateurs.
 *
 * - Renvois au cours (`COURS_*`, numéros `number` des sections de `content/chapters/5e-4h/fonctions-composees.ts`).
 * - Nombres et ensembles écrits avec les MÊMES fonctions que l'écran (`formatValeurLatex`,
 *   `formatEnsembleReelLatex`, `formatPolynomeLatex`).
 * - Conditions résolues en chaîne d'équivalences « ⟺ », une transformation par ligne (on retire,
 *   on divise — sens changé par un nombre négatif), trinômes par Δ, signe « du signe de a à
 *   l'extérieur des racines ».
 */

export const COURS_DOMAINE = "(cours, § 1)";
export const COURS_DECOMPOSER = "(cours, § 2)";
export const COURS_COMPOSER = "(cours, § 3)";
export const COURS_GRAPHIQUE = "(cours, § 4)";
export const COURS_CONTEXTE = "(cours, § 5)";

export type Fragments = FragmentConsigne[];
export const t = texte;
export const f = latex;

/** Nombre écrit comme à l'écran (fraction irréductible, signe devant). */
export const nb = (v: number): string => formatValeurLatex(Math.abs(v) < 1e-12 ? 0 : v);

/** Nombre entre parenthèses s'il est négatif (« (−3) »), pour un produit ou une puissance. */
export function par(v: number): string {
  const s = nb(v);
  return v < 0 ? `(${s})` : s;
}

/** Rationnel exact « −\dfrac{5}{3} », « 4 ». */
export function qLatex(x: Q): string {
  if (x.d === 1) return `${x.n}`;
  return `${x.n < 0 ? "-" : ""}\\dfrac{${Math.abs(x.n)}}{${x.d}}`;
}

/** « 3x », « -x », « x », « -\dfrac{1}{2}x ». */
export function monome(c: number, v = "x"): string {
  if (c === 1) return v;
  if (c === -1) return `-${v}`;
  return `${nb(c)}${v}`;
}

/** « + 5 », « - 5 » (terme signé à ajouter derrière une expression), vide pour 0. */
export function signe(v: number): string {
  if (Math.abs(v) < 1e-12) return "";
  return v < 0 ? `-${nb(-v)}` : `+${nb(v)}`;
}

export const polyLatex = (p: Polynome): string => formatPolynomeLatex(p);

/** Degré réel d'un polynôme (coefficients croissants). */
export function degre(p: Polynome): number {
  let d = p.length - 1;
  while (d > 0 && Math.abs(p[d] ?? 0) < 1e-12) d--;
  return d;
}

/** Valeur d'un polynôme (coefficients croissants). */
export function valeurPoly(p: Polynome, x: number): number {
  return p.reduce((s, c, i) => s + c * x ** i, 0);
}

/**
 * Substitution d'une valeur dans une expression écrite en x (« x^2 - 5x + 6 » en 2 :
 * « 2^2 - 5\cdot 2 + 6 ») : parenthèses autour d'une valeur négative ou fractionnaire, « \cdot »
 * après un coefficient.
 */
export function substituer(expr: string, v: number): string {
  const s = nb(v);
  const groupe = v < 0 || s.includes("frac") ? `\\left(${s}\\right)` : s;
  return expr.replace(/(\d)\s*x/g, `$1\\cdot ${groupe}`).replace(/x/g, groupe);
}

// ============================================================================
// Relations et ensembles.
// ============================================================================

export type Rel = "≥" | ">" | "≤" | "<" | "≠" | "=";

export const REL_LATEX: Record<Rel, string> = { "≥": "\\geq", ">": ">", "≤": "\\leq", "<": "<", "≠": "\\neq", "=": "=" };
const REL_INVERSE: Record<Rel, Rel> = { "≥": "≤", ">": "<", "≤": "≥", "<": ">", "≠": "≠", "=": "=" };

export const relLatex = (r: Rel): string => REL_LATEX[r];

/** Ensemble des x tels que « x REL b ». */
export function ensembleDeRelation(rel: Rel, b: number): EnsembleReelGuide {
  switch (rel) {
    case "≥":
      return { forme: "intervalles", points: [], morceaux: [{ inf: b, sup: null, infInclus: true, supInclus: false }] };
    case ">":
      return { forme: "intervalles", points: [], morceaux: [{ inf: b, sup: null, infInclus: false, supInclus: false }] };
    case "≤":
      return { forme: "intervalles", points: [], morceaux: [{ inf: null, sup: b, infInclus: false, supInclus: true }] };
    case "<":
      return { forme: "intervalles", points: [], morceaux: [{ inf: null, sup: b, infInclus: false, supInclus: false }] };
    case "≠":
      return { forme: "prive_points", points: [b], morceaux: [] };
    case "=":
      return { forme: "intervalles", points: [], morceaux: [{ inf: b, sup: b, infInclus: true, supInclus: true }] };
  }
}

export const ensLatex = (e: EnsembleReelGuide): string => formatEnsembleReelLatex(e);

/** Ensemble entre parenthèses s'il est une réunion ou une différence (avant « ∩ »). */
export function ensFacteur(e: EnsembleReelGuide): string {
  const s = formatEnsembleReelLatex(e);
  return s.includes("\\cup") || s.includes("\\setminus") ? `(${s})` : s;
}

/** « \{2\,;\,3\} » — valeurs triées. */
export function accoladesLatex(valeurs: number[]): string {
  return `\\{${[...valeurs].sort((a, b) => a - b).map(nb).join("\\,;\\,")}\\}`;
}

/** Ensemble des réels privé de valeurs (ℝ si aucune). */
export function privePoints(valeurs: number[]): EnsembleReelGuide {
  return valeurs.length === 0 ? { forme: "reel", points: [], morceaux: [] } : { forme: "prive_points", points: [...valeurs].sort((a, b) => a - b), morceaux: [] };
}

/** Un morceau contient-il x ? */
function morceauContient(m: MorceauEnsemble, x: number): boolean {
  const okInf = m.inf === null || x > m.inf + 1e-12 || (m.infInclus && Math.abs(x - m.inf) < 1e-12);
  const okSup = m.sup === null || x < m.sup - 1e-12 || (m.supInclus && Math.abs(x - m.sup) < 1e-12);
  return okInf && okSup;
}

export function ensembleContient(e: EnsembleReelGuide, x: number): boolean {
  if (e.forme === "reel") return true;
  if (e.forme === "prive_points") return !e.points.some((p) => Math.abs(p - x) < 1e-12);
  return e.morceaux.some((m) => morceauContient(m, x));
}

// ============================================================================
// Premier degré : a·x + b REL 0, une transformation par ligne.
// ============================================================================

/**
 * Lignes « ⟺ » qui résolvent `a·x + b REL c` à partir de la ligne de départ déjà écrite par
 * l'appelant : on retire / on ajoute b, puis on divise par a (sens changé si a < 0, sauf pour
 * « ≠ » et « = »). Rend aussi la relation finale et la borne.
 */
export function lignesPremierDegre(a: number, b: number, rel: Rel, c = 0): { lignes: LigneCalcul[]; rel: Rel; borne: number } {
  const lignes: LigneCalcul[] = [];
  const droite = c - b;
  if (Math.abs(b) > 1e-12) {
    lignes.push(ligne(`\\iff ${monome(a)}${relLatex(rel)} ${nb(droite)}`, b > 0 ? jf("on retire ", { l: nb(b) }, " aux deux membres") : jf("on ajoute ", { l: nb(-b) }, " aux deux membres")));
  }
  const borne = droite / a;
  const relFinal = a < 0 ? REL_INVERSE[rel] : rel;
  if (a !== 1) {
    const change = a < 0 && rel !== "≠" && rel !== "=";
    const j: Fragments =
      a === -1
        ? jf(change ? "on multiplie par −1 : le sens de l'inégalité change" : "on multiplie par −1")
        : change
          ? jf("on divise par ", { l: nb(a) }, ", un nombre négatif : le sens de l'inégalité change")
          : jf("on divise par ", { l: nb(a) });
    lignes.push(ligne(`\\iff x${relLatex(relFinal)} ${qLatex(q(Math.round(droite * 1e6), Math.round(a * 1e6)))}`, j));
  }
  return { lignes, rel: relFinal, borne };
}

// ============================================================================
// Second degré : Δ, racines (entières ou rationnelles par construction).
// ============================================================================

export interface EtudeTrinome {
  lignes: LigneCalcul[];
  delta: number;
  /** Racines réelles distinctes, triées. */
  racines: number[];
  a: number;
}

/** Rationnel le plus proche (dénominateur ≤ 1000) d'une racine — les racines sont entières ou
 * rationnelles par construction. */
function versQ(v: number): Q {
  for (let d = 1; d <= 1000; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-9) return q(n, d);
  }
  return q(Math.round(v * 1e6), 1e6);
}

/**
 * Δ calculé ligne à ligne, puis les racines (« x_1 = … », « x_2 = … », x₁ < x₂) ou « racine
 * double », ou « Δ < 0 : aucune racine ». `p` : coefficients croissants [c, b, a].
 */
export function etudeTrinome(p: Polynome): EtudeTrinome {
  const [c, b, a] = [p[0] ?? 0, p[1] ?? 0, p[2] ?? 0];
  const delta = b * b - 4 * a * c;
  const produit = 4 * a * c;
  const out: LigneCalcul[] = sansDoublons([
    ligne(`\\Delta=${par(b)}^2-4\\cdot ${par(a)}\\cdot ${par(c)}`, "discriminant du trinôme"),
    ...(produit !== 0 && b !== 0 ? [ligne(`=${nb(b * b)}${signe(-produit)}`)] : []),
    ligne(`=${nb(delta)}`),
  ]);
  if (delta < 0) {
    out.push(ligne(`\\Delta<0`, "aucune racine réelle : le trinôme ne s'annule jamais"));
    return { lignes: out, delta, racines: [], a };
  }
  if (delta === 0) {
    const r = -b / (2 * a);
    out.push(ligne(`x=\\dfrac{${nb(-b)}}{${nb(2 * a)}}=${qLatex(versQ(r))}`, "Δ = 0 : une racine double"));
    return { lignes: out, delta, racines: [r], a };
  }
  const s = Math.sqrt(delta);
  const racineDelta = Number.isInteger(s) ? `${s}` : `\\sqrt{${delta}}`;
  const moins = (-b - s) / (2 * a);
  const plus = (-b + s) / (2 * a);
  const [r1, signe1, r2, signe2] = moins < plus ? [moins, "-", plus, "+"] : [plus, "+", moins, "-"];
  const ecrit = (sg: string) => `\\dfrac{${nb(-b)}${sg}${racineDelta}}{${nb(2 * a)}}`;
  out.push(ligne(`x_1=${ecrit(signe1)}=${qLatex(versQ(r1))}`, "Δ > 0 : deux racines"));
  out.push(ligne(`x_2=${ecrit(signe2)}=${qLatex(versQ(r2))}`));
  return { lignes: out, delta, racines: [r1, r2], a };
}

/** Justification du signe d'un trinôme (règle du cours). */
export function justificationSigneTrinome(a: number, nbRacines: number): string {
  const sa = a > 0 ? "a > 0" : "a < 0";
  if (nbRacines === 0) return `Δ < 0 et ${sa} : le trinôme est toujours ${a > 0 ? "positif" : "négatif"}`;
  if (nbRacines === 1) return `${sa} : le trinôme a le signe de a partout, sauf à la racine où il s'annule`;
  return a > 0 ? "a > 0 : le trinôme est positif à l'extérieur des racines" : "a < 0 : le trinôme est positif entre les racines";
}

/** Ensemble des x tels que « p(x) REL 0 » pour un polynôme de degré ≤ 2 (racines connues). */
export function ensembleSignePoly(p: Polynome, rel: Rel, racines: number[]): EnsembleReelGuide {
  const r = [...racines].sort((a, b) => a - b);
  if (rel === "≠") return privePoints(r);
  if (rel === "=") return { forme: "intervalles", points: [], morceaux: r.map((v) => ({ inf: v, sup: v, infInclus: true, supInclus: true })) };
  const veutPositif = rel === "≥" || rel === ">";
  const inclus = rel === "≥" || rel === "≤";
  const bornes = [-Infinity, ...r, Infinity];
  const morceaux: MorceauEnsemble[] = [];
  for (let i = 0; i < bornes.length - 1; i++) {
    const inf = bornes[i]!;
    const sup = bornes[i + 1]!;
    const milieu = Number.isFinite(inf) && Number.isFinite(sup) ? (inf + sup) / 2 : Number.isFinite(inf) ? inf + 1 : Number.isFinite(sup) ? sup - 1 : 0;
    const v = valeurPoly(p, milieu);
    if (veutPositif ? v > 0 : v < 0) {
      morceaux.push({ inf: Number.isFinite(inf) ? inf : null, sup: Number.isFinite(sup) ? sup : null, infInclus: inclus && Number.isFinite(inf), supInclus: inclus && Number.isFinite(sup) });
    }
  }
  // Fusion des morceaux contigus (racine double incluse) et points isolés (racine double, ≥ 0 / ≤ 0).
  const fusion: MorceauEnsemble[] = [];
  for (const m of morceaux) {
    const prec = fusion[fusion.length - 1];
    if (prec && prec.sup !== null && m.inf !== null && Math.abs(prec.sup - m.inf) < 1e-12 && (prec.supInclus || m.infInclus)) {
      prec.sup = m.sup;
      prec.supInclus = m.supInclus;
    } else fusion.push({ ...m });
  }
  if (inclus) {
    for (const x of r) {
      if (!fusion.some((m) => morceauContient(m, x))) fusion.push({ inf: x, sup: x, infInclus: true, supInclus: true });
    }
    fusion.sort((u, v) => (u.inf ?? -Infinity) - (v.inf ?? -Infinity));
  }
  if (fusion.length === 1 && fusion[0]!.inf === null && fusion[0]!.sup === null) return { forme: "reel", points: [], morceaux: [] };
  return { forme: "intervalles", points: [], morceaux: fusion };
}

/**
 * Résolution complète de « p(x) REL 0 » (p de degré 1 ou 2, écrit `pLatex` comme à l'écran) :
 * - degré 1 : chaîne « ⟺ » jusqu'à « x REL borne », puis « ⟺ x ∈ S » (sauf pour « ≠ ») ;
 * - degré 2 : Δ et racines, puis « p(x) REL 0 ⟺ x ∈ S » (ou « x ∉ {…} » pour « ≠ »), règle du signe
 *   en justification.
 * `justifDepart` : justification de la ligne de départ (degré 1).
 */
export function lignesCondition(p: Polynome, pLatex: string, rel: Rel, justifDepart?: string): { lignes: LigneCalcul[]; ensemble: EnsembleReelGuide; racines: number[] } {
  if (degre(p) <= 1) {
    const [b, a] = [p[0] ?? 0, p[1] ?? 0];
    const r = lignesPremierDegre(a, b, rel);
    const ensemble = ensembleDeRelation(r.rel, r.borne);
    const lignes = [ligne(`${pLatex}${relLatex(rel)} 0`, justifDepart), ...r.lignes];
    if (rel !== "≠" && rel !== "=") lignes.push(ligne(`\\iff x\\in ${ensLatex(ensemble)}`));
    return { lignes, ensemble, racines: [r.borne] };
  }
  const etude = etudeTrinome(p);
  const ensemble = ensembleSignePoly(p, rel, etude.racines);
  const conclusion =
    rel === "≠"
      ? etude.racines.length === 0
        ? ligne(`${pLatex}\\neq 0\\iff x\\in\\mathbb{R}`, "le trinôme ne s'annule jamais : aucune valeur exclue")
        : ligne(`${pLatex}\\neq 0\\iff x\\notin ${accoladesLatex(etude.racines)}`, etude.racines.length > 1 ? "on exclut les deux racines" : "on exclut la racine")
      : ligne(`${pLatex}${relLatex(rel)} 0\\iff x\\in ${ensLatex(ensemble)}`, justificationSigneTrinome(etude.a, etude.racines.length) + (rel === "≥" && etude.racines.length ? ", racines comprises" : rel === ">" && etude.racines.length ? ", racines exclues" : ""));
  return { lignes: [...etude.lignes, conclusion], ensemble, racines: etude.racines };
}

/** Fragments « texte formule texte » d'une justification. */
export function jf(...morceaux: (string | { l: string })[]): Fragments {
  return morceaux.map((m) => (typeof m === "string" ? texte(m) : latex(m.l)));
}

/** Liste « A et B » / « A, B et C » de formules en fragments. */
export function etListe(formules: string[]): Fragments {
  return formules.flatMap((x, i) => (i === 0 ? [latex(x)] : [texte(i === formules.length - 1 ? " et " : ", "), latex(x)]));
}

export { qVal };
