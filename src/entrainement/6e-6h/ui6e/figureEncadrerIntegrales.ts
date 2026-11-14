import type { ExerciceComparerIntegrales, ExerciceEncadrerIntegrale, ExerciceEncadrerIntegrales, ExerciceSigneIntegrale, NombreExact } from "../core6e/encadrerIntegrales.types";
import type { PhaseEncadrerIntegrales } from "../moteur6e/typesEncadrerIntegrales";
import { COULEURS, fenetreY, repereSvg } from "./figureRepereIntegrales";
import type { CourbeRepere, RegionRepere, SegmentRepere } from "./figureRepereIntegrales";

/**
 * Figures de `6gen79` « Comparer et encadrer des intégrales » — chaînes SVG autonomes (écran et
 * `figureHtml`/`enteteHtml` du papier), repère commun du chapitre (`figureRepereIntegrales.ts`).
 *
 * Ce qu'une figure ne doit jamais trahir pendant la résolution :
 * - `signe` : la courbe montrerait le signe de f → seulement une fois l'étape 1 close ;
 * - `comparer` : les deux courbes montreraient l'inégalité → seulement une fois l'étape 1 close ;
 *   f et g gardent TOUJOURS les mêmes couleurs (f orange, g bleu), quelle que soit l'issue, et la
 *   région entre elles est neutre (gris), jamais verte/rouge selon le verdict ;
 * - `encadrer`/`moyenne` : courbe sans aucune graduation verticale (m et M restent à calculer), ou
 *   le tableau de variations donné ; le corrigé ajoute les rectangles de hauteurs m et M.
 */

const NEUTRE = "var(--line-soft, #dfe7ec)";
const NEUTRE_TRAIT = "var(--ink-faint, #8a97a1)";

function fenetreX(p: number, q: number): { xMin: number; xMax: number } {
  const marge = Math.max(0.25, (q - p) * 0.12);
  return { xMin: p - marge, xMax: q + marge };
}

function graduationsBornes(p: NombreExact, q: NombreExact) {
  return [
    { x: p.valeur, etiquette: p.texte },
    { x: q.valeur, etiquette: q.texte },
  ];
}

function bornesVerticales(fns: ((x: number) => number)[], p: number, q: number): SegmentRepere[] {
  const segments: SegmentRepere[] = [];
  for (const x of [p, q]) {
    const ys = fns.map((f) => f(x)).filter(Number.isFinite);
    if (ys.length === 0) continue;
    const haut = Math.max(0, ...ys);
    const bas = Math.min(0, ...ys);
    segments.push({ x1: x, y1: bas, x2: x, y2: haut, couleur: NEUTRE_TRAIT, pointilles: true, epaisseur: 1 });
  }
  return segments;
}

/** Signe : courbe de f, région entre la courbe et l'axe sur [p ; q]. `neutre` (énoncé) : région
 * grise et légende sans le signe — la courbe se lit, mais aucun texte ni couleur ne donne la réponse. */
export function figureSigneSvg(e: ExerciceSigneIntegrale, neutre = false): string {
  const p = e.p.valeur;
  const q = e.q.valeur;
  const { xMin, xMax } = fenetreX(p, q);
  const { yMin, yMax } = fenetreY([e.fn], p, q);
  const positif = e.signeF === "positif";
  const regions: RegionRepere[] = [
    { de: p, a: q, haut: (x) => Math.max(e.fn(x), 0), bas: (x) => Math.min(e.fn(x), 0), remplissage: neutre ? NEUTRE : positif ? COULEURS.bonDoux : COULEURS.mauvaisDoux, contour: neutre ? NEUTRE_TRAIT : positif ? COULEURS.bon : COULEURS.mauvais },
  ];
  const courbes: CourbeRepere[] = [{ fn: e.fn, de: xMin, a: xMax, couleur: COULEURS.accent, etiquette: "f" }];
  return repereSvg({
    xMin,
    xMax,
    yMin,
    yMax,
    graduationsX: graduationsBornes(e.p, e.q),
    regions,
    courbes,
    segments: bornesVerticales([e.fn], p, q),
    libelle: neutre ? `Courbe de f sur [${e.p.texte} ; ${e.q.texte}]` : `Courbe de f sur [${e.p.texte} ; ${e.q.texte}] : f y est ${positif ? "positive" : "négative"}`,
  });
}

