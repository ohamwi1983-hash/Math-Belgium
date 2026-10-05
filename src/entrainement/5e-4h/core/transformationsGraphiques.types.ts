/**
 * Couche core — contrat propre au générateur "Transformations graphiques" (chapitre 1).
 * f(x) = a(x-p)²+q à partir de la parabole de référence y=x², manipulée via 4 curseurs (TH, TV,
 * EV, CV) et un toggle (SOX) — terminologie imposée par la spec, utilisée telle quelle dans
 * l'interface. Contrairement aux exercices 3/4/5/6/"Analyse d'une fonction", ce contrat ne
 * réutilise PAS `Exercice`/`Enonce` de l'exercice 1 : il n'y a ni catégorie ni forme d'affichage
 * ici, seulement 5 paramètres nus. La vérification de l'équation reconstruit un `Enonce` {a,b,c}
 * équivalent à la volée (voir src/moteur/verificationTransformationsGraphiques.ts) pour réutiliser
 * telle quelle `verifierFormeFactorisee` (expressionAlgebrique.ts, exercice 1).
 */

export interface ExerciceTransformationGraphique {
  /** TH attendu — translation horizontale, entier dans [-5,5]. */
  p: number;
  /** TV attendu — translation verticale, entier dans [-5,5]. */
  q: number;
  /** EV attendu — étirement vertical, entier dans [1,5] (1 = neutre). */
  ev: number;
  /** CV attendu — compression verticale, entier dans [1,5] (1 = neutre). Choisi indépendamment
   * d'`ev` (prompt-generation-vrais-rapports.md) — `|a| = ev/cv` couvre nativement les entiers
   * (cv=1), les fractions unitaires (ev=1) et les vrais rapports non triviaux (ev=2,cv=3 → 2/3). */
  cv: number;
  /** SOX attendu — symétrie orthogonale d'axe Ox (signe de a). */
  sox: boolean;
}

export type GenerateurExerciceTransformationGraphique = () => ExerciceTransformationGraphique;

/** Position des 4 curseurs + le toggle, telle que soumise par l'élève (ou telle qu'affichée en
 * temps réel pour la courbe manipulable du bouton "Aide"). */
export interface ReponseCurseurs {
  th: number;
  tv: number;
  ev: number;
  cv: number;
  sox: boolean;
}

/** Soumission complète de l'écran unique : le champ équation ET la position des curseurs,
 * toujours envoyés ensemble par le même bouton "Valider" (section 2 de la spec). */
export interface ReponseTransformationGraphique {
  equation: string;
  curseurs: ReponseCurseurs;
}
