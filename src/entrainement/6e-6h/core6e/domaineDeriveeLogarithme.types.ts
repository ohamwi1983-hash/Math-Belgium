/**
 * Couche core (6e) — contrat pour `6gen16` ("Domaine, dérivée et dérivation logarithmique",
 * chapitre 3 "Fonctions logarithmes"). 7 familles A-G STRUCTURELLEMENT DISJOINTES (union
 * discriminée par `famille`), architecture calquée sur `6gen7` (`domaineDeriveeExponentielles.types.ts`,
 * chapitre 2) — mêmes principes de conception, formules adaptées au logarithme :
 * d/dx[ln(u)]=u'/u ; d/dx[log_base(u)]=u'/(u·ln(base)).
 *
 * **Décision de conception — deux tâches INDÉPENDANTES pour A-F** (même principe que 6gen7) :
 * l'écran "domaine" ne conditionne jamais le contenu des écrans de dérivée qui suivent — chaque
 * écran est vérifié directement contre la vérité mathématique de l'exercice. `domaine` PRÉCALCULÉ
 * ("cible d'abord") et stocké en `EnsembleReelGuide` sur chaque exercice A-F.
 *
 * **Famille G — pas de champ `domaine`** : hypothèse reprise de l'énoncé source ("les bases sont
 * supposées strictement positives"), aucun écran de domaine pour cette famille (contrairement aux
 * 6 autres) — voir `moteur6e/typesDomaineDeriveeLogarithme.ts` pour le dispatch de phases sans
 * `xDomaine` pour G.
 *
 * **Ambiguïtés de spec résolues par jugement (documentées ici, une par famille concernée)** :
 *
 * - **Famille C, sous-type "trigLn"** : la spec écrit littéralement "trig(x)·ln(trig2(x))". Le
 *   domaine LITTÉRAL de ln(sin(x)) (ou ln(cos(x))) est une union INFINIE d'intervalles (périodique,
 *   ex. sin(x)>0 sur chaque période) — non représentable par `EnsembleReelGuide` (union FINIE de
 *   morceaux, voir `ensembleReel.types.ts`). Résolu en décalant l'argument du log par une constante
 *   (`2+trig2(x)`, toujours dans [1;3], jamais nul/négatif) : domaine ℝ, formule mathématiquement
 *   saine, esprit "produit avec terme logarithmique" préservé.
 * - **Famille F, sous-type "lnSurSin"** (ln(sin(e^x))/sin(e^x) dans la spec source) : même
 *   problème de domaine périodique infini (e^x parcourt (0;+∞), sin(e^x)>0 sur une infinité
 *   d'intervalles). Même résolution : `ln(2+sin(e^x))/(2+sin(e^x))`, domaine ℝ.
 * - **Famille F, sous-type "racineArcsin"** (spec : "√(1−arcsin(e^x))") : le domaine LITTÉRAL exige
 *   arcsin(e^x)≤1 ⟺ e^x≤sin(1) ⟺ x≤ln(sin(1)) — borne TRANSCENDANTE, non saisissable exactement
 *   via `EnsembleReelGuideBuilder` (qui n'accepte qu'entier/décimal/fraction, jamais une expression
 *   symbolique — même contrainte que 6gen7 famille F, restriction de k aux carrés parfaits pour
 *   `arccos`). Résolu en RÉORDONNANT la composition (racine à l'intérieur plutôt qu'à l'extérieur) :
 *   `arcsin(√(1−e^x))` — même intention pédagogique (racine+arcsin+exponentielle, révision pure
 *   chapitres 1-2, AUCUN logarithme, conforme à la spec), domaine exactement `x≤0` (`e^x≤1`), la
 *   condition arcsin(√(1−e^x))∈[-1;1] étant alors automatiquement satisfaite (√(1−e^x)∈[0;1[⊂[-1;1]).
 * - **Famille F, sous-type "arctanLog"** : "log(2x)" sans base explicite (contrairement aux autres
 *   familles, qui écrivent systématiquement "log_base") — interprété comme le logarithme décimal
 *   (base 10), convention standard quand "log" apparaît sans indice explicite.
 * - **Famille G, sous-types "à simplifier"** : la spec donne littéralement "(√x)^x" pour le premier,
 *   mais annonce que "les deux [sous-types] se réduisent à la même forme finale x^(1+x/2)" — or
 *   (√x)^x = x^(x/2) ≠ x^(1+x/2) (elles diffèrent d'un facteur x). Le second sous-type, lui,
 *   correspond exactement à la forme annoncée : x·√(x^x) = x·x^(x/2) = x^(1+x/2). Résolu en
 *   ajoutant le même facteur "x·" au premier sous-type (`x·(√x)^x = x·x^(x/2) = x^(1+x/2)`,
 *   cohérent avec la forme finale explicitement donnée par la spec) — correction d'une coquille de
 *   transcription plutôt qu'une réinterprétation arbitraire.
 */
