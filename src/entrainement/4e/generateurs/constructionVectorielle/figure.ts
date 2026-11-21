import type { ExerciceConstructionVectorielle } from "../../core/constructionVectorielle.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import { formatNombreGraphique } from "../../../export/svgGraph";
import { calculerPasGrille } from "../../ui/mafsTransformation";
import { calculerViewBoxVecteurs } from "../../ui/vecteurGraph";
import type { ViewBoxTransformation } from "../../ui/vecteurGraph";

/**
 * Figure papier de gen23 (grille + \vec{AB}, et le vecteur demandé tracé depuis un point d'ancrage
 * dans le corrigé), SANS `docx` : importée par l'adaptateur (énoncé) ET par le corrigé détaillé
 * partagé avec l'appli (`corrigeDetaille.ts`). Sortie telle quelle de `exportEvaluation.ts`.
 */

const LARGEUR_SVG = 260;
const RATIO_SVG = 3 / 2; // même RATIO_GRAPHE que l'écran (ui/mafsTransformation.ts) — viewBox déjà ajusté à ce ratio par calculerViewBoxVecteurs.
const HAUTEUR_SVG = Math.round(LARGEUR_SVG / RATIO_SVG);
const MARGE_PX = 20;

const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_POINT = "#495057";
const COULEUR_AB = "#1971c2";
const COULEUR_CIBLE = "#e8590c";

/** Distance (en unités réelles de la grille) de l'ancrage choisi pour illustrer le vecteur cible en
 * correction, perpendiculairement à \vec{AB} — voir le commentaire de tête pour la justification
 * (éviter la superposition avec \vec{AB} quand coefficient=1). */
const DISTANCE_ANCRAGE_CORRECTION = 2;

interface Echelle {
  sx: (x: number) => number;
  sy: (y: number) => number;
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

/** Graduation lisible : vrai signe moins « − » (audit 4e ch. 6, G5 : « -2 » au tiret dans 98,8 % des
 * figures), corps 10 au lieu de 8. */
function graduation(v: number): string {
  return formatNombreGraphique(v).replace(/^-/, "−");
}

/** Grille "nombre rond" (`calculerPasGrille`, même fonction que l'écran) + axes x=0/y=0 — géométrie
 * en attributs SVG inline, même patron que `triangleLies/exportEvaluation.ts::construireCroquisHtml`
 * (document HTML d'évaluation autonome, sans dépendance à `App.css`). */
function construireGrilleEtAxesHtml(viewBox: ViewBoxTransformation, echelle: Echelle): string {
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  const pasX = calculerPasGrille(xMax - xMin);
  const pasY = calculerPasGrille(yMax - yMin);

  const lignes: string[] = [];
  const labels: string[] = [];

  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = echelle.sx(v);
    lignes.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_PX}" x2="${px.toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_PX}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) {
      labels.push(`<text x="${px.toFixed(1)}" y="${(echelle.sy(0) + 12).toFixed(1)}" font-size="10" text-anchor="middle" fill="${COULEUR_AXE}">${graduation(v)}</text>`);
    }
  }
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = echelle.sy(v);
    lignes.push(`<line x1="${MARGE_PX}" y1="${py.toFixed(1)}" x2="${LARGEUR_SVG - MARGE_PX}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9) {
      labels.push(`<text x="${(echelle.sx(0) - 4).toFixed(1)}" y="${(py + 3.5).toFixed(1)}" font-size="10" text-anchor="end" fill="${COULEUR_AXE}">${graduation(v)}</text>`);
    }
  }

  const axeX = `<line x1="${MARGE_PX}" y1="${echelle.sy(0).toFixed(1)}" x2="${LARGEUR_SVG - MARGE_PX}" y2="${echelle.sy(0).toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;
  const axeY = `<line x1="${echelle.sx(0).toFixed(1)}" y1="${MARGE_PX}" x2="${echelle.sx(0).toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_PX}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;

  return `${lignes.join("")}${axeX}${axeY}${labels.join("")}`;
}

function construirePointHtml(point: Point, label: string, echelle: Echelle): string {
  const px = echelle.sx(point.x);
  const py = echelle.sy(point.y);
  return `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="${COULEUR_POINT}"/><text x="${px.toFixed(1)}" y="${(py - 8).toFixed(1)}" font-size="12" font-weight="700" text-anchor="middle" fill="${COULEUR_POINT}">${label}</text>`;
}

const LONGUEUR_TETE_FLECHE_PX = 8;
const LARGEUR_TETE_FLECHE_PX = 4;
const DECALAGE_LABEL_PX = 12;

/** Flèche (segment + tête triangulaire pleine) + étiquette décalée perpendiculairement au milieu du
 * tracé — géométrie pixel directe (jamais proportionnelle au viewBox réel, contrairement à
 * `ui/vecteurGraph.ts::calculerPositionsEtiquettesSansChevauchement` : ce fichier-ci ne dessine
 * jamais plus de 2 vecteurs à la fois, un simple décalage fixe en pixels suffit, même principe que
 * `triangleLies/exportEvaluation.ts::construireCroquisHtml`). */
function construireVecteurHtml(origine: Point, vecteur: Composantes, label: string, couleur: string, echelle: Echelle): string {
  const x1 = echelle.sx(origine.x);
  const y1 = echelle.sy(origine.y);
  const x2 = echelle.sx(origine.x + vecteur.x);
  const y2 = echelle.sy(origine.y + vecteur.y);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const longueur = Math.hypot(dx, dy) || 1;
  const ux = dx / longueur;
  const uy = dy / longueur;
  const perpX = -uy;
  const perpY = ux;

  // La ligne s'arrête juste avant la pointe pour laisser la place à la tête de flèche.
  const xBase = x2 - ux * LONGUEUR_TETE_FLECHE_PX;
  const yBase = y2 - uy * LONGUEUR_TETE_FLECHE_PX;
  const p1 = `${x2.toFixed(1)},${y2.toFixed(1)}`;
  const p2 = `${(xBase + perpX * LARGEUR_TETE_FLECHE_PX).toFixed(1)},${(yBase + perpY * LARGEUR_TETE_FLECHE_PX).toFixed(1)}`;
  const p3 = `${(xBase - perpX * LARGEUR_TETE_FLECHE_PX).toFixed(1)},${(yBase - perpY * LARGEUR_TETE_FLECHE_PX).toFixed(1)}`;

  const milieuX = (x1 + x2) / 2 + perpX * DECALAGE_LABEL_PX;
  const milieuY = (y1 + y2) / 2 + perpY * DECALAGE_LABEL_PX;

  return (
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${xBase.toFixed(1)}" y2="${yBase.toFixed(1)}" stroke="${couleur}" stroke-width="2.2"/>` +
    `<polygon points="${p1} ${p2} ${p3}" fill="${couleur}"/>` +
    `<text x="${milieuX.toFixed(1)}" y="${milieuY.toFixed(1)}" font-size="11" font-weight="700" text-anchor="middle" fill="${couleur}">${label}</text>`
  );
}

