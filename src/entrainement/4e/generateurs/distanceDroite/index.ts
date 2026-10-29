/**
 * Couche A — "Distance point-droite et droite-droite (méthode de synthèse, sans formule)".
 * ⚠️ Exercice de SYNTHÈSE : réutilise directement `perpendiculaire` ("Relations entre droites",
 * `generateurs/relationsDroites/index.ts`) et `implicteDepuisPointVecteur`/`intersectionDeuxDroites`
 * (module frère partagé du groupe "droites", `generateurs/droite/geometrieDroite.ts`) — jamais une
 * seconde logique de construction géométrique. Couplage FORT assumé (même famille de risque que
 * gen35, "Exercice de synthèse" du chapitre Statistique) : toute évolution future de ces deux
 * sources devra être répercutée ici.
 *
 * Exactitude par construction : le vecteur directeur `vecteurD` de la droite de référence est
 * PRIMITIF (composantes entières premières entre elles — équation toujours réduite, audit chapitre 7,
 * point 34) ; `vecteurNormal = perpendiculaire(vecteurD)` a la même norme `n = √(n²)` (une rotation
 * préserve la longueur). La distance vaut `|k|·n` : entière pour un vecteur 3-4-5 ou une droite
 * verticale/horizontale, sinon irrationnelle (`2√5`, `3√2`…) — audit chapitre 7, point 30 : les
 * seuls triplets pythagoriciens ne donnaient que 8 distances possibles. La valeur exacte est
 * portée par `distanceCarree = k²·n²` (entier).
 *
 * Droites verticales/horizontales (environ 1 exercice sur 5) — entraînent les deux raccourcis du
 * cours (« distance de P à x = k : |x_P − k| », point 34).
 *
 * Nombres bornés (point 29) : les deux points de construction sont centrés autour d'un petit point
 * `r` proche de l'origine (jamais `q0` tiré puis décalé de `k·n` d'un seul côté), et le tirage est
 * recommencé tant qu'un coefficient constant dépasse `C_MAX`.
 */
