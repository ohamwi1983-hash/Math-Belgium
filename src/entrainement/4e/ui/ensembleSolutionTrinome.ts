import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { evaluerExpressionGenerale } from "../moteur/expressionGenerale";
import { nombreTexte, q } from "./corrigeChapitre3";

/**
 * Ensembles de réels (solutions d'une équation ou d'une inéquation du second degré) partagés par
 * gen121 (détective d'erreurs), gen113 (solutions évidentes) et gen117 (lecture graphique) — 4e,
 * chapitre 2. Un ensemble = une union d'intervalles disjoints rangés ; un point isolé est un
 * intervalle fermé [a ; a]. Écriture du cours : crochets inversés, `\mathopen{]}`/`\mathclose{[}`,
 * « ; » entre les bornes, ∅, ℝ, ℝ \ {r}, {a ; b}. Aucune dépendance à `docx`.
 */

/** Un intervalle ; `null` = infini (−∞ à gauche, +∞ à droite), toujours exclu. */
export interface IntervalleReel {
  g: number | null;
  gInclus: boolean;
  d: number | null;
  dInclus: boolean;
}

export type EnsembleReel = IntervalleReel[];

const EPS = 1e-9;

export const ENSEMBLE_VIDE: EnsembleReel = [];
export const ENSEMBLE_REELS: EnsembleReel = [{ g: null, gInclus: false, d: null, dInclus: false }];

export function intervalleReel(g: number | null, gInclus: boolean, d: number | null, dInclus: boolean): IntervalleReel {
  return { g, gInclus: g !== null && gInclus, d, dInclus: d !== null && dInclus };
}

/** Ensemble fini {a ; b ; …}. */
export function ensemblePoints(valeurs: number[]): EnsembleReel {
  return normaliserEnsemble(valeurs.map((v) => intervalleReel(v, true, v, true)));
}

/** ℝ privé d'un ensemble fini. */
export function reelsSauf(valeurs: number[]): EnsembleReel {
  const v = [...new Set(valeurs)].sort((a, b) => a - b);
  if (v.length === 0) return ENSEMBLE_REELS;
  const out: EnsembleReel = [intervalleReel(null, false, v[0]!, false)];
  for (let i = 0; i + 1 < v.length; i++) out.push(intervalleReel(v[i]!, false, v[i + 1]!, false));
  out.push(intervalleReel(v[v.length - 1]!, false, null, false));
  return out;
}

function gaucheAvant(a: IntervalleReel, b: IntervalleReel): number {
  if (a.g === null) return b.g === null ? 0 : -1;
  if (b.g === null) return 1;
  if (Math.abs(a.g - b.g) > EPS) return a.g - b.g;
  return a.gInclus === b.gInclus ? 0 : a.gInclus ? -1 : 1;
}

function estVide(i: IntervalleReel): boolean {
  if (i.g === null || i.d === null) return false;
  if (i.d < i.g - EPS) return true;
  return Math.abs(i.d - i.g) <= EPS && !(i.gInclus && i.dInclus);
}

/** Union triée d'intervalles disjoints et non accolés (forme canonique). */
export function normaliserEnsemble(e: EnsembleReel): EnsembleReel {
  const tri = e.filter((i) => !estVide(i)).sort(gaucheAvant);
  const out: EnsembleReel = [];
  for (const i of tri) {
    const prec = out[out.length - 1];
    if (!prec) {
      out.push({ ...i });
      continue;
    }
    // Chevauchement ou contact (borne commune incluse d'un côté au moins) : on fusionne.
    const finPrec = prec.d;
    const chevauche =
      finPrec === null ||
      (i.g !== null && (i.g < finPrec - EPS || (Math.abs(i.g - finPrec) <= EPS && (prec.dInclus || i.gInclus)))) ||
      i.g === null;
    if (!chevauche) {
      out.push({ ...i });
      continue;
    }
    if (finPrec === null) continue;
    if (i.d === null || i.d > finPrec + EPS) {
      prec.d = i.d;
      prec.dInclus = i.dInclus;
    } else if (Math.abs(i.d - finPrec) <= EPS) {
      prec.dInclus = prec.dInclus || i.dInclus;
    }
  }
  return out;
}

function memeBorne(a: number | null, b: number | null, tol: number): boolean {
  if (a === null || b === null) return a === b;
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
}

export function egauxEnsembles(a: EnsembleReel, b: EnsembleReel, tol = EPS): boolean {
  const x = normaliserEnsemble(a);
  const y = normaliserEnsemble(b);
  return (
    x.length === y.length &&
    x.every((i, k) => {
      const j = y[k]!;
      return memeBorne(i.g, j.g, tol) && memeBorne(i.d, j.d, tol) && i.gInclus === j.gInclus && i.dInclus === j.dInclus;
    })
  );
}

function estPoint(i: IntervalleReel): boolean {
  return i.g !== null && i.d !== null && Math.abs(i.g - i.d) <= EPS;
}

/** Les points exclus si l'ensemble est ℝ privé d'un ensemble fini, sinon `null`. */
function pointsExclus(e: EnsembleReel): number[] | null {
  if (e.length < 2 || e[0]!.g !== null || e[e.length - 1]!.d !== null) return null;
  const pts: number[] = [];
  for (let k = 0; k + 1 < e.length; k++) {
    const i = e[k]!;
    const j = e[k + 1]!;
    if (i.d === null || j.g === null || Math.abs(i.d - j.g) > EPS || i.dInclus || j.gInclus) return null;
    pts.push(i.d);
  }
  return pts;
}

export type GenreEnsemble = "vide" | "reels" | "points" | "reelsSauf" | "intervalles";

