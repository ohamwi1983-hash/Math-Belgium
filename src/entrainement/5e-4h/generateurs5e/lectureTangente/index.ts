import type { CourbeTangente, ExerciceLectureTangente, TypeCandidat, VarianteLectureTangente } from "../../core5e/lectureTangente";
import { FENETRE, FENETRE_CANDIDAT, g, gp } from "../../core5e/lectureTangente";

/**
 * Couche A — générateur de `5gen73` « Lire f(a) et f′(a) sur un graphique ». `Math.random()` seul
 * (le `?code=` rejoue le tirage). Tout en carreaux (voir `core5e/lectureTangente.ts`) :
 * - A nœud (ia ; ja), |ia| ≤ 3, |ja| ≤ 3 ; pente de t en carreaux ±1/2, ±1, ±3/2, ±2 (jamais nulle) ;
 *   le second nœud A + (dq ; dp) dans la fenêtre ; courbure c2 ≠ 0 (la courbe s'écarte de t) ;
 * - P, Q, R : nœuds d'abscisse entière (en carreaux) visibles, écartés de 2 carreaux au moins, EXACTEMENT
 *   un où f′ < 0 (pente ≤ −0,4 carreau), le plus grand f′ dépassant le deuxième de 0,6 au moins ;
 *   rejet si « plus basse / plus haute ordonnée » donnait la bonne réponse (le piège doit être faux) ;
 * - échelles (variante `echelle`) : un carreau vaut 1 en x et 2 en y, ou 2 en x et 1 en y ;
 * - inverse : bon graphique + trois intrus parmi signe de la pente, point de tangence décalé (la même
 *   droite touche ailleurs), tangente parallèle décalée (mauvais f(a)), f(a) et f′(a) échangés.
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j]!, t[i]!];
  }
  return t;
}

const PENTES: [number, number][] = [
  [1, 2],
  [1, 1],
  [3, 2],
  [2, 1],
  [-1, 2],
  [-1, 1],
  [-3, 2],
  [-2, 1],
];
const C2 = [0.25, -0.25, 0.5, -0.5, 1 / 3, -1 / 3];
const C3 = [0, 0, 1 / 8, -1 / 8, 1 / 12, -1 / 12];

/** La courbe reste lisible autour de A (deux carreaux de part et d'autre dans la fenêtre). */
function lisibleAutourDeA(c: CourbeTangente, w: number): boolean {
  for (let u = c.ia - 2; u <= c.ia + 2; u += 0.5) {
    if (u < -w || u > w) continue;
    if (Math.abs(g(c, u)) > w - 0.3) return false;
  }
  return true;
}

function courbeAutour(ia: number, ja: number, dp: number, dq: number, w: number): CourbeTangente | null {
  for (let essai = 0; essai < 40; essai++) {
    const c: CourbeTangente = { ia, ja, dp, dq, c2: parmi(C2), c3: parmi(C3) };
    if (lisibleAutourDeA(c, w)) return c;
  }
  return null;
}

function tirerDirect(variante: "direct" | "echelle"): ExerciceLectureTangente | null {
  const [sx, sy] = variante === "direct" ? [1, 1] : parmi([[1, 2], [2, 1]] as const);
  const [dp, dq] = parmi(PENTES);
  const ia = entier(-3, 3);
  const ja = entier(-3, 3);
  if (Math.abs(ia + dq) > FENETRE - 1 || Math.abs(ja + dp) > FENETRE - 1) return null;
  // Échelles différentes : la pente comptée en carreaux doit différer de la vraie pente.
  const c = courbeAutour(ia, ja, dp, dq, FENETRE);
  if (!c) return null;
  // Candidats P, Q, R : nœuds entiers visibles, hors de A.
  const cand: number[] = [];
  for (let u = -FENETRE + 1; u <= FENETRE - 1; u++) {
    if (Math.abs(u - ia) < 1) continue;
    if (Math.abs(g(c, u)) > FENETRE - 0.6) continue;
    cand.push(u);
  }
  if (cand.length < 3) return null;
  for (let essai = 0; essai < 30; essai++) {
    const pts = [...melange(cand.length)].slice(0, 3).map((i) => cand[i]!).sort((x, y) => x - y);
    if (pts[1]! - pts[0]! < 2 || pts[2]! - pts[1]! < 2) continue;
    const pentes = pts.map((u) => gp(c, u));
    const neg = pentes.map((p, i) => (p <= -0.4 ? i : -1)).filter((i) => i >= 0);
    if (neg.length !== 1 || pentes.some((p) => p > -0.4 && p < 0.4)) continue;
    const pos = [0, 1, 2].filter((i) => i !== neg[0]);
    const [i1, i2] = pos as [number, number];
    if (Math.abs(pentes[i1]! - pentes[i2]!) < 0.6) continue;
    const iMax = pentes[i1]! > pentes[i2]! ? i1 : i2;
    const ord = pts.map((u) => g(c, u));
    if (Math.abs(ord[0]! - ord[1]!) < 0.5 || Math.abs(ord[1]! - ord[2]!) < 0.5 || Math.abs(ord[0]! - ord[2]!) < 0.5) continue;
    const iBas = ord.indexOf(Math.min(...ord));
    const iHaut = ord.indexOf(Math.max(...ord));
    const bon: [number, number] = [neg[0]!, iMax];
    const pieg: [number, number] = [iBas, iHaut];
    if (pieg[0] === bon[0] && pieg[1] === bon[1]) continue;
    const autres: [number, number][] = [];
    for (let x = 0; x < 3; x++) for (let y = 0; y < 3; y++) if (x !== y && !(x === bon[0] && y === bon[1]) && !(x === pieg[0] && y === pieg[1])) autres.push([x, y]);
    const choisis = melange(autres.length).slice(0, 2).map((i) => autres[i]!);
    return { variante, sx, sy, courbe: c, points: pts, options: [bon, pieg, ...choisis], ordre: melange(4), candidats: [], types: [], ordreCandidats: [] };
  }
  return null;
}

