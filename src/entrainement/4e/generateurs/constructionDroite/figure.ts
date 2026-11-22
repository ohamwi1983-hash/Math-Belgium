import type { ExerciceConstructionDroite } from "../../core/constructionDroite.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import { formatNombreGraphique } from "../../../export/svgGraph";
import { calculerPasGrille } from "../../ui/mafsTransformation";
import { pasGrilleConstructionDroite } from "../../ui/constructionDroiteGraph";
import { calculerViewBoxVecteurs } from "../../ui/vecteurGraph";
import type { ViewBoxTransformation } from "../../ui/vecteurGraph";

/**
 * Figure papier de gen44 « Construction graphique — tracer une droite » (droite tracée par ses deux
 * points), sortie de l'adaptateur sans `docx` : aussi importée par le corrigé détaillé de l'appli.
 * `points` : deux points de la droite à marquer (ceux de l'élève à l'écran), sinon A et A + u.
 */

const LARGEUR_SVG = 280;
const RATIO_SVG = 3 / 2; // même RATIO_GRAPHE que l'écran (ui/mafsTransformation.ts).
const HAUTEUR_SVG = Math.round(LARGEUR_SVG / RATIO_SVG);
const MARGE_PX = 20;

const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_POINT = "#495057";
const COULEUR_DROITE = "#1971c2"; // même couleur que ConstructionDroiteGraph.tsx::COULEUR_DROITE.

interface Echelle {
  sx: (x: number) => number;
  sy: (y: number) => number;
}

/** Cadre PAPIER : le cadre de l'écran (`calculerViewBoxVecteurs`) étendu pour contenir l'origine — sur papier, sans
 * axes ni graduations dans le cadre, les coordonnées des points ne se liraient pas (l'écran, lui,
 * étend sa vue jusqu'aux axes, `etendreViewBoxPourEtiquettes`). Les unités restent carrées : la
 * dimension la moins remplie est élargie symétriquement pour garder le rapport de la zone tracée. */
function cadrePapier(viewBox: ViewBoxTransformation): ViewBoxTransformation {
  let [xMin, xMax] = viewBox.x;
  let [yMin, yMax] = viewBox.y;
  xMin = Math.min(xMin, -1);
  xMax = Math.max(xMax, 1);
  yMin = Math.min(yMin, -1);
  yMax = Math.max(yMax, 1);
  const rapport = (LARGEUR_SVG - 2 * MARGE_PX) / (HAUTEUR_SVG - 2 * MARGE_PX);
  const largeur = xMax - xMin;
  const hauteur = yMax - yMin;
  if (largeur / hauteur < rapport) {
    const ajout = (hauteur * rapport - largeur) / 2;
    xMin -= ajout;
    xMax += ajout;
  } else {
    const ajout = (largeur / rapport - hauteur) / 2;
    yMin -= ajout;
    yMax += ajout;
  }
  return { x: [xMin, xMax], y: [yMin, yMax] };
}

function construireEchelle(viewBox: ViewBoxTransformation): Echelle {
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  const zoneX = LARGEUR_SVG - 2 * MARGE_PX;
  const zoneY = HAUTEUR_SVG - 2 * MARGE_PX;
  return {
    sx: (x) => MARGE_PX + ((x - xMin) / (xMax - xMin)) * zoneX,
    sy: (y) => HAUTEUR_SVG - MARGE_PX - ((y - yMin) / (yMax - yMin)) * zoneY,
  };
}

/** Grille "nombre rond" (`calculerPasGrille`, même fonction que l'écran) + axes x=0/y=0 — géométrie
 * en attributs SVG inline, même patron que `constructionVectorielle/exportEvaluation.ts::construireGrilleEtAxesHtml`
 * (document HTML d'évaluation autonome, sans dépendance à `App.css`). */
function construireGrilleEtAxesHtml(viewBox: ViewBoxTransformation, echelle: Echelle): string {
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  // Pas de 1 comme à l'écran (`pasGrilleConstructionDroite`), adaptatif seulement pour un cadre très
  // large.
  const pasFixe = pasGrilleConstructionDroite(viewBox);
  const pasX = pasFixe ?? calculerPasGrille(xMax - xMin);
  const pasY = pasFixe ?? calculerPasGrille(yMax - yMin);

  const lignes: string[] = [];
  const labels: string[] = [];

  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = echelle.sx(v);
    lignes.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_PX}" x2="${px.toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_PX}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) {
      labels.push(`<text x="${px.toFixed(1)}" y="${(echelle.sy(0) + 11).toFixed(1)}" font-size="8" text-anchor="middle" fill="${COULEUR_AXE}" stroke="#ffffff" stroke-width="3" paint-order="stroke">${formatNombreGraphique(v)}</text>`);
    }
  }
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = echelle.sy(v);
    lignes.push(`<line x1="${MARGE_PX}" y1="${py.toFixed(1)}" x2="${LARGEUR_SVG - MARGE_PX}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) {
      labels.push(`<text x="${(echelle.sx(0) - 4).toFixed(1)}" y="${(py + 3).toFixed(1)}" font-size="8" text-anchor="end" fill="${COULEUR_AXE}" stroke="#ffffff" stroke-width="3" paint-order="stroke">${formatNombreGraphique(v)}</text>`);
    }
  }

  const axeX = `<line x1="${MARGE_PX}" y1="${echelle.sy(0).toFixed(1)}" x2="${LARGEUR_SVG - MARGE_PX}" y2="${echelle.sy(0).toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;
  const axeY = `<line x1="${echelle.sx(0).toFixed(1)}" y1="${MARGE_PX}" x2="${echelle.sx(0).toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_PX}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;

  // Graduations APRÈS la droite (marqueur de coupure) : une droite qui passe sur une graduation ne la masque pas.
  return `${lignes.join("")}${axeX}${axeY}<!--graduations-->${labels.join("")}`;
}

function construirePointHtml(point: Point, label: string, echelle: Echelle): string {
  const px = echelle.sx(point.x);
  const py = echelle.sy(point.y);
  return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="${COULEUR_POINT}"/><text x="${px.toFixed(1)}" y="${(py - 8).toFixed(1)}" font-size="12" font-weight="700" text-anchor="middle" fill="${COULEUR_POINT}">${label}</text>`;
}

