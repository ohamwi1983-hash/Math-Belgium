/**
 * Couche core (6e) — contrat pour `6gen7` ("Domaine et dérivée de fonctions exponentielles",
 * chapitre 2). 6 familles A-F STRUCTURELLEMENT DISJOINTES (union discriminée par `famille`), 2 à 3
 * écrans FIXES par famille (jamais de variance de nombre d'écrans entre les sous-types d'une même
 * famille — vérifié explicitement pour chacune des 6 avant de choisir cette modélisation) : A/B/F
 * (2 écrans : domaine, dérivée) ; C/D/E (3 écrans : domaine, puis 2 écrans de dérivée).
 *
 * **Décision de conception — deux tâches INDÉPENDANTES, jamais une cascade** (spec explicite :
 * "Domaine et dérivée sont deux tâches indépendantes... pas de cascade entre elles") : l'écran
 * "domaine" ne conditionne jamais le contenu des écrans de dérivée qui suivent — chaque écran est
 * vérifié directement contre la vérité mathématique de l'exercice (Couche B), jamais contre la
 * saisie (même correcte) d'un écran précédent. À L'INTÉRIEUR du calcul de la dérivée (familles C/D/E,
 * 2 écrans de dérivée), le second écran ("assemblage"/"dérivée") réutilise conceptuellement les
 * dérivées CORRECTES de l'écran précédent (u', v', N', D', ou la forme simplifiée) — mais cette
 * réutilisation est PORTÉE PAR LA VÉRITÉ MATHÉMATIQUE de l'exercice, jamais par la saisie de
 * l'élève : chaque écran reste vérifié indépendamment contre la cible réelle (même principe déjà
 * établi par `6gen6`, familles D/E — voir `moteur6e/verificationLimitesExponentielles.ts`).
 *
 * **Décision de conception — `domaine` PRÉCALCULÉ sur chaque exercice** (même principe que `6gen1`,
 * `ExerciceInjectiviteFonctions.domaine`/`.image`) : la Couche A calcule le domaine réel "cible
 * d'abord" au moment de la génération et le stocke directement en `EnsembleReelGuide` sur
 * l'exercice — `moteur6e/verificationDomaineDeriveeExponentielles.ts` se contente alors de lire ce
 * champ (donnée pure, aucun import de `src/generateurs6e/` nécessaire), jamais de le recalculer. La
 * DÉRIVÉE, elle, reste purement FONCTIONNELLE (jamais une seule valeur numérique comme une limite) —
 * chaque référence de dérivée est reconstruite directement depuis les paramètres bruts (déjà tous
 * stockés sur l'exercice) par une petite formule DUPLIQUÉE côté moteur6e, même principe déjà établi
 * par `6gen6` (`referenceD`/`referenceE`/...).
 */
import type { EnsembleReelGuide } from "./ensembleReel.types";

// ============================================================================
// Famille A — Application directe, domaine ℝ (2 écrans : domaine, dérivée). 2 sous-types.
// ============================================================================

/** g(x) — soit affine (m·x+n), soit une puissance pure x² ou x³ ("puissance", spec §A). */
export type FormeGA = { type: "affine"; m: number; n: number } | { type: "puissance"; exposant: 2 | 3 };

/** Sous-type "direct" — f(x) = base^(g(x)). */
export interface ExerciceDomaineDeriveeADirect {
  famille: "A";
  sousType: "direct";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
  g: FormeGA;
}

/** Sous-type "carre" — f(x) = (base^(mx+n) − c)². */
export interface ExerciceDomaineDeriveeACarre {
  famille: "A";
  sousType: "carre";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
  m: number;
  n: number;
  c: number;
}

export type ExerciceDomaineDeriveeA = ExerciceDomaineDeriveeADirect | ExerciceDomaineDeriveeACarre;

// ============================================================================
// Famille B — a^u avec u à domaine restreint dans l'exposant (2 écrans : domaine, dérivée). 2
// sous-types, base TOUJOURS entière {2,...,9} (spec littérale — contrairement à la famille A,
// aucun des deux sous-types de B ne mentionne "e" dans son énoncé).
// ============================================================================

