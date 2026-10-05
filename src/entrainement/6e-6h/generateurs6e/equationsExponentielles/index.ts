import type { ExerciceEquationExponentielle } from "../../core6e/equationsExponentielles.types";
import { tirerParmi } from "./aleatoire";
import { construireA1, construireA2, construireA3 } from "./familles/A";
import { construireB } from "./familles/B";
import { construireC } from "./familles/C";
import { construireD1, construireD2 } from "./familles/D";

/**
 * Catalogue à granularité FINE (9 entrées, un id par SOUS-TYPE/STYLE) — jamais seulement les 4
 * familles A/B/C/D, contrairement à `limitesExponentielles` (6gen6) : la famille A a 3 sous-types
 * (A1/A2/A3, contenus/vérifications distincts), C a 3 styles de présentation (visuellement très
 * différents), D a 2 sous-types (structurellement différents) — les forcer individuellement depuis
 * le panneau dev est nécessaire pour tester chacun sans dépendre du hasard. `construireAvecFamilleId`
 * dispatche directement sur cette granularité — même principe déjà établi pour 5gen3/5gen13 (id
 * composite "familleId::varianteId"), ici un id PLAT suffit (pas de second axe indépendant).
 */
export type IdVarianteEquationExponentielle = "A1" | "A2" | "A3" | "B" | "C-direct" | "C-carreDeguise" | "C-regroupement" | "D1" | "D2";

export const CATALOGUE_FAMILLES: { id: IdVarianteEquationExponentielle; label: string }[] = [
  { id: "A1", label: "A1 — Même base, direct" },
  { id: "A2", label: "A2 — Même base, avec racine" },
  { id: "A3", label: "A3 — Même base, second degré en x" },
  { id: "B", label: "B — √(baseᵘ)=baseᵛ (∅ possible)" },
  { id: "C-direct", label: "C — Changement de variable (présentation directe)" },
  { id: "C-carreDeguise", label: "C — Changement de variable (base² déguisée)" },
  { id: "C-regroupement", label: "C — Changement de variable (regroupement de coefficient)" },
  { id: "D1", label: "D1 — c·baseᶠ⁽ˣ⁾=0, toujours ∅" },
  { id: "D2", label: "D2 — somme de puissances +k=0, toujours ∅" },
];

export function construireAvecFamilleId(id: IdVarianteEquationExponentielle): ExerciceEquationExponentielle {
  switch (id) {
    case "A1":
      return construireA1();
    case "A2":
      return construireA2();
    case "A3":
      return construireA3();
    case "B":
      return construireB();
    case "C-direct":
      return construireC("direct");
    case "C-carreDeguise":
      return construireC("carreDeguise");
    case "C-regroupement":
      return construireC("regroupement");
    case "D1":
      return construireD1();
    case "D2":
      return construireD2();
  }
}

/**
 * Tirage à 2 niveaux — famille ÉQUIPROBABLE parmi A/B/C/D (spec explicite : "Tirage aléatoire d'1
 * famille parmi 4 ... équiprobable"), PUIS sous-type/style équiprobable À L'INTÉRIEUR de la
 * famille tirée — jamais un tirage uniforme direct sur les 9 entrées du catalogue, qui aurait
 * sur-représenté C (3 entrées) et sous-représenté B (1 entrée) par rapport aux autres familles.
 */
export function genererExerciceEquationExponentielle(): ExerciceEquationExponentielle {
  const famille = tirerParmi(["A", "B", "C", "D"] as const);
  switch (famille) {
    case "A":
      return construireAvecFamilleId(tirerParmi(["A1", "A2", "A3"] as const));
    case "B":
      return construireB();
    case "C":
      return construireC(tirerParmi(["direct", "carreDeguise", "regroupement"] as const));
    case "D":
      return construireAvecFamilleId(tirerParmi(["D1", "D2"] as const));
  }
}
