import type { ElementsConiqueCentree, ExerciceConiqueA1, ExerciceConiqueA2, ExerciceConiqueB, ExerciceConiqueC, ExerciceIdentificationConiques, NatureConique } from "../core6e/identificationConiques.types";
import { diagnostiquerEnsembleValeurs, diagnostiquerValeur } from "./equivalenceExponentielle";
import { diagnostiquerEquivalenceQuadratiqueXY, uneStructureCarreParfaitExplicite, uneStructureDeuxCarresValide } from "./expressionQuadratiqueXY";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseIdentificationConiques } from "./typesIdentificationConiques";

/**
 * Couche B (6e) — vérification propre à `6gen58` (dispatch par famille/sous-type/écran). N'importe
 * JAMAIS rien de `src/generateurs6e/` (règle non négociable, CLAUDE.md) — voir
 * `generateurs6e/identificationConiques/session.integration.test.ts` pour le seul fichier autorisé
 * Couche A + Couche B ensemble.
 *
 * `idDeNature` DUPLIQUE délibérément `natureVersId` de
 * `generateurs6e/identificationConiques/classification.ts` (Couche A, jamais importable ici) — même
 * principe que `pgcd` dupliqué dans chaque `ui6e/formatXxx.ts` du projet : une petite fonction pure,
 * sans état, dont la duplication coûte moins cher que la violation de la séparation des couches.
 *
 * Toutes les valeurs attendues NUMÉRIQUES sont déjà PRÉ-CALCULÉES par la Couche A sur l'exercice
 * (voir en-tête `core6e/identificationConiques.types.ts`) — comparées via `diagnostiquerValeur`
 * (`moteur6e/equivalenceExponentielle.ts`, tolérance 0.01, réutilisée telle quelle — déjà éprouvée
 * par plusieurs chapitres 6e). Les champs de CHOIX (catégorie probable, statut structuré, même/autre
 * variable, orientation, signes) comparent directement l'identifiant choisi
 * (`correct`/`not_equivalent` uniquement, jamais `parse_error` — pas de saisie libre possible sur
 * ces champs). Les champs de TEXTE LIBRE algébrique (famille B écran 1, famille C écrans 1-3)
 * passent par `expressionQuadratiqueXY.ts` (échantillonnage numérique + garde structurelle).
 */

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

function diagnostiquerValeurs(valeurs: string[], attendues: number[]): StatutVerification {
  return combinerStatuts(...attendues.map((v, i) => diagnostiquerValeur(valeurs[i] ?? "", v)));
}

function diagnostiquerChoix(valeur: string | undefined, attendu: string): StatutVerification {
  return valeur === attendu ? "correct" : "not_equivalent";
}

/** DUPLIQUÉE depuis `classification.ts` (`natureVersId`) — voir en-tête de fichier. */
function idDeNature(nature: NatureConique): string {
  switch (nature.type) {
    case "ellipse":
      return nature.axe === "horizontal" ? "ellipseHorizontal" : "ellipseVertical";
    case "hyperbole":
      return nature.axe === "horizontal" ? "hyperboleHorizontal" : "hyperboleVertical";
    case "cercle":
      return "cercle";
    case "parabole":
      return nature.orientation === "droite" ? "paraboleDroite" : nature.orientation === "gauche" ? "paraboleGauche" : nature.orientation === "haut" ? "paraboleHaut" : "paraboleBas";
    case "vide":
      return "vide";
    case "point":
      return "point";
    case "droitesParalleles":
      return "droitesParalleles";
    case "droitesSecantes":
      return "droitesSecantes";
  }
}

/** Écran "éléments caractéristiques", COMMUN aux familles A1/B/C (mêmes champs numériques selon
 * `nature.type` — voir `core6e/identificationConiques.types.ts`, `ElementsConiqueCentree`). Jamais
 * appelé sur une nature dégénérée (garanti par `phaseApres`, `typesIdentificationConiques.ts`, qui
 * ne fait jamais atteindre cet écran dans ce cas). */
