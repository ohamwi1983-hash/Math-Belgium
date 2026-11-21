/**
 * Figures des générateurs du lot G du 5e ch. 4 (5gen65 « retrouver une fonction », 5gen66 « du
 * tableau de limites au graphique ») : repère à MÊME échelle en x et en y, quadrillage d'une unité,
 * graduations entières (de 2 en 2 si les carreaux sont petits), axes fléchés, asymptotes en
 * pointillés, branches de courbe coupées aux asymptotes verticales et rognées par le SVG lui-même
 * (`<svg>` imbriqué : aucun identifiant, aucun `clipPath`). Chaîne SVG autonome, la même à l'écran,
 * sur papier (`enteteHtml`) et dans le corrigé (`figureHtml`). Toute valeur à LIRE (asymptote,
 * point) est entière : elle tombe sur une ligne du quadrillage.
 */

export interface Branche {
  f: (x: number) => number;
  /** Intervalle ouvert de la branche (bornes infinies permises). */
  de: number;
  a: number;
}

export interface SpecGraphe {
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  branches: Branche[];
  av?: number[];
  ah?: number[];
  ao?: { m: number; q: number }[];
  points?: { x: number; y: number; label?: string; creux?: boolean }[];
  carreau: number;
  police: number;
  /** Équations écrites le long des asymptotes (corrigé). */
  etiquettes?: boolean;
  /** Lettre écrite en haut à gauche (graphiques candidats A–D). */
  lettre?: string;
  /** Asymptotes en couleur (corrigé) plutôt qu'en gris. */
  couleur?: boolean;
}

const GRILLE = "#d8dee6";
const AXE = "#495057";
const COURBE = "#1971c2";
const ASYMP = "#868e96";
const ASYMP_C = "#e8590c";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = 'stroke="#ffffff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"';
const f1 = (v: number) => v.toFixed(1);
const nombre = (v: number) => (v < 0 ? `−${Math.abs(v)}` : String(v));

/** « y = x + 1 », « y = −2x », « y = 3 » (texte de figure, « − » typographique). */
export function equationDroiteT(m: number, q: number): string {
  const mx = m === 0 ? "" : m === 1 ? "x" : m === -1 ? "−x" : `${nombre(m)}x`;
  if (mx === "") return `y = ${nombre(q)}`;
  return q === 0 ? `y = ${mx}` : `y = ${mx} ${q > 0 ? "+" : "−"} ${Math.abs(q)}`;
}

const MARGE = 12;

