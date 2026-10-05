import type { ExerciceEquationRationnelle, GenerateurExerciceEquationRationnelle } from "../../core/equationRationnelle.types";
import { construireUnDenominateur } from "./construireUnDenominateur";
import { construireDeuxDenominateurs } from "./construireDeuxDenominateurs";
import { construireDeuxFractionsLineaires } from "./construireDeuxFractionsLineaires";
import { construireCas4a } from "./construireCas4a";
import { construireCas4b } from "./construireCas4b";

const CONSTRUCTEURS: Array<() => ExerciceEquationRationnelle> = [
  construireUnDenominateur,
  construireDeuxDenominateurs,
  construireDeuxFractionsLineaires,
  construireCas4a,
  construireCas4b,
];

/**
 * Identifiant de variante (convention RETROFIT-variantes-generateurs.md) — réutilise directement le
 * champ `construction` déjà présent sur `ExerciceEquationRationnelle` (union discriminée, voir
 * `core/equationRationnelle.types.ts`), id naturel déjà existant, contrairement à l'exercice 2.
 * Point d'attention documenté dans AUDIT-variantes-generateurs.md, section 5 : `construction:
 * "deux_fractions_lineaires"` tire en interne l'une de 3 sous-variantes (a/b/c), jamais exposée
 * dans le contrat retourné — forcer cette variante ne force donc PAS la sous-variante, qui reste
 * tirée aléatoirement à chaque appel, comportement cohérent avec la demande (aucun sous-niveau
 * prévu par la convention).
 */
export type VarianteEquationRationnelleId = ExerciceEquationRationnelle["construction"];

export interface VarianteEquationRationnelle {
  id: VarianteEquationRationnelleId;
  label: string;
}

/** Proposition à valider par l'utilisateur (voir RETROFIT-variantes-generateurs.md). */
export const CATALOGUE_VARIANTES: VarianteEquationRationnelle[] = [
  { id: "un_denominateur", label: "Un seul dénominateur (A/(x-p) = x-q)" },
  { id: "deux_denominateurs", label: "Deux dénominateurs avec un facteur commun" },
  { id: "deux_fractions_lineaires", label: "Deux fractions du 1er degré (P1/P1 = P1/P1)" },
  { id: "p2_sur_p1", label: "P2/P1 = P0/P1 (numérateur gauche du 2nd degré)" },
  { id: "p1_sur_p2", label: "P1/P2 = P1/P0 (dénominateur gauche du 2nd degré)" },
];

const CONSTRUCTEURS_PAR_ID: Record<VarianteEquationRationnelleId, () => ExerciceEquationRationnelle> = {
  un_denominateur: construireUnDenominateur,
  deux_denominateurs: construireDeuxDenominateurs,
  deux_fractions_lineaires: construireDeuxFractionsLineaires,
  p2_sur_p1: construireCas4a,
  p1_sur_p2: construireCas4b,
};

/**
 * Joue le rôle de `construireAvecVarianteId` pour ce générateur (convention RETROFIT-variantes-
 * generateurs.md).
 */
export function construireAvecVarianteId(varianteId: VarianteEquationRationnelleId): ExerciceEquationRationnelle {
  return CONSTRUCTEURS_PAR_ID[varianteId]();
}

/**
 * Implémentation de la Couche A pour l'exercice "L'inconnue au dénominateur" : tire avec un poids
 * égal entre les 5 constructions (spec-equations-rationnelles-un-denominateur.md /
 * prompt-deux-denominateurs-racine-etrangere.md / prompt-2-cas3-degre1.md / prompt-cas4a-4b.md) —
 * répartition à affiner globalement plus tard (pour l'instant 1/5 chacune). L'élève ne doit jamais
 * pouvoir deviner à l'avance dans quel cas il se trouve à partir de la seule apparence de l'énoncé.
 */
export const genererExerciceEquationRationnelle: GenerateurExerciceEquationRationnelle = () => {
  const index = Math.floor(Math.random() * CONSTRUCTEURS.length);
  return CONSTRUCTEURS[index]();
};
