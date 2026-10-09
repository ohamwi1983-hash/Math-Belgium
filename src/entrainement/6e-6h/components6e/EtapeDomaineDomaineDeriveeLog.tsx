import { useState } from "react";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import { Katex } from "../components/Katex";
import type { AideAvecLatex } from "../ui6e/formatDomaineDeriveeLogarithme";
import { BoutonAide } from "./BoutonAide";
import { EnsembleReelGuideBuilder } from "./EnsembleReelGuideBuilder";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
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

/**
 * Écran GÉNÉRIQUE "domaine" (`6gen16`) — construction guidée via `EnsembleReelGuideBuilder`
 * (module partagé avec 6gen1/6gen3/6gen7), réutilisé par les 6 écrans "domaine" des familles A-F
 * (jamais la famille G, qui n'a pas d'écran de domaine). Toujours le PREMIER écran de son
 * exercice — jamais de bloc "état actuel" (rien à rappeler). `App6gen16.tsx` doit le rendre avec
 * `key={phase}`.
 */
export function EtapeDomaineDomaineDeriveeLog({ consigneGenerale, blocDonnees, consigneEcran, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [reponse, setReponse] = useState<EnsembleReelGuide | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (reponse === null) return;
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        {blocDonnees.map((frag, i) => (
          <Katex key={i} expression={frag} block />
        ))}
      </div>
      <p className="prompt-text">{consigneEcran}</p>
      <EnsembleReelGuideBuilder onChange={setReponse} label="domf =" />
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={reponse === null} onClick={valider}>
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