import type { EnsembleReelGuide } from "./ensembleReel.types";

// ============================================================================
// Famille A — Application directe log_base(u), domaine simple (2 écrans : domaine, dérivée). 3
// sous-types : "puissance" (log_base(k^x), domaine ℝ), "carre" (log_base(x²+c), c>0, domaine ℝ),
// "affine" (log_base(mx+n), domaine mx+n>0).
// ============================================================================

export interface ExerciceDomaineDeriveeLogAPuissance {
  famille: "A";
  sousType: "puissance";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
  k: number;
}

export interface ExerciceDomaineDeriveeLogACarre {
  famille: "A";
  sousType: "carre";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
  c: number;
}

export interface ExerciceDomaineDeriveeLogAAffine {
  famille: "A";
  sousType: "affine";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
  m: number;
  n: number;
}

export type ExerciceDomaineDeriveeLogA = ExerciceDomaineDeriveeLogAPuissance | ExerciceDomaineDeriveeLogACarre | ExerciceDomaineDeriveeLogAAffine;

// ============================================================================
// Famille B — Domaine via racine/quadratique, parfois double contrainte (2 écrans : domaine,
// dérivée). 4 sous-types, base TOUJOURS entière {2,3,5,7,10} (spec littérale, jamais "e" pour
// cette famille).
//
// **Décision de conception — sous-type "doubleContrainte", `m` restreint à {1,-1}** : la spec
// (√(1−log_base(mx+n))) exige DEUX conditions croisées (mx+n>0 ET log_base(mx+n)≤1, i.e.
// mx+n≤base) — bornes `-n/m` et `(base-n)/m`, potentiellement fractionnaires pour `m` quelconque.
// Restreint à `m∈{1,-1}` ("cible d'abord", même esprit que 6gen7 §F) : les deux bornes deviennent
// alors des ENTIERS exacts (`-n` ou `n`, `base-n` ou `n-base`), saisissables sans ambiguïté via
// `EnsembleReelGuideBuilder`, sans jamais affaiblir le piège pédagogique (toujours 2 conditions à
// croiser, toujours un intervalle borné non trivial).
// ============================================================================

/** f(x) = √(1−log_base(mx+n)), m∈{1,-1}. Domaine : 0 < mx+n ≤ base (double contrainte). */
export interface ExerciceDomaineDeriveeLogBDoubleContrainte {
  famille: "B";
  sousType: "doubleContrainte";
  domaine: EnsembleReelGuide;
  base: number;
  m: 1 | -1;
  n: number;
}

/** f(x) = log_base(√(1−x²)). Domaine : -1 < x < 1 (racine interne au log). */
export interface ExerciceDomaineDeriveeLogBRacineInterne {
  famille: "B";
  sousType: "racineInterne";
  domaine: EnsembleReelGuide;
  base: number;
}

/** f(x) = log_base(x²−k²). Domaine en 2 morceaux : x<-k ou x>k. */
export interface ExerciceDomaineDeriveeLogBQuadratique {
  famille: "B";
  sousType: "quadratique";
  domaine: EnsembleReelGuide;
  base: number;
  k: number;
}

