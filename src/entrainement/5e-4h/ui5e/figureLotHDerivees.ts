/**
 * Figures des générateurs du lot H du 5e ch. 5 (5gen73 « lire f(a) et f′(a) sur un graphique »,
 * 5gen74 « du graphique de f′ aux variations de f », 5gen75 « dérivable ou non en a ? ») : repère
 * quadrillé dont chaque carreau vaut `sx` en x et `sy` en y (échelles DIFFÉRENTES permises : piège
 * « pente comptée en carreaux » de 5gen73), graduations aux lignes du quadrillage (tous les carreaux,
 * ou tous les deux carreaux si les carreaux sont petits), axes fléchés, courbes et droites rognées
 * par un `<svg>` imbriqué (`overflow="hidden"`, AUCUN identifiant ni `clipPath`). Chaîne SVG
 * autonome, la même à l'écran, sur papier (`enteteHtml`) et dans le corrigé (`figureHtml`). Toute
 * valeur à LIRE tombe sur un nœud du quadrillage (le générateur le garantit).
 */

export interface CourbeRepere {
  f: (x: number) => number;
  /** Intervalle de tracé (bornes réelles ; infini permis). */
  de?: number;
  a?: number;
  couleur?: string;
  epaisseur?: number;
  pointilles?: boolean;
}

export interface PointRepere {
  x: number;
  y: number;
  label?: string;
  couleur?: string;
  creux?: boolean;
  /** Position de l'étiquette (défaut : au-dessus à droite). */
  position?: "ne" | "no" | "se" | "so";
}

export interface SpecRepere {
  /** Fenêtre en unités réelles : bornes multiples de sx / sy. */
  xmin: number;
  xmax: number;
  ymin: number;
  ymax: number;
  /** Valeur d'un carreau en x et en y. */
  sx: number;
  sy: number;
  carreau: number;
  police: number;
  courbes: CourbeRepere[];
  points?: PointRepere[];
  /** Segments (corrigé : Δx, Δy, petites tangentes), rognés comme les courbes. */
  segments?: { x1: number; y1: number; x2: number; y2: number; couleur?: string; pointilles?: boolean; epaisseur?: number }[];
  /** Textes libres (nom d'une droite, Δx…). */
  textes?: { x: number; y: number; texte: string; couleur?: string; ancre?: "start" | "middle" | "end" }[];
  /** Droites verticales en pointillés (corrigé : abscisses lues). */
  verticales?: { x: number; couleur?: string }[];
  /** Nom écrit en haut à gauche (« C_f », « y = f′(x) », lettre d'un graphique candidat). */
  titre?: string;
  /** Titre en gros caractères (lettre d'un graphique candidat). */
  titreGrand?: boolean;
  /** Nom de l'axe vertical (défaut « y »). */
  nomY?: string;
}

export const COULEUR_COURBE = "#1971c2";
export const COULEUR_TANGENTE = "#c2410c";
export const COULEUR_REPERE = "#2f9e44";
const GRILLE = "#d8dee6";
const AXE = "#495057";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = 'stroke="#ffffff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"';
const f1 = (v: number) => v.toFixed(1);
const MARGE = 14;

/** Nombre écrit sur la figure : virgule décimale, « − » typographique. */
export function nombreFigure(v: number): string {
  const r = Math.round(v * 1000) / 1000;
  const s = String(Math.abs(r)).replace(".", ",");
  return r < 0 ? `−${s}` : s;
}

