import { HAUTEUR_GRILLE, LARGEUR_GRILLE, type ExercicePointFuite, type PointNommeFuite, type Pt, type SceneFuite, type SegmentFuite } from "../core/pointFuite.types";
import { distance, distanceSegment, droiteDansCadre } from "../generateurs/pointFuite/geometrieFuite";

/**
 * Figures SVG de gen105 (« Perspective centrale : point de fuite ») — UNE source pour l'écran (insérée
 * telle quelle, couleurs du thème par variables CSS) et le papier (couleurs littérales du thème clair).
 *
 * La figure est la vitre quadrillée de Dürer : quadrillage léger d'un carreau par unité, ligne
 * d'horizon en pointillé, objets dessinés en perspective centrale (arêtes en noir, arêtes cachées en
 * pointillé, poteaux en trait épais), fuyantes données en orange fin, prolongements de construction
 * en pointillé orange, points de fuite en orange, points construits en vert. Les tracés de l'élève
 * (outils « droite », « horizontale », « verticale ») sont en violet, le point qu'il place en orange
 * avec un halo ; la correction (droites qui portent le point, point attendu) en vert.
 *
 * Cadre FIXE (tout le quadrillage) pour tout l'exercice et sur papier : la figure ne saute jamais.
 * Les étiquettes sont placées une fois pour toutes sur la scène COMPLÈTE (énoncé + points construits),
 * pour ne pas bouger d'un écran à l'autre. Aucun identifiant SVG (pas de `<defs>`).
 */

export const UNITE = 34;
export const MARGE_FIGURE = 14;
export const LARGEUR_FIGURE = LARGEUR_GRILLE * UNITE + 2 * MARGE_FIGURE;
export const HAUTEUR_FIGURE = HAUTEUR_GRILLE * UNITE + 2 * MARGE_FIGURE;

export type ModeFigureFuite = "ecran" | "papier";

export interface Px {
  x: number;
  y: number;
}

export function pixel(p: Pt): Px {
  return { x: MARGE_FIGURE + p.x * UNITE, y: MARGE_FIGURE + (HAUTEUR_GRILLE - p.y) * UNITE };
}

export function versModele(px: Px): Pt {
  return { x: (px.x - MARGE_FIGURE) / UNITE, y: HAUTEUR_GRILLE - (px.y - MARGE_FIGURE) / UNITE };
}

interface Couleurs {
  encre: string;
  doux: string;
  grille: string;
  orange: string;
  vert: string;
  rouge: string;
  violet: string;
  bleu: string;
  fond: string;
}

function couleurs(mode: ModeFigureFuite): Couleurs {
  return mode === "ecran"
    ? {
        encre: "var(--ink, #1b1c2b)",
        doux: "var(--ink-soft, #51626f)",
        grille: "var(--ink-faint, #8a97a1)",
        orange: "var(--accent, #b65c1f)",
        vert: "var(--good, #2f7a4f)",
        rouge: "var(--bad, #b3261e)",
        violet: "var(--plan, #5b4ea3)",
        bleu: "var(--sky, #2f6fb0)",
        fond: "var(--surface, #ffffff)",
      }
    : { encre: "#1b1c2b", doux: "#51626f", grille: "#9aa4ae", orange: "#b65c1f", vert: "#2f7a4f", rouge: "#b3261e", violet: "#5b4ea3", bleu: "#2f6fb0", fond: "#ffffff" };
}

/** Droite tracée sur toute la figure (outil de l'élève, ou correction). */
export interface LigneFigureFuite {
  a: Pt;
  b: Pt;
  ton: "eleve" | "correction";
}

/** Point placé par l'élève, ou point attendu (correction). */
export interface MarqueFigureFuite {
  p: Pt;
  nom: string;
  ton: "eleve" | "faux" | "attendu";
}

export interface OptionsFigureFuite {
  mode: ModeFigureFuite;
  horizon: number;
  scene: SceneFuite;
  /** Scène qui fixe la place des étiquettes (la scène complète de l'exercice). */
  sceneEtiquettes?: SceneFuite;
  lignes?: LigneFigureFuite[];
  marques?: MarqueFigureFuite[];
  /** Points nommés entourés (sélection en cours de l'outil « droite »). */
  selection?: string[];
}

/** Scène complète de l'exercice : énoncé, puis ce qu'ajoute chaque écran clos. */
export function sceneComplete(e: ExercicePointFuite, ecransClos = 2): SceneFuite {
  const ajouts = e.etapes.slice(0, ecransClos).map((et) => et.ajout);
  return {
    points: [...e.base.points, ...ajouts.flatMap((a) => a.points)],
    segments: [...e.base.segments, ...ajouts.flatMap((a) => a.segments)],
  };
}

const f = (v: number) => v.toFixed(1);