function diagnostiquerElements(nature: NatureConique, elements: ElementsConiqueCentree, valeurs: string[]): StatutVerification {
  if (nature.type === "cercle") return diagnostiquerValeurs(valeurs, [elements.rayon as number]);
  if (nature.type === "ellipse") return diagnostiquerValeurs(valeurs, [elements.a as number, elements.b as number, elements.c as number]);
  if (nature.type === "hyperbole") return diagnostiquerValeurs(valeurs, [elements.a as number, elements.b as number, elements.c as number, elements.pente as number]);
  /* c8 ignore next */
  throw new Error("diagnostiquerElements : nature dégénérée n'a pas d'éléments caractéristiques");
}

// ============================================================================
// Famille A, sous-type 1 — centree2Carres.
// ============================================================================

function diagnostiquerA1(exercice: ExerciceConiqueA1, phase: PhaseIdentificationConiques, valeurs: string[]): StatutVerification {
  if (phase === "a1Ecran1") return diagnostiquerChoix(valeurs[0], exercice.categorieProbable);
  if (phase === "a1Ecran2") return diagnostiquerChoix(valeurs[0], idDeNature(exercice.nature));
  return diagnostiquerElements(exercice.nature, exercice.elements, valeurs);
}

// ============================================================================
// Famille A, sous-type 2 — unCarreUnLineaire.
// ============================================================================

function diagnostiquerA2(exercice: ExerciceConiqueA2, phase: PhaseIdentificationConiques, valeurs: string[]): StatutVerification {
  if (phase === "a2Ecran1") return diagnostiquerChoix(valeurs[0], exercice.memeVariable ? "meme" : "autre");
  if (phase === "a2Ecran2") {
    if (exercice.memeVariable) return diagnostiquerEnsembleValeurs(valeurs, [0, exercice.autreRacine as number]);
    return combinerStatuts(diagnostiquerValeur(valeurs[0] ?? "", exercice.quatrePSigne as number), diagnostiquerChoix(valeurs[1], idDeNature(exercice.nature)));
  }
  const foyer = exercice.foyer as { x: number; y: number };
  return diagnostiquerValeurs(valeurs, [foyer.x, foyer.y, exercice.directrice as number]);
}

// ============================================================================
// Famille B.
// ============================================================================

function cibleDeveloppeeB(exercice: ExerciceConiqueB): (x: number, y: number) => number {
  return (x, y) => exercice.A * x * x + exercice.B * y * y + exercice.D * x + exercice.E * y + exercice.F;
}

/** Écran 1 famille B — garde structurelle EN PLUS de l'équivalence algébrique (voir en-tête
 * `expressionQuadratiqueXY.ts` : sans elle, une recopie de l'équation de départ serait acceptée à
 * tort, l'équation développée étant par construction algébriquement identique à sa propre forme
 * complétée). */
export function diagnostiquerFormeIntermediaireB(exercice: ExerciceConiqueB, texte: string): StatutVerification {
  const equivalence = diagnostiquerEquivalenceQuadratiqueXY(texte, exercice.centre.x, exercice.centre.y, cibleDeveloppeeB(exercice));
  if (equivalence !== "correct") return equivalence;
  return uneStructureDeuxCarresValide(texte) ? "correct" : "not_equivalent";
}

function signeMot(v: number): "positif" | "negatif" | "nul" {
  if (v > 0) return "positif";
  if (v < 0) return "negatif";
  return "nul";
}

function diagnostiquerB(exercice: ExerciceConiqueB, phase: PhaseIdentificationConiques, valeurs: string[]): StatutVerification {
  if (phase === "bEcran1") return diagnostiquerFormeIntermediaireB(exercice, valeurs[0] ?? "");
  if (phase === "bEcran2") {
    return combinerStatuts(diagnostiquerChoix(valeurs[0], signeMot(exercice.A)), diagnostiquerChoix(valeurs[1], signeMot(exercice.B)), diagnostiquerChoix(valeurs[2], signeMot(exercice.M)));
  }
  if (phase === "bEcran3") return diagnostiquerChoix(valeurs[0], idDeNature(exercice.nature));
  return diagnostiquerElements(exercice.nature, exercice.elements, valeurs);
}

// ============================================================================
// Famille C.
// ============================================================================

