import type { CourbeLog, ExerciceAssocierCourbesLog, ExerciceLectureCourbeLog } from "../core6e/lireCourbeLogarithmique.types";
import type { CadreCourbes } from "./formatLireCourbeLogarithmique";
import { cadreCourbes, courbesExercice, evaluerCourbe, pointBase, pointUn } from "./formatLireCourbeLogarithmique";

/**
 * Figure de `6gen85` : courbe de f(x) = log_a(x − c) + d sur un quadrillage d'UNE unité (fenêtre aux
 * bornes entières, `cadreCourbes`), asymptote verticale en pointillés. Chaîne SVG AUTONOME, la même
 * à l'écran (`dangerouslySetInnerHTML`) et sur papier (`enteteHtml` / `figureHtml`) :
 *
 * - énoncé papier : la courbe seule — aucun point marqué, aucune coordonnée (décision de
 *   l'utilisateur, comme gen8/gen10) ; les deux points utiles, (c + 1 ; d) et (c + k ; d ± 1), sont à
 *   coordonnées entières et tombent donc sur des intersections du quadrillage ;
 * - écran (variante `lecture`) : ces deux points sont marqués par des lettres neutres (P, Q) ;
 * - corrigé : les deux points avec leurs coordonnées.
 *
 * La courbe est échantillonnée en ln(x − c) (pas régulier en ordonnée), ce qui la prolonge jusqu'au
 * bord du cadre même pour la base 10, qui colle à son asymptote ; elle est découpée au cadre par un
 * `clipPath` dont l'identifiant est DÉRIVÉ DU CONTENU (jamais d'un compteur global).
 */

export interface PointFigure {
  x: number;
  y: number;
  label: string;
  /** Étiquette sous le point (à droite) plutôt qu'au-dessus — du côté où la courbe ne passe pas. */
  dessous?: boolean;
}

export interface OptionsFigureCourbeLog {
  cadre: CadreCourbes;
  /** Encombrement visé de la zone quadrillée (unités SVG). */
  largeurMax: number;
  hauteurMax: number;
  carreauMin?: number;
  carreauMax?: number;
  /** Taille des graduations ; les étiquettes de points et le numéro en dérivent. */
  police: number;
  points?: PointFigure[];
  /** Numéro de courbe écrit en haut à gauche (variante `associer`). */
  numero?: number;
  /** Cadre accentué (courbe de l'écran en cours, variante `associer`). */
  surligne?: boolean;
  /** Mise à l'échelle CSS (écran) : la figure occupe la largeur de son conteneur. */
  fluide?: boolean;
}

const MARGE = 10;
const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_COURBE = "#1971c2";
const COULEUR_ASYMPTOTE = "#e8590c";
const COULEUR_POINT = "#2b2d42";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = 'stroke="#ffffff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"';

function f1(v: number): string {
  return v.toFixed(1);
}

function nombre(v: number): string {
  return v < 0 ? `−${Math.abs(v)}` : String(v);
}

