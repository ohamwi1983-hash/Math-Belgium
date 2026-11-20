import { construireSvgFonction, type PointMarqueSvg, type ViewBoxSvg } from "../../export/svgGraph";

/**
 * Parabole y = f(x) tracée sur un quadrillage d'UNE unité, à ÉCHELLE UNIQUE en x et en y (même
 * nombre de pixels par unité sur les deux axes : une parabole comprimée ne paraît jamais étirée),
 * fenêtre aux bornes entières — figure à LIRE de gen123 (« Lire une parabole sur un graphique ») et
 * de gen125 (« Retrouver l'équation d'une parabole », variante graphique). Écran ET papier : une seule
 * source. Le générateur garantit que tout ce qui se lit (sommet, zéros, ordonnée à l'origine, point
 * donné) tombe sur un nœud de la grille. Aucun point marqué dans l'énoncé ; le corrigé passe des
 * points étiquetés et l'axe de symétrie. Pas d'identifiant SVG (anti-doublon entre séries).
 */

export const UNITE_GRILLE = 22;

export interface OptionsFigureParabole {
  points?: PointMarqueSvg[];
  /** Axe de symétrie x = … (pointillés), corrigé seulement. */
  axe?: number;
}

const COULEUR_AXE_SYMETRIE = "#c2410c";

function texteNombre(v: number): string {
  return String(v).replace("-", "−").replace(".", ",");
}

/** « (2 ; −1) ». */
export function etiquettePoint(x: number, y: number): string {
  return `(${texteNombre(x)} ; ${texteNombre(y)})`;
}

export function figureParaboleGrille(f: (x: number) => number, fenetre: ViewBoxSvg, options: OptionsFigureParabole = {}): string {
  const { xMin, xMax, yMin, yMax } = fenetre;
  const dansCadre = (x: number) => {
    const y = f(x);
    return y < yMin - 0.05 || y > yMax + 0.05 ? null : y;
  };
  const etiquetteY = yMax - yMin > 12 ? 2 : 1;
  const etiquetteX = xMax - xMin > 12 ? 2 : 1;
  const svg = construireSvgFonction(dansCadre, fenetre, {
    largeur: UNITE_GRILLE * (xMax - xMin) + 20,
    hauteur: UNITE_GRILLE * (yMax - yMin) + 20,
    classe: "graphe-cyclo",
    grille: { pasX: 1, pasY: 1, etiquetteX, etiquetteY },
    points: options.points ?? [],
    verticales: options.axe === undefined ? [] : [{ x: options.axe, couleur: COULEUR_AXE_SYMETRIE, pointilles: true }],
  });
  return courbeAuPremierPlan(fondsSousEtiquettes(svg));
}

/** La courbe repasse PAR-DESSUS les graduations : sinon le fond blanc d'une graduation de l'axe des
 * y masquait la courbe exactement là où on lit l'ordonnée à l'origine (mesuré sur iPhone 13). */
function courbeAuPremierPlan(svg: string): string {
  const lignes = svg.split("\n");
  const chemins = (lignes[4] ?? "").match(/<path d="[^"]*" fill="none" stroke="#1971c2" stroke-width="2\.2"[^>]*\/>/g) ?? [];
  if (lignes.length > 5 && chemins.length) lignes[5] = `${lignes[5]}${chemins.join("")}`;
  return lignes.join("\n");
}

/** Fond blanc sous chaque graduation de l'axe des y (une courbe qui passe juste à côté d'un « 4 »
 * le faisait lire « −4 » — même correctif que gen117). */
function fondsSousEtiquettes(svg: string): string {
  return svg.replace(/<text x="([\d.-]+)" y="([\d.-]+)" font-size="8" text-anchor="(start|end)"([^>]*)>([^<]*)<\/text>/g, (tout, xs: string, ys: string, ancre: string, _reste: string, contenu: string) => {
    const x = Number(xs);
    const y = Number(ys);
    const w = contenu.length * 4.7 + 2;
    const gauche = ancre === "end" ? x - w + 1 : x - 1;
    return `<rect x="${gauche.toFixed(1)}" y="${(y - 7).toFixed(1)}" width="${w.toFixed(1)}" height="9" fill="#ffffff" opacity="0.9"/>${tout}`;
  });
}

/** Figure insérée dans un écran : largeur fixe du SVG papier → pleine largeur disponible. */
export function figurePourEcran(svg: string): string {
  return svg.replace(/<svg ([^>]*?)width="(\d+)" height="(\d+)"/, '<svg $1width="100%" style="max-width:$2px;height:auto;display:block;margin:0 auto"');
}
