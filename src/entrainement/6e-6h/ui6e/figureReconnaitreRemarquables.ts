import type { Exercice125, Pt } from "../core6e/reconnaitreRemarquables";
import {
  centreCirconscrit,
  centreGravite,
  cercleExinscrit,
  cercleInscrit,
  mil,
  orthocentre,
  ordreDepuis,
  pied,
  piedBissectrice,
  sommets125,
} from "../core6e/reconnaitreRemarquables";

/**
 * Figure de `6gen125` (écran ET papier) : triangle sans repère, objet remarquable en couleur avec
 * ses codages — moitiés égales (traits), angle droit (petit carré), angles égaux (arcs), points de
 * contact. Échelle unique (isotrope), cadrage automatique sur tout ce qui est tracé, aucun
 * identifiant SVG. `corrige` : l'objet est nommé dans la légende.
 */

const NOIR = "#1b1d22";
const COUL = "#c2410c";
const GRIS = "#6b7280";

interface Trace {
  segments: { A: Pt; B: Pt; couleur: string; largeur: number; pointille?: boolean }[];
  cercles: { c: Pt; r: number; couleur: string }[];
  points: { P: Pt; couleur: string; label?: string; dir?: Pt; creux?: boolean }[];
  /** Codages à dessiner après la mise à l'échelle (en px). */
  traits: { P: Pt; Q: Pt; n: number }[];
  angles: { F: Pt; u: Pt; v: Pt }[];
  arcs: { V: Pt; u: Pt; v: Pt; n: number; rayon: number }[];
}

const sub = (P: Pt, Q: Pt): Pt => ({ x: P.x - Q.x, y: P.y - Q.y });
const add = (P: Pt, Q: Pt): Pt => ({ x: P.x + Q.x, y: P.y + Q.y });
const mul = (P: Pt, k: number): Pt => ({ x: P.x * k, y: P.y * k });
const norme = (P: Pt) => Math.hypot(P.x, P.y);
const unit = (P: Pt): Pt => mul(P, 1 / (norme(P) || 1));

/** Segment de la droite (P, Q) prolongé de `avant` (côté P) et `apres` (côté Q), en fraction de PQ. */
function prolonge(P: Pt, Q: Pt, avant: number, apres: number): { A: Pt; B: Pt } {
  const u = sub(Q, P);
  return { A: add(P, mul(u, -avant)), B: add(Q, mul(u, apres)) };
}

/** Droite passant par M, de direction u, coupée à ±L. */
function droiteLongue(M: Pt, u: Pt, L: number): { A: Pt; B: Pt } {
  const w = unit(u);
  return { A: add(M, mul(w, -L)), B: add(M, mul(w, L)) };
}

