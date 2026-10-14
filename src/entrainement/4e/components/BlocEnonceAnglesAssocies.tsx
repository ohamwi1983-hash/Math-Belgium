import type { ExerciceAnglesAssocies } from "../core/anglesAssocies.types";
import { Katex } from "./Katex";
import { formatBlocBaseLatex, formatBlocDemandeLatex } from "../ui/formatAnglesAssocies";

interface Props {
  exercice: ExerciceAnglesAssocies;
}

/**
 * Bloc "énoncé" (`promptcorrectionsgenerateur17structure.md`, section 1) — "Sachant que" / bloc 1
 * (valeurs approchées de l'angle de base) / "Déterminer sans utiliser de calculatrice" / bloc 2
 * (expression demandée). Extrait en composant séparé pour la lisibilité — passé en `blocDonnees` à
 * `EnTeteExercice` par `AppAnglesAssocies`, son seul appelant (il vivait auparavant hors du bandeau,
 * rendu directement par `EtapeAnglesAssocies` : bug corrigé, il échappait au fond teinté et à la
 * mise en cohérence typographique avec la question spécifique).
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