/** Contenu SVG (sans balise racine) et dimensions. */
function contenu(s: SpecGraphe): { corps: string; L: number; H: number } {
  const c = s.carreau;
  const p = s.police;
  const L = (s.xmax - s.xmin) * c + 2 * MARGE;
  const H = (s.ymax - s.ymin) * c + 2 * MARGE;
  const sx = (x: number) => MARGE + (x - s.xmin) * c;
  const sy = (y: number) => MARGE + (s.ymax - y) * c;
  const o: string[] = [`<rect x="0" y="0" width="${L}" height="${H}" fill="#ffffff"/>`];
  for (let k = Math.ceil(s.xmin); k <= s.xmax; k++) o.push(`<line x1="${f1(sx(k))}" y1="${MARGE}" x2="${f1(sx(k))}" y2="${H - MARGE}" stroke="${GRILLE}" stroke-width="1"/>`);
  for (let k = Math.ceil(s.ymin); k <= s.ymax; k++) o.push(`<line x1="${MARGE}" y1="${f1(sy(k))}" x2="${L - MARGE}" y2="${f1(sy(k))}" stroke="${GRILLE}" stroke-width="1"/>`);
  const x0 = Math.min(Math.max(0, s.xmin), s.xmax);
  const y0 = Math.min(Math.max(0, s.ymin), s.ymax);
  o.push(`<line x1="${MARGE}" y1="${f1(sy(y0))}" x2="${L - MARGE + 4}" y2="${f1(sy(y0))}" stroke="${AXE}" stroke-width="1.4"/>`);
  o.push(`<line x1="${f1(sx(x0))}" y1="${H - MARGE}" x2="${f1(sx(x0))}" y2="${MARGE - 4}" stroke="${AXE}" stroke-width="1.4"/>`);
  o.push(`<path d="M ${L - MARGE + 8},${f1(sy(y0))} l -7,-4 l 0,8 z" fill="${AXE}"/>`);
  o.push(`<path d="M ${f1(sx(x0))},${MARGE - 8} l -4,7 l 8,0 z" fill="${AXE}"/>`);
  o.push(`<text x="${L - MARGE - 2}" y="${f1(sy(y0) - 5)}" font-size="${p}" font-style="italic" text-anchor="end" fill="${AXE}" font-family="Times New Roman, serif" ${HALO}>x</text>`);
  o.push(`<text x="${f1(sx(x0) + 6)}" y="${MARGE + p * 0.7}" font-size="${p}" font-style="italic" fill="${AXE}" font-family="Times New Roman, serif" ${HALO}>y</text>`);
  const pas = c >= 1.8 * p ? 1 : 2;
  for (let k = Math.ceil(s.xmin) + 1; k < s.xmax; k++) if (k !== 0 && k % pas === 0) o.push(`<text x="${f1(sx(k))}" y="${f1(sy(y0) + p + 2)}" font-size="${p}" text-anchor="middle" fill="${AXE}" ${POLICE} ${HALO}>${nombre(k)}</text>`);
  for (let k = Math.ceil(s.ymin) + 1; k < s.ymax; k++) if (k !== 0 && k % pas === 0) o.push(`<text x="${f1(sx(x0) - 3)}" y="${f1(sy(k) + p / 2.8)}" font-size="${p}" text-anchor="end" fill="${AXE}" ${POLICE} ${HALO}>${nombre(k)}</text>`);
  if (s.xmin < 0 && s.ymin < 0) o.push(`<text x="${f1(sx(0) - 3)}" y="${f1(sy(0) + p + 2)}" font-size="${p}" text-anchor="end" fill="${AXE}" ${POLICE} ${HALO}>0</text>`);
  // Zone de tracé rognée (svg imbriqué) : asymptotes puis courbe.
  const W = (s.xmax - s.xmin) * c;
  const Hh = (s.ymax - s.ymin) * c;
  const tx = (x: number) => (x - s.xmin) * c;
  const ty = (y: number) => (s.ymax - y) * c;
  const z: string[] = [];
  const coulA = s.couleur ? ASYMP_C : ASYMP;
  const dash = `stroke="${coulA}" stroke-width="1.8" stroke-dasharray="6 4" fill="none"`;
  for (const a of s.av ?? []) z.push(`<line x1="${f1(tx(a))}" y1="0" x2="${f1(tx(a))}" y2="${Hh}" ${dash}/>`);
  for (const a of s.ah ?? []) z.push(`<line x1="0" y1="${f1(ty(a))}" x2="${W}" y2="${f1(ty(a))}" ${dash}/>`);
  for (const d of s.ao ?? []) z.push(`<line x1="0" y1="${f1(ty(d.m * s.xmin + d.q))}" x2="${W}" y2="${f1(ty(d.m * s.xmax + d.q))}" ${dash}/>`);
  const ymarge = 3;
  for (const b of s.branches) {
    const debut = Math.max(b.de, s.xmin - 0.5);
    const fin = Math.min(b.a, s.xmax + 0.5);
    if (fin <= debut) continue;
    const n = Math.ceil((fin - debut) * 60);
    // Branche continue sur son intervalle : ordonnées bornées juste hors du cadre (la partie
    // bornée est rognée par le SVG imbriqué), jamais de saut.
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      let x = debut + ((fin - debut) * i) / n;
      if (i === 0 && Number.isFinite(b.de) && b.de >= s.xmin - 0.5) x = b.de + 1e-4;
      if (i === n && Number.isFinite(b.a) && b.a <= s.xmax + 0.5) x = b.a - 1e-4;
      const y = b.f(x);
      if (Number.isNaN(y)) continue;
      const yc = Math.min(s.ymax + ymarge, Math.max(s.ymin - ymarge, y));
      pts.push(`${pts.length ? "L" : "M"} ${f1(tx(x))},${f1(ty(yc))}`);
    }
    const chemin = pts.join(" ");
    if (chemin) z.push(`<path d="${chemin.trim()}" fill="none" stroke="${COURBE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`);
  }
  o.push(`<svg x="${MARGE}" y="${MARGE}" width="${W}" height="${Hh}" viewBox="0 0 ${W} ${Hh}" overflow="hidden">${z.join("")}</svg>`);
  if (s.etiquettes) {
    const lab = (x: number, y: number, t: string, ancre = "start") => o.push(`<text x="${f1(x)}" y="${f1(y)}" font-size="${p}" font-weight="bold" text-anchor="${ancre}" fill="${coulA}" ${POLICE} ${HALO}>${t}</text>`);
    for (const a of s.av ?? []) lab(sx(a) + 4, MARGE + p * 1.2, `x = ${nombre(a)}`);
    for (const a of s.ah ?? []) lab(L - MARGE - 4, sy(a) - 4, `y = ${nombre(a)}`, "end");
    for (const d of s.ao ?? []) {
      const xe = s.xmin + 0.6;
      const ye = d.m * xe + d.q;
      const xl = ye > s.ymax - 1 || ye < s.ymin + 1 ? (d.m > 0 ? s.xmax - 0.6 : s.xmin + 0.6) : xe;
      const yl = d.m * xl + d.q;
      lab(sx(xl), sy(yl) + (d.m > 0 ? -6 : p + 4), equationDroiteT(d.m, d.q), xl > (s.xmin + s.xmax) / 2 ? "end" : "start");
    }
  }
  for (const pt of s.points ?? []) {
    o.push(`<circle cx="${f1(sx(pt.x))}" cy="${f1(sy(pt.y))}" r="3.6" fill="${pt.creux ? "#ffffff" : COURBE}" stroke="${COURBE}" stroke-width="2"/>`);
    if (pt.label) o.push(`<text x="${f1(sx(pt.x) + 6)}" y="${f1(sy(pt.y) - 6)}" font-size="${(p * 1.1).toFixed(1)}" font-weight="bold" fill="${COURBE}" ${POLICE} ${HALO}>${pt.label}</text>`);
  }
  if (s.lettre) o.push(`<text x="${MARGE + 4}" y="${MARGE + p * 1.45}" font-size="${(p * 1.5).toFixed(1)}" font-weight="bold" fill="#212529" ${POLICE} ${HALO}>${s.lettre}</text>`);
  o.push(`<rect x="0.5" y="0.5" width="${L - 1}" height="${H - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`);
  return { corps: o.join(""), L, H };
}

export function grapheSvg(s: SpecGraphe): string {
  const { corps, L, H } = contenu(s);
  return `<svg class="graphe-limites" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}" xmlns="http://www.w3.org/2000/svg">${corps}</svg>`;
}

/** Plusieurs graphes de même taille en grille (2 colonnes), dans UN SVG (graphiques candidats). */
export function grilleGraphesSvg(specs: SpecGraphe[], colonnes = 2, ecart = 12): string {
  const parts = specs.map(contenu);
  const L = parts[0]!.L;
  const H = parts[0]!.H;
  const lignes = Math.ceil(parts.length / colonnes);
  const LT = colonnes * L + (colonnes - 1) * ecart;
  const HT = lignes * H + (lignes - 1) * ecart;
  const corps = parts.map((p, i) => `<svg x="${(i % colonnes) * (L + ecart)}" y="${Math.floor(i / colonnes) * (H + ecart)}" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}">${p.corps}</svg>`).join("");
  return `<svg class="graphes-limites" width="${LT}" height="${HT}" viewBox="0 0 ${LT} ${HT}" xmlns="http://www.w3.org/2000/svg">${corps}</svg>`;
}
