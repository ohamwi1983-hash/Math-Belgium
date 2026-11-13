import type { ExerciceNatureQuadrilatere } from "../core/natureQuadrilatere.types";
import type { Point } from "../core/vecteur.types";
import { cotes, critere, normeCarree, sommets, vecteur } from "../moteur/modeleNatureQuadrilatere";

/**
 * Figure de gen84 : repère orthonormé quadrillé (même échelle sur les deux axes), points placés et
 * quadrilatère tracé. Chaîne SVG AUTONOME (même principe que gen79, `figureRotationsContexte.ts`) :
 * - à l'écran, injectée telle quelle (`dangerouslySetInnerHTML`) : couleurs par les jetons du thème,
 *   clair/sombre suivent la page ;
 * - sur papier (`enteteHtml` de l'énoncé, `figureHtml` du corrigé) : chaque `var(--x, #…)` a une
 *   valeur de repli littérale.
 *
 * `enonce` : aucun codage (ni angle droit ni côtés égaux) — la figure ne suggère pas la nature au-delà
 * de ce que montrent des points exacts. Variante « quatrième sommet » : D absent tant qu'il n'est pas
 * trouvé (seuls A, B, C et les côtés [AB], [BC]). `corrige` : codages de TOUT ce qui est vrai — angle
 * droit à chaque sommet où les côtés sont orthogonaux, côtés de même longueur marqués du même nombre
 * de traits (un quadrilatère quelconque avec un angle droit en B le montre aussi : c'est le piège).
 */

const C = {
  encre: "var(--color-text, #1b1d22)",
  doux: "var(--color-text-muted, #5c6370)",
  grille: "var(--color-border, #d0d7de)",
  accent: "var(--color-primary, #b65c1f)",
  code: "var(--color-success, #2b8a3e)",
  fond: "var(--color-surface, #ffffff)",
};

const UNITE_MAX = 26;
const LARGEUR_UTILE = 330;
const MARGE = 16;

const f = (v: number) => Math.round(v * 10) / 10;

function texteSvg(x: number, y: number, contenu: string, options: { ancre?: "start" | "middle" | "end"; couleur?: string; taille?: number; gras?: boolean; italique?: boolean } = {}): string {
  const echappe = contenu.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<text x="${f(x)}" y="${f(y)}" font-size="${options.taille ?? 12}" text-anchor="${options.ancre ?? "middle"}" dominant-baseline="middle" fill="${options.couleur ?? C.encre}" stroke="${C.fond}" stroke-width="3" stroke-linejoin="round" paint-order="stroke"${options.gras ? ' font-weight="600"' : ""}${options.italique ? ' font-style="italic"' : ""} font-family="system-ui, sans-serif">${echappe}</text>`;
}

function ligne(a: Point, b: Point, couleur: string, epaisseur = 1): string {
  return `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${couleur}" stroke-width="${epaisseur}" stroke-linecap="round"/>`;
}

function pointe(bout: Point, direction: Point, couleur: string): string {
  const n = Math.hypot(direction.x, direction.y) || 1;
  const ux = direction.x / n;
  const uy = direction.y / n;
  const t = 7;
  const bx = bout.x - ux * t;
  const by = bout.y - uy * t;
  return `<polygon points="${f(bout.x)},${f(bout.y)} ${f(bx - uy * t * 0.45)},${f(by + ux * t * 0.45)} ${f(bx + uy * t * 0.45)},${f(by - ux * t * 0.45)}" fill="${couleur}"/>`;
}

export type ModeFigure = "enonce" | "corrige";

