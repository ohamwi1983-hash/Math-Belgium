/**
 * Contrat — "Regroupement en classes et histogramme", trente-et-unième générateur du projet,
 * second du chapitre 5 ("Statistiques"), à la suite de "Tableau de fréquences" — voir
 * `promptcreationgenerateur31histogramme.md`. À partir d'une liste de données brutes et de classes
 * imposées (bornes données par l'énoncé, jamais construites par l'élève), regrouper les données en
 * classes, calculer les effectifs (et éventuellement les fréquences), puis tracer l'histogramme
 * correspondant.
 *
 * **2 variantes** (catalogue, voir plus bas) : `"effectif"` (hauteur des barres = effectif) et
 * `"frequence"` (hauteur des barres = fréquence en %).
 *
 * **Amplitude constante uniquement** (spec, "Contrainte de génération") : toutes les classes ont
 * toujours la même amplitude entre elles — l'amplitude variable n'est jamais générée dans ce
 * catalogue, elle casserait la convention hauteur=effectif/fréquence (qui exige alors une aire
 * proportionnelle, pas une hauteur proportionnelle), hors périmètre de ce générateur.
 *
 * **Convention de frontière** (spec) : borne inférieure incluse, borne supérieure exclue, SAUF la
 * dernière classe qui inclut aussi sa borne supérieure — voir `estDerniereClasse`
 * (`ui/formatHistogramme.ts`). Notation francophone à crochets inversés déjà établie ailleurs dans
 * le projet (`[borneInf ; borneSup[`, `]` pour la dernière classe).
 *
 * **Exactitude par construction, jamais de tolérance nécessaire pour arrondir un pourcentage
 * périodique — divergence assumée par rapport à `CANDIDATS_N` du trentième générateur.** Le trentième
 * exercice ("Tableau de fréquences") choisit `n` de la forme `2^a·5^b`, ce qui garantit une écriture
 * décimale FINIE mais pas nécessairement un pourcentage ENTIER (ex. `n=16` donne des multiples de
 * 6,25 %). Insuffisant ici : l'écran final de tracé accroche le glissement de chaque barre sur une
 * grille de exactement 1 % pour la variante "fréquence" — un pourcentage non entier (ex. 18,75 %)
 * ne serait alors JAMAIS atteignable par l'élève via ce glissement cranté. `n` est donc choisi ici
 * parmi des **diviseurs exacts de 100** (voir `generateurs/histogramme/index.ts::CANDIDATS_N`) —
 * `100/n` étant alors lui-même un entier, `effectif*(100/n)` est TOUJOURS un entier exact, quel que
 * soit l'effectif tiré, garantissant que chaque fréquence est bien atteignable par un cranté entier.
 *
 * **Aucune donnée brute jamais exactement sur une frontière de classe** (spec, "Convention de
 * frontière") : chaque donnée brute est une décimale à 1 chiffre STRICTEMENT à l'intérieur de sa
 * classe (`borneInf < valeur < borneSup`, bornes elles-mêmes toujours entières) — par construction,
 * aucune valeur ne peut donc jamais coïncider avec une borne entière, tout en permettant des valeurs
 * volontairement PROCHES d'une frontière (ex. `borneSup - 0,1`) pour créer le piège pédagogique de
 * classement à la frontière que `donneeFrontiere`/l'Aide 1 de l'écran "Classement" référencent.
 */
import type { ContexteBienaymeTchebychev } from "./bienaymeTchebychev.types";

export type VarianteHistogramme = "effectif" | "frequence";

export interface ClasseHistogramme {
  /** Borne inférieure, toujours incluse. */
  borneInf: number;
  /** Borne supérieure, exclue sauf pour la dernière classe (voir `estDerniereClasse`). */
  borneSup: number;
  /** Nombre de données brutes tombant dans cette classe selon la convention de frontière. */
  effectif: number;
  /** `effectif*100/n`, toujours un entier exact par construction (voir ci-dessus, `n` diviseur de 100). */
  frequencePourcent: number;
}

/**
 * Une donnée brute choisie délibérément PROCHE d'une frontière (`classes[classeIndex].borneSup -
 * 0,1`, jamais exactement dessus) — sert de support unique à l'Aide 1 de l'écran "Classement"
 * ("modélise le cas piège sans le résoudre pour les autres", spec) : montre comment appliquer la
 * convention d'inclusion/exclusion sur CETTE donnée précise, sans jamais répéter l'exercice pour
 * les autres frontières de l'exercice.
 */
export interface DonneeFrontiereHistogramme {
  valeur: number;
  /** Index dans `classes` — la donnée appartient TOUJOURS à cette classe (jamais la suivante),
   * puisqu'elle reste strictement inférieure à `classes[classeIndex].borneSup`. Jamais la dernière
   * classe (il faut une classe suivante avec laquelle la frontière est partagée). */
  classeIndex: number;
}

export interface ExerciceHistogramme {
  /** Banque de contextes narratifs déjà intégrée pour "Inégalité de Bienaymé-Tchebychev"
   * (`generateurs/bienaymeTchebychev/contextes.ts`), réutilisée telle quelle — jamais une seconde
   * banque dupliquée pour ce générateur (`promptgen303132contexte.md`). Habille la liste brute
   * d'une narration (population + caractère mesuré + unité), sans jamais changer la mécanique de
   * génération/vérification des écrans. */
  contexte: ContexteBienaymeTchebychev;
  variante: VarianteHistogramme;
  /** Taille totale de l'échantillon, toujours un diviseur exact de 100 (voir ci-dessus). */
  n: number;
  /** Amplitude commune à toutes les classes (constante, jamais variable — voir ci-dessus). */
  amplitude: number;
  /** Classes triées par borne croissante, amplitude constante entre elles — toujours 4 ou 5. */
  classes: ClasseHistogramme[];
  /** Liste brute, `n` valeurs décimales à 1 chiffre, mélangée (Fisher-Yates) — jamais déjà triée,
   * jamais exactement sur une frontière de classe (voir ci-dessus). */
  donneesBrutes: number[];
  /** Support de l'Aide 1 de l'écran "Classement" — voir `DonneeFrontiereHistogramme`. */
  donneeFrontiere: DonneeFrontiereHistogramme;
}

export type GenerateurExerciceHistogramme = () => ExerciceHistogramme;
