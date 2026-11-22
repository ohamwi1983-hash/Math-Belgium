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
/* ---------------------------------------------------------------------------------------------
 * Tirage « pente d'abord » (audit 4e ch. 7, G7 et lot D) : la pente de la droite est tirée dans UNE
 * même liste pour les trois verdicts (0, 1 ou 2 points), AVANT la construction — elle ne trahit plus
 * la tangence (avant : ±3/4 ou ±4/3 dans 100 % des cas tangents, triplet 3-4-5 obligatoire). Le
 * point de contact reste à coordonnées entières (cercle) ou rationnelles (parabole) : le rayon peut
 * être irrationnel (√2, √5, √10, 2√2, 2√5, affichés en valeur exacte), r² restant entier.
 * ------------------------------------------------------------------------------------------- */

/** Pentes de la paire cercle-droite (a/b irréductible ; a² + b² ∈ {2, 5, 10, 25}). */
const PENTES_CERCLE = [1, -1, 2, -2, 1 / 2, -1 / 2, 3, -3, 1 / 3, -1 / 3, 3 / 4, -3 / 4, 4 / 3, -4 / 3] as const;
/** Rayons au carré (entiers ; rayon r = √r²). */
const RAYONS_CARRES = [2, 5, 8, 10, 20, 25] as const;
/** Pentes de la paire droite-parabole (tangente en un point rationnel pour les deux orientations). */
const PENTES_PARABOLE = [1, -1, 2, -2, 1 / 2, -1 / 2] as const;

/** m = a/b (b > 0, irréductible). */
function fractionDe(m: number): { a: number; b: number } {
  for (let b = 1; b <= 12; b++) {
    const a = m * b;
    if (Math.abs(a - Math.round(a)) < 1e-9) return { a: Math.round(a), b };
  }
  throw new Error("fractionDe : pente non rationnelle");
}

/** Tous les décalages ENTIERS `(dx ; dy)` tels que `dx² + dy² = r2`. */
function decalagesEntiersRayonCarre(r2: number): { dx: number; dy: number }[] {
  const r = Math.floor(Math.sqrt(r2));
  const decalages: { dx: number; dy: number }[] = [];
  for (let dx = -r; dx <= r; dx++) {
    for (let dy = -r; dy <= r; dy++) {
      if (dx * dx + dy * dy === r2) decalages.push({ dx, dy });
    }
  }
  return decalages;
}

function droitePenteParPoint(m: number, point: Point): DroiteImplicite {
  // y = m x + (y_P − m x_P)  ⟺  m x − y + (y_P − m x_P) = 0
  return { a: m, b: -1, c: point.y - m * point.x };
}

function cercleDe(centre: Point, r2: number): LieuCercle {
  return { type: "cercle", centre, rayon: Math.sqrt(r2) };
}

/** Pente tirée AVANT le verdict (indépendance pente / verdict, mesurée sur 15 000 tirages). */
function construireCercleDroite(nombrePoints: NombrePointsIntersection, m: number = choisir(PENTES_CERCLE)): ExerciceLieuxGeometriques {
  const { a, b } = fractionDe(m);
  const N = a * a + b * b;
  const { lieuDroite, reste: cercle, points } = construireAvecDroiteValide(() => {
    const centre = tirerCentre();
    if (nombrePoints === 1) {
      // r² = k²(a² + b²) : point de contact C ± k·(a ; −b), à coordonnées entières.
      const ks = [1, 2, 3].filter((k) => (RAYONS_CARRES as readonly number[]).includes(k * k * N));
      const k = choisir(ks) * randomSigne();
      const point = { x: centre.x + k * a, y: centre.y - k * b };
      return { droite: droitePenteParPoint(m, point), reste: cercleDe(centre, k * k * N), points: [point] };
    }
    if (nombrePoints === 2) {
      for (const r2 of melanger([...RAYONS_CARRES])) {
        const decalages = decalagesEntiersRayonCarre(r2);
        const paires: [{ dx: number; dy: number }, { dx: number; dy: number }][] = [];
        for (const o1 of decalages) for (const o2 of decalages) if (o2.dx > o1.dx && Math.abs((o2.dy - o1.dy) / (o2.dx - o1.dx) - m) < 1e-9) paires.push([o1, o2]);
        if (paires.length === 0) continue;
        const [o1, o2] = choisir(paires);
        const p1 = { x: centre.x + o1.dx, y: centre.y + o1.dy };
        const p2 = { x: centre.x + o2.dx, y: centre.y + o2.dy };
        return { droite: droitePenteParPoint(m, p1), reste: cercleDe(centre, r2), points: [p1, p2] };
      }
      return null;
    }
    const r2 = choisir(RAYONS_CARRES);
    const p = randomInt(-ORDONNEE_ORIGINE_MAX, ORDONNEE_ORIGINE_MAX);
    const r = Math.sqrt(r2);
    const distance = Math.abs(m * centre.x - centre.y + p) / Math.sqrt(1 + m * m);
    if (distance < r + 0.5 || distance > r + 3) return null;
    return { droite: impliciteDepuisLieuDroite({ type: "droite", m, p }), reste: cercleDe(centre, r2), points: [] };
  });
  return { paire: "cercleDroite", lieu1: cercle, lieu2: lieuDroite, nombrePoints, points, quadratique: quadratiqueSubstitution(coniqueDepuisCercle(cercle), lieuDroite) };
}

