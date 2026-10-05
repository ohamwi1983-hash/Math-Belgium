/**
 * Algèbre `LinExpr`/`ComposantesLin` — module frère, utilisé uniquement par la construction de la
 * variante "triangleParametre" (`index.ts`). Contrairement à `colinearite/linExpr.ts` (bilinéaire,
 * un seul vecteur variable), ce module gère le produit de DEUX `ComposantesLin` potentiellement
 * TOUTES DEUX dépendantes de `x` — d'où `produitSymbolique`, qui retourne un vrai développement
 * quadratique (`coefX2`), jamais un simple `{coefX,coefConst}` comme dans `colinearite`.
 */
import type { Composantes, Point } from "../../core/vecteur.types";
import type { ComposantesLin, LinExpr } from "../../core/orthogonalite.types";

export function evalLin(expr: LinExpr, x: number): number {
  return expr.coefX * x + expr.constante;
}

export function composantesLinEvaluees(v: ComposantesLin, x: number): Composantes {
  return { x: evalLin(v.x, x), y: evalLin(v.y, x) };
}

export function pointFromNum(p: Point): ComposantesLin {
  return { x: { coefX: 0, constante: p.x }, y: { coefX: 0, constante: p.y } };
}

function soustraireExpr(a: LinExpr, b: LinExpr): LinExpr {
  return { coefX: a.coefX - b.coefX, constante: a.constante - b.constante };
}

function additionnerExpr(a: LinExpr, b: LinExpr): LinExpr {
  return { coefX: a.coefX + b.coefX, constante: a.constante + b.constante };
}

export function soustraireLin(a: ComposantesLin, b: ComposantesLin): ComposantesLin {
  return { x: soustraireExpr(a.x, b.x), y: soustraireExpr(a.y, b.y) };
}

export function additionnerLin(a: ComposantesLin, b: ComposantesLin): ComposantesLin {
  return { x: additionnerExpr(a.x, b.x), y: additionnerExpr(a.y, b.y) };
}

export function negLin(a: ComposantesLin): ComposantesLin {
  return { x: { coefX: -a.x.coefX, constante: -a.x.constante }, y: { coefX: -a.y.coefX, constante: -a.y.constante } };
}

/** Développement EXACT (symbolique, jamais par différences finies) du produit `u·v` — un vrai
 * polynôme de degré ≤2 en x. `coefX2` vaut structurellement 0 exactement quand AU PLUS UN des deux
 * facteurs dépend de x (voir `index.ts::construireTriangleParametre` pour l'exploitation de cette
 * propriété). */
export function produitSymbolique(u: ComposantesLin, v: ComposantesLin): { coefX2: number; coefX: number; coefConst: number } {
  const coefX2 = u.x.coefX * v.x.coefX + u.y.coefX * v.y.coefX;
  const coefX = u.x.coefX * v.x.constante + u.x.constante * v.x.coefX + u.y.coefX * v.y.constante + u.y.constante * v.y.coefX;
  const coefConst = u.x.constante * v.x.constante + u.y.constante * v.y.constante;
  return { coefX2, coefX, coefConst };
}
