import type {
  CibleLimiteLog,
  DirectionX,
  ExerciceLimiteLogD,
  ExerciceLimiteLogD1,
  ExerciceLimiteLogD2,
  ExerciceLimiteLogD3,
  ExerciceLimiteLogD4,
  ExerciceLimiteLogD5,
  ExerciceLimiteLogD6,
  ExerciceLimiteLogD7,
  FormePuissance,
  IssuePuissance,
} from "../../../core6e/limitesLogarithmiques.types";
import { formatFractionLatex } from "../../../ui6e/formatFraction";
import { tirerParmi } from "../aleatoire";

/**
 * Famille D — puissances f(x)^{g(x)} : formes indéterminées 1^∞, 0^0, ∞^0 (voir la note de
 * conception de `core6e/limitesLogarithmiques.types.ts`). Méthode : f^g = e^{g·ln f}, L = lim g·ln f,
 * puis continuité de l'exponentielle.
 *
 * **Équilibre (décision permanente)** : le type de forme (3 valeurs) et l'issue (valeur finie ≠ 1,
 * 1, +∞, 0) sont tirés indépendamment et uniformément AVANT tout le reste (`construireD`) ; chaque
 * type admet les 4 issues, puis un sous-type compatible est choisi, et la boucle de rejet (nombres
 * propres : |L| ≤ 6, fraction irréductible…) ne porte que sur les paramètres numériques — jamais sur
 * l'issue, qui ne peut donc pas être biaisée par le rejet.
 *
 * Nombres propres : coefficients entiers de 1 à 4 en valeur absolue, L entier ou fraction de
 * dénominateur 2 ou 3 (d1), |L| ≤ 6 — jamais de calcul monstrueux.
 */

const FORMES: readonly FormePuissance[] = ["un_infini", "zero_zero", "infini_zero"];
const ISSUES: readonly IssuePuissance[] = ["fini", "un", "plus_infini", "zero"];
const COEF_1_3 = [-3, -2, -1, 1, 2, 3] as const;
const COEF_1_4 = [-4, -3, -2, -1, 1, 2, 3, 4] as const;

function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

const PLUS: CibleLimiteLog = { type: "plus_infini" };
const MOINS: CibleLimiteLog = { type: "moins_infini" };
const ZERO: CibleLimiteLog = { type: "zero" };
const UN: CibleLimiteLog = { type: "valeur", valeur: 1, latex: "1" };

function infiniDeSigne(signe: number): CibleLimiteLog {
  return signe > 0 ? PLUS : MOINS;
}

/** LaTeX de L = num/den (fraction irréductible, `\dfrac`). */
function latexL(num: number, den: number): string {
  return formatFractionLatex(num, den);
}

/** LaTeX exact de e^L : « e » si L = 1, `e^{-6}`, `e^{\frac{3}{2}}` (petite fraction en exposant). */
export function latexExpL(num: number, den: number): string {
  const l = latexL(num, den).replace(/\\dfrac/g, "\\frac");
  return l === "1" ? "e" : `e^{${l}}`;
}

/** Limite de l'exposant g·ln f (L) et limite finale (e^L, 1, +∞, 0) à partir de l'issue. Pour
 * l'issue « fini », L = num/den ≠ 0. */
function ciblesIssue(issue: IssuePuissance, num = 0, den = 1): { limiteProduit: CibleLimiteLog; limiteFinale: CibleLimiteLog } {
  switch (issue) {
    case "fini":
      return {
        limiteProduit: { type: "valeur", valeur: num / den, latex: latexL(num, den) },
        limiteFinale: { type: "valeur", valeur: Math.exp(num / den), latex: latexExpL(num, den) },
      };
    case "un":
      return { limiteProduit: ZERO, limiteFinale: UN };
    case "plus_infini":
      return { limiteProduit: PLUS, limiteFinale: PLUS };
    case "zero":
      return { limiteProduit: MOINS, limiteFinale: ZERO };
  }
}

/** Signe attendu du produit (ab, k(b−c), ac…) selon l'issue infinie : + pour +∞, − pour 0. */
function signeVoulu(issue: IssuePuissance): number {
  return issue === "plus_infini" ? 1 : -1;
}

// ============================================================================
// d1 — (1 + a/x^p)^{(b/d)·x^q}, x → ±∞
// ============================================================================

const PQ_D1: Record<IssuePuissance, readonly (readonly [1 | 2, 0.5 | 1 | 2 | 3])[]> = {
  fini: [
    [1, 1],
    [2, 2],
  ],
  un: [
    [1, 0.5],
    [2, 1],
  ],
  plus_infini: [
    [1, 2],
    [2, 3],
  ],
  zero: [
    [1, 2],
    [2, 3],
  ],
};

