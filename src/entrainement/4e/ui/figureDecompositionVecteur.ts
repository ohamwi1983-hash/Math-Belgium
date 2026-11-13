import type { ExerciceGraphique, Vec2 } from "../core/decompositionVecteur.types";
import { cartesien, pointDe } from "../moteur/modeleDecompositionVecteur";

/**
 * Figure de gen82 — UNE seule fonction pour l'écran et le papier (énoncé, corrigé `figureHtml`).
 * Réseau / quadrillage : lignes du réseau, points nommés (P, Q et trois lettres proposées), \vec{v}
 * et \vec{w} dessinés à part depuis un nœud libre. Parallélogramme découpé, hexagone : côtés et
 * segments intérieurs, tous les points nommés, \vec{v} et \vec{w} dessinés sur leurs représentants.
 * \vec{u} = \vec{PQ} en trait épais.
 * Options : `droiteV` (aide de l'écran 1) trace la droite passant par P parallèle à \vec{v} ;
 * `construction` (après l'écran 1, et dans le corrigé) dessine \vec{PM} (couleur de \vec{v}) et
 * \vec{MQ} (couleur de \vec{w}) en pointillés fléchés — le parallélogramme en sens inverse.
 * À l'écran, couleurs du thème (`var(--…)`, suit le mode sombre) ; sur papier, couleurs fixes.
 */

export type ThemeFigure = "ecran" | "papier";

export interface OptionsFigureDecomposition {
  theme: ThemeFigure;
  droiteV?: boolean;
  construction?: boolean;
}

interface Palette {
  fond: string;
  encre: string;
  doux: string;
  grille: string;
  u: string;
  v: string;
  w: string;
  police: string;
}

const PALETTES: Record<ThemeFigure, Palette> = {
  ecran: {
    fond: "var(--surface)",
    encre: "var(--ink)",
    doux: "var(--ink-soft)",
    grille: "var(--line)",
    u: "var(--accent)",
    v: "var(--good)",
    w: "var(--sky)",
    police: "inherit",
  },
  papier: {
    fond: "#ffffff",
    encre: "#1f2933",
    doux: "#52606d",
    grille: "#c3ccd4",
    u: "#c2410c",
    v: "#2b8a3e",
    w: "#1c7ed6",
    police: "Helvetica, Arial, sans-serif",
  },
};

const LARGEUR = 360;
const HAUTEUR_MAX = 290;
const MARGE = 22;
const POLICE = 15;

function r(x: number): string {
  return `${Math.round(x * 10) / 10}`;
}

interface Segment {
  a: Vec2;
  b: Vec2;
}

function distanceSegment(p: Vec2, s: Segment): number {
  const dx = s.b.x - s.a.x;
  const dy = s.b.y - s.a.y;
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - s.a.x) * dx + (p.y - s.a.y) * dy) / l2));
  return Math.hypot(p.x - (s.a.x + t * dx), p.y - (s.a.y + t * dy));
}

