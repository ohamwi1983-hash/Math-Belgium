/**
 * Couche A — "Orthogonalité et théorème de Pythagore généralisé" (chapitre "Calcul vectoriel"),
 * réécriture complète (`promptcreationgenerateur25orthogonalitepythagore.md`). Réutilise
 * `additionner`/`soustraire`/`multiplier`/`determinant`/`produitPourOrthogonalite`
 * (`generateurs/vecteur/arithmetique.ts`, module frère) — jamais nommé "produit scalaire" à
 * l'élève, voir `ui/formatOrthogonalite.ts`.
 *
 * Simplification délibérée (même principe que "Loi des sinus"/"Colinéarité et alignement de
 * points") : les 2 vecteurs des variantes "test"/"parametre" sont toujours nommés u/v, les 3
 * sommets des variantes "triangle"/"triangleParametre" toujours A/B/C.
 */
import type {
  ComposantesLin,
  ExerciceOrthogonalite,
  ExerciceOrthogonaliteParametre,
  ExerciceOrthogonaliteTest,
  ExerciceOrthogonaliteTriangle,
  ExerciceOrthogonaliteTriangleParametre,
  Reduction,
  ReductionLineaire,
  ReductionQuadratique,
  Sommet,
  VarianteOrthogonalite,
} from "../../core/orthogonalite.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import { additionner, determinant, multiplier, produitPourOrthogonalite, soustraire } from "../vecteur/arithmetique";
import { randomInt } from "./aleatoire";
import { additionnerLin, composantesLinEvaluees, negLin, pointFromNum, produitSymbolique, soustraireLin } from "./lin";

const COEFFICIENTS_MULTIPLE = [-3, -2, -1, 1, 2, 3];

function vecteurAleatoire(borne = 5): Composantes {
  let v = { x: 0, y: 0 };
  while (v.x === 0 && v.y === 0) {
    v = { x: randomInt(-borne, borne), y: randomInt(-borne, borne) };
  }
  return v;
}

/** Rotation de 90° — perpendiculaire exacte à `v` (jamais d'arrondi, l'orthogonalité est garantie
 * par construction plutôt que testée après coup). */
function perpendiculaire(v: Composantes): Composantes {
  return { x: -v.y, y: v.x };
}

/** Diviseurs entiers positifs de `n` (`n` toujours un entier non nul) — utilisée pour construire
 * la variante "parametre" avec une réponse `x` toujours entière (même principe que `cas4a` : le
 * coefficient extérieur est choisi comme un diviseur du produit cible, plutôt que tiré au hasard
 * puis vérifié après coup). */
function diviseurs(n: number): number[] {
  const abs = Math.abs(n);
  const resultat: number[] = [];
  for (let d = 1; d <= abs; d++) {
    if (abs % d === 0) resultat.push(d);
  }
  return resultat;
}

// ============================================================================
// Variante 1 — deux vecteurs connus, tester l'orthogonalité
// ============================================================================

function construireTest(): ExerciceOrthogonaliteTest {
  const v1 = vecteurAleatoire();
  const doitEtreOrthogonaux = Math.random() < 0.5;

  let v2: Composantes;
  if (doitEtreOrthogonaux) {
    const k = COEFFICIENTS_MULTIPLE[randomInt(0, COEFFICIENTS_MULTIPLE.length - 1)];
    v2 = multiplier(k, perpendiculaire(v1));
  } else {
    do {
      v2 = vecteurAleatoire();
    } while (produitPourOrthogonalite(v1, v2) === 0);
  }

  return {
    variante: "test",
    v1,
    v1Nom: "u",
    v2,
    v2Nom: "v",
    critere: produitPourOrthogonalite(v1, v2),
    orthogonaux: produitPourOrthogonalite(v1, v2) === 0,
  };
}

// ============================================================================
// Variante 2 — déterminer x pour l'orthogonalité (`v1=(a,b)` connu, `v2=(x,c)`)
// ============================================================================

/** `a*x+b*c=0` ⟺ `x=-(b*c)/a`. `a` choisi comme un diviseur signé de `b*c` (toujours non nul,
 * `b`/`c` non nuls) pour garantir `x` entier — cible choisie avant construction, jamais tirée puis
 * vérifiée après coup. */
function construireParametre(): ExerciceOrthogonaliteParametre {
  let b = 0;
  while (b === 0) b = randomInt(-5, 5);
  let c = 0;
  while (c === 0) c = randomInt(-5, 5);

  const produitBC = b * c;
  const listeDiviseurs = diviseurs(produitBC);
  const d = listeDiviseurs[randomInt(0, listeDiviseurs.length - 1)];
  const signe = Math.random() < 0.5 ? 1 : -1;
  const a = signe * d;
  const solutionX = -produitBC / a;

  return {
    variante: "parametre",
    v1: { x: a, y: b },
    v1Nom: "u",
    v2Connu: c,
    v2Nom: "v",
    coefX: a,
    coefConst: b * c,
    solutionX,
  };
}

// ============================================================================
// Variante 3 — triangle ABC (coordonnées numériques), tester les 3 sommets
// ============================================================================

