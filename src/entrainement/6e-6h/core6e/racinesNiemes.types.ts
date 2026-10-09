import type { ValeurExacte } from "./cyclometrique.types";
import type { AngleRemarquable } from "./formeTrigonometrique.types";

/**
 * Couche core (6e) — contrat pour `6gen39` ("Racines n-ièmes d'un nombre complexe", chapitre 7
 * "Nombres complexes", après `6gen34`/`6gen35`/`6gen37`/`6gen38`). 3 familles (A à C), tirage
 * ÉQUIPROBABLE de la famille — voir `generateurs6e/racinesNiemes/index.ts`.
 *
 * `ValeurExacte`/`AngleRemarquable` réutilisés TELS QUELS depuis `core6e/cyclometrique.types.ts`
 * et `core6e/formeTrigonometrique.types.ts` (contrat de réutilisation explicite de `6gen37`, voir
 * en-tête `generateurs6e/formeTrigonometrique/familleA.ts`) — jamais redéclarés ici.
 *
 * ============================================================================
 * **`RacineExacte` — une racine n-ième individuelle, en forme EXACTE (angle + partie réelle/
 * imaginaire), jamais un simple flottant**
 * ============================================================================
 * `re`/`im` sont des `ValeurExacte` (latex+numerique), produites par `combinerModuleAngle`
 * (`generateurs6e/formeTrigonometrique/familleA.ts`, Couche A ↔ Couche A libre) — TOUJOURS un
 * radical simple ou un entier, jamais un flottant arrondi. `angle` est conservé (utile pour
 * l'affichage intermédiaire "θ_k=..." dans les aides/état-actuel), même s'il n'est jamais TAPÉ
 * directement par l'élève à cet écran.
 *
 * ============================================================================
 * **Pourquoi PAS un simple champ texte "a+bi" pour les racines — décision d'architecture centrale
 * de ce générateur, voir en-tête `moteur6e/verificationRacinesNiemes.ts` pour le détail complet**
 * ============================================================================
 * Contrairement à `6gen34`-`6gen38` (un seul champ "a+bi", vérifié via
 * `moteur6e/verificationComplexes.ts`/`expressionComplexe.ts`), les racines de CE générateur
 * combinent RÉGULIÈREMENT un module entier avec un cos/sin irrationnel (√2/2, √3/2) — un résultat
 * du type `a=√2` est IMPOSSIBLE à taper dans `expressionComplexe.ts` (aucune fonction `sqrt` dans sa
 * grammaire, voir son en-tête). Ce générateur utilise donc 2 CHAMPS SÉPARÉS ("partie réelle"/
 * "partie imaginaire"), chacun un nombre RÉEL évalué via `moteur6e/expressionExponentielle.ts`
 * (qui, lui, supporte `sqrt`) — voir `verificationRacinesNiemes.ts`.
 */
export interface RacineExacte {
  angle: AngleRemarquable;
  re: ValeurExacte;
  im: ValeurExacte;
}

// ============================================================================
// Famille A — Racines n-ièmes, cas propre (angles remarquables) (3 écrans).
// ============================================================================

/**
 * `w=r(\cosθ+i\sinθ)`, `r=kModule^n` (puissance n-ième PARFAITE, `kModule` entier simple 1 à 3),
 * `θ` remarquable — MAIS pas n'importe lequel des 16 angles remarquables pour n'importe quel `n` :
 * voir `generateurs6e/racinesNiemes/fermeture.ts` pour la restriction EXACTE (calculée, jamais
 * recopiée à la main) qui garantit que les `n` racines restent TOUTES dans la banque des 16 angles
 * remarquables (condition nécessaire pour que `racines[j].re`/`.im` restent un radical simple
 * tapable).
 */
export interface ExerciceRacinesA {
  famille: "A";
  n: number;
  kModule: number;
  r: number;
  angle: AngleRemarquable;
  /** Les `n` racines, dans l'ordre k=0,...,n-1 (ordre indifférent à la vérification — voir
   * `diagnostiquerListeRacines`). */
  racines: RacineExacte[];
}

// ============================================================================
// Famille B — Racines n-ièmes, cas général (2 écrans).
// ============================================================================

/** `w=a+bi` quelconque (coefficients entiers, mais module/argument PAS nécessairement remarquables
 * — `angle` peut être le fallback décimal de `calculerArgument`, voir son en-tête). Aucune racine
 * n'est stockée ici : l'écran 2 ne demande jamais de valeur numérique unique, seulement une formule
 * générale paramétrée par k (voir `verificationRacinesNiemes.ts`, `diagnostiquerFormuleEntierK`). */
export interface ExerciceRacinesB {
  famille: "B";
  n: number;
  a: number;
  b: number;
  r: number;
  angle: AngleRemarquable;
}

// ============================================================================
// Famille C — zⁿ=wⁿ, astuce racine de l'unité (3 écrans).
// ============================================================================

/**
 * `w=r(\cosθ+i\sinθ)`, `r` entier simple (1 à 4), `θ` remarquable — restriction de fermeture
 * ANALOGUE à la famille A mais sur `n` directement (voir `fermeture.ts` : `n=5` est
 * STRUCTURELLEMENT exclu, `2π/5` n'étant multiple ni de π/6 ni de π/4, donc jamais dans la banque
 * des 16 angles remarquables, quel que soit `θ` — y compris `θ=0`).
 */
export interface ExerciceRacinesC {
  famille: "C";
  n: number;
  r: number;
  angle: AngleRemarquable;
  /** Les n racines n-ièmes de l'unité ζ_k=cos(2kπ/n)+isin(2kπ/n), k=0,...,n-1 (module 1 — `re`/`im`
   * construits via `combinerModuleAngle(1, ...)`). */
  zetas: RacineExacte[];
  /** Les n solutions z_k=w·ζ_k, k=0,...,n-1 (même ordre que `zetas`). */
  racines: RacineExacte[];
}

export type ExerciceRacinesNiemes = ExerciceRacinesA | ExerciceRacinesB | ExerciceRacinesC;
export type FamilleRacinesNiemes = ExerciceRacinesNiemes["famille"];
