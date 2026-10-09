import type { ExerciceCalculPrimitives, FamilleCalculPrimitives } from "../../core6e/calculPrimitives.types";
import type { ExerciceIntegraleMoyenne, ExerciceIntegraleSimple, ExerciceIntegralesDefinies, ScenarioIntegraleDefinie } from "../../core6e/integralesDefinies.types";
import { construireFamilleA, construireFamilleADirecte, construireFamilleADiviserFraction, construireFamilleADiviserProduit, construireFamilleB, construireFamilleC, construireFamilleC1, construireFamilleC2, construireFamilleC3, construireFamilleC4, construireFamilleG, construireFamilleG1, construireFamilleG2, construireFamilleG3, construireFamilleG4 } from "../calculPrimitives/index";
import { choisirBornesValides } from "./bornes";
import { construireParametre, construireParametreExponentielle, construireParametrePolynomiale, construireParametreTrigonometrique } from "./parametre";
import { tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — point d'entrée `6gen25` ("Intégrales définies, paramètre et valeur moyenne",
 * chapitre 4). Tirage à 2 niveaux : le SCÉNARIO (`simple`/`parametre`/`moyenne`) est tiré
 * ÉQUIPROBABLE en premier, puis, pour `simple`/`moyenne`, la famille de primitive empruntée
 * (A/B/C/G UNIQUEMENT — jamais D/E/F, voir en-tête `core6e/integralesDefinies.types.ts`) est TIRÉE
 * ÉQUIPROBABLE ensuite en réutilisant TEL QUEL `construireFamilleA`/`B`/`C`/`G` de 6gen23 (Couche A
 * ↔ Couche A, CLAUDE.md) — jamais réimplémenté. Le scénario `parametre` construit ses 3 exercices
 * à la main (voir `parametre.ts`).
 */

type FamilleAutorisee = Extract<FamilleCalculPrimitives, "A" | "B" | "C" | "G">;

const FAMILLES_AUTORISEES: FamilleAutorisee[] = ["A", "B", "C", "G"];

const CONSTRUCTEURS_PAR_FAMILLE: Record<FamilleAutorisee, () => ExerciceCalculPrimitives> = {
  A: construireFamilleA,
  B: construireFamilleB,
  C: construireFamilleC,
  G: construireFamilleG,
};

function tirerPrimitiveAutorisee(): ExerciceCalculPrimitives {
  const famille = tirerParmi(FAMILLES_AUTORISEES);
  return CONSTRUCTEURS_PAR_FAMILLE[famille]();
}

export function construireIntegraleSimple(primitive: ExerciceCalculPrimitives = tirerPrimitiveAutorisee()): ExerciceIntegraleSimple {
  const [a, b] = choisirBornesValides(primitive);
  return { scenario: "simple", primitive, a, b };
}

export function construireIntegraleMoyenne(primitive: ExerciceCalculPrimitives = tirerPrimitiveAutorisee()): ExerciceIntegraleMoyenne {
  const [a, b] = choisirBornesValides(primitive);
  return { scenario: "moyenne", primitive, a, b };
}

export { construireParametre, construireParametrePolynomiale, construireParametreExponentielle, construireParametreTrigonometrique };

const SCENARIOS: ScenarioIntegraleDefinie[] = ["simple", "parametre", "moyenne"];

export function genererExerciceIntegralesDefinies(): ExerciceIntegralesDefinies {
  const scenario = tirerParmi(SCENARIOS);
  if (scenario === "simple") return construireIntegraleSimple();
  if (scenario === "moyenne") return construireIntegraleMoyenne();
  return construireParametre();
}

// ============================================================================
// Catalogue de variantes dev (`CATALOGUE_VARIANTES` + `construireAvecVarianteId`, convention
// CLAUDE.md) — 12 sous-types empruntés (A_direct/A_diviserFraction/A_diviserProduit/B/C1-4/G1-4) ×
// 2 scénarios (simple/moyenne) + 3 techniques `parametre` = 27 entrées.
// ============================================================================

export type IdSousTypeEmprunte = "A_direct" | "A_diviserFraction" | "A_diviserProduit" | "B" | "C1" | "C2" | "C3" | "C4" | "G1" | "G2" | "G3" | "G4";

const CONSTRUCTEURS_SOUS_TYPE: Record<IdSousTypeEmprunte, () => ExerciceCalculPrimitives> = {
  A_direct: construireFamilleADirecte,
  A_diviserFraction: construireFamilleADiviserFraction,
  A_diviserProduit: construireFamilleADiviserProduit,
  B: construireFamilleB,
  C1: construireFamilleC1,
  C2: construireFamilleC2,
  C3: construireFamilleC3,
  C4: construireFamilleC4,
  G1: construireFamilleG1,
  G2: construireFamilleG2,
  G3: construireFamilleG3,
  G4: construireFamilleG4,
};

const LABELS_SOUS_TYPE: Record<IdSousTypeEmprunte, string> = {
  A_direct: "A — Primitive directe",
  A_diviserFraction: "A — Diviser d'abord (fraction)",
  A_diviserProduit: "A — Diviser d'abord (x·√x)",
  B: "B — Fonction composée",
  C1: "C — Substitution x·√(ax+b)",
  C2: "C — Substitution arctan/arcsin(x)",
  C3: "C — Substitution √x",
  C4: "C — Substitution eˣ+1",
  G1: "G — Racines réelles distinctes",
  G2: "G — Fraction impropre",
  G3: "G — Dénominateur mixte x(x²+1)",
  G4: "G — Quadratique irréductible",
};

export type IdVarianteIntegralesDefinies = `simple_${IdSousTypeEmprunte}` | `moyenne_${IdSousTypeEmprunte}` | "parametre_polynomiale" | "parametre_exponentielle" | "parametre_trigonometrique";

const SOUS_TYPES: IdSousTypeEmprunte[] = ["A_direct", "A_diviserFraction", "A_diviserProduit", "B", "C1", "C2", "C3", "C4", "G1", "G2", "G3", "G4"];

export const CATALOGUE_VARIANTES: { id: IdVarianteIntegralesDefinies; label: string }[] = [
  ...SOUS_TYPES.map((id) => ({ id: `simple_${id}` as IdVarianteIntegralesDefinies, label: `Simple — ${LABELS_SOUS_TYPE[id]}` })),
  { id: "parametre_polynomiale", label: "Paramètre — technique polynomiale (second degré)" },
  { id: "parametre_exponentielle", label: "Paramètre — technique exponentielle" },
  { id: "parametre_trigonometrique", label: "Paramètre — technique trigonométrique" },
  ...SOUS_TYPES.map((id) => ({ id: `moyenne_${id}` as IdVarianteIntegralesDefinies, label: `Valeur moyenne — ${LABELS_SOUS_TYPE[id]}` })),
];

export function construireAvecVarianteId(id: IdVarianteIntegralesDefinies): ExerciceIntegralesDefinies {
  if (id === "parametre_polynomiale") return construireParametrePolynomiale();
  if (id === "parametre_exponentielle") return construireParametreExponentielle();
  if (id === "parametre_trigonometrique") return construireParametreTrigonometrique();
  if (id.startsWith("simple_")) {
    const sousType = id.slice("simple_".length) as IdSousTypeEmprunte;
    return construireIntegraleSimple(CONSTRUCTEURS_SOUS_TYPE[sousType]());
  }
  const sousType = id.slice("moyenne_".length) as IdSousTypeEmprunte;
  return construireIntegraleMoyenne(CONSTRUCTEURS_SOUS_TYPE[sousType]());
}
