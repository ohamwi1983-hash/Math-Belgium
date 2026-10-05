/**
 * Contrat — "Moyenne pondérée", trente-deuxième générateur du projet, troisième du chapitre 5
 * ("Statistiques") — voir `promptgen32creation.md`. Part d'un tableau DÉJÀ CONSTRUIT (x_i/n_i, ou
 * classes déjà définies avec leurs effectifs) — contrairement à "Tableau de fréquences", ce
 * générateur ne reconstruit jamais le tableau depuis une liste brute, ce point étant déjà couvert
 * par ce dernier. Le tableau de départ est affiché en donnée FIXE de l'énoncé sur tous les écrans.
 *
 * **2 variantes** (catalogue, voir `generateurs/moyennePonderee/index.ts`) : `"discrete"` (table
 * x_i/n_i déjà donnée) et `"classes"` (classes déjà définies avec bornes+effectif, comme
 * "Regroupement en classes et histogramme" — mêmes noms de champ `borneInf`/`borneSup`/`effectif`
 * pour la cohérence de lecture entre les deux générateurs du chapitre, mais un type INDÉPENDANT,
 * jamais réutilisé/importé : `ClasseHistogramme` embarque `frequencePourcent`, sans rapport avec ce
 * générateur, tandis que `ClasseMoyennePonderee` a besoin d'un champ `centre` que l'autre n'a pas).
 *
 * **Piège central, variante "discrete"** : l'élève doit reconnaître qu'il faut calculer
 * Σ(xᵢ·nᵢ)/Σnᵢ, jamais la moyenne SIMPLE des valeurs distinctes en ignorant les effectifs.
 *
 * **Piège central, variante "classes"** : croire que la moyenne obtenue est une valeur EXACTE —
 * c'est en réalité une ESTIMATION, les valeurs réelles à l'intérieur de chaque classe étant
 * inconnues (isolé dans un écran conceptuel dédié, indépendant des écrans de calcul).
 *
 * **Exactitude par construction — décimales bornées, jamais de tolérance d'arrondi réelle.** `n`
 * (l'effectif total) est toujours choisi parmi des DIVISEURS EXACTS de 100 (`CANDIDATS_N`,
 * `generateurs/moyennePonderee/index.ts` — même pool que "Regroupement en classes et
 * histogramme"), combiné à une boucle de secours qui réessaie le tirage tant que `moyenne` ne
 * s'arrondit pas proprement à 2 décimales (jamais un facteur premier différent de 2/5 qui ferait
 * apparaître une décimale périodique ou trop longue — la variante "classes" introduit un facteur
 * 1/2 supplémentaire via `centre`, susceptible de pousser certains diviseurs de 100 au-delà de 2
 * décimales dans le pire cas, d'où la boucle plutôt qu'une simple preuve arithmétique a priori).
 * Garantit une valeur toujours "propre" — au plus 2 décimales — quels que soient les x_i/effectifs
 * tirés. La vérification finale n'utilise, elle, qu'une tolérance MINIME (`1e-9`, bruit de virgule
 * flottante résiduel) — jamais une vraie marge d'arrondi (spec : "vérification par égalité exacte,
 * sans tolérance numérique").
 */
export type VarianteMoyennePonderee = "discrete" | "classes";

import type { ContexteBienaymeTchebychev } from "./bienaymeTchebychev.types";

export interface LigneMoyennePondereeDiscrete {
  valeur: number;
  effectif: number;
}

export interface ClasseMoyennePonderee {
  /** Borne inférieure, toujours entière. */
  borneInf: number;
  /** Borne supérieure, toujours entière. */
  borneSup: number;
  effectif: number;
  /** (borneInf+borneSup)/2 — toujours exact par construction (bornes entières) : un entier ou un
   * multiple de 0,5, jamais besoin de tolérance. Jamais montré dans l'énoncé initial (l'élève doit
   * le calculer à l'écran "Centres de classe") — voir Couche B pour la révélation progressive. */
  centre: number;
}

interface ExerciceMoyennePondereeCommun {
  /** Banque de contextes narratifs déjà intégrée pour "Inégalité de Bienaymé-Tchebychev"
   * (`generateurs/bienaymeTchebychev/contextes.ts`), réutilisée telle quelle — jamais une seconde
   * banque dupliquée pour ce générateur (`promptgen303132contexte.md`). Habille le tableau initial
   * d'une narration (population + caractère mesuré + unité), sans jamais changer la mécanique de
   * génération/vérification des 2 variantes. */
  contexte: ContexteBienaymeTchebychev;
  /** Effectif total, Σn_i — toujours un diviseur exact de 100 (voir ci-dessus). */
  n: number;
  /** Σ(x_i·n_i) (variante "discrete") ou Σ(centre_i·n_i) (variante "classes") — toujours une
   * décimale finie exacte (entier ou multiple de 0,5). */
  sommeXN: number;
  /** sommeXN / n — toujours arrondie proprement à 2 décimales par construction (voir ci-dessus). */
  moyenne: number;
}

export interface ExerciceMoyennePondereeDiscrete extends ExerciceMoyennePondereeCommun {
  variante: "discrete";
  /** x_i/n_i déjà donnés, triés par valeur croissante — jamais reconstruits depuis une liste brute
   * (ce point est déjà couvert par "Tableau de fréquences"). */
  lignes: LigneMoyennePondereeDiscrete[];
}

export interface ExerciceMoyennePondereeClasses extends ExerciceMoyennePondereeCommun {
  variante: "classes";
  /** Classes déjà données (bornes+effectif imposés, jamais construites par l'élève — mêmes
   * conventions que "Regroupement en classes et histogramme"), triées par borne croissante,
   * toujours 4 ou 5. */
  classes: ClasseMoyennePonderee[];
}

export type ExerciceMoyennePonderee = ExerciceMoyennePondereeDiscrete | ExerciceMoyennePondereeClasses;

export type GenerateurExerciceMoyennePonderee = () => ExerciceMoyennePonderee;
