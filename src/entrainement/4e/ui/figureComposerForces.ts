import type { ExerciceComposerForces } from "../core/composerForces.types";
import { angleCap, angleInterieur, estCap, intensiteResultante, sommetCle, sommetPetit } from "../moteur/modeleComposerForces";
import { arrondiAngle, arrondiIntensite, lettre } from "./formatComposerForces";
import { nombreFr } from "./nombreFr";

/**
 * Figure de gen80 — UNE seule fonction pour l'écran et le papier (énoncé, corrigé `figureHtml`).
 * Figure À L'ÉCHELLE des données : les deux vecteurs partent de O, le parallélogramme est en
 * pointillés, la résultante est sa diagonale [OC] ; l'angle donné est marqué en O ; les inconnues
 * s'écrivent « ? ». Pour le cap, la route voulue est une demi-droite pointillée issue de O (portée
 * par [OC]), et l'angle inconnu entre le cap et la route porte « ? ».
 * Options : `triangle` surligne le triangle utile (après l'écran 1, et dans le corrigé) ;
 * `angleTriangle` y inscrit l'angle intérieur (180° − θ en G ; pour le cap, la valeur de γ remplace le « ? » de l'angle entre le cap et la route).
 * À l'écran, couleurs du thème (`var(--…)`, suit le mode sombre) ; sur papier, couleurs fixes.
 */

export type ThemeFigure = "ecran" | "papier";

export interface OptionsFigureComposerForces {
  theme: ThemeFigure;
  triangle?: boolean;
  angleTriangle?: boolean;
  /** Corrigé : les « ? » laissent place aux valeurs (intensité de la résultante, angle du cap). */
  resolue?: boolean;
}

interface Palette {
  fond: string;
  encre: string;
  doux: string;
  grand: string;
  petit: string;
  resultante: string;
  surlignage: string;
  angle: string;
  police: string;
}

const PALETTES: Record<ThemeFigure, Palette> = {
  ecran: {
    fond: "var(--surface)",
    encre: "var(--ink)",
    doux: "var(--ink-soft)",
    grand: "var(--accent)",
    petit: "var(--sky)",
    resultante: "var(--plan)",
    surlignage: "var(--good)",
    angle: "var(--good)",
    police: "inherit",
  },
  papier: {
    fond: "#ffffff",
    encre: "#1f2933",
    doux: "#52606d",
    grand: "#c2410c",
    petit: "#1c7ed6",
    resultante: "#7048e8",
    surlignage: "#2b8a3e",
    angle: "#2b8a3e",
    police: "Helvetica, Arial, sans-serif",
  },
};

interface Pt {
  x: number;
  y: number;
}

const LARGEUR = 360;
const HAUTEUR_MAX = 290;
const HAUTEUR_MIN = 170;
const MARGE = 40;
const POLICE = 15;
const D2R = Math.PI / 180;

function r(v: number): string {
  return `${Math.round(v * 10) / 10}`;
}

/** Points mathématiques (y vers le haut) : O, G (extrémité du grand vecteur), P (du petit), C. */
function pointsMath(e: ExerciceComposerForces): { O: Pt; G: Pt; P: Pt; C: Pt } {
  const O = { x: 0, y: 0 };
  if (estCap(e)) {
    // Route voulue le long de Ox ; courant au-dessus (angle β), cap en dessous (angle γ).
    const b = e.angle * D2R;
    const c = angleCap(e) * D2R;
    const P = { x: e.petit * Math.cos(b), y: e.petit * Math.sin(b) };
    const G = { x: e.grand * Math.cos(c), y: -e.grand * Math.sin(c) };
    return { O, G, P, C: { x: G.x + P.x, y: G.y + P.y } };
  }
  const t = e.angle * D2R;
  const G = { x: e.grand, y: 0 };
  const P = { x: e.petit * Math.cos(t), y: e.petit * Math.sin(t) };
  return { O, G, P, C: { x: G.x + P.x, y: G.y + P.y } };
}

