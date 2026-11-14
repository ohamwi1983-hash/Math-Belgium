import { chaineLinearisation, pointsTransformes } from "../core6e/linearisationDonnees";
import type { ExerciceLinearisation } from "../core6e/linearisationDonnees";
import { COULEURS } from "./figureRepereIntegrales";
import { grandeurXTexte, grandeurYTexte } from "./formatLinearisation";

/**
 * Figure du CORRIGÉ de `6gen89` : nuage des points transformés (X ; Y) du tableau et droite
 * Y = mX + p passant par les deux lignes désignées (points pleins), les autres points en cercles.
 * Jamais dans l'énoncé (qui ne montre que le tableau) : la droite est ce qu'on cherche.
 *
 * Repère « en boîte » (le cadrage ne contient pas forcément l'origine) : graduations sur les bords
 * gauche et bas, quadrillage léger. Chaîne autonome, sans identifiant (aucun `id` ni marqueur) :
 * jetons du thème à l'écran, valeurs de repli littérales sur papier.
 */

const L = 360;
const H = 250;
const MARGE = { g: 46, d: 14, h: 14, b: 40 };

function f1(v: number): string {
  return (Math.round(v * 10) / 10).toString();
}

/** Pas « rond » (1, 2 ou 5 × 10ᵏ) pour environ `cible` intervalles. */
function pasRond(etendue: number, cible: number): number {
  const brut = etendue / cible;
  const p = Math.pow(10, Math.floor(Math.log10(brut)));
  const r = brut / p;
  return (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * p;
}

function graduations(min: number, max: number, cible: number): { valeurs: number[]; pas: number } {
  const pas = pasRond(max - min, cible);
  const valeurs: number[] = [];
  for (let v = Math.ceil(min / pas - 1e-9) * pas; v <= max + 1e-9; v += pas) valeurs.push(Math.round(v / pas) * pas);
  return { valeurs, pas };
}

function etiquette(v: number, pas: number): string {
  const d = Math.max(0, -Math.floor(Math.log10(pas) + 1e-9));
  const s = (Math.round(v * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d);
  return s.replace("-", "−").replace(".", ",");
}

export function figureCorrigeSvg(e: ExerciceLinearisation): string {
  const pts = pointsTransformes(e);
  const c = chaineLinearisation(e);
  const xs = pts.map((q) => q.X);
  const ys = pts.map((q) => q.Y);
  const padX = (Math.max(...xs) - Math.min(...xs)) * 0.08 || 1;
  const padY = (Math.max(...ys) - Math.min(...ys)) * 0.12 || 1;
  const xMin = Math.min(...xs) - padX;
  const xMax = Math.max(...xs) + padX;
  const yMin = Math.min(...ys) - padY;
  const yMax = Math.max(...ys) + padY;
  const sx = (x: number) => MARGE.g + ((x - xMin) / (xMax - xMin)) * (L - MARGE.g - MARGE.d);
  const sy = (y: number) => H - MARGE.b - ((y - yMin) / (yMax - yMin)) * (H - MARGE.h - MARGE.b);

  const parts: string[] = [];
  parts.push(`<rect x="${MARGE.g}" y="${MARGE.h}" width="${L - MARGE.g - MARGE.d}" height="${H - MARGE.h - MARGE.b}" fill="none" stroke="${COULEURS.pale}" stroke-width="1"/>`);
  const gx = graduations(xMin, xMax, 5);
  const gy = graduations(yMin, yMax, 5);
  for (const v of gx.valeurs) {
    parts.push(`<line x1="${f1(sx(v))}" y1="${MARGE.h}" x2="${f1(sx(v))}" y2="${H - MARGE.b}" stroke="${COULEURS.pale}" stroke-width="0.5" opacity="0.6"/>`);
    parts.push(`<text x="${f1(sx(v))}" y="${H - MARGE.b + 14}" font-size="11" text-anchor="middle" fill="${COULEURS.doux}">${etiquette(v, gx.pas)}</text>`);
  }
  for (const v of gy.valeurs) {
    parts.push(`<line x1="${MARGE.g}" y1="${f1(sy(v))}" x2="${L - MARGE.d}" y2="${f1(sy(v))}" stroke="${COULEURS.pale}" stroke-width="0.5" opacity="0.6"/>`);
    parts.push(`<text x="${MARGE.g - 5}" y="${f1(sy(v) + 4)}" font-size="11" text-anchor="end" fill="${COULEURS.doux}">${etiquette(v, gy.pas)}</text>`);
  }
  parts.push(`<text x="${f1((MARGE.g + L - MARGE.d) / 2)}" y="${H - 6}" font-size="12.5" text-anchor="middle" fill="${COULEURS.encre}" font-style="italic">${grandeurXTexte(e)}</text>`);
  parts.push(`<text x="12" y="${f1((MARGE.h + H - MARGE.b) / 2)}" font-size="12.5" text-anchor="middle" fill="${COULEURS.encre}" font-style="italic" transform="rotate(-90 12 ${f1((MARGE.h + H - MARGE.b) / 2)})">${grandeurYTexte(e)}</text>`);

  // Droite Y = mX + p, coupée au cadre.
  const yA = c.p + c.m * xMin;
  const yB = c.p + c.m * xMax;
  const clip = (x0: number, y0: number, x1: number, y1: number): [number, number, number, number] => {
    const pente = (y1 - y0) / (x1 - x0);
    const borner = (x: number, y: number): [number, number] => {
      if (y > yMax) return [x0 + (yMax - y0) / pente, yMax];
      if (y < yMin) return [x0 + (yMin - y0) / pente, yMin];
      return [x, y];
    };
    const [a, b] = borner(x0, y0);
    const [cc, d] = borner(x1, y1);
    return [a, b, cc, d];
  };
  const [ax, ay, bx, by] = clip(xMin, yA, xMax, yB);
  parts.push(`<line x1="${f1(sx(ax))}" y1="${f1(sy(ay))}" x2="${f1(sx(bx))}" y2="${f1(sy(by))}" stroke="${COULEURS.bon}" stroke-width="2"/>`);

  pts.forEach((q, i) => {
    const choisi = i === e.lignes[0] || i === e.lignes[1];
    parts.push(
      choisi
        ? `<circle cx="${f1(sx(q.X))}" cy="${f1(sy(q.Y))}" r="4.6" fill="var(--attn, #b65c1f)" stroke="${COULEURS.encre}" stroke-width="0.8"/>`
        : `<circle cx="${f1(sx(q.X))}" cy="${f1(sy(q.Y))}" r="4" fill="var(--surface, #ffffff)" stroke="var(--attn, #b65c1f)" stroke-width="1.8"/>`,
    );
  });

  const svg = `<svg viewBox="0 0 ${L} ${H}" width="${L}" height="${H}" style="max-width:100%;height:auto" role="img" aria-label="Points transformés et droite d'ajustement">${parts.join("")}</svg>`;
  const legende = `<div style="font-size:12.5px;color:${COULEURS.doux};margin-top:2px">Points (${grandeurXTexte(e)} ; ${grandeurYTexte(e)}) du tableau ; points pleins : les deux lignes utilisées pour la droite.</div>`;
  return `<div style="text-align:center">${svg}${legende}</div>`;
}
