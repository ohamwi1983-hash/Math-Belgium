import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { ReponseDeuxChamps } from "../moteur6e/verificationDomaineDeriveeExponentielles";
import { CONSIGNE_GENERALE } from "../ui6e/formatDomaineDeriveeExponentielles";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneEcran: string;
  enonceLatex: string;
  etatActuel: string[] | null;
  labelA: string;
  labelB: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseDeuxChamps) => void;
}

/** Écran GÉNÉRIQUE à 2 champs texte libre (`6gen7`) — réutilisé par les écrans "cFacteurs"
 * (u'(x)/v'(x)) et "dND" (N'(x)/D'(x)), un seul bouton "Valider" commun aux 2 champs (même patron
 * que `EtapeFacteursC.tsx`, `6gen6`). `App6gen7.tsx` doit le rendre avec `key={phase}`. `etatActuel`
 * reste toujours `null` ici — "cFacteurs"/"dND" sont le 2e écran, immédiatement après le domaine (une
 * tâche indépendante, jamais rappelée) — la prop est acceptée pour uniformité avec les 2 autres
 * écrans génériques du même générateur. */
export function EtapeDeuxChampsDomaineDerivee({ consigneEcran, enonceLatex, etatActuel, labelA, labelB, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (a.trim() === "" || b.trim() === "") return;
    onValider({ a, b });
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
      <p className="prompt-text">{consigneEcran}</p>
      <ApercuExpressionLatex texte={a} label={labelA} />
      <ApercuExpressionLatex texte={b} label={labelB} />
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">{labelA}</label>
          <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={a} onChange={(e) => setA(e.target.value)} />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule">{labelB}</label>
          <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={b} onChange={(e) => setB(e.target.value)} />
        </div>
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={a.trim() === "" || b.trim() === ""} onClick={valider}>
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
