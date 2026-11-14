import { DUREES, donneesTaille, ecritureScientifique, logPuissance, logsDuree } from "../../core6e/grandsNombresLog";
import type {
  ExerciceChiffres,
  ExerciceComparer,
  ExerciceGrandsNombres,
  ExercicePremierChiffre,
  ExerciceTemps,
  IdDuree,
  IdVarianteGrandsNombres,
} from "../../core6e/grandsNombresLog";

export type { IdVarianteGrandsNombres };

/**
 * Couche A (6e) — générateur de `6gen92` « Grands nombres et logarithme décimal ». N'utilise QUE
 * `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue exactement le même
 * tirage, dans l'appli comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * Marges de sécurité (une réponse arrondie au millième ne doit jamais changer la conclusion) :
 * - partie décimale de n·log(a) dans [0,01 ; 0,99] (partie entière, nombre de chiffres) ;
 * - mantisse 10^f à au moins 0,05 de tout entier (premier chiffre) ;
 * - comparaison : écart d'au moins 0,02 entre les deux logarithmes ;
 * - temps : mantisses dans [1,06 ; 9,9], borne log(N)/log(2) à au moins 0,03 d'un entier.
 *
 * Verdict (comparaison) : tiré AVANT la construction ; la paire de nombres est ensuite rangée pour
 * le respecter — « le premier est le plus grand » sort une fois sur deux, quelle que soit la `forme`
 * imposée aux autres séries.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

function pgcd(a: number, b: number): number {
  while (b !== 0) [a, b] = [b, a % b];
  return Math.abs(a);
}

/** Bases des puissances (jamais une puissance de 10 : son logarithme serait entier). */
const BASES = [2, 3, 5, 6, 7, 11, 12, 13, 17, 19, 23];

/** Logarithme des grands nombres tirés : au-delà de 10¹⁰⁰, la calculatrice ne les affiche plus. */
const LOG_MIN = 100;
const LOG_MAX = 2500;

function partieDecimale(x: number): number {
  return x - Math.floor(x);
}

/** Exposant n « rond » (multiple de 5 ou de 10) tel que n·log(a) tombe dans [min ; max]. */
function exposantRond(a: number, min: number, max: number): number {
  const pas = Math.random() < 0.5 ? 10 : 5;
  const nMin = Math.ceil(min / Math.log10(a) / pas);
  const nMax = Math.floor(max / Math.log10(a) / pas);
  return pas * entier(nMin, nMax);
}

// ============================================================================
// Nombre de chiffres.
// ============================================================================

/** Nombres premiers de Mersenne 2ⁿ − 1 (exposant, année de la découverte), jusqu'à 1982 — au-delà,
 * n·log(2) dépasse la précision d'une calculatrice de poche. */
export const MERSENNE: { n: number; annee: number }[] = [
  { n: 521, annee: 1952 },
  { n: 607, annee: 1952 },
  { n: 1279, annee: 1952 },
  { n: 2203, annee: 1952 },
  { n: 2281, annee: 1952 },
  { n: 3217, annee: 1957 },
  { n: 4253, annee: 1961 },
  { n: 4423, annee: 1961 },
  { n: 9689, annee: 1963 },
  { n: 9941, annee: 1963 },
  { n: 11213, annee: 1963 },
  { n: 19937, annee: 1971 },
  { n: 21701, annee: 1978 },
  { n: 23209, annee: 1979 },
  { n: 44497, annee: 1979 },
  { n: 86243, annee: 1982 },
];

function decimaleSure(L: number): boolean {
  const f = partieDecimale(L);
  return f >= 0.01 && f <= 0.99;
}

function construireChiffres(): ExerciceChiffres {
  if (Math.random() < 0.3) {
    const choix = MERSENNE.filter((x) => decimaleSure(logPuissance(2, x.n)));
    const { n, annee } = parmi(choix);
    return { variante: "chiffres", a: 2, n, mersenne: { annee } };
  }
  for (;;) {
    const a = parmi(BASES);
    const n = exposantRond(a, LOG_MIN, LOG_MAX);
    if (decimaleSure(logPuissance(a, n))) return { variante: "chiffres", a, n, mersenne: null };
  }
}

// ============================================================================
// Premier chiffre / écriture scientifique.
// ============================================================================

/** Mantisse à au moins 0,05 de tout entier : le premier chiffre ne se joue jamais à l'arrondi. */
export function mantisseSure(m: number): boolean {
  return Math.abs(m - Math.round(m)) >= 0.05 && m > 1.05 && m < 9.95;
}

function construirePremierChiffre(): ExercicePremierChiffre {
  for (;;) {
    const a = parmi(BASES);
    const n = Math.random() < 0.6 ? exposantRond(a, LOG_MIN, LOG_MAX) : entier(Math.ceil(LOG_MIN / Math.log10(a)), Math.floor(1200 / Math.log10(a)));
    if (mantisseSure(ecritureScientifique(logPuissance(a, n)).m)) return { variante: "premier-chiffre", a, n };
  }
}

// ============================================================================
// Comparer.
// ============================================================================

/** Paires comparables SANS calculatrice : a^p et b^q (petits entiers proches), pgcd(p, q) = 1. */
export const PAIRES_EXACTES: { a: number; p: number; b: number; q: number }[] = [
  { a: 2, p: 3, b: 3, q: 2 },
  { a: 2, p: 5, b: 5, q: 2 },
  { a: 3, p: 3, b: 5, q: 2 },
  { a: 2, p: 7, b: 5, q: 3 },
  { a: 2, p: 10, b: 10, q: 3 },
  { a: 2, p: 5, b: 3, q: 3 },
  { a: 5, p: 3, b: 11, q: 2 },
  { a: 3, p: 5, b: 15, q: 2 },
  { a: 2, p: 3, b: 7, q: 1 },
  { a: 3, p: 2, b: 10, q: 1 },
  { a: 2, p: 4, b: 15, q: 1 },
  { a: 2, p: 4, b: 17, q: 1 },
];

