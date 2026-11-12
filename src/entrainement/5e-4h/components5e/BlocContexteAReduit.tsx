import type { ExerciceScenarioAReduit } from "../ui5e/scenarioAGraphReduit";
import { consigneContexteAReduit, nombreFr } from "../ui5e/formatProblemesContexte";
import { TexteRiche5e } from "./TexteRiche5e";

/** Bloc "données" du combo `stockCommande` (5gen5, scénario A) : contexte + 2 relevés chiffrés —
 * audit 5e ch. 1 : l'écran demandait f(x) et g(x) sans aucun nombre. */
export function BlocContexteAReduit({ exercice }: { exercice: ExerciceScenarioAReduit }) {
  return (
    <div className="equation-box">
      <p>
        <TexteRiche5e texte={consigneContexteAReduit(exercice)} />
      </p>
      <table className="summary-table">
        <thead>
          <tr>
            <th>x ({exercice.contexte.unite})</th>
            <th>f(x) (€)</th>
            <th>g(x) (€)</th>
          </tr>
        </thead>
        <tbody>
          {exercice.releves.map((r) => (
            <tr key={r.x}>
              <td>{r.x}</td>
              <td>{nombreFr(r.f)}</td>
              <td>{nombreFr(r.g)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
