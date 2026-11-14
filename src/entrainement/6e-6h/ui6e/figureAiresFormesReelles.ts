import type { ExerciceAiresFormesReelles, ExerciceMurFormesReelles, ExerciceParcelleFormesReelles, ExerciceSectionFormesReelles, ExerciceVitrailFormesReelles } from "../core6e/airesFormesReelles.types";
import { arcExercice, bornesArc, bornesCorrige, fonctionArc, fonctionParcelle, fonctionsVitrail } from "../moteur6e/modeleAiresFormesReelles";
import { COULEURS, etiquetteNombre, fenetreY, repereSvg } from "./figureRepereIntegrales";
import type { CourbeRepere, RegionRepere, SegmentRepere } from "./figureRepereIntegrales";

/**
 * Figures de `6gen81` « Aires de formes réelles ».
 * - `schemaEnonceSvg` : schéma de l'objet (mur, vitrail, section, parcelle) avec ses cotes ; le
 *   repère n'y est superposé QUE si la fonction est donnée (sinon l'élève le choisit). Rien n'y
 *   trahit la réponse (ni aire, ni bornes dans les unités du repère).
 * - `figureCorrigeSvg` : repère, courbe(s) et aire colorée — à l'écran de fin et en `figureHtml`
 *   du corrigé papier (repère commun `figureRepereIntegrales.ts`).
 * Chaînes SVG autonomes : couleurs du thème avec valeurs de repli pour l'impression.
 */

const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
const HALO = `stroke="var(--surface, #ffffff)" stroke-width="3" stroke-linejoin="round" paint-order="stroke"`;

function f1(v: number): string {
  return Number.isFinite(v) ? v.toFixed(1) : "0";
}

function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/-/g, "−");
}

/** Nombre en texte (virgule décimale). */
function nb(v: number): string {
  const r = Math.round(v * 1000) / 1000;
  return `${r}`.replace(".", ",").replace("-", "−");
}

/** Petit hachage (djb2) : identifiants SVG déterministes. Le schéma est l'`enteteHtml` de l'énoncé
 * papier, qui entre dans l'empreinte anti-doublon des évaluations : un compteur global le rendrait
 * différent à chaque appel et laisserait passer deux exercices identiques. */