/** Comparer : courbes de f (orange) et g (bleu), région entre elles en gris neutre. */
export function figureComparaisonSvg(e: ExerciceComparerIntegrales): string {
  const p = e.p.valeur;
  const q = e.q.valeur;
  const { xMin, xMax } = fenetreX(p, q);
  const { yMin, yMax } = fenetreY([e.fn, e.gn], p, q);
  const regions: RegionRepere[] = [{ de: p, a: q, haut: (x) => Math.max(e.fn(x), e.gn(x)), bas: (x) => Math.min(e.fn(x), e.gn(x)), remplissage: NEUTRE, contour: NEUTRE_TRAIT }];
  const courbes: CourbeRepere[] = [
    { fn: e.fn, de: xMin, a: xMax, couleur: COULEURS.accent, etiquette: "f" },
    { fn: e.gn, de: xMin, a: xMax, couleur: COULEURS.ciel, etiquette: "g" },
  ];
  return repereSvg({
    xMin,
    xMax,
    yMin,
    yMax,
    graduationsX: graduationsBornes(e.p, e.q),
    regions,
    courbes,
    segments: bornesVerticales([e.fn, e.gn], p, q),
    libelle: `Courbes de f et de g sur [${e.p.texte} ; ${e.q.texte}]`,
  });
}

/** Encadrer (énoncé, f monotone) : la courbe et les bornes a, b, sans graduation verticale. */
export function figureCourbeEncadrementSvg(e: ExerciceEncadrerIntegrale): string {
  const a = e.a.valeur;
  const b = e.b.valeur;
  const { xMin, xMax } = fenetreX(a, b);
  const { yMin, yMax } = fenetreY([e.fn], a, b);
  return repereSvg({
    xMin,
    xMax,
    yMin,
    yMax,
    graduationsX: graduationsBornes(e.a, e.b),
    regions: [{ de: a, a: b, haut: (x) => Math.max(e.fn(x), 0), bas: (x) => Math.min(e.fn(x), 0), remplissage: COULEURS.accentDoux }],
    courbes: [{ fn: e.fn, de: xMin, a: xMax, couleur: COULEURS.accent, etiquette: "f" }],
    segments: bornesVerticales([e.fn], a, b),
    libelle: `Courbe de f sur [${e.a.texte} ; ${e.b.texte}]`,
  });
}

/** Corrigé de l'encadrement : rectangles de hauteurs m et M sur [a ; b], courbe de f. */
export function figureRectanglesSvg(e: ExerciceEncadrerIntegrale): string {
  const a = e.a.valeur;
  const b = e.b.valeur;
  const { xMin, xMax } = fenetreX(a, b);
  const { yMin, yMax } = fenetreY([e.fn, () => e.m.valeur, () => e.M.valeur], a, b);
  const m = e.m.valeur;
  const M = e.M.valeur;
  const regions: RegionRepere[] = [
    { de: a, a: b, haut: () => Math.max(M, 0), bas: () => Math.min(M, 0), remplissage: COULEURS.accentDoux, contour: COULEURS.accent },
    { de: a, a: b, haut: () => Math.max(m, 0), bas: () => Math.min(m, 0), remplissage: COULEURS.cielDoux, contour: COULEURS.ciel },
  ];
  const memeHauteur = Math.abs(M - m) < 1e-9;
  return repereSvg({
    xMin,
    xMax,
    yMin,
    yMax,
    graduationsX: graduationsBornes(e.a, e.b),
    graduationsY: memeHauteur
      ? [{ y: M, etiquette: "M" }]
      : [
          { y: m, etiquette: "m" },
          { y: M, etiquette: "M" },
        ],
    regions,
    courbes: [{ fn: e.fn, de: xMin, a: xMax, couleur: COULEURS.encre, etiquette: "f", epaisseur: 2.2 }],
    libelle: `Courbe de f entre les rectangles de hauteurs m = ${e.m.texte} et M = ${e.M.texte} sur [${e.a.texte} ; ${e.b.texte}]`,
  });
}

// ============================================================================
// Tableau de variations (SVG autonome, jetons du thème avec repli imprimable).
// ============================================================================

const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';

function texteSvg(x: number, y: number, contenu: string, options: { italique?: boolean; taille?: number; ancre?: string; couleur?: string } = {}): string {
  const { italique = false, taille = 14, ancre = "middle", couleur = COULEURS.encre } = options;
  const sur = contenu.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${taille}" fill="${couleur}" text-anchor="${ancre}"${italique ? ' font-style="italic"' : ""} ${POLICE}>${sur}</text>`;
}

function ligneSvg(x1: number, y1: number, x2: number, y2: number, couleur: string = COULEURS.encre, epaisseur = 1): string {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${couleur}" stroke-width="${epaisseur}"/>`;
}

function flecheSvg(x1: number, y1: number, x2: number, y2: number): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const k = 7;
  const p1 = [x2 + k * Math.cos(angle + Math.PI - 0.45), y2 + k * Math.sin(angle + Math.PI - 0.45)];
  const p2 = [x2 + k * Math.cos(angle + Math.PI + 0.45), y2 + k * Math.sin(angle + Math.PI + 0.45)];
  return `${ligneSvg(x1, y1, x2, y2, COULEURS.encre, 1.2)}<polygon points="${x2.toFixed(1)},${y2.toFixed(1)} ${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}" fill="${COULEURS.encre}"/>`;
}

