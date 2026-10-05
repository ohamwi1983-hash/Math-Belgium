import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import {
  EPSILON_3D,
  intersectionDeuxDroites3D,
  intersectionDroitePlan,
  normalePlan,
  normeCarree3D,
  points3Colineaires,
  produitScalaire3D,
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
    if (points3Colineaires(connu.position, I, cible.position)) {
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

/**
 * Simule une résolution complète depuis un ensemble de points de départ — utilisée UNIQUEMENT à la
 * génération pour garantir qu'une instance produite est résoluble en un nombre raisonnable
 * d'itérations (voir CLAUDE.md, "Condition d'arrêt") : rejoue les 2 types de coup (segment direct,
 * point auxiliaire) jusqu'à fermeture du polygone, ou renvoie `false` si aucun coup n'est
 * disponible à une étape (ou si le nombre d'itérations dépasse la borne de sécurité) — la fonction
 * de génération retire alors et retire un autre tirage. **Jamais utilisée pendant l'exercice
 * lui-même**, qui laisse l'élève choisir librement parmi les coups valides à chaque écran, dans
 * n'importe quel ordre — l'ordre choisi ici (premier coup trouvé) est arbitraire et sans incidence
 * sur la résolubilité : l'ensemble des points/segments connus ne fait jamais que croître, donc
 * aucun coup disponible à un instant donné ne peut jamais être "manqué" en en jouant un autre
 * d'abord (argument de confluence, jamais un cas spécial à traiter par ordre).
 */
export function simulationResoluble(solide: Solide3D, polygone: PolygoneSection, depart: readonly number[]): boolean {
  const connus = new Set<number>(depart);
  const segmentsTraces = new Set<string>();
  const lignesStatiques = lignesCandidatesStatiques(solide);

  for (let iteration = 0; iteration < MAX_ITERATIONS_SIMULATION; iteration++) {
    if (polygoneFerme(polygone, segmentsTraces)) return true;

    const pretes = facesPretesPourSegment(polygone, connus, segmentsTraces);
    if (pretes.length > 0) {
      segmentsTraces.add(cleSegment(pretes[0].pointA, pretes[0].pointB));
      continue;
    }

    const lignesTracees = segmentsAttendus(polygone)
      .filter(([a, b]) => segmentsTraces.has(cleSegment(a, b)))
      .map(([a, b]) => ligneSegmentTrace(polygone, a, b));
    const toutesLesLignes = [...lignesStatiques, ...lignesTracees];

    let trouve = false;
    for (let i = 0; i < toutesLesLignes.length && !trouve; i++) {
      for (let j = i + 1; j < toutesLesLignes.length && !trouve; j++) {
        const cibles = ciblesAuxiliaires(polygone, connus, toutesLesLignes[i].points, toutesLesLignes[j].points);
        if (cibles.length > 0) {
          connus.add(cibles[0].pointCible);
          trouve = true;
        }
      }
    }
    if (!trouve) return false;
  }
  return false;
}
