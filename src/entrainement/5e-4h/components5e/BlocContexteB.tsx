import type { ExerciceScenarioB } from "../core5e/problemesContexte.types";
import { consigneContexteBIntro, consigneContexteBReleve, latexFormuleCuB } from "../ui5e/formatProblemesContexte";
import { Katex } from "../components/Katex";

/** Bloc "données" persistant du scénario B (contexte + loi cu(x) + relevé de mesures), rendu sur
 * les 4 écrans (systeme/resolution/formule/evaluation). Remplace l'ancien `consigneContexteB`
 * (une seule chaîne mêlant prose française et LaTeX brut `\dfrac{...}` — jamais passée par
 * `<Katex>`, donc affichée en texte brut à l'écran) : la formule cu(x) est désormais un fragment
 * PUR LaTeX séparé, rendu via `<Katex>`, entouré des 2 phrases de prose SANS LaTeX. */
export function BlocContexteB({ exercice }: { exercice: ExerciceScenarioB }) {
  return (
    <div className="equation-box">
      <p>{consigneContexteBIntro(exercice)}</p>
      <Katex expression={latexFormuleCuB(exercice.modele)} block />
      <p>{consigneContexteBReleve(exercice)}</p>
    </div>
  );
}
