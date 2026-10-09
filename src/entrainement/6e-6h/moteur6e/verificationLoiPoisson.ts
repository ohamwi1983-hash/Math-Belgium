import type { ExerciceLoiPoisson, ExerciceLoiPoissonA, ExerciceLoiPoissonB, StrategiePoissonB } from "../core6e/loiPoisson.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerValeur } from "./verificationProbabilites";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseLoiPoisson } from "./typesLoiPoisson";

/**
 * Couche B (6e) — vérification propre à `6gen53` (dispatch par famille/phase). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir `generateurs6e/loiPoisson/
 * session.integration.test.ts` pour le seul fichier autorisé Couche A + Couche B ensemble.
 *
 * **Précision retenue — 10⁻⁴ ABSOLU (pas de tolérance relative)** : la spec autorise "10⁻³ ou 10⁻⁴
 * selon la précision demandée". Un piège existe ici pour la loi de Poisson (contrairement à une
 * probabilité binomiale usuelle, toujours dans un ordre de grandeur "normal") : `e^{-λ}` peut
 * devenir ASTRONOMIQUEMENT petit pour λ élevé (ex. λ=75, P(X=0)≈2,7×10⁻³³) — une tolérance ABSOLUE
 * appliquée à une valeur aussi minuscule accepterait n'importe quoi de proche de 0, y compris 0
 * lui-même, ce qui viderait la vérification de tout sens. Plutôt qu'une tolérance RELATIVE (comme
 * `diagnostiquerProduitFinal` de `6gen48`), ce générateur évite le problème À LA GÉNÉRATION
 * (`generateurs6e/loiPoisson/familleA.ts`/`familleB.ts`) : tout k demandé reste centré près du MODE
 * de la loi (proche de λ, où la probabilité reste "normale", jamais dégénérée), et le seul cas où un
 * terme individuel pourrait être minuscule (le complément "au moins k" avec λ élevé) n'est JAMAIS
 * lui-même un champ vérifié — seul le résultat COMBINÉ (`1−somme`, toujours proche de 1 dans ce cas,
 * jamais minuscule) est comparé à la saisie élève. Une tolérance absolue de 10⁻⁴ est donc sûre
 * PARTOUT dans ce générateur — voir `familleA.test.ts`/`familleB.test.ts` pour la vérification de
 * cette propriété par construction.
 */

const TOLERANCE = 1e-4;

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

/** Compare une liste d'entiers saisie en texte libre (ex. "3,4,5" ou "5, 4, 3") à une liste
 * d'entiers attendus, ORDRE INDIFFÉRENT — mirroir `diagnostiquerListeEntiers` de
 * `verificationLoiBinomiale.ts` (6gen50). */
function diagnostiquerListeEntiers(texte: string, attendus: number[]): StatutVerification {
  const tokens = texte
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return "parse_error";
  const valeurs: number[] = [];
  for (const t of tokens) {
    const v = evaluerValeurExponentielle(t);
    if (v === null) return "parse_error";
    valeurs.push(v);
  }
  if (valeurs.length !== attendus.length) return "not_equivalent";
  const restants = [...attendus];
  for (const v of valeurs) {
    const index = restants.findIndex((a) => Math.abs(a - v) < 1e-9);
    if (index === -1) return "not_equivalent";
    restants.splice(index, 1);
  }
  return "correct";
}

// ============================================================================
// Famille A — Approximation binomiale → Poisson.
// ============================================================================

const JETONS_BOOLEENS = ["vrai", "faux"];

/** Les 3 conditions d'approximation sont TOUJOURS vraies pour tout exercice généré par ce
 * générateur (`CANDIDATS_A` les respecte par construction, voir `generateurs6e/loiPoisson/
 * familleA.ts`) — l'élève confirme, il ne détecte jamais une condition violée. */
function diagnostiquerAEcran1(_e: ExerciceLoiPoissonA, valeurs: string[]): StatutVerification {
  if (valeurs.length !== 3 || valeurs.some((v) => !JETONS_BOOLEENS.includes(v))) return "parse_error";
  return valeurs.every((v) => v === "vrai") ? "correct" : "not_equivalent";
}

function diagnostiquerAEcran2(e: ExerciceLoiPoissonA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0] ?? "", e.lambda, TOLERANCE);
}

function diagnostiquerAEcran3(e: ExerciceLoiPoissonA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0] ?? "", e.probabilite, TOLERANCE);
}

