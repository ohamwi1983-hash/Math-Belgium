/**
 * Couche core (6e) — contrat pour `6gen18` ("Déterminer des paramètres depuis des conditions
 * graphiques", chapitre 3 — "Fonctions logarithmes"). 3 familles STRUCTURELLEMENT DISJOINTES
 * (union discriminée par `famille`, jamais un seul type à champs `| null` partagés — même principe
 * que `exponentiellesProblemes.types.ts`, 6gen12), tirées de façon ÉQUIPROBABLE (voir
 * `generateurs6e/determinerParametresLogarithme/index.ts`).
 *
 * Contrairement aux générateurs précédents du chapitre, il ne s'agit jamais de calculer une
 * propriété depuis une expression DONNÉE mais de RECONSTRUIRE des coefficients depuis des
 * conditions IMPOSÉES (asymptotes, points de passage, extremum) — plusieurs écrans posent donc une
 * ÉQUATION ou une RELATION/INÉQUATION entre 2 ou 3 PARAMÈTRES LIBRES à la fois (m,n / p,q,r), jamais
 * une simple valeur numérique en x — voir `moteur6e/verificationDeterminerParametresLogarithme.ts`
 * pour la vérification (échantillonnage multi-variable, généralisation du patron `6gen13`).
 *
 * **Famille A** — f(x)=ln(mx+n), asymptote verticale en x=x0 + une 2e condition (sous-type tiré).
 * `m`,`n` sont ici la solution EXACTE du système (calculée à la génération, jamais figée en dur) —
 * `m` peut être irrationnel (sous-type "point", division par ln(k1)), comparé par tolérance comme
 * partout ailleurs sur la plateforme (ex. m/n de `6gen13`).
 *
 * **Famille B** — f(x)=ln(px²+qx+r), 2 racines r1<r2 (asymptotes verticales) + 1 point de passage.
 * `p` est la solution EXACTE (généralement irrationnelle, `ln(k1)` au numérateur) ; `q`,`r`
 * DÉCOULENT algébriquement de `p` (`q=-p·(r1+r2)`, `r=p·r1·r2`) — jamais tirés indépendamment.
 *
 * **Famille C** — f(x)=ln(px²+qx+r), CONDITIONS (pas de valeurs numériques de p/q/r : l'exercice
 * porte entièrement sur des RELATIONS PARAMÉTRIQUES en p/q/r/x0) pour un extremum local en x=x0.
 * Aucun coefficient concret n'est généré — seuls `x0` et le type d'extremum voulu pilotent les 3
 * conditions attendues (signe de p, relation sur q, inéquation sur r).
 */

export type SousTypeFamilleA = "ordonnee" | "point";
export type TypeExtremum = "maximum" | "minimum";

interface ExerciceDetermParamABase {
  famille: "A";
  x0: number;
  /** Solution exacte du système à 2 équations (m,n) — réponse de l'écran 2, jamais recalculée
   * depuis une saisie élève. */
  m: number;
  n: number;
}

/** Sous-type "ordonnée à l'origine" — 2e condition : n=k (convention retenue, voir en-tête de
 * `generateurs6e/determinerParametresLogarithme/familleA.ts` pour la justification de cette
 * traduction littérale de la spec). */
export interface ExerciceDetermParamA_Ordonnee extends ExerciceDetermParamABase {
  sousType: "ordonnee";
  k: number;
}

/** Sous-type "point de passage" (x1, ln(k1)), x1≠x0 — 2e condition : m·x1+n=ln(k1). */
export interface ExerciceDetermParamA_Point extends ExerciceDetermParamABase {
  sousType: "point";
  x1: number;
  k1: number;
}

export type ExerciceDetermParamA = ExerciceDetermParamA_Ordonnee | ExerciceDetermParamA_Point;

export interface ExerciceDetermParamB {
  famille: "B";
  /** r1<r2 par construction (jamais égaux, jamais dans l'autre ordre) — 2 asymptotes verticales. */
  r1: number;
  r2: number;
  /** Strictement entre r1 et r2 (cohérent avec le domaine — spec explicite). */
  x1: number;
  k1: number;
  /** Solution exacte (souvent irrationnelle, `ln(k1)` au numérateur) — réponse de l'écran 2. */
  p: number;
  /** -p·(r1+r2) — réponse (composante) de l'écran 3, jamais retirée indépendamment de `p`. */
  q: number;
  /** p·r1·r2 — réponse (composante) de l'écran 3. */
  r: number;
}

export interface ExerciceDetermParamC {
  famille: "C";
  x0: number;
  typeExtremum: TypeExtremum;
}

export type ExerciceDeterminerParametresLogarithme = ExerciceDetermParamA | ExerciceDetermParamB | ExerciceDetermParamC;

export type FamilleDeterminerParametresLogarithme = ExerciceDeterminerParametresLogarithme["famille"];

export type GenerateurExerciceDeterminerParametresLogarithme = () => ExerciceDeterminerParametresLogarithme;
