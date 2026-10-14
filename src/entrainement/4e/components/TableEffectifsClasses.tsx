import type { ExerciceMedianeClasses } from "../core/mediane.types";
import { LABEL_EFFECTIF_CUMULE_VI, LABEL_EFFECTIF_NI, formatClasseTexte } from "../ui/formatMediane";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceMedianeClasses;
}

/** Tableau classes/effectifs/effectifs cumulés (variante "classes") — identique sur les écrans
 * "polygone"/"synthese" (AppMediane) et leurs équivalents dans AppExerciceSynthese. */
export function TableEffectifsClasses({ exercice }: Props) {
  return (
    <div className="tf-table-scroll">
      <table className="tf-table">
        <thead>
          <tr>
            <th>Classe</th>
            <th>
              Effectif <Katex expression={LABEL_EFFECTIF_NI} />
            </th>
            <th>
              Effectif cumulé <Katex expression={LABEL_EFFECTIF_CUMULE_VI} />
            </th>
          </tr>
        </thead>
        <tbody>
          {exercice.classes.map((classe, index) => (
            <tr key={index}>
              <td>{formatClasseTexte(exercice, index)}</td>
              <td>{classe.effectif}</td>
              <td>{classe.effectifCumule}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
