import type { ExerciceIntegraleGraphique, Morceau } from "../core6e/integraleGraphique.types";
import { integraleMorceau, signeMorceau, valeurEn } from "../moteur6e/verificationIntegraleGraphique";
import { COULEURS } from "./figureRepereIntegrales";
import { exactTexte } from "./formatIntegraleGraphique";

/**
 * Figure de `6gen77` : quadrillage d'une unité (repère orthonormé — un demi-disque reste rond), axes
 * fléchés, graduations entières, courbe de f. Chaîne SVG AUTONOME, la même à l'écran
 * (`dangerouslySetInnerHTML`) et sur papier (`enteteHtml` / `figureHtml`) : chaque couleur passe par
 * un jeton du thème avec une valeur de repli imprimable (`COULEURS` de `figureRepereIntegrales.ts`).
 *
 * - Énoncé (`corrige: false`) : la courbe seule — AUCUN morceau colorié, aucune découpe : c'est ce
 *   qu'on évalue. En `proprietes`, la partie inconnue est marquée « ? ».
 * - Corrigé (`corrige: true`) : morceaux au-dessus de l'axe en vert, sous l'axe en rouge, découpes
 *   en pointillés, intégrale signée de chaque morceau assez grand écrite dedans.
 */

const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = `stroke="var(--surface, #ffffff)" stroke-width="3" stroke-linejoin="round" paint-order="stroke"`;

let compteur = 0;

function f1(v: number): string {
  return Number.isFinite(v) ? v.toFixed(1) : "0";
}

function echantillons(m: Morceau): { x: number; y: number }[] {
  if (m.type === "segment") return [{ x: m.x0, y: m.y0 }, { x: m.x1, y: m.y1 }];
  const n = 48;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i <= n; i++) {
    // Échantillonnage en angle : l'arc reste lisse jusqu'aux tangentes verticales.
    const s = i / n;
    const u = m.type === "demiDisque" ? Math.PI * (1 - s) : m.sens === "montant" ? Math.PI - (Math.PI / 2) * s : (Math.PI / 2) * (1 - s);
    const cx = m.type === "demiDisque" ? (m.x0 + m.x1) / 2 : m.sens === "montant" ? m.x1 : m.x0;
    pts.push({ x: cx + m.r * Math.cos(u), y: m.signe * m.r * Math.sin(u) });
  }
  return pts;
}

