import type { DroiteExpliciteX, DroiteExpliciteY, DroiteImplicite, DroiteParametrique } from "./droite.types";
import type { Composantes, Point } from "./vecteur.types";

export type FormeEntreeCartesienne = "implicite" | "explicite_y" | "explicite_x";
export type FormeEntreeRelation = FormeEntreeCartesienne | "parametrique";
export type FormeSortieRelation = "cartesienne" | "parametrique";
export type CritereRelation = "parallele" | "perpendiculaire";

export type VarianteRelationsDroites =
  | "cart_vers_cart_parallele"
  | "cart_vers_cart_perpendiculaire"
  | "cart_vers_param_parallele"
  | "cart_vers_param_perpendiculaire"
  | "param_vers_cart_parallele"
  | "param_vers_cart_perpendiculaire";

/**
 * Un seul pipeline à 3 écrans (extraction → construction → équation), paramétré par
 * (formeEntree, formeSortie, critere) plutôt que 6 blocs de code séparés — voir CLAUDE.md.
 * `pointReference` reste un détail de construction interne, jamais montré à l'élève : seul
 * `pointCherche` (le point par lequel la droite cherchée doit passer) fait partie de l'énoncé.
 */
export interface ExerciceRelationsDroites {
  variante: VarianteRelationsDroites;
  formeEntree: FormeEntreeRelation;
  formeSortie: FormeSortieRelation;
  critere: CritereRelation;
  parametriqueEntree: DroiteParametrique | null;
  impliciteEntree: DroiteImplicite | null;
  expliciteYEntree: DroiteExpliciteY | null;
  expliciteXEntree: DroiteExpliciteX | null;
  vecteurReference: Composantes;
  pointCherche: Point;
  vecteurCherche: Composantes;
  referenceImpliciteSortie: DroiteImplicite;
}

export type GenerateurExerciceRelationsDroites = () => ExerciceRelationsDroites;
