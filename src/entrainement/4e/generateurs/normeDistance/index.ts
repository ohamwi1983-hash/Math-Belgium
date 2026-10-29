/**
 * Couche A — "Norme d'un vecteur et distance entre 2 points" (chapitre "Calcul vectoriel"),
 * nouveau générateur (`promptcreationgenerateur26normedistance.md`). Réutilise
 * `additionner`/`soustraire`/`multiplier`/`determinant`/`produitPourOrthogonalite`/`normeCarree`
 * (`generateurs/vecteur/arithmetique.ts`, module frère).
 *
 * Simplification délibérée (même principe que "Loi des sinus"/"Colinéarité"/"Orthogonalité") : le
 * vecteur des variantes "vecteur"/"parametre" est toujours nommé `u`, les points/sommets des
 * variantes "distance"/"isocele"/"pythagore" toujours A/B/(C) — la variété vient des valeurs
 * tirées, jamais des noms.
 */
import type {
  ClassificationTriangleIsocele,
  ExerciceDistance,
  ExerciceIsocele,
  ExerciceNormeDistance,
  ExerciceNormeVecteur,
  ExerciceParametreNorme,
  ExercicePythagore,
  TypeSolutionNormeDistance,
  VarianteNormeDistance,
} from "../../core/normeDistance.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import { additionner, determinant, multiplier, normeCarree, produitPourOrthogonalite, soustraire } from "../vecteur/arithmetique";
import { randomInt, vecteurNormeExacte } from "./aleatoire";

// ============================================================================
// Tirages partagés — normes entières OU radicales (corrections chapitre 6, point 16)
// ============================================================================

const BORNE_COMPOSANTE = 6;

function estCarreParfait(n: number): boolean {
  const racine = Math.round(Math.sqrt(n));
  return racine * racine === n;
}

/** Vecteur à norme radicale (`√N`, `N` non carré parfait), composantes non nulles dans
 * `[-6;6]` — rejet tant que la norme tombe entière (rare). */
function vecteurNormeRadicale(): Composantes {
  for (;;) {
    const v = { x: randomInt(-BORNE_COMPOSANTE, BORNE_COMPOSANTE), y: randomInt(-BORNE_COMPOSANTE, BORNE_COMPOSANTE) };
    if (v.x !== 0 && v.y !== 0 && !estCarreParfait(normeCarree(v))) return v;
  }
}

/** Une fois sur deux une norme entière (triplet pythagoricien), une fois sur deux une norme
 * radicale — jamais "toujours entière" (l'élève doit savoir écrire `√29`, `2√5`...). */
function vecteurNormeEntiereOuRadicale(): Composantes {
  if (Math.random() < 0.5) {
    const { x, y } = vecteurNormeExacte();
    return { x, y };
  }
  return vecteurNormeRadicale();
}

// ============================================================================
// Variante 1 — norme d'un vecteur donné
// ============================================================================

function construireVecteur(): ExerciceNormeVecteur {
  const v = vecteurNormeEntiereOuRadicale();
  const carre = normeCarree(v);
  return { variante: "vecteur", v, vNom: "u", normeCarree: carre, norme: Math.sqrt(carre) };
}

// ============================================================================
// Variante 2 — distance entre 2 points
// ============================================================================

function construireDistance(): ExerciceDistance {
  const pointA = { x: randomInt(-5, 5), y: randomInt(-5, 5) };
  const vecteurAB = vecteurNormeEntiereOuRadicale();
  const pointB = additionner(pointA, vecteurAB);
  const carre = normeCarree(vecteurAB);
  return { variante: "distance", pointA, labelA: "A", pointB, labelB: "B", vecteurAB, distanceCarree: carre, distance: Math.sqrt(carre) };
}

// ============================================================================
// Variante 4 — triangle isocèle/scalène
// ============================================================================