/** `(v_isolee-k)² - m²·(a2·v_racine²+a1·v_racine+a0)` — référence de vérité PARTAGÉE par les écrans
 * 1 ET 2 (les 2 formes intermédiaires sont, par construction, algébriquement identiques — voir
 * `generateurs6e/identificationConiques/familleC.ts`). */
function cibleCarreC(exercice: ExerciceConiqueC): (x: number, y: number) => number {
  return (x, y) => {
    const v = exercice.variableRacine === "x" ? x : y;
    const iso = exercice.variableIsolee === "x" ? x : y;
    return (iso - exercice.k) * (iso - exercice.k) - exercice.m * exercice.m * (exercice.a2 * v * v + exercice.a1 * v + exercice.a0);
  };
}

export function diagnostiquerEquationAuCarreC(exercice: ExerciceConiqueC, texte: string): StatutVerification {
  return diagnostiquerEquivalenceQuadratiqueXY(texte, exercice.centre.x, exercice.centre.y, cibleCarreC(exercice));
}

/** Écran 2 famille C — garde structurelle PLUS LÉGÈRE que la famille B : exige seulement qu'un
 * carré parfait explicite en `variableRacine` (LA variable sous la racine dans l'énoncé, pas celle
 * isolée à gauche — piège central de l'écran, mission) apparaisse quelque part ; l'autre membre est
 * déjà un carré parfait TRIVIAL (`(v_isolee-k)²`, jamais "à compléter" une 2ᵉ fois). */
export function diagnostiquerFormeCompleteeC(exercice: ExerciceConiqueC, texte: string): StatutVerification {
  const equivalence = diagnostiquerEquivalenceQuadratiqueXY(texte, exercice.centre.x, exercice.centre.y, cibleCarreC(exercice));
  if (equivalence !== "correct") return equivalence;
  return uneStructureCarreParfaitExplicite(texte, exercice.variableRacine) ? "correct" : "not_equivalent";
}

/** `coeffX(x-h')²+coeffY(y-k')²-M` — jamais `coeffX·x²+coeffY·y²-M` (bare) : `centre` de la famille C
 * n'est généralement PAS l'origine (contrairement à la famille A sous-type 1), oubli source d'un
 * vrai bug trouvé et corrigé pendant le développement (`docs/historique-6e.md`). */
function cibleStandardC(exercice: ExerciceConiqueC): (x: number, y: number) => number {
  return (x, y) => exercice.coeffX * (x - exercice.centre.x) ** 2 + exercice.coeffY * (y - exercice.centre.y) ** 2 - exercice.M;
}

function diagnostiquerC(exercice: ExerciceConiqueC, phase: PhaseIdentificationConiques, valeurs: string[]): StatutVerification {
  if (phase === "cEcran1") return diagnostiquerEquationAuCarreC(exercice, valeurs[0] ?? "");
  if (phase === "cEcran2") return diagnostiquerFormeCompleteeC(exercice, valeurs[0] ?? "");
  if (phase === "cEcran3") {
    const statutChoix = diagnostiquerChoix(valeurs[0], idDeNature(exercice.nature));
    const statutForme = diagnostiquerEquivalenceQuadratiqueXY(valeurs[1] ?? "", exercice.centre.x, exercice.centre.y, cibleStandardC(exercice));
    return combinerStatuts(statutChoix, statutForme);
  }
  return diagnostiquerElements(exercice.nature, exercice.elements, valeurs);
}

// ============================================================================
// Dispatcher générique.
// ============================================================================

export function diagnostiquerEcran(exercice: ExerciceIdentificationConiques, phase: PhaseIdentificationConiques, valeurs: string[]): StatutVerification {
  if (exercice.famille === "A") {
    return exercice.sousType === "centree2Carres" ? diagnostiquerA1(exercice, phase, valeurs) : diagnostiquerA2(exercice, phase, valeurs);
  }
  if (exercice.famille === "B") return diagnostiquerB(exercice, phase, valeurs);
  return diagnostiquerC(exercice, phase, valeurs);
}

export function verifierEcran(exercice: ExerciceIdentificationConiques, phase: PhaseIdentificationConiques, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
