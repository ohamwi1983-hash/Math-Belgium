/**
 * Géométrie partagée entre les représentations du cercle trigonométrique du chapitre — le sélecteur
 * interactif de l'écran "Quadrant" (`cercleQuadrantSelecteur.ts`, jamais d'angle affiché) et le
 * trajet de l'angle brut (`cercleTrigTrajet.ts`, réutilisé par les aides des générateurs 14 et 15
 * via `CercleTrigTrajetBase.tsx`) — pour que toutes ces représentations restent visuellement
 * identiques (mêmes dimensions, même centre, même rayon) malgré leur contenu différent. Extrait
 * plutôt que dupliqué : contrairement aux petites fonctions pures dupliquées ailleurs dans le
 * projet (ex. `ajusterAuRatio`), ces constantes DOIVENT rester strictement identiques entre elles,
 * jamais dérivées indépendamment. `pointSurCercle`, elle aussi partagée, garantit que tous les
 * modules utilisent exactement la même convention d'angle (0°=est, sens antihoraire, `-` sur le
 * sinus pour compenser l'axe y de SVG orienté vers le bas) et la même convention de sweep-flag pour
 * tout arc dessiné sur ce cercle. L'ancien croquis d'aide indépendant (`cercleTrigSketch.ts`,
 * "AideCercleTrigonometrique") a été retiré — devenu mort une fois le générateur 15 ("Valeurs
 * remarquables") migré vers les aides géométriques du générateur 14 (`promptcreationgenerateur15.md`).
 */

export interface PointCroquisCercleTrig {
  x: number;
  y: number;
}

export const LARGEUR_CERCLE_TRIG = 240;
export const HAUTEUR_CERCLE_TRIG = 240;
export const CENTRE_CERCLE_TRIG: PointCroquisCercleTrig = { x: 120, y: 120 };
export const RAYON_CERCLE_TRIG = 90;

/**
 * Coordonnée pixel du point à `angleDegres` sur un cercle de rayon `rayon` centré sur
 * CENTRE_CERCLE_TRIG — convention trigonométrique standard (0° = est, sens antihoraire), le `-`
 * sur le sinus compense l'axe y de SVG orienté vers le bas.
 */
export function pointSurCercle(angleDegres: number, rayon: number): PointCroquisCercleTrig {
  const rad = (angleDegres * Math.PI) / 180;
  return { x: CENTRE_CERCLE_TRIG.x + rayon * Math.cos(rad), y: CENTRE_CERCLE_TRIG.y - rayon * Math.sin(rad) };
}
