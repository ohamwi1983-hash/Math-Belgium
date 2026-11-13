import type { Composantes, Point } from "../../core/vecteur.types";
import type { ExerciceViserCible, OptionVecteur, SensViserCible, SituationViserCible, VerdictDirect } from "../../core/viserCible.types";
import { CADRES } from "../../moteur/modeleViserCible";

/**
 * Générateur de « Viser une cible : trajectoires rectilignes » (gen89). Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le
 * QR code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Construction : une direction primitive d⃗ (composantes entières non nulles, premières entre
 * elles, |·| ≤ 4), u⃗ = t·d⃗ (|t| ∈ {1, 2}), AC⃗ = s·d⃗ (|s| ∈ {2…6}, |s| ≠ |t| : jamais k = ±1,
 * cible pile au bout de la flèche).
 * - « touche » : s et t de même signe (k = s/t > 0) ; « derrière » : signes contraires (k < 0) ;
 * - « à côté » : AC⃗ = s·d⃗ + e⃗ avec e⃗ petit (composantes −1, 0, 1) et d⃗, e⃗ de critère ±1 : la
 *   cible est à moins d'une unité de la droite (1/‖d⃗‖), l'angle entre AC⃗ et u⃗ ne dépasse pas une
 *   dizaine de degrés — l'œil ne suffit pas. Une fois sur deux, elle est du côté de la flèche (elle
 *   semble touchée), une fois sur deux derrière A (elle semble « dans le mauvais sens »).
 * Les trois issues du sens direct sont équiprobables ; les deux du sens inverse aussi. Composantes
 * de AC⃗ jamais nulles, A et C à au moins une unité du bord de la scène, ‖AC⃗‖ ≥ 4.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export const SITUATIONS: SituationViserCible[] = ["billard", "laser", "foot", "curling"];
const OPTIONS: OptionVecteur[] = ["AC", "CA", "OC"];
const COMPOSANTE_U_MAX = 5;
const COMPOSANTE_AC_MAX = 12;

function directionPrimitive(): Composantes {
  for (;;) {
    const x = choisir([-4, -3, -2, -1, 1, 2, 3, 4]);
    const y = choisir([-4, -3, -2, -1, 1, 2, 3, 4]);
    if (pgcd(x, y) === 1) return { x, y };
  }
}

/** Perturbation e⃗ (composantes −1, 0, 1) de critère ±1 avec d⃗ : la cible frôle la droite. */
function perturbation(d: Composantes): Composantes {
  const possibles: Composantes[] = [];
  for (const x of [-1, 0, 1]) for (const y of [-1, 0, 1]) if (Math.abs(d.x * y - d.y * x) === 1) possibles.push({ x, y });
  return choisir(possibles);
}

function dansLeCadre(situation: SituationViserCible, p: Point): boolean {
  const c = CADRES[situation];
  return p.x >= c.xMin + 1 && p.x <= c.xMax - 1 && p.y >= c.yMin + 1 && p.y <= c.yMax - 1;
}

/** Place A au hasard pour que A et C = A + AC⃗ soient dans la scène ; `null` si impossible. */
function placer(situation: SituationViserCible, ac: Composantes): { A: Point; C: Point } | null {
  const c = CADRES[situation];
  const xs: number[] = [];
  const ys: number[] = [];
  for (let x = c.xMin + 1; x <= c.xMax - 1; x++) if (x + ac.x >= c.xMin + 1 && x + ac.x <= c.xMax - 1) xs.push(x);
  for (let y = c.yMin + 1; y <= c.yMax - 1; y++) if (y + ac.y >= c.yMin + 1 && y + ac.y <= c.yMax - 1) ys.push(y);
  if (xs.length === 0 || ys.length === 0) return null;
  const A = { x: choisir(xs), y: choisir(ys) };
  const C = { x: A.x + ac.x, y: A.y + ac.y };
  return dansLeCadre(situation, A) && dansLeCadre(situation, C) ? { A, C } : null;
}

function acceptable(u: Composantes, ac: Composantes): boolean {
  return (
    Math.abs(u.x) <= COMPOSANTE_U_MAX &&
    Math.abs(u.y) <= COMPOSANTE_U_MAX &&
    ac.x !== 0 &&
    ac.y !== 0 &&
    Math.abs(ac.x) <= COMPOSANTE_AC_MAX &&
    Math.abs(ac.y) <= COMPOSANTE_AC_MAX &&
    Math.hypot(ac.x, ac.y) >= 4
  );
}

export function genererViserCible(sens: SensViserCible, situation?: SituationViserCible, issue?: VerdictDirect | "possible" | "impossible"): ExerciceViserCible {
  const lieu = situation ?? choisir(SITUATIONS);
  const verdict = issue ?? (sens === "directe" ? choisir(["touche", "cote", "derriere"] as const) : choisir(["possible", "impossible"] as const));
  for (;;) {
    const d = directionPrimitive();
    const t = choisir([1, 2]) * choisir([-1, 1]);
    const absS = entier(2, 6);
    if (absS === Math.abs(t)) continue;
    // Signe de s relativement à t : même signe = cible devant A.
    const devant = verdict === "touche" || verdict === "possible" ? true : verdict === "derriere" || verdict === "impossible" ? false : Math.random() < 0.5;
    const s = absS * Math.sign(t) * (devant ? 1 : -1);
    const u = { x: t * d.x, y: t * d.y };
    let ac = { x: s * d.x, y: s * d.y };
    if (verdict === "cote") {
      const e = perturbation(d);
      ac = { x: ac.x + e.x, y: ac.y + e.y };
    }
    if (!acceptable(u, ac)) continue;
    const place = placer(lieu, ac);
    if (!place) continue;
    // Laser : origine au centre de la pièce — au moins une coordonnée négative, sinon le repère
    // centré ne sert à rien.
    if (lieu === "laser" && [place.A.x, place.A.y, place.C.x, place.C.y].every((v) => v >= 0)) continue;
    // A ou C à l'origine : OC⃗ (distracteur de l'écran 1) serait égal à AC⃗ ou nul.
    if ((place.A.x === 0 && place.A.y === 0) || (place.C.x === 0 && place.C.y === 0)) continue;
    // Laser (axes au milieu de la salle) : jamais un point sur un axe, son nom s'y mêlerait aux graduations.
    if (lieu === "laser" && [place.A.x, place.A.y, place.C.x, place.C.y].includes(0)) continue;
    return {
      sens,
      situation: lieu,
      A: place.A,
      C: place.C,
      u,
      inconnue: sens === "inverse" ? choisir(["x", "y"] as const) : null,
      ordreVecteurs: melanger(OPTIONS),
    };
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "directe", label: "La trajectoire touche-t-elle la cible ? (u donné)" },
  { id: "inverse", label: "Quelle direction pour toucher la cible ? (u à compléter)" },
];

export function construireAvecVariante(id: string): ExerciceViserCible {
  if (id === "directe" || id === "inverse") return genererViserCible(id);
  return genererExerciceViserCible();
}

/** Tirage libre : deux fois sur trois le sens direct, une fois sur trois le sens inverse. */
export function genererExerciceViserCible(): ExerciceViserCible {
  return genererViserCible(Math.random() < 2 / 3 ? "directe" : "inverse");
}
