import type { FamilleReference } from "./fonctionsReference.types";

export type { FamilleReference };

/**
 * Couche core — contrat propre au générateur "Forme canonique et transformations — fonctions de
 * référence" (chapitre 2, spec-formecanonique6familles.md). Fusionne les principes de
 * "Transformations graphiques — fonctions de référence" (reconnaissance de famille + formule
 * unifiée à 6 familles, core/fonctionsReference.types.ts) et de "Forme canonique et
 * transformations" (déroulement en étapes fixes + trace cumulative, chapitre 1,
 * core/formeCanoniqueTransformations.types.ts).
 *
 * COHÉRENCE ENTRE L'ÉTAPE 1 (forme canonique) ET LES ÉTAPES 2-5 (curseurs) — `formeDepart` (table
 * section 1 de la spec) est TOUJOURS construite à partir des mêmes TH/TV/CH/EH/EV/CV/SOX/SOY que
 * les étapes suivantes (jamais de coefficients bruts tirés indépendamment) : résoudre l'étape 1
 * revient donc à retrouver un véritable PRÉFIXE de la construction progressive des étapes 2-5, pas
 * un mini-problème algébrique sans rapport avec le reste de l'exercice (piège corrigé —
 * `prompt-coherenceexerciceetcastrivial.md` : le bug initial n'était pas une régénération des
 * paramètres écran par écran — `exerciceCourant` a toujours été généré une seule fois et transmis
 * tel quel à travers les phases, voir `sessionFormeCanoniqueFonctionsReference.ts` — mais un
 * découplage algébrique délibéré de `formeDepart` vis-à-vis de ch/eh/ev/cv/sox/soy, produisant le
 * même symptôme observable : la fonction affichée à l'étape "Forme canonique" n'avait aucun lien
 * avec celle des étapes suivantes du même exercice).
 *
 * Précisément, la cible retrouvée à l'étape 1 (`cibleEtape1`,
 * `src/moteur/verificationFormeCanoniqueFonctionsReference.ts`) est TOUJOURS égale, terme à terme,
 * à l'une des cibles déjà utilisées par les étapes suivantes du MÊME exercice — laquelle dépend de
 * ce que la technique de simplification de la famille peut structurellement récupérer sans
 * introduire d'irrationalité ni perdre un signe (voir la justification algébrique complète dans le
 * module de vérification) :
 * - `carre`/`inverse` (techniques "compléter le carré"/"division polynomiale", jamais de racine
 *   n-ième à inverser) : cible = `cibleFinale` — coefficient PLEINEMENT combiné (SOX·EV/CV inclus)
 *   ET résidu TV, les 3 raw coefficients (`a,b,c` / les 4 `a,b,c,d`) suffisant à les porter tous
 *   les deux.
 * - `cube`/`racine_carree`/`racine_cubique`/`valeur_absolue` (`(a+bx)^3`/`√(ax+b)`/`∛(ax+b)`/
 *   `|ax+b|`, seulement 2 raw coefficients — jamais assez pour porter TV, et la présence d'un
 *   wrapper de degré >1 (cube, racine, valeur absolue) empêche d'absorber SOX·EV/CV sans exiger sa
 *   racine n-ième, généralement irrationnelle) : cible = coefficient interne UNIQUEMENT
 *   (SOY·CH/EH, sans EV/CV/SOX ni TV) + TH — la même forme que la trace confirmée de l'étape 3.
 *
 * `construireFormeDepart` (`src/generateurs/formeCanoniqueFonctionsReference/index.ts`) construit
 * donc `formeDepart` à partir de ces mêmes cibles plutôt que de coefficients bruts indépendants —
 * mais `cibleEtape1` continue d'être calculée en RE-DÉRIVANT algébriquement depuis les seuls
 * coefficients bruts de `formeDepart` (compléter le carré / diviser / lire le coefficient), jamais
 * en im​portant `ch`/`eh`/... directement : deux chemins de calcul indépendants qui doivent
 * coïncider par construction, exactement le principe de "vérification indépendante" déjà en place
 * pour les dix autres exercices du projet (voir la section Tests de CLAUDE.md).
 *
 * Génération — deuxième correctif du même prompt : `CH=1` et `EH=1` simultanément (curseurs tous
 * deux neutres) sont désormais exclus à la génération, quelle que soit la famille — sinon la forme
 * de départ serait déjà sous forme canonique dès l'étape 1 (rien à simplifier, coefficient interne
 * trivial ±1).
 */

