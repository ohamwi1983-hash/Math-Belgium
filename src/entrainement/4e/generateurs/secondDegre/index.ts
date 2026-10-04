import type { Categorie, Exercice, GenerateurExercice } from "../../core/generateur.types";
import { construireMiseEnEvidence } from "./categories/miseEnEvidence";
import { construireBinomeConjugue } from "./categories/binomeConjugue";
import { construireProduitRemarquable } from "./categories/produitRemarquable";
import { construireCasGeneral } from "./categories/casGeneral";
import { construireMiseEnEvidenceGeneralisee } from "./categories/miseEnEvidenceGeneralisee";
import { construireMiseEnEvidenceIrrationnelle } from "./categories/miseEnEvidenceIrrationnelle";
import { construireBinomeConjugueIrrationnelle } from "./categories/binomeConjugueIrrationnelle";
import { construireProduitRemarquableIrrationnelle } from "./categories/produitRemarquableIrrationnelle";
import { construireCasGeneralIrrationnelle } from "./categories/casGeneralIrrationnelle";
import { tirerFormeAffichage } from "./tirageFormeAffichage";

/** Complète un constructeur rationnel "standard" (catégories 1-4) avec une forme d'affichage tirée séparément. */
function avecFormeAffichageStandard(
  construire: () => Omit<Exercice, "formeAffichage" | "parametresAffichage">,
): () => Exercice {
  return () => {
    const exercice = construire();
    return { ...exercice, formeAffichage: tirerFormeAffichage(exercice.enonce.a) };
  };
}

/**
 * Pour chaque famille 1-4, ~50% de chance de tirer sa variante irrationnelle plutôt que
 * rationnelle (voir prompt-coefficients-irrationnels.md). Les constructeurs irrationnels se
 * gèrent entièrement eux-mêmes (formeAffichage toujours "canonique", jamais isolée/produit=constante).
 */
function avecVarianteIrrationnelle(
  construireRationnel: () => Omit<Exercice, "formeAffichage" | "parametresAffichage">,
  construireIrrationnel: () => Exercice,
): () => Exercice {
  const genererRationnel = avecFormeAffichageStandard(construireRationnel);
  return () => (Math.random() < 0.5 ? construireIrrationnel() : genererRationnel());
}

const constructeurs: Array<() => Exercice> = [
  avecVarianteIrrationnelle(construireMiseEnEvidence, construireMiseEnEvidenceIrrationnelle),
  avecVarianteIrrationnelle(construireBinomeConjugue, construireBinomeConjugueIrrationnelle),
  avecVarianteIrrationnelle(construireProduitRemarquable, construireProduitRemarquableIrrationnelle),
  avecVarianteIrrationnelle(construireCasGeneral, construireCasGeneralIrrationnelle),
  // se gère entièrement elle-même (p,m, forme d'affichage) ; n'a pas de variante irrationnelle
  // pour cette itération — voir "N'affecte pas la famille 5" du prompt.
  construireMiseEnEvidenceGeneralisee,
];

/**
 * Catégories réellement productibles par CE générateur (convention RETROFIT-variantes-
 * generateurs.md) — exclut délibérément `"irreductible"` du type `Categorie` partagé (`core/
 * generateur.types.ts`) : cette 6e valeur n'existe que pour le septième exercice ("Analyse d'une
 * fonction du second degré"), `genererExerciceSecondDegre` ne la produit jamais (voir la section
 * dédiée de CLAUDE.md, "Extension du type Categorie partagé").
 */
export type VarianteSecondDegreId = Exclude<Categorie, "irreductible">;

export interface VarianteSecondDegre {
  id: VarianteSecondDegreId;
  label: string;
}

/**
 * Proposition à valider par l'utilisateur (voir RETROFIT-variantes-generateurs.md) — libellés
 * pédagogiques dérivés directement de la table de distinction déjà documentée dans
 * AUDIT-variantes-generateurs.md, section 1.
 */
export const CATALOGUE_VARIANTES: VarianteSecondDegre[] = [
  { id: "mise_en_evidence", label: "Mise en évidence (c=0)" },
  { id: "binome_conjugue", label: "Binôme conjugué (b=0, différence de deux carrés)" },
  { id: "produit_remarquable", label: "Produit remarquable (Δ=0, carré parfait)" },
  { id: "cas_general", label: "Cas général (formule du discriminant)" },
  { id: "mise_en_evidence_generalisee", label: "Mise en évidence généralisée ((x+p)²=m(x+p))" },
];

const CONSTRUCTEURS_PAR_ID: Record<VarianteSecondDegreId, () => Exercice> = {
  mise_en_evidence: constructeurs[0],
  binome_conjugue: constructeurs[1],
  produit_remarquable: constructeurs[2],
  cas_general: constructeurs[3],
  mise_en_evidence_generalisee: constructeurs[4],
};

/**
 * Joue le rôle de `construireAvecVarianteId` pour ce générateur (convention RETROFIT-variantes-
 * generateurs.md). `overrides?.irrationnel`, s'il est fourni, force la sous-variante rationnelle/
 * irrationnelle (second axe orthogonal, voir AUDIT-variantes-generateurs.md, section 1) plutôt que
 * de la laisser tirée ~50/50 ; ignoré pour `mise_en_evidence_generalisee`, qui n'a pas de variante
 * irrationnelle (voir `constructeurs` ci-dessus). Sans `overrides`, comportement historique inchangé
 * (tirage aléatoire de la sous-variante).
 */
export function construireAvecVarianteId(varianteId: VarianteSecondDegreId, overrides?: { irrationnel?: boolean }): Exercice {
  if (varianteId === "mise_en_evidence_generalisee" || overrides?.irrationnel === undefined) {
    return CONSTRUCTEURS_PAR_ID[varianteId]();
  }
  const paires: Record<Exclude<VarianteSecondDegreId, "mise_en_evidence_generalisee">, [() => Omit<Exercice, "formeAffichage" | "parametresAffichage">, () => Exercice]> = {
    mise_en_evidence: [construireMiseEnEvidence, construireMiseEnEvidenceIrrationnelle],
    binome_conjugue: [construireBinomeConjugue, construireBinomeConjugueIrrationnelle],
    produit_remarquable: [construireProduitRemarquable, construireProduitRemarquableIrrationnelle],
    cas_general: [construireCasGeneral, construireCasGeneralIrrationnelle],
  };
  const [construireRationnel, construireIrrationnel] = paires[varianteId];
  return overrides.irrationnel ? construireIrrationnel() : avecFormeAffichageStandard(construireRationnel)();
}

/** Implémentation de la Couche A (section 2 de la spec) pour l'équation du second degré, 5 familles équiprobables. */
export const genererExerciceSecondDegre: GenerateurExercice = () => {
  const index = Math.floor(Math.random() * constructeurs.length);
  return constructeurs[index]();
};
