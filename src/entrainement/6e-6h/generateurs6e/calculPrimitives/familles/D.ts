import type { ExerciceFamilleD, ExerciceFamilleD1, ExerciceFamilleD2, ExerciceFamilleD3, ExerciceFamilleD4, ExerciceFamilleD5 } from "../../../core6e/calculPrimitives.types";
import { tirerEntierNonNul, tirerParmi } from "../aleatoire";

/**
 * Couche A (6e) — génération, famille D ("Intégration par parties") de `6gen23`. PAS de contrat de
 * réutilisation en aval (spec explicite : familles D/E/F exclues de 6gen24/25/26).
 *
 * **Formules fermées générées directement depuis le résultat mathématique connu** (jamais simulées
 * par un "moteur d'IBP" au runtime — trop fragile/complexe pour un gain nul, la primitive EXACTE
 * est connue analytiquement pour chacun des 5 sous-types, voir le commentaire de chaque
 * constructeur) — conforme à la clarification de la spec pour le sous-type 4 (cyclique),
 * généralisée ici aux 4 autres sous-types.
 *
 * Écrans 1-3 (sous-types 1-4 uniquement) ne portent que sur la PREMIÈRE application de l'IBP (u,
 * dv, du, v, uv, nouvelle intégrale SANS signe) — même pour le sous-type 2 (IBP répétée) et le
 * sous-type 4 (cyclique), où une 2e IBP + un peu d'algèbre restent à faire "sur la feuille" avant de
 * taper la réponse à l'écran 4 ("expression finale") : la spec ne décrit aucun champ dédié à cette
 * 2e étape (jamais de "Champ:" listé pour elle), seulement une AIDE textuelle au niveau 2 de l'écran
 * 4 pour le cas cyclique — voir `ui6e/formatCalculPrimitives.ts`.
 */

// ============================================================================
// Sous-type 1 — polynôme×trig, IBP unique.
// ============================================================================

/** f(x)=(ax+b)·cos(kx) [ou sin(kx)]. u=ax+b, dv=cos(kx)dx (ou sin(kx)dx). */
export function construireFamilleD1(): ExerciceFamilleD1 {
  const a = tirerEntierNonNul(1, 3);
  const b = tirerEntierNonNul(-3, 3);
  const kTrig = tirerParmi([1, 2, 3] as const);
  const trig = tirerParmi(["cos", "sin"] as const);

  const uReference = (x: number) => a * x + b;
  const uPrimeReference = () => a;
  const gReference = (x: number) => (trig === "cos" ? Math.cos(kTrig * x) : Math.sin(kTrig * x));
  const vReference = (x: number) => (trig === "cos" ? Math.sin(kTrig * x) / kTrig : -Math.cos(kTrig * x) / kTrig);
  const uvReference = (x: number) => uReference(x) * vReference(x);
  const integrandeVduReference = (x: number) => vReference(x) * uPrimeReference();
  const integrandeReference = (x: number) => uReference(x) * gReference(x);
  const primitiveReference =
    trig === "cos"
      ? (x: number) => ((a * x + b) * Math.sin(kTrig * x)) / kTrig + (a * Math.cos(kTrig * x)) / (kTrig * kTrig)
      : (x: number) => (-(a * x + b) * Math.cos(kTrig * x)) / kTrig + (a * Math.sin(kTrig * x)) / (kTrig * kTrig);

  return { famille: "D", sousType: "1", a, b, kTrig, trig, uReference, gReference, uPrimeReference, vReference, uvReference, integrandeVduReference, primitiveReference, integrandeReference };
}

// ============================================================================
// Sous-type 2 — polynôme (degré 2)×exp, IBP répétée.
// ============================================================================

/** f(x)=k·(x+c)²·e^(kExp x). Formule générale ∫P(x)e^(kx)dx = e^(kx)[P/k - P'/k² + P''/k³] pour P
 * de degré 2 (2 dérivations successives, s'arrête car P''' ≡ 0) — dérivée à la main pour
 * P(x)=(x+c)² : P'=2(x+c), P''=2. */
export function construireFamilleD2(): ExerciceFamilleD2 {
  const c = tirerEntierNonNul(-3, 3);
  const kExp = tirerParmi([1, 2, 3] as const);

  const uReference = (x: number) => Math.pow(x + c, 2);
  const uPrimeReference = (x: number) => 2 * (x + c);
  const gReference = (x: number) => Math.exp(kExp * x);
  const vReference = (x: number) => Math.exp(kExp * x) / kExp;
  const uvReference = (x: number) => uReference(x) * vReference(x);
  const integrandeVduReference = (x: number) => vReference(x) * uPrimeReference(x);
  const integrandeReference = (x: number) => uReference(x) * gReference(x);
  const primitiveReference = (x: number) => Math.exp(kExp * x) * (Math.pow(x + c, 2) / kExp - (2 * (x + c)) / (kExp * kExp) + 2 / Math.pow(kExp, 3));

  return { famille: "D", sousType: "2", c, kExp, uReference, gReference, uPrimeReference, vReference, uvReference, integrandeVduReference, primitiveReference, integrandeReference };
}

