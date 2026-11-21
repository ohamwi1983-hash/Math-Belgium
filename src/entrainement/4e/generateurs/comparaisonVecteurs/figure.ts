import type { ExerciceComparaisonVecteurs } from "../../core/comparaisonVecteurs.types";
import { TETE_FLECHE_COMPARAISON, vecteursAffichesComparaison } from "../../ui/formatComparaisonVecteurs";
import { ETIQUETTE_PAPIER, tailleEtiquette } from "../../ui/etiquettesComparaison";
import { RATIO_GRAPHE } from "../../ui/mafsTransformation";
import { calculerViewBoxVecteurs } from "../../ui/vecteurGraph";
import type { PointAffiche, VecteurAffiche, ViewBoxTransformation } from "../../ui/vecteurGraph";

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

/** Étiquette dessinée : mêmes valeurs que celles du placement (`ETIQUETTE_PAPIER`). */
const TAILLE_POLICE_LABEL = ETIQUETTE_PAPIER.police;
const LARGEUR_FLECHE_LABEL = ETIQUETTE_PAPIER.largeurFleche;
const TETE_FLECHE_LABEL = ETIQUETTE_PAPIER.demiTete;
const ESPACE_FLECHE_LETTRE = ETIQUETTE_PAPIER.espaceFleche;
/** Même ratio empirique que `VecteurGraph.tsx::RATIO_HAUTEUR_MAJUSCULE` — positionne la petite
 * flèche juste au-dessus du sommet de la lettre, jamais une mesure DOM réelle (impossible ici, pas
 * de navigateur). */
const RATIO_HAUTEUR_MAJUSCULE = 0.72;


