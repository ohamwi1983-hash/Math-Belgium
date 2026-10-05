import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import type { EcranEtudierFonction } from "../moteur5e/typesEtudierFonction";
import { ordreEcransEtudierFonction } from "../moteur5e/typesEtudierFonction";
import { formatTermesEtatActuelLatex } from "../ui5e/formatEtudierFonction";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceEtudierFonction;
  phase: EcranEtudierFonction;
}

/** Bloc "état actuel" partagé par tous les écrans de 5gen31 — `null` sur le premier écran (rien
 * n'est encore confirmé), accumule ensuite les faits confirmés — même patron que
 * `EtatActuelEtudeLocale.tsx` (5gen29). */
export function EtatActuelEtudierFonction({ exercice, phase }: Props) {
  const termes = formatTermesEtatActuelLatex(exercice, phase, ordreEcransEtudierFonction(exercice));
  if (termes === null) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}
