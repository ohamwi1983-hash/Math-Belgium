import type { ExerciceTransformationGraphique } from "../core/transformationsGraphiques.types";
import { expressionLibreVersLatex } from "./formatExpressionLatex";
import { formatFonctionCanoniqueLatex } from "./formatFormeCanoniqueTransformations";

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
 *
 * Réduit `ev/cv` par leur pgcd AVANT de décider de l'affichage (trouvé pendant l'audit du chapitre
 * "La fonction du second degré") : sans ça, ev=cv=5 (a=1, cas neutre) affichait encore
 * `5(x-p)²/5` au lieu de `(x-p)²` — la réponse révélée à l'élève montrait une fraction non
 * simplifiée. `cv>1` reste décidé sur la valeur RÉDUITE (ev=2,cv=4 → 1/2, toujours une fraction ;
 * ev=5,cv=5 → 1/1, jamais de fraction).
 */
export function formatEquationTransformationLatex(exercice: ExerciceTransformationGraphique): string {
  // Coefficient a écrit DEVANT la parenthèse (décision de l'utilisateur, audit 4e ch. 1, G4) :
  // « \frac{4}{3}(x - 3)^2 - 5 », plus « \frac{4(x - 3)^2}{3} - 5 » — même écriture que gen9 et le cours.
  return formatFonctionCanoniqueLatex({ numA: exercice.sox ? -exercice.ev : exercice.ev, denA: exercice.cv, p: exercice.p, q: exercice.q });
}
