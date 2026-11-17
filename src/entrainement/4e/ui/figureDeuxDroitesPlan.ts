import type { ExerciceDeuxDroitesPlan } from "../core/deuxDroitesPlan.types";
import type { Point3D, Solide3D } from "../core/geometrieEspace.types";
import { projeterPoint3D, type Point2D } from "./projectionCavaliere";
import { calculerAretesAvecVisibilite, pointCacheParSolide } from "./solide3DSketch";
import { positionPoint } from "./formatDeuxDroitesPlan";

/**
 * Figures SVG AUTONOMES de gen100 (feuilles d'exercices, évaluations) — attributs `fill`/`stroke`
 * littéraux (le document HTML n'a pas les variables CSS du thème), mêmes couleurs que l'écran
 * (`Solide3DSketch`, thème clair) : trait encre, première droite orange, seconde bleue, plan violet.
 *
 * - Énoncé : le solide, les points définis, les données (droites prolongées, partie cachée en
 *   pointillé ; points donnés marqués). JAMAIS de plan coloré ni de point commun : ce serait la
 *   réponse.
 * - Corrigé (`corrige: true`) : en plus, la section du plan commun / déterminé (ou du plan (Q) d'une
 *   preuve « gauches ») et le point commun de deux sécantes — le cadrage s'élargit pour montrer un
 *   point commun situé hors du solide, avec les droites prolongées jusqu'à lui.
 *
 * Identifiants : aucun (pas de `id`, pas de `url(#…)`) — l'empreinte anti-doublon reste propre.
 */

const TRAIT = "#1b1c2b";
const PLAN = "#6d28d9";
const DROITE_1 = "#e8590c";
const DROITE_2 = "#1c7ed6";
const BORDURE = "#e6e6f0";

const LARGEUR = 400;
const HAUTEUR = 320;
const MARGE = 36;

interface Cadre {
  minX: number;
  minY: number;
  echelle: number;
  dx: number;
  dy: number;
}

function cadrer(points: Point3D[]): Cadre {
  const p = points.map(projeterPoint3D);
  const minX = Math.min(...p.map((q) => q.x));
  const maxX = Math.max(...p.map((q) => q.x));
  const minY = Math.min(...p.map((q) => q.y));
  const maxY = Math.max(...p.map((q) => q.y));
  const l = maxX - minX || 1;
  const h = maxY - minY || 1;
  const echelle = Math.min((LARGEUR - 2 * MARGE) / l, (HAUTEUR - 2 * MARGE) / h);
  return { minX, minY, echelle, dx: MARGE + (LARGEUR - 2 * MARGE - l * echelle) / 2, dy: MARGE + (HAUTEUR - 2 * MARGE - h * echelle) / 2 };
}

function px(c: Cadre, p: Point3D): Point2D {
  const q = projeterPoint3D(p);
  return { x: c.dx + (q.x - c.minX) * c.echelle, y: HAUTEUR - c.dy - (q.y - c.minY) * c.echelle };
}

function f(n: number): string {
  return n.toFixed(1);
}

function lerp(a: Point3D, b: Point3D, t: number): Point3D {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
}

/** Droite (a, b) prolongée (35 % de |ab| de chaque côté, au moins 1,2 unité ; jusqu'à `tExtremes`
 * si besoin), découpée en parties visibles / cachées par le solide. */
function droiteSvg(solide: Solide3D, c: Cadre, a: Point3D, b: Point3D, couleur: string, tExtremes: number[] = []): string {
  const longueur = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z) || 1;
  const ext = Math.max(0.35, 1.2 / longueur);
  const t0 = Math.min(-ext, ...tExtremes.map((t) => t - 0.12));
  const t1 = Math.max(1 + ext, ...tExtremes.map((t) => t + 0.12));
  const PAS = 200;
  let html = "";
  let debut = t0;
  let cache = pointCacheParSolide(solide, lerp(a, b, t0));
  const segment = (u: number, v: number, estCache: boolean) => {
    const p = px(c, lerp(a, b, u));
    const q = px(c, lerp(a, b, v));
    return `<line x1="${f(p.x)}" y1="${f(p.y)}" x2="${f(q.x)}" y2="${f(q.y)}" stroke="${couleur}" stroke-width="${estCache ? 2.25 : 3}"${estCache ? ' stroke-dasharray="6 5"' : ' stroke-linecap="round"'}/>`;
  };
  for (let i = 1; i <= PAS; i++) {
    const t = t0 + ((t1 - t0) * i) / PAS;
    const etat = pointCacheParSolide(solide, lerp(a, b, t));
    if (etat !== cache || i === PAS) {
      html += segment(debut, t, cache);
      debut = t;
      cache = etat;
    }
  }
  return html;
}

