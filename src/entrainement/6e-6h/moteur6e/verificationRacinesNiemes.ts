import type { AngleRemarquable } from "../core6e/formeTrigonometrique.types";
import type { ExerciceRacinesA, ExerciceRacinesB, ExerciceRacinesC, ExerciceRacinesNiemes, RacineExacte } from "../core6e/racinesNiemes.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { evaluerExpressionExponentielle, evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseRacinesNiemes } from "./typesRacinesNiemes";

/**
 * Couche B (6e) — vérification propre à `6gen39` (dispatch par famille/écran). N'importe JAMAIS rien
 * de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/racinesNiemes/session.integration.test.ts` pour le seul fichier autorisé Couche A +
 * Couche B ensemble.
 *
 * ============================================================================
 * **DÉCISION D'ARCHITECTURE CENTRALE — racines vérifiées via 2 CHAMPS RÉELS SÉPARÉS (partie
 * réelle/partie imaginaire), jamais un seul champ complexe "a+bi"** (déviation délibérée de la
 * convention établie par `moteur6e/verificationComplexes.ts`, fondation du chapitre depuis `6gen34`)
 * ============================================================================
 * `moteur6e/expressionComplexe.ts` (utilisé par `verificationComplexes.ts` pour tout champ "a+bi" de
 * ce chapitre) N'A AUCUNE fonction `sqrt` dans sa grammaire (voir son en-tête) — or les racines de
 * CE générateur combinent RÉGULIÈREMENT un module entier avec un cos/sin irrationnel (angle π/4 →
 * √2/2, angle π/3 ou π/6 → √3/2) : un résultat du type `a=√2` (n=2, θ=π/4) serait donc
 * STRUCTURELLEMENT IMPOSSIBLE à taper dans un champ "a+bi" unique — contrairement à `6gen37` famille
 * C, qui contourne ce problème en restreignant ses angles de départ aux "entiers de Gauss" (a,b
 * TOUJOURS entiers dès la conception), ce générateur ne peut PAS se limiter aux seuls angles d'axe
 * sans réduire `n=3` à une impossibilité totale (voir preuve dans `generateurs6e/racinesNiemes/
 * fermeture.ts` : AUCUN angle de départ ne referme sur des racines toutes d'axe pour n=3).
 *
 * Solution retenue : chaque racine est vérifiée par une PAIRE de champs texte, "partie réelle" et
 * "partie imaginaire", chacun un nombre RÉEL évalué via `moteur6e/expressionExponentielle.ts` — qui,
 * lui, supporte nativement `sqrt` (ainsi que les fractions, `pi`, etc.). L'élève tape par exemple
 * "sqrt(2)" pour une partie réelle égale à √2, chose impossible avec l'évaluateur complexe du
 * chapitre. `diagnostiquerListeRacines` (ci-dessous) généralise `diagnostiquerRacinesCarrees`
 * (`verificationAffixesRacines.ts`, 6gen35) à ce nouveau contrat : le tableau `valeurs: string[]`
 * soumis par l'écran add-as-needed est APLATI (`[re0, im0, re1, im1, ...]`, 2 entrées consécutives
 * par racine) plutôt qu'un tableau de paires structurées — choix fait pour garder la signature
 * standard `(exercice, phase, valeurs: string[]) => StatutVerification` utilisée PARTOUT ailleurs sur
 * ce chantier (`soumettreReponseEcran`), sans introduire un second type de contrat pour ce seul
 * générateur.
 *
 * ============================================================================
 * **`diagnostiquerFormuleEntierK` — champ "formule générale paramétrée par k" (familles A écran 2,
 * B écran 2), identité par ÉCHANTILLONNAGE sur un paramètre ENTIER, jamais un réel continu**
 * ============================================================================
 * `k` n'a de sens ici QUE comme indice entier (k=0,...,n-1, un paramètre de numérotation des
 * racines, pas une variable continue) — mirroir structurel de `diagnostiquerEquivalenceFonction`
 * (`equivalenceExponentielle.ts`), variable renommée "k" et POINTS échantillonnés = entiers
 * {0,...,n-1} PLUS 2 valeurs hors de cette plage (`n` et `-1`) pour vérifier que la formule soumise
 * est bien la formule GÉNÉRALE non réduite `(θ+2kπ)/n` (littéralement, sans réduction modulo 2π) et
 * non une liste de n valeurs numériques coïncidant par hasard aux seuls points 0..n-1 — même
 * généralisation en esprit que `verificationFormuleMoivre.ts` (6gen38, qui étend la même technique à
 * une SECONDE variable réelle "i" ; ici la seconde dimension est un paramètre ENTIER "k" plutôt
 * qu'un réel continu, donc échantillonné sur un petit ensemble d'entiers plutôt que sur des points
 * réels dispersés).
 *
 * ============================================================================
 * **Famille B écran 2 — "formule générale" DÉCOMPOSÉE en 2 champs (module, argument), jamais un
 * champ unique "cos(...)+isin(...)" ou "e^{i...}" — déviation du libellé littéral de la spec,
 * documentée ici**
 * ============================================================================
 * La spec source demande un champ UNIQUE "en forme trigonométrique OU exponentielle". Un champ
 * unique nécessiterait soit de faire jouer à "i" le rôle d'une seconde variable réelle libre (mirroir
 * `verificationFormuleMoivre.ts`) — technique qui fonctionne pour une IDENTITÉ POLYNOMIALE en i (i au
 * plus au degré 1, cas de la forme trigonométrique "cos(...)+i·sin(...)") MAIS PAS pour la forme
 * EXPONENTIELLE "e^{i·(...)}" : substituer un réel arbitraire à "i" dans `exp(i·θ)` évalue
 * `Math.exp(i_réel·θ)` (croissance/décroissance réelle), une fonction totalement DIFFÉRENTE de
 * `cos(θ)+i_réel·sin(θ)` — la formule d'Euler n'est vraie QUE pour le véritable nombre imaginaire,
 * jamais pour une valeur réelle substituée. Accepter les 2 formes (trig ET exp) dans un champ texte
 * unique demanderait donc un analyseur syntaxique dédié reconnaissant le motif `e^{i·...}` pour le
 * réécrire avant évaluation — fragile pour un champ en saisie libre. Décomposer la réponse en
 * (module, argument) — 2 champs réels, chacun vérifié par `diagnostiquerFormuleEntierK` — reste
 * mathématiquement ÉQUIVALENT (le couple module+argument caractérise ENTIÈREMENT la forme
 * trigonométrique ET la forme exponentielle) et réutilise la même brique déjà fiable que la famille
 * A écran 2, sans nouvelle machinerie de parsing. `ui6e/formatRacinesNiemes.ts` explicite ce choix à
 * l'écran ("Module des racines (en k)"/"Argument des racines (en k)").
 */

