import type {
  CandidatSecantePositionDroitePlan,
  CandidatSegmentPositionDroitePlan,
  ConclusionPositionDroitePlan,
  ExercicePositionDroitePlan,
  GenerateurExercicePositionDroitePlan,
  PointNommePositionDroitePlan,
} from "../../core/positionDroitePlan.types";
import type { NomSolide3D, PlanSolide3D, Point3D, Solide3D } from "../../core/geometrieEspace.types";
import {
  additionner3D,
  distance3D,
  droiteParalleleAuPlan,
  EPSILON_3D,
  intersectionDroitePlan,
  multiplierScalaire3D,
  normalePlan,
  normeCarree3D,
  pointAppartientAuPlan,
  pointSurSegmentOuvert,
  sontParalleles3D,
  soustraire3D,
} from "../solide3D/geometrieEspace";
import { GABARITS_POSITION_DROITE_PLAN, GABARITS_SOLIDE3D, tirerNomGabarit } from "../solide3D/gabarits";
import { projeterPoint3D, type Point2D } from "../../ui/projectionCavaliere";

/**
 * Couche A — "Position d'une droite par rapport à un plan" (39e générateur, chapitre "Géométrie
 * dans l'espace"). Catalogue FERMÉ des 3 gabarits (`GABARITS_POSITION_DROITE_PLAN`) — seule la
 * combinaison plan/droite varie d'une instance à l'autre, jamais la forme du solide.
 *
 * **Énumération-puis-filtrage** : pour un gabarit, toutes les droites candidates (paires de points
 * parmi les sommets ET les milieux d'arêtes) et tous les plans (passant par au moins 3 sommets,
 * dédupliqués) sont énumérés une seule fois puis rangés par catégorie dans un cache — quelques
 * milliers de combinaisons au plus.
 *
 * **Audit chapitre 8** :
 * - H1a : une droite peut passer par le milieu nommé d'une arête (I, J). Le point de percée d'une
 *   sécante tombe alors aussi à l'intérieur d'une arête, ou sur un sommet qui n'est pas un point de
 *   la droite — plus seulement sur une extrémité de la droite (100 % des cas avant).
 * - Le plan est NOMMÉ par 3 de ses sommets tirés au hasard (un plan de face en a 4) : avant, son nom
 *   contenait toujours les points de la droite qui lui appartiennent, et compter les lettres
 *   communes aux deux noms suffisait à classer (79 % de réussite sans regarder la figure).
 */

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function tirerPondere<T>(options: { valeur: T; poids: number }[]): T {
  const total = options.reduce((s, o) => s + o.poids, 0);
  let r = Math.random() * total;
  for (const option of options) {
    r -= option.poids;
    if (r <= 0) return option.valeur;
  }
  return options[options.length - 1].valeur;
}

function pairesDistinctes<T>(liste: T[]): [T, T][] {
  const paires: [T, T][] = [];
  for (let i = 0; i < liste.length; i++) {
    for (let j = i + 1; j < liste.length; j++) {
      paires.push([liste[i], liste[j]]);
    }
  }
  return paires;
}

function triplesDistincts<T>(liste: T[]): [T, T, T][] {
  const triples: [T, T, T][] = [];
  for (let i = 0; i < liste.length; i++) {
    for (let j = i + 1; j < liste.length; j++) {
      for (let k = j + 1; k < liste.length; k++) {
        triples.push([liste[i], liste[j], liste[k]]);
      }
    }
  }
  return triples;
}

function aretesSolide(solide: Solide3D): [string, string][] {
  const cles = new Set<string>();
  const aretes: [string, string][] = [];
  for (const face of solide.faces) {
    for (let i = 0; i < face.length; i++) {
      const [a, b] = [face[i], face[(i + 1) % face.length]].sort();
      const cle = `${a}${b}`;
      if (cles.has(cle)) continue;
      cles.add(cle);
      aretes.push([a, b]);
    }
  }
  return aretes;
}

function estAreteSolide(solide: Solide3D, paire: [string, string]): boolean {
  return aretesSolide(solide).some(([a, b]) => (a === paire[0] && b === paire[1]) || (a === paire[1] && b === paire[0]));
}

function labelSegment(solide: Solide3D, paire: [string, string]): string {
  const [a, b] = paire;
  return estAreteSolide(solide, paire) ? `arête ${a}${b}` : `diagonale ${a}${b}`;
}

