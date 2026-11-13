import type { ExerciceChantierTerrains, PointPlan } from "../core/chantierTerrains.types";
import { PLAN } from "../generateurs/chantierTerrains";
import { point, vecteursUtiles } from "../moteur/modeleChantierTerrains";
import { contexte, type ObjetPlan } from "./formatChantierTerrains";

/**
 * Plan du terrain de gen88, vue de dessus : quadrillage d'un mètre (lignes appuyées tous les 5 m),
 * axes fléchés gradués en mètres, objets dessinés à leur position. Chaîne SVG AUTONOME :
 * - à l'écran (`dangerouslySetInnerHTML`), les couleurs suivent le thème (`var(--ink)`…) ;
 * - sur papier (corrigé, `EtapeCorrection.figureHtml` ; énoncé, `enteteHtml`), chaque `var(--x, #…)`
 *   a une valeur de repli littérale.
 * L'énoncé ne code RIEN (pas d'angle droit, pas de point cherché : une inconnue n'est pas dessinée) ;
 * le corrigé ajoute les vecteurs utiles et le point trouvé. Pointes de flèches dessinées en
 * polygones (aucun `id` partagé entre plusieurs figures d'un même document).
 */

// Les documents imprimés redéfinissent certains jetons (`--accent` y est bleu) : les deux couleurs
// des vecteurs du corrigé, qui doivent rester distinctes partout, sont donc littérales.
const C = {
  encre: "var(--ink, #1b1d22)",
  doux: "var(--ink-soft, #5c6370)",
  pale: "var(--ink-faint, #9aa3ad)",
  fond: "var(--surface, #ffffff)",
  accent: "#c0601f",
  accentDoux: "#f4e3d1",
  bon: "var(--good, #2f7a4f)",
  bonDoux: "var(--good-soft, #dcefe2)",
  ciel: "#2f6fb0",
  bois: "#8a5a2b",
  route: "#a9adb3",
};

const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const POLICE_MATH = `font-family="KaTeX_Main, 'Times New Roman', serif" font-style="italic"`;
const HALO = `stroke="${C.fond}" stroke-width="3" stroke-linejoin="round" paint-order="stroke"`;

const L = 360;
const MARGE = { g: 28, d: 16, h: 14, b: 26 };
const ECHELLE = (L - MARGE.g - MARGE.d) / (PLAN.xMax - PLAN.xMin);
const H = Math.round(MARGE.h + MARGE.b + ECHELLE * (PLAN.yMax - PLAN.yMin));

const sx = (x: number) => MARGE.g + (x - PLAN.xMin) * ECHELLE;
const sy = (y: number) => H - MARGE.b - (y - PLAN.yMin) * ECHELLE;
const f1 = (v: number) => (Math.round(v * 10) / 10).toString();

function quadrillage(): string {
  const m: string[] = [];
  for (let x = PLAN.xMin; x <= PLAN.xMax; x++) {
    const fort = x % 5 === 0;
    m.push(`<line x1="${f1(sx(x))}" y1="${f1(sy(PLAN.yMin))}" x2="${f1(sx(x))}" y2="${f1(sy(PLAN.yMax))}" stroke="${C.pale}" stroke-width="${fort ? 0.7 : 0.3}" stroke-opacity="${fort ? 0.8 : 0.55}"/>`);
  }
  for (let y = PLAN.yMin; y <= PLAN.yMax; y++) {
    const fort = y % 5 === 0;
    m.push(`<line x1="${f1(sx(PLAN.xMin))}" y1="${f1(sy(y))}" x2="${f1(sx(PLAN.xMax))}" y2="${f1(sy(y))}" stroke="${C.pale}" stroke-width="${fort ? 0.7 : 0.3}" stroke-opacity="${fort ? 0.8 : 0.55}"/>`);
  }
  // Axes fléchés.
  const x0 = sx(0);
  const y0 = sy(0);
  m.push(
    `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(sx(PLAN.xMax) + 9)}" y2="${f1(y0)}" stroke="${C.doux}" stroke-width="1.1"/>`,
    pointe(sx(PLAN.xMax) + 3, y0, sx(PLAN.xMax) + 11, y0, C.doux),
    `<line x1="${f1(x0)}" y1="${f1(y0)}" x2="${f1(x0)}" y2="${f1(sy(PLAN.yMax) - 9)}" stroke="${C.doux}" stroke-width="1.1"/>`,
    pointe(x0, sy(PLAN.yMax) - 3, x0, sy(PLAN.yMax) - 11, C.doux),
  );
  for (let x = 5; x <= PLAN.xMax; x += 5) {
    m.push(`<text x="${f1(sx(x))}" y="${f1(y0 + 13)}" font-size="10" text-anchor="middle" fill="${C.doux}" ${POLICE}>${x}</text>`);
  }
  for (let y = 5; y <= PLAN.yMax; y += 5) {
    m.push(`<text x="${f1(x0 - 4)}" y="${f1(sy(y) + 3.5)}" font-size="10" text-anchor="end" fill="${C.doux}" ${POLICE}>${y}</text>`);
  }
  m.push(
    `<text x="${f1(x0 - 4)}" y="${f1(y0 + 13)}" font-size="10" text-anchor="end" fill="${C.doux}" ${POLICE}>0</text>`,
    `<text x="${f1(sx(PLAN.xMax) - 2)}" y="${f1(y0 + 24)}" font-size="10" text-anchor="end" fill="${C.doux}" ${POLICE}>x (m)</text>`,
    `<text x="${f1(x0 + 6)}" y="${f1(sy(PLAN.yMax) - 2)}" font-size="10" fill="${C.doux}" ${POLICE}>y (m)</text>`,
  );
  return m.join("");
}

