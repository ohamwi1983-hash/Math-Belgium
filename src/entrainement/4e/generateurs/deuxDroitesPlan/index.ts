import type {
  DroiteNommee,
  ExerciceDeuxDroites,
  ExerciceDeuxDroitesPlan,
  ExercicePlanDetermine,
  IdRaisonPlan,
  JustificationDeuxDroites,
  LieuPointCommun,
  NomPlan,
  OptionPlanCommun,
  OptionPointCommun,
  PointNommeEspace,
  PositionDeuxDroites,
  TypeDonneesPlan,
  VarianteDeuxDroitesPlan,
} from "../../core/deuxDroitesPlan.types";
import type { NomSolide3D, Point3D, Solide3D } from "../../core/geometrieEspace.types";
import {
  additionner3D,
  distance3D,
  EPSILON_3D,
  intersectionDeuxDroites3D,
  multiplierScalaire3D,
  normalePlan,
  normeCarree3D,
  pointAppartientAuPlan,
  pointSurSegmentOuvert,
  points3Colineaires,
  produitScalaire3D,
  sontParalleles3D,
  soustraire3D,
} from "../solide3D/geometrieEspace";
import { GABARITS_SOLIDE3D } from "../solide3D/gabarits";
import { calculerEchelleProjection, HAUTEUR_SVG, LARGEUR_SVG, projeter3DVersPixel, type EchelleProjection3D } from "../../ui/solide3DSketch";
import { projeterPoint3D, type Point2D } from "../../ui/projectionCavaliere";

/**
 * Couche A de gen100 — « Positions de deux droites et plan déterminé ». Catalogue FERMÉ des
 * gabarits du chapitre (cube, parallélépipède rectangle, prisme droit, pyramide à base carrée,
 * tétraèdre) ; seuls varient les points choisis (sommets, milieux d'arêtes, centres de faces).
 *
 * **Énumération puis tirage** (même principe que gen39) : pour chaque gabarit, toutes les paires de
 * droites (et tous les triplets de points pour la famille « plan ») sont énumérées UNE fois, filtrées
 * pour la lisibilité du dessin, puis rangées dans des seaux (verdict × catégorie × nombre de points
 * non sommets) — un tirage ne fait ensuite qu'un choix dans un seau, ce qui reste rapide pour la
 * recherche de graine des évaluations (20 000 essais en 200 ms).
 *
 * **Ordre du tirage** : le verdict (position des deux droites ; oui/non pour le plan) est tiré EN
 * PREMIER, à parts égales ; viennent ensuite la catégorie (où tombe le point commun, croisement
 * apparent sur le dessin), le nombre de points non sommets et le gabarit. Un seau vide fait retirer
 * le gabarit, puis la catégorie — jamais le verdict.
 *
 * **Anti-devinette** (leçons de l'audit de gen39) :
 * - les plans proposés à l'écran a sont nommés par 3 de leurs points tirés au hasard, en partageant
 *   le MOINS possible de lettres avec les droites (9 fois sur 10) ; dans le cas « gauches », un des
 *   distracteurs contient une droite ET un point de l'autre (même nombre de lettres communes que le
 *   bon plan d'un cas coplanaire) ;
 * - le point de percée de la justification « gauches » n'apparaît jamais dans le nom du plan (Q) ;
 * - deux droites gauches se croisent SUR LE DESSIN dans 70 % des cas (piège central de la fiche),
 *   jamais à l'emplacement d'un point nommé (le dessin serait trompeur, pas seulement piégeux) ;
 * - le point commun de deux sécantes tombe sur un point nommé, sur le solide sans être nommé, ou
 *   hors du solide (prolongements), à parts égales ;
 * - l'ordre de toutes les options est mélangé.
 */

// ---------------------------------------------------------------------------------------------
// Hasard
// ---------------------------------------------------------------------------------------------

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choisir<T>(liste: readonly T[]): T {
  return liste[randomInt(0, liste.length - 1)]!;
}

function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
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
  return options[options.length - 1]!.valeur;
}

// ---------------------------------------------------------------------------------------------
// Solides et points candidats
// ---------------------------------------------------------------------------------------------

export const SOLIDES_DEUX_DROITES: NomSolide3D[] = ["cube", "parallelepipede", "prisme", "pyramideCarree", "tetraedre"];

/** Un point utilisable : un sommet, ou un point défini (milieu d'arête, centre de face) encore
 * anonyme — la lettre I, J, K n'est attribuée qu'une fois l'instance retenue. */
interface Candidat {
  cle: string;
  position: Point3D;
  sommet: string | null;
  definition: string | null;
}

function aretesSolide(solide: Solide3D): [string, string][] {
  const cles = new Set<string>();
  const aretes: [string, string][] = [];
  for (const face of solide.faces) {
    for (let i = 0; i < face.length; i++) {
      const [a, b] = [face[i]!, face[(i + 1) % face.length]!].sort() as [string, string];
      if (cles.has(a + b)) continue;
      cles.add(a + b);
      aretes.push([a, b]);
    }
  }
  return aretes;
}

/** Nom usuel d'une face : sa plus petite lettre d'abord, puis le sens de parcours qui commence par
 * la plus petite voisine (["C","A","D","F"] → « ACFD », ["D","C","G","H"] → « CDHG »). */
