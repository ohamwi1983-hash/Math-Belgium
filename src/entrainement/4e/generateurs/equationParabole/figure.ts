import type { ExerciceEquationParabole } from "../../core/equationParabole.types";
import { formatNombreGraphique } from "../../../export/svgGraph";
import { PAS_GRILLE_EQUATION_PARABOLE, directriceEquationParabole, viewBoxEquationParabole } from "../../ui/equationParaboleGraph";
import { RATIO_GRAPHE } from "../../ui/mafsTransformation";

/**
 * Figure SVG autonome de gen51 (sans `docx`) — sortie de `exportEvaluation.ts` pour être importée
 * aussi par le corrigé détaillé (`corrigeDetaille.ts`), partagé avec l'appli. Énoncé : parabole,
 * foyer F, directrice d. Corrigé : en plus, l'axe de la parabole (pointillés), le sommet S et les
 * coordonnées de S et F.
 */
const LARGEUR_SVG = 300;
const MARGE_SVG = 16;
const COULEUR_COURBE = "#1971c2";
const COULEUR_FOYER = "#f08c00";
const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const NB_POINTS_COURBE = 120;
/** Identifiant unique du `clipPath` de chaque graphique (plusieurs graphiques dans un même document). */
let compteurClip = 0;

/** Points `(x,y)` de la courbe, échantillonnés en x (vertical, `y=f(x)`) ou en y (horizontal,
 * `x=g(y)`) sur tout le cadre. */
function pointsCourbeParabole(exercice: ExerciceEquationParabole, xMin: number, xMax: number, yMin: number, yMax: number): [number, number][] {
  const { sommet, p, variante } = exercice;
  const points: [number, number][] = [];
  for (let i = 0; i <= NB_POINTS_COURBE; i++) {
    if (variante === "vertical") {
      const x = xMin + ((xMax - xMin) * i) / NB_POINTS_COURBE;
      points.push([x, sommet.y + ((x - sommet.x) * (x - sommet.x)) / (2 * p)]);
    } else {
      const y = yMin + ((yMax - yMin) * i) / NB_POINTS_COURBE;
      points.push([sommet.x + ((y - sommet.y) * (y - sommet.y)) / (2 * p), y]);
    }
  }
  return points;
}

function texteSvg(x: number, y: number, contenu: string, options: { couleur?: string; taille?: number; ancre?: "start" | "middle" | "end"; gras?: boolean } = {}): string {
  const { couleur = COULEUR_AXE, taille = 8, ancre = "middle", gras = false } = options;
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${taille}" text-anchor="${ancre}"${gras ? ' font-weight="700"' : ""} fill="${couleur}">${contenu}</text>`;
}

/**
 * `<svg>` autonome du graphe de gen51 — grille de pas 1, axes gradués, parabole, directrice d
 * (trait orange) et foyer F (croix orange), nommés « d » et « F » sans aucune coordonnée (c'est ce
 * que l'élève lit). Cadrage identique à l'écran (`viewBoxEquationParabole`, déjà ajusté au rapport
 * `RATIO_GRAPHE` : une seule échelle sur les deux axes). Un axe hors cadre n'est pas tracé, mais ses
 * nombres restent épinglés au bord le plus proche. Correction : sommet S et coordonnées de S et F.
 */
