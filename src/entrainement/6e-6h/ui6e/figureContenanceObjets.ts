import type { ExerciceContenanceObjets } from "../core6e/contenanceObjets.types";
import { rayonProfil } from "../core6e/contenanceObjetsCalcul";
import { COULEURS, etiquetteNombre, repereSvg } from "./figureRepereIntegrales";
import type { EllipseRepere, RegionRepere, SegmentRepere } from "./figureRepereIntegrales";

/**
 * Figures de `6gen83` (chaînes SVG autonomes, couleurs par jetons du thème avec repli imprimable) :
 * - `figureEnonceHtml` : silhouette de l'objet DEBOUT avec ses cotes (hauteur totale, pied / fond /
 *   bouchon, diamètres) + le profil intérieur dans le repère de 6gen27 (axe de l'objet = axe des
 *   abscisses). Aucune borne nommée : elles se déduisent des cotes ;
 * - `figureCorrigeSvg` : le solide de révolution (région tournée, symétrique en pointillés,
 *   disques comme en 6gen27) et, pour la question de hauteur, le liquide jusqu'à t.
 */

const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = `stroke="var(--surface, #ffffff)" stroke-width="3" stroke-linejoin="round" paint-order="stroke"`;

function f1(v: number): string {
  return v.toFixed(1);
}

function cm(x: number): string {
  return `${etiquetteNombre(x)} cm`;
}

/** Rayon intérieur maximal sur [a ; b]. */
function rayonMax(e: ExerciceContenanceObjets): number {
  let m = 0;
  for (let i = 0; i <= 100; i++) m = Math.max(m, rayonProfil(e.profil, e.a + ((e.b - e.a) * i) / 100));
  return m;
}

function coteVerticale(x: number, y1: number, y2: number, etiquette: string, cote: "gauche" | "droite"): string {
  const t = 4;
  const tx = cote === "droite" ? x + 6 : x - 6;
  const ancre = cote === "droite" ? "start" : "end";
  return (
    `<line x1="${f1(x)}" y1="${f1(y1)}" x2="${f1(x)}" y2="${f1(y2)}" stroke="${COULEURS.doux}" stroke-width="1"/>` +
    `<line x1="${f1(x - t)}" y1="${f1(y1)}" x2="${f1(x + t)}" y2="${f1(y1)}" stroke="${COULEURS.doux}" stroke-width="1"/>` +
    `<line x1="${f1(x - t)}" y1="${f1(y2)}" x2="${f1(x + t)}" y2="${f1(y2)}" stroke="${COULEURS.doux}" stroke-width="1"/>` +
    `<text x="${f1(tx)}" y="${f1((y1 + y2) / 2 + 4)}" font-size="11" text-anchor="${ancre}" fill="${COULEURS.encre}" ${HALO} ${POLICE}>${etiquette}</text>`
  );
}

function coteHorizontale(x1: number, x2: number, y: number, etiquette: string, dessus = true): string {
  const t = 3;
  return (
    `<line x1="${f1(x1)}" y1="${f1(y)}" x2="${f1(x2)}" y2="${f1(y)}" stroke="${COULEURS.doux}" stroke-width="1"/>` +
    `<line x1="${f1(x1)}" y1="${f1(y - t)}" x2="${f1(x1)}" y2="${f1(y + t)}" stroke="${COULEURS.doux}" stroke-width="1"/>` +
    `<line x1="${f1(x2)}" y1="${f1(y - t)}" x2="${f1(x2)}" y2="${f1(y + t)}" stroke="${COULEURS.doux}" stroke-width="1"/>` +
    `<text x="${f1((x1 + x2) / 2)}" y="${f1(dessus ? y - 5 : y + 13)}" font-size="11" text-anchor="middle" fill="${COULEURS.encre}" ${HALO} ${POLICE}>${etiquette}</text>`
  );
}

