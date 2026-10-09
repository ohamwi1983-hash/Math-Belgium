import type { ExerciceVolumeA, ExerciceVolumeD } from "./volumesRevolution.types";
import type { ExerciceIntegraleMoyenne } from "./integralesDefinies.types";

/**
 * Couche core (6e) — contrat pour `6gen29` ("Intégrales et primitives : problèmes", chapitre 4,
 * générateur DE CLÔTURE du chapitre). 7 familles (A à G), tirage ÉQUIPROBABLE de la famille puis
 * d'un contexte/sous-type au sein de la famille (voir `generateurs6e/integralesProblemes/index.ts`).
 *
 * Générateur "reuse-heavy" (spec) — la plupart des familles enveloppent, dans un contexte
 * applicatif, de l'infrastructure DÉJÀ CONSTRUITE par des générateurs antérieurs du même chapitre :
 * - Famille B — condition initiale (patron `diagnostiquerEcranFinal` de 6gen24, APPLIQUÉ DEUX FOIS,
 *   jamais réimporté — chaque écran de CE générateur reste sa propre fonction, voir
 *   `moteur6e/verificationIntegralesProblemes.ts`).
 * - Famille E — embarque un `ExerciceIntegraleMoyenne` (type RÉUTILISÉ tel quel de
 *   `core6e/integralesDefinies.types.ts`, 6gen25) et sa vérification `diagnostiquerFinalIntegrale`/
 *   `diagnostiquerValeurMoyenne` (`moteur6e/verificationIntegralesDefinies.ts`) sont appelées
 *   DIRECTEMENT — jamais réimplémentées.
 * - Famille G, sous-types "soustraction"/"archimède" — embarquent un `ExerciceVolumeA`/
 *   `ExerciceVolumeD` (types RÉUTILISÉS tels quels de `core6e/volumesRevolution.types.ts`, 6gen27)
 *   et leur vérification `diagnostiquerAEcran3`/`diagnostiquerDEcran1`
 *   (`moteur6e/verificationVolumesRevolution.ts`) sont appelées DIRECTEMENT.
 *
 * Toutes les valeurs EXACTES (rationnelles) générées par la plateforme restent exactes — jamais un
 * décimal arrondi stocké (convention CLAUDE.md). Seules les grandeurs intrinsèquement
 * irrationnelles/transcendantes (ex. π dans un volume, un point d'équilibre résolu numériquement en
 * famille F) restent des `number` flottants comparés par TOLÉRANCE côté Couche B — même convention
 * déjà en place partout ailleurs sur ce chantier (6gen23/25/27, `\approx` à l'affichage).
 */

// ============================================================================
// Famille A — Intégration numérique, méthode des trapèzes (nouveauté centrale, 2 écrans).
// ============================================================================

export type ContexteFamilleA = "terrain" | "mur";

export interface ExerciceFamilleA_Problemes {
  famille: "A";
  contexte: ContexteFamilleA;
  /** Nombre de sous-intervalles (n∈{6,8}) — n+1 hauteurs y0..yn. */
  n: number;
  /** Pas Δx=1 (spec) — champ gardé explicite plutôt qu'une constante magique dans le code aval. */
  deltaX: number;
  /** Hauteurs y0..yn, entiers entre 8 et 12, profil non monotone (réaliste). */
  y: number[];
  /** Dimension supplémentaire (ex. profondeur du mur, en m) — `null` pour le contexte "terrain"
   * (pas de multiplication supplémentaire, spec "éventuellement"). */
  dimensionSupplementaire: number | null;
  /** Somme entre crochets ATTENDUE — (y0+yn)/2+y1+...+y_(n-1), PRÉCALCULÉE par la Couche A (jamais
   * recalculée côté Couche B depuis `y`, même convention que les champs `*Reference` du reste du
   * chapitre : la Couche B lit un champ déjà connu, ne réimplémente jamais la formule). */
  sommeAttendue: number;
  /** Valeur finale ATTENDUE de l'écran 2 (=Δx·sommeAttendue, ×dimensionSupplementaire si présente),
   * PRÉCALCULÉE. */
  valeurFinaleAttendue: number;
}

