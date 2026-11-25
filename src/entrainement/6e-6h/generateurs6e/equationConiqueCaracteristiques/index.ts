import type { DonneeC, ExerciceEqAxesPerp, ExerciceEqC, ExerciceEqD, ExerciceEqDeuxSommets, ExerciceEqMemeAxe, ExerciceEqParabole, ExerciceEquationConiqueCaracteristiques } from "../../core6e/equationConiqueCaracteristiques.types";
import type { Axe } from "../../moteur6e/algebreConiques";
import { pt, q, qAdd, qMul, tirerEntier, tirerParmi } from "../../moteur6e/algebreLieux";

/**
 * `6gen59` — Équation d'une conique depuis ses caractéristiques (6e ch. 10 ; audit, lots B et C).
 * Nature (VERDICT) tirée avant les paramètres ; plages élargies ; a = demi-grand axe toujours (G15) ;
 * parabole en y² = 2px, p = dist(F ; d) (décision 1, G13) ; parabole par un point : axe de symétrie
 * DONNÉ (G14) ; hyperbole D : a et b variés (la pente n'est plus toujours > 1 ou < 1).
 */

const signe = (): 1 | -1 => (Math.random() < 0.5 ? 1 : -1);
const surAxe = (axe: Axe, v: number) => (axe === "x" ? pt(v, 0) : pt(0, v));

export function construireMemeAxe(nature: "ellipse" | "hyperbole" = tirerParmi(["ellipse", "hyperbole"] as const), axe: Axe = tirerParmi(["x", "y"] as const)): ExerciceEqMemeAxe {
  for (;;) {
    const a = tirerEntier(2, 9);
    const c = nature === "ellipse" ? tirerEntier(1, a - 1) : tirerEntier(a + 1, 12);
    const b2 = Math.abs(a * a - c * c);
    if (b2 > 120) continue;
    return { famille: "A", sousType: "memeAxe", nature, a, c, conique: { type: nature, centre: pt(0, 0), axe, a2: q(a * a), b2: q(b2) }, S: surAxe(axe, signe() * a), F: surAxe(axe, signe() * c) };
  }
}

export function construireAxesPerp(axeFocal: Axe = tirerParmi(["x", "y"] as const)): ExerciceEqAxesPerp {
  const b = tirerEntier(1, 8);
  const c = tirerEntier(1, 9);
  const autre: Axe = axeFocal === "x" ? "y" : "x";
  return { famille: "A", sousType: "axesPerpendiculaires", axeFocal, b, c, conique: { type: "ellipse", centre: pt(0, 0), axe: axeFocal, a2: q(b * b + c * c), b2: q(b * b) }, S: surAxe(autre, signe() * b), F: surAxe(axeFocal, signe() * c) };
}

export function construireDeuxSommets(): ExerciceEqDeuxSommets {
  for (;;) {
    const p = tirerEntier(1, 10);
    const r = tirerEntier(1, 10);
    if (p === r) continue;
    const axe: Axe = p > r ? "x" : "y";
    const a = Math.max(p, r);
    const b = Math.min(p, r);
    return { famille: "A", sousType: "deuxSommets", a, b, conique: { type: "ellipse", centre: pt(0, 0), axe, a2: q(a * a), b2: q(b * b) }, S: pt(signe() * p, 0), Sp: pt(0, signe() * r) };
  }
}

export function construireParabole(donnee: "foyer" | "point" = tirerParmi(["foyer", "point"] as const), axe: Axe = tirerParmi(["x", "y"] as const)): ExerciceEqParabole {
  for (;;) {
    const h = tirerEntier(-5, 5);
    const k = tirerEntier(-5, 5);
    const sens = signe();
    let p = q(tirerEntier(1, 8));
    let P = null;
    if (donnee === "point") {
      // P = S + (sens·d le long de l'axe ; t perpendiculairement), t² = 2p·d.
      const t = tirerParmi([-6, -4, -3, -2, 2, 3, 4, 6]);
      const pp = tirerParmi([1, 2, 3, 4, 6, 8, 9]);
      const d2 = (t * t) / pp; // 2d
      if (!Number.isInteger(d2) || d2 / 2 > 9) continue;
      p = q(pp);
      const d = q(t * t, 2 * pp);
      P = axe === "x" ? { x: qAdd(q(h), qMul(q(sens), d)), y: q(k + t) } : { x: q(h + t), y: qAdd(q(k), qMul(q(sens), d)) };
    }
    const demi = qMul(q(sens, 2), p);
    const F = axe === "x" ? { x: qAdd(q(h), demi), y: q(k) } : { x: q(h), y: qAdd(q(k), demi) };
    return { famille: "B", donnee, conique: { type: "parabole", sommet: pt(h, k), axe, sens, p }, S: pt(h, k), F, P };
  }
}

