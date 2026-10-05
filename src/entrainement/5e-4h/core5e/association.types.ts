/**
 * Couche core (5e) — contrat pour 5gen25 ("Association graphique/mots ↔ signe de f'/f''"), premier
 * générateur du chapitre "Dérivées et applications". 3 familles STRUCTURELLEMENT DISJOINTES (union
 * discriminée par `famille`), UNE seule tirée par exercice. Type pur, aucune logique.
 *
 * Convention commune aux 3 familles : `n` éléments NUMÉROTÉS (1..n, index de tableau = numéro-1) et
 * `n` candidats LETTRÉS (A, B, C...), le candidat affiché en position de lettre `j` correspondant
 * TOUJOURS à l'élément `ordreLettres[j]` (permutation de `[0..n-1]`, jamais l'identité — voir
 * générateur pour la garantie de dérangement). La lettre correcte pour l'élément numéroté `i` se
 * retrouve par `ordreLettres.indexOf(i)`, jamais stockée deux fois (source de vérité unique).
 */

/** Polynôme (coefficients ascendants) — même convention que `generateurs5e/domaineDefinition/polynome.ts`. */
export type PolynomeAssociation = number[];

/** Famille A — graphique de f (numéroté) ↔ graphique de f' (lettré, mélangé). */
export interface ExerciceAssociationGrapheDerivee {
  famille: "grapheDerivee";
  fonctions: PolynomeAssociation[];
  ordreLettres: number[];
}

/**
 * Famille A avancée — variante enrichie de la famille A (`prompt5gen25varianteavanceerichessegraphique.md`),
 * togglable indépendamment du tirage de base (jamais mélangée dans `POIDS`/`genererExerciceAssociation`
 * — accessible UNIQUEMENT via le sélecteur dev, exactement comme "toggle indépendant" le demande).
 * `fonctions[i]` = polynôme de fond (degré ≤ 2) + au plus UNE caractéristique graphique ajoutée.
 */
export type TypeCaracteristiqueAssociation =
  | "angulaire" // catégorie 1 — dérivées à gauche/droite différentes et finies
  | "cuspide" // catégorie 1 — point de rebroussement, f' → ±∞ des deux côtés
  | "tangenteVerticale" // catégorie 1 — inflexion à tangente verticale, f' → +∞ des deux côtés
  | "asymptoteVerticale" // catégorie 2 — exclusion de domaine, aucune option supplémentaire
  | "discontinuite" // catégorie 2 — saut, exclusion de domaine
  | "pointVide"; // catégorie 2 — point isolé exclu, valeurs identiques de part et d'autre

/** Catégorie 1 (`prompt5gen25varianteavanceerichessegraphique.md`) — seule catégorie dont la bonne
 * réponse est "f' n'existe pas ici" plutôt qu'une lettre ; jamais distinguée par sous-type (un seul
 * libellé regroupe les trois, cohérent avec le raisonnement attendu). */
const CARACTERISTIQUES_CATEGORIE_1: readonly TypeCaracteristiqueAssociation[] = ["angulaire", "cuspide", "tangenteVerticale"];

export function estCategorie1(type: TypeCaracteristiqueAssociation): boolean {
  return CARACTERISTIQUES_CATEGORIE_1.includes(type);
}

export interface CaracteristiqueAssociation {
  type: TypeCaracteristiqueAssociation;
  /** Abscisse à laquelle la caractéristique est centrée — toujours strictement à l'intérieur du
   * domaine affiché, jamais au bord (marge fixe imposée à la génération). */
  position: number;
  /** Amplitude de la caractéristique (jamais négative ni nulle) — contrôle la netteté visuelle
   * (hauteur du coin/rebroussement, force de l'asymptote/saut) sans jamais changer son TYPE. */
  intensite: number;
}

export interface FonctionRicheAssociation {
  /** Polynôme de fond, degré ≤ 2 — toujours lisse, seule `caracteristique` peut introduire un
   * point non lisse ou une exclusion de domaine. */
  base: PolynomeAssociation;
  /** Absente ⟹ fonction "plate" (juste le polynôme de fond), comme la famille A de base. */
  caracteristique?: CaracteristiqueAssociation;
}

/** Famille A avancée — voir le commentaire ci-dessus. `singulier[i]` vrai ⟺ l'élément i est
 * catégorie 1 : sa bonne réponse au menu déroulant est "f' n'existe pas ici", jamais une lettre —
 * voir `reponseCorrecteAssociation`. La lettre qui lui est associée par `ordreLettres` reste
 * affichée comme candidat (un graphique de f' plausible mais jamais la bonne réponse d'AUCUN
 * élément), un distracteur ordinaire parmi d'autres. */
export interface ExerciceAssociationGrapheDeriveeAvancee {
  famille: "grapheDeriveeAvancee";
  fonctions: FonctionRicheAssociation[];
  singulier: boolean[];
  ordreLettres: number[];
}

/** Famille B — graphique de f (numéroté) ↔ énoncé verbal décrivant f'/f'' (lettré, mélangé). */
export interface ExerciceAssociationGrapheVerbal {
  famille: "grapheVerbal";
  fonctions: PolynomeAssociation[];
  /** `enonces[j]` décrit `fonctions[ordreLettres[j]]` — texte français déjà formé (varié par
   * gabarit, jamais un patron unique répété), affiché tel quel. */
  enonces: string[];
  ordreLettres: number[];
}

/** Famille C — fonction f (numérotée, LaTeX) ↔ dérivée g (lettrée, LaTeX, mélangée). */
export interface ExerciceAssociationSymbolique {
  famille: "symbolique";
  fLatex: string[];
  /** `gLatex[j]` est la dérivée de `fLatex[ordreLettres[j]]`, en LaTeX. */
  gLatex: string[];
  ordreLettres: number[];
}

export type ExerciceAssociation =
  | ExerciceAssociationGrapheDerivee
  | ExerciceAssociationGrapheDeriveeAvancee
  | ExerciceAssociationGrapheVerbal
  | ExerciceAssociationSymbolique;

export type GenerateurExerciceAssociation = () => ExerciceAssociation;

/** Nombre d'éléments de l'exercice — commun aux 4 familles, jamais recalculé différemment. */
export function nombreElementsAssociation(exercice: ExerciceAssociation): number {
  return exercice.famille === "symbolique" ? exercice.fLatex.length : exercice.fonctions.length;
}

/** Lettre correcte (index 0-based, A=0) pour l'élément numéroté `indexItem`. */
export function lettreCorrecte(ordreLettres: number[], indexItem: number): number {
  return ordreLettres.indexOf(indexItem);
}

/** Réponse correcte au menu déroulant de l'élément `indexItem` — une lettre (0-based) pour les 3
 * familles historiques ET pour un élément non singulier de la famille A avancée, ou `"aucune"`
 * exactement pour un élément singulier (catégorie 1) de la famille A avancée. `singulier` absent
 * (3 familles historiques) ⟹ comportement inchangé, toujours une lettre. */
export function reponseCorrecteAssociation(ordreLettres: number[], singulier: boolean[] | undefined, indexItem: number): number | "aucune" {
  if (singulier?.[indexItem]) return "aucune";
  return lettreCorrecte(ordreLettres, indexItem);
}
