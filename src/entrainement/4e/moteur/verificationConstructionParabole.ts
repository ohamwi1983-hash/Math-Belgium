/**
 * Couche B — vérification pour "Construction graphique de la parabole" (position 53).
 *
 * Comme l'ancien générateur qu'il remplace, ce moteur vérifie par COHÉRENCE INTERNE — le `r`
 * choisi librement par l'élève à chaque itération (jamais une valeur de référence fixe, voir
 * CLAUDE.md "Vérification par cohérence interne"). La simplification majeure par rapport à
 * l'ancien générateur : toute la géométrie vit dans le repère LOCAL du contrat
 * (`core/constructionParabole.types.ts`), où la directrice est TOUJOURS `y=0` — donc plus besoin
 * d'un solveur d'intersection droite/cercle générique à 2 variables ni de parsing de texte libre
 * (l'interaction est un geste de glisser-déposer, jamais une saisie) : tout se réduit à de l'algèbre
 * à une variable.
 *
 * Aucun statut à 3 valeurs ici (`parse_error` n'a pas de sens) : ce générateur n'a AUCUN champ de
 * saisie libre, seulement des gestes de glisser-déposer et de clic — voir CLAUDE.md, "Couverture
 * actuelle" de la convention à 3 valeurs, qui ne s'applique qu'aux champs de texte.
 */
import type { ExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { Point } from "../core/vecteur.types";

const TOLERANCE = 1e-6;

/** Distance foyer-directrice divisée par 2 — trivial ici, la directrice étant toujours `y=0` :
 * `distance(F,directrice) = foyer.y` (foyer.y toujours strictement positif). */
export function rMinimal(exercice: ExerciceConstructionParabole): number {
  return exercice.foyer.y / 2;
}

/** Inégalité STRICTE — jamais le cas tangent (1 seul point d'intersection), qui casserait
 * l'architecture "toujours 2 points par itération" (même contrainte que l'ancien générateur).
 *
 * `rDejaUtilises` (optionnel, vide par défaut) — les r déjà confirmés aux itérations précédentes de
 * CE MÊME exercice : un r réutilisé produirait 2 paires de points cibles rigoureusement identiques
 * sur l'écran de tracé final, la seconde occurrence jamais cliquable (occultée par la première au
 * même endroit exact — trouvé par test Playwright de bout en bout, méthode "verify before fixing"),
 * donc rejeté ici même s'il est par ailleurs géométriquement valide. */
export function rEstValide(exercice: ExerciceConstructionParabole, r: number, rDejaUtilises: number[] = []): boolean {
  if (!Number.isFinite(r) || r <= rMinimal(exercice)) return false;
  return !rDejaUtilises.some((u) => Math.abs(u - r) <= TOLERANCE);
}

/** Valeur de référence pour le cercle d'exemple affiché à l'aide 2 — jamais montrée comme LA
 * réponse attendue (l'élève reste libre de choisir n'importe quel r valide). */
export function rCanonique(exercice: ExerciceConstructionParabole): number {
  return rMinimal(exercice) + 1;
}

/** Repli défensif utilisé sur le chemin de révélation (épuisement des tentatives,
 * `sessionConstructionParabole.ts`) — DOIT lui-même éviter toute réutilisation, sous peine de
 * réintroduire le même défaut par la voie du repli. Part de `rCanonique` et avance d'une unité tant
 * que la valeur est déjà utilisée — reste toujours strictement valide (`rEstValide`), jamais
 * bloqué. */
export function rCanoniqueDisponible(exercice: ExerciceConstructionParabole, rDejaUtilises: number[]): number {
  let r = rCanonique(exercice);
  while (rDejaUtilises.some((u) => Math.abs(u - r) <= TOLERANCE)) {
    r += 1;
  }
  return r;
}

export interface ReponseConstructionParabole {
  /** Rayon choisi par l'élève au compas (distance de la poignée-rayon à F). */
  r: number;
  /** Ordonnée LOCALE de la droite construite à l'équerre — signée : positive = du côté de F,
   * négative = du côté opposé (le piège central : construire "vers l'extérieur"). */
  ligneY: number;
}

export interface StatutConstructionParabole {
  rValide: boolean;
  /** Vrai seulement si la droite est EXACTEMENT à `y=r` — bon côté (vers F, jamais `y=-r`) ET bonne
   * distance (celle du r choisi par l'élève lui-même, jamais une distance de référence fixe). */
  ligneValide: boolean;
}

export function diagnostiquerConstruction(
  exercice: ExerciceConstructionParabole,
  reponse: ReponseConstructionParabole,
  rDejaUtilises: number[] = [],
): StatutConstructionParabole {
  return {
    rValide: rEstValide(exercice, reponse.r, rDejaUtilises),
    ligneValide: Number.isFinite(reponse.ligneY) && Math.abs(reponse.ligneY - reponse.r) <= TOLERANCE,
  };
}

export function verifierConstruction(
  exercice: ExerciceConstructionParabole,
  reponse: ReponseConstructionParabole,
  rDejaUtilises: number[] = [],
): boolean {
  const statut = diagnostiquerConstruction(exercice, reponse, rDejaUtilises);
  return statut.rValide && statut.ligneValide;
}

/** Les 2 points d'intersection cercle(F,r)/droite(y=r), triés par abscisse croissante. Pour tout
 * `r` strictement valide (`r>rMinimal`), `foyer.y·(2r-foyer.y) > 0` : TOUJOURS exactement 2
 * solutions réelles distinctes, jamais de cas tangent à gérer — garanti algébriquement par la
 * contrainte stricte sur r, pas par un branchement sur le discriminant. */
export function pointsCiblesIteration(exercice: ExerciceConstructionParabole, r: number): [Point, Point] {
  const { foyer } = exercice;
  const carre = foyer.y * (2 * r - foyer.y);
  const demiEcart = Math.sqrt(carre);
  return [
    { x: foyer.x - demiEcart, y: r },
    { x: foyer.x + demiEcart, y: r },
  ];
}

/** Ordre géométriquement correct pour relier les points construits en une parabole reconnaissable —
 * gauche→droite le long de la directrice, i.e. abscisse locale croissante (jamais un ordre lié aux
 * itérations, qui produirait un tracé en zigzag). */
export function ordreCorrect(cibles: Point[]): Point[] {
  return [...cibles].sort((a, b) => a.x - b.x);
}

function pointsEgaux(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) <= TOLERANCE && Math.abs(a.y - b.y) <= TOLERANCE;
}

export function verifierOrdreSelection(cibles: Point[], clics: Point[]): boolean {
  if (clics.length !== cibles.length) return false;
  const correct = ordreCorrect(cibles);
  return clics.every((p, i) => pointsEgaux(p, correct[i]!));
}
