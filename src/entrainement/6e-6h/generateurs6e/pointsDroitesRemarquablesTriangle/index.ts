import type {
  ExercicePDRT_A,
  ExercicePDRT_B,
  ExercicePDRT_C,
  ExercicePDRT_D,
  ExercicePDRT_E,
  ExercicePDRT_F,
  ExercicePDRT_G_CentreCote,
  ExercicePDRT_G_SommetDiagonale,
  ExercicePDRT_H,
  ExercicePointsDroitesRemarquablesTriangle,
  PositionPE,
} from "../../core6e/pointsDroitesRemarquablesTriangle.types";
import { droiteParDeuxPoints, intersection, milieu, parallele, perpendiculaire, projete, pt, ptEq, q, qNum, surDroite, tirerEntier, tirerParmi } from "../../moteur6e/algebreLieux";
import type { Pt } from "../../moteur6e/algebreLieux";

/**
 * `6gen54` — Constructions analytiques dans le triangle (6e ch. 9, § 1 ; audit, lots B et C).
 * Toutes les instances sont construites À REBOURS pour des valeurs petites et exactes (audit G13 :
 * coefficients jusqu'à 108 224 avant) ; les verdicts (famille E : nombre de droites) sont tirés
 * AVANT les points, à parts égales.
 */

const n = (p: Pt) => ({ x: qNum(p.x), y: qNum(p.y) });
const plus = (p: Pt, x: number, y: number) => pt(qNum(p.x) + x, qNum(p.y) + y);
const det = (u: { x: number; y: number }, v: { x: number; y: number }) => u.x * v.y - u.y * v.x;

function aireDoublee(A: Pt, B: Pt, C: Pt): number {
  const a = n(A);
  const b = n(B);
  const c = n(C);
  return det({ x: b.x - a.x, y: b.y - a.y }, { x: c.x - a.x, y: c.y - a.y });
}

/** Petites directions (normes 1, 2, 5, 10). */
const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
  { x: 1, y: -2 },
  { x: 2, y: -1 },
  { x: 3, y: 1 },
  { x: 1, y: 3 },
  { x: 3, y: -1 },
  { x: 1, y: -3 },
] as const;

const pointPair = (m: number) => pt(2 * tirerEntier(-m, m), 2 * tirerEntier(-m, m));
const point = (m: number) => pt(tirerEntier(-m, m), tirerEntier(-m, m));

export function construireFamilleA(): ExercicePDRT_A {
  for (;;) {
    const A = pointPair(4);
    const B = pointPair(4);
    const C = pointPair(4);
    if (Math.abs(aireDoublee(A, B, C)) < 24) continue;
    return { famille: "A", A, B, C, Ap: milieu(B, C), Bp: milieu(C, A), Cp: milieu(A, B) };
  }
}

const VECTEURS_ENTIERS: { x: number; y: number; l: number }[] = [];
for (const [x, y, l] of [
  [3, 4, 5],
  [4, 3, 5],
  [0, 5, 5],
  [0, 2, 2],
  [0, 3, 3],
  [0, 4, 4],
  [0, 6, 6],
  [6, 8, 10],
  [8, 6, 10],
] as const) {
  for (const sx of [1, -1]) for (const sy of [1, -1]) {
    VECTEURS_ENTIERS.push({ x: sx * x, y: sy * y, l });
    VECTEURS_ENTIERS.push({ x: sy * y, y: sx * x, l });
  }
}

export function construireFamilleB(): ExercicePDRT_B {
  for (;;) {
    const B = point(4);
    const vA = tirerParmi(VECTEURS_ENTIERS);
    const vC = tirerParmi(VECTEURS_ENTIERS);
    // Jamais isocèle en B (sinon I serait le milieu : le piège « bissectrice ≠ médiane » tomberait).
    if (vA.l === vC.l || det(vA, vC) === 0 || Math.abs(det(vA, vC)) < 6) continue;
    const A = plus(B, vA.x, vA.y);
    const C = plus(B, vC.x, vC.y);
    const s = vA.l + vC.l;
    // I = (BC·A + AB·C)/(AB + BC)
    const I = { x: q(Math.round(vC.l * qNum(A.x) + vA.l * qNum(C.x)), s), y: q(Math.round(vC.l * qNum(A.y) + vA.l * qNum(C.y)), s) };
    if (Number(I.x.d) > 8 || Number(I.y.d) > 8) continue;
    return { famille: "B", A, B, C, AB: vA.l, BC: vC.l, I };
  }
}

