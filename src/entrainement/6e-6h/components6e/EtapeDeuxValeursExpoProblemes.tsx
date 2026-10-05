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
  consigneEcran: string;
  /** Libellés LaTeX des 2 champs (ex. "f(1)=", "f(3)=") — ORDONNÉS, jamais interchangeables
   * (contrairement à la famille C écran 3, add-as-needed) : chaque champ est étiqueté par son
   * propre temps. */
  labelChamp1: string;
  labelChamp2: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte1: string, texte2: string) => void;
}

/** Écran GÉNÉRIQUE à 2 champs numériques FIXES, un par temps demandé — famille G écran 1
 * uniquement (2 valeurs déjà `f(tEval1)`/`f(tEval2)`, jamais une taille variable — pas de pattern
 * add-as-needed ici, contrairement à `EtapeListeExpoProblemes.tsx`). */
export function EtapeDeuxValeursExpoProblemes({ consigneGenerale, blocDonnees, consigneEcran, labelChamp1, labelChamp2, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [texte1, setTexte1] = useState("");
  const [texte2, setTexte2] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = texte1.trim() !== "" && texte2.trim() !== "";

  function valider() {
    if (!complet) return;
    onValider(texte1, texte2);
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
      <p className="prompt-text">{consigneEcran}</p>
      <ApercuExpressionLatex texte={texte1} label={labelChamp1} />
      <div className="field-row">
        <p className="field-label field-label-minuscule">
          <Katex expression={labelChamp1} />
        </p>
        <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={texte1} placeholder="valeur" onChange={(e) => setTexte1(e.target.value)} />
      </div>
      <ApercuExpressionLatex texte={texte2} label={labelChamp2} />
      <div className="field-row">
        <p className="field-label field-label-minuscule">
          <Katex expression={labelChamp2} />
        </p>
        <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={texte2} placeholder="valeur" onChange={(e) => setTexte2(e.target.value)} />
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
