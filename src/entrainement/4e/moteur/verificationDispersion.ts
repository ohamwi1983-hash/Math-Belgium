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

/** Une saisie est-elle illisible ? (statut `parse_error` — ne consomme jamais de tentative). */
export function saisieIllisible(texte: string): boolean {
  return texte.trim() !== "" && parserNombreOuFraction(texte) === null;
}

// ============================================================================
// Écran supplémentaire de la famille "classes" — "Centres et moyenne" : un centre par classe, puis
// x̄ (valeur exacte, au plus 1 décimale par construction : tolérance de bruit seulement).
// ============================================================================

export interface ReponseCentresMoyenneDispersion {
  /** Un centre par classe, index-aligné avec `exercice.enClasses.classes`. */
  centres: string[];
  moyenne: string;
}

export interface StatutCentresMoyenneDispersion {
  centres: StatutVerification[];
  moyenne: StatutVerification;
}

export function diagnostiquerCentresMoyenneDispersion(exercice: ExerciceDispersion, reponse: ReponseCentresMoyenneDispersion): StatutCentresMoyenneDispersion {
  const classes = exercice.enClasses?.classes ?? [];
  return {
    centres: classes.map((c, i) => statutValeurExacte(reponse.centres[i] ?? "", c.centre)),
    moyenne: statutValeurExacte(reponse.moyenne, exercice.xBar),
  };
}

export function verifierCentresMoyenneDispersion(exercice: ExerciceDispersion, reponse: ReponseCentresMoyenneDispersion): boolean {
  if (!exercice.enClasses || reponse.centres.length !== exercice.enClasses.classes.length) return false;
  const statut = diagnostiquerCentresMoyenneDispersion(exercice, reponse);
  return statut.centres.every((s) => s === "correct") && statut.moyenne === "correct";
}

/** Pièges reconnus à l'écran « centres et moyenne » (seulement sur des champs FAUX). */
export interface PiegesCentresMoyenneDispersion {
  /** Un centre saisi égal à une borne de sa classe. */
  centreEgalBorne: boolean;
  /** x̄ calculé avec les bornes (inférieures ou supérieures) au lieu des centres. */
  moyenneAvecBornes: boolean;
  /** x̄ = moyenne simple des centres, sans les effectifs. */
  moyenneNonPonderee: boolean;
}

function proche(texte: string, cible: number, tolerance: number): boolean {
  const valeur = parserNombreOuFraction(texte);
  return valeur !== null && Math.abs(valeur - cible) <= tolerance;
}

export function piegesCentresMoyenneDispersion(exercice: ExerciceDispersion, reponse: ReponseCentresMoyenneDispersion): PiegesCentresMoyenneDispersion {
  const donnees = exercice.enClasses;
  if (!donnees) return { centreEgalBorne: false, moyenneAvecBornes: false, moyenneNonPonderee: false };
  const statut = diagnostiquerCentresMoyenneDispersion(exercice, reponse);
  const moyenneFausse = statut.moyenne === "not_equivalent";
  return {
    centreEgalBorne: donnees.classes.some(
      (c, i) => statut.centres[i] === "not_equivalent" && (proche(reponse.centres[i] ?? "", c.borneInf, TOLERANCE) || proche(reponse.centres[i] ?? "", c.borneSup, TOLERANCE)),
    ),
    // Les deux moyennes « avec les bornes » sont des décimaux courts (x̄ ∓ demi-amplitude) : écart au
    // centième près. La moyenne simple des centres peut avoir plus de décimales : arrondi toléré.
    moyenneAvecBornes: moyenneFausse && (proche(reponse.moyenne, donnees.moyenneBornesInf, 0.01) || proche(reponse.moyenne, donnees.moyenneBornesSup, 0.01)),
    moyenneNonPonderee: moyenneFausse && proche(reponse.moyenne, donnees.moyenneNonPonderee, 0.05),
  };
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

/** Erreur ciblée (audit chapitre 4) : σ saisi = √(Σ/n) calculé sur la variance NON arrondie, au lieu
 * de partir de la variance arrondie comme l'impose le cours. N'est jamais vrai quand les deux
 * calculs donnent la même valeur (σ serait alors simplement correct). */
export function ecartTypeDepuisVarianceNonArrondie(exercice: ExerciceDispersion, texte: string): boolean {
  const valeur = parserNombreOuFraction(texte);
  if (valeur === null) return false;
  const ecartTypeNonArrondi = Math.round(Math.sqrt(exercice.sommeProduits / exercice.n) * 100) / 100;
  if (Math.abs(ecartTypeNonArrondi - exercice.ecartTypeAttendu) <= TOLERANCE) return false;
  return Math.abs(valeur - ecartTypeNonArrondi) <= TOLERANCE;
}

/** Piège « écart-type sans la racine » (diagnostiqué pour la famille "classes") : σ saisi égal à la
 * variance (arrondie ou non). Jamais vrai quand V = σ (V = 0 ou 1). */
export function ecartTypeSansRacine(exercice: ExerciceDispersion, texte: string): boolean {
  if (Math.abs(exercice.varianceAttendue - exercice.ecartTypeAttendu) <= 0.01) return false;
  return proche(texte, exercice.varianceAttendue, 0.01) || proche(texte, exercice.sommeProduits / exercice.n, 0.01);
}
