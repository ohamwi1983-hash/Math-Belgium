import type { NomSolide3D, PlanSolide3D, Point3D } from "../../core/geometrieEspace.types";
import type {
  CandidatPointCommun,
  ExerciceDeuxPlans,
  ExercicePositionsPlans,
  ExerciceTroisPlans,
  IssueTroisPlans,
  MilieuNomme,
  OptionJustification,
  PositionDeuxPlans,
  SousCasAucun,
  VariantePositionsPlans,
} from "../../core/positionsPlans.types";
import { additionner3D, distance3D, EPSILON_3D, multiplierScalaire3D, produitScalaire3D, produitVectoriel3D } from "../solide3D/geometrieEspace";
import { GABARITS_SOLIDE3D, GABARITS_TOUS } from "../solide3D/gabarits";
import {
  angleProjete,
  dansPlan,
  distancePixel,
  donneesSolide,
  droiteDansPlan,
  droitesParalleles,
  intersection2D,
  trianglesSeTouchent2D,
  intersectionDroites,
  memeDroite,
  memePlan,
  nonAlignes,
  normalesIndependantes,
  pixel,
  pixelDansCadre,
  plansParalleles,
  relationDroitePlan,
  directionIntersection,
  type DonneesSolide,
  type PlanGeo,
  type Point2D,
  type PointDispo,
  type RelationDroitePlan,
} from "./geometriePlans";

/**
 * Générateur de gen101 — « Positions de deux plans et de trois plans » (4e, chapitre 8). Tout le
 * hasard passe par `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une
 * graine, et le QR code d'une feuille rouvre le MÊME exercice. L'énumération géométrique
 * (`geometriePlans.ts`) est déterministe et mise en cache.
 *
 * Solides : parallélépipède, cube, prisme droit à base triangulaire, tétraèdre (`GABARITS_TOUS`).
 *
 * Ordre du tirage (séries équilibrées, `.claude/rules/feuilles-evaluations.md`) : le VERDICT
 * (position de deux plans, ou issue pour trois plans — et, pour « aucun point commun », le sous-cas
 * Toblerone / plans parallèles) est tiré EN PREMIER, à parts égales, avant toute boucle de rejet :
 * le rejet ne biaise donc jamais sa fréquence.
 *
 * Audit des générateurs du chapitre (gen39/40/41), appliqué d'emblée :
 * - les noms ne trahissent pas la réponse : deux plans sécants ou confondus ne partagent le plus
 *   souvent AUCUNE lettre (70 %), comme deux plans parallèles ; trois plans ne partagent presque
 *   jamais une lettre commune aux trois noms ;
 * - piège « les triangles ne se touchent pas sur le dessin, mais les plans sont sécants » : fréquent
 *   (mesuré, voir le rapport) ; point commun construit hors du solide (prolongements) possible ;
 * - l'ordre des candidats et des justifications est mélangé ; UNE tentative par choix fermé.
 */

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

const SOLIDES: NomSolide3D[] = GABARITS_TOUS;
/** Le tétraèdre n'a pas deux plans parallèles nommables lisiblement (le seul cas, le plan des
 * milieux de trois arêtes issues d'un sommet, donne un triangle trop petit) : exclu quand le verdict
 * exige des plans parallèles. */
const SOLIDES_PARALLELES: NomSolide3D[] = GABARITS_TOUS.filter((n) => n !== "tetraedre");

// --- Triangles de nommage lisibles ---------------------------------------------------------------

type Triple = [PointDispo, PointDispo, PointDispo];

const COTE_MIN_PX = 34;
const AIRE_MIN_PX = 1100;
const ANGLE_MIN_DEG = 16;

function angleEnPx(a: Point2D, b: Point2D, c: Point2D): number {
  const u = { x: b.x - a.x, y: b.y - a.y };
  const v = { x: c.x - a.x, y: c.y - a.y };
  const cos = (u.x * v.x + u.y * v.y) / (Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y));
  return (Math.acos(Math.max(-1, Math.min(1, cos))) * 180) / Math.PI;
}

const CACHE_TRIANGLES = new Map<string, Triple[]>();

/** Triples de points du plan utilisables pour le nommer : non alignés, triangle bien visible sur le
 * croquis (côtés, aire, angles), au plus deux milieux. */
function trianglesLisibles(d: DonneesSolide, plan: PlanGeo): Triple[] {
  const cle = `${d.solide.id}#${plan.index}`;
  let liste = CACHE_TRIANGLES.get(cle);
  if (liste) return liste;
  liste = [];
  const c = plan.contenus;
  for (let i = 0; i < c.length; i++) {
    for (let j = i + 1; j < c.length; j++) {
      for (let k = j + 1; k < c.length; k++) {
        const t: Triple = [c[i]!, c[j]!, c[k]!];
        if (!nonAlignes(t[0].position, t[1].position, t[2].position)) continue;
        if (t.filter((p) => p.milieuDe).length > 2) continue;
        const [a, b, e] = t.map((p) => pixel(d.cadre, p.position)) as [Point2D, Point2D, Point2D];
        if (Math.min(distancePixel(a, b), distancePixel(b, e), distancePixel(a, e)) < COTE_MIN_PX) continue;
        const aire = Math.abs((b.x - a.x) * (e.y - a.y) - (e.x - a.x) * (b.y - a.y)) / 2;
        if (aire < AIRE_MIN_PX) continue;
        if (Math.min(angleEnPx(a, b, e), angleEnPx(b, a, e), angleEnPx(e, a, b)) < ANGLE_MIN_DEG) continue;
        liste.push(t);
      }
    }
  }
  CACHE_TRIANGLES.set(cle, liste);
  return liste;
}

