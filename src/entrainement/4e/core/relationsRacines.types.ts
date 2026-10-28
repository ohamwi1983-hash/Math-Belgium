/**
 * Couche core — contrat propre au générateur "Relations entre racines et coefficients" (chapitre
 * 2, 4e, soixante-septième générateur, ajout ultérieur). Trois sous-compétences enseignées avec
 * démonstration complète dans le cours (relations de Viète, factorisation générale à partir des
 * racines, construction d'une équation à partir de ses racines) mais jamais exercées par le
 * calcul avant ce générateur — gen1 ("Méthode la plus rapide") ne couvre que la reconnaissance de
 * méthode et la résolution, jamais ces trois points (audit pédagogique du chapitre 2). Séparé en
 * un générateur à part plutôt qu'ajouté à gen1 : signal diagnostique différent (Viète/
 * factorisation/construction ne sont pas "reconnaître la bonne méthode"), et gen1 couvre aussi des
 * équations sans discriminant où ces trois écrans n'auraient pas de sens.
 *
 * Indépendant de src/entrainement/4e/core/generateur.types.ts : réutilise seulement son type
 * `Enonce` (même forme {a,b,c}), pour rester compatible avec `moteur/expressionAlgebrique.ts`
 * (`diagnostiquerFormeFactorisee`/`verifierFormeFactorisee`), déjà utilisé tel quel pour vérifier
 * les deux champs libres de ce générateur.
 */
import type { Enonce } from "./generateur.types";

export interface ExerciceRelationsRacines {
  enonce: Enonce;
  /** x1 <= x2 — égales si racine double (Δ=0, voir generateurs/relationsRacines/index.ts). */
  racines: [number, number];
}

export type GenerateurExerciceRelationsRacines = () => ExerciceRelationsRacines;
