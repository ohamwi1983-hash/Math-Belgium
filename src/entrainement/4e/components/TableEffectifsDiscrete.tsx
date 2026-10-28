import type { ExerciceMedianeDiscrete } from "../core/mediane.types";
import { LABEL_EFFECTIF_CUMULE_VI, LABEL_EFFECTIF_NI, LABEL_VALEUR_XI } from "../ui/formatMediane";
import type { SurlignageSeuilTable } from "../ui/formatMediane";
import { Katex } from "./Katex";
import { nombreFr } from "../ui/nombreFr";

interface Props {
  exercice: ExerciceMedianeDiscrete;
  surlignage: SurlignageSeuilTable | null;
}

/** Tableau valeurs/effectifs/effectifs cumulés (variante "discrete") — identique sur les écrans
 * "mediane"/"q1"/"q3" (AppMediane) et leurs équivalents dans AppExerciceSynthese ; chaque écran
 * garde son propre surlignage (seuil/index de sa propre question), calculé par l'appelant. */
export function TableEffectifsDiscrete({ exercice, surlignage }: Props) {
  return (
    <div className="tf-table-scroll">
      <table className="tf-table md-table">
        <thead>
          <tr>
            <th>
              Valeur <Katex expression={LABEL_VALEUR_XI} />
            </th>
            <th>
              Effectif <Katex expression={LABEL_EFFECTIF_NI} />
            </th>
            <th>
              Effectif cumulé <Katex expression={LABEL_EFFECTIF_CUMULE_VI} />
            </th>
          </tr>
        </thead>
        <tbody>
          {exercice.lignes.map((ligne, index) => (
            <tr key={index} className={surlignage?.type === "ligne" && surlignage.index === index ? "is-surlignee" : undefined}>
              <td>{nombreFr(ligne.valeur)}</td>
              <td>{ligne.effectif}</td>
              <td className={surlignage?.type === "valeur" && surlignage.index === index ? "is-surlignee" : undefined}>{ligne.effectifCumule}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
