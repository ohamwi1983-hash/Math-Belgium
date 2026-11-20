/**
 * Figure des générateurs 6gen148 / 6gen149 (6e ch. 2, lot G) : courbe y = f(x) sur un quadrillage
 * d'UNE unité (fenêtre aux bornes entières), asymptote horizontale en pointillés, droites (tangentes)
 * et points. Chaîne SVG AUTONOME, la même à l'écran (`dangerouslySetInnerHTML`), sur papier
 * (`enteteHtml`) et dans le corrigé (`figureHtml`) — même patron que `figureCourbeLogarithmique.ts`
 * (6gen85) : identifiant du `clipPath` dérivé du contenu (jamais d'un compteur global), graduations
 * entières tous les 1, 2 ou 5 selon la place, halo blanc sous les étiquettes.
 */

export interface PointFigure {
  x: number;
  y: number;
  label: string;
  /** Étiquette sous le point plutôt qu'au-dessus (côté où la courbe ne passe pas). */
  dessous?: boolean;
}

export interface OptionsFigureExpo {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  courbe: (x: number) => number;
  asymptoteY?: number;
  droites?: { m: number; p: number }[];
  points?: PointFigure[];
  largeurMax: number;
  hauteurMax: number;
  carreauMin?: number;
  carreauMax?: number;
  police: number;
  fluide?: boolean;
}

const MARGE = 10;
const COULEUR_GRILLE = "#d8dee6";
const COULEUR_AXE = "#495057";
const COULEUR_COURBE = "#1971c2";
const COULEUR_ASYMPTOTE = "#e8590c";
const COULEUR_DROITE = "#2f9e44";
const COULEUR_POINT = "#2b2d42";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = 'stroke="#ffffff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"';

const f1 = (v: number) => v.toFixed(1);
const nombre = (v: number) => (v < 0 ? `−${Math.abs(v)}` : String(v));

