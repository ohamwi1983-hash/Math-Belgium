import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { lireValeur } from "./lectureValeurTrigo";

/**
 * Ensembles de réels des générateurs 5gen58–5gen60 (5e ch. 1) : réunion d'intervalles (bornes
 * finies ou ±∞) et de points isolés. Une seule source pour la saisie (lecture APRÈS coup, champ
 * jamais filtré), la vérification, l'aperçu KaTeX, l'écran, le papier et le corrigé.
 *
 * Écritures acceptées (`lireEnsemble`) : « [−3 ; 4[ », « ]-inf;2] », « ]−∞ ; 2] ∪ ]5 ; +∞[ »
 * (« ∪ », « U » ou « u » entre deux morceaux), « ℝ », « R », « IR », « ℝ \ {2} », « ℝ∖{1 ; 3} »,
 * « [−4 ; 5] \ {1} », « {2} », « ∅ », « {} » ; préfixe recopié (« dom f = », « Im f = »,
 * « x ∈ ») ignoré ; séparateur « ; » (ou « , » quand il n'y a aucun « ; » et une seule virgule) ;
 * bornes : entiers, fractions, décimaux, racines (`lireValeur`). Un crochet FERMÉ du côté de ∞ et
 * un intervalle « à l'envers » sont des écritures fausses (lues, signalées par `defauts`), jamais
 * des écritures illisibles.
 */

export interface Intervalle {
  g: number;
  gF: boolean;
  d: number;
  dF: boolean;
}

/** Ensemble normalisé : intervalles triés, disjoints, non accolés (un point = g = d, fermé). */
export type Ensemble = Intervalle[];

const EPS = 1e-9;
const eq = (a: number, b: number) => (a === b ? true : Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < EPS);

export const R: Ensemble = [{ g: -Infinity, gF: false, d: Infinity, dF: false }];
export const VIDE: Ensemble = [];

export function intervalle(g: number, gF: boolean, d: number, dF: boolean): Intervalle {
  return { g, gF: Number.isFinite(g) && gF, d, dF: Number.isFinite(d) && dF };
}
export const point = (x: number): Intervalle => ({ g: x, gF: true, d: x, dF: true });

function vide(i: Intervalle): boolean {
  if (i.g > i.d + EPS) return true;
  if (eq(i.g, i.d)) return !(i.gF && i.dF);
  return false;
}

/** Trie, retire les vides, fusionne ce qui se chevauche ou se touche (un côté fermé suffit). */
export function normaliser(liste: Intervalle[]): Ensemble {
  const l = liste.filter((i) => !vide(i)).map((i) => intervalle(i.g, i.gF, i.d, i.dF));
  l.sort((a, b) => (eq(a.g, b.g) ? (a.gF === b.gF ? 0 : a.gF ? -1 : 1) : a.g - b.g));
  const res: Intervalle[] = [];
  for (const i of l) {
    const der = res[res.length - 1];
    if (der && (i.g < der.d - EPS || (eq(i.g, der.d) && (i.gF || der.dF)))) {
      if (i.d > der.d + EPS) {
        der.d = i.d;
        der.dF = i.dF;
      } else if (eq(i.d, der.d)) der.dF = der.dF || i.dF;
      continue;
    }
    res.push({ ...i });
  }
  return res;
}

export const reunion = (...ens: Ensemble[]): Ensemble => normaliser(ens.flat());

export function intersection(a: Ensemble, b: Ensemble): Ensemble {
  const res: Intervalle[] = [];
  for (const x of a)
    for (const y of b) {
      let g = x.g,
        gF = x.gF;
      if (y.g > g + EPS || (eq(y.g, g) && !y.gF)) {
        g = y.g;
        gF = eq(y.g, x.g) ? x.gF && y.gF : y.gF;
      }
      let d = x.d,
        dF = x.dF;
      if (y.d < d - EPS || (eq(y.d, d) && !y.dF)) {
        d = y.d;
        dF = eq(y.d, x.d) ? x.dF && y.dF : y.dF;
      }
      res.push({ g, gF, d, dF });
    }
  return normaliser(res);
}

