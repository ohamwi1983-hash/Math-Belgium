import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type {
  Boite3D,
  CadrageScene,
  DirectionCandidate,
  ErreurPointOmbre,
  ExerciceOmbreSoleil,
  ExerciceOmbreSoleilDirectionInconnue,
  ExerciceOmbreSoleilObstacle,
  ExerciceOmbreSoleilSimple,
  ExerciceOmbreSoleilSolidePose,
  FormeSolidePose,
  ObstacleOmbreSoleil,
  SegmentContourOmbre,
  OmbreSommet,
  Piquet,
  PiquetAResoudre,
  PointCandidat,
  VarianteOmbreSoleil,
} from "../../core/ombreSoleil.types";
import { additionner3D, distance3D, multiplierScalaire3D, soustraire3D } from "../solide3D/geometrieEspace";
import { construireEscalierCaisses, GABARITS_SOLIDE3D, HAUTEUR_MARCHE_ESCALIER, LARGEUR_MARCHE_ESCALIER, PROFONDEUR_ESCALIER } from "../solide3D/gabarits";
import {
  construireDirectionsCandidates,
  dansEmpriseObstacle,
  distancePixel,
  echellePixel,
  impactScene,
  impactsObstacles,
  intersectionAvecSol,
  projeter2D,
  sommetPiquet,
} from "./ombreGeometrie";

/**
 * Couche A — "Ombre au soleil" (41e générateur, chapitre "Géométrie dans l'espace"). Refonte issue
 * de l'audit du chapitre 8 :
 * - variante `obstacle` : une seule question par scène (H4a), le premier impact réel du rayon
 *   (obstacle ou sol) ; scènes cohérentes (aucun bâton ni piquet d'exemple dans un obstacle, aucun
 *   obstacle qui en chevauche un autre, rayon de l'exemple jamais intercepté — point 32) ; environ
 *   30 % de scènes où l'ombre atteint le sol en passant au-dessus d'un obstacle (point 35) ;
 * - variante `directionInconnue` : campanile seul (H5a), ombre complète reconstituée par son vrai
 *   contour (enveloppe convexe) ;
 * - points candidats indépendants des directions candidates, chacun incarnant une erreur de
 *   construction précise (point 38), tous discernables à l'écran (point 40).
 * Les tirages qui ne respectent pas ces contraintes sont rejetés et refaits.
 */

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomReel(min: number, max: number, pas = 0.5): number {
  return min + pas * randomInt(0, Math.round((max - min) / pas));
}

function choisir<T>(tableau: readonly T[]): T {
  return tableau[randomInt(0, tableau.length - 1)];
}

const COMPOSANTES_DIRECTION = [-3, -2, -1, 1, 2, 3];

/** Direction de lumière — toujours `dz<0` (la lumière descend), `dx≠0, dy≠0, |dx|≠|dy|`. */
function construireDirection(dzMin: number, dzMax: number): Point3D {
  const dx = choisir(COMPOSANTES_DIRECTION);
  const dy = choisir(COMPOSANTES_DIRECTION.filter((v) => Math.abs(v) !== Math.abs(dx)));
  return { x: dx, y: dy, z: -randomInt(dzMin, dzMax) };
}

const PLAGE_BASE = 6;

function tirerPiquet(id: string, basesExistantes: Point3D[], separationMin: number, hauteurMin = 2, hauteurMax = 5): Piquet | null {
  for (let tentative = 0; tentative < 100; tentative++) {
    const base: Point3D = { x: randomInt(-PLAGE_BASE, PLAGE_BASE), y: randomInt(-PLAGE_BASE, PLAGE_BASE), z: 0 };
    if (basesExistantes.every((b) => distance3D(b, base) >= separationMin)) return { id, base, hauteur: randomInt(hauteurMin, hauteurMax) };
  }
  return null;
}

// --- Points candidats (indépendants des directions candidates) ------------------------------------

const K_CAVALIER = Math.cos(Math.PI / 4) * 0.5;

/** Point du sol dont l'image à l'écran tombe sur l'image du rayon au paramètre `t` — il « est sur
 * le rayon » sur le dessin, sans être sur la trace au sol (erreur : rayon tracé sans la trace). */
function pointSolSurImageDuRayon(sommet: Point3D, direction: Point3D, t: number): Point3D {
  const p = additionner3D(sommet, multiplierScalaire3D(direction, t));
  return { x: p.x - p.z, y: p.y + p.z / K_CAVALIER, z: 0 };
}

interface CandidatBrut {
  position: Point3D;
  erreur: ErreurPointOmbre;
}

/** Distracteurs « au sol » : trace au sol de mauvaise longueur, point sur l'image du rayon sans être
 * sur la trace, sens opposé, composantes permutées. */
function distracteursSol(piquet: Piquet, direction: Point3D, ombre: Point3D): CandidatBrut[] {
  const base = piquet.base;
  const sommet = sommetPiquet(piquet);
  const trace = soustraire3D(ombre, base);
  const tSol = -sommet.z / direction.z;
  const permutee = intersectionAvecSol(sommet, { x: direction.y, y: direction.x, z: direction.z });
  return [
    { position: additionner3D(base, multiplierScalaire3D(trace, randomReel(0.45, 0.6, 0.05))), erreur: "traceTropCourte" },
    { position: additionner3D(base, multiplierScalaire3D(trace, randomReel(1.35, 1.55, 0.05))), erreur: "traceTropLongue" },
    { position: pointSolSurImageDuRayon(sommet, direction, tSol * randomReel(0.55, 0.7, 0.05)), erreur: "surRayonSansTrace" },
    { position: pointSolSurImageDuRayon(sommet, direction, tSol * randomReel(1.25, 1.4, 0.05)), erreur: "surRayonSansTrace" },
    // Sens opposé, raccourci : l'erreur reste lisible sans doubler la taille de la scène.
    { position: additionner3D(base, multiplierScalaire3D(trace, -randomReel(0.6, 0.8, 0.05))), erreur: "sensOppose" },
    { position: permutee, erreur: "composantesPermutees" },
  ];
}

