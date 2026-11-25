/**
 * Figures SVG des générateurs 6gen112–6gen113 (6e ch. 8, lot H1) — chaînes autonomes (écran, papier
 * `enteteHtml`, corrigé `figureHtml`), sans identifiant interne, couleurs littérales (impression),
 * fond blanc, étiquettes à halo blanc.
 * - `escalierSvg` : fonction de répartition d'une loi discrète, point plein au saut (valeur prise) et
 *   point vide à gauche (valeur non prise), valeur de chaque palier écrite au-dessus du palier ;
 * - `densiteSvg` : densité affine par morceaux tracée sur un quadrillage (abscisses entières,
 *   hauteurs multiples de k : chaque sommet est sur une intersection), zone [a ; b] éventuellement
 *   grisée (corrigé seulement : dans l'énoncé, la zone ne trahit rien mais l'aire reste à calculer).
 */

const ENCRE = "#1b1d22";
const GRILLE = "#d0d5db";
const DOUX = "#868e96";
const ACCENT = "#1d52a8";
const ZONE = "#c5d6f2";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

function texte(x: number, y: number, t: string, o: { taille?: number; ancre?: string; italique?: boolean; couleur?: string } = {}): string {
  return `<text x="${f1(x)}" y="${f1(y)}" font-size="${o.taille ?? 12}" text-anchor="${o.ancre ?? "middle"}" fill="${o.couleur ?? ENCRE}"${o.italique ? ' font-style="italic"' : ""} stroke="#ffffff" stroke-width="3" stroke-linejoin="round" paint-order="stroke" ${POLICE}>${t}</text>`;
}
function trait(x1: number, y1: number, x2: number, y2: number, couleur = ENCRE, ep = 1.2, tirets = false): string {
  return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${couleur}" stroke-width="${ep}"${tirets ? ' stroke-dasharray="4 3"' : ""} stroke-linecap="round"/>`;
}
function svg(L: number, H: number, contenu: string, label: string): string {
  return `<svg class="figure-va-loth1" xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}" role="img" aria-label="${label}"><rect x="0" y="0" width="${L}" height="${H}" fill="#ffffff"/>${contenu}</svg>`;
}
const moinsTypo = (s: string) => s.replace(/^-/, "−");
const virgule = (v: number) => moinsTypo(String(Math.round(v * 1e4) / 1e4).replace(".", ","));

/** Fonction de répartition en escalier (`niveaux[i]` = F(valeurs[i]), entre 0 et 1). */
export function escalierSvg(valeurs: number[], niveaux: number[]): string {
  const L = 330;
  const H = 230;
  const g = 40;
  const d = 14;
  const h = 18;
  const b = 30;
  const xmin = valeurs[0]! - 1;
  const xmax = valeurs[valeurs.length - 1]! + 1;
  const X = (x: number) => g + ((x - xmin) / (xmax - xmin)) * (L - g - d);
  const Y = (y: number) => H - b - y * (H - b - h);
  let c = "";
  for (let k = 0; k <= 10; k += 2) {
    const y = Y(k / 10);
    c += trait(g, y, L - d, y, GRILLE, 0.8);
    c += texte(g - 6, y + 4, virgule(k / 10), { ancre: "end", taille: 10, couleur: DOUX });
  }
  for (let x = Math.ceil(xmin); x <= xmax; x++) {
    c += trait(X(x), Y(0), X(x), Y(0) + 4, ENCRE, 1);
    c += texte(X(x), Y(0) + 17, moinsTypo(String(x)), { taille: 11 });
  }
  c += trait(g, Y(0), L - d, Y(0), ENCRE, 1.2) + trait(g, Y(0), g, h - 6, ENCRE, 1.2);
  c += texte(L - d, Y(0) - 6, "x", { ancre: "end", italique: true });
  c += texte(g + 6, h - 6, "F(x)", { ancre: "start", italique: true, taille: 11 });
  // Paliers.
  const pts = [xmin, ...valeurs, xmax];
  const niv = [0, ...niveaux];
  for (let i = 0; i < niv.length; i++) {
    const x1 = pts[i]!;
    const x2 = pts[i + 1]!;
    c += trait(X(x1), Y(niv[i]!), X(x2), Y(niv[i]!), ACCENT, 2.2);
    if (i > 0) c += texte((X(x1) + X(x2)) / 2, Y(niv[i]!) - 6, virgule(niv[i]!), { taille: 11, couleur: ACCENT });
  }
  for (let i = 0; i < valeurs.length; i++) {
    const x = X(valeurs[i]!);
    c += trait(x, Y(niv[i]!), x, Y(niv[i + 1]!), DOUX, 0.8, true);
    c += `<circle cx="${f1(x)}" cy="${f1(Y(niv[i]!))}" r="3.2" fill="#ffffff" stroke="${ACCENT}" stroke-width="1.6"/>`;
    c += `<circle cx="${f1(x)}" cy="${f1(Y(niv[i + 1]!))}" r="3.4" fill="${ACCENT}"/>`;
  }
  return svg(L, H, c, "Fonction de répartition en escalier");
}