/** f(x) = log_base(√(x−p)). Domaine simplifié : x>p suffit. */
export interface ExerciceDomaineDeriveeLogBRacineSimplifiee {
  famille: "B";
  sousType: "racineSimplifiee";
  domaine: EnsembleReelGuide;
  base: number;
  p: number;
}

export type ExerciceDomaineDeriveeLogB =
  | ExerciceDomaineDeriveeLogBDoubleContrainte
  | ExerciceDomaineDeriveeLogBRacineInterne
  | ExerciceDomaineDeriveeLogBQuadratique
  | ExerciceDomaineDeriveeLogBRacineSimplifiee;

// ============================================================================
// Famille C — Produit avec terme logarithmique (3 écrans : domaine, facteurs, assemblage). 5
// sous-types.
// ============================================================================

/** f(x) = k·x·ln(x). Domaine x>0. */
export interface ExerciceDomaineDeriveeLogCProduitLn {
  famille: "C";
  sousType: "produitLn";
  domaine: EnsembleReelGuide;
  k: number;
}

/** f(x) = trig(x)·ln(2+trig2(x)). Domaine ℝ (voir note de tête, décalage +2). */
export interface ExerciceDomaineDeriveeLogCTrigLn {
  famille: "C";
  sousType: "trigLn";
  domaine: EnsembleReelGuide;
  trig: "sin" | "cos";
  trig2: "sin" | "cos";
}

/** f(x) = base^x·ln(x). Domaine x>0. */
export interface ExerciceDomaineDeriveeLogCExpoLn {
  famille: "C";
  sousType: "expoLn";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
}

/** f(x) = x²·ln(mx+n). Domaine mx+n>0. */
export interface ExerciceDomaineDeriveeLogCCarreLn {
  famille: "C";
  sousType: "carreLn";
  domaine: EnsembleReelGuide;
  m: number;
  n: number;
}

/** f(x) = ln(x)·√(x²−k²). Domaine [k;+∞[ (x>0 restreint la branche x≤-k). */
export interface ExerciceDomaineDeriveeLogCLnRacine {
  famille: "C";
  sousType: "lnRacine";
  domaine: EnsembleReelGuide;
  k: number;
}

export type ExerciceDomaineDeriveeLogC =
  | ExerciceDomaineDeriveeLogCProduitLn
  | ExerciceDomaineDeriveeLogCTrigLn
  | ExerciceDomaineDeriveeLogCExpoLn
  | ExerciceDomaineDeriveeLogCCarreLn
  | ExerciceDomaineDeriveeLogCLnRacine;

// ============================================================================
// Famille D — Quotient avec terme logarithmique (3 écrans : domaine, N'/D', assemblage). 3
// sous-types, le 3e avec un point exclu caché dans le dénominateur (piège central de spec).
// ============================================================================

/** f(x) = (x+log_base(x))/x. Domaine x>0. */
export interface ExerciceDomaineDeriveeLogDSommeLog {
  famille: "D";
  sousType: "sommeLog";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
}

/** f(x) = ln(x)/(k·x). Domaine x>0. */
export interface ExerciceDomaineDeriveeLogDLnSurKx {
  famille: "D";
  sousType: "lnSurKx";
  domaine: EnsembleReelGuide;
  k: number;
}

/** f(x) = (base^x+x)/ln(x). Domaine x>0 ET x≠1 (ln(x)≠0, piège du point exclu caché). */
export interface ExerciceDomaineDeriveeLogDExpoSurLn {
  famille: "D";
  sousType: "expoSurLn";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
}

export type ExerciceDomaineDeriveeLogD = ExerciceDomaineDeriveeLogDSommeLog | ExerciceDomaineDeriveeLogDLnSurKx | ExerciceDomaineDeriveeLogDExpoSurLn;

// ============================================================================
// Famille E — Simplifier via les propriétés du log avant de dériver (3 écrans : domaine,
// simplifier, dérivée) — piège central du générateur. 6 sous-types, domaine calculé sur
// l'expression ORIGINALE (avant simplification).
// ============================================================================

