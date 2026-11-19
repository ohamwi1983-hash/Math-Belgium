/**
 * Figure SVG statique d'une boîte à moustaches (1 ou 2 séries) — sortie de `exportEvaluation.ts`
 * (qui importe `docx`) pour que le corrigé détaillé (`corrigeDetaille.ts`), importé aussi par les
 * générateurs interactifs gen36 et gen35, n'embarque jamais `docx`. Code inchangé.
 */
import type { CinqNombres, PlageAxe } from "../../core/boiteMoustaches.types";
import { formatNombreGraphique } from "../../../export/svgGraph";
import {
  DEMI_HAUTEUR_BOITE,
  DEMI_HAUTEUR_MOUSTACHE,
  MANTISSES_GRILLE_BOITE,
  calculerViewBoxBoiteMoustaches,
  cibleNombreLignesXAdaptative,
  ratioGraphe,
  yLigne,
} from "../../ui/boiteMoustachesGraph";
import { calculerPasGrille, etendreLargeurXPourEtiquettes } from "../../ui/mafsTransformation";

const LARGEUR_SVG = 360;
const MARGE_SVG = 10;
const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_Q1 = "#2f9e44";
const COULEUR_MEDIANE = "#7048e8";
const COULEUR_Q3 = "#1971c2";
const COULEUR_NEUTRE = "#212529";
const EPAISSEUR_STANDARD = 1.4;
const EPAISSEUR_ACCENTUEE = 2.4;

const CLES_ORDRE: (keyof CinqNombres)[] = ["min", "q1", "mediane", "q3", "max"];
const COULEUR_PAR_CLE: Record<keyof CinqNombres, string> = {
  min: COULEUR_NEUTRE,
  q1: COULEUR_Q1,
  mediane: COULEUR_MEDIANE,
  q3: COULEUR_Q3,
  max: COULEUR_NEUTRE,
};

function formatNombre(valeur: number): string {
  return (Number.isInteger(valeur) ? String(valeur) : valeur.toFixed(2).replace(/\.?0+$/, "")).replace(".", ",").replace("-", "−");
}

function echapperTexteSvg(valeur: string): string {
  return valeur.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function ligneSvg(x1: number, y1: number, x2: number, y2: number, couleur: string, epaisseur: number): string {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${couleur}" stroke-width="${epaisseur}"/>`;
}

function texteSvg(x: number, y: number, couleur: string, contenu: string, ancre: "middle" | "end", taille = 9, gras = false): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${taille}"${gras ? ' font-weight="bold"' : ""} text-anchor="${ancre}" fill="${couleur}">${echapperTexteSvg(contenu)}</text>`;
}

export interface LigneBoiteEvaluation {
  valeurs: CinqNombres;
  /** "A"/"B" — variante `comparaison` uniquement, affiché à GAUCHE de la boîte (voir commentaire de
   * tête de fichier : jamais au-dessus, pour ne jamais chevaucher l'étiquette numérique de la
   * médiane en mode `avecEtiquettes`). */
  label?: string;
}

/** Une boîte tracée pour une `ligne` donnée (`index`/`nombreLignes` — voir `yLigne`,
 * `ui/boiteMoustachesGraph.ts`) : 2 moustaches + leurs chapeaux + le contour (haut/bas neutres,
 * bord gauche Q1 vert, bord droit Q3 bleu, médiane violette) — même disposition que
 * `components/BoiteMoustachesGraph.tsx`. `avecEtiquettes` ajoute les 5 valeurs numériques en
 * couleur assortie, alternées haut/bas par index (même principe que l'écran : 2 marqueurs ADJACENTS
 * peuvent être aussi rapprochés qu'1 unité de donnée).
 */
