/**
 * Couche core — "Orthogonalité et théorème de Pythagore généralisé" (chapitre "Calcul
 * vectoriel"), réécriture complète (`promptcreationgenerateur25orthogonalitepythagore.md`).
 * **Ne jamais utiliser le terme "produit scalaire"** dans un texte visible à l'élève — remplacé
 * partout par "critère d'orthogonalité (a·c+b·d)", voir `ui/formatOrthogonalite.ts`.
 */
import type { Composantes, Point } from "./vecteur.types";

export type VarianteOrthogonalite = "test" | "parametre" | "triangle" | "triangleParametre";
export type Sommet = "A" | "B" | "C";

/** `coefX·x + constante` — `coefX=0` = composante purement numérique (même principe que
 * `core/colinearite.types.ts::LinExpr`, dupliqué ici plutôt qu'importé — contrats indépendants
 * entre générateurs du chapitre, même convention que le reste du projet). */
export interface LinExpr {
  coefX: number;
  constante: number;
}
export interface ComposantesLin {
  x: LinExpr;
  y: LinExpr;
}

/** Réduction d'un critère à `coefficient de x + terme constant` (degré 1) — cas normal (toute la
 * variante "parametre", et les 2 sommets FIXES de la variante "triangleParametre"). */
export interface ReductionLineaire {
  degre: 1;
  coefX: number;
  coefConst: number;
}

/**
 * Réduction quadratique (degré 2) — UNIQUEMENT les 2 sommets MOBILES de "triangleParametre" (voir
 * sa doc ci-dessous pour la justification géométrique complète) : `coefX2·x² + coefX·x +
 * coefConst`, toujours de discriminant strictement négatif (aucune racine réelle, jamais le
 * sommet résoluble) — 3 champs plutôt que 2.
 */
export interface ReductionQuadratique {
  degre: 2;
  coefX2: number;
  coefX: number;
  coefConst: number;
}

export type Reduction = ReductionLineaire | ReductionQuadratique;

/** Variante 1 : deux vecteurs connus, tester l'orthogonalité. Un seul écran. */
export interface ExerciceOrthogonaliteTest {
  variante: "test";
  v1: Composantes;
  v1Nom: string;
  v2: Composantes;
  v2Nom: string;
  critere: number;
  orthogonaux: boolean;
}

/**
 * Variante 2 : `v1=(a,b)` connu, `v2=(x,c)` — `x` (composante ABSCISSE de `v2`) est l'inconnue,
 * nommée littéralement "x" (jamais "m") pour réutiliser telle quelle `evaluerExpressionGenerale`.
 * 2 écrans : réduction (coefX/coefConst du critère développé) puis résolution (valeur de x).
 */
export interface ExerciceOrthogonaliteParametre {
  variante: "parametre";
  v1: Composantes;
  v1Nom: string;
  v2Connu: number;
  v2Nom: string;
  coefX: number;
  coefConst: number;
  solutionX: number;
}

/** Variante 3 : triangle ABC (coordonnées numériques). Les 3 sommets sont testés (5 écrans) —
 * `sommetRectangle` vaut `null` si le triangle n'est rectangle en aucun sommet, sinon exactement
 * l'un des 3 (jamais 2+, contrainte de génération — triangle non dégénéré). */
export interface ExerciceOrthogonaliteTriangle {
  variante: "triangle";
  pointA: Point;
  labelA: string;
  pointB: Point;
  labelB: string;
  pointC: Point;
  labelC: string;
  vecteurAB: Composantes;
  vecteurAC: Composantes;
  vecteurBC: Composantes;
  critereA: number; // AB . AC
  critereB: number; // (-AB) . BC
  critereC: number; // (-AC) . (-BC)
  sommetRectangle: Sommet | null;
}

/**
 * Variante 4 : triangle avec `x` — exactement UN sommet (`sommetFixe`) a des coordonnées
 * NUMÉRIQUES fixes ; les DEUX AUTRES ont des coordonnées dépendant de `x` (`ComposantesLin`), avec
 * des directions de déplacement perpendiculaires l'une à l'autre.
 *
 * **Justification géométrique de cette construction (voir CLAUDE.md pour le détail complet, et
 * les scripts `verify before fixing` qui l'ont confirmée avant implémentation)** : si un seul
 * sommet bougeait (les 2 autres fixes), les DEUX critères testant les sommets fixes seraient
 * TOUJOURS de coefficients de x exactement opposés (`coefX(fixe1) = -coefX(fixe2)`, conséquence
 * directe de la relation de Chasles) — donc soit tous deux résolubles à des x DIFFÉRENTS (interdit
 * par la spec), soit tous deux de simples constantes (jamais résolubles) — dans les deux cas,
 * impossible d'obtenir "exactement un sommet résoluble". La seule construction qui fonctionne :
 * UN sommet reste fixe (son propre test, entre les 2 vecteurs partant de LUI, chacun touchant un
 * sommet mobile différent, reste TOUJOURS de degré 1, résoluble par construction) ; les 2 AUTRES
 * sommets bougent avec des vitesses perpendiculaires entre elles (`Δ1⊥Δ2`) — chacun de LEURS
 * propres tests devient alors un vrai degré 2 (le sommet mobile "voit" un cercle de Thalès balayé
 * par une droite, intersection à 0 ou 2 points, jamais exactement 1 sauf tangence dégénérée) ;
 * construit pour discriminant toujours strictement négatif (jamais de racine réelle) — jamais le
 * sommet résoluble.
 */
export interface ExerciceOrthogonaliteTriangleParametre {
  variante: "triangleParametre";
  pointA: ComposantesLin;
  labelA: string;
  pointB: ComposantesLin;
  labelB: string;
  pointC: ComposantesLin;
  labelC: string;
  vecteurAB: ComposantesLin;
  vecteurAC: ComposantesLin;
  vecteurBC: ComposantesLin;
  sommetFixe: Sommet;
  reductionA: Reduction;
  reductionB: Reduction;
  reductionC: Reduction;
  sommetResoluble: Sommet; // toujours égal à sommetFixe
  solutionX: number;
}

export type ExerciceOrthogonalite =
  | ExerciceOrthogonaliteTest
  | ExerciceOrthogonaliteParametre
  | ExerciceOrthogonaliteTriangle
  | ExerciceOrthogonaliteTriangleParametre;

export type GenerateurExerciceOrthogonalite = () => ExerciceOrthogonalite;
