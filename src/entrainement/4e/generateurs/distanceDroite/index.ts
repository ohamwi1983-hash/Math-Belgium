/**
 * Couche A — "Distance point-droite et droite-droite (méthode de synthèse, sans formule)".
 * ⚠️ Exercice de SYNTHÈSE : réutilise directement `perpendiculaire` ("Relations entre droites",
 * `generateurs/relationsDroites/index.ts`) et `implicteDepuisPointVecteur`/`intersectionDeuxDroites`
 * (module frère partagé du groupe "droites", `generateurs/droite/geometrieDroite.ts`) — jamais une
 * seconde logique de construction géométrique. Couplage FORT assumé (même famille de risque que
 * gen35, "Exercice de synthèse" du chapitre Statistique) : toute évolution future de ces deux
 * sources devra être répercutée ici.
 *
 * Exactitude par construction — triplet pythagoricien (même principe que "Norme d'un vecteur et
 * distance entre 2 points") : le vecteur directeur `vecteurD` de la droite de référence est choisi
 * comme un triplet pythagoricien clean (norme entière exacte `n`) ; `vecteurNormal =
 * perpendiculaire(vecteurD)` a alors AUTOMATIQUEMENT la même norme `n` (une rotation préserve la
 * longueur) — aucune contrainte supplémentaire n'est donc nécessaire pour garantir que `b`
 * (perpendiculaire à `d`) ait, elle aussi, un vecteur directeur de norme entière exacte.
 */
import type {
  ExerciceDistanceDroite,
  ExerciceDistanceParalleles,
  ExerciceDistancePoint,
  VarianteDistanceDroite,
} from "../../core/distanceDroite.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import { implicteDepuisPointVecteur, intersectionDeuxDroites } from "../droite/geometrieDroite";
import { perpendiculaire } from "../relationsDroites";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Triplets pythagoriciens "propres" (3-4-5 et ses variantes de signe/ordre) — bornés à une
 * magnitude raisonnable pour rester lisible sur un graphe/dans un énoncé, même principe que "Norme
 * d'un vecteur et distance entre 2 points". */
const TRIPLETS_PYTHAGORICIENS: readonly [number, number, number][] = [
  [3, 4, 5],
  [4, 3, 5],
  [6, 8, 10],
  [8, 6, 10],
  [5, 12, 13],
  [12, 5, 13],
];

function tirerVecteurD(): { vecteur: Composantes; n: number } {
  const [a, b, n] = TRIPLETS_PYTHAGORICIENS[randomInt(0, TRIPLETS_PYTHAGORICIENS.length - 1)]!;
  const signeX = Math.random() < 0.5 ? -1 : 1;
  const signeY = Math.random() < 0.5 ? -1 : 1;
  return { vecteur: { x: a * signeX, y: b * signeY }, n };
}

function tirerPoint(): Point {
  return { x: randomInt(-6, 6), y: randomInt(-6, 6) };
}

/** Magnitude bornée à `[1,3]` — un `k` plus grand éloignerait `point`/la droite parallèle au point
 * de rendre le graphe/l'énoncé difficile à lire, sans bénéfice pédagogique supplémentaire. */
function tirerK(): number {
  return randomInt(1, 3) * (Math.random() < 0.5 ? -1 : 1);
}

/**
 * Variante A — un point `point` et une droite `d`, jamais construits indépendamment : `d` passe
 * par `q0` avec la direction `vecteurD` ; `point = q0 + k·vecteurNormal` (`vecteurNormal`
 * perpendiculaire à `vecteurD`) est donc, PAR CONSTRUCTION, à distance exacte `|k|·n` de `d`, et
 * `q0` en est exactement le pied de la perpendiculaire — jamais un tirage-puis-vérification.
 */
function construirePoint(): ExerciceDistancePoint {
  const { vecteur: vecteurD, n } = tirerVecteurD();
  const vecteurNormal = perpendiculaire(vecteurD);
  const q0 = tirerPoint();
  const d = implicteDepuisPointVecteur(q0, vecteurD);
  const k = tirerK();
  const point: Point = { x: q0.x + k * vecteurNormal.x, y: q0.y + k * vecteurNormal.y };
  const bAttendue = implicteDepuisPointVecteur(point, vecteurNormal);
  // b est toujours sécante à d (elle lui est perpendiculaire — deux droites perpendiculaires ne
  // sont jamais parallèles), l'intersection existe donc toujours ; `!` documente cette garantie
  // géométrique plutôt que de masquer une erreur.
  const q = intersectionDeuxDroites(bAttendue, d)!;
  return {
    variante: "point",
    d,
    point,
    n,
    vecteurNormal,
    bAttendue,
    q,
    distance: Math.abs(k) * n,
  };
}

/**
 * Variante B — `d1`/`d2` toujours PARALLÈLES (même vecteur directeur `vecteurD`, jamais sécantes) :
 * `d1` passe par `q0`, `d2` par `q1 = q0 + k·vecteurNormal` — la distance entre les deux vaut
 * toujours `|k|·n`, INDÉPENDAMMENT du point que l'élève choisira plus tard sur la droite désignée
 * comme source (propriété géométrique des droites parallèles : se déplacer le long de `vecteurD`
 * ne change jamais l'écart perpendiculaire entre les deux droites).
 */
function construireParalleles(): ExerciceDistanceParalleles {
  const { vecteur: vecteurD, n } = tirerVecteurD();
  const vecteurNormal = perpendiculaire(vecteurD);
  const q0 = tirerPoint();
  const d1 = implicteDepuisPointVecteur(q0, vecteurD);
  const k = tirerK();
  const q1: Point = { x: q0.x + k * vecteurNormal.x, y: q0.y + k * vecteurNormal.y };
  const d2 = implicteDepuisPointVecteur(q1, vecteurD);
  const droiteSource: "d1" | "d2" = Math.random() < 0.5 ? "d1" : "d2";
  return {
    variante: "paralleles",
    d1,
    d2,
    droiteSource,
    n,
    vecteurNormal,
    distance: Math.abs(k) * n,
  };
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
