import { construireSvgFonction, type GrilleSvg, type PointMarqueSvg, type ViewBoxSvg } from "../../export/svgGraph";

/**
 * Graphique PAPIER d'une parabole y = a(x − x_S)² + y_S (gen8 : énoncé et corrigé ; gen9 : corrigé) —
 * décision de l'utilisateur (audit 4e ch. 1, G5) : UNE SEULE ÉCHELLE pour x et y (même nombre de
 * pixels par unité sur les deux axes), sinon une compression paraissait étirée ou identique à
 * y = x². Le sommet (entier) et le point croix (x_S + 1 ; y_S + a) tombent sur des intersections :
 * lignes verticales à chaque unité (abscisses entières), horizontales tous les 1/d (d = dénominateur
 * de a). Fenêtre : au moins 2 unités du côté où la parabole s'ouvre (et le point croix dedans),
 * 1 unité de l'autre côté, l'axe Ox ajouté quand la place le permet. Graduations aux entiers.
 * Sans `docx` (importé aussi par les applis).
 */

const MARGE_SVG = 10;
const LARGEUR_UTILE_MAX = 300;
const HAUTEUR_UTILE_MAX = 260;
const UNITE_MAX = 60;
/** Écart minimal (px) entre deux lignes horizontales de la grille fine. */
const CARREAU_MIN = 8;

export interface CadrageParabole {
  viewBox: ViewBoxSvg;
  grille: GrilleSvg;
  largeur: number;
  hauteur: number;
  /** Pixels par unité (identique sur les deux axes). */
  unite: number;
}

/** Plus petit dénominateur d ≤ 12 tel que v·d soit entier. */
export function denominateur(v: number): number {
  for (let d = 1; d <= 12; d++) if (Math.abs(v * d - Math.round(v * d)) < 1e-9) return d;
  return 1;
}

export function cadrageParabole(a: number, xS: number, yS: number): CadrageParabole {
  const aAbs = Math.abs(a);
  const d = denominateur(aAbs);
  const ouvert = Math.max(2, Math.ceil(aAbs) + 1);
  const ferme = 1;
  let haut = a > 0 ? ouvert : ferme;
  let bas = a > 0 ? ferme : ouvert;
  let W = Math.min(4, Math.max(2, Math.ceil(Math.sqrt(ouvert / aAbs))));
  const uniteMin = Math.max(CARREAU_MIN * d, 16);
  const unitePour = (w: number, h: number) => Math.min(UNITE_MAX, Math.floor(LARGEUR_UTILE_MAX / (2 * w)), Math.floor(HAUTEUR_UTILE_MAX / h));
  while (W > 2 && unitePour(W, haut + bas) < uniteMin) W--;
  // Axe Ox dans le cadre quand la place le permet (sans descendre sous l'unité minimale).
  const yMin0 = yS - bas;
  const yMax0 = yS + haut;
  if (yMin0 > 0 && unitePour(W, yMax0) >= uniteMin) bas = yS;
  else if (yMax0 < 0 && unitePour(W, -yMin0) >= uniteMin) haut = -yS;
  const unite = unitePour(W, haut + bas);
  const pasX = 1;
  const pasY = 1 / d;
  return {
    viewBox: { xMin: xS - W, xMax: xS + W, yMin: yS - bas, yMax: yS + haut },
    grille: { pasX, pasY, etiquetteX: unite >= 16 ? 1 : 2, etiquetteY: unite >= 16 ? 1 : 2 },
    largeur: 2 * W * unite + 2 * MARGE_SVG,
    hauteur: (haut + bas) * unite + 2 * MARGE_SVG,
    unite,
  };
}

function nombre(v: number): string {
  const d = denominateur(v);
  const n = Math.round(Math.abs(v) * d);
  const s = d === 1 ? String(n) : `${n}/${d}`;
  return v < 0 ? `−${s}` : s;
}

/** Courbe seule (énoncé papier) ou annotée : sommet S et point croix étiquetés, y = x² en pointillés. */
export function svgParabole(a: number, xS: number, yS: number, options: { annote: boolean; classe?: string } = { annote: false }): string {
  const c = cadrageParabole(a, xS, yS);
  const f = (x: number) => a * (x - xS) ** 2 + yS;
  const points: PointMarqueSvg[] = options.annote
    ? [
        { x: xS, y: yS, forme: "point", label: `S(${nombre(xS)} ; ${nombre(yS)})`, labelPosition: a > 0 ? "dessous" : "dessus" },
        { x: xS + 1, y: yS + a, forme: "croix", label: `(${nombre(xS + 1)} ; ${nombre(yS + a)})`, labelPosition: a > 0 ? "dessus" : "dessous" },
      ]
    : [];
  return construireSvgFonction(f, c.viewBox, {
    largeur: c.largeur,
    hauteur: c.hauteur,
    classe: options.classe ?? (options.annote ? "figure-corrige" : "graphe-transformation"),
    grille: c.grille,
    points,
    courbesSecondaires: options.annote ? [{ evaluer: (x) => x * x, couleur: "#8a8f98", pointilles: true }] : undefined,
    legende: options.annote
      ? [
          { texte: "parabole donnée", couleur: "#1971c2" },
          { texte: "référence y = x²", couleur: "#8a8f98", pointilles: true },
        ]
      : undefined,
  });
}
