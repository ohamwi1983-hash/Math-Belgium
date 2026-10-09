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
function pasNombreRond(etendue: number): number {
  const brut = etendue / CIBLE_DIVISIONS;
  const magnitude = 10 ** Math.floor(Math.log10(brut));
  const normalise = brut / magnitude;
  const nice = normalise < 1.5 ? 1 : normalise < 3 ? 2 : normalise < 7 ? 5 : 10;
  return nice * magnitude;
}

export function formatNombreGraphique(v: number): string {
  return Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(2);
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

  const pasX = pasNombreRond(xMax - xMin);
  const pasY = pasNombreRond(yMax - yMin);

  const lignesGrilleX: string[] = [];
  const labelsX: string[] = [];
  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = sx(v);
    lignesGrilleX.push(`<line x1="${px.toFixed(1)}" y1="${MARGE}" x2="${px.toFixed(1)}" y2="${hauteur - MARGE}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) labelsX.push(`<text x="${px.toFixed(1)}" y="${(sy(0) + 11).toFixed(1)}" font-size="8" text-anchor="middle" fill="${COULEUR_AXE}">${formatNombreGraphique(v)}</text>`);
  }
  const lignesGrilleY: string[] = [];
  const labelsY: string[] = [];
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = sy(v);
    lignesGrilleY.push(`<line x1="${MARGE}" y1="${py.toFixed(1)}" x2="${largeur - MARGE}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) labelsY.push(`<text x="${(sx(0) - 4).toFixed(1)}" y="${(py + 3).toFixed(1)}" font-size="8" text-anchor="end" fill="${COULEUR_AXE}">${formatNombreGraphique(v)}</text>`);
  }

  const axeX = `<line x1="${MARGE}" y1="${sy(0).toFixed(1)}" x2="${largeur - MARGE}" y2="${sy(0).toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;
  const axeY = `<line x1="${sx(0).toFixed(1)}" y1="${MARGE}" x2="${sx(0).toFixed(1)}" y2="${hauteur - MARGE}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;

  const segments = echantillonnerSegments(evaluer, xMin, xMax);
  const chemins = segments
    .filter((seg) => seg.length >= 4)
    .map((seg) => {
      let d = `M ${sx(seg[0]).toFixed(1)},${sy(seg[1]).toFixed(1)}`;
      for (let i = 2; i < seg.length; i += 2) d += ` L ${sx(seg[i]).toFixed(1)},${sy(seg[i + 1]).toFixed(1)}`;
      return `<path d="${d}" fill="none" stroke="${couleurCourbe}" stroke-width="2.2" stroke-linecap="round"/>`;
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
${chemins}
${labelsX.join("")}${labelsY.join("")}
${points}
${lettreHtml}
${cadre}${coche}
</svg>`;
}
