import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE } from "../ui6e/formatEquationsCyclometriques";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelPanel } from "./EtatActuelPanel";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Une ligne de l'état déjà confirmé aux écrans précédents (jamais la saisie brute de l'élève). */
export interface EtatActuelLigne {
  label: string;
  latex: string;
}

interface Props {
  consigneEcran: string;
  equationLatex: string;
  /** Absent (ou vide) sur l'écran 1 d'une famille ; sinon 1-2 lignes dérivées de l'exercice/des
   * écrans précédents déjà confirmés (voir CLAUDE.md, "Bloc 'état actuel'"). */
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

/** Écran GÉNÉRIQUE à un seul champ texte libre (6gen3) — réutilisé par "lectureDirecte",
 * "isolerCible" et "resoudreLineaire" (structurellement identiques : consigne + équation + champ
 * + aide à 2 niveaux). `App6gen3.tsx` doit le rendre avec `key={phase}`. */
export function EtapeChampEquationCyclo({
  consigneEcran,
  equationLatex,
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
        <Katex expression={equationLatex} />
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