function ligneSvg(a: Px, b: Px, stroke: string, largeur: number, pointille: string | null, opacite = 1): string {
  const dash = pointille ? ` stroke-dasharray="${pointille}"` : "";
  const op = opacite < 1 ? ` stroke-opacity="${opacite}"` : "";
  return `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${stroke}" stroke-width="${largeur}" stroke-linecap="round"${dash}${op}/>`;
}

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const DIRECTIONS: Px[] = [
  { x: 1, y: -1 },
  { x: -1, y: -1 },
  { x: 1, y: 1 },
  { x: -1, y: 1 },
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
];

/** Place les étiquettes : pour chaque point, la direction (8 possibles) la plus éloignée des traits,
 * des autres points et des étiquettes déjà placées, sans sortir du cadre. */
export function placerEtiquettes(scene: SceneFuite, horizon: number): Map<string, Px> {
  const segs: [Px, Px][] = scene.segments.map((s) => [pixel(s.a), pixel(s.b)]);
  segs.push([pixel({ x: 0, y: horizon }), pixel({ x: LARGEUR_GRILLE, y: horizon })]);
  // L'étiquette « ligne d'horizon » est un obstacle pour les étiquettes des points.
  const h = etiquetteHorizon(scene, horizon);
  segs.push([{ x: h.x, y: h.y - 4 }, { x: h.x + 82, y: h.y - 4 }]);
  const pts = scene.points.map((p) => ({ nom: p.nom, px: pixel(p.p) }));
  const places = new Map<string, Px>();
  for (const p of pts) {
    let meilleur: Px | null = null;
    let score = -Infinity;
    DIRECTIONS.forEach((d, rang) => {
      const n = Math.hypot(d.x, d.y);
      const c = { x: p.px.x + (d.x / n) * 15, y: p.px.y + (d.y / n) * 15 + 4 };
      if (c.x < 8 || c.x > LARGEUR_FIGURE - 8 || c.y < 12 || c.y > HAUTEUR_FIGURE - 4) return;
      let m = Infinity;
      for (const [a, b] of segs) m = Math.min(m, distanceSegment(a, b, { x: c.x, y: c.y - 4 }));
      for (const q of pts) if (q.nom !== p.nom) m = Math.min(m, distance(q.px, c) - 2);
      for (const l of places.values()) m = Math.min(m, distance(l, c) * 0.8);
      const s = Math.min(m, 14) - rang * 0.05;
      if (s > score) {
        score = s;
        meilleur = c;
      }
    });
    places.set(p.nom, meilleur ?? { x: p.px.x + 10, y: p.px.y - 8 });
  }
  return places;
}

/** Étiquette « ligne d'horizon » : à un bout de la ligne, au-dessus ou au-dessous, là où elle est
 * la plus éloignée des traits et des points de la scène complète (jamais sur un objet). */
function etiquetteHorizon(scene: SceneFuite, horizon: number): { x: number; y: number; ancre: "start" | "end"; bout: boolean } {
  const y0 = pixel({ x: 0, y: horizon }).y;
  const segs: [Px, Px][] = scene.segments.map((s) => [pixel(s.a), pixel(s.b)]);
  const pts = scene.points.map((p) => pixel(p.p));
  const LARGEUR_TEXTE = 82;
  const gauche = MARGE_FIGURE + 4;
  const droite = LARGEUR_FIGURE - MARGE_FIGURE - 4;
  const candidats: { x: number; y: number; ancre: "start" | "end"; bout: boolean }[] = [];
  for (const y of [y0 - 5, y0 + 14]) {
    for (let x = gauche; x <= droite - LARGEUR_TEXTE + 0.1; x += (droite - LARGEUR_TEXTE - gauche) / 8) {
      const bout = x === gauche || x >= droite - LARGEUR_TEXTE - 0.5;
      candidats.push({ x, y, ancre: "start", bout });
    }
  }
  let meilleur = candidats[0]!;
  let score = -Infinity;
  for (const cand of candidats) {
    let m = Infinity;
    for (let k = 0; k <= LARGEUR_TEXTE; k += 6) {
      for (const dy of [-8, -1]) {
        const q = { x: cand.x + k, y: cand.y + dy };
        for (const [a, b] of segs) m = Math.min(m, distanceSegment(a, b, q));
        for (const pp of pts) m = Math.min(m, distance(pp, q) - 12);
      }
    }
    // Plafonné : au-delà de 6 px, toute place convient ; les bouts de la ligne sont nettement préférés
    // (jamais l'étiquette au milieu d'un objet quand un bout est libre).
    const s = Math.min(m, 6) + (cand.bout ? 3 : 0) + (cand.y < y0 ? 0.2 : 0);
    if (s > score) {
      score = s;
      meilleur = cand;
    }
  }
  return meilleur;
}

function styleSegment(s: SegmentFuite, c: Couleurs): string {
  const a = pixel(s.a);
  const b = pixel(s.b);
  switch (s.style) {
    case "trait":
      return ligneSvg(a, b, c.encre, 1.8, null);
    case "cache":
      return ligneSvg(a, b, c.doux, 1.4, "5 4");
    case "objet":
      return ligneSvg(a, b, c.encre, 3.4, null);
    case "fuyante":
      return ligneSvg(a, b, c.orange, 1.4, null);
    case "aide":
      return ligneSvg(a, b, c.orange, 1.2, "4 4");
  }
}

