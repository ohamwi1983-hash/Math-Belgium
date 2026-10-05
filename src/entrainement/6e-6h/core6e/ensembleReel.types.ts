/**
 * Couche core (6e) — `EnsembleReelGuide`, motif PARTAGÉ entre plusieurs générateurs 6e (6gen1
 * "Fonctions injectives/surjectives/bijectives", 6gen3 "Équations avec fonctions cyclométriques" —
 * la condition d'existence de la famille 3 est toujours un intervalle borné, une même forme que
 * le domaine/l'image de 6gen1). Extrait de `injectiviteFonctions.types.ts` (où il vivait
 * initialement, seul consommateur à l'époque) dès qu'un second générateur en a eu besoin — même
 * principe déjà établi côté 5e pour `parametresSinusoide.ts` (5gen8/5gen9). Reprend la même
 * structure que `EnsembleReelGuide` de 5gen1 (`core5e/domaineDefinition.types.ts`) — RÉPLIQUÉE,
 * jamais importée (voir CLAUDE.md, isolation entre chantiers).
 */
export type FormeEnsembleReel = "reel" | "prive_points" | "intervalles";

export interface MorceauIntervalle {
  inf: number | null;
  sup: number | null;
  infInclus: boolean;
  supInclus: boolean;
}

export interface EnsembleReelGuide {
  forme: FormeEnsembleReel;
  /** uniquement pour `forme === "prive_points"`, triés croissant. */
  points: number[];
  /** uniquement pour `forme === "intervalles"`, triés par borne inf croissante. */
  morceaux: MorceauIntervalle[];
}
