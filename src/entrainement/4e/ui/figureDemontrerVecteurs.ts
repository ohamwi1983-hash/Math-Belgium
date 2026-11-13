import type { ExerciceDemontrerVecteurs, VecteurNomme } from "../core/demontrerVecteurs.types";
import { pointDessin, positions, sommets, valeur } from "../moteur/modeleDemontrerVecteurs";

/**
 * Figure de gen85 — UNE seule fonction pour l'écran et le papier (énoncé, corrigé `figureHtml`).
 * La figure de base (sans repère) et les points E, F placés exactement selon leurs relations ; la
 * droite de définition de chaque point est tracée finement (prolongée en pointillés quand le point
 * est hors du segment). L'énoncé ne code JAMAIS la conclusion (aucune droite qui relierait les
 * points à démontrer alignés, aucun parallélisme marqué). Option `vecteurs` (corrigé, et à l'écran
 * une fois les vecteurs exprimés) : les deux vecteurs utiles en couleur.
 * À l'écran, couleurs du thème (`var(--…)`, suit le mode sombre) ; sur papier, couleurs fixes.
 */

export type ThemeFigure = "ecran" | "papier";

export interface OptionsFigureDemontrerVecteurs {
  theme: ThemeFigure;
  vecteurs?: boolean;
}

interface Palette {
  fond: string;
  encre: string;
  doux: string;
  defini: string;
  w: string;
  v: string;
  police: string;
}

const PALETTES: Record<ThemeFigure, Palette> = {
  ecran: { fond: "var(--surface)", encre: "var(--ink)", doux: "var(--ink-soft)", defini: "var(--plan)", w: "var(--accent)", v: "var(--sky)", police: "inherit" },
  papier: { fond: "#ffffff", encre: "#1f2933", doux: "#7b8794", defini: "#7048e8", w: "#c2410c", v: "#1c7ed6", police: "Helvetica, Arial, sans-serif" },
};

interface Pt {
  x: number;
  y: number;
}

const LARGEUR = 360;
const HAUTEUR_MAX = 300;
const MARGE = 34;
const POLICE = 15;

function r(v: number): string {
  return `${Math.round(v * 10) / 10}`;
}

