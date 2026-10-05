// Contrat core — 5gen15 "Suites géométriques, formule générale et termes". REFONTE COMPLÈTE
// (`prompt5gen15refontefamillesbonus.md`, miroir direct de la refonte 5gen14 — voir
// docs/historique-5e-suites.md, section "5gen14 — Refonte complète des 3 familles bonus
// algébriques") :
//
// - Les 4 combos "principal" choisissent désormais q TOUJOURS EN PREMIER (rationnel, pool), toutes
//   les autres grandeurs (u1/up/um) sont DÉRIVÉES via des puissances ENTIÈRES de ce q — jamais une
//   racine k-ième calculée numériquement (`Math.pow(q, entier)` reste exact pour q rationnel,
//   contrairement à `Math.pow(x, 1/k)`). Sous cette construction, un q valide EXISTE TOUJOURS
//   (celui choisi à la génération) : `StatutQ="aucune"` est devenu mathématiquement impossible et a
//   été retiré du type (ainsi que toute la logique associée en aval).
// - Les 2 anciennes familles bonus "moyenne géométrique" (`moyenneSimple`/`moyenneRiche`) sont
//   retirées ENTIÈREMENT (ne mobilisaient qu'un seul raisonnement — propriété de moyenne —
//   redémontré à l'identique à chaque tirage) et remplacées par 3 nouvelles familles "isoler une
//   inconnue algébrique", même esprit que 5gen14.

import type { TermeLineaire } from "./suitesArithmetiques.types";

export type { TermeLineaire };

/** Fraction signée exacte — dénominateur TOUJOURS strictement positif, signe porté par `num`,
 * TOUJOURS réduite (aucune valeur de ce contrat n'est jamais construite/stockée sous forme non
 * réduite). Arithmétique associée : `generateurs5e/suitesGeometriques/fraction.ts` (Couche A — ce
 * fichier reste un contrat pur, aucune logique). Voir `prompt5gen155gen16arithmetiqueexacte.md` :
 * TOUTE valeur DÉRIVÉE de q (u1/up/um/Sn/S∞, et tout intermédiaire montré à l'élève) transite par ce
 * type de bout en bout — jamais une conversion en flottant à une étape intermédiaire. */
export interface FractionQ {
  num: number;
  den: number;
}

export interface TermeIndiceValeur {
  indice: number;
  valeur: FractionQ;
}

/** Miroir de `TermeLineaire` (`a: number` — coefficient toujours entier par construction — `b`
 * DÉRIVÉ d'une puissance de q, donc potentiellement fractionnaire à dénominateur arbitraire) — famille
 * bonus A uniquement (`un`, jamais `up` : ses composantes restent toujours de petits entiers). */
export interface TermeLineaireFractionQ {
  a: number;
  b: FractionQ;
}

export type ComboSuiteGeometrique = "direct" | "u1_up" | "q_up" | "up_um";

export type DonneesSuiteGeometrique =
  | { combo: "direct"; u1: FractionQ; q: FractionQ }
  | { combo: "u1_up"; u1: FractionQ; up: TermeIndiceValeur }
  | { combo: "q_up"; q: FractionQ; up: TermeIndiceValeur }
  | { combo: "up_um"; up: TermeIndiceValeur; um: TermeIndiceValeur };

/** "double" reste le SEUL cas d'ambiguïté possible (exposant/écart d'indices pair, q et -q
 * conviennent tous les deux — `(-q)^pair=q^pair`) — "aucune" retiré (voir en-tête de fichier). */
export type StatutQ = "unique" | "double";

/** Une suite u1/q entièrement résolue — une "branche" valide de l'exercice. */
export interface BrancheSuiteGeometrique {
  u1: FractionQ;
  q: FractionQ;
}

export interface ExercicePrincipalSuiteGeometrique {
  famille: "principal";
  donnees: DonneesSuiteGeometrique;
  /** Exposant entier dont la PARITÉ détermine `statutQ` (p-1 pour "u1_up", |m-p| pour "up_um") —
   * `null` pour "direct"/"q_up", où q est déjà connu directement (aucune ambiguïté possible). */
  k: number | null;
  statutQ: StatutQ;
  /** 1 branche si "unique", 2 si "double" (jamais recalculée depuis `donnees` — seule source de
   * vérité pour toute la suite consommée en aval, moteur/présentation compris). */
  branches: BrancheSuiteGeometrique[];
  indicesTermesProches: [number, number, number, number];
  indiceTermeEloigne: number;
  indiceSn: number;
}

/** Famille bonus A (`algebriqueTermeGeneral`) — isoler x via la relation GÉNÉRALE entre 2 termes
 * quelconques, `u_n=u_p·q^(n-p)` — u1 n'apparaît pas dans cette famille. `up`/`un` sont TOUS DEUX
 * des expressions ALGÉBRIQUES en x, `p`/`n` des indices DISTINCTS tirés sur une plage large. `q`
 * reste NUMÉRIQUE. Construction "à l'envers" : `xReel`/`q`/`p`/`n`/`up` choisis EN PREMIER,
 * `C=q^(n-p)` constante (exposant ENTIER fixé par p/n, jamais une racine), `un.a` choisi libre et
 * DISTINCT de `C·up.a` (sinon l'équation dégénère, pente nulle), `un.b` DÉRIVÉ pour que l'équation
 * ait exactement `xReel` comme solution. */