/** Clippe la droite infinie `{point + t·vecteur, t ∈ ℝ}` au rectangle du viewBox — algorithme de
 * clipping paramétrique classique (borne l'intervalle de `t` par les 4 côtés du rectangle, un axe à
 * la fois). `vecteur` n'a jamais de composante nulle ici (`constructionDroite/index.ts::tirerVecteur`,
 * jamais un vecteur horizontal/vertical), donc les deux branches `x!==0`/`y!==0` sont toujours
 * empruntées en pratique — les branches `else` (vecteur horizontal/vertical) restent écrites par
 * robustesse, jamais exercées par ce générateur précis mais sans coût à les couvrir. Retourne
 * toujours un segment non vide : `point` est garanti strictement à l'intérieur du rectangle
 * (`calculerViewBoxVecteurs` marge chaque point d'au moins 1.5 unité), donc `tMin<0<tMax` toujours. */
function clipLigneAuViewBox(point: Point, vecteur: Composantes, viewBox: ViewBoxTransformation): [Point, Point] {
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  let tMin = -Infinity;
  let tMax = Infinity;

  if (vecteur.x !== 0) {
    const t1 = (xMin - point.x) / vecteur.x;
    const t2 = (xMax - point.x) / vecteur.x;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }
  if (vecteur.y !== 0) {
    const t1 = (yMin - point.y) / vecteur.y;
    const t2 = (yMax - point.y) / vecteur.y;
    tMin = Math.max(tMin, Math.min(t1, t2));
    tMax = Math.min(tMax, Math.max(t1, t2));
  }

  return [
    { x: point.x + tMin * vecteur.x, y: point.y + tMin * vecteur.y },
    { x: point.x + tMax * vecteur.x, y: point.y + tMax * vecteur.y },
  ];
}

function construireDroiteHtml(point: Point, vecteur: Composantes, echelle: Echelle, viewBox: ViewBoxTransformation): string {
  const [p1, p2] = clipLigneAuViewBox(point, vecteur, viewBox);
  const x1 = echelle.sx(p1.x);
  const y1 = echelle.sy(p1.y);
  const x2 = echelle.sx(p2.x);
  const y2 = echelle.sy(p2.y);
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${COULEUR_DROITE}" stroke-width="2.2"/>`;
}

export function secondPoint(point: Point, vecteur: Composantes): Point {
  return { x: point.x + vecteur.x, y: point.y + vecteur.y };
}

/** Construit le graphique complet (grille + axes), avec en plus la droite tracée (bleue, prolongée
 * jusqu'aux bords du graphique) et les 2 points A/B repères quand `avecTrace` — réservé à la
 * correction, jamais l'énoncé (qui ne doit montrer qu'une grille vierge). Le viewBox est TOUJOURS
 * calculé à partir des mêmes 2 points, que la droite soit affichée ou non (voir commentaire de tête :
 * l'énoncé doit déjà montrer assez d'espace pour que l'élève y trace sa droite sans en sortir). */
export function construireSvgConstructionDroite(exercice: ExerciceConstructionDroite, avecTrace: boolean, points?: [Point, Point]): string {
  const point = points ? points[0] : exercice.point;
  const pointB = points ? points[1] : secondPoint(exercice.point, exercice.vecteur);
  const vecteur = points ? { x: pointB.x - point.x, y: pointB.y - point.y } : exercice.vecteur;
  const viewBox = cadrePapier(calculerViewBoxVecteurs([
    { point, label: "" },
    { point: pointB, label: "" },
    ]));
  const echelle = construireEchelle(viewBox);

  const [grilleHtml, graduationsHtml] = construireGrilleEtAxesHtml(viewBox, echelle).split("<!--graduations-->");
  const droiteHtml = avecTrace ? construireDroiteHtml(point, vecteur, echelle, viewBox) : "";
  const pointsHtml = avecTrace ? `${construirePointHtml(point, "A", echelle)}${construirePointHtml(pointB, "B", echelle)}` : "";

  return `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;border:1px solid #e6e6f0;border-radius:8px;background:#ffffff;">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${grilleHtml}
${droiteHtml}
${graduationsHtml}
${pointsHtml}
</svg>`;
}

