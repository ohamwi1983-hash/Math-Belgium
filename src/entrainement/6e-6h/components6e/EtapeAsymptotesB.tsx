import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { ReponseAsymptotes } from "../moteur6e/verificationEtudeFonctionExponentielle";
import { CONSIGNE_GENERALE, consigneAsymptotesB } from "../ui6e/formatEtudeFonctionExponentielle";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  enonceLatex: string;
  p: number;
  etatActuel: string[] | null;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseAsymptotes) => void;
}

/** Écran 3/6, "asymptotes" — famille B UNIQUEMENT : l'asymptote verticale x=p est TOUJOURS
 * présente (jamais un toggle "aucune", contrairement aux 3 autres familles), seul le CÔTÉ est à
 * déterminer — piège central de cet écran (spec explicite). Suivi de l'équation de l'asymptote
 * horizontale (texte libre, commune aux deux infinis). `App6gen11.tsx` doit le rendre avec
 * `key={indexExercice}`. `etatActuel` rappelle le domaine ET les limites CONFIRMÉS aux 2 écrans
 * précédents (voir `ui6e/formatEtudeFonctionExponentielle.ts::etatActuel`). */
export function EtapeAsymptotesB({ enonceLatex, p, etatActuel, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [cote, setCote] = useState<"plus" | "moins" | null>(null);
  const [texteHorizontale, setTexteHorizontale] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;

  const complet = cote !== null && texteHorizontale.trim() !== "";

  function valider() {
    if (!complet || cote === null) return;
    onValider({ type: "b", cote, texteHorizontale });
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={enonceLatex} block />
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
      <p className="prompt-text">{consigneAsymptotesB()}</p>

      <div className="field">
        <p className="field-label field-label-minuscule">
          <Katex expression={`\\text{Côté de l'asymptote verticale } x=${p}`} />
        </p>
        <div className="options-grid-compact">
          <button type="button" className={`btn ${cote === "plus" ? "toggle-active" : ""} ${montrerErreurs && cote === "plus" ? "is-erronee" : ""}`} onClick={() => setCote("plus")}>
            <Katex expression={`x \\to ${p}^+`} />
          </button>
          <button type="button" className={`btn ${cote === "moins" ? "toggle-active" : ""} ${montrerErreurs && cote === "moins" ? "is-erronee" : ""}`} onClick={() => setCote("moins")}>
            <Katex expression={`x \\to ${p}^-`} />
          </button>
        </div>
      </div>

      <ApercuExpressionLatex texte={texteHorizontale} />
      <div className="field">
        <label className="field-label field-label-minuscule">Équation de l'asymptote horizontale</label>
        <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={texteHorizontale} placeholder="ex : y=1" onChange={(e) => setTexteHorizontale(e.target.value)} />
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
