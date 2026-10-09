import type { EnsembleReelGuide } from "./ensembleReel.types";
import type { CibleLimite } from "./limitesExponentielles.types";
import type { CibleAsymptote, CibleCroissance } from "./etudeFonctionExponentielle.types";

export type { CibleAsymptote, CibleCroissance } from "./etudeFonctionExponentielle.types";

/**
 * Couche core (6e) — contrat pour `6gen21` ("Étudier une fonction — synthèse, logarithmes",
 * chapitre 3, DERNIER générateur de ce chapitre). 5 familles A-E STRUCTURELLEMENT DISJOINTES (union
 * discriminée par `famille`). Familles A-D suivent les 6 MÊMES tâches que `6gen11` (domaine →
 * limites → asymptotes → croissance → concavité → graphique QCM), famille E est allégée (2 écrans
 * qualitatifs seulement, jamais de tableau de variation — voir plus bas).
 *
 * **Réutilisation directe (core→core, même chantier, même principe déjà établi par `6gen11` qui
 * importe `CibleLimite` de `limitesExponentielles.types.ts`)** : `EnsembleReelGuide`, `CibleLimite`,
 * `CibleAsymptote`, `CibleCroissance`/`TypeCroissance` sont importés TELS QUELS depuis
 * `etudeFonctionExponentielle.types.ts`/`limitesExponentielles.types.ts` — ces notions catégorielles
 * génériques existent déjà, aucune raison d'en créer une 3e version pour ce générateur.
 *
 * **`limites`/`asymptotes` — tableaux, jamais des champs nommés séparés** : contrairement à `6gen11`
 * (champs `limitePlusInfini`/`limiteMoinsInfini` séparés par famille), le NOMBRE de directions varie
 * ici de 2 (A/B/D) à 6 (famille C : 2 infinis + 4 approches de points exclus) — un tableau
 * `CibleLimite[]`/`CibleAsymptote[]` unique, dans l'ORDRE de `ui6e/formatEtudeFonctionLogarithme.ts
 * ::directionLabelsLimites`/`directionLabelsAsymptotes` (jamais stocké dans le contrat lui-même,
 * comme `6gen11`), permet à `moteur6e/verificationEtudeFonctionLogarithme.ts` et à
 * `components6e/EtapeLimitesMultiLog.tsx`/`EtapeAsymptotesMultiLog.tsx` de rester UN SEUL mécanisme
 * générique plutôt que 3 composants dupliqués par nombre de directions.
 *
 * **Nouveauté — `CibleConcaviteLog`, généralise `CibleConcavite` de `6gen11`** : `6gen11` ne
 * modélisait qu'AU PLUS un point d'inflexion (`position: number|null`). Ici, la famille B a
 * TOUJOURS un point d'inflexion mais parfois DEUX (voir `generateurs6e/etudeFonctionLogarithme/
 * familles/B.ts` pour la preuve complète — 2 si k>0, 1 si k<0, trouvés par balayage numérique à la
 * génération, aucune forme close). `positions: number[]` (jamais `number|null`) — pattern
 * "add-as-needed" explicite côté écran (CLAUDE.md, "Interface de saisie flexible") plutôt qu'un
 * champ figé à 1 élément qui aurait forcé un choix arbitraire pour la famille B.
 *
 * **Nouveauté — `CibleCroissanceGrilleC`, famille C uniquement** : contrairement aux 3 autres
 * familles (croissance = catégorie + position d'extremum unique, `CibleCroissance` suffit), la
 * famille C (domaine à 3 branches) demande un VRAI tableau de signe de f' sur les 4 intervalles
 * délimités par −k, 0, k (spec explicite, écran 4) — structure fixe à 4 cases (jamais add-as-needed,
 * le nombre de branches est structurellement fixé par le domaine ℝ\{−k,k}), plus la position du
 * maximum local (toujours x=0, mais vérifiée comme les autres, jamais présupposée côté écran).
 *
 * **Nouveauté — famille E, traitement qualitatif sans tableau de variation** : `f(x)=e^(ax)·trig(x)`
 * a une dérivée qui s'annule une infinité de fois (produit oscillant × enveloppe exponentielle) —
 * un tableau de signe classique n'a structurellement aucun sens. Traitement volontairement allégé à
 * 2 écrans (domaine, comportement aux deux infinis) — voir `StatutLimiteQualitatif` ci-dessous,
 * nouveau type LOCAL (jamais une extension de `CibleLimite`, qui ne modélise pas "n'existe pas" —
 * voir la note de conception de ce type).
 */

