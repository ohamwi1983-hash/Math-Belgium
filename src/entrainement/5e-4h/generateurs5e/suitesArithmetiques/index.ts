/**
 * Couche A (5e) — point d'entrée de 5gen14 ("Suites arithmétiques, formule générale et termes").
 * 5 familles top-niveau, tirage PONDÉRÉ (jamais uniforme) — "principal" est le contenu central du
 * générateur, "coherence"/"algebriqueTermeGeneral"/"algebriqueSommeSn"/"algebriqueRangN" sont
 * explicitement des variantes/extensions BONUS, donc plus rares (POIDS INCHANGÉS par la refonte
 * `prompt5gen14refontefamillesbonus.md`).
 *
 * `CATALOGUE_FAMILLES` (dev selector, `construireAvecFamilleId`) et `POIDS`/`tirerFamillePonderee`
 * (tirage aléatoire top-niveau) sont désormais 2 catalogues DISTINCTS, contrairement à avant : la
 * famille B (`algebriqueSommeSn`) expose 4 sous-cas forçables INDIVIDUELLEMENT côté dev
 * (`algebriqueSommeSn-A/-B/-C/-D`, id composite, même patron que le cas particulier gen57 à 2 axes
 * indépendants — `docs/conventions-transversales.md`), mais reste UN SEUL poste de poids côté tirage
 * aléatoire top-niveau (poids total 5, réparti EN INTERNE uniformément sur les 4 sous-cas via
 * `genererExerciceAlgebriqueSommeSn()`, jamais un 5e poste de poids séparé par sous-cas).
 */
import type { ExerciceSuiteArithmetique, SousCasSommeSn } from "../../core5e/suitesArithmetiques.types";
import { construireSommeSnAvecSousCas, genererExerciceAlgebriqueRangN, genererExerciceAlgebriqueSommeSn, genererExerciceAlgebriqueTermeGeneral } from "./algebrique";
import { genererExerciceCoherence } from "./coherence";
import { genererExercicePrincipal } from "./principal";

/** Id du dev selector (`CATALOGUE_FAMILLES`/`construireAvecFamilleId`) — 8 entrées, dont les 4
 * sous-cas de la famille B forçables individuellement (id composite `"algebriqueSommeSn-X"`). */
export type FamilleSuiteArithmetiqueId =
  | "principal"
  | "coherence"
  | "algebriqueTermeGeneral"
  | "algebriqueSommeSn-A"
  | "algebriqueSommeSn-B"
  | "algebriqueSommeSn-C"
  | "algebriqueSommeSn-D"
  | "algebriqueRangN";

export const CATALOGUE_FAMILLES: { id: FamilleSuiteArithmetiqueId; label: string }[] = [
  { id: "principal", label: "Pipeline u1/r (2 données → le reste)" },
  { id: "coherence", label: "Vérification de cohérence (r, up, uq sur-spécifiés)" },
  { id: "algebriqueTermeGeneral", label: "Isoler x — via up et un (relation générale)" },
  { id: "algebriqueSommeSn-A", label: "Isoler x — Sn, sous-cas A (u1(x) algébrique)" },
  { id: "algebriqueSommeSn-B", label: "Isoler x — Sn, sous-cas B (r(x) algébrique)" },
  { id: "algebriqueSommeSn-C", label: "Isoler x — Sn, sous-cas C (u1(x) et r(x) algébriques)" },
  { id: "algebriqueSommeSn-D", label: "Isoler x — Sn, sous-cas D (Sn(x) algébrique)" },
  { id: "algebriqueRangN", label: "Isoler le rang n" },
];

export function construireAvecFamilleId(famille: FamilleSuiteArithmetiqueId): ExerciceSuiteArithmetique {
  switch (famille) {
    case "principal":
      return genererExercicePrincipal();
    case "coherence":
      return genererExerciceCoherence();
    case "algebriqueTermeGeneral":
      return genererExerciceAlgebriqueTermeGeneral();
    case "algebriqueSommeSn-A":
      return construireSommeSnAvecSousCas("A");
    case "algebriqueSommeSn-B":
      return construireSommeSnAvecSousCas("B");
    case "algebriqueSommeSn-C":
      return construireSommeSnAvecSousCas("C");
    case "algebriqueSommeSn-D":
      return construireSommeSnAvecSousCas("D");
    case "algebriqueRangN":
      return genererExerciceAlgebriqueRangN();
  }
}

/** Id top-niveau — 5 postes de poids, distinct de `FamilleSuiteArithmetiqueId` (voir en-tête de
 * fichier : "algebriqueSommeSn" n'y est jamais suffixé, le sous-cas se tire EN INTERNE). */
type FamilleSuiteArithmetiqueTopId = "principal" | "coherence" | "algebriqueTermeGeneral" | "algebriqueSommeSn" | "algebriqueRangN";

const CATALOGUE_TOP: { id: FamilleSuiteArithmetiqueTopId }[] = [
  { id: "principal" },
  { id: "coherence" },
  { id: "algebriqueTermeGeneral" },
  { id: "algebriqueSommeSn" },
  { id: "algebriqueRangN" },
];

const POIDS: Record<FamilleSuiteArithmetiqueTopId, number> = { principal: 70, coherence: 15, algebriqueTermeGeneral: 5, algebriqueSommeSn: 5, algebriqueRangN: 5 };

function tirerFamillePonderee(): FamilleSuiteArithmetiqueTopId {
  const total = Object.values(POIDS).reduce((a, b) => a + b, 0);
  let tirage = Math.random() * total;
  for (const { id } of CATALOGUE_TOP) {
    tirage -= POIDS[id];
    if (tirage < 0) return id;
  }
  return "principal";
}

export function genererExerciceSuiteArithmetique(): ExerciceSuiteArithmetique {
  const topId = tirerFamillePonderee();
  if (topId === "algebriqueSommeSn") return genererExerciceAlgebriqueSommeSn();
  return construireAvecFamilleId(topId);
}

export type { SousCasSommeSn };
