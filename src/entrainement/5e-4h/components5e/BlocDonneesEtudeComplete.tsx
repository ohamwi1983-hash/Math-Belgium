import type { ExerciceEtudeCompletePipeline } from "../core5e/etudeComplete.types";
import { formatDonneesLatex } from "../ui5e/formatEtudeComplete";
import { Katex } from "../components/Katex";

/** Bloc "données" redondant — l'expression de f(x) SANS le préfixe "f(x)=" (déjà annoncé par la
 * consigne générale "Recherche toutes les asymptotes de la fonction f(x) ci-dessous :"), visible sur
 * TOUS les écrans du pipeline principal. */
export function BlocDonneesEtudeComplete({ exercice }: { exercice: ExerciceEtudeCompletePipeline }) {
  return (
    <div className="equation-box equation-box-donnees">
      <Katex expression={formatDonneesLatex(exercice)} block />
    </div>
  );
}
