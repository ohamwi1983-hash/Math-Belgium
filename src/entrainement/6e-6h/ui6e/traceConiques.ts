import { qNum } from "../moteur6e/algebreLieux";
import type { Droite } from "../moteur6e/algebreLieux";
import { asymptotes, c2Conique, directricesNum, foyersConique } from "../moteur6e/algebreConiques";
import type { Conique } from "../moteur6e/algebreConiques";
import { echantillonner, figureLieux } from "./figureLieux";
import type { CouleurLieux, ObjetsLieux, P2 } from "./figureLieux";

/**
 * Tracé des coniques pour la figure commune `figureLieux` (6e ch. 10, 6gen58–6gen63, audit, lot B) :
 * repère ISOTROPE (celui de `figureLieux` : un cercle reste rond), courbes COUPÉES au bord du
 * quadrillage (jamais hors du cadre ni dans la marge), foyers, sommets, asymptotes et directrices en
 * option. Chaîne SVG sans identifiant (même source pour l'écran et le corrigé papier du lot E).
 */

export interface OptionsTrace {
  couleur?: CouleurLieux;
  epais?: boolean;
  pointilles?: boolean;
  /** Foyers marqués (noms F, F′ par défaut). */
  foyers?: boolean | string[];
  asymptotes?: boolean;
  directrices?: boolean;
}

export function objetsVides(): Required<Pick<ObjetsLieux, "points" | "droites" | "segments" | "cercles" | "courbes" | "polygones" | "inclure">> & ObjetsLieux {
  return { points: [], droites: [], segments: [], cercles: [], courbes: [], polygones: [], inclure: [] };
}

/** Points de la conique (une ou deux courbes), assez loin pour sortir de la fenêtre `etendue`. */
export function courbesConique(c: Conique, etendue: number): P2[][] {
  switch (c.type) {
    case "cercle": {
      const h = qNum(c.centre.x);
      const k = qNum(c.centre.y);
      const r = Math.sqrt(qNum(c.r2));
      return [echantillonner((t) => ({ x: h + r * Math.cos(t), y: k + r * Math.sin(t) }), 0, 2 * Math.PI, 160)];
    }
    case "ellipse": {
      const h = qNum(c.centre.x);
      const k = qNum(c.centre.y);
      const a = Math.sqrt(qNum(c.a2));
      const b = Math.sqrt(qNum(c.b2));
      return [echantillonner((t) => (c.axe === "x" ? { x: h + a * Math.cos(t), y: k + b * Math.sin(t) } : { x: h + b * Math.cos(t), y: k + a * Math.sin(t) }), 0, 2 * Math.PI, 200)];
    }
    case "hyperbole": {
      const h = qNum(c.centre.x);
      const k = qNum(c.centre.y);
      const a = Math.sqrt(qNum(c.a2));
      const b = Math.sqrt(qNum(c.b2));
      const T = Math.asinh((etendue * 2) / Math.min(a, b)) + 0.2;
      return [1, -1].map((s) => echantillonner((t) => (c.axe === "x" ? { x: h + s * a * Math.cosh(t), y: k + b * Math.sinh(t) } : { x: h + b * Math.sinh(t), y: k + s * a * Math.cosh(t) }), -T, T, 240));
    }
    case "parabole": {
      const h = qNum(c.sommet.x);
      const k = qNum(c.sommet.y);
      const p = qNum(c.p);
      const L = Math.sqrt(2 * p * etendue * 2) + etendue;
      return [echantillonner((t) => (c.axe === "x" ? { x: h + (c.sens * t * t) / (2 * p), y: k + t } : { x: h + t, y: k + (c.sens * t * t) / (2 * p) }), -L, L, 240)];
    }
  }
}

