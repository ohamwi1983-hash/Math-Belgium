import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import {
  EPSILON_3D,
  intersectionDeuxDroites3D,
  intersectionDroitePlan,
  normalePlan,
  normeCarree3D,
  produitScalaire3D,
  produitVectoriel3D,
  soustraire3D,
} from "../solide3D/geometrieEspace";

/**
 * Moteur de vérité terrain — polygone de section d'un solide convexe par un plan de coupe (Couche
 * A, "Section plane d'un solide", 40e générateur). Calcule une seule fois, à la génération, le
 * polygone COMPLET (tous ses sommets, dans l'ORDRE cyclique correct, l'appartenance de chacun à
 * ses 1 ou 2 faces) — la "vérité terrain" que l'exercice interactif découvre ensuite
 * progressivement écran par écran, jamais recalculée différemment en cours d'exercice.
 *
 * Réutilise `generateurs/solide3D/geometrieEspace.ts` (Couche A, voir CLAUDE.md — "Infrastructure
 * partagée — solides 3D" pour la duplication assumée avec la copie Couche B).
 *
 * **Principe algorithmique** : pour un solide CONVEXE, la section par un plan transversal
 * (aucun sommet du solide exactement sur le plan, aucune face effleurée en un seul point) est
 * TOUJOURS un unique polygone convexe fermé — chaque face traversée y contribue EXACTEMENT 2
 * sommets (le trace du plan de coupe sur le plan de la face, une droite, croise le contour convexe
 * de la face en exactement 0 ou 2 points). Ce module construit ce polygone directement depuis les
 * coordonnées 3D : (1) énumère les arêtes du solide réellement croisées (signe opposé à ses 2
 * extrémités), (2) groupe les points obtenus par face, en exigeant exactement 2 par face croisée,
 * (3) reconstruit l'ordre cyclique en suivant le graphe "2 points partagent une face" — chaque
 * point y a degré exactement 2 (ses 2 faces adjacentes), donc ce graphe est une réunion de cycles
 * simples ; pour un solide convexe c'est TOUJOURS un unique cycle couvrant tous les points
 * (propriété mathématique du polygone de section, jamais un cas spécial codé à part).
 */

export type PlanPoints3D = [Point3D, Point3D, Point3D];

/** Un sommet du polygone de section — sur une arête nommée du solide, appartenant à ses 1 ou 2
 * faces (2 pour un solide convexe fermé, jamais 1 en pratique — voir `aretesAvecFaces`). */
export interface PointSection {
  id: number; // index dans PolygoneSection.points
  position: Point3D;
  arete: [string, string]; // l'arête du solide sur laquelle il se trouve
  faces: number[]; // index (dans solide.faces) des faces contenant cette arête
}

export interface PolygoneSection {
  points: PointSection[]; // tous les sommets, PAS dans l'ordre cyclique (voir ordreCyclique)
  ordreCyclique: number[]; // ids (dans `points`) formant le cycle fermé, dans l'ordre de parcours
  facesCroisees: number[]; // index des faces du solide réellement traversées par le plan
}

