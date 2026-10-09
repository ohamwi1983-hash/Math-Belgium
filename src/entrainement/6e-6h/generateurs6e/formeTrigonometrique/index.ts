import type { ExerciceFormeTrigonometrique, FamilleFormeTrigonometrique } from "../../core6e/formeTrigonometrique.types";
import { construireFamilleA } from "./familleA";
import { construireFamilleB, construireFamilleBProduitQuotient, construireFamilleBPuissance } from "./familleB";
import { construireFamilleC } from "./familleC";
import { construireFamilleD } from "./familleD";
import { construireFamilleE } from "./familleE";

export { construireFamilleA, construireFamilleB, construireFamilleBProduitQuotient, construireFamilleBPuissance, construireFamilleC, construireFamilleD, construireFamilleE };

/**
 * Couche A (6e) — point d'entrée `6gen37` ("Forme trigonométrique, module, argument et opérations",
 * chapitre 7 "Nombres complexes"). Tirage à 2 niveaux (mirroir `generateurs6e/nombresComplexes/
 * index.ts`, 6gen34) : la FAMILLE (A à E) est tirée ÉQUIPROBABLE en premier, puis le sous-type de la
 * famille B (seule famille à en avoir un) est tiré ÉQUIPROBABLE ensuite.
 */

export type IdVarianteFormeTrigonometrique = "A" | "B_produit" | "B_quotient" | "B_puissance" | "C" | "D" | "E";

export const CATALOGUE_VARIANTES: { id: IdVarianteFormeTrigonometrique; label: string }[] = [
  { id: "A", label: "A — Forme trigonométrique/exponentielle depuis a+bi" },
  { id: "B_produit", label: "B — Module/argument d'un produit" },
  { id: "B_quotient", label: "B — Module/argument d'un quotient" },
  { id: "B_puissance", label: "B — Module/argument d'une puissance" },
  { id: "C", label: "C — Puissance via De Moivre" },
  { id: "D", label: "D — Trouver n selon une condition sur l'argument" },
  { id: "E", label: "E — Déduire des valeurs trigonométriques exactes" },
];

export function construireAvecVarianteId(id: IdVarianteFormeTrigonometrique): ExerciceFormeTrigonometrique {
  switch (id) {
    case "A":
      return construireFamilleA();
    case "B_produit":
      return construireFamilleBProduitQuotient("produit");
    case "B_quotient":
      return construireFamilleBProduitQuotient("quotient");
    case "B_puissance":
      return construireFamilleBPuissance();
    case "C":
      return construireFamilleC();
    case "D":
      return construireFamilleD();
    case "E":
      return construireFamilleE();
  }
}

const FAMILLES: FamilleFormeTrigonometrique[] = ["A", "B", "C", "D", "E"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleFormeTrigonometrique, () => ExerciceFormeTrigonometrique> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
  E: construireFamilleE,
};

export function genererExerciceFormeTrigonometrique(): ExerciceFormeTrigonometrique {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