export interface SegmentDensite {
  x0: number;
  x1: number;
  /** Hauteurs en multiples de k. */
  y0: number;
  y1: number;
}

/** Densité affine par morceaux, hauteurs en unités de k (`hauteurMax` = 1 ou 2), zone grisée [a ; b]
 * optionnelle (corrigé). */
export function densiteSvg(segments: SegmentDensite[], options: { zone?: [number, number]; etiquetteK?: string } = {}): string {
  const L = 330;
  const H = 210;
  const g = 40;
  const d = 16;
  const h = 22;
  const b = 30;
  const xmax = Math.max(...segments.map((s) => s.x1)) + 1;
  const ymax = Math.max(...segments.map((s) => Math.max(s.y0, s.y1)));
  const hautGrille = ymax + 0.5;
  const X = (x: number) => g + (x / xmax) * (L - g - d);
  const Y = (y: number) => H - b - (y / hautGrille) * (H - b - h);
  const k = options.etiquetteK ?? "k";
  let c = "";
  for (let x = 0; x <= xmax; x++) c += trait(X(x), Y(0), X(x), Y(hautGrille), GRILLE, 0.8);
  for (let y = 0.5; y <= hautGrille + 1e-9; y += 0.5) c += trait(g, Y(y), L - d, Y(y), GRILLE, y % 1 === 0 ? 1 : 0.6);
  if (options.zone) {
    const [a, bb] = options.zone;
    const pts: string[] = [`${f1(X(a))},${f1(Y(0))}`];
    const xs = [...new Set([a, ...segments.flatMap((s) => [s.x0, s.x1]).filter((x) => x > a && x < bb), bb])].sort((u, v) => u - v);
    for (let i = 0; i + 1 < xs.length; i++) {
      const u = xs[i]!;
      const v = xs[i + 1]!;
      const s = segments.find((sg) => (u + v) / 2 > sg.x0 && (u + v) / 2 < sg.x1);
      if (!s) continue;
      const hs = (x: number) => s.y0 + ((s.y1 - s.y0) * (x - s.x0)) / (s.x1 - s.x0);
      pts.push(`${f1(X(u))},${f1(Y(hs(u)))}`, `${f1(X(v))},${f1(Y(hs(v)))}`);
    }
    pts.push(`${f1(X(bb))},${f1(Y(0))}`);
    c += `<polygon points="${pts.join(" ")}" fill="${ZONE}" stroke="none"/>`;
  }
  c += trait(g, Y(0), L - d, Y(0), ENCRE, 1.2) + trait(g, Y(0), g, h - 8, ENCRE, 1.2);
  for (let x = 0; x <= xmax; x++) c += texte(X(x), Y(0) + 17, String(x), { taille: 11 });
  for (let y = 1; y <= ymax; y++) c += texte(g - 6, Y(y) + 4, y === 1 ? k : `${y}${k}`, { ancre: "end", italique: true });
  c += texte(L - d, Y(0) - 6, "x", { ancre: "end", italique: true });
  c += texte(g + 6, h - 8, "f(x)", { ancre: "start", italique: true, taille: 11 });
  // Tracé (0 avant le support et après).
  const premier = segments[0]!;
  const dernier = segments[segments.length - 1]!;
  c += trait(X(0), Y(0), X(premier.x0), Y(0), ACCENT, 2.2);
  if (premier.y0 > 0) c += trait(X(premier.x0), Y(0), X(premier.x0), Y(premier.y0), ACCENT, 1, true);
  segments.forEach((s, i) => {
    c += trait(X(s.x0), Y(s.y0), X(s.x1), Y(s.y1), ACCENT, 2.2);
    const suivant = segments[i + 1];
    if (suivant && Math.abs(suivant.y0 - s.y1) > 1e-9) c += trait(X(s.x1), Y(s.y1), X(s.x1), Y(suivant.y0), ACCENT, 1, true);
  });
  if (dernier.y1 > 0) c += trait(X(dernier.x1), Y(dernier.y1), X(dernier.x1), Y(0), ACCENT, 1, true);
  c += trait(X(dernier.x1), Y(0), X(xmax), Y(0), ACCENT, 2.2);
  return svg(L, H, c, "Densité de probabilité tracée sur un quadrillage");
}