function melanger<T>(tableau: readonly T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/**
 * Tire 3 distracteurs qui respectent `valide` en ÉQUILIBRANT le rang de la bonne réponse : le
 * nombre de distracteurs plus proches du pied que la bonne réponse (sur le dessin) est tiré entre
 * 0 et 3. Sans cela, « l'ombre est le deuxième point le plus proche du pied » suffisait à répondre.
 * `exigence` impose une contrainte supplémentaire au trio (ex. un point posé sur un obstacle).
 */
function choisirDistracteurs(
  pool: CandidatBrut[],
  vrai: Point3D,
  pied: Point3D,
  valide: (c: CandidatBrut) => boolean,
  exigence: (trio: CandidatBrut[]) => boolean = () => true,
): CandidatBrut[] | null {
  const distance = (p: Point3D) => {
    const a = projeter2D(p);
    const b = projeter2D(pied);
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const dVrai = distance(vrai);
  const valides = melanger(pool.filter((c) => valide(c) && distance3D(c.position, vrai) > 0.3));
  const proches = valides.filter((c) => distance(c.position) < dVrai - 0.05);
  const loins = valides.filter((c) => distance(c.position) >= dVrai - 0.05);
  for (const k of melanger([0, 1, 2, 3])) {
    if (proches.length < k || loins.length < 3 - k) continue;
    const trio = [...proches.slice(0, k), ...loins.slice(0, 3 - k)];
    if (exigence(trio)) return trio;
  }
  return null;
}

function versCandidats(vrai: Point3D, distracteurs: CandidatBrut[]): PointCandidat[] {
  return [{ position: vrai, erreur: "aucune" as const }, ...distracteurs].map((c, i) => ({ id: `p${i}`, position: c.position, erreur: c.erreur }));
}

// --- Cadrage et lisibilité --------------------------------------------------------------------------

const MARGE_SOL = 1.2;
const SEPARATION_CANDIDATS_PX = 24;
const SEPARATION_AUTRES_PX = 16;
const SEPARATION_APERCUS_PX = 20;
/** Longueur à l'écran des aperçus de direction, en pixels. */
const LONGUEUR_APERCU_PX = 80;

function construireCadrage(pointsSol: Point3D[], autres: Point3D[]): CadrageScene {
  const xs = pointsSol.map((p) => p.x);
  const ys = pointsSol.map((p) => p.y);
  const xMin = Math.min(...xs) - MARGE_SOL;
  const xMax = Math.max(...xs) + MARGE_SOL;
  const yMin = Math.min(...ys) - MARGE_SOL;
  const yMax = Math.max(...ys) + MARGE_SOL;
  const sol: CadrageScene["sol"] = [
    { x: xMin, y: yMin, z: 0 },
    { x: xMax, y: yMin, z: 0 },
    { x: xMax, y: yMax, z: 0 },
    { x: xMin, y: yMax, z: 0 },
  ];
  return { sol, points: [...sol, ...autres] };
}

/** Candidats deux à deux séparés de 24 px, et à 16 px au moins des autres points dessinés. */
function candidatsLisibles(candidats: readonly PointCandidat[], autresPoints: readonly Point3D[], echelle: number): boolean {
  for (let i = 0; i < candidats.length; i++) {
    for (let j = i + 1; j < candidats.length; j++) {
      if (distancePixel(candidats[i].position, candidats[j].position, echelle) < SEPARATION_CANDIDATS_PX) return false;
    }
    if (autresPoints.some((p) => distancePixel(candidats[i].position, p, echelle) < SEPARATION_AUTRES_PX)) return false;
  }
  return true;
}

function apercusLisibles(directions: readonly DirectionCandidate[], echelle: number): boolean {
  for (let i = 0; i < directions.length; i++) {
    for (let j = i + 1; j < directions.length; j++) {
      if (distancePixel(directions[i].extremiteApercu, directions[j].extremiteApercu, echelle) < SEPARATION_APERCUS_PX) return false;
    }
  }
  return true;
}

const MAX_TENTATIVES_INSTANCE = 20000;

/** Directions candidates dont les aperçus mesurent ~80 px à l'écran : la longueur dépend de
 * l'échelle finale, qui dépend elle-même des extrémités des aperçus (inclus dans le cadrage) —
 * quelques ajustements successifs suffisent à converger. */
function directionsAvecApercusALaBonneLongueur(direction: Point3D, origine: Point3D, scene: Point3D[]): DirectionCandidate[] | null {
  let echelle = echellePixel(scene);
  let directions: DirectionCandidate[] | null = null;
  for (let iteration = 0; iteration < 3; iteration++) {
    directions = construireDirectionsCandidates(direction, origine, LONGUEUR_APERCU_PX / echelle);
    if (!directions) return null;
    echelle = echellePixel([...scene, ...directions.map((d) => d.extremiteApercu)]);
  }
  return directions;
}

// --- Variante A — Ombre simple sur sol plat --------------------------------------------------------

function construireSimple(): ExerciceOmbreSoleilSimple {
  for (let tentative = 0; tentative < MAX_TENTATIVES_INSTANCE; tentative++) {
    const direction = construireDirection(3, 6);
    const piquetExemple = tirerPiquet("E", [], 0);
    if (!piquetExemple) continue;
    const piquetA = tirerPiquet("A", [piquetExemple.base], 4);
    if (!piquetA) continue;
    const ombreExemple = intersectionAvecSol(sommetPiquet(piquetExemple), direction);
    const ombre = intersectionAvecSol(sommetPiquet(piquetA), direction);

    const distracteurs = choisirDistracteurs(distracteursSol(piquetA, direction, ombre), ombre, piquetA.base, () => true);
    if (!distracteurs) continue;
    const pointsCandidats = versCandidats(ombre, distracteurs);

    const pointsSol = [piquetExemple.base, ombreExemple, piquetA.base, ...pointsCandidats.map((c) => c.position)];
    const cadrage = construireCadrage(pointsSol, [sommetPiquet(piquetExemple), sommetPiquet(piquetA)]);
    const echelle = echellePixel(cadrage.points);
    if (!candidatsLisibles(pointsCandidats, [piquetExemple.base, ombreExemple, piquetA.base], echelle)) continue;

    const piquet: PiquetAResoudre = { piquet: piquetA, ombre, pointsCandidats };
    return { variante: "simple", direction, piquetExemple, ombreExemple, piquet, cadrage };
  }
  throw new Error(`construireSimple : aucune instance valide trouvée après ${MAX_TENTATIVES_INSTANCE} tentatives`);
}

// --- Variante B — Ombre avec obstacle(s) ------------------------------------------------------------

function solideBoite(boite: Boite3D, label: string): Solide3D {
  const { min, max } = boite;
  return {
    id: "cube",
    label,
    sommets: {
      A: { x: min.x, y: min.y, z: 0 },
      B: { x: max.x, y: min.y, z: 0 },
      C: { x: max.x, y: max.y, z: 0 },
      D: { x: min.x, y: max.y, z: 0 },
      E: { x: min.x, y: min.y, z: max.z },
      F: { x: max.x, y: min.y, z: max.z },
      G: { x: max.x, y: max.y, z: max.z },
      H: { x: min.x, y: max.y, z: max.z },
    },
    faces: [
      ["A", "B", "C", "D"],
      ["E", "F", "G", "H"],
      ["A", "B", "F", "E"],
      ["D", "C", "G", "H"],
      ["A", "D", "H", "E"],
      ["B", "C", "G", "F"],
    ],
  };
}

function construireCaisse(centre: Point3D, hauteurBaton: number): ObstacleOmbreSoleil {
  const demiX = randomReel(0.7, 1.5);
  const demiY = randomReel(0.7, 1.5);
  // Jamais plus haute que le bâton : une caisse plus haute que lui le masquerait sur le dessin.
  const hauteur = randomReel(1, hauteurBaton - 0.5);
  const boite: Boite3D = { min: { x: centre.x - demiX, y: centre.y - demiY, z: 0 }, max: { x: centre.x + demiX, y: centre.y + demiY, z: hauteur } };
  return { type: "caisse", solide: solideBoite(boite, "Caisse"), boites: [boite] };
}

/** Escalier de 3 marches centré en `centre` — une boîte de collision par colonne de marche. */
function construireEscalier(centre: Point3D): ObstacleOmbreSoleil {
  const nombreMarches = 3;
  const brut = construireEscalierCaisses(nombreMarches);
  const dx = centre.x - (nombreMarches * LARGEUR_MARCHE_ESCALIER) / 2;
  const dy = centre.y - PROFONDEUR_ESCALIER / 2;
  const sommets: Record<string, Point3D> = {};
  for (const [nom, p] of Object.entries(brut.sommets)) sommets[nom] = { x: p.x + dx, y: p.y + dy, z: p.z };
  const boites: Boite3D[] = [];
  for (let i = 1; i <= nombreMarches; i++) {
    boites.push({
      min: { x: dx + (i - 1) * LARGEUR_MARCHE_ESCALIER, y: dy, z: 0 },
      max: { x: dx + i * LARGEUR_MARCHE_ESCALIER, y: dy + PROFONDEUR_ESCALIER, z: i * HAUTEUR_MARCHE_ESCALIER },
    });
  }
  return { type: "escalier", solide: { ...brut, sommets }, boites };
}

/** Deux emprises au sol séparées d'au moins `marge`. */
function emprisesDisjointes(a: ObstacleOmbreSoleil, b: ObstacleOmbreSoleil, marge: number): boolean {
  return a.boites.every((ba) =>
    b.boites.every(
      (bb) => ba.max.x + marge <= bb.min.x || bb.max.x + marge <= ba.min.x || ba.max.y + marge <= bb.min.y || bb.max.y + marge <= ba.min.y,
    ),
  );
}

/** Point de la surface supérieure de l'obstacle situé au-dessus de la trace au sol — le distracteur
 * « l'ombre s'arrête sur l'obstacle » quand le rayon passe en réalité au-dessus de lui. */
function pointSurObstacleSurvole(base: Point3D, ombre: Point3D, obstacle: ObstacleOmbreSoleil): Point3D | null {
  const dedans: number[] = [];
  for (let k = 1; k < 40; k++) {
    const s = k / 40;
    const p = additionner3D(base, multiplierScalaire3D(soustraire3D(ombre, base), s));
    if (dansEmpriseObstacle(p, obstacle, -0.2)) dedans.push(s);
  }
  if (dedans.length === 0) return null;
  const s = dedans[Math.floor(dedans.length / 2)];
  const p = additionner3D(base, multiplierScalaire3D(soustraire3D(ombre, base), s));
  const boite = obstacle.boites.find((b) => p.x >= b.min.x && p.x <= b.max.x && p.y >= b.min.y && p.y <= b.max.y);
  return boite ? { x: p.x, y: p.y, z: boite.max.z } : null;
}

/** L'obstacle est devant le bâton (plus près de l'observateur) et son dessin recouvre celui du
 * bâton. */
function masqueBaton(obstacle: ObstacleOmbreSoleil, piquet: Piquet): boolean {
  const devant = obstacle.boites.some((b) => b.min.y < piquet.base.y);
  if (!devant) return false;
  const sommets = Object.values(obstacle.solide.sommets).map(projeter2D);
  const xMin = Math.min(...sommets.map((p) => p.x));
  const xMax = Math.max(...sommets.map((p) => p.x));
  const yMin = Math.min(...sommets.map((p) => p.y));
  const yMax = Math.max(...sommets.map((p) => p.y));
  const pied = projeter2D(piquet.base);
  const tete = projeter2D(sommetPiquet(piquet));
  const marge = 0.3;
  return pied.x > xMin - marge && pied.x < xMax + marge && Math.max(pied.y, tete.y) > yMin - marge && Math.min(pied.y, tete.y) < yMax + marge;
}

/** Le point tombe dans le dessin de l'obstacle (enveloppe convexe de ses sommets projetés, élargie
 * de `marge` unité). */
function dansDessinObstacle(p: Point3D, obstacle: ObstacleOmbreSoleil, marge = 0.3): boolean {
  const enveloppe = enveloppeConvexe(Object.values(obstacle.solide.sommets).map((s) => ({ ...projeter2D(s), z: 0 })));
  const q = projeter2D(p);
  for (let i = 0; i < enveloppe.length; i++) {
    const a = enveloppe[i];
    const b = enveloppe[(i + 1) % enveloppe.length];
    const longueur = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    // Sens trigonométrique : un point extérieur est strictement à droite d'au moins une arête.
    if (((b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x)) / longueur < -marge) return false;
  }
  return true;
}

/** Distance (en pixels) d'un point au segment [a, b], sur le dessin. */
function distancePixelSegment(p: Point3D, a: Point3D, b: Point3D, echelle: number): number {
  const P = projeter2D(p);
  const A = projeter2D(a);
  const B = projeter2D(b);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const longueurCarree = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((P.x - A.x) * dx + (P.y - A.y) * dy) / longueurCarree));
  return Math.hypot(P.x - (A.x + t * dx), P.y - (A.y + t * dy)) * echelle;
}