export function diagnostiquerAEcran(e: ExerciceLoiPoissonA, phase: PhaseLoiPoisson, valeurs: string[]): StatutVerification {
  if (phase === "aEcran1") return diagnostiquerAEcran1(e, valeurs);
  if (phase === "aEcran2") return diagnostiquerAEcran2(e, valeurs);
  return diagnostiquerAEcran3(e, valeurs);
}

// ============================================================================
// Famille B — Application directe.
// ============================================================================

const OPTIONS_STRATEGIE = ["termeUnique", "somme", "complement"] as const;

function estEcran1Lambda(phase: PhaseLoiPoisson): boolean {
  return phase === "bTermeUniqueEcran1" || phase === "bSommeEcran1" || phase === "bComplementEcran1";
}
function estEcranIdentification(phase: PhaseLoiPoisson): boolean {
  return phase === "bSommeEcran2" || phase === "bComplementEcran2";
}

/** Écran λ — TOUJOURS le premier écran de la famille B, quelle que soit la stratégie. Piège
 * central : le taux de base brut (`e.tauxBase`) doit être REJETÉ, seul λ correctement mis à
 * l'échelle (`e.lambda`) est accepté — garanti testable car `e.facteurEchelle` n'est jamais 1 (voir
 * `generateurs6e/loiPoisson/familleB.ts`). */
function diagnostiquerBEcranLambda(e: ExerciceLoiPoissonB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0] ?? "", e.lambda, TOLERANCE);
}

function diagnostiquerStrategieEtTermes(strategieSaisie: string | undefined, texteTermes: string | undefined, strategieAttendue: StrategiePoissonB, termesAttendus: number[]): StatutVerification {
  if (!strategieSaisie || !OPTIONS_STRATEGIE.includes(strategieSaisie as (typeof OPTIONS_STRATEGIE)[number])) return "parse_error";
  const statutStrategie: StatutVerification = strategieSaisie === strategieAttendue ? "correct" : "not_equivalent";
  const statutTermes = diagnostiquerListeEntiers(texteTermes ?? "", termesAttendus);
  return combinerStatuts(statutStrategie, statutTermes);
}

/** Famille B, `strategie==="termeUnique"` — écran UNIQUE fusionnant identification ET calcul (voir
 * `core6e/loiPoisson.types.ts` pour la justification de cette fusion) : 3 champs [stratégie, terme
 * à calculer (k), valeur finale]. */
function diagnostiquerBTermeUniqueFinal(e: ExerciceLoiPoissonB, valeurs: string[]): StatutVerification {
  const statutIdentification = diagnostiquerStrategieEtTermes(valeurs[0], valeurs[1], e.strategie, e.termesACalculer);
  const statutValeur = diagnostiquerValeur(valeurs[2] ?? "", e.resultatFinal, TOLERANCE);
  return combinerStatuts(statutIdentification, statutValeur);
}

/** Famille B, `strategie==="somme"`/`"complement"` — écran d'identification séparé : 2 champs
 * [stratégie, terme(s) à calculer]. */
function diagnostiquerBIdentification(e: ExerciceLoiPoissonB, valeurs: string[]): StatutVerification {
  return diagnostiquerStrategieEtTermes(valeurs[0], valeurs[1], e.strategie, e.termesACalculer);
}

/** Famille B, `strategie==="somme"`/`"complement"` — écran de calcul final séparé : 1 champ [valeur
 * finale]. */
function diagnostiquerBFinal(e: ExerciceLoiPoissonB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0] ?? "", e.resultatFinal, TOLERANCE);
}

export function diagnostiquerBEcran(e: ExerciceLoiPoissonB, phase: PhaseLoiPoisson, valeurs: string[]): StatutVerification {
  if (estEcran1Lambda(phase)) return diagnostiquerBEcranLambda(e, valeurs);
  if (phase === "bTermeUniqueEcranFinal") return diagnostiquerBTermeUniqueFinal(e, valeurs);
  if (estEcranIdentification(phase)) return diagnostiquerBIdentification(e, valeurs);
  return diagnostiquerBFinal(e, valeurs);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceLoiPoisson, phase: PhaseLoiPoisson, valeurs: string[]): StatutVerification {
  return exercice.famille === "A" ? diagnostiquerAEcran(exercice, phase, valeurs) : diagnostiquerBEcran(exercice, phase, valeurs);
}

export function verifierEcran(exercice: ExerciceLoiPoisson, phase: PhaseLoiPoisson, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
