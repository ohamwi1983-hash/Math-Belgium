import type { DonneesTriangle, ExerciceCercles, ExerciceCerclesA, ExerciceCerclesB, ExerciceCerclesC, ExerciceCerclesD, ExerciceCerclesE, ExerciceCerclesF, ExerciceCerclesG } from "../../core6e/cercles.types";
import { dist2, droiteNormale, droiteNormalisee, droiteParDeuxPoints, intersection, mediatrice, pt, ptEq, q, qAdd, qDiv, qMul, qNum, qSub, tirerEntier, tirerParmi } from "../../moteur6e/algebreLieux";
import type { Pt } from "../../moteur6e/algebreLieux";

/**
 * `6gen55` — Cercles (6e ch. 9, § 2 ; audit, lots B et C). Instances construites À REBOURS pour des
 * valeurs bornées et exactes (avant : centres jusqu'à 145, triangles aplatis, décimaux à point) ;
 * B : nombre de cercles (0, 1 ou 2) tiré AVANT les points, à parts égales ; D : l'un ou l'autre axe ;
 * G : « un des quatre cercles tangents », inscrit (G) ou exinscrit (G_exinscrit, ajouté en fin).
 */

const N = (p: Pt) => ({ x: qNum(p.x), y: qNum(p.y) });
const P = (x: number, y: number) => pt(x, y);

/** Vecteurs entiers par norme au carré. */
function vecteursDeNorme(n2: number): { x: number; y: number }[] {
  const r: { x: number; y: number }[] = [];
  const m = Math.floor(Math.sqrt(n2));
  for (let x = -m; x <= m; x++) for (let y = -m; y <= m; y++) if (x * x + y * y === n2) r.push({ x, y });
  return r;
}

export function construireFamilleA(): ExerciceCerclesA {
  for (;;) {
    const h = tirerEntier(-4, 4);
    const k = tirerEntier(-4, 4);
    const r2 = tirerParmi([5, 10, 13, 25]);
    const vs = vecteursDeNorme(r2);
    const pris = [...vs].sort(() => Math.random() - 0.5).slice(0, 3);
    const [A, B, C] = pris.map((v) => P(h + v.x, k + v.y));
    const aire = Math.abs((qNum(B.x) - qNum(A.x)) * (qNum(C.y) - qNum(A.y)) - (qNum(B.y) - qNum(A.y)) * (qNum(C.x) - qNum(A.x)));
    if (aire < 4) continue;
    return { famille: "A", A, B, C, D: -2 * h, E: -2 * k, F: h * h + k * k - r2, centre: P(h, k), r2: q(r2) };
  }
}

export function construireFamilleB(verdict: 0 | 1 | 2 = tirerParmi([0, 1, 2] as const)): ExerciceCerclesB {
  for (;;) {
    const M = P(tirerEntier(-3, 3), tirerEntier(-3, 3));
    const v = { x: tirerEntier(-3, 3), y: tirerEntier(-3, 3) };
    const v2 = v.x * v.x + v.y * v.y;
    if (v2 < 2) continue;
    const g = Math.abs(gcd(v.x, v.y));
    const u = { x: -v.y / g, y: v.x / g };
    const A = P(qNum(M.x) - v.x, qNum(M.y) - v.y);
    const B = P(qNum(M.x) + v.x, qNum(M.y) + v.y);
    let r2: number;
    let centres: Pt[] = [];
    if (verdict === 2) {
      const s = tirerEntier(1, 3);
      r2 = v2 + s * s * (u.x * u.x + u.y * u.y);
      centres = [P(qNum(M.x) + s * u.x, qNum(M.y) + s * u.y), P(qNum(M.x) - s * u.x, qNum(M.y) - s * u.y)];
    } else if (verdict === 1) {
      r2 = v2;
      centres = [M];
    } else {
      r2 = tirerEntier(Math.max(1, Math.ceil(v2 / 3)), v2 - 1);
    }
    if (r2 > 40) continue;
    return { famille: "B", verdict, A, B, r2: q(r2), mediatrice: mediatrice(A, B), centres };
  }
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
  { x: 1, y: -2 },
  { x: 2, y: -1 },
];

export function construireFamilleC(): ExerciceCerclesC {
  for (;;) {
    const O = P(tirerEntier(-4, 4), tirerEntier(-4, 4));
    const n2 = tirerParmi([5, 10, 13, 25]);
    const vs = vecteursDeNorme(n2);
    const w1 = tirerParmi(vs);
    const w2 = tirerParmi(vs);
    if ((w1.x === w2.x && w1.y === w2.y) || (w1.x === -w2.x && w1.y === -w2.y)) continue;
    const A = P(qNum(O.x) + w1.x, qNum(O.y) + w1.y);
    const B = P(qNum(O.x) + w2.x, qNum(O.y) + w2.y);
    const med = mediatrice(A, B);
    const u = tirerParmi(DIRECTIONS);
    const d = droiteNormale(O, q(-u.y), q(u.x));
    if (Number(d.a) * Number(med.b) - Number(d.b) * Number(med.a) === 0) continue; // d parallèle (ou égale) à la médiatrice
    if (Math.max(Math.abs(Number(d.c)), Math.abs(Number(med.c))) > 30) continue;
    return { famille: "C", A, B, d, mediatrice: med, centre: O, r2: q(n2) };
  }
}

