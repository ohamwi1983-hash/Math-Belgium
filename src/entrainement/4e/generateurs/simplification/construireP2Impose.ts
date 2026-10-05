import type { Categorie, Exercice } from "../../core/generateur.types";
import { construireMiseEnEvidence } from "../secondDegre/categories/miseEnEvidence";
import { construireBinomeConjugue } from "../secondDegre/categories/binomeConjugue";
import { construireProduitRemarquable } from "../secondDegre/categories/produitRemarquable";
import { construireCasGeneral } from "../secondDegre/categories/casGeneral";

/**
 * Les 4 techniques déjà codées pour l'exercice 1 — jamais mise_en_evidence_generalisee ici, ni
 * irreductible (exclusive à "Analyse d'une fonction", jamais produite ici).
 */
export type TechniqueP2 = Exclude<Categorie, "mise_en_evidence_generalisee" | "irreductible">;

const TOUTES_TECHNIQUES: TechniqueP2[] = [
  "mise_en_evidence",
  "binome_conjugue",
  "produit_remarquable",
  "cas_general",
];

export interface OptionsP2Impose {
  /**
   * Obligatoire pour construire un dénominateur (voir le plan) : produit_remarquable donne
   * toujours une racine double en p, ce qui laisserait un facteur (x-p) résiduel après une
   * seule simplification et ferait échouer à tort la vérification structurelle de l'étape 5.
   */
  exclureProduitRemarquable?: boolean;
  /**
   * Exclut une technique précise dont la seconde racine est structurellement fixe
   * (mise_en_evidence → 0, binome_conjugue → -p) — utilisé pour empêcher le numérateur de
   * reproduire exactement la même seconde racine que le dénominateur (cas dégénéré, section 2).
   */
  exclureTechnique?: TechniqueP2;
  /** Valeurs interdites pour la seconde racine, si la technique tirée est cas_general. */
  racinesInterdites?: number[];
}

function construire(technique: TechniqueP2, p: number, racinesInterdites: number[]): Omit<Exercice, "formeAffichage"> {
  switch (technique) {
    case "mise_en_evidence":
      return construireMiseEnEvidence({ racineImposee: p });
    case "binome_conjugue":
      return construireBinomeConjugue({ racineImposee: p });
    case "produit_remarquable":
      return construireProduitRemarquable({ racineImposee: p });
    case "cas_general":
      return construireCasGeneral({ racineImposee: p, racinesInterdites });
  }
}

/**
 * Construit un P2 en partant de la racine imposée p, en tirant la technique en premier parmi le
 * sous-ensemble éligible — jamais en tirant a,b,c au hasard puis en vérifiant après coup (même
 * principe que src/generateurs/secondDegre, voir le plan).
 */
export function construireP2Impose(p: number, options: OptionsP2Impose = {}): Exercice {
  let pool = TOUTES_TECHNIQUES;
  if (options.exclureProduitRemarquable) pool = pool.filter((t) => t !== "produit_remarquable");
  if (options.exclureTechnique) pool = pool.filter((t) => t !== options.exclureTechnique);

  const technique = pool[Math.floor(Math.random() * pool.length)];
  const partiel = construire(technique, p, options.racinesInterdites ?? []);

  return { ...partiel, formeAffichage: "canonique" };
}
