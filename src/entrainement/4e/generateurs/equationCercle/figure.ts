import type { ExerciceEquationCercle } from "../../core/equationCercle.types";
import { boiteDisque, boiteTexte, graduationsSansChevauchement, pasGraduations, type Boite, type Graduation } from "../../ui/graduationsSvg";
import { RATIO_GRAPHE_CERCLE, viewBoxEquationCercle } from "../../ui/equationCercleGraph";

/**
 * Figure SVG autonome de gen49 (sans `docx`) — sortie de `exportEvaluation.ts` pour être importée
 * aussi par le corrigé détaillé (`corrigeDetaille.ts`), partagé avec l'appli. Énoncé : cercle, point
 * marqué P. Corrigé : centre C marqué (croix verte, étiquette « C »), segment [CP] en pointillés
 * et, pour `rayon_indirect`, les deux écarts (horizontal et vertical) du triangle rectangle de
 * Pythagore, chacun avec sa longueur.
 */
// ============================================================================
// Moteur de tracé SVG statique — cercle sur grille (aucun équivalent existant, voir commentaire de
// tête de fichier : `export/svgGraph.ts::construireSvgFonction` est un tracé de COURBE `y=f(x)`,
// inapplicable à un cercle multivalué en y).
// ============================================================================

const LARGEUR_SVG = 320;
const MARGE_SVG = 14;
const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_CERCLE = "#1971c2";
const COULEUR_POINT = "#f08c00";
const COULEUR_CENTRE = "#2f9e44";
const EPAISSEUR_CERCLE = 2.4;
const EPAISSEUR_SEGMENT = 1.6;
const DEMI_CROIX_CENTRE = 4;
const TAILLE_NOMBRES = 8;

function ligneSvg(x1: number, y1: number, x2: number, y2: number, couleur: string, epaisseur: number, style?: "dashed"): string {
  const traitPointille = style === "dashed" ? ' stroke-dasharray="5,4"' : "";
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${couleur}" stroke-width="${epaisseur}"${traitPointille}/>`;
}


interface OptionsSvgEquationCercle {
  /** Croix verte au centre — correction uniquement (aide niveau 2 côté écran), jamais l'énoncé (qui
   * ne doit pas trahir la réponse). */
  avecCentre?: boolean;
  /** Segment pointillé centre↔point marqué — correction uniquement, même réserve que `avecCentre`. */
  avecRayon?: boolean;
  /** Écarts horizontal et vertical de C à P (côtés du triangle rectangle de Pythagore), avec leur
   * longueur — corrigé de `rayon_indirect` uniquement. */
  avecEcarts?: boolean;
}

/**
 * `<svg>` autonome du graphe de gen49 — grille de pas 1 + axes gradués, cercle tracé, point
 * marqué ; le centre (croix) et le segment du rayon ne sont ajoutés que si demandé (`options`,
 * correction uniquement). Cadrage identique à l'écran (`viewBoxEquationCercle`, même
 * fonction pure que `EquationCercleGraph.tsx`), avec UNE
 * seule échelle sur les deux axes : le cercle est un vrai `<circle>`, jamais une ellipse.
 */
