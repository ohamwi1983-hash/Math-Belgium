import type { NomSolide3D, Point3D } from "../../core/geometrieEspace.types";
import type { CandidatPointCommun } from "../../core/positionsPlans.types";
import type {
  CandidatPercee,
  ExercicePercee,
  NatureCandidatPercee,
  OptionPlanAuxiliaire,
  PointNommePercee,
  SuitePlanAuxiliaire,
  VariantePercee,
} from "../../core/perceePlanAuxiliaire.types";
import { distance3D, EPSILON_3D, intersectionDroitePlan, normalePlan, pointAppartientAuPlan, points3Colineaires, produitVectoriel3D, soustraire3D } from "../solide3D/geometrieEspace";
import { GABARITS_SOLIDE3D, GABARITS_TOUS } from "../solide3D/gabarits";
import { angleProjete, distancePixel, droitesParalleles, intersection2D, intersectionDroites, memeDroite, nonAlignes, type Point2D } from "../positionsPlans/geometriePlans";
import {
  cadrePercee,
  dansBoiteSolide,
  dansCadre,
  dansSolide,
  donneesPercee,
  ligneDansPlan,
  lignesNommees,
  pointRaisonnable,
  projeter,
  type CadrePercee,
  type DonneesPercee,
  type LigneNommee,
  type Nomme,
  type PointDispoPercee,
} from "./geometriePercee";

/**
 * Générateur de gen102 — « Point de percée par plan auxiliaire » (4e, chapitre 8). Tout le hasard
 * passe par `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine,
 * et le QR code d'une feuille rouvre le MÊME exercice. L'énumération géométrique
 * (`geometriePercee.ts`) est déterministe et mise en cache.
 *
 * Solides : parallélépipède, cube, prisme droit (`GABARITS_TOUS` sans le tétraèdre) pour une face
 * ou un plan diagonal ; les quatre, tétraèdre compris, pour un plan par trois points. (Tétraèdre :
 * aucun plan diagonal, et deux arêtes opposées touchent toutes ses faces.)
 *
 * Tirage :
 * 1. caractéristiques visées tirées AVANT la boucle de rejet (fréquences non biaisées) : d dans une
 *    face ou non (moitié-moitié), point de percée hors du solide (une fois sur trois, plans diagonaux
 *    et par trois points ; pour une face, la géométrie le place presque toujours dehors), nombre de
 *    bons plans auxiliaires visé dans la liste de l'écran 1 (1 ou 2), et, pour chacune des quatre
 *    options, la présence d'une lettre de d dans son nom et l'absence de lettre commune avec le nom
 *    de α — tirées indépendamment de la validité de l'option ;
 * 2. α selon la variante, puis d = (XY) qui perce α en un point P NOUVEAU (jamais un point nommé) ;
 * 3. plans auxiliaires valables : tout plan (XYZ), Z point nommé. Le premier est « exploitable » : sa
 *    droite commune b avec α se construit avec deux points communs accessibles (points nommés, ou
 *    rencontre de deux droites d'une même face), distincts de P — il porte la suite de référence. Le
 *    second éventuel est n'importe quel autre plan qui contient d (accepté ; s'il n'est pas
 *    exploitable, la suite se fait avec le premier) ;
 * 4. options fausses : plans qui contiennent UN SEUL des deux points de d ;
 * 5. pour chaque option exploitable : candidats de l'écran 2 (points nommés et points de rencontre,
 *    dont des leurres : droites d'une face hors d'un des deux plans, droites gauches) et points
 *    numérotés de l'écran 3 (là où d croise sur le dessin une arête ou un côté de triangle).
 *
 * Audit des générateurs du chapitre (gen39/40/41), appliqué d'emblée : les noms ne trahissent pas la
 * réponse (jamais les deux lettres de d dans un même nom, une lettre de d présente une fois sur
 * deux quelle que soit la validité, jamais deux lettres du nom de α) ; l'ordre des options est mélangé ; UNE tentative par choix
 * fermé ; le point de percée est toujours un point nouveau ; candidats distincts d'au moins 22 px.
 */

type Geo3 = [Point3D, Point3D, Point3D];

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

function tirerPondere<T>(options: [T, number][]): T {
  const total = options.reduce((s, [, p]) => s + p, 0);
  let r = Math.random() * total;
  for (const [v, p] of options) {
    r -= p;
    if (r <= 0) return v;
  }
  return options[options.length - 1]![0];
}

const LETTRES = ["I", "J", "K", "L"];
const NOMBRE_OPTIONS = 4;