/** f(x) = ln((e^x−1)²) → 2ln|e^x−1|. Domaine ℝ\{0}. Piège : 2ln(e^x−1) SANS valeur absolue est
 * faux (e^x−1 peut être négatif, pour x<0). */
export interface ExerciceDomaineDeriveeLogEPuissanceAbs {
  famille: "E";
  sousType: "puissanceAbs";
  domaine: EnsembleReelGuide;
}

/** f(x) = ln((mx+n)/(px+q)) → ln(mx+n)−ln(px+q), valide seulement si les deux arguments sont
 * positifs séparément — `m>0`, `p<0` GARANTIT que le domaine réel de f (quotient positif) coïncide
 * EXACTEMENT avec "les deux positifs séparément" (jamais la branche "les deux négatifs séparément",
 * qui rendrait la simplification invalide sur une partie du domaine — voir
 * `generateurs6e/domaineDeriveeLogarithme/familles/E.ts` pour la construction "cible d'abord"). */
export interface ExerciceDomaineDeriveeLogEQuotientDifference {
  famille: "E";
  sousType: "quotientDifference";
  domaine: EnsembleReelGuide;
  m: number;
  n: number;
  p: number;
  q: number;
}

/** f(x) = ln(√x) → (1/2)ln(x). Domaine x>0. */
export interface ExerciceDomaineDeriveeLogEPuissanceSimple {
  famille: "E";
  sousType: "puissanceSimple";
  domaine: EnsembleReelGuide;
}

/** f(x) = (ln x)³−ln(x³) → (ln x)³−3ln(x). Domaine x>0. */
export interface ExerciceDomaineDeriveeLogECombinaison {
  famille: "E";
  sousType: "combinaison";
  domaine: EnsembleReelGuide;
}

/** f(x) = ln((x²−k²)²) → 2ln|x²−k²|. Domaine ℝ\{-k;k} — PLUS LARGE que le domaine de ln(x²−k²)
 * seul (|x|>k, deux demi-droites) : exactement l'illustration demandée par la spec ("la valeur
 * absolue élargit le domaine par rapport à une version sans valeur absolue"). */
export interface ExerciceDomaineDeriveeLogEValeurAbsolueQuadratique {
  famille: "E";
  sousType: "valeurAbsolueQuadratique";
  domaine: EnsembleReelGuide;
  k: number;
}

/** f(x) = ln(x^x) → x·ln(x). Domaine x>0. Ne nécessite PAS la dérivation logarithmique implicite
 * de la famille G (une seule fonction variable, x, pas u(x)^v(x) avec deux fonctions distinctes) —
 * seulement cette simplification puis la règle du produit. */
export interface ExerciceDomaineDeriveeLogEDejaSimplifie {
  famille: "E";
  sousType: "dejaSimplifie";
  domaine: EnsembleReelGuide;
}

export type ExerciceDomaineDeriveeLogE =
  | ExerciceDomaineDeriveeLogEPuissanceAbs
  | ExerciceDomaineDeriveeLogEQuotientDifference
  | ExerciceDomaineDeriveeLogEPuissanceSimple
  | ExerciceDomaineDeriveeLogECombinaison
  | ExerciceDomaineDeriveeLogEValeurAbsolueQuadratique
  | ExerciceDomaineDeriveeLogEDejaSimplifie;

// ============================================================================
// Famille F — Synthèse transversale, log+trig+exponentielle+cyclométrique (2 écrans : domaine,
// dérivée). 4 sous-types (voir note de tête pour "lnSurSin"/"racineArcsin", reformulés pour
// domaine exactement constructible).
// ============================================================================

/** f(x) = ln(2+sin(e^x))/(2+sin(e^x)). Domaine ℝ. */
export interface ExerciceDomaineDeriveeLogFLnSurSin {
  famille: "F";
  sousType: "lnSurSin";
  domaine: EnsembleReelGuide;
}

