import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type { DefinitionPointNomme } from "../../core/perceePlanAuxiliaire.types";
import { additionner3D, distance3D, EPSILON_3D, multiplierScalaire3D, normalePlan, pointAppartientAuPlan, produitScalaire3D, soustraire3D } from "../solide3D/geometrieEspace";
import { aretesSolide, memeDroite, nonAlignes, type Point2D } from "../positionsPlans/geometriePlans";

/**
 * Géométrie de gen102 (« Point de percée par plan auxiliaire ») — Couche A, vérité terrain calculée
 * depuis les coordonnées internes du solide (`generateurs/solide3D/`), jamais montrée à l'élève.
 * Réutilise les primitives de gen101 (`positionsPlans/geometriePlans.ts` : arêtes, droites
 * parallèles, même droite, intersection 2D) ; ce module ajoute ce dont gen102 a besoin en plus :
 *
 * - points disponibles plus variés : sommets, milieux des arêtes, points aux tiers des arêtes,
 *   centres des faces à quatre sommets ;
 * - plans passant par au moins trois sommets (faces et plans diagonaux) ;
 * - cadre de la figure ÉLARGI à des points supplémentaires (point de percée, points construits),
 *   même projection cavalière et même cadre 400 × 320 (marge 36 px) que `ui/figurePercee.ts` — la
 *   formule est recopiée de part et d'autre (la Couche A ne dépend jamais de la présentation, même
 *   choix que `positionsPlans/geometriePlans.ts`).
 *
 * Énumération DÉTERMINISTE (aucun `Math.random`) et mise en cache par solide : le tirage sous graine
 * (`genererAvecCode`) redonne la même instance que le cache soit rempli ou non.
 */

export interface PointDispoPercee {
  cle: string;
  position: Point3D;
  /** Nom du sommet, `null` pour un point d'arête ou de face. */
  sommet: string | null;
  definition: DefinitionPointNomme | null;
  /** Indices (dans `solide.faces`) des faces qui contiennent le point. */
  faces: number[];
}

export interface PlanSommets {
  geo: [Point3D, Point3D, Point3D];
  sommets: string[];
  estFace: boolean;
}

export interface DonneesPercee {
  solide: Solide3D;
  points: PointDispoPercee[];
  /** Plan de chaque face (trois premiers sommets). */
  faces: [Point3D, Point3D, Point3D][];
  aretes: [string, string][];
  plansSommets: PlanSommets[];
}

function plansEgaux(p: [Point3D, Point3D, Point3D], q: [Point3D, Point3D, Point3D]): boolean {
  return q.every((x) => pointAppartientAuPlan(x, p));
}

function construireDonnees(solide: Solide3D): DonneesPercee {
  const faces = solide.faces.map((f) => [solide.sommets[f[0]!]!, solide.sommets[f[1]!]!, solide.sommets[f[2]!]!] as [Point3D, Point3D, Point3D]);
  const aretes = aretesSolide(solide);
  const facesDe = (p: Point3D) => faces.map((f, i) => (pointAppartientAuPlan(p, f) ? i : -1)).filter((i) => i >= 0);
  const points: PointDispoPercee[] = Object.entries(solide.sommets).map(([nom, position]) => ({ cle: nom, position, sommet: nom, definition: null, faces: facesDe(position) }));
  for (const [a, b] of aretes) {
    const pa = solide.sommets[a]!;
    const pb = solide.sommets[b]!;
    const en = (t: number) => additionner3D(pa, multiplierScalaire3D(soustraire3D(pb, pa), t));
    const ajouter = (cle: string, position: Point3D, definition: DefinitionPointNomme) => points.push({ cle, position, sommet: null, definition, faces: facesDe(position) });
    ajouter(`m${a}${b}`, en(0.5), { type: "milieu", arete: [a, b] });
    ajouter(`t${a}${b}`, en(1 / 3), { type: "tiers", depuis: a, vers: b });
    ajouter(`t${b}${a}`, en(2 / 3), { type: "tiers", depuis: b, vers: a });
  }
  solide.faces.forEach((f) => {
    if (f.length !== 4) return;
    const somme = f.reduce((s, n) => additionner3D(s, solide.sommets[n]!), { x: 0, y: 0, z: 0 });
    const position = multiplierScalaire3D(somme, 1 / 4);
    points.push({ cle: `c${f.join("")}`, position, sommet: null, definition: { type: "centre", face: f.join("") }, faces: facesDe(position) });
  });

  const noms = Object.keys(solide.sommets);
  const plansSommets: PlanSommets[] = [];
  for (let i = 0; i < noms.length; i++) {
    for (let j = i + 1; j < noms.length; j++) {
      for (let k = j + 1; k < noms.length; k++) {
        const geo: [Point3D, Point3D, Point3D] = [solide.sommets[noms[i]!]!, solide.sommets[noms[j]!]!, solide.sommets[noms[k]!]!];
        if (!nonAlignes(...geo)) continue;
        if (plansSommets.some((p) => plansEgaux(p.geo, geo))) continue;
        const sommets = noms.filter((n) => pointAppartientAuPlan(solide.sommets[n]!, geo));
        plansSommets.push({ geo, sommets, estFace: faces.some((f) => plansEgaux(f, geo)) });
      }
    }
  }
  return { solide, points, faces, aretes, plansSommets };
}

const CACHE = new Map<string, DonneesPercee>();