/** Construit un triangle en choisissant 2 arêtes partant d'un sommet tiré au hasard — perpendiculaires
 * (produit remarquable via `perpendiculaire`) si le triangle doit être rectangle en ce sommet,
 * sinon retirées tant qu'elles le sont accidentellement. Boucle de secours externe : rejette et
 * régénère si 2+ sommets se révèlent rectangles (accident numérique, jamais voulu) ou si les 3
 * points sont alignés (triangle dégénéré). */
function construireTriangle(): ExerciceOrthogonaliteTriangle {
  for (let essai = 0; essai < 200; essai++) {
    const doitEtreRectangle = Math.random() < 0.5;
    const sommetCible: Sommet = (["A", "B", "C"] as const)[randomInt(0, 2)];

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

    const points: Record<Sommet, Point> =
      sommetCible === "A"
        ? { A: sommetPoint, B: autre1, C: autre2 }
        : sommetCible === "B"
          ? { A: autre1, B: sommetPoint, C: autre2 }
          : { A: autre1, B: autre2, C: sommetPoint };

    const vecteurAB = soustraire(points.B, points.A);
    const vecteurAC = soustraire(points.C, points.A);
    const vecteurBC = soustraire(points.C, points.B);
    const critereA = produitPourOrthogonalite(vecteurAB, vecteurAC);
    const critereB = produitPourOrthogonalite(multiplier(-1, vecteurAB), vecteurBC);
    const critereC = produitPourOrthogonalite(multiplier(-1, vecteurAC), multiplier(-1, vecteurBC));

    const nombreRectangles = [critereA, critereB, critereC].filter((c) => c === 0).length;
    const alignes = determinant(vecteurAB, vecteurAC) === 0;
    if (nombreRectangles > 1 || alignes) continue;

    const sommetRectangle: Sommet | null = critereA === 0 ? "A" : critereB === 0 ? "B" : critereC === 0 ? "C" : null;

    return {
      variante: "triangle",
      pointA: points.A,
      labelA: "A",
      pointB: points.B,
      labelB: "B",
      pointC: points.C,
      labelC: "C",
      vecteurAB,
      vecteurAC,
      vecteurBC,
      critereA,
      critereB,
      critereC,
      sommetRectangle,
    };
  }
  throw new Error("construireTriangle : aucune configuration valide trouvée après 200 essais");
}

// ============================================================================
// Variante 4 — triangle avec x (`sommetFixe` fixe, les 2 autres mobiles à directions ⊥)
// ============================================================================

/**
 * Construction vérifiée (voir `core/orthogonalite.types.ts::ExerciceOrthogonaliteTriangleParametre`
 * pour la justification géométrique complète) : `sommetFixe` reste un point NUMÉRIQUE fixe ; les 2
 * autres sommets (`p2`, `p3`, dans un ordre quelconque parmi les 2 lettres restantes — la symétrie
 * de la construction rend cet ordre indifférent) bougent chacun le long d'une droite, avec des
 * vitesses perpendiculaires entre elles (`ΔP2⊥ΔP3`).
 *
 * **Astuce de la composante unitaire** (même principe que `colinearite/linExpr.ts`) : le vecteur
 * `P1P2` à `x=0` a toujours sa composante `x` nulle et sa composante `y` égale à `±1` (`s`), et
 * `ΔP2=(1,q)` a toujours sa composante `x` égale à 1 — ce qui rend le système à résoudre pour
 * `P1P3` (à `x=0`) directement substituable, sans division, pour ATTEINDRE une cible `(coefX,
 * solutionX)` choisie AVANT toute construction de composantes (jamais un tirage puis une
 * classification a posteriori).
 *
 * `ΔP3 = k·(-q,1)` — perpendiculaire à `ΔP2=(1,q)` par construction (rotation de 90° mise à
 * l'échelle), garantissant `critereFixe` (le test du sommet fixe) TOUJOURS de degré 1 exactement
 * (`coefX2=0`, vérifié structurellement puis retiré en sécurité si jamais violé). Boucle de secours
 * (`ΔP2`/`ΔP3`/cible retirés) tant que les 2 critères des sommets MOBILES n'ont pas tous deux un
 * discriminant strictement négatif (aucune racine réelle) — ~30% de réussite par tirage sur un
 * grand échantillon, confirmé par script `verify before fixing` avant implémentation — et tant que
 * le triangle réel à `x=solutionX` est dégénéré (points confondus ou alignés).
 */
