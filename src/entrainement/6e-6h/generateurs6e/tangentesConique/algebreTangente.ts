import type { Point } from "../../core6e/identificationConiques.types";
import type { AxeParabole, ConiqueCentree } from "../../core6e/tangentesConique.types";

/**
 * Couche A (6e) — algèbre PURE des tangentes à une conique, NEUVE et propre à `6gen62` (aucune
 * fondation à réutiliser pour ce sujet précis sur la plateforme — `identificationConiques/
 * classification.ts` (6gen58) classifie une conique déjà posée, jamais sa tangence à une droite ;
 * `equationConiqueCaracteristiques` (6gen59) construit une équation depuis des caractéristiques,
 * jamais une tangente). Locale à ce dossier — voir mission, "votre propre algèbre de tangente...
 * NEUVE".
 *
 * ============================================================================
 * DÉRIVATION (documentée une fois ici, réutilisée par familleB.ts/familleC.ts/familleE.ts) :
 * conique `A·x²+B·y²=M`, droite `y=mx+k`. Substitution :
 *   A·x² + B·(mx+k)² = M  ⟹  (A+Bm²)·x² + 2Bmk·x + (Bk²-M) = 0        (*)
 * Tangence ⟺ discriminant de (*) nul :
 *   (2Bmk)² - 4(A+Bm²)(Bk²-M) = 0
 *   ⟺ -ABk² + AM + BMm² = 0        (développement, voir tests pour la vérification numérique)
 *   ⟺ k² = M(A+Bm²)/(AB)                                                (**)
 * Point de tangence (racine double de (*)) : x_t = -Bmk/(A+Bm²), y_t = m·x_t+k.
 *
 * Famille B (m connu, k inconnu) : (**) donne directement k² — réel ssi le membre de droite est
 * positif.
 *
 * Famille C (droite passant par un point P=(x₀,y₀) donné, m inconnu) : k=y₀-m·x₀ substitué dans
 * (**) donne, après réduction, une équation DU SECOND DEGRÉ EN m :
 *   B(Ax₀²-M)·m² - 2ABx₀y₀·m + A(By₀²-M) = 0                            (***)
 * dont le discriminant vaut EXACTEMENT `4AB·M·Δ` où `Δ=Ax₀²+By₀²-M` (voir tests) — pour une
 * ellipse (A,B,M>0), positif ⟺ Δ>0 ⟺ P EXTÉRIEUR (fait géométrique standard).
 * ============================================================================
 */

// ============================================================================
// Famille A — dédoublement.
// ============================================================================

/** Coefficients de la droite tangente `coefX·x+coefY·y=coefC` obtenue par dédoublement en un point
 * `(x0,y0)` D'UNE CONIQUE À CENTRE `A·x²+B·y²=M` — formule `A·x·x₀+B·y·y₀=M`. */
export function dedoublementCentree(conique: ConiqueCentree, point: Point): { coefX: number; coefY: number; coefC: number } {
  return { coefX: conique.coeffX * point.x, coefY: conique.coeffY * point.y, coefC: conique.M };
}

/** Idem pour une parabole `y²=4px` (horizontal) / `x²=4py` (vertical) — formule
 * `y·y₀=2p(x+x₀)` / `x·x₀=2p(y+y₀)`, réécrite `coefX·x+coefY·y=coefC`. */
export function dedoublementParabole(axe: AxeParabole, p: number, point: Point): { coefX: number; coefY: number; coefC: number } {
  if (axe === "horizontal") {
    // y·y0 = 2p(x+x0)  ⟺  -2p·x + y0·y = 2p·x0
    return { coefX: -2 * p, coefY: point.y, coefC: 2 * p * point.x };
  }
  // x·x0 = 2p(y+y0)  ⟺  x0·x - 2p·y = 2p·y0
  return { coefX: point.x, coefY: -2 * p, coefC: 2 * p * point.y };
}

// ============================================================================
// Famille B — tangentes parallèles à une pente `m` donnée (conique à centre).
// ============================================================================

