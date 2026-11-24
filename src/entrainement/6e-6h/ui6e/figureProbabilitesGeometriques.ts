import type { ExerciceProbaGeo } from "../core6e/probabilitesGeometriques";

/**
 * Figures de `6gen162` (chaîne SVG autonome : écran ET papier `enteteHtml`, sans identifiant interne).
 * Couleurs littérales (impression), fond blanc. La zone favorable est grisée seulement quand elle est
 * DÉCRITE par l'énoncé (cible, carré, rectangle, bande du rendez-vous) : le travail reste le calcul
 * des aires. Le segment n'a ni repère ni zone (l'élève trouve la partie favorable). L'inconnue de
 * `cibleInverse` s'écrit « ? » sur la figure.
 */

const ENCRE = "#1b1d22";
const DOUX = "#868e96";
const ZONE = "#ced4da";
const ZONE_BORD = "#e8590c";
const VERT = "#ced4da";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

function texte(x: number, y: number, t: string, o: { taille?: number; ancre?: string; italique?: boolean; couleur?: string; gras?: boolean } = {}): string {
  return `<text x="${f1(x)}" y="${f1(y)}" font-size="${o.taille ?? 13}" text-anchor="${o.ancre ?? "middle"}" fill="${o.couleur ?? ENCRE}"${o.italique ? ' font-style="italic"' : ""}${o.gras ? ' font-weight="600"' : ""} stroke="#ffffff" stroke-width="3.5" stroke-linejoin="round" paint-order="stroke" ${POLICE}>${t}</text>`;
}
function trait(x1: number, y1: number, x2: number, y2: number, o: { couleur?: string; ep?: number; tirets?: boolean } = {}): string {
  return `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${o.couleur ?? ENCRE}" stroke-width="${o.ep ?? 1.4}"${o.tirets ? ' stroke-dasharray="5 4"' : ""} stroke-linecap="round"/>`;
}
function cercle(cx: number, cy: number, r: number, o: { remplissage?: string; couleur?: string; ep?: number } = {}): string {
  return `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r)}" fill="${o.remplissage ?? "none"}" stroke="${o.couleur ?? ENCRE}" stroke-width="${o.ep ?? 1.5}"/>`;
}
/** Disque de rayon R privé du disque de rayon r (r = 0 : disque plein). */
function couronne(cx: number, cy: number, R: number, r: number): string {
  const c = (rr: number) => `M ${f1(cx + rr)} ${f1(cy)} A ${f1(rr)} ${f1(rr)} 0 1 0 ${f1(cx - rr)} ${f1(cy)} A ${f1(rr)} ${f1(rr)} 0 1 0 ${f1(cx + rr)} ${f1(cy)} Z`;
  return `<path d="${c(R)}${r > 0 ? ` ${c(r)}` : ""}" fill="${ZONE}" fill-rule="evenodd" stroke="none"/>`;
}
function svg(L: number, H: number, contenu: string, label: string): string {
  return `<svg class="figure-proba-geo" xmlns="http://www.w3.org/2000/svg" width="${L}" height="${H}" viewBox="0 0 ${L} ${H}" role="img" aria-label="${label}"><rect x="0" y="0" width="${L}" height="${H}" fill="#ffffff"/>${contenu}</svg>`;
}
/** Rayon tracé du centre vers l'angle `deg` (sens trigonométrique), étiqueté à son milieu. */
function rayon(cx: number, cy: number, r: number, deg: number, etiquette: string, decalage = 13): string {
  const a = (deg * Math.PI) / 180;
  const x = cx + r * Math.cos(a);
  const y = cy - r * Math.sin(a);
  const mx = (cx + x) / 2 - decalage * Math.sin(a);
  const my = (cy + y) / 2 - decalage * Math.cos(a);
  return `${trait(cx, cy, x, y, { ep: 1.6 })}<circle cx="${f1(x)}" cy="${f1(y)}" r="2.4" fill="${ENCRE}"/>${texte(mx, my + 4, etiquette, { gras: true })}`;
}
const cm = (v: number) => `${v} cm`;

