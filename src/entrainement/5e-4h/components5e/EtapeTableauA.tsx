import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioAConteneur } from "../core5e/problemesContexte.types";
import { diagnostiquerCelluleTableauA, type ReponseTableauA } from "../moteur5e/verificationProblemesContexte";
import { CONSIGNE_TABLEAU_A, TEXTE_AIDE_TABLEAU_A_1, TEXTE_AIDE_TABLEAU_A_2 } from "../ui5e/formatProblemesContexte";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceScenarioAConteneur;
  /** Bloc "données" persistant (contexte du scénario A) — rendu AVANT la question spécifique de
   * l'écran (convention transversale : données → question, jamais l'inverse). */
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseTableauA) => void;
}

export function EtapeTableauA({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [lignes, setLignes] = useState(() => exercice.lignesTableau.map(() => ({ h: "", aireBases: "", aireLaterale: "" })));
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = lignes.every((l) => l.h.trim() !== "" && l.aireBases.trim() !== "" && l.aireLaterale.trim() !== "");

  function modifier(i: number, champ: "h" | "aireBases" | "aireLaterale", valeur: string) {
    setLignes((arr) => arr.map((l, j) => (j === i ? { ...l, [champ]: valeur.replace(/[^0-9.,-]/g, "") } : l)));
  }

  function celluleErronee(i: number, champ: "h" | "aireBases" | "aireLaterale"): boolean {
    const brut = lignes[i][champ];
    if (!montrerErreurs || brut.trim() === "") return false;
    return diagnostiquerCelluleTableauA(exercice, i, champ, Number(brut.replace(",", "."))) !== "correct";
  }

  function valider() {
    if (!complet) return;
    onValider(lignes.map((l) => ({ h: Number(l.h.replace(",", ".")), aireBases: Number(l.aireBases.replace(",", ".")), aireLaterale: Number(l.aireLaterale.replace(",", ".")) })));
  }

  return (
    <div>
      {donnees}
      <p className="prompt-text">{CONSIGNE_TABLEAU_A}</p>
      <table className="summary-table-scroll">
        <thead>
          <tr>
            <th>r (cm)</th>
            <th>h (cm)</th>
            <th>Aire des bases (cm²)</th>
            <th>Aire latérale (cm²)</th>
          </tr>
        </thead>
        <tbody>
          {exercice.lignesTableau.map((ligne, i) => (
            <tr key={i}>
              <td>{ligne.r}</td>
              <td>
                <input
                  type="text"
                  className={`text-input${celluleErronee(i, "h") ? " is-erronee" : ""}`}
                  value={lignes[i].h}
                  onChange={(e) => modifier(i, "h", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className={`text-input${celluleErronee(i, "aireBases") ? " is-erronee" : ""}`}
                  value={lignes[i].aireBases}
                  onChange={(e) => modifier(i, "aireBases", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="text"
                  className={`text-input${celluleErronee(i, "aireLaterale") ? " is-erronee" : ""}`}
                  value={lignes[i].aireLaterale}
                  onChange={(e) => modifier(i, "aireLaterale", e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_TABLEAU_A_1}</p>
          {niveauAide >= 2 && <p>{TEXTE_AIDE_TABLEAU_A_2}</p>}
        </div>
      )}
    </div>
  );
}
