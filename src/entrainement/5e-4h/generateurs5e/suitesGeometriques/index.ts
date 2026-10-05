/**
 * Couche A (5e) — point d'entrée de 5gen15 ("Suites géométriques, formule générale et termes").
 * REFONTE (`prompt5gen15refontefamillesbonus.md`, miroir direct de `generateurs5e/suitesArithmetiques/index.ts`,
 * 5gen14) : 4 familles top-niveau (au lieu de 3), tirage PONDÉRÉ — "principal" reste l'expérience
 * dominante, les 3 familles "algebrique*" sont des extensions BONUS, donc plus rares.
 *
 * `CATALOGUE_FAMILLES` (dev selector, `construireAvecFamilleId`) et `POIDS`/`tirerFamillePonderee`
 * (tirage aléatoire top-niveau) sont 2 catalogues DISTINCTS, même principe que 5gen14 : la famille B
 * (`algebriqueSommeSn`) expose ses 2 sous-cas forçables INDIVIDUELLEMENT côté dev
 * (`algebriqueSommeSn-A/-B`, id composite), mais reste UN SEUL poste de poids côté tirage aléatoire
 * top-niveau (réparti EN INTERNE uniformément sur les 2 sous-cas via `genererExerciceAlgebriqueSommeSn()`).
 */
import type { ExerciceSuiteGeometrique } from "../../core5e/suitesGeometriques.types";
import type { SousCasSommeSnGeometrique } from "../../core5e/suitesGeometriques.types";
import { construireSommeSnAvecSousCas, genererExerciceAlgebriqueRangN, genererExerciceAlgebriqueSommeSn, genererExerciceAlgebriqueTermeGeneral } from "./algebrique";
import { genererExercicePrincipal } from "./principal";

/** Id du dev selector (`CATALOGUE_FAMILLES`/`construireAvecFamilleId`) — 6 entrées, dont les 2
 * sous-cas de la famille B forçables individuellement (id composite `"algebriqueSommeSn-X"`). */
export type FamilleSuiteGeometriqueId = "principal" | "algebriqueTermeGeneral" | "algebriqueSommeSn-A" | "algebriqueSommeSn-B" | "algebriqueRangN";

export const CATALOGUE_FAMILLES: { id: FamilleSuiteGeometriqueId; label: string }[] = [
  { id: "principal", label: "Pipeline u1/q (2 données → le reste)" },
  { id: "algebriqueTermeGeneral", label: "Isoler x — via up et un (relation générale)" },
  { id: "algebriqueSommeSn-A", label: "Isoler x — Sn, sous-cas A (u1(x) algébrique)" },
  { id: "algebriqueSommeSn-B", label: "Isoler x — Sn, sous-cas B (Sn(x) algébrique)" },
  { id: "algebriqueRangN", label: "Isoler le rang n (réduction à la même base)" },
];

export function construireAvecFamilleId(famille: FamilleSuiteGeometriqueId): ExerciceSuiteGeometrique {
  switch (famille) {
    case "principal":
      return genererExercicePrincipal();
    case "algebriqueTermeGeneral":
      return genererExerciceAlgebriqueTermeGeneral();
    case "algebriqueSommeSn-A":
      return construireSommeSnAvecSousCas("A");
    case "algebriqueSommeSn-B":
      return construireSommeSnAvecSousCas("B");
    case "algebriqueRangN":
      return genererExerciceAlgebriqueRangN();
  }
}

/** Id top-niveau — 4 postes de poids, distinct de `FamilleSuiteGeometriqueId` (voir en-tête de
 * fichier : "algebriqueSommeSn" n'y est jamais suffixé, le sous-cas se tire EN INTERNE). */
type FamilleSuiteGeometriqueTopId = "principal" | "algebriqueTermeGeneral" | "algebriqueSommeSn" | "algebriqueRangN";

const CATALOGUE_TOP: { id: FamilleSuiteGeometriqueTopId }[] = [{ id: "principal" }, { id: "algebriqueTermeGeneral" }, { id: "algebriqueSommeSn" }, { id: "algebriqueRangN" }];

/** "principal" nettement dominant (70), le reste réparti uniformément sur les 3 nouvelles familles
 * (10 chacune) — `algebriqueSommeSn` restant UN SEUL poste, réparti en interne uniformément sur ses
 * 2 sous-cas (voir en-tête de fichier). */
const POIDS: Record<FamilleSuiteGeometriqueTopId, number> = { principal: 70, algebriqueTermeGeneral: 10, algebriqueSommeSn: 10, algebriqueRangN: 10 };

function tirerFamillePonderee(): FamilleSuiteGeometriqueTopId {
  const total = Object.values(POIDS).reduce((a, b) => a + b, 0);
  let tirage = Math.random() * total;
  for (const { id } of CATALOGUE_TOP) {
    tirage -= POIDS[id];
    if (tirage < 0) return id;
  }
  return "principal";
}

export function genererExerciceSuiteGeometrique(): ExerciceSuiteGeometrique {
  const topId = tirerFamillePonderee();
  if (topId === "algebriqueSommeSn") return genererExerciceAlgebriqueSommeSn();
  return construireAvecFamilleId(topId);
}

export type { SousCasSommeSnGeometrique };
