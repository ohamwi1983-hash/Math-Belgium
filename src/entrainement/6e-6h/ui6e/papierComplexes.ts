import { COULEURS, etiquetteNombre } from "./figureRepereIntegrales";
import { pgcd } from "../generateurs6e/calculPrimitives/aleatoire";

/**
 * Briques PAPIER des corrigés du chapitre « Nombres complexes » (6e) sans dépendance à `docx` :
 * figure du plan complexe (`planComplexeSvg` : cercle, polygone des racines, ou point avec module et
 * argument), écriture des angles kπ/d (`anglePiLatex`), fractions normalisées. Extraites de
 * `generateurs6e/racinesNiemes/exportEvaluation.ts` (qui les réexporte) pour que les corrigés
 * détaillés (`corrigeDetaille.ts` de chaque générateur) soient aussi importables par les générateurs
 * interactifs (corrigé d'une étape échouée).
 */

// ============================================================================
// Figure : plan complexe (cercle, polygone des racines, ou point avec module et argument).
// ============================================================================

export interface PointPlanComplexe {
  x: number;
  y: number;
  etiquette?: string;
}

export interface OptionsPlanComplexe {
  points: PointPlanComplexe[];
  /** Cercle centré à l'origine (rayon en unités), en pointillés, avec sa graduation sur l'axe réel. */
  rayonCercle?: number;
  /** Relie les points dans l'ordre (polygone régulier des racines). */
  polygone?: boolean;
  /** Point unique : segment [O ; z] (module r) et arc de l'argument θ (en radians). */
  moduleArgument?: { r: string; theta: number };
  libelle: string;
}

const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = `stroke="var(--surface, #ffffff)" stroke-width="3" stroke-linejoin="round" paint-order="stroke"`;
const INDICES = "₀₁₂₃₄₅₆₇₈₉";
let compteurFigures = 0;

function f1(v: number): string {
  return Number.isFinite(v) ? v.toFixed(1) : "0";
}
function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/-/g, "−");
}
export function indice(k: number): string {
  return String(k)
    .split("")
    .map((c) => INDICES[Number(c)])
    .join("");
}

