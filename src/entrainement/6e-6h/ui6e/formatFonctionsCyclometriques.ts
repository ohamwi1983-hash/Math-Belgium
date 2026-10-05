import type { Arcfonction, Trigfonction, ValeurExacte } from "../core6e/cyclometrique.types";
import type { ExerciceFonctionsCyclometriques } from "../core6e/fonctionsCyclometriques.types";

/**
 * Textes de consigne/aide pour `6gen2` (REFONTE TOTALE). `src/ui6e/` peut dépendre de
 * `src/core6e/` (sens autorisé, voir CLAUDE.md Architecture). Toute aide qui doit montrer une
 * formule renvoie `{texte, latex}` (`latex` rendu via `<Katex block>`, `null` si rien à montrer).
 *
 * 2 niveaux d'aide UNIQUEMENT (spec), focalisés sur l'EXISTENCE — jamais sur le calcul de la
 * valeur finale elle-même (déjà pratiqué par d'autres générateurs du chapitre) :
 * (1) rappel de la condition à vérifier en premier ;
 * (2) cette condition déjà appliquée et son résultat indiqué — SANS jamais donner la conclusion
 *     finale (Existe/N'existe pas) ni la valeur demandée.
 */
export const CONSIGNE_GENERALE = "Cette expression existe-t-elle ? Si oui, donne sa valeur exacte.";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

const NOM_LATEX: Record<Arcfonction, string> = { arcsin: "\\arcsin", arccos: "\\arccos", arctan: "\\arctan" };
const NOM_FRANCAIS: Record<Arcfonction, string> = { arcsin: "arcsin", arccos: "arccos", arctan: "arctan" };
const NOM_TRIG_LATEX: Record<Trigfonction, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };
const NOM_TRIG_FRANCAIS: Record<Trigfonction, string> = { sin: "sinus", cos: "cosinus", tan: "tangente" };

// ============================================================================
// Expression affichée (bloc données) — un seul bloc KaTeX, jamais le détail du calcul composite.
// ============================================================================

export function formatExpressionLatex(exercice: ExerciceFonctionsCyclometriques): string {
  switch (exercice.variante) {
    case "directe":
      return `${NOM_LATEX[exercice.arcfonction]}\\left(${exercice.nombreLatex}\\right)`;
    case "arcTrig":
      return `${NOM_LATEX[exercice.arcfonction]}\\left(${NOM_TRIG_LATEX[exercice.trigfonction]}\\left(${exercice.theta.angle.latex}\\right)\\right)`;
    case "trigArc":
      return `${NOM_TRIG_LATEX[exercice.trigfonction]}\\left(${NOM_LATEX[exercice.arcfonction]}\\left(${exercice.nombreLatex}\\right)\\right)`;
  }
}

// ============================================================================
// Aide niveau 1 — rappel de LA condition à vérifier en premier, selon le type d'expression.
// ============================================================================

function phraseDomaine(arcfonction: Arcfonction, sujet: string): string {
  if (arcfonction === "arctan") return "arctan est définie pour tout nombre réel : aucune condition de domaine à vérifier ici.";
  return `Vérifie que ${sujet} appartient à l'intervalle [-1;1] (domaine de ${NOM_FRANCAIS[arcfonction]}).`;
}

/** Combinaisons `tan∘arccos`/`tan∘arcsin` SEULES à avoir une 2e condition (angle intermédiaire =
 * π/2) — jamais `sin`/`cos` (toujours définis), jamais `arctan` en entrée (image ouverte, exclut
 * ±π/2 par construction). */
function aUneSecondeCondition(exercice: Extract<ExerciceFonctionsCyclometriques, { variante: "trigArc" }>): boolean {
  return exercice.trigfonction === "tan" && exercice.arcfonction !== "arctan";
}

export function aideNiveau1(exercice: ExerciceFonctionsCyclometriques): AideAvecLatex {
  switch (exercice.variante) {
    case "directe":
      return { texte: phraseDomaine(exercice.arcfonction, "ce nombre"), latex: null };
    case "arcTrig": {
      const calcul = `Calcule d'abord ${NOM_TRIG_FRANCAIS[exercice.trigfonction]}(θ). `;
      return { texte: calcul + phraseDomaine(exercice.arcfonction, "cette valeur"), latex: null };
    }
    case "trigArc": {
      const base = phraseDomaine(exercice.arcfonction, "ce nombre");
      if (!aUneSecondeCondition(exercice)) return { texte: base, latex: null };
      return {
        texte: `${base} Si ce nombre est valide, vérifie ENSUITE si l'angle obtenu (${NOM_FRANCAIS[exercice.arcfonction]}(nombre)) vaut exactement π/2 : la tangente n'y est pas définie à cet angle.`,
        latex: null,
      };
    }
  }
}

// ============================================================================
// Aide niveau 2 — la condition PERTINENTE déjà appliquée et son résultat, jamais la conclusion
// finale (Existe/N'existe pas) ni la valeur demandée.
// ============================================================================

export function aideNiveau2(exercice: ExerciceFonctionsCyclometriques): AideAvecLatex {
  switch (exercice.variante) {
    case "directe": {
      if (exercice.arcfonction === "arctan") return { texte: "arctan est toujours définie, quelle que soit la valeur de départ : la condition est automatiquement vérifiée.", latex: null };
      return { texte: "Le nombre de départ appartient bien à l'intervalle [-1;1] :", latex: exercice.nombreLatex };
    }
    case "arcTrig": {
      if (exercice.arcfonction === "arctan") return { texte: "arctan est toujours définie, quelle que soit la valeur intermédiaire : la condition est automatiquement vérifiée.", latex: null };
      const valeurIntermediaire = exercice.theta[exercice.trigfonction] as ValeurExacte; // jamais null (garanti par la génération)
      const dans = exercice.existe ? "appartient bien" : "n'appartient PAS";
      return { texte: `La valeur intermédiaire calculée ${dans} à l'intervalle [-1;1] :`, latex: valeurIntermediaire.latex };
    }
    case "trigArc": {
      if (exercice.causeInexistence === "horsDomaine") {
        return { texte: "Le nombre de départ n'appartient PAS à l'intervalle [-1;1] :", latex: exercice.nombreLatex };
      }
      // à partir d'ici, le nombre de départ est DANS le domaine.
      if (aUneSecondeCondition(exercice)) {
        const dans = exercice.causeInexistence === "anglePiSur2" ? "vaut exactement π/2 : la tangente n'y est pas définie" : "ne vaut PAS π/2 : la tangente y est bien définie";
        return { texte: `Le nombre de départ appartient bien au domaine — et l'angle intermédiaire obtenu ${dans}.`, latex: null };
      }
      if (exercice.arcfonction === "arctan") return { texte: "arctan est toujours définie, quelle que soit la valeur de départ : la condition est automatiquement vérifiée.", latex: null };
      return { texte: "Le nombre de départ appartient bien à l'intervalle [-1;1] :", latex: exercice.nombreLatex };
    }
  }
}