export function nomFace(face: readonly string[]): string {
  const n = face.length;
  const i = face.indexOf([...face].sort()[0]!);
  const avant = face[(i - 1 + n) % n]!;
  const apres = face[(i + 1) % n]!;
  const sens = apres < avant ? 1 : -1;
  return Array.from({ length: n }, (_, k) => face[(i + sens * k + 2 * n) % n]!).join("");
}

function centre(points: Point3D[]): Point3D {
  return multiplierScalaire3D(
    points.reduce((s, p) => additionner3D(s, p), { x: 0, y: 0, z: 0 }),
    1 / points.length,
  );
}

function candidatsDe(solide: Solide3D, avecCentres: boolean): Candidat[] {
  const sommets: Candidat[] = Object.entries(solide.sommets).map(([nom, position]) => ({ cle: nom, position, sommet: nom, definition: null }));
  const milieux: Candidat[] = aretesSolide(solide).map(([a, b]) => ({
    cle: `m${a}${b}`,
    position: centre([solide.sommets[a]!, solide.sommets[b]!]),
    sommet: null,
    definition: `le milieu de [${a}${b}]`,
  }));
  const centres: Candidat[] = avecCentres
    ? solide.faces
        .filter((f) => f.length === 4)
        .map((f) => ({ cle: `c${f.join("")}`, position: centre(f.map((n) => solide.sommets[n]!)), sommet: null, definition: `le centre de la face ${nomFace(f)}` }))
    : [];
  return [...sommets, ...milieux, ...centres];
}

// ---------------------------------------------------------------------------------------------
// Dessin (pixels de `Solide3DSketch`) et position par rapport au solide
// ---------------------------------------------------------------------------------------------

const CACHE_ECHELLE = new Map<string, EchelleProjection3D>();

function pixel(solide: Solide3D, p: Point3D): Point2D {
  let echelle = CACHE_ECHELLE.get(solide.id);
  if (!echelle) {
    echelle = calculerEchelleProjection(solide);
    CACHE_ECHELLE.set(solide.id, echelle);
  }
  return projeter3DVersPixel(p, echelle);
}

