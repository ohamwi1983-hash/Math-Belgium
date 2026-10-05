/**
 * Couche core (5e) — contrat pour 5gen13 ("Modéliser une fonction sinusoïdale en contexte").
 * Réutilise le PRINCIPE de la notation canonique A/T/φ/f/b de 5gen8/9, mais PAS le type
 * `RationnelPi` exact : ce générateur reste dans le monde "contexte physique" (comme 5gen5), ses
 * valeurs sont des décimales ordinaires, jamais des multiples exacts de π — cohérent avec le fait
 * que Phase 2 réutilise le RÉGIME "decimal" de 5gen10 (`ValeurPiOuDecimale.exact=null`), jamais son
 * régime "exact".
 *
 * ⚠️ **Note de notation, signalée explicitement** : le prompt d'origine écrit la fonction modèle
 * `A·sin(ω·t+φ)+b` — ici φ est la constante ADDITIVE à l'intérieur de l'argument (≡ le "C"/"bArg"
 * de 5gen10/11), **PAS** le déphasage temporel `φ` de 5gen8/9 (qui vaudrait `φ_5gen8=−C/ω` et
 * s'utiliserait comme `A·sin(ω·(t−φ_5gen8))+b`). Cette même lettre porte donc 2 significations
 * différentes selon le générateur — le prompt d'origine écrit explicitement `A sin(ωt+φ)+b` et
 * `ωt₀+φ=π/2`, jamais un terme `ω(t−φ)`, ce qui règle l'ambiguïté en faveur de la convention
 * "constante additive" retenue ici.
 */

export type TechniquePhase1 = "b1" | "b2" | "b3" | "donnee";

export interface FonctionModelisationSinusoide {
  A: number;
  omega: number;
  /** `null` UNIQUEMENT pour la technique B1 — φ reste symbolique, aucune donnée fournie ne le
   * détermine (piège central de B1, voir sa section dédiée). */
  phi: number | null;
  b: number;
}

// ============================================================================
// Phase 1 — les 4 techniques.
// ============================================================================

/** B1 — contexte physique direct (ex. grande roue) : A, b, ω calculables depuis R/h_sol/T ; φ
 * reste symbolique — AUCUNE Phase 2 ne peut être tirée pour cette technique (f(t) n'est jamais
 * complètement déterminée), voir `generateurs5e/modelisationSinusoide/index.ts`. */
export interface DonneesB1 {
  technique: "b1";
  rayon: number;
  hauteurSol: number;
  dureeTour: number;
  fonction: FonctionModelisationSinusoide;
}

/** B2 — max/min + un point extremum connu (le point fourni est TOUJOURS un extremum, jamais un
 * point quelconque — évite l'ambiguïté de périodicité déjà rencontrée sur 5gen9). */
export interface DonneesB2 {
  technique: "b2";
  max: number;
  min: number;
  periode: number;
  t0: number;
  /** `true` si le point fourni est le MAXIMUM (argument cible π/2), `false` si le MINIMUM
   * (argument cible 3π/2) — piège central explicite de la spec. */
  estMax: boolean;
  /** La valeur "naturelle" de ω·t₀+φ utilisée à la génération (π/2 ou 3π/2) — la vérification de φ
   * accepte toute valeur congrue modulo 2π, jamais seulement celle-ci. */
  argumentCible: number;
  fonction: FonctionModelisationSinusoide;
}

/** B3 — système à 2 points, A déjà connu. Résolution par ADDITION et SOUSTRACTION membre à membre
 * (jamais substitution) des 2 équations linéarisées ω·t₁+φ=α₁, ω·t₂+φ=α₂ — génération CONTRAINTE
 * pour qu'α₁/α₂ tombent tous deux dans [−π/2;π/2] (branche principale d'arcsin), pour que l'écran 1
 * (poser le système via arcsin) reste sans ambiguïté de branche — simplification assumée,
 * documentée dans `generateurs5e/modelisationSinusoide/techniqueB3.ts`. */