function tirerInverse(): ExerciceLectureTangente | null {
  const w = FENETRE_CANDIDAT;
  const [dp, dq] = parmi(PENTES);
  const ia = entier(-2, 2);
  const ja = entier(-3, 3);
  if (Math.abs(ia + dq) > w - 1 || Math.abs(ja + dp) > w - 1) return null;
  const bon = courbeAutour(ia, ja, dp, dq, w);
  if (!bon) return null;
  const types: TypeCandidat[] = ["signe", "decale", "ordonnee"];
  // f(a) et f′(a) échangés : seulement si f′(a) est entier, différent de f(a), et lisible.
  if (dq === 1 && dp !== ja && Math.abs(dp) <= 3) types.push("echange");
  const choisis = melange(types.length).slice(0, 3).map((i) => types[i]!);
  const candidats: CourbeTangente[] = [bon];
  for (const t of choisis) {
    let c: CourbeTangente | null = null;
    if (t === "signe") {
      if (Math.abs(ia + dq) > w - 1 || Math.abs(ja - dp) > w - 1) return null;
      c = courbeAutour(ia, ja, -dp, dq, w);
    } else if (t === "decale") {
      const deltas = [-2 * dq, -dq, dq, 2 * dq].filter((d) => Math.abs(ia + d) <= 3 && Math.abs(ja + (dp * d) / dq) <= 3 && Math.abs(ia + d + dq) <= w - 1 && Math.abs(ja + (dp * d) / dq + dp) <= w - 1);
      if (deltas.length === 0) return null;
      const d = parmi(deltas);
      c = courbeAutour(ia + d, ja + (dp * d) / dq, dp, dq, w);
    } else if (t === "ordonnee") {
      const sauts = [-2, 2].filter((s) => Math.abs(ja + s) <= 3 && Math.abs(ja + s + dp) <= w - 1);
      if (sauts.length === 0) return null;
      c = courbeAutour(ia, ja + parmi(sauts), dp, dq, w);
    } else {
      // échange : point (a ; f′(a)), pente f(a).
      if (Math.abs(ia + 1) > w - 1 || Math.abs(dp + ja) > w - 1) return null;
      c = courbeAutour(ia, dp, ja, 1, w);
    }
    if (!c) return null;
    candidats.push(c);
  }
  return { variante: "inverse", sx: 1, sy: 1, courbe: bon, points: [], options: [], ordre: [], candidats, types: ["bon", ...choisis], ordreCandidats: melange(4) };
}

export function construire(variante: VarianteLectureTangente): ExerciceLectureTangente {
  for (;;) {
    const e = variante === "inverse" ? tirerInverse() : tirerDirect(variante);
    if (e) return e;
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteLectureTangente; label: string }[] = [
  { id: "direct", label: "Tangente tracée, même échelle sur les deux axes" },
  { id: "echelle", label: "Tangente tracée, échelles différentes en x et en y" },
  { id: "inverse", label: "Tangente donnée par son équation : choisir le graphique" },
];

export function construireAvecVarianteId(id: string): ExerciceLectureTangente {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceLectureTangente(): ExerciceLectureTangente {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
