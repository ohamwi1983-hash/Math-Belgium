import type { Symbole } from "../../core/inequation.types";
import type { FacteurSignesProduit, GenerateurExerciceSignesProduit } from "../../core/signesProduit.types";
import { randomInt } from "../secondDegre/aleatoire";
import { construireFacteurFactorisable } from "./construireFacteurFactorisable";
import { construireFacteurIrreductible } from "./construireFacteurIrreductible";
import { construireFacteurLineaire } from "./construireFacteurLineaire";
import { classifierSolutionProduit, construireGrille, extraireSignesZones } from "./grille";

type TypeFacteur = "lineaire" | "quadratique_irreductible" | "quadratique_factorisable";

/**
 * Multisets de types valides, construits pour respecter deux contraintes structurelles (section 1
 * de la spec) plutôt que tirés puis filtrés a posteriori (même principe que le reste du projet,
 * voir CLAUDE.md) :
 * - au plus 1 facteur quadratique factorisable : chacun apporte 2 racines, en avoir 2 dépasserait
 *   le budget de 3 racines / 4 zones visé par la spec ("généralisée pour gérer jusqu'à 3 racines /
 *   4 zones") ;
 * - au moins 1 racine au total : exclut le triplet 100% irréductible (produit de signe constant,
 *   aucun travail de tableau de signes, exercice dégénéré).
 * 9 patterns au total (4 à 2 facteurs, 5 à 3 facteurs), tirés uniformément.
 */
const PATTERNS: TypeFacteur[][] = [
  ["lineaire", "lineaire"],
  ["lineaire", "quadratique_irreductible"],
  ["lineaire", "quadratique_factorisable"],
  ["quadratique_irreductible", "quadratique_factorisable"],
  ["lineaire", "lineaire", "lineaire"],
  ["lineaire", "lineaire", "quadratique_irreductible"],
  ["lineaire", "quadratique_irreductible", "quadratique_irreductible"],
  ["lineaire", "quadratique_irreductible", "quadratique_factorisable"],
  ["quadratique_irreductible", "quadratique_irreductible", "quadratique_factorisable"],
];

/**
 * Identifiants de variante (convention RETROFIT-variantes-generateurs.md) — un id par entrée de
 * `PATTERNS` ci-dessus, dans le MÊME ordre (une désynchronisation entre les deux tableaux serait une
 * erreur de nommage, verrouillée par un test dédié dans `index.test.ts`). Table fournie par
 * l'utilisateur lors de la demande de rétrofit (L = linéaire, QI = quadratique irréductible, QF =
 * quadratique factorisable) : 2L, 1L-1QI, 1L-1QF, 1QI-1QF, 3L, 2L-1QI, 1L-2QI, 1L-1QI-1QF, 2QI-1QF.
 */
export type VarianteSignesProduitId =
  | "deux_lineaires"
  | "lineaire_irreductible"
  | "lineaire_factorisable"
  | "irreductible_factorisable"
  | "trois_lineaires"
  | "deux_lineaires_irreductible"
  | "lineaire_deux_irreductibles"
  | "lineaire_irreductible_factorisable"
  | "deux_irreductibles_factorisable";

export interface VarianteSignesProduit {
  id: VarianteSignesProduitId;
  label: string;
}

export const CATALOGUE_VARIANTES: VarianteSignesProduit[] = [
  { id: "deux_lineaires", label: "2 facteurs linéaires (2L)" },
  { id: "lineaire_irreductible", label: "1 facteur linéaire + 1 facteur irréductible (1L-1QI)" },
  { id: "lineaire_factorisable", label: "1 facteur linéaire + 1 facteur factorisable (1L-1QF)" },
  { id: "irreductible_factorisable", label: "1 facteur irréductible + 1 facteur factorisable (1QI-1QF)" },
  { id: "trois_lineaires", label: "3 facteurs linéaires (3L)" },
  { id: "deux_lineaires_irreductible", label: "2 facteurs linéaires + 1 facteur irréductible (2L-1QI)" },
  { id: "lineaire_deux_irreductibles", label: "1 facteur linéaire + 2 facteurs irréductibles (1L-2QI)" },
  { id: "lineaire_irreductible_factorisable", label: "1 facteur linéaire + 1 facteur irréductible + 1 facteur factorisable (1L-1QI-1QF)" },
  { id: "deux_irreductibles_factorisable", label: "2 facteurs irréductibles + 1 facteur factorisable (2QI-1QF)" },
];

const PATTERN_PAR_ID: Record<VarianteSignesProduitId, TypeFacteur[]> = {
  deux_lineaires: PATTERNS[0],
  lineaire_irreductible: PATTERNS[1],
  lineaire_factorisable: PATTERNS[2],
  irreductible_factorisable: PATTERNS[3],
  trois_lineaires: PATTERNS[4],
  deux_lineaires_irreductible: PATTERNS[5],
  lineaire_deux_irreductibles: PATTERNS[6],
  lineaire_irreductible_factorisable: PATTERNS[7],
  deux_irreductibles_factorisable: PATTERNS[8],
};

const SYMBOLES: Symbole[] = ["<", ">", "≤", "≥"];

function melanger<T>(valeurs: T[]): T[] {
  const copie = [...valeurs];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function construireDepuisPattern(pattern: TypeFacteur[]): ReturnType<GenerateurExerciceSignesProduit> {
  const facteurs: FacteurSignesProduit[] = [];
  let racinesUtilisees: number[] = [];

  for (const type of melanger(pattern)) {
    if (type === "lineaire") {
      const { facteur, racine } = construireFacteurLineaire(racinesUtilisees);
      facteurs.push(facteur);
      racinesUtilisees = [...racinesUtilisees, racine];
    } else if (type === "quadratique_irreductible") {
      facteurs.push(construireFacteurIrreductible());
    } else {
      const { facteur, racines } = construireFacteurFactorisable(racinesUtilisees);
      facteurs.push(facteur);
      racinesUtilisees = [...racinesUtilisees, ...racines];
    }
  }

  const symbole = SYMBOLES[randomInt(0, SYMBOLES.length - 1)];
  const { racines, grille } = construireGrille(facteurs);
  const solution = classifierSolutionProduit(racines, extraireSignesZones(grille.produit), symbole);

  return { facteurs, symbole, racines, grille, solution };
}

/**
 * Joue le rôle de `construireAvecVarianteId` pour ce générateur (convention RETROFIT-variantes-
 * generateurs.md) — force le pattern (multiset de types), mais l'ORDRE d'affichage des facteurs
 * reste mélangé comme au tirage brut (`melanger`, section 1 de la spec) : forcer le pattern ne
 * force jamais quel facteur apparaît en premier.
 */
export function construireAvecVarianteId(varianteId: VarianteSignesProduitId): ReturnType<GenerateurExerciceSignesProduit> {
  return construireDepuisPattern(PATTERN_PAR_ID[varianteId]);
}

/**
 * Implémentation de la Couche A (section 1 de la spec) : jusqu'à 3 facteurs, types tirés parmi
 * PATTERNS puis mélangés (ordre d'affichage aléatoire), racines garanties distinctes par
 * construction — chaque constructeur reçoit la liste des racines déjà utilisées par les facteurs
 * précédents et l'exclut activement, jamais de tirage-puis-rejet global.
 */
export const genererExerciceSignesProduit: GenerateurExerciceSignesProduit = () => {
  return construireDepuisPattern(PATTERNS[randomInt(0, PATTERNS.length - 1)]);
};
