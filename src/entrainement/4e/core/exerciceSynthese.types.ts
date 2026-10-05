/**
 * Contrat — "Exercice de synthèse" (chapitre 5, remplace intégralement "Étendue et écart
 * interquartile" à la même position, gen35 — `promptgen35synthese.md`). Ce contenu (étendue,
 * bornage médian, quartiles recomptés depuis `m`) disparaît de la plateforme, remplacé par un
 * exercice qui ENCHAÎNE, sur un seul jeu de données et un seul contexte narratif partagés du début
 * à la fin, des écrans directement REPRIS des cinq générateurs précédents du chapitre : "Moyenne
 * pondérée" (gen32), "Paramètres de position" (gen33), "Boîte à moustaches" (gen36), "Paramètres de
 * dispersion" (gen34), "Inégalité de Bienaymé-Tchebychev" (gen37) — dans cet ordre, jamais une suite
 * de mini-exercices indépendants.
 *
 * **Un seul contexte, un seul tableau, sur TOUTE la séquence** (contrainte transversale essentielle
 * de la spec) : `contexte`/le tableau (`lignes` ou `classes`) sont générés UNE SEULE FOIS, jamais
 * régénérés à chaque étape — chaque écran affiche les résultats déjà VALIDÉS aux étapes précédentes
 * (report en cascade sur l'ensemble de l'exercice, pas seulement au sein d'une étape, contrairement
 * au reste du projet).
 *
 * **2 variantes** — mêmes principes de construction que les générateurs sources :
 * - `"discrete"` : table x_i/n_i (`lignes`) — $\bar{x}$ toujours un ENTIER EXACT (construction
 *   "offsets à somme pondérée nulle", dupliquée depuis `generateurs/dispersion/index.ts` : garantit
 *   Σ(x_i·n_i)/n = xBar EXACTEMENT, sans aucune boucle "arrondi propre" nécessaire, contrairement à
 *   "Moyenne pondérée" seul). Médiane/Q1/Q3 toujours des valeurs `x_i` EXACTES de la table (règle
 *   stricte `>` de "Paramètres de position", jamais interpolées).
 * - `"classes"` : classes/effectifs (`classes`) — $\bar{x}$ = la vraie moyenne calculée à l'étape 1
 *   (arrondie proprement à 2 décimales par la même boucle de secours que "Moyenne pondérée" variante
 *   B, JAMAIS une valeur redonnée arbitrairement comme dans "Paramètres de dispersion" seul).
 *   Médiane/Q1/Q3 interpolés sur le polygone des effectifs cumulés (même formule que "Paramètres de
 *   position" variante classes), arrondis à 1 décimale de façon INCONDITIONNELLE (`arrondi1`,
 *   nécessaire pour l'exactitude en virgule flottante du crantage à 0,1 de l'écran boîte à
 *   moustaches réutilisé tel quel — voir `generateurs/exerciceSynthese/index.ts`).
 *
 * **Superset structurel `LigneSynthese`/`ClasseSynthese`** — chaque forme réunit tous les champs
 * requis par CHACUN des contrats sources qu'elle doit satisfaire (`LigneMoyennePondereeDiscrete`,
 * `LigneMedianeDiscrete`, `LigneDispersion` pour `LigneSynthese` ; `ClasseMoyennePonderee`,
 * `ClasseMediane` pour `ClasseSynthese`) : TypeScript autorise une valeur portée par une VARIABLE
 * (jamais un littéral d'objet frais) à satisfaire un type qui en demande MOINS de champs sans
 * aucune vérification d'excès de propriétés — `exercice.lignes`/`exercice.classes` peuvent donc
 * être transmis TELS QUELS aux fonctions de vérification/composants des 5 générateurs sources,
 * jamais reconstruits champ par champ pour chacun.
 *
 * **Étape BT ("gen37" adaptée) — écrite spécifiquement pour cet exercice, pas une réutilisation
 * littérale d'un composant de gen37** (dont les 8 variantes sont chacune typées trop étroitement
 * pour être appliquées telles quelles ici) : `kBT` toujours FIXÉ à 2 (jamais résolu comme dans
 * gen37, dont les variantes retrouvent k depuis un intervalle ou un pourcentage) — `borneInfBT`/
 * `borneSupBT` = $\bar{x}\mp k\sigma$ calculés directement (arrondis à 2 décimales, jamais élargis
 * vers l'extérieur comme la variante 2 de gen37, qui doit couvrir toute combinaison produisant le
 * même pourcentage cible — ici k est déjà fixé, la formule est directe) ; `pourcentAttenduBT` =
 * $100(1-1/k^2)$, toujours exactement 75 pour $k=2$ (aucun arrondi nécessaire). La vérification de
 * ces 2 champs réutilise telle quelle `diagnostiquerIntervalleAttendu`/`verifierIntervalleAttendu`/
 * `diagnostiquerPourcent`/`verifierPourcent` (`moteur/verificationBienaymeTchebychev.ts`, typées
 * structurellement — `{borneInfAttendue,borneSupAttendue}`/`{pourcentAttendu}` — donc réutilisables
 * sans mapper, un simple objet littéral `{borneInfAttendue: exercice.borneInfBT, ...}` suffit).
 */
export type VarianteExerciceSynthese = "discrete" | "classes";

import type { ContexteBienaymeTchebychev } from "./bienaymeTchebychev.types";
import type { PlageAxe } from "./boiteMoustaches.types";

/** Superset — voir l'en-tête du fichier. Satisfait `LigneMoyennePondereeDiscrete`
 * (`{valeur,effectif}`), `LigneMedianeDiscrete` (`{valeur,effectif,effectifCumule}`) et
 * `LigneDispersion` (`{valeur,effectif,produitAttendu}`) simultanément. */