export function construireFigureDemontrerVecteurs(e: ExerciceDemontrerVecteurs, options: OptionsFigureDemontrerVecteurs): string {
  const pal = PALETTES[options.theme];
  const pos = positions(e);
  const noms = Object.keys(pos);
  const math: Record<string, Pt> = {};
  for (const n of noms) {
    const [x, y] = pointDessin(e.figure, pos[n]!);
    math[n] = { x, y };
  }
  const xs = noms.map((n) => math[n]!.x);
  const ys = noms.map((n) => math[n]!.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys);
  const yMax = Math.max(...ys);
  const echelle = Math.min((LARGEUR - 2 * MARGE) / (xMax - xMin), (HAUTEUR_MAX - 2 * MARGE) / Math.max(1e-9, yMax - yMin));
  const hauteur = (yMax - yMin) * echelle + 2 * MARGE;
  const decalX = (LARGEUR - (xMax - xMin) * echelle) / 2;
  const P: Record<string, Pt> = {};
  for (const n of noms) P[n] = { x: decalX + (math[n]!.x - xMin) * echelle, y: hauteur - MARGE - (math[n]!.y - yMin) * echelle };
  const centre = { x: noms.reduce((s, n) => s + P[n]!.x, 0) / noms.length, y: noms.reduce((s, n) => s + P[n]!.y, 0) / noms.length };

  const morceaux: string[] = [];
  const trait = (couleur: string, epaisseur: number, extra = "") => `style="stroke:${couleur};stroke-width:${epaisseur};fill:none;stroke-linecap:round${extra}"`;
  const ligne = (a: Pt, b: Pt, couleur: string, epaisseur: number, extra = "") => morceaux.push(`<line x1="${r(a.x)}" y1="${r(a.y)}" x2="${r(b.x)}" y2="${r(b.y)}" ${trait(couleur, epaisseur, extra)} />`);
  const texte = (x: number, y: number, contenu: string, couleur: string, opts: { taille?: number; gras?: boolean; italique?: boolean } = {}) =>
    `<text x="${r(x)}" y="${r(y)}" text-anchor="middle" dominant-baseline="middle" style="fill:${couleur};font-size:${opts.taille ?? POLICE}px;font-family:${pal.police}${opts.gras ? ";font-weight:700" : ""}${opts.italique ? ";font-style:italic" : ""}">${contenu}</text>`;

  morceaux.push(`<rect x="0" y="0" width="${LARGEUR}" height="${r(hauteur)}" rx="8" style="fill:${pal.fond};stroke:none" />`);

  // Droites de définition de E et F (fines), prolongées en pointillés jusqu'au point si besoin.
  const cotes = sommets(e.figure).map((n, i, l) => [n, l[(i + 1) % l.length]!] as const);
  const estCote = (a: string, b: string) => cotes.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  for (const d of e.definis) {
    const O = P[d.origine]!;
    const X = P[d.nom]!;
    if (d.de === d.origine) {
      const R = P[d.vers]!;
      if (!estCote(d.origine, d.vers)) ligne(O, R, pal.doux, 1.1);
      const k = valeur(d.k);
      if (k > 1) ligne(R, X, pal.doux, 1.1, ";stroke-dasharray:5 4");
      else if (k < 0) ligne(O, X, pal.doux, 1.1, ";stroke-dasharray:5 4");
    } else {
      ligne(O, X, pal.doux, 1.1, ";stroke-dasharray:5 4");
    }
  }

  // Figure de base.
  const poly = sommets(e.figure).map((n) => `${r(P[n]!.x)},${r(P[n]!.y)}`).join(" ");
  morceaux.push(`<polygon points="${poly}" style="fill:none;stroke:${pal.encre};stroke-width:1.8;stroke-linejoin:round" />`);

  // Vecteurs utiles (corrigé).
  const fleche = (de: Pt, vers: Pt, couleur: string, epaisseur: number) => {
    const t = Math.atan2(vers.y - de.y, vers.x - de.x);
    const long = 11;
    const larg = 5;
    const base = { x: vers.x - long * Math.cos(t), y: vers.y - long * Math.sin(t) };
    ligne(de, base, couleur, epaisseur);
    morceaux.push(
      `<polygon points="${r(vers.x)},${r(vers.y)} ${r(base.x - larg * Math.sin(t))},${r(base.y + larg * Math.cos(t))} ${r(base.x + larg * Math.sin(t))},${r(base.y - larg * Math.cos(t))}" style="fill:${couleur};stroke:none" />`,
    );
  };
  /** Position d'une étiquette de vecteur : à la fraction t du vecteur, décalée de 17 px d'un côté. */
  const positionEtiquette = (vec: VecteurNomme, cote: 1 | -1, t: number): Pt => {
    const a = P[vec.de]!;
    const b = P[vec.vers]!;
    const n = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    return { x: a.x + (b.x - a.x) * t + (-(b.y - a.y) / n) * cote * 17, y: a.y + (b.y - a.y) * t + ((b.x - a.x) / n) * cote * 17 };
  };
  const distance = (u: Pt, v: Pt) => Math.hypot(u.x - v.x, u.y - v.y);
  const etiquetteVecteur = (vec: VecteurNomme, couleur: string, { x: cx, y: cy }: Pt) => {
    const nom = `${vec.de}${vec.vers}`;
    const largeur = nom.length * POLICE * 0.66;
    morceaux.push(`<rect x="${r(cx - largeur / 2 - 2)}" y="${r(cy - 14)}" width="${r(largeur + 4)}" height="24" rx="4" style="fill:${pal.fond};fill-opacity:0.85;stroke:none" />`);
    morceaux.push(texte(cx, cy + 2, nom, couleur, { gras: true }));
    const yF = cy - 9;
    ligne({ x: cx - largeur / 2, y: yF }, { x: cx + largeur / 2 - 3, y: yF }, couleur, 1.2);
    morceaux.push(`<polygon points="${r(cx + largeur / 2 + 1)},${r(yF)} ${r(cx + largeur / 2 - 4)},${r(yF - 2.6)} ${r(cx + largeur / 2 - 4)},${r(yF + 2.6)}" style="fill:${couleur};stroke:none" />`);
  };
  if (options.vecteurs) {
    const longueur = (vec: VecteurNomme) => Math.hypot(P[vec.vers]!.x - P[vec.de]!.x, P[vec.vers]!.y - P[vec.de]!.y);
    // Le plus long d'abord : deux vecteurs portés par la même droite restent visibles tous les deux.
    const [premier, second] = longueur(e.v) >= longueur(e.w) ? [[e.v, pal.v, 4.2], [e.w, pal.w, 2.4]] as const : [[e.w, pal.w, 4.2], [e.v, pal.v, 2.4]] as const;
    fleche(P[premier[0].de]!, P[premier[0].vers]!, premier[1], premier[2]);
    fleche(P[second[0].de]!, P[second[0].vers]!, second[1], second[2]);
  }

  // Points et noms (loin du centre de la figure).
  for (const n of noms) {
    const p = P[n]!;
    const defini = n === "E" || n === "F";
    let dx = p.x - centre.x;
    let dy = p.y - centre.y;
    const lg = Math.hypot(dx, dy);
    if (lg < 1e-6) {
      dx = 0.6;
      dy = -0.8;
    } else {
      dx /= lg;
      dy /= lg;
    }
    morceaux.push(`<circle cx="${r(p.x)}" cy="${r(p.y)}" r="${defini ? 3.2 : 2.6}" style="fill:${defini ? pal.defini : pal.encre}" />`);
    morceaux.push(texte(p.x + dx * 15, p.y + dy * 15, n, defini ? pal.defini : pal.encre, { gras: true }));
  }

  // Étiquettes des vecteurs, par-dessus tout : celle de w vers l'intérieur de la figure (les noms
  // des points sont à l'extérieur), celle de v aussi, sauf si elle chevaucherait celle de w.
  if (options.vecteurs) {
    const [w1, w2] = [positionEtiquette(e.w, 1, 0.4), positionEtiquette(e.w, -1, 0.4)];
    const pw = distance(w1, centre) <= distance(w2, centre) ? w1 : w2;
    const [v1, v2] = [positionEtiquette(e.v, 1, 0.62), positionEtiquette(e.v, -1, 0.62)];
    const [vDedans, vDehors] = distance(v1, centre) <= distance(v2, centre) ? [v1, v2] : [v2, v1];
    const pv = distance(vDedans, pw) >= 44 || distance(vDehors, pw) < distance(vDedans, pw) ? vDedans : vDehors;
    etiquetteVecteur(e.w, pal.w, pw);
    etiquetteVecteur(e.v, pal.v, pv);
  }

  const largeurAffichee = options.theme === "papier" ? ` width="${LARGEUR * 0.85}" height="${r(hauteur * 0.85)}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${r(hauteur)}"${largeurAffichee} role="img" aria-label="Figure de base et points définis" style="display:block;${options.theme === "papier" ? `width:${LARGEUR * 0.85}px;` : ""}max-width:100%;height:auto;margin:8px auto">${morceaux.join("")}</svg>`;
}
