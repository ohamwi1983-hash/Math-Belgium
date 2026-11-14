import type { ExerciceFonctionAire } from "../core6e/fonctionAire.types";
import {
  aireNumerique,
  bornesDomaine,
  candidatGraphique,
  evaluerF,
  pointsTableau,
  signeEntre,
  sommets,
  zerosInterieurs,
} from "../moteur6e/modeleFonctionAire";
import { COULEURS } from "./figureRepereIntegrales";

/**
 * Figures de `6gen78` « La fonction aire » — chaînes SVG AUTONOMES (écran : `dangerouslySetInnerHTML` ;
 * papier : `enteteHtml` et `EtapeCorrection.figureHtml`). Contrairement aux figures de 6gen26-28
 * (`figureRepereIntegrales.ts`, dont on ne reprend que les jetons de couleur), la courbe de f se LIT
 * sur un QUADRILLAGE d'unité 1 : les sommets sont entiers, les aires se comptent en carreaux.
 *
 * - Énoncé : courbe de f seule, sans hachure (le signe et la découpe sont à trouver).
 * - Corrigé : courbe de f avec les aires signées utilisées (vert au-dessus de l'axe, rouge en
 *   dessous), puis la courbe de A avec ses points remarquables.
 * - Variante `graphique` : 4 graphiques candidats numérotés 1 à 4, même fenêtre pour les quatre.
 */

type Pt = [number, number];

interface CourbeGraphe {
  pts: Pt[];
  couleur: string;
  epaisseur?: number;
  etiquette?: string;
}

interface RegionGraphe {
  pts: Pt[];
  remplissage: string;
  contour: string;
}

interface OptionsGraphe {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  pasY?: number;
  courbes: CourbeGraphe[];
  regions?: RegionGraphe[];
  points?: { x: number; y: number; couleur: string }[];
  libelle: string;
  /** Titre posé en haut à gauche (« Graphique 2 »). */
  titre?: string;
  largeur?: number;
  hauteurMax?: number;
}

const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = `stroke="var(--surface, #ffffff)" stroke-width="3" stroke-linejoin="round" paint-order="stroke"`;

let compteur = 0;

function f1(v: number): string {
  return Number.isFinite(v) ? v.toFixed(1) : "0";
}

function nombreTexte(n: number): string {
  return String(n).replace("-", "−").replace(".", ",");
}

