import type { ExerciceAccumulerGrandeur } from "../core6e/accumulerGrandeur.types";
import { fiche } from "./formatAccumulerGrandeur";

/**
 * Figure SVG AUTONOME de `6gen80` : graphique du TAUX (débit, puissance, intensité, rythme, taux
 * d'émission) en fonction du temps, axes fléchés avec leurs unités. Même convention que
 * `figureIntegralesProblemes.ts` (6gen29) : couleurs `var(--jeton, #repli)` (thème à l'écran, valeur
 * lisible à l'impression), fenêtre fixée ici, largeur 100 % plafonnée (lisible à 390 px).
 * - `hachure: false` (énoncé, écran) : courbes seules — rien ne trahit les bornes de l'écran 1 ;
 * - `hachure: true` (corrigé, fin d'exercice) : l'aire hachurée = la quantité accumulée.
 */

const C = {
  encre: "var(--ink, #1b1d22)",
  doux: "var(--ink-soft, #5c6370)",
  pale: "var(--ink-faint, #9aa3ad)",
  accent: "var(--accent, #b65c1f)",
  bon: "var(--good, #2f7a4f)",
  bonDoux: "var(--good-soft, #dcefe2)",
  ciel: "var(--sky, #2f6fb0)",
  rouge: "var(--bad, #b23a3a)",
};

const L = 360;
const H = 240;
const M = { g: 48, d: 16, h: 26, b: 34 };
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = 'stroke="var(--surface, #ffffff)" stroke-width="3" stroke-linejoin="round" paint-order="stroke"';

let compteur = 0;

const f1 = (v: number) => (Number.isFinite(v) ? v.toFixed(1) : "0");