export interface ResultatTangentesParalleles {
  aSolution: boolean;
  /** Longueur 2 si `aSolution`, sinon `[]`. */
  tangentes: { k: number; point: Point }[];
}

/** `D = M(A+Bm²)/(AB)` — voir dérivation (**) en en-tête de fichier. */
export function discriminantParalleles(conique: ConiqueCentree, m: number): number {
  const { coeffX: A, coeffY: B, M } = conique;
  return (M * (A + B * m * m)) / (A * B);
}

export function pointDeTangenceDepuisK(conique: ConiqueCentree, m: number, k: number): Point {
  const { coeffX: A, coeffY: B } = conique;
  const x = (-B * m * k) / (A + B * m * m);
  return { x, y: m * x + k };
}

export function resoudreTangentesParalleles(conique: ConiqueCentree, m: number): ResultatTangentesParalleles {
  const D = discriminantParalleles(conique, m);
  if (D <= 0) return { aSolution: false, tangentes: [] };
  const r = Math.sqrt(D);
  return {
    aSolution: true,
    tangentes: [r, -r].map((k) => ({ k, point: pointDeTangenceDepuisK(conique, m, k) })),
  };
}

// ============================================================================
// Famille C — tangentes depuis un point donné P=(x0,y0) (conique à centre).
// ============================================================================

export interface ResultatTangentesDepuisPoint {
  aSolution: boolean;
  tangentes: { m: number; point: Point }[];
}

/** Coefficients `(a2,a1,a0)` de l'équation du second degré en `m` (***) — voir dérivation en-tête. */
export function coefficientsEquationEnM(conique: ConiqueCentree, point: Point): { a2: number; a1: number; a0: number } {
  const { coeffX: A, coeffY: B, M } = conique;
  const { x: x0, y: y0 } = point;
  return {
    a2: B * (A * x0 * x0 - M),
    a1: -2 * A * B * x0 * y0,
    a0: A * (B * y0 * y0 - M),
  };
}

/** Position de `point` par rapport à la conique — `>0` extérieur, `<0` intérieur, `0` sur la
 * conique (jamais atteint par construction dans ce générateur, voir `familleC.ts`). */
export function positionPoint(conique: ConiqueCentree, point: Point): number {
  return conique.coeffX * point.x * point.x + conique.coeffY * point.y * point.y - conique.M;
}

export function resoudreTangentesDepuisPoint(conique: ConiqueCentree, point: Point): ResultatTangentesDepuisPoint {
  const { a2, a1, a0 } = coefficientsEquationEnM(conique, point);
  const discriminant = a1 * a1 - 4 * a2 * a0;
  if (discriminant <= 0) return { aSolution: false, tangentes: [] };
  const racineDiscriminant = Math.sqrt(discriminant);
  const mValeurs = [(-a1 + racineDiscriminant) / (2 * a2), (-a1 - racineDiscriminant) / (2 * a2)];
  return {
    aSolution: true,
    tangentes: mValeurs.map((m) => {
      const k = point.y - m * point.x;
      return { m, point: pointDeTangenceDepuisK(conique, m, k) };
    }),
  };
}

// ============================================================================
// Famille D — construire une conique (ellipse/hyperbole, axes = axes de coordonnées) depuis un
// point de passage + une tangente. Formules standard : tangence de `y=mx+k` à
// `x²/a²+y²/b²=1` (ellipse) ⟺ `k²=a²m²+b²` ; à `x²/a²-y²/b²=1` (hyperbole, axe transverse
// horizontal) ⟺ `k²=a²m²-b²` (axe vertical : mêmes formules, `a`/`b` jouant le rôle symétrique
// puisque l'axe transverse porte toujours `a`).
// ============================================================================

export function distancePointDroite(point: Point, m: number, k: number): number {
  // droite m·x - y + k = 0
  return Math.abs(m * point.x - point.y + k) / Math.sqrt(m * m + 1);
}
