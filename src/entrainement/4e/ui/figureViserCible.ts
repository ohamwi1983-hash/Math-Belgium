import type { Point } from "../core/vecteur.types";
import type { ExerciceViserCible, SituationViserCible } from "../core/viserCible.types";
import { CADRES } from "../moteur/modeleViserCible";

/**
 * Figure de gen89 — UNE seule fonction pour l'écran et le papier (énoncé, corrigé `figureHtml`).
 * Scène vue de dessus (table de billard, salle, terrain, piste) À L'ÉCHELLE du repère : axes
 * discrets gradués (origine au coin, ou au centre de la salle pour le laser), point de départ A,
 * flèche de u⃗ issue de A (en sens inverse, u⃗ est inconnu : pas de flèche dans l'énoncé), cible C.
 * Corrigé (`corrige`) : la trajectoire prolongée (demi-droite pointillée issue de A), le vecteur
 * AC⃗ et, quand la cible est derrière, la droite prolongée de l'autre côté de A.
 * À l'écran, couleurs du thème (`var(--…)`, suit le mode sombre) ; sur papier, couleurs fixes.
 */

export type ThemeFigure = "ecran" | "papier";

export interface OptionsFigureViserCible {
  theme: ThemeFigure;
  corrige?: boolean;
}

interface Palette {
  fond: string;
  encre: string;
  doux: string;
  fleche: string;
  trajet: string;
  ac: string;
  cible: string;
  depart: string;
  scene: Record<SituationViserCible, { sol: string; opacite: number; bord: string }>;
  police: string;
}

const PALETTES: Record<ThemeFigure, Palette> = {
  ecran: {
    fond: "var(--surface)",
    encre: "var(--ink)",
    doux: "var(--ink-soft)",
    fleche: "var(--accent)",
    trajet: "var(--plan)",
    ac: "var(--sky)",
    cible: "var(--bad)",
    depart: "var(--surface)",
    scene: {
      billard: { sol: "var(--good)", opacite: 0.16, bord: "var(--histoire)" },
      laser: { sol: "var(--ink)", opacite: 0.04, bord: "var(--ink-soft)" },
      foot: { sol: "var(--good)", opacite: 0.1, bord: "var(--good)" },
      curling: { sol: "var(--sky)", opacite: 0.1, bord: "var(--sky)" },
    },
    police: "inherit",
  },
  papier: {
    fond: "#ffffff",
    encre: "#1f2933",
    doux: "#52606d",
    fleche: "#c2410c",
    trajet: "#7048e8",
    ac: "#1c7ed6",
    cible: "#e03131",
    depart: "#ffffff",
    scene: {
      billard: { sol: "#2b8a3e", opacite: 0.14, bord: "#8b5a2b" },
      laser: { sol: "#1f2933", opacite: 0.04, bord: "#52606d" },
      foot: { sol: "#2b8a3e", opacite: 0.1, bord: "#2b8a3e" },
      curling: { sol: "#1c7ed6", opacite: 0.08, bord: "#1c7ed6" },
    },
    police: "Helvetica, Arial, sans-serif",
  },
};

const LARGEUR = 360;
const MARGE_GAUCHE = 28;
const MARGE_DROITE = 14;
const MARGE_HAUT = 14;
const MARGE_BAS = 24;

function r(v: number): string {
  return `${Math.round(v * 10) / 10}`;
}

