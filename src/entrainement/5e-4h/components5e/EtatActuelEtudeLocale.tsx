import type { ExerciceEtudeLocale } from "../core5e/etudeLocale.types";
import type { EcranEtudeLocale } from "../moteur5e/typesEtudeLocale";
import { formatTermesEtatActuelLatex } from "../ui5e/formatEtudeLocale";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceEtudeLocale;
  phase: EcranEtudeLocale;
}

/** Bloc "état actuel" partagé par tous les écrans de 5gen29 — `null` sur le premier écran (rien
 * n'est encore confirmé), accumule ensuite les faits confirmés (voir `formatTermesEtatActuelLatex`) —
 * même patron que `EtatActuelTangente.tsx` (5gen28). */
export function EtatActuelEtudeLocale({ exercice, phase }: Props) {
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