/** Triangle de nommage, en favorisant les sommets : un nom à 0, 1 ou 2 milieux a le poids 16, 3 ou 1. */
function choisirTriangle(liste: Triple[]): Triple {
  return tirerPondere(liste.map((t) => [t, [16, 3, 1][t.filter((p) => p.milieuDe).length]!] as [Triple, number]));
}

/** Plan tiré dans une liste : 65 % parmi les plans qui passent par au moins 3 sommets (faces, plans
 * diagonaux), 35 % parmi ceux qui demandent un milieu nommé — sinon ces derniers, bien plus nombreux,
 * occuperaient presque tous les exercices. */
export function choisirPlan(liste: PlanGeo[]): PlanGeo {
  const parSommets = liste.filter((p) => p.contenus.filter((c) => c.sommet).length >= 3);
  const autres = liste.filter((p) => p.contenus.filter((c) => c.sommet).length < 3);
  if (parSommets.length === 0) return choisir(autres);
  if (autres.length === 0) return choisir(parSommets);
  return Math.random() < 0.65 ? choisir(parSommets) : choisir(autres);
}

function plansNommables(d: DonneesSolide): PlanGeo[] {
  return d.plans.filter((p) => trianglesLisibles(d, p).length > 0);
}

// --- Noms --------------------------------------------------------------------------------------

const LETTRES_MILIEUX = ["I", "J", "K"];

interface Nommage {
  noms: PlanSolide3D[];
  milieux: MilieuNomme[];
  /** Points nommés de l'instance : tous les sommets + les milieux nommés. */
  nommes: { nom: string; position: Point3D }[];
}

function nombreMilieux(triples: Triple[]): number {
  return new Set(triples.flat().filter((p) => p.milieuDe).map((p) => p.cle)).size;
}

function attribuerNoms(d: DonneesSolide, triples: Triple[]): Nommage {
  const noms = new Map<string, string>();
  const milieux: MilieuNomme[] = [];
  for (const t of triples) {
    for (const p of t) {
      if (p.sommet || noms.has(p.cle)) continue;
      const nom = LETTRES_MILIEUX[milieux.length]!;
      noms.set(p.cle, nom);
      milieux.push({ nom, position: p.position, milieuDe: p.milieuDe! });
    }
  }
  const nomDe = (p: PointDispo) => p.sommet ?? noms.get(p.cle)!;
  const plans = triples.map((t) => {
    const lettres = t.map(nomDe);
    const sommets = lettres.filter((l) => d.solide.sommets[l]).sort();
    const autres = lettres.filter((l) => !d.solide.sommets[l]).sort();
    return [...sommets, ...autres] as PlanSolide3D;
  });
  const nommes = [...Object.entries(d.solide.sommets).map(([nom, position]) => ({ nom, position })), ...milieux.map((m) => ({ nom: m.nom, position: m.position }))];
  return { noms: plans, milieux, nommes };
}

function partages(a: Triple, b: Triple): number {
  return a.filter((p) => b.some((q) => q.cle === p.cle)).length;
}

// --- Droites nommées ---------------------------------------------------------------------------

export interface DroiteNommee {
  noms: [string, string];
  a: Point3D;
  b: Point3D;
}

function libelleDroite(dr: DroiteNommee): string {
  return `(${dr.noms[0]}${dr.noms[1]})`;
}

/** Droites passant par deux points nommés (dédupliquées : une droite qui porte 3 points nommés n'est
 * gardée qu'une fois, sous le nom de deux sommets si possible). */
export function droitesNommees(nommes: { nom: string; position: Point3D }[], filtre: (a: Point3D, b: Point3D) => boolean): DroiteNommee[] {
  const resultat: DroiteNommee[] = [];
  const paires: DroiteNommee[] = [];
  for (let i = 0; i < nommes.length; i++) {
    for (let j = i + 1; j < nommes.length; j++) {
      const p = nommes[i]!;
      const q = nommes[j]!;
      if (distance3D(p.position, q.position) < EPSILON_3D) continue;
      if (!filtre(p.position, q.position)) continue;
      paires.push({ noms: [p.nom, q.nom].sort() as [string, string], a: p.position, b: q.position });
    }
  }
  const estSommet = (n: string) => !LETTRES_MILIEUX.includes(n);
  paires.sort((x, y) => Number(!x.noms.every(estSommet)) - Number(!y.noms.every(estSommet)) || x.noms.join("").localeCompare(y.noms.join("")));
  for (const p of paires) {
    if (resultat.some((r) => memeDroite(r.a, r.b, p.a, p.b))) continue;
    resultat.push(p);
  }
  return resultat;
}