function polygone(points: [number, number][], remplissage: string, contour: string, epaisseur = 1.2): string {
  return `<polygon points="${points.map(([x, y]) => `${f1(x)},${f1(y)}`).join(" ")}" fill="${remplissage}" stroke="${contour}" stroke-width="${epaisseur}" stroke-linejoin="round"/>`;
}

/** Silhouette debout, cotée. */
export function silhouetteSvg(e: ExerciceContenanceObjets): string {
  const L = 230;
  const H = 240;
  const R = rayonMax(e);
  const paroi = e.objet === "tonneau" || e.objet === "flacon" ? 0 : 0.35;
  const echelle = Math.min(190 / e.hauteurTotale, 120 / (2 * (R + paroi)));
  const cx = 105;
  const y0 = H - 22; // bas de l'objet
  const fondCavite = e.objet === "flacon" || e.objet === "tonneau" ? y0 : y0 - e.horsCavite * echelle;
  const y = (x: number) => fondCavite - (x - e.a) * echelle;
  const r = (x: number) => rayonProfil(e.profil, x) * echelle;
  const w = paroi * echelle + 2;
  const n = 60;
  const xs = Array.from({ length: n + 1 }, (_, i) => e.a + ((e.b - e.a) * i) / n);
  const gauche: [number, number][] = xs.map((x) => [cx - r(x), y(x)]);
  const droite: [number, number][] = xs.map((x) => [cx + r(x), y(x)]);
  const morceaux: string[] = [];
  const xMaxPx = cx + R * echelle + w;
  const xMinPx = cx - R * echelle - w;
  const haut = y(e.b);

  if (e.objet === "verre") {
    const pied = (R * echelle) / 1.3;
    morceaux.push(`<rect x="${f1(cx - 3)}" y="${f1(fondCavite)}" width="6" height="${f1(y0 - fondCavite - 2)}" fill="${COULEURS.cielDoux}" stroke="${COULEURS.ciel}" stroke-width="1.1"/>`);
    morceaux.push(`<ellipse cx="${f1(cx)}" cy="${f1(y0 - 2)}" rx="${f1(pied)}" ry="4" fill="${COULEURS.cielDoux}" stroke="${COULEURS.ciel}" stroke-width="1.1"/>`);
    const ext: [number, number][] = [...xs.map((x) => [cx - r(x) - w, y(x)] as [number, number]), ...xs.map((x) => [cx + r(x) + w, y(x)] as [number, number]).reverse()];
    ext.unshift([cx, fondCavite + w]);
    morceaux.push(polygone(ext, COULEURS.cielDoux, COULEURS.ciel));
    morceaux.push(polygone([...gauche, ...droite.reverse()], "var(--surface, #ffffff)", COULEURS.ciel, 1));
  } else if (e.objet === "vase" || e.objet === "pot") {
    const coul = e.objet === "pot" ? COULEURS.accent : COULEURS.ciel;
    const doux = e.objet === "pot" ? COULEURS.accentDoux : COULEURS.cielDoux;
    const ext: [number, number][] = [[cx - r(e.a) - w, y0], ...xs.map((x) => [cx - r(x) - w, y(x)] as [number, number]), ...xs.map((x) => [cx + r(x) + w, y(x)] as [number, number]).reverse(), [cx + r(e.a) + w, y0]];
    morceaux.push(polygone(ext, doux, coul));
    morceaux.push(polygone([...gauche, ...droite.reverse()], "var(--surface, #ffffff)", coul, 1));
  } else if (e.objet === "tonneau") {
    morceaux.push(polygone([...gauche, ...droite.reverse()], COULEURS.accentDoux, COULEURS.accent, 1.6));
    for (const p of [0.8, 0.45, -0.45, -0.8]) {
      const x = p * e.b;
      morceaux.push(`<line x1="${f1(cx - r(x))}" y1="${f1(y(x))}" x2="${f1(cx + r(x))}" y2="${f1(y(x))}" stroke="${COULEURS.accent}" stroke-width="1.6"/>`);
    }
    morceaux.push(`<ellipse cx="${f1(cx)}" cy="${f1(haut)}" rx="${f1(r(e.b))}" ry="4" fill="none" stroke="${COULEURS.accent}" stroke-width="1.2"/>`);
  } else {
    // Flacon : réservoir ellipsoïdal + bouchon.
    morceaux.push(polygone([...gauche, ...droite.reverse()], COULEURS.cielDoux, COULEURS.ciel, 1.6));
    const lb = Math.max(8, R * echelle * 0.45);
    morceaux.push(`<rect x="${f1(cx - lb / 2)}" y="${f1(haut - e.horsCavite * echelle)}" width="${f1(lb)}" height="${f1(e.horsCavite * echelle)}" rx="2" fill="${COULEURS.pale}" stroke="${COULEURS.doux}" stroke-width="1.1"/>`);
  }

  // Cotes.
  const yTop = e.objet === "flacon" ? haut - e.horsCavite * echelle : haut;
  morceaux.push(coteVerticale(xMaxPx + 16, yTop, y0, cm(e.hauteurTotale), "droite"));
  if (e.objet === "verre" || e.objet === "vase" || e.objet === "pot") morceaux.push(coteVerticale(xMinPx - 12, fondCavite, y0, cm(e.horsCavite), "gauche"));
  if (e.objet === "flacon") morceaux.push(coteVerticale(xMinPx - 12, yTop, haut, cm(e.horsCavite), "gauche"));
  if (e.objet === "pot") {
    morceaux.push(coteHorizontale(cx - r(e.b), cx + r(e.b), haut - 8, `Ø ${cm(2 * rayonProfil(e.profil, e.b))}`));
    morceaux.push(coteHorizontale(cx - r(e.a), cx + r(e.a), fondCavite - 9, `Ø ${cm(2 * rayonProfil(e.profil, e.a))}`));
  }
  if (e.objet === "tonneau") {
    morceaux.push(coteHorizontale(cx - r(0), cx + r(0), y(0) - 4, `Ø ${cm(2 * rayonProfil(e.profil, 0))}`));
    morceaux.push(coteHorizontale(cx - r(e.b), cx + r(e.b), haut - 9, `Ø ${cm(2 * rayonProfil(e.profil, e.b))}`));
  }
  const libelle = `Silhouette de l'objet debout, avec ses cotes (hauteur totale ${cm(e.hauteurTotale)})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" width="${L}" height="${H}" style="max-width:100%;height:auto" role="img" aria-label="${libelle}">${morceaux.join("")}</svg>`;
}

