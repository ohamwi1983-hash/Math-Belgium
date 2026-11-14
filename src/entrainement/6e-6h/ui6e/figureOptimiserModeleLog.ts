import type { ExerciceOptimiserLog } from "../core6e/optimiserModeleLog.types";
import { modeleNumerique } from "../moteur6e/verificationOptimiserModeleLog";
import { fiche } from "./formatOptimiserModeleLog";

/**
 * Figure SVG AUTONOME de `6gen91` : courbe du modèle sur son domaine dans le contexte, avec
 * l'optimum marqué (point, pointillés vers les axes, coordonnées approchées). Sert au CORRIGÉ et à
 * la fin de l'exercice interactif uniquement : dans l'énoncé, la courbe trahirait la nature de
 * l'optimum (écran 4) et sa position approchée (écran 3) — décision : pas de figure dans l'énoncé.
 * Couleurs `var(--jeton, #repli)` (thème à l'écran, valeur lisible à l'impression), largeur 100 %
 * plafonnée (lisible à 390 px), identifiants SVG dérivés du contenu (jamais d'un compteur global).
 */

const C = {
  encre: "var(--ink, #1b1d22)",
  doux: "var(--ink-soft, #5c6370)",
  pale: "var(--ink-faint, #9aa3ad)",
  accent: "var(--accent, #b65c1f)",
  bon: "var(--good, #2f7a4f)",
};

const L = 360;
const H = 250;
const M = { g: 46, d: 18, h: 24, b: 34 };
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = 'stroke="var(--surface, #ffffff)" stroke-width="3" stroke-linejoin="round" paint-order="stroke"';

const f1 = (v: number) => (Number.isFinite(v) ? v.toFixed(1) : "0");

