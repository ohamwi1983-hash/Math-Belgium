import type { ExerciceCasAmbigu } from "../core/casAmbigu.types";
import { resoudreSSA } from "./modeleCasAmbigu";
import { diagnostiquerCalculNumeriqueTriangle } from "./verificationTriangle";

/**
 * Vérification de gen74. Toutes les valeurs attendues viennent de `resoudreSSA` (module pur), jamais
 * des saisies précédentes de l'élève : une erreur à un écran ne se propage pas au suivant.
 *
 * Tolérances, cohérentes avec la précision demandée dans chaque consigne (convention de gen19) :
 * - sin B̂ au millième : ±0,002 (valeur arrondie ou tronquée acceptée) ;
 * - angles au dixième de degré : ±0,2° (B̂₁ calculé depuis sin B̂ arrondi au millième reste dedans :
 *   sin B̂ ≤ 0,95 garantit une erreur de sin⁻¹ inférieure à 0,1°) ;
 * - longueurs au centième : tolérance de gen19, max(0,05 ; 1 %) (`diagnostiquerCalculNumeriqueTriangle`),
 *   qui accepte un côté calculé depuis des angles arrondis au dixième.
 * Une saisie illisible donne `parse_error` : l'appli ne compte alors aucune tentative.
 */

export type StatutChampCasAmbigu = "correct" | "faux" | "parse_error";

const TOLERANCE_SINUS = 0.002;
const TOLERANCE_ANGLE = 0.2;

/** Nombre saisi (virgule ou point décimal, signe « − » déjà normalisé). `null` si illisible. */
export function lireNombreCasAmbigu(texte: string): number | null {
  const s = texte.trim().replace(/\s+/g, "").replace(/[−–—]/g, "-").replace(",", ".").replace(/°$/, "");
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(s)) return null;
  return Number(s);
}

function diagnostic(texte: string, attendu: number, juge: (valeur: number, attendu: number) => boolean): StatutChampCasAmbigu {
  const valeur = lireNombreCasAmbigu(texte);
  if (valeur === null) return "parse_error";
  return juge(valeur, attendu) ? "correct" : "faux";
}

export const jugeSinus = (v: number, attendu: number) => Math.abs(v - attendu) <= TOLERANCE_SINUS;
export const jugeAngle = (v: number, attendu: number) => Math.abs(v - attendu) <= TOLERANCE_ANGLE;
export const jugeLongueur = (v: number, attendu: number) => diagnostiquerCalculNumeriqueTriangle(v, attendu) === "correct";

/** Nature d'un champ : fixe sa tolérance. */
export type NatureChampCasAmbigu = "sinus" | "angle" | "longueur";

export interface ChampAttenduCasAmbigu {
  nature: NatureChampCasAmbigu;
  valeur: number;
}

const JUGES: Record<NatureChampCasAmbigu, (v: number, attendu: number) => boolean> = { sinus: jugeSinus, angle: jugeAngle, longueur: jugeLongueur };

/**
 * Champs attendus de chaque écran à champs (les autres écrans sont des choix fermés) :
 * - écran 0 : sin B̂ ;
 * - écran 2 (candidats, s'il y en a) : pour chaque candidat, B̂ puis Â + B̂ ;
 * - écran 4 : c de chaque triangle, ou la hauteur h (plus petite longueur de a) s'il n'y en a aucun.
 */
export function champsAttendus(e: ExerciceCasAmbigu, ecran: number): ChampAttenduCasAmbigu[] {
  const r = resoudreSSA(e);
  if (ecran === 0) return [{ nature: "sinus", valeur: r.sinB }];
  if (ecran === 2) return r.candidats.flatMap((c) => [{ nature: "angle" as const, valeur: c.angleB }, { nature: "angle" as const, valeur: c.somme }]);
  if (ecran === 4) return r.nombreTriangles === 0 ? [{ nature: "longueur", valeur: r.hauteur }] : r.triangles.map((t) => ({ nature: "longueur" as const, valeur: t.c }));
  return [];
}

export function diagnostiquerChamps(e: ExerciceCasAmbigu, ecran: number, saisies: string[]): StatutChampCasAmbigu[] {
  return champsAttendus(e, ecran).map((attendu, i) => diagnostic(saisies[i] ?? "", attendu.valeur, JUGES[attendu.nature]));
}

/** Écran 1 — trancher : la position de sin B̂ par rapport à 1. */
export function verifierComparaison(e: ExerciceCasAmbigu, choix: string): boolean {
  return resoudreSSA(e).comparaison === choix;
}

/** Écran 3 — nombre de triangles. */
export function verifierNombre(e: ExerciceCasAmbigu, choix: string): boolean {
  return String(resoudreSSA(e).nombreTriangles) === choix;
}

/** Écran 2 sans candidat (sin B̂ > 1) : l'arc de rayon a n'atteint pas la demi-droite. */
export const REPONSE_ARC_SANS_CANDIDAT = "aucun-point";

export function verifierArc(choix: string): boolean {
  return choix === REPONSE_ARC_SANS_CANDIDAT;
}