function pasPropre(etendue: number, cible: number): number {
  const brut = etendue / cible;
  const p = 10 ** Math.floor(Math.log10(brut));
  for (const m of [1, 2, 5, 10]) if (m * p >= brut) return m * p;
  return 10 * p;
}

function graduations(min: number, max: number, pas: number): number[] {
  const liste: number[] = [];
  for (let v = Math.ceil(min / pas) * pas; v <= max + 1e-9; v += pas) if (Math.abs(v) > 1e-9) liste.push(Math.round(v * 1000) / 1000);
  return liste;
}

/** Profil intérieur dans le repère (énoncé) : la courbe de f, sans borne nommée. */
export function profilRepereSvg(e: ExerciceContenanceObjets): string {
  const f = (x: number) => rayonProfil(e.profil, x);
  const R = rayonMax(e);
  const largeur = e.b - e.a;
  const xMin = Math.min(0, e.a) - largeur * 0.1;
  const xMax = e.b + largeur * 0.14;
  const yMax = R * 1.3;
  const yMin = -R * 0.18;
  const px = pasPropre(xMax - xMin, 6);
  const py = pasPropre(yMax, 4);
  return repereSvg({
    xMin,
    xMax,
    yMin,
    yMax,
    graduationsX: graduations(xMin, xMax - largeur * 0.06, px).map((x) => ({ x, etiquette: etiquetteNombre(x) })),
    graduationsY: graduations(0, yMax * 0.92, py).map((y) => ({ y, etiquette: etiquetteNombre(y) })),
    courbes: [{ fn: f, de: e.a, a: e.b, couleur: COULEURS.accent, etiquette: "f" }],
    segments: [
      { x1: e.a, y1: 0, x2: e.a, y2: f(e.a), couleur: COULEURS.pale, pointilles: true, epaisseur: 1 },
      { x1: e.b, y1: 0, x2: e.b, y2: f(e.b), couleur: COULEURS.pale, pointilles: true, epaisseur: 1 },
    ],
    libelle: "Profil intérieur de l'objet : courbe de f, l'axe de l'objet étant l'axe des abscisses",
    largeur: 320,
    hauteur: 210,
  });
}