function couleurPoint(p: PointNommeFuite, c: Couleurs): string {
  return p.role === "fuite" ? c.orange : p.role === "construit" ? c.vert : c.encre;
}

export function figurePointFuiteSvg(o: OptionsFigureFuite): string {
  const c = couleurs(o.mode);
  const morceaux: string[] = [];
  // Fond et quadrillage (la vitre quadrillée)
  morceaux.push(`<rect x="0" y="0" width="${LARGEUR_FIGURE}" height="${HAUTEUR_FIGURE}" fill="${c.fond}"/>`);
  for (let i = 0; i <= LARGEUR_GRILLE; i++) morceaux.push(ligneSvg(pixel({ x: i, y: 0 }), pixel({ x: i, y: HAUTEUR_GRILLE }), c.grille, 0.6, null, o.mode === "ecran" ? 0.35 : 0.6));
  for (let j = 0; j <= HAUTEUR_GRILLE; j++) morceaux.push(ligneSvg(pixel({ x: 0, y: j }), pixel({ x: LARGEUR_GRILLE, y: j }), c.grille, 0.6, null, o.mode === "ecran" ? 0.35 : 0.6));
  // Ligne d'horizon, étiquetée du côté opposé au premier point de fuite
  const gauche = pixel({ x: 0, y: o.horizon });
  const droite = pixel({ x: LARGEUR_GRILLE, y: o.horizon });
  morceaux.push(ligneSvg(gauche, droite, c.doux, 1.4, "7 5"));
  const placeHorizon = etiquetteHorizon(o.sceneEtiquettes ?? o.scene, o.horizon);
  morceaux.push(
    `<text x="${f(placeHorizon.x)}" y="${f(placeHorizon.y)}" text-anchor="${placeHorizon.ancre}" font-size="11" font-style="italic" fill="${c.doux}" stroke="${c.fond}" stroke-width="3" paint-order="stroke">ligne d'horizon</text>`,
  );
  // Objets
  for (const s of o.scene.segments) morceaux.push(styleSegment(s, c));
  // Tracés (élève, correction)
  for (const l of o.lignes ?? []) {
    const cl = droiteDansCadre(l.a, l.b);
    if (!cl) continue;
    morceaux.push(l.ton === "eleve" ? ligneSvg(pixel(cl[0]), pixel(cl[1]), c.violet, 1.5, null, 0.9) : ligneSvg(pixel(cl[0]), pixel(cl[1]), c.vert, 1.8, "6 4"));
  }
  // Points nommés
  const etiquettes = placerEtiquettes(o.sceneEtiquettes ?? o.scene, o.horizon);
  for (const p of o.scene.points) {
    const q = pixel(p.p);
    const coul = couleurPoint(p, c);
    if ((o.selection ?? []).includes(p.nom)) morceaux.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="9" fill="${c.bleu}" fill-opacity="0.18" stroke="${c.bleu}" stroke-width="2"/>`);
    morceaux.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="${p.role === "donne" ? 3.2 : 4}" fill="${coul}"/>`);
    const e = etiquettes.get(p.nom) ?? { x: q.x + 10, y: q.y - 8 };
    morceaux.push(
      `<text x="${f(e.x)}" y="${f(e.y)}" text-anchor="middle" font-size="14" font-weight="700" font-style="italic" fill="${coul}" stroke="${c.fond}" stroke-width="3" paint-order="stroke">${echapper(p.nom)}</text>`,
    );
  }
  // Marques (point de l'élève, point attendu)
  for (const m of o.marques ?? []) {
    const q = pixel(m.p);
    const coul = m.ton === "eleve" ? c.orange : m.ton === "faux" ? c.rouge : c.vert;
    if (m.ton === "attendu") {
      morceaux.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="8" fill="none" stroke="${coul}" stroke-width="2.4"/>`);
      morceaux.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="3.5" fill="${coul}"/>`);
    } else {
      morceaux.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="16" fill="${coul}" fill-opacity="0.12"/>`);
      morceaux.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="5" fill="${coul}" stroke="${c.fond}" stroke-width="1.5"/>`);
    }
    if (m.nom) {
      const droiteLibre = q.x < LARGEUR_FIGURE - 40;
      morceaux.push(
        `<text x="${f(q.x + (droiteLibre ? 12 : -12))}" y="${f(q.y - 10)}" text-anchor="${droiteLibre ? "start" : "end"}" font-size="14" font-weight="700" font-style="italic" fill="${coul}" stroke="${c.fond}" stroke-width="3" paint-order="stroke">${echapper(m.nom)}</text>`,
      );
    }
  }
  const style = o.mode === "ecran" ? ' style="display:block;width:100%;height:auto"' : ' style="display:block;width:100%;max-width:420px;height:auto;margin:6px auto"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LARGEUR_FIGURE} ${HAUTEUR_FIGURE}" role="img" aria-label="Dessin en perspective centrale sur une vitre quadrillée"${style}>${morceaux.join("")}</svg>`;
}
