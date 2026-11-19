import type { CumulComparaisonSeries, SerieComparaison } from "../core/comparaisonSeries.types";
import { pointsCourbeCumulee, type PointCourbeCumulee } from "./comparaisonSeriesGraph";

/**
 * Figure SVG autonome des deux courbes cumulées de gen38 (« Comparaison de deux séries ») — énoncé
 * papier (variante « graphique ») ET corrigé détaillé (points lus marqués, seuils n/4, n/2, 3n/4 en
 * pointillés). Sortie de `comparaisonSeries/exportEvaluation.ts` (qui importe `docx`) pour être
 * partagée avec `comparaisonSeries/corrigeDetaille.ts`, importé par l'appli. Géométrie : la MÊME
 * source que l'écran pour les courbes (`pointsCourbeCumulee`). Cadrage propre au papier : axe vertical
 * de 0 au cumul total (aucune graduation négative), grille passant par les seuils $n/4$, $n/2$, $3n/4$
 * (ou 25 %, 50 %, 75 %) et par les valeurs xᵢ (règle « tout graphique papier à LIRE »).
 */

export const COULEUR_SERIE_A = "#1971c2";
export const COULEUR_SERIE_B = "#f08c00";
const COULEUR_GRILLE_SVG = "#e3e8ee";
const COULEUR_GRILLE_FORTE_SVG = "#b8c2cd";
const COULEUR_AXE_SVG = "#495057";
const LARGEUR_SVG_COURBES = 360;
const HAUTEUR_SVG_COURBES = 250;
const MARGE_GAUCHE_SVG = 32;
const MARGE_BAS_SVG = 24;
const MARGE_HAUT_SVG = 26;
const MARGE_DROITE_SVG = 12;