function boitesModifiees(obstacles: readonly ObstacleOmbreSoleil[], marge: number): ObstacleOmbreSoleil[] {
  return obstacles.map((o) => ({
    ...o,
    boites: o.boites.map((b) => ({
      min: { x: b.min.x - marge, y: b.min.y - marge, z: 0 },
      max: { x: b.max.x + marge, y: b.max.y + marge, z: b.max.z + marge },
    })),
  }));
}

/** Rejette les rayons qui frôlent une arête : l'issue (obstacle touché ou sol, point d'impact) doit
 * rester la même si l'on grossit ou amincit les obstacles de 0,1 — sinon le dessin ne permettrait
 * pas de trancher. */
function impactNet(origine: Point3D, direction: Point3D, obstacles: readonly ObstacleOmbreSoleil[], point: Point3D, index: number | null): boolean {
  return [0.1, -0.1].every((marge) => {
    const i = impactScene(origine, direction, boitesModifiees(obstacles, marge));
    return i.indexObstacle === index && distance3D(i.point, point) < 0.6;
  });
}

/** Points de l'obstacle touché où l'on pourrait à tort placer l'ombre : sur le dessus, au-dessus de
 * la trace au sol, et sur la face par laquelle la trace entre dans l'obstacle, à mi-hauteur — sans
 * eux, le seul point posé sur un obstacle serait presque toujours la réponse. */
function pointsSurObstacleTouche(base: Point3D, ombre: Point3D, obstacle: ObstacleOmbreSoleil, impact: Point3D): Point3D[] {
  const resultat: Point3D[] = [];
  const dessus = pointSurObstacleSurvole(base, ombre, obstacle);
  if (dessus) resultat.push(dessus);
  // Entrée exacte de la trace au sol dans chaque boîte (méthode des dalles, dans le plan du sol).
  const trace = soustraire3D(ombre, base);
  let entree: { s: number; boite: Boite3D } | null = null;
  for (const boite of obstacle.boites) {
    let sMin = 0;
    let sMax = Infinity;
    for (const axe of ["x", "y"] as const) {
      if (Math.abs(trace[axe]) < 1e-12) {
        if (base[axe] < boite.min[axe] || base[axe] > boite.max[axe]) sMin = Infinity;
        continue;
      }
      const s1 = (boite.min[axe] - base[axe]) / trace[axe];
      const s2 = (boite.max[axe] - base[axe]) / trace[axe];
      sMin = Math.max(sMin, Math.min(s1, s2));
      sMax = Math.min(sMax, Math.max(s1, s2));
    }
    if (sMin <= sMax && sMin > 0 && (entree === null || sMin < entree.s)) entree = { s: sMin, boite };
  }
  if (entree) {
    const p = additionner3D(base, multiplierScalaire3D(trace, entree.s));
    resultat.push({ x: p.x, y: p.y, z: entree.boite.max.z * randomReel(0.3, 0.7, 0.05) });
  }
  return resultat.filter((p) => distance3D(p, impact) > 0.5);
}

const PROBABILITE_OMBRE_AU_SOL = 0.3;
const PROBABILITE_ESCALIER = 0.35;

