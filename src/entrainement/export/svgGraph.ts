/**
 * Moteur de tracé `<svg>` STATIQUE générique — axes, grille "nombre rond", courbe échantillonnée
 * d'une fonction réelle quelconque (`x: number => y: number | null`, `null` = hors domaine). Conçu
 * pour la copie imprimée d'une évaluation (`export/assemblerEvaluationHtml.ts`,
 * `SectionExercice.enteteHtml`/`BlocCorrection` de type `"html"`), JAMAIS pour l'écran interactif
 * (qui reste Mafs) : un second moteur de tracé à la main, plutôt qu'une extraction du SVG produit
 * par Mafs (React monté hors-écran, avec son incertitude de timing `useLayoutEffect`) — dès qu'une
 * fonction à tracer est déjà un pur calcul JS (domaine/image connus à l'avance), pas besoin de
 * monter un arbre React hors-écran pour obtenir la même chose.
 *
 * Générique par construction : ne connaît RIEN d'un générateur précis (aucune dépendance à
 * `core6e`/`generateurs6e`) — `export/svgGraphCyclo.ts` est le premier appelant (`6gen5`), mais tout
 * futur générateur avec une question "lecture de graphique" peut réutiliser directement
 * `construireSvgFonction` sans dupliquer le moteur de tracé.
 */