// --- Points disponibles : sommets + milieux d'arêtes -----------------------------------------------

/** Un point utilisable pour définir une droite — un sommet, ou le milieu (encore anonyme) d'une
 * arête ; le nom I/J n'est attribué qu'une fois l'instance retenue. */
interface PointCandidat {
  cle: string;
  position: Point3D;
  sommet: string | null;
  milieuDe: [string, string] | null;
}

function pointsCandidats(solide: Solide3D): PointCandidat[] {
  const sommets: PointCandidat[] = Object.entries(solide.sommets).map(([nom, position]) => ({ cle: nom, position, sommet: nom, milieuDe: null }));
  const milieux: PointCandidat[] = aretesSolide(solide).map(([a, b]) => ({
    cle: `m${a}${b}`,
    position: multiplierScalaire3D(additionner3D(solide.sommets[a], solide.sommets[b]), 0.5),
    sommet: null,
    milieuDe: [a, b],
  }));
  return [...sommets, ...milieux];
}

// --- Plans : au moins 3 sommets, dédupliqués ---------------------------------------------------------

interface PlanCandidat {
  points: [Point3D, Point3D, Point3D];
  /** Tous les sommets du solide qui appartiennent au plan (3 ou plus). */
  sommets: string[];
}

function plansCandidats(solide: Solide3D): PlanCandidat[] {
  const noms = Object.keys(solide.sommets);
  const vus = new Set<string>();
  const plans: PlanCandidat[] = [];
  for (const triple of triplesDistincts(noms)) {
    const points = triple.map((n) => solide.sommets[n]) as [Point3D, Point3D, Point3D];
    if (normeCarree3D(normalePlan(...points)) < EPSILON_3D) continue;
    const sommets = noms.filter((n) => pointAppartientAuPlan(solide.sommets[n], points));
    const cle = sommets.join("");
    if (vus.has(cle)) continue;
    vus.add(cle);
    plans.push({ points, sommets });
  }
  return plans;
}

// --- Catégories -----------------------------------------------------------------------------------

/** Type de droite selon ses points : 2 sommets, 1 sommet + 1 milieu, 2 milieux. */
type TypeDroite = "SS" | "SM" | "MM";

/** Où tombe le point de percée d'une sécante : sur un des 2 points de la droite, ou ailleurs (un
 * autre sommet, ou l'intérieur d'une arête). */
type CiblePercee = "pointDeLaDroite" | "ailleurs";

interface InstanceBrute {
  plan: PlanCandidat;
  p: PointCandidat;
  q: PointCandidat;
  typeDroite: TypeDroite;
  classification: ConclusionPositionDroitePlan;
  /** Sécante uniquement. */
  percee?: { point: Point3D; cible: CandidatSecanteBrut; categorie: CiblePercee };
  /** Parallèle uniquement. */
  candidatsParallele?: CandidatSegmentPositionDroitePlan[];
}

/** Cible de percée AVANT attribution des noms I/J (`point` désigne un `PointCandidat.cle`). */
type CandidatSecanteBrut = { type: "sommet"; nom: string } | { type: "point"; cle: string } | { type: "arete"; sommets: [string, string] };

function typeDroite(p: PointCandidat, q: PointCandidat): TypeDroite {
  const milieux = (p.milieuDe ? 1 : 0) + (q.milieuDe ? 1 : 0);
  return milieux === 0 ? "SS" : milieux === 1 ? "SM" : "MM";
}

/** Rejette une droite confondue avec la droite d'une arête (ex. (AI) avec I milieu de [AB] : c'est
 * (AB) sous un autre nom). */
function droiteSurUneArete(solide: Solide3D, p: PointCandidat, q: PointCandidat): boolean {
  return aretesSolide(solide).some(([a, b]) => {
    const pa = solide.sommets[a];
    const pb = solide.sommets[b];
    const direction = soustraire3D(pb, pa);
    const surDroiteArete = (x: Point3D) => sontParalleles3D(direction, soustraire3D(x, pa)) || distance3D(x, pa) < EPSILON_3D;
    return surDroiteArete(p.position) && surDroiteArete(q.position) && (p.milieuDe !== null || q.milieuDe !== null);
  });
}

