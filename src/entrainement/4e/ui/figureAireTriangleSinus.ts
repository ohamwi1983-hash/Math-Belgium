import type { ExerciceAireTriangleSinus } from "../core/aireTriangleSinus.types";
import { anglesAttendus, cosDeg, diagonale, nomsAngleCompris, sinDeg } from "../moteur/modeleAireTriangleSinus";

/**
 * Figure À L'ÉCHELLE de gen75 (même principe que `triangleLiesSketch.ts` de gen58 : similitude à
 * échelle uniforme, jamais un croquis à sommets fixes). Géométrie pure : l'appli la rend avec les
 * classes CSS du thème (`FigureAireTriangleSinus.tsx`), l'adaptateur papier avec des attributs SVG
 * en ligne (`figureSvgPapier`). L'inconnue s'écrit « ? ».
 *
 * Famille `angle` : la figure montre UNE configuration (X̂ aigu) ; une fois le nombre d'amplitudes
 * établi (`deuxSolutions`), la seconde (X̂ obtus) s'ajoute en pointillés.
 */

export const LARGEUR_FIGURE = 300;
export const HAUTEUR_FIGURE = 220;
const MARGE = 40;
const INSET = 12;

interface P {
  x: number;
  y: number;
}

export interface LabelFigure {
  x: number;
  y: number;
  texte: string;
  role: "sommet" | "valeur" | "inconnue";
  ancre: "start" | "middle" | "end";
}

export interface FigureAireTriangle {
  largeur: number;
  hauteur: number;
  /** Polygones pleins (contour du triangle ou du quadrilatère). */
  polygones: string[];
  /** Polygones de la seconde configuration (pointillés). */
  polygonesSecondaires: string[];
  /** Segments en pointillés (diagonale). */
  pointilles: [P, P][];
  /** Arcs d'angle (attribut `d`). */
  arcs: string[];
  arcsSecondaires: string[];
  /** Équerres d'angle droit (attribut `points`). */
  equerres: string[];
  labels: LabelFigure[];
}

interface Construction {
  points: Record<string, P>;
  polygones: string[][];
  polygonesSecondaires: string[][];
  pointilles: [string, string][];
  /** Côté [p, q] étiqueté `texte`, du côté opposé à `oppose` (point de référence de l'intérieur). */
  cotes: { p: string; q: string; texte: string; role: LabelFigure["role"]; interieur: string[] }[];
  /** Angle au sommet `s` entre les demi-droites [s p) et [s q). */
  angles: { s: string; p: string; q: string; texte: string; role: LabelFigure["role"]; secondaire?: boolean }[];
}