/** Chaîne SVG autonome (couleurs du thème avec repli imprimable, comme `figureRepereIntegrales`). */
export function planComplexeSvg(o: OptionsPlanComplexe): string {
  const id = `pc${++compteurFigures}`;
  const L = 250;
  const c = L / 2;
  const etendue = Math.max(o.rayonCercle ?? 0, ...o.points.map((p) => Math.hypot(p.x, p.y)), 1e-6);
  const s = 82 / etendue;
  const X = (x: number) => c + x * s;
  const Y = (y: number) => c - y * s;
  const m: string[] = [];
  m.push(`<defs><marker id="${id}fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COULEURS.doux}"/></marker><marker id="${id}arc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COULEURS.ciel}"/></marker></defs>`);
  m.push(
    `<line x1="12" y1="${c}" x2="${L - 8}" y2="${c}" stroke="${COULEURS.doux}" stroke-width="1.1" marker-end="url(#${id}fl)"/>`,
    `<line x1="${c}" y1="${L - 12}" x2="${c}" y2="8" stroke="${COULEURS.doux}" stroke-width="1.1" marker-end="url(#${id}fl)"/>`,
    `<text x="${L - 22}" y="${c + 16}" font-size="12" font-style="italic" fill="${COULEURS.doux}" ${POLICE}>Re</text>`,
    `<text x="${c + 6}" y="18" font-size="12" font-style="italic" fill="${COULEURS.doux}" ${POLICE}>Im</text>`,
  );
  // « O » à l'écart de l'arc de l'argument (sous l'axe, sauf si l'arc y passe déjà).
  const oEnHaut = (o.moduleArgument?.theta ?? 0) < -Math.PI / 2;
  m.push(`<text x="${c - 5}" y="${oEnHaut ? c - 6 : c + 14}" font-size="11" text-anchor="end" fill="${COULEURS.doux}" ${POLICE}>O</text>`);
  const etiquettes: string[] = [];
  if (o.rayonCercle !== undefined) {
    const R = o.rayonCercle * s;
    m.push(`<circle cx="${c}" cy="${c}" r="${f1(R)}" fill="none" stroke="${COULEURS.pale}" stroke-width="1.1" stroke-dasharray="4 3"/>`);
    m.push(`<line x1="${f1(c + R)}" y1="${c - 3}" x2="${f1(c + R)}" y2="${c + 3}" stroke="${COULEURS.doux}" stroke-width="1"/>`);
    etiquettes.push(`<text x="${f1(c + R + 3)}" y="${c - 5}" font-size="10.5" fill="${COULEURS.doux}" ${HALO} ${POLICE}>${echapper(etiquetteNombre(o.rayonCercle))}</text>`);
  }
  if (o.polygone && o.points.length >= 2) {
    const pts = o.points.map((p) => `${f1(X(p.x))},${f1(Y(p.y))}`).join(" ");
    m.push(
      o.points.length === 2
        ? `<polyline points="${pts}" fill="none" stroke="${COULEURS.accent}" stroke-width="1.6"/>`
        : `<polygon points="${pts}" fill="${COULEURS.accentDoux}" fill-opacity="0.45" stroke="${COULEURS.accent}" stroke-width="1.6" stroke-linejoin="round"/>`,
    );
  }
  if (o.moduleArgument && o.points[0]) {
    const p = o.points[0];
    const th = o.moduleArgument.theta;
    m.push(`<line x1="${c}" y1="${c}" x2="${f1(X(p.x))}" y2="${f1(Y(p.y))}" stroke="${COULEURS.accent}" stroke-width="1.6"/>`);
    // Projections sur les axes (lecture de a et b).
    m.push(
      `<line x1="${f1(X(p.x))}" y1="${f1(Y(p.y))}" x2="${f1(X(p.x))}" y2="${c}" stroke="${COULEURS.pale}" stroke-width="1" stroke-dasharray="3 3"/>`,
      `<line x1="${f1(X(p.x))}" y1="${f1(Y(p.y))}" x2="${c}" y2="${f1(Y(p.y))}" stroke="${COULEURS.pale}" stroke-width="1" stroke-dasharray="3 3"/>`,
    );
    if (Math.abs(th) > 1e-9) {
      const rho = 24;
      const xa = c + rho * Math.cos(th);
      const ya = c - rho * Math.sin(th);
      const grand = Math.abs(th) > Math.PI + 1e-9 ? 1 : 0;
      const sens = th > 0 ? 0 : 1;
      m.push(`<path d="M${f1(c + rho)},${c} A${rho},${rho} 0 ${grand} ${sens} ${f1(xa)},${f1(ya)}" fill="none" stroke="${COULEURS.ciel}" stroke-width="1.5" marker-end="url(#${id}arc)"/>`);
      etiquettes.push(
        `<text x="${f1(c + 38 * Math.cos(th / 2))}" y="${f1(c - 38 * Math.sin(th / 2) + 4)}" font-size="12" font-style="italic" text-anchor="middle" fill="${COULEURS.ciel}" ${HALO} ${POLICE}>θ</text>`,
      );
    }
    const mx = (X(p.x) + c) / 2;
    const my = (Y(p.y) + c) / 2;
    const ang = Math.atan2(p.y, p.x);
    etiquettes.push(
      `<text x="${f1(mx - 11 * Math.sin(ang))}" y="${f1(my - 11 * Math.cos(ang) + 4)}" font-size="12" font-style="italic" text-anchor="middle" fill="${COULEURS.accent}" ${HALO} ${POLICE}>${echapper(o.moduleArgument.r)}</text>`,
    );
  }
  for (const p of o.points) {
    const px = X(p.x);
    const py = Y(p.y);
    m.push(`<circle cx="${f1(px)}" cy="${f1(py)}" r="3.4" fill="${COULEURS.accent}"/>`);
    if (p.etiquette) {
      const ang = Math.atan2(p.y, p.x);
      const lx = px + 15 * Math.cos(ang);
      const ly = py - 15 * Math.sin(ang) + 4;
      const ancre = Math.cos(ang) > 0.35 ? "start" : Math.cos(ang) < -0.35 ? "end" : "middle";
      etiquettes.push(`<text x="${f1(lx)}" y="${f1(ly)}" font-size="12" font-style="italic" text-anchor="${ancre}" fill="${COULEURS.encre}" ${HALO} ${POLICE}>${echapper(p.etiquette)}</text>`);
    }
  }
  m.push(...etiquettes);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${L}" width="${L}" height="${L}" style="max-width:100%;height:auto" role="img" aria-label="${echapper(o.libelle)}">${m.join("")}</svg>`;
}

// ============================================================================
// Écriture des valeurs.
// ============================================================================

/** `\frac{-1}{2}` (forme produite par `combinerModuleAngle`) réécrit `-\frac{1}{2}` dans toutes les
 * valeurs exactes de l'exercice : sur papier, « z = −½ + … » et non « z = (−1)/2 + … ». Copie
 * profonde, l'exercice d'origine n'est pas modifié. */
export function normaliserFractions<T>(valeur: T): T {
  if (Array.isArray(valeur)) return valeur.map((v) => normaliserFractions(v)) as T;
  if (valeur && typeof valeur === "object") {
    const sortie: Record<string, unknown> = {};
    for (const [cle, v] of Object.entries(valeur)) {
      sortie[cle] = cle === "latex" && typeof v === "string" ? v.replace(/^\\frac\{-(.*)\}\{(\d+)\}$/, "-\\frac{$1}{$2}") : normaliserFractions(v);
    }
    return sortie as T;
  }
  return valeur;
}

/** Applique `normaliserFractions` à l'exercice avant chaque fonction de l'adaptateur. */
export function avecFractionsNormalisees<E, R>(fn: (e: E) => R): (e: E) => R {
  return (e) => fn(normaliserFractions(e));
}

/** Angle kπ/d NON réduit modulo 2π (fraction simplifiée seulement) — pour écrire θₖ tel que la formule
 * le donne, avant toute réduction. */
export function anglePiLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const g = pgcd(Math.abs(num), den);
  const n = num / g;
  const d = den / g;
  const signe = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (d === 1) return a === 1 ? `${signe}\\pi` : `${signe}${a}\\pi`;
  return a === 1 ? `${signe}\\frac{\\pi}{${d}}` : `${signe}\\frac{${a}\\pi}{${d}}`;
}

