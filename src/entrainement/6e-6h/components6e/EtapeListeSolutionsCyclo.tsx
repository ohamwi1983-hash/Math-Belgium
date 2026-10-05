import { Fragment, useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE } from "../ui6e/formatEquationsCyclometriques";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelPanel } from "./EtatActuelPanel";
import type { EtatActuelLigne } from "./EtapeChampEquationCyclo";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneEcran: string;
  equationLatex: string;
  /** Absent (ou vide) quand cet écran est le 1er de sa famille ; sinon 1-2 lignes dérivées de
   * l'exercice/des écrans précédents déjà confirmés (voir CLAUDE.md, "Bloc 'état actuel'"). */
  etatActuel?: EtatActuelLigne[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  placeholder: string;
  labelAjout: string;
  labelAucune: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
}

/** Écran GÉNÉRIQUE add-as-needed (0 à 2 valeurs numériques) — réutilisé par "resoudreQuadratique",
 * "verifierCE" et "egaliteSansCE" (0/1/2 solutions selon l'instance, jamais un nombre de champs
 * pré-rempli). `App6gen3.tsx` doit le rendre avec `key={phase}`. */
export function EtapeListeSolutionsCyclo({
  consigneEcran,
  equationLatex,
  etatActuel = [],
  aideNiveau1,
  aideNiveau2,
  placeholder,
  labelAjout,
  labelAucune,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
}: Props) {
  const [aucune, setAucune] = useState(false);
  const [lignes, setLignes] = useState<string[]>([""]);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = aucune || (lignes.length > 0 && lignes.every((l) => l.trim() !== ""));

  function ajouterLigne() {
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
    onValider(aucune ? [] : lignes);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={equationLatex} />
      </div>
      {etatActuel.map((ligne) => (
        <EtatActuelPanel key={ligne.label} label={ligne.label} latex={ligne.latex} />
      ))}
      <p className="prompt-text">{consigneEcran}</p>
      <button type="button" className={`btn ${aucune ? "toggle-active" : ""}`} onClick={() => setAucune((v) => !v)}>
        {labelAucune}
      </button>
      {!aucune && (
        <div className="contenu-conditionnel">
          {lignes.map((ligne, i) => (
            <Fragment key={i}>
              <ApercuExpressionLatex texte={ligne} />
              <div className="field-row">
                <input
                  type="text"
                  className={`text-input${montrerErreurs ? " is-erronee" : ""}`}
                  value={ligne}
                  placeholder={placeholder}
                  onChange={(e) => modifierLigne(i, e.target.value)}
                />
                {lignes.length > 1 && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la solution ${i + 1}`} onClick={() => retirerLigne(i)}>
                    ×
                  </button>
                )}
              </div>
            </Fragment>
          ))}
          <button type="button" className="btn" onClick={ajouterLigne}>
            {labelAjout}
          </button>
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