/** Pointe de flèche (triangle) au bout du segment (x1 ; y1) → (x2 ; y2), en pixels. */
function pointe(x1: number, y1: number, x2: number, y2: number, couleur: string, taille = 7): string {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p1 = [x2 - taille * Math.cos(a - 0.42), y2 - taille * Math.sin(a - 0.42)];
  const p2 = [x2 - taille * Math.cos(a + 0.42), y2 - taille * Math.sin(a + 0.42)];
  return `<polygon points="${f1(x2)},${f1(y2)} ${f1(p1[0]!)},${f1(p1[1]!)} ${f1(p2[0]!)},${f1(p2[1]!)}" fill="${couleur}"/>`;
}

/** Segment (en mètres) prolongé de `prolonge` mètres de chaque côté, borné au plan. */
function segmentProlonge(a: { x: number; y: number }, b: { x: number; y: number }, prolonge: number): [number, number, number, number] {
  const n = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / n;
  const uy = (b.y - a.y) / n;
  const borne = (p: { x: number; y: number }) => ({ x: Math.max(PLAN.xMin + 0.2, Math.min(PLAN.xMax - 0.2, p.x)), y: Math.max(PLAN.yMin + 0.2, Math.min(PLAN.yMax - 0.2, p.y)) });
  // On recule tant que l'extrémité prolongée sort du plan.
  let t1 = prolonge;
  while (t1 > 0 && (a.x - ux * t1 < PLAN.xMin + 0.2 || a.x - ux * t1 > PLAN.xMax - 0.2 || a.y - uy * t1 < PLAN.yMin + 0.2 || a.y - uy * t1 > PLAN.yMax - 0.2)) t1 -= 0.1;
  let t2 = prolonge;
  while (t2 > 0 && (b.x + ux * t2 < PLAN.xMin + 0.2 || b.x + ux * t2 > PLAN.xMax - 0.2 || b.y + uy * t2 < PLAN.yMin + 0.2 || b.y + uy * t2 > PLAN.yMax - 0.2)) t2 -= 0.1;
  const p = borne({ x: a.x - ux * Math.max(0, t1), y: a.y - uy * Math.max(0, t1) });
  const q = borne({ x: b.x + ux * Math.max(0, t2), y: b.y + uy * Math.max(0, t2) });
  return [p.x, p.y, q.x, q.y];
}

function ligne(a: { x: number; y: number }, b: { x: number; y: number }, couleur: string, epaisseur: number, extra = ""): string {
  return `<line x1="${f1(sx(a.x))}" y1="${f1(sy(a.y))}" x2="${f1(sx(b.x))}" y2="${f1(sy(b.y))}" stroke="${couleur}" stroke-width="${epaisseur}" stroke-linecap="round"${extra}/>`;
}

