import type { ExerciceComparaisonVecteurs } from "../../core/comparaisonVecteurs.types";
import { vecteursAffichesComparaison } from "../../ui/formatComparaisonVecteurs";
import { RATIO_GRAPHE } from "../../ui/mafsTransformation";
import { calculerViewBoxVecteurs } from "../../ui/vecteurGraph";

/**
 * Figure papier de gen28 (vecteurs sur quadrillage ; vecteurs retenus en couleur dans le corrigé),
 * SANS `docx` : énoncé de l'adaptateur ET corrigé détaillé partagé avec l'appli. Sortie telle quelle
 * de `exportEvaluation.ts`.
 */

const LARGEUR_SVG = 340;
const MARGE_SVG = 14;
const COULEUR_GRILLE = "#e9ecef";
const COULEUR_CADRE = "#d0d7de";
const COULEUR_VECTEUR_DEFAUT = "#1971c2";

const TAILLE_POLICE_LABEL = 15;
const LARGEUR_FLECHE_LABEL = 9;
const TETE_FLECHE_LABEL = 3;
const ESPACE_FLECHE_LETTRE = 2;
/** Même ratio empirique que `VecteurGraph.tsx::RATIO_HAUTEUR_MAJUSCULE` — positionne la petite
 * flèche juste au-dessus du sommet de la lettre, jamais une mesure DOM réelle (impossible ici, pas
 * de navigateur). */
const RATIO_HAUTEUR_MAJUSCULE = 0.72;

const TETE_FLECHE_VECTEUR = 6;

function echapperTexteSvg(valeur: string): string {
  return valeur.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Segment + tête de flèche triangulaire pleine pour UN vecteur tracé, de `(x1,y1)` (origine, déjà
 * en coordonnées pixel) à `(x2,y2)` (extrémité) — le trait s'arrête légèrement avant `(x2,y2)` pour
 * que la tête de flèche ne recouvre pas la pointe exacte, même principe visuel qu'un `Vector` Mafs. */
function ligneVecteurSvg(x1: number, y1: number, x2: number, y2: number, couleur: string): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const longueur = Math.hypot(dx, dy) || 1;
  const ux = dx / longueur;
  const uy = dy / longueur;
  const perpX = -uy;
  const perpY = ux;
  const baseX = x2 - ux * TETE_FLECHE_VECTEUR * 1.6;
  const baseY = y2 - uy * TETE_FLECHE_VECTEUR * 1.6;
  const p1 = `${(baseX + perpX * TETE_FLECHE_VECTEUR * 0.55).toFixed(1)},${(baseY + perpY * TETE_FLECHE_VECTEUR * 0.55).toFixed(1)}`;
  const p2 = `${(baseX - perpX * TETE_FLECHE_VECTEUR * 0.55).toFixed(1)},${(baseY - perpY * TETE_FLECHE_VECTEUR * 0.55).toFixed(1)}`;
  const p3 = `${x2.toFixed(1)},${y2.toFixed(1)}`;
  return (
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${baseX.toFixed(1)}" y2="${baseY.toFixed(1)}" stroke="${couleur}" stroke-width="2.2"/>` +
    `<polygon points="${p1} ${p2} ${p3}" fill="${couleur}"/>`
  );
}

/** Étiquette "flèche au-dessus + lettre" à `(cx,cy)` (position déjà résolue par
 * `calculerPositionsEtiquettesSansChevauchement`, convertie en pixel) — reproduction fidèle, en
 * géométrie SVG inline, de `VecteurGraph.tsx::LabelVecteurFleche` (voir le commentaire de tête pour
 * pourquoi jamais un caractère Unicode). Pas d'indice ici (labels à une seule lettre, comme tous les
 * appels de `vecteursAffichesComparaison`), donc jamais de recentrage de largeur d'indice. */
