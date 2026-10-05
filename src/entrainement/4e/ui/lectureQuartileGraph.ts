/**
 * Géométrie pure des écrans du polygone des effectifs cumulés (Polygone + les 3 écrans de lecture
 * graphique Q1/médiane/Q3, variante "classes", `promptgen33modifications2.md`) — pas de dépendance
 * React/Mafs ici, testable sans DOM, même principe que `histogrammeGraph.ts`/`boiteMoustachesGraph.ts`.
 *
 * `intersectionCourbeEnY` retrouve l'abscisse où le polygone des effectifs cumulés (piecewise
 * linéaire, x et y tous deux strictement croissants — un effectif est toujours >= 1) croise une
 * hauteur `y` donnée — c'est cette même fonction qui pilote le tracé live des pointillés
 * horizontaux/verticaux et la croix, jamais recalculée différemment côté composant.
 */
export interface PointPolygoneXY {
  x: number;
  y: number;
}

const MARGE = 1.5;
const DEMI_LARGEUR_MIN = 3;

export interface ViewBoxPolygoneEffectifs {
  x: [number, number];
  y: [number, number];
}

/** ViewBox du polygone des effectifs cumulés (`PolygoneEffectifsGraph`/`LectureQuartileGraph`) —
 * marge fixe PAR AXE, jamais de ratio x/y forcé entre eux : X est la borne supérieure de classe
 * (une grandeur physique du contexte de l'exercice), Y est l'effectif cumulé (un simple compte,
 * `[0,n]`) — deux grandeurs sans rapport, même principe que "Comparaison de deux séries
 * statistiques"/gen38 (`promptgen38fixechellegraphe.md`) : chaque axe reçoit sa propre marge fixe
 * (et le même plancher `DEMI_LARGEUR_MIN` que `calculerViewBoxVecteurs`, `vecteurGraph.ts`, dont
 * cette fonction reprend la géométrie SAUF l'étape finale `ajusterAuRatio`) et c'est Mafs
 * (`preserveAspectRatio={false}`, voir les 2 composants React) qui calcule ensuite deux échelles
 * pixel indépendantes — jamais `calculerViewBoxVecteurs` elle-même, réservée aux graphes du
 * chapitre "Calcul vectoriel" où X et Y partagent réellement la même unité (angles/colinéarité à
 * préserver, contrairement à ce polygone). **Bug corrigé, vérifié empiriquement AVANT tout
 * correctif** (méthode "verify before fixing" du projet) : sur un balayage des 31 contextes de la
 * banque × 15 tirages chacun, le ratio x/y naturel (avant tout forçage) variait de 0,34 à 1,2 —
 * jamais 1 — donc `ajusterAuRatio` étirait TOUJOURS l'axe X (jamais Y) pour compenser, jusqu'à
 * ×4,41 dans le pire cas observé (contexte "fréquence cardiaque au repos") — une distorsion réelle,
 * quoique bien plus modeste que celle de gen38 (jusqu'à ×260 dans son pire cas), car
 * `construireClasses` (`generateurs/mediane/index.ts`) ancre toujours l'étendue des classes sur une
 * petite fenêtre indépendante de la magnitude du contexte (jitter + 4-5 amplitudes de 2 à 5 unités
 * chacune), contrairement à gen38 qui affiche directement les vraies valeurs sur toute la plage
 * physique du contexte. */
export function calculerViewBoxPolygoneEffectifs(points: PointPolygoneXY[]): ViewBoxPolygoneEffectifs {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  let xMin = Math.min(...xs) - MARGE;
  let xMax = Math.max(...xs) + MARGE;
  let yMin = Math.min(...ys) - MARGE;
  let yMax = Math.max(...ys) + MARGE;

  if (xMax - xMin < DEMI_LARGEUR_MIN * 2) {
    const centre = (xMin + xMax) / 2;
    xMin = centre - DEMI_LARGEUR_MIN;
    xMax = centre + DEMI_LARGEUR_MIN;
  }
  if (yMax - yMin < DEMI_LARGEUR_MIN * 2) {
    const centre = (yMin + yMax) / 2;
    yMin = centre - DEMI_LARGEUR_MIN;
    yMax = centre + DEMI_LARGEUR_MIN;
  }

  return { x: [xMin, xMax], y: [yMin, yMax] };
}

/**
 * Les 2 sommets du polygone qui ENCADRENT un seuil donné — les extrémités du segment sur lequel
 * l'interpolation linéaire se fait pour ce seuil (`promptgen33gen35aidesinterpolation.md`, aide 3 des
 * 3 écrans de lecture graphique Q1/médiane/Q3). Reproduit EXACTEMENT la même règle stricte `>` (jamais
 * `>=`) que `calculerParametreDePosition` (Couche A, `generateurs/mediane/parametreDePosition.ts` —
 * `classes.findIndex(c => c.effectifCumule > seuil)`) : `sup` est le premier sommet dont l'ordonnée
 * dépasse STRICTEMENT `y` — si `y` coïncide exactement avec l'ordonnée d'un sommet (cas limite), ce
 * sommet devient `inf`, jamais `sup` (le sommet SUIVANT est pris comme `sup`, cohérent avec le fait
 * que ce même sommet n'est jamais la réponse dans ce cas). Suppose `points.length>=2` et `y` dans le
 * domaine du polygone (toujours vrai pour un seuil n/4, n/2 ou 3n/4 avec n = effectif total).
 */
export function pointsEncadrementSeuil(points: PointPolygoneXY[], y: number): { inf: PointPolygoneXY; sup: PointPolygoneXY } {
  for (let i = 1; i < points.length; i++) {
    if (points[i].y > y) return { inf: points[i - 1], sup: points[i] };
  }
  return { inf: points[points.length - 2], sup: points[points.length - 1] };
}

/** `null` si `y` est hors du domaine du polygone (`[points[0].y, points[dernier].y]`, toujours
 * `[0, n]`) — aucune intersection à afficher dans ce cas. */
export function intersectionCourbeEnY(points: PointPolygoneXY[], y: number): number | null {
  if (points.length < 2) return null;
  const yMin = points[0].y;
  const yMax = points[points.length - 1].y;
  if (y < yMin || y > yMax) return null;

  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    if (y <= p1.y) {
      if (p1.y === p0.y) return p0.x; // dégénéré, jamais en pratique (effectif toujours >= 1)
      const t = (y - p0.y) / (p1.y - p0.y);
      return p0.x + t * (p1.x - p0.x);
    }
  }
  return points[points.length - 1].x;
}