function objet(type: ObjetPlan, p: { x: number; y: number }): string {
  const x = sx(p.x);
  const y = sy(p.y);
  switch (type) {
    case "arbre":
      return `<circle cx="${f1(x)}" cy="${f1(y)}" r="7" fill="${C.bonDoux}" stroke="${C.bon}" stroke-width="1.4"/><circle cx="${f1(x)}" cy="${f1(y)}" r="1.8" fill="${C.bon}"/>`;
    case "poteau":
      return `<rect x="${f1(x - 3.5)}" y="${f1(y - 3.5)}" width="7" height="7" fill="${C.doux}" stroke="${C.encre}" stroke-width="0.8"/>`;
    case "maison":
      return `<rect x="${f1(x - 7)}" y="${f1(y - 7)}" width="14" height="14" fill="${C.accentDoux}" stroke="${C.accent}" stroke-width="1.3"/><path d="M${f1(x - 7)},${f1(y - 7)} L${f1(x + 7)},${f1(y + 7)} M${f1(x + 7)},${f1(y - 7)} L${f1(x - 7)},${f1(y + 7)}" stroke="${C.accent}" stroke-width="0.8"/>`;
    case "banc":
      return `<rect x="${f1(x - 6)}" y="${f1(y - 2.5)}" width="12" height="5" rx="1" fill="${C.bois}" stroke="${C.encre}" stroke-width="0.6"/>`;
    case "vigne":
      return `<circle cx="${f1(x)}" cy="${f1(y)}" r="3.6" fill="${C.bon}" stroke="${C.encre}" stroke-width="0.8"/>`;
    case "route":
    case "bordure":
    case "parterre":
      return `<circle cx="${f1(x)}" cy="${f1(y)}" r="3.4" fill="${C.fond}" stroke="${C.encre}" stroke-width="1.4"/>`;
    default:
      // Piquet, coin de dalle, de terrain, de mur, d'enclos.
      return `<circle cx="${f1(x)}" cy="${f1(y)}" r="3.6" fill="${C.bois}" stroke="${C.encre}" stroke-width="0.9"/>`;
  }
}

/** Étiquette d'un point, posée à l'opposé du centre de la figure (lisible, hors des tracés). */
function etiquette(p: PointPlan, centre: { x: number; y: number }, couleur = C.encre, direction?: { x: number; y: number }): string {
  let dx = direction ? direction.x : p.x - centre.x;
  let dy = direction ? direction.y : p.y - centre.y;
  const n = Math.hypot(dx, dy) || 1;
  dx /= n;
  dy /= n;
  let x = sx(p.x) + dx * 13;
  let y = sy(p.y) - dy * 13 + 4.5;
  x = Math.max(MARGE.g + 6, Math.min(L - MARGE.d - 4, x));
  y = Math.max(MARGE.h + 10, Math.min(H - MARGE.b - 4, y));
  return `<text x="${f1(x)}" y="${f1(y)}" font-size="13" font-weight="600" text-anchor="middle" fill="${couleur}" ${HALO} ${POLICE_MATH}>${p.nom}</text>`;
}

/** Vecteur dessiné (corrigé) avec son nom surmonté d'une flèche, au milieu du tracé. */
function vecteur(a: { x: number; y: number }, b: { x: number; y: number }, nom: string, couleur: string, cote: number, decalage: number, evite: { x: number; y: number }[]): string {
  const n0 = Math.hypot(sx(b.x) - sx(a.x), sy(b.y) - sy(a.y)) || 1;
  // Décalage parallèle (en pixels, du côté `cote`) : deux vecteurs portés par la même droite.
  const dx0 = (-(sy(b.y) - sy(a.y)) / n0) * cote * decalage;
  const dy0 = ((sx(b.x) - sx(a.x)) / n0) * cote * decalage;
  const x1 = sx(a.x) + dx0;
  const y1 = sy(a.y) + dy0;
  const x2 = sx(b.x) + dx0;
  const y2 = sy(b.y) + dy0;
  const n = n0;
  // Normale (côté choisi) pour poser le nom à côté du tracé.
  const nx = (-(y2 - y1) / n) * cote;
  const ny = ((x2 - x1) / n) * cote;
  // Position du nom le long du tracé : la plus éloignée des points et des noms déjà posés.
  let mx = 0;
  let my = 0;
  let meilleure = -1;
  for (const t of [0.5, 0.38, 0.62, 0.27, 0.73]) {
    const cx = x1 + (x2 - x1) * t + nx * 13;
    const cy = y1 + (y2 - y1) * t + ny * 13;
    const d = Math.min(Infinity, ...evite.map((q) => Math.hypot(q.x - cx, q.y - cy)));
    if (d > meilleure + 6) {
      meilleure = d;
      mx = cx;
      my = cy;
    }
  }
  evite.push({ x: mx, y: my });
  const largeur = nom.length * 7.5;
  return (
    `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2 - ((x2 - x1) / n) * 4)}" y2="${f1(y2 - ((y2 - y1) / n) * 4)}" stroke="${couleur}" stroke-width="2.2"/>` +
    pointe(x1, y1, x2, y2, couleur, 9) +
    `<text x="${f1(mx)}" y="${f1(my + 4)}" font-size="12" text-anchor="middle" fill="${couleur}" ${HALO} ${POLICE_MATH}>${nom}</text>` +
    `<line x1="${f1(mx - largeur / 2)}" y1="${f1(my - 7)}" x2="${f1(mx + largeur / 2)}" y2="${f1(my - 7)}" stroke="${couleur}" stroke-width="0.9"/>` +
    pointe(mx - largeur / 2, my - 7, mx + largeur / 2 + 1, my - 7, couleur, 4)
  );
}

