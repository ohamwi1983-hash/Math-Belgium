import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { decoderLigne, VALEUR_VIDE } from "../ui5e/ecransTrigo.types";
import { q, qVal } from "../ui5e/nombresTrigo";
import type { Q } from "../ui5e/nombresTrigo";

/**
 * Ensembles de réels (unions d'intervalles) des générateurs du 5e ch. 1, lot G (5gen62 « Domaine
 * d'une composée par l'image ») : bornes exactes (rationnels `Q`) ou infinies, opérations
 * (intersection, réunion, égalité), lecture de la saisie de l'écran « intervalles » (une ligne par
 * intervalle, crochets à toucher, bouton ∅) et écriture KaTeX (∅, ℝ, ℝ∖{a ; b}, unions).
 */

export interface Borne {
  /** −1 : −∞ ; 1 : +∞ ; 0 : borne finie `q`. */
  inf: -1 | 0 | 1;
  q: Q;
}
export interface Intervalle {
  g: Borne;
  /** Borne gauche comprise (crochet « [ »). */
  gf: boolean;
  d: Borne;
  df: boolean;
}
/** Union d'intervalles disjoints, triés, non adjacents (forme normale) ; [] = ∅. */
export type Ensemble = Intervalle[];

export const MOINS_INF: Borne = { inf: -1, q: q(0) };
export const PLUS_INF: Borne = { inf: 1, q: q(0) };
export const fini = (x: Q): Borne => ({ inf: 0, q: x });
export const val = (b: Borne): number => (b.inf === 0 ? qVal(b.q) : b.inf * Infinity);

const EPS = 1e-9;
const cmp = (a: Borne, b: Borne): number => {
  const x = val(a);
  const y = val(b);
  if (x === y) return 0;
  if (Number.isFinite(x) && Number.isFinite(y) && Math.abs(x - y) < EPS) return 0;
  return x < y ? -1 : 1;
};

export const REELS: Ensemble = [{ g: MOINS_INF, gf: false, d: PLUS_INF, df: false }];

/** Intervalle non vide ? (un point isolé [a ; a] compte comme non vide). */
function nonVide(i: Intervalle): boolean {
  const c = cmp(i.g, i.d);
  return c < 0 || (c === 0 && i.gf && i.df && i.g.inf === 0);
}

/** Forme normale : intervalles non vides, triés, fusionnés quand ils se touchent sur un point compris. */
export function normaliser(ens: Ensemble): Ensemble {
  const l = ens.filter(nonVide).map((i) => ({ ...i, gf: i.g.inf === 0 && i.gf, df: i.d.inf === 0 && i.df }));
  l.sort((a, b) => cmp(a.g, b.g) || (a.gf === b.gf ? 0 : a.gf ? -1 : 1));
  const r: Intervalle[] = [];
  for (const i of l) {
    const der = r[r.length - 1];
    if (der) {
      const c = cmp(der.d, i.g);
      if (c > 0 || (c === 0 && (der.df || i.gf))) {
        const cd = cmp(i.d, der.d);
        if (cd > 0) r[r.length - 1] = { ...der, d: i.d, df: i.df };
        else if (cd === 0) r[r.length - 1] = { ...der, df: der.df || i.df };
        continue;
      }
    }
    r.push({ ...i });
  }
  return r;
}

export function egalEns(a: Ensemble, b: Ensemble): boolean {
  const x = normaliser(a);
  const y = normaliser(b);
  return x.length === y.length && x.every((i, k) => cmp(i.g, y[k].g) === 0 && cmp(i.d, y[k].d) === 0 && i.gf === y[k].gf && i.df === y[k].df);
}