/**
 * Isocèle : deux vecteurs `w1`, `w2` de MÊME norme issus du sommet principal `S` (`B = S+w1`,
 * `C = S+w2`), `w2` tiré parmi TOUS les vecteurs de `[-6;6]²` de même norme que `w1` et non
 * colinéaires à lui — symétriques/rotations de `w1` (`(-b;a)`, `(b;a)`, `(a;-b)`...) mais aussi,
 * quand la norme s'y prête, une autre décomposition (`(3;4)`/`(5;0)`). La base `w2-w1` a donc une
 * orientation quelconque (corrections chapitre 6, point 16 — l'ancienne construction donnait
 * toujours une base horizontale) et les longueurs sont entières ou radicales.
 *
 * Scalène : `w1`, `w2` quelconques aux 3 longueurs au carré deux à deux distinctes.
 *
 * Garde-fou commun : `|det(w1;w2)| ≥ max(‖w1‖²;‖w2‖²)/4` (angle au sommet d'au moins ~14°) —
 * jamais un triangle quasi plat. Aucun triangle équilatéral possible (coordonnées entières, voir
 * `core/normeDistance.types.ts::ClassificationTriangleIsocele`) : la classification, dérivée a
 * posteriori des carrés, le signale tout de même par une erreur.
 */
function classifierTriangleIsocele(ab: number, ac: number, bc: number): ClassificationTriangleIsocele {
  const abEgAc = ab === ac;
  const abEgBc = ab === bc;
  const acEgBc = ac === bc;
  if ((abEgAc && abEgBc) || (abEgAc && acEgBc) || (abEgBc && acEgBc)) {
    throw new Error(
      "classifierTriangleIsocele : triangle équilatéral détecté — mathématiquement impossible avec des coordonnées entières (voir core/normeDistance.types.ts), signale un bug de construction",
    );
  }
  if (abEgAc) return "isoceleA"; // les 2 côtés qui se rejoignent en A sont égaux
  if (abEgBc) return "isoceleB"; // les 2 côtés qui se rejoignent en B sont égaux
  if (acEgBc) return "isoceleC"; // les 2 côtés qui se rejoignent en C sont égaux
  return "scalene";
}

function vecteurNonNul(): Composantes {
  let v = { x: 0, y: 0 };
  while (v.x === 0 && v.y === 0) {
    v = { x: randomInt(-BORNE_COMPOSANTE, BORNE_COMPOSANTE), y: randomInt(-BORNE_COMPOSANTE, BORNE_COMPOSANTE) };
  }
  return v;
}

function assezOuvert(w1: Composantes, w2: Composantes): boolean {
  return 4 * Math.abs(determinant(w1, w2)) >= Math.max(normeCarree(w1), normeCarree(w2));
}

function vecteursMemeNormeNonColineaires(w: Composantes): Composantes[] {
  const cible = normeCarree(w);
  const resultat: Composantes[] = [];
  for (let x = -BORNE_COMPOSANTE; x <= BORNE_COMPOSANTE; x++) {
    for (let y = -BORNE_COMPOSANTE; y <= BORNE_COMPOSANTE; y++) {
      const candidat = { x, y };
      if (normeCarree(candidat) === cible && assezOuvert(w, candidat)) resultat.push(candidat);
    }
  }
  return resultat;
}

function tirerCotesIsocele(): [Composantes, Composantes] {
  // (-b;a) est toujours de même norme et perpendiculaire : la liste n'est jamais vide.
  const w1 = vecteurNonNul();
  const candidats = vecteursMemeNormeNonColineaires(w1);
  return [w1, candidats[randomInt(0, candidats.length - 1)]];
}

function tirerCotesScalene(): [Composantes, Composantes] {
  for (;;) {
    const w1 = vecteurNonNul();
    const w2 = vecteurNonNul();
    const carres = [normeCarree(w1), normeCarree(w2), normeCarree(soustraire(w2, w1))];
    if (new Set(carres).size === 3 && assezOuvert(w1, w2)) return [w1, w2];
  }
}

function construireIsocele(): ExerciceIsocele {
  const estScalene = Math.random() < 0.25;
  const [w1, w2] = estScalene ? tirerCotesScalene() : tirerCotesIsocele();

  const apex: Point = { x: randomInt(-3, 3), y: randomInt(-3, 3) };
  const gauche: Point = additionner(apex, w1);
  const droite: Point = additionner(apex, w2);

  // Assignation aléatoire des 3 sommets numériques (apex/gauche/droite) aux labels A/B/C — la
  // classification est dérivée A POSTERIORI des longueurs réellement obtenues, jamais choisie a
  // priori (même principe que `construireExerciceClassifie`, exercice "L'inconnue au dénominateur").
  const permutations: [Point, Point, Point][] = [
    [apex, gauche, droite],
    [apex, droite, gauche],
    [gauche, apex, droite],
    [gauche, droite, apex],
    [droite, apex, gauche],
    [droite, gauche, apex],
  ];
  const [pointA, pointB, pointC] = permutations[randomInt(0, permutations.length - 1)];

  const vecteurAB = soustraire(pointB, pointA);
  const vecteurAC = soustraire(pointC, pointA);
  const vecteurBC = soustraire(pointC, pointB);
  const carreAB = normeCarree(vecteurAB);
  const carreAC = normeCarree(vecteurAC);
  const carreBC = normeCarree(vecteurBC);

  return {
    variante: "isocele",
    pointA,
    labelA: "A",
    pointB,
    labelB: "B",
    pointC,
    labelC: "C",
    vecteurAB,
    vecteurAC,
    vecteurBC,
    carreAB,
    carreAC,
    carreBC,
    longueurAB: Math.sqrt(carreAB),
    longueurAC: Math.sqrt(carreAC),
    longueurBC: Math.sqrt(carreBC),
    classification: classifierTriangleIsocele(carreAB, carreAC, carreBC),
  };
}