function construireCercleDroite2(): ExerciceLieuxGeometriques {
  return construireCercleDroite(2);
}

function construireCercleDroite1(): ExerciceLieuxGeometriques {
  return construireCercleDroite(1);
}

function construireCercleDroite0(): ExerciceLieuxGeometriques {
  return construireCercleDroite(0);
}

/* ---------------------------------------------------------------------------------------------
 * Paire droite-parabole — paramétrage par t (voir `pointSurParabole`) : tangente en t de pente s·t
 * (axe vertical) ou 1/(s·t) (axe horizontal) ; corde (t₁, t₂) de pente s(t₁ + t₂)/2 ou 2/(s(t₁ + t₂)).
 * ------------------------------------------------------------------------------------------- */

interface ParaboleParametree {
  foyer: Point;
  directrice: number;
  orientation: OrientationParabole;
  h: number;
  s: 1 | -1;
}

function tirerParabole(orientation: OrientationParabole = Math.random() < 0.5 ? "vertical" : "horizontal", h: number = randomInt(1, 2)): ParaboleParametree {
  const foyer: Point = { x: randomInt(-3, 3), y: randomInt(-3, 3) };
  const s = randomSigne();
  const directrice = orientation === "vertical" ? foyer.y - s * 2 * h : foyer.x - s * 2 * h;
  return { foyer, directrice, orientation, h, s };
}

function lieuParaboleDepuisParametree({ foyer, directrice, orientation }: ParaboleParametree): LieuParabole {
  const p = orientation === "vertical" ? foyer.y - directrice : foyer.x - directrice;
  return { type: "parabole", foyer, orientation, directrice, p };
}

function pointSurParabole(parametree: ParaboleParametree, t: number): Point {
  const { foyer, h, s } = parametree;
  if (parametree.orientation === "vertical") {
    return { x: foyer.x + 2 * h * t, y: foyer.y - s * h + s * h * t * t };
  }
  return { x: foyer.x - s * h + s * h * t * t, y: foyer.y + 2 * h * t };
}

/** Paramètre du point de contact de la tangente de pente m. */
function parametreTangente(parametree: ParaboleParametree, m: number): number {
  return parametree.orientation === "vertical" ? parametree.s * m : 1 / (parametree.s * m);
}

/** t₁ + t₂ d'une corde de pente m. */
function sommeParametresCorde(parametree: ParaboleParametree, m: number): number {
  return parametree.orientation === "vertical" ? 2 * parametree.s * m : 2 / (parametree.s * m);
}

function construireDroiteParabole(nombrePoints: NombrePointsIntersection, m: number = choisir(PENTES_PARABOLE)): ExerciceLieuxGeometriques {
  const { lieuDroite, reste: parametree, points } = construireAvecDroiteValide(() => {
    const orientation: OrientationParabole = Math.random() < 0.5 ? "vertical" : "horizontal";
    const tTangente = orientation === "vertical" ? m : 1 / m;
    // Point de contact demi-entier (t = ±1/2) : h = 2, coordonnées au plus au demi.
    const parametree = tirerParabole(orientation, Number.isInteger(tTangente) ? randomInt(1, 2) : 2);
    if (nombrePoints === 2) {
      const somme = sommeParametresCorde(parametree, m);
      const t1 = randomInt(-3, 3);
      const t2 = somme - t1;
      if (Math.abs(t2 - t1) < 1e-9 || Math.abs(t2) > 4) return null;
      const p1 = pointSurParabole(parametree, t1);
      const p2 = pointSurParabole(parametree, t2);
      return { droite: droitePenteParPoint(m, p1), reste: parametree, points: [p1, p2] };
    }
    const point = pointSurParabole(parametree, parametreTangente(parametree, m));
    const tangente = droitePenteParPoint(m, point);
    if (nombrePoints === 1) return { droite: tangente, reste: parametree, points: [point] };
    const conique = coniqueDepuisParabole(lieuParaboleDepuisParametree(parametree));
    for (const decalage of melanger([1, 2, 3, -1, -2, -3])) {
      const implicite = { ...tangente, c: tangente.c + decalage };
      if (intersectionDroiteConique(conique, implicite).nombreSolutions === 0) return { droite: implicite, reste: parametree, points: [] };
    }
    return null;
  });
  const parabole = lieuParaboleDepuisParametree(parametree);
  return { paire: "droiteParabole", lieu1: lieuDroite, lieu2: parabole, nombrePoints, points, quadratique: quadratiqueSubstitution(coniqueDepuisParabole(parabole), lieuDroite) };
}

