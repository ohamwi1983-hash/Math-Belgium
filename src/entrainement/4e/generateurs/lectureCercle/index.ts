import type { ExerciceLectureCercle, VarianteLectureCercle } from "../../core/lectureCercle.types";

/**
 * Générateur de gen122 « Lire sur le cercle trigonométrique ». Tout le hasard passe par
 * `Math.random` (`genererAvecCode` : le QR code rouvre le même point M).
 *
 * Position de M tirée AVANT l'angle, pour équilibrer les issues (verdicts compris) :
 * - axe vertical (90°, 270° : « tan θ n'est pas définie ») : 20 % ;
 * - axe horizontal (0°, 180° : tan θ = 0) : 10 % ;
 * - quadrant strict : 70 %, soit 17,5 % par quadrant, puis l'angle du premier quadrant 30°, 45° ou
 *   60° équiprobable.
 * VARIANTE = unité de la réponse de l'écran 2 (degrés, radians) ; la figure est la même.
 */

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

export const CATALOGUE_VARIANTES: { id: VarianteLectureCercle; label: string }[] = [
  { id: "degres", label: "Angle θ en degrés" },
  { id: "radians", label: "Angle θ en radians" },
];

/** Angle de M (degrés), selon la répartition ci-dessus. */
export function tirerAngle(): number {
  const r = Math.random();
  if (r < 0.2) return choisir([90, 270]);
  if (r < 0.3) return choisir([0, 180]);
  const ref = choisir([30, 45, 60]);
  const quadrant = choisir([1, 2, 3, 4]);
  return quadrant === 1 ? ref : quadrant === 2 ? 180 - ref : quadrant === 3 ? 180 + ref : 360 - ref;
}

export function genererLectureCercle(variante: VarianteLectureCercle): ExerciceLectureCercle {
  return { variante, angle: tirerAngle() };
}

export function construireAvecVariante(id: string): ExerciceLectureCercle {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceLectureCercle();
  return genererLectureCercle(id as VarianteLectureCercle);
}

export function genererExerciceLectureCercle(): ExerciceLectureCercle {
  return genererLectureCercle(choisir(CATALOGUE_VARIANTES).id);
}