// ================================================================================================
// Variante « deux plans »
// ================================================================================================

const POIDS_PARTAGE: [number, number][] = [
  [0, 0.7],
  [1, 0.2],
  [2, 0.1],
];

/** Deux triangles de nommage, avec exactement `k` points communs. */
function nommerDeuxPlans(d: DonneesSolide, p: PlanGeo, q: PlanGeo, k: number, confondus: boolean): { triples: [Triple, Triple]; geo: [PlanGeo, PlanGeo] } | null {
  const tp = trianglesLisibles(d, p);
  const tq = trianglesLisibles(d, q);
  for (let essai = 0; essai < 80; essai++) {
    const a = choisirTriangle(tp);
    const b = choisirTriangle(tq);
    if (partages(a, b) !== k) continue;
    if (confondus && partages(a, b) === 3) continue;
    if (nombreMilieux([a, b]) > 3) continue;
    return Math.random() < 0.5 ? { triples: [a, b], geo: [p, q] } : { triples: [b, a], geo: [q, p] };
  }
  return null;
}

interface CandidatBrut {
  libelle: string;
  position: Point3D | null;
  construction: { droite1: [string, string]; droite2: [string, string] } | null;
  commun: boolean;
}

/** Candidats de l'écran « deux points communs » d'un exercice « sécants » — `null` si moins de deux
 * points communs distincts sont accessibles (points nommés ou constructions dans une face). */
function construireCandidats(d: DonneesSolide, nommage: Nommage, p: PlanGeo, q: PlanGeo): { candidats: CandidatPointCommun[]; paire: [number, number]; nommesCommuns: number } | null {
  const { nommes } = nommage;
  const pixNommes = nommes.map((n) => pixel(d.cadre, n.position));
  const loinDesNommes = (x: Point2D) => pixNommes.every((n) => distancePixel(n, x) >= 16);

  const nommesCommuns: CandidatBrut[] = [];
  const nommesAutres: CandidatBrut[] = [];
  for (const n of nommes) {
    const commun = dansPlan(n.position, p.trois) && dansPlan(n.position, q.trois);
    (commun ? nommesCommuns : nommesAutres).push({ libelle: n.nom, position: n.position, construction: null, commun });
  }

  const lignesP = droitesNommees(nommes, (a, b) => droiteDansPlan(a, b, p.trois));
  const lignesQ = droitesNommees(nommes, (a, b) => droiteDansPlan(a, b, q.trois));
  const toutesLignes = droitesNommees(nommes, () => true);

  const constructionsCorrectes: CandidatBrut[] = [];
  const constructionsFaussesFace: CandidatBrut[] = [];
  const constructionsGauches: CandidatBrut[] = [];
  const positionsVues: Point3D[] = nommes.map((n) => n.position);
  const dejaVu = (x: Point3D) => positionsVues.some((y) => distance3D(x, y) < EPSILON_3D);

  const ajouter = (liste: CandidatBrut[], l: DroiteNommee, m: DroiteNommee, x: Point3D | null, commun: boolean) => {
    liste.push({ libelle: `${libelleDroite(l)} ∩ ${libelleDroite(m)}`, position: x, construction: { droite1: l.noms, droite2: m.noms }, commun });
  };

  for (const face of d.faces) {
    const dansFace = (l: DroiteNommee) => droiteDansPlan(l.a, l.b, face);
    const lp = lignesP.filter(dansFace);
    const lq = lignesQ.filter(dansFace);
    const lf = toutesLignes.filter(dansFace);
    // Constructions correctes : une droite de P et une droite de Q dans la même face.
    for (const l of lp) {
      for (const m of lq) {
        if (memeDroite(l.a, l.b, m.a, m.b)) continue;
        const x = intersectionDroites(l.a, l.b, m.a, m.b);
        if (!x || dejaVu(x)) continue;
        const px = pixel(d.cadre, x);
        if (!pixelDansCadre(px, -40) || !loinDesNommes(px)) continue;
        positionsVues.push(x);
        ajouter(constructionsCorrectes, l, m, x, true);
      }
    }
    // Leurres : une droite de P (ou de Q) et une droite de la face qui n'est pas dans l'autre plan.
    for (const [lignesPlan, autre] of [
      [lp, q],
      [lq, p],
    ] as const) {
      for (const l of lignesPlan) {
        for (const m of lf) {
          if (droiteDansPlan(m.a, m.b, autre.trois) || memeDroite(l.a, l.b, m.a, m.b)) continue;
          const x = intersectionDroites(l.a, l.b, m.a, m.b);
          if (!x || dejaVu(x) || dansPlan(x, autre.trois)) continue;
          const px = pixel(d.cadre, x);
          if (!pixelDansCadre(px, -40) || !loinDesNommes(px)) continue;
          if (constructionsFaussesFace.some((c) => c.position && distance3D(c.position, x) < EPSILON_3D)) continue;
          ajouter(constructionsFaussesFace, lignesPlan === lp ? l : m, lignesPlan === lp ? m : l, x, false);
        }
      }
    }
  }
  // Leurres « gauches » : une droite de P et une droite de Q qui se croisent SUR LE DESSIN sans se
  // couper dans l'espace (le piège central du chapitre).
  for (const l of lignesP) {
    for (const m of lignesQ) {
      if (droitesParalleles(l.a, l.b, m.a, m.b) || intersectionDroites(l.a, l.b, m.a, m.b)) continue;
      const x2 = intersection2D(pixel(d.cadre, l.a), pixel(d.cadre, l.b), pixel(d.cadre, m.a), pixel(d.cadre, m.b));
      if (!x2 || !pixelDansCadre(x2, 20) || !loinDesNommes(x2)) continue;
      if (angleProjete({ x: l.b.x - l.a.x, y: l.b.y - l.a.y, z: l.b.z - l.a.z }, { x: m.b.x - m.a.x, y: m.b.y - m.a.y, z: m.b.z - m.a.z }) < 20) continue;
      ajouter(constructionsGauches, l, m, null, false);
    }
  }

  const n = nommesCommuns.length;
  if (n + constructionsCorrectes.length < 2) return null;
  if (constructionsFaussesFace.length + constructionsGauches.length === 0) return null;

  const nbCorrectes = n >= 2 ? (constructionsCorrectes.length > 0 && Math.random() < 0.5 ? 1 : 0) : Math.min(constructionsCorrectes.length, 2 - n + (Math.random() < 0.5 ? 1 : 0));
  const correctes = melanger(constructionsCorrectes).slice(0, Math.max(nbCorrectes, 2 - n));
  const gauches = melanger(constructionsGauches).slice(0, constructionsGauches.length > 0 ? 1 + (Math.random() < 0.3 ? 1 : 0) : 0);
  const totalVise = 4;
  const fausses = melanger(constructionsFaussesFace).slice(0, Math.max(1, totalVise - correctes.length - gauches.length));
  const constructions = melanger([...correctes, ...gauches, ...fausses]).slice(0, 5);
  if (constructions.filter((c) => c.commun).length + n < 2) return null;

  const liste: CandidatBrut[] = [...melanger([...nommesCommuns, ...nommesAutres]), ...constructions];
  const candidats: CandidatPointCommun[] = liste.map((c, i) => ({ cle: `c${i}`, libelle: c.libelle, position: c.position, construction: c.construction }));
  // Paire révélée : les points nommés d'abord, puis les constructions.
  const indicesCommuns = liste.map((c, i) => (c.commun ? i : -1)).filter((i) => i >= 0);
  indicesCommuns.sort((a, b) => Number(liste[a]!.construction !== null) - Number(liste[b]!.construction !== null));
  return { candidats, paire: [indicesCommuns[0]!, indicesCommuns[1]!], nommesCommuns: n };
}

