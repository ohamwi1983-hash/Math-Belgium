/**
 * Géométrie pure du graphe Mafs illustratif de "Distance point-droite et droite-droite"
 * (`promptgen47modifications.md`, points 3/7/10) — représente à l'échelle réelle les droites/
 * points de l'instance courante, jamais assez précis pour lire la réponse directement dessus
 * (aucun marqueur de point entier supplémentaire, contrairement à "Lecture graphique — équation
 * d'une droite" dont c'est justement l'objectif). Réutilise `pointDepuisImpliciteDroite`
 * (`moteur/verificationDroite.ts`, module frère — src/ui/ peut dépendre de src/moteur/) pour
 * ancrer chaque droite tracée, et `calculerViewBoxVecteurs` (`ui/vecteurGraph.ts`, chapitre 4,
 * réutilisation cross-chapitre déjà établie : ces deux modules sont de simples utilitaires
 * `Point`/`Composantes` génériques, sans aucune connaissance de leur chapitre d'origine).
 */
import type { DroiteImplicite } from "../core/droite.types";
import type { Point } from "../core/vecteur.types";
import { pointDepuisImpliciteDroite } from "../moteur/verificationDroite";
import { calculerViewBoxVecteurs } from "./vecteurGraph";
import type { PointAffiche } from "./vecteurGraph";

export interface LigneAffichee {
  droite: DroiteImplicite;
  label: string;
  couleur: string;
}

/** Angle du vecteur directeur `(-b ; a)` — universellement correct y compris pour une droite
 * verticale/horizontale, même principe que `LectureGraphiqueDroiteGraph.tsx`. */
export function anglePenteDroite(droite: DroiteImplicite): number {
  return Math.atan2(droite.a, -droite.b);
}

/** Fraction du plus petit côté du viewBox utilisée comme décalage perpendiculaire — proportionnel à
 * l'échelle réellement affichée (jamais une constante absolue en unités du repère, qui serait
 * imperceptible sur un graphe à grande échelle et disproportionnée sur un petit — voir
 * `pointEtiquetteDroite`). */
const FRACTION_DECALAGE_PERPENDICULAIRE = 0.06;

/**
 * Point où placer le LABEL d'une droite sur le graphe — jamais l'ancrage canonique
 * (`pointDepuisImpliciteDroite`, le point de la droite le plus proche de l'ORIGINE) : cet ancrage
 * est systématiquement voisin des graduations des axes (chevauchement direct), et peut tomber hors
 * du viewBox réellement affiché une fois les deux droites éloignées l'une de l'autre (`d_1`/`d_2`
 * peuvent être à des dizaines d'unités de l'origine). Calcule à la place le point de la droite le
 * plus proche du CENTRE du viewBox (projection orthogonale) — reste dans la zone visible par
 * construction, loin de la zone encombrée par les graduations près de l'origine — puis le décale
 * perpendiculairement à la droite (le long de sa normale `(a,b)`), d'une fraction de l'échelle
 * réelle du viewBox, pour que le texte se pose À CÔTÉ du trait plutôt que dessus.
 */
export function pointEtiquetteDroite(droite: DroiteImplicite, viewBox: { x: [number, number]; y: [number, number] }): Point {
  const centre = { x: (viewBox.x[0] + viewBox.x[1]) / 2, y: (viewBox.y[0] + viewBox.y[1]) / 2 };
  const normeNormaleCarre = droite.a * droite.a + droite.b * droite.b || 1;
  // Projection orthogonale de `centre` sur la droite ax+by+c=0.
  const residu = droite.a * centre.x + droite.b * centre.y + droite.c;
  const projection = { x: centre.x - (residu * droite.a) / normeNormaleCarre, y: centre.y - (residu * droite.b) / normeNormaleCarre };

  const largeur = Math.abs(viewBox.x[1] - viewBox.x[0]);
  const hauteur = Math.abs(viewBox.y[1] - viewBox.y[0]);
  const echelle = Math.min(largeur, hauteur) || Math.max(largeur, hauteur) || 1;
  const decalage = echelle * FRACTION_DECALAGE_PERPENDICULAIRE;
  const normeNormale = Math.sqrt(normeNormaleCarre);

  return {
    x: projection.x + (droite.a / normeNormale) * decalage,
    y: projection.y + (droite.b / normeNormale) * decalage,
  };
}

