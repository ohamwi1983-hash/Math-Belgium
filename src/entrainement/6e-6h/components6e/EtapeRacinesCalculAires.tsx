import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { AideAvecLatex } from "../ui6e/formatCalculAires";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  placeholder: string;
  labelAjout: string;
  nombreInitial: number;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
}

/**
 * Écran GÉNÉRIQUE add-as-needed pour les écrans "racines" de `6gen26` (bEcran1 : 2 racines, cEcran1
 * : 3 racines, dEcran1 : 2 racines) — copié-adapté de `EtapeListeEquationsExpLog.tsx` (6gen14, voir
 * en-tête de ce fichier pour le patron d'origine), SANS le toggle "aucune solution" (les racines
 * existent toujours par construction pour ce générateur — jamais 0 solution) : une croix rouge `×`
 * pour retirer une ligne (jamais un bouton texte "Retirer", convention CLAUDE.md), jusqu'à 6 lignes.
 * Réutilisé PAR les 3 familles B/C/D de CE générateur (jamais par un autre générateur — "reuse ta
 * propre famille C pour ta propre famille B", point 6 des clarifications de la spec).
 * `App6gen26.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeRacinesCalculAires({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, placeholder, labelAjout, nombreInitial, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [lignes, setLignes] = useState<string[]>(() => Array.from({ length: nombreInitial }, () => ""));
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");

  function ajouterLigne() {
    if (lignes.length >= 6) return;
    setLignes((arr) => [...arr, ""]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    onValider(lignes);
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
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>
      <div className="contenu-conditionnel">
        {lignes.map((ligne, i) => (
          <div key={i}>
            <ApercuExpressionLatex texte={ligne} />
            <div className="field-row">
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={ligne} placeholder={placeholder} onChange={(e) => modifierLigne(i, e.target.value)} />
              {lignes.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la valeur ${i + 1}`} onClick={() => retirerLigne(i)}>
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
        {lignes.length < 6 && (
          <button type="button" className="btn" onClick={ajouterLigne}>
            {labelAjout}
          </button>
        )}
      </div>
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
