/**
 * Géométrie pure du graphe Mafs partagé par (presque) tous les générateurs du chapitre "Calcul
 * vectoriel" — affiche des points et des vecteurs à l'ÉCHELLE RÉELLE (coordonnées réelles),
 * contrairement aux croquis SVG schématiques du reste du projet (`TriangleSketch`, `CercleTrigSketch`...).
 * Réutilise les briques génériques déjà partagées entre les 4 graphes Mafs précédents du projet —
 * `RATIO_GRAPHE`/`ZOOM_MIN`/`ZOOM_MAX`/`calculerPasGrille`/`formatEtiquetteGrille`
 * (`mafsTransformation.ts`) — jamais réimplémentées ; seule `ajusterAuRatio` est dupliquée
 * localement, même principe que les générateurs Mafs précédents (petite fonction pure, jamais
 * risquer une régression sur les autres consommateurs pour un partage marginal).
 */
import { RATIO_GRAPHE } from "./mafsTransformation";
import type { Composantes, Point } from "../core/vecteur.types";

export interface PointAffiche {
  point: Point;
  label: string;
  couleur?: string;
  /** Position de label imposée (coordonnées réelles), en remplacement de la position par défaut de
   * Mafs (`attach="s"`, un petit décalage fixe en pixels, indépendant du viewBox) — mêmes raisons
   * que `VecteurAffiche.labelPosition` ci-dessous : `attach="s"` seul ne suffit pas à éviter un
   * chevauchement avec la flèche/le point lui-même dès que le point est l'origine ou l'extrémité
   * d'un vecteur tracé tout près (`promptmodificationsgenerateurs20et21.md`). Absente par défaut,
   * comportement historique inchangé pour tout appelant qui ne la fournit pas. */
  labelPosition?: Point;
}

/** Label enrichi (flèche + lettre de base + indice optionnel) — dessiné en géométrie SVG pure
 * (segment + triangle pour la flèche, `tspan` à taille réduite pour l'indice), jamais en caractère
 * Unicode (voir `VecteurGraph.tsx::LabelVecteurFleche` et `formatApplicationPhysique.ts` pour le
 * raisonnement complet). Mutuellement exclusif avec `label` — comportement historique inchangé pour
 * tous les consommateurs qui continuent d'utiliser `label` (chaîne simple, rendue via le `<Text>`
 * de Mafs). `indice` absent/vide (ex. "Comparaison visuelle de vecteurs", labels à une seule
 * lettre sans indice) : `LabelVecteurFleche` centre alors la flèche directement sur la lettre de
 * base, sans décalage — aucun `<tspan>` d'indice rendu. */
export interface LabelVecteurAvecFleche {
  base: string;
  indice?: string;
}

export interface VecteurAffiche {
  origine: Point;
  vecteur: Composantes;
  label?: string;
  labelFleche?: LabelVecteurAvecFleche;
  /** Position de label imposée (coordonnées réelles), en remplacement du milieu du vecteur calculé
   * par défaut dans `VecteurGraph.tsx`. Absente par défaut (comportement historique inchangé) —
   * fournie par un appelant qui a lui-même résolu les chevauchements entre plusieurs labels sur le
   * même graphe (voir `calculerPositionsEtiquettesSansChevauchement` ci-dessous), un calcul qui a
   * besoin de connaître TOUS les vecteurs du graphe à la fois, donc impossible à faire à l'intérieur
   * de `VecteurGraph.tsx` sans lui faire porter une logique de placement propre à un seul
   * consommateur. */
  labelPosition?: Point;
  couleur?: string;
  /** Rend un simple SEGMENT (`Line.Segment`, sans tête de flèche) plutôt qu'un `Vector` — pour un
   * tracé qui n'est PAS sémantiquement un vecteur (ex. le segment [AB] entre deux points déjà
   * nommés, `promptcorrectionsgen17gen12gen21.md` point 5) mais réutilise la même géométrie
   * origine/composantes. Absent/`false` par défaut, comportement historique inchangé (rendu en
   * `Vector` avec flèche) pour tous les appelants existants. */
  sansFleche?: boolean;
}

export interface ViewBoxTransformation {
  x: [number, number];
  y: [number, number];
}

function ajusterAuRatio(x: [number, number], y: [number, number], ratio: number): ViewBoxTransformation {
  const largeurX = x[1] - x[0];
  const largeurY = y[1] - y[0];
  const centreX = (x[0] + x[1]) / 2;
  const centreY = (y[0] + y[1]) / 2;

  if (largeurX / largeurY > ratio) {
    const demiLargeurY = largeurX / ratio / 2;
    return { x, y: [centreY - demiLargeurY, centreY + demiLargeurY] };
  }
  const demiLargeurX = (largeurY * ratio) / 2;
  return { x: [centreX - demiLargeurX, centreX + demiLargeurX], y };
}

