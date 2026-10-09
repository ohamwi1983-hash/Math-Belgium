import type { ExerciceExtA, ExerciceExtB, ExerciceExtC, ExerciceExtD, ExerciceExtE, ExerciceExtF, ExerciceExtensionsBinomialeNormaleBayes } from "../core6e/extensionsBinomialeNormaleBayes.types";
import type { ExerciceLoiBinomialeB, ExerciceLoiBinomialeC } from "../core6e/loiBinomiale.types";
import { diagnostiquerValeur } from "./equivalenceExponentielle";
import { diagnostiquerBEcran as diagnostiquerLoiBinomialeBEcran, diagnostiquerCEcran1 as diagnostiquerLoiBinomialeCEcran1, diagnostiquerCEcran2 as diagnostiquerLoiBinomialeCEcran2, diagnostiquerCEcran3 as diagnostiquerLoiBinomialeCEcran3 } from "./verificationLoiBinomiale";
import type { PhaseLoiBinomiale } from "./typesLoiBinomiale";
import { diagnostiquerDEcran1, diagnostiquerDEcran2, diagnostiquerDEcran3 } from "./verificationLoiNormale";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseExtensionsBinomialeNormaleBayes } from "./typesExtensionsBinomialeNormaleBayes";

/**
 * Couche B (6e) — vérification propre à `6gen52` (dispatch par famille/phase). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/extensionsBinomialeNormaleBayes/session.integration.test.ts` pour le seul fichier
 * autorisé Couche A + Couche B ensemble.
 *
 * ============================================================================
 * **RÉUTILISATION Couche B ↔ Couche B (générateurs DIFFÉRENTS du même chantier — libre, CLAUDE.md :
 * "Couche A ↔ Couche A et Couche B ↔ Couche B libres")** — lire avant de modifier ce fichier
 * ============================================================================
 * - **Famille A, écrans "trouver n"** : `diagnostiquerCEcran1`/`2`/`3` de
 *   `moteur6e/verificationLoiBinomiale.ts` (`6gen50` famille C) importées DIRECTEMENT (renommées ici
 *   `diagnostiquerLoiBinomialeCEcran1/2/3`) — le piège du sens de l'inégalité (poser `>`, isoler
 *   `<`, sens inversé) N'EST PAS réimplémenté, un petit adaptateur (`versExerciceLoiBinomialeC`)
 *   construit juste l'objet `ExerciceLoiBinomialeC` attendu par ces fonctions à partir des champs
 *   déjà présents sur `ExerciceExtA` (`p`/`seuil`/`valeurN`, ce dernier PRÉ-CALCULÉ Couche A via
 *   `calculerNMinimalC`, `6gen50`, importé directement par `generateurs6e/
 *   extensionsBinomialeNormaleBayes/familleA.ts`).
 * - **Famille B** : `diagnostiquerBEcran` de `moteur6e/verificationLoiBinomiale.ts` (le dispatcher
 *   PAR PHASE de `6gen50`, seul export de famille B de ce fichier — `diagnostiquerBEcran1`/`2`/`3`
 *   n'y sont pas exportées individuellement) importée DIRECTEMENT — la vérification "stratégie+termes
 *   / valeurs des termes / résultat final" n'est PAS réimplémentée. Les phases `PhaseExtensions
 *   BinomialeNormaleBayes` de CE générateur (`bTermeUniqueEcran1/2`, `bSommeEcran1/2/3`,
 *   `bComplementEcran1/2/3`) partagent EXACTEMENT les mêmes chaînes que le sous-ensemble pertinent de
 *   `PhaseLoiBinomiale` (`6gen50`) — un cast (jamais une réécriture de `phase`) suffit donc à
 *   satisfaire la signature réutilisée ; la phase `bEsperance` de `6gen50` (seule autre valeur du
 *   type source) n'est JAMAIS produite ici (aucun écran d'espérance dans ce générateur, spec "2-3
 *   écrans" sans extension), donc jamais atteinte au runtime. Un adaptateur
 *   (`versExerciceLoiBinomialeB`) ajoute juste le champ `esperance=n·p` (présent dans le contrat
 *   `ExerciceLoiBinomialeB` mais absent, volontairement, du contrat `ExerciceExtB`).
 * - **Famille C** : `diagnostiquerDEcran1`/`2`/`3` de `moteur6e/verificationLoiNormale.ts` (`6gen51`
 *   famille D) importées DIRECTEMENT, appliquées à `exercice.base` (l'`ExerciceLoiNormaleD` complet
 *   généré par `6gen51`, embarqué tel quel par `generateurs6e/extensionsBinomialeNormaleBayes/
 *   familleC.ts`). Ces 3 fonctions ont besoin de valeurs de référence dérivées de `Phi`/`PhiInverse`
 *   (Couche A `generateurs6e/loiNormale/`) — MÊME PONT que `6gen51` lui-même (`ui6e/
 *   formatLoiNormale.ts::calculerReferenceLoiNormale`, "la couche ui dépend librement des couches
 *   inférieures", CLAUDE.md) : ici, `ui6e/formatExtensionsBinomialeNormaleBayes.ts::
 *   calculerReferenceExtensionsBinomialeNormaleBayes` calcule ces valeurs et les passe en paramètre
 *   `ref` à `diagnostiquerEcran` ci-dessous — CE fichier (Couche B) ne calcule JAMAIS `Phi`/
 *   `PhiInverse` lui-même.
 *
 * **Famille D** — EXTENSION (pas un import) de la philosophie `6gen32` famille C (Bayes à 2
 * catégories → 3 catégories) : voir en-tête `generateurs6e/extensionsBinomialeNormaleBayes/
 * familleD.ts` pour la justification complète de pourquoi un import direct est impossible ici.
 * **Famille E** — nouveauté, aucune réutilisation. **Famille F** — raisonnement (pas code) de
 * `6gen32` famille B (déduire par différence) et `6gen49` famille B (construire une loi + E(X)),
 * réimplémentés ici avec la forme de données propre à `6gen52` (voir en-tête `familleF.ts`).
 */