function dist2D(a: Point2D, b: Point2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Distance (px) du point `p` à la droite (ab) du dessin. */
function distanceALaDroite2D(p: Point2D, a: Point2D, b: Point2D): number {
  const l = dist2D(a, b) || 1;
  return Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / l;
}

/** Angle (degrés, 0 à 90) entre deux directions du dessin. */
function angle2D(u: Point2D, v: Point2D): number {
  const nu = Math.hypot(u.x, u.y);
  const nv = Math.hypot(v.x, v.y);
  if (nu < 1e-9 || nv < 1e-9) return 0;
  const cos = Math.abs(u.x * v.x + u.y * v.y) / (nu * nv);
  return (Math.acos(Math.min(1, cos)) * 180) / Math.PI;
}

/** Normale extérieure (non normalisée) d'une face — solide CONVEXE. */
function normaleExterieure(solide: Solide3D, face: string[]): Point3D {
  const p = face.map((n) => solide.sommets[n]!);
  let normale = normalePlan(p[0]!, p[1]!, p[2]!);
  const versExterieur = soustraire3D(centre(p), centre(Object.values(solide.sommets)));
  if (produitScalaire3D(normale, versExterieur) < 0) normale = multiplierScalaire3D(normale, -1);
  return normale;
}

/** Écart signé (unités) du point à chaque face : ≤ 0 partout ⇔ point dans le solide (fermé). */
function ecartsAuxFaces(solide: Solide3D, p: Point3D): number[] {
  return solide.faces.map((face) => {
    const n = normaleExterieure(solide, face);
    return produitScalaire3D(n, soustraire3D(p, solide.sommets[face[0]!]!)) / Math.sqrt(normeCarree3D(n));
  });
}

type LieuBrut =
  | { type: "nomme"; cle: string }
  | { type: "arete"; arete: [string, string] }
  | { type: "face"; face: string[]; centre: boolean }
  | { type: "interieur"; centre: boolean }
  | { type: "hors" };

function lieuDuPoint(solide: Solide3D, p: Point3D, nommes: Candidat[]): LieuBrut {
  for (const c of nommes) if (distance3D(c.position, p) < EPSILON_3D) return { type: "nomme", cle: c.cle };
  for (const [nom, position] of Object.entries(solide.sommets)) if (distance3D(position, p) < EPSILON_3D) return { type: "nomme", cle: nom };
  const ecarts = ecartsAuxFaces(solide, p);
  if (ecarts.some((e) => e > 1e-6)) return { type: "hors" };
  const arete = aretesSolide(solide).find(([a, b]) => pointSurSegmentOuvert(p, solide.sommets[a]!, solide.sommets[b]!));
  if (arete) return { type: "arete", arete };
  const iFace = ecarts.findIndex((e) => Math.abs(e) < 1e-6);
  if (iFace >= 0) {
    const face = solide.faces[iFace]!;
    const estCentre = face.length === 4 && distance3D(centre(face.map((n) => solide.sommets[n]!)), p) < EPSILON_3D;
    return { type: "face", face: nomFace(face).split(""), centre: estCentre };
  }
  const estCentre = (solide.id === "cube" || solide.id === "parallelepipede") && distance3D(centre(Object.values(solide.sommets)), p) < EPSILON_3D;
  return { type: "interieur", centre: estCentre };
}

type CategorieLieu = "nomme" | "surSolide" | "hors";

function categorieDe(lieu: LieuBrut): CategorieLieu {
  return lieu.type === "nomme" ? "nomme" : lieu.type === "hors" ? "hors" : "surSolide";
}

// ---------------------------------------------------------------------------------------------
// Paires de droites (famille « positions », et « plan » avec deux droites)
// ---------------------------------------------------------------------------------------------

interface Ligne {
  p: Candidat;
  q: Candidat;
}

interface CombinaisonGauches {
  /** Indice (0 ou 1) de la droite contenue dans (Q). */
  contenue: 0 | 1;
  /** Point de l'autre droite situé dans (Q). */
  r: Candidat;
}

interface PaireBrute {
  lignes: [Ligne, Ligne];
  position: PositionDeuxDroites;
  inter: Point3D | null;
  lieu: LieuBrut | null;
  croisement: boolean;
  nbMilieux: number;
  combinaisonsGauches: CombinaisonGauches[];
}

function nbNonSommets(cs: Candidat[]): number {
  return cs.filter((c) => c.sommet === null).length;
}

/** Une droite définie par un milieu et confondue avec la droite d'une arête : c'est l'arête sous un
 * autre nom (ex. (AI), I milieu de [AB]) — écartée pour les deux droites d'une paire. */
function droiteSurUneArete(solide: Solide3D, p: Candidat, q: Candidat): boolean {
  if (p.sommet && q.sommet) return false;
  return aretesSolide(solide).some(([a, b]) => {
    const pa = solide.sommets[a]!;
    const pb = solide.sommets[b]!;
    return points3Colineaires(pa, pb, p.position) && points3Colineaires(pa, pb, q.position);
  });
}

/** Une droite se voit : ses deux points sont bien séparés sur le dessin, et sa projection n'est pas
 * presque réduite à un point (droite fuyante dans la direction de projection, comme pour gen39). */
function ligneLisible(solide: Solide3D, p: Candidat, q: Candidat): boolean {
  const direction = soustraire3D(q.position, p.position);
  const projetee = projeterPoint3D(direction);
  if (Math.hypot(projetee.x, projetee.y) < 0.15 * Math.sqrt(normeCarree3D(direction))) return false;
  return dist2D(pixel(solide, p.position), pixel(solide, q.position)) >= 28;
}

/** Plage de paramètres t (a + t(b − a)) réellement dessinée par `calculerSegmentsDroite`. */
function plageDessinee(p: Point3D, q: Point3D): [number, number] {
  const longueur = Math.sqrt(normeCarree3D(soustraire3D(q, p))) || 1;
  const extension = Math.max(0.35, 1.2 / longueur);
  return [-extension, 1 + extension];
}

/** Point où les deux droites se croisent SUR LE DESSIN (dans les parties tracées), ou `null`. */
function croisementDessin(solide: Solide3D, l1: Ligne, l2: Ligne): Point2D | null {
  const a1 = pixel(solide, l1.p.position);
  const b1 = pixel(solide, l1.q.position);
  const a2 = pixel(solide, l2.p.position);
  const b2 = pixel(solide, l2.q.position);
  const d1 = { x: b1.x - a1.x, y: b1.y - a1.y };
  const d2 = { x: b2.x - a2.x, y: b2.y - a2.y };
  const det = d1.x * -d2.y - d1.y * -d2.x;
  if (Math.abs(det) < 1e-9) return null;
  const rx = a2.x - a1.x;
  const ry = a2.y - a1.y;
  const s = (rx * -d2.y - ry * -d2.x) / det;
  const t = (d1.x * ry - d1.y * rx) / det;
  const [s0, s1] = plageDessinee(l1.p.position, l1.q.position);
  const [t0, t1] = plageDessinee(l2.p.position, l2.q.position);
  if (s < s0 || s > s1 || t < t0 || t > t1) return null;
  const point = { x: a1.x + s * d1.x, y: a1.y + s * d1.y };
  if (point.x < 6 || point.x > LARGEUR_SVG - 6 || point.y < 6 || point.y > HAUTEUR_SVG - 6) return null;
  return point;
}

/** Points nommés d'un énoncé : tous les sommets + les points définis utilisés. */
function nommesDe(solide: Solide3D, utilises: Candidat[]): Candidat[] {
  const sommets: Candidat[] = Object.entries(solide.sommets).map(([nom, position]) => ({ cle: nom, position, sommet: nom, definition: null }));
  const extras = utilises.filter((c, i) => c.sommet === null && utilises.findIndex((d) => d.cle === c.cle) === i);
  return [...sommets, ...extras];
}

/** Plans passant par au moins 3 points nommés, chacun avec TOUS les points nommés qu'il contient. */
function plansNommes(nommes: Candidat[]): Candidat[][] {
  const vus = new Set<string>();
  const plans: Candidat[][] = [];
  for (let i = 0; i < nommes.length; i++) {
    for (let j = i + 1; j < nommes.length; j++) {
      for (let k = j + 1; k < nommes.length; k++) {
        const t: [Point3D, Point3D, Point3D] = [nommes[i]!.position, nommes[j]!.position, nommes[k]!.position];
        if (normeCarree3D(normalePlan(...t)) < EPSILON_3D) continue;
        const contenus = nommes.filter((c) => pointAppartientAuPlan(c.position, t));
        const cle = contenus.map((c) => c.cle).join(",");
        if (vus.has(cle)) continue;
        vus.add(cle);
        plans.push(contenus);
      }
    }
  }
  return plans;
}

function triplesNonAlignes(points: Candidat[]): [Candidat, Candidat, Candidat][] {
  const triples: [Candidat, Candidat, Candidat][] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      for (let k = j + 1; k < points.length; k++) {
        if (!points3Colineaires(points[i]!.position, points[j]!.position, points[k]!.position)) triples.push([points[i]!, points[j]!, points[k]!]);
      }
    }
  }
  return triples;
}