function construireObstacle(): ExerciceOmbreSoleilObstacle {
  // Issue visée tirée UNE fois, avant les essais : sinon l'issue la plus facile à construire
  // l'emporterait sur la proportion voulue.
  const cibleSol = Math.random() < PROBABILITE_OMBRE_AU_SOL;
  for (let tentative = 0; tentative < MAX_TENTATIVES_INSTANCE; tentative++) {
    const direction = construireDirection(2, 3);
    const piquetExemple = tirerPiquet("E", [], 0);
    if (!piquetExemple) continue;
    const baton = tirerPiquet("A", [piquetExemple.base], 5, 4, 6);
    if (!baton) continue;
    const sommet = sommetPiquet(baton);
    const ombreSansObstacle = intersectionAvecSol(sommet, direction);
    const trace = soustraire3D(ombreSansObstacle, baton.base);
    const longueurTrace = Math.hypot(trace.x, trace.y);
    if (longueurTrace < 2) continue;
    const perpendiculaire: Point3D = { x: -trace.y / longueurTrace, y: trace.x / longueurTrace, z: 0 };

    // Un obstacle « principal » est posé SUR la trace au sol, à une hauteur choisie pour l'issue
    // visée : plus haut que le rayon (l'ombre s'y arrête) ou plus bas (le rayon passe au-dessus et
    // l'ombre atteint le sol). Les autres obstacles sont étalés le long de la trace.
    const nombreObstacles = randomInt(1, 3);
    const indexPrincipal = randomInt(0, nombreObstacles - 1);
    const obstacles: ObstacleOmbreSoleil[] = [];
    let principalImpossible = false;
    for (let i = 0; i < nombreObstacles; i++) {
      const s = 0.45 + (i * 1.0) / nombreObstacles + randomReel(0, 0.15, 0.05);
      if (i === indexPrincipal) {
        const centre = additionner3D(baton.base, multiplierScalaire3D(trace, Math.min(s, 0.8)));
        const caisse = construireCaisse(centre, baton.hauteur);
        const coins = Object.values(caisse.solide.sommets).filter((c) => c.z === 0);
        const hauteursRayon = coins.map((c) => baton.hauteur * (1 - ((c.x - baton.base.x) * trace.x + (c.y - baton.base.y) * trace.y) / (longueurTrace * longueurTrace)));
        const hauteur = cibleSol ? Math.min(...hauteursRayon) - randomReel(0.4, 1, 0.1) : Math.max(...hauteursRayon) + randomReel(0.3, 1.5, 0.1);
        if (hauteur < 0.5 || hauteur > baton.hauteur - 0.3) {
          principalImpossible = true;
          break;
        }
        const boite = { ...caisse.boites[0], max: { ...caisse.boites[0].max, z: hauteur } };
        obstacles.push({ type: "caisse", solide: solideBoite(boite, "Caisse"), boites: [boite] });
        continue;
      }
      const decalage = randomReel(-2, 2, 0.5);
      const centre = additionner3D(additionner3D(baton.base, multiplierScalaire3D(trace, s)), multiplierScalaire3D(perpendiculaire, decalage));
      // L'escalier (4,5 de haut) seulement si le bâton le dépasse.
      const escalier = baton.hauteur >= 5 && Math.random() < PROBABILITE_ESCALIER;
      obstacles.push(escalier ? construireEscalier(centre) : construireCaisse(centre, baton.hauteur));
    }
    if (principalImpossible) continue;

    // Cohérence de la scène (audit, point 32).
    let coherente = true;
    for (let i = 0; i < obstacles.length && coherente; i++) {
      for (let j = i + 1; j < obstacles.length; j++) {
        if (!emprisesDisjointes(obstacles[i], obstacles[j], 0.6)) coherente = false;
      }
    }
    if (!coherente) continue;
    if (obstacles.some((o) => dansEmpriseObstacle(baton.base, o, 1.2) || dansEmpriseObstacle(piquetExemple.base, o, 1))) continue;
    // Aucun bâton caché derrière un obstacle placé devant lui sur le dessin.
    if (obstacles.some((o) => masqueBaton(o, baton) || masqueBaton(o, piquetExemple))) continue;
    const ombreExemple = intersectionAvecSol(sommetPiquet(piquetExemple), direction);
    if (impactScene(sommetPiquet(piquetExemple), direction, obstacles).indexObstacle !== null) continue;
    if (obstacles.some((o) => dansEmpriseObstacle(ombreExemple, o, 0.3))) continue;

    const impact = impactScene(sommet, direction, obstacles);
    if (cibleSol !== (impact.indexObstacle === null)) continue;
    if (!impactNet(sommet, direction, obstacles, impact.point, impact.indexObstacle)) continue;
    if (impact.indexObstacle === null && obstacles.some((o) => dansEmpriseObstacle(ombreSansObstacle, o, 0.3))) continue;

    // Distracteurs : erreurs propres aux obstacles (rayon qui « traverse », obstacle suivant, mauvais
    // endroit sur l'obstacle touché, obstacle survolé) et erreurs de construction générales.
    const auSolValide = (p: Point3D) => p.z !== 0 || !obstacles.some((o) => dansEmpriseObstacle(p, o, 0.2));
    const pool: CandidatBrut[] = [];
    if (impact.indexObstacle !== null) {
      pool.push({ position: ombreSansObstacle, erreur: "traverseObstacle" });
      const suivants = impactsObstacles(sommet, direction, obstacles).filter((i) => i.indexObstacle !== impact.indexObstacle);
      pool.push(...suivants.map((i) => ({ position: i.point, erreur: "obstacleSuivant" as const })));
      const touche = obstacles[impact.indexObstacle];
      pool.push(...pointsSurObstacleTouche(baton.base, ombreSansObstacle, touche, impact.point).map((p) => ({ position: p, erreur: "surObstacleMauvaiseFace" as const })));
    } else {
      const survoles = obstacles
        .map((o) => pointSurObstacleSurvole(baton.base, ombreSansObstacle, o))
        .filter((p): p is Point3D => p !== null)
        .map((p) => ({ position: p, erreur: "surObstacleSurvole" as const }));
      if (survoles.length === 0) continue; // le rayon doit passer au-dessus d'au moins un obstacle
      pool.push(...survoles);
    }
    const permutee = impactScene(sommet, { x: direction.y, y: direction.x, z: direction.z }, obstacles).point;
    // Ombre trop courte : au sol, entre le pied du bâton et le vrai point d'impact.
    const piedImpact: Point3D = { x: impact.point.x, y: impact.point.y, z: 0 };
    pool.push(
      { position: additionner3D(baton.base, multiplierScalaire3D(soustraire3D(piedImpact, baton.base), randomReel(0.35, 0.65, 0.05))), erreur: "traceTropCourte" },
      { position: additionner3D(baton.base, multiplierScalaire3D(trace, -randomReel(0.6, 0.8, 0.05))), erreur: "sensOppose" },
      { position: permutee, erreur: "composantesPermutees" },
      ...distracteursSol(baton, direction, ombreSansObstacle).filter((c) => c.erreur === "traceTropLongue" || c.erreur === "surRayonSansTrace"),
    );

    // Un distracteur posé au sol ne doit pas tomber dans le dessin d'un obstacle (il semblerait posé
    // dessus) ; au moins un distracteur est posé sur un obstacle et un autre au sol, pour que « le
    // point posé sur un obstacle » ou « le point au sol » ne désignent jamais la réponse à coup sûr.
    const surObstacle = (c: CandidatBrut) => c.position.z > 1e-9;
    const distracteurs = choisirDistracteurs(
      pool,
      impact.point,
      baton.base,
      (c) => auSolValide(c.position) && !(c.position.z === 0 && obstacles.some((o) => dansDessinObstacle(c.position, o))),
      (trio) => trio.some(surObstacle) && trio.some((c) => !surObstacle(c)),
    );
    if (!distracteurs) continue;
    const pointsCandidats = versCandidats(impact.point, distracteurs);

    const sommetsObstacles = obstacles.flatMap((o) => Object.values(o.solide.sommets));
    const directionsCandidates = directionsAvecApercusALaBonneLongueur(direction, sommet, [
      piquetExemple.base,
      sommetPiquet(piquetExemple),
      baton.base,
      sommet,
      ...sommetsObstacles,
      ...pointsCandidats.map((c) => c.position),
    ]);
    if (!directionsCandidates) continue;

    const pointsSol = [piquetExemple.base, ombreExemple, baton.base, ombreSansObstacle, ...pointsCandidats.map((c) => c.position), ...sommetsObstacles];
    const cadrage = construireCadrage(pointsSol, [
      sommetPiquet(piquetExemple),
      sommet,
      ...sommetsObstacles,
      ...pointsCandidats.map((c) => c.position),
      ...directionsCandidates.map((d) => d.extremiteApercu),
    ]);
    const echelle = echellePixel(cadrage.points);
    if (!candidatsLisibles(pointsCandidats, [piquetExemple.base, ombreExemple, baton.base], echelle)) continue;
    if (!apercusLisibles(directionsCandidates, echelle)) continue;
    // L'exemple reste à l'écart : ni dans le dessin d'un obstacle, ni sous les aperçus du bâton A.
    const pointsExemple = [piquetExemple.base, sommetPiquet(piquetExemple), ombreExemple];
    if (obstacles.some((o) => pointsExemple.some((p) => dansDessinObstacle(p, o)))) continue;
    if (directionsCandidates.some((d) => pointsExemple.some((p) => distancePixelSegment(p, sommet, d.extremiteApercu, echelle) < 18))) continue;

    return {
      variante: "obstacle",
      direction,
      directionsCandidates,
      piquetExemple,
      ombreExemple,
      baton,
      obstacles,
      indexObstacleTouche: impact.indexObstacle,
      ombre: impact.point,
      ombreSansObstacle,
      pointsCandidats,
      cadrage,
    };
  }
  throw new Error(`construireObstacle : aucune instance valide trouvée après ${MAX_TENTATIVES_INSTANCE} tentatives`);
}

