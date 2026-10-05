/**
 * Croquis partagé (Ox ET Oy) utilisé par les 3 boutons "Aide" de l'étape "axe et sommet"
 * (point 1), "domaine et image" (point 2, + surlignage) et "tableau de signes" (point 4, +
 * surlignage + marques Ox) — prompt-4-modifications-analyse-fonction.md. Un seul schéma de base
 * paramétrable plutôt que trois croquis indépendants : `calculerSketchAxeSommet` construit la
 * géométrie commune (axes, position de S, ordonnée à l'origine toujours marquée), et
 * `calculerSurlignageImf`/`calculerMarquesOx` ajoutent les surcouches optionnelles à la demande de
 * chaque écran. Coordonnées pixel fixes, jamais à l'échelle numérique réelle (même convention que
 * ParabolaSketch/AllureSketch).
 */

export type PositionHorizontale = "gauche" | "droite" | "sur_oy";
export type PositionVerticale = "dessus" | "dessous" | "sur_ox";

export interface PointSketchAxeSommet {
  x: number;
  y: number;
}

export interface SketchAxeSommetGeom {
  largeur: number;
  hauteur: number;
  axeOxY: number;
  axeOyX: number;
  positionHorizontale: PositionHorizontale;
  positionVerticale: PositionVerticale;
  pointS: PointSketchAxeSommet;
  /** Toujours marqué sur Oy, quelle que soit la position de S. */
  pointC: PointSketchAxeSommet;
  valeurXS: number;
  valeurYS: number;
  valeurC: number;
}

const LARGEUR = 260;
const HAUTEUR = 220;
const AXE_OX_Y = 130;
const AXE_OY_X = 130;
const DECALAGE_H = 55;
/**
 * Décalage vertical partagé par S et C (prompt-indices-et-desync-courbe.md, point 2) — avant
 * cette unification, S utilisait 45 et C utilisait 30 : deux constantes indépendantes pour ce qui
 * représente la même notion ("distance à l'axe Ox selon le signe"), ce qui désynchronisait S et C
 * chaque fois qu'ils portaient la même valeur réelle (b=0 ⟹ x_S=0 ⟹ y_S=f(0)=c, propriété
 * mathématique) : les deux points auraient dû être strictement confondus mais atterrissaient à
 * deux pixels différents. Une seule constante pour les deux élimine la classe de bug entière,
 * plutôt que de resynchroniser les deux valeurs à la main.
 */
const DECALAGE_VERTICAL = 45;

/**
 * **BUG CORRIGÉ (2)** : à l'intérieur d'un même "seau" de signe (tous deux strictement positifs ou
 * tous deux strictement négatifs), `dy`/`dc` valaient auparavant EXACTEMENT `DECALAGE_VERTICAL`
 * tous les deux — deux valeurs réelles distinctes (ex. yS=2, c=6) produisaient donc des pixels
 * `pointS.y`/`pointC.y` IDENTIQUES, ce qui faisait croire à `calculerCoeffCourbe` que la courbe
 * était plate à cet endroit (voir son propre historique de correctif) OU, une fois ce premier bug
 * corrigé par un repli sur une magnitude par défaut, ne garantissait plus que la courbe passe
 * exactement par C dans ce cas précis (compromis alors accepté). Cette nuance résout les deux
 * problèmes à la fois, à la source : à l'intérieur d'un même seau de signe non nul, la valeur dont
 * la magnitude réelle est la plus grande reçoit un décalage LÉGÈREMENT plus grand que
 * `DECALAGE_VERTICAL`, l'autre légèrement plus petit — garantissant un écart pixel non nul entre S
 * et C dès que `yS ≠ c` réellement, tout en préservant le signe/seau (jamais de changement de côté
 * par rapport à Ox) et en laissant `calculerCoeffCourbe` calibrer la courbe pour passer exactement
 * par les deux points ainsi positionnés — plus jamais de repli nécessaire pour ce cas.
 */
const NUANCE_VERTICALE = 12;

