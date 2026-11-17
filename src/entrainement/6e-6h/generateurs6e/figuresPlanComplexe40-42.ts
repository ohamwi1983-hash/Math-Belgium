/**
 * Plan complexe SVG AUTONOME pour les corrigés papier de 6gen40 (transformations), 6gen41 (triangles)
 * et 6gen42 (lieux géométriques) — `EtapeCorrection.figureHtml`. Même contrat que
 * `ui6e/figureRepereIntegrales.ts` : chaque couleur est un jeton du thème avec une valeur de repli
 * littérale (impression hors de la page), axes fléchés, repère ORTHONORMÉ (une unité a la même
 * longueur sur les deux axes : un cercle reste rond, un angle droit reste droit), quadrillage
 * entier, fenêtre calculée UNE fois à partir du contenu (figure statique).
 *
 * Jamais utilisé dans l'énoncé : une figure de 6gen41 trahirait les verdicts (isocèle, rectangle,
 * alignés…), celles de 6gen40/6gen42 montrent la réponse.
 */
import { COULEURS } from "../ui6e/figureRepereIntegrales";

export { COULEURS };

export type Coord = [number, number];

export interface PointPlan {
  x: number;
  y: number;
  etiquette?: string;
  couleur?: string;
  /** Point exclu (rond vide). */
  creux?: boolean;
  /** Position de l'étiquette par rapport au point (défaut : au-dessus à droite). */
  position?: "ne" | "no" | "se" | "so" | "n" | "s" | "e" | "o";
}

export interface SegmentPlan {
  de: Coord;
  a: Coord;
  couleur?: string;
  pointilles?: boolean;
  /** Flèche à l'extrémité `a` (vecteur). */
  fleche?: boolean;
  epaisseur?: number;
}

export interface DroitePlan {
  p1: Coord;
  p2: Coord;
  couleur?: string;
  pointilles?: boolean;
  epaisseur?: number;
}

export interface DemiDroitePlan {
  origine: Coord;
  /** Angle avec l'axe réel, en radians. */
  angle: number;
  /** Distance à l'origine à partir de laquelle la demi-droite est tracée (0 par défaut). */
  depuis?: number;
  couleur?: string;
  epaisseur?: number;
  /** Bord exclu d'une région (6gen98). */
  pointilles?: boolean;
}

export interface CerclePlan {
  cx: number;
  cy: number;
  r: number;
  couleur?: string;
  pointilles?: boolean;
  epaisseur?: number;
}

export interface PolygonePlan {
  sommets: Coord[];
  couleur: string;
  remplissage?: string;
  pointilles?: boolean;
}

/** Condition d'une région remplie (6gen98), en coordonnées du repère. */
export type ConditionRegionPlan =
  | { type: "disque"; cx: number; cy: number; r: number; interieur: boolean }
  /** Demi-plan des points P tels que n·(P − p) ≥ 0. */
  | { type: "demiPlan"; px: number; py: number; nx: number; ny: number }
  /** Secteur de sommet s balayé de l'angle `de` à l'angle `a` (radians, `de` < `a`) dans le sens direct. */
  | { type: "secteur"; sx: number; sy: number; de: number; a: number };

/** Région remplie = intersection de ses conditions (6gen98). */
export interface RegionPlan {
  conditions: ConditionRegionPlan[];
  couleur?: string;
  opacite?: number;
}

export interface OptionsPlan {
  /** Régions remplies, dessinées sous les axes (6gen98). */
  regions?: RegionPlan[];
  points?: PointPlan[];
  segments?: SegmentPlan[];
  droites?: DroitePlan[];
  demiDroites?: DemiDroitePlan[];
  cercles?: CerclePlan[];
  polygones?: PolygonePlan[];
  /** Points à garder dans la fenêtre sans les dessiner. */
  inclure?: Coord[];
  /** Fenêtre imposée (bornes entières, carrée) au lieu de la fenêtre ajustée au contenu — 6gen95 :
   * repère fixe [−5 ; 5]², qui ne trahit pas la position des points à placer. */
  fenetreFixe?: { xMin: number; xMax: number; yMin: number; yMax: number };
  /** Préfixe des identifiants SVG (déterministe, dérivé du contenu) au lieu du compteur global. */
  idBase?: string;
  libelle: string;
}