function construireUneBoiteSvg(
  ligne: LigneBoiteEvaluation,
  index: number,
  nombreLignes: 1 | 2,
  sx: (x: number) => number,
  sy: (y: number) => number,
  avecEtiquettes: boolean,
): string {
  const y = yLigne(index, nombreLignes);
  const { min, q1, mediane, q3, max } = ligne.valeurs;
  const py = sy(y);
  const yHaut = sy(y + DEMI_HAUTEUR_BOITE);
  const yBas = sy(y - DEMI_HAUTEUR_BOITE);
  const morceaux: string[] = [];

  // Moustaches + chapeaux — toujours neutres.
  morceaux.push(ligneSvg(sx(min), py, sx(q1), py, COULEUR_NEUTRE, EPAISSEUR_STANDARD));
  morceaux.push(ligneSvg(sx(q3), py, sx(max), py, COULEUR_NEUTRE, EPAISSEUR_STANDARD));
  morceaux.push(ligneSvg(sx(min), sy(y - DEMI_HAUTEUR_MOUSTACHE), sx(min), sy(y + DEMI_HAUTEUR_MOUSTACHE), COULEUR_NEUTRE, EPAISSEUR_STANDARD));
  morceaux.push(ligneSvg(sx(max), sy(y - DEMI_HAUTEUR_MOUSTACHE), sx(max), sy(y + DEMI_HAUTEUR_MOUSTACHE), COULEUR_NEUTRE, EPAISSEUR_STANDARD));

  // Contour de la boîte — haut/bas neutres, bord gauche (Q1) vert, bord droit (Q3) bleu.
  morceaux.push(ligneSvg(sx(q1), yHaut, sx(q3), yHaut, COULEUR_NEUTRE, EPAISSEUR_STANDARD));
  morceaux.push(ligneSvg(sx(q1), yBas, sx(q3), yBas, COULEUR_NEUTRE, EPAISSEUR_STANDARD));
  morceaux.push(ligneSvg(sx(q1), yBas, sx(q1), yHaut, COULEUR_Q1, EPAISSEUR_ACCENTUEE));
  morceaux.push(ligneSvg(sx(q3), yBas, sx(q3), yHaut, COULEUR_Q3, EPAISSEUR_ACCENTUEE));

  // Médiane — trait violet, plus épais que le reste du contour.
  morceaux.push(ligneSvg(sx(mediane), yBas, sx(mediane), yHaut, COULEUR_MEDIANE, EPAISSEUR_ACCENTUEE));

  if (ligne.label) {
    morceaux.push(texteSvg(sx(min) - 8, py + 4, COULEUR_NEUTRE, ligne.label, "end", 12, true));
  }

  if (avecEtiquettes) {
    const xParCle: Record<keyof CinqNombres, number> = { min, q1, mediane, q3, max };
    CLES_ORDRE.forEach((cle, i) => {
      const enHaut = i % 2 === 0;
      const yEtiquette = enHaut ? yHaut - 6 : yBas + 14;
      morceaux.push(texteSvg(sx(xParCle[cle]), yEtiquette, COULEUR_PAR_CLE[cle], formatNombre(xParCle[cle]), "middle"));
    });
  }

  return morceaux.join("");
}

/**
 * `<svg>` autonome d'une boîte à moustaches (1 ou 2 lignes selon `lignes.length`) — `lignes: []`
 * (variante `construction`, énoncé) rend un axe gradué VIERGE avec une simple ligne de base à `y=0`
 * comme repère horizontal, sans aucune boîte tracée (voir commentaire de tête de fichier).
 */
export function construireSvgBoiteMoustaches(bornePlage: PlageAxe, lignes: LigneBoiteEvaluation[], avecEtiquettes = false): string {
  const nombreLignes: 1 | 2 = lignes.length === 2 ? 2 : 1;
  const ratio = ratioGraphe(nombreLignes);
  const largeur = LARGEUR_SVG;
  const hauteur = Math.round(largeur / ratio);

  const viewBox = calculerViewBoxBoiteMoustaches(bornePlage, nombreLignes);
  const cibleNombreLignesX = cibleNombreLignesXAdaptative(bornePlage);
  const viewBoxEtendu = { x: etendreLargeurXPourEtiquettes(viewBox, cibleNombreLignesX, ratio, MANTISSES_GRILLE_BOITE).x, y: viewBox.y };
  const [xMin, xMax] = viewBoxEtendu.x;
  const [yMin, yMax] = viewBoxEtendu.y;

  const zoneX = largeur - 2 * MARGE_SVG;
  const zoneY = hauteur - 2 * MARGE_SVG;
  const sx = (x: number) => MARGE_SVG + ((x - xMin) / (xMax - xMin)) * zoneX;
  const sy = (y: number) => MARGE_SVG + ((yMax - y) / (yMax - yMin)) * zoneY;

  const pasX = calculerPasGrille(xMax - xMin, cibleNombreLignesX, MANTISSES_GRILLE_BOITE);
  const grille: string[] = [];
  for (let v = Math.ceil(xMin / pasX) * pasX; v <= xMax + 1e-9; v += pasX) {
    const px = sx(v);
    grille.push(`<line x1="${px.toFixed(1)}" y1="${MARGE_SVG}" x2="${px.toFixed(1)}" y2="${hauteur - MARGE_SVG}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
    grille.push(texteSvg(px, hauteur - MARGE_SVG + 11, COULEUR_AXE, formatNombreGraphique(v), "middle", 8));
  }

  const cadre = `<rect x="0.5" y="0.5" width="${largeur - 1}" height="${hauteur - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`;

  let contenu: string;
  if (lignes.length === 0) {
    // Axe vierge (variante "construction", énoncé) — simple ligne de base à y=0, aucune boîte.
    const py0 = sy(yLigne(0, 1));
    contenu = ligneSvg(sx(xMin), py0, sx(xMax), py0, COULEUR_AXE, EPAISSEUR_STANDARD);
  } else {
    contenu = lignes.map((ligne, index) => construireUneBoiteSvg(ligne, index, nombreLignes, sx, sy, avecEtiquettes)).join("");
  }

  return `<svg class="graphe-cyclo" width="${largeur}" height="${hauteur}" viewBox="0 0 ${largeur} ${hauteur}" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="${largeur}" height="${hauteur}" fill="#ffffff"/>
${grille.join("")}
${contenu}
${cadre}
</svg>`;
}