// --- Variante C — Direction inconnue à déduire (campanile) -----------------------------------------

const PLAGE_TRANSLATION_SOLIDE = 4;
const MARGE_EMPRISE_CAMPANILE = 0.4;
const NOMBRE_SOMMETS_A_PROJETER_MAX = 3;

function translaterSolideHorizontalement(solide: Solide3D, dx: number, dy: number): Solide3D {
  const sommets: Record<string, Point3D> = {};
  for (const [nom, p] of Object.entries(solide.sommets)) {
    sommets[nom] = { x: p.x + dx, y: p.y + dy, z: p.z };
  }
  return { ...solide, sommets };
}

function piquetDepuisSommet(nom: string, p: Point3D): Piquet {
  return { id: nom, base: { x: p.x, y: p.y, z: 0 }, hauteur: p.z };
}

/** Enveloppe convexe (plan du sol) — chaîne monotone d'Andrew, sens trigonométrique. */
function enveloppeConvexe(points: Point3D[]): Point3D[] {
  const tries = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  const produit = (o: Point3D, a: Point3D, b: Point3D) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const bas: Point3D[] = [];
  for (const p of tries) {
    while (bas.length >= 2 && produit(bas[bas.length - 2], bas[bas.length - 1], p) <= 1e-9) bas.pop();
    bas.push(p);
  }
  const haut: Point3D[] = [];
  for (const p of [...tries].reverse()) {
    while (haut.length >= 2 && produit(haut[haut.length - 2], haut[haut.length - 1], p) <= 1e-9) haut.pop();
    haut.push(p);
  }
  return [...bas.slice(0, -1), ...haut.slice(0, -1)];
}

function construireDirectionInconnue(): ExerciceOmbreSoleilDirectionInconnue {
  for (let tentative = 0; tentative < MAX_TENTATIVES_INSTANCE; tentative++) {
    const direction = construireDirection(2, 3);
    const dx = randomInt(-PLAGE_TRANSLATION_SOLIDE, PLAGE_TRANSLATION_SOLIDE);
    const dy = randomInt(-PLAGE_TRANSLATION_SOLIDE, PLAGE_TRANSLATION_SOLIDE);
    const solide = translaterSolideHorizontalement(GABARITS_SOLIDE3D.campanile, dx, dy);
    const base = ["A", "B", "C", "D"].map((n) => solide.sommets[n]);
    const xMin = Math.min(...base.map((p) => p.x));
    const xMax = Math.max(...base.map((p) => p.x));
    const yMin = Math.min(...base.map((p) => p.y));
    const yMax = Math.max(...base.map((p) => p.y));
    const dessin = Object.values(solide.sommets).map(projeter2D);
    const dansDessinCampanile = (p: Point3D) => {
      const q = projeter2D(p);
      return q.x > Math.min(...dessin.map((d) => d.x)) && q.x < Math.max(...dessin.map((d) => d.x)) && q.y > Math.min(...dessin.map((d) => d.y)) && q.y < Math.max(...dessin.map((d) => d.y));
    };
    const horsEmprise = (p: Point3D) =>
      p.x < xMin - MARGE_EMPRISE_CAMPANILE || p.x > xMax + MARGE_EMPRISE_CAMPANILE || p.y < yMin - MARGE_EMPRISE_CAMPANILE || p.y > yMax + MARGE_EMPRISE_CAMPANILE;

    const sommetsHorsSol = Object.entries(solide.sommets)
      .filter(([, p]) => p.z > 0)
      .map(([nom, p]) => ({ id: nom, sommet: p, ombre: intersectionAvecSol(p, direction) }));
    const visibles = sommetsHorsSol.filter((s) => horsEmprise(s.ombre));
    if (visibles.length < 3) continue;

    const connu = choisir(visibles);
    const eligibles = visibles.filter((s) => s.id !== connu.id);
    const nombreAProjeter = randomInt(2, Math.min(NOMBRE_SOMMETS_A_PROJETER_MAX, eligibles.length));
    // L'apex S en priorité quand il est projetable : c'est lui qui donne la pointe de l'ombre.
    const ordonnes = [...eligibles].sort((a, b) => (a.id === "S" ? -1 : b.id === "S" ? 1 : Math.random() - 0.5));
    const aProjeter = ordonnes.slice(0, nombreAProjeter);
    const ombresAutres: OmbreSommet[] = sommetsHorsSol.filter((s) => s.id !== connu.id && !aProjeter.includes(s));

    const toutesOmbres = sommetsHorsSol.map((s) => s.ombre);
    const piquets: PiquetAResoudre[] = [];
    let echec = false;
    for (const s of aProjeter) {
      const piquet = piquetDepuisSommet(s.id, s.sommet);
      const distracteurs = choisirDistracteurs(distracteursSol(piquet, direction, s.ombre), s.ombre, piquet.base, (c) => horsEmprise(c.position) && !dansDessinCampanile(c.position));
      if (!distracteurs) {
        echec = true;
        break;
      }
      piquets.push({ piquet, ombre: s.ombre, pointsCandidats: versCandidats(s.ombre, distracteurs) });
    }
    if (echec) continue;

    const piquetConnu = piquetDepuisSommet(connu.id, connu.sommet);
    const contourOmbre = enveloppeConvexe([...base, ...toutesOmbres]);
    const candidats = piquets.flatMap((p) => p.pointsCandidats.map((c) => c.position));
    // Les aperçus partent du premier sommet à projeter, jamais du sommet connu (dont le rayon est
    // déjà dessiné : le bon candidat s'y superposerait).
    const directionsCandidates = directionsAvecApercusALaBonneLongueur(direction, sommetPiquet(piquets[0].piquet), [...Object.values(solide.sommets), ...toutesOmbres, ...candidats]);
    if (!directionsCandidates) continue;

    const cadrage = construireCadrage([...base, ...toutesOmbres, ...candidats], [
      ...Object.values(solide.sommets),
      ...candidats,
      ...directionsCandidates.map((d) => d.extremiteApercu),
    ]);
    const echelle = echellePixel(cadrage.points);
    if (!apercusLisibles(directionsCandidates, echelle)) continue;
    const lisibles = piquets.every((p) =>
      candidatsLisibles(
        p.pointsCandidats,
        toutesOmbres.filter((o) => distance3D(o, p.ombre) > 1e-9),
        echelle,
      ),
    );
    if (!lisibles) continue;

    return {
      variante: "directionInconnue",
      direction,
      directionsCandidates,
      solide,
      piquetConnu,
      ombreConnue: connu.ombre,
      piquets,
      ombresAutres,
      contourOmbre,
      cadrage,
    };
  }
  throw new Error(`construireDirectionInconnue : aucune instance valide trouvée après ${MAX_TENTATIVES_INSTANCE} tentatives`);
}

