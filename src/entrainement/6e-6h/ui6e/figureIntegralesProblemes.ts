import type { ExerciceFamilleA_Problemes, ExerciceFamilleF_Problemes } from "../core6e/integralesProblemes.types";

/**
 * Figures SVG AUTONOMES de `6gen29` (audit 6e ch.4) — destinées au corrigé papier
 * (`EtapeCorrection.figureHtml`, phase 2) et utilisables à l'écran (`dangerouslySetInnerHTML`) :
 * couleurs en `var(--jeton, #repli)` (le thème de la page à l'écran, une valeur littérale lisible à
 * l'impression), axes fléchés, fenêtre fixée ici (jamais recalculée par le navigateur), largeur
 * 100 % plafonnée.
 * - Famille A : profil mesuré et trapèzes de la méthode.
 * - Famille F : demande, offre, point d'équilibre (Q ; P) et surplus du consommateur hachuré.
 */

const C = {
  encre: "var(--ink, #1b1d22)",
  doux: "var(--ink-soft, #5c6370)",
  pale: "var(--ink-faint, #9aa3ad)",
  accent: "var(--accent, #b65c1f)",
  accentDoux: "var(--accent-soft, #f4e3d1)",
  bon: "var(--good, #2f7a4f)",
  bonDoux: "var(--good-soft, #dcefe2)",
  ciel: "var(--sky, #2f6fb0)",
};

const LARGEUR = 360;
const HAUTEUR = 240;
const MARGE = { gauche: 34, droite: 18, haut: 16, bas: 28 };