function figureCible(e: Extract<ExerciceProbaGeo, { variante: "cible" | "cibleInverse" }>): string {
  const L = 280;
  const H = 250;
  const cx = 140;
  const cy = 125;
  const s = 105 / e.R;
  let c = "";
  if (e.variante === "cible") {
    c += couronne(cx, cy, e.r2 * s, e.r1 * s);
    c += cercle(cx, cy, e.R * s, { ep: 1.8 });
    if (e.r2 < e.R) c += cercle(cx, cy, e.r2 * s);
    if (e.r1 > 0) c += cercle(cx, cy, e.r1 * s);
    c += `<circle cx="${cx}" cy="${cy}" r="2.6" fill="${ENCRE}"/>`;
    c += rayon(cx, cy, e.R * s, 0, cm(e.R));
    if (e.r2 < e.R) c += rayon(cx, cy, e.r2 * s, 128, cm(e.r2));
    if (e.r1 > 0) c += rayon(cx, cy, e.r1 * s, 232, cm(e.r1), -13);
  } else {
    c += couronne(cx, cy, e.r * s, 0);
    c += cercle(cx, cy, e.R * s, { ep: 1.8 });
    c += cercle(cx, cy, e.r * s);
    c += `<circle cx="${cx}" cy="${cy}" r="2.6" fill="${ENCRE}"/>`;
    c += rayon(cx, cy, e.R * s, 0, cm(e.R));
    c += rayon(cx, cy, e.r * s, 135, "r = ?");
  }
  return svg(L, H, c, "Cible circulaire, zone grisée");
}

function figureCarre(e: Extract<ExerciceProbaGeo, { variante: "carreDisque" }>): string {
  const L = 290;
  const H = 250;
  const x0 = 66;
  const y0 = 20;
  const a = 190;
  const cx = x0 + a / 2;
  const cy = y0 + a / 2;
  let c = "";
  if (e.hors) {
    c += `<path d="M ${x0} ${y0} H ${x0 + a} V ${y0 + a} H ${x0} Z M ${f1(cx + a / 2)} ${f1(cy)} A ${a / 2} ${a / 2} 0 1 0 ${f1(cx - a / 2)} ${f1(cy)} A ${a / 2} ${a / 2} 0 1 0 ${f1(cx + a / 2)} ${f1(cy)} Z" fill="${ZONE}" fill-rule="evenodd" stroke="none"/>`;
  } else c += couronne(cx, cy, a / 2, 0);
  c += `<rect x="${x0}" y="${y0}" width="${a}" height="${a}" fill="none" stroke="${ENCRE}" stroke-width="1.8"/>`;
  c += cercle(cx, cy, a / 2);
  c += texte(x0 + a / 2, y0 + a + 20, cm(e.c), { gras: true });
  c += texte(x0 - 8, y0 + a / 2 + 4, cm(e.c), { gras: true, ancre: "end" });
  return svg(L, H, c, "Carré et disque inscrit, zone grisée");
}

function figureRectangle(e: Extract<ExerciceProbaGeo, { variante: "rectangleQuart" }>): string {
  const s = Math.min(200 / e.L, 150 / e.l);
  const W = e.L * s;
  const Hh = e.l * s;
  const x0 = 60;
  const y0 = 16;
  const L = Math.round(x0 + W + 24);
  const H = Math.round(y0 + Hh + 36);
  const ox = x0;
  const oy = y0 + Hh;
  const r = e.r * s;
  let c = "";
  const quart = `M ${f1(ox)} ${f1(oy)} L ${f1(ox + r)} ${f1(oy)} A ${f1(r)} ${f1(r)} 0 0 0 ${f1(ox)} ${f1(oy - r)} Z`;
  if (e.hors) c += `<path d="M ${x0} ${y0} H ${f1(x0 + W)} V ${f1(y0 + Hh)} H ${x0} Z ${quart}" fill="${ZONE}" fill-rule="evenodd" stroke="none"/>`;
  else c += `<path d="${quart}" fill="${ZONE}" stroke="none"/>`;
  c += `<rect x="${x0}" y="${y0}" width="${f1(W)}" height="${f1(Hh)}" fill="none" stroke="${ENCRE}" stroke-width="1.8"/>`;
  c += `<path d="M ${f1(ox + r)} ${f1(oy)} A ${f1(r)} ${f1(r)} 0 0 0 ${f1(ox)} ${f1(oy - r)}" fill="none" stroke="${ENCRE}" stroke-width="1.5"/>`;
  c += rayon(ox, oy, r, 45, cm(e.r));
  c += texte(x0 + W / 2, y0 + Hh + 20, cm(e.L), { gras: true });
  c += texte(x0 - 8, y0 + Hh / 2 + 4, cm(e.l), { gras: true, ancre: "end" });
  return svg(L, H, c, "Rectangle et quart de disque, zone grisée");
}

