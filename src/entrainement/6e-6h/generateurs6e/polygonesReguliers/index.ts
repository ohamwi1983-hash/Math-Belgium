import type { ExerciceMesures, ExercicePolygones, ExerciceSommeNulle, ExerciceSommets, IdVariantePolygones, NMesures, NSommets, PointEntier } from "../../core6e/polygonesReguliers.types";
import { sommetsDansCadre } from "../../moteur6e/modelePolygonesReguliers";

export type { IdVariantePolygones } from "../../core6e/polygonesReguliers.types";

/**
 * Couche A (6e) — tirage de `6gen97` « Polygones réguliers et racines n-ièmes ». Uniquement
 * `Math.random` : la graine des feuilles imprimées (`export/codeExercice.ts::avecGraine`) rejoue la
 * même instance.
 *
 * - `sommets` : n équiprobable dans {3, 4, 6, 8} ; le « centre en O » (cas particulier : pas de
 *   translation) est tiré 1 fois sur 6 AVANT la boucle de rejet. Le vecteur CA est choisi pour que
 *   les sommets restent exacts et lisibles : n = 3 ou 6 → CA sur un axe, de longueur 1 ou 2 (et 3
 *   si C = O) (parties de la forme p + q√3, p et q demi-entiers) ; n = 8 → CA sur un axe (longueur 2) ou sur
 *   une diagonale (1 ± i, 2 ± 2i… : Z₁ a alors une coordonnée entière) ; n = 4 → tout vecteur
 *   entier de longueur au plus 3. Centre C dans [−2 ; 2]², tous les sommets dans [−4,5 ; 4,5]²
 *   (figure à fenêtre FIXE [−5 ; 5]²).
 * - `mesures` : n équiprobable dans {3, 4, 6} ; Z₀ à coordonnées entières dans [−7 ; 7]²,
 *   |z₀|² ≥ 2 (le rayon n'est jamais 1). Les réponses ne dépendent que de n et de |z₀|² : |z₀|² est
 *   tiré ÉQUIPROBABLE parmi ses 32 valeurs possibles (puis le point parmi ceux de ce module), pour
 *   que deux séries d'une évaluation n'aient presque jamais les mêmes résultats (mesuré : avec
 *   [−4 ; 4]² et un point équiprobable, deux séries sur trois avaient déjà eu les mêmes réponses).
 * - `somme-nulle` : n équiprobable de 3 à 8 ; C ≠ O dans [−2 ; 2]², CA entier de longueur 1,5 à 3,
 *   tous les sommets dans [−4,5 ; 4,5]².
 */

export const CATALOGUE_VARIANTES: { id: IdVariantePolygones; label: string }[] = [
  { id: "sommets", label: "Sommets : affixes exactes des sommets d'un polygone régulier de centre C (n = 3, 4, 6 ou 8)" },
  { id: "mesures", label: "Mesures : rayon, côté 2r·sin(π/n), périmètre et aire (n = 3, 4 ou 6)" },
  { id: "somme-nulle", label: "Somme nulle : somme des racines n-ièmes de l'unité, puis somme des sommets = n·c" },
];

const BORNE_SOMMETS = 4.5;

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

function entierEntre(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function vecteursPour(n: NSommets, centreO: boolean): PointEntier[] {
  const axes = (L: number[]) => L.flatMap((l) => [{ x: l, y: 0 }, { x: -l, y: 0 }, { x: 0, y: l }, { x: 0, y: -l }]);
  // Centre en O : rayon 3 possible aussi (le polygone reste dans le cadre), pour varier ce cas.
  if (n === 3 || n === 6) return axes(centreO ? [1, 2, 3] : [1, 2]);
  if (n === 8) {
    const diag = [1, 2].flatMap((l) => [{ x: l, y: l }, { x: -l, y: l }, { x: l, y: -l }, { x: -l, y: -l }]);
    return [...axes([2]), ...diag];
  }
  const v: PointEntier[] = [];
  for (let x = -3; x <= 3; x++) for (let y = -3; y <= 3; y++) if ((x || y) && x * x + y * y <= 9) v.push({ x, y });
  return v;
}

export function construireSommets(): ExerciceSommets {
  const n = choisir([3, 4, 6, 8] as const);
  const centreO = Math.random() < 1 / 6;
  const vecteurs = vecteursPour(n, centreO);
  for (;;) {
    const c = centreO ? { x: 0, y: 0 } : { x: entierEntre(-2, 2), y: entierEntre(-2, 2) };
    if (!centreO && c.x === 0 && c.y === 0) continue;
    const v = choisir(vecteurs);
    const e: ExerciceSommets = { variante: "sommets", n, c, a: { x: c.x + v.x, y: c.y + v.y } };
    // A ≠ O : « a = 0 » serait déroutant et A cacherait l'étiquette de O sur la figure.
    if (e.a.x === 0 && e.a.y === 0) continue;
    if (sommetsDansCadre(e, BORNE_SOMMETS)) return e;
  }
}

/** Points Z₀ possibles de `mesures`, groupés par |z₀|² (32 valeurs de 2 à 98). */
const POINTS_PAR_RAYON_CARRE: PointEntier[][] = (() => {
  const groupes = new Map<number, PointEntier[]>();
  for (let x = -7; x <= 7; x++)
    for (let y = -7; y <= 7; y++) {
      const R = x * x + y * y;
      if (R < 2) continue;
      if (!groupes.has(R)) groupes.set(R, []);
      groupes.get(R)!.push({ x, y });
    }
  return [...groupes.keys()].sort((p, q) => p - q).map((R) => groupes.get(R)!);
})();

export function construireMesures(): ExerciceMesures {
  const n = choisir([3, 4, 6] as const) as NMesures;
  // |z₀|² équiprobable d'abord (les réponses ne dépendent que de lui), puis le point lui-même.
  const a = choisir(choisir(POINTS_PAR_RAYON_CARRE));
  return { variante: "mesures", n, a };
}

export function construireSommeNulle(): ExerciceSommeNulle {
  const n = entierEntre(3, 8);
  for (;;) {
    const c = { x: entierEntre(-2, 2), y: entierEntre(-2, 2) };
    if (c.x === 0 && c.y === 0) continue;
    const v = { x: entierEntre(-3, 3), y: entierEntre(-3, 3) };
    const l2 = v.x * v.x + v.y * v.y;
    if (l2 < 2.25 || l2 > 9) continue;
    const a = { x: c.x + v.x, y: c.y + v.y };
    if (a.x === 0 && a.y === 0) continue;
    const e: ExerciceSommeNulle = { variante: "somme-nulle", n, c, a };
    if (sommetsDansCadre(e, BORNE_SOMMETS)) return e;
  }
}

export function construireAvecVarianteId(id: string): ExercicePolygones {
  switch (id) {
    case "mesures":
      return construireMesures();
    case "somme-nulle":
      return construireSommeNulle();
    default:
      return construireSommets();
  }
}

/** Tirage libre : variante équiprobable. */
export function genererExercicePolygones(): ExercicePolygones {
  return construireAvecVarianteId(choisir(CATALOGUE_VARIANTES).id);
}