export function construireFamilleD(): ExerciceCerclesD {
  for (;;) {
    const axe = tirerParmi(["abscisses", "ordonnees"] as const);
    const t = tirerEntier(-4, 4);
    const dx = tirerParmi([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
    const h = tirerParmi([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
    // Repère « tangent à l'axe des abscisses » : T(t ; 0), A(t + dx ; h), Ω(t ; k), k = (dx² + h²)/(2h).
    const k = q(dx * dx + h * h, 2 * h);
    if (Number(k.d) > 4 || Math.abs(qNum(k)) > 9 || Math.abs(qNum(k)) < 1) continue;
    const swap = (x: number, y: number) => (axe === "abscisses" ? P(x, y) : P(y, x));
    const T = swap(t, 0);
    const A = swap(t + dx, h);
    const centre = axe === "abscisses" ? { x: q(t), y: k } : { x: k, y: q(t) };
    return { famille: "D", axe, A, T, k, centre, r2: qMul(k, k) };
  }
}

/** Triangles à sommets entiers et côtés entiers (incentre et rayons rationnels). */
const TRIANGLES: [number, number][][] = [
  [
    [0, 0],
    [3, 0],
    [0, 4],
  ],
  [
    [0, 0],
    [6, 0],
    [0, 8],
  ],
  [
    [0, 0],
    [6, 0],
    [3, 4],
  ],
  [
    [0, 0],
    [8, 0],
    [4, 3],
  ],
  [
    [0, 0],
    [12, 0],
    [6, 8],
  ],
  [
    [0, 0],
    [14, 0],
    [5, 12],
  ],
  [
    [0, 0],
    [4, 0],
    [-5, 12],
  ],
  [
    [0, 0],
    [9, 0],
    [0, 12],
  ],
];

function longueur(a: Pt, b: Pt): number {
  return Math.round(Math.sqrt(qNum(dist2(a, b))));
}

function tirerTriangle(etendueMax = 14): DonneesTriangle {
  for (;;) {
    const base = tirerParmi(TRIANGLES);
    const sym = tirerEntier(0, 7);
    const tr = ([x, y]: [number, number]): [number, number] => {
      let [a, b] = [x, y];
      if (sym & 1) [a, b] = [b, a];
      if (sym & 2) a = -a;
      if (sym & 4) b = -b;
      return [a, b];
    };
    const pts = base.map(tr);
    const xs = pts.map((p) => p[0]);
    const ys = pts.map((p) => p[1]);
    if (Math.max(...xs) - Math.min(...xs) > etendueMax || Math.max(...ys) - Math.min(...ys) > etendueMax) continue;
    const dx = tirerEntier(-7 - Math.min(...xs), 7 - Math.max(...xs));
    const dy = tirerEntier(-7 - Math.min(...ys), 7 - Math.max(...ys));
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) continue;
    const ordre = [0, 1, 2].sort(() => Math.random() - 0.5);
    const [A, B, C] = ordre.map((i) => P(pts[i][0] + dx, pts[i][1] + dy));
    const aire2 = Math.abs((qNum(B.x) - qNum(A.x)) * (qNum(C.y) - qNum(A.y)) - (qNum(B.y) - qNum(A.y)) * (qNum(C.x) - qNum(A.x)));
    return { A, B, C, a: longueur(B, C), b: longueur(C, A), c: longueur(A, B), aire: q(aire2, 2) };
  }
}

/** Centre pondéré (wa·A + wb·B + wc·C)/(wa + wb + wc). */
function barycentre(t: DonneesTriangle, wa: number, wb: number, wc: number): Pt {
  const s = wa + wb + wc;
  const c = (k: "x" | "y") => qDiv(qAdd(qAdd(qMul(q(wa), t.A[k]), qMul(q(wb), t.B[k])), qMul(q(wc), t.C[k])), q(s));
  return { x: c("x"), y: c("y") };
}

export function construireFamilleE(): ExerciceCerclesE {
  const t = tirerTriangle(14);
  const s = (t.a + t.b + t.c) / 2;
  return { famille: "E", triangle: t, centre: barycentre(t, t.a, t.b, t.c), r: qDiv(t.aire, qDepuisDemi(s)) };
}

function qDepuisDemi(s: number) {
  return q(Math.round(2 * s), 2);
}

export function construireFamilleF(): ExerciceCerclesF {
  for (;;) {
    const centre = P(tirerEntier(-4, 4), tirerEntier(-4, 4));
    const n = tirerParmi([
      { a: 1, b: 0 },
      { a: 0, b: 1 },
      { a: 1, b: 1 },
      { a: 1, b: -1 },
      { a: 1, b: 2 },
      { a: 2, b: -1 },
      { a: 3, b: 4 },
      { a: 4, b: -3 },
      { a: 1, b: 3 },
    ]);
    const c = tirerEntier(-12, 12);
    const v = n.a * qNum(centre.x) + n.b * qNum(centre.y) + c;
    if (v === 0) continue;
    const nn = n.a * n.a + n.b * n.b;
    const d2 = q(v * v, nn);
    if (qNum(d2) > 16) continue;
    const L = tirerParmi([2, 4, 6, 8]);
    const r2 = qAdd(d2, q((L / 2) * (L / 2)));
    const dd = droiteNormalisee(q(n.a), q(n.b), q(c));
    // Pied H de la perpendiculaire, puis extrémités de la corde à ± L/2.
    const nc = { x: qNum(centre.x), y: qNum(centre.y) };
    const H = { x: nc.x - (n.a * v) / nn, y: nc.y - (n.b * v) / nn };
    const ud = { x: -n.b / Math.sqrt(nn), y: n.a / Math.sqrt(nn) };
    const corde: ExerciceCerclesF["corde"] = [
      { x: H.x + (ud.x * L) / 2, y: H.y + (ud.y * L) / 2 },
      { x: H.x - (ud.x * L) / 2, y: H.y - (ud.y * L) / 2 },
    ];
    return { famille: "F", centre, d: dd, L, dist2: d2, r2, corde };
  }
}

export function construireFamilleG(mode: "inscrit" | "exinscrit" = "inscrit"): ExerciceCerclesG {
  for (;;) {
    const t = tirerTriangle(mode === "inscrit" ? 14 : 9);
    const s = (t.a + t.b + t.c) / 2;
    const sommet = tirerParmi(["A", "B", "C"] as const);
    let centre: Pt;
    let r;
    if (mode === "inscrit") {
      centre = barycentre(t, t.a, t.b, t.c);
      r = qDiv(t.aire, qDepuisDemi(s));
    } else {
      const cote = sommet === "A" ? t.a : sommet === "B" ? t.b : t.c;
      centre = sommet === "A" ? barycentre(t, -t.a, t.b, t.c) : sommet === "B" ? barycentre(t, t.a, -t.b, t.c) : barycentre(t, t.a, t.b, -t.c);
      r = qDiv(t.aire, qSub(qDepuisDemi(s), q(cote)));
      if (qNum(r) > 6 || Math.abs(qNum(centre.x)) > 14 || Math.abs(qNum(centre.y)) > 14) continue;
    }
    return { famille: "G", mode, sommet, triangle: t, AB: droiteParDeuxPoints(t.A, t.B), BC: droiteParDeuxPoints(t.B, t.C), CA: droiteParDeuxPoints(t.C, t.A), centre, r };
  }
}

export type IdVarianteCercles = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "G_exinscrit";

/** Catalogue : identifiants et ordre d'avant gardés, « G_exinscrit » ajouté EN FIN. */
export const CATALOGUE_VARIANTES: { id: IdVarianteCercles; label: string }[] = [
  { id: "A", label: "A — Cercle par trois points" },
  { id: "B", label: "B — Cercle par deux points, rayon donné" },
  { id: "C", label: "C — Cercle par deux points, centre sur une droite" },
  { id: "D", label: "D — Cercle tangent à un axe en un point donné" },
  { id: "E", label: "E — Cercle inscrit dans un triangle" },
  { id: "F", label: "F — Cercle qui découpe une corde de longueur donnée" },
  { id: "G", label: "G — Trois droites : le cercle inscrit" },
  { id: "G_exinscrit", label: "G — Trois droites : un cercle exinscrit" },
];

export function construireAvecVarianteId(id: string): ExerciceCercles {
  switch (id as IdVarianteCercles) {
    case "A":
      return construireFamilleA();
    case "B":
      return construireFamilleB();
    case "C":
      return construireFamilleC();
    case "D":
      return construireFamilleD();
    case "E":
      return construireFamilleE();
    case "F":
      return construireFamilleF();
    case "G":
      return construireFamilleG("inscrit");
    default:
      return construireFamilleG("exinscrit");
  }
}

export function genererExerciceCercles(): ExerciceCercles {
  const id = tirerParmi(["A", "B", "C", "D", "E", "F", "G"] as const);
  if (id === "G") return construireFamilleG(Math.random() < 0.5 ? "inscrit" : "exinscrit");
  return construireAvecVarianteId(id);
}

export { intersection, ptEq, N };

