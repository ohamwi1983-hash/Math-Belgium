import type { Conique } from "../core6e/coniquesLotH1";
import { asymptotes, branches, centre, directriceD, directrices, foyers, sommets, valP } from "../core6e/coniquesLotH1";
import type { P, SpecFigure } from "./outilsLieuxLotH1";
import { figureRepere } from "./outilsLieuxLotH1";
import { COULEURS } from "./outilsLieuxLotH2";

/**
 * Figure d'une conique dans un repère orthonormé quadrillé (6e ch. 10, lot H1 — module propre : la
 * figure de coniques du lot BC n'était pas encore fusionnée sur cette base). Repose sur `figureRepere`
 * du 4e ch. 7 (isotrope, graduations lisibles, rien hors du cadre) : la courbe (une ou deux
 * branches), puis, à la demande, centre, sommets, foyers, directrices, asymptotes et rectangle
 * (±a ; ±b). Une figure d'ÉNONCÉ ne montre jamais ce que l'écran demande ; celle du corrigé montre tout.
 */

export interface OptionsFigureConique {
  courbe?: boolean;
  centre?: boolean;
  sommets?: boolean;
  foyers?: boolean;
  directrices?: boolean;
  asymptotes?: boolean;
  rectangle?: boolean;
  /** Étiquettes S, F, F′, Ω… sur les points marqués. */
  etiquettes?: boolean;
  /** Points ou segments supplémentaires (triangle focal, point P…). */
  points?: SpecFigure["points"];
  segments?: SpecFigure["segments"];
  /** Droites supplémentaires (directrice donnée…). */
  droites?: SpecFigure["droites"];
  /** Points à faire entrer dans le cadre en plus des éléments. */
  cadre?: P[];
  /** Fenêtre imposée (bornes entières). */
  fenetre?: SpecFigure["fenetre"];
  largeur?: number;
}

/** Fenêtre entière couvrant les éléments de la conique (mêmes bornes pour l'écran et le corrigé). */
export function fenetreConique(C: Conique, extra: P[] = []): SpecFigure["fenetre"] {
  const pts: P[] = [valP(centre(C)), ...sommets(C).map(valP), ...foyers(C).map(valP), ...extra];
  if (C.nature === "ellipse") {
    const b = Math.sqrt(C.b2);
    const a = Math.sqrt(C.a2);
    pts.push(C.axe === "x" ? { x: C.h, y: C.k + b } : { x: C.h + b, y: C.k }, C.axe === "x" ? { x: C.h - a, y: C.k - b } : { x: C.h - b, y: C.k - a });
  } else if (C.nature === "hyperbole") {
    const a = Math.sqrt(C.a2);
    const b = Math.sqrt(C.b2);
    const c = Math.sqrt(C.a2 + C.b2);
    const s = c + 1.5;
    pts.push(C.axe === "x" ? { x: C.h + s, y: C.k + b + 1 } : { x: C.h + b + 1, y: C.k + s }, C.axe === "x" ? { x: C.h - s, y: C.k - b - 1 } : { x: C.h - b - 1, y: C.k - s });
    void a;
  } else {
    const d = directrices(C)[0]!;
    const q = C.p;
    const dv = d.q + d.r * Math.sqrt(d.n);
    pts.push(C.axe === "x" ? { x: dv, y: C.k } : { x: C.h, y: dv });
    const loin = C.sens * Math.max(2 * q, 4);
    const larg = Math.sqrt(2 * q * Math.abs(loin));
    pts.push(C.axe === "x" ? { x: C.h + loin, y: C.k + larg } : { x: C.h + larg, y: C.k + loin }, C.axe === "x" ? { x: C.h + loin, y: C.k - larg } : { x: C.h - larg, y: C.k + loin });
  }
  let xMin = Math.floor(Math.min(...pts.map((p) => p.x)) - 1);
  let xMax = Math.ceil(Math.max(...pts.map((p) => p.x)) + 1);
  let yMin = Math.floor(Math.min(...pts.map((p) => p.y)) - 1);
  let yMax = Math.ceil(Math.max(...pts.map((p) => p.y)) + 1);
  xMin = Math.min(xMin, -1);
  yMin = Math.min(yMin, -1);
  xMax = Math.max(xMax, 1);
  yMax = Math.max(yMax, 1);
  return { xMin, xMax, yMin, yMax };
}

export function figureConique(C: Conique, o: OptionsFigureConique = {}): string {
  const fenetre = o.fenetre ?? fenetreConique(C, o.cadre);
  const etendue = Math.max(fenetre.xMax - fenetre.xMin, fenetre.yMax - fenetre.yMin);
  const unite = Math.max(9, Math.min(24, Math.floor((o.largeur ?? 300) / etendue)));
  const lab = o.etiquettes !== false;
  const pts: NonNullable<SpecFigure["points"]> = [];
  const centree = C.nature !== "parabole";
  if (o.centre && centree) pts.push({ P: valP(centre(C)), label: lab ? "Ω" : undefined, couleur: COULEURS.noir });
  if (o.sommets) {
    const noms = C.nature === "ellipse" ? ["A", "A′", "B", "B′"] : C.nature === "hyperbole" ? ["A", "A′"] : ["S"];
    sommets(C).forEach((s, i) => pts.push({ P: valP(s), label: lab ? noms[i] : undefined, couleur: COULEURS.noir }));
  }
  if (o.foyers) foyers(C).forEach((f, i) => pts.push({ P: valP(f), label: lab ? (i === 0 ? "F" : "F′") : undefined, couleur: COULEURS.accent }));
  const droites: NonNullable<SpecFigure["droites"]> = [...(o.droites ?? [])];
  if (o.directrices) directrices(C).forEach((v, i, t) => droites.push({ d: directriceD(C, v), couleur: COULEURS.gris, pointille: true, label: lab ? (t.length === 1 ? "d" : i === 0 ? "d" : "d′") : undefined }));
  if (o.asymptotes && C.nature === "hyperbole") asymptotes(C).forEach((d) => droites.push({ d, couleur: COULEURS.gris, pointille: true, epaisseur: 1.4 }));
  const segments: NonNullable<SpecFigure["segments"]> = [...(o.segments ?? [])];
  if (o.rectangle && C.nature === "hyperbole") {
    const a = Math.sqrt(C.a2);
    const b = Math.sqrt(C.b2);
    const [u, v] = C.axe === "x" ? [a, b] : [b, a];
    const coins = [
      { x: C.h + u, y: C.k + v },
      { x: C.h - u, y: C.k + v },
      { x: C.h - u, y: C.k - v },
      { x: C.h + u, y: C.k - v },
    ];
    coins.forEach((A, i) => segments.push({ A, B: coins[(i + 1) % 4]!, couleur: COULEURS.gris, pointille: true, epaisseur: 1 }));
  }
  return figureRepere({
    fenetre,
    unite,
    graduationsLisibles: true,
    courbes: o.courbe === false ? [] : branches(C, etendue + 4).map((points) => ({ points, couleur: COULEURS.bleu })),
    droites,
    segments,
    points: [...pts, ...(o.points ?? [])],
  });
}
