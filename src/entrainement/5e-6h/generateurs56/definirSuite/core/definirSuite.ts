// Copie 5e (6h) de `5e-4h/core5e/definirSuite.ts` (56gen3 ← 5gen44, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
/**
 * Couche core (5e) — `5gen44` « Définir et reconnaître une suite » (chapitre 3 de 5e, section
 * `suites-geometriques`). Types des instances et calculs EXACTS (rationnels) partagés par le
 * générateur (`generateurs5e/definirSuite/`), la vérification (`moteur5e/verificationDefinirSuite.ts`),
 * les textes (`ui5e/formatDefinirSuite.ts`) et l'adaptateur de feuilles : une seule source de vérité.
 *
 * Notations du cours : rang 1 = u₁ (n ≥ 1), uₙ₊₁ = terme de rang n + 1 (jamais uₙ + 1), u₂ₙ = terme
 * de rang 2n (jamais 2uₙ) ; arithmétique ⟺ uₙ₊₁ − uₙ constant (= r), géométrique ⟺ uₙ₊₁/uₙ constant
 * (= q).
 */

// ============================================================================
// Rationnels exacts.
// ============================================================================

export interface Q {
  num: number;
  den: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function rat(num: number, den = 1): Q {
  if (den === 0) throw new Error("rat : dénominateur nul");
  const s = den < 0 ? -1 : 1;
  const g = pgcd(num, den);
  // `+ 0` : jamais de « −0 ».
  return { num: (s * num) / g + 0, den: (s * den) / g };
}

export const plus = (a: Q, b: Q): Q => rat(a.num * b.den + b.num * a.den, a.den * b.den);
export const moins = (a: Q, b: Q): Q => rat(a.num * b.den - b.num * a.den, a.den * b.den);
export const fois = (a: Q, b: Q): Q => rat(a.num * b.num, a.den * b.den);
export function divise(a: Q, b: Q): Q {
  if (b.num === 0) throw new Error("divise : division par zéro");
  return rat(a.num * b.den, a.den * b.num);
}
export function puissance(a: Q, e: number): Q {
  if (e < 0) return puissance(divise(rat(1), a), -e);
  let r = rat(1);
  for (let i = 0; i < e; i++) r = fois(r, a);
  return r;
}
export const egal = (a: Q, b: Q): boolean => a.num === b.num && a.den === b.den;
export const estNul = (a: Q): boolean => a.num === 0;
export const versNombre = (a: Q): number => a.num / a.den;

// ============================================================================
// Formules explicites uₙ = f(n).
// ============================================================================

/**
 * - `affine` : uₙ = (a·n + b)/c (c ≥ 1 ; c = 1 pour la forme an + b) ;
 * - `second-degre` : uₙ = a·n² + b·n + c ;
 * - `homographique` : uₙ = (a·n + b)/(c·n + d) (1/n : a = 0, b = 1, c = 1, d = 0) ;
 * - `exponentielle` : uₙ = k·p^(e·n + dec) — raison q = p^e ; `ecriture` règle l'affichage
 *   (`produit` k·pⁿ⁺ᵈᵉᶜ, `quotient` p^(n+dec)/m avec k = 1/m, `inverse` m/pⁿ avec e = −1,
 *   `double` p^(2n) avec e = 2) ;
 * - `somme-expo` : uₙ = pⁿ + α·n + β.
 */
export type FormuleExplicite =
  | { type: "affine"; a: number; b: number; c: number }
  | { type: "second-degre"; a: number; b: number; c: number }
  | { type: "homographique"; a: number; b: number; c: number; d: number }
  | { type: "exponentielle"; k: Q; p: Q; e: number; dec: number; ecriture: "produit" | "quotient" | "inverse" | "double" }
  | { type: "somme-expo"; p: number; alpha: number; beta: number };

export function valeurExplicite(f: FormuleExplicite, n: number): Q {
  switch (f.type) {
    case "affine":
      return rat(f.a * n + f.b, f.c);
    case "second-degre":
      return rat(f.a * n * n + f.b * n + f.c);
    case "homographique":
      return rat(f.a * n + f.b, f.c * n + f.d);
    case "exponentielle":
      return fois(f.k, puissance(f.p, f.e * n + f.dec));
    case "somme-expo":
      return rat(Math.pow(f.p, n) + f.alpha * n + f.beta);
  }
}

/** Valeur flottante (vérification par équivalence) : rang réel quelconque. */
export function valeurExpliciteReelle(f: FormuleExplicite, n: number): number {
  switch (f.type) {
    case "affine":
      return (f.a * n + f.b) / f.c;
    case "second-degre":
      return f.a * n * n + f.b * n + f.c;
    case "homographique":
      return (f.a * n + f.b) / (f.c * n + f.d);
    case "exponentielle":
      return versNombre(f.k) * Math.pow(versNombre(f.p), f.e * n + f.dec);
    case "somme-expo":
      return Math.pow(f.p, n) + f.alpha * n + f.beta;
  }
}

// ============================================================================
// Relations de récurrence.
// ============================================================================

/**
 * `recurrence` (calcul de termes) : uₙ₊₁ = (α·uₙ + β)/(γ·uₙ + δ) ou uₙ₊₁ = uₙ² + c — jamais affine.
 * `style` fixe l'écriture affichée (et la `forme` du profil d'évaluation).
 */
export type StyleRecurrence = "quotient" | "inverse-plus" | "inverse" | "homographique" | "carre";

export type RelationRecurrence =
  | { type: "homographique"; style: Exclude<StyleRecurrence, "carre">; alpha: number; beta: number; gamma: number; delta: number }
  | { type: "carre"; style: "carre"; c: number };

export function appliquerRecurrence(g: RelationRecurrence, u: Q): Q {
  if (g.type === "carre") return plus(fois(u, u), rat(g.c));
  return divise(plus(fois(rat(g.alpha), u), rat(g.beta)), plus(fois(rat(g.gamma), u), rat(g.delta)));
}

/**
 * `nature-recurrence` : uₙ₊₁ = A·uₙ + B·n + C (A rationnel), écrite selon `style` (parfois déguisée :
 * « 2(uₙ + 3) − uₙ » est arithmétique, « uₙ + 2uₙ » est géométrique).
 */
export type StyleRecurrenceLineaire =
  | "somme"
  | "somme-inversee"
  | "deguisee-arith"
  | "produit"
  | "quotient"
  | "fraction"
  | "deguisee-geom"
  | "affine"
  | "rang";

export interface RecurrenceLineaire {
  A: Q;
  B: number;
  C: number;
  style: StyleRecurrenceLineaire;
  /** `deguisee-arith` : 2(uₙ + h) − uₙ ; `deguisee-geom` : uₙ + h·uₙ. */
  h?: number;
}

/** Terme de rang n + 1 à partir de uₙ (rang n). */
export function suivantLineaire(g: RecurrenceLineaire, u: Q, n: number): Q {
  return plus(fois(g.A, u), rat(g.B * n + g.C));
}

// ============================================================================
// Instances.
// ============================================================================

export type IdVarianteDefinirSuite = "notations" | "recurrence" | "nature-formule" | "nature-recurrence" | "nature-termes";
export type Verdict = "arithmetique" | "geometrique" | "aucune";
export type FamilleNotations = "affine" | "second-degre" | "homographique" | "exponentielle";
/** Piège d'une liste de termes « ni l'une ni l'autre ». */
export type PiegeTermes = "ecart-dernier" | "rapport-dernier" | "second-degre";

export interface ExerciceNotations {
  variante: "notations";
  famille: FamilleNotations;
  f: FormuleExplicite;
  /** Deuxième expression demandée : u₂ₙ (`double`) ou uₙ₋₁ (`precedent`). */
  autre: "double" | "precedent";
  /** Rang du terme précis demandé au dernier écran. */
  p: number;
}

export interface ExerciceRecurrence {
  variante: "recurrence";
  g: RelationRecurrence;
  u1: Q;
}

export interface ExerciceNatureFormule {
  variante: "nature-formule";
  verdict: Verdict;
  f: FormuleExplicite;
}

export interface ExerciceNatureRecurrence {
  variante: "nature-recurrence";
  verdict: Verdict;
  g: RecurrenceLineaire;
  u1: Q;
}

export interface ExerciceNatureTermes {
  variante: "nature-termes";
  verdict: Verdict;
  termes: Q[];
  piege: PiegeTermes | null;
}

export type ExerciceDefinirSuite = ExerciceNotations | ExerciceRecurrence | ExerciceNatureFormule | ExerciceNatureRecurrence | ExerciceNatureTermes;
export type ExerciceNature = ExerciceNatureFormule | ExerciceNatureRecurrence | ExerciceNatureTermes;

/** Termes u₁, …, u_N de l'instance (récurrence : u₁ puis g appliquée). */
export function premiersTermes(e: ExerciceDefinirSuite, N: number): Q[] {
  switch (e.variante) {
    case "notations":
    case "nature-formule":
      return Array.from({ length: N }, (_, i) => valeurExplicite(e.f, i + 1));
    case "recurrence": {
      const t = [e.u1];
      while (t.length < N) t.push(appliquerRecurrence(e.g, t[t.length - 1]));
      return t;
    }
    case "nature-recurrence": {
      const t = [e.u1];
      while (t.length < N) t.push(suivantLineaire(e.g, t[t.length - 1], t.length));
      return t;
    }
    case "nature-termes":
      return e.termes.slice(0, N);
  }
}

export function ecarts(termes: Q[]): Q[] {
  return termes.slice(1).map((t, i) => moins(t, termes[i]));
}

export function rapports(termes: Q[]): Q[] {
  return termes.slice(1).map((t, i) => divise(t, termes[i]));
}

const tousEgaux = (t: Q[]): boolean => t.every((x) => egal(x, t[0]));

/** Nature réelle d'une liste de termes non nuls (constante exclue par les générateurs). */
export function natureListe(termes: Q[]): Verdict {
  if (tousEgaux(ecarts(termes))) return "arithmetique";
  if (termes.every((t) => !estNul(t)) && tousEgaux(rapports(termes))) return "geometrique";
  return "aucune";
}

/** Valeurs affichées dans les options du verdict : r = u₂ − u₁ et q = u₂/u₁ (le piège « on ne
 * regarde que les deux premiers termes » est dans les options elles-mêmes). */
export function valeursOptions(e: ExerciceNature): { r: Q; q: Q } {
  const [u1, u2] = premiersTermes(e, 2);
  return { r: moins(u2, u1), q: divise(u2, u1) };
}

/** Raison réelle (r ou q) quand la suite est arithmétique ou géométrique. */
export function raison(e: ExerciceNature): Q | null {
  const { r, q } = valeursOptions(e);
  if (e.verdict === "arithmetique") return r;
  if (e.verdict === "geometrique") return q;
  return null;
}