/** Coordonnées réelles (repère orthonormé, y vers le haut). */
function construire(e: ExerciceAireTriangleSinus, deuxSolutions: boolean): Construction {
  const u = ` ${e.unite}`;
  if (e.famille === "quadrilatere") {
    const AC = diagonale(e);
    const BAC = Math.acos((e.AB * e.AB + AC * AC - e.BC * e.BC) / (2 * e.AB * AC));
    const A = { x: 0, y: 0 };
    const C = { x: AC, y: 0 };
    const B = { x: e.AB * Math.cos(BAC), y: -e.AB * Math.sin(BAC) };
    const D = { x: AC - e.CD * cosDeg(e.angleACD), y: e.CD * sinDeg(e.angleACD) };
    return {
      points: { A, B, C, D },
      polygones: [["A", "B", "C", "D"]],
      polygonesSecondaires: [],
      pointilles: [["A", "C"]],
      cotes: [
        { p: "A", q: "B", texte: `${e.AB}${u}`, role: "valeur", interieur: ["A", "B", "C"] },
        { p: "B", q: "C", texte: `${e.BC}${u}`, role: "valeur", interieur: ["A", "B", "C"] },
        { p: "C", q: "D", texte: `${e.CD}${u}`, role: "valeur", interieur: ["A", "C", "D"] },
        { p: "A", q: "C", texte: "?", role: "inconnue", interieur: ["A", "C", "D"] },
      ],
      angles: [
        { s: "B", p: "A", q: "C", texte: `${e.angleB}°`, role: "valeur" },
        { s: "C", p: "A", q: "D", texte: `${e.angleACD}°`, role: "valeur" },
      ],
    };
  }
  if (e.famille === "heron") {
    const B = { x: 0, y: 0 };
    const C = { x: e.a, y: 0 };
    const cosB = (e.a * e.a + e.c * e.c - e.b * e.b) / (2 * e.a * e.c);
    const A = { x: e.c * cosB, y: e.c * Math.sqrt(1 - cosB * cosB) };
    return {
      points: { A, B, C },
      polygones: [["A", "B", "C"]],
      polygonesSecondaires: [],
      pointilles: [],
      cotes: [
        { p: "B", q: "C", texte: `${e.a}${u}`, role: "valeur", interieur: ["A", "B", "C"] },
        { p: "A", q: "C", texte: `${e.b}${u}`, role: "valeur", interieur: ["A", "B", "C"] },
        { p: "A", q: "B", texte: `${e.c}${u}`, role: "valeur", interieur: ["A", "B", "C"] },
      ],
      angles: [],
    };
  }
  // Familles à angle compris : X au sommet, Y et Z.
  const { X, Y, Z } = nomsAngleCompris(e.sommet);
  const angle = e.famille === "angle" ? anglesAttendus(e)[0]! : e.angle;
  const pts: Record<string, P> = {
    [X]: { x: 0, y: 0 },
    [Y]: { x: e.cote1, y: 0 },
    [Z]: { x: e.cote2 * cosDeg(angle), y: e.cote2 * sinDeg(angle) },
  };
  const deux = e.famille === "angle" && deuxSolutions && anglesAttendus(e).length === 2;
  if (deux) pts[`${Z}₂`] = { x: e.cote2 * cosDeg(180 - angle), y: e.cote2 * sinDeg(180 - angle) };
  const c1 = `${e.cote1}${u}`;
  const c2 = e.famille === "cote" ? "?" : `${e.cote2}${u}`;
  const texteAngle = e.famille === "angle" ? "?" : `${e.angle}°`;
  return {
    points: pts,
    polygones: [[X, Y, Z]],
    polygonesSecondaires: deux ? [[X, Y, `${Z}₂`]] : [],
    pointilles: [],
    cotes: [
      { p: X, q: Y, texte: c1, role: "valeur", interieur: [X, Y, Z] },
      { p: X, q: Z, texte: c2, role: e.famille === "cote" ? "inconnue" : "valeur", interieur: [X, Y, Z] },
    ],
    angles: [
      { s: X, p: Y, q: Z, texte: texteAngle, role: e.famille === "angle" ? "inconnue" : "valeur" },
      ...(deux ? [{ s: X, p: Y, q: `${Z}₂`, texte: "?", role: "inconnue" as const, secondaire: true }] : []),
    ],
  };
}

function normaliser(v: P): P {
  const l = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / l, y: v.y / l };
}