export interface ExerciceAlgebriqueTermeGeneral {
  famille: "algebriqueTermeGeneral";
  up: TermeLineaire;
  /** `b` fractionnaire — voir `TermeLineaireFractionQ`. */
  un: TermeLineaireFractionQ;
  /** p≠n — plage large, jamais concentrée. */
  p: number;
  n: number;
  q: FractionQ;
  /** Vérité terrain — jamais montrée directement à l'élève. */
  xReel: FractionQ;
}

/** Famille bonus B (`algebriqueSommeSn`) — isoler x via S_n=u_1·(q^n-1)/(q-1). `q` reste TOUJOURS
 * NUMÉRIQUE dans cette famille (jamais algébrique) : si q dépendait de x, l'équation contiendrait
 * q(x) élevé à la puissance n — polynôme de degré n en x, hors de portée. 2 sous-cas, union
 * discriminée par `sousCas` :
 * - A : `u1(x)` algébrique, `q`/`n` numériques, `k`=S_n cible (donnée directement, comme "principal").
 * - B : `u1`/`q`/`n` TOUS numériques, `sn` = expression ALGÉBRIQUE de S_n(x) (la donnée de
 *   l'exercice, contrairement au sous-cas A où c'est `k` qui est la cible directe), `k` = valeur
 *   RÉELLE de S_n — calculée D'ABORD depuis u1/q/n (AUCUNE inconnue), PUIS `sn` construite pour que
 *   `sn(xReel)=k` (mécanique DIFFÉRENTE, miroir du sous-cas D de la famille B de 5gen14). Trouvée
 *   par l'élève à l'écran "calculerSn", AVANT de poser l'équation.
 */
export type SousCasSommeSnGeometrique = "A" | "B";

export interface ExerciceAlgebriqueSommeSnA {
  famille: "algebriqueSommeSn";
  sousCas: "A";
  u1: TermeLineaire;
  q: FractionQ;
  n: number;
  k: FractionQ;
  xReel: FractionQ;
}
export interface ExerciceAlgebriqueSommeSnB {
  famille: "algebriqueSommeSn";
  sousCas: "B";
  u1: number;
  q: FractionQ;
  n: number;
  /** Expression algébrique de S_n en x — DONNÉE de l'exercice (contrairement au sous-cas A, où
   * c'est k qui est la cible numérique directe). `b` fractionnaire — voir `TermeLineaireFractionQ`. */
  sn: TermeLineaireFractionQ;
  /** Valeur de S_n — calculée D'ABORD depuis u1/q/n (tous numériques, aucune inconnue), PUIS
   * utilisée pour dériver `sn.b`. Trouvée par l'élève à l'écran "calculerSn", AVANT de poser
   * l'équation. */
  k: FractionQ;
  /** Vérité terrain — jamais montrée directement à l'élève. */
  xReel: FractionQ;
}
export type ExerciceAlgebriqueSommeSn = ExerciceAlgebriqueSommeSnA | ExerciceAlgebriqueSommeSnB;

/** Famille bonus C (`algebriqueRangN`) — isoler le RANG n via u_n=u_1·q^(n-1)=k, SANS logarithme
 * (réduction à la même base — les élèves n'ont pas encore vu les logarithmes, matière de 6e). `q`
 * RESTREINT AUX VALEURS STRICTEMENT POSITIVES — raison technique impérative : la vérification de
 * l'écran "poser l'équation" (`diagnostiquerEquationExponentielleEnN`,
 * `moteur5e/verificationSuiteGeometrique.ts`) traite n comme une variable RÉELLE CONTINUE
 * échantillonnée à des valeurs NON ENTIÈRES pour tester l'équivalence algébrique — `q^(n-1)` avec q
 * NÉGATIF et `(n-1)` NON ENTIER n'est PAS un nombre réel en JavaScript (`Math.pow` renvoie `NaN`) ;
 * restreindre q>0 pour cette seule famille évite ce problème structurellement, plutôt que d'inventer
 * un mécanisme de vérification plus complexe pour un cas marginal. `m` (exposant cible, entier,
 * choisi EN PREMIER) est calibré avec `u1` (multiple du dénominateur de q à la puissance m) pour que
 * `k=u1·q^m` sorte un ENTIER EXACT, jamais une fraction affichée comme cible — voir
 * `generateurs5e/suitesGeometriques/algebrique.ts` pour le détail de cette calibration. */
export interface ExerciceAlgebriqueRangN {
  famille: "algebriqueRangN";
  /** `u1`/`k` restent des `number` — TOUJOURS des entiers exacts par construction (calibration
   * `u1=c·den^m`/`k=c·num^m`, produit d'entiers, jamais une division — voir
   * `generateurs5e/suitesGeometriques/algebrique.ts`). Seul `q` a besoin de `FractionQ` : c'est LUI
   * que l'ancienne implémentation calculait puis jetait (`frac.num/frac.den`) avant affichage. */
  u1: number;
  q: FractionQ;
  /** Exposant cible, entier — n=m+1 (vérité terrain). */
  m: number;
  k: number;
  /** Vérité terrain (réponse attendue) = m+1. */
  n: number;
}

export type FamilleSuiteGeometrique = "principal" | "algebriqueTermeGeneral" | "algebriqueSommeSn" | "algebriqueRangN";

export type ExerciceSuiteGeometrique = ExercicePrincipalSuiteGeometrique | ExerciceAlgebriqueTermeGeneral | ExerciceAlgebriqueSommeSn | ExerciceAlgebriqueRangN;

export type GenerateurExerciceSuiteGeometrique = () => ExerciceSuiteGeometrique;
