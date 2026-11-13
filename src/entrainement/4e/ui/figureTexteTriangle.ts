import type { ExerciceDeuxPositions, ExerciceTexteTriangle, ExerciceTexteTriangleStandard, PointFigure } from "../core/texteTriangle.types";
import { arrondir } from "../moteur/modeleTexteTriangle";

/**
 * Figure SVG de gen77 (chaîne autonome : écran via `dangerouslySetInnerHTML`, papier via
 * `enteteHtml` / `figureHtml`). Géométrie PROPORTIONNELLEMENT FIDÈLE (similitude, comme gen58) ;
 * schéma du contexte : nord et arcs de cap, sol et lignes de visée, horizontale de l'observateur,
 * rivière, côte. Énoncé : les données du texte, l'inconnue en « ? », jamais un angle converti ni —
 * pour « deux positions » — les positions possibles. Corrigé (`resolue`) : angles intérieurs,
 * valeur trouvée, et pour « deux positions » le cercle de rayon RB et les deux positions, la
 * position retenue en couleur.
 */

export interface PaletteFigure {
  fond: string;
  trait: string;
  faible: string;
  cherche: string;
  donnee: string;
  resolu: string;
  eau: string;
  police: string;
}

export const PALETTE_PAPIER: PaletteFigure = {
  fond: "#ffffff",
  trait: "#343a40",
  faible: "#9aa5ad",
  cherche: "#c2410c",
  donnee: "#1971c2",
  resolu: "#2f7a4f",
  eau: "#d0e5f5",
  police: "Archivo, Arial, Helvetica, sans-serif",
};

/** Variables du thème (`index.css`), redéfinies en mode sombre. */
export const PALETTE_ECRAN: PaletteFigure = {
  fond: "var(--color-surface)",
  trait: "var(--color-text)",
  faible: "var(--ink-faint)",
  cherche: "var(--accent)",
  donnee: "var(--sky)",
  resolu: "var(--good)",
  eau: "var(--sky-soft)",
  police: "var(--sans)",
};

export interface OptionsFigure {
  palette: PaletteFigure;
  resolue?: boolean;
}

const L = 320;
const MARGE = 42;
const H_MIN = 170;
const H_MAX = 300;

type Pt = { x: number; y: number };

function f(v: number): string {
  return v.toFixed(1);
}