function cleAreteTriee(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** Toutes les arêtes DISTINCTES du solide (dédupliquées), chacune avec les index des faces qui la
 * contiennent — 2 pour un solide convexe fermé, jamais 1 (aucune arête "de bord" dans ce projet). */
function aretesAvecFaces(solide: Solide3D): { sommets: [string, string]; faces: number[] }[] {
  const table = new Map<string, { sommets: [string, string]; faces: number[] }>();
  solide.faces.forEach((face, indexFace) => {
    for (let i = 0; i < face.length; i++) {
      const a = face[i];
      const b = face[(i + 1) % face.length];
      const cle = cleAreteTriee(a, b);
      const existant = table.get(cle);
      if (existant) existant.faces.push(indexFace);
      else table.set(cle, { sommets: a < b ? [a, b] : [b, a], faces: [indexFace] });
    }
  });
  return [...table.values()];
}

/** Diagonales de face — uniquement les faces à ≥4 sommets (un triangle n'a jamais de diagonale,
 * ex. les 4 faces du tétraèdre) — chacune coplanaire par construction avec sa face d'origine. */
export function diagonalesSolide(solide: Solide3D): { sommets: [string, string]; face: number }[] {
  const resultats: { sommets: [string, string]; face: number }[] = [];
  solide.faces.forEach((face, indexFace) => {
    if (face.length < 4) return;
    for (let i = 0; i < face.length; i++) {
      for (let j = i + 2; j < face.length; j++) {
        if (i === 0 && j === face.length - 1) continue; // (dernier,premier) est une arête, pas une diagonale
        const a = face[i];
        const b = face[j];
        resultats.push({ sommets: a < b ? [a, b] : [b, a], face: indexFace });
      }
    }
  });
  return resultats;
}

export function positionArete(solide: Solide3D, sommets: [string, string]): [Point3D, Point3D] {
  return [solide.sommets[sommets[0]], solide.sommets[sommets[1]]];
}

function signe(point: Point3D, planPoints: PlanPoints3D, normale: Point3D): number {
  return produitScalaire3D(normale, soustraire3D(point, planPoints[0]));
}

/**
 * Calcule le polygone de section complet — vérité terrain, jamais recalculée différemment. `null`
 * si le plan est dégénéré (3 points alignés), si un sommet tombe exactement sur le plan, si une
 * face croisée n'a pas exactement 2 points (tangence à un sommet), ou si le résultat n'est pas un
 * polygone simple à un seul cycle (ne devrait jamais arriver pour un solide convexe transversal —
 * garde défensive plutôt qu'une preuve géométrique a priori, même principe que le reste du projet).
 */
export function calculerPolygoneSection(solide: Solide3D, planPoints: PlanPoints3D): PolygoneSection | null {
  const normale = normalePlan(...planPoints);
  if (normeCarree3D(normale) < EPSILON_3D) return null;

  const points: PointSection[] = [];
  for (const arete of aretesAvecFaces(solide)) {
    const a = solide.sommets[arete.sommets[0]];
    const b = solide.sommets[arete.sommets[1]];
    const sa = signe(a, planPoints, normale);
    const sb = signe(b, planPoints, normale);
    if (Math.abs(sa) < EPSILON_3D || Math.abs(sb) < EPSILON_3D) return null; // sommet sur le plan
    if (Math.sign(sa) === Math.sign(sb)) continue; // arête non croisée

    const position = intersectionDroitePlan([a, b], planPoints);
    if (!position) return null; // ne devrait jamais arriver (signes opposés garantissent une intersection)
    points.push({ id: points.length, position, arete: arete.sommets, faces: arete.faces });
  }

  if (points.length < 3) return null;

  const parFace = new Map<number, number[]>();
  for (const p of points) {
    for (const f of p.faces) parFace.set(f, [...(parFace.get(f) ?? []), p.id]);
  }
  const facesCroisees = [...parFace.keys()];
  for (const f of facesCroisees) {
    if ((parFace.get(f) ?? []).length !== 2) return null; // tangence à un sommet, pas transversal
  }

  const voisins = new Map<number, number[]>();
  for (const f of facesCroisees) {
    const [x, y] = parFace.get(f)!;
    voisins.set(x, [...(voisins.get(x) ?? []), y]);
    voisins.set(y, [...(voisins.get(y) ?? []), x]);
  }
  for (const p of points) {
    if ((voisins.get(p.id) ?? []).length !== 2) return null; // pas un polygone simple
  }

  const ordreCyclique: number[] = [points[0].id];
  let precedent: number | null = null;
  let courant = points[0].id;
  while (ordreCyclique.length < points.length) {
    const suivant = voisins.get(courant)!.find((v) => v !== precedent);
    if (suivant === undefined) return null;
    ordreCyclique.push(suivant);
    precedent = courant;
    courant = suivant;
  }
  const dernierNeighbor = voisins.get(ordreCyclique[ordreCyclique.length - 1])!.find((v) => v !== precedent);
  if (dernierNeighbor !== points[0].id) return null; // le cycle ne se referme pas sur le premier point

  return { points, ordreCyclique, facesCroisees };
}

// --- Candidats de droite (arêtes, diagonales, segments déjà tracés) ----------------------------

export interface LigneCandidate {
  cle: string; // identifiant stable — dédupliquer/afficher, jamais recalculé différemment
  points: [Point3D, Point3D];
}

/** Candidats STATIQUES (arêtes + diagonales du solide) — indépendants de l'état vivant de
 * l'exercice, calculés une seule fois par instance. Les segments déjà tracés de la section
 * s'ajoutent dynamiquement en cours d'exercice, voir `ligneSegmentTrace`. */
export function lignesCandidatesStatiques(solide: Solide3D): LigneCandidate[] {
  const aretes = aretesAvecFaces(solide).map((a) => ({
    cle: `arete:${a.sommets[0]}${a.sommets[1]}`,
    points: positionArete(solide, a.sommets),
  }));
  const diagonales = diagonalesSolide(solide).map((d) => ({
    cle: `diagonale:${d.sommets[0]}${d.sommets[1]}`,
    points: positionArete(solide, d.sommets),
  }));
  return [...aretes, ...diagonales];
}

export function ligneSegmentTrace(polygone: PolygoneSection, a: number, b: number): LigneCandidate {
  const [x, y] = a < b ? [a, b] : [b, a];
  return { cle: `segment:${x}-${y}`, points: [polygone.points[a].position, polygone.points[b].position] };
}

function cleSegment(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

// --- Écran A — faces prêtes pour un segment direct ----------------------------------------------

export interface FacePreteSegment {
  face: number;
  pointA: number;
  pointB: number;
}

/** Faces ayant leurs 2 points de section déjà CONNUS, dont le segment n'est pas encore TRACÉ —
 * chacune candidate à l'écran A ("Tracer un segment direct"). */
export function facesPretesPourSegment(
  polygone: PolygoneSection,
  connus: ReadonlySet<number>,
  segmentsTraces: ReadonlySet<string>,
): FacePreteSegment[] {
  const resultats: FacePreteSegment[] = [];
  for (const face of polygone.facesCroisees) {
    const pointsFace = polygone.points.filter((p) => p.faces.includes(face));
    if (pointsFace.length !== 2) continue;
    const [pa, pb] = pointsFace;
    if (!connus.has(pa.id) || !connus.has(pb.id)) continue;
    if (segmentsTraces.has(cleSegment(pa.id, pb.id))) continue;
    resultats.push({ face, pointA: pa.id, pointB: pb.id });
  }
  return resultats;
}

// --- Alignement strict (audit chapitre 8, point 17) ----------------------------------------------

/** Distance minimale en deçà de laquelle 2 points de construction sont CONFONDUS (≈ 1 % d'une arête)
 * — même valeur que `DISTANCE_POINTS_DISTINCTS_3D` côté Couche B (`moteur/geometrieEspace.ts`),
 * réécrite ici (frontière Couche A ↔ B, voir CLAUDE.md). */
const DISTANCE_POINTS_DISTINCTS = 0.05;
const SINUS_CARRE_ALIGNEMENT = 1e-16;

/** a, b, c alignés avec b DISTINCT de a — un point auxiliaire I confondu avec le point déjà connu
 * rendait l'ancien test (`points3Colineaires`, produit vectoriel brut) trivialement vrai : la
 * « construction » ne construisait rien (audit chapitre 8, point 17). Alignement normalisé (sinus
 * de l'angle), jamais un produit vectoriel brut dépendant de la longueur des vecteurs. */
function alignesDistincts(a: Point3D, b: Point3D, c: Point3D): boolean {
  const u = soustraire3D(b, a);
  const v = soustraire3D(c, a);
  const nu = normeCarree3D(u);
  const nv = normeCarree3D(v);
  if (nu < DISTANCE_POINTS_DISTINCTS ** 2 || nv < DISTANCE_POINTS_DISTINCTS ** 2) return false;
  return normeCarree3D(produitVectoriel3D(u, v)) / (nu * nv) < SINUS_CARRE_ALIGNEMENT;
}

/** La droite (2 points) est contenue dans le plan de la face `face` du solide. */
export function ligneDansFace(solide: Solide3D, ligne: [Point3D, Point3D], face: number): boolean {
  const sommetsFace = solide.faces[face].map((nom) => solide.sommets[nom]);
  const normale = normalePlan(sommetsFace[0], sommetsFace[1], sommetsFace[2]);
  const n = Math.sqrt(normeCarree3D(normale));
  return ligne.every((p) => Math.abs(produitScalaire3D(normale, soustraire3D(p, sommetsFace[0]))) / n < 1e-6);
}

// --- Écran B — construction d'un point auxiliaire ------------------------------------------------

export interface CibleAuxiliaire {
  face: number; // index de la face débloquée
  pointConnu: number; // id du point déjà connu sur cette face
  pointCible: number; // id du point (encore inconnu) que cette construction permet de trouver
}

/**
 * Pour une paire de droites candidates (2 segments quelconques du pool), calcule le point
 * auxiliaire I = intersection des 2 droites prolongées (`null` si gauches/parallèles — pas de
 * cible), puis la liste des faces "à moitié connues" (1 point connu, 1 inconnu) que cette
 * construction débloque : I doit être colinéaire avec le point déjà connu ET le point cible de
 * cette face — c'est la propriété qui garantit que I appartient à la fois au plan de coupe et au
 * plan de cette face (voir CLAUDE.md, section dédiée, pour la preuve complète).
 */
export function ciblesAuxiliaires(
  polygone: PolygoneSection,
  connus: ReadonlySet<number>,
  ligne1: [Point3D, Point3D],
  ligne2: [Point3D, Point3D],
): CibleAuxiliaire[] {
  const I = intersectionDeuxDroites3D(ligne1, ligne2);
  if (!I) return [];

  const resultats: CibleAuxiliaire[] = [];
  for (const face of polygone.facesCroisees) {
    const pointsFace = polygone.points.filter((p) => p.faces.includes(face));
    if (pointsFace.length !== 2) continue;
    const [pa, pb] = pointsFace;
    const aConnu = connus.has(pa.id);
    const bConnu = connus.has(pb.id);
    if (aConnu === bConnu) continue; // les 2 déjà connus (prête pour segment) ou les 2 encore inconnus
    const connu = aConnu ? pa : pb;
    const cible = aConnu ? pb : pa;
    if (alignesDistincts(connu.position, I, cible.position)) {
      resultats.push({ face, pointConnu: connu.id, pointCible: cible.id });
    }
  }
  return resultats;
}

// --- Condition d'arrêt (fermeture du polygone) ----------------------------------------------------

/** Les segments du polygone (arêtes du cycle, dans l'ordre) — exactement ceux que l'écran A doit
 * tracer un par un pour fermer la section. */
export function segmentsAttendus(polygone: PolygoneSection): [number, number][] {
  const n = polygone.ordreCyclique.length;
  const segments: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    segments.push([polygone.ordreCyclique[i], polygone.ordreCyclique[(i + 1) % n]]);
  }
  return segments;
}

export function polygoneFerme(polygone: PolygoneSection, segmentsTraces: ReadonlySet<string>): boolean {
  return segmentsAttendus(polygone).every(([a, b]) => segmentsTraces.has(cleSegment(a, b)));
}

// --- Garantie de terminaison (génération uniquement) ----------------------------------------------

const MAX_ITERATIONS_SIMULATION = 40;

/** Une étape de la résolution de RÉFÉRENCE — rejouée une seule fois à la génération, puis portée
 * par l'exercice (`ExerciceSectionPlaneSolide.resolutionReference`) pour la correction exportée
 * (construction de chaque point auxiliaire détaillée, audit chapitre 8, point 26). Jamais imposée à
 * l'élève, qui reste libre de son ordre et de ses droites à l'écran. */
export type EtapeResolutionReference =
  | { type: "segment"; face: number; pointA: number; pointB: number }
  | {
      type: "auxiliaire";
      ligne1: string;
      ligne2: string;
      /** Point auxiliaire I, intersection des 2 droites prolongées. */
      pointAuxiliaire: Point3D;
      /** Une face dont le plan contient les 2 droites (`null` si aucune — 2 droites coplanaires
       * hors de toute face, jamais préférées par `meilleureConstruction`). */
      faceCommune: number | null;
      face: number;
      pointConnu: number;
      pointCible: number;
    };

/** Projection cavalière du croquis (45°, coefficient 0,5) — réécrite ici en 2 lignes plutôt
 * qu'importée de `ui/projectionCavaliere.ts` (la Couche A ne dépend jamais de la présentation) ;
 * sert UNIQUEMENT à vérifier qu'un point auxiliaire reste dans le cadre du croquis. */
function projeterCavaliere(p: Point3D): { x: number; y: number } {
  const k = 0.5 * Math.SQRT1_2;
  return { x: p.x + p.y * k, y: p.z + p.y * k };
}

/** Marge autour du solide projeté (fraction de sa plus grande dimension 2D) dans laquelle un point
 * auxiliaire reste visible : le croquis (`ui/solide3DSketch.ts`) laisse 36 px de marge sur
 * 400 × 320 autour du solide, soit au moins ≈ 10 % de sa taille de chaque côté. */
const MARGE_CADRE_RELATIVE = 0.08;

/** Le point auxiliaire, une fois projeté, tombe dans le cadre du croquis (solide projeté + marge) —
 * le cadre du croquis est FIXE (calculé sur les seuls sommets du solide), un point hors de ce
 * cadre serait coupé à l'écran. */
export function pointDansCadreCroquis(solide: Solide3D, point: Point3D): boolean {
  const projetes = Object.values(solide.sommets).map(projeterCavaliere);
  const minX = Math.min(...projetes.map((p) => p.x));
  const maxX = Math.max(...projetes.map((p) => p.x));
  const minY = Math.min(...projetes.map((p) => p.y));
  const maxY = Math.max(...projetes.map((p) => p.y));
  const marge = MARGE_CADRE_RELATIVE * Math.max(maxX - minX, maxY - minY);
  const p = projeterCavaliere(point);
  return p.x >= minX - marge && p.x <= maxX + marge && p.y >= minY - marge && p.y <= maxY + marge;
}

/** Distance (3D) du point au centre du solide — départage 2 constructions également valables. */
function distanceAuCentre(solide: Solide3D, point: Point3D): number {
  const sommets = Object.values(solide.sommets);
  const centre = {
    x: sommets.reduce((s, p) => s + p.x, 0) / sommets.length,
    y: sommets.reduce((s, p) => s + p.y, 0) / sommets.length,
    z: sommets.reduce((s, p) => s + p.z, 0) / sommets.length,
  };
  return Math.sqrt(normeCarree3D(soustraire3D(point, centre)));
}

function faceCommuneDesLignes(solide: Solide3D, l1: [Point3D, Point3D], l2: [Point3D, Point3D]): number | null {
  for (let f = 0; f < solide.faces.length; f++) {
    if (ligneDansFace(solide, l1, f) && ligneDansFace(solide, l2, f)) return f;
  }
  return null;
}

/** Meilleure construction auxiliaire disponible depuis l'état donné — parmi TOUTES les paires
 * valides, préfère (1) un point auxiliaire visible dans le cadre du croquis, (2) 2 droites d'une
 * même face du solide (méthode du cours), puis (3) le point auxiliaire le plus proche du solide.
 * `null` si aucune paire ne débloque rien. */
export function meilleureConstruction(
  solide: Solide3D,
  polygone: PolygoneSection,
  connus: ReadonlySet<number>,
  lignes: readonly LigneCandidate[],
): Extract<EtapeResolutionReference, { type: "auxiliaire" }> | null {
  let meilleure: Extract<EtapeResolutionReference, { type: "auxiliaire" }> | null = null;
  let meilleurRang = Infinity;
  for (let i = 0; i < lignes.length; i++) {
    for (let j = i + 1; j < lignes.length; j++) {
      const cibles = ciblesAuxiliaires(polygone, connus, lignes[i].points, lignes[j].points);
      if (cibles.length === 0) continue;
      const I = intersectionDeuxDroites3D(lignes[i].points, lignes[j].points)!;
      const faceCommune = faceCommuneDesLignes(solide, lignes[i].points, lignes[j].points);
      const rang = (pointDansCadreCroquis(solide, I) ? 0 : 10000) + (faceCommune === null ? 1000 : 0) + distanceAuCentre(solide, I);
      if (rang < meilleurRang) {
        meilleurRang = rang;
        meilleure = {
          type: "auxiliaire",
          ligne1: lignes[i].cle,
          ligne2: lignes[j].cle,
          pointAuxiliaire: I,
          faceCommune,
          face: cibles[0].face,
          pointConnu: cibles[0].pointConnu,
          pointCible: cibles[0].pointCible,
        };
      }
    }
  }
  return meilleure;
}

/**
 * Simule une résolution complète depuis un ensemble de points de départ — utilisée UNIQUEMENT à la
 * génération pour garantir qu'une instance produite est résoluble en un nombre raisonnable
 * d'itérations (voir CLAUDE.md, "Condition d'arrêt") : rejoue les 2 types de coup (segment direct,
 * point auxiliaire) jusqu'à fermeture du polygone, ou renvoie `null` si aucun coup n'est
 * disponible à une étape (ou si le nombre d'itérations dépasse la borne de sécurité) — la fonction
 * de génération retire alors un autre tirage. Depuis l'audit du chapitre 8 (point 17), seules les
 * constructions NON creuses comptent (`alignesDistincts`) : une instance qui ne se résolvait que
 * grâce à un point auxiliaire confondu avec un point connu est désormais rejetée (point 18).
 * **Jamais utilisée pendant l'exercice lui-même**, qui laisse l'élève choisir librement parmi les
 * coups valides à chaque écran, dans n'importe quel ordre — l'ensemble des points/segments connus
 * ne fait jamais que croître, donc aucun coup disponible à un instant donné ne peut jamais être
 * "manqué" en en jouant un autre d'abord (argument de confluence).
 */
export function resolutionReference(solide: Solide3D, polygone: PolygoneSection, depart: readonly number[]): EtapeResolutionReference[] | null {
  const connus = new Set<number>(depart);
  const segmentsTraces = new Set<string>();
  const lignesStatiques = lignesCandidatesStatiques(solide);
  const etapes: EtapeResolutionReference[] = [];

  for (let iteration = 0; iteration < MAX_ITERATIONS_SIMULATION; iteration++) {
    if (polygoneFerme(polygone, segmentsTraces)) return etapes;

    const pretes = facesPretesPourSegment(polygone, connus, segmentsTraces);
    if (pretes.length > 0) {
      segmentsTraces.add(cleSegment(pretes[0].pointA, pretes[0].pointB));
      etapes.push({ type: "segment", ...pretes[0] });
      continue;
    }

    const lignesTracees = segmentsAttendus(polygone)
      .filter(([a, b]) => segmentsTraces.has(cleSegment(a, b)))
      .map(([a, b]) => ligneSegmentTrace(polygone, a, b));
    const construction = meilleureConstruction(solide, polygone, connus, [...lignesStatiques, ...lignesTracees]);
    // Point auxiliaire hors du cadre fixe du croquis : l'élève ne le verrait pas — instance rejetée.
    if (!construction || !pointDansCadreCroquis(solide, construction.pointAuxiliaire)) return null;
    connus.add(construction.pointCible);
    etapes.push(construction);
  }
  return null;
}

export function simulationResoluble(solide: Solide3D, polygone: PolygoneSection, depart: readonly number[]): boolean {
  return resolutionReference(solide, polygone, depart) !== null;
}