function labelVecteurFlecheSvg(cx: number, cy: number, lettre: string, couleur: string): string {
  const yFleche = cy - TAILLE_POLICE_LABEL * RATIO_HAUTEUR_MAJUSCULE - ESPACE_FLECHE_LETTRE;
  const xDebut = cx - LARGEUR_FLECHE_LABEL / 2;
  const xFin = cx + LARGEUR_FLECHE_LABEL / 2;
  return (
    `<line x1="${xDebut.toFixed(1)}" y1="${yFleche.toFixed(1)}" x2="${xFin.toFixed(1)}" y2="${yFleche.toFixed(1)}" stroke="${couleur}" stroke-width="1.3"/>` +
    `<polygon points="${(xFin + TETE_FLECHE_LABEL).toFixed(1)},${yFleche.toFixed(1)} ${(xFin - TETE_FLECHE_LABEL * 0.4).toFixed(1)},${(yFleche - TETE_FLECHE_LABEL).toFixed(1)} ${(xFin - TETE_FLECHE_LABEL * 0.4).toFixed(1)},${(yFleche + TETE_FLECHE_LABEL).toFixed(1)}" fill="${couleur}"/>` +
    `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" font-size="${TAILLE_POLICE_LABEL}" text-anchor="middle" dominant-baseline="middle" fill="${couleur}">${echapperTexteSvg(lettre)}</text>`
  );
}

/**
 * `<svg>` autonome de la figure — un vecteur par vecteur de l'exercice, référence en rouge,
 * `labelsSelectionnes` en orange (mêmes couleurs que `vecteursAffichesComparaison`), quadrillage
 * SANS axes ni graduations numériques (voir le commentaire de tête de fichier). `labelsSelectionnes`
 * vaut `[]` pour l'énoncé (aucune sélection encore faite) et `exercice.labelsCorrects` pour la
 * correction (réponse attendue mise en évidence) — même fonction pour les deux, seul l'argument
 * change, jamais deux moteurs de tracé distincts.
 */
export function construireSvgComparaison(exercice: ExerciceComparaisonVecteurs, labelsSelectionnes: string[]): string {
  const { vecteurs } = vecteursAffichesComparaison(exercice, labelsSelectionnes);
  const viewBox = calculerViewBoxVecteurs([], vecteurs);
  const largeur = LARGEUR_SVG;
  const hauteur = Math.round(largeur / RATIO_GRAPHE);
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
  const zoneX = largeur - 2 * MARGE_SVG;
  const zoneY = hauteur - 2 * MARGE_SVG;
  const sx = (x: number) => MARGE_SVG + ((x - xMin) / (xMax - xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG + ((yMax - y) / (yMax - yMin)) * zoneY;

  // Même pas (1) sur les deux axes, comme la figure à l'écran (`VecteurGraph pasGrille={1}`) :
  // un carreau a la même taille dans les deux sens, les longueurs se comparent à l'œil.
  const pasX = 1;
  const pasY = 1;
  const grille: string[] = [];
  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = sx(v);
    grille.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_SVG}" x2="${px.toFixed(1)}" y2="${(hauteur - MARGE_SVG).toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  }
  for (let v = Math.ceil(yMin / pasY) * pasY; v <= yMax + 1e-9; v += pasY) {
    const py = sy(v);
    grille.push(`<line x1="${MARGE_SVG}" y1="${py.toFixed(1)}" x2="${(largeur - MARGE_SVG).toFixed(1)}" y2="${py.toFixed(1)}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  }

  const traces = vecteurs
    .map((v) => {
      const couleur = v.couleur ?? COULEUR_VECTEUR_DEFAUT;
      const x1 = sx(v.origine.x);
      const y1 = sy(v.origine.y);
      const x2 = sx(v.origine.x + v.vecteur.x);
      const y2 = sy(v.origine.y + v.vecteur.y);
      const centre = v.labelPosition ?? { x: v.origine.x + v.vecteur.x / 2, y: v.origine.y + v.vecteur.y / 2 };
      const labelHtml = v.labelFleche ? labelVecteurFlecheSvg(sx(centre.x), sy(centre.y), v.labelFleche.base, couleur) : "";
      return `${ligneVecteurSvg(x1, y1, x2, y2, couleur)}${labelHtml}`;
    })
    .join("");

  const svg = `<svg width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Figure de vecteurs à comparer">
<rect x="0" y="0" width="${largeur}" height="${hauteur}" fill="#ffffff" stroke="${COULEUR_CADRE}" stroke-width="1"/>
${grille.join("")}
${traces}
</svg>`;

  // `page-break-inside`/`break-inside` évitent qu'une impression coupe la figure entre deux pages —
  // même préoccupation que `boiteMoustaches/exportEvaluation.ts`/`triangleQuelconque/exportEvaluation.ts`.
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}</div>`;
}