export function donneesPercee(solide: Solide3D): DonneesPercee {
  let d = CACHE.get(solide.id);
  if (!d) {
    d = construireDonnees(solide);
    CACHE.set(solide.id, d);
  }
  return d;
}

// --- Cadre de la figure ---------------------------------------------------------------------------

const LARGEUR = 400;
const HAUTEUR = 320;
const MARGE = 36;
const K_OBLIQUE = 0.5 * Math.SQRT1_2;

export function projeter(p: Point3D): Point2D {
  return { x: p.x + p.y * K_OBLIQUE, y: p.z + p.y * K_OBLIQUE };
}

export interface CadrePercee {
  echelle: number;
  pixel: (p: Point3D) => Point2D;
}

/** Même formule que `ui/figurePercee.ts::cadreFigure` : le solide et les points `extra` tiennent
 * dans 400 × 320 avec une marge de 36 px. */
export function cadrePercee(solide: Solide3D, extra: Point3D[]): CadrePercee {
  const tous = [...Object.values(solide.sommets), ...extra].map(projeter);
  const minX = Math.min(...tous.map((p) => p.x));
  const maxX = Math.max(...tous.map((p) => p.x));
  const minY = Math.min(...tous.map((p) => p.y));
  const maxY = Math.max(...tous.map((p) => p.y));
  const l = maxX - minX || 1;
  const h = maxY - minY || 1;
  const zl = LARGEUR - 2 * MARGE;
  const zh = HAUTEUR - 2 * MARGE;
  const echelle = Math.min(zl / l, zh / h);
  const dx = MARGE + (zl - l * echelle) / 2;
  const dy = MARGE + (zh - h * echelle) / 2;
  return {
    echelle,
    pixel: (p) => {
      const q = projeter(p);
      return { x: dx + (q.x - minX) * echelle, y: HAUTEUR - dy - (q.y - minY) * echelle };
    },
  };
}

export function dansCadre(p: Point2D, marge = 14): boolean {
  return p.x >= marge && p.x <= LARGEUR - marge && p.y >= marge && p.y <= HAUTEUR - marge;
}

/** Le point projeté reste dans le rectangle du solide projeté, élargi de `marge` (proportion). */
export function dansBoiteSolide(solide: Solide3D, q: Point2D, marge = 0.08): boolean {
  const pts = Object.values(solide.sommets).map(projeter);
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));
  const mx = marge * (maxX - minX);
  const my = marge * (maxY - minY);
  return q.x >= minX - mx && q.x <= maxX + mx && q.y >= minY - my && q.y <= maxY + my;
}

/** Un point assez proche du solide (chaque coordonnée à moins de `marge` × l'étendue du solide). */
export function pointRaisonnable(solide: Solide3D, p: Point3D, marge: number): boolean {
  const s = Object.values(solide.sommets);
  return (["x", "y", "z"] as const).every((ax) => {
    const min = Math.min(...s.map((q) => q[ax]));
    const max = Math.max(...s.map((q) => q[ax]));
    const m = marge * (max - min || 1);
    return p[ax] >= min - m && p[ax] <= max + m;
  });
}

/** Le point est-il dans le solide (convexe), bord compris ? */
export function dansSolide(d: DonneesPercee, p: Point3D): boolean {
  const sommets = Object.values(d.solide.sommets);
  const centre = multiplierScalaire3D(sommets.reduce((s, x) => additionner3D(s, x), { x: 0, y: 0, z: 0 }), 1 / sommets.length);
  return d.faces.every((f) => {
    const n = normalePlan(...f);
    const cote = produitScalaire3D(n, soustraire3D(centre, f[0]));
    return produitScalaire3D(n, soustraire3D(p, f[0])) * Math.sign(cote) >= -EPSILON_3D;
  });
}

// --- Droites nommées -------------------------------------------------------------------------------

export interface Nomme {
  nom: string;
  position: Point3D;
}

export interface LigneNommee {
  noms: [string, string];
  a: Point3D;
  b: Point3D;
}

/** Droites passant par deux points nommés, dédupliquées (une droite qui porte trois points nommés
 * n'est gardée qu'une fois, sous le nom de deux sommets si possible). */
export function lignesNommees(nommes: Nomme[], estSommet: (n: string) => boolean): LigneNommee[] {
  const paires: LigneNommee[] = [];
  for (let i = 0; i < nommes.length; i++) {
    for (let j = i + 1; j < nommes.length; j++) {
      const p = nommes[i]!;
      const q = nommes[j]!;
      if (distance3D(p.position, q.position) < EPSILON_3D) continue;
      const [u, v] = [p, q].sort((x, y) => x.nom.localeCompare(y.nom));
      paires.push({ noms: [u!.nom, v!.nom], a: u!.position, b: v!.position });
    }
  }
  const rang = (l: LigneNommee) => Number(!estSommet(l.noms[0])) + Number(!estSommet(l.noms[1]));
  paires.sort((x, y) => rang(x) - rang(y) || x.noms.join("").localeCompare(y.noms.join("")));
  const resultat: LigneNommee[] = [];
  for (const p of paires) {
    if (resultat.some((r) => memeDroite(r.a, r.b, p.a, p.b))) continue;
    resultat.push(p);
  }
  return resultat;
}

export function ligneDansPlan(l: { a: Point3D; b: Point3D }, plan: [Point3D, Point3D, Point3D]): boolean {
  return pointAppartientAuPlan(l.a, plan) && pointAppartientAuPlan(l.b, plan);
}