export function intersection(a: Ensemble, b: Ensemble): Ensemble {
  const r: Intervalle[] = [];
  for (const i of normaliser(a))
    for (const j of normaliser(b)) {
      const cg = cmp(i.g, j.g);
      const g = cg > 0 ? i.g : j.g;
      const gf = cg > 0 ? i.gf : cg < 0 ? j.gf : i.gf && j.gf;
      const cd = cmp(i.d, j.d);
      const d = cd < 0 ? i.d : j.d;
      const df = cd < 0 ? i.df : cd > 0 ? j.df : i.df && j.df;
      r.push({ g, gf, d, df });
    }
  return normaliser(r);
}

export function reunion(a: Ensemble, b: Ensemble): Ensemble {
  return normaliser([...a, ...b]);
}

/** ℝ privé des points `pts` (triés). */
export function reelsPrives(pts: Q[]): Ensemble {
  const tri = [...pts].sort((a, b) => qVal(a) - qVal(b));
  const r: Intervalle[] = [];
  let g: Borne = MOINS_INF;
  for (const p of tri) {
    r.push({ g, gf: false, d: fini(p), df: false });
    g = fini(p);
  }
  r.push({ g, gf: false, d: PLUS_INF, df: false });
  return normaliser(r);
}

/** L'ensemble contient-il un point isolé ([a ; a]) ? (exclu par le générateur.) */
export function aPointIsole(ens: Ensemble): boolean {
  return normaliser(ens).some((i) => cmp(i.g, i.d) === 0);
}

/** Le réel x appartient-il à l'ensemble ? */
export function contient(ens: Ensemble, x: number): boolean {
  return ens.some((i) => {
    const g = val(i.g);
    const d = val(i.d);
    return (x > g + EPS || (i.gf && Math.abs(x - g) < EPS)) && (x < d - EPS || (i.df && Math.abs(x - d) < EPS));
  });
}

// ---------------------------------------------------------------------------------------------
// Lecture de la saisie.
// ---------------------------------------------------------------------------------------------

/** Nombre saisi : entier, décimal (virgule ou point), fraction « a/b », signe « − – — » ; `null` = illisible. */
export function lireRationnel(texte: string): Q | null {
  const s = normaliserSigneMoins(texte).replace(/\s+/g, "").replace(/,/g, ".");
  const m = s.match(/^([+-]?)(\d+(?:\.\d+)?|\.\d+)(?:\/(\d+(?:\.\d+)?))?$/);
  if (!m) return null;
  const versQ = (t: string): Q => {
    const [ent, dec = ""] = t.split(".");
    return q(Number((ent || "0") + dec), 10 ** dec.length);
  };
  let r = versQ(m[2]);
  if (m[3] !== undefined) {
    const den = versQ(m[3]);
    if (den.n === 0) return null;
    r = q(r.n * den.d, r.d * den.n);
  }
  return m[1] === "-" ? q(-r.n, r.d) : r;
}

/** Borne saisie : nombre, ou infini (« +inf », « inf », « ∞ », « +∞ », « -inf », « −∞ », « infini », « oo »). */
export function lireBorne(texte: string): Borne | null {
  const s = normaliserSigneMoins(texte).replace(/\s+/g, "").toLowerCase();
  const m = s.match(/^([+-]?)(∞|inf|infini|infinity|oo)$/);
  if (m) return m[1] === "-" ? MOINS_INF : PLUS_INF;
  const r = lireRationnel(s);
  return r ? fini(r) : null;
}

export type LectureEnsemble =
  | { type: "ensemble"; ens: Ensemble }
  | { type: "illisible" }
  /** Lisible mais mal écrit (aucune tentative) : crochet fermé sur un infini, bornes dans le désordre. */
  | { type: "reprendre"; raison: "infini-ferme" | "ordre" | "infini-mal-place" };