function decalageVerticalAvecNuance(valeur: number, autre: number): number {
  if (valeur === 0) return 0;
  const direction = valeur > 0 ? -1 : 1;
  const base = direction * DECALAGE_VERTICAL;
  if (valeur === autre || autre === 0 || Math.sign(valeur) !== Math.sign(autre)) return base;
  // À l'intérieur d'un même seau (même signe non nul), la magnitude réelle la plus grande doit
  // recevoir le décalage le PLUS ÉLOIGNÉ de zéro (dans la même direction que `base`), pour que le
  // décalage reste une fonction strictement décroissante de la valeur réelle sur tout son domaine —
  // condition nécessaire pour que le signe supposé par calculerCoeffCourbe (dérivé de signeA seul)
  // corresponde bien au signe réel de (pointC.y - pointS.y).
  const plusEloigneDeZero = Math.abs(valeur) > Math.abs(autre);
  return base + direction * (plusEloigneDeZero ? NUANCE_VERTICALE : -NUANCE_VERTICALE);
}

/**
 * Croquis de base : axes Ox et Oy, sommet S positionné selon les signes de xS/yS, ordonnée à
 * l'origine (c) toujours marquée sur Oy (section 1 de la spec).
 */
export function calculerSketchAxeSommet(xS: number, yS: number, c: number): SketchAxeSommetGeom {
  const positionHorizontale: PositionHorizontale = xS < 0 ? "gauche" : xS > 0 ? "droite" : "sur_oy";
  const positionVerticale: PositionVerticale = yS < 0 ? "dessous" : yS > 0 ? "dessus" : "sur_ox";

  const dx = positionHorizontale === "gauche" ? -DECALAGE_H : positionHorizontale === "droite" ? DECALAGE_H : 0;
  const dy = decalageVerticalAvecNuance(yS, c);
  const dc = decalageVerticalAvecNuance(c, yS);

  return {
    largeur: LARGEUR,
    hauteur: HAUTEUR,
    axeOxY: AXE_OX_Y,
    axeOyX: AXE_OY_X,
    positionHorizontale,
    positionVerticale,
    pointS: { x: AXE_OY_X + dx, y: AXE_OX_Y + dy },
    pointC: { x: AXE_OY_X, y: AXE_OX_Y + dc },
    valeurXS: xS,
    valeurYS: yS,
    valeurC: c,
  };
}

export interface SegmentSurligne {
  x: number;
  y1: number;
  y2: number;
}

/**
 * Surlignage vert sur Oy (point 2 de la spec) : de la hauteur de S jusqu'à l'extrémité de l'axe,
 * vers le haut (petit y SVG) si a>0 (imf=[yS,+∞[), vers le bas (grand y SVG) si a<0 (imf=]-∞,yS]).
 */
export function calculerSurlignageImf(geom: SketchAxeSommetGeom, signeA: "+" | "-"): SegmentSurligne {
  const y2 = signeA === "+" ? 5 : geom.hauteur - 5;
  return { x: geom.axeOyX, y1: geom.pointS.y, y2 };
}

export interface MarqueOx {
  x: number;
  valeur: number;
  estSommet: boolean;
  /**
   * Indices bruts des racines fusionnées à cette position ("1", "2"...) quand une ou deux racines
   * coïncident exactement avec x_S — vide sinon, y compris pour une marque racine non fusionnée
   * (prompt-courbe-et-fusion-labels.md, point 2). Bruts et non préfixés ("1" pas "x_1") : le
   * composant de présentation compose le rendu "x" + indice en souscript SVG lui-même
   * (prompt-indices-et-desync-courbe.md, point 1) — cette donnée ne porte que l'information, pas
   * la présentation. Une racine ne peut coïncider avec x_S que si elle est double (x_S est
   * toujours le milieu des deux racines), mais la fusion reste générique sur le nombre de racines
   * coïncidentes (1 ou 2) plutôt que de supposer toujours 2.
   */
  labelsRacines: string[];
}

/** Nombre de points échantillonnés pour la courbe — dense pour un rendu lisse (même principe que
 * parabolaSketch.ts). */
