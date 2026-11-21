import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExerciceDroitesParametre, PolyM, TypeQuestionParametre } from "../../core/droitesParametre.types";
import { choisir, entier, reduireDroite, signe, type Droite, type Pt } from "../../ui/geometrieLotG";

/**
 * Générateur de gen95 « Droites dépendant d'un paramètre » (4e, ch. 7, § 4). Tout le hasard passe par
 * `Math.random` (`?code=`). Famille dₘ ≡ A(m)·x + B(m)·y + C(m) = 0 (coefficients polynomiaux en m, au
 * plus un du second degré). Variante = type de question (parallèle à d, perpendiculaire à d, passe par
 * P, horizontale, verticale) ; condition Q(m) = 0 :
 * - parallèle : critère de colinéarité de (−B ; A) et (−v ; u) nul → Q = A·v − B·u ;
 * - perpendiculaire : produit scalaire nul → Q = A·u + B·v ;
 * - point P : Q = A·x_P + B·y_P + C ;
 * - horizontale : Q = A (coefficient de x nul) ; verticale : Q = B.
 * Une racine de Q qui annule à la fois A et B est REJETÉE (plus une droite).
 *
 * Le NOMBRE de valeurs retenues est le VERDICT : tiré AVANT la recherche, à parts égales parmi les
 * issues possibles du degré (degré 1 : 0 ou 1 — 0 par une racine rejetée ; degré 2 : 0, 1 ou 2), le
 * degré étant tiré avant lui (1 ou 2, à parts égales ; toujours 2 pour « point », où une racine rejetée
 * du premier degré ferait de toute la famille une seule droite). Racines entières ou de dénominateur
 * 2 ou 3, coefficients bornés. Au premier degré, voir `famillePremierDegre` : jamais de coefficients
 * proportionnels, forme identique quel que soit le verdict (motif masqué).
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "parallele", label: "dₘ parallèle à une droite donnée" },
  { id: "perpendiculaire", label: "dₘ perpendiculaire à une droite donnée" },
  { id: "point", label: "dₘ passe par un point donné" },
  { id: "horizontale", label: "dₘ horizontale" },
  { id: "verticale", label: "dₘ verticale" },
];

export const valeurP = (p: PolyM, m: number) => p[0] * m * m + p[1] * m + p[2];
const add = (p: PolyM, r: PolyM): PolyM => [p[0] + r[0], p[1] + r[1], p[2] + r[2]];
const fois = (p: PolyM, k: number): PolyM => [p[0] * k, p[1] * k, p[2] * k];
export const degre = (p: PolyM): number => (p[0] !== 0 ? 2 : p[1] !== 0 ? 1 : 0);

const constante = (): PolyM => [0, 0, entier(1, 4) * signe()];
const affine = (r = entier(-3, 3), k = choisir([1, -1, 2, -2])): PolyM => [0, k, -k * r];
function quadratique(r?: number): PolyM {
  const r1 = r ?? entier(-3, 3);
  const t = Math.random();
  if (t < 0.5) {
    const r2 = entier(-3, 3);
    return [1, -(r1 + r2), r1 * r2];
  }
  if (t < 0.75 && r === undefined) return [1, 0, choisir([1, 2, 4, -1, -4, -9])];
  return [1, -2 * r1, r1 * r1];
}

/** Condition Q(m) de la question. */
export function condition(type: TypeQuestionParametre, A: PolyM, B: PolyM, C: PolyM, d?: Droite, p?: Pt): PolyM {
  // d ≡ ux + vy + w = 0 : vecteurs directeurs (−B ; A) et (−v ; u) ; (−B)·u − A·(−v) = A·v − B·u.
  if (type === "parallele") return add(fois(A, d!.b), fois(B, -d!.a));
  if (type === "perpendiculaire") return add(fois(A, d!.a), fois(B, d!.b));
  if (type === "point") return add(add(fois(A, p!.x), fois(B, p!.y)), C);
  if (type === "horizontale") return A;
  return B;
}