// ============================================================================
// Sous-type 3 — fonction seule déguisée en produit (dv=dx).
// ============================================================================

/** f(x)=k·ln(x) [x>0] ou k·arctan(x). u=ln(x) [ou arctan(x)], dv=dx ⇒ v=x. */
export function construireFamilleD3(): ExerciceFamilleD3 {
  const cyclo = tirerParmi(["ln", "arctan"] as const);
  const k = tirerEntierNonNul(1, 3);

  const uReference = cyclo === "ln" ? (x: number) => k * Math.log(x) : (x: number) => k * Math.atan(x);
  const uPrimeReference = cyclo === "ln" ? (x: number) => k / x : (x: number) => k / (1 + x * x);
  const gReference = () => 1;
  const vReference = (x: number) => x;
  const uvReference = (x: number) => uReference(x) * vReference(x);
  const integrandeVduReference = (x: number) => vReference(x) * uPrimeReference(x);
  const integrandeReference = (x: number) => uReference(x) * gReference();
  const primitiveReference = cyclo === "ln" ? (x: number) => k * (x * Math.log(x) - x) : (x: number) => k * (x * Math.atan(x) - 0.5 * Math.log(1 + x * x));

  return { famille: "D", sousType: "3", cyclo, k, uReference, gReference, uPrimeReference, vReference, uvReference, integrandeVduReference, primitiveReference, integrandeReference };
}

// ============================================================================
// Sous-type 4 — IBP cyclique, e^(kx)·trig(x).
// ============================================================================

/** f(x)=e^(kExp x)·sin(x) [ou cos(x)]. Résultat classique (2 IBP + résolution algébrique en I,
 * jamais simulée au runtime — connue analytiquement) :
 * ∫e^(kx)sin(x)dx = e^(kx)(k·sinx - cosx)/(k²+1) ; ∫e^(kx)cos(x)dx = e^(kx)(k·cosx + sinx)/(k²+1).
 * Écrans 1-3 posent la PREMIÈRE IBP (u=trig(x), dv=e^(kx)dx). */
export function construireFamilleD4(): ExerciceFamilleD4 {
  const kExp = tirerParmi([1, 2, 3] as const);
  const trig = tirerParmi(["sin", "cos"] as const);

  const uReference = trig === "sin" ? Math.sin : Math.cos;
  const uPrimeReference = trig === "sin" ? Math.cos : (x: number) => -Math.sin(x);
  const gReference = (x: number) => Math.exp(kExp * x);
  const vReference = (x: number) => Math.exp(kExp * x) / kExp;
  const uvReference = (x: number) => uReference(x) * vReference(x);
  const integrandeVduReference = (x: number) => vReference(x) * uPrimeReference(x);
  const integrandeReference = (x: number) => uReference(x) * gReference(x);
  const primitiveReference =
    trig === "sin"
      ? (x: number) => (Math.exp(kExp * x) * (kExp * Math.sin(x) - Math.cos(x))) / (kExp * kExp + 1)
      : (x: number) => (Math.exp(kExp * x) * (kExp * Math.cos(x) + Math.sin(x))) / (kExp * kExp + 1);

  return { famille: "D", sousType: "4", kExp, trig, uReference, gReference, uPrimeReference, vReference, uvReference, integrandeVduReference, primitiveReference, integrandeReference };
}

// ============================================================================
// Sous-type 5 — piège de simplification préalable, aucune IBP.
// ============================================================================

/** f(x)=k·base^x·e^x = k·(base·e)^x — écran unique direct (spec : "écran sauté"). */
export function construireFamilleD5(): ExerciceFamilleD5 {
  const base = tirerParmi([2, 3, 4] as const);
  const k = tirerEntierNonNul(1, 3);
  const baseE = base * Math.E;
  return {
    famille: "D",
    sousType: "5",
    base,
    k,
    integrandeReference: (x: number) => k * Math.pow(base, x) * Math.exp(x),
    primitiveReference: (x: number) => (k * Math.pow(baseE, x)) / Math.log(baseE),
  };
}

/** Tirage équiprobable du sous-type. */
export function construireFamilleD(): ExerciceFamilleD {
  const sousType = tirerParmi([1, 2, 3, 4, 5] as const);
  switch (sousType) {
    case 1:
      return construireFamilleD1();
    case 2:
      return construireFamilleD2();
    case 3:
      return construireFamilleD3();
    case 4:
      return construireFamilleD4();
    case 5:
      return construireFamilleD5();
  }
}
