/**
 * Types de gen111 — « Diagrammes et graphiques trompeurs » (4e, chapitre 4 « Statistique
 * descriptive », section `frequences`, processus 2 APPLIQUER).
 *
 * Trois variantes (catalogue du sélecteur et des feuilles) :
 * - `circulaire-construire` : fréquences ↔ angles d'un diagramme circulaire, dans les deux sens
 *   (`direct` : effectifs → fréquences → angles ; `inverse` : angles lus → fréquences → effectifs) ;
 * - `lire-diagramme` : lire un diagramme en bâtons (`batons`) ou un diagramme circulaire en
 *   pourcentages avec une part inconnue (`circulaire`) ;
 * - `trompeur` : un graphique manipulé (axe tronqué, pictogrammes agrandis, graduations
 *   irrégulières, parts dont le total ne fait pas 100 %) — repérer la manipulation (choix fermé),
 *   lire les vraies valeurs, corriger la conclusion chiffrée.
 */

export type VarianteDiagrammes = "circulaire-construire" | "lire-diagramme" | "trompeur";

export type Manipulation = "axe-tronque" | "pictogrammes" | "echelle-irreguliere" | "total-faux";

export type SousTypeDiagrammes = "direct" | "inverse" | "batons" | "circulaire" | Manipulation;

/** Une catégorie d'un diagramme circulaire : effectif (pourcentage = effectif / n × 100). */
export interface Secteur {
  nom: string;
  effectif: number;
}

/** Contexte d'une série qualitative (diagramme circulaire). */
export interface ContexteCategoriel {
  /** Phrase d'énoncé, « {n} » remplacé par l'effectif total (« On a interrogé {n} élèves sur… »). */
  phrase: string;
  /** Titre court du diagramme (« Moyen de transport »). */
  titre: string;
  /** Nom de la colonne des catégories (« Moyen de transport »). */
  colonne: string;
  /** « élèves » */
  individus: string;
}

export interface ExerciceCirculaire {
  variante: "circulaire-construire" | "lire-diagramme";
  sousType: "direct" | "inverse" | "circulaire";
  contexte: ContexteCategoriel;
  secteurs: Secteur[];
  n: number;
  /** `circulaire` (lecture) : indice du secteur dont le pourcentage est remplacé par « ? ». */
  inconnu: number | null;
}

export type ConditionGroupe = "au-moins" | "au-plus" | "plus-de" | "moins-de";

/** Contexte d'une série discrète (diagramme en bâtons). */
export interface ContexteDiscret {
  /** « le nombre de frères et sœurs » */
  caractere: string;
  /** Libellé court de l'axe horizontal (« frères et sœurs »). */
  axe: string;
  individus: string;
  /** Groupe en mots, ex. (seuil 2, « au-moins ») → « ont au moins 2 frères et sœurs ». */
  groupe: (condition: ConditionGroupe, seuil: number) => string;
}

export interface ExerciceBatons {
  variante: "lire-diagramme";
  sousType: "batons";
  /** Indice dans la banque de contextes discrets (le contexte contient une fonction). */
  contexte: number;
  valeurs: { x: number; effectif: number }[];
  condition: ConditionGroupe;
  seuil: number;
}

/** Contexte d'une évolution dans le temps (graphiques trompeurs). */
export interface ContexteEvolution {
  /** Qui publie le graphique (« Un magasin de vélos »). */
  auteur: string;
  /** Ce qui est représenté, vu par l'auteur (« ses ventes de vélos électriques »). */
  grandeur: string;
  /** Complément de « pourcentage d'augmentation » (« de ses ventes »). */
  complement: string;
  /** « Ventes » (titre court du slogan) */
  court: string;
  /** Unité affichée sur l'axe et demandée dans les champs (« vélos »). */
  unite: string;
}

export interface ExerciceTrompeurBarres {
  variante: "trompeur";
  sousType: "axe-tronque" | "echelle-irreguliere" | "pictogrammes";
  contexte: ContexteEvolution;
  /** Pictogrammes seulement : forme du dessin. */
  dessin: "maison" | "bouteille" | null;
  /** Une barre (ou un dessin) par année ; la conclusion compare la première et la dernière. */
  barres: { annee: number; valeur: number }[];
  /** Valeurs écrites aux graduations de l'axe vertical, régulièrement ESPACÉES sur le dessin (pour
   * une échelle irrégulière, les écarts de valeurs diffèrent ; pour un axe tronqué, la première
   * n'est pas 0). */
  graduations: number[];
  /** Ordre (mélangé) des quatre manipulations proposées à l'écran 1. */
  options: Manipulation[];
}

export interface ExerciceTrompeurCirculaire {
  variante: "trompeur";
  sousType: "total-faux";
  /** « les sports pratiqués » */
  caractere: string;
  /** « sport » (singulier, « plusieurs sports ») */
  objet: string;
  individus: string;
  n: number;
  /** Pourcentages AFFICHÉS (leur somme dépasse 100). */
  parts: { nom: string; pourcentage: number }[];
  options: Manipulation[];
}

export type ExerciceDiagrammesTrompeurs = ExerciceCirculaire | ExerciceBatons | ExerciceTrompeurBarres | ExerciceTrompeurCirculaire;