// --- Justifications (parallèles, confondus) --------------------------------------------------------

const DEFAUT_TRIANGLES = "Deux triangles sans point commun peuvent très bien appartenir à des plans sécants : un plan est infini, le dessin n'en montre qu'un morceau.";
const DEFAUT_AU_JUGE = "Une impression sur le dessin n'est jamais une preuve : un dessin en perspective peut tromper.";

function texteParallele(l: DroiteNommee, m: DroiteNommee): string {
  return `${libelleDroite(l)} ∥ ${libelleDroite(m)}`;
}

function nomTriangle(t: PlanSolide3D): string {
  return t.join("");
}

function nomPlan(t: PlanSolide3D): string {
  return `(${t.join("")})`;
}

/** Point nommé commun à deux droites (pour « sécantes en E »), sinon `null`. */
function pointCommunNomme(l: DroiteNommee, m: DroiteNommee): string | null {
  return l.noms.find((n) => m.noms.includes(n)) ?? null;
}

function justificationsParalleles(nommage: Nommage, p: PlanGeo, q: PlanGeo, noms: [PlanSolide3D, PlanSolide3D]): OptionJustification[] | null {
  const lignesP = droitesNommees(nommage.nommes, (a, b) => droiteDansPlan(a, b, p.trois));
  const lignesQ = droitesNommees(nommage.nommes, (a, b) => droiteDansPlan(a, b, q.trois));
  const paires: [DroiteNommee, DroiteNommee][] = [];
  for (const l of lignesP) for (const m of lignesQ) if (droitesParalleles(l.a, l.b, m.a, m.b)) paires.push([l, m]);
  if (paires.length < 2) return null;

  // Option valable : deux paires dont les droites de P sont sécantes (de préférence en un point nommé).
  const valables: [[DroiteNommee, DroiteNommee], [DroiteNommee, DroiteNommee]][] = [];
  for (let i = 0; i < paires.length; i++) {
    for (let j = i + 1; j < paires.length; j++) {
      const [l1] = paires[i]!;
      const [l2] = paires[j]!;
      if (droitesParalleles(l1.a, l1.b, l2.a, l2.b)) continue;
      valables.push([paires[i]!, paires[j]!]);
    }
  }
  if (valables.length === 0) return null;
  const avecPointNomme = valables.filter(([[l1], [l2]]) => pointCommunNomme(l1, l2));
  const [[l1, m1], [l2, m2]] = choisir(avecPointNomme.length > 0 ? avecPointNomme : valables);
  const ptCommun = pointCommunNomme(l1, l2);
  const secantes = ptCommun ? `${libelleDroite(l1)} et ${libelleDroite(l2)} sont sécantes en ${ptCommun}` : `${libelleDroite(l1)} et ${libelleDroite(l2)} sont sécantes`;
  const valable: OptionJustification = { texte: `${texteParallele(l1, m1)} et ${texteParallele(l2, m2)} ; ${secantes}.`, valide: true, defaut: "" };

  // Insuffisant : deux droites de P parallèles entre elles, ou une seule direction.
  let insuffisant: OptionJustification | null = null;
  for (const [a, b] of paires) {
    const autre = paires.find(([c, e]) => c !== a && !memeDroite(a.a, a.b, c.a, c.b) && droitesParalleles(a.a, a.b, c.a, c.b) && e !== b);
    if (autre) {
      insuffisant = {
        texte: `${texteParallele(a, b)} et ${texteParallele(autre[0], autre[1])}.`,
        valide: false,
        defaut: `${libelleDroite(a)} et ${libelleDroite(autre[0])} sont parallèles entre elles : elles ne donnent qu'une seule direction. Le critère demande deux droites sécantes du premier plan.`,
      };
      break;
    }
  }
  if (!insuffisant) {
    const [a, b] = choisir(paires);
    const autreQ = lignesQ.find((m) => m !== b && droitesParalleles(m.a, m.b, b.a, b.b) && !memeDroite(m.a, m.b, b.a, b.b));
    insuffisant = autreQ
      ? {
          texte: `${texteParallele(a, b)} et ${texteParallele(a, autreQ)}.`,
          valide: false,
          defaut: `Une seule droite du premier plan, ${libelleDroite(a)}, est utilisée : une seule direction ne suffit pas. Le critère demande deux droites sécantes du premier plan.`,
        }
      : {
          texte: `${texteParallele(a, b)}.`,
          valide: false,
          defaut: "Une seule droite parallèle ne suffit pas : le critère demande deux droites sécantes du premier plan, parallèles à deux droites du second.",
        };
  }

  // Faux : deux droites sécantes de P, mais l'un des parallélismes annoncés est faux.
  const fauxCandidats: OptionJustification[] = [];
  for (const [la, ma] of paires) {
    for (const lb of lignesP) {
      if (droitesParalleles(la.a, la.b, lb.a, lb.b)) continue;
      for (const mb of lignesQ) {
        if (droitesParalleles(lb.a, lb.b, mb.a, mb.b)) continue;
        const dl = { x: lb.b.x - lb.a.x, y: lb.b.y - lb.a.y, z: lb.b.z - lb.a.z };
        const dm = { x: mb.b.x - mb.a.x, y: mb.b.y - mb.a.y, z: mb.b.z - mb.a.z };
        if (angleProjete(dl, dm) < 15) continue;
        const pc = pointCommunNomme(la, lb);
        const sec = pc ? `${libelleDroite(la)} et ${libelleDroite(lb)} sont sécantes en ${pc}` : `${libelleDroite(la)} et ${libelleDroite(lb)} sont sécantes`;
        fauxCandidats.push({
          texte: Math.random() < 0.5 ? `${texteParallele(la, ma)} et ${texteParallele(lb, mb)} ; ${sec}.` : `${texteParallele(lb, mb)} et ${texteParallele(la, ma)} ; ${sec}.`,
          valide: false,
          defaut: `${libelleDroite(lb)} n'est pas parallèle à ${libelleDroite(mb)}.`,
        });
      }
    }
  }
  if (fauxCandidats.length === 0) return null;
  const faux = choisir(fauxCandidats);

  const triangles: OptionJustification = {
    texte: `Les triangles ${nomTriangle(noms[0])} et ${nomTriangle(noms[1])} n'ont aucun point commun.`,
    valide: false,
    defaut: DEFAUT_TRIANGLES,
  };
  return melanger([valable, insuffisant, faux, triangles]);
}

