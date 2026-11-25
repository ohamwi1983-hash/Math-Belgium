import type { ExerciceProprietesOptiquesConiques } from "../../core6e/proprietesOptiquesConiques.types";
import type { Conique } from "../../moteur6e/algebreConiques";
import { droiteNormalisee, droiteParDeuxPoints, pt, q, qAdd, qDiv, qMul, qNeg, qNum, qSub, tirerParmi } from "../../moteur6e/algebreLieux";
import type { Pt, Q } from "../../moteur6e/algebreLieux";
import { quadratique } from "../intersectionsConiques";

/**
 * `6gen63` — Propriétés optiques des coniques (6e ch. 10 ; audit, lots B et C). Point d'impact R choisi
 * D'ABORD, rationnel à petit dénominateur (paramétrage rationnel de la conique : fini les dénominateurs
 * jusqu'à 30 631, G23), rayon incident F → R, autre point commun par Vieta ; R et la pente à dénominateur ≤ 12, l'autre racine ≤ 40.
 * Famille parabole AJOUTÉE (rayon issu du foyer, ou rayon parallèle à l'axe).
 */

const TRIPLES_ELLIPSE: [number, number, number][] = [
  [5, 4, 3],
  [5, 3, 4],
  [10, 8, 6],
  [10, 6, 8],
  [13, 12, 5],
];
const TRIPLES_HYPERBOLE: [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
];
const T_ELLIPSE: Q[] = [q(1, 2), q(-1, 2), q(1, 3), q(-1, 3), q(2), q(-2), q(3), q(-3), q(2, 3), q(-2, 3), q(3, 2), q(-3, 2), q(1), q(-1)];
const T_GAUCHE: Q[] = [q(1, 2), q(-1, 2), q(1, 3), q(-1, 3), q(2, 3), q(-2, 3), q(1, 4), q(-1, 4), q(3, 4), q(-3, 4), q(2, 5), q(-2, 5)];

const ok = (r: Q, den = 12) => Number(r.d) <= den && Math.abs(Number(r.n)) <= 15 * den;
const pointOk = (P: Pt, den = 12) => ok(P.x, den) && ok(P.y, den);

/** Autre point commun de la droite y = m x + k (par R) et de la conique (Vieta). */
function autrePoint(c: Conique, m: Q, k: Q, R: Pt): Pt | null {
  const [A, B] = quadratique(c, m, k);
  if (A.n === 0n) return null;
  const x = qSub(qNeg(qDiv(B, A)), R.x);
  return { x, y: qAdd(qMul(m, x), k) };
}

export function construireCentree(famille: "ellipse" | "hyperbole", signePente: 1 | -1 = tirerParmi([1, -1] as const)): ExerciceProprietesOptiquesConiques {
  for (;;) {
    const [a, b, c] = tirerParmi(famille === "ellipse" ? TRIPLES_ELLIPSE : TRIPLES_HYPERBOLE);
    const conique: Conique = { type: famille, centre: pt(0, 0), axe: "x", a2: q(a * a), b2: q(b * b) };
    const t = tirerParmi(famille === "ellipse" ? T_ELLIPSE : T_GAUCHE);
    const t2 = qMul(t, t);
    const un = q(1);
    const R: Pt =
      famille === "ellipse"
        ? { x: qDiv(qMul(q(a), qSub(un, t2)), qAdd(un, t2)), y: qDiv(qMul(q(2 * b), t), qAdd(un, t2)) }
        : { x: qNeg(qDiv(qMul(q(a), qAdd(un, t2)), qSub(un, t2))), y: qDiv(qMul(q(2 * b), t), qSub(un, t2)) };
    const F = pt(-c, 0);
    const Fp = pt(c, 0);
    if (R.x.n * F.x.d === F.x.n * R.x.d || R.y.n === 0n) continue;
    if (Math.max(Math.abs(qNum(R.x)), Math.abs(qNum(R.y))) > 1.5 * c + 2) continue;
    const m = qDiv(R.y, qSub(R.x, F.x));
    if ((m.n > 0n ? 1 : -1) !== signePente) continue;
    const k = qSub(R.y, qMul(m, R.x));
    const autre = autrePoint(conique, m, k, R);
    // L'autre racine de l'équation (point derrière la source) : dénominateur ≤ 40 (une corde focale à deux
    // extrémités de petit dénominateur n'existe presque jamais pour ces ellipses).
    if (!autre || !pointOk(R) || !pointOk(autre, 40) || !ok(m, 12)) continue;
    const reflechi = droiteParDeuxPoints(R, Fp);
    if ([reflechi.a, reflechi.b, reflechi.c].some((x) => (x < 0n ? -x : x) > 300n)) continue;
    const sens: 1 | -1 = qNum(R.x) > qNum(F.x) ? 1 : -1;
    return { famille, mode: "depuisFoyer", conique, F, Fp, m, sens, R, autre, reflechi, propriete: famille === "ellipse" ? "passeParFp" : "semblaVenirDeFp" };
  }
}

