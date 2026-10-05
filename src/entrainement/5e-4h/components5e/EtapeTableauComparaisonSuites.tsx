import { useState } from "react";
import type { ExerciceComparaisonSuites } from "../core5e/comparaisonSuites.types";
import { consigneGenerale, consigneTableau, labelU, labelV, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatComparaisonSuites";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceComparaisonSuites;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /**
   * Statut à 3 valeurs — calculé côté PRÉSENTATION uniquement (motif A.1, déjà prouvé sur 5gen2),
   * jamais consommé par le score/les tentatives. Optionnel : un appelant qui ne le fournit pas
   * garde le message générique historique.
   */
  diagnostiquer?: (textes: string[]) => StatutVerification;
  /** Statut à 3 valeurs d'UNE cellule (A.2 — highlight rouge indépendant par champ). */
  diagnostiquerCellule?: (index: number, texte: string) => StatutVerification;
}

/** Écran "tableau" — un vrai `<table>` à 3 lignes (n=nSeuil-1, nSeuil, nSeuil+1) × 2 colonnes
 * (u_n, v_n) — 6 champs numériques au total, jamais une liste plate (la disposition en tableau est
 * pédagogiquement centrale ici : elle montre visuellement le "cran" de bascule). */
export function EtapeTableauComparaisonSuites({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, diagnostiquerCellule }: Props) {
  const [valeurs, setValeurs] = useState<string[]>(["", "", "", "", "", ""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const aide2 = texteAideNiveau2(exercice, "tableau");

  const apresEchec = tentativesUtilisees > 0;
  function celluleErronee(i: number): boolean {
    return apresEchec && !!diagnostiquerCellule && diagnostiquerCellule(i, valeurs[i]) !== "correct";
  }

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(valeurs));
    onValider(valeurs);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <p className="prompt-text">{consigneTableau(exercice)}</p>
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
                <td>
                  <input type="text" className={`text-input${celluleErronee(i) ? " is-erronee" : ""}`} value={valeurs[i]} onChange={(e) => modifier(i, e.target.value)} />
                </td>
                <td>
                  <input type="text" className={`text-input${celluleErronee(i + 3) ? " is-erronee" : ""}`} value={valeurs[i + 3]} onChange={(e) => modifier(i + 3, e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, "tableau")}</p>
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}