function justificationsConfondus(nommage: Nommage, noms: [PlanSolide3D, PlanSolide3D]): OptionJustification[] {
  // On justifie que les points du SECOND nom appartiennent au premier plan.
  const [premier, second] = noms;
  const valable: OptionJustification = {
    texte: `${second[0]}, ${second[1]} et ${second[2]} appartiennent tous les trois au plan ${nomPlan(premier)}, et ils ne sont pas alignés.`,
    valide: true,
    defaut: "",
  };
  const deux = melanger([...second]).slice(0, 2).sort();
  const deuxPoints: OptionJustification = {
    texte: `${deux[0]} et ${deux[1]} appartiennent tous les deux au plan ${nomPlan(premier)}.`,
    valide: false,
    defaut: "Deux points communs prouvent seulement que les plans ont une droite commune : ils pourraient être sécants suivant cette droite.",
  };
  const position = (nom: string) => nommage.nommes.find((n) => n.nom === nom)!.position;
  // Deux droites parallèles (une de chaque nom), si le dessin en offre ; sinon un seul point commun.
  const paralleles: OptionJustification[] = [];
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        for (let l = k + 1; l < 3; l++) {
          const a = position(premier[i]!);
          const b = position(premier[j]!);
          const c = position(second[k]!);
          const e = position(second[l]!);
          if (memeDroite(a, b, c, e) || !droitesParalleles(a, b, c, e)) continue;
          paralleles.push({
            texte: `(${second[k]}${second[l]}) ∥ (${premier[i]}${premier[j]}) : les deux plans contiennent deux droites parallèles.`,
            valide: false,
            defaut: "Deux plans qui contiennent des droites parallèles peuvent être sécants, parallèles ou confondus : cela ne prouve rien ici.",
          });
        }
      }
    }
  }
  const troisieme: OptionJustification =
    paralleles.length > 0 && Math.random() < 0.6
      ? choisir(paralleles)
      : {
          texte: `Le point ${choisir(second)} appartient au plan ${nomPlan(premier)}.`,
          valide: false,
          defaut: "Un seul point commun ne suffit pas : deux plans sécants ont, eux aussi, des points communs.",
        };
  const auJuge: OptionJustification = {
    texte: `Sur le dessin, les triangles ${nomTriangle(premier)} et ${nomTriangle(second)} semblent dans un même plan.`,
    valide: false,
    defaut: DEFAUT_AU_JUGE,
  };
  return melanger([valable, deuxPoints, troisieme, auJuge]);
}

