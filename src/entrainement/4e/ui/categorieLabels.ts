import type { Categorie } from "../core/generateur.types";

const LIBELLES_CATEGORIE: Record<Categorie, string> = {
  mise_en_evidence: "Mise en évidence",
  binome_conjugue: "Binôme conjugué",
  produit_remarquable: "Produit remarquable",
  cas_general: "Aucune méthode rapide (formule générale)",
  mise_en_evidence_generalisee: "Mise en évidence généralisée",
  irreductible: "Non factorisable",
};

/** Les 4 catégories proposées à l'étape de reconnaissance — "mise_en_evidence_generalisee" n'y figure jamais. */
export const OPTIONS_CATEGORIE: { valeur: Categorie; libelle: string }[] = (
  ["mise_en_evidence", "binome_conjugue", "produit_remarquable", "cas_general"] as const
).map((valeur) => ({ valeur, libelle: LIBELLES_CATEGORIE[valeur] }));

export function libelleCategorie(categorie: Categorie): string {
  return LIBELLES_CATEGORIE[categorie];
}

/**
 * Les 4 catégories proposées à l'étape "racines" de "Analyse d'une fonction du second degré"
 * (chapitre 1) — les 3 techniques sans Δ plus "irreductible" (Δ<0, prompt-cas-non-factorisable.md),
 * cohérent avec la génération qui exclut cas_general (voir generateurs/analyseFonction). Jamais
 * "cas_general" ni "mise_en_evidence_generalisee".
 */
export const OPTIONS_CATEGORIE_SANS_CAS_GENERAL: { valeur: Categorie; libelle: string }[] = (
  ["mise_en_evidence", "binome_conjugue", "produit_remarquable", "irreductible"] as const
).map((valeur) => ({ valeur, libelle: LIBELLES_CATEGORIE[valeur] }));

/**
 * Les 4 catégories habituelles PLUS "irreductible" ("Non factorisable") — utilisé par "Tableau de
 * signes à plusieurs facteurs" (promptgenerateur5signesProduit.md, point 9) : chaque facteur du
 * second degré de la séquence (factorisable OU réellement irréductible) propose ce même choix à 5
 * options, contrairement à OPTIONS_CATEGORIE (jamais "irreductible") et
 * OPTIONS_CATEGORIE_SANS_CAS_GENERAL (jamais "cas_general").
 */
export const OPTIONS_CATEGORIE_AVEC_IRREDUCTIBLE: { valeur: Categorie; libelle: string }[] = (
  ["mise_en_evidence", "binome_conjugue", "produit_remarquable", "cas_general", "irreductible"] as const
).map((valeur) => ({ valeur, libelle: LIBELLES_CATEGORIE[valeur] }));
