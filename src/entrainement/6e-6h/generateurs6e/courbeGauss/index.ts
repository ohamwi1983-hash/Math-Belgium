import type { AireCG, ExerciceCG, QuestionRegle, TypeAire, VarianteCG } from "../../core6e/courbeGauss";
import { IDS_PHI_DEUX, IDS_PHI_UNE, TYPES_AIRE } from "../../core6e/courbeGauss";
import { entier, melanger, parmi } from "../../ui6e/nombresCombinatoireLotH2";

/**
 * Couche A — générateur de `6gen117` « Courbe de Gauss : aires et règle empirique ». `Math.random()`
 * seul (le `?code=` rejoue le tirage). Aires : le TYPE (gauche, droite, entre, deux queues) est tiré au
 * quart EN PREMIER, puis les bornes au dixième (|z| entre 0,3 et 2,5), puis l'ordre des quatre
 * candidates et celui des écritures avec Φ. Règle empirique : contexte, μ et σ entiers, k ∈ {1, 2, 3},
 * puis la question (dedans / dehors, ou un seul côté).
 */

export const CATALOGUE_VARIANTES: { id: VarianteCG; label: string }[] = [
  { id: "aire", label: "Aire colorée → probabilité et Φ" },
  { id: "figure", label: "Probabilité → figure (A, B, C ou D) et Φ" },
  { id: "regleEntre", label: "Règle empirique : dans ou hors de [μ − kσ ; μ + kσ]" },
  { id: "regleUnCote", label: "Règle empirique : un seul côté" },
];

/** Contextes de la règle empirique : μ et σ (entiers) — `ctx` indexe `CONTEXTES_REGLE` (textes). */
const MU_SIGMA: (() => { mu: number; sigma: number })[] = [
  () => ({ mu: entier(160, 180), sigma: entier(5, 9) }),
  () => ({ mu: parmi([250, 500, 750, 1000]), sigma: entier(4, 12) }),
  () => ({ mu: entier(16, 24) * 50, sigma: entier(4, 10) * 10 }),
  () => ({ mu: entier(25, 45), sigma: entier(3, 6) }),
];

const dixieme = (min: number, max: number) => entier(Math.round(min * 10), Math.round(max * 10)) / 10;

function aire(type: TypeAire): AireCG {
  switch (type) {
    case "gauche":
    case "droite": {
      const u = dixieme(0.3, 2.5);
      return { type, a: Math.random() < 0.5 ? u : -u, b: 0 };
    }
    case "entre":
      for (;;) {
        const a = dixieme(-2.2, 1.8);
        const b = dixieme(0.3, 2.5);
        if (b - a >= 0.5 && Math.abs(a + b) > 0.05) return { type, a, b };
      }
    case "queues":
      for (;;) {
        const a = -dixieme(0.3, 2.5);
        const b = dixieme(0.3, 2.5);
        if (Math.abs(a + b) > 0.05) return { type, a, b };
      }
  }
}

const QUESTIONS: Record<"regleEntre" | "regleUnCote", QuestionRegle[]> = {
  regleEntre: ["entre", "hors"],
  regleUnCote: ["auDela", "enDeca", "moitieHaut", "moitieBas", "sous", "dessus"],
};

export function construire(v: VarianteCG): ExerciceCG {
  const base = { variante: v, ctx: 0, mu: 0, sigma: 1, k: 1 as 1 | 2 | 3, question: "entre" as QuestionRegle };
  if (v === "aire" || v === "figure") {
    const type = parmi(TYPES_AIRE);
    const a = aire(type);
    const une = type === "gauche" || type === "droite";
    return { ...base, aire: a, ordre: melanger([0, 1, 2, 3]), ordrePhi: melanger(une ? IDS_PHI_UNE : IDS_PHI_DEUX) };
  }
  const ctx = entier(0, MU_SIGMA.length - 1);
  const { mu, sigma } = MU_SIGMA[ctx]!();
  const k = parmi([1, 2, 3] as const);
  return { ...base, aire: { type: "entre", a: 0, b: 0 }, ordre: [0, 1, 2, 3], ordrePhi: [], ctx, mu, sigma, k, question: parmi(QUESTIONS[v]) };
}

export function construireAvecVariante(id: string): ExerciceCG {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceCG(): ExerciceCG {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