/** Ancrage du tracé de correction pour le vecteur cible — décalé perpendiculairement à \vec{AB}
 * d'une distance fixe (`DISTANCE_ANCRAGE_CORRECTION`) depuis A, puis arrondi à la grille (un exercice
 * de construction SUR GRILLE : un ancrage sur un nœud de grille reste le choix le plus lisible, même
 * si un ancrage hors-grille serait tout aussi correct). Voir le commentaire de tête pour pourquoi cet
 * ancrage ne peut pas être A lui-même. */
function ancrageCorrection(exercice: ExerciceConstructionVectorielle): Point {
  const dx = exercice.pointB.x - exercice.pointA.x;
  const dy = exercice.pointB.y - exercice.pointA.y;
  const longueur = Math.hypot(dx, dy);
  const perpX = -dy / longueur;
  const perpY = dx / longueur;
  return {
    x: Math.round(exercice.pointA.x + perpX * DISTANCE_ANCRAGE_CORRECTION),
    y: Math.round(exercice.pointA.y + perpY * DISTANCE_ANCRAGE_CORRECTION),
  };
}

export function formatCoefficientTexte(coefficient: number): string {
  return coefficient === 1 ? "" : coefficient === -1 ? "-" : String(coefficient);
}

/** Construit le graphique complet (grille + \vec{AB}), avec en plus le vecteur cible tracé depuis
 * `ancrageCorrection` quand `avecCible` (réservé à la correction — jamais l'énoncé, qui ne doit pas
 * trahir la réponse). Le viewBox est TOUJOURS calculé en tenant compte du vecteur cible (même
 * ancrage, qu'il soit affiché ou non) : sur papier, contrairement à l'écran (Mafs pan/zoom), la
 * grille imprimée ne peut plus s'agrandir après coup — l'énoncé doit donc déjà montrer assez
 * d'espace pour que l'élève puisse y tracer sa construction sans en sortir. */
export function construireSvgConstructionVectorielle(exercice: ExerciceConstructionVectorielle, avecCible: boolean): string {
  const vecteurAB: Composantes = { x: exercice.pointB.x - exercice.pointA.x, y: exercice.pointB.y - exercice.pointA.y };
  const ancrage = ancrageCorrection(exercice);

  const points = [
    { point: exercice.pointA, label: exercice.labelA },
    { point: exercice.pointB, label: exercice.labelB },
  ];
  const vecteurs = [
    { origine: exercice.pointA, vecteur: vecteurAB },
    { origine: ancrage, vecteur: exercice.cibleComposantes },
  ];
  const viewBox = calculerViewBoxVecteurs(points, vecteurs);
  const echelle = construireEchelle(viewBox);

  const grilleHtml = construireGrilleEtAxesHtml(viewBox, echelle);
  const abHtml = construireVecteurHtml(exercice.pointA, vecteurAB, `${exercice.labelA}${exercice.labelB}`, COULEUR_AB, echelle);
  const cibleHtml = avecCible
    ? construireVecteurHtml(ancrage, exercice.cibleComposantes, `${formatCoefficientTexte(exercice.coefficient).replace("-", "−")}${exercice.labelA}${exercice.labelB}`, COULEUR_CIBLE, echelle)
    : "";
  const pointsHtml = points.map((p) => construirePointHtml(p.point, p.label, echelle)).join("");

  return `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;border:1px solid #e6e6f0;border-radius:8px;background:#ffffff;">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${grilleHtml}
${abHtml}
${cibleHtml}
${pointsHtml}
</svg>`;
}