export type FamilleEtudeFonctionLogarithme = "A" | "B" | "C" | "D" | "E";

// ============================================================================
// Concavité généralisée (0, 1 ou N points d'inflexion) — voir note de conception ci-dessus.
// ============================================================================

export type TypeConcaviteLog = "convexe_partout" | "concave_partout" | "inflexions";

export interface CibleConcaviteLog {
  type: TypeConcaviteLog;
  /** TOUJOURS triées croissant, longueur variable — vide sauf si `type==="inflexions"` (1 pour
   * toutes les familles à un seul point, jusqu'à 2 pour la famille B avec k>0). */
  positions: number[];
}

// ============================================================================
// Croissance famille C — tableau de signe à 4 cases fixes (jamais add-as-needed, voir note ci-dessus).
// ============================================================================

export type SigneCroissance = "croissante" | "decroissante";

export interface CibleCroissanceGrilleC {
  /** [(-∞,-k), (-k,0), (0,k), (k,+∞)] — TOUJOURS [decroissante, croissante, decroissante,
   * croissante], invariant en k (voir preuve dans `generateurs6e/etudeFonctionLogarithme/
   * familles/C.ts`) — mais recalculé/vérifié comme les autres, jamais présupposé côté écran. */
  signes: [SigneCroissance, SigneCroissance, SigneCroissance, SigneCroissance];
  /** Position du maximum local — toujours 0. */
  positionMax: number;
}

// ============================================================================
// Famille A — f(x) = x^(ax), x>0, a∈{1,2,3}. Toujours convexe, jamais d'inflexion ; extremum
// (minimum) toujours en x=1/e ; limite 1 en 0⁺ (PIÈGE : ne pas y voir une asymptote — c'est une
// borne FINIE du domaine, pas un infini) ; +∞ en +∞ ; aucune asymptote.
// ============================================================================

export interface CandidatEtudeLogA {
  /** "reel" — la vraie fonction. "minimumMalPlace" — exposant décalé d'une constante non nulle
   * (x^(ax+d)), déplace le minimum sans changer sa nature (spec distracteur 1). "limiteZeroIncorrecte"
   * — multiplie par une constante C≠1 (C·x^(ax)), change la limite en 0⁺ de 1 à C (spec distracteur
   * 2). "inflexionInventee" — une VRAIE courbe logistique (point d'inflexion authentique en x=1/e,
   * jamais présent sur la réelle) — spec distracteur 3. */
  type: "reel" | "minimumMalPlace" | "limiteZeroIncorrecte" | "inflexionInventee";
  a: number;
  /** non nul UNIQUEMENT pour "minimumMalPlace". */
  decalageExposant: number;
  /** ≠1 UNIQUEMENT pour "limiteZeroIncorrecte" (facteur multiplicatif). */
  facteurLimite: number;
}

export interface ExerciceEtudeLogA {
  famille: "A";
  a: 1 | 2 | 3;
  domaine: EnsembleReelGuide;
  /** [x→0⁺, x→+∞]. */
  limites: [CibleLimite, CibleLimite];
  /** [x→0⁺, x→+∞] — toujours `{type:"aucune"}` les deux (piège central de la famille). */
  asymptotes: [CibleAsymptote, CibleAsymptote];
  /** Toujours "minimum", position=1/e. */
  croissance: CibleCroissance;
  /** Toujours "convexe_partout". */
  concavite: CibleConcaviteLog;
  candidats: CandidatEtudeLogA[];
  indexCorrect: number;
}

