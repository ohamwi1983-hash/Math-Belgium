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
  ObstacleOmbreSoleil,
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

/** Familles de distracteurs « au sol » : trace au sol de mauvaise longueur, point sur l'image du
 * rayon sans être sur la trace, sens opposé, composantes permutées. */
function famillesSol(piquet: Piquet, direction: Point3D, ombre: Point3D): CandidatBrut[][] {
  const base = piquet.base;
  const sommet = sommetPiquet(piquet);
  const trace = soustraire3D(ombre, base);
  const tSol = -sommet.z / direction.z;
  const permutee = intersectionAvecSol(sommet, { x: direction.y, y: direction.x, z: direction.z });
  return [
    [
      { position: additionner3D(base, multiplierScalaire3D(trace, randomReel(0.45, 0.6, 0.05))), erreur: "traceTropCourte" },
      { position: additionner3D(base, multiplierScalaire3D(trace, randomReel(1.45, 1.75, 0.05))), erreur: "traceTropLongue" },
    ],
    [
      { position: pointSolSurImageDuRayon(sommet, direction, tSol * randomReel(0.55, 0.7, 0.05)), erreur: "surRayonSansTrace" },
      { position: pointSolSurImageDuRayon(sommet, direction, tSol * randomReel(1.3, 1.5, 0.05)), erreur: "surRayonSansTrace" },
    ],
    [
      { position: soustraire3D(base, trace), erreur: "sensOppose" },
      { position: permutee, erreur: "composantesPermutees" },
    ],
  ];
}

/** Tire 3 distracteurs, un par famille (puis complète avec les familles restantes), qui respectent
 * `valide`. */
function choisirDistracteurs(familles: CandidatBrut[][], valide: (c: CandidatBrut) => boolean): CandidatBrut[] | null {
  const retenus: CandidatBrut[] = [];
  const restants: CandidatBrut[] = [];
  for (const famille of familles) {
    const valides = famille.filter(valide);
    if (valides.length === 0) continue;
    const i = randomInt(0, valides.length - 1);
    if (retenus.length < 3) retenus.push(valides[i]);
    restants.push(...valides.filter((_, j) => j !== i));
  }
  for (const c of restants) {
    if (retenus.length >= 3) break;
    retenus.push(c);
  }
  return retenus.length === 3 ? retenus : null;
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

const MAX_TENTATIVES_INSTANCE = 6000;

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

    const distracteurs = choisirDistracteurs(famillesSol(piquetA, direction, ombre), () => true);
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

/** Le point tombe dans le rectangle englobant le dessin de l'obstacle. */
function dansDessinObstacle(p: Point3D, obstacle: ObstacleOmbreSoleil): boolean {
  const sommets = Object.values(obstacle.solide.sommets).map(projeter2D);
  const q = projeter2D(p);
  const marge = 0.4;
  return (
    q.x > Math.min(...sommets.map((s) => s.x)) - marge &&
    q.x < Math.max(...sommets.map((s) => s.x)) + marge &&
    q.y > Math.min(...sommets.map((s) => s.y)) - marge &&
    q.y < Math.max(...sommets.map((s) => s.y)) + marge
  );
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
    if (impact.indexObstacle === null && obstacles.some((o) => dansEmpriseObstacle(ombreSansObstacle, o, 0.3))) continue;

    // Distracteurs propres aux obstacles, prioritaires.
    const auSolValide = (p: Point3D) => p.z !== 0 || !obstacles.some((o) => dansEmpriseObstacle(p, o, 0.2));
    const familles: CandidatBrut[][] = [];
    if (impact.indexObstacle !== null) {
      familles.push([{ position: ombreSansObstacle, erreur: "traverseObstacle" }]);
      const suivants = impactsObstacles(sommet, direction, obstacles).filter((i) => i.indexObstacle !== impact.indexObstacle);
      familles.push(suivants.map((i) => ({ position: i.point, erreur: "obstacleSuivant" as const })));
    } else {
      const survoles = obstacles
        .map((o) => pointSurObstacleSurvole(baton.base, ombreSansObstacle, o))
        .filter((p): p is Point3D => p !== null)
        .map((p) => ({ position: p, erreur: "surObstacleSurvole" as const }));
      if (survoles.length === 0) continue; // le rayon doit passer au-dessus d'au moins un obstacle
      familles.push(survoles);
    }
    const sol = famillesSol(baton, direction, ombreSansObstacle);
    const permutee = impactScene(sommet, { x: direction.y, y: direction.x, z: direction.z }, obstacles).point;
    familles.push([...sol[0], ...sol[1], { position: soustraire3D(baton.base, trace), erreur: "sensOppose" }, { position: permutee, erreur: "composantesPermutees" }]);

    const distracteurs = choisirDistracteurs(familles, (c) => auSolValide(c.position) && distance3D(c.position, impact.point) > 0.3);
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
      const distracteurs = choisirDistracteurs(famillesSol(piquet, direction, s.ombre), (c) => horsEmprise(c.position));
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

// --- Catalogue de variantes (convention CLAUDE.md) -------------------------------------------------

export const CATALOGUE_VARIANTES: { id: VarianteOmbreSoleil; label: string }[] = [
  { id: "simple", label: "Ombre simple sur sol plat" },
  { id: "obstacle", label: "Ombre avec obstacle" },
  { id: "directionInconnue", label: "Direction inconnue à déduire" },
];

export function construireAvecVarianteId(varianteId: VarianteOmbreSoleil): ExerciceOmbreSoleil {
  if (varianteId === "simple") return construireSimple();
  if (varianteId === "obstacle") return construireObstacle();
  return construireDirectionInconnue();
}

export function genererExerciceOmbreSoleil(): ExerciceOmbreSoleil {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}