function hacher(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

/** Petite toile à échelle uniforme (exagération verticale si l'objet est très plat). */
class Toile {
  readonly id = "__ID__";
  readonly parts: string[] = [];
  readonly L: number;
  readonly H: number;
  private readonly kx: number;
  private readonly ky: number;

  private readonly xMin: number;
  private readonly yMax: number;
  private readonly marge: { g: number; d: number; h: number; b: number };

  constructor(xMin: number, xMax: number, yMin: number, yMax: number, marge: { g: number; d: number; h: number; b: number }, largeur = 340) {
    this.xMin = xMin;
    this.yMax = yMax;
    this.marge = marge;
    this.L = largeur;
    this.kx = (largeur - marge.g - marge.d) / (xMax - xMin);
    const hauteurNaturelle = (yMax - yMin) * this.kx;
    this.ky = hauteurNaturelle < 90 ? 90 / (yMax - yMin) : hauteurNaturelle > 230 ? 230 / (yMax - yMin) : this.kx;
    this.H = marge.h + marge.b + (yMax - yMin) * this.ky;
    this.parts.push(
      `<defs><marker id="${this.id}fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COULEURS.doux}"/></marker>` +
        `<marker id="${this.id}co" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="${COULEURS.encre}"/></marker></defs>`,
    );
  }

  sx(x: number): number {
    return this.marge.g + (x - this.xMin) * this.kx;
  }
  sy(y: number): number {
    return this.marge.h + (this.yMax - y) * this.ky;
  }

  chemin(fn: (x: number) => number, de: number, a: number, n = 80): string[] {
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
      const x = de + ((a - de) * i) / n;
      pts.push(`${f1(this.sx(x))},${f1(this.sy(fn(x)))}`);
    }
    return pts;
  }

  /** Région entre deux fonctions sur [de ; a]. */
  region(haut: (x: number) => number, bas: (x: number) => number, de: number, a: number, remplissage: string, contour = "none"): void {
    const pts = [...this.chemin(haut, de, a), ...this.chemin(bas, de, a).reverse()];
    this.parts.push(`<polygon points="${pts.join(" ")}" fill="${remplissage}" stroke="${contour}" stroke-width="1.2"/>`);
  }

  courbe(fn: (x: number) => number, de: number, a: number, couleur: string, epaisseur = 2): void {
    this.parts.push(`<polyline points="${this.chemin(fn, de, a).join(" ")}" fill="none" stroke="${couleur}" stroke-width="${epaisseur}" stroke-linejoin="round"/>`);
  }

  segment(x1: number, y1: number, x2: number, y2: number, couleur: string, opts: { epaisseur?: number; pointilles?: boolean } = {}): void {
    this.parts.push(
      `<line x1="${f1(this.sx(x1))}" y1="${f1(this.sy(y1))}" x2="${f1(this.sx(x2))}" y2="${f1(this.sy(y2))}" stroke="${couleur}" stroke-width="${opts.epaisseur ?? 1.4}"${opts.pointilles ? ' stroke-dasharray="4 3"' : ""}/>`,
    );
  }

  texte(x: number, y: number, s: string, opts: { ancre?: "start" | "middle" | "end"; dx?: number; dy?: number; couleur?: string; italique?: boolean; taille?: number } = {}): void {
    this.parts.push(
      `<text x="${f1(this.sx(x) + (opts.dx ?? 0))}" y="${f1(this.sy(y) + (opts.dy ?? 0))}" font-size="${opts.taille ?? 12}" text-anchor="${opts.ancre ?? "middle"}" fill="${opts.couleur ?? COULEURS.encre}"${opts.italique ? ' font-style="italic"' : ""} ${HALO} ${POLICE}>${echapper(s)}</text>`,
    );
  }

  /** Cote horizontale entre x1 et x2, décalée de `dyPx` pixels sous (dy > 0) ou sur (dy < 0) y. */
  coteH(x1: number, x2: number, y: number, etiquette: string, dyPx: number): void {
    const yy = this.sy(y) + dyPx;
    this.parts.push(
      `<line x1="${f1(this.sx(x1))}" y1="${f1(yy)}" x2="${f1(this.sx(x2))}" y2="${f1(yy)}" stroke="${COULEURS.encre}" stroke-width="1" marker-start="url(#${this.id}co)" marker-end="url(#${this.id}co)"/>`,
      `<text x="${f1((this.sx(x1) + this.sx(x2)) / 2)}" y="${f1(yy - 4)}" font-size="12" text-anchor="middle" fill="${COULEURS.encre}" ${HALO} ${POLICE}>${echapper(etiquette)}</text>`,
    );
  }

  /** Cote verticale entre y1 et y2 à l'abscisse x (+ dxPx pixels), étiquette à gauche ou à droite. */
  coteV(x: number, y1: number, y2: number, etiquette: string, dxPx: number, cote: "gauche" | "droite"): void {
    const xx = this.sx(x) + dxPx;
    this.parts.push(
      `<line x1="${f1(xx)}" y1="${f1(this.sy(y1))}" x2="${f1(xx)}" y2="${f1(this.sy(y2))}" stroke="${COULEURS.encre}" stroke-width="1" marker-start="url(#${this.id}co)" marker-end="url(#${this.id}co)"/>`,
      `<text x="${f1(xx + (cote === "gauche" ? -5 : 5))}" y="${f1((this.sy(y1) + this.sy(y2)) / 2 + 4)}" font-size="12" text-anchor="${cote === "gauche" ? "end" : "start"}" fill="${COULEURS.encre}" ${HALO} ${POLICE}>${echapper(etiquette)}</text>`,
    );
  }

  /** Axes du repère donné, d'origine (ox ; oy) dans les coordonnées du schéma. */
  axes(ox: number, oy: number, xDe: number, xA: number, yDe: number, yA: number): void {
    this.parts.push(
      `<line x1="${f1(this.sx(xDe))}" y1="${f1(this.sy(oy))}" x2="${f1(this.sx(xA))}" y2="${f1(this.sy(oy))}" stroke="${COULEURS.doux}" stroke-width="1.1" marker-end="url(#${this.id}fl)"/>`,
      `<line x1="${f1(this.sx(ox))}" y1="${f1(this.sy(yDe))}" x2="${f1(this.sx(ox))}" y2="${f1(this.sy(yA))}" stroke="${COULEURS.doux}" stroke-width="1.1" marker-end="url(#${this.id}fl)"/>`,
    );
    this.texte(xA, oy, "x", { dx: -2, dy: 15, couleur: COULEURS.doux, italique: true, ancre: "end" });
    this.texte(ox, yA, "y", { dx: 6, dy: 10, couleur: COULEURS.doux, italique: true, ancre: "start" });
    this.texte(ox, oy, "O", { dx: -5, dy: 14, couleur: COULEURS.doux, ancre: "end" });
  }

  svg(libelle: string): string {
    const corps = this.parts.join("");
    const id = `afr${hacher(corps + libelle)}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.L} ${f1(this.H)}" width="${this.L}" height="${f1(this.H)}" style="max-width:100%;height:auto" role="img" aria-label="${echapper(libelle)}">${corps.split("__ID__").join(id)}</svg>`;
  }
}