function echapperHtml(valeur: string): string {
  return valeur.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Plus grand pas `g` dont chaque valeur de `valeurs` est un multiple (calcul en entiers, au
 * dix-millième près) — `0` si toutes les valeurs sont nulles. */
function pgcdDecimal(valeurs: number[]): number {
  const ECHELLE = 10000;
  const pgcd = (a: number, b: number): number => (b === 0 ? a : pgcd(b, a % b));
  const g = valeurs.map((v) => Math.round(Math.abs(v) * ECHELLE)).reduce((acc, v) => pgcd(acc, v), 0);
  return g / ECHELLE;
}

function estMultiple(v: number, pas: number): boolean {
  return Math.abs(v / pas - Math.round(v / pas)) < 1e-6;
}

/**
 * Grille VERTICALE (effectif ou fréquence cumulés) — commence à 0 (aucune graduation négative) et
 * passe par les seuils à lire ($n/4$, $n/2$, $3n/4$ de CHAQUE série, ou 25 %, 50 %, 75 %) :
 * pas de grille = le premier de `CANDIDATS` dont chaque seuil est un multiple (au plus 40 lignes ;
 * les effectifs cumulés entiers tombent aussi sur une ligne quand le pas divise 1). Nombres écrits
 * tous les `pasNombres` (multiple du pas de grille, lignes plus marquées).
 */
export function grilleVerticaleCourbesCumulees(serieA: SerieComparaison, serieB: SerieComparaison, cumul: CumulComparaisonSeries): { pas: number; pasNombres: number; haut: number } {
  if (cumul === "frequence") return { pas: 5, pasNombres: 25, haut: 105 };
  const yMax = Math.max(serieA.n, serieB.n);
  const seuils = [serieA.n, serieB.n].flatMap((n) => [n / 4, n / 2, (3 * n) / 4]);
  const CANDIDATS = [1, 0.5, 1.25, 2.5, 5, 0.25];
  const pas = CANDIDATS.find((g) => seuils.every((s) => estMultiple(s, g)) && yMax / g <= 40) ?? pgcdDecimal(seuils);
  const pasNombres = [yMax <= 12 ? 2.5 : 5, 5, 10, 2.5].find((l) => estMultiple(l, pas)) ?? pas;
  return { pas, pasNombres, haut: Math.ceil((yMax * 1.06) / pas) * pas };
}

/**
 * Grille HORIZONTALE (valeurs xᵢ) — pas = plus grand écart commun des valeurs des deux séries, pour
 * que chaque point des courbes tombe sur une ligne ; nombres écrits tous les `pasNombres` (≈ 4 à 8
 * nombres). Une ligne de marge de chaque côté.
 */
export function grilleHorizontaleCourbesCumulees(serieA: SerieComparaison, serieB: SerieComparaison): { pas: number; pasNombres: number; gauche: number; droite: number } {
  const xs = [...serieA.lignes, ...serieB.lignes].map((l) => l.valeur);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  let pas = pgcdDecimal(xs.map((x) => x - xMin)) || 1;
  // Pas trop fin (plus de 40 lignes) : multiple entier du pas, en gardant les points sur les lignes
  // autant que possible (ne se produit pas avec les échelles du générateur : 16 unités au plus).
  while ((xMax - xMin) / pas > 40) pas *= 2;
  const gauche = Math.floor(xMin / pas - 1 + 1e-9) * pas;
  const droite = Math.ceil(xMax / pas + 1 - 1e-9) * pas;
  const k = [1, 2, 4, 5, 10, 20, 25, 50].find((m) => (droite - gauche) / (m * pas) <= 8) ?? 100;
  return { pas, pasNombres: k * pas, gauche, droite };
}

/** Graduation : virgule décimale, « − » typographique. */
function formatNombreSvg(v: number): string {
  const t = Math.abs(v - Math.round(v)) < 1e-9 ? String(Math.round(v)) : v.toFixed(2).replace(/0+$/, "");
  return t.replace(".", ",").replace(/^-/, "−");
}

/** Un point marqué/étiqueté sur UNE courbe (corrigé). */
export interface MarqueurCourbeCumulee {
  serie: "A" | "B";
  valeur: number;
  label: string;
}

/** Seuil horizontal en pointillés (n/4, n/2, 3n/4 ou 25 %, 50 %, 75 %), de la couleur de sa série
 * (`serie` absent : commun aux deux courbes). */
export interface SeuilCourbeCumulee {
  y: number;
  serie?: "A" | "B";
}

function traceCourbeSvg(points: PointCourbeCumulee[], couleur: string, sx: (x: number) => number, sy: (y: number) => number): string {
  const chemin = points.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
  const sommets = points.map((p) => `<circle cx="${sx(p.x).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="2.4" fill="${couleur}"/>`).join("");
  return `<path d="${chemin}" fill="none" stroke="${couleur}" stroke-width="2" stroke-linecap="round"/>${sommets}`;
}

/** Le `<svg>` autonome des 2 courbes cumulées (ogives), avec marqueurs et seuils éventuels. */
export function construireSvgCourbesCumulees(
  serieA: SerieComparaison,
  serieB: SerieComparaison,
  cumul: CumulComparaisonSeries,
  unite: string,
  marqueurs: MarqueurCourbeCumulee[] = [],
  seuils: SeuilCourbeCumulee[] = [],
): string {
  const pointsA = pointsCourbeCumulee(serieA, cumul);
  const pointsB = pointsCourbeCumulee(serieB, cumul);
  // Axe vertical : de 0 (jamais de graduation négative) au-dessus du cumul total ; grille passant par
  // les seuils à lire et par les valeurs xᵢ (`grilleVerticale…`/`grilleHorizontale…`).
  const gy = grilleVerticaleCourbesCumulees(serieA, serieB, cumul);
  const gx = grilleHorizontaleCourbesCumulees(serieA, serieB);
  const xs = [...serieA.lignes, ...serieB.lignes].map((l) => l.valeur);
  const xMinDonnees = Math.min(...xs);
  const [xMin, xMax] = [xMinDonnees - gx.pas, Math.max(...xs) + gx.pas];
  const [yMin, yMax] = [0, gy.haut];

  const zoneX = LARGEUR_SVG_COURBES - MARGE_GAUCHE_SVG - MARGE_DROITE_SVG;
  const zoneY = HAUTEUR_SVG_COURBES - MARGE_HAUT_SVG - MARGE_BAS_SVG;
  const sx = (x: number) => MARGE_GAUCHE_SVG + ((x - xMin) / (xMax - xMin)) * zoneX;
  const sy = (y: number) => MARGE_HAUT_SVG + ((yMax - y) / (yMax - yMin)) * zoneY;

  // Lignes verticales ancrées sur les valeurs (xMin + k·pas) ; nombres aux multiples de `pasNombres`
  // (à défaut — origine décalée —, une ligne sur `pasNombres / pas` à partir de la première valeur).
  const lignesX: number[] = [];
  for (let k = 0; xMin + k * gx.pas <= xMax + 1e-9; k++) lignesX.push(Number((xMin + k * gx.pas).toFixed(6)));
  const auxMultiples = lignesX.filter((v) => estMultiple(v, gx.pasNombres));
  const pasLignesNombres = Math.round(gx.pasNombres / gx.pas);
  const nombresX = auxMultiples.length >= 2 ? auxMultiples : lignesX.filter((v) => Math.round((v - xMinDonnees) / gx.pas) % pasLignesNombres === 0);
  const grilleX: string[] = [];
  const labelsX: string[] = [];
  for (const v of lignesX) {
    const px = sx(v);
    const ecrit = nombresX.includes(v);
    grilleX.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_HAUT_SVG}" x2="${px.toFixed(1)}" y2="${HAUTEUR_SVG_COURBES - MARGE_BAS_SVG}" stroke="${ecrit ? COULEUR_GRILLE_FORTE_SVG : COULEUR_GRILLE_SVG}" stroke-width="${ecrit ? 1 : 0.6}"/>`);
    if (ecrit) labelsX.push(`<text x="${px.toFixed(1)}" y="${(HAUTEUR_SVG_COURBES - MARGE_BAS_SVG + 12).toFixed(1)}" font-size="8" text-anchor="middle" fill="${COULEUR_AXE_SVG}">${formatNombreSvg(v)}</text>`);
  }
  const grilleY: string[] = [];
  const labelsY: string[] = [];
  for (let k = 0; k * gy.pas <= yMax + 1e-9; k++) {
    const v = Number((k * gy.pas).toFixed(6));
    const py = sy(v);
    const ecrit = estMultiple(v, gy.pasNombres);
    grilleY.push(`<line x1="${MARGE_GAUCHE_SVG}" y1="${py.toFixed(1)}" x2="${LARGEUR_SVG_COURBES - MARGE_DROITE_SVG}" y2="${py.toFixed(1)}" stroke="${ecrit ? COULEUR_GRILLE_FORTE_SVG : COULEUR_GRILLE_SVG}" stroke-width="${ecrit ? 1 : 0.6}"/>`);
    if (ecrit) labelsY.push(`<text x="${(MARGE_GAUCHE_SVG - 4).toFixed(1)}" y="${(py + 3).toFixed(1)}" font-size="8" text-anchor="end" fill="${COULEUR_AXE_SVG}">${formatNombreSvg(v)}</text>`);
  }

  const cadre = `<rect x="${MARGE_GAUCHE_SVG}" y="${MARGE_HAUT_SVG}" width="${zoneX}" height="${zoneY}" fill="none" stroke="${COULEUR_AXE_SVG}" stroke-width="1.2"/>`;
  const traceA = traceCourbeSvg(pointsA, COULEUR_SERIE_A, sx, sy);
  const traceB = traceCourbeSvg(pointsB, COULEUR_SERIE_B, sx, sy);

  // Nombre de chaque seuil au bord droit ; deux seuils trop proches (« 6,25 » et « 7,5 ») : le
  // second passe au bord gauche du cadre, pour ne jamais se chevaucher.
  const placesDroite: number[] = [];
  const seuilsHtml = [...seuils]
    .sort((a, b) => a.y - b.y)
    .map((s) => {
      const couleur = s.serie === "A" ? COULEUR_SERIE_A : s.serie === "B" ? COULEUR_SERIE_B : COULEUR_AXE_SVG;
      const py = sy(s.y);
      const aDroite = placesDroite.every((q) => Math.abs(q - py) >= 9);
      if (aDroite) placesDroite.push(py);
      const xTexte = aDroite ? LARGEUR_SVG_COURBES - MARGE_DROITE_SVG - 2 : MARGE_GAUCHE_SVG + 2;
      return (
        `<line x1="${MARGE_GAUCHE_SVG}" y1="${py.toFixed(1)}" x2="${LARGEUR_SVG_COURBES - MARGE_DROITE_SVG}" y2="${py.toFixed(1)}" stroke="${couleur}" stroke-width="1" stroke-dasharray="4 3"/>` +
        `<text x="${xTexte.toFixed(1)}" y="${(py - 2).toFixed(1)}" font-size="7.5" text-anchor="${aDroite ? "end" : "start"}" fill="${couleur}" stroke="#ffffff" stroke-width="2.5" paint-order="stroke">${formatNombreSvg(s.y)}${cumul === "frequence" ? " %" : ""}</text>`
      );
    })
    .join("");

  const marqueursHtml = marqueurs
    .map((marqueur) => {
      const serie = marqueur.serie === "A" ? serieA : serieB;
      const couleur = marqueur.serie === "A" ? COULEUR_SERIE_A : COULEUR_SERIE_B;
      const ligne = serie.lignes.find((l) => l.valeur === marqueur.valeur);
      if (!ligne) return "";
      const y = cumul === "effectif" ? ligne.effectifCumule : ligne.frequenceCumulee;
      const px = sx(marqueur.valeur);
      const py = sy(y);
      return (
        `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${px.toFixed(1)}" y2="${(HAUTEUR_SVG_COURBES - MARGE_BAS_SVG).toFixed(1)}" stroke="${couleur}" stroke-width="1" stroke-dasharray="2 2"/>` +
        `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4.5" fill="#ffffff" stroke="${couleur}" stroke-width="2"/>` +
        `<text x="${px.toFixed(1)}" y="${(py - 8).toFixed(1)}" font-size="8" text-anchor="middle" font-weight="bold" fill="${couleur}">${echapperHtml(marqueur.label)}</text>`
      );
    })
    .join("");

  const legende =
    `<text x="${MARGE_GAUCHE_SVG}" y="12" font-size="9" font-weight="bold" fill="${COULEUR_SERIE_A}">Série A</text>` +
    `<text x="${MARGE_GAUCHE_SVG + 58}" y="12" font-size="9" font-weight="bold" fill="${COULEUR_SERIE_B}">Série B</text>`;
  const libelleY = cumul === "effectif" ? "effectif cumulé" : "fréquence cumulée (%)";
  const legendeAxes = `<text x="${MARGE_GAUCHE_SVG}" y="${HAUTEUR_SVG_COURBES - 4}" font-size="7.5" fill="${COULEUR_AXE_SVG}">Horizontal : valeur (${echapperHtml(unite)}) — Vertical : ${echapperHtml(libelleY)}</text>`;

  return `<svg class="graphe-comparaison-series" width="${LARGEUR_SVG_COURBES}" height="${HAUTEUR_SVG_COURBES}" viewBox="0 0 ${LARGEUR_SVG_COURBES} ${HAUTEUR_SVG_COURBES}" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="${LARGEUR_SVG_COURBES}" height="${HAUTEUR_SVG_COURBES}" fill="#ffffff"/>
${grilleX.join("")}${grilleY.join("")}
${cadre}
${seuilsHtml}
${traceA}${traceB}
${labelsX.join("")}${labelsY.join("")}
${legende}
${marqueursHtml}
${legendeAxes}
</svg>`;
}
