// Copie 5e (6h) de `5e-4h/export5e/svgSommeInfinieSituation.ts` (56gen7 ← 5gen48, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ExerciceFigures, ExerciceRebonds, ExerciceSommeInfinie } from "../core/sommeInfinieSituation.types";

/**
 * Figures de l'énoncé de `5gen48` « Somme infinie en situation » : rebonds de la balle, triangles
 * des milieux (triangle central colorié), hexagones des milieux (une couronne sur deux). Chaînes SVG
 * AUTONOMES, sans identifiant (aucun `id`, donc rien à neutraliser pour l'anti-doublon), utilisées à
 * la fois par l'écran (`PALETTE_ECRAN`, couleurs du thème clair/sombre) et par la feuille imprimée
 * (`PALETTE_PAPIER`, couleurs littérales) : une seule construction géométrique.
 *
 * Rien n'y trahit la réponse : la figure montre la situation (hauteur de départ, aire de départ,
 * u₁ et u₂ repérés), jamais une valeur à calculer. Largeur 300 à 320 unités, lisible à 390 px.
 */

export interface PaletteFigure {
  encre: string;
  doux: string;
  accent: string;
  /** Remplissage des parties coloriées. */
  plein: string;
  /** Opacité du remplissage des parties coloriées (pleine sur papier, pour l'impression en gris). */
  opacitePlein: string;
  /** Remplissage des parties laissées blanches (hexagones). */
  vide: string;
}

export const PALETTE_ECRAN: PaletteFigure = {
  encre: "var(--color-text)",
  doux: "var(--color-text-muted)",
  accent: "var(--color-primary)",
  plein: "var(--color-primary)",
  opacitePlein: "0.45",
  vide: "var(--color-surface)",
};

export const PALETTE_PAPIER: PaletteFigure = {
  encre: "#1b1d22",
  doux: "#5c6370",
  accent: "#1d5b8f",
  plein: "#bcd3ea",
  opacitePlein: "1",
  vide: "#ffffff",
};

const POLICE = 'font-family="Archivo, Arial, Helvetica, sans-serif"';

type Point = { x: number; y: number };

const f1 = (x: number) => x.toFixed(1);

function texte(p: Point, contenu: string, couleur: string, ancre: "start" | "middle" | "end" = "middle", taille = 13, italique = false): string {
  return `<text x="${f1(p.x)}" y="${f1(p.y)}" font-size="${taille}" fill="${couleur}" text-anchor="${ancre}"${italique ? ' font-style="italic"' : ""} ${POLICE}>${contenu}</text>`;
}

function points(liste: Point[]): string {
  return liste.map((p) => `${f1(p.x)},${f1(p.y)}`).join(" ");
}

function svg(viewBox: string, largeur: number, hauteur: number, label: string, contenu: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${largeur}" height="${hauteur}" style="max-width:100%;height:auto" role="img" aria-label="${label}">${contenu}</svg>`;
}

const milieu = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

/** Nombre en texte (virgule décimale). */
function nbTexte(x: number): string {
  return String(x).replace(".", ",");
}

// ============================================================================
// Rebonds.
// ============================================================================

function figureRebonds(e: ExerciceRebonds, p: PaletteFigure): string {
  const sol = 150;
  const haut = 24;
  const H = sol - haut;
  const x0 = 62;
  const q = e.pourcent / 100;
  const r = Math.sqrt(q);
  // Rebonds visibles (hauteur ≥ 3 unités), au plus 5 ; largeur des arcs ∝ √(hauteur).
  const n = Math.max(2, Math.min(5, Math.floor(Math.log(3 / H) / Math.log(q))));
  let somme = 0;
  for (let i = 1; i <= n; i++) somme += r ** i;
  const W = 245 / somme;
  const m: string[] = [
    `<line x1="10" y1="${sol}" x2="312" y2="${sol}" stroke="${p.encre}" stroke-width="1.5"/>`,
    `<line x1="${x0}" y1="${haut}" x2="312" y2="${haut}" stroke="${p.doux}" stroke-width="1" stroke-dasharray="4 4"/>`,
    `<line x1="${x0}" y1="${haut + 6}" x2="${x0}" y2="${sol}" stroke="${p.accent}" stroke-width="2"/>`,
    `<polygon points="${points([{ x: x0 - 5, y: 84 }, { x: x0 + 5, y: 84 }, { x: x0, y: 93 }])}" fill="${p.accent}"/>`,
    `<circle cx="${x0}" cy="${haut}" r="6" fill="${p.accent}"/>`,
    texte({ x: x0 - 8, y: (haut + sol) / 2 + 4 }, `${nbTexte(e.hauteur)} ${e.unite}`, p.encre, "end", 12),
  ];
  let x = x0;
  for (let i = 1; i <= n; i++) {
    const h = H * q ** i;
    const w = W * r ** i;
    m.push(`<path d="M${f1(x)},${sol} Q${f1(x + w / 2)},${f1(sol - 2 * h)} ${f1(x + w)},${sol}" fill="none" stroke="${p.accent}" stroke-width="2"/>`);
    if (i <= 2) {
      const sommet = { x: x + w / 2, y: sol - h };
      m.push(`<line x1="${f1(sommet.x)}" y1="${f1(sommet.y)}" x2="${f1(sommet.x)}" y2="${sol}" stroke="${p.doux}" stroke-width="1" stroke-dasharray="3 3"/>`);
      m.push(texte({ x: sommet.x + 4, y: sommet.y + (h > 30 ? 16 : -4) }, `u${i === 1 ? "₁" : "₂"}`, p.encre, "start", 13, true));
    }
    x += w;
  }
  return svg("0 0 320 165", 320, 165, "Rebonds : chute depuis la hauteur de départ puis remontées de plus en plus basses", m.join(""));
}