/** a privé des points `pts`. */
export function priveDe(a: Ensemble, pts: number[]): Ensemble {
  let res = a;
  for (const p of pts) {
    const r: Intervalle[] = [];
    for (const i of res) {
      const dedans = (p > i.g + EPS || (eq(p, i.g) && i.gF)) && (p < i.d - EPS || (eq(p, i.d) && i.dF));
      if (!dedans) r.push(i);
      else {
        r.push({ g: i.g, gF: i.gF, d: p, dF: false });
        r.push({ g: p, gF: false, d: i.d, dF: i.dF });
      }
    }
    res = normaliser(r);
  }
  return res;
}

export function contient(a: Ensemble, x: number): boolean {
  return a.some((i) => (x > i.g + EPS || (eq(x, i.g) && i.gF)) && (x < i.d - EPS || (eq(x, i.d) && i.dF)));
}

export function egaux(a: Ensemble, b: Ensemble): boolean {
  if (a.length !== b.length) return false;
  return a.every((i, k) => {
    const j = b[k]!;
    return eq(i.g, j.g) && eq(i.d, j.d) && i.gF === j.gF && i.dF === j.dF;
  });
}

/** Mêmes bornes, crochets différents (diagnostic « crochet »). */
export function memesBornes(a: Ensemble, b: Ensemble): boolean {
  if (a.length !== b.length) return false;
  return a.every((i, k) => eq(i.g, b[k]!.g) && eq(i.d, b[k]!.d));
}

// ============================================================================
// Lecture d'une saisie.
// ============================================================================

export type DefautEnsemble = "infiniFerme" | "aLEnvers";

export interface LectureEnsemble {
  ensemble: Ensemble;
  defauts: DefautEnsemble[];
}

function lireBorne(s: string): number | null {
  const t = s.replace(/\s+/g, "").toLowerCase();
  if (/^(\+)?(∞|inf|infini|infinity)$/.test(t)) return Infinity;
  if (/^-(∞|inf|infini|infinity)$/.test(t)) return -Infinity;
  if (t === "") return null;
  return lireValeur(t);
}

function lireListe(corps: string): number[] | null {
  const c = corps.trim();
  if (c === "") return [];
  let morceaux: string[];
  if (c.includes(";")) morceaux = c.split(";");
  else if ((c.match(/,/g) ?? []).length >= 1 && !/\d,\d/.test(c)) morceaux = c.split(",");
  else morceaux = [c];
  const res: number[] = [];
  for (const m of morceaux) {
    const v = lireBorne(m);
    if (v === null || !Number.isFinite(v)) return null;
    res.push(v);
  }
  return res;
}

function lireTerme(t: string, defauts: DefautEnsemble[]): Intervalle[] | null {
  let s = t.trim();
  if (s === "") return null;
  // Différence « A \ {a ; b} ».
  const diff = s.match(/^(.*?)\s*(?:\\|∖|privé\s+de)\s*\{([^{}]*)\}\s*$/i);
  if (diff) {
    const base = lireTerme(diff[1]!, defauts);
    const pts = lireListe(diff[2]!);
    if (!base || !pts) return null;
    return priveDe(normaliser(base), pts);
  }
  if (/^(ℝ|r|ir|ℝ\s*tout\s+entier)$/i.test(s)) return [...R];
  if (/^(∅|ø|Ø|\{\s*\}|vide|ensemble\s+vide)$/i.test(s)) return [];
  const acc = s.match(/^\{([^{}]*)\}$/);
  if (acc) {
    const pts = lireListe(acc[1]!);
    return pts ? pts.map(point) : null;
  }
  const m = s.match(/^([[\]])(.*)([[\]])$/);
  if (!m) return null;
  s = m[2]!;
  let bornes: string[];
  if (s.includes(";")) bornes = s.split(";");
  else if ((s.match(/,/g) ?? []).length === 1) bornes = s.split(",");
  else return null;
  if (bornes.length !== 2) return null;
  const g = lireBorne(bornes[0]!);
  const d = lireBorne(bornes[1]!);
  if (g === null || d === null) return null;
  const gF = m[1] === "[";
  const dF = m[3] === "]";
  if ((g === -Infinity && gF) || (d === Infinity && dF) || g === Infinity || d === -Infinity) defauts.push("infiniFerme");
  if (g > d + EPS || (eq(g, d) && !(gF && dF))) {
    defauts.push("aLEnvers");
    return [];
  }
  return [{ g, gF, d, dF }];
}

