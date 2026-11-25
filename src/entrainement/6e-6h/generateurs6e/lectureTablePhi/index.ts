import type { ExerciceLTP, VarianteLTP } from "../../core6e/lectureTablePhi";
import { OPTIONS_ECRITURE } from "../../core6e/lectureTablePhi";
import { caseLaPlusProche, phiTable } from "../../core6e/tablePhi";
import { entier, melanger, parmi } from "../../ui6e/nombresCombinatoireLotH2";

/**
 * Couche A — générateur de `6gen116` « Lire la table de Φ ». `Math.random()` seul (le `?code=` rejoue
 * le tirage). Les z sont tirés au centième dans [0,10 ; 3,29] ; en sens inverse, la probabilité donnée
 * est une valeur de la table une fois sur deux (lecture exacte) et, sinon, une valeur à un ou deux
 * dix-millièmes d'une case, la plus proche étant UNIQUE (jamais à mi-chemin de deux cases).
 */

export const CATALOGUE_VARIANTES: { id: VarianteLTP; label: string }[] = [
  { id: "directe", label: "Lecture directe : P(Z ≤ a)" },
  { id: "complement", label: "Complément : P(Z ≥ a)" },
  { id: "symetrie", label: "Symétrie : P(Z ≤ −a)" },
  { id: "intervalle", label: "Intervalle : P(a ≤ Z ≤ b)" },
  { id: "inverse", label: "Sens inverse : z tel que P(Z ≤ z) = p" },
  { id: "inverseSymetrie", label: "Sens inverse avec symétrie (P(Z ≥ z) = q, ou p < 0,5)" },
];

const zAu = (min: number, max: number) => entier(Math.round(min * 100), Math.round(max * 100)) / 100;

/** Probabilité donnée en sens inverse et la case attendue. */
function probaInverse(): { p: number; z: number } {
  for (;;) {
    const i = entier(10, 250);
    const t = phiTable(i / 100);
    const p = Math.random() < 0.5 ? t : Math.round((t + parmi([-2, -1, 1, 2]) * 1e-4) * 1e4) / 1e4;
    const c = caseLaPlusProche(p);
    if (!c.unique || Math.round(c.z * 100) !== i) continue;
    return { p, z: i / 100 };
  }
}

export function construire(v: VarianteLTP): ExerciceLTP {
  const base: ExerciceLTP = { variante: v, a: 0, b: 0, aNeg: false, strict: false, p: 0, z: 0, sens: "inf", options: [] };
  switch (v) {
    case "directe":
      return { ...base, a: zAu(0.1, 3.29) };
    case "complement":
      return { ...base, a: zAu(0.1, 3.29), strict: Math.random() < 0.5, options: melanger(OPTIONS_ECRITURE.complement) };
    case "symetrie":
      return { ...base, a: zAu(0.1, 3.29), options: melanger(OPTIONS_ECRITURE.symetrie) };
    case "intervalle": {
      const aNeg = Math.random() < 0.5;
      for (;;) {
        const a = zAu(0.1, 2.9);
        const b = zAu(0.1, 2.9);
        if (!aNeg && b - a < 0.3) continue;
        if (aNeg && Math.abs(a - b) < 0.05) continue;
        return { ...base, a, b, aNeg, options: melanger(aNeg ? OPTIONS_ECRITURE.intervalleNeg : OPTIONS_ECRITURE.intervalle) };
      }
    }
    case "inverse": {
      const { p, z } = probaInverse();
      return { ...base, p, z };
    }
    case "inverseSymetrie": {
      const sens = Math.random() < 0.5 ? "inf" : "sup";
      const { p: t, z } = probaInverse();
      // P(Z ≥ z) = 1 − t (z > 0) ou P(Z ≤ z) = 1 − t (z < 0).
      return { ...base, sens, p: Math.round((1 - t) * 1e4) / 1e4, z: sens === "sup" ? z : -z };
    }
  }
}

export function construireAvecVariante(id: string): ExerciceLTP {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceLTP(): ExerciceLTP {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
