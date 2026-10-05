import type { ExerciceOptimisation } from "../core5e/optimisationGeometrique.types";
import type { EcranOptimisation } from "../moteur5e/typesOptimisationGeometrique";
import { formatTermesEtatActuelLatex } from "../ui5e/formatOptimisationGeometrique";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceOptimisation;
  phase: EcranOptimisation;
  dernieresReponsesParEcran: Partial<Record<EcranOptimisation, Record<string, string>>>;
}

/** Bloc "état actuel" partagé par tous les écrans de 5gen32 — `null` sur le premier écran de
 * chaque exercice (rien n'est encore confirmé), accumule ensuite les réponses CONFIRMÉES des
 * écrans précédents (jamais la saisie brute en cours). */
export function EtatActuelOptimisation({ exercice, phase, dernieresReponsesParEcran }: Props) {
  const termes = formatTermesEtatActuelLatex(exercice, dernieresReponsesParEcran, phase);
  if (termes === null) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}