export function construireD1(issue: IssuePuissance): ExerciceLimiteLogD1 {
  const [p, q] = tirerParmi(PQ_D1[issue]);
  // −∞ seulement quand x^{q−p} garde le même signe des deux côtés (q − p pair ou nul) : (1,1), (2,2), (2,1).
  const direction: DirectionX = (p === q || (p === 2 && q === 1)) && Math.random() < 1 / 3 ? "moins_infini" : "plus_infini";
  for (;;) {
    const a = tirerParmi(COEF_1_3);
    const b = tirerParmi(COEF_1_4);
    const d = tirerParmi([1, 1, 2, 3] as const);
    if (pgcd(b, d) !== 1) continue;
    if (issue === "fini" && Math.abs(a * b) / d > 6) continue;
    if ((issue === "plus_infini" || issue === "zero") && Math.sign(a * b) !== signeVoulu(issue)) continue;
    const signeXq = direction === "plus_infini" || q === 2 ? 1 : -1;
    return {
      famille: "D",
      sousType: "d1",
      forme: "un_infini",
      issue,
      a,
      p,
      q,
      b,
      d,
      direction,
      limiteBase: UN,
      limiteExposant: infiniDeSigne(Math.sign(b) * signeXq),
      ...ciblesIssue(issue, a * b, d),
    };
  }
}

// ============================================================================
// d2 — ((x+b)/(x+c))^{k·x^q}, x → ±∞
// ============================================================================

const Q_D2: Record<IssuePuissance, 0.5 | 1 | 2> = { fini: 1, un: 0.5, plus_infini: 2, zero: 2 };

export function construireD2(issue: IssuePuissance): ExerciceLimiteLogD2 {
  const q = Q_D2[issue];
  const direction: DirectionX = q === 1 && Math.random() < 1 / 3 ? "moins_infini" : "plus_infini";
  for (;;) {
    const b = tirerParmi([-4, -3, -2, -1, 0, 1, 2, 3, 4] as const);
    const c = tirerParmi([-4, -3, -2, -1, 0, 1, 2, 3, 4] as const);
    const k = tirerParmi(COEF_1_3);
    if (b === c || Math.abs(b - c) > 5) continue;
    const produit = k * (b - c);
    if (issue === "fini" && Math.abs(produit) > 6) continue;
    if ((issue === "plus_infini" || issue === "zero") && Math.sign(produit) !== signeVoulu(issue)) continue;
    const signeXq = direction === "plus_infini" ? 1 : -1;
    return {
      famille: "D",
      sousType: "d2",
      forme: "un_infini",
      issue,
      b,
      c,
      k,
      q,
      direction,
      limiteBase: UN,
      limiteExposant: infiniDeSigne(Math.sign(k) * signeXq),
      ...ciblesIssue(issue, produit, 1),
    };
  }
}

// ============================================================================
// d3 — (1 + a·x)^{c/x^q}, x → 0⁺ (ou 0⁻ pour q = 1)
// ============================================================================

const Q_D3: Record<IssuePuissance, 0.5 | 1 | 2> = { fini: 1, un: 0.5, plus_infini: 2, zero: 2 };

export function construireD3(issue: IssuePuissance): ExerciceLimiteLogD3 {
  const q = Q_D3[issue];
  const cote: "droite" | "gauche" = q === 1 && Math.random() < 0.5 ? "gauche" : "droite";
  for (;;) {
    const a = tirerParmi(COEF_1_3);
    const c = tirerParmi(COEF_1_4);
    const produit = a * c;
    if (issue === "fini" && Math.abs(produit) > 6) continue;
    if ((issue === "plus_infini" || issue === "zero") && Math.sign(produit) !== signeVoulu(issue)) continue;
    // c/x^q : signe de c à droite ; à gauche (q = 1 seulement), signe opposé.
    const signeExposant = cote === "droite" ? Math.sign(c) : -Math.sign(c);
    return {
      famille: "D",
      sousType: "d3",
      forme: "un_infini",
      issue,
      a,
      c,
      q,
      cote,
      limiteBase: UN,
      limiteExposant: infiniDeSigne(signeExposant),
      ...ciblesIssue(issue, produit, 1),
    };
  }
}

// ============================================================================
// d4 — x^{g(x)}, x → 0⁺ ; d6 — x^{g(x)}, x → +∞ (base x, issues 1 ou e^a)
// ============================================================================

