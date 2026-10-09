import type { ExerciceLimiteLogarithmique, FamilleLimiteLogarithmique } from "../../core6e/limitesLogarithmiques.types";
import { construireA, construireASousType } from "./familles/A";
import { construireB, construireBSousType } from "./familles/B";
import { construireC, construireCSousType } from "./familles/C";
import { construireD } from "./familles/D";
import { construireE } from "./familles/E";

/**
 * Catalogue dev — une entrée par sous-type PLUTÔT que par famille seule (5+2+3+1+1=12 entrées),
 * pour que le panneau `SelecteurVarianteDev` puisse forcer chaque sous-type individuellement lors
 * des tests Playwright (voir CLAUDE.md, point 6 des clarifications). `construireAvecVarianteId`
 * dispatch directement vers le sous-type — jamais vers un simple tirage de famille suivi d'un
 * tirage interne, qui resterait non déterministe.
 */
export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "A-sous1", label: "A1 — k·ln(x)/P(x) → 0" },
  { id: "A-sous2", label: "A2 — baseˣ/P(x), x→±∞" },
  { id: "A-sous3", label: "A3 — quotient de logs (bases différentes)" },
  { id: "A-sous4", label: "A4 — même polynôme dominant → 1" },
  { id: "A-sous5", label: "A5 — mélange poly/exponentielle → 0" },
  { id: "B-quotient", label: "B1 — quotient de logs (base→1)" },
  { id: "B-produit", label: "B2 — produit (x−x0)·log(k)" },
  { id: "C-c1", label: "C1 — log_x(x+c), x→1±" },
  { id: "C-c2", label: "C2 — x·baseˣ(c/x), ∞×constante" },
  { id: "C-c3", label: "C3 — numérateur ne s'annule pas" },
  { id: "D", label: "D — forme 1^∞ (e^(g·ln f))" },
  { id: "E", label: "E — cas avancé (instance unique)" },
];

export function construireAvecVarianteId(id: string): ExerciceLimiteLogarithmique {
  switch (id) {
    case "A-sous1":
      return construireASousType("sous1");
    case "A-sous2":
      return construireASousType("sous2");
    case "A-sous3":
      return construireASousType("sous3");
    case "A-sous4":
      return construireASousType("sous4");
    case "A-sous5":
      return construireASousType("sous5");
    case "B-quotient":
      return construireBSousType("quotient");
    case "B-produit":
      return construireBSousType("produit");
    case "C-c1":
      return construireCSousType("c1");
    case "C-c2":
      return construireCSousType("c2");
    case "C-c3":
      return construireCSousType("c3");
    case "D":
      return construireD();
    case "E":
      return construireE();
    default:
      throw new Error(`construireAvecVarianteId : identifiant inconnu "${id}"`);
  }
}

const CONSTRUCTEURS_FAMILLE: Record<FamilleLimiteLogarithmique, () => ExerciceLimiteLogarithmique> = {
  A: construireA,
  B: construireB,
  C: construireC,
  D: construireD,
  E: construireE,
};

/**
 * Tirage pondéré — E (poids 0,5) est plus rare que les 4 autres familles (poids 1 chacune),
 * conformément à la spec ("poids de tirage réduit, ex. 0,5") : E est une INSTANCE UNIQUE codée en
 * dur (voir `familles/E.ts`), un poids réduit évite qu'elle revienne aussi souvent qu'une famille
 * avec de vraies variations aléatoires. Même mécanisme que `limitesExponentielles/index.ts`
 * (6gen6, famille G).
 */
const POIDS: Record<FamilleLimiteLogarithmique, number> = { A: 1, B: 1, C: 1, D: 1, E: 0.5 };
const FAMILLES: FamilleLimiteLogarithmique[] = ["A", "B", "C", "D", "E"];
const POIDS_TOTAL = FAMILLES.reduce((s, f) => s + POIDS[f], 0);

export function tirerFamillePonderee(): FamilleLimiteLogarithmique {
  let tirage = Math.random() * POIDS_TOTAL;
  for (const f of FAMILLES) {
    tirage -= POIDS[f];
    if (tirage < 0) return f;
  }
  return FAMILLES[FAMILLES.length - 1];
}

export function genererExerciceLimiteLogarithmique(): ExerciceLimiteLogarithmique {
  return CONSTRUCTEURS_FAMILLE[tirerFamillePonderee()]();
}