function plansEgaux(p: Geo3, q: Geo3): boolean {
  return q.every((x) => pointAppartientAuPlan(x, p));
}

// --- Lisibilité des triangles ----------------------------------------------------------------------

function angleEnPx(a: Point2D, b: Point2D, c: Point2D): number {
  const u = { x: b.x - a.x, y: b.y - a.y };
  const v = { x: c.x - a.x, y: c.y - a.y };
  const cos = (u.x * v.x + u.y * v.y) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

function triangleLisible(cadre: CadrePercee, t: Point3D[]): boolean {
  const [a, b, c] = t.map(cadre.pixel) as [Point2D, Point2D, Point2D];
  if (Math.min(distancePixel(a, b), distancePixel(b, c), distancePixel(a, c)) < 30) return false;
  const aire = Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2;
  if (aire < 900) return false;
  return Math.min(angleEnPx(a, b, c), angleEnPx(b, a, c), angleEnPx(c, a, b)) >= 12;
}

// --- Plan α --------------------------------------------------------------------------------------

interface Alpha {
  triple: PointDispoPercee[];
  geo: Geo3;
}

function tirerAlpha(d: DonneesPercee, variante: VariantePercee, cadre: CadrePercee): Alpha | null {
  const parCle = (cle: string) => d.points.find((p) => p.cle === cle)!;
  let triple: PointDispoPercee[];
  if (variante === "face") {
    triple = melanger(choisir(d.solide.faces)).slice(0, 3).map(parCle);
  } else if (variante === "diagonal") {
    const diagonaux = d.plansSommets.filter((p) => !p.estFace);
    if (diagonaux.length === 0) return null;
    triple = melanger(choisir(diagonaux).sommets).slice(0, 3).map(parCle);
  } else {
    const k = Math.random() < 0.6 ? 1 : 2;
    const nonSommets = d.points.filter((p) => !p.sommet && p.definition!.type !== "centre");
    const sommets = d.points.filter((p) => p.sommet);
    triple = [...melanger(nonSommets).slice(0, k), ...melanger(sommets).slice(0, 3 - k)];
  }
  const geo = triple.map((p) => p.position) as Geo3;
  if (!nonAlignes(...geo)) return null;
  if (variante === "trois-points") {
    // Un vrai « plan par trois points » : pas une face ni un plan diagonal déguisés.
    if (Object.values(d.solide.sommets).filter((s) => pointAppartientAuPlan(s, geo)).length >= 3) return null;
  }
  if (!triangleLisible(cadre, geo)) return null;
  return { triple, geo };
}

// --- Droite d ------------------------------------------------------------------------------------

interface PaireDroite {
  x: PointDispoPercee;
  y: PointDispoPercee;
}

const CACHE_PAIRES = new Map<string, PaireDroite[][]>();

/** Droites candidates d'un solide, rangées en 4 listes : [dans une face ? 1 : 0][un sommet ? 1 : 0].
 * Au moins un point d'arête ou de face ; jamais une arête ni une diagonale (la droite ne passe pas
 * par deux sommets) ; assez longue sur le dessin. Énumération déterministe, en cache. */
function pairesDroites(d: DonneesPercee, cadre: CadrePercee): PaireDroite[][] {
  let listes = CACHE_PAIRES.get(d.solide.id);
  if (listes) return listes;
  listes = [[], [], [], []];
  const sommets = Object.values(d.solide.sommets);
  for (let i = 0; i < d.points.length; i++) {
    for (let j = i + 1; j < d.points.length; j++) {
      const p = d.points[i]!;
      const q = d.points[j]!;
      if (p.sommet && q.sommet) continue;
      const sur = sommets.filter((s) => distance3D(s, p.position) < EPSILON_3D || distance3D(s, q.position) < EPSILON_3D || points3Colineaires(p.position, q.position, s));
      if (sur.length >= 2) continue;
      if (distancePixel(cadre.pixel(p.position), cadre.pixel(q.position)) < 40) continue;
      const dansFace = p.faces.some((f) => q.faces.includes(f));
      const [x, y] = p.sommet ? [q, p] : [p, q];
      listes[(dansFace ? 2 : 0) + (y.sommet ? 1 : 0)]!.push({ x, y });
    }
  }
  CACHE_PAIRES.set(d.solide.id, listes);
  return listes;
}

function tirerDroite(d: DonneesPercee, alpha: Alpha, dansFace: boolean, cadre: CadrePercee): { x: PointDispoPercee; y: PointDispoPercee; percee: Point3D } | null {
  const listes = pairesDroites(d, cadre);
  for (let essai = 0; essai < 40; essai++) {
    const liste = listes[(dansFace ? 2 : 0) + (Math.random() < 0.45 ? 1 : 0)]!;
    if (liste.length === 0) continue;
    const paire = choisir(liste);
    const [x, y] = Math.random() < 0.5 || paire.y.sommet ? [paire.x, paire.y] : [paire.y, paire.x];
    if (pointAppartientAuPlan(x.position, alpha.geo) || pointAppartientAuPlan(y.position, alpha.geo)) continue;
    const percee = intersectionDroitePlan([x.position, y.position], alpha.geo);
    if (!percee || !pointRaisonnable(d.solide, percee, 0.5)) continue;
    return { x, y, percee };
  }
  return null;
}

// --- Plans auxiliaires ---------------------------------------------------------------------------

interface Construction {
  l: LigneNommee;
  m: LigneNommee;
  position: Point3D | null;
  commun: boolean;
}

interface AnalysePlan {
  geo: Geo3;
  contenus: Nomme[];
  communsNommes: Nomme[];
  correctes: Construction[];
  fausses: Construction[];
  gauches: Construction[];
}

interface Contexte {
  d: DonneesPercee;
  alpha: Geo3;
  nommes: Nomme[];
  lignes: LigneNommee[];
  ligneD: { a: Point3D; b: Point3D };
  percee: Point3D;
  estSommet: (n: string) => boolean;
}

function analyserPlan(ctx: Contexte, pi: Geo3): AnalysePlan {
  const { d, alpha, nommes, lignes, ligneD, percee } = ctx;
  const contenus = nommes.filter((n) => pointAppartientAuPlan(n.position, pi));
  const communsNommes = contenus.filter((n) => pointAppartientAuPlan(n.position, alpha));
  const pasD = (l: LigneNommee) => !memeDroite(l.a, l.b, ligneD.a, ligneD.b);
  const lp = lignes.filter((l) => pasD(l) && ligneDansPlan(l, pi));
  const la = lignes.filter((l) => ligneDansPlan(l, alpha));
  const vus: Point3D[] = [...nommes.map((n) => n.position), percee];
  const dejaVu = (x: Point3D) => vus.some((y) => distance3D(x, y) < EPSILON_3D);
  const correctes: Construction[] = [];
  const fausses: Construction[] = [];
  const gauches: Construction[] = [];
  for (const face of d.faces) {
    const dansFace = (l: LigneNommee) => ligneDansPlan(l, face);
    const lpf = lp.filter(dansFace);
    const laf = la.filter(dansFace);
    const lf = lignes.filter((l) => pasD(l) && dansFace(l));
    for (const l of lpf) {
      for (const m of laf) {
        if (memeDroite(l.a, l.b, m.a, m.b)) continue;
        const x = intersectionDroites(l.a, l.b, m.a, m.b);
        if (!x || dejaVu(x) || !pointRaisonnable(d.solide, x, 0.45)) continue;
        vus.push(x);
        correctes.push({ l, m, position: x, commun: true });
      }
    }
    for (const [lignesPlan, autre] of [
      [lpf, alpha],
      [laf, pi],
    ] as const) {
      for (const l of lignesPlan) {
        for (const m of lf) {
          if (ligneDansPlan(m, autre) || memeDroite(l.a, l.b, m.a, m.b)) continue;
          const x = intersectionDroites(l.a, l.b, m.a, m.b);
          if (!x || dejaVu(x) || pointAppartientAuPlan(x, autre) || !pointRaisonnable(d.solide, x, 0.45)) continue;
          if (fausses.some((c) => c.position && distance3D(c.position, x) < EPSILON_3D)) continue;
          fausses.push({ l, m, position: x, commun: false });
        }
      }
    }
  }
  for (const l of lp) {
    for (const m of la) {
      if (droitesParalleles(l.a, l.b, m.a, m.b) || intersectionDroites(l.a, l.b, m.a, m.b)) continue;
      const q = intersection2D(projeter(l.a), projeter(l.b), projeter(m.a), projeter(m.b));
      if (!q || !dansBoiteSolide(d.solide, q, 0.04)) continue;
      if (angleProjete(soustraire3D(l.b, l.a), soustraire3D(m.b, m.a)) < 20) continue;
      gauches.push({ l, m, position: null, commun: false });
    }
  }
  return { geo: pi, contenus, communsNommes, correctes, fausses, gauches };
}

function directionB(pi: Geo3, alpha: Geo3): Point3D {
  return produitVectoriel3D(normalePlan(...pi), normalePlan(...alpha));
}

// --- Noms des plans ------------------------------------------------------------------------------

interface Cibles {
  /** Le nom contient-il une lettre de d (jamais les deux) ? */
  lettreD: boolean;
  /** Le nom évite-t-il toute lettre du nom de α ? */
  sansAlpha: boolean;
}

function nommerPlan(contenus: Nomme[], cadre: CadrePercee, nomsD: string[], nomsAlpha: string[], cibles: Cibles, estSommet: (n: string) => boolean): [string, string, string] | null {
  const essayer = (sansAlpha: boolean) => {
    const triples: [Nomme[], number][] = [];
    for (let i = 0; i < contenus.length; i++) {
      for (let j = i + 1; j < contenus.length; j++) {
        for (let k = j + 1; k < contenus.length; k++) {
          const t = [contenus[i]!, contenus[j]!, contenus[k]!];
          const lettresD = t.filter((n) => nomsD.includes(n.nom)).length;
          if (lettresD !== (cibles.lettreD ? 1 : 0)) continue;
          const lettresAlpha = t.filter((n) => nomsAlpha.includes(n.nom)).length;
          if (lettresAlpha > (sansAlpha ? 0 : 1)) continue;
          if (!nonAlignes(t[0]!.position, t[1]!.position, t[2]!.position)) continue;
          if (!triangleLisible(cadre, t.map((n) => n.position))) continue;
          const autres = t.filter((n) => !estSommet(n.nom)).length;
          triples.push([t, [16, 3, 1, 1][autres]!]);
        }
      }
    }
    return triples;
  };
  let triples = essayer(cibles.sansAlpha);
  if (triples.length === 0 && cibles.sansAlpha) triples = essayer(false);
  if (triples.length === 0) return null;
  const t = tirerPondere(triples);
  const sommets = t.filter((n) => estSommet(n.nom)).map((n) => n.nom).sort();
  const autres = t.filter((n) => !estSommet(n.nom)).map((n) => n.nom).sort();
  return [...sommets, ...autres] as [string, string, string];
}

// --- Écran 2 : candidats -------------------------------------------------------------------------

function libelleLigne(l: LigneNommee): string {
  return `(${l.noms[0]}${l.noms[1]})`;
}

interface SuiteBrute {
  analyse: AnalysePlan;
  constructions: Construction[];
}

function choisirConstructions(a: AnalysePlan): Construction[] | null {
  const n = a.communsNommes.length;
  if (n + a.correctes.length < 2) return null;
  if (a.fausses.length + a.gauches.length === 0) return null;
  const nbCorrectes = n >= 2 ? (a.correctes.length > 0 && Math.random() < 0.5 ? 1 : 0) : Math.min(a.correctes.length, 2 - n + (Math.random() < 0.5 ? 1 : 0));
  const correctes = melanger(a.correctes).slice(0, Math.max(nbCorrectes, 2 - n));
  const gauches = melanger(a.gauches).slice(0, a.gauches.length > 0 ? 1 + (Math.random() < 0.3 ? 1 : 0) : 0);
  const fausses = melanger(a.fausses).slice(0, Math.max(1, 4 - correctes.length - gauches.length));
  return melanger([...correctes, ...gauches, ...fausses]).slice(0, 5);
}

// --- Écran 3 : points numérotés ------------------------------------------------------------------

interface SegmentDessine {
  a: Point3D;
  b: Point3D;
  nom: string;
}

function anneaux(
  ctx: Contexte,
  cadre: CadrePercee,
  segments: SegmentDessine[],
  paire: [Point3D, Point3D],
  pixelsNommes: Point2D[],
): CandidatPercee[] | null {
  const { ligneD, percee, alpha } = ctx;
  const pd1 = cadre.pixel(ligneD.a);
  const pd2 = cadre.pixel(ligneD.b);
  const pP = cadre.pixel(percee);
  const pb1 = cadre.pixel(paire[0]);
  const pb2 = cadre.pixel(paire[1]);
  const distanceALigneB = (q: Point2D) => {
    const dx = pb2.x - pb1.x;
    const dy = pb2.y - pb1.y;
    return Math.abs((q.x - pb1.x) * dy - (q.y - pb1.y) * dx) / Math.hypot(dx, dy);
  };
  const vus: SegmentDessine[] = [];
  const bruts: { q: Point2D; seg: SegmentDessine; position: Point3D | null; priorite: number }[] = [];
  for (const seg of segments) {
    if (vus.some((v) => memeDroite(v.a, v.b, seg.a, seg.b))) continue;
    vus.push(seg);
    if (droitesParalleles(ligneD.a, ligneD.b, seg.a, seg.b) || memeDroite(ligneD.a, ligneD.b, seg.a, seg.b)) continue;
    const s1 = cadre.pixel(seg.a);
    const s2 = cadre.pixel(seg.b);
    const q = intersection2D(pd1, pd2, s1, s2);
    if (!q) continue;
    const l2 = (s2.x - s1.x) ** 2 + (s2.y - s1.y) ** 2;
    const u = ((q.x - s1.x) * (s2.x - s1.x) + (q.y - s1.y) * (s2.y - s1.y)) / l2;
    if (u < 0.08 || u > 0.92) continue;
    if (!dansCadre(q, 18)) continue;
    if (pixelsNommes.some((p) => distancePixel(p, q) < 16)) continue;
    if (distancePixel(q, pP) < 24 || distanceALigneB(q) < 14) continue;
    const position = intersectionDroites(ligneD.a, ligneD.b, seg.a, seg.b);
    if (position && distance3D(position, percee) < EPSILON_3D) continue;
    const priorite = !position && ligneDansPlan(seg, alpha) ? 0 : !position ? 1 : 2;
    bruts.push({ q, seg, position, priorite });
  }
  const tries = melanger(bruts).sort((x, y) => x.priorite - y.priorite);
  const retenus: typeof bruts = [];
  const cibleFaux = Math.random() < 0.5 ? 2 : 3;
  for (const b of tries) {
    if (retenus.length >= cibleFaux) break;
    if (retenus.some((r) => distancePixel(r.q, b.q) < 24)) continue;
    retenus.push(b);
  }
  if (retenus.length < 2) return null;
  const param = (q: Point2D) => (q.x - pd1.x) * (pd2.x - pd1.x) + (q.y - pd1.y) * (pd2.y - pd1.y);
  const tous = [
    { q: pP, nature: "percee" as NatureCandidatPercee, appui: paire, nomAppui: "", position: percee as Point3D | null },
    ...retenus.map((r) => ({ q: r.q, nature: (r.position ? "horsPlan" : "gauche") as NatureCandidatPercee, appui: [r.seg.a, r.seg.b] as [Point3D, Point3D], nomAppui: r.seg.nom, position: r.position })),
  ].sort((x, y) => param(x.q) - param(y.q));
  return tous.map((t, i) => ({ numero: i + 1, nature: t.nature, appui: t.appui, nomAppui: t.nomAppui, position: t.position }));
}

// --- Génération ----------------------------------------------------------------------------------

/** Pas de tétraèdre pour une face : deux arêtes opposées touchent toutes les faces, d serait presque
 * toujours dans une face voisine de α. */
const SOLIDES_FACE: NomSolide3D[] = GABARITS_TOUS.filter((n) => n !== "tetraedre");
const SOLIDES: NomSolide3D[] = GABARITS_TOUS;
const SOLIDES_DIAGONAL: NomSolide3D[] = GABARITS_TOUS.filter((n) => n !== "tetraedre");

function genererPercee(variante: VariantePercee): ExercicePercee {
  const dansFace = Math.random() < 0.5;
  const nombreValides = Math.random() < 0.8 ? 2 : 1;
  // Point de percée hors du solide (prolongements) : visé une fois sur trois pour les plans diagonaux
  // et par trois points ; pour une face, la géométrie le place presque toujours hors du solide.
  const horsVise = Math.random() < 0.35;
  const cibles: Cibles[] = Array.from({ length: NOMBRE_OPTIONS }, () => ({ lettreD: Math.random() < 0.5, sansAlpha: Math.random() < 0.85 }));
  const solides = variante === "diagonal" ? SOLIDES_DIAGONAL : variante === "face" ? SOLIDES_FACE : SOLIDES;
  let nomSolide = choisir(solides);
  for (let tentative = 0; tentative < 4000; tentative++) {
    if (tentative > 0 && tentative % 200 === 0) nomSolide = choisir(solides);
    const solide = GABARITS_SOLIDE3D[nomSolide];
    const d = donneesPercee(solide);
    const cadreSolide = cadrePercee(solide, []);
    const alpha = tirerAlpha(d, variante, cadreSolide);
    if (!alpha) continue;
    const droite = tirerDroite(d, alpha, dansFace, cadreSolide);
    if (!droite) continue;
    const { x, y, percee } = droite;
    if (variante !== "face" && !dansSolide(d, percee) !== horsVise) continue;

    // Noms : I, J, K, L pour les points autres que les sommets, dans l'ordre de l'énoncé.
    const aNommer: PointDispoPercee[] = [];
    for (const p of [x, y, ...alpha.triple]) if (!p.sommet && !aNommer.includes(p)) aNommer.push(p);
    const nomDe = new Map<string, string>();
    const points: PointNommePercee[] = aNommer.map((p, i) => {
      nomDe.set(p.cle, LETTRES[i]!);
      return { nom: LETTRES[i]!, position: p.position, definition: p.definition! };
    });
    const nom = (p: PointDispoPercee) => p.sommet ?? nomDe.get(p.cle)!;
    const estSommet = (n: string) => solide.sommets[n] !== undefined;
    const nommes: Nomme[] = [...Object.entries(solide.sommets).map(([n, position]) => ({ nom: n, position })), ...points.map((p) => ({ nom: p.nom, position: p.position }))];
    if (nommes.some((n) => distance3D(n.position, percee) < EPSILON_3D)) continue;

    const nomsD = [nom(x), nom(y)].sort((a, b) => Number(!estSommet(a)) - Number(!estSommet(b)) || a.localeCompare(b)) as [string, string];
    const nomsAlpha = alpha.triple.map(nom);
    const plan = [...nomsAlpha.filter(estSommet).sort(), ...nomsAlpha.filter((n) => !estSommet(n)).sort()] as [string, string, string];
    const ctx: Contexte = { d, alpha: alpha.geo, nommes, lignes: lignesNommees(nommes, estSommet), ligneD: { a: x.position, b: y.position }, percee, estSommet };

    // Plans qui contiennent d : (XYZ) pour un point nommé Z hors de d.
    const plansD: Geo3[] = [];
    for (const z of nommes) {
      const geo: Geo3 = [x.position, y.position, z.position];
      if (!nonAlignes(...geo) || plansD.some((p) => plansEgaux(p, geo))) continue;
      plansD.push(geo);
    }
    const ddir = soustraire3D(y.position, x.position);
    const toutes = plansD.map((pi) => analyserPlan(ctx, pi));
    const exploitable = (a: AnalysePlan) => a.communsNommes.length + a.correctes.length >= 2 && a.fausses.length + a.gauches.length > 0 && angleProjete(directionB(a.geo, alpha.geo), ddir) >= 25;
    const exploitables = toutes.filter(exploitable);
    if (exploitables.length === 0) continue;

    // Cas particulier : d dans une face qui coupe α suivant une droite par deux points nommés.
    const directe = toutes.some((a) => d.faces.some((f) => plansEgaux(f, a.geo)) && a.communsNommes.length >= 2);

    // Options de l'écran 1. La première valable est « exploitable » : sa droite commune avec α se
    // construit avec les points de la figure (elle porte la suite de référence). La seconde, quand
    // il y en a deux, est n'importe quel autre plan qui contient d — un bon choix, accepté ; si sa
    // droite commune avec α ne se construit pas avec les points de la figure, la suite se fait
    // avec la première.
    const options: { nom: [string, string, string]; geo: Geo3; analyse: AnalysePlan | null; valide: boolean; manquant: string | null }[] = [];
    let echec = false;
    for (const a of melanger(exploitables)) {
      const n = nommerPlan(a.contenus, cadreSolide, nomsD, nomsAlpha, cibles[0]!, estSommet);
      if (!n) continue;
      options.push({ nom: n, geo: a.geo, analyse: a, valide: true, manquant: null });
      break;
    }
    if (options.length === 0) continue;
    if (nombreValides === 2) {
      for (const a of melanger(toutes)) {
        if (a.geo === options[0]!.geo) continue;
        const n = nommerPlan(a.contenus, cadreSolide, nomsD, nomsAlpha, cibles[1]!, estSommet);
        if (!n) continue;
        options.push({ nom: n, geo: a.geo, analyse: exploitable(a) ? a : null, valide: true, manquant: null });
        break;
      }
    }

    const unSeul = (geo: Geo3) => pointAppartientAuPlan(x.position, geo) !== pointAppartientAuPlan(y.position, geo);
    const parSommets = melanger(d.plansSommets.map((p) => p.geo).filter(unSeul));
    const aleatoires: Geo3[] = [];
    for (let k = 0; k < 30; k++) {
      const w = choisir([x, y]).position;
      const u = choisir(nommes).position;
      const v = choisir(nommes).position;
      const geo: Geo3 = [w, u, v];
      if (nonAlignes(...geo) && unSeul(geo)) aleatoires.push(geo);
    }
    for (let s = options.length; s < NOMBRE_OPTIONS && !echec; s++) {
      const groupes = Math.random() < 0.55 ? [parSommets, aleatoires] : [aleatoires, parSommets];
      let trouve = false;
      for (const groupe of groupes) {
        for (const geo of groupe) {
          if (plansEgaux(geo, alpha.geo) || options.some((o) => plansEgaux(o.geo, geo))) continue;
          const contenus = nommes.filter((n) => pointAppartientAuPlan(n.position, geo));
          const n = nommerPlan(contenus, cadreSolide, nomsD, nomsAlpha, cibles[s]!, estSommet);
          if (!n) continue;
          options.push({ nom: n, geo, analyse: null, valide: false, manquant: pointAppartientAuPlan(x.position, geo) ? nom(y) : nom(x) });
          trouve = true;
          break;
        }
        if (trouve) break;
      }
      if (!trouve) echec = true;
    }
    if (echec) continue;

    // Candidats de l'écran 2, puis cadre (élargi aux points construits et au point de percée).
    const brutes: (SuiteBrute | null)[] = options.map((o) => {
      if (!o.analyse) return null;
      const constructions = choisirConstructions(o.analyse);
      return constructions ? { analyse: o.analyse, constructions } : null;
    });
    if (options.some((o, i) => o.analyse && !brutes[i])) continue;
    const pointsCadre = [percee, ...brutes.flatMap((b) => (b ? b.constructions.filter((c) => c.position).map((c) => c.position!) : []))];
    const cadre = cadrePercee(solide, pointsCadre);
    if (cadre.echelle < 0.6 * cadreSolide.echelle) continue;
    const pixelsNommes = nommes.map((n) => cadre.pixel(n.position));
    // Lisibilité dans le cadre élargi : triangle de α encore net, étiquettes qui ne se chevauchent
    // pas (même placement que `ui/figurePercee.ts` : à 14 px du point, à l'opposé du centre).
    if (!triangleLisible(cadre, alpha.geo)) continue;
    const pixelsSommets = Object.values(solide.sommets).map(cadre.pixel);
    const centre = { x: pixelsSommets.reduce((s, p) => s + p.x, 0) / pixelsSommets.length, y: pixelsSommets.reduce((s, p) => s + p.y, 0) / pixelsSommets.length };
    const etiquettes = pixelsNommes.map((p) => {
      const l = Math.hypot(p.x - centre.x, p.y - centre.y) || 1;
      return { x: p.x + ((p.x - centre.x) / l) * 14, y: p.y + ((p.y - centre.y) / l) * 14 };
    });
    if (etiquettes.some((a, i) => etiquettes.some((b, k) => k > i && distancePixel(a, b) < 16))) continue;
    if (etiquettes.some((a, i) => pixelsNommes.some((b, k) => k !== i && distancePixel(a, b) < 9))) continue;
    const pP = cadre.pixel(percee);
    if (pixelsNommes.some((p) => distancePixel(p, pP) < 18)) continue;

    const segmentsCommuns: SegmentDessine[] = [
      ...d.aretes.map(([a, b]) => ({ a: solide.sommets[a]!, b: solide.sommets[b]!, nom: `(${a}${b})` })),
      ...[0, 1, 2].map((i) => {
        const [u, v] = [plan[i]!, plan[(i + 1) % 3]!].sort();
        return { a: nommes.find((n) => n.nom === u)!.position, b: nommes.find((n) => n.nom === v)!.position, nom: `(${u}${v})` };
      }),
    ];

    const resultat: OptionPlanAuxiliaire[] = [];
    for (let i = 0; i < options.length && !echec; i++) {
      const o = options[i]!;
      const brute = brutes[i];
      if (!brute) {
        resultat.push({ nom: o.nom, contientDroite: o.valide, pointManquant: o.manquant, suite: null });
        continue;
      }
      // Leurres « gauches » : leur croisement sur le dessin doit rester loin des points nommés.
      const constructions = brute.constructions.filter((c) => {
        if (c.position) return true;
        const q = intersection2D(cadre.pixel(c.l.a), cadre.pixel(c.l.b), cadre.pixel(c.m.a), cadre.pixel(c.m.b));
        return q !== null && dansCadre(q, 16) && pixelsNommes.every((p) => distancePixel(p, q) >= 12);
      });
      if (!constructions.some((c) => !c.commun)) {
        echec = true;
        break;
      }
      const tousNommes = [...nommes].sort((a, b) => Number(!estSommet(a.nom)) - Number(!estSommet(b.nom)) || a.nom.localeCompare(b.nom));
      const candidatsBruts = [
        ...tousNommes.map((n) => ({ libelle: n.nom, position: n.position as Point3D | null, construction: null as CandidatPointCommun["construction"], commun: brute.analyse.communsNommes.includes(n) })),
        ...constructions.map((c) => ({ libelle: `${libelleLigne(c.l)} ∩ ${libelleLigne(c.m)}`, position: c.position, construction: { droite1: c.l.noms, droite2: c.m.noms }, commun: c.commun })),
      ];
      const candidats: CandidatPointCommun[] = candidatsBruts.map((c, k) => ({ cle: `c${k}`, libelle: c.libelle, position: c.position, construction: c.construction }));
      // Paire révélée : le moins de constructions possible, puis les deux points les plus éloignés
      // sur le dessin (b se lit mieux) ; jamais deux points collés au point de percée.
      const communs = candidatsBruts.map((c, k) => (c.commun ? k : -1)).filter((k) => k >= 0);
      let meilleure: [number, number] | null = null;
      let meilleurScore = Infinity;
      for (let u = 0; u < communs.length; u++) {
        for (let v = u + 1; v < communs.length; v++) {
          const a = candidatsBruts[communs[u]!]!;
          const b = candidatsBruts[communs[v]!]!;
          const pa = cadre.pixel(a.position!);
          const pb = cadre.pixel(b.position!);
          const ecart = distancePixel(pa, pb);
          if (ecart < 30 || distancePixel(pa, pP) < 18 || distancePixel(pb, pP) < 18) continue;
          const score = (Number(a.construction !== null) + Number(b.construction !== null)) * 1000 - ecart;
          if (score < meilleurScore) {
            meilleurScore = score;
            meilleure = [communs[u]!, communs[v]!];
          }
        }
      }
      if (!meilleure) {
        echec = true;
        break;
      }
      const segmentsPi: SegmentDessine[] = [0, 1, 2].map((k) => {
        const [u, v] = [o.nom[k]!, o.nom[(k + 1) % 3]!].sort();
        return { a: nommes.find((n) => n.nom === u)!.position, b: nommes.find((n) => n.nom === v)!.position, nom: `(${u}${v})` };
      });
      const percees = anneaux(ctx, cadre, [...segmentsCommuns, ...segmentsPi], [candidats[meilleure[0]]!.position!, candidats[meilleure[1]]!.position!], pixelsNommes);
      if (!percees) {
        echec = true;
        break;
      }
      const suite: SuitePlanAuxiliaire = { candidats, paireAttendue: meilleure, percee: percees };
      resultat.push({ nom: o.nom, contientDroite: true, pointManquant: null, suite });
    }
    if (echec) continue;

    // Ordre mélangé ; l'option de référence est la valable dont la paire demande le moins de
    // constructions.
    const ordre = melanger(resultat.map((_, i) => i));
    const melangees = ordre.map((i) => resultat[i]!);
    const nbConstructions = (o: OptionPlanAuxiliaire) => (o.suite ? o.suite.paireAttendue.filter((k) => o.suite!.candidats[k]!.construction).length : 99);
    let reference = -1;
    melangees.forEach((o, i) => {
      if (o.suite && (reference < 0 || nbConstructions(o) < nbConstructions(melangees[reference]!))) reference = i;
    });

    return {
      variante,
      solide,
      points,
      droite: nomsD,
      plan,
      percee,
      options: melangees,
      reference,
      directe,
      pointsCadre,
    };
  }
  throw new Error(`gen102 : aucune instance « ${variante} » trouvée`);
}

// --- Catalogue -----------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VariantePercee; label: string }[] = [
  { id: "face", label: "Percée dans une face" },
  { id: "diagonal", label: "Percée dans un plan diagonal" },
  { id: "trois-points", label: "Percée dans un plan par trois points" },
];

export function construireAvecVariante(id: string): ExercicePercee {
  const variante = CATALOGUE_VARIANTES.find((v) => v.id === id)?.id ?? "face";
  return genererPercee(variante);
}

export function genererExercicePercee(): ExercicePercee {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
