import type { ExerciceEquilibreForces, Vecteur2 } from "../core/equilibreForces.types";
import { f3Unites } from "../moteur/modeleEquilibreForces";

/**
 * Figures de gen90 — UNE source pour l'écran et le papier (énoncé, corrigé `figureHtml`).
 * - `construireFigureForces` : les forces appliquées en O, À L'ÉCHELLE (repère centré en O, donc
 *   aucune place réservée qui trahirait la direction de F₃). L'anneau est dessiné sur un
 *   quadrillage (1 carreau = `unite` N), où les composantes se lisent. F₃ n'est jamais dessinée
 *   dans l'énoncé : la bande du bas porte « F₃ = ? ». Option `avecF3` (écran après l'étape 3,
 *   corrigé) : F₃ est tracée.
 * - `construireFigurePolygone` : le polygone des forces (F₁, puis F₂, puis F₃ bout à bout) se
 *   referme : la somme des trois forces est le vecteur nul.
 * À l'écran, couleurs du thème (`var(--…)`, suit le mode sombre) ; sur papier, couleurs fixes.
 */

export type ThemeFigure = "ecran" | "papier";

interface Palette {
  fond: string;
  encre: string;
  doux: string;
  grille: string;
  f1: string;
  f2: string;
  f3: string;
  police: string;
}

const PALETTES: Record<ThemeFigure, Palette> = {
  ecran: {
    fond: "var(--surface)",
    encre: "var(--ink)",
    doux: "var(--ink-soft)",
    grille: "var(--ink-soft)",
    f1: "var(--accent)",
    f2: "var(--sky)",
    f3: "var(--plan)",
    police: "inherit",
  },
  papier: {
    fond: "#ffffff",
    encre: "#1f2933",
    doux: "#52606d",
    grille: "#9aa5b1",
    f1: "#c2410c",
    f2: "#1c7ed6",
    f3: "#7048e8",
    police: "Helvetica, Arial, sans-serif",
  },
};

interface Pt {
  x: number;
  y: number;
}

const LARGEUR = 360;
const POLICE = 15;
const BANDE = 30;

function r(v: number): string {
  return `${Math.round(v * 10) / 10}`;
}

/** Outils de dessin partagés par les deux figures. */
function dessin(pal: Palette) {
  const morceaux: string[] = [];
  const trait = (couleur: string, epaisseur: number, extra = "") => `style="stroke:${couleur};stroke-width:${epaisseur};fill:none;stroke-linecap:round${extra}"`;
  const texte = (x: number, y: number, contenu: string, couleur: string, opts: { ancre?: string; taille?: number; gras?: boolean; italique?: boolean } = {}) =>
    morceaux.push(
      `<text x="${r(x)}" y="${r(y)}" text-anchor="${opts.ancre ?? "middle"}" dominant-baseline="middle" style="fill:${couleur};font-size:${opts.taille ?? POLICE}px;font-family:${pal.police}${opts.gras ? ";font-weight:700" : ""}${opts.italique ? ";font-style:italic" : ""}">${contenu}</text>`,
    );
  const ligne = (a: Pt, b: Pt, couleur: string, epaisseur: number, extra = "") =>
    morceaux.push(`<line x1="${r(a.x)}" y1="${r(a.y)}" x2="${r(b.x)}" y2="${r(b.y)}" ${trait(couleur, epaisseur, extra)} />`);
  const fleche = (de: Pt, vers: Pt, couleur: string, epaisseur: number, pointe = 11) => {
    const t = Math.atan2(vers.y - de.y, vers.x - de.x);
    const larg = pointe * 0.46;
    const base = { x: vers.x - pointe * Math.cos(t), y: vers.y - pointe * Math.sin(t) };
    ligne(de, base, couleur, epaisseur);
    morceaux.push(
      `<polygon points="${r(vers.x)},${r(vers.y)} ${r(base.x - larg * Math.sin(t))},${r(base.y + larg * Math.cos(t))} ${r(base.x + larg * Math.sin(t))},${r(base.y - larg * Math.cos(t))}" style="fill:${couleur};stroke:none" />`,
    );
  };
  /** Nom de vecteur « F₁ » (lettre italique, indice, petite flèche au-dessus), centré en (cx ; cy),
   * suivi éventuellement d'un texte (« = ? »). Rend la largeur totale. */
  const etiquette = (cx: number, cy: number, indice: string, couleur: string, suite = "", ancre: "middle" | "start" = "middle") => {
    const lLettre = POLICE * 0.66;
    const lIndice = POLICE * 0.72 * 0.62 * indice.length;
    const largeur = lLettre + lIndice;
    const lSuite = suite ? suite.length * POLICE * 0.52 : 0;
    const x0 = ancre === "middle" ? cx - (largeur + lSuite) / 2 : cx;
    morceaux.push(
      `<text x="${r(x0)}" y="${r(cy)}" dominant-baseline="middle" style="fill:${couleur};font-size:${POLICE}px;font-family:${pal.police};font-weight:700"><tspan style="font-style:italic;font-family:'Times New Roman',serif;font-size:${POLICE + 2}px">F</tspan><tspan dy="4" style="font-size:${Math.round(POLICE * 0.72)}px">${indice}</tspan><tspan dy="-4">${suite}</tspan></text>`,
    );
    const yF = cy - POLICE * 0.85;
    morceaux.push(`<line x1="${r(x0 + 1)}" y1="${r(yF)}" x2="${r(x0 + largeur - 2)}" y2="${r(yF)}" ${trait(couleur, 1.2)} />`);
    morceaux.push(`<polygon points="${r(x0 + largeur + 1)},${r(yF)} ${r(x0 + largeur - 4)},${r(yF - 2.6)} ${r(x0 + largeur - 4)},${r(yF + 2.6)}" style="fill:${couleur};stroke:none" />`);
    return largeur + lSuite;
  };
  return { morceaux, trait, texte, ligne, fleche, etiquette };
}

