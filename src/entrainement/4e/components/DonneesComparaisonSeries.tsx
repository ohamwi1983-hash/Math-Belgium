import type { ExerciceComparaisonSeries, SerieComparaison } from "../core/comparaisonSeries.types";
import {
  LABEL_EFFECTIF_CUMULE_VI,
  LABEL_EFFECTIF_NI,
  LABEL_Q1,
  LABEL_Q2,
  LABEL_Q3,
  LABEL_SIGMA,
  LABEL_VALEUR_XI,
  LABEL_X_BAR,
  LABEL_X_MAX,
  LABEL_X_MIN,
} from "../ui/formatComparaisonSeries";
import { Katex } from "./Katex";
import { ComparaisonSeriesGraph } from "./ComparaisonSeriesGraph";

interface Props {
  exercice: ExerciceComparaisonSeries;
}

function TableauBrut({ serie, label }: { serie: SerieComparaison; label: string }) {
  return (
    <div className="tf-table-scroll comparaison-series-table">
      <p className="field-label">{label}</p>
      <table className="tf-table">
        <thead>
          <tr>
            <th>
              <Katex expression={LABEL_VALEUR_XI} />
            </th>
            <th>
              <Katex expression={LABEL_EFFECTIF_NI} />
            </th>
            <th>
              <Katex expression={LABEL_EFFECTIF_CUMULE_VI} />
            </th>
          </tr>
        </thead>
        <tbody>
          {serie.lignes.map((ligne, index) => (
            <tr key={index}>
              <td>{ligne.valeur}</td>
              <td>{ligne.effectif}</td>
              <td>{ligne.effectifCumule}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableauRecap({ serie, label }: { serie: SerieComparaison; label: string }) {
  const lignes: { latex: string; valeur: number }[] = [
    { latex: LABEL_X_BAR, valeur: serie.xBar },
    { latex: LABEL_SIGMA, valeur: serie.sigma },
    { latex: LABEL_X_MIN, valeur: serie.min },
    { latex: LABEL_Q1, valeur: serie.q1 },
    { latex: LABEL_Q2, valeur: serie.mediane },
    { latex: LABEL_Q3, valeur: serie.q3 },
    { latex: LABEL_X_MAX, valeur: serie.max },
  ];

  return (
    <div className="tf-table-scroll comparaison-series-table">
      <p className="field-label">{label}</p>
      <table className="tf-table">
        <tbody>
          {lignes.map((ligne) => (
            <tr key={ligne.latex}>
              <td>
                <Katex expression={ligne.latex} />
              </td>
              <td>{ligne.valeur}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Bloc de données affiché sous l'énoncé — dispatch sur `exercice.variante` : deux tableaux bruts
 * x_i/n_i/v_i côte à côte (`"tableaux"`), deux tableaux récapitulatifs déjà calculés côte à côte
 * (`"recapitulatif"`), ou le graphe Mafs des courbes cumulées (`"graphique"`, jamais de tableau en
 * complément — toute l'information nécessaire aux 4 types de question s'y lit directement).
 */
export function DonneesComparaisonSeries({ exercice }: Props) {
  if (exercice.variante === "graphique") {
    return <ComparaisonSeriesGraph serieA={exercice.serieA} serieB={exercice.serieB} cumul={exercice.cumul ?? "effectif"} />;
  }

  const Tableau = exercice.variante === "tableaux" ? TableauBrut : TableauRecap;
  return (
    <div className="comparaison-series-tables">
      <Tableau serie={exercice.serieA} label="Série A" />
      <Tableau serie={exercice.serieB} label="Série B" />
    </div>
  );
}
