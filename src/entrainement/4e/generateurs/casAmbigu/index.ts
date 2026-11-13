import type { ExerciceCasAmbigu, UniteCasAmbigu } from "../../core/casAmbigu.types";
import { resoudreSSA, sinDeg } from "../../moteur/modeleCasAmbigu";

/**
 * Générateur de « Cas ambigu : 0, 1 ou 2 triangles ? » (gen74). Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * - Issue tirée EN PREMIER, uniformément : 0, 1 ou 2 triangles (≈ 1/3 chacune). Dans « 1 triangle »,
 *   le cas rare sin B̂ = 1 exactement (Â = 30°, b = 2a : triangle rectangle en B) sort une fois sur
 *   six ; sinon c'est B̂₂ qui est refusé (Â + B̂₂ ≥ 180°, a > b).
 * - Format des données tiré indépendamment de l'issue : deux côtés entiers (60 %) ou un des deux
 *   côtés avec une décimale (40 %, côté a ou b au hasard) — c'est la `forme` des évaluations.
 * - Â entier dans [25° ; 58°] (aigu, comme la méthode du cours : B̂₁ convient alors toujours), b
 *   dans [5 ; 14] ; Â = 30° (sinus exact) seulement quand l'issue garde au moins un triangle, pour
 *   que chaque instance exige la calculatrice (sinon sin B̂ = b/(2a) et la hauteur b/2 se calculent
 *   de tête).
 *
 * Marges (aucune valeur limite qu'un arrondi ferait basculer) :
 * - aucun triangle : sin B̂ ≥ 1,05 ; a ≥ 2 et a ≥ 0,35·b ;
 * - deux triangles : sin B̂ ≤ 0,95 et Â + B̂₂ ≤ 172° (le second triangle a Ĉ₂ ≥ 8°, pas aplati) ;
 * - tout triangle obtenu : c ≥ 1,5 (B lisible sur la figure, à distance de A) ;
 * - un triangle (B̂₂ refusé) : Â + B̂₂ ≥ 184°, B̂₁ ≥ 12°, a ≤ 1,6·b (figure lisible).
 */

export type IssueCasAmbigu = 0 | 1 | 2;

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

const UNITES: UniteCasAmbigu[] = ["cm", "dm", "m"];
const PROBA_DECIMAL = 0.4;
const PROBA_RECTANGLE = 1 / 6;
const ANGLE_MIN = 25;
const ANGLE_MAX = 58;

/** Côté entier (« entier ») ou avec une décimale non nulle (« decimal »), dans [5 ; 14]. */
function tirerB(decimal: boolean): number {
  if (!decimal) return entier(5, 14);
  for (;;) {
    const k = entier(50, 149);
    if (k % 10 !== 0) return k / 10;
  }
}

/** Valeurs de a autorisées dans [lo ; hi] : entiers, ou décimaux à une décimale non nulle. */
function grille(lo: number, hi: number, decimal: boolean): number[] {
  const valeurs: number[] = [];
  if (decimal) {
    for (let k = Math.ceil(lo * 10 - 1e-9); k <= Math.floor(hi * 10 + 1e-9); k++) if (k % 10 !== 0) valeurs.push(k / 10);
  } else {
    for (let k = Math.ceil(lo - 1e-9); k <= Math.floor(hi + 1e-9); k++) valeurs.push(k);
  }
  return valeurs;
}

/** Intervalle de a qui donne l'issue voulue (avec les marges), pour Â et b donnés. */
function intervalleA(issue: IssueCasAmbigu, angleA: number, b: number): [number, number] {
  const h = b * sinDeg(angleA);
  if (issue === 0) return [Math.max(2, 0.35 * b), h / 1.05];
  if (issue === 2) return [Math.max(2, h / 0.95), Math.min(b, h / sinDeg(angleA + 8))];
  return [Math.max(b, h / sinDeg(angleA - 4)), Math.min(1.6 * b, h / sinDeg(12))];
}

/** Vérification finale par le moteur (jamais une seconde formule) : issue et marges respectées. */
function conforme(e: ExerciceCasAmbigu, issue: IssueCasAmbigu): boolean {
  const r = resoudreSSA(e);
  if (r.nombreTriangles !== issue) return false;
  if (issue === 0) return r.sinB >= 1.05 && e.a >= 2 && e.a >= 0.35 * e.b;
  if (r.triangles.some((t) => t.c < 1.5)) return false;
  if (r.sinB > 0.95 || r.candidats.length !== 2) return false;
  const [b1, b2] = r.candidats;
  if (issue === 2) return b2!.somme <= 172;
  return b2!.somme >= 184 && b1!.angleB >= 12 && e.a <= 1.6 * e.b;
}

/** Le cas rare sin B̂ = 1 : Â = 30°, b = 2a, triangle rectangle en B. */
function tirerRectangle(decimal: boolean, unite: UniteCasAmbigu): ExerciceCasAmbigu {
  const a = decimal ? entier(3, 6) + 0.5 : entier(3, 7);
  return { angleA: 30, a, b: 2 * a, unite };
}

export function genererCasAmbigu(issue: IssueCasAmbigu): ExerciceCasAmbigu {
  const decimal = Math.random() < PROBA_DECIMAL;
  const coteDecimal = choisir(["a", "b"] as const);
  const unite = choisir(UNITES);
  if (issue === 1 && Math.random() < PROBA_RECTANGLE) return tirerRectangle(decimal, unite);
  for (;;) {
    const angleA = entier(ANGLE_MIN, ANGLE_MAX);
    if (angleA === 30 && issue === 0) continue;
    for (let essai = 0; essai < 40; essai++) {
      const b = tirerB(decimal && coteDecimal === "b");
      const [lo, hi] = intervalleA(issue, angleA, b);
      const candidats = grille(lo, hi, decimal && coteDecimal === "a");
      if (candidats.length === 0) continue;
      const e: ExerciceCasAmbigu = { angleA, b, a: choisir(candidats), unite };
      if (conforme(e, issue)) return e;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

/**
 * UNE seule variante, volontairement : le nombre de triangles est le VERDICT de l'exercice. Une
 * variante « 0 / 1 / 2 triangles » laisserait le professeur (ou le tirage équilibré, qui reproduit la
 * variante de la série A dans toutes les séries) imposer l'issue — et la réponse circulerait entre
 * élèves.
 */
export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [{ id: "ssa", label: "Cas ambigu SSA — issue tirée au hasard (0, 1 ou 2 triangles)" }];

export function genererExerciceCasAmbigu(): ExerciceCasAmbigu {
  return genererCasAmbigu(choisir([0, 1, 2] as const));
}

export function construireAvecVariante(_id: string): ExerciceCasAmbigu {
  return genererExerciceCasAmbigu();
}
