/**
 * Contrat — "Inégalité de Bienaymé-Tchebychev" (chapitre 5) — **refonte complète**
 * (`promptgen37refonte.md`), remplace intégralement la première version (5 variantes) par 8
 * variantes.
 *
 * $\bar{x}$ (moyenne) et/ou $\sigma$ (écart-type) sont TOUJOURS donnés directement dans l'énoncé
 * pour les variantes qui les connaissent — jamais recalculés depuis un tableau ou une liste brute,
 * même principe que "Boîte à moustaches".
 *
 * Formule : au moins $1-\dfrac{1}{k^2}$ de l'effectif se trouve dans $[\bar x-k\sigma\,;\,
 * \bar x+k\sigma]$, pour $k>1$.
 *
 * **Méthode de génération, uniforme pour les 8 variantes — chaque champ "Attendu" du contrat est
 * DÉJÀ la valeur ARRONDIE selon la règle propre à ce champ**, calculée EN CASCADE à partir du champ
 * "Attendu" de l'écran précédent déjà confirmé (jamais depuis une valeur continue cachée) — même
 * principe que "Médiane"/"Moyenne pondérée" pour une valeur confirmée : la vérification (Couche B)
 * compare alors la saisie de l'élève à cette cible déjà arrondie, à une tolérance flottante minime
 * (bruit résiduel, jamais une vraie marge d'arrondi — voir `verificationBienaymeTchebychev.ts`).
 * Contrairement à la première version, plus aucun "pool de valeurs propres" n'est nécessaire : les
 * règles d'arrondi (`generateurs/bienaymeTchebychev/arrondis.ts`) suffisent à elles seules à
 * garantir une cible toujours bien définie, quelle que soit l'irrationnalité sous-jacente de k.
 *
 * **8 variantes, chacune une construction directe** (jamais un tirage-puis-classification) — voir
 * `generateurs/bienaymeTchebychev/index.ts` :
 * - `intervalleVersPourcent` (V1) : x̄, σ, intervalle donnés → k → pourcentage minimal (arrondi
 *   vers le BAS, à l'unité).
 * - `pourcentVersIntervalle` (V2) : x̄, σ, pourcentage minimal cible donnés → k → intervalle
 *   (bornes ÉLARGIES vers l'extérieur, à l'unité).
 * - `intervalleVersNombre` (V3) : x̄, σ, n, intervalle donnés → k → pourcentage minimal
 *   (intermédiaire, arrondi standard à 2 décimales) → nombre minimal d'individus (arrondi vers le
 *   BAS, à l'unité, AUCUNE aide sur cet écran).
 * - `nombreVersIntervalle` (V4) : x̄, σ, n, nombre minimal donnés → pourcentage minimal (écran 0,
 *   arrondi standard à 2 décimales, AUCUNE aide) → k → intervalle (bornes élargies).
 * - `intervalleVersSigma` (V5) : x̄, intervalle, pourcentage minimal donnés → k → σ (arrondi
 *   mathématique standard, à l'unité).
 * - `intervalleVersXBar` (V6) : σ, intervalle, pourcentage minimal donnés → k → x̄ (arrondi
 *   standard).
 * - `nombreVersSigma` (V7) : x̄, intervalle, n, nombre minimal donnés → pourcentage minimal (écran
 *   0, AUCUNE aide) → k → σ (arrondi standard).
 * - `nombreVersXBar` (V8) : σ, intervalle, n, nombre minimal donnés → pourcentage minimal (écran
 *   0, AUCUNE aide) → k → x̄ (arrondi standard).
 */
/** Un contexte narratif (population + caractère étudié) — voir `generateurs/bienaymeTchebychev/
 * contextes.ts` pour la banque de 30 entrées tirées aléatoirement. Le contrat lui-même n'importe
 * jamais `src/generateurs/` (règle d'architecture non négociable) : ce type vit ici, dans
 * `src/core/`, et `contextes.ts` l'importe depuis ce fichier — jamais l'inverse. */
export interface ContexteBienaymeTchebychev {
  /** Toujours un nom pluriel — "étudiants", "salariés"... — jamais précédé d'un article. */
  population: string;
  /** Article défini + nom du caractère, ex. "la taille", "l'âge" — toujours singulier. */
  caractereDefini: string;
  /** Article indéfini + nom du caractère, ex. "une taille", "un âge". */
  caractereIndefini: string;
  /** Le nom du caractère seul, sans article — ex. "taille", "âge" (utilisé après "intervalle de"). */
  caractereComplement: string;
  /** Accord de "moyen"/"moyenne" avec le genre du caractère. */
  moyenAccord: "moyen" | "moyenne";
  /** Accord de "compris"/"comprise" avec le genre du caractère. */
  comprisAccord: "compris" | "comprise";
  unite: string;
  plageXBar: [number, number];
  plageSigma: [number, number];
}

export type VarianteBienaymeTchebychev =
  | "intervalleVersPourcent"
  | "pourcentVersIntervalle"
  | "intervalleVersNombre"
  | "nombreVersIntervalle"
  | "intervalleVersSigma"
  | "intervalleVersXBar"
  | "nombreVersSigma"
  | "nombreVersXBar";