function figureSegment(e: Extract<ExerciceProbaGeo, { variante: "segment" }>): string {
  const L = 300;
  const H = 90;
  const xa = 30;
  const xb = 270;
  const y = 40;
  const xm = xa + 0.37 * (xb - xa);
  let c = trait(xa, y, xb, y, { ep: 2.2 });
  c += trait(xa, y - 7, xa, y + 7, { ep: 1.8 }) + trait(xb, y - 7, xb, y + 7, { ep: 1.8 });
  c += texte(xa, y - 14, "A", { italique: true, taille: 15 }) + texte(xb, y - 14, "B", { italique: true, taille: 15 });
  c += `<circle cx="${f1(xm)}" cy="${y}" r="3.4" fill="${ZONE_BORD}"/>` + texte(xm, y - 12, "M", { italique: true, taille: 15, couleur: ZONE_BORD });
  c += trait(xa, y + 24, xb, y + 24, { couleur: DOUX, ep: 1 });
  c += trait(xa, y + 19, xa, y + 29, { couleur: DOUX, ep: 1 }) + trait(xb, y + 19, xb, y + 29, { couleur: DOUX, ep: 1 });
  c += `<rect x="${(xa + xb) / 2 - 26}" y="${y + 15}" width="52" height="18" fill="#ffffff"/>` + texte((xa + xb) / 2, y + 29, cm(e.L), { gras: true });
  return svg(L, H, c, "Segment [AB] et un point M");
}

function figureRendezVous(e: Extract<ExerciceProbaGeo, { variante: "rendezVous" }>): string {
  const L = 290;
  const H = 280;
  const x0 = 50;
  const y0 = 236;
  const a = 196;
  const s = a / e.T;
  const X = (v: number) => x0 + v * s;
  const Y = (v: number) => y0 - v * s;
  const t = e.t;
  const T = e.T;
  let c = `<path d="M ${f1(X(0))} ${f1(Y(0))} L ${f1(X(t))} ${f1(Y(0))} L ${f1(X(T))} ${f1(Y(T - t))} L ${f1(X(T))} ${f1(Y(T))} L ${f1(X(T - t))} ${f1(Y(T))} L ${f1(X(0))} ${f1(Y(t))} Z" fill="${VERT}" stroke="none"/>`;
  c += `<rect x="${f1(X(0))}" y="${f1(Y(T))}" width="${f1(a)}" height="${f1(a)}" fill="none" stroke="${ENCRE}" stroke-width="1.6"/>`;
  c += trait(X(t), Y(0), X(T), Y(T - t), { ep: 1.5 }) + trait(X(0), Y(t), X(T - t), Y(T), { ep: 1.5 });
  c += trait(X(0), Y(0), X(T) + 22, Y(0), { ep: 1.2 }) + trait(X(0), Y(0), X(0), Y(T) - 22, { ep: 1.2 });
  c += `<path d="M ${f1(X(T) + 22)} ${f1(Y(0))} l -8 -4 v 8 Z" fill="${ENCRE}"/><path d="M ${f1(X(0))} ${f1(Y(T) - 22)} l -4 8 h 8 Z" fill="${ENCRE}"/>`;
  c += texte(X(0) - 6, Y(0) + 16, "0", { ancre: "end" });
  for (const v of [t, T]) {
    c += trait(X(v), Y(0) - 4, X(v), Y(0) + 4) + texte(X(v), Y(0) + 17, `${v}`);
    c += trait(X(0) - 4, Y(v), X(0) + 4, Y(v)) + texte(X(0) - 8, Y(v) + 4, `${v}`, { ancre: "end" });
  }
  c += texte(X(T) + 20, Y(0) - 8, "x", { italique: true, taille: 15 }) + texte(X(0) + 10, Y(T) - 14, "y", { italique: true, taille: 15, ancre: "start" });
  c += texte(X(T / 2), Y(T / 2) + 4, "rencontre", { taille: 12, couleur: "#343a40", gras: true }).replace("<text ", `<text transform="rotate(-45 ${f1(X(T / 2))} ${f1(Y(T / 2))})" `);
  return svg(L, H, c, "Carré des arrivées et bande de rencontre");
}

export function figureProbaGeo(e: ExerciceProbaGeo): string {
  switch (e.variante) {
    case "cible":
    case "cibleInverse":
      return figureCible(e);
    case "carreDisque":
      return figureCarre(e);
    case "rectangleQuart":
      return figureRectangle(e);
    case "segment":
      return figureSegment(e);
    case "rendezVous":
      return figureRendezVous(e);
  }
}