// ============================================================================
// Famille B — Cinématique a(t)→v(t)→x(t), conditions initiales (3 écrans).
// ============================================================================

export type SousTypeB_Problemes = "evaluer" | "resoudre";

export interface ExerciceFamilleB_Problemes {
  famille: "B";
  sousType: SousTypeB_Problemes;
  /** a(t) = k·t + p. */
  k: number;
  p: number;
  /** v(0). */
  v0: number;
  /** x(0) — toujours 0 dans cette implémentation (spec : "souvent x(0)=0"). */
  x0: number;
  /** Temps cible pour "evaluer" (x(t1) demandé) — `null` pour "resoudre". */
  t1: number | null;
  /** Distance cible pour "resoudre" (x(t)=cible, solution UNIQUE tSolution — v(t)≥v0≥0 pour t≥0
   * garantit x(t) strictement croissante, voir en-tête `familleB.ts`) — `null` pour "evaluer". */
  cible: number | null;
  tSolution: number | null;
  vReference: (t: number) => number;
  xReference: (t: number) => number;
}

// ============================================================================
// Famille C — Travail d'une force affine, loi de Hooke (2 écrans, variante comparaison).
// ============================================================================

export interface ExerciceFamilleC_Problemes {
  famille: "C";
  /** Paire connue (F0,x0) — k = F0/x0. */
  F0: number;
  x0: number;
  k: number;
  /** Bornes de l'allongement demandé, a<b. */
  a: number;
  b: number;
  /** Variante "2 travaux à comparer" (spec) — intervalle [a2;b2] de même longueur (b−a), position
   * différente. `null` hors variante. */
  a2: number | null;
  b2: number | null;
}

// ============================================================================
// Famille D — Coût marginal, total et moyen (4 écrans).
// ============================================================================

export interface ExerciceFamilleD_Problemes {
  famille: "D";
  /** f(q) = a − b·q (coût marginal), b représenté en fraction EXACTE bNum/bDen (0,05/0,08/0,1 —
   * jamais stocké en décimal, convention CLAUDE.md). */
  a: number;
  bNum: number;
  bDen: number;
  /** Coût fixe C(0). */
  F0: number;
  q1: number;
  q2: number;
  /** f(q) = a−b·q — coût marginal, ÉVALUABLE (jamais recalculé depuis a/bNum/bDen côté Couche B). */
  fReference: (q: number) => number;
  /** C(q) = a·q−b·q²/2+F0 — coût total, constante F0 déjà résolue. */
  CReference: (q: number) => number;
}

// ============================================================================
// Famille E — Valeur moyenne en contexte applicatif (RÉUTILISE 6gen25 famille C, 2+1 écrans).
// ============================================================================

export type ContexteFamilleE = "stock" | "action";

export interface ExerciceFamilleE_Problemes {
  famille: "E";
  contexte: ContexteFamilleE;
  /** Exercice de valeur moyenne RÉUTILISÉ tel quel (type ET vérification, voir en-tête de fichier)
   * — `primitive` y est un `ExerciceFamilleA_Direct` MINIMAL construit ICI (2 termes affines au
   * plus), jamais emprunté à `generateurs6e/calculPrimitives/` (termes trop exotiques — ln/arctan —
   * pour un contexte "taux de variation d'un stock/cours"), mais 100% conforme au contrat
   * `core6e/calculPrimitives.types.ts`. */
  exerciceMoyenne: ExerciceIntegraleMoyenne;
  /** Interprétations proposées (QCM, spec — jamais de texte libre non vérifiable) — une seule
   * correcte, `valeur` de l'option correcte = `interpretationCorrecte`. */
  optionsInterpretation: { valeur: string; label: string }[];
  interpretationCorrecte: string;
}

// ============================================================================
// Famille F — Surplus consommateur (2 écrans, nouveau pattern).
// ============================================================================

