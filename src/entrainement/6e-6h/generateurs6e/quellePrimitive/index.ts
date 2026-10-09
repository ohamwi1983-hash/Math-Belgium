import type { ExerciceBaseQuellePrimitive, ExerciceQuellePrimitive } from "../../core6e/quellePrimitive.types";
import {
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
  construireFamilleG,
  construireFamilleG1,
  construireFamilleG2,
  construireFamilleG3,
  construireFamilleG4,
} from "../calculPrimitives";
import { choisirPointSur } from "./point";

/**
 * Couche A (6e) — point d'entrée `6gen24`. Réutilise INTÉGRALEMENT les constructeurs Couche A de
 * `6gen23` (`construireFamilleA/B/C/G` + granulaires) — jamais réimplémentés, importés tels quels
 * (Couche A ↔ Couche A, réutilisation libre — CLAUDE.md). Tirage à 2 niveaux, même principe que
 * 6gen23 (famille ÉQUIPROBABLE parmi A/B/C/G, puis sous-type équiprobable au sein de la famille,
 * géré par chaque `construireFamilleX`), plutôt qu'un tirage uniforme direct parmi les ~12 entrées
 * de `CATALOGUE_VARIANTES` (biaiserait B, qui n'a qu'un seul sous-type, contre G qui en a 4).
 */

export type IdVarianteQuellePrimitive = "A_direct" | "A_diviserFraction" | "A_diviserProduit" | "B" | "C1" | "C2" | "C3" | "C4" | "G1" | "G2" | "G3" | "G4";

export const CATALOGUE_VARIANTES: { id: IdVarianteQuellePrimitive; label: string }[] = [
  { id: "A_direct", label: "A — Primitive directe (somme de termes)" },
  { id: "A_diviserFraction", label: "A — Diviser d'abord (fraction)" },
  { id: "A_diviserProduit", label: "A — Diviser d'abord (x·√x)" },
  { id: "B", label: "B — Fonction composée, ajustement de coefficient" },
  { id: "C1", label: "C — Substitution : x·√(ax+b)" },
  { id: "C2", label: "C — Substitution : u=arctan/arcsin(x)" },
  { id: "C3", label: "C — Substitution : u=√x" },
  { id: "C4", label: "C — Substitution : u=e^x+1" },
  { id: "G1", label: "G — Décomposition : racines réelles distinctes" },
  { id: "G2", label: "G — Décomposition : fraction impropre" },
  { id: "G3", label: "G — Décomposition : dénominateur mixte x·(x²+1)" },
  { id: "G4", label: "G — Décomposition : quadratique irréductible (arctan)" },
];

const CONSTRUCTEURS_PAR_VARIANTE: Record<IdVarianteQuellePrimitive, () => ExerciceBaseQuellePrimitive> = {
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

/** Construit un `ExerciceQuellePrimitive` à partir d'une base déjà tirée + point (a,b) choisi
 * automatiquement, avec possibilité d'ÉCRASER `a`/`b` (`overrides`) — jamais la base elle-même,
 * dont les paramètres restent toujours ceux du tirage aléatoire de `exerciceBase` (convention
 * `construireAvecVarianteId(id, overrides?)`, CLAUDE.md, sans jamais casser le contrat zéro-argument
 * du générateur principal `construireQuellePrimitive` ci-dessous). */
function completerAvecPoint(exerciceBase: ExerciceBaseQuellePrimitive, overrides?: { aNum?: number; aDen?: number; b?: number }): ExerciceQuellePrimitive {
  const point = choisirPointSur(exerciceBase);
  const aNum = overrides?.aNum ?? point.aNum;
  const aDen = overrides?.aDen ?? point.aDen;
  return { exerciceBase, aNum, aDen, a: aNum / aDen, b: overrides?.b ?? point.b };
}

export function construireAvecVarianteId(id: IdVarianteQuellePrimitive, overrides?: { aNum?: number; aDen?: number; b?: number }): ExerciceQuellePrimitive {
  return completerAvecPoint(CONSTRUCTEURS_PAR_VARIANTE[id](), overrides);
}

const FAMILLES: (() => ExerciceBaseQuellePrimitive)[] = [construireFamilleA, construireFamilleB, construireFamilleC, construireFamilleG];

export function construireQuellePrimitive(): ExerciceQuellePrimitive {
  const construireFamille = FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
  return completerAvecPoint(construireFamille());
}
