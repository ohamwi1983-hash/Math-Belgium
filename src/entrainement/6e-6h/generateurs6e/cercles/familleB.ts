import type { ExerciceCerclesB } from "../../core6e/cercles.types";
import type { Point } from "./geometrie";
import { distance, mediatrice, ordonnee, resoudreQuadratique, tirerEntier } from "./geometrie";

/**
 * Couche A (6e) — génération, famille B ("Cercle par 2 points, rayon donné") de `6gen55`. A,B
 * choisis avec `Ax≠Bx` ET `Ay≠By` — garantit que (AB) n'est ni verticale ni horizontale, donc que
 * sa médiatrice a une pente FINIE ET NON NULLE (jamais verticale — convention de représentation de
 * ce générateur, voir `core6e/cercles.types.ts`). Le centre est ensuite paramétré par son abscisse
 * `x` sur la médiatrice (`y=m·x+p`) : `distance(centre,A)=r` devient une équation du second degré
 * en `x`, résolue via `resoudreQuadratique` — les 2 racines donnent les 2 centres possibles (piège
 * central de la famille : n'en garder qu'un seul).
 *
 * **`r` toujours un ENTIER** (jamais un décimal — CLAUDE.md, "Fraction irréductible, jamais de
 * décimal, pour toute valeur générée par la plateforme") — bug rencontré et corrigé : une première
 * version tirait `r = distance(A,B)/2 + entier`, ce qui rend `r` IRRATIONNEL dès que `distance(A,B)`
 * l'est (le cas général pour des coordonnées entières quelconques), affiché en donnée sous forme
 * `r=9.52` (détecté visuellement via une capture d'écran Playwright). Fix : `r` est tiré DIRECTEMENT
 * comme un entier, puis A/B sont retirés si `r` ne dépasse pas `distance(A,B)/2` d'une marge
 * confortable — jamais l'inverse (dériver `r` depuis `distance(A,B)`).
 */

const R_MIN = 4;
const R_MAX = 14;
const MARGE_MIN = 1.5; // r doit dépasser distance(A,B)/2 d'au moins cette marge, jamais tangent de justesse.

function tirerPoint(): Point {
  return { x: tirerEntier(-6, 6), y: tirerEntier(-6, 6) };
}

export function construireFamilleB(): ExerciceCerclesB {
  const r = tirerEntier(R_MIN, R_MAX);
  let A: Point;
  let B: Point;
  do {
    A = tirerPoint();
    B = tirerPoint();
  } while (A.x === B.x || A.y === B.y || r <= distance(A, B) / 2 + MARGE_MIN);

  const med = mediatrice(A, B);
  const { m, p } = med;

  // (x-Ax)² + (m·x+p-Ay)² = r²  →  a·x² + b·x + c = 0
  const a = 1 + m * m;
  const b = -2 * A.x + 2 * m * (p - A.y);
  const c = A.x * A.x + (p - A.y) * (p - A.y) - r * r;

  const racines = resoudreQuadratique(a, b, c);
  if (!racines) return construireFamilleB(); // défense en profondeur — ne devrait jamais arriver (r>d/2 garantit un discriminant positif).

  const centre1: Point = { x: racines.x1, y: ordonnee(med, racines.x1) };
  const centre2: Point = { x: racines.x2, y: ordonnee(med, racines.x2) };

  return { famille: "B", A, B, r, mediatrice: med, centre1, centre2 };
}
