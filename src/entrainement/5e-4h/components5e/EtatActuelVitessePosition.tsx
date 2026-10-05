import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import type { EcranVitessePosition } from "../moteur5e/typesVitessePosition";
import { formatTermesEtatActuelLatex } from "../ui5e/formatVitessePosition";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceVitessePosition;
  ecran: EcranVitessePosition;
}

/** Bloc "état actuel" partagé par tous les écrans de 5gen35 — `null` sur le premier écran
 * (rien n'est encore confirmé), accumule ensuite les valeurs confirmées (voir
 * `formatTermesEtatActuelLatex`). */
export function EtatActuelVitessePosition({ exercice, ecran }: Props) {
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
