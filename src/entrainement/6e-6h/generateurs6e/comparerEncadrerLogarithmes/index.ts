import type {
  Decomposition,
  ExerciceChangementBaseLog,
  ExerciceComparerEncadrerLog,
  ExerciceComparerLog,
  ExerciceEncadrerLog,
  ExerciceRangerLog,
  NombreARanger,
  Rationnel,
  TermeLog,
  VarianteComparerEncadrerLog,
  VerdictComparaison,
} from "../../core6e/comparerEncadrerLogarithmes.types";
import {
  estEntier,
  logApprocheMilli,
  plancherLog,
  rat,
  valeurDecomposition,
  valeurLog,
  valeurNombre,
  vraieValeurChangementBase,
} from "../../core6e/comparerEncadrerLogarithmesCalcul";

/**
 * Couche A (6e) — générateur de `6gen86` « Comparer et encadrer des logarithmes sans calculatrice ».
 * N'utilise QUE `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue
 * exactement le même tirage, ici comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * Tout est exact par construction (aucune instance n'exige la calculatrice). Le verdict de la
 * comparaison (<, >, =) est tiré AVANT la construction, 1/3 chacun ; la boucle de rejet ne porte
 * ensuite que sur des contraintes de lisibilité (arguments ≤ 1000, logarithmes non entiers…), jamais
 * sur le verdict.
 */