/** Sous-type "racine" — f(x) = base^(√(x²−k²)). Domaine ]-∞;-k]∪[k;+∞[. */
export interface ExerciceDomaineDeriveeBRacine {
  famille: "B";
  sousType: "racine";
  domaine: EnsembleReelGuide;
  base: number;
  k: number;
}

/** Sous-type "fraction" — f(x) = base^((mx+n)/(px+q)). Domaine ℝ\{-q/p}. */
export interface ExerciceDomaineDeriveeBFraction {
  famille: "B";
  sousType: "fraction";
  domaine: EnsembleReelGuide;
  base: number;
  m: number;
  n: number;
  p: number;
  q: number;
}

export type ExerciceDomaineDeriveeB = ExerciceDomaineDeriveeBRacine | ExerciceDomaineDeriveeBFraction;

// ============================================================================
// Famille C — Produit avec terme exponentiel (3 écrans : domaine, facteurs, assemblage). 3
// sous-types.
// ============================================================================

/** Sous-type "d" (auto-référentiel) — f(x) = P(x)·e^(P(x)), P(x)=a·x³+b·x². Domaine ℝ. */
export interface ExerciceDomaineDeriveeCD {
  famille: "C";
  sousType: "d";
  domaine: EnsembleReelGuide;
  a: number;
  b: number;
}

/** Sous-type "e" — f(x) = x^r·e^(√x), r∈{1,2}. Domaine [0;+∞[. */
export interface ExerciceDomaineDeriveeCE {
  famille: "C";
  sousType: "e";
  domaine: EnsembleReelGuide;
  r: 1 | 2;
}

/** Sous-type "p" — f(x) = (base^x−c)·trig(x), base∈{2,...,9}, trig∈{sin,cos}. Domaine ℝ. */
export interface ExerciceDomaineDeriveeCP {
  famille: "C";
  sousType: "p";
  domaine: EnsembleReelGuide;
  base: number;
  c: number;
  trig: "sin" | "cos";
}

export type ExerciceDomaineDeriveeC = ExerciceDomaineDeriveeCD | ExerciceDomaineDeriveeCE | ExerciceDomaineDeriveeCP;

// ============================================================================
// Famille D — Quotient avec terme exponentiel (3 écrans : domaine, N'/D', assemblage). 4
// sous-types.
//
// **Décision de conception — plages numériques non fournies par la spec pour cette famille**
// (contrairement à A/B/C, dont chaque sous-type précise `base∈{...}`/coefficients — la spec de D
// se limite à décrire la STRUCTURE de chaque sous-type, "voir en-tête du générateur" pour le
// détail complet) : `base` tirée dans `{e}∪{2,...,6}` (même principe que A — inclut e, contrairement
// à B/C-p qui l'excluent explicitement dans leur propre énoncé — D n'a AUCUNE mention contraire) ;
// `c∈{1,2,3}` (toujours strictement positif, contrainte explicite "c>0" pour h-like/i-like) ;
// `k∈{1,2,3}` (coefficient multiplicatif non nul, f-like/i-like) ; `m∈{1,2}` (coefficient de
// l'exposant, i-like — reste petit pour que l'échantillonnage numérique de la dérivée à des points
// modérés ne diverge pas trop vite). Signalé explicitement plutôt que deviné silencieusement — voir
// aussi CLAUDE.md, section "Création — 6gen7".
// ============================================================================

/** Sous-type "f" — f(x) = (base^x+c)/(k·x). Domaine x≠0. */
export interface ExerciceDomaineDeriveeDF {
  famille: "D";
  sousType: "f";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
  c: number;
  k: number;
}

/** Sous-type "h" — f(x) = (base^x+base^(-x))/(x²+c), c>0. Domaine ℝ. */
export interface ExerciceDomaineDeriveeDH {
  famille: "D";
  sousType: "h";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
  c: number;
}

/** Sous-type "i" — f(x) = k·x²/(base^(mx)+c), c>0. Domaine ℝ. */
export interface ExerciceDomaineDeriveeDI {
  famille: "D";
  sousType: "i";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
  k: number;
  m: number;
  c: number;
}

/** Sous-type "s" — f(x) = (base^(-x)−base^x)/(base^(2x)+1). Domaine ℝ. */
export interface ExerciceDomaineDeriveeDS {
  famille: "D";
  sousType: "s";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
}

