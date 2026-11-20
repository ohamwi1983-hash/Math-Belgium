/**
 * Figure des générateurs 6gen158 / 6gen159 (6e ch. 1, lot G) : courbe sur un quadrillage dont les
 * lignes d'UN axe sont des multiples de π/4 (ou π/2) et celles de l'autre des entiers — les valeurs à
 * lire (bornes du domaine, de l'image, centre, points marqués) tombent sur des lignes, comme l'exige
 * la règle « graphique à lire ». MÊME échelle sur les deux axes (une unité = un carreau entier ; π/4 ≈
 * 0,785 unité). Chaîne SVG AUTONOME, la même à l'écran, sur papier (`enteteHtml`) et dans le corrigé
 * (`figureHtml`) ; identifiant du `clipPath` dérivé du contenu (jamais d'un compteur global).
 */

export interface AxeFigure {
  min: number;
  max: number;
  /** Lignes du quadrillage (valeurs) et leur étiquette (texte, « − » typographique ; vide = sans étiquette). */
  lignes: { v: number; label: string }[];
}

export interface PointMarque {
  x: number;
  y: number;
  /** Point plein (borne atteinte) ou cercle vide. */
  plein: boolean;
  label?: string;
}

export interface OptionsFigureCyclo {
  x: AxeFigure;
  y: AxeFigure;
  /** Morceaux de courbe : fonction et intervalle de tracé. */
  courbes: { f: (x: number) => number; de: number; a: number; couleur?: string }[];
  asymptotesY?: number[];
  asymptotesX?: number[];
  points?: PointMarque[];
  /** Pixels par unité. */
  echelle: number;
  police: number;
}

const MARGE_G = 40;
const MARGE = 18;
const GRILLE = "#d8dee6";
const AXE = "#495057";
const COURBE = "#1971c2";
const ASYMPTOTE = "#e8590c";
const POINT = "#2b2d42";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = 'stroke="#ffffff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"';
const f1 = (v: number) => v.toFixed(1);

