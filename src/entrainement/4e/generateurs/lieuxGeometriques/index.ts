/**
 * Couche A — "Lieux géométriques : intersection" (position 54). REFONTE COMPLÈTE
 * (`promptgen54refontecomplete.md`) — voir `core/lieuxGeometriques.types.ts` pour le détail de la
 * nouvelle architecture à 3 écrans et de la convention d'énoncé (formulation verbale uniquement).
 * N'importe jamais rien de `src/moteur/`.
 *
 * **Construction "points cibles d'abord", jamais un tirage-puis-vérification** (même principe que
 * "Intersection entre deux droites") : pour chaque sous-cas à points EXACTS (1 ou 2), le(s)
 * point(s) d'intersection sont choisis en PREMIER (coordonnées entières), puis la droite est
 * construite pour passer exactement par eux — garantit des coordonnées propres sans jamais résoudre
 * une équation irrationnelle à la génération. Le sous-cas "0 point" tire une droite de pente simple
 * dont on CONTRÔLE qu'elle ne coupe pas la courbe (distance au centre nettement supérieure au rayon
 * pour le cercle, translation d'une tangente pour la parabole).
 *
 * **Pente non nulle et définie, toujours** (contrainte de génération explicite du prompt — exclut
 * les droites horizontales/verticales), et **nombres de taille raisonnable pour un calcul de 4e**
 * (audit chapitre 7, point 58 : centres jusqu'à (−34 ; 18), R = 39 auparavant) : chaque
 * construction impliquant une droite passe par `construireAvecDroiteValide`, qui rejette tout
 * résultat dégénéré ou hors bornes (`PENTE_MAX`, `ORDONNEE_ORIGINE_MAX`, `DENOMINATEUR_MAX`,
 * `COORDONNEE_POINT_MAX`) et retire.
 *
 * Paire cercle-cercle RETIRÉE (audit chapitre 7, point 57) : sa résolution passe par l'« axe
 * radical », méthode que le cours n'enseigne pas. Restent 2 paires × 3 sous-cas = 6 variantes,
 * tirées uniformément.
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
  coefficientsQuadratiqueDroiteConique,
  coniqueDepuisCercle,
  coniqueDepuisParabole,
  impliciteDepuisLieuDroite,
  intersectionDroiteConique,
  tangenteEnPoint,
} from "./geometrieConique";
import type { Conique } from "./geometrieConique";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSigne(): 1 | -1 {
  return Math.random() < 0.5 ? 1 : -1;
}

function choisir<T>(tableau: readonly T[]): T {
  return tableau[randomInt(0, tableau.length - 1)]!;
}

function melanger<T>(tableau: T[]): T[] {
  const copie = [...tableau];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

// ============================================================================
// Bornes "calcul de 4e" (audit chapitre 7, point 58)
// ============================================================================

const PENTE_MAX = 4;
const ORDONNEE_ORIGINE_MAX = 12;
/** Dénominateur maximal de la pente et de l'ordonnée à l'origine — jamais `112/5` ou `5/12`. */
const DENOMINATEUR_MAX = 6;
/** Coordonnée maximale (en valeur absolue) d'un point d'intersection. */
const COORDONNEE_POINT_MAX = 10;

/** Plus petit dénominateur `d ≤ 1000` tel que `valeur·d` soit entier (à 1e-9 près). */
function denominateur(valeur: number): number {
  for (let d = 1; d <= 1000; d++) {
    if (Math.abs(valeur * d - Math.round(valeur * d)) < 1e-9) return d;
  }
  return Infinity;
}

function droiteRaisonnable(droite: LieuDroite): boolean {
  return (
    Math.abs(droite.m) <= PENTE_MAX &&
    Math.abs(droite.p) <= ORDONNEE_ORIGINE_MAX &&
    denominateur(droite.m) <= DENOMINATEUR_MAX &&
    denominateur(droite.p) <= DENOMINATEUR_MAX
  );
}

function pointsRaisonnables(points: Point[]): boolean {
  return points.every((p) => Math.abs(p.x) <= COORDONNEE_POINT_MAX && Math.abs(p.y) <= COORDONNEE_POINT_MAX);
}

function tirerCentre(): Point {
  return { x: randomInt(-3, 3), y: randomInt(-3, 3) };
}

/** Droite implicite passant exactement par les 2 points donnés (jamais confondus). */
function droiteParDeuxPoints(p1: Point, p2: Point): DroiteImplicite {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const a = dy;
  const b = -dx;
  return { a, b, c: -(a * p1.x + b * p1.y) };
}

