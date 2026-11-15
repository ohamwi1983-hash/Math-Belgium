/**
 * Contrat — "Paramètres de dispersion", trente-quatrième générateur du projet, remplace
 * intégralement "Mode et classe modale" (`promptgen34remplacement.md`) à la même position (gen34).
 * Ce contenu (mode multiple, absence de mode, classe modale isolée) disparaît de la plateforme,
 * remplacé par le calcul de la variance et de l'écart-type à partir d'un tableau x_i/n_i déjà
 * construit.
 *
 * **Famille ajoutée (fiche validée, 4e ch. 4) : données groupées en classes** — catalogue de
 * variantes `"valeurs"` (famille historique décrite ci-dessous, INCHANGÉE) / `"classes"` (voir
 * `DonneesClassesDispersion` : centres de classes et x̄ à calculer par l'élève sur un écran
 * supplémentaire, puis le même tableau et le même écran variance/écart-type, avec les centres).
 *
 * Famille `"valeurs"` : $\bar{x}$ est TOUJOURS donné directement dans l'énoncé (jamais recalculé par l'élève dans ce
 * générateur — cette compétence est déjà couverte par "Moyenne pondérée") — mais reste
 * mathématiquement COHÉRENT avec le tableau x_i/n_i (Σ(x_i·n_i)/n = xBar exactement), jamais une
 * valeur incohérente avec les données affichées.
 *
 * **Exactitude par construction, écran 1 — jamais de tolérance d'arrondi nécessaire.** `xBar` et
 * tous les `x_i`/`n_i` sont TOUJOURS des entiers — garantit que chaque produit `(x_i-xBar)²·n_i`,
 * ainsi que `Σ(x_i-xBar)²·n_i` et `Σn_i`, sont TOUJOURS des entiers exacts (jamais besoin d'une
 * boucle "arrondiPropre" comme "Moyenne pondérée" : un entier moins un entier reste un entier, son
 * carré aussi, son produit par un entier aussi).
 *
 * **Écran 2 — cascade de valeurs déjà arrondies, même principe que "Inégalité de
 * Bienaymé-Tchebychev" (`promptgen37refonte.md`).** `varianceAttendue` est le seul champ réellement
 * arrondi du contrat (2 décimales, `Math.round`) — `sommeProduits/n` n'a aucune raison d'être une
 * décimale "propre" (contrairement à la moyenne de "Moyenne pondérée", volontairement contrainte à
 * l'être) : le générateur accepte cette réalité plutôt que de la contourner, et la présentation
 * (`ui/formatDispersion.ts`) affiche "=" ou "≈" selon qu'un arrondi a RÉELLEMENT eu lieu pour
 * l'instance générée (même règle que gen37, `estArrondiExact`). `ecartTypeAttendu` est ensuite
 * calculé à partir de `varianceAttendue` DÉJÀ ARRONDIE (`√varianceAttendue`, jamais du ratio brut
 * non arrondi) — cascade, cohérent avec "Écart-type σ=√V, déduit de la variance validée juste
 * au-dessus" (spec) — puis arrondi lui-même à 2 décimales.
 */
import type { ContexteBienaymeTchebychev } from "./bienaymeTchebychev.types";

export interface LigneDispersion {
  valeur: number;
  effectif: number;
  /** (valeur - xBar)² × effectif — TOUJOURS un entier exact par construction (voir ci-dessus). */
  produitAttendu: number;
}

export interface ExerciceDispersion {
  /** Banque de contextes narratifs déjà intégrée pour "Inégalité de Bienaymé-Tchebychev"
   * (`generateurs/bienaymeTchebychev/contextes.ts`), réutilisée telle quelle — jamais une seconde
   * banque dupliquée pour ce générateur. */
  contexte: ContexteBienaymeTchebychev;
  /** Effectif total, Σn_i — toujours un entier strictement positif. */
  n: number;
  /** Moyenne DONNÉE directement dans l'énoncé — toujours un entier, toujours cohérente avec les
   * x_i/n_i du tableau (Σ(x_i·n_i)/n = xBar exactement). */
  xBar: number;
  /** x_i/n_i déjà donnés, triés par valeur croissante — jamais reconstruits depuis une liste brute
   * (ce point reste l'exclusivité de "Tableau de fréquences"). */
  lignes: LigneDispersion[];
  /** Σ(x_i-xBar)²·n_i — toujours un entier exact (voir ci-dessus). */
  sommeProduits: number;
  /** sommeProduits / n, arrondi à 2 décimales — voir "cascade" ci-dessus. */
  varianceAttendue: number;
  /** √varianceAttendue (déjà arrondie), arrondi à son tour à 2 décimales — voir "cascade" ci-dessus. */
  ecartTypeAttendu: number;
  /** Présent SEULEMENT pour la famille `"classes"` (absent = famille `"valeurs"` ; toujours absent
   * pour les exercices fabriqués par `versDispersion` de l'exercice de synthèse, qui gardent donc
   * exactement le comportement historique). Dans ce cas, `lignes[i].valeur` est le CENTRE de la
   * classe i, `xBar` (décimal à au plus 1 décimale) est à calculer par l'élève, et les produits
   * `(xᵢ − x̄)²·nᵢ` sont des décimaux exacts à au plus 2 décimales (stockés arrondis au centième,
   * sans bruit flottant), de même que `sommeProduits`. */
  enClasses?: DonneesClassesDispersion;
}

/** Famille de gen34 (catalogue de variantes, `generateurs/dispersion/index.ts`) : `"valeurs"` —
 * série discrète, x̄ DONNÉ (famille historique, inchangée) ; `"classes"` — données groupées en
 * classes, l'élève calcule les centres et x̄ lui-même (écran supplémentaire « centres et moyenne »),
 * puis la variance et l'écart-type avec les centres. */
export type FamilleDispersion = "valeurs" | "classes";

/** Une classe `[borneInf ; borneSup[` (la dernière fermée des deux côtés) — famille `"classes"`. */
export interface ClasseDispersion {
  borneInf: number;
  borneSup: number;
  effectif: number;
  /** (borneInf + borneSup) / 2 — toujours un entier par construction (amplitude paire en unités). */
  centre: number;
}

/** Données propres à la famille `"classes"` : les classes affichées (sans leurs centres), et les
 * valeurs des pièges diagnostiqués à l'écran « centres et moyenne ». */
export interface DonneesClassesDispersion {
  classes: ClasseDispersion[];
  /** Σ(centre·nᵢ) — entier exact. */
  sommeCentresN: number;
  /** Piège « bornes au lieu des centres » : moyenne calculée avec les bornes inférieures, puis avec
   * les bornes supérieures (valeurs exactes). */
  moyenneBornesInf: number;
  moyenneBornesSup: number;
  /** Piège « x̄ non pondéré » : moyenne simple des centres (jamais égale à x̄ par construction). */
  moyenneNonPonderee: number;
}

export type GenerateurExerciceDispersion = () => ExerciceDispersion;

/** Famille d'une instance (absence de `enClasses` = famille historique `"valeurs"`). */
export function familleDispersion(exercice: ExerciceDispersion): FamilleDispersion {
  return exercice.enClasses ? "classes" : "valeurs";
}
