import type { ExerciceFamilleA, ExerciceFamilleA_Direct, ExerciceFamilleA_DiviserFraction, ExerciceFamilleA_DiviserProduit, TermeA, TypeTermeA } from "../../../core6e/calculPrimitives.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";

/**
 * Couche A (6e) — génération, famille A ("Primitives immédiates") de `6gen23`.
 *
 * **Réexporté pour réutilisation en aval (6gen24/25/26, voir l'en-tête de
 * `core6e/calculPrimitives.types.ts`)** : `construireFamilleA` (tirage équiprobable du sous-type),
 * plus les 3 constructeurs granulaires `construireFamilleADirecte`/
 * `construireFamilleADiviserFraction`/`construireFamilleADiviserProduit`.
 *
 * Sous-type "direct" : 3 ou 4 TERMES DISTINCTS (jamais 2 fois le même type) parmi les 8 formes de
 * la spec — modèle `TermeA` générique (évaluation ET primitive tirées d'une seule table
 * `evaluerTermeA`/`primitiveTermeA`, jamais dupliquées par type).
 */

const TOUS_TYPES_TERMES: TypeTermeA[] = ["invX", "puissance", "expX", "cosX", "baseX", "arctanTerme", "arcsinTerme", "constante"];
const BASES_POSSIBLES = [2, 3, 5] as const;

function tirerTermesDistincts(nombre: number): TermeA[] {
  const types = [...TOUS_TYPES_TERMES];
  const choisis: TypeTermeA[] = [];
  for (let i = 0; i < nombre; i++) {
    const idx = Math.floor(Math.random() * types.length);
    choisis.push(types.splice(idx, 1)[0]);
  }
  return choisis.map((type): TermeA => {
    const coef = tirerEntierNonNul(-5, 5);
    if (type === "puissance") return { type, coef, n: tirerEntier(1, 4) };
    if (type === "baseX") return { type, coef, base: tirerParmi(BASES_POSSIBLES) };
    return { type, coef };
  });
}

export function evaluerTermeA(t: TermeA, x: number): number {
  switch (t.type) {
    case "invX":
      return t.coef / x;
    case "puissance":
      return t.coef * Math.pow(x, t.n as number);
    case "expX":
      return t.coef * Math.exp(x);
    case "cosX":
      return t.coef * Math.cos(x);
    case "baseX":
      return t.coef * Math.pow(t.base as number, x);
    case "arctanTerme":
      return t.coef / (1 + x * x);
    case "arcsinTerme":
      return t.coef / Math.sqrt(1 - x * x);
    case "constante":
      return t.coef;
  }
}

export function primitiveTermeA(t: TermeA, x: number): number {
  switch (t.type) {
    case "invX":
      return t.coef * Math.log(Math.abs(x));
    case "puissance": {
      const n = t.n as number;
      return (t.coef / (n + 1)) * Math.pow(x, n + 1);
    }
    case "expX":
      return t.coef * Math.exp(x);
    case "cosX":
      return t.coef * Math.sin(x);
    case "baseX":
      return (t.coef * Math.pow(t.base as number, x)) / Math.log(t.base as number);
    case "arctanTerme":
      return t.coef * Math.atan(x);
    case "arcsinTerme":
      return t.coef * Math.asin(x);
    case "constante":
      return t.coef * x;
  }
}

export function construireFamilleADirecte(): ExerciceFamilleA_Direct {
  const nombre = tirerParmi([3, 4] as const);
  const termes = tirerTermesDistincts(nombre);
  return {
    famille: "A",
    sousType: "direct",
    termes,
    integrandeReference: (x) => termes.reduce((acc, t) => acc + evaluerTermeA(t, x), 0),
    primitiveReference: (x) => termes.reduce((acc, t) => acc + primitiveTermeA(t, x), 0),
  };
}

/** p,q ∈ {3,4,5} distincts, r ∈ {1,2} — garantit p-r,q-r ∈ [1,4] (jamais l'exposant -1, qui
 * introduirait le cas spécial ln|x| non prévu par ce sous-type). */
export function construireFamilleADiviserFraction(): ExerciceFamilleA_DiviserFraction {
  const [p, q] = (() => {
    const candidats = [3, 4, 5];
    const i = tirerEntier(0, 2);
    const p = candidats[i];
    const reste = candidats.filter((_, idx) => idx !== i);
    const q = tirerParmi(reste);
    return [p, q];
  })();
  const r = tirerParmi([1, 2] as const);
  const a = tirerEntierNonNul(-4, 4);
  const b = tirerEntierNonNul(-4, 4);
  const pr = p - r;
  const qr = q - r;
  return {
    famille: "A",
    sousType: "diviserFraction",
    a,
    p,
    b,
    q,
    r,
    rewrittenReference: (x) => a * Math.pow(x, pr) + b * Math.pow(x, qr),
    integrandeReference: (x) => (a * Math.pow(x, p) + b * Math.pow(x, q)) / Math.pow(x, r),
    primitiveReference: (x) => (a / (pr + 1)) * Math.pow(x, pr + 1) + (b / (qr + 1)) * Math.pow(x, qr + 1),
  };
}

export function construireFamilleADiviserProduit(): ExerciceFamilleA_DiviserProduit {
  const c = tirerEntierNonNul(-4, 4);
  const k = tirerEntier(0, 3);
  const exposant = k + 0.5;
  return {
    famille: "A",
    sousType: "diviserProduit",
    c,
    k,
    rewrittenReference: (x) => c * Math.pow(x, exposant),
    integrandeReference: (x) => c * Math.pow(x, k) * Math.sqrt(x),
    primitiveReference: (x) => (c / (exposant + 1)) * Math.pow(x, exposant + 1),
  };
}

/** Tirage équiprobable du sous-type — nom stable réutilisé en aval (voir en-tête
 * `core6e/calculPrimitives.types.ts`). */
export function construireFamilleA(): ExerciceFamilleA {
  const sousType = tirerParmi(["direct", "diviserFraction", "diviserProduit"] as const);
  if (sousType === "direct") return construireFamilleADirecte();
  if (sousType === "diviserFraction") return construireFamilleADiviserFraction();
  return construireFamilleADiviserProduit();
}
