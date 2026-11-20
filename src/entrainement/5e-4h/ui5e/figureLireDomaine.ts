import type { ExerciceLireDomaine } from "../core5e/lireDomaineImage";
import { domaine, image } from "../core5e/lireDomaineImage";
import type { Ensemble } from "../moteur5e/ensemblesReels";

/**
 * Figure de `5gen59` : quadrillage d'UNE unité (fenêtre aux bornes entières), axes fléchés et
 * gradués, ligne brisée, extrémités pleines (disque) ou creuses (cercle blanc), flèches au bout
 * d'une demi-droite qui se prolonge. Chaîne SVG AUTONOME : la même à l'écran, sur papier
 * (`enteteHtml`) et dans le corrigé (`figureHtml`, avec les projections sur les axes). Aucun
 * identifiant global (marqueurs dessinés en polygones).
 */

const MARGE = 14;
const GRILLE = "#d8dee6";
const AXE = "#495057";
const COURBE = "#1971c2";
const DOM = "#2f9e44";
const IM = "#e8590c";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = 'stroke="#ffffff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"';
const f1 = (v: number) => v.toFixed(1);
const nombre = (v: number) => (v < 0 ? `−${Math.abs(v)}` : String(v));

export interface OptionsFigure {
  /** Taille d'un carreau (px). */
  carreau?: number;
  /** Corrigé : projections du domaine (vert, sur Ox) et de l'image (orange, sur Oy). */
  projections?: boolean;
}

function fleche(x1: number, y1: number, x2: number, y2: number, couleur: string, t = 9): string {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p1 = [x2 - t * Math.cos(a - 0.4), y2 - t * Math.sin(a - 0.4)];
  const p2 = [x2 - t * Math.cos(a + 0.4), y2 - t * Math.sin(a + 0.4)];
  return `<polygon points="${f1(x2)},${f1(y2)} ${f1(p1[0]!)},${f1(p1[1]!)} ${f1(p2[0]!)},${f1(p2[1]!)}" fill="${couleur}"/>`;
}