function grapheSvg(o: OptionsGraphe): string {
  const id = `fa${++compteur}`;
  const L = o.largeur ?? 340;
  const marge = { g: 24, d: 16, h: o.titre ? 24 : 14, b: 22 };
  const uX = (L - marge.g - marge.d) / (o.xMax - o.xMin);
  const hauteurMax = o.hauteurMax ?? 320;
  const uY = Math.min(uX, (hauteurMax - marge.h - marge.b) / (o.yMax - o.yMin));
  const H = marge.h + marge.b + uY * (o.yMax - o.yMin);
  const sx = (x: number) => marge.g + (x - o.xMin) * uX;
  const sy = (y: number) => marge.h + (o.yMax - y) * uY;
  const pas = o.pasY ?? 1;
  const morceaux: string[] = [];

  morceaux.push(
    `<defs><marker id="${id}fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COULEURS.doux}"/></marker>` +
      `<clipPath id="${id}c"><rect x="${f1(sx(o.xMin))}" y="${f1(sy(o.yMax))}" width="${f1(sx(o.xMax) - sx(o.xMin))}" height="${f1(sy(o.yMin) - sy(o.yMax))}"/></clipPath></defs>`,
  );
  if (o.titre) morceaux.push(`<text x="4" y="15" font-size="13" font-weight="600" fill="${COULEURS.encre}" ${POLICE}>${o.titre}</text>`);

  // Quadrillage d'unité 1 en abscisse, `pas` en ordonnée.
  for (let x = Math.ceil(o.xMin); x <= o.xMax; x++) {
    morceaux.push(`<line x1="${f1(sx(x))}" y1="${f1(sy(o.yMin))}" x2="${f1(sx(x))}" y2="${f1(sy(o.yMax))}" stroke="${COULEURS.pale}" stroke-width="0.6" stroke-opacity="0.55"/>`);
  }
  for (let y = Math.ceil(o.yMin / pas) * pas; y <= o.yMax; y += pas) {
    morceaux.push(`<line x1="${f1(sx(o.xMin))}" y1="${f1(sy(y))}" x2="${f1(sx(o.xMax))}" y2="${f1(sy(y))}" stroke="${COULEURS.pale}" stroke-width="0.6" stroke-opacity="0.55"/>`);
  }

  for (const r of o.regions ?? []) {
    morceaux.push(
      `<polygon clip-path="url(#${id}c)" points="${r.pts.map(([x, y]) => `${f1(sx(x))},${f1(sy(y))}`).join(" ")}" fill="${r.remplissage}" fill-opacity="0.85" stroke="${r.contour}" stroke-width="0.8"/>`,
    );
  }

  // Axes fléchés (x = 0 et y = 0 sont toujours dans la fenêtre).
  morceaux.push(
    `<line x1="${f1(sx(o.xMin))}" y1="${f1(sy(0))}" x2="${f1(sx(o.xMax) + 8)}" y2="${f1(sy(0))}" stroke="${COULEURS.doux}" stroke-width="1.2" marker-end="url(#${id}fl)"/>`,
    `<line x1="${f1(sx(0))}" y1="${f1(sy(o.yMin))}" x2="${f1(sx(0))}" y2="${f1(sy(o.yMax) - 8)}" stroke="${COULEURS.doux}" stroke-width="1.2" marker-end="url(#${id}fl)"/>`,
  );
  const etiquettes: string[] = [];
  for (let x = Math.ceil(o.xMin); x <= o.xMax; x++) {
    if (x === 0) continue;
    etiquettes.push(`<text x="${f1(sx(x))}" y="${f1(sy(0) + 14)}" font-size="11" text-anchor="middle" fill="${COULEURS.doux}" ${HALO} ${POLICE}>${nombreTexte(x)}</text>`);
  }
  // Graduations de l'axe vertical : une sur deux quand les carreaux sont petits (graphiques candidats),
  // sinon « −1 » chevauche les nombres de l'axe horizontal.
  const pasEtiquette = uY * pas < 17 ? 2 * pas : pas;
  for (let y = Math.ceil(o.yMin / pasEtiquette) * pasEtiquette; y <= o.yMax; y += pasEtiquette) {
    if (y === 0) continue;
    etiquettes.push(`<text x="${f1(sx(0) - 4)}" y="${f1(sy(y) + 4)}" font-size="11" text-anchor="end" fill="${COULEURS.doux}" ${HALO} ${POLICE}>${nombreTexte(y)}</text>`);
  }
  etiquettes.push(`<text x="${f1(sx(0) - 4)}" y="${f1(sy(0) + 14)}" font-size="11" text-anchor="end" fill="${COULEURS.doux}" ${HALO} ${POLICE}>0</text>`);

  for (const c of o.courbes) {
    const d = c.pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${f1(sx(x))},${f1(sy(y))}`).join(" ");
    morceaux.push(`<path clip-path="url(#${id}c)" d="${d}" fill="none" stroke="${c.couleur}" stroke-width="${c.epaisseur ?? 2.4}" stroke-linejoin="round" stroke-linecap="round"/>`);
    if (c.etiquette && c.pts.length > 0) {
      const [x, y] = c.pts[c.pts.length - 1];
      const yc = Math.max(o.yMin + 0.3, Math.min(o.yMax - 0.3, y));
      etiquettes.push(`<text x="${f1(sx(x) + 6)}" y="${f1(sy(yc) + (yc >= 0 ? -4 : 12))}" font-size="13" font-style="italic" font-weight="600" text-anchor="start" fill="${c.couleur}" ${HALO} ${POLICE}>${c.etiquette}</text>`);
    }
  }
  for (const p of o.points ?? []) morceaux.push(`<circle cx="${f1(sx(p.x))}" cy="${f1(sy(p.y))}" r="3.4" fill="${p.couleur}" stroke="var(--surface, #ffffff)" stroke-width="1"/>`);
  morceaux.push(...etiquettes);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f1(L)} ${f1(H)}" width="${f1(L)}" height="${f1(H)}" style="width:${f1(L)}px;max-width:100%;height:auto" role="img" aria-label="${o.libelle}">${morceaux.join("")}</svg>`;
}

/** Polyligne de f : sommets exacts, demi-disques échantillonnés. */
function pointsCourbeF(e: ExerciceFonctionAire, de?: number, a?: number): Pt[] {
  const { x0, xn } = bornesDomaine(e);
  const u = de ?? x0;
  const v = a ?? xn;
  const xs = new Set<number>([u, v]);
  for (const s of sommets(e)) if (s.x > u && s.x < v) xs.add(s.x);
  for (const m of e.morceaux) {
    if (m.type !== "demiDisque") continue;
    for (let k = 1; k < 48; k++) {
      const x = m.centre - m.rayon + (2 * m.rayon * k) / 48;
      if (x > u && x < v) xs.add(x);
    }
  }
  return [...xs].sort((p, q) => p - q).map((x) => [x, evaluerF(e, x)] as Pt);
}

function pointsFonction(fn: (x: number) => number, de: number, a: number, n = 160): Pt[] {
  return Array.from({ length: n + 1 }, (_, k) => {
    const x = de + ((a - de) * k) / n;
    return [x, fn(x)] as Pt;
  });
}

function fenetreF(e: ExerciceFonctionAire): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const { x0, xn } = bornesDomaine(e);
  const ys = pointsCourbeF(e).map(([, y]) => y);
  return { xMin: Math.min(x0, 0) - 0.6, xMax: Math.max(xn, 0) + 0.6, yMin: Math.min(-1, ...ys) - 0.6, yMax: Math.max(1, ...ys) + 0.6 };
}