interface Fenetre {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function echelle(f: Fenetre) {
  const lx = LARGEUR - MARGE.gauche - MARGE.droite;
  const ly = HAUTEUR - MARGE.haut - MARGE.bas;
  return {
    X: (x: number) => MARGE.gauche + ((x - f.xMin) / (f.xMax - f.xMin)) * lx,
    Y: (y: number) => MARGE.haut + ((f.yMax - y) / (f.yMax - f.yMin)) * ly,
  };
}

const nb = (v: number) => (Math.round(v * 100) / 100).toString();
const virgule = (v: number, d = 2) => (Math.round(v * 10 ** d) / 10 ** d).toString().replace(".", ",");

function axes(f: Fenetre, etiquetteX: string, etiquetteY: string): string {
  const { X, Y } = echelle(f);
  const x0 = X(Math.max(f.xMin, 0));
  const y0 = Y(Math.max(f.yMin, 0));
  const fleche = (x: number, y: number, dx: number, dy: number) => `<path d="M${nb(x)} ${nb(y)} l${nb(-6 * dx - 3 * dy)} ${nb(-6 * dy + 3 * dx)} M${nb(x)} ${nb(y)} l${nb(-6 * dx + 3 * dy)} ${nb(-6 * dy - 3 * dx)}" stroke="${C.encre}" fill="none" stroke-width="1.2"/>`;
  const xFin = LARGEUR - MARGE.droite + 8;
  const yFin = MARGE.haut - 8;
  return [
    `<line x1="${MARGE.gauche - 4}" y1="${nb(y0)}" x2="${xFin}" y2="${nb(y0)}" stroke="${C.encre}" stroke-width="1.2"/>`,
    fleche(xFin, y0, 1, 0),
    `<line x1="${nb(x0)}" y1="${HAUTEUR - MARGE.bas + 4}" x2="${nb(x0)}" y2="${yFin}" stroke="${C.encre}" stroke-width="1.2"/>`,
    fleche(x0, yFin, 0, -1),
    `<text x="${xFin - 2}" y="${nb(y0 + 16)}" font-size="12" text-anchor="end" fill="${C.encre}" font-style="italic">${etiquetteX}</text>`,
    `<text x="${nb(x0 + 6)}" y="${yFin + 10}" font-size="12" fill="${C.encre}" font-style="italic">${etiquetteY}</text>`,
  ].join("");
}

function svg(contenu: string, titre: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" width="100%" style="max-width:${LARGEUR}px;display:block;margin:0 auto" role="img" aria-label="${titre}" font-family="system-ui, sans-serif">${contenu}</svg>`;
}

/** Famille A — profil mesuré (hauteurs y₀…yₙ tous les Δx) et les trapèzes de la méthode. */
export function figureTrapezesSvg(exercice: ExerciceFamilleA_Problemes): string {
  const n = exercice.y.length - 1;
  const yMax = Math.max(...exercice.y) + 2;
  const fenetre: Fenetre = { xMin: 0, xMax: n * exercice.deltaX + 0.6, yMin: 0, yMax };
  const { X, Y } = echelle(fenetre);
  const morceaux: string[] = [];
  for (let i = 0; i < n; i++) {
    const xa = i * exercice.deltaX;
    const xb = (i + 1) * exercice.deltaX;
    morceaux.push(
      `<polygon points="${nb(X(xa))},${nb(Y(0))} ${nb(X(xa))},${nb(Y(exercice.y[i]))} ${nb(X(xb))},${nb(Y(exercice.y[i + 1]))} ${nb(X(xb))},${nb(Y(0))}" fill="${C.accentDoux}" stroke="${C.accent}" stroke-width="1"/>`,
    );
  }
  exercice.y.forEach((h, i) => {
    const x = i * exercice.deltaX;
    morceaux.push(`<circle cx="${nb(X(x))}" cy="${nb(Y(h))}" r="2.6" fill="${C.accent}"/>`);
    morceaux.push(`<text x="${nb(X(x))}" y="${nb(Y(h) - 6)}" font-size="10" text-anchor="middle" fill="${C.encre}">${h}</text>`);
    morceaux.push(`<text x="${nb(X(x))}" y="${nb(Y(0) + 13)}" font-size="10" text-anchor="middle" fill="${C.doux}">${nb(x)}</text>`);
  });
  return svg(axes(fenetre, "x (m)", "y (m)") + morceaux.join(""), "Profil mesuré et trapèzes de la méthode");
}

/** Famille F — demande f, offre g, équilibre (Q ; P), surplus du consommateur hachuré. */
export function figureSurplusSvg(exercice: ExerciceFamilleF_Problemes): string {
  const k = exercice.kNum / exercice.kDen;
  const f = (x: number) => exercice.A * Math.exp(-k * x);
  const g = (x: number) => exercice.m * x + exercice.p;
  const xMax = Math.max(exercice.Q * 1.7, exercice.Q + 2);
  const yMax = Math.max(exercice.A, g(xMax)) * 1.08;
  const fenetre: Fenetre = { xMin: 0, xMax, yMin: 0, yMax };
  const { X, Y } = echelle(fenetre);
  const pas = 80;
  const trace = (fn: (x: number) => number, de: number, a: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= pas; i++) {
      const x = de + ((a - de) * i) / pas;
      pts.push(`${nb(X(x))},${nb(Y(Math.min(fn(x), yMax)))}`);
    }
    return pts.join(" ");
  };
  const haut: string[] = [];
  for (let i = 0; i <= pas; i++) {
    const x = (exercice.Q * i) / pas;
    haut.push(`${nb(X(x))},${nb(Y(f(x)))}`);
  }
  const region = `<polygon points="${haut.join(" ")} ${nb(X(0))},${nb(Y(exercice.P))}" fill="${C.bonDoux}" stroke="none"/>`;
  const motif = `<defs><pattern id="hachuresSurplus" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="${C.bon}" stroke-width="1"/></pattern></defs>`;
  const hachures = `<polygon points="${haut.join(" ")} ${nb(X(0))},${nb(Y(exercice.P))}" fill="url(#hachuresSurplus)" stroke="${C.bon}" stroke-width="0.8"/>`;
  const contenu = [
    motif,
    region,
    hachures,
    `<polyline points="${trace(f, 0, xMax)}" fill="none" stroke="${C.accent}" stroke-width="2"/>`,
    `<polyline points="${trace(g, 0, xMax)}" fill="none" stroke="${C.ciel}" stroke-width="2"/>`,
    `<line x1="${nb(X(0))}" y1="${nb(Y(exercice.P))}" x2="${nb(X(exercice.Q))}" y2="${nb(Y(exercice.P))}" stroke="${C.doux}" stroke-dasharray="4 3"/>`,
    `<line x1="${nb(X(exercice.Q))}" y1="${nb(Y(exercice.P))}" x2="${nb(X(exercice.Q))}" y2="${nb(Y(0))}" stroke="${C.doux}" stroke-dasharray="4 3"/>`,
    `<circle cx="${nb(X(exercice.Q))}" cy="${nb(Y(exercice.P))}" r="3" fill="${C.encre}"/>`,
    `<text x="${nb(X(exercice.Q) + 6)}" y="${nb(Y(exercice.P) - 6)}" font-size="11" fill="${C.encre}">(${virgule(exercice.Q)} ; ${virgule(exercice.P)})</text>`,
    `<text x="${nb(X(0) - 4)}" y="${nb(Y(exercice.P) + 4)}" font-size="11" text-anchor="end" fill="${C.doux}" font-style="italic">P</text>`,
    `<text x="${nb(X(exercice.Q))}" y="${nb(Y(0) + 13)}" font-size="11" text-anchor="middle" fill="${C.doux}" font-style="italic">Q</text>`,
    `<text x="${nb(X(xMax * 0.04))}" y="${nb(Y(f(xMax * 0.04)) - 6)}" font-size="11" fill="${C.accent}">demande f</text>`,
    `<text x="${nb(X(xMax * 0.97))}" y="${nb(Y(Math.min(g(xMax * 0.97), yMax)) + 14)}" font-size="11" text-anchor="end" fill="${C.ciel}">offre g</text>`,
    `<text x="${nb(X(exercice.Q * 0.3))}" y="${nb((Y(exercice.P) + Y(f(exercice.Q * 0.3))) / 2 + 4)}" font-size="11" fill="${C.bon}" font-weight="600">S</text>`,
  ].join("");
  return svg(axes(fenetre, "x", "prix") + contenu, "Demande, offre, équilibre et surplus du consommateur");
}