function svg(theme: ThemeFigure, hauteur: number, contenu: string[], label: string): string {
  const facteur = theme === "papier" ? 0.82 : 1;
  const taille = theme === "papier" ? ` width="${r(LARGEUR * facteur)}" height="${r(hauteur * facteur)}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${r(hauteur)}"${taille} role="img" aria-label="${label}" style="display:block;${theme === "papier" ? `width:${r(LARGEUR * facteur)}px;` : ""}max-width:100%;height:auto;margin:8px auto">${contenu.join("")}</svg>`;
}

/** Direction (angle écran, radians) d'un vecteur mathématique (y vers le haut). */
function directionEcran(v: Vecteur2): number {
  return Math.atan2(-v.y, v.x);
}

function ecartAngulaire(a: number, b: number): number {
  let d = Math.abs(a - b) % (2 * Math.PI);
  if (d > Math.PI) d = 2 * Math.PI - d;
  return d;
}

export interface OptionsFigureForces {
  theme: ThemeFigure;
  /** Trace F₃ (écran une fois l'étape 3 close, corrigé). */
  avecF3?: boolean;
}

function panneauForces(e: ExerciceEquilibreForces, options: OptionsFigureForces): { morceaux: string[]; hauteur: number } {
  const pal = PALETTES[options.theme];
  const d = dessin(pal);
  const v3 = f3Unites(e);
  const forces = [e.f1, e.f2, v3];
  const grille = e.situation === "anneau";
  const mx = Math.max(...forces.map((v) => Math.abs(v.x)));
  const my = Math.max(...forces.map((v) => Math.abs(v.y)));

  let echelle: number;
  let hauteurFigure: number;
  let demiX: number;
  let demiY: number;
  if (grille) {
    const g = Math.max(4, mx, my) + 1;
    demiX = g;
    demiY = g;
    echelle = (LARGEUR - 40) / (2 * g);
    hauteurFigure = 2 * g * echelle + 40;
  } else {
    const marge = 40;
    demiX = Math.max(mx, 1);
    demiY = Math.max(my, 1);
    echelle = Math.min((LARGEUR - 2 * marge) / (2 * demiX), (300 - 2 * marge) / (2 * demiY));
    hauteurFigure = Math.max(170, 2 * demiY * echelle + 2 * marge);
  }
  const hauteur = hauteurFigure + BANDE;
  const O: Pt = { x: LARGEUR / 2, y: hauteurFigure / 2 };
  const ecran = (v: Vecteur2): Pt => ({ x: O.x + v.x * echelle, y: O.y - v.y * echelle });

  d.morceaux.push(`<rect x="0" y="0" width="${LARGEUR}" height="${r(hauteur)}" rx="8" style="fill:${pal.fond};stroke:none" />`);

  if (grille) {
    for (let i = -demiX; i <= demiX; i++) {
      d.ligne(ecran({ x: i, y: -demiY }), ecran({ x: i, y: demiY }), pal.grille, 0.6, ";stroke-opacity:0.45");
    }
    for (let j = -demiY; j <= demiY; j++) {
      d.ligne(ecran({ x: -demiX, y: j }), ecran({ x: demiX, y: j }), pal.grille, 0.6, ";stroke-opacity:0.45");
    }
  }
  // Axes x et y passant par O.
  const xMin = grille ? ecran({ x: -demiX, y: 0 }).x : 14;
  const xMax = grille ? ecran({ x: demiX, y: 0 }).x : LARGEUR - 14;
  const yHaut = grille ? ecran({ x: 0, y: demiY }).y : 12;
  const yBas = grille ? ecran({ x: 0, y: -demiY }).y : hauteurFigure - 12;
  d.fleche({ x: xMin, y: O.y }, { x: xMax, y: O.y }, pal.doux, 1, 7);
  d.fleche({ x: O.x, y: yBas }, { x: O.x, y: yHaut }, pal.doux, 1, 7);
  d.texte(xMax - 4, O.y + 12, "x", pal.doux, { taille: 13, italique: true });
  d.texte(O.x - 11, yHaut + 5, "y", pal.doux, { taille: 13, italique: true });

  // Forces.
  const couleurs = [pal.f1, pal.f2, pal.f3];
  const dessinees = options.avecF3 ? [0, 1, 2] : [0, 1];
  for (const i of dessinees) {
    const v = forces[i]!;
    const bout = ecran(v);
    d.fleche(O, bout, couleurs[i]!, 2.6);
    const t = directionEcran(v);
    // La petite flèche du nom dépasse au-dessus du texte : un nom placé SOUS la pointe s'en écarte davantage.
    const ecart = 17 + 7 * Math.max(0, Math.sin(t));
    d.etiquette(bout.x + ecart * Math.cos(t), bout.y + ecart * Math.sin(t) + 3, String(i + 1), couleurs[i]!);
  }

  // Point O : son nom dans la diagonale la plus éloignée des trois forces.
  const directions = forces.map(directionEcran);
  const candidats = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  const meilleur = candidats.reduce((a, b) => (Math.min(...directions.map((x) => ecartAngulaire(x, b))) > Math.min(...directions.map((x) => ecartAngulaire(x, a))) ? b : a));
  d.morceaux.push(`<circle cx="${r(O.x)}" cy="${r(O.y)}" r="3" style="fill:${pal.encre}" />`);
  d.texte(O.x + 14 * Math.cos(meilleur), O.y + 14 * Math.sin(meilleur), "O", pal.encre, { gras: true });

  // Bande du bas : l'inconnue et l'échelle.
  const yBande = hauteurFigure + BANDE / 2 - 2;
  if (!options.avecF3) d.etiquette(14, yBande, "3", pal.f3, " = ?", "start");
  d.texte(LARGEUR - 12, yBande, grille ? `1 carreau = ${e.unite} N` : "figure à l'échelle", pal.doux, { ancre: "end", taille: 13 });

  return { morceaux: d.morceaux, hauteur };
}

