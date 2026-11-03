import type { ExerciceHyperboliquesA, ExerciceHyperboliquesB, ExerciceHyperboliquesC, ExerciceHyperboliquesD, SigneLimiteHyperbolique, StatutPariteHyperbolique } from "../core6e/hyperboliques.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEnsembleValeurs, diagnostiquerEquivalenceFonction } from "./equivalenceExponentielle";

/**
 * Couche B (6e) — vérification pour `6gen19`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationHyperboliques.test.ts` pour la preuve avec des exercices factices définis
 * localement. Vérification par ÉCHANTILLONNAGE NUMÉRIQUE pour les familles C/D (`diagnostiquer-
 * EquivalenceFonction`, `moteur6e/equivalenceExponentielle.ts`, partagé avec les chapitres 2/3 —
 * "Algebrite/mathjs" des specs source désigne cette même convention, voir CLAUDE.md).
 *
 * **2 échelles de tolérance, JAMAIS confondues** (CLAUDE.md, "Annonce de précision = tolérance
 * réellement vérifiée = ni plus stricte, ni plus large qu'annoncée") :
 * - `TOLERANCE_ALGEBRIQUE` (0.01) — équivalence par échantillonnage numérique (familles C/D,
 *   dérivées/réécriture/limites), même valeur que le reste du chantier.
 * - `TOLERANCE_EXACTE` (1e-6) — famille B UNIQUEMENT. Les valeurs attendues (√(1+k²), ±√(k²−1))
 *   sont des identités EXACTES pour un `k` déjà CONNU au moment de la génération, jamais une
 *   simple approximation par échantillonnage — "vérification symbolique/exacte" de la spec source
 *   se traduit ici par une comparaison numérique à une cible précalculée via `Math.sqrt`,
 *   tolérance resserrée pour ne jamais masquer une erreur de signe/radicande par un arrondi trop
 *   généreux (une tolérance à 0.01 laisserait passer, par exemple, `2.24` pour `√5≈2.236`, ce qui
 *   est correct, mais aussi masquerait une erreur de radicande d'ampleur comparable).
 *
 * **Famille B — un seul écran, valeur(s) EXACTE(S)** : l'ancien couple "isoler"/"valeurs"
 * faisait doublon (la même saisie `sqrt(...)` validait les deux écrans). Désormais un seul écran,
 * add-as-needed (1 ou 2 valeurs) : quand le signe de x0 n'est pas précisé, les DEUX valeurs
 * ±√(k²−1) sont exigées (piège central : sh peut être positive ou négative). Tolérance exacte
 * (`TOLERANCE_EXACTE`) — une valeur approchée au centième est détectée séparément
 * (`estApproximationB`) pour afficher « donne la valeur exacte » plutôt qu'un simple « faux ».
 */

const TOLERANCE_ALGEBRIQUE = 0.01;
const TOLERANCE_EXACTE = 1e-6;
const POINTS_GENERIQUES = [-1.3, -0.6, 0.6, 1.3];

function equivalent(texte: string, reference: (x: number) => number, points: number[] = POINTS_GENERIQUES): StatutVerification {
  return diagnostiquerEquivalenceFonction(texte, reference, points, TOLERANCE_ALGEBRIQUE);
}

// ============================================================================
// Famille A — parité, DÉDUITE DIRECTEMENT du type tiré (fait mathématique fixe par type, connu dès
// la génération — jamais un échantillonnage — même principe que `issueAttendueG` dans
// `verificationEquationsExpLog.ts`, 6gen14). Ce n'est pas un champ de texte libre (3 boutons,
// jamais de parsing), donc pas de `StatutVerification`/`parse_error` ici, juste un booléen — même
// convention que `verifierGEcran2`.
// ============================================================================

const PARITE_PAR_TYPE: Record<ExerciceHyperboliquesA["type"], StatutPariteHyperbolique> = {
  shKx: "impaire",
  chKx: "paire",
  shChProduit: "impaire",
  shCarre: "paire", // piège central : le carré d'une fonction impaire est toujours pair
  chCarre: "paire",
  shPlusCh: "aucune",
  shMoinsCh: "aucune",
  shPlusConstante: "aucune", // piège : sh est impaire, mais sh(x)+c (c≠0) ne l'est plus
  xSh: "paire", // produit de deux fonctions impaires
  xCh: "impaire", // impaire × paire
  shCube: "impaire",
};

export function pariteAttendueA(exercice: ExerciceHyperboliquesA): StatutPariteHyperbolique {
  return PARITE_PAR_TYPE[exercice.type];
}
export function verifierAParite(exercice: ExerciceHyperboliquesA, choix: StatutPariteHyperbolique): boolean {
  return choix === pariteAttendueA(exercice);
}

// ============================================================================
// Famille B — ch²(x0)−sh²(x0)=1. x0 reste caché ; seul `k` (=sh(x0) ou ch(x0)) est connu.
// ============================================================================

function cibleTrouverCh(exercice: { k: number }): number {
  return Math.sqrt(1 + exercice.k * exercice.k);
}
function racineTrouverSh(exercice: { k: number }): number {
  return Math.sqrt(exercice.k * exercice.k - 1);
}