/** Rangées parallèles : l'étiquette part perpendiculairement à sa rangée, du côté opposé à l'autre
 * rangée (sinon elle tombe sur le prolongement du tracé). */
function directionEtiquette(e: ExerciceChantierTerrains, p: PointPlan): { x: number; y: number } | undefined {
  if (e.situation === "milieu" && e.cherche && p.nom === e.cherche.nom) {
    // Le point trouvé est au centre de la figure : étiquette du côté opposé au vecteur AB décalé.
    const a = point(e, "A");
    const b = point(e, "B");
    return { x: -(b.y - a.y), y: b.x - a.x };
  }
  if (e.situation !== "paralleles" || !"ABCD".includes(p.nom)) return undefined;
  const [a, b] = p.nom === "A" || p.nom === "B" ? ["A", "B"] : ["C", "D"];
  const autre = p.nom === "A" || p.nom === "B" ? point(e, "C") : point(e, "A");
  const pa = point(e, a!);
  const pb = point(e, b!);
  const n = { x: -(pb.y - pa.y), y: pb.x - pa.x };
  const versAutre = n.x * (autre.x - pa.x) + n.y * (autre.y - pa.y);
  return versAutre > 0 ? { x: -n.x, y: -n.y } : n;
}

function centreDe(points: { x: number; y: number }[]): { x: number; y: number } {
  return { x: points.reduce((s, p) => s + p.x, 0) / points.length, y: points.reduce((s, p) => s + p.y, 0) / points.length };
}