function empreinte(t: string): string {
  let h = 5381;
  for (let i = 0; i < t.length; i++) h = ((h * 33) ^ t.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export function figureCycloSvg(o: OptionsFigureCyclo): string {
  const e = o.echelle;
  const p = o.police;
  const W = (o.x.max - o.x.min) * e;
  const H = (o.y.max - o.y.min) * e;
  const L = W + MARGE_G + MARGE;
  const HT = H + 2 * MARGE + p + 4;
  const sx = (x: number) => MARGE_G + (x - o.x.min) * e;
  const sy = (y: number) => MARGE + (o.y.max - y) * e;
  const id = `cy${empreinte(JSON.stringify([o.x, o.y, o.courbes.map((c) => [c.de, c.a, c.f(c.de + 0.37 * (c.a - c.de))]), o.asymptotesY ?? [], o.points ?? []]))}`;
  const s: string[] = [];
  s.push(`<defs><clipPath id="${id}"><rect x="${MARGE_G}" y="${MARGE}" width="${f1(W)}" height="${f1(H)}"/></clipPath></defs>`);
  s.push(`<rect x="0" y="0" width="${f1(L)}" height="${f1(HT)}" fill="#ffffff"/>`);
  for (const g of o.x.lignes) s.push(`<line x1="${f1(sx(g.v))}" y1="${MARGE}" x2="${f1(sx(g.v))}" y2="${f1(MARGE + H)}" stroke="${GRILLE}" stroke-width="${g.label ? 1.2 : 0.8}"/>`);
  for (const g of o.y.lignes) s.push(`<line x1="${MARGE_G}" y1="${f1(sy(g.v))}" x2="${f1(MARGE_G + W)}" y2="${f1(sy(g.v))}" stroke="${GRILLE}" stroke-width="${g.label ? 1.2 : 0.8}"/>`);
  if (o.y.min <= 0 && o.y.max >= 0) s.push(`<line x1="${MARGE_G}" y1="${f1(sy(0))}" x2="${f1(MARGE_G + W)}" y2="${f1(sy(0))}" stroke="${AXE}" stroke-width="1.4"/>`);
  if (o.x.min <= 0 && o.x.max >= 0) s.push(`<line x1="${f1(sx(0))}" y1="${MARGE}" x2="${f1(sx(0))}" y2="${f1(MARGE + H)}" stroke="${AXE}" stroke-width="1.4"/>`);
  for (const a of o.asymptotesY ?? []) s.push(`<line x1="${MARGE_G}" y1="${f1(sy(a))}" x2="${f1(MARGE_G + W)}" y2="${f1(sy(a))}" stroke="${ASYMPTOTE}" stroke-width="1.6" stroke-dasharray="6 4"/>`);
  for (const a of o.asymptotesX ?? []) s.push(`<line x1="${f1(sx(a))}" y1="${MARGE}" x2="${f1(sx(a))}" y2="${f1(MARGE + H)}" stroke="${ASYMPTOTE}" stroke-width="1.6" stroke-dasharray="6 4"/>`);
  for (const c of o.courbes) {
    const n = 500;
    const m: string[] = [];
    let debut = true;
    for (let i = 0; i <= n; i++) {
      const x = c.de + ((c.a - c.de) * i) / n;
      const y = c.f(x);
      if (!Number.isFinite(y) || y > o.y.max + 3 || y < o.y.min - 3) {
        debut = true;
        continue;
      }
      m.push(`${debut ? "M" : "L"} ${f1(sx(x))},${f1(sy(y))}`);
      debut = false;
    }
    s.push(`<path d="${m.join(" ")}" fill="none" stroke="${c.couleur ?? COURBE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#${id})"/>`);
  }
  // Étiquettes : x sous le cadre (ou sous l'axe), y à gauche du cadre.
  const yLab = MARGE + H + p + 2;
  for (const g of o.x.lignes) if (g.label) s.push(`<text x="${f1(sx(g.v))}" y="${f1(yLab)}" font-size="${p}" text-anchor="middle" fill="${AXE}" ${POLICE}>${g.label}</text>`);
  for (const g of o.y.lignes) if (g.label) s.push(`<text x="${MARGE_G - 4}" y="${f1(sy(g.v) + p / 2.8)}" font-size="${p}" text-anchor="end" fill="${AXE}" ${POLICE}>${g.label}</text>`);
  for (const pt of o.points ?? []) {
    s.push(`<circle cx="${f1(sx(pt.x))}" cy="${f1(sy(pt.y))}" r="${(p / 3.2).toFixed(1)}" fill="${pt.plein ? POINT : "#ffffff"}" stroke="${POINT}" stroke-width="1.4"/>`);
    if (pt.label) s.push(`<text x="${f1(sx(pt.x) + p * 0.5)}" y="${f1(sy(pt.y) - p * 0.55)}" font-size="${(p * 1.05).toFixed(1)}" font-weight="bold" fill="${POINT}" ${POLICE} ${HALO}>${pt.label}</text>`);
  }
  s.push(`<rect x="${MARGE_G}" y="${MARGE}" width="${f1(W)}" height="${f1(H)}" fill="none" stroke="#adb5bd" stroke-width="1"/>`);
  return `<svg class="graphe-cyclo" width="${f1(L)}" height="${f1(HT)}" viewBox="0 0 ${f1(L)} ${f1(HT)}" xmlns="http://www.w3.org/2000/svg">${s.join("")}</svg>`;
}

/** Lignes entières de min à max ; étiquette tous les `pas`. */
export function lignesEntieres(min: number, max: number, pas = 1): { v: number; label: string }[] {
  const r: { v: number; label: string }[] = [];
  for (let v = Math.ceil(min); v <= max; v++) r.push({ v, label: v % pas === 0 ? (v < 0 ? `−${-v}` : String(v)) : "" });
  return r;
}

/** Multiple de π/d en texte (« π/4 », « −3π/4 », « π », « 0 »). */
export function piTexte(num: number, den: number): string {
  if (num === 0) return "0";
  let n = num;
  let d = den;
  const g = (a: number, b: number): number => (b ? g(b, a % b) : Math.abs(a));
  const k = g(n, d);
  n /= k;
  d /= k;
  const corps = `${Math.abs(n) === 1 ? "" : Math.abs(n)}π${d === 1 ? "" : `/${d}`}`;
  return n < 0 ? `−${corps}` : corps;
}

/** Lignes en multiples de π/d de min à max ; étiquette tous les `pasEtiquette` crans. */
export function lignesPi(min: number, max: number, d = 4, pasEtiquette = 1): { v: number; label: string }[] {
  const r: { v: number; label: string }[] = [];
  const kMin = Math.ceil((min * d) / Math.PI - 1e-9);
  const kMax = Math.floor((max * d) / Math.PI + 1e-9);
  for (let k = kMin; k <= kMax; k++) r.push({ v: (k * Math.PI) / d, label: k % pasEtiquette === 0 ? piTexte(k, d) : "" });
  return r;
}
