/**
 * `56gen21` — « Calculer avec le symbole Σ » (5e (6h), « Nombres réels et suites », étape 7
 * `suites-arithmetiques`). Couche A : types et générateur (`Math.random()` seul, pour `?code=`).
 *
 * Termes généraux : arithmétique a·i + b, géométrique c·qⁱ⁻ˢ (s = 0 ou 1), ou « autre » (i² + b,
 * i(i + b), 2ⁱ − i, (−1)ⁱ·i). Variantes (ordre FIXE du catalogue, ajouts en fin seulement) :
 * - `ecrire` : une somme écrite en extension (u₁ + u₂ + u₃ + ⋯ + uₙ) → terme général en i (i de 1 à n),
 *   borne n, valeur ;
 * - `developper` : Σ_{i=k}^{m} f(i), f ni arithmétique ni géométrique → nombre de termes, premier et
 *   dernier terme, valeur ;
 * - `uneSuite` : Σ d'une suite arithmétique ou géométrique (nature tirée à parts égales AVANT les
 *   nombres : c'est le verdict du premier écran) → nature, éléments, valeur ;
 * - `mixte` : Σ_{i=1}^{N} (c·qⁱ + a·i + b) → partie géométrique, partie arithmétique, total (linéarité) ;
 * - `litteral` : Σ_{i=1}^{n} (a·i + b) ou Σ_{i=1}^{n} c·qⁱ en fonction de n → premier et dernier terme,
 *   somme ;
 * - `changementIndice` : Σ_{i=k}^{m} f(i) réécrite Σ_{j=1}^{m−k+1} g(j) → borne, g(j), valeur.
 * Toutes les valeurs sont entières et calculables à la main (termes au plus quelques milliers).
 */

export type Terme =
  | { kind: "arith"; a: number; b: number }
  | { kind: "geo"; c: number; q: number; s: 0 | 1 }
  | { kind: "carrePlus"; b: number }
  | { kind: "produit"; b: number }
  | { kind: "deuxPuissanceMoinsI" }
  | { kind: "alterne" };

export type VarianteSigma = "ecrire" | "developper" | "uneSuite" | "mixte" | "litteral" | "changementIndice";
export type IdVarianteSigma = VarianteSigma;

export interface ExerciceSigma {
  variante: VarianteSigma;
  /** Terme général principal (mixte : partie arithmétique ; la partie géométrique est `geo`). */
  terme: Terme;
  /** Partie géométrique de `mixte`. */
  geo?: { c: number; q: number };
  /** Bornes : i de k à m (litteral : m = n, symbolique). */
  k: number;
  m: number;
  cleCollecteur: string;
}

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}
function entre(a: number, b: number): number {
  return a + Math.floor(Math.random() * (b - a + 1));
}

/** Valeur du terme général en i. */
export function valeurTerme(t: Terme, i: number): number {
  switch (t.kind) {
    case "arith":
      return t.a * i + t.b;
    case "geo":
      return t.c * t.q ** (i - t.s);
    case "carrePlus":
      return i * i + t.b;
    case "produit":
      return i * (i + t.b);
    case "deuxPuissanceMoinsI":
      return 2 ** i - i;
    case "alterne":
      return (-1) ** i * i;
  }
}

export const termesDe = (e: ExerciceSigma): number[] => {
  const out: number[] = [];
  for (let i = e.k; i <= e.m; i++) out.push(valeurTerme(e.terme, i));
  return out;
};
export const nombreTermes = (e: ExerciceSigma) => e.m - e.k + 1;
export const sommeDe = (e: ExerciceSigma) => termesDe(e).reduce((s, x) => s + x, 0);
export const partieGeo = (e: ExerciceSigma) => {
  let s = 0;
  for (let i = 1; i <= e.m; i++) s += e.geo!.c * e.geo!.q ** i;
  return s;
};
export const totalMixte = (e: ExerciceSigma) => partieGeo(e) + sommeDe(e);

const petit = (xs: number[], borne: number) => xs.every((x) => Math.abs(x) <= borne);

function terme1(): { a: number; b: number } {
  const a = parmi([2, 3, 4, 5, 6, 7, -2, -3, -4, -5]);
  let b = entre(-9, 9);
  if (b === 0) b = 1;
  return { a, b };
}

function construireEcrire(): ExerciceSigma {
  for (;;) {
    if (Math.random() < 0.5) {
      const { a, b } = terme1();
      const n = entre(8, 25);
      const e: ExerciceSigma = { variante: "ecrire", terme: { kind: "arith", a, b }, k: 1, m: n, cleCollecteur: "" };
      return { ...e, cleCollecteur: `ecrire/arith/n${n}` };
    }
    const c = parmi([1, 2, 3, 5]);
    const q = parmi([2, 3, -2]);
    const n = entre(5, 9);
    const e: ExerciceSigma = { variante: "ecrire", terme: { kind: "geo", c, q, s: 1 }, k: 1, m: n, cleCollecteur: `ecrire/geo/q${q}/n${n}` };
    if (petit(termesDe(e), 3000)) return e;
  }
}

