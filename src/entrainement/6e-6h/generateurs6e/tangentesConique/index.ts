import type { DroiteMK, ExerciceTangenteA, ExerciceTangenteB, ExerciceTangenteC, ExerciceTangenteD, ExerciceTangenteE, ExerciceTangentesConique } from "../../core6e/tangentesConique.types";
import type { Axe, Conique } from "../../moteur6e/algebreConiques";
import { racineQ } from "../../moteur6e/algebreConiques";
import { droiteParDeuxPoints, estCarreParfait, pt, q, qAdd, qDiv, qMul, qNeg, qNum, qSub, tirerEntier, tirerParmi } from "../../moteur6e/algebreLieux";
import type { Pt, Q } from "../../moteur6e/algebreLieux";
import { entiers, quadratique } from "../intersectionsConiques";

/**
 * `6gen62` — Tangentes à une conique (6e ch. 10 ; audit, lots B et C). Valeurs exactes partout (G21),
 * hyperbole d'axe focal vertical juste (G19 : condition k² = a² − b²m²), parabole y² = 2px (décision 1),
 * verdicts tirés AVANT les paramètres (B : deux tangentes ou aucune ; C : P extérieur ou intérieur, tiré
 * PRÈS de la frontière des deux côtés — G22), E : droite qui ne coupe jamais la conique (G20).
 */

export interface FormeCentree {
  X: Q;
  Y: Q;
  sx: 1 | -1;
  sy: 1 | -1;
}

/** σx·x²/X + σy·y²/Y = 1. */
export function formeCentree(c: Conique): FormeCentree {
  if (c.type !== "ellipse" && c.type !== "hyperbole") throw new Error("conique centrée attendue");
  const [X, Y] = c.axe === "x" ? [c.a2, c.b2] : [c.b2, c.a2];
  if (c.type === "ellipse") return { X, Y, sx: 1, sy: 1 };
  return c.axe === "x" ? { X, Y, sx: 1, sy: -1 } : { X, Y, sx: -1, sy: 1 };
}

/** k² pour une tangente de pente m : σx·m²X + σy·Y. */
export function k2Tangente(f: FormeCentree, m: Q): Q {
  return qAdd(qMul(q(f.sx), qMul(qMul(m, m), f.X)), qMul(q(f.sy), f.Y));
}

/** Point de contact de la tangente y = mx + k : (−σx·mX/k ; σy·Y/k). */
export function pointContact(f: FormeCentree, d: DroiteMK): Pt {
  return { x: qNeg(qDiv(qMul(q(f.sx), qMul(d.m, f.X)), d.k)), y: qDiv(qMul(q(f.sy), f.Y), d.k) };
}

const T_ELLIPSE: Q[] = [q(1, 2), q(-1, 2), q(1, 3), q(-1, 3), q(2), q(-2), q(3), q(-3), q(2, 3), q(-2, 3), q(3, 2), q(-3, 2), q(1), q(-1)];
const T_HYPERBOLE: Q[] = [q(1, 2), q(-1, 2), q(1, 3), q(-1, 3), q(2), q(-2), q(3), q(-3), q(2, 3), q(-2, 3), q(3, 2), q(-3, 2)];
const PENTES: Q[] = [q(1), q(-1), q(2), q(-2), q(1, 2), q(-1, 2), q(3), q(-3), q(1, 3), q(-1, 3), q(3, 2), q(-3, 2), q(2, 3), q(-2, 3), q(3, 4), q(-3, 4), q(4, 3), q(-4, 3)];

/** Point rationnel de la conique centrée (paramétrage rationnel). */
function pointRationnel(c: Conique, t: Q): Pt {
  if (c.type !== "ellipse" && c.type !== "hyperbole") throw new Error("conique centrée attendue");
  const a = q(Math.round(Math.sqrt(qNum(c.a2))));
  const b = q(Math.round(Math.sqrt(qNum(c.b2))));
  const un = q(1);
  const t2 = qMul(t, t);
  const s = Math.random() < 0.5 ? 1 : -1;
  const [u, v] = c.type === "ellipse" ? [qDiv(qMul(a, qSub(un, t2)), qAdd(un, t2)), qDiv(qMul(qMul(q(2), b), t), qAdd(un, t2))] : [qMul(q(s), qDiv(qMul(a, qAdd(un, t2)), qSub(un, t2))), qDiv(qMul(qMul(q(2), b), t), qSub(un, t2))];
  return c.axe === "x" ? { x: u, y: v } : { x: v, y: u };
}