const MARGE = 1.5;
const DEMI_LARGEUR_MIN = 3;

/** Calcule le viewBox couvrant tous les points/vecteurs fournis, avec une marge fixe — jamais un
 * domaine trop serré qui collerait les points au bord du graphe. Couvre aussi `labelPosition`
 * quand fourni (point OU vecteur) — sans quoi un point/vecteur déjà extrémal du domaine (fréquent :
 * c'est précisément le cas qui définit la limite du viewBox) verrait son étiquette décalée
 * (`positionEtiquettePoint`/`calculerPositionsEtiquettesSansChevauchement` ci-dessous, décalage
 * proportionnel au viewBox) repoussée AU-DELÀ de la marge fixe et tronquée par le viewport SVG —
 * bug réel trouvé par vérification Playwright (`promptmodificationsgenerateurs20et21.md`, lettre
 * "B" coupée en bas du graphe). Rétro-compatible : un appelant qui ne fournit jamais `labelPosition`
 * (la quasi-totalité des ~10 consommateurs actuels) obtient un viewBox strictement identique à
 * avant. */
export function calculerViewBoxVecteurs(points: PointAffiche[], vecteurs: VecteurAffiche[] = []): ViewBoxTransformation {
  const coords: Point[] = [
    ...points.map((p) => p.point),
    ...points.filter((p) => p.labelPosition).map((p) => p.labelPosition as Point),
    ...vecteurs.flatMap((v) => [v.origine, { x: v.origine.x + v.vecteur.x, y: v.origine.y + v.vecteur.y }]),
    ...vecteurs.filter((v) => v.labelPosition).map((v) => v.labelPosition as Point),
  ];
  if (coords.length === 0) {
    return { x: [-DEMI_LARGEUR_MIN, DEMI_LARGEUR_MIN], y: [-DEMI_LARGEUR_MIN, DEMI_LARGEUR_MIN] };
  }

  const xs = coords.map((c) => c.x);
  const ys = coords.map((c) => c.y);
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

  return ajusterAuRatio([xMin, xMax], [yMin, yMax], RATIO_GRAPHE);
}

const FRACTION_DECALAGE_PERPENDICULAIRE_ETIQUETTE = 0.07;
const FRACTION_DISTANCE_MIN_ETIQUETTES = 0.12;
const ITERATIONS_RESOLUTION_CHEVAUCHEMENT = 8;

/**
 * Positions de labels sans chevauchement pour un ENSEMBLE de vecteurs affichés sur le même graphe
 * — un vecteur par élément de `vecteurs`, résultat dans le MÊME ORDRE (`labelPosition` de
 * `VecteurAffiche`, consommé par `VecteurGraph.tsx` à la place du milieu par défaut). Né du
 * signalement "Comparaison visuelle de vecteurs sur figure" (gen28) : le placement par défaut
 * (milieu du vecteur, `attach="n"`) chevauche fortement dès que plusieurs vecteurs partagent une
 * origine/direction proches (vecteurs dérivés d'un même vecteur de base — multiples scalaires,
 * translations) — un label peut même se retrouver collé sur SON PROPRE tracé quand celui-ci est
 * vertical (le décalage "nord" de `attach="n"` tombe alors exactement sur la même droite).
 *
 * Deux passes, jamais une seule :
 * 1. **Décalage perpendiculaire** — chaque label part du milieu de son propre vecteur, décalé
 *    PERPENDICULAIREMENT à sa direction (jamais le long de celle-ci, contrairement à `attach="n"`)
 *    d'une fraction FIXE du plus petit côté du viewBox — même principe que `pointEtiquetteDroite`
 *    (`ui/distanceDroiteGraph.ts`, gen47) : un décalage proportionnel au viewBox, jamais en unités
 *    absolues du repère (une distance fixe est soit invisible soit disproportionnée selon
 *    l'échelle réelle affichée — piège déjà rencontré et corrigé sur gen47). Ce seul décalage
 *    élimine PAR CONSTRUCTION le cas "label collé sur son propre vecteur", quelle que soit son
 *    orientation.
 * 2. **Résolution de chevauchement entre labels distincts** — le décalage perpendiculaire seul ne
 *    suffit pas : deux vecteurs colinéaires de longueurs différentes partageant la même origine
 *    (ex. `a` et `2a`) ont des milieux différents mais peuvent rester proches, et deux vecteurs
 *    strictement identiques (même origine ET mêmes composantes, jamais rencontré dans les
 *    contrats actuels mais couvert par robustesse) donnent le MÊME milieu. Une résolution itérative
 *    de type répulsion (distance minimale = fraction fixe du viewBox ; les deux positions trop
 *    proches sont écartées le long de l'axe qui les relie, ou selon un angle déterministe dérivé de
 *    leurs INDICES si elles sont exactement confondues — jamais aléatoire, un même exercice doit
 *    toujours produire le même graphe) élimine tout chevauchement résiduel, quelle que soit la
 *    configuration de vecteurs générée pour l'instance.
 *
 * Pure — ne dépend que des données déjà présentes dans `VecteurAffiche`/`ViewBoxTransformation`,
 * jamais du DOM (pas de `getBBox`, cohérent avec le reste du module).
 */