function construireDroiteParabole2(): ExerciceLieuxGeometriques {
  return construireDroiteParabole(2);
}

function construireDroiteParabole1(): ExerciceLieuxGeometriques {
  return construireDroiteParabole(1);
}

function construireDroiteParabole0(): ExerciceLieuxGeometriques {
  return construireDroiteParabole(0);
}

/**
 * Variante « droite parallèle à l'axe de la parabole » (audit 4e ch. 7, G13 ; ajoutée EN FIN de
 * catalogue) : parabole d'axe horizontal et droite horizontale y = k, ou parabole d'axe vertical et
 * droite verticale x = k — les deux à parts égales (orientation tirée d'abord). La substitution donne
 * une équation du PREMIER degré : un seul point commun, qui n'est pas une tangence (piège du cours,
 * § 10). Point à coordonnées entières : (k − sommet)² divisible par 2p.
 */
function construireDroiteParaboleAxe(): ExerciceLieuxGeometriques {
  const orientation: OrientationParabole = Math.random() < 0.5 ? "horizontal" : "vertical";
  for (let essai = 0; essai < 400; essai++) {
    const parametree = tirerParabole(orientation);
    const parabole = lieuParaboleDepuisParametree(parametree);
    const vertical = orientation === "vertical";
    // u : coordonnée fixée par la droite (y pour l'axe horizontal, x pour l'axe vertical).
    const uS = vertical ? parabole.foyer.x : parabole.foyer.y;
    const vS = vertical ? parabole.foyer.y - parabole.p / 2 : parabole.foyer.x - parabole.p / 2;
    const ecarts = [-4, -2, 2, 4].filter((j) => Number.isInteger((j * j) / (2 * parabole.p)));
    if (ecarts.length === 0) continue;
    const j = choisir(ecarts);
    const k = uS + j;
    const v = vS + (j * j) / (2 * parabole.p);
    const point = vertical ? { x: k, y: v } : { x: v, y: k };
    if (!pointsRaisonnables([point]) || Math.abs(k) > ORDONNEE_ORIGINE_MAX) continue;
    const lieuDroite: LieuDroite = vertical ? { type: "droite", m: 0, p: 0, abscisse: k } : { type: "droite", m: 0, p: k };
    return { paire: "droiteParabole", lieu1: lieuDroite, lieu2: parabole, nombrePoints: 1, points: [point], quadratique: quadratiqueSubstitution(coniqueDepuisParabole(parabole), lieuDroite) };
  }
  throw new Error("construireDroiteParaboleAxe : échec inattendu");
}

/** Pente tirée dans la liste commune — exportée pour les mesures (indépendance pente / verdict). */
export { construireCercleDroite, construireDroiteParabole };

export type VarianteLieuxGeometriquesId = `${PaireLieux}_${NombrePointsIntersection}` | "droiteParabole_axe";

const LIBELLE_PAIRE: Record<PaireLieux, string> = {
  cercleDroite: "Cercle-droite",
  droiteParabole: "Droite-parabole",
};

const LIBELLE_SOUS_CAS: Record<NombrePointsIntersection, string> = {
  0: "aucune intersection",
  1: "1 point (tangente)",
  2: "2 points",
};

export const CATALOGUE_VARIANTES: { id: VarianteLieuxGeometriquesId; label: string }[] = [
  ...(["cercleDroite", "droiteParabole"] as PaireLieux[]).flatMap((paire) =>
    ([0, 1, 2] as NombrePointsIntersection[]).map((nombrePoints) => ({
      id: `${paire}_${nombrePoints}` as VarianteLieuxGeometriquesId,
      label: `${LIBELLE_PAIRE[paire]} — ${LIBELLE_SOUS_CAS[nombrePoints]}`,
    })),
  ),
  // Ajoutée EN FIN (audit 4e ch. 7, G13) : les indices 0–5 des `?code=` déjà imprimés ne bougent pas.
  { id: "droiteParabole_axe", label: "Droite-parabole — droite parallèle à l'axe (1 point, sans tangence)" },
];

const CONSTRUCTEURS: Record<VarianteLieuxGeometriquesId, () => ExerciceLieuxGeometriques> = {
  cercleDroite_0: construireCercleDroite0,
  cercleDroite_1: construireCercleDroite1,
  cercleDroite_2: construireCercleDroite2,
  droiteParabole_0: construireDroiteParabole0,
  droiteParabole_1: construireDroiteParabole1,
  droiteParabole_2: construireDroiteParabole2,
  droiteParabole_axe: construireDroiteParaboleAxe,
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