function construireCandidatsParallele(solide: Solide3D, plan: PlanCandidat): CandidatSegmentPositionDroitePlan[] {
  const candidats: CandidatSegmentPositionDroitePlan[] = [];
  for (const paire of pairesDistinctes(plan.sommets)) {
    const direction = soustraire3D(solide.sommets[paire[1]], solide.sommets[paire[0]]);
    const dejaRepresente = candidats.some((c) => sontParalleles3D(direction, soustraire3D(solide.sommets[c.sommets[1]], solide.sommets[c.sommets[0]])));
    if (!dejaRepresente) candidats.push({ type: "segment", sommets: paire, label: labelSegment(solide, paire) });
  }
  return candidats;
}

/** Cible de percée d'une sécante — un point de la droite, un autre sommet, l'intérieur d'une arête,
 * ou l'intérieur d'une diagonale du plan (ex. (DE) perce le plan (ABG) au milieu de [AH]) ; `null`
 * si le point de percée n'est sur aucun de ces éléments (dans une face, à l'intérieur du solide, ou
 * hors du solide) : instance rejetée. Un plan passant par 3 sommets ne coupe jamais une arête
 * ailleurs qu'en un sommet : sans les diagonales, le point de percée tombait toujours sur un point
 * de la droite. */
function ciblePercee(
  solide: Solide3D,
  plan: PlanCandidat,
  point: Point3D,
  p: PointCandidat,
  q: PointCandidat,
): { cible: CandidatSecanteBrut; categorie: CiblePercee } | null {
  for (const extremite of [p, q]) {
    if (distance3D(extremite.position, point) < EPSILON_3D) {
      const cible: CandidatSecanteBrut = extremite.sommet ? { type: "sommet", nom: extremite.sommet } : { type: "point", cle: extremite.cle };
      return { cible, categorie: "pointDeLaDroite" };
    }
  }
  for (const [nom, position] of Object.entries(solide.sommets)) {
    if (distance3D(position, point) < EPSILON_3D) return { cible: { type: "sommet", nom }, categorie: "ailleurs" };
  }
  const arete = aretesSolide(solide).find(([a, b]) => pointSurSegmentOuvert(point, solide.sommets[a], solide.sommets[b]));
  if (arete) return { cible: { type: "arete", sommets: arete }, categorie: "ailleurs" };
  const diagonale = pairesDistinctes(plan.sommets).find(([a, b]) => pointSurSegmentOuvert(point, solide.sommets[a], solide.sommets[b]));
  if (diagonale) return { cible: { type: "arete", sommets: diagonale }, categorie: "ailleurs" };
  return null;
}

// --- Lisibilité sur le croquis (projection cavalière) ------------------------------------------------

function aireEnveloppe(points: Point2D[]): number {
  const pts = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (pts.length < 3) return 0;
  const croix = (o: Point2D, a: Point2D, b: Point2D) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const bas: Point2D[] = [];
  for (const p of pts) {
    while (bas.length >= 2 && croix(bas[bas.length - 2], bas[bas.length - 1], p) <= 0) bas.pop();
    bas.push(p);
  }
  const haut: Point2D[] = [];
  for (const p of [...pts].reverse()) {
    while (haut.length >= 2 && croix(haut[haut.length - 2], haut[haut.length - 1], p) <= 0) haut.pop();
    haut.push(p);
  }
  const enveloppe = [...bas.slice(0, -1), ...haut.slice(0, -1)];
  let aire = 0;
  for (let i = 0; i < enveloppe.length; i++) {
    const a = enveloppe[i];
    const b = enveloppe[(i + 1) % enveloppe.length];
    aire += a.x * b.y - b.x * a.y;
  }
  return Math.abs(aire) / 2;
}

/** Un plan vu presque par la tranche (ex. le triangle BCD du prisme) se réduit à un trait sur le
 * croquis : on n'en garde que ceux dont la surface dessinée vaut au moins 12 % de celle du solide. */
function planLisible(solide: Solide3D, plan: PlanCandidat): boolean {
  const aireSolide = aireEnveloppe(Object.values(solide.sommets).map(projeterPoint3D));
  const airePlan = aireEnveloppe(plan.sommets.map((n) => projeterPoint3D(solide.sommets[n])));
  return airePlan >= 0.12 * aireSolide;
}

/** Angle (degrés, entre 0 et 90) entre les projections de deux directions 3D. */
function angleProjete(u: Point3D, v: Point3D): number {
  const pu = projeterPoint3D(u);
  const pv = projeterPoint3D(v);
  const nu = Math.hypot(pu.x, pu.y);
  const nv = Math.hypot(pv.x, pv.y);
  if (nu < 1e-9 || nv < 1e-9) return 0;
  const cos = Math.abs(pu.x * pv.x + pu.y * pv.y) / (nu * nv);
  return (Math.acos(Math.min(1, cos)) * 180) / Math.PI;
}

