import { useState } from "react";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex, ChampDef, TableauAffichage } from "../ui6e/formatIndependanceBayes";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  tableauDonnees: TableauAffichage | null;
  etatActuel: string[] | null;
  tableauEtatActuel: TableauAffichage | null;
  consigneEcran: string;
  champs: ChampDef[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (valeurs: string[]) => void;
  diagnostiquer: (valeurs: string[]) => StatutVerification;
}

/** Table en LECTURE SEULE (données/état actuel) — texte brut, jamais KaTeX (voir en-tête de
 * `ui6e/formatIndependanceBayes.ts`, `TableauAffichage`). Réutilise `.summary-table`/
 * `.summary-table-scroll` (`App.css`, déjà utilisées app-wide pour le récapitulatif final) — aucune
 * classe CSS nouvelle. */
function TableAffichage({ tableau }: { tableau: TableauAffichage }) {
  return (
    <div className="summary-table-scroll">
      <table className="summary-table">
        <thead>
          <tr>
            <th />
            {tableau.libelleColonnes.map((c, j) => (
              <th key={j}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableau.libelleLignes.map((label, i) => (
            <tr key={i}>
              <td>{label}</td>
              {tableau.cellules[i].map((v, j) => (
                <td key={j}>{v ?? "?"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Écran GÉNÉRIQUE à N champs texte libre (1 à 5) pour `6gen32` — même patron que
 * `EtapeChampsProbabilitesEnsembles.tsx` (6gen30), copié plutôt qu'importé (chaque générateur garde
 * son propre écran, voir CLAUDE.md). Étend le patron avec 2 tables OPTIONNELLES en lecture seule
 * (`tableauDonnees`/`tableauEtatActuel`, famille B) — structure d'écran imposée par CLAUDE.md
 * (consigne générale → bloc données [+ table] → bloc "état actuel" [+ table] → bloc de travail)
 * conservée à l'identique. AUCUN écran à choix dans ce générateur (voir en-tête de
 * `ui6e/formatIndependanceBayes.ts`) — un seul composant écran suffit, jamais de variante "choix".
 * `App6gen32.tsx` doit le rendre avec `key={phase}` (remet les champs à vide à chaque écran). */
export function EtapeChampsIndependanceBayes({ consigneGenerale, blocDonnees, tableauDonnees, etatActuel, tableauEtatActuel, consigneEcran, champs, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => champs.map(() => ""));
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquer(valeurs) : null;
  const toutRempli = valeurs.every((v) => v.trim() !== "");

  function valider() {
    if (!toutRempli) return;
    onValider(valeurs);
  }

  function changer(index: number, valeur: string) {
    setValeurs((prev) => prev.map((v, i) => (i === index ? valeur : v)));
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
        </div>
      </div>
      {tableauDonnees && <TableAffichage tableau={tableauDonnees} />}
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      {tableauEtatActuel && <TableAffichage tableau={tableauEtatActuel} />}
      <p className="prompt-text">{consigneEcran}</p>
      <div className={`field-row ${champs.length > 3 ? "field-row-wrap" : ""}`}>
        {champs.map((champ, i) => (
          <div className={champs.length > 1 ? "field field-inline" : "field"} key={i}>
            <label className="field-label field-label-minuscule">{champ.label}</label>
            <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={valeurs[i]} placeholder={champ.placeholder} onChange={(e) => changer(i, e.target.value)} />
          </div>
        ))}
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!toutRempli} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