/** Ajoute la conique (et ses éléments demandés) aux objets d'une figure. */
export function ajouterConique(o: ObjetsLieux, c: Conique, etendue: number, opt: OptionsTrace = {}): void {
  const couleur = opt.couleur ?? "bleu";
  for (const pts of courbesConique(c, etendue)) o.courbes!.push({ pts, couleur, epais: opt.epais ?? true, pointilles: opt.pointilles, coupe: true });
  if (opt.foyers) {
    const noms = Array.isArray(opt.foyers) ? opt.foyers : ["F", "F′"];
    foyersConique(c).forEach((F, i) => o.points!.push({ p: { x: F.x, y: F.y }, nom: noms[i], couleur: "accent" }));
  }
  if (opt.asymptotes && c.type === "hyperbole") for (const d of asymptotes(c)) o.droites!.push({ ...d3(d), couleur: "gris", pointilles: true });
  if (opt.directrices) for (const d of directricesNum(c)) o.droites!.push(d.axe === "x" ? { a: 1, b: 0, c: -d.valeur, couleur: "violet", pointilles: true, nom: c.type === "parabole" ? "d" : undefined } : { a: 0, b: 1, c: -d.valeur, couleur: "violet", pointilles: true, nom: c.type === "parabole" ? "d" : undefined });
}

export const d3 = (d: Droite) => ({ a: Number(d.a), b: Number(d.b), c: Number(d.c) });

/** Fenêtre carrée qui contient la conique « utile » (centre, sommets, foyers) et les points donnés. */
export function fenetreConique(c: Conique | null, autres: P2[] = [], marge = 1): { xmin: number; xmax: number; ymin: number; ymax: number } {
  const pts: P2[] = [{ x: 0, y: 0 }, ...autres];
  if (c) {
    if (c.type === "cercle") {
      const r = Math.sqrt(qNum(c.r2));
      pts.push({ x: qNum(c.centre.x) - r, y: qNum(c.centre.y) - r }, { x: qNum(c.centre.x) + r, y: qNum(c.centre.y) + r });
    } else if (c.type === "parabole") {
      const p = qNum(c.p);
      const h = qNum(c.sommet.x);
      const k = qNum(c.sommet.y);
      const prof = Math.max(3, Math.min(p, 6));
      const larg = Math.sqrt(2 * p * prof);
      if (c.axe === "x") pts.push({ x: h + c.sens * prof, y: k + larg }, { x: h + c.sens * prof, y: k - larg }, { x: h - c.sens * (p / 2 + 1), y: k });
      else pts.push({ x: h + larg, y: k + c.sens * prof }, { x: h - larg, y: k + c.sens * prof }, { x: h, y: k - c.sens * (p / 2 + 1) });
    } else {
      const a = Math.sqrt(qNum(c.a2));
      const b = Math.sqrt(qNum(c.b2));
      const cc = Math.sqrt(qNum(c2Conique(c)));
      const h = qNum(c.centre.x);
      const k = qNum(c.centre.y);
      const focal = Math.max(a, cc) + (c.type === "hyperbole" ? Math.max(1, a / 2) : 0);
      const autre = c.type === "ellipse" ? b : Math.max(b, a);
      if (c.axe === "x") pts.push({ x: h - focal, y: k - autre }, { x: h + focal, y: k + autre });
      else pts.push({ x: h - autre, y: k - focal }, { x: h + autre, y: k + focal });
    }
  }
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  return { xmin: Math.floor(Math.min(...xs) - marge), xmax: Math.ceil(Math.max(...xs) + marge), ymin: Math.floor(Math.min(...ys) - marge), ymax: Math.ceil(Math.max(...ys) + marge) };
}

/** Figure complète d'une conique (raccourci). */
export function figureConique(c: Conique, opt: OptionsTrace & { points?: ObjetsLieux["points"]; droites?: ObjetsLieux["droites"]; autres?: P2[] } = {}): string {
  const o = objetsVides();
  const fen = fenetreConique(c, [...(opt.autres ?? []), ...(opt.points ?? []).map((p) => p.p)]);
  ajouterConique(o, c, Math.max(fen.xmax - fen.xmin, fen.ymax - fen.ymin), opt);
  if (opt.points) o.points.push(...opt.points);
  if (opt.droites) o.droites.push(...opt.droites);
  o.fenetre = fen;
  return figureLieux(o);
}