const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = `stroke="var(--surface, #ffffff)" stroke-width="3" stroke-linejoin="round" paint-order="stroke"`;

function f1(v: number): string {
  return Number.isFinite(v) ? v.toFixed(1) : "0";
}

function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

let compteurFigures = 0;

/** Fenêtre carrée à bornes entières contenant tout le contenu (et l'origine), avec une marge. */
function fenetre(o: OptionsPlan): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const xs: number[] = [0];
  const ys: number[] = [0];
  const ajouter = ([x, y]: Coord) => {
    if (Number.isFinite(x) && Number.isFinite(y)) {
      xs.push(x);
      ys.push(y);
    }
  };
  (o.points ?? []).forEach((p) => ajouter([p.x, p.y]));
  (o.segments ?? []).forEach((s) => {
    ajouter(s.de);
    ajouter(s.a);
  });
  (o.droites ?? []).forEach((d) => {
    ajouter(d.p1);
    ajouter(d.p2);
  });
  (o.demiDroites ?? []).forEach((d) => {
    ajouter(d.origine);
    const r = (d.depuis ?? 0) + 1.5;
    ajouter([d.origine[0] + r * Math.cos(d.angle), d.origine[1] + r * Math.sin(d.angle)]);
  });
  (o.cercles ?? []).forEach((c) => {
    ajouter([c.cx - c.r, c.cy - c.r]);
    ajouter([c.cx + c.r, c.cy + c.r]);
  });
  (o.polygones ?? []).forEach((p) => p.sommets.forEach(ajouter));
  (o.inclure ?? []).forEach(ajouter);
  const xMin0 = Math.min(...xs) - 1;
  const xMax0 = Math.max(...xs) + 1;
  const yMin0 = Math.min(...ys) - 1;
  const yMax0 = Math.max(...ys) + 1;
  const etendue = Math.max(4, Math.ceil(Math.max(xMax0 - xMin0, yMax0 - yMin0)));
  const cx = (xMin0 + xMax0) / 2;
  const cy = (yMin0 + yMax0) / 2;
  const xMin = Math.floor(cx - etendue / 2);
  const yMin = Math.floor(cy - etendue / 2);
  return { xMin, xMax: xMin + etendue + 1, yMin, yMax: yMin + etendue + 1 };
}

const DECALAGES: Record<NonNullable<PointPlan["position"]>, { dx: number; dy: number; ancre: string }> = {
  ne: { dx: 6, dy: -6, ancre: "start" },
  no: { dx: -6, dy: -6, ancre: "end" },
  se: { dx: 6, dy: 15, ancre: "start" },
  so: { dx: -6, dy: 15, ancre: "end" },
  n: { dx: 0, dy: -8, ancre: "middle" },
  s: { dx: 0, dy: 17, ancre: "middle" },
  e: { dx: 8, dy: 4, ancre: "start" },
  o: { dx: -8, dy: 4, ancre: "end" },
};