export function construireFigureDecomposition(e: ExerciceGraphique, options: OptionsFigureDecomposition): string {
  const pal = PALETTES[options.theme];
  const reseau = e.famille === "reseau" || e.famille === "quadrillage";

  // Points mathématiques (cartésien, y vers le haut) qui fixent le cadre.
  const cadre: Vec2[] = reseau
    ? [cartesien(e, 0, 0), cartesien(e, e.iMax, 0), cartesien(e, 0, e.jMax), cartesien(e, e.iMax, e.jMax)]
    : e.points.map((p) => cartesien(e, p.i, p.j));
  const xMin = Math.min(...cadre.map((p) => p.x));
  const xMax = Math.max(...cadre.map((p) => p.x));
  const yMin = Math.min(...cadre.map((p) => p.y));
  const yMax = Math.max(...cadre.map((p) => p.y));
  const margeInt = reseau ? MARGE : MARGE + 10;
  const echelle = Math.min((LARGEUR - 2 * margeInt) / (xMax - xMin), (HAUTEUR_MAX - 2 * margeInt) / (yMax - yMin), e.famille === "hexagone" ? 110 : Infinity);
  const hauteur = (yMax - yMin) * echelle + 2 * margeInt;
  const decalX = (LARGEUR - (xMax - xMin) * echelle) / 2;
  const ecran = (p: Vec2): Vec2 => ({ x: decalX + (p.x - xMin) * echelle, y: hauteur - margeInt - (p.y - yMin) * echelle });
  const ij = (i: number, j: number) => ecran(cartesien(e, i, j));
  const nomme = (nom: string) => {
    const p = pointDe(e, nom);
    return ij(p.i, p.j);
  };

  const fond: string[] = [];
  const traits: string[] = [];
  const dessus: string[] = [];
  const obstacles: Segment[] = [];
  const occupes: Vec2[] = [];

  const style = (couleur: string, epaisseur: number, extra = "") => `style="stroke:${couleur};stroke-width:${epaisseur};fill:none;stroke-linecap:round${extra}"`;
  const ligne = (cible: string[], a: Vec2, b: Vec2, couleur: string, epaisseur: number, extra = "") =>
    cible.push(`<line x1="${r(a.x)}" y1="${r(a.y)}" x2="${r(b.x)}" y2="${r(b.y)}" ${style(couleur, epaisseur, extra)} />`);
  const halo = `paint-order:stroke;stroke:${pal.fond};stroke-width:4px;stroke-linejoin:round`;
  const texte = (x: number, y: number, contenu: string, couleur: string, taille = POLICE) =>
    `<text x="${r(x)}" y="${r(y)}" text-anchor="middle" dominant-baseline="central" style="fill:${couleur};font-size:${taille}px;font-family:${pal.police};font-weight:700;${halo}">${contenu}</text>`;

  fond.push(`<rect x="0" y="0" width="${LARGEUR}" height="${r(hauteur)}" rx="8" style="fill:${pal.fond};stroke:none" />`);

  // Lignes de la figure.
  if (reseau) {
    for (let i = 0; i <= e.iMax; i++) ligne(fond, ij(i, 0), ij(i, e.jMax), pal.grille, 1);
    for (let j = 0; j <= e.jMax; j++) ligne(fond, ij(0, j), ij(e.iMax, j), pal.grille, 1);
  } else {
    const segs: [string, string][] =
      e.famille === "parallelogramme"
        ? [
            ["A", "B"],
            ["B", "C"],
            ["C", "D"],
            ["D", "A"],
            ["I", "K"],
            ["L", "J"],
          ]
        : (() => {
            // Hexagone : contour (sommets voisins) et les trois grandes diagonales (sommets opposés).
            const sommets = e.points.filter((p) => p.nom !== "O");
            const s: [string, string][] = [];
            for (const p of sommets) {
              for (const q of sommets) {
                if (p.nom >= q.nom) continue;
                const d = [q.i - p.i, q.j - p.j];
                const voisins = [
                  [1, 0],
                  [0, 1],
                  [-1, 1],
                  [-1, 0],
                  [0, -1],
                  [1, -1],
                ].some(([x, y]) => x === d[0] && y === d[1]);
                const opposes = p.i === -q.i && p.j === -q.j;
                if (voisins || opposes) s.push([p.nom, q.nom]);
              }
            }
            return s;
          })();
    for (const [a, b] of segs) {
      ligne(fond, nomme(a), nomme(b), pal.doux, 1.4);
      obstacles.push({ a: nomme(a), b: nomme(b) });
    }
  }

  // Flèche (géométrie pure : rendu identique écran / papier).
  const fleche = (cible: string[], de: Vec2, vers: Vec2, couleur: string, epaisseur: number, pointilles = false) => {
    const t = Math.atan2(vers.y - de.y, vers.x - de.x);
    const long = 11;
    const larg = 5;
    const base = { x: vers.x - long * Math.cos(t), y: vers.y - long * Math.sin(t) };
    ligne(cible, de, base, couleur, epaisseur, pointilles ? ";stroke-dasharray:6 4" : "");
    cible.push(
      `<polygon points="${r(vers.x)},${r(vers.y)} ${r(base.x - larg * Math.sin(t))},${r(base.y + larg * Math.cos(t))} ${r(base.x + larg * Math.sin(t))},${r(base.y - larg * Math.cos(t))}" style="fill:${couleur};stroke:none" />`,
    );
    obstacles.push({ a: de, b: vers });
  };

  const P = nomme(e.origine);
  const Q = nomme(e.extremite);

  // Aide : droite passant par P parallèle à \vec{v}, prolongée jusqu'au bord du cadre.
  if (options.droiteV) {
    const d = cartesien(e, e.v.x, e.v.y);
    const n = Math.hypot(d.x, d.y);
    const dir = { x: d.x / n, y: -d.y / n };
    const L = Math.hypot(LARGEUR, hauteur);
    const clip = (t: number) => ({ x: P.x + dir.x * t, y: P.y + dir.y * t });
    // Bornes : la droite reste dans le rectangle [MARGE/2 ; LARGEUR − MARGE/2] × [MARGE/2 ; hauteur − MARGE/2].
    let t0 = -L;
    let t1 = L;
    const bornes: [number, number, number][] = [
      [dir.x, P.x, LARGEUR],
      [dir.y, P.y, hauteur],
    ];
    for (const [c, p0, max] of bornes) {
      if (Math.abs(c) < 1e-9) continue;
      const ta = (6 - p0) / c;
      const tb = (max - 6 - p0) / c;
      t0 = Math.max(t0, Math.min(ta, tb));
      t1 = Math.min(t1, Math.max(ta, tb));
    }
    ligne(traits, clip(t0), clip(t1), pal.v, 1.6, ";stroke-dasharray:3 5");
    obstacles.push({ a: clip(t0), b: clip(t1) });
  }

  // Construction : \vec{PM} (direction de \vec{v}) puis \vec{MQ} (direction de \vec{w}).
  if (options.construction) {
    const M = nomme(e.pointM);
    if (e.a !== 0) fleche(traits, P, M, pal.v, 2, true);
    if (e.b !== 0) fleche(traits, M, Q, pal.w, 2, true);
  }

  // \vec{v} et \vec{w}.
  let segV: Segment;
  let segW: Segment;
  if (e.nomsV && e.nomsW) {
    segV = { a: nomme(e.nomsV[0]), b: nomme(e.nomsV[1]) };
    segW = { a: nomme(e.nomsW[0]), b: nomme(e.nomsW[1]) };
  } else {
    const G = e.origineVW!;
    const g = ij(G.i, G.j);
    segV = { a: g, b: ij(G.i + e.v.x, G.j + e.v.y) };
    segW = { a: g, b: ij(G.i + e.w.x, G.j + e.w.y) };
    dessus.push(`<circle cx="${r(g.x)}" cy="${r(g.y)}" r="2.4" style="fill:${pal.encre}" />`);
    occupes.push(g);
  }
  fleche(traits, segV.a, segV.b, pal.v, 2.6);
  fleche(traits, segW.a, segW.b, pal.w, 2.6);
  fleche(traits, P, Q, pal.u, 3.2);

  // Points nommés.
  for (const p of e.points) {
    const c = ij(p.i, p.j);
    dessus.push(`<circle cx="${r(c.x)}" cy="${r(c.y)}" r="3" style="fill:${pal.encre}" />`);
    occupes.push(c);
  }
  const etiquettes: Vec2[] = [];
  const score = (c: Vec2, rayon: number) => {
    let m = Infinity;
    for (const s of obstacles) m = Math.min(m, distanceSegment(c, s));
    for (const o of occupes) m = Math.min(m, Math.hypot(c.x - o.x, c.y - o.y) - 4);
    for (const o of etiquettes) m = Math.min(m, Math.hypot(c.x - o.x, c.y - o.y) - rayon);
    // Rester dans le cadre.
    if (c.x < 10 || c.x > LARGEUR - 10 || c.y < 10 || c.y > hauteur - 10) m -= 100;
    return m;
  };
  for (const p of e.points) {
    const c = ij(p.i, p.j);
    let meilleur = { x: c.x + 12, y: c.y - 12 };
    let s = -Infinity;
    for (let k = 0; k < 16; k++) {
      const t = (k * Math.PI) / 8;
      const rayon = k % 2 === 0 ? 14 : 16;
      const cand = { x: c.x + rayon * Math.cos(t), y: c.y + rayon * Math.sin(t) };
      const sc = score(cand, 14);
      if (sc > s + 0.5) {
        s = sc;
        meilleur = cand;
      }
    }
    etiquettes.push(meilleur);
    dessus.push(texte(meilleur.x, meilleur.y, p.nom, pal.encre));
  }

  // Étiquettes des vecteurs : lettre italique surmontée d'une petite flèche.
  const etiquetteVecteur = (seg: Segment, lettre: string, couleur: string) => {
    const dx = seg.b.x - seg.a.x;
    const dy = seg.b.y - seg.a.y;
    const n = Math.hypot(dx, dy) || 1;
    let meilleur = { x: 0, y: 0 };
    let s = -Infinity;
    for (const t of [0.5, 0.4, 0.6, 0.3, 0.7]) {
      for (const cote of [1, -1]) {
        for (const d of [13, 17]) {
          const cand = { x: seg.a.x + dx * t + (cote * -dy * d) / n, y: seg.a.y + dy * t + (cote * dx * d) / n };
          const sc = score(cand, 14) - Math.abs(t - 0.5) * 6;
          if (sc > s) {
            s = sc;
            meilleur = cand;
          }
        }
      }
    }
    etiquettes.push(meilleur);
    const lx = meilleur.x;
    const ly = meilleur.y;
    dessus.push(
      `<text x="${r(lx)}" y="${r(ly + 2)}" text-anchor="middle" dominant-baseline="central" style="fill:${couleur};font-size:${POLICE + 3}px;font-family:'Times New Roman',serif;font-style:italic;font-weight:700;${halo}">${lettre}</text>`,
    );
    const yF = ly - 9;
    dessus.push(`<line x1="${r(lx - 5)}" y1="${r(yF)}" x2="${r(lx + 3)}" y2="${r(yF)}" ${style(couleur, 1.3)} />`);
    dessus.push(`<polygon points="${r(lx + 6)},${r(yF)} ${r(lx + 2)},${r(yF - 2.6)} ${r(lx + 2)},${r(yF + 2.6)}" style="fill:${couleur};stroke:none" />`);
  };
  etiquetteVecteur({ a: P, b: Q }, "u", pal.u);
  etiquetteVecteur(segV, "v", pal.v);
  etiquetteVecteur(segW, "w", pal.w);

  const largeurAffichee = options.theme === "papier" ? ` width="${LARGEUR * 0.85}" height="${r(hauteur * 0.85)}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${r(hauteur)}"${largeurAffichee} role="img" aria-label="Figure : décomposer le vecteur u selon v et w" style="display:block;${options.theme === "papier" ? `width:${LARGEUR * 0.85}px;` : ""}max-width:100%;height:auto;margin:8px auto">${[...fond, ...traits, ...dessus].join("")}</svg>`;
}
