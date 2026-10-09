import type { ExerciceLoiNormale, FamilleLoiNormale } from "../../core6e/loiNormale.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";
import { construireFamilleE } from "./familleE";

export { construireFamilleA } from "./familleA";
export { construireFamilleB } from "./familleB";
export { construireFamilleC } from "./familleC";
export { construireFamilleD } from "./familleD";
export { construireFamilleE } from "./familleE";
export { Phi, PhiInverse } from "./tableNormale";

/**
 * Couche A (6e) — point d'entrée `6gen51` ("Loi normale", chapitre "Variables aléatoires et lois de
 * probabilités"). Tirage à 2 niveaux (mirroir `generateurs6e/formeTrigonometrique/index.ts`,
 * 6gen37) : la FAMILLE (A à E) est tirée ÉQUIPROBABLE en premier, puis chaque `construireFamilleX`
 * tire son propre sous-type en interne (équiprobable également).
 *
 * `CATALOGUE_VARIANTES` détaille CHAQUE sous-type individuellement (5 familles × 2-3 sous-types
 * chacune) — chaque variante "significativement distincte" reste sélectionnable au panneau dev,
 * convention CLAUDE.md. Comme aucun `construireFamilleX(sousType)` n'accepte de paramètre forçant
 * le sous-type (les générateurs de famille tirent leur sous-type en interne), le panneau dev "force"
 * une variante par RE-TIRAGE jusqu'à obtenir le bon sous-type (boucle bornée, jamais infinie en
 * pratique — 3 sous-types équiprobables au maximum, voir `construireAvecVarianteId`) plutôt que
 * d'ajouter un paramètre optionnel à chaque `construireFamilleX` (aurait dupliqué la logique de
 * sous-type à 2 endroits, risque de désynchronisation).
 */

export type IdVarianteLoiNormale = "A_inferieur" | "A_superieur" | "A_intervalle" | "B_inferieur" | "B_superieur" | "B_intervalle" | "C_cumulee" | "C_symetrique" | "C_encadree" | "D_cumulee" | "D_symetrique" | "D_encadree" | "E_deuxCotes" | "E_unCote";

export const CATALOGUE_VARIANTES: { id: IdVarianteLoiNormale; label: string }[] = [
  { id: "A_inferieur", label: "A — Centrée réduite, P(Z≤z)" },
  { id: "A_superieur", label: "A — Centrée réduite, P(Z≥z)" },
  { id: "A_intervalle", label: "A — Centrée réduite, P(z1≤Z≤z2)" },
  { id: "B_inferieur", label: "B — Générale N(μ,σ), P(X≤x)" },
  { id: "B_superieur", label: "B — Générale N(μ,σ), P(X≥x)" },
  { id: "B_intervalle", label: "B — Générale N(μ,σ), P(x1≤X≤x2)" },
  { id: "C_cumulee", label: "C — Sens inverse, P(Z≤t)=p" },
  { id: "C_symetrique", label: "C — Sens inverse, P(0≤Z≤t)=p" },
  { id: "C_encadree", label: "C — Sens inverse, P(t≤Z≤k)=p" },
  { id: "D_cumulee", label: "D — Générale sens inverse, P(X≤a)=p" },
  { id: "D_symetrique", label: "D — Générale sens inverse, P(μ≤X≤a)=p" },
  { id: "D_encadree", label: "D — Générale sens inverse, P(a≤X≤b)=p" },
  { id: "E_deuxCotes", label: "E — Règle empirique, hors intervalle (2 côtés)" },
  { id: "E_unCote", label: "E — Règle empirique, un seul côté (piège)" },
];

const NOMBRE_MAX_RETIRAGES = 500;

function retirerJusqua<T>(construire: () => T, correspond: (v: T) => boolean): T {
  for (let i = 0; i < NOMBRE_MAX_RETIRAGES; i++) {
    const v = construire();
    if (correspond(v)) return v;
  }
  /* c8 ignore next */
  throw new Error("retirerJusqua : sous-type cible non atteint après un grand nombre de tirages");
}

export function construireAvecVarianteId(id: IdVarianteLoiNormale): ExerciceLoiNormale {
  switch (id) {
    case "A_inferieur":
      return retirerJusqua(construireFamilleA, (e) => e.sousType === "inferieur");
    case "A_superieur":
      return retirerJusqua(construireFamilleA, (e) => e.sousType === "superieur");
    case "A_intervalle":
      return retirerJusqua(construireFamilleA, (e) => e.sousType === "intervalle");
    case "B_inferieur":
      return retirerJusqua(construireFamilleB, (e) => e.sousType === "inferieur");
    case "B_superieur":
      return retirerJusqua(construireFamilleB, (e) => e.sousType === "superieur");
    case "B_intervalle":
      return retirerJusqua(construireFamilleB, (e) => e.sousType === "intervalle");
    case "C_cumulee":
      return retirerJusqua(construireFamilleC, (e) => e.sousType === "cumulee");
    case "C_symetrique":
      return retirerJusqua(construireFamilleC, (e) => e.sousType === "symetrique");
    case "C_encadree":
      return retirerJusqua(construireFamilleC, (e) => e.sousType === "encadree");
    case "D_cumulee":
      return retirerJusqua(construireFamilleD, (e) => e.sousType === "cumulee");
    case "D_symetrique":
      return retirerJusqua(construireFamilleD, (e) => e.sousType === "symetrique");
    case "D_encadree":
      return retirerJusqua(construireFamilleD, (e) => e.sousType === "encadree");
    case "E_deuxCotes":
      return retirerJusqua(construireFamilleE, (e) => !e.unCote);
    case "E_unCote":
      return retirerJusqua(construireFamilleE, (e) => e.unCote);
  }
}

const FAMILLES: FamilleLoiNormale[] = ["A", "B", "C", "D", "E"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleLoiNormale, () => ExerciceLoiNormale> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
  E: construireFamilleE,
};

export function genererExerciceLoiNormale(): ExerciceLoiNormale {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
