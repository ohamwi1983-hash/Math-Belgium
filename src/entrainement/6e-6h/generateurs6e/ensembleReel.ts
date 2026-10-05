import type { EnsembleReelGuide, MorceauIntervalle } from "../core6e/ensembleReel.types";

/** Petites fabriques pures pour construire un `EnsembleReelGuide` — Couche A, PARTAGÉES entre
 * générateurs 6e (6gen1, 6gen3 — voir `core6e/ensembleReel.types.ts` pour la justification de ce
 * partage). Aucune logique de vérification ici (voir `moteur6e/verificationEnsembleReel.ts`). */

export function ensembleReel(): EnsembleReelGuide {
  return { forme: "reel", points: [], morceaux: [] };
}

export function ensemblePrivePoints(points: number[]): EnsembleReelGuide {
  return { forme: "prive_points", points: [...points].sort((a, b) => a - b), morceaux: [] };
}

export function ensembleUnMorceau(morceau: MorceauIntervalle): EnsembleReelGuide {
  return { forme: "intervalles", points: [], morceaux: [morceau] };
}

export function ensembleDeuxMorceaux(m1: MorceauIntervalle, m2: MorceauIntervalle): EnsembleReelGuide {
  const morceaux = [m1, m2].sort((a, b) => (a.inf ?? -Infinity) - (b.inf ?? -Infinity));
  return { forme: "intervalles", points: [], morceaux };
}

/** `[borne;+∞[` */
export function versLeHautDepuis(borne: number, inclus: boolean): MorceauIntervalle {
  return { inf: borne, sup: null, infInclus: inclus, supInclus: false };
}

/** `]-∞;borne]` */
export function versLeBasJusque(borne: number, inclus: boolean): MorceauIntervalle {
  return { inf: null, sup: borne, infInclus: false, supInclus: inclus };
}

/** Intervalle FERMÉ `[inf;sup]` — nécessaire pour les CE bornées de 6gen3 (arguments d'arcsin/
 * arccos, toujours des intervalles fermés puisque le domaine [-1;1] est lui-même fermé). */
export function intervalleFerme(inf: number, sup: number): MorceauIntervalle {
  return { inf, sup, infInclus: true, supInclus: true };
}

export const ENSEMBLE_R_PLUS: EnsembleReelGuide = ensembleUnMorceau(versLeHautDepuis(0, true));