export interface LigneSynthese {
  valeur: number;
  effectif: number;
  /** v_i — effectif cumulé jusqu'à et y compris cette ligne. */
  effectifCumule: number;
  /** (valeur - xBar)² × effectif — TOUJOURS un entier exact (variante "discrete", xBar/valeur/
   * effectif tous entiers). */
  produitAttendu: number;
}

/** Superset — voir l'en-tête du fichier. Satisfait `ClasseMoyennePonderee`
 * (`{borneInf,borneSup,effectif,centre}`) et `ClasseMediane` (`{borneInf,borneSup,effectif,
 * effectifCumule}`) simultanément. */
export interface ClasseSynthese {
  borneInf: number;
  borneSup: number;
  effectif: number;
  /** (borneInf+borneSup)/2 — toujours exact (bornes entières). */
  centre: number;
  /** v_i — effectif cumulé jusqu'à et y compris cette classe. */
  effectifCumule: number;
}

interface ExerciceSyntheseCommun {
  /** Banque de contextes narratifs déjà intégrée pour "Inégalité de Bienaymé-Tchebychev"
   * (`generateurs/bienaymeTchebychev/contextes.ts`), réutilisée telle quelle — tiré UNE SEULE FOIS,
   * partagé par tous les écrans de la synthèse (contrainte transversale de la spec). */
  contexte: ContexteBienaymeTchebychev;
  /** Effectif total, Σn_i. */
  n: number;
  /** Σ(x_i·n_i) (discrete) ou Σ(centre_i·n_i) (classes) — somme brute, jamais arrondie. */
  sommeXN: number;
  /** $\bar{x}$ — moyenne, TOUJOURS déjà la valeur "propre" attendue à l'écran "quotient" (entier
   * exact pour "discrete", arrondie à 2 décimales pour "classes") ; réutilisée telle quelle par les
   * étapes "gen33"/"gen34"/"gen37" suivantes, jamais recalculée ni redonnée arbitrairement. */
  xBar: number;
  /** n/2 — seuil de la médiane. */
  seuil: number;
  /** n/4 — seuil de Q1. */
  seuilQ1: number;
  /** 3n/4 — seuil de Q3. */
  seuilQ3: number;
  /** Médiane $Q_2$ — valeur exacte (discrete) ou interpolée et arrondie à 1 décimale (classes). */
  mediane: number;
  /** $Q_1$ — même principe que `mediane`. */
  q1: number;
  /** $Q_3$ — même principe que `mediane`. */
  q3: number;
  /** Cadrage de l'axe pour l'écran "boîte à moustaches" — même construction que "Boîte à
   * moustaches" (`calculerBornePlage`, dupliquée). */
  bornePlage: PlageAxe;
  /** Σ(x_i-xBar)²·n_i (discrete) ou Σ(centre_i-xBar)²·n_i (classes) — toujours un nombre exact. */
  sommeProduits: number;
  /** sommeProduits/n, arrondi à 2 décimales — voir "Paramètres de dispersion". */
  varianceAttendue: number;
  /** √varianceAttendue (déjà arrondie), arrondi à son tour à 2 décimales — cascade. */
  ecartTypeAttendu: number;
  /** k fixé à 2 pour l'étape Bienaymé-Tchebychev — jamais résolu, contrairement à gen37. */
  kBT: number;
  /** xBar - kBT·ecartTypeAttendu, arrondi à 2 décimales. */
  borneInfBT: number;
  /** xBar + kBT·ecartTypeAttendu, arrondi à 2 décimales. */
  borneSupBT: number;
  /** 100·(1-1/kBT²) — toujours exactement 75 pour kBT=2. */
  pourcentAttenduBT: number;
}

export interface ExerciceSyntheseDiscrete extends ExerciceSyntheseCommun {
  variante: "discrete";
  /** x_i/n_i déjà donnés, triés par valeur croissante — jamais reconstruits depuis une liste brute. */
  lignes: LigneSynthese[];
  /** Index dans `lignes` du premier v_i strictement supérieur à `seuil`. */
  indexMediane: number;
  /** Index dans `lignes` du premier v_i strictement supérieur à `seuilQ1`. */
  indexQ1: number;
  /** Index dans `lignes` du premier v_i strictement supérieur à `seuilQ3`. */
  indexQ3: number;
  /** = lignes[0].valeur. */
  min: number;
  /** = lignes[lignes.length-1].valeur. */
  max: number;
  /** Toutes les valeurs x_i dont l'effectif est maximal — 1 ou plusieurs, jamais 0 (la génération
   * exclut le cas où tous les effectifs sont égaux). */
  modes: number[];
}

export interface ExerciceSyntheseClasses extends ExerciceSyntheseCommun {
  variante: "classes";
  /** Classes déjà données (bornes+effectif imposés), triées par borne croissante, amplitude
   * possiblement DIFFÉRENTE d'une classe à l'autre. */
  classes: ClasseSynthese[];
  /** = classes[0].borneInf. */
  xMin: number;
  /** = classes[classes.length-1].borneSup. */
  xMax: number;
  /** = xMax - xMin. */
  etendue: number;
  /** Index dans `classes` de l'unique classe modale — garantie sans ex-aequo par construction. */
  indexClasseModale: number;
  /** Centre de la classe modale = (borneInf+borneSup)/2 — réponse attendue au champ "Mode". */
  modeCentreClasseModale: number;
}

export type ExerciceSynthese = ExerciceSyntheseDiscrete | ExerciceSyntheseClasses;

export type GenerateurExerciceSynthese = () => ExerciceSynthese;