/** Part des exercices dont les deux triangles ne se touchent pas SUR LE DESSIN — la même pour les
 * trois positions (ainsi ce critère ne trahit rien : piège « les triangles ne se touchent pas, mais
 * les plans sont sécants »). */
const PART_DISJOINTS = 0.45;

function genererDeuxPlans(): ExerciceDeuxPlans {
  const position: PositionDeuxPlans = choisir(["paralleles", "confondus", "secants"] as const);
  // Caractéristiques visées, tirées AVANT la boucle de rejet (fréquences non biaisées) : nombre de
  // lettres communes aux deux noms, triangles disjoints sur le dessin (seulement sans lettre
  // commune), et, pour deux plans sécants, besoin d'au moins un point construit.
  const k = position === "paralleles" ? 0 : tirerPondere(POIDS_PARTAGE);
  const partZero = position === "paralleles" ? 1 : POIDS_PARTAGE[0]![1];
  const disjointsVises = k === 0 && Math.random() < PART_DISJOINTS / partZero;
  const constructionVisee = position === "secants" && Math.random() < 0.5;
  // Le solide est tiré une fois puis gardé pendant le rejet (sinon les solides où le rejet est rare
  // prendraient le dessus) ; on n'en change qu'après 150 essais infructueux.
  const solides = position === "paralleles" ? SOLIDES_PARALLELES : SOLIDES;
  let solide = GABARITS_SOLIDE3D[choisir(solides)];
  for (let tentative = 0; tentative < 1500; tentative++) {
    if (tentative > 0 && tentative % 150 === 0) solide = GABARITS_SOLIDE3D[choisir(solides)];
    const strict = tentative < 1200;
    const d = donneesSolide(solide);
    const plans = plansNommables(d);
    const p = choisirPlan(plans);
    let q: PlanGeo;
    if (position === "confondus") {
      q = p;
    } else {
      const pool = plans.filter((x) => x !== p && (position === "paralleles" ? plansParalleles(x, p) && !memePlan(x, p) : !plansParalleles(x, p)));
      if (pool.length === 0) continue;
      q = choisirPlan(pool);
    }
    const nommageDeux = nommerDeuxPlans(d, p, q, k, position === "confondus");
    if (!nommageDeux) continue;
    const { geo, triples } = nommageDeux;
    const [ta, tb] = triples.map((t) => t.map((x) => pixel(d.cadre, x.position)));
    if (strict && trianglesSeTouchent2D(ta!, tb!) === disjointsVises) continue;
    const nommage = attribuerNoms(d, triples);
    const noms = nommage.noms as [PlanSolide3D, PlanSolide3D];
    const base = { variante: "deux-plans" as const, solide, milieux: nommage.milieux, plans: noms, position };
    if (position === "secants") {
      const res = construireCandidats(d, nommage, geo[0], geo[1]);
      if (!res) continue;
      if (strict && res.nommesCommuns < 2 !== constructionVisee) continue;
      return { ...base, candidats: res.candidats, paireAttendue: res.paire, justifications: [] };
    }
    const justifications = position === "paralleles" ? justificationsParalleles(nommage, geo[0], geo[1], noms) : justificationsConfondus(nommage, noms);
    if (!justifications) continue;
    return { ...base, candidats: [], paireAttendue: null, justifications };
  }
  throw new Error(`gen101 : aucune instance « deux plans » (${position}) trouvée`);
}

// ================================================================================================
// Variante « trois plans »
// ================================================================================================

type Triplet = [PlanGeo, PlanGeo, PlanGeo];

