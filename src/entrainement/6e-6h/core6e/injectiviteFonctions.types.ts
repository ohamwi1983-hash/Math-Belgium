/**
 * Couche core (6e) — contrat pour `6gen1` ("Fonctions injectives/surjectives/bijectives",
 * chapitre 1). Indépendant de tout contrat 4e/5e — voir CLAUDE.md : aucun contrat/moteur partagé
 * entre les trois chantiers.
 *
 * ============================================================================
 * REFONTE TOTALE (voir `docs/historique-6e.md`) — remplace intégralement l'ancienne version
 * (7 familles, 4 écrans domaine/image → injective → surjective → bijective sur 3 ensembles fixes).
 * Nouvelle spec : 6 familles, 5 écrans domaine → injective(+intervalle) → réciproque → image →
 * bijection(double combobox).
 * ============================================================================
 *
 * Les 6 familles (tirage ÉQUIPROBABLE — spec explicite) :
 * - `puissanceAffine`        a) f(x)=(ax+b)^n
 * - `racineNieme`            b) f(x)=(ax+b)^(1/n)
 * - `puissanceMonome`        c) f(x)=a·x^n+b
 * - `racinePlusConstante`    d) f(x)=√(ax+b)+c
 * - `homographique`          e) f(x)=(ax+b)/(cx+d)
 * - `quadratique`            f) f(x)=ax²+bx+c
 *
 * Génération commune : a,b,c,d∈{−5,...,−1,1,...,5} (entiers, jamais 0) ; n∈{−4,−3,−2,2,3,4} (jamais
 * 0 ni 1) — voir chaque `generateurs6e/injectiviteFonctions/familles/*.ts` pour le détail par
 * famille (parité de n / signe de a déterminent la sous-variante, jamais un tirage séparé).
 *
 * ============================================================================
 * **PIVOT ET BRANCHES gauche/droite — le point central de cohérence de ce générateur**
 * ============================================================================
 * Pour les familles jamais injectives sur leur domaine entier (a n pair, c n pair, f), f est
 * symétrique par rapport à un `pivot` (x=-b/a pour a, x=0 pour c, x=-b/(2a) pour f). Les 2 "moitiés"
 * de part et d'autre du pivot (`intervalleGauche`/`intervalleDroite`) sont TOUJOURS acceptées
 * indifféremment comme le "plus grand intervalle d'injectivité" (écran 2 et combobox X de l'écran
 * 5). Mais la RÉCIPROQUE (écran 3) DIFFÈRE algébriquement selon la branche choisie (signe opposé
 * devant la racine) — d'où `fInverseGauche`/`fInverseDroite`, deux closures distinctes. La Couche B
 * (`moteur6e/sessionInjectiviteFonctions.ts`) mémorise quelle branche l'élève a choisie à l'écran 2
 * pour évaluer l'écran 3 avec LA BONNE closure — ne jamais laisser les deux se décorréler (piège
 * explicite de la spec).
 *
 * Pour les familles toujours injectives (b, d, e, et a/c à n impair), il n'y a pas de pivot
 * pertinent (`pivot=null`) : `intervalleGauche`/`intervalleDroite` valent alors tous deux le
 * domaine entier et `fInverseGauche`/`fInverseDroite` sont LA MÊME closure (branche unique) — ceci
 * permet à la Couche B de traiter les 6 familles de façon UNIFORME (jamais de branchement
 * `if (famille === ...)` côté vérification), voir l'en-tête de
 * `moteur6e/verificationInjectiviteFonctions.ts`.
 *
 * `image` est calculée sur le domaine restreint (n'importe laquelle des 2 moitiés si non injective
 * — IDENTIQUE des deux côtés par symétrie, jamais 2 champs séparés).
 */
import type { EnsembleReelGuide } from "./ensembleReel.types";

export type FamilleInjectiviteFonctions = "puissanceAffine" | "racineNieme" | "puissanceMonome" | "racinePlusConstante" | "homographique" | "quadratique";

/** a) f(x) = (ax+b)^n */
export interface ParametresPuissanceAffine {
  famille: "puissanceAffine";
  a: number;
  b: number;
  n: number;
}

/** b) f(x) = (ax+b)^(1/n) */
export interface ParametresRacineNieme {
  famille: "racineNieme";
  a: number;
  b: number;
  n: number;
}

/** c) f(x) = a·x^n + b */
export interface ParametresPuissanceMonome {
  famille: "puissanceMonome";
  a: number;
  b: number;
  n: number;
}

/** d) f(x) = √(ax+b) + c */
export interface ParametresRacinePlusConstante {
  famille: "racinePlusConstante";
  a: number;
  b: number;
  c: number;
}

/** e) f(x) = (ax+b)/(cx+d) */
export interface ParametresHomographique {
  famille: "homographique";
  a: number;
  b: number;
  c: number;
  d: number;
}

/** f) f(x) = ax² + bx + c */
export interface ParametresQuadratique {
  famille: "quadratique";
  a: number;
  b: number;
  c: number;
}

export type ParametresInjectiviteFonctions =
  | ParametresPuissanceAffine
  | ParametresRacineNieme
  | ParametresPuissanceMonome
  | ParametresRacinePlusConstante
  | ParametresHomographique
  | ParametresQuadratique;

export interface ExerciceInjectiviteFonctions {
  parametres: ParametresInjectiviteFonctions;
  /** LaTeX de f(x), déjà simplifié (jamais de coefficient ±1 littéral, jamais de double signe). */
  fLatex: string;
  domaine: EnsembleReelGuide;
  injective: boolean;
  /** Pivot de symétrie (voir en-tête de fichier) — `null` si `injective===true` (aucun pivot
   * pertinent, pas de sous-question à l'écran 2). */
  pivot: number | null;
  /** Les 2 moitiés du domaine de part et d'autre du pivot — TOUJOURS renseignées : si
   * `injective===true`, les deux valent le domaine entier (branche unique, voir en-tête). */
  intervalleGauche: EnsembleReelGuide;
  intervalleDroite: EnsembleReelGuide;
  /** Image de f restreinte à une des 2 moitiés si non injective (identique des deux côtés par
   * symétrie), ou image sur le domaine entier si injective. */
  image: EnsembleReelGuide;
  fReference: (x: number) => number;
  /** Réciproque par branche — IDENTIQUES si `injective===true` (voir en-tête). */
  fInverseGauche: (y: number) => number;
  fInverseDroite: (y: number) => number;
  /** Options (dont la/les bonnes réponses + distracteurs plausibles) pour les 2 comboboxes de
   * l'écran 5 — construites à la génération (Couche A), jamais recalculées côté présentation. */
  optionsX: EnsembleReelGuide[];
  optionsY: EnsembleReelGuide[];
}

export type GenerateurExerciceInjectiviteFonctions = () => ExerciceInjectiviteFonctions;