export type ExerciceDomaineDeriveeD = ExerciceDomaineDeriveeDF | ExerciceDomaineDeriveeDH | ExerciceDomaineDeriveeDI | ExerciceDomaineDeriveeDS;

// ============================================================================
// Famille E — Simplifier avant de dériver (3 écrans : domaine, simplifier, dérivée). Domaine
// TOUJOURS ℝ (spec explicite). 3 sous-types, "cible d'abord" — voir en-tête du générateur.
//
// **Décision de conception — forme de g/h pour le sous-type "j"** (spec : "g,h affines ou
// quadratiques simples") : réutilise `FormeGA` (déjà définie pour la famille A) restreinte à
// `affine` ou `puissance` avec `exposant: 2` uniquement (jamais 3 — "quadratique", pas "cubique") —
// cohérent avec le vocabulaire de la spec, sans introduire un second type structurellement
// identique à `FormeGA` pour un besoin qui s'y superpose exactement.
// ============================================================================

/** Sous-type "j" — base^(g(x))/base^(h(x)), même base → se simplifie en base^(g(x)−h(x)). */
export interface ExerciceDomaineDeriveeEJ {
  famille: "E";
  sousType: "j";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
  g: FormeGA;
  h: FormeGA;
}

/** Sous-type "m" — (base^x−1)/base^x → se simplifie en 1−base^(−x). */
export interface ExerciceDomaineDeriveeEM {
  famille: "E";
  sousType: "m";
  domaine: EnsembleReelGuide;
  base: number;
  baseEstE: boolean;
}

/** Sous-type "n" — (base1^x−c)/base2^x, bases différentes → se simplifie en
 * (base1/base2)^x − c·(1/base2)^x. */
export interface ExerciceDomaineDeriveeEN {
  famille: "E";
  sousType: "n";
  domaine: EnsembleReelGuide;
  base1: number;
  base2: number;
  c: number;
}

export type ExerciceDomaineDeriveeE = ExerciceDomaineDeriveeEJ | ExerciceDomaineDeriveeEM | ExerciceDomaineDeriveeEN;

// ============================================================================
// Famille F — Composition triple, trig/cyclométrique (2 écrans : domaine, dérivée).
// f(x) = trig(e^(x²−k)), trig∈{cos,arccos}, k∈{1,...,5} (cos) ou k∈{1,4} (arccos).
//
// **Décision de conception — k restreint pour arccos** : pour `trig="arccos"`, le domaine réel est
// `[-√k;√k]` — si k n'est pas un carré parfait, `√k` est irrationnel et ne peut pas être saisi
// EXACTEMENT via `EnsembleReelGuideBuilder` (`parserNombreOuFraction` n'accepte qu'un entier, un
// décimal ou une fraction `p/q`, jamais une notation radicale) : demander une valeur décimale
// approchée à 1e-6 près serait déraisonnable pour un élève. `k` est donc restreint à `{1,4}`
// (carrés parfaits dans la plage `{1,...,5}` de la spec, `√k∈{1,2}`) pour CE sous-type précisément
// — la contrainte "propreté entière du domaine, saisissable exactement" déjà établie ailleurs sur
// la plateforme ("cible d'abord"). Pour `trig="cos"`, le domaine est toujours ℝ (aucune contrainte
// sur k), donc k reste libre sur `{1,...,5}` (littéral spec) — seule la dérivée en dépend, jamais
// le domaine. Signalé explicitement, voir CLAUDE.md.
// ============================================================================

export interface ExerciceDomaineDeriveeF {
  famille: "F";
  trig: "cos" | "arccos";
  k: number;
  domaine: EnsembleReelGuide;
}

export type ExerciceDomaineDeriveeExponentielle = ExerciceDomaineDeriveeA | ExerciceDomaineDeriveeB | ExerciceDomaineDeriveeC | ExerciceDomaineDeriveeD | ExerciceDomaineDeriveeE | ExerciceDomaineDeriveeF;

export type FamilleDomaineDeriveeExponentielle = ExerciceDomaineDeriveeExponentielle["famille"];

export type GenerateurExerciceDomaineDeriveeExponentielle = () => ExerciceDomaineDeriveeExponentielle;
