import type { ExerciceContexteEconomique } from "../core5e/contexteEconomique.types";
import type { EcranContexteEconomique } from "../moteur5e/typesContexteEconomique";
import { formatTermesEtatActuelLatex } from "../ui5e/formatContexteEconomique";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceContexteEconomique;
  ecran: EcranContexteEconomique;
}

/** Bloc "état actuel" partagé par tous les écrans de 5gen33 — `null` sur le tout premier écran de
 * chaque famille (rien n'est encore confirmé), accumule ensuite les faits confirmés — même patron
 * que `EtatActuelEtudeLocale.tsx` (5gen29). */
export function EtatActuelContexteEconomique({ exercice, ecran }: Props) {
  const termes = formatTermesEtatActuelLatex(exercice, ecran);
  if (termes === null) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}
