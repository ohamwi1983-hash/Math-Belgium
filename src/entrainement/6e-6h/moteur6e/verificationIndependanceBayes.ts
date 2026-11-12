import type { ExerciceFamilleAPannes, ExerciceFamilleAUnion, ExerciceFamilleBReconstruire, ExerciceFamilleBTestIndependance, ExerciceFamilleBTableauDonne, ExerciceFamilleC, ExerciceIndependanceBayes, TableauDouble, TypeQuestionTable, VerdictTestIndependance } from "../core6e/independanceBayes.types";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseIndependanceBayes } from "./typesIndependanceBayes";
import { diagnostiquerProbabilite, diagnostiquerValeur, sontIndependantsEffectifs } from "./verificationProbabilites";

/**
 * Couche B (6e) — vérification propre à `6gen32`. N'importe JAMAIS rien de `src/generateurs6e/`
 * (règle non négociable, CLAUDE.md).
 *
 * Toute PROBABILITÉ saisie passe par `diagnostiquerProbabilite` (`moteur6e/verificationProbabilites.ts`,
 * audit 6e ch. 6, décision A) : valeur exacte (fraction, produit…), décimal correctement arrondi
 * (2 décimales, 3 si la probabilité est inférieure à 0,1) ou pourcentage (« 15 % »). Plus de
 * tolérance absolue de 0,01 (qui acceptait 0,02 pour 0,015). Les EFFECTIFS (tableau à reconstruire)
 * sont des entiers comparés exactement (`diagnostiquerEffectif`).
 *
 * Signature commune : tous les écrans prennent `string[]` (dispatcher `diagnostiquerEcran`). Seul
 * écran à CHOIX : `bIndepEcran2` (`valeurs[0]` = identifiant du verdict, voir
 * `VerdictTestIndependance`).
 */

/** Effectif entier : comparaison EXACTE (jamais « à peu près »). */
function diagnostiquerEffectif(texte: string, cible: number): StatutVerification {
  return diagnostiquerValeur(texte, cible, 1e-9);
}

function pireStatut(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  return statuts.every((s) => s === "correct") ? "correct" : "not_equivalent";
}

// ============================================================================
// Famille A — sous-type "pannes".
// ============================================================================

function complement1(ex: ExerciceFamilleAPannes): number {
  return 1 - ex.p1;
}
function complement2(ex: ExerciceFamilleAPannes): number {
  return 1 - ex.p2;
}

/** La combinaison demandée à l'écran 2 — `"exactementUn"` est LA variante à double application de
 * l'indépendance (spec) : p1·(1−p2) + (1−p1)·p2, deux produits distincts appliqués séparément puis
 * sommés — jamais un simple p1·p2. */
export function valeurEcran2Pannes(ex: ExerciceFamilleAPannes): number {
  switch (ex.demandeEcran2) {
    case "lesDeux":
      return ex.p1 * ex.p2;
    case "aucun":
      return complement1(ex) * complement2(ex);
    case "auMoinsUn":
      return 1 - complement1(ex) * complement2(ex);
    case "exactementUn":
      return ex.p1 * complement2(ex) + complement1(ex) * ex.p2;
  }
}

