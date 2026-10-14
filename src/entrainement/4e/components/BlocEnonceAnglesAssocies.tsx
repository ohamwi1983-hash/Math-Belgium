import type { ExerciceAnglesAssocies } from "../core/anglesAssocies.types";
import { Katex } from "./Katex";
import { formatBlocBaseLatex, formatBlocDemandeLatex } from "../ui/formatAnglesAssocies";

interface Props {
  exercice: ExerciceAnglesAssocies;
}

/**
 * Bloc "énoncé" (`promptcorrectionsgenerateur17structure.md`, section 1) — "Sachant que" / bloc 1
 * (valeurs approchées de l'angle de base) / "Déterminer sans utiliser de calculatrice" / bloc 2
 * (expression demandée). Extrait en composant séparé pour la lisibilité de `EtapeAnglesAssocies`,
 * son seul appelant depuis la refonte à écran unique (`promptgen17refontecomplete.md`) — plus de
 * duplication entre écrans à éviter ici.
 */
export function BlocEnonceAnglesAssocies({ exercice }: Props) {
  return (
    <>
      <p className="prompt-text">Sachant que</p>
      <div className="equation-box">
        {formatBlocBaseLatex(exercice).map((ligne) => (
          <Katex key={ligne} expression={ligne} block />
        ))}
      </div>
      <p className="prompt-text">Déterminer sans utiliser de calculatrice (arrondi au centième accepté si besoin)</p>
      <div className="equation-box">
        <Katex expression={formatBlocDemandeLatex(exercice)} block />
      </div>
    </>
  );
}