const petit = (r: Q, den = 12, num = 40) => Number(r.d) <= den && Math.abs(Number(r.n)) <= num;
const centree = (type: "ellipse" | "hyperbole", axe: Axe, a: number, b: number): Extract<Conique, { type: "ellipse" | "hyperbole" }> => ({ type, centre: pt(0, 0), axe, a2: q(a * a), b2: q(b * b) });
const demiAxes = (type: "ellipse" | "hyperbole"): [number, number] => {
  for (;;) {
    const a = tirerEntier(type === "ellipse" ? 2 : 1, type === "ellipse" ? 7 : 6);
    const b = type === "ellipse" ? tirerEntier(1, a - 1) : tirerEntier(1, 6);
    return [a, b];
  }
};

export function construireA(type: "ellipse" | "hyperbole" | "paraboleX" | "paraboleY" = tirerParmi(["ellipse", "hyperbole", "paraboleX", "paraboleY"] as const)): ExerciceTangenteA {
  for (;;) {
    let conique: Conique;
    let P: Pt;
    let pente: Q;
    if (type === "paraboleX" || type === "paraboleY") {
      const p = tirerEntier(1, 6);
      const sens = tirerParmi([1, -1] as const);
      const v = tirerParmi([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
      const w = q(v * v, 2 * sens * p);
      if (type === "paraboleX") {
        conique = { type: "parabole", sommet: pt(0, 0), axe: "x", sens, p: q(p) };
        P = { x: w, y: q(v) };
        pente = q(sens * p, v);
      } else {
        conique = { type: "parabole", sommet: pt(0, 0), axe: "y", sens, p: q(p) };
        P = { x: q(v), y: w };
        pente = q(v, sens * p);
      }
    } else {
      const [a, b] = demiAxes(type);
      conique = centree(type, tirerParmi(["x", "y"] as const), a, b);
      P = pointRationnel(conique, tirerParmi(type === "ellipse" ? T_ELLIPSE : T_HYPERBOLE));
      if (P.y.n === 0n || P.x.n === 0n) continue;
      const f = formeCentree(conique);
      pente = qNeg(qDiv(qMul(q(f.sx), qMul(f.Y, P.x)), qMul(q(f.sy), qMul(f.X, P.y))));
    }
    if (!petit(P.x) || !petit(P.y) || !petit(pente, 12, 30) || Math.abs(qNum(P.x)) > 12 || Math.abs(qNum(P.y)) > 12) continue;
    const tangente = droiteParDeuxPoints(P, { x: qAdd(P.x, q(1)), y: qAdd(P.y, pente) });
    if ([tangente.a, tangente.b, tangente.c].some((x) => (x < 0n ? -x : x) > 200n)) continue;
    return { famille: "A", conique, P, pente, tangente };
  }
}

export function construireB(verdict: 0 | 2 = tirerParmi([0, 2] as const)): ExerciceTangenteB {
  for (;;) {
    const [a, b] = demiAxes("hyperbole");
    const conique = centree("hyperbole", tirerParmi(["x", "y"] as const), a, b) as Extract<Conique, { type: "hyperbole" }>;
    const f = formeCentree(conique);
    const m = tirerParmi(PENTES);
    const k2 = k2Tangente(f, m);
    if (k2.n === 0n) continue;
    if (verdict === 2 && (k2.n < 0n || !estCarreParfait(k2))) continue;
    if (verdict === 0 && k2.n > 0n) continue;
    const c0 = q(tirerParmi([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]));
    const tangentes = verdict === 2 ? [racineQ(k2), qNeg(racineQ(k2))].map((k) => ({ m, k })) : [];
    if (tangentes.some((t) => !petit(t.k, 12, 40))) continue;
    return { famille: "B", verdict, conique, d: { m, k: c0 }, k2, tangentes };
  }
}

export function construireC(verdict: 0 | 2 = tirerParmi([0, 2] as const)): ExerciceTangenteC {
  for (;;) {
    const [a, b] = demiAxes("ellipse");
    const conique = centree("ellipse", tirerParmi(["x", "y"] as const), a, b) as Extract<Conique, { type: "ellipse" }>;
    const f = formeCentree(conique);
    const lim = Math.max(a, b) + 2;
    const P = { x: q(tirerEntier(-2 * lim, 2 * lim), 2), y: q(tirerEntier(-2 * lim, 2 * lim), 2) };
    const v = qSub(qAdd(qDiv(qMul(P.x, P.x), f.X), qDiv(qMul(P.y, P.y), f.Y)), q(1));
    const vn = qNum(v);
    if (verdict === 0 && !(vn < 0 && vn >= -0.6)) continue;
    if (verdict === 2 && !(vn > 0 && vn <= 1.2)) continue;
    const A = qSub(qMul(P.x, P.x), f.X);
    if (A.n === 0n) continue;
    // Équation en m à coefficients entiers premiers entre eux (premier coefficient positif).
    const eqM = entiers([A, qMul(q(-2), qMul(P.x, P.y)), qSub(qMul(P.y, P.y), f.Y)]).map((x) => q(x)) as [Q, Q, Q];
    let tangentes: DroiteMK[] = [];
    if (verdict === 2) {
      const disc4 = qMul(qMul(f.X, f.Y), v);
      if (!estCarreParfait(disc4)) continue;
      const r = racineQ(disc4);
      const ms = [qDiv(qAdd(qMul(P.x, P.y), r), A), qDiv(qSub(qMul(P.x, P.y), r), A)];
      tangentes = ms.map((m) => ({ m, k: qSub(P.y, qMul(m, P.x)) }));
      if (tangentes.some((t) => !petit(t.m, 12, 30) || !petit(t.k, 12, 40))) continue;
    }
    return { famille: "C", verdict, conique, P, eqM, tangentes };
  }
}

export function construireD(type: "ellipse" | "hyperbole" = tirerParmi(["ellipse", "hyperbole"] as const), axe: Axe = tirerParmi(["x", "y"] as const)): ExerciceTangenteD {
  for (;;) {
    const [a, b] = demiAxes(type);
    if (a === b) continue;
    const conique = centree(type, axe, a, b);
    const f = formeCentree(conique);
    const T = type === "ellipse" ? T_ELLIPSE : T_HYPERBOLE;
    const P = pointRationnel(conique, tirerParmi(T));
    const Tc = pointRationnel(conique, tirerParmi(T));
    if (Tc.y.n === 0n || (P.x.n === Tc.x.n && P.x.d === Tc.x.d && P.y.n === Tc.y.n && P.y.d === Tc.y.d)) continue;
    const m = qNeg(qDiv(qMul(q(f.sx), qMul(f.Y, Tc.x)), qMul(q(f.sy), qMul(f.X, Tc.y))));
    const k = qSub(Tc.y, qMul(m, Tc.x));
    if (k.n === 0n || !petit(m, 12, 30) || !petit(k, 12, 40) || !petit(P.x) || !petit(P.y)) continue;
    // Unicité : σx·m²·α² + (y_P² − x_P²m² − k²)·α + σx·x_P²·k² = 0, α > 0 et β > 0.
    const A = qMul(q(f.sx), qMul(m, m));
    const B = qSub(qSub(qMul(P.y, P.y), qMul(qMul(P.x, P.x), qMul(m, m))), qMul(k, k));
    const C = qMul(q(f.sx), qMul(qMul(P.x, P.x), qMul(k, k)));
    const D = qNum(B) ** 2 - 4 * qNum(A) * qNum(C);
    const racines = A.n === 0n ? [-qNum(C) / qNum(B)] : D < 0 ? [] : [(-qNum(B) + Math.sqrt(D)) / (2 * qNum(A)), (-qNum(B) - Math.sqrt(D)) / (2 * qNum(A))];
    const valides = racines.filter((al) => al > 1e-9 && f.sy * (qNum(k) ** 2 - f.sx * qNum(m) ** 2 * al) > 1e-9);
    const distinctes = valides.filter((al, i) => valides.findIndex((x) => Math.abs(x - al) < 1e-9) === i);
    if (distinctes.length !== 1) continue;
    return { famille: "D", conique, P, d: { m, k }, alpha: f.X, beta: f.Y };
  }
}

export function construireE(type: "ellipse" | "hyperbole" = tirerParmi(["ellipse", "hyperbole"] as const)): ExerciceTangenteE {
  for (;;) {
    const [a, b] = demiAxes(type);
    const conique = centree(type, tirerParmi(["x", "y"] as const), a, b);
    const f = formeCentree(conique);
    const m = tirerParmi(PENTES);
    const K2 = k2Tangente(f, m);
    if (K2.n <= 0n || !estCarreParfait(K2)) continue;
    const K = racineQ(K2);
    const kd = q(tirerEntier(-24, 24), 2);
    if (kd.n === 0n || qNum(kd) === qNum(K) || qNum(kd) === -qNum(K)) continue;
    const eq = entiers(quadratique(conique, m, kd));
    if (eq[0] === 0n || eq[1] * eq[1] - 4n * eq[0] * eq[2] >= 0n) continue;
    const points = [K, qNeg(K)].map((k) => pointContact(f, { m, k })) as [Pt, Pt];
    if (points.some((P) => !petit(P.x, 12, 60) || !petit(P.y, 12, 60))) continue;
    const proche: 0 | 1 = Math.abs(qNum(K) - qNum(kd)) < Math.abs(-qNum(K) - qNum(kd)) ? 0 : 1;
    // Ordre des points mélangé (aucun ordre n'est demandé).
    if (Math.random() < 0.5) return { famille: "E", conique, d: { m, k: kd }, points: [points[1], points[0]], proche: proche === 0 ? 1 : 0 };
    return { famille: "E", conique, d: { m, k: kd }, points, proche };
  }
}

/** Catalogue : identifiants et ordre d'avant gardés (indices des `?code=`). */
export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "A_centree_ellipse", label: "A — tangente en un point : ellipse" },
  { id: "A_centree_hyperbole", label: "A — tangente en un point : hyperbole" },
  { id: "A_parabole_horizontal", label: "A — tangente en un point : parabole (axe horizontal)" },
  { id: "A_parabole_vertical", label: "A — tangente en un point : parabole (axe vertical)" },
  { id: "B_aSolution", label: "B — tangentes parallèles à une droite : deux tangentes" },
  { id: "B_aucuneSolution", label: "B — tangentes parallèles à une droite : aucune tangente" },
  { id: "C_exterieur", label: "C — tangentes issues d'un point : point extérieur" },
  { id: "C_interieur", label: "C — tangentes issues d'un point : point intérieur" },
  { id: "D_ellipse", label: "D — conique tangente à une droite : ellipse" },
  { id: "D_hyperbole_horizontal", label: "D — conique tangente à une droite : hyperbole (axe focal horizontal)" },
  { id: "D_hyperbole_vertical", label: "D — conique tangente à une droite : hyperbole (axe focal vertical)" },
  { id: "E_pointLePlusProche", label: "E — point d'une conique le plus proche d'une droite" },
];