export function construireD4(issue: "fini" | "un"): ExerciceLimiteLogD4 {
  const exposant = issue === "un" ? "puissance" : "surLn";
  const a = issue === "un" ? tirerParmi(COEF_1_3) : tirerParmi([-4, -3, -2, -1, 2, 3, 4] as const);
  const q = tirerParmi([1, 2] as const);
  return { famille: "D", sousType: "d4", forme: "zero_zero", issue, a, exposant, q, limiteBase: ZERO, limiteExposant: ZERO, ...ciblesIssue(issue, a, 1) };
}

export function construireD6(issue: "fini" | "un"): ExerciceLimiteLogD6 {
  const exposant = issue === "un" ? "puissance" : "surLn";
  const a = issue === "un" ? tirerParmi(COEF_1_3) : tirerParmi([-4, -3, -2, -1, 2, 3, 4] as const);
  const q = tirerParmi([1, 2] as const);
  return { famille: "D", sousType: "d6", forme: "infini_zero", issue, a, exposant, q, limiteBase: PLUS, limiteExposant: ZERO, ...ciblesIssue(issue, a, 1) };
}

// ============================================================================
// d5 — (e^{−1/x^p})^{a·x^q}, x → 0⁺ ; d7 — (e^{x^p})^{a/x^q}, x → +∞ (comparaison d'exposants)
// ============================================================================

/** Couple (p, q) ∈ {1, 2, 3}² selon la comparaison voulue entre p et q. */
function tirerPQ(relation: "egal" | "pPlusPetit" | "pPlusGrand"): [1 | 2 | 3, 1 | 2 | 3] {
  for (;;) {
    const p = tirerParmi([1, 2, 3] as const);
    const q = tirerParmi([1, 2, 3] as const);
    if (relation === "egal" ? p === q : relation === "pPlusPetit" ? p < q : p > q) return [p, q];
  }
}

export function construireD5(issue: IssuePuissance): ExerciceLimiteLogD5 {
  // g·ln f = −a·x^{q−p} : q > p → 0 (issue 1) ; q = p → −a ; q < p → −a·(+∞).
  const [p, q] = issue === "un" ? tirerPQ("pPlusPetit") : issue === "fini" ? tirerPQ("egal") : tirerPQ("pPlusGrand");
  const a = issue === "plus_infini" ? -tirerParmi([1, 2, 3] as const) : issue === "zero" ? tirerParmi([1, 2, 3] as const) : tirerParmi(COEF_1_3);
  return { famille: "D", sousType: "d5", forme: "zero_zero", issue, p, q, a, limiteBase: ZERO, limiteExposant: ZERO, ...ciblesIssue(issue, -a, 1) };
}

export function construireD7(issue: IssuePuissance): ExerciceLimiteLogD7 {
  // g·ln f = a·x^{p−q} : p < q → 0 (issue 1) ; p = q → a ; p > q → a·(+∞).
  const [p, q] = issue === "un" ? tirerPQ("pPlusPetit") : issue === "fini" ? tirerPQ("egal") : tirerPQ("pPlusGrand");
  const a = issue === "plus_infini" ? tirerParmi([1, 2, 3] as const) : issue === "zero" ? -tirerParmi([1, 2, 3] as const) : tirerParmi(COEF_1_3);
  return { famille: "D", sousType: "d7", forme: "infini_zero", issue, p, q, a, limiteBase: PLUS, limiteExposant: ZERO, ...ciblesIssue(issue, a, 1) };
}

// ============================================================================
// Tirage : type de forme et issue d'abord (uniformes, indépendants), puis sous-type compatible.
// ============================================================================

function construirePourFormeEtIssue(forme: FormePuissance, issue: IssuePuissance): ExerciceLimiteLogD {
  switch (forme) {
    case "un_infini":
      return tirerParmi([construireD1, construireD2, construireD3])(issue);
    case "zero_zero":
      if (issue === "fini" || issue === "un") return Math.random() < 0.5 ? construireD4(issue) : construireD5(issue);
      return construireD5(issue);
    case "infini_zero":
      if (issue === "fini" || issue === "un") return Math.random() < 0.5 ? construireD6(issue) : construireD7(issue);
      return construireD7(issue);
  }
}

/** Tirage de la famille D ; `forme` forcée par le catalogue (une variante par type de forme), l'issue
 * restant toujours tirée — jamais choisie par la variante. */
export function construireD(forme?: FormePuissance): ExerciceLimiteLogD {
  const f = forme ?? tirerParmi(FORMES);
  const issue = tirerParmi(ISSUES);
  return construirePourFormeEtIssue(f, issue);
}