// ============================================================================
// Variante 5 — déterminer x pour une norme cible (structurellement quadratique)
// ============================================================================

/**
 * `v⃗=(x-p ; x-r)`, `‖v⃗‖²=N` ⟺ `2x²-2(p+r)x+p²+r²-N=0`, de discriminant réduit
 * `Δ' = 2N-(p-r)²` (`Δ = 4Δ'`). x figure dans LES DEUX composantes (corrections chapitre 6,
 * point 21) : le nombre de solutions n'est plus lisible d'un coup d'œil (l'ancienne forme
 * `(x-p ; q)` se devinait en comparant `|q|` à la cible). Type choisi AVANT construction, poids
 * égaux (1/3 chacun) :
 * - `"deux"` : `Δ' = d²` (`d≥1` de même parité que `p-r`) ⟹ `x = (p+r±d)/2`, toujours entiers.
 * - `"une"` : `p-r` pair non nul, `N = (p-r)²/2` (cible `t√2`) ⟹ racine double `x = (p+r)/2`.
 * - `"zero"` : `1 ≤ N < (p-r)²/2` ⟹ aucune racine réelle.
 * `N` (= `cibleCarree`) est affiché en `m√k` irréductible, entier quand c'est un carré parfait.
 */
function construireParametreNorme(): ExerciceParametreNorme {
  const typeSolution: TypeSolutionNormeDistance = (["deux", "une", "zero"] as const)[randomInt(0, 2)];

  let p: number;
  let r: number;
  let cibleCarree: number;
  let solutions: number[];

  if (typeSolution === "deux") {
    do {
      p = randomInt(-4, 4);
      r = randomInt(-4, 4);
    } while (p === r);
    const ecart = p - r;
    let d: number;
    do {
      d = randomInt(1, 7);
    } while ((d - ecart) % 2 !== 0);
    cibleCarree = (ecart * ecart + d * d) / 2;
    solutions = [(p + r - d) / 2, (p + r + d) / 2];
  } else if (typeSolution === "une") {
    do {
      p = randomInt(-4, 4);
      r = randomInt(-4, 4);
    } while (p === r || (p - r) % 2 !== 0);
    cibleCarree = ((p - r) * (p - r)) / 2;
    solutions = [(p + r) / 2];
  } else {
    // |p-r| ≥ 2 garantit (p-r)²/2 > 1, donc au moins un N entier possible.
    do {
      p = randomInt(-4, 4);
      r = randomInt(-4, 4);
    } while (Math.abs(p - r) < 2);
    const borne = Math.ceil(((p - r) * (p - r)) / 2) - 1;
    cibleCarree = randomInt(1, borne);
    solutions = [];
  }

  const a = 2;
  const b = -2 * (p + r);
  const c = p * p + r * r - cibleCarree;
  const discriminant = b * b - 4 * a * c;

  return { variante: "parametre", p, r, cibleCarree, a, b, c, discriminant, typeSolution, solutions };
}

// ============================================================================
// Variante 6 — Pythagore comme méthode alternative (longueurs AU CARRÉ, jamais de racine)
// ============================================================================

const COEFFICIENTS_MULTIPLE = [-3, -2, -1, 1, 2, 3];

function vecteurAleatoire(borne = 5): Composantes {
  let v = { x: 0, y: 0 };
  while (v.x === 0 && v.y === 0) {
    v = { x: randomInt(-borne, borne), y: randomInt(-borne, borne) };
  }
  return v;
}

/** Rotation de 90° — perpendiculaire exacte à `v` (jamais d'arrondi), même petite fonction pure
 * dupliquée depuis `generateurs/orthogonalite/index.ts` (contrats indépendants entre générateurs du
 * chapitre, même convention que le reste du projet). */