export function figureIntegraleGraphiqueSvg(e: ExerciceIntegraleGraphique, corrige: boolean): string {
  const id = `ig${++compteur}`;
  const xs = e.variante === "proprietes" ? [e.c, e.d, e.lointaine, 0] : [e.a, e.b, 0];
  const xMinU = Math.min(...xs) - 0.7;
  const xMaxU = Math.max(...xs) + 0.9;
  let hauteur = 2;
  for (const m of e.morceaux) for (const p of echantillons(m)) hauteur = Math.max(hauteur, Math.abs(p.y));
  const yMaxU = Math.ceil(hauteur) + 0.7;
  const yMinU = -Math.ceil(hauteur) - 0.7;

  const marge = { g: 8, d: 8, h: 8, b: 8 };
  const u = Math.min(30, 344 / (xMaxU - xMinU));
  const L = marge.g + marge.d + (xMaxU - xMinU) * u;
  const H = marge.h + marge.b + (yMaxU - yMinU) * u;
  const sx = (x: number) => marge.g + (x - xMinU) * u;
  const sy = (y: number) => marge.h + (yMaxU - y) * u;
  const o: string[] = [];

  o.push(
    `<defs><marker id="${id}fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COULEURS.doux}"/></marker></defs>`,
  );

  // Quadrillage d'une unité.
  for (let x = Math.ceil(xMinU); x <= Math.floor(xMaxU); x++) {
    o.push(`<line x1="${f1(sx(x))}" y1="${f1(sy(yMinU))}" x2="${f1(sx(x))}" y2="${f1(sy(yMaxU))}" stroke="${COULEURS.pale}" stroke-width="0.6" stroke-opacity="0.55"/>`);
  }
  for (let y = Math.ceil(yMinU); y <= Math.floor(yMaxU); y++) {
    o.push(`<line x1="${f1(sx(xMinU))}" y1="${f1(sy(y))}" x2="${f1(sx(xMaxU))}" y2="${f1(sy(y))}" stroke="${COULEURS.pale}" stroke-width="0.6" stroke-opacity="0.55"/>`);
  }

  // Corrigé : régions coloriées (sous la courbe, au-dessus du quadrillage).
  if (corrige) {
    for (const m of e.morceaux) {
      const pts = echantillons(m);
      const positif = signeMorceau(m) > 0;
      const poly = [`${f1(sx(m.x0))},${f1(sy(0))}`, ...pts.map((p) => `${f1(sx(p.x))},${f1(sy(p.y))}`), `${f1(sx(m.x1))},${f1(sy(0))}`];
      o.push(
        `<polygon points="${poly.join(" ")}" fill="${positif ? COULEURS.bonDoux : COULEURS.mauvaisDoux}" fill-opacity="0.9" stroke="${positif ? COULEURS.bon : COULEURS.mauvais}" stroke-width="0.8"/>`,
      );
    }
    // Découpes en pointillés.
    for (const m of e.morceaux.slice(1)) {
      const y = valeurEn(e.morceaux, m.x0);
      if (Math.abs(y) > 1e-9) o.push(`<line x1="${f1(sx(m.x0))}" y1="${f1(sy(0))}" x2="${f1(sx(m.x0))}" y2="${f1(sy(y))}" stroke="${COULEURS.encre}" stroke-width="1" stroke-dasharray="3 3"/>`);
    }
  }

  // Axes fléchés.
  o.push(
    `<line x1="${f1(sx(xMinU))}" y1="${f1(sy(0))}" x2="${f1(sx(xMaxU))}" y2="${f1(sy(0))}" stroke="${COULEURS.doux}" stroke-width="1.2" marker-end="url(#${id}fl)"/>`,
    `<line x1="${f1(sx(0))}" y1="${f1(sy(yMinU))}" x2="${f1(sx(0))}" y2="${f1(sy(yMaxU))}" stroke="${COULEURS.doux}" stroke-width="1.2" marker-end="url(#${id}fl)"/>`,
    `<text x="${f1(sx(xMaxU) - 4)}" y="${f1(sy(0) - 6)}" font-size="12" font-style="italic" text-anchor="end" fill="${COULEURS.doux}" ${POLICE}>x</text>`,
    `<text x="${f1(sx(0) + 6)}" y="${f1(sy(yMaxU) + 11)}" font-size="12" font-style="italic" fill="${COULEURS.doux}" ${POLICE}>y</text>`,
  );

  // Courbe.
  const d: string[] = [];
  e.morceaux.forEach((m, i) => {
    echantillons(m).forEach((p, j) => d.push(`${i === 0 && j === 0 ? "M" : "L"}${f1(sx(p.x))},${f1(sy(p.y))}`));
  });
  o.push(`<path d="${d.join(" ")}" fill="none" stroke="${COULEURS.accent}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`);
  const premier = e.morceaux[0];
  const dernier = e.morceaux[e.morceaux.length - 1];
  for (const x of [premier.x0, dernier.x1]) o.push(`<circle cx="${f1(sx(x))}" cy="${f1(sy(valeurEn(e.morceaux, x)))}" r="3" fill="${COULEURS.accent}"/>`);
  // Nom de la courbe, à gauche de son point de départ (dans la marge, loin du tracé).
  const yDepart = valeurEn(e.morceaux, premier.x0);
  o.push(`<text x="${f1(sx(premier.x0) - 6)}" y="${f1(sy(yDepart) + (yDepart >= 0 ? -5 : 13))}" font-size="13" font-style="italic" text-anchor="end" fill="${COULEURS.accent}" ${HALO} ${POLICE}>f</text>`);

  // Partie inconnue (proprietes) : « ? ».
  if (e.variante === "proprietes") {
    const x0 = Math.min(e.lointaine, e.cote === "gauche" ? e.c : e.d);
    const x1 = Math.max(e.lointaine, e.cote === "gauche" ? e.c : e.d);
    o.push(`<line x1="${f1(sx(e.lointaine))}" y1="${f1(sy(yMinU + 0.4))}" x2="${f1(sx(e.lointaine))}" y2="${f1(sy(yMaxU - 0.4))}" stroke="${COULEURS.doux}" stroke-width="1" stroke-dasharray="4 3"/>`);
    o.push(`<text x="${f1(sx((x0 + x1) / 2))}" y="${f1(sy(1.2))}" font-size="20" font-weight="600" text-anchor="middle" fill="${COULEURS.doux}" ${HALO} ${POLICE}>?</text>`);
  }

  // Valeurs des morceaux (corrigé).
  if (corrige) {
    for (const m of e.morceaux) {
      // Étiquette au centre de gravité de la région (formule du lacet), seulement si la région est
      // assez grande pour la contenir.
      const poly = [{ x: m.x0, y: 0 }, ...echantillons(m), { x: m.x1, y: 0 }];
      let aire = 0;
      let gx = 0;
      let gy = 0;
      for (let i = 0; i < poly.length; i++) {
        const p = poly[i];
        const q = poly[(i + 1) % poly.length];
        const c = p.x * q.y - q.x * p.y;
        aire += c;
        gx += (p.x + q.x) * c;
        gy += (p.y + q.y) * c;
      }
      if (Math.abs(aire / 2) < 0.9) continue;
      gx /= 3 * aire;
      gy /= 3 * aire;
      if (Math.abs(gy) < 0.55) continue;
      const s = signeMorceau(m) > 0 ? "+" : "";
      o.push(`<text x="${f1(sx(gx))}" y="${f1(sy(gy) + 4)}" font-size="11" font-weight="600" text-anchor="middle" fill="${COULEURS.encre}" ${HALO} ${POLICE}>${s}${exactTexte(integraleMorceau(m))}</text>`);
    }
  }

  // Graduations (en dernier, avec halo).
  for (let x = Math.ceil(xMinU); x <= Math.floor(xMaxU - 0.3); x++) {
    if (x === 0) continue;
    o.push(`<text x="${f1(sx(x))}" y="${f1(sy(0) + 13)}" font-size="10" text-anchor="middle" fill="${COULEURS.doux}" ${HALO} ${POLICE}>${`${x}`.replace("-", "−")}</text>`);
  }
  for (let y = Math.ceil(yMinU + 0.3); y <= Math.floor(yMaxU - 0.3); y++) {
    if (y === 0) continue;
    o.push(`<text x="${f1(sx(0) - 4)}" y="${f1(sy(y) + 3.5)}" font-size="10" text-anchor="end" fill="${COULEURS.doux}" ${HALO} ${POLICE}>${`${y}`.replace("-", "−")}</text>`);
  }
  o.push(`<text x="${f1(sx(0) - 4)}" y="${f1(sy(0) + 13)}" font-size="10" text-anchor="end" fill="${COULEURS.doux}" ${HALO} ${POLICE}>0</text>`);

  const libelle = corrige
    ? "Courbe de f : parties au-dessus de l'axe en vert (intégrale positive), parties sous l'axe en rouge (intégrale négative)"
    : "Courbe de f sur un quadrillage d'une unité";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f1(L)} ${f1(H)}" width="${f1(L)}" height="${f1(H)}" style="max-width:100%;height:auto" role="img" aria-label="${libelle}">${o.join("")}</svg>`;
}
