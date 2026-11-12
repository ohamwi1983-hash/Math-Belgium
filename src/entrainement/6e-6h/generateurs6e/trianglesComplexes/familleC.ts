import type { ExerciceTrianglesC, Longueur, PointComplexe, PositionAC } from "../../core6e/trianglesComplexes.types";
import { pgcd, tirerParmi } from "../calculPrimitives/aleatoire";
import { tirerOrdres } from "./construction";

/**
 * Couche A (6e) — génération, famille C (« triangle équilatéral OBF : A est-il le centre ? ») de
 * `6gen41`.
 *
 * **Construction** : O = 0, B = r·e^{ikπ/2} (k ∈ {0;1;2;3}), F = B·e^{±iπ/3} (rotation de ±60°
 * autour de O) — |OB| = |OF| = r et |BF| = r·|e^{±iπ/3} − 1| = r·2 sin(π/6) = r : OBF est
 * équilatéral pour tout tirage.
 *
 * **Audit 6e ch. 5, point 6 (décision F) — verdict non constant** : A était TOUJOURS le centre
 * (écran « équidistant » constant). A est maintenant le centre (≈ 1 fois sur 2 : distances r√3/3)
 * OU le milieu d'un côté (distances r/2, r/2 et r√3/2 au sommet opposé).
 * **Point 45 (décision J) — variété** : r ∈ {2;4;…;12} (pair : coordonnées sans demi-entier), 4
 * directions, 2 orientations → 48 exercices « centre » distincts (auparavant 12 en tout), 192 en
 * tout.
 *
 * **Coordonnées exactes** : chaque coordonnée vaut (u + v√3)/12 avec u, v ENTIERS (jamais les deux
 * non nuls ici : B, F, le centre et les milieux n'ont que des coordonnées rationnelles OU multiples
 * de √3) — LaTeX réduit par `coordonneeLatex`.
 */

const RAYONS = [2, 4, 6, 8, 10, 12] as const;
const POSITIONS_NON_CENTRE: PositionAC[] = ["milieuOB", "milieuOF", "milieuBF"];

/** (u + v√3)/12, u et v entiers. */
interface Coord {
  u: number;
  v: number;
}

function fractionLatex(num: number, den: number): string {
  const g = pgcd(Math.abs(num), den);
  const n = num / g;
  const d = den / g;
  if (d === 1) return `${n}`;
  return `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${d}}`;
}

function radicalLatex(num: number, den: number): string {
  const g = pgcd(Math.abs(num), den);
  const n = num / g;
  const d = den / g;
  const signe = n < 0 ? "-" : "";
  const mag = Math.abs(n) === 1 ? "" : `${Math.abs(n)}`;
  return d === 1 ? `${signe}${mag}\\sqrt{3}` : `${signe}\\frac{${mag}\\sqrt{3}}{${d}}`;
}

function coordonneeLatex(c: Coord): string {
  if (c.u === 0 && c.v === 0) return "0";
  if (c.v === 0) return fractionLatex(c.u, 12);
  if (c.u === 0) return radicalLatex(c.v, 12);
  const g = pgcd(pgcd(Math.abs(c.u), Math.abs(c.v)), 12);
  const u = c.u / g;
  const v = c.v / g;
  const d = 12 / g;
  const vMag = Math.abs(v) === 1 ? "" : `${Math.abs(v)}`;
  const corps = `${u}${v < 0 ? "-" : "+"}${vMag}\\sqrt{3}`;
  return d === 1 ? corps : `\\frac{${corps}}{${d}}`;
}

function valeur(c: Coord): number {
  return (c.u + c.v * Math.sqrt(3)) / 12;
}

function point(x: Coord, y: Coord): PointComplexe {
  const re = valeur(x);
  const im = valeur(y);
  const reL = coordonneeLatex(x);
  const imL = coordonneeLatex(y);
  let latex: string;
  if (reL === "0" && imL === "0") latex = "0";
  else if (imL === "0") latex = reL;
  else {
    const imNeg = imL.startsWith("-");
    const imMag = imNeg ? imL.slice(1) : imL;
    const imTerme = imMag === "1" ? "i" : `${imMag}i`;
    latex = reL === "0" ? `${imNeg ? "-" : ""}${imTerme}` : `${reL}${imNeg ? "-" : "+"}${imTerme}`;
  }
  return { re, im, latex };
}

/** Quart de tour (x, y) → (−y, x), répété k fois. */
function tourner(x: Coord, y: Coord, k: number): [Coord, Coord] {
  let a = x;
  let b = y;
  for (let i = 0; i < k; i++) [a, b] = [{ u: -b.u, v: -b.v }, a];
  return [a, b];
}

function milieu(p: [Coord, Coord], q: [Coord, Coord]): [Coord, Coord] {
  return [
    { u: (p[0].u + q[0].u) / 2, v: (p[0].v + q[0].v) / 2 },
    { u: (p[1].u + q[1].u) / 2, v: (p[1].v + q[1].v) / 2 },
  ];
}

function longueurRationnelle(num: number, den: number): Longueur {
  return { numerique: num / den, latex: fractionLatex(num, den) };
}
function longueurRadicale(num: number, den: number): Longueur {
  return { numerique: (num / den) * Math.sqrt(3), latex: radicalLatex(num, den) };
}

export function construireFamilleC(positionForcee?: PositionAC): ExerciceTrianglesC {
  const r = tirerParmi(RAYONS);
  const k = tirerParmi([0, 1, 2, 3] as const);
  const s = tirerParmi([1, -1] as const);
  const positionA = positionForcee ?? (tirerParmi([true, false] as const) ? "centre" : tirerParmi(POSITIONS_NON_CENTRE));

  const zero: Coord = { u: 0, v: 0 };
  const O: [Coord, Coord] = [zero, zero];
  const B = tourner({ u: 12 * r, v: 0 }, zero, k);
  const F = tourner({ u: 6 * r, v: 0 }, { u: 0, v: 6 * s * r }, k);
  const G = tourner({ u: 6 * r, v: 0 }, { u: 0, v: 2 * s * r }, k);

  const moitie = longueurRationnelle(r, 2);
  const hauteur = longueurRadicale(r, 2);
  const rayon = longueurRadicale(r, 3);
  let A: [Coord, Coord];
  let AO: Longueur;
  let AB: Longueur;
  let AF: Longueur;
  switch (positionA) {
    case "centre":
      A = G;
      AO = AB = AF = rayon;
      break;
    case "milieuOB":
      A = milieu(O, B);
      AO = moitie;
      AB = moitie;
      AF = hauteur;
      break;
    case "milieuOF":
      A = milieu(O, F);
      AO = moitie;
      AF = moitie;
      AB = hauteur;
      break;
    case "milieuBF":
      A = milieu(B, F);
      AB = moitie;
      AF = moitie;
      AO = hauteur;
      break;
  }

  return {
    famille: "C",
    O: point(...O),
    B: point(...B),
    F: point(...F),
    A: point(...A),
    cote: r,
    positionA,
    AO,
    AB,
    AF,
    equidistant: positionA === "centre",
    ordres: tirerOrdres(),
  };
}
