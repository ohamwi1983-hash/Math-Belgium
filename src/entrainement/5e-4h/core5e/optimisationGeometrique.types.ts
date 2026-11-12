/**
 * Couche core (5e) — contrat pour 5gen32 ("Optimisation géométrique"), chapitre "Dérivées et
 * applications". f'(x) n'est JAMAIS fournie : l'élève la calcule lui-même à l'écran "deriver"
 * (vérifiée par différence finie centrée, voir `moteur5e/verificationOptimisationGeometrique.ts`).
 * 6 familles d'optimisation STRUCTURELLEMENT DISJOINTES dans le tirage libre + 1 variante
 * "cubique" accessible SEULEMENT par le sélecteur de variantes (audit 5e ch. 5, décision H) :
 *
 *   - "trapeze"   (famille A) — aire d'un trapèze isocèle en fonction de l'angle α (RADIANS pour
 *     les calculs, degrés pour la réponse finale — convention ci-dessous) ; TOUJOURS un maximum.
 *     Nature justifiée, comme partout, par le SIGNE DE A' en deux points test (plus de test A'').
 *     A'(α)=0 se ramène à 2l·u²+b·u−l=0 (u=cos α) par sin²α = 1 − cos²α (jamais cos 2α).
 *   - "cylindre"  (famille B) — aire totale d'un cylindre à volume fixé V = coeffV·π, minimisée en
 *     x = rayon. `avecApplicationNumerique` ajoute un écran "application" (coût du matériau).
 *   - "margesA"/"margesB" (famille C) — page dont la zone imprimée (x × y) est entourée de marges
 *     gauche/droite de largeur m_h et haut/bas de hauteur m_v ; "margesA" = aire totale T fixée →
 *     maximiser l'aire imprimée ; "margesB" = aire imprimée A fixée → minimiser l'aire totale.
 *   - "fenetreA"/"fenetreB" (famille D) — fenêtre rectangle (largeur 2r, hauteur h) surmontée
 *     d'un demi-cercle de rayon r ; "fenetreA" = périmètre P fixé → maximiser l'aire ; "fenetreB" =
 *     aire A fixée → minimiser le périmètre.
 *   - "cubique" (variante du sélecteur, hors tirage libre) — reconstruction d'un polynôme cubique
 *     à partir de conditions en langage naturel (ce n'est pas de l'optimisation).
 *
 * Deux régimes par famille (audit 5e ch. 5, décision H) : données « exactes » (optimum entier ou
 * fraction simple, construit à l'envers) OU données « calculatrice » (données entières tirées
 * librement, optimum irrationnel à arrondir au centième). Les deux régimes partagent EXACTEMENT les
 * mêmes formules — seule la donnée d'énoncé change.
 *
 * Convention RADIANS (famille "trapeze") : α est manipulé en RADIANS dans A(α), A'(α) (la règle
 * (sin x)' = cos x n'est vraie qu'en radians) ; l'angle optimal et les points test sont donnés en
 * DEGRÉS (plus lisible), convertis en interne.
 */
import type { FractionExacte } from "./limites.types";

export type FamilleOptimisation = "trapeze" | "cylindre" | "margesA" | "margesB" | "fenetreA" | "fenetreB" | "cubique";

/** Valeur exacte de la forme `rationnel + coeffPi·π` — réutilisée pour toute donnée d'énoncé
 * combinant un exact rationnel et un multiple de π (volume du cylindre : rationnel=0 ; périmètre/
 * aire de la fenêtre : les deux parts non nulles). Jamais un flottant reconstruit après coup. */
export interface ValeurAvecPi {
  rationnel: number;
  coeffPi: number;
}

export interface ExerciceTrapeze {
  famille: "trapeze";
  /** Base (entier tiré). */
  b: number;
  /** Côté latéral (entier tiré). */
  l: number;
  /** u = cos(α_opt) : fraction EXACTE simple choisie EN PREMIER ("construction à l'envers") dans
   * le régime exact, `null` dans le régime calculatrice (u irrationnel, racine positive de
   * 2l·u²+b·u−l=0) — voir `generateurs5e/optimisationGeometrique/index.ts::construireTrapeze`. */
  u: FractionExacte | null;
}

export interface ExerciceCylindre {
  famille: "cylindre";
  /** x_opt (rayon optimal) = ∛(coeffV/2) — entier dans le régime exact, irrationnel sinon. */
  xOpt: number;
  /** V = coeffV·π cm³, coeffV TOUJOURS entier (= 2·x_opt³ dans le régime exact). */
  coeffV: number;
  /** Variante bonus RARE — écran "application" additionnel après "conclure". */
  avecApplicationNumerique: boolean;
  /** Prix du matériau en € par cm² (variante bonus uniquement, quelques centimes) — coût =
   * prixUnitaire × aire totale minimale, substitution numérique simple, jamais une 2e optimisation. */
  prixUnitaireMateriau?: number;
}

export interface ExerciceMarges {
  famille: "margesA" | "margesB";
  mh: number;
  mv: number;
  /** Aire totale FIXÉE (donnée d'énoncé), uniquement pour "margesA". */
  T?: number;
  /** Aire imprimée FIXÉE (donnée d'énoncé), uniquement pour "margesB". */
  A?: number;
  /** x_opt (largeur imprimée optimale) — entier choisi EN PREMIER dans le régime exact (T/A dérivés
   * "à l'envers"), irrationnel dans le régime calculatrice (T/A entiers tirés librement). */
  xOpt: number;
}

export interface ExerciceFenetre {
  famille: "fenetreA" | "fenetreB";
  /** Périmètre extérieur FIXÉ, uniquement pour "fenetreA". */
  P?: ValeurAvecPi;
  /** Aire FIXÉE, uniquement pour "fenetreB". */
  A?: ValeurAvecPi;
  /** r_opt (rayon optimal) — entier dans le régime exact (P/A donnés en fonction de π), irrationnel
   * dans le régime calculatrice (P/A entiers). */
  rOpt: number;
}

export interface ExerciceCubique {
  famille: "cubique";
  a: number;
  /** b=-3·a·x2/2, dérivé — TOUJOURS entier (x2 tiré pair). */
  b: number;
  /** x₂≠0, 2e abscisse à tangente horizontale (donnée d'énoncé). */
  x2: number;
  /** d=f(0), donnée d'énoncé (point de passage en x=0). */
  d: number;
  /** x₃≠0, ≠x₂ idéalement — 2e point de passage (donnée d'énoncé). */
  x3: number;
  /** y₃=f(x₃), calculé EXACTEMENT depuis le polynôme complet — donnée d'énoncé (garantit que
   * l'écran "résoudre pour a" retombe EXACTEMENT sur `a`). */
  y3: number;
}

export type ExerciceOptimisation = ExerciceTrapeze | ExerciceCylindre | ExerciceMarges | ExerciceFenetre | ExerciceCubique;
export type GenerateurExerciceOptimisation = () => ExerciceOptimisation;
