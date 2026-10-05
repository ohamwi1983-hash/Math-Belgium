import type {
  ExerciceDeriveeA,
  ExerciceDeriveeB,
  ExerciceDeriveeC,
  ExerciceDeriveeD,
  ExerciceDeriveeE,
  ExerciceDeriveeF,
  ExerciceDeriveeG,
} from "../core6e/deriveesCyclometriques.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { arcfonctionBase, arcfonctionDeriveeBase } from "./derivationCyclometrique";
import { diagnostiquerEquivalenceFonction } from "./equivalenceCyclometrique";

/**
 * Couche B (6e) — vérification pour `6gen4` ("Dérivées de fonctions cyclométriques"). Chaque
 * écran est vérifié par ÉQUIVALENCE NUMÉRIQUE (échantillonnage) à une "reference closure"
 * `(x)=>number` construite ICI à partir des seuls coefficients de l'exercice — jamais depuis la
 * réponse (correcte ou non) d'un écran précédent, même convention que le reste de la plateforme
 * ("avec les valeurs CORRECTES des écrans 1-2", jamais celles saisies). Les points
 * d'échantillonnage (`exercice.pointsEchantillonnage`) sont réutilisés TELS QUELS depuis la
 * génération (Couche A) — jamais recalculés ici (`src/moteur6e/` n'importe jamais
 * `src/generateurs6e/`), ce qui impose de dupliquer les petites fonctions "argument" (u/v) déjà
 * présentes côté génération — même principe de duplication déjà établi ailleurs sur la plateforme
 * entre Couche A (recherche de domaine) et Couche B (formules de vérité).
 */
function statut(texte: string, reference: (x: number) => number, points: number[]): StatutVerification {
  return diagnostiquerEquivalenceFonction(texte, reference, points);
}

// ============================================================================
// Famille A — f(x) = c + k·arcfonction(u(x)).
// ============================================================================

function argumentUFamilleA(exercice: ExerciceDeriveeA, x: number): number {
  switch (exercice.uType) {
    case "affine":
      return exercice.a * x + exercice.b;
    case "puissance":
      return Math.pow(x, exercice.n);
    case "racine":
      return Math.sqrt(exercice.a * x);
    case "reciproque":
      return exercice.kPrime / x;
  }
}

function uPrimeFamilleA(exercice: ExerciceDeriveeA, x: number): number {
  switch (exercice.uType) {
    case "affine":
      return exercice.a;
    case "puissance":
      return exercice.n * Math.pow(x, exercice.n - 1);
    case "racine":
      return exercice.a / (2 * Math.sqrt(exercice.a * x));
    case "reciproque":
      return -exercice.kPrime / (x * x);
  }
}

export function diagnostiquerADeriveeU(exercice: ExerciceDeriveeA, texte: string): StatutVerification {
  return statut(texte, (x) => uPrimeFamilleA(exercice, x), exercice.pointsEchantillonnage);
}
export function verifierADeriveeU(exercice: ExerciceDeriveeA, texte: string): boolean {
  return diagnostiquerADeriveeU(exercice, texte) === "correct";
}

export function diagnostiquerADeriveeFinale(exercice: ExerciceDeriveeA, texte: string): StatutVerification {
  return statut(
    texte,
    (x) => exercice.k * arcfonctionDeriveeBase(exercice.arcfonction, argumentUFamilleA(exercice, x)) * uPrimeFamilleA(exercice, x),
    exercice.pointsEchantillonnage,
  );
}
export function verifierADeriveeFinale(exercice: ExerciceDeriveeA, texte: string): boolean {
  return diagnostiquerADeriveeFinale(exercice, texte) === "correct";
}

// ============================================================================
// Famille B — f(x) = u(x)·arcfonction(v(x)), u(x)=m·x.
// ============================================================================

function argumentVFamilleB(exercice: ExerciceDeriveeB, x: number): number {
  return exercice.vType === "simple" ? x : exercice.a * x * x + exercice.b;
}
function vPrimeFamilleB(exercice: ExerciceDeriveeB, x: number): number {
  return exercice.vType === "simple" ? 1 : 2 * exercice.a * x;
}
function deriveeArcfonctionVFamilleB(exercice: ExerciceDeriveeB, x: number): number {
  return arcfonctionDeriveeBase(exercice.arcfonction, argumentVFamilleB(exercice, x)) * vPrimeFamilleB(exercice, x);
}