/** `y=mx+p` depuis la forme implicite — `null` si dégénérée (verticale `b=0`) ou si `m=0`
 * (horizontale) : ce générateur exclut les deux (pente non nulle et définie, contrainte de
 * génération explicite). Le résultat n'est PAS nécessairement un entier (une fraction reste
 * décrite sans jamais afficher d'équation — voir `formatLieuxGeometriques.ts`). */
function lieuDroiteDepuisImplicite(d: DroiteImplicite): LieuDroite | null {
  if (d.b === 0) return null;
  const m = -d.a / d.b;
  if (m === 0) return null;
  return { type: "droite", m: m + 0, p: -d.c / d.b + 0 };
}

const TENTATIVES_MAX_DROITE = 400;

/** Répète `construire` jusqu'à obtenir une droite valide (pente non nulle et définie, nombres dans
 * les bornes) et des points d'intersection dans les bornes — même principe de retirage borné que le
 * reste du projet pour une construction backward qui peut occasionnellement sortir du cadre.
 * `construire` peut renvoyer `null` pour signaler un tirage à refaire. */
function construireAvecDroiteValide<T>(construire: () => { droite: DroiteImplicite; reste: T; points: Point[] } | null): { lieuDroite: LieuDroite; reste: T; points: Point[] } {
  for (let tentative = 0; tentative < TENTATIVES_MAX_DROITE; tentative++) {
    const resultat = construire();
    if (resultat === null) continue;
    const lieuDroite = lieuDroiteDepuisImplicite(resultat.droite);
    if (lieuDroite !== null && droiteRaisonnable(lieuDroite) && pointsRaisonnables(resultat.points)) {
      return { lieuDroite, reste: resultat.reste, points: resultat.points };
    }
  }
  throw new Error("construireAvecDroiteValide : échec après le nombre maximal de tentatives — incohérence interne inattendue");
}

function quadratiqueSubstitution(coniqueCible: Conique, droite: LieuDroite): CoefficientsQuadratiqueT {
  return coefficientsQuadratiqueDroiteConique(coniqueCible, impliciteDepuisLieuDroite(droite));
}

/** Pentes "simples" du sous-cas 0 point — mêlent les pentes des sous-cas 1 et 2 points (±3/4, ±4/3
 * pour une tangente à un cercle de rayon 5, demi-entiers pour la parabole) pour que la pente seule
 * ne trahisse jamais le nombre de points d'intersection. */
const PENTES_SIMPLES = [1, 2, 3, 1 / 2, 3 / 2, 1 / 3, 2 / 3, 3 / 4, 4 / 3] as const;

// ============================================================================
// Cercle-droite
// ============================================================================

/** Tous les décalages ENTIERS `(dx ; dy)` tels que `dx²+dy² = rayon²` — les points à coordonnées
 * entières d'un cercle de centre entier (4 sur les axes, plus 8 pour un rayon multiple de 5). */
function decalagesEntiersSurCercle(rayon: number): { dx: number; dy: number }[] {
  const decalages: { dx: number; dy: number }[] = [];
  for (let dx = -rayon; dx <= rayon; dx++) {
    for (let dy = -rayon; dy <= rayon; dy++) {
      if (dx * dx + dy * dy === rayon * rayon) decalages.push({ dx, dy });
    }
  }
  return decalages;
}

/** Rayon 5 plus fréquent : c'est le seul (avec ses multiples, trop grands ici) qui porte des points
 * entiers HORS des axes, donc des droites de pente variée. */
const RAYONS_DEUX_POINTS = [2, 3, 4, 5, 5, 5] as const;

function construireCercleDroite2(): ExerciceLieuxGeometriques {
  const { lieuDroite, reste: cercle, points } = construireAvecDroiteValide(() => {
    const cercle: LieuCercle = { type: "cercle", centre: tirerCentre(), rayon: choisir(RAYONS_DEUX_POINTS) };
    const [o1, o2] = melanger(decalagesEntiersSurCercle(cercle.rayon)).slice(0, 2) as [{ dx: number; dy: number }, { dx: number; dy: number }];
    const p1 = { x: cercle.centre.x + o1.dx, y: cercle.centre.y + o1.dy };
    const p2 = { x: cercle.centre.x + o2.dx, y: cercle.centre.y + o2.dy };
    return { droite: droiteParDeuxPoints(p1, p2), reste: cercle, points: [p1, p2] };
  });
  return { paire: "cercleDroite", lieu1: cercle, lieu2: lieuDroite, nombrePoints: 2, points, quadratique: quadratiqueSubstitution(coniqueDepuisCercle(cercle), lieuDroite) };
}

