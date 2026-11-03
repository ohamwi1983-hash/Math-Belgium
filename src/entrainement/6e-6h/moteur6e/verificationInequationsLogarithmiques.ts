import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { Comparateur, ExerciceLogA, ExerciceLogB, ExerciceLogC, ExerciceLogD, ExerciceLogE, ExerciceLogF, ReponseCasBaseLog } from "../core6e/inequationsLogarithmiques.types";
import { diagnostiquerEquivalenceFonction, separerEquationTexte } from "./equivalenceExponentielle";
import { evaluerExpressionExponentielle } from "./expressionExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";

/**
 * Couche B (6e) — vérification pour `6gen15`. N'importe jamais rien de `src/generateurs6e/` — voir
 * `verificationInequationsLogarithmiques.test.ts` pour la preuve avec des exercices factices
 * définis localement.
 *
 * `verifierXxx` retourne un simple booléen (jamais un statut à 3 valeurs séparé exposé à
 * `etapeTentatives.ts`) — même convention déjà en place sur ce chantier (6gen6 à 6gen10) : un seul
 * message générique "Incorrect — tentative N/M" pour tout échec, `parse_error` compris.
 * `diagnostiquerXxx` reste exposé À CÔTÉ de chaque `verifierXxx` d'un champ texte libre (jamais à
 * la place — convention CLAUDE.md, statut à 3 valeurs).
 *
 * Réutilise DIRECTEMENT (moteur→moteur, déjà établi ailleurs sur ce chantier)
 * `diagnostiquerEquivalenceFonction`/`separerEquationTexte` (`equivalenceExponentielle.ts`,
 * chapitre 2) et `verifierEnsembleReelGuide` (`verificationEnsembleReel.ts`). Une base de
 * logarithme concrète se traduit TOUJOURS en changement de base `ln(x)/ln(base)` — l'évaluateur
 * partagé (`expressionExponentielle.ts`) n'a pas de fonction `log` native, voir CLAUDE.md.
 */
const TOLERANCE = 0.01;
const POINTS_X = [-4, -2, -1, -0.5, 0.5, 1, 2, 3, 5];
const POINTS_Y = [-4, -2, -1, -0.5, 0.5, 1, 2, 3, 5];

const NORMALISE_SYMBOLE: Record<string, Comparateur | undefined> = { "≤": "<=", "≥": ">=", "<=": "<=", ">=": ">=", "<": "<", ">": ">" };

// ============================================================================
// Famille A — 2 écrans.
// ============================================================================

export function verifierACE(exercice: ExerciceLogA, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.ceEcran1);
}

export function verifierAResoudre(exercice: ExerciceLogA, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran2);
}

// ============================================================================
// Famille B — 2 écrans.
// ============================================================================

export function verifierBCE(exercice: ExerciceLogB, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.ceEcran1);
}

export function verifierBResoudre(exercice: ExerciceLogB, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran2);
}

// ============================================================================
// Famille C — 3 écrans.
// ============================================================================

export function verifierCCE(exercice: ExerciceLogC, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.ceEcran1);
}

function referenceCombinaisonC(exercice: ExerciceLogC): (x: number) => number {
  const f = (x: number) => exercice.f.m * x + exercice.f.n;
  const g = (x: number) => exercice.g.m * x + exercice.g.n;
  return exercice.sousType === "produit" ? (x) => f(x) * g(x) : (x) => f(x) / g(x);
}

export function diagnostiquerCCombiner(exercice: ExerciceLogC, texte: string): StatutVerification {
  return diagnostiquerEquivalenceFonction(texte, referenceCombinaisonC(exercice), POINTS_X, TOLERANCE);
}

export function verifierCCombiner(exercice: ExerciceLogC, texte: string): boolean {
  return diagnostiquerCCombiner(exercice, texte) === "correct";
}

export function verifierCComparer(exercice: ExerciceLogC, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran3);
}

// ============================================================================
// Famille D — 4 écrans.
// ============================================================================

export function verifierDCE(exercice: ExerciceLogD, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.ceEcran1);
}

const INVERSE: Record<Comparateur, Comparateur> = { "<": ">", ">": "<", "<=": ">=", ">=": "<=" };

/**
 * `texte` attendu : une inéquation du second degré en `y` ÉQUIVALENTE à
 * `Ay^2+By+C [comparateur] 0` — le SYMBOLE compte (piège central des écrans "réécrire", même
 * convention que `diagnostiquerCkRegrouper`/`diagnostiquerERegrouper` de 6gen10).
 *
 * **Toute écriture équivalente acceptée** (audit 6e ch. 3, point 23) : la différence
 * « membre de gauche − membre de droite » doit valoir `λ·(Ay^2+By+C)` pour une constante `λ≠0`
 * (inéquation divisée par A, multipliée par −1, membres échangés...), avec le symbole d'origine si
 * `λ>0` et le symbole INVERSÉ si `λ<0` — jusqu'ici seule la forme exacte `Ay^2+By+C R 0` passait.
 */
