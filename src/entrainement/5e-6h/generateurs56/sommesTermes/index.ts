// Copie 5e (6h) de `5e-4h/generateurs5e/sommesTermes/index.ts` (56gen4 ← 5gen45, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { donneesSomme, termeArith } from "./core/sommesTermes.types";
import type {
  ExerciceArithExtension,
  ExerciceArithIndices,
  ExerciceGeomExtension,
  ExerciceGeomIndices,
  ExerciceSommesTermes,
  IdVarianteSommesTermes,
  RaisonQ,
} from "./core/sommesTermes.types";

export type { IdVarianteSommesTermes };

/**
 * Couche A (5e) — générateur de `5gen45` « Sommes de termes consécutifs ». N'utilise QUE
 * `Math.random()` : le `?code=` (`export/codeExercice.ts::avecGraine`) rejoue exactement le même
 * tirage, dans l'appli comme dans l'adaptateur de feuilles (`exportEvaluation.ts`).
 *
 * Bornes (calcul sans calculatrice) : termes arithmétiques de valeur absolue ≤ 600, sommes
 * géométriques ≤ 30 000 en valeur absolue, puissances de q connues (2¹², 3⁷, 4⁵, 5⁵ au plus).
 * Les rangs commencent toujours à p ≥ 2 (≥ 3 en arithmétique) : la somme ne part jamais de u₁, sinon
 * le piège « appliquer Sₙ depuis u₁ » n'existerait pas.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

// ============================================================================
// Arithmétique, somme de uₚ à uₙ.
// ============================================================================

function construireArithIndices(): ExerciceArithIndices {
  const donnee = Math.random() < 0.5 ? "formule" : "u1r";
  for (;;) {
    const r = Math.random() < 0.75 ? entier(2, 9) : -entier(1, 7);
    // Formule uₙ = a·n + b : b tiré directement (petit), u₁ = a + b.
    const u1 = donnee === "formule" ? r + entier(-15, 20) : entier(-20, 40);
    const p = entier(3, 15);
    const nombre = entier(8, 30);
    const n = p + nombre - 1;
    if (n > 50) continue;
    const e: ExerciceArithIndices = { variante: "arith-indices", donnee, u1, r, p, n };
    const d = donneesSomme(e);
    if (Math.abs(d.premier) > 400 || Math.abs(d.dernier) > 400 || d.somme === 0) continue;
    // Le piège « Sₙ depuis u₁ » doit donner une valeur différente.
    const sn = (n * (u1 + d.dernier)) / 2;
    if (sn === d.somme) continue;
    return e;
  }
}

// ============================================================================
// Arithmétique, somme écrite en extension.
// ============================================================================

const DIVISEURS = [3, 4, 6, 7, 8, 9, 11, 12, 13, 15];

function construireArithExtension(sousCas: ExerciceArithExtension["sousCas"]): ExerciceArithExtension {
  if (sousCas === "naturels") {
    const parite = Math.random() < 0.6 ? "impairs" : "pairs";
    const k = entier(15, 120);
    return { variante: "arith-extension", sousCas, premier: parite === "impairs" ? 1 : 2, r: 2, nombre: k, parite, bornes: null };
  }
  if (sousCas === "multiples") {
    for (;;) {
      const d = parmi(DIVISEURS);
      const A = 10 * entier(2, 40);
      const B = A + 50 * entier(4, 16);
      if (A % d === 0 || B % d === 0) continue;
      const k1 = Math.ceil(A / d);
      const k2 = Math.floor(B / d);
      const nombre = k2 - k1 + 1;
      if (nombre < 10 || nombre > 120) continue;
      return { variante: "arith-extension", sousCas, premier: d * k1, r: d, nombre, parite: null, bornes: [A, B] };
    }
  }
  for (;;) {
    if (Math.random() < 0.7) {
      const r = entier(2, 13);
      const premier = entier(1, 40);
      const nombre = entier(12, 50);
      if (termeArith(premier, r, nombre) > 600) continue;
      return { variante: "arith-extension", sousCas, premier, r, nombre, parite: null, bornes: null };
    }
    const r = -entier(2, 9);
    const nombre = entier(10, 30);
    const dernier = entier(1, 30);
    const premier = dernier - (nombre - 1) * r;
    if (premier > 600) continue;
    return { variante: "arith-extension", sousCas, premier, r, nombre, parite: null, bornes: null };
  }
}

// ============================================================================
// Géométrique, somme de uₚ à uₙ.
// ============================================================================

const Q_ENTIERS: RaisonQ[] = [
  { num: 2, den: 1 },
  { num: 2, den: 1 },
  { num: 3, den: 1 },
  { num: -2, den: 1 },
  { num: -3, den: 1 },
  { num: 5, den: 1 },
];
const Q_FRACTIONS: RaisonQ[] = [
  { num: 1, den: 2 },
  { num: -1, den: 2 },
];

/** Raison fractionnaire une fois sur quatre (forme `…:fraction` du profil). */
const PART_FRACTIONS = 0.25;

