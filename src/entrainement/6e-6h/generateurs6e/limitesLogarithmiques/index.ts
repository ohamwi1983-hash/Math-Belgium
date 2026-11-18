import type { ExerciceLimiteLogarithmique, FamilleLimiteLogarithmique } from "../../core6e/limitesLogarithmiques.types";
import { construireA, construireASousType } from "./familles/A";
import { construireB, construireBSousType } from "./familles/B";
import { construireC, construireCSousType } from "./familles/C";
import { construireD } from "./familles/D";

/**
 * Catalogue dev — une entrée par sous-type PLUTÔT que par famille seule (5+2+3=10 entrées pour A–C ; la famille D a une entrée par type de forme, 3 entrées),
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
  // Famille D (puissances f(x)^g(x)) : une entrée par TYPE de forme indéterminée, jamais par issue —
  // l'issue (valeur finie ≠ 1, 1, +∞, 0) reste tirée au hasard, équilibrée, quelle que soit l'entrée.
  // Ajoutées en FIN de catalogue : les codes QR déjà imprimés (indice de variante) restent valides.
  { id: "D-1inf", label: "D1 — puissance, forme 1 exposant ∞" },
  { id: "D-00", label: "D2 — puissance, forme 0⁰" },
  { id: "D-inf0", label: "D3 — puissance, forme ∞⁰" },
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
    case "D-1inf":
      return construireD("un_infini");
    case "D-00":
      return construireD("zero_zero");
    case "D-inf0":
      return construireD("infini_zero");
    default:
      throw new Error(`construireAvecVarianteId : identifiant inconnu "${id}"`);
  }
}

const CONSTRUCTEURS_FAMILLE: Record<FamilleLimiteLogarithmique, () => ExerciceLimiteLogarithmique> = {
  A: construireA,
  B: construireB,
  C: construireC,
  D: () => construireD(),
};

/** Tirage équiprobable des 4 familles (famille D rétablie à la demande de l'utilisateur, qui lève la
 * décision K4 ; famille E toujours retirée). */
const FAMILLES: FamilleLimiteLogarithmique[] = ["A", "B", "C", "D"];

export function tirerFamillePonderee(): FamilleLimiteLogarithmique {
  return FAMILLES[Math.floor(Math.random() * FAMILLES.length)];
}

export function genererExerciceLimiteLogarithmique(): ExerciceLimiteLogarithmique {
  return CONSTRUCTEURS_FAMILLE[tirerFamillePonderee()]();
}
