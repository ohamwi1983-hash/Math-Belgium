import type { ExerciceCalculPrimitives, FamilleCalculPrimitives } from "../../core6e/calculPrimitives.types";
import { construireFamilleA, construireFamilleADirecte, construireFamilleADiviserFraction, construireFamilleADiviserProduit } from "./familles/A";
import { construireFamilleB } from "./familles/B";
import { construireFamilleC, construireFamilleC1, construireFamilleC2, construireFamilleC3, construireFamilleC4 } from "./familles/C";
import { construireFamilleD, construireFamilleD1, construireFamilleD2, construireFamilleD3, construireFamilleD4, construireFamilleD5 } from "./familles/D";
import { construireFamilleE, construireFamilleESinus, construireFamilleETangente } from "./familles/E";
import { construireFamilleF, construireFamilleFAngleDoubleCos, construireFamilleFAngleDoubleSin, construireFamilleFOddPowerCos, construireFamilleFOddPowerSin, construireFamilleFPythagoreanFactor, construireFamilleFTan } from "./familles/F";
import { construireFamilleG, construireFamilleG1, construireFamilleG2, construireFamilleG3, construireFamilleG4 } from "./familles/G";

export {
  construireFamilleA,
  construireFamilleADirecte,
  construireFamilleADiviserFraction,
  construireFamilleADiviserProduit,
  construireFamilleB,
  construireFamilleC,
  construireFamilleC1,
  construireFamilleC2,
  construireFamilleC3,
  construireFamilleC4,
  construireFamilleD,
  construireFamilleE,
  construireFamilleF,
  construireFamilleG,
  construireFamilleG1,
  construireFamilleG2,
  construireFamilleG3,
  construireFamilleG4,
};

/**
 * Couche A (6e) — point d'entrée `6gen23` ("Calcul de primitives", chapitre 4). Tirage à 2 niveaux
 * (spec explicite) : la FAMILLE (A à G) est tirée ÉQUIPROBABLE en premier, puis le SOUS-TYPE au
 * sein de la famille tirée est tiré ÉQUIPROBABLE ensuite — jamais un tirage uniforme direct parmi
 * les ~25 entrées de `CATALOGUE_VARIANTES` (biaiserait les familles à peu de sous-types, ex. B avec
 * un seul, contre G avec 4).
 *
 * Voir l'en-tête de `core6e/calculPrimitives.types.ts` pour le contrat de réutilisation en aval
 * (6gen24/25/26) des constructeurs `construireFamilleA`/`construireFamilleB`/`construireFamilleC`/
 * `construireFamilleG` réexportés ci-dessus.
 */

export type IdVarianteCalculPrimitives =
  | "A_direct"
  | "A_diviserFraction"
  | "A_diviserProduit"
  | "B"
  | "C1"
  | "C2"
  | "C3"
  | "C4"
  | "D1"
  | "D2"
  | "D3"
  | "D4"
  | "D5"
  | "E_sinus"
  | "E_tangente"
  | "F_tan"
  | "F_angleDoubleSin"
  | "F_angleDoubleCos"
  | "F_pythagoreanFactor"
  | "F_oddPowerSin"
  | "F_oddPowerCos"
  | "G1"
  | "G2"
  | "G3"
  | "G4";

/** Catalogue de variantes `{id,label}` + `construireAvecVarianteId` — convention permanente
 * (CLAUDE.md). ~25 entrées : le nombre de sous-types de ce générateur est nettement plus élevé que
 * la moyenne du chantier (7 familles × 1 à 6 sous-types), voir point 10 des clarifications de la
 * spec — nécessaire pour que le panneau dev puisse forcer chaque technique mathématique
 * distinctement en Playwright. */