/** Une droite dont la projection est un POINT (parallèle à la direction de projection) ne se voit
 * pas : rejetée. Pour une sécante qui perce le plan à l'intérieur d'un segment, la droite ne doit pas
 * se confondre à l'écran avec ce segment (écart d'au moins 15°). */
function droiteLisible(solide: Solide3D, p: PointCandidat, q: PointCandidat, cible: CandidatSecanteBrut | null): boolean {
  const direction = soustraire3D(q.position, p.position);
  const projetee = projeterPoint3D(direction);
  if (Math.hypot(projetee.x, projetee.y) < 0.15 * Math.sqrt(normeCarree3D(direction))) return false;
  if (cible?.type === "arete") {
    const segment = soustraire3D(solide.sommets[cible.sommets[1]], solide.sommets[cible.sommets[0]]);
    if (angleProjete(direction, segment) < 15) return false;
  }
  return true;
}

function enumererInstances(solide: Solide3D): InstanceBrute[] {
  const points = pointsCandidats(solide);
  const plans = plansCandidats(solide).filter((plan) => planLisible(solide, plan));
  const instances: InstanceBrute[] = [];
  for (const [p, q] of pairesDistinctes(points)) {
    if (droiteSurUneArete(solide, p, q) || !droiteLisible(solide, p, q, null)) continue;
    const type = typeDroite(p, q);
    const direction = soustraire3D(q.position, p.position);
    for (const plan of plans) {
      const pDansPlan = pointAppartientAuPlan(p.position, plan.points);
      const qDansPlan = pointAppartientAuPlan(q.position, plan.points);
      if (pDansPlan && qDansPlan) {
        instances.push({ plan, p, q, typeDroite: type, classification: "incluse" });
        continue;
      }
      if (droiteParalleleAuPlan(direction, plan.points)) {
        const candidats = construireCandidatsParallele(solide, plan);
        if (candidats.length < 3) continue;
        if (!candidats.some((c) => sontParalleles3D(direction, soustraire3D(solide.sommets[c.sommets[1]], solide.sommets[c.sommets[0]])))) continue;
        instances.push({ plan, p, q, typeDroite: type, classification: "parallele", candidatsParallele: candidats });
        continue;
      }
      const point = intersectionDroitePlan([p.position, q.position], plan.points);
      if (!point) continue;
      const cible = ciblePercee(solide, plan, point, p, q);
      if (!cible || !droiteLisible(solide, p, q, cible.cible)) continue;
      instances.push({ plan, p, q, typeDroite: type, classification: "secante", percee: { point, ...cible } });
    }
  }
  return instances;
}

const CACHE_INSTANCES = new Map<string, InstanceBrute[]>();

function instancesDe(solide: Solide3D): InstanceBrute[] {
  let instances = CACHE_INSTANCES.get(solide.id);
  if (!instances) {
    instances = enumererInstances(solide);
    CACHE_INSTANCES.set(solide.id, instances);
  }
  return instances;
}

// --- Assemblage d'une instance retenue --------------------------------------------------------------

const NOMS_POINTS = ["I", "J"];

/** Nom du plan : 3 de ses sommets non alignés, tirés au hasard — en partageant le MOINS possible
 * de lettres avec la droite (9 fois sur 10), sinon le nom trahirait l'appartenance des points de la
 * droite au plan. */
function nommerPlan(solide: Solide3D, plan: PlanCandidat, sommetsDroite: string[]): PlanSolide3D {
  const triples = triplesDistincts(plan.sommets).filter(
    (t) => normeCarree3D(normalePlan(solide.sommets[t[0]], solide.sommets[t[1]], solide.sommets[t[2]])) > EPSILON_3D,
  );
  const partage = (t: string[]) => t.filter((n) => sommetsDroite.includes(n)).length;
  const minimum = Math.min(...triples.map(partage));
  const moinsPartages = triples.filter((t) => partage(t) === minimum);
  const pool = Math.random() < 0.9 ? moinsPartages : triples;
  return melanger([...pool[randomInt(0, pool.length - 1)]]) as PlanSolide3D;
}