function empreinte(texte: string): string {
  let h = 5381;
  for (let i = 0; i < texte.length; i++) h = ((h * 33) ^ texte.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

export function figureExpoSvg(o: OptionsFigureExpo): string {
  const { xMin, xMax, yMin, yMax } = o;
  const lu = xMax - xMin;
  const hu = yMax - yMin;
  const carreau = Math.max(o.carreauMin ?? 12, Math.min(o.carreauMax ?? 30, Math.floor(Math.min(o.largeurMax / lu, o.hauteurMax / hu))));
  const L = lu * carreau + 2 * MARGE;
  const H = hu * carreau + 2 * MARGE;
  const sx = (x: number) => MARGE + (x - xMin) * carreau;
  const sy = (y: number) => MARGE + (yMax - y) * carreau;
  const p = o.police;
  const pas = carreau >= 2 * p ? 1 : 2 * carreau >= 2 * p ? 2 : 5;
  const id = `ex${empreinte(JSON.stringify([xMin, xMax, yMin, yMax, o.courbe(0.37), o.courbe(-1.3), o.asymptoteY ?? null, o.droites ?? [], (o.points ?? []).length, carreau]))}`;
  const s: string[] = [];
  s.push(`<defs><clipPath id="${id}"><rect x="${MARGE}" y="${MARGE}" width="${lu * carreau}" height="${hu * carreau}"/></clipPath></defs>`);
  s.push(`<rect x="0" y="0" width="${L}" height="${H}" fill="#ffffff"/>`);
  for (let x = xMin; x <= xMax; x++) s.push(`<line x1="${f1(sx(x))}" y1="${MARGE}" x2="${f1(sx(x))}" y2="${H - MARGE}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  for (let y = yMin; y <= yMax; y++) s.push(`<line x1="${MARGE}" y1="${f1(sy(y))}" x2="${L - MARGE}" y2="${f1(sy(y))}" stroke="${COULEUR_GRILLE}" stroke-width="1"/>`);
  if (yMin <= 0 && yMax >= 0) s.push(`<line x1="${MARGE}" y1="${f1(sy(0))}" x2="${L - MARGE}" y2="${f1(sy(0))}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`);
  if (xMin <= 0 && xMax >= 0) s.push(`<line x1="${f1(sx(0))}" y1="${MARGE}" x2="${f1(sx(0))}" y2="${H - MARGE}" stroke="${COULEUR_AXE}" stroke-width="1.4"/>`);
  if (o.asymptoteY !== undefined) s.push(`<line x1="${MARGE}" y1="${f1(sy(o.asymptoteY))}" x2="${L - MARGE}" y2="${f1(sy(o.asymptoteY))}" stroke="${COULEUR_ASYMPTOTE}" stroke-width="1.6" stroke-dasharray="6 4"/>`);
  for (const d of o.droites ?? []) {
    s.push(`<line x1="${f1(sx(xMin))}" y1="${f1(sy(d.m * xMin + d.p))}" x2="${f1(sx(xMax))}" y2="${f1(sy(d.m * xMax + d.p))}" stroke="${COULEUR_DROITE}" stroke-width="1.8" clip-path="url(#${id})"/>`);
  }
  const n = 600;
  const morceaux: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = xMin + (lu * i) / n;
    const y = o.courbe(x);
    if (!Number.isFinite(y) || y < yMin - 2 * hu || y > yMax + 2 * hu) {
      morceaux.push("");
      continue;
    }
    const debut = morceaux.length === 0 || morceaux[morceaux.length - 1] === "";
    morceaux.push(`${debut ? "M" : "L"} ${f1(sx(x))},${f1(sy(y))}`);
  }
  s.push(`<path d="${morceaux.filter((m) => m !== "").join(" ")}" fill="none" stroke="${COULEUR_COURBE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" clip-path="url(#${id})"/>`);
  const yAxeX = Math.min((yMin <= 0 && yMax >= 0 ? sy(0) : H - MARGE) + p + 3, H - 3);
  const xAxeY = (xMin <= 0 && xMax >= 0 ? sx(0) : MARGE) - 3;
  for (let x = xMin + 1; x < xMax; x++) {
    if (x === 0 || x % pas !== 0) continue;
    s.push(`<text x="${f1(sx(x))}" y="${f1(yAxeX)}" font-size="${p}" text-anchor="middle" fill="${COULEUR_AXE}" ${POLICE} ${HALO}>${nombre(x)}</text>`);
  }
  for (let y = yMin + 1; y < yMax; y++) {
    if (y === 0 || y % pas !== 0) continue;
    s.push(`<text x="${f1(xAxeY)}" y="${f1(sy(y) + p / 2.8)}" font-size="${p}" text-anchor="end" fill="${COULEUR_AXE}" ${POLICE} ${HALO}>${nombre(y)}</text>`);
  }
  for (const pt of o.points ?? []) {
    const px = sx(pt.x);
    const py = sy(pt.y);
    const versGauche = px + p * 0.5 + pt.label.length * p * 0.62 > L - MARGE;
    s.push(`<circle cx="${f1(px)}" cy="${f1(py)}" r="${(p / 3).toFixed(1)}" fill="${COULEUR_POINT}"/>`);
    if (pt.label)
      s.push(
        `<text x="${f1(px + (versGauche ? -p * 0.5 : p * 0.5))}" y="${f1(pt.dessous ? py + p * 1.35 : py - p * 0.55)}" font-size="${(p * 1.1).toFixed(1)}" font-weight="bold" text-anchor="${versGauche ? "end" : "start"}" fill="${COULEUR_POINT}" ${POLICE} ${HALO}>${pt.label}</text>`,
      );
  }
  s.push(`<rect x="0.5" y="0.5" width="${L - 1}" height="${H - 1}" fill="none" stroke="#adb5bd" stroke-width="1"/>`);
  const style = o.fluide ? ' style="width:100%;height:auto;display:block"' : "";
  return `<svg class="graphe-cyclo" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}"${style} xmlns="http://www.w3.org/2000/svg">${s.join("")}</svg>`;
}

export { nombre as nombreFigure };