const TOLERANCE = 0.01;
const TOLERANCE_TOTAL_ATTENDU = 1;

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerValeurs(valeurs: string[], attendues: number[]): StatutVerification {
  if (valeurs.length !== attendues.length) return "not_equivalent";
  return combinerStatuts(...attendues.map((v, i) => diagnostiquerValeur(valeurs[i] ?? "", v, TOLERANCE)));
}

/** Effectif/total estimé — arrondi à l'entier le plus proche, tolérance ±1 (mirroir
 * `diagnostiquerEffectif`, `moteur6e/verificationLoiNormale.ts`, dupliqué ici — duplication assumée,
 * CLAUDE.md "pas de moteur de session unifié"). */
function diagnostiquerTotalAttendu(texte: string, referenceReelle: number): StatutVerification {
  return diagnostiquerValeur(texte, Math.round(referenceReelle), TOLERANCE_TOTAL_ATTENDU + 1e-9);
}

// ============================================================================
// Famille A — Indépendance composée + trouver n via logarithme.
// ============================================================================

/** Adaptateur — construit l'objet `ExerciceLoiBinomialeC` (`6gen50`) attendu par les fonctions
 * réutilisées, à partir des champs déjà présents sur `ExerciceExtA` (voir en-tête de fichier). */
function versExerciceLoiBinomialeC(e: ExerciceExtA): ExerciceLoiBinomialeC {
  return { famille: "C", contexte: { id: "extBnb", texte: e.contexteTexte }, p: e.p, seuil: e.seuil, valeurN: e.valeurN };
}

export function diagnostiquerAEcranP(e: ExerciceExtA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [(e.p1 as number) * (e.p2 as number)]);
}

export function diagnostiquerAEcranAucunAuMoins(e: ExerciceExtA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [1 - e.p, e.p]);
}

export function diagnostiquerAEcranTrouverN1(e: ExerciceExtA, valeurs: string[]): StatutVerification {
  const exC = versExerciceLoiBinomialeC(e);
  return combinerStatuts(diagnostiquerLoiBinomialeCEcran1(exC, valeurs[0] ?? ""), diagnostiquerLoiBinomialeCEcran2(exC, valeurs[1] ?? ""));
}

export function diagnostiquerAEcranTrouverN2(e: ExerciceExtA, valeurs: string[]): StatutVerification {
  return diagnostiquerLoiBinomialeCEcran3(versExerciceLoiBinomialeC(e), valeurs[0] ?? "");
}