export function diagnostiquerDReecrire(exercice: ExerciceLogD, texte: string): StatutVerification {
  const separe = separerEquationTexte(texte);
  if (separe === null) return "parse_error";
  const symbole = NORMALISE_SYMBOLE[separe.symbole];
  if (symbole === undefined) return "not_equivalent";
  const reference = (y: number) => exercice.A * y * y + exercice.B * y + exercice.C;
  const difference = `(${separe.gauche})-(${separe.droite})`;
  let lambda: number | null = null;
  for (const y of POINTS_Y) {
    let soumis: number;
    try {
      soumis = evaluerExpressionExponentielle(difference, { y });
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(soumis)) return "not_equivalent";
    const attendu = reference(y);
    if (Math.abs(attendu) < 1e-9) {
      if (Math.abs(soumis) > TOLERANCE) return "not_equivalent";
      continue;
    }
    const ratio = soumis / attendu;
    if (lambda === null) lambda = ratio;
    else if (Math.abs(ratio - lambda) > TOLERANCE * Math.max(1, Math.abs(lambda))) return "not_equivalent";
  }
  if (lambda === null || Math.abs(lambda) < 1e-9) return "not_equivalent";
  const symboleAttendu = lambda > 0 ? exercice.comparateur : INVERSE[exercice.comparateur];
  return symbole === symboleAttendu ? "correct" : "not_equivalent";
}

export function verifierDReecrire(exercice: ExerciceLogD, texte: string): boolean {
  return diagnostiquerDReecrire(exercice, texte) === "correct";
}

export function verifierDResoudreY(exercice: ExerciceLogD, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran3);
}

export function verifierDConvertirX(exercice: ExerciceLogD, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solutionEcran4);
}

// ============================================================================
// Famille E — reconnaître (CE satisfiable ou non), puis résoudre si elle l'est.
// ============================================================================

export function verifierEReconnaitre(exercice: ExerciceLogE, estImpossible: boolean): boolean {
  return estImpossible === !exercice.ceCompatible;
}

export function verifierEResoudre(exercice: ExerciceLogE, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.solution);
}

// ============================================================================
// Famille F — 3 écrans.
// ============================================================================

export function verifierFCE(exercice: ExerciceLogF, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.ceEcran1);
}

/** Vrai si `texte` est, au niveau le plus externe, le CARRÉ d'une expression : `(…)^2`, `(…)²` ou
 * `(…)*(…)` avec deux facteurs identiques. Garde structurelle (audit 6e ch. 3, point 24) : l'écran
 * demande de « reconnaître un carré parfait » — la forme développée `x^2-2rx+r^2`, équivalente
 * partout, ne teste pas cette reconnaissance (et c'était justement le contenu de l'aide 2). */
function estUnCarreAuTopNiveau(texte: string): boolean {
  const t = texte.replace(/\s+/g, "");
  const puissance = /^\((.+)\)(\^2|\*\*2|²)$/.exec(t);
  if (puissance) return parenthesesEquilibrees(puissance[1]);
  const produit = /^\((.+)\)\*?\((.+)\)$/.exec(t);
  return produit !== null && produit[1] === produit[2] && parenthesesEquilibrees(produit[1]);
}

function parenthesesEquilibrees(texte: string): boolean {
  let profondeur = 0;
  for (const c of texte) {
    if (c === "(") profondeur++;
    else if (c === ")" && --profondeur < 0) return false;
  }
  return profondeur === 0;
}

export function diagnostiquerFSimplifier(exercice: ExerciceLogF, texte: string): StatutVerification {
  const reference = (x: number) => (x - exercice.r) * (x - exercice.r);
  const statut = diagnostiquerEquivalenceFonction(texte, reference, POINTS_X, TOLERANCE);
  if (statut !== "correct") return statut;
  return estUnCarreAuTopNiveau(texte) ? "correct" : "not_equivalent";
}

export function verifierFSimplifier(exercice: ExerciceLogF, texte: string): boolean {
  return diagnostiquerFSimplifier(exercice, texte) === "correct";
}

export interface ReponseFConclure {
  casSuperieur: ReponseCasBaseLog;
  casInferieur: ReponseCasBaseLog;
}

function verifierCasBaseLog(reponse: ReponseCasBaseLog, attenduVide: boolean, ensembleAttendu: EnsembleReelGuide): boolean {
  if (attenduVide) return reponse.estVide === true;
  if (reponse.estVide || reponse.ensemble === null) return false;
  return verifierEnsembleReelGuide(reponse.ensemble, ensembleAttendu);
}

/** Verdict CAS PAR CAS — permet à l'écran de ne marquer en rouge que le cas réellement faux. */
export function diagnostiquerFConclureParCas(exercice: ExerciceLogF, reponse: ReponseFConclure): { superieur: boolean; inferieur: boolean } {
  const superieurVide = exercice.casVideEstSuperieurA1;
  return {
    superieur: verifierCasBaseLog(reponse.casSuperieur, superieurVide, exercice.ensembleSansR),
    inferieur: verifierCasBaseLog(reponse.casInferieur, !superieurVide, exercice.ensembleSansR),
  };
}

export function verifierFConclure(exercice: ExerciceLogF, reponse: ReponseFConclure): boolean {
  const { superieur, inferieur } = diagnostiquerFConclureParCas(exercice, reponse);
  return superieur && inferieur;
}