export function construireFamilleC(): ExercicePDRT_C {
  for (;;) {
    const A = point(4);
    const B = point(4);
    if (ptEq(A, B)) continue;
    const u = tirerParmi(DIRECTIONS);
    const P0 = point(3);
    const k = tirerEntier(2, 9);
    const ab = { x: qNum(B.x) - qNum(A.x), y: qNum(B.y) - qNum(A.y) };
    const M = det(ab, u);
    if (M === 0 || Math.abs(M) > 9) continue;
    const K = det(ab, { x: qNum(P0.x) - qNum(A.x), y: qNum(P0.y) - qNum(A.y) });
    const P1 = plus(P0, u.x, u.y);
    const d = droiteParDeuxPoints(P0, P1);
    if (surDroite(A, d) || surDroite(B, d)) continue;
    const t1 = q(2 * k - K, M);
    const t2 = q(-2 * k - K, M);
    if (Number(t1.d) > 4 || Number(t2.d) > 4) continue;
    const C = [t1, t2].map((t) => pt(qNum(P0.x) + qNum(t) * u.x, qNum(P0.y) + qNum(t) * u.y)) as [Pt, Pt];
    if (C.some((c) => Math.abs(qNum(c.x)) > 10 || Math.abs(qNum(c.y)) > 10)) continue;
    return { famille: "C", A, B, P0, u: { ...u }, d, k, K, M, t: [qNum(t1), qNum(t2)], C };
  }
}

export function construireFamilleD(): ExercicePDRT_D {
  for (;;) {
    const A = pointPair(4);
    const B = pointPair(4);
    const C = pointPair(4);
    if (Math.abs(aireDoublee(A, B, C)) < 24) continue;
    const medianeB = droiteParDeuxPoints(B, milieu(A, C));
    const medianeC = droiteParDeuxPoints(C, milieu(A, B));
    if (surDroite(A, medianeB) || surDroite(A, medianeC)) continue;
    if ([medianeB, medianeC].some((d) => Math.max(Math.abs(Number(d.a)), Math.abs(Number(d.b)), Math.abs(Number(d.c))) > 40)) continue;
    return { famille: "D", A, B, C, medianeB, medianeC, AB: droiteParDeuxPoints(A, B), BC: droiteParDeuxPoints(B, C), CA: droiteParDeuxPoints(C, A) };
  }
}

const POSITIONS_E: PositionPE[] = ["hors", "surAB", "milieu"];