function pasGraduation(etendue: number, cible: number): number {
  const brut = etendue / cible;
  const p = Math.pow(10, Math.floor(Math.log10(brut)));
  const r = brut / p;
  return (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * p;
}

function etiquette(v: number): string {
  const r = Math.round(v * 100) / 100;
  return r.toString().replace(".", ",");
}

export function figureAccumulerGrandeurSvg(e: ExerciceAccumulerGrandeur, hachure: boolean): string {
  const fig = fiche(e).figure;
  const id = `ag${++compteur}`;
  let yMax = 0;
  for (const c of fig.courbes) {
    for (let i = 0; i <= 100; i++) yMax = Math.max(yMax, c.fn(c.de + ((c.a - c.de) * i) / 100));
  }
  yMax *= 1.18;
  const { xMin, xMax } = fig;
  const X = (x: number) => M.g + ((x - xMin) / (xMax - xMin)) * (L - M.g - M.d);
  const Y = (y: number) => H - M.b - (y / yMax) * (H - M.h - M.b);
  const morceaux: string[] = [];
  morceaux.push(
    `<defs><marker id="${id}f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C.doux}"/></marker>` +
      `<pattern id="${id}h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="${C.bon}" stroke-width="1"/></pattern></defs>`,
  );

  if (hachure) {
    const n = 80;
    const haut: string[] = [];
    const bas: string[] = [];
    for (let i = 0; i <= n; i++) {
      const x = fig.hachure.de + ((fig.hachure.a - fig.hachure.de) * i) / n;
      haut.push(`${f1(X(x))},${f1(Y(fig.hachure.haut(x)))}`);
      bas.push(`${f1(X(x))},${f1(Y(fig.hachure.bas(x)))}`);
    }
    const pts = [...haut, ...bas.reverse()].join(" ");
    morceaux.push(`<polygon points="${pts}" fill="${C.bonDoux}" stroke="none"/>`, `<polygon points="${pts}" fill="url(#${id}h)" stroke="${C.bon}" stroke-width="0.8"/>`);
  }

  // Graduations.
  const pasX = pasGraduation(xMax - xMin, 6);
  const pasY = pasGraduation(yMax, 5);
  const textes: string[] = [];
  for (let x = Math.ceil(xMin / pasX) * pasX; x <= xMax + 1e-9; x += pasX) {
    if (Math.abs(x - xMin) < 1e-9) continue;
    morceaux.push(`<line x1="${f1(X(x))}" y1="${f1(Y(0) - 3)}" x2="${f1(X(x))}" y2="${f1(Y(0) + 3)}" stroke="${C.doux}"/>`);
    textes.push(`<text x="${f1(X(x))}" y="${f1(Y(0) + 15)}" font-size="11" text-anchor="middle" fill="${C.doux}" ${HALO} ${POLICE}>${etiquette(x)}</text>`);
  }
  for (let y = pasY; y <= yMax / 1.02; y += pasY) {
    morceaux.push(`<line x1="${f1(X(xMin) - 3)}" y1="${f1(Y(y))}" x2="${f1(X(xMin) + 3)}" y2="${f1(Y(y))}" stroke="${C.doux}"/>`);
    morceaux.push(`<line x1="${f1(X(xMin) + 3)}" y1="${f1(Y(y))}" x2="${f1(X(xMax))}" y2="${f1(Y(y))}" stroke="${C.pale}" stroke-width="0.5" stroke-dasharray="2 3"/>`);
    textes.push(`<text x="${f1(X(xMin) - 6)}" y="${f1(Y(y) + 4)}" font-size="11" text-anchor="end" fill="${C.doux}" ${HALO} ${POLICE}>${etiquette(y)}</text>`);
  }
  textes.push(`<text x="${f1(X(xMin) - 6)}" y="${f1(Y(0) + 15)}" font-size="11" text-anchor="end" fill="${C.doux}" ${POLICE}>0</text>`);

  // Axes fléchés et unités.
  morceaux.push(
    `<line x1="${f1(X(xMin))}" y1="${f1(Y(0))}" x2="${f1(L - 4)}" y2="${f1(Y(0))}" stroke="${C.doux}" stroke-width="1.1" marker-end="url(#${id}f)"/>`,
    `<line x1="${f1(X(xMin))}" y1="${f1(Y(0))}" x2="${f1(X(xMin))}" y2="${f1(6)}" stroke="${C.doux}" stroke-width="1.1" marker-end="url(#${id}f)"/>`,
  );
  textes.push(
    `<text x="${f1(L - 4)}" y="${f1(H - 4)}" font-size="11.5" text-anchor="end" fill="${C.encre}" ${POLICE}>${fig.axeT}</text>`,
    `<text x="${f1(X(xMin) + 7)}" y="${f1(14)}" font-size="11.5" fill="${C.encre}" ${HALO} ${POLICE}>${fig.axeY}</text>`,
  );

  // Courbes et leurs noms.
  const poses: { x: number; y: number }[] = [];
  fig.courbes.forEach((c, k) => {
    const couleur = c.secondaire ? C.ciel : k === 0 ? C.accent : C.rouge;
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = c.de + ((c.a - c.de) * i) / 120;
      pts.push(`${i === 0 ? "M" : "L"}${f1(X(x))},${f1(Y(c.fn(x)))}`);
    }
    morceaux.push(`<path d="${pts.join(" ")}" fill="none" stroke="${couleur}" stroke-width="2.2"${c.secondaire ? ' stroke-dasharray="6 4"' : ""} stroke-linejoin="round"/>`);
    // Nom posé au-dessus du point le plus haut de la courbe, décalé si un autre nom est trop près.
    let xHaut = c.de;
    for (let i = 0; i <= 60; i++) {
      const x = c.de + ((c.a - c.de) * i) / 60;
      if (c.fn(x) > c.fn(xHaut) + 1e-9) xHaut = x;
    }
    const constante = Math.abs(c.fn(c.a) - c.fn(c.de)) < 1e-9 && Math.abs(c.fn((c.a + c.de) / 2) - c.fn(c.de)) < 1e-9;
    if (constante) xHaut = c.de + (c.a - c.de) * 0.82;
    // Sommet intérieur (cloche, parabole) : nom posé à DROITE du sommet, hors de la courbe ; sinon
    // (droite, exponentielle) au-dessus du point le plus haut.
    const interieur = !constante && xHaut > c.de + 0.05 * (c.a - c.de) && xHaut < c.a - 0.05 * (c.a - c.de);
    let px = interieur ? Math.min(X(xHaut) + 10, L - M.d - 30) : Math.min(Math.max(X(xHaut), M.g + 24), L - M.d - 24);
    let py = interieur ? Y(c.fn(xHaut)) - 4 : Y(c.fn(xHaut)) - 7;
    const ancre = interieur ? "start" : "middle";
    while (poses.some((p) => Math.abs(p.x - px) < 60 && Math.abs(p.y - py) < 14)) py -= 14;
    if (py < 24) {
      py = Y(c.fn(xHaut)) + 16;
      px = Math.min(px + 10, L - M.d - 24);
    }
    poses.push({ x: px, y: py });
    textes.push(`<text x="${f1(px)}" y="${f1(py)}" font-size="12" font-style="italic" text-anchor="${ancre}" fill="${couleur}" ${HALO} ${POLICE}>${c.nom.replace(/_([AB12])/, '<tspan font-size="9" dy="3">$1</tspan>')}</text>`);
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" width="100%" style="max-width:${L}px;display:block;margin:0 auto" role="img" aria-label="Graphique du taux en fonction du temps${hachure ? ", aire de la quantité accumulée hachurée" : ""}">${morceaux.join("")}${textes.join("")}</svg>`;
}

/** Légende de l'aire hachurée (sous la figure du corrigé). */
export function legendeAire(e: ExerciceAccumulerGrandeur): string {
  return fiche(e).figure.libelleAire;
}
