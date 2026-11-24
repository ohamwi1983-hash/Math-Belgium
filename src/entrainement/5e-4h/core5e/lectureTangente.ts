import type { Q } from "../ui5e/nombresTrigo";
import { q, qMul, qSub, qVal } from "../ui5e/nombresTrigo";

/**
 * Couche core — `5gen73` « Lire f(a) et f′(a) sur un graphique » (5e ch. 5, § 1–2 et § 6, processus 1
 * CONNAÎTRE). Une courbe C_f et sa tangente t en A, tracées sur un quadrillage dont chaque carreau
 * vaut `sx` en x et `sy` en y. Tout est construit en CARREAUX : A est un nœud (ia ; ja), la pente de t
 * en carreaux vaut dp/dq (un second nœud de t : A + (dq ; dp)), la courbe est
 * g(u) = c3(u − ia)³ + c2(u − ia)² + (dp/dq)(u − ia) + ja ; en unités réelles f(x) = sy·g(x/sx),
 * f′(x) = (sy/sx)·g′(x/sx) — f(a) et f′(a) tombent donc sur le quadrillage et sont exacts.
 * Variantes : `direct` (même échelle), `echelle` (échelles différentes : la pente comptée en
 * carreaux est fausse), `inverse` (t donnée par son équation : choisir le graphique de f).
 */

export type VarianteLectureTangente = "direct" | "echelle" | "inverse";

/** Courbe et point de tangence, en carreaux. */
export interface CourbeTangente {
  ia: number;
  ja: number;
  dp: number;
  dq: number;
  c2: number;
  c3: number;
}

/** Erreur incarnée par un graphique candidat (variante inverse). */
export type TypeCandidat = "bon" | "signe" | "decale" | "ordonnee" | "echange";

export interface ExerciceLectureTangente {
  variante: VarianteLectureTangente;
  sx: number;
  sy: number;
  courbe: CourbeTangente;
  /** Abscisses (en carreaux) des points P, Q, R, croissantes (direct / echelle). */
  points: number[];
  /** Options de l'écran « comparer » : [indice où f′ < 0, indice où f′ est la plus grande] ; la
   * première est la bonne, la deuxième celle des ordonnées (piège). */
  options: [number, number][];
  /** Ordre d'affichage des options. */
  ordre: number[];
  /** Variante inverse : graphiques candidats (le premier est le bon) et leur type, puis l'ordre
   * d'affichage (graphique n° k + 1 = candidat ordreCandidats[k]). */
  candidats: CourbeTangente[];
  types: TypeCandidat[];
  ordreCandidats: number[];
}

type E = ExerciceLectureTangente;

/** Fenêtre en carreaux. */
export const FENETRE = 6;
export const FENETRE_CANDIDAT = 5;

export const penteCarreaux = (c: CourbeTangente): number => c.dp / c.dq;
export const g = (c: CourbeTangente, u: number): number => {
  const d = u - c.ia;
  return c.c3 * d * d * d + c.c2 * d * d + penteCarreaux(c) * d + c.ja;
};
export const gp = (c: CourbeTangente, u: number): number => {
  const d = u - c.ia;
  return 3 * c.c3 * d * d + 2 * c.c2 * d + penteCarreaux(c);
};

export const f = (e: E, x: number): number => e.sy * g(e.courbe, x / e.sx);
export const fp = (e: E, x: number): number => (e.sy / e.sx) * gp(e.courbe, x / e.sx);
export const aDe = (e: E): number => e.courbe.ia * e.sx;
export const faDe = (e: E): number => e.courbe.ja * e.sy;
/** f′(a) exact. */
export const fpaQ = (e: E): Q => q(e.courbe.dp * e.sy, e.courbe.dq * e.sx);
export const fpa = (e: E): number => qVal(fpaQ(e));
/** Ordonnée à l'origine de t : p = f(a) − f′(a)·a. */
export const pQ = (e: E): Q => qSub(q(faDe(e)), qMul(fpaQ(e), q(aDe(e))));
/** Second nœud de t (en unités) : B = A + (dq ; dp) carreaux. */
export const pointB = (e: E): { x: number; y: number } => ({ x: (e.courbe.ia + e.courbe.dq) * e.sx, y: (e.courbe.ja + e.courbe.dp) * e.sy });
export const echellesDifferentes = (e: E): boolean => e.sx !== e.sy;

export const NOMS_POINTS = ["P", "Q", "R"];
/** Abscisse réelle du point k (P, Q, R). */
export const xPoint = (e: E, k: number): number => e.points[k]! * e.sx;
export const yPoint = (e: E, k: number): number => f(e, xPoint(e, k));
export const fpPoint = (e: E, k: number): number => fp(e, xPoint(e, k));

/** Position (0–3) du bon graphique dans l'affichage (variante inverse). */
export const positionBonGraphique = (e: E): number => e.ordreCandidats.indexOf(0);