export function calculerFigure(e: ExerciceAireTriangleSinus, deuxSolutions = false): FigureAireTriangle {
  const c = construire(e, deuxSolutions);
  // Rotation : le plus long côté du polygone principal à l'horizontale, le reste au-dessus.
  const principal = c.polygones[0]!;
  let meilleur: [string, string] = [principal[0]!, principal[1]!];
  let longueur = -1;
  for (let i = 0; i < principal.length; i++) {
    const a = principal[i]!;
    const b = principal[(i + 1) % principal.length]!;
    const l = Math.hypot(c.points[a]!.x - c.points[b]!.x, c.points[a]!.y - c.points[b]!.y);
    if (l > longueur) {
      longueur = l;
      meilleur = [a, b];
    }
  }
  const o = c.points[meilleur[0]]!;
  const theta = Math.atan2(c.points[meilleur[1]]!.y - o.y, c.points[meilleur[1]]!.x - o.x);
  const tourne: Record<string, P> = {};
  for (const [nom, p] of Object.entries(c.points)) {
    const dx = p.x - o.x;
    const dy = p.y - o.y;
    tourne[nom] = { x: dx * Math.cos(-theta) - dy * Math.sin(-theta), y: dx * Math.sin(-theta) + dy * Math.cos(-theta) };
  }
  // Quadrilatère : on garde la diagonale horizontale (B dessous, D dessus), plus lisible. Famille
  // `angle` : on garde [XY] horizontal, Z et Z₂ au-dessus (les deux configurations côte à côte).
  const reel = e.famille === "quadrilatere" || e.famille === "angle" ? c.points : tourne;
  const sommeY = principal.reduce((s, nom) => s + reel[nom]!.y, 0);
  if (e.famille !== "quadrilatere" && sommeY < 0) for (const p of Object.values(reel)) p.y = -p.y;

  // Similitude dans le cadre (y vers le bas en SVG).
  const xs = Object.values(reel).map((p) => p.x);
  const ys = Object.values(reel).map((p) => p.y);
  const [xMin, xMax, yMin, yMax] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const echelle = Math.min((LARGEUR_FIGURE - 2 * MARGE) / Math.max(xMax - xMin, 1e-6), (HAUTEUR_FIGURE - 2 * MARGE) / Math.max(yMax - yMin, 1e-6));
  // Hauteur ajustée au contenu (un triangle aplati ne laisse pas une bande vide).
  const hauteur = Math.max(150, Math.round((yMax - yMin) * echelle + 2 * MARGE));
  const cx = (xMin + xMax) / 2;
  const cy = (yMin + yMax) / 2;
  const px: Record<string, P> = {};
  for (const [nom, p] of Object.entries(reel)) px[nom] = { x: LARGEUR_FIGURE / 2 + (p.x - cx) * echelle, y: hauteur / 2 - (p.y - cy) * echelle };

  const pointsAttr = (noms: string[]) => noms.map((nom) => `${px[nom]!.x.toFixed(1)},${px[nom]!.y.toFixed(1)}`).join(" ");
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const labels: LabelFigure[] = [];

  // Sommets : décalés depuis le centre de gravité de tous les points.
  const tous = Object.values(px);
  const g = { x: tous.reduce((s, p) => s + p.x, 0) / tous.length, y: tous.reduce((s, p) => s + p.y, 0) / tous.length };
  for (const [nom, p] of Object.entries(px)) {
    const d = normaliser({ x: p.x - g.x, y: p.y - g.y });
    labels.push({ x: clamp(p.x + d.x * 14, INSET, LARGEUR_FIGURE - INSET), y: clamp(p.y + d.y * 14, INSET, hauteur - INSET), texte: nom, role: "sommet", ancre: "middle" });
  }

  // Côtés : au milieu, décalés vers l'extérieur du triangle de référence.
  for (const cote of c.cotes) {
    const a = px[cote.p]!;
    const b = px[cote.q]!;
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const gi = cote.interieur.reduce((s, nom) => ({ x: s.x + px[nom]!.x / cote.interieur.length, y: s.y + px[nom]!.y / cote.interieur.length }), { x: 0, y: 0 });
    let nrm = normaliser({ x: -(b.y - a.y), y: b.x - a.x });
    if (nrm.x * (m.x - gi.x) + nrm.y * (m.y - gi.y) < 0) nrm = { x: -nrm.x, y: -nrm.y };
    const decal = 11 + Math.abs(nrm.x) * 14;
    const ancre: LabelFigure["ancre"] = Math.abs(nrm.x) > 0.5 ? (nrm.x > 0 ? "start" : "end") : "middle";
    const x = m.x + nrm.x * (ancre === "middle" ? decal : 8);
    labels.push({ x: clamp(x, INSET, LARGEUR_FIGURE - INSET), y: clamp(m.y + nrm.y * decal, INSET, hauteur - INSET), texte: cote.texte, role: cote.role, ancre });
  }

  // Angles : arc (ou équerre) et valeur sur la bissectrice.
  const arcs: string[] = [];
  const arcsSecondaires: string[] = [];
  const equerres: string[] = [];
  for (const an of c.angles) {
    const s = px[an.s]!;
    const u1 = normaliser({ x: px[an.p]!.x - s.x, y: px[an.p]!.y - s.y });
    const u2 = normaliser({ x: px[an.q]!.x - s.x, y: px[an.q]!.y - s.y });
    const cosA = u1.x * u2.x + u1.y * u2.y;
    const amplitude = (Math.acos(Math.max(-1, Math.min(1, cosA))) * 180) / Math.PI;
    const r = an.secondaire ? 30 : amplitude < 40 ? 24 : 17;
    if (Math.abs(amplitude - 90) < 0.5 && an.role === "valeur") {
      const k = 10;
      equerres.push(`${s.x + u1.x * k},${s.y + u1.y * k} ${s.x + (u1.x + u2.x) * k},${s.y + (u1.y + u2.y) * k} ${s.x + u2.x * k},${s.y + u2.y * k}`);
    } else {
      const sweep = u1.x * u2.y - u1.y * u2.x > 0 ? 1 : 0;
      const d = `M ${(s.x + u1.x * r).toFixed(1)} ${(s.y + u1.y * r).toFixed(1)} A ${r} ${r} 0 0 ${sweep} ${(s.x + u2.x * r).toFixed(1)} ${(s.y + u2.y * r).toFixed(1)}`;
      (an.secondaire ? arcsSecondaires : arcs).push(d);
    }
    const bis = normaliser({ x: u1.x + u2.x, y: u1.y + u2.y });
    const dist = an.secondaire ? 44 : amplitude < 40 ? 42 : amplitude > 120 ? 22 : 31;
    labels.push({ x: clamp(s.x + bis.x * dist, INSET, LARGEUR_FIGURE - INSET), y: clamp(s.y + bis.y * dist, INSET, hauteur - INSET), texte: an.texte, role: an.role, ancre: "middle" });
  }

  return {
    largeur: LARGEUR_FIGURE,
    hauteur,
    polygones: c.polygones.map(pointsAttr),
    polygonesSecondaires: c.polygonesSecondaires.map(pointsAttr),
    pointilles: c.pointilles.map(([a, b]) => [px[a]!, px[b]!]),
    arcs,
    arcsSecondaires,
    equerres,
    labels,
  };
}