function panneauPolygone(e: ExerciceEquilibreForces, theme: ThemeFigure): { morceaux: string[]; hauteur: number } {
  const pal = PALETTES[theme];
  const d = dessin(pal);
  const P0 = { x: 0, y: 0 };
  const P1 = e.f1;
  const P2 = { x: e.f1.x + e.f2.x, y: e.f1.y + e.f2.y };
  const tous = [P0, P1, P2];
  const xMin = Math.min(...tous.map((p) => p.x));
  const xMax = Math.max(...tous.map((p) => p.x));
  const yMin = Math.min(...tous.map((p) => p.y));
  const yMax = Math.max(...tous.map((p) => p.y));
  const marge = 42;
  const echelle = Math.min((LARGEUR - 2 * marge) / Math.max(1e-9, xMax - xMin), (250 - 2 * marge) / Math.max(1e-9, yMax - yMin));
  const hauteurFigure = Math.max(150, (yMax - yMin) * echelle + 2 * marge);
  const decalX = (LARGEUR - (xMax - xMin) * echelle) / 2;
  const decalY = (hauteurFigure - (yMax - yMin) * echelle) / 2;
  const ecran = (p: Vecteur2): Pt => ({ x: decalX + (p.x - xMin) * echelle, y: hauteurFigure - decalY - (p.y - yMin) * echelle });
  const [A, B, C] = [ecran(P0), ecran(P1), ecran(P2)];
  const centre = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };
  const hauteur = hauteurFigure + BANDE;

  d.morceaux.push(`<rect x="0" y="0" width="${LARGEUR}" height="${r(hauteur)}" rx="8" style="fill:${pal.fond};stroke:none" />`);
  d.morceaux.push(`<polygon points="${r(A.x)},${r(A.y)} ${r(B.x)},${r(B.y)} ${r(C.x)},${r(C.y)}" style="fill:${pal.f3};fill-opacity:0.08;stroke:none" />`);

  /** Point à distance `dist` du milieu de [PQ], du côté opposé au centre du triangle. */
  const dehors = (p: Pt, q: Pt, dist: number): Pt => {
    const m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
    const n = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    let nx = -(q.y - p.y) / n;
    let ny = (q.x - p.x) / n;
    if ((centre.x - m.x) * nx + (centre.y - m.y) * ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    return { x: m.x + nx * dist, y: m.y + ny * dist };
  };

  d.fleche(A, B, pal.f1, 2.6);
  d.fleche(B, C, pal.f2, 2.6);
  d.fleche(C, A, pal.f3, 2.6);
  const cotes: [Pt, Pt, string, string][] = [
    [A, B, "1", pal.f1],
    [B, C, "2", pal.f2],
    [C, A, "3", pal.f3],
  ];
  for (const [p, q, indice, couleur] of cotes) {
    const pos = dehors(p, q, 18);
    d.etiquette(pos.x, pos.y + 3, indice, couleur);
  }
  d.texte(LARGEUR / 2, hauteurFigure + BANDE / 2 - 2, "polygone fermé : la somme des trois forces est nulle", pal.doux, { taille: 12 });
  return { morceaux: d.morceaux, hauteur };
}