/** Racines réelles RATIONNELLES de Q (triées) ; `null` si elles ne sont pas « propres ». */
function racinesPropres(q: PolyM): number[] | null {
  const propre = (r: number) => [1, 2, 3].some((k) => Math.abs(r * k - Math.round(r * k)) < 1e-9) && Math.abs(r) <= 9;
  if (degre(q) === 1) {
    const r = -q[2] / q[1];
    return propre(r) ? [r] : null;
  }
  const delta = q[1] * q[1] - 4 * q[0] * q[2];
  if (delta < 0) return [];
  const s = Math.round(Math.sqrt(delta));
  if (s * s !== delta) return null;
  const r1 = (-q[1] - s) / (2 * q[0]);
  const r2 = (-q[1] + s) / (2 * q[0]);
  const rs = s === 0 ? [r1] : [Math.min(r1, r2), Math.max(r1, r2)];
  return rs.every(propre) ? rs : null;
}

function famille(type: TypeQuestionParametre, degreVise: 1 | 2): { A: PolyM; B: PolyM; C: PolyM } {
  const partage = Math.random() < 0.45;
  let A: PolyM;
  let B: PolyM;
  if (partage) {
    const m0 = entier(-3, 3);
    const quad = degreVise === 2 && Math.random() < 0.7;
    const surA = Math.random() < 0.5;
    const lin = (): PolyM => affine(m0);
    A = quad && surA ? quadratique(m0) : lin();
    B = quad && !surA ? quadratique(m0) : lin();
  } else {
    const quad = degreVise === 2 ? choisir(["A", "B", "C"] as const) : null;
    const brique = (q: boolean): PolyM => (q ? quadratique() : Math.random() < 0.3 ? constante() : affine());
    A = brique(quad === "A");
    B = brique(quad === "B");
  }
  const cQuad = !partage && type === "point" && degre(A) < 2 && degre(B) < 2;
  const C: PolyM = cQuad ? quadratique() : Math.random() < 0.4 ? constante() : affine(entier(-3, 3), choisir([1, -1, 2, -2, 3]));
  if (Math.random() < 0.5) return { A, B, C };
  return { A: B, B: A, C };
}

const borne = (p: PolyM, b: number) => p.every((x) => Math.abs(x) <= b);

/** t·(m − r₁)(m − r₂), développé. */
const produitRacines = (t: number, r1: number, r2: number): PolyM => [t, -t * (r1 + r2), t * r1 * r2];

/**
 * Famille d'une équation en m du PREMIER degré, sans motif qui trahisse le verdict (décision de
 * l'utilisateur : masquer le motif). Une valeur rejetée exige que a(m) et b(m) s'annulent ensemble ;
 * avec deux coefficients affins, ils seraient alors proportionnels (« (m − 2)x + 2(m − 2)y »), forme
 * qu'on ne verrait QUE pour « aucune valeur ». Ici la FORME est la même quel que soit le verdict :
 * - horizontale / verticale : le coefficient annulé est affin, l'autre est TOUJOURS du second degré
 *   (deux racines entières distinctes) ; rejet ⇔ l'une de ses racines est celle du coefficient affin ;
 * - parallèle / perpendiculaire : les deux coefficients sont du second degré, de termes en m² choisis
 *   pour s'éliminer dans la condition (équation du premier degré) ; rejet ⇔ racine commune.
 * Jamais deux coefficients proportionnels. Le verdict (0 ou 1 valeur) est tiré avant, par l'appelant.
 */
function famillePremierDegre(type: TypeQuestionParametre, verdict: number): { A: PolyM; B: PolyM; C: PolyM; d?: Droite } {
  const C: PolyM = Math.random() < 0.4 ? constante() : affine(entier(-3, 3), choisir([1, -1, 2, -2, 3]));
  if (type === "horizontale" || type === "verticale") {
    const r0 = entier(-3, 3);
    const k = choisir([1, -1, 2, -2]);
    const lin: PolyM = [0, k, -k * r0];
    let r1 = entier(-3, 3);
    let r2 = entier(-3, 3);
    if (verdict === 0) r1 = r0;
    else while (r1 === r0) r1 = entier(-3, 3);
    while (r2 === r1 || (verdict !== 0 && r2 === r0)) r2 = entier(-3, 3);
    const quad = produitRacines(choisir([1, -1]), r1, r2);
    return type === "horizontale" ? { A: lin, B: quad, C } : { A: quad, B: lin, C };
  }
  const d = reduireDroite({ a: choisir([1, -1, 2, -2]), b: choisir([1, -1, 2, -2]), c: entier(-6, 6) });
  const t = choisir([1, -1]);
  // parallèle : Q = A·b − B·a → termes en m² nuls si (α ; β) = t(a ; b) ; perpendiculaire : Q = A·a + B·b
  // → (α ; β) = t(b ; −a).
  const [alpha, beta] = type === "parallele" ? [t * d.a, t * d.b] : [t * d.b, -t * d.a];
  const a1 = entier(-3, 3);
  const a2 = entier(-3, 3);
  let b1 = entier(-3, 3);
  const b2 = entier(-3, 3);
  if (verdict === 0) b1 = a1;
  return { A: produitRacines(alpha, a1, a2), B: produitRacines(beta, b1, b2), C, d };
}