const EXPOSANTS_COMMUNS = [20, 25, 30, 40, 50, 60, 100];

/** Range la paire (x, y) dans l'ordre imposé par le verdict tiré : `premierPlusGrand`. */
function ranger(
  x: { a: number; n: number; l: number },
  y: { a: number; n: number; l: number },
  premierPlusGrand: boolean,
): [{ a: number; n: number }, { a: number; n: number }] {
  const [grand, petit] = x.l > y.l ? [x, y] : [y, x];
  return premierPlusGrand ? [grand, petit] : [petit, grand];
}

function construireComparer(sousCas: "logs" | "exact"): ExerciceComparer {
  // Verdict tiré AVANT la construction (jamais biaisé par la boucle de rejet).
  const premierPlusGrand = Math.random() < 0.5;
  const ordreVerdict = melange(2);
  if (sousCas === "exact") {
    const paire = parmi(PAIRES_EXACTES);
    const k = parmi(EXPOSANTS_COMMUNS);
    const x = { a: paire.a, n: paire.p * k, l: logPuissance(paire.a, paire.p * k) };
    const y = { a: paire.b, n: paire.q * k, l: logPuissance(paire.b, paire.q * k) };
    const [u, v] = ranger(x, y, premierPlusGrand);
    return { variante: "comparer", sousCas, a: u.a, n: u.n, b: v.a, m: v.n, k, ordreVerdict };
  }
  for (;;) {
    const i = entier(0, BASES.length - 2);
    const j = entier(i + 1, BASES.length - 1);
    const a = BASES[i];
    const b = BASES[j];
    // 6 et 12 se décomposent en 2 et 3 : jamais face à 2, 3, 6 ou 12 (pas de raccourci par les facteurs).
    const memesFacteurs = [2, 3, 6, 12];
    if ((a === 6 || a === 12 || b === 6 || b === 12) && memesFacteurs.includes(a) && memesFacteurs.includes(b)) continue;
    const n = exposantRond(a, LOG_MIN, 1500);
    const m = Math.round(logPuissance(a, n) / Math.log10(b)) + entier(-1, 1);
    if (m < 2 || m === n || pgcd(n, m) !== 1) continue;
    const la = logPuissance(a, n);
    const lb = logPuissance(b, m);
    const ecart = Math.abs(la - lb);
    if (ecart < 0.02 || ecart > 2 || lb < LOG_MIN) continue;
    const [u, v] = ranger({ a, n, l: la }, { a: b, n: m, l: lb }, premierPlusGrand);
    return { variante: "comparer", sousCas, a: u.a, n: u.n, b: v.a, m: v.n, k: null, ordreVerdict };
  }
}

// ============================================================================
// Temps de calcul.
// ============================================================================

/** Tailles n de la question « durée » : multiples de 10 de 60 à 500, et les puissances de 2 64, 128, 256, 512. */
const TAILLES_DUREE = [...Array.from({ length: 45 }, (_, i) => 60 + 10 * i), 64, 128, 256, 512];

function mantisseTempsSure(L: number): boolean {
  const { m } = ecritureScientifique(L);
  return m >= 1.06 && m <= 9.9;
}

function construireTemps(sousCas: "duree" | "taille"): ExerciceTemps {
  if (sousCas === "taille") {
    for (;;) {
      const e: ExerciceTemps = { variante: "temps", sousCas, p: Math.random() < 0.5 ? 9 : 12, duree: parmi(Object.keys(DUREES) as IdDuree[]) };
      const f = partieDecimale(donneesTaille(e).borne);
      if (f >= 0.03 && f <= 0.97) return e;
    }
  }
  for (;;) {
    const e: ExerciceTemps = { variante: "temps", sousCas, p: Math.random() < 0.5 ? 9 : 12, n: parmi(TAILLES_DUREE) };
    const L = logsDuree(e);
    // Au moins 10 ans : l'écriture scientifique en années garde un exposant positif.
    if (L.annees >= 1 && mantisseTempsSure(L.secondes) && mantisseTempsSure(L.annees)) return e;
  }
}

// ============================================================================
// Catalogue.
// ============================================================================

export const CATALOGUE_VARIANTES: { id: IdVarianteGrandsNombres; label: string }[] = [
  { id: "chiffres", label: "Nombre de chiffres de aⁿ (partie entière de n·log a, plus 1)" },
  { id: "comparer", label: "Comparer deux grands nombres (logarithmes, ou même exposant sans calculatrice)" },
  { id: "premier-chiffre", label: "Écriture scientifique et premier chiffre de aⁿ" },
  { id: "temps", label: "Temps de calcul d'un algorithme en 2ⁿ opérations" },
];

/** Comparer : sous-cas exact (sans calculatrice) 2 fois sur 5. Temps : durée ou taille, à parts égales. */
export function construireAvecVarianteId(id: IdVarianteGrandsNombres): ExerciceGrandsNombres {
  switch (id) {
    case "chiffres":
      return construireChiffres();
    case "comparer":
      return construireComparer(Math.random() < 0.4 ? "exact" : "logs");
    case "premier-chiffre":
      return construirePremierChiffre();
    case "temps":
      return construireTemps(Math.random() < 0.5 ? "duree" : "taille");
  }
}

/** Tirage libre : les quatre variantes à parts égales. */
export function genererExerciceGrandsNombres(): ExerciceGrandsNombres {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