export function diagnostiquerBDeriveeU(exercice: ExerciceDeriveeB, texte: string): StatutVerification {
  return statut(texte, () => exercice.m, exercice.pointsEchantillonnage);
}
export function verifierBDeriveeU(exercice: ExerciceDeriveeB, texte: string): boolean {
  return diagnostiquerBDeriveeU(exercice, texte) === "correct";
}

export function diagnostiquerBDeriveeArc(exercice: ExerciceDeriveeB, texte: string): StatutVerification {
  return statut(texte, (x) => deriveeArcfonctionVFamilleB(exercice, x), exercice.pointsEchantillonnage);
}
export function verifierBDeriveeArc(exercice: ExerciceDeriveeB, texte: string): boolean {
  return diagnostiquerBDeriveeArc(exercice, texte) === "correct";
}

export function diagnostiquerBDeriveeFinale(exercice: ExerciceDeriveeB, texte: string): StatutVerification {
  return statut(
    texte,
    (x) => exercice.m * arcfonctionBase(exercice.arcfonction, argumentVFamilleB(exercice, x)) + exercice.m * x * deriveeArcfonctionVFamilleB(exercice, x),
    exercice.pointsEchantillonnage,
  );
}
export function verifierBDeriveeFinale(exercice: ExerciceDeriveeB, texte: string): boolean {
  return diagnostiquerBDeriveeFinale(exercice, texte) === "correct";
}

// ============================================================================
// Famille C — f(x) = k·arcfonction(ax) / √(1-(ax)²).
// ============================================================================

function numerateurC(exercice: ExerciceDeriveeC, x: number): number {
  return exercice.k * arcfonctionBase(exercice.arcfonction, exercice.a * x);
}
function numerateurPrimeC(exercice: ExerciceDeriveeC, x: number): number {
  return exercice.k * arcfonctionDeriveeBase(exercice.arcfonction, exercice.a * x) * exercice.a;
}
function denominateurC(exercice: ExerciceDeriveeC, x: number): number {
  return Math.sqrt(1 - Math.pow(exercice.a * x, 2));
}
function denominateurPrimeC(exercice: ExerciceDeriveeC, x: number): number {
  return -(exercice.a * exercice.a * x) / denominateurC(exercice, x);
}

export function diagnostiquerCNumerateur(exercice: ExerciceDeriveeC, texte: string): StatutVerification {
  return statut(texte, (x) => numerateurPrimeC(exercice, x), exercice.pointsEchantillonnage);
}
export function verifierCNumerateur(exercice: ExerciceDeriveeC, texte: string): boolean {
  return diagnostiquerCNumerateur(exercice, texte) === "correct";
}

export function diagnostiquerCDenominateur(exercice: ExerciceDeriveeC, texte: string): StatutVerification {
  return statut(texte, (x) => denominateurPrimeC(exercice, x), exercice.pointsEchantillonnage);
}
export function verifierCDenominateur(exercice: ExerciceDeriveeC, texte: string): boolean {
  return diagnostiquerCDenominateur(exercice, texte) === "correct";
}

export function diagnostiquerCDeriveeFinale(exercice: ExerciceDeriveeC, texte: string): StatutVerification {
  return statut(
    texte,
    (x) => {
      const d = denominateurC(exercice, x);
      return (numerateurPrimeC(exercice, x) * d - numerateurC(exercice, x) * denominateurPrimeC(exercice, x)) / (d * d);
    },
    exercice.pointsEchantillonnage,
  );
}
export function verifierCDeriveeFinale(exercice: ExerciceDeriveeC, texte: string): boolean {
  return diagnostiquerCDeriveeFinale(exercice, texte) === "correct";
}

// ============================================================================
// Famille D — f(x) = arcsin(u)/arccos(u) ou l'inverse, u=ax+b.
// ============================================================================

