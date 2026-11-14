/**
 * Couche core (6e) — contrat de `6gen90` « Échelles logarithmiques : rapports et sommes »
 * (chapitre 3, section « problèmes », processus 3 TRANSFÉRER). 6gen22 calcule déjà pH, décibels et
 * magnitude À PARTIR DE LA FORMULE ; ici l'élève RAISONNE sur l'échelle : un écart sur l'échelle
 * correspond à un RAPPORT de la grandeur physique, et un facteur sur la grandeur à un ÉCART
 * (additif) sur l'échelle.
 *
 * Onze variantes = contexte × type de question (le `forme` du profil d'évaluation) :
 * - type « facteur » (rapport → écart) : la grandeur est multipliée/divisée par k, nouveau niveau ?
 *   (`db-sources`, `db-reduire`, `seisme-magnitude`, `ph-diluer`, `etoiles-magnitude`) ;
 * - type « rapport » (écart → rapport) : deux niveaux donnés, combien de fois plus ?
 *   (`db-comparer`, `seisme-amplitude`, `seisme-energie`, `ph-comparer`, `etoiles-eclat`) ;
 * - type « écart inverse » : combien de sources pour atteindre un niveau (`db-combien`).
 *
 * Régime (`regime`) tiré AVANT les nombres : « exacte » quand le facteur est une puissance de 10
 * entière (ou le logarithme du rapport un entier), « calculatrice » sinon (log 2, 10^2,7…). Toutes
 * les variantes ont des instances des deux régimes.
 */

export type IdVarianteEchelles =
  | "db-sources"
  | "db-reduire"
  | "db-combien"
  | "db-comparer"
  | "seisme-amplitude"
  | "seisme-energie"
  | "seisme-magnitude"
  | "ph-comparer"
  | "ph-diluer"
  | "etoiles-eclat"
  | "etoiles-magnitude";

export type TypeQuestionEchelles = "facteur" | "rapport" | "combien";

export type RegimeEchelles = "exacte" | "calculatrice";

export interface ExerciceEchellesLogarithmiques {
  variante: IdVarianteEchelles;
  regime: RegimeEchelles;
  /** Indice du contexte narratif dans la liste propre à la variante (`ui6e/formatEchellesLogarithmiques.ts`). */
  contexte: number;
  /** Second contexte (variantes « comparer » : la seconde source/substance), sinon −1. */
  contexte2: number;
  /** Valeur de départ sur l'échelle : L₁ (dB), M₁, pH₀ / pH_A, m_A. */
  v1: number;
  /** Seconde valeur sur l'échelle (« rapport » : L₂, M₂, pH_B, m_B ; « combien » : niveau visé), sinon 0. */
  v2: number;
  /** Facteur k (ou nombre n de sources) des variantes « facteur », sinon 0. */
  k: number;
  /** `etoiles-magnitude` : l'étoile B paraît k fois « plus » ou « moins » lumineuse que A. */
  sens: "plus" | "moins";
  /** Permutation des 4 options de l'écran « traduire » : `ordreOptions[i]` = indice canonique de
   * l'option affichée en i-ème position (l'option canonique 0 est la bonne). */
  ordreOptions: number[];
}

export function typeQuestion(v: IdVarianteEchelles): TypeQuestionEchelles {
  if (v === "db-combien") return "combien";
  if (v === "db-comparer" || v === "seisme-amplitude" || v === "seisme-energie" || v === "ph-comparer" || v === "etoiles-eclat") return "rapport";
  return "facteur";
}