function valeursAttenduesB(exercice: ExerciceHyperboliquesB): number[] {
  if (exercice.sousType === "trouverCh") return [cibleTrouverCh(exercice)];
  const racine = racineTrouverSh(exercice);
  if (exercice.signeX0 !== null) return [exercice.signeX0 * racine];
  return [racine, -racine];
}

export function valeursExactesB(exercice: ExerciceHyperboliquesB): number[] {
  return valeursAttenduesB(exercice);
}

export function diagnostiquerBValeurs(exercice: ExerciceHyperboliquesB, textes: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(textes, valeursAttenduesB(exercice), TOLERANCE_EXACTE);
}

/** Vrai si la saisie est juste à un ARRONDI au centième près (ex. « 2,24 » pour √5) sans être la
 * valeur exacte — sert seulement à choisir le message d'erreur, jamais à accepter la réponse. */
export function estApproximationB(exercice: ExerciceHyperboliquesB, textes: string[]): boolean {
  return diagnostiquerBValeurs(exercice, textes) === "not_equivalent" && diagnostiquerEnsembleValeurs(textes, valeursAttenduesB(exercice), 0.0051) === "correct";
}
export function verifierBValeurs(exercice: ExerciceHyperboliquesB, textes: string[]): boolean {
  return diagnostiquerBValeurs(exercice, textes) === "correct";
}

// ============================================================================
// Famille C — f(x) = a·sh(kx) + b·ch(kx). f'(x)=k[a·ch(kx)+b·sh(kx)], f''(x)=k²·f(x).
// ============================================================================

function referenceCDerivee(exercice: ExerciceHyperboliquesC): (x: number) => number {
  const { a, b, k } = exercice;
  return (x) => k * (a * Math.cosh(k * x) + b * Math.sinh(k * x));
}
function referenceCDeriveeSeconde(exercice: ExerciceHyperboliquesC): (x: number) => number {
  const { a, b, k } = exercice;
  return (x) => k * k * (a * Math.sinh(k * x) + b * Math.cosh(k * x));
}

export function diagnostiquerCDerivee(exercice: ExerciceHyperboliquesC, texte: string): StatutVerification {
  return equivalent(texte, referenceCDerivee(exercice));
}
export function verifierCDerivee(exercice: ExerciceHyperboliquesC, texte: string): boolean {
  return diagnostiquerCDerivee(exercice, texte) === "correct";
}

export function diagnostiquerCDeriveeSeconde(exercice: ExerciceHyperboliquesC, texte: string): StatutVerification {
  return equivalent(texte, referenceCDeriveeSeconde(exercice));
}
export function verifierCDeriveeSeconde(exercice: ExerciceHyperboliquesC, texte: string): boolean {
  return diagnostiquerCDeriveeSeconde(exercice, texte) === "correct";
}

// ============================================================================
// Famille D — f(x) = a·sh(x) + b·ch(x) = [(a+b)e^x + (b−a)e^(−x)]/2.
// ============================================================================

function referenceD(exercice: ExerciceHyperboliquesD): (x: number) => number {
  const { a, b } = exercice;
  return (x) => a * Math.sinh(x) + b * Math.cosh(x);
}

/** Garde structurelle écran "réécriture" : la forme attendue s'exprime en e^x/e^(−x), jamais en
 * sh(...)/ch(...) — une recopie littérale de f(x) (numériquement toujours équivalente) ne teste
 * pas la reconnaissance visée par cet écran (même esprit que les gardes structurelles de 6gen16
 * famille E/G, `verificationDomaineDeriveeLogarithme.ts`). */
function contientShOuCh(texte: string): boolean {
  return /\b(sh|ch|sinh|cosh)\s*\(/i.test(texte);
}

export function diagnostiquerDReecriture(exercice: ExerciceHyperboliquesD, texte: string): StatutVerification {
  const statut = equivalent(texte, referenceD(exercice));
  if (statut !== "correct") return statut;
  return contientShOuCh(texte) ? "not_equivalent" : "correct";
}
export function verifierDReecriture(exercice: ExerciceHyperboliquesD, texte: string): boolean {
  return diagnostiquerDReecriture(exercice, texte) === "correct";
}

export interface ReponseLimitesD {
  plusInfini: SigneLimiteHyperbolique;
  moinsInfini: SigneLimiteHyperbolique;
}

/** Signe de la limite en +∞ — porté par (a+b), garanti non nul par la génération (voir
 * `core6e/hyperboliques.types.ts`). */
export function signeLimitePlusInfiniD(exercice: ExerciceHyperboliquesD): SigneLimiteHyperbolique {
  return exercice.a + exercice.b > 0 ? "plus_infini" : "moins_infini";
}
/** Signe de la limite en −∞ — porté par (b−a), garanti non nul par la génération. */
export function signeLimiteMoinsInfiniD(exercice: ExerciceHyperboliquesD): SigneLimiteHyperbolique {
  return exercice.b - exercice.a > 0 ? "plus_infini" : "moins_infini";
}
export function verifierDLimites(exercice: ExerciceHyperboliquesD, reponse: ReponseLimitesD): boolean {
  return reponse.plusInfini === signeLimitePlusInfiniD(exercice) && reponse.moinsInfini === signeLimiteMoinsInfiniD(exercice);
}