/** Lecture d'une saisie d'ensemble ; `null` = illisible (aucune tentative consommée). */
export function lireEnsemble(texte: string): LectureEnsemble | null {
  let s = normaliserSigneMoins(texte).trim().replace(/[’`]/g, "'");
  s = s.replace(/^[^=[\]{}]*=/, "").trim();
  s = s.replace(/^x\s*(∈|appartient\s+à)\s*/i, "").trim();
  s = s.replace(/\.\s*$/, "").trim();
  s = s.replace(/\\setminus/g, "\\").replace(/\\cup/g, "∪").replace(/\\infty/g, "∞").replace(/\\mathbb\{R\}/g, "ℝ");
  if (s === "") return null;
  const termes = s.split(/\s*(?:∪|(?<![a-zA-Z])[uU](?![a-zA-Z]))\s*/);
  const defauts: DefautEnsemble[] = [];
  const res: Intervalle[] = [];
  for (const t of termes) {
    const l = lireTerme(t, defauts);
    if (!l) return null;
    res.push(...l);
  }
  return { ensemble: normaliser(res), defauts };
}

// ============================================================================
// Écriture (KaTeX).
// ============================================================================

/** Nombre rationnel simple en LaTeX : entier, sinon fraction (signe sorti). */
export function nombreL(v: number): string {
  if (Number.isInteger(v) || Math.abs(v - Math.round(v)) < EPS) return `${Math.round(v)}`;
  for (let d = 2; d <= 60; d++) {
    const n = Math.round(v * d);
    if (Math.abs(v * d - n) < 1e-7) return `${n < 0 ? "-" : ""}\\dfrac{${Math.abs(n)}}{${d}}`;
  }
  return `${Math.round(v * 1000) / 1000}`.replace(".", "{,}");
}

function borneL(v: number): string {
  if (v === Infinity) return "+\\infty";
  if (v === -Infinity) return "-\\infty";
  return nombreL(v);
}

export function intervalleL(i: Intervalle): string {
  if (eq(i.g, i.d)) return `\\{${nombreL(i.g)}\\}`;
  const gauche = i.gF ? "[" : "\\mathopen{]}";
  const droite = i.dF ? "]" : "\\mathclose{[}";
  return `${gauche}${borneL(i.g)}\\,;\\,${borneL(i.d)}${droite}`;
}

/** Ensemble en LaTeX : ∅, ℝ, ℝ \ {…} quand seuls des points manquent à ℝ, sinon réunion. */
export function ensembleL(a: Ensemble): string {
  if (a.length === 0) return "\\varnothing";
  if (a.length === 1 && a[0]!.g === -Infinity && a[0]!.d === Infinity) return "\\mathbb{R}";
  const tousOuverts = a.every((i, k) => (k === 0 ? i.g === -Infinity : !i.gF) && (k === a.length - 1 ? i.d === Infinity : !i.dF) && !eq(i.g, i.d));
  const accoles = a.every((i, k) => k === 0 || eq(a[k - 1]!.d, i.g));
  if (a.length > 1 && tousOuverts && accoles) return `\\mathbb{R}\\setminus\\{${a.slice(1).map((i) => nombreL(i.g)).join("\\,;\\,")}\\}`;
  return a.map(intervalleL).join("\\cup ");
}

/** Aperçu KaTeX d'une saisie (rien si illisible). */
export function apercuEnsemble(texte: string): string | null {
  const l = lireEnsemble(texte);
  if (!l) return null;
  return ensembleL(l.ensemble);
}

export const RACCOURCIS_ENSEMBLE = [
  { libelle: "[", texte: "[" },
  { libelle: "]", texte: "]" },
  { libelle: ";", texte: " ; " },
  { libelle: "∪", texte: " ∪ " },
  { libelle: "∞", texte: "∞" },
  { libelle: "ℝ", texte: "ℝ" },
  { libelle: "∅", texte: "∅" },
];
