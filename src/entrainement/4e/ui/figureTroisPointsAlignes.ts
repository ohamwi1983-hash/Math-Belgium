import type { Point3D, Solide3D } from "../core/geometrieEspace.types";
import type { ExerciceTroisPointsAlignes } from "../core/demontrerParallelisme.types";
import { projeterPoint3D, type Point2D } from "./projectionCavaliere";
import { calculerAretesAvecVisibilite, pointCacheParSolide } from "./solide3DSketch";
import { COULEUR_CONSTRUCTION, COULEUR_DROITE, COULEURS_PLANS, type ModeFigure } from "./figurePositionsPlans";

/**
 * Figure SVG de la variante « trois points alignés » de gen103 (manuel, ex. 11) — UNE source pour
 * l'écran (couleurs du thème par variables CSS) et le papier (couleurs littérales du thème clair).
 * Même perspective cavalière, même visibilité des arêtes et mêmes couleurs que les figures de gen101 /
 * gen103 (`figurePositionsPlans.ts`, fonctions pures de `solide3DSketch.ts` réutilisées).
 *
 * Calques : la pyramide (arêtes cachées en pointillé), le triangle MNP (violet, côté caché en
 * pointillé), puis, seulement après l'écran « Points communs » et dans le corrigé (`construction`), les
 * côtés prolongés jusqu'à I, J, K (bleu) et les points I, J, K (rouge) ; à la fin (`finale`), la droite
 * d'intersection des plans (MNP) et (ABC) (rouge) et, dans le cas « toit », les deux droites parallèles
 * de l'énoncé (vert). Le CADRE est le même à chaque état (il contient toujours I, J, K) : la figure ne
 * saute pas d'un écran à l'autre et, sur papier, l'élève a la place de construire les points.
 *
 * Identifiants SVG : aucun (pas de `<defs>`) — l'empreinte anti-doublon reste propre.
 */

export const LARGEUR_ALIGNES = 400;
export const HAUTEUR_ALIGNES = 320;
const MARGE = 30;

export interface CadreAlignes {
  pixel: (p: Point3D) => Point2D;
  centre: Point2D;
}

/** Cadre commun à tous les états de la figure : sommets du solide et points construits. */
export function cadreAlignes(solide: Solide3D, construits: Point3D[]): CadreAlignes {
  const tous = [...Object.values(solide.sommets), ...construits].map(projeterPoint3D);
  const minX = Math.min(...tous.map((p) => p.x));
  const maxX = Math.max(...tous.map((p) => p.x));
  const minY = Math.min(...tous.map((p) => p.y));
  const maxY = Math.max(...tous.map((p) => p.y));
  const l = maxX - minX || 1;
  const h = maxY - minY || 1;
  const zl = LARGEUR_ALIGNES - 2 * MARGE;
  const zh = HAUTEUR_ALIGNES - 2 * MARGE;
  const echelle = Math.min(zl / l, zh / h);
  const dx = MARGE + (zl - l * echelle) / 2;
  const dy = MARGE + (zh - h * echelle) / 2;
  const pixel = (p: Point3D): Point2D => {
    const q = projeterPoint3D(p);
    return { x: dx + (q.x - minX) * echelle, y: HAUTEUR_ALIGNES - dy - (q.y - minY) * echelle };
  };
  const sommets = Object.values(solide.sommets).map(pixel);
  const centre = { x: sommets.reduce((s, p) => s + p.x, 0) / sommets.length, y: sommets.reduce((s, p) => s + p.y, 0) / sommets.length };
  return { pixel, centre };
}

export interface OptionsFigureAlignes {
  mode: ModeFigure;
  /** Côtés prolongés et points I, J, K. */
  construction: boolean;
  /** Droite d'intersection des deux plans (et, cas « toit », les deux droites parallèles). */
  finale: boolean;
}

const f = (x: number) => x.toFixed(1);

function ligne(a: Point2D, b: Point2D, stroke: string, largeur: number, pointille: string | null): string {
  const dash = pointille ? ` stroke-dasharray="${pointille}"` : "";
  return `<line x1="${f(a.x)}" y1="${f(a.y)}" x2="${f(b.x)}" y2="${f(b.y)}" stroke="${stroke}" stroke-width="${largeur}" stroke-linecap="round"${dash}/>`;
}

function texte(p: Point2D, contenu: string, couleur: string, halo: string): string {
  return `<text x="${f(p.x)}" y="${f(p.y)}" fill="${couleur}" font-family="system-ui, sans-serif" font-size="15" font-weight="700" text-anchor="middle" dominant-baseline="middle" paint-order="stroke" stroke="${halo}" stroke-width="3" stroke-linejoin="round">${contenu}</text>`;
}

function decaler(p: Point2D, depuis: Point2D, distance = 14): Point2D {
  const dx = p.x - depuis.x;
  const dy = p.y - depuis.y;
  const l = Math.hypot(dx, dy);
  if (l < 1e-6) return { x: p.x, y: p.y - distance };
  return { x: p.x + (dx / l) * distance, y: p.y + (dy / l) * distance };
}