function choisirTroisPlans(plans: PlanGeo[], issue: IssueTroisPlans, sousCas: SousCasAucun | null): Triplet | null {
  const p = choisirPlan(plans);
  const autres = plans.filter((x) => x !== p);
  if (issue === "aucun" && sousCas === "paralleles") {
    const paralleles = autres.filter((x) => plansParalleles(x, p) && !memePlan(x, p));
    if (paralleles.length === 0) return null;
    const q = choisirPlan(paralleles);
    // Troisième plan : sécant aux deux (le plus souvent) ou parallèle aux deux.
    const troisiemeParallele = Math.random() < 0.15;
    const pool = autres.filter((x) => x !== q && !memePlan(x, p) && !memePlan(x, q) && plansParalleles(x, p) === troisiemeParallele);
    if (pool.length === 0) return null;
    return [p, q, choisirPlan(pool)];
  }
  const nonParalleles = autres.filter((x) => !plansParalleles(x, p));
  if (nonParalleles.length === 0) return null;
  const q = choisirPlan(nonParalleles);
  const pool = autres.filter((r) => {
    if (r === q || plansParalleles(r, p) || plansParalleles(r, q)) return false;
    if (issue === "point") return normalesIndependantes(p, q, r);
    if (normalesIndependantes(p, q, r)) return false;
    // Normales coplanaires : r est parallèle à la direction de p ∩ q.
    const contientLaDroite = relationDroitePlanDirection(p, q, r) === "incluse";
    return issue === "droite" ? contientLaDroite : !contientLaDroite;
  });
  if (pool.length === 0) return null;
  return [p, q, choisirPlan(pool)];
}

/** Position de la droite p ∩ q par rapport à r (p, q non parallèles). */
function relationDroitePlanDirection(p: PlanGeo, q: PlanGeo, r: PlanGeo): RelationDroitePlan {
  const pt = pointSurIntersection(p, q);
  const dir = directionIntersection(p, q);
  return relationDroitePlan(pt, { x: pt.x + dir.x, y: pt.y + dir.y, z: pt.z + dir.z }, r.trois);
}

/** Un point de la droite p ∩ q (p, q non parallèles) : avec u = n₁ × n₂, le point
 * (d₁ (n₂ × u) + d₂ (u × n₁)) / |u|² vérifie n₁·X = d₁ et n₂·X = d₂. */
function pointSurIntersection(p: PlanGeo, q: PlanGeo): Point3D {
  const u = directionIntersection(p, q);
  const d1 = produitScalaire3D(p.normale, p.trois[0]);
  const d2 = produitScalaire3D(q.normale, q.trois[0]);
  const somme = additionner3D(multiplierScalaire3D(produitVectoriel3D(q.normale, u), d1), multiplierScalaire3D(produitVectoriel3D(u, p.normale), d2));
  return multiplierScalaire3D(somme, 1 / produitScalaire3D(u, u));
}

function nommerTroisPlans(d: DonneesSolide, plans: Triplet): [Triple, Triple, Triple] | null {
  const listes = plans.map((p) => trianglesLisibles(d, p));
  const exigeAucunCommun = Math.random() < 0.9;
  for (let essai = 0; essai < 120; essai++) {
    const t = listes.map((l) => choisirTriangle(l)) as [Triple, Triple, Triple];
    const milieux = nombreMilieux(t);
    if (milieux > 3 || (milieux === 3 && Math.random() < 0.5)) continue;
    if (t.some((x, i) => t.some((y, j) => j > i && partages(x, y) === 3))) continue;
    const communsAuxTrois = t[0].filter((p) => t[1].some((q) => q.cle === p.cle) && t[2].some((q) => q.cle === p.cle)).length;
    if (exigeAucunCommun && communsAuxTrois > 0) continue;
    if (t.some((x, i) => t.some((y, j) => j > i && partages(x, y) > 1)) && Math.random() < 0.7) continue;
    return t;
  }
  return null;
}

type Relation = "secante" | "incluse" | "parallele";

const RELATION_ISSUE: Record<Exclude<IssueTroisPlans, "aucun">, Relation> = { point: "secante", droite: "incluse" };

function texteRelation(droite: string, relation: Relation, plan: string): string {
  if (relation === "secante") return `${droite} perce le plan ${plan} en un seul point`;
  if (relation === "incluse") return `${droite} est incluse dans le plan ${plan}`;
  return `${droite} est parallèle au plan ${plan}, sans y être incluse`;
}

interface Affirmation {
  texte: string;
  vraie: boolean;
  defaut: string;
}