function point(c: Cadre, p: Point3D, couleur: string, r: number): string {
  const q = px(c, p);
  return `<circle cx="${f(q.x)}" cy="${f(q.y)}" r="${r}" fill="${couleur}" stroke="#ffffff" stroke-width="1.5"/>`;
}

function etiquette(c: Cadre, solide: Solide3D, p: Point3D, nom: string): string {
  const q = px(c, p);
  const sommets = Object.values(solide.sommets).map((s) => px(c, s));
  const centre = { x: sommets.reduce((s, v) => s + v.x, 0) / sommets.length, y: sommets.reduce((s, v) => s + v.y, 0) / sommets.length };
  const dx = q.x - centre.x;
  const dy = q.y - centre.y;
  const l = Math.hypot(dx, dy);
  const pos = l < 1e-6 ? { x: q.x, y: q.y - 14 } : { x: q.x + (dx / l) * 14, y: q.y + (dy / l) * 14 };
  return `<text x="${f(pos.x)}" y="${f(pos.y)}" font-size="13" font-weight="700" font-family="sans-serif" text-anchor="middle" dominant-baseline="middle" fill="${TRAIT}" stroke="#ffffff" stroke-width="3" paint-order="stroke">${nom}</text>`;
}

/** Section du solide par le plan passant par `trois` (polygone convexe, ordonné). */
function sectionPlan(solide: Solide3D, trois: [Point3D, Point3D, Point3D]): Point3D[] {
  const [a, b, d] = trois;
  const u = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const v = { x: d.x - a.x, y: d.y - a.y, z: d.z - a.z };
  const n = { x: u.y * v.z - u.z * v.y, y: u.z * v.x - u.x * v.z, z: u.x * v.y - u.y * v.x };
  const dist = (p: Point3D) => (n.x * (p.x - a.x) + n.y * (p.y - a.y) + n.z * (p.z - a.z)) / (Math.hypot(n.x, n.y, n.z) || 1);
  const points: Point3D[] = [];
  const ajouter = (p: Point3D) => {
    if (!points.some((q) => Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z) < 1e-6)) points.push(p);
  };
  for (const arete of calculerAretesAvecVisibilite(solide)) {
    const p = solide.sommets[arete.sommets[0]]!;
    const q = solide.sommets[arete.sommets[1]]!;
    const dp = dist(p);
    const dq = dist(q);
    if (Math.abs(dp) < 1e-6) ajouter(p);
    if (Math.abs(dq) < 1e-6) ajouter(q);
    if (dp * dq < 0 && Math.abs(dp) > 1e-6 && Math.abs(dq) > 1e-6) ajouter(lerp(p, q, dp / (dp - dq)));
  }
  const p2 = points.map(projeterPoint3D);
  const cx = p2.reduce((s, q) => s + q.x, 0) / (p2.length || 1);
  const cy = p2.reduce((s, q) => s + q.y, 0) / (p2.length || 1);
  return points.map((p, i) => ({ p, ang: Math.atan2(p2[i]!.y - cy, p2[i]!.x - cx) })).sort((x, y) => x.ang - y.ang).map((x) => x.p);
}

/** Deux points de la droite (a, b) qui encadrent a, b ET le pied du point `m` sur cette droite :
 * tracée à partir d'eux, la droite passe à hauteur du point donné (qu'il soit dessus ou non) — sinon
 * son prolongement s'arrêtait parfois avant lui et l'alignement ne se voyait pas. */
export function segmentCouvrant(a: Point3D, b: Point3D, m: Point3D): [Point3D, Point3D] {
  const t = parametre(a, b, m);
  return [lerp(a, b, Math.min(0, t)), lerp(a, b, Math.max(1, t))];
}

/** Droites tracées et points marqués d'un énoncé (données de l'exercice). */
function donnees(e: ExerciceDeuxDroitesPlan): { droites: [Point3D, Point3D][]; marques: Point3D[] } {
  const pos = (n: string) => positionPoint(e, n)!;
  if (e.variante === "positions") return { droites: [[pos(e.d1[0]), pos(e.d1[1])], [pos(e.d2[0]), pos(e.d2[1])]], marques: [] };
  const p = e.points;
  if (e.type === "troisPoints") return { droites: [], marques: p.map(pos) };
  if (e.type === "droitePoint") return { droites: [segmentCouvrant(pos(p[0]!), pos(p[1]!), pos(p[2]!))], marques: [pos(p[2]!)] };
  return { droites: [[pos(p[0]!), pos(p[1]!)], [pos(p[2]!), pos(p[3]!)]], marques: [] };
}