/** Allure de l'ensemble (pour la saisie guidée et les textes). */
export function genreEnsemble(e: EnsembleReel): GenreEnsemble {
  const n = normaliserEnsemble(e);
  if (n.length === 0) return "vide";
  if (n.length === 1 && n[0]!.g === null && n[0]!.d === null) return "reels";
  if (n.every(estPoint)) return "points";
  if (pointsExclus(n)) return "reelsSauf";
  return "intervalles";
}

/** Valeurs d'un ensemble fini (ou exclues de ℝ), rangées ; `[]` sinon. */
export function valeursEnsemble(e: EnsembleReel): number[] {
  const n = normaliserEnsemble(e);
  if (n.every(estPoint)) return n.map((i) => i.g!);
  return pointsExclus(n) ?? [];
}

function borneLatex(v: number | null, cote: "g" | "d", nombre: (x: number) => string): string {
  if (v === null) return cote === "g" ? "-\\infty" : "+\\infty";
  return nombre(v);
}

function morceauLatex(i: IntervalleReel, nombre: (x: number) => string): string {
  if (estPoint(i)) return `\\{${nombre(i.g!)}\\}`;
  const g = i.gInclus ? "[" : "\\mathopen{]}";
  const d = i.dInclus ? "]" : "\\mathclose{[}";
  return `${g}${borneLatex(i.g, "g", nombre)}\\,;\\,${borneLatex(i.d, "d", nombre)}${d}`;
}

/** Écriture LaTeX (sans « S = ») : ∅, ℝ, {a ; b}, ℝ \ {r}, ]−∞ ; −2] ∪ [3 ; +∞[. `nombre` : écriture
 * d'une valeur (par défaut fraction irréductible exacte). */
export function ensembleLatex(e: EnsembleReel, nombre: (x: number) => string = q): string {
  const n = normaliserEnsemble(e);
  switch (genreEnsemble(n)) {
    case "vide":
      return "\\varnothing";
    case "reels":
      return "\\mathbb{R}";
    case "points":
      return `\\{${n.map((i) => nombre(i.g!)).join("\\,;\\,")}\\}`;
    case "reelsSauf":
      return `\\mathbb{R}\\setminus\\{${pointsExclus(n)!.map(nombre).join("\\,;\\,")}\\}`;
    default:
      return n.map((i) => morceauLatex(i, nombre)).join("\\cup ");
  }
}

/** Même écriture en texte brut Unicode (justifications, titres) : « ]−∞ ; −2] ∪ [3 ; +∞[ ». */
export function ensembleTexte(e: EnsembleReel): string {
  const n = normaliserEnsemble(e);
  const b = (v: number | null, cote: "g" | "d") => (v === null ? (cote === "g" ? "−∞" : "+∞") : nombreTexte(v));
  switch (genreEnsemble(n)) {
    case "vide":
      return "∅";
    case "reels":
      return "ℝ";
    case "points":
      return `{${n.map((i) => nombreTexte(i.g!)).join(" ; ")}}`;
    case "reelsSauf":
      return `ℝ \\ {${pointsExclus(n)!.map(nombreTexte).join(" ; ")}}`;
    default:
      return n.map((i) => (estPoint(i) ? `{${nombreTexte(i.g!)}}` : `${i.gInclus ? "[" : "]"}${b(i.g, "g")} ; ${b(i.d, "d")}${i.dInclus ? "]" : "["}`)).join(" ∪ ");
  }
}

/** Le réel x est-il dans l'ensemble ? */
export function contient(e: EnsembleReel, x: number): boolean {
  return e.some((i) => (i.g === null || x > i.g + EPS || (Math.abs(x - i.g) <= EPS && i.gInclus)) && (i.d === null || x < i.d - EPS || (Math.abs(x - i.d) <= EPS && i.dInclus)));
}

// ---------------------------------------------------------------------------------------------
// Lecture des saisies (champs libres jamais filtrés : seule `normaliserSigneMoins` est appliquée)
// ---------------------------------------------------------------------------------------------

/** Un nombre saisi : virgule décimale, fraction, racine (« sqrt », « √ »), calcul. `null` si illisible. */
export function lireNombreSaisi(texte: string): number | null {
  const s = normaliserSigneMoins(texte)
    .trim()
    .replace(/(\d)[\s  ]+(?=\d)/g, "$1")
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/√\s*\(/g, "sqrt(")
    .replace(/√\s*([\d.]+)/g, "sqrt($1)");
  if (s === "" || /[xX]/.test(s)) return null;
  try {
    const v = evaluerExpressionGenerale(s, 0);
    return Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

/** Ensemble FINI saisi au clavier : valeurs séparées par « ; » (ou « ou », « et »), accolades,
 * « S = », « x = », « x₁ = » tolérés ; « ∅ » ou « vide » pour l'ensemble vide. `null` si une valeur
 * est illisible. */
export function lireValeurs(texte: string): number[] | null {
  let s = normaliserSigneMoins(texte).trim().replace(/^S\s*=\s*/i, "").trim();
  if (/^(∅|vide|aucune?|\{\s*\})$/i.test(s)) return [];
  s = s.replace(/^\{/, "").replace(/\}$/, "").trim();
  const morceaux = s
    .split(/;|\bou\b|\bet\b/i)
    .map((m) => m.trim().replace(/^x\s*(_?\s*[12₁₂])?\s*=\s*/i, "").trim())
    .filter((m) => m !== "");
  if (morceaux.length === 0) return null;
  const valeurs: number[] = [];
  for (const m of morceaux) {
    const v = lireNombreSaisi(m);
    if (v === null) return null;
    valeurs.push(v);
  }
  return valeurs;
}

/** Deux ensembles finis égaux (ordre et doublons indifférents). */
export function memesValeurs(lues: number[], attendues: number[]): boolean {
  return egauxEnsembles(ensemblePoints(lues), ensemblePoints(attendues));
}