/** Aire (familles `angle`, `cote`) affichée sous la figure : rien dans le dessin lui-même. */
export function legendeFigure(e: ExerciceAireTriangleSinus, deuxSolutions: boolean): string {
  if (e.famille === "angle") {
    if (!deuxSolutions) return "Figure à l'échelle (une configuration possible)";
    return anglesAttendus(e).length === 2 ? "Figure à l'échelle : les deux configurations possibles" : "Figure à l'échelle";
  }
  return "Figure à l'échelle";
}

// ---------------------------------------------------------------------------------------------
// Version papier : SVG autonome, attributs en ligne (le document exporté n'a pas le CSS de l'appli)
// ---------------------------------------------------------------------------------------------

function echapper(v: string): string {
  return v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

export function figureSvgPapier(e: ExerciceAireTriangleSinus): string {
  const f = calculerFigure(e, false);
  const trait = "#1f2933";
  const bleu = "#1971c2";
  const orange = "#d9480f";
  const morceaux: string[] = [];
  morceaux.push(`<rect x="0" y="0" width="${f.largeur}" height="${f.hauteur}" fill="#ffffff" stroke="#d0d7de" stroke-width="1"/>`);
  for (const pts of f.polygones) morceaux.push(`<polygon points="${pts}" fill="none" stroke="${trait}" stroke-width="2" stroke-linejoin="round"/>`);
  for (const [a, b] of f.pointilles) morceaux.push(`<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${trait}" stroke-width="1.5" stroke-dasharray="5 4"/>`);
  for (const d of f.arcs) morceaux.push(`<path d="${d}" fill="none" stroke="${bleu}" stroke-width="1.5"/>`);
  for (const pts of f.equerres) morceaux.push(`<polyline points="${pts}" fill="none" stroke="${bleu}" stroke-width="1.5"/>`);
  for (const l of f.labels) {
    const couleur = l.role === "sommet" ? trait : l.role === "inconnue" ? orange : bleu;
    const taille = l.role === "sommet" ? 14 : 13;
    morceaux.push(`<text x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" font-size="${taille}" font-weight="bold" text-anchor="${l.ancre}" dominant-baseline="middle" fill="${couleur}">${echapper(l.texte)}</text>`);
  }
  const svg = `<svg width="${f.largeur}" height="${f.hauteur}" viewBox="0 0 ${f.largeur} ${f.hauteur}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Figure à l'échelle">${morceaux.join("")}</svg>`;
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}<div style="font-size:0.85em;color:#57606a;">Figure à l'échelle</div></div>`;
}