// --- Variante D — Ombre d'un solide posé au sol (manuel, ex. 3 b, 3 d, 3 e, 9) ---------------------

const NOMS_BASE = ["A", "B", "C", "D"] as const;
const NOMS_HAUT = ["E", "F", "G", "H"] as const;
/** Arêtes verticales VISIBLES en perspective cavalière (D–H est cachée) : seules candidates pour
 * l'arête donnée et pour le coin du piquet de la pyramide. */
const COINS_VISIBLES = ["A", "B", "C"] as const;
/** Pixels : un point hors du contour reste à cette distance de son bord, un sommet du contour à cette
 * distance de la corde de ses voisins (sinon « est-il sur le bord ? » ne se lirait pas sur le dessin). */
const NETTETE_CONTOUR_PX = 10;
/** Pixels : les ombres et les candidats restent hors du dessin du solide (l'ombre doit se voir). */
const MARGE_DESSIN_SOLIDE_PX = 12;
/** Pixels : arête la plus courte du solide sur le dessin. */
const ARETE_MIN_PX = 24;
/** Pixels : un candidat ne touche aucun trait déjà dessiné (arêtes, rayon et ombre donnés). */
const ECART_CANDIDAT_TRAIT_PX = 7;
/** Pixels : un rayon, une trace ou un côté du contour passe à cette distance au moins des points
 * nommés dont il ne part pas. */
const ECART_TRAIT_POINT_PX = 9;
/** Le pavé (caisse basse) est la forme la plus contrainte : jusqu'à 60 000 essais (≈ 0,5 s au pire). */
const MAX_TENTATIVES_SOLIDE_POSE = 60000;
/** Longueur de l'ombre d'une verticale du solide, au plus ce multiple de sa plus grande dimension. */
const RAPPORT_OMBRE_MAX = 2.2;

const FACES_BOITE: string[][] = [
  ["A", "B", "C", "D"],
  ["E", "F", "G", "H"],
  ["A", "B", "F", "E"],
  ["D", "C", "G", "H"],
  ["A", "D", "H", "E"],
  ["B", "C", "G", "F"],
];

/** Cube (côté 2 à 4), pavé « caisse » plus large que haut, ou pyramide régulière à base carrée —
 * mêmes noms et mêmes faces que les gabarits du chapitre (`solide3D/gabarits.ts`), dimensions tirées. */
function construireSolidePoseBrut(forme: FormeSolidePose): Solide3D {
  if (forme === "pyramide") {
    const c = choisir([3, 4]);
    const h = choisir([3, 4, 5]);
    return {
      id: "pyramideCarree",
      label: "Pyramide régulière à base carrée ABCD-S",
      sommets: { A: { x: 0, y: 0, z: 0 }, B: { x: c, y: 0, z: 0 }, C: { x: c, y: c, z: 0 }, D: { x: 0, y: c, z: 0 }, S: { x: c / 2, y: c / 2, z: h } },
      faces: [["A", "B", "C", "D"], ["A", "B", "S"], ["B", "C", "S"], ["C", "D", "S"], ["D", "A", "S"]],
    };
  }
  const s = choisir([2, 3, 4]);
  const [w, d, h] = forme === "cube" ? [s, s, s] : [choisir([3, 4]), choisir([2, 3]), choisir([2, 2.5, 3])];
  const sommets: Record<string, Point3D> = {};
  const coins = [
    [0, 0],
    [w, 0],
    [w, d],
    [0, d],
  ];
  coins.forEach(([x, y], i) => {
    sommets[NOMS_BASE[i]] = { x, y, z: 0 };
    sommets[NOMS_HAUT[i]] = { x, y, z: h };
  });
  return { id: forme === "cube" ? "cube" : "parallelepipede", label: forme === "cube" ? "Cube ABCDEFGH" : "Parallélépipède rectangle ABCDEFGH", sommets, faces: FACES_BOITE };
}

/** Le point du sol `p` est-il dans le rectangle de la base (élargi de `marge`) ? */
function dansBase(p: Point3D, base: Point3D[], marge: number): boolean {
  const xs = base.map((b) => b.x);
  const ys = base.map((b) => b.y);
  return p.x > Math.min(...xs) - marge && p.x < Math.max(...xs) + marge && p.y > Math.min(...ys) - marge && p.y < Math.max(...ys) + marge;
}

/** Distance signée (pixels) de `p` au polygone convexe `poly` (sens trigonométrique, plan projeté) :
 * positive dehors, négative dedans. */
function distanceSigneePolygone(p: { x: number; y: number }, poly: { x: number; y: number }[], echelle: number): number {
  let dehors = -Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const longueur = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    dehors = Math.max(dehors, -((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) / longueur);
  }
  if (dehors <= 0) return dehors * echelle;
  // Dehors : vraie distance au bord (et pas seulement à la droite d'un côté).
  let min = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1)));
    min = Math.min(min, Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy));
  }
  return min * echelle;
}

/** Enveloppe convexe des sommets projetés (le dessin du solide), sens trigonométrique. */
function dessinSolide(solide: Solide3D): { x: number; y: number }[] {
  return enveloppeConvexe(Object.values(solide.sommets).map((s) => ({ ...projeter2D(s), z: 0 })));
}

const PROBABILITE_PYRAMIDE = 1 / 3;

