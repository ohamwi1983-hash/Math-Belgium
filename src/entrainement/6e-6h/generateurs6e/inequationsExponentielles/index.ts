import type { ExerciceInequationExponentielle, SousTypeC, SousTypeD } from "../../core6e/inequationsExponentielles.types";
import { tirerParmi } from "./aleatoire";
import { construireA } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD } from "./familles/D";
import { construireE } from "./familles/E";

/**
 * Catalogue à granularité FINE (7 entrées — A/B/D1/D2 famille pleine, C-f/C-k et D-constant/
 * D-variable comme sous-types distincts) — même principe que `equationsExponentielles/index.ts`
 * (6gen9) : forcer chaque sous-type individuellement depuis le panneau dev, sans dépendre du
 * hasard.
 */
export type IdVarianteInequationExponentielle = "A" | "B" | "C-f" | "C-k" | "D-constant" | "D-variable" | "E";

export const CATALOGUE_FAMILLES: { id: IdVarianteInequationExponentielle; label: string }[] = [
  { id: "A", label: "A — Même base, sens préservé/inversé" },
  { id: "B", label: "B — Toujours ∅" },
  { id: "C-f", label: "C — Toujours ℝ (produit de signes coïncidents)" },
  { id: "C-k", label: "C — Toujours ℝ (regroupement, discriminant négatif)" },
  { id: "D-constant", label: "D — Produit, 1 facteur à signe constant" },
  { id: "D-variable", label: "D — Produit, 2 facteurs variables (tableau de signes)" },
  { id: "E", label: "E — Bases différentes, même exposant" },
];

export function construireAvecFamilleId(id: IdVarianteInequationExponentielle): ExerciceInequationExponentielle {
  switch (id) {
    case "A":
      return construireA();
    case "B":
      return construireB();
    case "C-f":
      return construireC("f");
    case "C-k":
      return construireC("k");
    case "D-constant":
      return construireD("constant");
    case "D-variable":
      return construireD("variable");
    case "E":
      return construireE();
  }
}

const SOUS_TYPES_C: SousTypeC[] = ["f", "k"];
const SOUS_TYPES_D: SousTypeD[] = ["constant", "variable"];

/**
 * Tirage à 2 niveaux — famille ÉQUIPROBABLE parmi A/B/C/D/E (spec explicite : "Tirage aléatoire
 * d'1 famille parmi 5 ... équiprobable"), PUIS sous-type équiprobable À L'INTÉRIEUR de C/D —
 * jamais un tirage uniforme direct sur les 7 entrées du catalogue, qui sur-représenterait C/D (2
 * entrées chacune) par rapport à A/B/E (1 entrée chacune).
 */
export function genererExerciceInequationExponentielle(): ExerciceInequationExponentielle {
  const famille = tirerParmi(["A", "B", "C", "D", "E"] as const);
  switch (famille) {
    case "A":
      return construireA();
    case "B":
      return construireB();
    case "C":
      return construireC(tirerParmi(SOUS_TYPES_C));
    case "D":
      return construireD(tirerParmi(SOUS_TYPES_D));
    case "E":
      return construireE();
  }
}
