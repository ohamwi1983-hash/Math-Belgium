import type { ExerciceCasAmbigu } from "../core/casAmbigu.types";
import { intersectionsSSA, resoudreSSA, sommetC } from "../moteur/modeleCasAmbigu";
import { nombreTexteFr } from "./formatCasAmbigu";

/**
 * Figure de gen74, à l'échelle (même repère que l'atelier du cours) : A à l'origine, demi-droite
 * [Ax) horizontale, côté AC = b sous l'angle Â. Deux modes :
 * - ÉNONCÉ (`avecArc = false`) : A, C, la demi-droite, b et Â seulement — rien ne trahit l'issue :
 *   le cadre ne dépend QUE de Â et b (jamais de a ni de la position des points B), et ni l'arc, ni
 *   B, ni a ne sont dessinés ;
 * - CORRECTION (`avecArc = true`) : l'arc de compas de centre C et de rayon a, qui coupe la
 *   demi-droite 0, 1 ou 2 fois ; chaque triangle obtenu est tracé (B₁, B₂ ou B) ; un point
 *   d'intersection situé DERRIÈRE A (candidat refusé) est un rond creux sur le prolongement
 *   pointillé ; sans intersection, la hauteur h issue de C montre que l'arc est trop court.
 * Une seule géométrie, deux rendus : `components/FigureCasAmbigu.tsx` (appli, couleurs du thème) et
 * `figureCasAmbiguSvg` (corrigé papier, couleurs fixes).
 */

export type RoleTrait = "axe" | "prolongement" | "cote" | "arc" | "hauteur" | "triangle1" | "triangle2" | "angle";

export type Primitive =
  | { type: "ligne"; role: RoleTrait; x1: number; y1: number; x2: number; y2: number }
  | { type: "cercle"; role: RoleTrait; cx: number; cy: number; r: number }
  | { type: "polygone"; role: RoleTrait; points: [number, number][] }
  | { type: "chemin"; role: RoleTrait; d: string }
  | { type: "point"; plein: boolean; x: number; y: number }
  | { type: "texte"; role: "sommet" | "valeur" | "hauteur"; x: number; y: number; contenu: string; ancre: "start" | "middle" | "end" };

export interface FigureCasAmbigu {
  largeur: number;
  hauteur: number;
  primitives: Primitive[];
  description: string;
}

const LARGEUR = 340;
const MARGE = 18;