export function tableauVariationsSvg(e: ExerciceEncadrerIntegrale): string {
  const tab = e.tableau;
  if (!tab) return "";
  const n = tab.abscisses.length;
  const colLibelle = 62;
  const pas = n <= 3 ? 112 : 88;
  const largeur = colLibelle + 34 + pas * (n - 1) + 34;
  const h1 = 30;
  const h2 = 30;
  const h3 = 72;
  const hauteur = h1 + h2 + h3;
  const xNoeud = (i: number) => colLibelle + 34 + pas * i;
  const y1 = h1;
  const y2 = h1 + h2;
  const fond = "var(--surface, #ffffff)";
  let s = `<rect x="0.5" y="0.5" width="${largeur - 1}" height="${hauteur - 1}" fill="${fond}" stroke="${COULEURS.encre}" stroke-width="1"/>`;
  s += ligneSvg(0, y1, largeur, y1) + ligneSvg(0, y2, largeur, y2) + ligneSvg(colLibelle, 0, colLibelle, hauteur);
  s += texteSvg(colLibelle / 2, y1 / 2 + 5, "x", { italique: true });
  s += texteSvg(colLibelle / 2, y1 + h2 / 2 + 5, "f′(x)", { italique: true });
  s += texteSvg(colLibelle / 2, y2 + h3 / 2 + 5, "f(x)", { italique: true });
  tab.abscisses.forEach((a, i) => (s += texteSvg(xNoeud(i), y1 / 2 + 5, a.texte)));
  tab.zeros.forEach((z, i) => {
    if (z) s += texteSvg(xNoeud(i), y1 + h2 / 2 + 5, "0");
  });
  tab.signes.forEach((signe, i) => (s += texteSvg((xNoeud(i) + xNoeud(i + 1)) / 2, y1 + h2 / 2 + 5, signe, { taille: 15 })));
  const yHaut = y2 + 18;
  const yBas = y2 + h3 - 8;
  // En haut : borne d'où f descend / où elle arrive en montant, ou maximum local.
  const enHaut = tab.valeurs.map((_, i) => {
    const gauche = i > 0 ? tab.signes[i - 1] : null;
    const droite = i < n - 1 ? tab.signes[i] : null;
    return (gauche === null || gauche === "+") && (droite === null || droite === "−");
  });
  tab.valeurs.forEach((v, i) => (s += texteSvg(xNoeud(i), enHaut[i] ? yHaut : yBas, v.texte, { taille: 13 })));
  for (let i = 0; i < n - 1; i++) {
    const depart = { x: xNoeud(i) + 22, y: enHaut[i] ? yHaut + 6 : yBas - 15 };
    const arrivee = { x: xNoeud(i + 1) - 22, y: enHaut[i + 1] ? yHaut + 6 : yBas - 15 };
    s += flecheSvg(depart.x, depart.y, arrivee.x, arrivee.y);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largeur} ${hauteur}" width="${largeur}" height="${hauteur}" style="max-width:100%;height:auto" role="img" aria-label="Tableau de variations de f sur [${e.a.texte} ; ${e.b.texte}]">${s}</svg>`;
}

// ============================================================================
// Choix de la figure.
// ============================================================================

/** Figure affichée à l'écran pendant la phase donnée (`null` : aucune). */
export function figureEcranSvg(e: ExerciceEncadrerIntegrales, _phase: PhaseEncadrerIntegrales): string | null {
  // Décision de l'utilisateur : les courbes du signe et de la comparaison sont visibles dès le départ.
  switch (e.variante) {
    case "signe":
      return figureSigneSvg(e, true);
    case "comparer":
      return figureComparaisonSvg(e);
    case "encadrer":
    case "moyenne":
      return e.structure === "variations" ? tableauVariationsSvg(e) : figureCourbeEncadrementSvg(e);
  }
}

/** Figure de l'énoncé papier (`enteteHtml`) : la même que celle de l'écran au départ. */
export function figureEnoncePapier(e: ExerciceEncadrerIntegrales): string | null {
  if (e.variante === "signe") return figureSigneSvg(e, true);
  if (e.variante === "comparer") return figureComparaisonSvg(e);
  return e.structure === "variations" ? tableauVariationsSvg(e) : figureCourbeEncadrementSvg(e);
}

/** Figure du corrigé (`figureHtml`). */
export function figureCorrigeSvg(e: ExerciceEncadrerIntegrales): string {
  switch (e.variante) {
    case "signe":
      return figureSigneSvg(e);
    case "comparer":
      return figureComparaisonSvg(e);
    case "encadrer":
    case "moyenne":
      return figureRectanglesSvg(e);
  }
}