/**
 * f(x) = arcsin(log_base(k^x)), avec `k=base^p` — garantit `log_base(k^x)=p·x` EXACTEMENT (une
 * fonction affine simple), donc un domaine borné SYMÉTRIQUE `[-1/p;1/p]` propre (même esprit que
 * 6gen7 §F, restriction pour borne exactement saisissable). `p∈{2,3}`, couples (base,k) valides
 * dans la plage spec `base∈{2,3,5,7,10}`, `k∈{2,...,9}` : (2,4,p=2), (2,8,p=3), (3,9,p=2).
 */
export interface ExerciceDomaineDeriveeLogFArcsinLog {
  famille: "F";
  sousType: "arcsinLog";
  domaine: EnsembleReelGuide;
  base: number;
  k: number;
  p: 2 | 3;
}

/** f(x) = arcsin(√(1−e^x)) — reformulation de "√(1−arcsin(e^x))" (voir note de tête), pure
 * révision chapitres 1-2, aucun logarithme. Domaine x≤0. */
export interface ExerciceDomaineDeriveeLogFRacineArcsin {
  famille: "F";
  sousType: "racineArcsin";
  domaine: EnsembleReelGuide;
}

/** f(x) = arctan(2x)/(1−log₁₀(2x)). Domaine x>0 ET x≠5 (point exclu caché, dénominateur nul en
 * log₁₀(2x)=1 i.e. 2x=10). */
export interface ExerciceDomaineDeriveeLogFArctanLog {
  famille: "F";
  sousType: "arctanLog";
  domaine: EnsembleReelGuide;
}

export type ExerciceDomaineDeriveeLogF =
  | ExerciceDomaineDeriveeLogFLnSurSin
  | ExerciceDomaineDeriveeLogFArcsinLog
  | ExerciceDomaineDeriveeLogFRacineArcsin
  | ExerciceDomaineDeriveeLogFArctanLog;

// ============================================================================
// Famille G — Dérivation logarithmique implicite, f(x)=u(x)^v(x) (3 écrans : identifier u^v,
// f'/f, isoler f') — NOUVEAUTÉ CENTRALE. Aucun champ `domaine` (hypothèse reprise de l'énoncé
// source : bases supposées strictement positives, pas d'écran de domaine pour cette famille).
//
// **Décision de conception — aucun paramètre numérique aléatoire** : contrairement aux 6 autres
// familles, la spec ne donne AUCUNE plage de coefficients pour la famille G — chaque variante est
// une formule STRUCTURELLEMENT fixe (`x^x`, `x^(sin x)`...). `construireG()` tire uniquement la
// VARIANTE (8 au total), équiprobable — voir `generateurs6e/domaineDeriveeLogarithme/familles/G.ts`.
// ============================================================================

export type VarianteG =
  | "xx" // x^x
  | "xSinx" // x^(sin x)
  | "cosTan" // (cos x)^(tan x)
  | "unSurXPuissanceX" // (1+1/x)^x
  | "sinXInvX" // (sin x)^(1/x)
  | "racineXPuissanceX" // x·(√x)^x = x^(1+x/2) — voir note de tête (coquille corrigée)
  | "xRacineXPuissanceX" // x·√(x^x) = x^(1+x/2)
  | "produit"; // (1+x)/x^(1+x) = (1+x)·x^(-(1+x))

export interface ExerciceDomaineDeriveeLogG {
  famille: "G";
  variante: VarianteG;
}

export type ExerciceDomaineDeriveeLogarithme =
  | ExerciceDomaineDeriveeLogA
  | ExerciceDomaineDeriveeLogB
  | ExerciceDomaineDeriveeLogC
  | ExerciceDomaineDeriveeLogD
  | ExerciceDomaineDeriveeLogE
  | ExerciceDomaineDeriveeLogF
  | ExerciceDomaineDeriveeLogG;

export type FamilleDomaineDeriveeLogarithme = ExerciceDomaineDeriveeLogarithme["famille"];

export type GenerateurExerciceDomaineDeriveeLogarithme = () => ExerciceDomaineDeriveeLogarithme;
