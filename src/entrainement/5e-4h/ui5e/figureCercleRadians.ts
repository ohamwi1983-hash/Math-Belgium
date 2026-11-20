import { val, type Rat } from "../moteur5e/trigExact";

/**
 * Cercle trigonométrique quadrillé aux valeurs REMARQUABLES (5gen51, écran et papier) — même principe
 * que gen122 (4e) : √2/2 ≈ 0,71 et √3/2 ≈ 0,87 ne tombent sur aucune grille régulière, donc les lignes
 * x, y = 0, ±1/2, ±√2/2, ±√3/2, ±1 sont tracées elles-mêmes et graduées sur les demi-axes positifs (le
 * signe se lit au quadrant). Les 16 angles remarquables sont marqués d'un petit trait sur le cercle ;
 * le point M (et l'arc orienté depuis (1 ; 0)) n'apparaît que lorsque l'angle réduit est connu.
 */

const S = 100;
const GRILLE = "#c7d0dc";
const AXE = "#334155";
const CERCLE = "#111827";
const M_COULEUR = "#1d4ed8";
const POLICE = 'font-family="Helvetica, Arial, sans-serif"';
const HALO = 'stroke="#ffffff" stroke-width="3" paint-order="stroke" stroke-linejoin="round"';

const f2 = (n: number) => (Math.round(n * 10) / 10).toString();

type Grad = "1/2" | "r2/2" | "r3/2" | "1";
const VALEUR: Record<Grad, number> = { "1/2": 0.5, "r2/2": Math.SQRT2 / 2, "r3/2": Math.sqrt(3) / 2, "1": 1 };

/** Étiquette : fraction empilée (numérateur avec radical) ou « 1 ». */
function etiquette(g: Grad, cx: number, cy: number): string {
  if (g === "1") return `<text x="${f2(cx)}" y="${f2(cy + 4)}" font-size="11" text-anchor="middle" ${POLICE} ${HALO} fill="${AXE}">1</text>`;
  const num = g === "1/2" ? "1" : g === "r2/2" ? "√2" : "√3";
  const haut =
    num === "1"
      ? `<text x="${f2(cx)}" y="${f2(cy - 2.5)}" font-size="10" text-anchor="middle" ${POLICE} fill="${AXE}">1</text>`
      : `<text x="${f2(cx)}" y="${f2(cy - 2.5)}" font-size="10" text-anchor="middle" ${POLICE} fill="${AXE}">${num}</text><line x1="${f2(cx - 0.6)}" y1="${f2(cy - 10.5)}" x2="${f2(cx + 6)}" y2="${f2(cy - 10.5)}" stroke="${AXE}" stroke-width="0.8"/>`;
  return (
    `<rect x="${f2(cx - 8)}" y="${f2(cy - 12)}" width="16" height="24" fill="#ffffff"/>` +
    haut +
    `<line x1="${f2(cx - 6)}" y1="${f2(cy)}" x2="${f2(cx + 6)}" y2="${f2(cy)}" stroke="${AXE}" stroke-width="0.9"/>` +
    `<text x="${f2(cx)}" y="${f2(cy + 10)}" font-size="10" text-anchor="middle" ${POLICE} fill="${AXE}">2</text>`
  );
}

export interface OptionsCercleRadians {
  /** Angle réduit (coefficient de π) à marquer ; `null` : pas de point M. */
  reduit: Rat | null;
}

