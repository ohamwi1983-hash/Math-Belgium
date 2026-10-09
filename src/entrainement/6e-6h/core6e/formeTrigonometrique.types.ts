import type { ValeurExacte } from "./cyclometrique.types";

/**
 * Couche core (6e) — contrat pour `6gen37` ("Forme trigonométrique, module, argument et
 * opérations", chapitre 7 "Nombres complexes", DEUXIÈME générateur de ce chapitre après `6gen34`).
 * 5 familles (A à E), tirage ÉQUIPROBABLE de la famille — voir
 * `generateurs6e/formeTrigonometrique/index.ts`.
 *
 * `ValeurExacte` ({latex, numerique}) réutilisé TEL QUEL depuis `core6e/cyclometrique.types.ts`
 * (chapitre 1, 6gen2/6gen3) — pur type de données sans logique, déjà la représentation standard
 * de la plateforme pour "une valeur mathématique exacte + son latex" ; jamais redéclaré ici.
 *
 * ============================================================================
 * **`AngleRemarquable` — représentation EXACTE d'un angle multiple rationnel de π**
 * ============================================================================
 * `p`/`q` : angle = (p/q)·π, `q>0`, `gcd(|p|,q)=1` (ou `p=0,q=1` pour l'angle nul) — représentation
 * EN FRACTION EXACTE (jamais seulement le flottant `numerique`), ce qui permet toute l'arithmétique
 * de ce générateur (somme/différence/multiple d'angles, résolution de congruence en `n`, famille D)
 * SANS AUCUNE erreur d'arrondi flottant : `generateurs6e/formeTrigonometrique/angles.ts` manipule
 * `p,q` en entiers exacts de bout en bout, `numerique`/`latex` n'étant dérivés qu'à la toute fin
 * pour l'affichage/la vérification numérique. Valeur PRINCIPALE : toujours réduite à l'intervalle
 * `(-π;π]` (jamais `[0;2π[`, à la différence de `BANQUE_16_POINTS` du chapitre 1 — voir en-tête
 * `generateurs6e/formeTrigonometrique/familleA.ts` pour la justification de ce choix).
 */
export interface AngleRemarquable {
  p: number;
  q: number;
  latex: string;
  numerique: number;
}

/** Un facteur complexe "propre" (module simple + argument remarquable) — la brique de base
 * réutilisée par les familles A/B/C/D (voir `familleA.ts`, `tirerZAvecAngleRemarquable`). `r`
 * toujours un entier positif simple (1 à 4) dans ce générateur — voir en-tête `familleA.ts` pour la
 * justification de cette restriction (évite tout radical composé du type √6 dans `a`/`b`). */
export interface FacteurComplexe {
  r: number;
  angle: AngleRemarquable;
  a: ValeurExacte;
  b: ValeurExacte;
}

// ============================================================================
// Famille A — Forme trigonométrique/exponentielle depuis a+bi (2 écrans).
// ============================================================================

export interface ExerciceFormeTrigA {
  famille: "A";
  r: number;
  angle: AngleRemarquable;
  a: ValeurExacte;
  b: ValeurExacte;
}

// ============================================================================
// Famille B — Module et argument via les propriétés (2 écrans, 3 sous-types).
// ============================================================================

export interface ExerciceFormeTrigB_ProduitQuotient {
  famille: "B";
  sousType: "produit" | "quotient";
  z1: FacteurComplexe;
  z2: FacteurComplexe;
  /** produit : r1·r2 — quotient : r1/r2 (peut être non entier). */
  rResultat: number;
  /** produit : angle1+angle2 réduit — quotient : angle1−angle2 réduit. */
  angleResultat: AngleRemarquable;
}

export interface ExerciceFormeTrigB_Puissance {
  famille: "B";
  sousType: "puissance";
  z: FacteurComplexe;
  n: number;
  rResultat: number;
  angleResultat: AngleRemarquable;
}

export type ExerciceFormeTrigB = ExerciceFormeTrigB_ProduitQuotient | ExerciceFormeTrigB_Puissance;

// ============================================================================
// Famille C — Puissance via De Moivre, jusqu'à la forme a+bi (3 écrans).
// ============================================================================

/**
 * `a`/`b` (départ) ET `aFinal`/`bFinal` (résultat) sont des ENTIERS EXACTS (construction "entier de
 * Gauss", voir en-tête `familleC.ts`) — SEULE façon de garantir une forme finale a+bi TYPABLE par
 * l'élève (`moteur6e/expressionComplexe.ts` n'a AUCUNE fonction `sqrt`, voir son en-tête — un
 * résultat final irrationnel comme "1+√3i" serait structurellement impossible à saisir).
 */
export interface ExerciceFormeTrigC {
  famille: "C";
  a: number;
  b: number;
  r: number;
  angle: AngleRemarquable;
  n: number;
  rFinal: number;
  angleFinal: AngleRemarquable;
  aFinal: number;
  bFinal: number;
}

// ============================================================================
// Famille D — Trouver n selon une condition sur l'argument (3 écrans).
// ============================================================================

export type ConditionD = "reelPositif" | "reelNegatif" | "imaginairePurPositif" | "imaginairePurNegatif";

/** Ensemble solution n≡k (mod m), 0≤k<m, m>0 — voir `familleD.ts`, `resoudreCongruenceN` pour la
 * résolution EXACTE (arithmétique entière, aucun flottant) de `n·θ≡C (mod 2π)`. */
export interface CongruenceN {
  k: number;
  m: number;
}

export interface ExerciceFormeTrigD {
  famille: "D";
  z: FacteurComplexe;
  condition: ConditionD;
  congruence: CongruenceN;
}

// ============================================================================
// Famille E — Déduire des valeurs trigonométriques exactes (3 écrans).
// ============================================================================

export type OperationE = "produit" | "quotient";

/**
 * `alpha`/`beta` toujours tirés du "quart de famille" {π/4,3π/4,5π/4,7π/4} (voir en-tête
 * `familleE.ts`) — SEUL sous-ensemble d'angles remarquables distincts garantissant, pour LES DEUX
 * opérations (somme ET différence), un angle résultant de type AXE (0,π/2,π,3π/2 — cos/sin∈{0,±1})
 * — indispensable puisque `z1`/`z2` sont de module 1 fixe (aucun `r` disponible pour "absorber" un
 * √2/2 comme en famille C), donc tout résultat de type quart (cos/sin=±√2/2) serait, lui aussi,
 * structurellement impossible à taper en écran 2 (pas de fonction `sqrt` dans l'évaluateur complexe).
 */
export interface ExerciceFormeTrigE {
  famille: "E";
  operation: OperationE;
  alpha: AngleRemarquable;
  beta: AngleRemarquable;
  angleResultat: AngleRemarquable;
  aFinal: number;
  bFinal: number;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceFormeTrigonometrique = ExerciceFormeTrigA | ExerciceFormeTrigB | ExerciceFormeTrigC | ExerciceFormeTrigD | ExerciceFormeTrigE;

export type FamilleFormeTrigonometrique = ExerciceFormeTrigonometrique["famille"];