export const PAIRES_C: [DonneeC, DonneeC][] = [
  ["deuxC", "excentricite"],
  ["deuxC", "distanceDirectrices"],
  ["deuxA", "excentricite"],
  ["deuxA", "distanceDirectrices"],
  ["excentricite", "distanceDirectrices"],
];

export function construireC(paire: [DonneeC, DonneeC] = tirerParmi(PAIRES_C), nature: "ellipse" | "hyperbole" = tirerParmi(["ellipse", "hyperbole"] as const), axe: Axe = tirerParmi(["x", "y"] as const)): ExerciceEqC {
  for (;;) {
    const a = tirerEntier(2, 9);
    const c = nature === "ellipse" ? tirerEntier(1, a - 1) : tirerEntier(a + 1, 12);
    const b2 = Math.abs(a * a - c * c);
    if (b2 > 120) continue;
    return { famille: "C", nature, donnees: paire, a, c, conique: { type: nature, centre: pt(0, 0), axe, a2: q(a * a), b2: q(b2) } };
  }
}

export function construireD(donnee: "sommet" | "foyer" | "distanceFocale" = tirerParmi(["sommet", "foyer", "distanceFocale"] as const), axe: Axe = tirerParmi(["x", "y"] as const)): ExerciceEqD {
  for (;;) {
    const a = tirerEntier(1, 8);
    const b = tirerEntier(1, 8);
    if (a === b && Math.random() < 0.8) continue;
    return { famille: "D", donnee, a, b, conique: { type: "hyperbole", centre: pt(0, 0), axe, a2: q(a * a), b2: q(b * b) } };
  }
}

export type IdVarianteEquationConiqueCaracteristiques =
  | "A_memeAxe_ellipse_horizontal"
  | "A_memeAxe_ellipse_vertical"
  | "A_memeAxe_hyperbole_horizontal"
  | "A_memeAxe_hyperbole_vertical"
  | "A_axesPerp_horizontal"
  | "A_axesPerp_vertical"
  | "A_deuxSommets"
  | "B_foyer_horizontal"
  | "B_foyer_vertical"
  | "B_point_horizontal"
  | "B_point_vertical"
  | "C_deuxC_excentricite_ellipse"
  | "C_deuxC_excentricite_hyperbole"
  | "C_deuxC_distanceDirectrices_ellipse"
  | "C_deuxC_distanceDirectrices_hyperbole"
  | "C_deuxA_excentricite_ellipse"
  | "C_deuxA_excentricite_hyperbole"
  | "C_deuxA_distanceDirectrices_ellipse"
  | "C_deuxA_distanceDirectrices_hyperbole"
  | "C_excentricite_distanceDirectrices_ellipse"
  | "C_excentricite_distanceDirectrices_hyperbole"
  | "D_sommet_horizontal"
  | "D_sommet_vertical"
  | "D_foyer_horizontal"
  | "D_foyer_vertical"
  | "D_distanceFocale_horizontal"
  | "D_distanceFocale_vertical";