function echapper(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function frNombre(v: number, decimales: number): string {
  if (decimales <= 0) return String(arrondir(v, decimales));
  return String(Number(arrondir(v, decimales).toFixed(10))).replace(".", ",");
}

function frFixe(v: number, decimales: number): string {
  if (decimales <= 0) return String(arrondir(v, decimales));
  return arrondir(v, decimales).toFixed(decimales).replace(".", ",");
}

/** Angle (degrés, sens trigonométrique, axe y vers le haut) de la direction P → Q en coordonnées réelles. */
function directionDeg(p: Pt, q: Pt): number {
  return (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
}

function normaliser180(a: number): number {
  let x = ((a % 360) + 360) % 360;
  if (x > 180) x -= 360;
  return x;
}

class Dessin {
  morceaux: string[] = [];
  echelle = 1;
  H = H_MIN;
  private x0 = 0;
  private y0 = 0;
  private offX = 0;
  private offY = 0;

  private p: PaletteFigure;

  /** Échelle verticale : égale à `echelle` (similitude), sauf schéma très plat étiré (voir `rapportMin`). */
  echelleY = 1;

  /**
   * `rapportMin` (élévation, dépression) : hauteur minimale du dessin, en proportion de sa largeur.
   * Avec de petits angles (dépression de 6°), la figure à l'échelle est un trait plat illisible ;
   * elle est alors étirée verticalement (schéma, pas à l'échelle) et les arcs suivent les traits
   * dessinés (angles calculés en pixels), les étiquettes gardant les vraies valeurs.
   */
  constructor(p: PaletteFigure, bornes: Pt[], rapportMin = 0, margeHaut = 0) {
    this.p = p;
    const xs = bornes.map((b) => b.x);
    const ys = bornes.map((b) => b.y);
    const xmin = Math.min(...xs);
    const xmax = Math.max(...xs);
    const ymin = Math.min(...ys);
    const ymax = Math.max(...ys);
    const w = Math.max(xmax - xmin, 1e-6);
    const h = Math.max(ymax - ymin, 1e-6);
    let s = (L - 2 * MARGE) / w;
    let sy = s;
    if (h * sy < rapportMin * w * s) sy = (rapportMin * w * s) / h;
    // `margeHaut` : place réservée au-dessus du dessin (flèche du nord d'un point en haut).
    let H = h * sy + 2 * MARGE + margeHaut;
    if (H > H_MAX) {
      const k = (H_MAX - 2 * MARGE - margeHaut) / (h * sy);
      sy *= k;
      if (rapportMin === 0) s *= k;
      H = H_MAX;
    }
    this.offX = (L - 2 * MARGE - w * s) / 2;
    if (H < H_MIN) {
      this.offY = (H_MIN - H) / 2;
      H = H_MIN;
    }
    this.echelle = s;
    this.echelleY = sy;
    this.H = H;
    this.x0 = xmin;
    this.y0 = ymin;
  }

  px(q: Pt): Pt {
    return { x: MARGE + this.offX + (q.x - this.x0) * this.echelle, y: this.H - MARGE - this.offY - (q.y - this.y0) * this.echelleY };
  }

  style(props: Record<string, string | number>): string {
    return `style="${Object.entries(props)
      .map(([k, v]) => `${k}:${v}`)
      .join(";")}"`;
  }

  ligne(a: Pt, b: Pt, couleur: string, epaisseur = 1.8, pointille = false): void {
    const A = this.px(a);
    const B = this.px(b);
    this.morceaux.push(
      `<line x1="${f(A.x)}" y1="${f(A.y)}" x2="${f(B.x)}" y2="${f(B.y)}" ${this.style({ stroke: couleur, "stroke-width": epaisseur, ...(pointille ? { "stroke-dasharray": "5 4" } : {}), "stroke-linecap": "round" })}/>`,
    );
  }

  texte(pos: Pt, contenu: string, couleur: string, taille = 12, gras = false, ancre = "middle"): void {
    const x = Math.min(L - 6, Math.max(6, pos.x));
    const y = Math.min(this.H - 4, Math.max(12, pos.y));
    this.morceaux.push(
      `<text x="${f(x)}" y="${f(y)}" text-anchor="${ancre}" dominant-baseline="middle" ${this.style({ fill: couleur, "font-size": `${taille}px`, "font-family": this.p.police, "font-weight": gras ? 700 : 500 })}>${echapper(contenu)}</text>`,
    );
  }

  point(q: Pt, couleur: string): void {
    const Q = this.px(q);
    this.morceaux.push(`<circle cx="${f(Q.x)}" cy="${f(Q.y)}" r="3" ${this.style({ fill: couleur })}/>`);
  }

  /** Nom d'un point, décalé à l'opposé de `centre` (pixels). */
  /** Direction (vecteur unitaire, pixels) du nom d'un point : à l'opposé de `centre`, jamais vers
   * le haut pour un point portant une flèche du nord (le nom chevaucherait le « N »). */
  directionNom(q: Pt, centre: Pt, eviterNord = false): Pt {
    const Q = this.px(q);
    const C = this.px(centre);
    let dx = Q.x - C.x;
    let dy = Q.y - C.y;
    const d = Math.hypot(dx, dy) || 1;
    dx /= d;
    dy /= d;
    if (eviterNord && dy < -0.3) {
      dx = dx >= 0 ? 0.95 : -0.95;
      dy = 0.3;
    }
    return { x: dx, y: dy };
  }

  /** Même direction, en degrés trigonométriques (pour écarter les étiquettes d'arcs). */
  angleNom(q: Pt, centre: Pt, eviterNord = false): number {
    const u = this.directionNom(q, centre, eviterNord);
    return (Math.atan2(-u.y, u.x) * 180) / Math.PI;
  }

  /** Bissectrice (degrés trigonométriques, pixels) de l'angle en `v` entre les rayons vers `a` et `b`. */
  bissectrice(v: Pt, a: Pt, b: Pt): number {
    const V = this.px(v);
    const A = this.px(a);
    const B = this.px(b);
    const ta = directionDeg({ x: V.x, y: -V.y }, { x: A.x, y: -A.y });
    const tb = directionDeg({ x: V.x, y: -V.y }, { x: B.x, y: -B.y });
    return ta + normaliser180(tb - ta) / 2;
  }

  nom(q: Pt, nom: string, centre: Pt, couleur = this.p.trait, eviterNord = false): void {
    const Q = this.px(q);
    const u = this.directionNom(q, centre, eviterNord);
    // Point à flèche du nord : nom à l'extérieur des arcs de cap (rayons ≤ 27 px).
    const k = eviterNord ? 33 : 14;
    this.texte({ x: Q.x + u.x * k, y: Q.y + u.y * k }, nom, couleur, 13, true);
  }

  /** Étiquette d'un segment, au milieu, décalée à l'opposé de `centre`. */
  etiquetteSegment(a: Pt, b: Pt, contenu: string, centre: Pt, couleur: string): void {
    const A = this.px(a);
    const B = this.px(b);
    const C = this.px(centre);
    const M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    let nx = -(B.y - A.y);
    let ny = B.x - A.x;
    const d = Math.hypot(nx, ny) || 1;
    nx /= d;
    ny /= d;
    if (nx * (M.x - C.x) + ny * (M.y - C.y) < 0) {
      nx = -nx;
      ny = -ny;
    }
    const decalage = 8 + 3.2 * contenu.length * Math.abs(nx) * 0.9;
    this.texte({ x: M.x + nx * decalage, y: M.y + ny * (decalage > 12 ? 12 : decalage) + (ny > 0 ? 2 : -1) }, contenu, couleur, 12, true);
  }

  /** Arc de centre `c` (rayon en pixels), départ `debut` (degrés trigonométriques), balayage signé. */
  arc(c: Pt, debut: number, balayage: number, rayon: number, couleur: string, etiquette?: string, pointille = false, angleEtiquette?: number): void {
    const C = this.px(c);
    const pas = Math.max(6, Math.ceil(Math.abs(balayage) / 6));
    const pts: string[] = [];
    for (let i = 0; i <= pas; i++) {
      const t = ((debut + (balayage * i) / pas) * Math.PI) / 180;
      pts.push(`${f(C.x + rayon * Math.cos(t))},${f(C.y - rayon * Math.sin(t))}`);
    }
    this.morceaux.push(`<polyline points="${pts.join(" ")}" ${this.style({ fill: "none", stroke: couleur, "stroke-width": 1.5, ...(pointille ? { "stroke-dasharray": "3 3" } : {}) })}/>`);
    if (etiquette) {
      // Petit angle : l'étiquette passe à l'extérieur, juste avant le rayon de départ (sinon elle
      // chevauche les deux traits).
      const petit = angleEtiquette === undefined && Math.abs(balayage) < 16;
      const milieu = angleEtiquette ?? (petit ? debut - Math.sign(balayage || 1) * 9 : debut + balayage / 2);
      const t = (milieu * Math.PI) / 180;
      const r = rayon + (petit ? 4 : 9) + etiquette.length * 2.4;
      this.texte({ x: C.x + r * Math.cos(t), y: C.y - r * Math.sin(t) }, etiquette, couleur, 11.5, true);
    }
  }

  /** Arc de l'angle intérieur en `v`, entre les rayons vers `a` et `b`. */
  angleInterieur(v: Pt, a: Pt, b: Pt, rayon: number, couleur: string, etiquette?: string): void {
    // Directions mesurées en pixels (repère y vers le bas, d'où le signe) : l'arc suit les traits
    // dessinés, même sur un schéma étiré.
    const V = this.px(v);
    const A = this.px(a);
    const B = this.px(b);
    const ta = directionDeg({ x: V.x, y: -V.y }, { x: A.x, y: -A.y });
    const tb = directionDeg({ x: V.x, y: -V.y }, { x: B.x, y: -B.y });
    this.arc(v, ta, normaliser180(tb - ta), rayon, couleur, etiquette);
  }

  /** Flèche du nord au-dessus de `q`. */
  nord(q: Pt): void {
    const Q = this.px(q);
    const haut = { x: Q.x, y: Q.y - 30 };
    this.morceaux.push(`<line x1="${f(Q.x)}" y1="${f(Q.y)}" x2="${f(haut.x)}" y2="${f(haut.y)}" ${this.style({ stroke: this.p.faible, "stroke-width": 1.3 })}/>`);
    this.morceaux.push(`<path d="M ${f(haut.x)},${f(haut.y - 2)} l -4,8 l 8,0 z" ${this.style({ fill: this.p.faible })}/>`);
    this.texte({ x: haut.x, y: haut.y - 9 }, "N", this.p.faible, 11, true);
  }

  /** Arc de cap : depuis le nord, dans le sens des aiguilles d'une montre. */
  cap(q: Pt, cap: number, rayon: number, couleur: string, etiquette?: string, eviter: Pt[] = [], eviterAngles: number[] = []): number {
    // Étiquette posée sur l'arc, le plus loin possible des côtés issus du point, de la flèche du nord
    // et des étiquettes déjà posées autour du même point (`eviterAngles`).
    const Q = this.px(q);
    const directions = [90, ...eviterAngles, ...eviter.map((e) => this.px(e)).map((E) => directionDeg({ x: Q.x, y: -Q.y }, { x: E.x, y: -E.y }))];
    const ecart = (t: number) => Math.min(...directions.map((dd) => Math.abs(normaliser180(t - dd))));
    const surArc = [0.5, 0.35, 0.65, 0.2, 0.8].map((k) => 90 - cap * k);
    // Petit cap : l'arc est trop étroit pour l'étiquette, posée juste après lui (ou à gauche du nord).
    const horsArc = [90 - cap - 22, 90 + 24];
    const candidats = cap < 50 ? [...horsArc, ...surArc] : [...surArc, ...horsArc];
    const bon = candidats.find((t) => ecart(t) >= 28) ?? candidats.reduce((a, b) => (ecart(b) > ecart(a) ? b : a));
    this.arc(q, 90, -cap, rayon, couleur, etiquette, false, bon);
    return bon;
  }

  angleDroit(sommet: Pt, versA: Pt, versB: Pt): void {
    const S = this.px(sommet);
    const A = this.px(versA);
    const B = this.px(versB);
    const ua = { x: (A.x - S.x) / Math.hypot(A.x - S.x, A.y - S.y), y: (A.y - S.y) / Math.hypot(A.x - S.x, A.y - S.y) };
    const ub = { x: (B.x - S.x) / Math.hypot(B.x - S.x, B.y - S.y), y: (B.y - S.y) / Math.hypot(B.x - S.x, B.y - S.y) };
    const k = 7;
    this.morceaux.push(
      `<path d="M ${f(S.x + ua.x * k)},${f(S.y + ua.y * k)} L ${f(S.x + (ua.x + ub.x) * k)},${f(S.y + (ua.y + ub.y) * k)} L ${f(S.x + ub.x * k)},${f(S.y + ub.y * k)}" ${this.style({ fill: "none", stroke: this.p.faible, "stroke-width": 1.2 })}/>`,
    );
  }

  /** Bande horizontale (eau) entre deux ordonnées réelles. */
  bande(yBas: number, yHaut: number, couleur: string): void {
    const A = this.px({ x: 0, y: yHaut });
    const B = this.px({ x: 0, y: yBas });
    const haut = Math.max(0, Math.min(A.y, B.y));
    const bas = Math.min(this.H, Math.max(A.y, B.y));
    this.morceaux.push(`<rect x="0" y="${f(haut)}" width="${L}" height="${f(bas - haut)}" ${this.style({ fill: couleur })}/>`);
  }

  /** Ligne horizontale réelle sur toute la largeur du cadre. */
  horizontale(y: number, couleur: string, epaisseur = 1.5, pointille = false): void {
    const Y = this.px({ x: 0, y }).y;
    this.morceaux.push(`<line x1="0" y1="${f(Y)}" x2="${L}" y2="${f(Y)}" ${this.style({ stroke: couleur, "stroke-width": epaisseur, ...(pointille ? { "stroke-dasharray": "5 4" } : {}) })}/>`);
  }

  svg(label: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${f(this.H)}" width="${L}" height="${f(this.H)}" role="img" aria-label="${echapper(label)}"><rect x="0" y="0" width="${L}" height="${f(this.H)}" ${this.style({ fill: this.p.fond })}/>${this.morceaux.join("")}</svg>`;
  }
}

function centre(points: Pt[]): Pt {
  return { x: points.reduce((s, q) => s + q.x, 0) / points.length, y: points.reduce((s, q) => s + q.y, 0) / points.length };
}

function trouver(e: { points: PointFigure[] }, nom: string): Pt {
  const q = e.points.find((x) => x.nom === nom);
  if (!q) throw new Error(`figure gen77 : point ${nom} absent`);
  return q;
}

function etiquetteLongueur(v: number, unite: string): string {
  return `${frNombre(v, 2)} ${unite}`;
}

function etiquetteResultat(e: ExerciceTexteTriangleStandard): string {
  return `≈ ${frFixe(e.inconnue.valeur, e.precision.decimales)} ${e.unite}`;
}

function deg1(v: number): string {
  return `${frNombre(v, 1)}°`;
}

// ---------------------------------------------------------------------------------------------
// Triangle standard
// ---------------------------------------------------------------------------------------------

function figureStandard(e: ExerciceTexteTriangleStandard, p: PaletteFigure, resolue: boolean): string {
  const noms = e.triangle.split("");
  const [P1, P2, P3] = noms.map((nm) => trouver(e, nm)) as [Pt, Pt, Pt];
  const sommets: Record<string, Pt> = Object.fromEntries(noms.map((nm, i) => [nm, [P1, P2, P3][i]!]));
  const g = centre([P1, P2, P3]);
  const bornes: Pt[] = e.points.map((q) => ({ x: q.x, y: q.y }));
  const v = e.variante;
  // Points portant une flèche du nord (caps) : place réservée en haut du cadre pour la flèche.
  const fleches = !e.avecNord ? [] : v === "trajets" ? [noms[0]!, noms[1]!] : v === "distanceInaccessible" ? ["A", "B"] : [noms[0]!];
  const d = new Dessin(p, bornes, v === "elevation" || v === "depression" ? 0.45 : 0, fleches.length > 0 ? 26 : 0);
  /** Directions à éviter pour l'étiquette d'un cap en `nm` : nom du point et bissectrice de l'angle intérieur. */
  const aEviter = (nm: string): number[] => {
    const autres = noms.filter((x) => x !== nm);
    const angleNom = d.angleNom(sommets[nm]!, g, true);
    // Le nom est tout près du point : on élargit la zone interdite autour de sa direction.
    return [angleNom - 25, angleNom, angleNom + 25, d.bissectrice(sommets[nm]!, sommets[autres[0]!]!, sommets[autres[1]!]!)];
  };

  // Décor du contexte.
  if (v === "elevation" || v === "depression") {
    d.horizontale(0, p.faible, 1.4);
    const F = trouver(e, "F");
    const haut = trouver(e, noms[2]!);
    d.ligne(F, haut, p.faible, 1.2, true);
    d.angleDroit(F, trouver(e, "A"), haut);
    if (v === "depression") {
      const H = trouver(e, "H");
      d.ligne(H, haut, p.faible, 1.2, true);
      d.nom(H, "H", { x: H.x, y: H.y - 1 }, p.faible);
    }
    d.nom(F, "F", { x: F.x, y: F.y + 1 }, p.faible);
  }
  if (v === "distanceInaccessible") {
    const C = sommets["C"]!;
    d.bande(C.y * 0.18, C.y * 0.82, p.eau);
  }

  // Côtés du triangle.
  const segment = (a: string, b: string) => [a, b].sort().join("");
  const cherche = e.segmentCherche ? segment(...e.segmentCherche) : null;
  const paires: [string, string][] = [
    [noms[0]!, noms[1]!],
    [noms[1]!, noms[2]!],
    [noms[0]!, noms[2]!],
  ];
  for (const [a, b] of paires) {
    const estCherche = segment(a, b) === cherche;
    d.ligne(sommets[a]!, sommets[b]!, estCherche ? p.cherche : p.trait, estCherche ? 2.4 : 1.8, estCherche && !resolue);
  }
  if (e.segmentCherche === null) {
    // Aire demandée : triangle teinté.
    const pts = [P1, P2, P3].map((q) => d.px(q));
    d.morceaux.push(`<polygon points="${pts.map((q) => `${f(q.x)},${f(q.y)}`).join(" ")}" ${d.style({ fill: p.cherche, "fill-opacity": 0.12, stroke: "none" })}/>`);
    const G = d.px(g);
    d.texte(G, resolue ? etiquetteResultat(e) : "Aire ?", p.cherche, 12, true);
  }

  // Longueurs données et inconnue.
  for (const [a, b, valeur] of e.longueurs) d.etiquetteSegment(trouver(e, a), trouver(e, b), etiquetteLongueur(valeur, e.unite), g, p.trait);
  if (e.segmentCherche) {
    const [a, b] = e.segmentCherche;
    d.etiquetteSegment(trouver(e, a), trouver(e, b), resolue ? etiquetteResultat(e) : "?", g, p.cherche);
  }

  // Angles du texte (énoncé) ou angles intérieurs (corrigé).
  const A = (nm: string) => trouver(e, nm);
  if (v === "trajets") {
    const [D, V] = [noms[0]!, noms[1]!];
    d.nord(A(D));
    d.nord(A(V));
    d.cap(A(D), e.angles.capDepart!, 16, p.donnee, `${e.angles.capDepart}°`, [A(V), A(noms[2]!)], aEviter(D));
    d.cap(A(V), e.angles.capVirage!, 16, p.donnee, `${e.angles.capVirage}°`, [A(D), A(noms[2]!)], aEviter(V));
    // Rayon plus grand que l'arc de cap : les deux étiquettes restent séparées.
    if (resolue) d.angleInterieur(A(V), A(D), A(noms[2]!), 34, p.resolu, deg1(e.conversions[0]!.valeur));
  } else if (v === "deuxBateaux" || v === "parcelle") {
    const O = noms[0]!;
    const c1 = v === "deuxBateaux" ? e.angles.cap1! : e.angles.capB!;
    const c2 = v === "deuxBateaux" ? e.angles.cap2! : e.angles.capC!;
    d.nord(A(O));
    const autres = [A(noms[1]!), A(noms[2]!)];
    const t1 = d.cap(A(O), c1, 15, p.donnee, `${c1}°`, autres, aEviter(O));
    d.cap(A(O), c2, 27, p.donnee, `${c2}°`, autres, [...aEviter(O), t1]);
    if (resolue) d.angleInterieur(A(O), A(noms[1]!), A(noms[2]!), 36, p.resolu, deg1(e.conversions[0]!.valeur));
  } else if (v === "elevation" || v === "depression") {
    const haut = noms[2]!;
    const alpha = e.angles.alpha!;
    const beta = e.angles.beta!;
    const F = A("F");
    if (v === "elevation") {
      d.angleInterieur(A("A"), F, A(haut), 22, p.donnee, `${alpha}°`);
      if (!resolue) d.angleInterieur(A("B"), F, A(haut), 18, p.donnee, `${beta}°`);
    } else {
      // Corrigé : seuls les angles intérieurs (les dépressions sont sur la figure de l'énoncé).
      const H = A("H");
      if (!resolue) {
        d.angleInterieur(A(haut), H, A("A"), 30, p.donnee, `${alpha}°`);
        d.angleInterieur(A(haut), H, A("B"), 48, p.donnee, `${beta}°`);
      } else d.angleInterieur(A("A"), A("B"), A(haut), 22, p.resolu, deg1(alpha));
    }
    if (resolue) {
      d.angleInterieur(A("B"), A("A"), A(haut), 18, p.resolu, deg1(180 - beta));
      d.angleInterieur(A(haut), A("A"), A("B"), v === "depression" ? 18 : 26, p.resolu, deg1(beta - alpha));
    }
  } else if (v === "distanceInaccessible") {
    const releve = e.sousType === "releve";
    if (releve) {
      d.nord(A("A"));
      d.nord(A("B"));
      d.cap(A("A"), e.angles.capA!, 16, p.donnee, `${e.angles.capA}°`, [A("B"), A("C")], aEviter("A"));
      d.cap(A("B"), e.angles.capB!, 12, p.donnee, `${e.angles.capB}°`, [A("A"), A("C")], aEviter("B"));
    } else {
      d.angleInterieur(A("A"), A("B"), A("C"), 22, p.donnee, `${e.angles.A}°`);
      d.angleInterieur(A("B"), A("A"), A("C"), 22, p.donnee, `${e.angles.B}°`);
    }
    if (resolue) {
      if (releve) {
        d.angleInterieur(A("A"), A("B"), A("C"), 30, p.resolu, deg1(e.angles.A!));
        d.angleInterieur(A("B"), A("A"), A("C"), 30, p.resolu, deg1(e.angles.B!));
      }
      d.angleInterieur(A("C"), A("A"), A("B"), 20, p.resolu, deg1(180 - e.angles.A! - e.angles.B!));
    }
  }

  // Points et noms.
  for (const nm of noms) {
    d.point(sommets[nm]!, p.trait);
    d.nom(sommets[nm]!, nm, g, p.trait, fleches.includes(nm));
  }
  return d.svg(`Schéma de la situation, triangle ${e.triangle}`);
}

// ---------------------------------------------------------------------------------------------
// Deux positions
// ---------------------------------------------------------------------------------------------

function figureDeuxPositions(e: ExerciceDeuxPositions, p: PaletteFigure, resolue: boolean): string {
  const R = { x: 0, y: 0 };
  const P = { x: e.RP, y: 0 };
  const t = (e.angleP * Math.PI) / 180;
  const dir = { x: -Math.cos(t), y: Math.sin(t) };
  const B = (dist: number) => ({ x: P.x + dist * dir.x, y: P.y + dist * dir.y });
  const B1 = B(e.distances[0]);
  const B2 = B(e.distances[1]);
  const finVisee = B(e.distances[0] * 1.15);
  const bornes = [R, P, finVisee, { x: R.x - e.RP * 0.12, y: -e.RP * 0.12 }, { x: Math.min(finVisee.x, -e.RB * 0.2), y: finVisee.y }];
  const d = new Dessin(p, bornes);
  d.bande(0, finVisee.y * 2, p.eau);
  d.horizontale(0, p.trait, 1.6);
  const { R: nR, P: nP, B: nB } = e.noms;
  d.etiquetteSegment(R, P, `${frNombre(e.RP, 2)} km`, { x: e.RP / 2, y: 1 }, p.trait);
  d.ligne(P, finVisee, resolue ? p.faible : p.donnee, 1.6, true);
  d.angleInterieur(P, R, finVisee, 24, p.donnee, `${e.angleP}°`);
  if (!resolue) {
    const Fv = d.px(finVisee);
    d.texte({ x: Fv.x + 4, y: Fv.y - 10 }, `${nB} ?`, p.cherche, 13, true);
  } else {
    // Cercle de centre R et de rayon RB (arc côté mer).
    d.arc(R, -8, 196, e.RB * d.echelle, p.faible, undefined, true);
    const positions: [Pt, string, number][] = [
      [B1, `${nB}₁`, 0],
      [B2, `${nB}₂`, 1],
    ];
    for (const [q, nom, i] of positions) {
      const retenue = i === e.retenue;
      d.ligne(R, q, retenue ? p.trait : p.faible, retenue ? 1.6 : 1.1, !retenue);
      d.ligne(P, q, retenue ? p.cherche : p.faible, retenue ? 2.4 : 1.2, !retenue);
      d.point(q, retenue ? p.cherche : p.faible);
      // Nom à l'opposé de P (le long de la visée), loin de l'étiquette de distance et de l'arc en P.
      d.nom(q, nom, P, retenue ? p.cherche : p.faible);
    }
    const ret = e.retenue === 0 ? B1 : B2;
    // Distance au-dessus de la visée (côté mer), à l'écart de l'arc de l'angle en P.
    d.etiquetteSegment(P, ret, `≈ ${frFixe(e.distances[e.retenue], 1)} km`, { x: (P.x + ret.x) / 2, y: -e.RP }, p.cherche);
  }
  d.point(R, p.trait);
  d.point(P, p.trait);
  d.nom(R, nR, { x: R.x + 1, y: 1 });
  d.nom(P, nP, { x: P.x - 1, y: 1 });
  return d.svg(resolue ? "Schéma résolu : les deux positions possibles et la position retenue" : "Schéma de la situation : côte, postes et direction de visée");
}

export function construireFigureTexteTriangle(e: ExerciceTexteTriangle, options: OptionsFigure): string {
  return e.variante === "deuxPositions" ? figureDeuxPositions(e, options.palette, !!options.resolue) : figureStandard(e, options.palette, !!options.resolue);
}