function traceDe(e: Exercice125): Trace {
  const [A, B, C] = sommets125(e);
  const T: Trace = { segments: [], cercles: [], points: [], traits: [], angles: [], arcs: [] };
  const tri = (couleur = NOIR) => {
    T.segments.push({ A, B, couleur, largeur: 1.8 }, { A: B, B: C, couleur, largeur: 1.8 }, { A: C, B: A, couleur, largeur: 1.8 });
  };
  const { P, Q, R } = ordreDepuis(e);
  const cote = Math.max(norme(sub(B, A)), norme(sub(C, B)), norme(sub(A, C)));
  const sommets: [Pt, Pt, Pt][] = [
    [A, B, C],
    [B, C, A],
    [C, A, B],
  ];
  const mediane = (S: Pt, U: Pt, V: Pt, n: number, couleur: string, largeur: number) => {
    const M = mil(U, V);
    T.segments.push({ ...prolonge(S, M, 0.08, 0.18), couleur, largeur });
    T.traits.push({ P: U, Q: M, n }, { P: M, Q: V, n });
  };
  const hauteur = (S: Pt, U: Pt, V: Pt, couleur: string, largeur: number) => {
    const F = pied(S, U, V);
    T.segments.push({ ...prolonge(S, F, 0.08, 0.18), couleur, largeur });
    T.angles.push({ F, u: unit(sub(V, U)), v: unit(sub(S, F)) });
  };
  const mediatrice = (U: Pt, V: Pt, n: number, couleur: string, largeur: number) => {
    const M = mil(U, V);
    const w = { x: -(V.y - U.y), y: V.x - U.x };
    T.segments.push({ ...droiteLongue(M, w, cote * 0.62), couleur, largeur });
    T.traits.push({ P: U, Q: M, n }, { P: M, Q: V, n });
    T.angles.push({ F: M, u: unit(sub(V, U)), v: unit(w) });
  };
  const bissectrice = (S: Pt, U: Pt, V: Pt, n: number, couleur: string, largeur: number) => {
    const F = piedBissectrice(S, U, V);
    T.segments.push({ ...prolonge(S, F, 0.08, 0.2), couleur, largeur });
    const w = unit(sub(F, S));
    T.arcs.push({ V: S, u: unit(sub(U, S)), v: w, n, rayon: 0 }, { V: S, u: w, v: unit(sub(V, S)), n, rayon: 0 });
  };

  tri();
  switch (e.objet) {
    case "mediane":
      mediane(P, Q, R, 1, COUL, 2.4);
      break;
    case "hauteur":
      hauteur(P, Q, R, COUL, 2.4);
      break;
    case "mediatrice":
      mediatrice(Q, R, 1, COUL, 2.4);
      break;
    case "bissectrice":
      bissectrice(P, Q, R, 1, COUL, 2.4);
      break;
    case "G":
      sommets.forEach(([S, U, V], i) => mediane(S, U, V, i + 1, GRIS, 1.3));
      T.points.push({ P: centreGravite(A, B, C), couleur: COUL, label: "P" });
      break;
    case "H":
      sommets.forEach(([S, U, V]) => hauteur(S, U, V, GRIS, 1.3));
      T.points.push({ P: orthocentre(A, B, C), couleur: COUL, label: "P" });
      break;
    case "O":
      sommets.forEach(([, U, V], i) => mediatrice(U, V, i + 1, GRIS, 1.3));
      T.points.push({ P: centreCirconscrit(A, B, C), couleur: COUL, label: "P" });
      break;
    case "I":
      sommets.forEach(([S, U, V], i) => bissectrice(S, U, V, i + 1, GRIS, 1.3));
      T.points.push({ P: cercleInscrit(A, B, C).centre, couleur: COUL, label: "P" });
      break;
    case "circonscrit": {
      const O = centreCirconscrit(A, B, C);
      T.cercles.push({ c: O, r: norme(sub(A, O)), couleur: COUL });
      break;
    }
    case "inscrit": {
      const { centre, r } = cercleInscrit(A, B, C);
      T.cercles.push({ c: centre, r, couleur: COUL });
      for (const [U, V] of [
        [A, B],
        [B, C],
        [C, A],
      ] as const)
        T.points.push({ P: pied(centre, U, V), couleur: COUL, creux: true });
      break;
    }
    case "exinscrit": {
      const { centre, r } = cercleExinscrit(P, Q, R);
      T.cercles.push({ c: centre, r, couleur: COUL });
      // Côtés issus de P prolongés au-delà de Q et de R (en pointillé), points de contact.
      const tq = pied(centre, P, Q);
      const tr = pied(centre, P, R);
      const loin = (S: Pt, X: Pt) => add(X, mul(unit(sub(X, S)), r * 0.9));
      T.segments.push({ A: Q, B: loin(P, tq), couleur: NOIR, largeur: 1.2, pointille: true }, { A: R, B: loin(P, tr), couleur: NOIR, largeur: 1.2, pointille: true });
      T.points.push({ P: tq, couleur: COUL, creux: true }, { P: tr, couleur: COUL, creux: true }, { P: pied(centre, Q, R), couleur: COUL, creux: true });
      break;
    }
    case "neufPoints": {
      const O = centreCirconscrit(A, B, C);
      const H = orthocentre(A, B, C);
      const N = mil(O, H);
      const Ma = mil(B, C);
      T.cercles.push({ c: N, r: norme(sub(Ma, N)), couleur: COUL });
      sommets.forEach(([S, U, V], i) => {
        const M = mil(U, V);
        const F = pied(S, U, V);
        T.segments.push({ A: S, B: F, couleur: GRIS, largeur: 1.1, pointille: true });
        T.angles.push({ F, u: unit(sub(V, U)), v: unit(sub(S, F)) });
        T.traits.push({ P: U, Q: M, n: i + 1 }, { P: M, Q: V, n: i + 1 });
        T.points.push({ P: M, couleur: COUL, creux: true }, { P: F, couleur: COUL, creux: true }, { P: mil(S, H), couleur: COUL, creux: true });
      });
      break;
    }
  }
  return T;
}

const f2 = (v: number) => String(Math.round(v * 10) / 10);

