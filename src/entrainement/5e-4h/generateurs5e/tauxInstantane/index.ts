import type { ExerciceTauxInstantane, VarianteTauxInstantane } from "../../core5e/tauxInstantane";
import { tauxInstantane, tauxMoyen, valeur } from "../../core5e/tauxInstantane";

/**
 * Couche A — générateur de `5gen70` « Taux de variation instantané en contexte ». `Math.random()`
 * seul (le `?code=` rejoue le tirage). Le SIGNE de f′(a) est tiré AVANT la boucle (moitié / moitié) :
 * - température : T(t) = −0,5t² + t_v·t + γ (t_v de 4 à 7, γ de 2 à 10, t ∈ [0 ; 12]) ;
 * - altitude : h(t) = −t³ + 3k·t² + δ (k de 2 à 4, t ∈ [0 ; 3k]) ;
 * - bénéfice : B(q) = −0,5q² + βq − γ (β ∈ {30, 40, 50, 60}, q ∈ [0 ; 2β]) ;
 * - population : N(t) = 0,5t² − t_v·t + γ (t_v de 4 à 10, t ∈ [0 ; 20], minimum ≥ 10).
 * Rejet : taux moyen égal à f′(a) ou f(a) égal à f′(a) (une phrase fausse deviendrait vraie).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j]!, t[i]!];
  }
  return t;
}

function tirer(variante: VarianteTauxInstantane, signe: number): Omit<ExerciceTauxInstantane, "ordreUnites" | "ordreInterpretations"> | null {
  if (variante === "temperature") {
    const tv = entier(4, 7);
    const g = entier(2, 10);
    const a = signe > 0 ? entier(1, tv - 1) : entier(tv + 1, 11);
    const b = a + parmi([1, 2, 4]);
    if (b > 12) return null;
    return { variante, coefs: [-0.5, tv, g], a, b, tmax: 12 };
  }
  if (variante === "altitude") {
    const k = entier(2, 4);
    const delta = parmi([0, 5, 10, 20]);
    const a = signe > 0 ? entier(1, 2 * k - 1) : entier(2 * k + 1, 3 * k - 1);
    const b = a + parmi([1, 2]);
    if (b > 3 * k) return null;
    return { variante, coefs: [-1, 3 * k, 0, delta], a, b, tmax: 3 * k };
  }
  if (variante === "benefice") {
    const beta = parmi([30, 40, 50, 60]);
    const g = parmi([100, 200, 300, 400]);
    const a = signe > 0 ? beta - entier(5, 25) : beta + entier(5, 25);
    const b = a + parmi([1, 2, 4, 5, 10]);
    if (b > 2 * beta) return null;
    return { variante, coefs: [-0.5, beta, -g], a, b, tmax: 2 * beta };
  }
  const tv = entier(4, 10);
  const g = entier(Math.ceil(0.5 * tv * tv) + 10, 90);
  const a = signe < 0 ? entier(1, tv - 1) : entier(tv + 1, 18);
  const b = a + parmi([1, 2, 4]);
  if (b > 20) return null;
  return { variante, coefs: [0.5, -tv, g], a, b, tmax: 20 };
}

export function construire(variante: VarianteTauxInstantane): ExerciceTauxInstantane {
  const signe = Math.random() < 0.5 ? -1 : 1;
  for (;;) {
    const x = tirer(variante, signe);
    if (!x) continue;
    const e: ExerciceTauxInstantane = { ...x, ordreUnites: melange(4), ordreInterpretations: melange(4) };
    const v = tauxInstantane(e);
    if (v === 0 || Math.sign(v) !== signe) continue;
    if (tauxMoyen(e) === v || valeur(e, e.a) === v) continue;
    return e;
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteTauxInstantane; label: string }[] = [
  { id: "temperature", label: "Température (°C/h)" },
  { id: "altitude", label: "Altitude d'un drone (m/s)" },
  { id: "benefice", label: "Bénéfice (€/pièce)" },
  { id: "population", label: "Population (milliers d'habitants par an)" },
];

export function construireAvecVarianteId(id: string): ExerciceTauxInstantane {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceTauxInstantane(): ExerciceTauxInstantane {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