export function construireParabole(mode: "depuisFoyer" | "parallele" = tirerParmi(["depuisFoyer", "parallele"] as const)): ExerciceProprietesOptiquesConiques {
  for (;;) {
    const p = tirerParmi([1, 2, 3, 4, 6]);
    const y0 = tirerParmi([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
    if (y0 * y0 === p * p) continue;
    const conique: Conique = { type: "parabole", sommet: pt(0, 0), axe: "x", sens: 1, p: q(p) };
    const F = { x: q(p, 2), y: q(0) };
    const R = { x: q(y0 * y0, 2 * p), y: q(y0) };
    if (!pointOk(R)) continue;
    if (mode === "parallele") {
      const reflechi = droiteParDeuxPoints(R, F);
      return { famille: "parabole", mode, conique, F, Fp: null, m: q(0), sens: -1, R, autre: null, reflechi, propriete: "passeParF" };
    }
    const m = qDiv(R.y, qSub(R.x, F.x));
    const k = qSub(R.y, qMul(m, R.x));
    const autre = autrePoint(conique, m, k, R);
    if (!autre || !pointOk(autre, 40) || !ok(m)) continue;
    const sens: 1 | -1 = qNum(R.x) > qNum(F.x) ? 1 : -1;
    return { famille: "parabole", mode, conique, F, Fp: null, m, sens, R, autre, reflechi: droiteNormalisee(q(0), q(1), q(-y0)), propriete: "paralleleAxe" };
  }
}

/** Catalogue : identifiants d'avant gardés en place, famille parabole AJOUTÉE EN FIN. */
export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "ellipse_pentePositive", label: "Ellipse — rayon issu d'un foyer, pente positive" },
  { id: "ellipse_penteNegative", label: "Ellipse — rayon issu d'un foyer, pente négative" },
  { id: "hyperbole_pentePositive", label: "Hyperbole — rayon issu d'un foyer, pente positive" },
  { id: "hyperbole_penteNegative", label: "Hyperbole — rayon issu d'un foyer, pente négative" },
  { id: "parabole_depuisFoyer", label: "Parabole — rayon issu du foyer" },
  { id: "parabole_parallele", label: "Parabole — rayon parallèle à l'axe" },
];

export function construireAvecVarianteId(id: string): ExerciceProprietesOptiquesConiques {
  if (id === "parabole_depuisFoyer") return construireParabole("depuisFoyer");
  if (id === "parabole_parallele") return construireParabole("parallele");
  const [fam, pente] = id.split("_");
  return construireCentree(fam as "ellipse" | "hyperbole", pente === "pentePositive" ? 1 : -1);
}

export function genererExerciceProprietesOptiquesConiques(): ExerciceProprietesOptiquesConiques {
  const fam = tirerParmi(["ellipse", "hyperbole", "parabole"] as const);
  if (fam === "parabole") return construireParabole();
  return construireCentree(fam);
}

