/**
 * Couche A — "Lieux géométriques : intersection" (position 54). REFONTE COMPLÈTE
 * (`promptgen54refontecomplete.md`) — voir `core/lieuxGeometriques.types.ts` pour le détail de la
 * nouvelle architecture à 3 écrans et de la convention d'énoncé (formulation verbale uniquement).
 * N'importe jamais rien de `src/moteur/`.
 *
 * **Construction "points cibles d'abord", jamais un tirage-puis-vérification** (INCHANGÉ depuis la
 * version précédente de ce générateur, même principe que "Intersection entre deux droites") : pour
 * chaque sous-cas à points EXACTS (1 ou 2), le(s) point(s) d'intersection sont choisis en PREMIER
 * (coordonnées entières), puis la droite/le second cercle est construit pour passer exactement par
 * eux — garantit des coordonnées propres sans jamais résoudre une équation irrationnelle à la
 * génération. Le sous-cas "0 point" utilise à la place un placement à distance EXACTE (`> rayon`)
 * ou, pour droite-parabole, une translation de la tangente hors du domaine convexe de la parabole.
 *
 * **Pente non nulle et définie, toujours** (contrainte de génération explicite du prompt — exclut
 * les droites horizontales/verticales) : chaque construction impliquant une droite (`lieuDroite...`)
 * est enveloppée d'une boucle de retirage qui rejette tout résultat dégénéré (`a===0`/`b===0` de la
 * forme implicite) — les 3 sous-cas cercle-cercle n'en ont pas besoin (aucune droite parmi leurs 2
 * lieux, l'axe radical n'est jamais montré comme un lieu).
 *
 * Les 3 grandes variantes se ramènent toutes à `intersectionDroiteConique`/`tangenteEnPoint`
 * (`geometrieConique.ts`, module frère) — cercle-cercle en passant par `axeRadicalDeuxCercles`.
 */
import type {
  CoefficientsQuadratiqueT,
  ExerciceLieuxGeometriques,
  GenerateurExerciceLieuxGeometriques,
  LieuCercle,
  LieuDroite,
  LieuParabole,
  NombrePointsIntersection,
  PaireLieux,
} from "../../core/lieuxGeometriques.types";
import type { DroiteImplicite } from "../../core/droite.types";
import type { OrientationParabole } from "../../core/equationParabole.types";
import type { Point } from "../../core/vecteur.types";
import {
  axeRadicalDeuxCercles,
  coefficientsQuadratiqueDroiteConique,
  coniqueDepuisCercle,
  coniqueDepuisParabole,
  impliciteDepuisLieuDroite,
  intersectionDroiteConique,
  tangenteEnPoint,
} from "./geometrieConique";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSigne(): 1 | -1 {
  return Math.random() < 0.5 ? 1 : -1;
}