/** Paramètre t du point `m` sur la droite (a, b) (m supposé sur la droite). */
function parametre(a: Point3D, b: Point3D, m: Point3D): number {
  const d = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const n2 = d.x * d.x + d.y * d.y + d.z * d.z || 1;
  return ((m.x - a.x) * d.x + (m.y - a.y) * d.y + (m.z - a.z) * d.z) / n2;
}

export function figureDeuxDroitesPlanSvg(e: ExerciceDeuxDroitesPlan, options: { corrige?: boolean; largeurMax?: number } = {}): string {
  const { corrige = false, largeurMax = 380 } = options;
  const solide = e.solide;
  const pos = (n: string) => positionPoint(e, n)!;
  const { droites, marques } = donnees(e);

  // Éléments du corrigé : plan à colorer, point commun.
  let planTrois: [Point3D, Point3D, Point3D] | null = null;
  let pointCommun: Point3D | null = null;
  let pointPercee: Point3D | null = null;
  if (corrige) {
    if (e.variante === "positions") {
      const j = e.justification;
      if (e.planCommun) planTrois = e.planCommun.map(pos) as [Point3D, Point3D, Point3D];
      if (j.type === "secantes") pointCommun = j.position;
      if (j.type === "gauches") {
        planTrois = j.plan.map(pos) as [Point3D, Point3D, Point3D];
        pointPercee = pos(j.point);
      }
    } else if (e.determine && e.nomPlan) {
      planTrois = e.nomPlan.map(pos) as [Point3D, Point3D, Point3D];
    }
  }

  const cadre = cadrer([...Object.values(solide.sommets), ...(pointCommun ? [pointCommun] : [])]);
  const aretes = calculerAretesAvecVisibilite(solide);
  const ligneArete = (n1: string, n2: string, visible: boolean) => {
    const p = px(cadre, solide.sommets[n1]!);
    const q = px(cadre, solide.sommets[n2]!);
    return `<line x1="${f(p.x)}" y1="${f(p.y)}" x2="${f(q.x)}" y2="${f(q.y)}" stroke="${TRAIT}" stroke-width="${visible ? 1.75 : 1.4}"${visible ? "" : ' stroke-dasharray="4 3"'}/>`;
  };
  const cachees = aretes.filter((a) => !a.visible).map((a) => ligneArete(a.sommets[0], a.sommets[1], false)).join("");
  const visibles = aretes.filter((a) => a.visible).map((a) => ligneArete(a.sommets[0], a.sommets[1], true)).join("");

  let planHtml = "";
  if (planTrois) {
    const section = sectionPlan(solide, planTrois).map((p) => px(cadre, p));
    if (section.length >= 3) planHtml = `<polygon points="${section.map((p) => `${f(p.x)},${f(p.y)}`).join(" ")}" fill="${PLAN}" fill-opacity="0.22" stroke="${PLAN}" stroke-width="2" stroke-linejoin="round"/>`;
  }

  const droitesHtml = droites
    .map(([a, b], i) => droiteSvg(solide, cadre, a, b, i === 0 ? DROITE_1 : DROITE_2, pointCommun ? [parametre(a, b, pointCommun)] : []))
    .join("");

  const sommetsHtml = Object.entries(solide.sommets)
    .map(([nom, p]) => point(cadre, p, TRAIT, 2.5) + etiquette(cadre, solide, p, nom))
    .join("");
  const nommesHtml = e.pointsNommes.map((p) => point(cadre, p.position, TRAIT, 3.5) + etiquette(cadre, solide, p.position, p.nom)).join("");
  const marquesHtml = marques.map((m) => point(cadre, m, e.variante === "plan" && e.type === "droitePoint" ? DROITE_2 : DROITE_1, 6.5)).join("");
  const communHtml = pointCommun ? point(cadre, pointCommun, PLAN, 5.5) : "";
  const perceeHtml = pointPercee ? point(cadre, pointPercee, PLAN, 5.5) : "";

  return `<svg width="${LARGEUR}" height="${HAUTEUR}" viewBox="0 0 ${LARGEUR} ${HAUTEUR}" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:10px auto 16px;max-width:${largeurMax}px;width:100%;border:1px solid ${BORDURE};border-radius:8px;background:#ffffff;" role="img" aria-label="Solide en perspective cavalière">
<rect x="0" y="0" width="${LARGEUR}" height="${HAUTEUR}" fill="#ffffff"/>
${cachees}${planHtml}${visibles}${droitesHtml}${marquesHtml}${communHtml}${perceeHtml}${sommetsHtml}${nommesHtml}
</svg>`;
}
