/**
 * Contrat — "Norme d'un vecteur et distance entre 2 points" (chapitre "Calcul vectoriel"), nouveau
 * générateur (`promptcreationgenerateur26normedistance.md`). 5 variantes (la variante `comparaison`
 * a été entièrement supprimée par `promptgen26refontecomplete.md`), toutes fondées sur la même
 * formule `‖(a,b)‖ = √(a²+b²)` et `AB = ‖AB⃗‖ = √((xB-xA)²+(yB-yA)²)` — cette dernière construite en
 * passant d'abord par `AB⃗` (chevauchement volontaire avec "Point à partir d'une relation
 * vectorielle", générateur 20, comme déjà fait pour "Colinéarité"/"Orthogonalité").
 *
 * **Hors périmètre, confirmé par la spec** : la normalisation/vecteur unitaire n'est jamais incluse
 * dans ce générateur (hors programme de 4e).
 *
 * **Exactitude par construction, jamais de tolérance sur une racine irrationnelle** — toutes les
 * normes/distances de ce générateur sont des ENTIERS EXACTS (jamais un décimal arrondi) : les
 * variantes 1/2/4/5 reposent sur des triplets pythagoriciens (`generateurs/normeDistance/aleatoire.ts`)
 * pour garantir `√(a²+b²)` toujours entier ; la variante 6 (pythagore) travaille directement sur les
 * longueurs AU CARRÉ (jamais de racine extraite du tout), toujours entières pour n'importe quel
 * vecteur à composantes entières, sans qu'aucun triplet ne soit nécessaire.
 */
import type { Composantes, Point } from "./vecteur.types";

export type VarianteNormeDistance = "vecteur" | "distance" | "isocele" | "parametre" | "pythagore";

/** Variante 1 — norme d'un vecteur donné (1 seul écran). */
export interface ExerciceNormeVecteur {
  variante: "vecteur";
  v: Composantes;
  vNom: string;
  norme: number;
}

/** Variante 2 — distance entre 2 points (2 écrans : construction de AB⃗, puis calcul de ‖AB⃗‖). */
export interface ExerciceDistance {
  variante: "distance";
  pointA: Point;
  labelA: string;
  pointB: Point;
  labelB: string;
  vecteurAB: Composantes;
  distance: number;
}

/**
 * Classification RÉELLE d'un triangle isocèle/scalène tel que ce générateur peut le produire —
 * **ne contient délibérément jamais "équilatéral"** : aucun triangle non dégénéré à coordonnées
 * ENTIÈRES ne peut être équilatéral (l'aire d'un tel triangle, par la formule du lacet appliquée à
 * des coordonnées entières, est toujours un rationnel ; l'aire d'un triangle équilatéral de côté
 * entier `c` vaut `c²√3/4`, toujours irrationnelle pour `c≠0` — contradiction directe). Depuis
 * `promptgen26refontecomplete.md` (Partie D), "Équilatéral" n'est même plus un bouton sélectionnable
 * côté élève (piège volontairement abandonné) — l'écran de conclusion ne propose plus que
 * Isocèle (en A/B/C) / Scalène, exactement les 4 valeurs de cette union.
 */
export type ClassificationTriangleIsocele = "isoceleA" | "isoceleB" | "isoceleC" | "scalene";

/** Variante 4 — triangle isocèle/scalène (3 écrans : construction des 3 côtés, calcul des 3
 * longueurs, conclusion). Construit par la méthode "deux triangles rectangles recollés le long
 * d'une jambe commune" (voir `generateurs/normeDistance/index.ts`) — garantit les 3 longueurs
 * TOUJOURS entières exactes, sans jamais nécessiter de boucle de secours. */
export interface ExerciceIsocele {
  variante: "isocele";
  pointA: Point;
  labelA: string;
  pointB: Point;
  labelB: string;
  pointC: Point;
  labelC: string;
  vecteurAB: Composantes;
  vecteurAC: Composantes;
  vecteurBC: Composantes;
  longueurAB: number;
  longueurAC: number;
  longueurBC: number;
  classification: ClassificationTriangleIsocele;
}

/** 0, 1 (racine double) ou 2 solutions réelles à `(x-p)²+q² = cible²` — "0 solution" génère
 * délibérément aussi, cas pédagogiquement valable (spec, variante 5). */
export type TypeSolutionNormeDistance = "deux" | "une" | "zero";

/** Variante 5 — déterminer x pour une norme cible (2 écrans : réduction à `ax²+bx+c=0`, résolution
 * de x). Rupture assumée du pattern "toujours 1 solution" des générateurs 24/25 — équation
 * structurellement quadratique, jusqu'à 2 solutions réelles. */
export interface ExerciceParametreNorme {
  variante: "parametre";
  p: number;
  q: number;
  cible: number;
  a: number;
  b: number;
  c: number;
  discriminant: number;
  typeSolution: TypeSolutionNormeDistance;
  /** 0, 1 (valeur unique, racine double) ou 2 valeurs distinctes triées croissant. */
  solutions: number[];
}

/** Variante 6 — Pythagore comme méthode alternative pour triangle rectangle. Depuis
 * `promptgen26refontecomplete.md` (Partie E), 3 écrans : construction des 3 côtés, calcul des 3
 * longueurs AU CARRÉ, puis directement "rectangle en A/B/C" (l'ancien 4e écran `conclusionPythagore`
 * a été supprimé, sa question catégorielle fusionnée dans l'écran de test — voir
 * `moteur/typesNormeDistance.ts`). Méthode alternative délibérée au générateur 25 (critère
 * `a·c+b·d=0`) — même conclusion possible par `c²=a²+b²` sur les longueurs de côtés, redondance
 * pédagogique volontaire et assumée. Travaille directement sur les longueurs au carré (jamais de
 * racine extraite) — cohérent avec les conventions de tolérance numérique déjà en place, et évite
 * tout arrondi.
 *
 * **⚠️ Refonte partielle, note explicite du prompt** : "cette variante fera l'objet d'une refonte
 * plus large ultérieurement" — `sommetRectangle` reste `"A"|"B"|"C"|null` (le générateur peut
 * toujours produire un triangle NON rectangle, ~50% des tirages, `doitEtreRectangle` dans
 * `construirePythagore`), mais l'écran `testPythagore` ne propose plus que 3 choix (A/B/C, plus
 * d'option "pas rectangle") — un tirage `sommetRectangle: null` n'a donc structurellement aucune
 * réponse correcte parmi les 3 boutons proposés, gap connu et assumé pour l'instant (voir
 * CLAUDE.md, section dédiée à cette révision). */
export interface ExercicePythagore {
  variante: "pythagore";
  pointA: Point;
  labelA: string;
  pointB: Point;
  labelB: string;
  pointC: Point;
  labelC: string;
  vecteurAB: Composantes;
  vecteurAC: Composantes;
  vecteurBC: Composantes;
  carreAB: number;
  carreAC: number;
  carreBC: number;
  sommetRectangle: "A" | "B" | "C" | null;
}

export type ExerciceNormeDistance = ExerciceNormeVecteur | ExerciceDistance | ExerciceIsocele | ExerciceParametreNorme | ExercicePythagore;

export type GenerateurExerciceNormeDistance = () => ExerciceNormeDistance;
