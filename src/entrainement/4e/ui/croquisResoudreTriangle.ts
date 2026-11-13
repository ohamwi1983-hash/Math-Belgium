import type { ExerciceResoudreTriangle } from "../core/resoudreTriangle.types";
import type { CoteTriangle, SommetTriangle } from "../core/triangle.types";
import { COTES, SOMMETS, angleOppose, coteOppose } from "../moteur/resolutionTriangle";
import { estDonnee, valeurTexte } from "./formatResoudreTriangle";

/**
 * Figure de gen73, À L'ÉCHELLE (proportions réelles, similitude à échelle uniforme — comme le
 * croquis de gen58, contrairement au croquis schématique de gen19) : le plus grand côté est posé
 * horizontalement en bas, un angle obtus se voit obtus. Les 3 données portent leur valeur, les 3
 * inconnues un « ? ». Une seule géométrie pour l'écran (`FigureResoudreTriangle.tsx`) et le papier
 * (`svgFigureResoudreTriangle`, attributs inline : la page exportée n'a pas le CSS de l'appli).
 */

export const LARGEUR_FIGURE = 320;
const MARGE_X = 58;
const MARGE_Y = 30;
const HAUTEUR_MAX = 250;

interface Point {
  x: number;
  y: number;
}

export interface LabelFigure {
  x: number;
  y: number;
  texte: string;
  inconnu: boolean;
  ancre: "start" | "middle" | "end";
}

export interface FigureResoudreTriangle {
  largeur: number;
  hauteur: number;
  sommets: Record<SommetTriangle, Point>;
  labelsSommets: Record<SommetTriangle, Point>;
  cotes: (LabelFigure & { cote: CoteTriangle })[];
  angles: (LabelFigure & { sommet: SommetTriangle; arc: string })[];
}

function unitaire(p: Point, q: Point): Point {
  const n = Math.hypot(q.x - p.x, q.y - p.y) || 1;
  return { x: (q.x - p.x) / n, y: (q.y - p.y) / n };
}

function r1(v: number): number {
  return Math.round(v * 10) / 10;
}