export function construireFamilleE(position: PositionPE = tirerParmi(POSITIONS_E)): ExercicePDRT_E {
  for (;;) {
    const A = pointPair(3);
    const B = pointPair(3);
    if (ptEq(A, B)) continue;
    const ab = droiteParDeuxPoints(A, B);
    const M = milieu(A, B);
    let P: Pt;
    if (position === "milieu") P = M;
    else if (position === "surAB") {
      const g = Math.abs(gcd(qNum(B.x) - qNum(A.x), qNum(B.y) - qNum(A.y)));
      const pas = { x: (qNum(B.x) - qNum(A.x)) / g, y: (qNum(B.y) - qNum(A.y)) / g };
      const j = tirerParmi([-3, -2, -1, 1, 2, 3]);
      P = plus(M, j * pas.x, j * pas.y);
      if (Math.abs(qNum(P.x)) > 8 || Math.abs(qNum(P.y)) > 8) continue;
    } else {
      P = point(5);
      if (surDroite(P, ab)) continue;
    }
    const droites = position === "milieu" ? [] : position === "surAB" ? [ab] : [parallele(ab, P), droiteParDeuxPoints(P, M)];
    return { famille: "E", position, P, A, B, droites };
  }
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

const rot = (v: { x: number; y: number }) => ({ x: -v.y, y: v.x });

export function construireFamilleF(): ExercicePDRT_F {
  for (;;) {
    const A = point(4);
    const u = tirerParmi(DIRECTIONS);
    const s = tirerParmi([1, 2]);
    const B = plus(A, s * u.x, s * u.y);
    if (ptEq(A, B)) continue;
    const a = tirerEntier(-2, 3);
    const b = tirerParmi([-2, -1, 1, 2]);
    const nn = rot(u);
    const H = plus(A, a * u.x, a * u.y);
    const P = plus(H, b * nn.x, b * nn.y);
    const Q = plus(H, -b * nn.x, -b * nn.y);
    if ([P, Q, H].some((p) => Math.abs(qNum(p.x)) > 9 || Math.abs(qNum(p.y)) > 9)) continue;
    const droiteAB = droiteParDeuxPoints(A, B);
    return { famille: "F", A, B, P, droiteAB, perpendiculaire: perpendiculaire(droiteAB, P), H, Q };
  }
}

function vecteurCarre(): { x: number; y: number } {
  for (;;) {
    const v = { x: tirerEntier(-3, 3), y: tirerEntier(-3, 3) };
    if (v.x !== 0 || v.y !== 0) return v;
  }
}

export function construireSommetDiagonale(): ExercicePDRT_G_SommetDiagonale {
  const O = point(3);
  const v = vecteurCarre();
  const rv = rot(v);
  const B = plus(O, v.x, v.y);
  const D = plus(O, -v.x, -v.y);
  const A = plus(O, rv.x, rv.y);
  const C = plus(O, -rv.x, -rv.y);
  return { famille: "G", sousType: "sommetDiagonale", A, B, C, D, O, droiteBD: droiteParDeuxPoints(B, D) };
}

export function construireCentreCote(): ExercicePDRT_G_CentreCote {
  const P = point(3);
  const e = vecteurCarre();
  const re = rot(e);
  const M = plus(P, re.x, re.y);
  const A = plus(M, -e.x, -e.y);
  const B = plus(M, e.x, e.y);
  const C = pt(2 * qNum(P.x) - qNum(A.x), 2 * qNum(P.y) - qNum(A.y));
  const D = pt(2 * qNum(P.x) - qNum(B.x), 2 * qNum(P.y) - qNum(B.y));
  return { famille: "G", sousType: "centreCote", A, B, C, D, P, M, droiteAB: droiteParDeuxPoints(A, B) };
}

export function construireFamilleG() {
  return tirerParmi([construireSommetDiagonale, construireCentreCote] as const)();
}

export function construireFamilleH(): ExercicePDRT_H {
  for (;;) {
    const Q0 = point(3);
    const u = tirerParmi(DIRECTIONS);
    const nn = rot(u);
    const a = tirerEntier(-2, 2);
    const t = tirerParmi([-1, 1, 2]);
    if (a === t) continue; // incidence normale : rayon réfléchi = rayon incident
    const b = tirerParmi([-2, -1, 1, 2]);
    const H = plus(Q0, a * u.x, a * u.y);
    const P = plus(H, b * nn.x, b * nn.y);
    const Pp = plus(H, -b * nn.x, -b * nn.y);
    const M = plus(Q0, t * u.x, t * u.y);
    if ([P, Pp, M].some((p) => Math.abs(qNum(p.x)) > 9 || Math.abs(qNum(p.y)) > 9)) continue;
    const d = droiteParDeuxPoints(Q0, plus(Q0, u.x, u.y));
    return { famille: "H", contexte: tirerParmi(["miroir", "billard"] as const), P, M, d, Pp, rayonReflechi: droiteParDeuxPoints(Pp, M), rayonIncident: droiteParDeuxPoints(P, M) };
  }
}

export type IdVariantePointsDroitesRemarquablesTriangle = "A" | "B" | "C" | "D" | "E" | "F" | "G_sommetDiagonale" | "G_centreCote" | "H";

/** Catalogue (mêmes identifiants et même ordre qu'avant : les `?code=` déjà imprimés restent valables). */
export const CATALOGUE_VARIANTES: { id: IdVariantePointsDroitesRemarquablesTriangle; label: string }[] = [
  { id: "A", label: "A — Sommets depuis les milieux des côtés" },
  { id: "B", label: "B — Pied de la bissectrice sur le côté opposé" },
  { id: "C", label: "C — Point d'une droite à aire imposée" },
  { id: "D", label: "D — Côtés depuis un sommet et deux médianes" },
  { id: "E", label: "E — Droites équidistantes de deux points" },
  { id: "F", label: "F — Symétrique d'un point par rapport à une droite" },
  { id: "G_sommetDiagonale", label: "G — Carré : un sommet et une diagonale" },
  { id: "G_centreCote", label: "G — Carré : le centre et un côté" },
  { id: "H", label: "H — Rayon réfléchi (miroir, billard)" },
];

export function construireAvecVarianteId(id: string): ExercicePointsDroitesRemarquablesTriangle {
  switch (id as IdVariantePointsDroitesRemarquablesTriangle) {
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
    case "G_sommetDiagonale":
      return construireSommetDiagonale();
    case "G_centreCote":
      return construireCentreCote();
    default:
      return construireFamilleH();
  }
}

const CONSTRUCTEURS = [construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleD, construireFamilleE, construireFamilleF, construireFamilleG, construireFamilleH];

export function genererExercicePointsDroitesRemarquablesTriangle(): ExercicePointsDroitesRemarquablesTriangle {
  return tirerParmi(CONSTRUCTEURS)();
}

export { intersection, projete };