/** Calcule le viewBox couvrant toutes les droites (via un point d'ancrage réel sur chacune) et les
 * points supplémentaires (P, Q) actuellement affichés — jamais un cadrage figé qui laisserait un
 * élément hors champ une fois b/Q révélés. */
export function viewBoxDistanceDroite(lignes: LigneAffichee[], pointsSupplementaires: Point[]): { x: [number, number]; y: [number, number] } {
  const points: PointAffiche[] = [
    ...lignes.map((l) => ({ point: pointDepuisImpliciteDroite(l.droite), label: "" })),
    ...pointsSupplementaires.map((p) => ({ point: p, label: "" })),
  ];
  return calculerViewBoxVecteurs(points);
}

/** Point de la droite le plus proche de l'origine (projection orthogonale). */
function projectionOrigine(d: DroiteImplicite): Point {
  const n2 = d.a * d.a + d.b * d.b || 1;
  return { x: (-d.a * d.c) / n2, y: (-d.b * d.c) / n2 };
}

/**
 * Cadrage FIXE d'un exercice — audit chapitre 7, point 32 : le viewBox était recalculé à partir des
 * seuls éléments affichés, et changeait donc dès que l'aide faisait apparaître b ou Q. L'appelant
 * passe ici TOUT ce que l'exercice connaît déjà (P et Q dès qu'ils sont fixés : les deux droites
 * passent par eux, elles traversent donc forcément le cadre), et le cadre ne bouge plus d'un niveau
 * d'aide à l'autre. Sans P/Q (écran « choisir un point »), chaque droite est ancrée sur son point le
 * plus proche de l'origine.
 */
export function viewBoxCadrageDistanceDroite(droites: DroiteImplicite[], pointsConnus: Point[]): { x: [number, number]; y: [number, number] } {
  const ancrages = pointsConnus.length > 0 ? pointsConnus : droites.map(projectionOrigine);
  return calculerViewBoxVecteurs(ancrages.map((point) => ({ point, label: "" })));
}

type ViewBox = { x: [number, number]; y: [number, number] };

/** Portion de la droite visible dans `viewBox` (réduit de `marge` de chaque côté), sous la forme
 * point + direction unitaire + intervalle de paramètre ; `null` si elle ne traverse pas le cadre. */
function segmentVisible(d: DroiteImplicite, viewBox: ViewBox, marge: number): { origine: Point; u: Point; t: [number, number] } | null {
  const x0 = viewBox.x[0] + marge;
  const x1 = viewBox.x[1] - marge;
  const y0 = viewBox.y[0] + marge;
  const y1 = viewBox.y[1] - marge;
  const centre = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
  const n2 = d.a * d.a + d.b * d.b || 1;
  const residu = d.a * centre.x + d.b * centre.y + d.c;
  const origine = { x: centre.x - (residu * d.a) / n2, y: centre.y - (residu * d.b) / n2 };
  const norme = Math.sqrt(n2);
  const u = { x: -d.b / norme, y: d.a / norme };
  let tMin = -Infinity;
  let tMax = Infinity;
  for (const [o, v, lo, hi] of [
    [origine.x, u.x, x0, x1],
    [origine.y, u.y, y0, y1],
  ] as const) {
    if (Math.abs(v) < 1e-9) {
      if (o < lo || o > hi) return null;
      continue;
    }
    const ta = (lo - o) / v;
    const tb = (hi - o) / v;
    tMin = Math.max(tMin, Math.min(ta, tb));
    tMax = Math.min(tMax, Math.max(ta, tb));
  }
  return tMin < tMax ? { origine, u, t: [tMin, tMax] } : null;
}

function distancePointDroite(p: Point, d: DroiteImplicite): number {
  return Math.abs(d.a * p.x + d.b * p.y + d.c) / (Math.sqrt(d.a * d.a + d.b * d.b) || 1);
}

export type AttacheEtiquettePoint = "ne" | "nw" | "se" | "sw";

const DIRECTIONS_ATTACHE: Record<AttacheEtiquettePoint, Point> = {
  ne: { x: Math.SQRT1_2, y: Math.SQRT1_2 },
  nw: { x: -Math.SQRT1_2, y: Math.SQRT1_2 },
  se: { x: Math.SQRT1_2, y: -Math.SQRT1_2 },
  sw: { x: -Math.SQRT1_2, y: -Math.SQRT1_2 },
};