// ============================================================================
// Triangles des milieux.
// ============================================================================

function figureTriangle(e: ExerciceFigures, p: PaletteFigure): string {
  const L = 250;
  let B: Point = { x: 25, y: 240 };
  let C: Point = { x: 25 + L, y: 240 };
  let A: Point = { x: 25 + L / 2, y: 240 - (L * Math.sqrt(3)) / 2 };
  const m: string[] = [`<polygon points="${points([A, B, C])}" fill="none" stroke="${p.encre}" stroke-width="1.5"/>`];
  const centres: Point[] = [];
  for (let k = 0; k < 6; k++) {
    const mab = milieu(A, B);
    const mac = milieu(A, C);
    const mbc = milieu(B, C);
    m.push(`<polygon points="${points([mab, mac, mbc])}" fill="${p.plein}" fill-opacity="${p.opacitePlein}" stroke="${p.encre}" stroke-width="1"/>`);
    centres.push({ x: (mab.x + mac.x + mbc.x) / 3, y: (mab.y + mac.y + mbc.y) / 3 });
    [A, B, C] = [A, mab, mac];
  }
  m.push(texte({ x: centres[0].x, y: centres[0].y + 6 }, "u₁", p.encre, "middle", 15, true));
  m.push(texte({ x: centres[1].x, y: centres[1].y + 5 }, "u₂", p.encre, "middle", 12, true));
  m.push(texte({ x: 150, y: 262 }, `Aire du grand triangle : ${e.aire} cm²`, p.doux, "middle", 12));
  return svg("0 0 300 270", 300, 270, "Triangle équilatéral partagé par les milieux, triangle central colorié, on recommence dans le triangle du haut", m.join(""));
}

// ============================================================================
// Hexagones des milieux (une couronne sur deux).
// ============================================================================

function hexagone(centre: Point, rayon: number, angleDeg: number): Point[] {
  return Array.from({ length: 6 }, (_, i) => {
    const a = ((angleDeg + 60 * i) * Math.PI) / 180;
    return { x: centre.x + rayon * Math.cos(a), y: centre.y - rayon * Math.sin(a) };
  });
}

function figureHexagones(e: ExerciceFigures, p: PaletteFigure): string {
  const O: Point = { x: 150, y: 128 };
  const R0 = 118;
  const m: string[] = [];
  let R = R0;
  for (let k = 0; k < 9; k++) {
    const colorie = k % 2 === 0;
    m.push(`<polygon points="${points(hexagone(O, R, 90 + 30 * k))}" fill="${colorie ? p.plein : p.vide}" fill-opacity="${colorie ? p.opacitePlein : "1"}" stroke="${p.encre}" stroke-width="${k === 0 ? 1.5 : 1}"/>`);
    R *= Math.sqrt(3) / 2;
  }
  // Étiquettes au milieu de la 1re et de la 2e couronne coloriée (haut de la figure).
  const yCouronne = (k: number) => {
    const Rk = R0 * (Math.sqrt(3) / 2) ** k;
    return O.y - (Rk + Rk * 0.75) / 2;
  };
  m.push(texte({ x: O.x, y: yCouronne(0) + 5 }, "u₁", p.encre, "middle", 14, true));
  m.push(texte({ x: O.x, y: yCouronne(2) + 5 }, "u₂", p.encre, "middle", 12, true));
  m.push(texte({ x: 150, y: 266 }, `Aire du 1er hexagone : ${e.aire} cm²`, p.doux, "middle", 12));
  return svg("0 0 300 275", 300, 275, "Hexagones réguliers emboîtés par les milieux, une couronne sur deux coloriée", m.join(""));
}

/** Figure de l'énoncé, `null` pour les familles sans figure (nombre périodique, poursuite). */
export function construireSvgSommeInfinie(e: ExerciceSommeInfinie, palette: PaletteFigure): string | null {
  if (e.variante === "rebonds") return figureRebonds(e, palette);
  if (e.variante === "figures") return e.sousCas === "triangle" ? figureTriangle(e, palette) : figureHexagones(e, palette);
  return null;
}