function melanger<T>(tableau: T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

/** Directions entières dont la norme est elle-même entière (triplets pythagoriciens + axes) — sert
 * à la fois à choisir 2 points ENTIERS sur un cercle (offsets depuis le centre) et à placer une
 * droite à une distance EXACTE d'un point (translation le long de la direction normalisée). */
const DIRECTIONS_ENTIERES: { dx: number; dy: number; norme: number }[] = [
  { dx: 1, dy: 0, norme: 1 },
  { dx: 0, dy: 1, norme: 1 },
  { dx: 3, dy: 4, norme: 5 },
  { dx: 4, dy: 3, norme: 5 },
  { dx: 6, dy: 8, norme: 10 },
  { dx: 8, dy: 6, norme: 10 },
  { dx: 5, dy: 12, norme: 13 },
  { dx: 12, dy: 5, norme: 13 },
];

function tirerDirectionEntiere(): { dx: number; dy: number; norme: number } {
  const base = DIRECTIONS_ENTIERES[randomInt(0, DIRECTIONS_ENTIERES.length - 1)]!;
  const sx = randomSigne();
  const sy = randomSigne();
  return { dx: base.dx * sx, dy: base.dy * sy, norme: base.norme };
}

function tirerCentre(): Point {
  return { x: randomInt(-4, 4), y: randomInt(-4, 4) };
}

/** Droite implicite passant exactement par les 2 points donnés (jamais confondus). */
function droiteParDeuxPoints(p1: Point, p2: Point): DroiteImplicite {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const a = dy;
  const b = -dx;
  return { a, b, c: -(a * p1.x + b * p1.y) };
}

/** Droite à distance EXACTE `distance` de `centre`, orthogonale à `direction` (donc à cette
 * distance précise du côté `cote`) — `direction` doit être une des `DIRECTIONS_ENTIERES` (norme
 * entière), garantissant un résultat exact sans racine carrée. */
function ligneADistanceExacte(centre: Point, direction: { dx: number; dy: number; norme: number }, distance: number, cote: 1 | -1): DroiteImplicite {
  const { dx, dy, norme } = direction;
  return { a: dx, b: dy, c: -(dx * centre.x + dy * centre.y) - cote * norme * distance };
}

/** `y=mx+p` depuis la forme implicite — `null` si dégénérée (verticale `b=0`) ou si `m=0`
 * (horizontale) : ce générateur exclut les deux (pente non nulle et définie, contrainte de
 * génération explicite). Le résultat n'est PAS nécessairement un entier (une fraction reste
 * décrite sans jamais afficher d'équation — voir `formatLieuxGeometriques.ts`). */
function lieuDroiteDepuisImplicite(d: DroiteImplicite): LieuDroite | null {
  if (d.b === 0) return null;
  const m = -d.a / d.b;
  if (m === 0) return null;
  return { type: "droite", m, p: -d.c / d.b };
}

const TENTATIVES_MAX_DROITE = 80;

/** Répète `construire` jusqu'à obtenir une droite valide (pente non nulle et définie) — même
 * principe de retirage borné que le reste du projet pour une construction backward qui peut
 * occasionnellement dégénérer (ex. `construireCercleCercle2`). */
function construireAvecDroiteValide<T>(construire: () => { droite: DroiteImplicite; reste: T }): { lieuDroite: LieuDroite; reste: T } {
  for (let tentative = 0; tentative < TENTATIVES_MAX_DROITE; tentative++) {
    const { droite, reste } = construire();
    const lieuDroite = lieuDroiteDepuisImplicite(droite);
    if (lieuDroite !== null) return { lieuDroite, reste };
  }
  throw new Error("construireAvecDroiteValide : échec après le nombre maximal de tentatives — incohérence interne inattendue");
}

// ============================================================================
// Cercle-droite
// ============================================================================

function tirerCercleRiche(): { cercle: LieuCercle; offsets: { dx: number; dy: number }[] } {
  const direction = DIRECTIONS_ENTIERES[randomInt(2, DIRECTIONS_ENTIERES.length - 1)]!; // exclut les axes (0 point sur le cercle "riche")
  const centre = tirerCentre();
  const { dx, dy, norme } = direction;
  const offsets = [
    { dx, dy },
    { dx: dy, dy: dx },
    { dx: -dx, dy },
    { dx, dy: -dy },
    { dx: -dx, dy: -dy },
    { dx: -dy, dy: dx },
    { dx: dy, dy: -dx },
    { dx: -dy, dy: -dx },
    { dx: norme, dy: 0 },
    { dx: -norme, dy: 0 },
    { dx: 0, dy: norme },
    { dx: 0, dy: -norme },
  ];
  return { cercle: { type: "cercle", centre, rayon: norme }, offsets };
}

function quadratiqueSubstitution(coniqueCible: ReturnType<typeof coniqueDepuisCercle>, droite: DroiteImplicite): CoefficientsQuadratiqueT {
  return coefficientsQuadratiqueDroiteConique(coniqueCible, droite);
}

function construireCercleDroite2(): ExerciceLieuxGeometriques {
  const { cercle, offsets } = tirerCercleRiche();
  const { lieuDroite, reste: points } = construireAvecDroiteValide(() => {
    const [o1, o2] = melanger(offsets).slice(0, 2) as [{ dx: number; dy: number }, { dx: number; dy: number }];
    const p1 = { x: cercle.centre.x + o1.dx, y: cercle.centre.y + o1.dy };
    const p2 = { x: cercle.centre.x + o2.dx, y: cercle.centre.y + o2.dy };
    return { droite: droiteParDeuxPoints(p1, p2), reste: [p1, p2] as Point[] };
  });
  const droiteImplicite = impliciteDepuisLieuDroite(lieuDroite);
  const conique = coniqueDepuisCercle(cercle);
  return { paire: "cercleDroite", lieu1: cercle, lieu2: lieuDroite, nombrePoints: 2, points, quadratique: quadratiqueSubstitution(conique, droiteImplicite) };
}

function construireCercleDroite1(): ExerciceLieuxGeometriques {
  const { lieuDroite, reste: cercle } = construireAvecDroiteValide(() => {
    const centre = tirerCentre();
    const direction = tirerDirectionEntiere();
    const cercle: LieuCercle = { type: "cercle", centre, rayon: direction.norme };
    return { droite: ligneADistanceExacte(centre, direction, cercle.rayon, randomSigne()), reste: cercle };
  });
  const droiteImplicite = impliciteDepuisLieuDroite(lieuDroite);
  const conique = coniqueDepuisCercle(cercle);
  const resultat = intersectionDroiteConique(conique, droiteImplicite);
  return {
    paire: "cercleDroite",
    lieu1: cercle,
    lieu2: lieuDroite,
    nombrePoints: 1,
    points: resultat.points,
    quadratique: quadratiqueSubstitution(conique, droiteImplicite),
  };
}

function construireCercleDroite0(): ExerciceLieuxGeometriques {
  const { lieuDroite, reste: cercle } = construireAvecDroiteValide(() => {
    const centre = tirerCentre();
    const rayon = randomInt(2, 6);
    const cercle: LieuCercle = { type: "cercle", centre, rayon };
    const direction = tirerDirectionEntiere();
    return { droite: ligneADistanceExacte(centre, direction, rayon + randomInt(1, 4), randomSigne()), reste: cercle };
  });
  const droiteImplicite = impliciteDepuisLieuDroite(lieuDroite);
  const conique = coniqueDepuisCercle(cercle);
  return { paire: "cercleDroite", lieu1: cercle, lieu2: lieuDroite, nombrePoints: 0, points: [], quadratique: quadratiqueSubstitution(conique, droiteImplicite) };
}

// ============================================================================
// Cercle-cercle
// ============================================================================

function estCarreParfait(n: number): boolean {
  if (n < 0) return false;
  const racine = Math.round(Math.sqrt(n));
  return racine * racine === n;
}

function construireCercleCercle2(): ExerciceLieuxGeometriques {
  for (let tentative = 0; tentative < 50; tentative++) {
    const p1 = tirerCentre();
    const dx = randomInt(1, 3) * 2 * randomSigne();
    const dy = randomInt(1, 3) * 2 * randomSigne();
    const p2 = { x: p1.x + dx, y: p1.y + dy };
    const milieu = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
    const perp = { x: -dy, y: dx };

    const candidats: number[] = [];
    for (let t = -5; t <= 5; t++) {
      const centre = { x: milieu.x + t * perp.x, y: milieu.y + t * perp.y };
      const r2 = (centre.x - p1.x) ** 2 + (centre.y - p1.y) ** 2;
      if (r2 > 0 && estCarreParfait(r2)) candidats.push(t);
    }
    if (candidats.length < 2) continue;

    const [t1, t2] = melanger(candidats).slice(0, 2) as [number, number];
    const centre1 = { x: milieu.x + t1 * perp.x, y: milieu.y + t1 * perp.y };
    const centre2 = { x: milieu.x + t2 * perp.x, y: milieu.y + t2 * perp.y };
    const rayon1 = Math.round(Math.hypot(centre1.x - p1.x, centre1.y - p1.y));
    const rayon2 = Math.round(Math.hypot(centre2.x - p1.x, centre2.y - p1.y));
    const cercle1: LieuCercle = { type: "cercle", centre: centre1, rayon: rayon1 };
    const cercle2: LieuCercle = { type: "cercle", centre: centre2, rayon: rayon2 };
    const axeRadical = axeRadicalDeuxCercles(cercle1, cercle2);
    return {
      paire: "cercleCercle",
      lieu1: cercle1,
      lieu2: cercle2,
      nombrePoints: 2,
      points: [p1, p2],
      quadratique: quadratiqueSubstitution(coniqueDepuisCercle(cercle1), axeRadical),
    };
  }
  throw new Error("construireCercleCercle2 : échec de construction après 50 tentatives — incohérence interne inattendue");
}

function construireCercleCercle1(): ExerciceLieuxGeometriques {
  const t = tirerCentre();
  const direction = tirerDirectionEntiere();
  let m1 = randomInt(-3, 3);
  while (m1 === 0) m1 = randomInt(-3, 3);
  let m2 = randomInt(-3, 3);
  while (m2 === 0 || m2 === m1) m2 = randomInt(-3, 3);

  const centre1 = { x: t.x + m1 * direction.dx, y: t.y + m1 * direction.dy };
  const centre2 = { x: t.x + m2 * direction.dx, y: t.y + m2 * direction.dy };
  const cercle1: LieuCercle = { type: "cercle", centre: centre1, rayon: Math.abs(m1) * direction.norme };
  const cercle2: LieuCercle = { type: "cercle", centre: centre2, rayon: Math.abs(m2) * direction.norme };
  const axeRadical = axeRadicalDeuxCercles(cercle1, cercle2);
  return {
    paire: "cercleCercle",
    lieu1: cercle1,
    lieu2: cercle2,
    nombrePoints: 1,
    points: [t],
    quadratique: quadratiqueSubstitution(coniqueDepuisCercle(cercle1), axeRadical),
  };
}

function construireCercleCercle0(): ExerciceLieuxGeometriques {
  const centre1 = tirerCentre();
  const rayon1 = randomInt(2, 4);
  const rayon2 = randomInt(2, 4);
  const ecart = rayon1 + rayon2 + randomInt(2, 5);
  const centre2 = { x: centre1.x + ecart * randomSigne(), y: centre1.y };
  const cercle1: LieuCercle = { type: "cercle", centre: centre1, rayon: rayon1 };
  const cercle2: LieuCercle = { type: "cercle", centre: centre2, rayon: rayon2 };
  const axeRadical = axeRadicalDeuxCercles(cercle1, cercle2);
  return {
    paire: "cercleCercle",
    lieu1: cercle1,
    lieu2: cercle2,
    nombrePoints: 0,
    points: [],
    quadratique: quadratiqueSubstitution(coniqueDepuisCercle(cercle1), axeRadical),
  };
}

// ============================================================================
// Droite-parabole
// ============================================================================

interface ParaboleParametree {
  foyer: Point;
  directrice: number;
  orientation: OrientationParabole;
  h: number;
  s: 1 | -1;
}

function tirerParabole(): ParaboleParametree {
  const orientation: OrientationParabole = Math.random() < 0.5 ? "vertical" : "horizontal";
  const foyer: Point = { x: randomInt(-3, 3), y: randomInt(-3, 3) };
  const h = randomInt(1, 3);
  const s = randomSigne();
  const directrice = orientation === "vertical" ? foyer.y - s * 2 * h : foyer.x - s * 2 * h;
  return { foyer, directrice, orientation, h, s };
}

/** `p` signé — MÊME convention que `ExerciceEquationParabole.p` (`core/equationParabole.types.ts`) :
 * `foyerAxis - directrice`, qui vaut exactement `s·2h` par construction (voir `tirerParabole`). */
function lieuParaboleDepuisParametree({ foyer, directrice, orientation }: ParaboleParametree): LieuParabole {
  const p = orientation === "vertical" ? foyer.y - directrice : foyer.x - directrice;
  return { type: "parabole", foyer, orientation, directrice, p };
}

function coniqueDeParametree(parametree: ParaboleParametree): ReturnType<typeof coniqueDepuisParabole> {
  return coniqueDepuisParabole(lieuParaboleDepuisParametree(parametree));
}

/** Point de paramètre entier `m` sur la parabole — voir en-tête de fichier / CLAUDE.md pour la
 * dérivation (définition foyer-directrice, `x=Fx+2h·m` (vertical) et symétrique en horizontal). */
function pointSurParabole(parametree: ParaboleParametree, m: number): Point {
  const { foyer, h, s } = parametree;
  if (parametree.orientation === "vertical") {
    return { x: foyer.x + 2 * h * m, y: foyer.y - s * h + s * h * m * m };
  }
  return { x: foyer.x - s * h + s * h * m * m, y: foyer.y + 2 * h * m };
}

function construireDroiteParabole2(): ExerciceLieuxGeometriques {
  const parametree = tirerParabole();
  const parabole = lieuParaboleDepuisParametree(parametree);
  const conique = coniqueDeParametree(parametree);
  const { lieuDroite, reste: points } = construireAvecDroiteValide(() => {
    // Même parité pour m1/m2 (voir en-tête de fichier) — garantit une pente exacte demi-entière
    // par construction (`s·(m1+m2)/2`), jamais un retirage aveugle qui échouerait le plus souvent.
    let m1 = randomInt(-3, 3);
    let m2 = randomInt(-3, 3);
    while (m2 === m1 || (m2 - m1) % 2 !== 0) m2 = randomInt(-3, 3);
    const p1 = pointSurParabole(parametree, m1);
    const p2 = pointSurParabole(parametree, m2);
    return { droite: droiteParDeuxPoints(p1, p2), reste: [p1, p2] as Point[] };
  });
  return {
    paire: "droiteParabole",
    lieu1: lieuDroite,
    lieu2: parabole,
    nombrePoints: 2,
    points,
    quadratique: quadratiqueSubstitution(conique, impliciteDepuisLieuDroite(lieuDroite)),
  };
}

function construireDroiteParabole1(): ExerciceLieuxGeometriques {
  const parametree = tirerParabole();
  const parabole = lieuParaboleDepuisParametree(parametree);
  const conique = coniqueDeParametree(parametree);
  const { lieuDroite, reste: p0 } = construireAvecDroiteValide(() => {
    const m0 = randomInt(-2, 2);
    const point = pointSurParabole(parametree, m0);
    return { droite: tangenteEnPoint(conique, point), reste: point };
  });
  return {
    paire: "droiteParabole",
    lieu1: lieuDroite,
    lieu2: parabole,
    nombrePoints: 1,
    points: [p0],
    quadratique: quadratiqueSubstitution(conique, impliciteDepuisLieuDroite(lieuDroite)),
  };
}

/** Translate la tangente en `p0` jusqu'à ce qu'elle ne coupe plus la parabole — garanti par la
 * convexité de la parabole : le côté qui s'éloigne de la courbe ne peut jamais réintroduire
 * d'intersection (voir CLAUDE.md pour la justification complète). */
function construireDroiteParabole0(): ExerciceLieuxGeometriques {
  const parametree = tirerParabole();
  const parabole = lieuParaboleDepuisParametree(parametree);
  const conique = coniqueDeParametree(parametree);
  const { lieuDroite } = construireAvecDroiteValide(() => {
    const m0 = randomInt(-2, 2);
    const p0 = pointSurParabole(parametree, m0);
    const tangente = tangenteEnPoint(conique, p0);
    for (const k of melanger([1, 2, 3, 4, -1, -2, -3, -4])) {
      const candidate: DroiteImplicite = { ...tangente, c: tangente.c + k };
      if (intersectionDroiteConique(conique, candidate).nombreSolutions === 0) {
        return { droite: candidate, reste: null };
      }
    }
    throw new Error("construireDroiteParabole0 : aucune translation de la tangente n'a donné 0 intersection — incohérence interne inattendue");
  });
  return {
    paire: "droiteParabole",
    lieu1: lieuDroite,
    lieu2: parabole,
    nombrePoints: 0,
    points: [],
    quadratique: quadratiqueSubstitution(conique, impliciteDepuisLieuDroite(lieuDroite)),
  };
}

// ============================================================================
// Catalogue + dispatch
// ============================================================================

export type VarianteLieuxGeometriquesId = `${PaireLieux}_${NombrePointsIntersection}`;

const LIBELLE_PAIRE: Record<PaireLieux, string> = {
  cercleDroite: "Cercle-droite",
  cercleCercle: "Cercle-cercle",
  droiteParabole: "Droite-parabole",
};

const LIBELLE_SOUS_CAS: Record<NombrePointsIntersection, string> = {
  0: "aucune intersection",
  1: "1 point (tangente)",
  2: "2 points",
};

export const CATALOGUE_VARIANTES: { id: VarianteLieuxGeometriquesId; label: string }[] = (
  ["cercleDroite", "cercleCercle", "droiteParabole"] as PaireLieux[]
).flatMap((paire) =>
  ([0, 1, 2] as NombrePointsIntersection[]).map((nombrePoints) => ({
    id: `${paire}_${nombrePoints}` as VarianteLieuxGeometriquesId,
    label: `${LIBELLE_PAIRE[paire]} — ${LIBELLE_SOUS_CAS[nombrePoints]}`,
  })),
);

const CONSTRUCTEURS: Record<VarianteLieuxGeometriquesId, () => ExerciceLieuxGeometriques> = {
  cercleDroite_0: construireCercleDroite0,
  cercleDroite_1: construireCercleDroite1,
  cercleDroite_2: construireCercleDroite2,
  cercleCercle_0: construireCercleCercle0,
  cercleCercle_1: construireCercleCercle1,
  cercleCercle_2: construireCercleCercle2,
  droiteParabole_0: construireDroiteParabole0,
  droiteParabole_1: construireDroiteParabole1,
  droiteParabole_2: construireDroiteParabole2,
};

export function construireAvecVarianteId(varianteId: VarianteLieuxGeometriquesId): ExerciceLieuxGeometriques {
  return CONSTRUCTEURS[varianteId]();
}

/** Tirage UNIFORME parmi les 9 combinaisons — garantit par construction que le sous-cas "tangente",
 * statistiquement rare si tiré au hasard, apparaît avec une fréquence raisonnable (contrainte
 * explicite du prompt). */
export const genererExerciceLieuxGeometriques: GenerateurExerciceLieuxGeometriques = () => {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id;
  return construireAvecVarianteId(varianteId);
};
