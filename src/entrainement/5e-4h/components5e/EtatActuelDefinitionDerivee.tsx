import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import type { EcranDefinitionDerivee } from "../moteur5e/typesDefinitionDerivee";
import { formatTermesEtatActuelLatex } from "../ui5e/formatDefinitionDerivee";
import { Katex } from "../components/Katex";

interface Props {
  exercice: ExerciceDefinitionDerivee;
  ecran: EcranDefinitionDerivee;
}

/** Bloc "état actuel" partagé par les 3 écrans de 5gen26 — rend `null` sur l'écran "developper"
 * lui-même (rien n'est encore confirmé), accumule ensuite f(a)/f(a+h) puis le quotient. */
export function EtatActuelDefinitionDerivee({ exercice, ecran }: Props) {
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