/** Écran 1 — `valeurs = [P(élément 1 ne tombe pas en panne), P(élément 2 ne tombe pas en panne)]`. */
export function diagnostiquerAPannesEcran1(exercice: ExerciceFamilleAPannes, valeurs: string[]): StatutVerification {
  return pireStatut(diagnostiquerProbabilite(valeurs[0], complement1(exercice)), diagnostiquerProbabilite(valeurs[1], complement2(exercice)));
}
export function verifierAPannesEcran1(exercice: ExerciceFamilleAPannes, valeurs: string[]): boolean {
  return diagnostiquerAPannesEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [valeur]`, la combinaison demandée par `exercice.demandeEcran2`. */
export function diagnostiquerAPannesEcran2(exercice: ExerciceFamilleAPannes, valeurs: string[]): StatutVerification {
  return diagnostiquerProbabilite(valeurs[0], valeurEcran2Pannes(exercice));
}
export function verifierAPannesEcran2(exercice: ExerciceFamilleAPannes, valeurs: string[]): boolean {
  return diagnostiquerAPannesEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille A — sous-type "unionIndependance".
// ============================================================================

/** P(B), déduit de P(A∪B)=P(A)+P(B)−P(A)·P(B) — jamais stocké dans l'exercice (voir
 * `core6e/independanceBayes.types.ts`), toujours redérivé ici depuis pA/pAouB. */
export function pBDeduitUnion(ex: ExerciceFamilleAUnion): number {
  return (ex.pAouB - ex.pA) / (1 - ex.pA);
}

/** Écran 1 — `valeurs = [P(Ā)]`. */
export function diagnostiquerAUnionEcran1(exercice: ExerciceFamilleAUnion, valeurs: string[]): StatutVerification {
  return diagnostiquerProbabilite(valeurs[0], 1 - exercice.pA);
}
export function verifierAUnionEcran1(exercice: ExerciceFamilleAUnion, valeurs: string[]): boolean {
  return diagnostiquerAUnionEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [P(B)]`. */
export function diagnostiquerAUnionEcran2(exercice: ExerciceFamilleAUnion, valeurs: string[]): StatutVerification {
  return diagnostiquerProbabilite(valeurs[0], pBDeduitUnion(exercice));
}
export function verifierAUnionEcran2(exercice: ExerciceFamilleAUnion, valeurs: string[]): boolean {
  return diagnostiquerAUnionEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — `valeurs = [P(A|B), P(B|A)]`. Piège central de la spec : refaire le calcul complet
 * P(A∩B)/P(B) plutôt que reconnaître le raccourci P(A|B)=P(A) (idem P(B|A)=P(B)) — un raccourci
 * VALIDE, pas une coïncidence : par indépendance P(A∩B)=P(A)·P(B), donc P(A∩B)/P(B)=P(A)
 * ALGÉBRIQUEMENT, toujours. La comparaison ci-dessous compare directement à `exercice.pA`/
 * `pBDeduitUnion(exercice)` — accepte donc le raccourci ET le calcul complet (numériquement
 * identiques), jamais une seule des deux formes acceptée par accident (voir
 * `verificationIndependanceBayes.test.ts`, "le raccourci EST le calcul complet"). */
export function diagnostiquerAUnionEcran3(exercice: ExerciceFamilleAUnion, valeurs: string[]): StatutVerification {
  return pireStatut(diagnostiquerProbabilite(valeurs[0], exercice.pA), diagnostiquerProbabilite(valeurs[1], pBDeduitUnion(exercice)));
}
export function verifierAUnionEcran3(exercice: ExerciceFamilleAUnion, valeurs: string[]): boolean {
  return diagnostiquerAUnionEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille B — sous-type "testIndependance" (tableau 2×2).
// ============================================================================

export interface EffectifsTest {
  n: number;
  nA: number;
  nB: number;
  nAetB: number;
}

export function effectifsTest(ex: ExerciceFamilleBTestIndependance): EffectifsTest {
  const [[x, y], [z, t]] = ex.cellules;
  return { n: x + y + z + t, nA: x + y, nB: x + z, nAetB: x };
}

/** Verdict EXACT, sur les effectifs entiers (jamais à une tolérance près) : incompatibles ⟺
 * n(A∩B) = 0 ; indépendants ⟺ n(A∩B)·n = n(A)·n(B). */
export function verdictTestIndependance(ex: ExerciceFamilleBTestIndependance): VerdictTestIndependance {
  const { n, nA, nB, nAetB } = effectifsTest(ex);
  if (nAetB === 0) return "incompatibles";
  return sontIndependantsEffectifs(nA, nB, nAetB, n) ? "independants" : "ni";
}

/** Écran 1 — méthode "produit" : `valeurs = [P(A), P(B), P(A∩B)]` ; méthode "conditionnelle" :
 * `valeurs = [P(A), P(A|B)]`. */
export function diagnostiquerBIndepEcran1(exercice: ExerciceFamilleBTestIndependance, valeurs: string[]): StatutVerification {
  const { n, nA, nB, nAetB } = effectifsTest(exercice);
  if (exercice.methode === "produit") {
    return pireStatut(diagnostiquerProbabilite(valeurs[0], nA / n), diagnostiquerProbabilite(valeurs[1], nB / n), diagnostiquerProbabilite(valeurs[2], nAetB / n));
  }
  return pireStatut(diagnostiquerProbabilite(valeurs[0], nA / n), diagnostiquerProbabilite(valeurs[1], nAetB / nB));
}
export function verifierBIndepEcran1(exercice: ExerciceFamilleBTestIndependance, valeurs: string[]): boolean {
  return diagnostiquerBIndepEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 (choix fermé, UN essai) — `valeurs = [verdict]`. */
export function diagnostiquerBIndepEcran2(exercice: ExerciceFamilleBTestIndependance, valeurs: string[]): StatutVerification {
  return valeurs[0] === verdictTestIndependance(exercice) ? "correct" : "not_equivalent";
}
export function verifierBIndepEcran2(exercice: ExerciceFamilleBTestIndependance, valeurs: string[]): boolean {
  return diagnostiquerBIndepEcran2(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille B — tableau à double entrée générique (partagé "tableauDonne"/"tableauReconstruire").
// ============================================================================

export function totalTable(t: TableauDouble): number {
  return t.cellules.reduce((acc, ligne) => acc + ligne.reduce((a, b) => a + b, 0), 0);
}
export function totalLigneTable(t: TableauDouble, i: number): number {
  return t.cellules[i].reduce((a, b) => a + b, 0);
}
export function totalColonneTable(t: TableauDouble, j: number): number {
  return t.cellules.reduce((acc, ligne) => acc + ligne[j], 0);
}

/** LA fonction réutilisée par "tableauDonne" (table déjà donnée) ET "tableauReconstruire" (table
 * reconstruite à l'écran 3) — voir `core6e/independanceBayes.types.ts`, `TypeQuestionTable`, pour le
 * piège central (marginale ≠ conditionnelle) que cette fonction encode. */
export function probabiliteDepuisTable(t: TableauDouble, type: TypeQuestionTable, ligne: number, colonne: number): number {
  const total = totalTable(t);
  switch (type) {
    case "jointe":
      return t.cellules[ligne][colonne] / total;
    case "margLigne":
      return totalLigneTable(t, ligne) / total;
    case "margColonne":
      return totalColonneTable(t, colonne) / total;
    case "condLigneSachantColonne":
      return t.cellules[ligne][colonne] / totalColonneTable(t, colonne);
    case "condColonneSachantLigne":
      return t.cellules[ligne][colonne] / totalLigneTable(t, ligne);
  }
}

/** Même probabilité que `probabiliteDepuisTable`, sous forme [numérateur, dénominateur] d'effectifs
 * entiers — pour un affichage exact (récapitulatif) plutôt qu'un décimal arrondi. */
export function fractionDepuisTable(t: TableauDouble, type: TypeQuestionTable, ligne: number, colonne: number): [number, number] {
  switch (type) {
    case "jointe":
      return [t.cellules[ligne][colonne], totalTable(t)];
    case "margLigne":
      return [totalLigneTable(t, ligne), totalTable(t)];
    case "margColonne":
      return [totalColonneTable(t, colonne), totalTable(t)];
    case "condLigneSachantColonne":
      return [t.cellules[ligne][colonne], totalColonneTable(t, colonne)];
    case "condColonneSachantLigne":
      return [t.cellules[ligne][colonne], totalLigneTable(t, ligne)];
  }
}

/** Écran unique — `valeurs = [valeur]`. */
export function diagnostiquerBTableEcran1(exercice: ExerciceFamilleBTableauDonne, valeurs: string[]): StatutVerification {
  return diagnostiquerProbabilite(valeurs[0], probabiliteDepuisTable(exercice.table, exercice.typeQuestion, exercice.ligneCible, exercice.colonneCible));
}
export function verifierBTableEcran1(exercice: ExerciceFamilleBTableauDonne, valeurs: string[]): boolean {
  return diagnostiquerBTableEcran1(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille B — sous-type "tableauReconstruire" (table 3×2, dérivée à chaque appel — voir
// `core6e/independanceBayes.types.ts` pour la convention exacte des 6 cellules).
// ============================================================================

export function totauxLigneReconstruire(ex: ExerciceFamilleBReconstruire): [number, number, number] {
  return [(ex.total * ex.pourcentageLigne[0]) / 100, (ex.total * ex.pourcentageLigne[1]) / 100, (ex.total * ex.pourcentageLigne[2]) / 100];
}
export function cellule00Reconstruire(ex: ExerciceFamilleBReconstruire): number {
  return (totauxLigneReconstruire(ex)[0] * ex.pourcentageReussiteLigne1) / 100;
}
export function cellule10Reconstruire(ex: ExerciceFamilleBReconstruire): number {
  return (totauxLigneReconstruire(ex)[1] * ex.pourcentageReussiteLigne2) / 100;
}
export function totalColonne1Reconstruire(ex: ExerciceFamilleBReconstruire): number {
  return (ex.total * ex.pourcentageReussiteGlobale) / 100;
}
/** Cellule (ligne 3, colonne 1) — déduite PAR DIFFÉRENCE avec le total de la colonne 1 (spec, écran
 * 2 : "compléter les cases restantes par différence"). */
export function cellule20Reconstruire(ex: ExerciceFamilleBReconstruire): number {
  return totalColonne1Reconstruire(ex) - cellule00Reconstruire(ex) - cellule10Reconstruire(ex);
}

/** Table complète — chaque cellule colonne-2 déduite PAR DIFFÉRENCE avec le total de sa ligne. */
export function tableCompleteReconstruire(ex: ExerciceFamilleBReconstruire): TableauDouble {
  const [r0, r1, r2] = totauxLigneReconstruire(ex);
  const c00 = cellule00Reconstruire(ex);
  const c10 = cellule10Reconstruire(ex);
  const c20 = cellule20Reconstruire(ex);
  return { libelleLignes: ex.contexte.libelleLignes, libelleColonnes: ex.contexte.libelleColonnes, cellules: [[c00, r0 - c00], [c10, r1 - c10], [c20, r2 - c20]] };
}

/** Écran 1 — `valeurs = [R1, R2, R3, cellule(0,0), cellule(1,0)]` (3 totaux de ligne PUIS les 2
 * cellules colonne-1 directement calculables — voir en-tête de `core6e/independanceBayes.types.ts`
 * pour la convention exacte, TOUJOURS dans cet ordre). */
export function diagnostiquerBReconEcran1(exercice: ExerciceFamilleBReconstruire, valeurs: string[]): StatutVerification {
  const [r0, r1, r2] = totauxLigneReconstruire(exercice);
  return pireStatut(diagnostiquerEffectif(valeurs[0], r0), diagnostiquerEffectif(valeurs[1], r1), diagnostiquerEffectif(valeurs[2], r2), diagnostiquerEffectif(valeurs[3], cellule00Reconstruire(exercice)), diagnostiquerEffectif(valeurs[4], cellule10Reconstruire(exercice)));
}
export function verifierBReconEcran1(exercice: ExerciceFamilleBReconstruire, valeurs: string[]): boolean {
  return diagnostiquerBReconEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [cellule(2,0), cellule(0,1), cellule(1,1), cellule(2,1)]` (la cellule
 * colonne-1 manquante PUIS les 3 cellules colonne-2, TOUJOURS dans cet ordre) — vérification
 * CELLULE PAR CELLULE (spec). */
export function diagnostiquerBReconEcran2(exercice: ExerciceFamilleBReconstruire, valeurs: string[]): StatutVerification {
  const table = tableCompleteReconstruire(exercice);
  return pireStatut(diagnostiquerEffectif(valeurs[0], cellule20Reconstruire(exercice)), diagnostiquerEffectif(valeurs[1], table.cellules[0][1]), diagnostiquerEffectif(valeurs[2], table.cellules[1][1]), diagnostiquerEffectif(valeurs[3], table.cellules[2][1]));
}
export function verifierBReconEcran2(exercice: ExerciceFamilleBReconstruire, valeurs: string[]): boolean {
  return diagnostiquerBReconEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — `valeurs = [valeur]`, lue sur le tableau CORRECT reconstruit — réutilise
 * `probabiliteDepuisTable` (même contrat `TypeQuestionTable` que "tableauDonne", jamais réimplémenté). */
export function diagnostiquerBReconEcran3(exercice: ExerciceFamilleBReconstruire, valeurs: string[]): StatutVerification {
  const table = tableCompleteReconstruire(exercice);
  return diagnostiquerProbabilite(valeurs[0], probabiliteDepuisTable(table, exercice.typeQuestionFinale, exercice.ligneCibleFinale, exercice.colonneCibleFinale));
}
export function verifierBReconEcran3(exercice: ExerciceFamilleBReconstruire, valeurs: string[]): boolean {
  return diagnostiquerBReconEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Famille C — arbre de probabilité et théorème de Bayes.
// ============================================================================

/** P(effet) par la formule des probabilités totales. */
export function probabiliteEffetC(ex: ExerciceFamilleC): number {
  return ex.p * ex.q1 + (1 - ex.p) * ex.q2;
}

/** Les 4 probabilités des branches finales de l'arbre, TOUJOURS dans cet ordre :
 * [P(cause1∩effet), P(cause1∩pas effet), P(cause2∩effet), P(cause2∩pas effet)]. */
export function branchesArbreC(ex: ExerciceFamilleC): [number, number, number, number] {
  return [ex.p * ex.q1, ex.p * (1 - ex.q1), (1 - ex.p) * ex.q2, (1 - ex.p) * (1 - ex.q2)];
}

/** Bayes — `demandeEcran3` détermine le sens : numérateur = branche spécifique de l'arbre,
 * dénominateur = P(effet) (écran 2). Piège central de la spec : ne jamais lire directement q1 (ou
 * 1−q1), qui est P(effet|cause1) (ou P(pas effet|cause1)) — le sens INVERSE de ce qui est demandé. */
export function bayesEcran3C(ex: ExerciceFamilleC): number {
  const pEffet = probabiliteEffetC(ex);
  return ex.demandeEcran3 === "cause1SachantEffet" ? (ex.p * ex.q1) / pEffet : (ex.p * (1 - ex.q1)) / (1 - pEffet);
}

/** Écran 1 — `valeurs = [P(cause1∩effet), P(cause1∩pas effet), P(cause2∩effet), P(cause2∩pas effet)]`. */
export function diagnostiquerCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  const branches = branchesArbreC(exercice);
  return pireStatut(...branches.map((b, i) => diagnostiquerProbabilite(valeurs[i], b)));
}
export function verifierCEcran1(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran1(exercice, valeurs) === "correct";
}

/** Écran 2 — `valeurs = [P(effet)]`. */
export function diagnostiquerCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  return diagnostiquerProbabilite(valeurs[0], probabiliteEffetC(exercice));
}
export function verifierCEcran2(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran2(exercice, valeurs) === "correct";
}

/** Écran 3 — `valeurs = [valeur]`, le résultat de Bayes. */
export function diagnostiquerCEcran3(exercice: ExerciceFamilleC, valeurs: string[]): StatutVerification {
  return diagnostiquerProbabilite(valeurs[0], bayesEcran3C(exercice));
}
export function verifierCEcran3(exercice: ExerciceFamilleC, valeurs: string[]): boolean {
  return diagnostiquerCEcran3(exercice, valeurs) === "correct";
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aPannesEcran1":
      return diagnostiquerAPannesEcran1(exercice as ExerciceFamilleAPannes, valeurs);
    case "aPannesEcran2":
      return diagnostiquerAPannesEcran2(exercice as ExerciceFamilleAPannes, valeurs);
    case "aUnionEcran1":
      return diagnostiquerAUnionEcran1(exercice as ExerciceFamilleAUnion, valeurs);
    case "aUnionEcran2":
      return diagnostiquerAUnionEcran2(exercice as ExerciceFamilleAUnion, valeurs);
    case "aUnionEcran3":
      return diagnostiquerAUnionEcran3(exercice as ExerciceFamilleAUnion, valeurs);
    case "bIndepEcran1":
      return diagnostiquerBIndepEcran1(exercice as ExerciceFamilleBTestIndependance, valeurs);
    case "bIndepEcran2":
      return diagnostiquerBIndepEcran2(exercice as ExerciceFamilleBTestIndependance, valeurs);
    case "bTableEcran1":
      return diagnostiquerBTableEcran1(exercice as ExerciceFamilleBTableauDonne, valeurs);
    case "bReconEcran1":
      return diagnostiquerBReconEcran1(exercice as ExerciceFamilleBReconstruire, valeurs);
    case "bReconEcran2":
      return diagnostiquerBReconEcran2(exercice as ExerciceFamilleBReconstruire, valeurs);
    case "bReconEcran3":
      return diagnostiquerBReconEcran3(exercice as ExerciceFamilleBReconstruire, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceFamilleC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceFamilleC, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceFamilleC, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceIndependanceBayes, phase: PhaseIndependanceBayes, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