function construireTriangleParametre(): ExerciceOrthogonaliteTriangleParametre {
  const sommetFixe: Sommet = (["A", "B", "C"] as const)[randomInt(0, 2)];
  const [labelP2, labelP3] = (["A", "B", "C"] as const).filter((s) => s !== sommetFixe);

  for (let essai = 0; essai < 500; essai++) {
    const s = Math.random() < 0.5 ? 1 : -1;
    const q = randomInt(-3, 3);
    let k = 0;
    while (k === 0) k = randomInt(-3, 3);
    let coefXCible = 0;
    while (coefXCible === 0) coefXCible = randomInt(-4, 4);
    const solutionX = randomInt(-4, 4);
    const coefConstCible = -coefXCible * solutionX;

    const ab0: Composantes = { x: 0, y: s }; // P1P2 à x=0
    const deltaB: Composantes = { x: 1, y: q }; // vitesse de P2
    const deltaC: Composantes = { x: -k * q, y: k }; // vitesse de P3, ⊥ deltaB par construction

    const k1 = coefXCible - (ab0.x * deltaC.x + ab0.y * deltaC.y);
    const cy = s * coefConstCible;
    const cx = k1 - q * cy;
    const ac0: Composantes = { x: cx, y: cy }; // P1P3 à x=0

    const p1p2: ComposantesLin = { x: { coefX: deltaB.x, constante: ab0.x }, y: { coefX: deltaB.y, constante: ab0.y } };
    const p1p3: ComposantesLin = { x: { coefX: deltaC.x, constante: ac0.x }, y: { coefX: deltaC.y, constante: ac0.y } };
    const p2p3: ComposantesLin = soustraireLin(p1p3, p1p2);

    const critFixe = produitSymbolique(p1p2, p1p3);
    const critP2 = produitSymbolique(negLin(p1p2), p2p3);
    const critP3 = produitSymbolique(p1p3, p2p3);

    if (critFixe.coefX2 !== 0 || critFixe.coefX === 0) continue; // sécurité, ne devrait jamais se déclencher

    const discP2 = critP2.coefX ** 2 - 4 * critP2.coefX2 * critP2.coefConst;
    const discP3 = critP3.coefX ** 2 - 4 * critP3.coefX2 * critP3.coefConst;
    if (discP2 >= 0 || discP3 >= 0) continue;

    const pointFixeNum: Point = { x: randomInt(-4, 4), y: randomInt(-4, 4) };
    const pointFixeLin = pointFromNum(pointFixeNum);
    const pointP2 = additionnerLin(pointFixeLin, p1p2);
    const pointP3 = additionnerLin(pointFixeLin, p1p3);

    // non-dégénérescence à x=solutionX (points distincts, non alignés)
    const triangleResolu = {
      [sommetFixe]: composantesLinEvaluees(pointFixeLin, solutionX),
      [labelP2]: composantesLinEvaluees(pointP2, solutionX),
      [labelP3]: composantesLinEvaluees(pointP3, solutionX),
    } as Record<Sommet, Composantes>;
    const abResolu = soustraire(triangleResolu.B, triangleResolu.A);
    const acResolu = soustraire(triangleResolu.C, triangleResolu.A);
    if (determinant(abResolu, acResolu) === 0) continue;

    const points: Record<Sommet, ComposantesLin> = {
      [sommetFixe]: pointFixeLin,
      [labelP2]: pointP2,
      [labelP3]: pointP3,
    } as Record<Sommet, ComposantesLin>;
    const reductionFixe: ReductionLineaire = { degre: 1, coefX: critFixe.coefX, coefConst: critFixe.coefConst };
    const reductionP2: ReductionQuadratique = { degre: 2, coefX2: critP2.coefX2, coefX: critP2.coefX, coefConst: critP2.coefConst };
    const reductionP3: ReductionQuadratique = { degre: 2, coefX2: critP3.coefX2, coefX: critP3.coefX, coefConst: critP3.coefConst };
    const reductions: Record<Sommet, Reduction> = {
      [sommetFixe]: reductionFixe,
      [labelP2]: reductionP2,
      [labelP3]: reductionP3,
    } as Record<Sommet, Reduction>;

    const pointA = points.A;
    const pointB = points.B;
    const pointC = points.C;
    const vecteurAB = soustraireLin(pointB, pointA);
    const vecteurAC = soustraireLin(pointC, pointA);
    const vecteurBC = soustraireLin(pointC, pointB);

    return {
      variante: "triangleParametre",
      pointA,
      labelA: "A",
      pointB,
      labelB: "B",
      pointC,
      labelC: "C",
      vecteurAB,
      vecteurAC,
      vecteurBC,
      sommetFixe,
      reductionA: reductions.A,
      reductionB: reductions.B,
      reductionC: reductions.C,
      sommetResoluble: sommetFixe,
      solutionX,
    };
  }
  throw new Error("construireTriangleParametre : aucune configuration valide trouvée après 500 essais");
}

export const CATALOGUE_VARIANTES: { id: VarianteOrthogonalite; label: string }[] = [
  { id: "test", label: "Tester l'orthogonalité de deux vecteurs" },
  { id: "parametre", label: "Déterminer x pour l'orthogonalité" },
  { id: "triangle", label: "Triangle rectangle via ses vecteurs" },
  { id: "triangleParametre", label: "Triangle rectangle avec x" },
];

export function construireAvecVarianteId(varianteId: VarianteOrthogonalite): ExerciceOrthogonalite {
  if (varianteId === "test") return construireTest();
  if (varianteId === "parametre") return construireParametre();
  if (varianteId === "triangle") return construireTriangle();
  return construireTriangleParametre();
}

export function genererExerciceOrthogonalite(): ExerciceOrthogonalite {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}
