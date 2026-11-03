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
  | "A_shPlusConstante"
  | "A_xSh"
  | "A_xCh"
  | "A_shCube"
  | "B_trouverCh"
  | "B_trouverShSansSigne"
  | "B_trouverShSignePlus"
  | "B_trouverShSigneMoins"
  | "C"
  | "D";

/** Libellés volontairement NEUTRES (jamais la parité attendue ni le nombre de valeurs attendues)
 * — le panneau reste réservé au développement, mais un libellé ne doit jamais trahir la réponse. */
export const CATALOGUE_VARIANTES: { id: VarianteId; label: string }[] = [
  { id: "A_shKx", label: "A — a·sh(kx)" },
  { id: "A_chKx", label: "A — a·ch(kx)" },
  { id: "A_shChProduit", label: "A — sh(x)·ch(x)" },
  { id: "A_shCarre", label: "A — sh(x)²" },
  { id: "A_chCarre", label: "A — ch(x)²" },
  { id: "A_shPlusCh", label: "A — sh(x)+ch(x)" },
  { id: "A_shMoinsCh", label: "A — sh(x)−ch(x)" },
  { id: "A_shPlusConstante", label: "A — sh(x)+c" },
  { id: "A_xSh", label: "A — x·sh(x)" },
  { id: "A_xCh", label: "A — x·ch(x)" },
  { id: "A_shCube", label: "A — sh(x)³" },
  { id: "B_trouverCh", label: "B — donné sh(x₀), trouver ch(x₀)" },
  { id: "B_trouverShSansSigne", label: "B — donné ch(x₀), trouver sh(x₀) (signe de x₀ non précisé)" },
  { id: "B_trouverShSignePlus", label: "B — donné ch(x₀), trouver sh(x₀) (x₀ > 0)" },
  { id: "B_trouverShSigneMoins", label: "B — donné ch(x₀), trouver sh(x₀) (x₀ < 0)" },
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
    case "A_shPlusConstante":
      return construireAAvecType("shPlusConstante");
    case "A_xSh":
      return construireAAvecType("xSh");
    case "A_xCh":
      return construireAAvecType("xCh");
    case "A_shCube":
      return construireAAvecType("shCube");
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