export function construireFigureViserCible(e: ExerciceViserCible, options: OptionsFigureViserCible): string {
  const pal = PALETTES[options.theme];
  const cadre = CADRES[e.situation];
  const centre = e.situation === "laser";
  const corrige = !!options.corrige;
  const avecFleche = e.sens === "directe" || corrige;

  // Fenêtre : la scène, agrandie si la flèche de u⃗ en sort.
  const bout = { x: e.A.x + e.u.x, y: e.A.y + e.u.y };
  const xMin = Math.min(cadre.xMin, avecFleche ? bout.x - 0.5 : cadre.xMin);
  const xMax = Math.max(cadre.xMax, avecFleche ? bout.x + 0.5 : cadre.xMax);
  const yMin = Math.min(cadre.yMin, avecFleche ? bout.y - 0.5 : cadre.yMin);
  const yMax = Math.max(cadre.yMax, avecFleche ? bout.y + 0.5 : cadre.yMax);
  const echelle = (LARGEUR - MARGE_GAUCHE - MARGE_DROITE) / (xMax - xMin);
  const hauteur = MARGE_HAUT + (yMax - yMin) * echelle + MARGE_BAS;
  const ecran = (p: Point): Point => ({ x: MARGE_GAUCHE + (p.x - xMin) * echelle, y: MARGE_HAUT + (yMax - p.y) * echelle });

  const m: string[] = [];
  const trait = (couleur: string, epaisseur: number, extra = "") => `style="stroke:${couleur};stroke-width:${epaisseur};fill:none;stroke-linecap:round${extra}"`;
  const texte = (x: number, y: number, contenu: string, couleur: string, o: { ancre?: string; taille?: number; gras?: boolean; italique?: boolean } = {}) =>
    `<text x="${r(x)}" y="${r(y)}" text-anchor="${o.ancre ?? "middle"}" dominant-baseline="middle" style="fill:${couleur};font-size:${o.taille ?? 14}px;font-family:${o.italique ? "'Times New Roman',serif" : pal.police}${o.gras ? ";font-weight:700" : ""}${o.italique ? ";font-style:italic" : ""}">${contenu}</text>`;
  const ligne = (a: Point, b: Point, style: string) => `<line x1="${r(a.x)}" y1="${r(a.y)}" x2="${r(b.x)}" y2="${r(b.y)}" ${style} />`;

  m.push(`<rect x="0" y="0" width="${LARGEUR}" height="${r(hauteur)}" rx="8" style="fill:${pal.fond};stroke:none" />`);

  // Scène.
  const s = pal.scene[e.situation];
  const bg = ecran({ x: cadre.xMin, y: cadre.yMax });
  const hd = ecran({ x: cadre.xMax, y: cadre.yMin });
  const largeurScene = hd.x - bg.x;
  const hauteurScene = hd.y - bg.y;
  m.push(`<rect x="${r(bg.x)}" y="${r(bg.y)}" width="${r(largeurScene)}" height="${r(hauteurScene)}" style="fill:${s.sol};fill-opacity:${s.opacite};stroke:${s.bord};stroke-width:${e.situation === "billard" ? 5 : e.situation === "laser" ? 3 : 1.6}" />`);
  if (e.situation === "billard") {
    // Six poches : coins et milieux des grands côtés.
    for (const p of [
      { x: cadre.xMin, y: cadre.yMin },
      { x: (cadre.xMin + cadre.xMax) / 2, y: cadre.yMin },
      { x: cadre.xMax, y: cadre.yMin },
      { x: cadre.xMin, y: cadre.yMax },
      { x: (cadre.xMin + cadre.xMax) / 2, y: cadre.yMax },
      { x: cadre.xMax, y: cadre.yMax },
    ]) {
      const q = ecran(p);
      m.push(`<circle cx="${r(q.x)}" cy="${r(q.y)}" r="5.5" style="fill:${pal.encre};fill-opacity:0.75" />`);
    }
  }
  if (e.situation === "foot") {
    const milieuH = ecran({ x: (cadre.xMin + cadre.xMax) / 2, y: cadre.yMax });
    const milieuB = ecran({ x: (cadre.xMin + cadre.xMax) / 2, y: cadre.yMin });
    m.push(ligne(milieuH, milieuB, trait(s.bord, 1.2, ";stroke-opacity:0.6")));
    const c = ecran({ x: (cadre.xMin + cadre.xMax) / 2, y: (cadre.yMin + cadre.yMax) / 2 });
    m.push(`<circle cx="${r(c.x)}" cy="${r(c.y)}" r="${r(2 * echelle)}" ${trait(s.bord, 1.2, ";stroke-opacity:0.6")} />`);
  }
  if (e.situation === "curling") {
    for (const x of [cadre.xMin + 3, cadre.xMax - 3]) m.push(ligne(ecran({ x, y: cadre.yMin }), ecran({ x, y: cadre.yMax }), trait(s.bord, 1, ";stroke-opacity:0.5")));
  }

  // Repère discret : axes gradués (origine au coin inférieur gauche, ou au centre de la salle).
  const origine = ecran({ x: 0, y: 0 });
  const couleurAxe = pal.doux;
  if (centre) {
    m.push(ligne(ecran({ x: cadre.xMin, y: 0 }), ecran({ x: cadre.xMax, y: 0 }), trait(couleurAxe, 0.9, ";stroke-opacity:0.7")));
    m.push(ligne(ecran({ x: 0, y: cadre.yMin }), ecran({ x: 0, y: cadre.yMax }), trait(couleurAxe, 0.9, ";stroke-opacity:0.7")));
  }
  for (let x = Math.ceil(cadre.xMin); x <= cadre.xMax; x++) {
    const p = ecran({ x, y: centre ? 0 : cadre.yMin });
    m.push(ligne({ x: p.x, y: p.y - 3 }, { x: p.x, y: p.y + 3 }, trait(couleurAxe, 0.9)));
    if (x !== 0 && x % 2 === 0 && !(centre && (x === cadre.xMin || x === cadre.xMax))) m.push(texte(p.x, p.y + 11, String(x).replace("-", "−"), couleurAxe, { taille: 10 }));
  }
  for (let y = Math.ceil(cadre.yMin); y <= cadre.yMax; y++) {
    const p = ecran({ x: centre ? 0 : cadre.xMin, y });
    m.push(ligne({ x: p.x - 3, y: p.y }, { x: p.x + 3, y: p.y }, trait(couleurAxe, 0.9)));
    if (y !== 0 && y % 2 === 0 && !(centre && (y === cadre.yMin || y === cadre.yMax))) m.push(texte(p.x - 6, p.y, String(y).replace("-", "−"), couleurAxe, { taille: 10, ancre: "end" }));
  }
  m.push(texte(origine.x - 7, origine.y + 10, "O", couleurAxe, { taille: 11, gras: true }));

  const A = ecran(e.A);
  const C = ecran(e.C);
  const B = ecran(bout);

  // Corrigé : trajectoire prolongée jusqu'au bord de la scène, et droite de l'autre côté si la
  // cible est derrière A.
  if (corrige) {
    const jusquAuBord = (sens: 1 | -1): Point => {
      let t = Infinity;
      const dx = sens * e.u.x;
      const dy = sens * e.u.y;
      if (dx > 0) t = Math.min(t, (cadre.xMax - e.A.x) / dx);
      if (dx < 0) t = Math.min(t, (cadre.xMin - e.A.x) / dx);
      if (dy > 0) t = Math.min(t, (cadre.yMax - e.A.y) / dy);
      if (dy < 0) t = Math.min(t, (cadre.yMin - e.A.y) / dy);
      return ecran({ x: e.A.x + t * dx, y: e.A.y + t * dy });
    };
    // Cible derrière A (bonne droite mauvais sens, ou « à côté » de ce côté-là) : la droite du lancer
    // est prolongée en pointillés fins de l'autre côté de A, pour la comparer à C.
    const derriere = (e.C.x - e.A.x) * e.u.x + (e.C.y - e.A.y) * e.u.y < 0;
    if (derriere) m.push(ligne(A, jusquAuBord(-1), trait(pal.doux, 1.3, ";stroke-dasharray:2 4")));
    m.push(ligne(A, jusquAuBord(1), trait(pal.trajet, 2, ";stroke-dasharray:7 5")));
  }

  const fleche = (de: Point, vers: Point, couleur: string, epaisseur: number) => {
    const t = Math.atan2(vers.y - de.y, vers.x - de.x);
    const long = 11;
    const larg = 5;
    const base = { x: vers.x - long * Math.cos(t), y: vers.y - long * Math.sin(t) };
    m.push(ligne(de, base, trait(couleur, epaisseur)));
    m.push(`<polygon points="${r(vers.x)},${r(vers.y)} ${r(base.x - larg * Math.sin(t))},${r(base.y + larg * Math.cos(t))} ${r(base.x + larg * Math.sin(t))},${r(base.y - larg * Math.cos(t))}" style="fill:${couleur};stroke:none" />`);
  };

  // Étiquette d'un vecteur : nom en italique, petite flèche au-dessus.
  const etiquetteVecteur = (cx: number, cy: number, nom: string, couleur: string) => {
    const largeur = nom.length * 8.5;
    m.push(texte(cx, cy, nom, couleur, { taille: 16, italique: true, gras: true }));
    const yF = cy - 11;
    m.push(ligne({ x: cx - largeur / 2, y: yF }, { x: cx + largeur / 2 - 2, y: yF }, trait(couleur, 1.2)));
    m.push(`<polygon points="${r(cx + largeur / 2 + 2)},${r(yF)} ${r(cx + largeur / 2 - 3)},${r(yF - 2.6)} ${r(cx + largeur / 2 - 3)},${r(yF + 2.6)}" style="fill:${couleur};stroke:none" />`);
  };

  /** Point à distance `d` du milieu de [PQ], du côté opposé à `loin`. */
  const decale = (p: Point, q: Point, d: number, loin: Point): Point => {
    const mx = (p.x + q.x) / 2;
    const my = (p.y + q.y) / 2;
    const n = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    let nx = -(q.y - p.y) / n;
    let ny = (q.x - p.x) / n;
    if ((loin.x - mx) * nx + (loin.y - my) * ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    return { x: mx + nx * d, y: my + ny * d };
  };

  if (corrige) {
    fleche(A, C, pal.ac, 1.8);
    const eAC = decale(A, C, 16, B);
    etiquetteVecteur(eAC.x, eAC.y, "AC", pal.ac);
  }
  if (avecFleche) {
    fleche(A, B, pal.fleche, 2.8);
    const eU = decale(A, B, 16, C);
    etiquetteVecteur(eU.x, eU.y, "u", pal.fleche);
  }

  // Cible : disque et anneau.
  m.push(`<circle cx="${r(C.x)}" cy="${r(C.y)}" r="9" style="fill:none;stroke:${pal.cible};stroke-width:1.4" />`);
  m.push(`<circle cx="${r(C.x)}" cy="${r(C.y)}" r="4.5" style="fill:${pal.cible}" />`);
  // Départ : disque cerclé.
  m.push(`<circle cx="${r(A.x)}" cy="${r(A.y)}" r="5.5" style="fill:${pal.depart};stroke:${pal.encre};stroke-width:1.8" />`);

  // Noms des points, à l'opposé de la flèche (pour A) et de A (pour C).
  const nomPoint = (p: Point, nom: string, fuir: Point[], distance: number, repli?: Point) => {
    let dx = 0;
    let dy = 0;
    for (const f of fuir) {
      const n = Math.hypot(p.x - f.x, p.y - f.y) || 1;
      dx += (p.x - f.x) / n;
      dy += (p.y - f.y) / n;
    }
    const n = Math.hypot(dx, dy);
    if (n < 0.6) {
      // Directions à fuir presque opposées : on se met sur le côté (perpendiculaire à la flèche).
      const ref = repli ?? { x: p.x, y: p.y - 1 };
      const rx = ref.x - p.x;
      const ry = ref.y - p.y;
      const nr = Math.hypot(rx, ry) || 1;
      dx = -ry / nr;
      dy = rx / nr;
    } else {
      dx /= n;
      dy /= n;
    }
    m.push(texte(p.x + dx * distance, p.y + dy * distance, nom, pal.encre, { gras: true, taille: 15 }));
  };
  nomPoint(A, "A", avecFleche ? [B, C] : [C], 15, avecFleche ? B : C);
  nomPoint(C, "C", [A], 18);

  const taillePapier = options.theme === "papier" ? ` width="${LARGEUR * 0.85}" height="${r(hauteur * 0.85)}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${r(hauteur)}"${taillePapier} role="img" aria-label="Scène vue de dessus, dans un repère" style="display:block;${options.theme === "papier" ? `width:${LARGEUR * 0.85}px;` : ""}max-width:100%;height:auto;margin:8px auto">${m.join("")}</svg>`;
}
