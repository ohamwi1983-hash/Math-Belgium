/**
 * Couche core (6e) — contrat de `6gen80` « Accumuler une grandeur : débits, puissances,
 * consommations » (chapitre 4, section « problèmes », processus 3 TRANSFÉRER). Exercice EN CONTEXTE :
 * un TAUX (débit, puissance, intensité de pluie, rythme d'entrée, taux d'émission) est donné en
 * fonction du temps ; la quantité accumulée est son intégrale, augmentée de la quantité initiale
 * quand elle existe.
 *
 * Huit variantes = quatre situations × type de question de transfert (le `forme` du profil
 * d'évaluation) :
 * - cuve (débit d'entrée e(t), débit de sortie s(t), volume initial) : volume maximal (débit net
 *   nul) ou instant où la cuve est vide ;
 * - salle (rythme d'entrée r(t), personnes déjà présentes, capacité) : instant où la salle est pleine ;
 * - panneaux solaires : instant où la batterie est pleine (modèle sinusoïdal) ou comparaison de deux
 *   installations (modèle polynomial) ;
 * - pluie : instant où une hauteur donnée est tombée (averse exponentielle) ou comparaison d'un orage
 *   et d'une pluie fine (modèle polynomial) ;
 * - CO₂ (taux d'émission exponentiel, quantité déjà émise) : instant où le budget carbone est épuisé.
 *
 * Toutes les instances suivent la même chaîne de 5 écrans (voir `moteur6e/typesAccumulerGrandeur.ts`).
 * Les paramètres sont tirés pour que les variantes « exactes » donnent des entiers ou des décimaux
 * finis ; les autres exigent la calculatrice (sinus, exponentielle).
 */

export type IdVarianteAccumulerGrandeur =
  | "cuve-max"
  | "cuve-vide"
  | "salle-pleine"
  | "solaire-seuil"
  | "solaire-comparer"
  | "pluie-seuil"
  | "pluie-comparer"
  | "co2-seuil";

interface Base {
  /** Permutation des 4 options de l'écran « modèle » : `ordreOptions[i]` = indice canonique de
   * l'option affichée en i-ème position (l'option canonique 0 est la bonne). */
  ordreOptions: number[];
}

/** Cuve : e(t) = E (constant), s(t) = s0 + c·t (L/min, t en min), V(0) = V0. Débit net
 * r(t) = a − c·t avec a = E − s0 ; V(t) = V0 + a·t − c·t²/2 = −(c/2)(t − tVide)(t + tN). */
export interface ExerciceCuve extends Base {
  variante: "cuve-max" | "cuve-vide";
  contexte: "cuve" | "bassin" | "citerne";
  E: number;
  s0: number;
  c: number;
  V0: number;
  /** Instant (min) où la cuve est vide (racine positive de V). */
  tVide: number;
  /** Instant de l'écran « quantité » (min), strictement avant le maximum : e(t) > s(t) sur [0 ; T]. */
  T: number;
}

/** Salle : r(t) = a + b·t (personnes/min, t en min), N(0) = N0, capacité C atteinte en tPlein. */
export interface ExerciceSalle extends Base {
  variante: "salle-pleine";
  contexte: "concert" | "stade" | "festival";
  N0: number;
  a: number;
  b: number;
  tPlein: number;
  capacite: number;
  T: number;
}

/** Panneaux solaires, modèle sinusoïdal : P(t) = Pm·sin(π(t − lever)/D) en W, t en heures. */
export interface ExerciceSolaireSeuil extends Base {
  variante: "solaire-seuil";
  Pm: number;
  lever: number;
  D: number;
  t1: number;
  t2: number;
  /** Énergie (W·h) qui remplit la batterie, comptée depuis le lever du soleil. */
  Ebatterie: number;
}

/** Une installation du modèle polynomial : P(t) = k(t − debut)(fin − t) en W sur [debut ; fin]. */
export interface InstallationSolaire {
  k: number;
  debut: number;
  fin: number;
}

export interface ExerciceSolaireComparer extends Base {
  variante: "solaire-comparer";
  A: InstallationSolaire;
  /** Plus puissante au maximum, mais produisant moins longtemps (ombragée matin et soir). */
  B: InstallationSolaire;
}

/** Averse qui faiblit : i(t) = I0·e^(−k·t) en mm/h pendant D heures ; toit de `aireToit` m². */
export interface ExercicePluieSeuil extends Base {
  variante: "pluie-seuil";
  I0: number;
  k: number;
  D: number;
  /** Hauteur (mm) dont on cherche l'instant où elle est atteinte. */
  Hcible: number;
  aireToit: number;
}

/** Orage i(t) = c·t(D − t) mm/h sur [0 ; D], puis pluie fine constante m mm/h pendant D2 heures. */
export interface ExercicePluieComparer extends Base {
  variante: "pluie-comparer";
  c: number;
  D: number;
  m: number;
  D2: number;
  aireToit: number;
}

/** CO₂ : r(t) = r0·e^(k·t) kt/an, t en années depuis le 1er janvier `annee0` ; `Q0` kt déjà émises
 * depuis `anneeReference` ; budget `budget` kt depuis `anneeReference`. */
export interface ExerciceCo2 extends Base {
  variante: "co2-seuil";
  r0: number;
  k: number;
  annee0: number;
  anneeReference: number;
  Q0: number;
  T: number;
  budget: number;
}

export type ExerciceAccumulerGrandeur =
  | ExerciceCuve
  | ExerciceSalle
  | ExerciceSolaireSeuil
  | ExerciceSolaireComparer
  | ExercicePluieSeuil
  | ExercicePluieComparer
  | ExerciceCo2;