export function figureCercleRadians({ reduit }: OptionsCercleRadians): string {
  const cadre = { xMin: -1.34, xMax: 1.3, yMin: -1.26, yMax: 1.26 };
  const W = (cadre.xMax - cadre.xMin) * S;
  const H = (cadre.yMax - cadre.yMin) * S;
  const X = (x: number) => (x - cadre.xMin) * S;
  const Y = (y: number) => (cadre.yMax - y) * S;
  const p: string[] = [`<rect x="0" y="0" width="${f2(W)}" height="${f2(H)}" fill="#ffffff"/>`];
  for (const g of ["1/2", "r2/2", "r3/2", "1"] as Grad[]) {
    for (const s of [1, -1]) {
      const v = s * VALEUR[g];
      p.push(`<line x1="${f2(X(v))}" y1="${f2(Y(-1))}" x2="${f2(X(v))}" y2="${f2(Y(1))}" stroke="${GRILLE}" stroke-width="0.8"/>`);
      p.push(`<line x1="${f2(X(-1))}" y1="${f2(Y(v))}" x2="${f2(X(1))}" y2="${f2(Y(v))}" stroke="${GRILLE}" stroke-width="0.8"/>`);
    }
  }
  // Axes fléchés
  p.push(`<line x1="${f2(X(-1.24))}" y1="${f2(Y(0))}" x2="${f2(X(1.22))}" y2="${f2(Y(0))}" stroke="${AXE}" stroke-width="1.2"/>`);
  p.push(`<path d="M ${f2(X(1.22))} ${f2(Y(0))} l -7 -3.5 l 0 7 z" fill="${AXE}"/>`);
  p.push(`<line x1="${f2(X(0))}" y1="${f2(Y(-1.2))}" x2="${f2(X(0))}" y2="${f2(Y(1.2))}" stroke="${AXE}" stroke-width="1.2"/>`);
  p.push(`<path d="M ${f2(X(0))} ${f2(Y(1.2))} l -3.5 7 l 7 0 z" fill="${AXE}"/>`);
  p.push(`<circle cx="${f2(X(0))}" cy="${f2(Y(0))}" r="${S}" fill="none" stroke="${CERCLE}" stroke-width="1.6"/>`);
  // 16 angles remarquables : petits traits radiaux
  for (let k = 0; k < 24; k++) {
    if (k % 2 === 1 && k % 3 !== 0) continue; // multiples de π/12 qui ne sont ni π/6 ni π/4
    const a = (k * Math.PI) / 12;
    const c = Math.cos(a);
    const s = Math.sin(a);
    p.push(`<line x1="${f2(X(0.95 * c))}" y1="${f2(Y(0.95 * s))}" x2="${f2(X(1.05 * c))}" y2="${f2(Y(1.05 * s))}" stroke="${CERCLE}" stroke-width="1.2"/>`);
  }
  if (reduit) {
    const a = val(reduit) * Math.PI;
    const mx = Math.cos(a);
    const my = Math.sin(a);
    p.push(`<line x1="${f2(X(0))}" y1="${f2(Y(0))}" x2="${f2(X(mx))}" y2="${f2(Y(my))}" stroke="${M_COULEUR}" stroke-width="1.6"/>`);
    p.push(`<line x1="${f2(X(mx))}" y1="${f2(Y(my))}" x2="${f2(X(mx))}" y2="${f2(Y(0))}" stroke="${M_COULEUR}" stroke-width="1" stroke-dasharray="4 3"/>`);
    p.push(`<line x1="${f2(X(mx))}" y1="${f2(Y(my))}" x2="${f2(X(0))}" y2="${f2(Y(my))}" stroke="${M_COULEUR}" stroke-width="1" stroke-dasharray="4 3"/>`);
    if (a > 0) {
      const r = 0.22;
      const grand = a > Math.PI ? 1 : 0;
      const fx = r * Math.cos(a);
      const fy = r * Math.sin(a);
      p.push(`<path d="M ${f2(X(r))} ${f2(Y(0))} A ${r * S} ${r * S} 0 ${grand} 0 ${f2(X(fx))} ${f2(Y(fy))}" fill="none" stroke="${M_COULEUR}" stroke-width="1.2"/>`);
      const ux = -Math.sin(a);
      const uy = -Math.cos(a);
      const px = X(fx);
      const py = Y(fy);
      p.push(`<path d="M ${f2(px)} ${f2(py)} L ${f2(px - 6 * ux - 3 * uy)} ${f2(py - 6 * uy + 3 * ux)} L ${f2(px - 6 * ux + 3 * uy)} ${f2(py - 6 * uy - 3 * ux)} z" fill="${M_COULEUR}"/>`);
    }
    p.push(`<circle cx="${f2(X(mx))}" cy="${f2(Y(my))}" r="4.5" fill="${M_COULEUR}"/>`);
    const aM = a + (Math.abs(Math.sin(a)) > 0.99 ? 0.28 : 0.2);
    p.push(`<text x="${f2(X(1.14 * Math.cos(aM)))}" y="${f2(Y(1.14 * Math.sin(aM)) + 4)}" font-size="13" text-anchor="middle" font-weight="bold" ${POLICE} ${HALO} fill="${M_COULEUR}">M</text>`);
  }
  // Graduations des demi-axes positifs (x sous l'axe, y à gauche, √2/2 décalé)
  for (const g of ["1/2", "r2/2", "r3/2", "1"] as Grad[]) {
    const v = VALEUR[g];
    p.push(`<line x1="${f2(X(v))}" y1="${f2(Y(0) - 3)}" x2="${f2(X(v))}" y2="${f2(Y(0) + 3)}" stroke="${AXE}" stroke-width="1.1"/>`);
    p.push(`<line x1="${f2(X(0) - 3)}" y1="${f2(Y(v))}" x2="${f2(X(0) + 3)}" y2="${f2(Y(v))}" stroke="${AXE}" stroke-width="1.1"/>`);
    p.push(g === "1" ? etiquette(g, X(v) + 8, Y(0) + 11) : etiquette(g, X(v), Y(0) + 17));
    p.push(g === "1" ? etiquette(g, X(0) - 9, Y(v) - 11) : etiquette(g, X(0) - (g === "r2/2" ? 30 : 12), Y(v)));
  }
  p.push(`<text x="${f2(X(0) - 5)}" y="${f2(Y(0) + 12)}" font-size="11" text-anchor="end" ${POLICE} ${HALO} fill="${AXE}">O</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(W)}" height="${Math.round(H)}" viewBox="0 0 ${f2(W)} ${f2(H)}" role="img" aria-label="Cercle trigonométrique quadrillé aux valeurs remarquables">${p.join("")}</svg>`;
}