/** Petite empreinte (djb2) pour un identifiant SVG déterministe. */
function empreinte(texte: string): string {
  let h = 5381;
  for (let i = 0; i < texte.length; i++) h = ((h * 33) ^ texte.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export function figureCourbeLogSvg(courbe: CourbeLog, options: OptionsFigureCourbeLog): string {
  const { xMin, xMax, yMin, yMax } = options.cadre;
  const largeurU = xMax - xMin;
  const hauteurU = yMax - yMin;
  const carreau = Math.max(options.carreauMin ?? 12, Math.min(options.carreauMax ?? 30, Math.floor(Math.min(options.largeurMax / largeurU, options.hauteurMax / hauteurU))));
  const L = largeurU * carreau + 2 * MARGE;
  const H = hauteurU * carreau + 2 * MARGE;
  const sx = (x: number) => MARGE + (x - xMin) * carreau;
  const sy = (y: number) => MARGE + (yMax - y) * carreau;
  const p = options.police;
  const pasEtiquette = carreau >= 2 * p ? 1 : 2 * carreau >= 2 * p ? 2 : 5;
  const id = `lc${empreinte(JSON.stringify([courbe, options.cadre, carreau, options.numero ?? 0, (options.points ?? []).length]))}`;
  const o: string[] = [];

  o.push(`<defs><clipPath id="${id}"><rect x="${MARGE}" y="${MARGE}" width="${largeurU * carreau}" height="${hauteurU * carreau}"/></clipPath></defs>`);
  o.push(`<rect x="0" y="0" width="${L}" height="${H}" fill="#ffffff"/>`);
  for (let x = xMin; x <= xMax; x++) o.push(`<line x1="${f1(sx(x))}" y1="${MARGE}" x2="${f1(sx(x))}" y2="${H - MARGE}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  for (let y = yMin; y <= yMax; y++) o.push(`<line x1="${MARGE}" y1="${f1(sy(y))}" x2="${L - MARGE}" y2="${f1(sy(y))}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  // Axes (la fenêtre contient toujours l'origine : xMin ≤ −1, xMax ≥ 2, yMin ≤ −1, yMax ≥ 1).
  o.push(`<line x1="${MARGE}" y1="${f1(sy(0))}" x2="${L - MARGE}" y2="${f1(sy(0))}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`);
  o.push(`<line x1="${f1(sx(0))}" y1="${MARGE}" x2="${f1(sx(0))}" y2="${H - MARGE}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`);

  // Asymptote verticale x = c.
  o.push(`<line x1="${f1(sx(courbe.c))}" y1="${MARGE}" x2="${f1(sx(courbe.c))}" y2="${H - MARGE}" stroke="${COULEUR_ASYMPTOTE}" stroke-width="1.6" stroke-dasharray="6 4"/>`);

  // Courbe : x = c + e^s, s régulier — ordonnées régulièrement espacées.
  const sMin = Math.log(1e-6);
  const sMax = Math.log(xMax - courbe.c + 1);
  const n = 480;
  const morceaux: string[] = [];
  for (let i = 0; i <= n; i++) {
    const s = sMin + ((sMax - sMin) * i) / n;
    const x = courbe.c + Math.exp(s);
    const y = evaluerCourbe(courbe, x);
    if (y < yMin - hauteurU || y > yMax + hauteurU) continue;
    morceaux.push(`${morceaux.length === 0 ? "M" : "L"} ${f1(sx(x))},${f1(sy(y))}`);
  }
  o.push(`<path d="${morceaux.join(" ")}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#${id})"/>`);

  // Graduations (valeurs entières, tous les 1, 2 ou 5 selon la place), halo blanc.
  const yAxeX = Math.min(sy(0) + p + 3, H - 3);
  // Graduations de l'axe des y à sa gauche : la fenêtre garde toujours au moins une unité à gauche de
  // l'axe (xMin ≤ −1).
  const xAxeY = sx(0) - 3;
  for (let x = xMin; x <= xMax; x++) {
    // Pas de graduation sur les bords du cadre (elle y serait coupée).
    if (x === 0 || x === xMin || x === xMax || x % pasEtiquette !== 0) continue;
    o.push(`<text x="${f1(sx(x))}" y="${f1(yAxeX)}" font-size="${p}" text-anchor="middle" fill="${COULEUR_AXE}" ${POLICE} ${HALO}>${nombre(x)}</text>`);
  }
  for (let y = yMin; y <= yMax; y++) {
    if (y === 0 || y === yMin || y === yMax || y % pasEtiquette !== 0) continue;
    o.push(`<text x="${f1(xAxeY)}" y="${f1(sy(y) + p / 2.8)}" font-size="${p}" text-anchor="end" fill="${COULEUR_AXE}" ${POLICE} ${HALO}>${nombre(y)}</text>`);
  }

  for (const pt of options.points ?? []) {
    const px = sx(pt.x);
    const py = sy(pt.y);
    const versGauche = px + p * 0.5 + pt.label.length * p * 0.62 > L - MARGE;
    // Point sur l'axe des abscisses : l'étiquette passe de l'autre côté (graduations).
    const dessous = pt.y === 0 ? !pt.dessous : pt.dessous;
    o.push(`<circle cx="${f1(px)}" cy="${f1(py)}" r="${(p / 3).toFixed(1)}" fill="${COULEUR_POINT}"/>`);
    o.push(
      `<text x="${f1(px + (versGauche ? -p * 0.5 : p * 0.5))}" y="${f1(dessous ? py + p * 1.35 : py - p * 0.55)}" font-size="${(p * 1.1).toFixed(1)}" font-weight="bold" text-anchor="${versGauche ? "end" : "start"}" fill="${COULEUR_POINT}" ${POLICE} ${HALO}>${pt.label}</text>`,
    );
  }

  if (options.numero !== undefined) {
    const t = p * 1.5;
    o.push(`<rect x="${MARGE + 3}" y="${MARGE + 3}" width="${f1(t * 1.15)}" height="${f1(t * 1.25)}" rx="3" fill="#ffffff" stroke="${COULEUR_AXE}" stroke-width="1"/>`);
    o.push(`<text x="${f1(MARGE + 3 + t * 0.575)}" y="${f1(MARGE + 3 + t)}" font-size="${f1(t)}" font-weight="bold" text-anchor="middle" fill="${COULEUR_AXE}" ${POLICE}>${options.numero}</text>`);
  }
  o.push(
    options.surligne
      ? `<rect x="1.5" y="1.5" width="${L - 3}" height="${H - 3}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="3"/>`
      : `<rect x="0.5" y="0.5" width="${L - 1}" height="${H - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`,
  );
  const style = options.fluide ? ' style="width:100%;height:auto;display:block"' : "";
  return `<svg class="graphe-cyclo" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}"${style} xmlns="http://www.w3.org/2000/svg">${o.join("")}</svg>`;
}

// ============================================================================
// Figures prêtes à l'emploi (écran, énoncé papier, corrigé).
// ============================================================================

export type UsageFigure = "ecran" | "papier" | "corrige";

/** Variante `lecture` : écran = points P, Q marqués ; papier = courbe seule ; corrigé = points et
 * coordonnées. */
export function figureLecture(e: ExerciceLectureCourbeLog, usage: UsageFigure): string {
  const cadre = cadreCourbes([e.courbe]);
  const un = pointUn(e.courbe);
  const base = pointBase(e.courbe);
  // Courbe croissante (concave) : la place libre est sous la courbe ; décroissante : au-dessus.
  const dessous = e.courbe.base.num > e.courbe.base.den;
  const points =
    usage === "papier"
      ? []
      : usage === "ecran"
        ? [
            { ...un, label: e.lettrePointUn, dessous },
            { ...base, label: e.lettrePointBase, dessous },
          ]
        : [
            { ...un, label: `(${nombre(un.x)} ; ${nombre(un.y)})`, dessous },
            { ...base, label: `(${nombre(base.x)} ; ${nombre(base.y)})`, dessous },
          ];
  return usage === "ecran"
    ? figureCourbeLogSvg(e.courbe, { cadre, largeurMax: 340, hauteurMax: 300, carreauMin: 18, carreauMax: 44, police: 12, points, fluide: true })
    : figureCourbeLogSvg(e.courbe, { cadre, largeurMax: 320, hauteurMax: 270, carreauMin: 14, carreauMax: 28, police: 9, points });
}

/** Variante `associer` : les quatre courbes, même fenêtre, numérotées 1 à 4 (aucun point marqué à
 * l'écran ni dans l'énoncé — c'est l'association qu'on évalue ; le corrigé marque les deux points
 * utiles). `surligne` : indice de la courbe de l'écran en cours. */
export function figuresAssocier(e: ExerciceAssocierCourbesLog, usage: UsageFigure, surligne?: number): string[] {
  const courbes = courbesExercice(e);
  const cadre = cadreCourbes(courbes);
  return courbes.map((k, i) => {
    if (usage === "ecran") return figureCourbeLogSvg(k, { cadre, largeurMax: 250, hauteurMax: 220, carreauMin: 14, carreauMax: 30, police: 13, numero: i + 1, surligne: surligne === i, fluide: true });
    const points = usage === "corrige" ? [{ ...pointUn(k), label: "" }, { ...pointBase(k), label: "" }] : [];
    return figureCourbeLogSvg(k, { cadre, largeurMax: 290, hauteurMax: 230, carreauMin: 13, carreauMax: 24, police: 9, numero: i + 1, points });
  });
}
