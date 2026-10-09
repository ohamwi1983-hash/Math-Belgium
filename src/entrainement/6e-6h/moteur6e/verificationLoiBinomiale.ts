import type { ExerciceLoiBinomiale, ExerciceLoiBinomialeA, ExerciceLoiBinomialeB, ExerciceLoiBinomialeC } from "../core6e/loiBinomiale.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEquivalenceFonction, diagnostiquerValeur, separerEquationTexte } from "./equivalenceExponentielle";
import { evaluerValeurExponentielle } from "./expressionExponentielle";
import type { PhaseLoiBinomiale } from "./typesLoiBinomiale";

/**
 * Couche B (6e) — vérification propre à `6gen50` (dispatch par famille/phase). N'importe JAMAIS
 * rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/loiBinomiale/session.integration.test.ts` pour le seul fichier autorisé
 * Couche A + Couche B ensemble.
 *
 * **Famille B** — mêmes fonctions de vérification que `verificationBinomialeSequenceOrdonnee.ts`
 * (6gen48, écrans "stratégie+termes"/"calcul des termes"/"combinaison") RÉPLIQUÉES ici (petits
 * helpers `combinerStatuts`/`diagnostiquerListeEntiers`/`diagnostiquerValeurs` non exportés
 * là-bas — duplication assumée, mirroir `comparateur.ts` entre générateurs) plutôt que couplées :
 * chaque générateur garde son propre moteur, CLAUDE.md.
 *
 * **Famille C** — piège du sens de l'inégalité (`ln(1-p)<0`, toujours) : réutilise la PHILOSOPHIE de
 * vérification déjà établie par `verificationInequationsLogarithmiques.ts` (6gen15, famille D
 * `diagnostiquerDReecrire`) — comparer LHS/RHS séparément par échantillonnage numérique PUIS le
 * SYMBOLE de comparaison à part — jamais son code (la forme algébrique diffère : ici `n` est
 * l'exposant, jamais une variable affine). Écran 3 (valeur finale de `n`) compare directement à
 * `exercice.valeurN`, PRÉ-CALCULÉ par la Couche A (`generateurs6e/loiBinomiale/familleC.ts`).
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerValeurs(valeurs: string[], attendues: number[]): StatutVerification {
  if (valeurs.length !== attendues.length) return "not_equivalent";
  return combinerStatuts(...attendues.map((v, i) => diagnostiquerValeur(valeurs[i] ?? "", v)));
}

/** Compare une liste d'entiers saisie en texte libre à une liste d'entiers attendus, ORDRE
 * INDIFFÉRENT — mirroir `diagnostiquerListeEntiers` de `verificationBinomialeSequenceOrdonnee.ts`. */
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
// Famille A — Justifier qu'une variable suit une loi binomiale.
// ============================================================================

export function diagnostiquerAEcran1(e: ExerciceLoiBinomialeA, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [e.n, e.p]);
}

const JETONS_BOOLEENS = ["vrai", "faux"];

/** Les 4 conditions du schéma de Bernoulli répété sont TOUJOURS vraies pour tout exercice généré
 * par ce générateur (chaque contexte de la banque respecte les 4 par construction) — l'élève
 * confirme, il ne détecte jamais une condition violée. */
export function diagnostiquerAEcran2(_e: ExerciceLoiBinomialeA, valeurs: string[]): StatutVerification {
  if (valeurs.length !== 4 || valeurs.some((v) => !JETONS_BOOLEENS.includes(v))) return "parse_error";
  return valeurs.every((v) => v === "vrai") ? "correct" : "not_equivalent";
}

export function diagnostiquerAEcran(e: ExerciceLoiBinomialeA, phase: PhaseLoiBinomiale, valeurs: string[]): StatutVerification {
  return phase === "aEcran1" ? diagnostiquerAEcran1(e, valeurs) : diagnostiquerAEcran2(e, valeurs);
}

// ============================================================================
// Famille B — Calculs directs (réutilise 6gen48).
// ============================================================================

const OPTIONS_STRATEGIE = ["termeUnique", "somme", "complement"] as const;
const TOLERANCE_ESPERANCE = 0.01;

function diagnostiquerBEcran1(e: ExerciceLoiBinomialeB, valeurs: string[]): StatutVerification {
  const strategieSaisie = valeurs[0];
  if (!OPTIONS_STRATEGIE.includes(strategieSaisie as (typeof OPTIONS_STRATEGIE)[number])) return "not_equivalent";
  const statutStrategie: StatutVerification = strategieSaisie === e.strategie ? "correct" : "not_equivalent";
  const statutListe = diagnostiquerListeEntiers(valeurs[1] ?? "", e.termesACalculer);
  return combinerStatuts(statutStrategie, statutListe);
}

function diagnostiquerBEcran2(e: ExerciceLoiBinomialeB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, e.valeursTermes);
}

function diagnostiquerBEcran3(e: ExerciceLoiBinomialeB, valeurs: string[]): StatutVerification {
  return diagnostiquerValeurs(valeurs, [e.resultatFinal]);
}

const OPTIONS_INTERPRETATION_ESPERANCE = ["correcte", "probabiliteExacte", "maximumPossible", "certitude"] as const;

/** Écran supplémentaire (nouveau) — `E(X)=n·p` + interprétation QCM. `"correcte"` = seule bonne
 * réponse (« nombre MOYEN de succès attendu si l'on répète l'expérience un grand nombre de fois »),
 * les 3 autres id sont des distracteurs plausibles (confond E(X) avec une probabilité ponctuelle, un
 * maximum, ou une certitude). */