function echapperTexteSvg(valeur: string): string {
  return valeur.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Segment + tête de flèche triangulaire pleine pour UN vecteur tracé, de `(x1,y1)` (origine, déjà
 * en coordonnées pixel) à `(x2,y2)` (extrémité) — le trait s'arrête légèrement avant `(x2,y2)` pour
 * que la tête de flèche ne recouvre pas la pointe exacte, même principe visuel qu'un `Vector` Mafs.
 * `tete` : longueur de la tête en pixels (`TETE_FLECHE_COMPARAISON` unité × échelle, audit 4e ch. 6,
 * G13 — la tête fixe de 9,6 px valait presque une unité du quadrillage). */
function ligneVecteurSvg(x1: number, y1: number, x2: number, y2: number, couleur: string, tete: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const longueur = Math.hypot(dx, dy) || 1;
  const ux = dx / longueur;
  const uy = dy / longueur;
  const perpX = -uy;
  const perpY = ux;
  const l = Math.min(tete, longueur * 0.45);
  const baseX = x2 - ux * l;
  const baseY = y2 - uy * l;
  const p1 = `${(baseX + perpX * l * 0.5).toFixed(1)},${(baseY + perpY * l * 0.5).toFixed(1)}`;
  const p2 = `${(baseX - perpX * l * 0.5).toFixed(1)},${(baseY - perpY * l * 0.5).toFixed(1)}`;
  const p3 = `${x2.toFixed(1)},${y2.toFixed(1)}`;
  return (
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${baseX.toFixed(1)}" y2="${baseY.toFixed(1)}" stroke="${couleur}" stroke-width="2.2"/>` +
    `<polygon points="${p1} ${p2} ${p3}" fill="${couleur}"/>`
  );
}

/** Étiquette "flèche au-dessus + lettre" à `(cx,cy)` (position déjà résolue par
 * `ui/etiquettesComparaison.ts::placerEtiquettesComparaison`, convertie en pixel) — reproduction fidèle, en
 * géométrie SVG inline, de `VecteurGraph.tsx::LabelVecteurFleche` (voir le commentaire de tête pour
 * pourquoi jamais un caractère Unicode). Pas d'indice ici (labels à une seule lettre, comme tous les
 * appels de `vecteursAffichesComparaison`), donc jamais de recentrage de largeur d'indice. */
function labelVecteurFlecheSvg(cx: number, cy: number, lettre: string, couleur: string): string {
  // Lettre posée sur sa ligne de base en `cy` (comme à l'écran : le placement des étiquettes
  // suppose un texte qui MONTE depuis son ancrage — l'ancien `dominant-baseline="middle"` le
  // descendait d'une demi-lettre et détachait la flèche) ; flèche entière (trait + pointe) centrée
  // sur la lettre, juste au-dessus (audit 4e ch. 6, G13).
  const yFleche = cy - TAILLE_POLICE_LABEL * RATIO_HAUTEUR_MAJUSCULE - ESPACE_FLECHE_LETTRE;
  const xDebut = cx - LARGEUR_FLECHE_LABEL / 2;
  const xFin = cx + LARGEUR_FLECHE_LABEL / 2;
  const xBase = xFin - TETE_FLECHE_LABEL * 1.4;
  return (
    `<line x1="${xDebut.toFixed(1)}" y1="${yFleche.toFixed(1)}" x2="${(xBase + 0.5).toFixed(1)}" y2="${yFleche.toFixed(1)}" stroke="${couleur}" stroke-width="1.3"/>` +
    `<polygon points="${xFin.toFixed(1)},${yFleche.toFixed(1)} ${xBase.toFixed(1)},${(yFleche - TETE_FLECHE_LABEL).toFixed(1)} ${xBase.toFixed(1)},${(yFleche + TETE_FLECHE_LABEL).toFixed(1)}" fill="${couleur}"/>` +
    `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" font-size="${TAILLE_POLICE_LABEL}" text-anchor="middle" fill="${couleur}">${echapperTexteSvg(lettre)}</text>`
  );
}

/**
 * Fenêtre papier resserrée autour des vecteurs ET des boîtes d'étiquettes (marge habituelle de
 * `calculerViewBoxVecteurs`), comme avant la retouche du placement : la fenêtre du placement (celle
 * de l'écran) garde de larges marges vides qui rapetissaient la figure imprimée. Jamais plus grande
 * que la fenêtre du placement : l'échelle ne peut que grandir, donc tous les écarts mesurés au
 * placement grandissent avec elle (aucun chevauchement nouveau, étiquettes à taille fixe).
 */
function fenetreSerree(vecteurs: VecteurAffiche[], placement: ViewBoxTransformation, pxParUnite: number): ViewBoxTransformation {
  const coins: PointAffiche[] = vecteurs.flatMap((v) => {
    if (!v.labelPosition || !v.labelFleche) return [];
    const { largeur, dessus, dessous } = tailleEtiquette(v.labelFleche.base, ETIQUETTE_PAPIER);
    const p = v.labelPosition;
    return [
      { point: { x: p.x - largeur / 2 / pxParUnite, y: p.y + dessus / pxParUnite }, label: "" },
      { point: { x: p.x + largeur / 2 / pxParUnite, y: p.y - dessous / pxParUnite }, label: "" },
    ];
  });
  const serree = calculerViewBoxVecteurs(coins, vecteurs.map((v) => ({ ...v, labelPosition: undefined })));
  return serree.x[1] - serree.x[0] < placement.x[1] - placement.x[0] ? serree : placement;
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
  const largeur = LARGEUR_SVG;
  const hauteur = Math.round(largeur / RATIO_GRAPHE);
  const zoneX = largeur - 2 * MARGE_SVG;
  const zoneY = hauteur - 2 * MARGE_SVG;
  // Étiquettes placées dans la zone réellement tracée, à la taille réelle de l'étiquette papier ;
  // fenêtre = celle du placement (même fenêtre qu'à l'écran), jamais recalculée autour des étiquettes.
  const { vecteurs, viewBox: fenetrePlacement } = vecteursAffichesComparaison(exercice, labelsSelectionnes, {
    ...ETIQUETTE_PAPIER,
    largeurPx: zoneX,
    hauteurPx: zoneY,
  });
  const viewBox = fenetreSerree(vecteurs, fenetrePlacement, zoneX / (fenetrePlacement.x[1] - fenetrePlacement.x[0]));
  const [xMin, xMax] = viewBox.x;
  const [yMin, yMax] = viewBox.y;
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
      return `${ligneVecteurSvg(x1, y1, x2, y2, couleur, TETE_FLECHE_COMPARAISON * (zoneX / (xMax - xMin)))}${labelHtml}`;
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