function construireSolidePose(): ExerciceOmbreSoleilSolidePose {
  // Forme tirée UNE fois, avant les essais (sinon la plus facile à construire l'emporterait).
  const forme: FormeSolidePose = Math.random() < PROBABILITE_PYRAMIDE ? "pyramide" : Math.random() < 0.5 ? "cube" : "pave";  for (let tentative = 0; tentative < MAX_TENTATIVES_SOLIDE_POSE; tentative++) {
    const tiree = construireDirection(1, forme === "pave" ? 2 : 3);
    // Ombre vers l'avant (comme les figures du manuel) : vers l'arrière, elle tomberait derrière le
    // solide sur le dessin et se lirait mal — on tourne la composante de profondeur, même tirage.
    const direction = tiree.y > 0 ? { ...tiree, y: -tiree.y } : tiree;
    const solide = construireSolidePoseBrut(forme);
    const S = solide.sommets;
    const base = NOMS_BASE.map((n) => S[n]);
    const pyramide = forme === "pyramide";
    const hauteur = pyramide ? S.S.z : S.E.z;
    // Translation au sol commune à toutes les verticales de même hauteur.
    const v: Point3D = { x: (hauteur * direction.x) / -direction.z, y: (hauteur * direction.y) / -direction.z, z: 0 };
    // Ombre pas trop longue : sinon le solide devient minuscule sur le dessin.
    const tailleBase = Math.max(...base.map((p) => p.x)) - Math.min(...base.map((p) => p.x));
    if (Math.hypot(v.x, v.y) > RAPPORT_OMBRE_MAX * Math.max(tailleBase, hauteur)) continue;
    // Sur le dessin, l'ombre d'une verticale ne doit pas prolonger la verticale elle-même (angle à
    // la verticale ≥ 20°), et le rayon doit se distinguer de l'ombre (angle en X′ ≥ 12°) : sinon
    // arête, rayon et ombre se confondaient en un seul trait.
    const v2 = projeter2D(v);
    const angle = (a: { x: number; y: number }, b: { x: number; y: number }) => (Math.acos(Math.max(-1, Math.min(1, (a.x * b.x + a.y * b.y) / (Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y) || 1)))) * 180) / Math.PI;
    if (angle(v2, { x: 0, y: -1 }) < 20) continue;
    if (angle({ x: -v2.x, y: -v2.y }, { x: -v2.x, y: hauteur - v2.y }) < 12) continue;
    const ombreDe = (p: Point3D) => intersectionAvecSol(p, direction);

    // L'ombre doit déborder franchement de la base : toutes les ombres de sommets hors de la base.
    const hauts = pyramide ? [{ id: "S", sommet: S.S, pied: "O" }] : NOMS_HAUT.map((n, i) => ({ id: n as string, sommet: S[n], pied: NOMS_BASE[i] as string }));
    const ombresHauts = hauts.map((h) => ({ ...h, ombre: ombreDe(h.sommet) }));
    if (ombresHauts.some((o) => dansBase(o.ombre, base, 0.5))) continue;

    // Donnée : un coin VISIBLE d'où l'ombre part vers l'extérieur de la base (sinon elle passerait
    // sous le solide).
    const coinsPossibles = COINS_VISIBLES.filter((n) => [0.3, 0.6, 1].every((t) => !dansBase(additionner3D(S[n], multiplierScalaire3D(v, t)), base, -1e-6)));
    if (coinsPossibles.length === 0) continue;
    const coin = choisir(coinsPossibles);
    const piedConnu = coin as string;
    const piquetConnu: Piquet = pyramide ? { id: "P", base: S[coin], hauteur } : { id: NOMS_HAUT[NOMS_BASE.indexOf(coin)], base: S[coin], hauteur };
    const ombreConnue = ombreDe(sommetPiquet(piquetConnu));

    // Contour : enveloppe convexe de la base et des ombres des sommets du haut.
    const nommes = [...NOMS_BASE.map((n) => ({ nom: n as string, p: S[n] })), ...ombresHauts.map((o) => ({ nom: `${o.id}′`, p: o.ombre }))];
    const contourOmbre = enveloppeConvexe(nommes.map((n) => n.p));
    const nomDe = (p: Point3D) => nommes.find((n) => distance3D(n.p, p) < 1e-9)!.nom;
    let nomsContour = contourOmbre.map(nomDe);
    // Le tracé commence au premier coin de la base présent sur le contour (lecture « ABF′G′… »).
    const debut = nomsContour.findIndex((n) => NOMS_BASE.includes(n as (typeof NOMS_BASE)[number]));
    const ordre = [...contourOmbre.slice(debut), ...contourOmbre.slice(0, debut)];
    nomsContour = ordre.map(nomDe);

    // Écrans « point » : les sommets du haut dont l'ombre est un coin du contour (hors donnée) — deux
    // pour le cube et le pavé (le troisième coin, et l'ombre intérieure, suivent « par le même
    // procédé »), l'apex S pour la pyramide.
    const surContour = (nom: string) => nomsContour.includes(nom);
    const candidatsEcran = ombresHauts.filter((o) => o.id !== piquetConnu.id && surContour(`${o.id}′`));
    if (!pyramide && candidatsEcran.length < 2) continue;
    const aProjeter = pyramide ? candidatsEcran : melanger(candidatsEcran).slice(0, 2);
    if (aProjeter.length === 0) continue;
    const ombresAutres: OmbreSommet[] = ombresHauts.filter((o) => o.id !== piquetConnu.id && !aProjeter.includes(o)).map((o) => ({ id: o.id, sommet: o.sommet, ombre: o.ombre }));

    // Échelle provisoire (sans candidats) pour les contrôles en pixels qui ne dépendent que de la scène.
    const toutesOmbres = ombresHauts.map((o) => o.ombre);
    const sommetPiquetConnu = sommetPiquet(piquetConnu);
    const pointsScene = [...Object.values(S), ...toutesOmbres, ombreConnue, sommetPiquetConnu];
    const contour2D = ordre.map(projeter2D);
    const silhouette = dessinSolide(solide);

    // Points candidats de chaque écran.
    const piquets: PiquetAResoudre[] = [];
    const piedsPiquets: string[] = [];
    let echec = false;
    const traitsDonnes: [Point3D, Point3D][] = [
      ...calculerAretesSolide(solide).map((a): [Point3D, Point3D] => [S[a[0]], S[a[1]]]),
      [sommetPiquetConnu, ombreConnue],
      [piquetConnu.base, ombreConnue],
      ...(pyramide ? [[piquetConnu.base, sommetPiquetConnu] as [Point3D, Point3D]] : []),
    ];
    const echelleScene = echellePixel(pointsScene);
    for (const s of aProjeter) {
      const piquet = piquetDepuisSommet(s.id, s.sommet);
      const coinsVoisins = NOMS_BASE.filter((n) => n !== s.pied).map((n) => S[n]);
      const pool: CandidatBrut[] = [
        ...distracteursSol(piquet, direction, s.ombre),
        ...coinsVoisins.map((c) => ({ position: additionner3D(c, v), erreur: "piedVoisin" as const })),
      ];
      // Hors de la base (sous le solide), hors de son dessin, et jamais sur une ombre déjà dessinée.
      const dejaDessinees = [ombreConnue, ...piquets.map((p) => p.ombre)];
      const valide = (c: CandidatBrut) =>
        !dansBase(c.position, base, 0.3) &&
        distanceSigneePolygone(projeter2D(c.position), silhouette, echelleScene) > MARGE_DESSIN_SOLIDE_PX &&
        dejaDessinees.every((o) => distance3D(c.position, o) > 0.3);
      // Au moins un « mauvais pied » (l'erreur propre à la variante) ; rang de la bonne réponse
      // équilibré autant que possible par `choisirDistracteurs`.
      const distracteurs = choisirDistracteurs(pool, s.ombre, piquet.base, valide, (trio) => trio.some((c) => c.erreur === "piedVoisin"));
      if (!distracteurs) {
        echec = true;
        break;
      }
      piquets.push({ piquet, ombre: s.ombre, pointsCandidats: versCandidats(s.ombre, distracteurs) });
      piedsPiquets.push(s.pied);
    }
    if (echec) continue;

    const candidats = piquets.flatMap((p) => p.pointsCandidats.map((c) => c.position));
    const pointsSol = [...base, ...toutesOmbres, ombreConnue, ...candidats];
    const cadrage = construireCadrage(pointsSol, [...Object.values(S), sommetPiquetConnu, ...candidats]);
    const echelle = echellePixel(cadrage.points);

    // Lisibilité : arêtes assez longues ; ombres hors du dessin du solide ; contour net ; candidats
    // séparés entre eux, des points dessinés et des traits donnés.
    const longueurs = calculerAretesSolide(solide).map((a) => distancePixel(S[a[0]], S[a[1]], echelle));
    if (Math.min(...longueurs) < ARETE_MIN_PX) continue;
    if ([...toutesOmbres, ombreConnue].some((o) => distanceSigneePolygone(projeter2D(o), silhouette, echelle) < MARGE_DESSIN_SOLIDE_PX)) continue;
    const interieurs = nommes.filter((n) => !nomsContour.includes(n.nom));
    if (interieurs.some((n) => -distanceSigneePolygone(projeter2D(n.p), contour2D, echelle) < NETTETE_CONTOUR_PX)) continue;
    const coinsNets = contour2D.every((p, i) => {
      const a = contour2D[(i + contour2D.length - 1) % contour2D.length];
      const b = contour2D[(i + 1) % contour2D.length];
      return distanceSigneePolygone(p, [a, b], echelle) >= NETTETE_CONTOUR_PX;
    });
    if (!coinsNets) continue;
    if (pyramide) {
      const ombre2D = projeter2D(ombreConnue);
      if (distanceSigneePolygone(ombre2D, contour2D, echelle) < 18) continue;
      // Le piquet ne se confond avec aucune arête de la pyramide (hors de son pied).
      const milieu = { x: piquetConnu.base.x, y: piquetConnu.base.y, z: hauteur / 2 };
      const aretesHorsPied = calculerAretesSolide(solide).filter((a) => a[0] !== coin && a[1] !== coin);
      if ([milieu, sommetPiquetConnu].some((p) => aretesHorsPied.some((a) => distancePixelSegment(p, S[a[0]], S[a[1]], echelle) < 12))) continue;
      if (calculerAretesSolide(solide).some((a) => distancePixelSegment(sommetPiquetConnu, S[a[0]], S[a[1]], echelle) < 12)) continue;
    }
    // Aucun rayon ni aucune trace au sol (donnée, construction du corrigé, côtés du contour) ne frôle
    // un point nommé qui n'est pas son extrémité : sur le dessin, il semblerait passer par lui (et
    // son étiquette n'aurait plus de place — sommet caché D, centre O).
    const O: Point3D = pyramide ? { x: S.S.x, y: S.S.y, z: 0 } : S.A;
    const nommesFigure: Point3D[] = [...Object.values(S), ...toutesOmbres, ombreConnue, sommetPiquetConnu, ...(pyramide ? [O] : [])];
    // Chaque trait : ses extrémités et les points qui lui appartiennent par construction (le pied
    // d'un rayon — triangle sommet / pied / ombre —, O sur les diagonales) sont exemptés.
    const pied = (p: Point3D): Point3D => ({ x: p.x, y: p.y, z: 0 });
    const traitsConstruction: { a: Point3D; b: Point3D; exemptes: Point3D[] }[] = [
      ...ombresHauts.map((o) => ({ a: o.sommet, b: o.ombre, exemptes: [pied(o.sommet)] })),
      ...ombresHauts.map((o) => ({ a: pied(o.sommet), b: o.ombre, exemptes: [o.sommet] })),
      { a: sommetPiquetConnu, b: ombreConnue, exemptes: [piquetConnu.base] },
      { a: piquetConnu.base, b: ombreConnue, exemptes: [sommetPiquetConnu] },
      ...ordre.map((p, i) => ({ a: p, b: ordre[(i + 1) % ordre.length]!, exemptes: [] as Point3D[] })),
      ...(pyramide ? [{ a: S.A, b: S.C, exemptes: [O] }, { a: S.B, b: S.D, exemptes: [O] }] : []),
    ];
    const frole = nommesFigure.some((p) =>
      traitsConstruction.some(
        (t) => [t.a, t.b, ...t.exemptes].every((q) => distance3D(p, q) > 1e-9) && distancePixelSegment(p, t.a, t.b, echelle) < ECART_TRAIT_POINT_PX,
      ),
    );
    if (frole) continue;
    const pointsDessines = (index: number) => [
      ...Object.values(S),
      ombreConnue,
      sommetPiquetConnu,
      ...(pyramide ? [{ x: S.S.x, y: S.S.y, z: 0 }] : []),
      ...piquets.slice(0, index).map((p) => p.ombre),
    ];
    const lisibles = piquets.every(
      (p, i) =>
        candidatsLisibles(p.pointsCandidats, pointsDessines(i), echelle) &&
        p.pointsCandidats.every((c) => traitsDonnes.every(([a, b]) => distancePixelSegment(c.position, a, b, echelle) >= ECART_CANDIDAT_TRAIT_PX)),
    );
    if (!lisibles) continue;

    // Écran « contour » : les ombres de TOUTES les arêtes (une arête de la base est sa propre ombre).
    const ombreNom = (nomHaut: string) => `${nomHaut}′`;
    const paires: [string, string][] = pyramide
      ? [["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"], ["A", "S′"], ["B", "S′"], ["C", "S′"], ["D", "S′"]]
      : [
          ["A", "B"], ["B", "C"], ["C", "D"], ["D", "A"],
          ...NOMS_BASE.map((n, i): [string, string] => [n, ombreNom(NOMS_HAUT[i])]),
          ...NOMS_HAUT.map((n, i): [string, string] => [ombreNom(n), ombreNom(NOMS_HAUT[(i + 1) % 4])]),
        ];
    const k = nomsContour.length;
    const estCote = (a: string, b: string) => {
      const i = nomsContour.indexOf(a);
      const j = nomsContour.indexOf(b);
      return i >= 0 && j >= 0 && ((i + 1) % k === j || (j + 1) % k === i);
    };
    const segmentsCandidats: SegmentContourOmbre[] = paires.map(([a, b], i) => ({ id: `s${i}`, extremites: [a, b], surContour: estCote(a, b) }));
    // Chaque côté du contour doit être l'ombre d'une arête (toujours vrai pour un solide convexe posé).
    if (segmentsCandidats.filter((s) => s.surContour).length !== k) continue;
    return {
      variante: "solidePose",
      forme,
      direction,
      solide,
      piquetConnu,
      piedConnu,
      ombreConnue,
      piquets,
      piedsPiquets,
      ombresAutres,
      contourOmbre: ordre,
      nomsContour,
      segmentsCandidats,
      cadrage,
    };
  }
  throw new Error(`construireSolidePose : aucune instance valide trouvée après ${MAX_TENTATIVES_SOLIDE_POSE} tentatives`);
}

