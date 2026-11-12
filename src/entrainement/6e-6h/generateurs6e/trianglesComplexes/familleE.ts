import type { ExerciceTrianglesE, PositionE } from "../../core6e/trianglesComplexes.types";
import { tirerEntier, tirerParmi } from "../calculPrimitives/aleatoire";
import { pointEntier, tirerOrdres } from "./construction";

/**
 * Couche A (6e) — génération, famille E (« alignés, perpendiculaires ou ni l'un ni l'autre ») de
 * `6gen41` — audit 6e ch. 5, point 44 (décision I).
 *
 * Critère du cours : q = (z_C − z_A)/(z_B − z_A). q réel ⟺ A, B, C alignés ; q imaginaire pur ⟺
 * (AB) ⊥ (AC) ; sinon ni l'un ni l'autre. **Construction à rebours** : u = z_B − z_A entier de
 * Gauss non nul, q tiré dans la banque du cas voulu (entier de Gauss), z_C = z_A + q·u — q est donc
 * EXACT et entier, l'élève le retrouve par la division (conjugué du dénominateur). Les 3 cas sont
 * ÉQUIPROBABLES (aucun verdict dominant). q ≠ 0 et q ≠ 1 : C n'est jamais confondu avec A ou B.
 */

export const POSITIONS_E: PositionE[] = ["alignes", "perpendiculaires", "aucun"];

const Q_ALIGNES = [-3, -2, -1, 2, 3].map((k) => ({ re: k, im: 0 }));
const Q_PERPENDICULAIRES = [-3, -2, -1, 1, 2, 3].map((k) => ({ re: 0, im: k }));
const Q_AUCUN = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
  [2, 1],
  [2, -1],
  [1, 2],
  [1, -2],
  [-2, 1],
  [-1, -2],
].map(([re, im]) => ({ re, im }));

export function construireFamilleE(positionForcee?: PositionE): ExerciceTrianglesE {
  const position = positionForcee ?? tirerParmi(POSITIONS_E);
  const q = tirerParmi(position === "alignes" ? Q_ALIGNES : position === "perpendiculaires" ? Q_PERPENDICULAIRES : Q_AUCUN);
  const a = { re: tirerEntier(-4, 4), im: tirerEntier(-4, 4) };
  let u = { re: 0, im: 0 };
  while (u.re === 0 && u.im === 0) u = { re: tirerEntier(-3, 3), im: tirerEntier(-3, 3) };
  const qu = { re: q.re * u.re - q.im * u.im, im: q.re * u.im + q.im * u.re };
  return {
    famille: "E",
    A: pointEntier(a.re, a.im),
    B: pointEntier(a.re + u.re, a.im + u.im),
    C: pointEntier(a.re + qu.re, a.im + qu.im),
    quotientRe: q.re,
    quotientIm: q.im,
    position,
    ordres: tirerOrdres(),
  };
}