function construireDevelopper(): ExerciceSigma {
  for (;;) {
    const choix = parmi(["carrePlus", "produit", "deuxPuissanceMoinsI", "alterne"] as const);
    const terme: Terme =
      choix === "carrePlus" ? { kind: "carrePlus", b: parmi([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]) } : choix === "produit" ? { kind: "produit", b: entre(1, 4) } : choix === "deuxPuissanceMoinsI" ? { kind: "deuxPuissanceMoinsI" } : { kind: "alterne" };
    const k = entre(0, 3);
    const m = k + entre(3, 5);
    const e: ExerciceSigma = { variante: "developper", terme, k, m, cleCollecteur: `developper/${choix}/k${k}` };
    if (petit(termesDe(e), 300)) return e;
  }
}

function construireUneSuite(): ExerciceSigma {
  const arith = Math.random() < 0.5; // verdict du premier écran, tiré AVANT les nombres
  for (;;) {
    const k = parmi([0, 1, 1, 2, 3]);
    if (arith) {
      const { a, b } = terme1();
      const N = entre(10, 30);
      return { variante: "uneSuite", terme: { kind: "arith", a, b }, k, m: k + N - 1, cleCollecteur: `uneSuite/arith/k${k}` };
    }
    const c = parmi([1, 2, 3, 5]);
    const q = parmi([2, 3, -2]);
    const N = entre(5, 9);
    const e: ExerciceSigma = { variante: "uneSuite", terme: { kind: "geo", c, q, s: 0 }, k, m: k + N - 1, cleCollecteur: `uneSuite/geo/k${k}/q${q}` };
    if (petit(termesDe(e), 3000)) return e;
  }
}

function construireMixte(): ExerciceSigma {
  for (;;) {
    const c = parmi([1, 2, 3, 5]);
    const q = parmi([2, 3, 4]);
    const N = entre(5, 8);
    const a = entre(1, 5);
    let b = entre(-5, 5);
    if (b === 0) b = -1;
    const e: ExerciceSigma = { variante: "mixte", terme: { kind: "arith", a, b }, geo: { c, q }, k: 1, m: N, cleCollecteur: `mixte/q${q}/N${N}` };
    if (c * q ** N <= 5000) return e;
  }
}

function construireLitteral(): ExerciceSigma {
  if (Math.random() < 0.5) {
    const { a, b } = terme1();
    return { variante: "litteral", terme: { kind: "arith", a, b }, k: 1, m: Number.NaN, cleCollecteur: "litteral/arith" };
  }
  const c = parmi([1, 2, 3, 5]);
  const q = parmi([2, 3, 4, 5]);
  return { variante: "litteral", terme: { kind: "geo", c, q, s: 0 }, k: 1, m: Number.NaN, cleCollecteur: `litteral/geo/q${q}` };
}

function construireChangement(): ExerciceSigma {
  for (;;) {
    const k = parmi([0, 2, 3, 4, 5]);
    if (Math.random() < 0.5) {
      const { a, b } = terme1();
      const N = entre(8, 20);
      return { variante: "changementIndice", terme: { kind: "arith", a, b }, k, m: k + N - 1, cleCollecteur: `changementIndice/arith/k${k}` };
    }
    const c = parmi([1, 2, 3]);
    const q = parmi([2, 3]);
    const N = entre(4, 7);
    const e: ExerciceSigma = { variante: "changementIndice", terme: { kind: "geo", c, q, s: 0 }, k, m: k + N - 1, cleCollecteur: `changementIndice/geo/k${k}` };
    if (petit(termesDe(e), 3000)) return e;
  }
}

export const CATALOGUE_VARIANTES: { id: IdVarianteSigma; label: string }[] = [
  { id: "ecrire", label: "Écrire une somme avec le symbole Σ" },
  { id: "developper", label: "Développer une somme (ni arithmétique ni géométrique)" },
  { id: "uneSuite", label: "Somme d'une suite arithmétique ou géométrique" },
  { id: "mixte", label: "Séparer une partie géométrique et une partie arithmétique" },
  { id: "litteral", label: "Somme en fonction de n" },
  { id: "changementIndice", label: "Changement d'indice" },
];

export function construireAvecVarianteId(id: IdVarianteSigma): ExerciceSigma {
  switch (id) {
    case "ecrire":
      return construireEcrire();
    case "developper":
      return construireDevelopper();
    case "uneSuite":
      return construireUneSuite();
    case "mixte":
      return construireMixte();
    case "litteral":
      return construireLitteral();
    case "changementIndice":
      return construireChangement();
  }
}

export function genererExerciceSigma(): ExerciceSigma {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}

/** Somme d'une suite arithmétique Σ_{i=1}^{n} (a·i + b), en fonction de n. */
export const sommeArithN = (a: number, b: number, n: number) => (n * (a * (n + 1) + 2 * b)) / 2;
/** Σ_{i=1}^{n} c·qⁱ en fonction de n. */
export const sommeGeoN = (c: number, q: number, n: number) => (c * q * (q ** n - 1)) / (q - 1);
