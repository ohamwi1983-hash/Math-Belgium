import type { ExerciceLectureGraphiqueDroite } from "../../core/lectureGraphiqueDroite.types";
import type { Point } from "../../core/vecteur.types";
import { boiteDisque, boiteTexte, graduationsSansChevauchement, pasGraduations, type Boite, type Graduation } from "../../ui/graduationsSvg";
import { RATIO_GRAPHE } from "../../ui/mafsTransformation";
import type { ViewBoxTransformation } from "../../ui/vecteurGraph";
import { PAS_GRILLE_LECTURE, pointsEntiersVisibles, viewBoxLectureGraphiqueDroite } from "../../ui/lectureGraphiqueDroiteGraph";

/**
 * Figure papier de gen43 « Lecture graphique — équation d'une droite » (énoncé, et corrigé avec les
 * points lus étiquetés), sortie de l'adaptateur sans `docx` : elle est aussi importée par le corrigé
 * détaillé que l'appli affiche après une étape ratée.
 */

const LARGEUR_SVG = 360;
const HAUTEUR_SVG = Math.round(LARGEUR_SVG / RATIO_GRAPHE);
const MARGE_PX = 20;

const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_DROITE = "#1971c2";
const COULEUR_POINT = "#495057";

interface Echelle {
  sx: (x: number) => number;
  sy: (y: number) => number;
}

/** Cadre PAPIER : le cadre de l'écran (`viewBoxLectureGraphiqueDroite`) étendu pour contenir l'origine — sur papier, sans
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

/** Grille de pas 1 (`PAS_GRILLE_LECTURE`, même pas que l'écran) + axes x=0/y=0 — même
 * patron que `constructionVectorielle/exportEvaluation.ts::construireGrilleEtAxesHtml` (document
 * HTML d'évaluation autonome, sans dépendance à `App.css`). */
function construireGrilleEtAxesHtml(viewBox: ViewBoxTransformation, echelle: Echelle): { grille: string; graduations: Graduation[] } {
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  // Même pas fixe qu'à l'écran (`PAS_GRILLE_LECTURE`) : les points marqués tombent sur les nœuds.
  const pasX = PAS_GRILLE_LECTURE;
  const pasY = PAS_GRILLE_LECTURE;
  // Nombres écrits tous les 1, 2, 5… carreaux, jamais collés (audit 4e ch. 7, G5 : « 9-−8-−7… »).
  const pixelsParUnite = echelle.sx(1) - echelle.sx(0);
  const pasNombres = pasGraduations(pixelsParUnite, xMin, xMax, TAILLE_NOMBRES);

  const lignes: string[] = [];
  const graduations: Graduation[] = [];

  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = echelle.sx(v);
    lignes.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_PX}" x2="${px.toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_PX}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9 && Math.round(v) % pasNombres === 0) {
      graduations.push({ valeur: v, x: px, y: echelle.sy(0) + 13, xRepli: px, yRepli: echelle.sy(0) - 5, ancre: "middle", ancreRepli: "middle" });
    }
  }
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = echelle.sy(v);
    lignes.push(`<line x1="${MARGE_PX}" y1="${py.toFixed(1)}" x2="${LARGEUR_SVG - MARGE_PX}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9 && Math.round(v) % pasNombres === 0) {
      graduations.push({ valeur: v, x: echelle.sx(0) - 4, y: py + 3, xRepli: echelle.sx(0) + 4, yRepli: py + 3, ancre: "end", ancreRepli: "start" });
    }
  }

  const axeX = `<line x1="${MARGE_PX}" y1="${echelle.sy(0).toFixed(1)}" x2="${LARGEUR_SVG - MARGE_PX}" y2="${echelle.sy(0).toFixed(1)}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;
  const axeY = `<line x1="${echelle.sx(0).toFixed(1)}" y1="${MARGE_PX}" x2="${echelle.sx(0).toFixed(1)}" y2="${HAUTEUR_SVG - MARGE_PX}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`;

  return { grille: `${lignes.join("")}${axeX}${axeY}`, graduations };
}

const TAILLE_NOMBRES = 10;