// ============================================================================
// Schémas de l'énoncé.
// ============================================================================

function schemaMur(e: ExerciceMurFormesReelles): string {
  const { L, h, k } = e;
  const donnee = e.modele === "donnee";
  const toile = new Toile(-0.12 * L, L * 1.12, 0, h + k + (donnee ? 0.25 * (h + k) : 0.05 * (h + k)), { g: 30, d: 34, h: 10, b: 30 });
  const arc = (x: number) => h + (4 * k * x * (L - x)) / (L * L);
  toile.region(() => h, () => 0, 0, L, COULEURS.cielDoux, COULEURS.ciel);
  toile.region(arc, () => h, 0, L, COULEURS.accentDoux, COULEURS.accent);
  toile.segment(-0.1 * L, 0, 1.1 * L, 0, COULEURS.doux, { epaisseur: 2 });
  toile.coteH(0, L, 0, `${nb(L)} m`, 20);
  toile.coteV(0, 0, h, `${nb(h)} m`, -12, "gauche");
  if (donnee) {
    const ox = e.repere === "pied" ? 0 : L / 2;
    toile.axes(ox, h, -0.1 * L, 1.1 * L, h - 0.3 * (h + k), h + k + 0.22 * (h + k));
    toile.texte(0.82 * L, arc(0.82 * L), "f", { dx: 10, dy: -4, couleur: COULEURS.accent, italique: true, ancre: "start" });
  } else {
    toile.segment(L / 2, h, L / 2, h + k, COULEURS.doux, { pointilles: true });
    toile.coteV(L, h, h + k, `${nb(k)} m`, 12, "droite");
    toile.segment(L / 2, h + k, L, h + k, COULEURS.pale, { pointilles: true, epaisseur: 1 });
  }
  return toile.svg("Mur rectangulaire surmonté d'un fronton en arc de parabole, avec ses dimensions");
}

function schemaVitrail(e: ExerciceVitrailFormesReelles): string {
  const { W, H } = e;
  const { f, g } = fonctionsVitrail(e);
  const x1 = e.m - Math.sqrt(e.s);
  const x2 = e.m + Math.sqrt(e.s);
  const toile = new Toile(-0.08 * W, W * 1.12, -0.04 * H, H * 1.1, { g: 22, d: 40, h: 8, b: 28 });
  toile.region(() => H, () => 0, 0, W, COULEURS.cielDoux, COULEURS.doux);
  toile.region(f, g, x1, x2, COULEURS.mauvaisDoux, COULEURS.mauvais);
  toile.axes(0, 0, -0.06 * W, 1.1 * W, -0.03 * H, 1.08 * H);
  toile.texte(e.m, f(e.m), "f", { dy: -6, couleur: COULEURS.mauvais, italique: true });
  toile.texte(e.m, g(e.m), "g", { dy: -5, couleur: COULEURS.mauvais, italique: true });
  toile.coteH(0, W, 0, `${nb(W)} dm`, 22);
  toile.coteV(W, 0, H, `${nb(H)} dm`, 12, "droite");
  return toile.svg("Vitrail rectangulaire avec une lentille de verre rouge entre deux arcs de parabole");
}