export function figureLireDomaine(e: ExerciceLireDomaine, o: OptionsFigure = {}): string {
  const { xMin, xMax, yMin, yMax } = e.fenetre;
  const c = o.carreau ?? 22;
  const L = (xMax - xMin) * c + 2 * MARGE;
  const H = (yMax - yMin) * c + 2 * MARGE;
  const sx = (x: number) => MARGE + (x - xMin) * c;
  const sy = (y: number) => MARGE + (yMax - y) * c;
  const s: string[] = [`<rect x="0" y="0" width="${L}" height="${H}" fill="#ffffff"/>`];
  for (let x = xMin; x <= xMax; x++) s.push(`<line x1="${f1(sx(x))}" y1="${MARGE}" x2="${f1(sx(x))}" y2="${H - MARGE}" stroke="${GRILLE}" stroke-width="1"/>`);
  for (let y = yMin; y <= yMax; y++) s.push(`<line x1="${MARGE}" y1="${f1(sy(y))}" x2="${L - MARGE}" y2="${f1(sy(y))}" stroke="${GRILLE}" stroke-width="1"/>`);
  // Axes fléchés.
  s.push(`<line x1="${MARGE}" y1="${f1(sy(0))}" x2="${L - 4}" y2="${f1(sy(0))}" stroke="${AXE}" stroke-width="1.4"/>`, fleche(MARGE, sy(0), L - 3, sy(0), AXE, 8));
  s.push(`<line x1="${f1(sx(0))}" y1="${H - MARGE}" x2="${f1(sx(0))}" y2="4" stroke="${AXE}" stroke-width="1.4"/>`, fleche(sx(0), H - MARGE, sx(0), 3, AXE, 8));
  const p = Math.max(10, Math.round(c * 0.5));
  s.push(`<text x="${f1(L - 6)}" y="${f1(sy(0) - 6)}" font-size="${p}" text-anchor="end" font-style="italic" fill="${AXE}" ${POLICE}>x</text>`);
  s.push(`<text x="${f1(sx(0) + 7)}" y="${p + 2}" font-size="${p}" font-style="italic" fill="${AXE}" ${POLICE}>y</text>`);
  for (let x = xMin + 1; x < xMax; x++) if (x !== 0) s.push(`<text x="${f1(sx(x))}" y="${f1(sy(0) + p + 2)}" font-size="${p}" text-anchor="middle" fill="${AXE}" ${POLICE} ${HALO}>${nombre(x)}</text>`);
  for (let y = yMin + 1; y < yMax; y++) if (y !== 0) s.push(`<text x="${f1(sx(0) - 4)}" y="${f1(sy(y) + p / 2.8)}" font-size="${p}" text-anchor="end" fill="${AXE}" ${POLICE} ${HALO}>${nombre(y)}</text>`);
  s.push(`<text x="${f1(sx(0) - 4)}" y="${f1(sy(0) + p + 2)}" font-size="${p}" text-anchor="end" fill="${AXE}" ${POLICE} ${HALO}>0</text>`);

  if (o.projections) {
    const bande = (ens: Ensemble, axe: "x" | "y", couleur: string) => {
      for (const i of ens) {
        const g = axe === "x" ? Math.max(i.g, xMin) : Math.max(i.g, yMin);
        const d = axe === "x" ? Math.min(i.d, xMax) : Math.min(i.d, yMax);
        const [x1, y1, x2, y2] = axe === "x" ? [sx(g), sy(0), sx(d), sy(0)] : [sx(0), sy(g), sx(0), sy(d)];
        s.push(`<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${couleur}" stroke-width="6" stroke-linecap="butt" opacity="0.85"/>`);
        const bout = (v: number, ferme: boolean) => {
          const [cx, cy] = axe === "x" ? [sx(v), sy(0)] : [sx(0), sy(v)];
          s.push(`<circle cx="${f1(cx)}" cy="${f1(cy)}" r="4.5" fill="${ferme ? couleur : "#ffffff"}" stroke="${couleur}" stroke-width="2"/>`);
        };
        if (Number.isFinite(i.g)) bout(i.g, i.gF);
        else s.push(axe === "x" ? fleche(sx(xMin) + 12, sy(0), sx(xMin) + 1, sy(0), couleur, 10) : fleche(sx(0), sy(yMin) - 12, sx(0), sy(yMin) - 1, couleur, 10));
        if (Number.isFinite(i.d)) bout(i.d, i.dF);
        else s.push(axe === "x" ? fleche(sx(xMax) - 12, sy(0), sx(xMax) - 1, sy(0), couleur, 10) : fleche(sx(0), sy(yMax) + 12, sx(0), sy(yMax) + 1, couleur, 10));
      }
    };
    bande(domaine(e), "x", DOM);
    bande(image(e), "y", IM);
  }

  // Courbe : segments, demi-droites jusqu'au bord du cadre, extrémités.
  const points: string[] = [];
  for (const m of e.morceaux) {
    const pts = m.pts.map(([x, y]) => `${f1(sx(x))},${f1(sy(y))}`);
    s.push(`<polyline points="${pts.join(" ")}" fill="none" stroke="${COURBE}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`);
    const rayon = (P: [number, number], Q: [number, number]) => {
      // Demi-droite de P dans la direction Q→P, coupée au bord du cadre.
      const dx = P[0] - Q[0];
      const dy = P[1] - Q[1];
      let t = Infinity;
      if (dx > 0) t = Math.min(t, (xMax - P[0]) / dx);
      if (dx < 0) t = Math.min(t, (xMin - P[0]) / dx);
      if (dy > 0) t = Math.min(t, (yMax - P[1]) / dy);
      if (dy < 0) t = Math.min(t, (yMin - P[1]) / dy);
      const X = P[0] + t * dx * 0.97;
      const Y = P[1] + t * dy * 0.97;
      s.push(`<line x1="${f1(sx(P[0]))}" y1="${f1(sy(P[1]))}" x2="${f1(sx(X))}" y2="${f1(sy(Y))}" stroke="${COURBE}" stroke-width="2.6" stroke-linecap="round"/>`);
      s.push(fleche(sx(P[0]), sy(P[1]), sx(X), sy(Y), COURBE, 11));
    };
    const n = m.pts.length;
    if (m.g === "fleche") rayon(m.pts[0]!, m.pts[1]!);
    if (m.d === "fleche") rayon(m.pts[n - 1]!, m.pts[n - 2]!);
    const bout = ([x, y]: [number, number], plein: boolean) => points.push(`<circle cx="${f1(sx(x))}" cy="${f1(sy(y))}" r="4.8" fill="${plein ? COURBE : "#ffffff"}" stroke="${COURBE}" stroke-width="2.2"/>`);
    if (m.g !== "fleche") bout(m.pts[0]!, m.g === "plein");
    if (m.d !== "fleche") bout(m.pts[n - 1]!, m.d === "plein");
  }
  if (e.trou) points.push(`<circle cx="${f1(sx(e.trou.x))}" cy="${f1(sy(e.trou.y))}" r="4.8" fill="#ffffff" stroke="${COURBE}" stroke-width="2.2"/>`);
  if (e.deplace) points.push(`<circle cx="${f1(sx(e.deplace.x))}" cy="${f1(sy(e.deplace.y))}" r="4.8" fill="${COURBE}" stroke="${COURBE}" stroke-width="2.2"/>`);
  s.push(...points);
  s.push(`<rect x="0.5" y="0.5" width="${L - 1}" height="${H - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`);
  return `<svg class="graphe-cyclo" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphique de la fonction f">${s.join("")}</svg>`;
}
