import type { ExerciceIdA1, ExerciceIdA2, ExerciceIdB, ExerciceIdC, ExerciceIdentificationConiques, NatureCentree, OrientationParabole } from "../../core6e/identificationConiques.types";
import type { Axe, Conique } from "../../moteur6e/algebreConiques";
import { droiteNormalisee, pgcd, pt, q, tirerEntier, tirerParmi } from "../../moteur6e/algebreLieux";
import type { Droite } from "../../moteur6e/algebreLieux";

/**
 * `6gen58` — Identifier une conique et ses éléments (6e ch. 10 ; audit, lots B et C). Construit À
 * REBOURS depuis la nature (VERDICT tiré d'abord, à parts égales) : coefficients entiers simplifiés
 * par leur pgcd (plus de « 4x² + 36y² − 144 = 0 »), plages élargies, A et B parfois tous deux négatifs,
 * hyperboles à asymptotes de pente rationnelle (équations exactes demandées), parabole en y² = 2px
 * (décision 1), cas dégénérés gardés (décision 4 : enseignés au cours), famille C lue comme une
 * MOITIÉ de conique (un seul signe devant la racine, audit G9).
 */

const pg = (...n: number[]) => n.reduce((g, x) => pgcd(g, x), 0) || 1;
const signeAuHasard = () => (Math.random() < 0.3 ? -1 : 1);

/** a² et b² d'une ellipse (a² > b²), parfois non carrés (racines simplifiées). */
function demiAxesEllipse(max: number): [number, number] {
  for (;;) {
    const a2 = Math.random() < 0.65 ? tirerEntier(2, Math.floor(Math.sqrt(max))) ** 2 : tirerEntier(3, max);
    const b2 = Math.random() < 0.65 ? tirerEntier(1, Math.floor(Math.sqrt(a2 - 1))) ** 2 : tirerEntier(1, a2 - 1);
    if (b2 < a2 && a2 * b2 <= 4 * max * 6) return [a2, b2];
  }
}

/** a² = t·u², b² = t·v² : pente des asymptotes v/u (ou u/v) rationnelle. */
function demiAxesHyperbole(max: number): [number, number] {
  for (;;) {
    const t = tirerParmi([1, 1, 1, 2, 3]);
    const u = tirerEntier(1, 6);
    const v = tirerEntier(1, 6);
    if (t * u * u <= max && t * v * v <= max && t * u * u * v * v <= 6 * max) return [t * u * u, t * v * v];
  }
}

/** Ensemble d'une équation A(x − h)² + B(y − k)² = M selon la nature voulue. */
function construireCentree(nature: NatureCentree, axe: Axe, h: number, k: number, max: number) {
  const centre = pt(h, k);
  let A: number;
  let B: number;
  let M: number;
  let conique: Conique | null = null;
  let point = null;
  let droites: Droite[] = [];
  switch (nature) {
    case "ellipse": {
      const [a2, b2] = demiAxesEllipse(max);
      // Axe focal x : x²/a² + y²/b² = 1 ⇔ b²x² + a²y² = a²b².
      [A, B, M] = axe === "x" ? [b2, a2, a2 * b2] : [a2, b2, a2 * b2];
      conique = { type: "ellipse", centre, axe, a2: q(a2), b2: q(b2) };
      break;
    }
    case "hyperbole": {
      const [a2, b2] = demiAxesHyperbole(max);
      [A, B, M] = axe === "x" ? [b2, -a2, a2 * b2] : [-a2, b2, a2 * b2];
      conique = { type: "hyperbole", centre, axe, a2: q(a2), b2: q(b2) };
      break;
    }
    case "cercle": {
      const r2 = tirerParmi([4, 9, 16, 25, 36, 5, 8, 10, 13, 18, 20]);
      const c = tirerEntier(1, 3);
      [A, B, M] = [c, c, c * r2];
      conique = { type: "cercle", centre, r2: q(r2) };
      break;
    }
    case "point":
      [A, B, M] = [tirerEntier(1, 5), tirerEntier(1, 5), 0];
      point = centre;
      break;
    case "vide":
      [A, B, M] = [tirerEntier(1, 5), tirerEntier(1, 5), -tirerEntier(1, 30)];
      break;
    case "droitesSecantes": {
      const u = tirerEntier(1, 4);
      const v = tirerEntier(1, 4);
      const t = tirerParmi([1, 1, 2, 3]);
      // t·v²(x − h)² − t·u²(y − k)² = 0 ⇔ v(x − h) = ±u(y − k).
      [A, B, M] = [t * v * v, -t * u * u, 0];
      droites = [1, -1].map((s) => droiteNormalisee(q(v), q(-s * u), q(-v * h + s * u * k)));
      break;
    }
  }
  const g = pg(A, B, M);
  return { A: A / g, B: B / g, M: M / g, conique, point, droites };
}