/** Figure de l'énoncé (écran et `enteteHtml` papier) : silhouette cotée + profil. */
export function figureEnonceHtml(e: ExerciceContenanceObjets): string {
  return `<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center">${silhouetteSvg(e)}${profilRepereSvg(e)}</div>`;
}

/** Solide de révolution (disques) et liquide jusqu'à t le cas échéant (corrigé). */
export function figureCorrigeSvg(e: ExerciceContenanceObjets): string {
  const f = (x: number) => rayonProfil(e.profil, x);
  const R = rayonMax(e);
  const largeur = e.b - e.a;
  const regions: RegionRepere[] = [{ de: e.a, a: e.b, haut: f, bas: () => 0, remplissage: COULEURS.accentDoux, contour: COULEURS.accent }];
  const segments: SegmentRepere[] = [];
  const ellipses: EllipseRepere[] = [];
  const graduationsX = [e.a, e.b].filter((v) => Math.abs(v) > 1e-9).map((x) => ({ x, etiquette: etiquetteNombre(x) }));
  if (e.transfert === "hauteur") {
    const t = e.a + e.hauteurLiquide;
    regions.push({ de: e.a, a: t, haut: f, bas: (x) => -f(x), remplissage: COULEURS.cielDoux, contour: COULEURS.ciel });
    segments.push({ x1: t, y1: -f(t), x2: t, y2: f(t), couleur: COULEURS.ciel, epaisseur: 1.8 });
    graduationsX.push({ x: t, etiquette: `t ≈ ${etiquetteNombre(Math.round(e.hauteurLiquide * 10) / 10)}` });
  }
  for (const x of [e.a, e.b]) if (f(x) > 1e-9) ellipses.push({ cx: x, ry: f(x), rxPixels: 7, couleur: COULEURS.doux, moitieArrierePointillee: true });
  for (const p of [0.3, 0.65]) {
    const x = e.a + p * largeur;
    ellipses.push({ cx: x, ry: f(x), rxPixels: 7, couleur: COULEURS.accent, remplissage: COULEURS.accentDoux });
  }
  return repereSvg({
    xMin: Math.min(0, e.a) - largeur * 0.1,
    xMax: e.b + largeur * 0.16,
    yMin: -R * 1.3,
    yMax: R * 1.3,
    graduationsX,
    graduationsY: [{ y: Math.round(f(e.b) * 100) / 100, etiquette: etiquetteNombre(f(e.b)) }].filter((g) => g.y > 0.3 * R),
    regions,
    courbes: [
      { fn: f, de: e.a, a: e.b, couleur: COULEURS.accent, etiquette: "f" },
      { fn: (x) => -f(x), de: e.a, a: e.b, couleur: COULEURS.doux, pointilles: true, epaisseur: 1.2 },
    ],
    segments,
    ellipses,
    libelle:
      e.transfert === "hauteur"
        ? "Solide de révolution engendré par la courbe de f (disques), et liquide jusqu'à la hauteur t"
        : "Solide de révolution engendré par la rotation de la courbe de f autour de l'axe des abscisses (disques)",
  });
}
