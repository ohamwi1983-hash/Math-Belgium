import type { ExerciceCarresEmboites, ExerciceTrianglesZigzag } from "../core5e/suitesClassiques.types";

/**
 * Figures de 5gen17 pour la feuille d'exercices / d'évaluation imprimée — zigzag dans le triangle
 * équilatéral, partage du carré (partie a), carrés emboîtés (partie b). Chaînes SVG AUTONOMES
 * (aucun DOM React, couleurs littérales pour l'impression), injectées via `SectionExercice.enteteHtml`
 * et `EtapeCorrection.figureHtml`. Même construction géométrique que l'écran interactif
 * (`components5e/FigureSuiteClassique.tsx`, que l'écran garde tel quel) : mêmes points, mêmes
 * étiquettes, même ordre de cases coloriées.
 */

const ENCRE = "#1b1d22";
const DOUX = "#5c6370";
const ACCENT = "#1d5b8f";
const FOND_ACCENT = "#dbe8f4";
const POLICE = 'font-family="Archivo, Arial, Helvetica, sans-serif"';

type Point = { x: number; y: number };

function texteSvg(p: Point, contenu: string, ancre: "start" | "middle" | "end" = "middle", couleur = ENCRE, taille = 13, italique = true): string {
  return `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" font-size="${taille}" fill="${couleur}" text-anchor="${ancre}"${italique ? ' font-style="italic"' : ""} ${POLICE}>${contenu}</text>`;
}

function points(liste: Point[]): string {
  return liste.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}

function projeter(p: Point, o: Point, u: Point): Point {
  const t = (p.x - o.x) * u.x + (p.y - o.y) * u.y;
  return { x: o.x + t * u.x, y: o.y + t * u.y };
}

function unitaire(a: Point, b: Point): Point {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  return { x: (b.x - a.x) / d, y: (b.y - a.y) / d };
}

function svg(viewBox: string, largeur: number, hauteur: number, label: string, contenu: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${largeur}" height="${hauteur}" role="img" aria-label="${label}">${contenu}</svg>`;
}

/** Triangle équilatéral ABC (côté c) et zigzag B → H₁ → H₂ → … ; T₁ grisé. */
export function construireSvgZigzag(exercice: ExerciceTrianglesZigzag): string {
  const L = 250;
  const C: Point = { x: 30, y: 245 };
  const B: Point = { x: C.x + L, y: C.y };
  const A: Point = { x: C.x + L / 2, y: C.y - (L * Math.sqrt(3)) / 2 };
  const versA = unitaire(C, A);
  const versB = unitaire(C, B);
  const pts: Point[] = [B];
  for (let k = 1; k <= 7; k++) pts.push(projeter(pts[k - 1], C, k % 2 === 1 ? versA : versB));
  const angleDroit = (h: Point, precedent: Point) => {
    const s = 7;
    const d = unitaire(h, C);
    const n = unitaire(h, precedent);
    return points([
      { x: h.x + s * d.x, y: h.y + s * d.y },
      { x: h.x + s * (d.x + n.x), y: h.y + s * (d.y + n.y) },
      { x: h.x + s * n.x, y: h.y + s * n.y },
    ]);
  };
  const m: string[] = [
    `<polygon points="${points([C, B, pts[1]])}" fill="${FOND_ACCENT}"/>`,
    `<polygon points="${points([A, B, C])}" fill="none" stroke="${ENCRE}" stroke-width="1.5"/>`,
    `<polyline points="${points(pts)}" fill="none" stroke="${ACCENT}" stroke-width="2.4" stroke-linejoin="round"/>`,
    `<polyline points="${angleDroit(pts[1], pts[0])}" fill="none" stroke="${DOUX}" stroke-width="1"/>`,
    `<polyline points="${angleDroit(pts[2], pts[1])}" fill="none" stroke="${DOUX}" stroke-width="1"/>`,
    texteSvg({ x: A.x, y: A.y - 8 }, "A"),
    texteSvg({ x: B.x + 6, y: B.y + 16 }, "B", "start"),
    texteSvg({ x: C.x - 6, y: C.y + 16 }, "C", "end"),
    texteSvg({ x: pts[1].x - 16, y: pts[1].y }, "H₁"),
    texteSvg({ x: pts[2].x, y: pts[2].y + 17 }, "H₂"),
    texteSvg({ x: pts[3].x - 16, y: pts[3].y + 2 }, "H₃"),
    texteSvg({ x: (C.x + B.x) / 2 + 40, y: C.y + 22 }, `${exercice.cote} cm`, "middle", DOUX, 12, false),
    texteSvg({ x: (B.x + pts[1].x) / 2 + 8, y: (B.y + pts[1].y) / 2 - 6 }, "ℓ₁", "start", ACCENT),
    texteSvg({ x: C.x + 70, y: C.y - 30 }, "T₁", "middle", DOUX, 12),
  ];
  return svg("0 0 310 275", 248, 220, "Triangle équilatéral ABC et zigzag B, H1, H2, H3", m.join(""));
}