/** V1 — intervalle donné (x̄, σ) → k → pourcentage minimal (2 écrans, `pourcentAttendu` terminal). */
export interface ExerciceBienaymeTchebychevIntervalleVersPourcent {
  variante: "intervalleVersPourcent";
  contexte: ContexteBienaymeTchebychev;
  xBar: number;
  sigma: number;
  borneInf: number;
  borneSup: number;
  kAttendu: number;
  pourcentAttendu: number;
}

/** V2 — pourcentage minimal cible donné (x̄, σ) → k → intervalle (2 écrans, `borneInfAttendue`/
 * `borneSupAttendue` terminaux). */
export interface ExerciceBienaymeTchebychevPourcentVersIntervalle {
  variante: "pourcentVersIntervalle";
  contexte: ContexteBienaymeTchebychev;
  xBar: number;
  sigma: number;
  pourcentDonne: number;
  kAttendu: number;
  borneInfAttendue: number;
  borneSupAttendue: number;
}

/** V3 — intervalle donné (x̄, σ, n) → k → pourcentage (intermédiaire) → nombre minimal d'individus
 * (3 écrans, `nMinAttendu` terminal, aucune aide sur ce dernier écran). */
export interface ExerciceBienaymeTchebychevIntervalleVersNombre {
  variante: "intervalleVersNombre";
  contexte: ContexteBienaymeTchebychev;
  xBar: number;
  sigma: number;
  borneInf: number;
  borneSup: number;
  n: number;
  kAttendu: number;
  pourcentAttendu: number;
  nMinAttendu: number;
}

/** V4 — nombre minimal donné (x̄, σ, n) → pourcentage (écran 0, aucune aide) → k → intervalle
 * (3 écrans, `borneInfAttendue`/`borneSupAttendue` terminaux). */
export interface ExerciceBienaymeTchebychevNombreVersIntervalle {
  variante: "nombreVersIntervalle";
  contexte: ContexteBienaymeTchebychev;
  xBar: number;
  sigma: number;
  n: number;
  nombreMinDonne: number;
  pourcentAttendu0: number;
  kAttendu: number;
  borneInfAttendue: number;
  borneSupAttendue: number;
}

/** V5 — intervalle + pourcentage minimal donnés (x̄ connu) → k → σ (2 écrans, `sigmaAttendu`
 * terminal). */
export interface ExerciceBienaymeTchebychevIntervalleVersSigma {
  variante: "intervalleVersSigma";
  contexte: ContexteBienaymeTchebychev;
  xBar: number;
  pourcentDonne: number;
  borneInf: number;
  borneSup: number;
  kAttendu: number;
  sigmaAttendu: number;
}

/** V6 — intervalle + pourcentage minimal donnés (σ connu) → k → x̄ (2 écrans, `xBarAttendu`
 * terminal). */
export interface ExerciceBienaymeTchebychevIntervalleVersXBar {
  variante: "intervalleVersXBar";
  contexte: ContexteBienaymeTchebychev;
  sigma: number;
  pourcentDonne: number;
  borneInf: number;
  borneSup: number;
  kAttendu: number;
  xBarAttendu: number;
}

/** V7 — intervalle + n + nombre minimal donnés (x̄ connu) → pourcentage (écran 0, aucune aide) →
 * k → σ (3 écrans, `sigmaAttendu` terminal). */
export interface ExerciceBienaymeTchebychevNombreVersSigma {
  variante: "nombreVersSigma";
  contexte: ContexteBienaymeTchebychev;
  xBar: number;
  n: number;
  nombreMinDonne: number;
  borneInf: number;
  borneSup: number;
  pourcentAttendu0: number;
  kAttendu: number;
  sigmaAttendu: number;
}

/** V8 — intervalle + n + nombre minimal donnés (σ connu) → pourcentage (écran 0, aucune aide) →
 * k → x̄ (3 écrans, `xBarAttendu` terminal). */
export interface ExerciceBienaymeTchebychevNombreVersXBar {
  variante: "nombreVersXBar";
  contexte: ContexteBienaymeTchebychev;
  sigma: number;
  n: number;
  nombreMinDonne: number;
  borneInf: number;
  borneSup: number;
  pourcentAttendu0: number;
  kAttendu: number;
  xBarAttendu: number;
}

export type ExerciceBienaymeTchebychev =
  | ExerciceBienaymeTchebychevIntervalleVersPourcent
  | ExerciceBienaymeTchebychevPourcentVersIntervalle
  | ExerciceBienaymeTchebychevIntervalleVersNombre
  | ExerciceBienaymeTchebychevNombreVersIntervalle
  | ExerciceBienaymeTchebychevIntervalleVersSigma
  | ExerciceBienaymeTchebychevIntervalleVersXBar
  | ExerciceBienaymeTchebychevNombreVersSigma
  | ExerciceBienaymeTchebychevNombreVersXBar;

export type GenerateurExerciceBienaymeTchebychev = () => ExerciceBienaymeTchebychev;