/** Tangente en un point entier HORS des axes d'un cercle de rayon 5 (sur les axes, la tangente
 * serait horizontale ou verticale, exclues) — perpendiculaire au rayon `(dx ; dy)`. */
function construireCercleDroite1(): ExerciceLieuxGeometriques {
  const { lieuDroite, reste: cercle, points } = construireAvecDroiteValide(() => {
    const cercle: LieuCercle = { type: "cercle", centre: tirerCentre(), rayon: 5 };
    const { dx, dy } = choisir(decalagesEntiersSurCercle(5).filter((o) => o.dx !== 0 && o.dy !== 0));
    const point = { x: cercle.centre.x + dx, y: cercle.centre.y + dy };
    return { droite: { a: dx, b: dy, c: -(dx * point.x + dy * point.y) }, reste: cercle, points: [point] };
  });
  return { paire: "cercleDroite", lieu1: cercle, lieu2: lieuDroite, nombrePoints: 1, points, quadratique: quadratiqueSubstitution(coniqueDepuisCercle(cercle), lieuDroite) };
}

/** Distance du centre à la droite comprise entre `rayon + 1/2` et `rayon + 4` : jamais une
 * quasi-tangente (discriminant à peine négatif, indiscernable d'un calcul arrondi). */
function construireCercleDroite0(): ExerciceLieuxGeometriques {
  const { lieuDroite, reste: cercle } = construireAvecDroiteValide(() => {
    const cercle: LieuCercle = { type: "cercle", centre: tirerCentre(), rayon: randomInt(2, 5) };
    const m = choisir(PENTES_SIMPLES) * randomSigne();
    const p = randomInt(-ORDONNEE_ORIGINE_MAX, ORDONNEE_ORIGINE_MAX);
    const distance = Math.abs(m * cercle.centre.x - cercle.centre.y + p) / Math.sqrt(1 + m * m);
    if (distance < cercle.rayon + 0.5 || distance > cercle.rayon + 4) return null;
    return { droite: impliciteDepuisLieuDroite({ type: "droite", m, p }), reste: cercle, points: [] };
  });
  return { paire: "cercleDroite", lieu1: cercle, lieu2: lieuDroite, nombrePoints: 0, points: [], quadratique: quadratiqueSubstitution(coniqueDepuisCercle(cercle), lieuDroite) };
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

/** `h ∈ {1 ; 2}` (donc `p = ±2` ou `±4`) : au-delà, les points de paramètre entier s'éloignent
 * trop vite du sommet (coordonnées hors de `COORDONNEE_POINT_MAX`). */
function tirerParabole(): ParaboleParametree {
  const orientation: OrientationParabole = Math.random() < 0.5 ? "vertical" : "horizontal";
  const foyer: Point = { x: randomInt(-3, 3), y: randomInt(-3, 3) };
  const h = randomInt(1, 2);
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

/** Point de paramètre entier `m` sur la parabole — définition foyer-directrice : `x=Fx+2h·m`
 * (vertical), symétrique en horizontal. Deux paramètres entiers `m1 ≠ m2` donnent toujours une
 * corde de pente demi-entière `s·(m1+m2)/2` (vertical), et la tangente au paramètre `m0` a pour
 * pente `s·m0`. */
function pointSurParabole(parametree: ParaboleParametree, m: number): Point {
  const { foyer, h, s } = parametree;
  if (parametree.orientation === "vertical") {
    return { x: foyer.x + 2 * h * m, y: foyer.y - s * h + s * h * m * m };
  }
  return { x: foyer.x - s * h + s * h * m * m, y: foyer.y + 2 * h * m };
}

function construireDroiteParabole2(): ExerciceLieuxGeometriques {
  const { lieuDroite, reste: parametree, points } = construireAvecDroiteValide(() => {
    const parametree = tirerParabole();
    const m1 = randomInt(-3, 3);
    let m2 = randomInt(-3, 3);
    while (m2 === m1) m2 = randomInt(-3, 3);
    const p1 = pointSurParabole(parametree, m1);
    const p2 = pointSurParabole(parametree, m2);
    return { droite: droiteParDeuxPoints(p1, p2), reste: parametree, points: [p1, p2] };
  });
  const parabole = lieuParaboleDepuisParametree(parametree);
  return { paire: "droiteParabole", lieu1: lieuDroite, lieu2: parabole, nombrePoints: 2, points, quadratique: quadratiqueSubstitution(coniqueDepuisParabole(parabole), lieuDroite) };
}

function construireDroiteParabole1(): ExerciceLieuxGeometriques {
  const { lieuDroite, reste: parametree, points } = construireAvecDroiteValide(() => {
    const parametree = tirerParabole();
    const point = pointSurParabole(parametree, randomInt(-3, 3));
    return { droite: tangenteEnPoint(coniqueDepuisParabole(lieuParaboleDepuisParametree(parametree)), point), reste: parametree, points: [point] };
  });
  const parabole = lieuParaboleDepuisParametree(parametree);
  return { paire: "droiteParabole", lieu1: lieuDroite, lieu2: parabole, nombrePoints: 1, points, quadratique: quadratiqueSubstitution(coniqueDepuisParabole(parabole), lieuDroite) };
}

/** Translate une tangente (ordonnée à l'origine décalée) jusqu'à ce qu'elle ne coupe plus la
 * parabole — garanti du côté qui s'éloigne de la courbe par sa convexité, CONTRÔLÉ ici quand même
 * (`intersectionDroiteConique`), jamais supposé. */
function construireDroiteParabole0(): ExerciceLieuxGeometriques {
  const { lieuDroite, reste: parametree } = construireAvecDroiteValide(() => {
    const parametree = tirerParabole();
    const conique = coniqueDepuisParabole(lieuParaboleDepuisParametree(parametree));
    const tangente = lieuDroiteDepuisImplicite(tangenteEnPoint(conique, pointSurParabole(parametree, randomInt(-3, 3))));
    if (tangente === null) return null;
    for (const decalage of melanger([1, 2, 3, -1, -2, -3])) {
      const candidate: LieuDroite = { type: "droite", m: tangente.m, p: tangente.p + decalage };
      const implicite = impliciteDepuisLieuDroite(candidate);
      if (intersectionDroiteConique(conique, implicite).nombreSolutions === 0) return { droite: implicite, reste: parametree, points: [] };
    }
    return null;
  });
  const parabole = lieuParaboleDepuisParametree(parametree);
  return { paire: "droiteParabole", lieu1: lieuDroite, lieu2: parabole, nombrePoints: 0, points: [], quadratique: quadratiqueSubstitution(coniqueDepuisParabole(parabole), lieuDroite) };
}

// ============================================================================
// Catalogue + dispatch
// ============================================================================

export type VarianteLieuxGeometriquesId = `${PaireLieux}_${NombrePointsIntersection}`;

const LIBELLE_PAIRE: Record<PaireLieux, string> = {
  cercleDroite: "Cercle-droite",
  droiteParabole: "Droite-parabole",
};

const LIBELLE_SOUS_CAS: Record<NombrePointsIntersection, string> = {
  0: "aucune intersection",
  1: "1 point (tangente)",
  2: "2 points",
};

export const CATALOGUE_VARIANTES: { id: VarianteLieuxGeometriquesId; label: string }[] = (["cercleDroite", "droiteParabole"] as PaireLieux[]).flatMap((paire) =>
  ([0, 1, 2] as NombrePointsIntersection[]).map((nombrePoints) => ({
    id: `${paire}_${nombrePoints}` as VarianteLieuxGeometriquesId,
    label: `${LIBELLE_PAIRE[paire]} — ${LIBELLE_SOUS_CAS[nombrePoints]}`,
  })),
);

const CONSTRUCTEURS: Record<VarianteLieuxGeometriquesId, () => ExerciceLieuxGeometriques> = {
  cercleDroite_0: construireCercleDroite0,
  cercleDroite_1: construireCercleDroite1,
  cercleDroite_2: construireCercleDroite2,
  droiteParabole_0: construireDroiteParabole0,
  droiteParabole_1: construireDroiteParabole1,
  droiteParabole_2: construireDroiteParabole2,
};

export function construireAvecVarianteId(varianteId: VarianteLieuxGeometriquesId): ExerciceLieuxGeometriques {
  return CONSTRUCTEURS[varianteId]();
}

/** Tirage UNIFORME parmi les 6 combinaisons — garantit par construction que le sous-cas "tangente",
 * statistiquement rare si tiré au hasard, apparaît avec une fréquence raisonnable (contrainte
 * explicite du prompt). */
export const genererExerciceLieuxGeometriques: GenerateurExerciceLieuxGeometriques = () => {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id;
  return construireAvecVarianteId(varianteId);
};
