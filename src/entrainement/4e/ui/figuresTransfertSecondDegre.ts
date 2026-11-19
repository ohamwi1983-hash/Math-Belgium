import { construireSvgFonction, type PointMarqueSvg } from "../../export/svgGraph";
import { evaluerPoly, type Poly2 } from "../moteur/algebreTransfertSecondDegre";

/**
 * Figures SVG autonomes (écran et corrigé papier, sans `docx`) des nouveaux générateurs du chapitre 2
 * de 4e : parabole d'un trinôme avec ses racines marquées (Δ(m) de gen115), parabole et droite avec
 * leurs points communs (gen118). Fenêtre calculée sur les points remarquables (racines, sommet,
 * points communs) ; pas d'identifiant SVG. Montrées APRÈS l'écran dont elles trahiraient la réponse.
 */

const COULEUR_PARABOLE = "#1971c2";
const COULEUR_DROITE = "#c2410c";
const COULEUR_POINT = "#2f9e44";

function pasRond(etendue: number): number {
  const brut = etendue / 6;
  const p = 10 ** Math.floor(Math.log10(brut));
  for (const m of [1, 2, 5, 10]) if (m * p >= brut) return m * p;
  return 10 * p;
}

function fenetre(xs: number[], ys: number[]) {
  let xMin = Math.min(...xs, 0) - 1.5;
  let xMax = Math.max(...xs, 0) + 1.5;
  if (xMax - xMin < 6) {
    const c = (xMin + xMax) / 2;
    xMin = c - 3;
    xMax = c + 3;
  }
  let yMin = Math.min(...ys, 0);
  let yMax = Math.max(...ys, 0);
  const marge = Math.max(1, (yMax - yMin) * 0.15);
  yMin -= marge;
  yMax += marge;
  return { xMin: Math.floor(xMin), xMax: Math.ceil(xMax), yMin, yMax };
}

/** Parabole y = p(v) (Δ(m) en fonction de m, par exemple), racines marquées. */
export function figureTrinomeSvg(p: Poly2, racines: number[], legende: string): string {
  const xs = [...racines];
  const xSommet = -p[1] / (2 * p[0]);
  xs.push(xSommet);
  const ys = [evaluerPoly(p, xSommet), ...racines.map(() => 0)];
  const g = Math.max(...xs) + 1;
  const d = Math.min(...xs) - 1;
  ys.push(evaluerPoly(p, g), evaluerPoly(p, d));
  const vb = fenetre(xs, ys);
  const points: PointMarqueSvg[] = racines.map((r) => ({ x: r, y: 0, couleur: COULEUR_POINT }));
  return construireSvgFonction((x) => evaluerPoly(p, x), vb, {
    largeur: 340,
    hauteur: 230,
    couleurCourbe: COULEUR_PARABOLE,
    points,
    divisionsX: Math.min(12, vb.xMax - vb.xMin),
    divisionsY: 6,
    grille: { pasX: 1, pasY: pasRond(vb.yMax - vb.yMin), etiquetteX: (vb.xMax - vb.xMin) > 12 ? 2 : 1, etiquetteY: pasRond(vb.yMax - vb.yMin) },
    legende: [{ texte: legende, couleur: COULEUR_PARABOLE }],
  });
}

/** Parabole y = f(x) et droite y = g(x), points communs marqués. */
export function figureParaboleDroiteSvg(f: Poly2, g: [number, number], communs: number[], legendeF: string, legendeG: string): string {
  const xSommet = -f[1] / (2 * f[0]);
  const xs = [...communs, xSommet];
  const ys = [evaluerPoly(f, xSommet), ...communs.map((x) => g[0] * x + g[1])];
  const vb = fenetre(xs, ys);
  const points: PointMarqueSvg[] = communs.map((x) => ({ x, y: g[0] * x + g[1], couleur: COULEUR_POINT }));
  const pas = pasRond(vb.yMax - vb.yMin);
  return construireSvgFonction((x) => evaluerPoly(f, x), vb, {
    largeur: 340,
    hauteur: 260,
    couleurCourbe: COULEUR_PARABOLE,
    courbesSecondaires: [{ evaluer: (x) => g[0] * x + g[1], couleur: COULEUR_DROITE, pointilles: false }],
    points,
    grille: { pasX: 1, pasY: pas, etiquetteX: (vb.xMax - vb.xMin) > 12 ? 2 : 1, etiquetteY: pas * 2 },
    legende: [
      { texte: legendeF, couleur: COULEUR_PARABOLE },
      { texte: legendeG, couleur: COULEUR_DROITE },
    ],
  });
}
