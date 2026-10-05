import type { Point3D, Solide3D } from "../../core/geometrieEspace.types";
import type {
  DirectionCandidate,
  ExerciceOmbreSoleil,
  ExerciceOmbreSoleilDirectionInconnue,
  ExerciceOmbreSoleilObstacle,
  ExerciceOmbreSoleilSimple,
  ObstacleAResoudre,
  ObstacleOmbreSoleil,
  Piquet,
  PiquetAResoudre,
  TypeObstacleOmbreSoleil,
  VarianteOmbreSoleil,
} from "../../core/ombreSoleil.types";
import { additionner3D, distance3D, multiplierScalaire3D } from "../solide3D/geometrieEspace";
import {
  construireEscalierCaisses,
  GABARITS_OMBRE_DIRECTION_INCONNUE,
  GABARITS_SOLIDE3D,
  LARGEUR_MARCHE_ESCALIER,
  NOMBRE_MARCHES_MAX,
  NOMBRE_MARCHES_MIN,
  PROFONDEUR_ESCALIER,
  tirerNomGabarit,
} from "../solide3D/gabarits";
import { construireDirectionsCandidates, intersectionAvecSol, ombreDepuis, ombrePiquet, sommetPiquet } from "./ombreGeometrie";

/**
 * Couche A — "Ombre au soleil" (41e générateur, chapitre "Géométrie dans l'espace"). **Aucun
 * tirage-puis-classification** : la direction de lumière et les piquets sont toujours construits
 * AVANT que la vérité terrain (point d'ombre, mur touché ou non) n'en soit déduite — jamais
 * l'inverse. Voir `core/ombreSoleil.types.ts` pour la simplification assumée (piquets verticaux
 * indépendants plutôt que les sommets d'un solide gabarit).
 */

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const COMPOSANTES_DIRECTION = [-3, -2, -1, 1, 2, 3];

/** Direction de lumière — toujours `dz<0` (la lumière descend), et `dx≠0, dy≠0, dx≠dy, dx≠-dy` pour
 * que les 4 candidats de `construireDirectionsCandidates` restent deux à deux distincts. */
function construireDirection(): Point3D {
  const dx = COMPOSANTES_DIRECTION[randomInt(0, COMPOSANTES_DIRECTION.length - 1)];
  const candidatsDy = COMPOSANTES_DIRECTION.filter((v) => v !== dx && v !== -dx);
  const dy = candidatsDy[randomInt(0, candidatsDy.length - 1)];
  const dz = -randomInt(3, 6);
  return { x: dx, y: dy, z: dz };
}

const PLAGE_BASE = 6;
const SEPARATION_MIN_BASES = 2;

function tirerBase(basesExistantes: Point3D[]): Point3D {
  for (let tentative = 0; tentative < 200; tentative++) {
    const candidat: Point3D = { x: randomInt(-PLAGE_BASE, PLAGE_BASE), y: randomInt(-PLAGE_BASE, PLAGE_BASE), z: 0 };
    if (basesExistantes.every((b) => distance3D(b, candidat) >= SEPARATION_MIN_BASES)) return candidat;
  }
  // Repli défensif — ne devrait jamais être atteint (large plage, peu de points à placer).
  return { x: randomInt(-PLAGE_BASE, PLAGE_BASE), y: randomInt(-PLAGE_BASE, PLAGE_BASE), z: 0 };
}

function tirerPiquet(id: string, basesExistantes: Point3D[]): Piquet {
  return { id, base: tirerBase(basesExistantes), hauteur: randomInt(2, 5) };
}

/** Points d'ombre candidats d'un piquet — un par direction candidate, y compris la vraie (jamais
 * stockés sur le contrat, recalculés à la demande depuis les 4 directions déjà fixées). Jamais
 * appelée avec un obstacle : les seuls consommateurs restants (variantes A et C) projettent toujours
 * sur le sol seul — voir `pointsCandidatsObstacle` pour l'équivalent par solide-obstacle. */
function pointsCandidats(piquet: Piquet, directionsCandidates: DirectionCandidate[]): { id: string; position: Point3D }[] {
  return directionsCandidates.map((dc) => ({ id: dc.id, position: ombrePiquet(piquet, dc.vecteur).position }));
}

const SEPARATION_MIN_CANDIDATS = 0.5;

/** Exige que les points d'une liste restent deux à deux à une distance minimale — évite qu'un
 * écran de sélection propose 2 candidats visuellement/numériquement confondus. */