/** Libellé d'une cible « intérieur de segment » — arête du solide, ou diagonale (d'une face ou du
 * solide). */
function libelleSegmentPercee(solide: Solide3D, paire: [string, string]): string {
  return estAreteSolide(solide, paire) ? `un point de l'arête [${paire[0]}${paire[1]}]` : `un point de la diagonale [${paire[0]}${paire[1]}]`;
}

/** Distracteurs de l'écran 2 "sécante" — les points de la droite (tentants), des sommets et des
 * arêtes du plan, tous GÉOMÉTRIQUEMENT faux (le point de percée n'y est pas). */
function construireCandidatsSecante(
  solide: Solide3D,
  instance: InstanceBrute,
  cible: CandidatSecantePositionDroitePlan,
  nomDe: (c: PointCandidat) => string,
): CandidatSecantePositionDroitePlan[] {
  const percee = instance.percee!.point;
  const contientPercee = (candidat: CandidatSecantePositionDroitePlan): boolean => {
    if (candidat.type === "sommet") return distance3D(solide.sommets[candidat.nom], percee) < EPSILON_3D;
    if (candidat.type === "point") {
      const c = [instance.p, instance.q].find((x) => nomDe(x) === candidat.nom);
      return c !== undefined && distance3D(c.position, percee) < EPSILON_3D;
    }
    return pointSurSegmentOuvert(percee, solide.sommets[candidat.sommets[0]], solide.sommets[candidat.sommets[1]]);
  };
  const cle = (c: CandidatSecantePositionDroitePlan) => (c.type === "arete" ? `a${[...c.sommets].sort().join("")}` : `${c.type}${c.nom}`);

  const pointsDroite: CandidatSecantePositionDroitePlan[] = [instance.p, instance.q].map((c) =>
    c.sommet ? { type: "sommet", nom: c.sommet } : { type: "point", nom: nomDe(c) },
  );
  const sommetsPlan: CandidatSecantePositionDroitePlan[] = melanger(instance.plan.sommets).map((nom) => ({ type: "sommet", nom }));
  // Segments du plan (arêtes et diagonales) + arêtes qui touchent le plan — même famille que la
  // bonne réponse quand elle est « un point de l'arête/la diagonale [..] ».
  const segmentsPlan = pairesDistinctes(instance.plan.sommets);
  const aretesTouchant = aretesSolide(solide).filter(([a, b]) => instance.plan.sommets.includes(a) !== instance.plan.sommets.includes(b));
  const aretesPlan: CandidatSecantePositionDroitePlan[] = melanger([...segmentsPlan, ...aretesTouchant]).map((paire) => ({
    type: "arete",
    sommets: paire,
    label: libelleSegmentPercee(solide, paire),
  }));

  const distracteurs: CandidatSecantePositionDroitePlan[] = [];
  const vus = new Set<string>([cle(cible)]);
  const ajouter = (c: CandidatSecantePositionDroitePlan) => {
    if (distracteurs.length >= 4 || vus.has(cle(c)) || contientPercee(c)) return;
    vus.add(cle(c));
    distracteurs.push(c);
  };
  pointsDroite.forEach(ajouter);
  // Alterne arêtes et sommets du plan pour ne pas trahir le TYPE de la bonne réponse.
  for (let i = 0; i < Math.max(sommetsPlan.length, aretesPlan.length); i++) {
    if (aretesPlan[i]) ajouter(aretesPlan[i]);
    if (sommetsPlan[i]) ajouter(sommetsPlan[i]);
  }
  return melanger([cible, ...distracteurs]);
}

function assembler(solide: Solide3D, instance: InstanceBrute): ExercicePositionDroitePlan {
  // Noms I, J attribués dans l'ordre aux milieux de la droite.
  const pointsNommes: PointNommePositionDroitePlan[] = [];
  const noms = new Map<string, string>();
  for (const c of [instance.p, instance.q]) {
    if (c.milieuDe) {
      const nom = NOMS_POINTS[pointsNommes.length];
      noms.set(c.cle, nom);
      pointsNommes.push({ nom, position: c.position, milieuDe: c.milieuDe });
    }
  }
  const nomDe = (c: PointCandidat): string => c.sommet ?? noms.get(c.cle)!;
  const droite = melanger([nomDe(instance.p), nomDe(instance.q)]) as [string, string];
  const sommetsDroite = [instance.p.sommet, instance.q.sommet].filter((n): n is string => n !== null);
  const plan = nommerPlan(solide, instance.plan, sommetsDroite);

  const base = { solide, plan, droite, pointsNommes, classification: instance.classification, candidatsParallele: [], candidatsSecante: [] };
  if (instance.classification === "parallele") {
    return { ...base, candidatsParallele: melanger(instance.candidatsParallele!) };
  }
  if (instance.classification === "secante") {
    const brut = instance.percee!.cible;
    const cible: CandidatSecantePositionDroitePlan =
      brut.type === "sommet"
        ? brut
        : brut.type === "arete"
          ? { type: "arete", sommets: brut.sommets, label: libelleSegmentPercee(solide, brut.sommets) }
          : { type: "point", nom: noms.get(brut.cle)! };
    return { ...base, candidatsSecante: construireCandidatsSecante(solide, instance, cible, nomDe) };
  }
  return base;
}