export function diagnostiquerAEcran(e: ExerciceExtA, phase: PhaseExtensionsBinomialeNormaleBayes, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aComposeEcran1P":
      return diagnostiquerAEcranP(e, valeurs);
    case "aEcranTrouverN1":
      return diagnostiquerAEcranTrouverN1(e, valeurs);
    case "aEcranTrouverN2":
      return diagnostiquerAEcranTrouverN2(e, valeurs);
    default:
      return diagnostiquerAEcranAucunAuMoins(e, valeurs);
  }
}

// ============================================================================
// Famille B — Binomial classique étendu (réutilise 6gen48/6gen50).
// ============================================================================

function versExerciceLoiBinomialeB(e: ExerciceExtB): ExerciceLoiBinomialeB {
  return { famille: "B", contexte: e.contexte, n: e.n, p: e.p, k: e.k, typeQuestion: e.typeQuestion, strategie: e.strategie, termesACalculer: e.termesACalculer, valeursTermes: e.valeursTermes, resultatFinal: e.resultatFinal, esperance: e.n * e.p };
}

/** `phase` — cast vers `PhaseLoiBinomiale` (voir en-tête de fichier : mêmes chaînes littérales pour
 * le sous-ensemble B, `bEsperance` jamais produit par ce générateur). */
export function diagnostiquerBEcran(e: ExerciceExtB, phase: PhaseExtensionsBinomialeNormaleBayes, valeurs: string[]): StatutVerification {
  return diagnostiquerLoiBinomialeBEcran(versExerciceLoiBinomialeB(e), phase as unknown as PhaseLoiBinomiale, valeurs);
}

// ============================================================================
// Famille C — Loi normale inverse en contexte (réutilise 6gen51 famille D).
// ============================================================================

/** Valeurs de référence dérivées de `Phi`/`PhiInverse` (Couche A `generateurs6e/loiNormale/`),
 * calculées par l'appelant (`ui6e/formatExtensionsBinomialeNormaleBayes.ts`) — voir en-tête de
 * fichier, mirroir EXACT de `ValeursReferenceLoiNormale` (`moteur6e/verificationLoiNormale.ts`). */
export interface ValeursReferenceExtensionsBinomialeNormaleBayes {
  cibleTable?: number;
  zReference?: number;
  aReference?: number;
}

export function diagnostiquerCEcran(e: ExerciceExtC, phase: PhaseExtensionsBinomialeNormaleBayes, valeurs: string[], ref: ValeursReferenceExtensionsBinomialeNormaleBayes): StatutVerification {
  if (phase === "cEcran1") return diagnostiquerDEcran1(e.base, valeurs, ref.cibleTable as number);
  if (phase === "cEcran2") return diagnostiquerDEcran2(e.base, valeurs, ref.zReference as number);
  return diagnostiquerDEcran3(e.base, valeurs, ref.aReference as number);
}

// ============================================================================
// Famille D — Théorème de Bayes à 3 catégories (extension de la philosophie 6gen32 famille C).
// ============================================================================

/** P(critère∩catégorie3) — déduit PAR DIFFÉRENCE avec `pTotal` (jamais stocké, recalculé ici à
 * chaque appel — convention "vérification par cohérence interne"). */
export function jointCategorie3D(e: ExerciceExtD): number {
  return e.pTotal - e.q1 * e.r1 - e.q2 * e.r2;
}

/** P(critère|catégorie3) — déduit du joint CORRECT (recalculé, jamais depuis la saisie élève) et de
 * `q3` CORRECT (`exercice.q3`, jamais depuis l'écran 1). */
export function r3DeduitD(e: ExerciceExtD): number {
  return jointCategorie3D(e) / e.q3;
}

export function diagnostiquerDEcran1Bayes(e: ExerciceExtD, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [e.q1, e.q2, e.q3]);
}
export function diagnostiquerDEcran2Bayes(e: ExerciceExtD, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [e.q1 * e.r1, e.q2 * e.r2]);
}
export function diagnostiquerDEcran3Bayes(e: ExerciceExtD, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [jointCategorie3D(e)]);
}
export function diagnostiquerDEcran4Bayes(e: ExerciceExtD, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [r3DeduitD(e)]);
}

