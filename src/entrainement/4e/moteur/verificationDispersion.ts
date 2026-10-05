/**
 * Couche B — vérification pour "Paramètres de dispersion" (remplace "Mode et classe modale",
 * `promptgen34remplacement.md`).
 *
 * Statut à 3 valeurs (`StatutVerification`) sur TOUS les champs numériques libres des 2 écrans —
 * même primitive `parserNombreOuFraction` (`verificationAnalyseFonction.ts`, import moteur→moteur)
 * et même tolérance minime (`1e-9`, bruit de virgule flottante résiduel) que le reste du chapitre 5 :
 * les produits/totaux de l'écran 1 sont des entiers EXACTS par construction (aucune vraie marge
 * d'arrondi nécessaire) ; la variance/l'écart-type de l'écran 2 sont déjà arrondis à 2 décimales
 * côté génération (cascade, voir `core/dispersion.types.ts`), cette même tolérance minime suffit
 * donc aussi pour eux.
 */
import { parserNombreOuFraction } from "./verificationAnalyseFonction";
import type { StatutVerification } from "./statutVerification";
import type { ExerciceDispersion } from "../core/dispersion.types";

const TOLERANCE = 1e-9;

function statutValeurExacte(texte: string, cible: number): StatutVerification {
  const valeur = parserNombreOuFraction(texte);
  if (valeur === null) return "parse_error";
  return Math.abs(valeur - cible) <= TOLERANCE ? "correct" : "not_equivalent";
}

// ============================================================================
// Écran 1 — "Tableau et sommes intermédiaires" : un produit (x_i-x̄)²·n_i PAR LIGNE, plus les deux
// totaux Σn_i/Σ(x_i-x̄)²·n_i intégrés à la dernière ligne du tableau (même mécanique que "Moyenne
// pondérée", `EtapeSommesMoyennePonderee.tsx`).
// ============================================================================

export interface ReponseTableauDispersion {
  /** Un produit (x_i-x̄)²·n_i par ligne, index-aligné avec `exercice.lignes`. */
  produits: string[];
  sommeN: string;
  sommeProduits: string;
}

export interface StatutTableauDispersion {
  produits: StatutVerification[];
  sommeN: StatutVerification;
  sommeProduits: StatutVerification;
}

export function diagnostiquerProduitLigne(exercice: ExerciceDispersion, index: number, texte: string): StatutVerification {
  const ligne = exercice.lignes[index];
  if (!ligne) return "parse_error";
  return statutValeurExacte(texte, ligne.produitAttendu);
}

export function evaluerProduitsDispersion(exercice: ExerciceDispersion, reponse: ReponseTableauDispersion): StatutVerification[] {
  return exercice.lignes.map((_, i) => diagnostiquerProduitLigne(exercice, i, reponse.produits[i] ?? ""));
}

export function diagnostiquerTableauDispersion(exercice: ExerciceDispersion, reponse: ReponseTableauDispersion): StatutTableauDispersion {
  return {
    produits: evaluerProduitsDispersion(exercice, reponse),
    sommeN: statutValeurExacte(reponse.sommeN, exercice.n),
    sommeProduits: statutValeurExacte(reponse.sommeProduits, exercice.sommeProduits),
  };
}

export function verifierTableauDispersion(exercice: ExerciceDispersion, reponse: ReponseTableauDispersion): boolean {
  if (reponse.produits.length !== exercice.lignes.length) return false;
  const statut = diagnostiquerTableauDispersion(exercice, reponse);
  return statut.produits.every((s) => s === "correct") && statut.sommeN === "correct" && statut.sommeProduits === "correct";
}

// ============================================================================
// Écran 2 — "Variance et écart-type" : 2 champs indépendants sur le même écran, soumis ensemble en
// une seule tentative (tout ou rien) — σ déduit de la variance déjà arrondie (cascade), jamais
// resaisie/redérivée depuis le ratio brut.
// ============================================================================

export interface ReponseVarianceEcartType {
  variance: string;
  ecartType: string;
}

export interface StatutVarianceEcartType {
  variance: StatutVerification;
  ecartType: StatutVerification;
}

export function diagnostiquerVariance(exercice: ExerciceDispersion, texte: string): StatutVerification {
  return statutValeurExacte(texte, exercice.varianceAttendue);
}

export function diagnostiquerEcartType(exercice: ExerciceDispersion, texte: string): StatutVerification {
  return statutValeurExacte(texte, exercice.ecartTypeAttendu);
}

export function diagnostiquerVarianceEcartType(exercice: ExerciceDispersion, reponse: ReponseVarianceEcartType): StatutVarianceEcartType {
  return {
    variance: diagnostiquerVariance(exercice, reponse.variance),
    ecartType: diagnostiquerEcartType(exercice, reponse.ecartType),
  };
}

export function verifierVarianceEcartType(exercice: ExerciceDispersion, reponse: ReponseVarianceEcartType): boolean {
  const statut = diagnostiquerVarianceEcartType(exercice, reponse);
  return statut.variance === "correct" && statut.ecartType === "correct";
}