/** Découpe la droite INFINIE (`point` + direction `vecteur`) aux bords du `viewBox` — méthode des
 * tranches (slab method), universellement correcte y compris pour une direction verticale/horizontale
 * (`vecteur.x`/`vecteur.y` nul). Retourne les 2 points d'intersection avec le cadre, dans l'ordre
 * croissant de `t` — jamais `null` en pratique ici : `viewBox` est TOUJOURS calculé par
 * `viewBoxLectureGraphiqueDroite`, qui couvre par construction des points réellement sur la droite
 * (`pointsEntiersVisibles`), donc la droite traverse nécessairement le cadre. Le repli sur `point`
 * lui-même (segment de longueur nulle) ne peut donc être exercé que si cette garantie était un jour
 * rompue par un appelant futur — jamais silencieusement invisible, un point unique restant visible. */
function decouperDroiteDansViewBox(point: Point, vecteur: { x: number; y: number }, viewBox: ViewBoxTransformation): [Point, Point] {
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

  if (!(tMin <= tMax)) {
    return [point, point];
  }
  return [
    { x: point.x + tMin * vecteur.x, y: point.y + tMin * vecteur.y },
    { x: point.x + tMax * vecteur.x, y: point.y + tMax * vecteur.y },
  ];
}

/** Grille + droite tracée d'un bord à l'autre du cadre + points à coordonnées entières marqués — même
 * représentation que `LectureGraphiqueDroiteGraph.tsx` à l'écran, jamais l'équation elle-même
 * affichée (c'est justement ce que l'élève doit trouver). */
export function construireSvgLectureGraphiqueDroite(exercice: ExerciceLectureGraphiqueDroite, etiquettes = false): string {
  const viewBox = cadrePapier(viewBoxLectureGraphiqueDroite(exercice));
  const echelle = construireEchelle(viewBox);
  const [depart, arrivee] = decouperDroiteDansViewBox(exercice.point, exercice.vecteur, viewBox);

  const { grille: grilleHtml, graduations } = construireGrilleEtAxesHtml(viewBox, echelle);
  const droiteHtml = `<line x1="${echelle.sx(depart.x).toFixed(1)}" y1="${echelle.sy(depart.y).toFixed(1)}" x2="${echelle.sx(arrivee.x).toFixed(1)}" y2="${echelle.sy(arrivee.y).toFixed(1)}" stroke="${COULEUR_DROITE}" stroke-width="2.4"/>`;
  // Obstacles des nombres des axes : chaque point marqué et son nom (jamais un nombre caché dessous).
  const obstacles: Boite[] = [];
  pointsEntiersVisibles(exercice).forEach((p, i) => {
    obstacles.push(boiteDisque(echelle.sx(p.x), echelle.sy(p.y), 3));
    const nom = etiquettes ? (i === 0 ? "C" : i === 1 ? "A" : i === 2 ? "B" : "") : "";
    if (nom) obstacles.push(boiteTexte(echelle.sx(p.x) + 7, echelle.sy(p.y) + 4, nom, 12, "start"));
  });
  const graduationsHtml = graduationsSansChevauchement(graduations, obstacles, { taille: TAILLE_NOMBRES, couleur: COULEUR_AXE });
  const pointsHtml = pointsEntiersVisibles(exercice)
    .map((p, i) => {
      const cercle = `<circle cx="${echelle.sx(p.x).toFixed(1)}" cy="${echelle.sy(p.y).toFixed(1)}" r="3" fill="${COULEUR_POINT}"/>`;
      // Corrigé : les points lus (A = point de référence, B = A + vecteur) et le point de contrôle C = A − vecteur, étiquetés.
      const nom = etiquettes ? (i === 0 ? "C" : i === 1 ? "A" : i === 2 ? "B" : "") : "";
      return nom ? `${cercle}<text x="${(echelle.sx(p.x) + 7).toFixed(1)}" y="${(echelle.sy(p.y) + 4).toFixed(1)}" font-size="12" font-weight="700" fill="${COULEUR_POINT}" stroke="#ffffff" stroke-width="3" paint-order="stroke">${nom}</text>` : cercle;
    })
    .join("");

  return `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;border:1px solid #e6e6f0;border-radius:8px;background:#ffffff;">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${grilleHtml}
${droiteHtml}
${graduationsHtml}
${pointsHtml}
</svg>`;
}

