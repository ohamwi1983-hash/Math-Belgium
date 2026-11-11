/**
 * Repère SVG minimal commun aux figures de 6gen26 (aires), 6gen27 (volumes) et 6gen28 (longueur
 * d'arc) — audit du chapitre 4 de 6e, point 23. Produit une chaîne SVG AUTONOME :
 * - à l'écran, injectée telle quelle (`dangerouslySetInnerHTML`) : les couleurs passent par les
 *   jetons du thème (`var(--ink)`, `var(--accent)`…), donc clair/sombre suivent la page ;
 * - sur papier (phase 2, `EtapeCorrection.figureHtml`), hors de la page : chaque `var(--x, #…)` a une
 *   valeur de repli littérale, adaptée à l'impression.
 * Axes fléchés, fenêtre fixée par l'appelant (jamais recalculée par le navigateur), largeur 100 %
 * plafonnée (lisible à 390 px).
 */

export const COULEURS = {
  encre: "var(--ink, #1b1d22)",
  doux: "var(--ink-soft, #5c6370)",
  pale: "var(--ink-faint, #9aa3ad)",
  accent: "var(--accent, #b65c1f)",
  accentDoux: "var(--accent-soft, #f4e3d1)",
  bon: "var(--good, #2f7a4f)",
  bonDoux: "var(--good-soft, #dcefe2)",
  mauvais: "var(--bad, #b23a3a)",
  mauvaisDoux: "var(--bad-soft, #f6dede)",
  ciel: "var(--sky, #2f6fb0)",
  cielDoux: "var(--sky-soft, #dde9f5)",
};

export interface CourbeRepere {
  fn: (x: number) => number;
  de: number;
  a: number;
  couleur: string;
  epaisseur?: number;
  pointilles?: boolean;
  etiquette?: string;
}

export interface RegionRepere {
  de: number;
  a: number;
  haut: (x: number) => number;
  bas: (x: number) => number;
  remplissage: string;
  contour?: string;
}

export interface PointRepere {
  x: number;
  y: number;
  etiquette?: string;
  couleur?: string;
  position?: "dessus" | "dessous" | "gauche" | "droite";
}

export interface SegmentRepere {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  couleur: string;
  pointilles?: boolean;
  epaisseur?: number;
}

export interface EllipseRepere {
  cx: number;
  /** Demi-axe vertical, en unités du repère (le rayon du disque). */
  ry: number;
  /** Demi-axe horizontal, en pixels (effet de perspective). */
  rxPixels: number;
  couleur: string;
  remplissage?: string;
  /** Seulement la moitié avant (trait plein) ; la moitié arrière en pointillés. */
  moitieArrierePointillee?: boolean;
}

export interface OptionsRepere {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  graduationsX?: { x: number; etiquette: string }[];
  graduationsY?: { y: number; etiquette: string }[];
  courbes?: CourbeRepere[];
  regions?: RegionRepere[];
  points?: PointRepere[];
  segments?: SegmentRepere[];
  ellipses?: EllipseRepere[];
  libelle: string;
  largeur?: number;
  hauteur?: number;
}

const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';

function f1(v: number): string {
  return Number.isFinite(v) ? v.toFixed(1) : "0";
}

/** Texte « mathématique » : les signes moins deviennent « − ». */
function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/-/g, "−");
}

let compteurFigures = 0;

const HALO = `stroke="var(--surface, #ffffff)" stroke-width="3" stroke-linejoin="round" paint-order="stroke"`;