export type FormeDepart =
  | { type: "carre"; a: number; b: number; c: number }
  | { type: "cube"; a: number; b: number }
  | { type: "racine_carree"; a: number; b: number }
  | { type: "racine_cubique"; a: number; b: number }
  | { type: "inverse"; a: number; b: number; c: number; d: number }
  | { type: "valeur_absolue"; a: number; b: number };

export interface ExerciceFormeCanoniqueFonctionReference {
  famille: FamilleReference;
  /** TH — toujours égal au `p` retrouvé à l'étape 1 (forme canonique), entier signé dans [-5,5]. */
  th: number;
  /** TV — égal au résidu retrouvé à l'étape 1 pour `carre`/`inverse` ; indépendant (frais) pour les
   * 4 autres familles. Entier signé dans [-5,5] dans tous les cas. */
  tv: number;
  /** CH — compression horizontale, entier dans [1,5] (1 = neutre). */
  ch: number;
  /** EH — étirement horizontal, entier dans [1,5] (1 = neutre). */
  eh: number;
  /** EV — étirement vertical, entier dans [1,5] (1 = neutre). */
  ev: number;
  /** CV — compression verticale, entier dans [1,5] (1 = neutre). */
  cv: number;
  sox: boolean;
  soy: boolean;
  /** La forme de départ non simplifiée (étape 0 — reconnaissance ; étape 1 — point de départ de la
   * simplification), indépendante des 8 autres champs sauf le partage de TH (et TV pour
   * carre/inverse) décrit ci-dessus. */
  formeDepart: FormeDepart;
}

export type GenerateurExerciceFormeCanoniqueFonctionReference = () => ExerciceFormeCanoniqueFonctionReference;

/** Étape 1 — Forme canonique : un unique champ libre où l'élève écrit la forme canonique complète
 * obtenue en simplifiant `formeDepart` selon la technique de sa famille (table section 1 de la
 * spec) — vérifiée structurellement + algébriquement, jamais une saisie développée même
 * équivalente. */
export interface ReponseCanoniqueFR {
  formeCanonique: string;
}

/** Étape 2 — EH, CH, SOY : les 2 curseurs + le toggle de cette étape (exclusivité mutuelle EH/CH,
 * comme "fonctions de référence"), plus la fonction intermédiaire g(SOY·(CH/EH)·x) — sans TH, sans
 * EV/CV/SOX/TV, tous encore à leur valeur neutre à ce stade. */
export interface ReponseEhChSoy {
  eh: number;
  ch: number;
  soy: boolean;
  fonctionIntermediaire: string;
}

/** Étape 3 — TH : le curseur TH, plus la fonction intermédiaire g(SOY·(CH/EH)·(x-TH)) — EH/CH/SOY
 * déjà confirmés à l'étape précédente, EV/CV/SOX/TV encore neutres. */
export interface ReponseThFR {
  th: number;
  fonctionIntermediaire: string;
}

/** Étape 4 — EV, CV, SOX : les 2 curseurs + le toggle de cette étape (exclusivité mutuelle EV/CV),
 * plus la fonction intermédiaire SOX·(EV/CV)·g(SOY·(CH/EH)·(x-TH)) — TV encore neutre (nul). */
export interface ReponseEvCvSoxFR {
  ev: number;
  cv: number;
  sox: boolean;
  fonctionIntermediaire: string;
}

/** Étape 5 — TV : le curseur TV, plus la fonction finale complète. */
export interface ReponseTvFR {
  tv: number;
  fonctionIntermediaire: string;
}
