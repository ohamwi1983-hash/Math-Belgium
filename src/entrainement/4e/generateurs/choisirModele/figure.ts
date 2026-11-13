import type { ExerciceChoisirModele, PositionEtiquette } from "./types";
import { evaluerModele, INFOS_CONTEXTE, nombreTexte } from "./modele";

/**
 * Figure SVG statique de gen69 : axes nommés avec unités, quadrillage, courbe de la situation,
 * points clés avec leurs coordonnées, asymptote horizontale en pointillés. La MÊME fonction sert à
 * l'écran (couleurs du thème, clair ou sombre) et au papier (couleurs fixes sur fond blanc) ; le
 * corrigé ajoute des annotations (point caractéristique, écarts lus, réponse de l'écran 4).
 */

export interface PaletteFigure {
  fond: string;
  axe: string;
  grille: string;
  courbe: string;
  point: string;
  annotation: string;
  asymptote: string;
  police: string;
}

export const PALETTE_PAPIER: PaletteFigure = {
  fond: "#ffffff",
  axe: "#343a40",
  grille: "#e3e8ec",
  courbe: "#1971c2",
  point: "#c2410c",
  annotation: "#2f7a4f",
  asymptote: "#6c757d",
  police: "Archivo, Arial, Helvetica, sans-serif",
};

/** Variables du thème (`index.css`), redéfinies en mode sombre. */
export const PALETTE_ECRAN: PaletteFigure = {
  fond: "var(--color-surface)",
  axe: "var(--color-text)",
  grille: "var(--line-soft)",
  courbe: "var(--sky)",
  point: "var(--accent)",
  annotation: "var(--good)",
  asymptote: "var(--ink-faint)",
  police: "var(--sans)",
};

export interface OptionsFigure {
  palette: PaletteFigure;
  /** Corrigé : point caractéristique, écarts lus et réponse de l'écran 4. */
  annoter?: boolean;
  classe?: string;
}

const L = 480;
const H = 310;
const MG = 50; // gauche (graduations de l'axe vertical)
const MD = 58; // droite (nom de l'axe horizontal)
const MH = 30; // haut (nom de l'axe vertical)
const MB = 30; // bas (graduations de l'axe horizontal)

function f(v: number): string {
  return v.toFixed(1);
}

function coord(x: number, y: number): string {
  return `(${nombreTexte(x)} ; ${nombreTexte(y)})`;
}

function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const DECALAGES: Record<PositionEtiquette, { dx: number; dy: number; ancre: "start" | "middle" | "end" }> = {
  haut: { dx: 0, dy: -9, ancre: "middle" },
  bas: { dx: 0, dy: 17, ancre: "middle" },
  gauche: { dx: -8, dy: 4, ancre: "end" },
  droite: { dx: 8, dy: 4, ancre: "start" },
  "haut-gauche": { dx: -6, dy: -7, ancre: "end" },
  "haut-droite": { dx: 6, dy: -7, ancre: "start" },
  "bas-gauche": { dx: -6, dy: 15, ancre: "end" },
  "bas-droite": { dx: 6, dy: 15, ancre: "start" },
};