const NB_POINTS_COURBE = 51;
const COEFF_COURBE_DEFAUT = 0.045;

/**
 * Coefficient de la parabole en repère pixel, `y(x) = pointS.y + coeff·(x-pointS.x)²` — **source
 * unique** de la forme de la courbe, réutilisée à la fois par `evaluerCourbeAxeSommet` (tracé) et
 * `calculerMarquesOx` (positionnement des racines) — voir prompt-indices-et-desync-courbe.md,
 * point 2 : avant cette unification, les racines étaient positionnées par un algorithme de tri +
 * espacement fixe totalement indépendant de la courbe, ce qui les désynchronisait systématiquement
 * du tracé (jamais exactement sur la courbe, sauf coïncidence). Le signe de `coeff` est déterminé
 * directement par `signeA` (jamais redérivé des positions pixel de S/C, qui ne sont que des
 * repères visuels) : a>0 ⟹ sommet visuellement en bas de l'image (grand y SVG), donc coeff<0 —
 * même convention que allureSketch.ts. La magnitude est calibrée pour que la courbe passe aussi
 * exactement par le point C (ordonnée à l'origine) — désormais garanti dans tous les cas non
 * dégénérés grâce à `decalageVerticalAvecNuance` (voir ci-dessus), qui assure `dyC≠0` dès que
 * `yS≠c` réellement (et `yS≠c` est lui-même toujours vrai dès que `x_S≠0`, propriété mathématique
 * d'une parabole non dégénérée — `f(0)=c=f(xS)=yS` n'est possible que si `xS=0`). Repli sur une
 * magnitude par défaut dans le seul cas réellement dégénéré restant : `x_S=0` (S et C confondus
 * horizontalement, `dxC=0` — division par zéro ; mathématiquement, cela implique aussi `yS=c`, donc
 * S et C sont alors le MÊME point pixel, la magnitude n'a alors plus aucune importance visuelle).
 * `dyC≠0` est désormais garanti par construction dès que `dxC≠0` pour tout appel dérivé de valeurs
 * réelles cohérentes ; cette branche de repli ne reste que pour rester robuste face à un appel
 * direct avec des valeurs incohérentes (ex. un test construit à la main).
 */
function calculerCoeffCourbe(geom: SketchAxeSommetGeom, signeA: "+" | "-"): number {
  const s = signeA === "+" ? -1 : 1;
  const dxC = geom.pointC.x - geom.pointS.x;
  const dyC = Math.abs(geom.pointC.y - geom.pointS.y);
  const magnitude = dxC !== 0 && dyC !== 0 ? dyC / (dxC * dxC) : COEFF_COURBE_DEFAUT;
  return s * magnitude;
}

/**
 * Valeur de la courbe en un point x du repère pixel (point 1 de la spec) : parabole sous forme
 * canonique centrée sur le sommet S — voir `calculerCoeffCourbe` pour la calibration.
 */
export function evaluerCourbeAxeSommet(geom: SketchAxeSommetGeom, signeA: "+" | "-", x: number): number {
  const coeff = calculerCoeffCourbe(geom, signeA);
  return geom.pointS.y + coeff * (x - geom.pointS.x) ** 2;
}

/** En dessous de ce seuil (en pixels), l'écart racines/x_S calculé via la courbe est traité comme
 * nul — racine double confondue avec x_S — plutôt que comme deux marques infinitésimalement
 * proches. Largement au-dessus du bruit flottant, largement en dessous de tout écart visuellement
 * distinguable. */
const EPSILON_PIXEL = 1e-6;