export function figureCasAmbigu(e: ExerciceCasAmbigu, avecArc: boolean): FigureCasAmbigu {
  const C = sommetC(e);
  // Cadre en unités de longueur — ne dépend que de Â et b (voir l'en-tête).
  const xMin = -0.45 * e.b;
  const xMax = C.x + 1.65 * e.b;
  const yMin = -0.3 * e.b;
  const yMax = C.y + 0.22 * e.b;
  const k = (LARGEUR - 2 * MARGE) / (xMax - xMin);
  const hauteur = Math.round((yMax - yMin) * k + 2 * MARGE);
  const px = (x: number) => MARGE + (x - xMin) * k;
  const py = (y: number) => hauteur - MARGE - (y - yMin) * k;

  const A = { x: px(0), y: py(0) };
  const Cp = { x: px(C.x), y: py(C.y) };
  const finAxe = px(xMax) - 4;
  const primitives: Primitive[] = [];

  if (avecArc) primitives.push({ type: "ligne", role: "prolongement", x1: px(xMin) - MARGE, y1: A.y, x2: A.x, y2: A.y });

  // Triangles d'abord (remplissage léger), puis les traits par-dessus.
  const r = resoudreSSA(e);
  const intersections = avecArc ? intersectionsSSA(e) : [];
  const deux = r.nombreTriangles === 2;
  if (avecArc) {
    for (const t of r.triangles) {
      const bx = px(t.c);
      primitives.push({ type: "polygone", role: t.rang === 1 ? "triangle1" : "triangle2", points: [[A.x, A.y], [bx, A.y], [Cp.x, Cp.y]] });
    }
  }

  primitives.push({ type: "ligne", role: "axe", x1: A.x, y1: A.y, x2: finAxe, y2: A.y });
  primitives.push({ type: "texte", role: "sommet", x: finAxe, y: A.y - 8, contenu: "x", ancre: "end" });
  primitives.push({ type: "ligne", role: "cote", x1: A.x, y1: A.y, x2: Cp.x, y2: Cp.y });

  // Arc de l'angle Â.
  const rayonAngle = 24;
  const rad = (e.angleA * Math.PI) / 180;
  primitives.push({
    type: "chemin",
    role: "angle",
    d: `M ${(A.x + rayonAngle).toFixed(2)} ${A.y.toFixed(2)} A ${rayonAngle} ${rayonAngle} 0 0 0 ${(A.x + rayonAngle * Math.cos(rad)).toFixed(2)} ${(A.y - rayonAngle * Math.sin(rad)).toFixed(2)}`,
  });
  const milieuAngle = rad / 2;
  primitives.push({ type: "texte", role: "valeur", x: A.x + 34 * Math.cos(milieuAngle) + 2, y: A.y - 34 * Math.sin(milieuAngle) + 4, contenu: `${e.angleA}°`, ancre: "start" });

  // Valeur de b, à gauche du milieu de [AC] (côté extérieur).
  const nx = -Math.sin(rad);
  const ny = -Math.cos(rad);
  primitives.push({
    type: "texte",
    role: "valeur",
    x: (A.x + Cp.x) / 2 + nx * 10,
    y: (A.y + Cp.y) / 2 + ny * 10,
    contenu: `${nombreTexteFr(e.b, 1)} ${e.unite}`,
    ancre: "end",
  });

  if (avecArc) {
    primitives.push({ type: "cercle", role: "arc", cx: Cp.x, cy: Cp.y, r: e.a * k });
    if (intersections.length === 0) {
      primitives.push({ type: "ligne", role: "hauteur", x1: Cp.x, y1: Cp.y, x2: Cp.x, y2: A.y });
      primitives.push({ type: "texte", role: "hauteur", x: Cp.x + 5, y: (Cp.y + A.y) / 2 + 4, contenu: "h", ancre: "start" });
    }
    for (const inter of intersections) {
      const x = px(inter.x);
      if (!inter.surDemiDroite) {
        if (x >= 2) primitives.push({ type: "point", plein: false, x, y: A.y });
        continue;
      }
      const t = r.triangles.find((tr) => Math.abs(tr.c - inter.x) < 1e-6);
      if (!t) continue;
      if (r.comparaison === "egal") {
        // Angle droit en B (C est à la verticale de B).
        primitives.push({ type: "chemin", role: "angle", d: `M ${(x - 9).toFixed(2)} ${A.y.toFixed(2)} L ${(x - 9).toFixed(2)} ${(A.y - 9).toFixed(2)} L ${x.toFixed(2)} ${(A.y - 9).toFixed(2)}` });
      }
      primitives.push({ type: "point", plein: true, x, y: A.y });
      primitives.push({ type: "texte", role: "sommet", x, y: A.y + 17, contenu: deux ? `B${t.rang === 1 ? "₁" : "₂"}` : "B", ancre: "middle" });
    }
    primitives.push({
      type: "texte",
      role: "valeur",
      x: Cp.x + 8,
      y: Cp.y - 8,
      contenu: `a = ${nombreTexteFr(e.a, 1)} ${e.unite}`,
      ancre: "start",
    });
  }

  primitives.push({ type: "point", plein: true, x: A.x, y: A.y });
  primitives.push({ type: "point", plein: true, x: Cp.x, y: Cp.y });
  primitives.push({ type: "texte", role: "sommet", x: A.x - 4, y: A.y + 17, contenu: "A", ancre: "end" });
  primitives.push({ type: "texte", role: "sommet", x: Cp.x - 8, y: Cp.y - 6, contenu: "C", ancre: "end" });

  const description = avecArc
    ? `Arc de cercle de centre C et de rayon a : ${r.nombreTriangles === 0 ? "il n'atteint pas la demi-droite, aucun triangle" : r.nombreTriangles === 1 ? "un seul point B sur la demi-droite, un triangle" : "deux points B₁ et B₂ sur la demi-droite, deux triangles"}.`
    : "Angle A, côté AC et demi-droite [Ax) sur laquelle placer B.";
  return { largeur: LARGEUR, hauteur, primitives, description };
}