export interface ViewBoxSvg {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

const LARGEUR_DEFAUT = 220;
const HAUTEUR_DEFAUT = 220;
const MARGE = 10;
const COULEUR_COURBE_DEFAUT = "#1971c2";
const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const CIBLE_DIVISIONS = 5;
const NB_POINTS_ECHANTILLON = 240;

/** Pas "nombre rond" (1/2/5 × 10^n) visant `CIBLE_DIVISIONS` graduations sur l'étendue donnée —
 * même principe que `GrilleAdaptative` (Mafs) côté écran, réimplémenté ici sans dépendance React. */
function pasNombreRond(etendue: number, divisions: number = CIBLE_DIVISIONS): number {
  const brut = etendue / divisions;
  const magnitude = 10 ** Math.floor(Math.log10(brut));
  const normalise = brut / magnitude;
  const nice = normalise < 1.5 ? 1 : normalise < 3 ? 2 : normalise < 7 ? 5 : 10;
  return nice * magnitude;
}

export function formatNombreGraphique(v: number): string {
  // Virgule décimale (convention française du site) — seul changement par rapport à l'arrondi.
  return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(2).replace(".", ",");
}

function echapperAttribut(texte: string): string {
  return texte.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

/**
 * Échantillonne `evaluer` sur `[xMin;xMax]` et regroupe les points valides en segments contigus —
 * une coupure (retour `null`/`NaN`/`±Infinity`) = une discontinuité RÉELLE de la fonction (ex. une
 * asymptote verticale), exactement le même signal que `NaN` chez `Plot.OfX` côté Mafs.
 */
function echantillonnerSegments(evaluer: (x: number) => number | null, xMin: number, xMax: number): number[][] {
  const segments: number[][] = [];
  let segmentCourant: number[] = [];
  for (let i = 0; i <= NB_POINTS_ECHANTILLON; i++) {
    const x = xMin + ((xMax - xMin) * i) / NB_POINTS_ECHANTILLON;
    const y = evaluer(x);
    if (y === null || !Number.isFinite(y)) {
      if (segmentCourant.length > 0) segments.push(segmentCourant);
      segmentCourant = [];
      continue;
    }
    segmentCourant.push(x, y);
  }
  if (segmentCourant.length > 0) segments.push(segmentCourant);
  return segments;
}

/** Point marqué sur le graphe (ex. sommet, point "unitaire") — `forme:"croix"` pour un ×, sinon un
 * disque plein. Rendu APRÈS la courbe/grille, AVANT le cadre/coche (toujours au-dessus du tracé,
 * jamais caché par la bordure du corrigé). */
/** Quadrillage IMPOSÉ (au lieu du pas « nombre rond » automatique) : lignes tous les `pasX`/`pasY`,
 * graduations écrites tous les `etiquetteX`/`etiquetteY` (multiples entiers du pas). Sert aux
 * graphiques papier qui doivent faire tomber des points précis sur les intersections
 * (`cadrageLisible.ts`). Lignes des valeurs entières plus marquées quand le pas est fractionnaire. */
export interface GrilleSvg {
  pasX: number;
  pasY: number;
  etiquetteX: number;
  etiquetteY: number;
}

export interface PointMarqueSvg {
  x: number;
  y: number;
  /** À côté du point, ex. "(2 ; -3)" — omis si absent. */
  label?: string;
  couleur?: string;
  forme?: "point" | "croix";
  /** Position du `label` par rapport au point — "dessous" par défaut. Deux points proches (ex.
   * sommet + point "unitaire" d'une transformation graphique) DOIVENT utiliser des positions
   * différentes, sous peine de chevauchement illisible (bug réel trouvé par capture d'écran,
   * `generateurs/transformationsGraphiques/exportEvaluation.ts`). */
  labelPosition?: "dessus" | "dessous";
}

export interface OptionsSvgFonction {
  /** Étiquette en haut à gauche (ex. lettre d'un candidat QCM) — omise si absente. */
  lettre?: string;
  /** Liseré vert + coche — réservé au corrigé (jamais l'énoncé, qui ne doit pas trahir la réponse). */
  estCorrect?: boolean;
  largeur?: number;
  hauteur?: number;
  couleurCourbe?: string;
  /** Classe CSS racine du `<svg>` — `"graphe-cyclo"` par défaut (styles déjà écrits côté
   * `assemblerEvaluationHtml.ts`) ; à changer seulement si un futur appelant a besoin d'un style
   * distinct. */
  classe?: string;
  /** Points marqués (sommet, point-croix...) — voir `PointMarqueSvg`. `[]`/absent = aucun. */
  points?: PointMarqueSvg[];
  /** Courbes tracées SOUS la courbe principale (ex. fonction de référence en pointillés gris dans
   * un corrigé de transformation). */
  courbesSecondaires?: { evaluer: (x: number) => number | null; couleur?: string; pointilles?: boolean }[];
  /** Légende en haut à gauche, une ligne par courbe (trait d'échantillon + texte). */
  legende?: { texte: string; couleur: string; pointilles?: boolean }[];
  /** Nombre de graduations visé sur chaque axe (défaut 5) — plus fin pour une LECTURE précise
   * (5gen5 : minimum de f + g, seuil de rentabilité). */
  divisionsX?: number;
  divisionsY?: number;
  /** Quadrillage imposé (voir `GrilleSvg`). */
  grille?: GrilleSvg;
  /** Droites verticales x = constante (asymptote de 1/x…), en pointillés par défaut. */
  verticales?: { x: number; couleur?: string; pointilles?: boolean }[];
}

const COULEUR_GRILLE_ENTIERE = "#aeb8c4";
/** Halo blanc sous un texte de graduation (lisible même posé sur une ligne de la grille). */
const HALO_TEXTE = 'stroke="#ffffff" stroke-width="2.5" paint-order="stroke"';

/** Multiples de `pas` dans [min ; max], calculés par indice entier (pas de dérive flottante). */
function multiplesDans(min: number, max: number, pas: number): number[] {
  const valeurs: number[] = [];
  for (let i = Math.ceil(min / pas - 1e-9); i <= Math.floor(max / pas + 1e-9); i++) valeurs.push(i * pas);
  return valeurs;
}

function estMultiple(v: number, pas: number): boolean {
  return Math.abs(v / pas - Math.round(v / pas)) < 1e-6;
}

/** Construit le `<svg>` autonome (axes, grille, courbe échantillonnée) d'UNE fonction réelle. */
export function construireSvgFonction(evaluer: (x: number) => number | null, viewBox: ViewBoxSvg, options: OptionsSvgFonction = {}): string {
  const { xMin, xMax, yMin, yMax } = viewBox;
  const largeur = options.largeur ?? LARGEUR_DEFAUT;
  const hauteur = options.hauteur ?? HAUTEUR_DEFAUT;
  const couleurCourbe = options.couleurCourbe ?? COULEUR_COURBE_DEFAUT;
  const classe = options.classe ?? "graphe-cyclo";
  const zoneX = largeur - 2 * MARGE;
  const zoneY = hauteur - 2 * MARGE;
  const sx = (x: number) => MARGE + ((x - xMin) / (xMax - xMin)) * zoneX;
  const sy = (y: number) => MARGE + ((yMax - y) / (yMax - yMin)) * zoneY;

  const grille = options.grille;
  const pasX = grille?.pasX ?? pasNombreRond(xMax - xMin, options.divisionsX);
  const pasY = grille?.pasY ?? pasNombreRond(yMax - yMin, options.divisionsY);
  const etiquetteX = grille?.etiquetteX ?? pasX;
  const etiquetteY = grille?.etiquetteY ?? pasY;
  // Graduations sur l'axe quand il est visible, sinon le long du bord du cadre (axe hors fenêtre).
  const yEtiquettesX = yMin <= 0 && 0 <= yMax ? Math.min(sy(0) + 11, hauteur - 3) : hauteur - MARGE - 3;
  // Axe des y visible et assez loin du bord gauche : graduations à sa gauche ; trop près du bord
  // (elles seraient coupées) : à sa droite ; axe hors fenêtre : le long du bord gauche.
  const axeYVisible = xMin <= 0 && 0 <= xMax;
  const aGaucheDeLAxe = axeYVisible && sx(0) >= MARGE + 22;
  const xEtiquettesY = !axeYVisible ? MARGE + 3 : aGaucheDeLAxe ? sx(0) - 4 : sx(0) + 4;
  const ancreY = aGaucheDeLAxe ? "end" : "start";

  const lignesGrilleX: string[] = [];
  const labelsX: string[] = [];
  for (const v of multiplesDans(xMin, xMax, pasX)) {
    const px = sx(v);
    // Lignes marquées : valeurs entières d'une grille fine, ou valeurs graduées d'une grille d'une unité.
    const forte = grille && (pasX < 1 ? estMultiple(v, 1) : etiquetteX > pasX && estMultiple(v, etiquetteX));
    lignesGrilleX.push(`<line x1="${px.toFixed(1)}" y1="${MARGE}" x2="${px.toFixed(1)}" y2="${hauteur - MARGE}" stroke="${forte ? COULEUR_GRILLE_ENTIERE : COULEUR_GRILLE}" stroke-width="1"/>`);
    // Coin commun avec la colonne des graduations de y (posée près du bord gauche) : on n'écrit pas.
    const conflitCoin = (!axeYVisible || !aGaucheDeLAxe) && Math.abs(px - xEtiquettesY) < 12;
    if (Math.abs(v) > 1e-9 && estMultiple(v, etiquetteX) && !conflitCoin) labelsX.push(`<text x="${px.toFixed(1)}" y="${yEtiquettesX.toFixed(1)}" font-size="8" text-anchor="middle" fill="${COULEUR_AXE}" ${HALO_TEXTE}>${formatNombreGraphique(v).replace("-", "−")}</text>`);
  }
  const lignesGrilleY: string[] = [];
  const labelsY: string[] = [];
  for (const v of multiplesDans(yMin, yMax, pasY)) {
    const py = sy(v);
    const forte = grille && (pasY < 1 ? estMultiple(v, 1) : etiquetteY > pasY && estMultiple(v, etiquetteY));
    lignesGrilleY.push(`<line x1="${MARGE}" y1="${py.toFixed(1)}" x2="${largeur - MARGE}" y2="${py.toFixed(1)}" stroke="${forte ? COULEUR_GRILLE_ENTIERE : COULEUR_GRILLE}" stroke-width="1"/>`);
    const conflitRangee = !(yMin <= 0 && 0 <= yMax) && Math.abs(py + 3 - yEtiquettesX) < 9;
    if (Math.abs(v) > 1e-9 && estMultiple(v, etiquetteY) && !conflitRangee) labelsY.push(`<text x="${xEtiquettesY.toFixed(1)}" y="${(py + 3).toFixed(1)}" font-size="8" text-anchor="${ancreY}" fill="${COULEUR_AXE}" ${HALO_TEXTE}>${formatNombreGraphique(v).replace("-", "−")}</text>`);
  }
  const verticales = (options.verticales ?? [])
    .filter((d) => d.x >= xMin && d.x <= xMax)
    .map((d) => `<line x1="${sx(d.x).toFixed(1)}" y1="${MARGE}" x2="${sx(d.x).toFixed(1)}" y2="${hauteur - MARGE}" stroke="${d.couleur ?? "#8a8f98"}" stroke-width="1.4"${d.pointilles ?? true ? ' stroke-dasharray="5 4"' : ""}/>`)
    .join("");

  const axeX = `<line x1="${MARGE}" y1="${sy(0).toFixed(1)}" x2="${largeur - MARGE}" y2="${sy(0).toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;
  const axeY = `<line x1="${sx(0).toFixed(1)}" y1="${MARGE}" x2="${sx(0).toFixed(1)}" y2="${hauteur - MARGE}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;

  const tracer = (f: (x: number) => number | null, couleur: string, epaisseur: number, pointilles: boolean) =>
    echantillonnerSegments(f, xMin, xMax)
      .filter((seg) => seg.length >= 4)
      .map((seg) => {
        let d = `M ${sx(seg[0]).toFixed(1)},${sy(seg[1]).toFixed(1)}`;
        for (let i = 2; i < seg.length; i += 2) d += ` L ${sx(seg[i]).toFixed(1)},${sy(seg[i + 1]).toFixed(1)}`;
        return `<path d="${d}" fill="none" stroke="${couleur}" stroke-width="${epaisseur}" stroke-linecap="round"${pointilles ? ' stroke-dasharray="6 4"' : ""}/>`;
      })
      .join("");
  // Une courbe secondaire peut sortir largement du cadre (ex. référence translatée hors de la fenêtre) :
  // on la découpe aux bornes visibles, comme la principale (valeurs hors [yMin ; yMax] = trou).
  const dansCadre = (f: (x: number) => number | null) => (x: number) => {
    const y = f(x);
    return y === null || y < yMin - (yMax - yMin) || y > yMax + (yMax - yMin) ? null : y;
  };
  const cheminsSecondaires = (options.courbesSecondaires ?? []).map((c) => tracer(dansCadre(c.evaluer), c.couleur ?? "#8a8f98", 1.6, c.pointilles ?? true)).join("");
  const chemins = cheminsSecondaires + tracer(evaluer, couleurCourbe, 2.2, false);
  const legende = (options.legende ?? [])
    .map((l, i) => {
      const y = 14 + i * 13;
      return `<rect x="${MARGE + 2}" y="${y - 9}" width="${(l.texte.length * 4.6 + 28).toFixed(0)}" height="12" fill="#ffffff" opacity="0.85"/><line x1="${MARGE + 4}" y1="${y - 3}" x2="${MARGE + 20}" y2="${y - 3}" stroke="${l.couleur}" stroke-width="2"${l.pointilles ? ' stroke-dasharray="4 3"' : ""}/><text x="${MARGE + 24}" y="${y}" font-size="9" fill="${l.couleur}" font-family="Archivo, Arial, Helvetica, sans-serif">${echapperAttribut(l.texte)}</text>`;
    })
    .join("");

  const lettreHtml = options.lettre ? `<text x="6" y="16" font-size="12" font-weight="bold" fill="${COULEUR_AXE}">${echapperAttribut(options.lettre)}</text>` : "";
  const cadre = options.estCorrect
    ? `<rect x="1" y="1" width="${largeur - 2}" height="${hauteur - 2}" fill="none" stroke="#2f9e44" stroke-width="2.5"/>`
    : `<rect x="0.5" y="0.5" width="${largeur - 1}" height="${hauteur - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`;
  const coche = options.estCorrect ? `<text x="${largeur - 8}" y="16" font-size="13" text-anchor="end" fill="#2f9e44">✓</text>` : "";

  const points = (options.points ?? [])
    .map((pt) => {
      const px = sx(pt.x);
      const py = sy(pt.y);
      const couleur = pt.couleur ?? couleurCourbe;
      const marqueur =
        pt.forme === "croix"
          ? `<text x="${px.toFixed(1)}" y="${(py + 4).toFixed(1)}" font-size="13" font-weight="bold" text-anchor="middle" fill="${couleur}">×</text>`
          : `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="${couleur}"/>`;
      const yEtiquette = pt.labelPosition === "dessus" ? py - 8 : py + 16;
      const etiquette = pt.label
        ? `<text x="${px.toFixed(1)}" y="${yEtiquette.toFixed(1)}" font-size="8" text-anchor="middle" fill="${couleur}">${echapperAttribut(pt.label)}</text>`
        : "";
      return `${marqueur}${etiquette}`;
    })
    .join("");

  return `<svg class="${classe}" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="${largeur}" height="${hauteur}" fill="#ffffff"/>
${lignesGrilleX.join("")}${lignesGrilleY.join("")}
${axeX}${axeY}
${verticales}${chemins}
${labelsX.join("")}${labelsY.join("")}
${points}
${legende}${lettreHtml}
${cadre}${coche}
</svg>`;
}