export interface DonneesB3 {
  technique: "b3";
  A: number;
  /** Décalage vertical b — DONNÉ, comme A (le système à 2 points ne détermine que ω et φ). */
  b: number;
  t1: number;
  v1: number;
  t2: number;
  v2: number;
  /** = ω·t₁+φ, dans [−π/2;π/2] par construction — cible de l'écran "poser le système" (premier
   * membre). */
  alpha1: number;
  alpha2: number;
  fonction: FonctionModelisationSinusoide;
}

/** f(t) donnée directement — Phase 1 sautée entièrement. */
export interface DonneesDonnee {
  technique: "donnee";
  fonction: FonctionModelisationSinusoide;
}

export type DonneesPhase1 = DonneesB1 | DonneesB2 | DonneesB3 | DonneesDonnee;

// ============================================================================
// Phase 2 — 3 types, optionnelle (peut être absente : `phase2: null`).
// ============================================================================

export interface BrancheModelisation {
  constante: number;
  periode: number;
}

/** Type 1 — résoudre f(t)=k, réutilise le pipeline de 5gen10, filtré dans [0;fenêtre] au lieu de
 * [0;2π[. */
export interface QuestionResoudre {
  type: "resoudre";
  k: number;
  fenetre: number;
  /** `true` si |m|>1 (aucune solution mathématique) — mêmes 2 écrans suivants ("branches"/
   * "solutions") ALORS sautés, même principe que le "aucune solution" déjà catalogué en 5gen10. */
  aucuneSolution: boolean;
  /** 2 branches en u (m∈]−1;1[, cas général) — vide si `aucuneSolution`. */
  branchesU: BrancheModelisation[];
  /** 2 branches en t (dérivées de `branchesU`) — vide si `aucuneSolution`. */
  branchesT: BrancheModelisation[];
  /** Solutions t dans [0;fenêtre], triées — vide si `aucuneSolution`. */
  solutions: number[];
}

/** Type 2 — extremums de f(t), réutilise la technique de 5gen11 (formule FUSIONNÉE, UNE SEULE
 * branche de période π), filtrée dans [0;fenêtre] au lieu de [0;2π[. */
export interface QuestionExtremum {
  type: "extremum";
  fenetre: number;
  brancheU: BrancheModelisation;
  brancheT: BrancheModelisation;
  solutions: number[];
}

export interface IntervalleModelisation {
  inf: number;
  sup: number;
}

/** Type 3 — résoudre l'inéquation f(t)≥k (ou ≤k), technique NOUVELLE sur la plateforme. */
export interface QuestionInequation {
  type: "inequation";
  k: number;
  sens: "ge" | "le";
  fenetre: number;
  /** m=(k−b)/A — cible de l'écran 1 (isoler sin(ωt+φ)≥m ou ≤m). */
  m: number;
  /** Non-`null` UNIQUEMENT si |m|>1 — l'inéquation est alors TOUJOURS vraie ou TOUJOURS fausse sur
   * tout l'intervalle, piège symétrique au "aucune solution" de 5gen10 pour les égalités ; les
   * écrans 2-4 sont alors tous sautés. */
  casSpecial: "toujoursVrai" | "toujoursFaux" | null;
  /** Bornes de RÉFÉRENCE en u pour k=0 (cas général uniquement) : u∈[arcsin(m);π−arcsin(m)]. */
  borneInfU: number;
  borneSupU: number;
  /** Bornes de RÉFÉRENCE en t pour k=0 (cas général uniquement) — dérivées de borneInfU/borneSupU. */
  borneInfT: number;
  borneSupT: number;
  /** Sous-intervalles de t contenus dans [0;fenêtre] (cas général uniquement) — plusieurs
   * intervalles disjoints possibles. */
  intervalles: IntervalleModelisation[];
}

export type QuestionPhase2 = QuestionResoudre | QuestionExtremum | QuestionInequation;

export interface ExerciceModelisationSinusoide {
  phase1: DonneesPhase1;
  /** `null` ssi la Phase 2 n'est pas tirée pour cet exercice (l'exercice s'arrête à la
   * construction) — TOUJOURS `null` pour la technique "b1" (φ jamais numériquement connu, voir sa
   * section dédiée). */
  phase2: QuestionPhase2 | null;
}

export type GenerateurExerciceModelisationSinusoide = () => ExerciceModelisationSinusoide;