/** Coin où poser l'étiquette d'un point (P, Q) — le plus éloigné, en angle, des droites qui passent
 * par ce point (audit chapitre 7, point 32 : posée au nord, l'étiquette de Q tombait pile sur la
 * droite b quand celle-ci était verticale). */
export function attacheEtiquettePoint(point: Point, droites: DroiteImplicite[]): AttacheEtiquettePoint {
  const passant = droites.filter((d) => distancePointDroite(point, d) < 1e-6);
  let meilleure: AttacheEtiquettePoint = "ne";
  let meilleurScore = -Infinity;
  for (const attache of ["ne", "nw", "se", "sw"] as AttacheEtiquettePoint[]) {
    const c = DIRECTIONS_ATTACHE[attache];
    // |sin| de l'angle entre la direction de l'étiquette et chaque droite passant par le point.
    const score = Math.min(1, ...passant.map((d) => Math.abs(c.x * d.a + c.y * d.b) / (Math.sqrt(d.a * d.a + d.b * d.b) || 1)));
    if (score > meilleurScore + 1e-9) {
      meilleurScore = score;
      meilleure = attache;
    }
  }
  return meilleure;
}

/**
 * Position des étiquettes de TOUTES les droites d'un même graphe — audit chapitre 7, point 32 :
 * `pointEtiquetteDroite` place chaque étiquette sur la projection du centre du cadre, souvent pile
 * sur Q (et donc sur l'étiquette de Q, ou sur celle d'une autre droite). Ici, plusieurs positions
 * candidates le long de la partie visible de chaque droite (des deux côtés du trait) sont notées
 * par leur distance à l'obstacle le plus proche — points affichés et leur étiquette (posée dans le
 * coin choisi par `attacheEtiquettePoint`), autres droites, étiquettes déjà placées, origine (graduations des axes) — et la mieux
 * dégagée est retenue.
 */
export function placerEtiquettesDroites(droites: DroiteImplicite[], points: Point[], viewBox: ViewBox): Point[] {
  const largeur = Math.abs(viewBox.x[1] - viewBox.x[0]);
  const hauteur = Math.abs(viewBox.y[1] - viewBox.y[0]);
  const echelle = Math.min(largeur, hauteur) || 1;
  const decalage = echelle * FRACTION_DECALAGE_PERPENDICULAIRE;
  const obstaclesFixes: Point[] = [
    ...points,
    ...points.map((p) => {
      const direction = DIRECTIONS_ATTACHE[attacheEtiquettePoint(p, droites)];
      return { x: p.x + direction.x * decalage, y: p.y + direction.y * decalage };
    }),
  ];
  const placees: Point[] = [];

  return droites.map((d, indice) => {
    const segment = segmentVisible(d, viewBox, echelle * 0.08);
    if (!segment) {
      const repli = pointEtiquetteDroite(d, viewBox);
      placees.push(repli);
      return repli;
    }
    const norme = Math.sqrt(d.a * d.a + d.b * d.b) || 1;
    const normale = { x: d.a / norme, y: d.b / norme };
    let meilleure: Point = segment.origine;
    let meilleurScore = -Infinity;
    for (let i = 0; i <= 10; i++) {
      const t = segment.t[0] + ((segment.t[1] - segment.t[0]) * (i + 0.5)) / 11;
      for (const cote of [1, -1]) {
        const candidat = {
          x: segment.origine.x + t * segment.u.x + cote * decalage * normale.x,
          y: segment.origine.y + t * segment.u.y + cote * decalage * normale.y,
        };
        const distances = [
          ...obstaclesFixes.map((o) => Math.hypot(candidat.x - o.x, candidat.y - o.y)),
          ...placees.map((o) => Math.hypot(candidat.x - o.x, candidat.y - o.y)),
          ...droites.filter((_, j) => j !== indice).map((autre) => distancePointDroite(candidat, autre)),
          Math.hypot(candidat.x, candidat.y) * 1.5,
        ];
        const score = Math.min(...distances);
        if (score > meilleurScore) {
          meilleurScore = score;
          meilleure = candidat;
        }
      }
    }
    placees.push(meilleure);
    return meilleure;
  });
}
