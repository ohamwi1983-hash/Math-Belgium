import type { ExerciceLimitesRef, VarianteLimitesRef } from "../../core6e/limitesReference.types";
import { entier, parmi } from "../../ui6e/nombresExp";

/**
 * Couche A — générateur de 6gen145 « Limites de référence et croissances comparées ». `Math.random()`
 * seul (le `?code=` rejoue le tirage). Sous-types par variante (la forme de l'écran 1 et la
 * référence de l'écran 2 en découlent : la variante est un VERDICT, d'où le groupe à verdict de
 * l'adaptateur) :
 * - `expo0` (x → 0) : (e^{kx} − 1)/(mx) → k/m ; mx/(e^{kx} − 1) → m/k ; (e^{kx} − e^{jx})/(mx) → (k − j)/m ;
 * - `base0` (x → 0) : (a^{kx} − 1)/(mx) → (k/m)·ln a ; (aˣ − bˣ)/x → ln a − ln b ;
 * - `plusInfini` (x → +∞) : c·xⁿ/aˣ → 0 ; aˣ/(c·xⁿ) → +∞ ; c·xⁿ·e^{−kx} → 0 ; aˣ − c·xⁿ → +∞ ;
 * - `moinsInfini` (x → −∞) : c·xⁿ·aˣ (+ d) → 0 (ou d), base e^{k} ou 2, 3 ;
 * - `pasFI` : xⁿ·aˣ → +∞ et aˣ + c·xⁿ → +∞ (x → +∞), xⁿ/aˣ → ±∞ et (e^{kx} + c)/x → 0 (x → −∞).
 * Base a = 0 code e. Valeurs toutes exactes.
 */

export type IdVarianteLimitesRef = VarianteLimitesRef;

export const CATALOGUE_VARIANTES: { id: IdVarianteLimitesRef; label: string }[] = [
  { id: "expo0", label: "En 0 : (eᵘ − 1)/u → 1" },
  { id: "base0", label: "En 0 : (aˣ − 1)/x → ln a" },
  { id: "plusInfini", label: "En +∞ : l'exponentielle l'emporte sur xⁿ" },
  { id: "moinsInfini", label: "En −∞ : xⁿ·aˣ → 0 (a > 1)" },
  { id: "pasFI", label: "Pas une forme indéterminée" },
];

function base(): ExerciceLimitesRef {
  return { variante: "expo0", sousType: "", point: "0", k: 0, m: 1, j: 0, a: 0, b: 0, n: 1, c: 1, d: 0 };
}

const K_NON_NUL = [-3, -2, 2, 3, 4, 5];

function expo0(): ExerciceLimitesRef {
  const st = parmi(["quotient", "inverse", "difference"] as const);
  for (;;) {
    const k = parmi(K_NON_NUL);
    const m = entier(1, 5);
    if (st !== "difference" && Math.abs(k) === m) continue;
    if (st === "difference") {
      const j = parmi([-2, -1, 1, 2, 3]);
      if (j === k) continue;
      return { ...base(), variante: "expo0", sousType: st, k, m, j };
    }
    return { ...base(), variante: "expo0", sousType: st, k, m };
  }
}

function base0(): ExerciceLimitesRef {
  const st = parmi(["quotient", "difference"] as const);
  if (st === "difference") {
    const a = parmi([2, 3, 5, 7]);
    let b = parmi([2, 3, 5, 7]);
    while (b === a) b = parmi([2, 3, 5, 7]);
    return { ...base(), variante: "base0", sousType: st, a, b };
  }
  for (;;) {
    const a = parmi([2, 3, 5, 10]);
    const k = parmi([1, 2, 3, -1, -2]);
    const m = entier(1, 4);
    if (k === m) continue; // la limite vaudrait ln a : on garde un coefficient visible
    return { ...base(), variante: "base0", sousType: st, a, k, m };
  }
}

function plusInfini(): ExerciceLimitesRef {
  const st = parmi(["quotient", "inverse", "produit", "difference"] as const);
  const a = parmi([0, 2, 3]);
  const n = parmi([2, 3, 4, 5, 10, 20]);
  const c = parmi([1, 2, 3, 5]);
  const k = parmi([1, 2, 3]);
  return { ...base(), variante: "plusInfini", sousType: st, point: "+inf", a: st === "produit" ? 0 : a, n, c, k };
}

function moinsInfini(): ExerciceLimitesRef {
  const a = parmi([0, 0, 2, 3]);
  const k = a === 0 ? parmi([1, 2, 3]) : 1;
  const n = parmi([1, 2, 3, 4, 5]);
  const c = parmi([1, 2, 3, -1, -2]);
  const d = Math.random() < 0.4 ? parmi([-3, -2, -1, 1, 2, 3]) : 0;
  return { ...base(), variante: "moinsInfini", sousType: d === 0 ? "produit" : "produitPlusD", point: "-inf", a, k, n, c, d };
}

function pasFI(): ExerciceLimitesRef {
  const st = parmi(["produitInfini", "sommeInfini", "quotientMoins", "quotientZero"] as const);
  const a = parmi([0, 2, 3]);
  const n = parmi([2, 3, 4, 5]);
  const c = parmi([1, 2, 3]);
  if (st === "quotientZero") return { ...base(), variante: "pasFI", sousType: st, point: "-inf", a: 0, k: parmi([1, 2, 3]), c: parmi([-3, -2, -1, 1, 2, 3]) };
  return { ...base(), variante: "pasFI", sousType: st, point: st === "quotientMoins" ? "-inf" : "+inf", a, n, c };
}

export function construireAvecVariante(id: string): ExerciceLimitesRef {
  switch (id as IdVarianteLimitesRef) {
    case "base0":
      return base0();
    case "plusInfini":
      return plusInfini();
    case "moinsInfini":
      return moinsInfini();
    case "pasFI":
      return pasFI();
    default:
      return expo0();
  }
}

export function genererExerciceLimitesRef(): ExerciceLimitesRef {
  return construireAvecVariante(parmi(CATALOGUE_VARIANTES).id);
}
