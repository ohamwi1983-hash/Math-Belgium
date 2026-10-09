import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  placeholder: string;
  labelAjout: string;
  labelAucune: string;
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
 * Écran GÉNÉRIQUE add-as-needed (0 à 3 valeurs) pour `6gen14` — familles C (écrans 2/3), E (écran
 * 3), F (écran 3). Croix rouge `×` pour retirer une ligne (jamais un bouton texte "Retirer",
 * convention CLAUDE.md) + gate "Pas de solution" (0 valeur possible — familles C/E, jamais F qui a
 * toujours 2 valeurs) — copié-adapté de `EtapeListeEquExpo.tsx` (6gen9, gate 0 valeur) et
 * `EtapeListeExpoProblemes.tsx` (6gen12, croix rouge), les 2 mécaniques réunies ici. `App6gen14.tsx`
 * doit le rendre avec `key={phase}`.
 */
export function EtapeListeEquationsExpLog({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, placeholder, labelAjout, labelAucune, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [aucune, setAucune] = useState(false);
  const [lignes, setLignes] = useState<string[]>([""]);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = aucune || (lignes.length > 0 && lignes.every((l) => l.trim() !== ""));

  function ajouterLigne() {
    if (lignes.length >= 3) return;
    setLignes((arr) => [...arr, ""]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function basculerAucune() {
    setAucune((v) => !v);
  }
  function valider() {
    if (!complet) return;
    onValider(aucune ? [] : lignes);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} />
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
      <button type="button" className={`btn ${aucune ? "toggle-active" : ""}`} onClick={basculerAucune}>
        {labelAucune}
      </button>
      {!aucune && (
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
          {lignes.length < 3 && (
            <button type="button" className="btn" onClick={ajouterLigne}>
              {labelAjout}
            </button>
          )}
        </div>
      )}
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