export interface ExerciceFamilleF_Problemes {
  famille: "F";
  /** f(x) = A·e^(−k·x) (demande), k=kNum/kDen exact. */
  A: number;
  kNum: number;
  kDen: number;
  /** g(x) = m·x + p (offre, affine croissante, coefficients ENTIERS "donnés explicitement"). */
  m: number;
  p: number;
  /** Point d'équilibre (Q,P) — résolu NUMÉRIQUEMENT à la construction (bisection, f−g strictement
   * décroissante partout donc racine UNIQUE — voir en-tête `familleF.ts`), jamais par un solveur
   * symbolique générique (transcendant, pas de forme fermée). Comparé par TOLÉRANCE côté Couche B. */
  Q: number;
  P: number;
  /** Surplus consommateur ATTENDU = ∫[0;Q](f(x)−P)dx, PRÉCALCULÉ par la Couche A (formule
   * transcendante — jamais recalculée côté Couche B depuis A/k/Q/P). */
  surplusAttendu: number;
}

// ============================================================================
// Famille G — Volume de révolution appliqué, 3 sous-types.
// ============================================================================

export type SousTypeG_Problemes = "soustraction" | "archimede" | "calotte";

/** Sous-type "soustraction de volume" (2 écrans) — RÉUTILISE `ExerciceVolumeA` (6gen27 famille A,
 * type ET vérification `diagnostiquerAEcran3`) pour le volume total. */
export interface ExerciceFamilleG_Soustraction {
  famille: "G";
  sousType: "soustraction";
  volumeTotal: ExerciceVolumeA;
  /** Volume total ATTENDU (=π·(primitiveDeveloppeReference(b)−primitiveDeveloppeReference(a)) de
   * `volumeTotal`), PRÉCALCULÉ — le champ `volumeTotal` reste nécessaire pour la réutilisation
   * DIRECTE de `diagnostiquerAEcran3` à l'écran 1 ; ce champ sert l'écran 2 (soustraction) sans
   * dupliquer la formule dans `moteur6e/verificationIntegralesProblemes.ts`. */
  volumeTotalAttendu: number;
  /** Volume intérieur creux DONNÉ (cylindre), en unités cohérentes avec `volumeTotal`. */
  volumeInterieur: number;
}

/** Sous-type "principe d'Archimède" (3 écrans) — RÉUTILISE `ExerciceVolumeD` (6gen27 famille D,
 * type ET vérification `diagnostiquerDEcran1`) pour le volume du paraboloïde (contenant). */
export interface ExerciceFamilleG_Archimede {
  famille: "G";
  sousType: "archimede";
  paraboloide: ExerciceVolumeD;
  /** Rayon de la bille totalement immergée. */
  r: number;
}

/** Sous-type "calotte sphérique" (3 écrans) — construction FRAÎCHE (pas de réutilisation directe de
 * 6gen27, forme différente — π∫(r²−(y−r)²)dy, voir en-tête `familleG.ts`), s'appuie sur
 * `diagnostiquerPrimitive` (`moteur6e/verificationCalculPrimitives.ts`, 6gen23) pour l'écran de
 * primitive. */
export interface ExerciceFamilleG_Calotte {
  famille: "G";
  sousType: "calotte";
  r: number;
  /** Hauteur d'eau demandée à l'écran final, 0<hDemande<2r. */
  hDemande: number;
  /** Intégrande posé r²−(y−r)², ÉVALUABLE (r déjà substitué) — écran 1. */
  integrandeReference: (y: number) => number;
  /** Primitive (constante nulle) de l'intégrande DÉVELOPPÉ — écran 2. */
  primitiveReference: (y: number) => number;
}

export type ExerciceFamilleG_Problemes = ExerciceFamilleG_Soustraction | ExerciceFamilleG_Archimede | ExerciceFamilleG_Calotte;

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceIntegralesProblemes =
  | ExerciceFamilleA_Problemes
  | ExerciceFamilleB_Problemes
  | ExerciceFamilleC_Problemes
  | ExerciceFamilleD_Problemes
  | ExerciceFamilleE_Problemes
  | ExerciceFamilleF_Problemes
  | ExerciceFamilleG_Problemes;

export type FamilleIntegralesProblemes = ExerciceIntegralesProblemes["famille"];

export type GenerateurExerciceIntegralesProblemes = () => ExerciceIntegralesProblemes;