function contient(plan: Candidat[], c: Candidat): boolean {
  return plan.some((x) => x.cle === c.cle);
}

/** Combinaisons (droite contenue, point de l'autre) dont le plan (Q) peut se nommer SANS ce point. */
function combinaisonsGauches(solide: Solide3D, l: [Ligne, Ligne]): CombinaisonGauches[] {
  const nommes = nommesDe(solide, [l[0].p, l[0].q, l[1].p, l[1].q]);
  const combinaisons: CombinaisonGauches[] = [];
  for (const contenue of [0, 1] as const) {
    const autre = l[1 - contenue]!;
    for (const r of [autre.p, autre.q]) {
      const t: [Point3D, Point3D, Point3D] = [l[contenue].p.position, l[contenue].q.position, r.position];
      const dansQ = nommes.filter((c) => pointAppartientAuPlan(c.position, t) && c.cle !== r.cle);
      if (triplesNonAlignes(dansQ).length > 0) combinaisons.push({ contenue, r });
    }
  }
  return combinaisons;
}

/** Droites du solide (deux sommets) parallèles aux deux droites et distinctes d'elles. */
function referencesParalleles(solide: Solide3D, l: [Ligne, Ligne]): DroiteNommee[] {
  const dir = soustraire3D(l[0].q.position, l[0].p.position);
  const noms = Object.keys(solide.sommets);
  const refs: DroiteNommee[] = [];
  for (let i = 0; i < noms.length; i++) {
    for (let j = i + 1; j < noms.length; j++) {
      const a = solide.sommets[noms[i]!]!;
      const b = solide.sommets[noms[j]!]!;
      if (!sontParalleles3D(dir, soustraire3D(b, a))) continue;
      const confondue = l.some((x) => points3Colineaires(a, b, x.p.position) && points3Colineaires(a, b, x.q.position));
      if (!confondue) refs.push([noms[i]!, noms[j]!]);
    }
  }
  return refs;
}

function enumererPaires(solide: Solide3D): PaireBrute[] {
  const cands = candidatsDe(solide, false);
  const lignes: Ligne[] = [];
  for (let i = 0; i < cands.length; i++) {
    for (let j = i + 1; j < cands.length; j++) {
      const p = cands[i]!;
      const q = cands[j]!;
      if (droiteSurUneArete(solide, p, q) || !ligneLisible(solide, p, q)) continue;
      lignes.push({ p, q });
    }
  }
  const paires: PaireBrute[] = [];
  for (let i = 0; i < lignes.length; i++) {
    for (let j = i + 1; j < lignes.length; j++) {
      const l1 = lignes[i]!;
      const l2 = lignes[j]!;
      const quatre = [l1.p, l1.q, l2.p, l2.q];
      if (new Set(quatre.map((c) => c.cle)).size < 4) continue;
      const nbMilieux = nbNonSommets(quatre);
      if (nbMilieux !== 0 && nbMilieux !== 2) continue;
      const dir1 = soustraire3D(l1.q.position, l1.p.position);
      const dir2 = soustraire3D(l2.q.position, l2.p.position);
      const pix = quatre.map((c) => pixel(solide, c.position));
      // les quatre points bien séparés sur le dessin
      let separes = true;
      for (let a = 0; a < 4 && separes; a++) for (let b = a + 1; b < 4; b++) if (dist2D(pix[a]!, pix[b]!) < 16) separes = false;
      if (!separes) continue;
      const d1px = { x: pix[1]!.x - pix[0]!.x, y: pix[1]!.y - pix[0]!.y };
      const d2px = { x: pix[3]!.x - pix[2]!.x, y: pix[3]!.y - pix[2]!.y };
      const nommes = nommesDe(solide, quatre);
      const pixNommes = nommes.map((c) => pixel(solide, c.position));

      let position: PositionDeuxDroites;
      let inter: Point3D | null = null;
      let lieu: LieuBrut | null = null;
      if (sontParalleles3D(dir1, dir2)) {
        if (points3Colineaires(l1.p.position, l1.q.position, l2.p.position)) continue; // confondues
        // deux traits parallèles bien distincts sur le dessin
        if (distanceALaDroite2D(pix[2]!, pix[0]!, pix[1]!) < 14) continue;
        if (referencesParalleles(solide, [l1, l2]).length === 0) continue;
        position = "paralleles";
      } else {
        if (angle2D(d1px, d2px) < 10) continue; // traits presque parallèles sur le dessin : ambigu
        inter = intersectionDeuxDroites3D([l1.p.position, l1.q.position], [l2.p.position, l2.q.position]);
        position = inter ? "secantes" : "gauches";
      }

      const croisement = croisementDessin(solide, l1, l2);
      if (position === "secantes") {
        lieu = lieuDuPoint(solide, inter!, quatre);
        // un point commun non nommé ne doit pas se dessiner sur un point nommé
        if (lieu.type !== "nomme") {
          const pi = pixel(solide, inter!);
          if (pixNommes.some((p) => dist2D(p, pi) < 12)) continue;
        }
      }
      if (position === "gauches" && croisement && pixNommes.some((p) => dist2D(p, croisement) < 12)) continue;
      const combinaisons = position === "gauches" ? combinaisonsGauches(solide, [l1, l2]) : [];
      if (position === "gauches" && combinaisons.length === 0) continue;
      paires.push({ lignes: [l1, l2], position, inter, lieu, croisement: croisement !== null, nbMilieux, combinaisonsGauches: combinaisons });
    }
  }
  return paires;
}

