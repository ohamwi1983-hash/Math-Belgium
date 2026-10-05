import type { ExerciceTangente } from "../core5e/tangentes.types";
import type { EcranTangente } from "../moteur5e/typesTangentes";
import { formatTermesEtatActuelLatex } from "../ui5e/formatTangentes";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceTangente;
  phase: EcranTangente;
}

/** Bloc "état actuel" partagé par les écrans de 5gen28 — `null` sur le premier écran de chaque
 * variante (rien n'est encore confirmé), accumule ensuite les valeurs confirmées (voir
 * `formatTermesEtatActuelLatex`). */
export function EtatActuelTangente({ exercice, phase }: Props) {
  const termes = formatTermesEtatActuelLatex(exercice, phase);
  if (termes === null) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}