function diagnostiquerBEsperance(e: ExerciceLoiBinomialeB, valeurs: string[]): StatutVerification {
  const statutValeur = diagnostiquerValeur(valeurs[0] ?? "", e.esperance, TOLERANCE_ESPERANCE);
  const interpretation = valeurs[1];
  if (!OPTIONS_INTERPRETATION_ESPERANCE.includes(interpretation as (typeof OPTIONS_INTERPRETATION_ESPERANCE)[number])) return combinerStatuts(statutValeur, "parse_error");
  const statutInterpretation: StatutVerification = interpretation === "correcte" ? "correct" : "not_equivalent";
  return combinerStatuts(statutValeur, statutInterpretation);
}

function estEcran1B(phase: PhaseLoiBinomiale): boolean {
  return phase === "bTermeUniqueEcran1" || phase === "bSommeEcran1" || phase === "bComplementEcran1";
}
function estEcran2B(phase: PhaseLoiBinomiale): boolean {
  return phase === "bTermeUniqueEcran2" || phase === "bSommeEcran2" || phase === "bComplementEcran2";
}
function estEcran3B(phase: PhaseLoiBinomiale): boolean {
  return phase === "bSommeEcran3" || phase === "bComplementEcran3";
}
export function diagnostiquerBEcran(e: ExerciceLoiBinomialeB, phase: PhaseLoiBinomiale, valeurs: string[]): StatutVerification {
  if (estEcran1B(phase)) return diagnostiquerBEcran1(e, valeurs);
  if (estEcran2B(phase)) return diagnostiquerBEcran2(e, valeurs);
  if (estEcran3B(phase)) return diagnostiquerBEcran3(e, valeurs);
  return diagnostiquerBEsperance(e, valeurs);
}

// ============================================================================
// Famille C — Trouver n via logarithme, piège du sens de l'inégalité.
// ============================================================================

const POINTS_N = [1, 2, 3, 5, 8, 12, 20, 40, 80, 150];
const TOLERANCE_C = 0.001;

function symbolesEquivalents(symbole: string, attendu: ">" | "<"): boolean {
  const NORMALISE: Record<string, string> = { "<": "<", ">": ">" };
  return NORMALISE[symbole] === attendu;
}

function diagnostiquerInequationTexte(texte: string, referenceGauche: (n: number) => number, referenceDroite: (n: number) => number, symboleAttendu: ">" | "<"): StatutVerification {
  const separe = separerEquationTexte(texte);
  if (separe === null) return "parse_error";
  const statutGauche = diagnostiquerEquivalenceFonction(separe.gauche, referenceGauche, POINTS_N, TOLERANCE_C, "n");
  if (statutGauche === "parse_error") return "parse_error";
  const statutDroite = diagnostiquerEquivalenceFonction(separe.droite, referenceDroite, POINTS_N, TOLERANCE_C, "n");
  if (statutDroite === "parse_error") return "parse_error";
  if (statutGauche === "not_equivalent" || statutDroite === "not_equivalent") return "not_equivalent";
  if (!symbolesEquivalents(separe.symbole, symboleAttendu)) return "not_equivalent";
  return "correct";
}

/** Écran 1 — poser `1-(1-p)^n > seuil`. */
export function diagnostiquerCEcran1(e: ExerciceLoiBinomialeC, texte: string): StatutVerification {
  return diagnostiquerInequationTexte(texte, (n) => 1 - (1 - e.p) ** n, () => e.seuil, ">");
}

/** Écran 2 — isoler `(1-p)^n < 1-seuil` (PIÈGE : sens inversé par rapport à l'écran 1, car on a
 * multiplié les deux membres par -1 en isolant le terme en `n`). */
export function diagnostiquerCEcran2(e: ExerciceLoiBinomialeC, texte: string): StatutVerification {
  return diagnostiquerInequationTexte(texte, (n) => (1 - e.p) ** n, () => 1 - e.seuil, "<");
}

/** Écran 3 — valeur finale de `n` (entier, arrondi au supérieur) — comparée DIRECTEMENT à
 * `exercice.valeurN`, déjà pré-calculé Couche A. Piège CENTRAL : diviser par `ln(1-p)` (toujours
 * négatif) sans inverser le sens conduit à arrondir vers le BAS (`floor`) au lieu du HAUT (`ceil`) —
 * rejeté ici par simple égalité stricte avec la valeur correcte. */
export function diagnostiquerCEcran3(e: ExerciceLoiBinomialeC, texte: string): StatutVerification {
  return diagnostiquerValeur(texte, e.valeurN, 1e-6);
}

export function diagnostiquerCEcran(e: ExerciceLoiBinomialeC, phase: PhaseLoiBinomiale, valeurs: string[]): StatutVerification {
  if (phase === "cEcran1") return diagnostiquerCEcran1(e, valeurs[0] ?? "");
  if (phase === "cEcran2") return diagnostiquerCEcran2(e, valeurs[0] ?? "");
  return diagnostiquerCEcran3(e, valeurs[0] ?? "");
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceLoiBinomiale, phase: PhaseLoiBinomiale, valeurs: string[]): StatutVerification {
  if (exercice.famille === "A") return diagnostiquerAEcran(exercice, phase, valeurs);
  if (exercice.famille === "B") return diagnostiquerBEcran(exercice, phase, valeurs);
  return diagnostiquerCEcran(exercice, phase, valeurs);
}

export function verifierEcran(exercice: ExerciceLoiBinomiale, phase: PhaseLoiBinomiale, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
