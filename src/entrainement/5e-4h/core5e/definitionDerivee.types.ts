/**
 * Couche core (5e) — contrat pour 5gen26 ("Calculer f'(a) par la définition"), 2e générateur du
 * chapitre "Dérivées et applications", à la suite de 5gen25. 4 familles STRUCTURELLEMENT DISJOINTES
 * (union discriminée par `famille`), UNE seule tirée par exercice. `a` porte UNE SEULE valeur — le
 * pipeline en 3 écrans (développer/quotient/limite) ne s'exécute qu'une fois par exercice (voir
 * `prompt5gen26unevaleurareecriture.md`, remplace l'ancienne structure à 2 passages). Type pur,
 * aucune logique.
 */

/** Famille 1 — f(x)=m·x+p, m≠0 (dérivée constante, cas le plus simple : le h se simplifie sans
 * reste). `a` : aucune contrainte de domaine (f définie sur tout ℝ). */
export interface ExerciceDefinitionDeriveeAffine {
  famille: "affine";
  m: number;
  p: number;
  a: number;
}

/** Famille 2 — f(x)=m·x²+p, m≠0 (le développement de (a+h)² introduit le terme croisé 2ah, piège
 * classique). `a` : aucune contrainte de domaine. */
export interface ExerciceDefinitionDeriveeQuadratique {
  famille: "quadratique";
  m: number;
  p: number;
  a: number;
}

/** Famille 3 — f(x)=k/x (expo=1) ou k/x² (expo=2), k≠0. `a` : jamais 0 (pôle en x=0), ni pour `a`
 * lui-même ni pour les échantillons de h utilisés en vérification (garanti par construction : `a`
 * toujours de magnitude ≥1). */
export interface ExerciceDefinitionDeriveeRationnelleSimple {
  famille: "rationnelleSimple";
  k: number;
  expo: 1 | 2;
  a: number;
}

/** Famille 4 — f(x)=(m·x+p)/(x−q), m≠0. `a` : jamais égal à `q` (pôle), toujours à distance ≥1 de
 * `q` par construction. */
export interface ExerciceDefinitionDeriveeRationnelleLineaire {
  famille: "rationnelleLineaire";
  m: number;
  p: number;
  q: number;
  a: number;
}

/** Famille 5 (lot C, audit 5e ch. 5 — fin de catalogue) — f(x)=m·x²+n·x+p, m≠0, n≠0 (quadratique
 * complète : le terme en x s'ajoute au double produit). `a` ≠ 0. */
export interface ExerciceDefinitionDeriveeQuadratiqueComplete {
  famille: "quadratiqueComplete";
  m: number;
  n: number;
  p: number;
  a: number;
}

/** Famille 6 (lot C, fin de catalogue) — f(x)=k·√(x+c), k≥1 : a + c = s² (s entier de 1 à 4), le
 * taux d'accroissement se simplifie par l'expression conjuguée (cours, § 1 ; lien avec 5gen64). */
export interface ExerciceDefinitionDeriveeRacine {
  famille: "racine";
  k: number;
  c: number;
  a: number;
}

export type ExerciceDefinitionDerivee =
  | ExerciceDefinitionDeriveeAffine
  | ExerciceDefinitionDeriveeQuadratiqueComplete
  | ExerciceDefinitionDeriveeRacine
  | ExerciceDefinitionDeriveeQuadratique
  | ExerciceDefinitionDeriveeRationnelleSimple
  | ExerciceDefinitionDeriveeRationnelleLineaire;

export type GenerateurExerciceDefinitionDerivee = () => ExerciceDefinitionDerivee;
