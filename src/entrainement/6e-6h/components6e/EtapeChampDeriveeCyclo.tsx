import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE } from "../ui6e/formatDeriveesCyclometriques";
import type { AideAvecLatex } from "../ui6e/formatDeriveesCyclometriques";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelPanel } from "./EtatActuelPanel";

interface EtatActuelLigne {
  label: string;
  latex: string;
}

interface Props {
  consigneEcran: string;
  fonctionLatex: string;
  /** Absent (ou vide) sur le 1er écran d'une famille ; sinon 1-2 lignes dérivées de l'exercice/des
   * écrans précédents déjà confirmés (voir CLAUDE.md, "Bloc 'état actuel'") — jamais la saisie
   * brute de l'élève. */
  etatActuel?: EtatActuelLigne[];
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  placeholder: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
}

/** Écran GÉNÉRIQUE à un seul champ texte libre (6gen4) — les 18 écrans possibles des 7 familles
 * sont structurellement identiques : consigne générale + bloc f(x) redondant + consigne d'écran +
 * champ + aide à 2 niveaux. `App6gen4.tsx` doit le rendre avec `key={phase}`. */
export function EtapeChampDeriveeCyclo({
  consigneEcran,
  fonctionLatex,
  etatActuel = [],
  aideNiveau1,
  aideNiveau2,
  placeholder,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
}: Props) {
  const [texte, setTexte] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (texte.trim() === "") return;
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={fonctionLatex} />
      </div>
      {etatActuel.map((ligne) => (
        <EtatActuelPanel key={ligne.label} label={ligne.label} latex={ligne.latex} />
      ))}
      <p className="prompt-text">{consigneEcran}</p>
      <ApercuExpressionLatex texte={texte} />
      <div className="field">
        <input type="text" className={`text-input${montrerErreurs ? " is-erronee" : ""}`} value={texte} placeholder={placeholder} onChange={(e) => setTexte(e.target.value)} />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
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
