import type { Ensemble } from "../moteur5e/ensembleSaisi";

/**
 * `5gen62` — « Domaine d'une composée par l'image » (5e ch. 1, § 3, processus 2 APPLIQUER).
 * Fonctions simples : g (intérieure) x² + k, −x² + k, |x| + k, mx + p, √x + k ou 1/x + k ;
 * f (extérieure) √(x − c), √(c − x), 1/(x − c), 1/√(x − c) ou 1/√(c − x). Écrans : Im g, dom f,
 * Im g ∩ dom f (valeurs que f peut recevoir), dom(f∘g) = {x ∈ dom g : g(x) ∈ dom f}.
 * Domaine vide = CAS PARTICULIER (décision de l'utilisateur : ≈ 10 % des tirages, jamais filtré).
 */

export type FamilleInterieure = "carre" | "oppCarre" | "absolue" | "affine" | "racine" | "inverse";
export type FamilleExterieure = "racine" | "racineMoins" | "inverse" | "inverseRacine" | "inverseRacineMoins";
export type VarianteDomaineParImage = "carre" | "absolueAffine" | "racineInverse";
/** vide : Im g ∩ dom f = ∅ ; inclus : Im g ⊂ dom f (la condition 2 ne retire rien) ; partiel. */
export type CasDomaineParImage = "vide" | "inclus" | "partiel";

export interface Interieure {
  famille: FamilleInterieure;
  /** Décalage vertical (x² + k…) ; pour l'affine : p. */
  k: number;
  /** Pente de l'affine (1 sinon). */
  m: number;
}
export interface Exterieure {
  famille: FamilleExterieure;
  c: number;
}

export interface ExerciceDomaineParImage {
  variante: VarianteDomaineParImage;
  g: Interieure;
  f: Exterieure;
  domG: Ensemble;
  imG: Ensemble;
  domF: Ensemble;
  /** Im g ∩ dom f. */
  valeurs: Ensemble;
  /** dom(f∘g). */
  domaine: Ensemble;
  cas: CasDomaineParImage;
  /** Un x entier de dom(f∘g) pour la vérification du corrigé (null si vide). */
  xTest: number | null;
  cleCollecteur: string;
}