/** Clé de seau : position | catégorie | nombre de points non sommets. */
function clePaire(p: PaireBrute): string {
  const categorie = p.position === "secantes" ? categorieDe(p.lieu!) : p.position === "gauches" ? (p.croisement ? "croise" : "separe") : "-";
  return `${p.position}|${categorie}|${p.nbMilieux}`;
}

const CACHE_PAIRES = new Map<string, Map<string, PaireBrute[]>>();

function seauxPaires(solide: Solide3D): Map<string, PaireBrute[]> {
  let seaux = CACHE_PAIRES.get(solide.id);
  if (!seaux) {
    seaux = new Map();
    for (const p of enumererPaires(solide)) {
      const cle = clePaire(p);
      const liste = seaux.get(cle) ?? [];
      liste.push(p);
      seaux.set(cle, liste);
    }
    CACHE_PAIRES.set(solide.id, seaux);
  }
  return seaux;
}

/** Nombre de points non sommets (milieux) sur les deux droites : 0 ou 2, jamais 1 — une droite
 * « sommet + milieu » n'est parallèle à aucune droite de ces solides, si bien qu'un seul milieu
 * excluait « parallèles » (le nombre de lettres I, J aurait trahi la réponse). Tiré AVANT la
 * catégorie, indépendamment du verdict. */
const POIDS_MILIEUX = [
  { valeur: 0, poids: 0.35 },
  { valeur: 2, poids: 0.65 },
];

function tirerCategorie(position: PositionDeuxDroites): string {
  if (position === "secantes") return choisir(["nomme", "surSolide", "hors"]);
  if (position === "gauches") return Math.random() < 0.7 ? "croise" : "separe";
  return "-";
}

/** Tire une paire de droites de position imposée (tirée AVANT, par l'appelant). Le nombre de
 * milieux est tiré ensuite ; un seau vide fait retirer le gabarit, puis la catégorie (un point
 * commun nommé exige des milieux), et en dernier recours le nombre de milieux. */
function tirerPaire(position: PositionDeuxDroites): { solide: Solide3D; paire: PaireBrute } {
  for (let essai = 0; essai < 20; essai++) {
    const milieux = tirerPondere(POIDS_MILIEUX);
    for (let c = 0; c < 12; c++) {
      const categorie = tirerCategorie(position);
      for (let s = 0; s < 4; s++) {
        const solide = GABARITS_SOLIDE3D[choisir(SOLIDES_DEUX_DROITES)];
        const seau = seauxPaires(solide).get(`${position}|${categorie}|${milieux}`);
        if (seau && seau.length > 0) return { solide, paire: choisir(seau) };
      }
    }
  }
  throw new Error(`gen100 : aucune paire de droites « ${position} »`);
}

// ---------------------------------------------------------------------------------------------
// Nommage
// ---------------------------------------------------------------------------------------------

const LETTRES_POINTS = ["I", "J", "K"];

interface Nommage {
  nomDe: (c: Candidat) => string;
  pointsNommes: PointNommeEspace[];
  nommes: Candidat[];
}

function nommer(solide: Solide3D, ordre: Candidat[]): Nommage {
  const noms = new Map<string, string>();
  const pointsNommes: PointNommeEspace[] = [];
  for (const c of ordre) {
    if (c.sommet || noms.has(c.cle)) continue;
    const nom = LETTRES_POINTS[pointsNommes.length]!;
    noms.set(c.cle, nom);
    pointsNommes.push({ nom, position: c.position, definition: c.definition! });
  }
  return { nomDe: (c) => c.sommet ?? noms.get(c.cle)!, pointsNommes, nommes: nommesDe(solide, ordre) };
}

/** Nom d'un plan : 3 de ses points nommés non alignés, tirés au hasard parmi ceux qui partagent
 * avec `lettres` un nombre de lettres le plus proche possible de `cible`. `interdits` ne figurent
 * jamais dans le nom. */
function nommerPlan(plan: Candidat[], nomDe: (c: Candidat) => string, lettres: string[], cible: number, interdits: string[] = []): NomPlan {
  const triples = triplesNonAlignes(plan.filter((c) => !interdits.includes(nomDe(c))));
  const ecart = (t: Candidat[]) => Math.abs(t.filter((c) => lettres.includes(nomDe(c))).length - cible);
  const minimum = Math.min(...triples.map(ecart));
  return melanger(choisir(triples.filter((t) => ecart(t) === minimum)).map(nomDe)) as NomPlan;
}

// ---------------------------------------------------------------------------------------------
// Famille « positions »
// ---------------------------------------------------------------------------------------------

