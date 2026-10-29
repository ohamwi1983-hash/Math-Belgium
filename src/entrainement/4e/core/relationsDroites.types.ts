import type { DroiteExpliciteX, DroiteExpliciteY, DroiteImplicite, DroiteParametrique } from "./droite.types";
import type { Composantes, Point } from "./vecteur.types";

export type FormeEntreeCartesienne = "implicite" | "explicite_y" | "explicite_x";
export type FormeEntreeRelation = FormeEntreeCartesienne | "parametrique";
export type FormeSortieRelation = "cartesienne" | "parametrique";
export type CritereRelation = "parallele" | "perpendiculaire";

/** Deux familles d'exercices (audit chapitre 7, gen45 point 23) :
 * - `construction` — construire la droite d′ parallèle/perpendiculaire à d par un point donné
 *   (extraction → construction → équation) ;
 * - `reconnaissance` — deux droites d₁ et d₂ données, l'élève reconnaît LUI-MÊME leur relation
 *   (extraction du vecteur de d₁ → extraction du vecteur de d₂ → relation), sans qu'elle soit
 *   écrite dans l'énoncé. */
export type FamilleRelationsDroites = "construction" | "reconnaissance";

/** Relation à reconnaître — « parallèles » désigne toujours deux droites DISTINCTES (jamais
 * confondues, par construction). */
export type RelationReconnue = "paralleles" | "perpendiculaires" | "aucune";

export type VarianteRelationsDroites =
  | "cart_vers_cart_parallele"
  | "cart_vers_cart_perpendiculaire"
  | "cart_vers_param_parallele"
  | "cart_vers_param_perpendiculaire"
  | "param_vers_cart_parallele"
  | "param_vers_cart_perpendiculaire"
  | "reconnaissance_cartesiennes"
  | "reconnaissance_mixte";

/** Une droite donnée dans l'énoncé, dans sa forme d'entrée — une seule des 4 entrées est non nulle,
 * celle de `formeEntree`. */
export interface DroiteDonneeRelation {
  formeEntree: FormeEntreeRelation;
  parametriqueEntree: DroiteParametrique | null;
  impliciteEntree: DroiteImplicite | null;
  expliciteYEntree: DroiteExpliciteY | null;
  expliciteXEntree: DroiteExpliciteX | null;
  /** Vecteur directeur canonique — tout multiple non nul est accepté à l'extraction. */
  vecteur: Composantes;
}

/**
 * Un pipeline à 3 écrans, paramétré par la famille puis par (formeEntree, formeSortie, critere)
 * plutôt que 8 blocs de code séparés — voir CLAUDE.md. Nommage aligné sur le cours (« Trouve d′,
 * perpendiculaire à d, passant par C ») : la droite donnée s'appelle `d` (vecteur $\vec u$), la
 * droite cherchée `d′` (vecteur $\vec v$) — jamais « b », qui se confondait avec le coefficient b
 * de `ax+by+c=0` (audit chapitre 7, gen45 point 21). `pointReference` reste un détail de
 * construction interne, jamais montré à l'élève : seul `pointCherche` (le point par lequel d′ doit
 * passer, jamais situé sur d) fait partie de l'énoncé.
 *
 * Famille `reconnaissance` : la droite donnée (champs `formeEntree`/`…Entree`/`vecteurReference`)
 * est d₁, `droite2` est d₂, `relation` la relation à reconnaître. `formeSortie`/`critere`/
 * `pointCherche`/`vecteurCherche`/`referenceImpliciteSortie` n'y sont pas utilisés (remplis par
 * des valeurs neutres, jamais affichés).
 */
export interface ExerciceRelationsDroites {
  variante: VarianteRelationsDroites;
  famille: FamilleRelationsDroites;
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
  /** Famille `reconnaissance` uniquement — la seconde droite d₂. */
  droite2: DroiteDonneeRelation | null;
  /** Famille `reconnaissance` uniquement. */
  relation: RelationReconnue | null;
}

export type GenerateurExerciceRelationsDroites = () => ExerciceRelationsDroites;