export function construireSvgEquationCercle(exercice: ExerciceEquationCercle, options: OptionsSvgEquationCercle = {}): string {
  const viewBox = viewBoxEquationCercle(exercice);
  const largeur = LARGEUR_SVG;
  const hauteur = Math.round(largeur / RATIO_GRAPHE_CERCLE);
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  // UNE seule échelle pour les deux axes (audit chapitre 7, point 41) : deux échelles
  // indépendantes déformaient le cercle en ellipse (jusqu'à 5 %) — la zone la plus contraignante
  // fixe l'échelle, l'autre axe est centré.
  const echelle = Math.min((largeur - 2 * MARGE_SVG) / (xMax - xMin), (hauteur - 2 * MARGE_SVG) / (yMax - yMin));
  const decalageX = (largeur - echelle * (xMax - xMin)) / 2;
  const decalageY = (hauteur - echelle * (yMax - yMin)) / 2;
  const sx = (x: number) => decalageX + (x - xMin) * echelle;
  const sy = (y: number) => decalageY + (yMax - y) * echelle;

  // Quadrillage de pas 1 (coordonnées entières sur les nœuds, comme à l'écran) ; un nombre sur
  // deux seulement quand une unité est trop étroite pour y écrire « −10 ».
  const pasX = 1;
  const pasY = 1;
  // Nombres écrits tous les 1, 2, 5… carreaux, jamais collés, vrai « − » (audit 4e ch. 7, G5).
  const pasEtiquettes = pasGraduations(echelle, xMin, xMax, TAILLE_NOMBRES);

  // Bords de la zone tracée et position des axes — un axe hors cadre n'est pas tracé, mais ses
  // nombres restent épinglés au bord le plus proche (même principe que les graduations flottantes
  // de l'écran, `GraduationsFlottantes`) : jamais une figure sans aucune coordonnée lisible.
  const gauche = sx(xMin);
  const droite = sx(xMax);
  const haut = sy(yMax);
  const bas = sy(yMin);
  const borner = (valeur: number, min: number, max: number) => Math.min(max, Math.max(min, valeur));
  const ligneNombresX = borner(sy(0), haut, bas - 12);
  const colonneNombresY = borner(sx(0), gauche + 16, droite);

  const grille: string[] = [];
  const graduations: Graduation[] = [];
  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = sx(v);
    grille.push(`<line x1="${px.toFixed(1)}" y1="${haut.toFixed(1)}" x2="${px.toFixed(1)}" y2="${bas.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9 && Math.round(v) % pasEtiquettes === 0) graduations.push({ valeur: v, x: px, y: ligneNombresX + 11, xRepli: px, yRepli: ligneNombresX - 4, ancre: "middle", ancreRepli: "middle" });
  }
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = sy(v);
    grille.push(`<line x1="${gauche.toFixed(1)}" y1="${py.toFixed(1)}" x2="${droite.toFixed(1)}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    if (Math.abs(v) > 1e-9 && Math.round(v) % pasEtiquettes === 0) graduations.push({ valeur: v, x: colonneNombresY - 4, y: py + 3, xRepli: colonneNombresY + 4, yRepli: py + 3, ancre: "end", ancreRepli: "start" });
  }

  const axeX = yMin <= 0 && 0 <= yMax ? ligneSvg(gauche, sy(0), droite, sy(0), COULEUR_AXE, 1.4) : "";
  const axeY = xMin <= 0 && 0 <= xMax ? ligneSvg(sx(0), haut, sx(0), bas, COULEUR_AXE, 1.4) : "";

  const { centre, rayon, pointMarque } = exercice;
  const cercle = `<circle cx="${sx(centre.x).toFixed(1)}" cy="${sy(centre.y).toFixed(1)}" r="${(rayon * echelle).toFixed(1)}" fill="none" stroke="${COULEUR_CERCLE}" stroke-width="${EPAISSEUR_CERCLE}"/>`;
  // Étiquette « P » : l'énoncé papier et le corrigé nomment ce point (placée côté extérieur du cercle).
  const versExterieurX = Math.sign(pointMarque.x - centre.x);
  const versExterieurY = Math.sign(pointMarque.y - centre.y);
  const etiquetteP = `<text x="${(sx(pointMarque.x) + (versExterieurX >= 0 ? 6 : -6)).toFixed(1)}" y="${(sy(pointMarque.y) + (versExterieurY > 0 ? -6 : 12)).toFixed(1)}" font-size="11" font-weight="700" text-anchor="${versExterieurX >= 0 ? "start" : "end"}" fill="${COULEUR_POINT}">P</text>`;
  const point = `<circle cx="${sx(pointMarque.x).toFixed(1)}" cy="${sy(pointMarque.y).toFixed(1)}" r="3.2" fill="${COULEUR_POINT}"/>${etiquetteP}`;

  const segmentRayon = options.avecRayon ? ligneSvg(sx(centre.x), sy(centre.y), sx(pointMarque.x), sy(pointMarque.y), COULEUR_POINT, EPAISSEUR_SEGMENT, "dashed") : "";

  let centreCroix = "";
  if (options.avecCentre) {
    const cx = sx(centre.x);
    const cy = sy(centre.y);
    // Étiquette « C » du côté opposé à P (jamais sur le segment [CP]).
    const gaucheC = pointMarque.x >= centre.x;
    const hautC = pointMarque.y < centre.y;
    centreCroix =
      ligneSvg(cx - DEMI_CROIX_CENTRE, cy, cx + DEMI_CROIX_CENTRE, cy, COULEUR_CENTRE, 1.8) +
      ligneSvg(cx, cy - DEMI_CROIX_CENTRE, cx, cy + DEMI_CROIX_CENTRE, COULEUR_CENTRE, 1.8) +
      `<text x="${(cx + (gaucheC ? -6 : 6)).toFixed(1)}" y="${(cy + (hautC ? -6 : 13)).toFixed(1)}" font-size="11" font-weight="700" text-anchor="${gaucheC ? "end" : "start"}" fill="${COULEUR_CENTRE}">C</text>`;
  }

  // Triangle rectangle de Pythagore : écart horizontal (de C à l'angle droit), puis vertical (de
  // l'angle droit à P), chacun annoté de sa longueur.
  let ecarts = "";
  if (options.avecEcarts && pointMarque.x !== centre.x && pointMarque.y !== centre.y) {
    const coin = { x: pointMarque.x, y: centre.y };
    const dx = Math.abs(pointMarque.x - centre.x);
    const dy = Math.abs(pointMarque.y - centre.y);
    const basVersP = pointMarque.y > centre.y;
    ecarts =
      ligneSvg(sx(centre.x), sy(centre.y), sx(coin.x), sy(coin.y), COULEUR_CENTRE, 1.4, "dashed") +
      ligneSvg(sx(coin.x), sy(coin.y), sx(pointMarque.x), sy(pointMarque.y), COULEUR_CENTRE, 1.4, "dashed") +
      `<text x="${((sx(centre.x) + sx(coin.x)) / 2).toFixed(1)}" y="${(sy(coin.y) + (basVersP ? 12 : -5)).toFixed(1)}" font-size="10" font-weight="700" text-anchor="middle" fill="${COULEUR_CENTRE}">${dx}</text>` +
      `<text x="${(sx(coin.x) + (pointMarque.x > centre.x ? 5 : -5)).toFixed(1)}" y="${((sy(coin.y) + sy(pointMarque.y)) / 2 + 3).toFixed(1)}" font-size="10" font-weight="700" text-anchor="${pointMarque.x > centre.x ? "start" : "end"}" fill="${COULEUR_CENTRE}">${dy}</text>`;
  }

  // Obstacles des nombres : P et son nom, le centre et son nom, les longueurs des écarts.
  const obstacles: Boite[] = [boiteDisque(sx(pointMarque.x), sy(pointMarque.y), 3.2), boiteTexte(sx(pointMarque.x) + (versExterieurX >= 0 ? 6 : -6), sy(pointMarque.y) + (versExterieurY > 0 ? -6 : 12), "P", 11, versExterieurX >= 0 ? "start" : "end")];
  if (options.avecCentre) {
    const gaucheC = pointMarque.x >= centre.x;
    const hautC = pointMarque.y < centre.y;
    obstacles.push(boiteDisque(sx(centre.x), sy(centre.y), DEMI_CROIX_CENTRE), boiteTexte(sx(centre.x) + (gaucheC ? -6 : 6), sy(centre.y) + (hautC ? -6 : 13), "C", 11, gaucheC ? "end" : "start"));
  }
  if (options.avecEcarts && pointMarque.x !== centre.x && pointMarque.y !== centre.y) {
    const basVersP = pointMarque.y > centre.y;
    obstacles.push(
      boiteTexte((sx(centre.x) + sx(pointMarque.x)) / 2, sy(centre.y) + (basVersP ? 12 : -5), String(Math.abs(pointMarque.x - centre.x)), 10, "middle"),
      boiteTexte(sx(pointMarque.x) + (pointMarque.x > centre.x ? 5 : -5), (sy(centre.y) + sy(pointMarque.y)) / 2 + 3, String(Math.abs(pointMarque.y - centre.y)), 10, pointMarque.x > centre.x ? "start" : "end"),
    );
  }
  const labels = [graduationsSansChevauchement(graduations, obstacles, { taille: TAILLE_NOMBRES, couleur: COULEUR_AXE })];

  const cadre = `<rect x="0.5" y="0.5" width="${largeur - 1}" height="${hauteur - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`;

  return `<svg class="graphe-cyclo" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="${largeur}" height="${hauteur}" fill="#ffffff"/>
${grille.join("")}
${axeX}${axeY}
${segmentRayon}
${ecarts}
${cercle}
${point}
${centreCroix}
${labels.join("")}
${cadre}
</svg>`;
}