/** Lecture des lignes de l'écran « intervalles » (ou de la valeur ∅). */
export function lireEnsembleSaisi(valeurs: string[]): LectureEnsemble {
  if (valeurs.length === 1 && valeurs[0] === VALEUR_VIDE) return { type: "ensemble", ens: [] };
  const l: Intervalle[] = [];
  let raison: "infini-ferme" | "ordre" | "infini-mal-place" | null = null;
  for (const v of valeurs) {
    const ligne = decoderLigne(v);
    const g = lireBorne(ligne.gauche);
    const d = lireBorne(ligne.droite);
    if (!g || !d) return { type: "illisible" };
    if (g.inf === 1 || d.inf === -1) raison ??= "infini-mal-place";
    else if ((g.inf === -1 && ligne.ouvrant === "[") || (d.inf === 1 && ligne.fermant === "]")) raison ??= "infini-ferme";
    else if (cmp(g, d) >= 0 && !(cmp(g, d) === 0 && ligne.ouvrant === "[" && ligne.fermant === "]")) raison ??= "ordre";
    l.push({ g, gf: ligne.ouvrant === "[", d, df: ligne.fermant === "]" });
  }
  if (raison) return { type: "reprendre", raison };
  return { type: "ensemble", ens: normaliser(l) };
}

// ---------------------------------------------------------------------------------------------
// Écriture.
// ---------------------------------------------------------------------------------------------

/** Rationnel en LaTeX, fractions en `\tfrac` (dans un intervalle ou un ensemble). */
export function qTL(a: Q): string {
  if (a.d === 1) return `${a.n}`;
  return `${a.n < 0 ? "-" : ""}\\tfrac{${Math.abs(a.n)}}{${a.d}}`;
}
/** Rationnel en texte (« 3/2 », « −1/2 »). */
export function qTexte(a: Q): string {
  const s = a.d === 1 ? `${Math.abs(a.n)}` : `${Math.abs(a.n)}/${a.d}`;
  return a.n < 0 ? `−${s}` : s;
}

export function borneL(b: Borne): string {
  return b.inf === -1 ? "-\\infty" : b.inf === 1 ? "+\\infty" : qTL(b.q);
}

export function intervalleL(i: Intervalle): string {
  const o = i.gf ? "[" : "\\mathopen{]}";
  const f = i.df ? "]" : "\\mathclose{[}";
  return `${o}${borneL(i.g)}\\,;\\,${borneL(i.d)}${f}`;
}

/** Points exclus si l'ensemble est ℝ privé d'un nombre fini de points ; `null` sinon. */
export function pointsExclus(ens: Ensemble): Q[] | null {
  const n = normaliser(ens);
  if (n.length === 0 || n[0].g.inf !== -1 || n[n.length - 1].d.inf !== 1) return null;
  const pts: Q[] = [];
  for (let k = 0; k + 1 < n.length; k++) {
    if (n[k].df || n[k + 1].gf || cmp(n[k].d, n[k + 1].g) !== 0) return null;
    pts.push(n[k].d.q);
  }
  return pts;
}

/** Ensemble en LaTeX : ∅, ℝ, ℝ∖{a ; b}, ou réunion d'intervalles. */
export function ensembleL(ens: Ensemble): string {
  const n = normaliser(ens);
  if (n.length === 0) return "\\varnothing";
  const pts = pointsExclus(n);
  if (pts && pts.length === 0) return "\\mathbb{R}";
  if (pts) return `\\mathbb{R}\\setminus\\{${pts.map(qTL).join("\\,;\\,")}\\}`;
  return n.map(intervalleL).join("\\cup ");
}

/** Ensemble en texte brut (fiche « lecture seule », barème) : « ]−∞ ; 2] ∪ [3 ; +∞[ ». */
export function ensembleTexte(ens: Ensemble): string {
  const n = normaliser(ens);
  if (n.length === 0) return "∅";
  const pts = pointsExclus(n);
  if (pts && pts.length === 0) return "ℝ";
  if (pts) return `ℝ∖{${pts.map(qTexte).join(" ; ")}}`;
  const b = (x: Borne) => (x.inf === -1 ? "−∞" : x.inf === 1 ? "+∞" : qTexte(x.q));
  return n.map((i) => `${i.gf ? "[" : "]"}${b(i.g)} ; ${b(i.d)}${i.df ? "]" : "["}`).join(" ∪ ");
}