// ============================================================================
// Famille B — f(x) = x^(k/x), x>0, k∈{-3,-2,-1,1,2,3}. Extremum toujours en x=e (max si k>0, min si
// k<0) ; asymptote horizontale y=1 en +∞ TOUJOURS présente (contrairement à A) ; limite en 0⁺ =
// 0 si k>0, +∞ si k<0 (asymptote verticale x=0 SEULEMENT dans ce dernier cas — voir la décision de
// conception dans `moteur6e/verificationEtudeFonctionLogarithme.ts`, écran "asymptotes" ne teste que
// l'asymptote horizontale, conformément au texte exact de la spec) ; concavité — 1 point d'inflexion
// si k<0, 2 si k>0 (preuve numérique complète dans `generateurs6e/etudeFonctionLogarithme/
// familles/B.ts`).
// ============================================================================

export interface CandidatEtudeLogB {
  /** "reel" — la vraie fonction. "extremumMalPlace" — exposant décalé (x^(k/x+d)), déplace
   * l'extremum loin de e sans changer sa nature (spec distracteur 1). "sansAsymptoteHorizontale" —
   * terme linéaire additionnel qui empêche la convergence vers 1 en +∞ (spec distracteur 2, piège
   * central de cette famille). "extremumTypeInverse" — signe de k inversé dans l'exposant
   * (x^(-k/x)), échange max/min (spec distracteur 3). */
  type: "reel" | "extremumMalPlace" | "sansAsymptoteHorizontale" | "extremumTypeInverse";
  k: number;
  /** non nul UNIQUEMENT pour "extremumMalPlace". */
  decalageExposant: number;
}

export interface ExerciceEtudeLogB {
  famille: "B";
  k: -3 | -2 | -1 | 1 | 2 | 3;
  domaine: EnsembleReelGuide;
  /** [x→0⁺, x→+∞]. */
  limites: [CibleLimite, CibleLimite];
  /** [x→+∞] — UN SEUL élément (voir note de conception : la spec ne teste que l'asymptote
   * horizontale pour cette famille, jamais le comportement en 0⁺ déjà couvert par l'écran limites). */
  asymptotes: [CibleAsymptote];
  /** "maximum" si k>0, "minimum" si k<0, position toujours e. */
  croissance: CibleCroissance;
  /** Toujours "inflexions" — 1 position si k<0, 2 si k>0. */
  concavite: CibleConcaviteLog;
  candidats: CandidatEtudeLogB[];
  indexCorrect: number;
}

// ============================================================================
// Famille C — f(x) = ln|k²−x²|, k∈{2,3,4,5}. Domaine ℝ\{−k,k} (3 branches, ÉLARGI par la valeur
// absolue — piège central écran 1) ; paire ; 2 asymptotes verticales symétriques x=±k ; max local
// en x=0 (valeur 2ln(k)) ; TOUJOURS concave partout, jamais d'inflexion (preuve complète dans
// `generateurs6e/etudeFonctionLogarithme/familles/C.ts`).
// ============================================================================

export interface CandidatEtudeLogC {
  /** "reel" — la vraie fonction, ln|k²−x²|. "domaineRestreint" — ln(k²−x²) SANS valeur absolue
   * (indéfini hors ]−k;k[, spec distracteur 1, piège central de cette famille). "asymptotesMalPlacees"
   * — ln|(k+d)²−x²|, d≠0, décale les 2 asymptotes verticales (spec distracteur 2). "asymetrieIncorrecte"
   * — ln|k²−(x−d)²|, d≠0, brise la parité (spec distracteur 3). */
  type: "reel" | "domaineRestreint" | "asymptotesMalPlacees" | "asymetrieIncorrecte";
  k: number;
  /** non nul UNIQUEMENT pour "asymptotesMalPlacees"/"asymetrieIncorrecte" (même pool, rôles
   * différents selon `type`). */
  decalage: number;
}

export interface ExerciceEtudeLogC {
  famille: "C";
  k: 2 | 3 | 4 | 5;
  domaine: EnsembleReelGuide;
  /** [x→−∞, x→(−k)⁻, x→(−k)⁺, x→k⁻, x→k⁺, x→+∞] — TOUJOURS [plus_infini, moins_infini,
   * moins_infini, moins_infini, moins_infini, plus_infini]. */
  limites: [CibleLimite, CibleLimite, CibleLimite, CibleLimite, CibleLimite, CibleLimite];
  /** [verticale x=−k, verticale x=k]. */
  asymptotes: [CibleAsymptote, CibleAsymptote];
  croissance: CibleCroissanceGrilleC;
  /** Toujours "concave_partout". */
  concavite: CibleConcaviteLog;
  candidats: CandidatEtudeLogC[];
  indexCorrect: number;
}