export function repereSvg(o: OptionsRepere): string {
  // Identifiants uniques par figure : plusieurs figures dans un même document (corrigé papier) ne
  // doivent jamais partager un `clipPath`/`marker` de géométrie différente.
  const id = `ri${++compteurFigures}`;
  const L = o.largeur ?? 340;
  const H = o.hauteur ?? 230;
  const marge = { g: 26, d: 18, h: 16, b: 24 };
  const sx = (x: number) => marge.g + ((x - o.xMin) / (o.xMax - o.xMin)) * (L - marge.g - marge.d);
  const sy = (y: number) => H - marge.b - ((y - o.yMin) / (o.yMax - o.yMin)) * (H - marge.h - marge.b);
  const borneY = (y: number) => Math.max(o.yMin - (o.yMax - o.yMin), Math.min(o.yMax + (o.yMax - o.yMin), y));
  const morceaux: string[] = [];

  morceaux.push(
    `<defs><marker id="${id}fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COULEURS.doux}"/></marker>` +
      `<clipPath id="${id}cadre"><rect x="${marge.g - 4}" y="${marge.h - 4}" width="${L - marge.g - marge.d + 8}" height="${H - marge.h - marge.b + 8}"/></clipPath></defs>`,
  );

  // Régions hachurées (remplissage doux), sous les courbes.
  for (const r of o.regions ?? []) {
    const n = 80;
    const haut: string[] = [];
    const bas: string[] = [];
    for (let i = 0; i <= n; i++) {
      const x = r.de + ((r.a - r.de) * i) / n;
      haut.push(`${f1(sx(x))},${f1(sy(borneY(r.haut(x))))}`);
      bas.push(`${f1(sx(x))},${f1(sy(borneY(r.bas(x))))}`);
    }
    morceaux.push(
      `<polygon clip-path="url(#${id}cadre)" points="${[...haut, ...bas.reverse()].join(" ")}" fill="${r.remplissage}" stroke="${r.contour ?? "none"}" stroke-width="0.8" fill-opacity="0.85"/>`,
    );
  }

  // Axes fléchés : l'axe vertical en x = 0 s'il est dans la fenêtre, sinon au bord le plus proche de
  // 0 (bord droit quand toute la fenêtre est à gauche de 0 : 6gen26 A, f(x) = a/x sur [−5 ; −2]) ;
  // idem pour l'axe horizontal.
  const xAxeY = o.xMin <= 0 && o.xMax >= 0 ? 0 : o.xMax < 0 ? o.xMax : o.xMin;
  const yAxeX = o.yMin <= 0 && o.yMax >= 0 ? 0 : o.yMax < 0 ? o.yMax : o.yMin;
  morceaux.push(
    `<line x1="${f1(sx(o.xMin))}" y1="${f1(sy(yAxeX))}" x2="${f1(sx(o.xMax) + 10)}" y2="${f1(sy(yAxeX))}" stroke="${COULEURS.doux}" stroke-width="1.1" marker-end="url(#${id}fl)"/>`,
    `<line x1="${f1(sx(xAxeY))}" y1="${f1(sy(o.yMin))}" x2="${f1(sx(xAxeY))}" y2="${f1(sy(o.yMax) - 10)}" stroke="${COULEURS.doux}" stroke-width="1.1" marker-end="url(#${id}fl)"/>`,
    `<text x="${f1(sx(o.xMax) + 6)}" y="${f1(sy(yAxeX) + 15)}" font-size="12" font-style="italic" fill="${COULEURS.doux}" ${POLICE}>x</text>`,
    `<text x="${f1(sx(xAxeY) + 5)}" y="${f1(sy(o.yMax) - 2)}" font-size="12" font-style="italic" fill="${COULEURS.doux}" ${POLICE}>y</text>`,
  );
  // Les nombres des graduations sont posés en DERNIER, avec un liseré de la couleur du fond : une
  // courbe ou une ellipse qui passe juste sous l'axe (6gen26 D avec g ≈ 0, ellipses de 6gen27) ne
  // doit pas les rendre illisibles.
  const etiquettesGraduations: string[] = [];
  for (const g of o.graduationsX ?? []) {
    morceaux.push(
      `<line x1="${f1(sx(g.x))}" y1="${f1(sy(yAxeX) - 3)}" x2="${f1(sx(g.x))}" y2="${f1(sy(yAxeX) + 3)}" stroke="${COULEURS.doux}" stroke-width="1"/>`,
    );
    etiquettesGraduations.push(
      `<text x="${f1(sx(g.x))}" y="${f1(sy(yAxeX) + 15)}" font-size="11" text-anchor="middle" fill="${COULEURS.doux}" ${HALO} ${POLICE}>${echapper(g.etiquette)}</text>`,
    );
  }
  for (const g of o.graduationsY ?? []) {
    morceaux.push(
      `<line x1="${f1(sx(xAxeY) - 3)}" y1="${f1(sy(g.y))}" x2="${f1(sx(xAxeY) + 3)}" y2="${f1(sy(g.y))}" stroke="${COULEURS.doux}" stroke-width="1"/>`,
    );
    etiquettesGraduations.push(
      `<text x="${f1(sx(xAxeY) - 6)}" y="${f1(sy(g.y) + 4)}" font-size="11" text-anchor="end" fill="${COULEURS.doux}" ${HALO} ${POLICE}>${echapper(g.etiquette)}</text>`,
    );
  }

  // Ellipses (tranches de solides de révolution) : centre sur l'axe des abscisses.
  for (const e of o.ellipses ?? []) {
    const cx = sx(e.cx);
    const cy = sy(0);
    const ryPx = Math.abs(sy(e.ry) - sy(0));
    const rx = e.rxPixels;
    if (e.moitieArrierePointillee) {
      morceaux.push(
        `<path d="M${f1(cx)},${f1(cy - ryPx)} A${f1(rx)},${f1(ryPx)} 0 0 0 ${f1(cx)},${f1(cy + ryPx)}" fill="none" stroke="${e.couleur}" stroke-width="1" stroke-dasharray="3 3"/>`,
        `<path d="M${f1(cx)},${f1(cy - ryPx)} A${f1(rx)},${f1(ryPx)} 0 0 1 ${f1(cx)},${f1(cy + ryPx)}" fill="none" stroke="${e.couleur}" stroke-width="1.3"/>`,
      );
    } else {
      morceaux.push(
        `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ryPx)}" fill="${e.remplissage ?? "none"}" fill-opacity="0.55" stroke="${e.couleur}" stroke-width="1.3"/>`,
      );
    }
  }

  for (const s of o.segments ?? []) {
    morceaux.push(
      `<line x1="${f1(sx(s.x1))}" y1="${f1(sy(s.y1))}" x2="${f1(sx(s.x2))}" y2="${f1(sy(s.y2))}" stroke="${s.couleur}" stroke-width="${s.epaisseur ?? 1.2}"${s.pointilles ? ' stroke-dasharray="4 3"' : ""}/>`,
    );
  }

  // Étiquettes des courbes déjà posées : deux courbes qui finissent au même endroit (6gen27 C, f et g
  // proches) ne doivent pas superposer leurs noms.
  const etiquettesPosees: { x: number; y: number }[] = [];
  for (const c of o.courbes ?? []) {
    const n = 160;
    const pts: string[] = [];
    let derniere: { x: number; y: number } | null = null;
    for (let i = 0; i <= n; i++) {
      const x = c.de + ((c.a - c.de) * i) / n;
      const y = c.fn(x);
      if (!Number.isFinite(y)) continue;
      pts.push(`${pts.length === 0 ? "M" : "L"}${f1(sx(x))},${f1(sy(borneY(y)))}`);
      derniere = { x, y };
    }
    morceaux.push(
      `<path clip-path="url(#${id}cadre)" d="${pts.join(" ")}" fill="none" stroke="${c.couleur}" stroke-width="${c.epaisseur ?? 2}"${c.pointilles ? ' stroke-dasharray="5 4"' : ""} stroke-linejoin="round"/>`,
    );
    if (c.etiquette && derniere) {
      const yEt = Math.max(o.yMin, Math.min(o.yMax, derniere.y));
      const xPx = sx(derniere.x) - 4;
      let yPx = sy(yEt) - 6;
      while (etiquettesPosees.some((e) => Math.abs(e.x - xPx) < 16 && Math.abs(e.y - yPx) < 13)) yPx += 14;
      etiquettesPosees.push({ x: xPx, y: yPx });
      morceaux.push(
        `<text x="${f1(xPx)}" y="${f1(yPx)}" font-size="12" font-style="italic" text-anchor="end" fill="${c.couleur}" ${POLICE}>${echapper(c.etiquette)}</text>`,
      );
    }
  }

  for (const p of o.points ?? []) {
    const couleur = p.couleur ?? COULEURS.encre;
    const px = sx(p.x);
    const py = sy(p.y);
    morceaux.push(`<circle cx="${f1(px)}" cy="${f1(py)}" r="3.2" fill="${couleur}"/>`);
    if (p.etiquette) {
      const pos = p.position ?? "dessus";
      const dx = pos === "gauche" ? -6 : pos === "droite" ? 6 : 0;
      const dy = pos === "dessous" ? 15 : pos === "dessus" ? -7 : 4;
      const ancre = pos === "gauche" ? "end" : pos === "droite" ? "start" : "middle";
      morceaux.push(
        `<text x="${f1(px + dx)}" y="${f1(py + dy)}" font-size="11" text-anchor="${ancre}" fill="${couleur}" ${POLICE}>${echapper(p.etiquette)}</text>`,
      );
    }
  }

  morceaux.push(...etiquettesGraduations);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" width="${L}" height="${H}" style="max-width:100%;height:auto" role="img" aria-label="${echapper(o.libelle)}">${morceaux.join("")}</svg>`;
}

/** Fenêtre verticale « propre » contenant les valeurs échantillonnées de `fns` sur [de ; a], avec
 * l'axe des abscisses toujours visible et une petite marge. */
export function fenetreY(fns: ((x: number) => number)[], de: number, a: number, inclureZero = true): { yMin: number; yMax: number } {
  let min = inclureZero ? 0 : Infinity;
  let max = inclureZero ? 0 : -Infinity;
  for (const fn of fns) {
    for (let i = 0; i <= 120; i++) {
      const y = fn(de + ((a - de) * i) / 120);
      if (!Number.isFinite(y)) continue;
      min = Math.min(min, y);
      max = Math.max(max, y);
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { yMin: -1, yMax: 1 };
  const ecart = Math.max(max - min, 1);
  return { yMin: min - 0.12 * ecart, yMax: max + 0.15 * ecart };
}

/** Étiquette d'un nombre pour une graduation (entier, ou décimal court avec virgule). */
export function etiquetteNombre(v: number): string {
  const r = Math.round(v * 100) / 100;
  return r.toString().replace(".", ",");
}
