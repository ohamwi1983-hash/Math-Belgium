import type { ExerciceTD, OptionTD, VarianteTD } from "../../core6e/tangenteDeriveeDedoublee";
import type { Conique, Pt } from "../../ui6e/outilsConiquesLotH2";
import { melanger, parmi } from "../../ui6e/outilsConiquesLotH2";

/**
 * Couche A — générateur de `6gen138` « Tangente par la dérivée et forme dédoublée ». `Math.random()` seul
 * (le `?code=` rejoue le tirage). La BRANCHE de P (y_P > 0 ou < 0) est tirée EN PREMIER, à parts égales ;
 * puis la conique et des points à coordonnées rationnelles (cos / sin pythagoriciens pour l'ellipse,
 * couples (u ; v) avec u² − v² = 1 pour l'hyperbole, y_P entier pour la parabole), d'où une pente
 * rationnelle. Q : sommet de l'axe focal une fois sur deux (tiré avant Q), sinon un autre point de la
 * conique.
 */

export const CATALOGUE_VARIANTES: { id: VarianteTD; label: string }[] = [
  { id: "ellipse", label: "Ellipse x²/a² + y²/b² = 1" },
  { id: "hyperbole", label: "Hyperbole x²/a² − y²/b² = 1" },
  { id: "parabole", label: "Parabole y² = 2px" },
];

const COS_SIN: [number, number][] = [
  [3 / 5, 4 / 5],
  [4 / 5, 3 / 5],
];
const COS_SIN_13: [number, number][] = [
  [5 / 13, 12 / 13],
  [12 / 13, 5 / 13],
];
/** (u ; v) avec u² − v² = 1 et le dénominateur commun (a doit en être multiple). */
const UV: [number, number, number][] = [
  [5 / 3, 4 / 3, 3],
  [5 / 4, 3 / 4, 4],
  [13 / 5, 12 / 5, 5],
  [13 / 12, 5 / 12, 12],
];

/** Points rationnels de la conique, signes compris (y ≠ 0). */
function pointsRationnels(c: Conique): Pt[] {
  const pts: Pt[] = [];
  const signes = [1, -1];
  if (c.type === "ellipse") {
    const liste = c.a % 13 === 0 ? COS_SIN_13 : COS_SIN;
    for (const [co, si] of liste) for (const sx of signes) for (const sy of signes) pts.push({ x: sx * c.a * co, y: sy * c.b * si });
  } else if (c.type === "hyperbole") {
    for (const [u, v, d] of UV) if (c.a % d === 0) for (const sx of signes) for (const sy of signes) pts.push({ x: sx * c.a * u, y: sy * c.b * v });
  } else {
    for (let k = 1; k <= 8; k++) {
      const x = (k * k) / (2 * c.p);
      if (x > 12) continue;
      for (const sy of signes) pts.push({ x, y: sy * k });
    }
  }
  return pts;
}

function conique(v: VarianteTD): Conique {
  if (v === "ellipse") {
    const a = parmi([5, 10, 13]);
    const b = a === 5 ? parmi([2, 3, 4]) : a === 10 ? parmi([3, 4, 6, 8]) : parmi([4, 6, 8, 10]);
    return { type: "ellipse", a, b };
  }
  if (v === "hyperbole") return { type: "hyperbole", a: parmi([3, 4, 5, 6, 8]), b: parmi([1, 2, 3, 4, 5]) };
  return { type: "parabole", p: parmi([1, 2, 3, 4, 6]) };
}

export function construire(variante: VarianteTD): ExerciceTD {
  const haut = Math.random() < 0.5;
  const qSommet = Math.random() < 0.5;
  for (;;) {
    const c = conique(variante);
    const pts = pointsRationnels(c);
    const candidats = pts.filter((p) => (haut ? p.y > 0 : p.y < 0));
    if (candidats.length === 0) continue;
    const P = parmi(candidats);
    let Q: Pt;
    if (qSommet) Q = c.type === "parabole" ? { x: 0, y: 0 } : { x: parmi([1, -1]) * c.a, y: 0 };
    else {
      const autres = pts.filter((q) => Math.abs(q.x - P.x) > 1e-9 || Math.abs(q.y - P.y) > 1e-9).filter((q) => !(Math.abs(q.x - P.x) < 1e-9 && Math.abs(q.y + P.y) < 1e-9));
      if (autres.length === 0) continue;
      Q = parmi(autres);
    }
    const options = melanger<OptionTD>(["haut", "bas", "leurreHaut", "leurreBas"]);
    return { variante, conique: c, P, Q, qSommet, options };
  }
}

export function construireAvecVariante(id: string): ExerciceTD {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceTD(): ExerciceTD {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