function schemaSection(e: ExerciceSectionFormesReelles): string {
  const { W, D } = e;
  const u = e.contexte === "gouttiere" ? "cm" : "m";
  const haut = e.contexte === "tunnel";
  const donnee = e.modele === "donnee";
  const yMin = haut ? -0.1 * D : -D * 1.12;
  const yMax = haut ? D * (donnee ? 1.3 : 1.12) : D * (donnee ? 0.5 : 0.35);
  const toile = new Toile(-0.18 * W, W * 1.18, yMin, yMax, { g: 22, d: 46, h: 10, b: haut ? 30 : 12 });
  const arc = (x: number) => (haut ? 1 : -1) * ((4 * D * x * (W - x)) / (W * W));
  const remplissage = e.contexte === "tunnel" ? COULEURS.accentDoux : COULEURS.cielDoux;
  const contour = e.contexte === "tunnel" ? COULEURS.accent : COULEURS.ciel;
  toile.region(arc, () => 0, 0, W, remplissage, contour);
  toile.segment(-0.16 * W, 0, 0, 0, COULEURS.doux, { epaisseur: 2.4 });
  toile.segment(W, 0, 1.16 * W, 0, COULEURS.doux, { epaisseur: 2.4 });
  // Fonction donnée : pas de cote (la largeur se trouve en résolvant f(x) = 0).
  if (!donnee && haut) toile.coteH(0, W, 0, `${nb(W)} ${u}`, 20);
  else if (!donnee) toile.coteH(0, W, 0, `${nb(W)} ${u}`, -8);
  if (donnee) {
    const ox = e.repere === "pied" ? 0 : W / 2;
    toile.axes(ox, 0, -0.16 * W, 1.16 * W, haut ? -0.08 * D : -1.08 * D, haut ? 1.25 * D : 0.45 * D);
    toile.texte(0.8 * W, arc(0.8 * W), "f", { dx: 8, dy: haut ? -4 : 12, couleur: contour, italique: true, ancre: "start" });
  } else {
    toile.segment(W / 2, 0, W / 2, haut ? D : -D, COULEURS.doux, { pointilles: true });
    toile.coteV(W, 0, haut ? D : -D, `${nb(D)} ${u}`, 14, "droite");
    toile.segment(W / 2, haut ? D : -D, W + 0.05 * W, haut ? D : -D, COULEURS.pale, { pointilles: true, epaisseur: 1 });
  }
  const nom = e.contexte === "canal" ? "Section d'un canal" : e.contexte === "tunnel" ? "Section d'un tunnel" : "Section d'une gouttière";
  return toile.svg(`${nom} en arc de parabole, avec ses dimensions`);
}

function schemaParcelle(e: ExerciceParcelleFormesReelles): string {
  const f = fonctionParcelle(e);
  const xMax = Math.max(e.b, 2 * e.m) + 0.8;
  const yHaut = Math.max(f(0), f(e.m), f(xMax)) * 1.15;
  const donnee = e.modele === "donnee";
  const lignes = donnee ? 2 : 3;
  const toile = new Toile(-0.9, xMax, -0.05 * yHaut, yHaut, { g: 22, d: 14, h: 18, b: 12 + 22 * lignes });
  toile.region(f, () => 0, e.a, e.b, COULEURS.bonDoux, COULEURS.bon);
  toile.courbe(f, -0.6, xMax - 0.1, COULEURS.ciel, 3.2);
  toile.texte(xMax - 0.2, f(xMax - 0.2), "rivière", { dy: -8, ancre: "end", couleur: COULEURS.ciel, taille: 11 });
  toile.segment(-0.8, 0, xMax, 0, COULEURS.doux, { epaisseur: 3 });
  toile.texte(xMax - 0.2, 0, "route", { dy: -6, ancre: "end", couleur: COULEURS.doux, taille: 11 });
  toile.segment(e.a, 0, e.a, f(e.a), COULEURS.encre, { epaisseur: 1.8 });
  toile.segment(e.b, 0, e.b, f(e.b), COULEURS.encre, { epaisseur: 1.8 });
  // Pont : petit rectangle sur la route, à l'origine.
  toile.parts.push(`<rect x="${f1(toile.sx(0) - 5)}" y="${f1(toile.sy(0) - 5)}" width="10" height="10" fill="${COULEURS.doux}"/>`);
  toile.texte(0, 0, "pont", { dy: -9, ancre: "middle", taille: 11, couleur: COULEURS.doux });
  if (e.a > 0) toile.coteH(0, e.a, 0, `${nb(10 * e.a)} m`, 22);
  toile.coteH(0, e.b, 0, `${nb(10 * e.b)} m`, 44);
  if (donnee) {
    toile.axes(0, 0, -0.8, xMax, -0.03 * yHaut, yHaut * 0.98);
  } else {
    const y0 = f(0);
    toile.segment(e.m, 0, e.m, e.k, COULEURS.doux, { pointilles: true });
    toile.texte(e.m, e.k / 2, `${nb(10 * e.k)} m`, { dx: 5, ancre: "start", taille: 11 });
    toile.coteV(0, 0, y0, `${nb(10 * y0)} m`, -10, "gauche");
    toile.coteH(0, e.m, 0, `${nb(10 * e.m)} m`, 66);
  }
  return toile.svg("Parcelle entre une route, deux clôtures et une rivière, avec les distances mesurées");
}

export function schemaEnonceSvg(e: ExerciceAiresFormesReelles): string {
  switch (e.situation) {
    case "mur":
      return schemaMur(e);
    case "vitrail":
      return schemaVitrail(e);
    case "section":
      return schemaSection(e);
    case "parcelle":
      return schemaParcelle(e);
  }
}