function contenu(s: SpecRepere): { corps: string; L: number; H: number } {
  const c = s.carreau;
  const p = s.police;
  const nx = Math.round((s.xmax - s.xmin) / s.sx);
  const ny = Math.round((s.ymax - s.ymin) / s.sy);
  const W = nx * c;
  const Hh = ny * c;
  const L = W + 2 * MARGE;
  const H = Hh + 2 * MARGE;
  const sxp = (x: number) => MARGE + ((x - s.xmin) / s.sx) * c;
  const syp = (y: number) => MARGE + ((s.ymax - y) / s.sy) * c;
  const o: string[] = [`<rect x="0" y="0" width="${L}" height="${H}" fill="#ffffff"/>`];
  for (let k = 0; k <= nx; k++) o.push(`<line x1="${f1(MARGE + k * c)}" y1="${MARGE}" x2="${f1(MARGE + k * c)}" y2="${H - MARGE}" stroke="${GRILLE}" stroke-width="1"/>`);
  for (let k = 0; k <= ny; k++) o.push(`<line x1="${MARGE}" y1="${f1(MARGE + k * c)}" x2="${L - MARGE}" y2="${f1(MARGE + k * c)}" stroke="${GRILLE}" stroke-width="1"/>`);
  const x0 = Math.min(Math.max(0, s.xmin), s.xmax);
  const y0 = Math.min(Math.max(0, s.ymin), s.ymax);
  o.push(`<line x1="${MARGE}" y1="${f1(syp(y0))}" x2="${L - MARGE + 6}" y2="${f1(syp(y0))}" stroke="${AXE}" stroke-width="1.4"/>`);
  o.push(`<line x1="${f1(sxp(x0))}" y1="${H - MARGE}" x2="${f1(sxp(x0))}" y2="${MARGE - 6}" stroke="${AXE}" stroke-width="1.4"/>`);
  o.push(`<path d="M ${L - MARGE + 10},${f1(syp(y0))} l -7,-4 l 0,8 z" fill="${AXE}"/>`);
  o.push(`<path d="M ${f1(sxp(x0))},${MARGE - 10} l -4,7 l 8,0 z" fill="${AXE}"/>`);
  o.push(`<text x="${L - MARGE - 2}" y="${f1(syp(y0) - 5)}" font-size="${p}" font-style="italic" text-anchor="end" fill="${AXE}" font-family="Times New Roman, serif" ${HALO}>x</text>`);
  o.push(`<text x="${f1(sxp(x0) + 6)}" y="${MARGE + p * 0.7}" font-size="${p}" font-style="italic" fill="${AXE}" font-family="Times New Roman, serif" ${HALO}>${s.nomY ?? "y"}</text>`);
  const pas = c >= 1.8 * p ? 1 : 2;
  for (let k = 1; k < nx; k++) {
    const x = s.xmin + k * s.sx;
    if (Math.abs(x) < 1e-9 || Math.round((x - 0) / s.sx) % pas !== 0) continue;
    o.push(`<text x="${f1(sxp(x))}" y="${f1(syp(y0) + p + 2)}" font-size="${p}" text-anchor="middle" fill="${AXE}" ${POLICE} ${HALO}>${nombreFigure(x)}</text>`);
  }
  for (let k = 1; k < ny; k++) {
    const y = s.ymin + k * s.sy;
    if (Math.abs(y) < 1e-9 || Math.round(y / s.sy) % pas !== 0) continue;
    o.push(`<text x="${f1(sxp(x0) - 3)}" y="${f1(syp(y) + p / 2.8)}" font-size="${p}" text-anchor="end" fill="${AXE}" ${POLICE} ${HALO}>${nombreFigure(y)}</text>`);
  }
  if (s.xmin < 0 && s.ymin < 0) o.push(`<text x="${f1(sxp(0) - 3)}" y="${f1(syp(0) + p + 2)}" font-size="${p}" text-anchor="end" fill="${AXE}" ${POLICE} ${HALO}>0</text>`);
  // Zone de tracé rognée : verticales, puis courbes.
  const tx = (x: number) => ((x - s.xmin) / s.sx) * c;
  const ty = (y: number) => ((s.ymax - y) / s.sy) * c;
  const z: string[] = [];
  for (const v of s.verticales ?? []) z.push(`<line x1="${f1(tx(v.x))}" y1="0" x2="${f1(tx(v.x))}" y2="${Hh}" stroke="${v.couleur ?? COULEUR_REPERE}" stroke-width="1.6" stroke-dasharray="5 4"/>`);
  const yMarge = 3 * s.sy;
  for (const cb of s.courbes) {
    const debut = Math.max(cb.de ?? -Infinity, s.xmin - 0.5 * s.sx);
    const fin = Math.min(cb.a ?? Infinity, s.xmax + 0.5 * s.sx);
    if (fin <= debut) continue;
    const n = Math.max(2, Math.ceil(((fin - debut) / s.sx) * 40));
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const x = debut + ((fin - debut) * i) / n;
      const y = cb.f(x);
      if (!Number.isFinite(y)) continue;
      const yc = Math.min(s.ymax + yMarge, Math.max(s.ymin - yMarge, y));
      pts.push(`${pts.length ? "L" : "M"} ${f1(tx(x))},${f1(ty(yc))}`);
    }
    if (pts.length > 1) {
      const tiret = cb.pointilles ? ' stroke-dasharray="7 5"' : "";
      z.push(`<path d="${pts.join(" ")}" fill="none" stroke="${cb.couleur ?? COULEUR_COURBE}" stroke-width="${cb.epaisseur ?? 2.4}" stroke-linecap="round" stroke-linejoin="round"${tiret}/>`);
    }
  }
  for (const sg of s.segments ?? []) {
    const tiret = sg.pointilles ? ' stroke-dasharray="5 4"' : "";
    z.push(`<line x1="${f1(tx(sg.x1))}" y1="${f1(ty(sg.y1))}" x2="${f1(tx(sg.x2))}" y2="${f1(ty(sg.y2))}" stroke="${sg.couleur ?? COULEUR_REPERE}" stroke-width="${sg.epaisseur ?? 2}" stroke-linecap="round"${tiret}/>`);
  }
  o.push(`<svg x="${MARGE}" y="${MARGE}" width="${W}" height="${Hh}" viewBox="0 0 ${W} ${Hh}" overflow="hidden">${z.join("")}</svg>`);
  for (const pt of s.points ?? []) {
    const coul = pt.couleur ?? COULEUR_COURBE;
    o.push(`<circle cx="${f1(sxp(pt.x))}" cy="${f1(syp(pt.y))}" r="3.6" fill="${pt.creux ? "#ffffff" : coul}" stroke="${coul}" stroke-width="2"/>`);
    if (pt.label) {
      const pos = pt.position ?? "ne";
      const dx = pos === "ne" || pos === "se" ? 6 : -6;
      const dy = pos === "ne" || pos === "no" ? -6 : p + 4;
      const ancre = dx > 0 ? "start" : "end";
      o.push(`<text x="${f1(sxp(pt.x) + dx)}" y="${f1(syp(pt.y) + dy)}" font-size="${(p * 1.1).toFixed(1)}" font-weight="bold" text-anchor="${ancre}" fill="${coul}" ${POLICE} ${HALO}>${pt.label}</text>`);
    }
  }
  for (const t of s.textes ?? []) {
    o.push(`<text x="${f1(sxp(t.x))}" y="${f1(syp(t.y))}" font-size="${(p * 1.05).toFixed(1)}" font-weight="bold" font-style="italic" text-anchor="${t.ancre ?? "middle"}" fill="${t.couleur ?? COULEUR_TANGENTE}" ${POLICE} ${HALO}>${t.texte}</text>`);
  }
  if (s.titre) {
    const taille = s.titreGrand ? p * 1.5 : p * 1.15;
    o.push(`<text x="${MARGE + 4}" y="${f1(MARGE + taille * 1.1)}" font-size="${taille.toFixed(1)}" font-weight="bold" fill="#212529" ${POLICE} ${HALO}>${s.titre}</text>`);
  }
  o.push(`<rect x="0.5" y="0.5" width="${L - 1}" height="${H - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`);
  return { corps: o.join(""), L, H };
}

export function repereSvg(s: SpecRepere): string {
  const { corps, L, H } = contenu(s);
  return `<svg class="repere-derivees" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}" xmlns="http://www.w3.org/2000/svg">${corps}</svg>`;
}

/** Plusieurs repères de même taille en grille (graphiques candidats A–D), dans UN SVG. */
export function grilleReperesSvg(specs: SpecRepere[], colonnes = 2, ecart = 10): string {
  const parts = specs.map(contenu);
  const L = parts[0]!.L;
  const H = parts[0]!.H;
  const lignes = Math.ceil(parts.length / colonnes);
  const LT = colonnes * L + (colonnes - 1) * ecart;
  const HT = lignes * H + (lignes - 1) * ecart;
  const corps = parts.map((q, i) => `<svg x="${(i % colonnes) * (L + ecart)}" y="${Math.floor(i / colonnes) * (H + ecart)}" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}">${q.corps}</svg>`).join("");
  return `<svg class="reperes-derivees" width="${LT}" height="${HT}" viewBox="0 0 ${LT} ${HT}" xmlns="http://www.w3.org/2000/svg">${corps}</svg>`;
}