/** Plan de l'énoncé (`corrige = false`) ou du corrigé (vecteurs utiles et point trouvé). */
export function figureChantierSvg(e: ExerciceChantierTerrains, corrige = false): string {
  const type = contexte(e).objet;
  const m: string[] = [quadrillage()];
  const P = (nom: string) => point(e, nom);
  const tous = [...e.points, ...(corrige && e.cherche ? [e.cherche] : [])];
  const centre = centreDe(tous);

  // Tracés de fond (bords, routes, rangées, clôtures).
  switch (e.situation) {
    case "equerre": {
      const couleur = type === "terrain" ? C.bon : type === "mur" ? C.encre : C.route;
      const ep = type === "terrain" ? 2.4 : type === "mur" ? 4.5 : 5.5;
      m.push(ligne(P("A"), P("B"), couleur, ep), ligne(P("A"), P("C"), couleur, ep));
      break;
    }
    case "paralleles":
      for (const [a, b] of [["A", "B"], ["C", "D"]] as const) {
        const [x1, y1, x2, y2] = segmentProlonge(P(a), P(b), 2.5);
        const p = { x: x1, y: y1 };
        const q = { x: x2, y: y2 };
        if (type === "route") {
          m.push(ligne(p, q, C.route, 9), ligne(p, q, C.fond, 1, ' stroke-dasharray="5 5"'));
        } else if (type === "vigne") {
          m.push(ligne(p, q, C.bon, 1, ' stroke-opacity="0.7"'));
          const n = Math.hypot(q.x - p.x, q.y - p.y);
          for (let t = 0; t <= n; t += 1.5) m.push(`<circle cx="${f1(sx(p.x + ((q.x - p.x) * t) / n))}" cy="${f1(sy(p.y + ((q.y - p.y) * t) / n))}" r="2" fill="${C.bon}" fill-opacity="0.75"/>`);
        } else {
          m.push(ligne(p, q, C.doux, 3));
        }
      }
      break;
    case "milieu":
      m.push(ligne(P("A"), P("B"), C.doux, 1.6, ' stroke-dasharray="6 4"'));
      break;
    case "enclos":
      m.push(ligne(P("A"), P("B"), type === "enclos" ? C.bois : C.bon, 2), ligne(P("B"), P("C"), type === "enclos" ? C.bois : C.bon, 2));
      if (corrige) {
        const d = e.cherche!;
        m.push(ligne(P("C"), d, type === "enclos" ? C.bois : C.bon, 1.6, ' stroke-dasharray="5 4"'), ligne(d, P("A"), type === "enclos" ? C.bois : C.bon, 1.6, ' stroke-dasharray="5 4"'));
      }
      break;
    case "piquet": {
      const l = e.ligne!;
      const a = l.axe === "x" ? { x: l.valeur, y: PLAN.yMin } : { x: PLAN.xMin, y: l.valeur };
      const b = l.axe === "x" ? { x: l.valeur, y: PLAN.yMax } : { x: PLAN.xMax, y: l.valeur };
      if (type === "arbre") m.push(ligne(a, b, C.route, 7, ' stroke-opacity="0.75"'));
      else m.push(ligne(a, b, C.bois, 2.2, ' stroke-dasharray="7 3"'));
      const nom = type === "arbre" ? "chemin" : "clôture";
      const tx = l.axe === "x" ? sx(l.valeur) + 5 : sx(PLAN.xMax) - 4;
      const ty = l.axe === "x" ? sy(PLAN.yMax) + 12 : sy(l.valeur) - 7;
      m.push(`<text x="${f1(tx)}" y="${f1(ty)}" font-size="10.5" text-anchor="${l.axe === "x" ? "start" : "end"}" fill="${C.doux}" ${HALO} ${POLICE}>${nom}</text>`);
      if (corrige) {
        const [x1, y1, x2, y2] = segmentProlonge(P("A"), e.cherche!, 2);
        m.push(ligne({ x: x1, y: y1 }, { x: x2, y: y2 }, C.doux, 1.2, ' stroke-dasharray="4 3"'));
      }
      break;
    }
    default:
      break;
  }

  // Vecteurs du corrigé.
  if (corrige) {
    const [u, v] = vecteursUtiles(e);
    // Points (et leurs étiquettes, à peu près) à éviter pour les noms des vecteurs.
    const evite = tous.map((q) => ({ x: sx(q.x), y: sy(q.y) }));
    const couleurs = [C.accent, C.ciel];
    if (e.situation === "enclos") {
      m.push(vecteur(P("A"), P("B"), "AB", C.accent, -1, 0, evite), vecteur(e.cherche!, P("C"), "DC", C.ciel, 1, 0, evite));
    } else if (e.situation === "milieu") {
      m.push(vecteur(P("A"), P("B"), "AB", C.accent, 1, 9, evite), vecteur(P("A"), e.cherche!, `A${e.cherche!.nom}`, C.ciel, -1, 0, evite));
    } else {
      // Vecteurs portés par la même droite (points alignés, piquet) : le premier est décalé.
      const memeDroite = (e.situation === "alignement" && e.verdict === true) || e.situation === "piquet";
      [u, v].forEach((w, i) => {
        if (!w) return;
        const extremite = w.extremite === "P" ? e.cherche! : P(w.extremite);
        m.push(vecteur(P(w.origine), extremite, `${w.origine}${w.extremite}`, couleurs[i]!, i === 0 ? 1 : -1, memeDroite && i === 0 ? 9 : 0, evite));
      });
    }
  }

  // Objets et étiquettes par-dessus.
  for (const p of e.points) m.push(objet(type, p));
  if (corrige && e.cherche) {
    m.push(objet(type, e.cherche));
    m.push(`<circle cx="${f1(sx(e.cherche.x))}" cy="${f1(sy(e.cherche.y))}" r="9" fill="none" stroke="${C.ciel}" stroke-width="1.4"/>`);
  }
  for (const p of tous) m.push(etiquette(p, centre, corrige && p === e.cherche ? C.ciel : C.encre, directionEtiquette(e, p)));

  const titre = corrige ? "Plan du terrain avec les vecteurs utiles" : "Plan du terrain, repéré en mètres";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${H}" width="100%" style="max-width:${L + 80}px;display:block;margin:0 auto" role="img" aria-label="${titre}">${m.join("")}</svg>`;
}