const plus = (a: Point3D, b: Point3D, t: number): Point3D => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t });

/** Segment [a, b] découpé en morceaux visibles / cachés par le solide (échantillonnage). */
function morceaux(solide: Solide3D, cadre: CadreAlignes, a: Point3D, b: Point3D): { p1: Point2D; p2: Point2D; cache: boolean }[] {
  const PAS = 120;
  const sortie: { p1: Point2D; p2: Point2D; cache: boolean }[] = [];
  let debut = 0;
  let etat = pointCacheParSolide(solide, plus(a, b, 0.004));
  for (let i = 1; i <= PAS; i++) {
    const t = i / PAS;
    const e = pointCacheParSolide(solide, plus(a, b, Math.min(t, 0.996)));
    if (e !== etat || i === PAS) {
      sortie.push({ p1: cadre.pixel(plus(a, b, debut)), p2: cadre.pixel(plus(a, b, t)), cache: etat });
      debut = t;
      etat = e;
    }
  }
  return sortie;
}

function couleurs(mode: ModeFigure) {
  return mode === "ecran"
    ? { trait: "var(--solide3d-trait)", cache: "var(--solide3d-trait-cache)", halo: "var(--surface)" }
    : { trait: "#1b1c2b", cache: "#6b6f80", halo: "#ffffff" };
}

export const COULEUR_TRIANGLE_MNP = COULEURS_PLANS[0]!;
export const COULEUR_PARALLELES = COULEURS_PLANS[1]!;

export function figureTroisPointsAlignesSvg(e: ExerciceTroisPointsAlignes, options: OptionsFigureAlignes): string {
  const c = couleurs(options.mode);
  const solide = e.solide;
  const cadre = cadreAlignes(solide, e.construits.map((x) => x.position));
  const pix = cadre.pixel;
  const pos = (nom: string): Point3D => solide.sommets[nom] ?? e.points.find((p) => p.nom === nom)!.position;
  const sortie: string[] = [];
  const tracer = (a: Point3D, b: Point3D, couleur: string, largeur: number, cacheAussi = true) => {
    for (const m of morceaux(solide, cadre, a, b)) {
      if (m.cache && !cacheAussi) continue;
      sortie.push(ligne(m.p1, m.p2, couleur, m.cache ? Math.max(1.4, largeur - 0.8) : largeur, m.cache ? "6 5" : null));
    }
  };

  const aretes = calculerAretesAvecVisibilite(solide);
  for (const a of aretes.filter((x) => !x.visible)) sortie.push(ligne(pix(solide.sommets[a.sommets[0]]!), pix(solide.sommets[a.sommets[1]]!), c.cache, 1.4, "5 4"));
  for (const a of aretes.filter((x) => x.visible)) sortie.push(ligne(pix(solide.sommets[a.sommets[0]]!), pix(solide.sommets[a.sommets[1]]!), c.trait, 1.75, null));

  // Segments du dessin COMPLET (construction et droite finale comprises) : les étiquettes sont placées
  // une fois pour toutes en les évitant, et ne bougent donc pas d'un état de la figure à l'autre.
  const prolongements: [Point3D, Point3D][] = e.construits.flatMap((x) =>
    [x.droiteHaut, x.droiteBase].map((d): [Point3D, Point3D] => {
      const a = pos(d[0]);
      const b = pos(d[1]);
      // Point du côté le plus éloigné de X : le prolongement part de lui et dépasse X de 8 %.
      const loin = distance3(a, x.position) >= distance3(b, x.position) ? a : b;
      return [loin, plus(loin, x.position, 1.08)];
    }),
  );
  const finales: [Point3D, Point3D][] = [];
  if (e.construits.length >= 2) {
    const [p, q] = extremes(e.construits.map((x) => x.position));
    finales.push([plus(p, q, -0.15), plus(p, q, 1.15)]);
  }
  const paralleles: [Point3D, Point3D][] = (e.paralleles ?? []).map((d) => [plus(pos(d[0]), pos(d[1]), -0.12), plus(pos(d[0]), pos(d[1]), 1.12)]);
  const cotesMNP: [Point3D, Point3D][] = [
    [e.points[0].position, e.points[1].position],
    [e.points[1].position, e.points[2].position],
    [e.points[0].position, e.points[2].position],
  ];
  const traits2D: [Point2D, Point2D][] = [
    ...aretes.map((a): [Point2D, Point2D] => [pix(solide.sommets[a.sommets[0]]!), pix(solide.sommets[a.sommets[1]]!)]),
    ...[...prolongements, ...finales, ...paralleles, ...cotesMNP].map(([a, b]): [Point2D, Point2D] => [pix(a), pix(b)]),
  ];
  const etiquettes = placerEtiquettes(
    [
      ...Object.entries(solide.sommets).map(([nom, p]) => ({ nom, p: pix(p) })),
      ...e.points.map((x) => ({ nom: x.nom, p: pix(x.position) })),
      ...e.construits.map((x) => ({ nom: x.nom, p: pix(x.position) })),
    ],
    traits2D,
    cadre.centre,
  );

  if (options.construction) for (const [a, b] of prolongements) tracer(a, b, COULEUR_CONSTRUCTION, 1.7);
  if (options.finale) {
    for (const [a, b] of finales) tracer(a, b, COULEUR_DROITE, 2.6);
    for (const [a, b] of paralleles) tracer(a, b, COULEUR_PARALLELES, 2.6);
  }

  // Triangle MNP, par-dessus.
  for (const [a, b] of cotesMNP) tracer(a, b, COULEUR_TRIANGLE_MNP, 2.4);

  // Points et étiquettes.
  for (const s of Object.values(solide.sommets)) {
    const q = pix(s);
    sortie.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="2.5" fill="${c.trait}"/>`);
  }
  for (const p of e.points) {
    const q = pix(p.position);
    sortie.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="3.6" fill="${c.trait}" stroke="${c.halo}" stroke-width="1.2"/>`);
  }
  if (options.construction) {
    for (const x of e.construits) {
      const q = pix(x.position);
      sortie.push(`<circle cx="${f(q.x)}" cy="${f(q.y)}" r="4.5" fill="${COULEUR_DROITE}" stroke="${c.halo}" stroke-width="1.5"/>`);
    }
  }
  for (const nom of Object.keys(solide.sommets)) sortie.push(texte(etiquettes.get(nom)!, nom, c.trait, c.halo));
  for (const p of e.points) sortie.push(texte(etiquettes.get(p.nom)!, p.nom, c.trait, c.halo));
  if (options.construction) {
    for (const x of e.construits) sortie.push(texte(etiquettes.get(x.nom)!, x.nom, COULEUR_DROITE, c.halo));
  }

  const style = options.mode === "ecran" ? ' style="display:block;width:100%;height:auto"' : ' style="display:block;width:100%;max-width:380px;height:auto;margin:6px auto"';
  return `<svg viewBox="0 0 ${LARGEUR_ALIGNES} ${HAUTEUR_ALIGNES}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Pyramide SABC en perspective cavalière, points M, N et P sur ses arêtes"${style}>${sortie.join("")}</svg>`;
}

