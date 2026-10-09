import type { AngleRemarquable } from "./formeTrigonometrique.types";

/**
 * Couche core (6e) — contrat pour `6gen42` ("Nombres complexes : problèmes avancés", chapitre 7
 * "Nombres complexes", DERNIER (9e) générateur de ce chapitre, générateur de CLÔTURE — mirroir
 * 6gen29/6gen33 pour les chapitres 4/8). 5 familles (A à E), tirage ÉQUIPROBABLE de la famille —
 * voir `generateurs6e/complexesAvances/index.ts`. `AngleRemarquable` réutilisé TEL QUEL depuis
 * `core6e/formeTrigonometrique.types.ts` (6gen37) — même convention "argument principal dans
 * `(-π;π]`".
 *
 * ============================================================================
 * **`AffixeSimple` — un couple (a,b), PAS nécessairement entier** (contraste documenté avec
 * `AffixeEntiere` de `core6e/transformationsPlan.types.ts`, 6gen40)
 * ============================================================================
 * `moteur6e/expressionComplexe.ts` (fondation chapitre 7) n'a AUCUNE fonction `sqrt` — tout champ
 * "affixe a+bi" TAPÉ PAR L'ÉLÈVE doit donc rester un nombre RATIONNEL (jamais un radical), mais PAS
 * nécessairement un ENTIER : un quotient de 2 entiers de Gauss (famille E) ou un centre de cercle
 * d'Apollonius (famille B) restent rationnels tout en étant parfois fractionnaires (ex. `3/5+4i/5`)
 * — `AffixeSimple` autorise donc `a`/`b` fractionnaires, contrairement à `AffixeEntiere`. Un champ
 * réel simple (module, rayon, angle) est, lui, vérifié via `moteur6e/equivalenceExponentielle.ts`
 * (`diagnostiquerValeur`), qui supporte `sqrt`/`pi` nativement — voir en-tête
 * `moteur6e/verificationComplexesAvances.ts` pour le détail de cette distinction champ par champ.
 */
export interface AffixeSimple {
  a: number;
  b: number;
}

// ============================================================================
// Famille A — Condition sur (a,b) pour que (a+bi)ⁿ soit réel positif (3 écrans, tout QCM).
// ============================================================================

/**
 * Entièrement QCM (3 écrans à choix, jamais de saisie libre) — voir en-tête
 * `generateurs6e/complexesAvances/familleA.ts` pour la dérivation complète (piège central : `nθ≡0
 * (mod π)` — "réel" — confondu avec `nθ≡0 (mod 2π)` — "réel POSITIF"). `n` et `k` (seuil) sont
 * TOUTE la donnée nécessaire : la condition demandée est purement SYMBOLIQUE (sur `a,b`
 * quelconques), jamais évaluée sur un couple `(a,b)` numérique précis.
 */
export interface ExerciceComplexesA {
  famille: "A";
  n: 3 | 4;
  k: number;
}

// ============================================================================
// Famille B — Lieux géométriques (2-3 écrans, 6 sous-types dont 1 "intersection").
// ============================================================================

export type SousTypeLieuB = "droite" | "thales" | "apollonius" | "demiDroites" | "cercleO";

export type NatureLieu = "droite" | "cercle" | "demiDroite";

export interface ParamsLocusDroite {
  nature: "droite";
  point1: AffixeSimple;
  point2: AffixeSimple;
}
export interface ParamsLocusCercle {
  nature: "cercle";
  centre: AffixeSimple;
  rayon: number;
  /** LaTeX EXACT de `rayon` (fraction/radical simplifié — jamais un décimal, convention CLAUDE.md
   * "fraction irréductible") — voir `generateurs6e/complexesAvances/racineRationnelle.ts`. */
  rayonLatex: string;
}
export interface ParamsLocusDemiDroite {
  nature: "demiDroite";
  angles: AngleRemarquable[];
}
export type ParamsLocus = ParamsLocusDroite | ParamsLocusCercle | ParamsLocusDemiDroite;

/**
 * Les 5 sous-types NON "intersection" — 2 écrans (poser l'équation en x,y ; identifier nature +
 * paramètres). `poleExclu` non-null UNIQUEMENT pour `droite`/`thales` (piège transversal de la
 * spec : le pôle — point qui annule le dénominateur — doit être explicitement exclu du lieu final).
 */
