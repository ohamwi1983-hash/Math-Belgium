import type { GrilleSvg, ViewBoxSvg } from "./svgGraph";

/**
 * Cadrage d'un graphique PAPIER de transformation de fonction (gen8, gen10) — décision de
 * l'utilisateur : sur la feuille, l'élève n'a que la courbe (aucun point marqué, aucune coordonnée
 * donnée). Le quadrillage et le zoom doivent donc faire tomber, à eux seuls, le point
 * caractéristique ET un second point de la courbe sur des intersections de la grille.
 *
 * Le second point est le « point croix » des générateurs (argument de la fonction de référence
 * égal à 1) : ses écarts au point caractéristique sont un entier ou une fraction simple (k ou 1/k,
 * rapport EV/CV…), donc un pas de grille de 1/dénominateur sur chaque axe le place exactement sur
 * une intersection. Les graduations ne sont écrites qu'aux valeurs entières (la grille fine se lit
 * en comptant les carreaux d'une unité). C'est aussi le point qu'utilise le corrigé.
 */

export interface PointGraphique {
  x: number;
  y: number;
}

export interface OptionsCadrage {
  /** La courbe se prolonge de l'autre côté du point caractéristique, horizontalement (parabole,
   * valeur absolue, cube…) : la fenêtre est alors symétrique en x autour de lui. */
  symetrieX: boolean;
  /** Idem verticalement (symétrie centrale : cube, racine cubique, inverse). */
  symetrieY: boolean;
}

export interface CadrageLisible {
  viewBox: ViewBoxSvg;
  grille: GrilleSvg;
  largeur: number;
  hauteur: number;
}

/** Marge du tracé dans `construireSvgFonction` (svgGraph.ts) : la zone utile vaut largeur − 2·MARGE. */
const MARGE_SVG = 10;
const CARREAUX_MIN_X = 8;
const CARREAUX_MIN_Y = 6;
const CARREAU_MIN_PX = 12;
const CARREAU_MAX_PX = 30;
const LARGEUR_UTILE_MAX = 300;
const HAUTEUR_UTILE_MAX = 260;
/** Écart minimal (px) entre deux graduations écrites. */
const ESPACE_ETIQUETTES_MIN = 16;

/** Plus petit dénominateur d ≤ 12 tel que v·d soit entier (1 si aucun). */
function denominateur(v: number): number {
  for (let d = 1; d <= 12; d++) if (Math.abs(v * d - Math.round(v * d)) < 1e-9) return d;
  return 1;
}

function ppcm(a: number, b: number): number {
  const pgcd = (x: number, y: number): number => (y === 0 ? x : pgcd(y, x % y));
  return (a * b) / pgcd(a, b);
}

/** Carreaux de part et d'autre du point caractéristique sur un axe : `[côté négatif, côté positif]`. */
function etendue(ecartCarreaux: number, symetrie: boolean, minimum: number): [number, number] {
  const loin = Math.abs(ecartCarreaux);
  let negatif = (ecartCarreaux < 0 || symetrie ? loin : 0) + 1;
  let positif = (ecartCarreaux > 0 || symetrie ? loin : 0) + 1;
  // Fenêtre trop étroite pour voir la forme de la courbe : on élargit du côté où elle se trouve
  // (des deux côtés si elle est symétrique).
  while (negatif + positif < minimum) {
    if (symetrie || ecartCarreaux === 0) {
      negatif++;
      if (negatif + positif < minimum) positif++;
    } else if (ecartCarreaux > 0) positif++;
    else negatif++;
  }
  return [negatif, positif];
}

/** Pas d'écriture des graduations : 1, 2 ou 5 unités, selon la place disponible. */
function pasEtiquette(pixelsParUnite: number): number {
  if (pixelsParUnite >= ESPACE_ETIQUETTES_MIN) return 1;
  if (2 * pixelsParUnite >= ESPACE_ETIQUETTES_MIN) return 2;
  return 5;
}

export function cadrageLisible(caracteristique: PointGraphique, second: PointGraphique, options: OptionsCadrage): CadrageLisible {
  const dx = second.x - caracteristique.x;
  const dy = second.y - caracteristique.y;
  // Le point caractéristique est entier dans gen8/gen10 ; le ppcm le garde sur la grille sinon.
  const mx = ppcm(denominateur(dx), denominateur(caracteristique.x));
  const my = ppcm(denominateur(dy), denominateur(caracteristique.y));
  const pasX = 1 / mx;
  const pasY = 1 / my;
  const [gauche, droite] = etendue(Math.round(dx * mx), options.symetrieX, CARREAUX_MIN_X);
  const [bas, haut] = etendue(Math.round(dy * my), options.symetrieY, CARREAUX_MIN_Y);
  const carreauxX = gauche + droite;
  const carreauxY = bas + haut;
  const carreau = Math.max(CARREAU_MIN_PX, Math.min(CARREAU_MAX_PX, Math.floor(Math.min(LARGEUR_UTILE_MAX / carreauxX, HAUTEUR_UTILE_MAX / carreauxY))));
  return {
    viewBox: {
      xMin: caracteristique.x - gauche * pasX,
      xMax: caracteristique.x + droite * pasX,
      yMin: caracteristique.y - bas * pasY,
      yMax: caracteristique.y + haut * pasY,
    },
    grille: { pasX, pasY, etiquetteX: pasEtiquette(carreau * mx), etiquetteY: pasEtiquette(carreau * my) },
    largeur: carreauxX * carreau + 2 * MARGE_SVG,
    hauteur: carreauxY * carreau + 2 * MARGE_SVG,
  };
}