/** Cases coloriées (ligne, colonne depuis le haut-gauche) — jamais la case du coin haut droit, où
 * la construction recommence. Même ordre que l'écran. */
function casesColoriees(cote: number, colorees: number): [number, number][] {
  const ordre: [number, number][] =
    cote === 2
      ? [
          [1, 0],
          [0, 0],
          [1, 1],
        ]
      : [
          [2, 0],
          [1, 1],
          [0, 0],
          [2, 2],
          [1, 0],
          [2, 1],
          [0, 1],
          [1, 2],
        ];
  return ordre.slice(0, colorees);
}

/** Partie a : carré d'aire 1 partagé en p, c cases coloriées, construction répétée dans le coin. */
export function construireSvgPartageCarre(exercice: ExerciceCarresEmboites): string {
  const cote = Math.round(Math.sqrt(exercice.partsA));
  const m: string[] = [`<rect x="20" y="20" width="240" height="240" fill="none" stroke="${ENCRE}" stroke-width="1.6"/>`];
  let x = 20;
  const y = 20;
  let taille = 240;
  for (let niveau = 0; niveau < 4; niveau++) {
    const pas = taille / cote;
    for (const [ligne, colonne] of casesColoriees(cote, exercice.coloreesA)) {
      m.push(`<rect x="${(x + colonne * pas).toFixed(2)}" y="${(y + ligne * pas).toFixed(2)}" width="${pas.toFixed(2)}" height="${pas.toFixed(2)}" fill="${ACCENT}" fill-opacity="0.75"/>`);
    }
    for (let i = 1; i < cote; i++) {
      const largeurTrait = niveau === 0 ? 1.2 : 0.8;
      m.push(`<line x1="${(x + i * pas).toFixed(2)}" y1="${y}" x2="${(x + i * pas).toFixed(2)}" y2="${(y + taille).toFixed(2)}" stroke="${ENCRE}" stroke-width="${largeurTrait}"/>`);
      m.push(`<line x1="${x.toFixed(2)}" y1="${(y + i * pas).toFixed(2)}" x2="${(x + taille).toFixed(2)}" y2="${(y + i * pas).toFixed(2)}" stroke="${ENCRE}" stroke-width="${largeurTrait}"/>`);
    }
    x = x + (cote - 1) * pas;
    taille = pas;
  }
  m.push(texteSvg({ x: 140, y: 276 }, "aire du grand carré : 1", "middle", DOUX, 12, false));
  return svg("0 0 280 284", 210, 213, `Carré partagé en ${exercice.partsA}, ${exercice.coloreesA} case(s) coloriée(s) à chaque étape`, m.join(""));
}

/** Partie b : carrés emboîtés obtenus en joignant les milieux des côtés. */
export function construireSvgCarresMilieux(exercice: ExerciceCarresEmboites): string {
  let sommets: Point[] = [
    { x: 30, y: 20 },
    { x: 250, y: 20 },
    { x: 250, y: 240 },
    { x: 30, y: 240 },
  ];
  const m: string[] = [];
  for (let i = 0; i < 6; i++) {
    m.push(`<polygon points="${points(sommets)}" fill="${i % 2 === 1 ? FOND_ACCENT : "none"}" stroke="${i === 0 ? ENCRE : ACCENT}" stroke-width="${i === 0 ? 1.6 : 1.3}"/>`);
    const courants = sommets;
    sommets = courants.map((p, j) => {
      const q = courants[(j + 1) % 4];
      return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    });
  }
  m.push(texteSvg({ x: 140, y: 262 }, `côté ${exercice.coteB} cm`, "middle", DOUX, 12, false));
  return svg("0 0 280 270", 210, 203, "Carrés emboîtés obtenus en joignant les milieux des côtés", m.join(""));
}

/** Les deux figures des carrés côte à côte (énoncé : parties a et b). */
export function construireSvgCarresEmboites(exercice: ExerciceCarresEmboites): string {
  return `<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;align-items:flex-end"><div style="text-align:center;font-size:12px">${construireSvgPartageCarre(exercice)}<div>Partie a</div></div><div style="text-align:center;font-size:12px">${construireSvgCarresMilieux(exercice)}<div>Partie b</div></div></div>`;
}