/** Les deux droites d'une paire, dans un ordre et avec des noms tirés au hasard. */
function orienterPaire(paire: PaireBrute): { l: [Ligne, Ligne]; combinaisons: CombinaisonGauches[] } {
  const echange = Math.random() < 0.5;
  const l: [Ligne, Ligne] = echange ? [paire.lignes[1], paire.lignes[0]] : [paire.lignes[0], paire.lignes[1]];
  const orientee = l.map((x) => (Math.random() < 0.5 ? { p: x.q, q: x.p } : x)) as [Ligne, Ligne];
  const combinaisons = paire.combinaisonsGauches.map((c) => ({ ...c, contenue: (echange ? 1 - c.contenue : c.contenue) as 0 | 1 }));
  return { l: orientee, combinaisons };
}

/** Probabilité qu'un cas « gauches » propose un plan qui contient une droite ET un point de l'autre
 * (3 lettres communes avec les droites, comme le bon plan d'un cas coplanaire). */
const PROBA_PLAN_TROIS_POINTS = 0.85;

function optionsPlanCommun(l: [Ligne, Ligne], nommage: Nommage, coplanaire: boolean): { options: OptionPlanCommun[]; bon: number; planCommun: NomPlan | null } {
  const { nomDe, nommes } = nommage;
  const quatre = [l[0].p, l[0].q, l[1].p, l[1].q];
  const lettres = quatre.map(nomDe);
  const plans = plansNommes(nommes);
  const contientLigne = (plan: Candidat[], x: Ligne) => contient(plan, x.p) && contient(plan, x.q);
  const nbPoints = (plan: Candidat[]) => quatre.filter((c) => contient(plan, c)).length;
  const uneSeule = melanger(plans.filter((p) => contientLigne(p, l[0]) !== contientLigne(p, l[1])));
  const autres = melanger(plans.filter((p) => !contientLigne(p, l[0]) && !contientLigne(p, l[1]) && nbPoints(p) >= 1));

  let choisis: Candidat[][];
  let planCommun: Candidat[] | null = null;
  if (coplanaire) {
    planCommun = plans.find((p) => contientLigne(p, l[0]) && contientLigne(p, l[1]))!;
    const distracteurs = [...uneSeule.filter((p) => nbPoints(p) === 2), ...autres].slice(0, 2);
    choisis = [planCommun, ...distracteurs];
  } else {
    const troisPoints = uneSeule.filter((p) => nbPoints(p) === 3);
    const deuxPoints = uneSeule.filter((p) => nbPoints(p) === 2);
    const avecTrois = troisPoints.length > 0 && Math.random() < PROBA_PLAN_TROIS_POINTS;
    choisis = [...(avecTrois ? [troisPoints[0]!] : []), ...deuxPoints, ...autres].slice(0, 3);
  }
  // Noms à 2 lettres communes avec les droites autant que possible (bon plan comme distracteurs) ;
  // le plan « une droite + un point de l'autre » d'un cas gauche est nommé par ces trois points
  // (3 lettres communes, comme le bon plan d'un cas coplanaire dont les seuls points nommés sont
  // ceux des droites) : compter les lettres ne départage pas les situations.
  const noms = choisis.map((p) => nommerPlan(p, nomDe, lettres, !coplanaire && nbPoints(p) === 3 ? 3 : 2));
  const options: OptionPlanCommun[] = melanger([...noms.map((nom) => ({ type: "plan" as const, nom })), { type: "aucun" as const }]);
  const bon = coplanaire ? options.findIndex((o) => o.type === "plan" && o.nom === noms[0]) : options.findIndex((o) => o.type === "aucun");
  return { options, bon, planCommun: coplanaire ? noms[0]! : null };
}

function lieuNomme(lieu: LieuBrut, nommage: Nommage): LieuPointCommun {
  if (lieu.type !== "nomme") return lieu;
  const c = nommage.nommes.find((x) => x.cle === lieu.cle)!;
  return { type: "nomme", nom: nommage.nomDe(c) };
}