function suffisammentDistincts(points: { position: Point3D }[]): boolean {
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      if (distance3D(points[i].position, points[j].position) < SEPARATION_MIN_CANDIDATS) return false;
    }
  }
  return true;
}

const MAX_TENTATIVES_INSTANCE = 500;

// --- Variante A — Ombre simple sur sol plat --------------------------------------------------------

function construireSimple(): ExerciceOmbreSoleilSimple {
  for (let tentative = 0; tentative < MAX_TENTATIVES_INSTANCE; tentative++) {
    const direction = construireDirection();
    const directionsCandidates = construireDirectionsCandidates(direction);
    const piquetExemple = tirerPiquet("E", []);
    const ombreExemple = ombrePiquet(piquetExemple, direction).position;

    const piquetBrut = tirerPiquet("A", [piquetExemple.base]);
    if (!suffisammentDistincts(pointsCandidats(piquetBrut, directionsCandidates))) continue;

    const { position, surObstacle } = ombrePiquet(piquetBrut, direction);
    const piquet: PiquetAResoudre = { piquet: piquetBrut, ombre: position, surObstacle };

    return { variante: "simple", direction, directionsCandidates, piquetExemple, ombreExemple, piquet };
  }
  throw new Error(`construireSimple : aucune instance valide trouvée après ${MAX_TENTATIVES_INSTANCE} tentatives`);
}

// --- Variante B — Ombre avec obstacle(s) --------------------------------------------------------
//
// Refonte (section 2 de l'extension) : un "bâton" isolé (même modèle qu'un piquet de la variante A,
// jamais un sommet d'un des solides-obstacles) projette son ombre, qui peut "casser" sur 1 à 3
// solides-obstacles VRAIS (caisse ou escalier) plutôt que sur un mur plat abstrait — décision
// explicite prise en conversation : UNE itération de boucle PAR SOLIDE-OBSTACLE (jamais par face ni
// par marche), la direction étant confirmée UNE SEULE FOIS avant la boucle (jamais reconfirmée par
// obstacle). L'escalier, testé comme un bloc ATOMIQUE via l'algorithme général `intersectionAvecSolide`
// (jamais itéré marche par marche côté élève), n'utilise cependant que ses faces LATÉRALES (risers/
// treads) pour la physique — ses 2 faces de profil (avant/arrière) sont des polygones en escalier
// CONCAVES, jamais réductibles à un simple rectangle axis-aligned (l'hypothèse d'`intersectionAvecFaceRectangle`) :
// `solideCollision` les exclut, le rendu visuel complet (`Solide3DSketch`) reste, lui, inchangé.

/** Solide de COLLISION d'un obstacle — pour l'escalier, exclut ses 2 faces de profil (toujours les 2
 * premières de `construireEscalierCaisses`, voir sa doc) : jamais utilisées pour la physique, le
 * rendu visuel complet les garde malgré tout (`ObstacleAResoudre.obstacle.solide` reste le solide
 * ENTIER). Une caisse n'a, elle, que des faces déjà rectangulaires — inchangée. */
function solideCollision(obstacle: ObstacleOmbreSoleil): Solide3D {
  if (obstacle.type !== "escalier") return obstacle.solide;
  return { ...obstacle.solide, faces: obstacle.solide.faces.slice(2) };
}

/** Points d'ombre candidats d'un obstacle donné — un par direction candidate, testée en isolation
 * contre CE seul solide (jamais les autres obstacles de la scène) — même principe que
 * `pointsCandidats`, généralisé au solide de collision plutôt qu'un piquet+sol. */
function pointsCandidatsObstacle(
  origine: Point3D,
  directionsCandidates: DirectionCandidate[],
  obstacle: ObstacleOmbreSoleil,
): { id: string; position: Point3D }[] {
  return directionsCandidates.map((dc) => ({ id: dc.id, position: ombreDepuis(origine, dc.vecteur, solideCollision(obstacle)).position }));
}

/** `n` fractions de `tSol` strictement croissantes (avec un léger jitter) — place les obstacles dans
 * l'ORDRE où le rayon les rencontrerait potentiellement, du plus proche du bâton au plus proche du
 * sol : nécessaire pour que `indexObstacleTouche` (le premier RÉELLEMENT touché) corresponde à la
 * réalité physique de la scène. */
function fractionsCroissantes(n: number): number[] {
  const fractions: number[] = [];
  for (let i = 0; i < n; i++) {
    const base = (i + 1) / (n + 1);
    const jitter = (Math.random() - 0.5) * ((1 / (n + 1)) * 0.5);
    fractions.push(base + jitter);
  }
  return fractions;
}