// --- Tirage ------------------------------------------------------------------------------------------

/** Répartition des types de droite PAR CATÉGORIE — calibrée pour que ni le nom de la droite (nombre
 * de milieux) ni celui du plan ne suffise à classer : une droite 1 sommet + 1 milieu n'est jamais
 * parallèle à un plan de sommets (aucune instance), on rééquilibre donc les deux autres types. */
const POIDS_TYPE_DROITE: Record<ConclusionPositionDroitePlan, { valeur: TypeDroite; poids: number }[]> = {
  incluse: [
    { valeur: "SS", poids: 0.3 },
    { valeur: "SM", poids: 0.35 },
    { valeur: "MM", poids: 0.35 },
  ],
  parallele: [
    { valeur: "SS", poids: 0.5 },
    { valeur: "MM", poids: 0.5 },
  ],
  secante: [
    { valeur: "SS", poids: 0.3 },
    { valeur: "SM", poids: 0.35 },
    { valeur: "MM", poids: 0.35 },
  ],
};

function tirerInstance(solide: Solide3D, varianteId: ConclusionPositionDroitePlan): InstanceBrute | null {
  const toutes = instancesDe(solide).filter((i) => i.classification === varianteId);
  if (toutes.length === 0) return null;
  let pool = toutes;
  if (varianteId === "secante") {
    // Point de percée ailleurs que sur un point de la droite dans ~60 % des cas (jamais avant).
    const categorie: CiblePercee = Math.random() < 0.6 ? "ailleurs" : "pointDeLaDroite";
    const filtre = pool.filter((i) => i.percee!.categorie === categorie);
    if (filtre.length > 0) pool = filtre;
  }
  const type = tirerPondere(POIDS_TYPE_DROITE[varianteId]);
  const filtreType = pool.filter((i) => i.typeDroite === type);
  if (filtreType.length > 0) pool = filtreType;
  return pool[randomInt(0, pool.length - 1)];
}

const MAX_TENTATIVES = 50;

export const CATALOGUE_VARIANTES: { id: ConclusionPositionDroitePlan; label: string }[] = [
  { id: "incluse", label: "Droite incluse dans le plan" },
  { id: "parallele", label: "Droite parallèle au plan" },
  { id: "secante", label: "Droite sécante au plan" },
];

/** Force la variante (catégorie) demandée — `overrides.nomGabarit` optionnel pour forcer aussi le
 * gabarit, sinon tiré uniformément parmi les 3 (convention CLAUDE.md, `{id,label}` +
 * `construireAvecVarianteId`). */
export function construireAvecVarianteId(varianteId: ConclusionPositionDroitePlan, overrides?: { nomGabarit?: NomSolide3D }): ExercicePositionDroitePlan {
  for (let tentative = 0; tentative < MAX_TENTATIVES; tentative++) {
    const nomGabarit = overrides?.nomGabarit ?? tirerNomGabarit(GABARITS_POSITION_DROITE_PLAN);
    const solide = GABARITS_SOLIDE3D[nomGabarit];
    const instance = tirerInstance(solide, varianteId);
    if (instance) return assembler(solide, instance);
    if (overrides?.nomGabarit) {
      throw new Error(`construireAvecVarianteId : aucune instance "${varianteId}" possible pour le gabarit ${overrides.nomGabarit}`);
    }
  }
  throw new Error(`construireAvecVarianteId : aucune instance "${varianteId}" trouvée après ${MAX_TENTATIVES} tentatives`);
}

export const genererExercicePositionDroitePlan: GenerateurExercicePositionDroitePlan = () => {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
};