export function figure125(e: Exercice125, legende?: string): string {
  const T = traceDe(e);
  const [A, B, C] = sommets125(e);
  // Cadrage : tout ce qui est tracé.
  const xs: number[] = [];
  const ys: number[] = [];
  const prendre = (p: Pt) => {
    xs.push(p.x);
    ys.push(p.y);
  };
  [A, B, C].forEach(prendre);
  T.segments.forEach((s) => {
    prendre(s.A);
    prendre(s.B);
  });
  T.cercles.forEach((c) => {
    prendre({ x: c.c.x - c.r, y: c.c.y - c.r });
    prendre({ x: c.c.x + c.r, y: c.c.y + c.r });
  });
  T.points.forEach((p) => prendre(p.P));
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const LMAX = 320;
  const HMAX = 250;
  const m = 22;
  const k = Math.min((LMAX - 2 * m) / (xMax - xMin || 1), (HMAX - 2 * m) / (yMax - yMin || 1));
  const W = (xMax - xMin) * k + 2 * m;
  const H = (yMax - yMin) * k + 2 * m + (legende ? 20 : 0);
  const X = (p: Pt) => m + (p.x - xMin) * k;
  const Y = (p: Pt) => m + (yMax - p.y) * k;
  const px = (p: Pt) => ({ x: X(p), y: Y(p) });
  const parts: string[] = [`<rect x="0" y="0" width="${f2(W)}" height="${f2(H)}" fill="#ffffff"/>`];
  for (const c of T.cercles) parts.push(`<circle cx="${f2(X(c.c))}" cy="${f2(Y(c.c))}" r="${f2(c.r * k)}" fill="none" stroke="${c.couleur}" stroke-width="2.2"/>`);
  for (const s of T.segments) {
    parts.push(`<line x1="${f2(X(s.A))}" y1="${f2(Y(s.A))}" x2="${f2(X(s.B))}" y2="${f2(Y(s.B))}" stroke="${s.couleur}" stroke-width="${s.largeur}"${s.pointille ? ' stroke-dasharray="5 4"' : ""} stroke-linecap="round"/>`);
  }
  // Traits de codage (moitiés égales), perpendiculaires au segment, au milieu de chaque moitié.
  for (const tr of T.traits) {
    const a = px(tr.P);
    const b = px(tr.Q);
    const mm = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const u = unit({ x: b.x - a.x, y: b.y - a.y });
    const nrm = { x: -u.y, y: u.x };
    for (let i = 0; i < tr.n; i++) {
      const off = (i - (tr.n - 1) / 2) * 3.6;
      const c = { x: mm.x + u.x * off, y: mm.y + u.y * off };
      parts.push(`<line x1="${f2(c.x - nrm.x * 5)}" y1="${f2(c.y - nrm.y * 5)}" x2="${f2(c.x + nrm.x * 5)}" y2="${f2(c.y + nrm.y * 5)}" stroke="${NOIR}" stroke-width="1.4"/>`);
    }
  }
  // Angles droits (petit carré dans l'angle formé par u et v, vecteurs de figure).
  for (const ag of T.angles) {
    const F = px(ag.F);
    const u = unit({ x: ag.u.x, y: -ag.u.y });
    const v = unit({ x: ag.v.x, y: -ag.v.y });
    const s = 8;
    const p1 = { x: F.x + u.x * s, y: F.y + u.y * s };
    const p2 = { x: F.x + u.x * s + v.x * s, y: F.y + u.y * s + v.y * s };
    const p3 = { x: F.x + v.x * s, y: F.y + v.y * s };
    parts.push(`<polyline points="${f2(p1.x)},${f2(p1.y)} ${f2(p2.x)},${f2(p2.y)} ${f2(p3.x)},${f2(p3.y)}" fill="none" stroke="${NOIR}" stroke-width="1.2"/>`);
  }
  // Arcs d'angles égaux (n arcs concentriques par moitié d'angle).
  for (const ar of T.arcs) {
    const V = px(ar.V);
    const u = unit({ x: ar.u.x, y: -ar.u.y });
    const v = unit({ x: ar.v.x, y: -ar.v.y });
    for (let i = 0; i < ar.n; i++) {
      const r = 15 + i * 3.5;
      const a1 = { x: V.x + u.x * r, y: V.y + u.y * r };
      const a2 = { x: V.x + v.x * r, y: V.y + v.y * r };
      const balayage = u.x * v.y - u.y * v.x > 0 ? 1 : 0;
      parts.push(`<path d="M${f2(a1.x)},${f2(a1.y)} A${f2(r)},${f2(r)} 0 0 ${balayage} ${f2(a2.x)},${f2(a2.y)}" fill="none" stroke="${NOIR}" stroke-width="1.2"/>`);
    }
  }
  for (const p of T.points) {
    const c = px(p.P);
    parts.push(p.creux ? `<circle cx="${f2(c.x)}" cy="${f2(c.y)}" r="3" fill="#ffffff" stroke="${p.couleur}" stroke-width="1.5"/>` : `<circle cx="${f2(c.x)}" cy="${f2(c.y)}" r="3.6" fill="${p.couleur}"/>`);
    if (p.label) parts.push(`<text x="${f2(c.x + 7)}" y="${f2(c.y - 6)}" font-size="14" font-weight="700" fill="${p.couleur}" font-family="sans-serif" stroke="#ffffff" stroke-width="3" paint-order="stroke">${p.label}</text>`);
  }
  // Noms des sommets, vers l'extérieur (depuis le centre de gravité).
  const G = centreGravite(A, B, C);
  [A, B, C].forEach((S, i) => {
    const dir = unit(sub(S, G));
    const c = px(S);
    const x = c.x + dir.x * 13;
    const y = c.y - dir.y * 13 + 5;
    parts.push(`<text x="${f2(x)}" y="${f2(y)}" font-size="14" text-anchor="middle" fill="${NOIR}" font-family="sans-serif" font-weight="600" stroke="#ffffff" stroke-width="3" paint-order="stroke">${e.noms[i]}</text>`);
  });
  if (legende) parts.push(`<text x="${f2(W / 2)}" y="${f2(H - 6)}" font-size="12.5" text-anchor="middle" fill="${COUL}" font-family="sans-serif">${legende}</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${f2(W)}" height="${f2(H)}" viewBox="0 0 ${f2(W)} ${f2(H)}" role="img">${parts.join("")}</svg>`;
}