export function diagnostiquerDEcranBayes(e: ExerciceExtD, phase: PhaseExtensionsBinomialeNormaleBayes, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "dEcran1":
      return diagnostiquerDEcran1Bayes(e, valeurs);
    case "dEcran2":
      return diagnostiquerDEcran2Bayes(e, valeurs);
    case "dEcran3":
      return diagnostiquerDEcran3Bayes(e, valeurs);
    default:
      return diagnostiquerDEcran4Bayes(e, valeurs);
  }
}

// ============================================================================
// Famille E — Loi uniforme continue.
// ============================================================================

export function probabiliteUniformeE(e: ExerciceExtE): number {
  return (e.d - e.c) / (e.b - e.a);
}

export function diagnostiquerEEcran1(e: ExerciceExtE, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [e.d - e.c, e.b - e.a]);
}
export function diagnostiquerEEcran2(e: ExerciceExtE, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [probabiliteUniformeE(e)]);
}
export function diagnostiquerEEcran(e: ExerciceExtE, phase: PhaseExtensionsBinomialeNormaleBayes, valeurs: string[]): StatutVerification {
  return phase === "eEcran1" ? diagnostiquerEEcran1(e, valeurs) : diagnostiquerEEcran2(e, valeurs);
}

// ============================================================================
// Famille F — Reconstruire une loi depuis des % croisés + espérance appliquée.
// ============================================================================

/** Les 3 probabilités [p1,p2,p3] — `p3` déduit PAR DIFFÉRENCE à 100% (jamais stocké — mirroir
 * `6gen32` famille B, `cellule20Reconstruire`). */
export function probabilitesF(e: ExerciceExtF): [number, number, number] {
  return [e.pourcentage1 / 100, e.pourcentage2 / 100, (100 - e.pourcentage1 - e.pourcentage2) / 100];
}

/** E(X) — `Σxᵢ·pᵢ` (mirroir `6gen49` famille B, jamais stocké, recalculé depuis les probabilités
 * CORRECTES à chaque appel). */
export function esperanceF(e: ExerciceExtF): number {
  const probas = probabilitesF(e);
  return e.valeurs.reduce((acc, v, i) => acc + v * probas[i], 0);
}

export function diagnostiquerFEcran1(e: ExerciceExtF, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, probabilitesF(e));
}

export function diagnostiquerFEcran2(e: ExerciceExtF, valeurs: string[]): StatutVerification {
  const probas = probabilitesF(e);
  const attendues: number[] = [];
  e.valeurs.forEach((v, i) => attendues.push(v, probas[i]));
  return diagnostiquerValeurs(valeurs, attendues);
}

export function diagnostiquerFEcran3(e: ExerciceExtF, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [esperanceF(e)]);
}

export function diagnostiquerFEcran4(e: ExerciceExtF, valeurs: string[]): StatutVerification {
  return diagnostiquerTotalAttendu(valeurs[0] ?? "", esperanceF(e) * e.population);
}

export function diagnostiquerFEcran(e: ExerciceExtF, phase: PhaseExtensionsBinomialeNormaleBayes, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "fEcran1":
      return diagnostiquerFEcran1(e, valeurs);
    case "fEcran2":
      return diagnostiquerFEcran2(e, valeurs);
    case "fEcran3":
      return diagnostiquerFEcran3(e, valeurs);
    default:
      return diagnostiquerFEcran4(e, valeurs);
  }
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceExtensionsBinomialeNormaleBayes, phase: PhaseExtensionsBinomialeNormaleBayes, valeurs: string[], ref: ValeursReferenceExtensionsBinomialeNormaleBayes = {}): StatutVerification {
  switch (exercice.famille) {
    case "A":
      return diagnostiquerAEcran(exercice, phase, valeurs);
    case "B":
      return diagnostiquerBEcran(exercice, phase, valeurs);
    case "C":
      return diagnostiquerCEcran(exercice, phase, valeurs, ref);
    case "D":
      return diagnostiquerDEcranBayes(exercice, phase, valeurs);
    case "E":
      return diagnostiquerEEcran(exercice, phase, valeurs);
    case "F":
      return diagnostiquerFEcran(exercice, phase, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceExtensionsBinomialeNormaleBayes, phase: PhaseExtensionsBinomialeNormaleBayes, valeurs: string[], ref: ValeursReferenceExtensionsBinomialeNormaleBayes = {}): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs, ref) === "correct";
}