function hasard<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function melanger<T>(liste: T[]): T[] {
  const r = [...liste];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

/** Vrai si `x` est une puissance entière (exposant ≥ 0) de `b`. */
function estPuissance(x: number, b: number): boolean {
  let p = 1;
  while (p < x) p *= b;
  return p === x;
}

function terme(base: Rationnel, argument: Rationnel): TermeLog | null {
  const plancher = plancherLog(base, argument);
  if (plancher === null || estRationnelSimple(valeurLog({ base, argument }))) return null;
  return { base, argument, plancher };
}

// ============================================================================
// Encadrer.
// ============================================================================

const EXPOSANT_MAX: Record<number, number> = { 2: 6, 3: 4, 5: 3, 10: 3 };

export function construireEncadrer(): ExerciceEncadrerLog {
  const a = hasard([2, 3, 5, 10]);
  const k = entier(1, EXPOSANT_MAX[a]);
  const N = entier(Math.pow(a, k) + 1, Math.pow(a, k + 1) - 1);
  return { variante: "encadrer", a, N, k };
}

// ============================================================================
// Comparer.
// ============================================================================

const ARGUMENT_MAX = 1000;

/** Argument entier x ∈ ]bᵏ ; bᵏ⁺¹[ ∩ [2 ; 1000], ou null si l'intervalle est vide. */
function argumentDansTranche(b: number, k: number): number | null {
  const min = Math.max(2, Math.pow(b, k) + 1);
  const max = Math.min(ARGUMENT_MAX - 1, Math.pow(b, k + 1) - 1);
  return min > max ? null : entier(min, max);
}

/** Base > 1 (entière) ou < 1 (inverse d'un entier). */
function baseRat(b: number, inf1: boolean): Rationnel {
  return inf1 ? rat(1, b) : rat(b);
}

function construireSepares(baseInf1: boolean, verdict: "<" | ">"): Pick<ExerciceComparerLog, "A" | "B" | "lien"> {
  for (;;) {
    const b1 = hasard([2, 3, 4, 5, 6, 7, 10]);
    const b2 = hasard([2, 3, 4, 5, 6, 7, 10].filter((b) => b !== b1));
    const k1 = entier(0, 4);
    const k2 = k1 + hasard([-1, 1]);
    if (k2 < 0) continue;
    const x1 = argumentDansTranche(b1, k1);
    const x2 = argumentDansTranche(b2, k2);
    if (x1 === null || x2 === null) continue;
    const t1 = terme(baseRat(b1, baseInf1), rat(x1));
    const t2 = terme(baseRat(b2, baseInf1), rat(x2));
    if (!t1 || !t2) continue;
    const [petit, grand] = valeurLog(t1) < valeurLog(t2) ? [t1, t2] : [t2, t1];
    return verdict === "<" ? { A: petit, B: grand, lien: null } : { A: grand, B: petit, lien: null };
  }
}

function construireLies(baseInf1: boolean, verdict: VerdictComparaison): Pick<ExerciceComparerLog, "A" | "B" | "lien"> {
  for (;;) {
    const c = hasard([2, 3, 5, 10]);
    // Bases < 1 : la même base (n = 1) teste à elle seule le sens inversé — jamais pour « = ».
    const n = hasard(baseInf1 && verdict !== "=" ? [1, 2, 3] : [2, 3]);
    const cn = Math.pow(c, n);
    if (cn > 1000) continue;
    const yMax = Math.floor(Math.pow(ARGUMENT_MAX, 1 / n) + 1e-9);
    const y = entier(2, yMax);
    if (estPuissance(y, c)) continue;
    const yn = Math.pow(y, n);
    if (yn >= ARGUMENT_MAX) continue;
    const termeCn: "A" | "B" = Math.random() < 0.5 ? "A" : "B";
    let x = yn;
    if (verdict !== "=") {
      // Signe de x − yⁿ : (terme de base cⁿ) > (autre) ⟺ x > yⁿ si c > 1, x < yⁿ si c < 1.
      const cnPlusGrand = (verdict === ">") === (termeCn === "A");
      const xPlusGrand = cnPlusGrand !== baseInf1;
      const ecartMax = Math.max(1, Math.floor(0.2 * yn));
      x = yn + (xPlusGrand ? 1 : -1) * entier(1, ecartMax);
      if (x < 2 || x >= ARGUMENT_MAX || estPuissance(x, c)) continue;
    }
    const tCn = terme(baseRat(cn, baseInf1), rat(x));
    const tC = terme(baseRat(c, baseInf1), rat(y));
    if (!tCn || !tC || tCn.plancher !== tC.plancher) continue;
    const [A, B] = termeCn === "A" ? [tCn, tC] : [tC, tCn];
    // Contrôle : le verdict construit est bien celui qui a été tiré.
    const vA = valeurLog(A);
    const vB = valeurLog(B);
    const obtenu: VerdictComparaison = Math.abs(vA - vB) < 1e-9 ? "=" : vA < vB ? "<" : ">";
    if (obtenu !== verdict) continue;
    return { A, B, lien: { c: baseRat(c, baseInf1), n, x, y, termeCn } };
  }
}

export function construireComparer(baseInf1: boolean, verdictImpose?: VerdictComparaison): ExerciceComparerLog {
  const verdict: VerdictComparaison = verdictImpose ?? hasard(["<", ">", "="] as const);
  const type = verdict === "=" || Math.random() < 0.5 ? "lies" : "separes";
  const corps = type === "separes" ? construireSepares(baseInf1, verdict as "<" | ">") : construireLies(baseInf1, verdict);
  return { variante: "comparer", baseInf1, type, verdict, ...corps };
}

// ============================================================================
// Ranger.
// ============================================================================

const ARGUMENT_MAX_RANGER = 100;

/** Un logarithme non entier de plancher `k`, de base `b` (> 1) ou 1/b. */
function logDePlancher(k: number, b: number, inf1: boolean): TermeLog | null {
  // log_b(arg) ∈ ]k ; k+1[ (base b), ou log_{1/b}(arg) = −log_b(arg) ∈ ]k ; k+1[.
  const kb = inf1 ? -k - 1 : k; // tranche de log_b(arg)
  let argument: Rationnel;
  if (kb >= 0) {
    const min = Math.max(2, Math.pow(b, kb) + 1);
    const max = Math.min(ARGUMENT_MAX_RANGER, Math.pow(b, kb + 1) - 1);
    if (min > max) return null;
    argument = rat(entier(min, max));
  } else {
    // arg = 1/m avec log_b(m) ∈ ]−kb−1 ; −kb[.
    const min = Math.max(2, Math.pow(b, -kb - 1) + 1);
    const max = Math.min(ARGUMENT_MAX_RANGER, Math.pow(b, -kb) - 1);
    if (min > max) return null;
    argument = rat(1, entier(min, max));
  }
  const t = terme(inf1 ? rat(1, b) : rat(b), argument);
  return t && t.plancher === k ? t : null;
}

const BASES_RANGER: { b: number; inf1: boolean }[] = [
  { b: 2, inf1: false },
  { b: 3, inf1: false },
  { b: 4, inf1: false },
  { b: 5, inf1: false },
  { b: 10, inf1: false },
  { b: 2, inf1: true },
  { b: 3, inf1: true },
];

export function construireRanger(): ExerciceRangerLog {
  for (;;) {
    const planchers = melanger([-3, -2, -1, 0, 1, 2, 3, 4]).slice(0, 3);
    const bases = melanger(BASES_RANGER);
    const logs: TermeLog[] = [];
    for (const k of planchers) {
      let t: TermeLog | null = null;
      for (const { b, inf1 } of bases) {
        if (logs.some((l) => l.base.num === (inf1 ? 1 : b) && l.base.den === (inf1 ? b : 1))) continue;
        t = logDePlancher(k, b, inf1);
        if (t) break;
      }
      if (!t) break;
      logs.push(t);
    }
    if (logs.length < 3) continue;
    // Le quatrième nombre : un entier (n'importe lequel convient) ou une fraction hors des tranches
    // des logarithmes (sinon il faudrait un encadrement plus fin que l'entier).
    let rationnel: NombreARanger;
    if (Math.random() < 0.5) {
      const v = Math.random() < 0.5 ? hasard(planchers) : entier(-3, 5);
      rationnel = { type: "rationnel", valeur: rat(Math.abs(v)), negatif: v < 0 };
    } else {
      const den = hasard([2, 3, 4]);
      const num = entier(-3 * den, 5 * den);
      if (num % den === 0) continue;
      const fr = rat(Math.abs(num), den);
      if (fr.den === 1) continue;
      if (planchers.includes(Math.floor(num / den))) continue;
      rationnel = { type: "rationnel", valeur: fr, negatif: num < 0 };
    }
    const nombres = melanger<NombreARanger>([...logs.map((terme) => ({ type: "log" as const, terme })), rationnel]);
    const ordre = nombres.map((_, i) => i).sort((i, j) => valeurNombre(nombres[i]) - valeurNombre(nombres[j]));
    return { variante: "ranger", nombres, ordre };
  }
}

// ============================================================================
// Changement de base.
// ============================================================================

function estRationnelSimple(v: number): boolean {
  for (let d = 1; d <= 6; d++) if (estEntier(v * d)) return true;
  return false;
}

/** Distance (en centièmes) de 100·v à la frontière d'arrondi la plus proche (k + 0,5). */
function distanceFrontiere(v: number): number {
  const c = v * 100;
  return Math.abs(c - Math.floor(c) - 0.5);
}

export function construireChangementBase(modeImpose?: "log" | "ln"): ExerciceChangementBaseLog {
  const mode = modeImpose ?? (Math.random() < 0.5 ? "log" : "ln");
  for (;;) {
    const a: Decomposition = { p: entier(0, 4), q: entier(0, 3), r: mode === "log" && Math.random() < 0.25 ? 1 : 0 };
    const va = valeurDecomposition(a);
    if (va.den !== 1 || va.num < 2 || va.num > 30) continue;
    if (va.num === 10) continue; // log(10) = 1 : le changement de base serait sans objet.
    // N entier (2 fois sur 3) ou fraction simple ; un facteur 5 seulement avec les log décimaux.
    const N: Decomposition =
      Math.random() < 2 / 3
        ? { p: entier(0, 5), q: entier(0, 3), r: mode === "log" && Math.random() < 0.3 ? 1 : 0 }
        : { p: entier(-3, 4), q: entier(-2, 3), r: 0 };
    if (Math.abs(N.p) + Math.abs(N.q) + Math.abs(N.r) < 2) continue;
    const vN = valeurDecomposition(N);
    if (vN.den === 1 ? vN.num > 200 : vN.num > 32 || vN.den > 27) continue;
    if (vN.num === 1 && vN.den === 1) continue;
    if (vN.num === va.num && vN.den === va.den) continue;
    const vraie = vraieValeurChangementBase(a, N);
    if (Math.abs(vraie) > 6 || Math.abs(vraie) < 0.2 || estRationnelSimple(vraie)) continue;
    const logNMilli = logApprocheMilli(N, mode);
    const logAMilli = logApprocheMilli(a, mode);
    const approche = logNMilli / logAMilli;
    const resultatCentiemes = Math.round(approche * 100);
    if (Math.round(vraie * 100) !== resultatCentiemes) continue;
    if (distanceFrontiere(approche) < 0.08 || distanceFrontiere(vraie) < 0.08) continue;
    if (resultatCentiemes === 0) continue;
    return { variante: "changementBase", mode, a, N, logNMilli, logAMilli, resultatCentiemes, ordreFormules: melanger([0, 1, 2, 3]) };
  }
}

// ============================================================================
// Catalogue (sélecteur de variante, feuilles d'exercices).
// ============================================================================

export type IdVarianteComparerEncadrerLog = VarianteComparerEncadrerLog;

export const CATALOGUE_VARIANTES: { id: IdVarianteComparerEncadrerLog; label: string }[] = [
  { id: "encadrer", label: "Encadrer un logarithme entre deux entiers consécutifs" },
  { id: "comparer", label: "Comparer deux logarithmes de bases différentes" },
  { id: "ranger", label: "Ranger quatre nombres dans l'ordre croissant" },
  { id: "changementBase", label: "Valeur approchée par le changement de base" },
];

export function construireAvecVarianteId(id: IdVarianteComparerEncadrerLog): ExerciceComparerEncadrerLog {
  switch (id) {
    case "encadrer":
      return construireEncadrer();
    case "comparer":
      return construireComparer(Math.random() < 1 / 3);
    case "ranger":
      return construireRanger();
    case "changementBase":
      return construireChangementBase();
  }
}

/** Tirage libre : les quatre variantes équiprobables. */
export function genererExerciceComparerEncadrerLog(): ExerciceComparerEncadrerLog {
  return construireAvecVarianteId(hasard(CATALOGUE_VARIANTES).id);
}
