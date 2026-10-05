/**
 * Couche core (5e) — contrat propre à `5gen2` ("Décomposer une fonction composée"). Indépendant de
 * tout contrat 4e — voir CLAUDE.md, "Chantier 5e FWB (4h)".
 *
 * f(x) est construite par composition de 2 à 4 couches. La couche la plus INTÉRIEURE (couche 1,
 * appliquée directement à x) est tirée soit dans un catalogue fermé à 7 entrées nommées, soit sous
 * une forme "brute" non cataloguée (`a·xⁿ+b·xᵐ`, jamais une entrée nommée) — voir
 * `generateurs5e/decompositionFonction/index.ts` pour la fréquence de tirage de cette dernière.
 * Les couches intermédiaires et la couche finale (quand elle n'est pas un habillage affine) restent
 * toujours parmi les 6 entrées catalogue non-affines (jamais "brute", réservée à la couche 1 —
 * jamais "puissance4", retirée du catalogue).
 *
 * **Choix de représentation pour "brute"** : ajoutée comme 8e VALEUR de `TypeCoucheCatalogue`
 * plutôt qu'un champ séparé (`estBrute: boolean` + une interface `ParametresBrute` dédiée) — les
 * deux options étaient ouvertes, celle-ci retenue car elle profite de l'exhaustivité de switch déjà
 * imposée par TypeScript sur ce type dans les 2 consommateurs existants (`appliquerCouche`,
 * `LIBELLE_TYPE_COUCHE`, tous deux `Record`/`switch` sur `TypeCoucheCatalogue`) : oublier de gérer
 * "brute" quelque part y devient une erreur de compilation, jamais un cas silencieusement ignoré —
 * une garantie qu'un champ séparé n'aurait pas offerte aussi directement.
 *
 * La couche la plus extérieure peut aussi être une transformation affine du résultat de la couche
 * précédente plutôt qu'une entrée nommée du catalogue (`estAffineFinale`).
 */
export type TypeCoucheCatalogue = "affine" | "carre" | "cube" | "racineCarree" | "racineCubique" | "inverse" | "valeurAbsolue" | "brute";

export interface CoucheGeneree {
  type: TypeCoucheCatalogue;
  /** true UNIQUEMENT pour la dernière couche quand elle est un "a·(précédent)+b" plutôt qu'une
   * entrée nommée du catalogue — distinct de `type==="affine"`, qui peut aussi apparaître comme
   * couche la plus INTÉRIEURE (appliquée à x directement, un choix de catalogue comme un autre).
   * Toujours `false` pour `type==="brute"` (jamais la couche finale, voir plus haut). */
  estAffineFinale: boolean;
  /** LaTeX de l'expression sur laquelle CETTE couche s'applique (avant elle) — sert aux aides
   * (désignation de la portion concernée, sans révéler la couche elle-même). */
  argumentLatex: string;
  /** LaTeX/formule de CETTE couche prise isolément, appliquée à x — ex. "3x-1" pour un affine(3,-1)
   * — jamais dérivé de argumentLatex (qui peut être une expression composée) : sert uniquement à
   * la révélation d'UN exemple valide de décomposition (jamais comparé à la réponse de l'élève,
   * la vérification n'accepte QUE la reconstruction effective — voir moteur5e). */
  propreLatex: string;
  propreFormule: string;
}

export interface ExerciceDecompositionFonction {
  /** nombre de couches réellement tirées (2-4) — jamais comparé à la réponse de l'élève, qui peut
   * soumettre un nombre de lignes différent tant que la composition reconstruit f(x). */
  profondeur: number;
  fLatex: string;
  /** syntaxe `evaluerExpressionGenerale` (src/moteur/expressionGenerale.ts, 4e, réutilisée
   * cross-chantier — petit évaluateur pur générique) — pour la vérification par composition. */
  fFormule: string;
  couches: CoucheGeneree[];
}

export type GenerateurExerciceDecompositionFonction = () => ExerciceDecompositionFonction;