// ---------------------------------------------------------------------------------------------
// Rendu SVG autonome (corrigé papier, énoncé papier). Les textes ont un liseré de la couleur du
// fond (`paint-order: stroke`) : lisibles même quand l'arc ou un côté les traverse.
// ---------------------------------------------------------------------------------------------

const COULEURS_PAPIER: Record<RoleTrait, { trait: string; epaisseur: number; tirets?: string; remplissage?: string }> = {
  axe: { trait: "#1f2933", epaisseur: 1.6 },
  prolongement: { trait: "#8a939c", epaisseur: 1.2, tirets: "4 3" },
  cote: { trait: "#1f2933", epaisseur: 2 },
  arc: { trait: "#b23a3a", epaisseur: 1.4, tirets: "5 3" },
  hauteur: { trait: "#5b4ea3", epaisseur: 1.3, tirets: "4 3" },
  triangle1: { trait: "#2f7a4f", epaisseur: 2, remplissage: "rgba(47,122,79,0.12)" },
  triangle2: { trait: "#a8471f", epaisseur: 2, remplissage: "rgba(168,71,31,0.12)" },
  angle: { trait: "#1f2933", epaisseur: 1.3 },
};

function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

export function figureCasAmbiguSvg(e: ExerciceCasAmbigu, avecArc: boolean): string {
  const f = figureCasAmbigu(e, avecArc);
  const style = (role: RoleTrait, plein = false) => {
    const c = COULEURS_PAPIER[role];
    return `stroke="${c.trait}" stroke-width="${c.epaisseur}"${c.tirets ? ` stroke-dasharray="${c.tirets}"` : ""} fill="${plein && c.remplissage ? c.remplissage : "none"}"`;
  };
  const elements = f.primitives.map((p) => {
    switch (p.type) {
      case "ligne":
        return `<line x1="${p.x1.toFixed(2)}" y1="${p.y1.toFixed(2)}" x2="${p.x2.toFixed(2)}" y2="${p.y2.toFixed(2)}" ${style(p.role)}/>`;
      case "cercle":
        return `<circle cx="${p.cx.toFixed(2)}" cy="${p.cy.toFixed(2)}" r="${p.r.toFixed(2)}" ${style(p.role)}/>`;
      case "polygone":
        return `<polygon points="${p.points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ")}" ${style(p.role, true)} stroke-linejoin="round"/>`;
      case "chemin":
        return `<path d="${p.d}" ${style(p.role)}/>`;
      case "point":
        return `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="3.2" fill="${p.plein ? "#1f2933" : "#ffffff"}" stroke="#1f2933" stroke-width="1.3"/>`;
      case "texte": {
        const couleur = p.role === "valeur" ? "#1971c2" : p.role === "hauteur" ? "#5b4ea3" : "#1f2933";
        const poids = p.role === "sommet" ? ' font-weight="bold"' : "";
        return `<text x="${p.x.toFixed(2)}" y="${p.y.toFixed(2)}" font-size="${p.role === "sommet" ? 13 : 12}"${poids} text-anchor="${p.ancre}" fill="${couleur}" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" paint-order="stroke">${echapper(p.contenu)}</text>`;
      }
    }
  });
  const svg = `<svg width="${f.largeur}" height="${f.hauteur}" viewBox="0 0 ${f.largeur} ${f.hauteur}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${echapper(f.description)}"><rect x="0" y="0" width="${f.largeur}" height="${f.hauteur}" fill="#ffffff" stroke="#d0d7de" stroke-width="1"/>${elements.join("")}</svg>`;
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}</div>`;
}