/** Catalogue : identifiants et ordre d'avant gardés (indices des `?code=`). */
export const CATALOGUE_VARIANTES: { id: IdVarianteEquationConiqueCaracteristiques; label: string }[] = [
  { id: "A_memeAxe_ellipse_horizontal", label: "A — sommet et foyer sur le même axe : ellipse (axe horizontal)" },
  { id: "A_memeAxe_ellipse_vertical", label: "A — sommet et foyer sur le même axe : ellipse (axe vertical)" },
  { id: "A_memeAxe_hyperbole_horizontal", label: "A — sommet et foyer sur le même axe : hyperbole (axe horizontal)" },
  { id: "A_memeAxe_hyperbole_vertical", label: "A — sommet et foyer sur le même axe : hyperbole (axe vertical)" },
  { id: "A_axesPerp_horizontal", label: "A — sommet non focal et foyer : axe focal horizontal" },
  { id: "A_axesPerp_vertical", label: "A — sommet non focal et foyer : axe focal vertical" },
  { id: "A_deuxSommets", label: "A — deux sommets sur des axes perpendiculaires" },
  { id: "B_foyer_horizontal", label: "B — parabole : sommet et foyer (axe horizontal)" },
  { id: "B_foyer_vertical", label: "B — parabole : sommet et foyer (axe vertical)" },
  { id: "B_point_horizontal", label: "B — parabole : sommet, axe et un point (axe horizontal)" },
  { id: "B_point_vertical", label: "B — parabole : sommet, axe et un point (axe vertical)" },
  { id: "C_deuxC_excentricite_ellipse", label: "C — 2c et e : ellipse" },
  { id: "C_deuxC_excentricite_hyperbole", label: "C — 2c et e : hyperbole" },
  { id: "C_deuxC_distanceDirectrices_ellipse", label: "C — 2c et distance des directrices : ellipse" },
  { id: "C_deuxC_distanceDirectrices_hyperbole", label: "C — 2c et distance des directrices : hyperbole" },
  { id: "C_deuxA_excentricite_ellipse", label: "C — 2a et e : ellipse" },
  { id: "C_deuxA_excentricite_hyperbole", label: "C — 2a et e : hyperbole" },
  { id: "C_deuxA_distanceDirectrices_ellipse", label: "C — 2a et distance des directrices : ellipse" },
  { id: "C_deuxA_distanceDirectrices_hyperbole", label: "C — 2a et distance des directrices : hyperbole" },
  { id: "C_excentricite_distanceDirectrices_ellipse", label: "C — e et distance des directrices : ellipse" },
  { id: "C_excentricite_distanceDirectrices_hyperbole", label: "C — e et distance des directrices : hyperbole" },
  { id: "D_sommet_horizontal", label: "D — asymptotes et sommet (axe focal horizontal)" },
  { id: "D_sommet_vertical", label: "D — asymptotes et sommet (axe focal vertical)" },
  { id: "D_foyer_horizontal", label: "D — asymptotes et foyer (axe focal horizontal)" },
  { id: "D_foyer_vertical", label: "D — asymptotes et foyer (axe focal vertical)" },
  { id: "D_distanceFocale_horizontal", label: "D — asymptotes et distance focale (axe focal horizontal)" },
  { id: "D_distanceFocale_vertical", label: "D — asymptotes et distance focale (axe focal vertical)" },
];

export function construireAvecVarianteId(id: string): ExerciceEquationConiqueCaracteristiques {
  const m = id.split("_");
  const axe: Axe = id.endsWith("vertical") ? "y" : "x";
  if (m[1] === "memeAxe") return construireMemeAxe(m[2] as "ellipse" | "hyperbole", axe);
  if (m[1] === "axesPerp") return construireAxesPerp(axe);
  if (m[1] === "deuxSommets") return construireDeuxSommets();
  if (m[0] === "B") return construireParabole(m[1] as "foyer" | "point", axe);
  if (m[0] === "C") return construireC([m[1] as DonneeC, m[2] as DonneeC], m[3] as "ellipse" | "hyperbole");
  return construireD(m[1] as "sommet" | "foyer" | "distanceFocale", axe);
}

export function genererExerciceEquationConiqueCaracteristiques(): ExerciceEquationConiqueCaracteristiques {
  const fam = tirerParmi(["A", "B", "C", "D"] as const);
  if (fam === "A") return tirerParmi([() => construireMemeAxe(), () => construireAxesPerp(), () => construireDeuxSommets()])();
  if (fam === "B") return construireParabole();
  if (fam === "C") return construireC();
  return construireD();
}

const LIBELLE_PAIRE: Record<string, string> = {
  deuxC_excentricite: "2c et e",
  deuxC_distanceDirectrices: "2c et distance des directrices",
  deuxA_excentricite: "2a et e",
  deuxA_distanceDirectrices: "2a et distance des directrices",
  excentricite_distanceDirectrices: "e et distance des directrices",
};

/** Groupes à verdict (décision 3) : la nature (ellipse ou hyperbole) tirée au hasard. */
export const GROUPES_VERDICT_6GEN59 = [
  { id: "groupe_memeAxe", label: "A — sommet et foyer sur le même axe (nature tirée au hasard)", variantes: ["A_memeAxe_ellipse_horizontal", "A_memeAxe_ellipse_vertical", "A_memeAxe_hyperbole_horizontal", "A_memeAxe_hyperbole_vertical"] },
  ...PAIRES_C.map(([d1, d2]) => ({ id: `groupe_C_${d1}_${d2}`, label: `C — ${LIBELLE_PAIRE[`${d1}_${d2}`]} (nature tirée au hasard)`, variantes: [`C_${d1}_${d2}_ellipse`, `C_${d1}_${d2}_hyperbole`] })),
];
