/**
 * Couche ui — figure PAPIER de `gen53` (chaîne SVG autonome). Repère orthonormé (une seule échelle :
 * un cercle reste un cercle et les distances se reportent au compas dans toutes les directions),
 * aucune grille ni coordonnée, directrice oblique. Énoncé : d, F (et H₁, H₂, H₃ pour la méthode de
 * la médiatrice). Corrigé : axe, médiatrice de [KF] et sommet, arcs de construction, parallèles ou
 * perpendiculaires et médiatrices, points et courbe.
 */
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";
import { cadreTourne, foyer, intersectionCercles, pointDeH, pointsOuverture, sommet, tourner, yParabole } from "../moteur/geometrieConstructionParabole";
import { ouvertureMediatrice } from "../moteur/modeleConstructionParabole";

const LARGEUR = 520;
const HAUTEUR = 420;
const MARGE = 14;

const NOIR = "#212529";
const GRIS = "#868e96";
const BLEU = "#1971c2";
const ORANGE = "#d9480f";
const VERT = "#2f9e44";
const VIOLET = "#7048e8";

/** Ouvertures de la méthode du cercle montrées au corrigé (h = 2 : points bien répartis). */
export const OUVERTURES_CORRIGE = [1.6, 2.6, 4];

interface Projection {
  (p: Point): { x: number; y: number };
}

function projection(e: ExerciceConstructionParabole): { proj: Projection; echelle: number } {
  const ratio = (LARGEUR - 2 * MARGE) / (HAUTEUR - 2 * MARGE);
  const cadre = cadreTourne(e, ratio);
  const echelle = (LARGEUR - 2 * MARGE) / (cadre.xMax - cadre.xMin);
  return {
    echelle,
    proj: (p) => {
      const t = tourner(p, e.theta);
      return { x: MARGE + (t.x - cadre.xMin) * echelle, y: MARGE + (cadre.yMax - t.y) * echelle };
    },
  };
}

const f1 = (v: number) => v.toFixed(1);

function ligne(proj: Projection, a: Point, b: Point, couleur: string, epaisseur: number, pointilles = false): string {
  const pa = proj(a);
  const pb = proj(b);
  return `<line x1="${f1(pa.x)}" y1="${f1(pa.y)}" x2="${f1(pb.x)}" y2="${f1(pb.y)}" stroke="${couleur}" stroke-width="${epaisseur}"${pointilles ? ' stroke-dasharray="6 4"' : ""}/>`;
}

/** Droite infinie (segment assez long pour sortir du cadre). */
function droite(proj: Projection, p: Point, direction: Point, couleur: string, epaisseur: number, pointilles = false): string {
  const L = 30;
  return ligne(proj, { x: p.x - direction.x * L, y: p.y - direction.y * L }, { x: p.x + direction.x * L, y: p.y + direction.y * L }, couleur, epaisseur, pointilles);
}

function polyligne(proj: Projection, points: Point[], couleur: string, epaisseur: number): string {
  return `<polyline points="${points.map((p) => { const q = proj(p); return `${f1(q.x)},${f1(q.y)}`; }).join(" ")}" fill="none" stroke="${couleur}" stroke-width="${epaisseur}" stroke-linejoin="round"/>`;
}

/** Petit arc de cercle (centre, rayon) autour du point `autour`, d'ouverture ±`demiAngle` radians. */
function arc(proj: Projection, centre: Point, rayon: number, autour: Point, demiAngle = 0.28): string {
  const a0 = Math.atan2(autour.y - centre.y, autour.x - centre.x);
  const pts: Point[] = [];
  for (let i = 0; i <= 14; i++) {
    const a = a0 - demiAngle + (2 * demiAngle * i) / 14;
    pts.push({ x: centre.x + rayon * Math.cos(a), y: centre.y + rayon * Math.sin(a) });
  }
  return polyligne(proj, pts, BLEU, 1.3);
}

function point(proj: Projection, p: Point, couleur: string, rayon = 3.4): string {
  const q = proj(p);
  return `<circle cx="${f1(q.x)}" cy="${f1(q.y)}" r="${rayon}" fill="${couleur}"/>`;
}

function croix(proj: Projection, p: Point, couleur: string): string {
  const q = proj(p);
  const t = 5;
  return `<g stroke="${couleur}" stroke-width="2.2"><line x1="${f1(q.x - t)}" y1="${f1(q.y - t)}" x2="${f1(q.x + t)}" y2="${f1(q.y + t)}"/><line x1="${f1(q.x - t)}" y1="${f1(q.y + t)}" x2="${f1(q.x + t)}" y2="${f1(q.y - t)}"/></g>`;
}

function etiquette(proj: Projection, p: Point, texte: string, couleur: string, dx: number, dy: number, indice?: string): string {
  const q = proj(p);
  const sub = indice ? `<tspan font-size="10" dy="3">${indice}</tspan>` : "";
  return `<text x="${f1(q.x + dx)}" y="${f1(q.y + dy)}" font-size="15" font-style="italic" font-family="'Times New Roman', serif" font-weight="700" fill="${couleur}" text-anchor="middle" dominant-baseline="middle">${texte}${sub}</text>`;
}