function construireGeomIndices(): ExerciceGeomIndices {
  const donnee = Math.random() < 0.5 ? "u1q" : "formule";
  const exposant = donnee === "formule" ? (Math.random() < 0.5 ? "n-1" : "n") : null;
  const fraction = Math.random() < PART_FRACTIONS;
  for (;;) {
    let u1: number;
    let p: number;
    let nombre: number;
    let q: RaisonQ;
    if (fraction) {
      q = parmi(Q_FRACTIONS);
      p = entier(2, 4);
      nombre = entier(4, 7);
      const m = p + nombre - 2 + entier(0, 1);
      u1 = parmi([1, 3, 5, -3]) * 2 ** m;
    } else {
      q = parmi(Q_ENTIERS);
      p = entier(2, 5);
      nombre = entier(4, 8);
      // Formule en qⁿ : u₁ = k·q, multiple de q.
      u1 = exposant === "n" ? parmi([1, 2, 3, 5, -1, -2]) * q.num : parmi([1, 2, 3, 4, 5, 6, -1, -2, -3]);
    }
    const n = p + nombre - 1;
    const e: ExerciceGeomIndices = { variante: "geom-indices", donnee, exposant, u1, q, p, n };
    const d = donneesSomme(e);
    if (Math.abs(u1) > 6000 || Math.abs(d.premier) > 5000 || Math.abs(d.dernier) > 5000 || Math.abs(d.somme) > 20000 || d.somme === 0) continue;
    return e;
  }
}

// ============================================================================
// Géométrique, somme écrite en extension.
// ============================================================================

const Q_EXTENSION: RaisonQ[] = [
  { num: 2, den: 1 },
  { num: 2, den: 1 },
  { num: 3, den: 1 },
  { num: 4, den: 1 },
  { num: 5, den: 1 },
  { num: -2, den: 1 },
  { num: -3, den: 1 },
];

function construireGeomExtension(): ExerciceGeomExtension {
  const fraction = Math.random() < PART_FRACTIONS;
  for (;;) {
    const nombre = entier(5, 12);
    if (fraction) {
      const premier = entier(1, 7) * 2 ** (nombre - 1);
      if (premier > 10000) continue;
      return { variante: "geom-extension", premier, q: { num: 1, den: 2 }, nombre };
    }
    const q = parmi(Q_EXTENSION);
    const premier = entier(1, 7);
    // Raison négative : quatre termes affichés avant « … », donc au moins six termes.
    if (q.num < 0 && nombre < 6) continue;
    const e: ExerciceGeomExtension = { variante: "geom-extension", premier, q, nombre };
    const d = donneesSomme(e);
    if (Math.abs(d.dernier) > 10000 || Math.abs(d.somme) > 30000) continue;
    return e;
  }
}

// ============================================================================
// Catalogue.
// ============================================================================

export const CATALOGUE_VARIANTES: { id: IdVarianteSommesTermes; label: string }[] = [
  { id: "arith-indices", label: "Suite arithmétique : somme de uₚ à uₙ" },
  { id: "arith-extension", label: "Somme arithmétique en extension (liste, impairs/pairs, multiples)" },
  { id: "geom-indices", label: "Suite géométrique : somme de uₚ à uₙ" },
  { id: "geom-extension", label: "Somme géométrique en extension (3 + 6 + 12 + … + 3072)" },
];

export function construireAvecVarianteId(id: IdVarianteSommesTermes): ExerciceSommesTermes {
  switch (id) {
    case "arith-indices":
      return construireArithIndices();
    case "arith-extension":
      return construireArithExtension(parmi(["liste", "naturels", "multiples"] as const));
    case "geom-indices":
      return construireGeomIndices();
    case "geom-extension":
      return construireGeomExtension();
  }
}

/** Tirage libre : les quatre variantes à parts égales. */
export function genererExerciceSommesTermes(): ExerciceSommesTermes {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
