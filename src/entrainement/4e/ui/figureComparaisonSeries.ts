import type { CumulComparaisonSeries, SerieComparaison } from "../core/comparaisonSeries.types";
import { calculerViewBoxComparaisonSeries, pointsCourbeCumulee, type PointCourbeCumulee } from "./comparaisonSeriesGraph";

/**
 * Figure SVG autonome des deux courbes cumulées de gen38 (« Comparaison de deux séries ») — énoncé
 * papier (variante « graphique ») ET corrigé détaillé (points lus marqués, seuils n/4, n/2, 3n/4 en
 * pointillés). Sortie de `comparaisonSeries/exportEvaluation.ts` (qui importe `docx`) pour être
 * partagée avec `comparaisonSeries/corrigeDetaille.ts`, importé par l'appli. Géométrie : la MÊME
 * source que l'écran (`pointsCourbeCumulee` / `calculerViewBoxComparaisonSeries`).
 */

export const COULEUR_SERIE_A = "#1971c2";
export const COULEUR_SERIE_B = "#f08c00";
const COULEUR_GRILLE_SVG = "#d8dee6";
const COULEUR_AXE_SVG = "#495057";
const LARGEUR_SVG_COURBES = 360;
const HAUTEUR_SVG_COURBES = 250;
const MARGE_GAUCHE_SVG = 32;
const MARGE_BAS_SVG = 24;
const MARGE_HAUT_SVG = 26;
const MARGE_DROITE_SVG = 12;
const CIBLE_DIVISIONS_SVG = 5;

function echapperHtml(valeur: string): string {
  return valeur.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Pas « nombre rond » (1/2/5 × 10^n). */
function pasNombreRondSvg(etendue: number): number {
  const brut = etendue / CIBLE_DIVISIONS_SVG;
  const magnitude = 10 ** Math.floor(Math.log10(brut));
  const normalise = brut / magnitude;
  const nice = normalise < 1.5 ? 1 : normalise < 3 ? 2 : normalise < 7 ? 5 : 10;
  return nice * magnitude;
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
  const viewBox = calculerViewBoxComparaisonSeries(pointsA, pointsB);
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;

  const zoneX = LARGEUR_SVG_COURBES - MARGE_GAUCHE_SVG - MARGE_DROITE_SVG;
  const zoneY = HAUTEUR_SVG_COURBES - MARGE_HAUT_SVG - MARGE_BAS_SVG;
  const sx = (x: number) => MARGE_GAUCHE_SVG + ((x - xMin) / (xMax - xMin)) * zoneX;
  const sy = (y: number) => MARGE_HAUT_SVG + ((yMax - y) / (yMax - yMin)) * zoneY;

  const pasX = pasNombreRondSvg(xMax - xMin);
  const pasY = pasNombreRondSvg(yMax - yMin);

  const grilleX: string[] = [];
  const labelsX: string[] = [];
  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = sx(v);
    grilleX.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_HAUT_SVG}" x2="${px.toFixed(1)}" y2="${HAUTEUR_SVG_COURBES - MARGE_BAS_SVG}" stroke="${COULEUR_GRILLE_SVG}" stroke-width="1"/>`);
    labelsX.push(`<text x="${px.toFixed(1)}" y="${(HAUTEUR_SVG_COURBES - MARGE_BAS_SVG + 12).toFixed(1)}" font-size="8" text-anchor="middle" fill="${COULEUR_AXE_SVG}">${formatNombreSvg(v)}</text>`);
  }
  const grilleY: string[] = [];
  const labelsY: string[] = [];
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = sy(v);
    grilleY.push(`<line x1="${MARGE_GAUCHE_SVG}" y1="${py.toFixed(1)}" x2="${LARGEUR_SVG_COURBES - MARGE_DROITE_SVG}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE_SVG}" stroke-width="1"/>`);
    labelsY.push(`<text x="${(MARGE_GAUCHE_SVG - 4).toFixed(1)}" y="${(py + 3).toFixed(1)}" font-size="8" text-anchor="end" fill="${COULEUR_AXE_SVG}">${formatNombreSvg(v)}</text>`);
  }

  const cadre = `<rect x="${MARGE_GAUCHE_SVG}" y="${MARGE_HAUT_SVG}" width="${zoneX}" height="${zoneY}" fill="none" stroke="${COULEUR_AXE_SVG}" stroke-width="1.2"/>`;
  const traceA = traceCourbeSvg(pointsA, COULEUR_SERIE_A, sx, sy);
  const traceB = traceCourbeSvg(pointsB, COULEUR_SERIE_B, sx, sy);

  const seuilsHtml = seuils
    .map((s) => {
      const couleur = s.serie === "A" ? COULEUR_SERIE_A : s.serie === "B" ? COULEUR_SERIE_B : COULEUR_AXE_SVG;
      const py = sy(s.y).toFixed(1);
      return (
        `<line x1="${MARGE_GAUCHE_SVG}" y1="${py}" x2="${LARGEUR_SVG_COURBES - MARGE_DROITE_SVG}" y2="${py}" stroke="${couleur}" stroke-width="1" stroke-dasharray="4 3"/>` +
        `<text x="${(LARGEUR_SVG_COURBES - MARGE_DROITE_SVG - 2).toFixed(1)}" y="${(sy(s.y) - 2).toFixed(1)}" font-size="7.5" text-anchor="end" fill="${couleur}">${formatNombreSvg(s.y)}${cumul === "frequence" ? " %" : ""}</text>`
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