// ============================================================================
// Famille D — f(x) = x + c·e^(−x), c∈{1,2,3,4}. Domaine ℝ ; +∞ aux deux infinis (PIÈGE : ne pas
// conclure "pas d'asymptote" par réflexe) ; asymptote OBLIQUE y=x en +∞ seulement (réutilise la
// méthode de `6gen11` famille C, `f(x)−x→0`) ; minimum toujours en x=ln(c) ; toujours convexe.
// ============================================================================

export interface CandidatEtudeLogD {
  /** "reel" — la vraie fonction. "pasAsymptoteOblique" — remplace le terme exponentiel par un
   * terme qui diverge (c·√|x|) plutôt que de s'annuler — la courbe s'ÉLOIGNE de y=x au lieu de
   * s'en rapprocher (spec distracteur 1, piège central). "minimumMalPlace" — exponentielle décalée
   * (c·e^(−(x−d))), déplace le minimum sans changer sa nature (spec distracteur 2).
   * "inflexionInventee" — un terme sigmoïde ajouté (authentique point d'inflexion, jamais présent
   * sur la réelle, toujours convexe) — spec distracteur 3. */
  type: "reel" | "pasAsymptoteOblique" | "minimumMalPlace" | "inflexionInventee";
  c: number;
  /** non nul UNIQUEMENT pour "minimumMalPlace". */
  decalageMin: number;
}

export interface ExerciceEtudeLogD {
  famille: "D";
  c: 1 | 2 | 3 | 4;
  domaine: EnsembleReelGuide;
  /** [x→−∞, x→+∞] — toujours [plus_infini, plus_infini]. */
  limites: [CibleLimite, CibleLimite];
  /** [x→−∞, x→+∞] — toujours [aucune, oblique{a:1,b:0}]. */
  asymptotes: [CibleAsymptote, CibleAsymptote];
  /** Toujours "minimum", position=ln(c). */
  croissance: CibleCroissance;
  /** Toujours "convexe_partout". */
  concavite: CibleConcaviteLog;
  candidats: CandidatEtudeLogD[];
  indexCorrect: number;
}

// ============================================================================
// Famille E — f(x) = e^(ax)·trig(x), a≠0, trig∈{sin,cos}. Traitement qualitatif allégé (2 écrans,
// jamais de tableau de variation — dérivée qui s'annule une infinité de fois). Nouveau type LOCAL
// "n'existe pas" (jamais une extension du `CibleLimite` partagé, qui ne modélise que
// +∞/−∞/0/valeur — voir la justification complète dans le prompt de ce générateur : plusieurs
// autres générateurs 6e ont chacun leur PROPRE variante locale de ce concept, jamais partagée).
// ============================================================================

export type StatutLimiteQualitatif = "zero" | "nexiste_pas";

export interface ComportementInfiniE {
  moinsInfini: StatutLimiteQualitatif;
  plusInfini: StatutLimiteQualitatif;
}

export interface ExerciceEtudeLogE {
  famille: "E";
  a: number;
  trig: "sin" | "cos";
  /** Toujours ℝ (rappel rapide, écran 1). */
  domaine: EnsembleReelGuide;
  comportement: ComportementInfiniE;
}

export type ExerciceEtudeLogNonE = ExerciceEtudeLogA | ExerciceEtudeLogB | ExerciceEtudeLogC | ExerciceEtudeLogD;

export type ExerciceEtudeFonctionLogarithme = ExerciceEtudeLogNonE | ExerciceEtudeLogE;

export type CandidatEtudeFonctionLogarithme = CandidatEtudeLogA | CandidatEtudeLogB | CandidatEtudeLogC | CandidatEtudeLogD;

export type GenerateurExerciceEtudeFonctionLogarithme = () => ExerciceEtudeFonctionLogarithme;
