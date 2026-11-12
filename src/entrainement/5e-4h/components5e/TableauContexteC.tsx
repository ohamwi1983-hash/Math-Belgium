import type { ExerciceScenarioC } from "../core5e/problemesContexte.types";
import { nombreFr } from "../ui5e/formatProblemesContexte";

/** Tableau de valeurs du scénario C de 5gen5 (milliers d'euros) — audit 5e ch. 1 : les données
 * chiffrées viennent d'un tableau, plus de lectures graphiques au demi-millier près. */
export function TableauContexteC({ exercice }: { exercice: ExerciceScenarioC }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="summary-table">
        <thead>
          <tr>
            <th style={{ textTransform: "none" }}>x</th>
            <th style={{ textTransform: "none" }}>CV(x)</th>
            <th style={{ textTransform: "none" }}>CP(x)</th>
            <th style={{ textTransform: "none" }}>CA(x)</th>
          </tr>
        </thead>
        <tbody>
          {exercice.tableau.map((l) => (
            <tr key={l.x}>
              <td>{l.x}</td>
              <td>{nombreFr(l.cv)}</td>
              <td>{nombreFr(l.cp)}</td>
              <td>{nombreFr(l.ca)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