const TOLERANCE_FORMULE = 1e-6;
const TOLERANCE_RACINE = 1e-9;

/** Généralisation de `diagnostiquerEquivalenceFonction` à un paramètre ENTIER "k" — voir en-tête de
 * fichier. */
export function diagnostiquerFormuleEntierK(texte: string, reference: (k: number) => number, n: number, tolerance: number = TOLERANCE_FORMULE): StatutVerification {
  const points = [...Array(n).keys(), n, -1];
  let comparables = 0;
  for (const k of points) {
    const attendu = reference(k);
    if (!Number.isFinite(attendu)) continue;
    let soumis: number;
    try {
      soumis = evaluerExpressionExponentielle(texte, { k });
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(soumis)) return "not_equivalent";
    comparables++;
    if (Math.abs(soumis - attendu) > tolerance) return "not_equivalent";
  }
  const minimumRequis = Math.min(3, points.length);
  if (comparables < minimumRequis) return "parse_error";
  return "correct";
}

/** Formule générale RÉELLE de l'argument des n racines : (θ+2kπ)/n — partagée par la famille A
 * écran 2 et la famille B écran 2 (même mathématique, voir en-tête de fichier). */
export function formuleArgumentRacines(angle: AngleRemarquable, n: number): (k: number) => number {
  return (k: number) => (angle.numerique + 2 * k * Math.PI) / n;
}

/** Vérifie un ENSEMBLE de `cibles.length` racines (chacune une paire re/im) contre `valeursFlat`
 * (aplati, `[re0,im0,re1,im1,...]`) — ordre indifférent, mirroir structurel de
 * `diagnostiquerRacinesCarrees`/`diagnostiquerEnsembleValeurs`, adapté à l'évaluateur RÉEL (support
 * `sqrt`) plutôt qu'au grammaire complexe "a+bi" — voir en-tête de fichier pour la raison. */
export function diagnostiquerListeRacines(valeursFlat: string[], cibles: RacineExacte[], tolerance: number = TOLERANCE_RACINE): StatutVerification {
  if (valeursFlat.length !== cibles.length * 2) return "not_equivalent";
  const soumis: { re: number; im: number }[] = [];
  for (let i = 0; i < cibles.length; i++) {
    const re = evaluerValeurExponentielle(valeursFlat[i * 2]);
    const im = evaluerValeurExponentielle(valeursFlat[i * 2 + 1]);
    if (re === null || im === null) return "parse_error";
    soumis.push({ re, im });
  }
  const restantes = cibles.map((c) => ({ re: c.re.numerique, im: c.im.numerique }));
  for (const v of soumis) {
    const index = restantes.findIndex((c) => Math.abs(c.re - v.re) <= tolerance && Math.abs(c.im - v.im) <= tolerance);
    if (index === -1) return "not_equivalent";
    restantes.splice(index, 1);
  }
  return "correct";
}

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

