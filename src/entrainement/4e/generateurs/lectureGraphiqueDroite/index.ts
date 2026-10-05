/**
 * Couche A — "Lecture graphique — équation d'une droite". Construit une direction ENTIÈRE
 * PRIMITIVE (composantes réduites par leur pgcd, jamais un vecteur brut potentiellement non
 * réduit) puis un point de référence à coordonnées entières — jamais un tirage-puis-classification :
 * la primitivité du vecteur est ce qui garantit qu'AUCUN croisement à coordonnées entières
 * n'existe entre deux pas consécutifs (`point + k·vecteur`, `k` entier), condition nécessaire pour
 * que la présentation puisse dériver la liste des points visibles directement par pas entiers de
 * `vecteur` sans jamais en manquer.
 */
import type { ExerciceLectureGraphiqueDroite, VarianteLectureGraphiqueDroite } from "../../core/lectureGraphiqueDroite.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import { implicteDepuisPointVecteur } from "../droite/geometrieDroite";

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

/** Vecteur directeur entier PRIMITIF — composantes tirées dans [-4,4] (jamais toutes deux nulles),
 * réduites par leur pgcd. Couvre nativement les cas particuliers horizontale (`dy=0` → `(±1,0)`) et
 * verticale (`dx=0` → `(0,±1)`), sans branchement spécial : le pgcd d'un couple `(n,0)` vaut `|n|`,
 * la réduction retombe donc directement sur `(±1,0)`. */
function tirerVecteurPrimitif(): Composantes {
  let dx = randomInt(-4, 4);
  let dy = randomInt(-4, 4);
  while (dx === 0 && dy === 0) {
    dx = randomInt(-4, 4);
    dy = randomInt(-4, 4);
  }
  const g = pgcd(dx, dy);
  return { x: dx / g, y: dy / g };
}

function tirerPoint(): Point {
  return { x: randomInt(-4, 4), y: randomInt(-4, 4) };
}

export function construireExercice(variante: VarianteLectureGraphiqueDroite): ExerciceLectureGraphiqueDroite {
  const point = tirerPoint();
  const vecteur = tirerVecteurPrimitif();
  const referenceImplicite = implicteDepuisPointVecteur(point, vecteur);
  return { variante, point, vecteur, referenceImplicite };
}

export const CATALOGUE_VARIANTES: { id: VarianteLectureGraphiqueDroite; label: string }[] = [
  { id: "cartesienne", label: "Équation cartésienne (forme libre)" },
  { id: "parametrique", label: "Équations paramétriques" },
];

export function construireAvecVarianteId(varianteId: VarianteLectureGraphiqueDroite): ExerciceLectureGraphiqueDroite {
  return construireExercice(varianteId);
}

export function genererExerciceLectureGraphiqueDroite(): ExerciceLectureGraphiqueDroite {
  const variante = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireExercice(variante);
}