/** Caisse (parallélépipède rectangle) positionnée le long du rayon issu de `origine`, à la fraction
 * `fraction` de sa trajectoire vers le sol — `garanti` centre la caisse EXACTEMENT sur le rayon
 * (garantit qu'elle est réellement touchée, même principe que l'ancienne `construireObstacleAutourDe`
 * du mur plat, généralisée en vrai `Solide3D`) ; sinon un décalage horizontal aléatoire produit une
 * variété hit/miss NATURELLE, jamais un rejet basé sur l'issue. */
function construireCaisseObstacle(origine: Point3D, direction: Point3D, fraction: number, garanti: boolean): Solide3D {
  const tSol = -origine.z / direction.z;
  const pointRay = additionner3D(origine, multiplierScalaire3D(direction, fraction * tSol));
  const decalageX = garanti ? 0 : (Math.random() - 0.5) * 6;
  const demiLargeurX = 1 + Math.random();
  const demiLargeurY = 1 + Math.random();
  const hauteur = pointRay.z + 0.5 + Math.random();
  const cx = pointRay.x + decalageX;
  const cy = pointRay.y;
  return {
    id: "cube",
    label: "Caisse",
    sommets: {
      A: { x: cx - demiLargeurX, y: cy - demiLargeurY, z: 0 },
      B: { x: cx + demiLargeurX, y: cy - demiLargeurY, z: 0 },
      C: { x: cx + demiLargeurX, y: cy + demiLargeurY, z: 0 },
      D: { x: cx - demiLargeurX, y: cy + demiLargeurY, z: 0 },
      E: { x: cx - demiLargeurX, y: cy - demiLargeurY, z: hauteur },
      F: { x: cx + demiLargeurX, y: cy - demiLargeurY, z: hauteur },
      G: { x: cx + demiLargeurX, y: cy + demiLargeurY, z: hauteur },
      H: { x: cx - demiLargeurX, y: cy + demiLargeurY, z: hauteur },
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

/** Escalier positionné (translaté horizontalement) près du rayon, à la fraction `fraction` de sa
 * trajectoire — jamais un slot "garanti", voir la boucle de construction : toujours un décalage
 * naturel (hit/miss non forcé). */
function construireEscalierObstacle(origine: Point3D, direction: Point3D, fraction: number): Solide3D {
  const tSol = -origine.z / direction.z;
  const pointRay = additionner3D(origine, multiplierScalaire3D(direction, fraction * tSol));
  const nombreMarches = randomInt(NOMBRE_MARCHES_MIN, NOMBRE_MARCHES_MAX);
  const brut = construireEscalierCaisses(nombreMarches);
  const largeurTotale = nombreMarches * LARGEUR_MARCHE_ESCALIER;
  const decalageX = (Math.random() - 0.5) * 6;
  const dx = pointRay.x + decalageX - largeurTotale / 2;
  const dy = pointRay.y - PROFONDEUR_ESCALIER / 2;
  return translaterSolideHorizontalement(brut, dx, dy);
}

const PROBABILITE_ESCALIER = 0.4;

function construireObstacle(): ExerciceOmbreSoleilObstacle {
  for (let tentative = 0; tentative < MAX_TENTATIVES_INSTANCE; tentative++) {
    const direction = construireDirection();
    const directionsCandidates = construireDirectionsCandidates(direction);
    const piquetExemple = tirerPiquet("E", []);
    const ombreExemple = ombrePiquet(piquetExemple, direction).position;

    const baton = tirerPiquet("A", [piquetExemple.base]);
    const origine = sommetPiquet(baton);

    const nombreObstacles = randomInt(1, 3);
    const indexGaranti = randomInt(0, nombreObstacles - 1);
    const fractions = fractionsCroissantes(nombreObstacles);

    // Le slot "garanti" est toujours une caisse (guarantee géométrique simple) ; les autres slots
    // choisissent librement entre caisse et escalier, jamais forcés — la variété hit/miss y est
    // naturelle, jamais un rejet basé sur l'issue.
    const obstaclesBruts: ObstacleOmbreSoleil[] = fractions.map((fraction, i) => {
      const estGaranti = i === indexGaranti;
      const type: TypeObstacleOmbreSoleil = !estGaranti && Math.random() < PROBABILITE_ESCALIER ? "escalier" : "caisse";
      const solide = type === "escalier" ? construireEscalierObstacle(origine, direction, fraction) : construireCaisseObstacle(origine, direction, fraction, estGaranti);
      return { type, solide };
    });

    const obstacles: ObstacleAResoudre[] = obstaclesBruts.map((obstacle) => {
      const { position, surObstacle } = ombreDepuis(origine, direction, solideCollision(obstacle));
      return { obstacle, ombre: position, surObstacle };
    });

    if (!obstacles.some((o) => o.surObstacle)) continue; // garantie de construction, revérifiée
    if (!obstacles.every((o) => suffisammentDistincts(pointsCandidatsObstacle(origine, directionsCandidates, o.obstacle)))) continue;

    const indexReel = obstacles.findIndex((o) => o.surObstacle);
    const indexObstacleTouche = indexReel >= 0 ? indexReel : null;
    const ombre = indexObstacleTouche !== null ? obstacles[indexObstacleTouche].ombre : intersectionAvecSol(origine, direction);

    return { variante: "obstacle", direction, directionsCandidates, piquetExemple, ombreExemple, baton, obstacles, indexObstacleTouche, ombre };
  }
  throw new Error(`construireObstacle : aucune instance valide trouvée après ${MAX_TENTATIVES_INSTANCE} tentatives`);
}

// --- Variante C — Direction inconnue à déduire ---------------------------------------------------

const PLAGE_TRANSLATION_SOLIDE = 4;

/** Translate horizontalement (x,y) TOUS les sommets d'un gabarit fixe — jamais en z (le sol reste le
 * sol) — pour que sa position dans la scène varie d'un exercice à l'autre malgré des coordonnées
 * internes par ailleurs fixes (catalogue fermé, voir `core/geometrieEspace.types.ts`). */
function translaterSolideHorizontalement(solide: Solide3D, dx: number, dy: number): Solide3D {
  const sommets: Record<string, Point3D> = {};
  for (const [nom, p] of Object.entries(solide.sommets)) {
    sommets[nom] = { x: p.x + dx, y: p.y + dy, z: p.z };
  }
  return { ...solide, sommets };
}

/** Un sommet nommé du solide, réinterprété comme `Piquet` — `sommetPiquet({base,hauteur}) =
 * base+(0,0,hauteur)` retombe alors exactement sur `p`, aucune conversion à part n'est nécessaire. */
function piquetDepuisSommet(nom: string, p: Point3D): Piquet {
  return { id: nom, base: { x: p.x, y: p.y, z: 0 }, hauteur: p.z };
}

function construireDirectionInconnue(): ExerciceOmbreSoleilDirectionInconnue {
  for (let tentative = 0; tentative < MAX_TENTATIVES_INSTANCE; tentative++) {
    const direction = construireDirection();
    const directionsCandidates = construireDirectionsCandidates(direction);

    const nomGabarit = tirerNomGabarit(GABARITS_OMBRE_DIRECTION_INCONNUE);
    const dx = randomInt(-PLAGE_TRANSLATION_SOLIDE, PLAGE_TRANSLATION_SOLIDE);
    const dy = randomInt(-PLAGE_TRANSLATION_SOLIDE, PLAGE_TRANSLATION_SOLIDE);
    const solide = translaterSolideHorizontalement(GABARITS_SOLIDE3D[nomGabarit], dx, dy);

    const sommetsNonSol = Object.entries(solide.sommets).filter(([, p]) => p.z > 0);
    const indexConnu = randomInt(0, sommetsNonSol.length - 1);
    const [nomConnu, pointConnu] = sommetsNonSol[indexConnu];
    const piquetConnu = piquetDepuisSommet(nomConnu, pointConnu);
    const ombreConnue = ombrePiquet(piquetConnu, direction).position;

    const piquetsBruts = sommetsNonSol
      .filter((_, i) => i !== indexConnu)
      .map(([nom, p]) => piquetDepuisSommet(nom, p));

    if (!suffisammentDistincts(pointsCandidats(piquetConnu, directionsCandidates))) continue;
    if (!piquetsBruts.every((p) => suffisammentDistincts(pointsCandidats(p, directionsCandidates)))) continue;

    const piquets: PiquetAResoudre[] = piquetsBruts.map((p) => {
      const { position } = ombrePiquet(p, direction); // sol uniquement, jamais d'obstacle en variante C
      return { piquet: p, ombre: position, surObstacle: false };
    });

    return { variante: "directionInconnue", direction, directionsCandidates, solide, piquetConnu, ombreConnue, piquets };
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
