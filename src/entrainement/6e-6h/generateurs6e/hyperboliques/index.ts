import type { ExerciceHyperboliques, FamilleHyperboliques } from "../../core6e/hyperboliques.types";
import { construireA, construireAAvecType } from "./familles/A";
import { construireB, construireBTrouverCh, construireBTrouverSh } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";

/**
 * Couche A (6e) — point d'entrée public pour `6gen19`. `CATALOGUE_VARIANTES` expose une entrée par
 * TYPE/SOUS-TYPE (pas seulement par famille, contrairement à `6gen16`) — nécessaire pour que le
 * panneau dev (`SelecteurVarianteDev`) et Playwright puissent atteindre déterministement chaque cas
 * particulier, en particulier le piège "sh(x)² est PAIRE" (famille A) et les 2 sous-types de la
 * famille B (avec/sans signe de x0 précisé).
 */
export type VarianteId =
  | "A_shKx"
  | "A_chKx"
  | "A_shChProduit"
  | "A_shCarre"
  | "A_chCarre"
  | "A_shPlusCh"
  | "A_shMoinsCh"
  | "B_trouverCh"
  | "B_trouverShSansSigne"
  | "B_trouverShSignePlus"
  | "B_trouverShSigneMoins"
  | "C"
  | "D";

export const CATALOGUE_VARIANTES: { id: VarianteId; label: string }[] = [
  { id: "A_shKx", label: "A — sh(kx) [impaire]" },
  { id: "A_chKx", label: "A — ch(kx) [paire]" },
  { id: "A_shChProduit", label: "A — sh(x)·ch(x) [impaire]" },
  { id: "A_shCarre", label: "A — sh(x)² [PAIRE — piège]" },
  { id: "A_chCarre", label: "A — ch(x)² [paire]" },
  { id: "A_shPlusCh", label: "A — sh(x)+ch(x) [ni l'une ni l'autre]" },
  { id: "A_shMoinsCh", label: "A — sh(x)−ch(x) [ni l'une ni l'autre]" },
  { id: "B_trouverCh", label: "B — donné sh, trouver ch (1 valeur)" },
  { id: "B_trouverShSansSigne", label: "B — donné ch, trouver sh (signe non précisé, 2 valeurs)" },
  { id: "B_trouverShSignePlus", label: "B — donné ch, trouver sh (x0>0, 1 valeur)" },
  { id: "B_trouverShSigneMoins", label: "B — donné ch, trouver sh (x0<0, 1 valeur)" },
  { id: "C", label: "C — Dérivée et dérivée seconde de a·sh(kx)+b·ch(kx)" },
  { id: "D", label: "D — Limites en ±∞ de a·sh(x)+b·ch(x)" },
];

/** Construit un exercice pour l'`id` de variante demandé (panneau dev) — sans jamais casser le
 * contrat zéro-argument de `genererExerciceHyperboliques`. */
export function construireAvecVarianteId(id: VarianteId): ExerciceHyperboliques {
  switch (id) {
    case "A_shKx":
      return construireAAvecType("shKx");
    case "A_chKx":
      return construireAAvecType("chKx");
    case "A_shChProduit":
      return construireAAvecType("shChProduit");
    case "A_shCarre":
      return construireAAvecType("shCarre");
    case "A_chCarre":
      return construireAAvecType("chCarre");
    case "A_shPlusCh":
      return construireAAvecType("shPlusCh");
    case "A_shMoinsCh":
      return construireAAvecType("shMoinsCh");
    case "B_trouverCh":
      return construireBTrouverCh();
    case "B_trouverShSansSigne":
      return construireBTrouverSh({ signeX0: null });
    case "B_trouverShSignePlus":
      return construireBTrouverSh({ signeX0: 1 });
    case "B_trouverShSigneMoins":
      return construireBTrouverSh({ signeX0: -1 });
    case "C":
      return construireC();
    case "D":
      return construireD();
  }
}

const CONSTRUCTEURS_FAMILLE: Record<FamilleHyperboliques, () => ExerciceHyperboliques> = {
  A: construireA,
  B: construireB,
  C: construireC,
  D: construireD,
};

const FAMILLES: readonly FamilleHyperboliques[] = ["A", "B", "C", "D"];

/** Tirage ÉQUIPROBABLE parmi les 4 familles (spec : "Tirage aléatoire d'1 famille parmi 4 (A à D,
 * équiprobable)"). */
export function tirerFamilleEquiprobable(): FamilleHyperboliques {
  return FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
}

export function genererExerciceHyperboliques(): ExerciceHyperboliques {
  return CONSTRUCTEURS_FAMILLE[tirerFamilleEquiprobable()]();
}