export function figureNatureQuadrilatereSvg(e: ExerciceNatureQuadrilatere, mode: ModeFigure, options: { masquerD?: boolean } = {}): string {
  const masquerD = options.masquerD ?? (mode === "enonce" && e.variante === "quatrieme");
  const tous = sommets(e);
  const visibles = masquerD ? tous.slice(0, 3) : tous;
  const noms = ["A", "B", "C", "D"];

  // Le cadre ne dépend que des 4 sommets (D compris, même masqué) : il ne bouge pas quand D apparaît.
  const xMin = Math.min(0, ...tous.map((p) => p.x)) - 1;
  const xMax = Math.max(0, ...tous.map((p) => p.x)) + 1;
  const yMin = Math.min(0, ...tous.map((p) => p.y)) - 1;
  const yMax = Math.max(0, ...tous.map((p) => p.y)) + 1;
  const unite = Math.min(UNITE_MAX, LARGEUR_UTILE / (xMax - xMin));
  const largeur = 2 * MARGE + (xMax - xMin) * unite;
  const hauteur = 2 * MARGE + (yMax - yMin) * unite;
  const px = (p: Point): Point => ({ x: MARGE + (p.x - xMin) * unite, y: MARGE + (yMax - p.y) * unite });

  const parties: string[] = [`<rect x="0" y="0" width="${f(largeur)}" height="${f(hauteur)}" fill="${C.fond}"/>`];

  // Quadrillage
  for (let x = xMin; x <= xMax; x++) parties.push(ligne(px({ x, y: yMin }), px({ x, y: yMax }), C.grille, 0.8));
  for (let y = yMin; y <= yMax; y++) parties.push(ligne(px({ x: xMin, y }), px({ x: xMax, y }), C.grille, 0.8));

  // Axes fléchés et graduations (chaque unité)
  const finX = { x: px({ x: xMax, y: 0 }).x + 10, y: px({ x: 0, y: 0 }).y };
  const finY = { x: px({ x: 0, y: 0 }).x, y: px({ x: 0, y: yMax }).y - 10 };
  parties.push(ligne(px({ x: xMin, y: 0 }), finX, C.doux, 1.3), pointe(finX, { x: 1, y: 0 }, C.doux));
  parties.push(ligne(px({ x: 0, y: yMin }), finY, C.doux, 1.3), pointe(finY, { x: 0, y: -1 }, C.doux));
  parties.push(texteSvg(finX.x - 2, finX.y - 9, "x", { couleur: C.doux, italique: true, taille: 12 }));
  parties.push(texteSvg(finY.x + 9, finY.y + 3, "y", { couleur: C.doux, italique: true, taille: 12 }));
  for (let x = xMin + 1; x < xMax; x++) {
    if (x === 0) continue;
    const p = px({ x, y: 0 });
    parties.push(ligne({ x: p.x, y: p.y - 3 }, { x: p.x, y: p.y + 3 }, C.doux, 1));
    parties.push(texteSvg(p.x, p.y + 10, String(x).replace("-", "−"), { couleur: C.doux, taille: 9 }));
  }
  for (let y = yMin + 1; y < yMax; y++) {
    if (y === 0) continue;
    const p = px({ x: 0, y });
    parties.push(ligne({ x: p.x - 3, y: p.y }, { x: p.x + 3, y: p.y }, C.doux, 1));
    parties.push(texteSvg(p.x - 5, p.y, String(y).replace("-", "−"), { couleur: C.doux, taille: 9, ancre: "end" }));
  }
  const o = px({ x: 0, y: 0 });
  parties.push(texteSvg(o.x - 5, o.y + 10, "0", { couleur: C.doux, taille: 9, ancre: "end" }));

  // Quadrilatère (ou les côtés [AB] et [BC] tant que D est inconnu)
  const pix = visibles.map(px);
  if (masquerD) {
    parties.push(ligne(pix[0]!, pix[1]!, C.accent, 2.2), ligne(pix[1]!, pix[2]!, C.accent, 2.2));
  } else {
    parties.push(`<polygon points="${pix.map((p) => `${f(p.x)},${f(p.y)}`).join(" ")}" fill="${C.accent}" fill-opacity="0.08" stroke="${C.accent}" stroke-width="2.2" stroke-linejoin="round"/>`);
  }

  // Codages du corrigé
  if (mode === "corrige" && !masquerD) {
    const s = tous;
    const pts = s.map(px);
    // Angles droits
    for (let i = 0; i < 4; i++) {
      const prec = s[(i + 3) % 4]!;
      const suiv = s[(i + 1) % 4]!;
      if (critere(vecteur(s[i]!, prec), vecteur(s[i]!, suiv)) !== 0) continue;
      const p = pts[i]!;
      const unitaire = (q: Point) => {
        const d = { x: q.x - p.x, y: q.y - p.y };
        const n = Math.hypot(d.x, d.y) || 1;
        return { x: d.x / n, y: d.y / n };
      };
      const a = unitaire(pts[(i + 3) % 4]!);
      const b = unitaire(pts[(i + 1) % 4]!);
      const k = 10;
      const p1 = { x: p.x + a.x * k, y: p.y + a.y * k };
      const p2 = { x: p.x + (a.x + b.x) * k, y: p.y + (a.y + b.y) * k };
      const p3 = { x: p.x + b.x * k, y: p.y + b.y * k };
      parties.push(`<polyline points="${f(p1.x)},${f(p1.y)} ${f(p2.x)},${f(p2.y)} ${f(p3.x)},${f(p3.y)}" fill="none" stroke="${C.code}" stroke-width="1.6"/>`);
    }
    // Côtés de même longueur : même nombre de traits
    const longueurs = cotes(e).map(normeCarree);
    const groupes: number[] = [];
    const traits = longueurs.map(() => 0);
    longueurs.forEach((l, i) => {
      if (longueurs.filter((m) => m === l).length < 2) return;
      let rang = groupes.indexOf(l);
      if (rang < 0) {
        groupes.push(l);
        rang = groupes.length - 1;
      }
      traits[i] = rang + 1;
    });
    traits.forEach((n, i) => {
      if (n === 0) return;
      const a = pts[i]!;
      const b = pts[(i + 1) % 4]!;
      const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const d = { x: b.x - a.x, y: b.y - a.y };
      const l = Math.hypot(d.x, d.y) || 1;
      const u = { x: d.x / l, y: d.y / l };
      const nrm = { x: -u.y, y: u.x };
      for (let t = 0; t < n; t++) {
        const decal = (t - (n - 1) / 2) * 4;
        const c = { x: m.x + u.x * decal, y: m.y + u.y * decal };
        parties.push(ligne({ x: c.x - nrm.x * 5, y: c.y - nrm.y * 5 }, { x: c.x + nrm.x * 5, y: c.y + nrm.y * 5 }, C.code, 1.6));
      }
    });
  }

  // Points et noms (vers l'extérieur du quadrilatère)
  const centre = { x: tous.reduce((a, p) => a + p.x, 0) / 4, y: tous.reduce((a, p) => a + p.y, 0) / 4 };
  const pc = px(centre);
  visibles.forEach((p, i) => {
    const q = px(p);
    const d = { x: q.x - pc.x, y: q.y - pc.y };
    const n = Math.hypot(d.x, d.y) || 1;
    parties.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="3.2" fill="${C.encre}"/>`);
    parties.push(texteSvg(q.x + (d.x / n) * 13, q.y + (d.y / n) * 13, noms[i]!, { gras: true, taille: 14 }));
  });

  const etiquette = mode === "enonce" ? (masquerD ? "Repère avec les points A, B et C" : "Repère avec le quadrilatère ABCD") : "Quadrilatère ABCD avec ses codages";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(largeur)} ${f(hauteur)}" width="${f(largeur)}" style="display:block;margin:8px auto;max-width:100%;height:auto" role="img" aria-label="${etiquette}">${parties.join("")}</svg>`;
}