/**
 * Marques sur Ox (point 4 de la spec) : les racines et x_S, positionnées en résolvant directement
 * l'équation de la courbe (`calculerCoeffCourbe`, la même que celle utilisée pour le tracé) plutôt
 * que par un algorithme de tri/espacement indépendant — garantit par construction que chaque
 * marque tombe exactement sur la courbe affichée (prompt-indices-et-desync-courbe.md, point 2).
 * x_S est toujours au pixel exact de S (`geom.pointS.x`, sommet de la parabole). Les deux racines
 * sont les abscisses où la courbe croise Ox (hauteur `axeOxY`) — solution de
 * `pointS.y + coeff·(x-pointS.x)² = axeOxY`, donc **symétriques par construction** autour de
 * `pointS.x` (une parabole est toujours symétrique autour de son sommet). Si cet écart est nul
 * (racine double confondue avec x_S, `y_S=0`), les deux racines et x_S ne forment plus qu'une
 * seule marque : leurs labels sont fusionnés (une seule position sur l'axe, deux lignes de texte
 * — voir SketchAxeSommet.tsx) au lieu de deux marques distinctes proches l'une de l'autre. Sans
 * racine réelle (`racines` vide, catégorie irreductible), seul x_S est marqué.
 */
export function calculerMarquesOx(
  geom: SketchAxeSommetGeom,
  signeA: "+" | "-",
  racines: number[],
  xS: number,
): MarqueOx[] {
  if (racines.length === 0) {
    return [{ x: geom.pointS.x, valeur: xS, estSommet: true, labelsRacines: [] }];
  }

  const indices = racines.map((_, i) => String(i + 1));
  const coeff = calculerCoeffCourbe(geom, signeA);
  const carre = (geom.axeOxY - geom.pointS.y) / coeff;
  const demiEcart = Math.sqrt(Math.max(carre, 0));

  if (demiEcart < EPSILON_PIXEL) {
    return [{ x: geom.pointS.x, valeur: xS, estSommet: true, labelsRacines: indices }];
  }

  return [
    { x: geom.pointS.x - demiEcart, valeur: Math.min(...racines), estSommet: false, labelsRacines: [] },
    { x: geom.pointS.x, valeur: xS, estSommet: true, labelsRacines: [] },
    { x: geom.pointS.x + demiEcart, valeur: Math.max(...racines), estSommet: false, labelsRacines: [] },
  ];
}

/**
 * Tracé complet de la courbe (point 1 de la spec), réutilisant le même principe
 * d'échantillonnage dense que `calculerCroquisParabole` (parabolaSketch.ts, exercice "inéquations
 * rationnelles") pour une courbe lisse plutôt qu'une ligne brisée.
 */
export function calculerCourbeAxeSommet(geom: SketchAxeSommetGeom, signeA: "+" | "-"): PointSketchAxeSommet[] {
  const pas = geom.largeur / (NB_POINTS_COURBE - 1);
  return Array.from({ length: NB_POINTS_COURBE }, (_, i) => {
    const x = i * pas;
    return { x, y: evaluerCourbeAxeSommet(geom, signeA, x) };
  });
}

/** Décalage vertical (pixels SVG, positif = vers le bas) appliqué à l'étiquette texte "S" — pris
 * dans la zone toujours VIDE de la parabole, jamais du côté où le tracé passe, pour ne plus jamais
 * chevaucher la courbe (**bug corrigé**, l'étiquette était fixe à `pointS.y - 8`, c'est-à-dire
 * toujours au-dessus, alors que pour a>0 le sommet est le pixel MAXIMUM de la courbe — voir
 * `calculerCoeffCourbe` — et les deux branches montent des deux côtés strictement au-dessus de lui
 * : l'étiquette "au-dessus" tombait systématiquement en plein sur le tracé). Dérivé directement de
 * `signeA`, jamais redérivé indépendamment de la courbe elle-même : a>0 ⟹ sommet = maximum pixel,
 * la courbe occupe tout l'espace AU-DESSUS, la zone vide est EN DESSOUS (décalage positif) ; a<0 ⟹
 * sommet = minimum pixel, la courbe occupe l'espace EN DESSOUS, la zone vide est AU-DESSUS
 * (décalage négatif). */
const DECALAGE_LABEL_SOMMET = 18;

export function decalageLabelSommet(signeA: "+" | "-"): number {
  return signeA === "+" ? DECALAGE_LABEL_SOMMET : -DECALAGE_LABEL_SOMMET;
}