function courbeF(e: ExerciceFonctionAire): CourbeGraphe {
  return { pts: pointsCourbeF(e), couleur: COULEURS.accent, etiquette: "f" };
}

/** Courbe de f (énoncé) : quadrillage, sans hachure. */
export function figureFonctionF(e: ExerciceFonctionAire): string {
  return grapheSvg({ ...fenetreF(e), courbes: [courbeF(e)], libelle: "Courbe de la fonction f sur un quadrillage d'unité 1" });
}

/** Régions signées entre u et v (vert : f > 0, rouge : f < 0), coupées aux zéros de f. */
function regionsSignees(e: ExerciceFonctionAire, u: number, v: number): RegionGraphe[] {
  const coupes = [...new Set([u, v, ...zerosInterieurs(e).map((z) => z.x)])].filter((x) => x >= u && x <= v).sort((p, q) => p - q);
  const res: RegionGraphe[] = [];
  for (let i = 0; i + 1 < coupes.length; i++) {
    const s = signeEntre(e, coupes[i], coupes[i + 1]);
    if (s === 0) continue;
    const haut = pointsCourbeF(e, coupes[i], coupes[i + 1]);
    res.push({
      pts: [[coupes[i], 0], ...haut, [coupes[i + 1], 0]],
      remplissage: s > 0 ? COULEURS.bonDoux : COULEURS.mauvaisDoux,
      contour: s > 0 ? COULEURS.bon : COULEURS.mauvais,
    });
  }
  return res;
}

function etendue(valeurs: number[]): { min: number; max: number } {
  return { min: Math.min(0, ...valeurs), max: Math.max(0, ...valeurs) };
}

function fenetreA(e: ExerciceFonctionAire, fns: ((x: number) => number)[]): { yMin: number; yMax: number; pasY: number } {
  const { x0, xn } = bornesDomaine(e);
  const ys = fns.flatMap((fn) => pointsFonction(fn, x0, xn, 80).map(([, y]) => y));
  const { min, max } = etendue(ys);
  const pasY = max - min > 12 ? 2 : 1;
  return { yMin: Math.min(-1, min) - 0.6, yMax: Math.max(1, max) + 0.6, pasY };
}

/** Corrigé : f avec les aires signées de [u ; v], puis la courbe de A et ses points `marques`. */
export function figureCorrigeFonctionAire(e: ExerciceFonctionAire, u: number, v: number, marques: number[]): string {
  const { x0, xn } = bornesDomaine(e);
  const fen = fenetreF(e);
  const figF = grapheSvg({ ...fen, courbes: [courbeF(e)], regions: regionsSignees(e, Math.min(u, v), Math.max(u, v)), libelle: "Courbe de f et aires signées utilisées", largeur: 290 });
  const A = (x: number) => aireNumerique(e, x);
  const figA = grapheSvg({
    xMin: fen.xMin,
    xMax: fen.xMax,
    ...fenetreA(e, [A]),
    courbes: [{ pts: pointsFonction(A, x0, xn), couleur: COULEURS.ciel, etiquette: "A" }],
    points: [...new Set([e.a, ...marques])].map((x) => ({ x, y: A(x), couleur: x === e.a ? COULEURS.encre : COULEURS.ciel })),
    libelle: "Courbe de la fonction aire A",
    largeur: 290,
  });
  return `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">${figF}${figA}</div>`;
}

/** Variante `graphique` : SVG du candidat d'indice canonique `indice`, titré « Graphique n ». */
export function figureCandidat(e: ExerciceFonctionAire, indice: number, numero: number, largeur = 260): string {
  const { x0, xn } = bornesDomaine(e);
  const fen = fenetreF(e);
  const fns = [0, 1, 2, 3].map((i) => (x: number) => candidatGraphique(e, i, x));
  const pts = indice === 1 ? pointsCourbeF(e) : pointsFonction(fns[indice], x0, xn);
  return grapheSvg({
    xMin: fen.xMin,
    xMax: fen.xMax,
    ...fenetreA(e, fns),
    courbes: [{ pts, couleur: COULEURS.ciel }],
    titre: `Graphique ${numero}`,
    largeur,
    hauteurMax: 260,
    libelle: `Graphique ${numero}`,
  });
}

/** Figure du corrigé de l'exercice (écran final et `figureHtml` du corrigé papier) : aires utilisées
 * et points de la courbe de A propres à la variante. */
export function figureCorrigeExercice(e: ExerciceFonctionAire): string {
  const { x0, xn } = bornesDomaine(e);
  switch (e.variante) {
    case "valeurs": {
      const xs = [e.a, ...e.points];
      return figureCorrigeFonctionAire(e, Math.min(...xs), Math.max(...xs), e.points);
    }
    case "pente":
      return figureCorrigeFonctionAire(e, e.a, e.points[0], [e.points[0]]);
    default:
      return figureCorrigeFonctionAire(e, x0, xn, pointsTableau(e));
  }
}