function justificationsTroisPlans(nommage: Nommage, plans: Triplet, noms: PlanSolide3D[], issue: IssueTroisPlans, sousCas: SousCasAucun | null): OptionJustification[] | null {
  const nomP = (i: number) => nomPlan(noms[i]!);
  const toutes = droitesNommees(nommage.nommes, () => true);
  const paires: [number, number, number][] = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 2, 0],
  ];
  const relation: Relation = issue === "aucun" ? "parallele" : RELATION_ISSUE[issue];

  const affirmationsDroite: Affirmation[] = [];
  for (const [i, j, k] of paires) {
    const pi = plans[i]!;
    const pj = plans[j]!;
    const pk = plans[k]!;
    for (const l of toutes) {
      const dansI = droiteDansPlan(l.a, l.b, pi.trois);
      const dansJ = droiteDansPlan(l.a, l.b, pj.trois);
      if (!dansI && !dansJ) continue;
      const clause1 = !plansParalleles(pi, pj) && dansI && dansJ;
      const rel = relationDroitePlan(l.a, l.b, pk.trois);
      const clause2 = rel === relation;
      const premiere = Math.random() < 0.5 ? `${nomP(i)} et ${nomP(j)}` : `${nomP(j)} et ${nomP(i)}`;
      let defaut = "";
      if (!clause1) {
        const absent = dansI ? j : i;
        defaut = plansParalleles(pi, pj)
          ? `${nomP(i)} et ${nomP(j)} sont parallèles : ils ne se coupent pas.`
          : `${libelleDroite(l)} n'est pas incluse dans le plan ${nomP(absent)} : ce n'est pas la droite d'intersection de ${nomP(i)} et ${nomP(j)}.`;
      } else if (!clause2) {
        defaut =
          rel === "incluse"
            ? `${libelleDroite(l)} est incluse dans le plan ${nomP(k)}.`
            : rel === "parallele"
              ? `${libelleDroite(l)} est parallèle au plan ${nomP(k)}.`
              : `${libelleDroite(l)} perce le plan ${nomP(k)}.`;
      }
      affirmationsDroite.push({
        texte: `${premiere} se coupent suivant ${libelleDroite(l)}, et ${texteRelation(libelleDroite(l), relation, nomP(k))}.`,
        vraie: clause1 && clause2,
        defaut,
      });
    }
  }
  const affirmationsParalleles: Affirmation[] = [];
  if (issue === "aucun") {
    for (const [i, j] of paires) {
      const vraie = plansParalleles(plans[i]!, plans[j]!) && !memePlan(plans[i]!, plans[j]!);
      affirmationsParalleles.push({ texte: `${nomP(i)} et ${nomP(j)} sont parallèles.`, vraie, defaut: vraie ? "" : `${nomP(i)} et ${nomP(j)} ne sont pas parallèles : ils ont des points communs.` });
    }
  }

  let valables: Affirmation[];
  if (issue === "aucun" && sousCas === "paralleles") valables = affirmationsParalleles.filter((a) => a.vraie);
  else valables = affirmationsDroite.filter((a) => a.vraie);
  if (valables.length === 0) return null;
  const valable = choisir(valables);

  const vues = new Set<string>([valable.texte]);
  const fausses = melanger([...affirmationsDroite, ...affirmationsParalleles].filter((a) => !a.vraie)).filter((a) => {
    const cle = a.texte;
    if (vues.has(cle)) return false;
    vues.add(cle);
    return true;
  });
  // Diversité : au moins une fausse affirmation sur une autre paire de plans que la valable, si possible.
  const choisies: Affirmation[] = [];
  const paralleleFausse = fausses.find((a) => affirmationsParalleles.includes(a));
  if (paralleleFausse && Math.random() < 0.6) choisies.push(paralleleFausse);
  for (const a of fausses) {
    if (choisies.length >= 3) break;
    if (choisies.includes(a)) continue;
    choisies.push(a);
  }
  if (choisies.length < 3) return null;
  return melanger([valable, ...choisies]).map((a) => ({ texte: a.texte, valide: a.vraie, defaut: a.defaut }));
}

function genererTroisPlans(): ExerciceTroisPlans {
  const issue: IssueTroisPlans = choisir(["point", "droite", "aucun"] as const);
  const sousCas: SousCasAucun | null = issue === "aucun" ? choisir(["toblerone", "paralleles"] as const) : null;
  const solides = sousCas === "paralleles" ? SOLIDES_PARALLELES : SOLIDES;
  let solide = GABARITS_SOLIDE3D[choisir(solides)];
  for (let tentative = 0; tentative < 1200; tentative++) {
    if (tentative > 0 && tentative % 150 === 0) solide = GABARITS_SOLIDE3D[choisir(solides)];
    const d = donneesSolide(solide);
    const plans = choisirTroisPlans(plansNommables(d), issue, sousCas);
    if (!plans) continue;
    const ordre = melanger([0, 1, 2]);
    const ordonnes = ordre.map((i) => plans[i]!) as Triplet;
    const triples = nommerTroisPlans(d, ordonnes);
    if (!triples) continue;
    const nommage = attribuerNoms(d, triples);
    const justifications = justificationsTroisPlans(nommage, ordonnes, nommage.noms, issue, sousCas);
    if (!justifications) continue;
    return {
      variante: "trois-plans",
      solide,
      milieux: nommage.milieux,
      plans: nommage.noms as [PlanSolide3D, PlanSolide3D, PlanSolide3D],
      issue,
      sousCas,
      justifications,
    };
  }
  throw new Error(`gen101 : aucune instance « trois plans » (${issue}) trouvée`);
}

// ================================================================================================
// Catalogue
// ================================================================================================

export const CATALOGUE_VARIANTES: { id: VariantePositionsPlans; label: string }[] = [
  { id: "deux-plans", label: "Positions de deux plans" },
  { id: "trois-plans", label: "Positions de trois plans" },
];

export function construireAvecVariante(id: string): ExercicePositionsPlans {
  return id === "trois-plans" ? genererTroisPlans() : genererDeuxPlans();
}

export function genererExercicePositionsPlans(): ExercicePositionsPlans {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