function pasGraduation(etendue: number, cible: number): number {
  const brut = etendue / cible;
  const p = Math.pow(10, Math.floor(Math.log10(brut)));
  const r = brut / p;
  return (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * p;
}

function etiquette(v: number, d = 2): string {
  const r = Math.round(v * 10 ** d) / 10 ** d;
  return (Object.is(r, -0) ? 0 : r).toString().replace(".", ",").replace("-", "−");
}

/** Identifiant court et déterministe dérivé des paramètres de l'exercice. */
function idDe(e: ExerciceOptimiserLog): string {
  const s = JSON.stringify({ ...e, ordreNature: undefined });
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `oml${h.toString(36)}`;
}

export function figureOptimiserLogSvg(e: ExerciceOptimiserLog): string {
  const m = modeleNumerique(e);
  const fi = fiche(e);
  const id = idDe(e);
  const xMin = 0;
  const xMax = m.domaine.droite;
  const debut = m.domaine.gaucheOuvert ? xMax / 400 : m.domaine.gauche;
  // Fenêtre verticale : tout le haut de la courbe, le bas limité (une courbe qui plonge vers −∞
  // près de 0 est coupée sous la fenêtre).
  let yHaut = -Infinity;
  let yBasUtile = Infinity;
  for (let i = 0; i <= 200; i++) {
    const x = debut + ((xMax - debut) * i) / 200;
    const y = m.f(x);
    if (!Number.isFinite(y)) continue;
    yHaut = Math.max(yHaut, y);
    if (x >= m.xEtoile / 3) yBasUtile = Math.min(yBasUtile, y);
  }
  const etendue = Math.max(1e-6, yHaut - Math.min(0, yBasUtile));
  const yMax = yHaut + 0.15 * etendue;
  const yMin = Math.min(0, yBasUtile - 0.12 * etendue);
  const X = (x: number) => M.g + ((x - xMin) / (xMax - xMin)) * (L - M.g - M.d);
  const Y = (y: number) => H - M.b - ((y - yMin) / (yMax - yMin)) * (H - M.h - M.b);
  const morceaux: string[] = [];
  const textes: string[] = [];
  morceaux.push(`<defs><marker id="${id}f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${C.doux}"/></marker><clipPath id="${id}c"><rect x="${M.g}" y="${M.h - 6}" width="${L - M.g - M.d + 6}" height="${H - M.h - M.b + 6}"/></clipPath></defs>`);

  // Graduations et quadrillage léger.
  const y0 = Y(Math.max(yMin, Math.min(yMax, 0)));
  const pasX = pasGraduation(xMax - xMin, 6);
  for (let x = pasX; x <= xMax + 1e-9; x += pasX) {
    morceaux.push(`<line x1="${f1(X(x))}" y1="${f1(Y(yMax))}" x2="${f1(X(x))}" y2="${f1(Y(yMin))}" stroke="${C.pale}" stroke-width="0.5" stroke-dasharray="2 3"/>`);
    textes.push(`<text x="${f1(X(x))}" y="${f1(Y(yMin) + 15)}" font-size="11" text-anchor="middle" fill="${C.doux}" ${HALO} ${POLICE}>${etiquette(x)}</text>`);
  }
  const pasY = pasGraduation(yMax - yMin, 5);
  for (let y = Math.ceil(yMin / pasY) * pasY; y <= yMax + 1e-9; y += pasY) {
    if (Math.abs(y) < 1e-9) continue;
    morceaux.push(`<line x1="${f1(X(xMin))}" y1="${f1(Y(y))}" x2="${f1(X(xMax))}" y2="${f1(Y(y))}" stroke="${C.pale}" stroke-width="0.5" stroke-dasharray="2 3"/>`);
    textes.push(`<text x="${f1(X(xMin) - 6)}" y="${f1(Y(y) + 4)}" font-size="11" text-anchor="end" fill="${C.doux}" ${HALO} ${POLICE}>${etiquette(y)}</text>`);
  }
  textes.push(`<text x="${f1(X(xMin) - 6)}" y="${f1(y0 + 14)}" font-size="11" text-anchor="end" fill="${C.doux}" ${POLICE}>0</text>`);

  // Axes fléchés (axe horizontal à y = 0, ou en bas de la fenêtre).
  morceaux.push(
    `<line x1="${f1(X(xMin))}" y1="${f1(y0)}" x2="${f1(L - 4)}" y2="${f1(y0)}" stroke="${C.doux}" stroke-width="1.1" marker-end="url(#${id}f)"/>`,
    `<line x1="${f1(X(xMin))}" y1="${f1(Y(yMin))}" x2="${f1(X(xMin))}" y2="6" stroke="${C.doux}" stroke-width="1.1" marker-end="url(#${id}f)"/>`,
  );
  textes.push(
    `<text x="${f1(L - 4)}" y="${f1(H - 4)}" font-size="11.5" text-anchor="end" fill="${C.encre}" ${POLICE}>${fi.axeX}</text>`,
    `<text x="${f1(X(xMin) + 7)}" y="14" font-size="11.5" fill="${C.encre}" ${HALO} ${POLICE}>${fi.axeY}</text>`,
  );

  // Courbe (coupée hors de la fenêtre) et borne droite du domaine.
  const pts: string[] = [];
  let enCours = false;
  for (let i = 0; i <= 240; i++) {
    const x = debut + ((xMax - debut) * i) / 240;
    const y = m.f(x);
    if (!Number.isFinite(y) || y < yMin - 0.5 * (yMax - yMin)) {
      enCours = false;
      continue;
    }
    pts.push(`${enCours ? "L" : "M"}${f1(X(x))},${f1(Y(y))}`);
    enCours = true;
  }
  morceaux.push(`<path d="${pts.join(" ")}" fill="none" stroke="${C.accent}" stroke-width="2.3" stroke-linejoin="round" clip-path="url(#${id}c)"/>`);
  morceaux.push(`<circle cx="${f1(X(xMax))}" cy="${f1(Y(m.f(xMax)))}" r="3" fill="${C.accent}"/>`);
  if (m.domaine.gaucheOuvert) {
    // Borne gauche exclue : rien n'est tracé en x = 0.
  } else {
    morceaux.push(`<circle cx="${f1(X(debut))}" cy="${f1(Y(m.f(debut)))}" r="3" fill="${C.accent}"/>`);
  }

  // Optimum.
  const xo = X(m.xEtoile);
  const yo = Y(m.valeur);
  morceaux.push(
    `<line x1="${f1(xo)}" y1="${f1(yo)}" x2="${f1(xo)}" y2="${f1(y0)}" stroke="${C.bon}" stroke-width="1.2" stroke-dasharray="4 3"/>`,
    `<line x1="${f1(xo)}" y1="${f1(yo)}" x2="${f1(X(xMin))}" y2="${f1(yo)}" stroke="${C.bon}" stroke-width="1.2" stroke-dasharray="4 3"/>`,
    `<circle cx="${f1(xo)}" cy="${f1(yo)}" r="4.5" fill="${C.bon}" stroke="var(--surface, #ffffff)" stroke-width="1.5"/>`,
  );
  const libelle = `${m.nature === "max" ? "maximum" : "minimum"} (${etiquette(m.xEtoile)} ; ${etiquette(m.valeur)})`;
  const auDessus = m.nature === "max";
  const ancre = xo > L - 120 ? "end" : xo < M.g + 70 ? "start" : "middle";
  textes.push(`<text x="${f1(xo + (ancre === "start" ? 6 : ancre === "end" ? -6 : 0))}" y="${f1(auDessus ? yo - 10 : yo + 20)}" font-size="12" text-anchor="${ancre}" fill="${C.bon}" ${HALO} ${POLICE}>${libelle}</text>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" width="100%" style="max-width:${L}px;display:block;margin:0 auto" role="img" aria-label="Courbe du modèle ${fi.nom} sur son domaine, ${libelle}">${morceaux.join("")}${textes.join("")}</svg>`;
}