function uFamilleD(exercice: ExerciceDeriveeD, x: number): number {
  return exercice.a * x + exercice.b;
}
/** Fonction "numérateur" — arcsin si orientation="sinSurCos", arccos sinon. */
function numerateurD(exercice: ExerciceDeriveeD, x: number): number {
  const arcfonction = exercice.orientation === "sinSurCos" ? "arcsin" : "arccos";
  return arcfonctionBase(arcfonction, uFamilleD(exercice, x));
}
function numerateurPrimeD(exercice: ExerciceDeriveeD, x: number): number {
  const arcfonction = exercice.orientation === "sinSurCos" ? "arcsin" : "arccos";
  return arcfonctionDeriveeBase(arcfonction, uFamilleD(exercice, x)) * exercice.a;
}
/** Fonction "dénominateur" — l'AUTRE arcfonction. */
function denominateurD(exercice: ExerciceDeriveeD, x: number): number {
  const arcfonction = exercice.orientation === "sinSurCos" ? "arccos" : "arcsin";
  return arcfonctionBase(arcfonction, uFamilleD(exercice, x));
}
function denominateurPrimeD(exercice: ExerciceDeriveeD, x: number): number {
  const arcfonction = exercice.orientation === "sinSurCos" ? "arccos" : "arcsin";
  return arcfonctionDeriveeBase(arcfonction, uFamilleD(exercice, x)) * exercice.a;
}
/** f'(x) — IDENTIQUE que ce soit écrit sous forme brute (quotient direct) ou simplifiée via
 * l'identité arcsin(u)+arccos(u)=π/2 : les deux sont la MÊME fonction, seulement deux formes
 * algébriques différentes du même dérivé — preuve dans la doc de tête du fichier de test. */
function deriveeD(exercice: ExerciceDeriveeD, x: number): number {
  const d = denominateurD(exercice, x);
  return (numerateurPrimeD(exercice, x) * d - numerateurD(exercice, x) * denominateurPrimeD(exercice, x)) / (d * d);
}

export function diagnostiquerDNumerateur(exercice: ExerciceDeriveeD, texte: string): StatutVerification {
  return statut(texte, (x) => numerateurPrimeD(exercice, x), exercice.pointsEchantillonnage);
}
export function verifierDNumerateur(exercice: ExerciceDeriveeD, texte: string): boolean {
  return diagnostiquerDNumerateur(exercice, texte) === "correct";
}

export function diagnostiquerDDenominateur(exercice: ExerciceDeriveeD, texte: string): StatutVerification {
  return statut(texte, (x) => denominateurPrimeD(exercice, x), exercice.pointsEchantillonnage);
}
export function verifierDDenominateur(exercice: ExerciceDeriveeD, texte: string): boolean {
  return diagnostiquerDDenominateur(exercice, texte) === "correct";
}

export function diagnostiquerDBrut(exercice: ExerciceDeriveeD, texte: string): StatutVerification {
  return statut(texte, (x) => deriveeD(exercice, x), exercice.pointsEchantillonnage);
}
export function verifierDBrut(exercice: ExerciceDeriveeD, texte: string): boolean {
  return diagnostiquerDBrut(exercice, texte) === "correct";
}

/**
 * Écran 4 — même fonction mathématique que l'écran 3 (voir `deriveeD`), donc la seule équivalence
 * numérique ne peut PAS, à elle seule, distinguer "réponse brute recopiée" de "identité
 * réellement appliquée" (les deux évaluent à la même valeur, à chaque point). Garde STRUCTURELLE
 * additionnelle, EN PLUS de l'équivalence numérique (jamais à sa place — même principe que
 * `estUnProduitAvecXExplicite`, exercice 1, 4e) : la forme simplifiée fait TOUJOURS apparaître
 * `π` littéralement (`π/2` survit à la simplification, cf. preuve algébrique de tête de fichier),
 * jamais la forme brute (un quotient de dérivées d'arcsin/arccos, sans aucune trace de π). Un
 * texte mathématiquement correct mais dépourvu de tout "pi" est donc rejeté (`not_equivalent`,
 * jamais `parse_error` — il A été lu, jugé structurellement non conforme).
 */
export function diagnostiquerDSimplifiee(exercice: ExerciceDeriveeD, texte: string): StatutVerification {
  const statutNumerique = statut(texte, (x) => deriveeD(exercice, x), exercice.pointsEchantillonnage);
  if (statutNumerique !== "correct") return statutNumerique;
  return /pi|π/i.test(texte) ? "correct" : "not_equivalent";
}
export function verifierDSimplifiee(exercice: ExerciceDeriveeD, texte: string): boolean {
  return diagnostiquerDSimplifiee(exercice, texte) === "correct";
}

// ============================================================================
// Famille E — f(x) = g(arcfonction(v(x))), v(x)=a·x, g∈{racine,carre}.
// ============================================================================

function wFamilleE(exercice: ExerciceDeriveeE, x: number): number {
  return arcfonctionBase(exercice.arcfonction, exercice.a * x);
}
function wPrimeFamilleE(exercice: ExerciceDeriveeE, x: number): number {
  return arcfonctionDeriveeBase(exercice.arcfonction, exercice.a * x) * exercice.a;
}