export const CATALOGUE_VARIANTES: { id: IdVarianteCalculPrimitives; label: string }[] = [
  { id: "A_direct", label: "A — Primitive directe (somme de termes)" },
  { id: "A_diviserFraction", label: "A — Diviser d'abord (fraction)" },
  { id: "A_diviserProduit", label: "A — Diviser d'abord (x·√x)" },
  { id: "B", label: "B — Fonction composée, ajustement de coefficient" },
  { id: "C1", label: "C — Substitution : x·√(ax+b)" },
  { id: "C2", label: "C — Substitution : u=arctan/arcsin(x)" },
  { id: "C3", label: "C — Substitution : u=√x" },
  { id: "C4", label: "C — Substitution : u=e^x+1" },
  { id: "D1", label: "D — IBP : polynôme×trig" },
  { id: "D2", label: "D — IBP répétée : polynôme²×exp" },
  { id: "D3", label: "D — IBP : ln(x) ou arctan(x) seul" },
  { id: "D4", label: "D — IBP cyclique : e^(kx)·trig(x)" },
  { id: "D5", label: "D — Piège : aucune IBP nécessaire" },
  { id: "E_sinus", label: "E — Substitution trig : x=a·sinθ" },
  { id: "E_tangente", label: "E — Substitution trig : x=a·tanθ" },
  { id: "F_tan", label: "F — Identité : tan(x)" },
  { id: "F_angleDoubleSin", label: "F — Identité : angle double (sin²)" },
  { id: "F_angleDoubleCos", label: "F — Identité : angle double (cos²)" },
  { id: "F_pythagoreanFactor", label: "F — Identité : factorisation pythagoricienne" },
  { id: "F_oddPowerSin", label: "F — Identité : puissance impaire (sin³)" },
  { id: "F_oddPowerCos", label: "F — Identité : puissance impaire (cos³)" },
  { id: "G1", label: "G — Décomposition : racines réelles distinctes" },
  { id: "G2", label: "G — Décomposition : fraction impropre" },
  { id: "G3", label: "G — Décomposition : dénominateur mixte x·(x²+1)" },
  { id: "G4", label: "G — Décomposition : quadratique irréductible (arctan)" },
];

export function construireAvecVarianteId(id: IdVarianteCalculPrimitives): ExerciceCalculPrimitives {
  switch (id) {
    case "A_direct":
      return construireFamilleADirecte();
    case "A_diviserFraction":
      return construireFamilleADiviserFraction();
    case "A_diviserProduit":
      return construireFamilleADiviserProduit();
    case "B":
      return construireFamilleB();
    case "C1":
      return construireFamilleC1();
    case "C2":
      return construireFamilleC2();
    case "C3":
      return construireFamilleC3();
    case "C4":
      return construireFamilleC4();
    case "D1":
      return construireFamilleD1();
    case "D2":
      return construireFamilleD2();
    case "D3":
      return construireFamilleD3();
    case "D4":
      return construireFamilleD4();
    case "D5":
      return construireFamilleD5();
    case "E_sinus":
      return construireFamilleESinus();
    case "E_tangente":
      return construireFamilleETangente();
    case "F_tan":
      return construireFamilleFTan();
    case "F_angleDoubleSin":
      return construireFamilleFAngleDoubleSin();
    case "F_angleDoubleCos":
      return construireFamilleFAngleDoubleCos();
    case "F_pythagoreanFactor":
      return construireFamilleFPythagoreanFactor();
    case "F_oddPowerSin":
      return construireFamilleFOddPowerSin();
    case "F_oddPowerCos":
      return construireFamilleFOddPowerCos();
    case "G1":
      return construireFamilleG1();
    case "G2":
      return construireFamilleG2();
    case "G3":
      return construireFamilleG3();
    case "G4":
      return construireFamilleG4();
  }
}

const FAMILLES: FamilleCalculPrimitives[] = ["A", "B", "C", "D", "E", "F", "G"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleCalculPrimitives, () => ExerciceCalculPrimitives> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  D: construireFamilleD,
  E: construireFamilleE,
  F: construireFamilleF,
  G: construireFamilleG,
};

/** Tirage à 2 niveaux : famille ÉQUIPROBABLE (A à G), puis sous-type ÉQUIPROBABLE au sein de la
 * famille (chaque `construireFamilleX` gère son propre tirage de sous-type — voir chaque fichier
 * `familles/*.ts`). */
export function genererExerciceCalculPrimitives(): ExerciceCalculPrimitives {
  const famille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}