export function construireFigureComposerForces(e: ExerciceComposerForces, options: OptionsFigureComposerForces): string {
  const pal = PALETTES[options.theme];
  const m = pointsMath(e);
  const cap = estCap(e);
  // Pour le cap, la route se prolonge au-delà de C et de l'extrémité du cap, d'au moins
  // ECART_ROUTE px après C à l'écran : l'étiquette « route voulue » tient à droite du nom de C.
  const ECART_ROUTE = 100;
  const finRoute = { x: Math.max(m.C.x * 1.3, m.G.x + m.C.x * 0.1), y: 0 };
  let xMin = 0;
  let xMax = 0;
  let yMin = 0;
  let yMax = 0;
  let echelle = 1;
  for (let passe = 0; passe < 3; passe++) {
    const tous = [m.O, m.G, m.P, m.C, ...(cap ? [finRoute] : [])];
    xMin = Math.min(...tous.map((p) => p.x));
    xMax = Math.max(...tous.map((p) => p.x));
    yMin = Math.min(...tous.map((p) => p.y));
    yMax = Math.max(...tous.map((p) => p.y));
    echelle = Math.min((LARGEUR - 2 * MARGE) / (xMax - xMin), (HAUTEUR_MAX - 2 * MARGE) / Math.max(1e-9, yMax - yMin));
    if (!cap || (finRoute.x - m.C.x) * echelle >= ECART_ROUTE) break;
    finRoute.x = m.C.x + (ECART_ROUTE * 1.1) / echelle;
  }
  const hauteur = Math.max(HAUTEUR_MIN, (yMax - yMin) * echelle + 2 * MARGE);
  const decalX = (LARGEUR - (xMax - xMin) * echelle) / 2;
  const decalY = (hauteur - (yMax - yMin) * echelle) / 2;
  const ecran = (p: Pt): Pt => ({ x: decalX + (p.x - xMin) * echelle, y: hauteur - decalY - (p.y - yMin) * echelle });

  const O = ecran(m.O);
  const G = ecran(m.G);
  const P = ecran(m.P);
  const C = ecran(m.C);
  const centre = { x: (O.x + G.x + P.x + C.x) / 4, y: (O.y + G.y + P.y + C.y) / 4 };
  const nomG = e.sommetGrand;
  const nomP = sommetPetit(e);
  const L = lettre(e);

  const morceaux: string[] = [];
  const trait = (couleur: string, epaisseur: number, extra = "") => `style="stroke:${couleur};stroke-width:${epaisseur};fill:none;stroke-linecap:round${extra}"`;
  const texte = (x: number, y: number, contenu: string, couleur: string, opts: { ancre?: string; taille?: number; italique?: boolean; gras?: boolean } = {}) =>
    `<text x="${r(x)}" y="${r(y)}" text-anchor="${opts.ancre ?? "middle"}" dominant-baseline="middle" style="fill:${couleur};font-size:${opts.taille ?? POLICE}px;font-family:${pal.police}${opts.italique ? ";font-style:italic" : ""}${opts.gras ? ";font-weight:700" : ""}">${contenu}</text>`;

  morceaux.push(`<rect x="0" y="0" width="${LARGEUR}" height="${r(hauteur)}" rx="8" style="fill:${pal.fond};stroke:none" />`);

  // Triangle utile surligné.
  if (options.triangle) {
    const K = sommetCle(e) === nomG ? G : P;
    morceaux.push(`<polygon points="${r(O.x)},${r(O.y)} ${r(K.x)},${r(K.y)} ${r(C.x)},${r(C.y)}" style="fill:${pal.surlignage};fill-opacity:0.14;stroke:${pal.surlignage};stroke-width:1.4;stroke-linejoin:round" />`);
  }

  // Route voulue (cap).
  if (cap) {
    const fin = ecran(finRoute);
    morceaux.push(`<line x1="${r(O.x)}" y1="${r(O.y)}" x2="${r(fin.x)}" y2="${r(fin.y)}" ${trait(pal.doux, 1.2, ";stroke-dasharray:2 4")} />`);
    morceaux.push(texte(fin.x, fin.y - 10, "route voulue", pal.doux, { ancre: "end", taille: 12 }));
  }

  // Parallélogramme (côtés reportés, pointillés).
  morceaux.push(`<line x1="${r(G.x)}" y1="${r(G.y)}" x2="${r(C.x)}" y2="${r(C.y)}" ${trait(pal.doux, 1.3, ";stroke-dasharray:6 5")} />`);
  morceaux.push(`<line x1="${r(P.x)}" y1="${r(P.y)}" x2="${r(C.x)}" y2="${r(C.y)}" ${trait(pal.doux, 1.3, ";stroke-dasharray:6 5")} />`);

  // Arcs d'angle.
  const angleEcran = (de: Pt, vers: Pt) => Math.atan2(-(vers.y - de.y), vers.x - de.x);
  const arc = (sommet: Pt, a1: Pt, a2: Pt, rayon: number, couleur: string, etiquette: string, decalEtiquette = 16) => {
    const t1 = angleEcran(sommet, a1);
    let delta = angleEcran(sommet, a2) - t1;
    while (delta > Math.PI) delta -= 2 * Math.PI;
    while (delta < -Math.PI) delta += 2 * Math.PI;
    const t2 = t1 + delta;
    const p1 = { x: sommet.x + rayon * Math.cos(t1), y: sommet.y - rayon * Math.sin(t1) };
    const p2 = { x: sommet.x + rayon * Math.cos(t2), y: sommet.y - rayon * Math.sin(t2) };
    morceaux.push(`<path d="M${r(p1.x)} ${r(p1.y)} A${rayon} ${rayon} 0 0 ${delta > 0 ? 0 : 1} ${r(p2.x)} ${r(p2.y)}" ${trait(couleur, 1.5)} />`);
    const tm = t1 + delta / 2;
    const re = rayon + decalEtiquette;
    morceaux.push(texte(sommet.x + re * Math.cos(tm), sommet.y - re * Math.sin(tm), etiquette, couleur, { taille: 13, gras: true }));
  };

  if (cap) {
    arc(O, P, C, 30, pal.encre, `${e.angle}°`, 15);
    // L'angle entre le cap et la route (inconnu) : égal à l'angle en C du triangle (angles alternes) ;
    // sa valeur s'inscrit ICI une fois trouvée, plutôt qu'en C où la figure est trop serrée.
    const capConnu = options.resolue || options.angleTriangle;
    arc(O, C, G, 44, pal.grand, capConnu ? `${nombreFr(arrondiAngle(angleCap(e)))}°` : "?", capConnu ? 18 : 11);
  } else {
    arc(O, G, P, 26, pal.encre, `${e.angle}°`, 16);
  }
  if (options.angleTriangle) {
    if (!cap) arc(G, O, C, 24, pal.angle, `${angleInterieur(e)}°`, 18);
  }

  // Vecteurs (flèches dessinées en géométrie pure : rendu identique écran / papier).
  const fleche = (de: Pt, vers: Pt, couleur: string, epaisseur: number) => {
    const t = Math.atan2(vers.y - de.y, vers.x - de.x);
    const long = 11;
    const larg = 5;
    const base = { x: vers.x - long * Math.cos(t), y: vers.y - long * Math.sin(t) };
    morceaux.push(`<line x1="${r(de.x)}" y1="${r(de.y)}" x2="${r(base.x)}" y2="${r(base.y)}" ${trait(couleur, epaisseur)} />`);
    morceaux.push(
      `<polygon points="${r(vers.x)},${r(vers.y)} ${r(base.x - larg * Math.sin(t))},${r(base.y + larg * Math.cos(t))} ${r(base.x + larg * Math.sin(t))},${r(base.y - larg * Math.cos(t))}" style="fill:${couleur};stroke:none" />`,
    );
  };
  fleche(O, G, pal.grand, 2.4);
  fleche(O, P, pal.petit, 2.4);
  fleche(O, C, pal.resultante, 2.8);

  // Étiquette d'un vecteur : lettre italique + indice + petite flèche au-dessus.
  const etiquetteVecteur = (cx: number, cy: number, indice: string, couleur: string, suite = "") => {
    const lLettre = POLICE * 0.62;
    const lIndice = POLICE * 0.72 * 0.6 * indice.length;
    const largeur = lLettre + lIndice;
    const x0 = cx - (largeur + (suite ? suite.length * POLICE * 0.5 : 0)) / 2;
    morceaux.push(
      `<text x="${r(x0)}" y="${r(cy)}" dominant-baseline="middle" style="fill:${couleur};font-size:${POLICE}px;font-family:${pal.police};font-weight:700"><tspan style="font-style:italic;font-family:'Times New Roman',serif;font-size:${POLICE + 2}px">${L}</tspan><tspan dy="4" style="font-size:${Math.round(POLICE * 0.72)}px">${indice}</tspan><tspan dy="-4">${suite}</tspan></text>`,
    );
    const yF = cy - POLICE * 0.85;
    const xF1 = x0 + 1;
    const xF2 = x0 + largeur;
    morceaux.push(`<line x1="${r(xF1)}" y1="${r(yF)}" x2="${r(xF2 - 2)}" y2="${r(yF)}" ${trait(couleur, 1.2)} />`);
    morceaux.push(`<polygon points="${r(xF2 + 1)},${r(yF)} ${r(xF2 - 4)},${r(yF - 2.6)} ${r(xF2 - 4)},${r(yF + 2.6)}" style="fill:${couleur};stroke:none" />`);
  };

  /** Point à distance `d` du milieu de [AB], côté opposé à `loin` (ou vers lui si `dedans`). */
  const decale = (a: Pt, b: Pt, d: number, loin: Pt, dedans = false): Pt => {
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const n = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    let nx = -(b.y - a.y) / n;
    let ny = (b.x - a.x) / n;
    const versLoin = (loin.x - mx) * nx + (loin.y - my) * ny > 0;
    if (versLoin !== dedans) {
      nx = -nx;
      ny = -ny;
    }
    return { x: mx + nx * d, y: my + ny * d };
  };

  const eG = decale(O, G, 17, centre);
  const eP = decale(O, P, 17, centre);
  etiquetteVecteur(eG.x, eG.y, "1", pal.grand);
  etiquetteVecteur(eP.x, eP.y, "2", pal.petit);
  // Résultante : à l'intérieur, du côté du petit vecteur (le grand garde son étiquette dehors).
  // Cap : l'arc de l'angle donné (en O) occupe le départ de la route : étiquette vers C.
  const [tDebut, tFin] = cap ? [0.42, 0.98] : [0.3, 0.9];
  const debutR = { x: O.x + (C.x - O.x) * tDebut, y: O.y + (C.y - O.y) * tDebut };
  const finR = { x: O.x + (C.x - O.x) * tFin, y: O.y + (C.y - O.y) * tFin };
  const eR = decale(debutR, finR, 16, P, true);
  etiquetteVecteur(eR.x, eR.y, "R", pal.resultante, options.resolue ? ` ≈ ${nombreFr(arrondiIntensite(intensiteResultante(e)))}` : " = ?");

  // Sommets.
  const sommet = (p: Pt, nom: string, direction?: Pt) => {
    const dx = direction ? direction.x : p.x - centre.x;
    const dy = direction ? direction.y : p.y - centre.y;
    const n = Math.hypot(dx, dy) || 1;
    morceaux.push(`<circle cx="${r(p.x)}" cy="${r(p.y)}" r="2.6" style="fill:${pal.encre}" />`);
    morceaux.push(texte(p.x + (dx / n) * 15, p.y + (dy / n) * 15, nom, pal.encre, { gras: true }));
  };
  sommet(O, "O");
  sommet(G, nomG);
  sommet(P, nomP);
  // Cap : C est sur la route ; son nom va juste au-dessus, pour ne pas chevaucher la route.
  sommet(C, "C", cap ? { x: 0, y: -1 } : undefined);

  const largeurAffichee = options.theme === "papier" ? ` width="${LARGEUR * 0.85}" height="${r(hauteur * 0.85)}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${r(hauteur)}"${largeurAffichee} role="img" aria-label="Parallélogramme des vecteurs" style="display:block;${options.theme === "papier" ? `width:${LARGEUR * 0.85}px;` : ""}max-width:100%;height:auto;margin:8px auto">${morceaux.join("")}</svg>`;
}
