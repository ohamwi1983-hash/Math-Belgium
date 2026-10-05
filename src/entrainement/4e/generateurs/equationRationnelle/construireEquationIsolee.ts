import type { Categorie, Exercice } from "../../core/generateur.types";
import { construireMiseEnEvidence } from "../secondDegre/categories/miseEnEvidence";
import { construireBinomeConjugue } from "../secondDegre/categories/binomeConjugue";
import { construireProduitRemarquable } from "../secondDegre/categories/produitRemarquable";
import { construireCasGeneral } from "../secondDegre/categories/casGeneral";

/**
 * Les 4 techniques déjà codées pour l'exercice 1 — jamais mise_en_evidence_generalisee ici (spec
 * section 1.1), ni irreductible (exclusive à "Analyse d'une fonction", jamais produite ici).
 */
type TechniqueP2 = Exclude<Categorie, "mise_en_evidence_generalisee" | "irreductible">;

const TOUTES_TECHNIQUES: TechniqueP2[] = [
  "mise_en_evidence",
  "binome_conjugue",
  "produit_remarquable",
  "cas_general",
];

function construire(technique: TechniqueP2): Omit<Exercice, "formeAffichage"> {
  switch (technique) {
    case "mise_en_evidence":
      return construireMiseEnEvidence({ aImpose: 1 });
    case "binome_conjugue":
      return construireBinomeConjugue({ aImpose: 1 });
    case "produit_remarquable":
      return construireProduitRemarquable({ aImpose: 1 });
    case "cas_general":
      return construireCasGeneral({ aImpose: 1 });
  }
}

/**
 * Équation du second degré monique (a=1) obtenue en tirant une des 4 techniques déjà codées pour
 * l'exercice "méthode la plus rapide", avec a forcé à 1 via l'option aImpose (jamais a,b,c tirés
 * au hasard puis classés a posteriori — même principe que src/generateurs/secondDegre/index.ts).
 * Toujours formeAffichage="canonique" : cette équation n'est jamais affichée sous une forme
 * réarrangée, l'étape d'isolement de cet exercice porte sur l'élimination du dénominateur, pas
 * sur un réarrangement algébrique de l'équation déjà isolée.
 */
export function construireEquationIsolee(): Exercice {
  const technique = TOUTES_TECHNIQUES[Math.floor(Math.random() * TOUTES_TECHNIQUES.length)];
  return { ...construire(technique), formeAffichage: "canonique" };
}
