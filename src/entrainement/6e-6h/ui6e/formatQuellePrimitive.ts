import type { ExerciceBaseQuellePrimitive, ExerciceQuellePrimitive } from "../core6e/quellePrimitive.types";
import type { PhaseCalculPrimitives } from "../moteur6e/typesCalculPrimitives";
import { phasesPourExercice as phasesPourExerciceBase } from "../moteur6e/typesCalculPrimitives";
import type { PhaseQuellePrimitive } from "../moteur6e/typesQuellePrimitive";
import type { AideAvecLatex, ChampDef, FragmentConsigne } from "./formatCalculPrimitives";
import { decimalLatex, egalExactPuisApproche, valeurExacteLatex } from "./formatMonome";
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

/** Texte brut mêlé à du LaTeX inline court — mêmes fragments que `formatCalculPrimitives.ts`
 * (importés en tant que type seulement ; `texte`/`latex` restent dupliqués ici à dessein,
 * convention CLAUDE.md). */
function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

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

/** C = b − F(a), toujours calculé depuis la référence (jamais depuis une saisie). */
function cAttendu(exercice: ExerciceQuellePrimitive): number {
  return exercice.b - exercice.exerciceBase.primitiveReference(exercice.a);
}

/** Terme additif « + C » écrit avec la valeur de C : forme EXACTE si elle est reconnue (audit P16 :
 * « + 1.6137 » avec un point décimal), sinon décimale arrondie au centième précédée de « ≈ » dans
 * l'égalité (voir `formatReponseAttenduePhaseLatexQuellePrimitive`). "" si C = 0. */
function termeAdditifC(c: number): { terme: string; exact: boolean } {
  const exacte = valeurExacteLatex(c);
  if (exacte === "0" || Math.abs(c) < 1e-12) return { terme: "", exact: true };
  if (exacte !== null) {
    if (exacte.startsWith("-")) return { terme: ` - ${exacte.slice(1)}`, exact: true };
    return { terme: ` + ${exacte}`, exact: true };
  }
  return { terme: c < 0 ? ` - ${decimalLatex(-c, 2)}` : ` + ${decimalLatex(c, 2)}`, exact: false };
}

function aLatex(exercice: ExerciceQuellePrimitive): string {
  return formatFractionLatex(exercice.aNum, exercice.aDen);
}

function borneLatex(v: number | null | undefined, cote: "gauche" | "droite"): string {
  if (v === null || v === undefined) return cote === "gauche" ? "-\\infty" : "+\\infty";
  return valeurExacteLatex(v) ?? decimalLatex(v, 2);
}

/** « x ∈ ]p ; q[ » si f n'est pas définie sur ℝ tout entier (audit décision C), sinon null. */
export function intervalleLatexQuellePrimitive(exercice: ExerciceQuellePrimitive): string | null {
  if (exercice.intervalleGauche === undefined && exercice.intervalleDroite === undefined) return null;
  return `x\\in\\,\\left]${borneLatex(exercice.intervalleGauche, "gauche")}\\,;${borneLatex(exercice.intervalleDroite, "droite")}\\right[`;
}

function conditionLatex(exercice: ExerciceQuellePrimitive): string {
  const intervalle = intervalleLatexQuellePrimitive(exercice);
  return `F(${aLatex(exercice)})=${exercice.b}${intervalle ? `,\\qquad ${intervalle}` : ""}`;
}

// ============================================================================
// Dispatch — écrans empruntés délégués tels quels, écran final géré ici.
// ============================================================================

export function consigneGeneraleQuellePrimitive(): FragmentConsigne[] {
  return [
    texte("Détermine la primitive F de f qui vérifie la condition initiale ci-dessous. Écris d'abord la primitive générale, avec sa constante "),
    latex("C"),
    texte(", puis utilise la condition initiale pour trouver "),
    latex("C"),
    texte("."),
  ];
}

export function blocDonneesQuellePrimitive(exercice: ExerciceQuellePrimitive): string[] {
  return [...blocDonneesBase(exercice.exerciceBase), conditionLatex(exercice)];
}

export function consigneEcranQuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive): FragmentConsigne[] {
  if (!estPhaseBase(phase)) {
    return [
      texte("Remplace x par "),
      latex(aLatex(exercice)),
      texte(" dans "),
      latex("F(x)+C"),
      texte(", pose l'égalité avec "),
      latex(`${exercice.b}`),
      texte(" et isole "),
      latex("C"),
      texte(" (valeur exacte ou arrondie au centième). Écris ensuite "),
      latex("F(x)"),
      texte(" en remplaçant "),
      latex("C"),
      texte(" par sa valeur."),
    ];
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
    return [...etatActuelChaineEmpruntee(exercice.exerciceBase), `F(x)=${primitiveLatexBase(exercice.exerciceBase)}+C`, conditionLatex(exercice)];
  }
  return etatActuelBase(exercice.exerciceBase, phase);
}

export function champsQuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive): ChampDef[] {
  if (!estPhaseBase(phase)) {
    return [
      { label: "C =", placeholder: "ex : 7−ln(9)" },
      { label: "F(x) (avec la valeur de C) =", placeholder: "ex : 9x^7+7−ln(9)" },
    ];
  }
  return champsEcranBase(exercice.exerciceBase, phase);
}

export function aideNiveau1QuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive): AideAvecLatex {
  if (!estPhaseBase(phase)) {
    return { texte: "Condition initiale à traduire en équation d'inconnue C :", latex: `F(${aLatex(exercice)})=${exercice.b}\\quad\\Longleftrightarrow\\quad \\Big[\\,${primitiveLatexBase(exercice.exerciceBase)}+C\\,\\Big]_{x=${aLatex(exercice)}}=${exercice.b}` };
  }
  return aideNiveau1Base(exercice.exerciceBase, phase);
}

export function aideNiveau2QuellePrimitive(exercice: ExerciceQuellePrimitive, phase: PhaseQuellePrimitive): AideAvecLatex {
  if (!estPhaseBase(phase)) {
    const valeurF = exercice.exerciceBase.primitiveReference(exercice.a);
    const valeurLatex = valeurExacteLatex(valeurF) ?? decimalLatex(valeurF, 3);
    return { texte: "Valeur de la primitive (sans C) en ce point — il reste à isoler C :", latex: `${valeurLatex}+C=${exercice.b}` };
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
    const c = cAttendu(exercice);
    const { terme, exact } = termeAdditifC(c);
    return [`C ${egalExactPuisApproche(c, 2)}`, `F(x)${exact ? "=" : "\\approx "}${primitiveLatexBase(exercice.exerciceBase)}${terme}`];
  }
  return formatReponseAttenduePhaseLatexBase(exercice.exerciceBase, phase);
}

export { LIBELLE_FAMILLE };
export type { AideAvecLatex, ChampDef };
