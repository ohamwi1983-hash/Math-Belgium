/**
 * Tableau de signes de f′ et de variations de f en SVG AUTONOME (corrigé imprimé `figureHtml` et
 * corrigé de l'écran) — `6gen157`. Même lecture que `5e-4h/export5e/svgTableauVariations.ts`, avec en
 * plus une valeur INTERDITE (double barre, une limite de chaque côté) et les bornes où f′ n'existe
 * pas (domaine fermé de arcsin / arccos : case vide sur la ligne de f′). Couleurs littérales.
 */

const ENCRE = "#1b1d22";
const DOUX = "#5c6370";
const POLICE = 'font-family="Archivo, Arial, Helvetica, sans-serif"';

export interface ColonneTableau {
  /** Abscisse (texte Unicode, « − » typographique). */
  x: string;
  /** Ce qu'on écrit sur la ligne de f′ sous cette abscisse. */
  derivee: "zero" | "interdite" | "vide";
  /** Valeur de f (une seule) ou limites à gauche / à droite d'une valeur interdite. */
  valeur: string | [string, string];
}

export interface DonneesTableauCyclo {
  colonnes: ColonneTableau[];
  /** Signe de f′ sur chacun des intervalles entre deux colonnes. */
  signes: ("+" | "−")[];
}

function texte(x: number, y: number, contenu: string, o: { italique?: boolean; taille?: number; couleur?: string; ancre?: string } = {}): string {
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.taille ?? 14}" fill="${o.couleur ?? ENCRE}" text-anchor="${o.ancre ?? "middle"}"${o.italique ? ' font-style="italic"' : ""} ${POLICE}>${contenu}</text>`;
}
function ligne(x1: number, y1: number, x2: number, y2: number, ep = 1, c = ENCRE): string {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="${ep}"/>`;
}
function fleche(x1: number, y1: number, x2: number, y2: number): string {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const t = 7;
  const p = `${x2.toFixed(1)},${y2.toFixed(1)} ${(x2 + t * Math.cos(a + Math.PI - 0.45)).toFixed(1)},${(y2 + t * Math.sin(a + Math.PI - 0.45)).toFixed(1)} ${(x2 + t * Math.cos(a + Math.PI + 0.45)).toFixed(1)},${(y2 + t * Math.sin(a + Math.PI + 0.45)).toFixed(1)}`;
  return `${ligne(x1, y1, x2, y2, 1.2)}<polygon points="${p}" fill="${ENCRE}"/>`;
}

export function svgTableauVariationsCyclo(d: DonneesTableauCyclo): string {
  const n = d.colonnes.length;
  const colLib = 64;
  const pas = n <= 3 ? 150 : 120;
  const L = colLib + 46 + pas * (n - 1) + 46;
  const h1 = 30;
  const h2 = 30;
  const h3 = 74;
  const H = h1 + h2 + h3;
  const xn = (i: number) => colLib + 46 + pas * i;
  const y1 = h1;
  const y2 = h1 + h2;
  const haut = y2 + 20;
  const bas = y2 + h3 - 10;
  let s = `<rect x="0.5" y="0.5" width="${L - 1}" height="${H - 1}" fill="#ffffff" stroke="${ENCRE}" stroke-width="1"/>`;
  s += ligne(0, y1, L, y1) + ligne(0, y2, L, y2) + ligne(colLib, 0, colLib, H);
  s += texte(colLib / 2, y1 / 2 + 5, "x", { italique: true });
  s += texte(colLib / 2, y1 + h2 / 2 + 5, "f′(x)", { italique: true });
  s += texte(colLib / 2, y2 + h3 / 2 + 5, "f(x)", { italique: true });
  d.colonnes.forEach((c, i) => {
    s += texte(xn(i), y1 / 2 + 5, c.x);
    if (c.derivee === "zero") {
      s += texte(xn(i), y1 + h2 / 2 + 5, "0");
      s += `<line x1="${xn(i)}" y1="${y2}" x2="${xn(i)}" y2="${H}" stroke="${DOUX}" stroke-width="0.8" stroke-dasharray="3 3"/>`;
    }
    if (c.derivee === "interdite") for (const dx of [-2, 2]) s += ligne(xn(i) + dx, y1, xn(i) + dx, H, 1);
  });
  d.signes.forEach((sg, i) => (s += texte((xn(i) + xn(i + 1)) / 2, y1 + h2 / 2 + 5, sg, { taille: 15 })));
  // Position (haut / bas) de chaque côté de chaque colonne : une flèche montante arrive en haut et part
  // d'en bas ; une flèche descendante part d'en haut et arrive en bas.
  const arrivee = (i: number) => (d.signes[i - 1] === "+" ? haut : bas);
  const depart = (i: number) => (d.signes[i] === "+" ? bas : haut);
  d.colonnes.forEach((c, i) => {
    if (Array.isArray(c.valeur)) {
      s += texte(xn(i) - 8, arrivee(i), c.valeur[0], { taille: 13, ancre: "end" });
      s += texte(xn(i) + 8, depart(i), c.valeur[1], { taille: 13, ancre: "start" });
      return;
    }
    const y = i === 0 ? depart(i) : i === n - 1 ? arrivee(i) : arrivee(i) === depart(i) ? arrivee(i) : (haut + bas) / 2;
    s += texte(xn(i), y, c.valeur, { taille: 13 });
  });
  for (let i = 0; i < n - 1; i++) {
    const yD = depart(i) === haut ? haut + 6 : bas - 15;
    const yA = arrivee(i + 1) === haut ? haut + 6 : bas - 15;
    const dx0 = Array.isArray(d.colonnes[i].valeur) ? 40 : 30;
    const dx1 = Array.isArray(d.colonnes[i + 1].valeur) ? 40 : 30;
    s += fleche(xn(i) + dx0, yD, xn(i + 1) - dx1, yA);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" width="${L}" height="${H}" role="img" aria-label="Tableau de signes de la dérivée et de variations">${s}</svg>`;
}