export function construireFigureModele(e: ExerciceChoisirModele, options: OptionsFigure): string {
  const p = options.palette;
  const { xMax, yMax, pasX, pasY } = e.fenetre;
  const info = INFOS_CONTEXTE[e.contexte];
  const x0 = MG;
  const x1 = L - MD;
  const y0 = H - MB;
  const y1 = MH;
  const sx = (x: number) => x0 + (x / xMax) * (x1 - x0);
  const sy = (y: number) => y0 - (y / yMax) * (y0 - y1);
  const style = (props: Record<string, string | number>) =>
    `style="${Object.entries(props)
      .map(([k, v]) => `${k}:${v}`)
      .join(";")}"`;
  const texteSvg = (x: number, y: number, contenu: string, ancre: string, couleur: string, taille = 11, gras = false) =>
    `<text x="${f(x)}" y="${f(y)}" text-anchor="${ancre}" ${style({ fill: couleur, "font-size": `${taille}px`, "font-family": p.police, "font-weight": gras ? 600 : 400 })}>${echapper(contenu)}</text>`;

  const morceaux: string[] = [];
  morceaux.push(`<rect x="0" y="0" width="${L}" height="${H}" ${style({ fill: p.fond })}/>`);

  // Quadrillage et graduations.
  for (let i = 1; i * pasX <= xMax + 1e-9; i++) {
    const v = i * pasX;
    morceaux.push(`<line x1="${f(sx(v))}" y1="${f(y0)}" x2="${f(sx(v))}" y2="${f(y1)}" ${style({ stroke: p.grille, "stroke-width": 1 })}/>`);
    morceaux.push(texteSvg(sx(v), y0 + 15, nombreTexte(v), "middle", p.axe, 10));
  }
  for (let i = 1; i * pasY <= yMax + 1e-9; i++) {
    const v = i * pasY;
    morceaux.push(`<line x1="${f(x0)}" y1="${f(sy(v))}" x2="${f(x1)}" y2="${f(sy(v))}" ${style({ stroke: p.grille, "stroke-width": 1 })}/>`);
    morceaux.push(texteSvg(x0 - 6, sy(v) + 3.5, nombreTexte(v), "end", p.axe, 10));
  }
  morceaux.push(texteSvg(x0 - 6, y0 + 15, "0", "end", p.axe, 10));

  // Axes fléchés et leurs noms (grandeur et unité).
  const trait = style({ stroke: p.axe, "stroke-width": 1.5, fill: "none" });
  morceaux.push(`<line x1="${f(x0)}" y1="${f(y0)}" x2="${f(x1 + 14)}" y2="${f(y0)}" ${trait}/>`);
  morceaux.push(`<path d="M ${f(x1 + 14)},${f(y0)} l -7,-4 l 0,8 z" ${style({ fill: p.axe })}/>`);
  morceaux.push(`<line x1="${f(x0)}" y1="${f(y0)}" x2="${f(x0)}" y2="${f(y1 - 14)}" ${trait}/>`);
  morceaux.push(`<path d="M ${f(x0)},${f(y1 - 14)} l -4,7 l 8,0 z" ${style({ fill: p.axe })}/>`);
  morceaux.push(texteSvg(x1 + 18, y0 + 4, `${info.axeX.nom} (${info.axeX.unite})`, "start", p.axe, 12, true));
  morceaux.push(texteSvg(x0 + 8, y1 - 8, `${info.axeY.nom} (${info.axeY.unite})`, "start", p.axe, 12, true));

  // Asymptote horizontale.
  if (e.asymptoteH !== null) {
    const ya = sy(e.asymptoteH);
    morceaux.push(`<line x1="${f(x0)}" y1="${f(ya)}" x2="${f(x1)}" y2="${f(ya)}" ${style({ stroke: p.asymptote, "stroke-width": 1.4, "stroke-dasharray": "6 4" })}/>`);
    morceaux.push(texteSvg(x1 - 4, ya - 6, `${info.axeY.nom} = ${nombreTexte(e.asymptoteH)}`, "end", p.asymptote, 11));
  }

  // Courbe : échantillonnée sur le domaine ∩ fenêtre, coupée hors du cadre.
  const [d0, d1] = e.domaine;
  const debut = Math.max(0, d0);
  const fin = Math.min(xMax, d1);
  const n = 400;
  let chemin = "";
  let enCours = false;
  for (let i = 0; i <= n; i++) {
    const x = debut + ((fin - debut) * i) / n;
    const y = evaluerModele(e, x);
    if (!Number.isFinite(y) || y < -1e-9 || y > yMax) {
      enCours = false;
      continue;
    }
    chemin += `${enCours ? " L" : " M"} ${f(sx(x))},${f(sy(y))}`;
    enCours = true;
  }
  morceaux.push(`<path d="${chemin.trim()}" ${style({ stroke: p.courbe, "stroke-width": 2.4, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" })}/>`);

  // Annotations du corrigé (sous les points pour ne pas les masquer).
  if (options.annoter) {
    const lecture = e.points[e.indexLecture];
    const pc = { x: e.th, y: e.tv };
    const pointilles = style({ stroke: p.annotation, "stroke-width": 1.6, "stroke-dasharray": "4 3", fill: "none" });
    // Écart horizontal puis vertical, du point caractéristique au point de lecture.
    morceaux.push(`<path d="M ${f(sx(pc.x))},${f(sy(pc.y))} L ${f(sx(lecture.x))},${f(sy(pc.y))} L ${f(sx(lecture.x))},${f(sy(lecture.y))}" ${pointilles}/>`);
    const dx = lecture.x - pc.x;
    const dy = lecture.y - pc.y;
    morceaux.push(texteSvg((sx(pc.x) + sx(lecture.x)) / 2, sy(pc.y) + (dy >= 0 ? 14 : -6), `${dx >= 0 ? "+" : "−"}${nombreTexte(Math.abs(dx))}`, "middle", p.annotation, 11, true));
    morceaux.push(texteSvg(sx(lecture.x) + 6, (sy(pc.y) + sy(lecture.y)) / 2 + 4, `${dy >= 0 ? "+" : "−"}${nombreTexte(Math.abs(dy))}`, "start", p.annotation, 11, true));
    // Point caractéristique (cercle évidé pour l'inverse : il n'est pas sur la courbe).
    morceaux.push(`<circle cx="${f(sx(pc.x))}" cy="${f(sy(pc.y))}" r="6.5" ${style({ stroke: p.annotation, "stroke-width": 2, fill: "none" })}/>`);
    // Réponse de l'écran 4, si elle est dans la fenêtre.
    const q = e.question4;
    const reponses = q.type === "predire" ? [{ x: q.x, y: q.y }] : q.solutions.map((s) => ({ x: s, y: q.y }));
    for (const r of reponses) {
      if (r.x < 0 || r.x > xMax || r.y < 0 || r.y > yMax) continue;
      morceaux.push(`<path d="M ${f(sx(r.x))},${f(y0)} L ${f(sx(r.x))},${f(sy(r.y))} L ${f(x0)},${f(sy(r.y))}" ${style({ stroke: p.point, "stroke-width": 1.2, "stroke-dasharray": "3 3", fill: "none" })}/>`);
      morceaux.push(`<circle cx="${f(sx(r.x))}" cy="${f(sy(r.y))}" r="4" ${style({ stroke: p.point, "stroke-width": 2, fill: p.fond })}/>`);
    }
  }

  // Points clés et leurs coordonnées.
  for (const pt of e.points) {
    const px = sx(pt.x);
    const py = sy(pt.y);
    morceaux.push(`<circle cx="${f(px)}" cy="${f(py)}" r="3.6" ${style({ fill: p.point })}/>`);
    const d = DECALAGES[pt.position];
    morceaux.push(texteSvg(px + d.dx, py + d.dy, coord(pt.x, pt.y), d.ancre, p.point, 11, true));
  }

  const classe = options.classe ?? "figure-choisir-modele";
  return `<svg class="${classe}" viewBox="0 0 ${L} ${H}" width="${L}" height="${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Graphique de ${info.axeY.nom} en fonction de ${info.axeX.nom}">${morceaux.join("")}</svg>`;
}