export function construireFigureForces(e: ExerciceEquilibreForces, options: OptionsFigureForces): string {
  const { morceaux, hauteur } = panneauForces(e, options);
  return svg(options.theme, hauteur, morceaux, "Forces appliquées au point O");
}

export function construireFigurePolygone(e: ExerciceEquilibreForces, theme: ThemeFigure): string {
  const { morceaux, hauteur } = panneauPolygone(e, theme);
  return svg(theme, hauteur, morceaux, "Polygone des forces");
}

/** Corrigé papier : les forces (F₃ tracée) et le polygone fermé CÔTE À CÔTE, dans un seul SVG
 * (deux figures séparées s'empilaient et doublaient la hauteur du corrigé). */
export function construireFigureCorrigePapier(e: ExerciceEquilibreForces): string {
  const gauche = panneauForces(e, { theme: "papier", avecF3: true });
  const droite = panneauPolygone(e, "papier");
  const ecart = 16;
  const largeur = 2 * LARGEUR + ecart;
  const hauteur = Math.max(gauche.hauteur, droite.hauteur);
  const affichee = 600;
  const contenu = [
    `<g transform="translate(0 ${r((hauteur - gauche.hauteur) / 2)})">${gauche.morceaux.join("")}</g>`,
    `<g transform="translate(${LARGEUR + ecart} ${r((hauteur - droite.hauteur) / 2)})">${droite.morceaux.join("")}</g>`,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largeur} ${r(hauteur)}" width="${affichee}" height="${r((hauteur * affichee) / largeur)}" role="img" aria-label="Forces en O et polygone des forces" style="display:block;width:${affichee}px;max-width:100%;height:auto;margin:8px auto">${contenu.join("")}</svg>`;
}