export function construireAvecVarianteId(id: string): ExerciceTangentesConique {
  switch (id) {
    case "A_centree_ellipse":
      return construireA("ellipse");
    case "A_centree_hyperbole":
      return construireA("hyperbole");
    case "A_parabole_horizontal":
      return construireA("paraboleX");
    case "A_parabole_vertical":
      return construireA("paraboleY");
    case "B_aSolution":
      return construireB(2);
    case "B_aucuneSolution":
      return construireB(0);
    case "C_exterieur":
      return construireC(2);
    case "C_interieur":
      return construireC(0);
    case "D_ellipse":
      return construireD("ellipse");
    case "D_hyperbole_horizontal":
      return construireD("hyperbole", "x");
    case "D_hyperbole_vertical":
      return construireD("hyperbole", "y");
    default:
      return construireE();
  }
}

export function genererExerciceTangentesConique(): ExerciceTangentesConique {
  const fam = tirerParmi(["A", "B", "C", "D", "E"] as const);
  if (fam === "A") return construireA();
  if (fam === "B") return construireB();
  if (fam === "C") return construireC();
  if (fam === "D") return construireD();
  return construireE();
}

/** Groupes à verdict (décision 3) : existence des tangentes (B), position du point (C). */
export const GROUPES_VERDICT_6GEN62 = [
  { id: "groupe_B_existence", label: "B — tangentes parallèles à une droite (deux ou aucune, tiré au hasard)", variantes: ["B_aSolution", "B_aucuneSolution"] },
  { id: "groupe_C_position", label: "C — tangentes issues d'un point (position tirée au hasard)", variantes: ["C_exterieur", "C_interieur"] },
];

export type { ExerciceTangenteA, ExerciceTangenteB, ExerciceTangenteC, ExerciceTangenteD, ExerciceTangenteE };