export function calculerFigure(ex: ExerciceResoudreTriangle): FigureResoudreTriangle {
  const t = ex.triangle;
  // Base : le plus grand côté, de P (gauche) à Q (droite) ; V, le sommet opposé, au-dessus.
  const base = COTES.reduce((m, c) => (t[c] > t[m] ? c : m), "a" as CoteTriangle);
  const V = angleOppose(base);
  const [P, Q] = SOMMETS.filter((s) => s !== V) as [SommetTriangle, SommetTriangle];
  const reel: Record<SommetTriangle, Point> = { A: { x: 0, y: 0 }, B: { x: 0, y: 0 }, C: { x: 0, y: 0 } };
  reel[P] = { x: 0, y: 0 };
  reel[Q] = { x: t[base], y: 0 };
  const PV = t[coteOppose(Q)];
  reel[V] = { x: PV * Math.cos((t[P] * Math.PI) / 180), y: PV * Math.sin((t[P] * Math.PI) / 180) };

  const xs = SOMMETS.map((s) => reel[s].x);
  const xMin = Math.min(...xs);
  const largeurReelle = Math.max(...xs) - xMin;
  const hauteurReelle = reel[V].y;
  let echelle = (LARGEUR_FIGURE - 2 * MARGE_X) / largeurReelle;
  if (hauteurReelle * echelle + 2 * MARGE_Y > HAUTEUR_MAX) echelle = (HAUTEUR_MAX - 2 * MARGE_Y) / hauteurReelle;
  const hauteur = Math.round(hauteurReelle * echelle + 2 * MARGE_Y);
  const decalageX = (LARGEUR_FIGURE - largeurReelle * echelle) / 2;
  const sommets = {} as Record<SommetTriangle, Point>;
  for (const s of SOMMETS) sommets[s] = { x: decalageX + (reel[s].x - xMin) * echelle, y: hauteur - MARGE_Y - reel[s].y * echelle };

  const centre = { x: SOMMETS.reduce((m, s) => m + sommets[s].x, 0) / 3, y: SOMMETS.reduce((m, s) => m + sommets[s].y, 0) / 3 };
  const labelsSommets = {} as Record<SommetTriangle, Point>;
  for (const s of SOMMETS) {
    const u = unitaire(centre, sommets[s]);
    labelsSommets[s] = { x: r1(sommets[s].x + u.x * 13), y: r1(sommets[s].y + u.y * 13) };
  }

  const cotes = COTES.map((c) => {
    const [s1, s2] = SOMMETS.filter((s) => s !== angleOppose(c)) as [SommetTriangle, SommetTriangle];
    const m = { x: (sommets[s1].x + sommets[s2].x) / 2, y: (sommets[s1].y + sommets[s2].y) / 2 };
    const d = unitaire(sommets[s1], sommets[s2]);
    let n = { x: -d.y, y: d.x };
    const versOppose = { x: sommets[angleOppose(c)].x - m.x, y: sommets[angleOppose(c)].y - m.y };
    if (n.x * versOppose.x + n.y * versOppose.y > 0) n = { x: -n.x, y: -n.y };
    const ancre: LabelFigure["ancre"] = n.x > 0.35 ? "start" : n.x < -0.35 ? "end" : "middle";
    const distance = ancre === "middle" ? 12 : 8;
    return { cote: c, x: r1(m.x + n.x * distance), y: r1(m.y + n.y * distance + (ancre === "middle" ? n.y * 2 : 0)), texte: estDonnee(ex, c) ? valeurTexte(ex, c) : "?", inconnu: !estDonnee(ex, c), ancre };
  });

  const angles = SOMMETS.map((s) => {
    const [v1, v2] = SOMMETS.filter((x) => x !== s) as [SommetTriangle, SommetTriangle];
    const u1 = unitaire(sommets[s], sommets[v1]);
    const u2 = unitaire(sommets[s], sommets[v2]);
    const plusCourt = Math.min(Math.hypot(sommets[v1].x - sommets[s].x, sommets[v1].y - sommets[s].y), Math.hypot(sommets[v2].x - sommets[s].x, sommets[v2].y - sommets[s].y));
    const r = Math.min(18, plusCourt * 0.3);
    const p1 = { x: sommets[s].x + u1.x * r, y: sommets[s].y + u1.y * r };
    const p2 = { x: sommets[s].x + u2.x * r, y: sommets[s].y + u2.y * r };
    const balayage = u1.x * u2.y - u1.y * u2.x > 0 ? 1 : 0;
    const arc = `M ${r1(p1.x)} ${r1(p1.y)} A ${r1(r)} ${r1(r)} 0 0 ${balayage} ${r1(p2.x)} ${r1(p2.y)}`;
    const bis = unitaire({ x: 0, y: 0 }, { x: u1.x + u2.x, y: u1.y + u2.y });
    const demi = (t[s] * Math.PI) / 360;
    const d = Math.min(Math.max(15 / Math.sin(demi), r + 13), Math.min(78, plusCourt * 0.55));
    return { sommet: s, arc, x: r1(sommets[s].x + bis.x * d), y: r1(sommets[s].y + bis.y * d), texte: estDonnee(ex, s) ? valeurTexte(ex, s) : "?", inconnu: !estDonnee(ex, s), ancre: "middle" as const };
  });

  return { largeur: LARGEUR_FIGURE, hauteur, sommets, labelsSommets, cotes, angles };
}

function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

/** Figure autonome pour les feuilles et évaluations (attributs SVG inline). */
export function svgFigureResoudreTriangle(ex: ExerciceResoudreTriangle): string {
  const f = calculerFigure(ex);
  const { A, B, C } = f.sommets;
  const texteSvg = (l: LabelFigure, taille: number, gras: boolean) =>
    `<text x="${l.x}" y="${l.y}" font-size="${taille}"${gras ? ' font-weight="700"' : ""} text-anchor="${l.ancre}" dominant-baseline="middle" fill="${l.inconnu ? "#c2410c" : "#1971c2"}">${echapper(l.texte)}</text>`;
  const contenu = [
    `<polygon points="${r1(A.x)},${r1(A.y)} ${r1(B.x)},${r1(B.y)} ${r1(C.x)},${r1(C.y)}" fill="none" stroke="#1f2933" stroke-width="2" stroke-linejoin="round"/>`,
    ...f.angles.map((a) => `<path d="${a.arc}" fill="none" stroke="#6b7280" stroke-width="1.3"/>`),
    ...SOMMETS.map((s) => `<text x="${f.labelsSommets[s].x}" y="${f.labelsSommets[s].y}" font-size="14" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="#1f2933">${s}</text>`),
    ...f.cotes.map((l) => texteSvg(l, 12, l.inconnu)),
    ...f.angles.map((l) => texteSvg(l, 11.5, l.inconnu)),
  ].join("");
  return `<div style="text-align:center;margin:0.5em 0;page-break-inside:avoid;break-inside:avoid;"><svg width="${f.largeur}" height="${f.hauteur}" viewBox="0 0 ${f.largeur} ${f.hauteur}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Triangle ABC : données et inconnues">${contenu}</svg><div style="font-size:0.85em;color:#57606a;">Figure aux proportions réelles</div></div>`;
}
