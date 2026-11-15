/**
 * Couche core — « Retrouver une valeur manquante » (gen109, 4e, chapitre 4 « Statistique
 * descriptive », section « moyenne », processus 3 TRANSFÉRER).
 *
 * Une information statistique est connue (moyenne visée, moyenne d'un tableau, médiane voulue,
 * moyenne globale) mais une donnée manque : l'élève la retrouve en trois écrans — poser l'équation
 * (choix fermé : les trois mauvaises équations sont les pièges classiques), la résoudre (champ
 * libre), conclure en contexte (choix fermé).
 */

export type VarianteValeurManquante = "note-a-obtenir" | "effectif-manquant" | "valeur-pour-mediane" | "moyenne-groupes";

/** Signature de difficulté à l'intérieur de chaque variante (profil d'évaluation `forme`). */
export type FormeNote = "sans-coef" | "avec-coef";
export type FormeMediane = "haut" | "bas";
export type FormeGroupes = "globale" | "groupe";

interface Base {
  /** Ordre d'affichage des quatre équations (écran 1) — indice 0 : la bonne. */
  ordreEquations: number[];
  /** Ordre d'affichage des quatre phrases de conclusion (écran 3) — indice 0 : la bonne. */
  ordreConclusions: number[];
}

/** Quelle note obtenir au dernier examen pour atteindre une moyenne visée. */
export interface ExerciceNote extends Base {
  variante: "note-a-obtenir";
  forme: FormeNote;
  /** Identifiant du contexte (`CONTEXTES_NOTE`). */
  contexte: string;
  prenom: string;
  /** Notes déjà connues (sur 20) et leurs coefficients (tous 1 en forme `sans-coef`). */
  notes: number[];
  coefs: number[];
  /** Coefficient de l'épreuve qui reste. */
  coefDernier: number;
  /** Moyenne visée. */
  cible: number;
  /** Solution de l'équation (peut dépasser 20 : c'est alors impossible). */
  inconnue: number;
  /** Verdict, tiré AVANT les nombres (≈ 20 % d'impossibles). */
  possible: boolean;
}

/** Tableau dont un effectif est inconnu, moyenne donnée. */
export interface ExerciceEffectif extends Base {
  variante: "effectif-manquant";
  forme: "effectif";
  contexte: string;
  valeurs: number[];
  /** Effectifs (celui d'indice `indexInconnu` est la réponse, affiché « ? »). */
  effectifs: number[];
  indexInconnu: number;
  moyenne: number;
}

/**
 * Combien de valeurs ajouter (toutes égales à la plus grande — forme `haut` — ou à la plus petite —
 * forme `bas`) pour que la médiane devienne une valeur donnée. Règle du seuil du cours : la médiane
 * est la première valeur dont l'effectif cumulé dépasse STRICTEMENT n/2.
 */
export interface ExerciceMediane extends Base {
  variante: "valeur-pour-mediane";
  forme: FormeMediane;
  contexte: string;
  valeurs: number[];
  effectifs: number[];
  /** Indice (dans `valeurs`) de la médiane actuelle et de la médiane voulue. */
  indexMedianeActuelle: number;
  indexCible: number;
  /** Solution de l'équation « seuil = effectif cumulé » (écran 2). */
  k0: number;
  /** Plus petit nombre de valeurs à ajouter (k0 en forme `haut`, k0 + 1 en forme `bas`). */
  kMin: number;
}

/** Moyenne globale de deux groupes, ou moyenne d'un groupe connaissant la globale. */
export interface ExerciceGroupes extends Base {
  variante: "moyenne-groupes";
  forme: FormeGroupes;
  contexte: string;
  n1: number;
  m1: number;
  n2: number;
  m2: number;
  globale: number;
}

export type ExerciceValeurManquante = ExerciceNote | ExerciceEffectif | ExerciceMediane | ExerciceGroupes;
