import type { ExerciceBaseQuellePrimitive, ExerciceQuellePrimitive } from "../core6e/quellePrimitive.types";
import type { PhaseCalculPrimitives } from "../moteur6e/typesCalculPrimitives";
import { phasesPourExercice as phasesPourExerciceBase } from "../moteur6e/typesCalculPrimitives";
import type { PhaseQuellePrimitive } from "../moteur6e/typesQuellePrimitive";
import { phasesPourExercice } from "../moteur6e/typesQuellePrimitive";
import type { ResultatExerciceQuellePrimitive } from "../moteur6e/typesQuellePrimitive";
import type { AideAvecLatex, ChampDef } from "./formatCalculPrimitives";
import {
  LIBELLE_FAMILLE,
  LIBELLE_PHASE as LIBELLE_PHASE_BASE,
  aideNiveau1 as aideNiveau1Base,
  aideNiveau2 as aideNiveau2Base,
  blocDonnees as blocDonneesBase,
  champsEcran as champsEcranBase,
  consigneEcran as consigneEcranBase,
  etatActuel as etatActuelBase,
  formatFractionLatex,
  formatReponseAttenduePhaseLatex as formatReponseAttenduePhaseLatexBase,
  primitiveLatexA,
  primitiveLatexB,
  primitiveLatexC,
  primitiveLatexG,
} from "./formatCalculPrimitives";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen24`. Pour les écrans
 * EMPRUNTÉS (familles A/B/C/G), délègue aux fonctions de dispatch DÉJÀ exportées par
 * `ui6e/formatCalculPrimitives.ts` (6gen23) — jamais réimplémentées : ces fonctions sont déjà
 * génériques (`exercice: ExerciceCalculPrimitives`, `phase: PhaseCalculPrimitives`) et notre
 * `exerciceBase`/nos phases empruntées en sont un sous-ensemble strictement assignable. Réutilise
 * aussi `primitiveLatexA/B/C/G` (jamais D/E/F) pour construire la primitive générale affichée sur
 * l'écran final, et `formatFractionLatex` pour afficher `a` en fraction EXACTE (jamais un décimal —
 * convention CLAUDE.md).
 *
 * ============================================================================
 * **Piège "signe orphelin" (CLAUDE.md, retour de revue 6gen23) — vigilance dès le départ ici**
 * ============================================================================
 * Toute fonction qui compose un terme additif signé doit renvoyer signe+magnitude ENSEMBLE, jamais
 * le signe seul (voir `termeAdditifDecimal` ci-dessous, jamais un `signe(...)` bare). Régression
 * dédiée : `formatQuellePrimitive.test.ts`, "aucun signe orphelin dans le LaTeX généré" — balaie de
 * nombreux tirages aléatoires des 12 variantes et cherche `+ $`/`- $` (fin d'expression) ou un
 * groupe vide type `\dfrac{}{...}` dans TOUT texte LaTeX produit par ce fichier.
 */

function primitiveLatexBase(exerciceBase: ExerciceBaseQuellePrimitive): string {
  switch (exerciceBase.famille) {
    case "A":
      return primitiveLatexA(exerciceBase);
    case "B":
      return primitiveLatexB(exerciceBase);
    case "C":
      return primitiveLatexC(exerciceBase);
    case "G":
      return primitiveLatexG(exerciceBase);
  }
}

function estPhaseBase(phase: PhaseQuellePrimitive): phase is PhaseCalculPrimitives {
  return phase !== "final";
}

/** Arrondi d'affichage (4 décimales, zéros de fin retirés) — utilisé UNIQUEMENT pour un nombre
 * RÉSULTAT DE CALCUL (C, valeur de F(x) substituée), jamais pour une valeur générée par la
 * plateforme (a, b — toujours des fractions/entiers exacts, voir `formatFractionLatex`). C peut être
 * irrationnel (famille C/G, ln/arctan en jeu) — spec explicite : "une constante C non entière ou
 * fractionnaire est acceptée sans difficulté". */
function formatDecimal(v: number): string {
  const r = Math.round(v * 10000) / 10000;
  return String(r === 0 ? 0 : r);
}

/** Terme additif signé COMPLET (signe + magnitude) pour un nombre DÉCIMAL/irrationnel — jamais le
 * signe seul (voir en-tête de fichier). Renvoie "" si `c` est nul (jamais un "+0" cosmétique). */
function termeAdditifDecimal(c: number): string {
  const r = Math.round(c * 10000) / 10000;
  if (r === 0) return "";
  return r < 0 ? ` - ${formatDecimal(-r)}` : ` + ${formatDecimal(r)}`;
}

function aLatex(exercice: ExerciceQuellePrimitive): string {
  return formatFractionLatex(exercice.aNum, exercice.aDen);
}

// ============================================================================
// Dispatch — écrans empruntés délégués tels quels, écran final géré ici.
// ============================================================================

export function consigneGeneraleQuellePrimitive(): string {
  return "Détermine la primitive F de f qui vérifie la condition initiale ci-dessous. Garde la constante C dans tous tes calculs jusqu'à l'étape finale — c'est elle qui te permettra de répondre à la toute dernière question.";
}

export function blocDonneesQuellePrimitive(exercice: ExerciceQuellePrimitive): string[] {
  return [...blocDonneesBase(exercice.exerciceBase), `F(${aLatex(exercice)})=${exercice.b}`];
}

export function consigneEcranQuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive): string {
  if (!estPhaseBase(phase)) {
    return "Substitue x=a dans la primitive générale trouvée (C compris), pose l'équation résultante égale à b, puis isole C. Donne la valeur de C, puis l'expression finale de F(x) avec C substituée.";
  }
  return consigneEcranBase(exercice.exerciceBase, phase);
}

/** Toutes les lignes "état actuel" confirmées par la chaîne EMPRUNTÉE, jusqu'à son tout dernier
 * écran INCLUS (celui-ci n'a normalement pas de ligne dédiée puisqu'il n'existe aucune phase
 * "après" côté 6gen23 pour la porter — sa réponse, la primitive de base, est ajoutée séparément
 * ci-dessous via `primitiveLatexBase`). Réutilisée pour que l'écran "final" de 6gen24 rappelle
 * TOUTES les réponses validées de la chaîne empruntée (du plus ancien au plus récent), pas
 * seulement le résultat de son tout dernier écran — audit transversal chapitre 4, bloc "état
 * actuel" cumulatif. */
function etatActuelChaineEmpruntee(exerciceBase: ExerciceBaseQuellePrimitive): string[] {
  const phasesBase = phasesPourExerciceBase(exerciceBase);
  const derniere = phasesBase[phasesBase.length - 1];
  if (!derniere) return [];
  return etatActuelBase(exerciceBase, derniere) ?? [];
}

export function etatActuelQuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive): string[] | null {
  if (!estPhaseBase(phase)) {
    return [...etatActuelChaineEmpruntee(exercice.exerciceBase), `F(x)=${primitiveLatexBase(exercice.exerciceBase)}+C`, `F(${aLatex(exercice)})=${exercice.b}`];
  }
  return etatActuelBase(exercice.exerciceBase, phase);
}

export function champsQuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive): ChampDef[] {
  if (!estPhaseBase(phase)) {
    return [
      { label: "C =", placeholder: "ex : 5/2" },
      { label: "F(x) =", placeholder: "ex : x²+5/2" },
    ];
  }
  return champsEcranBase(exercice.exerciceBase, phase);
}

export function aideNiveau1QuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive): AideAvecLatex {
  if (!estPhaseBase(phase)) {
    return { texte: "Remplace x par a dans l'expression générale de F(x) (C compris), puis pose cette expression égale à b.", latex: null };
  }
  return aideNiveau1Base(exercice.exerciceBase, phase);
}

export function aideNiveau2QuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive): AideAvecLatex {
  if (!estPhaseBase(phase)) {
    return { texte: "Équation à résoudre en C (résolution non faite) :", latex: `F(${aLatex(exercice)})+C=${exercice.b}` };
  }
  return aideNiveau2Base(exercice.exerciceBase, phase);
}

export const LIBELLE_PHASE: Record<PhaseQuellePrimitive, string> = {
  ...LIBELLE_PHASE_BASE,
  final: "Étape finale (condition initiale)",
};

/** Récapitulatif final : réutilise `formatReponseAttenduePhaseLatex` de 6gen23 pour les écrans
 * empruntés — retourne déjà "F(x)=primitive+C" pour une phase finale de famille, ou un libellé
 * TEXTE déjà enveloppé en `\text{...}` pour un écran intermédiaire (`formatCalculPrimitives.ts`,
 * corrigé lors de l'audit transversal chapitre 4 — un `<Katex>` nu y rendait ce libellé en mode
 * MATH, collant les mots et gommant les espaces : "Écran1(substitution)") —, jamais réenveloppé ici
 * une seconde fois. Ajoute la ligne propre à l'écran final (C résolu + F(x) complet), toujours
 * dérivée de `exerciceBase.primitiveReference` — jamais recalculée depuis une saisie élève
 * (CLAUDE.md). */
export function formatReponseAttenduePhaseLatexQuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive): string[] {
  if (!estPhaseBase(phase)) {
    const cExact = exercice.b - exercice.exerciceBase.primitiveReference(exercice.a);
    return [`C \\approx ${formatDecimal(cExact)}`, `F(x)=${primitiveLatexBase(exercice.exerciceBase)}${termeAdditifDecimal(cExact)}`];
  }
  return formatReponseAttenduePhaseLatexBase(exercice.exerciceBase, phase);
}

/** Total points du récapitulatif final — maximum VARIABLE (100 × nombre d'écrans réellement
 * traversés, écran final INCLUS — de 200 à 500 selon la famille/le sous-type emprunté). */
export function calculerTotalPointsQuellePrimitive(resultat: ResultatExerciceQuellePrimitive): { total: number; maximum: number } {
  const phases = phasesPourExercice(resultat.exercice);
  const total = phases.reduce((acc, phase) => acc + (resultat.scores[phase] ?? 0), 0);
  return { total, maximum: phases.length * 100 };
}

export { LIBELLE_FAMILLE };
export type { AideAvecLatex, ChampDef };
