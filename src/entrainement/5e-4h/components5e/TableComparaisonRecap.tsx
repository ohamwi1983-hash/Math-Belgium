import type { ExerciceComparaisonSuites } from "../core5e/comparaisonSuites.types";
import { labelU, labelV } from "../ui5e/formatComparaisonSuites";

interface Props {
  exercice: ExerciceComparaisonSuites;
}

/**
 * Rappel en lecture seule du tableau à 3 lignes × 2 colonnes déjà rempli à l'écran "tableau" (même
 * disposition que `EtapeTableauComparaisonSuites.tsx`, cellules en texte plutôt qu'en champs de
 * saisie) — réutilisé à la fois par le bloc "état actuel" de l'écran "conclusion"
 * (`EtatActuelComparaisonSuites.tsx`, entouré d'un `.apercu-box`) et par la ligne "Tableau" du
 * récapitulatif final (`ResultatPanelComparaisonSuites.tsx`, SANS aucun encadrement — `LigneRecap`
 * accepte n'importe quel enfant de flux, dont un `<table>`, voir sa propre doc). Choix documenté :
 * un vrai `<table>` (plutôt qu'une liste `apercu-box-termes`) reste la forme la plus lisible ici —
 * la disposition en tableau est pédagogiquement centrale à cet écran (elle montre visuellement le
 * "cran" de bascule n-1/n/n+1), donc mérite d'être reprise à l'identique en rappel plutôt
 * qu'aplatie.
 *
 * Valeurs arrondies à l'unité — même convention que la consigne de l'écran "tableau" lui-même
 * ("arrondis les résultats à l'unité près") — jamais les flottants bruts de `uTable`/`vTable`
 * (croissance géométrique, non entière par nature pour 2 des 3 familles).
 */
export function TableComparaisonRecap({ exercice }: Props) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>n</th>
            <th>{labelU(exercice)}</th>
            <th>{labelV(exercice)}</th>
          </tr>
        </thead>
        <tbody>
          {exercice.nTable.map((n, i) => (
            <tr key={n}>
              <td>{n}</td>
              <td>{Math.round(exercice.uTable[i])}</td>
              <td>{Math.round(exercice.vTable[i])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