function justificationPositions(solide: Solide3D, paire: PaireBrute, l: [Ligne, Ligne], combinaisons: CombinaisonGauches[], nommage: Nommage): JustificationDeuxDroites {
  const { nomDe, nommes } = nommage;
  const quatre = [l[0].p, l[0].q, l[1].p, l[1].q];
  if (paire.position === "secantes") {
    const lieu = lieuNomme(paire.lieu!, nommage);
    const nomCommun = lieu.type === "nomme" ? lieu.nom : null;
    const distracteursPoints = melanger(quatre.map(nomDe).filter((n) => n !== nomCommun));
    const options: OptionPointCommun[] = nomCommun
      ? [{ type: "point", nom: nomCommun }, { type: "point", nom: distracteursPoints[0]! }, { type: "surSolide" }, { type: "hors" }]
      : [{ type: "surSolide" }, { type: "hors" }, { type: "point", nom: distracteursPoints[0]! }, { type: "point", nom: distracteursPoints[1]! }];
    const correcte = options[nomCommun ? 0 : lieu.type === "hors" ? 1 : 0]!;
    const melangees = melanger(options);
    return { type: "secantes", position: paire.inter!, lieu, options: melangees, bonne: melangees.indexOf(correcte) };
  }
  if (paire.position === "paralleles") {
    const refs = referencesParalleles(solide, l);
    const bonne = choisir(refs);
    const dir = pixel(solide, l[0].q.position);
    const dir0 = pixel(solide, l[0].p.position);
    const dirPx = { x: dir.x - dir0.x, y: dir.y - dir0.y };
    const noms = Object.keys(solide.sommets);
    const distracteurs: DroiteNommee[] = [];
    for (let i = 0; i < noms.length; i++) {
      for (let j = i + 1; j < noms.length; j++) {
        const a = solide.sommets[noms[i]!]!;
        const b = solide.sommets[noms[j]!]!;
        if (sontParalleles3D(soustraire3D(l[0].q.position, l[0].p.position), soustraire3D(b, a))) continue;
        if (l.some((x) => points3Colineaires(a, b, x.p.position) && points3Colineaires(a, b, x.q.position))) continue;
        const pa = pixel(solide, a);
        const pb = pixel(solide, b);
        if (angle2D(dirPx, { x: pb.x - pa.x, y: pb.y - pa.y }) < 12) continue; // pas « parallèle sur le dessin »
        distracteurs.push([noms[i]!, noms[j]!]);
      }
    }
    const options = melanger([bonne, ...melanger(distracteurs).slice(0, 3)]).map((d) => melanger(d) as DroiteNommee);
    const indice = options.findIndex((d) => [...d].sort().join("") === [...bonne].sort().join(""));
    return { type: "paralleles", options, bonne: indice };
  }
  // gauches : (d2) perce un plan (Q) qui contient (d1), en un point qui n'est pas sur (d1)
  const combinaison = choisir(combinaisons);
  const contenue = l[combinaison.contenue];
  const percante = l[1 - combinaison.contenue]!;
  const r = combinaison.r;
  const rPrime = percante.p.cle === r.cle ? percante.q : percante.p;
  const t: [Point3D, Point3D, Point3D] = [contenue.p.position, contenue.q.position, r.position];
  const dansQ = nommes.filter((c) => pointAppartientAuPlan(c.position, t));
  const nomQ = nommerPlan(dansQ, nomDe, [contenue.p, contenue.q].map(nomDe), choisir([0, 1, 2]), [nomDe(r)]);
  const autresDeQ = melanger(dansQ.filter((c) => !quatre.some((x) => x.cle === c.cle)));
  const horsQ = melanger(nommes.filter((c) => !dansQ.includes(c) && !quatre.some((x) => x.cle === c.cle)));
  const quatrieme = autresDeQ[0] ?? horsQ[0]!;
  const options = melanger([nomDe(r), nomDe(rPrime), nomDe(choisir([contenue.p, contenue.q])), nomDe(quatrieme)]);
  return { type: "gauches", plan: nomQ, contenue: (combinaison.contenue + 1) as 1 | 2, point: nomDe(r), options, bonne: options.indexOf(nomDe(r)) };
}

function construirePositions(): ExerciceDeuxDroites {
  const position = choisir<PositionDeuxDroites>(["secantes", "paralleles", "gauches"]);
  const { solide, paire } = tirerPaire(position);
  const { l, combinaisons } = orienterPaire(paire);
  const nommage = nommer(solide, [l[0].p, l[0].q, l[1].p, l[1].q]);
  const { nomDe } = nommage;
  const plan = optionsPlanCommun(l, nommage, position !== "gauches");
  return {
    variante: "positions",
    solide,
    pointsNommes: nommage.pointsNommes,
    d1: [nomDe(l[0].p), nomDe(l[0].q)],
    d2: [nomDe(l[1].p), nomDe(l[1].q)],
    position,
    croisementApparent: paire.croisement,
    planCommun: plan.planCommun,
    optionsPlan: plan.options,
    bonPlan: plan.bon,
    ordrePositions: melanger<PositionDeuxDroites>(["secantes", "paralleles", "gauches"]),
    justification: justificationPositions(solide, paire, l, combinaisons, nommage),
  };
}

// ---------------------------------------------------------------------------------------------
// Famille « plan déterminé »
// ---------------------------------------------------------------------------------------------

interface TripletBrut {
  points: [Candidat, Candidat, Candidat];
  alignes: boolean;
  nonSommets: number;
}

function enumererTriplets(solide: Solide3D): TripletBrut[] {
  const cands = candidatsDe(solide, true);
  const triplets: TripletBrut[] = [];
  for (let i = 0; i < cands.length; i++) {
    for (let j = i + 1; j < cands.length; j++) {
      for (let k = j + 1; k < cands.length; k++) {
        const points: [Candidat, Candidat, Candidat] = [cands[i]!, cands[j]!, cands[k]!];
        const nonSommets = nbNonSommets(points);
        if (nonSommets === 0 || nonSommets > 3) continue;
        const pix = points.map((c) => pixel(solide, c.position));
        if (dist2D(pix[0]!, pix[1]!) < 18 || dist2D(pix[0]!, pix[2]!) < 18 || dist2D(pix[1]!, pix[2]!) < 18) continue;
        const alignes = points3Colineaires(points[0].position, points[1].position, points[2].position);
        // non alignés : ils doivent aussi le paraître sur le dessin
        if (!alignes && Math.min(distanceALaDroite2D(pix[0]!, pix[1]!, pix[2]!), distanceALaDroite2D(pix[1]!, pix[0]!, pix[2]!), distanceALaDroite2D(pix[2]!, pix[0]!, pix[1]!)) < 12) continue;
        // un point non sommet ne doit pas se dessiner sur un autre point du solide
        const autres = cands.filter((c) => !points.includes(c) && c.sommet !== null);
        if (points.some((p) => p.sommet === null && autres.some((c) => dist2D(pixel(solide, c.position), pixel(solide, p.position)) < 14))) continue;
        triplets.push({ points, alignes, nonSommets });
      }
    }
  }
  return triplets;
}

