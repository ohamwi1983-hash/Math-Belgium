import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExerciceDroitesRemarquables, VarianteDroitesRemarquables } from "../../core/droitesRemarquables.types";
import { choisir, droiteDirectrice, droiteNormale, droitePoints, entier, intersection, milieu, norme2, pgcd, signe, vecteur, type Droite, type Pt } from "../../ui/geometrieLotG";

/**
 * Générateur de gen94 « Droites remarquables d'un triangle » (4e, ch. 7, § 6). Tout le hasard passe
 * par `Math.random` (`?code=`). Triangle ABC à sommets entiers, points de concours « propres » choisis
 * à rebours :
 * - `mediatrices` : O entier, A, B, C sur un cercle de centre O (r² somme de deux carrés) ;
 *   médiatrices de [AB] et [BC].
 * - `hauteurs` : même construction ; orthocentre H = A + B + C − 2O (relation d'Euler) entier,
 *   triangle non rectangle ; hauteurs issues de A et de B.
 * - `medianes` : sommes des coordonnées multiples de 3 → G entier ; médianes issues de A et de B.
 * - `aire` : (BC) de vecteur directeur primitif u, C = B + m·u, pied H = B + t·u (t ≠ 0, t ≠ m),
 *   A = H + k·n (n normal) : BC = |m|·‖u‖, AH = |k|·‖u‖, aire = |m·k|·‖u‖²/2.
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "mediatrices", label: "Médiatrices et centre du cercle circonscrit" },
  { id: "hauteurs", label: "Hauteurs et orthocentre" },
  { id: "medianes", label: "Médianes et centre de gravité" },
  { id: "aire", label: "Aire d'un triangle (base et distance à une droite)" },
];

const R2 = [5, 10, 13, 17, 25, 26, 29, 34, 37, 41, 50];

function vecteursNorme(r2: number): Pt[] {
  const out: Pt[] = [];
  const m = Math.floor(Math.sqrt(r2));
  for (let x = -m; x <= m; x++) for (let y = -m; y <= m; y++) if (x * x + y * y === r2) out.push({ x, y });
  return out;
}

const ajoute = (p: Pt, v: Pt, k = 1): Pt => ({ x: p.x + k * v.x, y: p.y + k * v.y });
const dansCadre = (b: number, ...ps: Pt[]) => ps.every((p) => Math.abs(p.x) <= b && Math.abs(p.y) <= b);
const petite = (d: Droite) => Math.abs(d.a) <= 12 && Math.abs(d.b) <= 12 && Math.abs(d.c) <= 60;
const axiale = (d: Droite) => d.a === 0 || d.b === 0;
const egal = (p: Pt, q: Pt) => p.x === q.x && p.y === q.y;

export function mediatrice(p: Pt, q: Pt): Droite {
  return droiteNormale(milieu(p, q), vecteur(p, q));
}

/** Hauteur issue de S, perpendiculaire au côté [PQ]. */
export function hauteur(s: Pt, p: Pt, q: Pt): Droite {
  return droiteNormale(s, vecteur(p, q));
}

/** Médiane issue de S, vers le milieu de [PQ]. */
export function mediane(s: Pt, p: Pt, q: Pt): Droite {
  return droitePoints(s, milieu(p, q));
}

function triangleInscrit(): { a: Pt; b: Pt; c: Pt; o: Pt } {
  for (;;) {
    const o = { x: entier(-3, 3), y: entier(-3, 3) };
    const vs = vecteursNorme(choisir(R2));
    const u = choisir(vs);
    const v = choisir(vs);
    const w = choisir(vs);
    if (egal(u, v) || egal(v, w) || egal(u, w)) continue;
    const a = ajoute(o, u);
    const b = ajoute(o, v);
    const c = ajoute(o, w);
    if (!dansCadre(9, a, b, c)) continue;
    return { a, b, c, o };
  }
}

function aireDuTriangle(): ExerciceDroitesRemarquables {
  for (;;) {
    const ux = entier(1, 3) * signe();
    const uy = entier(0, 3) * signe();
    if (pgcd(ux, uy) !== 1 || (uy === 0 && Math.random() < 0.7)) continue;
    const u = { x: ux, y: uy };
    const n = { x: -u.y, y: u.x };
    const b = { x: entier(-5, 5), y: entier(-5, 5) };
    const m = entier(2, 4) * signe();
    const c = ajoute(b, u, m);
    const t = entier(-2, 5) * Math.sign(m);
    if (t === 0 || t === m) continue;
    const h = ajoute(b, u, t);
    const k = entier(1, norme2(u) >= 10 ? 2 : 3) * signe();
    const a = ajoute(h, n, k);
    if (!dansCadre(9, a, b, c)) continue;
    const BCd = droiteDirectrice(b, u);
    if (!petite(BCd)) continue;
    return {
      variante: "aire",
      a,
      b,
      c,
      droites: { BCd },
      points: { H: h },
      longueurs: { BC: m * m * norme2(u), AH: k * k * norme2(u) },
      aire: (Math.abs(m * k) * norme2(u)) / 2,
    };
  }
}

export function construireAvecVariante(id: string): ExerciceDroitesRemarquables {
  const variante = (CATALOGUE_VARIANTES.some((c) => c.id === id) ? id : choisir(CATALOGUE_VARIANTES).id) as VarianteDroitesRemarquables;
  if (variante === "aire") return aireDuTriangle();
  for (;;) {
    if (variante === "medianes") {
      const a = { x: entier(-6, 6), y: entier(-6, 6) };
      const b = { x: entier(-6, 6), y: entier(-6, 6) };
      const c = { x: entier(-6, 6), y: entier(-6, 6) };
      if ((a.x + b.x + c.x) % 3 !== 0 || (a.y + b.y + c.y) % 3 !== 0) continue;
      const aire2 = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
      if (aire2 < 12) continue;
      const md1 = mediane(a, b, c);
      const md2 = mediane(b, c, a);
      if (!petite(md1) || !petite(md2) || (axiale(md1) && axiale(md2))) continue;
      const g = { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
      return { variante, a, b, c, droites: { md1, md2 }, points: { G: g }, longueurs: {} };
    }
    const { a, b, c, o } = triangleInscrit();
    if (variante === "mediatrices") {
      const m1 = mediatrice(a, b);
      const m2 = mediatrice(b, c);
      if (!petite(m1) || !petite(m2) || (axiale(m1) && axiale(m2))) continue;
      if ((axiale(m1) || axiale(m2)) && Math.random() < 0.6) continue;
      return { variante, a, b, c, droites: { m1, m2 }, points: { O: o }, longueurs: {} };
    }
    const h = { x: a.x + b.x + c.x - 2 * o.x, y: a.y + b.y + c.y - 2 * o.y };
    if (egal(h, a) || egal(h, b) || egal(h, c) || !dansCadre(12, h)) continue;
    const h1 = hauteur(a, b, c);
    const h2 = hauteur(b, c, a);
    if (!petite(h1) || !petite(h2) || (axiale(h1) && axiale(h2))) continue;
    if ((axiale(h1) || axiale(h2)) && Math.random() < 0.6) continue;
    const i = intersection(h1, h2)!;
    if (Math.abs(i.x - h.x) > 1e-9 || Math.abs(i.y - h.y) > 1e-9) continue;
    return { variante, a, b, c, droites: { h1, h2 }, points: { H: h }, longueurs: {} };
  }
}

export function genererExerciceDroitesRemarquables(): ExerciceDroitesRemarquables {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
