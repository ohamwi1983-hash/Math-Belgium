import type { ExerciceChemins } from "../core6e/cheminsQuadrillage";

/**
 * Figures de `6gen106` (chaîne SVG autonome, sans identifiant interne : écran ET papier `enteteHtml`,
 * figure du corrigé). Couleurs littérales (impression), fond blanc. Quadrillage : traits fins, nœuds
 * marqués d'un petit disque (lisibles sur papier) ; A, B et P sur un disque plus gros avec une étiquette
 * à halo blanc ; P fermé (`eviter`) barré d'une croix. Le corrigé ajoute un chemin d'exemple en trait
 * épais orange.
 */

const ENCRE = "#1b1d22";
const GRILLE = "#868e96";
const CHEMIN = "#e8590c";
const FERME = "#c92a2a";
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

function etiquette(x: number, y: number, t: string, ancre = "middle"): string {
  return `<text x="${f1(x)}" y="${f1(y)}" font-size="15" font-weight="600" text-anchor="${ancre}" fill="${ENCRE}" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" paint-order="stroke" ${POLICE}>${t}</text>`;
}

interface Geo {
  s: number;
  x0: number;
  y0: number;
  L: number;
  H: number;
}
function geometrie(e: ExerciceChemins): Geo {
  const s = Math.min(42, Math.floor(250 / e.m), Math.floor(165 / e.n));
  const x0 = 30;
  const y0 = 34; // place pour l'étiquette « B » au-dessus du coin (rognée à 26 quand l'énoncé est replié)
  return { s, x0, y0, L: x0 * 2 + e.m * s, H: y0 + e.n * s + 30 };
}
/** Coordonnées écran du nœud (i colonnes à droite de A, j lignes au-dessus). */
const pt = (g: Geo, e: ExerciceChemins, i: number, j: number) => ({ x: g.x0 + i * g.s, y: g.y0 + (e.n - j) * g.s });

function base(e: ExerciceChemins, g: Geo): string {
  let c = "";
  for (let i = 0; i <= e.m; i++) {
    const a = pt(g, e, i, 0);
    const b = pt(g, e, i, e.n);
    c += `<line x1="${f1(a.x)}" y1="${f1(a.y)}" x2="${f1(b.x)}" y2="${f1(b.y)}" stroke="${GRILLE}" stroke-width="1.2"/>`;
  }
  for (let j = 0; j <= e.n; j++) {
    const a = pt(g, e, 0, j);
    const b = pt(g, e, e.m, j);
    c += `<line x1="${f1(a.x)}" y1="${f1(a.y)}" x2="${f1(b.x)}" y2="${f1(b.y)}" stroke="${GRILLE}" stroke-width="1.2"/>`;
  }
  for (let i = 0; i <= e.m; i++)
    for (let j = 0; j <= e.n; j++) {
      const p = pt(g, e, i, j);
      c += `<circle cx="${f1(p.x)}" cy="${f1(p.y)}" r="2.3" fill="${ENCRE}"/>`;
    }
  return c;
}

function points(e: ExerciceChemins, g: Geo): string {
  const A = pt(g, e, 0, 0);
  const B = pt(g, e, e.m, e.n);
  let c = `<circle cx="${f1(A.x)}" cy="${f1(A.y)}" r="4.6" fill="${ENCRE}"/><circle cx="${f1(B.x)}" cy="${f1(B.y)}" r="4.6" fill="${ENCRE}"/>`;
  c += etiquette(A.x - 9, A.y + 18, "A");
  c += etiquette(B.x + 9, B.y - 8, "B");
  if (e.variante !== "total") {
    const P = pt(g, e, e.px, e.py);
    if (e.variante === "eviter") {
      const d = 6;
      c += `<circle cx="${f1(P.x)}" cy="${f1(P.y)}" r="7.5" fill="#ffffff" stroke="${FERME}" stroke-width="1.8"/>`;
      c += `<line x1="${f1(P.x - d)}" y1="${f1(P.y - d)}" x2="${f1(P.x + d)}" y2="${f1(P.y + d)}" stroke="${FERME}" stroke-width="2.2"/><line x1="${f1(P.x - d)}" y1="${f1(P.y + d)}" x2="${f1(P.x + d)}" y2="${f1(P.y - d)}" stroke="${FERME}" stroke-width="2.2"/>`;
    } else c += `<circle cx="${f1(P.x)}" cy="${f1(P.y)}" r="4.6" fill="${ENCRE}"/>`;
    c += etiquette(P.x + 11, P.y - 9, "P", "start");
  }
  return c;
}

function svg(g: Geo, contenu: string, label: string): string {
  return `<svg class="figure-chemins" xmlns="http://www.w3.org/2000/svg" width="${g.L}" height="${g.H}" viewBox="0 0 ${g.L} ${g.H}" role="img" aria-label="${label}"><rect x="0" y="0" width="${g.L}" height="${g.H}" fill="#ffffff"/>${contenu}</svg>`;
}

function libelle(e: ExerciceChemins): string {
  const base = `Quadrillage de ${e.m} carreaux sur ${e.n}, de A en bas à gauche à B en haut à droite`;
  if (e.variante === "total") return base;
  return `${base}, nœud P à ${e.px} carreaux à droite et ${e.py} au-dessus de A${e.variante === "eviter" ? " (fermé)" : ""}`;
}

/** Figure de l'énoncé (écran et papier). */
export function figureChemins(e: ExerciceChemins): string {
  const g = geometrie(e);
  return svg(g, base(e, g) + points(e, g), libelle(e));
}

/** Figure du corrigé : le quadrillage et un chemin d'exemple (mot de « R » et « U »). */
export function figureCheminExemple(e: ExerciceChemins, mot: string): string {
  const g = geometrie(e);
  let i = 0;
  let j = 0;
  const pts = [pt(g, e, 0, 0)];
  for (const c of mot) {
    if (c === "R") i++;
    else j++;
    pts.push(pt(g, e, i, j));
  }
  const trace = `<polyline points="${pts.map((p) => `${f1(p.x)},${f1(p.y)}`).join(" ")}" fill="none" stroke="${CHEMIN}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" opacity="0.9"/>`;
  return svg(g, base(e, g) + trace + points(e, g), `${libelle(e)} ; un chemin d'exemple en orange`);
}

/** Mot du chemin en LaTeX : « \rightarrow\rightarrow\uparrow… ». */
export function motL(mot: string): string {
  return [...mot].map((c) => (c === "R" ? "\\rightarrow" : "\\uparrow")).join("\\,");
}