export function planComplexeSvg(o: OptionsPlan): string {
  const id = o.idBase ?? `pc${++compteurFigures}`;
  const { xMin, xMax, yMin, yMax } = o.fenetreFixe ?? fenetre(o);
  const marge = 22;
  const cote = 300;
  const unite = (cote - 2 * marge) / (xMax - xMin);
  const sx = (x: number) => marge + (x - xMin) * unite;
  const sy = (y: number) => cote - marge - (y - yMin) * unite;
  const etendue = xMax - xMin;
  const pas = etendue > 24 ? 5 : etendue > 13 ? 2 : 1;
  const morceaux: string[] = [];

  // Une flèche par couleur utilisée (le `fill` d'un marqueur ne suit pas le trait qui le porte).
  const couleursFleches = Array.from(new Set((o.segments ?? []).filter((s) => s.fleche).map((s) => s.couleur ?? COULEURS.accent)));
  const idFleche = (c: string) => `${id}f${couleursFleches.indexOf(c)}`;
  morceaux.push(
    `<defs><marker id="${id}ax" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COULEURS.doux}"/></marker>` +
      couleursFleches
        .map((c) => `<marker id="${idFleche(c)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker>`)
        .join("") +
      `<clipPath id="${id}cadre"><rect x="${marge}" y="${marge}" width="${cote - 2 * marge}" height="${cote - 2 * marge}"/></clipPath></defs>`,
  );

  // Quadrillage entier.
  for (let x = Math.ceil(xMin); x <= xMax; x++) {
    morceaux.push(`<line x1="${f1(sx(x))}" y1="${f1(sy(yMin))}" x2="${f1(sx(x))}" y2="${f1(sy(yMax))}" stroke="${COULEURS.pale}" stroke-width="0.4" stroke-opacity="0.6"/>`);
  }
  for (let y = Math.ceil(yMin); y <= yMax; y++) {
    morceaux.push(`<line x1="${f1(sx(xMin))}" y1="${f1(sy(y))}" x2="${f1(sx(xMax))}" y2="${f1(sy(y))}" stroke="${COULEURS.pale}" stroke-width="0.4" stroke-opacity="0.6"/>`);
  }

  // Régions remplies (6gen98) : intersection des conditions par clipPaths imbriqués.
  const loinRegion = 4 * (xMax - xMin);
  (o.regions ?? []).forEach((reg, ri) => {
    const chemins = reg.conditions.map((c) => cheminCondition(c, sx, sy, unite, { xMin: xMin - loinRegion, xMax: xMax + loinRegion, yMin: yMin - loinRegion, yMax: yMax + loinRegion }));
    if (chemins.length === 0) return;
    const clips = chemins.slice(0, -1).map((d, j) => `<clipPath id="${id}r${ri}c${j}"><path d="${d}" clip-rule="evenodd"/></clipPath>`);
    let interieur = `<path d="${chemins[chemins.length - 1]}" fill-rule="evenodd" fill="${reg.couleur ?? COULEURS.ciel}" fill-opacity="${reg.opacite ?? 0.3}"/>`;
    for (let j = chemins.length - 2; j >= 0; j--) interieur = `<g clip-path="url(#${id}r${ri}c${j})">${interieur}</g>`;
    morceaux.push(`${clips.length ? `<defs>${clips.join("")}</defs>` : ""}<g clip-path="url(#${id}cadre)">${interieur}</g>`);
  });

  // Axes fléchés (l'origine est toujours dans la fenêtre).
  morceaux.push(
    `<line x1="${f1(sx(xMin))}" y1="${f1(sy(0))}" x2="${f1(sx(xMax) + 8)}" y2="${f1(sy(0))}" stroke="${COULEURS.doux}" stroke-width="1.1" marker-end="url(#${id}ax)"/>`,
    `<line x1="${f1(sx(0))}" y1="${f1(sy(yMin))}" x2="${f1(sx(0))}" y2="${f1(sy(yMax) - 8)}" stroke="${COULEURS.doux}" stroke-width="1.1" marker-end="url(#${id}ax)"/>`,
    `<text x="${f1(sx(xMax) + 2)}" y="${f1(sy(0) + 15)}" font-size="11" fill="${COULEURS.doux}" ${POLICE}>Re</text>`,
    `<text x="${f1(sx(0) + 5)}" y="${f1(sy(yMax) - 2)}" font-size="11" fill="${COULEURS.doux}" ${POLICE}>Im</text>`,
  );
  const etiquettesAxes: string[] = [];
  for (let x = Math.ceil(xMin / pas) * pas; x < xMax; x += pas) {
    if (x === 0) continue;
    morceaux.push(`<line x1="${f1(sx(x))}" y1="${f1(sy(0) - 3)}" x2="${f1(sx(x))}" y2="${f1(sy(0) + 3)}" stroke="${COULEURS.doux}" stroke-width="1"/>`);
    etiquettesAxes.push(`<text x="${f1(sx(x))}" y="${f1(sy(0) + 13)}" font-size="9.5" text-anchor="middle" fill="${COULEURS.doux}" ${HALO} ${POLICE}>${`${x}`.replace("-", "−")}</text>`);
  }
  for (let y = Math.ceil(yMin / pas) * pas; y < yMax; y += pas) {
    if (y === 0) continue;
    morceaux.push(`<line x1="${f1(sx(0) - 3)}" y1="${f1(sy(y))}" x2="${f1(sx(0) + 3)}" y2="${f1(sy(y))}" stroke="${COULEURS.doux}" stroke-width="1"/>`);
    etiquettesAxes.push(`<text x="${f1(sx(0) - 5)}" y="${f1(sy(y) + 3.5)}" font-size="9.5" text-anchor="end" fill="${COULEURS.doux}" ${HALO} ${POLICE}>${`${y}`.replace("-", "−")}</text>`);
  }
  // Pas de second « O » quand un point de la figure s'appelle déjà O et est à l'origine (6gen41).
  const pointO = (o.points ?? []).some((p) => p.etiquette === "O" && Math.abs(p.x) < 1e-9 && Math.abs(p.y) < 1e-9);
  if (!pointO) etiquettesAxes.push(`<text x="${f1(sx(0) - 5)}" y="${f1(sy(0) + 13)}" font-size="10" text-anchor="end" fill="${COULEURS.doux}" ${HALO} ${POLICE}>O</text>`);

  const loin = 4 * etendue;
  const tirets = (p?: boolean) => (p ? ' stroke-dasharray="5 4"' : "");

  for (const p of o.polygones ?? []) {
    morceaux.push(
      `<polygon clip-path="url(#${id}cadre)" points="${p.sommets.map(([x, y]) => `${f1(sx(x))},${f1(sy(y))}`).join(" ")}" fill="${p.remplissage ?? "none"}" fill-opacity="0.45" stroke="${p.couleur}" stroke-width="1.6"${tirets(p.pointilles)}/>`,
    );
  }
  for (const c of o.cercles ?? []) {
    morceaux.push(
      `<circle clip-path="url(#${id}cadre)" cx="${f1(sx(c.cx))}" cy="${f1(sy(c.cy))}" r="${f1(c.r * unite)}" fill="none" stroke="${c.couleur ?? COULEURS.accent}" stroke-width="${c.epaisseur ?? 1.6}"${tirets(c.pointilles)}/>`,
    );
  }
  for (const d of o.droites ?? []) {
    const ux = d.p2[0] - d.p1[0];
    const uy = d.p2[1] - d.p1[1];
    const n = Math.hypot(ux, uy) || 1;
    const a: Coord = [d.p1[0] - (loin * ux) / n, d.p1[1] - (loin * uy) / n];
    const b: Coord = [d.p1[0] + (loin * ux) / n, d.p1[1] + (loin * uy) / n];
    morceaux.push(
      `<line clip-path="url(#${id}cadre)" x1="${f1(sx(a[0]))}" y1="${f1(sy(a[1]))}" x2="${f1(sx(b[0]))}" y2="${f1(sy(b[1]))}" stroke="${d.couleur ?? COULEURS.accent}" stroke-width="${d.epaisseur ?? 1.6}"${tirets(d.pointilles)}/>`,
    );
  }
  for (const d of o.demiDroites ?? []) {
    const r0 = d.depuis ?? 0;
    const a: Coord = [d.origine[0] + r0 * Math.cos(d.angle), d.origine[1] + r0 * Math.sin(d.angle)];
    const b: Coord = [d.origine[0] + loin * Math.cos(d.angle), d.origine[1] + loin * Math.sin(d.angle)];
    morceaux.push(
      `<line clip-path="url(#${id}cadre)" x1="${f1(sx(a[0]))}" y1="${f1(sy(a[1]))}" x2="${f1(sx(b[0]))}" y2="${f1(sy(b[1]))}" stroke="${d.couleur ?? COULEURS.accent}" stroke-width="${d.epaisseur ?? 2}"${tirets(d.pointilles)}/>`,
    );
  }
  for (const s of o.segments ?? []) {
    const couleur = s.couleur ?? COULEURS.accent;
    morceaux.push(
      `<line x1="${f1(sx(s.de[0]))}" y1="${f1(sy(s.de[1]))}" x2="${f1(sx(s.a[0]))}" y2="${f1(sy(s.a[1]))}" stroke="${couleur}" stroke-width="${s.epaisseur ?? (s.fleche ? 1.6 : 1.2)}"${tirets(s.pointilles)}${s.fleche ? ` marker-end="url(#${idFleche(couleur)})"` : ""}/>`,
    );
  }
  const etiquettesPoints: string[] = [];
  for (const p of o.points ?? []) {
    const couleur = p.couleur ?? COULEURS.encre;
    morceaux.push(
      p.creux
        ? `<circle cx="${f1(sx(p.x))}" cy="${f1(sy(p.y))}" r="3.6" fill="var(--surface, #ffffff)" stroke="${couleur}" stroke-width="1.5"/>`
        : `<circle cx="${f1(sx(p.x))}" cy="${f1(sy(p.y))}" r="3.2" fill="${couleur}"/>`,
    );
    if (p.etiquette) {
      const d = DECALAGES[p.position ?? "ne"];
      etiquettesPoints.push(
        `<text x="${f1(sx(p.x) + d.dx)}" y="${f1(sy(p.y) + d.dy)}" font-size="12.5" font-weight="600" text-anchor="${d.ancre}" fill="${couleur}" ${HALO} ${POLICE}>${echapper(p.etiquette)}</text>`,
      );
    }
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cote} ${cote}" width="100%" style="max-width:${cote}px;display:block;margin:0.4em auto" role="img" aria-label="${echapper(o.libelle)}">` +
    morceaux.join("") +
    etiquettesAxes.join("") +
    etiquettesPoints.join("") +
    `</svg>`
  );
}