/** Les deux points les plus éloignés l'un de l'autre. */
function extremes(pts: Point3D[]): [Point3D, Point3D] {
  let meilleur: [Point3D, Point3D] = [pts[0]!, pts[1]!];
  let d = -1;
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const v = Math.hypot(pts[i]!.x - pts[j]!.x, pts[i]!.y - pts[j]!.y, pts[i]!.z - pts[j]!.z);
      if (v > d) {
        d = v;
        meilleur = [pts[i]!, pts[j]!];
      }
    }
  return meilleur;
}

const distance3 = (a: Point3D, b: Point3D) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

function distanceSegment(p: Point2D, a: Point2D, b: Point2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

/** Rayon approximatif d'une étiquette (une lettre en 15 px, gras). */
export const RAYON_ETIQUETTE = 7;

/**
 * Étiquettes placées une à une (sommets, M, N, P, puis points construits) : 16 directions à 13, 17 ou
 * 22 px de leur point ; on garde la position la plus dégagée des traits du dessin complet, des points
 * et des étiquettes déjà posées (dégagement plafonné à 14 px), puis la plus proche de son point et la
 * plus tournée vers l'extérieur du solide. Reste dans le cadre.
 */
export function placerEtiquettes(items: { nom: string; p: Point2D }[], traits: [Point2D, Point2D][], centre: Point2D): Map<string, Point2D> {
  const sortie = new Map<string, Point2D>();
  const marqueurs = items.map((x) => x.p);
  for (const it of items) {
    let meilleur: Point2D = decaler(it.p, centre, 15);
    let score = -Infinity;
    for (const r of [13, 17, 22]) {
      for (let k = 0; k < 16; k++) {
        const angle = (k * Math.PI) / 8;
        const cand = { x: it.p.x + r * Math.cos(angle), y: it.p.y + r * Math.sin(angle) };
        if (cand.x < 9 || cand.x > LARGEUR_ALIGNES - 9 || cand.y < 9 || cand.y > HAUTEUR_ALIGNES - 9) continue;
        const dTraits = Math.min(...traits.map(([a, b]) => distanceSegment(cand, a, b)));
        const dPoints = Math.min(...marqueurs.map((m) => Math.hypot(m.x - cand.x, m.y - cand.y)));
        const dEtiq = Math.min(Infinity, ...[...sortie.values()].map((m) => Math.hypot(m.x - cand.x, m.y - cand.y) - RAYON_ETIQUETTE));
        const degage = Math.min(dTraits, dPoints - 2, dEtiq, 14);
        const dehors = (cand.x - centre.x) * (it.p.x - centre.x) + (cand.y - centre.y) * (it.p.y - centre.y) > 0 ? 0.5 : 0;
        const s = degage * 10 - r * 0.3 + dehors;
        if (s > score) {
          score = s;
          meilleur = cand;
        }
      }
    }
    sortie.set(it.nom, meilleur);
  }
  return sortie;
}