export interface ExerciceComplexesBSimple {
  famille: "B";
  sousType: SousTypeLieuB;
  p1: AffixeSimple;
  p2: AffixeSimple;
  /** Apollonius (`k` du rapport `|z-p1|=k|z-p2|`, `k≠1`) OU cercleO (`k=rayon²`) — jamais les 2 en
   * même temps (subtypes mutuellement exclusifs). */
  k?: number;
  /** demiDroites uniquement (`c` de `z+z̄=c|z|`, valeur numérique). */
  c?: number;
  /** demiDroites uniquement — LaTeX EXACT de `c` (réutilise `combinerModuleAngle`, voir en-tête
   * `familleB.ts`) — jamais reconstruit depuis `c` (nombre flottant) côté affichage. */
  cLatex?: string;
  poleExclu: AffixeSimple | null;
  resultat: ParamsLocus;
}

/**
 * Sous-type "intersection" — TOUJOURS la combinaison FIXE droite ∩ cercle-centré-en-O (voir en-tête
 * `familleB.ts` pour la justification : construction "depuis la cible", 2 points d'intersection
 * choisis EN PREMIER). Le TYPE de chaque lieu est annoncé dans la consigne (pas un choix pédagogique
 * ici, contrairement aux 5 sous-types simples) — 3 écrans : poser les 2 équations, donner les 2
 * jeux de paramètres, donner les points d'intersection.
 */
export interface ExerciceComplexesBIntersection {
  famille: "B";
  sousType: "intersection";
  q1: AffixeSimple;
  q2: AffixeSimple;
  /** Rayon² du cercle centré en O passant par q1 ET q2 (= |q1|²= |q2|²). */
  kCercleO: number;
}

export type ExerciceComplexesB = ExerciceComplexesBSimple | ExerciceComplexesBIntersection;

// ============================================================================
// Famille C — Préservation du cercle unité par une similitude de Blaschke (3 écrans).
// ============================================================================

/**
 * `z'=(z-p)/(1-p̄z)`, `p=a+bi` (a,b petits entiers non nuls) — voir en-tête
 * `generateurs6e/complexesAvances/familleC.ts` pour la preuve complète (`|z-p|²=|1-p̄z|²` quand
 * `zz̄=1`, en utilisant UNIQUEMENT `zz̄=|z|²` et `z-z̄=2i·Im(z)`, jamais `z=x+yi`).
 */
export interface ExerciceComplexesC {
  famille: "C";
  a: number;
  b: number;
}

// ============================================================================
// Famille D — Équations avec paramètre(s) (2-4 écrans, 4 sous-types, 1 variante par sous-type).
// ============================================================================

/** "ratio racine n-ième" — `(z+c)ⁿ=k·zⁿ` avec `k=mⁿ` (m entier, angle 0 — toujours fermé), réutilise
 * la technique ζ_k de 6gen39 famille C (voir en-tête `familleD.ts`). 2 écrans. */
export interface ExerciceComplexesDRatio {
  famille: "D";
  sousType: "ratio";
  n: 3 | 4 | 6;
  m: number;
  c: number;
}

/** "solutions réelles imposées" — construit EN ARRIÈRE depuis 2 racines réelles cibles x1,x2 et un
 * m cible m0 (voir en-tête `familleD.ts`). 3 écrans. */
export interface ExerciceComplexesDReelles {
  famille: "D";
  sousType: "reelles";
  x1: number;
  x2: number;
  m0: number;
  k: number;
}

/** "coefficients depuis une racine donnée" — `z²+αz+β=0` (α,β réels inconnus), racine donnée
 * `z0=p+qi` (q≠0) — identité somme/produit classique (α=-2p, β=p²+q²). 2 écrans. */
export interface ExerciceComplexesDCoef {
  famille: "D";
  sousType: "coef";
  p: number;
  q: number;
}

/** "modules simultanés" — `|z|=|1/z|` (⟹|z|=1) PUIS `|z|=|z-d|` (perpendiculaire), `d` construit
 * depuis un triplet pythagoricien pour garder les 2 solutions RATIONNELLES (voir en-tête
 * `familleD.ts`). 2 écrans. */
export interface ExerciceComplexesDModules {
  famille: "D";
  sousType: "modules";
  p: number;
  q: number;
  r: number;
}

export type ExerciceComplexesD = ExerciceComplexesDRatio | ExerciceComplexesDReelles | ExerciceComplexesDCoef | ExerciceComplexesDModules;

// ============================================================================
// Famille E — Parallélisme/perpendicularité via l'argument d'un rapport (3 écrans).
// ============================================================================

export type StatutRelationE = "paralleles" | "perpendiculaires" | "aucun";

export interface ExerciceComplexesE {
  famille: "E";
  zA: AffixeSimple;
  zB: AffixeSimple;
  zC: AffixeSimple;
  zD: AffixeSimple;
  statut: StatutRelationE;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExerciceComplexesAvances = ExerciceComplexesA | ExerciceComplexesB | ExerciceComplexesC | ExerciceComplexesD | ExerciceComplexesE;

export type FamilleComplexesAvances = ExerciceComplexesAvances["famille"];