/** Arêtes (paires de noms) d'un solide, dérivées de ses faces. */
function calculerAretesSolide(solide: Solide3D): [string, string][] {
  const cles = new Set<string>();
  const aretes: [string, string][] = [];
  for (const face of solide.faces) {
    face.forEach((n, i) => {
      const [a, b] = [n, face[(i + 1) % face.length]].sort();
      if (!cles.has(`${a}-${b}`)) {
        cles.add(`${a}-${b}`);
        aretes.push([a, b]);
      }
    });
  }
  return aretes;
}

// --- Catalogue de variantes (convention CLAUDE.md) -------------------------------------------------

/** Nouvelles variantes TOUJOURS en fin de catalogue : les indices, donc les `?code=` déjà imprimés,
 * ne changent pas. */
export const CATALOGUE_VARIANTES: { id: VarianteOmbreSoleil; label: string }[] = [
  { id: "simple", label: "Ombre simple sur sol plat" },
  { id: "obstacle", label: "Ombre avec obstacle" },
  { id: "directionInconnue", label: "Direction inconnue à déduire" },
  { id: "solidePose", label: "Ombre d'un solide posé au sol" },
];

/** Variantes du tirage libre de l'ADAPTATEUR et des codes : les trois d'avant, tirées comme avant
 * (même appel `randomInt(0, 2)`), pour que les codes « libres » déjà imprimés rejouent le même
 * exercice. L'appli tire en plus la variante « solide posé » (`genererExerciceOmbreSoleilLibre`). */
const VARIANTES_TIRAGE_LIBRE = CATALOGUE_VARIANTES.slice(0, 3);

export function construireAvecVarianteId(varianteId: VarianteOmbreSoleil): ExerciceOmbreSoleil {
  if (varianteId === "simple") return construireSimple();
  if (varianteId === "obstacle") return construireObstacle();
  if (varianteId === "solidePose") return construireSolidePose();
  return construireDirectionInconnue();
}

export function genererExerciceOmbreSoleil(): ExerciceOmbreSoleil {
  const varianteId = VARIANTES_TIRAGE_LIBRE[randomInt(0, VARIANTES_TIRAGE_LIBRE.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}

/** Tirage libre de l'APPLI : l'ombre d'un solide posé au sol une fois sur quatre (autant que chacune
 * des trois autres variantes), sinon le tirage libre d'avant. Un `?code=` imprimé reste tiré par
 * `genererExerciceOmbreSoleil` (même fonction que l'adaptateur). */
export function genererExerciceOmbreSoleilLibre(): ExerciceOmbreSoleil {
  return Math.random() < 1 / 4 ? construireSolidePose() : genererExerciceOmbreSoleil();
}
