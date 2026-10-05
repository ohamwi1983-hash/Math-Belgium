/**
 * Couche core — contrat propre au générateur "Forme canonique et transformations" (chapitre 1).
 * Deuxième générateur du chapitre à utiliser Mafs, dans la continuité directe de "Transformations
 * graphiques" (voir CLAUDE.md) : mêmes paramètres de fond (xS/yS ↔ p/q, EV/CV/SOX), mais organisés
 * ici en une séquence de 4 étapes fixes (forme canonique → TH → EV/CV/SOX → TV) plutôt qu'un seul
 * écran à deux notes indépendantes. Comme `ExerciceTransformationGraphique`, ce contrat ne réutilise
 * aucun type des autres exercices — seul un sous-ensemble de champs structurellement identique
 * (`ev`, `cv`, `sox`) permet de réutiliser telle quelle `calculerA`
 * (src/moteur/verificationTransformationsGraphiques.ts).
 */

export interface ExerciceFormeCanoniqueTransformation {
  /** xS attendu — abscisse du sommet, entier dans [-5,5]. */
  xS: number;
  /** yS attendu — ordonnée du sommet, entier dans [-5,5]. */
  yS: number;
  /** EV attendu — étirement vertical, entier dans [1,5] (1 = neutre). */
  ev: number;
  /** CV attendu — compression verticale, entier dans [1,5] (1 = neutre), tiré indépendamment
   * d'`ev` — même principe que "Transformations graphiques" (`|a| = ev/cv`). */
  cv: number;
  /** SOX attendu — symétrie orthogonale d'axe Ox (signe de a). */
  sox: boolean;
}

export type GenerateurExerciceFormeCanoniqueTransformation = () => ExerciceFormeCanoniqueTransformation;

/** Étape 1 — Forme canonique : xS et yS, retrouvés depuis ax²+bx+c affiché (a non redemandé), plus
 * `formeCanonique` — champ libre où l'élève écrit la forme canonique complète (ex.
 * "-4/3(x-2)^2+1"), vérifié structurellement (refonte, section 1b). */
export interface ReponseCanonique {
  xS: number;
  yS: number;
  formeCanonique: string;
}

/** Étape 2 — Translation horizontale : le curseur TH, plus `fonctionIntermediaire` — champ libre
 * où l'élève écrit la fonction intermédiaire (x-xS)² (refonte, section 2). */
export interface ReponseTh {
  th: number;
  fonctionIntermediaire: string;
}

/** Étape 3 — EV/CV/SOX : les 3 curseurs/toggle de cette étape, soumis ensemble (vérification par
 * rapport EV/CV, même principe que "Transformations graphiques"), plus `fonctionIntermediaire` —
 * champ libre où l'élève écrit la fonction intermédiaire a(x-xS)² (refonte, section 3). */
export interface ReponseEvCvSox {
  ev: number;
  cv: number;
  sox: boolean;
  fonctionIntermediaire: string;
}

/** Étape 4 — Translation verticale : le curseur TV, plus `fonctionIntermediaire` — champ libre où
 * l'élève écrit la fonction finale complète a(x-xS)²+yS (refonte, section 4). */
export interface ReponseTv {
  tv: number;
  fonctionIntermediaire: string;
}