export function construireSvgParabole(exercice: ExerciceEquationParabole, avecCorrection: boolean): string {
  const { sommet, foyer, variante } = exercice;
  const viewBox = viewBoxEquationParabole(exercice);
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  const largeur = LARGEUR_SVG;
  const hauteur = Math.round(largeur / RATIO_GRAPHE);
  const echelle = Math.min((largeur - 2 * MARGE_SVG) / (xMax - xMin), (hauteur - 2 * MARGE_SVG) / (yMax - yMin));
  const decalageX = (largeur - echelle * (xMax - xMin)) / 2;
  const decalageY = (hauteur - echelle * (yMax - yMin)) / 2;
  const sx = (x: number) => decalageX + (x - xMin) * echelle;
  const sy = (y: number) => decalageY + (yMax - y) * echelle;
  const gauche = sx(xMin);
  const droite = sx(xMax);
  const haut = sy(yMax);
  const bas = sy(yMin);
  const borner = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const ligneNombresX = borner(sy(0), haut, bas - 12);
  const colonneNombresY = borner(sx(0), gauche + 16, droite);
  const pasEtiquettes = echelle < 16 ? 2 : 1;

  const pas = PAS_GRILLE_EQUATION_PARABOLE;
  const grille: string[] = [];
  const labels: string[] = [];
  for (let v = Math.ceil(xMin / pas) * pas; v <= xMax + 1e-9; v += pas) {
    const px = sx(v);
    grille.push(`<line x1="${px.toFixed(1)}" y1="${haut.toFixed(1)}" x2="${px.toFixed(1)}" y2="${bas.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9 && Math.round(v) % pasEtiquettes === 0) labels.push(texteSvg(px, ligneNombresX + 11, formatNombreGraphique(v)));
  }
  for (let v = Math.ceil(yMin / pas) * pas; v <= yMax + 1e-9; v += pas) {
    const py = sy(v);
    grille.push(`<line x1="${gauche.toFixed(1)}" y1="${py.toFixed(1)}" x2="${droite.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9 && Math.round(v) % pasEtiquettes === 0) labels.push(texteSvg(colonneNombresY - 4, py + 3, formatNombreGraphique(v), { ancre: "end" }));
  }
  const axeX = yMin <= 0 && 0 <= yMax ? `<line x1="${gauche.toFixed(1)}" y1="${sy(0).toFixed(1)}" x2="${droite.toFixed(1)}" y2="${sy(0).toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>` : "";
  const axeY = xMin <= 0 && 0 <= xMax ? `<line x1="${sx(0).toFixed(1)}" y1="${haut.toFixed(1)}" x2="${sx(0).toFixed(1)}" y2="${bas.toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>` : "";

  const pts = pointsCourbeParabole(exercice, xMin, xMax, yMin, yMax).filter(([x, y]) => x >= xMin - 1 && x <= xMax + 1 && y >= yMin - 1 && y <= yMax + 1);
  const chemin = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${sx(x).toFixed(1)},${sy(y).toFixed(1)}`).join(" ");
  const courbe = `<path d="${chemin}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.2" stroke-linecap="round"/>`;

  const directrice = directriceEquationParabole(exercice);
  const ligneDirectrice =
    variante === "vertical"
      ? `<line x1="${gauche.toFixed(1)}" y1="${sy(directrice).toFixed(1)}" x2="${droite.toFixed(1)}" y2="${sy(directrice).toFixed(1)}" stroke="${COULEUR_FOYER}" stroke-width="1.8"/>` +
        texteSvg(gauche + 6, sy(directrice) + (foyer.y > directrice ? 13 : -5), "d", { couleur: COULEUR_FOYER, taille: 11, ancre: "start", gras: true })
      : `<line x1="${sx(directrice).toFixed(1)}" y1="${haut.toFixed(1)}" x2="${sx(directrice).toFixed(1)}" y2="${bas.toFixed(1)}" stroke="${COULEUR_FOYER}" stroke-width="1.8"/>` +
        texteSvg(sx(directrice) + (foyer.x > directrice ? -5 : 5), haut + 28, "d", { couleur: COULEUR_FOYER, taille: 11, ancre: foyer.x > directrice ? "end" : "start", gras: true });

  const cxF = sx(foyer.x);
  const cyF = sy(foyer.y);
  const croixFoyer =
    `<g stroke="${COULEUR_FOYER}" stroke-width="2.2"><line x1="${(cxF - 4).toFixed(1)}" y1="${(cyF - 4).toFixed(1)}" x2="${(cxF + 4).toFixed(1)}" y2="${(cyF + 4).toFixed(1)}"/><line x1="${(cxF - 4).toFixed(1)}" y1="${(cyF + 4).toFixed(1)}" x2="${(cxF + 4).toFixed(1)}" y2="${(cyF - 4).toFixed(1)}"/></g>` +
    texteSvg(cxF + 7, cyF - 6, avecCorrection ? `F(${formatNombreGraphique(foyer.x)} ; ${formatNombreGraphique(foyer.y)})` : "F", { couleur: COULEUR_FOYER, taille: avecCorrection ? 10 : 11, ancre: "start", gras: true });

  // Axe de la parabole (perpendiculaire à d par F) et son pied K sur d : S est le milieu de [KF].
  const axeParabole = avecCorrection
    ? (variante === "vertical"
        ? `<line x1="${sx(foyer.x).toFixed(1)}" y1="${haut.toFixed(1)}" x2="${sx(foyer.x).toFixed(1)}" y2="${bas.toFixed(1)}" stroke="${COULEUR_COURBE}" stroke-width="1.2" stroke-dasharray="5,4"/>` +
          `<circle cx="${sx(foyer.x).toFixed(1)}" cy="${sy(directrice).toFixed(1)}" r="2.6" fill="${COULEUR_FOYER}"/>`
        : `<line x1="${gauche.toFixed(1)}" y1="${sy(foyer.y).toFixed(1)}" x2="${droite.toFixed(1)}" y2="${sy(foyer.y).toFixed(1)}" stroke="${COULEUR_COURBE}" stroke-width="1.2" stroke-dasharray="5,4"/>` +
          `<circle cx="${sx(directrice).toFixed(1)}" cy="${sy(foyer.y).toFixed(1)}" r="2.6" fill="${COULEUR_FOYER}"/>`)
    : "";

  const reperesCorrection = avecCorrection
    ? `<circle cx="${sx(sommet.x).toFixed(1)}" cy="${sy(sommet.y).toFixed(1)}" r="3" fill="${COULEUR_COURBE}"/>` +
      texteSvg(sx(sommet.x) - 7, sy(sommet.y) + (variante === "vertical" ? (exercice.p > 0 ? 13 : -7) : 13), `S(${formatNombreGraphique(sommet.x)} ; ${formatNombreGraphique(sommet.y)})`, { couleur: COULEUR_COURBE, taille: 10, ancre: "end", gras: true })
    : "";

  const idClip = `cadre-parabole-${++compteurClip}`;
  const cadre = `<rect x="0.5" y="0.5" width="${largeur - 1}" height="${hauteur - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`;
  return `<svg class="graphe-cyclo" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphe de la parabole">
<rect x="0" y="0" width="${largeur}" height="${hauteur}" fill="#ffffff"/>
<clipPath id="${idClip}"><rect x="${gauche.toFixed(1)}" y="${haut.toFixed(1)}" width="${(droite - gauche).toFixed(1)}" height="${(bas - haut).toFixed(1)}"/></clipPath>
${grille.join("")}
${axeX}${axeY}
<g clip-path="url(#${idClip})">${courbe}</g>
${axeParabole}
${ligneDirectrice}
${labels.join("")}
${croixFoyer}
${reperesCorrection}
${cadre}
</svg>`;
}