/** a(m) et b(m) proportionnels (le motif à ne jamais montrer). */
const proportionnels = (A: PolyM, B: PolyM) => A[0] * B[1] === A[1] * B[0] && A[1] * B[2] === A[2] * B[1] && A[0] * B[2] === A[2] * B[0];

/** Forme visible d'une famille : degrés de a(m), b(m), c(m) (« 210 » = a du 2d degré, b affin, c constant). */
const formeVisible = (A: PolyM, B: PolyM, C: PolyM) => `${degre(A)}${degre(B)}${degre(C)}`;

/**
 * Une instance valide du degré visé ; `verdict` (nombre de valeurs retenues) et `forme` imposés quand
 * ils sont donnés.
 */
function tirer(variante: TypeQuestionParametre, degreVise: 1 | 2, verdict: number | null, forme: string | null): ExerciceDroitesParametre {
  for (;;) {
    const premier = degreVise === 1 ? famillePremierDegre(variante, verdict ?? choisir([0, 1])) : null;
    const { A, B, C } = premier ?? famille(variante, degreVise);
    if (degre(A) === 0 && degre(B) === 0) continue;
    if (A.every((x) => x === 0) || B.every((x) => x === 0)) continue;
    if (proportionnels(A, B)) continue;
    if (forme !== null && formeVisible(A, B, C) !== forme) continue;
    if (!borne(A, 9) || !borne(B, 9) || !borne(C, 9)) continue;
    let d: Droite | undefined = premier?.d;
    let p: Pt | undefined;
    if (!premier && (variante === "parallele" || variante === "perpendiculaire")) {
      d = reduireDroite({ a: entier(-4, 4), b: entier(-4, 4), c: entier(-6, 6) });
      if (d.a === 0 && d.b === 0) continue;
    }
    if (variante === "point") p = { x: entier(-3, 3), y: entier(-3, 3) };
    const q = condition(variante, A, B, C, d, p);
    if (degre(q) !== degreVise || !borne(q, 20)) continue;
    const racines = racinesPropres(q);
    if (racines === null) continue;
    const rejetees = racines.filter((r) => Math.abs(valeurP(A, r)) < 1e-9 && Math.abs(valeurP(B, r)) < 1e-9);
    const valeurs = racines.filter((r) => !rejetees.includes(r));
    if (verdict !== null && valeurs.length !== verdict) continue;
    // Pour « point », jamais une famille dont toutes les droites passent par P (Q ≡ 0 exclu par le degré).
    const equationM = `${q[0]}m^2+(${q[1]})m+(${q[2]})=0`;
    return { variante, A, B, C, d, p, q, degre: degreVise, racines, rejetees, valeurs, equationM };
  }
}

export function construireAvecVariante(id: string): ExerciceDroitesParametre {
  const variante = (CATALOGUE_VARIANTES.some((c) => c.id === id) ? id : choisir(CATALOGUE_VARIANTES).id) as TypeQuestionParametre;
  // Degré, puis FORME visible (degrés de a, b, c), puis verdict, tous tirés AVANT la recherche : la forme
  // ne dit rien du verdict (motif masqué, décision de l'utilisateur). La forme vient d'une instance
  // libre (sans verdict imposé), le verdict est ensuite tiré à parts égales dans cette forme.
  const degreVise: 1 | 2 = variante === "point" ? 2 : Math.random() < 0.5 ? 1 : 2;
  const libre = tirer(variante, degreVise, null, null);
  const forme = formeVisible(libre.A, libre.B, libre.C);
  const verdict = degreVise === 1 ? choisir([0, 1]) : choisir([0, 1, 2]);
  return tirer(variante, degreVise, verdict, forme);
}

export function genererExerciceDroitesParametre(): ExerciceDroitesParametre {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
