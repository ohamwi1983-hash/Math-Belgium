import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import { Katex } from "../components/Katex";
import { CONSIGNE_GENERALE } from "../ui6e/formatEtudeFonctionLogarithme";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  enonceLatex: string;
  consigneEcran: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: EnsembleReelGuide) => void;
}

/** Écran "domaine" (1er écran, toutes familles A-E) — construction guidée via
 * `EnsembleReelGuideBuilder` (module partagé avec 6gen1/6gen3/6gen7/6gen11). `App6gen21.tsx` doit
 * le rendre avec `key={indexExercice}`. */
export function EtapeDomaineEtudeFonctionLog({ enonceLatex, consigneEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [reponse, setReponse] = useState<EnsembleReelGuide | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE}</p>
      <div className="equation-box">
        <Katex expression={enonceLatex} block />
      </div>
      <p className="prompt-text">{consigneEcran}</p>
      <EnsembleReelGuideBuilder onChange={setReponse} label="domf =" />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={reponse === null} onClick={() => reponse !== null && onValider(reponse)}>
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