// ============================================================================
// Famille A.
// ============================================================================

export function diagnostiquerAEcran1(exercice: ExerciceRacinesA, valeurs: string[]): StatutVerification {
  const statutR = diagnostiquerValeurReelle(valeurs[0], exercice.r);
  const statutTheta = diagnostiquerValeurReelle(valeurs[1], exercice.angle.numerique);
  return combinerStatuts(statutR, statutTheta);
}

export function diagnostiquerAEcran2(exercice: ExerciceRacinesA, valeurs: string[]): StatutVerification {
  const statutModule = diagnostiquerFormuleEntierK(valeurs[0], () => exercice.kModule, exercice.n);
  const statutArgument = diagnostiquerFormuleEntierK(valeurs[1], formuleArgumentRacines(exercice.angle, exercice.n), exercice.n);
  return combinerStatuts(statutModule, statutArgument);
}

export function diagnostiquerAEcran3(exercice: ExerciceRacinesA, valeurs: string[]): StatutVerification {
  return diagnostiquerListeRacines(valeurs, exercice.racines);
}

// ============================================================================
// Famille B.
// ============================================================================

export function diagnostiquerBEcran1(exercice: ExerciceRacinesB, valeurs: string[]): StatutVerification {
  const statutR = diagnostiquerValeurReelle(valeurs[0], exercice.r, 1e-6);
  const statutTheta = diagnostiquerValeurReelle(valeurs[1], exercice.angle.numerique, 1e-6);
  return combinerStatuts(statutR, statutTheta);
}

export function diagnostiquerBEcran2(exercice: ExerciceRacinesB, valeurs: string[]): StatutVerification {
  const statutModule = diagnostiquerFormuleEntierK(valeurs[0], () => Math.pow(exercice.r, 1 / exercice.n), exercice.n);
  const statutArgument = diagnostiquerFormuleEntierK(valeurs[1], formuleArgumentRacines(exercice.angle, exercice.n), exercice.n);
  return combinerStatuts(statutModule, statutArgument);
}

// ============================================================================
// Famille C.
// ============================================================================

export type IdRelationRacineUnite = "correct" | "somme" | "sansW";

export const OPTIONS_RELATION_C: IdRelationRacineUnite[] = ["correct", "somme", "sansW"];

export function diagnostiquerCEcran1(exercice: ExerciceRacinesC, valeurs: string[]): StatutVerification {
  void exercice;
  return valeurs[0] === "correct" ? "correct" : "not_equivalent";
}
export function verifierCEcran1(exercice: ExerciceRacinesC, valeurs: string[]): boolean {
  return diagnostiquerCEcran1(exercice, valeurs) === "correct";
}

export function diagnostiquerCEcran2(exercice: ExerciceRacinesC, valeurs: string[]): StatutVerification {
  return diagnostiquerListeRacines(valeurs, exercice.zetas);
}

export function diagnostiquerCEcran3(exercice: ExerciceRacinesC, valeurs: string[]): StatutVerification {
  return diagnostiquerListeRacines(valeurs, exercice.racines);
}

// ============================================================================
// Petit utilitaire local — comparaison d'un champ réel unique à une cible numérique (mirroir
// `diagnostiquerValeur`, `equivalenceExponentielle.ts`, jamais importé tel quel pour garder une
// tolérance par défaut propre à ce générateur — 1e-6, cohérent avec `TOLERANCE_ANGLE` de
// `formeTrigonometrique/familleA.ts`).
// ============================================================================

function diagnostiquerValeurReelle(texte: string, cible: number, tolerance: number = 1e-6): StatutVerification {
  const v = evaluerValeurExponentielle(texte);
  if (v === null) return "parse_error";
  return Math.abs(v - cible) <= tolerance ? "correct" : "not_equivalent";
}

// ============================================================================
// Dispatcher générique (mirroir 6gen37).
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "aEcran1":
      return diagnostiquerAEcran1(exercice as ExerciceRacinesA, valeurs);
    case "aEcran2":
      return diagnostiquerAEcran2(exercice as ExerciceRacinesA, valeurs);
    case "aEcran3":
      return diagnostiquerAEcran3(exercice as ExerciceRacinesA, valeurs);
    case "bEcran1":
      return diagnostiquerBEcran1(exercice as ExerciceRacinesB, valeurs);
    case "bEcran2":
      return diagnostiquerBEcran2(exercice as ExerciceRacinesB, valeurs);
    case "cEcran1":
      return diagnostiquerCEcran1(exercice as ExerciceRacinesC, valeurs);
    case "cEcran2":
      return diagnostiquerCEcran2(exercice as ExerciceRacinesC, valeurs);
    case "cEcran3":
      return diagnostiquerCEcran3(exercice as ExerciceRacinesC, valeurs);
  }
}

export function verifierEcran(exercice: ExerciceRacinesNiemes, phase: PhaseRacinesNiemes, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