const NATURES_CENTREES: NatureCentree[] = ["ellipse", "cercle", "hyperbole", "point", "vide", "droitesSecantes"];

export function construireA1(nature: NatureCentree = tirerParmi(NATURES_CENTREES), axe: Axe = tirerParmi(["x", "y"] as const)): ExerciceIdA1 {
  const c = construireCentree(nature, axe, 0, 0, 64);
  const s = signeAuHasard();
  return { famille: "A1", nature, A: s * c.A, B: s * c.B, F: -s * c.M || 0, conique: c.conique, point: c.point, droites: c.droites };
}

export function construireA2(type: OrientationParabole | "droitesParalleles" = tirerParmi(["droite", "gauche", "haut", "bas", "droitesParalleles"] as const)): ExerciceIdA2 {
  const coef = tirerParmi([1, 1, 2, 3]);
  const s = signeAuHasard();
  if (type === "droitesParalleles") {
    const v = tirerParmi(["x", "y"] as const);
    const m = tirerParmi([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
    // v² + m·v = 0 ⇔ v = 0 ou v = −m.
    const carre = s * coef;
    const lin = s * coef * m;
    const droites = v === "x" ? [droiteNormalisee(q(1), q(0), q(0)), droiteNormalisee(q(1), q(0), q(m))] : [droiteNormalisee(q(0), q(1), q(0)), droiteNormalisee(q(0), q(1), q(m))];
    return { famille: "A2", nature: "droitesParalleles", orientation: null, A: v === "x" ? carre : 0, B: v === "y" ? carre : 0, D: v === "x" ? lin : 0, E: v === "y" ? lin : 0, conique: null, point: null, droites };
  }
  const p = tirerEntier(1, 8);
  const axe: Axe = type === "droite" || type === "gauche" ? "x" : "y";
  const sens: 1 | -1 = type === "droite" || type === "haut" ? 1 : -1;
  // y² = sens·2p·x ⇔ coef·y² − coef·sens·2p·x = 0.
  const carre = s * coef;
  const lin = -s * coef * sens * 2 * p;
  const conique: Conique = { type: "parabole", sommet: pt(0, 0), axe, sens, p: q(p) };
  return { famille: "A2", nature: "parabole", orientation: type, A: axe === "y" ? carre : 0, B: axe === "x" ? carre : 0, D: axe === "x" ? lin : 0, E: axe === "y" ? lin : 0, conique, point: null, droites: [] };
}

export function construireB(nature: NatureCentree = tirerParmi(NATURES_CENTREES), axe: Axe = tirerParmi(["x", "y"] as const)): ExerciceIdB {
  for (;;) {
    const h = tirerEntier(-5, 5);
    const k = tirerEntier(-5, 5);
    if (h === 0 && k === 0) continue;
    const c = construireCentree(nature, axe, h, k, 36);
    const s = signeAuHasard();
    const A = s * c.A;
    const B = s * c.B;
    const M = s * c.M;
    const D = -2 * A * h || 0;
    const E = -2 * B * k || 0;
    const F = A * h * h + B * k * k - M || 0;
    if (Math.abs(F) > 400 || Math.abs(D) > 200 || Math.abs(E) > 200) continue;
    return { famille: "B", nature, A, B, D, E, F, centre: pt(h, k), M, conique: c.conique, point: c.point, droites: c.droites };
  }
}

const FRACTIONS_M: Record<"petit" | "grand", [number, number][]> = {
  petit: [
    [1, 3],
    [1, 2],
    [2, 3],
  ],
  grand: [
    [3, 2],
    [2, 1],
    [3, 1],
  ],
};

export function construireC(nature: "ellipse" | "hyperbole" = tirerParmi(["ellipse", "hyperbole"] as const), axeFocal: Axe = tirerParmi(["x", "y"] as const)): ExerciceIdC {
  // Hyperbole : l'axe focal est celui de la variable sous la racine ; ellipse : variable sous la racine
  // tirée, et m < 1 ou m > 1 selon l'axe focal voulu.
  const variableRacine: Axe = nature === "hyperbole" ? axeFocal : tirerParmi(["x", "y"] as const);
  const variableIsolee: Axe = variableRacine === "x" ? "y" : "x";
  const mGrand = nature === "ellipse" ? axeFocal !== variableRacine : Math.random() < 0.5;
  const [mNum, mDen] = tirerParmi(mGrand ? FRACTIONS_M.grand : FRACTIONS_M.petit);
  const r = mDen * tirerEntier(mDen === 3 ? 1 : 2, mDen === 3 ? 2 : 3);
  const h = tirerEntier(-4, 4);
  const k = tirerEntier(-4, 4);
  const s = nature === "ellipse" ? -1 : 1;
  const signeRacine = tirerParmi([1, -1] as const);
  // Sous la racine : s(v − h)² − s·r².
  const a2 = s;
  const a1 = -2 * s * h || 0;
  const a0 = s * (h * h - r * r) || 0;
  const mr = (mNum * r) / mDen;
  const centre = variableRacine === "x" ? pt(h, k) : pt(k, h);
  let conique: Conique;
  if (nature === "hyperbole") conique = { type: "hyperbole", centre, axe: variableRacine, a2: q(r * r), b2: q(mr * mr) };
  else {
    const grandSurRacine = r > mr;
    conique = { type: "ellipse", centre, axe: grandSurRacine ? variableRacine : variableIsolee, a2: q(Math.max(r, mr) ** 2), b2: q(Math.min(r, mr) ** 2) };
  }
  return { famille: "C", nature, variableRacine, variableIsolee, k, h, mNum, mDen, signeRacine, a2, a1, a0, r, conique, point: null, droites: [] };
}

export type IdVarianteIdentificationConiques =
  | "A1_ellipseHorizontal"
  | "A1_ellipseVertical"
  | "A1_cercle"
  | "A1_vide"
  | "A1_point"
  | "A1_hyperboleHorizontal"
  | "A1_hyperboleVertical"
  | "A1_droitesSecantes"
  | "A2_droitesParalleles"
  | "A2_paraboleDroite"
  | "A2_paraboleGauche"
  | "A2_paraboleHaut"
  | "A2_paraboleBas"
  | "B_ellipseHorizontal"
  | "B_ellipseVertical"
  | "B_cercle"
  | "B_vide"
  | "B_point"
  | "B_hyperboleHorizontal"
  | "B_hyperboleVertical"
  | "B_droitesSecantes"
  | "C_ellipseHorizontal"
  | "C_ellipseVertical"
  | "C_hyperboleHorizontal"
  | "C_hyperboleVertical";

/** Catalogue : identifiants et ordre d'avant gardés (indices des `?code=`), libellés neutres. */
export const CATALOGUE_VARIANTES: { id: IdVarianteIdentificationConiques; label: string }[] = [
  { id: "A1_ellipseHorizontal", label: "A1 — Ax² + By² + C = 0 : ellipse (axe focal horizontal)" },
  { id: "A1_ellipseVertical", label: "A1 — Ax² + By² + C = 0 : ellipse (axe focal vertical)" },
  { id: "A1_cercle", label: "A1 — Ax² + By² + C = 0 : cercle" },
  { id: "A1_vide", label: "A1 — Ax² + By² + C = 0 : ensemble vide" },
  { id: "A1_point", label: "A1 — Ax² + By² + C = 0 : un point" },
  { id: "A1_hyperboleHorizontal", label: "A1 — Ax² + By² + C = 0 : hyperbole (axe focal horizontal)" },
  { id: "A1_hyperboleVertical", label: "A1 — Ax² + By² + C = 0 : hyperbole (axe focal vertical)" },
  { id: "A1_droitesSecantes", label: "A1 — Ax² + By² + C = 0 : deux droites sécantes" },
  { id: "A2_droitesParalleles", label: "A2 — un seul carré : deux droites parallèles" },
  { id: "A2_paraboleDroite", label: "A2 — un seul carré : parabole ouverte vers la droite" },
  { id: "A2_paraboleGauche", label: "A2 — un seul carré : parabole ouverte vers la gauche" },
  { id: "A2_paraboleHaut", label: "A2 — un seul carré : parabole ouverte vers le haut" },
  { id: "A2_paraboleBas", label: "A2 — un seul carré : parabole ouverte vers le bas" },
  { id: "B_ellipseHorizontal", label: "B — décentrée : ellipse (axe focal horizontal)" },
  { id: "B_ellipseVertical", label: "B — décentrée : ellipse (axe focal vertical)" },
  { id: "B_cercle", label: "B — décentrée : cercle" },
  { id: "B_vide", label: "B — décentrée : ensemble vide" },
  { id: "B_point", label: "B — décentrée : un point" },
  { id: "B_hyperboleHorizontal", label: "B — décentrée : hyperbole (axe focal horizontal)" },
  { id: "B_hyperboleVertical", label: "B — décentrée : hyperbole (axe focal vertical)" },
  { id: "B_droitesSecantes", label: "B — décentrée : deux droites sécantes" },
  { id: "C_ellipseHorizontal", label: "C — racine isolée : moitié d'ellipse (axe focal horizontal)" },
  { id: "C_ellipseVertical", label: "C — racine isolée : moitié d'ellipse (axe focal vertical)" },
  { id: "C_hyperboleHorizontal", label: "C — racine isolée : partie d'hyperbole (axe focal horizontal)" },
  { id: "C_hyperboleVertical", label: "C — racine isolée : partie d'hyperbole (axe focal vertical)" },
];

export function construireAvecVarianteId(id: string): ExerciceIdentificationConiques {
  const [fam, cas] = id.split("_");
  const axe: Axe = cas.endsWith("Vertical") ? "y" : "x";
  const nature = cas.replace(/Horizontal|Vertical/, "") as NatureCentree;
  if (fam === "A1") return construireA1(nature, axe);
  if (fam === "B") return construireB(nature, axe);
  if (fam === "C") return construireC(cas.startsWith("ellipse") ? "ellipse" : "hyperbole", axe);
  if (cas === "droitesParalleles") return construireA2("droitesParalleles");
  return construireA2(cas.replace("parabole", "").toLowerCase() as OrientationParabole);
}

/** Tirage libre : famille à parts égales (A1, A2, B, C), puis le verdict (nature) à parts égales. */
export function genererExerciceIdentificationConiques(): ExerciceIdentificationConiques {
  const fam = tirerParmi(["A1", "A2", "B", "C"] as const);
  if (fam === "A1") return construireA1();
  if (fam === "A2") return construireA2(Math.random() < 0.5 ? "droitesParalleles" : tirerParmi(["droite", "gauche", "haut", "bas"] as const));
  if (fam === "B") return construireB();
  return construireC();
}

/** Groupes à verdict (décision 3) : dans le panneau d'évaluation, la nature est tirée au hasard. */
export const GROUPES_VERDICT_6GEN58 = [
  { id: "groupe_A1", label: "A1 — Ax² + By² + C = 0 (nature tirée au hasard)", variantes: CATALOGUE_VARIANTES.filter((v) => v.id.startsWith("A1_")).map((v) => v.id) },
  { id: "groupe_A2", label: "A2 — un seul carré (nature tirée au hasard)", variantes: CATALOGUE_VARIANTES.filter((v) => v.id.startsWith("A2_")).map((v) => v.id) },
  { id: "groupe_B", label: "B — équation décentrée (nature tirée au hasard)", variantes: CATALOGUE_VARIANTES.filter((v) => v.id.startsWith("B_")).map((v) => v.id) },
  { id: "groupe_C", label: "C — racine isolée (nature tirée au hasard)", variantes: CATALOGUE_VARIANTES.filter((v) => v.id.startsWith("C_")).map((v) => v.id) },
];

export type { ExerciceIdA1, ExerciceIdA2, ExerciceIdB, ExerciceIdC };