// ============================================================================
// Figure du corrigé : repère, fonction, aire colorée.
// ============================================================================

export function figureCorrigeSvg(e: ExerciceAiresFormesReelles): string {
  const regions: RegionRepere[] = [];
  const courbes: CourbeRepere[] = [];
  const segments: SegmentRepere[] = [];
  const [a, b] = bornesCorrige(e);
  const largeur = b - a;
  let xMin = a - 0.2 * largeur;
  let xMax = b + 0.2 * largeur;
  let fns: ((x: number) => number)[];
  let libelle: string;
  const grads: { x: number; etiquette: string }[] = [a, b].filter((v) => Math.abs(v) > 1e-9).map((v) => ({ x: v, etiquette: etiquetteNombre(v) }));
  const gradsY: { y: number; etiquette: string }[] = [];

  if (e.situation === "mur" || e.situation === "section") {
    const arc = arcExercice(e);
    const f = fonctionArc(arc, e.repere);
    const tunnelOuMur = arc.sens > 0;
    regions.push({ de: a, a: b, haut: (x) => Math.max(f(x), 0), bas: (x) => Math.min(f(x), 0), remplissage: tunnelOuMur ? COULEURS.accentDoux : COULEURS.cielDoux, contour: tunnelOuMur ? COULEURS.accent : COULEURS.ciel });
    courbes.push({ fn: f, de: xMin, a: xMax, couleur: COULEURS.accent, etiquette: "f" });
    fns = [f];
    gradsY.push({ y: arc.sens * arc.fleche, etiquette: etiquetteNombre(arc.sens * arc.fleche) });
    libelle = "Arc de parabole dans le repère du corrigé, aire colorée entre l'arc et l'axe des abscisses";
    if (e.situation === "mur") {
      regions.push({ de: a, a: b, haut: () => 0, bas: () => -e.h, remplissage: COULEURS.cielDoux, contour: COULEURS.ciel });
      fns = [f, () => -e.h];
      gradsY.push({ y: -e.h, etiquette: etiquetteNombre(-e.h) });
      libelle = "Mur dans le repère du corrigé : rectangle et partie arrondie colorés";
    }
    const [p, q] = bornesArc(arc, e.repere);
    xMin = Math.min(xMin, p - 0.2 * largeur);
    xMax = Math.max(xMax, q + 0.2 * largeur);
  } else if (e.situation === "vitrail") {
    const { f, g } = fonctionsVitrail(e);
    xMin = -0.05 * e.W;
    xMax = e.W * 1.05;
    regions.push({ de: a, a: b, haut: f, bas: g, remplissage: COULEURS.mauvaisDoux, contour: COULEURS.mauvais });
    courbes.push({ fn: f, de: a - 0.5, a: b + 0.5, couleur: COULEURS.accent, etiquette: "f" }, { fn: g, de: a - 0.5, a: b + 0.5, couleur: COULEURS.ciel, etiquette: "g" });
    segments.push(
      { x1: 0, y1: e.H, x2: e.W, y2: e.H, couleur: COULEURS.doux, pointilles: true },
      { x1: e.W, y1: 0, x2: e.W, y2: e.H, couleur: COULEURS.doux, pointilles: true },
      { x1: 0, y1: 0, x2: 0, y2: e.H, couleur: COULEURS.doux, pointilles: true },
    );
    fns = [f, g, () => e.H];
    libelle = "Lentille de verre rouge entre les courbes de f et de g, dans le repère du vitrail";
  } else {
    const f = fonctionParcelle(e);
    xMin = -0.5;
    xMax = e.b + 1;
    regions.push({ de: a, a: b, haut: f, bas: () => 0, remplissage: COULEURS.bonDoux, contour: COULEURS.bon });
    courbes.push({ fn: f, de: xMin, a: xMax, couleur: COULEURS.ciel, etiquette: "f" });
    segments.push({ x1: a, y1: 0, x2: a, y2: f(a), couleur: COULEURS.encre }, { x1: b, y1: 0, x2: b, y2: f(b), couleur: COULEURS.encre });
    fns = [f];
    libelle = "Parcelle sous la courbe de f, entre les clôtures";
  }

  // Fenêtre verticale sur l'intervalle utile : les branches hors des bornes n'écrasent pas la région.
  const { yMin, yMax } = fenetreY(fns, a - 0.12 * largeur, b + 0.12 * largeur);
  return repereSvg({ xMin, xMax, yMin, yMax, graduationsX: grads, graduationsY: gradsY, regions, courbes, segments, libelle });
}