/** Chemin SVG (coordonnées écran) d'une condition de région, à remplir en `evenodd` (l'extérieur
 * d'un disque = grand rectangle percé du cercle). `boite` : rectangle « infini » du repère. */
function cheminCondition(
  c: ConditionRegionPlan,
  sx: (x: number) => number,
  sy: (y: number) => number,
  unite: number,
  boite: { xMin: number; xMax: number; yMin: number; yMax: number },
): string {
  const polygone = (pts: Coord[]) => (pts.length ? `M${pts.map(([x, y]) => `${f1(sx(x))},${f1(sy(y))}`).join(" L")} Z` : "");
  const coins: Coord[] = [
    [boite.xMin, boite.yMin],
    [boite.xMax, boite.yMin],
    [boite.xMax, boite.yMax],
    [boite.xMin, boite.yMax],
  ];
  if (c.type === "disque") {
    const X = sx(c.cx);
    const Y = sy(c.cy);
    const R = c.r * unite;
    const cercle = `M${f1(X + R)},${f1(Y)} A${f1(R)},${f1(R)} 0 1 0 ${f1(X - R)},${f1(Y)} A${f1(R)},${f1(R)} 0 1 0 ${f1(X + R)},${f1(Y)} Z`;
    return c.interieur ? cercle : `${polygone(coins)} ${cercle}`;
  }
  if (c.type === "demiPlan") {
    // Sutherland–Hodgman : la boîte coupée par le demi-plan n·(P − p) ≥ 0.
    const f = ([x, y]: Coord) => c.nx * (x - c.px) + c.ny * (y - c.py);
    const res: Coord[] = [];
    for (let i = 0; i < coins.length; i++) {
      const p = coins[i];
      const q = coins[(i + 1) % coins.length];
      const fp = f(p);
      const fq = f(q);
      if (fp >= 0) res.push(p);
      if ((fp >= 0) !== (fq >= 0)) {
        const t = fp / (fp - fq);
        res.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
      }
    }
    return polygone(res);
  }
  const rayon = Math.max(boite.xMax - boite.xMin, boite.yMax - boite.yMin);
  const n = Math.max(2, Math.ceil((c.a - c.de) / (Math.PI / 8)));
  const pts: Coord[] = [[c.sx, c.sy]];
  for (let i = 0; i <= n; i++) {
    const t = c.de + ((c.a - c.de) * i) / n;
    pts.push([c.sx + rayon * Math.cos(t), c.sy + rayon * Math.sin(t)]);
  }
  return polygone(pts);
}

/** Position d'étiquette qui éloigne le texte du point `centre` (centre de gravité d'une figure). */
export function positionLoinDe(p: Coord, centre: Coord): PointPlan["position"] {
  const dx = p[0] - centre[0];
  const dy = p[1] - centre[1];
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return "ne";
  const angle = Math.atan2(dy, dx);
  const huitieme = Math.round(angle / (Math.PI / 4));
  const table: Record<number, PointPlan["position"]> = { 0: "e", 1: "ne", 2: "n", 3: "no", 4: "o", [-4]: "o", [-3]: "so", [-2]: "s", [-1]: "se" };
  return table[huitieme] ?? "ne";
}