export function diagnostiquerEDeriveeInterne(exercice: ExerciceDeriveeE, texte: string): StatutVerification {
  return statut(texte, (x) => wPrimeFamilleE(exercice, x), exercice.pointsEchantillonnage);
}
export function verifierEDeriveeInterne(exercice: ExerciceDeriveeE, texte: string): boolean {
  return diagnostiquerEDeriveeInterne(exercice, texte) === "correct";
}

export function diagnostiquerEDeriveeFinale(exercice: ExerciceDeriveeE, texte: string): StatutVerification {
  return statut(
    texte,
    (x) => {
      const w = wFamilleE(exercice, x);
      const wPrime = wPrimeFamilleE(exercice, x);
      return exercice.gType === "carre" ? 2 * w * wPrime : wPrime / (2 * Math.sqrt(w));
    },
    exercice.pointsEchantillonnage,
  );
}
export function verifierEDeriveeFinale(exercice: ExerciceDeriveeE, texte: string): boolean {
  return diagnostiquerEDeriveeFinale(exercice, texte) === "correct";
}

// ============================================================================
// Famille F — f(x) = trig(arcfonction(v(x))), v(x)=a·x.
// ============================================================================

function uFamilleF(exercice: ExerciceDeriveeF, x: number): number {
  return arcfonctionBase(exercice.arcfonction, exercice.a * x);
}
function uPrimeFamilleF(exercice: ExerciceDeriveeF, x: number): number {
  return arcfonctionDeriveeBase(exercice.arcfonction, exercice.a * x) * exercice.a;
}
/** f'(x) — identique pour les 2 écrans (les 2 stratégies, "dériver puis simplifier" ou
 * "simplifier puis dériver", produisent la MÊME fonction — spec explicite). */
function deriveeF(exercice: ExerciceDeriveeF, x: number): number {
  const u = uFamilleF(exercice, x);
  const trigPrimeBase = exercice.trig === "sin" ? Math.cos(u) : -Math.sin(u);
  return trigPrimeBase * uPrimeFamilleF(exercice, x);
}

export function diagnostiquerFBrute(exercice: ExerciceDeriveeF, texte: string): StatutVerification {
  return statut(texte, (x) => deriveeF(exercice, x), exercice.pointsEchantillonnage);
}
export function verifierFBrute(exercice: ExerciceDeriveeF, texte: string): boolean {
  return diagnostiquerFBrute(exercice, texte) === "correct";
}

export function diagnostiquerFSimplifiee(exercice: ExerciceDeriveeF, texte: string): StatutVerification {
  return statut(texte, (x) => deriveeF(exercice, x), exercice.pointsEchantillonnage);
}
export function verifierFSimplifiee(exercice: ExerciceDeriveeF, texte: string): boolean {
  return diagnostiquerFSimplifiee(exercice, texte) === "correct";
}

// ============================================================================
// Famille G — sous-cas h : f(x)=k/arcfonction(v(x)), v=x²+c ; sous-cas i : f(x)=arcfonction(k/(x+c)).
// ============================================================================

export function diagnostiquerGDeriveeInterne(exercice: ExerciceDeriveeG, texte: string): StatutVerification {
  const reference =
    exercice.sousCas === "h" ? (x: number) => 2 * x : (x: number) => -exercice.k / Math.pow(x + exercice.c, 2);
  return statut(texte, reference, exercice.pointsEchantillonnage);
}
export function verifierGDeriveeInterne(exercice: ExerciceDeriveeG, texte: string): boolean {
  return diagnostiquerGDeriveeInterne(exercice, texte) === "correct";
}

export function diagnostiquerGDeriveeFinale(exercice: ExerciceDeriveeG, texte: string): StatutVerification {
  const reference =
    exercice.sousCas === "h"
      ? (x: number) => {
          const v = x * x + exercice.c;
          return (-exercice.k * 2 * x * arcfonctionDeriveeBase(exercice.arcfonction, v)) / Math.pow(arcfonctionBase(exercice.arcfonction, v), 2);
        }
      : (x: number) => {
          const u = exercice.k / (x + exercice.c);
          const uPrime = -exercice.k / Math.pow(x + exercice.c, 2);
          return arcfonctionDeriveeBase(exercice.arcfonction, u) * uPrime;
        };
  return statut(texte, reference, exercice.pointsEchantillonnage);
}
export function verifierGDeriveeFinale(exercice: ExerciceDeriveeG, texte: string): boolean {
  return diagnostiquerGDeriveeFinale(exercice, texte) === "correct";
}
