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
import { TRIPLETS_PYTHAGORICIENS, randomInt, vecteurNormeExacte } from "./aleatoire";

// ============================================================================
// Variante 1 — norme d'un vecteur donné
// ============================================================================

function construireVecteur(): ExerciceNormeVecteur {
  const { x, y, norme } = vecteurNormeExacte();
  return { variante: "vecteur", v: { x, y }, vNom: "u", norme };
}

// ============================================================================
// Variante 2 — distance entre 2 points
// ============================================================================

function construireDistance(): ExerciceDistance {
  const pointA = { x: randomInt(-5, 5), y: randomInt(-5, 5) };
  const { x, y, norme } = vecteurNormeExacte();
  const vecteurAB = { x, y };
  const pointB = additionner(pointA, vecteurAB);
  return { variante: "distance", pointA, labelA: "A", pointB, labelB: "B", vecteurAB, distance: norme };
}

// ============================================================================
// Variante 4 — triangle isocèle/scalène
// ============================================================================

/**
 * Méthode "deux triangles rectangles recollés le long d'une jambe commune" — la méthode classique
 * de génération de triangles à côtés ENTIERS exacts (dits "triangles héroniens"), utilisée ici
 * plutôt qu'un tirage-puis-vérification (qui échouerait presque toujours, un triangle formé de 3
 * vecteurs Pythagore-exacts choisis indépendamment n'a quasiment jamais un 3e côté lui-même exact).
 *
 * Apex au sommet, jambe commune verticale de longueur `H_COMMUN_ISOCELE` : `gauche = apex - (p1,
 * H)`, `droite = apex + (p2, -H)`. Alors :
 * - `|apex-gauche| = √(p1²+H²)` — entier exact si `(p1,H,·)` est un triplet pythagoricien.
 * - `|apex-droite| = √(p2²+H²)` — entier exact si `(p2,H,·)` est un triplet pythagoricien.
 * - `|gauche-droite| = p1+p2` — TOUJOURS entier exact, aucune condition supplémentaire.
 *
 * `p1=p2` (même candidat) ⟹ les deux jambes obliques sont égales ⟹ isocèle à l'apex. `p1≠p2` ⟹ les
 * 3 côtés sont deux à deux distincts (vérifié par énumération exhaustive des 2 candidats retenus,
 * voir `generateurs/normeDistance/index.test.ts`) ⟹ scalène. Aucune boucle de secours n'est
 * nécessaire : cette construction ne peut jamais produire de configuration dégénérée ou
 * accidentellement équilatérale (voir `core/normeDistance.types.ts::ClassificationTriangleIsocele`
 * pour la preuve que l'équilatéral est de toute façon mathématiquement impossible ici).
 */
const H_COMMUN_ISOCELE = 12;
const CANDIDATS_P_ISOCELE: readonly [number, number][] = [
  [5, 13],
  [9, 15],
];

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

function construireIsocele(): ExerciceIsocele {
  const estScalene = Math.random() < 0.25;
  const p1 = CANDIDATS_P_ISOCELE[randomInt(0, CANDIDATS_P_ISOCELE.length - 1)][0];
  const candidatsP2 = estScalene ? CANDIDATS_P_ISOCELE.filter(([p]) => p !== p1) : CANDIDATS_P_ISOCELE.filter(([p]) => p === p1);
  const p2 = candidatsP2[randomInt(0, candidatsP2.length - 1)][0];

  const apex: Point = { x: randomInt(-3, 3), y: randomInt(-3, 3) };
  const gauche: Point = { x: apex.x - p1, y: apex.y - H_COMMUN_ISOCELE };
  const droite: Point = { x: apex.x + p2, y: apex.y - H_COMMUN_ISOCELE };

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
  // Math.round : la propriété carré-parfait est garantie exacte par construction, ce round élimine
  // seulement le bruit de virgule flottante résiduel de Math.sqrt (ex. 12.999999999999998).
  const longueurAB = Math.round(Math.sqrt(normeCarree(vecteurAB)));
  const longueurAC = Math.round(Math.sqrt(normeCarree(vecteurAC)));
  const longueurBC = Math.round(Math.sqrt(normeCarree(vecteurBC)));

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
    longueurAB,
    longueurAC,
    longueurBC,
    classification: classifierTriangleIsocele(longueurAB, longueurAC, longueurBC),
  };
}

// ============================================================================
// Variante 5 — déterminer x pour une norme cible (structurellement quadratique)
// ============================================================================

/**
 * `v=(x-p,q)`, `‖v‖=cible` ⟺ `(x-p)²+q²=cible²` ⟺ `(x-p)²=cible²-q²=D`. Cible choisie AVANT toute
 * construction de composantes (jamais un tirage puis une classification a posteriori) :
 * - `"deux"` : `D=d²` (`d` entier non nul), obtenu en tirant `(q,d,cible)` directement comme un
 *   triplet pythagoricien — garantit `D` toujours un carré parfait, donc `x=p±d` toujours entier.
 * - `"une"` : `q=cible` (`D=0` exactement) — racine double `x=p`.
 * - `"zero"` : `q>cible>0` (`D<0`) — aucune racine réelle, cas pédagogiquement valable généré au
 *   même titre que les deux autres (poids égal, 1/3 chacun).
 */
function construireParametreNorme(): ExerciceParametreNorme {
  const p = randomInt(-4, 4);
  const typeSolution: TypeSolutionNormeDistance = (["deux", "une", "zero"] as const)[randomInt(0, 2)];

  let q: number;
  let cible: number;
  let solutions: number[];

  if (typeSolution === "deux") {
    const [leg1, leg2, hyp] = TRIPLETS_PYTHAGORICIENS[randomInt(0, TRIPLETS_PYTHAGORICIENS.length - 1)];
    const [qAbs, d] = Math.random() < 0.5 ? [leg1, leg2] : [leg2, leg1];
    q = Math.random() < 0.5 ? qAbs : -qAbs;
    cible = hyp;
    solutions = [p - d, p + d].sort((valeurA, valeurB) => valeurA - valeurB);
  } else if (typeSolution === "une") {
    const qAbs = randomInt(1, 6);
    q = Math.random() < 0.5 ? qAbs : -qAbs;
    cible = qAbs;
    solutions = [p];
  } else {
    const cibleAbs = randomInt(1, 5);
    const qAbs = cibleAbs + randomInt(1, 5);
    q = Math.random() < 0.5 ? qAbs : -qAbs;
    cible = cibleAbs;
    solutions = [];
  }

  const a = 1;
  const b = -2 * p;
  const c = p * p + q * q - cible * cible;
  const discriminant = b * b - 4 * a * c;

  return { variante: "parametre", p, q, cible, a, b, c, discriminant, typeSolution, solutions };
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