function perpendiculaire(v: Composantes): Composantes {
  return { x: -v.y, y: v.x };
}

/** Même construction et mêmes garde-fous que `construireTriangle` (`generateurs/orthogonalite/index.ts`,
 * variante "triangle") — dupliquée plutôt qu'importée (contrats indépendants), avec un test par
 * LONGUEURS AU CARRÉ (`c²=a²+b²`) plutôt que par critère d'orthogonalité (`a·c+b·d=0`) : les deux
 * tests sont mathématiquement équivalents (un angle est droit ⟺ Pythagore ⟺ produit scalaire nul),
 * mais ce générateur emprunte délibérément le second chemin, jamais montré comme "produit
 * scalaire" ni comparé au générateur 25 (voir `ui/formatNormeDistance.ts`). */
function construirePythagore(): ExercicePythagore {
  for (let essai = 0; essai < 200; essai++) {
    const doitEtreRectangle = Math.random() < 0.5;
    const sommetCible: "A" | "B" | "C" = (["A", "B", "C"] as const)[randomInt(0, 2)];

    const w1 = vecteurAleatoire();
    let w2: Composantes;
    if (doitEtreRectangle) {
      const k = COEFFICIENTS_MULTIPLE[randomInt(0, COEFFICIENTS_MULTIPLE.length - 1)];
      w2 = multiplier(k, perpendiculaire(w1));
    } else {
      do {
        w2 = vecteurAleatoire();
      } while (produitPourOrthogonalite(w1, w2) === 0);
    }

    const sommetPoint = { x: randomInt(-5, 5), y: randomInt(-5, 5) };
    const autre1 = additionner(sommetPoint, w1);
    const autre2 = additionner(sommetPoint, w2);

    const points: Record<"A" | "B" | "C", Point> =
      sommetCible === "A"
        ? { A: sommetPoint, B: autre1, C: autre2 }
        : sommetCible === "B"
          ? { A: autre1, B: sommetPoint, C: autre2 }
          : { A: autre1, B: autre2, C: sommetPoint };

    const vecteurAB = soustraire(points.B, points.A);
    const vecteurAC = soustraire(points.C, points.A);
    const vecteurBC = soustraire(points.C, points.B);
    const carreAB = normeCarree(vecteurAB);
    const carreAC = normeCarree(vecteurAC);
    const carreBC = normeCarree(vecteurBC);

    // Rectangle en S ⟺ le côté OPPOSÉ à S (celui qui ne touche pas S) est l'hypoténuse.
    const rectA = carreBC === carreAB + carreAC;
    const rectB = carreAC === carreAB + carreBC;
    const rectC = carreAB === carreAC + carreBC;

    const nombreRectangles = [rectA, rectB, rectC].filter(Boolean).length;
    const alignes = determinant(vecteurAB, vecteurAC) === 0;
    if (nombreRectangles > 1 || alignes) continue;

    const sommetRectangle: "A" | "B" | "C" | null = rectA ? "A" : rectB ? "B" : rectC ? "C" : null;

    return {
      variante: "pythagore",
      pointA: points.A,
      labelA: "A",
      pointB: points.B,
      labelB: "B",
      pointC: points.C,
      labelC: "C",
      vecteurAB,
      vecteurAC,
      vecteurBC,
      carreAB,
      carreAC,
      carreBC,
      sommetRectangle,
    };
  }
  throw new Error("construirePythagore : aucune configuration valide trouvée après 200 essais");
}

// ============================================================================

export const CATALOGUE_VARIANTES: { id: VarianteNormeDistance; label: string }[] = [
  { id: "vecteur", label: "Norme d'un vecteur donné" },
  { id: "distance", label: "Distance entre deux points" },
  { id: "isocele", label: "Triangle isocèle/scalène" },
  { id: "parametre", label: "Déterminer x pour une norme cible" },
  { id: "pythagore", label: "Pythagore, méthode alternative" },
];

export function construireAvecVarianteId(varianteId: VarianteNormeDistance): ExerciceNormeDistance {
  if (varianteId === "vecteur") return construireVecteur();
  if (varianteId === "distance") return construireDistance();
  if (varianteId === "isocele") return construireIsocele();
  if (varianteId === "parametre") return construireParametreNorme();
  return construirePythagore();
}

export function genererExerciceNormeDistance(): ExerciceNormeDistance {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}