import type {
  ExerciceDistanceDroite,
  ExerciceDistanceParalleles,
  ExerciceDistancePoint,
  VarianteDistanceDroite,
} from "../../core/distanceDroite.types";
import type { DroiteImplicite } from "../../core/droite.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import { implicteDepuisPointVecteur, intersectionDeuxDroites } from "../droite/geometrieDroite";
import { perpendiculaire } from "../relationsDroites";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSigne(): 1 | -1 {
  return Math.random() < 0.5 ? 1 : -1;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** Proportion de droites verticales/horizontales (raccourcis du cours). */
const PROBABILITE_DROITE_AXIALE = 0.2;
/** Plus grand |c| accepté dans une équation affichée (d, d₁, d₂, b) — point 29. */
const C_MAX = 30;
/** Plus grande |coordonnée| d'un point de construction (P, Q). */
const COORDONNEE_MAX = 10;

/** Vecteur directeur primitif — composantes dans [-4 ; 4], premières entre elles ; `(1;0)` ou
 * `(0;1)` pour une droite horizontale/verticale. */
function tirerVecteurD(): Composantes {
  if (Math.random() < PROBABILITE_DROITE_AXIALE) return Math.random() < 0.5 ? { x: 1, y: 0 } : { x: 0, y: 1 };
  for (;;) {
    const x = randomInt(1, 4);
    const y = randomInt(1, 4);
    if (pgcd(x, y) === 1) return { x: x * randomSigne(), y: y * randomSigne() };
  }
}

/** Premier coefficient non nul positif — `-5x-12y+14=0` s'affiche `5x+12y-14=0`. */
export function normaliserSigneDroite(d: DroiteImplicite): DroiteImplicite {
  const negatif = d.a < 0 || (d.a === 0 && d.b < 0);
  const oppose = (v: number) => (v === 0 ? 0 : -v);
  return negatif ? { a: oppose(d.a), b: oppose(d.b), c: oppose(d.c) } : d;
}

/** Décalage `k` le long de la normale — plus grand pour une droite axiale (`n = 1`), sinon la
 * distance ne vaudrait que 1, 2 ou 3. */
function tirerK(vecteurD: Composantes): number {
  const axiale = vecteurD.x === 0 || vecteurD.y === 0;
  return (axiale ? randomInt(2, 6) : randomInt(1, 3)) * randomSigne();
}

function normeCarree(v: Composantes): number {
  return v.x * v.x + v.y * v.y;
}

function ajouter(p: Point, v: Composantes, facteur: number): Point {
  return { x: p.x + facteur * v.x, y: p.y + facteur * v.y };
}

/** Les deux extrémités `q0` et `q0 + k·normal` encadrent un petit point `r` proche de l'origine. */
function pointsCentres(vecteurNormal: Composantes, k: number): { q0: Point; q1: Point } {
  const r = { x: randomInt(-3, 3), y: randomInt(-3, 3) };
  const avant = Math.round(k / 2);
  return { q0: ajouter(r, vecteurNormal, -avant), q1: ajouter(r, vecteurNormal, k - avant) };
}

function dansLesBornes(points: Point[], droites: DroiteImplicite[]): boolean {
  return points.every((p) => Math.abs(p.x) <= COORDONNEE_MAX && Math.abs(p.y) <= COORDONNEE_MAX) && droites.every((d) => Math.abs(d.c) <= C_MAX);
}

/**
 * Variante A — un point `point` et une droite `d`, jamais construits indépendamment : `d` passe
 * par `q0` avec la direction `vecteurD` ; `point = q0 + k·vecteurNormal` (`vecteurNormal`
 * perpendiculaire à `vecteurD`) est donc, PAR CONSTRUCTION, à distance exacte `|k|·n` de `d`, et
 * `q0` en est exactement le pied de la perpendiculaire — jamais un tirage-puis-vérification.
 */
function construirePoint(): ExerciceDistancePoint {
  for (;;) {
    const vecteurD = tirerVecteurD();
    const vecteurNormal = perpendiculaire(vecteurD);
    const k = tirerK(vecteurD);
    const { q0, q1: point } = pointsCentres(vecteurNormal, k);
    const d = normaliserSigneDroite(implicteDepuisPointVecteur(q0, vecteurD));
    const bAttendue = normaliserSigneDroite(implicteDepuisPointVecteur(point, vecteurNormal));
    if (!dansLesBornes([q0, point], [d, bAttendue])) continue;
    // b est toujours sécante à d (elle lui est perpendiculaire) : l'intersection existe toujours.
    const q = intersectionDeuxDroites(bAttendue, d)!;
    const distanceCarree = k * k * normeCarree(vecteurNormal);
    return {
      variante: "point",
      d,
      point,
      n: Math.sqrt(normeCarree(vecteurNormal)),
      vecteurNormal,
      bAttendue,
      q,
      distance: Math.sqrt(distanceCarree),
      distanceCarree,
    };
  }
}

/**
 * Variante B — `d1`/`d2` toujours PARALLÈLES (même vecteur directeur `vecteurD`, jamais sécantes) :
 * `d1` passe par `q0`, `d2` par `q1 = q0 + k·vecteurNormal` — la distance entre les deux vaut
 * toujours `|k|·n`, INDÉPENDAMMENT du point que l'élève choisira plus tard sur la droite désignée
 * comme source (propriété géométrique des droites parallèles : se déplacer le long de `vecteurD`
 * ne change jamais l'écart perpendiculaire entre les deux droites).
 */
function construireParalleles(): ExerciceDistanceParalleles {
  for (;;) {
    const vecteurD = tirerVecteurD();
    const vecteurNormal = perpendiculaire(vecteurD);
    const k = tirerK(vecteurD);
    const { q0, q1 } = pointsCentres(vecteurNormal, k);
    const d1 = normaliserSigneDroite(implicteDepuisPointVecteur(q0, vecteurD));
    const d2 = normaliserSigneDroite(implicteDepuisPointVecteur(q1, vecteurD));
    if (!dansLesBornes([q0, q1], [d1, d2])) continue;
    const droiteSource: "d1" | "d2" = Math.random() < 0.5 ? "d1" : "d2";
    const distanceCarree = k * k * normeCarree(vecteurNormal);
    return {
      variante: "paralleles",
      d1,
      d2,
      droiteSource,
      n: Math.sqrt(normeCarree(vecteurNormal)),
      vecteurNormal,
      distance: Math.sqrt(distanceCarree),
      distanceCarree,
    };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteDistanceDroite; label: string }[] = [
  { id: "point", label: "Distance d'un point à une droite" },
  { id: "paralleles", label: "Distance entre deux droites parallèles" },
];

export function construireAvecVarianteId(varianteId: VarianteDistanceDroite): ExerciceDistanceDroite {
  return varianteId === "point" ? construirePoint() : construireParalleles();
}

export function genererExerciceDistanceDroite(): ExerciceDistanceDroite {
  return construireAvecVarianteId(Math.random() < 0.5 ? "point" : "paralleles");
}
