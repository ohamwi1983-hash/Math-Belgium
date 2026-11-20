import type { ExerciceLireTransformee, VarianteLireTransformee } from "../../core6e/lireTransformeeArc";
import { q, qVal } from "../../../5e-4h/ui5e/nombresTrigo";

/**
 * Couche A — générateur de `6gen158` « Lire une transformée c + k·arc(mx + n) ». `Math.random()` seul
 * (`?code=`). m ∈ {1, 1/2} (largeur du domaine 2 ou 4 ; pour arctan, point marqué à 1 ou 2 unités du
 * centre), centre x₀ entier, c multiple de π/4, k tel que les bornes de l'image tombent sur des lignes
 * en multiples de π/4 : arcsin k ∈ {±1/2, ±1, ±2}, arccos k ∈ {±1/2, ±1}, arctan k ∈ {±1, ±2} ; signe
 * de k tiré 50/50 (sens de variation). Image tenue dans [−7π/4 ; 7π/4].
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}

const C_PI = [q(-1, 2), q(-1, 4), q(0), q(1, 4), q(1, 2)];

export function construire(variante: VarianteLireTransformee): ExerciceLireTransformee {
  for (;;) {
    const m = parmi([q(1), q(1, 2)]);
    const demi = 1 / qVal(m);
    const x0 = variante === "arctan" ? parmi([-2, -1, 0, 1, 2]) : parmi([-3, -2, -1, 0, 1, 2, 3].filter((x) => Math.abs(x) + demi <= 4));
    const absK = variante === "arcsin" ? parmi([q(1, 2), q(1), q(2)]) : variante === "arccos" ? parmi([q(1, 2), q(1)]) : parmi([q(1), q(2)]);
    const k = Math.random() < 0.5 ? absK : q(-absK.n, absK.d);
    const cPi = parmi(C_PI);
    const c = qVal(cPi);
    const kk = qVal(k);
    // Bornes de l'image (en multiples de π).
    const [lo, hi] = variante === "arccos" ? [Math.min(c, c + kk), Math.max(c, c + kk)] : [c - Math.abs(kk) / 2, c + Math.abs(kk) / 2];
    if (lo < -1.75 - 1e-9 || hi > 1.75 + 1e-9) continue;
    return { variante, m, x0, k, cPi, cleCollecteur: `${variante}/${kk > 0 ? "k+" : "k-"}` };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteLireTransformee; label: string }[] = [
  { id: "arcsin", label: "c + k·arcsin(mx + n)" },
  { id: "arccos", label: "c + k·arccos(mx + n)" },
  { id: "arctan", label: "c + k·arctan(mx + n)" },
];

export function construireAvecVarianteId(id: VarianteLireTransformee): ExerciceLireTransformee {
  return construire(id);
}

export function genererExerciceLireTransformee(): ExerciceLireTransformee {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