export function calculerPositionsEtiquettesSansChevauchement(vecteurs: VecteurAffiche[], viewBox: ViewBoxTransformation): Point[] {
  const largeurViewBox = viewBox.x[1] - viewBox.x[0];
  const hauteurViewBox = viewBox.y[1] - viewBox.y[0];
  const echelle = Math.min(largeurViewBox, hauteurViewBox);
  const decalage = echelle * FRACTION_DECALAGE_PERPENDICULAIRE_ETIQUETTE;
  const distanceMin = echelle * FRACTION_DISTANCE_MIN_ETIQUETTES;

  const positions: Point[] = vecteurs.map((v) => {
    const longueur = Math.hypot(v.vecteur.x, v.vecteur.y) || 1;
    const milieuX = v.origine.x + v.vecteur.x / 2;
    const milieuY = v.origine.y + v.vecteur.y / 2;
    const perpX = -v.vecteur.y / longueur;
    const perpY = v.vecteur.x / longueur;
    return { x: milieuX + perpX * decalage, y: milieuY + perpY * decalage };
  });

  for (let iteration = 0; iteration < ITERATIONS_RESOLUTION_CHEVAUCHEMENT; iteration++) {
    let bouge = false;
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const distance = Math.hypot(dx, dy);
        if (distance >= distanceMin) continue;
        bouge = true;
        const manque = (distanceMin - distance) / 2;
        if (distance > 1e-9) {
          const ux = dx / distance;
          const uy = dy / distance;
          positions[i].x -= ux * manque;
          positions[i].y -= uy * manque;
          positions[j].x += ux * manque;
          positions[j].y += uy * manque;
        } else {
          const angle = (j - i) * 0.9;
          positions[i].x -= Math.cos(angle) * manque;
          positions[i].y -= Math.sin(angle) * manque;
          positions[j].x += Math.cos(angle) * manque;
          positions[j].y += Math.sin(angle) * manque;
        }
      }
    }
    if (!bouge) break;
  }

  return positions;
}

const FRACTION_DECALAGE_ETIQUETTE_POINT = 0.14;

/**
 * Position d'étiquette pour UN point, décalée d'une fraction fixe du viewBox dans la `direction`
 * fournie par l'appelant (`promptmodificationsgenerateurs20et21.md`) — même principe que
 * `calculerPositionsEtiquettesSansChevauchement` ci-dessus : décalage proportionnel au viewBox,
 * jamais une distance fixe en unités absolues du repère (piège déjà rencontré et corrigé sur
 * gen47/gen28). `direction` n'a pas besoin d'être normalisée (seul son ORIENTATION compte) ; une
 * direction nulle (aucune géométrie de référence disponible — ex. un point isolé, sans vecteur ni
 * second point à éviter) retombe sur un décalage diagonal fixe (nord-est), jamais un décalage nul
 * qui laisserait l'étiquette collée au point (le défaut historique de `attach="s"` seul, un petit
 * offset pixel FIXE, indépendant de l'échelle réelle du graphe).
 *
 * Chaque appelant choisit la direction pertinente pour SA géométrie (ex. à l'opposé d'un vecteur
 * dont ce point est l'origine, dans le sens d'un vecteur dont ce point est l'extrémité, à l'opposé
 * d'un second point voisin) — cette fonction reste volontairement agnostique de la provenance de
 * cette direction, comme `calculerPositionsEtiquettesSansChevauchement` reste agnostique de la
 * provenance des vecteurs qu'elle reçoit.
 */
export function positionEtiquettePoint(point: Point, direction: Composantes, viewBox: ViewBoxTransformation): Point {
  const longueur = Math.hypot(direction.x, direction.y);
  const [dirX, dirY] = longueur > 1e-9 ? [direction.x / longueur, direction.y / longueur] : [Math.SQRT1_2, Math.SQRT1_2];
  const largeurViewBox = viewBox.x[1] - viewBox.x[0];
  const hauteurViewBox = viewBox.y[1] - viewBox.y[0];
  const echelle = Math.min(largeurViewBox, hauteurViewBox);
  const decalage = echelle * FRACTION_DECALAGE_ETIQUETTE_POINT;
  return { x: point.x + dirX * decalage, y: point.y + dirY * decalage };
}
