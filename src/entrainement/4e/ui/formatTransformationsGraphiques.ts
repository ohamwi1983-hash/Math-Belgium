import type { ExerciceTransformationGraphique } from "../core/transformationsGraphiques.types";
import { expressionLibreVersLatex } from "./formatExpressionLatex";

/** Emplacement pas encore renseigné : tiret LaTeX (\_), même convention que apercuIntervalle.ts
 * (exercice "tableau de signes"). */
const PLACEHOLDER = "\\_";

/**
 * Aperçu en temps réel de l'équation en cours de saisie (correction 4 du prompt) — remplace
 * l'ancien gabarit statique `a(x-x_S)²+y_S`, mis à jour à chaque frappe, jamais une saisie figée.
 * Passe désormais par `expressionLibreVersLatex` (`promptapercuexpressionlatex.md`) — un "/" devient
 * une vraie barre de fraction plutôt qu'un slash littéral, contrairement au comportement d'origine
 * (contenu affiché tel quel, KaTeX affichant alors une erreur inline pour une saisie non-LaTeX comme
 * "2/3(x-1)^2"). Retombe sur le texte brut si l'expression est syntaxiquement incomplète/invalide
 * (ex. une parenthèse pas encore fermée) — comportement historique conservé dans ce seul cas.
 */
export function formatApercuEquation(equation: string): string {
  if (equation.trim() === "") return `f(x) = ${PLACEHOLDER}`;
  try {
    return `f(x) = ${expressionLibreVersLatex(equation)}`;
  } catch {
    return `f(x) = ${equation}`;
  }
}

/** (x-p)² développé : x nu si p=0 (jamais "(x-0)"), signe adapté. */
function formatCorpsCarre(p: number): string {
  if (p === 0) return "x^2";
  const interieur = p > 0 ? `x - ${p}` : `x + ${-p}`;
  return `(${interieur})^2`;
}

/**
 * f(x) = a(x-p)²+q, rendu LaTeX — jamais un décimal arrondi pour la branche CV (1/cv peut être un
 * décimal périodique, ex. 1/3) : rendue en fraction exacte `\frac{(x-p)²}{cv}` plutôt qu'en
 * approximation. Coefficient 1/-1 jamais explicite quand ev=cv=1 (neutre), signe adapté pour
 * (x-p), terme q omis s'il est nul — mêmes conventions que le reste du projet
 * (formatEquation.ts::formatMembreGauche).
 *
 * prompt-bug-fonction-attendue-et-zoom.md, point 1 : la branche CV ignorait complètement EV
 * (régression corrigée) — depuis que `ev`/`cv` sont tirés indépendamment
 * (`prompt-generation-vrais-rapports.md`), les deux peuvent être `>1` simultanément (`|a|=ev/cv`,
 * un vrai rapport non trivial) ; le numérateur de la fraction doit alors réintégrer `ev` au lieu
 * de le passer sous silence.
 */
export function formatEquationTransformationLatex(exercice: ExerciceTransformationGraphique): string {
  const { p, q, ev, cv, sox } = exercice;
  const corpsCarre = formatCorpsCarre(p);
  const signe = sox ? "-" : "";

  let corps: string;
  if (cv > 1) {
    const numerateur = ev > 1 ? `${ev}${corpsCarre}` : corpsCarre;
    corps = `${signe}\\frac{${numerateur}}{${cv}}`;
  } else if (ev > 1) {
    corps = `${signe}${ev}${corpsCarre}`;
  } else {
    corps = `${signe}${corpsCarre}`;
  }

  const termeQ = q === 0 ? "" : ` ${q > 0 ? "+" : "-"} ${Math.abs(q)}`;
  return `f(x) = ${corps}${termeQ}`;
}