function angleDroit(proj: Projection, s: Point, u: Point, v: Point, couleur: string): string {
  const c = 0.22;
  return polyligne(proj, [{ x: s.x + u.x * c, y: s.y + u.y * c }, { x: s.x + (u.x + v.x) * c, y: s.y + (u.y + v.y) * c }, { x: s.x + v.x * c, y: s.y + v.y * c }], couleur, 1.2);
}

/** Arcs d'une médiatrice de [AB] avec l'ouverture ρ, et la médiatrice elle-même (tracée à la règle). */
function mediatrice(proj: Projection, a: Point, b: Point, rho: number): string {
  const inter = intersectionCercles(a, rho, b, rho);
  if (inter.length < 2) return "";
  const arcs = inter.flatMap((i) => [arc(proj, a, rho, i), arc(proj, b, rho, i)]).join("");
  const dir = { x: inter[1]!.x - inter[0]!.x, y: inter[1]!.y - inter[0]!.y };
  const n = Math.hypot(dir.x, dir.y);
  return arcs + droite(proj, inter[0]!, { x: dir.x / n, y: dir.y / n }, VIOLET, 1.3, true);
}

export function svgConstructionParabole(e: ExerciceConstructionParabole, avecConstruction: boolean): string {
  const { proj } = projection(e);
  const F = foyer(e);
  const K: Point = { x: 0, y: 0 };
  const S = sommet(e);
  const morceaux: string[] = [];

  morceaux.push(droite(proj, K, { x: 1, y: 0 }, NOIR, 2));
  morceaux.push(etiquette(proj, { x: -4.3, y: 0 }, "d", NOIR, 0, -13));

  const xsPoints: number[] = [];
  if (avecConstruction) {
    morceaux.push(droite(proj, K, { x: 0, y: 1 }, GRIS, 1.3, true));
    morceaux.push(angleDroit(proj, K, { x: 1, y: 0 }, { x: 0, y: 1 }, GRIS));
    morceaux.push(mediatrice(proj, K, F, ouvertureMediatrice(e, "K", "F")));

    if (e.methode === "cercle") {
      for (const r of OUVERTURES_CORRIGE) {
        const [g, dt] = pointsOuverture(e, r);
        morceaux.push(arc(proj, K, r, { x: 0, y: r }, 0.18));
        morceaux.push(droite(proj, { x: 0, y: r }, { x: 1, y: 0 }, ORANGE, 1.2, true));
        morceaux.push(arc(proj, F, r, g, 0.16), arc(proj, F, r, dt, 0.16));
        morceaux.push(point(proj, g, VERT), point(proj, dt, VERT));
        xsPoints.push(g.x, dt.x);
      }
    } else {
      e.abscissesH.forEach((x, i) => {
        const H: Point = { x, y: 0 };
        const P = pointDeH(e, x);
        const nomH = ["H1", "H2", "H3"][i] as "H1" | "H2" | "H3";
        morceaux.push(droite(proj, H, { x: 0, y: 1 }, ORANGE, 1.2, true));
        morceaux.push(angleDroit(proj, H, { x: x >= 0 ? -1 : 1, y: 0 }, { x: 0, y: 1 }, ORANGE));
        morceaux.push(mediatrice(proj, F, H, ouvertureMediatrice(e, "F", nomH)));
        morceaux.push(ligne(proj, P, { x: -P.x, y: P.y }, GRIS, 1, true));
        morceaux.push(point(proj, P, VERT), point(proj, { x: -P.x, y: P.y }, VERT));
        xsPoints.push(P.x, -P.x);
      });
    }

    const xMin = Math.min(...xsPoints) - 0.5;
    const xMax = Math.max(...xsPoints) + 0.5;
    const courbe: Point[] = [];
    for (let i = 0; i <= 80; i++) {
      const x = xMin + ((xMax - xMin) * i) / 80;
      courbe.push({ x, y: yParabole(e, x) });
    }
    morceaux.push(polyligne(proj, courbe, VERT, 2.4));
    morceaux.push(point(proj, K, NOIR, 3), etiquette(proj, K, "K", NOIR, -11, 12));
    morceaux.push(point(proj, S, VERT), etiquette(proj, S, "S", VERT, -12, -9));
  }

  if (e.methode === "mediatrice") {
    e.abscissesH.forEach((x, i) => {
      morceaux.push(point(proj, { x, y: 0 }, NOIR, 3.2));
      morceaux.push(etiquette(proj, { x, y: 0 }, "H", NOIR, 0, 15, String(i + 1)));
    });
  }
  morceaux.push(croix(proj, F, NOIR), etiquette(proj, F, "F", NOIR, 12, -10));

  return `<svg width="${LARGEUR}" height="${HAUTEUR}" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:8px auto 14px;max-width:100%;height:auto;border:1px solid #dee2e6;background:#ffffff;">${morceaux.join("")}</svg>`;
}