const CACHE_TRIPLETS = new Map<string, Map<string, TripletBrut[]>>();

function seauxTriplets(solide: Solide3D): Map<string, TripletBrut[]> {
  let seaux = CACHE_TRIPLETS.get(solide.id);
  if (!seaux) {
    seaux = new Map();
    for (const t of enumererTriplets(solide)) {
      const cle = `${t.alignes ? "alignes" : "libres"}|${t.nonSommets}`;
      const liste = seaux.get(cle) ?? [];
      liste.push(t);
      seaux.set(cle, liste);
    }
    CACHE_TRIPLETS.set(solide.id, seaux);
  }
  return seaux;
}

/** Nombre de points non sommets d'un triplet : 1 (A, I, B ; A, K, C) ou 3 (I, K, J sur une
 * médiane d'une face) — les seuls possibles pour trois points ALIGNÉS de ces solides ; le même
 * tirage sert aux triplets non alignés, pour que ce nombre ne trahisse pas le verdict. */
const POIDS_NON_SOMMETS_TRIPLET = [
  { valeur: 1, poids: 0.6 },
  { valeur: 3, poids: 0.4 },
];

function tirerTriplet(alignes: boolean): { solide: Solide3D; triplet: TripletBrut } {
  for (let essai = 0; essai < 60; essai++) {
    const nonSommets = tirerPondere(POIDS_NON_SOMMETS_TRIPLET);
    for (let s = 0; s < 4; s++) {
      const solide = GABARITS_SOLIDE3D[choisir(SOLIDES_DEUX_DROITES)];
      const seau = seauxTriplets(solide).get(`${alignes ? "alignes" : "libres"}|${nonSommets}`);
      if (seau && seau.length > 0) return { solide, triplet: choisir(seau) };
    }
  }
  throw new Error("gen100 : aucun triplet de points");
}

function construirePlan(typeImpose?: TypeDonneesPlan): ExercicePlanDetermine {
  const determine = Math.random() < 0.5;
  const type = typeImpose ?? choisir<TypeDonneesPlan>(["troisPoints", "droitePoint", "deuxDroites"]);
  let solide: Solide3D;
  let ordre: Candidat[];
  let positionDroites: PositionDeuxDroites | null = null;
  let preuve: { paire: PaireBrute; l: [Ligne, Ligne]; combinaisons: CombinaisonGauches[] } | null = null;
  if (type === "deuxDroites") {
    positionDroites = determine ? choisir<PositionDeuxDroites>(["secantes", "paralleles"]) : "gauches";
    const tirage = tirerPaire(positionDroites);
    solide = tirage.solide;
    const { l, combinaisons } = orienterPaire(tirage.paire);
    preuve = { paire: tirage.paire, l, combinaisons };
    ordre = [l[0].p, l[0].q, l[1].p, l[1].q];
  } else {
    const tirage = tirerTriplet(!determine);
    solide = tirage.solide;
    ordre = melanger(tirage.triplet.points);
  }
  const nommage = nommer(solide, ordre);
  const { nomDe, nommes } = nommage;
  let pointsDuPlan: string[] = [];
  let nomPlan: NomPlan | null = null;
  if (determine) {
    const t = triplesNonAlignes(ordre)[0]!;
    nomPlan = t.map(nomDe) as NomPlan;
    const positions = t.map((c) => c.position) as [Point3D, Point3D, Point3D];
    pointsDuPlan = nommes.filter((c) => pointAppartientAuPlan(c.position, positions)).map(nomDe);
  }
  const justificationDroites = preuve ? justificationPositions(solide, preuve.paire, preuve.l, preuve.combinaisons, nommage) : null;
  const optionsRaison = melanger<IdRaisonPlan>(["vraie", "consequence", "regle"]);
  return {
    variante: "plan",
    type,
    solide,
    pointsNommes: nommage.pointsNommes,
    points: ordre.map(nomDe),
    determine,
    positionDroites,
    pointsDuPlan,
    nomPlan,
    justificationDroites,
    ordreVerdict: melanger([true, false]),
    optionsRaison,
    bonneRaison: optionsRaison.indexOf("vraie"),
  };
}

// ---------------------------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VarianteDeuxDroitesPlan; label: string }[] = [
  { id: "positions", label: "Positions de deux droites" },
  { id: "plan", label: "Ces données déterminent-elles un plan ?" },
];

export function construireAvecVariante(id: string): ExerciceDeuxDroitesPlan {
  return id === "plan" ? construirePlan() : construirePositions();
}

export function genererExerciceDeuxDroitesPlan(): ExerciceDeuxDroitesPlan {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}

/** Pour les tests : un type de données imposé dans la famille « plan ». */
export function construirePlanDeType(type: TypeDonneesPlan): ExercicePlanDetermine {
  return construirePlan(type);
}

/** Pour les mesures : taille des seaux de paires et de triplets, par gabarit. */
export function __seauxPourTests(): Record<string, Record<string, number>> {
  const r: Record<string, Record<string, number>> = {};
  for (const nom of SOLIDES_DEUX_DROITES) {
    const solide = GABARITS_SOLIDE3D[nom];
    const seaux: Record<string, number> = {};
    for (const [k, v] of seauxPaires(solide)) seaux[k] = v.length;
    for (const [k, v] of seauxTriplets(solide)) seaux["T " + k] = v.length;
    r[nom] = seaux;
  }
  return r;
}
